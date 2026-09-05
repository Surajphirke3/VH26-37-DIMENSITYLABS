"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  Wrench,
  AlertTriangle,
  FileText,
  Camera,
  ShieldCheck,
  Clock,
} from "lucide-react";
import type { TroubleshootingResponse } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/context";

interface Props {
  response: TroubleshootingResponse;
  onSuggestionClick?: (s: string) => void;
  textSize?: "sm" | "base" | "lg";
  fontSizePx?: number;
}

export default function StructuredAnswerV2({
  response,
  onSuggestionClick,
  textSize = "base",
  fontSizePx,
}: Props) {
  const { t } = useLanguage();
  const [citationsOpen, setCitationsOpen] = useState(false);
  const [copiedCitationId, setCopiedCitationId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const copyCitation = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCitationId(id);
    setTimeout(() => setCopiedCitationId(null), 2000);
  };

  const copyFullResponse = () => {
    let fullText = `${response.summary}\n\n`;
    if (response.error_meaning) {
      fullText += `Technical Meaning: ${response.error_meaning}\n\n`;
    }
    if (response.probable_causes.length > 0) {
      fullText += `Probable Causes:\n${response.probable_causes.map((c, i) => `${i + 1}. ${c}`).join("\n")}\n\n`;
    }
    if (response.corrective_steps.length > 0) {
      fullText += `Action Steps:\n${response.corrective_steps.map((s) => `${s.step_number}. ${s.action}${s.warning ? ` [WARNING: ${s.warning}]` : ""}`).join("\n")}\n\n`;
    }
    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const textScale = {
    sm: "text-xs leading-normal",
    base: "text-sm leading-relaxed",
    lg: "text-base leading-relaxed",
  }[textSize];

  const headingScale = {
    sm: "text-xs font-bold",
    base: "text-sm font-bold",
    lg: "text-base font-bold",
  }[textSize];

  const modelUsed = response.model || (response.metadata?.model as string | undefined);
  const evidencePercent = response.evidence_score
    ? `${Math.round(response.evidence_score * 100)}%`
    : null;

  // Determine which model tier generated this response
  const isApex = modelUsed?.toLowerCase().includes("apex") || modelUsed?.toLowerCase().includes("120b") || modelUsed?.toLowerCase().includes("70b");
  const isForge = modelUsed?.toLowerCase().includes("forge") || modelUsed?.toLowerCase().includes("8b");
  const isNord = !isApex && !isForge;

  return (
    <div
      className={`space-y-4 font-sans text-slate-800 dark:text-slate-100 ${textScale}`}
      style={fontSizePx ? { fontSize: `${fontSizePx}px` } : undefined}
    >
      {/* ── Context Header: Nord, Forge, Apex Tier Indicator ── */}
      <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pb-1 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {/* Active Model Tier Badge */}
          {isApex ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              APEX · Deep Safety Diagnostics
            </span>
          ) : isForge ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              FORGE · Workshop Reasoning
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              NORD · Sub-second Edge
            </span>
          )}

          <span className="inline-flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
            <span>OEM Grounded</span>
          </span>

          {evidencePercent && (
            <span className="text-[11px] text-slate-400">· {evidencePercent} match</span>
          )}
        </div>

        {response.total_latency_ms && (
          <span className="font-mono text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-white/5">
            {response.total_latency_ms}ms
          </span>
        )}
      </div>

      {/* ── Optical Scan Detection (if present) ── */}
      {response.ocr_result && (response.ocr_result.error_code || response.ocr_result.extracted_text) && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
          <Camera className="w-3.5 h-3.5 text-sky-500" />
          <span>Extracted Alarm:</span>
          {response.ocr_result.error_code && (
            <strong className="font-mono text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
              {response.ocr_result.error_code}
            </strong>
          )}
          {response.ocr_result.machine_brand && (
            <span className="text-slate-500">({response.ocr_result.machine_brand})</span>
          )}
        </div>
      )}

      {/* ── Core Diagnostic Assessment (Clean Minimal Prose) ── */}
      <p className={`font-normal text-slate-800 dark:text-slate-100 leading-relaxed ${textScale}`}>
        {response.summary}
      </p>

      {/* ── Technical Meaning (Forge Amber Callout) ── */}
      {response.error_meaning && (
        <div className="pl-3.5 border-l-2 border-amber-500/80 dark:border-amber-500/70 bg-amber-500/5 py-1.5 pr-2 rounded-r-lg text-xs text-slate-700 dark:text-slate-300 font-mono">
          <strong className="font-semibold text-amber-700 dark:text-amber-400 font-sans block mb-0.5">
            {t("solution.technicalMeaning", "Technical Specification:")}
          </strong>
          {response.error_meaning}
        </div>
      )}

      {/* ── Probable Root Causes (Clean Bulleted Hierarchy) ── */}
      {response.probable_causes && response.probable_causes.length > 0 && (
        <div className="space-y-2 pt-1">
          <h4 className={`${headingScale} text-slate-900 dark:text-slate-100`}>
            {t("solution.probableCauses", "Probable Causes")}
          </h4>
          <ul className="space-y-1.5 pl-1">
            {response.probable_causes.map((cause, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0 mt-2" />
                <span className={`text-slate-700 dark:text-slate-200 ${textScale}`}>
                  {cause}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Recommended Remediation Steps (Forge Amber Numbering) ── */}
      {response.corrective_steps && response.corrective_steps.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className={`${headingScale} text-slate-900 dark:text-slate-100 flex items-center gap-1.5`}>
            <Wrench className="w-4 h-4 text-amber-500" />
            <span>{t("solution.correctiveSteps", "Recommended Actions")}</span>
          </h4>

          <div className="space-y-3 pl-1">
            {response.corrective_steps.map((step) => (
              <div key={step.step_number} className="space-y-1.5">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-md bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {step.step_number}
                  </span>
                  <p className={`font-medium text-slate-800 dark:text-slate-100 flex-1 leading-snug ${textScale}`}>
                    {step.action}
                  </p>
                </div>

                {/* Critical Safety Notice (Apex Crimson / Ruby Alert) */}
                {step.warning && (
                  <div className="ml-8 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong className="font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                        {t("solution.safetyWarning", "Safety Notice")}:
                      </strong>{" "}
                      {step.warning}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Grounded OEM Citations (Nord Ice Blue Style Pills) ── */}
      {response.citations && response.citations.length > 0 && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setCitationsOpen(!citationsOpen)}
            className="text-xs font-medium text-sky-600 dark:text-sky-400 hover:text-sky-500 flex items-center gap-1.5 transition-colors cursor-pointer py-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t("solution.verifiedCitations", "Sources")} ({response.citations.length} verified manual excerpts)</span>
            <ChevronDown
              className={`w-3 h-3 transition-transform ${citationsOpen ? "rotate-180" : ""}`}
            />
          </button>

          {citationsOpen && (
            <div className="mt-2 space-y-2 pt-1 border-t border-slate-100 dark:border-white/5">
              {response.citations.map((c) => (
                <div
                  key={c.citation_id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-white/5 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-[10px] font-bold text-sky-700 dark:text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/30">
                        {t("solution.page", "Page")} {c.page_start}
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {c.manual_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {c.manual_id && (
                        <Link
                          href={`/documents/${c.manual_id}`}
                          className="text-[11px] font-medium text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1"
                        >
                          <span>{t("solution.openPdf", "Open PDF")}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => copyCitation(c.excerpt, c.citation_id)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors cursor-pointer"
                        title={t("solution.copyExcerpt", "Copy excerpt")}
                      >
                        {copiedCitationId === c.citation_id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-white/60 dark:bg-black/20 p-2 rounded-lg border border-slate-100 dark:border-white/5">
                    &ldquo;{c.excerpt}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Follow-up Probing Questions (Clean Pills) ── */}
      {response.follow_up_suggestions && response.follow_up_suggestions.length > 0 && (
        <div className="pt-2 space-y-1.5">
          <div className="flex flex-wrap gap-1.5">
            {response.follow_up_suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSuggestionClick?.(suggestion)}
                className="text-xs px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors text-left cursor-pointer border border-transparent hover:border-slate-300 dark:hover:border-white/10"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Footer Actions: Copy Full Response ── */}
      <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
        <button
          type="button"
          onClick={copyFullResponse}
          className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer text-[11px]"
        >
          {copiedAll ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t("solution.copied", "Copied!")}</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>{t("solution.copyExcerpt", "Copy")}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
