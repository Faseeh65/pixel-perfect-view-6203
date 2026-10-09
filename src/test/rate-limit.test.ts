import { describe, expect, it } from "vitest";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

describe("Rate Limiting Module", () => {
  it("extracts client IP from Cloudflare header", () => {
    const req = new Request("https://printzy.pk", {
      headers: { "cf-connecting-ip": "203.0.113.195" },
    });
    expect(getClientIp(req)).toBe("203.0.113.195");
  });

  it("enforces rate limits per category", () => {
    const testIp = "192.0.2.42";
    
    // First 5 requests should pass under 'sensitive' limit
    for (let i = 0; i < 5; i++) {
      const res = checkRateLimit(testIp, "sensitive");
      expect(res.success).toBe(true);
    }

    // 6th request should fail
    const blockedRes = checkRateLimit(testIp, "sensitive");
    expect(blockedRes.success).toBe(false);
    expect(blockedRes.remaining).toBe(0);
    expect(blockedRes.resetAfterSeconds).toBeGreaterThan(0);
  });
});
