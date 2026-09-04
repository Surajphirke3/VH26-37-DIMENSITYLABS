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
            className="text-[10px] font-mono px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-slate-400"
          >
            {response.total_latency_ms}ms
          </span>
        )}
      </div>

      {/* Summary */}
      <p className="font-medium leading-relaxed text-slate-900 dark:text-[#e2e8f0]">
        {response.summary}
      </p>

      {/* Error Meaning */}
      {response.error_meaning && (
        <div
          className="rounded-xl px-4 py-3 bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20"
        >
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-1 text-indigo-600 dark:text-indigo-400"
          >
            Error Meaning
          </p>
          <p className="text-slate-800 dark:text-[#a5b4fc] text-xs leading-relaxed">{response.error_meaning}</p>
        </div>
      )}

      {/* Probable Causes */}
      {response.probable_causes.length > 0 && (
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-3 text-slate-500 dark:text-[#475569]"
          >
            Probable Causes
          </p>
          <ul className="space-y-2">
            {response.probable_causes.map((c, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 bg-amber-100 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-[#fbbf24]"
                >
                  {i + 1}
                </span>
                <span className="text-slate-700 dark:text-[#94a3b8]">{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Corrective Steps */}
      {response.corrective_steps.length > 0 && (
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-3 text-slate-500 dark:text-[#475569]"
          >
            Corrective Steps
          </p>
          <ol className="space-y-3">
            {response.corrective_steps.map((step) => (
              <li key={step.step_number} className="flex gap-3">
                <span className="step-badge shrink-0 mt-0.5">{step.step_number}</span>
                <div className="flex-1">
                  <p className="text-slate-900 dark:text-[#e2e8f0] font-medium">{step.action}</p>
                  {step.warning && (
                    <div
                      className="mt-2 px-3 py-2 rounded-lg flex items-start gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25"
                    >
                      <svg className="w-4 h-4 shrink-0 mt-0.5 text-red-500 dark:text-[#f87171]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs font-semibold text-red-700 dark:text-[#fca5a5]">
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
            className="text-[10px] font-bold uppercase tracking-widest mb-2 text-slate-500 dark:text-[#475569]"
          >
            Follow-up Questions
          </p>
          <div className="flex flex-wrap gap-2">
            {response.follow_up_suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => onSuggestionClick?.(s)}
                className="text-xs px-3 py-1.5 rounded-full font-medium transition-all hover:scale-105 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-[#a5b4fc] hover:bg-indigo-100 dark:hover:bg-indigo-500/20 shadow-sm"
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
          className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/[0.07] bg-slate-50/50 dark:bg-transparent transition-colors"
        >
          <button
            onClick={() => setCitationsOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold transition-all bg-slate-100 dark:bg-white/[0.03] text-slate-700 dark:text-[#64748b] hover:bg-slate-200 dark:hover:bg-white/[0.06]"
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
            <div className="animate-slide-down border-t border-slate-200 dark:border-white/[0.05]">
              {response.citations.map((c) => (
                <div
                  key={c.citation_id}
                  className="px-4 py-3 space-y-1 border-t border-slate-100 dark:border-white/[0.04]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded font-mono bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-[#818cf8]"
                    >
                      pp.{c.page_start}–{c.page_end}
                    </span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-[#94a3b8]">
                      {c.manual_name}
                    </p>
                  </div>
                  {c.section_path && (
                    <p className="text-[11px] text-slate-500 dark:text-[#475569]">{c.section_path}</p>
                  )}
                  <p className="text-xs italic line-clamp-2 text-slate-600 dark:text-[#334155]">
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
