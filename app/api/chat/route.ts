import { anthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai";
import { NextResponse } from "next/server";
import { getAgentByIdFromDb } from "@/lib/db/agents";
import { codeExecutionTool } from "@/tools/code-execution";

type ChatRequestBody = {
  agentId?: string;
  messages?: UIMessage[];
};

type ParsedChatRequestBody = {
  agentId: string;
  messages: UIMessage[];
};

function readBody(input: unknown): ParsedChatRequestBody | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const data = input as ChatRequestBody;

  if (!Array.isArray(data.messages) || typeof data.agentId !== "string") {
    return null;
  }

  if (data.agentId.trim().length === 0) {
    return null;
  }

  return {
    agentId: data.agentId.trim(),
    messages: data.messages,
  };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = readBody(body);

  if (!parsed) {
    return NextResponse.json({ error: "Invalid chat payload." }, { status: 400 });
  }

  const agent = await getAgentByIdFromDb(parsed.agentId);
  if (!agent) {
    return NextResponse.json({ error: "Agent not found." }, { status: 404 });
  }

  const tools = agent.tools.includes("code_execution")
    ? {
        code_execution: codeExecutionTool,
      }
    : undefined;

  const result = streamText({
    model: anthropic(agent.model),
    system: agent.systemPrompt,
    tools,
    stopWhen: stepCountIs(5),
    messages: await convertToModelMessages(parsed.messages ?? []),
  });

  return result.toUIMessageStreamResponse();
}
