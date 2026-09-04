from __future__ import annotations

import json
from pathlib import Path
from typing import Optional

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("rag.language_detector")

# Unicode block ranges for major Indian languages
_INDIC_RANGES = [
    (0x0900, 0x097F, "hi"),     # Devanagari (Hindi, Marathi)
    (0x0A80, 0x0AFF, "gu"),     # Gujarati
    (0x0B00, 0x0B7F, "ta"),     # Tamil
    (0x0B80, 0x0BFF, "te"),     # Telugu
    (0x0C00, 0x0C7F, "bn"),     # Bengali
    (0x0C80, 0x0CFF, "kn"),     # Kannada
    (0x0D00, 0x0D7F, "ml"),     # Malayalam
    (0x0A70, 0x0A7F, "pa"),     # Gurmukhi (Punjabi)
    (0x0600, 0x06FF, "ur"),     # Arabic script (Urdu)
]

# Simple script detection by character block matching
_TRANSLITERATE_MAP = {
    "hi": "hi",
    "mr": "hi",
    "gu": "gu",
    "ta": "ta",
    "te": "te",
    "bn": "bn",
    "kn": "kn",
    "ml": "ml",
    "pa": "pa",
    "ur": "ur",
}


class LanguageDetector:
    """
    Detects input language. Supports English, major Indic languages,
    and mixed-language input (Hinglish).
    """

    def __init__(self) -> None:
        self._supported = settings.LANGUAGES_CONFIG.get("supported", ["en"])
        self._default = settings.LANGUAGES_CONFIG.get("default_language", "en")

    def detect(self, text: str) -> dict:
        """Detect language and return metadata dict."""
        if not text:
            return {"language": self._default, "confidence": 0.0, "is_indic": False, "is_mixed": False}

        scores = {lang: 0 for lang in self._supported}
        total_chars = 0
        indic_char_count = 0
        english_char_count = 0

        for ch in text:
            code = ord(ch)
            total_chars += 1

            is_indic = False
            for start, end, lang_code in _INDIC_RANGES:
                if start <= code <= end:
                    scores[lang_code] = scores.get(lang_code, 0) + 1
                    is_indic = True
                    indic_char_count += 1
                    break

            if not is_indic and ch.isascii() and ch.isalnum():
                english_char_count += 1

        if total_chars == 0:
            return {"language": self._default, "confidence": 0.0, "is_indic": False, "is_mixed": False}

        best_lang = max(scores, key=scores.get)
        confidence = scores[best_lang] / total_chars
        is_mixed = indic_char_count > 0 and english_char_count > 0

        return {
            "language": best_lang if best_lang in self._supported else "en",
            "confidence": round(confidence, 4),
            "is_indic": indic_char_count > 0,
            "is_mixed": is_mixed,
            "script": _TRANSLITERATE_MAP.get(best_lang, best_lang),
        }
