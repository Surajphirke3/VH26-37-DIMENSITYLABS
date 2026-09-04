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
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <ConfidenceBadge level={response.confidence_level} />
        {response.total_latency_ms && (
          <span className="text-xs text-slate-400">{response.total_latency_ms}ms</span>
        )}
      </div>

      {/* Summary */}
      <p className="text-slate-800 font-medium">{response.summary}</p>

      {/* Error meaning */}
      {response.error_meaning && (
        <div className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Error Meaning</p>
          <p className="text-slate-700">{response.error_meaning}</p>
        </div>
      )}

      {/* Probable causes */}
      {response.probable_causes.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Probable Causes</p>
          <ul className="space-y-1">
            {response.probable_causes.map((c, i) => (
              <li key={i} className="flex gap-2 text-slate-700">
                <span className="text-slate-400 shrink-0">•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Corrective steps */}
      {response.corrective_steps.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Corrective Steps</p>
          <ol className="space-y-2">
            {response.corrective_steps.map((step) => (
              <li key={step.step_number} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700
                  text-xs font-bold flex items-center justify-center mt-0.5">
                  {step.step_number}
                </span>
                <div className="flex-1">
                  <p className="text-slate-700">{step.action}</p>
                  {step.warning && (
                    <div className="mt-1 px-2 py-1 rounded border border-red-300 bg-red-50 text-red-700 text-xs font-medium">
                      WARNING: {step.warning}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Follow-up suggestions */}
      {response.follow_up_suggestions.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Follow-up</p>
          <div className="flex flex-wrap gap-2">
            {response.follow_up_suggestions.map((s, i) => (
              <button key={i} onClick={() => onSuggestionClick?.(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-indigo-200
                  bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Citations */}
      {response.citations.length > 0 && (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setCitationsOpen((o) => !o)}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-50
              hover:bg-slate-100 text-xs font-semibold text-slate-600 transition-colors"
          >
            <span>Sources ({response.citations.length})</span>
            <span>{citationsOpen ? "▲" : "▼"}</span>
          </button>
          {citationsOpen && (
            <div className="divide-y divide-slate-100">
              {response.citations.map((c) => (
                <div key={c.citation_id} className="px-3 py-2 space-y-0.5">
                  <p className="text-xs font-medium text-slate-700">{c.manual_name} · pp. {c.page_start}–{c.page_end}</p>
                  {c.section_path && <p className="text-xs text-slate-400">{c.section_path}</p>}
                  <p className="text-xs text-slate-500 italic line-clamp-2">"{c.excerpt}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
