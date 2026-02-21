import type { Agent } from "@/components/agents/types";

export const DEFAULT_MODEL = "gpt-4.1-mini";

export const INITIAL_AGENTS: Agent[] = [
  {
    id: "agent-001",
    name: "Support Concierge",
    description: "Answers product setup and troubleshooting questions.",
    systemPrompt: "You are a helpful support assistant. Prioritize actionable troubleshooting steps.",
    model: "gpt-4.1-mini",
    createdAt: "2026-02-20T17:00:00.000Z",
  },
  {
    id: "agent-002",
    name: "Sales Coach",
    description: "Drafts personalized outbound sequences for prospects.",
    systemPrompt: "You are a sales enablement assistant. Keep responses concise and persuasive.",
    model: "gpt-4.1",
    createdAt: "2026-02-21T13:15:00.000Z",
  },
];
