from __future__ import annotations

import unicodedata
from typing import Optional

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("rag.language_detector")

# ---------------------------------------------------------------------------
# Unicode-block script fingerprints (fast, zero-dependency fallback)
# ---------------------------------------------------------------------------
_SCRIPT_RANGES: list[tuple[int, int, str]] = [
    # CJK Unified Ideographs (Chinese, Japanese kanji, Korean hanja)
    (0x4E00, 0x9FFF, "zh"),
    (0x3400, 0x4DBF, "zh"),   # CJK Extension A
    (0x20000, 0x2A6DF, "zh"), # CJK Extension B
    (0xF900, 0xFAFF, "zh"),   # CJK Compatibility
    # Hiragana / Katakana → Japanese
    (0x3040, 0x309F, "ja"),
    (0x30A0, 0x30FF, "ja"),
    # Hangul → Korean
    (0xAC00, 0xD7AF, "ko"),
    (0x1100, 0x11FF, "ko"),
    # Arabic
    (0x0600, 0x06FF, "ar"),
    (0x0750, 0x077F, "ar"),
    (0xFB50, 0xFDFF, "ar"),
    # Devanagari (Hindi, Marathi, Sanskrit)
    (0x0900, 0x097F, "hi"),
    # Gujarati
    (0x0A80, 0x0AFF, "gu"),
    # Tamil
    (0x0B80, 0x0BFF, "ta"),
    # Telugu
    (0x0C00, 0x0C7F, "te"),
    # Bengali
    (0x0980, 0x09FF, "bn"),
    # Kannada
    (0x0C80, 0x0CFF, "kn"),
    # Malayalam
    (0x0D00, 0x0D7F, "ml"),
    # Gurmukhi (Punjabi)
    (0x0A00, 0x0A7F, "pa"),
    # Cyrillic (Russian, Bulgarian, etc.)
    (0x0400, 0x04FF, "ru"),
    # Greek
    (0x0370, 0x03FF, "el"),
    # Hebrew
    (0x0590, 0x05FF, "he"),
    # Thai
    (0x0E00, 0x0E7F, "th"),
    # Urdu uses Arabic script — already covered by ar range above
]

# Canonical language codes for variants
_CANONICAL: dict[str, str] = {
    "zh-cn": "zh",
    "zh-tw": "zh",
    "zh-hk": "zh",
}

# Human-readable names (subset for display)
_LANG_NAMES: dict[str, str] = {
    "en": "English", "zh": "Chinese", "ja": "Japanese", "ko": "Korean",
    "ar": "Arabic",  "de": "German",  "fr": "French",   "es": "Spanish",
    "pt": "Portuguese", "ru": "Russian", "hi": "Hindi", "mr": "Marathi",
    "gu": "Gujarati",   "ta": "Tamil",   "te": "Telugu", "bn": "Bengali",
    "kn": "Kannada",    "ml": "Malayalam", "pa": "Punjabi", "ur": "Urdu",
    "it": "Italian",    "nl": "Dutch",     "pl": "Polish",  "th": "Thai",
}


def _unicode_detect(text: str) -> tuple[str, float]:
    """
    Fast character-block based language detection.
    Returns (lang_code, confidence) where confidence ∈ [0, 1].
    """
    scores: dict[str, int] = {}
    total = 0

    for ch in text:
        cp = ord(ch)
        # Skip ASCII (could be any Latin-script language)
        if cp < 0x0100:
            total += 1
            continue
        for start, end, lang in _SCRIPT_RANGES:
            if start <= cp <= end:
                scores[lang] = scores.get(lang, 0) + 1
                total += 1
                break
        else:
            total += 1

    if not scores:
        return "en", 0.0

    best = max(scores, key=scores.__getitem__)
    confidence = scores[best] / max(total, 1)
    return best, round(confidence, 4)


