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
      className="rounded-2xl p-4 space-y-3 animate-scale-in bg-amber-500/10 border border-amber-500/20 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-amber-500/20 border border-amber-500/30"
        >
          <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
            Insufficient Information
          </p>
          <p className="text-sm mt-0.5 text-amber-800 dark:text-amber-400">
            {summary}
          </p>
        </div>
      </div>

      {notes && (
        <p className="text-xs pl-11 text-amber-800 dark:text-amber-500/90">
          {notes}
        </p>
      )}

      {suggestions.length > 0 && (
        <div className="pl-11">
          <p className="text-xs font-semibold mb-2 text-amber-800 dark:text-amber-400">
            Try asking:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => onSuggestionClick?.(s)}
                className="text-xs px-3 py-1.5 rounded-full font-medium transition-all hover:scale-105 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-900 dark:text-amber-200"
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
