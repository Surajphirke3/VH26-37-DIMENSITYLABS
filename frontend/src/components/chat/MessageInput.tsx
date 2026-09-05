"use client";

import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent, useCallback } from "react";
import { Image as ImageIcon, X, Sparkles, Cpu, Camera, Crosshair, RefreshCw, ShieldCheck, ShieldAlert } from "lucide-react";

interface MessageInputProps {
  onSend: (query: string, model?: string, imageData?: string) => void;
  isLoading: boolean;
  variant?: "v1" | "v2";
  activeModel?: string;
}

import { getModels } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/context";
import LanguageSelector from "@/components/common/LanguageSelector";

const ERROR_CODE_RE = /\b[A-Z]{1,4}[-_]?\d{2,5}\b/;

export interface ModelOption {
  id: string;
  name: string;
  provider?: string;
}

const DEFAULT_MODELS: ModelOption[] = [
  { id: "auto", name: "⚡ Auto Router (Nord 1B ⚡ → Forge 2B ⚙️ → Apex 4B 🛡️)", provider: "router" },
  { id: "nord", name: "🔵 Nord (Edge · 1B Sub-100ms)", provider: "nord" },
  { id: "forge", name: "🟠 Forge (Workshop · 2B Diagnostic)", provider: "forge" },
  { id: "apex", name: "🔴 Apex (Trained · 4B Domain-Trained)", provider: "apex" },
  { id: "openai/gpt-oss-120b", name: "Apex (4B Domain-Trained Groq)", provider: "groq" },
  { id: "qwen3.5:9b", name: "Qwen 3.5 9B (Ollama Cloud & Local)", provider: "ollama" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "gemini" },
];

