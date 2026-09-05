import axios, { AxiosRequestConfig } from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "@/constants/config";
import type {
  User,
  Machine,
  Manual,
  AIModel,
  SystemStatusData,
  SearchResultItem,
  TroubleshootingResponse,
  ManualChunk,
} from "@/lib/types";

const TOKEN_KEY = "mendx_access_token";
const REFRESH_KEY = "mendx_refresh_token";

async function canUseSecureStore(): Promise<boolean> {
  return Platform.OS !== "web" && (await SecureStore.isAvailableAsync());
}

async function getStoredValue(key: string): Promise<string | null> {
  return (await canUseSecureStore())
    ? SecureStore.getItemAsync(key)
    : AsyncStorage.getItem(key);
}

async function setStoredValue(key: string, value: string): Promise<void> {
  if (await canUseSecureStore()) {
    await SecureStore.setItemAsync(key, value);
  } else {
    await AsyncStorage.setItem(key, value);
  }
}

async function deleteStoredValue(key: string): Promise<void> {
  if (await canUseSecureStore()) {
    await SecureStore.deleteItemAsync(key);
  } else {
    await AsyncStorage.removeItem(key);
  }
}

export async function storeTokens(access: string, refresh?: string) {
  await setStoredValue(TOKEN_KEY, access);
  if (refresh) await setStoredValue(REFRESH_KEY, refresh);
}

export async function clearTokens() {
  await deleteStoredValue(TOKEN_KEY);
  await deleteStoredValue(REFRESH_KEY);
}

export async function getAccessToken(): Promise<string | null> {
  return getStoredValue(TOKEN_KEY);
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: string;
  detail?: string;
  message?: string;
}

function parseError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as ApiEnvelope<unknown> | undefined;
    const raw: unknown = body?.error ?? body?.detail ?? body?.message ?? err.message;
    if (typeof raw === "string") return raw;
    if (Array.isArray(raw) && raw[0]?.msg) return raw[0].msg;
    return "Request failed";
  }
  if (err instanceof Error) return err.message;
  return "Request failed";
}

async function apiFetch<T>(
  path: string,
  options: AxiosRequestConfig = {}
): Promise<T> {
  const token = await getAccessToken();
  const isFormData = options.data instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await axios.request<ApiEnvelope<T>>({
      url: `${API_BASE_URL}${path}`,
      ...options,
      headers,
    });

    const envelope = response.data;
    if (envelope && typeof envelope === "object" && "data" in envelope) {
      return envelope.data;
    }
    return envelope as unknown as T;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      await clearTokens();
      throw new Error("Unauthorized");
    }
    throw new Error(parseError(err));
  }
}

async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (res.status === 401) {
      await clearTokens();
      throw new Error("Unauthorized");
    }
    const json = await res.json();
    if (!res.ok) {
      const msg = json?.error ?? json?.detail ?? json?.message ?? `Upload failed (${res.status})`;
      throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
    if (json && typeof json === "object" && "data" in json) {
      return json.data;
    }
    return json as unknown as T;
  } catch (err: unknown) {
    if (err instanceof Error) throw err;
    throw new Error("Upload failed. Please check network connection.");
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<void> {
  try {
    const response = await axios.post<{
      access_token: string;
      refresh_token?: string;
    }>(`${API_BASE_URL}/api/v1/auth/login`, { email, password }, {
      headers: { "Content-Type": "application/json" },
    });
    await storeTokens(response.data.access_token, response.data.refresh_token);
  } catch (err: unknown) {
    throw new Error(parseError(err) || "Login failed. Please check your credentials.");
  }
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/api/v1/auth/logout", { method: "POST" });
  } finally {
    await clearTokens();
  }
}

export async function getMe(): Promise<User> {
  return apiFetch<User>("/api/v1/auth/me");
}

export async function getUsers(): Promise<User[]> {
  return apiFetch<User[]>("/api/v1/auth/users");
}

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

export async function extractManualMetadata(file: {
  uri: string;
  name: string;
  type: string;
}): Promise<ExtractedManualMetadata> {
  const formData = new FormData();
  formData.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as unknown as Blob);
  return apiUpload<ExtractedManualMetadata>("/api/v1/manuals/extract-metadata", formData);
}

// ─── Machines ─────────────────────────────────────────────────────────────────

export async function getMachines(): Promise<Machine[]> {
  const data = await apiFetch<{ items: Machine[] }>("/api/v1/machines");
  return data.items ?? [];
}

export async function createMachine(body: {
  name: string;
  model?: string;
  manufacturer?: string;
  category?: string;
  description?: string;
}): Promise<{ id: string; name: string }> {
  return apiFetch("/api/v1/machines", { method: "POST", data: body });
}

export async function deactivateMachine(machineId: string): Promise<void> {
  await apiFetch(`/api/v1/machines/${machineId}`, { method: "DELETE" });
}

// ─── Manuals ──────────────────────────────────────────────────────────────────

export interface UploadManualParams {
  file: { uri: string; name: string; type: string };
  title?: string;
  machine_id?: string;
  manual_type?: string;
  version?: string;
  language?: string;
}

