# MechMind — Component Architecture

**Document version:** 1.0
**Status:** Approved
**Last updated:** 2026-09-04

---

## 1. Overview

This document describes each component of the MechMind system in detail: responsibility, inputs, outputs, dependencies, and failure behavior. Components are organized by layer: API, RAG Pipeline, Storage, Background Workers, and Frontend.

---

## 2. API Layer (FastAPI)

The API layer is the entry point for all external requests. It is built with FastAPI, using async/await throughout. Each router is a separate Python module. Dependency injection provides database connections, Redis clients, and service instances to route handlers.

### 2.1 Router: /api/ingest

**Responsibility:** Accept PDF uploads, validate files, enqueue ingestion jobs, return job IDs and status.

**Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/ingest/upload | Upload a PDF manual with machine_model form field |
| GET | /api/ingest/status/{job_id} | SSE stream of ingestion job progress |
| GET | /api/ingest/jobs | List all ingestion jobs (polling alternative to SSE) |

**Inputs:** multipart/form-data (file + machine_model string), session context (not required)
**Outputs:** `{job_id: UUID, status: PENDING}` on upload; SSE events on status stream
**Dependencies:** File storage service, PostgreSQL (manuals + ingestion_jobs tables), ingestion background task
**Failure behavior:** Validation failures return HTTP 422 with field-level error detail. Storage write failure returns HTTP 500 with job_id set to null; does not persist a broken job record.

---

### 2.2 Router: /api/query

**Responsibility:** Accept natural language queries, route through the full RAG pipeline, return structured JSON answers.

**Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/query | Submit a query; returns structured answer or refusal |

**Inputs:**
```json
{
  "query": "string (required)",
  "machine_model": "string (optional, overrides session)",
  "session_id": "UUID (optional)"
}
```
**Outputs:** `StructuredAnswer` JSON (has_answer, answer, steps, confidence, citations, warnings, follow_up_suggestions)
**Dependencies:** All RAG pipeline components (see Section 3), Redis (sessions), PostgreSQL (chunk retrieval)
**Failure behavior:** LLM API failure returns HTTP 200 with `has_answer: false` and error_type: LLM_ERROR. Evidence gate failure returns HTTP 200 with `has_answer: false`. Internal server errors return HTTP 500 and are logged.

---

### 2.3 Router: /api/conversation

**Responsibility:** Session management — create sessions, get session state, clear session.

**Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/conversation/session | Create new session; returns session_id |
| GET | /api/conversation/session/{session_id} | Get current session state |
| DELETE | /api/conversation/session/{session_id} | Clear session / reset conversation |
| POST | /api/conversation/disambiguate | Submit machine selection after clarification question |

**Inputs:** session_id (header or body), machine_model (for disambiguate endpoint)
**Outputs:** Session state JSON, or confirmation of session creation/deletion
**Dependencies:** Redis (session store)
**Failure behavior:** Redis unavailable → session creation returns a session_id that is not persisted; system operates in stateless mode. DELETE on non-existent session returns HTTP 404.

---

### 2.4 Router: /api/admin

**Responsibility:** Administrative operations: manual management, re-ingestion, deletion.

**Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/admin/manuals | List all ingested manuals with metadata |
| GET | /api/admin/manuals/{manual_id} | Get detailed info for one manual (chunks, error codes) |
| DELETE | /api/admin/manuals/{manual_id} | Delete manual + all its chunks + embeddings |
| PUT | /api/admin/manuals/{manual_id}/activate | Activate a specific manual version |
| GET | /api/admin/error-codes | List all error codes across all active manuals |

**Inputs:** manual_id path parameter; authentication headers (no auth in MVP)
**Outputs:** Manual metadata JSON, deletion confirmation, error code list
**Dependencies:** PostgreSQL (manuals, chunks tables)
**Failure behavior:** Delete operation is transactional; if chunk deletion fails, manual record is not deleted. Returns HTTP 500 with transaction rollback notification.

---

### 2.5 Router: /api/health

**Responsibility:** Health and readiness checks for orchestration and monitoring.

**Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Basic liveness check |
| GET | /api/health/ready | Readiness check: verifies DB + Redis connectivity |
| GET | /api/health/metrics | Basic metrics: chunk count, query count, average latency |

**Inputs:** None
**Outputs:** `{status: "ok", timestamp: ISO8601}` for health; dependency check results for readiness
**Dependencies:** PostgreSQL, Redis (for readiness check)
**Failure behavior:** Returns HTTP 503 if any dependency check fails in /ready. /health always returns 200 (process is alive).

---

## 3. RAG Pipeline Components

All pipeline components are Python classes instantiated at application startup and injected via FastAPI's dependency injection. They are stateless (session state lives in Redis, not in component instances).

### 3.1 QueryAnalyzer

**Responsibility:** Parse and classify the incoming query. Extract structured signals from free text.

**Inputs:** `query: str`, `machine_models: List[str]` (loaded from DB at startup)
**Outputs:**
```python
QueryContext(
    query=str,
    query_type=Enum[ERROR_CODE, NATURAL_LANGUAGE, HYBRID],
    detected_error_codes=List[str],   # e.g., ["E101", "E-101"]
    detected_machine=Optional[str],    # machine model name if found in text
    normalized_query=str               # lowercased, whitespace-normalized
)
```
**Dependencies:** `machine_models` table data (loaded at startup); regex pattern library
**Failure behavior:** Always returns a QueryContext; if detection fails, query_type defaults to NATURAL_LANGUAGE and detected fields are empty lists.

---

### 3.2 EmbeddingService

**Responsibility:** Generate vector embeddings for both chunks (ingestion, RETRIEVAL_DOCUMENT task) and queries (query, RETRIEVAL_QUERY task). Single class handles both with task_type parameter.

**Inputs:** `texts: List[str]`, `task_type: Enum[RETRIEVAL_DOCUMENT, RETRIEVAL_QUERY]`
**Outputs:** `List[List[float]]` — list of 768-dimensional float arrays (one per input text)
**Dependencies:** Google Gemini API (`google-generativeai` SDK)
**Failure behavior:**
- Rate limit (429): exponential backoff, initial 1s, max 60s, 5 retries
- API error (5xx): retry twice; on persistent failure raise `EmbeddingServiceError`
- Query-time failure: catch `EmbeddingServiceError` in query router; signal `bm25_only_mode` to retrievers
- Ingestion-time failure: mark affected chunks as EMBEDDING_FAILED; continue with remaining chunks; job completes with WARNING

---

### 3.3 BM25Retriever

**Responsibility:** Keyword-based retrieval using the BM25 ranking algorithm. Operates on an in-memory index built from all active embedded chunks.

**Inputs:** `query: str`, `machine_model: Optional[str]`, `k: int = 20`
**Outputs:** `List[RetrievalResult(chunk_id, bm25_score, rank)]`
**Dependencies:** `rank-bm25` library; `ChunkStore` (in-memory cache of chunk texts, keyed by chunk_id); rebuilt on each new manual ingestion
**Failure behavior:** If index is empty (no manuals ingested), returns empty list. If index rebuild fails, logs error and continues with stale index.

**Index structure:**
```
BM25Index:
  full_index:  BM25Okapi over all active chunks
  per_machine: Dict[machine_model, BM25Okapi]  # for machine-filtered queries
  chunk_id_map: List[chunk_id]  # maps BM25 result index → chunk_id
```

---

### 3.4 VectorRetriever

**Responsibility:** Semantic retrieval using pgvector approximate nearest-neighbor search.

**Inputs:** `query_vector: List[float]`, `machine_model: Optional[str]`, `k: int = 20`
**Outputs:** `List[RetrievalResult(chunk_id, similarity_score, rank)]`
**Dependencies:** PostgreSQL + pgvector extension; asyncpg connection pool
**Query executed:**
```sql
SELECT chunk_id, 1 - (embedding <=> $1::vector) AS score
FROM chunks
WHERE is_active = true
  AND ($2::text IS NULL OR machine_model = $2)
ORDER BY embedding <=> $1::vector
LIMIT $3;
```
**Failure behavior:** PostgreSQL connection failure → raise `VectorRetrievalError`; caller falls back to BM25-only mode. Query timeout (default 2s) → same error path.

