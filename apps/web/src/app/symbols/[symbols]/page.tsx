"use client";
import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import PriceChart from "@/components/PriceChart";
import { apiGet } from "@/lib/api";
import SiteHeader from "@/components/SiteHeader";

type PageProps = { params?: { symbols?: string } };

export default function Page(props: PageProps) {
  const symbols = String(props?.params?.symbols ?? "");
  const [data, setData] = useState<Array<{ ts: string; close: number }>>([]);

  useEffect(() => {
    if (!symbols) return;
    (async () => {
      try {
        const rows = await apiGet(`/quotes/historical?symbol=${symbols}`);
        const typedRows = rows as Array<{ ts: string; close: string | number }>;
        setData(typedRows.map((r) => ({ ts: r.ts, close: Number(r.close) })));
      } catch (e) {
        console.error(e);
      }
    })();
  }, [symbols]);

  return (
    <Protected>
      <SiteHeader />
      <main className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">{symbols}</h1>
        <PriceChart data={data} />
      </main>
    </Protected>
  );
}
