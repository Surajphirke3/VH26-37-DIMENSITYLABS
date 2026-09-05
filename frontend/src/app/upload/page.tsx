"use client";

import React, { useState, useEffect, DragEvent, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConsoleLayout from "@/components/console/ConsoleLayout";
import Spinner from "@/components/ui/Spinner";
import {
  getMachines,
  uploadManual,
  getManualStatus,
  extractManualMetadata,
  type ExtractedManualMetadata,
} from "@/lib/api";
import type { Machine } from "@/lib/types";

const MANUAL_TYPES = ["service", "operator", "parts", "installation", "schematic", "troubleshooting"];

const INGESTION_STAGES = [
  { stage: 1, title: "File Validation", desc: "Magic byte check & SHA256 deduplication" },
  { stage: 2, title: "Text & Table Extraction", desc: "PyMuPDF high-speed parsing & OCR detection" },
  { stage: 3, title: "Contextual Chunking", desc: "Structural headings, tables & error boundaries" },
  { stage: 4, title: "Batch Embeddings", desc: "Sentence-transformers multi-threaded encoding" },
  { stage: 5, title: "ChromaDB Indexing", desc: "HNSW cosine similarity index construction" },
  { stage: 6, title: "Production Ready", desc: "RAG pipeline armed for instant error retrieval" },
];

export default function UploadPage() {
  const router = useRouter();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [autoMeta, setAutoMeta] = useState<ExtractedManualMetadata | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [machineId, setMachineId] = useState("");
  const [manualType, setManualType] = useState("service");
  const [version, setVersion] = useState("");

  // Ingestion State
  const [uploading, setUploading] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const [createdManualId, setCreatedManualId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [progressPct, setProgressPct] = useState(0);
  const [pagesProcessed, setPagesProcessed] = useState(0);
  const [chunksCreated, setChunksCreated] = useState(0);

  useEffect(() => {
    getMachines().then(setMachines).catch(console.error);
  }, []);

  // Poll manual status when uploaded
  useEffect(() => {
    if (!createdManualId || activeStage >= 6) return;

    const timer = setInterval(async () => {
      try {
        const stat = await getManualStatus(createdManualId);
        if (typeof stat.progress_pct === "number") setProgressPct(stat.progress_pct);
        if (typeof stat.pages_processed === "number") setPagesProcessed(stat.pages_processed);
        if (typeof stat.chunks_created === "number") setChunksCreated(stat.chunks_created);

        if (stat.processing_status === "completed") {
          setActiveStage(6);
          setProgressPct(100);
          clearInterval(timer);
        } else if (stat.processing_status === "processing" || stat.processing_status === "reprocessing") {
          const progress = stat.progress_pct || 0;
          if (progress < 25) setActiveStage(2);
          else if (progress < 35) setActiveStage(3);
          else if (progress < 85) setActiveStage(4);
          else setActiveStage(5);
        } else if (stat.processing_status === "failed") {
          setErrorMsg(stat.error_message || "Ingestion failed during processing");
          setUploading(false);
          setActiveStage(0);
          setCreatedManualId(null);
          clearInterval(timer);
        }
      } catch {
        // keep polling
      }
    }, 1500);

    return () => clearInterval(timer);
  }, [createdManualId, activeStage]);

  const handleFileProcess = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setErrorMsg("Only PDF manuals (.pdf) are supported.");
      return;
    }
    setErrorMsg("");
    setFile(selectedFile);
    setAutoMeta(null);
    setExtracting(true);

    try {
      const meta = await extractManualMetadata(selectedFile);
      setAutoMeta(meta);
      if (meta.title && !title) setTitle(meta.title);
      if (meta.version && !version) setVersion(meta.version);
      if (meta.manual_type) setManualType(meta.manual_type);
      if (meta.suggested_machine_id) {
        setMachineId(meta.suggested_machine_id);
      } else if (machines.length > 0 && meta.machine_model) {
        const matched = machines.find(
          (m) =>
            m.model?.toLowerCase().includes(meta.machine_model.toLowerCase()) ||
            m.name.toLowerCase().includes(meta.machine_model.toLowerCase())
        );
        if (matched) setMachineId(matched.id);
      }
    } catch (err: unknown) {
      console.warn("Notice: Fast text metadata extraction skipped:", err);
      if (!title) setTitle(selectedFile.name.replace(/\.pdf$/i, ""));
    } finally {
      setExtracting(false);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg("Please select a PDF manual first.");
      return;
    }

    setUploading(true);
    setErrorMsg("");
    setActiveStage(1);

    const fd = new FormData();
    fd.append("file", file);
    if (machineId && machineId !== "null" && machineId !== "auto") fd.append("machine_id", machineId);
    if (title) fd.append("title", title);
    fd.append("manual_type", manualType);
    if (version) fd.append("version", version);

    try {
      const res = await uploadManual(fd);
      setCreatedManualId(res.manual_id);
      setActiveStage(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      setErrorMsg(msg);
      setUploading(false);
      setActiveStage(0);
    }
  };

  return (
    <ConsoleLayout>
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-semibold mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Fast Ingestion Pipeline
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            Upload Technical Manual
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Ingest machine schematics, maintenance procedures, and error code tables into the ChromaDB cosine vector index.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-center justify-between">
            <span>⚠ {errorMsg}</span>
            <button onClick={() => setErrorMsg("")} className="font-bold ml-4">✕</button>
          </div>
        )}

        {/* Upload Form or Progress View */}
        {!uploading ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                dragActive
                  ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 scale-[1.01]"
                  : file
                  ? "border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-500/5"
                  : "border-[var(--border)] bg-[var(--bg-surface)] hover:border-indigo-500/50 hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"
              }`}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="flex flex-col items-center pointer-events-none">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform ${
                    file ? "bg-emerald-500/10 text-emerald-600" : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  }`}
                >
                  {file ? (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  )}
                </div>

                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {file ? file.name : "Drag & drop your industrial manual PDF here"}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm">
                  {file
                    ? `${(file.size / (1024 * 1024)).toFixed(2)} MB · Ready for processing`
                    : "Supports standard PDF manuals up to 100 MB. Scanned OCR and table extraction handled automatically."}
                </p>

                {extracting && (
                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <Spinner size="sm" />
                    Analyzing document structure & error codes…
                  </div>
                )}
              </div>
            </div>

            {/* Extracted Metadata Card */}
            {autoMeta && (
              <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/25">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                    Automatic Metadata Detection
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Model</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{autoMeta.machine_model || "Detected"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Manufacturer</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{autoMeta.manufacturer || "OEM"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Page Count</span>
                    <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{autoMeta.page_count} pages</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Error Codes Found</span>
                    <span className="font-bold font-mono text-amber-600 dark:text-amber-400">
                      {autoMeta.detected_error_codes?.length || 0} codes
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border)] grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5 uppercase tracking-wide">
                  Manual Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. FANUC Series 0i-MODEL D Maintenance Manual"
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5 uppercase tracking-wide">
                  Assigned Machine
                </label>
                <select
                  value={machineId}
                  onChange={(e) => setMachineId(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                >
                  <option value="auto">Auto-detect / Auto-create machine</option>
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.model ? `(${m.model})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5 uppercase tracking-wide">
                  Manual Scope / Type
                </label>
                <select
                  value={manualType}
                  onChange={(e) => setManualType(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 capitalize"
                >
                  {MANUAL_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t} Manual
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5 uppercase tracking-wide">
                  Edition / Revision
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="e.g. 01, Rev B, 2024"
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={!file}
                  className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  Begin Ingestion & Indexing
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Multi-Stage Visual Progress Tracker */
          <div className="p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border)] shadow-xl animate-fade-in">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold mb-2">
                Stage {Math.min(activeStage, 6)} of 6 · {progressPct}% Complete
              </div>
              <h2 className="text-2xl font-black text-[var(--text-primary)]">
                {activeStage === 6 ? "Ingestion Completed Successfully!" : "Processing Industrial Manual…"}
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {activeStage === 6
                  ? "Vectors are stored in ChromaDB and ready for cosine similarity retrieval."
                  : "Please do not close this window while background indexing proceeds."}
              </p>

              {/* Real-time Progress Bar */}
              <div className="max-w-xl mx-auto mt-5">
                <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, progressPct)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-[var(--text-muted)] mt-2 font-mono">
                  <span>{pagesProcessed > 0 ? `Pages parsed: ${pagesProcessed}` : "Parsing text & tables…"}</span>
                  <span>{chunksCreated > 0 ? `Chunks indexed: ${chunksCreated}` : ""}</span>
                  <span>{progressPct}%</span>
                </div>
              </div>

              {activeStage < 6 && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setUploading(false);
                      setActiveStage(0);
                      setCreatedManualId(null);
                      setProgressPct(0);
                      setPagesProcessed(0);
                      setChunksCreated(0);
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline transition-colors"
                  >
                    Cancel or upload a different manual
                  </button>
                </div>
              )}
            </div>

            {/* Stepper */}
            <div className="space-y-4 max-w-xl mx-auto">
              {INGESTION_STAGES.map((st) => {
                const isCompleted = activeStage > st.stage || activeStage === 6;
                const isCurrent = activeStage === st.stage && activeStage < 6;

                return (
                  <div
                    key={st.stage}
                    className={`flex items-start gap-4 p-3.5 rounded-2xl border transition-all ${
                      isCompleted
                        ? "bg-emerald-50/40 dark:bg-emerald-500/5 border-emerald-500/30"
                        : isCurrent
                        ? "bg-indigo-50/60 dark:bg-indigo-500/10 border-indigo-500 shadow-sm"
                        : "bg-transparent border-transparent opacity-40"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isCompleted
                          ? "bg-emerald-500 text-white"
                          : isCurrent
                          ? "bg-indigo-600 text-white animate-pulse"
                          : "bg-slate-200 dark:bg-white/10 text-slate-500"
                      }`}
                    >
                      {isCompleted ? "✓" : st.stage}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-bold ${
                          isCompleted
                            ? "text-emerald-700 dark:text-emerald-400"
                            : isCurrent
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-[var(--text-primary)]"
                        }`}
                      >
                        {st.title}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{st.desc}</p>
                    </div>

                    {isCurrent && (
                      <div className="shrink-0 pt-1">
                        <Spinner size="sm" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Final Actions when stage 6 reached */}
            {activeStage === 6 && (
              <div className="mt-8 pt-8 border-t border-[var(--border)] flex flex-wrap justify-center gap-4">
                {createdManualId && (
                  <Link
                    href={`/documents/${createdManualId}`}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/[0.05] text-[var(--text-primary)] hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-all"
                  >
                    Inspect Extracted Chunks
                  </Link>
                )}

                <Link
                  href="/dashboard"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/25 transition-all"
                >
                  Start Troubleshooting in Console →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </ConsoleLayout>
  );
}
