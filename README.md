# LLM Gateway — Cost-Aware Multi-Provider Router

A gateway that classifies incoming prompts by task type and complexity, then
routes each one to the cheapest model tier (across OpenAI, Anthropic, and
Gemini) capable of handling it — instead of always calling a single frontier
model. A Next.js dashboard tracks routing decisions, cost, latency, and
cumulative savings in real time.

## How it works

1. **Classify** (`lib/classifier.ts`) — a heuristic classifier looks at
   keyword signals, prompt length, and structure to infer a task type
   (simple Q&A, classification, summarization, code generation, creative
   writing, complex reasoning) and a complexity score from 0–1.
2. **Route** (`lib/router.ts` + `lib/models.ts`) — complexity maps to a tier
   (economy / standard / frontier). Within a tier, a provider is chosen with
   mild task-based affinities (e.g. code leans OpenAI, long-form reasoning
   leans Anthropic) so routing looks realistic rather than perfectly uniform.
3. **Cost & latency simulation** — each of the 9 catalog models (3 providers
   × 3 tiers) has relative per-token pricing and a latency profile. The
   gateway estimates input/output tokens from the prompt, computes the cost
   at the chosen tier, and compares it against a baseline cost of always
   using a frontier model — that delta is the "savings" tracked everywhere.
4. **Log & persist** (`lib/store.ts`) — every routed request is appended to
   a JSON file (`data/logs.json`). The dashboard polls `/api/logs` for the
   full history plus aggregate stats (total spend, total saved, savings %,
   avg latency, model/tier distribution).

## Why simulated calls, not real API calls

This is set up as a working prototype: it exercises the full classification
-> routing -> cost accounting -> dashboard pipeline without needing live
OpenAI/Anthropic/Gemini keys. The architecture is deliberately structured so
swapping in real calls is a contained change — see "Going live" below.

## Why JSON-file storage instead of SQLite

`better-sqlite3` requires compiling a native addon against Node headers,
which needs network access to `nodejs.org` — not available in the sandbox
this was built in. `lib/store.ts` uses a small JSON-file-backed store
instead. It's a drop-in interface (`readLogs`, `appendLog`, `clearLogs`,
`computeStats`) — swapping it for SQLite, Postgres, or any other backend
only touches that one file.

## Project structure

```
lib/
  types.ts       Shared types (ModelSpec, RoutingRecord, LogStats, etc.)
  classifier.ts  Heuristic task classification
  models.ts      Model catalog: pricing + latency per provider/tier
  router.ts      Classification -> tier -> provider -> cost/savings
  store.ts       JSON-file persistence + stats aggregation
app/
  api/gateway/route.ts     POST: classify, route, log, return decision
  api/logs/route.ts        GET: full history + aggregate stats
  api/logs/reset/route.ts  POST: clear demo data
  page.tsx                 Dashboard
  components/              StatCard, PromptForm, HistoryTable,
                            DistributionChart, SavingsChart, TierBar
scripts/seed.ts             Seeds ~20 demo requests spread over 6 hours
```

## Running it

```bash
npm install
npm run seed   # populate demo data (optional but recommended for a first look)
npm run dev
```

Open http://localhost:3000. Use the sample prompt buttons or type your own —
watch it get classified, routed, and logged, and the dashboard update live.

## Going live with real provider APIs

To replace simulation with real calls:

1. In `lib/router.ts`, after selecting `spec`, call the real provider SDK
   (OpenAI, Anthropic, or Google's Gemini SDK) instead of estimating tokens
   — most SDKs return actual `usage.input_tokens` / `usage.output_tokens` in
   the response, which you'd use in place of
   `classification.estimatedInputTokens` / `estimatedOutputTokens`.
2. Store provider API keys as environment variables (`OPENAI_API_KEY`,
   `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`) and read them in a new
   `lib/providers/*.ts` module per vendor.
3. Latency becomes the real round-trip time instead of the simulated
   `baseLatencyMs + jitter`.
4. Everything downstream (logging, stats, dashboard) needs no changes — the
   `RoutingRecord` shape stays the same.

## Notes on the classifier

It's intentionally simple (keyword + length heuristics) rather than a
trained model or embedding-based classifier — this keeps the project
runnable with zero external dependencies and makes the routing logic easy
to explain and audit. A natural next step (worth mentioning if this comes
up in an interview) would be swapping in a small embedding-similarity
classifier or a cheap LLM call itself as the classifier, trading a small
fixed cost for more accurate routing.
