from __future__ import annotations

import re
from enum import Enum

ERROR_CODE_RE = re.compile(
    r'\b(E\d{2,5}|ERR[-\s]\d{2,5}|F\d{2,5}|Fault\s+\d{2,5}|Error\s+\d{2,5})\b',
    re.IGNORECASE,
)

MACHINE_KEYWORDS = re.compile(
    r'\b(machine|model|unit|device|robot|controller|cnc|lathe|mill|press)\b',
    re.IGNORECASE,
)


class QueryType(str, Enum):
    ERROR_CODE = "error_code"
    NATURAL_LANGUAGE = "natural_language"
    MACHINE_SCOPED = "machine_scoped"


class QueryClassifier:
    def classify(self, query: str) -> QueryType:
        if ERROR_CODE_RE.search(query):
            return QueryType.ERROR_CODE
        if MACHINE_KEYWORDS.search(query):
            return QueryType.MACHINE_SCOPED
        return QueryType.NATURAL_LANGUAGE

    def extract_error_codes(self, query: str) -> list[str]:
        return [
            m.upper().replace(' ', '').replace('-', '')
            for m in ERROR_CODE_RE.findall(query)
        ]

    def normalize_error_code(self, code: str) -> str:
        """Normalise E 101 → E101, ERR-101 → ERR101, etc."""
        return re.sub(r'[\s-]', '', code).upper()
