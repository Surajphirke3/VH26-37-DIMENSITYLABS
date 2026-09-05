"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Copy,
  Check,
  ExternalLink,
  Clock,
  Cpu,
  Languages,
  Layers,
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  Wrench,
  HelpCircle,
  FileText,
  Zap,
} from "lucide-react";
import type { TroubleshootingResponse } from "@/lib/types";
import ConfidenceBadge from "@/components/ui/ConfidenceBadge";
import ManufacturerLogo from "@/components/common/ManufacturerLogo";

interface Props {
  response: TroubleshootingResponse;
  onSuggestionClick?: (s: string) => void;
}

export default function StructuredAnswer({ response, onSuggestionClick }: Props) {
  const [citationsOpen, setCitationsOpen] = useState(true);
  const [showTimings, setShowTimings] = useState(false);
  const [copiedCitationId, setCopiedCitationId] = useState<string | null>(null);

  const copyCitation = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCitationId(id);
    setTimeout(() => setCopiedCitationId(null), 2000);
  };

  const latencyBreakdown =
    response.latency_breakdown || (response.metadata?.latency_breakdown as any);
  const modelUsed = response.model || (response.metadata?.model as string | undefined);
  const language = response.language || (response.metadata?.language as string | undefined);

  return (
    <div className="space-y-4 text-sm font-sans">
      {/* ── Top SCADA Diagnostic Telemetry Strip ── */}
      <div className="flex items-center justify-between gap-2.5 flex-wrap p-2.5 rounded-xl bg-slate-100/90 dark:bg-black/40 border border-slate-200 dark:border-white/[0.08] backdrop-blur-md">
        <div className="flex items-center gap-2 flex-wrap">
          <ConfidenceBadge level={response.confidence_level} score={response.evidence_score} />

          {/* Zero-Hallucination Grounded Badge */}
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 font-bold">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>OEM GROUNDED</span>
          </span>

          {modelUsed && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-semibold">
              <Cpu className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
              <span>{modelUsed.replace(/^openai\//, "").replace(/^groq\//, "")}</span>
            </span>
          )}

          {language && language !== "en" && (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20 font-bold">
              <Languages className="w-3 h-3" />
              <span>LANG: {language}</span>
            </span>
          )}
        </div>

        {response.total_latency_ms && (
          <button
            type="button"
            onClick={() => setShowTimings((prev) => !prev)}
            className="inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/30 transition-all cursor-pointer shadow-sm"
            title="Click to toggle pipeline latency breakdown"
          >
            <Clock className="w-3 h-3 text-amber-500 dark:text-amber-400" />
            <span className="font-bold">{response.total_latency_ms}ms</span>
            {latencyBreakdown && (
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform ${
                  showTimings ? "rotate-180" : ""
                }`}
              />
            )}
          </button>
        )}
      </div>

      {/* Latency timing breakdown HUD */}
      {showTimings && latencyBreakdown && (
        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-100/90 dark:bg-slate-950/70 border border-indigo-500/30 dark:border-indigo-500/25 text-center font-mono text-xs animate-fade-in shadow-sm">
          <div className="border-r border-slate-200 dark:border-white/10 pr-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-semibold">
              Vector Search
            </span>
            <span className="font-bold text-cyan-600 dark:text-cyan-400">{latencyBreakdown.retrieval_ms || 0}ms</span>
          </div>
          <div className="border-r border-slate-200 dark:border-white/10 pr-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-semibold">
              Cross-Rerank
            </span>
            <span className="font-bold text-amber-600 dark:text-amber-400">{latencyBreakdown.rerank_ms || 0}ms</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-semibold">
              Inference Stream
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{latencyBreakdown.llm_ms || 0}ms</span>
          </div>
        </div>
      )}

      {/* ── Diagnostic Executive Summary ── */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-1.5">
        <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
          <Zap className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
          <span>Diagnostic Assessment</span>
        </div>
        <p className="font-medium text-sm leading-relaxed text-slate-900 dark:text-slate-100">
          {response.summary}
        </p>
      </div>

      {/* ── Error Technical Meaning ── */}
      {response.error_meaning && (
        <div className="rounded-xl px-4 py-3.5 bg-indigo-50/90 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-cyan-400" />
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest mb-1 text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
            <span>TECHNICAL SPECIFICATION & MEANING</span>
          </p>
          <p className="text-slate-800 dark:text-indigo-200 text-xs leading-relaxed font-mono">
            {response.error_meaning}
          </p>
        </div>
      )}

      {/* ── Probable Causes ── */}
      {response.probable_causes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Probable Root Causes ({response.probable_causes.length})</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {response.probable_causes.map((c, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] hover:border-amber-500/30 transition-colors"
              >
                <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold shrink-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  0{i + 1}
                </span>
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                  {c}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Corrective Action Procedure ── */}
      {response.corrective_steps.length > 0 && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            <Wrench className="w-3.5 h-3.5 text-emerald-500" />
            <span>Isolation & Remediation Procedure</span>
          </div>

          <div className="space-y-2.5">
            {response.corrective_steps.map((step) => (
              <div
                key={step.step_number}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07] hover:border-emerald-500/30 transition-all space-y-2"
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-black shrink-0 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-sm">
                    {step.step_number}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                      {step.action}
                    </p>
                  </div>
                </div>

                {/* Industrial Safety Warning / LOTO */}
                {step.warning && (
                  <div className="ml-9 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 relative overflow-hidden flex items-start gap-2.5 shadow-sm">
                    <div className="absolute top-0 bottom-0 left-0 w-1.5 hazard-stripes-danger" />
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 block mb-0.5">
                        CRITICAL SAFETY NOTICE · LOTO MANDATORY
                      </span>
                      <p className="text-xs font-medium text-rose-900 dark:text-rose-200 leading-relaxed">
                        {step.warning}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Follow-up Probing Questions ── */}
      {response.follow_up_suggestions.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>Interactive Diagnostic Probes</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {response.follow_up_suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSuggestionClick?.(s)}
                className="text-xs px-3.5 py-1.5 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 text-indigo-700 dark:text-indigo-300 shadow-sm flex items-center gap-1.5 cursor-pointer text-left"
              >
                <span>{s}</span>
                <span className="text-indigo-500 dark:text-indigo-400 opacity-60">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Grounded OEM Sources & Verified Citations ── */}
      {response.citations.length > 0 && (
        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-black/30 transition-colors shadow-sm">
          <button
            type="button"
            onClick={() => setCitationsOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-3 text-xs font-mono font-bold transition-all bg-slate-100/80 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-white/[0.08] cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>VERIFIED OEM CITATIONS & SCHEMATICS ({response.citations.length})</span>
            </span>
            <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <span>{citationsOpen ? "COLLAPSE" : "EXPAND"}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${citationsOpen ? "rotate-180" : ""}`}
              />
            </span>
          </button>

          {citationsOpen && (
            <div className="divide-y divide-slate-100 dark:divide-white/[0.05] border-t border-slate-200 dark:border-white/[0.08]">
              {response.citations.map((c) => (
                <div key={c.citation_id} className="p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 shrink-0">
                        PAGE {c.page_start}
                        {c.page_end && c.page_end !== c.page_start ? `–${c.page_end}` : ""}
                      </span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {c.manual_name}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {c.manual_id && (
                        <Link
                          href={`/documents/${c.manual_id}`}
                          className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Open PDF</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => copyCitation(c.excerpt, c.citation_id)}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors cursor-pointer"
                        title="Copy verbatim citation snippet"
                      >
                        {copiedCitationId === c.citation_id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {c.section_path && (
                    <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                      § {c.section_path}
                    </p>
                  )}

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/[0.06] font-mono text-[11px] leading-relaxed text-slate-800 dark:text-slate-300 select-text">
                    &ldquo;{c.excerpt}&rdquo;
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
