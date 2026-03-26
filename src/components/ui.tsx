"use client";

import React from "react";

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export function Card({ title, children, badge }: { title: string; children: React.ReactNode; badge?: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800 bg-gray-900/50">
        <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">{title}</h2>
        {badge && <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">{badge}</span>}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

export function Toggle({ label, description, checked, onChange }: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between py-1 cursor-pointer group">
      <div>
        <span className="text-sm text-gray-200 group-hover:text-white">{label}</span>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? "bg-green-600" : "bg-gray-700"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
    </label>
  );
}

export function NumberInput({ label, value, onChange, min, max, step }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number;
}) {
  return (
    <label className="flex items-center justify-between py-1">
      <span className="text-sm text-gray-200">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white text-right focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
      />
    </label>
  );
}

export function TextInput({ label, value, onChange, placeholder, mono }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean;
}) {
  return (
    <label className="block py-1">
      <span className="text-sm text-gray-200 block mb-1">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${mono ? "font-mono" : ""}`}
      />
    </label>
  );
}

export function ColorInput({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <label className="block py-1">
      <span className="text-sm text-gray-200 block mb-1">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 rounded-lg border border-gray-700 bg-gray-800 cursor-pointer p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:ring-2 focus:ring-green-500 outline-none"
        />
      </div>
    </label>
  );
}

export function DateTimeInput({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  // Convert ISO string to datetime-local format for the input.
  const toLocal = (iso: string): string => {
    if (!iso) return "";
    try {
      return new Date(iso).toISOString().slice(0, 16);
    } catch {
      return iso;
    }
  };
  // Convert datetime-local back to ISO string.
  const toISO = (local: string): string => {
    if (!local) return "";
    try {
      return new Date(local).toISOString();
    } catch {
      return local;
    }
  };

  return (
    <label className="block py-1">
      <span className="text-sm text-gray-200 block mb-1">{label}</span>
      <input
        type="datetime-local"
        value={toLocal(value)}
        onChange={(e) => onChange(toISO(e.target.value))}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none [color-scheme:dark]"
      />
    </label>
  );
}

export function TextArea({ label, value, onChange, rows }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number;
}) {
  return (
    <label className="block py-1">
      <span className="text-sm text-gray-200 block mb-1">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows ?? 3}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-y"
      />
    </label>
  );
}

export function Select<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void;
}) {
  return (
    <label className="flex items-center justify-between py-1">
      <span className="text-sm text-gray-200">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:ring-2 focus:ring-green-500 outline-none"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

export function TagInput({ label, tags, onChange, placeholder }: {
  label: string; tags: string[]; onChange: (tags: string[]) => void; placeholder?: string;
}) {
  const [input, setInput] = React.useState("");

  const add = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) {
      onChange([...tags, val]);
      setInput("");
    }
  };

  return (
    <div className="py-1">
      <span className="text-sm text-gray-200 block mb-1">{label}</span>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1 text-xs text-gray-300">
            {tag}
            <button onClick={() => onChange(tags.filter((t) => t !== tag))} className="text-gray-500 hover:text-red-400">&times;</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder ?? "Type and press Enter"}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:ring-2 focus:ring-green-500 outline-none"
        />
        <button onClick={add} className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-700">Add</button>
      </div>
    </div>
  );
}

export function Button({ children, onClick, variant = "primary", disabled }: {
  children: React.ReactNode; onClick: () => void; variant?: "primary" | "secondary" | "danger"; disabled?: boolean;
}) {
  const base = "px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-green-600 hover:bg-green-500 text-white",
    secondary: "bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700",
    danger: "bg-red-600 hover:bg-red-500 text-white",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]}`}>
      {children}
    </button>
  );
}
