# Functional Requirements

## Document Purpose

This document defines all functional requirements for MechMind. Requirements are assigned a unique ID, priority, rationale, and testable acceptance criteria. Requirements are organised by pipeline stage and feature area.

**Priority Levels:**
- **Must**: Required for the system to function; failure to implement is a system failure.
- **Should**: High value; expected in a production system; may be deferred in a hackathon prototype under explicit time constraint.
- **Could**: Adds meaningful value but is not blocking; explicitly deferred for post-v1.
- **Future**: Noted as a long-term roadmap item; not required in v1 or v2.

---

## FR-001: PDF Manual Upload

| Field | Detail |
|---|---|
| **Title** | PDF Manual Upload by Administrator |
| **Description** | The system shall accept PDF files uploaded by users with the Administrator role. Each uploaded file must be associated with a machine model name (provided by the admin at upload time) before ingestion begins. Files up to 200 MB in size must be accepted. |
| **Priority** | Must |
| **Rationale** | The entire knowledge base depends on manual ingestion. Without upload capability, no content can be indexed. |
| **Acceptance Criteria** | (1) Admin can upload a PDF file via the admin interface. (2) Admin is required to provide a machine model name before upload is accepted. (3) Files up to 200 MB are accepted without error. (4) Files above 200 MB are rejected with a clear error message. (5) A unique ingestion job ID is returned immediately after upload. |

---

## FR-002: Text Extraction from Born-Digital PDF

| Field | Detail |
|---|---|
| **Title** | Text Layer Extraction from PDF |
| **Description** | For PDFs that contain a text layer (born-digital PDFs), the system shall extract text preserving: paragraph boundaries, section headings, page numbers, and table structure. Text extraction must preserve the reading order of the document. |
| **Priority** | Must |
| **Rationale** | Accurate text extraction is the foundation of chunking and embedding quality. Loss of structure (e.g., merged columns, lost headings) degrades retrieval accuracy. |
| **Acceptance Criteria** | (1) Extracted text for a born-digital PDF matches the visible text content with zero character substitution errors. (2) Section headings are identifiable as headings (e.g., via font size metadata or formatting). (3) Page numbers are extracted and associated with the text on each page. (4) Table content is extracted preserving row-column relationships. |

---

## FR-003: OCR Processing for Scanned PDFs

| Field | Detail |
|---|---|
| **Title** | OCR-Based Text Extraction for Scanned Manuals |
| **Description** | For PDFs with no text layer (scanned PDFs), the system shall perform optical character recognition (OCR) to extract text from page images. OCR must achieve sufficient accuracy to support reliable retrieval of error codes, procedure steps, and technical terms. |
| **Priority** | Must |
| **Rationale** | Many legacy machine manuals exist only as scanned documents. Excluding them would make large portions of factory knowledge inaccessible. |
| **Acceptance Criteria** | (1) The system detects the absence of a text layer and routes to the OCR pipeline automatically. (2) OCR character error rate is below 5% for standard typeset text under normal scan quality conditions. (3) Error codes (alphanumeric tokens) are extracted with higher accuracy (below 2% error rate). (4) OCR output is stored alongside source metadata including page number. |

---

## FR-004: Table Detection and Extraction

| Field | Detail |
|---|---|
| **Title** | Structured Table Content Extraction |
| **Description** | The system shall detect tabular content within PDFs and extract it preserving row-column relationships. Error code tables (Code | Description | Cause | Action) must be extracted such that each row's cells are associated with each other, not merged into undifferentiated linear text. |
| **Priority** | Must |
| **Rationale** | Error code tables are the most frequent source of ground-truth answers. If table structure is destroyed during extraction, retrieved content will lack the cause-action relationship required to answer queries. |
| **Acceptance Criteria** | (1) Tables are detected in at least 90% of cases (measured against a known set of test manuals). (2) For a 4-column error code table, each extracted row contains all four field values correctly associated. (3) Table rows appear as distinct chunks or as structured text with clear column delimiters. (4) Multi-page tables are detected and joined correctly. |

