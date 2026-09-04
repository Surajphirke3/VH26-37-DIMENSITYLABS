# MechMind RAG Evaluation Framework

**Version:** 1.0  
**Last Updated:** 2026-09-04  
**Purpose:** Define how to measure whether the RAG pipeline is working correctly, track quality over time, and gate releases on quality thresholds.

---

## Overview

A RAG system can fail in ways that are invisible to conventional software testing. The application may return HTTP 200 with a well-formed JSON response, yet the answer may be:

- Faithful to the retrieved context but from the **wrong machine's manual**
- Relevant to the question but **not supported by any retrieved chunk** (hallucination)
- Citing chunks that **don't exist** in the retrieved set (phantom citations)
- Refusing to answer when evidence exists (false refusal)
- Answering when it should have refused (hallucination disguised as confidence)

The MechMind RAG evaluation framework uses the RAGAS library for standardized metric computation, augmented with custom metrics for the domain-specific concerns of machine scope accuracy and citation validity.

---

## Metric Definitions

### 1. Context Precision

**What it measures:** Of all chunks retrieved by the retrieval system, what percentage are actually relevant to answering the question?

**Why it matters:** Low precision means irrelevant chunks are being retrieved, potentially confusing the LLM and diluting the relevant information. It also indicates wasted tokens in the LLM context window.

**Formula:**
```
Context Precision = (number of retrieved chunks rated as relevant) / (total number of retrieved chunks)
```

Relevance is determined by the RAGAS evaluation LLM or by human annotation in the golden dataset.

**Target:** > 80%

**Measurement:**
- Input: question, list of retrieved chunks, ground truth answer
- Output: precision score per question (0.0 to 1.0)
- Tool: `ragas.metrics.context_precision`

**Interpretation:**
- 90–100%: Retrieval is precise; good chunk quality and query-to-chunk matching
- 80–90%: Acceptable; some irrelevant chunks included but not dominating
- 70–80%: Warning — too many irrelevant chunks; review embedding model or retrieval parameters
- Below 70%: Failure — retrieval system is not working for this question type

---

### 2. Context Recall

**What it measures:** Of all the relevant chunks that exist in the indexed manuals, what percentage did the retrieval system successfully retrieve?

**Why it matters:** Low recall means the system is missing important troubleshooting steps. A technician may receive an incomplete procedure, skip a critical safety step, or miss the root cause entirely.

**Formula:**
```
Context Recall = (number of relevant chunks retrieved) / (total number of relevant chunks in the corpus)
```

Relevant chunks in corpus are defined by the golden dataset annotations (which chunks from which pages contain the ground truth answer).

**Target:** > 70%

**Measurement:**
- Input: question, list of retrieved chunks, ground truth contexts (annotated)
- Output: recall score per question (0.0 to 1.0)
- Tool: `ragas.metrics.context_recall`

**Note on Measurement Cost:** True recall requires knowing which chunks are relevant across the entire corpus. In practice, the golden dataset pre-annotates the expected relevant chunks, so recall is measured against that annotation set.

---

### 3. Faithfulness

**What it measures:** Are all factual claims made in the LLM-generated answer actually supported by the retrieved context? An answer is unfaithful if it makes claims that cannot be traced to any retrieved chunk.

**Why it matters:** This is the hallucination detector. In a factory setting, an unfaithful answer could tell a technician to perform a procedure that is not in any manual — potentially causing equipment damage or injury.

**Formula:**
```
Faithfulness = (number of claims in answer supported by context) / (total number of claims in answer)
```

The RAGAS evaluation LLM breaks the answer into individual factual claims and checks each against the retrieved context.

**Target:** > 90%

**Measurement:**
- Input: question, LLM-generated answer, retrieved contexts
- Output: faithfulness score per question (0.0 to 1.0)
- Tool: `ragas.metrics.faithfulness`

**Threshold Policy:** Any individual question-answer pair scoring below 0.7 is flagged as a high-risk response regardless of the aggregate score. These are reviewed manually.

---

