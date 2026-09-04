# MechMind — Feature Specification

**Document version:** 1.0
**Status:** Approved for MVP
**Last updated:** 2026-09-04

---

## 1. Overview

This document specifies every feature in the MechMind system, categorized by priority tier. Each feature is assigned a stable Feature ID, a clear user value statement, detailed technical requirements, acceptance criteria, and inter-feature dependencies.

Priority tiers follow MoSCoW:

| Tier | Label | Meaning |
|------|-------|---------|
| M | Must Have | Required for hackathon demo. System is non-functional without it. |
| S | Should Have | Significantly improves quality; planned for MVP completion. |
| C | Could Have | Valuable but not blocking; include only if capacity allows. |
| F | Future | Post-hackathon roadmap. Not in scope for current sprint. |

---

## 2. Must Have — Core Features (Hackathon MVP)

### FEAT-001: Manual Ingestion via File Upload

| Field | Detail |
|-------|--------|
| **Feature ID** | FEAT-001 |
| **Priority** | Must Have |
| **Name** | Manual Ingestion via File Upload |

**Description**
Administrators upload machine manual PDF files through the admin panel. The system accepts the file, validates it, stores it, and queues it for processing. The ingestion pipeline extracts text and metadata from the PDF and stores structured representations in the database.

**User Value**
Technicians can only query manuals that have been ingested. This feature is the entry point for all knowledge in the system. Without it, the RAG pipeline has no content to retrieve from.

**Technical Requirements**
- Accept PDF files up to 100 MB via multipart form upload (POST /api/ingest/upload)
- Validate MIME type (application/pdf) and file extension before processing
- Compute SHA-256 hash of file content; reject duplicates with HTTP 409 and a descriptive message
- Store raw file in configured file storage (local filesystem for hackathon; S3-compatible in production)
- Parse PDF using PyMuPDF (fitz): extract per-page text, page count, embedded fonts, and metadata fields (Title, Author, CreationDate, Subject) from PDF document metadata
- Detect and extract table structures using PyMuPDF table detection; convert tables to structured text representation
- Record ingestion job in `ingestion_jobs` table with status PENDING → PROCESSING → COMPLETE / FAILED
- Associate file with a named machine model (e.g., "AlphaBot 3000") at upload time via form field
- Support uploading a replacement/revised version of an existing manual (version bump, previous version retained)
- Emit progress events via Server-Sent Events on GET /api/ingest/status/{job_id} endpoint

**Acceptance Criteria**
- AC1: A valid PDF file is uploaded; within 60 seconds the file is fully processed and queryable
- AC2: Uploading the same file twice returns HTTP 409 with message "Manual already ingested (duplicate hash detected)"
- AC3: Uploading a non-PDF file returns HTTP 422 with validation error before any storage occurs
- AC4: A PDF with zero extractable text (scanned image PDF) marks the job as FAILED with reason "No extractable text content; OCR not enabled"
- AC5: Page count, machine name, and upload timestamp are persisted and retrievable via GET /api/admin/manuals
- AC6: Ingestion job status transitions are visible in real time via SSE endpoint

**Dependencies**
- FEAT-002 (Chunking Pipeline) — ingestion triggers chunking
- FEAT-003 (Embedding Generation) — chunking triggers embedding
- INFRA-001 (PostgreSQL schema) — job and manual metadata storage

---

### FEAT-002: Text Chunking Pipeline

| Field | Detail |
|-------|--------|
| **Feature ID** | FEAT-002 |
| **Priority** | Must Have |
| **Name** | Semantic and Hierarchical Text Chunking |

**Description**
Extracted PDF text is split into semantically coherent chunks that preserve document structure. Chunks retain their source location metadata so citations are accurate. The chunking strategy respects section boundaries, table integrity, and error code blocks rather than blindly splitting at fixed token counts.

**User Value**
Chunk quality directly determines retrieval quality. Poorly chunked content causes answers that are incomplete, incorrectly attributed, or drawn from mixed sections. Correct chunking ensures each retrieved unit is self-contained enough to be meaningful to the LLM.

