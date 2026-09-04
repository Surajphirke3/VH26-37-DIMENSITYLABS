interface RefusalMessageProps {
  summary: string;
  notes?: string;
  suggestions: string[];
  onSuggestionClick?: (s: string) => void;
}

export default function RefusalMessage({
  summary,
  notes,
  suggestions,
  onSuggestionClick,
}: RefusalMessageProps) {
  return (
    <div
      className="rounded-2xl p-4 space-y-3 animate-scale-in"
      style={{
        background: "rgba(245,158,11,0.06)",
        border: "1px solid rgba(245,158,11,0.2)",
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: "rgba(245,158,11,0.15)",
            border: "1px solid rgba(245,158,11,0.3)",
          }}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: "#f59e0b" }}>
            <path fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: "#fcd34d" }}>
            Insufficient Information
          </p>
          <p className="text-sm mt-0.5" style={{ color: "#d97706" }}>
            {summary}
          </p>
        </div>
      </div>

      {notes && (
        <p className="text-xs pl-11" style={{ color: "#92400e" }}>
          {notes}
        </p>
      )}

      {suggestions.length > 0 && (
        <div className="pl-11">
          <p className="text-xs font-semibold mb-2" style={{ color: "#b45309" }}>
            Try asking:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => onSuggestionClick?.(s)}
                className="text-xs px-3 py-1.5 rounded-full font-medium transition-all hover:scale-105"
                style={{
                  background: "rgba(245,158,11,0.12)",
                  border: "1px solid rgba(245,158,11,0.25)",
                  color: "#fbbf24",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.22)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.12)";
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
