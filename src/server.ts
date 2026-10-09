import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

import { site } from "./data/site";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://wa.me;",
  "Access-Control-Allow-Origin": site.url,
};

function addSecurityHeaders(response: Response): Response {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

import { getClientIp, checkRateLimit, createRateLimitResponse } from "./lib/rate-limit";

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const ip = getClientIp(request);
      const url = new URL(request.url);

      // Determine rate limit category (sensitive for quote/form POSTs or quote path)
      const isSensitive = url.pathname.startsWith("/quote") && request.method !== "GET";
      const category = isSensitive ? "sensitive" : "general";

      const limitResult = checkRateLimit(ip, category);

      if (!limitResult.success) {
        return addSecurityHeaders(createRateLimitResponse(limitResult.resetAfterSeconds));
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      
      const resWithHeaders = addSecurityHeaders(await normalizeCatastrophicSsrResponse(response));
      resWithHeaders.headers.set("X-RateLimit-Limit", String(limitResult.limit));
      resWithHeaders.headers.set("X-RateLimit-Remaining", String(limitResult.remaining));
      
      return resWithHeaders;
    } catch (error) {
      console.error(error);
      return addSecurityHeaders(new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      }));
    }
  },
};
