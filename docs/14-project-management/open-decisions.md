# Open Decisions

> **Purpose:** Records design decisions that have not yet been finalized. Each entry captures the current working assumption, the alternatives considered, and the consequences of choosing wrong. Decisions must be closed before the implementation phase that depends on them begins.
>
> **Status values:** Open, In Progress, Decided, Deferred.

---

## Decision Index

| ID | Question | Status | Must Decide By |
|---|---|---|---|
| DEC-001 | OCR inclusion in MVP | Open | Phase 1 start |
| DEC-002 | BM25 storage backend | Open | Phase 1 start |
| DEC-003 | Session storage backend | Open | Phase 0 complete |
| DEC-004 | File storage approach | Open | Phase 0 complete |
| DEC-005 | Embedding batch size | Open | Phase 1 start |
| DEC-006 | Reranker implementation | Open | Phase 2 start |
| DEC-007 | Frontend response streaming | Open | Phase 5 start |
| DEC-008 | Test PDF generation approach | Open | Phase 6 start |

---

## DEC-001 — OCR: Include pytesseract in MVP or Defer?

| Field | Value |
|---|---|
| **Decision ID** | DEC-001 |
| **Decision Question** | Should the MVP ingestion pipeline include OCR (via pytesseract) to handle scanned PDFs and image-based pages, or should OCR be deferred to a post-hackathon phase? |
| **Current Assumption** | Defer. The MVP will rely on PyMuPDF's native text extraction only. PDFs that contain scanned images without embedded text will produce empty or sparse chunks; this is acceptable for the demo if demo PDFs are digitally created. |
| **Alternatives** | **Include pytesseract in Phase 1:** Add pytesseract as a fallback for pages where PyMuPDF extracts fewer than 50 characters. Adds ~200MB to the Docker image (tesseract binary), increases ingestion time for scanned pages, and introduces a new failure mode (OCR quality on poor scans). **Use Google Vision API instead of pytesseract:** Higher quality OCR, but another API dependency with rate limits and cost. Significantly increases complexity. |
| **Impact if Assumption Wrong** | If the demo PDFs turn out to be scanned (image-only), the system will ingest 0 or near-0 chunks from them, resulting in refusal on all queries. This would be a critical demo failure. Mitigation: verify all demo PDFs are digital (text-selectable) before committing to the assumption. If any are scanned, pivot immediately. |
| **When to Decide** | Before Phase 1 development begins. Depends on confirming the format of the PDFs to be used in the demo. |
| **Decision Owner** | Backend lead |
| **Status** | Open |

---

## DEC-002 — BM25 Storage: In-Memory (rank_bm25) or Persisted to Disk (Whoosh / tantivy)?

| Field | Value |
|---|---|
| **Decision ID** | DEC-002 |
| **Decision Question** | Should the BM25 index be held entirely in application memory using the `rank_bm25` Python library, or persisted to a disk-based index using Whoosh or tantivy (via the `tantivy-py` binding)? |
| **Current Assumption** | In-memory with `rank_bm25`. The index is rebuilt from the database on application startup. For the demo corpus (< 1,000 chunks), this takes under a second and requires no additional infrastructure. |
| **Alternatives** | **Whoosh (pure Python):** Persisted to disk, survives restarts without rebuild, supports incremental updates. Slower query performance than tantivy; adds disk I/O complexity. Suitable for medium corpora. **tantivy-py:** Rust-based, very fast, supports incremental indexing. More complex to set up in Docker; binary dependency. Overkill for demo scale. **PostgreSQL full-text search (tsvector):** Entirely eliminates the BM25 library. Uses PostgreSQL's built-in FTS engine. Not BM25 natively but ts_rank approximates it. Reduces external dependencies. |
| **Impact if Assumption Wrong** | If the corpus grows to tens of thousands of chunks during the demo (e.g., if many large manuals are ingested), in-memory BM25 index rebuild at startup could take 10–30 seconds and consume significant RAM. In a hackathon context this is unlikely but possible if the seed script is re-run multiple times without truncating the database. Mitigation: add a startup log line showing index rebuild time; add a max-chunks guard that warns if the in-memory index exceeds 50MB. |
| **When to Decide** | Before Phase 1 development begins. The choice affects the ingestion pipeline architecture. |
| **Decision Owner** | Backend lead |
| **Status** | Open |

---

## DEC-003 — Session Storage: Redis or PostgreSQL?

