import { anthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { NextResponse } from "next/server";

type ChatRequestBody = {
  messages?: UIMessage[];
  model?: string;
  systemPrompt?: string;
};

function readBody(input: unknown): ChatRequestBody | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const data = input as ChatRequestBody;

  if (!Array.isArray(data.messages) || typeof data.model !== "string" || typeof data.systemPrompt !== "string") {
    return null;
  }

  if (data.model.trim().length === 0 || data.systemPrompt.trim().length === 0) {
    return null;
  }

  return {
    messages: data.messages,
    model: data.model.trim(),
    systemPrompt: data.systemPrompt.trim(),
  };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = readBody(body);

  if (!parsed) {
    return NextResponse.json({ error: "Invalid chat payload." }, { status: 400 });
  }

  const result = streamText({
    model: anthropic(parsed.model),
    system: parsed.systemPrompt,
    messages: await convertToModelMessages(parsed.messages ?? []),
  });

  return result.toUIMessageStreamResponse();
}
