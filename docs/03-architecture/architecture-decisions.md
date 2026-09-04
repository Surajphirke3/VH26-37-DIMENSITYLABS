# MechMind — Architecture Decision Records (ADRs)

**Document version:** 1.0
**Status:** All records accepted
**Last updated:** 2026-09-04

ADRs document significant technical decisions, their context, rationale, and consequences. Each record is immutable once accepted — if a decision changes, a new ADR supersedes the old one (which is marked Superseded).

---

## ADR-001: PostgreSQL + pgvector Over Dedicated Vector Database

**Status:** Accepted

### Context

MechMind requires storing, indexing, and querying vector embeddings for all text chunks. The market offers dedicated vector databases (Pinecone, Weaviate, Qdrant, Milvus) specifically built for this purpose. We must choose between a dedicated vector DB and extending our existing relational database with vector capability.

The system also requires relational operations: filtering chunks by machine_model and manual_id, joining chunks with manual metadata, transactional ingestion (chunk insert + metadata update), and administrative queries. These are relational workloads that vector databases handle poorly or not at all.

### Decision

Use PostgreSQL 15 with the pgvector extension for all data storage, including vector embeddings. Do not introduce a separate vector database service.

### Rationale

- **Operational simplicity:** One database to provision, back up, monitor, and reason about. Separate vector DB adds a second stateful service with its own operational overhead, failure modes, and cost.
- **Relational joins are essential:** Queries require joining `chunks` with `manuals` for metadata (machine_model, version, is_active). In a separate vector DB, these joins would require a round-trip: query vector DB → get chunk IDs → fetch metadata from SQL → join in application code. This is slower and more complex.
- **Machine filter as SQL predicate:** Filtering by `machine_model` before or during vector search is a WHERE clause in PostgreSQL. In dedicated vector DBs, this is a metadata filter with varying performance characteristics and API complexity.
- **pgvector performance is sufficient:** At MVP scale (hundreds of thousands of chunks), pgvector with HNSW index achieves recall > 95% with sub-100ms query latency. Pinecone provides marginal improvements at significantly higher operational complexity.
- **Transactional consistency:** Inserting a chunk and its embedding in the same PostgreSQL transaction ensures no chunk exists without its embedding and vice versa. This consistency is impossible across two separate systems.
- **Free tier for hackathon:** Self-hosted PostgreSQL + pgvector costs nothing. Managed vector DB services have usage-based pricing that may exceed hackathon budgets.

### Alternatives Considered

| Alternative | Reason Rejected |
|-------------|----------------|
| Pinecone | Managed SaaS cost; requires separate PostgreSQL anyway for relational data; introduces API dependency |
| Weaviate | Self-hosted complexity; GraphQL-centric API not well-suited to our access patterns; relational metadata joins are awkward |
| Qdrant | Excellent performance and filtering; however, still requires a separate PostgreSQL; dual-DB complexity not justified at MVP scale |
| Milvus | Enterprise-grade but high operational complexity; Docker setup non-trivial; overkill for hackathon |
| ChromaDB | Embedded mode lacks production scalability; persistence model is not PostgreSQL-compatible |

### Consequences

- **Positive:** Single database, simpler deployment, relational + vector in one transaction, no additional service cost.
- **Positive:** Full SQL expressiveness for admin queries, analytics, and future reporting.
- **Neutral:** pgvector index rebuild required after bulk inserts (ANALYZE/REINDEX commands); manageable in background.
- **Negative:** At very large scale (> 10M chunks), pgvector's IVFFlat index may degrade; migration to Qdrant is the documented escape hatch at that scale.
- **Negative:** Not as flexible as dedicated vector DBs for advanced filtering with very high-cardinality metadata.

---

## ADR-002: Google Gemini for Both Embeddings and Generation

**Status:** Accepted

### Context

MechMind requires two distinct AI capabilities: (1) embedding generation for chunks and queries, and (2) text generation for structured answers. These can be sourced from the same provider or different providers.

Options include: OpenAI (embeddings: text-embedding-3, generation: GPT-4o), Anthropic (no embedding model, generation: Claude), Google Gemini (embeddings: text-embedding-004, generation: Gemini 1.5), open-source (sentence-transformers for embeddings, local LLM for generation), or mixed providers.

