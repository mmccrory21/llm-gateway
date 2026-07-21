"use client";

import { RoutingRecord } from "@/lib/types";
import {
  PROVIDER_COLOR,
  TIER_COLOR,
  TIER_LABEL,
  formatUsdCompact,
  formatMs,
  timeAgo,
} from "@/app/lib/ui";

export function HistoryTable({ logs }: { logs: RoutingRecord[] }) {
  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-[#1f2937] bg-[#121822] p-8 text-center text-sm text-[#7c8b9e]">
        No requests yet. Send a prompt above to see it classified and routed
        in real time.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#1f2937] bg-[#121822] overflow-hidden">
      <div className="max-h-[420px] overflow-y-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="sticky top-0 bg-[#121822] border-b border-[#1f2937] text-[11px] uppercase tracking-wider text-[#7c8b9e]">
            <tr>
              <th className="px-3 py-2 font-medium">Prompt</th>
              <th className="px-3 py-2 font-medium">Task</th>
              <th className="px-3 py-2 font-medium">Tier</th>
              <th className="px-3 py-2 font-medium">Routed to</th>
              <th className="px-3 py-2 font-medium text-right">Latency</th>
              <th className="px-3 py-2 font-medium text-right">Cost</th>
              <th className="px-3 py-2 font-medium text-right">Saved</th>
              <th className="px-3 py-2 font-medium text-right">When</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr
                key={l.id}
                className="border-b border-[#171e29] last:border-0 hover:bg-[#0f151d] transition-colors"
              >
                <td className="px-3 py-2 max-w-[240px] truncate text-[#c7d0dc]" title={l.prompt}>
                  {l.prompt}
                </td>
                <td className="px-3 py-2 text-[#7c8b9e] whitespace-nowrap">
                  {l.taskType.replace("_", " ")}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span
                    className="text-[11px] px-1.5 py-0.5 rounded font-medium"
                    style={{
                      color: TIER_COLOR[l.tier],
                      backgroundColor: `${TIER_COLOR[l.tier]}1a`,
                    }}
                  >
                    {TIER_LABEL[l.tier]}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: PROVIDER_COLOR[l.provider] }}
                    />
                    <span className="text-[#c7d0dc]">{l.model}</span>
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-mono mono text-[#7c8b9e]">
                  {formatMs(l.latencyMs)}
                </td>
                <td className="px-3 py-2 text-right font-mono mono text-[#c7d0dc]">
                  {formatUsdCompact(l.cost)}
                </td>
                <td
                  className="px-3 py-2 text-right font-mono mono font-medium"
                  style={{ color: "var(--money)" }}
                >
                  {formatUsdCompact(l.savings)}
                </td>
                <td className="px-3 py-2 text-right text-[#4b5768] whitespace-nowrap">
                  {timeAgo(l.timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
