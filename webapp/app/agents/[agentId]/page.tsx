import { AgentChatShell } from "@/components/agents/chat/agent-chat-shell";
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

  return <AgentChatShell agent={agent} />;
}