### Decision

Use Google Gemini for both embeddings (text-embedding-004) and generation (Gemini 1.5 Flash/Pro). Single provider, single API key, unified client.

### Rationale

- **Unified provider reduces friction:** One API key, one billing account, one SDK to integrate, one rate limit to track. Mixing providers introduces separate authentication flows, multiple SDK dependencies, and independent failure surfaces.
- **Free tier for hackathon:** Gemini API has a generous free tier (15 RPM, 1M TPM for Flash) sufficient for hackathon development and demo without billing setup.
- **Context window:** Gemini 1.5 Pro supports a 1M token context window; Flash supports 128K. Both are more than sufficient for our assembled context (5 chunks × ~600 tokens = ~3000 tokens of context).
- **JSON mode / structured output:** Gemini supports `response_schema` and `response_mime_type="application/json"` for enforcing structured output, which is essential for our citation validation pipeline.
- **Embedding quality:** text-embedding-004 (768 dimensions) performs competitively with OpenAI's text-embedding-3-small on retrieval benchmarks; sufficient for technical document retrieval.
- **Alignment:** The same provider that generates embeddings and responses means the embedding space and generation model are co-designed, potentially improving instruction-following alignment.

### Alternatives Considered

| Alternative | Reason Rejected |
|-------------|----------------|
| OpenAI text-embedding-3 + GPT-4o | Higher cost, two separate API keys, both have usage-based pricing with no free tier for Generation |
| Cohere (Embed + Command R+) | Lower market adoption, less community tooling, free tier limited |
| Open-source (all-MiniLM + Llama 3) | Requires GPU hosting; significantly more infrastructure; acceptable for production but blocks hackathon velocity |
| Anthropic Claude (generation only, no embeddings) | No embedding model; would require a separate embedding provider; violates unified-provider goal |

### Consequences

- **Positive:** Single integration point; simpler error handling; unified rate limiting.
- **Positive:** Zero cost at hackathon scale; free tier covers development and demo.
- **Negative:** Lock-in to Google's API changes; price increases affect both capabilities simultaneously.
- **Negative:** If Gemini API is down, both embedding and generation are unavailable (though BM25-only fallback mitigates query-time embedding dependency).
- **Neutral:** Gemini API region restrictions may apply in some deployment environments; documented in runbook.

---

## ADR-003: Hybrid Retrieval (BM25 + Vector) Over Pure Vector Search

**Status:** Accepted

### Context

The system must retrieve relevant chunks for two fundamentally different query types:
1. **Exact error code queries:** "E101" — the user wants exact text matching of a known code string
2. **Semantic symptom queries:** "spindle making grinding noise" — the user describes a problem in natural language, not using the manual's exact vocabulary

Pure vector search handles (2) well but often fails (1) when exact string matches are not strongly represented in the embedding space, especially for short alphanumeric codes. Pure BM25 handles (1) well but fails (2) because symptom descriptions may use different words than the manual.

### Decision

Use hybrid retrieval combining BM25 (rank-bm25) and pgvector ANN search in parallel, fused with Reciprocal Rank Fusion (RRF). Both methods run on every query; neither is pre-selected based on query type.

### Rationale

- **Error codes need exact match:** "E101" as a BM25 query scores the chunk containing "E101" at the top of the BM25 ranking. The same query as a vector search may retrieve semantically related chunks (motor fault content) that do not contain "E101" at all, causing the wrong chunk to rank first.
- **Semantic queries need embedding similarity:** "spindle vibration" may not appear verbatim in the manual. The manual may say "excessive radial runout" or "bearing resonance." Vector search finds this content by similarity; BM25 scores it near zero.
- **Hybrid is strictly better than either alone:** RRF fusion promotes chunks that rank well in both methods. A chunk containing an exact error code AND semantic relevance gets a higher fused score than a chunk with only one signal. This is the expected behavior for error code queries with contextual descriptions ("E101 motor fault in AlphaBot spindle assembly").
- **RRF is parameter-efficient:** The only tunable parameter is the k constant (default 60). Unlike learned fusion weights, RRF is robust out of the box and does not require labeled training data to configure.
- **No query classification needed:** We do not need to classify a query as "error code type" or "semantic type" before choosing a retrieval method. Both methods always run. This simplifies the pipeline and handles hybrid queries naturally.

