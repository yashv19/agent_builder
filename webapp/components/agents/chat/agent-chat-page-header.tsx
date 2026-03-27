"use client";

import Link from "next/link";
import { ArrowLeft, Sidebar } from "lucide-react";

import type { Agent } from "@/components/agents/types";
import { Button } from "@/components/ui/button";

type AgentChatPageHeaderProps = {
  agent: Agent;
  isAdminPanelOpen: boolean;
  onToggleAdminPanel: () => void;
};

export function AgentChatPageHeader({ agent, isAdminPanelOpen, onToggleAdminPanel }: AgentChatPageHeaderProps) {
  return (
    <header className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft />
            Back to dashboard
          </Link>
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={onToggleAdminPanel}
          aria-label={isAdminPanelOpen ? "Collapse admin panel" : "Expand admin panel"}
        >
          <Sidebar />
          <span className="sr-only">{isAdminPanelOpen ? "Collapse admin panel" : "Expand admin panel"}</span>
        </Button>
      </div>

      <div className="min-w-0 space-y-2">
        <h1 className="truncate text-2xl font-semibold tracking-tight">{agent.name}</h1>
        <p className="text-sm text-muted-foreground">{agent.description || "No description provided."}</p>
      </div>
    </header>
  );
}
