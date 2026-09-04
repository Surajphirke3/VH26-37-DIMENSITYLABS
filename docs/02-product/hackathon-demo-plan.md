# MechMind — Hackathon Demo Plan

**Document version:** 1.0
**Status:** Final
**Last updated:** 2026-09-04

---

## 1. Demo Overview

**Total demo time:** 12–15 minutes
**Format:** Live walkthrough of 4 scenarios; judge Q&A after each or consolidated at end
**Primary audience:** Hackathon judges evaluating RAG quality, hallucination control, and UX
**Demo device:** Laptop with Docker Compose stack running locally; browser open to `http://localhost:3000`
**Backup plan:** Pre-recorded screen capture for each scenario (see Section 6)

---

## 2. Demo Environment Setup

### 2.1 Pre-Demo Checklist (complete the night before)

- [ ] Docker Compose stack starts cleanly: `docker compose up -d`
- [ ] All 3 seed manuals ingested and verified queryable
- [ ] Redis populated with no stale sessions
- [ ] Gemini API key in `.env` and confirmed working (run test embed call)
- [ ] Browser cleared of cached sessions; open to `http://localhost:3000` in fresh incognito window
- [ ] Admin panel pre-opened in a second browser tab
- [ ] Chrome DevTools Network tab open (optional) to show real API calls during Q&A
- [ ] Backup demo video recording exported to desktop, playable offline
- [ ] Laptop plugged in; sleep disabled; notifications silenced

### 2.2 Services and Ports

| Service | Port | Health Check URL |
|---------|------|-----------------|
| FastAPI Backend | 8000 | http://localhost:8000/health |
| Next.js Frontend | 3000 | http://localhost:3000 |
| PostgreSQL | 5432 | N/A (internal) |
| Redis | 6379 | N/A (internal) |

Verify all health checks pass before starting the demo.

### 2.3 Seed Data Required

Three PDFs must be pre-ingested with the following content properties:

**Manual 1 — AlphaBot 3000 Operations Manual**
- Machine model: "AlphaBot 3000"
- Must contain: Error code E101 described as "Motor Overload Fault" with corrective action steps
- Must contain: Error code E102 described as "Proximity Sensor Fault"
- Must contain: Section on spindle assembly (for Scenario 2 realism, optional)
- Suggested page count: 45–60 pages

**Manual 2 — ZenithBot Z-Series Service Manual**
- Machine model: "ZenithBot Z-Series"
- Must contain: Error code E101 described as "Hydraulic Pressure Fault" (DIFFERENT meaning from AlphaBot — this contrast is the core of Scenario 3)
- Must contain: Error code E103 described as "Encoder Calibration Error"
- Suggested page count: 40–55 pages

**Manual 3 — PrecisionMill PM-5 Operations Manual**
- Machine model: "PrecisionMill PM-5"
- Must contain: Troubleshooting section for spindle vibration symptoms
- Must contain: Error code P-401 described as "Spindle Vibration Threshold Exceeded"
- Does NOT contain: Error code F99 (required for Scenario 4 to work)
- Suggested page count: 35–50 pages

> Note: ZenithBot Z-Series also does NOT contain error code F99. The absence of F99 in all manuals is what triggers the graceful refusal in Scenario 4.

---

## 3. Scenario 1 — Exact Error Code Query

**Title:** Exact match error code retrieval
**Duration:** 2–3 minutes

### Setup State
- Fresh browser session (no machine context in session)
- Admin panel shows all 3 manuals as COMPLETE
- Chat interface is open and empty

### Input Text
```
What is error code E101 on AlphaBot 3000?
```

### Expected Retrieval Behavior
- Query analyzer detects machine name "AlphaBot 3000" from query text; sets machine context to AlphaBot 3000
- BM25 retrieval: high score for chunks containing literal "E101" from AlphaBot 3000 manual
- pgvector retrieval: high similarity for chunks semantically related to motor fault errors
- RRF fusion promotes chunks that rank highly in both
- Machine filter: only AlphaBot 3000 chunks retained (ZenithBot E101 chunks removed from candidates)
- Evidence sufficiency score: HIGH (exact code match, machine match, good coverage)

### Expected Answer Structure
```json
{
  "has_answer": true,
  "answer": "Error code E101 on the AlphaBot 3000 indicates a **Motor Overload Fault**. This occurs when the motor current exceeds the rated threshold for more than 3 seconds...",
  "steps": [
    "1. Stop the machine immediately using the emergency stop button.",
    "2. Check the motor wiring connections at terminal block TB-3.",
    "3. Inspect and replace the motor fuse (10A, Type T) if blown.",
    "4. Allow the motor to cool for 15 minutes before restarting.",
    "5. If fault persists, contact AlphaBot service support."
  ],
  "confidence": "HIGH",
  "citations": [
    {
      "chunk_id": "abc123",
      "manual_name": "AlphaBot 3000 Operations Manual",
      "page_number": 34,
      "section_title": "Chapter 5: Error Codes and Fault Clearing",
      "excerpt": "E101 — Motor Overload Fault: The motor current has exceeded the rated threshold..."
    }
  ],
  "warnings": ["Do not attempt to restart the machine until the cause is identified and resolved."],
  "follow_up_suggestions": ["How do I check motor wiring?", "What are the motor fuse specifications?"]
}
```

