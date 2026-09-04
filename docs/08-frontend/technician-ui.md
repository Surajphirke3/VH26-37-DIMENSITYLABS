# Technician Interface Design — MechMind

The MechMind technician interface is a specialized diagnostic tool. It is designed around a single primary task: a technician encounters a machine error on the factory floor, opens MechMind, types the error code or describes the symptom, and gets a reliable, step-by-step answer in under 5 seconds. Every design decision serves this workflow.

This is not a general-purpose AI chat interface. Features common to general chatbots (conversation titles, sharing, export, themes, etc.) are out of scope for the technician view. Speed, clarity, and trustworthiness are the governing values.

---

## Layout: Desktop (≥ 1024px)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           DESKTOP LAYOUT                                     │
├─────────────────┬────────────────────────────────────────────────────────────┤
│                 │                                                            │
│   SIDEBAR       │   MAIN CONTENT AREA                                       │
│   (260px)       │   (flex-1)                                                │
│                 │                                                            │
│  ┌───────────┐  │  ┌─────────────────────────────────────────────────────┐  │
│  │ MechMind  │  │  │  MACHINE CONTEXT BANNER                             │  │
│  │  logo     │  │  │  Haas VF-2 (VF-2)  [Change Machine]                │  │
│  └───────────┘  │  └─────────────────────────────────────────────────────┘  │
│                 │                                                            │
│  Machine        │  ┌─────────────────────────────────────────────────────┐  │
│  ┌───────────┐  │  │  MESSAGE LIST (scrollable)                          │  │
│  │ Haas VF-2 │  │  │                                                     │  │
│  │    ▼      │  │  │  [User bubble — right aligned]                      │  │
│  └───────────┘  │  │  What does error E101 mean?                         │  │
│                 │  │                                                     │  │
│  Recent         │  │  [Assistant answer — left aligned, full width]      │  │
│  ──────────     │  │  ┌─────────────────────────────────────────────┐   │  │
│  E101 Haas VF2  │  │  │ ERROR MEANING                               │   │  │
│  Servo fault    │  │  │ E101 — Spindle Encoder Communication Fault  │   │  │
│  E203 FANUC     │  │  ├─────────────────────────────────────────────┤   │  │
│                 │  │  │ PROBABLE CAUSES                             │   │  │
│  ─────────────  │  │  │ • Damaged encoder cable                     │   │  │
│                 │  │  │ • Faulty encoder unit                       │   │  │
│  [New Chat]     │  │  ├─────────────────────────────────────────────┤   │  │
│                 │  │  │ CORRECTIVE STEPS                            │   │  │
│  ─────────────  │  │  │ 1. ⚠ LOCKOUT/TAGOUT before proceeding      │   │  │
│                 │  │  │ 2. Locate cable SP-ENC at J7               │   │  │
│  [Avatar]       │  │  │ 3. Inspect for damage                      │   │  │
│  Jane D. [Tech] │  │  │ 4. Clean connector pins                    │   │  │
│  [Logout]       │  │  ├─────────────────────────────────────────────┤   │  │
│                 │  │  │ [HIGH CONFIDENCE ●] [Citations: 2 ▾]        │   │  │
│                 │  │  └─────────────────────────────────────────────┘   │  │
│                 │  │                                                     │  │
│                 │  │  [Follow-up: How do I do LOTO?] [Part HA-SE-2200?] │  │
│                 │  │                                                     │  │
│                 │  └─────────────────────────────────────────────────────┘  │
│                 │                                                            │
│                 │  ┌─────────────────────────────────────────────────────┐  │
│                 │  │  [Error Code] ← query type badge                    │  │
│                 │  │                                                     │  │
│                 │  │  Enter error code (E101) or describe the symptom...  │  │
│                 │  │                                                     │  │
│                 │  │                               [Send ▶]              │  │
│                 │  └─────────────────────────────────────────────────────┘  │
├─────────────────┴────────────────────────────────────────────────────────────┤
```

The sidebar is fixed-width at 260px on desktop and collapsible to a 60px icon rail on smaller desktops (768–1023px). The main content area fills the remaining horizontal space. The message list takes all available vertical space and scrolls independently of the sidebar.

---

## Layout: Mobile (< 768px)

```
┌───────────────────────────────────────┐
│  ☰  MechMind          Haas VF-2  ⚙   │  ← Top bar (machine name tap = open picker)
├───────────────────────────────────────┤
│                                       │
│  [Message list — full width]          │
│                                       │
│  User: What does E101 mean?           │
│                                       │
│  ┌───────────────────────────────┐    │
│  │ ERROR MEANING                 │    │
│  │ E101 — Spindle Encoder Fault  │    │
│  ├───────────────────────────────┤    │
│  │ PROBABLE CAUSES               │    │
│  │ • Damaged encoder cable       │    │
│  │ • Faulty encoder unit         │    │
│  ├───────────────────────────────┤    │
│  │ CORRECTIVE STEPS              │    │
│  │ 1. ⚠ Apply LOTO              │    │
│  │ 2. Locate cable SP-ENC       │    │
│  │ 3. Inspect for damage        │    │
│  ├───────────────────────────────┤    │
│  │ [HIGH ●] [2 Citations ▾]     │    │
│  └───────────────────────────────┘    │
│                                       │
│  [Follow-up chips — horizontally      │
│   scrollable]                         │
│                                       │
├───────────────────────────────────────┤
│  [Error Code]  Describe symptom...  ▶ │  ← Input row (sticky bottom)
├───────────────────────────────────────┤
│  🏠 Chat    💬 History    ⚙ Admin     │  ← Bottom navigation
└───────────────────────────────────────┘
```

On mobile, the sidebar is replaced by a bottom navigation bar. The machine context is shown in the top bar. The citation panel opens as a bottom sheet rather than an inline collapsible. The input is sticky at the bottom, above the navigation bar.

---

## UI Element Specifications

### 1. Machine Context Banner

Displayed at the top of the main chat area on desktop and in the top bar on mobile.

**Contents:**
- Machine name (e.g., "Haas VF-2")
- Model identifier (e.g., "VF-2 / Haas Automation")
- "Change Machine" button (ghost style, small)

**Behavior:**
- Clicking "Change Machine" opens a modal with a searchable machine list.
- Once a machine is selected, the `activeMachineId` in Zustand is updated. The current conversation is not affected retroactively.
- If no machine is selected, the banner shows "No machine selected — answers may cover multiple machines" with an amber background and a "Select Machine" CTA.

**Visual:** Light gray background, 48px height, subtle bottom border. Machine name is 16px semibold. Model is 13px gray. The banner is always visible and does not scroll with the message list.

---

### 2. Query Input

A large, auto-resizing textarea at the bottom of the chat area. The textarea expands from 1 row to a maximum of 6 rows as the technician types.

**Placeholder text:** `Enter error code (E101) or describe the symptom...`

**Send action:** Click the send button or press `Ctrl+Enter` (or `Cmd+Enter` on Mac). `Enter` alone inserts a newline, allowing multi-line descriptions.

**Disabled states:**
- While an answer is loading, the textarea and button are disabled with a "Thinking..." spinner in the button.
- If no manuals are indexed, the input is disabled with a message above it explaining why (see Empty States).

**Character counter:** Shown in the bottom-right corner of the textarea when the user has typed > 1500 characters. Shows remaining characters in amber (approaching limit) or red (at limit). Maximum is 2000 characters.

---

### 3. Query Type Indicator

A small badge displayed immediately above the textarea (or inline at the start of the input on mobile), updated in real time as the technician types.

**Detection logic (client-side):**
- Matches pattern `^[A-Z]{0,3}\d{2,4}[A-Z]{0,2}$` → badge: `Error Code` (blue)
- If a machine is selected and query contains the machine name → badge: `Machine-Scoped` (green)
- Otherwise → badge: `Natural Language` (gray)

**Purpose:** Gives the technician immediate feedback that the system has understood their input format. Requires no user action — purely informational.

---

### 4. StructuredAnswer Component

The primary answer display. Rendered only for `answer_type = "solution"`.

Composed of four distinct cards stacked vertically:

**Error Meaning Card**
- Heading: "Error Meaning" (12px uppercase label)
- Body: 1–3 sentence plain-English explanation of what the error code indicates. 16px body text. Black on white. High contrast.

**Probable Causes List**
- Heading: "Probable Causes"
- Unordered list, each item on its own line with a bullet.
- Items are ordered by the LLM's estimated likelihood (most likely first).

**Corrective Steps List**
- Heading: "Corrective Steps"
- Ordered list (1, 2, 3...).
- Each step is displayed as a distinct row with the step number on the left.
- Steps with `is_warning: true` include a prominent `WARNING` badge in amber, and the step text is rendered in an amber-tinted box with a `⚠` icon. This is critical for safety steps (e.g., LOTO requirements).
- Steps are indented at 16px. Step numbers are 18px bold. Step text is 15px regular.

**Summary Bar**
- One-sentence summary of the recommended action.
- Displayed in a light blue box at the bottom of the answer card.
- 14px italic.

---

### 5. Citation Panel

Collapsible section below the `StructuredAnswer`. Default state: collapsed, showing "Sources: 2" as a clickable link.

**Expanded state** shows one row per citation:
```
[1] Haas VF-2 Service Manual Rev 4.2
    Chapter 6 > Error Codes > E101 | Pages 142–144
    "E101 SPINDLE ENCODER FAULT: Indicates loss of feedback
     signal from spindle encoder. Check cable continuity..."
    Relevance: 94%
