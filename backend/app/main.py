from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Any, AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("mend_x.main")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info("MEND - X starting", environment=settings.ENVIRONMENT)

    if settings.ENVIRONMENT == "development":
        from app.db.base import Base
        from app.db.session import engine
        import app.models  # noqa: F401 — ensure all models are registered

        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables ensured (dev mode)")

    yield

    logger.info("MEND - X shutting down")


def create_app() -> FastAPI:
    app = FastAPI(
        title="MEND - X",
        description="From Failure to Function — Industrial RAG & Intelligent Machine Troubleshooting System",
        version="1.1.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    from app.core.middleware import ObservabilityMiddleware
    app.add_middleware(ObservabilityMiddleware)

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.error("Unhandled exception", path=str(request.url), error=str(exc), exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"success": False, "error": "Internal server error", "detail": None},
        )

    from fastapi import HTTPException

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "error": exc.detail, "detail": None},
            headers=getattr(exc, "headers", None),
        )

    _register_routers(app)
    return app


def _register_routers(app: FastAPI) -> None:
    from app.api.routes.health import router as health_router
    from app.api.routes.auth import router as auth_router
    from app.api.routes.machines import router as machines_router
    from app.api.routes.manuals import router as manuals_router
    from app.api.routes.query import router as query_router
    from app.api.routes.conversation import router as conversation_router

    app.include_router(health_router, prefix="/api/v1")
    app.include_router(auth_router, prefix="/api/v1")
    app.include_router(machines_router, prefix="/api/v1")
    app.include_router(manuals_router, prefix="/api/v1")
    app.include_router(query_router, prefix="/api/v1")
    app.include_router(conversation_router, prefix="/api/v1")


app = create_app()
