/**
 * Lightweight privacy-conscious analytics utility.
 * Integrates with Google Analytics (gtag), Lovable events, and safe dev console logging.
 * Never includes raw personally identifiable information (PII) or secrets.
 */

import { getEnvConfig } from "./env";
import { logger, sanitize } from "./logger";

declare global {
  interface Window {
    gtag?: (
      command: "event" | "config" | "js",
      actionOrDate: string | Date,
      params?: Record<string, unknown>,
    ) => void;
  }
}

export type AnalyticsEvent =
  | "page_view"
  | "quote_request_submitted"
  | "quote_form_started"
  | "whatsapp_click"
  | "phone_click"
  | "email_click"
  | "cta_click"
  | "error_encountered";

/**
 * Tracks a custom event if analytics is enabled.
 */
export function trackEvent(
  eventName: AnalyticsEvent | string,
  properties: Record<string, unknown> = {},
): void {
  const config = getEnvConfig();

  if (!config.analyticsEnabled) {
    return;
  }

  const safeProps = sanitize(properties) as Record<string, unknown>;

  // Log in development for verification
  if (config.isDevelopment) {
    logger.debug(`[Analytics Event: ${eventName}]`, safeProps);
  }

  // 1. Google Analytics (gtag.js)
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    try {
      window.gtag("event", eventName, safeProps);
    } catch (err) {
      logger.warn("Failed to dispatch gtag event", err);
    }
  }

  // 2. Lovable telemetry
  if (typeof window !== "undefined" && typeof window.__lovableEvents?.track === "function") {
    try {
      window.__lovableEvents.track(eventName, safeProps);
    } catch {
      // Ignore Lovable telemetry errors
    }
  }
}

/**
 * Tracks a page view navigation.
 */
export function trackPageView(path: string, title?: string): void {
  trackEvent("page_view", {
    page_path: path,
    page_title: title || (typeof document !== "undefined" ? document.title : ""),
  });
}

/**
 * Tracks when a user submits a quote request (sanitized product/quantity metadata only).
 */
export function trackQuoteSubmitted(metadata: { product: string; quantity?: string }): void {
  trackEvent("quote_request_submitted", {
    product: metadata.product,
    quantity: metadata.quantity || "default",
  });
}

/**
 * Tracks CTA and communication clicks.
 */
export function trackCtaClick(ctaName: string, destination?: string): void {
  trackEvent("cta_click", {
    cta_name: ctaName,
    destination: destination || "",
  });
}

/**
 * Tracks non-fatal operational errors for product analytics.
 */
export function trackErrorOccurred(errorCode: string, errorCategory?: string): void {
  trackEvent("error_encountered", {
    error_code: errorCode,
    category: errorCategory || "general",
  });
}
