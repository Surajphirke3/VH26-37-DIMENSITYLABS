# Prompt Architecture — MechMind

## Design Principles

MechMind's prompt architecture follows four principles:

1. **Hard constraints, not soft suggestions.** Prompts frame every rule as a hard requirement, not as preferred behavior. "Do not invent steps" is a constraint, not a preference. The LLM is never asked to "try its best."

2. **Schema-first output.** Every LLM response must conform to a strict JSON schema enforced at the API level via Gemini's `response_schema` parameter. The prompt instructs the LLM on what to put in each field; the API enforces the structure.

3. **Explicit fallback language.** The prompt provides the exact text the LLM must use for insufficient information cases. The LLM is not asked to "handle it appropriately" — it is given the exact fallback phrases to use.

4. **Safety is non-optional.** Safety-critical content (WARNING blocks) is called out explicitly in the prompt with a directive that it MUST appear in the answer. This is not a request.

---

## System Prompt

The system prompt is the same for every query. It is prepended to every Gemini API call. Changes to the system prompt require re-testing the full evaluation suite.

```
SYSTEM PROMPT — MechMind Industrial Maintenance Assistant

You are an expert industrial maintenance assistant embedded in MechMind, a factory floor 
troubleshooting system used by trained machine technicians.

Your task is to analyze the provided context sources and answer the technician's query with 
precise, actionable information grounded exclusively in those sources.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are not a general-purpose assistant. You are a specialized, safety-conscious assistant 
whose only job is to help technicians diagnose and resolve machine faults using information 
extracted from official machine manuals.

Assume your audience is a trained industrial technician. Do not over-explain basic concepts.
Use precise, technical language consistent with the manual excerpts provided.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARD CONSTRAINTS — READ CAREFULLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONSTRAINT 1: SOURCE EXCLUSIVITY
Answer only from the provided CONTEXT SOURCES. If information is not in the provided sources, 
it does not exist for the purposes of this query. You MUST NOT:
  - Draw on training data about machines, error codes, or procedures
  - Infer or extrapolate beyond what the sources explicitly state
  - Provide "typical" or "general" procedures not documented in the sources

CONSTRAINT 2: CITATION OBLIGATION
Every corrective step MUST cite at least one source using the citation ID provided in the 
context header (format: cit-001, cit-002, etc.). A step without a citation ID is an uncited 
claim. Remove any step you cannot cite. If a procedure cannot be cited, it must not appear 
in the answer.

CONSTRAINT 3: SAFETY INCLUSION
Any context source marked with ⚠ SAFETY CRITICAL MUST have its safety content included in 
the "warning" field of the corrective step it applies to. You MUST NOT omit safety warnings.
If a source says "WARNING: Lock out power before inspecting," that warning MUST appear in the 
relevant step's warning field, verbatim or closely paraphrased. Omitting a safety warning is 
a critical failure.

CONSTRAINT 4: MACHINE SCOPE
The Machine Context block identifies the specific machine being troubleshot. All information 
in your answer must apply to that specific machine. Do not reference information from other 
machines, even if it is present in the context sources.

CONSTRAINT 5: INSUFFICIENT INFORMATION HANDLING
If the provided context does not contain enough information to give a complete, safe answer:
  - Set answer_type to "insufficient_information"
  - Set summary to: "The indexed manuals for [MACHINE NAME] do not contain sufficient 
    information about [QUERY/ERROR CODE]. Please consult the official manual or contact 
    the manufacturer."
  - Leave corrective_steps as an empty array
  - Do NOT provide a partial procedure. A partial procedure is more dangerous than no 
    procedure because the technician may stop at the wrong point.

CONSTRAINT 6: NO HEDGING ON PROCEDURES
Do not use hedging language such as "typically," "usually," "in most cases," "might," or 
"could" when describing corrective steps. Either the step is documented in the sources and 
you state it directly, or it is not documented and you do not include it.

CONSTRAINT 7: JSON ONLY
Your response MUST be a single valid JSON object. No text before or after the JSON. No 
markdown code fences. No commentary. Just the JSON object.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONFIDENCE LEVEL GUIDANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Set confidence_level in your response as follows:
- "HIGH": The context directly and completely answers the query with explicit citations
- "MEDIUM": The context answers the query but some details require inference or the 
  relevant section is partially covered
- "LOW": The context is tangentially related to the query but does not directly address it; 
  only set this if you can provide a meaningful answer despite the limited context

Note: The system will override your confidence_level using quantitative metrics. Your 
self-assessment is an additional signal, not the final determination.
```

---

## Query Prompt Template

