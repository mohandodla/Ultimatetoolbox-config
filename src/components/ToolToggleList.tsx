"use client";

import React, { useState, useMemo } from "react";
import { ALL_TOOLS } from "@/lib/tools";

interface Props {
  /** Set of currently selected/active tool IDs. */
  selected: Set<string>;
  /** Called when a tool is toggled on/off. */
  onToggle: (toolId: string, enabled: boolean) => void;
  /** Label shown above the list. */
  label: string;
  /** Description text. */
  description?: string;
  /** If true, the toggle means "enabled" (green). If false, means "flagged" (red/amber). */
  positiveToggle?: boolean;
}

/** Unique categories sorted alphabetically. */
const CATEGORIES = [...new Set(ALL_TOOLS.map((t) => t.category))].sort();

export function ToolToggleList({
  selected,
  onToggle,
  label,
  description,
  positiveToggle = false,
}: Props) {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    let tools = [...ALL_TOOLS];
    if (filterCategory !== "all") {
      tools = tools.filter((t) => t.category === filterCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      tools = tools.filter(
        (t) =>
          t.id.includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.category.includes(q),
      );
    }
    return tools;
  }, [search, filterCategory]);

  const selectedCount = selected.size;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-200">{label}</span>
        <span className="text-xs text-gray-500">{selectedCount} / {ALL_TOOLS.length}</span>
      </div>
      {description && <p className="text-xs text-gray-500 mb-2">{description}</p>}

      {/* Search + Category filter */}
      <div className="flex gap-2 mb-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tools..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:ring-2 focus:ring-green-500"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white outline-none"
        >
          <option value="all">All ({ALL_TOOLS.length})</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat} ({ALL_TOOLS.filter((t) => t.category === cat).length})
            </option>
          ))}
        </select>
      </div>

      {/* Tool list */}
      <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-800 divide-y divide-gray-800/50">
        {filtered.map((tool) => {
          const isSelected = selected.has(tool.id);
          return (
            <label
              key={tool.id}
              className="flex items-center justify-between px-3 py-2 hover:bg-gray-800/30 cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <span className="text-sm text-gray-200 block truncate">{tool.name}</span>
                <span className="text-xs text-gray-500">{tool.category} &middot; <span className="font-mono">{tool.id}</span></span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isSelected}
                onClick={() => onToggle(tool.id, !isSelected)}
                className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ml-3 ${
                  isSelected
                    ? positiveToggle
                      ? "bg-green-600"
                      : "bg-red-500"
                    : "bg-gray-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    isSelected ? "translate-x-4" : ""
                  }`}
                />
              </button>
            </label>
          );
        })}
        {filtered.length === 0 && (
          <div className="px-3 py-4 text-center text-xs text-gray-500">No tools match</div>
        )}
      </div>
    </div>
  );
}
