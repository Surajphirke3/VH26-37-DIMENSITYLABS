import type {
  Machine,
  Manual,
  TroubleshootingResponse,
  User,
  AIModel,
  SystemStatusData,
  ManualChunk,
  SearchResultItem,
} from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      const isPublicPage = [
        "/",
        "/problem",
        "/models",
        "/architecture",
        "/workflow",
        "/help",
        "/inspector",
        "/demo",
      ].some(
        (p) => window.location.pathname === p || window.location.pathname.startsWith("/models") || window.location.pathname.startsWith("/inspector") || window.location.pathname.startsWith("/demo")
      );
      if (!isPublicPage && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      message = body?.error ?? body?.detail ?? body?.message ?? message;
      if (typeof message !== "string") {
        message = JSON.stringify(message);
      }
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }

  const json = await res.json();
  // All backend endpoints return {success, data: T} — unwrap here
  if (json && typeof json === "object" && "data" in json) return json.data as T;
  return json as T;
}

export async function login(email: string, password: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    let msg = "Login failed. Please check your credentials.";
    const rawMsg = err?.error ?? err?.detail ?? err?.message;
    if (typeof rawMsg === "string") {
      msg = rawMsg;
    } else if (Array.isArray(rawMsg) && rawMsg[0]?.msg) {
      msg = rawMsg[0].msg;
    }
    throw new Error(msg);
  }
  const data = await res.json();
  localStorage.setItem("access_token", data.access_token);
  if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);
}

