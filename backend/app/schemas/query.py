from __future__ import annotations

import uuid
from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    query: str = Field(min_length=1, max_length=2000)
    machine_id: Optional[uuid.UUID] = None
    machine_name: Optional[str] = Field(default=None, max_length=255)


class CorrectionStep(BaseModel):
    step_number: int
    action: str
    warning: Optional[str] = None
    citation_ids: List[str] = Field(default_factory=list)


class CitationItem(BaseModel):
    citation_id: str
    chunk_id: uuid.UUID
    manual_name: str
    machine_name: str
    page_start: int
    page_end: int
    section_path: Optional[str] = None
    relevance_score: float
    excerpt: str


class TroubleshootingResponse(BaseModel):
    answer_type: Literal[
        "solution",
        "disambiguation_required",
        "insufficient_information",
        "clarification_needed",
        "error",
    ]
    summary: str
    error_meaning: Optional[str] = None
    probable_causes: List[str] = Field(default_factory=list)
    corrective_steps: List[CorrectionStep] = Field(default_factory=list)
    citations: List[CitationItem] = Field(default_factory=list)
    confidence_level: Optional[Literal["HIGH", "MEDIUM", "LOW"]] = None
    evidence_score: Optional[float] = None
    notes: Optional[str] = None
    follow_up_suggestions: List[str] = Field(default_factory=list)
    disambiguation_options: Optional[List[Dict]] = None
