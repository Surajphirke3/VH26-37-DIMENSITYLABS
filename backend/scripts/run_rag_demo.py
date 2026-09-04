"""Manual end-to-end RAG smoke test against a live database.

Usage:
    # From project root after `make up && make migrate && make seed`:
    cd backend
    GROQ_API_KEY=gsk_... GEMINI_API_KEY=AIza... \\
        .venv/bin/python scripts/run_rag_demo.py

What it does:
    1. Connects to the database defined in settings
    2. Picks the first machine with chunks
    3. Runs three representative queries through RAGPipeline
    4. Prints JSON results to stdout
    5. Exits 0 on success, 1 on any error
"""
from __future__ import annotations

import asyncio
import json
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.services.rag.pipeline import RAGPipeline


_QUERIES = [
    "What does error E101 mean?",
    "How do I perform monthly maintenance?",
    "What is the weather today?",  # expected: insufficient_information
]


async def run() -> None:
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    Session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    async with Session() as db:
        # Find first machine that has chunks
        result = await db.execute(
            text("SELECT DISTINCT machine_id FROM chunks LIMIT 1")
        )
        row = result.fetchone()
        if row is None:
            print("No chunks found — run `make demo-pdfs` then upload via admin UI.")
            sys.exit(1)

        machine_id = row[0]

        # Get machine name
        mrow = await db.execute(
            text("SELECT name FROM machines WHERE id = :id"),
            {"id": str(machine_id)},
        )
        machine_name = mrow.scalar_one_or_none() or "Unknown"
        print(f"Testing against machine: {machine_name} ({machine_id})\n")

        pipeline = RAGPipeline(db)

        for query in _QUERIES:
            print(f"─── Query: {query!r} ───")
            try:
                result = await pipeline.query(
                    query=query,
                    machine_id=machine_id,
                    machine_name=machine_name,
                )
                summary = {
                    "answer_type": result.get("answer_type"),
                    "confidence_level": result.get("confidence_level"),
                    "summary": (result.get("summary") or "")[:200],
                    "citations_count": len(result.get("citations") or []),
                    "evidence_score": result.get("evidence_score"),
                    "total_latency_ms": result.get("total_latency_ms"),
                }
                print(json.dumps(summary, indent=2))
            except Exception as exc:
                print(f"ERROR: {exc}", file=sys.stderr)
                sys.exit(1)
            print()

    await engine.dispose()
    print("Smoke test passed.")


if __name__ == "__main__":
    asyncio.run(run())
