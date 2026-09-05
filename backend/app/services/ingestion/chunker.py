from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import List, Tuple

from app.core.config import settings

ERROR_CODE_PATTERN = re.compile(
    r'\b(E\d{2,4}|ERR[-\s]\d{2,4}|F\d{2,4}|Fault\s+\d{2,4}|Error\s+\d{2,4}|ALM\d{2,4})\b',
    re.IGNORECASE,
)

HEADING_RE = re.compile(
    r'^((?:\d+\.)+\d*\s+\w|[A-Z][A-Z\s]{4,}|.+:|\#+\s+.+|第[\d一二三四五六七八九十]+[章节条])\s*$',
    re.MULTILINE,
)

# CJK Unicode ranges — for these scripts, character count ≈ token count.
_CJK_RANGES = [
    (0x4E00, 0x9FFF),   # CJK Unified Ideographs
    (0x3040, 0x30FF),   # Hiragana + Katakana
    (0xAC00, 0xD7AF),   # Hangul
    (0x3400, 0x4DBF),   # CJK Extension A
]


def _estimate_tokens(text: str) -> int:
    """Estimate token count: CJK characters count individually, others split on whitespace."""
    cjk_chars = sum(
        1 for ch in text
        if any(s <= ord(ch) <= e for s, e in _CJK_RANGES)
    )
    if cjk_chars > len(text) * 0.3:
        # CJK-dominant: chars ≈ tokens
        return len(text)
    return len(text.split())


@dataclass
class Chunk:
    chunk_index: int
    chunk_type: str          # section, error_code, table, warning, list, overlap
    content: str
    page_start: int
    page_end: int
    section_path: str
    error_codes_present: list[str] = field(default_factory=list)
    language: str = "en"


class ManualChunker:
    def __init__(
        self,
        max_tokens: int | None = None,
        min_tokens: int | None = None,
        overlap_pct: float | None = None,
    ):
        self.max_tokens = max_tokens or settings.CHUNK_MAX_TOKENS
        self.min_tokens = min_tokens or settings.CHUNK_MIN_TOKENS
        self.overlap_pct = (overlap_pct if overlap_pct is not None else settings.CHUNK_OVERLAP_PCT) / 100.0

    def chunk_pages(self, pages: list) -> list[Chunk]:
        """Chunk all pages into structured, context-preserving Chunk objects."""
        if not pages:
            return []

        page_tuples = [(p.page_num, p.text) for p in pages if p.text.strip()]
        sections = self._split_into_sections(page_tuples)
        chunks: list[Chunk] = []

        for heading, content, page_start, page_end in sections:
            sub = self._process_section(heading, content, page_start, page_end, chunks)
            chunks.extend(sub)

        return chunks

    def _split_into_sections(
        self, pages: list[tuple[int, str]]
    ) -> list[tuple[str, str, int, int]]:
        sections: list[tuple[str, str, int, int]] = []
        current_heading = "General Overview"
        current_lines: list[str] = []
        current_page_start = 1
        current_page = 1

        for page_num, text in pages:
            for line in text.split('\n'):
                stripped = line.strip()
                if (
                    HEADING_RE.match(stripped)
                    and 2 < len(stripped) < 120
                ):
                    if current_lines:
                        sections.append((
                            current_heading,
                            '\n'.join(current_lines),
                            current_page_start,
                            current_page,
                        ))
                    current_heading = stripped
                    current_lines = []
                    current_page_start = page_num
                else:
                    current_lines.append(line)
            current_page = page_num

        if current_lines:
            sections.append((
                current_heading,
                '\n'.join(current_lines),
                current_page_start,
                current_page,
            ))
        return sections

    def _classify_content(self, content: str, codes: list[str]) -> str:
        upper = content.upper()
        if 'WARNING' in upper or 'CAUTION' in upper or 'DANGER' in upper:
            return 'warning'
        if '|' in content and '---' in content:
            return 'table'
        if codes:
            return 'error_code'
        if re.search(r'^\s*[-*•\d+\.]\s+', content, re.MULTILINE):
            return 'procedure_list'
        return 'section'

    def _process_section(
        self,
        heading: str,
        content: str,
        page_start: int,
        page_end: int,
        existing_chunks: list[Chunk],
    ) -> list[Chunk]:
        idx = len(existing_chunks)
        codes = list(set(ERROR_CODE_PATTERN.findall(content)))
        chunk_type = self._classify_content(content, codes)
        words = content.split()

        if _estimate_tokens(content) <= self.max_tokens:
            return [Chunk(idx, chunk_type, content, page_start, page_end, heading, codes)]

        # Split at paragraph or list item boundaries for oversized sections
        result: list[Chunk] = []
        paragraphs = re.split(r'\n\s*\n', content)
        current_paras: list[str] = []

        for para in paragraphs:
            combined = '\n\n'.join(current_paras + [para])
            if _estimate_tokens(combined) > self.max_tokens and current_paras:
                text = '\n\n'.join(current_paras)
                chunk_codes = list(set(ERROR_CODE_PATTERN.findall(text)))
                result.append(Chunk(
                    idx + len(result),
                    self._classify_content(text, chunk_codes),
                    text, page_start, page_end, heading, chunk_codes,
                ))
                # Context-preserving overlap
                all_words = text.split() if _estimate_tokens(text) < len(text) * 0.3 else list(text)
                overlap_count = max(1, int(len(all_words) * self.overlap_pct))
                overlap_text = ''.join(all_words[-overlap_count:]) if _estimate_tokens(text) >= len(text) * 0.3 else ' '.join(all_words[-overlap_count:])
                current_paras = [overlap_text, para]
            else:
                current_paras.append(para)

        if current_paras:
            text = '\n\n'.join(current_paras)
            chunk_codes = list(set(ERROR_CODE_PATTERN.findall(text)))
            result.append(Chunk(
                idx + len(result),
                self._classify_content(text, chunk_codes),
                text, page_start, page_end, heading, chunk_codes,
            ))

        return result
