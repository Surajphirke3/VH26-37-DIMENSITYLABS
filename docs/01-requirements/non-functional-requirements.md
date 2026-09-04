# Non-Functional Requirements

## Document Purpose

Non-functional requirements (NFRs) define the quality attributes and operational constraints of MechMind. They govern how the system behaves, not what it does. Each NFR includes a measurable acceptance criterion, failure threshold, and rationale specific to the factory troubleshooting context.

**Priority Levels:** Must / Should / Could / Future (same as functional requirements)

---

## NFR-001: End-to-End Query Response Time

| Field | Detail |
|---|---|
| **Title** | Query-to-Answer Latency |
| **Description** | The time from a user submitting a query to the system displaying a complete, structured answer (including citation) must be under 5 seconds for the 95th percentile of queries under normal load (up to 20 concurrent users). |
| **Priority** | Must |
| **Rationale** | A technician standing next to a broken machine in a noisy production environment will not wait 30 seconds for an answer. Latency above 10 seconds causes technicians to abandon the system and resort to manual searching, defeating the product's purpose. |
| **Measurement** | End-to-end latency logged in the audit log for every query. P95 computed daily over a rolling 7-day window. |
| **Failure Threshold** | P95 latency exceeding 10 seconds constitutes a performance failure. |
| **Acceptance Criteria** | (1) Automated load test with 20 concurrent users sending queries at 1 query/user/minute achieves P95 latency below 5 seconds. (2) Single-user query achieves P95 below 3 seconds. (3) Latency percentiles are logged and accessible in the admin dashboard. |

---

## NFR-002: Ingestion Processing Time

| Field | Detail |
|---|---|
| **Title** | Manual Ingestion Throughput |
| **Description** | A typical machine manual (up to 500 pages, born-digital PDF) must complete ingestion (text extraction, chunking, embedding, vector store insertion) within 10 minutes. Scanned PDFs (requiring OCR) are allowed up to 30 minutes for the same page count. |
| **Priority** | Should |
| **Rationale** | When a new machine is purchased or a manual is updated, technicians need the system to reflect new content quickly. Multi-hour ingestion delays reduce operational agility. |
| **Measurement** | Ingestion job duration recorded in the ingestion log. |
| **Failure Threshold** | Ingestion exceeding 60 minutes for a 500-page born-digital manual. |
| **Acceptance Criteria** | (1) Test ingestion of a 500-page born-digital PDF completes in under 10 minutes. (2) Test ingestion of a 500-page scanned PDF (with OCR) completes in under 30 minutes. (3) Ingestion is non-blocking: the system remains queryable while ingestion runs. |

---

## NFR-003: Retrieval Precision

