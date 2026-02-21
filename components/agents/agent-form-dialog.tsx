"use client";

import { DEFAULT_MODEL } from "@/components/agents/constants";
import type { AgentFormData } from "@/components/agents/types";
import { Button } from "@/components/ui/button";
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
  const isValid = formData.name.trim().length > 0 && formData.systemPrompt.trim().length > 0;

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
            if (!isValid) {
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
            <Label htmlFor="agent-model">Model</Label>
            <Input
              id="agent-model"
              value={formData.model}
              onChange={(event) => onFormChange({ ...formData, model: event.target.value })}
              placeholder={DEFAULT_MODEL}
            />
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
            <Button type="submit" disabled={!isValid}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
