# User Journeys

## Document Purpose

This document describes detailed end-to-end user journeys through MechMind, capturing every system step, decision point, and user interaction. These journeys are used for: UX design validation, integration test specification, and demonstrating the system's core capabilities to stakeholders.

Three journeys cover the system's three most critical flows.

---

## Journey 1: Error Code Query — Ambiguous Machine, Full Disambiguation and Resolution

**Persona**: Raj Patel (Factory Floor Technician)
**Goal**: Find the corrective procedure for error code `E-501`, which he sees on a machine's control panel
**Key Capability Demonstrated**: Machine disambiguation, machine-scoped retrieval, structured cited answer

### Context

Raj's factory has two machines whose manuals are indexed in MechMind: a **Haas VF-2 CNC Milling Machine** and a **Mazak Integrex i-400 Multi-Tasking Machine**. Error code `E-501` appears in both manuals — on the Haas it indicates a spindle encoder fault; on the Mazak it indicates a coolant pressure fault. The procedures are completely different. Raj is standing at the Haas VF-2, but he did not pre-select a machine when he opened MechMind.

---

### Step-by-Step Flow

**Step 1 — Raj opens MechMind on his tablet**
- System: Displays the query interface. A persistent header shows "No machine selected."
- No onboarding flow is required. The query input box is the first focused element on the page.

**Step 2 — Raj types `E-501` and taps Submit**
- Input: `E-501`
- System action 1 — Ambiguity Detection: The query pipeline checks whether machine scope is established in the session. It is not.
- System action 2 — Pre-retrieval scan: The system performs a lightweight retrieval scan (without machine filter) to identify which machines have chunks containing the token `E-501`.
- Result: `E-501` found in chunks from both Haas VF-2 manuals and Mazak Integrex i-400 manuals.
- System action 3 — Disambiguation trigger: Because multiple machines match and no scope is set, the system does NOT proceed to full retrieval or answer generation.

**Step 3 — System returns a Disambiguation Response**
- Displayed response (approximately):
  ```
  "I found documentation for error code E-501 in manuals for more than one machine:

   1. Haas VF-2 CNC Milling Machine
   2. Mazak Integrex i-400 Multi-Tasking Machine

   Which machine are you currently working on?"
  ```
- The two machine names appear as tappable buttons (not a free-text field).
- No corrective steps, no probable causes, no speculation is shown at this stage.
- Response time for this disambiguation step: under 2 seconds (no LLM call needed).

**Step 4 — Raj taps "Haas VF-2 CNC Milling Machine"**
- System action: Machine scope is set to `haas_vf2` for the remainder of the session.
- The header now reads: "Machine: Haas VF-2 CNC Milling Machine — Change"
- System action: Full retrieval pipeline is now triggered with machine scope filter.

**Step 5 — System performs hybrid retrieval for `E-501` scoped to Haas VF-2**
- Semantic search: Vector nearest-neighbour search with metadata filter `machine_id = haas_vf2`; retrieves top 20 chunks by cosine similarity.
- BM25 search: Keyword search for token `E-501` in the Haas VF-2 corpus; retrieves top 20 BM25-ranked chunks.
- Rank fusion: Reciprocal Rank Fusion merges both lists into a single ranked list of up to 20 unique chunks.
- No Mazak chunks appear — the metadata filter has excluded them.

**Step 6 — System reranks top-20 chunks**
- Cross-encoder reranker scores each (query: "E-501", chunk) pair.
- Top 5 chunks selected for context assembly:
  1. Error code table row: `E-501 | Spindle Encoder Fault | Encoder signal lost or corrupted` (reranker: 0.92)
  2. Troubleshooting section: "For alarm E-501, inspect the encoder cable at the spindle motor connector J3." (reranker: 0.88)
  3. Safety note: "Warning: De-energise the machine before inspecting encoder connectors. Lock out / tag out per facility procedure." (reranker: 0.81)
  4. Parts reference: "Encoder Part No. HV2-ENC-007" (reranker: 0.74)
  5. Context chunk on when E-501 recurs after replacement (reranker: 0.70)

