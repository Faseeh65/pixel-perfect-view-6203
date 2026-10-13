import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { initSentry, captureException } from "../lib/sentry";
import { trackPageView } from "../lib/analytics";
import { logger } from "../lib/logger";
import { site } from "@/data/site";
import { TopBar, Navbar, Footer, FloatingActions } from "@/components/site/Layout";
import { ErrorBoundary, DefaultErrorFallback } from "@/components/site/ErrorBoundary";

const siteUrl = site.url.replace(/\/$/, "");

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();

  useEffect(() => {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("[RouterErrorComponent]", err);
    captureException(err, { boundary: "tanstack_root_error_component" });
    reportLovableError(err, { boundary: "tanstack_root_error_component" });
  }, [error]);

  const handleReset = () => {
    router.invalidate();
    reset();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <DefaultErrorFallback
        error={error instanceof Error ? error : new Error(String(error))}
        reset={handleReset}
      />
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: "Printzy" },
      { name: "theme-color", content: "#1F4E5F" },
      { title: "Printzy | Custom Printed Packaging" },
      {
        name: "description",
        content: "Custom printed packaging for brands, food chains and retailers across Pakistan.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "preload",
        as: "font",
        href: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        as: "font",
        href: "https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLCz7Z1xlFQ.woff2",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Poppins:wght@600;700&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${siteUrl}/#organization`,
              name: site.name,
              description: site.about,
              url: siteUrl,
              logo: `${siteUrl}/images/logo.jpeg`,
              email: site.email,
              telephone: site.phoneIntl,
              areaServed: {
                "@type": "Country",
                name: "Pakistan",
              },
              sameAs: [site.social.instagram, site.social.facebook].filter(Boolean),
            },
            {
              "@type": "WebSite",
              "@id": `${siteUrl}/#website`,
              name: site.name,
              url: siteUrl,
              publisher: { "@id": `${siteUrl}/#organization` },
              inLanguage: "en-PK",
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    initSentry();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      trackPageView(window.location.pathname);
    }
  }, [router.state.location.pathname]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-navy focus:text-white focus:px-5 focus:py-3 focus:font-semibold focus:shadow-xl focus:ring-4 focus:ring-teal focus:outline-none"
        >
          Skip to main content
        </a>
        <TopBar />
        <Navbar />
        <div id="main" aria-hidden="true" />
        <main id="main-content" tabIndex={-1} className="outline-none">
          <Outlet />
        </main>
        <Footer />
        <FloatingActions />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