**Technical Requirements**
- Primary strategy: section-aware chunking that splits at detected headings (regex on capitalization, numbering patterns, and font size metadata from PyMuPDF)
- Target chunk size: 400–600 tokens (measured using tiktoken cl100k_base tokenizer as a proxy; Gemini tokenizer not available client-side)
- Minimum chunk size: 50 tokens — discard shorter fragments unless they contain an error code pattern
- Overlap: 50-token sliding overlap between consecutive chunks from the same section to prevent context loss at boundaries
- Table chunks: preserve entire table as a single chunk regardless of size (up to 1200 tokens); prepend table title if detectable
- Error code detection: regex `[A-Z]{1,3}-?\d{2,4}` — chunks containing error codes are tagged with `contains_error_code: true` and the extracted codes in `error_codes: ["E101", "E102"]` metadata field
- Each chunk stores: `chunk_id`, `manual_id`, `machine_model`, `page_number`, `section_title`, `chunk_index`, `token_count`, `text`, `contains_error_code`, `error_codes[]`, `is_table`
- Chunking is idempotent — re-ingesting a manual deletes and recreates all its chunks

**Acceptance Criteria**
- AC1: All chunks from a 100-page manual are created with page_number and section_title populated where detectable
- AC2: No chunk exceeds 1500 tokens
- AC3: Error code chunks are correctly tagged; querying `SELECT * FROM chunks WHERE 'E101' = ANY(error_codes)` returns expected rows
- AC4: A table that spans 800 tokens is stored as a single chunk with `is_table: true`
- AC5: Re-ingesting a manual produces the same number of chunks (±5%) — validates determinism

**Dependencies**
- FEAT-001 (Manual Ingestion) — provides extracted page text
- FEAT-003 (Embedding Generation) — consumes chunks

---

### FEAT-003: Embedding Generation

| Field | Detail |
|-------|--------|
| **Feature ID** | FEAT-003 |
| **Priority** | Must Have |
| **Name** | Chunk Embedding via Google Gemini |

**Description**
Each text chunk is converted into a high-dimensional vector embedding using the Google Gemini embedding API (text-embedding-004 or equivalent). Embeddings are stored in pgvector for approximate nearest-neighbor retrieval.

**User Value**
Embeddings enable semantic search — a technician can describe a symptom in their own words and retrieve relevant content even when none of the exact words appear in the manual. This is the semantic half of hybrid retrieval.

**Technical Requirements**
- Use Google Gemini Embedding API, model `models/text-embedding-004` (768-dimensional output)
- Batch API calls: embed up to 100 chunks per API request to minimize latency and API quota consumption
- Store embedding vector in `chunks.embedding` column (pgvector `vector(768)` type)
- Task type for chunk embeddings: `RETRIEVAL_DOCUMENT`
- Task type for query embeddings at query time: `RETRIEVAL_QUERY`
- Handle API rate limits with exponential backoff: initial delay 1s, max delay 60s, max retries 5
- Track embedding status per chunk: PENDING, EMBEDDED, FAILED
- Failed chunks are logged with error message; ingestion job completes with WARNING status if any chunks fail embedding

**Acceptance Criteria**
- AC1: After ingestion of a 50-page manual, all successfully parsed chunks have non-null embedding vectors
- AC2: pgvector cosine similarity query for a known phrase returns the expected chunk in top-3 results
- AC3: API rate limit errors trigger retry with backoff; system does not crash or lose chunk state
- AC4: Embedding dimension is verified at insert time — mismatched dimensions raise an error and mark chunk as FAILED

**Dependencies**
- FEAT-002 (Chunking) — provides text to embed
- INFRA-002 (pgvector extension) — stores vectors

---

### FEAT-004: Hybrid Retrieval (BM25 + Vector)

| Field | Detail |
|-------|--------|
| **Feature ID** | FEAT-004 |
| **Priority** | Must Have |
| **Name** | Hybrid Retrieval — BM25 Keyword + pgvector Semantic |

