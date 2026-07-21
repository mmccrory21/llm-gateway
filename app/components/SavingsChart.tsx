"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { RoutingRecord } from "@/lib/types";

export function SavingsChart({ logs }: { logs: RoutingRecord[] }) {
  // logs arrive most-recent-first; chart needs chronological order
  const chronological = [...logs].reverse();
  let cumulative = 0;
  let cumulativeCost = 0;
  const data = chronological.map((l, i) => {
    cumulative += l.savings;
    cumulativeCost += l.cost;
    return {
      i: i + 1,
      savings: Number(cumulative.toFixed(4)),
      cost: Number(cumulativeCost.toFixed(4)),
    };
  });

  if (data.length < 2) {
    return (
      <div className="h-[220px] flex items-center justify-center text-sm text-[#7c8b9e]">
        Send a few more prompts to see the savings trend
      </div>
    );
  }

  return (
    <div className="h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f5a623" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#f5a623" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1f2937" vertical={false} />
          <XAxis
            dataKey="i"
            tick={{ fill: "#7c8b9e", fontSize: 11 }}
            axisLine={{ stroke: "#1f2937" }}
            tickLine={false}
            label={{
              value: "requests",
              position: "insideBottom",
              offset: -2,
              fill: "#4b5768",
              fontSize: 10,
            }}
          />
          <YAxis
            tick={{ fill: "#7c8b9e", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={60}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              background: "#0b0f14",
              border: "1px solid #1f2937",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelFormatter={(v) => `Request #${v}`}
            formatter={(value, name) => [
              `$${Number(value).toFixed(4)}`,
              name === "savings" ? "Cumulative saved" : "Cumulative spend",
            ]}
          />
          <Area
            type="monotone"
            dataKey="savings"
            stroke="#f5a623"
            strokeWidth={2}
            fill="url(#savingsFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
