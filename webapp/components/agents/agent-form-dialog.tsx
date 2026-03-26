"use client";

import { ANTHROPIC_MODELS, SUPPORTED_TOOLS } from "@/components/agents/constants";
import type { AgentFormData } from "@/components/agents/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type AgentFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  formData: AgentFormData;
  onOpenChange: (open: boolean) => void;
  onFormChange: (next: AgentFormData) => void;
  onSubmit: () => void;
};

export function AgentFormDialog({
  open,
  mode,
  formData,
  onOpenChange,
  onFormChange,
  onSubmit,
}: AgentFormDialogProps) {
  const submitLabel = mode === "create" ? "Create agent" : "Save changes";
  const title = mode === "create" ? "Create Agent" : "Edit Agent";
  const description =
    mode === "create"
      ? "Define the base behavior and model for your conversational agent."
      : "Update this agent configuration.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (formData.name.trim().length === 0 || formData.systemPrompt.trim().length === 0) {
              return;
            }
            onSubmit();
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="agent-name">Name</Label>
            <Input
              id="agent-name"
              value={formData.name}
              maxLength={80}
              onChange={(event) => onFormChange({ ...formData, name: event.target.value })}
              placeholder="Customer Support Bot"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="agent-description">Description</Label>
            <Input
              id="agent-description"
              value={formData.description}
              maxLength={140}
              onChange={(event) => onFormChange({ ...formData, description: event.target.value })}
              placeholder="Handles support tickets and FAQs"
            />
          </div>
          <div className="grid gap-2">
            <Label>Model</Label>
            <Select
              value={formData.model}
              onValueChange={(value) => {
                onFormChange({ ...formData, model: value });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {ANTHROPIC_MODELS.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Tools</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" className="justify-between">
                  {formData.tools.length > 0 ? `${formData.tools.length} selected` : "Select tools"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {SUPPORTED_TOOLS.map((tool) => {
                  const checked = formData.tools.includes(tool);
                  return (
                    <DropdownMenuCheckboxItem
                      key={tool}
                      checked={checked}
                      onCheckedChange={(nextChecked) => {
                        const nextTools = nextChecked
                          ? [...formData.tools, tool]
                          : formData.tools.filter((value) => value !== tool);
                        onFormChange({ ...formData, tools: Array.from(new Set(nextTools)) });
                      }}
                    >
                      {tool}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="agent-system-prompt">System prompt</Label>
            <Textarea
              id="agent-system-prompt"
              value={formData.systemPrompt}
              onChange={(event) => onFormChange({ ...formData, systemPrompt: event.target.value })}
              placeholder="You are a helpful assistant..."
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
