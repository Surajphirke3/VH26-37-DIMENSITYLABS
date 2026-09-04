"use client";

import { useEffect, useRef, useState } from "react";
import type { Manual } from "@/lib/types";
import { getManualStatus, deleteManual } from "@/lib/api";

interface ManualListProps {
  manuals: Manual[];
  onRefresh: () => void;
}

const statusConfig: Record<Manual["processing_status"], { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-slate-100 text-slate-600" },
  processing: { label: "Processing", className: "bg-amber-100 text-amber-700" },
  completed: { label: "Ready", className: "bg-green-100 text-green-700" },
  failed: { label: "Failed", className: "bg-red-100 text-red-700" },
};

function StatusBadge({ manual, onComplete }: { manual: Manual; onComplete: () => void }) {
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
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [manual.id, manual.processing_status, onComplete]);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {manual.processing_status === "processing" && (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
      )}
      {cfg.label}
      {manual.processing_status === "processing" && pct != null && (
        <span className="text-amber-600 ml-0.5">{pct}%</span>
      )}
    </span>
  );
}

export default function ManualList({ manuals, onRefresh }: ManualListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (manuals.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-sm">
        No manuals uploaded yet.
      </div>
    );
  }

  const handleDelete = async (manualId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This will remove all associated indexed chunks.`)) {
      return;
    }
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
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left">
            <th className="pb-3 pr-4 font-semibold text-slate-500 text-xs uppercase tracking-wide">Filename</th>
            <th className="pb-3 pr-4 font-semibold text-slate-500 text-xs uppercase tracking-wide">Title</th>
            <th className="pb-3 pr-4 font-semibold text-slate-500 text-xs uppercase tracking-wide">Status</th>
            <th className="pb-3 pr-4 font-semibold text-slate-500 text-xs uppercase tracking-wide">Uploaded</th>
            <th className="pb-3 font-semibold text-slate-500 text-xs uppercase tracking-wide text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {manuals.map((m) => (
            <tr key={m.id} className="hover:bg-slate-50 transition-colors">
              <td className="py-3 pr-4 text-slate-700 font-mono text-xs">{m.original_filename}</td>
              <td className="py-3 pr-4 text-slate-700">{m.title}</td>
              <td className="py-3 pr-4">
                <StatusBadge manual={m} onComplete={onRefresh} />
              </td>
              <td className="py-3 pr-4 text-slate-400 text-xs">
                {new Date(m.created_at).toLocaleDateString()}
              </td>
              <td className="py-3 text-right">
                <button
                  onClick={() => handleDelete(m.id, m.title)}
                  disabled={deletingId === m.id}
                  className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-40 transition-colors"
                >
                  {deletingId === m.id ? "Deleting…" : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
