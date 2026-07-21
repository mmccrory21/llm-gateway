import { NextRequest, NextResponse } from "next/server";
import { routeRequest } from "@/lib/router";
import { appendLog } from "@/lib/store";

export async function POST(req: NextRequest) {
  let body: { prompt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = (body.prompt ?? "").trim();
  if (!prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }
  if (prompt.length > 8000) {
    return NextResponse.json(
      { error: "prompt exceeds 8000 characters" },
      { status: 400 }
    );
  }

  const record = routeRequest(prompt);

  // Simulate the network round trip to the chosen provider so the
  // dashboard's latency numbers feel like a real gateway hop, without
  // actually calling out to OpenAI/Anthropic/Gemini.
  await new Promise((resolve) => setTimeout(resolve, Math.min(record.latencyMs, 2500)));

  appendLog(record);

  return NextResponse.json({ record });
}
