# MechMind — System Architecture

**Document version:** 1.0
**Status:** Approved
**Last updated:** 2026-09-04

---

## 1. Architectural Overview

MechMind is structured as a two-path system: an **ingestion path** that converts PDF manuals into searchable vector-indexed content, and a **query path** that takes a technician's question and returns a cited, structured answer. Both paths share the same data stores and embedding service. The LLM is called only in the query path and only after evidence sufficiency is validated.

The system is designed for single-machine Docker Compose deployment in the hackathon context, with clear horizontal scaling paths described in Section 6.

---

## 2. Ingestion Path

### 2.1 Architecture Diagram

```
+------------------+
|   Admin Browser  |
+--------+---------+
         |  multipart/form-data POST /api/ingest/upload
         v
+--------+---------+
|   File Validator |
|  (MIME, size,    |
|   SHA-256 hash)  |
+--------+---------+
         |  validated bytes + metadata
         v
+--------+---------+
|   PDF Parser     |
|  (PyMuPDF/fitz)  |
|  extracts pages, |
|  fonts, metadata |
+--------+---------+
         |  List[PageContent{page_num, raw_text, tables}]
         v
+--------+---------+
|  Table Detector  |
|  (PyMuPDF table  |
|   detection API) |
+--------+---------+
         |  tables marked, coordinates mapped
         v
+--------+---------+
|  Text Cleaner    |
|  (normalize ws,  |
|  strip headers/  |
|  footers, fix    |
|  ligatures)      |
+--------+---------+
         |  cleaned text per page
         v
+--------+---------+
|  Semantic        |
|  Chunker         |
|  (section-aware, |
|  400-600 tokens, |
|  50-token overlap)|
+--------+---------+
         |  List[Chunk{text, page, section, token_count}]
         v
+--------+---------+
|  Metadata        |
|  Enricher        |
|  (error code     |
|  detection,      |
|  is_table flag,  |
|  machine model)  |
+--------+---------+
         |  List[EnrichedChunk{...metadata fields}]
         v
+--------+---------+
|  Embedding       |
|  Service         |
|  (Gemini         |
|  text-embedding  |
|  -004, batched)  |
+--------+---------+
         |  List[ChunkWithVector{chunk, vector[768]}]
         v
    +----+----+---------------------+
    |                               |
    v                               v
+---+--------+           +----------+---------+
| pgvector   |           |  BM25 Index        |
| INSERT     |           |  (rank-bm25,       |
| chunks +   |           |  in-memory,        |
| embeddings |           |  rebuilt on ingest)|
+---+--------+           +--------------------+
    |
    v
+---+--------+
| Ingestion  |
| Job:       |
| COMPLETE   |
+------------+
```

### 2.2 Component Responsibilities — Ingestion Path

#### File Validator
- **Input:** HTTP multipart upload (filename, MIME type, file bytes)
- **Output:** Validated file bytes + machine_model metadata, or HTTP error
- **Responsibility:** Enforce MIME type (application/pdf), file size limit (100 MB), compute SHA-256 hash, reject duplicates by querying `manuals` table on hash, write raw file to storage

#### PDF Parser (PyMuPDF/fitz)
- **Input:** PDF file bytes
- **Output:** List of `PageContent` objects: `{page_number, raw_text, tables, page_width, page_height, fonts}`
- **Responsibility:** Open PDF with `fitz.open()`, iterate pages, extract text blocks with `page.get_text("blocks")`, extract table structures with `page.find_tables()`, capture embedded metadata from `doc.metadata`
- **Failure behavior:** If PDF cannot be opened (corrupted, encrypted), mark job FAILED with reason; do not silently skip

#### Table Detector
- **Input:** `PageContent` with raw table data from PyMuPDF
- **Output:** `PageContent` with tables converted to structured text representations
- **Responsibility:** For each detected table, convert rows/cells to markdown table format or structured key-value text; assign table title from surrounding text if detectable; tag table boundaries so chunker can treat them as atomic units

