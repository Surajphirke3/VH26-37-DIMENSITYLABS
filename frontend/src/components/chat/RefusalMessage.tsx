"use client";

import { useLanguage } from "@/lib/i18n/context";
import { HelpCircle, AlertCircle, ArrowRight, Sparkles } from "lucide-react";

interface RefusalMessageProps {
  type: string;
  summary: string;
  notes?: string;
  suggestions: string[];
  onSuggestionClick?: (s: string) => void;
}

export default function RefusalMessage({
  type,
  summary,
  notes,
  suggestions,
  onSuggestionClick,
}: RefusalMessageProps) {
  const { t } = useLanguage();

  const isClarification = type === "clarification_needed" || type === "insufficient_information";
  const title = isClarification
    ? t("chat.clarificationNeeded", "Diagnostic Clarification Required")
    : t("chat.informationNeeded", "Additional Context Needed");

  return (
    <div className="rounded-2xl p-5 space-y-4 animate-fade-in bg-gradient-to-br from-amber-500/[0.07] via-slate-900/40 to-indigo-500/[0.04] border border-amber-500/25 dark:border-amber-500/20 shadow-lg backdrop-blur-md">
      {/* Header */}
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-amber-500/15 border border-amber-500/30 text-amber-500 dark:text-amber-400 shadow-sm">
          {isClarification ? (
            <HelpCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
        </div>
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {title}
            </h4>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
              INSPECTION INTAKE
            </span>
          </div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
            {summary}
          </p>
        </div>
      </div>

      {notes && (
        <div className="pl-12 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-l-2 border-amber-500/30 my-1 py-0.5">
          {notes}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="pt-2 border-t border-amber-500/15 space-y-2.5">
          <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-500" />
            {t("chat.tryAsking", "Recommended Diagnostic Queries:")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSuggestionClick?.(s)}
                className="text-left text-xs px-3.5 py-2.5 rounded-xl font-medium transition-all duration-200 bg-white/60 dark:bg-slate-900/80 hover:bg-amber-500/10 dark:hover:bg-amber-500/15 border border-slate-200 dark:border-white/10 hover:border-amber-500/40 text-slate-800 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-300 flex items-center justify-between group shadow-sm cursor-pointer"
              >
                <span className="truncate mr-2">{s}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
