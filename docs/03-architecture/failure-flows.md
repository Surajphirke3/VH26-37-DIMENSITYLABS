# MechMind — Failure Flows

**Document version:** 1.0
**Status:** Approved
**Last updated:** 2026-09-04

---

## 1. Overview

This document describes every significant failure scenario in the MechMind system: what triggers it, how it is detected, how the system responds internally, what the user sees, and how the system recovers. Each scenario is documented to ensure consistent, predictable behavior under failure conditions.

**Design principles applied throughout:**
- No failure causes a fabricated answer. Failure states return `has_answer: false` or error responses, never invented content.
- User-facing messages are always in plain language, never stack traces or internal error details.
- Failures in non-critical paths (logging, session persistence) do not block the primary response.
- Every failure is logged with sufficient context for post-incident analysis.

---

## 2. Failure Scenarios

---

### FAIL-001: LLM API Timeout

| Field | Detail |
|-------|--------|
| **Trigger** | Gemini API does not respond within the configured timeout (default 30 seconds) |
| **Affected path** | Query path, Stage 11 (LLM Generation) |
| **Severity** | HIGH — user receives no answer |

**Detection:**
The LLM client wraps the Gemini API call in an async timeout context manager. If the response is not received within 30 seconds, an `asyncio.TimeoutError` is raised. This is caught by the LLMClient and re-raised as `LLMTimeoutError`.

**System Response:**
- `LLMTimeoutError` is caught in the query router
- No retry on timeout (user request is still open; retrying would further delay or double the wait)
- Immediately construct error response with `has_answer: false` and `error_type: "LLM_TIMEOUT"`
- Write query log: `outcome=ERROR`, `error_type=LLM_TIMEOUT`, `llm_called=true`, `latency_ms=[measured]`
- Increment `lm_timeout_count` metric counter

**User-Facing Behavior:**
```json
{
  "has_answer": false,
  "error_type": "LLM_TIMEOUT",
  "answer": "The request took too long to process. This may be a temporary issue. Please try your question again.",
  "citations": []
}
```
HTTP status: 200 (handled state, not a server crash)

**Recovery:**
- User retries the query; Gemini API latency is typically transient
- If persistent: operator checks Gemini API status page; considers switching to a faster model (`gemini-1.5-flash` vs `gemini-1.5-pro`) via `GEMINI_MODEL` env variable

---

### FAIL-002: LLM API Error (5xx / Network Error)

| Field | Detail |
|-------|--------|
| **Trigger** | Gemini API returns HTTP 500/502/503, or network connection to Google APIs fails |
| **Affected path** | Query path, Stage 11; also Ingestion path embedding (separate handling) |
| **Severity** | HIGH — user receives no answer |

**Detection:**
The Gemini SDK raises an API exception on 5xx responses or a connection error on network failure. Both are caught as `google.api_core.exceptions.GoogleAPIError` or `httpx.ConnectError`.

**System Response:**
- First failure: wait 2 seconds, retry LLM call once
- If second attempt also fails: raise `LLMAPIError`
- Construct error response with `has_answer: false` and `error_type: "LLM_ERROR"`
- Write query log with `outcome=ERROR`, `llm_called=true`
- Do NOT construct a fallback answer from context or memory

**User-Facing Behavior:**
```json
{
  "has_answer": false,
  "error_type": "LLM_ERROR",
  "answer": "The AI service is temporarily unavailable. Please try again in a few moments.",
  "citations": []
}
```

**Recovery:**
- Transient 5xx: user retry after brief wait
- Persistent 5xx: monitor Google Cloud Status Dashboard; implement circuit breaker pattern if sustained (Phase 2)
- Network failure: check outbound connectivity from the backend container

---

### FAIL-003: Embedding API Failure During Query

| Field | Detail |
|-------|--------|
| **Trigger** | Gemini Embedding API fails (rate limit, timeout, 5xx) at query time — when generating the query vector |
| **Affected path** | Query path, Stage 3 (Query Embedding) |
| **Severity** | MEDIUM — system degrades to keyword-only retrieval; answer quality may be lower |

**Detection:**
`EmbeddingService.embed_query()` raises `EmbeddingServiceError` after retries are exhausted. This is caught in the query router.