### 4. Answer Relevance

**What it measures:** Does the generated answer actually address the question that was asked? An answer can be faithful (supported by context) but still fail to address the question.

**Why it matters:** The system might retrieve correct context and generate a faithful answer, but about the wrong aspect of the question. A technician asking "how do I fix E101?" does not want a definition of E101 — they want corrective steps.

**Formula:**
```
Answer Relevance = average cosine similarity between the question and
                   N questions that would be generated from the answer
```

The RAGAS approach generates hypothetical questions from the answer and measures how similar they are to the original question.

**Target:** > 85%

**Measurement:**
- Input: question, LLM-generated answer
- Output: relevance score per question (0.0 to 1.0)
- Tool: `ragas.metrics.answer_relevancy`

---

### 5. Citation Accuracy

**What it measures:** Do all citations in the generated answer map to chunks that were actually retrieved for that query? A citation is accurate if and only if its `chunk_id` appears in the retrieved chunk set for that request.

**Why it matters:** This is a hard correctness check, not a probabilistic metric. A phantom citation — a reference to a page or section that was not retrieved — indicates the model fabricated a source reference. Fabricated citations in a technical troubleshooting system cannot be tolerated; a technician turning to a cited page that says something different from the answer destroys trust.

**Formula:**
```
Citation Accuracy = (citations that map to retrieved chunks) / (total citations in answer)
```

**Target:** 100% — this is a binary pass/fail metric at the system level.

**Measurement:**
- Input: list of chunk_ids cited in answer, list of chunk_ids that were retrieved
- Output: 1.0 if all citations are valid; < 1.0 if any phantom citations exist
- Tool: Custom `CitationAccuracyEvaluator` (not covered by standard RAGAS)

**Implementation:**

```python
class CitationAccuracyEvaluator:
    def evaluate(
        self,
        cited_chunk_ids: list[str],
        retrieved_chunk_ids: list[str]
    ) -> dict:
        retrieved_set = set(retrieved_chunk_ids)
        phantom = [cid for cid in cited_chunk_ids if cid not in retrieved_set]
        score = 1.0 if not phantom else len(cited_chunk_ids - len(phantom)) / len(cited_chunk_ids)
        return {
            "score": score,
            "phantom_citations": phantom,
            "is_passing": len(phantom) == 0
        }
```

**Threshold Policy:** Any phantom citation at all in the evaluation run blocks the release, regardless of aggregate score.

---

### 6. Disambiguation Accuracy

**What it measures:** When a query is genuinely ambiguous across multiple machines (the error code exists in more than one indexed manual and no session machine context is set), does the system correctly identify the ambiguity and return a `disambiguation_required` response instead of guessing?

**Formula:**
```
Disambiguation Accuracy =
  (ambiguous queries correctly returned as disambiguation_required) /
  (total genuinely ambiguous queries in test set)
```

**Target:** > 95%

**Measurement:**
- Input: a test set of queries known to be ambiguous (from golden dataset, AMB-category test cases)
- Output: percentage of queries correctly identified as ambiguous
- Tool: Custom `DisambiguationAccuracyEvaluator`

**Note on False Positives:** The inverse error (triggering disambiguation when not needed) is tracked separately as "Disambiguation False Positive Rate" and should be < 5%. Excessive disambiguation degrades usability.

---

### 7. Refusal Precision

**What it measures:** When the system refuses to answer (returns `refusal: true`), is the refusal justified? A justified refusal is one where the golden dataset confirms that no answer exists in the indexed manuals. An unjustified refusal (false refusal) means the system has evidence available but declines to use it.

**Formula:**
```
Refusal Precision = (justified refusals) / (total refusals)
```

**Target:** > 90%

**Measurement:**
- Input: test set of queries that triggered refusal, golden dataset annotation of whether an answer exists
- Output: precision score
- Tool: Custom `RefusalPrecisionEvaluator`

**Complement Metric — Refusal Recall:**

```
Refusal Recall = (queries correctly refused) / (total queries that should be refused)
```