**Description**
When a query arrives, the system retrieves candidate chunks using two parallel strategies: (1) BM25 keyword search for exact term matching, essential for error codes; (2) pgvector approximate nearest-neighbor search for semantic similarity. Results are fused using Reciprocal Rank Fusion (RRF) to produce a unified ranked candidate list.

**User Value**
Error codes like "E101" are exact strings — semantic search alone may miss exact code matches or retrieve wrong-machine results for similar codes. Keyword search alone misses natural language symptom descriptions. Hybrid retrieval is strictly better than either alone for this domain.

**Technical Requirements**
- BM25 implementation: rank-bm25 Python library; index is built in-memory per machine model at startup and rebuilt when new manuals are ingested
- BM25 tokenization: lowercase, remove punctuation except hyphens (preserve "E-101" and "E101" as equivalent), no stopword removal (short error codes are important)
- pgvector retrieval: `SELECT chunk_id, 1 - (embedding <=> query_embedding) AS score FROM chunks ORDER BY embedding <=> query_embedding LIMIT k`
- Default k: 20 for each retrieval method (40 candidates total before fusion)
- RRF formula: `score(d) = sum over methods of 1 / (rank(d) + 60)` — standard RRF with k=60
- Machine filter applied AFTER fusion: remove candidates not matching the session machine context (when known)
- Final candidate list: top 10 after fusion and machine filter
- Retrieval latency target: under 500 ms for both BM25 + vector combined

**Acceptance Criteria**
- AC1: Query "E101" returns chunks containing exactly "E101" in top-3 results
- AC2: Query "spindle making grinding noise" returns semantically relevant chunks even if none contain the word "grinding"
- AC3: RRF correctly promotes chunks that appear highly in both lists over chunks appearing in only one
- AC4: Retrieval latency under 500 ms on a dataset of 50,000 chunks on standard hardware
- AC5: When machine context is set to "AlphaBot 3000", no chunks from "ZenithBot" manuals appear in results

**Dependencies**
- FEAT-003 (Embedding Generation) — vectors must exist in pgvector
- FEAT-006 (Machine Disambiguation) — machine filter applied post-fusion

---

### FEAT-005: Machine Model Disambiguation

| Field | Detail |
|-------|--------|
| **Feature ID** | FEAT-005 |
| **Priority** | Must Have |
| **Name** | Machine Model Disambiguation and Scoping |

**Description**
The same error code (e.g., E101) can mean completely different things on different machines. The system must correctly identify which machine the technician is asking about, and scope retrieval accordingly. If the machine cannot be determined, the system asks a clarifying question rather than guessing or blending answers from multiple machines.

**User Value**
Answering E101 with a blended answer from two machines is worse than no answer — the technician may take the wrong corrective action. Disambiguation is a safety requirement, not just a UX nicety.

**Technical Requirements**
- Machine context sources (in priority order):
  1. Explicit machine field in query request payload (`machine_model` field)
  2. Session context — machine established in a prior turn and stored in Redis session
  3. Entity extraction from query text — detect machine names/model numbers using regex patterns loaded from the `machine_models` table
  4. Absence of all three → ambiguous state
- Ambiguity detection: after retrieval, if top-10 results span more than one machine model with non-trivial score distribution (both machines have at least 2 results with RRF score > 0.01), flag as ambiguous
- Ambiguous state triggers a clarification response (not an LLM generation call) with:
  - A list of machine models that have relevant content for this query
  - A prompt asking the user to specify
  - The original query stored in session for replay after disambiguation
- Once machine is confirmed, store in session under `session.machine_context`
- All subsequent queries in the session are filtered to that machine unless the user explicitly changes machine

