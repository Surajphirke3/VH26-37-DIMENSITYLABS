"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConsoleLayout from "@/components/console/ConsoleLayout";
import Spinner from "@/components/ui/Spinner";
import { getManuals, getMachines, deleteManual, reprocessManual } from "@/lib/api";
import type { Manual, Machine } from "@/lib/types";

function formatBytes(bytes?: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function DocumentsPage() {
  const router = useRouter();
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [machineFilter, setMachineFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mList, machList] = await Promise.all([getManuals(), getMachines()]);
      setManuals(mList);
      setMachines(machList);
    } catch (err: unknown) {
      console.error("Failed to load documents data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (manualId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This will permanently remove its PDF and ChromaDB vector index.`)) return;
    setActionLoadingId(manualId);
    try {
      await deleteManual(manualId);
      setManuals((prev) => prev.filter((m) => m.id !== manualId));
      setFeedbackMsg({ type: "success", text: `Manual "${title}" deleted successfully.` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Deletion failed.";
      setFeedbackMsg({ type: "error", text: msg });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReprocess = async (manualId: string, title: string) => {
    if (!confirm(`Reprocess "${title}"? This will re-parse the PDF, recreate chunks, and re-index into ChromaDB.`)) return;
    setActionLoadingId(manualId);
    try {
      await reprocessManual(manualId);
      setManuals((prev) =>
        prev.map((m) => (m.id === manualId ? { ...m, processing_status: "reprocessing" } : m))
      );
      setFeedbackMsg({ type: "success", text: `Reprocessing initiated for "${title}".` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Reprocessing failed.";
      setFeedbackMsg({ type: "error", text: msg });
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredManuals = useMemo(() => {
    return manuals.filter((m) => {
      const matchesSearch =
        search === "" ||
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.original_filename.toLowerCase().includes(search.toLowerCase()) ||
        (m.machine_name && m.machine_name.toLowerCase().includes(search.toLowerCase()));

      const matchesMachine =
        machineFilter === "all" || m.machine_id === machineFilter;

      const matchesStatus =
        statusFilter === "all" || m.processing_status === statusFilter;

      return matchesSearch && matchesMachine && matchesStatus;
    });
  }, [manuals, search, machineFilter, statusFilter]);

  return (
    <ConsoleLayout>
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="font-mono text-xs uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-semibold">
                Vector Knowledge Base
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">
              Document Management
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Inspect indexed industrial manuals, view chunk distributions, re-index vectors, and audit technical documentation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/[0.04] border border-[var(--border)] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-all flex items-center gap-1.5"
              title="Refresh manual list"
            >
              <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>

            <Link
              href="/upload"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Upload Manual
            </Link>
          </div>
        </div>

        {/* Feedback alert */}
        {feedbackMsg && (
          <div
            className={`mb-6 px-4 py-3 rounded-xl text-xs font-medium flex items-center justify-between border ${
              feedbackMsg.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/10 border-red-500/25 text-red-600 dark:text-red-400"
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button onClick={() => setFeedbackMsg(null)} className="opacity-70 hover:opacity-100 font-bold ml-4">
              ✕
            </button>
          </div>
        )}

        {/* Filter and search bar */}
        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex-1 relative">
            <svg
              className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by manual title, file name, or machine model…"
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Machine Filter */}
            <select
              value={machineFilter}
              onChange={(e) => setMachineFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Machines ({machines.length})</option>
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.model ? `(${m.model})` : ""}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed (Indexed)</option>
              <option value="processing">Processing</option>
              <option value="reprocessing">Reprocessing</option>
              <option value="failed">Failed</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-white/[0.04] p-1 rounded-xl border border-[var(--border)]">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  viewMode === "table"
                    ? "bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Table View"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Grid View"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Spinner size="lg" />
            <p className="text-xs text-[var(--text-muted)] mt-4">Loading indexed documentation…</p>
          </div>
        ) : filteredManuals.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-[var(--bg-surface)] border border-dashed border-[var(--border)] p-8">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">No manuals found</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-md mx-auto">
              {search || machineFilter !== "all" || statusFilter !== "all"
                ? "No documents match the specified search or filter criteria. Try clearing filters."
                : "No manuals have been uploaded yet. Upload OEM documentation to enable RAG troubleshooting."}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              {(search || machineFilter !== "all" || statusFilter !== "all") && (
                <button
                  onClick={() => { setSearch(""); setMachineFilter("all"); setStatusFilter("all"); }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/[0.05] text-[var(--text-primary)] hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-all"
                >
                  Clear Filters
                </button>
              )}
              <Link
                href="/upload"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20"
              >
                Upload Manual
              </Link>
            </div>
          </div>
        ) : viewMode === "table" ? (
          /* Table View */
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-slate-50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-bold">Document</th>
                    <th className="py-3.5 px-4 font-bold">Machine</th>
                    <th className="py-3.5 px-4 font-bold">Scope</th>
                    <th className="py-3.5 px-4 font-bold">Metrics</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredManuals.map((m) => {
                    const isActing = actionLoadingId === m.id;
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-4 min-w-[260px]">
                          <Link
                            href={`/documents/${m.id}`}
                            className="font-bold text-sm text-[var(--text-primary)] hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block leading-snug"
                          >
                            {m.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1 font-mono text-[11px] text-[var(--text-muted)]">
                            <span className="truncate max-w-[200px]" title={m.original_filename}>
                              {m.original_filename}
                            </span>
                            {m.version && (
                              <>
                                <span>·</span>
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.05]">v{m.version}</span>
                              </>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          {m.machine_name ? (
                            <div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {m.machine_name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="capitalize px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-500/20">
                            {m.manual_type || "Service"}
                          </span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5 font-mono text-[11px] text-[var(--text-muted)]">
                            <span>{m.page_count ? `${m.page_count} pages` : "—"}</span>
                            <span>{m.chunk_count ? `${m.chunk_count} vectors` : "—"}</span>
                            <span>{formatBytes(m.file_size_bytes)}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          {m.processing_status === "completed" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Indexed
                            </span>
                          )}
                          {(m.processing_status === "processing" || m.processing_status === "reprocessing") && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                              {m.processing_status === "reprocessing" ? "Re-indexing…" : "Processing…"}
                            </span>
                          )}
                          {m.processing_status === "failed" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              Failed
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/documents/${m.id}`}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/15 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                              title="Inspect Chunks & Metadata"
                            >
                              Inspect
                            </Link>

                            <button
                              onClick={() => handleReprocess(m.id, m.title)}
                              disabled={isActing}
                              className="px-2 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
                              title="Reprocess & re-index"
                            >
                              Reprocess
                            </button>

                            <button
                              onClick={() => handleDelete(m.id, m.title)}
                              disabled={isActing}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                              title="Delete Manual"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredManuals.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] flex flex-col justify-between hover:border-indigo-500/40 hover:shadow-lg transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="capitalize px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-500/20">
                      {m.manual_type || "Service Manual"}
                    </span>
                    {m.processing_status === "completed" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Ready
                      </span>
                    )}
                  </div>

                  <Link href={`/documents/${m.id}`}>
                    <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {m.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-[var(--text-muted)] font-mono mt-1 truncate">
                    {m.original_filename}
                  </p>

                  <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Machine</p>
                      <p className="font-medium text-[var(--text-primary)] truncate">
                        {m.machine_name || "Unassigned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Indexed Vectors</p>
                      <p className="font-mono text-[var(--text-primary)]">
                        {m.chunk_count ? `${m.chunk_count} chunks` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Pages</p>
                      <p className="font-mono text-[var(--text-primary)]">
                        {m.page_count ? `${m.page_count} pages` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">File Size</p>
                      <p className="font-mono text-[var(--text-primary)]">
                        {formatBytes(m.file_size_bytes)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">
                    {formatDate(m.created_at)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/documents/${m.id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
                    >
                      Inspect Chunks
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ConsoleLayout>
  );
}