#### Text Cleaner
- **Input:** Raw text per page
- **Output:** Cleaned text per page
- **Responsibility:** Normalize whitespace, collapse multiple newlines, fix common ligature artifacts (fi → fi, fl → fl), remove running headers and footers by detecting repeated text patterns across pages, strip page number markers

#### Semantic Chunker
- **Input:** List of cleaned pages with table markers
- **Output:** List of `Chunk` objects with text, page_number, section_title, chunk_index, token_count
- **Responsibility:** Split text at section boundary signals (heading patterns: numbered headings, ALL CAPS lines, font-size-derived hierarchy from PyMuPDF blocks); target 400–600 tokens; apply 50-token overlap between consecutive same-section chunks; treat tables as atomic chunks regardless of size; discard fragments < 50 tokens unless they contain an error code pattern

#### Metadata Enricher
- **Input:** List of `Chunk` objects
- **Output:** List of `EnrichedChunk` with `contains_error_code`, `error_codes[]`, `is_table`, `is_table_row`, `machine_model`, `manual_id`
- **Responsibility:** Run error code regex over chunk text; extract all matching codes; populate metadata fields; associate chunk with parent manual_id and machine_model from ingestion context

#### Embedding Service (Ingestion)
- **Input:** List of `EnrichedChunk`
- **Output:** List of `ChunkWithVector` (chunk + 768-dimensional float array)
- **Responsibility:** Call Gemini text-embedding-004 API in batches of 100; task_type=RETRIEVAL_DOCUMENT; handle rate limits with exponential backoff; track per-chunk embedding status; on permanent failure after retries, mark chunk as EMBEDDING_FAILED and continue

#### pgvector Insert
- **Input:** `ChunkWithVector`
- **Output:** Chunk record in `chunks` table with `embedding` column populated
- **Responsibility:** INSERT into chunks table; pgvector handles vector indexing via IVFFlat or HNSW index on `embedding` column

#### BM25 Index Update
- **Input:** All chunks for a manual (or all active chunks)
- **Output:** Updated in-memory BM25 index
- **Responsibility:** Rebuild rank-bm25 index from all active, embedded chunks; tokenize text (lowercase, split on whitespace and punctuation except hyphens); store index in application memory keyed by machine_model for filtered retrieval

---

## 3. Query Path

### 3.1 Architecture Diagram

```
+------------------+
| Technician       |
| Browser          |
+--------+---------+
         |  POST /api/query {query, session_id, machine_model?}
         v
+--------+----------+
|  Query Classifier |
|  (error code vs   |
|  natural language,|
|  entity extract)  |
+--------+----------+
         |  QueryContext{query, query_type, detected_machine?}
         v
+--------+----------+
| Machine / Model   |
| Detector          |
| (session lookup + |
|  entity extract)  |
+--------+----------+
         |  QueryContext + {machine_model: str | None}
         v
+--------+----------+
|  Embedding        |
|  Service (Query)  |
|  (Gemini,         |
|   task=QUERY)     |
+--------+----------+
         |  query_vector[768]
         v
    +----+----+
    |  Parallel retrieval
    v         v
+---+---+  +--+------+
| BM25  |  | pgvector|
| Search|  | ANN     |
| (top  |  | Search  |
|  20)  |  | (top 20)|
+---+---+  +--+------+
    |         |
    +----+----+
         |  candidates from both retrievers
         v
+--------+----------+
|  RRF Fusion       |
|  (Reciprocal Rank |
|   Fusion, k=60)   |
+--------+----------+
         |  unified ranked list (up to 40 candidates)
         v
+--------+----------+
|  Machine Filter   |
|  (retain only     |
|  chunks matching  |
|  machine context, |
|  if known)        |
+--------+----------+
         |  filtered candidates (top 10)
         v
+--------+----------+
| Cross-Encoder     |
| Reranker          |
| (optional, Could  |
|  Have feature)    |
+--------+----------+
         |  reranked top 10
         v
+--------+----------+
| Ambiguity         |
| Detector          |
| (multi-machine    |
|  in top results?) |
+--------+----------+
         |
    +----+----+
    |ambiguous?
    YES        NO
    |          |
    v          v
+---+---+  +---+--------+
|Clarif.|  | Evidence   |
|Resp.  |  | Validator  |
|(no LLM|  | (sufficiency
| call) |  |  score)    |
+---+---+  +---+--------+
    |           |
    |       +---+----+
    |       |below   |above
    |       |thresh  |thresh
    |       v        v
    |    +--+--+  +--+--------+
    |    |Refuse|  |Context   |
    |    |(no   |  |Assembler |
    |    | LLM) |  +--+-------+
    |    +------+     |
    |                 v
    |              +--+--------+
    |              |Prompt     |
    |              |Builder    |
    |              +--+--------+
    |                 |
    |                 v
    |              +--+--------+
    |              |LLM Client |
    |              |(Gemini)   |
    |              +--+--------+
    |                 |
    |                 v
    |              +--+--------+
    |              |Structured |
    |              |Output     |
    |              |Parser     |
    |              +--+--------+
    |                 |
    |                 v
    |              +--+--------+
    |              |Citation   |
    |              |Mapper     |
    |              +--+--------+
    |                 |
    +--------+--------+
             |
             v
    +--------+----------+
    |  Response         |
    |  (JSON: has_answer|
    |   answer, steps,  |
    |   confidence,     |
    |   citations...)   |
    +-------------------+
```

