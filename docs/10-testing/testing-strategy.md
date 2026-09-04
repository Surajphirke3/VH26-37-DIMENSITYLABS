# MechMind Testing Strategy

**Version:** 1.0  
**Last Updated:** 2026-09-04  
**System:** RAG-Based Intelligent Machine Troubleshooting System

---

## Overview

Testing a RAG system requires a fundamentally different approach from testing a conventional CRUD application. The core challenge is that the system's most important behaviors — retrieval quality, answer faithfulness, citation accuracy, and graceful refusal — emerge from the interaction of three independent components: the embedding model, the vector database, and the LLM. None of these components can be fully substituted with a simple mock without losing the validity of the test.

This document defines a layered testing strategy that addresses both conventional software quality (correctness, security, reliability) and RAG-specific quality (faithfulness, relevance, citation validity, disambiguation accuracy).

---

## Testing Pyramid

```
                     /\
                    /  \
                   / E2E \          Playwright browser tests
                  /  (10)  \        Critical user journeys
                 /──────────\
                /            \
               / RAG Eval     \     RAGAS metrics, golden dataset
              /    (30+)       \    Automated quality regression
             /──────────────────\
            /                    \
           /  Integration Tests   \  Full pipeline with real PDFs
          /       (50+)            \ API endpoint tests
         /──────────────────────────\
        /                            \
       /       Unit Tests             \ Component-level tests
      /           (100+)               \ Pure functions, no I/O
     /──────────────────────────────────\
```

### Test Count Targets

| Layer | Count Target | Execution Time | Run Frequency |
|-------|-------------|---------------|---------------|
| Unit tests | 100+ | < 2 minutes | Every commit |
| Integration tests | 50+ | < 10 minutes | Every PR |
| RAG evaluation | 30+ | < 30 minutes | Nightly + pre-release |
| Security tests | 30+ | < 15 minutes | Every PR |
| E2E tests | 10+ | < 20 minutes | Nightly + pre-release |

---

## Tools and Frameworks

| Tool | Purpose | Layer |
|------|---------|-------|
| `pytest` | Test runner for all Python tests | All Python layers |
| `pytest-asyncio` | Async test support for FastAPI/async code | Unit, Integration |
| `httpx` / `pytest-asyncio` | Async HTTP client for API tests | Integration |
| `pytest-cov` | Code coverage reporting | Unit, Integration |
| `factory-boy` | Test fixture factories for database models | Unit, Integration |
| `RAGAS` | RAG evaluation metrics (faithfulness, relevance, etc.) | RAG Evaluation |
| `Playwright` | Browser automation for E2E tests | E2E |
| `pytest-playwright` | Playwright integration with pytest | E2E |
| `respx` | Mock HTTP client for httpx (mocking Gemini API calls in unit tests) | Unit |
| `pytest-mock` | Mock/stub utilities | Unit |

---

## 1. Unit Tests

Unit tests cover individual components in isolation. No real database, no real embeddings, no real LLM API calls.

### Components to Test

#### 1.1 PDF Chunker

Tests for the chunking logic that splits extracted PDF text into retrieval chunks.

```
test_chunker.py
```

| Test | Description |
|------|-------------|
| `test_chunk_splits_on_section_boundary` | Text with clear section headers splits at headers, not mid-sentence |
| `test_chunk_respects_max_tokens` | No chunk exceeds MAX_CHUNK_TOKENS (512 by default) |
| `test_chunk_overlap_is_applied` | Adjacent chunks share OVERLAP_TOKENS (64) of content |
| `test_chunk_preserves_error_code_context` | Error code and its description appear in the same chunk |
| `test_chunk_table_is_not_split` | HTML/text tables are not split across chunks |
| `test_chunk_empty_page_produces_no_chunk` | Blank pages yield zero chunks |
| `test_chunk_metadata_contains_page_number` | Each chunk carries its source page number |
| `test_chunk_metadata_contains_manual_id` | Each chunk carries its source manual ID |
| `test_chunk_single_sentence_page` | Page with one sentence produces a single chunk (no crash) |