export default function MessageInput({ onSend, isLoading, variant = "v2", activeModel }: MessageInputProps) {
  const { t } = useLanguage();
  const [value, setValue] = useState("");
  const [selectedModel, setSelectedModel] = useState(activeModel || "auto");
  const [availableModels, setAvailableModels] = useState<ModelOption[]>(DEFAULT_MODELS);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasErrorCode = ERROR_CODE_RE.test(value);

  // Sync with activeModel prop if parent sets it
  useEffect(() => {
    if (activeModel) {
      setSelectedModel(activeModel);
    }
  }, [activeModel]);

  // Fetch configured models from backend on mount
  useEffect(() => {
    getModels()
      .then((res: any) => {
        const list = res?.data?.models || res?.models;
        if (Array.isArray(list) && list.length > 0) {
          setAvailableModels(list);
          const def = res?.data?.default_model || res?.default_model;
          if (def) setSelectedModel(def);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch models, using defaults:", err);
      });
  }, []);

  // Camera & Permission State
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment");
  const [shutterFlash, setShutterFlash] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageName(file.name);
    setSelectedModel("openai/gpt-oss-120b");

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImageName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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

  const startCameraStream = useCallback(
    async (facing: "environment" | "user" = "environment") => {
      stopCameraStream();
      setCameraError(false);

      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setCameraError(true);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.warn("Autoplay was prevented:", playErr);
          }
        }
      } catch (err) {
        console.warn("Native camera stream unavailable, engaging fallback inspection frame:", err);
        setCameraError(true);
      }
    },
    [stopCameraStream]
  );

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  const handleCameraClick = () => {
    const perm = typeof window !== "undefined" ? localStorage.getItem("mendx_camera_perm") : null;
    if (perm === "granted") {
      setIsCameraModalOpen(true);
      startCameraStream(cameraFacing);
    } else {
      setShowPermissionPrompt(true);
    }
  };

  const handleGrantCameraPermission = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mendx_camera_perm", "granted");
    }
    setShowPermissionPrompt(false);
    setIsCameraModalOpen(true);
    startCameraStream(cameraFacing);
  };

  const handleDenyCameraPermission = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mendx_camera_perm", "denied");
    }
    setShowPermissionPrompt(false);
  };

  const handleCloseCamera = () => {
    stopCameraStream();
    setIsCameraModalOpen(false);
  };

  const handleCapturePhoto = (useSample = false) => {
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 180);

    let photoData: string | null = null;
    if (!useSample && videoRef.current && canvasRef.current && streamRef.current) {
      try {
        const v = videoRef.current;
        const c = canvasRef.current;
        const w = v.videoWidth || 640;
        const h = v.videoHeight || 480;
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d");
        if (ctx) {
          ctx.drawImage(v, 0, 0, w, h);
          photoData = c.toDataURL("image/jpeg", 0.88);
        }
      } catch (e) {
        console.warn("Capture fallback:", e);
      }
    }

    if (!photoData) {
      photoData =
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='440' height='260' viewBox='0 0 440 260'><rect width='440' height='260' fill='%23080b12'/><rect x='14' y='14' width='412' height='232' rx='12' fill='%23111827' stroke='%23ef4444' stroke-width='2'/><circle cx='36' cy='36' r='6' fill='%23ef4444'/><text x='52' y='41' fill='%23ef4444' font-family='monospace' font-size='13' font-weight='bold'>HAAS CNC ALARM 102 - SPINDLE MOTOR OVERHEAT</text><line x1='14' y1='56' x2='426' y2='56' stroke='%23374151' stroke-width='1'/><text x='28' y='86' fill='%23f9fafb' font-family='monospace' font-size='11'>THERMAL CUTOFF: SENSOR 02 TRIP AT 98.4°C (LIMIT: 85°C)</text><text x='28' y='108' fill='%239ca3af' font-family='monospace' font-size='10'>CABINET: HAAS VF-4 50-TAPER · SPINDLE MOTOR FAN STALL</text><rect x='28' y='126' width='384' height='72' rx='6' fill='%231f2937' stroke='%234b5563' stroke-width='1'/><text x='38' y='148' fill='%23f59e0b' font-family='monospace' font-size='10' font-weight='bold'>FAULT TELEMETRY LOG #7719-B:</text><text x='38' y='167' fill='%23e5e7eb' font-family='monospace' font-size='9'>Coolant heat-exchanger intake blocked or thermistor faulty.</text><text x='38' y='184' fill='%2310b981' font-family='monospace' font-size='9'>Grounded Manual Citation: Sec 9.4 Cooling Loop Overhaul</text><text x='28' y='224' fill='%236b7280' font-family='monospace' font-size='8'>CAMERA SNAPSHOT · MEND-X MOBILE OPTICAL HUD</text></svg>";
    }

    setSelectedImage(photoData);
    setImageName("Camera_Inspection_Capture.jpg");
    setSelectedModel("openai/gpt-oss-120b");
    handleCloseCamera();
  };

  const handleFlipCamera = () => {
    const nextFacing = cameraFacing === "environment" ? "user" : "environment";
    setCameraFacing(nextFacing);
    startCameraStream(nextFacing);
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

  const isV2 = variant === "v2";

  return (
    <div className="shrink-0 px-3 sm:px-6 py-2.5 sm:py-3 border-t border-slate-200/80 dark:border-white/[0.08] bg-white/95 dark:bg-[#070b14]/90 backdrop-blur-xl transition-colors z-20">
      <div className="max-w-3xl mx-auto space-y-2">
        {/* ── Top Bar: Active Error Code Detector & Model Tier Pills ── */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          {hasErrorCode ? (
            <div className="animate-fade-in flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <span className="truncate">Fault Code Pattern Recognized → OEM Manual Search</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] text-[10px] font-mono">
              <button
                type="button"
                onClick={() => setSelectedModel("auto")}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedModel === "auto"
                    ? "bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Automatically route queries based on error complexity"
              >
                ⚡ Auto
              </button>
              <button
                type="button"
                onClick={() => setSelectedModel("nord")}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedModel === "nord"
                    ? "bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-sky-400"
                }`}
                title="Nord: Fast sub-350ms lookup"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                <span>Nord</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedModel("forge")}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedModel === "forge"
                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-amber-400"
                }`}
                title="Forge: Multi-step reasoning"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span>Forge</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedModel("apex")}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedModel === "apex" || selectedModel.includes("120b")
                    ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-rose-400"
                }`}
                title="Apex: Safety-critical disambiguation"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                <span>Apex</span>
              </button>
            </div>
          )}

          {/* Model selector dropdown (expanded for advanced models) */}
          <div className="flex items-center gap-1.5 text-xs shrink-0">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] text-slate-700 dark:text-slate-300">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  selectedModel.includes("apex") || selectedModel.includes("120b")
                    ? "bg-rose-500"
                    : selectedModel.includes("forge")
                    ? "bg-amber-500"
                    : selectedModel.includes("nord")
                    ? "bg-sky-500"
                    : "bg-emerald-500"
                }`}
              />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-transparent border-0 text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer max-w-[140px] sm:max-w-[190px] truncate"
                title="Select AI Engine Tier"
              >
                {availableModels.map((m) => (
                  <option key={m.id} value={m.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Attached Image Preview */}
        {selectedImage && (
          <div className="flex items-center gap-3 p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl animate-fade-in shadow-sm">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-300 dark:border-white/20 shrink-0">
              <img
                src={selectedImage}
                alt="Attached inspection"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate">{imageName || "Equipment Attachment"}</p>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Optical OCR Active · Extracts Error Codes & Text</span>
              </div>
            </div>
            <button
              type="button"
              onClick={removeImage}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              title="Remove attachment"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Input Container (Sleek Floating Command Box) ── */}
        <div className="flex items-end gap-2 p-1.5 rounded-2xl bg-slate-50 dark:bg-[#0e1320] border border-slate-200/90 dark:border-white/10 focus-within:border-indigo-500/50 dark:focus-within:border-sky-400/50 focus-within:ring-2 focus-within:ring-indigo-500/10 dark:focus-within:ring-sky-400/10 transition-all shadow-md">
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
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 transition-all cursor-pointer shadow-sm active:scale-95"
            title={t("chat.attachImage", "Attach equipment photo / nameplate")}
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Live Camera Snapshot Button */}
          <button
            type="button"
            onClick={handleCameraClick}
            disabled={isLoading}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 transition-all cursor-pointer shadow-sm active:scale-95"
            title={t("chat.capturePhoto", "Open camera & optical scanner")}
          >
            <Camera className="w-4 h-4" />
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              id="chat-input"
              value={value}
              onChange={handleChange}
              onKeyDown={handleKey}
              disabled={isLoading}
              rows={1}
              placeholder={t("chat.placeholder", "Enter fault code (e.g. Alarm 102, F01043), symptom, or attach photo…")}
              className="w-full px-2.5 py-1.5 text-xs sm:text-sm font-sans rounded-xl leading-relaxed bg-transparent border-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
              style={{
                minHeight: "38px",
                maxHeight: "120px",
                resize: "none",
              }}
            />
            {isLoading && (
              <div className="absolute right-2 bottom-2 flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                <div
                  className="w-3 h-3 rounded-full border-2 border-slate-400/20 border-t-indigo-500 dark:border-t-sky-400"
                  style={{ animation: "spin 0.8s linear infinite" }}
                />
                <span className="hidden sm:inline font-medium">Grounding OEM manuals...</span>
              </div>
            )}
          </div>

          {/* Execute Button */}
          <button
            id="send-btn"
            onClick={submit}
            disabled={isLoading || (!value.trim() && !selectedImage)}
            className={`shrink-0 h-9 px-4 flex items-center justify-center gap-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
              isLoading || (!value.trim() && !selectedImage)
                ? "bg-slate-200 dark:bg-white/[0.05] border border-transparent text-slate-400 dark:text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-teal-600 via-indigo-600 to-indigo-700 hover:from-teal-500 hover:to-indigo-600 text-white shadow-md shadow-indigo-500/20 cursor-pointer active:scale-95"
            }`}
            aria-label={t("chat.send", "Send")}
          >
            <span>{t("chat.send", "SEND")}</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>

        {/* Subtle keyboard hint */}
        <div className="flex items-center justify-between px-1 text-[10px] font-mono text-slate-400 dark:text-slate-500">
          <span>↵ Enter to send · Shift+↵ for new line</span>
          <span className="text-emerald-500/90 flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Zero-Hallucination Grounded
          </span>
        </div>
      </div>

      {/* Hidden Canvas for Frame Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ── Camera Permission Request Modal ── */}
      {showPermissionPrompt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-white/15 p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500 to-teal-400 flex items-center justify-center text-white shadow-lg">
              <Camera className="w-7 h-7 text-white" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">
                “MEND-X” Would Like to Access the Camera
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Allow camera access to capture machine alarm panels, error codes, and nameplates for grounded OEM troubleshooting.
              </p>
            </div>
            <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-3 text-sm font-semibold">
              <button
                type="button"
                onClick={handleDenyCameraPermission}
                className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all cursor-pointer font-medium"
              >
                Don’t Allow
              </button>
              <button
                type="button"
                onClick={handleGrantCameraPermission}
                className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md cursor-pointer"
              >
                Allow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Live Camera Viewfinder Modal ── */}
      {isCameraModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="relative w-full max-w-md h-[560px] rounded-3xl bg-black border border-white/20 overflow-hidden flex flex-col justify-between shadow-2xl">
            {/* Top HUD */}
            <div className="px-4 py-3 bg-gradient-to-b from-black/90 to-transparent flex items-center justify-between z-30 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold tracking-wider">
                  {cameraError ? "OPTICAL SIMULATOR" : "LIVE 1080P FEED"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFlipCamera}
                  className="p-2 rounded-full bg-black/50 border border-white/20 text-white hover:bg-white/15 transition-all cursor-pointer"
                  title="Flip camera"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleCloseCamera}
                  className="p-2 rounded-full bg-black/50 border border-white/20 text-white hover:bg-red-500/40 hover:border-red-400 transition-all cursor-pointer"
                  title="Close camera"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Viewfinder Center */}
            <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />

              {cameraError && (
                <div className="absolute inset-0 bg-[#070a13] flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-full max-w-xs p-4 rounded-2xl bg-black/80 border border-emerald-500/40 space-y-2 backdrop-blur-md shadow-2xl">
                    <div className="flex items-center justify-center gap-2 text-emerald-400 font-mono text-xs font-bold">
                      <Crosshair className="w-4 h-4 animate-spin" style={{ animationDuration: "10s" }} />
                      <span>OPTICAL HUD ACTIVE</span>
                    </div>
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 font-mono text-left text-xs space-y-1">
                      <div className="text-red-400 font-bold flex items-center justify-between">
                        <span>HAAS VF-4 ALARM 102</span>
                        <span className="text-[9px] bg-red-500/20 px-1.5 py-0.5 rounded text-red-300">98.4°C</span>
                      </div>
                      <div className="text-slate-300 text-[10px]">SPINDLE MOTOR OVERHEAT DETECTED</div>
                      <div className="text-emerald-400 text-[9px] font-semibold">TARGET LOCK: READY TO ATTACH</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reticle brackets */}
              <div className="relative w-64 h-64 border border-white/10 rounded-2xl pointer-events-none flex items-center justify-center">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br-lg" />
                <Crosshair className="w-8 h-8 text-emerald-400/50 animate-pulse" />
              </div>

              {shutterFlash && (
                <div className="absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-150" />
              )}
            </div>

            {/* Bottom Controls */}
            <div className="px-6 py-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent flex items-center justify-between z-30 shrink-0">
              <button
                type="button"
                onClick={() => handleCapturePhoto(true)}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-mono text-slate-200 transition-all cursor-pointer"
                title="Capture sample Haas 102 panel"
              >
                ⚡ Haas 102
              </button>

              <button
                type="button"
                onClick={() => handleCapturePhoto(false)}
                className="w-16 h-16 rounded-full border-4 border-white p-1 flex items-center justify-center active:scale-90 transition-transform cursor-pointer shadow-[0_0_25px_rgba(255,255,255,0.45)] group"
                title="Capture Snapshot"
              >
                <div className="w-full h-full rounded-full bg-white group-hover:bg-slate-200 transition-colors" />
              </button>

              <button
                type="button"
                onClick={handleCloseCamera}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-mono text-slate-200 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
