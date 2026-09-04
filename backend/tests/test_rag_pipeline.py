"""Unit tests for RAGPipeline — no DB, no LLM, no network calls."""
from __future__ import annotations

from dataclasses import dataclass
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import UUID

import pytest

from app.services.rag.pipeline import RAGPipeline

_M1 = UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
_M2 = UUID("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb")
_CHK = UUID("cccccccc-cccc-cccc-cccc-cccccccccccc")

_EMBEDDING = [0.1] * 768


@dataclass
class _Chunk:
    chunk_id: UUID = _CHK
    manual_id: UUID = _M1
    machine_id: UUID = _M1
    content: str = "E101 coolant pressure loss — check pump."
    chunk_type: str = "error_code"
    page_start: int = 4
    page_end: int = 4
    section_path: str = "Fault Codes"
    error_codes_present: list = None
    rrf_score: float = 0.016
    machine_name: str = "Haas VF-2"
    manual_name: str = "Haas VF-2 Service Manual"

    def __post_init__(self):
        if self.error_codes_present is None:
            self.error_codes_present = ["E101"]


def _make_pipeline(db=None):
    if db is None:
        db = AsyncMock()
    pipeline = RAGPipeline.__new__(RAGPipeline)
    pipeline.db = db
    pipeline.classifier = MagicMock()
    pipeline.retriever = AsyncMock()
    pipeline.reranker = MagicMock()
    pipeline.disambiguator = MagicMock()
    pipeline.validator = MagicMock()
    pipeline.embedder = AsyncMock()
    pipeline.generator = AsyncMock()
    return pipeline


# ── Happy path ────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_query_returns_solution():
    pipeline = _make_pipeline()
    chunk = _Chunk()

    from app.services.rag.query_classifier import QueryType
    pipeline.classifier.classify.return_value = QueryType.ERROR_CODE
    pipeline.embedder.embed_query.return_value = _EMBEDDING
    pipeline.retriever.retrieve.return_value = [(_CHK, 0.016)]
    pipeline.retriever.fetch_chunks.return_value = [chunk]
    pipeline.reranker.rerank.return_value = [chunk]

    from app.services.rag.disambiguator import DisambiguationResult
    pipeline.disambiguator.analyze.return_value = DisambiguationResult(
        is_ambiguous=False, ambiguity_score=0.1, dominant_machine_id=_M1, machine_options=[]
    )

    from app.services.rag.evidence_validator import EvidenceResult
    pipeline.validator.validate.return_value = EvidenceResult(
        is_sufficient=True, evidence_score=0.8,
        machine_consistency_score=1.0, top_chunks=[chunk]
    )

    pipeline.generator.generate.return_value = {
        "answer_type": "solution",
        "summary": "Replace coolant pump.",
        "error_meaning": "Coolant pressure dropped below threshold.",
        "probable_causes": ["Pump failure"],
        "corrective_steps": [{"step_number": 1, "action": "Replace pump", "warning": None, "citation_ids": ["1"]}],
        "citations": [{"id": "1", "chunk_id": str(_CHK)}],
        "confidence_level": "HIGH",
        "notes": None,
        "follow_up_suggestions": [],
    }

    result = await pipeline.query("E101 alarm on Haas", machine_id=_M1, machine_name="Haas VF-2")

    assert result["answer_type"] == "solution"
    assert result["confidence_level"] == "HIGH"
    assert len(result["citations"]) == 1
    assert result["citations"][0]["manual_name"] == "Haas VF-2 Service Manual"


@pytest.mark.asyncio
async def test_query_includes_latency_fields():
    pipeline = _make_pipeline()
    chunk = _Chunk()

    from app.services.rag.query_classifier import QueryType
    pipeline.classifier.classify.return_value = QueryType.NATURAL_LANGUAGE
    pipeline.embedder.embed_query.return_value = _EMBEDDING
    pipeline.retriever.retrieve.return_value = []
    pipeline.retriever.fetch_chunks.return_value = [chunk]
    pipeline.reranker.rerank.return_value = [chunk]

    from app.services.rag.disambiguator import DisambiguationResult
    pipeline.disambiguator.analyze.return_value = DisambiguationResult(
        False, 0.0, _M1, []
    )
    from app.services.rag.evidence_validator import EvidenceResult
    pipeline.validator.validate.return_value = EvidenceResult(True, 0.7, 1.0, [chunk])

    pipeline.generator.generate.return_value = {
        "answer_type": "solution", "summary": "ok", "error_meaning": None,
        "probable_causes": [], "corrective_steps": [], "citations": [],
        "confidence_level": "MEDIUM", "notes": None, "follow_up_suggestions": [],
    }

    result = await pipeline.query("How do I change oil?")
    assert "retrieval_latency_ms" in result
    assert "total_latency_ms" in result
    assert isinstance(result["total_latency_ms"], int)


