# Model Selection Rationale — MechMind

## Overview

MechMind uses three distinct ML model roles:

| Role | Selected Model | Type |
|---|---|---|
| Text embedding | Gemini text-embedding-004 | API (Google) |
| Answer generation | Gemini 1.5 Flash | API (Google) |
| Reranking | cross-encoder/ms-marco-MiniLM-L-6-v2 | Local (HuggingFace) |

Each model was selected based on five criteria evaluated in priority order:
1. Correctness for the task (will it produce good results for industrial manual retrieval?)
2. Structured output support (can it return enforced JSON schemas?)
3. Cost (must be viable within hackathon budget, target: near-zero API cost)
4. Latency (must support < 5 second end-to-end query response)
5. Operational simplicity (fewer providers = fewer failure modes)

---

## Embedding Model: Gemini text-embedding-004

### What It Does

Converts text (either a document chunk at ingestion or a user query at query time) into a 768-dimensional dense vector that captures semantic meaning. These vectors are compared using cosine similarity during retrieval.

### Why Gemini text-embedding-004

**Dimension count:** 768 dimensions is the sweet spot for this use case. Lower dimensions (e.g., 384 from MiniLM) lose precision on technical domain vocabulary. Higher dimensions (e.g., 3072 from OpenAI text-embedding-3-large) provide marginal recall improvement at significant storage and compute cost.

**Task-type optimization:** Gemini text-embedding-004 accepts a `task_type` parameter that tells the model whether it is embedding a document (for indexing) or a query (for retrieval). This produces embeddings optimized for the asymmetric retrieval task, where query embeddings and document embeddings are in the same space but generated with different objectives.

- `RETRIEVAL_DOCUMENT` — used at ingestion time for all chunk embeddings
- `RETRIEVAL_QUERY` — used at query time for user query embeddings

Most competing models do not offer this distinction. Using the same embedding direction for both query and document (as required by models without task_type) produces measurably worse retrieval recall.

**Multilingual support:** Machine manuals may be in English, German, Japanese, or other languages depending on the manufacturer. Gemini text-embedding-004 handles multilingual content with a single model, eliminating the need for language-specific embedding models.

**Cost:** As of the model selection date, Gemini text-embedding-004 is available in the Google AI free tier at 15 RPM (requests per minute). At ingestion time, chunks are batched in groups of 100 to stay within rate limits. At query time, a single embedding call is required per query. This is effectively zero cost at hackathon scale.

### Alternatives Evaluated

