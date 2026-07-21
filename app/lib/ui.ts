import { Provider, Tier } from "@/lib/types";

export const PROVIDER_COLOR: Record<Provider, string> = {
  openai: "#34d399",
  anthropic: "#60a5fa",
  gemini: "#a78bfa",
};

export const PROVIDER_LABEL: Record<Provider, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  gemini: "Gemini",
};

export const TIER_COLOR: Record<Tier, string> = {
  economy: "#4fd1c5",
  standard: "#f5a623",
  frontier: "#f87171",
};

export const TIER_LABEL: Record<Tier, string> = {
  economy: "Economy",
  standard: "Standard",
  frontier: "Frontier",
};

export function formatUsd(value: number, digits = 4): string {
  return `$${value.toFixed(digits)}`;
}

export function formatUsdCompact(value: number): string {
  if (value >= 1) return `$${value.toFixed(2)}`;
  return `$${value.toFixed(4)}`;
}

export function formatMs(value: number): string {
  return `${Math.round(value)}ms`;
}

export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}
