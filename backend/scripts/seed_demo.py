"""Demo data seeder.

Run with:
    python scripts/seed_demo.py

Creates admin + technician users, and three demo machines.
Skips silently if admin already exists.
"""
from __future__ import annotations

import asyncio
import sys
import os

# Allow running from project root or scripts/ directory
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.core.config import settings
from app.models import User, Machine
from app.models.user import UserRole

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


DEMO_USERS = [
    {
        "email": "admin@mechind.com",
        "password": "Admin@123",
        "role": UserRole.admin,
        "full_name": "MechMind Admin",
    },
    {
        "email": "tech@mechind.com",
        "password": "Tech@123",
        "role": UserRole.technician,
        "full_name": "Demo Technician",
    },
]

DEMO_MACHINES = [
    {
        "name": "Haas VF-2 CNC Mill",
        "model": "VF-2",
        "manufacturer": "Haas",
        "category": "CNC Milling",
        "description": "Haas VF-2 vertical machining centre, 762mm x 406mm x 508mm work envelope.",
    },
    {
        "name": "Fanuc 0i-MF Controller",
        "model": "0i-MF",
        "manufacturer": "Fanuc",
        "category": "CNC Controller",
        "description": "Fanuc Series 0i-MF CNC controller for milling machines.",
    },
    {
        "name": "KUKA KR6 Industrial Robot",
        "model": "KR6",
        "manufacturer": "KUKA",
        "category": "Industrial Robot",
        "description": "KUKA KR 6 R900 sixx small robot, 6 kg payload, 901.5 mm reach.",
    },
]


async def seed(session: AsyncSession) -> None:
    # Guard: skip if admin already exists
    result = await session.execute(
        select(User).where(User.email == "admin@mechind.com")
    )
    if result.scalar_one_or_none() is not None:
        print("Admin user already exists — skipping seed.")
        return

    print("Creating demo users...")
    for u in DEMO_USERS:
        user = User(
            email=u["email"],
            password_hash=pwd_context.hash(u["password"]),
            role=u["role"],
            full_name=u["full_name"],
            is_active=True,
        )
        session.add(user)
        print(f"  + {u['email']}  ({u['role'].value})")

    print("Creating demo machines...")
    for m in DEMO_MACHINES:
        machine = Machine(
            name=m["name"],
            model=m["model"],
            manufacturer=m["manufacturer"],
            category=m["category"],
            description=m["description"],
            is_active=True,
        )
        session.add(machine)
        print(f"  + {m['name']}")

    await session.commit()
    print("\nSeed complete.")
    print("\nNext step: upload demo PDFs via the admin UI at http://localhost:3000")
    print("  or run:  python scripts/create_demo_pdfs.py")
    print("  then upload the generated files from backend/demo_manuals/")


async def main() -> None:
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    async with async_session() as session:
        await seed(session)

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