---

### 3.5 ResultFuser

**Responsibility:** Merge ranked lists from BM25 and vector retrieval using Reciprocal Rank Fusion.

**Inputs:** `bm25_results: List[RetrievalResult]`, `vector_results: List[RetrievalResult]`, `rrf_k: int = 60`
**Outputs:** `List[FusedResult(chunk_id, rrf_score)]` sorted descending by rrf_score
**Dependencies:** None (pure computation)
**Algorithm:**
```
for each unique chunk_id in union(bm25, vector):
    rank_bm25 = rank in bm25 list, or infinity if not present
    rank_vector = rank in vector list, or infinity if not present
    rrf_score = 1/(rank_bm25 + rrf_k) + 1/(rank_vector + rrf_k)
sort descending by rrf_score
return top 20
```
**Failure behavior:** If one list is empty (retrieval failure), operates on the remaining list; RRF degrades to single-list ranking (equivalent to original ranking of the available list).

---

### 3.6 MachineFilter

**Responsibility:** Post-fusion filter that removes candidates from non-matching machines when machine context is known.

**Inputs:** `candidates: List[FusedResult]`, `machine_model: Optional[str]`
**Outputs:** `List[FusedResult]` (filtered subset, or original list if machine_model is None)
**Dependencies:** PostgreSQL (fetch chunk machine_model if not already in FusedResult metadata)
**Failure behavior:** If machine_model is None, returns unmodified list. If DB fetch fails to get chunk machine_model, log warning and do not filter that chunk (safe default: include rather than exclude).

---

### 3.7 CrossEncoderReranker

**Responsibility:** Rerank top-N candidates using a cross-encoder that jointly encodes query and chunk text. Produces more precise relevance scores than bi-encoder retrieval.

**Inputs:** `query: str`, `candidates: List[FusedResult]` (top 15), chunk texts (fetched from DB or cache)
**Outputs:** `List[RankedResult]` (top 10, reordered by cross-encoder score)
**Dependencies:** `sentence-transformers` library; model `cross-encoder/ms-marco-MiniLM-L-6-v2` (loaded at startup, cached in memory)
**Failure behavior:** If model fails to load at startup, log critical error and disable reranking (fall back to RRF order). If inference fails mid-query, return original RRF-ordered list without reranking (logged as WARNING).
**Enabled:** Only when `ENABLE_RERANKING=true` environment variable is set.

---

### 3.8 AmbiguityDetector

**Responsibility:** Determine whether the top candidate chunks represent a genuinely ambiguous query (multiple machines with relevant results) when machine context is not established.

**Inputs:** `candidates: List[FusedResult]` with machine_model metadata, `machine_model_context: Optional[str]`
**Outputs:**
```python
AmbiguityResult(
    is_ambiguous=bool,
    machines_found=List[str],  # machine models in top results
    machine_scores=Dict[str, float]  # aggregate RRF score per machine
)
```
**Logic:**
```
if machine_model_context is set:
    return AmbiguityResult(is_ambiguous=False)
machines = distinct machine_model values in top 10 candidates
if len(machines) > 1:
    per-machine count of candidates with rrf_score > 0.01
    if >= 2 machines each have >= 2 qualifying candidates:
        return is_ambiguous=True, machines_found=[list]
return is_ambiguous=False
```
**Failure behavior:** On detection error, return `is_ambiguous=False` (prefer answering to spurious clarification loops).

---

### 3.9 EvidenceValidator

**Responsibility:** Compute evidence sufficiency score and determine whether retrieved evidence is adequate to generate an answer. This is the hallucination gate.

