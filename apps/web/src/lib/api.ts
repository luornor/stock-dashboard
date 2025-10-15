export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";

import { getAccess, getRefresh, setTokens} from "./auth";

async function refreshAccess(): Promise<string | null> {
  const refresh = getRefresh();
  if (!refresh) return null;
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data?.access) {
    setTokens(data.access); // keep existing refresh
    return data.access as string;
  }
  return null;
}

function authHeaders(token?: string | null): Record<string, string> {
  const t = token ?? getAccess();
  return t ? { Authorization: `Bearer ${t}` } : ({} as Record<string, string>);
}

export async function apiGet(path: string) {
  // try with current token
  const token = getAccess();
  let res = await fetch(`${API_BASE}${path}`, { headers: { ...authHeaders(token) } });
  if (res.status === 401) {
    // try refresh once
    const newToken = await refreshAccess();
    if (newToken) {
      res = await fetch(`${API_BASE}${path}`, { headers: { ...authHeaders(newToken) } });
    }
  }
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPost(path: string, body: unknown) {
  const token = getAccess();
  let res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(body),
  });
  if (res.status === 401) {
    const newToken = await refreshAccess();
    if (newToken) {
      res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(newToken) },
        body: JSON.stringify(body),
      });
    }
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || "Request failed");
  return data;
}
