"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getMachines, uploadManual, getManualStatus } from "@/lib/api";
import type { Machine } from "@/lib/types";
import Spinner from "@/components/ui/Spinner";

interface UploadResult { manual_id: string; ingestion_job_id: string; status: string; }
type PollStatus = "pending" | "processing" | "completed" | "failed";

const MANUAL_TYPES = ["operation", "maintenance", "troubleshooting", "installation", "parts"];

export default function UploadManualPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [machineId, setMachineId] = useState("");
  const [title, setTitle] = useState("");
  const [manualType, setManualType] = useState("troubleshooting");
  const [version, setVersion] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
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
  }, [queued]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !machineId || !title) { setError("Please fill all required fields and select a PDF."); return; }
    if (!file.name.endsWith(".pdf")) { setError("Only PDF files are accepted."); return; }

    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("machine_id", machineId);
      fd.append("title", title);
      fd.append("manual_type", manualType);
      if (version) fd.append("version", version);
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
            <button onClick={() => { setQueued(null); setPollStatus(null); setFile(null); setTitle(""); setVersion(""); }}
              className="text-sm text-indigo-600 hover:text-indigo-700">
              Upload another
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Machine <span className="text-red-500">*</span></label>
                <select value={machineId} onChange={(e) => setMachineId(e.target.value)} required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select machine…</option>
                  {machines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} required
                  placeholder="e.g. CNC-3000 Maintenance Manual"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Manual Type</label>
                  <select value={manualType} onChange={(e) => setManualType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
                    {MANUAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Version (optional)</label>
                  <input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="v2.1"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">PDF File <span className="text-red-500">*</span></label>
                <input type="file" accept=".pdf" required onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3
                    file:rounded-lg file:border-0 file:text-sm file:font-medium
                    file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
              </div>
              <button type="submit" disabled={uploading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400
                  text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2">
                {uploading ? <><Spinner size="sm" /> Uploading…</> : "Upload Manual"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