**Inputs:** `candidates: List[FusedResult]` (post-filter, post-rerank), `query: str`, `machine_model_context: Optional[str]`
**Outputs:**
```python
EvidenceAssessment(
    sufficiency_score=float,          # 0.0 to 1.0
    confidence_level=Enum[HIGH, MEDIUM, LOW, INSUFFICIENT],
    should_answer=bool
)
```
**Score formula:**
```
top_score       = rrf_score of rank-1 candidate, normalized to [0,1]
coverage_score  = fraction of query tokens (excl. stopwords) found in top-5 chunks text
machine_match   = 1.0 if all top-3 from correct machine, 0.5 if mixed, 0.0 if none match

sufficiency_score = 0.5 * top_score + 0.3 * coverage_score + 0.2 * machine_match

INSUFFICIENT : score < EVIDENCE_THRESHOLD (default 0.35)
LOW          : EVIDENCE_THRESHOLD <= score < EVIDENCE_HIGH_THRESHOLD (default 0.65)
HIGH         : score >= EVIDENCE_HIGH_THRESHOLD
```
**Failure behavior:** On computation error, default to LOW confidence and `should_answer=True` (lean toward answering rather than refusing on error).

---

### 3.10 ContextAssembler

**Responsibility:** Fetch full chunk content from database for the top-K candidates and format as numbered context blocks for inclusion in the prompt.

**Inputs:** `candidates: List[RankedResult]` (top 5), `conversation_history: List[Message]`
**Outputs:** `AssembledContext(context_text: str, chunk_metadata: List[ChunkMeta])`
**Format of context_text:**
```
[Context 1 — AlphaBot 3000 Operations Manual, p.34, Chapter 5: Error Codes]
E101 — Motor Overload Fault: The motor current has exceeded the rated threshold...
[/Context 1]

[Context 2 — AlphaBot 3000 Operations Manual, p.35, Chapter 5: Error Codes]
To clear E101: First, stop the machine immediately...
[/Context 2]
```
**Dependencies:** PostgreSQL (fetch chunk text by chunk_id); Redis (fetch conversation_history from session)
**Failure behavior:** If a chunk cannot be fetched (deleted between retrieval and assembly), skip it and log. If fewer than 2 chunks assembled, flag as LOW evidence (re-evaluate should_answer).

---

### 3.11 PromptBuilder

**Responsibility:** Construct the full prompt to be sent to the LLM. Combines system instructions, context blocks, conversation history, and the current query. Includes the JSON schema specification in the prompt.

**Inputs:** `assembled_context: AssembledContext`, `query: str`, `confidence_level: Enum`, `machine_model: Optional[str]`
**Outputs:** `Prompt(system_message: str, user_message: str)`
**System message contains:**
- Role: Expert machine technician assistant
- Instruction: Answer only from provided context; cite every factual claim with chunk source
- Output format: JSON schema specification with field definitions
- Confidence calibration: if LOW confidence, hedge language; if HIGH, be direct
- Machine scope: if machine_model is set, reminder to scope answer to that machine only
**Failure behavior:** Always produces a prompt; no failure path. Prompt quality degrades gracefully if context is sparse.

---

### 3.12 LLMClient

**Responsibility:** Send the formatted prompt to the Gemini API and return the raw response text.

**Inputs:** `prompt: Prompt`, `response_schema: dict` (JSON schema for Gemini structured output)
**Outputs:** `str` (raw JSON string from LLM)
**Configuration:**
- Model: `gemini-1.5-flash` (default) or `gemini-1.5-pro` (configurable via `GEMINI_MODEL`)
- `response_mime_type`: `"application/json"`
- `response_schema`: Gemini schema object matching StructuredAnswer schema
- Timeout: 30 seconds
**Dependencies:** `google-generativeai` SDK; `GEMINI_API_KEY` environment variable
**Failure behavior:**
- Timeout → raise `LLMTimeoutError`; caller returns error response without retry
- API error (4xx auth) → raise `LLMAuthError`; log critical; caller returns error response
- API error (5xx) → retry once after 2s; on persistent failure raise `LLMAPIError`
- All LLM errors → caller returns `{has_answer: false, error_type: "LLM_ERROR"}` — no fallback generation

