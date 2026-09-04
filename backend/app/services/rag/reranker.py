from __future__ import annotations

from app.core.logging import get_logger

logger = get_logger("rag.reranker")

_CROSS_ENCODER_MODEL = "cross-encoder/ms-marco-MiniLM-L-6-v2"
# Truncate chunk content to avoid exceeding model max-length (512 tokens).
_CONTENT_TRUNCATE = 512


class CrossEncoderReranker:
    """Singleton-style cross-encoder; model is loaded once on first use."""

    _model = None

    def _get_model(self):
        if CrossEncoderReranker._model is None:
            try:
                from sentence_transformers import CrossEncoder
                CrossEncoderReranker._model = CrossEncoder(_CROSS_ENCODER_MODEL)
                logger.info("reranker.model_loaded", model=_CROSS_ENCODER_MODEL)
            except Exception as exc:
                logger.warning("reranker.model_load_failed", error=str(exc))
                CrossEncoderReranker._model = None
        return CrossEncoderReranker._model

    def rerank(self, query: str, chunks: list, top_k: int = 10) -> list:
        """
        Rerank chunks with the cross-encoder.
        Falls back to original RRF order when the model is unavailable.
        Mutates rrf_score on each chunk with the reranker logit so downstream
        code can treat the score field uniformly.
        """
        model = self._get_model()
        if model is None or not chunks:
            return chunks[:top_k]

        pairs = [(query, chunk.content[:_CONTENT_TRUNCATE]) for chunk in chunks]
        try:
            scores = model.predict(pairs)
            scored = sorted(zip(chunks, scores), key=lambda x: x[1], reverse=True)
            reranked: list = []
            for chunk, score in scored[:top_k]:
                chunk.rrf_score = float(score)
                reranked.append(chunk)
            return reranked
        except Exception as exc:
            logger.warning("reranker.predict_failed", error=str(exc))
            return chunks[:top_k]
