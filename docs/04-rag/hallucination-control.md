# Hallucination Control Architecture — MechMind

## Design Philosophy

MechMind's hallucination control is **architectural, not conversational.**

A common but weak approach to hallucination control is instructing the LLM to "only answer from the provided context" or "say I don't know if you're uncertain." This does not work reliably because:

1. LLMs are trained to produce fluent, helpful-sounding answers even when evidence is absent
2. A language model instructed to say "I don't know" will still frequently confabulate plausible-sounding details
3. "I don't know" is itself a hallucination control problem — the model may not know that it doesn't know

MechMind's approach is to treat hallucination control as an **engineering problem with measurable checkpoints**, not as a prompting problem with hoped-for compliance. Six of the seven layers described below operate entirely outside the LLM. The LLM is given correct information, constrained output formats, and citation obligations — not good intentions.

**The central principle:** if the retrieval system cannot find evidence, the LLM is never called. If the evidence is cross-machine contaminated, it is cleaned before the LLM sees it. If the LLM generates phantom citations, they are removed before the response is delivered.

---

## Layer 1: Evidence Sufficiency Gate (Pre-LLM)

**Purpose:** Prevent the LLM from being called when there is no relevant evidence to ground its answer.

**Position in pipeline:** Immediately after cross-encoder reranking (Stage 14), before context assembly (Stage 15) and before any LLM call.

### Calculation

```python
def compute_evidence_score(
    reranked_chunks: List[Chunk]
) -> float:
    """
    Weighted average of the top-3 cross-encoder reranker scores.
    Weights heavily favor the top result; if the top result is
    irrelevant, the answer will be irrelevant regardless of lower results.
    """
    if len(reranked_chunks) == 0:
        return 0.0

    scores = [c.reranker_score for c in reranked_chunks[:3]]

    # Pad with zeros if fewer than 3 chunks available
    while len(scores) < 3:
        scores.append(0.0)

    # Weighted average: top chunk carries 50% of the weight
    evidence_score = (scores[0] * 0.50) + (scores[1] * 0.30) + (scores[2] * 0.20)
    return evidence_score
```

### Decision

```
if evidence_score >= 0.45:
    proceed to context assembly → LLM call

if evidence_score < 0.45:
    skip LLM entirely
    return structured refusal response (see Layer 7)
```

### Threshold Rationale

The threshold of **0.45** was selected based on the cross-encoder model's score distribution on the evaluation dataset:
- Cross-encoder scores above 0.45 correspond to chunks that are topically relevant to the query
- Cross-encoder scores below 0.45 correspond to chunks retrieved by surface-level overlap (e.g., both contain the word "motor") but not genuinely relevant to the specific question
- Setting the threshold at 0.45 (rather than 0.5) provides a small tolerance for borderline cases where the chunk is partially relevant

The threshold should be re-evaluated and calibrated when the cross-encoder model is changed or when the evaluation dataset is expanded.

### Why This Is the Primary Mechanism

The evidence gate is the most reliable hallucination prevention mechanism because it is:
- **Deterministic** — a threshold comparison, not subject to model variation
- **Pre-LLM** — the LLM never sees low-quality evidence
- **Auditable** — every response records `evidence_score` so the gate decision can be reviewed
- **Fast** — adds negligible latency (one arithmetic operation)

---

## Layer 2: Machine Consistency Check (Pre-LLM)

**Purpose:** Ensure the context window contains only chunks from the correct machine. Prevents cross-machine contamination, where chunks about Machine Y's cooling fault are mixed with chunks about Machine X's motor fault.

**Position in pipeline:** Between evidence gate and context assembly.

### Consistency Check Logic

```python
def machine_consistency_check(
    reranked_chunks: List[Chunk],
    expected_machine_id: Optional[UUID]
) -> Tuple[List[Chunk], float]:
    """
    Returns (clean_chunks, machine_consistency_score).

    machine_consistency_score:
      1.0 = all chunks from the correct machine
      0.0 = no chunks from the correct machine
    """
    if expected_machine_id is None:
        # No machine context — skip check, return all chunks
        return reranked_chunks, 1.0

    correct_chunks = [c for c in reranked_chunks if c.machine_id == expected_machine_id]
    wrong_chunks = [c for c in reranked_chunks if c.machine_id != expected_machine_id]

    if wrong_chunks:
        # Log contamination event for observability
        log_contamination_event(wrong_chunks, expected_machine_id)

    total = len(reranked_chunks)
    correct_count = len(correct_chunks)
    machine_consistency_score = correct_count / total if total > 0 else 0.0

    return correct_chunks, machine_consistency_score
```

