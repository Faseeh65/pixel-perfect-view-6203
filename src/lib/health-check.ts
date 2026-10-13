export function handleHealthCheck(request: Request): Response | undefined {
  const url = new URL(request.url);
  if (url.pathname !== "/healthz") return undefined;

  const headers = {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    Allow: "GET, HEAD",
  };

  if (request.method === "GET") {
    return new Response(JSON.stringify({ status: "ok" }), { headers });
  }

  if (request.method === "HEAD") {
    return new Response(null, { headers });
  }

  return new Response("Method Not Allowed", {
    status: 405,
    headers: { ...headers, "Content-Type": "text/plain; charset=utf-8" },
  });
}
