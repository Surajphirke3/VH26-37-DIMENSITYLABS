# MechMind — Query Troubleshooting Flow

**Document version:** 1.0
**Status:** Approved
**Last updated:** 2026-09-04

---

## 1. Overview

This document describes every decision branch in the query processing path. It covers how the system handles every possible state: known machine, unknown machine, ambiguous machine, sufficient evidence, insufficient evidence, successful generation, and parse failures. Both a text decision tree and an ASCII flow diagram are provided.

---

## 2. Text Decision Tree

The following describes every branch point in order of processing.

---

### Node 1: Query Received

**Entry point:** POST /api/query with `{query, session_id, machine_model?}`

**Decision:** Is the session_id valid and does it resolve to an existing Redis session?

- **YES (session exists):** Load session; populate machine_model from session if not provided in request. Proceed to Node 2.
- **NO (session missing or expired):** Create new empty session in memory. machine_model from request body only (may be null). Proceed to Node 2.

---

### Node 2: Query Classification

**Process:** Run QueryAnalyzer on the query string.

**Outcome A — Error code detected** (regex matches `[A-Z]{1,3}-?\d{2,4}`):
- query_type = ERROR_CODE
- detected_codes = ["E101"] (list of all matches)
- Proceed to Node 3.

**Outcome B — No error code, free text:**
- query_type = NATURAL_LANGUAGE
- detected_codes = []
- Proceed to Node 3.

**Outcome C — Both error code and descriptive text:**
- query_type = HYBRID
- Proceed to Node 3. (Treated identically to ERROR_CODE in pipeline; both retrieval methods benefit)

---

### Node 3: Machine Context Resolution

**Decision:** Can the machine model be determined? (In priority order)

**Branch 3.1 — Explicit in request:**
- `request.machine_model` field is non-null and non-empty
- resolved_machine = request.machine_model
- Write to session (overrides prior session machine)
- Proceed to Node 4 with machine known.

**Branch 3.2 — From session:**
- Session has `machine_model` set from a prior turn
- resolved_machine = session.machine_model
- Proceed to Node 4 with machine known.

**Branch 3.3 — Entity extracted from query text:**
- No session machine; no request field
- Query text contains a string matching a known machine model or alias (e.g., "AlphaBot 3000", "alphabot", "AB3000")
- resolved_machine = matched machine model name
- Write to session
- Proceed to Node 4 with machine known.

**Branch 3.4 — Machine unknown:**
- None of the above succeeded
- resolved_machine = null
- Proceed to Node 4 with machine unknown. (Retrieval will be cross-machine; disambiguation check will run)

---

### Node 4: Embedding Generation

**Process:** Generate query embedding via Gemini API.

**Branch 4.1 — Embedding succeeds:**
- query_vector = 768-dimensional float array
- Proceed to Node 5 with full hybrid retrieval.

**Branch 4.2 — Embedding fails (API timeout, rate limit, error):**
- bm25_only_mode = True
- Add WARNING flag to response metadata
- Proceed to Node 5 in BM25-only mode.

---

### Node 5: Retrieval

**Process:** Run BM25 retrieval and (if not bm25_only_mode) pgvector retrieval in parallel.

**Branch 5.1 — Both retrievers succeed:**
- bm25_results: top-20 by BM25 score
- vector_results: top-20 by cosine similarity
- Run RRF fusion → unified top-20
- Proceed to Node 6.

**Branch 5.2 — pgvector fails, BM25 succeeds:**
- Use BM25 results only
- Add WARNING: "Vector search unavailable; keyword-only results"
- Proceed to Node 6 with BM25-only results.

**Branch 5.3 — BM25 fails, pgvector succeeds:**
- Use vector results only
- Add WARNING: "BM25 index unavailable; semantic-only results"
- Proceed to Node 6 with vector-only results.

**Branch 5.4 — Both retrievers fail:**
- Return error response: `{has_answer: false, error_type: "RETRIEVAL_ERROR"}`
- Log incident. STOP.

