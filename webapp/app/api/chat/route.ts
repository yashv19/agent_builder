import { anthropic } from "@ai-sdk/anthropic";
import { stepCountIs } from "ai";
import { traced, updateSpan } from "braintrust";
import { NextResponse } from "next/server";

import { getAgentByIdFromDb } from "@/lib/db/agents";
import { getBraintrustLogger, getTracedAiSdk } from "@/lib/observability/braintrust-ai";
import { ChatRequestSchema } from "@/lib/schemas/chat";
import { codeExecutionTool } from "@/tools/code-execution";
import { tavilyExtractTool } from "@/tools/tavily-extract";
import { tavilySearchTool } from "@/tools/tavily-search";

function getTurnNumber(messages: unknown[]): number {
  return messages.filter(
    (message) =>
      typeof message === "object" &&
      message !== null &&
      "role" in message &&
      (message as { role?: string }).role === "user",
  ).length;
}

function getLastUserMessageInput(messages: unknown[]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (!message || typeof message !== "object") {
      continue;
    }

    const role = (message as { role?: unknown }).role;
    if (role !== "user") {
      continue;
    }

    const parts = (message as { parts?: unknown }).parts;
    if (Array.isArray(parts)) {
      const text = parts
        .filter((part) => part && typeof part === "object" && (part as { type?: unknown }).type === "text")
        .map((part) => (part as { text?: unknown }).text)
        .filter((text): text is string => typeof text === "string")
        .join("\n")
        .trim();

      if (text) {
        return text;
      }
    }

    const content = (message as { content?: unknown }).content;
    if (typeof content === "string" && content.trim()) {
      return content.trim();
    }
  }

  return "";
}

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

  const logger = getBraintrustLogger();
  const turnNumber = getTurnNumber(parsed.data.messages);
  const turnInput = getLastUserMessageInput(parsed.data.messages);

  let conversationSpanId = parsed.data.parentSpanId;
  let conversationSpan: ReturnType<NonNullable<typeof logger>["startSpan"]> | null = null;

  if (logger && !conversationSpanId) {
    conversationSpan = logger.startSpan({ name: "conversation" });
    conversationSpan.log({
      metadata: {
        conversation_id: parsed.data.conversationId,
        agent_id: parsed.data.agentId,
      },
    });
    conversationSpanId = await conversationSpan.export();
  }

  const tracedAiSdk = getTracedAiSdk();

  return traced(
    async (turnSpan) => {
      const result = tracedAiSdk.streamText({
        model: anthropic(agent.model),
        system: agent.systemPrompt,
        tools: Object.keys(tools).length > 0 ? tools : undefined,
        stopWhen: stepCountIs(5),
        messages: await tracedAiSdk.convertToModelMessages(parsed.data.messages),
        onFinish: ({ text, totalUsage }) => {
          turnSpan.log({
            input: turnInput,
            output: text,
            metadata: {
              total_tokens: (totalUsage.inputTokens ?? 0) + (totalUsage.outputTokens ?? 0),
              turn_number: turnNumber,
              conversation_id: parsed.data.conversationId,
              agent_id: parsed.data.agentId
            },
          });

          if (conversationSpan) {
            conversationSpan.log({
              input: parsed.data.messages,
              output: text,
              metadata: {
                total_tokens: (totalUsage.inputTokens ?? 0) + (totalUsage.outputTokens ?? 0),
                turn_number: turnNumber,
                conversation_id: parsed.data.conversationId,
              },
            });
            conversationSpan.end();
            return;
          }

          if (conversationSpanId) {
            updateSpan({
              exported: conversationSpanId,
              input: parsed.data.messages,
              output: text,
              metadata: {
                total_tokens: (totalUsage.inputTokens ?? 0) + (totalUsage.outputTokens ?? 0),
                turn_number: turnNumber,
                conversation_id: parsed.data.conversationId,
              },
            });
          }
        },
      });

      return result.toUIMessageStreamResponse({
        headers: conversationSpanId
          ? {
              "x-parent-span-id": conversationSpanId,
            }
          : undefined,
      });
    },
    {
      name: `chat_turn_${turnNumber}`,
      parent: conversationSpanId,
    },
  );
}
