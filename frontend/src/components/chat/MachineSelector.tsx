"use client";

import { useState, useRef, useEffect } from "react";
import type { Machine } from "@/lib/types";

interface MachineSelectorProps {
  machines: Machine[];
  selected: Machine | null;
  onChange: (m: Machine | null) => void;
}

export default function MachineSelector({ machines, selected, onChange }: MachineSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = machines.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.model ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2.5 w-full rounded-xl text-sm text-left transition-all"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: open ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.07)",
          color: selected ? "#e2e8f0" : "#475569",
          boxShadow: open ? "0 0 12px rgba(99,102,241,0.1)" : "none",
        }}
      >
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          style={{ color: selected ? "#6366f1" : "#334155" }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
        </svg>
        <span className="flex-1 truncate font-medium">
          {selected ? selected.name : "All Machines"}
        </span>
        <svg
          className="w-3.5 h-3.5 shrink-0 transition-transform"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
          style={{ color: "#334155", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute z-30 top-full mt-2 left-0 right-0 rounded-xl overflow-hidden animate-slide-down"
          style={{
            background: "rgba(22,24,32,0.98)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.8)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Search */}
          {machines.length > 4 && (
            <div className="p-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search machines…"
                className="w-full px-3 py-2 text-xs rounded-lg"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#e2e8f0",
                }}
              />
            </div>
          )}

          <div className="max-h-56 overflow-y-auto">
            {/* All Machines option */}
            <button
              onClick={() => { onChange(null); setOpen(false); setSearch(""); }}
              className="w-full text-left px-4 py-2.5 text-sm transition-all flex items-center gap-2"
              style={
                !selected
                  ? { background: "rgba(99,102,241,0.12)", color: "#a5b4fc" }
                  : { color: "#64748b" }
              }
              onMouseEnter={(e) => { if (selected) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={(e) => { if (selected) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span className="font-medium">All Machines</span>
              {!selected && <svg className="w-3.5 h-3.5 ml-auto" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
            </button>

            {filtered.map((m) => (
              <button
                key={m.id}
                onClick={() => { onChange(m); setOpen(false); setSearch(""); }}
                className="w-full text-left px-4 py-2.5 text-sm transition-all flex items-center justify-between gap-2"
                style={
                  selected?.id === m.id
                    ? { background: "rgba(99,102,241,0.12)", color: "#a5b4fc" }
                    : { color: "#94a3b8" }
                }
                onMouseEnter={(e) => {
                  if (selected?.id !== m.id) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                    (e.currentTarget as HTMLElement).style.color = "#e2e8f0";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selected?.id !== m.id) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "#94a3b8";
                  }
                }}
              >
                <div className="min-w-0">
                  <span className="block font-semibold truncate">{m.name}</span>
                  {m.model && (
                    <span className="font-mono text-[10px]" style={{ color: "#475569" }}>
                      {m.model}
                    </span>
                  )}
                </div>
                {selected?.id === m.id && (
                  <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}

            {filtered.length === 0 && (
              <p className="px-4 py-3 text-xs text-center" style={{ color: "#334155" }}>
                No machines found.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
