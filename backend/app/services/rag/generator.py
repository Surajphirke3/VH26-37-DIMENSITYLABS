from __future__ import annotations

import asyncio
import json

import google.generativeai as genai

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("rag.generator")

_SYSTEM_PROMPT = """You are an expert industrial maintenance assistant for MechMind.

HARD RULES:
1. Only answer from the provided context. Never invent procedures, specifications, or error meanings.
2. Every factual claim must cite a source using [N] notation matching the context sections.
3. If context is insufficient, respond with answer_type="insufficient_information" and explain why.
4. Safety warnings from the source must be preserved exactly and marked in corrective_steps.
5. Do not guess. Do not extrapolate beyond what the documents state.
"""

_RESPONSE_SCHEMA = """{
  "answer_type": "solution" | "insufficient_information" | "disambiguation_required",
  "summary": "string",
  "error_meaning": "string or null",
  "probable_causes": ["string"],
  "corrective_steps": [{"step_number": 1, "action": "string", "warning": "string or null", "citation_ids": ["1"]}],
  "citations": [{"id": "1", "chunk_id": "from context"}],
  "confidence_level": "HIGH" | "MEDIUM" | "LOW",
  "notes": "string or null",
  "follow_up_suggestions": ["string"]
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
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(settings.GEMINI_GENERATION_MODEL)

    async def generate(
        self,
        query: str,
        chunks: list,
        machine_name: str,
        conversation_history: list,
    ) -> dict:
        prompt = _build_prompt(query, chunks, machine_name, conversation_history)
        loop = asyncio.get_event_loop()

        for attempt in range(2):
            try:
                response = await loop.run_in_executor(
                    None, lambda: self.model.generate_content(prompt)
                )
                return json.loads(_strip_markdown_fences(response.text))
            except json.JSONDecodeError as exc:
                logger.warning("generator.json_parse_failed", attempt=attempt, error=str(exc))
                if attempt == 1:
                    return self._fallback_response()
            except Exception as exc:
                logger.error("generator.llm_error", error=str(exc))
                raise

        return self._fallback_response()

    @staticmethod
    def _fallback_response() -> dict:
        return {
            "answer_type": "insufficient_information",
            "summary": "Unable to parse a structured answer. Please try rephrasing your query.",
            "error_meaning": None,
            "probable_causes": [],
            "corrective_steps": [],
            "citations": [],
            "confidence_level": "LOW",
            "notes": "System encountered an error parsing the AI response.",
            "follow_up_suggestions": [
                "Try rephrasing your query",
                "Specify the machine model explicitly",
            ],
        }
