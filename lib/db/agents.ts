import "server-only";

import type { Agent, AgentFormData } from "@/components/agents/types";
import { getDbClient } from "@/lib/db/client";

type AgentRow = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  model: string;
  system_instructions: string;
  tools: string | null;
  updated_at: string;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseTools(rawTools: string | null): string[] {
  if (!rawTools) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawTools);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function toAgent(row: AgentRow): Agent | null {
  if (!isNonEmptyString(row.id) || !isNonEmptyString(row.name) || !isNonEmptyString(row.model)) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    systemPrompt: row.system_instructions ?? "",
    model: row.model,
    tools: parseTools(row.tools),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeFormData(data: AgentFormData): AgentFormData {
  return {
    name: data.name.trim(),
    description: data.description.trim(),
    systemPrompt: data.systemPrompt.trim(),
    model: data.model.trim(),
    tools: Array.from(new Set(data.tools.filter((tool) => tool.trim().length > 0))),
  };
}

export async function listAgentsFromDb(): Promise<Agent[]> {
  const db = getDbClient();

  const result = await db.execute({
    sql: `
      SELECT id, name, description, created_at, model, system_instructions, tools, updated_at
      FROM agents
      ORDER BY datetime(updated_at) DESC, datetime(created_at) DESC;
    `,
  });

  return result.rows
    .map((row) => toAgent(row as unknown as AgentRow))
    .filter((agent): agent is Agent => agent !== null);
}

export async function getAgentByIdFromDb(agentId: string): Promise<Agent | null> {
  const id = agentId.trim();
  if (!id) {
    return null;
  }

  const db = getDbClient();
  const result = await db.execute({
    sql: `
      SELECT id, name, description, created_at, model, system_instructions, tools, updated_at
      FROM agents
      WHERE id = ?
      LIMIT 1;
    `,
    args: [id],
  });

  const row = result.rows[0] as AgentRow | undefined;
  return row ? toAgent(row) : null;
}

export async function createAgentInDb(formData: AgentFormData): Promise<Agent> {
  const normalized = normalizeFormData(formData);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const db = getDbClient();
  await db.execute({
    sql: `
      INSERT INTO agents (id, name, description, created_at, model, system_instructions, tools, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `,
    args: [
      id,
      normalized.name,
      normalized.description,
      now,
      normalized.model,
      normalized.systemPrompt,
      JSON.stringify(normalized.tools),
      now,
    ],
  });

  const created = await getAgentByIdFromDb(id);
  if (!created) {
    throw new Error("Failed to create agent.");
  }

  return created;
}

export async function updateAgentInDb(agentId: string, formData: AgentFormData): Promise<Agent | null> {
  const id = agentId.trim();
  if (!id) {
    return null;
  }

  const normalized = normalizeFormData(formData);
  const now = new Date().toISOString();

  const db = getDbClient();
  await db.execute({
    sql: `
      UPDATE agents
      SET name = ?, description = ?, model = ?, system_instructions = ?, tools = ?, updated_at = ?
      WHERE id = ?;
    `,
    args: [
      normalized.name,
      normalized.description,
      normalized.model,
      normalized.systemPrompt,
      JSON.stringify(normalized.tools),
      now,
      id,
    ],
  });

  return getAgentByIdFromDb(id);
}

export async function deleteAgentInDb(agentId: string): Promise<boolean> {
  const id = agentId.trim();
  if (!id) {
    return false;
  }

  const db = getDbClient();
  const result = await db.execute({
    sql: `DELETE FROM agents WHERE id = ?;`,
    args: [id],
  });

  return Number(result.rowsAffected ?? 0) > 0;
}
