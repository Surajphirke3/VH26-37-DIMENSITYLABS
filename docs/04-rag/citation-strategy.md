# Citation Strategy — MechMind

## Overview

Every answer produced by MechMind must be **fully traceable to a specific page in a specific manual for a specific machine.** Citations are not optional enhancements — they are a core safety feature. A technician performing a corrective procedure needs to know:

1. Which machine's manual the procedure comes from
2. Which section of that manual
3. Which exact pages

Without this information, the technician cannot verify the answer, cannot escalate intelligently, and cannot detect if the system gave them cross-machine information.

This document defines the citation data structure, how citations are generated, how they are validated, and how they are presented in the UI.

---

## Citation Data Structure

Each citation is a fully self-contained record that can be displayed to a technician without any additional database lookups.

```json
{
  "citation_id": "cit-001",
  "chunk_id": "3f7a2b1c-9d4e-4a8f-b2c1-7e9d0a5f3b8d",
  "manual_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "manual_name": "Haas VF-2 Service Manual v3.2",
  "machine_name": "Haas VF-2",
  "machine_model": "VF-2",
  "manufacturer": "Haas Automation",
  "page_start": 214,
  "page_end": 215,
  "section_path": "Chapter 7 > Error Codes > E101",
  "chunk_type": "error_code",
  "relevance_score": 0.87,
  "reranker_score": 0.91,
  "excerpt": "E101 indicates a cooling system pressure loss. The coolant pump has failed to maintain the minimum operating pressure of 45 PSI. This may indicate pump failure, blocked coolant filter, or a coolant leak in the circulation loop.",
  "is_safety_critical": false,
  "manual_version": "v3.2",
  "upload_date": "2024-01-15"
}
```

### Field Definitions

| Field | Type | Description |
|---|---|---|
| `citation_id` | string | Sequential ID assigned for this query (cit-001, cit-002, etc.). Reused in the LLM prompt and in the final response for cross-referencing. |
| `chunk_id` | UUID | FK to the chunk record in the database. Used for citation validation. |
| `manual_id` | UUID | FK to the manual record. |
| `manual_name` | string | Human-readable display name including version. |
| `machine_name` | string | Human-readable machine name. |
| `machine_model` | string | Model identifier. |
| `manufacturer` | string | Manufacturer name. |
| `page_start` | integer | First page of this chunk in the manual. |
| `page_end` | integer | Last page of this chunk (may equal page_start for single-page chunks). |
| `section_path` | string | Full breadcrumb location in the manual. |
| `chunk_type` | string | Type of content (error_code, section, table, warning, overlap). |
| `relevance_score` | float | Vector cosine similarity score from retrieval. |
| `reranker_score` | float | Cross-encoder reranker score. Primary quality signal. |
| `excerpt` | string | First 400 characters of the chunk text, for display in the citation panel. |
| `is_safety_critical` | boolean | True if this chunk contains a WARNING or CAUTION block. |
| `manual_version` | string | Version of the manual as recorded at ingestion. |
| `upload_date` | date | When this manual was ingested. |

---

## How Citations Are Generated

Citation generation is a multi-step process that begins during context assembly (Stage 15) and completes after the LLM responds (Stage 17).

### Step 1: Pre-Assign Citation IDs During Context Assembly

Before the LLM call, every chunk in the context window is assigned a sequential citation_id. This assignment is deterministic: chunks are ordered by reranker score (highest first), and citation IDs are assigned in that order.

```python
def build_citation_map(reranked_chunks: List[Chunk]) -> Dict[str, Citation]:
    """
    Returns a dict mapping citation_id → Citation object.
    Used both to build the context prompt and to validate post-LLM responses.
    """
    citation_map = {}

    for i, chunk in enumerate(reranked_chunks, start=1):
        cit_id = f"cit-{i:03d}"   # cit-001, cit-002, ...

        citation = {
            "citation_id": cit_id,
            "chunk_id": str(chunk.chunk_id),
            "manual_id": str(chunk.manual_id),
            "manual_name": chunk.manual.display_name,
            "machine_name": chunk.machine.name,
            "machine_model": chunk.machine.model,
            "manufacturer": chunk.machine.manufacturer,
            "page_start": chunk.page_start,
            "page_end": chunk.page_end,
            "section_path": chunk.section_path,
            "chunk_type": chunk.chunk_type,
            "relevance_score": chunk.cosine_similarity,
            "reranker_score": chunk.reranker_score,
            "excerpt": chunk.text[:400],
            "is_safety_critical": chunk.is_safety_critical,
            "manual_version": chunk.manual.version,
            "upload_date": chunk.manual.upload_date.isoformat()
        }

        citation_map[cit_id] = citation

    return citation_map
```

