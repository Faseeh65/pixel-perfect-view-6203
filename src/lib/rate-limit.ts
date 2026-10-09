// Sliding window Rate Limiter for Nitro / SSR Server Layer

type RateLimitRecord = {
  count: number;
  resetTime: number;
};

const store = new Map<string, RateLimitRecord>();

// Periodically clean up expired keys to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (now > record.resetTime) {
      store.delete(key);
    }
  }
}, 30_000);

export function getClientIp(request: Request): string {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}

export type RateLimitConfig = {
  windowMs: number;
  maxRequests: number;
};

export const RATE_LIMIT_CONFIGS = {
  // Sensitive endpoints (e.g. quote form submissions, auth routes): 5 requests / min per IP
  sensitive: { windowMs: 60_000, maxRequests: 5 },
  // General page & static API requests: 60 requests / min per IP
  general: { windowMs: 60_000, maxRequests: 60 },
};

export function checkRateLimit(
  ip: string,
  category: keyof typeof RATE_LIMIT_CONFIGS = "general",
): { success: boolean; limit: number; remaining: number; resetAfterSeconds: number } {
  const config = RATE_LIMIT_CONFIGS[category];
  const now = Date.now();
  const key = `${category}:${ip}`;

  const record = store.get(key);

  if (!record || now > record.resetTime) {
    store.set(key, { count: 1, resetTime: now + config.windowMs });
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      resetAfterSeconds: Math.ceil(config.windowMs / 1000),
    };
  }

  if (record.count >= config.maxRequests) {
    const resetAfterSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      resetAfterSeconds,
    };
  }

  record.count += 1;
  const resetAfterSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - record.count,
    resetAfterSeconds,
  };
}

export function createRateLimitResponse(resetAfterSeconds: number): Response {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>429 Too Many Requests | Printzy</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #FAF7F2; color: #1F4E5F; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
    .card { background: white; padding: 2.5rem; border-radius: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.05); max-width: 480px; margin: 1rem; }
    h1 { margin-top: 0; color: #1F4E5F; }
    p { color: #555; line-height: 1.5; }
    .btn { display: inline-block; margin-top: 1rem; padding: 0.75rem 1.5rem; background: #1F4E5F; color: white; border-radius: 0.5rem; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Too Many Requests</h1>
    <p>You have made too many requests in a short period. Please wait <strong>${resetAfterSeconds} seconds</strong> before trying again.</p>
    <a href="/" class="btn">Return to Home</a>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 429,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Retry-After": String(resetAfterSeconds),
      "X-RateLimit-Limit": "60",
      "X-RateLimit-Remaining": "0",
    },
  });
}