**System Response:**
- Set `bm25_only_mode = True`
- Skip pgvector retrieval entirely (no query vector available)
- Continue with BM25-only retrieval
- Add `warnings: ["Semantic search temporarily unavailable; results based on keyword matching only"]` to response
- Write query log with `retrieval_mode=BM25_ONLY`

**User-Facing Behavior:**
User receives an answer (if BM25 evidence is sufficient) but the response includes a visible warning:
```json
{
  "has_answer": true,
  "answer": "E101 on AlphaBot 3000 indicates Motor Overload Fault...",
  "confidence": "MEDIUM",
  "warnings": ["Semantic search temporarily unavailable; results based on keyword matching only. For complex symptom queries, please try again later."],
  "citations": [...]
}
```
For error code queries (exact string match), BM25 alone is highly effective. For symptom queries, retrieval quality is degraded.

**Recovery:**
- Automatic: next query attempt will retry the embedding API independently
- If rate limited: backoff is applied; system recovers without operator action
- Persistent: operator checks GEMINI_API_KEY validity and quota consumption

---

### FAIL-004: Embedding API Failure During Ingestion

| Field | Detail |
|-------|--------|
| **Trigger** | Gemini Embedding API fails during chunk embedding in the ingestion pipeline |
| **Affected path** | Ingestion path, Stage 6 (Embedding Generation) |
| **Severity** | MEDIUM-HIGH — affected chunks are not queryable until re-embedded |

**Detection:**
`EmbeddingService.embed_batch()` raises `EmbeddingServiceError` after retries are exhausted for a batch.

**System Response:**
- Per-batch failure: mark all chunks in failed batch as `embedding_status = EMBEDDING_FAILED`
- Continue with next batch (do not abort entire ingestion job for one batch failure)
- After all batches processed: count EMBEDDED vs EMBEDDING_FAILED
  - If EMBEDDING_FAILED > 20% of total chunks: set job status = WARNING
  - If EMBEDDING_FAILED ≤ 20%: set job status = COMPLETE with embedded_count / total_count in metadata
- Update ingestion job record with `failed_chunk_count` and `warning_message`
- Emit WARNING SSE event with message: "N chunks could not be embedded and are not queryable"

**Admin-Facing Behavior:**
Ingestion job appears in admin dashboard with status WARNING. Detail view shows:
- Total chunks: 120
- Successfully embedded: 112
- Failed to embed: 8
- Warning: "8 chunks failed embedding due to API errors. Re-ingest to retry."
- Admin can trigger re-ingestion (re-ingest retries only EMBEDDING_FAILED chunks)

**User-Facing Behavior:**
The manual is partially queryable. Content in failed chunks will not be retrieved. If the failed chunks happened to contain key error codes, those codes will not be retrievable — the system will return a graceful refusal for those queries.

**Recovery:**
- Re-ingest the manual from admin dashboard: system identifies EMBEDDING_FAILED chunks and retries embedding only (does not re-parse or re-chunk)
- If API quota is the cause: wait until quota resets (daily or hourly depending on Gemini plan)

---

### FAIL-005: pgvector Query Failure

| Field | Detail |
|-------|--------|
| **Trigger** | PostgreSQL connection failure, pgvector index corruption, or query timeout during vector ANN search |
| **Affected path** | Query path, Stage 4b (pgvector ANN Retrieval) |
| **Severity** | MEDIUM — degrades to BM25-only; answer quality may be reduced |

**Detection:**
`VectorRetriever.search()` raises `asyncpg.PostgresConnectionError`, `asyncpg.QueryCanceledError` (timeout), or `pgvector.PGVectorError`.

**System Response:**
- Catch exception in `VectorRetriever`
- Log ERROR with full exception details and query parameters
- Signal `vector_retrieval_failed = True` to ResultFuser
- `ResultFuser` operates on BM25 results only (same as BM25-only mode)
- Add WARNING to response: "Vector search temporarily unavailable"
- Query continues through the full pipeline with BM25 results

**User-Facing Behavior:**
Same as FAIL-003 from the user's perspective: response with warning flag, answer based on keyword search only.

**Recovery:**
- If PostgreSQL connection issue: check `pg_stat_activity` for blocking queries; restart connection pool if needed
- If pgvector index corruption: `REINDEX INDEX CONCURRENTLY chunks_embedding_idx` (non-blocking rebuild)
- If persistent: failover to read replica if configured

---

### FAIL-006: PDF Parsing Failure

