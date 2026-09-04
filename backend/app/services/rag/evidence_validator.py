from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID

from app.core.config import settings

# Theoretical maximum RRF score for the top-ranked document (rank 0, k=60).
_MAX_RRF_SINGLE = 1 / 61


@dataclass
class EvidenceResult:
    is_sufficient: bool
    evidence_score: float
    machine_consistency_score: float
    top_chunks: list


class EvidenceValidator:
    """
    Decides whether the retrieved evidence is strong enough to send to the LLM.
    Prevents hallucination on low-quality or off-topic retrieval.
    """

    def __init__(self, threshold: float | None = None) -> None:
        self.threshold = threshold if threshold is not None else settings.EVIDENCE_SCORE_THRESHOLD

    def validate(self, chunks: list, machine_id: UUID | None) -> EvidenceResult:
        """
        Compute evidence_score from the top-3 RRF scores (normalised 0-1)
        and machine_consistency from how many of the top-10 chunks belong to
        the expected machine.
        """
        if not chunks:
            return EvidenceResult(False, 0.0, 0.0, [])

        top_3 = chunks[:3]
        # Sum of top-3 normalised RRF scores; cap at 1.0
        raw_sum = sum(c.rrf_score for c in top_3)
        rrf_evidence = min(1.0, raw_sum / (_MAX_RRF_SINGLE * 3))

        # Check semantic reranker confidence if available
        top_rerank = max((getattr(c, "rerank_score", 0.0) for c in top_3), default=0.0)
        # Blend RRF and semantic rerank score
        evidence_score = max(rrf_evidence, top_rerank)

        # Boost when the best chunk is directly an error_code entry
        if top_3 and top_3[0].chunk_type == "error_code":
            evidence_score = min(1.0, evidence_score * 1.5)

        # Machine consistency
        machine_consistency = 1.0
        if machine_id and chunks:
            window = chunks[:10]
            matching = sum(1 for c in window if str(c.machine_id) == str(machine_id))
            machine_consistency = (matching / len(window)) if window else 1.0

        is_sufficient = (
            evidence_score >= self.threshold
            and machine_consistency >= 0.4
        )

        return EvidenceResult(
            is_sufficient=is_sufficient,
            evidence_score=round(evidence_score, 4),
            machine_consistency_score=round(machine_consistency, 4),
            top_chunks=chunks[:settings.RERANKER_TOP_K],
        )