### Expected Citations Shown in UI
- Citation panel open: "AlphaBot 3000 Operations Manual, p. 34, Chapter 5: Error Codes and Fault Clearing"
- Excerpt visible: first 1–2 sentences of the relevant chunk
- Confidence badge: green "HIGH"

### What Judges Should Observe
- System correctly identified the machine from the query text without asking
- Answer is specific to AlphaBot 3000; not a generic motor fault description
- Steps are numbered and actionable
- Citation panel links answer to the exact manual page
- Confidence is HIGH, not hedged
- Response time under 3 seconds

### Common Failure Modes to Avoid
- **Failure:** ZenithBot E101 content appears in citations — indicates machine filter not working
- **Failure:** Answer says "hydraulic pressure" — cross-machine contamination
- **Failure:** No citations returned — indicates citation validation failing silently
- **Failure:** Response time > 5 seconds — indicates cold embedding cache; run a warm-up query before demo starts

---

## 4. Scenario 2 — Natural Language / Semantic Query

**Title:** Symptom-based semantic retrieval
**Duration:** 2–3 minutes

### Setup State
- New session (or same session; either works — no conflicting machine context set)
- Alternatively: pre-select "PrecisionMill PM-5" from machine dropdown to scope query

### Input Text
```
The spindle on my machine is making an unusual vibration. What could be causing this?
```

### Expected Retrieval Behavior
- Query analyzer: no error code detected; query classified as natural language symptom description
- Machine context: if not set, system may retrieve cross-machine; if PrecisionMill is selected, filter applies
- BM25: moderate match on "spindle" and "vibration" tokens
- pgvector: high semantic similarity to PrecisionMill PM-5 spindle troubleshooting section even if exact words differ
- Evidence sufficiency: MEDIUM–HIGH depending on match quality

### Expected Answer Structure
```json
{
  "has_answer": true,
  "answer": "Spindle vibration can have several causes. The most common causes documented in the PrecisionMill PM-5 manual are:\n\n**1. Bearing wear or damage** — Check bearing preload and listen for irregular noise patterns...\n**2. Toolholder imbalance** — Inspect the toolholder for chips or contamination...\n**3. Loose spindle housing bolts** — Torque check bolts to specification...\n**4. Error P-401** — If the vibration exceeds the threshold sensor, this triggers fault P-401...",
  "confidence": "MEDIUM",
  "citations": [
    {
      "manual_name": "PrecisionMill PM-5 Operations Manual",
      "page_number": 22,
      "section_title": "Section 4.3: Spindle Troubleshooting",
      "excerpt": "Excessive spindle vibration may indicate bearing wear, toolholder imbalance, or structural looseness..."
    }
  ],
  "follow_up_suggestions": ["What are the torque specifications for spindle bolts?", "How do I reset fault P-401?"]
}
```

### Expected Citations Shown in UI
- Citation panel: "PrecisionMill PM-5 Operations Manual, p. 22, Section 4.3: Spindle Troubleshooting"
- Confidence badge: amber "MEDIUM" (semantic match, not exact code match)

### What Judges Should Observe
- System answered a symptom description without requiring an error code
- Semantic retrieval found the relevant section even though the query did not contain exact manual text
- Confidence correctly shows MEDIUM rather than HIGH (semantic match has more uncertainty)
- Follow-up suggestions are contextually relevant
- This scenario demonstrates that the system works for technicians who don't know the error code

### Common Failure Modes to Avoid
- **Failure:** System returns "I don't have enough information" — indicates semantic embeddings are not working or evidence threshold is misconfigured
- **Failure:** Answer references AlphaBot or ZenithBot spindle content — cross-machine contamination when machine context should scope to PrecisionMill
- **Failure:** Generic generic "check your manual" response — indicates LLM not receiving context or prompt is malformed

---

## 5. Scenario 3 — Cross-Manual Ambiguity and Clarification

**Title:** Same error code, different machines — system correctly disambiguates
**Duration:** 3–4 minutes (two-turn interaction)

### Setup State
- Fresh session with NO machine context
- Both AlphaBot 3000 manual and ZenithBot Z-Series manual are ingested
- Both contain E101 with different meanings

### Input Text (Turn 1)
```
What is error E101?
```

