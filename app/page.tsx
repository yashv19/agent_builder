import { AgentsDashboard } from "@/components/agents/agents-dashboard";
import { listAgentsFromDb } from "@/lib/db/agents";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const agents = await listAgentsFromDb();

  return <AgentsDashboard initialAgents={agents} />;
}
