# AGENTS

## Project Context
This `webapp/` project is an agent builder + chat UI.

## Tech Stack
- Next.js + React + TypeScript
- shadcn/ui + Tailwind CSS
- Vercel AI SDK + Anthropic models
- Turso/libSQL for agent persistence
- Braintrust for tracing/observability
- Zod for validation

## Non-Obvious File Map
- `tools/`: custom AI tool definitions available to configured agents.
- `lib/db/`: Turso env/client + DB access layer for agents.
- `lib/observability/braintrust-ai.ts`: Braintrust setup + traced AI SDK wrapper.
- `lib/schemas/`: request schemas shared by API routes.
- `components/agents/constants.ts`: canonical model/tool options for agent config.
- `proxy.ts`: auth protection middleware-like gate.
- `app/api/chat/route.ts`: main chat execution path (agent config + tools + streaming + tracing).

## Coding Guidelines (Required)
- You must write clean, high quality code.
- Break code down into smaller modules for maintainability and organization.
- Avoid excessive comments. Comments should only be used to add additional context. But the code should be clear enough to understand.
- Avoid hacky work arounds or convoluted logic. Keep things simple.
- Avoid excessive tailwinds styling or customization outside of components. We are using shadcn here so use default components as much as possible with minimal styling changes as needed. Import components from Shadcn if they're currently not in the repo.
- Overall, adhere to good programming standards.
