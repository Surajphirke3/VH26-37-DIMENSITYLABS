# MechMind — Data Flow

**Document version:** 1.0
**Status:** Approved
**Last updated:** 2026-09-04

---

## 1. Overview

This document describes the complete data flows for the three primary workflows in MechMind. For each flow, every stage is documented: what data enters, what transformation occurs, what is stored (persistent), and what is ephemeral (lives only in memory for the duration of the request or job).

**Storage notation used in diagrams:**
- `[DB]` — written to PostgreSQL; persistent across restarts
- `[REDIS]` — written to Redis; ephemeral, TTL-based
- `[MEM]` — in-memory only; lives for duration of job or request
- `[FILE]` — written to file system; persistent

---

## 2. Document Ingestion Data Flow

### 2.1 Overview

A PDF file enters the system, is validated, parsed, split into semantic chunks, enriched with metadata, embedded as vectors, and stored. Each stage consumes the output of the prior stage. No stage writes partial results to the database — stages commit atomically on success.

### 2.2 Flow Diagram

```
Administrator Browser
       |
       | HTTP POST /api/ingest/upload
       | Content: multipart/form-data
       | Fields:  file=<binary PDF>, machine_model="AlphaBot 3000"
       |
       v
+------+------------------------------------------------------------------------+
|  STAGE 1: File Reception and Validation                                        |
|                                                                                |
|  Input:   PDF binary bytes (raw HTTP body)                                     |
|           machine_model string from form field                                 |
|                                                                                |
|  Actions: - Read file bytes into memory                                        |
|           - Validate MIME type (must be application/pdf)                       |
|           - Validate file size (reject if > 100 MB)                            |
|           - Compute SHA-256(bytes) → file_hash                                 |
|           - Query manuals table: SELECT id WHERE file_hash = $hash             |
|           - If duplicate found → HTTP 409, STOP                                |
|           - Write bytes to storage path (e.g., /uploads/{uuid}.pdf)           |
|                                                                                |
|  Stores:  file bytes          → [FILE] /uploads/{uuid}.pdf                    |
|           manual record       → [DB]   manuals (status=PENDING)                |
|           ingestion_job       → [DB]   ingestion_jobs (status=PENDING)         |
|                                                                                |
|  Emits:   job_id (UUID) to HTTP response                                       |
+------+------------------------------------------------------------------------+
       |
       | Triggers background task (FastAPI BackgroundTasks or Celery)
       | Data: {manual_id, file_path, machine_model, job_id}
       |
       v
+------+------------------------------------------------------------------------+
|  STAGE 2: PDF Parsing                                                          |
|                                                                                |
|  Input:   file_path (string pointing to stored PDF)                            |
|                                                                                |
|  Actions: - Open file from storage into fitz.Document                         |
|           - Iterate pages 1..N                                                 |
|           - For each page:                                                     |
|             - Extract text blocks: page.get_text("blocks")                     |
|             - Extract table structures: page.find_tables()                     |
|             - Capture font sizes from blocks for heading detection             |
|           - Extract document metadata: doc.metadata (Title, Author, etc.)     |
|           - Update ingestion_job.page_count = N                                |
|                                                                                |
|  Stores:  page_count          → [DB]   manuals.page_count (updated)            |
|           job stage           → [DB]   ingestion_jobs.current_stage=PARSING    |
|                                                                                |
|  Produces (ephemeral):                                                         |
|    List[PageContent] → [MEM]                                                   |
|    {                                                                           |
|      page_number: int,                                                         |
|      raw_text: str,                                                            |
|      tables: List[TableData],                                                  |
|      font_sizes: Dict[block_id, float],   # for heading detection              |
|      page_metadata: Dict                                                       |
|    }                                                                           |
+------+------------------------------------------------------------------------+
       |
       | List[PageContent] (in memory)
       |
       v
+------+------------------------------------------------------------------------+
|  STAGE 3: Table Detection and Text Cleaning                                    |
|                                                                                |
|  Input:   List[PageContent] (in memory)                                        |
|                                                                                |
|  Actions (Table Detection):                                                    |
|   - For each table in page.tables:                                             |
|     - Convert rows/cells to structured text:                                   |
|       "Error Code: E101 | Description: Motor Overload | Action: Check wiring"  |
|     - Mark table text boundaries in raw_text for chunker to preserve           |
|     - Extract table title from nearest heading above table coordinates         |
|                                                                                |
|  Actions (Text Cleaning):                                                      |
|   - Normalize whitespace (collapse multiple spaces/newlines)                   |
|   - Detect and strip running headers/footers by comparing repeated            |
|     text across first 5 and last 5 pages                                      |
|   - Replace ligature artifacts: fi→fi, fl→fl, ff→ff                           |
|   - Remove bare page numbers (lines containing only digits)                   |
|                                                                                |
|  Produces (ephemeral):                                                         |
|    List[CleanedPage] → [MEM]                                                   |
|    {                                                                           |
|      page_number: int,                                                         |
|      cleaned_text: str,       # with table markers embedded                   |
|      table_ranges: List[tuple],  # (start_char, end_char, is_table)           |
|      font_sizes: Dict         # preserved for heading detection                |
|    }                                                                           |
+------+------------------------------------------------------------------------+
       |
       | List[CleanedPage] (in memory)
       |
       v
+------+------------------------------------------------------------------------+
|  STAGE 4: Semantic Chunking                                                    |
|                                                                                |
|  Input:   List[CleanedPage] (in memory)                                        |
|                                                                                |
|  Actions:                                                                      |
|   - Detect section boundaries by scanning for heading patterns:               |
|     - Font size > median page font size by >20%                                |
|     - Regex: ^\d+\.?\d*\s+[A-Z]  (numbered headings)                          |
|     - Regex: ^[A-Z][A-Z\s]{5,}$  (ALL CAPS headings)                          |
|   - Split text at section boundaries first                                     |
|   - Within each section: split into 400-600 token chunks                      |
|   - Apply 50-token overlap: last 50 tokens of chunk N prepended to chunk N+1  |
|   - For table ranges: emit entire table as one chunk (ignore token target)    |
|   - Discard chunks < 50 tokens unless they contain error code pattern         |
|   - Assign sequential chunk_index within manual                                |
|                                                                                |
|  Produces (ephemeral):                                                         |
|    List[Chunk] → [MEM]                                                         |
|    {                                                                           |
|      chunk_index: int,                                                         |
|      page_number: int,                                                         |
|      section_title: str,                                                       |
|      text: str,                                                                |
|      token_count: int,                                                         |
|      is_table: bool                                                            |
|    }                                                                           |
+------+------------------------------------------------------------------------+
       |
       | List[Chunk] (in memory)
       |
       v
+------+------------------------------------------------------------------------+
|  STAGE 5: Metadata Enrichment                                                  |
|                                                                                |
|  Input:   List[Chunk] (in memory), manual_id, machine_model                   |
|                                                                                |
|  Actions:                                                                      |
|   - For each chunk:                                                            |
|     - Run regex [A-Z]{1,3}-?\d{2,4} over chunk.text                           |
|     - Collect all matches → error_codes list                                   |
|     - Set contains_error_code = len(error_codes) > 0                          |
|     - Assign chunk.manual_id = manual_id                                       |
|     - Assign chunk.machine_model = machine_model                               |
|     - Generate chunk.id = UUID4                                                |
|     - Set embedding_status = PENDING                                           |
|                                                                                |
|  Stores:  chunk records (without embedding) → [DB] chunks table                |
|           (bulk INSERT; embedding column NULL, status PENDING)                 |
|                                                                                |
|  Produces (ephemeral):                                                         |
|    List[EnrichedChunk] → [MEM]  (same as Chunk + UUID ids + metadata fields)  |
+------+------------------------------------------------------------------------+
       |
       | List[EnrichedChunk] with chunk_ids (in memory)
       |
       v
+------+------------------------------------------------------------------------+
|  STAGE 6: Embedding Generation (Batched)                                       |
|                                                                                |
|  Input:   List[EnrichedChunk] (in memory)                                      |
|                                                                                |
|  Actions:                                                                      |
|   - Group chunks into batches of 100                                           |
|   - For each batch:                                                            |
|     - POST to Gemini text-embedding-004 API                                    |
|       Request: {texts: [chunk.text for chunk in batch],                        |
|                 task_type: "RETRIEVAL_DOCUMENT"}                               |
|       Response: {embeddings: [[0.12, -0.34, ...] × 100]}                      |
|     - On success: pair each chunk_id with its vector                           |
|     - On rate limit: wait (exponential backoff), retry                         |
|     - On persistent failure: mark chunk embedding_status = EMBEDDING_FAILED   |
|   - Track counts: embedded / failed                                            |
|                                                                                |
|  Data in transit (network):                                                    |
|   → Gemini API: batch of up to 100 text strings (~60K chars)                  |
|   ← Gemini API: 100 × 768-float arrays (~300KB per batch)                     |
|                                                                                |
|  Produces (ephemeral):                                                         |
|    List[(chunk_id, vector[768])] → [MEM]                                       |
+------+------------------------------------------------------------------------+
       |
       | List[(chunk_id, vector)] (in memory)
       |
       v
+------+------------------------------------------------------------------------+
|  STAGE 7: Vector Storage and Index Update                                      |
|                                                                                |
|  Input:   List[(chunk_id, vector[768])] (in memory)                            |
|                                                                                |
|  Actions:                                                                      |
|   - Bulk UPDATE chunks SET embedding = $vector, embedding_status = 'EMBEDDED' |
|     WHERE id = $chunk_id                                                       |
|   - After all updates: UPDATE manuals SET chunk_count = count                 |
|   - Trigger BM25 index rebuild:                                                |
|     - SELECT id, text, machine_model FROM chunks WHERE is_active = true       |
|       AND embedding_status = 'EMBEDDED'                                        |
|     - Rebuild rank-bm25 index in application memory                           |
|     - Swap old index with new (atomic replace)                                 |
|   - Update ingestion_job: status=COMPLETE, progress_pct=100                   |
|   - Emit COMPLETE SSE event to any connected status stream consumers          |
|                                                                                |
|  Stores:                                                                       |
|    embedding vectors → [DB]  chunks.embedding (vector(768))                   |
|    embedding_status  → [DB]  chunks.embedding_status = EMBEDDED               |
|    chunk_count       → [DB]  manuals.chunk_count                               |
|    job completion    → [DB]  ingestion_jobs.status = COMPLETE                 |
|    BM25 index        → [MEM] application memory (rebuilt from DB)             |
|                                                                                |
|  Ephemeral data discarded:                                                     |
|    All in-memory Chunk / EnrichedChunk / vector objects GC'd after this stage |
+------+------------------------------------------------------------------------+
       |
       v
    [COMPLETE]
    Manual is queryable. All chunks have vectors in pgvector.
    BM25 index includes new chunks. Ingestion job status = COMPLETE.
```

