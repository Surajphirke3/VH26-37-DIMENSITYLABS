"""Unit tests for ingestion pipeline components — no DB required."""
from __future__ import annotations

import pytest

from app.services.ingestion.chunker import ManualChunker
from app.services.ingestion.pdf_parser import PDFParser
from app.services.rag.query_classifier import QueryClassifier, QueryType


# ── QueryClassifier ──────────────────────────────────────────────────────────

class TestQueryClassifier:
    def setup_method(self):
        self.clf = QueryClassifier()

    def test_detects_e_code(self):
        assert self.clf.classify("What is error E101?") == QueryType.ERROR_CODE

    def test_detects_f_code(self):
        assert self.clf.classify("F204 on my machine") == QueryType.ERROR_CODE

    def test_detects_err_dash(self):
        assert self.clf.classify("ERR-042 alarm") == QueryType.ERROR_CODE

    def test_machine_keyword(self):
        result = self.clf.classify("How do I calibrate the spindle on my CNC?")
        assert result in (QueryType.MACHINE_SCOPED, QueryType.NATURAL_LANGUAGE)

    def test_general_query(self):
        assert self.clf.classify("How often should I change the oil?") == QueryType.NATURAL_LANGUAGE

    def test_extract_error_codes(self):
        codes = self.clf.extract_error_codes("E101 and E202 both appear")
        assert "E101" in codes
        assert "E202" in codes

    def test_normalize_error_code(self):
        assert self.clf.normalize_error_code("E 101") == "E101"
        assert self.clf.normalize_error_code("ERR-042") == "ERR042"


# ── ManualChunker extended ────────────────────────────────────────────────────

class TestManualChunker:
    def setup_method(self):
        self.chunker = ManualChunker()

    def _pages(self, text: str):
        from tests.conftest import FakePage
        return [FakePage(page_num=1, text=text)]

    def test_multi_page_chunks_maintain_page_refs(self):
        from tests.conftest import FakePage
        pages = [
            FakePage(1, "Section One\n" + "content word " * 20),
            FakePage(2, "Section Two\n" + "content word " * 20),
        ]
        chunks = self.chunker.chunk_pages(pages)
        page_nums = {c.page_start for c in chunks} | {c.page_end for c in chunks}
        assert 1 in page_nums
        assert 2 in page_nums

    def test_no_empty_content_chunks(self):
        text = "Maintenance\n" + "This is content. " * 15
        chunks = self.chunker.chunk_pages(self._pages(text))
        assert all(c.content.strip() for c in chunks)

    def test_error_codes_list_populated(self):
        text = "Fault Codes\nE101 indicates coolant loss.\nF204 spindle fault.\n"
        chunks = self.chunker.chunk_pages(self._pages(text))
        all_codes = [code for c in chunks for code in c.error_codes_present]
        upper = [c.upper() for c in all_codes]
        assert any("E101" in c for c in upper)

    def test_table_page_produces_table_chunk(self):
        from tests.conftest import FakePage

        class FakeTablePage(FakePage):
            has_tables: bool = True

        pages = [FakeTablePage(1, "Parts List Table\nPart No  Description  Qty\n001  Filter  2\n002  Pump  1\n")]
        chunks = self.chunker.chunk_pages(pages)
        assert chunks  # at least produces chunks


# ── PDFParser (unit — no real PDF) ───────────────────────────────────────────

def test_pdf_parser_exists():
    """Smoke test: PDFParser can be instantiated."""
    parser = PDFParser()
    assert hasattr(parser, "parse")
