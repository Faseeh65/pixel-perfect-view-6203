import { useEffect, useRef } from "react";

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

export function TurnstileCaptcha({ onVerify, siteKey = "1x00000000000000000000AA" }: TurnstileCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Default demo/always-pass Turnstile sitekey or production sitekey from env
    const activeSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? siteKey;

    if (window.turnstile) {
      window.turnstile.render(containerRef.current, {
        sitekey: activeSiteKey,
        callback: (token: string) => {
          if (onVerify) onVerify(token);
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
              if (onVerify) onVerify(token);
            },
          });
        }
      };
    }
  }, [onVerify, siteKey]);

  return (
    <div className="my-3 flex justify-center">
      <div ref={containerRef} className="cf-turnstile" />
    </div>
  );
}
