"use client";

import { useState, FormEvent } from "react";
import { createMachine } from "@/lib/api";

interface MachineFormProps {
  onCreated: () => void;
}

export default function MachineForm({ onCreated }: MachineFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setName(""); setModel(""); setManufacturer(""); setCategory(""); setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Machine name is required."); return; }
    setSubmitting(true);
    try {
      await createMachine({
        name: name.trim(),
        model: model.trim() || undefined,
        manufacturer: manufacturer.trim() || undefined,
        category: category.trim() || undefined,
      });
      reset();
      setOpen(false);
      onCreated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create machine.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
        style={{
          background: "rgba(99,102,241,0.1)",
          border: "1px solid rgba(99,102,241,0.25)",
          color: "#a5b4fc",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.18)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.1)";
        }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        Register New Machine
      </button>
    );
  }

  return (
    <div
      className="rounded-2xl p-5 mb-2 animate-scale-in"
      style={{
        background: "rgba(99,102,241,0.05)",
        border: "1px solid rgba(99,102,241,0.2)",
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="#6366f1" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <p className="text-sm font-bold" style={{ color: "#a5b4fc" }}>Register New Machine</p>
      </div>

      {error && (
        <p
          className="text-xs mb-3 px-3 py-2 rounded-lg animate-fade-in"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#fca5a5",
          }}
        >
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Name *", value: name, setter: setName, placeholder: "CNC-3000", required: true },
            { label: "Model", value: model, setter: setModel, placeholder: "Model X", required: false },
            { label: "Manufacturer", value: manufacturer, setter: setManufacturer, placeholder: "Acme Corp", required: false },
            { label: "Category", value: category, setter: setCategory, placeholder: "CNC", required: false },
          ].map(({ label, value, setter, placeholder, required }) => (
            <div key={label}>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "#475569" }}>
                {label}
              </label>
              <input
                value={value}
                onChange={(e) => setter(e.target.value)}
                required={required}
                placeholder={placeholder}
                className="input-glow w-full px-3 py-2 text-sm rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#e2e8f0",
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <button
            type="button"
            onClick={() => { reset(); setOpen(false); }}
            className="px-4 py-2 text-xs font-medium rounded-xl transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "#64748b",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#64748b"; }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white transition-all"
            style={
              submitting
                ? { background: "rgba(99,102,241,0.3)", cursor: "not-allowed" }
                : { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 0 16px rgba(99,102,241,0.3)" }
            }
            onMouseEnter={(e) => { if (!submitting) (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
          >
            {submitting ? "Creating…" : "Create Machine"}
          </button>
        </div>
      </form>
    </div>
  );
}