**OpenAI text-embedding-3-small**
- 1536 dimensions (2x storage cost vs Gemini's 768)
- Comparable quality on technical retrieval benchmarks
- No task_type distinction; same model for query and document embedding
- Cost: $0.02 per million tokens — acceptable but nonzero
- Rejected: adds a second API provider dependency; no task_type advantage

**OpenAI text-embedding-3-large**
- 3072 dimensions (4x storage cost)
- Marginally better quality on MTEB benchmark
- Cost: $0.13 per million tokens — significant at scale
- Rejected: cost and storage overhead not justified by quality delta

**sentence-transformers/all-MiniLM-L6-v2 (local)**
- 384 dimensions
- Runs locally on CPU; zero API cost and zero API latency
- No task_type; English-only; trained on general web text
- Quality on technical domain retrieval is measurably worse than Gemini
- Rejected for primary embedding role; considered as a fallback if Gemini API is unavailable

**sentence-transformers/all-mpnet-base-v2 (local)**
- 768 dimensions, local
- Better quality than MiniLM; still no task_type
- Requires 420MB model download; GPU recommended for batch embedding
- Rejected: Gemini outperforms on technical retrieval with task_type optimization; API cost is acceptable

### Storage Implications

768 float32 values per vector = 3,072 bytes per chunk.
- 10,000 chunks (estimate for 50 manuals): ~30 MB of vector data
- 100,000 chunks (large deployment): ~300 MB
- Both sizes are comfortably within pgvector's supported scale with `ivfflat` indexing

---

## Generation Model: Gemini 1.5 Flash

### What It Does

Receives the assembled context window (system prompt, machine context, conversation history, retrieved chunks) and generates a structured JSON answer conforming to the MechMind output schema.

### Why Gemini 1.5 Flash

**Structured output support (`response_schema`):** This is the most important selection criterion. Gemini 1.5 Flash natively supports the `response_schema` parameter, which enforces JSON schema compliance at the API level — not as a prompt instruction, but as a hard constraint on the model's output sampler. If the model's output does not conform to the schema, the API returns an error rather than a non-conforming response.

This is critical for MechMind's hallucination control architecture. Without API-level schema enforcement, the prompt must instruct the model to follow the schema, and models occasionally deviate from schema instructions (especially for complex nested schemas). The `response_schema` parameter eliminates this failure mode.

**Context window:** Gemini 1.5 Flash supports a 1,048,576-token (1M) context window. MechMind uses at most 32,000 tokens per query, well within the limit. The large context window provides headroom for:
- Very large manual excerpts when a procedure spans many pages
- Long conversation histories in extended troubleshooting sessions
- Future expansion to multi-document, multi-machine comparison queries

**Speed:** Gemini 1.5 Flash is optimized for low latency. Typical time-to-first-token for a 32,000-token context is under 2 seconds. With the 5-second total response budget, this leaves 3 seconds for retrieval, reranking, and post-processing — a comfortable margin.

**Free tier:** The Gemini 1.5 Flash free tier provides:
- 15 RPM (requests per minute)
- 1,000,000 tokens per day input
- 4,000,000 tokens per minute input

At hackathon scale (estimate: 100–500 queries per day, 32,000 input tokens each), daily token usage is 3.2M–16M tokens. The free tier covers the low-traffic scenario; the 4M tokens/minute limit comfortably handles burst usage.

### Alternatives Evaluated

**Gemini 1.5 Pro**
- Larger model; higher quality on complex reasoning tasks
- 2M token context window (unnecessary; 1M is sufficient)
- Significantly higher cost and latency than Flash
- Also supports `response_schema`
- Rejected: quality delta does not justify cost/latency for structured extraction from retrieved context; Flash is adequate when the context is pre-filtered

**GPT-4o-mini**
- Strong performance on JSON output tasks
- JSON mode (structured output) available but does not support full JSON Schema validation at API level (as of selection date); must be simulated via prompt engineering
- Cost: $0.15 per million input tokens — low but nonzero
- Adds OpenAI as a second provider dependency
- Rejected: no API-level schema enforcement; adds provider dependency; Gemini gives unified platform benefits

**GPT-4o**
- Highest quality generation; excellent on technical content
- Supports structured output (JSON Schema) via `response_format` parameter in newer API versions
- Cost: $5.00 per million input tokens — prohibitive at scale
- Rejected: cost; Gemini Flash quality is sufficient for grounded retrieval-augmented generation

**Claude 3 Haiku (Anthropic)**
- Very fast inference; competitive quality
- Supports JSON output via system prompt instruction; no API-level schema enforcement
- Tool use API can be used to simulate schema enforcement
- Cost: $0.25 per million input tokens
- Rejected: no native `response_schema` equivalent; adds Anthropic as third provider; free tier not available

**Claude 3.5 Sonnet (Anthropic)**
- Highest quality on technical and reasoning tasks
- No native `response_schema`; JSON via prompt instruction only
- Cost: $3.00 per million input tokens
- Rejected: cost; schema enforcement limitation; third provider

**Llama 3 (local)**
- Free; runs entirely on-premises
- No structured output enforcement; JSON output is unreliable without fine-tuning
- Requires significant GPU infrastructure
- Quality on industrial domain technical content is below commercial models
- Rejected: schema enforcement is a hard requirement; infrastructure complexity

### API Parameters Used

```python
# Gemini 1.5 Flash generation call configuration
generation_config = {
    "temperature": 0.1,
    "top_p": 0.9,
    "max_output_tokens": 2048,
    "response_mime_type": "application/json",
    "response_schema": OUTPUT_JSON_SCHEMA   # Full schema from prompt-architecture.md
}

response = await gemini_client.generate_content(
    model="models/gemini-1.5-flash",
    contents=assembled_prompt,
    generation_config=generation_config
)
```

---

## Reranking Model: cross-encoder/ms-marco-MiniLM-L-6-v2

### What It Does

After BM25 + vector retrieval and RRF fusion, the reranker takes the top-20 candidate chunks and scores each one by evaluating the query and chunk text together as a pair. This cross-encoder architecture is fundamentally more accurate than bi-encoder (embedding) scoring because it can model the relationship between query and document in a single forward pass.

The reranker's score is the primary quality signal used in:
- Selecting the top-10 chunks for context assembly
- Computing the evidence score for the evidence gate
- Ordering chunks in the context window
- The confidence score formula

### Why cross-encoder/ms-marco-MiniLM-L-6-v2

**MS MARCO training data:** The model is trained on the Microsoft MS MARCO passage ranking dataset, which contains queries and relevant passages from a variety of domains. While not specifically trained on industrial manuals, it generalizes well to technical question-answering because MS MARCO includes technical documentation passages.

**Size and speed:** The MiniLM-L-6-v2 variant is the smallest cross-encoder variant available for MS MARCO, using a 6-layer MiniLM architecture. It runs efficiently on CPU:
- CPU inference time: approximately 50–80ms for 10 query-chunk pairs
- GPU inference time: approximately 5–10ms
- This keeps reranking within the 5-second response budget on CPU-only deployment

**Zero cost:** The model runs locally. No API calls, no per-token charges, no rate limits. At hackathon scale this is irrelevant, but it is a meaningful operational advantage.

**Local availability:** The model is downloaded from HuggingFace Hub on first startup and cached locally. No network dependency at inference time.

### Alternatives Evaluated

**cross-encoder/ms-marco-MiniLM-L-12-v2 (larger local model)**
- Deeper model (12 layers vs 6); measurably better precision
- Approximately 2x slower than L-6 variant: ~150ms for 10 pairs on CPU
- Still within the 5-second budget but provides less margin
- Consideration: upgrade to L-12 if L-6 recall is insufficient after evaluation

**Cohere Rerank API**
- Commercial reranking API with state-of-the-art quality
- Purpose-built for retrieval; trained on large proprietary datasets
- Latency: ~300ms per reranking call (API round-trip included)
- Cost: $2.00 per 1,000 searches — low at hackathon scale, significant at production scale
- Rejected: adds third-party API dependency; API key management overhead; local model quality is adequate

**BGE-Reranker-v2-m3 (local, multilingual)**
- Strong multilingual reranking; better quality than MS MARCO MiniLM on multilingual benchmarks
- Larger model: 278M parameters vs 22M for MiniLM-L-6; requires GPU for acceptable latency
- Consideration: upgrade path if multilingual manual support becomes a priority

**Reciprocal Rank Fusion as sole ranking (no reranker)**
- RRF alone is the retrieval fusion; skipping reranking saves 50–80ms
- Precision of top-10 results without reranking is measurably lower
- Rejected: the evidence gate relies on reranker scores; without reranking, the evidence gate has no reliable quality signal

---

## Unified Provider Strategy

MechMind uses Google (Gemini) for both embedding and generation. This is a deliberate design choice:

**Benefits of unified provider:**
- Single API key, single SDK (`google-generativeai`)
- Consistent rate limits under one quota
- No cross-provider authentication complexity
- If Google introduces new features (e.g., improved task_types, grounding APIs), MechMind benefits without adding providers

**Risks of unified provider:**
- If Google Gemini API experiences an outage, both embedding and generation are affected
- Mitigation: BM25 retrieval can operate without embeddings (degraded mode); pre-computed embeddings remain valid during outages

**Reranking is intentionally local** to avoid any API dependency for this critical pipeline stage. The reranker runs on the application server, making it immune to API outages.

---

## Model Version Management

### Embedding Model Version

All chunks store their `embedding_model_version` as metadata. When Google releases a new version of `text-embedding-004` or a successor model:

1. New model version is added to the configuration
2. A re-embedding job is scheduled for all chunks with `embedding_model_version != 'new-version'`
3. The pgvector index is rebuilt after re-embedding completes
4. During the re-embedding period, the old embedding model is used for queries (mixed-version retrieval is acceptable; the new model embeddings are progressively added)

### Generation Model Version

If Google deprecates `gemini-1.5-flash` in favor of a successor:
1. Test successor model with the full evaluation suite
2. Verify `response_schema` parameter is supported by the successor
3. Adjust `temperature` and `top_p` if quality characteristics differ
4. Update model name in configuration

### Reranking Model Upgrade Path

The local reranking model can be upgraded without affecting any other component:
1. Download new model to local cache
2. Run A/B test comparing old and new model on evaluation queries
3. If new model improves evidence score calibration, promote to production
4. No re-indexing required (reranker scores are computed at query time)

---

## Cost Projections

Assuming hackathon usage: 500 queries/day, 50 manuals ingested (approximately 25,000 chunks total).

| Component | Operation | Volume | Cost |
|---|---|---|---|
| Gemini text-embedding-004 | Ingestion: 25,000 chunks × 500 tokens avg | 12.5M tokens | Free tier |
| Gemini text-embedding-004 | Query: 500 queries/day × 100 tokens | 50K tokens/day | Free tier |
| Gemini 1.5 Flash | Query: 500 × 32K input tokens | 16M tokens/day | Free tier (1M/day limit hit) |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | Reranking: all queries | CPU only | $0 |

**Note on generation token usage:** At 500 queries/day × 32,000 input tokens, the free tier's 1M tokens/day limit is exceeded. At 31 queries per day the limit is hit. For hackathon demonstration purposes (low query volume, demo sessions), the free tier is sufficient. For sustained load, the Gemini pay-as-you-go pricing applies: $0.075 per million input tokens for Gemini 1.5 Flash (Tier 1 pricing as of model selection date). At 16M input tokens/day, this is $1.20/day — effectively zero cost even at full hackathon scale.
