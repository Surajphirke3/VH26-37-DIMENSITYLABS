# Assumptions

## Purpose

When requirements are ambiguous or when the problem statement does not specify a detail that the system design depends on, assumptions must be made explicit. This document records every architectural and product assumption, its rationale, and the consequences if the assumption proves wrong.

This document should be reviewed at the start of each development sprint and updated when assumptions are invalidated by new information.

---

## Assumption Register

### A-001: Manual Language

| Field | Detail |
|---|---|
| **Statement** | All machine manuals uploaded to MechMind are written in English. |
| **Rationale** | Multi-language processing (translation, multi-language embeddings, language detection) significantly increases system complexity and is unlikely to be required for a hackathon demonstration. The primary deployment context is assumed to be an English-language factory environment. |
| **Impact if Wrong** | The system would fail to extract meaningful text or generate useful answers for manuals in other languages (e.g., German, Japanese, Mandarin). Technicians querying in their native language would receive poor results. The embedding model would need replacement. |
| **Alternatives Considered** | Use a multilingual embedding model (e.g., `multilingual-e5-large`) from the start. Accept manuals in any language and detect/store the language as metadata. Rejected for v1 due to added complexity and evaluation overhead. |

---

### A-002: PDF Availability

| Field | Detail |
|---|---|
| **Statement** | Machine manuals are available in digital PDF format. The system does not need to handle physical paper manuals, Word documents, HTML pages, or proprietary formats. |
| **Rationale** | PDF is the universal standard for technical documentation distribution. Most machine manufacturers provide manuals as PDFs. The hackathon problem statement references PDFs explicitly. |
| **Impact if Wrong** | If manuals are only available as Word documents, HTML, or proprietary formats (e.g., Siemens WinCC project files), a format conversion or separate ingestion pipeline would be required. |
| **Alternatives Considered** | Support DOCX, HTML, and plain text as additional input formats. A format-agnostic document loader (e.g., Apache Tika) could handle multiple formats. Deferred to future scope. |

---

### A-003: Machine Identity Is Knowable

| Field | Detail |
|---|---|
| **Statement** | Each manual uploaded to MechMind is associated with a specific, identifiable machine model at upload time. This association is provided by the administrator and stored as metadata. The system does not attempt to infer machine identity from manual content alone. |
| **Rationale** | Inferring machine identity from document content is unreliable: a manual often covers multiple variants, uses model names inconsistently, and may not state the machine name prominently in the text body. Requiring administrators to specify machine identity at upload time is the most reliable approach. |
| **Impact if Wrong** | If manuals are uploaded without machine metadata (e.g., batch-uploaded without metadata), the disambiguation pipeline would need to parse machine identity from the document, increasing error rates. |
| **Alternatives Considered** | Auto-extract machine model from the manual cover page or title using an LLM. This is technically feasible but unreliable and not needed if the admin workflow enforces machine tagging. Considered a future enhancement. |

---

### A-004: Error Code Format Diversity

| Field | Detail |
|---|---|
| **Statement** | Error codes across different machines follow no universal format. The system will not assume any specific error code format (e.g., `E-XXX`, `FXX`, `ERR-XXXX`). Any alphanumeric token matching the pattern of an error code in a manual must be retrievable. |
| **Rationale** | Industrial equipment manufacturers use proprietary error code formats that vary widely. Any format assumptions built into the retrieval logic will break for at least some manuals. |
| **Impact if Wrong** | If a narrow format assumption is made, error codes outside that format will be missed by the keyword retrieval component. |
| **Alternatives Considered** | Build a format-specific parser for known manufacturers. Rejected because it does not generalise and requires ongoing maintenance as new manuals are added. |

---

### A-005: LLM Context Window Is Sufficient for RAG

| Field | Detail |
|---|---|
| **Statement** | The LLM used for answer generation has a context window of at least 8,000 tokens, which is sufficient to hold: system prompt (~500 tokens) + conversation history (last 3 turns, ~1,500 tokens) + retrieved chunks (~4,000 tokens) + query and output format instructions (~500 tokens). |
| **Rationale** | Models available in mid-2025 (Claude 3.5 Sonnet, GPT-4o, Gemini 1.5 Flash) have context windows of 128K–200K tokens. The 8K assumption is a conservative lower bound. The system will manage its context budget to stay within limits. |
| **Impact if Wrong** | If a smaller model is required (e.g., cost constraints), the number of retrieved chunks must be reduced, which may decrease answer quality. |
| **Alternatives Considered** | Design for minimal context (4K tokens) from the start. Rejected as overly restrictive. Design for unlimited context. Rejected as unrealistic for on-premise deployment. |

---

### A-006: Technician Has Network Access to the System

| Field | Detail |
|---|---|
| **Statement** | Factory floor technicians access MechMind via a web browser or tablet application connected to the factory network. The system is hosted either on-premise (factory server) or in a private cloud. The factory floor has sufficient network connectivity to support the system. |
| **Rationale** | Most modern factories have factory LAN/Wi-Fi coverage for MES and SCADA systems. MechMind will run on the same network infrastructure. |
| **Impact if Wrong** | If the factory floor has dead zones or the network is isolated (air-gapped), a local client or offline mode would be required. The current architecture requires network access to the inference endpoint. |
| **Alternatives Considered** | Fully offline local inference using a small language model (e.g., Llama 3 8B). Technically feasible but answer quality significantly lower. Noted as a future consideration for highly restricted environments. |

---

### A-007: Single Language Model for Generation

