"""Unit tests for ManualChunker."""
from __future__ import annotations

from dataclasses import dataclass

import pytest

from app.services.ingestion.chunker import ManualChunker


@dataclass
class FakePage:
    page_num: int
    text: str


def make_chunker(**kwargs) -> ManualChunker:
    return ManualChunker(**kwargs)


def pages_from_text(text: str, page_num: int = 1) -> list[FakePage]:
    return [FakePage(page_num=page_num, text=text)]


def test_basic_section_chunking() -> None:
    chunker = make_chunker()
    text = "Introduction\n" + "This is an introductory paragraph. " * 10
    chunks = chunker.chunk_pages(pages_from_text(text))
    assert len(chunks) >= 1
    assert all(c.content for c in chunks)


def test_error_code_chunk_detection() -> None:
    chunker = make_chunker()
    text = (
        "Error Code Reference\n"
        "E101 - Coolant pressure loss. Check pump and filter.\n"
        "E202 - Spindle overload. Reduce feed rate.\n"
    )
    chunks = chunker.chunk_pages(pages_from_text(text))
    assert any(c.chunk_type == "error_code" for c in chunks)
    all_codes: list[str] = []
    for c in chunks:
        all_codes.extend(c.error_codes_present)
    code_strings = [code.upper() for code in all_codes]
    assert any("E101" in c for c in code_strings)
    assert any("E202" in c for c in code_strings)


def test_warning_chunk_detection() -> None:
    chunker = make_chunker()
    text = (
        "Safety Section\n"
        "WARNING: Always disconnect power before servicing the coolant reservoir.\n"
        "Failure to do so may result in injury or death.\n"
    )
    chunks = chunker.chunk_pages(pages_from_text(text))
    assert any(c.chunk_type == "warning" for c in chunks)


def test_large_section_splits() -> None:
    """A section exceeding max_tokens should be split into multiple chunks."""
    chunker = make_chunker(max_tokens=50, min_tokens=5, overlap_pct=0.1)
    # Build content well over 50 words across multiple paragraphs
    para = "word " * 30  # 30 words per paragraph
    text = "Big Section\n" + "\n\n".join([para] * 5)
    chunks = chunker.chunk_pages(pages_from_text(text))
    assert len(chunks) > 1, "Large section should produce multiple chunks"


def test_chunk_index_is_sequential() -> None:
    chunker = make_chunker(max_tokens=50, min_tokens=5, overlap_pct=0.1)
    para = "word " * 30
    text = "Section\n" + "\n\n".join([para] * 4)
    chunks = chunker.chunk_pages(pages_from_text(text))
    indices = [c.chunk_index for c in chunks]
    assert indices == list(range(len(chunks)))


def test_section_path_is_set() -> None:
    chunker = make_chunker()
    text = "Maintenance Procedures\nClean the filter monthly using compressed air."
    chunks = chunker.chunk_pages(pages_from_text(text))
    assert all(c.section_path for c in chunks)