| Field | Detail |
|-------|--------|
| **Trigger** | PyMuPDF cannot open or parse the uploaded PDF (corrupted file, encrypted PDF with password, unsupported format) |
| **Affected path** | Ingestion path, Stage 2 (PDF Parsing) |
| **Severity** | HIGH for the specific file — that manual is not ingested; no user data loss |

**Detection:**
`fitz.open(file_path)` raises `fitz.FileDataError`, `fitz.PasswordError`, or similar exception. Also detected when page count is 0 (empty PDF) or average text per page < 10 characters (likely scanned PDF).

**System Response:**
- Catch exception immediately
- Set ingestion job status = FAILED
- Set `error_message` to a human-readable explanation:
  - FileDataError: "PDF file appears to be corrupted or in an unsupported format"
  - PasswordError: "PDF is password-protected. Please upload an unencrypted version."
  - Low text content: "PDF contains no extractable text. It may be a scanned image PDF. OCR is not currently supported."
- Delete the raw file from storage (partial failure; no point keeping an unprocessable file)
- Delete the manual record from the database (or set status = FAILED on the record)
- Emit ERROR SSE event with the error_message
- Do NOT silently create an empty or partial manual record

**Admin-Facing Behavior:**
Admin dashboard shows manual with status FAILED. Error message explains the cause. Admin can:
1. Upload a corrected version (unencrypted, or digital-native PDF)
2. Contact support if the file format is unexpected

**User-Facing Behavior:**
Manual is not available for querying. Queries about that machine will receive refusal responses if no other manuals exist for that machine. Refusal message hints that the manual may not be ingested.

**Recovery:**
- Admin uploads corrected PDF
- Encrypted PDFs: admin must decrypt before upload (no password entry UI in MVP)
- Scanned PDFs: await OCR feature (Phase 2) or source a digital-native version of the manual

---

### FAIL-007: Evidence Below Threshold (Graceful Refusal)

| Field | Detail |
|-------|--------|
| **Trigger** | Evidence sufficiency score falls below EVIDENCE_THRESHOLD after retrieval |
| **Affected path** | Query path, Stage 7 (Evidence Validation) |
| **Severity** | LOW — system working as designed; this is correct behavior |

**Detection:**
`EvidenceValidator.assess()` computes `sufficiency_score < EVIDENCE_THRESHOLD`. This is not an error condition — it is the normal operation of the hallucination gate.

**System Response:**
- Do not call the LLM
- Construct `RefusalResponse` without LLM:
  - Query which active manuals were searched (from machine filter context)
  - Generate template-based suggestions (not LLM-generated)
  - Return `has_answer: false`
- Write query log with `outcome=REFUSED`, `llm_called=false`, `evidence_score=[value]`

**User-Facing Behavior:**
```json
{
  "has_answer": false,
  "answer": "I could not find sufficient information to answer this question. The query may refer to content not present in the currently ingested manuals, or the error code may not exist in any loaded manual.",
  "searched_manuals": ["AlphaBot 3000 Operations Manual", "ZenithBot Z-Series Service Manual"],
  "suggestions": [
    "Verify the error code is correct (e.g., E101 vs E-101)",
    "Check the Admin panel to ensure the relevant manual is ingested and not in FAILED status",
    "Try describing the symptom instead: 'The machine is showing...'",
    "Consult the physical manual for error codes not yet indexed"
  ],
  "citations": []
}
```
HTTP 200.

**Recovery:**
- Correct query reformulation (user)
- Ingest missing manual (admin)
- Adjust threshold if the threshold is set too conservatively (operator, via EVIDENCE_THRESHOLD env var)
- No system recovery action required — this is intentional behavior

---

### FAIL-008: LLM Returns Invalid JSON

| Field | Detail |
|-------|--------|
| **Trigger** | Gemini API returns a response that is not valid JSON or does not conform to the required schema |
| **Affected path** | Query path, Stage 10 (Output Parsing) |
| **Severity** | MEDIUM — retry resolves in most cases; persistent failure returns error response |

**Detection:**
`json.loads(raw_response)` raises `JSONDecodeError`, or Pydantic model validation raises `ValidationError` on the parsed dict.

**System Response:**
- Attempt 1 fails: log the raw response and the parse error (for debugging)
- Rebuild prompt with JSON repair instruction appended to system message:
  ```
  "Your previous response was not valid JSON. You must respond with ONLY a JSON object 
  conforming to the schema provided. Do not include any text before or after the JSON object."
  ```
