import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import type { Agent } from "@/components/agents/types";
import { Button } from "@/components/ui/button";

type AgentChatPageHeaderProps = {
  agent: Agent;
};

export function AgentChatPageHeader({ agent }: AgentChatPageHeaderProps) {
  return (
    <header className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">{agent.name}</h1>
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft />
            Back to dashboard
          </Link>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">{agent.description || "No description provided."}</p>
      <p className="text-sm text-muted-foreground">
        Braintrust project: {agent.braintrustProjectName || "Not configured"}
      </p>
      <div className="flex w-full items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-muted-foreground">Available tools:</p>
          {agent.tools.length === 0 ? (
            <span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">No tools assigned</span>
          ) : (
            agent.tools.map((tool) => (
              <span key={tool} className="rounded-full border bg-muted px-2.5 py-1 text-xs">
                {tool}
              </span>
            ))
          )}
        </div>
        <span className="rounded-md border px-2 py-1 text-xs text-muted-foreground">{agent.model}</span>
      </div>
    </header>
  );
}
