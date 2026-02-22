export const ANTHROPIC_MODELS = [
  "claude-haiku-4-5",
  "claude-sonnet-4-5",
  "claude-sonnet-4-6",
  "claude-opus-4-6",
] as const;

export const DEFAULT_MODEL = ANTHROPIC_MODELS[0];

export const DUMMY_TOOLS = [
  "web_search",
  "knowledge_base",
  "calculator",
  "calendar",
  "crm_lookup",
] as const;
