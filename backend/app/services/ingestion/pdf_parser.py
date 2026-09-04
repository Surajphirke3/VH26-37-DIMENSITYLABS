from __future__ import annotations

import fitz  # PyMuPDF
from dataclasses import dataclass


@dataclass
class ParsedPage:
    page_num: int       # 1-indexed
    text: str
    has_tables: bool
    is_image_only: bool  # True if text is empty after extraction


class PDFParser:
    def parse(self, file_path: str) -> list[ParsedPage]:
        """Extract text page by page. Detect image-only pages."""
        doc = fitz.open(file_path)
        pages = []
        for i, page in enumerate(doc):
            text = page.get_text("text")
            blocks = page.get_text("dict")["blocks"]
            # type==1 blocks are image blocks; used as proxy for table detection
            has_tables = any(b.get("type") == 1 for b in blocks)
            is_image_only = len(text.strip()) < 50 and len(page.get_images()) > 0
            pages.append(ParsedPage(
                page_num=i + 1,
                text=text,
                has_tables=has_tables,
                is_image_only=is_image_only,
            ))
        doc.close()
        return pages