### Alternatives Considered

| Alternative | Reason Rejected |
|-------------|----------------|
| Pure vector search (pgvector only) | Fails exact error code matching; "E101" and "E201" may have similar embeddings causing code confusion |
| Pure BM25 keyword search | Fails symptom queries; cannot bridge vocabulary gap between technician language and manual terminology |
| Query classification + conditional retrieval | More complex; boundary cases (queries that are both code + semantic) require heuristics; single pipeline is simpler and safer |
| Learned sparse retrieval (SPLADE) | Higher quality sparse retrieval but requires fine-tuned model and additional inference infrastructure; overkill for MVP |

### Consequences

- **Positive:** Handles both exact code queries and semantic symptom queries without query preprocessing.
- **Positive:** RRF fusion is additive — it cannot perform worse than either method alone in expectation.
- **Positive:** No training data required; no query-type classifier to maintain.
- **Neutral:** Two retrieval methods add complexity; two code paths to test and maintain.
- **Negative:** Slightly higher latency than single-method retrieval (two parallel calls vs one); mitigated by running BM25 and pgvector concurrently.
- **Negative:** BM25 index is in-memory; at very large scale (millions of chunks), memory pressure requires moving to Elasticsearch.

---

## ADR-004: Cross-Encoder Reranking Over Retrieval-Only Scoring

**Status:** Accepted (as Could Have; conditionally enabled in MVP)

### Context

After hybrid retrieval and RRF fusion, the system has a list of candidates ranked by approximate relevance scores. These scores are computed by independent encoders (BM25 scores chunks against query tokens separately; pgvector computes cosine similarity of independently encoded query and chunk vectors). Neither method considers the query and chunk jointly.

Cross-encoders process the query and chunk together, allowing attention across both texts simultaneously. This produces significantly more precise relevance scores but is more computationally expensive.

### Decision

Include a cross-encoder reranking step (cross-encoder/ms-marco-MiniLM-L-6-v2 via sentence-transformers) applied to the top-15 RRF candidates, returning top-5 for context assembly. Enabled via `ENABLE_RERANKING=true` environment flag. Default enabled in production, optional for hackathon MVP.

### Rationale

- **Precision over recall is the stated requirement:** Factory floor troubleshooting requires that the top-ranked chunks are the most precisely relevant. An irrelevant chunk in position 1 of the context causes the LLM to answer from the wrong content. Reranking specifically improves precision at the top of the list.
- **Context window is limited:** We pass top-5 chunks to the LLM as context. If retrieval returns the best chunk in position 8 (below the context window cutoff), the LLM never sees it. Reranking ensures the best chunks are in the top-5.
- **Small model, CPU-deployable:** MiniLM-L-6-v2 runs on CPU in under 300ms for 15 pairs; no GPU required. The latency cost is acceptable.
- **Complementary to hybrid retrieval:** Hybrid retrieval maximizes recall (gets the right chunks into the candidate list); reranking maximizes precision (orders them correctly). These are complementary, not redundant.

### Alternatives Considered

| Alternative | Reason Rejected |
|-------------|----------------|
| No reranking; use RRF scores as final order | Acceptable for MVP; acceptable recall but lower precision in edge cases |
| Larger cross-encoder (ms-marco-MiniLM-L-12-v2) | Better accuracy but ~2x latency; L-6-v2 is the recommended accuracy/speed tradeoff |
| LLM-as-reranker (ask Gemini to rank candidates) | Too slow (adds LLM call before context assembly); too expensive at scale |
| Cohere Rerank API | External dependency, API cost, not appropriate for hackathon free-tier constraint |

### Consequences

- **Positive:** Measurably improves answer quality for edge-case queries where retrieval order matters.
- **Positive:** Conditionally enabled; system degrades gracefully to RRF-only when disabled.
- **Neutral:** Adds sentence-transformers as a dependency and ~200-300ms to query latency.
- **Negative:** Model file (~25 MB) must be downloaded at container startup; cached in Docker layer.

