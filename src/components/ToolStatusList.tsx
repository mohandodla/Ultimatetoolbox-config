"use client";

import React, { useState, useMemo } from "react";
import { ALL_TOOLS } from "@/lib/tools";
import type { RemoteConfig } from "@/types/config";

interface Props {
  config: RemoteConfig;
  disabledSet: Set<string>;
  hiddenSet: Set<string>;
  maintenanceMap: Record<string, string>;
  onSetDisabled: (id: string, disabled: boolean) => void;
  onSetHidden: (id: string, hidden: boolean) => void;
  onSetMaintenance: (id: string, message: string | null) => void;
}

type ToolStatus = "active" | "disabled" | "maintenance" | "hidden";
type StatusFilter = "all" | ToolStatus;

const CATEGORIES = [...new Set(ALL_TOOLS.map((t) => t.category))].sort();

function getStatus(
  id: string,
  disabledSet: Set<string>,
  hiddenSet: Set<string>,
  maintenanceMap: Record<string, string>,
): ToolStatus {
  if (disabledSet.has(id)) return "disabled";
  if (maintenanceMap[id]) return "maintenance";
  if (hiddenSet.has(id)) return "hidden";
  return "active";
}

const STATUS_COLORS: Record<ToolStatus, string> = {
  active: "bg-green-500",
  disabled: "bg-red-500",
  maintenance: "bg-amber-500",
  hidden: "bg-gray-500",
};

const STATUS_LABELS: Record<ToolStatus, string> = {
  active: "Active",
  disabled: "Disabled",
  maintenance: "Maintenance",
  hidden: "Hidden",
};

export function ToolStatusList({
  config,
  disabledSet,
  hiddenSet,
  maintenanceMap,
  onSetDisabled,
  onSetHidden,
  onSetMaintenance,
}: Props) {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("all");
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [maintenanceInput, setMaintenanceInput] = useState("");

  const filtered = useMemo(() => {
    let tools = [...ALL_TOOLS];
    if (filterCategory !== "all") {
      tools = tools.filter((t) => t.category === filterCategory);
    }
    if (filterStatus !== "all") {
      tools = tools.filter(
        (t) => getStatus(t.id, disabledSet, hiddenSet, maintenanceMap) === filterStatus,
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      tools = tools.filter(
        (t) => t.id.includes(q) || t.name.toLowerCase().includes(q),
      );
    }
    return tools;
  }, [search, filterCategory, filterStatus, disabledSet, hiddenSet, maintenanceMap]);

  return (
    <div>
      {/* Filters */}
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
          <option value="all">All categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as StatusFilter)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white outline-none"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
          <option value="maintenance">Maintenance</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>

      <div className="text-xs text-gray-500 mb-2">{filtered.length} tools shown</div>

      {/* Tool list */}
      <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-800 divide-y divide-gray-800/50">
        {filtered.map((tool) => {
          const status = getStatus(tool.id, disabledSet, hiddenSet, maintenanceMap);
          const isExpanded = expandedTool === tool.id;

          return (
            <div key={tool.id}>
              {/* Tool row */}
              <button
                onClick={() => {
                  if (isExpanded) {
                    setExpandedTool(null);
                  } else {
                    setExpandedTool(tool.id);
                    setMaintenanceInput(maintenanceMap[tool.id] ?? "");
                  }
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-800/30 text-left"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_COLORS[status]}`} />
                  <div className="min-w-0">
                    <span className="text-sm text-gray-200 block truncate">{tool.name}</span>
                    <span className="text-xs text-gray-500">{tool.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    status === "active" ? "bg-green-900/40 text-green-400" :
                    status === "disabled" ? "bg-red-900/40 text-red-400" :
                    status === "maintenance" ? "bg-amber-900/40 text-amber-400" :
                    "bg-gray-800 text-gray-400"
                  }`}>
                    {STATUS_LABELS[status]}
                  </span>
                  <span className="text-xs text-gray-600">{isExpanded ? "\u25B2" : "\u25BC"}</span>
                </div>
              </button>

              {/* Expanded controls */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 bg-gray-900/50 space-y-2">
                  <div className="text-xs text-gray-500 font-mono mb-1">{tool.id}</div>

                  {/* Quick action buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        onSetDisabled(tool.id, false);
                        onSetHidden(tool.id, false);
                        onSetMaintenance(tool.id, null);
                      }}
                      className={`px-3 py-1.5 text-xs rounded-lg border ${
                        status === "active"
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-gray-800 text-gray-300 border-gray-700 hover:border-green-600"
                      }`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => {
                        onSetDisabled(tool.id, true);
                        onSetHidden(tool.id, false);
                      }}
                      className={`px-3 py-1.5 text-xs rounded-lg border ${
                        status === "disabled"
                          ? "bg-red-600 text-white border-red-600"
                          : "bg-gray-800 text-gray-300 border-gray-700 hover:border-red-600"
                      }`}
                    >
                      Disable
                    </button>
                    <button
                      onClick={() => {
                        onSetHidden(tool.id, true);
                        onSetDisabled(tool.id, false);
                        onSetMaintenance(tool.id, null);
                      }}
                      className={`px-3 py-1.5 text-xs rounded-lg border ${
                        status === "hidden"
                          ? "bg-gray-600 text-white border-gray-600"
                          : "bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-500"
                      }`}
                    >
                      Hide
                    </button>
                  </div>

                  {/* Maintenance message */}
                  <div>
                    <span className="text-xs text-gray-400 block mb-1">Maintenance message (shows overlay in app)</span>
                    <div className="flex gap-2">
                      <input
                        value={maintenanceInput}
                        onChange={(e) => setMaintenanceInput(e.target.value)}
                        placeholder="e.g. Under maintenance until tomorrow"
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                      />
                      <button
                        onClick={() => {
                          if (maintenanceInput.trim()) {
                            onSetMaintenance(tool.id, maintenanceInput.trim());
                            onSetDisabled(tool.id, false);
                            onSetHidden(tool.id, false);
                          }
                        }}
                        disabled={!maintenanceInput.trim()}
                        className="px-3 py-1.5 text-xs bg-amber-600 text-white rounded-lg disabled:opacity-50"
                      >
                        Set
                      </button>
                      {maintenanceMap[tool.id] && (
                        <button
                          onClick={() => {
                            onSetMaintenance(tool.id, null);
                            setMaintenanceInput("");
                          }}
                          className="px-3 py-1.5 text-xs text-red-400 border border-red-800 rounded-lg hover:bg-red-900/30"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {maintenanceMap[tool.id] && (
                      <p className="text-xs text-amber-400 mt-1">Current: {maintenanceMap[tool.id]}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
