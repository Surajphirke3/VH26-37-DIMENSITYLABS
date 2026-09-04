"use client";

import type { DisambiguationOption } from "@/lib/types";

interface DisambiguationCardProps {
  options: DisambiguationOption[];
  onSelect: (machineId: string) => void;
}

export default function DisambiguationCard({ options, onSelect }: DisambiguationCardProps) {
  return (
    <div
      className="rounded-2xl p-4 space-y-4 animate-scale-in"
      style={{
        background: "rgba(99,102,241,0.06)",
        border: "1px solid rgba(99,102,241,0.2)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.3)",
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="#6366f1" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: "#a5b4fc" }}>
            Multiple Machines Match
          </p>
          <p className="text-xs" style={{ color: "#6366f1" }}>
            This error code appears in manuals for multiple machines
          </p>
        </div>
      </div>

      <p className="text-xs" style={{ color: "#64748b" }}>
        Which machine are you troubleshooting?
      </p>

      <div className="space-y-2">
        {options.map((opt, i) => (
          <div
            key={opt.machine_id}
            className="rounded-xl p-3 flex items-start justify-between gap-3 transition-all animate-fade-in"
            style={{
              background: "rgba(15,17,23,0.8)",
              border: "1px solid rgba(255,255,255,0.07)",
              animationDelay: `${i * 0.08}s`,
            }}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>
                {opt.machine_name}
              </p>
              <p className="text-xs mt-1 line-clamp-2" style={{ color: "#475569" }}>
                {opt.snippet}
              </p>
            </div>
            <button
              onClick={() => onSelect(opt.machine_id)}
              className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))",
                border: "1px solid rgba(99,102,241,0.4)",
                color: "#a5b4fc",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, #6366f1, #8b5cf6)";
                (e.currentTarget as HTMLElement).style.color = "#fff";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 16px rgba(99,102,241,0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))";
                (e.currentTarget as HTMLElement).style.color = "#a5b4fc";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              Select
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
