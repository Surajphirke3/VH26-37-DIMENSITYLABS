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
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <div
      className="shrink-0 px-4 py-4 border-t border-[var(--border)] transition-colors"
      style={{
        background: "var(--bg-surface)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Error Code Badge */}
      {hasErrorCode && (
        <div className="mb-2.5 animate-fade-in">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/35 text-indigo-700 dark:text-[#a5b4fc]"
          >
            <span
              className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400"
              style={{ boxShadow: "0 0 6px rgba(99,102,241,0.8)", animation: "statusBlink 1.5s ease infinite" }}
            />
            Error Code Detected — RAG search will activate
          </span>
        </div>
      )}

      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            id="chat-input"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKey}
            disabled={isLoading}
            rows={2}
            placeholder="Enter error code (E101) or describe the fault symptom…"
            className="input-glow w-full px-4 py-3 text-sm rounded-xl leading-relaxed bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-[#f1f5f9] placeholder:text-slate-400 dark:placeholder:text-slate-500"
            style={{
              minHeight: "52px",
              maxHeight: "120px",
              resize: "none",
            }}
          />
          {isLoading && (
            <div className="absolute right-3 bottom-3">
              <div
                className="w-4 h-4 rounded-full border-2"
                style={{
                  borderColor: "rgba(99,102,241,0.2)",
                  borderTopColor: "#6366f1",
                  animation: "spin 0.8s linear infinite",
                }}
              />
            </div>
          )}
        </div>

        <button
          id="send-btn"
          onClick={submit}
          disabled={isLoading || !value.trim()}
          className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-xl font-bold transition-all ${
            isLoading || !value.trim()
              ? "bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-400 dark:text-[#334155] cursor-not-allowed"
              : "text-white hover:scale-105 shadow-md shadow-indigo-500/25"
          }`}
          style={
            isLoading || !value.trim()
              ? undefined
              : {
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  boxShadow: "0 0 20px rgba(99,102,241,0.4)",
                }
          }
          aria-label="Send query"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>

      <p className="mt-2 text-[10px] text-slate-500 dark:text-[#64748b]">
        ↵ Enter to send &nbsp;·&nbsp; Shift+↵ for new line
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
