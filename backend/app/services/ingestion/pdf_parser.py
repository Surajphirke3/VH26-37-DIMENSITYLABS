from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import Any, Callable, List, Optional
import fitz  # PyMuPDF

from app.core.logging import get_logger

logger = get_logger("ingestion.pdf_parser")


@dataclass
class ParsedPage:
    page_num: int       # 1-indexed
    text: str
    has_tables: bool
    is_image_only: bool  # True if text is empty after extraction
    tables_markdown: Optional[str] = None


def _format_table_markdown(rows: list[list[Any]]) -> str:
    """Format raw table cell rows to clean Markdown without pandas overhead."""
    if not rows or len(rows) < 2:
        return ""
    # Filter out empty or whitespace-only rows
    cleaned_rows = []
    for r in rows:
        if not r:
            continue
        cleaned = [str(cell or "").replace("\n", " ").strip() for cell in r]
        if any(cleaned):
            cleaned_rows.append(cleaned)

    if len(cleaned_rows) < 2:
        return ""

    header = cleaned_rows[0]
    num_cols = len(header)
    md_lines = ["| " + " | ".join(header) + " |"]
    md_lines.append("| " + " | ".join("---" for _ in range(num_cols)) + " |")

    for row in cleaned_rows[1:]:
        # Normalize column count to header length
        if len(row) < num_cols:
            row = row + [""] * (num_cols - len(row))
        elif len(row) > num_cols:
            row = row[:num_cols]
        md_lines.append("| " + " | ".join(row) + " |")

    return "\n".join(md_lines)


class PDFParser:
    """
    High-speed, resilient PDF text & table parser.
    Features:
    - Single doc handle reuse (eliminates multi-thread file lock contention on Windows/OneDrive).
    - Drawing threshold guard (skips vector border discovery on complex schematics to prevent O(N^2) hangs).
    - Pure Python table extraction via tab.extract() (100x faster than pandas/tabulate).
    - Async progress hooks for real-time frontend feedback.
    """

    def __init__(self, max_drawings_for_table_scan: int = 350):
        self.max_drawings_for_table_scan = max_drawings_for_table_scan

    def _parse_page_obj(self, page: fitz.Page, page_num: int) -> ParsedPage:
        """Parse text, tables, and images from a single open page object."""
        text = page.get_text("text") or ""
        blocks = page.get_text("dict").get("blocks", [])

        # Detect images
        images = page.get_images()
        is_image_only = len(text.strip()) < 50 and len(images) > 0

        has_tables = False
        tables_markdown = []

        # Safe table detection:
        # Technical drawings/schematics contain thousands of vector drawing paths.
        # Calling find_tables() on them triggers combinatorial edge checks that freeze for minutes.
        try:
            drawings = page.get_drawings()
            num_drawings = len(drawings) if drawings else 0

            # Only run vector table detection if the page doesn't have an excessive number of drawings
            if num_drawings <= self.max_drawings_for_table_scan:
                tabs = page.find_tables()
                if tabs.tables:
                    for tab in tabs.tables:
                        try:
                            extracted = tab.extract()
                            md = _format_table_markdown(extracted)
                            if md:
                                tables_markdown.append(md)
                                has_tables = True
                        except Exception as e:
                            logger.debug("pdf_parser.table_extract_error", page=page_num, error=str(e))
            else:
                # Page has complex schematics / CAD drawings; fallback to structural block heuristics
                has_tables = any(b.get("type") == 1 for b in blocks)
        except Exception as exc:
            logger.debug("pdf_parser.find_tables_skipped", page=page_num, error=str(exc))
            has_tables = any(b.get("type") == 1 for b in blocks)

        combined_text = text
        if tables_markdown:
            combined_text += "\n\n### Extracted Tables:\n" + "\n\n".join(tables_markdown)

        return ParsedPage(
            page_num=page_num,
            text=combined_text.strip(),
            has_tables=has_tables,
            is_image_only=is_image_only,
            tables_markdown="\n\n".join(tables_markdown) if tables_markdown else None,
        )

    def parse(self, file_path: str) -> List[ParsedPage]:
        """Synchronous extraction of all pages with single-pass file handle."""
        doc = fitz.open(file_path)
        try:
            total_pages = len(doc)
            pages: List[ParsedPage] = []
            for i in range(total_pages):
                try:
                    pages.append(self._parse_page_obj(doc[i], i + 1))
                except Exception as exc:
                    logger.error("pdf_parser.page_failed", page=i + 1, error=str(exc))
                    pages.append(ParsedPage(page_num=i + 1, text="", has_tables=False, is_image_only=False))
            return pages
        finally:
            doc.close()

    async def parse_async(
        self,
        file_path: str,
        on_progress: Optional[Callable[[int, int], Any]] = None,
    ) -> List[ParsedPage]:
        """
        Asynchronously extract all pages without blocking the asyncio event loop,
        calling on_progress(current_page, total_pages) incrementally.
        """
        doc = await asyncio.to_thread(fitz.open, file_path)
        try:
            total_pages = len(doc)
            pages: List[ParsedPage] = []
            for i in range(total_pages):
                # Run each page parse in thread to avoid blocking HTTP traffic
                page_data = await asyncio.to_thread(self._parse_page_obj, doc[i], i + 1)
                pages.append(page_data)

                # Report incremental progress
                if on_progress:
                    res = on_progress(i + 1, total_pages)
                    if asyncio.iscoroutine(res):
                        await res

                # Yield control briefly to ensure event loop processes status queries
                await asyncio.sleep(0.001)

            return pages
        finally:
            await asyncio.to_thread(doc.close)

