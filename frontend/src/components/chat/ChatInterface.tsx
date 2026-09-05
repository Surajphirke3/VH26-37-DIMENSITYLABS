"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import type { Message, TroubleshootingResponse, Machine } from "@/lib/types";
import { sendMessage, disambiguate, getConversationMessages, getMachines } from "@/lib/api";
import ExecutionPipelineTracker from "@/components/common/ExecutionPipelineTracker";
import MessageInput from "@/components/chat/MessageInput";
import StructuredAnswer from "@/components/chat/StructuredAnswer";
import DisambiguationCard from "@/components/chat/DisambiguationCard";
import RefusalMessage from "@/components/chat/RefusalMessage";
import ManufacturerLogo from "@/components/common/ManufacturerLogo";
import {
  Cpu,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Activity,
  Layers,
  ChevronDown,
  Terminal,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface ChatInterfaceProps {
  conversationId: string | null;
  machineId: string | null;
  onMachineSelect?: (machineId: string) => void;
  onFirstMessage?: (query: string) => void;
}

const QUICK_DIAGNOSTIC_PRESETS = [
  {
    title: "Haas Spindle Overheat",
    code: "Alarm 102",
    query: "Alarm 102 Spindle Motor Overheat on Haas VF-4 CNC mill",
    brand: "Haas",
  },
  {
    title: "Siemens S120 Inverter",
    code: "F01043",
    query: "SINAMICS S120 drive fault F01043 motor temperature sensor failure",
    brand: "Siemens",
  },
  {
    title: "GSK 990M 铣床报警",
    code: "Alarm 101",
    query: "GSK990M alarm 101 spindle speed mismatch error",
    brand: "GSK CNC",
  },
  {
    title: "Allen-Bradley PowerFlex",
    code: "F004",
    query: "PowerFlex 755 drive fault F004 under-voltage bus trip",
    brand: "Allen-Bradley",
  },
];

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
    response.answer_type === "clarification_needed" ||
    response.answer_type === "out_of_scope"
  ) {
    return (
      <RefusalMessage
        type={response.answer_type}
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
  const [expandedTraces, setExpandedTraces] = useState<Record<string, boolean>>({});
  const [machines, setMachines] = useState<Machine[]>([]);
  const [showMachineDropdown, setShowMachineDropdown] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const machineDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (machineDropdownRef.current && !machineDropdownRef.current.contains(e.target as Node)) {
        setShowMachineDropdown(false);
      }
    };
    if (showMachineDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMachineDropdown]);

  // Load machines for the context HUD
  useEffect(() => {
    getMachines().then(setMachines).catch(console.error);
  }, []);

  const currentMachine = machines.find((m) => m.id === machineId);

  const toggleTrace = (id: string) => {
    setExpandedTraces((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    getConversationMessages(conversationId)
      .then((data) => {
        if (!isMounted) return;
        const history: Message[] = (data.messages || []).map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          response:
            m.response ||
            (m.role === "assistant" && m.answer_type
              ? {
                  answer_type: m.answer_type as any,
                  summary: m.content,
                  probable_causes: [],
                  corrective_steps: [],
                  citations: [],
                  follow_up_suggestions: [],
                  confidence_level: m.confidence_level as any,
                  evidence_score: m.evidence_score ?? undefined,
                  total_latency_ms: m.total_latency_ms ?? undefined,
                }
              : undefined),
          timestamp: m.created_at || new Date().toISOString(),
        }));
        setMessages(history);
      })
      .catch((err) => {
        console.error("Failed to load message history:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const addUserMessage = (content: string, model?: string, imageData?: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        content,
        model,
        image_data: imageData,
        timestamp: new Date().toISOString(),
      },
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

  const handleSend = async (query: string, model?: string, imageData?: string) => {
    if (!conversationId) return;
    addUserMessage(query, model, imageData);
    if (messages.length === 0) onFirstMessage?.(query);
    setIsLoading(true);
    try {
      const res = await sendMessage(conversationId, query, machineId ?? undefined, model, imageData);
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
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[var(--bg-base)]">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-lg">
          <Terminal className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-200">No Active Diagnostic Session</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          Select a session from the left sidebar or launch a new one to begin troubleshooting.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-200 relative overflow-hidden">
      {/* ── High-Tech Grounded Equipment Context HUD ── */}
      <div className="px-6 py-2.5 bg-slate-100/90 dark:bg-black/60 border-b border-slate-200 dark:border-white/[0.08] backdrop-blur-md flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          {currentMachine ? (
            <div className="flex items-center gap-2 min-w-0">
              <ManufacturerLogo
                name={currentMachine.name}
                manufacturer={currentMachine.manufacturer}
                size="sm"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {currentMachine.name}
                  </span>
                  <span className="px-1.5 py-0.2 rounded font-mono text-[9px] font-bold bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                    {currentMachine.model}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                  <span>GROUNDED RAG ACTIVE</span>
                  <span className="text-slate-400 dark:text-slate-500">·</span>
                  <span className="text-slate-500 dark:text-slate-400">Air-gapped Vector Store</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold">
                ALL
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Fleet Wide Mode</span>
                  <span className="px-1.5 py-0.2 rounded font-mono text-[9px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                    CROSS-MACHINE
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  Auto-disambiguating across all indexed OEM manuals
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Target Switcher Pill */}
        <div ref={machineDropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setShowMachineDropdown((v) => !v)}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-white/10 text-[11px] font-mono text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>Target: {currentMachine ? currentMachine.model : "All Fleet"}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showMachineDropdown && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 p-2 shadow-2xl z-50 animate-fade-in divide-y divide-slate-100 dark:divide-white/5">
              <div className="px-2 py-1.5 text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                Ground Diagnostics On:
              </div>
              <button
                type="button"
                onClick={() => {
                  onMachineSelect?.("");
                  setShowMachineDropdown(false);
                }}
                className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  !machineId
                    ? "bg-indigo-600 text-white font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <span>All Equipment (Fleet Mode)</span>
                {!machineId && <span className="text-[10px]">✓</span>}
              </button>

              <div className="pt-1 space-y-0.5 max-h-48 overflow-y-auto">
                {machines.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      onMachineSelect?.(m.id);
                      setShowMachineDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      machineId === m.id
                        ? "bg-indigo-600 text-white font-bold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate mr-2">
                      <ManufacturerLogo name={m.name} manufacturer={m.manufacturer} size="xs" />
                      <span className="truncate">{m.name}</span>
                    </div>
                    <span className="text-[10px] font-mono opacity-70 shrink-0">{m.model}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Message Feed ── */}
      <div className="flex-1 overflow-y-auto chat-scroll px-4 sm:px-6 py-6 space-y-6">
        {/* Interactive Launchpad (When No Messages Yet) */}
        {messages.length === 0 && !isLoading && (
          <div className="max-w-2xl mx-auto my-8 space-y-6 animate-fade-in text-center">
            {/* Cyber graphic */}
            <div className="relative inline-flex items-center justify-center p-4 rounded-3xl bg-gradient-to-b from-indigo-500/10 via-cyan-500/5 to-transparent border border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
              <div className="w-16 h-16 rounded-2xl bg-cyan-50 dark:bg-black/60 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <Activity className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                MEND-X Industrial Diagnostic Engine
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Ground every troubleshooting response directly on verified OEM schematics, error fault
                tables, and field manuals.
              </p>
            </div>

            {/* Quick Fault Launchers */}
            <div className="pt-2 text-left space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block px-1">
                Quick Test Fault Probes:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {QUICK_DIAGNOSTIC_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(preset.query)}
                    className="p-3 rounded-2xl bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 hover:border-cyan-500/40 text-left transition-all group cursor-pointer shadow-sm hover:shadow-[0_4px_20px_rgba(6,182,212,0.15)]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        {preset.code}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        Launch Probe →
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-white transition-colors">
                      {preset.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                      {preset.brand}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
            style={{ animationDelay: `${idx * 0.04}s` }}
          >
            {msg.role === "user" ? (
              /* ── User Operator Bubble ── */
              <div className="max-w-[85%] sm:max-w-[70%] space-y-1">
                <div className="flex items-center justify-end gap-2 text-[10px] font-mono text-indigo-500 dark:text-indigo-300/80 pr-1 font-semibold">
                  <span>FIELD OPERATOR TRANSMISSION</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                </div>

                <div className="p-4 rounded-2xl rounded-tr-sm bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-indigo-600/90 dark:to-violet-700/90 border border-indigo-400/30 text-white shadow-lg shadow-indigo-500/20 text-sm leading-relaxed backdrop-blur-md">
                  {msg.image_data && (
                    <div className="mb-3 rounded-xl overflow-hidden border border-white/20 relative">
                      <img
                        src={msg.image_data}
                        alt="Inspection attachment"
                        className="max-h-60 w-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] font-mono text-emerald-400 border border-emerald-500/30">
                        OPTICAL SCAN ATTACHED
                      </div>
                    </div>
                  )}

                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {msg.model && (
                    <div className="mt-2 pt-2 border-t border-white/15 text-[10px] text-indigo-200 font-mono flex items-center justify-between">
                      <span>Routed via: {msg.model.replace(/^openai\//, "").replace(/^groq\//, "")}</span>
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ── Assistant Grounded Diagnostic Card ── */
              <div className="max-w-[95%] sm:max-w-[90%] w-full rounded-2xl rounded-tl-sm p-5 sm:p-6 bg-white dark:bg-[#0c101b]/95 border border-slate-200 dark:border-cyan-500/20 shadow-xl shadow-slate-200/50 dark:shadow-black/40 backdrop-blur-xl relative overflow-hidden">
                {/* Cyber Corner Accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

                {/* AI Card Header */}
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200 dark:border-white/[0.08] flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/25">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white">
                          MEND-X NEURAL DIAGNOSTICS
                        </span>
                        <span className="px-1.5 py-0.2 rounded font-mono text-[9px] font-bold bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                          SCADA v2.4
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                        <span>VERIFIED GROUNDING ISOLATION</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Structured Output Content */}
                {msg.response ? (
                  renderAssistantContent(msg.response, handleDisambiguate, (s) => handleSend(s))
                ) : (
                  <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">{msg.content}</p>
                )}

                {/* 8-Stage Execution Pipeline Drawer Toggle */}
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggleTrace(msg.id)}
                    className="inline-flex items-center gap-2 text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 font-bold transition-all cursor-pointer group"
                  >
                    <Zap className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span>⚡ {expandedTraces[msg.id] ? "Hide" : "Inspect"} 8-Stage RAG Execution Trace</span>
                  </button>

                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                    <span>MANUALS</span>
                    <span>→</span>
                    <span>CHUNKS</span>
                    <span>→</span>
                    <span>VECTORS</span>
                    <span>→</span>
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold">CITED SOLUTION</span>
                  </div>
                </div>

                {expandedTraces[msg.id] && (
                  <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-cyan-500/20 animate-fade-in">
                    <ExecutionPipelineTracker
                      isExecuting={false}
                      query={messages.find((_, i) => i === idx - 1)?.content}
                      variant="compact"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Live Execution Tracker While Streaming */}
        {isLoading && (
          <div className="flex justify-start animate-fade-in w-full">
            <div className="max-w-[95%] sm:max-w-[85%] w-full">
              <ExecutionPipelineTracker
                isExecuting={isLoading}
                query={messages[messages.length - 1]?.content}
                variant="compact"
              />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── High-Tech Command Bar Input ── */}
      <MessageInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
