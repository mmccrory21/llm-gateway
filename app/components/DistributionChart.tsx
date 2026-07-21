"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { LogStats, Provider } from "@/lib/types";
import { PROVIDER_COLOR, PROVIDER_LABEL } from "@/app/lib/ui";

export function DistributionChart({ stats }: { stats: LogStats }) {
  const providerTotals: Record<Provider, number> = {
    openai: 0,
    anthropic: 0,
    gemini: 0,
  };
  for (const [key, count] of Object.entries(stats.distribution)) {
    const provider = key.split(":")[0] as Provider;
    providerTotals[provider] = (providerTotals[provider] ?? 0) + count;
  }

  const data = (Object.entries(providerTotals) as [Provider, number][])
    .filter(([, count]) => count > 0)
    .map(([provider, count]) => ({
      name: PROVIDER_LABEL[provider],
      value: count,
      color: PROVIDER_COLOR[provider],
    }));

  if (data.length === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center text-sm text-[#7c8b9e]">
        No routing data yet
      </div>
    );
  }

  return (
    <div className="h-[220px] flex items-center">
      <ResponsiveContainer width="60%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            strokeWidth={0}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#0b0f14",
              border: "1px solid #1f2937",
              borderRadius: 8,
              fontSize: 12,
            }}
            itemStyle={{ color: "#e5e9f0" }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-2 pl-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-[#c7d0dc]">{d.name}</span>
            <span className="text-[#7c8b9e] font-mono mono">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