Target: > 95%. The system must not answer questions for which no evidence exists.

---

### 8. Machine Scope Accuracy

**What it measures:** When the system provides an answer, does the answer come from the correct machine's manual? This is defined by the session machine context or the machine identified through disambiguation. Any answer sourced from the wrong machine is a scope violation.

**Formula:**
```
Machine Scope Accuracy =
  (answers correctly sourced from the intended machine's manual) /
  (total answers provided)
```

**Target:** 100% — This is a safety metric. No release is acceptable with Machine Scope Accuracy below 100%.

**Measurement:**
- Input: list of citations in answer, expected machine_id for the query (from session or golden dataset annotation)
- Output: 1.0 if all citations reference the correct machine; 0.0 otherwise
- Tool: Custom `MachineScopeAccuracyEvaluator`

**Implementation:**

```python
class MachineScopeAccuracyEvaluator:
    def evaluate(
        self,
        answer_citations: list[Citation],
        expected_machine_id: str
    ) -> dict:
        violations = [
            c for c in answer_citations
            if c.manual_machine_id != expected_machine_id
        ]
        score = 1.0 if not violations else 0.0
        return {
            "score": score,
            "scope_violations": violations,
            "is_passing": len(violations) == 0
        }
```

**Threshold Policy:** A single scope violation in the evaluation run is a P0 defect and blocks the release unconditionally.

---

## Metric Summary Table

| # | Metric | Target | Tool | Release Blocking |
|---|--------|--------|------|-----------------|
| 1 | Context Precision | > 80% | RAGAS | Yes (blocks if < 80%) |
| 2 | Context Recall | > 70% | RAGAS | Yes (blocks if < 70%) |
| 3 | Faithfulness | > 90% | RAGAS | Yes (blocks if < 90%) |
| 4 | Answer Relevance | > 85% | RAGAS | Warning only (< 85%) |
| 5 | Citation Accuracy | 100% | Custom | Yes (any phantom citation) |
| 6 | Disambiguation Accuracy | > 95% | Custom | Yes (blocks if < 95%) |
| 7 | Refusal Precision | > 90% | Custom | Warning (< 90%) |
| 8 | Machine Scope Accuracy | 100% | Custom | Yes (any violation) |

---

## Golden Dataset

The golden dataset is the ground truth used to evaluate all metrics. It consists of question-answer-citation triples with annotations.

### Dataset Size and Composition

Minimum 20 items, distributed as follows:

| Category | Count | Description |
|----------|-------|-------------|
| Exact error code queries — different machines | 5 | E101 (Haas), E101 (Fanuc), E202 (Haas), E202 (Fanuc), F101 (KUKA) |
| Natural language symptom queries | 5 | Symptom-based questions mapped to single machines |
| Cross-manual ambiguity cases | 5 | Queries that should trigger disambiguation (E101 no context, E202 no context, etc.) |
| Insufficient information cases | 5 | Error codes not in any manual; should trigger refusal |

### Golden Dataset Schema

Each item in the golden dataset:

```json
{
  "id": "GD-001",
  "category": "exact_error_code",
  "question": "What is error E101 on the Haas VF-2?",
  "session_context": {
    "machine_id": "manual-haas-001",
    "conversation_history": []
  },
  "ground_truth_answer": "Error E101 on the Haas VF-2 indicates a cooling system pressure loss...",
  "ground_truth_citations": [
    {
      "manual": "HaasVF2_Service_Manual.pdf",
      "page": 42,
      "section": "Error Codes — E101"
    }
  ],
  "expected_response_type": "solution",
  "expected_machine_scope": "manual-haas-001",
  "relevant_chunk_ids": ["chunk-haas-e101-001", "chunk-haas-e101-002"],
  "should_disambiguate": false,
  "should_refuse": false,
  "notes": "E101 also exists in Fanuc manual; session machine context prevents disambiguation"
}
```

### 20-Item Golden Dataset Definition

**Category 1: Exact Error Code Queries (5 items)**