**Step 7 — Evidence sufficiency check**
- Top chunk reranker score: 0.92 (above threshold of 0.60). Pass.
- Minimum 2 chunks above 0.50: 5 chunks above 0.70. Pass.
- Proceed to context assembly.

**Step 8 — Context assembly**
- System prompt included (instructions: answer only from context, use cited chunk IDs, produce structured format).
- All 5 chunks included with provenance headers (manual name, section, page, chunk ID).
- Conversation history: Empty (first query in session).
- Query appended.
- Total token count: estimated 2,800 tokens (well within context limit).

**Step 9 — LLM generates structured answer**
- Output format: JSON with keys: `probable_cause`, `corrective_steps` (array), `safety_warnings` (array), `citations` (array), `confidence_score`, `follow_up_suggestions` (array).
- The LLM references chunk IDs in each field.

**Step 10 — Hallucination check**
- System verifies that each chunk ID cited exists in the retrieved chunk set. All 5 cited IDs are present. Pass.
- System performs semantic similarity check on each corrective step statement against the retrieved chunks. All statements score above the grounding threshold. Pass.

**Step 11 — System returns the structured answer to Raj**

Displayed answer (rendered from structured JSON):

```
E-501 — Spindle Encoder Fault
Machine: Haas VF-2 CNC Milling Machine
Confidence: High (0.92)

PROBABLE CAUSE
Loss of encoder signal from the spindle motor. Most commonly caused by a damaged or
disconnected encoder cable at connector J3. [1]

CORRECTIVE STEPS
1. Stop the machine and engage lockout/tagout per your facility's procedure. [3]
2. Locate the spindle motor encoder cable. The cable runs from the encoder at the rear
   of the spindle motor to connector J3 on the machine's control cabinet. [2]
3. Inspect the cable and connector J3 for visible damage, loose connection, or corrosion.
   Reseat the connector if loose. [2]
4. If the cable is damaged, replace with Part No. HV2-ENC-007. [4]
5. Power the machine and clear the alarm. If E-501 recurs after replacement, the encoder
   unit itself may be faulty — contact your Haas service representative. [5]

SAFETY WARNINGS
- De-energise the machine completely before inspecting encoder connectors.
  Lock out / tag out per facility procedure. [3]

CITATIONS
[1] Haas VF-2 Operator Manual, Section 12 "Alarm Code Reference Table", p. 214, Chunk ID: hvf2-p214-03
[2] Haas VF-2 Service Manual, Section 7.4 "Spindle System Troubleshooting", p. 87, Chunk ID: hvf2-p087-02
[3] Haas VF-2 Operator Manual, Section 2 "Safety", p. 11, Chunk ID: hvf2-p011-01
[4] Haas VF-2 Parts Catalogue, Section 5 "Spindle Assembly", p. 33, Chunk ID: hvf2-p033-07
[5] Haas VF-2 Service Manual, Section 7.4 "Spindle System Troubleshooting", p. 89, Chunk ID: hvf2-p089-01

SUGGESTED FOLLOW-UPS
• What is the full procedure for locking out this machine?
• Where is connector J3 located on the Haas VF-2?
• What are the symptoms of a fully failed spindle encoder?
```

**Step 12 — Raj reads the corrective steps and follows them**
- He taps the citation for Step 2 — the system highlights or links to the source chunk display.
- He completes the inspection, finds a loose connector, and reseats it.
- He powers the machine, clears the alarm, and the machine resumes normal operation.

**Step 13 — Raj submits feedback**
- He taps the "Helpful" button.
- Audit log entry is updated with feedback: `{ "feedback": "helpful", "resolved": true }`.
- Total session time: 4 minutes.

---

## Journey 2: Natural Language Symptom Query with Follow-Up Conversation

**Persona**: Annika Johansson (Senior Maintenance Engineer)
**Goal**: Diagnose an intermittent spindle noise fault on the Fanuc Robodrill, starting from a symptom description, then asking follow-up questions.
**Key Capability Demonstrated**: Semantic retrieval, multi-turn conversation, context preservation