---

## 3. Query Processing Data Flow

### 3.1 Overview

A text query from a technician passes through classification, entity extraction, parallel retrieval, fusion, filtering, evidence evaluation, context assembly, LLM generation, and citation validation before returning a structured answer.

### 3.2 Flow Diagram

```
Technician Browser
       |
       | HTTP POST /api/query
       | Body: {query: "What is error E101 on AlphaBot 3000?",
       |         session_id: "uuid-abc",
       |         machine_model: null}
       |
       v
+------+------------------------------------------------------------------------+
|  STAGE 1: Session Hydration                                                    |
|                                                                                |
|  Input:   session_id from request body                                         |
|                                                                                |
|  Actions: - GET session:{session_id} from Redis                                |
|           - If missing: create empty session in memory (stateless mode)        |
|           - Extract: machine_model, conversation_history, last_chunk_ids       |
|                                                                                |
|  Reads:   session data → [REDIS]  session:{uuid}                               |
|                                                                                |
|  Produces (ephemeral):                                                         |
|    SessionContext{machine_model, history, last_chunks} → [MEM]                 |
+------+------------------------------------------------------------------------+
       |
       v
+------+------------------------------------------------------------------------+
|  STAGE 2: Query Analysis                                                       |
|                                                                                |
|  Input:   query string, SessionContext (in memory)                             |
|                                                                                |
|  Actions: - Normalize: lowercase, strip extra whitespace                       |
|           - Run error code regex: [A-Z]{1,3}-?\d{2,4}                         |
|           - Match against machine_models table aliases                         |
|           - Determine query_type: ERROR_CODE / NATURAL_LANGUAGE / HYBRID      |
|           - Resolve machine_model:                                             |
|             Priority 1: request.machine_model field                            |
|             Priority 2: session.machine_model                                  |
|             Priority 3: entity extracted from query text                       |
|             Priority 4: null (unresolved)                                      |
|                                                                                |
|  Reads:   machine_models table → [DB]  (loaded at startup, cached in memory)  |
|                                                                                |
|  Produces (ephemeral):                                                         |
|    QueryContext{query, query_type, detected_codes,                             |
|                 resolved_machine, normalized_query} → [MEM]                    |
+------+------------------------------------------------------------------------+
       |
       v
+------+------------------------------------------------------------------------+
|  STAGE 3: Query Embedding                                                      |
|                                                                                |
|  Input:   normalized_query string                                              |
|                                                                                |
|  Actions: - POST to Gemini text-embedding-004 API                             |
|             Request: {text: normalized_query,                                  |
|                       task_type: "RETRIEVAL_QUERY"}                            |
|             Response: {embedding: [0.21, -0.15, ...] (768 floats)}            |
|           - If API fails: set bm25_only_mode = True, skip this stage          |
|                                                                                |
|  Data in transit: query text → Gemini API; 768-float vector ← Gemini API     |
|                                                                                |
|  Produces (ephemeral):                                                         |
|    query_vector: List[float] (768 dims) → [MEM]                               |
|    OR bm25_only_mode: True              → [MEM]                               |
+------+------------------------------------------------------------------------+
       |
       | query_vector + normalized_query + resolved_machine
       | (all in memory; passed to both retrievers in parallel)
       |
       v  (PARALLEL EXECUTION)
+------+-----------------------------+  +------+--------------------------------+
|  STAGE 4a: BM25 Retrieval          |  |  STAGE 4b: pgvector ANN Retrieval     |
|                                    |  |                                        |
|  Input: normalized_query,          |  |  Input: query_vector,                  |
|         resolved_machine           |  |         resolved_machine               |
|                                    |  |                                        |
|  Actions:                          |  |  Actions:                              |
|  - Tokenize query                  |  |  - Build SQL query:                    |
|  - If resolved_machine is set:     |  |    SELECT chunk_id,                    |
|    use per_machine BM25 index      |  |      1-(embedding<=>$1) AS score       |
|  - Else: use full BM25 index       |  |    FROM chunks                         |
|  - Get top-20 by BM25 score        |  |    WHERE is_active=true               |
|                                    |  |      AND (machine_model=$2 OR $2 NULL)|
|  Reads: BM25 index → [MEM]        |  |    ORDER BY embedding<=>$1            |
|                                    |  |    LIMIT 20                            |
|  Produces (ephemeral):             |  |                                        |
|  List[{chunk_id, score, rank}]     |  |  Reads: chunks table → [DB]            |
|    → [MEM]                         |  |                                        |
|                                    |  |  Produces (ephemeral):                 |
|                                    |  |  List[{chunk_id, score, rank}]         |
|                                    |  |    → [MEM]                             |
+------+-----------------------------+  +------+--------------------------------+
       |                                       |
       +------------------+--------------------+
                          |
                          | Two ranked lists (up to 20 each) in memory
                          v
+------+------------------------------------------------------------------------+
|  STAGE 5: RRF Fusion                                                           |
|                                                                                |
|  Input:   bm25_results, vector_results (both in memory)                        |
|                                                                                |
|  Actions: - Union of chunk_ids from both lists                                 |
|           - For each: rrf_score = 1/(bm25_rank + 60) + 1/(vector_rank + 60)  |
|           - Sort descending by rrf_score                                       |
|           - Take top 20                                                        |
|                                                                                |
|  Produces (ephemeral):                                                         |
|    List[FusedResult{chunk_id, rrf_score, bm25_rank, vector_rank}] → [MEM]     |
+------+------------------------------------------------------------------------+
       |
       v
+------+------------------------------------------------------------------------+
|  STAGE 6: Machine Filter                                                       |
|                                                                                |
|  Input:   fused_results (in memory), resolved_machine                          |
|                                                                                |
|  Actions: - If resolved_machine is None: pass through unchanged               |
|           - If resolved_machine is set:                                        |
|             - Fetch machine_model for each chunk_id from DB (if not cached)   |
|             - Remove chunks where machine_model != resolved_machine            |
|           - Take top 10 remaining                                              |
|                                                                                |
|  Reads:   chunks.machine_model → [DB]  (WHERE id IN (chunk_ids))              |
|                                                                                |
|  Produces (ephemeral):                                                         |
|    List[FusedResult] (filtered, ≤ 10 items) → [MEM]                           |
+------+------------------------------------------------------------------------+
       |
       v
+------+------------------------------------------------------------------------+
|  STAGE 7: Ambiguity Detection (when machine not resolved)                      |
|                                                                                |
|  Input:   filtered_results (in memory), resolved_machine                       |
|                                                                                |
|  Actions: - If resolved_machine is set: skip (not ambiguous)                  |
|           - Count distinct machine_models in top-10 results                   |
|           - Count qualifying candidates per machine (rrf_score > 0.01)        |
|           - If ≥2 machines have ≥2 qualifying candidates:                     |
|             → AMBIGUOUS: return clarification response immediately             |
|             → Store pending_query in Redis session                             |
|             → Return disambiguationResponse to client                          |
|           - Else: continue to Evidence Validation                              |
|                                                                                |
|  Writes (if ambiguous):                                                        |
|    pending_query, machines_found → [REDIS]  session:{uuid}                    |
|                                                                                |
|  Produces:                                                                     |
|    AmbiguityResult{is_ambiguous, machines_found} → [MEM]                      |
|    OR: HTTP response (clarification card) → returned to client                 |
+------+------------------------------------------------------------------------+
       |  (only continues if NOT ambiguous)
       v
+------+------------------------------------------------------------------------+
|  STAGE 8: Evidence Validation                                                  |
|                                                                                |
|  Input:   filtered_results (in memory), query, resolved_machine                |
|                                                                                |
|  Actions: - top_score: rrf_score of rank-1 candidate (normalized)             |
|           - coverage_score: fraction of query tokens in top-5 chunk texts     |
|           - machine_match: 1.0 / 0.5 / 0.0 based on machine agreement        |
|           - sufficiency_score = 0.5*top + 0.3*coverage + 0.2*machine_match    |
|           - If score < EVIDENCE_THRESHOLD:                                     |
|             → Return RefusalResponse immediately (no LLM call)                 |
|           - If score >= EVIDENCE_THRESHOLD: continue                           |
|           - Set confidence_level: HIGH / MEDIUM / LOW                         |
|                                                                                |
|  Writes (if refused):                                                          |
|    query_log (outcome=REFUSED) → [DB]  query_logs                              |
|                                                                                |
|  Produces:                                                                     |
|    EvidenceAssessment{score, confidence_level, should_answer} → [MEM]         |
|    OR: HTTP response (refusal) → returned to client                            |
+------+------------------------------------------------------------------------+
       |  (only continues if should_answer = True)
       v
+------+------------------------------------------------------------------------+
|  STAGE 9: Context Assembly                                                     |
|                                                                                |
|  Input:   top-5 FusedResults (chunk_ids), session conversation history         |
|                                                                                |
|  Actions: - Fetch chunk text + metadata for top-5 chunk_ids from DB           |
|           - Format as numbered context blocks with source headers              |
|           - Fetch last 3 conversation turns from Redis session                 |
|           - Concatenate: history + context blocks                              |
|                                                                                |
|  Reads:   chunk text, page_number, section_title → [DB]  chunks               |
|  Reads:   conversation_history → [REDIS]  session:{uuid}                       |
|                                                                                |
|  Produces (ephemeral):                                                         |
|    AssembledContext{context_text, chunk_metadata[]} → [MEM]                   |
+------+------------------------------------------------------------------------+
       |
       v
+------+------------------------------------------------------------------------+
|  STAGE 10: Prompt Building                                                     |
|                                                                                |
|  Input:   AssembledContext, query, confidence_level, resolved_machine          |
|                                                                                |
|  Actions: - Compose system prompt (role + instructions + JSON schema)          |
|           - Compose user prompt (context blocks + query string)                |
|           - Include machine scope reminder if machine is resolved              |
|           - Include confidence calibration based on confidence_level           |
|                                                                                |
|  Produces (ephemeral):                                                         |
|    Prompt{system_message: str, user_message: str} → [MEM]                     |
+------+------------------------------------------------------------------------+
       |
       v
+------+------------------------------------------------------------------------+
|  STAGE 11: LLM Generation                                                     |
|                                                                                |
|  Input:   Prompt (in memory), response_schema (static, defined at startup)    |
|                                                                                |
|  Actions: - POST to Gemini API:                                                |
|             - model: gemini-1.5-flash                                          |
|             - system_instruction: prompt.system_message                        |
|             - contents: [{role: user, parts: [prompt.user_message]}]           |
|             - generation_config: {response_mime_type: "application/json",      |
|                                   response_schema: schema}                     |
|           - Receive: raw JSON string                                           |
|                                                                                |
|  Data in transit:                                                              |
|   → Gemini API: system prompt (~500 tokens) + context (~3000 tokens)          |
|                + query (~50 tokens) ≈ 3550 tokens total                        |
|   ← Gemini API: JSON response (~500-800 tokens)                                |
|                                                                                |
|  Produces (ephemeral):                                                         |
|    raw_json: str → [MEM]                                                       |
+------+------------------------------------------------------------------------+
       |
       v
+------+------------------------------------------------------------------------+
|  STAGE 12: Output Parsing and Citation Validation                              |
|                                                                                |
|  Input:   raw_json string (in memory), chunk_metadata from Stage 9            |
|                                                                                |
|  Actions (Output Parsing):                                                     |
|   - json.loads(raw_json) → dict                                                |
|   - Validate against StructuredAnswer Pydantic model                          |
|   - If invalid: rebuild prompt with repair instruction; retry (max 2 times)   |
|   - If still invalid after retries: return ErrorResponse                       |
|                                                                                |
|  Actions (Citation Validation):                                                |
|   - For each citation in answer.citations:                                     |
|     - Verify chunk_id in DB (SELECT 1 FROM chunks WHERE id = $chunk_id)       |
|     - Verify excerpt is substring of chunk.text                                |
|     - If invalid: remove from citations list, log WARNING                      |
|     - If valid: enrich with manual_name, page_number, section_title from DB   |
|                                                                                |
|  Reads:   chunk text + metadata → [DB]  chunks (for citation verification)     |
|                                                                                |
|  Produces (ephemeral):                                                         |
|    StructuredAnswer (validated, citations enriched) → [MEM]                   |
+------+------------------------------------------------------------------------+
       |
       v
+------+------------------------------------------------------------------------+
|  STAGE 13: Session Update and Response                                         |
|                                                                                |
|  Input:   StructuredAnswer (in memory), session data                           |
|                                                                                |
|  Actions: - Append user query + assistant answer to conversation_history       |
|           - Update session.last_chunk_ids with chunk_ids used in context       |
|           - Update session.turn_count                                          |
|           - Write updated session to Redis (reset TTL)                         |
|           - Write query_log record to DB                                       |
|           - Return StructuredAnswer as HTTP response                           |
|                                                                                |
|  Writes:                                                                       |
|    updated session → [REDIS]  session:{uuid}  (TTL reset to 30 min)           |
|    query log       → [DB]     query_logs                                       |
|                                                                                |
|  HTTP Response:                                                                |
|    200 OK                                                                      |
|    Content-Type: application/json                                              |
|    X-Session-Id: {session_id}                                                  |
|    Body: StructuredAnswer JSON                                                  |
+------+------------------------------------------------------------------------+
       |
       v
   Technician Browser renders answer, citations, confidence badge
```

