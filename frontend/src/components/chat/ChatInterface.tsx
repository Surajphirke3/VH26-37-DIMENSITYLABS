"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import type { Message, TroubleshootingResponse, Machine } from "@/lib/types";
import { sendMessage, disambiguate, getConversationMessages, getMachines } from "@/lib/api";
import ExecutionPipelineTracker from "@/components/common/ExecutionPipelineTracker";
import MessageInput from "@/components/chat/MessageInput";
import StructuredAnswer from "@/components/chat/StructuredAnswer";
import StructuredAnswerV2 from "@/components/chat/StructuredAnswerV2";
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
  Type,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { useSpaceWarp } from "@/components/common/SpaceWarpPortal";

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
  onSuggestion: (s: string) => void,
  chatVersion: "v1" | "v2" = "v2",
  textSize: "sm" | "base" | "lg" = "base",
  fontSizePx: number = 14
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
  if (chatVersion === "v2") {
    return (
      <StructuredAnswerV2
        response={response}
        onSuggestionClick={onSuggestion}
        textSize={textSize}
        fontSizePx={fontSizePx}
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
  const { t, language } = useLanguage();
  const { triggerWarp } = useSpaceWarp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTraces, setExpandedTraces] = useState<Record<string, boolean>>({});
  const [machines, setMachines] = useState<Machine[]>([]);
  const [showMachineDropdown, setShowMachineDropdown] = useState(false);
  const [chatVersion, setChatVersion] = useState<"v1" | "v2">("v2");
  const [isWarping, setIsWarping] = useState(false);
  const [warpTarget, setWarpTarget] = useState<"v1" | "v2">("v2");
  const [activeModelTier, setActiveModelTier] = useState<"auto" | "nord" | "forge" | "apex">("auto");
  const [textSize, setTextSize] = useState<"sm" | "base" | "lg">("base");
  const [fontSizePx, setFontSizePx] = useState<number>(14);
  const bottomRef = useRef<HTMLDivElement>(null);
  const machineDropdownRef = useRef<HTMLDivElement>(null);

  // Restore user preferences
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedVersion = localStorage.getItem("mendx_chat_version") as "v1" | "v2" | null;
      if (savedVersion === "v1" || savedVersion === "v2") {
        setChatVersion(savedVersion);
      }
      const savedFontSize = localStorage.getItem("mendx_chat_font_size");
      if (savedFontSize) {
        const parsed = parseInt(savedFontSize, 10);
        if (!isNaN(parsed) && parsed >= 12 && parsed <= 22) {
          setFontSizePx(parsed);
          if (parsed <= 13) setTextSize("sm");
          else if (parsed <= 16) setTextSize("base");
          else setTextSize("lg");
        }
      } else {
        const savedSize = localStorage.getItem("mendx_chat_text_size") as "sm" | "base" | "lg" | null;
        if (savedSize === "sm" || savedSize === "base" || savedSize === "lg") {
          setTextSize(savedSize);
          setFontSizePx(savedSize === "sm" ? 12 : savedSize === "base" ? 14 : 17);
        }
      }
    }
  }, []);

  const handleSetChatVersion = (v: "v1" | "v2") => {
    if (v === chatVersion) return;
    setWarpTarget(v);
    setIsWarping(true);
    setTimeout(() => {
      setChatVersion(v);
      if (typeof window !== "undefined") {
        localStorage.setItem("mendx_chat_version", v);
      }
    }, 260);
    setTimeout(() => {
      setIsWarping(false);
    }, 650);
  };

  const handleSetFontSizePx = (size: number) => {
    const clamped = Math.max(12, Math.min(22, size));
    setFontSizePx(clamped);
    const mappedSize: "sm" | "base" | "lg" = clamped <= 13 ? "sm" : clamped <= 16 ? "base" : "lg";
    setTextSize(mappedSize);
    if (typeof window !== "undefined") {
      localStorage.setItem("mendx_chat_font_size", clamped.toString());
      localStorage.setItem("mendx_chat_text_size", mappedSize);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (machineDropdownRef.current && !machineDropdownRef.current.contains(e.target as Node)) {
        setShowMachineDropdown(false);
      }
    };
    if (showMachineDropdown) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
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
    const effectiveModel = model || (chatVersion === "v2" && activeModelTier !== "auto" ? activeModelTier : undefined);
    addUserMessage(query, effectiveModel, imageData);
    if (messages.length === 0) onFirstMessage?.(query);
    setIsLoading(true);
    try {
      const res = await sendMessage(conversationId, query, machineId ?? undefined, effectiveModel, imageData, language);
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
      const res = await disambiguate(conversationId, selectedMachineId, language);
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
        <h3 className="text-base font-bold text-slate-200">
          {t("chat.noActiveSession", "No Active Diagnostic Session")}
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          {t("chat.selectSessionPrompt", "Select a session from the left sidebar or launch a new one to begin troubleshooting.")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-full w-full min-h-0 min-w-0 bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-500 relative overflow-hidden">
      {/* ── Space Dimensional Warp Transition Overlay ── */}
      {isWarping && (
        <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-center bg-black/85 backdrop-blur-xl animate-hyperspace-flash">
          <div className="relative p-6 sm:p-8 rounded-3xl border border-white/20 bg-slate-900/90 shadow-2xl text-center space-y-4 animate-portal-warp max-w-md mx-4">
            <div className="flex items-center justify-center gap-3">
              <span className="w-3 h-3 rounded-full bg-sky-400 animate-ping" />
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping delay-100" />
              <span className="w-3 h-3 rounded-full bg-rose-400 animate-ping delay-200" />
            </div>
            <div className="space-y-1">
              <div className="font-mono text-xs uppercase tracking-widest font-extrabold text-white">
                {warpTarget === "v2" ? (
                  <span className="bg-gradient-to-r from-sky-400 via-amber-400 to-rose-400 bg-clip-text text-transparent">
                    Warping to Tri-Model Neural Space
                  </span>
                ) : (
                  <span className="text-cyan-400">
                    Docking to SCADA Shopfloor Terminal
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                {warpTarget === "v2"
                  ? "Initializing Nord, Forge, and Apex reasoning lattices…"
                  : "Calibrating shopfloor sensor telemetry and alarms…"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Tri-Model Atmospheric Space Background (Active in v2) ── */}
      {chatVersion === "v2" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 transition-opacity duration-700 animate-fade-in">
          <div className="absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full bg-sky-500/10 dark:bg-sky-500/[0.08] filter blur-[100px] celestial-aura-nord" />
          <div className="absolute top-1/4 -right-20 w-[440px] h-[440px] rounded-full bg-amber-500/10 dark:bg-amber-500/[0.07] filter blur-[110px] celestial-aura-forge" />
          <div className="absolute -bottom-24 left-1/3 w-[520px] h-[520px] rounded-full bg-rose-500/10 dark:bg-rose-500/[0.07] filter blur-[120px] celestial-aura-apex" />
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:36px_36px] opacity-[0.03] dark:opacity-[0.06]" />
        </div>
      )}

      {/* ── High-Tech Grounded Equipment Context HUD ── */}
      <div className="px-3 sm:px-6 py-2 bg-slate-100/90 dark:bg-black/60 border-b border-slate-200 dark:border-white/[0.08] backdrop-blur-md flex items-center justify-between shrink-0 z-20 gap-2 min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 truncate">
          {currentMachine ? (
            <div className="flex items-center gap-2 min-w-0 truncate">
              <ManufacturerLogo
                name={currentMachine.name}
                manufacturer={currentMachine.manufacturer}
                size="sm"
              />
              <div className="min-w-0 truncate">
                <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {currentMachine.name}
                  </span>
                  <span className="px-1.5 py-0.2 rounded font-mono text-[9px] font-bold bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 shrink-0">
                    {currentMachine.model}
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse shrink-0" />
                  <span>{t("dashboard.groundedRagActive", "GROUNDED RAG ACTIVE")}</span>
                  <span className="text-slate-400 dark:text-slate-500">·</span>
                  <span className="text-slate-500 dark:text-slate-400 truncate">{t("dashboard.airGappedStore", "Air-gapped Vector Store")}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0 truncate">
              <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold shrink-0">
                ALL
              </div>
              <div className="min-w-0 truncate">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 truncate">{t("dashboard.fleetMode", "Fleet Wide Mode")}</span>
                  <span className="px-1.5 py-0.2 rounded font-mono text-[9px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 shrink-0">
                    {t("dashboard.crossMachine", "CROSS-MACHINE")}
                  </span>
                </div>
                <p className="hidden sm:block text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                  {t("dashboard.autoDisambiguating", "Auto-disambiguating across all indexed OEM manuals")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right HUD Controls: Tri-Model Space Portal, Text Size Switcher, Target Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Dedicated Tri-Model Space Portal Button */}
          <button
            type="button"
            onClick={() =>
              triggerWarp(
                "/space",
                "Entering Tri-Model Space",
                "Activating Nord, Forge & Apex high-dimensional reasoning domain…"
              )
            }
            className="px-2.5 sm:px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold text-white bg-gradient-to-r from-sky-500 via-indigo-600 to-rose-500 hover:from-sky-400 hover:to-rose-400 shadow-[0_0_20px_rgba(56,189,248,0.35)] border border-sky-400/40 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:scale-[1.03] active:scale-95"
            title="Traverse warp into the dedicated Tri-Model Space Page (Nord · Forge · Apex)"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-200 animate-pulse shrink-0" />
            <span className="hidden sm:inline bg-gradient-to-r from-sky-200 via-white to-rose-200 bg-clip-text text-transparent font-black">
              Tri-Model Space (Nord · Forge · Apex)
            </span>
            <span className="sm:hidden font-black">Space</span>
            <span className="text-[10px] font-mono px-1 rounded bg-white/20">3</span>
          </button>

          {/* Text Size Slider (Enlarge / Unlarge) */}
          <div className="hidden xs:flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-[11px] font-mono shadow-sm shrink-0">
            <button
              type="button"
              onClick={() => handleSetFontSizePx(fontSizePx - 1)}
              disabled={fontSizePx <= 12}
              className={`text-xs font-bold px-0.5 sm:px-1 transition-colors ${
                fontSizePx <= 12
                  ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              }`}
              title="Unlarge / Decrease text size (A-)"
              aria-label="Decrease text size"
            >
              A-
            </button>

            <input
              type="range"
              min={12}
              max={22}
              step={1}
              value={fontSizePx}
              onChange={(e) => handleSetFontSizePx(Number(e.target.value))}
              className="w-10 sm:w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500 dark:accent-sky-400"
              title={`Text Size: ${fontSizePx}px`}
              aria-label="Text size slider"
            />

            <button
              type="button"
              onClick={() => handleSetFontSizePx(fontSizePx + 1)}
              disabled={fontSizePx >= 22}
              className={`text-xs font-bold px-0.5 sm:px-1 transition-colors ${
                fontSizePx >= 22
                  ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              }`}
              title="Enlarge / Increase text size (A+)"
              aria-label="Increase text size"
            >
              A+
            </button>

            <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 w-5 sm:w-6 text-right">
              {fontSizePx}
            </span>
          </div>

          {/* Quick Target Switcher Pill */}
          <div className="relative shrink-0" ref={machineDropdownRef}>
            <button
              type="button"
              onClick={() => setShowMachineDropdown((v) => !v)}
              className="px-2 sm:px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-white/10 text-[11px] font-mono text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer shadow-sm max-w-[130px] sm:max-w-[180px] truncate"
            >
              <span className="truncate">{t("dashboard.target", "Target")}: {currentMachine ? currentMachine.model : t("dashboard.allMachines", "All Fleet")}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {showMachineDropdown && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 p-2 shadow-2xl z-50 animate-fade-in divide-y divide-slate-100 dark:divide-white/5">
                <div className="px-2 py-1.5 text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                  {t("dashboard.groundDiagnosticsOn", "Ground Diagnostics On:")}
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
                  <span>{t("dashboard.allEquipment", "All Equipment (Fleet Mode)")}</span>
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
      </div>

      {/* ── Tri-Model Neural Domain Space Bar (Active in v2) ── */}
      {chatVersion === "v2" && (
        <div className="px-3 sm:px-6 py-1.5 bg-slate-900/80 dark:bg-[#070b13]/85 border-b border-sky-500/20 backdrop-blur-xl flex items-center justify-between gap-2 text-xs z-10 animate-fade-in shadow-sm shrink-0 min-w-0 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2 py-0.5 rounded-full font-mono text-[9px] font-extrabold uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center gap-1.5 shadow-sm shrink-0">
              <Sparkles className="w-3 h-3 text-sky-400 animate-spin shrink-0" style={{ animationDuration: "10s" }} />
              <span>TRI-MODEL NEURAL SPACE</span>
            </span>
            <span className="hidden md:inline text-[11px] font-mono text-slate-400 truncate">
              Active Dimensional Plane:
            </span>
          </div>

          {/* Model Realm Selector */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-black/40 border border-white/10 text-[10px] font-mono shrink-0">
            <button
              type="button"
              onClick={() => setActiveModelTier("auto")}
              className={`px-2 sm:px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeModelTier === "auto"
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Automatically route queries based on error complexity"
            >
              ⚡ Auto Router
            </button>
            <button
              type="button"
              onClick={() => setActiveModelTier("nord")}
              className={`px-2 sm:px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                activeModelTier === "nord"
                  ? "bg-sky-500/25 text-sky-300 border border-sky-500/40 shadow-sm"
                  : "text-slate-400 hover:text-sky-400"
              }`}
              title="Nord Space: Edge PC & sub-second error code lookup"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
              <span>Nord Space</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveModelTier("forge")}
              className={`px-2 sm:px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                activeModelTier === "forge"
                  ? "bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-sm"
                  : "text-slate-400 hover:text-amber-400"
              }`}
              title="Forge Space: Workshop multi-step reasoning"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span>Forge Space</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveModelTier("apex")}
              className={`px-2 sm:px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                activeModelTier === "apex"
                  ? "bg-rose-500/25 text-rose-300 border border-rose-500/40 shadow-sm"
                  : "text-slate-400 hover:text-rose-400"
              }`}
              title="Apex Space: Safety-critical cloud cross-verification"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>Apex Space</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Main Message Feed ── */}
      <div className="flex-1 min-h-0 overflow-y-auto chat-scroll px-3 sm:px-6 py-3 sm:py-6">
        <div className={`w-full ${chatVersion === "v2" ? "max-w-3xl mx-auto space-y-6" : "space-y-6"}`}>
        {/* Interactive Launchpad (When No Messages Yet) */}
        {messages.length === 0 && !isLoading && (
          chatVersion === "v2" ? (
            /* ── Minimalist v2 Launchpad (Nord · Forge · Apex Tiers) ── */
            <div className="max-w-2xl mx-auto my-6 space-y-6 animate-fade-in text-center">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-2 shadow-sm flex items-center justify-center">
                  <img src="/brand-icon-dark.png" alt="MEND-X" className="w-full h-full object-contain hidden dark:block" />
                  <img src="/brand-icon-light.png" alt="MEND-X" className="w-full h-full object-contain block dark:hidden" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                  {t("chat.diagnosticEngine", "MEND-X Industrial Diagnostic Engine")}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                  Three-tier grounded intelligence. Every diagnosis is strictly cited against OEM manuals, schematics, and lockout procedures.
                </p>
              </div>

              {/* Three Model Tier Cards (Nord, Forge, Apex) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
                {/* 🔵 NORD Tier Card */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1017] border border-sky-500/20 hover:border-sky-500/40 transition-all shadow-sm flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="h-6 flex items-center">
                        <img src="/nord.png" alt="Nord Tier" className="h-5 w-auto object-contain" />
                      </div>
                      <span className="px-1.5 py-0.5 rounded font-mono text-[9px] font-bold bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/30">
                        &lt; 350ms
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                      Nord (Low Tier)
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Fast field lookup & edge alarm code matching.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSend("What does alarm code E-101 mean on the CNC milling machine?", "nord")}
                    className="w-full py-1.5 px-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 font-mono text-[10px] font-bold text-center border border-sky-500/20 transition-colors cursor-pointer"
                  >
                    Test: Spindle E-101 →
                  </button>
                </div>

                {/* 🟠 FORGE Tier Card */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1017] border border-amber-500/20 hover:border-amber-500/40 transition-all shadow-sm flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="h-6 flex items-center">
                        <img src="/forge.png" alt="Forge Tier" className="h-5 w-auto object-contain" />
                      </div>
                      <span className="px-1.5 py-0.5 rounded font-mono text-[9px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        ~ 1.5s
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Forge (Mid Tier)
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Multi-step troubleshooting & root cause analysis.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSend("Hydraulic oil overheating and pressure dropping after 2 hours run time", "forge")}
                    className="w-full py-1.5 px-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-bold text-center border border-amber-500/20 transition-colors cursor-pointer"
                  >
                    Test: Hydraulic Overheat →
                  </button>
                </div>

                {/* 🔴 APEX Tier Card */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1017] border border-rose-500/20 hover:border-rose-500/40 transition-all shadow-sm flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="h-6 flex items-center">
                        <img src="/apex.png" alt="Apex Tier" className="h-5 w-auto object-contain" />
                      </div>
                      <span className="px-1.5 py-0.5 rounded font-mono text-[9px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                        ~ 3.0s
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Apex (High Tier)
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Safety-critical cross-document disambiguation.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSend("Cross-check ambiguous fault code 401 across Fanuc and Siemens controller manuals", "apex")}
                    className="w-full py-1.5 px-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-mono text-[10px] font-bold text-center border border-rose-500/20 transition-colors cursor-pointer"
                  >
                    Test: Fanuc vs Siemens →
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ── Original v1 Cyber Launchpad ── */
            <div className="max-w-2xl mx-auto my-8 space-y-6 animate-fade-in text-center">
              {/* Cyber graphic */}
              <div className="relative inline-flex items-center justify-center p-4 rounded-3xl bg-gradient-to-b from-indigo-500/10 via-cyan-500/5 to-transparent border border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
                <div className="w-16 h-16 rounded-2xl bg-cyan-50 dark:bg-black/60 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <Activity className="w-8 h-8 animate-pulse" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {t("chat.diagnosticEngine", "MEND-X Industrial Diagnostic Engine")}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  {t("chat.diagnosticDesc", "Ground every troubleshooting response directly on verified OEM schematics, error fault tables, and field manuals.")}
                </p>
              </div>

              {/* Quick Fault Launchers */}
              <div className="pt-2 text-left space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block px-1">
                  {t("chat.quickProbes", "Quick Test Fault Probes:")}
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
                          {t("chat.launchProbe", "Launch Probe")} →
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
          )
        )}

        {/* Message Thread */}
        {messages.map((msg, idx) => {
          const textScaleClass = {
            sm: "text-xs",
            base: "text-sm",
            lg: "text-base",
          }[textSize];

          return (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              style={{ animationDelay: `${idx * 0.04}s` }}
            >
              {msg.role === "user" ? (
                chatVersion === "v2" ? (
                  /* ── User Bubble (v2 Clean Minimal) ── */
                  <div className="max-w-[85%] sm:max-w-[70%] space-y-1">
                    <div className="flex items-center justify-end gap-1.5 text-[10px] font-mono text-slate-400 pr-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                      <span>{t("chat.you", "You")}</span>
                    </div>
                    <div
                      className={`p-4 rounded-2xl rounded-tr-sm bg-slate-100 dark:bg-[#131824] border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm leading-relaxed ${textScaleClass}`}
                      style={{ fontSize: `${fontSizePx}px` }}
                    >
                      {msg.image_data && (
                        <div className="mb-3 rounded-xl overflow-hidden border border-slate-300 dark:border-white/10 relative">
                          <img src={msg.image_data} alt="Inspection attachment" className="max-h-60 w-full object-cover" />
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      {msg.model && (
                        <div className="mt-2 pt-1.5 border-t border-slate-200/60 dark:border-white/10 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                          <span>{msg.model.replace(/^openai\//, "").replace(/^groq\//, "")}</span>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* ── User Bubble (v1 SCADA Cyber) ── */
                  <div className="max-w-[85%] sm:max-w-[70%] space-y-1">
                    <div className="flex items-center justify-end gap-2 text-[10px] font-mono text-indigo-500 dark:text-indigo-300/80 pr-1 font-semibold">
                      <span>{t("chat.fieldTransmission", "FIELD OPERATOR TRANSMISSION")}</span>
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
                            {t("solution.opticalOcrDetected", "OPTICAL SCAN ATTACHED")}
                          </div>
                        </div>
                      )}

                      <p className="whitespace-pre-wrap">{msg.content}</p>

                      {msg.model && (
                        <div className="mt-2 pt-2 border-t border-white/15 text-[10px] text-indigo-200 font-mono flex items-center justify-between">
                          <span>{t("chat.routedVia", "Routed via")}: {msg.model.replace(/^openai\//, "").replace(/^groq\//, "")}</span>
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
                )
              ) : (
                chatVersion === "v2" ? (
                  /* ── Assistant Card (v2 Clean Minimal - Nord/Forge/Apex) ── */
                  <div className="max-w-[95%] sm:max-w-[85%] w-full rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-xs shadow-sm">
                          MX
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            MEND-X Diagnostic Engine
                          </span>
                          <span className="ml-2 text-[10px] font-mono text-sky-600 dark:text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                            Nord · Forge · Apex
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    {msg.response ? (
                      renderAssistantContent(msg.response, handleDisambiguate, (s) => handleSend(s), "v2", textSize, fontSizePx)
                    ) : (
                      <p className={`text-slate-800 dark:text-slate-200 leading-relaxed ${textScaleClass}`} style={{ fontSize: `${fontSizePx}px` }}>{msg.content}</p>
                    )}

                    <div className="pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => toggleTrace(msg.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>{expandedTraces[msg.id] ? "Hide" : "Inspect"} 8-Stage Execution Pipeline Trace</span>
                      </button>
                      <span className="text-[10px] font-mono text-slate-400">
                        OEM Grounded
                      </span>
                    </div>

                    {expandedTraces[msg.id] && (
                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 animate-fade-in">
                        <ExecutionPipelineTracker
                          isExecuting={false}
                          query={messages.find((_, i) => i === idx - 1)?.content}
                          variant="compact"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  /* ── Assistant Card (v1 SCADA Cyber) ── */
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
                              {t("chat.neuralDiagnostics", "MEND-X NEURAL DIAGNOSTICS")}
                            </span>
                            <span className="px-1.5 py-0.2 rounded font-mono text-[9px] font-bold bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                              SCADA v2.4
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                            <span>{t("chat.groundingIsolation", "VERIFIED GROUNDING ISOLATION")}</span>
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
                      renderAssistantContent(msg.response, handleDisambiguate, (s) => handleSend(s), "v1", textSize)
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
                        <span>⚡ {expandedTraces[msg.id] ? t("chat.hideTrace", "Hide") : t("chat.inspectTrace", "Inspect")} {t("chat.traceTitle", "8-Stage RAG Execution Trace")}</span>
                      </button>

                      <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                        <span>MANUALS</span>
                        <span>→</span>
                        <span>CHUNKS</span>
                        <span>→</span>
                        <span>VECTORS</span>
                        <span>→</span>
                        <span className="text-cyan-600 dark:text-cyan-400 font-bold">{t("solution.oemGrounded", "CITED SOLUTION")}</span>
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
                )
              )}
            </div>
          );
        })}

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

        </div>
        <div ref={bottomRef} />
      </div>

      {/* ── Command Bar Input ── */}
      <MessageInput
        onSend={handleSend}
        isLoading={isLoading}
        variant={chatVersion}
        activeModel={activeModelTier !== "auto" ? activeModelTier : undefined}
      />
    </div>
  );
}
