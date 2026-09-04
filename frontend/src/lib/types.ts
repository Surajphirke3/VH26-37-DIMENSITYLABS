export interface User {
  id: string;
  email: string;
  role: "admin" | "manager" | "technician";
  full_name: string;
  is_active: boolean;
}

export interface Machine {
  id: string;
  name: string;
  model?: string;
  manufacturer?: string;
  category?: string;
}

export interface Manual {
  id: string;
  title: string;
  machine_id: string;
  processing_status: "pending" | "processing" | "completed" | "failed";
  original_filename: string;
  created_at: string;
}

export interface CorrectionStep {
  step_number: number;
  action: string;
  warning?: string;
  citation_ids: string[];
}

export interface Citation {
  citation_id: string;
  chunk_id: string;
  manual_name: string;
  machine_name: string;
  page_start: number;
  page_end: number;
  section_path?: string;
  relevance_score: number;
  excerpt: string;
}

export interface DisambiguationOption {
  machine_id: string;
  machine_name: string;
  snippet: string;
}

export interface TroubleshootingResponse {
  answer_type:
    | "solution"
    | "disambiguation_required"
    | "insufficient_information"
    | "clarification_needed"
    | "error";
  summary: string;
  error_meaning?: string;
  probable_causes: string[];
  corrective_steps: CorrectionStep[];
  citations: Citation[];
  confidence_level?: "HIGH" | "MEDIUM" | "LOW";
  evidence_score?: number;
  notes?: string;
  follow_up_suggestions: string[];
  disambiguation_options?: DisambiguationOption[];
  retrieval_latency_ms?: number;
  total_latency_ms?: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  response?: TroubleshootingResponse;
  timestamp: string;
}
