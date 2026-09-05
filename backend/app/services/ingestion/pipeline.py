from __future__ import annotations

import asyncio
import datetime
from uuid import UUID

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.models.chunk import Chunk as ChunkModel
from app.models.ingestion_job import IngestionJob
from app.models.manual import Manual
from app.db.chroma import ChromaRepository
from app.services.ingestion.chunker import ManualChunker
from app.services.ingestion.embedder import EmbeddingService
from app.services.ingestion.pdf_parser import PDFParser
from app.services.rag.language_detector import LanguageDetector

logger = get_logger("ingestion.pipeline")

_FLUSH_EVERY = 10  # flush DB every N chunks to keep memory bounded


class IngestionPipeline:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.parser = PDFParser()
        self.chunker = ManualChunker()
        self.embedder = EmbeddingService()
        self.lang_detector = LanguageDetector()

    async def run(self, manual_id: UUID, job_id: UUID) -> None:
        """Run full ingestion pipeline: parse → chunk → embed → persist."""
        await self._update_job(job_id, status="running", started_at=datetime.datetime.utcnow())
        try:
            manual = await self._get_manual(manual_id)
            await self._update_manual_status(manual_id, "processing")

            # --- Parse (Async, Non-blocking with live page-level progress) ---
            async def _report_parse_progress(curr: int, tot: int):
                pct = int(5 + (curr / max(1, tot)) * 20)
                await self._update_job(job_id, pages_processed=curr, progress_pct=pct)

            pages = await self.parser.parse_async(manual.file_path, on_progress=_report_parse_progress)
            await self._update_job(job_id, pages_processed=len(pages), progress_pct=25)

            # --- Chunk ---
            chunks = self.chunker.chunk_pages(pages)

            # --- Detect manual language from first 3 pages ---
            sample_text = " ".join(p.text[:500] for p in pages[:3])
            manual_lang = self.lang_detector.detect_manual_language(sample_text)
            logger.info("ingestion.language_detected", manual_id=str(manual_id), language=manual_lang)

            await self._update_job(job_id, progress_pct=35)

            # --- Embed & persist in batches ---
            res = await self.db.execute(
                select(func.max(ChunkModel.chunk_index)).where(ChunkModel.manual_id == manual_id)
            )
            max_existing = res.scalar()
            start_index = (max_existing + 1) if max_existing is not None else 0

            total = len(chunks)
            batch_size = 30
            for i in range(start_index, total, batch_size):
                batch = chunks[i : i + batch_size]
                contents = [c.content for c in batch]
                embeddings = await self.embedder.embed_batch(contents)

                db_chunks_to_add = []
                chroma_ids = []
                chroma_metadatas = []
                chroma_documents = []

                for chunk, embedding in zip(batch, embeddings):
                    # Postgres record
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
                    db_chunks_to_add.append(db_chunk)

                await self.db.flush() # flush to generate chunk UUIDs

                for db_chunk in db_chunks_to_add:
                    chroma_ids.append(str(db_chunk.id))
                    chroma_documents.append(db_chunk.content)
                    chroma_metadatas.append({
                        "manual_id": str(db_chunk.manual_id),
                        "machine_id": str(db_chunk.machine_id),
                        "page_start": db_chunk.page_start,
                        "page_end": db_chunk.page_end,
                        "chunk_type": db_chunk.chunk_type,
                        "section_path": db_chunk.section_path or "",
                        "language": manual_lang,
                    })

                # Insert into ChromaDB
                ChromaRepository.insert_batch(
                    ids=chroma_ids,
                    embeddings=embeddings,
                    metadatas=chroma_metadatas,
                    documents=chroma_documents
                )

                await self.db.commit()
                processed_count = min(i + batch_size, total)
                pct = 35 + int((processed_count / max(1, total)) * 60)
                await self._update_job(job_id, progress_pct=pct, chunks_created=processed_count)
                # Yield to ensure HTTP status queries can be processed smoothly
                await asyncio.sleep(0.01)

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
