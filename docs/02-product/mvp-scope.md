# MechMind — MVP Scope

**Document version:** 1.0
**Status:** Approved
**Last updated:** 2026-09-04

---

## 1. Purpose

This document defines the precise boundary of the Minimum Viable Product (MVP) for the hackathon submission. Everything inside the MVP boundary must be fully functional and demonstrable on demo day. Everything outside is explicitly deferred and must not be partially built or stubbed in ways that create technical debt or demo confusion.

---

## 2. MVP Definition Statement

The MechMind MVP is a working RAG-based troubleshooting assistant that:

1. Accepts uploads of machine manual PDFs (3–5 manuals across 2–3 distinct machine models)
2. Processes those PDFs through a full ingestion pipeline: parse → chunk → embed → store
3. Answers technical queries via a hybrid retrieval pipeline: BM25 + pgvector → RRF fusion → machine filter → evidence gate → LLM → structured JSON response
4. Disambiguates correctly when the same error code exists across multiple machines
5. Refuses gracefully when evidence is insufficient — never hallucinates
6. Maintains up to 3 turns of follow-up conversation context per session
7. Presents answers with source citations (manual name, page number, section)
8. Provides a working chat UI for technicians and a manual upload/management UI for admins

---

## 3. In MVP

### 3.1 Ingestion Capabilities

| Capability | Detail |
|------------|--------|
| PDF upload via admin UI | Drag-and-drop or file picker; validated, stored, processed |
| PyMuPDF text extraction | Per-page text with page number and embedded metadata |
| Semantic + section-aware chunking | 400–600 token target, section boundary detection, 50-token overlap |
| Table detection | Tables preserved as single chunks; `is_table: true` tag |
| Error code tagging | Regex detection; `error_codes[]` populated per chunk |
| Gemini embedding (text-embedding-004) | 768-dimensional vectors, batch API calls |
| pgvector storage | Cosine similarity index on `chunks.embedding` |
| BM25 index | In-memory rank-bm25 index, rebuilt on new ingest |
| Duplicate detection | SHA-256 hash; reject with HTTP 409 |
| Ingestion job status | SSE stream with per-stage progress |
| Machine model association | Required field at upload time |
| Manual metadata storage | Name, machine model, version, page count, upload timestamp |

### 3.2 Query Capabilities

| Capability | Detail |
|------------|--------|
| BM25 keyword retrieval | Exact and near-exact match; essential for error codes |
| pgvector ANN retrieval | Cosine similarity; semantic symptom queries |
| RRF result fusion | k=60, top-10 candidates after fusion |
| Machine model filter | Applied after fusion; removes cross-machine candidates when machine is known |
| Evidence sufficiency gate | Score < EVIDENCE_THRESHOLD (default 0.35) → refuse, no LLM call |
| Machine disambiguation | Detects cross-machine ambiguity in top candidates; issues clarification question |
| LLM answer generation | Google Gemini Pro / Flash; structured JSON output enforced |
| Structured JSON response | `has_answer`, `answer`, `steps`, `confidence`, `citations`, `warnings`, `follow_up_suggestions` |
| Citation validation | chunk_ids in citations validated against database before response delivery |
| Graceful refusal | `has_answer: false`; lists searched manuals; no LLM call; logged |
| Confidence level | HIGH / MEDIUM / LOW based on evidence score thresholds |

### 3.3 Conversation Capabilities

| Capability | Detail |
|------------|--------|
| Session creation | UUID session, stored in Redis with 30-minute TTL |
| Machine context persistence | Established machine stored in session; applied to follow-up queries |
| Conversation history | Last 6 messages (3 user + 3 assistant) in session |
| Pending query replay | Query stored in session during disambiguation; replayed after user selects machine |
| 3-turn follow-up | Up to 3 turns before context reset notification |

### 3.4 Frontend Capabilities

| Capability | Detail |
|------------|--------|
| Chat interface (technician) | Message thread, query input, send button |
| Answer rendering | Markdown-formatted answer text |
| Citation panel | Collapsible panel showing source, page, section, excerpt for each citation |
| Confidence badge | Color-coded HIGH / MEDIUM / LOW badge |
| Machine selector | Dropdown populated from ingested machines; used for disambiguation response |
| Disambiguation UI | Inline card asking user to select machine; wired to session replay |
| Graceful refusal rendering | "No answer found" state with explanation text |
| Admin upload panel | File picker, machine model input, upload button, progress indicator |
| Admin manual list | Table of ingested manuals with status, chunk count, error codes |

### 3.5 Infrastructure

| Component | Technology | MVP Config |
|-----------|------------|-----------|
| Backend | Python 3.11, FastAPI | Uvicorn, single process |
| Frontend | Next.js 14, TypeScript | Next.js dev server or static export |
| Database | PostgreSQL 15 + pgvector 0.5 | Single instance, Docker |
| Vector index | pgvector IVFFlat or HNSW | Local, same PostgreSQL instance |
| BM25 | rank-bm25, in-memory | Rebuilt on startup and after ingest |
| LLM + Embeddings | Google Gemini API | API key via environment variable |
| Session cache | Redis 7 | Single instance, Docker |
| Deployment | Docker Compose | Single machine, all services |

---