### Expected Retrieval Behavior (Turn 1)
- BM25 and vector retrieval return E101 chunks from both AlphaBot 3000 AND ZenithBot Z-Series
- RRF fusion: top candidates contain results from both machines
- Machine filter: no machine context set; no filter applied; cross-machine candidates remain
- Ambiguity detection: top-10 results include 3+ chunks from AlphaBot and 3+ from ZenithBot → ambiguous
- Evidence gate: evidence is sufficient for multiple machines → not a refusal scenario
- Disambiguation path triggered: no LLM generation call yet

### Expected Response (Turn 1 — Disambiguation Card)
```json
{
  "has_answer": false,
  "requires_clarification": true,
  "clarification_question": "Error code E101 appears in multiple machine manuals with different meanings. Which machine are you working on?",
  "candidate_machines": [
    {"machine_model": "AlphaBot 3000", "manual_name": "AlphaBot 3000 Operations Manual"},
    {"machine_model": "ZenithBot Z-Series", "manual_name": "ZenithBot Z-Series Service Manual"}
  ],
  "pending_query": "What is error E101?"
}
```

### Expected UI State (Turn 1)
- Chat shows disambiguation card: "Which machine are you working on?"
- Two machine buttons/options shown: "AlphaBot 3000" and "ZenithBot Z-Series"
- Input box remains active for free-text response

### Input (Turn 2)
User clicks "AlphaBot 3000" button (or types "AlphaBot 3000")

### Expected Retrieval Behavior (Turn 2)
- Session: machine_context = "AlphaBot 3000"
- Pending query "What is error E101?" replayed with machine filter = AlphaBot 3000
- BM25 + vector retrieval returns AlphaBot 3000 E101 chunks only
- ZenithBot E101 chunks filtered out
- Evidence sufficiency: HIGH (exact machine + exact code match)

### Expected Answer (Turn 2)
Same structure as Scenario 1: Motor Overload Fault, corrective steps, AlphaBot 3000 citation.

If judge then asks "now what about ZenithBot?" — start a new session and query "E101 on ZenithBot Z-Series" to show the different answer (Hydraulic Pressure Fault).

### What Judges Should Observe
- **This is the core differentiator.** The system did not guess or blend answers from two machines.
- Turn 1: System recognized ambiguity and asked rather than hallucinating
- Turn 2: System replayed the query with the selected machine and returned the correct scoped answer
- If you show both answers side by side, the judge sees: same error code, two completely different root causes, both correctly retrieved from the right manual
- This demonstrates that machine-scoped metadata filtering prevents cross-machine contamination

### Common Failure Modes to Avoid
- **Critical failure:** System answers Turn 1 without asking for clarification — means disambiguation logic is not firing
- **Critical failure:** Turn 2 answer references ZenithBot content — machine filter not applied
- **Failure:** Turn 2 does not replay the original query — pending_query not stored in session
- **Failure:** Clarification question lists all 3 machines instead of just the 2 with E101 — disambiguation is listing all machines instead of relevant ones

---

## 6. Scenario 4 — Insufficient Information / Graceful Refusal

**Title:** System refuses to answer when evidence is absent
**Duration:** 1–2 minutes

### Setup State
- Any session state; ZenithBot Z-Series is the specified machine
- Error code F99 does NOT exist in any ingested manual

### Input Text
```
What is error F99 on ZenithBot?
```

### Expected Retrieval Behavior
- Machine context: ZenithBot Z-Series detected from query text
- BM25: no chunks contain "F99" — zero keyword matches
- pgvector: some semantically similar chunks retrieved but none specifically about F99
- Evidence sufficiency score: LOW — top_score is low (no exact match), coverage_score near 0 (F99 not in any chunk text)
- Score falls below EVIDENCE_THRESHOLD (0.35)
- Evidence gate triggers: skip LLM call entirely

### Expected Response
```json
{
  "has_answer": false,
  "answer": "I could not find information about error code F99 in the ZenithBot Z-Series manual. This error code may not be documented in the currently ingested version of this manual.",
  "searched_manuals": ["ZenithBot Z-Series Service Manual"],
  "suggestions": [
    "Verify that the complete service manual is ingested (check Admin panel for page count)",
    "Check if F99 is a firmware-specific code introduced in a newer manual version",
    "Try describing the symptom instead: 'The ZenithBot is showing a fault related to...'"
  ],
  "citations": []
}
```

### Expected UI State
- Chat shows "No answer found" state card
- Explanation text visible: cannot find F99 in ZenithBot manual
- Suggestions listed as clickable or copyable text
- No citations panel (citations array is empty)
- Confidence badge: absent or explicitly "NONE"

