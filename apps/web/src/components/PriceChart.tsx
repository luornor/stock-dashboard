"use client";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

export default function PriceChart({ data }: { data: Array<{ ts: string; close: number }> }) {
    return (
        <div className="card p-4">
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopOpacity={0.35} />
                                <stop offset="95%" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="ts" hide tick={false} />
                        <YAxis hide tick={false} domain={["auto", "auto"]} />
                        <Tooltip formatter={(v) => Number(v).toFixed(2)} labelFormatter={() => ""} />
                        <Area type="monotone" dataKey="close" strokeWidth={2} fillOpacity={1} fill="url(#g)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