## 4. Not in MVP — Explicitly Deferred

### 4.1 Deferred Features

| Feature | Why Deferred | Target Phase |
|---------|-------------|-------------|
| OCR for scanned PDFs | Requires Tesseract or Document AI setup; adds significant complexity; demo PDFs will be digital-native | Phase 2 |
| Cross-encoder reranking | Valuable for quality but adds latency and a model dependency; BM25+vector fusion sufficient for demo | Phase 2 (Could Have, may include if time allows) |
| Voice query input | Requires browser microphone permissions, Web Speech API integration; not core to hackathon evaluation | Phase 2 |
| Multilingual queries | Requires multilingual embeddings or translation preprocessing; demo will be English-only | Phase 2 |
| Diagram / image retrieval | Requires multimodal pipeline; current stack is text-only | Phase 3 |
| Auto machine detection from sensor feeds | Requires IoT integration; no sensor infrastructure in hackathon environment | Phase 4 |
| Multi-tenant factory isolation | Single-tenant for hackathon; row-level security and tenant routing needed for production | Phase 3 |
| CMMS REST API integration | External integration not evaluable in hackathon context | Phase 3 |
| Custom embedding fine-tuning | Requires labeled training data and fine-tuning infrastructure | Phase 4 |
| Predictive troubleshooting | Requires historical fault data; no sensor integration | Phase 4 |
| Manual access control (per-user permissions) | All users see all manuals in MVP; ACL needed for production | Phase 3 |
| Audit log for compliance | Not required for hackathon; needed for enterprise deployment | Phase 3 |
| Horizontal scaling / load balancing | Single-instance Docker Compose; scaling architecture described in ADRs for reference | Phase 3 |
| Email/Slack notifications | No notification integrations in MVP | Phase 3 |

### 4.2 Partially Implemented Patterns — Rules

The following shortcuts are explicitly **prohibited** to keep the demo clean:

- **No hardcoded answers.** Every answer must go through the actual RAG pipeline.
- **No mock retrieval.** Retrieval must query the real database with real embeddings.
- **No skipping the evidence gate.** The evidence threshold must be active even in demo mode.
- **No placeholder citation data.** Citations must reference real ingested chunk_ids.
- **No in-memory PDF storage.** Files must be written to disk; the database record must exist.

---

## 5. Seed Data Requirements for MVP

The following materials must be prepared and ingested before the hackathon demo:

| Manual | Machine Model | Pages (approx.) | Key Error Codes to Include |
|--------|--------------|-----------------|---------------------------|
| AlphaBot 3000 Operations Manual | AlphaBot 3000 | 40–60 | E101 (motor overload), E102 (sensor fault), E201 (comm error) |
| ZenithBot Z-Series Manual | ZenithBot Z-Series | 40–60 | E101 (hydraulic pressure fault — DIFFERENT from AlphaBot), E103 (calibration error) |
| PrecisionMill PM-5 Manual | PrecisionMill PM-5 | 30–50 | P-401 (spindle vibration), P-402 (coolant flow fault) |

> The E101 cross-manual conflict (AlphaBot: motor overload vs ZenithBot: hydraulic pressure) is the primary disambiguation demo scenario and must be present in seed data.

---

## 6. MVP Success Criteria

The MVP is considered complete and demo-ready when all of the following pass:

| # | Criterion | Verification Method |
|---|-----------|-------------------|
| 1 | All 3 seed manuals are ingested with 0 failed chunks | Check `ingestion_jobs` table; all COMPLETE |
| 2 | Query "E101 on AlphaBot 3000" returns correct answer citing AlphaBot manual, page X | Manual query test |
| 3 | Query "E101 on ZenithBot" returns correct answer citing ZenithBot manual, page Y (different answer from #2) | Manual query test |
| 4 | Query "E101" (no machine specified, both machines have it) returns clarification question | Manual query test |
| 5 | Query "what is error F99 on ZenithBot" returns `has_answer: false` graceful refusal | Manual query test |
| 6 | Query "spindle vibrating" returns relevant PrecisionMill chunks via semantic retrieval | Manual query test |
| 7 | Follow-up query after establishing AlphaBot context does not require re-specifying machine | Manual query test |
| 8 | Citations shown in UI reference the correct manual name and page number | Visual inspection |
| 9 | Ingestion of a new PDF completes within 90 seconds and is immediately queryable | Timed test |
| 10 | Duplicate PDF upload returns HTTP 409 with descriptive error | API test |

---

## 7. Out-of-Scope Clarifications

These topics came up in planning and are explicitly clarified as out of scope:

- **Authentication and login:** MVP has no authentication. All users access the same interface. Production would require auth.
- **Rate limiting:** No per-user rate limiting in MVP. Gemini API quota is the effective limit.
- **Analytics dashboard:** Query logs are written to the database but no analytics UI is built for MVP.
- **Manual PDF viewer:** The citation panel shows excerpts and page numbers but does not embed a PDF viewer for the source document.
- **Spell correction:** Typos in queries are not corrected before retrieval. BM25 handles this poorly; this is a known limitation.
- **Synonyms and aliases:** No synonym expansion (e.g., "motor" vs "actuator") in MVP. Semantic search partially compensates.

---

*End of MVP Scope*
