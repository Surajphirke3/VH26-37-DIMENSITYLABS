"use client";

import { useEffect, useRef, useState } from "react";
import type { Manual } from "@/lib/types";
import { getManualStatus, deleteManual } from "@/lib/api";

interface ManualListProps {
  manuals: Manual[];
  onRefresh: () => void;
}

const statusConfig: Record<
  Manual["processing_status"],
  { label: string; bg: string; border: string; color: string; dot: string }
> = {
  pending: {
    label: "Pending",
    bg: "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.1)",
    color: "#64748b",
    dot: "#475569",
  },
  processing: {
    label: "Processing",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.25)",
    color: "#fbbf24",
    dot: "#f59e0b",
  },
  completed: {
    label: "Ready",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.25)",
    color: "#6ee7b7",
    dot: "#10b981",
  },
  failed: {
    label: "Failed",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.25)",
    color: "#fca5a5",
    dot: "#ef4444",
  },
};

function StatusBadge({
  manual,
  onComplete,
}: {
  manual: Manual;
  onComplete: () => void;
}) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [pct, setPct] = useState<number | null>(null);
  const cfg = statusConfig[manual.processing_status];

  useEffect(() => {
    if (manual.processing_status !== "processing") return;
    timerRef.current = setInterval(async () => {
      try {
        const updated = await getManualStatus(manual.id);
        if (updated.progress_pct != null) setPct(updated.progress_pct);
        if (updated.processing_status !== "processing") {
          clearInterval(timerRef.current!);
          onComplete();
        }
      } catch {
        clearInterval(timerRef.current!);
      }
    }, 3000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [manual.id, manual.processing_status, onComplete]);

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          background: cfg.dot,
          animation:
            manual.processing_status === "processing"
              ? "statusBlink 1.2s ease infinite"
              : "none",
        }}
      />
      {cfg.label}
      {manual.processing_status === "processing" && pct != null && (
        <span className="font-mono ml-0.5">{pct}%</span>
      )}
    </span>
  );
}

export default function ManualList({ manuals, onRefresh }: ManualListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (manuals.length === 0) {
    return (
      <div className="text-center py-14">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <svg className="w-7 h-7" fill="none" stroke="#334155" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-sm" style={{ color: "#334155" }}>No manuals uploaded yet.</p>
        <p className="text-xs mt-1" style={{ color: "#1e293b" }}>
          Upload a technical manual to start indexing.
        </p>
      </div>
    );
  }

  const handleDelete = async (manualId: string, title: string) => {
    if (
      !confirm(
        `Delete "${title}"? This will remove all indexed chunks permanently.`
      )
    )
      return;
    setDeletingId(manualId);
    try {
      await deleteManual(manualId);
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete manual");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-2">
      {manuals.map((m, i) => (
        <div
          key={m.id}
          className="flex items-center justify-between p-4 rounded-xl transition-all animate-fade-in"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
            animationDelay: `${i * 0.04}s`,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)";
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "rgba(99,102,241,0.08)",
                border: "1px solid rgba(99,102,241,0.15)",
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="#6366f1" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "#e2e8f0" }}>
                {m.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="font-mono text-[10px] truncate" style={{ color: "#334155" }}>
                  {m.original_filename}
                </p>
                <span style={{ color: "#1e293b" }}>·</span>
                <p className="text-[10px]" style={{ color: "#334155" }}>
                  {new Date(m.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-4">
            <StatusBadge manual={m} onComplete={onRefresh} />
            <button
              onClick={() => handleDelete(m.id, m.title)}
              disabled={deletingId === m.id}
              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: "rgba(239,68,68,0.07)",
                border: "1px solid rgba(239,68,68,0.15)",
                color: deletingId === m.id ? "#475569" : "#f87171",
              }}
              onMouseEnter={(e) => {
                if (deletingId !== m.id) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.15)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.07)";
              }}
            >
              {deletingId === m.id ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
