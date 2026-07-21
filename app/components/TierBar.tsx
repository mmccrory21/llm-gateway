"use client";

import { LogStats, Tier } from "@/lib/types";
import { TIER_COLOR, TIER_LABEL } from "@/app/lib/ui";

const ORDER: Tier[] = ["economy", "standard", "frontier"];

export function TierBar({ stats }: { stats: LogStats }) {
  const total = ORDER.reduce((sum, t) => sum + (stats.tierDistribution[t] ?? 0), 0);

  if (total === 0) {
    return <p className="text-sm text-[#7c8b9e]">No routing data yet</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-[#0b0f14]">
        {ORDER.map((tier) => {
          const count = stats.tierDistribution[tier] ?? 0;
          const pct = (count / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={tier}
              style={{ width: `${pct}%`, backgroundColor: TIER_COLOR[tier] }}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-4 text-xs">
        {ORDER.map((tier) => (
          <div key={tier} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-sm"
              style={{ backgroundColor: TIER_COLOR[tier] }}
            />
            <span className="text-[#c7d0dc]">{TIER_LABEL[tier]}</span>
            <span className="text-[#7c8b9e] font-mono mono">
              {stats.tierDistribution[tier] ?? 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
