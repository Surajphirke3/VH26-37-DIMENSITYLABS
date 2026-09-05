from __future__ import annotations

import json
from uuid import UUID

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
logger = get_logger("api.conversation")

_ROLE = lambda m: m.role if isinstance(m.role, str) else m.role.value  # noqa: E731


@router.get("/conversations", response_model=dict)
async def list_conversations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List recent conversations for the current user."""
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
        .limit(50)
    )
    convs = result.scalars().all()
    return {
        "success": True,
        "data": [
            {
                "id": str(c.id),
                "conversation_id": str(c.id),
                "title": c.title or "Diagnostic Session",
                "machine_id": str(c.machine_id) if c.machine_id else None,
                "created_at": str(c.created_at),
                "updated_at": str(c.updated_at),
            }
            for c in convs
        ],
    }


@router.delete("/conversations/{conversation_id}", response_model=dict)
async def delete_conversation(
    conversation_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a conversation."""
    conv = await _get_conv(db, conversation_id, current_user.id)
    await db.delete(conv)
    await db.commit()
    return {"success": True, "data": {"deleted": str(conversation_id)}}


@router.get("/conversations/{conversation_id}/messages", response_model=dict)
async def get_messages(
    conversation_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Load message history for a conversation."""
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(404, "Conversation not found")
    msgs = (await db.execute(
        select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at)
    )).scalars().all()

    formatted_messages = []
    for m in msgs:
        role = _ROLE(m)
        content = m.content
        response_data = None
        if role == "assistant":
            try:
                parsed = json.loads(content)
                if isinstance(parsed, dict) and "answer_type" in parsed:
                    response_data = parsed
                    content = parsed.get("summary", content)
            except Exception:
                pass
        formatted_messages.append({
            "id": str(m.id),
            "role": role,
            "content": content,
            "response": response_data,
            "answer_type": m.answer_type.value if m.answer_type else None,
            "confidence_level": m.confidence_level.value if m.confidence_level else None,
            "evidence_score": m.evidence_score,
            "total_latency_ms": m.total_latency_ms,
            "created_at": str(m.created_at),
        })

    return {"success": True, "data": {
        "conversation_id": str(conversation_id),
        "machine_id": str(conv.machine_id) if conv.machine_id else None,
        "title": conv.title,
        "messages": formatted_messages,
    }}


@router.post("/conversations/{conversation_id}/messages", response_model=dict)
async def send_message(
    conversation_id: UUID,
    request: QueryRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Send a message in a conversation (multi-turn RAG)."""
    from app.db.session import AsyncSessionLocal

    conv = await _get_conv(db, conversation_id, current_user.id)
    history = await _fetch_history(db, conversation_id, limit=6)
    if not conv.title:
        conv.title = request.query[:120]
        await db.flush()
    db.add(Message(conversation_id=conversation_id, role="user", content=request.query))
    machine_id = request.machine_id or conv.machine_id

    # ── Commit user message BEFORE the LLM call to release the connection ──────
    # The LLM call can take 20-60s, during which asyncpg would drop idle connections.
    await db.commit()

    # ── Run the RAG pipeline (long-running LLM call) ───────────────────────────
    # Use a fresh session so the connection pool isn't exhausted.
    async with AsyncSessionLocal() as rag_db:
        rag = await RAGPipeline(rag_db).query(
            query=request.query,
            machine_id=machine_id,
            machine_name=request.machine_name or "",
            conversation_history=history,
            model=request.model,
            image_data=request.image_data,
        )

    # ── Persist assistant message with another fresh session ───────────────────
    async with AsyncSessionLocal() as save_db:
        if machine_id and not conv.machine_id:
            result = await save_db.execute(
                select(Conversation).where(Conversation.id == conversation_id)
            )
            fresh_conv = result.scalar_one_or_none()
            if fresh_conv:
                fresh_conv.machine_id = machine_id
                await save_db.flush()
        asst = _persist_assistant(save_db, conversation_id, rag)
        save_db.add(asst)
        await save_db.commit()
        await save_db.refresh(asst)

    rag["conversation_id"] = str(conversation_id)
    rag["message_id"] = str(asst.id)
    logger.info("conversation.message_sent", conv=str(conversation_id), answer_type=rag.get("answer_type"), ms=rag.get("total_latency_ms"))
    return {"success": True, "data": rag}


@router.post("/conversations/{conversation_id}/disambiguate", response_model=dict)
async def disambiguate(
    conversation_id: UUID,
    body: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Pin machine and re-run last user query with that context."""
    machine_id = UUID(body["machine_id"])
    conv = await _get_conv(db, conversation_id, current_user.id)
    conv.machine_id = machine_id
    await db.flush()
    last = (await db.execute(
        select(Message).where(Message.conversation_id == conversation_id, Message.role == "user")
        .order_by(Message.created_at.desc()).limit(1)
    )).scalars().first()
    if not last:
        await db.commit()
        return {"success": True, "data": {"message": "Machine context updated", "machine_id": str(machine_id)}}
    history = await _fetch_history(db, conversation_id, limit=6, exclude_id=last.id)
    rag = await RAGPipeline(db).query(
        query=last.content, machine_id=machine_id,
        machine_name=body.get("machine_name", ""), conversation_history=history,
    )
    asst = _persist_assistant(db, conversation_id, rag)
    db.add(asst)
    await db.commit()
    rag["conversation_id"] = str(conversation_id)
    rag["message_id"] = str(asst.id)
    logger.info("conversation.disambiguate_completed", conv=str(conversation_id), machine_id=str(machine_id), answer_type=rag.get("answer_type"))
    return {"success": True, "data": rag}


# ── helpers ──────────────────────────────────────────────────────────────────

async def _get_conv(db: AsyncSession, conv_id: UUID, user_id: UUID) -> Conversation:
    result = await db.execute(
        select(Conversation).where(Conversation.id == conv_id, Conversation.user_id == user_id)
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(404, "Conversation not found")
    return conv


async def _fetch_history(db: AsyncSession, conv_id: UUID, limit: int = 6, exclude_id: UUID | None = None) -> list:
    q = select(Message).where(Message.conversation_id == conv_id)
    if exclude_id:
        q = q.where(Message.id != exclude_id)
    q = q.order_by(Message.created_at).limit(limit)
    rows = (await db.execute(q)).scalars().all()
    history = []
    for m in rows:
        role = _ROLE(m)
        content = m.content
        if role == "assistant":
            try:
                parsed = json.loads(content)
                if isinstance(parsed, dict) and "summary" in parsed:
                    content = parsed.get("summary", content)
            except Exception:
                pass
        history.append({"role": role, "content": content})
    return history


def _persist_assistant(db: AsyncSession, conv_id: UUID, rag: dict) -> Message:
    return Message(
        conversation_id=conv_id,
        role="assistant",
        content=json.dumps(rag) if isinstance(rag, dict) else str(rag),
        answer_type=rag.get("answer_type"),
        confidence_level=rag.get("confidence_level"),
        evidence_score=rag.get("evidence_score"),
        retrieval_latency_ms=rag.get("retrieval_latency_ms"),
        llm_latency_ms=rag.get("llm_latency_ms"),
        total_latency_ms=rag.get("total_latency_ms"),
    )
