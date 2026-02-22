import { anthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, stepCountIs, streamText } from "ai";
import { NextResponse } from "next/server";

import { getAgentByIdFromDb } from "@/lib/db/agents";
import { ChatRequestSchema } from "@/lib/schemas/chat";
import { codeExecutionTool } from "@/tools/code-execution";
import { tavilyExtractTool } from "@/tools/tavily-extract";
import { tavilySearchTool } from "@/tools/tavily-search";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = ChatRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid chat payload." }, { status: 400 });
  }

  const agent = await getAgentByIdFromDb(parsed.data.agentId);
  if (!agent) {
    return NextResponse.json({ error: "Agent not found." }, { status: 404 });
  }

  const tools = {
    ...(agent.tools.includes("code_execution") ? { code_execution: codeExecutionTool } : {}),
    ...(agent.tools.includes("tavily_search") ? { tavily_search: tavilySearchTool } : {}),
    ...(agent.tools.includes("tavily_extract") ? { tavily_extract: tavilyExtractTool } : {}),
  };

  const result = streamText({
    model: anthropic(agent.model),
    system: agent.systemPrompt,
    tools: Object.keys(tools).length > 0 ? tools : undefined,
    stopWhen: stepCountIs(5),
    messages: await convertToModelMessages(parsed.data.messages),
  });

  return result.toUIMessageStreamResponse();
}