### What Judges Should Observe
- System did NOT make up an answer for F99
- Response is helpful: explains what was searched, why it failed, and what the user can try
- LLM was NOT called (verifiable via server logs: no Gemini API call for this query)
- Response time is faster than normal queries (no LLM call means shorter latency — typically under 300 ms)
- The system failed honestly and gracefully

### Common Failure Modes to Avoid
- **Critical failure:** System invents an answer for F99 — hallucination, the entire point of the evidence gate fails
- **Critical failure:** System says "I don't know" but still cites a chunk that doesn't mention F99 — citation validation failing
- **Failure:** System returns HTTP 500 instead of a graceful 200 refusal response
- **Failure:** Refusal response is not JSON-formatted — breaks frontend rendering

---

## 7. Optional Bonus Scenario (If Time Permits)

### Scenario 5 — Follow-Up Conversation

After Scenario 1, without starting a new session:

**Turn 2 input:** "How do I prevent this from happening again?"

**Expected behavior:** System uses AlphaBot 3000 context and E101 context from session; retrieves preventive maintenance sections from AlphaBot manual; answers without asking "which machine?" again.

**What judges observe:** System remembers the conversation context across turns.

---

## 8. Timing Guide

| Segment | Time |
|---------|------|
| Introduction (30-second pitch: problem, solution, stack) | 30 sec |
| Show admin panel with 3 ingested manuals | 30 sec |
| Scenario 1: Exact error code | 2 min 30 sec |
| Scenario 2: Natural language symptom | 2 min 30 sec |
| Scenario 3: Cross-machine disambiguation (2 turns) | 3 min 30 sec |
| Scenario 4: Graceful refusal | 1 min 30 sec |
| Architecture overview (if judges ask) | 1 min |
| Buffer / Q&A | 2 min |
| **Total** | **~14 min** |

---

## 9. Fallback Procedures

### 9.1 LLM API Is Slow or Rate-Limited
- **Symptom:** Query takes > 10 seconds; spinner visible for too long
- **Response:** Calmly note that the Gemini API has a slight latency on first calls; subsequent calls are faster due to session warming
- **Hard fallback:** Switch to pre-recorded video for that specific scenario; keep audio narration live over the video

### 9.2 LLM API Is Completely Down
- **Pre-condition:** Have a screenshot or recording of each scenario's output prepared
- **Response:** Show the recording; explain the pipeline verbally; focus judge attention on architecture slides or ADR document if available
- **Note:** Evidence gate, BM25, pgvector, and session management can still be demonstrated live (they don't need the LLM)

### 9.3 Disambiguation Does Not Trigger
- **Symptom:** Scenario 3 Turn 1 returns an answer instead of the clarification card
- **Likely cause:** Machine detection extracted a machine name from the query "What is error E101?" — if the query is too specific to one machine, disambiguation won't fire
- **Fix:** Use a truly ambiguous query like "E101" with no machine name; check that the session has no machine context set

### 9.4 Docker Compose Does Not Start
- **Response:** Switch to pre-recorded demo immediately; do not spend demo time on debugging
- **Verbal narration:** Walk judges through the architecture and code structure; offer to share the repo for post-demo evaluation

### 9.5 Database Is Empty (No Manuals Ingested)
- **Response:** Live-ingest one manual during the demo (AlphaBot 3000); this itself demonstrates Scenario 1 of the ingestion pipeline if you have time
- **Time cost:** ~60–90 seconds for ingestion; narrate the pipeline stages while it processes

---

## 10. Post-Demo Talking Points for Judge Q&A

| Question | Prepared Answer Summary |
|---------|------------------------|
| "How does it prevent hallucination?" | Evidence sufficiency gate BEFORE the LLM call. If retrieved evidence is weak, we refuse without calling LLM. Prompt instructions alone are not sufficient. |
| "Why hybrid retrieval and not just vector search?" | Error codes are exact strings — "E101" needs exact keyword match. Semantic search alone may miss exact codes or rank wrong-machine results higher. BM25 catches what vector search misses. |
| "Why not use a dedicated vector database like Pinecone?" | pgvector gives us relational SQL + vectors in one system. For this scale (hundreds of thousands of chunks), pgvector with HNSW index is within 5% of Pinecone performance. Simpler ops, no additional service. |
| "How does it handle follow-up questions?" | Redis session stores machine context and conversation history. Follow-up queries prepend history, preserving context for up to 3 turns. |
| "What happens when a new manual version comes out?" | Admin uploads new version; system creates new chunk set, marks old as inactive. New queries use new chunks. Old version queryable if admin rolls back. |
| "How would this scale to thousands of manuals?" | Horizontal FastAPI workers; pgvector with IVFFlat partitioning or migrate to Qdrant; Celery workers for ingestion queue; Redis Cluster for sessions. All architectural decisions are documented in the ADRs. |

---

*End of Hackathon Demo Plan*
