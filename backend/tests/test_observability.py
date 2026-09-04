"""Tests for observability middleware and health endpoints."""
from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient


def test_request_id_header_injected():
    from app.main import app
    client = TestClient(app, raise_server_exceptions=False)
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    assert "x-request-id" in resp.headers


def test_request_id_echoed_when_provided():
    from app.main import app
    client = TestClient(app, raise_server_exceptions=False)
    resp = client.get("/api/v1/health", headers={"X-Request-ID": "test-123"})
    assert resp.headers.get("x-request-id") == "test-123"


def test_health_check_returns_version():
    from app.main import app
    client = TestClient(app, raise_server_exceptions=False)
    resp = client.get("/api/v1/health")
    data = resp.json()
    assert data["status"] == "ok"
    assert "version" in data


def test_readiness_check_db_failure_returns_503():
    from app.main import app
    from app.db.session import get_db

    async def _bad_db():
        db = AsyncMock()
        db.execute = AsyncMock(side_effect=Exception("DB down"))
        yield db

    app.dependency_overrides[get_db] = _bad_db
    try:
        client = TestClient(app, raise_server_exceptions=False)
        resp = client.get("/api/v1/health/ready")
        assert resp.status_code == 503
    finally:
        app.dependency_overrides.clear()
