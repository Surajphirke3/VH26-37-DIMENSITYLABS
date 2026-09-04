"use client";

import { useState, useRef, useEffect } from "react";
import type { Message, TroubleshootingResponse } from "@/lib/types";
import { sendMessage, disambiguate } from "@/lib/api";
import MessageInput from "@/components/chat/MessageInput";
import StructuredAnswer from "@/components/chat/StructuredAnswer";
import DisambiguationCard from "@/components/chat/DisambiguationCard";
import RefusalMessage from "@/components/chat/RefusalMessage";
import Spinner from "@/components/ui/Spinner";

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
  if (response.answer_type === "insufficient_information" || response.answer_type === "clarification_needed") {
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

export default function ChatInterface({ conversationId, machineId, onMachineSelect, onFirstMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Clear messages when conversation changes
  useEffect(() => {
    setMessages([]);
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const addUserMessage = (content: string) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", content, timestamp: new Date().toISOString() }]);
  };

  const addAssistantMessage = (response: TroubleshootingResponse) => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "assistant", content: response.summary, response, timestamp: new Date().toISOString() },
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
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(), role: "assistant", content: msg,
        response: { answer_type: "error", summary: msg, probable_causes: [], corrective_steps: [],
          citations: [], follow_up_suggestions: [] },
        timestamp: new Date().toISOString(),
      }]);
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
      addAssistantMessage({ answer_type: "error", summary: msg, probable_causes: [],
        corrective_steps: [], citations: [], follow_up_suggestions: [] });
    } finally {
      setIsLoading(false);
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
        Select or start a conversation to begin troubleshooting.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto chat-scroll px-4 py-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="text-center mt-16 text-slate-400 text-sm space-y-1">
            <p className="font-medium text-slate-500">Ready to troubleshoot</p>
            <p>Enter an error code or describe the fault symptom.</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "user" ? (
              <div className="max-w-[75%] px-4 py-2.5 rounded-2xl rounded-tr-sm bg-indigo-600 text-white text-sm">
                {msg.content}
              </div>
            ) : (
              <div className="max-w-[90%] w-full bg-white rounded-2xl rounded-tl-sm border border-slate-200 px-4 py-3 shadow-sm">
                {msg.response
                  ? renderAssistantContent(msg.response, handleDisambiguate, (s) => handleSend(s))
                  : <p className="text-sm text-slate-700">{msg.content}</p>}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-tl-sm border border-slate-200 px-4 py-3 shadow-sm">
              <Spinner size="sm" label="Searching manuals..." />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <MessageInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
