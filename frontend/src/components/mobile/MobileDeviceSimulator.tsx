"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Wifi,
  Battery,
  Camera,
  Mic,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  RotateCcw,
  Zap,
  Clock,
  ShieldCheck,
  ChevronRight,
  Sliders,
  CheckSquare,
  Square,
  ArrowRight,
  X,
  RefreshCw,
  Flashlight,
  Video,
  VideoOff,
  Crosshair,
  ShieldAlert,
} from "lucide-react";
import { singleQuery } from "@/lib/api";
import type { TroubleshootingResponse, Machine } from "@/lib/types";
import ExecutionPipelineTracker from "@/components/common/ExecutionPipelineTracker";
import Spinner from "@/components/ui/Spinner";

export interface MobileSimulatorProps {
  initialMachine?: Machine;
  availableMachines?: Machine[];
  initialQuery?: string;
  defaultModel?: string;
  className?: string;
}

interface ChatBubble {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  imagePreview?: string;
  response?: TroubleshootingResponse;
}

const MOBILE_QUICK_PRESETS = [
  {
    label: "Haas Spindle Overheat (Alarm 102)",
    query: "Haas VF-4 Alarm 102 spindle motor overheat during roughing pass. What is the check procedure?",
    model: "openai/gpt-oss-20b",
    machineName: "HAAS VF-4 CNC",
  },
  {
    label: "Siemens Bus Timeout (0x80)",
    query: "Siemens S7-1500 PLC PROFINET communication timeout error 0x80 on remote I/O rack. How to troubleshoot?",
    model: "openai/gpt-oss-120b",
    machineName: "Siemens S7-1500",
  },
  {
    label: "KUKA Resolver Drift (Axis 3)",
    query: "KUKA KR210 robot arm Axis 3 kinematic resolver drift exceeding 0.05 degrees during payload transition.",
    model: "openai/gpt-oss-120b",
    machineName: "KUKA KR210",
  },
  {
    label: "Refusal Filter Test",
    query: "Can you write a poem about chocolate chip cookies and how to bake them in an oven?",
    model: "openai/gpt-oss-20b",
    machineName: "Global",
  },
];

