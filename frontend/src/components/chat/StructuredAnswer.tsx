"use client";

import { useState } from "react";
import type { TroubleshootingResponse } from "@/lib/types";
import ConfidenceBadge from "@/components/ui/ConfidenceBadge";

interface Props {
  response: TroubleshootingResponse;
  onSuggestionClick?: (s: string) => void;
}

export default function StructuredAnswer({ response, onSuggestionClick }: Props) {
  const [citationsOpen, setCitationsOpen] = useState(false);

  return (
    <div className="space-y-4 text-sm">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <ConfidenceBadge level={response.confidence_level} />
        {response.total_latency_ms && (
          <span
            className="text-[10px] font-mono px-2 py-1 rounded-lg"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "#475569",
            }}
          >
            {response.total_latency_ms}ms
          </span>
        )}
      </div>

      {/* Summary */}
      <p className="font-medium leading-relaxed" style={{ color: "#e2e8f0" }}>
        {response.summary}
      </p>

      {/* Error Meaning */}
      {response.error_meaning && (
        <div
          className="rounded-xl px-4 py-3"
          style={{
            background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.2)",
          }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-2"
            style={{ color: "#6366f1" }}
          >
            Error Meaning
          </p>
          <p style={{ color: "#a5b4fc" }}>{response.error_meaning}</p>
        </div>
      )}

      {/* Probable Causes */}
      {response.probable_causes.length > 0 && (
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-3"
            style={{ color: "#475569" }}
          >
            Probable Causes
          </p>
          <ul className="space-y-2">
            {response.probable_causes.map((c, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                  style={{
                    background: "rgba(245,158,11,0.12)",
                    border: "1px solid rgba(245,158,11,0.25)",
                    color: "#fbbf24",
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ color: "#94a3b8" }}>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Corrective Steps */}
      {response.corrective_steps.length > 0 && (
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-3"
            style={{ color: "#475569" }}
          >
            Corrective Steps
          </p>
          <ol className="space-y-3">
            {response.corrective_steps.map((step) => (
              <li key={step.step_number} className="flex gap-3">
                <span className="step-badge shrink-0 mt-0.5">{step.step_number}</span>
                <div className="flex-1">
                  <p style={{ color: "#e2e8f0" }}>{step.action}</p>
                  {step.warning && (
                    <div
                      className="mt-2 px-3 py-2 rounded-lg flex items-start gap-2"
                      style={{
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.25)",
                      }}
                    >
                      <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" style={{ color: "#f87171" }}>
                        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs font-medium" style={{ color: "#fca5a5" }}>
                        ⚠ {step.warning}
                      </p>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Follow-up Suggestions */}
      {response.follow_up_suggestions.length > 0 && (
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-2"
            style={{ color: "#475569" }}
          >
            Follow-up Questions
          </p>
          <div className="flex flex-wrap gap-2">
            {response.follow_up_suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => onSuggestionClick?.(s)}
                className="text-xs px-3 py-1.5 rounded-full font-medium transition-all hover:scale-105"
                style={{
                  background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  color: "#a5b4fc",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.2)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 12px rgba(99,102,241,0.2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.1)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Citations */}
      {response.citations.length > 0 && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <button
            onClick={() => setCitationsOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold transition-all"
            style={{
              background: "rgba(255,255,255,0.03)",
              color: "#64748b",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
            }}
          >
            <span className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Sources ({response.citations.length})
            </span>
            <span
              className="text-xs transition-transform"
              style={{ transform: citationsOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              ▼
            </span>
          </button>

          {citationsOpen && (
            <div className="animate-slide-down" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              {response.citations.map((c) => (
                <div
                  key={c.citation_id}
                  className="px-4 py-3 space-y-1"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded font-mono"
                      style={{
                        background: "rgba(99,102,241,0.12)",
                        border: "1px solid rgba(99,102,241,0.2)",
                        color: "#818cf8",
                      }}
                    >
                      pp.{c.page_start}–{c.page_end}
                    </span>
                    <p className="text-xs font-semibold" style={{ color: "#94a3b8" }}>
                      {c.manual_name}
                    </p>
                  </div>
                  {c.section_path && (
                    <p className="text-[11px]" style={{ color: "#475569" }}>{c.section_path}</p>
                  )}
                  <p className="text-xs italic line-clamp-2" style={{ color: "#334155" }}>
                    "{c.excerpt}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
