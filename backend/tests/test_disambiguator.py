"""Unit tests for MachineDisambiguator — no DB required."""
from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID
import pytest

from app.services.rag.disambiguator import MachineDisambiguator


_A = UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
_B = UUID("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb")
_C = UUID("cccccccc-cccc-cccc-cccc-cccccccccccc")


@dataclass
class FakeChunk:
    machine_id: UUID
    machine_name: str = "Machine"
    content: str = "sample content"


def test_no_ambiguity_when_machine_dominant() -> None:
    disambiguator = MachineDisambiguator(threshold=0.3)
    # 8/10 chunks from same machine — score = 0.2, below threshold
    chunks = [FakeChunk(_A)] * 8 + [FakeChunk(_B)] * 2
    result = disambiguator.analyze(chunks, query_has_error_code=True)
    assert not result.is_ambiguous


def test_ambiguity_triggered_on_split() -> None:
    disambiguator = MachineDisambiguator(threshold=0.3)
    # 5/10 each — score = 0.5, above threshold
    chunks = [FakeChunk(_A)] * 5 + [FakeChunk(_B)] * 5
    result = disambiguator.analyze(chunks, query_has_error_code=True)
    assert result.is_ambiguous
    assert result.ambiguity_score == pytest.approx(0.5)


def test_no_ambiguity_without_error_code() -> None:
    disambiguator = MachineDisambiguator(threshold=0.3)
    # Same 50/50 split but no error code in query
    chunks = [FakeChunk(_A)] * 5 + [FakeChunk(_B)] * 5
    result = disambiguator.analyze(chunks, query_has_error_code=False)
    assert not result.is_ambiguous


def test_options_capped_at_5() -> None:
    disambiguator = MachineDisambiguator(threshold=0.1)
    uuids = [UUID(f"{i:032x}") for i in range(1, 11)]
    chunks = [FakeChunk(u) for u in uuids]
    result = disambiguator.analyze(chunks, query_has_error_code=True)
    assert len(result.machine_options) <= 5


def test_empty_chunks_not_ambiguous() -> None:
    disambiguator = MachineDisambiguator()
    result = disambiguator.analyze([], query_has_error_code=True)
    assert not result.is_ambiguous


import pytest
