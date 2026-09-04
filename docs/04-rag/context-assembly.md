# Context Assembly — MechMind

## Overview

Context assembly is the stage that transforms the set of reranked, validated chunks into a single, precisely structured context window that is passed to the LLM. This stage determines what the LLM sees — and therefore what it can and cannot answer.

Context assembly must satisfy three constraints simultaneously:
1. **Token budget** — the total context must fit within Gemini Flash's limits, with space reserved for the system prompt, conversation history, and the LLM's answer
2. **Ordering** — chunks must be ordered so the most relevant information appears where the LLM is most likely to attend to it
3. **Completeness** — citation IDs, section headers, and machine context must be embedded in the context so the LLM can produce a fully cited, machine-scoped answer

---

## Token Budget

Gemini 1.5 Flash has a context window of **1,048,576 tokens** (approximately 1M tokens). In practice, MechMind uses a conservative operational limit that balances response quality and cost:

```
Total context budget:     32,000 tokens
──────────────────────────────────────────
System prompt:             2,500 tokens   (reserved)
Machine context block:       500 tokens   (reserved)
Conversation history:      2,000 tokens   (last 3 turns)
Output schema instruction:   500 tokens   (reserved)
Answer space (output):     2,000 tokens   (reserved for LLM response)
──────────────────────────────────────────
Available for chunks:     24,500 tokens
```

**Why 32,000 tokens rather than the full 1M?**
- Gemini Flash charges per input token; larger context windows increase cost per query
- Empirical testing shows diminishing returns beyond 10 chunks for error code queries — the relevant information is concentrated in the top 3–5 chunks
- A 32,000 token limit keeps latency predictable and cost bounded
- If a query requires deeper context (e.g., a multi-step procedure spread across 20 pages), the limit can be raised to 64,000 tokens with a corresponding cost and latency increase

---

## Context Assembly Rules

### Rule 1: Order Chunks by Reranker Score (Highest First)

The context window presents chunks in descending order of their cross-encoder reranker score. The most relevant chunk is first.

**Rationale:** LLMs show "primacy and recency" effects — content at the beginning and end of the context window is attended to more strongly than content in the middle. Placing the highest-relevance chunk first ensures it has maximum influence on the answer.

### Rule 2: Group Chunks by Machine (Multi-Machine Context)

In the rare case where multi-machine context is approved (natural language query, ambiguity > 0.3 but no error code), chunks are grouped by machine_id within the context window. Chunks from Machine X appear together, followed by chunks from Machine Y.

Within each machine group, chunks are ordered by reranker score.

**This prevents the LLM from interleaving information from different machines in a single answer.**

### Rule 3: Prepend Section Path as Context Header

Each chunk is preceded by a context header line that identifies its source. This header is included in the token count for the chunk.

```
[cit-001] Source: Haas VF-2 Service Manual v3.2 | Chapter 7 > Error Codes > E101 | Pages 214–215 | Type: error_code
```

The header is formatted as a single line to minimize token usage while providing all necessary citation metadata.

### Rule 4: Include Error Codes Present as Inline Hints

If a chunk's `error_codes_present` array is non-empty, the codes are noted in the header:

```
[cit-001] Source: Haas VF-2 Service Manual v3.2 | Chapter 7 > Error Codes > E101 | Pages 214–215 | Type: error_code | Codes: E101
```

This hint helps the LLM identify which chunk is the primary source for a given error code query, reducing the risk that it attributes information from a less-relevant chunk.

### Rule 5: Safety-Critical Flag in Header

Chunks with `is_safety_critical = true` receive an additional marker in their header:

```
[cit-002] Source: Haas VF-2 Service Manual v3.2 | Chapter 7 > Error Codes > E101 > WARNING | Page 215 | Type: warning | ⚠ SAFETY CRITICAL
```

The system prompt explicitly instructs the LLM: "If a chunk is marked SAFETY CRITICAL, its content MUST be included in the relevant corrective step's `warning` field."

### Rule 6: Truncate Lowest-Scoring Chunks First if Budget Exceeded

After ordering and header injection, the cumulative token count is computed. If the total exceeds 24,500 tokens (the chunk budget), chunks are dropped starting from the lowest-scoring chunk until the budget is satisfied.

