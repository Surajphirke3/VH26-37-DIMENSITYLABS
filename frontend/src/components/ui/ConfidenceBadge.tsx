interface ConfidenceBadgeProps {
  level: "HIGH" | "MEDIUM" | "LOW" | null | undefined;
}

const config = {
  HIGH: {
    label: "High Confidence",
    className: "bg-green-100 text-green-800 border-green-200",
    dot: "bg-green-500",
  },
  MEDIUM: {
    label: "Medium Confidence",
    className: "bg-amber-100 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
  LOW: {
    label: "Low Confidence",
    className: "bg-red-100 text-red-800 border-red-200",
    dot: "bg-red-500",
  },
};

export default function ConfidenceBadge({ level }: ConfidenceBadgeProps) {
  if (!level) return null;
  const { label, className, dot } = config[level];

  return (
    <div className="flex flex-col gap-1">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        {label}
      </span>
      {level === "LOW" && (
        <p className="text-xs text-red-600">
          Limited manual coverage — verify with OEM documentation before acting.
        </p>
      )}
    </div>
  );
}