### Step 2: Include Citation IDs in the Prompt

The context window provided to the LLM includes citation IDs embedded alongside each chunk's text. The LLM is explicitly instructed to use these IDs when citing sources in its answer.

**Context block format in the prompt:**

```
--- Context Sources ---

[cit-001] Source: Haas VF-2 Service Manual v3.2 | Chapter 7 > Error Codes > E101 | Pages 214–215
E101 indicates a cooling system pressure loss. The coolant pump has failed to maintain the minimum
operating pressure of 45 PSI. This may indicate pump failure, blocked coolant filter, or a coolant
leak in the circulation loop.
Corrective steps: 1. Check coolant level. 2. Inspect pump for signs of failure. 3. Replace pump if
electrical test shows open circuit.

[cit-002] Source: Haas VF-2 Service Manual v3.2 | Chapter 7 > Error Codes > E101 > WARNING | Page 215
WARNING: Before inspecting the coolant pump, ensure the machine is in EMERGENCY STOP state and
power is locked out per LOTO procedure HAAS-LOTO-07. Failure to lock out power may result in
serious injury.

[cit-003] Source: Haas VF-2 Service Manual v3.2 | Chapter 4 > Maintenance > Coolant System | Pages 98–100
The coolant circulation system requires a minimum pump pressure of 45 PSI. Pressure testing
procedure: connect the diagnostic pressure gauge to port C4. Normal operating range: 45–75 PSI.
```

### Step 3: LLM Generates Response with Citation References

The LLM references citation IDs in the `citation_ids` array of each corrective step. The structured output schema enforces this:

```json
{
  "corrective_steps": [
    {
      "step_number": 1,
      "action": "Put the machine in EMERGENCY STOP and apply lockout-tagout procedure HAAS-LOTO-07 before beginning any inspection.",
      "warning": "Failure to lock out power may result in serious injury.",
      "citation_ids": ["cit-002"]
    },
    {
      "step_number": 2,
      "action": "Check coolant level in the reservoir. The level should be between the MIN and MAX markers on the sight glass.",
      "warning": null,
      "citation_ids": ["cit-001"]
    },
    {
      "step_number": 3,
      "action": "Connect the diagnostic pressure gauge to port C4 and verify pump pressure. Normal range is 45–75 PSI.",
      "warning": null,
      "citation_ids": ["cit-001", "cit-003"]
    }
  ]
}
```

### Step 4: Post-LLM Citation Mapping

After the LLM responds, the system maps the `citation_ids` referenced in the response back to the full citation objects using the pre-built `citation_map`:

```python
def resolve_citations(
    llm_response: LLMResponse,
    citation_map: Dict[str, Citation]
) -> List[Citation]:
    """
    Collect all citation_ids referenced in the LLM response
    and resolve them to full citation objects.
    """
    referenced_ids = set()

    for step in llm_response.corrective_steps:
        referenced_ids.update(step.citation_ids)

    resolved = []
    for cit_id in sorted(referenced_ids):
        if cit_id in citation_map:
            resolved.append(citation_map[cit_id])
        # Phantom citation IDs (not in map) are silently dropped here;
        # they were already removed in Layer 4 citation validation.

    return resolved
```

### Step 5: Include All Context Citations in Response

Even if the LLM did not explicitly reference all context chunks in its answer, all context chunks are returned in the response's `citations` array, ordered by reranker score. This gives the technician full visibility into what sources were consulted, not just what was cited in the answer text.

Unreferenced context chunks (those not cited by the LLM) are marked `"cited_in_answer": false` in the response. Referenced chunks are marked `"cited_in_answer": true`.

---

## Citation Validation

Citation validation is performed as Layer 4 of the hallucination control system. See [hallucination-control.md](./hallucination-control.md) for the full algorithm. In summary:

### Phantom Citation Detection

A phantom citation is a `citation_id` in the LLM's response that does not exist in the `citation_map` built from the context window.

```python
def detect_phantoms(
    cited_ids: Set[str],
    citation_map: Dict[str, Citation]
) -> Set[str]:
    return cited_ids - set(citation_map.keys())
```

**Phantom citation scenarios:**
1. LLM generates a citation_id that was never assigned (e.g., "cit-015" when context only had cit-001 through cit-006)
2. LLM references a chunk_id directly rather than using the pre-assigned citation_id
3. LLM generates a plausible-looking ID that happens to not match any in the context

