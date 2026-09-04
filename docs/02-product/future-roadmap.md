# MechMind — Future Roadmap

**Document version:** 1.0
**Status:** Draft (subject to revision post-hackathon)
**Last updated:** 2026-09-04

---

## 1. Overview

This roadmap describes planned enhancements to MechMind beyond the hackathon MVP. Features are grouped into phases that represent natural cohorts of capability expansion. Each phase assumes the prior phase is complete and stable in production.

Timelines are indicative and will be refined based on hackathon outcomes, user feedback from initial deployments, and engineering capacity.

---

## 2. Phase 2 — Post-Hackathon MVP Hardening

**Theme:** Make the hackathon prototype production-grade for real factory deployments.
**Target timeline:** 2–4 months post-hackathon

This phase addresses the most critical gaps between the hackathon demo and an environment where a technician on the factory floor is relying on the system for live troubleshooting.

---

### ROAD-201: OCR Pipeline for Scanned PDF Manuals

**Description**
Many older machine manuals exist only as scanned paper documents — photocopied pages saved as image PDFs with no embedded text. The MVP explicitly fails these files with a helpful error. Phase 2 adds an OCR pipeline that pre-processes scanned PDFs before the normal ingestion flow.

**Technical approach**
- Detection: if `avg_chars_per_page < 10` after PyMuPDF extraction, classify as scanned PDF and route to OCR pipeline
- Primary engine: Tesseract 5 via `pytesseract`; configured for technical English with custom dictionary of machine/error terminology
- High-quality alternative: Google Document AI for documents with complex layouts (tables, multi-column, diagrams embedded in text)
- OCR output: per-page text strings; merged back into the standard chunking pipeline with no downstream changes required
- Confidence scoring: Tesseract provides per-word confidence; pages with average confidence < 70% are flagged in the ingestion job with a quality warning
- Asynchronous: OCR is computationally expensive; routed to a dedicated Celery worker queue with lower concurrency than text PDF ingestion

**User value:** Unlocks access to legacy documentation that covers older machines still in active production use.

**Dependencies:** Celery + Redis job queue (replaces FastAPI BackgroundTasks for production); Tesseract system package in Docker image.

---

### ROAD-202: Voice Query Input

**Description**
Factory technicians often have both hands occupied while troubleshooting — holding a tool, accessing a machine panel, or wearing protective gear. Voice input removes the need to type queries, enabling hands-free troubleshooting.

**Technical approach**
- Browser-side: Web Speech API for real-time transcription (Chrome/Edge; no API cost for basic usage)
- Fallback: Google Speech-to-Text API for more accurate transcription and Safari support
- Transcription → text string → normal query pipeline; no downstream changes required
- UX: push-to-talk button in the chat interface; transcribed text appears in the input field before submission (giving the user a chance to review and correct)
- Error code accuracy: the voice model may mis-transcribe "E101" as "E one zero one" or "E 1 0 1" — a normalization step converts spoken digit sequences to alphanumeric codes before query submission

**User value:** Enables true hands-free operation on the factory floor; reduces time-to-answer for technicians who are actively working on equipment.

---

### ROAD-203: Confidence Score Calibration

**Description**
The MVP assigns confidence levels (HIGH / MEDIUM / LOW) based on a heuristic sufficiency score formula. Phase 2 replaces this with a calibrated confidence model trained on real query/answer pairs with human-provided correctness labels.

**Technical approach**
- Collect query logs with `outcome`, `evidence_score`, and `confidence_level` from Phase 1 production usage
- Label a sample of answered queries with binary correctness (was the answer correct based on the manual?)
- Train a lightweight logistic regression or decision tree on features: top_score, coverage_score, machine_match, chunk_count, query_type
- Replace the heuristic formula with the trained model's probability output
- A/B test calibrated vs heuristic model; switch when calibrated model shows better precision/recall on held-out data

**User value:** Confidence labels become more accurate; LOW confidence answers are more reliably imprecise, and HIGH confidence answers are more reliably correct. Technicians can better calibrate how much to trust each response.

---

### ROAD-204: Multilingual Query Support

**Description**
Factories operate globally. A Spanish-speaking technician in Mexico, a German technician in a European plant, or a Thai technician in an Asian facility may not be comfortable querying in English, even when the manuals are in English.