| ID | Question | Machine Context | Expected Answer Summary | Expected Machine |
|----|----------|----------------|------------------------|-----------------|
| GD-001 | "What is error E101?" | Session: Haas VF-2 | Cooling system pressure loss + corrective steps | Haas VF-2 |
| GD-002 | "What is error E101?" | Session: Fanuc 0i-MF | Motor overload + corrective steps | Fanuc 0i-MF |
| GD-003 | "What does E202 mean on the Haas?" | No session (machine in query) | Spindle overload + corrective steps | Haas VF-2 |
| GD-004 | "How do I fix E202 on the Fanuc controller?" | No session (machine in query) | Communication fault + corrective steps | Fanuc 0i-MF |
| GD-005 | "What is F101?" | Session: KUKA KR6 | Base joint fault + corrective steps | KUKA KR6 |

**Category 2: Natural Language Symptom Queries (5 items)**

| ID | Question | Machine Context | Expected Answer Summary | Expected Machine |
|----|----------|----------------|------------------------|-----------------|
| GD-006 | "The spindle is making a grinding noise and the machine shut down" | Session: Haas VF-2 | Spindle overload section (E202-related) | Haas VF-2 |
| GD-007 | "The coolant isn't flowing properly and we're getting a pressure warning" | Session: Haas VF-2 | E101 cooling system section | Haas VF-2 |
| GD-008 | "Axis stopped moving during a cut" | Session: Haas VF-2 | E303 axis fault section | Haas VF-2 |
| GD-009 | "Robot arm stopped and won't move, alarm is active" | Session: KUKA KR6 | F202 arm joint overload section | KUKA KR6 |
| GD-010 | "Getting a communication fault on the controller" | Session: Fanuc 0i-MF | E202 communication fault section | Fanuc 0i-MF |

**Category 3: Cross-Manual Ambiguity Cases (5 items — expected: disambiguation)**

| ID | Question | Session Context | Expected Response Type | Notes |
|----|----------|----------------|----------------------|-------|
| GD-011 | "What is error E101?" | No session, no machine | disambiguation_required | E101 in Haas and Fanuc |
| GD-012 | "How do I fix E202?" | No session, no machine | disambiguation_required | E202 in Haas and Fanuc |
| GD-013 | "E101 is showing, what should I do?" | No session, no machine | disambiguation_required | E101 in Haas and Fanuc |
| GD-014 | "There's an error E202 and the machine stopped" | No session, no machine | disambiguation_required | E202 in Haas and Fanuc |
| GD-015 | "What causes E101 and how long does repair take?" | No session, no machine | disambiguation_required | Should not guess on timing either |

**Category 4: Insufficient Information Cases (5 items — expected: refusal)**

| ID | Question | Machine Context | Expected Response Type | Notes |
|----|----------|----------------|----------------------|-------|
| GD-016 | "What is error Z999?" | Session: Haas VF-2 | refusal | Z999 not in any manual |
| GD-017 | "How do I calibrate the tool changer on the Haas?" | Session: Haas VF-2 | refusal | Calibration procedure not in test manual |
| GD-018 | "What is error E999?" | No session | refusal | E999 not in any manual; no disambiguation needed |
| GD-019 | "How do I update the firmware on the Fanuc controller?" | Session: Fanuc 0i-MF | refusal | Firmware update not covered in test manual |
| GD-020 | "What is the warranty period for the KUKA robot?" | Session: KUKA KR6 | refusal | Warranty information not in service manual |

---

## Evaluation Tools

### RAGAS Library

```bash
pip install ragas
```

Key RAGAS metrics used:

```python
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_precision,
    context_recall,
)
from ragas import evaluate
from datasets import Dataset

# Prepare evaluation dataset
eval_data = Dataset.from_list([
    {
        "question": item["question"],
        "answer": item["generated_answer"],
        "contexts": item["retrieved_chunk_texts"],
        "ground_truth": item["ground_truth_answer"]
    }
    for item in golden_results
])

# Run evaluation
result = evaluate(
    eval_data,
    metrics=[faithfulness, answer_relevancy, context_precision, context_recall]
)
```

