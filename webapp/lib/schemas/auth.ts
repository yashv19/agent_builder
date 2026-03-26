import { z } from "zod";

export const LoginRequestSchema = z.object({
  password: z.string().min(1),
});

export type LoginRequestInput = z.infer<typeof LoginRequestSchema>;
