import { ClassificationResult, TaskType } from "./types";

const CODE_HINTS = [
  "function",
  "class ",
  "import ",
  "def ",
  "```",
  "bug",
  "refactor",
  "regex",
  "api",
  "typescript",
  "python",
  "javascript",
  "sql",
  "compile",
  "stack trace",
  "algorithm",
];

const CREATIVE_HINTS = [
  "story",
  "poem",
  "write a",
  "narrative",
  "character",
  "screenplay",
  "song",
  "metaphor",
  "creative",
  "novel",
  "fiction",
];

const REASONING_HINTS = [
  "why",
  "explain",
  "step by step",
  "analyze",
  "compare",
  "trade-off",
  "tradeoff",
  "prove",
  "reason",
  "strategy",
  "architecture",
  "design a",
  "evaluate",
  "root cause",
];

const SUMMARY_HINTS = [
  "summarize",
  "summarise",
  "tl;dr",
  "key points",
  "shorten",
  "condense",
  "extract the main",
];

const CLASSIFICATION_HINTS = [
  "classify",
  "categorize",
  "label this",
  "is this spam",
  "sentiment",
  "which category",
  "yes or no",
  "true or false",
];

function countHints(text: string, hints: string[]): number {
  let count = 0;
  for (const h of hints) if (text.includes(h)) count++;
  return count;
}

function estimateTokens(text: string): number {
  // Rough heuristic: ~4 characters per token.
  return Math.max(7, Math.round(text.length / 4));
}

export function classifyPrompt(prompt: string): ClassificationResult {
  const text = prompt.toLowerCase();
  const signals: string[] = [];

  const scores: Record<TaskType, number> = {
    simple_qa: 0.15, // small baseline so short factual questions win by default
    classification: countHints(text, CLASSIFICATION_HINTS),
    summarization: countHints(text, SUMMARY_HINTS),
    code_generation: countHints(text, CODE_HINTS),
    creative_writing: countHints(text, CREATIVE_HINTS),
    complex_reasoning: countHints(text, REASONING_HINTS),
  };

  const wordCount = prompt.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount > 120) {
    scores.complex_reasoning += 1;
    signals.push("long prompt");
  }
  if (prompt.includes("?") && wordCount < 20) {
    scores.simple_qa += 1;
    signals.push("short question");
  }

  let bestType: TaskType = "simple_qa";
  let bestScore = -Infinity;
  for (const [type, score] of Object.entries(scores) as [TaskType, number][]) {
    if (score > bestScore) {
      bestScore = score;
      bestType = type;
    }
    if (score > 0) signals.push(`${type} signal (${score.toFixed(1)})`);
  }

  // Complexity score: blends task type baseline difficulty, prompt length,
  // and how many distinct high-signal hints fired.
  const typeBaseComplexity: Record<TaskType, number> = {
    simple_qa: 0.12,
    classification: 0.2,
    summarization: 0.35,
    creative_writing: 0.5,
    code_generation: 0.6,
    complex_reasoning: 0.8,
  };

  const lengthFactor = Math.min(1, wordCount / 250) * 0.3;
  const hintDensity = Math.min(1, bestScore / 4) * 0.2;
  const complexity = Math.min(
    1,
    typeBaseComplexity[bestType] + lengthFactor + hintDensity
  );

  const estimatedInputTokens = estimateTokens(prompt);
  // Output length scales with complexity: reasoning/code/creative tasks
  // produce longer completions than a quick factual answer.
  const outputMultiplier = 0.6 + complexity * 2.2;
  const estimatedOutputTokens = Math.max(
    20,
    Math.round(estimatedInputTokens * outputMultiplier + complexity * 300)
  );

  return {
    taskType: bestType,
    complexity,
    estimatedInputTokens,
    estimatedOutputTokens,
    signals,
  };
}
