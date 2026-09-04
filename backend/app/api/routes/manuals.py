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
from app.db.chroma import ChromaRepository
from app.db.session import get_db
from app.models.chunk import Chunk
from app.models.ingestion_job import IngestionJob
from app.models.machine import Machine
from app.models.manual import Manual
from app.models.user import User
from app.services.ingestion.auto_metadata import AutoMetadataExtractor

router = APIRouter()
logger = get_logger("api.manuals")

_PDF_MAGIC = b"%PDF"


@router.post("/manuals/extract-metadata", response_model=dict)
async def extract_manual_metadata(
    request: Request,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Automatically extract machine and manual metadata from an uploaded PDF without saving."""
    content = await file.read()
    if not content.startswith(_PDF_MAGIC):
        raise HTTPException(400, "Invalid PDF file (magic bytes check failed)")

    extractor = AutoMetadataExtractor()
    meta = await extractor.aextract_from_bytes(content, filename=file.filename or "")
    meta_dict = meta.to_dict()

    # Search for existing machines in DB that match this model or name
    suggested_machine_id = None
    suggested_machine_name = None
    if meta.machine_model:
        stmt = select(Machine).where(
            Machine.is_active == True,
            (Machine.model.ilike(f"%{meta.machine_model}%")) | (Machine.name.ilike(f"%{meta.machine_model}%"))
        )
        res = await db.execute(stmt)
        matched_machine = res.scalars().first()
        if matched_machine:
            suggested_machine_id = str(matched_machine.id)
            suggested_machine_name = matched_machine.name

    meta_dict["suggested_machine_id"] = suggested_machine_id
    meta_dict["suggested_machine_name"] = suggested_machine_name
    return meta_dict


@router.post("/manuals/upload", response_model=dict)
async def upload_manual(
    request: Request,
    file: UploadFile = File(...),
    machine_id: str | None = Form(None),
    title: str | None = Form(None),
    manual_type: str = Form("service"),
    version: str | None = Form(None),
    auto_detect_metadata: bool = Form(True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Upload a PDF manual with automatic or explicit metadata, and kick off ingestion."""
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
    existing = dup.scalar_one_or_none()
    if existing:
        if existing.processing_status == "failed":
            logger.info("manual.reupload_failed", manual_id=str(existing.id), filename=file.filename)
            await db.delete(existing)
            await db.flush()
        else:
            raise HTTPException(409, f"This file has already been uploaded as '{existing.title}' (duplicate detected)")

    # Parse machine_id if provided
    parsed_machine_id: UUID | None = None
    if machine_id and str(machine_id).strip() and str(machine_id).strip().lower() not in ("null", "undefined", ""):
        try:
            parsed_machine_id = UUID(str(machine_id).strip())
        except (ValueError, TypeError):
            parsed_machine_id = None

    # Auto-detect metadata if machine_id or title is missing
    if parsed_machine_id is None or not title:
        extractor = AutoMetadataExtractor()
        meta = await extractor.aextract_from_bytes(content, filename=file.filename or "")

        if not title:
            title = meta.title
        if not version and meta.version:
            version = meta.version
        if manual_type == "service" and meta.manual_type:
            manual_type = meta.manual_type

        if parsed_machine_id is None:
            # Search for existing machine by model or name
            stmt = select(Machine).where(
                Machine.is_active == True,
                (Machine.model.ilike(f"%{meta.machine_model}%")) | (Machine.name.ilike(f"%{meta.machine_model}%"))
            )
            res = await db.execute(stmt)
            matched = res.scalars().first()
            if matched:
                parsed_machine_id = matched.id
            else:
                # Automatically register machine in database
                new_machine = Machine(
                    name=meta.machine_name or f"{meta.manufacturer} {meta.machine_model}",
                    model=meta.machine_model or "Standard Model",
                    manufacturer=meta.manufacturer or "OEM",
                    category=meta.category or "Machinery",
                    description=f"Auto-created from manual: {title}",
                    is_active=True,
                )
                db.add(new_machine)
                await db.flush()
                parsed_machine_id = new_machine.id
                logger.info("machine.auto_created", machine_id=str(parsed_machine_id), name=new_machine.name)

    # Persist to disk
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_id = uuid4()
    file_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}.pdf")
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    manual = Manual(
        machine_id=parsed_machine_id,
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

    items = []
    for m in manuals:
        machine_name = None
        if m.machine_id:
            m_res = await db.execute(select(Machine).where(Machine.id == m.machine_id))
            mach = m_res.scalar_one_or_none()
            if mach:
                machine_name = mach.name

        # Count chunks
        c_res = await db.execute(select(Chunk.id).where(Chunk.manual_id == m.id))
        chunk_count = len(c_res.scalars().all())

        items.append({
            "id": str(m.id),
            "title": m.title,
            "processing_status": m.processing_status.value if hasattr(m.processing_status, "value") else str(m.processing_status),
            "machine_id": str(m.machine_id) if m.machine_id else None,
            "machine_name": machine_name,
            "manual_type": m.manual_type.value if hasattr(m.manual_type, "value") else str(m.manual_type),
            "version": m.version,
            "language": m.language,
            "original_filename": m.original_filename,
            "file_size_bytes": m.file_size_bytes,
            "page_count": m.page_count,
            "chunk_count": chunk_count,
            "created_at": str(m.created_at),
        })

    return {"success": True, "data": {"items": items}}


@router.get("/manuals/{manual_id}", response_model=dict)
async def get_manual_detail(
    manual_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get single manual details with machine metadata and chunk count."""
    res = await db.execute(select(Manual).where(Manual.id == manual_id))
    m = res.scalar_one_or_none()
    if not m:
        raise HTTPException(404, "Manual not found")

    machine = None
    if m.machine_id:
        m_res = await db.execute(select(Machine).where(Machine.id == m.machine_id))
        mach = m_res.scalar_one_or_none()
        if mach:
            machine = {
                "id": str(mach.id),
                "name": mach.name,
                "model": mach.model,
                "manufacturer": mach.manufacturer,
                "category": mach.category,
            }

    c_res = await db.execute(select(Chunk.id).where(Chunk.manual_id == m.id))
    chunk_count = len(c_res.scalars().all())

    return {"success": True, "data": {
        "id": str(m.id),
        "title": m.title,
        "processing_status": m.processing_status.value if hasattr(m.processing_status, "value") else str(m.processing_status),
        "machine_id": str(m.machine_id) if m.machine_id else None,
        "machine": machine,
        "manual_type": m.manual_type.value if hasattr(m.manual_type, "value") else str(m.manual_type),
        "version": m.version,
        "language": m.language,
        "original_filename": m.original_filename,
        "file_size_bytes": m.file_size_bytes,
        "page_count": m.page_count,
        "chunk_count": chunk_count,
        "file_hash": m.file_hash,
        "created_at": str(m.created_at),
        "processing_error": m.processing_error,
    }}


@router.get("/manuals/{manual_id}/chunks", response_model=dict)
async def get_manual_chunks(
    manual_id: UUID,
    page: int = 1,
    page_size: int = 50,
    search: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch chunk list for a manual for deep inspection."""
    q = select(Chunk).where(Chunk.manual_id == manual_id)
    if search and search.strip():
        q = q.where(Chunk.content.ilike(f"%{search.strip()}%"))

    q = q.order_by(Chunk.chunk_index)
    offset = max(0, (page - 1) * page_size)
    q = q.offset(offset).limit(page_size)

    res = await db.execute(q)
    chunks = res.scalars().all()

    # Total count
    tot_q = select(Chunk.id).where(Chunk.manual_id == manual_id)
    if search and search.strip():
        tot_q = tot_q.where(Chunk.content.ilike(f"%{search.strip()}%"))
    tot_res = await db.execute(tot_q)
    total_count = len(tot_res.scalars().all())

    return {"success": True, "data": {
        "manual_id": str(manual_id),
        "total_chunks": total_count,
        "page": page,
        "page_size": page_size,
        "chunks": [
            {
                "id": str(c.id),
                "chunk_index": c.chunk_index,
                "chunk_type": c.chunk_type.value if hasattr(c.chunk_type, "value") else str(c.chunk_type),
                "content": c.content,
                "content_tokens": c.content_tokens,
                "page_start": c.page_start,
                "page_end": c.page_end,
                "section_path": c.section_path,
                "error_codes_present": c.error_codes_present or [],
            }
            for c in chunks
        ],
    }}


@router.post("/manuals/{manual_id}/reprocess", response_model=dict)
async def reprocess_manual(
    manual_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Reprocess an existing manual from scratch."""
    res = await db.execute(select(Manual).where(Manual.id == manual_id))
    manual = res.scalar_one_or_none()
    if not manual:
        raise HTTPException(404, "Manual not found")

    if not manual.file_path or not os.path.exists(manual.file_path):
        raise HTTPException(400, "Original manual file no longer exists on disk")

    # Clear old vectors from ChromaDB
    ChromaRepository.delete_by_manual_id(manual.id)

    # Delete existing DB chunks
    del_chunks = await db.execute(select(Chunk).where(Chunk.manual_id == manual.id))
    for c in del_chunks.scalars().all():
        await db.delete(c)

    manual.processing_status = "reprocessing"
    manual.processing_error = None
    job = IngestionJob(manual_id=manual.id)
    db.add(job)
    await db.commit()
    await db.refresh(manual)
    await db.refresh(job)

    # Background ingestion
    async def _run_ingestion(mid: UUID, jid: UUID) -> None:
        from app.db.session import AsyncSessionLocal
        from app.services.ingestion.pipeline import IngestionPipeline
        async with AsyncSessionLocal() as bg_db:
            pipeline = IngestionPipeline(bg_db)
            await pipeline.run(mid, jid)

    asyncio.create_task(_run_ingestion(manual.id, job.id))
    logger.info("manual.reprocessing_triggered", manual_id=str(manual.id))

    return {"success": True, "data": {
        "manual_id": str(manual.id),
        "ingestion_job_id": str(job.id),
        "status": "reprocessing",
    }}


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


@router.delete("/manuals/{manual_id}", response_model=dict)
async def delete_manual(
    manual_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Delete a manual, its file, chunks, ingestion jobs, and Chroma vectors."""
    result = await db.execute(select(Manual).where(Manual.id == manual_id))
    manual = result.scalar_one_or_none()
    if not manual:
        raise HTTPException(404, "Manual not found")

    # Clean up Chroma vectors
    try:
        ChromaRepository.delete_by_manual_id(manual.id)
    except Exception as exc:
        logger.warning("manual.chroma_delete_failed", error=str(exc))

    if manual.file_path and os.path.exists(manual.file_path):
        try:
            os.remove(manual.file_path)
        except OSError:
            pass

    await db.delete(manual)
    await db.commit()
    logger.info("manual.deleted", manual_id=str(manual_id))
    return {"success": True, "data": {"message": "Manual deleted successfully"}}