```

Each citation row:
- Citation number `[1]` in a monospace gray badge.
- Manual title (bold, 14px).
- Section path and page range (13px gray).
- A short excerpt from the chunk (italic, 13px, max 3 lines, truncated with "...").
- Relevance score (only shown to managers and admins, not technicians — reduces cognitive load for the primary user).

**Phantom citations:** If `is_phantom: true`, the citation row shows "⚠ Source not verified" in red instead of the excerpt. This is rare and indicates an LLM hallucination was detected.

---

### 6. Confidence Indicator

Displayed in the bottom-left of the answer card, always visible (not inside the collapsed citation panel).

| Confidence | Color | Text | Additional UI |
|---|---|---|---|
| `HIGH` | Green (●) | "High confidence" | None |
| `MEDIUM` | Amber (●) | "Medium confidence" | Tooltip: "Verify steps against the full manual before proceeding." |
| `LOW` | Red (●) | "Low confidence" | Red banner below the answer: "Low confidence answer. Do not rely on this response alone. Consult the full manual or a qualified technician." |

The `LOW` confidence banner uses red background and bold text to ensure it is not missed, even in a busy factory environment.

---

### 7. Disambiguation Card

Shown instead of `StructuredAnswer` when `answer_type = "disambiguation_required"`. The technician has not selected a machine and the error code exists in multiple manuals.

```
┌────────────────────────────────────────────────────────────┐
│  ⚠  Which machine are you working on?                       │
│                                                            │
│  Error code E101 was found in manuals for 2 machines.     │
│  Select your machine to get the correct answer.            │
│                                                            │
│  ┌──────────────────────────────┐                          │
│  │  Haas VF-2                   │                          │
│  │  CNC Milling | Haas Automation│                         │
│  │                              │                          │
│  │  "E101 SPINDLE ENCODER       │                          │
│  │   FAULT: Loss of feedback    │                          │
│  │   signal from encoder..."    │                          │
│  │                              │                          │
│  │  [Select this machine]       │                          │
│  └──────────────────────────────┘                          │
│                                                            │
│  ┌──────────────────────────────┐                          │
│  │  FANUC M-20iA                │                          │
│  │  Industrial Robot | FANUC    │                          │
│  │                              │                          │
│  │  "E101 SERVO AMPLIFIER       │                          │
│  │   OVERLOAD: Axis 1 servo     │                          │
│  │   amplifier exceeded..."     │                          │
│  │                              │                          │
│  │  [Select this machine]       │                          │
│  └──────────────────────────────┘                          │
└────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Clicking "Select this machine" calls `POST /conversations/{id}/disambiguate` with the selected `machine_id`.
- The conversation's machine context is updated globally (Zustand `activeMachineId`).
- The disambiguation card is replaced by the full `StructuredAnswer` for the selected machine.
- On desktop, the machine cards are side-by-side if there are exactly 2. For 3+ machines, they stack vertically.

