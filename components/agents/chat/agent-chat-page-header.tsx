import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import type { Agent } from "@/components/agents/types";
import { Button } from "@/components/ui/button";

type AgentChatPageHeaderProps = {
  agent: Agent;
};

export function AgentChatPageHeader({ agent }: AgentChatPageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{agent.name}</h1>
        <p className="text-sm text-muted-foreground">{agent.description || "No description provided."}</p>
      </div>
      <Button asChild variant="outline">
        <Link href="/">
          <ArrowLeft />
          Back to dashboard
        </Link>
      </Button>
    </header>
  );
}
