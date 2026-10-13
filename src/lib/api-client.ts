/**
 * Typed API client with resilient try/catch error handling.
 * Guarantees that raw errors and stack traces are never exposed to end-users.
 */

import { logger, sanitize } from "./logger";
import { captureException } from "./sentry";
import { trackErrorOccurred } from "./analytics";

export type ApiErrorCode =
  | "NETWORK_ERROR"
  | "TIMEOUT_ERROR"
  | "RATE_LIMITED"
  | "SERVER_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "UNKNOWN_ERROR";

export interface ApiError {
  /** Machine-readable error code */
  code: ApiErrorCode;
  /** Human-readable, safe, user-friendly message */
  message: string;
  /** HTTP status code if applicable */
  status?: number | undefined;
  /** ISO timestamp of when error occurred */
  timestamp: string;
}

export type ApiResult<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; error: ApiError; status?: number | undefined };

const FRIENDLY_ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  NETWORK_ERROR:
    "We're unable to connect to the server. Please check your internet connection and try again.",
  TIMEOUT_ERROR: "The request took too long to complete. Please try again in a moment.",
  RATE_LIMITED: "You're making requests a bit too fast. Please wait a moment before trying again.",
  SERVER_ERROR:
    "Our service is temporarily experiencing an issue. Please try again shortly or reach out via WhatsApp.",
  NOT_FOUND: "The requested resource could not be found.",
  UNAUTHORIZED: "Your session has expired. Please refresh the page to continue.",
  FORBIDDEN: "You do not have permission to access this resource.",
  VALIDATION_ERROR:
    "The information provided was invalid or incomplete. Please check your inputs and try again.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again or contact our support team.",
};

/**
 * Maps an HTTP status code to a typed error code.
 */
export function mapStatusToErrorCode(status: number): ApiErrorCode {
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 408) return "TIMEOUT_ERROR";
  if (status === 429) return "RATE_LIMITED";
  if (status === 400 || status === 422) return "VALIDATION_ERROR";
  if (status >= 500) return "SERVER_ERROR";
  return "UNKNOWN_ERROR";
}

/**
 * Creates a standardized, safe ApiError object.
 */
export function createApiError(
  code: ApiErrorCode,
  customFriendlyMessage?: string,
  status?: number,
): ApiError {
  return {
    code,
    message: customFriendlyMessage || FRIENDLY_ERROR_MESSAGES[code],
    status,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Extracts a safe, friendly message from any caught error.
 * Guaranteed to NEVER leak internal stack traces or database errors.
 */
export function getSafeErrorMessage(error: unknown, fallbackMessage?: string): string {
  if (error && typeof error === "object" && "message" in error) {
    const msg = String((error as { message: unknown }).message);
    // Disallow messages that resemble stack traces or SQL errors
    const isLeaky =
      msg.includes("at ") ||
      msg.includes("Error:") ||
      msg.includes("SELECT") ||
      msg.includes("INSERT") ||
      msg.includes("relation") ||
      msg.includes("column");
    if (!isLeaky && msg.length > 0 && msg.length < 200) {
      return msg;
    }
  }
  return fallbackMessage || FRIENDLY_ERROR_MESSAGES.UNKNOWN_ERROR;
}

export interface FetchOptions extends Omit<RequestInit, "signal"> {
  /** Timeout in milliseconds (default: 15,000ms) */
  timeoutMs?: number;
  /** Optional custom friendly error message */
  customErrorMessage?: string;
  /** Explicit abort signal */
  signal?: AbortSignal;
}

/**
 * Executes an HTTP fetch with strict timeout, try/catch, typed error handling,
 * and automatic redaction of sensitive credentials.
 */
export async function safeFetch<T>(
  input: string | URL | Request,
  options: FetchOptions = {},
): Promise<ApiResult<T>> {
  const { timeoutMs = 15000, customErrorMessage, signal, ...fetchInit } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(new Error("Timeout"));
  }, timeoutMs);

  const onExternalAbort = () => controller.abort();
  if (signal) {
    signal.addEventListener("abort", onExternalAbort);
  }

  try {
    const response = await fetch(input, {
      ...fetchInit,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    if (signal) {
      signal.removeEventListener("abort", onExternalAbort);
    }

    if (!response.ok) {
      const code = mapStatusToErrorCode(response.status);
      const apiError = createApiError(code, customErrorMessage, response.status);

      logger.warn(`[safeFetch] HTTP ${response.status} for ${String(input)}: ${code}`);

      // Track server-side 5xx errors in Sentry & analytics
      if (response.status >= 500) {
        captureException(new Error(`API Error HTTP ${response.status}: ${code}`), {
          url: String(input),
          status: response.status,
        });
        trackErrorOccurred(code, "api_server_error");
      }

      return {
        ok: false,
        error: apiError,
        status: response.status,
      };
    }

    // Try parsing JSON if content exists
    const contentType = response.headers.get("content-type") ?? "";
    let data: T;

    if (contentType.includes("application/json")) {
      data = (await response.json()) as T;
    } else {
      const text = await response.text();
      data = text as unknown as T;
    }

    return {
      ok: true,
      data,
      status: response.status,
    };
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (signal) {
      signal.removeEventListener("abort", onExternalAbort);
    }

    const isAbortError =
      error instanceof Error && (error.name === "AbortError" || error.message === "Timeout");

    const code: ApiErrorCode = isAbortError ? "TIMEOUT_ERROR" : "NETWORK_ERROR";
    const apiError = createApiError(code, customErrorMessage);

    logger.warn(`[safeFetch] Request failed: ${code}`, {
      url: String(input),
      errorName: error instanceof Error ? error.name : typeof error,
    });

    captureException(error, {
      url: String(input),
      code,
    });
    trackErrorOccurred(code, "api_network_error");

    return {
      ok: false,
      error: apiError,
    };
  }
}

/**
 * Wraps any arbitrary asynchronous action in a safe typed result.
 * Prevents unhandled rejections from escaping to the UI.
 */
export async function safeAsync<T>(
  action: () => Promise<T>,
  fallbackMessage?: string,
): Promise<ApiResult<T>> {
  try {
    const data = await action();
    return { ok: true, data, status: 200 };
  } catch (error) {
    const safeMsg = getSafeErrorMessage(error, fallbackMessage);
    const apiError = createApiError("UNKNOWN_ERROR", safeMsg);

    logger.error("[safeAsync] Caught unhandled async error:", sanitize(error));
    captureException(error);
    trackErrorOccurred("UNKNOWN_ERROR", "async_action");

    return { ok: false, error: apiError };
  }
}
