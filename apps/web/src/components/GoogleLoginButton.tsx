// src/components/GoogleLoginButton.tsx
"use client";

import { useEffect, useRef } from "react";
import { API_BASE } from "@/lib/api";

export default function GoogleLoginButton() {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const g = (window as any)?.google?.accounts?.id;
    if (!g || !divRef.current || !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return;

    g.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: async (resp: any) => {
        const id_token = resp?.credential;
        if (!id_token) return;

        // IMPORTANT: absolute API base + trailing slash
        const r = await fetch(`${API_BASE}/auth/google/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_token }),
        });

        const data = await r.json().catch(() => ({}));
        if (r.ok) {
          localStorage.setItem("access", data.access);
          localStorage.setItem("refresh", data.refresh);
          localStorage.setItem("user", JSON.stringify(data.user));
          window.location.href = "/dashboard";
        } else {
          alert(data?.detail || "Login failed");
        }
      },
    });

    g.renderButton(divRef.current, { theme: "outline", size: "large", shape: "pill", width: 320 });
  }, []);

  return <div ref={divRef} className="flex justify-center" />;
}
