"use client";

import type { DisambiguationOption } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/context";

interface DisambiguationCardProps {
  options: DisambiguationOption[];
  onSelect: (machineId: string) => void;
}

export default function DisambiguationCard({ options, onSelect }: DisambiguationCardProps) {
  const { t } = useLanguage();

  return (
    <div
      className="rounded-2xl p-4 space-y-4 animate-scale-in bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/30 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-300 dark:border-indigo-500/40"
        >
          <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
            {t("chat.disambiguationTitle", "Multiple Machines Match")}
          </p>
          <p className="text-xs text-indigo-600 dark:text-indigo-400">
            {t("chat.disambiguationDesc", "This error code appears in manuals for multiple machines")}
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400">
        {t("chat.disambiguationPrompt", "Which machine are you troubleshooting?")}
      </p>

      <div className="space-y-2">
        {options.map((opt, i) => (
          <div
            key={opt.machine_id}
            className="rounded-xl p-3 flex items-start justify-between gap-3 transition-all animate-fade-in bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-white/10 shadow-sm"
            style={{
              animationDelay: `${i * 0.08}s`,
            }}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {opt.machine_name}
              </p>
              <p className="text-xs mt-1 line-clamp-2 text-slate-500 dark:text-slate-400">
                {opt.snippet}
              </p>
            </div>
            <button
              onClick={() => onSelect(opt.machine_id)}
              className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm hover:shadow-indigo-500/20 cursor-pointer"
            >
              {t("chat.select", "Select")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
