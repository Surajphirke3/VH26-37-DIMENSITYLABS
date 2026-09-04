"""Security hardening tests — no real Redis or DB required."""
from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest


# ── 1. Input validation: query max_length ────────────────────────────────────

def test_query_max_length_validation():
    """POST /api/v1/query with query > 2000 chars should return 422."""
    from unittest.mock import AsyncMock
    from app.main import create_app
    from app.api.deps import get_current_user, get_db
    from fastapi.testclient import TestClient

    app = create_app()

    user = MagicMock()
    user.id = "00000000-0000-0000-0000-000000000001"
    user.is_active = True
    user.role = "technician"

    async def override_user():
        return user

    async def override_db():
        yield AsyncMock()

    app.dependency_overrides[get_current_user] = override_user
    app.dependency_overrides[get_db] = override_db

    client = TestClient(app, raise_server_exceptions=False)
    long_query = "x" * 2001
    resp = client.post("/api/v1/query", json={"query": long_query})
    assert resp.status_code == 422


# ── 2. blacklist_token stores key in Redis ───────────────────────────────────

@pytest.mark.asyncio
async def test_blacklist_token_sets_redis_key():
    """blacklist_token should call SETEX with the correct key and TTL."""
    mock_client = AsyncMock()
    mock_client.setex = AsyncMock()
    mock_client.aclose = AsyncMock()

    with patch("redis.asyncio.from_url", return_value=mock_client):
        from app.core.security import blacklist_token
        await blacklist_token("test-jti-123", ttl_seconds=1800)

    mock_client.setex.assert_called_once_with("blacklist:test-jti-123", 1800, "1")


# ── 3. is_token_blacklisted returns True when Redis exists returns 1 ──────────

@pytest.mark.asyncio
async def test_is_token_blacklisted_true():
    """is_token_blacklisted should return True when Redis exists returns 1."""
    mock_client = AsyncMock()
    mock_client.exists = AsyncMock(return_value=1)
    mock_client.aclose = AsyncMock()

    with patch("redis.asyncio.from_url", return_value=mock_client):
        from app.core.security import is_token_blacklisted
        result = await is_token_blacklisted("revoked-jti")

    assert result is True
    mock_client.exists.assert_called_once_with("blacklist:revoked-jti")


# ── 4. create_access_token payload contains jti ──────────────────────────────

def test_access_token_has_jti():
    """Tokens created by create_access_token must include a jti claim."""
    from app.core.security import create_access_token, decode_token

    token = create_access_token(subject="user-abc")
    payload = decode_token(token)

    assert "jti" in payload
    assert isinstance(payload["jti"], str)
    assert len(payload["jti"]) > 0