#### 1.2 Query Classifier

Tests for the component that classifies whether a query is: error-code lookup, symptom description, follow-up question, or out-of-scope.

```
test_query_classifier.py
```

| Test | Description |
|------|-------------|
| `test_classify_exact_error_code_E101` | "E101" → `error_code_lookup` |
| `test_classify_error_code_with_prefix_variation` | "error E-101", "fault E101" → `error_code_lookup` |
| `test_classify_symptom_description` | "Machine is vibrating excessively" → `symptom_description` |
| `test_classify_follow_up_question` | "What if that doesn't fix it?" → `follow_up` |
| `test_classify_out_of_scope` | "What is the weather today?" → `out_of_scope` |
| `test_classify_mixed_error_and_symptom` | "E101 is showing and also overheating" → `error_code_lookup` (error code takes priority) |
| `test_classify_empty_string_raises_validation_error` | Empty string → raises `ValidationError` |

#### 1.3 Citation Mapper

Tests for the component that maps LLM-cited chunk IDs back to source locations (manual, page, section).

```
test_citation_mapper.py
```

| Test | Description |
|------|-------------|
| `test_citation_maps_to_correct_manual` | Chunk ID → correct manual name and page |
| `test_phantom_citation_is_detected` | Chunk ID not in retrieved set → `PhantomCitationError` raised |
| `test_empty_citations_list_is_valid` | Response with no citations (refusal) → no error |
| `test_duplicate_citations_are_deduplicated` | Same chunk ID cited twice → appears once in output |
| `test_citation_page_number_is_1_indexed` | Page numbers in citations are 1-indexed (human-readable) |

#### 1.4 Confidence Scorer

Tests for the component that assigns a confidence level (`high`, `medium`, `low`) based on retrieved chunk relevance scores.

```
test_confidence_scorer.py
```

| Test | Description |
|------|-------------|
| `test_high_confidence_when_all_scores_above_threshold` | All chunks score > 0.85 → `high` |
| `test_medium_confidence_when_mixed_scores` | Mix of scores above and below threshold → `medium` |
| `test_low_confidence_when_all_scores_below_threshold` | All chunks score < 0.5 → `low` |
| `test_no_chunks_returns_low_confidence` | Empty chunk list → `low` |
| `test_single_chunk_high_score` | One chunk with score 0.95 → `high` |

#### 1.5 Disambiguation Detector

Tests for the component that detects whether a query is ambiguous across multiple machines.

```
test_disambiguation_detector.py
```

| Test | Description |
|------|-------------|
| `test_single_machine_match_no_disambiguation` | Error code found in only one machine → `requires_disambiguation=False` |
| `test_multi_machine_match_triggers_disambiguation` | Error code found in two machines → `requires_disambiguation=True` |
| `test_session_machine_id_prevents_disambiguation` | Session has machine_id set → `requires_disambiguation=False` even for multi-match |
| `test_explicit_machine_name_in_query_prevents_disambiguation` | Query contains machine name → scoped, no disambiguation |
| `test_disambiguation_options_contain_all_matching_machines` | Three machines match → three options returned |

#### 1.6 Input Validators

Tests for Pydantic schema validation.

| Test | Description |
|------|-------------|
| `test_query_rejects_empty_string` | `query=""` → `ValidationError` |
| `test_query_rejects_over_1000_chars` | 1001-character query → `ValidationError` |
| `test_query_accepts_1000_chars` | Exactly 1000-character query → valid |
| `test_extra_fields_are_rejected` | `{"query": "...", "role": "admin"}` → `ValidationError` |
| `test_invalid_uuid_rejected` | `conversation_id="not-a-uuid"` → `ValidationError` |

---

## 2. Integration Tests

Integration tests run against the real FastAPI application with a real PostgreSQL test database and real vector embeddings. Gemini API calls are mocked using `respx` to control LLM responses and avoid billing in tests.

### Test Database Setup

