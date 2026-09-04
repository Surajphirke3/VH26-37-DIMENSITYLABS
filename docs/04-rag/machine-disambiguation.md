# Machine Disambiguation Architecture — MechMind

## The Core Problem

A technician types: **"What does E101 mean?"**

In the MechMind knowledge base, E101 is indexed in two manuals:
- **Haas VF-2 Service Manual** → E101: Cooling system pressure loss (coolant pump fault)
- **Fanuc 0i-MF Operator Manual** → E101: Motor overload detected (drive overcurrent)

These are fundamentally different faults requiring different corrective actions. If MechMind answers from the wrong manual, the technician may:
- Replace a coolant pump when the actual problem is a motor overload
- Perform the wrong procedure, wasting time and parts
- Miss a safety-critical warning specific to the actual fault type
- In the worst case, perform a procedure that causes injury or further machine damage

**Machine disambiguation is a patient safety analog for factory floor systems.** Getting the machine context wrong is not a minor inconvenience — it is an operational risk.

This document defines the complete disambiguation architecture: how machine context is detected, how ambiguity is measured, when disambiguation is triggered, and how the system recovers after the technician provides clarification.

---

## Section 1: Machine Context Sources (Priority Order)

Machine context is resolved by evaluating these sources in strict priority order. The first source that yields a confident `machine_id` is used. Lower-priority sources are not evaluated once a higher-priority source succeeds.

### Priority 1: Explicit Session Machine

**What it is:** The user has already explicitly selected or confirmed a machine in the current chat session. The `machine_id` is stored in the session record.