---

## FR-005: Document Metadata Tagging

| Field | Detail |
|---|---|
| **Title** | Source Metadata Association for All Extracted Content |
| **Description** | Every extracted text segment (pre-chunking) must be tagged with: (1) manual name, (2) machine model, (3) page number, (4) section title or heading (if detectable), (5) content type (body text, table row, heading, caption). This metadata is preserved through chunking, embedding, and into the vector store. |
| **Priority** | Must |
| **Rationale** | Without provenance metadata, citations cannot be generated. Metadata is also used for machine-scoped filtering during retrieval. |
| **Acceptance Criteria** | (1) Every chunk in the vector store has non-null values for manual name, machine model, and page number. (2) Section title is populated for at least 80% of chunks (non-table, non-caption content). (3) Content type is correctly classified for at least 95% of segments. |

---

## FR-006: Text Chunking

| Field | Detail |
|---|---|
| **Title** | Semantic Text Chunking |
| **Description** | Extracted text shall be divided into chunks of approximately 512 tokens with a 50-token overlap. Chunk boundaries must not split sentences mid-way. Table rows must be treated as atomic chunks regardless of their token count. Chunk size is a configurable parameter. |
| **Priority** | Must |
| **Rationale** | Retrieval precision depends on chunk quality. Chunks that split procedures mid-step or separate an error code from its description produce incomplete retrieved evidence. |
| **Acceptance Criteria** | (1) No chunk ends with an incomplete sentence (sentence boundary is preserved). (2) Table rows are never split across chunks. (3) Overlap of approximately 50 tokens exists between consecutive body text chunks. (4) Each chunk is stored with a unique chunk ID. (5) Chunk token count is within ±20% of the configured target. |

---

## FR-007: Chunk Embedding Generation

| Field | Detail |
|---|---|
| **Title** | Dense Vector Embedding of Chunks |
| **Description** | Each chunk shall be converted to a dense embedding vector using a pretrained embedding model. The same model must be used at ingestion time and query time. Embeddings are stored in the vector store alongside the chunk text and metadata. |
| **Priority** | Must |
| **Rationale** | Embeddings are required for semantic similarity search. Using different models at ingestion and query time produces incompatible vector spaces and destroys retrieval quality. |
| **Acceptance Criteria** | (1) All chunks in the vector store have an associated embedding vector. (2) Embedding dimension is consistent across all chunks. (3) The embedding model version used is recorded in the vector store schema. (4) Re-running embedding on the same text produces the same embedding (determinism). |

---

## FR-008: Ingestion Status Tracking

| Field | Detail |
|---|---|
| **Title** | Ingestion Job Progress and Completion Reporting |
| **Description** | After a manual upload triggers ingestion, the system shall report ingestion progress as a percentage complete and notify the administrator when ingestion is complete. The notification shall state the number of chunks created, number of pages processed, and any pages or sections that failed extraction. |
| **Priority** | Should |
| **Rationale** | Administrators need to know when a manual is queryable. Without progress reporting, admins have no way to detect failed ingestions or know when to inform technicians that a new manual is available. |
| **Acceptance Criteria** | (1) An ingestion status endpoint returns a percentage progress value for each running job. (2) A completion notification (UI toast, email, or webhook) is sent when ingestion finishes. (3) The completion notification includes: chunk count, page count, error count, and total processing time. (4) Failed pages are listed with a reason code. |

---

## FR-009: Semantic Query Processing

| Field | Detail |
|---|---|
| **Title** | Natural Language Symptom and Question Queries |
| **Description** | The system shall accept queries in natural language describing machine symptoms or asking maintenance questions. The query shall be embedded using the same model used for chunk embedding, and a semantic nearest-neighbour search shall retrieve the most relevant chunks. |
| **Priority** | Must |
| **Rationale** | Technicians often do not know the error code and must describe symptoms. Semantic search is required to match symptom language to relevant manual content. |
| **Acceptance Criteria** | (1) A query "spindle is vibrating and overheating" retrieves chunks related to spindle thermal and vibration issues from the correct machine's manual. (2) Retrieved chunks rank more relevant content above less relevant content. (3) Query processing initiates retrieval within 100ms of query submission. |

