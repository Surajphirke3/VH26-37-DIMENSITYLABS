# Hybrid Retrieval Design — MechMind

## Why Pure Vector Search Is Insufficient

MechMind operates in a domain where **exact string matching is as important as semantic similarity**. This is a fundamental challenge that rules out pure vector search as the sole retrieval mechanism.

### The Error Code Problem

Consider a query: `"What does E101 mean?"`

The embedding of this query will be semantically close to embeddings of chunks that discuss error codes in general, or specifically codes near E101. In a 768-dimensional embedding space:

- The embedding of "E101: cooling system pressure loss" and "E102: coolant temperature high" may be very close, because they share domain vocabulary (cooling, system, coolant) and the same structural pattern
- The embedding of "E101: motor overload detected" may also be close, sharing the error-code-entry structure

An embedding model trained on general text does not treat "E101" and "E102" as fundamentally different the way a keyword search engine does. The difference between E101 and E102 is a **single digit** — semantically nearly identical to the embedding model, but critically different to the technician who needs to fix machine error E101 specifically.

**BM25 keyword search does not have this problem.** BM25 scores `E101` as an exact token match. A chunk containing "E101" ranks far above a chunk containing "E102" for the query "E101", because BM25 operates on token-level term frequency, not semantic proximity.

### The Technical Language Problem

Machine manual language is highly domain-specific. Technicians may use:
- Official terminology: "axis servo amplifier fault"
- Slang or abbreviation: "servo amp is throwing an alarm"
- Symptom-based description: "machine stops and makes a beeping noise"

Pure BM25 fails on symptom-based queries because the vocabulary in the query ("beeping noise") may not appear in the manual ("audible alarm signal"). Vector search excels here because the embedding of "beeping noise" is semantically close to "audible alarm signal."

**The solution is to use both.** BM25 handles exact code matching; vector search handles semantic query variation. Reciprocal Rank Fusion merges the ranked lists into a unified result that benefits from both.

---

## Retrieval Pipeline

### Step 1: Query Preprocessing — Error Code Normalization

Before retrieval, the query text is normalized to ensure consistent matching against the indexed forms of error codes.

**Normalization rules:**

| Input form | Normalized form |
|---|---|
| `error 101` | `E101` |
| `Error Code 101` | `E101` |
| `ERR 101` | `ERR-101` |
| `ERR101` | `ERR-101` |
| `fault 101` | `F101` |
| `Fault 101` | `F101` |
| `alarm 101` | `A101` |
| `e 101` | `E101` |
| `e0101` | `E101` (strip leading zeros) |

**Normalization process:**
1. Apply regex patterns (see [chunking-strategy.md](./chunking-strategy.md) Detection Patterns section) to the raw query
2. For each match, produce the canonical normalized form
3. Replace the match in the query string with the normalized form
4. Store all detected normalized codes in the `query_context.error_codes` list

**Rationale:** Error codes in manuals are indexed in their canonical forms. If a technician types "error 0101" but the manual says "E101", BM25 will not match on tokenization alone. Normalization ensures the BM25 query tokens align with the indexed tokens.

---

### Step 2: Error Code Detection in Query

After normalization, the query is inspected for the presence of error codes using the same regex patterns applied during ingestion.

**Detection output:**
- `has_error_code: bool`
- `detected_codes: List[str]` — list of normalized codes found in the query
- `query_type: str` — classification result (see Stage 9 in rag-overview.md)

**This detection result drives weight selection in Step 3.**

---

### Step 3: BM25/Vector Weight Selection

Retrieval weights are selected based on the query type:

| Query type | BM25 weight | Vector weight | Rationale |
|---|---|---|---|
| `error_code` | 0.6 | 0.4 | Exact code match is primary signal; semantic context secondary |
| `symptom` / natural language | 0.3 | 0.7 | Semantic similarity is primary; keyword overlap secondary |
| `machine_scoped` | 0.4 | 0.6 | Both matter; machine name adds keyword signal |
| `vague` | 0.2 | 0.8 | Almost entirely semantic; keyword matching likely to mislead |

**Error code pre-filter (error_code queries only):**
When the query contains a detected error code, an additional exact-match pre-filter runs against the `error_codes_present` GIN index (see [metadata-strategy.md](./metadata-strategy.md)). Results from this pre-filter are injected into the BM25 candidate list at `rank = 1` before RRF, giving them maximum contribution to the fused score.

---

### Step 4: BM25 Retrieval

**Library:** `rank_bm25` (Python) — specifically the `BM25Okapi` class which implements the standard Okapi BM25 formula.

**BM25 formula:**