**Technical approach**
- **Option A (translate-then-retrieve):** Detect query language (Google Language Detection API); translate non-English queries to English before embedding and retrieval; translate the final answer back to the original language. Lower embedding quality but simpler pipeline.
- **Option B (multilingual embeddings):** Replace Gemini text-embedding-004 with a multilingual model (e.g., `multilingual-e5-large` or Gemini's multilingual embedding model). The same embedding space covers multiple languages, enabling cross-lingual retrieval without translation.
- **Recommendation:** Option B for Phase 2; provides better semantic alignment for symptom queries described in the technician's native language.
- **Answer generation:** Prompt Gemini with the detected language and instruction to respond in that language.
- **Error code handling:** Error codes (E101, P-401) are language-agnostic; retrieved correctly regardless of query language.

**User value:** Reduces the language barrier for non-English-speaking technicians; improves adoption in global deployments.

---

## 3. Phase 3 — Growth and Integration

**Theme:** Expand the system's knowledge sources, integrate with existing factory systems, and enable multi-tenant operation across multiple facilities.
**Target timeline:** 6–12 months post-hackathon

---

### ROAD-301: Diagram and Technical Image Retrieval

**Description**
Machine manuals contain wiring diagrams, exploded part views, assembly schematics, and photographic inspection guides. These are currently inaccessible to MechMind (text-only pipeline). A multimodal retrieval pipeline would allow the system to return relevant diagrams alongside text answers.

**Technical approach**
- PDF image extraction: PyMuPDF `page.get_images()` to extract all embedded images per page; caption detection from surrounding text
- Image embedding: Gemini's multimodal embedding or CLIP-based model; produces a shared embedding space for image and text
- Storage: images stored in object storage (S3); image embedding vectors stored in pgvector alongside text chunk vectors
- Retrieval: multimodal query embedding; fused with text retrieval results
- Response: citations can now include images; frontend renders image thumbnails in the citation panel
- Table-of-figures: extract figure captions and store as text metadata for BM25 searchability of diagram titles

**User value:** A technician asking "show me the wiring diagram for the motor controller" receives the actual diagram, not just a description of it. Particularly valuable for mechanical assembly and electrical troubleshooting.

---

### ROAD-302: Automatic Machine Detection from Query Context

**Description**
In Phase 1, machine detection relies on explicit naming in the query or session. Phase 3 introduces a more sophisticated classifier that can detect machine context from partial descriptions ("the big stamping press in bay 3"), from the session's maintenance history, or from factory floor asset tags scanned via camera.

**Technical approach**
- Named entity recognition fine-tuned on factory terminology
- Integration with a factory asset registry API: map asset codes (bay numbers, machine serial numbers) to machine models
- Barcode/QR code scanning: camera input → barcode decode → asset registry lookup → machine model resolved without any typing
- Session context enrichment: if the user has queried about Machine X three times today, give Machine X higher prior probability for ambiguous queries

**User value:** Reduces friction further; technicians can identify machines by their shop-floor names ("the big one in bay 3") rather than official model names.

---

### ROAD-303: Multi-Tenant Operation (Multiple Factories)

**Description**
Phase 1 and 2 assume a single factory with a shared manual repository. Phase 3 adds multi-tenant capability, where each factory (tenant) has its own isolated set of manuals, users, and query logs. A factory in Germany cannot access manuals uploaded by a factory in Japan.

**Technical approach**
- Row-level security in PostgreSQL: `tenant_id` column on all tables; row-level security policy `WHERE tenant_id = current_setting('app.tenant_id')`
- Authentication: tenant-scoped JWT tokens; middleware extracts `tenant_id` and sets PostgreSQL session variable
- pgvector: filter by `tenant_id` in all vector queries; no cross-tenant contamination
- BM25 index: per-tenant index instances in application memory
- Admin panel: tenant-scoped views; super-admin view for cross-tenant management
- Billing: per-tenant usage tracking for API cost attribution

**User value:** Enables MechMind to be offered as a SaaS product to multiple factory customers without data isolation concerns.

---

### ROAD-304: REST API for CMMS Integration

**Description**
Computerized Maintenance Management Systems (CMMS) like SAP PM, IBM Maximo, or UpKeep track work orders, equipment records, and maintenance history. MechMind's troubleshooting answers should be embeddable in CMMS work orders directly.

**Technical approach**
- Publish a stable REST API (versioned: `/api/v1/query`, `/api/v1/ingest`) with API key authentication
- OpenAPI 3.1 specification published for CMMS vendor integration
- Webhook support: CMMS can POST a machine error event; MechMind queries the relevant manual and POSTs the answer back to the CMMS work order
- Query log enriched with `work_order_id` field for traceability

**User value:** Maintenance supervisors can see troubleshooting answers directly in the CMMS work order without switching applications. Historical answers are traceable to specific work orders for auditing.

---

## 4. Phase 4 — Scale and Intelligence

**Theme:** Move from reactive troubleshooting to predictive maintenance; scale to large enterprise deployments; customize the AI for specific factory domains.
**Target timeline:** 12–24 months post-hackathon

---

### ROAD-401: Real-Time Machine Sensor Integration

**Description**
Factory machines emit real-time sensor data through IoT platforms (OPC-UA, MQTT, AWS IoT, Azure IoT Hub). Phase 4 integrates MechMind with these data streams to automatically detect active error codes and anomalous sensor readings, then proactively retrieve relevant troubleshooting guidance without waiting for a technician to type a query.

**Technical approach**
- IoT connector service: subscribes to machine event streams (OPC-UA subscription or MQTT topic)
- Event processing: map incoming event codes to the known error code format; filter for actionable fault events (not noise)
- Automated query: on fault event, trigger a query to the RAG pipeline for the affected machine and error code
- Notification: push the retrieved answer to the assigned technician via the frontend notification system, a mobile push notification, or a CMMS work order creation
- Sensor context: include recent sensor readings (temperature, vibration, pressure) in the query prompt for richer LLM context ("Motor temperature was 87°C when E101 occurred")

**User value:** Technicians receive troubleshooting guidance the moment a fault occurs, before they even walk to the machine. Mean-time-to-repair (MTTR) is significantly reduced.

---

### ROAD-402: Predictive Troubleshooting

**Description**
By aggregating machine fault history and correlating with sensor trends, the system can identify patterns that precede common failures and alert technicians before the fault occurs.

**Technical approach**
- Fault history database: store all fault events with sensor readings, environmental conditions, and resolution outcomes
- Pattern recognition: time-series analysis on sensor streams; statistical correlation between sensor drift and subsequent faults
- Predictive alert: "Motor temperature on AlphaBot 3000 has been trending upward for 6 hours. Based on historical patterns, E101 Motor Overload Fault is likely within the next 4 hours. Recommended preventive action: [steps from manual]"
- Retrieval enhancement: predictive alerts use the same RAG pipeline as reactive queries but with a predictive query framing

**User value:** Shifts maintenance from reactive to predictive. Fault prevention is dramatically cheaper than fault correction. Unplanned downtime is reduced.

---

### ROAD-403: Custom Embedding Fine-Tuning Per Factory

**Description**
Generic embedding models are trained on general corpora and perform well on standard English. Factory-specific terminology ("spindle runout", "IGBT fault", "hydraulic circuit P-side"), product names, and internal part numbers may not be well-represented in the embedding space, causing retrieval misses for highly domain-specific queries.

**Technical approach**
- Data collection: accumulate query/relevant-chunk pairs from Phase 1–3 production usage; label with relevance signals
- Fine-tuning: use the collected pairs to fine-tune a sentence embedding model (via sentence-transformers training API with hard negative mining)
- Evaluation: compare NDCG@5 and MRR on a held-out query set against the base model
- Deployment: fine-tuned model loaded as the embedding service; Gemini API replaced with self-hosted inference for the fine-tuned model

**User value:** Domain-specific embedding improves retrieval quality for highly technical queries that use factory-internal terminology. Reduces refusal rate for queries that a generic model cannot bridge to the correct chunk.

---

## 5. Roadmap Summary Table

| ID | Feature | Phase | Theme | Est. Effort |
|----|---------|-------|-------|------------|
| ROAD-201 | OCR Pipeline for Scanned PDFs | 2 | Hardening | Medium |
| ROAD-202 | Voice Query Input | 2 | Hardening | Medium |
| ROAD-203 | Confidence Score Calibration | 2 | Hardening | Small |
| ROAD-204 | Multilingual Query Support | 2 | Hardening | Large |
| ROAD-301 | Diagram/Image Retrieval | 3 | Growth | Large |
| ROAD-302 | Auto Machine Detection | 3 | Growth | Medium |
| ROAD-303 | Multi-Tenant Operation | 3 | Growth | Large |
| ROAD-304 | CMMS REST API Integration | 3 | Growth | Medium |
| ROAD-401 | Real-Time Sensor Integration | 4 | Scale | X-Large |
| ROAD-402 | Predictive Troubleshooting | 4 | Scale | X-Large |
| ROAD-403 | Custom Embedding Fine-Tuning | 4 | Scale | Large |

---

## 6. Principles Governing Roadmap Prioritization

1. **Safety first:** Features that reduce incorrect or hallucinated answers have highest priority regardless of phase. Any roadmap item that could increase hallucination risk is blocked until the safety gate is validated in the new context.

2. **Evidence-driven prioritization:** Phase 2 and 3 priorities will be adjusted based on actual usage patterns from Phase 1 production deployment. What technicians actually query, which queries fail, and what types of manuals are uploaded will shape which features deliver the most value.

3. **Backward compatibility:** The REST API (ROAD-304) will be versioned from its first release. No breaking changes to existing API versions; new capabilities added in new versions.

4. **Open-source preference:** Where an open-source alternative (Tesseract, sentence-transformers, Celery) is sufficient, it is preferred over proprietary SaaS to manage operational costs and avoid vendor lock-in. Proprietary services are used where they provide decisive quality or development-speed advantages (Google Gemini for embeddings and generation in Phase 1).

---

*End of Future Roadmap*
