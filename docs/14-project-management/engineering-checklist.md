# Pre-Submission Engineering Checklist

> **Purpose:** Verify every significant system behaviour before demo submission. Check each item manually or with an automated test. Do not mark an item complete until it has been verified in the running application, not just by reading the code.
>
> **Safety items are marked ⚠️** — these must be verified last, after all other items, and must pass without exception.

---

## How to Use This Checklist

1. Work through each section sequentially.
2. Mark `[x]` when verified.
3. If an item cannot be verified, escalate immediately — do not defer.
4. Safety-critical items (⚠️) require a second reviewer sign-off.

**Completion target:** 100% before submission. Any unchecked item must have a written justification attached.

---

## 1. Core RAG Pipeline

- [ ] PDF upload endpoint accepts a multipart/form-data request and returns HTTP 202 with a `document_id`.
- [ ] Background processing task starts within 2 seconds of upload response.
- [ ] PyMuPDF extracts text from every page of the test PDF with correct page numbers recorded.
- [ ] Section chunker splits document on heading patterns and produces chunks within the configured `CHUNK_MAX_TOKENS` limit.
- [ ] Error code chunker identifies all `E-XXX` patterns in the test PDF and creates dedicated `error_code` chunks with the `error_code` metadata field populated.
- [ ] No chunk exceeds `CHUNK_MAX_TOKENS` tokens (800 by default).
- [ ] No chunk is shorter than `CHUNK_MIN_TOKENS` tokens (100 by default) unless it is the final chunk of a section.
- [ ] Adjacent chunks share the overlap percentage configured in `CHUNK_OVERLAP_PCT`.
- [ ] Each chunk has a non-null `embedding` column in the database after processing.
- [ ] Embedding dimensions match the model output (768 for `text-embedding-004`).
- [ ] BM25 index is rebuilt or updated after new chunks are inserted.
- [ ] pgvector ANN query returns results within 500ms for a corpus of 1,000 chunks.
- [ ] Document processing status transitions correctly: `pending` → `processing` → `complete`.
- [ ] Failed processing is recorded as `failed` with an error message; the system does not hang.
- [ ] GET /documents/{id}/status returns the current state and a progress percentage.
- [ ] ⚠️ Every chunk in the database has a non-null, correct `machine_id` matching the document it was ingested from.

---

## 2. Machine Disambiguation

- [ ] Query without a session and without a machine name in the query text returns `response_type: "disambiguation"`.
- [ ] `DisambiguationResponse` includes at least one candidate machine when the corpus contains machines.
- [ ] Candidate machines are ranked by relevance to the query (not alphabetically or by insertion order).
- [ ] Selecting a machine via POST /troubleshoot/disambiguate creates a session with the resolved `machine_id`.
- [ ] Session stores `machine_id` persistently; subsequent queries on the same session use it without re-prompting.
- [ ] A query that names a machine explicitly (e.g., "on the ProMill 3000X") does not trigger disambiguation.
- [ ] A query after machine selection never returns a `DisambiguationResponse`.
- [ ] Disambiguation candidates list does not include machines with zero indexed documents.
- [ ] ⚠️ After disambiguation resolution, the machine filter is applied to all retrieval paths — vector and BM25 both.
- [ ] ⚠️ Resolving to Machine A and then asking about Machine B's specific error code returns a refusal or a scoped answer — never an answer from Machine B's context.

---

## 3. Hallucination Control

- [ ] Evidence sufficiency check runs on every query before generation is invoked.
- [ ] A query with no relevant chunks (e.g., asking about a machine not in the corpus) returns `response_type: "refusal"` with `reason: "insufficient_evidence"`.
- [ ] Refusal message includes a human-readable explanation, not just a reason code.
- [ ] Prompt includes an explicit instruction not to answer from prior knowledge if the context does not support it.
- [ ] Context is truncated to `CONTEXT_MAX_TOKENS` before being sent to the LLM; no truncation errors occur.
- [ ] Faithfulness score (manual spot-check): pick 3 generated answers and verify every factual claim against the retrieved context. All claims must be traceable to a specific passage.
- [ ] LLM temperature is set to 0 or a low value (≤ 0.2) in the generation config.
- [ ] System prompt states that the LLM must only use information from the provided context.
- [ ] Answers do not contain phrases like "as a general rule" or "typically" that introduce parametric knowledge.
- [ ] ⚠️ Out-of-scope queries (e.g., "who manufactures this machine?") produce a refusal, not a fabricated answer.

---

## 4. Citation System

- [ ] Every `StructuredAnswer` response includes a non-empty `citations` array when an answer is given.
- [ ] Each citation object contains `chunk_id`, `document_name`, `page_number`, and `excerpt`.
- [ ] ⚠️ Every `chunk_id` in the citations array exists in the database. No phantom IDs.
- [ ] ⚠️ Every cited chunk belongs to the machine that was selected for the current session.
- [ ] Citation validator strips any chunk IDs returned by the LLM that were not in the retrieved context window.
- [ ] Citation excerpt is a direct substring of the chunk text, not paraphrased by the LLM.
- [ ] CitationPanel component in the frontend renders all citations from the API response.
- [ ] CitationPanel correctly links each citation to the source document name and page number.

