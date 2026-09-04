# Evaluation Framework

> **Scope:** Defines how MechMind measures whether the RAG pipeline actually works — covering metric definitions, golden dataset requirements, automated pipeline thresholds, and the safety-critical designation for Machine Scope Accuracy.

---

## Table of Contents

1. [Why RAG Evaluation Is Different](#1-why-rag-evaluation-is-different)
2. [Metric Definitions](#2-metric-definitions)
3. [Golden Dataset Requirements](#3-golden-dataset-requirements)
4. [Automated Evaluation Pipeline](#4-automated-evaluation-pipeline)
5. [Interpreting Results](#5-interpreting-results)

---

## 1. Why RAG Evaluation Is Different

### 1.1 Two-Stage Failure Surface

Standard software testing is straightforward: provide an input, assert the expected output. RAG systems have an irreducibly two-stage failure surface that makes evaluation structurally harder:

```
Standard software:
  Input ──────────────────────────────► Output
  PASS/FAIL on output alone

RAG pipeline:
  Query ──► Retrieval ──► Context ──► Generation ──► Answer
              ▲                           ▲
        Stage 1 failure            Stage 2 failure
     (wrong chunks returned)   (bad answer from good chunks)
```

**Stage 1 failure — bad retrieval:** The correct answer exists in the corpus but the retrieval step did not surface the relevant chunks. The LLM then either hallucinates, refuses, or answers from a different machine's context. This failure is invisible in the final output unless you separately measure what was retrieved.

**Stage 2 failure — bad generation from good retrieval:** The correct chunks were retrieved and ranked first, but the LLM synthesised an answer that is unfaithful to those chunks — adding information not present in the context, mis-attributing a step to the wrong machine model, or inverting a conditional instruction. This failure requires faithfulness measurement against the actual retrieved context, not just the final answer.

Because these failure modes are independent, you need separate metrics for each stage. An evaluation framework that only scores the final answer can produce a high overall score even when retrieval is consistently broken, because the LLM's parametric knowledge may paper over retrieval gaps on easy questions.

### 1.2 Safety-Critical Context: Machine Scope Accuracy

In general-purpose QA, a wrong answer is a quality problem. In MechMind, it is a safety incident.

A factory technician who receives troubleshooting instructions for Machine Model A while working on Machine Model B may:

- Execute calibration steps with the wrong torque values, damaging a machine or injuring themselves.
- Apply a firmware update intended for a different variant, bricking a control board.
- Follow an electrical isolation procedure that does not match the actual machine layout, creating an electrocution hazard.

**Machine Scope Accuracy is therefore treated as a safety metric, not a quality metric.** It is the only metric that functions as a release blocker at the 1.0 threshold. Every other metric has a performance target that allows marginal degradation in exchange for shipping. Machine Scope Accuracy does not. A retrieval pipeline that returns a chunk from Machine B when the user has confirmed they are working on Machine A must be fixed before any release — even a demo release — because a judge interacting with a broken demo is in the same position as a real technician: they will trust what the system says.

---

## 2. Metric Definitions

All metrics are computed over the golden dataset (Section 3). Targets marked **BLOCKER** are enforced as hard CI gates. All other targets are soft thresholds that trigger alerts but do not fail the build.

---

### 2.1 Context Precision@K

**What it measures:** Of the K chunks the retrieval pipeline returned, what fraction were actually relevant to the query?

**Formula:**

```
Context Precision@K = |{chunks in top K that are relevant}| / K
```

**Operationalisation:** A chunk is "relevant" if its `chunk_id` appears in the `expected_citations` list of the golden record for that query.

**Target:** > 0.80 at K = 5

**Interpretation:** A score of 0.80 at K=5 means 4 out of 5 returned chunks are on-target. Anything below 0.70 indicates the hybrid retrieval or reranker is surfacing off-topic material and should be investigated before faithfulness scores are trusted.

---

### 2.2 Context Recall

**What it measures:** Of all the chunks in the corpus that are relevant to the query, what fraction did the retrieval pipeline actually surface (within the top MAX_RETRIEVAL_CHUNKS limit)?

**Formula:**

```
Context Recall = |{relevant chunks retrieved}| / |{total relevant chunks in corpus}|
```

**Target:** > 0.70

**Note on interaction with Precision@K:** High precision but low recall means the pipeline finds good chunks but misses others. This is usually acceptable for single-turn QA but degrades for complex multi-step procedures where every step must be present. Low recall is a warning sign for chunking strategy or BM25 term coverage problems.

---

### 2.3 Faithfulness

**What it measures:** Of all the factual claims in the generated answer, what fraction are directly supported by the retrieved context that was passed to the LLM?

**Formula:**

```
Faithfulness = |{claims in answer supported by retrieved context}| / |{total claims in answer}|
```

**Operationalisation:** Claims are extracted from the answer automatically (by prompting a separate evaluator model) and then verified against the context window that was assembled for that query. A claim is "supported" if the evaluator can identify a passage in the context that entails it.

**Target:** > 0.90

**Build gate:** Faithfulness < 0.85 fails the nightly evaluation run.

**Why this matters:** Faithfulness < 1.0 means the LLM is adding information beyond what the retrieved context contains. In a safety-critical context, unsupported claims are the definition of hallucination. The 0.90 target acknowledges that minor paraphrasing and reasonable inference from cited text are acceptable; the 0.85 gate prevents systemic hallucination from reaching production.

---

### 2.4 Answer Relevance

**What it measures:** Semantic similarity between the generated answer and the original query, independent of factual correctness. A high score means the answer is on-topic; a low score means the LLM went off on a tangent even if everything it said was technically accurate.

**Formula:**

```
Answer Relevance = cosine_similarity(embed(answer), embed(question))
```

Both the question and answer are embedded using the same `text-embedding-004` model used for document indexing. Cosine similarity is computed in the 768-dimensional embedding space.

**Target:** > 0.85 cosine similarity

---

### 2.5 Citation Accuracy

**What it measures:** Of all the citations the system included in its structured response, what fraction point to real chunks that exist in the database and that actually support the claim they are attached to?

**Formula:**

```
Citation Accuracy = |{valid citations}| / |{total citations in answer}|
```

A citation is "valid" if: (a) the `chunk_id` exists in the database, (b) the chunk belongs to the expected `machine_id`, and (c) the chunk's text is entailed by or directly quoted in the answer segment it annotates.

**Target:** 1.0 (all citations must be valid)

**Build gate:** Citation Accuracy < 0.95 fails the nightly evaluation run.

**Why 1.0 target but 0.95 gate?** The target is aspirational and set at 1.0 because the UI renders citations as clickable source references that technicians rely on. A technician who clicks a citation and finds the chunk says something different from what the answer claims has been actively misled. However, a 0.95 build gate prevents phantom citation bugs from blocking all progress — the gap between 0.95 and 1.0 is what the pre-submission checklist closes.

---

### 2.6 Disambiguation Accuracy

**What it measures:** When a query is genuinely ambiguous (the user has not specified a machine or the query could refer to multiple indexed machines), does the pipeline correctly detect this and trigger a disambiguation response rather than guessing?

**Formula:**

```
Disambiguation Accuracy = |{ambiguous queries that triggered disambiguation}| / |{total ambiguous queries in test set}|
```

**Target:** > 0.95

**Note:** The complement of this metric — triggering disambiguation on queries that are already clear — is measured by Refusal Precision (Section 2.7). Both must be high; the system should neither over-disambiguate (annoying and slow) nor under-disambiguate (dangerous).

---

### 2.7 Refusal Precision

**What it measures:** When the system refuses to answer (because evidence sufficiency is below threshold, or because the query is out of scope), was the refusal justified? A refusal is "justified" if a human annotator agrees the question cannot be reliably answered from the indexed corpus.

**Formula:**

```
Refusal Precision = |{justified refusals}| / |{total refusals issued}|
```

**Target:** > 0.90

**Interpretation:** A low Refusal Precision means the system is refusing questions that could have been answered — most likely because the Evidence Sufficiency threshold (`EVIDENCE_SCORE_THRESHOLD`) is set too conservatively, or because the BM25 term-matching component is failing to retrieve relevant chunks for unusual terminology.

---

### 2.8 Machine Scope Accuracy

**What it measures:** Of all answers the system generated in a context where a specific machine was either specified by the user or resolved through disambiguation, what fraction drew their content exclusively from that machine's indexed documents?

**Formula:**

```
Machine Scope Accuracy = |{answers sourced from the correct machine}| / |{answers generated with a machine context}|
```

A violation occurs if any citation in the answer belongs to a different `machine_id` than the active session's resolved machine. It also occurs if the LLM generated a claim that can be traced to a different machine's document even without an explicit citation.

**Target:** 1.0

**Classification:** SAFETY METRIC — RELEASE BLOCKER

**Build gate:** Machine Scope Accuracy < 1.0 fails the nightly evaluation run unconditionally. This cannot be suppressed by a flag or override.

**What a violation looks like in practice:**
- User: "I'm working on the ProMill 3000X. Error E-221 — what does it mean?"
- System retrieves a chunk from the ProMill 5000X's manual (different machine, same error code family).
- Answer cites the wrong torque value.
- Technician over-torques a spindle bearing.

This is the central safety invariant of MechMind. The machine-scoped metadata filter in the retrieval pipeline (`WHERE machine_id = $resolved_machine_id`) is the primary control. This metric verifies that control is working end-to-end.

---

### 2.9 Metric Summary Table

| Metric | Formula Summary | Target | Build Gate | Safety? |
|---|---|---|---|---|
| Context Precision@K | relevant-in-top-K / K | > 0.80 @ K=5 | Alert only | No |
| Context Recall | retrieved-relevant / total-relevant | > 0.70 | Alert only | No |
| Faithfulness | supported-claims / total-claims | > 0.90 | < 0.85 fails | No |
| Answer Relevance | cosine(embed(A), embed(Q)) | > 0.85 | Alert only | No |
| Citation Accuracy | valid-citations / total-citations | 1.0 | < 0.95 fails | No |
| Disambiguation Accuracy | correct-disambig / ambiguous-queries | > 0.95 | Alert only | No |
| Refusal Precision | justified-refusals / total-refusals | > 0.90 | Alert only | No |
| Machine Scope Accuracy | correct-machine / all-with-context | **1.0** | **< 1.0 BLOCKS** | **YES** |

---

## 3. Golden Dataset Requirements

### 3.1 Overview

The golden dataset is the fixed, human-verified set of query/answer pairs against which all automated evaluation runs are measured. It must be created before the automated pipeline runs and must not be modified to make metrics look better — that constitutes evaluation gaming.

**Minimum size:** 20 Q&A pairs

**Minimum distribution:** 5 pairs per category (4 categories)

### 3.2 Categories

| Category | Description | Example Query |
|---|---|---|
| `error_code` | Query about a specific error code displayed on the machine | "What does error E-221 mean on the ProMill 3000X?" |
| `procedure` | Query requesting a step-by-step procedure | "How do I calibrate the pressure sensor on the HydroPress 450?" |
| `ambiguous` | Query that does not specify a machine or could match multiple machines | "How do I reset the control panel?" |
| `out_of_scope` | Query the system should refuse because no relevant document exists | "What is the recommended oil brand for a competitor's machine?" |

### 3.3 Golden Record Schema

Each record in the golden dataset must contain all of the following fields:

```json
{
  "golden_id": "GLD-001",
  "category": "error_code",
  "question": "What does error E-221 mean on the ProMill 3000X?",
  "expected_machine_id": "promill-3000x",
  "expected_answer_summary": "E-221 indicates a spindle overheat condition. The operator should stop the spindle, allow 15 minutes cool-down, verify coolant flow is at least 2L/min, and restart. If the error persists after two attempts, a service call is required.",
  "expected_citations": ["chunk_abc123", "chunk_def456"],
  "expected_answer_type": "structured_answer",
  "expected_disambiguation_triggered": false,
  "expected_refusal": false,
  "annotator": "bhavesh@dialphone.com",
  "created_at": "2026-09-01"
}
```

**Field definitions:**

| Field | Type | Description |
|---|---|---|
| `golden_id` | string | Stable identifier. Never reuse after deletion. |
| `category` | enum | One of `error_code`, `procedure`, `ambiguous`, `out_of_scope` |
| `question` | string | Exact query string as the technician would type it |
| `expected_machine_id` | string or null | The machine whose documents should answer the query. `null` for `out_of_scope`. |
| `expected_answer_summary` | string | Human-written summary of what a correct answer contains. Not used verbatim — used to judge LLM answer relevance. |
| `expected_citations` | array of chunk_ids | The specific chunks that should appear in the retrieved context. Empty for `out_of_scope`. |
| `expected_answer_type` | enum | One of `structured_answer`, `disambiguation_request`, `refusal` |
| `expected_disambiguation_triggered` | boolean | Whether the pipeline should issue a disambiguation request |
| `expected_refusal` | boolean | Whether the pipeline should refuse to answer |
| `annotator` | string | Email of the human who wrote and verified the record |
| `created_at` | date | Date of creation |

### 3.4 Quality Requirements for Golden Records

- Every record must be reviewed by a second annotator before inclusion.
- `expected_citations` must be populated by looking up actual chunk IDs from the database after the seed documents are ingested — never estimated.
- For `ambiguous` category records, the `expected_disambiguation_triggered` field must be `true`.
- For `out_of_scope` records, `expected_refusal` must be `true` and `expected_citations` must be empty.
- Records must not be created after evaluation runs begin — creation date must precede the first automated run.

---

## 4. Automated Evaluation Pipeline

### 4.1 Schedule

The evaluation pipeline runs nightly at 02:00 UTC against the current `main` branch. It also runs on every pull request that modifies the retrieval, reranking, prompt, or generation components.

### 4.2 Pipeline Steps

```
1. Restore golden dataset from fixtures/golden-dataset.json
2. For each golden record:
   a. Issue query to /api/v1/troubleshoot/query (authenticated as demo user)
   b. Record: full API response, retrieved chunk IDs, answer text, citations, answer_type
   c. Compute per-record scores:
      - Context Precision@5 (compare retrieved_chunk_ids vs expected_citations)
      - Context Recall (compare retrieved_chunk_ids vs expected_citations vs corpus)
      - Faithfulness (evaluator LLM call against assembled context)
      - Answer Relevance (embed + cosine)
      - Citation Accuracy (validate each citation_id in response)
      - Disambiguation triggered? (compare answer_type vs expected_answer_type)
      - Refusal issued? (compare answer_type vs expected_answer_type)
      - Machine scope correct? (all citation machine_ids match expected_machine_id)
3. Aggregate across all records
4. Apply gate logic (Section 4.3)
5. Write report to evaluation-results/YYYY-MM-DD.json
6. Post summary to CI output
```

### 4.3 Gate Logic

The following conditions cause the evaluation run to return exit code 1, which fails the CI build:

```python
# HARD BLOCK — safety metric
if machine_scope_accuracy < 1.0:
    FAIL("Machine Scope Accuracy is {:.3f}. Target is 1.0. This is a release blocker.".format(machine_scope_accuracy))

# HARD BLOCK — hallucination control
if faithfulness < 0.85:
    FAIL("Faithfulness is {:.3f}. Build gate is 0.85.".format(faithfulness))

# HARD BLOCK — citation integrity
if citation_accuracy < 0.95:
    FAIL("Citation Accuracy is {:.3f}. Build gate is 0.95.".format(citation_accuracy))
```

The following conditions generate warnings but do not fail the build:

```python
# SOFT ALERTS — degradation monitoring
if context_precision_at_5 < 0.80:
    WARN("Context Precision@5 is {:.3f}. Target is 0.80.".format(context_precision_at_5))

if context_recall < 0.70:
    WARN("Context Recall is {:.3f}. Target is 0.70.".format(context_recall))

if answer_relevance < 0.85:
    WARN("Answer Relevance is {:.3f}. Target is 0.85.".format(answer_relevance))

if disambiguation_accuracy < 0.95:
    WARN("Disambiguation Accuracy is {:.3f}. Target is 0.95.".format(disambiguation_accuracy))

if refusal_precision < 0.90:
    WARN("Refusal Precision is {:.3f}. Target is 0.90.".format(refusal_precision))
```

### 4.4 Alert on Context Precision Degradation

Context Precision@5 is monitored for degradation relative to the rolling 7-day baseline, not just against the absolute threshold. If the current run's score is more than 0.05 below the 7-day average, an alert is raised even if the absolute value is above 0.80. This catches retrieval regressions introduced by index changes or chunking strategy changes before they compound.

### 4.5 Evaluation Report Format

```json
{
  "run_id": "eval-2026-09-04-02-00",
  "timestamp": "2026-09-04T02:00:00Z",
  "git_sha": "abc1234",
  "golden_dataset_version": "1.0.0",
  "n_records": 20,
  "metrics": {
    "context_precision_at_5": 0.84,
    "context_recall": 0.73,
    "faithfulness": 0.93,
    "answer_relevance": 0.88,
    "citation_accuracy": 0.97,
    "disambiguation_accuracy": 0.96,
    "refusal_precision": 0.92,
    "machine_scope_accuracy": 1.0
  },
  "gates": {
    "passed": true,
    "blockers": [],
    "warnings": []
  },
  "per_record": [ ... ]
}
```

---

## 5. Interpreting Results

### 5.1 Retrieval Failure Patterns

| Symptom | Likely Cause | Investigation |
|---|---|---|
| Low Context Precision@5 | Reranker is not filtering noise | Check cross-encoder model quality; review chunk boundaries |
| Low Context Recall | BM25 misses technical terms; chunking splits critical passages | Review chunking strategy; augment BM25 with synonyms |
| High Precision, Low Recall | Good chunks found but not all of them | Increase `MAX_RETRIEVAL_CHUNKS`; check for missing embeddings |

### 5.2 Generation Failure Patterns

| Symptom | Likely Cause | Investigation |
|---|---|---|
| Low Faithfulness | LLM adding parametric knowledge | Strengthen prompt constraint; reduce temperature |
| Low Answer Relevance | LLM going off-topic | Review context assembly order; check for context overflow |
| Low Citation Accuracy | Phantom chunk IDs | Citation mapping bug; chunk_id not passed correctly to prompt |

### 5.3 Safety Failure Pattern

| Symptom | Cause | Action |
|---|---|---|
| Machine Scope Accuracy < 1.0 | Machine filter not applied or bypassed | **Stop. Do not ship. Fix the machine_id filter in retrieval.** |

---

*See also: [docs/10-testing/rag-evaluation.md](../10-testing/rag-evaluation.md) for test case design, [docs/10-testing/ambiguity-test-cases.md](../10-testing/ambiguity-test-cases.md) for disambiguation test cases.*
