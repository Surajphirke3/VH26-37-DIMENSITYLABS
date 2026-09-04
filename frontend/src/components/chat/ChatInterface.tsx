"use client";

import { useState, useRef, useEffect } from "react";
import type { Message, TroubleshootingResponse } from "@/lib/types";
import { sendMessage, disambiguate } from "@/lib/api";
import MessageInput from "@/components/chat/MessageInput";
import StructuredAnswer from "@/components/chat/StructuredAnswer";
import DisambiguationCard from "@/components/chat/DisambiguationCard";
import RefusalMessage from "@/components/chat/RefusalMessage";

interface ChatInterfaceProps {
  conversationId: string | null;
  machineId: string | null;
  onMachineSelect?: (machineId: string) => void;
  onFirstMessage?: (query: string) => void;
}

function renderAssistantContent(
  response: TroubleshootingResponse,
  onDisambiguate: (id: string) => void,
  onSuggestion: (s: string) => void
) {
  if (response.answer_type === "disambiguation_required" && response.disambiguation_options) {
    return <DisambiguationCard options={response.disambiguation_options} onSelect={onDisambiguate} />;
  }
  if (
    response.answer_type === "insufficient_information" ||
    response.answer_type === "clarification_needed"
  ) {
    return (
      <RefusalMessage
        summary={response.summary}
        notes={response.notes}
        suggestions={response.follow_up_suggestions}
        onSuggestionClick={onSuggestion}
      />
    );
  }
  return <StructuredAnswer response={response} onSuggestionClick={onSuggestion} />;
}

export default function ChatInterface({
  conversationId,
  machineId,
  onMachineSelect,
  onFirstMessage,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMessages([]); }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const addUserMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content, timestamp: new Date().toISOString() },
    ]);
  };

  const addAssistantMessage = (response: TroubleshootingResponse) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.summary,
        response,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const handleSend = async (query: string) => {
    if (!conversationId) return;
    addUserMessage(query);
    if (messages.length === 0) onFirstMessage?.(query);
    setIsLoading(true);
    try {
      const res = await sendMessage(conversationId, query, machineId ?? undefined);
      addAssistantMessage(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: msg,
          response: {
            answer_type: "error",
            summary: msg,
            probable_causes: [],
            corrective_steps: [],
            citations: [],
            follow_up_suggestions: [],
          },
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisambiguate = async (selectedMachineId: string) => {
    if (!conversationId) return;
    onMachineSelect?.(selectedMachineId);
    setIsLoading(true);
    try {
      const res = await disambiguate(conversationId, selectedMachineId);
      addAssistantMessage(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Disambiguation failed.";
      addAssistantMessage({
        answer_type: "error",
        summary: msg,
        probable_causes: [],
        corrective_steps: [],
        citations: [],
        follow_up_suggestions: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!conversationId) {
    return (
      <div
        className="flex-1 flex items-center justify-center text-sm text-slate-500 dark:text-slate-400 bg-[var(--bg-base)]"
      >
        Select or start a conversation to begin troubleshooting.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Message Area */}
      <div className="flex-1 overflow-y-auto chat-scroll px-6 py-6 space-y-5">
        {messages.length === 0 && !isLoading && (
          <div className="text-center mt-12 animate-fade-in">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 shadow-sm"
            >
              <svg className="w-7 h-7 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
              </svg>
            </div>
            <p className="font-semibold text-sm text-slate-700 dark:text-[#64748b]">
              Ready to troubleshoot
            </p>
            <p className="text-xs mt-1 text-slate-500 dark:text-[#334155]">
              Enter an error code or describe the fault symptom.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            {msg.role === "user" ? (
              /* User bubble */
              <div
                className="max-w-[70%] px-4 py-3 rounded-2xl rounded-tr-sm text-sm font-medium leading-relaxed shadow-md shadow-indigo-600/25"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "#fff",
                }}
              >
                {msg.content}
              </div>
            ) : (
              /* AI response card */
              <div
                className="max-w-[90%] w-full rounded-2xl rounded-tl-sm px-5 py-4 bg-white dark:bg-[rgba(15,17,23,0.9)] border border-slate-200 dark:border-white/[0.07] shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.5)] transition-colors"
              >
                {/* AI header */}
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100 dark:border-white/[0.05]">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-emerald-500/10 border border-emerald-500/20"
                  >
                    <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-[#10b981]">
                    MEND - X AI
                  </span>
                  <span className="text-[10px] ml-auto text-slate-400 dark:text-[#334155]">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {msg.response
                  ? renderAssistantContent(
                      msg.response,
                      handleDisambiguate,
                      (s) => handleSend(s)
                    )
                  : <p className="text-sm text-slate-700 dark:text-[#94a3b8]">{msg.content}</p>}
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div
              className="px-5 py-4 rounded-2xl rounded-tl-sm bg-white dark:bg-[rgba(15,17,23,0.9)] border border-slate-200 dark:border-white/[0.07] shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.5)] transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20"
                >
                  <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-emerald-600 dark:text-[#10b981]">
                  MEND - X AI
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
                <span className="text-xs text-slate-500 dark:text-[#334155]">
                  Searching manuals…
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <MessageInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
