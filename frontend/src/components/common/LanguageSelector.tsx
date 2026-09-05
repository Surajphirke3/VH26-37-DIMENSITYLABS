"use client";

import React, { useState, useRef, useEffect } from "react";
import { Languages, ChevronDown, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import type { SupportedLanguage } from "@/lib/i18n/translations";

interface LanguageSelectorProps {
  variant?: "header-pill" | "sidebar-item" | "dropdown";
  showLabel?: boolean;
  direction?: "up" | "down";
}

export default function LanguageSelector({
  variant = "header-pill",
  showLabel = true,
  direction = "down",
}: LanguageSelectorProps) {
  const { language, currentMeta, setLanguage, languages, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click-outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    setOpen(false);
  };

  const positionClasses = direction === "up" ? "bottom-full mb-2 right-0" : "top-full mt-2 right-0";

  return (
    <div className="relative" ref={dropdownRef}>
      {variant === "header-pill" && (
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/80 dark:bg-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 text-xs font-mono font-medium text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-sm hover:border-indigo-500/40"
          title={`Language: ${currentMeta.nativeName} (${currentMeta.name})`}
        >
          <Languages className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs">{currentMeta.flag}</span>
          <span className="font-bold text-[11px] hidden sm:inline">{currentMeta.nativeName}</span>
          <ChevronDown
            className={`w-3 h-3 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      )}

      {variant === "sidebar-item" && (
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10"
        >
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-indigo-500" />
            <span className="font-medium">{t("nav.language", "Language")}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-300 font-mono font-semibold">
            <span>{currentMeta.flag}</span>
            <span>{currentMeta.nativeName}</span>
          </div>
        </button>
      )}

      {variant === "dropdown" && (
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border text-xs text-foreground hover:border-indigo-500 cursor-pointer"
        >
          <Languages className="w-4 h-4 text-indigo-500" />
          <span>{currentMeta.flag} {currentMeta.nativeName} ({currentMeta.name})</span>
          <ChevronDown className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
        </button>
      )}

      {/* Floating Dropdown Menu */}
      {open && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className={`absolute ${positionClasses} w-56 max-h-80 overflow-y-auto rounded-2xl bg-white dark:bg-[#121622] border border-slate-200 dark:border-white/15 p-1.5 shadow-2xl z-[100] animate-fade-in backdrop-blur-xl`}
        >
          <div className="px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-white/5 mb-1 flex items-center justify-between">
            <span>Select Language</span>
            <span className="text-indigo-500">10 Native</span>
          </div>

          <div className="space-y-0.5">
            {languages.map((item) => {
              const isSelected = item.code === language;
              return (
                <button
                  key={item.code}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleSelect(item.code)}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white font-bold shadow-sm"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate mr-2">
                    <span className="text-sm shrink-0">{item.flag}</span>
                    <div className="truncate flex flex-col">
                      <span className="font-semibold truncate">{item.nativeName}</span>
                      <span
                        className={`text-[10px] font-mono ${
                          isSelected ? "text-indigo-200" : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
