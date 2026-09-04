# User Stories

## Document Purpose

This document captures user stories for all major MechMind features, grouped by persona. Each story follows the format: "As a [persona], I want to [action] so that [outcome]." Acceptance criteria are written in Given/When/Then format.

Stories are tagged with a priority: **Must** / **Should** / **Could** / **Future**.

---

## Raj Patel — Factory Floor Technician

### US-RAJ-01: Error Code Lookup

**Story**: As a factory floor technician, I want to type an error code from the machine panel display into MechMind and receive a clear corrective procedure, so that I can act immediately without hunting through a PDF.

**Priority**: Must

**Acceptance Criteria**:
- Given I am logged in and my machine model is already selected in my session
- When I type the error code `E-2045` and submit
- Then the system returns a structured answer with: (1) probable cause, (2) numbered corrective steps, (3) any safety warnings, and (4) inline citations to the specific manual section and page — all within 5 seconds

---

### US-RAJ-02: Machine Disambiguation Before Answer

**Story**: As a factory floor technician, I want MechMind to ask me which machine I am working on when it cannot tell from my query, so that I do not accidentally receive instructions for the wrong machine.

**Priority**: Must

**Acceptance Criteria**:
- Given I type `E-501` with no machine previously selected in my session
- And the error code `E-501` exists in manuals for two different machines in the index
- When I submit the query
- Then the system asks me which machine I am working on, listing the candidate machines by name
- And the system does not provide any corrective steps until I select a machine
- And after I select a machine, the next response is a full answer scoped to that machine

---

### US-RAJ-03: Natural Language Symptom Query

**Story**: As a factory floor technician, I want to describe what I see and hear in plain English and receive relevant troubleshooting information, so that I can get help even when no error code is displayed on the panel.

**Priority**: Must

**Acceptance Criteria**:
- Given I have selected a machine scope (Haas VF-2)
- When I submit the query "the spindle is making a grinding noise and the tool isn't cutting cleanly"
- Then the system retrieves and returns content from the Haas VF-2 manual related to spindle noise and cutting quality
- And the answer includes probable causes and corrective steps
- And citations reference the relevant manual sections

---

### US-RAJ-04: Confidence Indicator Prompts Escalation Decision

**Story**: As a factory floor technician, I want to see a confidence indicator on every answer, so that I know when I should trust the answer and act on it versus when I should escalate to a senior engineer.

**Priority**: Should

**Acceptance Criteria**:
- Given I receive an answer with a confidence score below the "High" threshold
- Then the UI displays "Medium Confidence" or "Low Confidence" prominently using colour coding
- And a message advises me to verify the answer with the physical manual or a senior engineer before acting

---

### US-RAJ-05: Refusal When Query Is Out of Scope

**Story**: As a factory floor technician, I want to know clearly when MechMind cannot find an answer, so that I do not waste time acting on a guess and instead escalate promptly.

**Priority**: Must

**Acceptance Criteria**:
- Given I query about a machine not in any indexed manual
- When I submit the query
- Then the system returns a refusal response in plain language stating that no relevant documentation was found
- And the refusal suggests at least one next step (e.g., consult the physical manual, contact the manufacturer support line)
- And no corrective steps or partial answers are included in the refusal

---

### US-RAJ-06: Readable Answer on a Tablet

**Story**: As a factory floor technician using a 10-inch tablet in the machine shop, I want the answer to be readable on screen without zooming, so that I can follow the steps while standing at the machine.

**Priority**: Must

**Acceptance Criteria**:
- Given I am viewing the answer on a 768px wide viewport
- Then the corrective steps are displayed as a numbered list with a minimum 16px font size
- And no horizontal scrolling is required
- And safety warnings are visually distinct from corrective steps (different colour, icon, or label)

---

### US-RAJ-07: Follow-Up Question Suggestions

