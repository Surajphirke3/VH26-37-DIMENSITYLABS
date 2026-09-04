from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Optional

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("guardrails")

# Patterns that indicate prompt injection or malicious intent
_INJECTION_PATTERNS = [
    re.compile(r"(?i)(ignore\s+(previous|above|all)\s+(instruction|context))", re.IGNORECASE),
    re.compile(r"(?i)(forget\s+(everything|that)|disregard\s+(your|all|instructions?))", re.IGNORECASE),
    re.compile(r"(?i)(you\s+are\s+now\s+|pretend\s+you\s+are|act\s+as\s+)", re.IGNORECASE),
    re.compile(r"(?i)(reveal\s+system\s+prompt|show\s+(your|the)\s+instructions)", re.IGNORECASE),
    re.compile(r"(?i)(sql\s*inject|xss|eval\(|exec\(|os\.system\()", re.IGNORECASE),
]

# Sensitive patterns that should not be in outputs
_SENSITIVE_PATTERNS = [
    re.compile(r"(?i)(api\s*key|secret\s*key|private\s*key)\s*[:=]\s*\S+", re.IGNORECASE),
    re.compile(r"(?i)(password|passwd|pwd)\s*[:=]\s*\S+", re.IGNORECASE),
    re.compile(r"\b\d{10,}\b"),  # long numeric strings (phone numbers, etc.)
]


@dataclass
class GuardrailResult:
    is_safe: bool
    violation_type: Optional[str] = None
    message: Optional[str] = None


class InputGuardrails:
    """Validates and sanitizes user input."""

    def __init__(self) -> None:
        cfg = settings.GUARDRAILS_CONFIG.get("input_guardrails", {})
        self._max_length = cfg.get("max_prompt_length", 5000)
        self._block_unsafe = cfg.get("block_unsafe", True)
        self._check_jailbreak = cfg.get("check_jailbreak", True)

    def validate(self, text: str) -> GuardrailResult:
        if not text or not text.strip():
            return GuardrailResult(False, "empty", "Query cannot be empty.")

        if len(text) > self._max_length:
            return GuardrailResult(
                False, "too_long",
                f"Query exceeds maximum length of {self._max_length} characters."
            )

        if self._check_jailbreak:
            for pattern in _INJECTION_PATTERNS:
                if pattern.search(text):
                    logger.warning("guardrails.input.injection_detected", pattern=str(pattern.pattern))
                    return GuardrailResult(
                        False, "prompt_injection",
                        "Input contains potentially unsafe patterns and was rejected."
                    )

        return GuardrailResult(is_safe=True)


class RetrievalGuardrails:
    """Sanitizes retrieved context chunks before sending to LLM."""

    def __init__(self) -> None:
        cfg = settings.GUARDRAILS_CONFIG.get("retrieval_guardrails", {})
        self._min_relevance = cfg.get("min_relevance_score", 0.2)
        self._poisoning_detection = cfg.get("poisoning_detection", True)

    def validate_chunk(self, content: str, relevance_score: float) -> GuardrailResult:
        if relevance_score < self._min_relevance:
            return GuardrailResult(
                False, "low_relevance",
                f"Chunk relevance {relevance_score:.3f} below threshold {self._min_relevance}."
            )

        if self._poisoning_detection:
            for pattern in _INJECTION_PATTERNS:
                if pattern.search(content):
                    return GuardrailResult(
                        False, "content_poisoning",
                        "Retrieved content contains suspicious injection patterns."
                    )

        return GuardrailResult(is_safe=True)


class OutputGuardrails:
    """Validates LLM-generated responses before returning to the user."""

    def __init__(self) -> None:
        cfg = settings.GUARDRAILS_CONFIG.get("output_guardrails", {})
        self._check_hallucination = cfg.get("check_hallucination", True)
        self._block_sensitive = cfg.get("block_sensitive_leakage", True)

    def validate(self, text: str) -> GuardrailResult:
        if not text or not text.strip():
            return GuardrailResult(False, "empty_output", "Generated response is empty.")

        if self._block_sensitive:
            for pattern in _SENSITIVE_PATTERNS:
                match = pattern.search(text)
                if match:
                    # Redact the sensitive portion
                    redacted = text[:match.start()] + "[REDACTED]" + text[match.end():]
                    logger.warning("guardrails.output.sensitive_detected", pattern=str(pattern.pattern))
                    return GuardrailResult(
                        False, "sensitive_leakage",
                        "Response contained sensitive information that has been redacted."
                    )

        return GuardrailResult(is_safe=True)


class GuardrailsManager:
    """Unified guardrails coordinator."""

    def __init__(self) -> None:
        self.input = InputGuardrails()
        self.retrieval = RetrievalGuardrails()
        self.output = OutputGuardrails()
        logger.info("guardrails.initialized")

    def check_input(self, text: str) -> GuardrailResult:
        return self.input.validate(text)

    def check_chunks(self, chunks: list, scores: list) -> list:
        """Filter out unsafe or irrelevant chunks."""
        safe_chunks = []
        for chunk, score in zip(chunks, scores):
            result = self.retrieval.validate_chunk(chunk.content, score)
            if result.is_safe:
                safe_chunks.append(chunk)
            else:
                logger.info("guardrails.chunk_filtered", reason=result.violation_type)
        return safe_chunks

    def check_output(self, text: str) -> GuardrailResult:
        return self.output.validate(text)