export default function MobileDeviceSimulator({
  initialMachine,
  availableMachines = [],
  initialQuery = "Haas VF-4 Alarm 102 spindle motor overheat during roughing pass. What is the check procedure?",
  defaultModel = "auto",
  className = "",
}: MobileSimulatorProps) {
  const [deviceSkin, setDeviceSkin] = useState<"iphone" | "rugged">("iphone");
  const [scale, setScale] = useState<number>(1);
  const [inputQuery, setInputQuery] = useState(initialQuery);
  const [selectedMachineId, setSelectedMachineId] = useState<string>(initialMachine?.id || "");
  const [selectedModel, setSelectedModel] = useState<string>(defaultModel);
  const [isLoading, setIsLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [liveTime, setLiveTime] = useState<string>("");

  // ── Camera & Permissions State ──
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [permissionDeniedToast, setPermissionDeniedToast] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment");
  const [torchActive, setTorchActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [shutterFlash, setShutterFlash] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [messages, setMessages] = useState<ChatBubble[]>([
    {
      id: "init-1",
      sender: "ai",
      text: "Field Diagnostic Agent connected. Ready for shop-floor troubleshooting. Scan alarm panel or enter fault code.",
      timestamp: "09:41",
    },
  ]);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // Live real-time clock ticking every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateTime();

    // Initialize greeting timestamp with actual live time
    const initialTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) =>
      prev.map((m) => (m.id === "init-1" ? { ...m, timestamp: initialTime } : m))
    );

    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const toggleStepCheck = (key: string) => {
    setCheckedSteps((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSend = async (queryToSend?: string, modelOverride?: string) => {
    const q = queryToSend || inputQuery;
    if (!q.trim() || isLoading) return;

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userBubble: ChatBubble = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: time,
      imagePreview: attachedImage || undefined,
    };

    setMessages((prev) => [...prev, userBubble]);
    setInputQuery("");
    setAttachedImage(null);
    setIsLoading(true);

    const activeModel = modelOverride || (selectedModel === "auto" ? undefined : selectedModel);
    const machine = availableMachines.find((m) => m.id === selectedMachineId);

    try {
      const result = await singleQuery(q, selectedMachineId || undefined, machine?.name, activeModel);
      const aiBubble: ChatBubble = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: result.summary || "Diagnostic assessment protocol ready.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        response: result,
      };
      setMessages((prev) => [...prev, aiBubble]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Diagnostics request failed.";
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "ai",
          text: `Error: ${msg}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPreset = (preset: typeof MOBILE_QUICK_PRESETS[0]) => {
    setInputQuery(preset.query);
    if (preset.model) setSelectedModel(preset.model);

    if (preset.machineName && availableMachines.length > 0) {
      const match = availableMachines.find((m) =>
        m.name.toLowerCase().includes(preset.machineName.toLowerCase()) ||
        preset.machineName.toLowerCase().includes(m.name.toLowerCase())
      );
      if (match) setSelectedMachineId(match.id);
    }

    handleSend(preset.query, preset.model);
  };

  const playShutterSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(750, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.09);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Audio playback fails gracefully if browser requires user gesture
    }
  };

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCameraStream = useCallback(async (facing: "environment" | "user") => {
    stopCameraStream();
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("WebRTC camera API not available in this environment.");
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: unknown) {
      const errString = err instanceof Error ? err.message : "Camera feed inaccessible";
      console.warn("Camera access note:", errString);
      setCameraError("Hardware feed restricted. Optical Scanner Simulation engaged.");
    }
  }, [stopCameraStream]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  const handleCameraIconClick = () => {
    if (isCameraOpen) {
      stopCameraStream();
      setIsCameraOpen(false);
      return;
    }

    if (!hasCameraPermission) {
      setShowPermissionDialog(true);
    } else {
      setIsCameraOpen(true);
      startCameraStream(cameraFacing);
    }
  };

  const handleGrantPermission = (scope: "app" | "once" = "app") => {
    if (scope === "app") {
      setHasCameraPermission(true);
    }
    setShowPermissionDialog(false);
    setPermissionDeniedToast(null);
    setIsCameraOpen(true);
    startCameraStream(cameraFacing);
  };

  const handleDenyPermission = () => {
    setShowPermissionDialog(false);
    setPermissionDeniedToast("Camera permission denied. Tap camera icon again to grant access or switch devices.");
    setTimeout(() => {
      setPermissionDeniedToast(null);
    }, 4500);
  };

  const handleFlipCamera = () => {
    const nextFacing = cameraFacing === "environment" ? "user" : "environment";
    setCameraFacing(nextFacing);
    startCameraStream(nextFacing);
  };

  const handleToggleTorch = () => {
    setTorchActive((prev) => !prev);
  };

  const handleCloseCamera = () => {
    stopCameraStream();
    setIsCameraOpen(false);
    setTorchActive(false);
  };

  const handleCapturePhoto = (sampleFallback = false) => {
    setIsCapturing(true);
    setShutterFlash(true);
    playShutterSound();

    setTimeout(() => {
      setShutterFlash(false);
    }, 180);

    let finalImageUrl: string | null = null;

    if (!sampleFallback && videoRef.current && canvasRef.current && streamRef.current) {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const w = video.videoWidth || 640;
        const h = video.videoHeight || 480;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, w, h);
          finalImageUrl = canvas.toDataURL("image/jpeg", 0.88);
        }
      } catch (err) {
        console.warn("Canvas capture fallback:", err);
      }
    }

    // If hardware camera produced no frame (e.g. simulation mode or user clicked sample)
    if (!finalImageUrl) {
      finalImageUrl =
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='440' height='260' viewBox='0 0 440 260'><rect width='440' height='260' fill='%23080b12'/><rect x='14' y='14' width='412' height='232' rx='12' fill='%23111827' stroke='%23ef4444' stroke-width='2'/><circle cx='36' cy='36' r='6' fill='%23ef4444'/><text x='52' y='41' fill='%23ef4444' font-family='monospace' font-size='13' font-weight='bold'>HAAS CNC ALARM 102 - SPINDLE MOTOR OVERHEAT</text><line x1='14' y1='56' x2='426' y2='56' stroke='%23374151' stroke-width='1'/><text x='28' y='86' fill='%23f9fafb' font-family='monospace' font-size='11'>THERMAL CUTOFF: SENSOR 02 TRIP AT 98.4°C (LIMIT: 85°C)</text><text x='28' y='108' fill='%239ca3af' font-family='monospace' font-size='10'>CABINET: HAAS VF-4 50-TAPER · SPINDLE MOTOR FAN STALL</text><rect x='28' y='126' width='384' height='72' rx='6' fill='%231f2937' stroke='%234b5563' stroke-width='1'/><text x='38' y='148' fill='%23f59e0b' font-family='monospace' font-size='10' font-weight='bold'>FAULT TELEMETRY LOG #7719-B:</text><text x='38' y='167' fill='%23e5e7eb' font-family='monospace' font-size='9'>Coolant heat-exchanger intake blocked or thermistor faulty.</text><text x='38' y='184' fill='%2310b981' font-family='monospace' font-size='9'>Grounded Manual Citation: Sec 9.4 Cooling Loop Overhaul</text><text x='28' y='224' fill='%236b7280' font-family='monospace' font-size='8'>CAMERA SNAPSHOT · MEND-X MOBILE OPTICAL HUD</text></svg>";
    }

    setAttachedImage(finalImageUrl);
    setIsCapturing(false);
    handleCloseCamera();
  };

  const handleResetMobileChat = () => {
    const liveNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages([
      {
        id: "init-1",
        sender: "ai",
        text: "Field Diagnostic Agent connected. Ready for shop-floor troubleshooting. Scan alarm panel or enter fault code.",
        timestamp: liveNow,
      },
    ]);
    setCheckedSteps({});
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-6 ${className}`}>
      
      {/* ── Top Controls: Device Skin & Scale ── */}
      <div className="flex flex-wrap items-center justify-center gap-3 p-2 rounded-2xl bg-white/90 dark:bg-[#0c1017]/90 border border-slate-200 dark:border-white/10 shadow-lg backdrop-blur-xl text-xs font-mono">
        <div className="flex items-center gap-1.5 px-2 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
          <span>Device Simulation:</span>
        </div>

        {/* Skin Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08]">
          <button
            type="button"
            onClick={() => setDeviceSkin("iphone")}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              deviceSkin === "iphone"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            📱 iPhone 15 Pro
          </button>
          <button
            type="button"
            onClick={() => setDeviceSkin("rugged")}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              deviceSkin === "rugged"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            🏭 Rugged Scanner (Zebra)
          </button>
        </div>

        {/* Scale Toggle */}
        <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08]">
          {[1, 0.9, 0.8].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScale(s)}
              className={`px-2 py-0.5 rounded text-[11px] transition-all cursor-pointer ${
                scale === s
                  ? "bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-bold"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
              }`}
            >
              {Math.round(s * 100)}%
            </button>
          ))}
        </div>

        {/* Reset */}
        <button
          type="button"
          onClick={handleResetMobileChat}
          className="px-2.5 py-1 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all flex items-center gap-1 cursor-pointer"
          title="Reset Mobile Conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* ── The Physical Mobile Device Frame ── */}
      <div
        className="transition-transform duration-300 origin-top flex justify-center"
        style={{ transform: `scale(${scale})` }}
      >
        <div
          className={`relative overflow-hidden transition-all duration-300 select-none shadow-[0_25px_70px_rgba(0,0,0,0.65)] ${
            deviceSkin === "iphone"
              ? "w-[390px] h-[810px] rounded-[52px] bg-[#090b10] border-[10px] border-[#2d313d] ring-1 ring-white/20"
              : "w-[410px] h-[830px] rounded-[36px] bg-[#0c0d12] border-[14px] border-[#22242c] ring-4 ring-[#eab308]/80 shadow-[0_0_30px_rgba(234,179,8,0.2)]"
          }`}
        >
          {/* Rugged Bumper Accents (if Zebra mode) */}
          {deviceSkin === "rugged" && (
            <>
              <div className="absolute top-0 left-0 w-8 h-8 rounded-br-2xl bg-amber-500 z-50 pointer-events-none flex items-center justify-center font-mono text-[8px] font-black text-black">
                IP68
              </div>
              <div className="absolute top-0 right-0 w-8 h-8 rounded-bl-2xl bg-amber-500 z-50 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-8 h-8 rounded-tr-2xl bg-amber-500 z-50 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-tl-2xl bg-amber-500 z-50 pointer-events-none" />
              {/* Laser Scan Window Bar */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-3 rounded-t-lg bg-red-600/80 border border-red-400 z-50 flex items-center justify-center text-[7px] font-mono text-white tracking-widest uppercase">
                LASER BARCODE
              </div>
            </>
          )}

          {/* iPhone Dynamic Island / Speaker Slit */}
          {deviceSkin === "iphone" && (
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-7 rounded-full bg-black z-50 flex items-center justify-between px-2.5 shadow-md">
              <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-[#222]" />
              <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
            </div>
          )}

          {/* ── Inner Mobile Screen ── */}
          <div className="w-full h-full flex flex-col bg-[#07090e] text-slate-100 font-sans text-xs relative pt-11 pb-6">
            
            {/* 1. Mobile Status Bar */}
            <div className="absolute top-3 left-0 right-0 px-6 flex items-center justify-between text-[11px] font-semibold text-slate-300 z-40 select-none">
              <span className="font-mono text-[11px] font-bold tracking-tight text-white">{liveTime || "09:41:00"}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold text-teal-400">5G</span>
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            {/* 2. Mobile Field Agent Header */}
            <div className="px-4 py-2.5 bg-[#0f121a] border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md">
                  M
                </div>
                <div>
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="font-bold text-xs text-white">MEND-X Field</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <span className="text-[10px] font-mono text-teal-400">
                    {availableMachines.find((m) => m.id === selectedMachineId)?.name || "Connected (BLE Line 1)"}
                  </span>
                </div>
              </div>

              {/* Model Chip & Quick Camera Scanner */}
              <div className="flex items-center gap-1.5">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="px-2 py-0.5 rounded-lg bg-black/40 border border-white/15 text-[10px] font-mono text-slate-300 outline-none"
                >
                  <option value="auto">Auto Router</option>
                  <option value="openai/gpt-oss-120b">GPT-OSS 120B (Groq)</option>
                  <option value="openai/gpt-oss-20b">GPT-OSS 20B (Groq Fast)</option>
                  <option value="groq/compound-mini">Groq Compound Mini</option>
                </select>

                <button
                  type="button"
                  onClick={handleCameraIconClick}
                  title="Open Camera & Optical Scanner"
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    isCameraOpen || attachedImage
                      ? "bg-indigo-600 text-white border-indigo-400"
                      : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 3. Quick 1-Tap Field Presets Bar */}
            <div className="px-3 py-2 bg-[#0a0c13] border-b border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {MOBILE_QUICK_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickPreset(preset)}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-indigo-500/20 border border-white/[0.08] hover:border-indigo-500/40 text-[10px] font-mono text-slate-300 whitespace-nowrap transition-all shrink-0 cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* 4. Scrollable Chat & Diagnostic Feed */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-3 space-y-3 chat-scroll"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"} space-y-1`}
                >
                  {/* Sender & Timestamp */}
                  <span className="text-[9px] font-mono text-slate-500 px-1">
                    {msg.sender === "user" ? "Technician" : "MEND-X AI Grounded"} · {msg.timestamp}
                  </span>

                  {/* Bubble Content */}
                  <div
                    className={`max-w-[92%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-tr-sm shadow-md"
                        : "bg-[#121520] border border-white/10 text-slate-200 rounded-tl-sm shadow-sm space-y-2.5"
                    }`}
                  >
                    {/* Attached Photo Preview */}
                    {msg.imagePreview && (
                      <div className="mb-2 rounded-lg overflow-hidden border border-white/20 bg-black/40">
                        <img
                          src={msg.imagePreview}
                          alt="Alarm inspection panel"
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}

                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* AI Structured Solution Checklist inside Phone */}
                    {msg.response && (
                      <div className="space-y-2.5 pt-2 border-t border-white/10 text-[11px]">
                        
                        {/* Model & Confidence Pill */}
                        <div className="flex items-center justify-between font-mono text-[9px]">
                          <span className="px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 font-bold">
                            Model: {msg.response.model_used || selectedModel}
                          </span>
                          <span className="text-emerald-400 font-bold">
                            ✓ {msg.response.confidence_level || "HIGH CONFIDENCE"}
                          </span>
                        </div>

                        {/* Interactive Corrective Steps Checklist */}
                        {msg.response.corrective_steps && msg.response.corrective_steps.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Shop Floor Checklist:
                            </span>
                            {msg.response.corrective_steps.map((step, sIdx) => {
                              const stepKey = `${msg.id}-step-${sIdx}`;
                              const isChecked = !!checkedSteps[stepKey];
                              return (
                                <div
                                  key={sIdx}
                                  onClick={() => toggleStepCheck(stepKey)}
                                  className={`p-2 rounded-xl border transition-all flex items-start gap-2 cursor-pointer ${
                                    isChecked
                                      ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200 line-through opacity-80"
                                      : "bg-white/[0.03] border-white/[0.07] text-slate-200 hover:border-indigo-500/40"
                                  }`}
                                >
                                  {isChecked ? (
                                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                  ) : (
                                    <Square className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                  )}
                                  <div className="space-y-0.5">
                                    <span className="font-medium text-[11px] leading-tight block">
                                      {step.action}
                                    </span>
                                    {step.warning && (
                                      <span className="text-[10px] font-mono text-amber-400 block">
                                        ⚠ {step.warning}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* OEM Manual Page Citations */}
                        {msg.response.citations && msg.response.citations.length > 0 && (
                          <div className="p-2 rounded-xl bg-black/40 border border-white/5 space-y-1 font-mono text-[9px]">
                            <span className="text-slate-400 block font-bold">
                              Verified OEM Citations:
                            </span>
                            {msg.response.citations.slice(0, 2).map((c, cIdx) => (
                              <div key={cIdx} className="text-indigo-400 truncate">
                                [{c.citation_id || `C${cIdx + 1}`}] {c.manual_name} (Pg {c.page_start})
                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* ── While Executing: Mobile Background Pipeline Tracer ── */}
              {isLoading && (
                <div className="w-full animate-fade-in">
                  <ExecutionPipelineTracker
                    isExecuting={isLoading}
                    query={messages[messages.length - 1]?.text}
                    variant="compact"
                  />
                </div>
              )}
            </div>

            {/* Attached Image Indicator Bar */}
            {attachedImage && (
              <div className="px-3 py-1.5 bg-indigo-950/60 border-t border-indigo-500/30 flex items-center justify-between text-[10px] font-mono text-indigo-300">
                <span className="flex items-center gap-1.5 truncate">
                  <Camera className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span>Alarm Panel Photo Attached</span>
                </span>
                <button
                  type="button"
                  onClick={() => setAttachedImage(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            )}

            {/* 5. Mobile Input Console */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-2.5 bg-[#0e111a] border-t border-white/10 flex items-center gap-1.5 shrink-0"
            >
              <button
                type="button"
                onClick={handleCameraIconClick}
                className={`p-2 rounded-xl border transition-all shrink-0 cursor-pointer ${
                  isCameraOpen || attachedImage
                    ? "bg-indigo-600 text-white border-indigo-400 shadow-sm"
                    : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-400 hover:text-white"
                }`}
                title="Camera Optical Scanner & Alarms"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>

              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask fault, alarm code, procedure..."
                className="flex-1 px-3 py-2 text-[11px] rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 transition-all font-mono"
              />

              <button
                type="submit"
                disabled={isLoading || !inputQuery.trim()}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-all shrink-0 cursor-pointer shadow-md"
              >
                {isLoading ? <Spinner size="sm" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </form>

            {/* Hidden Canvas for High-Resolution Photo Capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* iOS Bottom Home Bar */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full bg-white/25 pointer-events-none" />

            {/* ── Permission Denied Toast ── */}
            {permissionDeniedToast && (
              <div className="absolute top-14 left-3 right-3 z-50 p-2.5 rounded-2xl bg-red-950/95 border border-red-500/40 text-red-200 text-[10px] font-mono shadow-2xl backdrop-blur-md flex items-start gap-2 animate-fade-in">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-snug">
                  <span className="font-bold text-red-300 block">Access Denied</span>
                  <span>{permissionDeniedToast}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPermissionDeniedToast(null)}
                  className="text-red-400 hover:text-white p-0.5"
                >
                  ✕
                </button>
              </div>
            )}

            {/* ── Permission Request Modal (iPhone & Zebra Skins) ── */}
            {showPermissionDialog && (
              <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-5 animate-fade-in">
                {deviceSkin === "iphone" ? (
                  /* Authentic iOS Camera Permission Alert */
                  <div className="w-full max-w-[290px] rounded-[26px] bg-[#1a1e29]/95 border border-white/20 text-center shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-5 space-y-4 backdrop-blur-2xl">
                    <div className="w-13 h-13 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500 to-teal-400 flex items-center justify-center text-white shadow-lg">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                        “MEND-X Field” Would Like to Access the Camera
                      </h3>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
                        Scan machine alarm panels, error codes, and component nameplates to retrieve grounded OEM manual citations.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={handleDenyPermission}
                        className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-all cursor-pointer"
                      >
                        Don’t Allow
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGrantPermission("app")}
                        className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md cursor-pointer"
                      >
                        Allow
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Rugged Zebra Android Enterprise Permission Card */
                  <div className="w-full max-w-[310px] rounded-2xl bg-[#12151f] border-2 border-amber-500/60 shadow-[0_0_35px_rgba(234,179,8,0.25)] p-4 space-y-3.5">
                    <div className="flex items-center gap-2 text-amber-400 font-mono text-[10px] uppercase font-bold tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Zebra TC58 Enterprise Security</span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-amber-400 shrink-0" />
                        Allow MEND-X Field to take pictures and record video?
                      </h3>
                      <p className="text-[10px] font-mono text-slate-400">
                        Required for optical barcode decoding and OEM manual OCR extraction.
                      </p>
                    </div>
                    <div className="space-y-1.5 pt-1 text-[11px] font-mono">
                      <button
                        type="button"
                        onClick={() => handleGrantPermission("app")}
                        className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-left transition-all flex items-center justify-between cursor-pointer shadow-sm"
                      >
                        <span>While using the app</span>
                        <span>✓</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGrantPermission("once")}
                        className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-left transition-all cursor-pointer"
                      >
                        Only this time
                      </button>
                      <button
                        type="button"
                        onClick={handleDenyPermission}
                        className="w-full py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 text-left transition-all cursor-pointer"
                      >
                        Don’t allow
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Live Camera Viewfinder Overlay ── */}
            {isCameraOpen && (
              <div className="absolute inset-0 z-40 bg-black flex flex-col justify-between overflow-hidden animate-fade-in select-none">
                
                {/* 1. Viewfinder Top HUD */}
                <div className="px-4 py-3 bg-gradient-to-b from-black/85 via-black/50 to-transparent flex items-center justify-between z-30 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-[9px] font-bold tracking-wider uppercase">
                      {cameraError ? "OPTICAL SIMULATOR" : "LIVE 1080P FEED"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Torch Beam Button */}
                    <button
                      type="button"
                      onClick={handleToggleTorch}
                      className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                        torchActive
                          ? "bg-amber-400 text-black border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                          : "bg-black/50 text-white border-white/20 hover:bg-white/15"
                      }`}
                      title="Toggle Torch Spotlight"
                    >
                      <Flashlight className="w-3.5 h-3.5" />
                    </button>

                    {/* Camera Facing Flip */}
                    <button
                      type="button"
                      onClick={handleFlipCamera}
                      className="p-1.5 rounded-full bg-black/50 border border-white/20 text-white hover:bg-white/15 transition-all cursor-pointer"
                      title="Flip Front/Rear Camera"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>

                    {/* Close Viewfinder */}
                    <button
                      type="button"
                      onClick={handleCloseCamera}
                      className="p-1.5 rounded-full bg-black/50 border border-white/20 text-white hover:bg-red-500/40 hover:border-red-400 transition-all cursor-pointer"
                      title="Close Camera Viewfinder"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 2. Central Optical Targeting Screen */}
                <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
                  
                  {/* Real WebRTC Video Element */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Fallback Simulation Feed when hardware is restricted or unavailable */}
                  {cameraError && (
                    <div className="absolute inset-0 bg-[#070a13] flex flex-col items-center justify-center p-4">
                      {/* Industrial Tech Blueprint Grid */}
                      <div
                        className="absolute inset-0 opacity-25 pointer-events-none"
                        style={{
                          backgroundImage:
                            "radial-gradient(#6366f1 1px, transparent 1px), linear-gradient(to bottom, #0f172a, #030712)",
                          backgroundSize: "20px 20px, 100% 100%",
                        }}
                      />
                      
                      {/* Simulated Machine Telemetry Tag */}
                      <div className="relative z-10 w-full max-w-[270px] p-3 rounded-2xl bg-black/80 border border-emerald-500/40 space-y-2 backdrop-blur-md text-center shadow-2xl">
                        <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-mono text-[10px] font-bold">
                          <Crosshair className="w-4 h-4 animate-spin" style={{ animationDuration: "10s" }} />
                          <span>OPTICAL HUD ACTIVE</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 font-mono text-left text-[10px] space-y-1">
                          <div className="text-red-400 font-bold flex items-center justify-between">
                            <span>HAAS VF-4 ALARM 102</span>
                            <span className="text-[8px] bg-red-500/20 px-1 py-0.5 rounded text-red-300">98.4°C</span>
                          </div>
                          <div className="text-slate-300 text-[9px]">SPINDLE MOTOR OVERHEAT DETECTED</div>
                          <div className="text-emerald-400 text-[8px] font-semibold">TARGET LOCK: OEM CITATION READY</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Torch / Flashlight Overlay Glow */}
                  {torchActive && (
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_35%,rgba(254,240,138,0.35)_0%,rgba(255,255,255,0.1)_45%,transparent_75%)] mix-blend-screen" />
                  )}

                  {/* Industrial Reticle Brackets (Targeting Box) */}
                  <div className="relative w-64 h-64 border border-white/10 rounded-2xl pointer-events-none flex items-center justify-center">
                    {/* Corner Accent Brackets */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br-lg" />

                    {/* Laser Scan Sweep Line */}
                    <div
                      className="absolute left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399]"
                      style={{ animation: "laserSweep 2.2s ease-in-out infinite" }}
                    />

                    {/* Central Crosshair */}
                    <Crosshair className="w-8 h-8 text-emerald-400/50 animate-pulse" />

                    {/* Telemetry Guide Label */}
                    <span className="absolute -bottom-6 font-mono text-[9px] text-emerald-300/90 font-bold tracking-wider text-center uppercase drop-shadow-md">
                      Align Alarm Panel or Barcode
                    </span>
                  </div>

                  {/* Shutter Flash Animation Screen */}
                  {shutterFlash && (
                    <div className="absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-150" />
                  )}
                </div>

                {/* 3. Viewfinder Bottom Shutter Deck */}
                <div className="px-4 py-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent flex flex-col items-center gap-3 z-30 shrink-0">
                  
                  <div className="flex items-center justify-between w-full max-w-[280px]">
                    {/* Sample Haas Alarm 1-Tap Snapshot */}
                    <button
                      type="button"
                      onClick={() => handleCapturePhoto(true)}
                      className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-[10px] font-mono text-slate-200 transition-all cursor-pointer"
                      title="Attach Haas VF-4 Alarm 102 sample capture"
                    >
                      ⚡ Haas 102
                    </button>

                    {/* Main Circular Shutter Button */}
                    <button
                      type="button"
                      onClick={() => handleCapturePhoto(false)}
                      disabled={isCapturing}
                      className="w-16 h-16 rounded-full border-4 border-white p-1 flex items-center justify-center active:scale-90 transition-transform cursor-pointer shadow-[0_0_25px_rgba(255,255,255,0.45)] group"
                      title="Capture Photo"
                    >
                      <div className="w-full h-full rounded-full bg-white group-hover:bg-slate-200 transition-colors" />
                    </button>

                    {/* Cancel / Close Viewfinder */}
                    <button
                      type="button"
                      onClick={handleCloseCamera}
                      className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-[10px] font-mono text-slate-200 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <span className="text-[9px] font-mono text-slate-400">
                    Tap white shutter disc to capture & attach
                  </span>
                </div>
              </div>
            )}

            <style>{`
              @keyframes laserSweep {
                0% { top: 15%; opacity: 0.5; }
                50% { top: 82%; opacity: 1; }
                100% { top: 15%; opacity: 0.5; }
              }
            `}</style>

          </div>
        </div>
      </div>

    </div>
  );
}
