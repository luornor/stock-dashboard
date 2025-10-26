// api.ts — session/cookie version
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

function toUrl(path: string) {
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

async function handle(res: Response) {
  const text = await res.text();
  let data: unknown;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    // Safely derive an error message from the parsed response
    let message = res.statusText;
    if (typeof data === "object" && data !== null) {
      const obj = data as Record<string, unknown>;
      if (typeof obj.detail === "string") message = obj.detail;
      else if (typeof obj.message === "string") message = obj.message;
    } else if (typeof data === "string") {
      message = data;
    }
    throw new Error(message);
  }
  return data;
}

export async function apiGet(path: string) {
  const res = await fetch(toUrl(path), {
    method: "GET",
    credentials: "include",     // <-- important
  });
  return handle(res);
}

export async function apiPost(path: string, body: unknown) {
  const res = await fetch(toUrl(path), {
    method: "POST",
    credentials: "include",     // <-- important
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handle(res);
}
