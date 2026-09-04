"""Unit tests for security utilities — no DB required."""
from __future__ import annotations

import pytest

from app.core.security import hash_password, verify_password, create_access_token, decode_token


def test_hash_and_verify() -> None:
    hashed = hash_password("MyP@ssw0rd!")
    assert hashed != "MyP@ssw0rd!"
    assert verify_password("MyP@ssw0rd!", hashed)


def test_wrong_password_fails() -> None:
    hashed = hash_password("correct-horse")
    assert not verify_password("wrong-battery", hashed)


def test_access_token_round_trip() -> None:
    token = create_access_token(subject="user-123")
    payload = decode_token(token)
    assert payload["sub"] == "user-123"
    assert payload["type"] == "access"


def test_expired_token_raises() -> None:
    from datetime import timedelta
    from fastapi import HTTPException
    token = create_access_token(subject="user-x", expires_delta=timedelta(seconds=-1))
    with pytest.raises(HTTPException) as exc_info:
        decode_token(token)
    assert exc_info.value.status_code == 401
