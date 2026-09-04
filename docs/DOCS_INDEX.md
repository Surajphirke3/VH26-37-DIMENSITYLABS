# Documentation Index

> **MechMind — Complete Documentation Navigation**
>
> This is the single entry point for all project documentation. Every document in the `docs/` tree is listed here with a one-line description. Start here when looking for a specific design decision, implementation detail, or operational procedure.
>
> Documents are ordered by directory, which reflects the natural reading order from problem through to delivery.

---

## Quick Navigation

| Looking for... | Go to |
|---|---|
| What the system does | [00-overview/product-vision.md](#00-overview) |
| Architecture diagram | [03-architecture/system-architecture.md](#03-architecture) |
| RAG pipeline design | [04-rag/rag-overview.md](#04-rag) |
| API endpoints | [07-api/api-overview.md](#07-api) |
| How to run locally | [README.md](../README.md) |
| Demo script | [02-product/hackathon-demo-plan.md](#02-product) |
| Safety: machine scope | [13-evaluation/evaluation-framework.md](#13-evaluation) |
| Hallucination prevention | [04-rag/hallucination-control.md](#04-rag) |
| Citation design | [04-rag/citation-strategy.md](#04-rag) |
| Implementation timeline | [14-project-management/implementation-roadmap.md](#14-project-management) |
| Pre-submission checklist | [14-project-management/engineering-checklist.md](#14-project-management) |

---

## 00-overview

Foundational documents establishing the problem, constraints, and intent.

| File | Description |
|---|---|
| [00-overview/original-problem-statement.md](00-overview/original-problem-statement.md) | The verbatim hackathon problem statement as received, unmodified. |
| [00-overview/problem-analysis.md](00-overview/problem-analysis.md) | Structured decomposition of the problem into technical and product sub-problems. |
| [00-overview/product-vision.md](00-overview/product-vision.md) | The one-sentence vision, the user it serves, and the outcome it enables. |
| [00-overview/goals-and-non-goals.md](00-overview/goals-and-non-goals.md) | Explicit scope boundaries — what MechMind does and deliberately does not do. |
| [00-overview/assumptions.md](00-overview/assumptions.md) | Design assumptions baked into the architecture that must be revisited if conditions change. |
| [00-overview/terminology.md](00-overview/terminology.md) | Glossary of domain and technical terms used consistently across all documents. |

---

## 01-requirements

What the system must do, who uses it, and how they use it.

| File | Description |
|---|---|
| [01-requirements/functional-requirements.md](01-requirements/functional-requirements.md) | Numbered list of functional requirements (FR-001 through FR-XXX) covering all system behaviours. |
| [01-requirements/non-functional-requirements.md](01-requirements/non-functional-requirements.md) | Performance, reliability, scalability, and security targets with measurable thresholds. |
| [01-requirements/user-personas.md](01-requirements/user-personas.md) | Profiles of the two primary users: the field technician and the document administrator. |
| [01-requirements/user-stories.md](01-requirements/user-stories.md) | User stories in "As a... I want... So that..." format covering the primary workflows. |
| [01-requirements/user-journeys.md](01-requirements/user-journeys.md) | Step-by-step journey maps for the technician querying and the admin uploading a manual. |
| [01-requirements/acceptance-criteria.md](01-requirements/acceptance-criteria.md) | Verifiable acceptance criteria for each feature, used as the basis for the engineering checklist. |
| [01-requirements/edge-cases.md](01-requirements/edge-cases.md) | Catalogue of edge and corner cases the system must handle gracefully. |

---

## 02-product

Product scope, demo planning, and future direction.

| File | Description |
|---|---|
| [02-product/mvp-scope.md](02-product/mvp-scope.md) | Explicit definition of what is and is not in the MVP, with rationale for each exclusion. |
| [02-product/feature-specification.md](02-product/feature-specification.md) | Detailed specification of each feature: inputs, outputs, error states, and UI behaviour. |
| [02-product/hackathon-demo-plan.md](02-product/hackathon-demo-plan.md) | Scripted demo flow with three scenarios, timing, and judge Q&A preparation guide. |
| [02-product/future-roadmap.md](02-product/future-roadmap.md) | Post-hackathon feature roadmap: OCR, multi-language, voice interface, IoT integration. |

---

## 03-architecture

System design, component relationships, and architectural decisions.

| File | Description |
|---|---|
| [03-architecture/system-architecture.md](03-architecture/system-architecture.md) | Full system architecture: service topology, component responsibilities, and deployment overview. |
| [03-architecture/component-architecture.md](03-architecture/component-architecture.md) | Internal component breakdown of the backend service: modules, interfaces, and dependency graph. |
| [03-architecture/data-flow.md](03-architecture/data-flow.md) | Data flow diagrams for the ingestion pipeline and the query pipeline, with sequence steps. |
| [03-architecture/troubleshooting-flow.md](03-architecture/troubleshooting-flow.md) | Decision tree for the query path: classification → retrieval → disambiguation → generation → citation. |
| [03-architecture/failure-flows.md](03-architecture/failure-flows.md) | How the system behaves when each component fails: graceful degradation paths and fallbacks. |
| [03-architecture/architecture-decisions.md](03-architecture/architecture-decisions.md) | Architecture Decision Records (ADRs) for key choices: pgvector over dedicated vector DB, Gemini over OpenAI, etc. |

---

## 04-rag

Retrieval-Augmented Generation pipeline design — the technical core of MechMind.

| File | Description |
|---|---|
| [04-rag/rag-overview.md](04-rag/rag-overview.md) | End-to-end overview of the RAG pipeline: why each stage exists and how they connect. |
| [04-rag/chunking-strategy.md](04-rag/chunking-strategy.md) | Chunking design: section chunks, error code chunks, table chunks, overlap strategy, and size limits. |
| [04-rag/metadata-strategy.md](04-rag/metadata-strategy.md) | Metadata schema attached to each chunk: machine_id, document_id, chunk_type, page_number, error_code. |
| [04-rag/hybrid-retrieval.md](04-rag/hybrid-retrieval.md) | Hybrid retrieval design: BM25 + pgvector ANN search, RRF fusion formula, reranking, machine filter. |
| [04-rag/machine-disambiguation.md](04-rag/machine-disambiguation.md) | Disambiguation algorithm: how candidate machines are scored, ranked, and presented to the user. |
| [04-rag/context-assembly.md](04-rag/context-assembly.md) | How retrieved chunks are assembled into the LLM context window: ordering, markers, token budget. |
| [04-rag/hallucination-control.md](04-rag/hallucination-control.md) | Multi-layer hallucination prevention: evidence sufficiency, prompt constraints, refusal logic, citation validation. |
| [04-rag/citation-strategy.md](04-rag/citation-strategy.md) | Citation design: how chunk IDs are passed to the LLM, extracted from the response, and validated. |

---

## 05-ai

AI model selection and prompt engineering.

| File | Description |
|---|---|
| [05-ai/model-selection.md](05-ai/model-selection.md) | Rationale for choosing Gemini text-embedding-004 and Gemini 1.5 Flash; comparison with alternatives. |
| [05-ai/prompt-architecture.md](05-ai/prompt-architecture.md) | Full system prompt template, structured output JSON schema, and prompt design principles. |

---

## 06-data

Database design and data modelling.

| File | Description |
|---|---|
| [06-data/data-model.md](06-data/data-model.md) | Conceptual data model: entities (Machine, Document, Chunk, Session, User) and their relationships. |
| [06-data/database-schema.md](06-data/database-schema.md) | Full PostgreSQL schema with table definitions, column types, indexes, and pgvector configuration. |

---

## 07-api

API design and endpoint reference.

| File | Description |
|---|---|
| [07-api/api-overview.md](07-api/api-overview.md) | API design principles: versioning, authentication, rate limiting, response envelope, pagination. |
| [07-api/authentication-api.md](07-api/authentication-api.md) | Auth endpoints: POST /auth/register, POST /auth/login, POST /auth/refresh, GET /auth/me. |
| [07-api/troubleshooting-api.md](07-api/troubleshooting-api.md) | Core query endpoints: POST /troubleshoot/query, POST /troubleshoot/disambiguate; full response schemas. |
| [07-api/document-api.md](07-api/document-api.md) | Document management endpoints: POST /documents/upload, GET /documents, GET /documents/{id}/status. |
| [07-api/error-handling.md](07-api/error-handling.md) | Error code catalogue, standard error response schema, and HTTP status code conventions. |

---

## 08-frontend

Frontend architecture and UI component specifications.

| File | Description |
|---|---|
| [08-frontend/frontend-architecture.md](08-frontend/frontend-architecture.md) | Next.js App Router structure, auth context, API client design, and state management approach. |
| [08-frontend/technician-ui.md](08-frontend/technician-ui.md) | Technician chat interface specification: layout, component hierarchy, interaction flows. |
| [08-frontend/loading-error-empty-states.md](08-frontend/loading-error-empty-states.md) | Design specification for loading states, error states, and empty states across all UI components. |

---

## 09-security

Security design, threat modelling, and verification.

| File | Description |
|---|---|
| [09-security/security-overview.md](09-security/security-overview.md) | Security architecture: authentication model, authorisation rules, data protection approach. |
| [09-security/threat-model.md](09-security/threat-model.md) | STRIDE threat model: threats identified per component, residual risk, and mitigating controls. |
| [09-security/security-checklist.md](09-security/security-checklist.md) | Security verification checklist covering auth, input validation, secrets management, and API hardening. |

---

## 10-testing

Testing strategy, test data, and evaluation cases.

| File | Description |
|---|---|
| [10-testing/testing-strategy.md](10-testing/testing-strategy.md) | Testing pyramid: unit, integration, API, and RAG evaluation — what is tested and how. |
| [10-testing/test-data.md](10-testing/test-data.md) | Test data design: synthetic PDF structure, error code distribution, and machine variant design. |
| [10-testing/rag-evaluation.md](10-testing/rag-evaluation.md) | Test case design for RAG evaluation: how golden records are written and maintained. |
| [10-testing/ambiguity-test-cases.md](10-testing/ambiguity-test-cases.md) | Disambiguation-specific test cases: ambiguous queries, expected disambiguation triggers, and resolution paths. |

---

## 11-observability

Logging and operational visibility.

| File | Description |
|---|---|
| [11-observability/logging.md](11-observability/logging.md) | Structured logging design: log levels, log fields, request ID propagation, and log event catalogue. |

---

## 12-devops

Containerisation and deployment.

| File | Description |
|---|---|
| [12-devops/docker.md](12-devops/docker.md) | Docker Compose service definitions, build configuration, volume mounts, and environment variable wiring. |
| [12-devops/deployment.md](12-devops/deployment.md) | Deployment guide: fresh environment setup, migration procedure, and cold-start verification steps. |

---

## 13-evaluation

RAG evaluation framework and metric definitions.

| File | Description |
|---|---|
| [13-evaluation/evaluation-framework.md](13-evaluation/evaluation-framework.md) | Full evaluation framework: metric definitions with formulas, golden dataset requirements, automated pipeline with build gates, and Machine Scope Accuracy as a safety metric. |

---

## 14-project-management

Implementation planning, risk management, and pre-submission verification.

| File | Description |
|---|---|
| [14-project-management/implementation-roadmap.md](14-project-management/implementation-roadmap.md) | Phased 36-hour hackathon implementation plan with phase gates, prioritization tiers, and non-negotiables. |
| [14-project-management/engineering-checklist.md](14-project-management/engineering-checklist.md) | Pre-submission engineering checklist with 91 items across RAG pipeline, disambiguation, hallucination control, citations, API, frontend, security, demo readiness, and deployment. |
| [14-project-management/risks.md](14-project-management/risks.md) | Risk register with 8 identified risks: probability, impact, mitigation strategies, and contingency plans. |
| [14-project-management/open-decisions.md](14-project-management/open-decisions.md) | Open design decisions with current assumptions, alternatives, and consequences — OCR, BM25 storage, sessions, streaming, and more. |

---

## Document Count Summary

| Directory | Documents |
|---|---|
| 00-overview | 6 |
| 01-requirements | 7 |
| 02-product | 4 |
| 03-architecture | 6 |
| 04-rag | 8 |
| 05-ai | 2 |
| 06-data | 2 |
| 07-api | 5 |
| 08-frontend | 3 |
| 09-security | 3 |
| 10-testing | 4 |
| 11-observability | 1 |
| 12-devops | 2 |
| 13-evaluation | 1 |
| 14-project-management | 4 |
| **Total** | **58** |

---

*Last updated: 2026-09-04. All documents in this index are authoritative. If a document exists in the filesystem but is not listed here, add it before submitting.*
