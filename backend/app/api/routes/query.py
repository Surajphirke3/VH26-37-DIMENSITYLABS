from __future__ import annotations

from uuid import UUID, uuid4

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.logging import get_logger
from app.db.session import get_db
from app.models.conversation import Conversation
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
    logger.info(
        "query.single_turn",
        answer_type=result.get("answer_type"),
        latency_ms=result.get("total_latency_ms"),
        user_id=str(current_user.id),
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
