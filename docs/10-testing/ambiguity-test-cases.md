# MechMind Disambiguation System Test Cases

**Version:** 1.0  
**Last Updated:** 2026-09-04  
**Classification:** Safety-Critical Test Area

---

## Overview

The machine disambiguation system is the most safety-critical component in MechMind. A failure in this system can cause a technician to receive troubleshooting instructions for the **wrong machine** — a situation with potential for equipment damage, personal injury, or prolonged downtime.

The following failure modes are classified as **P0 — Critical** and must never occur:

- System provides a confident answer for a query that is genuinely ambiguous across machines
- System retrieves context from Machine A when the session or query specifies Machine B
- System invents an answer when no evidence exists in any manual
- System loses conversation machine scope across turns in the same session

All test cases in this document must pass before any production release. Fail criteria are written with the severity of the real-world consequences in mind.

---

## Test Environment Preconditions

Unless otherwise stated, assume the following indexed state:

| Manual ID | Manual File | Machine | Error Codes |
|-----------|-------------|---------|-------------|
| `manual-haas-001` | `HaasVF2_Service_Manual.pdf` | Haas VF-2 CNC Mill | E101, E202, E303 |
| `manual-fanuc-001` | `FanucOiMF_Service_Manual.pdf` | Fanuc 0i-MF Controller | E101, E202, E404 |
| `manual-kuka-001` | `KukaKR6_Robot_Manual.pdf` | KUKA KR6 Industrial Robot | F101, F202 |

Note: E101 exists in both Haas and Fanuc manuals with **different meanings**. E202 exists in both with different meanings. Error code format F-prefix (KUKA) is distinct from E-prefix (Haas, Fanuc).

---

## Test Cases

---

### AMB-001: Error code exists in exactly 2 machines, no session context

**Scenario:** A technician asks about error E101 without specifying which machine they are working on, and no session machine context exists. The system must recognize that E101 exists in two different manuals with different meanings and must not guess.

**Preconditions:**
- Haas VF-2 manual indexed: E101 = Cooling System Pressure Loss
- Fanuc 0i-MF manual indexed: E101 = Motor Overload
- No active session (or session `machine_id` is null)
- Session `conversation_history` is empty

**Input Query:** `"What is error E101?"`

**Expected System Behavior:**
1. Query classified as `error_code_lookup` for code `E101`.
2. Vector search retrieves chunks from both HaasVF2 and FanucOiMF manuals.
3. Disambiguation detector identifies that `E101` appears in 2 machines.
4. Session has no `machine_id` — no scoping available.
5. System does NOT call the LLM with mixed context.
6. System returns a `disambiguation_required` response listing both machines.
7. Response asks the technician to identify which machine they are working on.

**Expected Response Type:** `disambiguation_required`

**Expected Response Structure:**
```json
{
  "requires_disambiguation": true,
  "answer": null,
  "disambiguation_options": [
    {"machine_name": "Haas VF-2", "machine_id": "...", "error_code": "E101", "brief_description": "Cooling System Pressure Loss"},
    {"machine_name": "Fanuc 0i-MF", "machine_id": "...", "error_code": "E101", "brief_description": "Motor Overload"}
  ],
  "prompt_to_user": "E101 exists in multiple machines in your system. Which machine are you troubleshooting?",
  "citations": []
}
```

**Pass Criteria:**
- `requires_disambiguation` is `true`
- Exactly 2 options are present in `disambiguation_options`
- Both "Haas VF-2" and "Fanuc 0i-MF" appear as options
- `answer` is null or empty — no troubleshooting content is provided
- No citations are included

**Fail Criteria (Dangerous Failures):**
- System returns an answer about cooling pressure loss without asking for clarification — **P0**: technician on a Fanuc machine receives wrong instructions
- System returns an answer about motor overload without asking for clarification — **P0**: technician on a Haas machine receives wrong instructions
- System mixes content from both manuals into a single answer — **P0**: fabricated hybrid answer
- System returns only one machine as an option (silently dropping the other) — **P0**: systematic bias toward one machine

---

### AMB-002: Error code exists in exactly 2 machines, session has machine_id set

**Scenario:** Session context already identifies the machine. The same E101 query should be answered from the correct machine's manual without triggering disambiguation.

**Preconditions:**
- Both HaasVF2 and FanucOiMF manuals indexed
- Active session with `machine_id = manual-haas-001` (Haas VF-2)
- Session `conversation_history` contains prior turns about the Haas VF-2

