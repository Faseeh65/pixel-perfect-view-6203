# Production deployment and scaling

## Cloudflare Workers (recommended)

This project builds with Nitro's Cloudflare module preset. Cloudflare Workers
provides globally distributed ingress and autoscaling; Smart Placement is enabled
in [`wrangler.jsonc`](../wrangler.jsonc). Deploy from the repository root with:

```sh
npm ci
npm run deploy:cloudflare
```

Authenticate Wrangler first (`npx wrangler login`) and ensure the account selected
by Wrangler is the intended Cloudflare account. The command builds the Worker and
its static assets before deploying them.

The two rate-limit bindings are edge-local approximate limits: 60 general requests
or 5 sensitive requests per client IP per minute, per Cloudflare location. This
avoids process-local counters and works across Worker instances, but is not a
globally exact counter. Replace the sample positive-integer `namespace_id` values
with IDs unique in your Cloudflare account before deployment. The health endpoint
is exempt from limiting.

Hashed Vite files under `/assets/` receive one-year immutable caching. The static
asset `_headers` file applies that policy when Cloudflare serves files without
running the Worker. SSR HTML is returned with `max-age=0`, a 60-second shared-cache
freshness window, and stale-while-revalidate; error and health responses are
`no-store`. If you enable a Cloudflare Cache Rule for SSR HTML, cache only public
pages and include the full query string in the cache key (quote pages use the
`product` query parameter).

`GET /healthz` and `HEAD /healthz` are liveness checks and return no-store
responses. They deliberately do not test Supabase: the app currently has no
runtime database connection. Use the Worker deployment's own health/availability
signals for platform readiness until a database dependency is actually added.

## SEO and canonical host

TanStack Start server-renders each public route, including its route-specific title,
description, canonical URL, Open Graph/Twitter tags, and structured data. Keep
`VITE_SITE_URL` set to the preferred HTTPS origin (currently
`https://printzy.pk`) in each deployment environment. The Worker permanently
redirects the legacy `printzy.site` host, `www` aliases, and HTTP requests on
known Printzy domains to that canonical origin. Update
[`public/sitemap.xml`](../public/sitemap.xml) and
[`public/robots.txt`](../public/robots.txt) whenever public routes change; keep
administrative and private paths disallowed in robots.

## Supabase connection pooling

The repository has a Supabase schema migration but currently does not connect to
Postgres at runtime. Do not add a database driver or connection string to the
browser. When server-side database access is introduced, set a secret such as
`DATABASE_URL` in the deployment platform (not a `VITE_*` variable) to the
project's Supavisor **transaction-mode** connection string. Supabase usually
shows this in **Connect → Connection string → Transaction pooler**; it uses port
`6543` and a project-qualified username. Keep `sslmode=require` and URL-encode
special characters in the password.

Transaction mode is suited to short-lived/serverless requests because the pooler
multiplexes many client connections over fewer Postgres connections. Avoid
session-scoped features and prepared statements unless the chosen driver and
pooler settings explicitly support them. Use Supavisor session mode (typically
port `5432`) only for workloads that need a persistent session; use the direct
database connection for migrations/admin tooling where appropriate, not for
every edge request. Copy the exact host, region, username, and database name from
the Supabase dashboard rather than assuming a pooler hostname.

## Optional VPS or Docker path

[`Dockerfile`](../Dockerfile) builds Nitro with the `node-server` preset and runs
the generated Node server as an unprivileged user on port 3000. Build and run:

```sh
docker build -t printzy .
docker run --rm -p 3000:3000 printzy
```

Put a load balancer or TLS-terminating reverse proxy in front of several app
replicas. [`deploy/nginx.conf`](../deploy/nginx.conf) is a minimal HTTP reverse
proxy example; terminate TLS at Nginx or at the external load balancer, and use a
service-discovery/VIP address for `app:3000` when running multiple replicas.
Stock Nginx resolves the sample upstream at startup, so reload it or use an
orchestrator-provided stable service address when the replica set changes. Configure
the upstream health check to call `GET /healthz`, and make
[`deploy/50x.html`](../deploy/50x.html) available at
`/usr/share/nginx/html/50x.html` in the Nginx container for its 502/503/504 page.

Keep the application stateless between requests. Put shared mutable state in a
managed service (for example Supabase/Postgres or Redis), not in Node process
memory. Configure database pool limits for the total replica count and use the
Supavisor pooler for short-lived database clients. Preserve the one-year immutable
policy only for content-hashed files; keep HTML short-lived and errors uncached.