### Context

Annika has been called in because a CNC technician reported the Fanuc Robodrill D21MiA5 is making a grinding sound at the start of cutting cycles and occasionally throwing an intermittent tool breakage alarm (Alarm 447). The machine is still running but she wants to diagnose it before it fails catastrophically. She starts a MechMind session at her desk before going to the floor.

---

### Step-by-Step Flow

**Step 1 — Annika opens MechMind and selects the machine**
- She knows which machine, so she selects "Fanuc Robodrill D21MiA5" from the machine selector dropdown on the query page.
- Machine scope is immediately set. Header shows: "Machine: Fanuc Robodrill D21MiA5"

**Step 2 — Annika types a natural language query**
- Input: `"Spindle is making a grinding noise at start of cutting cycle, intermittent tool breakage alarm 447"`
- She submits the query.

**Step 3 — System performs hybrid retrieval**
- The query is embedded as a dense vector and compared against Fanuc Robodrill D21MiA5 chunks only.
- Semantic search: Returns chunks about spindle bearing wear, tool clamping, spindle acceleration ramps, alarm 447 description.
- BM25 search: Returns chunks with tokens "447", "grinding", "tool breakage" from the same machine scope.
- Fusion and reranking: Top 5 chunks assembled, including: alarm 447 description + cause, spindle bearing diagnosis procedure, tool clamp unit inspection procedure, and a safety note about cutting load inspection.

**Step 4 — Evidence check passes, context assembled, LLM generates answer**
- Confidence: 0.85 (High)
- Answer generated covering: alarm 447 probable causes (tool clamp solenoid, spindle bearing wear, tool holder contamination), corrective steps for each cause, safety warning about tool clamping force verification.
- Citations reference the alarm reference section and the spindle maintenance section.

**Step 5 — Annika receives the first answer**
- She reads the probable cause and corrective steps.
- She is particularly interested in spindle bearing wear and wants to know more about the diagnosis procedure.

**Step 6 — Annika asks a follow-up question (Turn 2)**
- Input: `"What is the procedure to check spindle bearing condition on this machine?"`
- She does not repeat the machine name — she expects MechMind to know.
- System: Conversation history (turn 1) is included in the context for this turn. Machine scope remains Fanuc Robodrill D21MiA5.
- System: New retrieval query sent with machine scope preserved.
- Retrieved chunks: Spindle bearing inspection procedure (vibration measurement, audible inspection method, bearing preload check), required tools (dial indicator, stethoscope, torque wrench).

**Step 7 — System returns Turn 2 answer**
- Answer: Step-by-step spindle bearing inspection procedure with tool list and acceptance criteria for bearing noise level.
- Citations: Fanuc Robodrill D21MiA5 Maintenance Manual, Section 8.3 "Spindle Bearing Inspection".
- Follow-up suggestions: "What is the specification for spindle bearing preload on this machine?", "How often should spindle bearings be replaced?", "What are the symptoms of a spindle bearing that is about to fail?"

**Step 8 — Annika asks another follow-up (Turn 3)**
- Input: `"If the bearing is found to be worn, is this a job I can do in-house or does it need a Fanuc service call?"`
- System: Retrieves chunks from the maintenance manual about spindle bearing replacement requirements, service qualification, and the relevant section on when manufacturer service is recommended.
- Answer: The manual states that spindle bearing replacement on this model requires spindle disassembly and precision reassembly; the manual recommends this be performed by a qualified Fanuc service technician or a workshop with the specified alignment equipment. Citations reference the relevant section.
- Confidence: 0.79 (High)

**Step 9 — Annika finishes her session**
- Based on the conversation, Annika decides to schedule a Fanuc service call and tags the machine for monitoring.
- She downloads the conversation (PDF export — future feature noted) to attach to the service request.
- Session duration: 12 minutes, 3 turns.
- She rates the session "Partially Helpful" and notes in the free text: "Would like a direct link to the bearing replacement section so I can quote the manual to the service team."

---

## Journey 3: Query Outside Manual Coverage — Graceful Refusal

