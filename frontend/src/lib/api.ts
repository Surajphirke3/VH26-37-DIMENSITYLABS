import type { Machine, Manual, TroubleshootingResponse, User } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
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

  return res.json() as Promise<T>;
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

export const getMachines = (): Promise<Machine[]> => apiFetch<Machine[]>("/api/v1/machines");

export const uploadManual = (formData: FormData): Promise<Manual> =>
  apiFetch<Manual>("/api/v1/manuals/upload", { method: "POST", body: formData });

export const getManuals = (machineId?: string): Promise<Manual[]> => {
  const qs = machineId ? `?machine_id=${machineId}` : "";
  return apiFetch<Manual[]>(`/api/v1/manuals${qs}`);
};

export const getManualStatus = (manualId: string): Promise<Manual> =>
  apiFetch<Manual>(`/api/v1/manuals/${manualId}/status`);

export const singleQuery = (
  query: string,
  machineId?: string,
  machineName?: string
): Promise<TroubleshootingResponse> =>
  apiFetch<TroubleshootingResponse>("/api/v1/query", {
    method: "POST",
    body: JSON.stringify({ query, machine_id: machineId, machine_name: machineName }),
  });

export const createConversation = (): Promise<{ id: string }> =>
  apiFetch<{ id: string }>("/api/v1/conversations", { method: "POST", body: JSON.stringify({}) });

export const sendMessage = (
  conversationId: string,
  query: string,
  machineId?: string
): Promise<TroubleshootingResponse> =>
  apiFetch<TroubleshootingResponse>(`/api/v1/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ query, machine_id: machineId }),
  });

export const disambiguate = (
  conversationId: string,
  machineId: string
): Promise<TroubleshootingResponse> =>
  apiFetch<TroubleshootingResponse>(`/api/v1/conversations/${conversationId}/disambiguate`, {
    method: "POST",
    body: JSON.stringify({ machine_id: machineId }),
  });
