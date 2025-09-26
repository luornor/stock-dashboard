"use client";
import { useEffect, useRef } from "react";


export default function GoogleLoginButton() {
const divRef = useRef<HTMLDivElement>(null);
useEffect(() => {
// @ts-ignore
if (window.google && divRef.current && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
// @ts-ignore
google.accounts.id.initialize({
client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
callback: async (resp: any) => {
const id_token = resp?.credential;
if (!id_token) return;
const r = await fetch(`/api/auth/google`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ id_token }),
});
const data = await r.json();
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
// @ts-ignore
google.accounts.id.renderButton(divRef.current, { theme: "outline", size: "large", shape: "pill", width: 320 });
}
}, []);
return <div ref={divRef} className="flex justify-center" />;
}