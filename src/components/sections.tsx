"use client";

import React, { useState } from "react";
import type { RemoteConfig, PromotionBanner, TemporaryUnlock, PromoCodeConfig } from "@/types/config";
import { Card, Toggle, NumberInput, TextInput, TextArea, TagInput, Select, Button, ColorInput, DateTimeInput } from "./ui";
import { ToolToggleList } from "./ToolToggleList";
import { ToolStatusList } from "./ToolStatusList";

type Updater = (fn: (prev: RemoteConfig) => RemoteConfig) => void;

// ---------------------------------------------------------------------------
// Tool Control
// ---------------------------------------------------------------------------

export function ToolControlSection({ config, update }: { config: RemoteConfig; update: Updater }) {
  const [tab, setTab] = useState<"status" | "premium">("status");

  // Compute unified status for each tool.
  const disabledSet = new Set(config.disabledTools);
  const hiddenSet = new Set(config.hiddenTools);
  const maintenanceMap = config.toolMaintenanceMessages;

  const statusCounts = {
    disabled: config.disabledTools.length,
    hidden: config.hiddenTools.length,
    maintenance: Object.keys(maintenanceMap).length,
    premium: Object.keys(config.premiumOverrides).length,
  };

  return (
    <Card title="Tool Management" badge={`${statusCounts.disabled + statusCounts.maintenance} unavailable`}>
      {/* Sub-tabs */}
      <div className="flex gap-1 mb-3">
        <button onClick={() => setTab("status")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg ${tab === "status" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-gray-200"}`}>
          Status & Visibility ({statusCounts.disabled + statusCounts.hidden + statusCounts.maintenance})
        </button>
        <button onClick={() => setTab("premium")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg ${tab === "premium" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-gray-200"}`}>
          Premium Overrides ({statusCounts.premium})
        </button>
      </div>

      {tab === "status" && (
        <>
          {/* Legend */}
          <div className="flex gap-4 text-xs text-gray-500 mb-2">
            <span><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />Active</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" />Disabled</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1" />Maintenance</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-gray-500 mr-1" />Hidden</span>
          </div>

          <ToolStatusList
            config={config}
            disabledSet={disabledSet}
            hiddenSet={hiddenSet}
            maintenanceMap={maintenanceMap}
            onSetDisabled={(id, on) => update((c) => ({
              ...c,
              disabledTools: on ? [...c.disabledTools, id] : c.disabledTools.filter((t) => t !== id),
              // Remove from maintenance if disabling (disabled takes priority).
              toolMaintenanceMessages: on ? ((() => { const m = { ...c.toolMaintenanceMessages }; delete m[id]; return m; })()) : c.toolMaintenanceMessages,
            }))}
            onSetHidden={(id, on) => update((c) => ({
              ...c,
              hiddenTools: on ? [...c.hiddenTools, id] : c.hiddenTools.filter((t) => t !== id),
            }))}
            onSetMaintenance={(id, msg) => update((c) => {
              if (msg) {
                return { ...c, toolMaintenanceMessages: { ...c.toolMaintenanceMessages, [id]: msg } };
              } else {
                const m = { ...c.toolMaintenanceMessages };
                delete m[id];
                return { ...c, toolMaintenanceMessages: m };
              }
            })}
          />
        </>
      )}

      {tab === "premium" && (
        <ToolToggleList
          label="Premium Tools"
          description="Toggled tools require a premium subscription"
          selected={new Set(Object.keys(config.premiumOverrides).filter((k) => config.premiumOverrides[k]))}
          positiveToggle
          onToggle={(id, on) => update((c) => {
            if (on) {
              return { ...c, premiumOverrides: { ...c.premiumOverrides, [id]: true } };
            } else {
              const o = { ...c.premiumOverrides };
              delete o[id];
              return { ...c, premiumOverrides: o };
            }
          })}
        />
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Ads
// ---------------------------------------------------------------------------

export function AdsSection({ config, update }: { config: RemoteConfig; update: Updater }) {
  const ads = config.ads;
  const set = (partial: Partial<RemoteConfig["ads"]>) =>
    update((c) => ({ ...c, ads: { ...c.ads, ...partial } }));

  return (
    <Card title="Ads Configuration" badge={ads.enabled ? "Active" : "Off"}>
      <Toggle label="Ads Enabled" description="Master switch for all ads" checked={ads.enabled} onChange={(v) => set({ enabled: v })} />
      <Toggle label="Banner Ads" checked={ads.bannerEnabled} onChange={(v) => set({ bannerEnabled: v })} />
      <Toggle label="Interstitial Ads" checked={ads.interstitialEnabled} onChange={(v) => set({ interstitialEnabled: v })} />
      <NumberInput label="Interstitial Frequency (every N tool opens)" value={ads.interstitialFrequency} onChange={(v) => set({ interstitialFrequency: v })} min={1} max={20} />
      <NumberInput label="Interstitial Cooldown (seconds)" value={ads.interstitialCooldownSeconds} onChange={(v) => set({ interstitialCooldownSeconds: v })} min={30} max={600} />
      <Toggle label="Rewarded Ads" description="Watch ad to unlock premium tool" checked={ads.rewardedEnabled} onChange={(v) => set({ rewardedEnabled: v })} />
      <NumberInput label="Rewarded Unlock Duration (minutes)" value={ads.rewardedToolUnlockMinutes} onChange={(v) => set({ rewardedToolUnlockMinutes: v })} min={1} max={60} />
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Subscription
// ---------------------------------------------------------------------------

export function SubscriptionSection({ config, update }: { config: RemoteConfig; update: Updater }) {
  const sub = config.subscription;
  const set = (partial: Partial<RemoteConfig["subscription"]>) =>
    update((c) => ({ ...c, subscription: { ...c.subscription, ...partial } }));

  return (
    <Card title="Subscription & Paywall">
      <NumberInput label="Free Trial Days" value={sub.trialDays} onChange={(v) => set({ trialDays: v })} min={0} max={30} />
      <Toggle label="Show Paywall on Launch" checked={sub.showPaywallOnLaunch} onChange={(v) => set({ showPaywallOnLaunch: v })} />
      <NumberInput label="Paywall Launch Delay (seconds)" value={sub.paywallLaunchDelay} onChange={(v) => set({ paywallLaunchDelay: v })} min={0} max={30} />
      <NumberInput label="Show Paywall After N Tool Uses" value={sub.showPaywallAfterToolUses} onChange={(v) => set({ showPaywallAfterToolUses: v })} min={0} max={50} />
      <div className="border-t border-gray-800 pt-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Discount Campaign</span>
      </div>
      <NumberInput label="Discount %" value={sub.discountPercentage} onChange={(v) => set({ discountPercentage: v })} min={0} max={90} />
      <TextInput label="Discount Message" value={sub.discountMessage} onChange={(v) => set({ discountMessage: v })} placeholder="20% off this month!" />
      <DateTimeInput label="Discount Expires At" value={sub.discountExpiresAt} onChange={(v) => set({ discountExpiresAt: v })} />
    </Card>
  );
}

// ---------------------------------------------------------------------------
// App Config
// ---------------------------------------------------------------------------

export function AppConfigSection({ config, update }: { config: RemoteConfig; update: Updater }) {
  const app = config.app;
  const set = (partial: Partial<RemoteConfig["app"]>) =>
    update((c) => ({ ...c, app: { ...c.app, ...partial } }));

  return (
    <Card title="App & Versioning" badge={app.maintenanceMode ? "MAINTENANCE" : undefined}>
      <TextInput label="Latest Version" value={app.latestVersion} onChange={(v) => set({ latestVersion: v })} mono />
      <TextInput label="Min Supported Version" value={app.minSupportedVersion} onChange={(v) => set({ minSupportedVersion: v })} mono />
      <Toggle label="Force Update" description="Block app until user updates" checked={app.forceUpdate} onChange={(v) => set({ forceUpdate: v })} />
      <div className="border-t border-gray-800 pt-3">
        <Toggle label="Maintenance Mode" description="Block entire app with message" checked={app.maintenanceMode} onChange={(v) => set({ maintenanceMode: v })} />
        {app.maintenanceMode && (
          <>
            <TextInput label="Maintenance Message" value={app.maintenanceMessage} onChange={(v) => set({ maintenanceMessage: v })} />
            <DateTimeInput label="End Time" value={app.maintenanceEndTime} onChange={(v) => set({ maintenanceEndTime: v })} />
          </>
        )}
      </div>
      <div className="border-t border-gray-800 pt-3">
        <TagInput label="Announcements" tags={app.announcements} onChange={(v) => set({ announcements: v })} placeholder="Announcement text" />
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Features
// ---------------------------------------------------------------------------

export function FeaturesSection({ config, update }: { config: RemoteConfig; update: Updater }) {
  const f = config.features;
  const set = (partial: Partial<RemoteConfig["features"]>) =>
    update((c) => ({ ...c, features: { ...c.features, ...partial } }));

  const flags: { key: keyof RemoteConfig["features"]; label: string; desc: string }[] = [
    { key: "enableNfc", label: "NFC Tools", desc: "NFC reader, writer, info" },
    { key: "enablePdfTools", label: "PDF Tools", desc: "Viewer, merge, split, compress" },
    { key: "enableSensorTools", label: "Sensor Tools", desc: "Compass, accelerometer, gyroscope" },
    { key: "enableNetworkTools", label: "Network Tools", desc: "Speed test, ping, DNS" },
    { key: "enableDarkMode", label: "Dark Mode", desc: "Allow dark theme" },
    { key: "enableSearch", label: "Search", desc: "Global tool search" },
    { key: "enableFavorites", label: "Favorites", desc: "Favorite tools feature" },
    { key: "enableSharing", label: "Sharing", desc: "Share tool results" },
    { key: "enableCrashReporting", label: "Crash Reporting", desc: "Firebase Crashlytics" },
    { key: "enableAnalytics", label: "Analytics", desc: "Firebase Analytics" },
  ];

  return (
    <Card title="Feature Flags" badge={`${Object.values(f).filter(Boolean).length}/${Object.keys(f).length} on`}>
      {flags.map((fl) => (
        <Toggle key={fl.key} label={fl.label} description={fl.desc} checked={f[fl.key]} onChange={(v) => set({ [fl.key]: v })} />
      ))}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// UI Config
// ---------------------------------------------------------------------------

export function UISection({ config, update }: { config: RemoteConfig; update: Updater }) {
  const ui = config.ui;
  const set = (partial: Partial<RemoteConfig["ui"]>) =>
    update((c) => ({ ...c, ui: { ...c.ui, ...partial } }));

  return (
    <Card title="UI Settings">
      <NumberInput label="Home Grid Columns" value={ui.homeGridColumns} onChange={(v) => set({ homeGridColumns: v })} min={1} max={4} />
      <NumberInput label="Max Recent Tools" value={ui.maxRecentTools} onChange={(v) => set({ maxRecentTools: v })} min={0} max={20} />
      <Toggle label="Show Recommended" checked={ui.showRecommended} onChange={(v) => set({ showRecommended: v })} />
      <Toggle label="Show Recently Used" checked={ui.showRecentlyUsed} onChange={(v) => set({ showRecentlyUsed: v })} />
      <Toggle label="Show Category Descriptions" checked={ui.showCategoryDescriptions} onChange={(v) => set({ showCategoryDescriptions: v })} />
      <Toggle label="Enable Animations" checked={ui.enableAnimations} onChange={(v) => set({ enableAnimations: v })} />
      <Toggle label="Enable Haptics" checked={ui.enableHaptics} onChange={(v) => set({ enableHaptics: v })} />
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Promotions
// ---------------------------------------------------------------------------

export function PromotionsSection({ config, update }: { config: RemoteConfig; update: Updater }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const addBanner = () => {
    const banner: PromotionBanner = {
      id: `promo-${Date.now()}`,
      title: "New Promotion",
      message: "Description here",
      type: "promo",
      backgroundColor: "#16A34A",
      textColor: "#FFFFFF",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      targetAudience: "all",
      priority: 1,
      dismissible: true,
      showOnce: false,
    };
    update((c) => ({ ...c, promotionBanners: [...c.promotionBanners, banner] }));
    setExpanded(banner.id);
  };

  const updateBanner = (id: string, partial: Partial<PromotionBanner>) => {
    update((c) => ({
      ...c,
      promotionBanners: c.promotionBanners.map((b) => b.id === id ? { ...b, ...partial } : b),
    }));
  };

  const removeBanner = (id: string) => {
    update((c) => ({ ...c, promotionBanners: c.promotionBanners.filter((b) => b.id !== id) }));
  };

  return (
    <Card title="Promotion Banners" badge={`${config.promotionBanners.length}`}>
      {config.promotionBanners.map((b) => (
        <div key={b.id} className="border border-gray-800 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === b.id ? null : b.id)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-800/30 hover:bg-gray-800/50"
          >
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: b.backgroundColor }} />
              <span className="text-sm text-gray-200">{b.title}</span>
              <span className="text-xs text-gray-500">{b.type}</span>
            </div>
            <span className="text-xs text-gray-500">{expanded === b.id ? "Collapse" : "Edit"}</span>
          </button>
          {expanded === b.id && (
            <div className="p-4 space-y-3 border-t border-gray-800">
              <TextInput label="Title" value={b.title} onChange={(v) => updateBanner(b.id, { title: v })} />
              <TextInput label="Message" value={b.message} onChange={(v) => updateBanner(b.id, { message: v })} />
              <div className="grid grid-cols-2 gap-3">
                <Select label="Type" value={b.type} onChange={(v) => updateBanner(b.id, { type: v })}
                  options={[{ value: "info", label: "Info" }, { value: "promo", label: "Promo" }, { value: "event", label: "Event" }, { value: "warning", label: "Warning" }]} />
                <Select label="Audience" value={b.targetAudience} onChange={(v) => updateBanner(b.id, { targetAudience: v })}
                  options={[{ value: "all", label: "All" }, { value: "free", label: "Free" }, { value: "premium", label: "Premium" }]} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ColorInput label="Background Color" value={b.backgroundColor} onChange={(v) => updateBanner(b.id, { backgroundColor: v })} />
                <ColorInput label="Text Color" value={b.textColor} onChange={(v) => updateBanner(b.id, { textColor: v })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <DateTimeInput label="Start Date" value={b.startDate} onChange={(v) => updateBanner(b.id, { startDate: v })} />
                <DateTimeInput label="End Date" value={b.endDate} onChange={(v) => updateBanner(b.id, { endDate: v })} />
              </div>
              <TextInput label="Action Label" value={b.actionLabel ?? ""} onChange={(v) => updateBanner(b.id, { actionLabel: v || undefined })} placeholder="e.g. Learn More" />
              <div className="grid grid-cols-2 gap-3">
                <Select label="Action Type" value={b.actionType ?? "dismiss"} onChange={(v) => updateBanner(b.id, { actionType: v })}
                  options={[{ value: "dismiss", label: "Dismiss" }, { value: "navigate_tool", label: "Open Tool" }, { value: "navigate_paywall", label: "Open Paywall" }, { value: "open_url", label: "Open URL" }]} />
                <TextInput label="Action Payload" value={b.actionPayload ?? ""} onChange={(v) => updateBanner(b.id, { actionPayload: v || undefined })} placeholder="tool-id or URL" />
              </div>
              <div className="flex gap-3">
                <Toggle label="Dismissible" checked={b.dismissible} onChange={(v) => updateBanner(b.id, { dismissible: v })} />
                <Toggle label="Show Once" checked={b.showOnce} onChange={(v) => updateBanner(b.id, { showOnce: v })} />
              </div>
              <NumberInput label="Priority" value={b.priority} onChange={(v) => updateBanner(b.id, { priority: v })} min={0} max={100} />
              <Button variant="danger" onClick={() => removeBanner(b.id)}>Remove Banner</Button>
            </div>
          )}
        </div>
      ))}
      <Button variant="secondary" onClick={addBanner}>+ Add Promotion Banner</Button>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Temporary Unlocks
// ---------------------------------------------------------------------------

export function TempUnlocksSection({ config, update }: { config: RemoteConfig; update: Updater }) {
  const addUnlock = () => {
    const u: TemporaryUnlock = {
      toolId: "",
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      reason: "promotional",
      message: "Free for a limited time!",
    };
    update((c) => ({ ...c, temporaryUnlocks: [...c.temporaryUnlocks, u] }));
  };

  return (
    <Card title="Temporary Unlocks" badge={`${config.temporaryUnlocks.length}`}>
      {config.temporaryUnlocks.map((u, i) => (
        <div key={i} className="border border-gray-800 rounded-lg p-3 space-y-2">
          <div className="flex gap-2">
            <TextInput label="Tool ID" value={u.toolId} onChange={(v) => update((c) => ({
              ...c, temporaryUnlocks: c.temporaryUnlocks.map((x, j) => j === i ? { ...x, toolId: v } : x),
            }))} mono />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <DateTimeInput label="Expires At" value={u.expiresAt} onChange={(v) => update((c) => ({
              ...c, temporaryUnlocks: c.temporaryUnlocks.map((x, j) => j === i ? { ...x, expiresAt: v } : x),
            }))} />
            <Select label="Reason" value={u.reason} onChange={(v) => update((c) => ({
              ...c, temporaryUnlocks: c.temporaryUnlocks.map((x, j) => j === i ? { ...x, reason: v } : x),
            }))} options={[
              { value: "promotional", label: "Promotional" },
              { value: "maintenance_compensation", label: "Maintenance Comp" },
              { value: "event", label: "Event" },
            ]} />
          </div>
          <TextInput label="Message" value={u.message} onChange={(v) => update((c) => ({
            ...c, temporaryUnlocks: c.temporaryUnlocks.map((x, j) => j === i ? { ...x, message: v } : x),
          }))} />
          <Button variant="danger" onClick={() => update((c) => ({
            ...c, temporaryUnlocks: c.temporaryUnlocks.filter((_, j) => j !== i),
          }))}>Remove</Button>
        </div>
      ))}
      <Button variant="secondary" onClick={addUnlock}>+ Add Temporary Unlock</Button>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Promo Codes
// ---------------------------------------------------------------------------

export function PromoCodesSection({ config, update }: { config: RemoteConfig; update: Updater }) {
  const [newCode, setNewCode] = useState("");
  const codes = config.promoCodes ?? {};

  const addCode = () => {
    const code = newCode.trim().toUpperCase();
    if (!code) return;
    const entry: PromoCodeConfig = { type: "premium_days", value: 7, maxUses: 100, expiresAt: new Date(Date.now() + 90 * 86400000).toISOString() };
    update((c) => ({ ...c, promoCodes: { ...c.promoCodes, [code]: entry } }));
    setNewCode("");
  };

  return (
    <Card title="Promo Codes" badge={`${Object.keys(codes).length}`}>
      {Object.entries(codes).map(([code, cfg]) => (
        <div key={code} className="border border-gray-800 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono font-bold text-green-400">{code}</span>
            <button onClick={() => update((c) => {
              const p = { ...c.promoCodes };
              delete p[code];
              return { ...c, promoCodes: p };
            })} className="text-xs text-red-400">&times; Remove</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select label="Type" value={cfg.type} onChange={(v) => update((c) => ({
              ...c, promoCodes: { ...c.promoCodes, [code]: { ...cfg, type: v } },
            }))} options={[
              { value: "premium_days", label: "Premium Days" },
              { value: "discount_pct", label: "Discount %" },
              { value: "lifetime_unlock", label: "Lifetime" },
            ]} />
            <NumberInput label="Value" value={cfg.value} onChange={(v) => update((c) => ({
              ...c, promoCodes: { ...c.promoCodes, [code]: { ...cfg, value: v } },
            }))} min={1} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <NumberInput label="Max Uses" value={cfg.maxUses} onChange={(v) => update((c) => ({
              ...c, promoCodes: { ...c.promoCodes, [code]: { ...cfg, maxUses: v } },
            }))} min={1} />
            <DateTimeInput label="Expires At" value={cfg.expiresAt} onChange={(v) => update((c) => ({
              ...c, promoCodes: { ...c.promoCodes, [code]: { ...cfg, expiresAt: v } },
            }))} />
          </div>
        </div>
      ))}
      <div className="flex gap-2">
        <input value={newCode} onChange={(e) => setNewCode(e.target.value.toUpperCase())} placeholder="CODE_NAME"
          onKeyDown={(e) => e.key === "Enter" && addCode()}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono uppercase outline-none" />
        <Button variant="secondary" onClick={addCode}>+ Add Code</Button>
      </div>
    </Card>
  );
}
