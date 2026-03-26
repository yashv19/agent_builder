"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Plus } from "lucide-react";

import { DEFAULT_MODEL } from "@/components/agents/constants";
import { AgentFormDialog } from "@/components/agents/agent-form-dialog";
import type { Agent, AgentFormData } from "@/components/agents/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const EMPTY_FORM: AgentFormData = {
  name: "",
  description: "",
  systemPrompt: "",
  braintrustProjectName: "",
  model: DEFAULT_MODEL,
  tools: [],
};

type AgentsDashboardProps = {
  initialAgents: Agent[];
};

type AgentResponse = {
  agent: Agent;
};

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(isoDate));
}

export function AgentsDashboard({ initialAgents }: AgentsDashboardProps) {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<AgentFormData>(EMPTY_FORM);
  const [pendingDeleteAgent, setPendingDeleteAgent] = useState<Agent | null>(null);

  const openCreateDialog = () => {
    setFormMode("create");
    setSelectedAgentId(null);
    setFormData(EMPTY_FORM);
    setIsDialogOpen(true);
  };

  const openEditDialog = (agentId: string) => {
    const targetAgent = agents.find((agent) => agent.id === agentId);
    if (!targetAgent) {
      return;
    }

    setFormMode("edit");
    setSelectedAgentId(agentId);
    setFormData({
      name: targetAgent.name,
      description: targetAgent.description,
      systemPrompt: targetAgent.systemPrompt,
      braintrustProjectName: targetAgent.braintrustProjectName,
      model: targetAgent.model,
      tools: targetAgent.tools,
    });
    setIsDialogOpen(true);
  };

  const deleteAgent = async (agentId: string) => {
    const response = await fetch(`/api/agents/${encodeURIComponent(agentId)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      return;
    }

    setAgents((prev) => prev.filter((agent) => agent.id !== agentId));
    if (selectedAgentId === agentId) {
      setSelectedAgentId(null);
    }
  };

  const closeDialog = (nextOpen: boolean) => {
    setIsDialogOpen(nextOpen);
    if (!nextOpen) {
      setFormData(EMPTY_FORM);
      setSelectedAgentId(null);
      setFormMode("create");
    }
  };

  const closeDeleteDialog = (nextOpen: boolean) => {
    if (!nextOpen) {
      setPendingDeleteAgent(null);
    }
  };

  const confirmDeleteAgent = async () => {
    if (!pendingDeleteAgent) {
      return;
    }

    await deleteAgent(pendingDeleteAgent.id);
    setPendingDeleteAgent(null);
  };

  const handleSubmit = async () => {
    const normalized: AgentFormData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      systemPrompt: formData.systemPrompt.trim(),
      braintrustProjectName: formData.braintrustProjectName.trim(),
      model: formData.model.trim() || DEFAULT_MODEL,
      tools: formData.tools,
    };

    if (!normalized.name || !normalized.systemPrompt || !normalized.braintrustProjectName) {
      return;
    }

    if (formMode === "create") {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalized),
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as AgentResponse;
      if (payload.agent) {
        setAgents((prev) => [payload.agent, ...prev]);
      }
    }

    if (formMode === "edit" && selectedAgentId) {
      const response = await fetch(`/api/agents/${encodeURIComponent(selectedAgentId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalized),
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as AgentResponse;
      if (payload.agent) {
        setAgents((prev) => prev.map((agent) => (agent.id === payload.agent.id ? payload.agent : agent)));
      }
    }

    closeDialog(false);
  };

  const goToAgent = (agentId: string) => {
    const safeId = encodeURIComponent(agentId.trim());
    router.push(`/agents/${safeId}`);
  };

  return (
    <main className="mx-auto w-full max-w-6xl p-6 md:p-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Agents</CardTitle>
            <CardDescription>Create and manage conversational AI agents.</CardDescription>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus />
            Create Agent
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No agents in the database yet 🤖
                  </TableCell>
                </TableRow>
              ) : (
                agents.map((agent) => (
                  <TableRow
                    key={agent.id}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer"
                    onClick={() => goToAgent(agent.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        goToAgent(agent.id);
                      }
                    }}
                  >
                    <TableCell className="font-medium">{agent.name}</TableCell>
                    <TableCell className="text-muted-foreground">{agent.description || "-"}</TableCell>
                    <TableCell>{agent.model}</TableCell>
                    <TableCell>{formatDate(agent.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(event) => event.stopPropagation()}>
                          <Button variant="ghost" size="icon" aria-label={`Actions for ${agent.name}`}>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
                          <DropdownMenuItem onClick={() => openEditDialog(agent.id)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              setPendingDeleteAgent(agent);
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AgentFormDialog
        open={isDialogOpen}
        mode={formMode}
        formData={formData}
        onOpenChange={closeDialog}
        onFormChange={setFormData}
        onSubmit={() => void handleSubmit()}
      />

      <Dialog open={pendingDeleteAgent !== null} onOpenChange={closeDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete agent?</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>{pendingDeleteAgent?.name ?? "this agent"}</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDeleteAgent(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void confirmDeleteAgent()}>
              Delete agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