export async function uploadManual(
  params: UploadManualParams
): Promise<{ manual_id: string; ingestion_job_id: string; status: string }> {
  const formData = new FormData();
  formData.append("file", {
    uri: params.file.uri,
    name: params.file.name,
    type: params.file.type,
  } as unknown as Blob);
  if (params.title) formData.append("title", params.title);
  if (params.machine_id) formData.append("machine_id", params.machine_id);
  if (params.manual_type) formData.append("manual_type", params.manual_type);
  if (params.version) formData.append("version", params.version);
  if (params.language) formData.append("language", params.language);
  return apiUpload("/api/v1/manuals/upload", formData);
}

export async function getManuals(machineId?: string): Promise<Manual[]> {
  const qs = machineId ? `?machine_id=${machineId}` : "";
  const data = await apiFetch<{ items: Manual[] }>(`/api/v1/manuals${qs}`);
  return data.items ?? [];
}

export async function getManualDetail(
  manualId: string
): Promise<Manual & { machine?: Machine }> {
  return apiFetch(`/api/v1/manuals/${manualId}`);
}

export async function getManualChunks(
  manualId: string,
  page = 1,
  pageSize = 50,
  search?: string
): Promise<{
  manual_id: string;
  total_chunks: number;
  page: number;
  page_size: number;
  chunks: ManualChunk[];
}> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  if (search) params.append("search", search);
  return apiFetch(`/api/v1/manuals/${manualId}/chunks?${params.toString()}`);
}

export async function reprocessManual(
  manualId: string
): Promise<{ manual_id: string; ingestion_job_id: string; status: string }> {
  return apiFetch(`/api/v1/manuals/${manualId}/reprocess`, { method: "POST" });
}

export async function getManualStatus(manualId: string): Promise<{
  processing_status: Manual["processing_status"];
  progress_pct?: number;
  error_message?: string;
  pages_processed?: number;
  chunks_created?: number;
}> {
  return apiFetch(`/api/v1/manuals/${manualId}/status`);
}

export async function deleteManual(manualId: string): Promise<void> {
  await apiFetch(`/api/v1/manuals/${manualId}`, { method: "DELETE" });
}

// ─── Models ───────────────────────────────────────────────────────────────────

export async function getModels(): Promise<{
  models: AIModel[];
  default_model: string;
  task_routing: Record<string, string>;
}> {
  return apiFetch("/api/v1/models");
}

export async function getActiveModel(): Promise<{
  active_model: string;
  provider: string;
}> {
  return apiFetch("/api/v1/models/active");
}

// ─── System ───────────────────────────────────────────────────────────────────

export async function getSystemStatus(): Promise<SystemStatusData> {
  return apiFetch<SystemStatusData>("/api/v1/system/status");
}

// ─── Search & Query ───────────────────────────────────────────────────────────

export async function searchKnowledgeBase(
  query: string,
  machineId?: string,
  topK = 10,
  minSimilarity = 0.0
): Promise<{ query: string; total: number; items: SearchResultItem[] }> {
  const params = new URLSearchParams({
    query,
    top_k: String(topK),
    min_similarity: String(minSimilarity),
  });
  if (machineId) params.append("machine_id", machineId);
  return apiFetch(`/api/v1/search?${params.toString()}`);
}

export async function singleQuery(
  query: string,
  machineId?: string,
  machineName?: string,
  model?: string,
  imageData?: string
): Promise<TroubleshootingResponse> {
  return apiFetch<TroubleshootingResponse>("/api/v1/query", {
    method: "POST",
    data: {
      query,
      machine_id: machineId,
      machine_name: machineName,
      model,
      image_data: imageData,
    },
  });
}

// ─── Conversations ────────────────────────────────────────────────────────────

export interface ConversationItem {
  id: string;
  conversation_id: string;
  title: string;
  machine_id: string | null;
  machine_name?: string | null;
  created_at: string;
  updated_at: string;
}

export async function createConversation(): Promise<{
  conversation_id: string;
  session_id: string;
}> {
  return apiFetch("/api/v1/conversations", { method: "POST", data: {} });
}

export async function listConversations(): Promise<ConversationItem[]> {
  const res = await apiFetch<ConversationItem[]>("/api/v1/conversations");
  return Array.isArray(res) ? res : [];
}

export async function deleteConversation(conversationId: string): Promise<void> {
  await apiFetch(`/api/v1/conversations/${conversationId}`, { method: "DELETE" });
}

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  response?: TroubleshootingResponse | null;
  answer_type: string | null;
  confidence_level: string | null;
  evidence_score: number | null;
  total_latency_ms: number | null;
  created_at: string;
}

export async function getConversationMessages(conversationId: string): Promise<{
  conversation_id: string;
  machine_id: string | null;
  title: string | null;
  messages: ConversationMessage[];
}> {
  return apiFetch(`/api/v1/conversations/${conversationId}/messages`);
}

export async function sendMessage(
  conversationId: string,
  query: string,
  machineId?: string,
  model?: string,
  imageData?: string
): Promise<TroubleshootingResponse> {
  return apiFetch<TroubleshootingResponse>(
    `/api/v1/conversations/${conversationId}/messages`,
    {
      method: "POST",
      data: {
        query,
        machine_id: machineId,
        model,
        image_data: imageData,
      },
    }
  );
}

export async function disambiguate(
  conversationId: string,
  machineId: string,
  machineName?: string
): Promise<TroubleshootingResponse> {
  return apiFetch<TroubleshootingResponse>(
    `/api/v1/conversations/${conversationId}/disambiguate`,
    {
      method: "POST",
      data: { machine_id: machineId, machine_name: machineName ?? "" },
    }
  );
}