**Branch 5.5 — No manuals ingested (empty index):**
- Both retrievers return empty lists
- Proceed to Node 7 (Evidence Validation) — will fail threshold
- Returns refusal with hint "No manuals are currently ingested"

---

### Node 6: Machine Filter and Ambiguity Check

**Decision path depends on whether machine is known:**

**Sub-path A — Machine is known (resolved_machine is set):**
- Apply machine filter: remove candidates where chunk.machine_model != resolved_machine
- If 0 candidates remain after filter:
  - Proceed to Node 7 (Evidence Validation) — will fail threshold
  - Refusal: "No content found for [machine_model] matching this query"
- If candidates remain: proceed to Node 7.

**Sub-path B — Machine is unknown (resolved_machine = null):**
- No machine filter applied; all retrieved candidates pass through
- Count distinct machine_models in top-10 candidates
- **Sub-path B1 — Only one machine in results:**
  - Machine is unambiguously implied by retrieval
  - Set resolved_machine = that machine (do not write to session yet; write only after answer confirmed)
  - Proceed to Node 7.
- **Sub-path B2 — Multiple machines in results, each with ≥2 qualifying candidates:**
  - is_ambiguous = True
  - Store pending_query in session
  - Return clarification response immediately → Proceed to Node 6C.
- **Sub-path B3 — Multiple machines but only one has substantial coverage:**
  - One machine has ≥4 results; others have ≤1 result with low scores
  - Treat as effectively unambiguous; set resolved_machine = dominant machine
  - Proceed to Node 7 with LOW confidence flag.

**Node 6C — Clarification Response (ambiguous path):**
- Return immediately:
  ```
  {
    has_answer: false,
    requires_clarification: true,
    clarification_question: "Which machine are you working on?",
    candidate_machines: ["Machine A", "Machine B"],
    pending_query: "<original query>"
  }
  ```
- Log query with outcome = DISAMBIGUATED
- STOP (no further processing until user responds)

**After user responds (POST /api/conversation/disambiguate):**
- Set session.machine_model = user's selection
- Retrieve pending_query from session
- Replay entire query pipeline from Node 1 with machine now set → Sub-path A

---

### Node 7: Evidence Validation (Sufficiency Gate)

**Process:** Compute sufficiency_score from top candidates.

```
top_score      = normalized rrf_score of rank-1 candidate
coverage_score = fraction of non-stopword query tokens found in top-5 chunk texts
machine_match  = 1.0 (all top-3 from correct machine)
               | 0.5 (mixed machines in top-3)
               | 0.0 (no match)

sufficiency_score = 0.5 × top_score + 0.3 × coverage_score + 0.2 × machine_match
```

**Branch 7.1 — sufficiency_score < EVIDENCE_THRESHOLD (default 0.35):**
- Return refusal response immediately (no LLM call)
- confidence_level = INSUFFICIENT
- Log with outcome = REFUSED, llm_called = false
- Proceed to Node 7R (Refusal Response).

**Branch 7.2 — EVIDENCE_THRESHOLD ≤ score < EVIDENCE_HIGH_THRESHOLD (default 0.65):**
- confidence_level = LOW
- should_answer = True
- Proceed to Node 8.

**Branch 7.3 — sufficiency_score ≥ EVIDENCE_HIGH_THRESHOLD:**
- confidence_level = HIGH
- should_answer = True
- Proceed to Node 8.

**Node 7R — Refusal Response:**
- Build refusal without LLM call:
  ```
  {
    has_answer: false,
    answer: "Sufficient information was not found in the ingested manuals.",
    searched_manuals: [list of active manual names for the specified machine],
    suggestions: [template-generated reformulation hints],
    citations: []
  }
  ```
- HTTP 200 OK (refusal is a handled state, not an error)
- STOP.

---

### Node 8: Context Assembly

**Process:** Fetch top-5 chunks from database; format as context blocks; append conversation history.

**Branch 8.1 — All chunks fetched successfully:**
- assembled_context contains 5 blocks
- Proceed to Node 9.

