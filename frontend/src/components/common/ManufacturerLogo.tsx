"use client";

import React from "react";

export interface ManufacturerLogoProps {
  name?: string;
  manufacturer?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

export default function ManufacturerLogo({
  name = "",
  manufacturer = "",
  size = "md",
  className = "",
  showText = false,
}: ManufacturerLogoProps) {
  const combined = `${manufacturer} ${name}`.toLowerCase();

  // Size configurations
  const sizeMap = {
    xs: { icon: "w-5 h-5 text-[9px]", badge: "px-1.5 py-0.5 text-[9px]", dim: 20 },
    sm: { icon: "w-7 h-7 text-[10px]", badge: "px-2 py-0.5 text-[10px]", dim: 28 },
    md: { icon: "w-9 h-9 text-xs", badge: "px-2.5 py-1 text-xs", dim: 36 },
    lg: { icon: "w-12 h-12 text-sm", badge: "px-3 py-1.5 text-sm", dim: 48 },
  };

  const currSize = sizeMap[size] || sizeMap.md;

  // 1. SIEMENS
  if (combined.includes("siemens") || combined.includes("sinamics") || combined.includes("simatic")) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <div
          className={`${currSize.icon} rounded-lg bg-[#00646E] flex items-center justify-center font-black text-white shadow-sm border border-teal-400/30 shrink-0 select-none`}
          title="Siemens OEM Equipment"
        >
          <svg viewBox="0 0 32 32" className="w-4/5 h-4/5" fill="none">
            <rect width="32" height="32" rx="6" fill="#00646E" />
            <path
              d="M7 11C7 9.34315 8.34315 8 10 8H20C21.6569 8 23 9.34315 23 11V13C23 14.6569 21.6569 16 20 16H12C10.3431 16 9 17.3431 9 19V21C9 22.6569 10.3431 24 12 24H22C23.6569 24 25 22.6569 25 21"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        {showText && (
          <span className="font-bold tracking-wider text-[#00a399] uppercase text-xs">
            SIEMENS
          </span>
        )}
      </div>
    );
  }

  // 2. ALLEN-BRADLEY / ROCKWELL
  if (
    combined.includes("allen-bradley") ||
    combined.includes("allen bradley") ||
    combined.includes("rockwell") ||
    combined.includes("powerflex") ||
    combined.includes("controllogix")
  ) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <div
          className={`${currSize.icon} rounded-lg bg-[#D12420] flex items-center justify-center text-white font-black shadow-sm border border-red-400/40 shrink-0 select-none`}
          title="Allen-Bradley / Rockwell Automation"
        >
          <svg viewBox="0 0 32 32" className="w-4/5 h-4/5" fill="none">
            <polygon
              points="16,3 27,8 27,24 16,29 5,24 5,8"
              fill="#FFFFFF"
            />
            <polygon
              points="16,5.5 25,9.5 25,22.5 16,26.5 7,22.5 7,9.5"
              fill="#D12420"
            />
            <text
              x="16"
              y="19"
              textAnchor="middle"
              fill="#FFFFFF"
              fontFamily="monospace"
              fontWeight="900"
              fontSize="10"
              letterSpacing="-0.5"
            >
              AB
            </text>
          </svg>
        </div>
        {showText && (
          <span className="font-bold tracking-tight text-[#e53935] text-xs">
            Allen-Bradley
          </span>
        )}
      </div>
    );
  }

  // 3. GSK (广州数控) CNC
  if (combined.includes("gsk") || combined.includes("广州数控") || combined.includes("铣床") || combined.includes("数控")) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <div
          className={`${currSize.icon} rounded-lg bg-gradient-to-tr from-[#005A9E] to-[#0082E6] flex items-center justify-center text-white font-black shadow-sm border border-cyan-400/30 shrink-0 select-none`}
          title="GSK CNC (广州数控设备厂)"
        >
          <div className="flex flex-col items-center justify-center leading-none">
            <span className="font-black text-[9px] tracking-tighter text-white">GSK</span>
            <span className="font-mono text-[6px] text-cyan-200 font-bold">CNC</span>
          </div>
        </div>
        {showText && (
          <span className="font-bold tracking-tight text-cyan-400 text-xs">
            GSK CNC
          </span>
        )}
      </div>
    );
  }

  // 4. HAAS AUTOMATION
  if (combined.includes("haas") || combined.includes("vf-") || combined.includes("vf2") || combined.includes("vf4")) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <div
          className={`${currSize.icon} rounded-lg bg-[#D8232A] flex items-center justify-center text-white font-black shadow-sm border border-red-400/40 shrink-0 select-none`}
          title="Haas Automation Inc."
        >
          <span className="font-black text-xs tracking-tight text-white">H</span>
        </div>
        {showText && (
          <span className="font-bold tracking-wider text-red-500 uppercase text-xs">
            HAAS
          </span>
        )}
      </div>
    );
  }

  // 5. KUKA ROBOTICS
  if (combined.includes("kuka") || combined.includes("kr210") || combined.includes("robot")) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <div
          className={`${currSize.icon} rounded-lg bg-[#FF6600] flex items-center justify-center text-white font-black shadow-sm border border-orange-400/40 shrink-0 select-none`}
          title="KUKA Industrial Robotics"
        >
          <span className="font-black text-[8px] tracking-tighter text-white">KUKA</span>
        </div>
        {showText && (
          <span className="font-bold tracking-wider text-orange-500 uppercase text-xs">
            KUKA
          </span>
        )}
      </div>
    );
  }

  // 6. FANUC
  if (combined.includes("fanuc") || combined.includes("robodrill")) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <div
          className={`${currSize.icon} rounded-lg bg-[#FFCC00] flex items-center justify-center text-[#E60012] font-black shadow-sm border border-yellow-300/40 shrink-0 select-none`}
          title="FANUC CNC & Robotics"
        >
          <span className="font-black text-[8px] tracking-tighter text-[#E60012]">FANUC</span>
        </div>
        {showText && (
          <span className="font-bold tracking-wider text-yellow-500 uppercase text-xs">
            FANUC
          </span>
        )}
      </div>
    );
  }

  // 7. MITSUBISHI ELECTRIC
  if (combined.includes("mitsubishi") || combined.includes("melsec")) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <div
          className={`${currSize.icon} rounded-lg bg-slate-900 border border-red-500/30 flex items-center justify-center shadow-sm shrink-0 select-none`}
          title="Mitsubishi Electric"
        >
          <svg viewBox="0 0 32 32" className="w-3/5 h-3/5" fill="#E60012">
            <polygon points="16,5 20,12 16,19 12,12" />
            <polygon points="10,15 14,22 10,29 6,22" />
            <polygon points="22,15 26,22 22,29 18,22" />
          </svg>
        </div>
        {showText && (
          <span className="font-bold tracking-tight text-red-500 text-xs">
            Mitsubishi
          </span>
        )}
      </div>
    );
  }

  // 8. DEFAULT / FLEET UNPINNED
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div
        className={`${currSize.icon} rounded-lg bg-gradient-to-tr from-teal-600 via-indigo-600 to-violet-700 flex items-center justify-center text-white font-black shadow-sm border border-indigo-400/30 shrink-0 select-none`}
        title={manufacturer || "OEM Equipment"}
      >
        <svg viewBox="0 0 24 24" className="w-1/2 h-1/2" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
        </svg>
      </div>
      {showText && (
        <span className="font-bold tracking-tight text-indigo-400 text-xs">
          {manufacturer || "Industrial OEM"}
        </span>
      )}
    </div>
  );
}
