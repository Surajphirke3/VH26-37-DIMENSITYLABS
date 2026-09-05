from __future__ import annotations

import time
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import get_logger
from app.services.ai.groq import GroqLLM
from app.services.ai.model_router import ModelRouter
from app.services.ingestion.embedder import EmbeddingService
from app.services.guardrails import GuardrailsManager
from app.services.rag.disambiguator import MachineDisambiguator
from app.services.rag.evidence_validator import EvidenceValidator
from app.services.rag.generator import LLMGenerator
from app.services.rag.language_detector import LanguageDetector
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
        self.language_detector = LanguageDetector()
        self.guardrails = GuardrailsManager()
        self.model_router = ModelRouter()

    async def query(
        self,
        query: str,
        machine_id: UUID | None = None,
        machine_name: str = "",
        conversation_history: list | None = None,
        model: str | None = None,
        image_data: str | None = None,
        target_language: str | None = None,
    ) -> dict:
        t0 = time.time()
        if conversation_history is None:
            conversation_history = []

        ocr_result = None
        if image_data:
            from app.services.ai.ocr import extract_visual_fault_data

            try:
                ocr_result = await extract_visual_fault_data(image_data)
                detected_code = ocr_result.get("error_code")
                detected_brand = ocr_result.get("machine_brand")
                extracted_text = (ocr_result.get("extracted_text") or "").strip()

                generic_phrases = [
                    "analyze image",
                    "analyze this image",
                    "what is this",
                    "error code",
                    "diagnose",
                    "check image",
                    "help",
                    "",
                ]
                is_generic = not query or query.strip().lower() in generic_phrases

                if detected_code:
                    if is_generic:
                        query = f"Fault code {detected_code}: {extracted_text}" if extracted_text else f"Fault code {detected_code}"
                    else:
                        query = f"{query} [Fault Code: {detected_code}] {extracted_text}".strip()
                elif extracted_text:
                    if is_generic:
                        query = extracted_text
                    else:
                        query = f"{query} [Visual Scan: {extracted_text}]".strip()

                # If machine is not selected, attempt auto-match by detected brand
                if not machine_id and detected_brand:
                    from app.models.machine import Machine
                    from sqlalchemy import select, or_

                    brand_res = await self.db.execute(
                        select(Machine).where(
                            or_(
                                Machine.name.ilike(f"%{detected_brand}%"),
                                Machine.model.ilike(f"%{detected_brand}%"),
                                Machine.manufacturer.ilike(f"%{detected_brand}%"),
                            )
                        )
                    )
                    matched_m = brand_res.scalars().first()
                    if matched_m:
                        machine_id = matched_m.id
                        machine_name = f"{matched_m.manufacturer} {matched_m.name}"
                        logger.info("rag.ocr_auto_matched_machine", machine_id=str(machine_id), name=machine_name)
            except Exception as exc:
                logger.warning("rag.ocr_preprocessing_failed", error=str(exc))

        query_type = self.classifier.classify(query)
        has_error_code = query_type == QueryType.ERROR_CODE or (ocr_result and bool(ocr_result.get("error_code")))

        # Language detection & resolution
        detector = getattr(self, "language_detector", None)
        if target_language and target_language.lower() != "auto":
            detected_lang = target_language.lower()
            lang_name = target_language.upper()
            is_cjk = detected_lang in ("zh", "ja", "ko")
            is_rtl = detected_lang in ("ar", "ur", "he")
        elif detector:
            lang_meta = detector.detect(query)
            detected_lang = lang_meta.get("language", "en")
            lang_name = lang_meta.get("language_name", "English")
            is_cjk = lang_meta.get("is_cjk", False)
            is_rtl = lang_meta.get("is_rtl", False)
        else:
            detected_lang = "en"
            lang_name = "English"
            is_cjk = False
            is_rtl = False

        # Resolve AI model
        router = getattr(self, "model_router", None)
        if router:
            if image_data and not model:
                resolved_model = router.resolve_model(task="visual_inspection")
            elif has_error_code and not model:
                resolved_model = router.resolve_model(task="error_code_triage", explicit_model=model)
            else:
                resolved_model = router.resolve_model(task="balanced_troubleshooting", explicit_model=model)
        else:
            resolved_model = model or settings.GROQ_MODEL

        # Guardrail: input validation
        guardrails = getattr(self, "guardrails", None)
        if guardrails:
            guard_check = guardrails.check_input(query)
            if not guard_check.is_safe:
                return {
                    "answer_type": "insufficient_information",
                    "summary": "Query was blocked by safety guardrails.",
                    "error_meaning": None,
                    "probable_causes": [],
                    "corrective_steps": [],
                    "citations": [],
                    "confidence_level": "LOW",
                    "notes": guard_check.message or "Input failed validation.",
                    "follow_up_suggestions": ["Rephrase your question without special commands."],
                    "language_detected": detected_lang,
                    "evidence_score": 0.0,
                    "model_used": resolved_model,
                    "total_latency_ms": int((time.time() - t0) * 1000),
                }

        # 1. Embed
        t_emb = time.time()
        query_embedding = await self.embedder.embed_query(query)
        emb_ms = int((time.time() - t_emb) * 1000)

        # 2. Hybrid retrieve (BM25 + vector → RRF)
        t_retr = time.time()
        fused = await self.retriever.retrieve(
            query_embedding, query, machine_id, top_k=settings.INITIAL_TOP_K
        )
        chunks = await self.retriever.fetch_chunks(fused)
        retrieval_ms = int((time.time() - t_retr) * 1000)

        # 3. Cross-encoder rerank
        t_rrk = time.time()
        chunks = self.reranker.rerank(query, chunks, top_k=settings.RERANKER_TOP_K)
        rerank_ms = int((time.time() - t_rrk) * 1000)

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
                    "language_detected": detected_lang,
                    "model_used": resolved_model,
                    "retrieval_latency_ms": retrieval_ms,
                    "rerank_latency_ms": rerank_ms,
                    "total_latency_ms": int((time.time() - t0) * 1000),
                }

        # 5. Evidence sufficiency check
        evidence = self.validator.validate(chunks, machine_id)
        if not evidence.is_sufficient:
            logger.info("rag.refusal", evidence_score=evidence.evidence_score)
            resp = dict(_REFUSAL_RESPONSE)
            resp["evidence_score"] = evidence.evidence_score
            resp["language_detected"] = detected_lang
            resp["model_used"] = resolved_model
            resp["retrieval_latency_ms"] = retrieval_ms
            resp["rerank_latency_ms"] = rerank_ms
            resp["total_latency_ms"] = int((time.time() - t0) * 1000)
            resp["ocr_result"] = ocr_result
            if ocr_result and (ocr_result.get("error_code") or ocr_result.get("extracted_text")):
                code_str = ocr_result.get("error_code") or "Fault code"
                resp["notes"] = f"OCR successfully extracted: {code_str}. However, no corresponding section was found in the indexed OEM manuals for this equipment."
            return resp

        # 6. LLM generation
        t_llm = time.time()
        llm_result = await self.generator.generate(
            query,
            evidence.top_chunks,
            machine_name,
            conversation_history,
            model=resolved_model,
            image_data=image_data,
            detected_lang=detected_lang,
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
        llm_result["language_detected"] = detected_lang
        llm_result["language_name"] = lang_name
        llm_result["is_cjk_response"] = is_cjk
        llm_result["is_rtl_response"] = is_rtl
        llm_result["model_used"] = resolved_model
        llm_result["retrieval_latency_ms"] = retrieval_ms
        llm_result["rerank_latency_ms"] = rerank_ms
        llm_result["llm_latency_ms"] = llm_ms
        llm_result["total_latency_ms"] = int((time.time() - t0) * 1000)
        llm_result["disambiguation_options"] = None
        llm_result["ocr_result"] = ocr_result

        logger.info(
            "rag.query_completed",
            query_type=query_type,
            model=resolved_model,
            latency_ms=llm_result["total_latency_ms"],
        )
        return llm_result
