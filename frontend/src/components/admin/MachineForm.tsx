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

  const reset = () => { setName(""); setModel(""); setManufacturer(""); setCategory(""); setError(""); };

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
      <button onClick={() => setOpen(true)}
        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors">
        + Add Machine
      </button>
    );
  }

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 mb-4">
      {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="CNC-3000"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Model</label>
            <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model X"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Manufacturer</label>
            <input value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} placeholder="Acme Corp"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="CNC"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={() => { reset(); setOpen(false); }}
            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 rounded-lg transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={submitting}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-medium rounded-lg transition-colors">
            {submitting ? "Saving…" : "Create Machine"}
          </button>
        </div>
      </form>
    </div>
  );
}
