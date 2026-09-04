from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.manual import ManualType, ProcessingStatus


class ManualResponse(BaseModel):
    id: uuid.UUID
    machine_id: uuid.UUID
    title: str
    manual_type: ManualType
    version: Optional[str]
    language: str
    original_filename: str
    file_size_bytes: Optional[int]
    page_count: Optional[int]
    processing_status: ProcessingStatus
    processing_error: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class ManualUploadResponse(BaseModel):
    manual_id: uuid.UUID
    ingestion_job_id: uuid.UUID
    status: str


class ManualStatusResponse(BaseModel):
    manual_id: uuid.UUID
    processing_status: ProcessingStatus
    progress_pct: int
    pages_processed: Optional[int]
    chunks_created: Optional[int]
    error_message: Optional[str]

    model_config = {"from_attributes": True}
