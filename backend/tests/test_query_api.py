"""Tests for /query and /conversations endpoints — no DB, no LLM."""
from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

_USER_ID = uuid4()
_CONV_ID = uuid4()
_MACHINE_ID = uuid4()

_RAG_SOLUTION = {
    "answer_type": "solution",
    "summary": "Replace the coolant pump.",
    "error_meaning": "Coolant pressure below threshold.",
    "probable_causes": ["Pump failure"],
    "corrective_steps": [],
    "citations": [],
    "confidence_level": "HIGH",
    "evidence_score": 0.82,
    "notes": None,
    "follow_up_suggestions": [],
    "disambiguation_options": None,
    "retrieval_latency_ms": 45,
    "total_latency_ms": 320,
}

_RAG_DISAMBIGUATION = {
    "answer_type": "disambiguation_required",
    "summary": "Multiple machines have E101.",
    "error_meaning": None,
    "probable_causes": [],
    "corrective_steps": [],
    "citations": [],
    "confidence_level": None,
    "notes": None,
    "follow_up_suggestions": [],
    "disambiguation_options": [
        {"machine_id": str(_MACHINE_ID), "machine_name": "Haas VF-2", "snippet": "E101..."}
    ],
    "retrieval_latency_ms": 30,
    "total_latency_ms": 31,
}


def _make_user():
    user = MagicMock()
    user.id = _USER_ID
    user.email = "tech@mechind.com"
    user.role = "technician"
    user.is_active = True
    return user


def _get_app_with_overrides(user=None, pipeline_result=None):
    """Create app with dependency overrides for auth and DB."""
    from app.main import create_app
    from app.api.deps import get_current_user, get_db

    app = create_app()
    _user = user or _make_user()

    async def override_user():
        return _user

    async def override_db():
        yield AsyncMock()

    app.dependency_overrides[get_current_user] = override_user
    app.dependency_overrides[get_db] = override_db
    return app


# ── POST /api/v1/query ────────────────────────────────────────────────────────

def test_single_query_returns_solution():
    from unittest.mock import patch

    app = _get_app_with_overrides()

    with patch("app.api.routes.query.RAGPipeline") as MockPipeline:
        instance = AsyncMock()
        instance.query = AsyncMock(return_value=_RAG_SOLUTION)
        MockPipeline.return_value = instance

        client = TestClient(app, raise_server_exceptions=True)
        resp = client.post("/api/v1/query", json={"query": "What does E101 mean?"})

    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert body["data"]["answer_type"] == "solution"
    assert body["data"]["confidence_level"] == "HIGH"


def test_single_query_disambiguation():
    from unittest.mock import patch

    app = _get_app_with_overrides()

    with patch("app.api.routes.query.RAGPipeline") as MockPipeline:
        instance = AsyncMock()
        instance.query = AsyncMock(return_value=_RAG_DISAMBIGUATION)
        MockPipeline.return_value = instance

        client = TestClient(app)
        resp = client.post("/api/v1/query", json={"query": "E101 alarm"})

    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["answer_type"] == "disambiguation_required"
    assert len(data["disambiguation_options"]) == 1


def test_query_requires_auth():
    """No auth override → real auth runs → 401."""
    from app.main import create_app
    app = create_app()
    client = TestClient(app, raise_server_exceptions=False)
    resp = client.post("/api/v1/query", json={"query": "E101"})
    assert resp.status_code == 401


def test_create_conversation():
    from unittest.mock import patch

    app = _get_app_with_overrides()

    mock_conv_id = uuid4()
    mock_session_id = "sess-abc123"

    async def fake_refresh(obj):
        obj.id = mock_conv_id
        obj.session_id = mock_session_id

    # Override the DB to capture add/commit/refresh calls
    from app.api.deps import get_db

    async def override_db_with_refresh():
        db = AsyncMock()
        db.refresh.side_effect = fake_refresh
        yield db

    app.dependency_overrides[get_db] = override_db_with_refresh

    client = TestClient(app, raise_server_exceptions=True)
    resp = client.post("/api/v1/conversations")

    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert "conversation_id" in body["data"]
    assert "session_id" in body["data"]


def test_query_rejects_empty_string():
    """query='' should fail pydantic validation (min_length=1)."""
    app = _get_app_with_overrides()
    client = TestClient(app, raise_server_exceptions=False)
    resp = client.post("/api/v1/query", json={"query": ""})
    assert resp.status_code == 422
