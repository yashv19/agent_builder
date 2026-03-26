import type { Agent } from "@/components/agents/types";
import { TOOL_METADATA } from "@/lib/tools/tool-metadata";

type AgentAdminPanelProps = {
  agent: Agent;
};

function readToolLabel(tool: string) {
  if (tool in TOOL_METADATA) {
    return TOOL_METADATA[tool as keyof typeof TOOL_METADATA].name;
  }

  return tool;
}

export function AgentAdminPanel({ agent }: AgentAdminPanelProps) {
  return (
    <aside className="min-h-0 w-112 shrink-0 rounded-lg border bg-muted/20">
      <div className="flex h-full min-h-0 flex-col p-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold tracking-tight">Agent Details</h2>
          <p className="text-xs text-muted-foreground">Agent metadata and runtime configuration.</p>
        </div>

        <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4">
          <section className="space-y-1.5">
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Braintrust Project</h3>
            <p className="rounded-md border bg-background px-2.5 py-2 text-xs">
              {agent.braintrustProjectName || "Not configured"}
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Model</h3>
            <p className="rounded-md border bg-background px-2.5 py-2 text-xs">{agent.model || "Not configured"}</p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Available Tools</h3>
            {agent.tools.length === 0 ? (
              <p className="rounded-md border bg-background px-2.5 py-2 text-xs text-muted-foreground">
                No tools assigned
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5 rounded-md border bg-background p-2">
                {agent.tools.map((tool) => (
                  <span key={tool} className="rounded-full border bg-muted px-2 py-0.5 text-xs">
                    {readToolLabel(tool)}
                  </span>
                ))}
              </div>
            )}
          </section>

          <section className="flex min-h-0 flex-1 flex-col space-y-1.5">
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">System Prompt</h3>
            <div className="min-h-0 flex-1 overflow-y-auto rounded-md border bg-background p-2.5">
              <p className="whitespace-pre-wrap break-words text-sm leading-6">
                {agent.systemPrompt || "No system prompt configured"}
              </p>
            </div>
          </section>
        </div>
      </div>
    </aside>
  );
}