---

## FR-010: Error Code Query Processing

| Field | Detail |
|---|---|
| **Title** | Error Code Lookup via Hybrid Retrieval |
| **Description** | The system shall detect when a query contains an error code (alphanumeric pattern consistent with an error code) and apply hybrid retrieval: combining semantic search results with BM25 keyword search results. The final result set shall be produced by reciprocal rank fusion of both result sets. |
| **Priority** | Must |
| **Rationale** | Error codes are short alphanumeric tokens that may not embed distinctively. Pure semantic search may miss the exact error code chunk. BM25 provides strong exact-match recall for error codes. |
| **Acceptance Criteria** | (1) Query "E-501" returns chunks containing the token "E-501" from the target machine's manual with top-1 rank. (2) Chunks containing "E-502" do not appear in the top-5 results for query "E-501". (3) Hybrid retrieval is demonstrably superior to pure semantic retrieval on error code queries (measured by top-1 recall on a test set). |

---

## FR-011: Machine-Scoped Retrieval

| Field | Detail |
|---|---|
| **Title** | Machine-Aware Filtering on All Retrieval Operations |
| **Description** | All retrieval queries shall be filtered by machine model. If a machine scope has been established (from the current query or conversation history), the vector store query shall include a metadata filter restricting results to chunks from that machine's manuals only. Chunks from other machines' manuals must not appear in the result set. |
| **Priority** | Must |
| **Rationale** | This is the single most critical safety requirement. Retrieving content from the wrong machine's manual will produce incorrect corrective actions. |
| **Acceptance Criteria** | (1) Query "E-501" with machine scope "Haas VF-2" returns zero chunks from any other machine's manual. (2) Programmatic test: inject chunks for "E-501" from three different machines into the vector store; query with scope for Machine A; verify only Machine A chunks appear in results. (3) If machine scope is set in session history, it is applied to retrieval even when not repeated in the current query. |

---

## FR-012: Machine Disambiguation

| Field | Detail |
|---|---|
| **Title** | Clarifying Question When Machine Scope Is Ambiguous |
| **Description** | If a query contains an error code or symptom that matches chunks from multiple different machine manuals, and no machine scope has been established in the conversation, the system shall NOT generate an answer. Instead, it shall respond with a clarifying question listing the machines for which matching documentation exists, asking the user to identify which machine they are working on. |
| **Priority** | Must |
| **Rationale** | Guessing the machine scope and generating an answer for the wrong machine is more dangerous than asking a clarifying question. Disambiguation is the safety valve for the same-code/different-machine problem. |
| **Acceptance Criteria** | (1) Query "E-501" with no established machine scope, where E-501 exists in two machines' manuals, produces a clarifying question listing both machines. (2) The clarifying question does not include a partial answer or corrective steps. (3) After the user selects a machine, the next turn generates a full answer scoped to the selected machine. (4) The clarifying question is asked only once per disambiguation event; once the user selects a machine, it is used for the remainder of the session. |

---

## FR-013: Reranking of Retrieved Chunks

| Field | Detail |
|---|---|
| **Title** | Cross-Encoder Reranking of Initial Retrieval Results |
| **Description** | After initial retrieval (semantic + BM25), the top-K chunks (where K is configurable, default 20) shall be passed through a reranking model that scores each (query, chunk) pair and reorders the chunks by relevance. Only the top-N reranked chunks (default N=5) are passed to context assembly. |
| **Priority** | Should |
| **Rationale** | Initial retrieval has imprecise relevance estimation, especially for borderline chunks. Reranking significantly improves precision of the context passed to the LLM, reducing noise and improving answer quality. |
| **Acceptance Criteria** | (1) Reranker scores are computed for all top-K retrieved chunks. (2) Final context contains only the top-N chunks by reranker score. (3) Reranker inference adds no more than 500ms to total query latency. (4) Test: for a query where the correct chunk ranks 5th in initial retrieval, verify reranking promotes it to top-3. |

