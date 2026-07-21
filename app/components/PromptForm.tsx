"use client";

import { useState } from "react";
import { Send, Sparkles } from "lucide-react";

const SAMPLES = [
  { label: "Simple Q&A", text: "What year did the Berlin Wall fall?" },
  {
    label: "Code fix",
    text: "This Python function throws an IndexError on empty lists, can you fix it and explain the bug?\n\ndef last_item(items):\n    return items[len(items)]",
  },
  {
    label: "Reasoning",
    text: "Compare the trade-offs between eventual consistency and strong consistency for a distributed shopping cart service, and recommend one with justification.",
  },
  {
    label: "Creative",
    text: "Write a short story about a lighthouse keeper who discovers the sea has started sending letters.",
  },
  {
    label: "Summarize",
    text: "Summarize the key points of this quarterly report: revenue grew 12% YoY driven by enterprise renewals, churn increased slightly in SMB, and gross margin held steady at 71% despite higher cloud infra costs.",
  },
];

export function PromptForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(text: string) {
    const value = text.trim();
    if (!value || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/gateway", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: value }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Request failed");
      }
      setPrompt("");
      onSubmitted();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-[#1f2937] bg-[#121822] p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-[13px] font-medium text-[#e5e9f0]">
        <Sparkles size={14} className="text-accent" style={{ color: "var(--accent)" }} />
        Send a prompt through the gateway
      </div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Type a prompt — the classifier will route it to the cheapest model that can handle the task…"
        rows={4}
        className="w-full resize-none rounded-md bg-[#0b0f14] border border-[#1f2937] px-3 py-2 text-sm text-[#e5e9f0] placeholder:text-[#4b5768] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] font-sans"
      />
      <div className="flex flex-wrap items-center gap-2">
        {SAMPLES.map((s) => (
          <button
            key={s.label}
            onClick={() => submit(s.text)}
            disabled={loading}
            className="text-[11px] px-2.5 py-1 rounded-full border border-[#1f2937] text-[#7c8b9e] hover:text-[#e5e9f0] hover:border-[#334155] transition-colors disabled:opacity-40"
          >
            {s.label}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={() => submit(prompt)}
          disabled={loading || !prompt.trim()}
          className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-1.5 rounded-md bg-[var(--accent)] text-[#06201d] disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition"
        >
          {loading ? "Routing…" : "Route"}
          <Send size={13} />
        </button>
      </div>
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}
