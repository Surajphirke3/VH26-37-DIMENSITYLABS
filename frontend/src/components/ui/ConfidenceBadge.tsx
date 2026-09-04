interface ConfidenceBadgeProps {
  level: "HIGH" | "MEDIUM" | "LOW" | null | undefined;
}

const config = {
  HIGH: {
    label: "High Confidence",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.3)",
    color: "#6ee7b7",
    dot: "#10b981",
    glow: "0 0 8px rgba(16,185,129,0.4)",
  },
  MEDIUM: {
    label: "Medium Confidence",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.3)",
    color: "#fcd34d",
    dot: "#f59e0b",
    glow: "0 0 8px rgba(245,158,11,0.3)",
  },
  LOW: {
    label: "Low Confidence",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.3)",
    color: "#fca5a5",
    dot: "#ef4444",
    glow: "0 0 8px rgba(239,68,68,0.3)",
  },
};

export default function ConfidenceBadge({ level }: ConfidenceBadgeProps) {
  if (!level) return null;
  const { label, bg, border, color, dot, glow } = config[level];

  return (
    <div className="flex flex-col gap-1.5">
      <span
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
        style={{ background: bg, border: `1px solid ${border}`, color }}
      >
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: dot, boxShadow: glow, animation: "statusBlink 2s ease infinite" }}
        />
        {label}
      </span>
      {level === "LOW" && (
        <p className="text-xs pl-1" style={{ color: "#f87171" }}>
          Limited manual coverage — verify with OEM documentation before acting.
        </p>
      )}
    </div>
  );
}