---

### 3.13 OutputParser

**Responsibility:** Parse the LLM's raw JSON string into a validated `StructuredAnswer` object. Retry with a simplified prompt on parse failure.

**Inputs:** `raw_json: str`, `prompt: Prompt` (for retry), `retry_count: int = 0`
**Outputs:** `StructuredAnswer` (validated Pydantic model)
**Validation:** Pydantic model validation against StructuredAnswer schema; checks all required fields present and correct types
**Retry logic:** On `JSONDecodeError` or Pydantic `ValidationError`, rebuild prompt with explicit JSON repair instruction ("Your previous response was not valid JSON. Respond only with the JSON object.") and retry LLM call. Max 2 retries.
**Failure behavior:** After 2 retries, return `ErrorResponse(has_answer=False, error_type="PARSE_ERROR")`.

---

### 3.14 CitationMapper

**Responsibility:** Enrich the citations in a `StructuredAnswer` by validating chunk_ids and fetching full metadata. Verify excerpt accuracy.

**Inputs:** `answer: StructuredAnswer`, connection to PostgreSQL
**Outputs:** `StructuredAnswer` with enriched citations (manual_name, page_number, section_title, verified excerpt)
**Validation per citation:**
1. `chunk_id` exists in `chunks` table → if not: remove citation, log WARNING
2. `excerpt` is a substring of `chunks.text` → if not: replace excerpt with correct verbatim excerpt (first 300 chars), log WARNING
3. `manual_name` matches `manuals.name` for the chunk's manual_id → if not: correct it from DB
**Failure behavior:** If all citations are removed (all invalid), downgrade `confidence` to LOW and add `warnings: ["Citations could not be verified"]`. Never surface an invalid citation.

---

## 4. Storage Layer

### 4.1 PostgreSQL Tables

#### `manuals`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Manual display name |
| machine_model | TEXT | Associated machine model |
| version | INTEGER | Version number (1-indexed) |
| file_hash | TEXT | SHA-256 hex digest; unique constraint |
| file_path | TEXT | Storage path to raw PDF |
| page_count | INTEGER | Total pages extracted |
| chunk_count | INTEGER | Count of successfully embedded chunks |
| is_active | BOOLEAN | Whether this version is active for retrieval |
| upload_timestamp | TIMESTAMPTZ | When the file was uploaded |
| ingestion_status | ENUM | PENDING, PROCESSING, COMPLETE, FAILED, WARNING |

#### `chunks`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| manual_id | UUID | FK → manuals.id |
| machine_model | TEXT | Denormalized from manual; used in WHERE filters |
| page_number | INTEGER | Source page in the PDF |
| section_title | TEXT | Detected section heading |
| chunk_index | INTEGER | Chunk order within manual |
| text | TEXT | Full chunk text |
| token_count | INTEGER | Approximate token count |
| contains_error_code | BOOLEAN | True if error code pattern detected |
| error_codes | TEXT[] | Array of detected error code strings |
| is_table | BOOLEAN | True if chunk is a preserved table |
| is_active | BOOLEAN | Matches parent manual's is_active |
| embedding | vector(768) | pgvector embedding column |
| embedding_status | ENUM | PENDING, EMBEDDED, FAILED |

Index: `HNSW (embedding vector_cosine_ops)` on chunks where embedding_status = EMBEDDED.
Index: `GIN (error_codes)` for fast error code lookup.
Index: `(machine_model, is_active)` for filtered queries.

#### `ingestion_jobs`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key; returned as job_id to client |
| manual_id | UUID | FK → manuals.id |
| status | ENUM | PENDING, PROCESSING, COMPLETE, FAILED, WARNING |
| current_stage | TEXT | Human-readable stage name |
| progress_pct | INTEGER | 0–100 |
| error_message | TEXT | Error description if status is FAILED |
| started_at | TIMESTAMPTZ | When processing began |
| completed_at | TIMESTAMPTZ | When processing ended |