### Consequence of Contamination Detection

1. Wrong-machine chunks are removed from the candidate list
2. `machine_consistency_score` is computed and stored in the query record
3. If `machine_consistency_score < 0.5`: the evidence score is recalculated on the remaining (clean) chunks
4. If the recalculated evidence score is below threshold after removing wrong-machine chunks: return structured refusal
5. Otherwise: proceed with only the clean chunks

**Why hard removal, not score penalty:**
A score penalty would still allow wrong-machine chunks to appear in the context window if they scored highly enough. Because wrong-machine information is actively harmful (not just irrelevant), hard removal is the only safe approach.

---

## Layer 3: Structured Output Enforcement (In-LLM)

**Purpose:** Prevent the LLM from generating free-form text that cannot be validated or attributed. Enforce a schema that requires explicit citation of every factual claim.

**Implementation:** Gemini's `response_schema` parameter is used at the API level. This is not a prompt instruction — it is an API contract. If the model's output does not conform to the schema, the Gemini API returns an error rather than a non-conforming response.

### Output Schema (JSON Schema)

```json
{
  "type": "object",
  "properties": {
    "answer_type": {
      "type": "string",
      "enum": ["solution", "disambiguation_required", "insufficient_information", "clarification_needed"]
    },
    "summary": {"type": "string"},
    "error_meaning": {"type": "string"},
    "probable_causes": {
      "type": "array",
      "items": {"type": "string"}
    },
    "corrective_steps": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "step_number": {"type": "integer"},
          "action": {"type": "string"},
          "warning": {"type": ["string", "null"]},
          "citation_ids": {
            "type": "array",
            "items": {"type": "string"}
          }
        },
        "required": ["step_number", "action", "warning", "citation_ids"]
      }
    },
    "citations": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {"type": "string"},
          "chunk_id": {"type": "string"}
        },
        "required": ["id", "chunk_id"]
      }
    },
    "confidence_level": {
      "type": "string",
      "enum": ["HIGH", "MEDIUM", "LOW"]
    },
    "notes": {"type": ["string", "null"]},
    "follow_up_suggestions": {
      "type": "array",
      "items": {"type": "string"}
    }
  },
  "required": [
    "answer_type", "summary", "corrective_steps", "citations", "confidence_level"
  ]
}
```

### Why Schema Enforcement Matters

- The `corrective_steps[].citation_ids` field obligates the LLM to cite a specific source for every step. A step with an empty `citation_ids` array is flagged in the post-LLM validation.
- The `answer_type` field forces the LLM to explicitly classify its response. If the LLM cannot answer, it must set `answer_type = "insufficient_information"` — it cannot hedge with ambiguous language.
- The `confidence_level` field inside the LLM response is used as an additional signal but is overridden by the system-computed confidence score (see Layer 6).

---

## Layer 4: Citation Validation (Post-LLM)

**Purpose:** Verify that every citation the LLM claims to have used actually exists in the context window provided to it. Detect phantom citations — references the LLM invented or hallucinated.

**Position:** Immediately after the LLM returns a response, before the response is delivered to the frontend.

### Validation Algorithm

```python
def validate_citations(
    llm_response: LLMResponse,
    context_citation_map: Dict[str, Chunk]  # citation_id -> chunk
) -> Tuple[LLMResponse, CitationValidationResult]:
    """
    context_citation_map contains only the citation IDs that were
    actually provided to the LLM in the context window.
    """

    phantom_citation_ids = []
    valid_citation_count = 0
    total_citation_count = 0

    for step in llm_response.corrective_steps:
        for cit_id in step.citation_ids:
            total_citation_count += 1
            if cit_id not in context_citation_map:
                # This citation ID was not in the context provided to the LLM
                phantom_citation_ids.append(cit_id)
                step.citation_ids.remove(cit_id)   # remove phantom from response
            else:
                valid_citation_count += 1

    citation_validity_rate = (
        valid_citation_count / total_citation_count
        if total_citation_count > 0 else 1.0
    )

    validation_result = CitationValidationResult(
        phantom_citation_ids=phantom_citation_ids,
        citation_validity_rate=citation_validity_rate,
        has_phantoms=len(phantom_citation_ids) > 0
    )

    # Downgrade if >50% of citations are phantom
    if citation_validity_rate < 0.5:
        llm_response.notes = (
            (llm_response.notes or "") +
            " [Warning: Some source references could not be verified. "
            "Please cross-reference with the original manual before proceeding.]"
        )

    return llm_response, validation_result
```

