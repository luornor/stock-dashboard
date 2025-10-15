"use client";

import { useEffect, useState } from "react";
import TickerCard from "@/components/TickerCard";
import SiteHeader from "@/components/SiteHeader";
import Protected from "@/components/Protected";
import { apiGet } from "@/lib/api";
import { connectQuotesWS } from "@/lib/ws";
import { useQuotes } from "@/lib/quotes";

type User = { id: number; first_name?: string };
type Card = { symbol: string; price: number; changePct: number; spark: { x: number; y: number }[] };

const SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN"]; // swap with your watchlist later

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const { setQuote } = useQuotes();

  // load user
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  // fetch historical for sparklines + seed cards
  useEffect(() => {
    (async () => {
      const seeded: Card[] = [];
      for (const s of SYMBOLS) {
        try {
          // typed historical row to avoid `any`
          type HistoricalRow = { close: string | number };
          const rows = (await apiGet(`/quotes/historical/?symbol=${s}`)) as HistoricalRow[];
          // map to sparkline
          console.log(rows); // Check what is returned

          const spark = rows.slice(-40).map((r: HistoricalRow, i: number) => ({
            x: i,
            y: Number(r.close),
          }));
          // change % vs previous close (fallback 0)
          const last = rows.at(-1);
          const prev = rows.at(-2);
          const lastClose = last ? Number(last.close) : 0;
          const prevClose = prev ? Number(prev.close) : lastClose;
          const changePct = prevClose ? ((lastClose - prevClose) / prevClose) * 100 : 0;

          seeded.push({ symbol: s, price: lastClose, changePct, spark });
        } catch {
          seeded.push({ symbol: s, price: 0, changePct: 0, spark: [] });
        }
      }
      setCards(seeded);
    })();
  }, []);

  // live quotes via WS → update state
  useEffect(() => {
    if (!user?.id) return;
    const ws = connectQuotesWS(user.id);
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        // expected: { symbol, price, ts, pct_change, dayHigh, dayLow }
        if (msg?.symbol && typeof msg.price === "number") {
          setQuote(msg.symbol, { price: msg.price, ts: msg.ts });
          // also update the matching card’s price (local visual update)
          setCards((prev) =>
            prev.map((c) =>
              c.symbol === msg.symbol ? { ...c, price: msg.price } : c
            )
          );
        }
      } catch {}
    };
    ws.onerror = () => ws.close();
    return () => ws.close();
  }, [user?.id, setQuote]);

  return (
    <Protected>
      <SiteHeader />
      <main className="p-6 max-w-7xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="text-sm opacity-80">
            Welcome{user?.first_name ? `, ${user.first_name}` : ""}
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <TickerCard key={c.symbol} {...c} />
          ))}
        </div>
      </main>
    </Protected>
  );
}