### 3.2 Component Responsibilities — Query Path

#### Query Classifier
- **Input:** Raw query string
- **Output:** `QueryContext{query, query_type: ERROR_CODE|NATURAL_LANGUAGE|HYBRID, detected_codes: [], detected_machine: str|None}`
- **Responsibility:** Detect error code patterns via regex; classify query type; extract machine model names from query text by matching against known models from `machine_models` table; signal intent for downstream components

#### Machine/Model Detector
- **Input:** `QueryContext` + Redis session data
- **Output:** `QueryContext` with resolved `machine_model` (str or None)
- **Responsibility:** Priority lookup: (1) explicit `machine_model` field in request, (2) session.machine_context, (3) entity extracted in classifier, (4) None (ambiguous). Store resolved machine in session if newly determined.

#### Embedding Service (Query)
- **Input:** Query string
- **Output:** 768-dimensional embedding vector
- **Responsibility:** Call Gemini text-embedding-004 with task_type=RETRIEVAL_QUERY; return vector; on API failure, signal BM25-only fallback mode

#### BM25 Retriever
- **Input:** Tokenized query, machine_model filter (optional), k=20
- **Output:** List of `{chunk_id, bm25_score, rank}`
- **Responsibility:** Score all chunks in the BM25 index against query tokens; apply machine filter if provided to pre-filter the index corpus; return top-k by score

#### Vector Retriever (pgvector ANN)
- **Input:** Query embedding vector, machine_model filter (optional), k=20
- **Output:** List of `{chunk_id, cosine_similarity, rank}`
- **Responsibility:** Execute pgvector ANN query with optional `WHERE machine_model = $1` predicate; use cosine distance operator (`<=>`)

#### RRF Fusion
- **Input:** Two ranked lists from BM25 and vector retriever
- **Output:** Unified ranked list with RRF scores
- **Responsibility:** For each unique chunk_id appearing in either list, compute RRF score: `score(d) = 1/(rank_bm25 + 60) + 1/(rank_vector + 60)` (using infinity for missing rank); sort descending by RRF score

#### Machine Filter
- **Input:** Fused candidate list, machine_model context
- **Output:** Filtered candidate list (only chunks matching machine_model, if known)
- **Responsibility:** When machine_model is known, drop candidates from other machines; when machine_model is None, retain all candidates for ambiguity detection downstream