---

## 4. Disambiguation Data Flow

### 4.1 Overview

When the system detects that a query is ambiguous (error code exists in multiple machines and no machine context is set), it issues a clarification request rather than answering. The user selects a machine. The system replays the original query scoped to that machine.

### 4.2 Flow Diagram

```
Turn 1: Ambiguous Query
--------------------------------------

Technician types: "What is error E101?"
No machine context in session.
       |
       | POST /api/query
       | {query: "What is error E101?", session_id: "uuid-abc"}
       |
       v
  [Stages 1-6 run normally]
  - Session hydrated: machine_model = null
  - Query analyzed: detected_codes = ["E101"], resolved_machine = null
  - BM25 + pgvector retrieval (no machine filter)
  - RRF fusion: top results include chunks from AlphaBot 3000 AND ZenithBot Z-Series
  - Machine filter: no filter applied (machine unknown)
       |
       v
+------+------------------------------------------------------------------------+
|  AMBIGUITY DETECTION                                                           |
|                                                                                |
|  Input:   fused_results containing chunks from 2+ machines                    |
|                                                                                |
|  Evaluates:                                                                    |
|   - Machines in top 10: {"AlphaBot 3000" (4 chunks), "ZenithBot Z-Series"    |
|                            (3 chunks)}                                         |
|   - Both have ≥2 results with rrf_score > 0.01                                |
|   → is_ambiguous = True                                                        |
|                                                                                |
|  Data written (ephemeral/session):                                             |
|    pending_query: "What is error E101?"   → [REDIS]  session:{uuid}           |
|    machines_found: ["AlphaBot 3000",                                           |
|                     "ZenithBot Z-Series"] → [REDIS]  session:{uuid}           |
|    query_log (outcome=DISAMBIGUATED)      → [DB]     query_logs               |
|                                                                                |
|  HTTP Response (returned immediately; no LLM call):                           |
|    {                                                                           |
|      "has_answer": false,                                                      |
|      "requires_clarification": true,                                           |
|      "clarification_question": "Which machine?",                               |
|      "candidate_machines": ["AlphaBot 3000", "ZenithBot Z-Series"],           |
|      "pending_query": "What is error E101?"                                    |
|    }                                                                           |
+------+------------------------------------------------------------------------+
       |
       v
  Technician browser renders DisambiguationCard
  - Displays two machine buttons
  - Displays: "Error code E101 appears in multiple machine manuals..."

Turn 2: Machine Selection
--------------------------------------

Technician clicks "AlphaBot 3000" button.
       |
       | POST /api/conversation/disambiguate
       | {session_id: "uuid-abc", machine_model: "AlphaBot 3000"}
       |
       v
+------+------------------------------------------------------------------------+
|  DISAMBIGUATION RESOLUTION                                                     |
|                                                                                |
|  Input:   session_id, selected machine_model                                   |
|                                                                                |
|  Actions: - Read session from Redis                                            |
|           - Set session.machine_model = "AlphaBot 3000"                        |
|           - Retrieve session.pending_query = "What is error E101?"             |
|           - Clear session.pending_query (consumed)                             |
|           - Write updated session to Redis                                     |
|           - Internally invoke query pipeline with:                             |
|             {query: pending_query, machine_model: "AlphaBot 3000",             |
|              session_id: "uuid-abc"}                                            |
|                                                                                |
|  Reads:    session (pending_query) → [REDIS]  session:{uuid}                  |
|  Writes:   machine_model           → [REDIS]  session:{uuid}                  |
|  Writes:   pending_query = null    → [REDIS]  session:{uuid}                  |
+------+------------------------------------------------------------------------+
       |
       | Internally invokes full query pipeline
       | with query = "What is error E101?" and machine_model = "AlphaBot 3000"
       |
       v
  [Stages 2-13 of Query Processing run]
  - Session machine_model = "AlphaBot 3000" (now set)
  - BM25 retrieval: filtered to AlphaBot 3000 index
  - pgvector retrieval: WHERE machine_model = 'AlphaBot 3000'
  - Machine filter: only AlphaBot 3000 chunks pass
  - Evidence sufficient: AlphaBot 3000 E101 chunks present with high score
  - Context assembly: only AlphaBot 3000 content
  - LLM generates: "E101 on AlphaBot 3000 is Motor Overload Fault..."
  - Citations: only AlphaBot 3000 manual chunks
       |
       v
+------+------------------------------------------------------------------------+
|  HTTP Response (scoped answer):                                                |
|  {                                                                             |
|    "has_answer": true,                                                         |
|    "answer": "E101 on AlphaBot 3000 indicates Motor Overload Fault...",       |
|    "confidence": "HIGH",                                                       |
|    "citations": [{                                                             |
|      "manual_name": "AlphaBot 3000 Operations Manual",                         |
|      "page_number": 34,                                                        |
|      "section_title": "Chapter 5: Error Codes"                                |
|    }]                                                                          |
|  }                                                                             |
+------+------------------------------------------------------------------------+
       |
       v
  Technician browser renders full answer with AlphaBot 3000 citations.
  Session now has machine_model = "AlphaBot 3000" for all subsequent turns.

Turn 3 (follow-up): "How do I reset it?"
--------------------------------------

       |
       | POST /api/query
       | {query: "How do I reset it?", session_id: "uuid-abc"}
       |
       v
  Session hydration: machine_model = "AlphaBot 3000" (set from Turn 2)
  Query analysis: resolved_machine = "AlphaBot 3000" (from session)
  Pipeline runs scoped to AlphaBot 3000.
  No disambiguation required.
  Answer covers E101 reset procedure from AlphaBot 3000 manual.
```