---

## FR-014: Evidence Sufficiency Assessment

| Field | Detail |
|---|---|
| **Title** | Pre-Generation Evidence Quality Check |
| **Description** | Before invoking the LLM, the system shall assess evidence sufficiency. Evidence is sufficient if: the top-reranked chunk scores above the configured relevance threshold (default 0.60), and at least 2 chunks score above 0.50 (configurable). If evidence is insufficient, the system bypasses LLM generation and issues a refusal response. |
| **Priority** | Must |
| **Rationale** | Generating an answer from low-quality retrieved evidence produces a confident-sounding but unreliable answer. Evidence gating prevents the most dangerous hallucinations. |
| **Acceptance Criteria** | (1) Query with no relevant manual content triggers refusal, not generation. (2) Refusal is triggered when all chunks score below 0.60. (3) Refusal message clearly states that no sufficient evidence was found. (4) Relevant answer is generated when sufficient chunks are found. (5) Threshold values are readable from system configuration. |

---

## FR-015: Context Assembly

| Field | Detail |
|---|---|
| **Title** | LLM Prompt Construction from Retrieved Evidence |
| **description** | The system shall construct the LLM prompt as a structured document containing: system prompt (instructions, output format), conversation history (last N turns), retrieved chunks in ranked order (each chunk preceded by its provenance metadata in a structured delimiter), and the current query. The assembled context must not exceed the LLM's token limit. If truncation is needed, less-relevant chunks are removed first. |
| **Priority** | Must |
| **Rationale** | Prompt construction determines what the LLM can and cannot reference. Poorly assembled context leads to incomplete answers and incorrect citations. |
| **Acceptance Criteria** | (1) Assembled prompt never exceeds the configured token limit. (2) Each chunk in the prompt is preceded by its chunk ID, manual name, machine model, section, and page number. (3) If truncation is required, chunks with lower reranker scores are removed before higher-scoring chunks. (4) System prompt always appears first in the assembled context. |

---

## FR-016: Structured Answer Generation

| Field | Detail |
|---|---|
| **Title** | LLM Generation of Structured Troubleshooting Answer |
| **Description** | The LLM shall generate an answer in a structured format including the following fields: (1) Probable Cause — what is likely causing the fault; (2) Corrective Steps — a numbered list of actions to take; (3) Safety Warnings — any hazards or cautions from the manual; (4) Citations — references to the chunks used; (5) Confidence — a qualitative or numeric confidence indicator. The LLM must be instructed to answer only from the provided context. |
| **Priority** | Must |
| **Rationale** | Structured output ensures the answer is scannable and actionable for a technician under pressure. Unstructured prose is harder to use on a factory floor. |
| **Acceptance Criteria** | (1) Every answer contains all five structural sections. (2) If a section has no content (e.g., no safety warnings were found), it is marked explicitly as "None found in manual" rather than omitted. (3) The LLM output is parseable as the defined structured format (JSON or delimited sections). (4) The corrective steps section contains a numbered list, not prose. |

---

## FR-017: Inline Citation Generation

| Field | Detail |
|---|---|
| **Title** | Citations Referencing Source Chunks |
| **Description** | Each substantive statement in the generated answer shall be annotated with a citation in the format: `[Manual Name, Section, Page, Chunk ID]`. The LLM shall produce citations using the chunk IDs provided in the prompt context. A citation index shall appear at the end of the answer listing the full citation for each referenced chunk. |
| **Priority** | Must |
| **Rationale** | Citations are the primary mechanism for answer auditability and for enabling technicians to verify answers against original documents. Without citations, MechMind provides ungrounded advice equivalent to hallucinated output. |
| **Acceptance Criteria** | (1) Every corrective step is annotated with at least one citation. (2) Every cited chunk ID exists in the retrieved chunk set for that query. (3) The citation index at the answer end matches the inline citations. (4) Citations are formatted consistently according to the defined format. |

---