**Input Query:** `"What is error E101?"`

**Expected System Behavior:**
1. Query classified as `error_code_lookup` for code `E101`.
2. Session `machine_id` is read — `manual-haas-001` is set.
3. Vector search is **scoped** to `manual-haas-001` only — Fanuc manual is excluded from retrieval.
4. Retrieved chunks describe E101 as Cooling System Pressure Loss (Haas context).
5. LLM called with only Haas chunks in `<retrieved_context>`.
6. Response returned directly without asking for clarification.

**Expected Response Type:** `solution`

**Pass Criteria:**
- `requires_disambiguation` is `false`
- Answer text describes cooling system pressure loss (Haas context)
- All citations reference `HaasVF2_Service_Manual.pdf`
- No mention of "motor overload" or Fanuc content appears anywhere in the response

**Fail Criteria (Dangerous Failures):**
- Answer contains Fanuc motor overload content — **P0**: wrong-machine answer despite session context
- System triggers disambiguation despite session machine being set — **P1**: unnecessary interruption of workflow
- Answer mixes Haas and Fanuc content — **P0**: hybrid answer is always incorrect for either machine

---

### AMB-003: Error code exists in 3 or more machines

**Scenario:** Hypothetical scenario where a generic error code exists across all three indexed manuals. System must list all options without guessing.

**Preconditions:**
- All three manuals indexed
- For this test, mock the retrieval to return chunks from all three manuals for query code `ETEST`
- No session `machine_id` set

**Input Query:** `"ETEST error, what do I do?"`

**Expected System Behavior:**
1. Retrieval returns chunks from three distinct manuals.
2. Disambiguation detector identifies 3-machine match.
3. All 3 machines included in disambiguation options.
4. No partial answer provided.

**Expected Response Type:** `disambiguation_required`

**Pass Criteria:**
- `requires_disambiguation` is `true`
- `disambiguation_options` contains exactly 3 entries
- All three machine names appear in the options
- No answer content is returned

**Fail Criteria (Dangerous Failures):**
- System picks the "most likely" machine and answers — **P0**: arbitrary machine selection
- Only 2 of 3 machines are listed — **P0**: one machine is silently excluded
- System invents a generic answer that "might apply to all" — **P0**: fabricated multi-machine answer

---

### AMB-004: Error code exists in exactly 1 machine

**Scenario:** Error code E303 exists only in the Haas VF-2 manual. No disambiguation is needed — the system should answer directly.

**Preconditions:**
- All three manuals indexed
- E303 exists only in `HaasVF2_Service_Manual.pdf` (Axis Fault)
- No session `machine_id` set

**Input Query:** `"What is error E303?"`

**Expected System Behavior:**
1. Query classified as `error_code_lookup` for `E303`.
2. Vector search retrieves chunks only from HaasVF2 manual.
3. Disambiguation detector identifies single-machine match — no disambiguation required.
4. LLM called with HaasVF2 chunks.
5. Answer returned directly.

**Expected Response Type:** `solution`

**Pass Criteria:**
- `requires_disambiguation` is `false`
- Answer describes E303 (Axis Fault — Haas)
- Citation references `HaasVF2_Service_Manual.pdf`
- No disambiguation dialog is presented to the user

**Fail Criteria:**
- System triggers disambiguation when only one match exists — **P1**: unnecessary workflow interruption
- System refuses to answer despite valid single-machine evidence — **P1**: false refusal

---

### AMB-005: User explicitly names machine in query

**Scenario:** Even without session context, if the user names the machine explicitly, the system should scope retrieval to that machine without asking for clarification.

**Preconditions:**
- Both HaasVF2 and FanucOiMF manuals indexed
- No session `machine_id` set

**Input Query:** `"What is error E101 on the Fanuc controller?"`

**Expected System Behavior:**
1. NLP entity extraction identifies machine reference: "Fanuc controller" → maps to `manual-fanuc-001`.
2. Vector search scoped to `manual-fanuc-001`.
3. No disambiguation triggered.
4. Answer describes E101 as Motor Overload (Fanuc context).

**Expected Response Type:** `solution`

**Pass Criteria:**
- `requires_disambiguation` is `false`
- Answer describes motor overload (Fanuc E101)
- Citations reference `FanucOiMF_Service_Manual.pdf`
- Answer does not mention Haas or cooling system