**Story**: As a factory floor technician, I want to see suggested follow-up questions after I receive an answer, so that I can continue my diagnosis without having to think of what to ask next.

**Priority**: Could

**Acceptance Criteria**:
- Given I receive an answer about a spindle fault on the Haas VF-2
- Then 2–3 clickable follow-up question suggestions appear below the answer
- And clicking a suggestion submits it as my next query
- And the suggestions are contextually relevant to the current fault and machine (not generic)

---

## Annika Johansson — Senior Maintenance Engineer

### US-ANK-01: Multi-Turn Diagnostic Conversation

**Story**: As a senior maintenance engineer, I want to ask a series of follow-up questions in a single session without repeating the machine model each time, so that I can conduct a systematic diagnostic investigation efficiently.

**Priority**: Should

**Acceptance Criteria**:
- Given I have established a machine scope of "Fanuc 30i-B" in turn 1 by asking about error 430
- When I ask in turn 2 "What is the relationship between this alarm and the servo amplifier?"
- Then the system applies the same machine scope (Fanuc 30i-B) to retrieve chunks for turn 2
- And the response is contextually connected to turn 1, referencing the same alarm

---

### US-ANK-02: Full Citation with Section Title and Page

**Story**: As a senior maintenance engineer, I want citations that include the exact section title and page number, so that I can navigate directly to the source in the physical manual or PDF.

**Priority**: Must

**Acceptance Criteria**:
- Given I receive an answer about a machine fault
- Then every citation includes: manual name, section title, and page number
- And the citation format is consistent across all answers
- And the cited page number matches the actual source page when verified against the original PDF

---

### US-ANK-03: View Raw Retrieved Chunk

**Story**: As a senior maintenance engineer, I want to view the raw text of the chunks that were retrieved and used to generate my answer, so that I can assess whether the retrieval was complete and accurate.

**Priority**: Could

**Acceptance Criteria**:
- Given I receive an answer
- Then a "View Sources" toggle or expandable section is available
- When I expand it, I see the full text of each retrieved chunk with its chunk ID and metadata
- And the chunks are listed in order of their reranker score

---

### US-ANK-04: Cross-Section Evidence Assembly

**Story**: As a senior maintenance engineer, I want the system to retrieve information from multiple sections of a manual for a single query, so that I get a complete answer even when the error description and corrective procedure are in different sections.

**Priority**: Must

**Acceptance Criteria**:
- Given a manual where error code E-501 description is in Section 12 and the corrective procedure is cross-referenced in Section 7
- When I query "E-501 on [machine name]"
- Then the answer incorporates content from both Section 12 and Section 7
- And citations reference both sections

---

### US-ANK-05: Submit Detailed Feedback

**Story**: As a senior maintenance engineer, I want to rate an answer and submit a detailed comment explaining what was wrong, so that the system can be improved over time.

**Priority**: Could

**Acceptance Criteria**:
- Given I receive an answer I believe is incomplete or incorrect
- When I click "Not Helpful" and enter a comment describing the issue
- Then my feedback is recorded and linked to the specific query and answer in the audit log
- And I receive a confirmation that my feedback was submitted

---

## Derek Okafor — Maintenance Manager

### US-DER-01: Upload a New Machine Manual

**Story**: As a maintenance manager, I want to upload a machine manual PDF and associate it with a machine model name, so that technicians can query the new manual immediately after I upload it.

**Priority**: Must

**Acceptance Criteria**:
- Given I am logged in as a Manager role user
- When I navigate to the manual management page, upload a PDF, and enter the machine model name "Mazak QTU-350 II"
- Then the system begins ingestion and shows a progress indicator
- And within 10 minutes, the manual is listed in the "Indexed Manuals" table with status "Complete"
- And a query for an error code from that manual returns content from the uploaded file

---

### US-DER-02: Check Manual Coverage

**Story**: As a maintenance manager, I want to see a list of all machines for which manuals have been indexed, so that I can identify coverage gaps before technicians encounter a refusal response.

