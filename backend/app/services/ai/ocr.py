from __future__ import annotations

import base64
import json
import re
from typing import Any

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("ai.ocr")

# Regex to identify industrial error codes (e.g. Alarm 102, F01043, F004, E101, ERR-02)
ERROR_CODE_REGEX = re.compile(
    r"\b(?:ALARM|FAULT|ERR|ERROR|CODE)?\s*([A-Z]{0,3}[-_]?\d{2,6}[A-Z]?)\b",
    re.IGNORECASE,
)

MACHINE_BRAND_KEYWORDS = [
    "siemens", "sinamics", "haas", "allen-bradley", "powerflex", 
    "gsk", "parker", "dorner", "fanuc", "mitsubishi", "yaskawa", "abb"
]


def _clean_base64_data_url(image_data: str) -> tuple[str, str, bytes]:
    """Parse a data URL or raw base64 string into (mime_type, data_url, raw_bytes)."""
    mime_type = "image/jpeg"
    b64_str = image_data
    if image_data.startswith("data:"):
        header, _, b64_str = image_data.partition(",")
        if ";" in header:
            mime_type = header.split(";")[0].replace("data:", "").strip()

    raw_bytes = base64.b64decode(b64_str)
    data_url = f"data:{mime_type};base64,{b64_str}" if not image_data.startswith("data:") else image_data
    return mime_type, data_url, raw_bytes


async def extract_visual_fault_data(image_data: str) -> dict[str, Any]:
    """
    Extracts visible text, error codes, and machine branding from an uploaded equipment photo.
    Uses Google Gemini Vision (gemini-2.5-flash) for instant high-resolution OCR, with
    regex post-processing for industrial fault codes.
    
    Returns:
        {
            "error_code": str | None,
            "machine_brand": str | None,
            "extracted_text": str,
            "summary": str
        }
    """
    if not image_data or len(image_data) < 50:
        return {"error_code": None, "machine_brand": None, "extracted_text": "", "summary": ""}

    try:
        mime_type, data_url, raw_bytes = _clean_base64_data_url(image_data)
    except Exception as exc:
        logger.warning("ocr.invalid_base64", error=str(exc))
        return {"error_code": None, "machine_brand": None, "extracted_text": "", "summary": ""}

    result = {
        "error_code": None,
        "machine_brand": None,
        "extracted_text": "",
        "summary": "",
    }

    # ── Strategy 1: Google Gemini Vision (gemini-2.5-flash) ────────────
    gemini_key = (settings.GEMINI_API_KEY or "").strip()
    if gemini_key and gemini_key not in ("placeholder", ""):
        try:
            import google.generativeai as genai

            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel("gemini-2.5-flash")
            prompt = (
                "You are an industrial Optical Character Recognition (OCR) scanner for factory automation.\n"
                "Carefully inspect this image of an industrial machine, screen, alarm indicator, or nameplate.\n"
                "1. Extract the EXACT fault or error code (e.g. 'Alarm 102', '102', 'F01043', 'F004', 'E-01', 'F07801').\n"
                "2. Identify the machine manufacturer/brand (e.g. 'Haas', 'Siemens SINAMICS S120', 'Allen-Bradley PowerFlex 755', 'GSK', 'Parker', 'Dorner').\n"
                "3. Transcribe all verbatim text visible on the panel or display.\n"
                "4. Provide a brief 1-sentence diagnostic summary.\n\n"
                "Return ONLY a JSON object with this structure:\n"
                "{\n"
                '  "error_code": "exact alphanumeric fault code or null",\n'
                '  "machine_brand": "exact brand/model name or null",\n'
                '  "extracted_text": "all visible text transcribed verbatim",\n'
                '  "summary": "one sentence operational description"\n'
                "}"
            )

            image_part = {"mime_type": mime_type, "data": raw_bytes}
            res = await model.generate_content_async([prompt, image_part])
            raw_text = res.text or ""
            match = re.search(r"\{.*\}", raw_text, re.DOTALL)
            if match:
                parsed = json.loads(match.group(0))
                result["error_code"] = parsed.get("error_code") or None
                result["machine_brand"] = parsed.get("machine_brand") or None
                result["extracted_text"] = parsed.get("extracted_text") or ""
                result["summary"] = parsed.get("summary") or "Optical inspection complete."
                logger.info(
                    "ocr.gemini_vision_success",
                    error_code=result["error_code"],
                    brand=result["machine_brand"],
                )
        except Exception as exc:
            logger.warning("ocr.gemini_vision_failed", error=str(exc))

    # ── Strategy 2: Groq Vision Fallback ──────────────────────────────
    if not result["extracted_text"]:
        groq_key = (settings.GROQ_API_KEY or "").strip()
        if groq_key and groq_key not in ("placeholder", ""):
            try:
                from groq import AsyncGroq

                client = AsyncGroq(api_key=groq_key)
                prompt = (
                    "Inspect this industrial machine photo or screen. Extract exact error codes and machine names.\n"
                    "Output JSON: {\"error_code\": null, \"machine_brand\": null, \"extracted_text\": \"\", \"summary\": \"\"}"
                )
                resp = await client.chat.completions.create(
                    model="openai/gpt-oss-120b",
                    messages=[
                        {
                            "role": "user",
                            "content": prompt,
                        }
                    ],
                    temperature=0.1,
                    max_tokens=400,
                )
                raw_content = resp.choices[0].message.content or "{}"
                match = re.search(r"\{.*\}", raw_content, re.DOTALL)
                if match:
                    parsed = json.loads(match.group(0))
                    result["error_code"] = parsed.get("error_code") or None
                    result["machine_brand"] = parsed.get("machine_brand") or None
                    result["extracted_text"] = parsed.get("extracted_text") or ""
                    result["summary"] = parsed.get("summary") or ""
            except Exception as exc:
                logger.debug("ocr.groq_fallback_skipped", error=str(exc))

    # ── Post-processing: Regex extraction if error_code was not tagged ──
    text = result["extracted_text"] or ""
    if not result["error_code"] and text:
        # Search for common error patterns in the verbatim text
        # e.g. "Alarm 102", "Fault F01043", "Error 204", "F004", "E101"
        code_match = re.search(r"\b(?:ALARM|FAULT|ERR|ERROR|CODE)?\s*([A-Z]{0,2}[-_]?\d{2,6}[A-Z]?)\b", text, re.IGNORECASE)
        if code_match:
            candidate = code_match.group(1).strip()
            # Avoid matching standard 4-digit years like 2024, 2025, 2026
            if candidate not in ("2023", "2024", "2025", "2026"):
                result["error_code"] = candidate

    # Infer machine brand from text if missing
    if not result["machine_brand"] and text:
        text_lower = text.lower()
        for kw in MACHINE_BRAND_KEYWORDS:
            if kw in text_lower:
                result["machine_brand"] = kw.upper()
                break

    return result

