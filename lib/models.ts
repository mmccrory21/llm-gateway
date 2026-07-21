import { ModelSpec, Provider, Tier } from "./types";

// Approximate relative pricing ($ per 1M tokens) used to model realistic
// cost differences between economy / standard / frontier tiers across
// providers. These are illustrative, not live pricing feeds.
export const CATALOG: ModelSpec[] = [
  // OpenAI
  {
    provider: "openai",
    model: "gpt-5-nano",
    tier: "economy",
    inputPricePerM: 0.05,
    outputPricePerM: 0.4,
    baseLatencyMs: 350,
    latencyJitterMs: 150,
  },
  {
    provider: "openai",
    model: "gpt-5-mini",
    tier: "standard",
    inputPricePerM: 0.25,
    outputPricePerM: 2.0,
    baseLatencyMs: 700,
    latencyJitterMs: 250,
  },
  {
    provider: "openai",
    model: "gpt-5",
    tier: "frontier",
    inputPricePerM: 3.0,
    outputPricePerM: 15.0,
    baseLatencyMs: 1600,
    latencyJitterMs: 500,
  },
  // Anthropic
  {
    provider: "anthropic",
    model: "claude-haiku-4.5",
    tier: "economy",
    inputPricePerM: 0.08,
    outputPricePerM: 0.5,
    baseLatencyMs: 300,
    latencyJitterMs: 120,
  },
  {
    provider: "anthropic",
    model: "claude-sonnet-5",
    tier: "standard",
    inputPricePerM: 0.3,
    outputPricePerM: 2.5,
    baseLatencyMs: 750,
    latencyJitterMs: 250,
  },
  {
    provider: "anthropic",
    model: "claude-opus-4.8",
    tier: "frontier",
    inputPricePerM: 5.0,
    outputPricePerM: 20.0,
    baseLatencyMs: 1900,
    latencyJitterMs: 550,
  },
  // Gemini
  {
    provider: "gemini",
    model: "gemini-2.5-flash-lite",
    tier: "economy",
    inputPricePerM: 0.04,
    outputPricePerM: 0.3,
    baseLatencyMs: 300,
    latencyJitterMs: 130,
  },
  {
    provider: "gemini",
    model: "gemini-2.5-flash",
    tier: "standard",
    inputPricePerM: 0.2,
    outputPricePerM: 1.8,
    baseLatencyMs: 650,
    latencyJitterMs: 220,
  },
  {
    provider: "gemini",
    model: "gemini-2.5-pro",
    tier: "frontier",
    inputPricePerM: 2.5,
    outputPricePerM: 12.0,
    baseLatencyMs: 1500,
    latencyJitterMs: 480,
  },
];

// The "always use a frontier model" baseline this project measures spend
// against. Rotates across providers' frontier models so the baseline isn't
// tied to a single vendor.
export const FRONTIER_MODELS = CATALOG.filter((m) => m.tier === "frontier");

export function getModelsByTier(tier: Tier): ModelSpec[] {
  return CATALOG.filter((m) => m.tier === tier);
}

export function pickFrontierBaseline(seedIndex: number): ModelSpec {
  return FRONTIER_MODELS[seedIndex % FRONTIER_MODELS.length];
}

// Simple round-robin-with-affinity provider selection so that, within a
// tier, load spreads across providers rather than always hitting the same
// vendor. Certain task types have a mild affinity toward a provider, which
// keeps the "model distribution" chart realistic rather than perfectly even.
const providerOrder: Provider[] = ["openai", "anthropic", "gemini"];

export function pickProviderForTier(
  tier: Tier,
  taskAffinity: Provider | null,
  seedIndex: number
): ModelSpec {
  const options = getModelsByTier(tier);
  if (taskAffinity && Math.random() < 0.5) {
    const affinityMatch = options.find((m) => m.provider === taskAffinity);
    if (affinityMatch) return affinityMatch;
  }
  const provider = providerOrder[seedIndex % providerOrder.length];
  return options.find((m) => m.provider === provider) ?? options[0];
}
