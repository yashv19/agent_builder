import { z } from "zod";

export const ChatRequestSchema = z.object({
  agentId: z.string().trim().min(1),
  messages: z.array(z.any()),
});

export type ChatRequestInput = z.infer<typeof ChatRequestSchema>;