### What Triggers a Phantom Citation

Phantom citations occur when the LLM:
- Hallucinates a citation_id that was never assigned in the context
- Mistakenly references a citation_id from a different query's context (cross-contamination in the prompt)
- Generates a plausible-looking but non-existent citation_id (a form of confident confabulation)

All three cases indicate the LLM is not faithfully grounding its answer in the provided context. The phantom detection mechanism catches all three without relying on the LLM to self-correct.

---

## Layer 5: Claim Coverage Check (Post-LLM)

**Purpose:** Identify facts or claims in the LLM's answer that cannot be traced back to any retrieved chunk. These "unmapped claims" are the most direct evidence of hallucination.

**Position:** After citation validation, before confidence score computation.

### Claim Extraction

The LLM's `corrective_steps` array is structured as discrete, numbered actions. Each action string is treated as a claim unit.

### Mapping Claims to Chunks

For each claim (step action string), a simple semantic similarity check is run against the chunk texts in the context window:

```python
def check_claim_coverage(
    claims: List[str],           # LLM's corrective step action strings
    context_chunks: List[Chunk]  # chunks provided to LLM
) -> float:
    """
    Returns unmapped_claim_ratio: fraction of claims that cannot be
    matched to any chunk with similarity above threshold.
    """
    SIMILARITY_THRESHOLD = 0.5
    unmapped_count = 0

    for claim in claims:
        claim_embedding = embed_text(claim, task_type="RETRIEVAL_QUERY")
        matched = False

        for chunk in context_chunks:
            similarity = cosine_similarity(claim_embedding, chunk.embedding)
            if similarity >= SIMILARITY_THRESHOLD:
                matched = True
                break

        if not matched:
            unmapped_count += 1

    return unmapped_count / len(claims) if claims else 0.0
```

**Note:** This is a lightweight similarity check using the already-computed chunk embeddings. The claim embedding is computed in real-time but is fast (single small text → Gemini API call). A local embedding model (sentence-transformers) can be used here to avoid API latency for this secondary check.

### Interpretation

| `unmapped_claim_ratio` | Interpretation |
|---|---|
| 0.0 – 0.15 | All claims traceable; answer well-grounded |
| 0.15 – 0.35 | Some claims loosely supported; normal for inferential steps |
| 0.35 – 0.60 | Significant unmapped claims; answer may include hallucinated details |
| > 0.60 | High unmapped claim ratio; strong hallucination signal |

When `unmapped_claim_ratio > 0.35`, a note is added to the response: "Some steps in this answer are derived from general maintenance principles and may not be directly stated in the indexed manual. Please verify with the original documentation."

---

## Layer 6: Confidence Score Calculation

**Purpose:** Produce a single, calibrated confidence score that summarizes all hallucination control signals.

### Formula

```python
def compute_confidence_score(
    evidence_score: float,              # [0, 1] from Layer 1
    citation_validity_rate: float,      # [0, 1] from Layer 4
    machine_consistency_score: float,   # [0, 1] from Layer 2
    unmapped_claim_ratio: float         # [0, 1] from Layer 5
) -> Tuple[float, str]:

    confidence = (
        evidence_score           * 0.40 +
        citation_validity_rate   * 0.30 +
        machine_consistency_score * 0.20 +
        (1 - unmapped_claim_ratio) * 0.10
    )

    if confidence > 0.75:
        level = "HIGH"
    elif confidence >= 0.50:
        level = "MEDIUM"
    elif confidence >= 0.30:
        level = "LOW"
    else:
        level = "REFUSE"    # Should be caught earlier, but defensive

    return confidence, level
```

### Weight Rationale

| Component | Weight | Rationale |
|---|---|---|
| `evidence_score` | 0.40 | Most important: if retrieval is bad, nothing else matters |
| `citation_validity_rate` | 0.30 | Direct measure of grounding; phantom citations are serious |
| `machine_consistency_score` | 0.20 | Cross-machine contamination is a distinct failure mode |
| `(1 - unmapped_claim_ratio)` | 0.10 | Softer signal; some inference is acceptable |

### Confidence Levels and UI Behavior