**Persona**: Raj Patel (Factory Floor Technician)
**Goal**: Find troubleshooting information for an error on a recently installed machine whose manual has not yet been uploaded.
**Key Capability Demonstrated**: Evidence sufficiency check, graceful refusal, actionable next steps

### Context

A new hydraulic press (Haulick & Roos RPV 250-1500) was installed three weeks ago. The maintenance manager has not yet uploaded the manual to MechMind (it arrived in German and is being translated). Today, the press is showing a fault display of `F72-04`. Raj queries MechMind.

---

### Step-by-Step Flow

**Step 1 — Raj opens MechMind and attempts to select his machine**
- Raj taps the machine selector and searches "Haulick" — no results.
- He searches "Haulick Roos" — no results.
- The machine selector shows: "No machines matching 'Haulick Roos' found in the index."
- Raj is not sure whether the machine is under a different name. He decides to try querying anyway.

**Step 2 — Raj types his query without a machine scope**
- Input: `"F72-04 fault on hydraulic press"`
- No machine is selected. He submits.

**Step 3 — System performs ambiguity detection**
- The system runs a pre-retrieval scan for `F72-04` across all machines in the index.
- Result: Zero chunks containing the token `F72-04` found in any indexed manual.
- Result: Semantic search for "F72-04 hydraulic press" returns chunks from other hydraulic equipment manuals (generic hydraulic press content) with low relevance scores (top score: 0.31).

**Step 4 — Evidence sufficiency check fails**
- Top chunk reranker score: 0.31 (below threshold of 0.60).
- Minimum 2 chunks above 0.50: zero chunks above 0.50.
- Evidence is insufficient. LLM generation is bypassed entirely.

**Step 5 — System generates a refusal response**

Important: The LLM is NOT called for the answer in this step. The refusal is generated by the application layer using a template combined with the specific information about why retrieval failed. A lightweight LLM call may be used only to make the refusal text natural-sounding (optional — the template alone is acceptable).

Displayed response:

```
Unable to Answer — Insufficient Documentation

I was not able to find relevant information for fault code F72-04 in the manuals
currently indexed in MechMind.

Why: No documentation for this fault code was found in any indexed manual.
The closest match found was from a different machine (score: 0.31, below the
minimum threshold of 0.60 required to generate a reliable answer).

The machine you may be working on (hydraulic press with code F72-04) does not
appear to be indexed in MechMind.

What to do next:
1. Check whether the machine's manual has been uploaded — ask your Maintenance
   Manager or check the Supported Machines list.
2. Consult the physical manual that came with the machine. For hydraulic press
   fault F72-04, look in the "Fault Codes" or "Alarm Reference" section.
3. Contact the machine manufacturer's technical support line directly.
4. Escalate to a senior engineer who may have experience with this machine.

Note: If you are a manager or administrator, you can upload the manual for this
machine on the Manual Management page so future queries can be answered.
```

**Step 6 — Raj reads the refusal and acts**
- He immediately escalates to the maintenance manager (Derek) and mentions that the Haulick & Roos manual is not in MechMind.
- Derek notes this and contacts the manufacturer for the manual. He also raises the translation delay as a priority issue.

**Step 7 — System logs the refusal event**
- Audit log records: query, zero retrieved chunks above threshold, refusal issued, zero answer generated.
- The refusal is visible in the admin dashboard's refusal log.
- Derek, reviewing the metrics next week, sees the refusal in the logs and uses it as evidence that the machine's manual should have been uploaded before the machine went live.

### Key Failure Mode Prevented

Without the refusal mechanism, the system would:
1. Pass the low-scoring hydraulic press chunks (from unrelated manuals) to the LLM.
2. The LLM would interpolate between those chunks and generate a plausible-sounding corrective procedure.
3. Raj would follow a procedure designed for a different machine's hydraulic fault.
4. The wrong procedure on a hydraulic press could result in incorrect pressure adjustments, hydraulic fluid release, or component damage.

The refusal mechanism prevents this outcome. The system's ability to say "I don't know" is a direct safety feature.
