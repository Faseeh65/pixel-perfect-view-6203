/**
 * Production-grade Global React Error Boundary with a friendly fallback UI.
 * Catches unhandled runtime render crashes, logs to Sentry & telemetry, and provides recovery actions.
 */

import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { MessageCircle, RefreshCw, Home, AlertCircle } from "lucide-react";
import { site } from "@/data/site";
import { captureException } from "@/lib/sentry";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import { trackErrorOccurred } from "@/lib/analytics";
import { getEnvConfig } from "@/lib/env";
import { logger } from "@/lib/logger";

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((props: { error: Error; reset: () => void }) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error("[ErrorBoundary] Caught unhandled rendering error:", error);

    // 1. Report to Sentry
    captureException(error, {
      boundary: "global_react_error_boundary",
      componentStack: errorInfo.componentStack,
    });

    // 2. Report to Lovable telemetry
    reportLovableError(error, {
      boundary: "global_react_error_boundary",
    });

    // 3. Track error occurrence in analytics
    trackErrorOccurred("REACT_RENDER_CRASH", "error_boundary");

    // 4. Custom callback if provided
    this.props.onError?.(error, errorInfo);
  }

  reset = (): void => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  override render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (typeof this.props.fallback === "function") {
        return this.props.fallback({ error: this.state.error, reset: this.reset });
      }
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

export function DefaultErrorFallback({
  error,
  reset,
}: {
  error?: Error | null;
  reset?: () => void;
}) {
  const config = getEnvConfig();

  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div
      role="alert"
      className="flex min-h-[70vh] w-full items-center justify-center bg-background px-4 py-12"
    >
      <div className="w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 text-center shadow-soft sm:p-10">
        <div className="mx-auto mb-5 inline-flex size-14 items-center justify-center rounded-full bg-peach/20 text-peach">
          <AlertCircle className="size-8 text-secondary" aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Something didn't load right
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          We encountered an unexpected issue while loading this page. Our engineering team has been
          notified automatically.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {reset && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Try again
            </button>
          )}

          <button
            type="button"
            onClick={handleReload}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Reload page
          </button>

          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Home className="size-4" aria-hidden="true" />
            Home
          </a>
        </div>

        {/* Quick Assistance via WhatsApp */}
        <div className="mt-6 border-t border-border/60 pt-6">
          <p className="text-xs text-muted-foreground">Need urgent packaging assistance?</p>
          <a
            href={site.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:underline"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            Chat with us on WhatsApp ({site.phoneDisplay})
          </a>
        </div>

        {/* Developer Diagnostics - Strictly hidden in production/staging */}
        {config.enableDevErrorDetails && error && (
          <details className="mt-6 rounded-lg border border-border/70 bg-muted/40 p-3 text-left text-xs">
            <summary className="cursor-pointer font-mono font-medium text-muted-foreground hover:text-foreground">
              Developer Diagnostics (Development Only)
            </summary>
            <div className="mt-2 font-mono text-[11px] text-destructive">
              <p className="font-semibold">
                {error.name}: {error.message}
              </p>
              {error.stack && (
                <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-card p-2 text-[10px] text-foreground">
                  {error.stack}
                </pre>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
