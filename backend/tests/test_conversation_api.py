"""Tests for /conversations/* multi-turn endpoints."""
from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

_USER_ID = uuid4()
_CONV_ID = uuid4()
_MACHINE_ID = uuid4()
_MSG_ID = uuid4()

_RAG_SOLUTION = {
    "answer_type": "solution", "summary": "Replace pump.",
    "error_meaning": "Low pressure.", "probable_causes": ["Pump failure"],
    "corrective_steps": [], "citations": [], "confidence_level": "HIGH",
    "evidence_score": 0.8, "notes": None, "follow_up_suggestions": [],
    "disambiguation_options": None, "retrieval_latency_ms": 30, "total_latency_ms": 200,
}


def _make_user():
    u = MagicMock()
    u.id = _USER_ID
    u.email = "tech@mechind.com"
    u.role = "technician"
    u.is_active = True
    return u


def _make_conv(machine_id=None, title=None):
    c = MagicMock()
    c.id = _CONV_ID
    c.user_id = _USER_ID
    c.machine_id = machine_id
    c.title = title
    c.session_id = "sess-xyz"
    return c


def _make_msg(role="user", content="E101 alarm"):
    m = MagicMock()
    m.id = _MSG_ID
    m.role = role
    m.content = content
    m.answer_type = None
    m.confidence_level = None
    m.evidence_score = None
    m.total_latency_ms = None
    m.created_at = "2025-01-01 00:00:00"
    return m


def _get_app(pipeline_result=None):
    from app.main import create_app
    from app.api.deps import get_current_user, get_db
    app = create_app()

    async def _user():
        return _make_user()

    async def _db():
        yield AsyncMock()

    app.dependency_overrides[get_current_user] = _user
    app.dependency_overrides[get_db] = _db
    return app


# ── GET /conversations/{id}/messages ─────────────────────────────────────────

def test_get_messages_returns_history():
    app = _get_app()
    conv = _make_conv()
    msg = _make_msg()

    from app.api.deps import get_db

    async def _db_with_conv():
        db = AsyncMock()
        scalar = MagicMock()
        scalar.scalar_one_or_none.return_value = conv
        scalars_result = MagicMock()
        scalars_result.scalars.return_value.all.return_value = [msg]
        db.execute = AsyncMock(side_effect=[scalar, scalars_result])
        yield db

    app.dependency_overrides[get_db] = _db_with_conv
    client = TestClient(app)
    resp = client.get(f"/api/v1/conversations/{_CONV_ID}/messages")
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert "messages" in body["data"]


def test_get_messages_404_on_missing_conv():
    app = _get_app()

    from app.api.deps import get_db

    async def _db_no_conv():
        db = AsyncMock()
        scalar = MagicMock()
        scalar.scalar_one_or_none.return_value = None
        db.execute = AsyncMock(return_value=scalar)
        yield db

    app.dependency_overrides[get_db] = _db_no_conv
    client = TestClient(app, raise_server_exceptions=False)
    resp = client.get(f"/api/v1/conversations/{_CONV_ID}/messages")
    assert resp.status_code == 404


# ── POST /conversations/{id}/messages ────────────────────────────────────────

def test_send_message_calls_rag():
    app = _get_app()
    conv = _make_conv(machine_id=_MACHINE_ID)

    with patch("app.api.routes.conversation.RAGPipeline") as MockPipeline:
        instance = AsyncMock()
        instance.query = AsyncMock(return_value=_RAG_SOLUTION)
        MockPipeline.return_value = instance

        from app.api.deps import get_db

        async def _db_with_conv():
            db = AsyncMock()
            first_ex = MagicMock()
            first_ex.scalar_one_or_none.return_value = conv
            history_ex = MagicMock()
            history_ex.scalars.return_value.all.return_value = []
            msg_mock = MagicMock()
            msg_mock.id = _MSG_ID
            async def fake_refresh(obj):
                obj.id = _MSG_ID
            db.refresh.side_effect = fake_refresh
            db.execute = AsyncMock(side_effect=[first_ex, history_ex])
            yield db

        app.dependency_overrides[get_db] = _db_with_conv
        client = TestClient(app, raise_server_exceptions=True)
        resp = client.post(
            f"/api/v1/conversations/{_CONV_ID}/messages",
            json={"query": "E101 alarm"},
        )

    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["answer_type"] == "solution"


# ── POST /conversations/{id}/disambiguate ────────────────────────────────────

def test_disambiguate_reruns_rag_with_machine():
    app = _get_app()
    conv = _make_conv()
    last_user_msg = _make_msg(role="user", content="E101 error")

    with patch("app.api.routes.conversation.RAGPipeline") as MockPipeline:
        instance = AsyncMock()
        instance.query = AsyncMock(return_value=_RAG_SOLUTION)
        MockPipeline.return_value = instance

        from app.api.deps import get_db

        async def _db_for_disambiguate():
            db = AsyncMock()
            conv_ex = MagicMock()
            conv_ex.scalar_one_or_none.return_value = conv
            user_msg_ex = MagicMock()
            user_msg_ex.scalars.return_value.first.return_value = last_user_msg
            hist_ex = MagicMock()
            hist_ex.scalars.return_value.all.return_value = []
            db.execute = AsyncMock(side_effect=[conv_ex, user_msg_ex, hist_ex])
            yield db

        app.dependency_overrides[get_db] = _db_for_disambiguate
        client = TestClient(app, raise_server_exceptions=True)
        resp = client.post(
            f"/api/v1/conversations/{_CONV_ID}/disambiguate",
            json={"machine_id": str(_MACHINE_ID)},
        )

    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["answer_type"] == "solution"
    instance.query.assert_called_once()
    call_kwargs = instance.query.call_args
    assert call_kwargs.kwargs.get("machine_id") == _MACHINE_ID or \
           call_kwargs.args[1] == _MACHINE_ID
