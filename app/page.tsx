"use client";

import { useCallback, useEffect, useState } from "react";
import { RotateCcw, Zap } from "lucide-react";
import { LogStats, RoutingRecord } from "@/lib/types";
import { StatCard } from "@/app/components/StatCard";
import { PromptForm } from "@/app/components/PromptForm";
import { HistoryTable } from "@/app/components/HistoryTable";
import { DistributionChart } from "@/app/components/DistributionChart";
import { SavingsChart } from "@/app/components/SavingsChart";
import { TierBar } from "@/app/components/TierBar";
import { formatMs, formatPct, formatUsdCompact } from "@/app/lib/ui";

export default function Home() {
  const [logs, setLogs] = useState<RoutingRecord[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [resetting, setResetting] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/logs");
    if (!res.ok) return;
    const body = await res.json();
    setLogs(body.logs);
    setStats(body.stats);
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 4000);
    return () => clearInterval(interval);
  }, [refresh]);

  async function handleReset() {
    if (!confirm("Clear all routing history? This can't be undone.")) return;
    setResetting(true);
    await fetch("/api/logs/reset", { method: "POST" });
    await refresh();
    setResetting(false);
  }

  return (
    <div className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-8 flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{ backgroundColor: "#0f2a26" }}
          >
            <Zap size={16} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <h1 className="text-[15px] font-semibold leading-tight">LLM Gateway</h1>
            <p className="text-[11px] text-[#7c8b9e]">
              Cost-aware routing across OpenAI · Anthropic · Gemini
            </p>
          </div>
        </div>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="flex items-center gap-1.5 text-xs text-[#7c8b9e] hover:text-[#e5e9f0] border border-[#1f2937] rounded-md px-2.5 py-1.5 transition-colors disabled:opacity-40"
        >
          <RotateCcw size={12} />
          Reset demo data
        </button>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total requests"
          value={stats ? stats.totalRequests.toLocaleString() : "—"}
        />
        <StatCard
          label="Total spend"
          value={stats ? formatUsdCompact(stats.totalCost) : "—"}
          sub={stats ? `vs ${formatUsdCompact(stats.totalBaselineCost)} frontier-only` : undefined}
        />
        <StatCard
          label="Saved vs. frontier-only"
          value={stats ? formatUsdCompact(stats.totalSavings) : "—"}
          accent="var(--money)"
          large
          sub={stats ? `${formatPct(stats.savingsPct)} reduction` : undefined}
        />
        <StatCard
          label="Avg latency"
          value={stats ? formatMs(stats.avgLatencyMs) : "—"}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 flex flex-col gap-4">
          <PromptForm onSubmitted={refresh} />
          <HistoryTable logs={logs} />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="rounded-lg border border-[#1f2937] bg-[#121822] p-4">
            <h2 className="text-[13px] font-medium mb-1">Model distribution</h2>
            <p className="text-[11px] text-[#7c8b9e] mb-2">
              Which provider handled each request
            </p>
            {stats && <DistributionChart stats={stats} />}
          </div>
          <div className="rounded-lg border border-[#1f2937] bg-[#121822] p-4">
            <h2 className="text-[13px] font-medium mb-1">Cumulative savings</h2>
            <p className="text-[11px] text-[#7c8b9e] mb-2">
              Actual spend vs. always using a frontier model
            </p>
            <SavingsChart logs={logs} />
          </div>
          <div className="rounded-lg border border-[#1f2937] bg-[#121822] p-4">
            <h2 className="text-[13px] font-medium mb-1">Tier distribution</h2>
            <p className="text-[11px] text-[#7c8b9e] mb-3">
              How the classifier assigned complexity tiers
            </p>
            {stats && <TierBar stats={stats} />}
          </div>
        </div>
      </section>
    </div>
  );
}
