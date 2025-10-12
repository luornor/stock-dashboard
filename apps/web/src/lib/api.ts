export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";


function authHeaders(): Record<string, string> {
  const access = typeof window !== "undefined" ? localStorage.getItem("access") : null;
  return access ? { Authorization: `Bearer ${access}` } : {};
}


export async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}


export async function apiPost<Body = unknown, Res = unknown>(path: string, body?: Body): Promise<Res> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const auth = authHeaders();
  if (auth.Authorization) {
    headers.Authorization = auth.Authorization;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: typeof body === "undefined" ? undefined : JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as Res | { detail?: string };
  if (!res.ok) {
    const detail = (data as { detail?: string })?.detail;
    throw new Error(detail || "Request failed");
  }
  return data as Res;
}