| Field | Value |
|---|---|
| **Decision ID** | DEC-003 |
| **Decision Question** | Should session state (active `machine_id`, conversation history, TTL) be stored in Redis or in the existing PostgreSQL database? |
| **Current Assumption** | Redis. The `docker-compose.yml` already includes a Redis service. Redis is the idiomatic choice for session storage: TTL is built-in, reads are O(1), and there is no schema migration needed when the session data shape changes. |
| **Alternatives** | **PostgreSQL:** Store sessions in a `sessions` table with a `last_active_at` timestamp. A background task (or pg_cron) expires stale sessions. Eliminates the Redis dependency entirely — one fewer service. Slightly more complex expiry logic. For a hackathon, simplicity is a valid argument in favour. **JWT-encoded session:** Encode `machine_id` and conversation history directly in the JWT payload. Stateless — no storage needed. But conversation history can grow large and JWT payloads are typically kept small; also, server-side invalidation becomes impossible. Only viable if conversation history is not stored. |
| **Impact if Assumption Wrong** | If Redis is not available (fails to start, port conflict), all session-dependent features (post-disambiguation state, conversation history) fail. PostgreSQL is already a required dependency and is more resilient as a single point of failure. |
| **When to Decide** | Before Phase 0 is declared complete (Phase 4 depends on this decision). |
| **Decision Owner** | Backend lead |
| **Status** | Open |

---

## DEC-004 — File Storage: Local Filesystem or Object Storage (MinIO in Docker)?

| Field | Value |
|---|---|
| **Decision ID** | DEC-004 |
| **Decision Question** | Should uploaded PDF files be stored on the local filesystem inside the Docker container (mounted volume), or in an object storage service (MinIO running as an additional Docker Compose service)? |
| **Current Assumption** | Local filesystem with a Docker volume mount. `UPLOAD_DIR` maps to a host volume so files survive container restarts. This is simple, requires no additional service, and is sufficient for a hackathon. |
| **Alternatives** | **MinIO (S3-compatible object storage):** Production-grade, supports presigned URLs, scales horizontally, integrates with the `boto3` SDK. Adds another Docker Compose service (adds ~250MB image, another port to expose). Significantly increases setup complexity for zero additional demo value. **Shared volume between API containers:** If the API is ever scaled to multiple instances, local filesystem storage becomes a problem (files not shared across containers). Not relevant for a single-instance demo. |
| **Impact if Assumption Wrong** | Local filesystem storage is fine for the demo. The risk is not technical correctness but production readiness — judges may ask how file storage scales. Answer: swap `UPLOAD_DIR` handler for an `S3Client` call; the rest of the pipeline is unchanged because the pipeline receives a file path, not a storage-layer object. |
| **When to Decide** | Before Phase 0 is complete. Affects how the upload endpoint stores files. |
| **Decision Owner** | Backend lead |
| **Status** | Open |

---

## DEC-005 — Embedding Batch Size: Per-Chunk or Batches of 100?

| Field | Value |
|---|---|
| **Decision ID** | DEC-005 |
| **Decision Question** | When embedding document chunks during ingestion, should each chunk be embedded individually (one API call per chunk) or should chunks be batched (e.g., 100 chunks per API call) to reduce API round trips and rate limit exposure? |
| **Current Assumption** | Batch of 100 chunks per API call. The Gemini `text-embedding-004` model supports batch embedding. Batching reduces the number of API calls by ~100x, which is the primary lever for staying within rate limits during the demo seed ingestion. |
| **Alternatives** | **Per-chunk embedding:** Simpler code path. Each chunk is embedded immediately after creation. Easier to retry individual failures. Approximately 100x more API calls for a 1,000-chunk corpus — much more likely to hit rate limits. **Batch of 50 or 25:** A smaller batch reduces the impact of a single failed API call (fewer chunks to retry) at the cost of more total calls. |
| **Impact if Assumption Wrong** | If the Gemini API rejects batch requests larger than a certain size (which varies by tier), the batch call will fail and no chunks will be embedded until the error is handled. Mitigation: implement the batch embedder with configurable `EMBED_BATCH_SIZE` and graceful retry/fallback to smaller batches on failure. Test the batch size against the actual Gemini API before the demo. |
| **When to Decide** | Before Phase 1 development begins. Affects the embedding module architecture. |
| **Decision Owner** | Backend lead |
| **Status** | Open |

---

## DEC-006 — Reranker: Local Cross-Encoder or Cohere Rerank API?

