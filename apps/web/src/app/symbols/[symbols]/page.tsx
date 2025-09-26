"use client";
import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import PriceChart from "@/components/PriceChart";
import { apiGet } from "@/lib/api";
import SiteHeader from "@/components/SiteHeader";


export default function SymbolPage({ params }: { params: { symbol: string } }) {
const { symbol } = params;
const [data, setData] = useState<Array<{ ts: string; close: number }>>([]);


useEffect(() => {
(async () => {
try {
const rows = await apiGet(`/quotes/historical?symbol=${symbol}`);
setData(rows.map((r: any) => ({ ts: r.ts, close: Number(r.close) })));
} catch (e) {
console.error(e);
}
})();
}, [symbol]);


return (
<Protected>
<SiteHeader />
<main className="p-6 max-w-5xl mx-auto">
<h1 className="text-2xl font-semibold mb-4">{symbol}</h1>
<PriceChart data={data} />
</main>
</Protected>
);
}