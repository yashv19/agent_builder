import { SUPPORTED_TOOLS } from "@/lib/tools/tool-metadata";

export const ANTHROPIC_MODELS = [
  "claude-haiku-4-5",
  "claude-sonnet-4-5",
  "claude-sonnet-4-6",
  "claude-opus-4-6",
] as const;

export const DEFAULT_MODEL = ANTHROPIC_MODELS[0];

export { SUPPORTED_TOOLS };