**Acceptance Criteria**
- AC1: Query "E101" when both AlphaBot 3000 and ZenithBot have E101 entries → system returns clarification question listing both machines, no answer yet
- AC2: User responds "AlphaBot 3000" → system replays original query scoped to AlphaBot 3000 and returns correct answer
- AC3: Query "E101 on AlphaBot 3000" (explicit machine in text) → no clarification needed; correct answer returned
- AC4: Within a session where machine is established as AlphaBot 3000, query "E101" → answers from AlphaBot 3000 only, no clarification
- AC5: Disambiguation answer for AC1 must list exactly the machines that have E101 content, not all ingested machines

**Dependencies**
- FEAT-004 (Hybrid Retrieval) — retrieval must happen before ambiguity detection
- FEAT-008 (Session Management) — machine context persisted per session

---

### FEAT-006: Structured Answer with Citations

| Field | Detail |
|-------|--------|
| **Feature ID** | FEAT-006 |
| **Priority** | Must Have |
| **Name** | Structured LLM Answer with Source Citations |

**Description**
The LLM generates a structured JSON response that includes the answer text, a confidence level, a list of cited source chunks (with manual name, page number, and section), and a `has_answer` boolean. The frontend renders citations as a panel alongside the answer. Every factual claim in the answer must be traceable to a specific chunk.

**User Value**
A technician on the factory floor must be able to verify that the answer comes from the correct manual and page. Citations enable trust and allow the technician to consult the original source when needed. Structured output enables programmatic rendering, filtering, and future integrations.

**Technical Requirements**
- LLM response must conform to a strict JSON schema validated server-side before delivery
- Required JSON fields:
  - `has_answer` (boolean): false triggers graceful refusal path
  - `answer` (string): the main explanatory text, markdown-formatted
  - `steps` (array of strings, optional): numbered corrective steps when applicable
  - `confidence` (string enum): "HIGH" | "MEDIUM" | "LOW"
  - `citations` (array): each element has `chunk_id`, `manual_name`, `page_number`, `section_title`, `excerpt` (verbatim 1–2 sentence excerpt from chunk)
  - `warnings` (array of strings, optional): safety notices from the manual
  - `follow_up_suggestions` (array of strings, optional): 2–3 suggested follow-up queries
- Citation validation: every `chunk_id` in citations must exist in the database and match the manual_id used in context assembly; invalid citations cause a structured error response, not hallucinated citations
- Prompt instructs LLM to only use information from provided context and to cite every factual claim
- LLM: Google Gemini Pro or Flash; response format enforced via Gemini's response_schema parameter where available

**Acceptance Criteria**
- AC1: LLM response is valid JSON conforming to schema on every successful query
- AC2: Citations contain real chunk_ids that exist in the database
- AC3: `excerpt` field contains text that is a verbatim substring of the corresponding chunk text
- AC4: `has_answer: false` is returned when the evidence sufficiency gate determines insufficient context (FEAT-007)
- AC5: `confidence: "LOW"` is returned when evidence sufficiency score is above threshold but below high-confidence threshold
- AC6: Frontend renders answer and citation list correctly from this JSON structure

**Dependencies**
- FEAT-007 (Evidence Sufficiency Gate) — gate must pass before LLM call
- FEAT-009 (Context Assembly) — assembled context fed into prompt
- INFRA-003 (Gemini LLM client) — generation call

---

### FEAT-007: Evidence Sufficiency Gate

| Field | Detail |
|-------|--------|
| **Feature ID** | FEAT-007 |
| **Priority** | Must Have |
| **Name** | Evidence Sufficiency Gate (Hallucination Control) |

**Description**
Before calling the LLM, the system evaluates whether the retrieved evidence is sufficient to answer the query. If the evidence does not meet the sufficiency threshold, the system returns a structured refusal response without calling the LLM. This is the primary hallucination prevention mechanism — it is a pipeline gate, not a prompt instruction.

**User Value**
A confident-sounding wrong answer is more dangerous than an honest "I don't have enough information." The evidence gate ensures the system refuses to answer rather than confabulate when the retrieved chunks do not meaningfully address the query.

