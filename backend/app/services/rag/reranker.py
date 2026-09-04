from __future__ import annotations

from typing import List, Optional

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("rag.reranker")

_CROSS_ENCODER_MODEL = "cross-encoder/ms-marco-MiniLM-L-6-v2"
_CONTENT_TRUNCATE = 512


class RerankerStrategy:
    """Base interface for re-ranking strategies."""

    def score(self, query: str, chunks: list) -> list[tuple]:
        raise NotImplementedError


class CrossEncoderRerankerStrategy(RerankerStrategy):
    """Semantic re-ranking using a sentence-transformers cross-encoder model."""

    def __init__(self, model_name: str = _CROSS_ENCODER_MODEL):
        self._model_name = model_name
        self._model = None

    def _load_model(self):
        if self._model is None:
            try:
                from sentence_transformers import CrossEncoder
                self._model = CrossEncoder(self._model_name)
                logger.info("reranker.model_loaded", model=self._model_name)
            except Exception as exc:
                logger.warning("reranker.model_load_failed", error=str(exc))
                self._model = None
        return self._model

    def score(self, query: str, chunks: list) -> list[tuple]:
        model = self._load_model()
        if model is None or not chunks:
            return []
        pairs = [(query, chunk.content[:_CONTENT_TRUNCATE]) for chunk in chunks]
        try:
            scores = model.predict(pairs)
            return list(zip(chunks, scores))
        except Exception as exc:
            logger.warning("reranker.predict_failed", error=str(exc))
            return []


class VectorSimilarityRerankerStrategy(RerankerStrategy):
    """Fallback strategy that uses the existing RRF score as a proxy."""

    def score(self, query: str, chunks: list) -> list[tuple]:
        return [(chunk, chunk.rrf_score) for chunk in chunks]


class RerankerFactory:
    """Factory that builds the appropriate re-ranking strategy."""

    @staticmethod
    def create(strategy: str = "cross_encoder") -> RerankerStrategy:
        if strategy == "cross_encoder":
            return CrossEncoderRerankerStrategy()
        if strategy == "vector":
            return VectorSimilarityRerankerStrategy()
        logger.warning("reranker.unknown_strategy", strategy=strategy, fallback="cross_encoder")
        return CrossEncoderRerankerStrategy()


class CrossEncoderReranker:
    """
    Pluggable re-ranker with fallback strategy support.
    """

    def __init__(self, strategy: Optional[RerankerStrategy] = None):
        self._strategy = strategy or RerankerFactory.create()

    def rerank(self, query: str, chunks: list, top_k: int = 8) -> list:
        if not chunks:
            return []

        scored = self._strategy.score(query, chunks)
        if not scored:
            # Fallback to original order
            return chunks[:top_k]

        import math
        # Sort descending by raw score
        scored.sort(key=lambda x: x[1], reverse=True)
        reranked = []
        for chunk, score in scored[:top_k]:
            raw_val = float(score)
            # Sigmoid normalization maps any logit (-inf, +inf) to (0.0, 1.0)
            try:
                norm_score = 1.0 / (1.0 + math.exp(-raw_val))
            except OverflowError:
                norm_score = 1.0 if raw_val > 0 else 0.0

            # Store rerank_score and ensure rrf_score reflects normalized semantic confidence
            chunk.rerank_score = norm_score
            # Blend with original RRF rank score (scale ~0.016 to 0.033)
            chunk.rrf_score = max(chunk.rrf_score, norm_score * (1.0 / 61.0) * 1.5)
            reranked.append(chunk)
        return reranked