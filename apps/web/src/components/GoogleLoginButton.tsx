// src/components/GoogleLoginButton.tsx
"use client";

import { useEffect, useRef } from "react";

const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";           // e.g. https://your-api.onrender.com
// change only if your backend path differs:
const AUTH_PATH = "/auth/google/";
// your Google client id:
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

type GoogleCredentialResponse = { credential?: string };

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize(opts: {
            client_id: string;
            callback: (resp: GoogleCredentialResponse) => void | Promise<void>;
          }): void;
          renderButton(
            parent: HTMLElement,
            options: { theme?: string; size?: string; shape?: string; width?: number }
          ): void;
        };
      };
    };
  }
}

export default function GoogleLoginButton() {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!divRef.current || !GOOGLE_CLIENT_ID) return;

    // inject Google script if not present
    if (!window.google?.accounts?.id) {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.defer = true;
      s.onload = () => init();
      document.head.appendChild(s);
    } else {
      init();
    }

    function init() {
      const g = window.google?.accounts?.id;
      if (!g || !divRef.current) return;

      g.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (resp: GoogleCredentialResponse) => {
          const id_token = resp?.credential;
          if (!id_token) return;

          // Send to your Django endpoint; session cookie will be set on success
          const r = await fetch(`${BASE}${AUTH_PATH}`, {
            method: "POST",
            credentials: "include",                          // <-- important for session cookies
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_token }),
          });

          // If your endpoint redirects instead of JSON, you could just window.location = ...
          if (r.ok) {
            // no JWTs to store; session is in cookie now
            window.location.href = "/dashboard";
          } else {
            const txt = await r.text().catch(() => "Login failed");
            alert(txt || "Login failed");
          }
        },
      });

      g.renderButton(divRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        width: 320,
      });
    }
  }, []);

  return <div ref={divRef} className="flex justify-center" />;
}