**Fail Criteria (Dangerous Failures):**
- System ignores the machine name in the query and triggers disambiguation — **P1**: unnecessary disruption
- System retrieves from Haas manual despite explicit Fanuc reference — **P0**: wrong-machine answer
- System provides Haas cooling pressure answer for a query explicitly about Fanuc — **P0**: dangerous wrong-machine content

---

### AMB-006: Natural language symptom matches chunks from 2 machines

**Scenario:** A symptom description ("machine is overheating") matches chunks from both HaasVF2 (cooling failure section) and FanucOiMF (motor overload section). Neither machine is named. System should not guess but should note the multi-machine match in the response.

**Preconditions:**
- Both HaasVF2 and FanucOiMF manuals indexed
- No session `machine_id` set

**Input Query:** `"The machine is overheating and shutting down, what should I check?"`

**Expected System Behavior:**
1. Query classified as `symptom_description`.
2. Retrieval returns relevant chunks from both manuals.
3. Since it is a symptom (not a specific error code), and both are relevant, system may proceed with multi-machine context BUT must clearly note that guidance comes from multiple machines.
4. Response includes a caveat that troubleshooting steps may differ by machine.
5. Alternatively, system may prompt the user to identify the machine for more precise guidance.

**Expected Response Type:** `solution` (with multi-machine caveat) OR `disambiguation_required`

**Pass Criteria:**
- If answering: response explicitly states that steps are from multiple machines and which step applies to which
- If disambiguating: both machines are listed as options
- System does not silently serve context from one machine while ignoring the other
- Response is actionable — not a refusal

**Fail Criteria (Dangerous Failures):**
- System silently answers using only one machine's context with no indication — **P0**: technician assumes universal applicability
- System refuses to help at all for a symptom query — **P1**: false refusal on symptom

---

### AMB-007: User selects machine in disambiguation, then asks follow-up question

**Scenario:** Disambiguation was presented in turn 1. User selected Haas VF-2. Follow-up question in turn 2 must remain scoped to Haas VF-2.

**Preconditions:**
- Both HaasVF2 and FanucOiMF manuals indexed

**Turn 1:**
- Input: `"What is error E101?"`
- System: Returns disambiguation with Haas VF-2 and Fanuc 0i-MF options
- User action: Selects "Haas VF-2"
- Session state: `machine_id = manual-haas-001` is set

**Turn 2:**
- Input Query: `"What parts do I need to fix it?"`

**Expected System Behavior (Turn 2):**
1. Session `machine_id = manual-haas-001` is present from turn 1 selection.
2. Query classified as `follow_up`.
3. Retrieval scoped to HaasVF2, E101 context.
4. Answer describes parts for Haas VF-2 cooling system repair.
5. No re-disambiguation.

**Expected Response Type:** `solution`

**Pass Criteria:**
- Machine scope remains Haas VF-2 in turn 2
- Answer is about cooling system parts (Haas E101 context)
- No new disambiguation dialog
- `session.machine_id` persists between turns

**Fail Criteria (Dangerous Failures):**
- Session machine scope is lost between turns — **P0**: turn 2 retrieves from wrong machine
- System re-disambiguates on the follow-up — **P1**: poor UX, redundant disambiguation
- Answer describes Fanuc motor repair parts — **P0**: wrong-machine content after explicit machine selection

---

### AMB-008: User query contains wrong machine name (typo or close match)

**Scenario:** User types "Hass VF-2" (typo) or "Haas VF2" (variant) — close enough to match the indexed machine name. System should apply fuzzy matching and confirm the match or suggest the correct name.

**Preconditions:**
- HaasVF2 manual indexed as "Haas VF-2"
- No session `machine_id` set

**Input Query:** `"What is E303 on the Hass VF2?"` (typo: "Hass" instead of "Haas")

**Expected System Behavior:**
1. Machine name entity extraction attempts exact match — fails for "Hass VF2".
2. Fuzzy match applied — "Hass VF2" scores high similarity to "Haas VF-2".
3. System interprets query as likely referring to Haas VF-2 but includes a clarification note.
4. Response answers from HaasVF2 manual AND includes: "I interpreted 'Hass VF2' as the Haas VF-2. If this is a different machine, please clarify."

**Expected Response Type:** `solution` (with match-confidence note)