## FR-018: Hallucination Detection

| Field | Detail |
|---|---|
| **Title** | Post-Generation Grounding Verification |
| **Description** | After LLM generation and before returning the answer to the user, the system shall perform a hallucination check: for each statement in the corrective steps, verify that a cited chunk contains content semantically supporting that statement. Statements that are not supported by any retrieved chunk shall be flagged. Flagged statements are either removed from the answer or presented with a warning. |
| **Priority** | Should |
| **Rationale** | LLMs occasionally insert plausible-sounding steps not present in retrieved content. In a safety-critical system, this is unacceptable. Automated detection is a backstop against the most egregious cases. |
| **Acceptance Criteria** | (1) A synthetic test where the LLM prompt includes a fabricated step not in any chunk: the hallucination check flags the fabricated step. (2) True statements grounded in retrieved chunks pass the check. (3) Flagged statements are visually distinguished in the UI or removed, according to configurable policy. (4) Hallucination check adds no more than 1 second to total query latency. |

---

## FR-019: Graceful Refusal Response

| Field | Detail |
|---|---|
| **Title** | Informative Refusal When Evidence Is Insufficient |
| **Description** | When the evidence sufficiency check fails, the system shall return a refusal response containing: (1) a statement that the query could not be answered from available manuals; (2) the reason (no relevant content found / relevance threshold not met / contradictory evidence found); (3) recommended next steps for the technician (consult the physical manual, contact the manufacturer support line, escalate to a senior engineer). |
| **Priority** | Must |
| **Rationale** | A blank or error response leaves the technician without guidance. An informative refusal is a safety feature: it prevents the technician from acting on a non-answer and directs them to authoritative sources. |
| **Acceptance Criteria** | (1) Refusal response is generated for a query about a machine not in any manual. (2) Refusal response states the reason using human-readable language. (3) Refusal response includes at least one recommended next step. (4) Refusal response never includes partial corrective steps or speculation. |

---

## FR-020: Confidence Score Display

| Field | Detail |
|---|---|
| **Title** | Answer Confidence Indicator |
| **Description** | Every non-refusal answer shall include a confidence score (0.0–1.0 or Low/Medium/High) derived from the reranker scores of the supporting chunks. The confidence score shall be displayed prominently in the UI alongside the answer. |
| **Priority** | Should |
| **Rationale** | Technicians need to calibrate their trust in an answer. A low-confidence answer should prompt additional verification before action. |
| **Acceptance Criteria** | (1) Confidence score is present in every successful answer response. (2) Confidence score is derived from a documented formula (e.g., average of top-3 reranker scores). (3) UI displays confidence using a visual indicator (score + colour/label). (4) Answers with confidence below 0.70 include an advisory message recommending manual verification. |

---

## FR-021: Multi-Turn Conversation

| Field | Detail |
|---|---|
| **Title** | Context-Preserving Multi-Turn Conversation |
| **Description** | The system shall maintain conversation context across multiple query-response turns within a session. Context includes: established machine scope, prior query-answer pairs (last 5 turns or as many as fit in the context budget), and any disambiguation selections made. Follow-up queries shall be processed with this context available. |
| **Priority** | Should |
| **Rationale** | Maintenance diagnosis is iterative. Technicians ask follow-up questions. Forcing them to re-specify machine and context on every turn is unusable in practice. |
| **Acceptance Criteria** | (1) Turn 1: "E-501 on the Haas VF-2". Turn 2: "What spare parts do I need?" — the second turn retrieves Haas VF-2 content without requiring the user to repeat the machine name. (2) Machine scope established in turn 1 persists for all subsequent turns in the session. (3) Conversation history is included in the LLM prompt. (4) When conversation history exceeds the context budget, the oldest turns are removed first. |

---

## FR-022: Session Management

