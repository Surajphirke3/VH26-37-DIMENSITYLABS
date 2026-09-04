# Hackathon Problem Statement

**Event:** UCET | 2026 HACKATHON — Pixels to Possibilities
**Institution:** Vidyavardhini's College of Engineering & Technology, Palghar
**Domain:** Application Data Management (RAG)

---

## Problem Statement: RAG-Based Intelligent Machine Troubleshooting System

### Background

On any factory floor, machines fail in cryptic ways — a blinking code, a three-digit error number, an alarm buzzer with no explanation. The answer usually does exist, buried on page 214 of a 400-page PDF manual, in a different manual for a similar-but-not-identical model, or scattered across three separate documents that all need to be cross-referenced. A technician standing next to a stalled production line doesn't have time to search — every minute of downtime costs money.

### The Challenge

Design and build a RAG-based troubleshooting assistant that lets a technician type (or ask) almost anything — an error code, a symptom, a machine name, a vague description of "it's making a weird noise" — and get back a precise, trustworthy, sourced answer pulled from the correct manual, not a hallucinated guess.

This is harder than a standard "chat with your PDF" demo. Real manuals are messy: the same error code can mean different things on different machines, critical steps are hidden in tables and diagrams rather than clean paragraphs, and a wrong or invented answer during troubleshooting isn't just unhelpful — it can be genuinely unsafe. Your system needs to know not only what to retrieve, but which document it belongs to, and — just as importantly — when to admit it doesn't know.

---

## What You Need to Build

Full pipeline: **Manuals → Document Processing → Chunking → Embeddings → Retrieval → Context Assembly → LLM Response → Cited Solution**

### Minimum Requirements

1. **Ingest multiple manuals** (PDF) covering different machines, including at least one pair with overlapping/similar error codes that mean different things.
2. **Build a searchable knowledge base** — proper chunking and embeddings, not a single giant blob of text.
3. **Handle three query styles**: exact error codes ("E101"), natural-language symptoms ("Why is Machine A overheating?"), and machine/model-scoped questions.
4. **Disambiguate correctly** — if the same code exists across manuals, retrieve from the right machine, using context clues or by asking a clarifying question.
5. **Return structured answers**: error meaning, probable cause(s), step-by-step corrective action, and source citation (manual name, section, page number).
6. **Support follow-up conversation** — a user should be able to ask "and what if that doesn't fix it?" without repeating the machine/error context.
7. **Refuse gracefully** — if the manuals don't contain the answer, say so explicitly rather than inventing a plausible-sounding fix.
8. **Ship a usable interface** — simple web or chat UI, not just an API you test with curl.

### Where the Real Difficulty Lies

- **Cross-document ambiguity resolution** — same code, different machines, different answers. Get this wrong and the technician follows the wrong repair procedure.
- **Retrieval precision over recall** — pulling in plausible-looking but wrong chunks is worse than pulling in nothing.
- **Hallucination control under pressure** — LLMs are eager to be helpful even when the source material is thin. The system needs a real mechanism (not just a prompt instruction) to detect and flag insufficient context.
- **Traceability** — every claim in the output should be defensible back to a manual, section, and page — this is a domain where "trust me" isn't good enough.
- **Non-text content** — manuals are full of tables, diagrams, and structured layouts that naive text extraction mangles.

### Bonus Features (Optional)

OCR for scanned manuals, hybrid keyword + vector search, reranking, multilingual or voice queries, image/diagram retrieval, confidence scoring on answers, automatic machine-model detection from context.

---

## Deliverables

1. Working prototype with setup instructions
2. Short architecture note explaining chunking, retrieval, and hallucination-control strategy
3. Live demo: at least one exact-code query, one natural-language query, one cross-manual ambiguity case, and one "insufficient information" case
4. Sample outputs showing source citations
