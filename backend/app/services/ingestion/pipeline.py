from __future__ import annotations

import datetime
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.models.chunk import Chunk as ChunkModel
from app.models.ingestion_job import IngestionJob
from app.models.manual import Manual
from app.services.ingestion.chunker import ManualChunker
from app.services.ingestion.embedder import EmbeddingService
from app.services.ingestion.pdf_parser import PDFParser

logger = get_logger("ingestion.pipeline")

_FLUSH_EVERY = 10  # flush DB every N chunks to keep memory bounded


class IngestionPipeline:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.parser = PDFParser()
        self.chunker = ManualChunker()
        self.embedder = EmbeddingService()

    async def run(self, manual_id: UUID, job_id: UUID) -> None:
        """Run full ingestion pipeline: parse → chunk → embed → persist."""
        await self._update_job(job_id, status="running", started_at=datetime.datetime.utcnow())
        try:
            manual = await self._get_manual(manual_id)
            await self._update_manual_status(manual_id, "processing")

            # --- Parse ---
            pages = self.parser.parse(manual.file_path)
            await self._update_job(job_id, pages_processed=len(pages), progress_pct=20)

            # --- Chunk ---
            chunks = self.chunker.chunk_pages(pages)
            await self._update_job(job_id, progress_pct=40)

            # --- Embed & persist ---
            total = len(chunks)
            for i, chunk in enumerate(chunks):
                embedding = await self.embedder.embed_text(chunk.content)
                db_chunk = ChunkModel(
                    manual_id=manual_id,
                    machine_id=manual.machine_id,
                    chunk_index=chunk.chunk_index,
                    chunk_type=chunk.chunk_type,
                    content=chunk.content,
                    content_tokens=len(chunk.content.split()),
                    page_start=chunk.page_start,
                    page_end=chunk.page_end,
                    section_path=chunk.section_path,
                    error_codes_present=chunk.error_codes_present,
                    embedding=embedding,
                    embedding_model=self.embedder.model,
                )
                self.db.add(db_chunk)

                if i % _FLUSH_EVERY == 0:
                    await self.db.flush()
                    pct = 40 + int((i / total) * 50)
                    await self._update_job(job_id, progress_pct=pct, chunks_created=i)

            await self.db.commit()
            await self._update_manual_status(manual_id, "completed", page_count=len(pages))
            await self._update_job(
                job_id,
                status="completed",
                progress_pct=100,
                chunks_created=total,
                completed_at=datetime.datetime.utcnow(),
            )
            logger.info("ingestion.completed", manual_id=str(manual_id), chunks=total)

        except Exception as exc:
            await self.db.rollback()
            err = str(exc)
            await self._update_manual_status(manual_id, "failed", error=err)
            await self._update_job(job_id, status="failed", error_message=err)
            logger.error("ingestion.failed", manual_id=str(manual_id), error=err)
            raise

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    async def _get_manual(self, manual_id: UUID) -> Manual:
        result = await self.db.execute(select(Manual).where(Manual.id == manual_id))
        return result.scalar_one()

    async def _update_manual_status(
        self,
        manual_id: UUID,
        status: str,
        page_count: int | None = None,
        error: str | None = None,
    ) -> None:
        values: dict = {"processing_status": status}
        if page_count is not None:
            values["page_count"] = page_count
        if error is not None:
            values["processing_error"] = error
        if status == "processing":
            values["processing_started_at"] = datetime.datetime.utcnow()
        if status in ("completed", "failed"):
            values["processing_completed_at"] = datetime.datetime.utcnow()
        await self.db.execute(update(Manual).where(Manual.id == manual_id).values(**values))
        await self.db.commit()

    async def _update_job(self, job_id: UUID, **kwargs) -> None:
        await self.db.execute(
            update(IngestionJob).where(IngestionJob.id == job_id).values(**kwargs)
        )
        await self.db.commit()