| Field | Detail |
|---|---|
| **Title** | User Session Creation, Isolation, and Expiry |
| **Description** | Each authenticated user shall have an isolated session. Sessions expire after a configurable idle period (default: 60 minutes). On session expiry, conversation history is cleared. A new session starts on next authentication. Two concurrent users must not see each other's conversations. |
| **Priority** | Must |
| **Rationale** | Session isolation is a basic security and privacy requirement. Without it, one technician may see another's troubleshooting context, creating both privacy and operational confusion. |
| **Acceptance Criteria** | (1) Two users logged in concurrently cannot access each other's conversation history. (2) Session token expires after the configured idle period. (3) After session expiry, the user is prompted to re-authenticate. (4) A new session after expiry starts with empty conversation history. |

---

## FR-023: Follow-Up Question Suggestions

| Field | Detail |
|---|---|
| **Title** | AI-Generated Follow-Up Question Suggestions |
| **Description** | After delivering an answer, the system shall generate 2–3 suggested follow-up questions that a technician might logically ask next, based on the answer content and the diagnostic context. These suggestions appear in the UI as clickable prompts. |
| **Priority** | Could |
| **Rationale** | Reduces the cognitive load on a time-pressured technician who may not know what to ask next. Guided follow-ups improve diagnostic thoroughness. |
| **Acceptance Criteria** | (1) 2–3 follow-up suggestions appear after every answered query. (2) Suggestions are contextually relevant to the answer content. (3) Clicking a suggestion populates it as the next query. (4) Suggestions are generated by the LLM as part of the answer response (not a separate call). |

---

## FR-024: Manual Listing and Management

| Field | Detail |
|---|---|
| **Title** | Admin View of Indexed Manuals |
| **Description** | The admin interface shall provide a list of all indexed manuals showing: manual name, machine model, ingestion date, status (processing / complete / failed), page count, and chunk count. Admins can delete a manual from the index (soft delete, removing all associated chunks). |
| **Priority** | Should |
| **Rationale** | Administrators need to know what is in the knowledge base. Without this, there is no way to manage coverage or remove outdated manuals. |
| **Acceptance Criteria** | (1) Admin interface displays a list of all manuals with the specified fields. (2) Delete operation removes all chunks associated with the manual from the vector store. (3) After deletion, queries that previously returned chunks from the deleted manual return no results from that manual. (4) Deletion is confirmed by the admin before execution. |

---

## FR-025: Duplicate Manual Detection

| Field | Detail |
|---|---|
| **Title** | Prevention of Duplicate Chunk Ingestion |
| **Description** | When a manual is uploaded, the system shall compute a hash of the file and check for an existing manual with the same hash. If a duplicate is detected, the system shall notify the admin and offer the option to: skip ingestion (file already indexed), replace the existing manual (re-index after removing old chunks), or cancel. |
| **Priority** | Should |
| **Rationale** | Re-ingesting the same manual creates duplicate chunks in the vector store, which degrades retrieval quality (duplicate evidence) and wastes storage. |
| **Acceptance Criteria** | (1) Uploading the same PDF twice triggers a duplicate detection warning. (2) Admin is presented with three options: skip, replace, cancel. (3) Selecting "skip" does not create any new chunks. (4) Selecting "replace" deletes all existing chunks for the manual before re-ingesting. |

---

## FR-026: Query History and Audit Log

| Field | Detail |
|---|---|
| **Title** | Persistent Query and Answer Audit Log |
| **Description** | Every query-answer interaction shall be logged to a persistent audit log including: timestamp, user ID, session ID, query text, machine scope, retrieved chunk IDs and scores, generated answer, confidence score, and whether a refusal was issued. Logs are retained for 90 days (configurable). |
| **Priority** | Should |
| **Rationale** | Audit logs enable: post-incident review of troubleshooting sessions, quality monitoring, detection of low-confidence answer patterns, and compliance documentation. |
| **Acceptance Criteria** | (1) Every query triggers an audit log entry. (2) Audit log entries contain all specified fields. (3) Logs are queryable by date range, user, machine, and answer type (answer / refusal). (4) Logs are not directly modifiable by any user role. |

---

## FR-027: Technician Feedback on Answers

