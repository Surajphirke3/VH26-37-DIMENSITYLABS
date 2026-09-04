# Metadata Strategy — MechMind

## Overview

Metadata is the **primary disambiguation mechanism** in MechMind. Without rich, consistent metadata, the system cannot reliably distinguish between an error code that means "cooling fault" on Machine X and "motor fault" on Machine Y. Vector similarity alone cannot make this distinction — two chunks about different faults on different machines may have similar embeddings if they use similar language. Metadata filters enforce machine-scope before similarity ever matters.

This document defines metadata at three levels: manual, page, and chunk. It also defines how metadata is used at query time for filtering, disambiguation, and citation generation.

---

## Level 1: Manual-Level Metadata

Manual-level metadata is recorded once per uploaded PDF and is inherited by all pages and chunks derived from that manual.

### Schema

```
manuals
├── manual_id          UUID PRIMARY KEY
│     The stable identifier for this manual. Never reused.
│
├── machine_id         UUID NOT NULL REFERENCES machines(id)
│     FK to the machine this manual describes. This is the master
│     disambiguation key — every chunk inherits this FK.
│
├── machine_name       TEXT NOT NULL
│     Human-readable machine name, e.g., "Haas VF-2".
│     Denormalized here for fast display without JOIN.
│
├── machine_model      TEXT NOT NULL
│     Model number/identifier, e.g., "VF-2", "0i-MF".
│     Used in fuzzy machine detection during query analysis.
│
├── manufacturer       TEXT NOT NULL
│     e.g., "Haas Automation", "Fanuc".
│
├── manual_type        TEXT NOT NULL
│     Enum: operator | service | parts | installation | programming
│     Determines retrieval priority: service manuals ranked higher
│     for error code queries; parts manuals ranked higher for
│     part number queries.
│
├── language           TEXT NOT NULL DEFAULT 'en'
│     ISO 639-1 language code. Used to select the correct
│     tokenizer and BM25 stopword list.
│
├── upload_date        TIMESTAMP NOT NULL DEFAULT NOW()
│
├── version            TEXT
│     Manual version string as printed in the PDF, e.g., "v3.2",
│     "Rev. B", "2023-09". Used for version conflict detection.
│
├── page_count         INTEGER NOT NULL
│     Total pages in the PDF, recorded at ingestion.
│
├── processing_status  TEXT NOT NULL DEFAULT 'PENDING'
│     Enum: PENDING | PROCESSING | READY | FAILED | SUPERSEDED
│     Only manuals with status READY are queried.
│     SUPERSEDED marks older versions of the same manual.
│
├── sha256_hash        TEXT NOT NULL UNIQUE
│     SHA-256 of the PDF binary. Prevents duplicate ingestion.
│
├── storage_path       TEXT NOT NULL
│     Path to the original PDF in the object store.
│
└── ingested_by        UUID REFERENCES users(id)
      The admin user who uploaded this manual.
```

### Version Management

When a new version of an existing manual is uploaded:
1. The new manual is ingested with `processing_status = PENDING`
2. After successful ingestion, the new manual's status is set to `READY`
3. The old manual's status is set to `SUPERSEDED`
4. All queries now retrieve from the new manual's chunks
5. The old manual's chunks are retained for audit and rollback purposes but excluded from retrieval via a `WHERE processing_status = 'READY'` filter on the JOIN

---

## Level 2: Page-Level Metadata

Page-level metadata is recorded once per PDF page during the parsing stage (Stage 2). It is used for citation display (linking answers to specific pages) and for quality-weighted retrieval (image-only pages are lower confidence).

### Schema

```
pages
├── page_id            UUID PRIMARY KEY
│
├── manual_id          UUID NOT NULL REFERENCES manuals(id)
│
├── page_num           INTEGER NOT NULL
│     1-indexed page number within the PDF.
│
├── page_type          TEXT NOT NULL
│     Enum: text | mixed | image
│     - text: native PDF text, no image content
│     - mixed: text + embedded images or diagrams
│     - image: scanned page, text extracted via OCR only
│
├── has_tables         BOOLEAN NOT NULL DEFAULT false
│     True if PyMuPDF detected at least one table on this page.
│
├── has_diagrams       BOOLEAN NOT NULL DEFAULT false
│     True if non-table images are present (schematics, photos).
│
├── section_heading    TEXT
│     The highest-level heading detected on this page, if any.
│     Used to populate the section context in citations.
│
├── ocr_confidence     FLOAT
│     Average OCR confidence score (0–100) from pytesseract.
│     NULL for non-image pages. Pages below 60 are flagged.
│
└── word_count         INTEGER
      Approximate word count after extraction. Used for
      ingestion quality diagnostics.
```