**Technical Requirements**
- Evidence sufficiency score is computed from:
  - `top_score`: the highest RRF score among retrieved candidates (after machine filter)
  - `coverage_score`: fraction of query tokens (excluding stopwords) found in top-5 chunks' text
  - `machine_match`: binary 1.0 if all top-3 chunks belong to the expected machine, 0.5 if mixed, 0.0 if none match
  - Final score: `0.5 * top_score + 0.3 * coverage_score + 0.2 * machine_match`
- Threshold: configurable via environment variable `EVIDENCE_THRESHOLD`, default 0.35
- High-confidence threshold: `EVIDENCE_HIGH_THRESHOLD`, default 0.65 — maps to `confidence: "HIGH"` in the response
- Below `EVIDENCE_THRESHOLD`: return `has_answer: false` response immediately, skip LLM call
- Between thresholds: call LLM with `confidence: "LOW"` flag in prompt context
- Above `EVIDENCE_HIGH_THRESHOLD`: call LLM with `confidence: "HIGH"` flag
- Refusal response format matches the standard JSON schema: `has_answer: false`, `answer: "I could not find sufficient information..."`, `citations: []`

**Acceptance Criteria**
- AC1: Query for a non-existent error code (F99 on ZenithBot, not in any manual) returns `has_answer: false` without calling the LLM (verifiable via LLM call counter metric)
- AC2: Query with abundant, directly relevant retrieved chunks returns `confidence: "HIGH"`
- AC3: Changing `EVIDENCE_THRESHOLD` to 0.9 causes most queries to return refusals (validates threshold is wired)
- AC4: Refusal response is valid JSON; `answer` field contains a human-readable explanation
- AC5: LLM call counter does not increment for queries that fail the sufficiency gate

**Dependencies**
- FEAT-004 (Hybrid Retrieval) — provides candidate chunks and scores
- FEAT-006 (Structured Answer) — refusal uses same JSON schema

---

### FEAT-008: Follow-Up Conversation (3-Turn Context)

| Field | Detail |
|-------|--------|
| **Feature ID** | FEAT-008 |
| **Priority** | Must Have |
| **Name** | Multi-Turn Follow-Up Conversation |

**Description**
After an initial answer, a technician can ask follow-up questions without repeating machine context, error code, or previous details. The system maintains a session that includes the conversation history, machine context, and the prior query's retrieved chunks. Follow-up queries are contextualized using this session state.

**User Value**
Troubleshooting is iterative. "What does E101 mean?" is followed by "How do I reset it?" and then "What tools do I need?" Re-specifying machine and error code on every turn is friction that prevents real-world adoption.

**Technical Requirements**
- Session storage: Redis with TTL of 30 minutes (configurable via SESSION_TTL_SECONDS)
- Session schema:
  - `session_id` (UUID, cookie or header)
  - `machine_model` (string, set on disambiguation or explicit selection)
  - `conversation_history` (array, max 6 messages — 3 user + 3 assistant)
  - `last_chunks` (array of chunk_ids from last successful retrieval, used to prime follow-up retrieval)
  - `pending_query` (string, stored when awaiting disambiguation)
- Follow-up query processing: prepend conversation history to query before entity extraction and retrieval; combine prior chunk_ids with new retrieval results (deduplicated, capped at 15 total)
- Maximum supported conversation turns: 3 (configurable via MAX_CONVERSATION_TURNS)
- After max turns, system notifies user the conversation context will reset on next query
- Session ID returned in response header `X-Session-Id` and set as HttpOnly cookie

**Acceptance Criteria**
- AC1: Turn 1: "What is E101 on AlphaBot 3000?" → full answer
- AC2: Turn 2: "How do I fix it?" → system uses machine context (AlphaBot 3000) and E101 from session; does not ask for clarification
- AC3: Turn 3: "What tools are needed?" → still uses session context
- AC4: Session expires after TTL; next query starts fresh
- AC5: Session stored in Redis; removing Redis causes graceful degradation (every query treated as fresh, no crash)

**Dependencies**
- FEAT-005 (Disambiguation) — machine context stored in session
- INFRA-004 (Redis) — session storage