#### Cross-Encoder Reranker (FEAT-015, Could Have)
- **Input:** Top-15 candidates + query string
- **Output:** Top-10 candidates reranked by cross-encoder score
- **Responsibility:** Joint encoding of query + chunk text pairs; outputs more precise relevance scores than bi-encoder retrieval; conditionally enabled via `ENABLE_RERANKING` env flag

#### Ambiguity Detector
- **Input:** Top-10 candidates
- **Output:** `{is_ambiguous: bool, machines_found: [str]}`
- **Responsibility:** Count distinct machine_model values in top-10 results; if multiple machines each have >= 2 results with RRF score > 0.01, flag as ambiguous; return list of machine models found

#### Evidence Validator
- **Input:** Top-10 candidates, query string, machine context
- **Output:** `{sufficiency_score: float, confidence_level: HIGH|MEDIUM|LOW|INSUFFICIENT}`
- **Responsibility:** Compute composite score from top_score, coverage_score, machine_match; apply configured thresholds; return confidence level enum

#### Context Assembler
- **Input:** Top-5 reranked candidates (chunk_ids)
- **Output:** Assembled context string with chunk text and metadata headers
- **Responsibility:** Fetch full chunk text from database; format as numbered context blocks with source attribution headers; include conversation history from session (last 3 turns)

#### Prompt Builder
- **Input:** Assembled context, query, conversation history, confidence_level
- **Output:** Formatted prompt string
- **Responsibility:** Construct system prompt (role, instructions, citation requirements, JSON schema) and user prompt (context blocks + query); include confidence_level in instructions to calibrate LLM hedging language

#### LLM Client (Gemini)
- **Input:** Formatted prompt, JSON response schema
- **Output:** Raw JSON string from LLM
- **Responsibility:** Call Gemini API with `response_mime_type="application/json"` and `response_schema` where supported; handle API errors, timeouts; on failure return error signal (do not fabricate a fallback answer)

#### Structured Output Parser
- **Input:** Raw JSON string from LLM
- **Output:** Validated `StructuredAnswer` object or parse error
- **Responsibility:** Parse JSON; validate against schema; if invalid, retry LLM call with simplified prompt (max 2 retries); on persistent failure return error response

#### Citation Mapper
- **Input:** `StructuredAnswer` with citation list (chunk_ids)
- **Output:** `StructuredAnswer` with enriched citations (manual_name, page_number, section_title, excerpt from DB)
- **Responsibility:** Validate each chunk_id exists in database; fetch chunk metadata; verify excerpt is a substring of chunk text; remove or flag invalid citations; if all citations invalid, downgrade confidence level

---

## 4. Technology Components

| Component | Technology | Version | Reason for Choice |
|-----------|-----------|---------|-------------------|
| Backend framework | FastAPI | 0.111+ | Async-native, type-annotated, automatic OpenAPI docs, excellent DI system |
| Python runtime | Python | 3.11 | Stable, asyncio improvements, wide library support |
| PDF parsing | PyMuPDF (fitz) | 1.23+ | Fast, accurate text extraction, table detection, font metadata, permissive license |
| Chunking tokenization | tiktoken | 0.5+ | Fast BPE tokenizer; cl100k_base used as proxy for token counting |
| Keyword retrieval | rank-bm25 | 0.2+ | Pure Python, simple integration, sufficient for in-memory index at MVP scale |
| Vector database | pgvector | 0.5+ | PostgreSQL extension; single-DB simplicity; HNSW and IVFFlat indexing |
| Relational database | PostgreSQL | 15 | Battle-tested, rich SQL, supports pgvector, JSON columns, full-text search |
| Session cache | Redis | 7 | Fast in-memory KV; native TTL support; standard session store |
| Embeddings | Gemini text-embedding-004 | — | 768 dimensions; good multilingual quality; free tier sufficient for hackathon |
| LLM generation | Gemini 1.5 Flash / Pro | — | Long context window (handles multi-section manuals); JSON mode; unified provider with embeddings |
| Reranker model | cross-encoder/ms-marco-MiniLM-L-6-v2 | — | Small, fast, accurate; CPU-deployable; sentence-transformers library |
| Frontend framework | Next.js | 14 | TypeScript, App Router, SSE client support, good DX |
| Frontend language | TypeScript | 5+ | Type safety for API response schema validation |
| UI components | Tailwind CSS + shadcn/ui | — | Rapid prototyping, accessible defaults |
| Containerization | Docker Compose | v2 | Single-command local deployment; describes production topology |
| Background tasks | FastAPI BackgroundTasks / Celery | — | BackgroundTasks for MVP; Celery with Redis broker for scale |