| Field | Detail |
|---|---|
| **Title** | Top-N Retrieval Precision for Error Code Queries |
| **Description** | For error code queries where the correct chunk (containing the error code's description and corrective action) is present in the vector store, the correct chunk must appear in the top-3 retrieved results in at least 90% of test cases. |
| **Priority** | Must |
| **Rationale** | Low retrieval precision means the correct chunk is not in the context passed to the LLM, making a correct answer impossible regardless of LLM quality. Precision is the foundation of answer quality. |
| **Measurement** | Evaluated using a curated test set of 50 error code queries with known correct chunks. Top-3 recall rate reported. |
| **Failure Threshold** | Top-3 precision below 75%. |
| **Acceptance Criteria** | (1) For 45 of 50 test queries (90%), the correct chunk appears in the top-3 positions after reranking. (2) Test is repeatable and results are within 2% variance across runs. |

---

## NFR-004: Answer Grounding Rate

| Field | Detail |
|---|---|
| **Title** | Percentage of Answer Statements Grounded in Retrieved Chunks |
| **Description** | At least 95% of substantive statements in generated answers must be directly supported by and traceable to retrieved chunks (verified by the hallucination check step). Ungrounded statements must be flagged or removed. |
| **Priority** | Must |
| **Rationale** | An answer with 80% grounded statements and 20% hallucinated statements is not trustworthy. In a safety context, the 20% may contain the most dangerous misinformation. |
| **Measurement** | Evaluated by the automated hallucination check. Grounding rate computed over a 7-day rolling window of all answered queries. |
| **Failure Threshold** | Grounding rate below 90% on the automated evaluation. |
| **Acceptance Criteria** | (1) Hallucination check passes for 95% of statements in a sample set. (2) No corrective step statement passes the hallucination check that is not present (semantically) in a retrieved chunk. |

---

## NFR-005: System Availability

| Field | Detail |
|---|---|
| **Title** | Service Uptime |
| **Description** | The MechMind API and UI must be available 99% of the time during factory operating hours (defined as the two operating shifts, e.g., 06:00–22:00 local time, Monday–Saturday). Planned maintenance windows are excluded. |
| **Priority** | Must |
| **Rationale** | Machine faults happen unpredictably. A system that is unavailable when needed most is useless. Even 1% downtime represents approximately 8 hours per month of unavailability during operating hours. |
| **Measurement** | Uptime monitored by a synthetic health check pinging the API every 60 seconds. Monthly uptime report generated. |
| **Failure Threshold** | More than 60 minutes of unplanned downtime in a rolling 30-day period during operating hours. |
| **Acceptance Criteria** | (1) Uptime monitoring is configured and active. (2) System recovers from a crashed application process within 30 seconds (process supervisor or container restart policy). (3) Monthly availability report accessible to admin. |

---

## NFR-006: Graceful Degradation

| Field | Detail |
|---|---|
| **Title** | Partial Failure Handling |
| **Description** | If a non-critical component fails (e.g., the reranking service is unavailable), the system shall degrade gracefully: fall back to retrieval ranking without reranking, notify the admin, and continue serving queries with reduced quality. If a critical component fails (LLM inference endpoint, vector store), the system shall return a structured error message to the user explaining that the service is temporarily unavailable. |
| **Priority** | Should |
| **Rationale** | Factory operations cannot pause while a secondary system component is restarted. Graceful degradation ensures partial functionality is maintained. |
| **Acceptance Criteria** | (1) Reranker service failure: queries still return results (unranked), and a status flag in the admin dashboard indicates degraded mode. (2) LLM endpoint failure: queries return an error message, not a 500 server error page. (3) Vector store failure: queries return an error message with a suggested retry time. |

---

## NFR-007: Data Security — Encryption at Rest

| Field | Detail |
|---|---|
| **Title** | Encryption of Stored Manual Content and User Data |
| **Description** | All stored data must be encrypted at rest: uploaded PDF files, extracted text, chunk embeddings, audit logs, and user account data. Encryption standard: AES-256 or equivalent. Encryption keys must not be stored alongside the encrypted data. |
| **Priority** | Must |
| **Rationale** | Machine manuals may contain proprietary manufacturing information. Factory floor query logs reveal operational details. Encryption at rest protects against data exposure in the event of physical or logical storage compromise. |
| **Acceptance Criteria** | (1) Storage layer uses AES-256 encryption (cloud provider managed encryption is acceptable). (2) Database audit confirms encryption is enabled. (3) Encryption key management is documented. |

---

## NFR-008: Data Security — Encryption in Transit

| Field | Detail |
|---|---|
| **Title** | TLS Encryption for All Network Communication |
| **Description** | All communication between clients and the API, and between internal services (API to vector store, API to LLM endpoint) must use TLS 1.2 or higher. HTTP connections must be redirected to HTTPS. |
| **Priority** | Must |
| **Rationale** | Queries contain error codes and machine identifiers that could reveal production issues. Manual content is proprietary. Unencrypted transmission exposes both to network interception. |
| **Acceptance Criteria** | (1) HTTPS is enforced; HTTP requests are redirected (HTTP 301). (2) TLS version check confirms TLS 1.2 minimum is in use. (3) Certificate is valid and not self-signed in production. (4) Internal service calls use TLS where endpoints are not on the same localhost. |

---

## NFR-009: Access Control

| Field | Detail |
|---|---|
| **Title** | Role-Based Access Control Enforcement |
| **Description** | Every API endpoint must enforce role-based access control. Technician-role requests to admin endpoints must return HTTP 403. Authentication tokens must be validated on every request (stateless JWT or session token checked against a session store). Tokens must expire after 8 hours of issuance or 60 minutes of inactivity, whichever comes first. |
| **Priority** | Must |
| **Rationale** | Preventing privilege escalation (a technician performing admin operations) is a basic security requirement. Token expiry limits the window of exposure if a token is compromised. |
| **Acceptance Criteria** | (1) Attempting to upload a manual with a Technician-role token returns HTTP 403. (2) Expired token returns HTTP 401. (3) Forged or modified JWT returns HTTP 401 (signature validation). |

---

## NFR-010: Scalability — Horizontal Application Layer

| Field | Detail |
|---|---|
| **Title** | Horizontal Scalability of the API Service |
| **Description** | The API service shall be stateless with respect to user session data (session state stored externally in a session store, not in application memory). This design enables horizontal scaling by adding application instances without session affinity requirements. |
| **Priority** | Should |
| **Rationale** | As factory adoption grows, query volume may increase. Stateless application design is the prerequisite for horizontal scaling. Without it, load balancing requires sticky sessions, which complicates failover. |
| **Acceptance Criteria** | (1) Two API instances can serve the same session without the user experiencing state loss. (2) Session store is external (Redis or equivalent) and not local to the application instance. (3) Load balancer health check confirms both instances are serving traffic. |

---

## NFR-011: Vector Store Scalability

| Field | Detail |
|---|---|
| **Title** | Vector Store Performance at Scale |
| **Description** | The vector store must sustain retrieval latency below 500ms for a corpus of up to 1 million chunks under concurrent query load (20 users). Vector store must support metadata filtering (machine model filter applied before nearest-neighbour search). |
| **Priority** | Should |
| **Rationale** | A large factory with many machines and multi-year manual archives could accumulate hundreds of thousands of chunks. Retrieval must remain fast at this scale for the overall query latency NFR to be met. |
| **Acceptance Criteria** | (1) Vector store retrieval with metadata filter on a 500,000-chunk index completes in under 500ms for 95% of queries. (2) Metadata filter (machine model) is applied server-side, not post-retrieval. (3) Horizontal scaling or sharding capability is documented. |

---

## NFR-012: Maintainability — Configuration-Driven Tuning

| Field | Detail |
|---|---|
| **Title** | Tunable Parameters via Configuration |
| **Description** | The following parameters must be configurable without code changes or redeployment: relevance threshold (default 0.60), top-K retrieval count (default 20), top-N reranked count (default 5), chunk size (default 512 tokens), chunk overlap (default 50 tokens), session idle timeout (default 60 minutes), audit log retention days (default 90), LLM model identifier, embedding model identifier. |
| **Priority** | Should |
| **Rationale** | Optimal parameter values depend on the specific document corpus and query patterns. The ability to tune without redeployment dramatically reduces the iteration cycle during calibration. |
| **Acceptance Criteria** | (1) All listed parameters are present in a configuration file (YAML, TOML, or environment variables). (2) Changing a parameter and restarting the service applies the change without code modification. (3) Configuration validation at startup rejects out-of-range values with a clear error message. |

---

## NFR-013: Observability — Structured Logging

| Field | Detail |
|---|---|
| **Title** | Structured Log Output for All Pipeline Stages |
| **Description** | The system shall emit structured logs (JSON format) for every pipeline stage: query received, retrieval started/completed (with chunk count and latency), reranking started/completed, evidence sufficiency check result, LLM invocation started/completed, hallucination check result, answer returned. Each log entry must include a correlation ID (trace ID) that links all log entries for a single query. |
| **Priority** | Should |
| **Rationale** | Without structured logs, debugging a failed or low-quality query requires guessing which pipeline stage failed. Correlation IDs enable end-to-end query tracing across distributed service boundaries. |
| **Acceptance Criteria** | (1) All pipeline stage events produce a JSON log entry. (2) Every log entry for a single query shares the same trace ID. (3) Log entries are queryable by trace ID in the log aggregation system. (4) Latency at each stage is recorded in milliseconds. |

---

## NFR-014: Observability — Metrics and Alerting

| Field | Detail |
|---|---|
| **Title** | Operational Metrics and Alert Thresholds |
| **Description** | The system shall expose metrics compatible with a standard monitoring platform (Prometheus-compatible or cloud-native equivalent). Required metrics: query count (total, by result type), query latency percentiles (P50, P95, P99), refusal rate, hallucination check fail rate, ingestion job count (success/failure), LLM API error rate, vector store query latency. Alerts shall be configured for: P95 latency > 8s, refusal rate > 30%, LLM error rate > 5%, ingestion failure rate > 10%. |
| **Priority** | Should |
| **Rationale** | Metrics enable proactive detection of performance degradation before users are impacted. Alert thresholds represent conditions that indicate systematic failure requiring immediate investigation. |
| **Acceptance Criteria** | (1) Metrics endpoint exposes all specified metrics. (2) Alert rules are configured and fire correctly under simulated threshold breaches. (3) Metrics are retained for at least 30 days. |

---

## NFR-015: Portability — Containerised Deployment

| Field | Detail |
|---|---|
| **Title** | Docker-Based Deployment Packaging |
| **Description** | All MechMind services (API, ingestion worker, UI, vector store, session store) shall be deployable via Docker Compose for development and demonstration. A production deployment guide shall document how to migrate each component to a managed cloud service. |
| **Priority** | Should |
| **Rationale** | Hackathon demonstrations require rapid environment setup. Docker Compose enables a one-command startup. Production portability ensures the system is not locked to a single infrastructure provider. |
| **Acceptance Criteria** | (1) `docker compose up` starts all services and the system is queryable within 3 minutes on a clean environment. (2) Docker images build from the provided Dockerfile without errors. (3) No host dependencies outside Docker are required for full operation. |

---

## NFR-016: Recoverability — Data Backup

| Field | Detail |
|---|---|
| **Title** | Vector Store and Database Backup |
| **Description** | The vector store and relational database (user accounts, audit logs, ingestion metadata) must be backed up daily. Backups must be retained for 30 days (configurable). Recovery from backup must restore the system to a queryable state within 2 hours. |
| **Priority** | Should |
| **Rationale** | Vector store corruption or accidental deletion of the manual index would require complete re-ingestion of all manuals, which is time-consuming. Daily backups limit the maximum data loss to one day. |
| **Acceptance Criteria** | (1) Daily backup process is automated and logged. (2) A test restore procedure is documented. (3) A test restore from a 7-day-old backup completes within 2 hours on reference hardware. |

---

## NFR-017: Accessibility — UI Standards

| Field | Detail |
|---|---|
| **Title** | Web UI Accessibility Compliance |
| **Description** | The web UI must comply with WCAG 2.1 Level AA. Specifically: all interactive elements must be keyboard navigable, colour contrast ratio must meet 4.5:1 for normal text, error messages must not rely solely on colour, and screen reader compatibility must be maintained for core query and answer flows. |
| **Priority** | Could |
| **Rationale** | Factory environments may include technicians with visual impairments or those who access the system via assistive technology. Legal compliance in many jurisdictions requires accessibility adherence. |
| **Acceptance Criteria** | (1) Automated accessibility audit (axe-core or equivalent) reports zero critical violations on the query and answer UI pages. (2) Core query flow is completable using keyboard only (no mouse required). |

---

## NFR-018: Usability — Mobile and Tablet Compatibility

| Field | Detail |
|---|---|
| **Title** | Responsive Layout for Factory Floor Devices |
| **Description** | The web UI must be usable on tablet devices (minimum 768px width) and rugged smartphones (minimum 360px width) without horizontal scrolling. The query input field and answer display must be prominently accessible on small screens without requiring zoom. |
| **Priority** | Must |
| **Rationale** | Factory floor technicians are rarely at a desktop workstation. The device in their hand is a tablet or a rugged phone. A desktop-only UI is not fit for purpose. |
| **Acceptance Criteria** | (1) UI renders correctly at 360px, 768px, and 1280px viewport widths. (2) No horizontal scrolling occurs at any supported viewport width. (3) Query input and submit button are visible without scrolling on a 768px viewport. (4) Answer text is legible at factory floor reading conditions (minimum 16px base font). |

---

## NFR-019: Data Integrity — Citation Accuracy

| Field | Detail |
|---|---|
| **Title** | Verifiable Accuracy of Citations in Answers |
| **Description** | Every citation in a generated answer must reference a chunk ID that was present in the retrieved chunk set for that query. Post-generation, the system must verify that no citation references a chunk ID not in the retrieved set (a phantom citation). Phantom citations must be removed from the answer before it is returned. |
| **Priority** | Must |
| **Rationale** | A citation that points to the wrong source — or to a source that was never retrieved — is worse than no citation. It gives the technician false confidence that they can verify the information, while the verification will fail. |
| **Measurement** | Phantom citation rate measured by the hallucination check component. |
| **Failure Threshold** | Any phantom citation reaching the user constitutes a data integrity failure. |
| **Acceptance Criteria** | (1) Automated test: inject a fabricated chunk ID into an LLM response; verify the phantom citation check catches and removes it. (2) Zero phantom citations in a sample of 100 production answers (verified by audit log cross-reference). |

---

## NFR-020: Compliance — Audit Trail Integrity

| Field | Detail |
|---|---|
| **Title** | Tamper-Evident Audit Log |
| **Description** | The audit log must be write-once (append-only). No user, including administrators, may modify or delete individual audit log entries. Log entries may be archived or expired only through the configured retention policy (not manual deletion). This ensures that all answers given can be reviewed post-incident. |
| **Priority** | Should |
| **Rationale** | In a safety-critical environment, if a technician performs an incorrect procedure based on MechMind's answer, the audit log is evidence of what the system said. If logs can be modified, this evidence is unreliable. |
| **Acceptance Criteria** | (1) Audit log storage is configured as append-only (no update/delete permissions). (2) Attempting to delete an audit log entry via API or database returns an error or is blocked by database constraint. (3) Log expiry (retention policy) is the only mechanism for log removal and is configurable only by administrators. |

---

## NFR-021: Performance — Embedding Inference

| Field | Detail |
|---|---|
| **Title** | Query Embedding Latency |
| **Description** | Converting the user query to an embedding vector must complete within 200ms. This is the first step in the retrieval pipeline and sets the floor for total query latency. |
| **Priority** | Must |
| **Rationale** | Embedding inference on the query is a synchronous blocking step in the query path. Slow embedding inference directly contributes to total query latency, which has a hard 5-second target. |
| **Acceptance Criteria** | (1) Query embedding inference completes in under 200ms for 95% of queries on reference hardware. (2) Embedding model is loaded into memory at service startup, not loaded per-query. |

---

## NFR-022: Data Residency

| Field | Detail |
|---|---|
| **Title** | Manual Data Stored Within Configured Region |
| **Description** | All uploaded manual content, extracted chunks, and embeddings must be stored in a data region configurable at deployment time. For factory environments with data residency requirements (GDPR, national data sovereignty laws), deployment must be possible within the specified region without data leaving the region boundary. |
| **Priority** | Future |
| **Rationale** | Some manufacturing environments have regulatory data residency requirements. Early design of deployment configuration prevents architectural rework when this requirement matures. |
| **Acceptance Criteria** | (1) Deployment configuration includes a region selector. (2) All data stores (vector store, object storage, database) can be configured to use the selected region. (3) LLM inference can be routed to a region-specific API endpoint or an on-premise model. |