**Pass Criteria:**
- Answer is about E303 Axis Fault from HaasVF2 manual
- Response includes a note about the fuzzy match and the assumed machine name
- `machine_id` is set to HaasVF2 in session with `match_type = fuzzy`

**Fail Criteria:**
- System fails to recognize the typo and treats it as an unknown machine name — **P1**: unhelpful response for minor typo
- System silently answers with no indication of the fuzzy match — **P2**: user may not realize the interpretation was assumed
- System refuses to answer due to unrecognized machine name — **P1**: false refusal

---

### AMB-009: Error code exists in the same machine but in two manual versions

**Scenario:** Two versions of the HaasVF2 manual are indexed (v1.0 and v2.0). Both contain E101 but with different corrective steps (procedure updated between versions). System should answer from the latest version and note that an older version also exists.

**Preconditions:**
- `HaasVF2_Service_Manual_v1.pdf` indexed: E101 step 3 = "Replace coolant pump (Part #12345)"
- `HaasVF2_Service_Manual_v2.pdf` indexed: E101 step 3 = "Inspect coolant pump before replacement (Part #67890)"
- Both tagged with machine_id = `haas-vf2`, with version fields `v1.0` and `v2.0`
- Session `machine_id = haas-vf2`

**Input Query:** `"How do I fix E101?"`

**Expected System Behavior:**
1. Retrieval scoped to `haas-vf2` — returns chunks from both manual versions.
2. Reranker or version selector prioritizes latest version (v2.0).
3. Answer generated from v2.0 content.
4. Response includes a note: "Based on Manual v2.0. Manual v1.0 is also indexed with an older procedure."
5. Citations reference v2.0 pages.

**Expected Response Type:** `solution`

**Pass Criteria:**
- Primary answer reflects v2.0 procedure (inspect before replace)
- Citations reference `HaasVF2_Service_Manual_v2.pdf`
- Response includes a note that v1.0 exists and may differ
- No disambiguation between two versions of the same machine's manual

**Fail Criteria (Dangerous Failures):**
- Answer mixes steps from v1.0 and v2.0 without noting the discrepancy — **P0**: potentially incorrect composite procedure
- Answer is from v1.0 (older, superseded) without noting a newer version exists — **P2**: technician uses outdated procedure
- System triggers disambiguation between "Haas v1" and "Haas v2" as if they were different machines — **P1**: confusing and incorrect

---

### AMB-010: Disambiguation presented, user denies all options

**Scenario:** Disambiguation dialog is shown with two machine options. The user responds that their machine is neither of those (it is not in the system).

**Preconditions:**
- HaasVF2 and FanucOiMF manuals indexed
- KUKA KR6 manual is NOT indexed
- No session `machine_id` set

**Disambiguation turn:** System asks about E101, presents Haas VF-2 and Fanuc 0i-MF as options.

**User response:** `"Neither — I'm working on a KUKA robot"`

**Expected System Behavior:**
1. System recognizes the user has not selected any presented option.
2. Machine name "KUKA robot" is extracted — maps to KUKA KR6.
3. KUKA KR6 is not indexed — no manual found.
4. System returns a graceful refusal: "I don't have a manual for the KUKA KR6 in my system. Please upload the KUKA KR6 manual or consult your maintenance documentation."
5. Session `machine_id` is not set — no context is saved.

**Expected Response Type:** `refusal` (machine not in system)

**Pass Criteria:**
- System does not force-select one of the presented options
- Refusal message specifically mentions that the KUKA KR6 manual is not available
- Refusal is actionable: suggests uploading the manual
- No troubleshooting content for Haas or Fanuc is returned

**Fail Criteria (Dangerous Failures):**
- System answers about Haas or Fanuc despite user denying those machines — **P0**: answering for the wrong machine after explicit denial
- System ignores the denial and re-presents the same options — **P1**: unresponsive to user input

---

### AMB-011: Disambiguation presented, user selects machine, but code has no fix steps in that manual

**Scenario:** User selects Haas VF-2 from disambiguation. The Haas manual has an entry for the error code that documents the error but has no corrective procedure (only a "contact manufacturer" note).

**Preconditions:**
- HaasVF2 manual indexed: E404 is documented as "Program Error — Contact Manufacturer"
- FanucOiMF manual indexed: E404 = full corrective procedure
- No session `machine_id` set

