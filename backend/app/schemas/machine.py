from __future__ import annotations

import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class MachineCreate(BaseModel):
    name: str
    model: Optional[str] = None
    manufacturer: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None


class MachineUpdate(BaseModel):
    name: Optional[str] = None
    model: Optional[str] = None
    manufacturer: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class MachineResponse(BaseModel):
    id: uuid.UUID
    name: str
    model: Optional[str]
    manufacturer: Optional[str]
    category: Optional[str]
    description: Optional[str]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class MachineListResponse(BaseModel):
    items: List[MachineResponse]
    total: int