---

## ADR-005: Evidence Sufficiency Gate Before LLM Call

**Status:** Accepted

### Context

Large language models can generate plausible-sounding but incorrect answers when given insufficient context. Standard RAG implementations rely on prompt instructions ("only answer based on the provided context") to prevent hallucination. Empirical evidence shows that prompt instructions alone are insufficient — LLMs sometimes generate answers that blend context with training data, especially for technical domains.

We need a mechanism to prevent the LLM from being called when retrieved evidence is inadequate.

### Decision

Implement a mandatory evidence sufficiency gate that computes a score from retrieved candidates BEFORE calling the LLM. If the score is below a configured threshold, the system returns a structured refusal response without calling the LLM.

The gate is not a prompt instruction. It is a code-level decision that the LLM has no visibility into.

### Rationale

- **Prompt instructions are not reliable hallucination prevention:** Prompts instruct the model to not hallucinate, but they cannot guarantee this. The model's training may include relevant-sounding knowledge that overrides the instruction in edge cases.
- **A pipeline gate is deterministic:** The evidence score is computed by code from chunk metadata and scores. It does not depend on the LLM's instruction-following behavior. The gate fires reliably every time.
- **LLM calls are expensive and slow:** Not calling the LLM for queries with no evidence is faster (no LLM latency) and cheaper (no token cost). This is a performance improvement alongside a safety improvement.
- **Refusal is the correct behavior:** When the system has no evidence, refusing is strictly correct. Answering with fabricated content is strictly wrong. A deterministic gate that refuses is provably safer than a probabilistic prompt instruction.
- **Configurable threshold enables tuning:** The `EVIDENCE_THRESHOLD` environment variable allows threshold adjustment without code changes. Operators can tune conservatism based on deployment risk tolerance.

### Alternatives Considered

| Alternative | Reason Rejected |
|-------------|----------------|
| Prompt-only instruction ("only use provided context") | Unreliable; LLMs can and do ignore this instruction when context is sparse |
| Post-generation hallucination detector | Detects hallucinations after the LLM has already generated them; adds LLM call cost; still produces a bad answer moment |
| Semantic similarity between answer and context | Requires generating the answer first; expensive; post-hoc |
| No hallucination control | Unacceptable for factory-floor safety context |

### Consequences

- **Positive:** Deterministic hallucination control; no LLM calls on zero-evidence queries.
- **Positive:** Refusal responses are faster (no LLM latency) and cheaper (no token cost).
- **Positive:** Threshold is tunable per deployment without code changes.
- **Negative:** May refuse answerable queries if threshold is set too high; requires tuning with real query data.
- **Negative:** Sufficiency score formula is a heuristic; edge cases may score differently than expected.
- **Neutral:** Requires defining and maintaining the scoring formula; this is new bespoke code.

---

## ADR-006: Machine-Scoped Metadata Filter in Retrieval

**Status:** Accepted

### Context

Multiple machine manuals are ingested into the same chunk store. The same error code (e.g., E101) can exist in manuals for different machines with completely different meanings. Without scoping, retrieval returns chunks from all machines, and the LLM may blend content from multiple machines into a single answer.

We need a primary disambiguation mechanism that prevents cross-machine content contamination.

### Decision

Apply a machine_model metadata filter in the retrieval query whenever the machine context is known (from session, explicit query field, or entity extraction). This filter is applied in both BM25 (pre-filter index corpus) and pgvector (WHERE predicate in SQL query).

Disambiguation detection runs after retrieval when machine context is NOT known, using the presence of multiple machine models in top candidates as the ambiguity signal.

### Rationale

- **Metadata filtering is the earliest and cheapest intervention point:** Filtering at retrieval time prevents cross-machine chunks from entering the candidate pool at all. This is cheaper and more reliable than filtering at context assembly time or via LLM instructions.
- **Blended answers from multiple machines are actively dangerous:** A technician who acts on an answer that blends AlphaBot motor overload procedures with ZenithBot hydraulic pressure procedures may make the fault worse. This is a safety requirement.
- **Prompt-level filtering is insufficient:** Instructing the LLM "only use AlphaBot 3000 content" is not reliable when the context itself contains ZenithBot content. The model may not correctly ignore it.
- **Session persistence enables implicit scoping:** Once machine context is established in session turn 1, all subsequent turns are automatically scoped without the technician re-specifying the machine. This improves UX while maintaining safety.
- **Ambiguity detection as fallback:** When machine is unknown and multiple machines appear in results, the system asks rather than guessing. This is the correct behavior for the ambiguous case.