**Disambiguation turn:** Query "What is E404?" → disambiguation shown for Haas and Fanuc.  
**User selects:** Haas VF-2.

**Expected System Behavior:**
1. Session `machine_id = manual-haas-001`.
2. Retrieval scoped to HaasVF2 — E404 chunks retrieved.
3. Chunks contain "Contact Manufacturer" — no fix steps available.
4. Confidence scorer returns `low` or `no_fix_available`.
5. System does NOT cross back to Fanuc manual for alternative steps.
6. Response: "For E404 on the Haas VF-2, the manual indicates this requires contacting the manufacturer. The manual does not provide self-service fix steps for this code."

**Expected Response Type:** `refusal` (scoped to correct machine, no procedure available)

**Pass Criteria:**
- Answer is scoped to Haas VF-2 (correct machine per user selection)
- Response clearly states that no fix steps are available in the Haas manual
- Response does NOT include Fanuc E404 fix steps
- Response does NOT invent fix steps

**Fail Criteria (Dangerous Failures):**
- System returns Fanuc E404 fix steps after user selected Haas — **P0**: wrong-machine answer after explicit selection
- System invents plausible-sounding fix steps not present in the Haas manual — **P0**: fabricated instructions
- System silently defaults back to both manuals after user made a selection — **P0**: selection is ignored

---

### AMB-012: Session machine is set, user asks about code from a different machine

**Scenario:** Session is scoped to Haas VF-2. User asks about error F101, which only exists in the KUKA KR6 manual — not in the Haas manual. System must detect the mismatch and offer to switch context rather than silently returning no results.

**Preconditions:**
- All three manuals indexed
- Session `machine_id = manual-haas-001` (Haas VF-2)
- F101 exists only in `KukaKR6_Robot_Manual.pdf`

**Input Query:** `"What is error F101?"`

**Expected System Behavior:**
1. Retrieval scoped to HaasVF2 (session machine) — finds no results for F101.
2. System recognizes the F-prefix error code format is KUKA-specific (or retrieval returned no results within scope).
3. System performs a broader retrieval without machine scope — finds F101 in KUKA manual.
4. Detects mismatch: query references a code from KUKA, but session is Haas.
5. Response: "F101 does not appear in the Haas VF-2 manual, but I found it in the KUKA KR6 manual. Were you asking about the KUKA KR6? If so, I can switch to that machine's context."
6. Session `machine_id` is NOT automatically changed — user must explicitly confirm.

**Expected Response Type:** `disambiguation_required` (machine mismatch offer)

**Pass Criteria:**
- System does not return an answer from the Haas manual for F101 (no fabrication)
- System detects the F101 is in KUKA manual and surfaces this to the user
- Session machine is not silently changed without user confirmation
- Response offers to switch context with clear language

**Fail Criteria (Dangerous Failures):**
- System invents an answer for F101 in the context of the Haas machine — **P0**: fabricated wrong-machine answer
- System silently changes session machine to KUKA without user confirmation — **P1**: surprising context switch
- System returns a plain refusal without mentioning the KUKA match — **P1**: unhelpful when relevant information exists

---

### AMB-013: Empty query with machine context set

**Scenario:** Session has a machine set. User submits an empty query. System must return a validation error, not a graceful refusal or empty answer.

**Preconditions:**
- Session `machine_id = manual-haas-001`

**Input Query:** `""` (empty string)

**Expected System Behavior:**
1. Pydantic schema validation on `QueryRequest` detects `min_length=1` violation.
2. FastAPI returns `422 Unprocessable Entity` immediately — query never reaches the RAG pipeline.
3. Response body includes a clear validation error: "Query must not be empty."

**Expected Response Type:** `validation_error` (HTTP 422)

**Pass Criteria:**
- HTTP status code is 422
- Response body contains a field-level validation error for the `query` field
- No LLM call is made
- No retrieval is performed

**Fail Criteria:**
- System returns HTTP 200 with an empty or confused answer — **P1**: input validation bypass
- System returns HTTP 500 — **P2**: unhandled empty string crash
- System triggers a LLM call with an empty query — **P2**: unnecessary API cost, undefined behavior

---

### AMB-014: Query with only whitespace

**Scenario:** User submits a query containing only spaces or other whitespace characters. System must reject this as invalid input.

**Preconditions:**
- Any indexed manuals

**Input Query:** `"     "` (5 spaces)