```
BM25(q, d) = Σ IDF(t) * [ tf(t,d) * (k1 + 1) ] / [ tf(t,d) + k1 * (1 - b + b * |d| / avgdl) ]

Where:
  t     = each query term
  d     = document (chunk text)
  tf    = term frequency in document
  IDF   = inverse document frequency = log((N - df + 0.5) / (df + 0.5) + 1)
  N     = total number of documents in index
  df    = document frequency for term t
  |d|   = document length in tokens
  avgdl = average document length across index
  k1    = 1.5 (term saturation, standard default)
  b     = 0.75 (length normalization, standard default)
```

**Index construction (at ingestion time):**
- A separate BM25 index is built for each machine's set of chunks
- The BM25 corpus is a list of tokenized chunk texts: `[tokenize(chunk.text) for chunk in machine_chunks]`
- Tokenization: lowercase, remove punctuation, apply language-specific stopwords
- The index is serialized using `pickle` and stored in the database as a binary blob in the `bm25_indexes` table, keyed by `machine_id`
- When a new manual is ingested for a machine, the BM25 index for that machine is rebuilt in full (incremental update is not supported by `rank_bm25`)

**Global BM25 index (for machine-unknown queries):**
- A single global BM25 index is maintained across all chunks from all machines
- Machine_id is tracked per document position so that machine_id can be recovered for each returned result

**Retrieval parameters:**
- Top-N candidates returned: **20**
- BM25 scores are not on a fixed scale; they are used only for rank ordering, not as absolute scores

---

### Step 5: Vector Retrieval

**Embedding the query:**
The query is embedded using the same Gemini `text-embedding-004` model used at ingestion time, but with task type `RETRIEVAL_QUERY` (instead of `RETRIEVAL_DOCUMENT`). Gemini optimizes the embedding differently for queries versus documents.

**Query embedding construction:**
- If the query has a known machine context, prepend the machine name: `"Haas VF-2: {query_text}"`
- This improves retrieval precision for machine-specific terminology

**ANN search using pgvector:**

```sql
-- Machine-known path
SELECT chunk_id, text, section_path, chunk_type, machine_id,
       page_start, page_end, is_safety_critical,
       1 - (embedding <=> :query_vector) AS cosine_similarity
FROM chunks
JOIN manuals ON chunks.manual_id = manuals.id
WHERE chunks.machine_id = :machine_id
  AND manuals.processing_status = 'READY'
ORDER BY embedding <=> :query_vector   -- pgvector ANN operator
LIMIT 20;

-- Machine-unknown path
SELECT chunk_id, text, section_path, chunk_type, machine_id,
       page_start, page_end, is_safety_critical,
       1 - (embedding <=> :query_vector) AS cosine_similarity
FROM chunks
JOIN manuals ON chunks.manual_id = manuals.id
WHERE manuals.processing_status = 'READY'
ORDER BY embedding <=> :query_vector
LIMIT 20;
```

**pgvector index configuration:**
```sql
-- Created once at schema setup
CREATE INDEX ON chunks USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Set at query time for accuracy/speed tradeoff
SET ivfflat.probes = 10;
```

- `lists = 100`: number of Voronoi cells; appropriate for up to ~1M vectors
- `probes = 10`: number of cells searched per query; higher = more accurate but slower
- Recall at `probes = 10` is approximately 95% vs. exact search for this dataset size

**Retrieval parameters:**
- Top-N candidates returned: **20**
- Distance metric: cosine distance (`<=>` operator)
- Cosine similarity = `1 - cosine_distance`

---

### Step 6: BM25 and Vector Results Parallelism

BM25 retrieval and vector retrieval are executed in parallel using Python's `asyncio.gather`:

```python
bm25_results, vector_results = await asyncio.gather(
    retrieve_bm25(query_tokens, machine_id, top_k=20),
    retrieve_vector(query_embedding, machine_id, top_k=20)
)
```

Both calls are I/O-bound (BM25 from cache/database, vector from PostgreSQL), so true parallel execution reduces latency compared to sequential retrieval.

---

### Step 7: Result Fusion — Reciprocal Rank Fusion (RRF)

RRF merges the two ranked candidate lists into a single unified ranking without requiring the scores from different retrieval systems to be on the same scale.

**RRF formula:**

```
RRF_score(d) = Σ_i  weight_i * (1 / (k + rank_i(d)))

Where:
  d        = a chunk document
  rank_i   = the rank of d in retrieval list i (1-indexed; 1 = highest)
  k        = 60  (the rank offset constant)
  weight_i = the retrieval weight for list i (BM25 or vector, from Step 3)
  Σ_i      = sum over all lists in which d appears
```

**Why k = 60?**
The constant `k` prevents high-rank results from dominating the fused score excessively. With `k = 60`, the score difference between rank 1 and rank 2 is `1/61 - 1/62 ≈ 0.00026`, whereas without `k` (i.e., k=0), the difference between rank 1 and rank 2 is `1/1 - 1/2 = 0.5`. The value `k = 60` is the standard default from the original RRF paper (Cormack et al., 2009) and remains widely used. It provides stable fusion across a wide range of retrieval score distributions.

