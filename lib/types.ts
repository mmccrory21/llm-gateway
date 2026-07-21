export type Provider = "openai" | "anthropic" | "gemini";

export type Tier = "economy" | "standard" | "frontier";

export type TaskType =
  | "simple_qa"
  | "classification"
  | "summarization"
  | "code_generation"
  | "creative_writing"
  | "complex_reasoning";

export interface ModelSpec {
  provider: Provider;
  model: string;
  tier: Tier;
  inputPricePerM: number; // $ per 1M input tokens
  outputPricePerM: number; // $ per 1M output tokens
  baseLatencyMs: number;
  latencyJitterMs: number;
}

export interface ClassificationResult {
  taskType: TaskType;
  complexity: number; // 0..1
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  signals: string[];
}

export interface RoutingRecord {
  id: string;
  timestamp: number;
  prompt: string;
  taskType: TaskType;
  complexity: number;
  tier: Tier;
  provider: Provider;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  cost: number;
  baselineProvider: Provider;
  baselineModel: string;
  baselineCost: number;
  savings: number;
}

export interface LogStats {
  totalRequests: number;
  totalCost: number;
  totalBaselineCost: number;
  totalSavings: number;
  savingsPct: number;
  avgLatencyMs: number;
  distribution: Record<string, number>; // "provider:model" -> count
  tierDistribution: Record<Tier, number>;
}
