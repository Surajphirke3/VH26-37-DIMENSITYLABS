# Acceptance Criteria

## Document Purpose

This is the master acceptance criteria table for MechMind. It covers every major functional and non-functional requirement in a structured Given/When/Then format. This table is the definitive reference for QA test design and for determining whether a requirement has been satisfied.

Each entry references a Requirement ID (FR-XXX or NFR-XXX), defines a specific scenario, and states explicit pass and fail criteria.

---

## Ingestion Pipeline

| Req ID | Scenario | Given | When | Then | Pass Criteria | Fail Criteria |
|---|---|---|---|---|---|---|
| FR-001 | Normal PDF upload | Admin is logged in | Admin uploads a 250-page born-digital PDF and enters machine model "Haas VF-2" | Ingestion job is created; job ID returned immediately | Job ID is a non-null string; job status endpoint returns "processing" within 5 seconds | No job ID returned; HTTP error on upload |
| FR-001 | Oversized file rejection | Admin is logged in | Admin uploads a 250 MB PDF | System rejects the file | HTTP 413 or equivalent error; message states "File exceeds 200 MB limit" | File accepted and ingestion attempted on >200 MB file |
| FR-001 | Missing machine name | Admin is logged in | Admin uploads a PDF without entering a machine model name | System rejects the upload | HTTP 400 with message requiring machine name | Upload accepted without machine name |
| FR-002 | Born-digital text extraction | Valid born-digital PDF | Ingestion pipeline processes the PDF | Extracted text matches visual content | Character error rate < 1% on 3 test pages; page numbers correctly identified | Error rate > 5%; page numbers missing or wrong |
| FR-003 | Scanned PDF OCR | Scanned PDF with no text layer | Ingestion pipeline detects absence of text layer and routes to OCR | OCR text extracted from all pages | Character error rate < 5% on standard typeset text; error code tokens < 2% error rate | OCR not triggered; empty extraction; error rate > 10% |
| FR-004 | Error code table extraction | PDF with a 4-column error code table | Table extracted by pipeline | Rows contain all 4 cells in correct column association | Each row chunk contains Code, Description, Cause, Action fields | Columns merged; rows split incorrectly; table skipped |
| FR-005 | Metadata tagging | Any ingested chunk | Chunk is written to vector store | Chunk has all required metadata fields | manual_name, machine_model, page_number non-null on all chunks; section_title populated on ≥80% | Any required field is null; machine_model missing |
| FR-006 | Chunk boundary preservation | Ingested body text | Text is chunked | No chunk ends mid-sentence | 100% of chunks end at sentence boundaries (tested on sample of 50 chunks) | Any chunk ends with a truncated sentence |
| FR-006 | Table atomicity | Ingested table with 3-column rows | Table is chunked | Table rows are not split across chunks | Each chunk containing a table row contains the complete row | Any chunk contains partial row (e.g., only 2 of 3 columns) |
| FR-007 | Embedding generation | A newly ingested chunk | Chunk is embedded | Embedding vector is stored in vector store | Non-null embedding vector of correct dimension present for every chunk | Null embedding; wrong dimension; embedding absent |
| FR-008 | Ingestion completion notification | Ingestion job in progress | Ingestion completes (success or failure) | Admin is notified | Notification delivered within 60 seconds of completion; notification contains chunk count, page count, error count | No notification; notification missing required fields |
| FR-025 | Duplicate detection | Manual already indexed | Same file uploaded again | Duplicate warning shown | Admin sees duplicate warning with three options (skip, replace, cancel) before any new chunks are created | File ingested without duplicate check; duplicate chunks created silently |

---

## Query and Retrieval

