"use client";

import { FormEvent, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ChevronRight } from "lucide-react";

import type { Agent } from "@/components/agents/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AgentChatWindowProps = {
  agent: Agent;
};

type ChatMessageShape = {
  role?: string;
  content?: string;
  parts?: Array<{
    type?: string;
    text?: string;
    state?: string;
    toolCallId?: string;
    input?: unknown;
    output?: unknown;
    errorText?: string;
  }>;
};

type ToolEvent = {
  id: string;
  state: string;
  input: unknown;
  output: unknown;
  errorText: string;
};

type DisplayPart =
  | { kind: "text"; id: string; text: string }
  | { kind: "tool"; id: string; event: ToolEvent };

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

function readDisplayParts(message: ChatMessageShape): DisplayPart[] {
  if (!Array.isArray(message.parts) || message.parts.length === 0) {
    const fallbackText = readMessageText(message);
    return fallbackText ? [{ kind: "text", id: "text-fallback", text: fallbackText }] : [];
  }

  const displayParts: DisplayPart[] = [];

  message.parts.forEach((part, index) => {
    if (part?.type === "text" && typeof part.text === "string" && part.text.trim().length > 0) {
      displayParts.push({
        kind: "text",
        id: `text-${index}`,
        text: part.text,
      });
      return;
    }

    if (part?.type === "tool-code_execution") {
      displayParts.push({
        kind: "tool",
        id: part.toolCallId ?? `tool-${index}`,
        event: {
          id: part.toolCallId ?? `tool-${index}`,
          state: typeof part.state === "string" ? part.state : "input-available",
          input: part.input,
          output: part.output,
          errorText: typeof part.errorText === "string" ? part.errorText : "",
        },
      });
    }
  });

  return displayParts;
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
        const displayParts = readDisplayParts(message as ChatMessageShape);
        const role = message.role === "user" ? "user" : "assistant";
        const isUser = role === "user";

        return {
          id: message.id,
          role,
          isUser,
          displayParts,
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
          agentId: agent.id,
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
                {message.displayParts.length === 0 ? (
                  <p
                    className={`whitespace-pre-wrap rounded-md border px-3 py-2 text-sm ${
                      message.isUser ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    ...
                  </p>
                ) : (
                  message.displayParts.map((part) => {
                    if (part.kind === "text") {
                      return (
                        <p
                          key={part.id}
                          className={`whitespace-pre-wrap rounded-md border px-3 py-2 text-sm ${
                            message.isUser ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          {part.text}
                        </p>
                      );
                    }

                    const toolEvent = part.event;

                    return (
                      <details key={part.id} className="group rounded-md border bg-muted/40 p-2 text-left">
                        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
                          <ChevronRight className="size-4 transition-transform group-open:rotate-90" />
                          Executing code
                        </summary>
                        <div className="mt-2 space-y-2 text-xs text-muted-foreground">
                          <div>
                            <p className="font-medium">Input</p>
                            <pre className="overflow-x-auto rounded-md border bg-background p-2">
                              {JSON.stringify(toolEvent.input ?? null, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <p className="font-medium">{toolEvent.state === "output-error" ? "Error" : "Output"}</p>
                            <pre className="overflow-x-auto rounded-md border bg-background p-2">
                              {toolEvent.state === "output-error"
                                ? toolEvent.errorText || "Tool execution failed."
                                : JSON.stringify(toolEvent.output ?? null, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </details>
                    );
                  })
                )}
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
