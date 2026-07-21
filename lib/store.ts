import fs from "fs";
import path from "path";
import { LogStats, RoutingRecord, Tier } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "logs.json");
const MAX_RECORDS = 500;

function ensureStore(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf-8");
}

export function readLogs(): RoutingRecord[] {
  ensureStore();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw) as RoutingRecord[];
  } catch {
    return [];
  }
}

export function appendLog(record: RoutingRecord): RoutingRecord[] {
  ensureStore();
  const logs = readLogs();
  logs.push(record);
  // Keep the file bounded so the dashboard stays fast in a long demo session.
  const trimmed = logs.slice(-MAX_RECORDS);
  fs.writeFileSync(DATA_FILE, JSON.stringify(trimmed, null, 2), "utf-8");
  return trimmed;
}

export function clearLogs(): void {
  ensureStore();
  fs.writeFileSync(DATA_FILE, "[]", "utf-8");
}

export function computeStats(logs: RoutingRecord[]): LogStats {
  const totalRequests = logs.length;
  const totalCost = logs.reduce((sum, l) => sum + l.cost, 0);
  const totalBaselineCost = logs.reduce((sum, l) => sum + l.baselineCost, 0);
  const totalSavings = totalBaselineCost - totalCost;
  const savingsPct = totalBaselineCost > 0 ? (totalSavings / totalBaselineCost) * 100 : 0;
  const avgLatencyMs =
    totalRequests > 0
      ? logs.reduce((sum, l) => sum + l.latencyMs, 0) / totalRequests
      : 0;

  const distribution: Record<string, number> = {};
  const tierDistribution: Record<Tier, number> = {
    economy: 0,
    standard: 0,
    frontier: 0,
  };

  for (const l of logs) {
    const key = `${l.provider}:${l.model}`;
    distribution[key] = (distribution[key] ?? 0) + 1;
    tierDistribution[l.tier] = (tierDistribution[l.tier] ?? 0) + 1;
  }

  return {
    totalRequests,
    totalCost,
    totalBaselineCost,
    totalSavings,
    savingsPct,
    avgLatencyMs,
    distribution,
    tierDistribution,
  };
}
