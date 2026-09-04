from __future__ import annotations

import asyncio
import hashlib
import os
from uuid import UUID, uuid4

import aiofiles
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_manager_or_admin
from app.core.config import settings
from app.core.logging import get_logger
from app.db.session import get_db
from app.models.ingestion_job import IngestionJob
from app.models.manual import Manual
from app.models.user import User

router = APIRouter()
logger = get_logger("api.manuals")

_PDF_MAGIC = b"%PDF"


@router.post("/manuals/upload", response_model=dict)
async def upload_manual(
    request: Request,
    file: UploadFile = File(...),
    machine_id: UUID = Form(...),
    title: str = Form(...),
    manual_type: str = Form("service"),
    version: str = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Upload a PDF manual, persist metadata, and kick off async ingestion."""
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    cl_header = request.headers.get("content-length")
    if cl_header and int(cl_header) > max_bytes:
        raise HTTPException(status_code=413, detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB} MB limit")
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are accepted")

    content = await file.read()
    if len(content) > max_bytes:
        raise HTTPException(400, f"File exceeds {settings.MAX_UPLOAD_SIZE_MB} MB limit")
    if not content.startswith(_PDF_MAGIC):
        raise HTTPException(400, "Invalid PDF file (magic bytes check failed)")

    file_hash = hashlib.sha256(content).hexdigest()
    dup = await db.execute(select(Manual).where(Manual.file_hash == file_hash))
    if dup.scalar_one_or_none():
        raise HTTPException(409, "This file has already been uploaded (duplicate detected)")

    # Persist to disk
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_id = uuid4()
    file_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}.pdf")
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    manual = Manual(
        machine_id=machine_id,
        title=title,
        manual_type=manual_type,
        version=version,
        original_filename=file.filename,
        file_path=file_path,
        file_size_bytes=len(content),
        file_hash=file_hash,
        created_by=current_user.id,
    )
    db.add(manual)
    await db.flush()

    job = IngestionJob(manual_id=manual.id)
    db.add(job)
    await db.commit()
    await db.refresh(manual)
    await db.refresh(job)

    # Fire-and-forget background ingestion using a fresh DB session
    async def _run_ingestion(manual_id: UUID, job_id: UUID) -> None:
        from app.db.session import AsyncSessionLocal
        from app.services.ingestion.pipeline import IngestionPipeline
        async with AsyncSessionLocal() as bg_db:
            pipeline = IngestionPipeline(bg_db)
            await pipeline.run(manual_id, job_id)

    asyncio.create_task(_run_ingestion(manual.id, job.id))
    logger.info("manual.upload", manual_id=str(manual.id), filename=file.filename)

    return {"success": True, "data": {
        "manual_id": str(manual.id),
        "ingestion_job_id": str(job.id),
        "status": "queued",
    }}


@router.get("/manuals", response_model=dict)
async def list_manuals(
    machine_id: UUID | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all manuals, optionally filtered by machine."""
    q = select(Manual)
    if machine_id:
        q = q.where(Manual.machine_id == machine_id)
    result = await db.execute(q.order_by(Manual.created_at.desc()))
    manuals = result.scalars().all()
    return {"success": True, "data": {"items": [
        {
            "id": str(m.id),
            "title": m.title,
            "processing_status": m.processing_status,
            "machine_id": str(m.machine_id),
            "original_filename": m.original_filename,
            "created_at": str(m.created_at),
        }
        for m in manuals
    ]}}


@router.get("/manuals/{manual_id}/status", response_model=dict)
async def manual_status(
    manual_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Poll the latest ingestion job status for a manual."""
    result = await db.execute(
        select(IngestionJob)
        .where(IngestionJob.manual_id == manual_id)
        .order_by(IngestionJob.created_at.desc())
    )
    job = result.scalars().first()
    if not job:
        raise HTTPException(404, "Manual or ingestion job not found")
    return {"success": True, "data": {
        "manual_id": str(manual_id),
        "processing_status": job.status,
        "progress_pct": job.progress_pct,
        "pages_processed": job.pages_processed,
        "chunks_created": job.chunks_created,
        "error_message": job.error_message,
    }}
