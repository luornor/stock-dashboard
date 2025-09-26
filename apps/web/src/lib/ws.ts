const WS_BASE = process.env.NEXT_PUBLIC_WS_BASE || "ws://localhost:8000/ws";


export function connectQuotesWS(userId: number) {
const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
const url = `${WS_BASE}/quotes/${userId}/?token=${token}`;
const ws = new WebSocket(url);
return ws;
}