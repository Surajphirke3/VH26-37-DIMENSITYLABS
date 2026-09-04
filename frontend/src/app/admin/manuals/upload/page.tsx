"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getMachines, uploadManual, getManualStatus, extractManualMetadata, type ExtractedManualMetadata } from "@/lib/api";
import type { Machine } from "@/lib/types";
import Spinner from "@/components/ui/Spinner";

interface UploadResult { manual_id: string; ingestion_job_id: string; status: string; }
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
  const [queued, setQueued] = useState<(UploadResult & { title: string; filename: string }) | null>(null);
  const [pollStatus, setPollStatus] = useState<PollStatus | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) router.replace("/dashboard");
  }, [user, isLoading, router]);

  useEffect(() => {
    getMachines().then(setMachines).catch(console.error);
  }, []);

  // Poll status after queuing
  useEffect(() => {
    if (!queued || pollStatus === "completed" || pollStatus === "failed") return;
    const timer = setInterval(async () => {
      try {
        const updated = await getManualStatus(queued.manual_id);
        setPollStatus(updated.processing_status as PollStatus);
        if (updated.processing_status === "completed" || updated.processing_status === "failed") {
          clearInterval(timer);
        }
      } catch { clearInterval(timer); }
    }, 3000);
    return () => clearInterval(timer);
  }, [queued, pollStatus]);

  // Automated Metadata Detection upon selecting a PDF
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

      // Auto-match machine dropdown
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
    if (!file || !title) { setError("Please provide a PDF file and title."); return; }
    if (!file.name.endsWith(".pdf")) { setError("Only PDF files are accepted."); return; }

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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push("/admin")} className="text-slate-400 hover:text-slate-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-slate-800">Upload Manual</h1>
      </header>

      <div className="max-w-xl mx-auto px-6 py-8">
        {queued ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              {pollStatus === "completed"
                ? <span className="text-green-500 text-2xl">✓</span>
                : pollStatus === "failed"
                ? <span className="text-red-500 text-2xl">✗</span>
                : <Spinner size="md" />}
              <div>
                <p className="font-semibold text-slate-800">{queued.title}</p>
                <p className="text-sm text-slate-500">{queued.filename}</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-lg text-sm font-medium
              ${pollStatus === "completed" ? "bg-green-50 text-green-700" :
                pollStatus === "failed" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
              {pollStatus === "completed" ? "Queued for processing — manual is ready." :
               pollStatus === "failed" ? "Processing failed. Contact system admin." :
               "Queued for processing — extracting and indexing content..."}
            </div>
            <button onClick={() => { setQueued(null); setPollStatus(null); setFile(null); setTitle(""); setVersion(""); setAutoMeta(null); }}
              className="text-sm text-indigo-600 hover:text-indigo-700">
              Upload another
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* File Input First to Trigger Auto-Detection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Select Technical Manual (PDF) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="file" 
                  accept=".pdf" 
                  required 
                  onChange={handleFileChange}
                  className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3
                    file:rounded-lg file:border-0 file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" 
                />
              </div>

              {/* Auto-Detection Indicator Card */}
              {analyzing && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center gap-3 text-indigo-700 text-sm animate-pulse">
                  <Spinner size="sm" />
                  <span>Analyzing manual with AI & auto-extracting metadata...</span>
                </div>
              )}

              {autoMeta && !analyzing && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2 text-xs text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-800 flex items-center gap-1.5 text-sm">
                      ✨ Auto-Detected Metadata ({Math.round(autoMeta.confidence * 100)}% confidence)
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">
                      {autoMeta.extraction_method.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 text-slate-600">
                    <p><strong className="text-slate-800">Machine:</strong> {autoMeta.machine_name} ({autoMeta.machine_model})</p>
                    <p><strong className="text-slate-800">Manufacturer:</strong> {autoMeta.manufacturer}</p>
                    <p><strong className="text-slate-800">Doc No:</strong> {autoMeta.document_number || "N/A"}</p>
                    <p><strong className="text-slate-800">Total Pages:</strong> {autoMeta.page_count}</p>
                  </div>
                  {autoMeta.detected_error_codes.length > 0 && (
                    <div className="pt-1">
                      <span className="text-slate-700 font-medium">Detected Error Codes: </span>
                      <span className="text-emerald-700 font-mono">
                        {autoMeta.detected_error_codes.slice(0, 8).join(", ")}
                        {autoMeta.detected_error_codes.length > 8 ? "..." : ""}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Machine Association
                </label>
                <select 
                  value={machineId} 
                  onChange={(e) => setMachineId(e.target.value)} 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Auto-create or match automatically…</option>
                  {machines.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.model})</option>)}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Leave empty to automatically register a new machine using the extracted metadata.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Manual Title <span className="text-red-500">*</span>
                </label>
                <input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required
                  placeholder="Auto-detected or custom title"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Manual Type</label>
                  <select 
                    value={manualType} 
                    onChange={(e) => setManualType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    {MANUAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Version / Revision</label>
                  <input 
                    value={version} 
                    onChange={(e) => setVersion(e.target.value)} 
                    placeholder="e.g. REV4, v2.1"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={uploading || analyzing}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400
                  text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {uploading ? <><Spinner size="sm" /> Uploading & Ingesting…</> : "Upload & Ingest Manual"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
