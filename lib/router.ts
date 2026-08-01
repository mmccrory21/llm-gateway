import { classifyPrompt } from "./classifier";
import { pickFrontierBaseline, pickProviderForTier } from "./models";
import { ModelSpec, Provider, RoutingRecord, TaskType, Tier } from "./types";

// Mild provider affinities so the demo's model-distribution chart reflects
// actual real-world routing (e.g. code tasks leaning toward a provider
// known for coding) rather than being perfectly uniform.
const AFFINITY: Partial<Record<TaskType, Provider>> = {
  code_generation: "openai",
  creative_writing: "anthropic",
  complex_reasoning: "anthropic",
  summarization: "gemini",
  classification: "gemini",
};

function complexityToTier(complexity: number): Tier {
  if (complexity < 0.35) return "economy";
  if (complexity < 0.7) return "standard";
  return "frontier";
}

function computeCost(spec: ModelSpec, inputTokens: number, outputTokens: number): number {
  return (
    (inputTokens / 1_000_000) * spec.inputPricePerM +
    (outputTokens / 1_000_000) * spec.outputPricePerM
  );
}

function simulateLatency(spec: ModelSpec): number {
  return Math.round(spec.baseLatencyMs + Math.random() * spec.latencyJitterMs);
}

let requestCounter = 1;

export function routeRequest(prompt: string): RoutingRecord {
  const classification = classifyPrompt(prompt);
  const tier = complexityToTier(classification.complexity);
  const affinity = AFFINITY[classification.taskType] ?? null;

  const spec = pickProviderForTier(tier, affinity, requestCounter);
  const baselineSpec = pickFrontierBaseline(requestCounter);
  requestCounter++;

  const { estimatedInputTokens, estimatedOutputTokens } = classification;

  const cost = computeCost(spec, estimatedInputTokens, estimatedOutputTokens);
  const baselineCost = computeCost(
    baselineSpec,
    estimatedInputTokens,
    estimatedOutputTokens
  );
  const latencyMs = simulateLatency(spec);

  const record: RoutingRecord = {
    id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    prompt: prompt.slice(0, 280),
    taskType: classification.taskType,
    complexity: classification.complexity,
    tier,
    provider: spec.provider,
    model: spec.model,
    inputTokens: estimatedInputTokens,
    outputTokens: estimatedOutputTokens,
    latencyMs,
    cost,
    baselineProvider: baselineSpec.provider,
    baselineModel: baselineSpec.model,
    baselineCost,
    savings: baselineCost - cost,
  };

  return record;
}
