import { INITIAL_AGENTS } from "@/components/agents/constants";
import type { Agent } from "@/components/agents/types";

export function findAgentById(agentId: string): Agent | null {
  if (!agentId || agentId.trim().length === 0) {
    return null;
  }

  const normalizedId = agentId.trim();
  return INITIAL_AGENTS.find((agent) => agent.id === normalizedId) ?? null;
}

export function buildFallbackAgent(agentId: string): Agent {
  return {
    id: agentId,
    name: "Custom Agent",
    description: "Temporary agent configuration until persistence is connected.",
    systemPrompt: "You are a helpful assistant.",
    model: "gpt-4.1-mini",
    createdAt: new Date().toISOString(),
  };
}
