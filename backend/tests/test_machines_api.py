"""Tests for /machines endpoints — no DB required."""
from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

_USER_ID = uuid4()
_MACHINE_ID = uuid4()


def _make_machine(machine_id=_MACHINE_ID, name="CNC-3000"):
    m = MagicMock()
    m.id = machine_id
    m.name = name
    m.model = "ModelX"
    m.manufacturer = "Acme"
    m.category = "CNC"
    m.description = None
    m.is_active = True
    return m


def _make_app(machine=None, machines=None):
    from app.main import app
    from app.api.deps import get_current_user, get_db

    fake_user = MagicMock()
    fake_user.id = _USER_ID
    fake_user.role = "admin"

    async def _fake_user():
        return fake_user

    async def _fake_db():
        db = AsyncMock()
        result = MagicMock()
        if machines is not None:
            result.scalars.return_value.all.return_value = machines
        if machine is not None:
            result.scalar_one_or_none.return_value = machine
        db.execute = AsyncMock(return_value=result)
        db.commit = AsyncMock()
        db.refresh = AsyncMock()
        db.add = MagicMock()
        yield db

    app.dependency_overrides[get_current_user] = _fake_user
    app.dependency_overrides[get_db] = _fake_db
    return app


def test_list_machines_returns_items():
    m1 = _make_machine()
    app = _make_app(machines=[m1])
    try:
        client = TestClient(app)
        resp = client.get("/api/v1/machines")
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert len(data["data"]["items"]) == 1
        assert data["data"]["items"][0]["name"] == "CNC-3000"
    finally:
        app.dependency_overrides.clear()


def test_create_machine_persists():
    app = _make_app()
    created = _make_machine(machine_id=uuid4(), name="NewBot")

    from app.main import app as real_app
    from app.api.deps import get_current_user, get_db

    fake_user = MagicMock()
    fake_user.id = _USER_ID
    fake_user.role = "admin"

    async def _fake_user():
        return fake_user

    async def _fake_db():
        db = AsyncMock()
        db.commit = AsyncMock()
        async def _refresh(obj):
            obj.id = created.id
            obj.name = created.name
        db.refresh = _refresh
        db.add = MagicMock()
        yield db

    real_app.dependency_overrides[get_current_user] = _fake_user
    real_app.dependency_overrides[get_db] = _fake_db
    try:
        client = TestClient(real_app)
        resp = client.post("/api/v1/machines", json={"name": "NewBot"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["data"]["name"] == "NewBot"
    finally:
        real_app.dependency_overrides.clear()


def test_deactivate_machine_soft_deletes():
    m = _make_machine()

    from app.main import app
    from app.api.deps import get_current_user, get_db

    fake_user = MagicMock()
    fake_user.id = _USER_ID
    fake_user.role = "admin"

    async def _fake_user():
        return fake_user

    async def _fake_db():
        db = AsyncMock()
        result = MagicMock()
        result.scalar_one_or_none.return_value = m
        db.execute = AsyncMock(return_value=result)
        db.commit = AsyncMock()
        yield db

    app.dependency_overrides[get_current_user] = _fake_user
    app.dependency_overrides[get_db] = _fake_db
    try:
        client = TestClient(app)
        resp = client.delete(f"/api/v1/machines/{_MACHINE_ID}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["data"]["is_active"] is False
        assert m.is_active is False
    finally:
        app.dependency_overrides.clear()


def test_deactivate_machine_404_on_missing():
    from app.main import app
    from app.api.deps import get_current_user, get_db

    fake_user = MagicMock()
    fake_user.id = _USER_ID
    fake_user.role = "admin"

    async def _fake_user():
        return fake_user

    async def _fake_db():
        db = AsyncMock()
        result = MagicMock()
        result.scalar_one_or_none.return_value = None
        db.execute = AsyncMock(return_value=result)
        yield db

    app.dependency_overrides[get_current_user] = _fake_user
    app.dependency_overrides[get_db] = _fake_db
    try:
        client = TestClient(app)
        resp = client.delete(f"/api/v1/machines/{uuid4()}")
        assert resp.status_code == 404
    finally:
        app.dependency_overrides.clear()