### Page Metadata in Citations

When MechMind displays a citation to the technician, it uses page metadata to build the citation record:

```
"Retrieved from: Haas VF-2 Service Manual v3.2,
 Chapter 7 > Error Codes > E101,
 Pages 214–215"
```

The `page_num` from the page record drives the "View in Manual" deep link if a PDF viewer is implemented.

---

## Level 3: Chunk-Level Metadata

Chunk-level metadata is the most granular and is the direct input to all retrieval filters, reranking decisions, citation generation, and hallucination control checks. This level combines all fields defined in [chunking-strategy.md](./chunking-strategy.md) plus embedding versioning.

### Schema

```
chunks
├── chunk_id               UUID PRIMARY KEY
│
├── manual_id              UUID NOT NULL REFERENCES manuals(id)
│
├── machine_id             UUID NOT NULL REFERENCES machines(id)
│     Inherited from the manual. The primary filter key.
│     INDEXED: standard B-tree index for equality filter.
│
├── page_start             INTEGER NOT NULL
│
├── page_end               INTEGER NOT NULL
│
├── section_path           TEXT NOT NULL
│     Full breadcrumb path, e.g.:
│     "Chapter 3 > Error Codes > E101"
│     "Chapter 5 > Maintenance > Coolant System > WARNING"
│     Used for citation display and context headers.
│
├── chunk_type             TEXT NOT NULL
│     Enum: section | error_code | table | warning | overlap
│     INDEXED: B-tree index. Retrieval can boost error_code
│     chunks by type when query is classified as error_code.
│
├── error_codes_present    TEXT[] NOT NULL DEFAULT '{}'
│     Array of all error codes detected in this chunk text.
│     Examples: ['E101'], ['E101', 'E102'], []
│     INDEXED: GIN index on the array for fast containment query:
│       WHERE error_codes_present @> ARRAY['E101']
│
├── token_count            INTEGER NOT NULL
│
├── is_safety_critical     BOOLEAN NOT NULL DEFAULT false
│     True for warning/caution chunks and chunks with safety
│     text. Used to ensure safety content is never omitted.
│
├── has_ambiguous_headers  BOOLEAN NOT NULL DEFAULT false
│     For table chunks where column headers were uncertain.
│
├── embedding_model_version TEXT NOT NULL DEFAULT 'text-embedding-004'
│     Records which version of the Gemini embedding model was
│     used. Critical for re-embedding on model upgrades.
│     When a new embedding model version is deployed, chunks
│     with older versions are flagged for re-ingestion.
│
├── text                   TEXT NOT NULL
│     The full chunk text as passed to the embedding model.
│
├── embedding              vector(768) NOT NULL
│     The 768-dimensional Gemini text-embedding-004 vector.
│     INDEXED: ivfflat index with lists=100 for ANN search.
│
└── created_at             TIMESTAMP NOT NULL DEFAULT NOW()
```

---

## Metadata Use at Query Time

### Path A: Machine Is Known

When the machine_id is known (from session, explicit mention, or disambiguation history), the metadata filter is applied as a **hard WHERE clause** before retrieval:

**Vector retrieval:**
```sql
SELECT chunk_id, text, section_path, chunk_type, page_start, page_end,
       1 - (embedding <=> query_embedding) AS cosine_similarity
FROM chunks
JOIN manuals ON chunks.manual_id = manuals.id
WHERE chunks.machine_id = :machine_id          -- hard filter
  AND manuals.processing_status = 'READY'      -- only live manuals
ORDER BY cosine_similarity DESC
LIMIT 20;
```

