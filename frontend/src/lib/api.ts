import type { Machine, Manual, TroubleshootingResponse, User } from "@/lib/types";

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
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      message = body?.detail ?? body?.message ?? message;
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
  const body = new URLSearchParams({ username: email, password });
  const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail ?? "Login failed");
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

// backend: {success, data: {items: Manual[]}}
export const getManuals = (machineId?: string): Promise<Manual[]> => {
  const qs = machineId ? `?machine_id=${machineId}` : "";
  return apiFetch<{ items: Manual[] }>(`/api/v1/manuals${qs}`).then((d) => d.items);
};

// backend: {success, data: {manual_id, processing_status, progress_pct, ...}}
export const getManualStatus = (manualId: string): Promise<{ processing_status: Manual["processing_status"]; progress_pct?: number }> =>
  apiFetch(`/api/v1/manuals/${manualId}/status`);

// backend: {success, data: TroubleshootingResponse}
export const singleQuery = (
  query: string,
  machineId?: string,
  machineName?: string
): Promise<TroubleshootingResponse> =>
  apiFetch<TroubleshootingResponse>("/api/v1/query", {
    method: "POST",
    body: JSON.stringify({ query, machine_id: machineId, machine_name: machineName }),
  });

// backend: {success, data: {conversation_id, session_id}}
export const createConversation = (): Promise<{ conversation_id: string; session_id: string }> =>
  apiFetch("/api/v1/conversations", { method: "POST", body: JSON.stringify({}) });

// backend: {success, data: TroubleshootingResponse + conversation_id + message_id}
export const sendMessage = (
  conversationId: string,
  query: string,
  machineId?: string
): Promise<TroubleshootingResponse> =>
  apiFetch<TroubleshootingResponse>(`/api/v1/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ query, machine_id: machineId }),
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
    answer_type: string | null;
    confidence_level: string | null;
    evidence_score: number | null;
    total_latency_ms: number | null;
    created_at: string;
  }>;
}> => apiFetch(`/api/v1/conversations/${conversationId}/messages`);
