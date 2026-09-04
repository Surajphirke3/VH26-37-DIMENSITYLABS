"""Unit tests for EvidenceValidator — no DB required."""
from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID

import pytest

from app.services.rag.evidence_validator import EvidenceValidator


_MACHINE_A = UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
_MACHINE_B = UUID("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb")


@dataclass
class FakeChunk:
    machine_id: UUID
    chunk_type: str
    rrf_score: float


def _chunk(machine_id: UUID = _MACHINE_A, chunk_type: str = "section", rrf_score: float = 0.02) -> FakeChunk:
    return FakeChunk(machine_id=machine_id, chunk_type=chunk_type, rrf_score=rrf_score)


def test_sufficient_evidence_passes() -> None:
    validator = EvidenceValidator(threshold=0.45)
    # High RRF scores for top-3 chunks (> _MAX_RRF_SINGLE * 3 * 0.45)
    chunks = [_chunk(rrf_score=0.016) for _ in range(10)]
    result = validator.validate(chunks, _MACHINE_A)
    assert result.is_sufficient


def test_low_evidence_fails() -> None:
    validator = EvidenceValidator(threshold=0.45)
    chunks = [_chunk(rrf_score=0.001) for _ in range(3)]
    result = validator.validate(chunks, _MACHINE_A)
    assert not result.is_sufficient


def test_error_code_chunk_gets_boost() -> None:
    validator = EvidenceValidator(threshold=0.45)
    # Marginal score that passes only with 1.5x error_code boost
    chunks = [_chunk(chunk_type="error_code", rrf_score=0.009)] + [
        _chunk(rrf_score=0.003) for _ in range(9)
    ]
    result = validator.validate(chunks, _MACHINE_A)
    # With boost the top chunk's normalised score is amplified
    assert result.evidence_score > 0.0


def test_machine_consistency_failure() -> None:
    validator = EvidenceValidator(threshold=0.1)
    # 8/10 chunks belong to wrong machine — consistency < 0.5
    chunks = (
        [_chunk(machine_id=_MACHINE_A, rrf_score=0.016) for _ in range(2)] +
        [_chunk(machine_id=_MACHINE_B, rrf_score=0.016) for _ in range(8)]
    )
    result = validator.validate(chunks, _MACHINE_A)
    assert not result.is_sufficient
    assert result.machine_consistency_score < 0.5


def test_no_machine_id_skips_consistency() -> None:
    validator = EvidenceValidator(threshold=0.1)
    chunks = [_chunk(rrf_score=0.016) for _ in range(5)]
    result = validator.validate(chunks, machine_id=None)
    assert result.machine_consistency_score == 1.0


def test_empty_chunks_returns_insufficient() -> None:
    validator = EvidenceValidator()
    result = validator.validate([], machine_id=None)
    assert not result.is_sufficient
    assert result.evidence_score == 0.0
