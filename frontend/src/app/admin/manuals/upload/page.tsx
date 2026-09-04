"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  getMachines,
  uploadManual,
  getManualStatus,
  extractManualMetadata,
  type ExtractedManualMetadata,
} from "@/lib/api";
import type { Machine } from "@/lib/types";
import Spinner from "@/components/ui/Spinner";

interface UploadResult {
  manual_id: string;
  ingestion_job_id: string;
  status: string;
}
type PollStatus = "pending" | "processing" | "completed" | "failed";

const MANUAL_TYPES = ["operator", "service", "parts", "installation", "other"];

export default function UploadManualPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [machineId, setMachineId] = useState("");
  const [title, setTitle] = useState("");
  const [manualType, setManualType] = useState("service");
  const [version, setVersion] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [autoMeta, setAutoMeta] = useState<ExtractedManualMetadata | null>(null);
  const [error, setError] = useState("");
  const [queued, setQueued] = useState<
    (UploadResult & { title: string; filename: string }) | null
  >(null);
  const [pollStatus, setPollStatus] = useState<PollStatus | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) router.replace("/dashboard");
  }, [user, isLoading, router]);

  useEffect(() => {
    getMachines().then(setMachines).catch(console.error);
  }, []);

  useEffect(() => {
    if (!queued || pollStatus === "completed" || pollStatus === "failed") return;
    const timer = setInterval(async () => {
      try {
        const updated = await getManualStatus(queued.manual_id);
        setPollStatus(updated.processing_status as PollStatus);
        if (
          updated.processing_status === "completed" ||
          updated.processing_status === "failed"
        ) {
          clearInterval(timer);
        }
      } catch {
        clearInterval(timer);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [queued, pollStatus]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setAutoMeta(null);
    if (!selected || !selected.name.toLowerCase().endsWith(".pdf")) return;
    setAnalyzing(true);
    setError("");
    try {
      const extracted = await extractManualMetadata(selected);
      setAutoMeta(extracted);
      if (extracted.title && !title) setTitle(extracted.title);
      if (extracted.version && !version) setVersion(extracted.version);
      if (extracted.manual_type) setManualType(extracted.manual_type);
      if (extracted.suggested_machine_id) {
        setMachineId(extracted.suggested_machine_id);
      } else if (machines.length > 0) {
        const matched = machines.find(
          (m) =>
            m.model?.toLowerCase().includes(extracted.machine_model.toLowerCase()) ||
            m.name.toLowerCase().includes(extracted.machine_name.toLowerCase())
        );
        if (matched) setMachineId(matched.id);
      }
    } catch (err: unknown) {
      console.warn("Auto-metadata extraction notice:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      setError("Please provide a PDF file and title.");
      return;
    }
    if (!file.name.endsWith(".pdf")) {
      setError("Only PDF files are accepted.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (machineId) fd.append("machine_id", machineId);
      fd.append("title", title);
      fd.append("manual_type", manualType);
      if (version) fd.append("version", version);
      fd.append("auto_detect_metadata", "true");
      const result = await uploadManual(fd);
      setQueued({ ...result, title, filename: file.name });
      setPollStatus("pending");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#08090c" }}>
      <Spinner size="lg" />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#08090c" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 px-6 py-4 flex items-center gap-3"
        style={{
          background: "rgba(15,17,23,0.95)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(20px)",
        }}
      >
        <button
          onClick={() => router.push("/admin")}
          className="p-2 rounded-xl transition-all hover:scale-110"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            color: "#475569",
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-lg opacity-50"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", filter: "blur(8px)" }}
            />
            <img src="/mend-x.png" alt="MEND - X" className="relative w-8 h-8 rounded-lg object-contain" />
          </div>
          <div>
            <h1
              className="text-base font-black"
              style={{
                background: "linear-gradient(135deg, #a5b4fc, #c4b5fd)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Upload Manual
            </h1>
            <p className="text-[10px]" style={{ color: "#475569" }}>
              MEND - X Knowledge Ingestion
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-6 py-8">
        {queued ? (
          /* ── Success / Processing State ── */
          <div
            className="rounded-2xl p-8 space-y-5 text-center animate-scale-in"
            style={{
              background: "rgba(15,17,23,0.9)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {/* Status Icon */}
            <div className="flex justify-center">
              {pollStatus === "completed" ? (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center animate-pulse-ai"
                  style={{
                    background: "rgba(16,185,129,0.1)",
                    border: "2px solid rgba(16,185,129,0.4)",
                  }}
                >
                  <svg className="w-10 h-10" fill="none" stroke="#10b981" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : pollStatus === "failed" ? (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "2px solid rgba(239,68,68,0.4)",
                  }}
                >
                  <svg className="w-10 h-10" fill="none" stroke="#ef4444" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center animate-pulse-glow"
                  style={{
                    background: "rgba(99,102,241,0.1)",
                    border: "2px solid rgba(99,102,241,0.4)",
                  }}
                >
                  <Spinner size="md" />
                </div>
              )}
            </div>

            <div>
              <p
                className="text-lg font-bold"
                style={{
                  color: pollStatus === "completed" ? "#6ee7b7" : pollStatus === "failed" ? "#fca5a5" : "#a5b4fc",
                }}
              >
                {pollStatus === "completed"
                  ? "Manual Indexed Successfully!"
                  : pollStatus === "failed"
                  ? "Processing Failed"
                  : "Processing Manual…"}
              </p>
              <p className="text-sm mt-1" style={{ color: "#475569" }}>
                {queued.title}
              </p>
              <p className="font-mono text-xs mt-0.5" style={{ color: "#334155" }}>
                {queued.filename}
              </p>
            </div>

            {/* Status pill */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={
                pollStatus === "completed"
                  ? { background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#6ee7b7" }
                  : pollStatus === "failed"
                  ? { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }
                  : { background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#fcd34d" }
              }
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: pollStatus === "completed" ? "#10b981" : pollStatus === "failed" ? "#ef4444" : "#f59e0b",
                  animation: pollStatus !== "completed" && pollStatus !== "failed" ? "statusBlink 1.5s ease infinite" : "none",
                }}
              />
              {pollStatus === "completed"
                ? "Indexed — manual is ready for queries"
                : pollStatus === "failed"
                ? "Processing failed. Contact system admin."
                : "Extracting and indexing content…"}
            </div>

            <button
              onClick={() => {
                setQueued(null);
                setPollStatus(null);
                setFile(null);
                setTitle("");
                setVersion("");
                setAutoMeta(null);
              }}
              className="text-sm font-medium transition-all hover:scale-105"
              style={{ color: "#6366f1" }}
            >
              ← Upload another manual
            </button>
          </div>
        ) : (
          /* ── Upload Form ── */
          <div
            className="rounded-2xl p-6 animate-slide-up"
            style={{
              background: "rgba(15,17,23,0.9)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {error && (
              <div
                className="mb-5 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-fade-in"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#fca5a5",
                }}
              >
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* File Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#64748b" }}>
                  Technical Manual (PDF) <span style={{ color: "#6366f1" }}>*</span>
                </label>
                <div
                  className="relative rounded-xl overflow-hidden transition-all"
                  style={{
                    border: file ? "1px solid rgba(99,102,241,0.4)" : "1px dashed rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    required
                    onChange={handleFileChange}
                    className="w-full px-4 py-5 text-sm cursor-pointer"
                    style={{
                      color: "#94a3b8",
                    }}
                  />
                  {!file && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <svg className="w-8 h-8 mb-2" fill="none" stroke="#334155" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-xs font-medium" style={{ color: "#334155" }}>Drop PDF or click to browse</p>
                    </div>
                  )}
                  {file && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 pointer-events-none">
                      <svg className="w-5 h-5" fill="none" stroke="#6366f1" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm font-semibold" style={{ color: "#a5b4fc" }}>{file.name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Analyzing Indicator */}
              {analyzing && (
                <div
                  className="px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-fade-in"
                  style={{
                    background: "rgba(99,102,241,0.08)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    color: "#a5b4fc",
                  }}
                >
                  <Spinner size="sm" />
                  <span>AI analyzing manual — extracting metadata…</span>
                </div>
              )}

              {/* Auto-Detected Metadata */}
              {autoMeta && !analyzing && (
                <div
                  className="p-4 rounded-xl space-y-3 animate-scale-in"
                  style={{
                    background: "rgba(16,185,129,0.06)",
                    border: "1px solid rgba(16,185,129,0.2)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm flex items-center gap-2" style={{ color: "#6ee7b7" }}>
                      ✨ Auto-Detected Metadata
                    </span>
                    <span
                      className="font-mono text-[10px] px-2 py-1 rounded-lg font-bold"
                      style={{
                        background: "rgba(16,185,129,0.15)",
                        color: "#34d399",
                        border: "1px solid rgba(16,185,129,0.3)",
                      }}
                    >
                      {Math.round(autoMeta.confidence * 100)}% confidence
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { k: "Machine", v: `${autoMeta.machine_name} (${autoMeta.machine_model})` },
                      { k: "Manufacturer", v: autoMeta.manufacturer },
                      { k: "Doc No", v: autoMeta.document_number || "N/A" },
                      { k: "Pages", v: String(autoMeta.page_count) },
                    ].map(({ k, v }) => (
                      <div key={k}>
                        <span className="font-semibold" style={{ color: "#6ee7b7" }}>{k}: </span>
                        <span style={{ color: "#94a3b8" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  {autoMeta.detected_error_codes.length > 0 && (
                    <div className="text-xs">
                      <span className="font-semibold" style={{ color: "#6ee7b7" }}>Error Codes: </span>
                      <span className="font-mono" style={{ color: "#10b981" }}>
                        {autoMeta.detected_error_codes.slice(0, 8).join(", ")}
                        {autoMeta.detected_error_codes.length > 8 ? "…" : ""}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Machine Association */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#64748b" }}>
                  Machine Association
                </label>
                <select
                  value={machineId}
                  onChange={(e) => setMachineId(e.target.value)}
                  className="input-glow w-full px-4 py-3 text-sm rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#e2e8f0",
                  }}
                >
                  <option value="">Auto-create or match automatically…</option>
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.model})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] mt-1.5" style={{ color: "#334155" }}>
                  Leave empty to automatically register a new machine from extracted metadata.
                </p>
              </div>

              {/* Manual Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#64748b" }}>
                  Manual Title <span style={{ color: "#6366f1" }}>*</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Auto-detected or custom title"
                  className="input-glow w-full px-4 py-3 text-sm rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#e2e8f0",
                  }}
                />
              </div>

              {/* Type + Version */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#64748b" }}>
                    Manual Type
                  </label>
                  <select
                    value={manualType}
                    onChange={(e) => setManualType(e.target.value)}
                    className="input-glow w-full px-4 py-3 text-sm rounded-xl"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#e2e8f0",
                    }}
                  >
                    {MANUAL_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#64748b" }}>
                    Version / Revision
                  </label>
                  <input
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="e.g. REV4, v2.1"
                    className="input-glow w-full px-4 py-3 text-sm rounded-xl font-mono"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#e2e8f0",
                    }}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                id="upload-submit-btn"
                type="submit"
                disabled={uploading || analyzing}
                className="w-full py-3.5 px-4 mt-2 rounded-xl font-semibold text-sm text-white transition-all flex items-center justify-center gap-2"
                style={
                  uploading || analyzing
                    ? { background: "rgba(99,102,241,0.3)", cursor: "not-allowed" }
                    : {
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        boxShadow: "0 0 24px rgba(99,102,241,0.35)",
                      }
                }
                onMouseEnter={(e) => {
                  if (!uploading && !analyzing) {
                    (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                }}
              >
                {uploading ? (
                  <>
                    <Spinner size="sm" />
                    Uploading & Ingesting…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload & Ingest Manual
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
