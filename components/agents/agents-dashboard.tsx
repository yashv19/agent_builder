"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Plus } from "lucide-react";

import { DEFAULT_MODEL, INITIAL_AGENTS } from "@/components/agents/constants";
import { AgentFormDialog } from "@/components/agents/agent-form-dialog";
import type { Agent, AgentFormData } from "@/components/agents/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  model: DEFAULT_MODEL,
};

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(isoDate));
}

export function AgentsDashboard() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<AgentFormData>(EMPTY_FORM);

  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === selectedAgentId) ?? null,
    [agents, selectedAgentId],
  );

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
      model: targetAgent.model,
    });
    setIsDialogOpen(true);
  };

  const deleteAgent = (agentId: string) => {
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

  const handleSubmit = () => {
    const normalized: AgentFormData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      systemPrompt: formData.systemPrompt.trim(),
      model: formData.model.trim() || DEFAULT_MODEL,
    };

    if (formMode === "create") {
      const nextId = `agent-${crypto.randomUUID()}`;
      const createdAgent: Agent = {
        id: nextId,
        name: normalized.name,
        description: normalized.description,
        systemPrompt: normalized.systemPrompt,
        model: normalized.model,
        createdAt: new Date().toISOString(),
      };

      setAgents((prev) => [createdAgent, ...prev]);
    }

    if (formMode === "edit" && selectedAgent) {
      setAgents((prev) =>
        prev.map((agent) =>
          agent.id === selectedAgent.id
            ? {
                ...agent,
                name: normalized.name,
                description: normalized.description,
                systemPrompt: normalized.systemPrompt,
                model: normalized.model,
              }
            : agent,
        ),
      );
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
                    No agents yet. Create your first one.
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
                          <DropdownMenuItem className="text-red-600" onClick={() => deleteAgent(agent.id)}>
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
        onSubmit={handleSubmit}
      />
    </main>
  );
}