```python
def fit_chunks_to_budget(
    ordered_chunks: List[ChunkWithHeader],
    token_budget: int
) -> List[ChunkWithHeader]:
    included = []
    running_total = 0

    for chunk_with_header in ordered_chunks:
        chunk_tokens = chunk_with_header.token_count + count_tokens(chunk_with_header.header)

        if running_total + chunk_tokens <= token_budget:
            included.append(chunk_with_header)
            running_total += chunk_tokens
        else:
            # This chunk would exceed budget; skip it and all subsequent (lower-scoring) chunks
            break

    return included
```

**Important:** Chunks are never truncated mid-text. If a chunk would exceed the budget, the entire chunk is excluded. This prevents the LLM from seeing a partial chunk that might mislead it (e.g., seeing a cause list but not the corrective steps).

### Rule 7: Never Exclude Safety-Critical Chunks

Safety-critical chunks (`is_safety_critical = true`) are exempt from the budget truncation rule. If including a safety-critical chunk would exceed the budget, the lowest-scoring **non-safety-critical** chunk is dropped instead to make room.

```python
def fit_chunks_to_budget_with_safety(
    ordered_chunks: List[ChunkWithHeader],
    token_budget: int
) -> List[ChunkWithHeader]:
    safety_chunks = [c for c in ordered_chunks if c.is_safety_critical]
    non_safety_chunks = [c for c in ordered_chunks if not c.is_safety_critical]

    # Always include safety chunks first, regardless of score
    included = []
    running_total = 0

    for chunk in safety_chunks:
        chunk_tokens = chunk.token_count + count_tokens(chunk.header)
        included.append(chunk)
        running_total += chunk_tokens

    # Fill remaining budget with non-safety chunks in score order
    for chunk in non_safety_chunks:
        chunk_tokens = chunk.token_count + count_tokens(chunk.header)
        if running_total + chunk_tokens <= token_budget:
            included.append(chunk)
            running_total += chunk_tokens
        else:
            break

    # Re-sort by reranker score so safety chunks appear in context order, not first
    return sorted(included, key=lambda c: c.reranker_score, reverse=True)
```

---

## Full Prompt Structure

The complete context passed to the Gemini API is assembled in this order:

### Block 1: System Prompt

```
SYSTEM PROMPT (approximately 2,500 tokens):

You are an expert industrial maintenance assistant for MechMind, a factory floor troubleshooting system.

Your role:
- Help technicians diagnose machine faults and perform corrective procedures
- Answer questions based EXCLUSIVELY on the provided context sources
- Cite specific sources for every claim using the [cit-XXX] citation IDs provided

Hard constraints:
1. You MUST NOT invent, extrapolate, or infer information not explicitly present in the provided context
2. If the context does not contain sufficient information to answer the query, set answer_type to "insufficient_information" — do not guess
3. You MUST cite at least one source for every corrective step. Steps without citations will be rejected
4. If any context source is marked ⚠ SAFETY CRITICAL, its content MUST appear in the relevant step's "warning" field — do not omit safety warnings
5. Maintain machine scope: only reference information that applies to the machine named in the Machine Context block
6. Your response MUST conform exactly to the JSON schema specified in the Output Format block

Safety rule:
If the provided context is insufficient to give a complete, accurate corrective procedure, do NOT provide a partial procedure. Partial procedures can be more dangerous than no procedure. Set answer_type to "insufficient_information" and explain specifically what information is missing.

Output format: Strict JSON conforming to the schema in the Output Format block. No text outside the JSON object.
```

### Block 2: Machine Context

```
MACHINE CONTEXT:
Machine Name: Haas VF-2
Machine Model: VF-2
Manufacturer: Haas Automation
Manuals indexed: Haas VF-2 Service Manual v3.2, Haas VF-2 Operator Manual v2.0
Session machine confirmed: Yes (selected by technician)

All answers must apply specifically to this machine. Do not provide information about other machines.
```

### Block 3: Conversation History

The last 3 turns of the conversation are included, summarized if any single turn exceeds 500 tokens.

```
CONVERSATION HISTORY (last 3 turns):

Turn 1 [Technician]: "The machine is showing an alarm on the control panel"
Turn 1 [MechMind]: "Can you provide the specific alarm or error code displayed?"

Turn 2 [Technician]: "It shows E101"
Turn 2 [MechMind]: "[disambiguation response - user confirmed Haas VF-2]"
```

**Summarization rule:** If a prior turn's response exceeds 500 tokens, it is replaced with a 1-sentence summary: "MechMind: [Provided corrective steps for E099 coolant low level warning. User confirmed the steps were completed.]"

