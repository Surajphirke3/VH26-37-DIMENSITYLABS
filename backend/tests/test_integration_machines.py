"""Integration tests for machines endpoints — require a live PostgreSQL DB.

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


async def _seed_admin_token(client: AsyncClient, db: AsyncSession) -> str:
    """Create an admin user in the DB and return a valid access token."""
    from app.core.security import create_access_token, hash_password
    from app.models.user import User, UserRole

    user = User(
        email="machines-admin@mechmind.test",
        password_hash=hash_password("AdminPass1!"),
        full_name="Machines Admin",
        role=UserRole.admin,
        is_active=True,
    )
    db.add(user)
    await db.flush()
    return create_access_token(subject=str(user.id))


_MACHINE_PAYLOAD = {
    "name": "Lathe X200",
    "model": "X200",
    "manufacturer": "Acme Corp",
    "category": "lathe",
    "description": "Integration test lathe",
}

# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

@pytest.mark.integration
async def test_create_and_list_machine(app_client: AsyncClient, db_session: AsyncSession) -> None:
    _skip_if_no_db()

    token = await _seed_admin_token(app_client, db_session)
    headers = {"Authorization": f"Bearer {token}"}

    # Create machine
    create_resp = await app_client.post("/api/v1/machines", json=_MACHINE_PAYLOAD, headers=headers)
    assert create_resp.status_code == 200, create_resp.text
    data = create_resp.json()
    assert data["success"] is True
    machine_id = data["data"]["id"]
    assert machine_id

    # Verify it appears in the list
    list_resp = await app_client.get("/api/v1/machines", headers=headers)
    assert list_resp.status_code == 200
    items = list_resp.json()["data"]["items"]
    ids = [m["id"] for m in items]
    assert machine_id in ids


@pytest.mark.integration
async def test_deactivate_machine_hides_from_list(
    app_client: AsyncClient,
    db_session: AsyncSession,
) -> None:
    _skip_if_no_db()

    token = await _seed_admin_token(app_client, db_session)
    headers = {"Authorization": f"Bearer {token}"}

    # Use a distinct name to avoid unique-constraint conflicts
    payload = {**_MACHINE_PAYLOAD, "name": "Lathe X201", "model": "X201"}
    create_resp = await app_client.post("/api/v1/machines", json=payload, headers=headers)
    assert create_resp.status_code == 200, create_resp.text
    machine_id = create_resp.json()["data"]["id"]

    # Deactivate via DELETE (soft delete)
    del_resp = await app_client.delete(f"/api/v1/machines/{machine_id}", headers=headers)
    assert del_resp.status_code == 200
    assert del_resp.json()["data"]["is_active"] is False

    # Must no longer appear in active listing
    list_resp = await app_client.get("/api/v1/machines", headers=headers)
    assert list_resp.status_code == 200
    ids = [m["id"] for m in list_resp.json()["data"]["items"]]
    assert machine_id not in ids