### Alternatives Considered

| Alternative | Reason Rejected |
|-------------|----------------|
| Separate vector index per machine | Simpler filtering but N indexes to manage; adding a new machine requires index creation; cannot do cross-machine search when machine is unknown |
| LLM-instructed filtering | Unreliable; LLM may use cross-machine content despite instructions |
| Post-retrieval filtering in application code | Still requires retrieving cross-machine candidates first; wasteful; filtering is cleaner as a DB predicate |
| Namespace prefix in chunk text ("ALPHABOT_3000: E101...") | Hacky; pollutes text quality; affects embedding quality |

### Consequences

- **Positive:** Cross-machine contamination eliminated at retrieval level; cannot reach LLM context.
- **Positive:** Session-based scoping provides clean UX for multi-turn conversations.
- **Positive:** SQL WHERE predicate filter is zero-cost relative to the vector computation itself.
- **Neutral:** When machine is unknown, retrieval is cross-machine and slower disambiguation is required.
- **Negative:** Entity extraction from query text must be accurate; false machine detection causes incorrect scoping; mitigated by disambiguation check.

---

## ADR-007: Structured JSON Output (JSON Schema) for LLM Response

**Status:** Accepted

### Context

The LLM generates answers that must be parsed, validated, and rendered by the frontend. Options include: free-form text (parsed by heuristics), structured markdown (partially parseable), or strict JSON conforming to a defined schema.

The system requires machine-readable structure for: citation validation (chunk_ids), confidence level (rendering badge), follow-up suggestions (rendering as clickable buttons), warnings (rendering in a separate UI panel), and has_answer flag (routing to refusal rendering vs normal rendering).

### Decision

Require LLM output to conform to a strict JSON schema. Use Gemini's `response_schema` parameter and `response_mime_type="application/json"` to enforce this at the API level. Validate schema server-side before delivering to frontend.

### Rationale

- **Citation validation requires machine-readable chunk_ids:** Validating that cited chunk_ids exist in the database and that excerpts are verbatim substrings of chunk text requires programmatic access to the citation data. Free-form text makes this extraction fragile.
- **UI rendering requires typed fields:** The frontend renders different components for `answer`, `steps`, `warnings`, `citations`, `confidence`, and `follow_up_suggestions`. Parsing these from unstructured text with regex is brittle and a source of UI bugs.
- **`has_answer` flag enables routing:** The frontend and backend both branch on `has_answer: false` to render the refusal state. This must be a reliable boolean, not an inferred signal from text content.
- **Gemini's JSON mode is reliable:** With `response_schema`, Gemini strongly constrains its output. Validation failures are rare and addressed by the retry mechanism.
- **Uniform contract:** The JSON schema is the contract between the backend and frontend. Changes to the schema are explicit API changes rather than implicit prompt changes.

### Alternatives Considered

| Alternative | Reason Rejected |
|-------------|----------------|
| Free-form text output | No reliable citation extraction; no confidence level; frontend rendering is fragile |
| Markdown with front matter | Partial structure; citation validation still requires text parsing; error-prone |
| XML output | Verbose; no standard library for LLM XML constraint; JSON is the standard |
| Function calling / tool use | Equivalent to JSON schema enforcement in Gemini's API; JSON schema is more direct |

### Consequences

- **Positive:** Strong contract between pipeline components; validation errors are caught server-side.
- **Positive:** Frontend rendering is purely driven by JSON fields; no heuristic text parsing.
- **Positive:** Citation validation is deterministic and reliable.
- **Neutral:** Schema changes require coordinated frontend + backend + prompt updates.
- **Negative:** LLM occasionally produces invalid JSON despite schema enforcement; retry mechanism (max 2 retries) handles this.

---

## ADR-008: Session-Based Conversation Context

