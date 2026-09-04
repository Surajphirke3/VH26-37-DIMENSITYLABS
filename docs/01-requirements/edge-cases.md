# Edge Cases

## Document Purpose

This document catalogs edge cases specific to the MechMind system. Each edge case represents a realistic scenario that, if not explicitly handled, will produce an incorrect, dangerous, or degraded system response. For each edge case, we define the scenario, the required system behaviour, and the specific failure mode the design must prevent.

Edge cases are numbered EC-001 through EC-016.

---

## EC-001: Same Error Code, Multiple Machines, No Machine Scope

| Field | Detail |
|---|---|
| **ID** | EC-001 |
| **Scenario** | A technician submits the query `"E-501"` with no machine scope established in the session. Error code `E-501` exists in indexed manuals for both the Haas VF-2 (spindle encoder fault) and the Mazak Integrex i-400 (coolant pressure fault). The corrective procedures for the two machines are entirely different. |
| **Expected System Behaviour** | (1) The system detects that `E-501` matches documentation from more than one machine in the index. (2) The system does NOT retrieve chunks from either machine and does NOT invoke the LLM. (3) The system returns a disambiguation response listing the candidate machines and requesting the user to select one. (4) Only after the user selects a machine does the system perform scoped retrieval and generate an answer. |
| **Failure Mode to Prevent** | The system silently picks one machine (e.g., the one with the highest semantic relevance score) and returns its corrective procedure as if it were the definitive answer. The technician — who is standing at the other machine — follows incorrect steps. In the worst case, this causes machine damage or a safety incident. The system must never guess the machine scope when ambiguity exists. |
| **Implementation Note** | The disambiguation trigger must be a two-stage check: (1) is machine scope set in the session? If not, (2) does the query match content from more than one machine? Only if both conditions hold is the disambiguation flow triggered. If only one machine has matching content, the system proceeds with that machine's scope (optionally confirming with the user). |

---

## EC-002: Error Code Present in Manual Only Inside a Table

| Field | Detail |
|---|---|
| **ID** | EC-002 |
| **Scenario** | Error code `E-2045` appears in the manual exclusively inside a multi-column error reference table (e.g., Code \| Description \| Probable Cause \| Corrective Action). It does not appear in any body paragraph. If the table is not detected and extracted as structured content, the row may be flattened into meaningless text or lost entirely. |
| **Expected System Behaviour** | (1) The ingestion pipeline detects the tabular content and extracts each row as an atomic chunk. (2) The chunk for the `E-2045` row contains the error code, description, probable cause, and corrective action in readable, associated form. (3) A BM25 query for `E-2045` retrieves the table row chunk at high rank. (4) The LLM assembles the answer from this table row chunk. |
| **Failure Mode to Prevent** | Standard PDF text extraction linearises tables, producing output like: `E-2040 E-2041 E-2042 ... Spindle fault Coolant fault ...` — where the association between code and description is lost. The system then retrieves a chunk that mentions `E-2045` but provides no meaningful cause or action. The LLM, lacking structured context, may hallucinate cause and action. |
| **Implementation Note** | Table detection must be a first-class concern in the extraction pipeline. Row-level chunking must preserve column associations. A recommended representation format for table row chunks: `Error Code: E-2045 | Description: Spindle feedback loss | Probable Cause: Encoder cable disconnected | Corrective Action: Inspect encoder cable at J3 connector.` This format is both human-readable and embedding-friendly. |

---

## EC-003: OCR Artifact Corrupts Error Code Token