| Field | Detail |
|---|---|
| **Title** | Answer Usefulness Feedback Collection |
| **Description** | After receiving an answer, the technician shall be able to rate it: (1) Helpful — the answer was accurate and resolved the issue; (2) Partially Helpful — the answer was correct but incomplete; (3) Not Helpful — the answer was incorrect or irrelevant. An optional free-text comment is allowed. Feedback is stored in the audit log. |
| **Priority** | Could |
| **Rationale** | Feedback enables quality monitoring and identification of systematic retrieval failures. It is also valuable for evaluation of model improvements. |
| **Acceptance Criteria** | (1) Feedback UI (thumbs up/down or 3-option selector) appears after every answer. (2) Feedback submission is linked to the answer's audit log entry. (3) Free-text comment field accepts up to 500 characters. (4) Feedback submission does not alter the answer or trigger re-generation. |

---

## FR-028: User Authentication

| Field | Detail |
|---|---|
| **Title** | Role-Based Authentication |
| **Description** | The system shall require authentication before use. Three roles are supported: Technician (can query, view their own session history), Manager (can query, upload manuals, view aggregate usage), Administrator (all manager permissions plus user management and system configuration). Authentication may use username/password or SSO (OAuth 2.0). |
| **Priority** | Must |
| **Rationale** | Access control prevents unauthorised use, ensures audit trail attribution, and separates admin functions from technician functions. |
| **Acceptance Criteria** | (1) Unauthenticated requests to any endpoint return HTTP 401. (2) A technician-role user cannot access the manual upload endpoint. (3) An admin can create, deactivate, and reassign roles for other users. (4) Session tokens are invalidated on logout. |

---

## FR-029: Query for Machine Coverage

| Field | Detail |
|---|---|
| **Title** | List of Machines with Available Documentation |
| **Description** | The system shall expose an endpoint or UI element that lists all machines for which manual content has been indexed, so technicians know whether their machine is covered before querying. |
| **Priority** | Should |
| **Rationale** | Without a coverage list, technicians waste time querying for machines not in the system, then receive a refusal response with no guidance on how to request manual addition. |
| **Acceptance Criteria** | (1) A "Supported Machines" list is accessible from the UI without making a troubleshooting query. (2) The list reflects current index state (updates within 1 minute of ingestion completion). (3) Clicking a machine from the list pre-populates the machine scope for the next query. |

---

## FR-030: System Health Dashboard (Admin)

| Field | Detail |
|---|---|
| **Title** | Admin Observability Dashboard |
| **Description** | Administrators shall have access to a dashboard showing: vector store chunk count and storage used, number of queries in the last 24 hours and 7 days, average query latency, refusal rate (percentage of queries that resulted in refusal), average confidence score, and error counts for ingestion jobs. |
| **Priority** | Could |
| **Rationale** | Without operational visibility, admins cannot detect system degradation, coverage gaps, or ingestion failures in time to take corrective action. |
| **Acceptance Criteria** | (1) Dashboard is accessible to Admin role users. (2) All six specified metrics are displayed. (3) Metrics are refreshed at least every 5 minutes. (4) Each metric has a time-range selector (24h, 7d, 30d). |

---

## FR-031: Cross-Section Evidence Retrieval

| Field | Detail |
|---|---|
| **Title** | Multi-Chunk Answer Assembly Across Manual Sections |
| **Description** | The system shall be capable of retrieving and assembling evidence from multiple non-contiguous sections of a manual to answer a single query. For example, an error code may be listed in a fault code table (Section 12) with a cross-reference to a corrective procedure in Section 7. The retrieval pipeline must be able to retrieve both chunks and the answer generator must combine them coherently. |
| **Priority** | Must |
| **Rationale** | Manual authors frequently separate fault description from corrective procedure. If retrieval is limited to a single chunk or contiguous chunks, cross-section answers will be incomplete. |
| **Acceptance Criteria** | (1) Test: a query about error code E-501 where the code is in Section 12 and the procedure is in Section 7 returns chunks from both sections. (2) The generated answer combines information from both sections coherently. (3) Citations reference both source chunks. |
