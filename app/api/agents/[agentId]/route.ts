import { NextResponse } from "next/server";

import { deleteAgentInDb, updateAgentInDb } from "@/lib/db/agents";
import { AgentFormSchema } from "@/lib/schemas/agent";

type RouteContext = {
  params: Promise<{ agentId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { agentId } = await context.params;

  const body = await request.json().catch(() => null);
  const parsed = AgentFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const agent = await updateAgentInDb(agentId, parsed.data);
  if (!agent) {
    return NextResponse.json({ error: "Agent not found." }, { status: 404 });
  }

  return NextResponse.json({ agent });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { agentId } = await context.params;
  const deleted = await deleteAgentInDb(agentId);

  if (!deleted) {
    return NextResponse.json({ error: "Agent not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