# ── Disambiguation path ───────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_disambiguation_triggered_returns_options():
    pipeline = _make_pipeline()
    chunks = [_Chunk(machine_id=_M1), _Chunk(machine_id=_M2)]

    from app.services.rag.query_classifier import QueryType
    pipeline.classifier.classify.return_value = QueryType.ERROR_CODE
    pipeline.embedder.embed_query.return_value = _EMBEDDING
    pipeline.retriever.retrieve.return_value = [(_CHK, 0.016)]
    pipeline.retriever.fetch_chunks.return_value = chunks
    pipeline.reranker.rerank.return_value = chunks

    from app.services.rag.disambiguator import DisambiguationResult
    pipeline.disambiguator.analyze.return_value = DisambiguationResult(
        is_ambiguous=True,
        ambiguity_score=0.5,
        dominant_machine_id=None,
        machine_options=[
            {"machine_id": str(_M1), "machine_name": "Haas VF-2", "snippet": "E101..."},
            {"machine_id": str(_M2), "machine_name": "Fanuc 0i-MF", "snippet": "E101..."},
        ],
    )

    result = await pipeline.query("E101 error", machine_id=None)

    assert result["answer_type"] == "disambiguation_required"
    assert len(result["disambiguation_options"]) == 2
    # Generator must NOT be called
    pipeline.generator.generate.assert_not_called()


# ── Refusal path ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_insufficient_evidence_returns_refusal():
    pipeline = _make_pipeline()
    chunk = _Chunk(rrf_score=0.001)  # very low score

    from app.services.rag.query_classifier import QueryType
    pipeline.classifier.classify.return_value = QueryType.NATURAL_LANGUAGE
    pipeline.embedder.embed_query.return_value = _EMBEDDING
    pipeline.retriever.retrieve.return_value = [(_CHK, 0.001)]
    pipeline.retriever.fetch_chunks.return_value = [chunk]
    pipeline.reranker.rerank.return_value = [chunk]

    from app.services.rag.disambiguator import DisambiguationResult
    pipeline.disambiguator.analyze.return_value = DisambiguationResult(False, 0.0, _M1, [])

    from app.services.rag.evidence_validator import EvidenceResult
    pipeline.validator.validate.return_value = EvidenceResult(
        is_sufficient=False, evidence_score=0.1,
        machine_consistency_score=1.0, top_chunks=[chunk]
    )

    result = await pipeline.query("What is the weather today?", machine_id=_M1)

    assert result["answer_type"] == "insufficient_information"
    pipeline.generator.generate.assert_not_called()


@pytest.mark.asyncio
async def test_empty_retrieval_triggers_refusal():
    pipeline = _make_pipeline()

    from app.services.rag.query_classifier import QueryType
    pipeline.classifier.classify.return_value = QueryType.NATURAL_LANGUAGE
    pipeline.embedder.embed_query.return_value = _EMBEDDING
    pipeline.retriever.retrieve.return_value = []
    pipeline.retriever.fetch_chunks.return_value = []
    pipeline.reranker.rerank.return_value = []

    from app.services.rag.disambiguator import DisambiguationResult
    pipeline.disambiguator.analyze.return_value = DisambiguationResult(False, 0.0, None, [])

    from app.services.rag.evidence_validator import EvidenceResult
    pipeline.validator.validate.return_value = EvidenceResult(False, 0.0, 1.0, [])

    result = await pipeline.query("Unrelated question", machine_id=None)
    assert result["answer_type"] == "insufficient_information"


