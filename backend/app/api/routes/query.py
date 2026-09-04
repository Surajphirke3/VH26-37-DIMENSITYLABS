from __future__ import annotations

from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.logging import get_logger
from app.db.session import get_db
from app.models.conversation import Conversation, Message
from app.models.user import User
from app.schemas.query import QueryRequest
from app.services.rag.pipeline import RAGPipeline

router = APIRouter()
logger = get_logger("api.query")


@router.post("/query", response_model=dict)
async def single_query(
    request: QueryRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Stateless single-turn RAG query."""
    pipeline = RAGPipeline(db)
    result = await pipeline.query(
        query=request.query,
        machine_id=request.machine_id,
        machine_name=request.machine_name or "",
    )
    return {"success": True, "data": result}


@router.post("/conversations", response_model=dict)
async def create_conversation(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new conversation session."""
    conv = Conversation(user_id=current_user.id, session_id=str(uuid4()))
    db.add(conv)
    await db.commit()
    await db.refresh(conv)
    return {"success": True, "data": {
        "conversation_id": str(conv.id),
        "session_id": conv.session_id,
    }}


@router.post("/conversations/{conversation_id}/messages", response_model=dict)
async def send_message(
    conversation_id: UUID,
    request: QueryRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Send a message within an existing conversation (multi-turn RAG)."""
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(404, "Conversation not found")

    # Fetch last 6 messages as history (3 turns)
    msg_result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
        .limit(6)
    )
    history = [{"role": m.role, "content": m.content} for m in msg_result.scalars()]

    # Persist user message before calling LLM
    user_msg = Message(
        conversation_id=conversation_id,
        role="user",
        content=request.query,
    )
    db.add(user_msg)
    await db.flush()

    # Resolve machine: request overrides conversation context
    machine_id = request.machine_id or conv.machine_id
    pipeline = RAGPipeline(db)
    rag_result = await pipeline.query(
        query=request.query,
        machine_id=machine_id,
        machine_name=request.machine_name or "",
        conversation_history=history,
    )

    # Persist machine context on first successful resolution
    if machine_id and not conv.machine_id:
        conv.machine_id = machine_id
        await db.flush()

    assistant_msg = Message(
        conversation_id=conversation_id,
        role="assistant",
        content=rag_result.get("summary", ""),
        answer_type=rag_result.get("answer_type"),
        confidence_level=rag_result.get("confidence_level"),
        evidence_score=rag_result.get("evidence_score"),
        retrieval_latency_ms=rag_result.get("retrieval_latency_ms"),
        llm_latency_ms=rag_result.get("llm_latency_ms"),
        total_latency_ms=rag_result.get("total_latency_ms"),
    )
    db.add(assistant_msg)
    await db.commit()

    rag_result["conversation_id"] = str(conversation_id)
    rag_result["message_id"] = str(assistant_msg.id)
    return {"success": True, "data": rag_result}


@router.post("/conversations/{conversation_id}/disambiguate", response_model=dict)
async def disambiguate(
    conversation_id: UUID,
    body: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Pin a machine to the conversation after the user resolves ambiguity."""
    machine_id = UUID(body["machine_id"])
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(404, "Conversation not found")
    conv.machine_id = machine_id
    await db.commit()
    return {"success": True, "data": {
        "message": "Machine context updated",
        "machine_id": str(machine_id),
    }}