---

## 5. API

- [ ] POST /auth/register returns 201 with user object; duplicate email returns 409.
- [ ] POST /auth/login returns access token and refresh token on correct credentials; invalid credentials return 401.
- [ ] All protected endpoints return 401 when called without a token.
- [ ] All protected endpoints return 401 when called with an expired token.
- [ ] POST /troubleshoot/query returns a valid `StructuredAnswer`, `DisambiguationResponse`, or `RefusalResponse` — never a raw 500 error to the client.
- [ ] POST /troubleshoot/query responds within 5 seconds for typical queries (error code lookups, single-step procedures).
- [ ] Rate limiting is applied: verify the 429 response is returned when `RATE_LIMIT_QUERY` is exceeded.
- [ ] Rate limiting for uploads is applied: verify 429 when `RATE_LIMIT_UPLOAD` is exceeded.
- [ ] GET /machines returns the list of indexed machines with document counts.
- [ ] Error responses use the standard `{"detail": "...", "error_code": "..."}` schema — no raw Python stack traces in responses.

---

## 6. Frontend

- [ ] Login page renders at `/login` and is accessible without authentication.
- [ ] Invalid credentials on login show an inline error message, not a page crash.
- [ ] Successful login stores tokens and redirects to the chat interface.
- [ ] Visiting the chat interface without a token redirects to login.
- [ ] Chat input submits on Enter key press; Shift+Enter inserts a newline.
- [ ] `StructuredAnswer` component renders `answer_text`, step list (if present), and warnings (if present).
- [ ] `CitationPanel` expands/collapses on click and shows the chunk excerpt.
- [ ] `DisambiguationCard` renders candidate machines as interactive cards; selecting one sends the disambiguate request.
- [ ] `RefusalMessage` renders with a distinct visual style (not identical to a normal answer).
- [ ] Loading state (spinner or skeleton) is shown while a query is in-flight and disappears when the response arrives.

---

## 7. Security

- [ ] JWT secret key in the deployed environment is not the default placeholder from `.env.example`.
- [ ] Passwords are hashed with bcrypt (or argon2) — plaintext passwords are never stored.
- [ ] SQL queries use parameterised statements — no string interpolation of user input into queries.
- [ ] File upload endpoint validates MIME type and file extension; non-PDF files are rejected with 400.
- [ ] File upload enforces the `MAX_UPLOAD_SIZE_MB` limit; oversized files are rejected with 413.
- [ ] Uploaded files are stored outside the web root and are not directly accessible via HTTP.
- [ ] CORS is restricted to `CORS_ORIGINS` — wildcard `*` is not in use in the deployed config.
- [ ] ⚠️ A technician authenticated as User A cannot access sessions created by User B.
- [ ] ⚠️ A technician cannot upload documents (admin-only action) — verify 403 response.
- [ ] API does not expose internal error details (database error messages, file paths, stack traces) in response bodies.

---

## 8. Demo Readiness

- [ ] `python scripts/seed_demo_data.py` runs to completion on a fresh database without errors.
- [ ] After seed, all 3 demo machines appear in GET /machines.
- [ ] After seed, all 3 machine manuals show `status: complete` in GET /documents.
- [ ] Demo user accounts (technician + admin) can log in with the credentials in the seed script.
- [ ] Demo Scenario 1 (error code lookup) runs cleanly: query → structured answer with citations.
- [ ] Demo Scenario 2 (ambiguous query) runs cleanly: query → disambiguation → machine selection → scoped answer.
- [ ] Demo Scenario 3 (out-of-scope query) runs cleanly: query → refusal with explanation.
- [ ] ⚠️ Demo Scenario 4 (same error code, two different machines): E-221 on Machine A returns Machine A's answer; E-221 on Machine B returns Machine B's answer. The answers are demonstrably different and contain citations from the correct machine only.
- [ ] Cold-start demo: `docker compose down -v && docker compose up` followed by seed script produces a working system within 3 minutes.
- [ ] Demo script from `docs/02-product/hackathon-demo-plan.md` has been rehearsed end-to-end at least once.

---

## 9. Deployment

- [ ] `docker compose up` starts all services without manual intervention.
- [ ] Services start in the correct dependency order (PostgreSQL before API; API before frontend proxy, if applicable).
- [ ] pgvector extension is installed automatically on first PostgreSQL container start (via init script or migration).
- [ ] Alembic migrations run automatically on API startup (or via explicit migration step in the startup sequence).
- [ ] Environment variables are documented in `.env.example` with a comment for every variable.
- [ ] No secrets are committed to the repository — `.env` is in `.gitignore`.
- [ ] Docker images are built from pinned base image tags, not `:latest`, where possible.
- [ ] Volumes are defined for PostgreSQL data persistence — data survives `docker compose restart`.

---

*Total items: 91. All items must be checked before submission. Safety items (⚠️) require explicit confirmation.*
