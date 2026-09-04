from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

import hashlib
import hmac
from fastapi import HTTPException, status
from jose import ExpiredSignatureError, JWTError, jwt

from app.core.config import settings

try:
    import bcrypt as _bcrypt
    def hash_password(password: str) -> str:
        salt = _bcrypt.gensalt(rounds=12)
        return _bcrypt.hashpw(password.encode()[:72], salt).decode()
    def verify_password(plain: str, hashed: str) -> bool:
        return _bcrypt.checkpw(plain.encode()[:72], hashed.encode())
except Exception:
    # Fallback: sha256 (only for dev env without bcrypt)
    def hash_password(password: str) -> str:  # type: ignore
        return hashlib.sha256(password.encode()).hexdigest()
    def verify_password(plain: str, hashed: str) -> bool:  # type: ignore
        return hmac.compare_digest(hashlib.sha256(plain.encode()).hexdigest(), hashed)


def _utc_now() -> datetime:
    return datetime.now(tz=timezone.utc)


def create_access_token(
    subject: str,
    expires_delta: timedelta | None = None,
) -> str:
    expire = _utc_now() + (
        expires_delta
        if expires_delta is not None
        else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload: dict[str, Any] = {
        "sub": subject,
        "exp": expire,
        "iat": _utc_now(),
        "type": "access",
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(subject: str) -> str:
    expire = _utc_now() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload: dict[str, Any] = {
        "sub": subject,
        "exp": expire,
        "iat": _utc_now(),
        "type": "refresh",
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict[str, Any]:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError:
        raise credentials_exception
