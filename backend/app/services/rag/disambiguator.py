from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from uuid import UUID


@dataclass
class DisambiguationResult:
    is_ambiguous: bool
    ambiguity_score: float
    dominant_machine_id: UUID | None
    machine_options: list[dict]  # [{machine_id, machine_name, snippet}]


class MachineDisambiguator:
    """
    Detects when retrieved chunks span multiple machines without a clear
    dominant match, signalling that the caller should ask the user to
    specify which machine they mean.
    """

    def __init__(self, threshold: float = 0.05) -> None:
        self.threshold = threshold

    def analyze(self, chunks: list, query_has_error_code: bool) -> DisambiguationResult:
        """
        Inspect retrieved chunks for multi-machine spread.
        Ambiguity is flagged when:
          - more than one distinct machine is present in the top chunks, AND
          - the query contains an error code (or ambiguity threshold exceeded).
        """
        if not chunks:
            return DisambiguationResult(False, 0.0, None, [])

        window = chunks[:20]
        machine_counts: Counter = Counter(str(c.machine_id) for c in window)
        total = sum(machine_counts.values())
        dominant_str, dominant_count = machine_counts.most_common(1)[0]
        ambiguity_score = 1.0 - (dominant_count / total) if total > 0 else 0.0

        # Trigger disambiguation only when query has error code and ambiguity threshold is exceeded
        is_ambiguous = (
            len(machine_counts) > 1
            and query_has_error_code
            and ambiguity_score >= self.threshold
        )

        # Build at most 5 unique machine options from the window
        options: list[dict] = []
        seen: set[str] = set()
        for chunk in window:
            mid = str(chunk.machine_id)
            if mid not in seen and len(options) < 5:
                seen.add(mid)
                options.append({
                    "machine_id": mid,
                    "machine_name": chunk.machine_name,
                    "snippet": chunk.content[:250].strip(),
                })

        dominant_id = UUID(dominant_str) if not is_ambiguous else None
        return DisambiguationResult(is_ambiguous, ambiguity_score, dominant_id, options)