| Req ID | Scenario | Given | When | Then | Pass Criteria | Fail Criteria |
|---|---|---|---|---|---|---|
| FR-009 | Semantic query | Machine scope set; manual indexed | User submits "grinding noise from spindle" | Semantic retrieval returns relevant spindle chunks | Top-3 results contain at least 1 spindle-related chunk; no unrelated chunks in top-3 | No spindle chunks in top-5; completely unrelated results returned |
| FR-010 | Error code hybrid retrieval | Machine scope set; error code in indexed manual | User submits "E-501" | Hybrid retrieval returns chunks containing "E-501" as top result | The chunk containing "E-501" description appears at rank 1 or 2 after reranking | "E-501" chunk not in top-5; "E-502" chunk ranks higher than "E-501" chunk |
| FR-011 | Machine scope filtering | Two machines indexed; both have "E-501" | User queries "E-501" with scope "Haas VF-2" | Retrieved chunks contain only Haas VF-2 content | Zero chunks from Mazak or other machines in result set | Any chunk from a non-scoped machine appears in results |
| FR-012 | Disambiguation trigger | No machine scope set; "E-501" in 2 machines' manuals | User queries "E-501" | Disambiguate response returned, no answer | Response contains names of both candidate machines; no corrective steps in response | System answers without asking; system guesses machine; system returns no content at all |
| FR-012 | Disambiguation resolution | Disambiguation response shown | User selects one machine from the list | Scoped answer returned | Full structured answer returned for the selected machine; machine scope set in session | System asks another disambiguating question; machine scope not set; error returned |
| FR-013 | Reranking improves order | 20 chunks retrieved; correct chunk ranks 8th initially | Reranker is applied | Correct chunk moves to top-5 | Correct chunk appears in positions 1–5 after reranking | Correct chunk remains at rank 8 or lower |
| FR-014 | Sufficient evidence gate passes | Top chunk score 0.88 | Evidence check runs | LLM generation proceeds | Generation is triggered; answer returned | Refusal issued despite high-score evidence |
| FR-014 | Insufficient evidence gate blocks | All chunk scores < 0.60 | Evidence check runs | Refusal issued; LLM NOT called | Refusal response returned; LLM API not called (verifiable in logs) | LLM called with low-quality evidence; answer generated |
| FR-031 | Cross-section retrieval | Error code in Section 12; procedure in Section 7 | User queries that error code | Both sections retrieved | Chunks from Section 12 and Section 7 both appear in context | Only one section's chunks retrieved; answer is incomplete |

---

## Answer Generation

| Req ID | Scenario | Given | When | Then | Pass Criteria | Fail Criteria |
|---|---|---|---|---|---|---|
| FR-016 | Structured answer format | Sufficient evidence retrieved | LLM generates answer | All 5 structural sections present | probable_cause, corrective_steps, safety_warnings, citations, confidence_score all non-null in response | Any section absent or null; answer is unstructured prose only |
| FR-016 | Empty section handled | No safety warnings in retrieved chunks | LLM generates answer | Safety warnings field shows "None found in manual" | `safety_warnings` field contains explicit "none found" indicator | Field omitted; field left blank; system invents a warning not in any chunk |
| FR-017 | Citation present in each step | Corrective steps generated | Answer returned | Every step has at least one citation | All corrective_steps array items contain at least one citation reference | Any step lacks a citation |
| FR-017 | Citation references real chunk | Answer contains citation [hvf2-p087-02] | Hallucination check runs | Referenced chunk ID exists in the retrieved set | Chunk ID hvf2-p087-02 is present in the retrieval result set for this query | Chunk ID referenced in citation is not in retrieved set (phantom citation) |
| FR-018 | Grounded statement passes | Corrective step derived from retrieved chunk text | Hallucination check runs | Step is marked as grounded | Semantic similarity between step and source chunk > 0.70 | Step flagged as hallucinated despite being present in chunk |
| FR-018 | Hallucinated statement flagged | LLM inserts a step not in any retrieved chunk | Hallucination check runs | Step is flagged or removed | Step absent from returned answer OR marked with hallucination warning; never presented as grounded | Hallucinated step appears in answer as if grounded |
| FR-019 | Informative refusal content | Refusal triggered (no evidence) | Refusal response generated | Refusal contains required elements | Response contains: (1) statement that query could not be answered, (2) reason, (3) at least 1 next step | Response is empty; response contains partial answer or speculation; next step missing |
| FR-020 | Confidence score present | Successful answer generated | Answer returned to UI | Confidence score included | `confidence_score` field is a numeric value 0.0–1.0 or a label from {Low, Medium, High} | Field absent; value is null; value is outside 0–1 range |

---

## Multi-Turn Conversation

| Req ID | Scenario | Given | When | Then | Pass Criteria | Fail Criteria |
|---|---|---|---|---|---|---|
| FR-021 | Machine scope preserved across turns | Turn 1 established scope "Haas VF-2" | Turn 2 query submitted without machine name: "What parts do I need?" | Turn 2 retrieval scoped to Haas VF-2 | Retrieved chunks for turn 2 are exclusively from Haas VF-2 manuals | Turn 2 retrieves from all machines or fails due to missing scope |
| FR-021 | Conversation history in prompt | 2 prior turns in history | Third turn submitted | Prior turns included in LLM context | LLM prompt contains turns 1 and 2 (verified in logs) | LLM prompt contains only turn 3; prior context lost |
| FR-021 | History truncation on budget | 10 prior turns accumulated; approaching token limit | Next turn submitted | Oldest turns removed to stay within budget | Total prompt token count within configured limit; most recent turns preserved | Token limit exceeded; API error from LLM provider |
| FR-022 | Session isolation | Two users logged in concurrently | User A submits a query | User B cannot see User A's query or answer | User B session returns only User B's own history | User B session contains User A's conversation or machine scope |
| FR-022 | Session expiry | User idle for 60+ minutes | User submits a query | Session has expired; user prompted to re-authenticate | HTTP 401 or UI re-authentication prompt | Expired session continues; conversation history from expired session leaked to new session |

