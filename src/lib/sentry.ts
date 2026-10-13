/**
 * Sentry error tracking integration for Printzy.
 * Configures environment tags, sensitive data scrubbing, and safe fallback if unconfigured.
 */

import * as Sentry from "@sentry/react";
import { getEnvConfig } from "./env";
import { sanitize, redactSensitiveString } from "./logger";

let isSentryInitialized = false;

/**
 * Initializes Sentry if a valid DSN is provided in the current environment.
 */
export function initSentry(): void {
  if (isSentryInitialized) return;

  const config = getEnvConfig();

  // If in test environment or no DSN is specified, do not initialize remote Sentry client
  if (config.isTest || !config.sentryDsn) {
    return;
  }

  try {
    Sentry.init({
      dsn: config.sentryDsn,
      environment: config.environment,
      // Sample 100% of errors in dev/staging, 20% in production for high volume
      sampleRate: config.isProduction ? 0.2 : 1.0,
      // Trace 10% in production, 100% in staging
      tracesSampleRate: config.isProduction ? 0.1 : 1.0,
      beforeSend(event) {
        // Redact sensitive data from event message and exceptions
        if (event.message) {
          event.message = redactSensitiveString(event.message);
        }

        if (event.exception?.values) {
          for (const exc of event.exception.values) {
            if (exc.value) {
              exc.value = redactSensitiveString(exc.value);
            }
          }
        }

        // Scrub sensitive headers & cookies
        if (event.request) {
          if (event.request.headers) {
            const scrubbedHeaders: Record<string, string> = {};
            for (const [k, v] of Object.entries(event.request.headers)) {
              if (/^(authorization|cookie|x-auth-token|token)$/i.test(k)) {
                scrubbedHeaders[k] = "[REDACTED]";
              } else {
                scrubbedHeaders[k] = v;
              }
            }
            event.request.headers = scrubbedHeaders;
          }

          if (event.request.url) {
            event.request.url = redactSensitiveString(event.request.url);
          }
        }

        // Deeply sanitize extra and context data
        if (event.extra) {
          event.extra = sanitize(event.extra) as Record<string, unknown>;
        }
        if (event.contexts) {
          event.contexts = sanitize(event.contexts) as Record<string, Sentry.Context>;
        }

        return event;
      },
    });

    isSentryInitialized = true;
  } catch (err) {
    console.warn("Failed to initialize Sentry:", err);
  }
}

/**
 * Safely captures an exception to Sentry (and logs it in dev).
 */
export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (!isSentryInitialized) return;

  const sanitizedContext = context ? (sanitize(context) as Record<string, unknown>) : undefined;

  if (sanitizedContext) {
    Sentry.captureException(error, {
      extra: sanitizedContext,
    });
  } else {
    Sentry.captureException(error);
  }
}

/**
 * Safely captures an informational or warning message to Sentry.
 */
export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: Record<string, unknown>,
): void {
  if (!isSentryInitialized) return;

  const cleanMessage = redactSensitiveString(message);
  const sanitizedContext = context ? (sanitize(context) as Record<string, unknown>) : undefined;

  if (sanitizedContext) {
    Sentry.captureMessage(cleanMessage, {
      level,
      extra: sanitizedContext,
    });
  } else {
    Sentry.captureMessage(cleanMessage, level);
  }
}

/**
 * Sets user context in Sentry without leaking raw passwords or sensitive credentials.
 */
export function setSentryUser(user: { id?: string; email?: string } | null): void {
  if (!isSentryInitialized) return;
  if (!user) {
    Sentry.setUser(null);
    return;
  }

  const userPayload: Sentry.User = {};
  if (user.id !== undefined) {
    userPayload.id = user.id;
  }
  if (user.email !== undefined) {
    userPayload.email = redactSensitiveString(user.email);
  }

  Sentry.setUser(userPayload);
}
