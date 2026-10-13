export type RateLimitBinding = {
  limit: (options: { key: string }) => Promise<{ success: boolean }>;
};

export const RATE_LIMIT_CONFIGS = {
  sensitive: { limit: 5, periodSeconds: 60 },
  general: { limit: 60, periodSeconds: 60 },
} as const;

export function getClientIp(request: Request): string {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "127.0.0.1";

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}

export async function checkRateLimit(
  binding: RateLimitBinding,
  ip: string,
  category: keyof typeof RATE_LIMIT_CONFIGS = "general",
): Promise<{ success: boolean; limit: number; periodSeconds: number }> {
  const config = RATE_LIMIT_CONFIGS[category];
  const result = await binding.limit({ key: ip });

  return {
    success: result.success,
    limit: config.limit,
    periodSeconds: config.periodSeconds,
  };
}

export function createRateLimitResponse(limit: number, periodSeconds: number): Response {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>429 Too Many Requests | Printzy</title>
  <style>
    body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #FAF7F2; color: #1F4E5F; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1rem; text-align: center; }
    .card { background: white; padding: 2.5rem; border-radius: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.05); max-width: 30rem; }
    h1 { margin-top: 0; }
    p { color: #555; }
    .btn { display: inline-block; margin-top: 1rem; padding: 0.75rem 1.5rem; background: #1F4E5F; color: white; border-radius: 0.5rem; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Too Many Requests</h1>
    <p>Please wait up to <strong>${periodSeconds} seconds</strong> before trying again.</p>
    <a href="/" class="btn">Return to Home</a>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 429,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Retry-After": String(periodSeconds),
      "X-RateLimit-Limit": String(limit),
      "X-RateLimit-Remaining": "0",
    },
  });
}