**Status:** Accepted

### Context

Technicians ask follow-up questions: "What is E101?" → "How do I fix it?" → "What tools do I need?" Without session state, each query is treated independently. The second query "How do I fix it?" has no machine or error code context — it would return irrelevant results or trigger disambiguation.

We must persist conversation context between HTTP requests.

### Decision

Use Redis with a UUID session identifier to store conversation context between requests. Session includes: machine_model, conversation_history (last 6 messages), pending_query (for disambiguation replay), and last_chunk_ids (for follow-up retrieval priming). Session TTL: 30 minutes. Max conversation turns: 3 (configurable).

### Rationale

- **HTTP is stateless by design:** Conversation state cannot live in the HTTP request alone. Server-side session storage is the standard approach.
- **Redis is appropriate for ephemeral session data:** Session data is not business-critical; it is ephemeral and reconstructable. Redis's in-memory model with TTL is the correct fit: fast access, automatic expiry, no persistence required.
- **Conversation history improves follow-up retrieval:** Including the prior question ("What is E101 on AlphaBot 3000?") in the follow-up query context allows the retriever to understand that "How do I fix it?" is about E101 motor overload on AlphaBot 3000.
- **Machine context persistence is safety-critical:** Without session persistence, every follow-up query risks cross-machine contamination. Persisting machine_model in session is the mechanism that keeps the conversation scoped to the correct machine.
- **Max turn limit prevents unbounded context drift:** Conversation history that is too long degrades retrieval quality (early context overwhelms recent context). Capping at 3 turns with a notification is the pragmatic balance.

### Alternatives Considered

| Alternative | Reason Rejected |
|-------------|----------------|
| Client-side state only (send full history in every request) | Client can send anything; history could be tampered; serialization overhead grows with history length; session validation harder |
| PostgreSQL session storage | Slower than Redis for sub-millisecond session reads; adds latency to every query; session data is ephemeral and does not benefit from relational features |
| JWT with embedded context | Size limits; no server-side invalidation; security complexity |
| Stateless (no conversation context) | Degrades UX significantly; every follow-up requires re-specifying machine and context |

### Consequences

- **Positive:** Follow-up queries work naturally without re-specifying context.
- **Positive:** Machine scoping persists across conversation turns.
- **Positive:** Redis failure degrades gracefully — queries become stateless rather than failing.
- **Negative:** Requires Redis as an additional service dependency.
- **Negative:** Session TTL of 30 minutes may frustrate users who pause troubleshooting for longer.
- **Neutral:** Session IDs must be managed client-side (cookie or localStorage); same as any web session.

---

## ADR-009: Semantic and Hierarchical Chunking Over Fixed-Size Chunking

**Status:** Accepted

### Context

Text chunking strategy determines retrieval quality. Fixed-size chunking (split every N tokens with M-token overlap) is simple and commonly used. Semantic/hierarchical chunking splits at document structure boundaries.

Machine manuals have explicit structure: numbered chapters, sections, subsections, error code tables, step-by-step procedure blocks, and specification tables. This structure is meaningful: an error code table row is a coherent unit; a procedure step should not be split mid-step.

### Decision

Use section-aware semantic chunking that detects document structure from heading patterns and PyMuPDF font metadata. Target chunk size: 400–600 tokens. Respect document boundaries: tables are atomic units; section boundaries are preferred split points; overlap is applied within sections only. Error code blocks are detected and tagged.

### Rationale

- **Manual structure is not arbitrary:** Chapter 5 ("Error Codes") and Chapter 6 ("Maintenance Procedures") contain semantically distinct content. A chunk that crosses this boundary mixes error descriptions with maintenance instructions, degrading retrieval precision.
- **Table integrity is critical:** An error code table row (E101 | Motor Overload | Check motor wiring) is meaningless if split across two chunks. Half the table row provides no actionable information.
- **Overlap within sections prevents boundary context loss:** A technician's procedure may span a section boundary in retrieval. 50-token overlap ensures the context around section joins is not lost.
- **Error code detection enables BM25 boost:** Tagged chunks with known error codes can be given retrieval priority for error code queries without changing the retrieval algorithm.
- **PyMuPDF provides font metadata:** Font size changes between paragraphs are reliable heading indicators in technical PDFs. This allows structural detection without requiring explicit heading markers.