- A separate PostgreSQL database (`mechmind_test`) is created for each test session.
- `alembic upgrade head` is run before the test session.
- Each test function runs inside a database transaction that is rolled back after the test (fast isolation).
- Test PDFs from the golden dataset are indexed once per test session (not per test).

### 2.1 Authentication Integration Tests

```
tests/integration/test_auth.py
```

| Test | Description |
|------|-------------|
| `test_login_valid_credentials_returns_tokens` | Valid login → 200, access token in body, refresh cookie set |
| `test_login_invalid_password_returns_401` | Wrong password → 401 |
| `test_login_unknown_user_returns_401` | Unknown email → 401 (same response as wrong password) |
| `test_login_rate_limit_triggers_after_5_attempts` | 6th attempt → 429 |
| `test_refresh_issues_new_tokens` | Refresh with valid cookie → new access token, new refresh cookie |
| `test_refresh_replay_revokes_family` | Use refresh token twice → second use → 401, all sessions invalidated |
| `test_logout_revokes_refresh_token` | Logout → refresh token no longer usable |
| `test_expired_access_token_returns_401` | Request with manually expired token → 401 |
| `test_malformed_jwt_returns_401` | Request with garbage token → 401 |

### 2.2 Authorization Integration Tests

```
tests/integration/test_authorization.py
```

| Test | Description |
|------|-------------|
| `test_technician_cannot_upload_manual` | Technician JWT → `POST /manuals/upload` → 403 |
| `test_manager_can_upload_manual` | Manager JWT → `POST /manuals/upload` → 200 |
| `test_technician_cannot_access_audit_logs` | Technician JWT → `GET /audit-logs` → 403 |
| `test_manager_cannot_delete_manual` | Manager JWT → `DELETE /manuals/{id}` → 403 |
| `test_admin_can_delete_manual` | Admin JWT → `DELETE /manuals/{id}` → 200 |
| `test_technician_cannot_access_other_users_conversation` | Technician JWT → other user's conversation ID → 404 |
| `test_unauthenticated_query_returns_401` | No JWT → `POST /query` → 401 |
| `test_unauthenticated_manual_list_returns_401` | No JWT → `GET /manuals` → 401 |

### 2.3 RAG Pipeline Integration Tests

These tests run the full RAG pipeline end-to-end with real embeddings and controlled LLM responses.

```
tests/integration/test_rag_pipeline.py
```

**Setup:** Three synthetic test PDFs from the test data plan are indexed before the test session.

#### Critical RAG Integration Test Cases

**Test RAG-INT-001: Same error code, different machine — correct retrieval scoping**

```
Precondition: HaasVF2 manual indexed (E101 = cooling pressure)
              FanucOiMF manual indexed (E101 = motor overload)
              Session has machine_id = haas_vf2_id

Query: "What is error E101?"

Expected:
  - Retrieved chunks are from HaasVF2 manual only
  - Response describes cooling system pressure loss (not motor overload)
  - Citations reference HaasVF2 manual pages only
  - machine_scope in response = "HaasVF2"

Assert:
  - response.citations[*].manual_name == "HaasVF2_Service_Manual.pdf"
  - "cooling" in response.answer.lower()
  - "motor" not in response.answer.lower()
```

**Test RAG-INT-002: Graceful refusal — error code not in any indexed manual**

```
Precondition: All three test manuals indexed
              No manual contains error code Z999

Query: "What is error Z999?"

Expected:
  - System does not invent an answer
  - Response type is refusal
  - Response body: {"answer": "...", "refusal": true, "reason": "evidence_insufficient"}
  - No citations returned

Assert:
  - response.refusal == True
  - len(response.citations) == 0
  - response.confidence == "low"
  - response.answer does not contain "Z999 means" or invented procedure text
```

**Test RAG-INT-003: Follow-up context scoping**

