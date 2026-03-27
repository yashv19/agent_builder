"use client";

import { useState } from "react";

import type { Agent } from "@/components/agents/types";
import { AgentAdminPanel } from "@/components/agents/chat/agent-admin-panel";
import { AgentChatPageHeader } from "@/components/agents/chat/agent-chat-page-header";
import { AgentChatWindow } from "@/components/agents/chat/agent-chat-window";

type AgentChatShellProps = {
  agent: Agent;
};

export function AgentChatShell({ agent }: AgentChatShellProps) {
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(true);

  return (
    <main className="mx-auto flex h-screen w-full max-w-7xl min-h-0 gap-4 overflow-hidden p-6 md:p-10">
      <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-6 overflow-hidden">
        <AgentChatPageHeader
          agent={agent}
          isAdminPanelOpen={isAdminPanelOpen}
          onToggleAdminPanel={() => setIsAdminPanelOpen((prev) => !prev)}
        />
        <AgentChatWindow agent={agent} />
      </section>
      {isAdminPanelOpen ? <AgentAdminPanel agent={agent} /> : null}
    </main>
  );
}
