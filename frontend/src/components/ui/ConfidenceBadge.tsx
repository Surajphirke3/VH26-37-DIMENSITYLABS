"use client";

import { AlertTriangle, ShieldCheck, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

interface ConfidenceBadgeProps {
  level: "HIGH" | "MEDIUM" | "LOW" | null | undefined;
  score?: number | null;
}

const config = {
  HIGH: {
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.3)",
    color: "#6ee7b7",
    dot: "#10b981",
    glow: "0 0 8px rgba(16,185,129,0.4)",
    icon: ShieldCheck,
  },
  MEDIUM: {
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.3)",
    color: "#fcd34d",
    dot: "#f59e0b",
    glow: "0 0 8px rgba(245,158,11,0.3)",
    icon: AlertCircle,
  },
  LOW: {
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.3)",
    color: "#fca5a5",
    dot: "#ef4444",
    glow: "0 0 8px rgba(239,68,68,0.3)",
    icon: AlertTriangle,
  },
};

export default function ConfidenceBadge({ level, score }: ConfidenceBadgeProps) {
  const { t } = useLanguage();
  if (!level) return null;
  const { bg, border, color, dot, glow, icon: Icon } = config[level];
  const pct = score !== undefined && score !== null ? Math.round(score * 100) : null;

  const label =
    level === "HIGH"
      ? t("solution.confidenceHigh", "High Confidence")
      : level === "MEDIUM"
      ? t("solution.confidenceMed", "Medium Confidence")
      : t("solution.confidenceLow", "Low Confidence");

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
          style={{ background: bg, border: `1px solid ${border}`, color }}
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: dot, boxShadow: glow, animation: "statusBlink 2s ease infinite" }}
          />
          <Icon className="w-3.5 h-3.5 shrink-0" />
          <span>{label}</span>
          {pct !== null && (
            <span className="font-mono text-[10px] opacity-85 px-1.5 py-0.2 rounded bg-black/20">
              {pct}% {t("solution.match", "match")}
            </span>
          )}
        </span>
      </div>

      {/* Safety Alert System Callouts */}
      {level === "LOW" && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs animate-fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <div className="space-y-0.5">
            <p className="font-bold tracking-wide uppercase text-[10px] text-red-500">
              ⚠️ Safety Caution · Low Evidence Threshold
            </p>
            <p className="leading-relaxed">
              Limited manual grounding found ({pct !== null ? `${pct}%` : "<50%"}). Do not execute high-voltage or mechanical modifications without cross-verifying with OEM physical schematics.
            </p>
          </div>
        </div>
      )}

      {level === "MEDIUM" && (
        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-xs animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
          <p className="leading-relaxed">
            <span className="font-semibold">Notice:</span> Partial manual coverage. Follow steps sequentially and monitor controller diagnostic parameters at each stage.
          </p>
        </div>
      )}
    </div>
  );
}