---

## 5. Deployment Topology

### 5.1 Hackathon — Single Machine (Docker Compose)

```
+---------------------------------------------+
|  Host Machine (Laptop / Cloud VM)            |
|                                              |
|  +------------------+  +-----------------+  |
|  |  mechmind-api    |  |  mechmind-web   |  |
|  |  (FastAPI)       |  |  (Next.js)      |  |
|  |  :8000           |  |  :3000          |  |
|  +--------+---------+  +-----------------+  |
|           |                                  |
|  +--------+---------+  +-----------------+  |
|  |  postgres        |  |  redis          |  |
|  |  + pgvector      |  |  (sessions)     |  |
|  |  :5432           |  |  :6379          |  |
|  +------------------+  +-----------------+  |
|                                              |
|  Volumes:                                    |
|    postgres_data (persistent)                |
|    manual_uploads (persistent)               |
+---------------------------------------------+
          |
          | External API calls (HTTPS)
          v
+------------------+
|  Google Gemini   |
|  API             |
|  (embeddings +   |
|  generation)     |
+------------------+
```

All services run in the same Docker network. No load balancer. No reverse proxy in hackathon config (optional Nginx for TLS if deploying to a cloud VM for judge access).

### 5.2 Production Scale-Out Path (Reference Architecture)

When load or data volume grows beyond single-instance capacity:

1. **FastAPI**: Move to multiple replicas behind Nginx or an API Gateway; add Celery workers for ingestion jobs (Redis as broker)
2. **PostgreSQL + pgvector**: Upgrade to PostgreSQL read replicas for query path; connection pooling via PgBouncer; consider migrating vector index to Qdrant when chunk count exceeds 10M
3. **Redis**: Redis Cluster or Redis Sentinel for HA
4. **BM25 Index**: Move from in-memory to Elasticsearch or OpenSearch for distributed keyword search
5. **Embeddings/LLM**: Add request caching layer (Redis) for repeated queries; implement per-tenant API key rotation

---

## 6. Data Stores

### 6.1 PostgreSQL (Relational + Vector)

Primary persistent data store. Stores all business entities and vector embeddings in the same database.

| Table | Purpose |
|-------|---------|
| `manuals` | Manual metadata: name, machine_model, version, file_hash, page_count, is_active, ingestion status |
| `chunks` | Chunk text, metadata, and embedding vector (pgvector column) |
| `ingestion_jobs` | Job status tracking, per-stage progress, error messages |
| `machine_models` | Known machine model names and aliases for entity extraction |
| `query_logs` | Every query logged with session_id, outcome, evidence score, latency |

pgvector extension provides the `vector(768)` data type and the `<=>` cosine distance operator.
IVFFlat or HNSW index on `chunks.embedding` enables sub-linear approximate nearest-neighbor search.

### 6.2 Redis (Session Cache)

Ephemeral session data with TTL. All data here is reconstructable; Redis failure causes degraded (not broken) behavior.

| Key Pattern | Content | TTL |
|-------------|---------|-----|
| `session:{uuid}` | Session JSON: machine_context, conversation_history, pending_query, last_chunk_ids | 30 min |

### 6.3 File Storage (Local Volume / S3)

Raw PDF files stored for audit and potential re-ingestion. Not queried at runtime; only accessed during ingestion.

In hackathon: local Docker volume. In production: S3-compatible object storage (AWS S3, GCS, MinIO).

---

*End of System Architecture*