**Expected System Behavior:**
1. Pydantic schema validation: `.strip()` applied and length checked — result is empty string.
2. Validator returns `422 Unprocessable Entity`.
3. No RAG processing occurs.

**Expected Response Type:** `validation_error` (HTTP 422)

**Pass Criteria:**
- HTTP status code is 422
- Whitespace-only query is rejected at the validation layer

**Fail Criteria:**
- System accepts whitespace-only query and performs retrieval — **P2**: meaningless retrieval, potential LLM API cost
- System returns a response to a whitespace query — **P2**: undefined behavior

---

### AMB-015: Very long query (>1000 chars) containing multiple error codes

**Scenario:** A user pastes a very long message (over 1000 characters) containing multiple error codes (e.g., copying a machine log). System must reject the oversized input at the validation layer.

**Preconditions:**
- Any indexed manuals

**Input Query:** A string of 1001+ characters, e.g.:
```
"I'm seeing a lot of errors today. First there was E101 which we think was a cooling issue,
then E202 showed up about 20 minutes later, and then the machine showed E303 at the end of
the shift. The operator said the machine was making a strange noise before E101 appeared.
We checked the coolant levels and they seemed fine. The spindle temperature was also elevated.
We need help troubleshooting all of these. The machine has been running for 6 hours. Ambient
temperature in the factory was 32°C. [... continued to 1001+ chars total ...]"
```

**Expected System Behavior:**
1. Pydantic `max_length=1000` check fails.
2. FastAPI returns `422 Unprocessable Entity`.
3. Error message advises the user to ask about one error code at a time.
4. No partial processing of the query.

**Expected Response Type:** `validation_error` (HTTP 422)

**Pass Criteria:**
- HTTP 422 returned for queries exceeding 1000 characters
- Error response suggests breaking the query into shorter, single-error queries
- No RAG processing occurs for any part of the query

**Fail Criteria:**
- System accepts and processes the oversized query — **P2**: prompt injection surface area increases with longer inputs; excessive API costs
- System truncates the query silently and processes a partial version — **P2**: unpredictable behavior, user unaware of truncation
- System returns HTTP 500 — **P2**: unhandled overflow

---

## Summary Table

| Test ID | Scenario | Expected Response Type | Dangerous Failure Mode |
|---------|----------|----------------------|----------------------|
| AMB-001 | E101 in 2 machines, no session | disambiguation_required | Answers with wrong-machine content |
| AMB-002 | E101 in 2 machines, session set | solution (scoped) | Retrieves from wrong machine |
| AMB-003 | Error code in 3+ machines | disambiguation_required | Picks one machine arbitrarily |
| AMB-004 | Error code in exactly 1 machine | solution (direct) | Triggers unnecessary disambiguation |
| AMB-005 | Machine named explicitly in query | solution (scoped) | Ignores explicit machine name |
| AMB-006 | Symptom matches 2 machines | solution (with caveat) OR disambiguation_required | Silent single-machine assumption |
| AMB-007 | Follow-up after disambiguation selection | solution (scoped) | Loses session machine scope |
| AMB-008 | Machine name with typo | solution (fuzzy match note) | Refuses for minor typo |
| AMB-009 | Same error, two manual versions | solution (latest version) | Mixes steps from both versions |
| AMB-010 | User denies all disambiguation options | refusal (machine not indexed) | Answers for wrong machine after denial |
| AMB-011 | Selected machine has code but no fix steps | refusal (scoped, no procedure) | Returns other machine's procedures |
| AMB-012 | Session machine set, code from other machine | disambiguation_required (mismatch) | Fabricates answer or silently switches |
| AMB-013 | Empty query, machine context set | validation_error (HTTP 422) | Processes empty query |
| AMB-014 | Whitespace-only query | validation_error (HTTP 422) | Accepts whitespace as valid query |
| AMB-015 | Query >1000 chars with multiple error codes | validation_error (HTTP 422) | Accepts or silently truncates |

---

## Test Automation Notes

All AMB tests should be automated in `tests/integration/test_disambiguation.py` using the `httpx` async client against the full FastAPI application backed by the test database.

- AMB-001 through AMB-012: Integration tests with real indexed test PDFs and mocked Gemini API responses.
- AMB-013 through AMB-015: Unit-level input validation tests — no database or LLM interaction needed.

All AMB tests must be included in the CI pipeline gate. Failure of any AMB test blocks merge to main.
