from __future__ import annotations

import asyncio
import json
import re
from dataclasses import asdict, dataclass, field
from typing import Any, Dict, List, Optional

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

try:
    import pypdf
except ImportError:
    pypdf = None

from app.core.logging import get_logger

logger = get_logger("ingestion.auto_metadata")


@dataclass
class ExtractedMetadata:
    title: str
    machine_name: str
    machine_model: str
    manufacturer: str
    category: str
    manual_type: str  # service | operator | parts | installation | other
    version: Optional[str] = None
    document_number: Optional[str] = None
    language: str = "en"
    page_count: int = 0
    file_size_bytes: int = 0
    detected_error_codes: List[str] = field(default_factory=list)
    key_specifications: Dict[str, Any] = field(default_factory=dict)
    confidence: float = 0.85
    extraction_method: str = "hybrid"  # llm | rules | hybrid

    def to_dict(self) -> dict:
        return asdict(self)


class AutoMetadataExtractor:
    """Extracts rich machine and manual metadata automatically from PDFs using AI and heuristics."""

    def __init__(self, llm_provider=None):
        self._llm = llm_provider

    def _get_llm(self):
        if self._llm is None:
            try:
                from app.services.ai.factory import get_llm_provider
                self._llm = get_llm_provider()
            except Exception as e:
                logger.warning("auto_metadata.llm_unavailable", error=str(e))
                self._llm = None
        return self._llm

    def extract_from_pdf_path(self, pdf_path: str) -> ExtractedMetadata:
        """Synchronous wrapper for extract_from_pdf_path."""
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # If already in an async event loop, run rule-based or nest
                return self._extract_sync_wrapper(pdf_path)
            return loop.run_until_complete(self.aextract_from_pdf_path(pdf_path))
        except Exception:
            return self._extract_sync_wrapper(pdf_path)

    def _extract_sync_wrapper(self, pdf_path: str) -> ExtractedMetadata:
        pages_text, page_count = self._read_pdf_pages(pdf_path)
        full_preview = "\n\n--- PAGE BREAK ---\n\n".join(pages_text)
        rule_meta = self._extract_with_rules(full_preview)
        rule_meta.page_count = page_count
        return rule_meta

    async def aextract_from_pdf_path(self, pdf_path: str) -> ExtractedMetadata:
        """Asynchronously extract metadata from PDF file path."""
        pages_text, page_count = self._read_pdf_pages(pdf_path)
        full_preview = "\n\n--- PAGE BREAK ---\n\n".join(pages_text)
        return await self._aextract(full_preview, page_count)

    async def aextract_from_bytes(self, pdf_bytes: bytes, filename: str = "") -> ExtractedMetadata:
        """Asynchronously extract metadata from PDF bytes."""
        pages_text, page_count = self._read_pdf_bytes(pdf_bytes)
        full_preview = "\n\n--- PAGE BREAK ---\n\n".join(pages_text)
        meta = await self._aextract(full_preview, page_count, default_title=filename)
        meta.file_size_bytes = len(pdf_bytes)
        return meta

    def _read_pdf_pages(self, pdf_path: str) -> tuple[list[str], int]:
        pages_text: list[str] = []
        page_count = 0
        if fitz:
            doc = fitz.open(pdf_path)
            page_count = len(doc)
            scan_pages = min(6, page_count)
            for i in range(scan_pages):
                pages_text.append(doc[i].get_text("text"))
            doc.close()
        elif pypdf:
            with open(pdf_path, "rb") as f:
                reader = pypdf.PdfReader(f)
                page_count = len(reader.pages)
                scan_pages = min(6, page_count)
                for i in range(scan_pages):
                    pages_text.append(reader.pages[i].extract_text() or "")
        return pages_text, page_count

    def _read_pdf_bytes(self, pdf_bytes: bytes) -> tuple[list[str], int]:
        pages_text: list[str] = []
        page_count = 0
        if fitz:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            page_count = len(doc)
            scan_pages = min(6, page_count)
            for i in range(scan_pages):
                pages_text.append(doc[i].get_text("text"))
            doc.close()
        elif pypdf:
            import io
            reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
            page_count = len(reader.pages)
            scan_pages = min(6, page_count)
            for i in range(scan_pages):
                pages_text.append(reader.pages[i].extract_text() or "")
        return pages_text, page_count

    async def _aextract(self, text_sample: str, page_count: int, default_title: str = "") -> ExtractedMetadata:
        rule_meta = self._extract_with_rules(text_sample, default_title)

        llm = self._get_llm()
        if llm:
            try:
                llm_meta = await self._extract_with_llm_async(llm, text_sample, rule_meta)
                if llm_meta:
                    llm_meta.page_count = page_count
                    return llm_meta
            except Exception as e:
                logger.warning("auto_metadata.llm_fallback", error=str(e))

        rule_meta.page_count = page_count
        return rule_meta

    def _extract_with_rules(self, text: str, default_title: str = "") -> ExtractedMetadata:
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        preview = text[:4000]

        # Manufacturer detection
        manufacturer = "Industrial Equipment OEM"
        m_match = re.search(r"(?:Manufacturer|OEM|Brand|Company):\s*([A-Za-z0-9\s,\.\-]+)", preview, re.IGNORECASE)
        if m_match:
            manufacturer = m_match.group(1).split("\n")[0].strip()
        elif "FANUC" in preview.upper():
            manufacturer = "FANUC Corporation"
        elif "BETACORP" in preview.upper():
            manufacturer = "BetaCorp Systems, Inc."
        elif "DELTAWORKS" in preview.upper():
            manufacturer = "DeltaWorks Industries"
        elif "EPSILON" in preview.upper():
            manufacturer = "Epsilon Robotics GmbH"
        elif "GAMMATECH" in preview.upper():
            manufacturer = "GammaTech Industrial Systems"
        elif "HAAS" in preview.upper():
            manufacturer = "Haas Automation"

        # Model detection
        model = "Standard Industrial Model"
        model_match = re.search(r"(?:Model|Series|System):\s*([A-Za-z0-9\s\-_/]+)", preview, re.IGNORECASE)
        if model_match:
            model = model_match.group(1).split("\n")[0].strip()
        elif "BC-500X" in preview:
            model = "BC-500X"
        elif "DX-200" in preview:
            model = "DX-200"
        elif "EP-750" in preview:
            model = "EP-750"
        elif "GX-100" in preview:
            model = "GX-100"
        elif "30i" in preview or "31i" in preview or "32i" in preview:
            model = "Series 30i/31i/32i-B"

        # Clean model string
        if "cnc machining center" in model.lower():
            model = model.split("CNC")[0].strip()

        # Machine Name
        machine_name = f"{manufacturer} {model}"
        if lines and any(kw in lines[0].lower() for kw in ["machine", "cnc", "robot", "press", "controller"]):
            machine_name = lines[0]

        # Document Number
        doc_num = None
        doc_match = re.search(r"(?:Document Number|Doc No|Doc Number|Order No|Manual No|Part No):\s*([A-Za-z0-9\-/_.]+)", preview, re.IGNORECASE)
        if doc_match:
            doc_num = doc_match.group(1).strip()
        else:
            fanuc_doc = re.search(r"\b([BGM]-[0-9]{5}[A-Z]{2}/[0-9]{2})\b", preview)
            if fanuc_doc:
                doc_num = fanuc_doc.group(1)

        # Version / Revision
        version = None
        ver_match = re.search(r"(?:Revision|Rev|Version|Ver\.?|Firmware Version):\s*([A-Za-z0-9\.\-_]+)", preview, re.IGNORECASE)
        if ver_match:
            version = ver_match.group(1).strip()

        # Manual Type
        manual_type = "service"
        lower_preview = preview.lower()
        if "operator" in lower_preview or "user manual" in lower_preview:
            manual_type = "operator"
        elif "parts" in lower_preview or "spare parts" in lower_preview:
            manual_type = "parts"
        elif "installation" in lower_preview or "setup guide" in lower_preview:
            manual_type = "installation"
        elif "maintenance" in lower_preview or "service" in lower_preview or "troubleshooting" in lower_preview:
            manual_type = "service"

        # Category
        category = "CNC Machining"
        if "robot" in lower_preview or "robotic" in lower_preview:
            category = "Industrial Robot"
        elif "press brake" in lower_preview or "hydraulic" in lower_preview:
            category = "Hydraulic & Forming"
        elif "controller" in lower_preview or "cnc control" in lower_preview:
            category = "CNC Controller"

        # Error code pattern scanner
        error_codes = sorted(list(set(re.findall(r"\b(E[0-9]{3,4}|ERR-[A-Z0-9\-]+|ALARM\s*[0-9]{3,4}|F[0-9]{3,4})\b", text))))[:15]

        # Title
        title = default_title or (lines[0] if lines else "Industrial Manual")
        if len(lines) >= 2 and len(lines[0]) < 50:
            title = f"{lines[0]} — {lines[1]}"

        return ExtractedMetadata(
            title=title,
            machine_name=machine_name,
            machine_model=model,
            manufacturer=manufacturer,
            category=category,
            manual_type=manual_type,
            version=version,
            document_number=doc_num,
            detected_error_codes=error_codes,
            confidence=0.82,
            extraction_method="rules",
        )

    async def _extract_with_llm_async(self, llm, text_sample: str, rule_hints: ExtractedMetadata) -> Optional[ExtractedMetadata]:
        prompt = f"""You are an industrial document metadata parser for factory equipment.
Analyze this technical manual text and output ONLY a valid JSON object with the extracted metadata:

Text excerpt:
\"\"\"
{text_sample[:3000]}
\"\"\"

Hints from heuristic scan:
- Title hint: {rule_hints.title}
- Manufacturer hint: {rule_hints.manufacturer}
- Model hint: {rule_hints.machine_model}
- Document number: {rule_hints.document_number}

Respond with ONLY this JSON structure (no markdown, no other text):
{{
  "title": "Exact Title of the Manual",
  "machine_name": "Full Machine Name",
  "machine_model": "Model Identifier",
  "manufacturer": "Company Name",
  "category": "CNC Machining Center | Industrial Robot | Press Brake | CNC Controller",
  "manual_type": "service | operator | parts | installation | other",
  "version": "Rev / Version string or null",
  "document_number": "Publication code or null",
  "detected_error_codes": ["code1", "code2"],
  "confidence": 0.95
}}"""

        response = await llm.generate(prompt)
        raw = response.strip()
        if raw.startswith("```"):
            raw = re.sub(r"^```(?:json)?\n", "", raw)
            raw = re.sub(r"\n```$", "", raw)

        data = json.loads(raw)
        return ExtractedMetadata(
            title=data.get("title") or rule_hints.title,
            machine_name=data.get("machine_name") or rule_hints.machine_name,
            machine_model=data.get("machine_model") or rule_hints.machine_model,
            manufacturer=data.get("manufacturer") or rule_hints.manufacturer,
            category=data.get("category") or rule_hints.category,
            manual_type=data.get("manual_type") or rule_hints.manual_type,
            version=data.get("version") or rule_hints.version,
            document_number=data.get("document_number") or rule_hints.document_number,
            detected_error_codes=data.get("detected_error_codes") or rule_hints.detected_error_codes,
            confidence=float(data.get("confidence", 0.95)),
            extraction_method="llm",
        )