| Field | Detail |
|---|---|
| **ID** | EC-003 |
| **Scenario** | A scanned PDF's OCR extraction produces `E-5O1` (letter O) instead of `E-501` (digit zero) due to a recognition error in the OCR model. The chunk is stored in the vector store as `E-5O1`. When a technician queries `E-501`, the BM25 keyword search finds no exact match (token mismatch). The semantic search may return the chunk if the surrounding context is sufficiently similar, but at a lower rank than expected. |
| **Expected System Behaviour** | (1) Ideally, OCR post-processing applies character-level correction to alphanumeric tokens in technical contexts (zero/O disambiguation, 1/l/I disambiguation). (2) If post-processing is not applied, the semantic search component should still surface the chunk via context similarity. (3) The returned confidence score should reflect the uncertainty introduced by the token mismatch. (4) If the chunk is retrieved, the displayed citation notes that the source is a scanned document and the technician should verify against the physical manual. |
| **Failure Mode to Prevent** | The system fails to retrieve any chunk for `E-501` because the stored token is `E-5O1`, returning a false refusal. A technician is told MechMind has no information about `E-501` when the information is in the index but is inaccessible due to an OCR error. Equally dangerous: the wrong chunk is retrieved (a different error code whose context superficially matches), and the technician receives incorrect corrective steps. |
| **Implementation Note** | OCR post-processing should apply a simple pattern: in alphanumeric error code tokens of format `[A-Z]-[\d]+`, replace any letter `O` with digit `0` and any letter `l` or `I` (except at the start of a word) with digit `1`. A fuzzy search fallback (edit distance 1) can also be implemented as a secondary retrieval path. |

---

## EC-004: Follow-Up Query Loses Prior Machine Context