**How it is set:**
- User selects a machine from the machine selector in the UI before starting a query
- User confirmed a machine during a previous disambiguation flow in this session
- Admin pre-configured the session with a machine context (e.g., a technician's workstation always defaults to the machine on that factory line)

**Trust level:** Unconditional. This source always takes precedence. The system will not re-trigger disambiguation for a session with a confirmed machine_id, even if the query is ambiguous in isolation.

**Session storage:**
```python
session = {
    "session_id": "uuid",
    "machine_id": "uuid",              # set once confirmed
    "machine_confirmed_at": "timestamp",
    "machine_confirmation_source": "explicit_selection",  # or "disambiguation_response"
    "expires_at": "timestamp"
}
```

---

### Priority 2: Machine Name or Model in Current Query

**What it is:** The technician explicitly names a machine in the current query text.

**Examples:**
- "What does E101 mean on a Haas VF-2?"
- "My Fanuc 0i-MF is showing E101"
- "VF-2 error E101"

**Detection method:**
1. Build a lookup table of all indexed machine names and model identifiers
2. Apply fuzzy matching (edit distance threshold of 2 characters for strings > 5 chars, exact match for short strings) to catch common misspellings: "Haas VF2" → "Haas VF-2", "Fanuc 0iMF" → "Fanuc 0i-MF"
3. If a match is found, extract the `machine_id` from the lookup table

**Confidence threshold:** A match is accepted only if the similarity score is above 0.85 (using token-set ratio from `rapidfuzz`). Below this threshold, the match is treated as a possible mention and used as a hint for Priority 4 (auto-detection).

**Session update:** If a machine is detected from the query and the session has no machine_id, the detected machine_id is stored in the session. A soft confirmation message is added to the response: "Answering for the Haas VF-2."

---

### Priority 3: Machine Name from Conversation History

**What it is:** A machine was mentioned in a previous turn of the current conversation, even if not confirmed.

**How it is stored:** Each conversation turn records `mentioned_machine_ids` — a list of machine_ids that were detected or mentioned in that turn. The last 5 turns are inspected.

**Confidence decay:** Machine mentions in earlier turns receive lower confidence weight:
- Turn N-1 (immediately previous): weight 0.9
- Turn N-2: weight 0.7
- Turn N-3 and older: weight 0.5

**Usage:** If a machine_id appears consistently across recent turns (weighted sum >= 0.8), it is used as the machine context for the current query.

**This source is typically used for follow-up queries** where the technician has already established machine context and asks a follow-up question without naming the machine again: "What should I do first?" after "What does E101 mean on the Haas VF-2?"

---

### Priority 4: Auto-Detection from Query Vocabulary

**What it is:** The query contains machine-specific terminology, model numbers, or jargon that strongly suggests a specific machine, even without an explicit machine name.

**Detection mechanism:**
At ingestion time, machine-specific vocabulary is extracted from each manual:
- Model numbers and part numbers that appear in that manual (e.g., "VF-2 spindle")
- Proprietary function names (e.g., "Haas Macro B" → Haas machines)
- System-specific terminology (e.g., "PMC ladder" → Fanuc machines, "SERVO GUIDE" → Fanuc)

These are stored in a `machine_vocabulary` table with associated `machine_id` values. At query time, the query is matched against this vocabulary table.

**Confidence:** Auto-detection produces a `machine_id` only if the vocabulary match is unambiguous (a term appears in exactly one machine's vocabulary) and the match confidence is > 0.7. If the term appears in multiple machines' vocabularies, it is not used as a differentiator.

---

### Priority 5: Unknown — Disambiguation Required

**What it is:** None of the above sources resolved a machine_id. The machine context is unknown.

**Consequence:** The query pipeline continues to retrieval without a machine filter (cross-machine retrieval). The ambiguity detection algorithm (Section 3) runs after retrieval to determine whether a disambiguation response is needed.

---

## Section 2: Retrieval-Time Disambiguation

### Machine-Known Path

When a `machine_id` is resolved (from any of Priorities 1–4):

```
1. Apply WHERE machine_id = :machine_id to SQL query before retrieval
2. Build BM25 query against the machine-specific BM25 index
3. Return only chunks from that machine
4. Proceed to evidence check and context assembly
5. No disambiguation is triggered
```

This path is deterministic. Once machine context is established, disambiguation logic is bypassed entirely.

### Machine-Unknown Path

When `machine_id` is null:

```
1. Retrieve top-20 chunks from all machines (no machine filter)
2. Run RRF fusion across all results
3. Inspect machine_id distribution of the top-10 fused results
4. Run ambiguity detection algorithm (Section 3)
5. If ambiguity detected AND query has error code: trigger disambiguation response
6. If ambiguity detected AND natural language query: attempt to proceed
7. If no ambiguity detected: proceed with the dominant machine as context
```

---

## Section 3: Ambiguity Detection Algorithm

After cross-machine retrieval (machine-unknown path), the system measures ambiguity in the top-10 results.

### Ambiguity Score Formula

```python
def compute_ambiguity(top_10_chunks: List[Chunk]) -> float:
    """
    Returns ambiguity score in range [0.0, 1.0].
    0.0 = perfectly unambiguous (all top results from one machine).
    1.0 = perfectly ambiguous (each top result from a different machine).
    """
    machine_counts = Counter(chunk.machine_id for chunk in top_10_chunks)
    dominant_machine_count = max(machine_counts.values())
    total_count = len(top_10_chunks)

    ambiguity_score = 1.0 - (dominant_machine_count / total_count)
    return ambiguity_score
```

**Example:**
- Top-10 results: 8 from Machine X, 2 from Machine Y
- Ambiguity score = 1 - (8/10) = **0.2** → Low ambiguity; proceed with Machine X
- Top-10 results: 5 from Machine X, 5 from Machine Y
- Ambiguity score = 1 - (5/10) = **0.5** → High ambiguity; disambiguation required

### Decision Rules

| Condition | Action |
|---|---|
| `ambiguity_score <= 0.3` AND query has error code | Proceed with dominant machine; no disambiguation |
| `ambiguity_score > 0.3` AND query has error code | **Trigger disambiguation response** |
| `ambiguity_score > 0.3` AND natural language query | Attempt to proceed; note multi-machine context in response |
| `ambiguity_score <= 0.3` AND natural language query | Proceed with dominant machine |
| All top results from single machine | Proceed with that machine; implicitly set machine context |

**Why the threshold is 0.3:**
At 0.3, the dominant machine accounts for 70% of the top-10 results. This is a strong signal that the dominant machine is the correct context. Below 0.3, we are not confident enough to commit to one machine, especially for error code queries where a wrong answer has direct operational consequences.

**Why natural language queries are treated differently:**
For natural language symptom queries ("machine is vibrating"), the answer may legitimately draw from multiple machines' manuals if the troubleshooting procedure is similar across machines. In this case, a multi-machine response can be more helpful than forcing disambiguation. The answer will note "This applies to both Machine X and Machine Y" where relevant.

### Error Code Presence Check

The error code presence check is performed alongside the ambiguity check:

```python
def should_trigger_disambiguation(
    top_10_chunks: List[Chunk],
    query_context: QueryContext
) -> bool:
    ambiguity = compute_ambiguity(top_10_chunks)

    if not query_context.has_error_code:
        return False   # Never force disambiguation for natural language queries

    if ambiguity <= 0.3:
        return False   # Low ambiguity; dominant machine is clear

    # Check if the error code appears in multiple machines' chunks
    machines_with_code = set()
    for chunk in top_10_chunks:
        if query_context.detected_codes & set(chunk.error_codes_present):
            machines_with_code.add(chunk.machine_id)

    return len(machines_with_code) > 1   # disambiguation required
```

---

## Section 4: Disambiguation Response Format

When disambiguation is required, the system does not call the LLM. Instead, it returns a structured JSON response directly to the frontend.

### Response Schema

```json
{
  "type": "disambiguation_required",
  "query_id": "uuid",
  "message": "Error code E101 appears in manuals for multiple machines. Which machine are you troubleshooting?",
  "detected_code": "E101",
  "options": [
    {
      "machine_id": "a1b2c3d4-...",
      "machine_name": "Haas VF-2",
      "machine_model": "VF-2",
      "manufacturer": "Haas Automation",
      "manual_name": "Haas VF-2 Service Manual v3.2",
      "snippet": "E101: Cooling system pressure loss. Indicates the coolant system has lost pressure below the minimum operating threshold...",
      "relevance_score": 0.91
    },
    {
      "machine_id": "e5f6g7h8-...",
      "machine_name": "Fanuc 0i-MF",
      "machine_model": "0i-MF",
      "manufacturer": "Fanuc",
      "manual_name": "Fanuc 0i-MF Series Operator Manual",
      "snippet": "E101: Motor overload detected. The servo amplifier has detected an overcurrent condition on the main spindle drive...",
      "relevance_score": 0.87
    }
  ],
  "follow_up": "Select a machine to get the specific error code meaning and corrective steps."
}
```

### Snippet Generation

The snippet for each option is the first 300 characters of the top-ranked chunk for that machine that contains the error code. This gives the technician enough information to identify which machine they are working with, even if they do not know the exact machine name.

### Ordering of Options

Options are ordered by `relevance_score` descending. The most likely machine (highest-scoring chunks) appears first.

### Message Customization

The disambiguation message is dynamically generated:
- Single error code detected: "Error code E101 appears in manuals for multiple machines."
- Multiple error codes detected: "Error codes E101 and E102 appear in manuals for multiple machines."
- Model number in query but no manual match: "I found the model number you mentioned but could not locate it in the indexed manuals."

---

## Section 5: Post-Disambiguation Flow

After the technician selects a machine from the disambiguation options:

### Step 1: Record the Selection

```python
async def handle_disambiguation_response(
    session_id: str,
    selected_machine_id: str,
    original_query: str
) -> QueryResponse:

    # Store confirmed machine in session
    await session_store.update(session_id, {
        "machine_id": selected_machine_id,
        "machine_confirmed_at": datetime.utcnow(),
        "machine_confirmation_source": "disambiguation_response"
    })

    # Re-run the original query with the confirmed machine_id
    return await run_query_pipeline(
        query=original_query,
        session_id=session_id,
        machine_id=selected_machine_id   # now explicitly set
    )
```

### Step 2: Re-run Query Pipeline

The original query is re-executed from Stage 9 (query analysis) onwards, now with `machine_id` confirmed. The machine filter is applied, and the pipeline proceeds to the evidence check, context assembly, and LLM generation.

### Step 3: Session Persistence

All subsequent queries in this session inherit the confirmed `machine_id`. The technician does not need to select the machine again.

The session record retains the `machine_confirmation_source` field so that analytics can distinguish:
- Sessions where machine was pre-selected before the first query
- Sessions where machine was established via disambiguation

---

## Section 6: Session Machine Context Management

### Session Structure

```python
{
    "session_id": "uuid",
    "user_id": "uuid",
    "machine_id": "uuid | null",
    "machine_confirmed_at": "timestamp | null",
    "machine_confirmation_source": "explicit_selection | disambiguation_response | query_detected | null",
    "created_at": "timestamp",
    "last_active_at": "timestamp",
    "expires_at": "timestamp",
    "conversation_history": [
        {
            "turn": 1,
            "query": "...",
            "response_type": "solution | disambiguation_required | ...",
            "mentioned_machine_ids": ["uuid", ...]
        }
    ]
}
```

### Session Expiry

- Session TTL: 4 hours of inactivity (configurable)
- On session expiry: `machine_id` is cleared
- On session expiry: conversation history is cleared
- A new query after session expiry starts fresh, with no inherited machine context

**Rationale:** A 4-hour session covers a typical maintenance shift. Technicians working across multiple machines during the same shift can change machine context mid-session (see below). Session expiry prevents stale machine context from persisting across shifts.

### Changing Machine Mid-Session

A technician may switch from troubleshooting Machine X to Machine Y within the same session:

**Explicit change:**
- Technician uses the machine selector in the UI to select a different machine
- The session `machine_id` is updated to the new selection
- `machine_confirmation_source` is updated to `explicit_selection`
- Conversation history is retained but prior turns are noted as belonging to the previous machine context

**Implicit change via query:**
- Technician types "What about the E101 on the Fanuc 0i-MF?" when session was set to Haas VF-2
- The explicit machine mention in the query (Priority 2) takes precedence over the session machine (Priority 1) only when the machine mention is unambiguous AND different from the session machine
- The system responds: "Switching to Fanuc 0i-MF context for this query. [Answer]. Note: Your session was previously set to Haas VF-2. Should I update your session to Fanuc 0i-MF?"
- If the technician confirms, `session.machine_id` is updated

---

## Section 7: Edge Cases

### Edge Case 1: Error Code in 3+ Machines

**Scenario:** E101 exists in manuals for Machine X, Machine Y, and Machine Z.

**Handling:**
- The disambiguation response includes all matching machines as options
- Options are ordered by relevance score
- The UI displays all options with their snippets
- If more than 5 machines match (possible for very common codes like generic `E001`), display the top 5 by relevance score with a note: "Showing top 5 matches. Select 'None of these' to search all indexed manuals."

### Edge Case 2: Same Code in Two Versions of Same Machine's Manual

**Scenario:** E101 exists in Haas VF-2 Service Manual v2.1 and v3.2 (two versions of the same machine's manual, both indexed).

**Handling:**
- Both manuals belong to the same `machine_id`
- The machine filter resolves machine context correctly
- Chunk retrieval returns chunks from both manual versions; cross-encoder reranking will rank the more relevant version higher
- The citation in the answer will specify which manual version the answer came from
- System preference: chunks from the newer manual (higher version or later upload_date) receive a 5% score boost in the reranking stage, as they are assumed to be more accurate

**Detection of version conflict:** If two chunks from different manual versions for the same machine give contradictory information about the same error code, a `version_conflict` flag is added to the response and both versions' information is presented to the technician with a note to consult the official current manual.

### Edge Case 3: User Denies All Suggested Machines

**Scenario:** Disambiguation options are presented (Machine X, Machine Y) but the technician says "It's neither of these."

**Handling:**
- Response structure:
  ```json
  {
    "type": "disambiguation_unresolved",
    "message": "The error code E101 was not found in any other indexed manual. The following manuals are available for search:",
    "available_machines": [
      {"machine_id": "uuid", "machine_name": "..."},
      ...
    ],
    "suggestion": "Please verify the error code and machine model. If this machine's manual is not yet indexed, contact your system administrator to upload it."
  }
  ```
- A "Search all manuals" fallback option is presented, which retrieves across all indexed machines without a filter

### Edge Case 4: Machine Name in Query Doesn't Match Any Indexed Machine

**Scenario:** Technician types "What does E101 mean on a Haas VF-5?" but only the Haas VF-2 and VF-3 are indexed.

**Detection:** The fuzzy match against the machine vocabulary table finds no match above the 0.85 threshold for "VF-5."

**Handling:**
1. Identify closest machine names by fuzzy match: "VF-5" is closest to "VF-2" (edit distance 1) and "VF-3" (edit distance 1)
2. Return a disambiguation response:
   ```json
   {
     "type": "machine_not_found",
     "message": "No manual for 'Haas VF-5' is currently indexed.",
     "suggestions": [
       {"machine_id": "uuid", "machine_name": "Haas VF-2", "similarity": 0.80},
       {"machine_id": "uuid", "machine_name": "Haas VF-3", "similarity": 0.80}
     ],
     "question": "Did you mean one of these machines? Or should we search all indexed Haas manuals?"
   }
   ```
3. If technician confirms a similar machine, proceed with that machine_id
4. If technician confirms none, offer a cross-manufacturer search or escalation prompt

### Edge Case 5: Disambiguation Loops

**Scenario:** After disambiguation, the re-run retrieval still produces an ambiguous result (e.g., because the machine-scoped retrieval returns low-quality chunks).

**Protection:**
- Maximum disambiguation depth: 2 levels
- If after the first disambiguation and machine selection the evidence score is still below threshold, return `insufficient_information` response rather than triggering a second disambiguation
- Log the event for review: indicates a gap in the indexed manuals for this machine

### Edge Case 6: Machine Context Conflict Between Session and Query

**Scenario:** Session machine is Haas VF-2, but query says "E101 on Fanuc 0i-MF."

**Priority resolution:**
- An explicit, high-confidence machine name in the current query (Priority 2) overrides the session machine (Priority 1) IF the query machine is different from the session machine AND the match confidence is > 0.9
- The system responds transparently: "Your session is set to Haas VF-2, but you mentioned Fanuc 0i-MF. Answering for Fanuc 0i-MF. [Answer]. Should I update your session machine?"

---

## Disambiguation Flow Diagram

```
Query received
       |
       v
Machine context resolution (Priority 1-4)
       |
       +---> machine_id resolved? ---YES---> Apply machine filter -> Retrieve -> Proceed
       |
      NO
       |
       v
Cross-machine retrieval (no filter)
       |
       v
Compute ambiguity score
       |
       +---> ambiguity_score <= 0.3? ---YES---> Use dominant machine -> Proceed
       |
      NO
       |
       v
Query has error code?
       |
       +---YES---> Error code in multiple machines? ---YES---> Return disambiguation_required
       |                                              NO ---> Use dominant machine -> Proceed
       |
      NO (natural language)
       |
       v
Proceed with multi-machine context, note in response
       |
       v
[After disambiguation_required: user selects machine]
       |
       v
Store machine_id in session
       |
       v
Re-run query pipeline with machine filter applied
```