**Priority**: Should

**Acceptance Criteria**:
- Given I am on the admin/manager dashboard
- Then I see a list of all machines with indexed manuals, the number of chunks indexed, and the ingestion date
- And I can identify which machines in our factory do not appear in this list (coverage gaps)

---

### US-DER-03: Remove an Outdated Manual

**Story**: As a maintenance manager, I want to delete a manual from the index when it is superseded by an updated version, so that technicians do not receive corrective procedures from an outdated revision.

**Priority**: Should

**Acceptance Criteria**:
- Given a manual "Haas VF-2 Operator Manual Rev 4" is indexed
- When I select it and click "Delete from Index" and confirm the action
- Then all chunks from that manual are removed from the vector store
- And subsequent queries that previously returned chunks from that manual return no results from it
- And the manual is removed from the indexed manuals list

---

### US-DER-04: View Operational Metrics

**Story**: As a maintenance manager, I want to view metrics on how often MechMind is being used and how often it fails to answer, so that I can report on the system's value to senior management.

**Priority**: Should

**Acceptance Criteria**:
- Given I am on the manager dashboard
- Then I see the following metrics for the last 30 days: total query count, answer count, refusal count, refusal rate (%), and most-queried machines
- And each metric has a time-range selector for 7d, 30d, and all-time

---

## Fatima Al-Hassan — System Administrator

### US-FAT-01: Manage User Accounts

**Story**: As a system administrator, I want to create user accounts, assign roles, and deactivate accounts when employees leave, so that access is appropriately controlled at all times.

**Priority**: Must

**Acceptance Criteria**:
- Given I am logged in as an Administrator
- When I create a new user with role "Technician" and send them an invite
- Then the new user can log in and query the system
- And when I deactivate the user's account, their subsequent login attempt returns an "Account deactivated" error
- And the deactivated user's session tokens are immediately invalidated

---

### US-FAT-02: Monitor System Health

**Story**: As a system administrator, I want to monitor key system health metrics and receive alerts when thresholds are breached, so that I can act before technicians are impacted.

**Priority**: Should

**Acceptance Criteria**:
- Given monitoring and alerting are configured
- When query latency P95 exceeds 8 seconds for 5 consecutive minutes
- Then I receive an alert via the configured notification channel (Slack / email) within 2 minutes
- And the alert includes the current metric value and the threshold that was breached

---

### US-FAT-03: Restart a Failed Ingestion Job

**Story**: As a system administrator, I want to view the status of ingestion jobs and restart failed ones without touching the application code, so that I can recover from ingestion failures quickly.

**Priority**: Should

**Acceptance Criteria**:
- Given an ingestion job has failed (status: "Failed")
- When I locate the job in the admin interface and click "Retry"
- Then the ingestion job restarts from the beginning (not from the failed page)
- And the status updates to "Processing" and then "Complete" upon successful completion

---

### US-FAT-04: Rotate LLM API Key Without Downtime

**Story**: As a system administrator, I want to update the LLM API key in the system configuration without restarting the service, so that key rotation does not cause a service outage.

**Priority**: Could

**Acceptance Criteria**:
- Given the LLM API key is stored in a secrets manager (not hardcoded)
- When I update the API key in the secrets manager
- Then the application picks up the new key within 60 seconds (configurable refresh interval)
- And no active queries during the rotation are failed due to the key swap

---

### US-FAT-05: Audit Log Query

**Story**: As a system administrator, I want to search the audit log by user, machine, date range, and answer type, so that I can reconstruct a specific troubleshooting session during a post-incident review.

**Priority**: Should

**Acceptance Criteria**:
- Given a recorded incident occurred on a specific date involving Machine X
- When I filter the audit log by date and machine name
- Then I see all queries made for that machine on that date, with the full query text, retrieved chunk IDs, generated answer, and user ID
- And I can export the filtered results as a CSV file