| Field | Detail |
|---|---|
| **ID** | EC-004 |
| **Scenario** | In turn 1, the user establishes a machine scope of "Fanuc Robodrill D21MiA5" and asks about alarm 447. In turn 2, the user asks "What spare parts do I need for this?" — a highly context-dependent follow-up. If the session context is not correctly propagated, the turn 2 query arrives at the retrieval layer without a machine scope, triggering either a disambiguation flow (disrupting the conversation) or unscoped retrieval (returning parts from the wrong machine's manual). |
| **Expected System Behaviour** | (1) Machine scope established in any prior turn of the session is stored in the session state and applied automatically to all subsequent retrieval operations within the same session. (2) The LLM receives the conversation history including the machine scope from prior turns in its prompt. (3) The retrieval filter for turn 2 is identical to the filter for turn 1 (machine_id = fanuc_robodrill_d21mia5). (4) The user is not asked to re-specify the machine. |
| **Failure Mode to Prevent** | Machine scope is stored only in the LLM conversation history (as a text reference in prior messages) but not as a hard session metadata value. An LLM context window truncation that removes turn 1 from history then causes the turn 2 retrieval to be unscoped. Parts from an unrelated machine's manual are returned. The user receives a parts list for the wrong machine. |
| **Implementation Note** | Machine scope must be stored as a first-class session metadata field (not embedded only in conversation history text). It must be applied programmatically to the retrieval filter regardless of whether turn 1 remains in the LLM prompt. Machine scope is cleared only when the user explicitly requests "change machine" or starts a new session. |

---

## EC-005: Corrective Action Is in a Different Section from the Error Code

| Field | Detail |
|---|---|
| **ID** | EC-005 |
| **Scenario** | The error code table in Section 12 lists `E-501` with the description "Spindle encoder fault" and a note: "See Section 7.4 for corrective procedure." The actual corrective steps are only in Section 7.4. A retrieval query that returns only the Section 12 chunk will find the description but no actionable corrective steps. The LLM, lacking corrective steps in context, may hallucinate them or produce an incomplete answer. |
| **Expected System Behaviour** | (1) The retrieval pipeline returns chunks from both Section 12 (the error code table entry) and Section 7.4 (the corrective procedure). (2) The semantic search should surface Section 7.4 because the query's intent (corrective action for spindle encoder fault) is semantically matched by Section 7.4's content. (3) If BM25 retrieves Section 12 and semantic retrieval retrieves Section 7.4, the fusion of both result sets includes both. (4) The answer cites both sections. |
| **Failure Mode to Prevent** | Only the Section 12 chunk is retrieved (high BM25 score for the token `E-501`). Section 7.4 is not retrieved because it does not contain the token `E-501` (only "spindle encoder fault" and corrective steps). The LLM has no corrective steps in context and either refuses (false negative) or hallucinates corrective steps (false positive). |
| **Implementation Note** | The hybrid retrieval design specifically addresses this. Semantic search on the query intent ("how to fix spindle encoder fault") should retrieve Section 7.4 even if it lacks the error code token. Additionally, consider a "cross-reference expansion" strategy: if a retrieved chunk contains a cross-reference phrase (e.g., "see Section 7.4"), the ingestion pipeline can create an explicit link or duplicate the target content as a secondary chunk associated with the error code. |

---

## EC-006: Same Manual Uploaded Twice

| Field | Detail |
|---|---|
| **ID** | EC-006 |
| **Scenario** | An administrator uploads "Haas VF-2 Operator Manual.pdf" on Monday. On Thursday, a different administrator (or the same administrator who forgot) uploads the same file again. |
| **Expected System Behaviour** | (1) On the second upload, the system computes the file's hash and finds an existing manual with the same hash. (2) The system presents the admin with a duplicate warning and three options: skip (do not re-ingest), replace (delete existing chunks and re-ingest), cancel. (3) If "skip" is selected, no new chunks are created. (4) If "replace" is selected, all existing chunks from the first ingestion are deleted before the new ingestion begins, ensuring exactly one copy of each chunk exists. |
| **Failure Mode to Prevent** | Silent double-ingestion creates duplicate chunks in the vector store. Every retrieval query now returns duplicate evidence (the same passage twice, from two different chunk IDs). This inflates apparent evidence strength, may cause the LLM to believe the same statement is independently corroborated, and degrades retrieval ranking by consuming result slots with duplicates. At scale, it also wastes vector store storage and inflates ingestion counts. |
| **Implementation Note** | File-level deduplication uses SHA-256 hash of the file bytes. This detects exact duplicates. Near-duplicate detection (same content, different metadata) is more complex and is out of scope for v1. The admin should be warned if the machine model name provided differs from the stored name for the same hash. |

---

## EC-007: LLM Generates Citation to a Non-Retrieved Chunk

| Field | Detail |
|---|---|
| **ID** | EC-007 |
| **Scenario** | The retrieval pipeline returns 5 chunks with IDs: `hvf2-p087-02`, `hvf2-p214-03`, `hvf2-p011-01`, `hvf2-p033-07`, `hvf2-p089-01`. The LLM generates an answer and includes the citation `hvf2-p103-09` — a chunk that exists in the vector store but was NOT in the retrieved set for this query. The LLM has "remembered" or invented a plausible-looking chunk ID from parametric knowledge. |
| **Expected System Behaviour** | (1) Post-generation, the hallucination check validates every citation chunk ID against the retrieved chunk set. (2) `hvf2-p103-09` is not in the retrieved set. It is flagged as a phantom citation. (3) The citation is removed from the answer. (4) If the statement supported by this phantom citation has no other citation, the statement is either removed or marked as unverified. (5) A warning is added to the audit log entry noting that a phantom citation was detected and removed. |
| **Failure Mode to Prevent** | A phantom citation reaches the user. They attempt to verify the cited section (page 103) and find content that does not match or does not exist. This destroys trust in all citations in the answer — even the valid ones — and undermines the core grounding mechanism. In a safety context, a phantom citation gives false confidence that the information is manual-sourced when it may be hallucinated. |
| **Implementation Note** | The citation validator maintains a set of chunk IDs from the retrieval result. After generation, a regular expression or JSON parser extracts all cited chunk IDs from the answer. Set difference identifies phantom citations. This check takes milliseconds and is not dependent on LLM inference. |

---

## EC-008: Query Returns Zero Retrieval Results

| Field | Detail |
|---|---|
| **ID** | EC-008 |
| **Scenario** | A user queries `"servo axis drift compensation parameter G52"` with machine scope "Fanuc 0i-F". The vector store contains Fanuc 0i-F manual chunks, but none of them are semantically or lexically similar to this query (perhaps the parameter is referenced by a different name in the manual, or the relevant section was not successfully extracted). Both semantic and BM25 retrieval return zero results above the minimum score threshold. |
| **Expected System Behaviour** | (1) Zero results retrieved. Evidence check: zero chunks above threshold. (2) System does NOT call the LLM. (3) System returns a refusal response specific to this scenario: no relevant documentation found. (4) The refusal notes that the manual for the specified machine is indexed (distinguishing this from EC-009 where no manual exists at all). (5) Refusal suggests the user rephrase the query (different terminology may match) or consult the manual's index directly. |
| **Failure Mode to Prevent** | System passes zero chunks to the LLM with the instruction "answer from context." The LLM, with an empty context, falls back to parametric knowledge and generates a plausible servo parameter tuning answer based on its training data. The answer sounds authoritative and specific, but is not from the actual manual for this machine. |
| **Implementation Note** | Zero-result handling is a specific case of evidence insufficiency. The refusal message should distinguish between: (a) machine not indexed (no manual for this machine at all), (b) machine indexed but query not matched (manual exists, but query not found within it). Case (b) should suggest query rephrasing. Both cases should never proceed to LLM generation. |

---

## EC-009: Query for Machine Not in Any Indexed Manual

| Field | Detail |
|---|---|
| **ID** | EC-009 |
| **Scenario** | A user queries `"F72-04"` and specifies machine "Haulick & Roos RPV 250-1500". No manual for this machine is in the index. The vector store has zero chunks with `machine_model = haulick_roos_rpv_250_1500`. The metadata filter returns an empty set immediately. |
| **Expected System Behaviour** | (1) Retrieval with machine scope filter returns empty set. (2) Evidence check fails immediately (zero chunks). (3) System returns an informative refusal: the specified machine has no indexed manual. (4) Refusal includes next steps: check with manager about manual upload, consult physical manual, contact manufacturer. (5) Refusal optionally notes any similar machine names in the index in case the user misspelled the model name. |
| **Failure Mode to Prevent** | Two failure modes must be prevented: (a) System drops the machine scope filter and retrieves chunks from other machines' manuals, returning an answer for the wrong machine. (b) System returns a generic hydraulic press answer from parametric LLM knowledge, which has no grounding in the actual machine's manual. Both are dangerous. |
| **Implementation Note** | Machine scope filter must never be silently dropped. If a machine scope is specified and returns zero chunks, the response must be a refusal, not a fallback to unscoped retrieval. This is a hard rule. |

---

## EC-010: PDF Contains Only Scanned Images with No Extractable Text

| Field | Detail |
|---|---|
| **ID** | EC-010 |
| **Scenario** | An uploaded PDF consists entirely of scanned page images with no text layer and no embedded fonts — a pure image PDF. Standard text extraction returns zero characters. The OCR step must be triggered, but the scan quality is very poor (low resolution, skewed pages, faded text), resulting in very low OCR confidence across all pages. |
| **Expected System Behaviour** | (1) Text extraction detects zero text characters; OCR pipeline is triggered automatically. (2) OCR processes all pages. (3) Pages with OCR confidence below a threshold (e.g., 60%) are flagged as low-confidence extractions. (4) Ingestion completes, but the admin notification includes a list of flagged pages and their confidence scores. (5) Chunks from low-confidence pages are tagged with a metadata flag `ocr_low_confidence = true`. (6) Answers generated from low-confidence chunks include a warning: "This information was extracted from a low-quality scanned document and may contain recognition errors. Verify against the physical manual." |
| **Failure Mode to Prevent** | OCR errors create corrupted chunks that are stored and retrieved as if they were reliable text. A technician receives an answer citing a manual section that contains garbled text, with no indication that the source quality is poor. Following garbled instructions is a safety hazard. Alternatively, the ingestion silently fails (zero chunks created) with no admin notification, leaving the manual unlisted and future queries returning refusals with no explanation. |

---

## EC-011: User Asks for Information from a Diagram or Image

| Field | Detail |
|---|---|
| **ID** | EC-011 |
| **Scenario** | A technician asks: "Show me the wiring diagram for the spindle motor on the Haas VF-2." The manual contains this diagram as an embedded image on page 92, but the image cannot be extracted as text. No text chunk in the index describes the wiring diagram's content in sufficient detail to answer the question. |
| **Expected System Behaviour** | (1) Retrieval returns chunks from surrounding the diagram (captions, section headings, figure references in body text). (2) If the surrounding text chunks describe the diagram's location and reference number (e.g., "See Figure 7-4, Spindle Motor Wiring Diagram, p. 92"), the answer cites this reference and directs the user to the specific page and figure. (3) The answer explicitly states: "The wiring diagram is an image on page 92 of the Haas VF-2 Operator Manual (Figure 7-4). MechMind cannot display or interpret image content. Please refer to the physical or digital manual to view the diagram." (4) The system does NOT attempt to describe the diagram from parametric knowledge. |
| **Failure Mode to Prevent** | The system uses LLM parametric knowledge about typical CNC spindle motor wiring diagrams to fabricate a description or ASCII-art approximation. The description may not match the actual wiring of this specific machine, leading the technician to make wiring decisions based on incorrect information. |

---

## EC-012: Follow-Up After Session Expiry

| Field | Detail |
|---|---|
| **ID** | EC-012 |
| **Scenario** | Annika asks about alarm 447 on the Fanuc Robodrill in turn 1. She is called away to the floor for 75 minutes (past the 60-minute idle timeout). She returns and submits turn 2: "What spare parts did I need again?" — assuming her session and context are still active. |
| **Expected System Behaviour** | (1) The session has expired. The session token is invalid. (2) The UI detects the expired session before submitting the query and presents a re-authentication prompt: "Your session has expired. Please log in again to continue." (3) After re-authentication, a new session begins with empty conversation history. (4) The UI notifies Annika that her prior conversation is no longer available in context: "Your session has expired. Your previous conversation is no longer available. Please re-state your query." (5) The audit log from the prior session is preserved and searchable by Annika or the admin — it is not deleted. (6) The system does NOT attempt to process "What spare parts did I need again?" in a new session with no context, as this would return a nonsensical answer without machine scope or prior conversation. |
| **Failure Mode to Prevent** | The expired session token is silently renewed or the system accepts the follow-up with no machine scope. The query "What spare parts did I need again?" is processed without context, either triggering a disambiguation flow (confusing and frustrating) or silently performing an unscoped retrieval (returning wrong results). |

---

## EC-013: Concurrent Ingestion of the Same Manual

| Field | Detail |
|---|---|
| **ID** | EC-013 |
| **Scenario** | Two administrator users simultaneously upload the same PDF manual (same file, same machine model). Both uploads pass the file hash check (because neither has completed ingestion and committed the record yet), and two separate ingestion jobs begin processing the same file concurrently. |
| **Expected System Behaviour** | (1) On upload, a distributed lock (or database insert with unique constraint on file hash) is acquired before the ingestion job is created. (2) The second upload detects the pending ingestion for the same hash (status: "processing") and notifies the second admin: "This manual is currently being ingested by another user. Please wait for the current ingestion to complete before re-uploading." (3) Only one ingestion job runs; only one set of chunks is created. |
| **Failure Mode to Prevent** | Two concurrent ingestions complete successfully, creating duplicate chunks in the vector store (same content, two different sets of chunk IDs). This is the dynamic version of EC-006. Duplicate chunks degrade retrieval as described in that case. Additionally, if the two ingestion jobs interfere (e.g., both attempting to insert a chunk with the same computed chunk ID), a database uniqueness violation may crash both jobs, leaving the manual unindexed. |
| **Implementation Note** | A distributed lock or a database-level unique constraint on `(file_hash, machine_model)` in the ingestion job table prevents concurrent duplicate ingestion. The lock is released when the ingestion job reaches a terminal state (complete or failed). |

---

## EC-014: Query Returns More Than 20 Results with Uniformly Low Relevance Scores

| Field | Detail |
|---|---|
| **ID** | EC-014 |
| **Scenario** | A user submits a very broad query: "maintenance" on the Haas VF-2. The retrieval pipeline returns 20 chunks, all with BM25 or semantic scores in the range 0.30–0.45. The reranker scores all 20 chunks below 0.55. No chunk is above the relevance threshold of 0.60. The query is semantically too broad to match any specific manual section at high confidence. |
| **Expected System Behaviour** | (1) All 20 reranked chunks score below the relevance threshold. (2) Evidence sufficiency check fails. (3) System issues a refusal response that is specific to the broad query case: "Your query is too general to retrieve a specific answer. Please provide more detail, such as an error code, a specific symptom, or a specific maintenance task (e.g., 'lubrication schedule for spindle motor')." (4) 2–3 example queries are suggested to help the user narrow down. |
| **Failure Mode to Prevent** | System passes 20 low-relevance chunks to the LLM. The LLM synthesises a general-purpose maintenance answer from the hodgepodge of context, producing a vague but confident-sounding response that is not actually grounded in any specific relevant content. The user acts on vague advice, potentially missing critical details for their actual task. |

---

## EC-015: LLM Generates an Answer Contradicting Retrieved Chunks

| Field | Detail |
|---|---|
| **ID** | EC-015 |
| **Scenario** | The retrieved chunks clearly state that for error E-501, the corrective action is "Replace encoder cable, Part No. HV2-ENC-007." The LLM, possibly influenced by parametric knowledge of similar machines, generates a corrective step: "Replace the spindle motor itself, as E-501 indicates motor winding failure." This contradicts the retrieved chunks. |
| **Expected System Behaviour** | (1) The hallucination check performs semantic comparison of each corrective step against the retrieved chunks. (2) The statement "Replace the spindle motor" has low semantic similarity (< 0.50) to any retrieved chunk (which talk about encoder cables, not motor replacement). (3) The hallucination check flags this statement. (4) The flagged statement is either: (a) removed from the answer, or (b) presented with a prominent warning: "This step could not be verified against the retrieved manual content. Do not act on this step without consulting the original manual." (5) The answer is still returned with the valid grounded steps. |
| **Failure Mode to Prevent** | The unverified step passes through to the technician with a citation (possibly a phantom citation to a chunk that doesn't say this). The technician, trusting the citation, attempts to replace the spindle motor based on hallucinated LLM output. This is an expensive, time-consuming action that does not fix the actual fault (a loose cable). |

---

## EC-016: Two Versions of the Same Manual Are Both Indexed

| Field | Detail |
|---|---|
| **ID** | EC-016 |
| **Scenario** | The Haas VF-2 Operator Manual Rev 3 (older) and Rev 5 (current) are both indexed for the same machine model. Rev 3 has a different (outdated) corrective procedure for E-501 than Rev 5. A query for E-501 on the Haas VF-2 retrieves chunks from both versions. The two versions' corrective procedures conflict. |
| **Expected System Behaviour** | (1) The retrieval returns chunks from both Rev 3 and Rev 5. (2) The hallucination check or a separate conflict detection step identifies that two retrieved chunks provide contradictory corrective steps for the same error code. (3) The answer flags the contradiction: "Conflicting information was found across two versions of this manual. Please refer to the most recent manual revision (Rev 5) for the authoritative procedure. Both versions' procedures are shown below." (4) Citations for both versions are included so the user can verify which version they have physically. (5) The system does NOT silently pick one version and present it as the definitive answer. |
| **Failure Mode to Prevent** | The system silently merges conflicting procedures from two manual versions, producing a hybrid answer that matches neither version exactly. The technician follows a procedure that is partly from Rev 3 and partly from Rev 5, which may be inconsistent and potentially unsafe. Alternatively, the LLM picks the outdated procedure from Rev 3, and the technician follows a procedure that has been explicitly superseded. |
| **Implementation Note** | Administrators should be encouraged to remove outdated manual versions when a new version is indexed (see FR-024). The admin interface should flag when two manuals with the same machine model are indexed simultaneously and prompt the admin to confirm this is intentional (e.g., intentional multi-version coverage) or a duplication error. |
