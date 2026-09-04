# RAG Pipeline Overview — MechMind

## Purpose

This document describes every stage of the MechMind Retrieval-Augmented Generation (RAG) pipeline. The pipeline converts raw machine manuals (PDFs) into structured, queryable knowledge and then uses that knowledge to answer technician queries with full traceability and hallucination controls.

The pipeline has two major phases:

- **Ingestion pipeline** — run once per manual upload, offline or near-real-time
- **Query pipeline** — run on every technician query, must complete in under 5 seconds end-to-end

---

## Ingestion Pipeline

### Stage 1: Ingestion Trigger (Upload)

A technician administrator uploads a machine manual PDF through the MechMind admin interface. The upload triggers an asynchronous background job via FastAPI's BackgroundTasks (or a task queue such as Celery in production).

**Inputs:** PDF binary, form metadata (machine_id, machine_name, machine_model, manufacturer, manual_type, language, version)

**Outputs:** A job record in the `ingestion_jobs` table with status `PENDING`

**Key behaviors:**
- File is stored to an object store (local filesystem in development, S3-compatible in production)
- A SHA-256 hash of the PDF is computed and stored; re-uploading an identical file is a no-op
- The job record is updated to `PROCESSING` before Stage 2 begins
- All subsequent stages run sequentially within the job worker

---

### Stage 2: PDF Parsing (PyMuPDF, Page-by-Page)

PyMuPDF (`fitz`) opens the PDF and iterates through every page, extracting raw content.

**Per-page extraction:**
- Text blocks with bounding-box coordinates
- Font size and weight metadata (used for heading detection in Stage 4)
- Page dimensions
- Image presence flags

**Implementation notes:**
- Page extraction is done with `page.get_text("dict")` to get structured block/line/span output rather than flat text
- Block-level bounding boxes enable detection of multi-column layouts
- Font size thresholds (e.g., font size >= 14 or bold weight) are used to identify headings
- Tables are identified by detecting lines/rectangles using `page.get_drawings()` in combination with text alignment heuristics

**Output:** A list of `RawPage` objects, one per PDF page, each containing block-level structured text and metadata about fonts, images, and drawings.

---

### Stage 3: OCR Fallback (pytesseract for Image Pages)

Some machine manual pages are scanned images embedded in the PDF — they contain no extractable text layer.

**Detection:** A page is classified as an image-only page if the total extracted text length is below 50 characters and the page contains at least one image block.

**OCR process:**
1. PyMuPDF renders the page to a high-resolution pixmap (300 DPI)
2. The pixmap is converted to a PIL Image
3. pytesseract runs OCR on the image with the configured language (default: `eng`)
4. OCR output is treated as the page's text for all subsequent stages
5. Page is flagged as `page_type = "image"` in the page metadata record

**Limitations and handling:**
- OCR text quality is lower than native PDF text; a lower confidence threshold is applied to chunks from image pages during retrieval
- Diagrams and schematics are not OCR'd for semantic content — they are noted as "diagram present" in page metadata
- Tables in image pages are OCR'd as plain text and may lose column alignment; a table-reconstruction heuristic attempts to recover column boundaries from whitespace patterns

---

### Stage 4: Structure Extraction

Structure extraction analyzes the raw text blocks to identify logical document structure. This stage is critical because machine manuals have highly consistent structure: chapters, sections, error code tables, warnings, and cautions.

**Heading detection:**
- Primary heuristic: font size relative to body text size (body text is the most frequent font size on the page)
- Secondary heuristic: bold weight + short line length (under 80 characters)
- Result: a heading hierarchy (H1, H2, H3) is assigned to each detected heading

**Table detection:**
- Tables are detected via PyMuPDF drawing objects (horizontal and vertical lines forming a grid)
- Each table is extracted as a list of rows; each row is a list of cell text values
- Column headers are identified from the first row (if it is visually distinct or bold)

**Error code block detection:**
- A dedicated regex pass identifies blocks that look like error code entries
- Patterns detected: `E\d+`, `ERR[-\s]?\d+`, `F\d+`, `Fault\s+\d+`, `Alarm\s+\d+`
- A block is classified as an error code block if it contains at least one matching code followed by descriptive text within the same paragraph or table row

**Warning/Note block detection:**
- Lines or paragraphs beginning with `WARNING`, `CAUTION`, `NOTE`, `DANGER`, or `IMPORTANT` (case-insensitive) are flagged as safety-critical blocks
- These blocks are extracted as standalone units, preserving all text up to the next non-warning block

