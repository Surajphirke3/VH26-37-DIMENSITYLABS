"""Integration-test fixtures — require a live PostgreSQL DB.

Import this module in integration test files with:
    from tests.conftest_integration import db_session, app_client  # noqa: F401

All fixtures skip automatically when DATABASE_URL env var is absent.
"""
from __future__ import annotations

import os
from collections.abc import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.db.base import Base


def _db_url() -> str | None:
    """Return async DATABASE_URL from env, or None if not configured."""
    raw = os.environ.get("DATABASE_URL", "")
    if not raw:
        return None
    # Convert postgres:// → postgresql+asyncpg://
    if raw.startswith("postgres://"):
        raw = "postgresql+asyncpg://" + raw[len("postgres://"):]
    elif raw.startswith("postgresql://") and "+asyncpg" not in raw:
        raw = raw.replace("postgresql://", "postgresql+asyncpg://", 1)
    return raw


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Async DB session with per-test rollback. Skips if no DATABASE_URL."""
    url = _db_url()
    if not url:
        pytest.skip("no live DB — set DATABASE_URL to run integration tests")

    engine = create_async_engine(url, echo=False)

    # Ensure schema exists
    async with engine.begin() as conn:
        import app.models  # noqa: F401 — register all ORM models
        await conn.run_sync(Base.metadata.create_all)

    factory = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
        autocommit=False,
    )

    async with factory() as session:
        try:
            yield session
        finally:
            await session.rollback()

    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def app_client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """HTTPX async client wired to the FastAPI app with the test DB session."""
    from app.db.session import get_db
    from app.main import app

    async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
    app.dependency_overrides.clear()
