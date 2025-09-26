"use client";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";


export type TickerCardProps = {
symbol: string;
price: number;
changePct: number; // e.g. +0.84
spark: Array<{ x: number; y: number }>;
};


export default function TickerCard({ symbol, price, changePct, spark }: TickerCardProps) {
const up = changePct >= 0;
return (
<div className="card p-5 hover:shadow-lg transition-shadow">
<div className="flex items-baseline justify-between">
<div className="text-lg font-semibold tracking-wide">{symbol}</div>
<div className={`flex items-center gap-1 text-sm ${up ? "text-emerald-600" : "text-red-600"}`}>
{up ? <ArrowUpRight className="h-4 w-4"/> : <ArrowDownRight className="h-4 w-4"/>}
{changePct.toFixed(2)}%
</div>
</div>
<div className="mt-1 text-2xl font-bold">{price.toFixed(2)}</div>
<div className="h-16 mt-2">
<ResponsiveContainer width="100%" height="100%">
<LineChart data={spark} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
<Line type="monotone" dataKey="y" dot={false} strokeWidth={2} />
</LineChart>
</ResponsiveContainer>
</div>
</div>
);
}