#### `machine_models`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Canonical model name (e.g., "AlphaBot 3000") |
| aliases | TEXT[] | Alternative names/abbreviations for entity extraction |

#### `query_logs`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| session_id | UUID | Session that submitted the query |
| query | TEXT | Raw query string |
| machine_model | TEXT | Machine context at query time |
| outcome | ENUM | ANSWERED, REFUSED, DISAMBIGUATED, ERROR |
| evidence_score | FLOAT | Computed sufficiency score |
| confidence_level | ENUM | HIGH, MEDIUM, LOW, INSUFFICIENT |
| latency_ms | INTEGER | Total query processing time |
| llm_called | BOOLEAN | Whether LLM was invoked |
| timestamp | TIMESTAMPTZ | Query submission time |

---

### 4.2 Redis Session Schema

Key: `session:{session_id}` (UUID string)
TTL: 30 minutes (reset on each query within the session)
Value: JSON object

```json
{
  "session_id": "uuid",
  "machine_model": "AlphaBot 3000",
  "conversation_history": [
    {"role": "user", "content": "What is E101?"},
    {"role": "assistant", "content": "E101 is Motor Overload Fault..."}
  ],
  "pending_query": "What is error E101?",
  "last_chunk_ids": ["chunk-uuid-1", "chunk-uuid-2"],
  "turn_count": 2,
  "created_at": "ISO8601",
  "last_activity_at": "ISO8601"
}
```

---

## 5. Background Workers

### 5.1 Ingestion Job Queue

**MVP implementation:** FastAPI `BackgroundTasks` — the ingestion task is enqueued immediately after file upload validation and runs in the same process.

**Production implementation:** Celery worker pool with Redis as message broker. Multiple worker instances can process ingestion jobs concurrently.

**Task stages (each updates ingestion_jobs.current_stage and progress_pct):**

| Stage | progress_pct | Description |
|-------|-------------|-------------|
| FILE_VALIDATED | 5 | File stored, hash verified |
| PARSING | 15 | PyMuPDF extraction running |
| CHUNKING | 40 | Semantic chunker running |
| ENRICHING | 50 | Metadata enrichment complete |
| EMBEDDING | 90 | Gemini embedding API calls (longest stage) |
| INDEXING | 95 | pgvector insert, BM25 index rebuild |
| COMPLETE | 100 | All chunks embedded and queryable |

**Failure handling:** On any stage failure, update job status to FAILED, set error_message, and stop. Do not continue to subsequent stages.

---

### 5.2 Embedding Batch Processor

**Responsibility:** Within the ingestion job, process chunks in batches of 100 for embedding API efficiency.

**Inputs:** List of `EnrichedChunk` objects
**Behavior:**
- Group chunks into batches of 100
- For each batch: call EmbeddingService.embed_batch()
- On success: write vectors to DB, update chunk embedding_status = EMBEDDED
- On API error: retry batch (max 3 times with backoff); on persistent failure: mark batch chunks as EMBEDDING_FAILED; continue with next batch
- After all batches: count EMBEDDED vs EMBEDDING_FAILED; if > 20% failed, set job status to WARNING; otherwise COMPLETE

---

## 6. Frontend Components

All frontend components are React functional components in TypeScript. State management uses React's built-in useState/useContext; no Redux or Zustand in MVP. API calls use native fetch with typed response parsing against the StructuredAnswer schema.

### 6.1 ChatInterface

**Responsibility:** The primary technician-facing UI. Renders the conversation thread and handles query submission.

**State:** `messages: Message[]`, `isLoading: bool`, `session_id: string | null`
**Inputs (user):** Text query via input field; Enter key or Send button submission
**Outputs:** API call to POST /api/query; appends response to message thread
**Child components:** MessageBubble (per message), CitationPanel (per assistant message with citations), DisambiguationCard (on clarification required), RefusalCard (on has_answer: false)
**Failure behavior:** On API error, show an inline error message in the message thread: "Failed to get a response. Please try again." Do not crash.

---

### 6.2 ManualUploadPanel