```
Precondition: HaasVF2 manual indexed
              Session established with HaasVF2, E101 discussed

Turn 1 query: "What is error E101 on the Haas VF-2?"
System response: [answer about cooling pressure loss]
Session state: machine_id = haas_vf2_id, last_error = E101

Turn 2 query: "What if that doesn't fix it?"

Expected:
  - System understands "that" refers to E101 cooling fix on HaasVF2
  - Retrieved chunks remain scoped to HaasVF2 manual, E101 section
  - Response describes escalated steps (not a disambiguation request)

Assert:
  - response.machine_scope == "HaasVF2"
  - response.error_code_scope == "E101"
  - response.requires_disambiguation == False
```

**Test RAG-INT-004: Disambiguation trigger**

```
Precondition: HaasVF2 manual indexed (E101 = cooling)
              FanucOiMF manual indexed (E101 = motor overload)
              Session has no machine_id set

Query: "What is error E101?"

Expected:
  - System identifies E101 exists in two machines
  - Response type is disambiguation_required
  - Response includes both machine options
  - System does not guess or mix context from both

Assert:
  - response.requires_disambiguation == True
  - len(response.disambiguation_options) == 2
  - "HaasVF2" in [opt.machine_name for opt in response.disambiguation_options]
  - "FanucOiMF" in [opt.machine_name for opt in response.disambiguation_options]
  - response.answer is None or response.answer == ""
```

**Test RAG-INT-005: Citation validity — all citations map to retrieved chunks**

```
Precondition: Any manual indexed

Query: Any query that produces a multi-citation answer

Expected:
  - Every chunk_id in response.citations was in the retrieved_chunks set
  - No phantom citations

Assert:
  - all(cit.chunk_id in retrieved_chunk_ids for cit in response.citations)
  - PhantomCitationDetector.check(response.citations, retrieved_chunks) == []
```

**Test RAG-INT-006: Phantom citation injection detection**

```
Precondition: Any manual indexed
              Gemini mock is configured to return a response that includes
              a chunk_id (e.g., "PHANTOM-9999") not in the retrieved set

Query: Any valid query

Expected:
  - System detects the phantom citation
  - Either: response is rejected and error returned to client
  - Or: phantom citation is stripped and response is flagged

Assert:
  - The phantom chunk_id does not appear in the API response citations
  - An alert/warning log entry is emitted
```

### 2.4 File Upload Integration Tests

```
tests/integration/test_upload.py
```

| Test | Description |
|------|-------------|
| `test_valid_pdf_upload_starts_ingestion_job` | Valid PDF → 202 Accepted, job_id in response |
| `test_non_pdf_extension_rejected` | `.docx` file → 400 |
| `test_pdf_extension_but_wrong_magic_bytes_rejected` | File with `.pdf` extension but ELF magic bytes → 400 |
| `test_oversized_file_rejected_at_nginx` | File > 100MB → nginx returns 413 |
| `test_upload_creates_job_record_in_database` | After upload → job exists in database with status=pending |
| `test_duplicate_manual_creates_new_version` | Same filename uploaded twice → two versions exist |

---

## 3. RAG Evaluation Tests

RAG evaluation tests measure pipeline quality against the golden dataset. These are not pass/fail in the traditional sense but are tracked as metrics over time with alerting thresholds.

See `/docs/10-testing/rag-evaluation.md` for the complete evaluation framework and golden dataset specification.

### Running RAG Evaluation

```bash
# Run full evaluation suite
pytest tests/rag_eval/ -v --rag-eval-report=reports/rag_eval_$(date +%Y%m%d).json

# Run a specific metric
pytest tests/rag_eval/test_faithfulness.py -v

# Run against golden dataset only
pytest tests/rag_eval/ -m golden_dataset -v
```

### Evaluation Test Structure

Each golden dataset item is a test case:

```python
@pytest.mark.parametrize("golden_item", load_golden_dataset())
async def test_faithfulness(golden_item, rag_pipeline):
    response = await rag_pipeline.query(golden_item.question)
    score = await ragas_faithfulness(
        question=golden_item.question,
        answer=response.answer,
        contexts=[c.text for c in response.retrieved_chunks]
    )
    assert score >= 0.90, f"Faithfulness {score:.2f} below threshold 0.90 for: {golden_item.question}"
```

