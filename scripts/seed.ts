import { routeRequest } from "../lib/router";
import { appendLog, clearLogs } from "../lib/store";

const PROMPTS = [
  "What's the capital of Australia?",
  "Is 17 a prime number?",
  "Convert 98.6 Fahrenheit to Celsius.",
  "Classify this review as positive or negative: 'The battery life is amazing but the case feels cheap.'",
  "Summarize this changelog into three bullet points: added dark mode, fixed a memory leak in the sync worker, deprecated the legacy export endpoint.",
  "Write a function in TypeScript that debounces a callback.",
  "This React useEffect runs twice in development, can you explain why and how to fix it if it's actually a bug?",
  "Explain the trade-offs between microservices and a monolith for a 5-person startup, and recommend one.",
  "Compare REST and GraphQL for a mobile app with spotty connectivity.",
  "Write a two-paragraph short story about a robot who is afraid of the dark.",
  "Draft a haiku-style product tagline for a noise-cancelling headphone brand.",
  "Why does my Postgres query get slow after adding an ORDER BY on a non-indexed column?",
  "Extract the named entities from this sentence: 'Maria Gomez met with the Bank of Ireland in Dublin on March 3rd.'",
  "What's 15% of 340?",
  "Design a rate limiter for a public API that needs to support per-user and per-IP limits.",
  "Summarize the plot of a hypothetical heist movie in two sentences.",
  "Is this a valid email address: john..doe@@mail.com",
  "Explain step by step how TCP's three-way handshake works and why it's needed.",
  "Write marketing copy for a productivity app aimed at freelancers.",
  "What year was the first iPhone released?",
];

function jitterTimestamp(index: number, total: number): number {
  // Spread seeded requests across the last ~6 hours so the savings chart
  // shows a believable trend rather than a single instantaneous burst.
  const spanMs = 6 * 60 * 60 * 1000;
  const now = Date.now();
  const offset = ((total - index) / total) * spanMs;
  return now - offset;
}

function seed() {
  clearLogs();
  const total = PROMPTS.length;
  PROMPTS.forEach((prompt, i) => {
    const record = routeRequest(prompt);
    record.timestamp = jitterTimestamp(i, total);
    appendLog(record);
  });
  console.log(`Seeded ${total} demo requests.`);
}

seed();
