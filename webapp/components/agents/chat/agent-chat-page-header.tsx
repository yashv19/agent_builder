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
    <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="mt-0.5"
        onClick={onToggleAdminPanel}
        aria-label={isAdminPanelOpen ? "Collapse admin panel" : "Expand admin panel"}
      >
        <Sidebar />
        <span className="sr-only">{isAdminPanelOpen ? "Collapse admin panel" : "Expand admin panel"}</span>
      </Button>

      <div className="min-w-0 space-y-2">
        <h1 className="truncate text-2xl font-semibold tracking-tight">{agent.name}</h1>
        <p className="text-sm text-muted-foreground">{agent.description || "No description provided."}</p>
      </div>

      <Button asChild variant="outline" className="shrink-0">
        <Link href="/">
          <ArrowLeft />
          Back to dashboard
        </Link>
      </Button>
    </header>
  );
}
