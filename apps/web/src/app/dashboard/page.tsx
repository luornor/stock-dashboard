"use client";

import { useEffect, useState } from "react";
import TickerCard from "@/components/TickerCard";
import SiteHeader from "@/components/SiteHeader";
import Protected from "@/components/Protected";

type User = {
  first_name?: string;
  [key: string]: unknown;
};

type Card = {
  symbol: string;
  price: number;
  changePct: number;
  spark: { x: number; y: number }[];

};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  useEffect(() => {
    // demo data + fetch historical for first symbol
    const symbols = ["AAPL", "MSFT", "GOOGL", "AMZN"]; // later from your watchlist
    setCards(
      symbols.map((s) => ({ symbol: s, price: 0, changePct: 0, spark: [] }))
    );
    // Optionally fetch historical for sparkline here using your /quotes/historical endpoint.
  }, []);

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