**Branch 8.2 — Some chunks missing (deleted between retrieval and assembly):**
- Log WARNING per missing chunk
- assembled_context contains remaining chunks (≥2 required to continue)
- If fewer than 2 chunks assembled: re-evaluate evidence; may downgrade to INSUFFICIENT → Node 7R

**Branch 8.3 — DB unavailable:**
- Return error response: `{has_answer: false, error_type: "STORAGE_ERROR"}`
- STOP.

---

### Node 9: LLM Generation

**Process:** Send assembled context + prompt to Gemini API.

**Branch 9.1 — LLM responds with valid JSON:**
- raw_json received
- Proceed to Node 10.

**Branch 9.2 — LLM API timeout (30-second timeout exceeded):**
- Return error response: `{has_answer: false, error_type: "LLM_TIMEOUT"}`
- Log incident with latency
- STOP. (Do not retry on timeout for synchronous request; user should retry)

**Branch 9.3 — LLM API error (5xx):**
- Retry once after 2-second delay
- If second attempt fails: return error response `{has_answer: false, error_type: "LLM_ERROR"}`
- STOP.

**Branch 9.4 — LLM authentication error (401/403):**
- Return error response `{has_answer: false, error_type: "LLM_AUTH_ERROR"}`
- Log CRITICAL (API key issue; requires operator intervention)
- STOP.

---

### Node 10: Output Parsing and Validation

**Process:** Parse JSON; validate schema; validate citations.

**Branch 10.1 — JSON parses and passes schema validation:**
- StructuredAnswer constructed from parsed JSON
- Proceed to Node 11 (citation validation).

**Branch 10.2 — JSON parse error or schema validation failure (attempt 1):**
- Rebuild prompt with JSON repair instruction
- Retry LLM call (Node 9) — attempt 2
- If second attempt succeeds: proceed to Node 11
- If second attempt fails parsing: Proceed to Branch 10.3

**Branch 10.3 — Parsing fails after 2 attempts:**
- Return error response: `{has_answer: false, error_type: "PARSE_ERROR"}`
- Log both raw JSON strings for debugging
- STOP.

---

### Node 11: Citation Validation

**Process:** Validate each citation's chunk_id and excerpt against the database.

**Branch 11.1 — All citations valid:**
- Enrich citations with manual_name, page_number, section_title
- Proceed to Node 12.

**Branch 11.2 — Some citations invalid (chunk_id not in DB, or excerpt not in chunk text):**
- Remove invalid citations
- Log WARNING per invalid citation
- If remaining citations ≥ 1: proceed to Node 12 with warning note added
- If 0 citations remain: downgrade confidence to LOW; add to warnings: "Citations could not be verified"
- Proceed to Node 12.

**Branch 11.3 — DB error during citation verification:**
- Skip verification; pass citations through unverified
- Add WARNING: "Citation verification could not be completed"
- Proceed to Node 12.

---

### Node 12: Response Finalization

**Process:** Update session; write query log; return HTTP response.

- Append query and answer to session conversation_history
- Update session.turn_count
- Check if turn_count >= MAX_CONVERSATION_TURNS:
  - If yes: add `follow_up_suggestions` entry: "You've reached the conversation limit. Start a new session for further questions."
- Write to Redis (reset TTL)
- Write query_log to PostgreSQL
- Return HTTP 200 with StructuredAnswer JSON, `X-Session-Id` header

**Branch 12.1 — Redis write fails:**
- Log WARNING; session is not persisted; next query treated as fresh
- Continue; return response to user (session loss is degraded, not failure)

**Branch 12.2 — query_log write fails:**
- Log ERROR; continue; return response to user (logging failure does not block answer)

---

## 3. Flow Diagram

