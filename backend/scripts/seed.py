"""Seed demo users and machines for a fresh MechMind DB. Idempotent."""
from __future__ import annotations

import asyncio
import sys
import os

# Allow running from repo root: cd backend && python scripts/seed.py
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models import User, Machine
from app.models.user import UserRole
from app.core.security import hash_password

USERS = [
    {"email": "admin@mechmind.io",   "password": "Admin123!",   "role": UserRole.admin,      "full_name": "Admin User"},
    {"email": "manager@mechmind.io", "password": "Manager123!", "role": UserRole.manager,    "full_name": "Manager User"},
    {"email": "tech@mechmind.io",    "password": "Tech123!",    "role": UserRole.technician, "full_name": "Tech User"},
]

MACHINES = [
    {"name": "CNC-3000",                "manufacturer": "Haas",   "model": "VF-2",   "category": "CNC"},
    {"name": "Hydraulic Press HP-500",  "manufacturer": "Parker", "model": "HP-500", "category": "Hydraulic"},
    {"name": "Conveyor Belt CB-200",    "manufacturer": "Dorner", "model": "2200",   "category": "Conveyor"},
]


async def seed() -> None:
    async with AsyncSessionLocal() as session:
        # --- Users ---
        print("Seeding users...")
        for u in USERS:
            result = await session.execute(select(User).where(User.email == u["email"]))
            existing = result.scalar_one_or_none()
            if existing:
                print(f"  [skip] user {u['email']} already exists (id={existing.id})")
                continue
            user = User(
                email=u["email"],
                password_hash=hash_password(u["password"]),
                role=u["role"],
                full_name=u["full_name"],
                is_active=True,
            )
            session.add(user)
            await session.flush()
            print(f"  [created] user {u['email']} id={user.id}")

        # --- Machines ---
        print("Seeding machines...")
        for m in MACHINES:
            result = await session.execute(select(Machine).where(Machine.name == m["name"]))
            existing = result.scalar_one_or_none()
            if existing:
                print(f"  [skip] machine {m['name']!r} already exists (id={existing.id})")
                continue
            machine = Machine(
                name=m["name"],
                manufacturer=m["manufacturer"],
                model=m["model"],
                category=m["category"],
                is_active=True,
            )
            session.add(machine)
            await session.flush()
            print(f"  [created] machine {m['name']!r} id={machine.id}")

        await session.commit()
        print("Done.")


if __name__ == "__main__":
    asyncio.run(seed())
