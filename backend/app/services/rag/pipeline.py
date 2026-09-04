from __future__ import annotations

import time
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import get_logger
from app.services.ingestion.embedder import EmbeddingService
from app.services.rag.disambiguator import MachineDisambiguator
from app.services.rag.evidence_validator import EvidenceValidator
from app.services.rag.generator import LLMGenerator
from app.services.rag.query_classifier import QueryClassifier, QueryType
from app.services.rag.reranker import CrossEncoderReranker
from app.services.rag.retriever import HybridRetriever

logger = get_logger("rag.pipeline")

_REFUSAL_RESPONSE: dict = {
    "answer_type": "insufficient_information",
    "summary": (
        "The indexed manuals do not contain sufficient information to answer this query."
    ),
    "error_meaning": None,
    "probable_causes": [],
    "corrective_steps": [],
    "citations": [],
    "confidence_level": "LOW",
    "notes": (
        "No matching evidence found in the knowledge base. "
        "Please consult the original manual or contact the manufacturer."
    ),
    "follow_up_suggestions": [
        "Try specifying the machine model",
        "Try using the exact error code format",
    ],
}


class RAGPipeline:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.classifier = QueryClassifier()
        self.retriever = HybridRetriever(db)
        self.reranker = CrossEncoderReranker()
        self.disambiguator = MachineDisambiguator(threshold=settings.DISAMBIGUATION_THRESHOLD)
        self.validator = EvidenceValidator(threshold=settings.EVIDENCE_SCORE_THRESHOLD)
        self.embedder = EmbeddingService()
        self.generator = LLMGenerator()

    async def query(
        self,
        query: str,
        machine_id: UUID | None = None,
        machine_name: str = "",
        conversation_history: list | None = None,
    ) -> dict:
        t0 = time.time()
        if conversation_history is None:
            conversation_history = []

        query_type = self.classifier.classify(query)
        has_error_code = query_type == QueryType.ERROR_CODE

        # 1. Embed
        query_embedding = await self.embedder.embed_query(query)

        # 2. Hybrid retrieve (BM25 + vector → RRF)
        t_retr = time.time()
        fused = await self.retriever.retrieve(
            query_embedding, query, machine_id, top_k=settings.MAX_RETRIEVAL_CHUNKS
        )
        chunks = await self.retriever.fetch_chunks(fused)
        retrieval_ms = int((time.time() - t_retr) * 1000)

        # 3. Cross-encoder rerank
        chunks = self.reranker.rerank(query, chunks, top_k=settings.RERANKER_TOP_K)

        # 4. Disambiguation (only when machine not already pinned by caller)
        if machine_id is None:
            dis = self.disambiguator.analyze(chunks, has_error_code)
            if dis.is_ambiguous:
                logger.info("rag.disambiguation_triggered", options=len(dis.machine_options))
                return {
                    "answer_type": "disambiguation_required",
                    "summary": (
                        "Error code appears in manuals for multiple machines. "
                        "Please specify which machine you are troubleshooting."
                    ),
                    "error_meaning": None,
                    "probable_causes": [],
                    "corrective_steps": [],
                    "citations": [],
                    "confidence_level": None,
                    "notes": None,
                    "follow_up_suggestions": [],
                    "disambiguation_options": dis.machine_options,
                    "retrieval_latency_ms": retrieval_ms,
                    "total_latency_ms": int((time.time() - t0) * 1000),
                }

        # 5. Evidence sufficiency check
        evidence = self.validator.validate(chunks, machine_id)
        if not evidence.is_sufficient:
            logger.info("rag.refusal", evidence_score=evidence.evidence_score)
            resp = dict(_REFUSAL_RESPONSE)
            resp["evidence_score"] = evidence.evidence_score
            resp["retrieval_latency_ms"] = retrieval_ms
            resp["total_latency_ms"] = int((time.time() - t0) * 1000)
            return resp

        # 6. LLM generation
        t_llm = time.time()
        llm_result = await self.generator.generate(
            query, evidence.top_chunks, machine_name, conversation_history
        )
        llm_ms = int((time.time() - t_llm) * 1000)

        # 7. Hydrate citations with full chunk metadata
        chunk_map = {str(i + 1): chunk for i, chunk in enumerate(evidence.top_chunks)}
        citations = []
        for cit in llm_result.get("citations", []):
            cid = str(cit.get("id", ""))
            if cid in chunk_map:
                c = chunk_map[cid]
                citations.append({
                    "citation_id": f"cit-{cid}",
                    "chunk_id": str(c.chunk_id),
                    "manual_name": c.manual_name,
                    "machine_name": c.machine_name,
                    "page_start": c.page_start,
                    "page_end": c.page_end,
                    "section_path": c.section_path,
                    "relevance_score": round(c.rrf_score, 4),
                    "excerpt": c.content[:300],
                })

        llm_result["citations"] = citations
        llm_result["evidence_score"] = evidence.evidence_score
        llm_result["retrieval_latency_ms"] = retrieval_ms
        llm_result["llm_latency_ms"] = llm_ms
        llm_result["total_latency_ms"] = int((time.time() - t0) * 1000)
        llm_result["disambiguation_options"] = None

        logger.info(
            "rag.query_completed",
            query_type=query_type,
            latency_ms=llm_result["total_latency_ms"],
        )
        return llm_result