### Threshold Breach Policy

| Metric | Threshold | Action on Breach |
|--------|-----------|-----------------|
| Context Precision | < 0.80 | Block release, investigate retrieval |
| Context Recall | < 0.70 | Block release, review chunking strategy |
| Faithfulness | < 0.90 | Block release, review prompt |
| Answer Relevance | < 0.85 | Warning, investigate query understanding |
| Citation Accuracy | < 1.00 | Block release — phantom citations are unacceptable |
| Disambiguation Accuracy | < 0.95 | Block release — wrong-machine answers are a safety issue |
| Machine Scope Accuracy | < 1.00 | Block release — wrong-machine answers are a safety issue |
| Refusal Precision | < 0.90 | Warning, investigate refusal logic |

---

## 4. Security Tests

Security tests verify authentication and authorization boundaries, and test known injection patterns.

```
tests/security/
```

### 4.1 Authentication Boundary Tests

These tests are included in the authorization integration tests (Section 2.2) and are also run as part of a dedicated security test run.

### 4.2 Injection Tests

```
tests/security/test_injection.py
```

| Test | Description |
|------|-------------|
| `test_sql_injection_in_search_parameter` | `search=' OR 1=1 --` → 422 validation error or no extra results |
| `test_sql_injection_in_conversation_id` | `conversation_id='1 OR 1=1'` → 422 validation error |
| `test_prompt_injection_in_user_query` | Query containing "ignore previous instructions" → answer is about machines, not system config |
| `test_xss_payload_in_query_not_reflected` | Query containing `<script>alert(1)</script>` → response does not contain unescaped script tag |
| `test_oversized_query_rejected` | 1001-character query → 422 validation error |
| `test_path_traversal_in_filename_ignored` | Upload with filename `../../etc/passwd.pdf` → file stored as UUID.pdf, no traversal |

### 4.3 OWASP ZAP Automated Scan

An OWASP ZAP passive scan runs weekly against the staging environment. The scan configuration:

- Target: `http://staging.mechmind.internal/api/v1/`
- Authentication: ZAP configured with a valid technician JWT
- Rules: All passive rules enabled; active scan rules excluding network-level (not applicable to Docker network)
- Acceptance threshold: Zero High severity findings; Medium findings tracked as issues

---

## 5. End-to-End (E2E) Tests

E2E tests use Playwright to drive a real browser against the full stack. They cover critical user journeys only — not every edge case.

```
tests/e2e/
```

### Prerequisites

- Full Docker Compose stack running (test environment)
- Test PDF manuals indexed (seeded via `docker compose exec api python scripts/seed_test_data.py`)
- Test user accounts seeded (technician, manager, admin)

### E2E Test Cases

**E2E-001: Technician Login and Query**

```
Steps:
  1. Navigate to http://localhost:3000
  2. Enter technician@mechmind.com / TestPass123!
  3. Click Login
  4. Verify dashboard is shown (not login page)
  5. Type "What is error E101?" in the query box
  6. Select "Haas VF-2" from disambiguation dialog
  7. Verify answer is shown with at least one citation
  8. Verify citation links to page number in HaasVF2 manual

Pass criteria:
  - Answer text is visible within 30 seconds
  - At least one citation badge is shown
  - No JavaScript errors in browser console
```

**E2E-002: Disambiguation Flow**

```
Steps:
  1. Login as technician
  2. Start a new conversation (no machine context)
  3. Enter "What does E101 mean?"
  4. Verify disambiguation dialog appears
  5. Verify both "Haas VF-2" and "Fanuc 0i-MF" options are shown
  6. Click "Haas VF-2"
  7. Verify answer describes cooling system pressure loss

Pass criteria:
  - Disambiguation dialog is shown (not a direct answer)
  - After selection, answer is from HaasVF2 manual
  - No answer about Fanuc motor overload appears
```

**E2E-003: Follow-Up Question in Same Session**

