/**
 * Environment separation and runtime configuration.
 * Supports development, staging, and production tiers.
 */

export type AppEnvironment = "development" | "staging" | "production" | "test";

export interface EnvConfig {
  /** The current application environment tier */
  environment: AppEnvironment;
  /** True when running in local development mode */
  isDevelopment: boolean;
  /** True when running in the staging environment */
  isStaging: boolean;
  /** True when running in production */
  isProduction: boolean;
  /** True when running inside Vitest / automated tests */
  isTest: boolean;
  /** Canonical public site URL */
  siteUrl: string;
  /** Sentry DSN for error telemetry (optional in dev, recommended in prod) */
  sentryDsn?: string | undefined;
  /** Cloudflare Turnstile site key for bot verification */
  turnstileSiteKey: string;
  /** Whether analytics tracking is active */
  analyticsEnabled: boolean;
  /** Log level for console/monitoring output */
  logLevel: "debug" | "info" | "warn" | "error";
  /** Whether to show developer diagnostics in fallback error boundaries */
  enableDevErrorDetails: boolean;
}

const DEFAULT_PRODUCTION_URL = "https://printzy.pk";
const DEFAULT_STAGING_URL = "https://staging.printzy.pk";
const DEFAULT_DEVELOPMENT_URL = "http://localhost:3000";

// Cloudflare Turnstile demo sitekey (always passes) used for dev & test
const TURNSTILE_DEMO_KEY = "1x00000000000000000000AA";

/**
 * Resolves the active environment from Vite env vars or Node process env.
 */
export function resolveEnvironment(): AppEnvironment {
  // Test runner detection
  if (
    typeof process !== "undefined" &&
    (process.env?.["VITEST"] === "true" || process.env?.["NODE_ENV"] === "test")
  ) {
    return "test";
  }

  // Vite environment or custom VITE_APP_ENV flag
  const appEnv =
    (typeof import.meta !== "undefined" &&
      (import.meta.env?.["VITE_APP_ENV"] || import.meta.env?.["MODE"])) ||
    (typeof process !== "undefined" && process.env?.["NODE_ENV"]) ||
    "development";

  const normalized = String(appEnv).toLowerCase().trim();

  if (normalized === "production" || normalized === "prod") {
    return "production";
  }
  if (normalized === "staging" || normalized === "stage") {
    return "staging";
  }
  if (normalized === "test") {
    return "test";
  }
  return "development";
}

/**
 * Returns strongly typed environment configuration with safe defaults per tier.
 */
export function getEnvConfig(): EnvConfig {
  const environment = resolveEnvironment();
  const isDevelopment = environment === "development";
  const isStaging = environment === "staging";
  const isProduction = environment === "production";
  const isTest = environment === "test";

  const rawSiteUrl =
    typeof import.meta !== "undefined" && import.meta.env?.["VITE_SITE_URL"]
      ? String(import.meta.env["VITE_SITE_URL"]).trim()
      : undefined;

  const defaultUrl = isStaging ? DEFAULT_STAGING_URL : DEFAULT_PRODUCTION_URL;

  const siteUrl = (rawSiteUrl || defaultUrl).replace(/\/$/, "");

  const sentryDsn =
    typeof import.meta !== "undefined" && import.meta.env?.["VITE_SENTRY_DSN"]
      ? String(import.meta.env["VITE_SENTRY_DSN"]).trim()
      : undefined;

  const turnstileSiteKey =
    typeof import.meta !== "undefined" && import.meta.env?.["VITE_TURNSTILE_SITE_KEY"]
      ? String(import.meta.env["VITE_TURNSTILE_SITE_KEY"]).trim()
      : TURNSTILE_DEMO_KEY;

  const rawAnalyticsFlag =
    typeof import.meta !== "undefined" ? import.meta.env?.["VITE_ANALYTICS_ENABLED"] : undefined;

  const analyticsEnabled =
    rawAnalyticsFlag !== undefined
      ? rawAnalyticsFlag === "true" || rawAnalyticsFlag === true
      : isProduction || isStaging;

  const logLevel: EnvConfig["logLevel"] = isDevelopment ? "debug" : isStaging ? "info" : "warn";

  return {
    environment,
    isDevelopment,
    isStaging,
    isProduction,
    isTest,
    siteUrl,
    sentryDsn: sentryDsn || undefined,
    turnstileSiteKey,
    analyticsEnabled,
    logLevel,
    enableDevErrorDetails: isDevelopment,
  };
}

export const env = getEnvConfig();