**BM25 retrieval:**
The BM25 index for the machine is pre-built and scoped to that machine's chunks. When machine_id is known, only the machine-scoped BM25 index is queried.

**Effect:** Zero chunks from any other machine can enter the candidate set. Cross-machine contamination is impossible in this path.

### Path B: Machine Is Unknown

When machine_id is null, retrieval runs across all indexed chunks. No machine filter is applied in the SQL query:

```sql
SELECT chunk_id, text, section_path, chunk_type, machine_id, page_start, page_end,
       1 - (embedding <=> query_embedding) AS cosine_similarity
FROM chunks
JOIN manuals ON chunks.manual_id = manuals.id
WHERE manuals.processing_status = 'READY'      -- only live manuals
ORDER BY cosine_similarity DESC
LIMIT 20;
```

After retrieval, the metadata `machine_id` field on each returned chunk is inspected to detect ambiguity. See [machine-disambiguation.md](./machine-disambiguation.md) for the full ambiguity detection algorithm.

### Error Code Exact-Match Pre-Filter

When the query contains a detected error code, an additional pre-filter is applied using the GIN-indexed `error_codes_present` array:

```sql
-- Applied as a BONUS filter to boost relevant chunks
-- This runs as a separate high-priority retrieval pass

SELECT chunk_id, text, section_path, chunk_type, machine_id, page_start, page_end
FROM chunks
JOIN manuals ON chunks.manual_id = manuals.id
WHERE error_codes_present @> ARRAY[:normalized_code]   -- GIN array containment
  AND manuals.processing_status = 'READY'
  -- AND machine_id = :machine_id   (if machine is known)
ORDER BY chunk_type = 'error_code' DESC,   -- error_code chunks first
         created_at DESC                    -- prefer newer manual versions
LIMIT 10;
```

These exact-match results are merged with the BM25 + vector results before RRF fusion. They receive a synthetic rank boost of `rank = 1` (highest priority) in the RRF calculation, ensuring that an exact error code match is never buried below semantically similar but less precise chunks.

### Section Path in Citation Generation

The `section_path` field is used directly in citation display. After the LLM responds, the system builds citation records for each referenced chunk:

```python
def build_citation(chunk: Chunk) -> Citation:
    return {
        "citation_id": assign_citation_id(),
        "chunk_id": chunk.chunk_id,
        "manual_id": chunk.manual_id,
        "manual_name": chunk.manual.display_name,
        "machine_name": chunk.machine.name,
        "page_start": chunk.page_start,
        "page_end": chunk.page_end,
        "section_path": chunk.section_path,      # "Chapter 7 > Error Codes > E101"
        "chunk_type": chunk.chunk_type,
        "relevance_score": chunk.reranker_score,
        "excerpt": chunk.text[:300] + "..."      # first 300 chars for display
    }
```

The `section_path` is the human-readable location that appears in the citation panel, enabling the technician to locate the original information in the physical manual or PDF viewer.

---

## Metadata Consistency Guarantees

### At Ingestion Time

- `machine_id` is provided by the admin at upload time; it is not inferred from the document. This ensures the FK is always accurate.
- All chunks derived from a manual inherit the same `machine_id`. There is no per-chunk machine assignment.
- The `embedding_model_version` is recorded at embedding time, not at upload time, so partial re-embedding jobs produce consistent version tracking.

### At Query Time

- The `manuals.processing_status = 'READY'` filter ensures that a manual being processed is never queried mid-ingestion (which would return partial results with missing chunks).
- A manual whose ingestion job has `status = FAILED` is automatically excluded and the admin is notified.
- If two versions of the same manual exist (one READY, one SUPERSEDED), only the READY version is queried. Both versions retain their chunks in the database for rollback purposes.

### Schema Migrations

When the chunk metadata schema changes (e.g., adding a new field), a migration script must:
1. Add the column with a safe default
2. Backfill existing chunks where possible
3. Flag chunks that cannot be backfilled with a quality warning
4. Update the ingestion pipeline to populate the new field going forward

The `embedding_model_version` field enables targeted re-embedding: when a new Gemini embedding model is released, only chunks with `embedding_model_version != 'new-model-id'` need to be re-embedded, rather than re-ingesting every document.