```
                    ┌──────────────────┐
                    │  POST /api/query │
                    │  {query,         │
                    │   session_id,    │
                    │   machine?}      │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Load Session    │
                    │  (Redis lookup)  │
                    │                  │
                    │  Session found?  │
                    └───┬─────────┬────┘
                   YES  │         │ NO
                        │         │
             ┌──────────▼──┐  ┌───▼──────────┐
             │ Load machine │  │ New empty    │
             │ context from │  │ session (mem)│
             │ session      │  └───────┬──────┘
             └──────┬───────┘         │
                    └────────┬────────┘
                             │
                    ┌────────▼─────────┐
                    │  Query Analyzer  │
                    │  - detect codes  │
                    │  - detect machine│
                    │    from text     │
                    └────────┬─────────┘
                             │
                    ┌────────▼──────────────────────────┐
                    │  Machine Resolution               │
                    │                                   │
                    │  Priority 1: request.machine      │
                    │  Priority 2: session.machine      │
                    │  Priority 3: entity from text     │
                    │  Priority 4: null (unresolved)    │
                    └───────────────┬───────────────────┘
                                    │
                    ┌───────────────▼──────────┐
                    │  Embedding Generation     │
                    └───────────┬──────────────┘
                                │
                         API OK?
                    ┌─────┴──────┐
                   YES           NO
                    │             │
                    │       bm25_only_mode=True
                    │             │
                    └─────┬───────┘
                          │
              ┌───────────▼──────────────┐
              │     PARALLEL RETRIEVAL   │
              │                          │
              │  ┌──────────┐ ┌────────┐ │
              │  │  BM25    │ │pgvector│ │
              │  │ Retriever│ │  ANN   │ │
              │  └────┬─────┘ └───┬────┘ │
              │       └─────┬─────┘      │
              └─────────────│────────────┘
                            │
                   ┌────────▼─────────┐
                   │   RRF Fusion     │
                   │ (combine + rank) │
                   └────────┬─────────┘
                            │
                   ┌────────▼──────────────────────────────┐
                   │  Machine Known?                        │
                   │                                        │
                   │  YES → Apply Machine Filter            │
                   │  NO  → Check Ambiguity                 │
                   └───────────────┬───────────────────────┘
                                   │
                     ┌─────────────┼─────────────────┐
                Machine         Machine           Ambiguous
                 known +         known,         (multiple
                 filter          0 after        machines
                 applied         filter         in results)
                     │               │               │
                     │         ┌─────▼──────┐  ┌────▼───────────┐
                     │         │ low/no     │  │ CLARIFICATION  │
                     │         │ evidence   │  │ RESPONSE       │
                     │         └─────┬──────┘  │ (no LLM call)  │
                     │               │         │ store pending  │
                     │               │         │ query          │
                     │               │         └────────────────┘
                     │               │              │
                     │               │          USER RESPONDS
                     │               │          (select machine)
                     │               │              │
                     │               │         POST /api/conversation
                     │               │         /disambiguate
                     │               │              │
                     │               │         Replay query
                     │               │         with machine set
                     │               │         (loop back to start)
                     │               │
                     └───────┬───────┘
                             │
                    ┌────────▼──────────────────────┐
                    │   EVIDENCE VALIDATION          │
                    │                                │
                    │  sufficiency_score =           │
                    │    0.5 × top_score             │
                    │  + 0.3 × coverage_score        │
                    │  + 0.2 × machine_match         │
                    └───────────┬────────────────────┘
                                │
                      ┌─────────┼──────────┐
                   score      score      score
                   < 0.35   0.35-0.65   ≥ 0.65
                      │         │          │
                 ┌────▼────┐  LOW       HIGH
                 │REFUSAL  │confidence  confidence
                 │RESPONSE │    │          │
                 │(no LLM) │    └────┬─────┘
                 └─────────┘         │
                                     │
                            ┌────────▼────────┐
                            │Context Assembly │
                            │(fetch top-5     │
                            │ chunks + hist.) │
                            └────────┬────────┘
                                     │
                            ┌────────▼────────┐
                            │  Prompt Builder │
                            └────────┬────────┘
                                     │
                            ┌────────▼──────────────────┐
                            │   LLM Client (Gemini)     │
                            └───────────────┬───────────┘
                                            │
                           ┌────────────────┼─────────────────┐
                         OK              Timeout           API Error
                           │                │                  │
                    ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼───────┐
                    │ Parse JSON  │  │ LLM_TIMEOUT │  │  Retry once  │
                    └──────┬──────┘  │ error resp  │  │  then error  │
                           │         └─────────────┘  └──────────────┘
                    ┌──────┴──────┐
                 Valid?
                    │
               ┌────┴────┐
              YES         NO
               │           │
               │      Retry with repair
               │      prompt (max 2x)
               │           │
               │      Still invalid?
               │      └─→ PARSE_ERROR response
               │
      ┌────────▼────────────┐
      │  Citation Validator │
      │  - verify chunk_ids │
      │  - verify excerpts  │
      └────────┬────────────┘
               │
      ┌────────┴────────────────────────┐
   All OK    Some invalid    All invalid
      │           │               │
      │     Remove bad      Remove all
      │     citations       Downgrade to LOW
      │           │         Add warning
      └────┬──────┘               │
           └──────────┬───────────┘
                      │
             ┌────────▼────────────┐
             │  Session Update     │
             │  + Query Log Write  │
             │  + HTTP 200 Response│
             └─────────────────────┘
```