---

### FEAT-009: Graceful Refusal

| Field | Detail |
|-------|--------|
| **Feature ID** | FEAT-009 |
| **Priority** | Must Have |
| **Name** | Graceful Refusal for Insufficient Evidence |

**Description**
When the system cannot find sufficient evidence to answer a query, it returns a helpful refusal that explains why it cannot answer, what information it would need, and what related topics it does have information about. It never fabricates an answer.

**User Value**
Technicians must be able to trust the system. A system that sometimes makes up answers is worse than one that clearly states its limitations. The refusal message should guide the technician to a better query or to consult the original manual.

**Technical Requirements**
- Triggered by FEAT-007 (evidence sufficiency gate) when score is below threshold
- Refusal response must include:
  - Clear statement that sufficient information was not found
  - The query as received (echoed back for clarity)
  - Which manuals were searched (by machine model and manual name)
  - Suggested query reformulations if applicable (generated by lightweight template logic, not LLM call)
  - Pointer to admin contact if manual may not be ingested yet
- HTTP response status: 200 (not 404); the refusal is a valid, handled system state
- Refusal responses are logged with the query, evidence score, and session_id for analysis

**Acceptance Criteria**
- AC1: Query "What is error F99 on ZenithBot?" when no ZenithBot manual is ingested → refusal with message listing ingested manuals and suggesting the manual may not be loaded
- AC2: Query with error code not present in any ingested manual → refusal with list of error codes that are available
- AC3: Refusal response matches the standard JSON schema (has_answer: false)
- AC4: No LLM call is made for refusal responses
- AC5: Refusal is logged in the `query_logs` table with `outcome: REFUSED`

**Dependencies**
- FEAT-007 (Evidence Gate) — triggers refusal
- FEAT-006 (Structured Answer) — schema is shared

---

## 3. Should Have

### FEAT-010: Confidence Score Display

| Field | Detail |
|-------|--------|
| **Feature ID** | FEAT-010 |
| **Priority** | Should Have |
| **Name** | Per-Response Confidence Score and Badge |

**Description**
Each answer is accompanied by a visible confidence indicator (HIGH / MEDIUM / LOW) derived from the evidence sufficiency score. The frontend renders this as a color-coded badge alongside the answer.

**User Value**
A LOW confidence answer should prompt the technician to double-check the manual. Displaying confidence makes the system's uncertainty legible without hiding it.

**Technical Requirements**
- Confidence derived from evidence sufficiency score (FEAT-007 thresholds)
- Frontend: badge component with green (HIGH), amber (MEDIUM), red (LOW) color coding
- Confidence value included in the standard JSON response schema

**Acceptance Criteria**
- AC1: HIGH confidence answer displays green badge
- AC2: LOW confidence answer displays red badge with tooltip "Answer based on limited evidence — verify with source manual"
- AC3: Confidence badge is visible without scrolling on desktop and mobile

**Dependencies**
- FEAT-007 (Evidence Gate) — provides confidence level
- FEAT-006 (Structured Answer) — confidence in response schema

---

### FEAT-011: Admin Dashboard

| Field | Detail |
|-------|--------|
| **Feature ID** | FEAT-011 |
| **Priority** | Should Have |
| **Name** | Admin Manual Management Dashboard |

**Description**
A web UI for administrators to upload manuals, view ingestion status, see per-manual metadata (page count, chunk count, error codes indexed), and delete or replace manuals.

**User Value**
Without a management UI, the admin must interact via API calls. The dashboard makes the system operable without technical expertise.

**Technical Requirements**
- Displays list of all ingested manuals with: name, machine model, version, upload date, page count, chunk count, ingestion status
- Allows uploading new manual via drag-and-drop or file picker
- Shows real-time ingestion progress via SSE
- Allows deleting a manual (with confirmation) — cascades to delete all associated chunks and embeddings
- Allows viewing the list of error codes indexed per manual

