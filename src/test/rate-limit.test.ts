import { describe, expect, it } from "vitest";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

describe("Rate Limiting Module", () => {
  it("extracts client IP from Cloudflare header", () => {
    const req = new Request("https://printzy.pk", {
      headers: { "cf-connecting-ip": "203.0.113.195" },
    });
    expect(getClientIp(req)).toBe("203.0.113.195");
  });

  it("handles an empty forwarded-for header without throwing", () => {
    const req = new Request("https://printzy.pk", {
      headers: { "x-forwarded-for": "" },
    });
    expect(getClientIp(req)).toBe("127.0.0.1");
  });

  it("uses the configured category limit with the edge binding", async () => {
    const testIp = "192.0.2.42";
    const binding = {
      limit: async ({ key }: { key: string }) => ({
        success: key !== "blocked-ip",
      }),
    };

    await expect(checkRateLimit(binding, testIp, "sensitive")).resolves.toEqual({
      success: true,
      limit: 5,
      periodSeconds: 60,
    });
    await expect(checkRateLimit(binding, "blocked-ip", "sensitive")).resolves.toMatchObject({
      success: false,
      limit: 5,
    });
  });
});
