import { describe, it, expect, vi, beforeEach } from "vitest";
import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "@/components/site/ErrorBoundary";
import { safeFetch, safeAsync, mapStatusToErrorCode, getSafeErrorMessage } from "@/lib/api-client";
import { sanitize, redactSensitiveString } from "@/lib/logger";
import { getEnvConfig, resolveEnvironment } from "@/lib/env";

describe("Production Reliability: Environment Separation", () => {
  it("correctly identifies the test environment", () => {
    const current = resolveEnvironment();
    expect(current).toBe("test");
  });

  it("returns sensible default config for test tier", () => {
    const config = getEnvConfig();
    expect(config.isTest).toBe(true);
    expect(config.turnstileSiteKey).toBeDefined();
    expect(config.siteUrl).toBeDefined();
  });
});

describe("Production Reliability: Sensitive Data Sanitization", () => {
  it("redacts sensitive fields in nested objects", () => {
    const payload = {
      username: "ali_boxmaker",
      password: "SuperSecretPassword123!",
      token: "secret_token_abc_xyz",
      nested: {
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-IDcSemACt8x4iTMCda8Yhe3iZaWbvV5XKSTbuAn0M",
        apiKey: "pk_live_1234567890",
        regularField: "safe value",
      },
    };

    const sanitized = sanitize(payload);

    expect(sanitized.username).toBe("ali_boxmaker");
    expect(sanitized.password).toBe("[REDACTED]");
    expect(sanitized.token).toBe("[REDACTED]");
    expect(sanitized.nested.authorization).toBe("[REDACTED]");
    expect(sanitized.nested.apiKey).toBe("[REDACTED]");
    expect(sanitized.nested.regularField).toBe("safe value");
  });

  it("redacts Bearer tokens and JWTs in strings", () => {
    const raw = "Header: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.signature";
    const cleaned = redactSensitiveString(raw);
    expect(cleaned).not.toContain("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
  });
});

describe("Production Reliability: Typed API Client Error Handling", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("maps status codes to typed error codes", () => {
    expect(mapStatusToErrorCode(401)).toBe("UNAUTHORIZED");
    expect(mapStatusToErrorCode(403)).toBe("FORBIDDEN");
    expect(mapStatusToErrorCode(404)).toBe("NOT_FOUND");
    expect(mapStatusToErrorCode(429)).toBe("RATE_LIMITED");
    expect(mapStatusToErrorCode(500)).toBe("SERVER_ERROR");
    expect(mapStatusToErrorCode(503)).toBe("SERVER_ERROR");
  });

  it("strips internal SQL/database errors from safe user messages", () => {
    const rawSqlError = new Error(
      "SELECT * FROM quote_requests failed: relation does not exist at /src/db.ts:42",
    );
    const friendly = getSafeErrorMessage(rawSqlError);
    expect(friendly).not.toContain("SELECT");
    expect(friendly).not.toContain("relation");
    expect(friendly).toBe(
      "An unexpected error occurred. Please try again or contact our support team.",
    );
  });

  it("handles HTTP 500 cleanly with safe friendly message", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ rawInternalStack: "Crash inside server" }),
    });

    const result = await safeFetch<{ data: string }>("/api/mock-test");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("SERVER_ERROR");
      expect(result.error.message).toContain("Our service is temporarily experiencing an issue");
      expect(result.error.message).not.toContain("rawInternalStack");
    }
  });

  it("handles HTTP 429 rate limit cleanly with friendly message", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({}),
    });

    const result = await safeFetch<{ data: string }>("/api/quote");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("RATE_LIMITED");
      expect(result.error.message).toContain("You're making requests a bit too fast");
    }
  });

  it("handles network failure cleanly without throwing unhandled exceptions", async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

    const result = await safeFetch<{ data: string }>("/api/fail");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("NETWORK_ERROR");
      expect(result.error.message).toContain("unable to connect to the server");
    }
  });

  it("safeAsync catches thrown exceptions and returns typed result", async () => {
    const result = await safeAsync(async () => {
      throw new Error("Something broke inside action");
    }, "Unable to complete action");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("UNKNOWN_ERROR");
      expect(result.error.message).toBe("Something broke inside action");
    }
  });
});

describe("Production Reliability: Global React Error Boundary", () => {
  function Bomb({ shouldExplode }: { shouldExplode: boolean }) {
    if (shouldExplode) {
      throw new Error("Simulated component render explosion");
    }
    return <div>Normal Content</div>;
  }

  function StateBomb() {
    const [explode, setExplode] = useState(false);
    return (
      <div>
        <button onClick={() => setExplode(true)}>Trigger Error</button>
        <Bomb shouldExplode={explode} />
      </div>
    );
  }

  it("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <Bomb shouldExplode={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Normal Content")).toBeInTheDocument();
  });

  it("catches render errors and displays friendly fallback UI", () => {
    // Suppress console.error in this test since React logs boundary errors
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Bomb shouldExplode={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something didn't load right")).toBeInTheDocument();
    expect(
      screen.getByText(/We encountered an unexpected issue while loading this page/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reload page/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    expect(screen.getByText(/Chat with us on WhatsApp/i)).toBeInTheDocument();

    spy.mockRestore();
  });

  it("recovers and resets when Try Again is clicked", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    let shouldFail = true;
    function Flaky() {
      if (shouldFail) {
        throw new Error("Flaky error");
      }
      return <div>Flaky Recovered</div>;
    }

    const { rerender } = render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something didn't load right")).toBeInTheDocument();

    // Now fix the underlying condition
    shouldFail = false;

    // Click Try Again
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    rerender(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Flaky Recovered")).toBeInTheDocument();

    spy.mockRestore();
  });
});