All phantom citations are removed from the response before delivery. If phantom citations constitute more than 50% of all citations in the response, the confidence level is downgraded and a disclaimer is added.

### Citation Completeness Check

After phantom removal, the system checks whether every corrective step has at least one valid citation:

```python
uncited_steps = [
    step for step in llm_response.corrective_steps
    if not step.citation_ids   # empty after phantom removal
]
```

Steps with no valid citations after phantom removal are flagged. If more than 30% of steps are uncited, the confidence level is downgraded to `LOW`.

---

## UI Citation Behavior

### Inline Citation Display

In the answer text displayed to the technician, citation references appear as clickable superscript numerals:

```
Step 1: Put the machine in EMERGENCY STOP and apply lockout-tagout procedure HAAS-LOTO-07 
before beginning any inspection. [1]

Step 2: Check coolant level in the reservoir. The level should be between the MIN and MAX 
markers on the sight glass. [2]

Step 3: Connect the diagnostic pressure gauge to port C4 and verify pump pressure. 
Normal range is 45–75 PSI. [2][3]
```

Each `[n]` is a clickable superscript. Clicking it:
- Scrolls to the citation's entry in the citation panel below the answer
- Highlights the specific citation card

### Citation Panel

Below the answer, a citation panel lists all source chunks consulted, ordered by reranker score (highest = most relevant first).

**Citation card format:**

```
[1] Haas VF-2 Service Manual v3.2
    Chapter 7 > Error Codes > E101
    Pages 214–215
    Relevance: 91%
    
    "E101 indicates a cooling system pressure loss. The coolant pump has failed to
    maintain the minimum operating pressure of 45 PSI..."
    
    [View in Manual ↗]   [Copy Reference]
```

**"View in Manual" button behavior:**
- If PDF viewer is implemented: opens the PDF viewer at the specified page
- If PDF viewer is not implemented: provides a reference string the technician can use to locate the page manually: "Haas VF-2 Service Manual v3.2, Page 214"

**Safety critical badge:**
Citations from chunks with `is_safety_critical = true` display a WARNING badge in the citation card to ensure technicians notice safety-critical information even if they skip reading the answer step warnings.

### Citation Sorting in Panel

The citation panel sorts citations in two modes:
1. **By relevance** (default): highest reranker_score first
2. **By answer order**: citations in the order they are first referenced in the answer steps

The technician can toggle between these views.

### Citation Panel Metadata Shown

For each citation, the following metadata is displayed:
- Manual name and version
- Machine name (important for cross-referencing)
- Section path (breadcrumb)
- Page range
- Relevance score (rounded to nearest %)
- Excerpt (first 400 characters)
- Chunk type (displayed as a label: "Error Code Entry", "Maintenance Section", "Warning Block", etc.)
- Whether this citation was explicitly referenced in the answer or just retrieved as supporting context

---

## Citation Reference Strings

For external use (e.g., pasting into a maintenance log or work order), every citation generates a standardized reference string:

```
MechMind Citation Reference:
Machine: Haas VF-2 (Model VF-2, Haas Automation)
Manual: Haas VF-2 Service Manual v3.2
Location: Chapter 7 > Error Codes > E101, Pages 214–215
Relevance Score: 91%
Generated: 2024-03-15 14:32:07 UTC
Query ID: q-7f3a2b1c-...
```

This reference string is generated per citation and is available via a "Copy Reference" button in the citation panel. It provides enough information for an auditor or supervisor to locate the original source independently.

---

## Audit and Traceability

Every query response is stored in the `query_log` table with the full citation set:

```
query_log
├── query_id             UUID PRIMARY KEY
├── session_id           UUID
├── query_text           TEXT
├── machine_id           UUID (resolved context)
├── answer_type          TEXT
├── evidence_score       FLOAT
├── confidence_score     FLOAT
├── confidence_level     TEXT
├── retrieved_chunk_ids  UUID[]     (all chunks retrieved)
├── context_chunk_ids    UUID[]     (chunks passed to LLM)
├── cited_chunk_ids      UUID[]     (chunks cited in response)
├── phantom_citation_ids TEXT[]     (invalid citations generated by LLM)
├── citation_validity_rate FLOAT
├── llm_response_raw     JSONB      (unmodified LLM JSON output)
├── final_response       JSONB      (validated, cleaned response)
└── created_at           TIMESTAMP
```

This log enables:
- Post-hoc review of every answer given
- Identification of manuals with poor retrieval quality
- Detection of systematic hallucination patterns
- Compliance audits for safety-critical maintenance decisions
