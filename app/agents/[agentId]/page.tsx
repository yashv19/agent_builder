import { buildFallbackAgent, findAgentById } from "@/components/agents/agent-record";
import { AgentChatPageHeader } from "@/components/agents/chat/agent-chat-page-header";
import { AgentChatWindow } from "@/components/agents/chat/agent-chat-window";

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

  const agent = findAgentById(decodedAgentId) ?? buildFallbackAgent(decodedAgentId);

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 p-6 md:p-10">
      <AgentChatPageHeader agent={agent} />
      <AgentChatWindow agent={agent} />
    </main>
  );
}
