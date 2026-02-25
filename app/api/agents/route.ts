import { NextResponse } from "next/server";

import { createAgentInDb, listAgentsFromDb } from "@/lib/db/agents";
import { AgentFormSchema } from "@/lib/schemas/agent";

export async function GET() {
  const agents = await listAgentsFromDb();
  return NextResponse.json(
    { agents },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    },
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = AgentFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const agent = await createAgentInDb(parsed.data);
  return NextResponse.json({ agent }, { status: 201 });
}