### Custom Evaluators

Three custom Python evaluators are maintained in `tests/rag_eval/evaluators/`:

1. `citation_accuracy_evaluator.py` — CitationAccuracyEvaluator (Section 5)
2. `disambiguation_accuracy_evaluator.py` — DisambiguationAccuracyEvaluator (Section 6)
3. `machine_scope_accuracy_evaluator.py` — MachineScopeAccuracyEvaluator (Section 8)

---

## Running Evaluations

### Full Evaluation Suite

```bash
# Run all RAG evaluation tests
pytest tests/rag_eval/ -v --json-report --json-report-file=reports/rag_eval.json

# Run with coverage report
pytest tests/rag_eval/ -v --rag-eval-output=reports/rag_metrics_$(date +%Y%m%d).csv
```

### Individual Metric Runs

```bash
# Faithfulness only
pytest tests/rag_eval/test_faithfulness.py -v

# Disambiguation accuracy
pytest tests/rag_eval/test_disambiguation_accuracy.py -v

# Machine scope accuracy (safety metric)
pytest tests/rag_eval/test_machine_scope.py -v
```

### Evaluation Against a Specific Commit

```bash
# Tag evaluation results with git commit hash
RAG_EVAL_COMMIT=$(git rev-parse --short HEAD) pytest tests/rag_eval/ -v
```

---

## Metric Tracking and Regression Detection

Evaluation results are stored as time-series data in `reports/rag_eval_history.jsonl`. Each entry:

```json
{
  "timestamp": "2026-09-04T10:00:00Z",
  "commit": "abc1234",
  "branch": "main",
  "metrics": {
    "context_precision": 0.85,
    "context_recall": 0.76,
    "faithfulness": 0.93,
    "answer_relevance": 0.88,
    "citation_accuracy": 1.0,
    "disambiguation_accuracy": 0.97,
    "refusal_precision": 0.94,
    "machine_scope_accuracy": 1.0
  },
  "golden_dataset_version": "v1.2",
  "passing": true
}
```

### Regression Detection Rule

A regression is flagged if any metric drops more than 5 percentage points from the previous passing evaluation run. Regression alerts are sent to the development Slack channel.

```
IF current_metric < (last_passing_metric - 0.05):
    ALERT: "RAG metric regression detected: {metric_name} dropped from {last} to {current}"
    BLOCK_RELEASE: True (for blocking metrics)
```

---

## Golden Dataset Maintenance

The golden dataset must be updated:

- When new manuals are indexed (add 4 new items: 1 exact code, 1 symptom, 1 ambiguity, 1 refusal)
- When chunking strategy changes (re-annotate relevant chunk IDs)
- When a known hallucination is discovered in production (add as a regression test case)
- Quarterly review of expected answers for accuracy against latest manual content

**Owner:** QA Lead  
**Current Version:** v1.0 (20 items)  
**Storage:** `tests/rag_eval/golden_dataset/golden_dataset_v1.json`

---

## Evaluation in CI/CD

```yaml
# Nightly evaluation job
rag-evaluation:
  runs-on: ubuntu-latest
  schedule: "0 2 * * *"  # 2 AM daily
  steps:
    - uses: actions/checkout@v4
    - name: Start test stack
      run: docker compose -f docker-compose.test.yml up -d
    - name: Wait for services
      run: ./scripts/wait_for_services.sh
    - name: Seed test data
      run: docker compose -f docker-compose.test.yml exec api python scripts/seed_test_data.py
    - name: Run RAG evaluation
      run: pytest tests/rag_eval/ -v --json-report
    - name: Check blocking metrics
      run: python scripts/check_rag_thresholds.py reports/rag_eval.json
    - name: Upload results
      uses: actions/upload-artifact@v4
      with:
        name: rag-eval-results
        path: reports/rag_eval.json
```

The `check_rag_thresholds.py` script exits with code 1 (failing the CI job) if any blocking metric is below threshold or any phantom citation or machine scope violation is detected.