**Output:** A `StructuredDocument` object containing:
- `pages` — list of structured pages with detected headings, tables, error blocks, and warnings
- `section_map` — hierarchical map of heading text to page ranges
- `toc` — table of contents if extractable from PDF metadata

---

### Stage 5: Semantic Chunking (Section-Aware)

Chunking converts the structured document into retrieval units. MechMind does NOT use fixed token-size chunking. Instead, every chunk corresponds to a semantically complete unit. Full detail is in [chunking-strategy.md](./chunking-strategy.md).

**Chunk types produced:**
- `section` — one chunk per logical section (heading + content until next heading of same or higher level)
- `error_code` — one chunk per error code entry; always kept intact
- `table` — one chunk per table or per table row block
- `warning` — one chunk per WARNING/CAUTION/NOTE block
- `overlap` — 15% overlap chunks bridging adjacent section chunks

**Key constraint:** Error code chunks are never split. If an error code entry spans multiple pages, the entire entry forms one chunk even if it exceeds the 800-token soft maximum.

**Output:** A list of `Chunk` objects ready for metadata enrichment.

---

### Stage 6: Metadata Enrichment

Every chunk is enriched with a complete metadata record before embedding. Metadata is the primary disambiguation mechanism in MechMind. Full detail is in [metadata-strategy.md](./metadata-strategy.md).

**Chunk-level metadata fields added at this stage:**
- `chunk_id` — UUID generated fresh for each chunk
- `manual_id` — FK to the manual record
- `machine_id` — FK to the machine record (inherited from the upload form)
- `page_start`, `page_end`
- `section_path` — full breadcrumb, e.g., `"Chapter 3 > Error Codes > E101"`
- `chunk_type` — one of `section`, `error_code`, `table`, `warning`, `overlap`
- `error_codes_present` — array of all error codes detected within this chunk's text
- `token_count` — computed using the tokenizer compatible with the embedding model
- `created_at`

---

### Stage 7: Embedding Generation (Gemini text-embedding-004)

Each chunk's text is converted to a 768-dimensional dense vector using the Gemini `text-embedding-004` model.

**Inputs per chunk:**
- Primary text: chunk content
- Task type: `RETRIEVAL_DOCUMENT` (Gemini API parameter — optimizes embeddings for retrieval contexts)

**Batching:**
- Chunks are embedded in batches of 100 to minimize API round-trips
- Retry logic with exponential backoff handles rate-limit errors (429 responses)
- Failed chunks are recorded in the job log and can be retried independently

**Embedding quality considerations:**
- For short chunks (error code chunks under 50 tokens), the section_path is prepended to the chunk text before embedding to provide context: `"Chapter 3 > Error Codes > E101: [chunk text]"`
- This prevents very short chunks from having degenerate embeddings

**Output:** Each chunk is now associated with a 768-dimensional float32 vector.

---

### Stage 8: Storage (pgvector + BM25 Index)

**Vector storage (pgvector):**
- Each chunk is inserted into the `chunks` table, which has a `vector(768)` column
- An `ivfflat` index with `lists = 100` is used for approximate nearest-neighbor search
- `probes = 10` at query time balances recall and latency

**BM25 index:**
- A BM25 inverted index is built using the `rank_bm25` Python library
- The BM25 index is built from all chunk texts associated with each machine's manuals
- BM25 indexes are serialized and stored as blobs in the database (or in-memory cache for active machines)
- The BM25 index for a machine is rebuilt (incremental update) whenever a new manual is ingested for that machine

**Metadata storage:**
- All chunk metadata is stored as structured columns in the `chunks` table (not as a JSON blob), enabling efficient SQL filtering at query time
- The `error_codes_present` column is a PostgreSQL `TEXT[]` array with a GIN index for fast containment queries (`error_codes_present @> ARRAY['E101']`)

**Ingestion job finalization:**
- The ingestion job status is updated to `COMPLETED`
- The manual record is updated to `processing_status = READY`
- An audit log entry is written

---

## Query Pipeline

### Stage 9: Query Analysis

Every incoming technician query is analyzed before retrieval begins.

**Classification:** The query is classified into one of four types:
- `error_code` — query contains a detected error code (e.g., "what is E101?")
- `symptom` — query describes observable behavior (e.g., "machine vibrates and stops")
- `machine_scoped` — query explicitly mentions a machine name or model
- `vague` — query is too general to classify confidently (e.g., "something is wrong")

