from __future__ import annotations

from uuid import UUID, uuid4

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.logging import get_logger
from app.db.chroma import ChromaRepository
from app.db.session import get_db
from app.models.conversation import Conversation
from app.models.user import User
from app.schemas.query import QueryRequest
from app.services.ingestion.embedder import EmbeddingService
from app.services.rag.pipeline import RAGPipeline

router = APIRouter()
logger = get_logger("api.query")


@router.post("/query", response_model=dict)
async def single_query(
    request: QueryRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Stateless single-turn RAG query with model routing and multimodal support."""
    pipeline = RAGPipeline(db)
    result = await pipeline.query(
        query=request.query,
        machine_id=request.machine_id,
        machine_name=request.machine_name or "",
        model=request.model,
        image_data=request.image_data,
    )
    logger.info(
        "query.single_turn",
        answer_type=result.get("answer_type"),
        model=result.get("model_used"),
        latency_ms=result.get("total_latency_ms"),
        user_id=str(current_user.id),
    )
    return {"success": True, "data": result}


@router.get("/search", response_model=dict)
async def semantic_search(
    query: str,
    machine_id: UUID | None = None,
    top_k: int = 10,
    min_similarity: float = 0.0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Direct semantic cosine similarity search across indexed manuals."""
    if not query or not query.strip():
        return {"success": True, "data": {"items": [], "total": 0, "query": ""}}

    embedder = EmbeddingService()
    query_embedding = await embedder.embed_query(query.strip())

    results = ChromaRepository.similarity_search(
        query_embedding=query_embedding,
        top_k=min(50, max(1, top_k)),
        machine_id=machine_id,
    )

    items = []
    ids = results.get("ids", [[]])[0] if results.get("ids") else []
    distances = results.get("distances", [[]])[0] if results.get("distances") else []
    metadatas = results.get("metadatas", [[]])[0] if results.get("metadatas") else []

    for chunk_id, dist, meta in zip(ids, distances, metadatas):
        similarity = max(0.0, round(1.0 - float(dist), 4))
        if similarity < min_similarity:
            continue

        items.append({
            "chunk_id": chunk_id,
            "manual_id": meta.get("manual_id"),
            "manual_title": meta.get("manual_name") or meta.get("manual_title") or "Technical Manual",
            "machine_id": meta.get("machine_id"),
            "machine_name": meta.get("machine_name") or "Industrial Machine",
            "page_start": meta.get("page_start", 1),
            "page_end": meta.get("page_end", 1),
            "section_path": meta.get("section_path"),
            "similarity_score": similarity,
            "excerpt": meta.get("content_preview") or meta.get("section_path") or "Content excerpt",
        })

    return {"success": True, "data": {"query": query, "total": len(items), "items": items}}


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