| Level | Score Range | UI Presentation |
|---|---|---|
| `HIGH` | > 0.75 | Answer displayed normally; green confidence indicator |
| `MEDIUM` | 0.50 – 0.75 | Answer displayed with amber indicator; "Verify before proceeding" note |
| `LOW` | 0.30 – 0.50 | Answer displayed with red indicator; explicit disclaimer added |
| `REFUSE` | < 0.30 | No LLM answer displayed; structured refusal returned |

---

## Layer 7: Refusal Logic

**Purpose:** Define exact conditions under which MechMind refuses to answer rather than risk providing a harmful or incorrect response.

### Refusal Conditions

The system refuses (skips LLM, returns structured refusal) under any of the following conditions:

| Condition | Trigger | Source |
|---|---|---|
| No relevant chunks found | `evidence_score < 0.45` | Layer 1 |
| Context cross-machine contaminated | `machine_consistency_score < 0.5` after cleaning, AND recalculated `evidence_score < 0.45` | Layer 2 |
| All top chunks from wrong machine | Machine filter removes all candidates | Stage 13 |
| LLM call fails after retries | 2 consecutive Gemini API failures | Stage 16 |
| Computed confidence | `confidence_score < 0.30` (post-LLM checks) | Layer 6 |

### Refusal Response Schema

A refusal is NOT a generic "I don't know" response. It is a structured, informative response that tells the technician:
- What machine's manuals were searched
- What query/code was searched for
- What to do next

```json
{
  "type": "refusal",
  "answer_type": "insufficient_information",
  "refusal_reason": "evidence_below_threshold",
  "refusal_code": "EVIDENCE_SCORE_0.38",
  "message": "The indexed manuals for Haas VF-2 do not contain information about error code E101. The closest retrieved content had a relevance score of 0.38, which is below the threshold required to provide a reliable answer.",
  "searched_machine": "Haas VF-2",
  "searched_manuals": [
    "Haas VF-2 Service Manual v3.2",
    "Haas VF-2 Operator Manual v2.0"
  ],
  "searched_query": "E101",
  "suggestions": [
    "Verify the error code displayed on the machine control panel",
    "Consult the official Haas VF-2 Service Manual directly",
    "Contact Haas Automation technical support",
    "Ask your system administrator to upload the relevant manual section"
  ],
  "confidence_level": "REFUSE",
  "evidence_score": 0.38
}
```

### Refusal Message Templates by Reason

**`evidence_below_threshold`:**
> "The indexed manuals for [Machine Name] do not contain sufficient information about [query/error code]. Please consult the official manual or contact the manufacturer."

**`cross_machine_contamination`:**
> "The query returned information from multiple machines. After filtering to [Machine Name] only, insufficient evidence remained to provide a reliable answer. Please verify the error code on your machine's control panel."

**`wrong_machine_all_chunks`:**
> "The indexed manuals for [Machine Name] were searched but no relevant information for [error code] was found in those manuals. The code may belong to a different machine model."

**`llm_failure`:**
> "A technical error occurred while generating the answer. The retrieved information was: [list of retrieved section paths]. Please retry or consult the manual directly."

**`low_confidence`:**
> "This query could be partially answered, but the confidence in the answer is too low to present safely. Evidence score: [score]. Please consult the official [Machine Name] manual for [error code]."

### What Refusals Must NOT Say

- "I don't know." (too vague, does not help the technician)
- "I cannot answer that." (same problem)
- "As an AI, I may make mistakes." (deflection, not actionable)
- Any invented procedure, even prefixed with "typically" or "in general" (this IS hallucination, even with hedging language)

---

## Hallucination Control Summary

| Layer | Type | When | What It Catches |
|---|---|---|---|
| 1: Evidence Gate | Pre-LLM | After reranking | Low-quality retrieval; prevents grounding-free LLM calls |
| 2: Machine Consistency | Pre-LLM | After evidence gate | Cross-machine contaminated context |
| 3: Structured Output | In-LLM | LLM call | Free-form answer generation; forces citation obligation |
| 4: Citation Validation | Post-LLM | After LLM response | Phantom citations; citation IDs not in context |
| 5: Claim Coverage | Post-LLM | After citation validation | Unmapped factual claims; likely hallucinated details |
| 6: Confidence Score | Post-LLM | After all checks | Composite quality signal; drives UI presentation |
| 7: Refusal Logic | All stages | Multiple triggers | Structured, informative refusal when confidence is unacceptable |
