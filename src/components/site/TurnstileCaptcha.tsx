import { useEffect, useRef } from "react";
import { getEnvConfig } from "@/lib/env";
import { logger } from "@/lib/logger";

type TurnstileCaptchaProps = {
  onVerify?: (token: string) => void;
  siteKey?: string;
};

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
    };
    onTurnstileLoaded?: () => void;
  }
}

export function TurnstileCaptcha({ onVerify, siteKey }: TurnstileCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      const config = getEnvConfig();
      const activeSiteKey = siteKey || config.turnstileSiteKey;

      if (window.turnstile) {
        window.turnstile.render(containerRef.current, {
          sitekey: activeSiteKey,
          callback: (token: string) => {
            if (onVerify) {
              try {
                onVerify(token);
              } catch (err) {
                logger.error("[Turnstile] onVerify callback failed", err);
              }
            }
          },
        });
        return;
      }

      // Load Turnstile script dynamically if not yet present
      const existingScript = document.getElementById("turnstile-script");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "turnstile-script";
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        script.onload = () => {
          if (window.turnstile && containerRef.current) {
            window.turnstile.render(containerRef.current, {
              sitekey: activeSiteKey,
              callback: (token: string) => {
                if (onVerify) {
                  try {
                    onVerify(token);
                  } catch (err) {
                    logger.error("[Turnstile] onVerify callback failed", err);
                  }
                }
              },
            });
          }
        };
      }
    } catch (err) {
      logger.warn("[Turnstile] Failed to initialize Turnstile widget", err);
    }
  }, [onVerify, siteKey]);

  return (
    <div className="my-3 flex justify-center">
      <div ref={containerRef} className="cf-turnstile" />
    </div>
  );
}
