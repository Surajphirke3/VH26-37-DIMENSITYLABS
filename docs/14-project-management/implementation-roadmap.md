# Implementation Roadmap

> **Scope:** Phased development plan for MechMind across a 36-hour hackathon timeline. Each phase has clear deliverables, acceptance criteria, and explicit guidance on what can be cut versus what must not be cut.

---

## Table of Contents

1. [Reading This Roadmap](#1-reading-this-roadmap)
2. [Phase 0: Foundation (Hours 1–4)](#2-phase-0-foundation-hours-14)
3. [Phase 1: Ingestion Pipeline (Hours 5–10)](#3-phase-1-ingestion-pipeline-hours-510)
4. [Phase 2: Retrieval + Query (Hours 11–16)](#4-phase-2-retrieval--query-hours-1116)
5. [Phase 3: Generation + Citations (Hours 17–20)](#5-phase-3-generation--citations-hours-1720)
6. [Phase 4: Disambiguation + Conversation (Hours 21–24)](#6-phase-4-disambiguation--conversation-hours-2124)
7. [Phase 5: Frontend (Hours 25–32)](#7-phase-5-frontend-hours-2532)
8. [Phase 6: Demo Polish (Hours 33–36)](#8-phase-6-demo-polish-hours-3336)
9. [Prioritization: What Can Be Cut](#9-prioritization-what-can-be-cut)
10. [Non-Negotiables: What Must Not Be Cut](#10-non-negotiables-what-must-not-be-cut)
11. [Dependency Graph](#11-dependency-graph)

---

## 1. Reading This Roadmap

**Hour estimates** are cumulative from hackathon start (Hour 0 = kickoff). They represent wall-clock time under a single-developer or small-team model. With two developers working in parallel, Phase 1 and Phase 2 can overlap.

**Phase gate:** Each phase has a gate condition. Do not begin the next phase if the gate is not met — integration failures compound quickly and are expensive to debug later.

**Notation:**
- Must have — required for the system to function at all
- Should have — required for a credible demo
- Nice to have — polish; cut if time pressure builds

---

## 2. Phase 0: Foundation (Hours 1–4)

**Goal:** A running multi-service local environment with database connectivity. No business logic yet.

### Deliverables

| Task | Priority | Acceptance Criterion |
|---|---|---|
| FastAPI application skeleton with health endpoint | Must have | `GET /health` returns `{"status": "ok"}` |
| Next.js project scaffold with TypeScript and Tailwind | Must have | `npm run dev` starts without errors |
| Docker Compose file with all services defined | Must have | `docker compose up` brings up all containers |
| PostgreSQL container with pgvector extension | Must have | `SELECT * FROM pg_extension WHERE extname = 'vector'` succeeds |
| Alembic migration: initial schema (machines, documents, chunks, sessions) | Must have | `alembic upgrade head` applies without errors |
| Environment variable loading from `.env` | Must have | Application reads `DATABASE_URL` correctly |
| JWT authentication: POST /auth/register and POST /auth/login | Must have | Login returns access + refresh tokens |
| GET /auth/me protected endpoint | Must have | Returns user object with valid token; 401 with invalid token |
| Basic CORS configuration for localhost:3000 | Must have | Next.js can call FastAPI without CORS errors |
| Structured logging (JSON format, request ID propagation) | Should have | Every request log line includes `request_id` field |

### Phase 0 Gate

`docker compose up` starts all services cleanly, migrations are applied, login/register endpoints return correct responses. JWT tokens are verifiable.

---

## 3. Phase 1: Ingestion Pipeline (Hours 5–10)

**Goal:** A PDF uploaded to the API is parsed, chunked, embedded, and stored with pgvector. BM25 index is built from the stored chunks.

### Deliverables

| Task | Priority | Acceptance Criterion |
|---|---|---|
| POST /documents/upload endpoint (multipart form) | Must have | Returns `document_id`, stores file to `UPLOAD_DIR` |
| Background processing task dispatcher (FastAPI BackgroundTasks) | Must have | Upload returns 202 immediately; processing starts in background |
| PyMuPDF PDF text extraction with page metadata | Must have | Extracts text and page numbers from test PDF |
| Section chunker (splits on heading patterns, respects `CHUNK_MAX_TOKENS`) | Must have | Chunks have type `section`, correct `page_number`, under token limit |
| Error code chunker (identifies `E-XXX` pattern regions, creates `error_code` chunks) | Must have | Error code chunks have `chunk_type = error_code` and `error_code` metadata field populated |
| Table extractor (basic table-to-text conversion) | Should have | Tables are represented as structured text in chunks |
| Chunk overlap implementation (`CHUNK_OVERLAP_PCT` token overlap between adjacent chunks) | Must have | Adjacent chunks share the configured overlap percentage |
| Gemini `text-embedding-004` embedding call | Must have | Each chunk gets a 768-dimension embedding vector |
| Batch embedding (batch size from env: `EMBED_BATCH_SIZE`) | Should have | Reduces API calls; respects rate limits |
| pgvector storage: `INSERT INTO chunks ... embedding <vector>` | Must have | Chunks queryable via `<=>` cosine operator |
| BM25 index build (rank_bm25) from all stored chunks for a document | Must have | BM25 can return top-K chunk IDs for a text query |
| Document processing status tracking (pending / processing / complete / failed) | Must have | GET /documents/{id}/status returns current state |
| Machine association: chunks linked to `machine_id` via document | Must have | `chunks.machine_id` is populated for every inserted chunk |

### Phase 1 Gate

Upload a real PDF, poll status until `complete`, query the database and confirm chunks exist with populated embedding vectors and `machine_id`. BM25 index initialises without error.

---

## 4. Phase 2: Retrieval + Query (Hours 11–16)

**Goal:** A query against a known machine returns a ranked list of relevant chunks. The retrieval pipeline is fully functional end-to-end.

### Deliverables

| Task | Priority | Acceptance Criterion |
|---|---|---|
| Query classifier (error_code / procedure / general / out_of_scope) | Must have | "Error E-221" → `error_code`; "how do I calibrate" → `procedure` |
| Machine ID resolution from session or query parameter | Must have | Retrieval only searches chunks where `machine_id = resolved_id` |
| pgvector ANN query: `ORDER BY embedding <=> $query_embedding LIMIT $k` | Must have | Returns vector-similar chunks within machine scope |
| BM25 keyword retrieval: top-K chunks for query terms | Must have | Returns BM25-scored chunks within machine scope |
| RRF (Reciprocal Rank Fusion) score combination | Must have | Merged ranked list from BM25 + vector scores |
| Cross-encoder reranking with `cross-encoder/ms-marco-MiniLM-L-6-v2` | Must have | Re-ranked top-K list with relevance scores |
| Evidence sufficiency check: compare top chunk score vs `EVIDENCE_SCORE_THRESHOLD` | Must have | Queries with no good match return `insufficient_evidence` signal |
| Machine filter enforcement: strict `WHERE machine_id = $id` on all retrieval paths | Must have | Chunks from other machines are provably absent from results |
| Ambiguity detection: no machine in session + multiple machine matches in BM25 | Must have | Returns `needs_disambiguation` signal with candidate machines |
| Retrieval telemetry logging (query, retrieved_ids, scores, latency) | Should have | Each retrieval logged with structured fields |

### Phase 2 Gate

Issue a raw retrieval request (bypassing generation). Verify: (1) only chunks from the correct machine are returned, (2) reranker reorders chunks from the fusion output, (3) queries with no relevant content return the insufficiency signal, (4) queries with no machine context trigger disambiguation.

---

## 5. Phase 3: Generation + Citations (Hours 17–20)

**Goal:** The system produces a structured, cited answer from the retrieved context. Hallucination controls are active.

### Deliverables

| Task | Priority | Acceptance Criterion |
|---|---|---|
| Context assembler: concatenate top reranked chunks with chunk markers | Must have | Context string has `[CHUNK chunk_id]...[/CHUNK]` markers |
| Context token budget enforcement (`CONTEXT_MAX_TOKENS`) | Must have | Context is truncated to fit Gemini context window |
| Prompt builder: system prompt + context + question → final prompt | Must have | Prompt matches the template in `docs/05-ai/prompt-architecture.md` |
| Gemini `gemini-1.5-flash` LLM call with structured output (JSON schema) | Must have | Response parses into `StructuredAnswer` Pydantic model |
| JSON schema enforcement via Gemini response_mime_type | Must have | API returns valid JSON matching schema on first attempt |
| LLM retry logic: 2 retries on JSON parse failure | Should have | Handles transient malformed responses |
| Citation extractor: maps LLM-returned chunk references to DB chunk IDs | Must have | `citations` field contains valid chunk IDs from the retrieved set |
| Citation validator: verifies each cited chunk_id is in retrieved context | Must have | Chunk IDs not in retrieved set are stripped before response |
| Refusal responder: generates `RefusalResponse` when insufficiency signal is raised | Must have | Refusal includes reason code and explanation |
| POST /troubleshoot/query endpoint: end-to-end from query to structured answer | Must have | Full pipeline returns `StructuredAnswer` JSON |

### Phase 3 Gate

POST a query via the API. Receive a `StructuredAnswer` with `answer_text`, `citations` (all valid chunk IDs), `answer_type`, `confidence_score`. Verify no citation references a chunk from a different machine. Verify a query with no evidence returns `RefusalResponse`.

---

## 6. Phase 4: Disambiguation + Conversation (Hours 21–24)

**Goal:** Ambiguous queries surface a disambiguation UI. Confirmed machine selection initiates a scoped session. Follow-up questions within a session maintain context.

### Deliverables

| Task | Priority | Acceptance Criterion |
|---|---|---|
| Disambiguation algorithm: score candidate machines by BM25 hit count + name similarity | Must have | Ambiguous query returns ordered list of candidate machines |
| DisambiguationResponse schema: `{response_type: "disambiguation", candidates: [...]}` | Must have | Frontend can render candidate list from response |
| POST /troubleshoot/disambiguate: user selects a machine, session is created | Must have | Session stored with `machine_id`, subsequent queries are scoped |
| Session creation endpoint: POST /sessions | Must have | Returns `session_id` |
| Session retrieval: GET /sessions/{id} | Must have | Returns session state including resolved `machine_id` |
| Session expiry (configurable TTL via Redis or PostgreSQL timestamp) | Should have | Sessions expire after configurable period of inactivity |
| Conversation history: store Q&A pairs in session | Should have | Follow-up questions have access to prior answers in prompt context |
| Follow-up query: prior answer summary injected into context assembly | Should have | "What about the coolant flow?" correctly resolves with prior context |
| Conversation history endpoint: GET /sessions/{id}/history | Nice to have | Returns full conversation thread |

### Phase 4 Gate

Issue an ambiguous query. Confirm `DisambiguationResponse` returned. Select a machine via disambiguate endpoint. Confirm subsequent queries on the same session return answers scoped to the selected machine. Confirm cross-machine leakage is impossible after selection.

---

## 7. Phase 5: Frontend (Hours 25–32)

**Goal:** A functional, polished Next.js frontend that covers all response types and the admin upload workflow.

### Deliverables

| Task | Priority | Acceptance Criterion |
|---|---|---|
| Login page with email/password form | Must have | Successful login stores tokens, redirects to chat |
| Auth context: token storage, refresh logic, protected routes | Must have | Unauthenticated users redirected to login |
| Chat interface layout: message list + input box + machine selector | Must have | Messages render in order; input submits on Enter |
| `StructuredAnswer` component: renders `answer_text` + steps + warnings | Must have | All fields from the API response are displayed |
| `CitationPanel` component: expandable list of citations with chunk text preview | Must have | Each citation shows source document name, page, and excerpt |
| `DisambiguationCard` component: renders candidate machines as selectable cards | Must have | Selecting a card calls the disambiguate endpoint and updates session |
| `RefusalMessage` component: styled "I cannot answer this" message with reason | Must have | Refusal reason code displayed with human-readable explanation |
| Loading state: skeleton or spinner while query is in-flight | Should have | No layout shift during loading |
| Error state: API error displayed inline, not as a crash | Should have | Network error shows retry prompt |
| Admin upload page: drag-and-drop PDF upload with machine name input | Should have | File is uploaded, processing status polls until complete |
| Processing status polling: poll GET /documents/{id}/status every 3 seconds | Should have | Status badge updates from "Processing" to "Ready" |
| Machine selector: dropdown populated from GET /machines | Should have | Technician can switch machine without starting a new session |
| Responsive layout (works on tablet viewport for factory floor use) | Nice to have | Usable at 768px width |
| Dark mode | Nice to have | Follows system preference |

### Phase 5 Gate

Log in, upload a PDF (admin), wait for processing, ask a question in chat, see a `StructuredAnswer` with visible citations. Ask an ambiguous question, see the `DisambiguationCard`, select a machine, see a scoped answer. Ask an unanswerable question, see the `RefusalMessage`.

---

## 8. Phase 6: Demo Polish (Hours 33–36)

**Goal:** The demo is self-contained, runs from cold start in under 3 minutes, and covers all judging criteria without manual intervention.

### Deliverables

| Task | Priority | Acceptance Criterion |
|---|---|---|
| Seed script: generate 3 synthetic machine manuals as PDFs | Must have | `python scripts/seed_demo_data.py` runs without errors |
| Seed script: ingest all 3 PDFs (auto-upload and wait for processing) | Must have | All 3 machines indexed after seed completes |
| Seed script: create demo user accounts (technician + admin roles) | Must have | Login works immediately after seed |
| Edge case fixes identified during Phase 5 testing | Must have | No crashes during demo script run-through |
| README: quick start, seed instructions, demo scenario walkthrough | Must have | A fresh reviewer can reproduce the demo in under 5 minutes |
| UI polish: consistent spacing, color tokens, accessible contrast ratios | Should have | Passes WCAG AA contrast check |
| Error code cross-reference: confirm same error code on two different machines returns different answers | Must have | Core differentiator — must work in demo |
| Final end-to-end run-through against demo script | Must have | Demo script in `docs/02-product/hackathon-demo-plan.md` executes cleanly |

### Phase 6 Gate

Fresh `git clone` → `cp .env.example .env` → `docker compose up` → `python scripts/seed_demo_data.py` → demo scenario from `hackathon-demo-plan.md` executes without errors or unexpected responses.

---

## 9. Prioritization: What Can Be Cut

If time pressure builds, cut in this order (lowest value first):

### Tier 1 — Cut freely (nice-to-haves)

- Dark mode
- Responsive layout optimization below 768px
- Conversation history endpoint (GET /sessions/{id}/history)
- Table extraction from PDFs (fall back to treating tables as plain text)
- Structured logging with request ID propagation (fall back to basic print logging)

### Tier 2 — Cut with caution (should-haves that degrade demo quality)

- **Session expiry / TTL:** Without it, sessions never expire. Acceptable for a hackathon demo. Do not put this in production.
- **Follow-up query conversation history injection:** The system still answers questions; it just won't reference prior context. Answers remain accurate.
- **LLM retry logic:** If the first response parses correctly (which Gemini + schema enforcement almost always ensures), this is dead code in the demo.
- **Batch embedding:** Switch to per-chunk embedding. Slower ingestion but functionally equivalent. Acceptable if PDFs are small.
- **Admin upload page:** Replace with a CLI `curl` command in the demo script. Judges care about the chat experience, not the admin UI.
- **Processing status polling UI:** Show a static "Processing..." message; refresh manually.
- **Machine selector dropdown:** Hard-code the machine selection in the demo session instead.

### Tier 3 — Only cut under extreme constraint (must-haves whose absence changes demo narrative)

- **Cross-encoder reranking:** Fall back to RRF-only ranking. Retrieval quality degrades but the system still functions.
- **BM25 retrieval:** Fall back to vector-only retrieval. Term-exact matches (error codes like "E-221") will perform worse.
- **Error code chunker:** Fall back to section chunker only. Error codes will still be retrieved but as part of larger chunks.

---

## 10. Non-Negotiables: What Must Not Be Cut

The following items are not subject to time-pressure negotiation under any circumstances:

### Machine Scope Accuracy Controls

The `WHERE machine_id = $resolved_machine_id` filter in all retrieval queries is not optional. It is the primary safety control. Cutting it — even temporarily "just for the demo" — means the system can serve information from the wrong machine's manual. This turns a quality problem into a safety incident. It is also the most impressive technical differentiator to judges who understand RAG.

**If the machine filter is not working, do not demo the system.** Fix the filter first.

### Citation Validation

The citation validator (Phase 3) that strips chunk IDs not in the retrieved context must not be cut. Without it, the LLM can hallucinate chunk IDs that sound plausible but point to nothing — or worse, to a real chunk from a different machine. The validator is 10–20 lines of code. There is no legitimate reason to cut it.

### Disambiguation API

Disambiguation is not a "nice to have" — it is the system's answer to the core safety question: "what happens when the technician does not specify their machine?" Without it, the system either guesses (dangerous) or always fails (useless). The disambiguation response type must be implemented and demonstrated.

### Refusal / Evidence Sufficiency Check

A system that always generates an answer — even when it has no relevant context — is hallucinating. The evidence sufficiency check and the `RefusalResponse` type are what separate MechMind from a vanilla LLM wrapper. This must be demonstrated in the demo.

### Authentication

The JWT auth layer is not optional. Judges will ask about security. An unauthenticated API is an automatic deduction. The register/login endpoints are in Phase 0 for a reason — they are trivial to implement and must not be deferred.

---

## 11. Dependency Graph

```
Phase 0: Foundation
    |
    └── Phase 1: Ingestion Pipeline
            |
            └── Phase 2: Retrieval + Query
                    |
                    ├── Phase 3: Generation + Citations
                    |       |
                    |       └── Phase 4: Disambiguation + Conversation
                    |               |
                    |               └── Phase 5: Frontend (Chat Interface)
                    |
                    └── [BM25 index] feeds Phase 4 (disambiguation candidates)

Phase 0 (auth) ────────────────────────────────────────────► Phase 5 (login page)
Phase 1 (document upload API) ─────────────────────────────► Phase 5 (admin upload UI)
Phase 3 (full API responses) ──────────────────────────────► Phase 5 (all response components)
```

**Critical path:** Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 5 (core chat flow)

Phase 4 (disambiguation) and Phase 5 (full UI) can be developed in parallel once Phase 3 is complete if two developers are working.

---

*See also: [docs/02-product/mvp-scope.md](../02-product/mvp-scope.md) for feature scope, [docs/14-project-management/risks.md](risks.md) for risk register, [docs/14-project-management/engineering-checklist.md](engineering-checklist.md) for pre-submission verification.*