export function logout(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export const getMe = (): Promise<User> => apiFetch<User>("/api/v1/auth/me");

// backend: {success, data: {items: Machine[]}}
export const getMachines = (): Promise<Machine[]> =>
  apiFetch<{ items: Machine[] }>("/api/v1/machines").then((d) => d.items);

export const createMachine = (body: {
  name: string;
  model?: string;
  manufacturer?: string;
  category?: string;
  description?: string;
}): Promise<{ id: string; name: string }> =>
  apiFetch("/api/v1/machines", { method: "POST", body: JSON.stringify(body) });

export const deactivateMachine = (machineId: string): Promise<void> =>
  apiFetch(`/api/v1/machines/${machineId}`, { method: "DELETE" });

// backend: {success, data: {manual_id, ingestion_job_id, status}}
export const uploadManual = (formData: FormData): Promise<{ manual_id: string; ingestion_job_id: string; status: string }> =>
  apiFetch("/api/v1/manuals/upload", { method: "POST", body: formData });

export interface ExtractedManualMetadata {
  title: string;
  machine_name: string;
  machine_model: string;
  manufacturer: string;
  category: string;
  manual_type: string;
  version?: string;
  document_number?: string;
  page_count: number;
  detected_error_codes: string[];
  suggested_machine_id?: string;
  suggested_machine_name?: string;
  confidence: number;
  extraction_method: string;
}

export const extractManualMetadata = (file: File): Promise<ExtractedManualMetadata> => {
  const fd = new FormData();
  fd.append("file", file);
  return apiFetch<ExtractedManualMetadata>("/api/v1/manuals/extract-metadata", {
    method: "POST",
    body: fd,
  });
};

// backend: {success, data: {items: Manual[]}}
export const getManuals = (machineId?: string): Promise<Manual[]> => {
  const qs = machineId ? `?machine_id=${machineId}` : "";
  return apiFetch<{ items: Manual[] }>(`/api/v1/manuals${qs}`).then((d) => d.items);
};

export const getManualDetail = (manualId: string): Promise<Manual & { machine?: Machine }> =>
  apiFetch<Manual & { machine?: Machine }>(`/api/v1/manuals/${manualId}`);

export const getManualChunks = (
  manualId: string,
  page: number = 1,
  pageSize: number = 50,
  search?: string
): Promise<{ manual_id: string; total_chunks: number; page: number; page_size: number; chunks: ManualChunk[] }> => {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (search) params.append("search", search);
  return apiFetch(`/api/v1/manuals/${manualId}/chunks?${params.toString()}`);
};

export const reprocessManual = (manualId: string): Promise<{ manual_id: string; ingestion_job_id: string; status: string }> =>
  apiFetch(`/api/v1/manuals/${manualId}/reprocess`, { method: "POST" });

// backend: {success, data: {manual_id, processing_status, progress_pct, ...}}
export const getManualStatus = (manualId: string): Promise<{ processing_status: Manual["processing_status"]; progress_pct?: number; error_message?: string; pages_processed?: number; chunks_created?: number }> =>
  apiFetch(`/api/v1/manuals/${manualId}/status`);

export const deleteManual = (manualId: string): Promise<void> =>
  apiFetch(`/api/v1/manuals/${manualId}`, { method: "DELETE" });

// backend: {success, data: {models: AIModel[], default_model: string, task_routing: Record<string, string>}}
export const getModels = (): Promise<{ models: AIModel[]; default_model: string; task_routing: Record<string, string> }> =>
  apiFetch("/api/v1/models");

export const getActiveModel = (): Promise<{ active_model: string; provider: string }> =>
  apiFetch("/api/v1/models/active");

// backend: {success, data: SystemStatusData}
export const getSystemStatus = (): Promise<SystemStatusData> =>
  apiFetch<SystemStatusData>("/api/v1/system/status");

// backend: {success, data: any}
export const getSystemConfig = (): Promise<any> =>
  apiFetch("/api/v1/system/config");

// backend: {success, data: {query, total, items: SearchResultItem[]}}
export const searchKnowledgeBase = (
  query: string,
  machineId?: string,
  topK: number = 10,
  minSimilarity: number = 0.0
): Promise<{ query: string; total: number; items: SearchResultItem[] }> => {
  const params = new URLSearchParams({ query, top_k: String(topK), min_similarity: String(minSimilarity) });
  if (machineId) params.append("machine_id", machineId);
  return apiFetch(`/api/v1/search?${params.toString()}`);
};

// backend: {success, data: TroubleshootingResponse}
export const singleQuery = (
  query: string,
  machineId?: string,
  machineName?: string,
  model?: string,
  imageData?: string
): Promise<TroubleshootingResponse> =>
  apiFetch<TroubleshootingResponse>("/api/v1/query", {
    method: "POST",
    body: JSON.stringify({
      query,
      machine_id: machineId,
      machine_name: machineName,
      model,
      image_data: imageData,
    }),
  });

// backend: {success, data: {conversation_id, session_id}}
export const createConversation = (): Promise<{ conversation_id: string; session_id: string }> =>
  apiFetch("/api/v1/conversations", { method: "POST", body: JSON.stringify({}) });

export interface ConversationItem {
  id: string;
  conversation_id: string;
  title: string;
  machine_id: string | null;
  created_at: string;
  updated_at: string;
}

export const listConversations = async (): Promise<ConversationItem[]> => {
  const res = await apiFetch<{ success: boolean; data: ConversationItem[] }>("/api/v1/conversations");
  return Array.isArray(res) ? res : res?.data ?? [];
};

export const deleteConversation = (conversationId: string): Promise<{ success: boolean; data: { deleted: string } }> =>
  apiFetch(`/api/v1/conversations/${conversationId}`, { method: "DELETE" });

// backend: {success, data: TroubleshootingResponse + conversation_id + message_id}
export const sendMessage = (
  conversationId: string,
  query: string,
  machineId?: string,
  model?: string,
  imageData?: string
): Promise<TroubleshootingResponse> =>
  apiFetch<TroubleshootingResponse>(`/api/v1/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      query,
      machine_id: machineId,
      model,
      image_data: imageData,
    }),
  });

// backend: {success, data: {message, machine_id}} — returns no answer, caller ignores body
export const disambiguate = (
  conversationId: string,
  machineId: string
): Promise<TroubleshootingResponse> =>
  apiFetch<TroubleshootingResponse>(`/api/v1/conversations/${conversationId}/disambiguate`, {
    method: "POST",
    body: JSON.stringify({ machine_id: machineId }),
  });

// backend: {success, data: {conversation_id, machine_id, title, messages: [...]}}
export const getConversationMessages = (conversationId: string): Promise<{
  conversation_id: string;
  machine_id: string | null;
  title: string | null;
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    response?: TroubleshootingResponse | null;
    answer_type: string | null;
    confidence_level: string | null;
    evidence_score: number | null;
    total_latency_ms: number | null;
    created_at: string;
  }>;
}> => apiFetch(`/api/v1/conversations/${conversationId}/messages`);