**Classification logic:**
1. Run error code regex detection (patterns: `E\d+`, `ERR[-\s]?\d+`, `F\d+`, `Fault\s+\d+`, `Alarm\s+\d+`)
2. If match found → `error_code` query type; extract the normalized code(s)
3. Run machine name detection (fuzzy match against indexed machine names)
4. If machine name detected → add `machine_scoped` flag (can co-exist with `error_code`)
5. If neither → classify as `symptom` or `vague` based on query length and vocabulary

**Query normalization:**
- Error codes are normalized to canonical form: "error 101" → "E101", "ERR 101" → "E101", "fault 101" → "F101"
- Normalized codes are used for both BM25 search and the `error_codes_present` pre-filter

---

### Stage 10: Machine Context Detection

Machine context determines whether a machine-scoped filter is applied during retrieval. Resolving machine context is critical to avoiding cross-machine confusion. Full detail is in [machine-disambiguation.md](./machine-disambiguation.md).

**Context sources evaluated in priority order:**
1. Session machine — if user has already selected or confirmed a machine in this session, use it
2. Explicit mention in query — machine name or model number in the query text
3. Conversation history — machine mentioned in a prior turn
4. Auto-detection from query vocabulary — machine-specific terminology matched against indexed jargon
5. Unknown — no machine context available; disambiguation may be required

**Outcome:**
- `machine_id` is either resolved (known) or null (unknown)
- If known: all subsequent stages apply a hard `machine_id` filter
- If unknown: retrieval proceeds cross-machine and may trigger a disambiguation response

---

### Stage 11: Parallel Retrieval (BM25 + pgvector ANN)

Both BM25 and vector retrieval run in parallel to maximize recall and minimize latency. Full detail is in [hybrid-retrieval.md](./hybrid-retrieval.md).

**BM25 retrieval:**
- Input: normalized query tokens
- Index: machine-specific BM25 index (or global index if machine is unknown)
- Returns: top-20 chunk candidates with BM25 scores

**Vector retrieval:**
- Input: query embedding (generated using Gemini `text-embedding-004` with task type `RETRIEVAL_QUERY`)
- Index: pgvector ivfflat index
- Filter: if machine_id is known, a `WHERE machine_id = ?` clause is applied before ANN search
- Returns: top-20 chunk candidates with cosine similarity scores

**Weight configuration:**
- Error code query: BM25 weight 0.6, vector weight 0.4
- Natural language query: BM25 weight 0.3, vector weight 0.7

---

### Stage 12: Result Fusion (Reciprocal Rank Fusion)

The two ranked lists from Stage 11 are merged into a single unified ranking using Reciprocal Rank Fusion (RRF).

**RRF formula:**

```
RRF_score(chunk) = Σ [1 / (k + rank_i)]
```

Where `k = 60` (standard default that reduces sensitivity to outlier high ranks) and `rank_i` is the chunk's rank in retrieval list `i` (BM25 list or vector list).

