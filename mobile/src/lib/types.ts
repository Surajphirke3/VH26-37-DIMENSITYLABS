export interface User {
  id: string;
  email: string;
  role: "admin" | "manager" | "technician";
  full_name: string | null;
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
  machine_id?: string | null;
  machine_name?: string | null;
  processing_status: "pending" | "processing" | "completed" | "failed" | "reprocessing";
  manual_type?: string;
  version?: string | null;
  language?: string;
  original_filename: string;
  file_size_bytes?: number | null;
  page_count?: number | null;
  chunk_count?: number;
  created_at: string;
  processing_error?: string | null;
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
  manual_id?: string;
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
  message_id?: string;
  answer_type:
    | "solution"
    | "disambiguation_required"
    | "insufficient_information"
    | "clarification_needed"
    | "out_of_scope"
    | "error";
  summary: string;
  answer?: string;
  error_meaning?: string;
  probable_causes: string[];
  corrective_steps: CorrectionStep[];
  citations: Citation[];
  confidence_level?: "HIGH" | "MEDIUM" | "LOW";
  evidence_score?: number;
  notes?: string;
  follow_up_suggestions: string[];
  disambiguation_options?: DisambiguationOption[];
  model_used?: string;
  model?: string;
  retrieval_latency_ms?: number;
  llm_latency_ms?: number;
  total_latency_ms?: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image_data?: string;
  model?: string;
  response?: TroubleshootingResponse;
  timestamp: string;
}

export interface AIModel {
  id: string;
  name: string;
  type: string;
  speed: string;
  max_tokens?: number;
  description?: string;
  context_window?: number;
  recommended_for?: string;
  supports_vision?: boolean;
  provider: string;
}

export interface SystemStatusData {
  chromadb: {
    status: string;
    collection: string;
    metric: string;
    vector_count: number;
    latency_ms: number;
  };
  database: {
    status: string;
    latency_ms?: number;
    error?: string;
  };
  redis: {
    status: string;
    latency_ms?: number;
    detail?: string;
  };
  groq: {
    status: string;
    default_model: string;
    models_available: number;
  };
  runtime: {
    app_name: string;
    version: string;
    environment: string;
    python_version: string;
    os: string;
    uptime_seconds: number;
  };
}

export interface ManualChunk {
  id: string;
  chunk_index: number;
  chunk_type: string;
  content: string;
  content_tokens?: number;
  page_start?: number;
  page_end?: number;
  section_path?: string;
  error_codes_present: string[];
}

export interface SearchResultItem {
  chunk_id: string;
  manual_id: string;
  manual_title: string;
  machine_id?: string | null;
  machine_name?: string | null;
  page_start: number;
  page_end: number;
  section_path?: string | null;
  similarity_score: number;
  excerpt: string;
}
