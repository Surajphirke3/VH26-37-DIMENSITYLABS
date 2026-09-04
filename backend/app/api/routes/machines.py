from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_manager_or_admin
from app.db.session import get_db
from app.models.machine import Machine
from app.models.user import User
from app.schemas.machine import MachineCreate

router = APIRouter()


@router.get("/machines", response_model=dict)
async def list_machines(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all active machines ordered by name."""
    result = await db.execute(
        select(Machine).where(Machine.is_active == True).order_by(Machine.name)
    )
    machines = result.scalars().all()
    return {"success": True, "data": {"items": [
        {
            "id": str(m.id),
            "name": m.name,
            "model": m.model,
            "manufacturer": m.manufacturer,
            "category": m.category,
            "description": m.description,
        }
        for m in machines
    ]}}


@router.post("/machines", response_model=dict)
async def create_machine(
    body: MachineCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Create a new machine entry. Requires manager or admin role."""
    machine = Machine(**body.model_dump())
    db.add(machine)
    await db.commit()
    await db.refresh(machine)
    return {"success": True, "data": {"id": str(machine.id), "name": machine.name}}


@router.get("/machines/{machine_id}", response_model=dict)
async def get_machine(
    machine_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch a single machine by ID."""
    result = await db.execute(select(Machine).where(Machine.id == machine_id))
    machine = result.scalar_one_or_none()
    if not machine:
        raise HTTPException(404, "Machine not found")
    return {"success": True, "data": {
        "id": str(machine.id),
        "name": machine.name,
        "model": machine.model,
        "manufacturer": machine.manufacturer,
        "category": machine.category,
        "description": machine.description,
        "is_active": machine.is_active,
    }}


@router.delete("/machines/{machine_id}", response_model=dict)
async def deactivate_machine(
    machine_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Soft-delete a machine by marking it inactive."""
    result = await db.execute(select(Machine).where(Machine.id == machine_id))
    machine = result.scalar_one_or_none()
    if not machine:
        raise HTTPException(404, "Machine not found")
    machine.is_active = False
    await db.commit()
    return {"success": True, "data": {"id": str(machine_id), "is_active": False}}