| Field | Value |
|---|---|
| **Decision ID** | DEC-006 |
| **Decision Question** | Should the cross-encoder reranking step use a locally-loaded HuggingFace cross-encoder model, or call the Cohere Rerank API? |
| **Current Assumption** | Local cross-encoder (`cross-encoder/ms-marco-MiniLM-L-6-v2`). Loaded into memory at startup. No additional API key needed. No network latency for the reranking call. Works offline. Model is ~85MB. |
| **Alternatives** | **Cohere Rerank API:** Higher quality reranking. Requires a Cohere API key (free tier available). Adds network latency (~200–500ms) to every query. Adds another external dependency with its own rate limits. If Cohere's API is down, reranking fails entirely. **No reranking (RRF only):** Simplest option. Removes the reranking latency from the critical path entirely. Lower retrieval quality on ambiguous queries. Acceptable as a fallback (see implementation-roadmap.md Tier 3 cuts). |
| **Impact if Assumption Wrong** | If the local model is too slow (see RISK-003) or too large for the demo environment's memory, Cohere Rerank API becomes the fallback. Prepare the Cohere API key in advance so this fallback is one config change away. |
| **When to Decide** | Before Phase 2 development begins. Affects the retrieval module's external dependencies. |
| **Decision Owner** | Backend lead |
| **Status** | Open |

---

## DEC-007 — Frontend Response Streaming: Stream Tokens or Wait for Full Response?

| Field | Value |
|---|---|
| **Decision ID** | DEC-007 |
| **Decision Question** | Should the frontend stream LLM response tokens as they are generated (Server-Sent Events or WebSocket), or wait for the complete structured response before rendering? |
| **Current Assumption** | Wait for full response. The response is a `StructuredAnswer` JSON object — streaming partial JSON is complex to parse and render progressively. Waiting for the full response is simpler and produces a cleaner UI (citations and answer appear together). |
| **Alternatives** | **Streaming via Server-Sent Events (SSE):** The API streams tokens as they arrive from Gemini. The frontend renders text progressively, improving perceived responsiveness for long answers. Requires careful handling: citations and structured fields cannot be rendered until the stream is complete and the JSON is assembled. Adds complexity to both the API layer (streaming response wrapper) and the frontend (SSE client, incremental JSON parsing). **WebSocket:** Bidirectional, but adds more overhead than SSE for a unidirectional token stream. Overkill for this use case. |
| **Impact if Assumption Wrong** | If LLM response latency is consistently above 5 seconds (longer procedures, larger context), the lack of streaming makes the UI feel frozen. A loading spinner mitigates this but does not eliminate the perception of slowness. If this becomes a demo issue, add a server-side estimated time display ("Generating answer...") with a progress indicator. Full streaming is a Phase 2 enhancement post-hackathon. |
| **When to Decide** | Before Phase 5 frontend development begins. Affects the API response format and the frontend component architecture. |
| **Decision Owner** | Full-stack lead |
| **Status** | Open |

---

## DEC-008 — Test PDF Generation: reportlab Synthetic PDFs or Real Machine Manuals?

| Field | Value |
|---|---|
| **Decision ID** | DEC-008 |
| **Decision Question** | Should the demo seed data use synthetically generated PDFs created with the `reportlab` Python library, or should the team source real machine manuals from manufacturer websites or the hackathon organiser? |
| **Current Assumption** | Synthetic PDFs via reportlab. Reasons: (1) Real PDFs may have licensing restrictions that prevent redistribution. (2) Real PDFs may have complex layouts that stress-test the PDF parser in ways that are hard to debug under time pressure (see RISK-002). (3) Synthetic PDFs can be crafted to include exactly the content needed for the demo scenarios — specific error codes, specific procedures, demonstrably different answers for the same error code across different machines. |
| **Alternatives** | **Real machine manuals (public domain or openly licensed):** More authentic demo. Some industrial equipment manuals are freely available (older CNC machines, generic industrial controllers). The RAG pipeline looks more impressive with real-world content. Risk: parsing failures, licensing questions. **Mix of real and synthetic:** Use real manuals for one machine and synthetic for the others. Demonstrates real-world capability on one machine while retaining control over the content that drives the key demo scenarios. |
| **Impact if Assumption Wrong** | If synthetic PDFs are obviously synthetic (short, simple, lacking realistic industrial terminology), judges may underestimate the system's capability. Mitigation: design the synthetic PDFs to include realistic-sounding technical content — specific model numbers, part numbers, torque values, firmware version numbers — even if they are invented. The content does not need to be accurate; it needs to look like a machine manual. |
| **When to Decide** | Before Phase 6 (Demo Polish) begins. The seed script architecture depends on this choice. |
| **Decision Owner** | Product / demo lead |
| **Status** | Open |

---

*See also: [docs/14-project-management/risks.md](risks.md) for risk register, [docs/14-project-management/implementation-roadmap.md](implementation-roadmap.md) for phase timeline.*