---

## Administration

| Req ID | Scenario | Given | When | Then | Pass Criteria | Fail Criteria |
|---|---|---|---|---|---|---|
| FR-015 | Context assembly token limit | 20 high-score chunks would exceed token limit | Context assembly runs | Fewer chunks included; highest-ranked kept | Assembled prompt is within configured token limit; lowest-scoring chunks omitted | Token limit exceeded; LLM API error; highest-scoring chunks removed instead of lowest |
| FR-024 | Manual deletion | Manual "Haas VF-2 Rev 4" is indexed | Admin confirms deletion | All chunks from that manual removed | Vector store chunk count decreases by the number of chunks for that manual; subsequent query returns no results from deleted manual | Chunks remain after deletion; other manuals' chunks removed |
| FR-026 | Audit log entry created | User submits any query | Query processing completes | Audit log entry written | Log entry contains: timestamp, user_id, session_id, query_text, machine_scope, retrieved_chunk_ids, answer_text or refusal flag, confidence_score | Log entry absent; required fields null or missing |
| FR-028 | Role enforcement — technician blocked from admin | User has Technician role | User sends POST request to /api/admin/manuals/upload | Access denied | HTTP 403 returned; upload not processed | HTTP 200; upload proceeds; HTTP 500 |
| FR-028 | Session token expiry | JWT issued 9 hours ago | User sends an authenticated request | Token rejected | HTTP 401 returned; request not processed | Request processed with expired token |
| FR-029 | Machine coverage list | 5 machines have indexed manuals | User accesses "Supported Machines" list | All 5 machines listed | All 5 machines appear in the list with status "Indexed" | Fewer than 5 machines listed; list is empty; stale after recent ingestion |

---

## Non-Functional

| Req ID | Scenario | Given | When | Then | Pass Criteria | Fail Criteria |
|---|---|---|---|---|---|---|
| NFR-001 | Query latency under load | 20 concurrent users sending queries | Load test runs for 10 minutes | P95 query latency measured | P95 latency ≤ 5 seconds | P95 latency > 5 seconds |
| NFR-002 | Ingestion time — born-digital | 500-page born-digital PDF | Ingestion triggered | Ingestion completes | Total time ≤ 10 minutes | Total time > 20 minutes |
| NFR-003 | Top-3 retrieval precision | Test set of 50 error code queries with known correct chunks | Queries submitted to system | Correct chunk appears in top-3 | ≥ 45/50 queries (90%) have correct chunk in top-3 | < 40/50 queries |
| NFR-004 | Grounding rate | 100 production answers sampled | Hallucination check applied | ≥ 95% of statements grounded | Grounding rate ≥ 95% | Grounding rate < 90% |
| NFR-005 | System availability | Production environment running | Synthetic health check pings every 60s for 30 days | Uptime during operating hours measured | ≥ 99% uptime during defined operating hours | < 99% uptime (> 60 minutes unplanned downtime in 30 days) |
| NFR-007 | Encryption at rest | Production deployment | Database and storage inspected | AES-256 encryption confirmed | Storage encryption enabled and confirmed by provider console | Storage encryption disabled or not configured |
| NFR-008 | TLS in transit | Production environment | HTTPS check tool runs against API endpoint | TLS 1.2+ confirmed | TLS 1.2 or higher in use; HTTP redirects to HTTPS | TLS 1.0 or 1.1 in use; plain HTTP accepted |
| NFR-012 | Config-driven tuning | System running | Relevance threshold changed in config file; service restarted | New threshold takes effect | Refusal triggered at new threshold; old threshold no longer applies | Code change required to change threshold; restart fails |
| NFR-015 | Docker Compose startup | Clean Docker environment | `docker compose up` executed | All services start | System is queryable within 3 minutes; all containers in "running" state | Services fail to start; query returns error after 3 minutes |
| NFR-018 | Mobile responsiveness | System running | UI opened in browser at 768px viewport | UI renders correctly | No horizontal scroll; query input visible without scroll; text ≥ 16px | Horizontal scroll required; query input below fold; text too small |
| NFR-019 | Phantom citation prevention | LLM generates answer citing chunk ID not in retrieved set | Hallucination check runs | Phantom citation detected and removed | Returned answer contains no citations to chunk IDs not in the retrieved set | Phantom citation reaches user in the response |
| NFR-020 | Audit log immutability | Audit log populated | Admin attempts to DELETE a log entry via API | Request rejected | HTTP 403 or 405 returned; log entry unchanged | Log entry deleted; HTTP 200 returned |
| NFR-021 | Embedding latency | System under normal load | Single query submitted | Query embedding completes | Embedding inference ≤ 200ms (verified in structured logs) | Embedding inference > 500ms consistently |
