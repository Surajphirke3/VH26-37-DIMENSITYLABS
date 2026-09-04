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
      className="shrink-0 px-4 py-4"
      style={{
        background: "rgba(15,17,23,0.95)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Error Code Badge */}
      {hasErrorCode && (
        <div className="mb-2.5 animate-fade-in">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
            style={{
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.35)",
              color: "#a5b4fc",
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "#6366f1", boxShadow: "0 0 6px rgba(99,102,241,0.8)", animation: "statusBlink 1.5s ease infinite" }}
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
            className="input-glow w-full px-4 py-3 text-sm rounded-xl leading-relaxed"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#f1f5f9",
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
          className="shrink-0 w-12 h-12 flex items-center justify-center rounded-xl font-bold transition-all"
          style={
            isLoading || !value.trim()
              ? {
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#334155",
                  cursor: "not-allowed",
                }
              : {
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  boxShadow: "0 0 20px rgba(99,102,241,0.4)",
                  color: "#fff",
                  transform: "scale(1.02)",
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

      <p className="mt-2 text-[10px]" style={{ color: "#1e293b" }}>
        ↵ Enter to send &nbsp;·&nbsp; Shift+↵ for new line
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