**Acceptance Criteria**
- AC1: All ingested manuals visible in dashboard within 2 seconds of page load
- AC2: Uploading a manual via dashboard triggers ingestion; status updates in real time
- AC3: Deleting a manual removes it from retrieval immediately

**Dependencies**
- FEAT-001 (Manual Ingestion) — uploads go through same backend endpoint

---

### FEAT-012: Manual Versioning

| Field | Detail |
|-------|--------|
| **Feature ID** | FEAT-012 |
| **Priority** | Should Have |
| **Name** | Manual Version Management |

**Description**
When a revised version of a manual is uploaded for the same machine, the system retains the previous version and activates the new one. Queries are answered from the active version. Admins can view version history and roll back if needed.

**User Value**
Machine manuals are updated when firmware changes or new error codes are added. The system must reflect current documentation.

**Technical Requirements**
- Manual record has `version` integer and `is_active` boolean
- New upload for same machine + same manual name creates new version, marks previous as inactive
- Retrieval uses `WHERE is_active = true` filter
- Admin can activate any previous version

**Acceptance Criteria**
- AC1: Uploading V2 of a manual while V1 is active → V1 status becomes INACTIVE, V2 becomes ACTIVE
- AC2: Queries after upload use V2 chunks only
- AC3: Admin can view both versions and manually activate V1 — retrieval switches back

**Dependencies**
- FEAT-001 (Manual Ingestion)
- FEAT-011 (Admin Dashboard)

---

### FEAT-013: Ingestion Processing Status API

| Field | Detail |
|-------|--------|
| **Feature ID** | FEAT-013 |
| **Priority** | Should Have |
| **Name** | Real-Time Ingestion Status API |

**Description**
Provides a real-time status feed for ingestion jobs via Server-Sent Events and a polling endpoint. Exposes per-stage progress: file validated, pages extracted, chunks created, embeddings generated.

**User Value**
Ingesting a 200-page manual takes time. Without status feedback, admins assume the system is broken when it is merely processing.

**Technical Requirements**
- GET /api/ingest/status/{job_id} returns SSE stream with events: `stage_update`, `progress`, `complete`, `error`
- GET /api/ingest/jobs returns list of all jobs with current status (polling alternative)
- Each SSE event includes: `stage` (enum), `progress_pct` (0–100), `message` (human-readable)

**Acceptance Criteria**
- AC1: SSE stream receives at least 4 distinct stage events during a full ingestion
- AC2: `complete` event fires when all chunks are embedded
- AC3: `error` event fires and stream closes if any stage fails

**Dependencies**
- FEAT-001 (Manual Ingestion)

---

## 4. Could Have

### FEAT-014: OCR for Scanned PDFs

| Field | Detail |
|-------|--------|
| **Feature ID** | FEAT-014 |
| **Priority** | Could Have |
| **Name** | OCR Pipeline for Image-Based PDFs |

**Description**
Some older machine manuals exist only as scanned image PDFs with no embedded text. An OCR pipeline (using Tesseract or Google Document AI) extracts text from these documents before the normal chunking pipeline runs.

**User Value**
Without OCR, a significant portion of factory-floor documentation is inaccessible to the system.

**Technical Requirements**
- Detect scanned PDF: text extraction yields < 10 characters per page on average → trigger OCR
- OCR engine: Tesseract 5 as default; Google Document AI as optional high-quality alternative
- OCR output merged into normal page text pipeline; downstream chunking unchanged
- OCR latency can be high (minutes for large documents); job status must reflect this

**Acceptance Criteria**
- AC1: A scanned 50-page PDF with no embedded text is processed and returns queryable chunks
- AC2: OCR output quality sufficient for error code detection (99%+ accuracy on clear scans)

**Dependencies**
- FEAT-001 (Manual Ingestion)
- FEAT-002 (Chunking)

---

### FEAT-015: Cross-Encoder Reranking

| Field | Detail |
|-------|--------|
| **Feature ID** | FEAT-015 |
| **Priority** | Could Have |
| **Name** | Cross-Encoder Reranking for Precision Improvement |

