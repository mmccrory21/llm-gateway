import { NextResponse } from "next/server";
import { clearLogs } from "@/lib/store";

export async function POST() {
  clearLogs();
  return NextResponse.json({ ok: true });
}