- Retry LLM call (new API call, same context)
- Attempt 2: parse again
  - If valid: proceed normally
  - If invalid: log second failure
- Attempt 3 (final): retry with maximally simplified prompt (shorter context, explicit JSON example)
  - If valid: proceed normally
  - If invalid: construct `ErrorResponse`

**User-Facing Behavior (after all retries fail):**
```json
{
  "has_answer": false,
  "error_type": "PARSE_ERROR",
  "answer": "The AI service returned an unexpected response format. Please try again.",
  "citations": []
}
```

**Recovery:**
- In most cases, retry 1 resolves the issue (Gemini occasionally produces markdown-wrapped JSON)
- If persistent: check if schema is too complex for the model version being used; simplify schema or switch to Gemini Pro which has stronger instruction-following
- Operator can enable debug logging to capture raw LLM responses for analysis

---

### FAIL-009: Session Expired Mid-Conversation

| Field | Detail |
|-------|--------|
| **Trigger** | Redis TTL expires while a user is in a multi-turn conversation (user was inactive for 30+ minutes between turns) |
| **Affected path** | Query path, Stage 1 (Session Hydration) |
| **Severity** | LOW-MEDIUM — conversation context lost; user must re-specify machine |

**Detection:**
`redis.get(f"session:{session_id}")` returns `None` when the session key has expired. This is detected immediately at session hydration.

**System Response:**
- Create a new empty session in memory for this request
- Process the query without machine context (resolved_machine = null for this turn)
- If query references a machine by name, entity extraction may recover machine context
- If query is ambiguous without machine context, disambiguation will trigger

**User-Facing Behavior:**
Response includes a notice in `warnings`:
```json
{
  "has_answer": true/false,
  "warnings": ["Your session has expired. Please re-specify the machine you are working on if follow-up questions relate to a specific machine."]
}
```
If the expiry causes a disambiguation scenario (query is now cross-machine), the clarification card appears.

**Recovery:**
- User re-specifies machine in next query (either in query text or via machine selector)
- Operator may increase SESSION_TTL_SECONDS for environments where technicians pause troubleshooting for longer
- No data loss — all prior answers are still visible in the chat history (stored client-side in browser)

---

### FAIL-010: Concurrent Ingestion of Same Manual (Duplicate Upload)

| Field | Detail |
|-------|--------|
| **Trigger** | Two admins or one admin submitting the same PDF file twice (race condition or accidental duplicate) |
| **Affected path** | Ingestion path, Stage 1 (File Validation) |
| **Severity** | LOW — detected immediately; no duplicate data created |

**Detection:**
The file validation step computes SHA-256(file_bytes) and queries:
```sql
SELECT id FROM manuals WHERE file_hash = $hash LIMIT 1
```
This query uses a database-level UNIQUE constraint on `manuals.file_hash` as the authoritative check.

The unique constraint ensures that even in a race condition (two uploads arriving simultaneously before either commits), only one will succeed — the second will receive a PostgreSQL unique constraint violation.

**System Response:**
- If duplicate detected before INSERT: return HTTP 409 immediately; no file written to storage; no job created
- If race condition triggers constraint violation at INSERT: catch `UniqueViolationError`; return HTTP 409; delete the partially written file from storage if it was written
- Log the duplicate attempt with the conflicting manual_id for audit

**User-Facing Behavior:**
```
HTTP 409 Conflict
{
  "error": "DUPLICATE_MANUAL",
  "message": "This manual has already been ingested (duplicate file detected). The existing manual is 'AlphaBot 3000 Operations Manual' uploaded on 2026-08-15.",
  "existing_manual_id": "uuid-of-existing-manual"
}
```
Admin panel displays the error inline and links to the existing manual.

**Recovery:**
- If the admin intended to upload a new version: use the "Upload New Version" action on the existing manual (which accepts the same content but creates a new version record)
- If the admin intended to replace with a corrected file: use delete + re-upload workflow
- No recovery needed if the behavior is correct (duplicate rejection is the desired outcome)

---

### FAIL-011: BM25 Index Missing or Stale

| Field | Detail |
|-------|--------|
| **Trigger** | Application restarts without rebuilding BM25 index, or index rebuild fails after a new ingestion |
| **Affected path** | Query path, Stage 4a (BM25 Retrieval) |
| **Severity** | MEDIUM — BM25 retrieval is unavailable; falls back to vector-only |

