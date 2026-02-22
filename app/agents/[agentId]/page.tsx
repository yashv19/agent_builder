import { AgentChatPageHeader } from "@/components/agents/chat/agent-chat-page-header";
import { AgentChatWindow } from "@/components/agents/chat/agent-chat-window";
import { getAgentByIdFromDb } from "@/lib/db/agents";

type AgentPageProps = {
  params: Promise<{ agentId: string }>;
};

export default async function AgentPage({ params }: AgentPageProps) {
  const { agentId } = await params;
  const decodedAgentId = decodeURIComponent(agentId ?? "").trim();

  if (!decodedAgentId) {
    return (
      <main className="mx-auto w-full max-w-4xl p-6 md:p-10">
        <p className="text-sm text-muted-foreground">Invalid agent id.</p>
      </main>
    );
  }

  const agent = await getAgentByIdFromDb(decodedAgentId);
  if (!agent) {
    return (
      <main className="mx-auto w-full max-w-4xl p-6 md:p-10">
        <p className="text-sm text-muted-foreground">Agent not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex h-screen w-full max-w-4xl min-h-0 flex-col gap-6 overflow-hidden p-6 md:p-10">
      <AgentChatPageHeader agent={agent} />
      <AgentChatWindow agent={agent} />
    </main>
  );
}