---

### 8. Refusal Display

Shown instead of `StructuredAnswer` when `answer_type = "insufficient_information"` or `"clarification_needed"`.

```
┌────────────────────────────────────────────────────────────┐
│  ℹ  Not enough information to answer                       │
│                                                            │
│  The indexed manuals for the Haas VF-2 don't contain      │
│  sufficient information to answer this query reliably.     │
│                                                            │
│  What you can try:                                         │
│  • Make sure the correct machine is selected               │
│  • Rephrase with more specific symptoms                    │
│  • Contact your administrator to verify the manual         │
│    is indexed and up to date                               │
└────────────────────────────────────────────────────────────┘
```

**Visual:** Light blue-gray background, `ℹ` info icon in blue. Deliberately non-alarming — this is not a system failure, just a knowledge gap. The suggestions list is actionable.

---

### 9. Follow-Up Suggestions

Displayed as clickable horizontal chips below each assistant response (both `solution` and `disambiguation_required` answer types).

```
[How do I do LOTO on this machine?]  [Part number HA-SE-2200?]  [What is E102?]
```

**Behavior:**
- Clicking a chip auto-fills the query input and immediately submits the query (no extra user action required).
- On mobile, chips are horizontally scrollable in a single row.
- Chips are styled as light gray pills with 14px text. On hover, they darken slightly.
- Maximum 3 chips per response.