**Detection:**
At application startup, BM25 index is loaded from the database. If the index is empty (no embedded chunks in DB), a warning is logged. At query time, if the index object is None or empty, `BM25Retriever` returns an empty list and sets `bm25_unavailable = True`.

**System Response:**
- Return empty BM25 results
- `ResultFuser` operates on vector results only
- Add WARNING to response: "Keyword search temporarily unavailable"
- Trigger async BM25 index rebuild in background (does not block the current query)

**User-Facing Behavior:**
Response delivered with warning. Semantic retrieval still works; error code queries may have reduced precision until BM25 is restored.

**Recovery:**
- Background rebuild completes within seconds (for datasets < 100K chunks)
- If rebuild fails: log CRITICAL; operator must manually trigger a restart or expose an admin endpoint to force rebuild

---

### FAIL-012: Database Connection Pool Exhausted

| Field | Detail |
|-------|--------|
| **Trigger** | All PostgreSQL connection pool slots are in use; new query cannot acquire a connection |
| **Affected path** | Any database-dependent stage (retrieval, context assembly, citation validation) |
| **Severity** | HIGH — query cannot complete |

**Detection:**
`asyncpg.pool.Pool.acquire()` raises `asyncpg.exceptions.TooManyConnectionsError` or times out waiting for a connection (default pool wait timeout: 5 seconds).

**System Response:**
- Catch connection acquisition failure
- Log ERROR with pool utilization stats (acquired, available, size)
- Return error response: `{has_answer: false, error_type: "STORAGE_ERROR", answer: "Service is experiencing high load. Please try again in a moment."}`
- Increment `db_pool_exhausted_count` metric

**User-Facing Behavior:**
Error response as above. HTTP 200 (handled state).

**Recovery:**
- Short-term: user retry; exhaustion events are typically transient
- Longer-term: increase `DB_POOL_MAX_SIZE` environment variable
- If persistent under load: add PostgreSQL read replicas for query path; route writes (ingestion) to primary and reads (retrieval) to replicas

---

## 3. Failure Response Summary Table

| Failure ID | Trigger | LLM Called | User Sees | System Recovers |
|-----------|---------|-----------|-----------|----------------|
| FAIL-001 | LLM API timeout | Yes (timed out) | "Try again" message | User retry |
| FAIL-002 | LLM API 5xx error | Yes (failed) | "Service unavailable" message | User retry after brief wait |
| FAIL-003 | Embedding API failure at query time | Potentially | Answer with BM25 warning | Automatic; next query retries |
| FAIL-004 | Embedding API failure at ingestion | N/A | Partial manual; WARNING status | Admin re-ingests |
| FAIL-005 | pgvector query failure | Potentially | Answer with BM25 warning | Automatic; retry or operator |
| FAIL-006 | PDF parsing failure | No | Manual not available; FAILED status | Admin uploads corrected PDF |
| FAIL-007 | Evidence below threshold | No | Graceful refusal with suggestions | User reformulates query |
| FAIL-008 | LLM returns invalid JSON | Yes (retry) | "Unexpected format" after 3 fails | Operator checks LLM response quality |
| FAIL-009 | Session expires mid-conversation | Possible | Warning; re-specify machine | User re-specifies machine |
| FAIL-010 | Duplicate PDF upload | No | HTTP 409 with existing manual info | No recovery needed |
| FAIL-011 | BM25 index missing | No | Answer with BM25 warning | Background rebuild triggers |
| FAIL-012 | DB pool exhausted | No | "High load" error; retry | Retry; operator scales pool |

---

## 4. Observability Requirements

Each failure scenario should produce the following observability signals for operators:

| Signal Type | Mechanism | Retention |
|-------------|----------|-----------|
| Application logs | Python logging (JSON format); captured by Docker | 7 days rolling |
| Error counts | Prometheus counters per error_type | 30 days |
| Latency histograms | Prometheus histograms for each pipeline stage | 30 days |
| Query outcome distribution | Tracked in `query_logs` table | Indefinite |
| Embedding failure rate | Tracked per ingestion job | Indefinite |
| LLM call success/fail rate | Counter per model call | 30 days |
| Session expiry events | Logged at WARNING level | 7 days rolling |

---

*End of Failure Flows*