| Field | Detail |
|---|---|
| **Statement** | A single LLM (e.g., Claude 3.5 Sonnet or GPT-4o) is used for all answer generation, including structured output, citation generation, and follow-up question suggestions. A separate model may be used for reranking (cross-encoder), but the generative layer is single-model. |
| **Rationale** | Using multiple generative models increases integration complexity and cost for a hackathon prototype. A single high-quality model is sufficient. |
| **Impact if Wrong** | If the chosen model underperforms on structured technical output, a fine-tuned or domain-specific model may be needed. |
| **Alternatives Considered** | Use a small model for simple queries and a large model for complex ones. Use a fine-tuned model for the structured output step. Deferred to production hardening. |

---

### A-008: Chunk Size Range

| Field | Detail |
|---|---|
| **Statement** | The default chunk size is 512 tokens with a 10% overlap (approximately 50 tokens). This is a starting point that may be tuned. Table rows will be chunked as atomic units regardless of token count. |
| **Rationale** | 512 tokens is a well-established default in the RAG literature that balances retrieval precision (smaller chunks are more targeted) against context completeness (the answer may span more than one chunk). Overlap prevents information loss at chunk boundaries. |
| **Impact if Wrong** | If chunks are too small, multi-step corrective procedures split across chunks may not be retrieved together. If chunks are too large, retrieval precision decreases and the LLM context window fills faster. |
| **Alternatives Considered** | Sentence-level chunking (too small for technical content). Section-level chunking (too large, imprecise retrieval). Hierarchical chunking (parent-child). Hierarchical chunking noted as a future improvement. |

---

### A-009: Concurrent Users Scale

| Field | Detail |
|---|---|
| **Statement** | The system is designed to support up to 50 concurrent users. A single factory facility with multiple shifts and machines is the target deployment scale. Multi-facility enterprise scale is out of scope for v1. |
| **Rationale** | A hackathon prototype and early production deployment are unlikely to face high concurrency. Designing for 50 concurrent users keeps infrastructure costs manageable while covering the realistic deployment scenario. |
| **Impact if Wrong** | If the system is deployed factory-wide with 200+ concurrent users, the vector store and LLM inference endpoint will need horizontal scaling. The application layer is stateless and can scale horizontally, but the vector store and LLM API rate limits are the bottleneck. |
| **Alternatives Considered** | Design for 500 concurrent users from the start (over-engineered for v1). Design for 10 (too limiting for real deployment). 50 selected as appropriate for the problem scope. |

---

### A-010: Administrators Are Trusted

| Field | Detail |
|---|---|
| **Statement** | Users with the Administrator role are trusted to upload legitimate, accurate manuals. The system does not validate the accuracy of manual content. If an administrator uploads an incorrect or tampered manual, the system will index and serve that content. |
| **Rationale** | Content validation of technical documents is beyond the scope of an automated system. Ensuring manual accuracy is an organisational process responsibility. |
| **Impact if Wrong** | A malicious or mistaken admin could poison the knowledge base with incorrect information. The citation mechanism mitigates this by making the source document traceable, allowing human verification. |
| **Alternatives Considered** | Implement a review workflow where manuals are staged before indexing. Noted as a governance enhancement for production. |

---

### A-011: No Real-Time Reindexing Required

| Field | Detail |
|---|---|
| **Statement** | Manual ingestion is a batch process triggered by an administrator upload. The system does not need to index manuals in real time as they are written. Once ingestion completes (target: under 5 minutes per manual), the content is queryable. |
| **Rationale** | Machine manuals are stable documents that change infrequently. Real-time indexing infrastructure (Kafka, streaming pipelines) is not justified. |
| **Impact if Wrong** | If manuals are frequently revised and technicians need to query the latest revision immediately, a near-real-time ingestion pipeline would be required. |
| **Alternatives Considered** | Event-driven ingestion triggered by a document management system webhook. Noted as a future integration point. |

---

### A-012: Conversation History Limited to Current Session

| Field | Detail |
|---|---|
| **Statement** | Conversation history is maintained for the duration of a user session (defined by session token validity). When a session expires or the user logs out, history is not persisted to the vector store. Conversation logs are persisted to a structured audit log only for observability purposes. |
| **Rationale** | Persisting and re-retrieving prior conversation content significantly increases system complexity. For a troubleshooting tool, most sessions are focused and short (one fault, one resolution). |
| **Impact if Wrong** | Users who want to recall a troubleshooting session from last week must search the audit log manually. If cross-session memory is required, a personal conversation store (per-user RAG index) would be needed. |
| **Alternatives Considered** | Persist all conversations to the user's personal vector store and retrieve relevant past sessions at query time. Noted as a future personalisation feature. |

---

### A-013: Relevance Threshold for Refusal

| Field | Detail |
|---|---|
| **Statement** | If the top-ranked retrieved chunk scores below a relevance threshold of 0.60 (on a 0–1 scale after reranking normalisation), the system will refuse to answer and will indicate insufficient evidence. This threshold is a configurable system parameter. |
| **Rationale** | A 0.60 threshold represents a reasonable starting point based on RAG benchmarking literature. The exact threshold requires calibration against the actual document corpus. |
| **Impact if Wrong** | Too high a threshold causes excessive refusals (false negatives — the system refuses when it could help). Too low a threshold allows low-confidence answers to pass (false positives — the system answers when it should refuse). Calibration testing during QA is required. |
| **Alternatives Considered** | Refuse only when the top chunk score is below 0.40 (more permissive). Require at least 3 chunks above 0.70 (more restrictive). The 0.60 single-chunk minimum with a secondary check (at least 2 chunks above 0.50) is the selected approach. |
