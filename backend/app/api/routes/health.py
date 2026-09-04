from __future__ import annotations

import time

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import get_logger
from app.db.session import get_db

router = APIRouter(tags=["health"])
logger = get_logger("api.health")


@router.get("/health")
async def health_check() -> dict:
    return {"status": "ok", "environment": settings.ENVIRONMENT, "version": "1.0.0"}


@router.get("/health/ready")
async def readiness_check(db: AsyncSession = Depends(get_db)) -> dict:
    probes: dict[str, str] = {}

    # DB probe
    try:
        t0 = time.time()
        await db.execute(text("SELECT 1"))
        probes["db"] = f"ok ({int((time.time() - t0) * 1000)}ms)"
    except Exception as exc:
        logger.error("health.db_fail", error=str(exc))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database not ready: {exc}",
        )

    # Redis probe
    try:
        import redis.asyncio as aioredis
        t0 = time.time()
        r = aioredis.from_url(settings.REDIS_URL, socket_connect_timeout=1)
        await r.ping()
        await r.aclose()
        probes["redis"] = f"ok ({int((time.time() - t0) * 1000)}ms)"
    except Exception as exc:
        probes["redis"] = f"degraded: {exc}"
        logger.warning("health.redis_degraded", error=str(exc))

    return {"status": "ready", "probes": probes}
