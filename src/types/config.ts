/**
 * Remote config schema — must match the app's RemoteConfig interface
 * in UltimateToolbox/src/services/remoteConfigService.ts exactly.
 */

export interface TemporaryUnlock {
  toolId: string;
  expiresAt: string;
  reason: "promotional" | "maintenance_compensation" | "event";
  message: string;
}

export interface PromotionBanner {
  id: string;
  title: string;
  message: string;
  type: "info" | "promo" | "event" | "warning";
  backgroundColor: string;
  textColor: string;
  actionLabel?: string;
  actionType?: "navigate_tool" | "navigate_paywall" | "open_url" | "dismiss";
  actionPayload?: string;
  startDate: string;
  endDate: string;
  targetAudience: "all" | "free" | "premium";
  priority: number;
  dismissible: boolean;
  showOnce: boolean;
}

export interface AdsConfig {
  enabled: boolean;
  bannerEnabled: boolean;
  interstitialEnabled: boolean;
  interstitialFrequency: number;
  interstitialCooldownSeconds: number;
  rewardedEnabled: boolean;
  rewardedToolUnlockMinutes: number;
  bannedAdCategories: string[];
}

export interface SubscriptionConfig {
  trialDays: number;
  showPaywallOnLaunch: boolean;
  paywallLaunchDelay: number;
  showPaywallAfterToolUses: number;
  discountPercentage: number;
  discountMessage: string;
  discountExpiresAt: string;
}

export interface ReleaseNote {
  version: string;
  date: string;
  highlights: string[];
}

export interface AppConfig {
  minSupportedVersion: string;
  latestVersion: string;
  forceUpdate: boolean;
  updateUrl: { ios: string; android: string };
  maintenanceMode: boolean;
  maintenanceMessage: string;
  maintenanceEndTime: string;
  announcements: string[];
  releaseNotes: ReleaseNote[];
}

export interface UIConfig {
  homeGridColumns: number;
  showRecommended: boolean;
  showRecentlyUsed: boolean;
  maxRecentTools: number;
  showCategoryDescriptions: boolean;
  enableAnimations: boolean;
  enableHaptics: boolean;
}

export interface FeaturesConfig {
  enableNfc: boolean;
  enablePdfTools: boolean;
  enableSensorTools: boolean;
  enableNetworkTools: boolean;
  enableDarkMode: boolean;
  enableSearch: boolean;
  enableFavorites: boolean;
  enableSharing: boolean;
  enableCrashReporting: boolean;
  enableAnalytics: boolean;
}

export interface PromoCodeConfig {
  type: "premium_days" | "discount_pct" | "lifetime_unlock";
  value: number;
  maxUses: number;
  expiresAt: string;
}

export interface RemoteConfig {
  disabledTools: string[];
  hiddenTools: string[];
  premiumOverrides: Record<string, boolean>;
  toolMaintenanceMessages: Record<string, string>;
  temporaryUnlocks: TemporaryUnlock[];
  promotionBanners: PromotionBanner[];
  ads: AdsConfig;
  subscription: SubscriptionConfig;
  app: AppConfig;
  ui: UIConfig;
  features: FeaturesConfig;
  promoCodes: Record<string, PromoCodeConfig>;
}
