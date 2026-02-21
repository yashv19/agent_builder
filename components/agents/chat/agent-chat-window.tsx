"use client";

import { useMemo } from "react";
import { useChat } from "@ai-sdk/react";

import type { Agent } from "@/components/agents/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AgentChatWindowProps = {
  agent: Agent;
};

type ChatMessageShape = {
  role?: string;
  content?: string;
  parts?: Array<{ type?: string; text?: string }>;
};

function readMessageText(message: ChatMessageShape): string {
  if (typeof message.content === "string" && message.content.length > 0) {
    return message.content;
  }

  if (!Array.isArray(message.parts)) {
    return "";
  }

  return message.parts
    .filter((part) => part?.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

export function AgentChatWindow({ agent }: AgentChatWindowProps) {
  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    id: `agent-chat-${agent.id}`,
    api: "/api/chat",
    body: {
      agentId: agent.id,
      model: agent.model,
    },
  });

  const isInputDisabled = true;

  const renderedMessages = useMemo(
    () =>
      messages.map((message) => {
        const text = readMessageText(message as ChatMessageShape);
        const role = message.role === "assistant" ? "Assistant" : "You";

        return {
          id: message.id,
          role,
          text: text || "...",
        };
      }),
    [messages],
  );

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Chat</CardTitle>
          <span className="rounded-md border px-2 py-1 text-xs text-muted-foreground">{agent.model}</span>
        </div>
        <CardDescription>UI is wired with `useChat`. Message streaming will be connected next.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="min-h-[360px] space-y-3 rounded-md border p-4">
          {renderedMessages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          ) : (
            renderedMessages.map((message) => (
              <article key={message.id} className="space-y-1 rounded-md border p-3">
                <p className="text-xs font-medium text-muted-foreground">{message.role}</p>
                <p className="whitespace-pre-wrap text-sm">{message.text}</p>
              </article>
            ))
          )}
        </div>

        <form
          className="flex gap-2"
          onSubmit={(event) => {
            if (isInputDisabled) {
              event.preventDefault();
              return;
            }

            handleSubmit(event);
          }}
        >
          <Input
            name="prompt"
            placeholder="Ask your agent something..."
            value={input}
            onChange={handleInputChange}
            disabled={isInputDisabled}
          />
          <Button type="submit" disabled={isInputDisabled || status === "streaming"}>
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