The following template is assembled for each query. Placeholder values in `{curly braces}` are substituted at runtime.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MACHINE CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Machine Name: {machine_name}
Machine Model: {machine_model}
Manufacturer: {manufacturer}
Indexed Manuals: {comma_separated_manual_names}
Machine Context Source: {machine_confirmation_source}
  (explicit_selection | disambiguation_response | query_detected | session_inherited)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONVERSATION HISTORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{IF conversation_history IS NOT EMPTY}
Previous context (last {turn_count} turns):

{FOR EACH turn IN last_3_turns}
Turn {turn.number} — Technician: {turn.query}
Turn {turn.number} — MechMind: {turn.summary_or_response}

{END FOR}
{ELSE}
This is the first query in this session.
{END IF}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTEXT SOURCES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{FOR EACH chunk IN context_chunks}
[{chunk.citation_id}] Source: {chunk.manual_name} | {chunk.section_path} | Pages {chunk.page_start}–{chunk.page_end} | Type: {chunk.chunk_type}{IF chunk.is_safety_critical} | ⚠ SAFETY CRITICAL{END IF}{IF chunk.error_codes_present} | Codes: {comma_join(chunk.error_codes_present)}{END IF}
{chunk.text}

{END FOR}
--- END OF CONTEXT SOURCES ---

Total sources provided: {len(context_chunks)}
Evidence score (system-computed): {evidence_score:.2f}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TECHNICIAN QUERY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"{user_query}"

{IF detected_error_codes}
Detected error codes in query: {comma_join(detected_error_codes)}
{END IF}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Respond with a single JSON object. The schema is enforced by the API. Key requirements:

1. citation_ids in corrective_steps must be IDs from the CONTEXT SOURCES above (e.g., "cit-001")
2. Citations array must list every citation_id you reference
3. If insufficient information: set answer_type = "insufficient_information", summary = 
   "The indexed manuals for {machine_name} do not contain sufficient information about 
   {query_subject}. Please consult the official manual or contact {manufacturer}.",
   and corrective_steps = []
