"use client";

import { FormEvent, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

import type { Agent } from "@/components/agents/types";
import { Button } from "@/components/ui/button";
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
  const { messages, sendMessage, status } = useChat({
    id: `agent-chat-${agent.id}`,
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });
  const [input, setInput] = useState("");

  const renderedMessages = useMemo(
    () =>
      messages.map((message) => {
        const text = readMessageText(message as ChatMessageShape);
        const role = message.role === "user" ? "user" : "assistant";
        const isUser = role === "user";

        return {
          id: message.id,
          role,
          isUser,
          text: text || "...",
        };
      }),
    [messages],
  );

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextMessage = input.trim();
    if (!nextMessage || status === "streaming") {
      return;
    }

    sendMessage(
      { text: nextMessage },
      {
        body: {
          model: agent.model,
          systemPrompt: agent.systemPrompt,
        },
      },
    );
    setInput("");
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {renderedMessages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages yet.</p>
        ) : (
          renderedMessages.map((message) => (
            <article key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] space-y-1 ${message.isUser ? "items-end text-right" : "items-start text-left"}`}>
                <p className="text-xs font-medium text-muted-foreground">{message.role}</p>
                <p
                  className={`whitespace-pre-wrap rounded-md border px-3 py-2 text-sm ${
                    message.isUser ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {message.text}
                </p>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="sticky bottom-0 border-t bg-background py-4">
        <form className="flex gap-2" onSubmit={handleFormSubmit}>
          <Input
            name="prompt"
            placeholder="Ask your agent something..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={status === "streaming"}
          />
          <Button type="submit" disabled={status === "streaming" || input.trim().length === 0}>
            Send
          </Button>
        </form>
      </div>
    </section>
  );
}
