import { NextResponse } from "next/server";
import { computeStats, readLogs } from "@/lib/store";

export async function GET() {
  const logs = readLogs();
  const stats = computeStats(logs);
  // Most recent first for the history table; charts reverse this as needed.
  const ordered = [...logs].reverse();
  return NextResponse.json({ logs: ordered, stats });
}