**Example calculation (error_code query, weights 0.6/0.4):**

| Chunk | BM25 rank | Vector rank | RRF score |
|---|---|---|---|
| Chunk A | 1 | 3 | `0.6*(1/61) + 0.4*(1/63)` = 0.01617 |
| Chunk B | 2 | 1 | `0.6*(1/62) + 0.4*(1/61)` = 0.01620 |
| Chunk C | 15 | 2 | `0.6*(1/75) + 0.4*(1/62)` = 0.01445 |
| Chunk D | not in BM25 | 4 | `0.4*(1/64)` = 0.00625 |
| Chunk E | 3 | not in vector | `0.6*(1/63)` = 0.00952 |

**Fusion process:**

```python
def reciprocal_rank_fusion(
    bm25_results: List[Chunk],
    vector_results: List[Chunk],
    bm25_weight: float,
    vector_weight: float,
    k: int = 60
) -> List[Chunk]:

    scores = defaultdict(float)
    chunk_map = {}

    # BM25 contribution
    for rank, chunk in enumerate(bm25_results, start=1):
        scores[chunk.chunk_id] += bm25_weight * (1 / (k + rank))
        chunk_map[chunk.chunk_id] = chunk

    # Vector contribution
    for rank, chunk in enumerate(vector_results, start=1):
        scores[chunk.chunk_id] += vector_weight * (1 / (k + rank))
        chunk_map[chunk.chunk_id] = chunk

    # Sort by fused score descending
    sorted_ids = sorted(scores.keys(), key=lambda cid: scores[cid], reverse=True)

    # Return chunks in fused order with their RRF scores attached
    fused = []
    for cid in sorted_ids:
        chunk = chunk_map[cid]
        chunk.rrf_score = scores[cid]
        fused.append(chunk)

    return fused
```

---

### Step 8: Machine Filter (Hard Filter)

If `machine_id` is known, any chunk in the fused list that has a different `machine_id` is removed entirely.

```python
def apply_machine_filter(
    fused_chunks: List[Chunk],
    machine_id: Optional[UUID]
) -> List[Chunk]:
    if machine_id is None:
        return fused_chunks  # no filter applied
    return [c for c in fused_chunks if c.machine_id == machine_id]
```

This is a hard exclusion, not a score penalty. Wrong-machine chunks do not receive a lower score — they are removed from consideration entirely. This design choice is intentional: the risk of presenting cross-machine information to a technician is higher than the risk of reducing the candidate set.

**What if the filter removes all candidates?**
If the hard machine filter reduces the candidate list to zero chunks, the query pipeline returns an `insufficient_information` response. This indicates either:
- The indexed manuals for this machine do not cover this error code or topic
- The query is a cross-machine error code that was incorrectly machine-scoped

The response tells the technician which machine's manuals were searched and suggests verifying the machine selection.

---

### Step 9: Deduplication

After fusion and machine filtering, chunks are deduplicated by `chunk_id`. Duplicates can arise if the same chunk appears in both the BM25 and vector result lists (which is common for relevant chunks). RRF already handles this correctly by accumulating scores across lists, so after fusion each chunk_id appears at most once.

A secondary deduplication step removes **overlap chunks** if the corresponding non-overlap parent chunks are also present in the fused list. Overlap chunks are supplementary; if the original section chunk is already in the candidate set, the overlap chunk is redundant.

---

### Step 10: Top-10 for Reranking

After fusion, filter, and deduplication, the top-10 candidates by RRF score are taken forward to the cross-encoder reranking stage.

**Why top-10 for reranking?**
Cross-encoder reranking is computationally expensive (it processes the full query × full chunk pair for each candidate). Reranking 10 candidates is fast enough to stay within the 5-second response budget. The top-20 BM25 + top-20 vector retrieval provides sufficient recall for the reranker to work from, even if the top-10 cut does not include the most relevant chunk before reranking (the reranker's primary job is to correct the ranking within the top-10, not to discover new chunks).

---

## Summary: Retrieval Architecture Decision Table

| Design Choice | Decision | Rationale |
|---|---|---|
| BM25 implementation | rank_bm25 (local) | No additional service, free, adequate for scale |
| Vector index | pgvector ivfflat | Collocated with metadata, avoids separate vector DB |
| Fusion method | Reciprocal Rank Fusion | Score-scale agnostic, simple, proven in literature |
| RRF k constant | 60 | Standard default from original RRF paper |
| Top-K per retrieval method | 20 | Provides sufficient recall for reranker input |
| Machine filter placement | After fusion, before reranking | Hard guarantee of machine scope |
| Parallel execution | asyncio.gather | Minimizes latency for I/O-bound operations |
| Error code weight | 0.6 BM25, 0.4 vector | BM25 exact match dominates for code queries |
| NL query weight | 0.3 BM25, 0.7 vector | Semantic search dominates for natural language |
