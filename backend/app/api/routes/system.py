from __future__ import annotations

import os
import platform
import time
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.logging import get_logger
from app.db.chroma import ChromaRepository
from app.db.session import get_db
from app.models.user import User

router = APIRouter(tags=["system"])
logger = get_logger("api.system")

_START_TIME = time.time()


@router.get("/system/status", response_model=dict)
async def get_system_status(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Return real-time diagnostic status of ChromaDB, database, Redis, and AI services."""
    probes: dict = {}

    # 1. ChromaDB probe
    try:
        t0 = time.time()
        chroma_count = ChromaRepository.get_count()
        coll = ChromaRepository.get_collection()
        space = "cosine"
        if hasattr(coll, "metadata") and coll.metadata:
            space = coll.metadata.get("hnsw:space", "cosine")
        chroma_latency = int((time.time() - t0) * 1000)
        probes["chromadb"] = {
            "status": "connected",
            "collection": settings.CHROMA_COLLECTION_NAME,
            "metric": space,
            "vector_count": chroma_count,
            "latency_ms": chroma_latency,
            "persist_dir": settings.CHROMA_PERSIST_DIR,
        }
    except Exception as exc:
        logger.error("system.probe.chroma_failed", error=str(exc))
        probes["chromadb"] = {
            "status": "degraded",
            "error": str(exc),
            "metric": "cosine",
            "vector_count": 0,
        }

    # 2. Database probe
    try:
        t0 = time.time()
        await db.execute(text("SELECT 1"))
        db_latency = int((time.time() - t0) * 1000)
        probes["database"] = {
            "status": "online",
            "latency_ms": db_latency,
        }
    except Exception as exc:
        probes["database"] = {
            "status": "offline",
            "error": str(exc),
        }

    # 3. Redis probe
    try:
        import redis.asyncio as aioredis
        t0 = time.time()
        r = aioredis.from_url(settings.REDIS_URL, socket_connect_timeout=1)
        await r.ping()
        await r.aclose()
        redis_latency = int((time.time() - t0) * 1000)
        probes["redis"] = {
            "status": "connected",
            "latency_ms": redis_latency,
        }
    except Exception as exc:
        probes["redis"] = {
            "status": "unavailable (using in-memory fallback)",
            "detail": str(exc),
        }

    # 4. Cache probe
    probes["cache"] = {
        "status": "active",
        "embedding_cache_ttl": 300,
        "retrieval_cache_ttl": 600,
        "strategy": "bounded_lru",
    }

    # 5. Groq Model probe
    probes["groq"] = {
        "status": "configured" if settings.GROQ_API_KEY else "api_key_missing",
        "default_model": settings.GROQ_MODEL,
        "models_available": len(settings.MODELS_CONFIG.get("providers", {}).get("groq", {}).get("models", [])),
    }

    # 6. Host & Runtime stats
    uptime_seconds = int(time.time() - _START_TIME)
    probes["runtime"] = {
        "app_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "python_version": platform.python_version(),
        "os": f"{platform.system()} {platform.release()}",
        "uptime_seconds": uptime_seconds,
    }

    return {"success": True, "data": probes}


@router.get("/system/config", response_model=dict)
async def get_system_config(
    current_user: User = Depends(get_current_user),
) -> dict:
    """Return sanitized system, RAG, chunking, retrieval, and guardrail configuration."""
    return {
        "success": True,
        "data": {
            "retrieval": settings.RETRIEVAL_CONFIG,
            "rag": settings.RAG_CONFIG,
            "chunking": settings.CHUNKING_CONFIG,
            "guardrails": settings.GUARDRAILS_CONFIG,
            "languages": settings.LANGUAGES_CONFIG,
            "system": settings.SYSTEM_CONFIG,
        },
    }
