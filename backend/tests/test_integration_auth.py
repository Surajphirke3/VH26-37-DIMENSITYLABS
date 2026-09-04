"""Integration tests for auth endpoints — require a live PostgreSQL DB.

Run with:   pytest -m integration
Skip in CI: pytest -m "not integration"
"""
from __future__ import annotations

import os

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.conftest_integration import app_client, db_session  # noqa: F401

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _skip_if_no_db() -> None:
    if not os.environ.get("DATABASE_URL"):
        pytest.skip("no live DB — set DATABASE_URL to run integration tests")


async def _seed_admin(db: AsyncSession) -> tuple[str, str]:
    """Insert an admin user directly and return (email, password)."""
    from app.core.security import hash_password
    from app.models.user import User, UserRole

    email = "admin-inttest@mechmind.test"
    password = "AdminPass1!"
    user = User(
        email=email,
        password_hash=hash_password(password),
        full_name="Integration Admin",
        role=UserRole.admin,
        is_active=True,
    )
    db.add(user)
    await db.flush()
    return email, password


async def _get_admin_token(client: AsyncClient, email: str, password: str) -> str:
    resp = await client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

@pytest.mark.integration
async def test_register_and_login(app_client: AsyncClient, db_session: AsyncSession) -> None:
    _skip_if_no_db()

    admin_email, admin_pw = await _seed_admin(db_session)
    token = await _get_admin_token(app_client, admin_email, admin_pw)

    # Register a new technician via admin token
    resp = await app_client.post(
        "/api/v1/auth/register",
        json={
            "email": "tech1@mechmind.test",
            "password": "TechPass1!",
            "full_name": "Tech One",
            "role": "technician",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201, resp.text
    assert resp.json()["email"] == "tech1@mechmind.test"

    # Login as the new user and verify token works
    login_resp = await app_client.post(
        "/api/v1/auth/login",
        json={"email": "tech1@mechmind.test", "password": "TechPass1!"},
    )
    assert login_resp.status_code == 200
    access = login_resp.json()["access_token"]
    assert access

    me_resp = await app_client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {access}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "tech1@mechmind.test"


@pytest.mark.integration
async def test_refresh_token_flow(app_client: AsyncClient, db_session: AsyncSession) -> None:
    _skip_if_no_db()

    admin_email, admin_pw = await _seed_admin(db_session)
    login_resp = await app_client.post(
        "/api/v1/auth/login",
        json={"email": admin_email, "password": admin_pw},
    )
    assert login_resp.status_code == 200
    tokens = login_resp.json()
    original_access = tokens["access_token"]
    refresh_token = tokens["refresh_token"]

    # Exchange refresh token for a new access token
    refresh_resp = await app_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_resp.status_code == 200
    new_access = refresh_resp.json()["access_token"]
    assert new_access
    assert new_access != original_access

    # New access token must be usable
    me_resp = await app_client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {new_access}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == admin_email


@pytest.mark.integration
async def test_inactive_user_cannot_login(app_client: AsyncClient, db_session: AsyncSession) -> None:
    _skip_if_no_db()

    admin_email, admin_pw = await _seed_admin(db_session)
    token = await _get_admin_token(app_client, admin_email, admin_pw)

    # Register a user, then deactivate them directly in the DB
    await app_client.post(
        "/api/v1/auth/register",
        json={
            "email": "inactive@mechmind.test",
            "password": "InactivePass1!",
            "full_name": "Gone User",
            "role": "technician",
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    from sqlalchemy import select
    from app.models.user import User

    result = await db_session.execute(select(User).where(User.email == "inactive@mechmind.test"))
    user = result.scalar_one()
    user.is_active = False
    await db_session.flush()

    login_resp = await app_client.post(
        "/api/v1/auth/login",
        json={"email": "inactive@mechmind.test", "password": "InactivePass1!"},
    )
    assert login_resp.status_code == 403