# ── Conversation history ──────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_conversation_history_passed_to_generator():
    pipeline = _make_pipeline()
    chunk = _Chunk()
    history = [{"role": "user", "content": "Previous query"}]

    from app.services.rag.query_classifier import QueryType
    pipeline.classifier.classify.return_value = QueryType.ERROR_CODE
    pipeline.embedder.embed_query.return_value = _EMBEDDING
    pipeline.retriever.retrieve.return_value = [(_CHK, 0.016)]
    pipeline.retriever.fetch_chunks.return_value = [chunk]
    pipeline.reranker.rerank.return_value = [chunk]

    from app.services.rag.disambiguator import DisambiguationResult
    pipeline.disambiguator.analyze.return_value = DisambiguationResult(False, 0.0, _M1, [])

    from app.services.rag.evidence_validator import EvidenceResult
    pipeline.validator.validate.return_value = EvidenceResult(True, 0.8, 1.0, [chunk])

    pipeline.generator.generate.return_value = {
        "answer_type": "solution", "summary": "ok", "error_meaning": None,
        "probable_causes": [], "corrective_steps": [], "citations": [],
        "confidence_level": "HIGH", "notes": None, "follow_up_suggestions": [],
    }

    await pipeline.query("E101 again", machine_id=_M1, conversation_history=history)

    call_kwargs = pipeline.generator.generate.call_args
    assert call_kwargs.kwargs.get("conversation_history") == history or \
           call_kwargs.args[3] == history


# ── Citation hydration ────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_citation_phantom_id_skipped():
    """Citations referencing chunk IDs not in the top_chunks are silently dropped."""
    pipeline = _make_pipeline()
    chunk = _Chunk()

    from app.services.rag.query_classifier import QueryType
    pipeline.classifier.classify.return_value = QueryType.ERROR_CODE
    pipeline.embedder.embed_query.return_value = _EMBEDDING
    pipeline.retriever.retrieve.return_value = [(_CHK, 0.016)]
    pipeline.retriever.fetch_chunks.return_value = [chunk]
    pipeline.reranker.rerank.return_value = [chunk]

    from app.services.rag.disambiguator import DisambiguationResult
    pipeline.disambiguator.analyze.return_value = DisambiguationResult(False, 0.0, _M1, [])

    from app.services.rag.evidence_validator import EvidenceResult
    pipeline.validator.validate.return_value = EvidenceResult(True, 0.8, 1.0, [chunk])

    pipeline.generator.generate.return_value = {
        "answer_type": "solution",
        "summary": "ok",
        "error_meaning": None,
        "probable_causes": [],
        "corrective_steps": [],
        "citations": [
            {"id": "1", "chunk_id": str(_CHK)},   # valid
            {"id": "99", "chunk_id": "nonexistent"},  # phantom — should be dropped
        ],
        "confidence_level": "HIGH",
        "notes": None,
        "follow_up_suggestions": [],
    }

    result = await pipeline.query("E101", machine_id=_M1)
    # Only citation id "1" maps to chunk index 1; "99" doesn't exist
    assert len(result["citations"]) == 1
    assert result["citations"][0]["citation_id"] == "cit-1"


# ── Machine pinned — disambiguation skipped ───────────────────────────────────

@pytest.mark.asyncio
async def test_machine_pinned_skips_disambiguation():
    pipeline = _make_pipeline()
    chunk = _Chunk()

    from app.services.rag.query_classifier import QueryType
    pipeline.classifier.classify.return_value = QueryType.ERROR_CODE
    pipeline.embedder.embed_query.return_value = _EMBEDDING
    pipeline.retriever.retrieve.return_value = [(_CHK, 0.016)]
    pipeline.retriever.fetch_chunks.return_value = [chunk]
    pipeline.reranker.rerank.return_value = [chunk]

    from app.services.rag.evidence_validator import EvidenceResult
    pipeline.validator.validate.return_value = EvidenceResult(True, 0.8, 1.0, [chunk])

    pipeline.generator.generate.return_value = {
        "answer_type": "solution", "summary": "ok", "error_meaning": None,
        "probable_causes": [], "corrective_steps": [], "citations": [],
        "confidence_level": "HIGH", "notes": None, "follow_up_suggestions": [],
    }

    # Pass machine_id — disambiguator.analyze must NOT be called
    await pipeline.query("E101", machine_id=_M1)
    pipeline.disambiguator.analyze.assert_not_called()
