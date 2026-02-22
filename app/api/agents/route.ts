import { NextResponse } from "next/server";

import type { AgentFormData } from "@/components/agents/types";
import { DEFAULT_MODEL } from "@/components/agents/constants";
import { createAgentInDb, listAgentsFromDb } from "@/lib/db/agents";

function readPayload(input: unknown): AgentFormData | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const data = input as Partial<AgentFormData>;

  if (typeof data.name !== "string" || typeof data.systemPrompt !== "string") {
    return null;
  }

  return {
    name: data.name,
    description: typeof data.description === "string" ? data.description : "",
    systemPrompt: data.systemPrompt,
    model: typeof data.model === "string" && data.model.trim().length > 0 ? data.model : DEFAULT_MODEL,
    tools: Array.isArray(data.tools) ? data.tools.filter((tool): tool is string => typeof tool === "string") : [],
  };
}

export async function GET() {
  const agents = await listAgentsFromDb();
  return NextResponse.json({ agents });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const payload = readPayload(body);

  if (!payload || payload.name.trim().length === 0 || payload.systemPrompt.trim().length === 0) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const agent = await createAgentInDb(payload);
  return NextResponse.json({ agent }, { status: 201 });
}