### Alternatives Considered

| Alternative | Reason Rejected |
|-------------|----------------|
| Fixed-size chunking (512 tokens, 50 overlap) | Splits tables, cuts error code entries mid-way, mixes chapter content |
| Sentence-level chunking | Too granular; individual sentences often lack context; many more chunks to embed and store |
| Page-level chunking | Too coarse; individual pages often contain multiple unrelated topics; retrieval is imprecise |
| LangChain RecursiveCharacterTextSplitter | Similar to fixed-size with structure heuristics; less precise than PyMuPDF font-metadata-informed splitting |

### Consequences

- **Positive:** Chunks align with document semantics; retrieval returns coherent, usable units.
- **Positive:** Table integrity ensures error code table entries are never split.
- **Positive:** Section-aware splitting means retrieved chunks are from the same logical topic.
- **Negative:** More complex chunking code; requires testing across different manual formats.
- **Negative:** Chunking is not perfectly deterministic across all PDF layouts; edge cases require manual review.
- **Neutral:** Chunk count is slightly lower than fixed-size chunking for the same document; this is acceptable because quality is higher.

---

## ADR-010: Next.js + FastAPI Over Full-Stack Monolith

**Status:** Accepted

### Context

The system requires a web frontend (chat UI, admin panel) and a backend (RAG pipeline, database, session management). Options include: a full-stack framework (Next.js with API routes), a separate frontend and backend (Next.js + FastAPI), or a backend-rendered approach (Django + templates).

### Decision

Separate Next.js (TypeScript, frontend) from FastAPI (Python, backend). Frontend communicates with backend via REST API and Server-Sent Events. Backend is the authoritative layer for all data, business logic, and AI operations.

### Rationale

- **FastAPI is the correct choice for the backend:** The RAG pipeline is Python-native. PyMuPDF, rank-bm25, sentence-transformers, and the Google Gemini SDK are all Python libraries. A Node.js backend would require FFI bridges or subprocess calls to Python — high complexity.
- **Next.js is the correct choice for the frontend:** Rich interactive chat UI, real-time SSE for ingestion progress, TypeScript for type-safe API response handling, React ecosystem for component reuse. Node.js API routes are not needed because FastAPI handles all API logic.
- **Separation enables independent evolution:** The frontend can be redesigned or replaced (mobile app, desktop app, embedded display) without changing the backend. The backend API can be consumed by external integrations (CMMS, ERP) without frontend involvement.
- **Type-safe API contract:** The FastAPI backend generates an OpenAPI spec automatically. The frontend can generate TypeScript types from this spec, producing an end-to-end typed contract.
- **Avoid language mixing in monolith:** A Next.js-only approach would embed Python operations in a TypeScript process or require subprocess calls. This mixing is harder to test, deploy, and reason about.

### Alternatives Considered

| Alternative | Reason Rejected |
|-------------|----------------|
| Next.js full-stack (API routes only) | Cannot run Python libraries natively; requires subprocess to Python; poor DX for ML/RAG code |
| Django + Jinja templates | No React; real-time chat UI (SSE, streaming) is cumbersome in template-rendered HTML; not hackathon-competitive UX |
| FastAPI with HTMX | Avoids React complexity; however, HTMX's capabilities are insufficient for citation panel, confidence badge, disambiguation card UI requirements |
| Flask + React | Flask lacks FastAPI's async support, automatic OpenAPI, and dependency injection; FastAPI is strictly better |

### Consequences

- **Positive:** Best-in-class tools for each layer: Python for ML/AI, TypeScript for UI.
- **Positive:** Backend API is independently consumable by future clients (mobile, CMMS integration).
- **Positive:** Frontend and backend can be deployed and scaled independently.
- **Neutral:** CORS configuration required for local development; handled via FastAPI middleware.
- **Negative:** Two codebases to maintain; two sets of dependencies; two Docker services.
- **Negative:** Type synchronization between FastAPI Pydantic models and TypeScript interfaces requires discipline; mitigated by OpenAPI code generation.

---

*End of Architecture Decision Records*
