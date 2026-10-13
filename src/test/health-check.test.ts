import { describe, expect, it } from "vitest";
import { handleHealthCheck } from "@/lib/health-check";

describe("Health check endpoint", () => {
  it("returns an uncached liveness response", async () => {
    const response = handleHealthCheck(new Request("https://printzy.pk/healthz"));

    expect(response?.status).toBe(200);
    expect(response?.headers.get("Cache-Control")).toBe("no-store");
    await expect(response?.json()).resolves.toEqual({ status: "ok" });
  });

  it("does not handle unrelated paths", () => {
    expect(handleHealthCheck(new Request("https://printzy.pk/"))).toBeUndefined();
  });

  it("rejects unsupported methods", () => {
    const response = handleHealthCheck(
      new Request("https://printzy.pk/healthz", { method: "POST" }),
    );

    expect(response?.status).toBe(405);
    expect(response?.headers.get("Allow")).toBe("GET, HEAD");
  });
});
