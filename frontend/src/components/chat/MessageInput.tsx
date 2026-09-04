"use client";

import { useState, useRef, KeyboardEvent, ChangeEvent } from "react";

interface MessageInputProps {
  onSend: (query: string) => void;
  isLoading: boolean;
}

const ERROR_CODE_RE = /\b[A-Z]{1,4}[-_]?\d{2,5}\b/;

export default function MessageInput({ onSend, isLoading }: MessageInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasErrorCode = ERROR_CODE_RE.test(value);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    // Auto-grow
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <div className="border-t border-slate-200 bg-white px-4 py-3">
      {hasErrorCode && (
        <div className="mb-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100
            text-indigo-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            Error Code Detected
          </span>
        </div>
      )}

      <div className="flex items-end gap-3">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKey}
          disabled={isLoading}
          rows={2}
          placeholder="Enter error code (E101) or describe the symptom..."
          className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-xl
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
            disabled:bg-slate-50 disabled:text-slate-400 transition-colors
            min-h-[44px] max-h-[120px] leading-relaxed"
        />
        <button
          onClick={submit}
          disabled={isLoading || !value.trim()}
          className="shrink-0 w-10 h-10 flex items-center justify-center
            bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200
            text-white disabled:text-slate-400 rounded-xl transition-colors"
          aria-label="Send query"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
      <p className="mt-1.5 text-xs text-slate-400">Enter to send · Shift+Enter for new line</p>
    </div>
  );
}
