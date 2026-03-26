import { z } from "zod";

import { DEFAULT_MODEL } from "@/components/agents/constants";

export const AgentFormSchema = z
  .object({
    name: z.string().trim().min(1),
    description: z.string().optional().default(""),
    systemPrompt: z.string().trim().min(1),
    braintrustProjectName: z
      .string()
      .trim()
      .min(1, "Braintrust project name is required")
      .max(120),
    model: z.string().trim().min(1).optional().default(DEFAULT_MODEL),
    tools: z.array(z.string()).optional().default([]),
  })
  .transform((value) => ({
    name: value.name.trim(),
    description: value.description.trim(),
    systemPrompt: value.systemPrompt.trim(),
    braintrustProjectName: value.braintrustProjectName.trim(),
    model: value.model.trim() || DEFAULT_MODEL,
    tools: Array.from(new Set(value.tools.filter((tool) => tool.trim().length > 0))),
  }));

export type AgentFormInput = z.infer<typeof AgentFormSchema>;
