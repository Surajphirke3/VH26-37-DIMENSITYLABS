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
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <span className="text-amber-500 mt-0.5 shrink-0">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd" />
          </svg>
        </span>
        <div>
          <p className="text-sm font-semibold text-amber-900">Insufficient Information</p>
          <p className="text-sm text-amber-800 mt-0.5">{summary}</p>
        </div>
      </div>

      {notes && (
        <p className="text-xs text-amber-700 pl-8">{notes}</p>
      )}

      {suggestions.length > 0 && (
        <div className="pl-8">
          <p className="text-xs font-medium text-amber-900 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => onSuggestionClick?.(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-amber-300
                  bg-white text-amber-800 hover:bg-amber-100 transition-colors"
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
