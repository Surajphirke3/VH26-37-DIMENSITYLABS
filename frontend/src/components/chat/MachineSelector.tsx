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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 w-full rounded-lg border border-slate-200
          bg-white hover:bg-slate-50 text-sm text-left transition-colors"
      >
        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
        </svg>
        <span className="flex-1 truncate text-slate-700 font-medium">
          {selected ? selected.name : "All Machines"}
        </span>
        <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white rounded-lg border
          border-slate-200 shadow-lg overflow-hidden max-h-64 overflow-y-auto">
          <button
            onClick={() => { onChange(null); setOpen(false); }}
            className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors
              ${!selected ? "text-indigo-600 font-semibold bg-indigo-50" : "text-slate-600"}`}
          >
            All Machines
          </button>
          {machines.map((m) => (
            <button
              key={m.id}
              onClick={() => { onChange(m); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors
                ${selected?.id === m.id ? "text-indigo-600 font-semibold bg-indigo-50" : "text-slate-700"}`}
            >
              <span className="block font-medium">{m.name}</span>
              {m.model && <span className="text-xs text-slate-400">{m.model}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
