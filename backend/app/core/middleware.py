from __future__ import annotations

import time
import uuid

import structlog
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = structlog.get_logger("http.access")

_SKIP_PATHS = {"/api/v1/health", "/api/docs", "/api/redoc", "/api/openapi.json"}


class ObservabilityMiddleware(BaseHTTPMiddleware):
    """Inject request_id into structlog context; emit access log on each response."""

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(request_id=request_id)

        t0 = time.time()
        response = await call_next(request)
        latency_ms = int((time.time() - t0) * 1000)

        response.headers["X-Request-ID"] = request_id

        if request.url.path not in _SKIP_PATHS:
            logger.info(
                "http.request",
                method=request.method,
                path=request.url.path,
                status=response.status_code,
                latency_ms=latency_ms,
            )

        return response