**Responsibility:** Admin UI for uploading new manuals. Drag-and-drop + file picker; machine model selection; real-time progress.

**State:** `uploadState: IDLE | UPLOADING | PROCESSING | COMPLETE | FAILED`, `job_id: string | null`, `progress: number`
**Inputs (user):** PDF file via drag/drop or file picker; machine_model text input; Submit button
**Behavior:**
- Client-side validation: file must be .pdf; size displayed; machine_model must be non-empty
- On submit: POST /api/ingest/upload; get job_id in response
- Open SSE connection to GET /api/ingest/status/{job_id}
- Render progress bar driven by SSE progress_pct events
- On COMPLETE event: show success state; trigger ManualList refresh
- On ERROR event: show error message from SSE event data
**Failure behavior:** If SSE connection drops, fall back to polling GET /api/ingest/jobs every 5 seconds.

---

### 6.3 CitationPanel

**Responsibility:** Render a collapsible panel listing all citations for an answer. Each citation shows manual name, page number, section, and excerpt.

**Props:** `citations: Citation[]` (from StructuredAnswer)
**Rendering:**
- Panel header: "Sources (N)" with expand/collapse toggle
- Each citation: manual name in bold, "p. {page_number}" and section_title as subtitle, excerpt in italic monospace
- Hovering a citation in the chat text highlights the corresponding panel entry
**Failure behavior:** If citations is empty, panel is not rendered. If citation data is missing a field, render the available fields and omit the missing one.

---

### 6.4 MachineSelector

**Responsibility:** Dropdown or autocomplete input for the technician to set or change machine context before submitting a query. Also displayed as option buttons in the DisambiguationCard.

**Props:** `machines: string[]` (fetched from GET /api/admin/manuals at load time), `onSelect: (machine: string) => void`
**State:** `selected: string | null`
**Behavior:** On selection, stores choice in component state and passes to ChatInterface as machine_model for the next query. Resets on session clear.
**Failure behavior:** If machine list fetch fails, show a free-text input field as fallback.

---

### 6.5 ConfidenceBadge

**Responsibility:** Small color-coded badge displayed alongside each answer showing HIGH / MEDIUM / LOW confidence.

**Props:** `confidence: "HIGH" | "MEDIUM" | "LOW"`
**Rendering:**
- HIGH: green background, "HIGH CONFIDENCE" text
- MEDIUM: amber background, "MEDIUM CONFIDENCE" text, tooltip: "Answer is based on partial evidence"
- LOW: red background, "LOW CONFIDENCE" text, tooltip: "Answer based on limited evidence — verify with source manual"
**Failure behavior:** If confidence is undefined, render nothing (do not crash).

---

### 6.6 DisambiguationCard

**Responsibility:** Render the clarification UI when the system cannot determine machine context. Shows machine options as selectable buttons. Stores the user's selection and triggers the disambiguation API call.

**Props:** `candidateMachines: string[]`, `pendingQuery: string`, `sessionId: string`, `onResolved: () => void`
**Behavior:**
- Render a card: "This query matches multiple machines. Which machine are you working on?"
- Display one button per machine in candidateMachines
- On button click: POST /api/conversation/disambiguate with {session_id, machine_model}; call onResolved() which triggers query replay
**Failure behavior:** If disambiguate API call fails, show retry button. Do not silently drop the disambiguation state.

---

### 6.7 AdminDashboard

**Responsibility:** Aggregated admin view showing all ingested manuals, their status, and actions (delete, view details, upload new version).

**State:** `manuals: Manual[]`, `loading: bool`
**Data:** Fetched from GET /api/admin/manuals on mount; refreshed after any upload completes
**Columns in manual list:** Name, Machine Model, Version, Status badge, Page Count, Chunk Count, Upload Date, Actions
**Actions per row:** View Details (expands to show error codes, per-chunk status), Delete (confirmation modal), Upload New Version (opens ManualUploadPanel in replace mode)
**Failure behavior:** On fetch failure, show error state with retry button. Table does not auto-refresh if fetch fails.

---

*End of Component Architecture*