---

## Visual Hierarchy and Spacing

The entire interface uses 4px as its base spacing unit.

| Element | Font Size | Weight | Color |
|---|---|---|---|
| Answer card headings | 11px | 600 (semibold) | Gray-500 (uppercase label) |
| Error meaning body | 16px | 400 | Gray-900 |
| Cause and step items | 15px | 400 | Gray-800 |
| Warning step text | 15px | 500 | Amber-900 |
| Summary text | 14px | 400 | Blue-800 (italic) |
| Citation text | 13px | 400 | Gray-600 |
| Machine context banner | 16px name / 13px model | 600 / 400 | Gray-900 / Gray-500 |

**Color palette** uses warm neutrals for body content, industrial amber for warnings, red exclusively for errors and low-confidence warnings, and blue for informational states. No decorative color is used — every color communicates a semantic meaning.

---

## Interaction Flow: Happy Path

1. Technician opens `/dashboard`. Machine context banner shows "No machine selected."
2. Technician selects "Haas VF-2" from the sidebar `MachineSelector`.
3. Machine context banner updates to "Haas VF-2 (VF-2 / Haas Automation)."
4. Technician types "E101" in the query input. Query type badge shows "Error Code."
5. Technician clicks Send or presses Ctrl+Enter.
6. The Send button shows a spinner ("Thinking..."). The input is disabled.
7. The `POST /conversations` call creates a new conversation. The conversation is added to the sidebar recent list.
8. `POST /conversations/{id}/messages` is called with the query.
9. 1.3 seconds later (p95), the answer arrives.
10. The `StructuredAnswer` component fades in with the error meaning, causes, steps, and citations.
11. Three follow-up suggestion chips appear below the answer.
12. The input is re-enabled with focus returned to the textarea.

---

## Interaction Flow: Disambiguation

1. Technician types "E101" without selecting a machine.
2. Answer arrives with `answer_type = "disambiguation_required"`.
3. The `DisambiguationCard` fades in showing 2 machine options.
4. Technician recognizes the Haas VF-2 and clicks "Select this machine."
5. Machine context banner updates. `POST /conversations/{id}/disambiguate` is called.
6. The disambiguation card is replaced by the full structured answer scoped to Haas VF-2.
7. All subsequent messages in this conversation are automatically scoped to Haas VF-2.