**Process:**
1. Assign RRF scores to all chunks appearing in either list (chunks appearing in only one list still receive a score from that list's contribution)
2. Sort all candidates by descending RRF score
3. This produces a merged candidate list of up to 40 unique chunks (up to 20 from each retrieval method)

---

### Stage 13: Machine Filter + Reranking (Cross-Encoder)

**Machine filter (hard filter):**
- If machine_id is known, any chunk in the merged list that does not belong to that machine is removed before reranking
- This is a hard filter, not a score adjustment — wrong-machine chunks are completely excluded

**Reranking:**
- The top-20 candidates from the merged list (post-filter) are passed to a cross-encoder reranker
- Model: `cross-encoder/ms-marco-MiniLM-L-6-v2` (local, no API cost)
- The cross-encoder receives the full query text and the full chunk text as a pair and outputs a relevance score
- Chunks are re-sorted by cross-encoder score
- Top-10 chunks are taken forward to the evidence gate

---

### Stage 14: Evidence Sufficiency Check

The evidence sufficiency gate is the primary hallucination prevention mechanism. It runs before the LLM is called.

**Calculation:**
```
evidence_score = weighted_average(top_3_reranker_scores)
              = (score_1 * 0.5 + score_2 * 0.3 + score_3 * 0.2)
```

**Decision:**
- If `evidence_score >= 0.45`: proceed to context assembly
- If `evidence_score < 0.45`: skip LLM entirely; return a structured refusal response indicating that the indexed manuals do not contain sufficient information for this query

**Rationale:** A low evidence score means the retrieval system could not find relevant chunks. Calling the LLM with weak context creates a high risk of hallucination. Refusing outright is safer than generating a confident-sounding but wrong answer.

Full detail is in [hallucination-control.md](./hallucination-control.md).

---

### Stage 15: Context Assembly

The top-10 ranked chunks are assembled into a structured context window for the LLM. Full detail is in [context-assembly.md](./context-assembly.md).

**Key rules:**
- Chunks ordered by reranker score (highest first)
- Each chunk is prefixed with its `section_path` as a context header
- Pre-assigned citation IDs ([1], [2], etc.) are embedded in the context
- Total token budget: 32,000 tokens; retrieved chunks take ~26,000 after reserving space for system prompt, schema, and conversation history
- Lowest-scoring chunks are truncated first if budget is exceeded; chunks are never truncated mid-text

---

### Stage 16: LLM Generation + Structured Output

The assembled context is sent to Gemini 1.5 Flash for answer generation.

**Key API parameters:**
- `response_schema` — Gemini's built-in structured output enforcement; the LLM must return valid JSON matching the defined schema or the API returns an error
- `temperature = 0.1` — very low temperature to minimize creative deviation from context
- `max_output_tokens = 2048` — sufficient for a complete structured answer

**Output schema:** The LLM must return a JSON object conforming to the schema defined in [prompt-architecture.md](../05-ai/prompt-architecture.md), including `answer_type`, `summary`, `probable_causes`, `corrective_steps` (with per-step citation IDs), and a `citations` array.

---

### Stage 17: Citation Mapping and Validation

After the LLM responds, the system validates every citation claim.

**Validation steps:**
1. Parse the LLM's JSON response
2. For every `citation_id` referenced in `corrective_steps` or elsewhere in the response, verify it exists in the pre-assembled citation map (the set of context chunks passed to the LLM)
3. Phantom citations — citation IDs that do not exist in the context map — are removed from the response
4. If more than 50% of citations are phantom, the response's `confidence_level` is downgraded to `LOW` and a disclaimer is added
5. Unmapped claims are flagged for the claim coverage check (see Layer 5 in hallucination-control.md)

---

### Stage 18: Response Delivery

The validated, citation-enriched response is serialized and returned to the frontend.

**Response envelope:**
```json
{
  "query_id": "uuid",
  "answer_type": "solution",
  "machine_name": "Haas VF-2",
  "summary": "...",
  "error_meaning": "...",
  "probable_causes": ["..."],
  "corrective_steps": [
    {
      "step_number": 1,
      "action": "...",
      "warning": null,
      "citation_ids": ["cit-001"]
    }
  ],
  "citations": [
    {
      "citation_id": "cit-001",
      "manual_name": "Haas VF-2 Service Manual v3.2",
      "page_start": 214,
      "section_path": "Chapter 7 > Error Codes > E101",
      "excerpt": "...",
      "relevance_score": 0.87
    }
  ],
  "confidence_level": "HIGH",
  "evidence_score": 0.81,
  "notes": null,
  "follow_up_suggestions": ["Check coolant level", "Inspect pressure relief valve"]
}
```

**Streaming:** For large responses, the frontend receives a streaming SSE response where the answer fields are streamed as they complete. The citation panel is sent as the final event.

**Session update:** After a successful response, the session record is updated with the confirmed `machine_id`, enabling all follow-up queries in the same session to inherit the machine filter automatically.

---

## Pipeline Summary Table

| Stage | Phase | Component | Key Output |
|-------|-------|-----------|------------|
| 1 | Ingestion | Upload handler | Job record |
| 2 | Ingestion | PyMuPDF parser | Raw page blocks |
| 3 | Ingestion | pytesseract OCR | Text for image pages |
| 4 | Ingestion | Structure extractor | Headings, tables, error blocks, warnings |
| 5 | Ingestion | Semantic chunker | Typed chunks |
| 6 | Ingestion | Metadata enricher | Chunks with full metadata |
| 7 | Ingestion | Gemini embedder | 768-dim vectors |
| 8 | Ingestion | PostgreSQL + pgvector | Indexed chunks ready for retrieval |
| 9 | Query | Query analyzer | Query type + normalized codes |
| 10 | Query | Machine context detector | machine_id or null |
| 11 | Query | BM25 + pgvector retriever | 20+20 candidate chunks |
| 12 | Query | RRF fusion | Single ranked candidate list |
| 13 | Query | Cross-encoder reranker | Top-10 reranked chunks |
| 14 | Query | Evidence gate | Pass/refuse decision |
| 15 | Query | Context assembler | Token-budgeted context window |
| 16 | Query | Gemini 1.5 Flash | Structured JSON answer |
| 17 | Query | Citation validator | Validated citation map |
| 18 | Query | Response serializer | Final API response |
