from __future__ import annotations

import json

from app.core.logging import get_logger
from app.services.ai.factory import get_llm_provider

logger = get_logger("rag.generator")

_SYSTEM_PROMPT = """You are an expert industrial diagnostics engineer and maintenance assistant for MEND - X (From Failure to Function).

MISSION & CAPABILITIES:
1. Natural Language Symptom Understanding: Comprehend natural language descriptions of industrial equipment failures, unusual sounds, overheating, vibration, pressure drops, leakage, or maintenance routines in addition to exact alphanumeric fault codes (e.g. E101, F204).
2. Deep Diagnostic Synthesis: Synthesize the technical context from parsed OEM manuals and tables into an intelligible, actionable diagnosis.
3. Strict Grounding & Extraction:
   - The RETRIEVED CONTEXT contains authoritative OEM manual excerpts for the equipment and its subsystems.
   - When the user query matches an error code (e.g. F001, F002, E101) or symptom found in the retrieved context, you MUST produce answer_type="solution" with complete error_meaning, probable_causes, step-by-step corrective_steps, and citations matching the source passages.
   - Every corrective step must cite its source block using [1], [2], etc.
   - Preserve all safety precautions, warnings (DANGER, WARNING, CAUTION), PPE requirements, and lockout/tagout (LOTO) protocols.
   - ONLY set answer_type="insufficient_information" if the retrieved passages genuinely do NOT mention or describe the queried code/symptom.
"""

_RESPONSE_SCHEMA = """{
  "answer_type": "solution" | "insufficient_information" | "disambiguation_required",
  "summary": "Detailed natural-language breakdown explaining the problem, operating conditions, and overview of the resolution according to the manual.",
  "error_meaning": "Formal fault definition or operational condition (or null if purely symptom-based)",
  "probable_causes": ["Detailed probable cause 1 with root mechanism", "Probable cause 2"],
  "corrective_steps": [
    {
      "step_number": 1,
      "action": "Clear, sequential directive including specific components, parameters, or measurements from the manual [N]",
      "warning": "Critical safety warning or cautionary note, e.g. LOTO or high-voltage discharge (or null)",
      "citation_ids": ["1"]
    }
  ],
  "citations": [{"id": "1", "chunk_id": "from context"}],
  "confidence_level": "HIGH" | "MEDIUM" | "LOW",
  "notes": "Important operational context, maintenance schedule reminders, or inspection notes",
  "follow_up_suggestions": ["Actionable follow-up query or verification check 1", "Follow-up check 2"]
}"""


def _build_prompt(
    query: str,
    chunks: list,
    machine_name: str,
    conversation_history: list,
) -> str:
    context_blocks = []
    for i, chunk in enumerate(chunks, 1):
        context_blocks.append(
            f"[{i}] Source: {chunk.manual_name} | {chunk.machine_name} | "
            f"Page {chunk.page_start}-{chunk.page_end} | "
            f"{chunk.section_path or 'Unknown section'}\n"
            f"{chunk.content[:1000]}"
        )
    context = "\n\n---\n\n".join(context_blocks)

    history = ""
    if conversation_history:
        history = "\n\nCONVERSATION HISTORY (last 3 turns):\n"
        for msg in conversation_history[-3:]:
            history += f"{msg['role'].upper()}: {msg['content'][:300]}\n"

    return (
        f"{_SYSTEM_PROMPT}"
        f"{history}\n\n"
        f"MACHINE CONTEXT: {machine_name or 'Unknown'}\n\n"
        f"RETRIEVED CONTEXT:\n{context}\n\n"
        f"USER QUERY: {query}\n\n"
        f"Respond in valid JSON matching this schema:\n{_RESPONSE_SCHEMA}"
    )


def _strip_markdown_fences(text: str) -> str:
    if text.startswith("```"):
        parts = text.split("```")
        text = parts[1] if len(parts) > 1 else text
        if text.startswith("json"):
            text = text[4:]
    return text.strip()


class LLMGenerator:
    def __init__(self) -> None:
        self._provider = get_llm_provider()

    async def generate(
        self,
        query: str,
        chunks: list,
        machine_name: str,
        conversation_history: list,
        model: str | None = None,
        image_data: str | None = None,
    ) -> dict:
        prompt = _build_prompt(query, chunks, machine_name, conversation_history)

        for attempt in range(2):
            try:
                # Check if provider accepts model and image_data
                import inspect
                sig = inspect.signature(self._provider.generate_json)
                kwargs = {}
                if "model" in sig.parameters:
                    kwargs["model"] = model
                if "image_data" in sig.parameters:
                    kwargs["image_data"] = image_data

                raw = await self._provider.generate_json(prompt, **kwargs)
                return json.loads(_strip_markdown_fences(raw))
            except json.JSONDecodeError as exc:
                logger.warning("generator.json_parse_failed", attempt=attempt, error=str(exc))
                if attempt == 1:
                    return self._fallback_response()
            except Exception as exc:
                logger.error("generator.llm_error", attempt=attempt, error=str(exc))
                if attempt == 1:
                    return self._fallback_response(f"AI provider error: {str(exc)[:100]}")

        return self._fallback_response()

    @staticmethod
    def _fallback_response(reason: str | None = None) -> dict:
        return {
            "answer_type": "insufficient_information",
            "summary": reason or "Unable to parse a structured answer. Please try rephrasing your query.",
            "error_meaning": None,
            "probable_causes": [],
            "corrective_steps": [],
            "citations": [],
            "confidence_level": "LOW",
            "notes": reason or "System encountered an error generating the AI response.",
            "follow_up_suggestions": [
                "Try rephrasing your query",
                "Specify the machine model explicitly",
            ],
        }
