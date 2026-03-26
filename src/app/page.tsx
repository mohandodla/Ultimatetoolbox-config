"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import type { RemoteConfig } from "@/types/config";
import { Button } from "@/components/ui";
import {
  ToolControlSection,
  AdsSection,
  SubscriptionSection,
  AppConfigSection,
  FeaturesSection,
  UISection,
  PromotionsSection,
  TempUnlocksSection,
  PromoCodesSection,
} from "@/components/sections";

// ---------------------------------------------------------------------------
// Navigation tabs
// ---------------------------------------------------------------------------

const TABS = [
  { key: "tools", label: "Tools" },
  { key: "features", label: "Features" },
  { key: "ads", label: "Ads" },
  { key: "subscription", label: "Subscription" },
  { key: "promotions", label: "Promotions" },
  { key: "unlocks", label: "Unlocks" },
  { key: "promos", label: "Promo Codes" },
  { key: "app", label: "App" },
  { key: "ui", label: "UI" },
  { key: "json", label: "Raw JSON" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function Dashboard() {
  const [config, setConfig] = useState<RemoteConfig | null>(null);
  const [sha, setSha] = useState<string>("");
  const [history, setHistory] = useState<{ sha: string; message: string; date: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("tools");
  const [dirty, setDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const originalRef = useRef<string>("");

  // --- Load config from API ---
  const loadConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/config");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Ensure promoCodes field exists (may not be in old configs).
      const cfg = { promoCodes: {}, ...data.config } as RemoteConfig;
      setConfig(cfg);
      setSha(data.sha);
      setHistory(data.history ?? []);
      originalRef.current = JSON.stringify(cfg);
      setDirty(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  // --- Update config (local state) ---
  const updateConfig = useCallback((fn: (prev: RemoteConfig) => RemoteConfig) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const next = fn(prev);
      setDirty(JSON.stringify(next) !== originalRef.current);
      return next;
    });
  }, []);

  // --- Publish to GitHub ---
  const publish = useCallback(async () => {
    if (!config) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, sha }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSha(data.sha);
      originalRef.current = JSON.stringify(config);
      setDirty(false);
      setLastSaved(new Date().toLocaleTimeString());

      // Reload history.
      loadConfig();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }, [config, sha, loadConfig]);

  // --- Keyboard shortcut: Ctrl+S to save ---
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (dirty && !saving) publish();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dirty, saving, publish]);

  // --- Loading state ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading config from GitHub...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <p className="text-red-400 mb-2">Failed to load config</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <Button onClick={loadConfig}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white text-sm font-bold">UT</div>
            <div>
              <h1 className="text-sm font-semibold text-white">Ultimate Toolbox</h1>
              <p className="text-xs text-gray-500">Remote Config Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lastSaved && <span className="text-xs text-gray-500">Saved {lastSaved}</span>}
            {dirty && <span className="text-xs text-amber-400 font-medium">Unsaved changes</span>}
            <Button onClick={loadConfig} variant="secondary" disabled={saving}>Reload</Button>
            <Button onClick={publish} disabled={!dirty || saving}>
              {saving ? "Publishing..." : "Publish to GitHub"}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto pb-0">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                  tab === t.key
                    ? "bg-gray-900 text-green-400 border-t-2 border-green-500"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-900/50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="bg-red-900/30 border-b border-red-800 px-4 py-2 text-center">
          <span className="text-sm text-red-400">{error}</span>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main editor (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {tab === "tools" && <ToolControlSection config={config} update={updateConfig} />}
            {tab === "features" && <FeaturesSection config={config} update={updateConfig} />}
            {tab === "ads" && <AdsSection config={config} update={updateConfig} />}
            {tab === "subscription" && <SubscriptionSection config={config} update={updateConfig} />}
            {tab === "promotions" && <PromotionsSection config={config} update={updateConfig} />}
            {tab === "unlocks" && <TempUnlocksSection config={config} update={updateConfig} />}
            {tab === "promos" && <PromoCodesSection config={config} update={updateConfig} />}
            {tab === "app" && <AppConfigSection config={config} update={updateConfig} />}
            {tab === "ui" && <UISection config={config} update={updateConfig} />}
            {tab === "json" && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Raw JSON</h2>
                  <button
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(config, null, 2))}
                    className="text-xs text-green-400 hover:text-green-300"
                  >Copy</button>
                </div>
                <pre className="p-5 text-xs text-gray-300 font-mono overflow-auto max-h-[70vh] leading-5">
                  {JSON.stringify(config, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Sidebar (1 col) */}
          <div className="space-y-6">
            {/* Quick stats */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Config Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Disabled tools</span><span className="text-white">{config.disabledTools.length}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Premium overrides</span><span className="text-white">{Object.keys(config.premiumOverrides).length}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Temp unlocks</span><span className="text-white">{config.temporaryUnlocks.length}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Active banners</span><span className="text-white">{config.promotionBanners.length}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Promo codes</span><span className="text-white">{Object.keys(config.promoCodes ?? {}).length}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Ads</span><span className={config.ads.enabled ? "text-green-400" : "text-red-400"}>{config.ads.enabled ? "On" : "Off"}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Maintenance</span><span className={config.app.maintenanceMode ? "text-red-400" : "text-green-400"}>{config.app.maintenanceMode ? "Active" : "Off"}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Trial days</span><span className="text-white">{config.subscription.trialDays}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Latest version</span><span className="text-white font-mono">{config.app.latestVersion}</span></div>
              </div>
            </div>

            {/* Commit history */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Recent Changes</h3>
              <div className="space-y-2">
                {history.slice(0, 10).map((c, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-green-500">{c.sha}</span>
                      <span className="text-gray-500">{c.date ? new Date(c.date).toLocaleDateString() : ""}</span>
                    </div>
                    <p className="text-gray-400 truncate">{c.message}</p>
                  </div>
                ))}
                {history.length === 0 && <p className="text-xs text-gray-500">No history available</p>}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
