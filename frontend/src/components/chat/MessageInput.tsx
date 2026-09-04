"use client";

import { useState, useRef, KeyboardEvent, ChangeEvent } from "react";
import { Image as ImageIcon, X, Sparkles, Cpu } from "lucide-react";

interface MessageInputProps {
  onSend: (query: string, model?: string, imageData?: string) => void;
  isLoading: boolean;
}

const ERROR_CODE_RE = /\b[A-Z]{1,4}[-_]?\d{2,5}\b/;

const GROQ_MODELS = [
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B (Versatile)" },
  { id: "qwen-2.5-32b", name: "Qwen 2.5 32B (Deep Reasoning)" },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B (Fast / Sub-second)" },
  { id: "llama-3.2-11b-vision-preview", name: "Llama 3.2 11B (Vision)" },
];

export default function MessageInput({ onSend, isLoading }: MessageInputProps) {
  const [value, setValue] = useState("");
  const [selectedModel, setSelectedModel] = useState("llama-3.3-70b-versatile");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasErrorCode = ERROR_CODE_RE.test(value);

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    setImageName(file.name);
    // Automatically switch to vision model if image attached
    setSelectedModel("llama-3.2-11b-vision-preview");

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setSelectedImage(uploadEvent.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImageName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = () => {
    const trimmed = value.trim();
    if ((!trimmed && !selectedImage) || isLoading) return;
    onSend(trimmed || "Analyze this attached equipment photo for fault symptoms and diagnostic recommendations.", selectedModel, selectedImage || undefined);
    setValue("");
    removeImage();
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
      {/* Error Code Badge & Controls Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <div>
          {hasErrorCode && (
            <div className="animate-fade-in">
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
        </div>

        {/* Model selector pill */}
        <div className="flex items-center gap-1.5 ml-auto text-xs">
          <Cpu className="w-3.5 h-3.5 text-amber-500" />
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] rounded-md px-2 py-1 text-[11px] font-mono text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {GROQ_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Attached Image Preview */}
      {selectedImage && (
        <div className="mb-2.5 flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] rounded-lg animate-fade-in">
          <img
            src={selectedImage}
            alt="Attached inspection"
            className="w-10 h-10 object-cover rounded border border-border"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{imageName || "Equipment Image"}</p>
            <span className="text-[10px] text-amber-500 font-medium">Vision Model Active</span>
          </div>
          <button
            type="button"
            onClick={removeImage}
            className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-3">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
          id="chat-image-upload"
        />

        {/* Image upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="shrink-0 w-11 h-11 flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-600 dark:text-slate-300 transition-colors"
          title="Attach equipment photo for visual inspection"
        >
          <ImageIcon className="w-5 h-5 text-amber-500" />
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            id="chat-input"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKey}
            disabled={isLoading}
            rows={2}
            placeholder="Enter error code (E101), symptom, or attach a photo…"
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
          disabled={isLoading || (!value.trim() && !selectedImage)}
          className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-xl font-bold transition-all ${
            isLoading || (!value.trim() && !selectedImage)
              ? "bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-400 dark:text-[#334155] cursor-not-allowed"
              : "text-white hover:scale-105 shadow-md shadow-indigo-500/25"
          }`}
          style={
            isLoading || (!value.trim() && !selectedImage)
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
        ↵ Enter to send &nbsp;·&nbsp; Shift+↵ for new line &nbsp;·&nbsp; Multilingual & Multimodal Enabled
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
