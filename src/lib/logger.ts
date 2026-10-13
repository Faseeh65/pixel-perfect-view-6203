/**
 * Production-grade safe logging utility.
 * Automatically sanitizes and redacts sensitive data (tokens, passwords, PII, keys).
 */

import { getEnvConfig } from "./env";

const SENSITIVE_KEY_REGEX =
  /^(password|token|access_token|refresh_token|secret|authorization|cookie|apikey|api_key|privatekey|cvv|card_number|credit_card|auth)$/i;

const BEARER_REGEX = /Bearer\s+[a-zA-Z0-9_\-.]+/gi;
const JWT_REGEX = /eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]*/g;

/**
 * Redacts sensitive tokens or headers from arbitrary strings.
 */
export function redactSensitiveString(input: string): string {
  return input.replace(BEARER_REGEX, "Bearer [REDACTED]").replace(JWT_REGEX, "[REDACTED_JWT]");
}

/**
 * Deeply sanitizes objects and arrays, replacing sensitive field values with "[REDACTED]".
 */
export function sanitize<T>(data: T, depth = 0): T {
  if (depth > 8 || data == null) return data;

  if (typeof data === "string") {
    return redactSensitiveString(data) as unknown as T;
  }

  if (data instanceof Error) {
    const sanitizedError = new Error(redactSensitiveString(data.message));
    sanitizedError.name = data.name;
    if (data.stack) {
      sanitizedError.stack = redactSensitiveString(data.stack);
    }
    return sanitizedError as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitize(item, depth + 1)) as unknown as T;
  }

  if (typeof data === "object") {
    const copy: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (SENSITIVE_KEY_REGEX.test(key)) {
        copy[key] = "[REDACTED]";
      } else {
        copy[key] = sanitize(value, depth + 1);
      }
    }
    return copy as T;
  }

  return data;
}

const LOG_LEVEL_HIERARCHY = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const;

type LogLevel = keyof typeof LOG_LEVEL_HIERARCHY;

class Logger {
  private getMinLevel(): LogLevel {
    try {
      return getEnvConfig().logLevel;
    } catch {
      return "info";
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const minLevel = this.getMinLevel();
    return LOG_LEVEL_HIERARCHY[level] >= LOG_LEVEL_HIERARCHY[minLevel];
  }

  debug(...args: unknown[]): void {
    if (this.shouldLog("debug")) {
      const sanitized = args.map((arg) => sanitize(arg));
      console.debug("[DEBUG]", ...sanitized);
    }
  }

  info(...args: unknown[]): void {
    if (this.shouldLog("info")) {
      const sanitized = args.map((arg) => sanitize(arg));
      console.info("[INFO]", ...sanitized);
    }
  }

  warn(...args: unknown[]): void {
    if (this.shouldLog("warn")) {
      const sanitized = args.map((arg) => sanitize(arg));
      console.warn("[WARN]", ...sanitized);
    }
  }

  error(...args: unknown[]): void {
    if (this.shouldLog("error")) {
      const sanitized = args.map((arg) => sanitize(arg));
      console.error("[ERROR]", ...sanitized);
    }
  }
}

export const logger = new Logger();