---

## 5. Data Summary: What Is Stored vs Ephemeral

| Data | Persistent? | Store | Lifetime |
|------|------------|-------|---------|
| Raw PDF file | Yes | File system | Until manual deleted |
| Manual metadata | Yes | PostgreSQL `manuals` | Until manual deleted |
| Chunk text and metadata | Yes | PostgreSQL `chunks` | Until manual deleted |
| Chunk embedding vectors | Yes | PostgreSQL `chunks.embedding` | Until manual deleted |
| Ingestion job record | Yes | PostgreSQL `ingestion_jobs` | Indefinite (audit trail) |
| Query logs | Yes | PostgreSQL `query_logs` | Indefinite (analytics) |
| Session (machine context, history) | Ephemeral | Redis | 30-min TTL; lost on Redis restart |
| BM25 index | Ephemeral | Application memory | Rebuilt on startup and after ingest |
| Query embedding vector | Ephemeral | In-memory | Duration of single request |
| Retrieved candidate lists | Ephemeral | In-memory | Duration of single request |
| Assembled context string | Ephemeral | In-memory | Duration of single request |
| LLM prompt | Ephemeral | In-memory | Duration of single request |
| Raw LLM JSON response | Ephemeral | In-memory | Duration of single request |
| Pending query (disambiguation) | Ephemeral | Redis | Until consumed or session expires |

---

*End of Data Flow*