---

## 4. State Transition Table

The following table summarizes every possible outcome state and the path that leads to it:

| Outcome | HTTP Status | has_answer | error_type | LLM Called | Triggered By |
|---------|-------------|------------|------------|------------|-------------|
| Full answer, HIGH confidence | 200 | true | — | Yes | Evidence ≥ 0.65; all stages succeed |
| Full answer, MEDIUM confidence | 200 | true | — | Yes | Evidence 0.35–0.65 |
| Full answer with citation warning | 200 | true | — | Yes | Some citations invalid; at least 1 valid remains |
| Disambiguation clarification | 200 | false | — | No | Multiple machines in results, no machine context |
| Graceful refusal (no evidence) | 200 | false | — | No | Evidence score < 0.35 |
| Graceful refusal (no manual match) | 200 | false | — | No | 0 candidates after machine filter |
| LLM timeout error | 200 | false | LLM_TIMEOUT | Yes (timed out) | Gemini API takes > 30s |
| LLM API error | 200 | false | LLM_ERROR | Yes (failed) | Gemini API 5xx after retry |
| LLM auth error | 200 | false | LLM_AUTH_ERROR | Yes (failed) | Gemini API 401/403 |
| Parse error | 200 | false | PARSE_ERROR | Yes (failed parse) | JSON invalid after 2 retries |
| Retrieval error | 200 | false | RETRIEVAL_ERROR | No | Both retrievers fail |
| Storage error | 200 | false | STORAGE_ERROR | No | DB unavailable during context assembly |
| BM25-only degraded answer | 200 | true | — (warning) | Yes | Embedding API failed at query time |
| Duplicate upload rejection | 409 | N/A | — | No | File hash matches existing manual |
| Validation error (bad input) | 422 | N/A | — | No | Missing required field or invalid type |

---

## 5. Session State Transitions

```
NEW SESSION
     │
     │ First query arrives
     ▼
ACTIVE (no machine)
     │
     ├── Machine identified → ACTIVE (machine set)
     │        │
     │        ├── Turn 1 answered → turn_count = 1
     │        ├── Turn 2 answered → turn_count = 2
     │        └── Turn 3 answered → turn_count = 3 (MAX)
     │                   │
     │                   └── Next query → NOTIFY user; reset turn_count = 0
     │
     ├── Ambiguous query → AWAITING_DISAMBIGUATION
     │        │
     │        └── User selects machine → ACTIVE (machine set)
     │
     └── TTL expires → EXPIRED (Redis key gone)
              │
              └── Next query → creates NEW SESSION

ACTIVE → CLEARED (user or system explicit reset)
```

---

*End of Troubleshooting Flow*
