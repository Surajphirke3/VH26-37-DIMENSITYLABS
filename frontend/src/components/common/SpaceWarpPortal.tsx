"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Terminal, Rocket, Orbit } from "lucide-react";

interface SpaceWarpContextType {
  triggerWarp: (destination: string, title?: string, subtitle?: string) => void;
  isWarping: boolean;
}

const SpaceWarpContext = createContext<SpaceWarpContextType>({
  triggerWarp: () => {},
  isWarping: false,
});

export function useSpaceWarp() {
  return useContext(SpaceWarpContext);
}

export function SpaceWarpProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isWarping, setIsWarping] = useState(false);
  const [warpTitle, setWarpTitle] = useState("Traversing Dimensional Space");
  const [warpSubtitle, setWarpSubtitle] = useState("Initializing neural model lattices…");
  const [direction, setDirection] = useState<"to-space" | "to-shopfloor">("to-space");

  const triggerWarp = useCallback(
    (destination: string, title?: string, subtitle?: string) => {
      if (isWarping) return;

      const isEnteringSpace = destination.includes("space");
      setDirection(isEnteringSpace ? "to-space" : "to-shopfloor");
      setWarpTitle(
        title ||
          (isEnteringSpace
            ? "Entering Tri-Model Neural Space"
            : "Docking to Industrial SCADA Terminal")
      );
      setWarpSubtitle(
        subtitle ||
          (isEnteringSpace
            ? "Activating Nord, Forge & Apex high-dimensional reasoning domain…"
            : "Calibrating shopfloor sensor telemetry and physical equipment context…")
      );

      setIsWarping(true);

      // Perform the actual route push mid-animation
      setTimeout(() => {
        router.push(destination);
      }, 350);

      // Dismiss overlay after transition settles
      setTimeout(() => {
        setIsWarping(false);
      }, 800);
    },
    [isWarping, router]
  );

  return (
    <SpaceWarpContext.Provider value={{ triggerWarp, isWarping }}>
      {children}

      {/* ── Cosmic Hyperspace Warp Transition Overlay ── */}
      {isWarping && (
        <div className="fixed inset-0 z-[9999] pointer-events-auto flex flex-col items-center justify-center overflow-hidden bg-black/90 backdrop-blur-2xl animate-hyperspace-flash">
          {/* Warp Tunnel Streaks & Starfield */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#38bdf8_1px,transparent_1px)] [background-size:24px_24px] animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-r from-sky-500/20 via-amber-500/20 to-rose-500/20 blur-3xl animate-spin [animation-duration:18s]" />
          </div>

          {/* Central Warp Card */}
          <div className="relative z-10 px-8 py-7 rounded-3xl border border-white/20 bg-slate-950/90 shadow-[0_0_60px_rgba(56,189,248,0.3)] text-center space-y-4 animate-portal-warp max-w-lg mx-4">
            {/* Tri-Color Pulsing Indicators */}
            <div className="flex items-center justify-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full bg-sky-400 shadow-[0_0_12px_#38bdf8] animate-ping" />
              <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-[0_0_12px_#f59e0b] animate-ping delay-150" />
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-ping delay-300" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-widest text-slate-400">
                {direction === "to-space" ? (
                  <>
                    <Orbit className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                    <span>Domain Transition: Physical → Tri-Model Space</span>
                  </>
                ) : (
                  <>
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Domain Transition: Space → Shopfloor SCADA</span>
                  </>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                {direction === "to-space" ? (
                  <span className="bg-gradient-to-r from-sky-400 via-amber-300 to-rose-400 bg-clip-text text-transparent">
                    {warpTitle}
                  </span>
                ) : (
                  <span className="text-emerald-400">{warpTitle}</span>
                )}
              </h2>

              <p className="text-xs font-mono text-slate-300 max-w-md mx-auto leading-relaxed">
                {warpSubtitle}
              </p>
            </div>

            <div className="w-48 h-1 mx-auto rounded-full bg-slate-800 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-400 animate-[shimmer_0.8s_infinite]" />
            </div>
          </div>
        </div>
      )}
    </SpaceWarpContext.Provider>
  );
}
