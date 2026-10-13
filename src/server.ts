import "./lib/error-capture";

import { renderErrorPage } from "./lib/error-page";
import { logger } from "./lib/logger";
import { captureException } from "./lib/sentry";

import { site } from "./data/site";
import { getCanonicalRedirectUrl } from "./lib/seo";
import { handleHealthCheck } from "./lib/health-check";
import {
  checkRateLimit,
  createRateLimitResponse,
  getClientIp,
  RATE_LIMIT_CONFIGS,
  type RateLimitBinding,
} from "./lib/rate-limit";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://wa.me;",
  "Access-Control-Allow-Origin": site.url,
};

function addResponseHeaders(response: Response, request: Request): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }

  const { pathname } = new URL(request.url);
  const contentType = headers.get("content-type") ?? "";

  if (response.status >= 400) {
    headers.set("Cache-Control", "no-store");
  } else if (contentType.includes("text/html")) {
    headers.set("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=300");
  } else if (isHashedAsset(pathname)) {
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function isHashedAsset(pathname: string): boolean {
  return /^\/assets\/.+-[A-Za-z0-9_-]{8,}\.(?:js|css|woff2|svg|png|jpe?g|webp)$/i.test(pathname);
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isRateLimitBinding(value: unknown): value is RateLimitBinding {
  return isRecord(value) && typeof value["limit"] === "function";
}

function getRateLimitBinding(
  env: unknown,
  category: "general" | "sensitive",
): RateLimitBinding | undefined {
  if (!isRecord(env)) return undefined;
  const name = category === "sensitive" ? "RATE_LIMIT_SENSITIVE" : "RATE_LIMIT_GENERAL";
  const binding = env[name];
  return isRateLimitBinding(binding) ? binding : undefined;
}

function getRequestEnvironment(request: Request): unknown {
  if (!isRecord(request)) return undefined;
  const runtime = request["runtime"];
  if (!isRecord(runtime)) return undefined;
  const cloudflare = runtime["cloudflare"];
  return isRecord(cloudflare) ? cloudflare["env"] : undefined;
}

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

  const ssrErr = new Error(`h3 swallowed SSR error: ${body}`);
  logger.error(ssrErr);
  captureException(ssrErr, { source: "normalizeCatastrophicSsrResponse" });
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

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);

      const canonicalRedirectUrl = getCanonicalRedirectUrl(request);
      if (canonicalRedirectUrl) {
        return addResponseHeaders(
          new Response(null, {
            status: 308,
            headers: {
              Location: canonicalRedirectUrl,
              "Cache-Control": "public, max-age=86400",
            },
          }),
          request,
        );
      }

      const healthResponse = handleHealthCheck(request);
      if (healthResponse) return addResponseHeaders(healthResponse, request);

      // Determine rate limit category (sensitive for quote/form POSTs or quote path)
      const isSensitive = url.pathname.startsWith("/quote") && request.method !== "GET";
      const category = isSensitive ? "sensitive" : "general";
      const config = RATE_LIMIT_CONFIGS[category];
      const binding =
        getRateLimitBinding(env, category) ??
        getRateLimitBinding(getRequestEnvironment(request), category);

      if (!binding && !import.meta.env.DEV) {
        throw new Error(`Missing Cloudflare rate-limit binding for ${category} requests`);
      }

      const limitResult = binding
        ? await checkRateLimit(binding, getClientIp(request), category)
        : { success: true, limit: config.limit, periodSeconds: config.periodSeconds };

      if (!limitResult.success) {
        return addResponseHeaders(
          createRateLimitResponse(limitResult.limit, limitResult.periodSeconds),
          request,
        );
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);

      const resWithHeaders = addResponseHeaders(
        await normalizeCatastrophicSsrResponse(response),
        request,
      );
      resWithHeaders.headers.set("X-RateLimit-Limit", String(limitResult.limit));
      return resWithHeaders;
    } catch (error) {
      logger.error("[ServerFetchHandler]", error);
      captureException(error, { source: "server_fetch_catch" });
      return addResponseHeaders(
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
        request,
      );
    }
  },
};