**Why only 3 turns?**
Three turns is sufficient for context continuity in a maintenance conversation (e.g., "the first step didn't work, what next?"). Longer history risks confusing the LLM with resolved questions that are no longer relevant.

### Block 4: Retrieved Context Chunks

```
CONTEXT SOURCES:

[cit-001] Source: Haas VF-2 Service Manual v3.2 | Chapter 7 > Error Codes > E101 | Pages 214–215 | Type: error_code | Codes: E101
E101 indicates a cooling system pressure loss. The coolant pump has failed to maintain the 
minimum operating pressure of 45 PSI. This may indicate pump failure, blocked coolant filter, 
or a coolant leak in the circulation loop.
Corrective steps: 1. Check coolant level. 2. Inspect pump for signs of failure. 
3. Replace pump if electrical test shows open circuit.

[cit-002] Source: Haas VF-2 Service Manual v3.2 | Chapter 7 > Error Codes > E101 > WARNING | Page 215 | Type: warning | ⚠ SAFETY CRITICAL
WARNING: Before inspecting the coolant pump, ensure the machine is in EMERGENCY STOP state 
and power is locked out per LOTO procedure HAAS-LOTO-07. Failure to lock out power may 
result in serious injury or death.

[cit-003] Source: Haas VF-2 Service Manual v3.2 | Chapter 4 > Maintenance > Coolant System | Pages 98–100 | Type: section
The coolant circulation system requires a minimum pump pressure of 45 PSI for normal operation.
Pressure testing: connect the diagnostic pressure gauge (PN 93-8770) to port C4 located on the 
rear of the coolant reservoir. Normal operating range: 45–75 PSI. If pressure reads below 30 PSI,
the pump impeller is likely damaged and must be replaced.

--- END OF CONTEXT SOURCES ---
```

### Block 5: User Query

```
TECHNICIAN QUERY:
"What does E101 mean and how do I fix it?"
```

### Block 6: Output Format Instruction

```
OUTPUT FORMAT:
Respond with a single JSON object conforming to this schema. Do not include any text before or 
after the JSON object.

{
  "answer_type": "solution" | "disambiguation_required" | "insufficient_information" | "clarification_needed",
  "summary": "string — 1-2 sentence overview of the issue and resolution",
  "error_meaning": "string — what this error code means on this machine",
  "probable_causes": ["string", ...],
  "corrective_steps": [
    {
      "step_number": integer,
      "action": "string — specific action to take",
      "warning": "string | null — safety warning for this step, if any",
      "citation_ids": ["cit-001", ...]
    }
  ],
  "citations": [
    {
      "id": "cit-001",
      "chunk_id": "string — copy from the source header"
    }
  ],
  "confidence_level": "HIGH" | "MEDIUM" | "LOW",
  "notes": "string | null",
  "follow_up_suggestions": ["string", ...]
}

Rules:
- citation_ids in corrective_steps must reference IDs from the CONTEXT SOURCES above
- Do not use citation IDs not present in the provided sources
- If any step lacks a citation, you have generated an uncited claim — remove it or find the citation
```

---

## Token Counting Implementation

Token counting is performed using the `tiktoken` library with the `cl100k_base` encoding (used by GPT-4), which approximates Gemini's tokenization closely enough for budget calculations. An overhead multiplier of 1.05 is applied to account for encoding differences:

```python
import tiktoken

encoder = tiktoken.get_encoding("cl100k_base")

def count_tokens(text: str) -> int:
    return int(len(encoder.encode(text)) * 1.05)
```

For precise token counting when it matters (e.g., when the context is close to the budget limit), the Gemini `count_tokens` API endpoint is called instead:

```python
async def count_tokens_gemini(content: str) -> int:
    response = await gemini_client.count_tokens(
        model="models/gemini-1.5-flash",
        contents=[{"role": "user", "parts": [{"text": content}]}]
    )
    return response.total_tokens
```

---

## Context Assembly Validation

Before the assembled context is sent to the LLM, a validation pass confirms:

1. **Machine consistency** — all chunk headers name the same machine (if machine is known)
2. **Citation ID uniqueness** — no duplicate citation IDs in the context
3. **Safety chunk presence** — if the query involves a procedure and any safety-critical chunk was retrieved, it must be present in the assembled context (not truncated)
4. **Token budget compliance** — total assembled context does not exceed 32,000 tokens
5. **Minimum chunks** — at least 1 chunk is present; if 0 chunks remain after truncation, abort and return evidence gate failure

Any validation failure returns an error to the query pipeline, which triggers the appropriate refusal response.