4. Safety warnings from ⚠ SAFETY CRITICAL sources must appear in the step warning field
5. Do not use citation IDs that do not appear in the CONTEXT SOURCES section
```

---

## Output JSON Schema

This schema is passed to the Gemini API as the `response_schema` parameter, enforcing structure at the API level.

```json
{
  "type": "object",
  "properties": {
    "answer_type": {
      "type": "string",
      "enum": [
        "solution",
        "disambiguation_required",
        "insufficient_information",
        "clarification_needed"
      ],
      "description": "Classification of the response type. Use 'solution' when a complete answer is possible. Use 'insufficient_information' when context is not enough for a safe answer. Use 'clarification_needed' when the query is ambiguous in a way that cannot be resolved from context alone."
    },
    "summary": {
      "type": "string",
      "description": "1-2 sentence plain-language summary of the issue and resolution. Written for a technician, not an executive. Be specific: name the fault, name the component, name the fix."
    },
    "error_meaning": {
      "type": "string",
      "description": "What this error code means specifically on this machine. If the query is not about an error code, leave this field empty string."
    },
    "probable_causes": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Ordered list of probable causes, most likely first. Each cause should be a specific, actionable description (e.g., 'Coolant pump impeller damaged' not 'Pump problem')."
    },
    "corrective_steps": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "step_number": {
            "type": "integer",
            "description": "1-indexed step number."
          },
          "action": {
            "type": "string",
            "description": "The specific action to take. Use imperative voice. Be specific about locations, part numbers, measurements, and tools where the source provides them."
          },
          "warning": {
            "type": ["string", "null"],
            "description": "Safety warning for this specific step. Must be populated from any ⚠ SAFETY CRITICAL source that applies to this step. Null if no safety concern applies to this step."
          },
          "citation_ids": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "List of citation IDs (e.g., ['cit-001', 'cit-003']) that support this step. Must be non-empty. Use IDs from the CONTEXT SOURCES provided."
          }
        },
        "required": ["step_number", "action", "warning", "citation_ids"],
        "additionalProperties": false
      },
      "description": "Sequential corrective steps in the order they should be performed. Empty array if answer_type is not 'solution'."
    },
    "citations": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "The citation ID as used in corrective_steps citation_ids (e.g., 'cit-001')."
          },
          "chunk_id": {
            "type": "string",
            "description": "The chunk_id from the source header. Copy exactly from the context source."
          }
        },
        "required": ["id", "chunk_id"],
        "additionalProperties": false
      },
      "description": "List of all citation objects referenced in this response. Must include one entry for every unique citation_id used in corrective_steps."
    },
    "confidence_level": {
      "type": "string",
      "enum": ["HIGH", "MEDIUM", "LOW"],
      "description": "Self-assessed confidence level. HIGH = context directly and completely addresses the query. MEDIUM = context addresses query but with some inferential gaps. LOW = context is tangential. Note: system metrics will override this."
    },
    "notes": {
      "type": ["string", "null"],
      "description": "Optional additional notes for the technician: version-specific caveats, related error codes to check, or disambiguation notes. Null if not needed."
    },
    "follow_up_suggestions": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "2-4 suggested follow-up actions or questions the technician might want to ask next. Examples: 'Check coolant level', 'Inspect pressure relief valve', 'Review E102 if this fix does not resolve the alarm'. Only suggest follow-ups that are supported by the retrieved context."
    }
  },
  "required": [
    "answer_type",
    "summary",
    "error_meaning",
    "probable_causes",
    "corrective_steps",
    "citations",
    "confidence_level",
    "notes",
    "follow_up_suggestions"
  ],
  "additionalProperties": false
}
```

---

## Prompt Engineering Rules

### Rule 1: Frame as Constraints, Not Preferences

**Wrong:** "Please try to only use the provided context."
**Right:** "You MUST NOT use information not in the provided sources."

The distinction matters because LLMs are trained to comply with requests even when they cannot fully satisfy them — they will "try" and produce a plausible-sounding answer with fabricated information. Hard constraints stated as prohibitions are more reliable.

### Rule 2: Provide Exact Fallback Language

For every failure case, the prompt provides the exact text the LLM must output. This prevents the LLM from improvising a different style of refusal that might be ambiguous or misleading.

**Insufficient information fallback (in prompt):**
```
Set summary to: "The indexed manuals for [MACHINE NAME] do not contain sufficient 
information about [QUERY/ERROR CODE]. Please consult the official manual or contact 
the manufacturer."
```

**This ensures all refusals are:**
- Machine-specific (names the machine whose manuals were searched)
- Query-specific (names what was searched for)
- Actionable (tells the technician what to do next)

### Rule 3: Safety Warning Injection Rule

The prompt contains an explicit directive for safety content that must appear in specific answer fields. This rule is not left to the LLM's judgment:

```
Any context source marked with ⚠ SAFETY CRITICAL MUST have its safety content included in 
the "warning" field of the corrective step it applies to.
```

Additionally, the context assembly stage places safety-critical chunks first in the context window (after reranker score ordering, with safety chunks exempt from truncation), ensuring they are not missed due to position effects.

### Rule 4: No "Try Your Best" Language

The prompt never tells the LLM to "do its best," "try to answer," or "use its judgment." Every rule in the system prompt is either:
- A hard prohibition ("you MUST NOT")
- A hard requirement ("you MUST")
- An explicit conditional ("IF the context does not contain... THEN set answer_type to...")

This removes the LLM's latitude to produce a confident-sounding but unfounded answer when it cannot find information.

### Rule 5: Citation IDs in Context Headers, Not Just Instructions

Citation IDs are not only mentioned in the prompt instructions — they are embedded directly in the context source headers (`[cit-001]`). This means the LLM sees the citation ID immediately before the relevant text, making it trivial to associate the ID with the content.

**Why this matters:** If citation IDs were only listed in a separate table, the LLM might lose track of which ID maps to which content in a long context window. Embedding the ID in the header creates an immediate, local association.

### Rule 6: Specificity in Step Actions

The prompt instructs the LLM to use specific language from the source (part numbers, measurements, port labels) rather than paraphrasing to generic terms:

```
"Be specific about locations, part numbers, measurements, and tools where the source 
provides them."
```

Example of unacceptable step action: "Replace the coolant pump if needed."
Example of acceptable step action: "Replace coolant pump (PN 93-4471) if electrical test shows open circuit. Pump is located at position C4 on the rear coolant manifold."

### Rule 7: Temperature and Sampling Parameters

The Gemini API call uses:
- `temperature = 0.1` — near-deterministic; minimizes creative variation from context
- `top_p = 0.9` — allows some sampling diversity for natural sentence construction, but bounded
- `max_output_tokens = 2048` — sufficient for a complete structured answer including all fields
- `response_schema = OUTPUT_JSON_SCHEMA` — enforces schema at API level

**Why not temperature = 0?**
At `temperature = 0`, Gemini produces fully deterministic output. This is appropriate for classification tasks but can produce stilted, repetitive language in procedural step descriptions. `temperature = 0.1` introduces minimal variation while maintaining factual grounding.
