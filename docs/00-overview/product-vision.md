# Product Vision

## Product Name

**MechMind** — Intelligent Machine Troubleshooting, Grounded in Your Manuals

---

## One-Line Vision

MechMind transforms factory machine manuals into an always-available, citation-grounded troubleshooting assistant that gives factory floor technicians precise, machine-specific answers in seconds, not hours.

---

## Why It Matters

Factory floors run on uptime. When a CNC lathe, injection moulding press, or industrial conveyor throws an error code, a technician has minutes — not hours — to diagnose and resolve the fault before the production line grinds to a halt. The actual corrective procedure is almost always documented somewhere: buried in a 400-page PDF manual, locked in a filing cabinet, or accessible only to a senior engineer who is currently on another shift.

The problem is not a lack of information. The problem is retrieval under pressure.

Current reality:
- Technicians search through multi-hundred-page PDFs manually, hunting for a specific error code.
- The same error code — for example, `E-501` — can mean an overtemperature fault on Machine A and a communication timeout on Machine B. Confusing the two is not just inefficient; it is potentially unsafe.
- Experienced engineers carry institutional knowledge in their heads. When they leave, that knowledge leaves with them.
- Generic AI chatbots (ChatGPT, etc.) hallucinate: they produce plausible-sounding answers that are not sourced from actual manuals. In a safety-critical environment, a confident wrong answer is worse than no answer at all.

MechMind solves all three problems: it retrieves the right information for the right machine, surfaces exactly where in the manual the answer comes from, and refuses to answer when evidence is insufficient.

---

## Target Users

| User Type | Role | Context |
|---|---|---|
| Factory Floor Technician | Primary end user | Standing next to a broken machine, time-pressured, needs an immediate answer |
| Senior Maintenance Engineer | Power user | Diagnoses complex faults, asks multi-part follow-up questions, validates AI output |
| Maintenance Manager | Operational user | Tracks downtime, uploads new manuals, monitors system usage |
| System Administrator | Platform administrator | Manages user access, ingestion pipelines, vector store health |

---

## Core Value Proposition

MechMind is the only troubleshooting assistant that:

1. **Is machine-aware** — it knows that `E-501` on a Haas VF-2 means something entirely different from `E-501` on a Mazak Integrex, and it always retrieves answers scoped to the correct machine.
2. **Is grounded** — every answer includes inline citations referencing the exact manual, section, and page number from which the information was drawn.
3. **Knows when to refuse** — if retrieved evidence is insufficient or contradictory, MechMind will say so explicitly and tell the technician what additional information is needed, rather than generating a plausible but wrong answer.
4. **Supports natural language** — technicians can describe symptoms in plain language ("the spindle is vibrating and throwing sparks") without needing to know the exact error code.
5. **Handles ambiguity actively** — when a query is under-specified, MechMind asks a focused clarifying question rather than guessing.

---

## What Success Looks Like

- A technician types `E-501` and is given a precise, cited corrective procedure for their specific machine within 5 seconds.
- A technician describes a symptom in natural language and receives a structured answer that includes: probable cause, corrective steps, safety warnings, and citations to the source manual.
- Every answer can be audited: a maintenance manager can look at any answer given in the last 30 days and trace exactly which manual section it came from.
- The system refuses to answer — and explains why — when the question cannot be grounded in available documentation, preventing confident misinformation.
- New manuals can be uploaded and made queryable within minutes by a non-technical manager.
- A technician who followed the system's advice and fixed the machine can confirm resolution; a technician who found the advice wrong can flag it for review.

---

## What Failure Looks Like

- The system gives a confident answer citing `E-501` corrective steps from Machine B's manual when the technician has Machine A in front of them. This is the primary failure mode this system is designed to prevent.
- The system generates an answer that is not supported by any retrieved chunk but sounds authoritative — a hallucination. In a safety-critical environment, this could lead to injury, machine damage, or production loss.
- The system retrieves correct chunks but fails to surface them because of poor embedding quality, missing OCR, or inadequate chunking of table-heavy manuals.
- The system is too slow: a 30-second response time on a production floor is functionally useless.
- The system is unavailable when needed most — during a machine fault event.
- The system's citations point to the wrong page or section, eroding technician trust even when the answer itself is correct.
- A senior engineer asks a follow-up question and the system loses context from the prior turn, forcing them to re-specify machine and error code.

---

## Design Principles Derived from the Vision

1. **Grounding over fluency** — a shorter, correctly cited answer is always preferable to a longer, uncited one.
2. **Machine scope first** — every retrieval operation must be scoped to a specific machine unless explicitly requested otherwise.
3. **Explicit uncertainty** — confidence scores and evidence sufficiency checks must gate every answer; the system must never present low-confidence output as definitive.
4. **Speed as a feature** — end-to-end query latency under 5 seconds is a hard requirement, not a stretch goal.
5. **Refusal as a safety net** — graceful, informative refusal is a feature, not a failure.
