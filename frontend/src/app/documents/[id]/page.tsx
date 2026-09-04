"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LandingLayout from "@/components/landing/LandingLayout";
import Spinner from "@/components/ui/Spinner";
import { getManualDetail, getManualChunks, reprocessManual } from "@/lib/api";
import type { Manual, Machine, ManualChunk } from "@/lib/types";

function formatBytes(bytes?: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const manualId = resolvedParams.id;
  const router = useRouter();

  const [manual, setManual] = useState<(Manual & { machine?: Machine }) | null>(null);
  const [chunks, setChunks] = useState<ManualChunk[]>([]);
  const [totalChunks, setTotalChunks] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [chunksLoading, setChunksLoading] = useState(false);
  const [copiedChunkId, setCopiedChunkId] = useState<string | null>(null);
  const [reprocessing, setReprocessing] = useState(false);

  useEffect(() => {
    async function loadManual() {
      setLoading(true);
      try {
        const data = await getManualDetail(manualId);
        setManual(data);
      } catch (err: unknown) {
        console.error("Failed to load manual details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadManual();
  }, [manualId]);

  useEffect(() => {
    async function loadChunks() {
      setChunksLoading(true);
      try {
        const res = await getManualChunks(manualId, page, pageSize, search);
        setChunks(res.chunks);
        setTotalChunks(res.total_chunks);
      } catch (err: unknown) {
        console.error("Failed to load chunks:", err);
      } finally {
        setChunksLoading(false);
      }
    }
    loadChunks();
  }, [manualId, page, pageSize, search]);

  const handleCopyChunk = (chunkId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedChunkId(chunkId);
    setTimeout(() => setCopiedChunkId(null), 2000);
  };

  const handleReprocess = async () => {
    if (!confirm("Reprocess this document? It will clear existing vectors and re-index.")) return;
    setReprocessing(true);
    try {
      await reprocessManual(manualId);
      if (manual) setManual({ ...manual, processing_status: "reprocessing" });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Reprocessing failed");
    } finally {
      setReprocessing(false);
    }
  };

  if (loading) {
    return (
      <LandingLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="text-xs text-[var(--text-muted)] mt-4">Loading document details…</p>
        </div>
      </LandingLayout>
    );
  }

  if (!manual) {
    return (
      <LandingLayout>
        <div className="pt-32 pb-20 text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Document not found</h2>
          <p className="text-xs text-[var(--text-muted)] mt-2">The requested manual ID does not exist or has been deleted.</p>
          <Link href="/documents" className="mt-6 inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold">
            Back to Documents
          </Link>
        </div>
      </LandingLayout>
    );
  }

  const totalPages = Math.ceil(totalChunks / pageSize) || 1;

  return (
    <LandingLayout>
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-6">
          <Link href="/documents" className="hover:text-indigo-600 dark:hover:text-indigo-400">
            Documents
          </Link>
          <span>/</span>
          <span className="text-[var(--text-primary)] font-semibold truncate max-w-xs">{manual.title}</span>
        </div>

        {/* Overview Header Card */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border)] shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="capitalize px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/25">
                  {manual.manual_type || "Technical Manual"}
                </span>
                {manual.version && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300">
                    v{manual.version}
                  </span>
                )}
                {manual.processing_status === "completed" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    ChromaDB Cosine Indexed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    {manual.processing_status}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] leading-tight">
                {manual.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mt-3 font-mono text-xs text-[var(--text-muted)]">
                <span>File: {manual.original_filename}</span>
                <span>·</span>
                <span>Size: {formatBytes(manual.file_size_bytes)}</span>
                <span>·</span>
                <span>Pages: {manual.page_count || "—"}</span>
                <span>·</span>
                <span>Total Vectors: {manual.chunk_count || totalChunks}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleReprocess}
                disabled={reprocessing}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/[0.05] border border-[var(--border)] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-all flex items-center gap-2"
              >
                <svg className={`w-3.5 h-3.5 ${reprocessing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {reprocessing ? "Reprocessing…" : "Reprocess Vectors"}
              </button>

              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Troubleshoot in Console
              </Link>
            </div>
          </div>

          {/* Machine spec strip */}
          {manual.machine && (
            <div className="mt-6 pt-6 border-t border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Assigned Machine</p>
                <p className="font-bold text-[var(--text-primary)] mt-0.5">{manual.machine.name}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Model / Type</p>
                <p className="font-medium text-[var(--text-primary)] mt-0.5">{manual.machine.model || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Manufacturer OEM</p>
                <p className="font-medium text-[var(--text-primary)] mt-0.5">{manual.machine.manufacturer || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Category</p>
                <p className="font-medium text-[var(--text-primary)] mt-0.5">{manual.machine.category || "General Machinery"}</p>
              </div>
            </div>
          )}
        </div>

        {/* Chunks Explorer Section */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Extracted Chunks Explorer
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Inspect contextual boundaries, token sizes, section paths, and error code tags for every stored vector.
            </p>
          </div>

          {/* Chunk search */}
          <div className="w-full sm:w-80 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search within extracted chunks…"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Chunks List */}
        {chunksLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Spinner size="md" />
            <p className="text-xs text-[var(--text-muted)] mt-3">Loading chunk partitions…</p>
          </div>
        ) : chunks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)]">
            <p className="text-sm font-semibold text-[var(--text-primary)]">No chunks found</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {search ? "No chunks match your search query." : "No chunks have been generated yet for this manual."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {chunks.map((chunk) => {
              const isCopied = copiedChunkId === chunk.id;
              return (
                <div
                  key={chunk.id}
                  className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] hover:border-indigo-500/30 transition-all shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">
                        #{chunk.chunk_index + 1}
                      </span>
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        Page {chunk.page_start}{chunk.page_end && chunk.page_end !== chunk.page_start ? `–${chunk.page_end}` : ""}
                      </span>
                      {chunk.content_tokens && (
                        <span className="text-[11px] font-mono text-slate-400">
                          ({chunk.content_tokens} tokens)
                        </span>
                      )}
                      <span className="capitalize text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300">
                        {chunk.chunk_type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyChunk(chunk.id, chunk.content)}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        {isCopied ? "✓ Copied" : "Copy text"}
                      </button>
                    </div>
                  </div>

                  {/* Section path */}
                  {chunk.section_path && (
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      {chunk.section_path}
                    </p>
                  )}

                  {/* Error codes badges */}
                  {chunk.error_codes_present && chunk.error_codes_present.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      {chunk.error_codes_present.map((code) => (
                        <span
                          key={code}
                          className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Content block */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-[var(--border)] font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {chunk.content}
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-4 flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>
                  Showing page {page} of {totalPages} ({totalChunks} chunks)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </LandingLayout>
  );
}