```
Steps:
  1. Login as technician
  2. Ask "What is E101 on the Haas VF-2?"
  3. Wait for answer
  4. Ask "What if that doesn't fix it?"
  5. Verify response refers to E101 cooling steps (not a new disambiguation)

Pass criteria:
  - No disambiguation dialog on second question
  - Response is relevant to E101 cooling (not a generic response)
```

**E2E-004: Graceful Refusal for Unknown Error**

```
Steps:
  1. Login as technician
  2. Ask "What is error Z999?"
  3. Verify refusal message is shown

Pass criteria:
  - System displays a message indicating the error code is not found
  - No invented procedure text
  - System offers to help with a different query or suggests consulting the manual directly
```

**E2E-005: Manager Uploads Manual**

```
Steps:
  1. Login as manager@mechmind.com
  2. Navigate to Manual Management
  3. Click Upload Manual
  4. Select a test PDF
  5. Verify upload success message
  6. Verify manual appears in the manual list

Pass criteria:
  - Upload completes without error
  - Manual is listed with correct filename and upload date
```

**E2E-006: Technician Cannot Access Manual Upload**

```
Steps:
  1. Login as technician@mechmind.com
  2. Navigate directly to /admin/manuals (if URL is known)
  3. Verify access is denied

Pass criteria:
  - User is redirected to dashboard or shown 403 page
  - Upload form is not accessible
```

**E2E-007: Session Expiry Redirects to Login**

```
Steps:
  1. Login as technician
  2. Manually clear in-memory access token (simulate expiry)
  3. Attempt to submit a query
  4. Verify refresh token flow silently renews access
  OR
  5. Clear both access token and refresh cookie
  6. Verify redirect to login page

Pass criteria:
  - If only access token expired: transparent refresh, query succeeds
  - If both expired: user sees login page (not a broken error state)
```

---

## Test Data Management

See `/docs/10-testing/test-data.md` for the full test data plan including synthetic PDF content specifications.

### Test Database Seeding

```bash
# Seed test manuals and user accounts
docker compose -f docker-compose.test.yml exec api python scripts/seed_test_data.py

# Verify indexing completed
docker compose -f docker-compose.test.yml exec api python scripts/verify_index.py
```

### Test Isolation Strategy

| Layer | Isolation Method |
|-------|-----------------|
| Unit tests | Mocks and stubs — no real I/O |
| Integration tests | Per-test transaction rollback; mocked Gemini API |
| RAG evaluation | Shared test database indexed once per session; read-only during evaluation |
| E2E tests | Full stack; seeded once before session; test user accounts not modified by tests |

---

## CI/CD Pipeline Integration

```yaml
# GitHub Actions / CI pipeline stages

Test Stages:
  1. lint-and-type-check    # ruff, mypy, ESLint (every commit)
  2. unit-tests             # pytest tests/unit/ (every commit)
  3. integration-tests      # pytest tests/integration/ (every PR)
  4. security-tests         # pytest tests/security/ (every PR)
  5. rag-evaluation         # pytest tests/rag_eval/ (nightly + pre-release)
  6. e2e-tests              # playwright (nightly + pre-release)

Coverage Requirements:
  - Unit + Integration: minimum 80% line coverage overall
  - Authentication module: minimum 95% coverage
  - Authorization module: minimum 95% coverage
  - RAG pipeline: minimum 85% coverage

Blocking:
  - Any unit or integration test failure blocks merge
  - Any security test failure blocks merge
  - Machine Scope Accuracy < 1.00 blocks release
  - Citation Accuracy < 1.00 blocks release
```

---

## Defect Classification

| Severity | Definition | Target Resolution |
|----------|-----------|-------------------|
| P0 — Critical | Wrong machine answer, phantom citation, auth bypass | Fix before any user access |
| P1 — High | Refusal failure (inventing answer), disambiguation bypass | Fix within 24 hours |
| P2 — Medium | Incorrect confidence score, citation to wrong page | Fix within 1 sprint |
| P3 — Low | UI cosmetic, minor wording issues in responses | Fix within 2 sprints |