class LanguageDetector:
    """
    Robust multilingual language detector.

    Detection strategy (in order):
      1. Unicode script fingerprint — instant, handles CJK / Arabic / Indic
         with high confidence (threshold: 25 % non-ASCII chars from a script).
      2. `langdetect` library — handles Latin-script languages (EN, DE, FR,
         ES, PT, IT, …) and mixed-script text where Unicode alone is ambiguous.
      3. Fall back to configured default language.

    Supports: English, Chinese (Simplified/Traditional), Japanese, Korean,
    Arabic, German, French, Spanish, Portuguese, Russian, and all major
    Indic languages (Hindi, Marathi, Gujarati, Tamil, Telugu, Bengali,
    Kannada, Malayalam, Punjabi, Urdu).
    """

    def __init__(self) -> None:
        cfg = settings.LANGUAGES_CONFIG
        self._supported: list[str] = cfg.get("supported", ["en"])
        self._default: str = cfg.get("default_language", "en")
        self._cjk: set[str] = set(cfg.get("cjk_languages", ["zh", "ja", "ko"]))
        self._rtl: set[str] = set(cfg.get("rtl_languages", ["ar", "ur"]))
        self._indic: set[str] = set(cfg.get("indic_languages", []))
        self._lang_names: dict[str, str] = cfg.get("language_names", _LANG_NAMES)

        # Try importing langdetect once
        try:
            from langdetect import detect_langs  # type: ignore
            self._detect_langs = detect_langs
        except ImportError:
            logger.warning("language_detector.langdetect_not_installed")
            self._detect_langs = None

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def detect(self, text: str) -> dict:
        """
        Detect the language of *text* and return a rich metadata dict.

        Returns
        -------
        {
          "language": str,          # ISO 639-1 code, e.g. "zh", "en"
          "language_name": str,     # Human-readable name
          "confidence": float,      # 0.0 – 1.0
          "is_cjk": bool,
          "is_rtl": bool,
          "is_indic": bool,
          "is_mixed": bool,
          "script_hint": str | None # "unicode" | "langdetect" | "default"
        }
        """
        stripped = text.strip()
        if not stripped or len(stripped) < 3:
            return self._build_result(self._default, 0.0, "default")

        # ── Guard: Short/technical queries → always English ───────────
        # "alarm 6300", "F101", "E204 error", "machine is not running"
        # are pure ASCII queries that langdetect misidentifies as Swedish,
        # Turkish, etc. because it has no enough signal.
        #
        # Rules:
        #  - If < 15% of characters are non-ASCII → likely Latin script.
        #  - Within Latin-script text, only trust langdetect if there
        #    are ≥ 40 pure alphabetic ASCII characters (enough signal).
        #  - Otherwise → English.
        ascii_chars = sum(1 for c in stripped if ord(c) < 0x0100)
        non_ascii_chars = len(stripped) - ascii_chars
        non_ascii_ratio = non_ascii_chars / max(len(stripped), 1)

        # Fast path: mostly ASCII → check if we have enough alphabetic signal
        if non_ascii_ratio < 0.15:
            alpha_only = "".join(c for c in stripped if c.isalpha() and ord(c) < 0x0100)
            if len(alpha_only) < 40:
                # Too short or too technical — safely default to English
                return self._build_result("en", 1.0, "short_ascii_default")

        # ── Step 1: Unicode script fingerprint ────────────────────────
        # Very reliable for CJK (zh/ja/ko), Arabic, Indic, Cyrillic.
        uni_lang, uni_conf = _unicode_detect(text)
        if uni_conf >= 0.25:
            lang = _CANONICAL.get(uni_lang, uni_lang)
            return self._build_result(lang, uni_conf, "unicode")

        # ── Step 2: langdetect — only for long Latin-script text ───────
        # Skip entirely for short queries to avoid false positives.
        if self._detect_langs is not None and len(stripped) >= 40:
            try:
                results = self._detect_langs(stripped[:2000])
                if results:
                    top = results[0]
                    lang = _CANONICAL.get(top.lang, top.lang)
                    # Require HIGH confidence (≥ 0.85) and that the language
                    # is in our supported list. Never over-ride English on low
                    # confidence — the risk of a false positive (e.g. "en" →
                    # "sv") is worse than always responding in English.
                    if top.prob >= 0.85 and lang in self._supported and lang != "en":
                        return self._build_result(lang, round(top.prob, 4), "langdetect")
            except Exception as exc:
                logger.debug("language_detector.langdetect_failed", error=str(exc))

        # ── Step 3: Default to English ─────────────────────────────────
        return self._build_result("en", 1.0, "default")

    def detect_manual_language(self, pages_text: str) -> str:
        """
        Detect the primary language of an uploaded manual.
        Samples up to 3 000 characters for efficiency.
        For manuals we can use a lower threshold since content is long-form.
        """
        sample = pages_text[:3000]
        # For manuals use the unicode fingerprint directly — more reliable
        # than langdetect on technical/mixed content.
        uni_lang, uni_conf = _unicode_detect(sample)
        if uni_conf >= 0.15:  # lower threshold for long-form manual text
            return _CANONICAL.get(uni_lang, uni_lang)
        return "en"

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _build_result(self, lang: str, confidence: float, hint: str) -> dict:
        is_mixed = self._is_mixed(lang, confidence)
        return {
            "language": lang,
            "language_name": self._lang_names.get(lang, lang.upper()),
            "confidence": confidence,
            "is_cjk": lang in self._cjk,
            "is_rtl": lang in self._rtl,
            "is_indic": lang in self._indic,
            "is_mixed": is_mixed,
            "script_hint": hint,
        }

    def _is_mixed(self, lang: str, confidence: float) -> bool:
        """Mixed if dominant script is < 75 % of content."""
        return 0.0 < confidence < 0.75
