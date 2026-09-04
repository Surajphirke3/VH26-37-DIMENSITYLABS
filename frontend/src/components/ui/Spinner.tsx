"use client";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

const sizeMap = {
  sm: { ring: "w-5 h-5", border: "3px" },
  md: { ring: "w-8 h-8", border: "3px" },
  lg: { ring: "w-12 h-12", border: "4px" },
};

export default function Spinner({ size = "md", label }: SpinnerProps) {
  const { ring, border } = sizeMap[size];
  return (
    <div className="flex items-center gap-3">
      <div
        className={`${ring} rounded-full shrink-0`}
        style={{
          border: `${border} solid rgba(99,102,241,0.15)`,
          borderTopColor: "#6366f1",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {label && (
        <span className="text-sm" style={{ color: "#64748b" }}>
          {label}
        </span>
      )}
    </div>
  );
}