**Description**
After hybrid retrieval and RRF fusion, a cross-encoder model rescores the top-N candidates by jointly encoding the query and each candidate chunk. This produces significantly more precise relevance scores than bi-encoder retrieval alone.

**User Value**
Reranking pushes the most precisely relevant chunks to the top, improving answer quality for complex natural language queries where retrieval order matters.

**Technical Requirements**
- Model: `cross-encoder/ms-marco-MiniLM-L-6-v2` (sentence-transformers library)
- Input: query string + chunk text pairs
- Rerank top-15 candidates from RRF; return top-5 for context assembly
- Latency: under 300 ms for 15 candidates on CPU

**Acceptance Criteria**
- AC1: With reranking enabled, NDCG@5 improves by measurable margin on test query set
- AC2: Reranking adds less than 300 ms to total query latency

**Dependencies**
- FEAT-004 (Hybrid Retrieval) — provides candidates to rerank

---

### FEAT-016: Table-Aware Chunking

| Field | Detail |
|-------|--------|
| **Feature ID** | FEAT-016 |
| **Priority** | Could Have |
| **Name** | Table-Aware Chunk Extraction |

**Description**
Machine manuals often have error code tables (code, description, action). Table-aware chunking detects these structures and creates one chunk per table row or per logical table block, preserving the association between code, description, and recommended action.

**User Value**
A table row chunk is far more precise for error code queries than a chunk containing a full paragraph that happens to mention several codes.

**Technical Requirements**
- Use PyMuPDF table detection API to identify tables per page
- For error code tables: create one chunk per row with structured text format: "Error Code: E101 | Description: Motor overload | Action: Check motor wiring and fuse"
- Tag these chunks with `is_table_row: true` and `table_row_error_code: "E101"`

**Acceptance Criteria**
- AC1: Error code table with 20 rows produces 20 separate chunks, each containing exactly one code
- AC2: Querying a specific error code returns its table-row chunk in top-1 result

**Dependencies**
- FEAT-001 (Manual Ingestion)
- FEAT-002 (Chunking)

---

## 5. Future Features (Post-Hackathon Roadmap)

### FEAT-017: Voice Query Input

| Field | Detail |
|-------|--------|
| **Feature ID** | FEAT-017 |
| **Priority** | Future |
| **Name** | Voice Query Input for Hands-Free Factory Use |

**Description**
Technicians on the factory floor often have hands occupied with tools. Voice input allows them to speak a query and have it transcribed before routing through the normal RAG pipeline.

**Technical Requirements** (preliminary)
- Browser-based Web Speech API or integration with Google Speech-to-Text
- Transcription → text query → normal pipeline with no changes required downstream

---

### FEAT-018: Multilingual Query Support

| Field | Detail |
|-------|--------|
| **Feature ID** | FEAT-018 |
| **Priority** | Future |
| **Name** | Multilingual Query and Answer |

**Description**
Factories may have technicians who speak Spanish, German, French, or other languages. The system should detect query language and either translate queries to English for retrieval (if manuals are in English) or support multilingual embeddings.

---

### FEAT-019: Diagram and Image Retrieval

| Field | Detail |
|-------|--------|
| **Feature ID** | FEAT-019 |
| **Priority** | Future |
| **Name** | Diagram and Technical Image Retrieval |

**Description**
Machine manuals contain wiring diagrams, part schematics, and assembly illustrations. A multimodal retrieval pipeline would allow the system to return relevant diagrams alongside text answers.

---

### FEAT-020: Live Machine Sensor Integration

| Field | Detail |
|-------|--------|
| **Feature ID** | FEAT-020 |
| **Priority** | Future |
| **Name** | Real-Time Machine Sensor Data Integration |

**Description**
Integration with factory IoT platforms allows the system to automatically detect active error codes from machine sensor feeds and pre-populate queries. Enables proactive troubleshooting before a technician manually reports an error.

---

*End of Feature Specification*
