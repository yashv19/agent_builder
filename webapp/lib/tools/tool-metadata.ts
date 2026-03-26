export const TOOL_METADATA = {
  code_execution: {
    name: "Code execution",
    description:
      "Execute basic vanilla JavaScript in a constrained vm context and return logs plus the final expression result.",
    activityLabel: "Executing code",
  },
  tavily_search: {
    name: "Tavily search",
    description: "Search the web for relevant information.",
    activityLabel: "Tavily search",
  },
  tavily_extract: {
    name: "Tavily extract",
    description: "Extract page content from specific URLs.",
    activityLabel: "Tavily extract",
  },
} as const;

export type SupportedTool = keyof typeof TOOL_METADATA;

export const SUPPORTED_TOOLS = Object.keys(TOOL_METADATA) as SupportedTool[];

export const TOOL_EVENT_LABELS = Object.fromEntries(
  SUPPORTED_TOOLS.map((tool) => [`tool-${tool}`, TOOL_METADATA[tool].activityLabel]),
) as Record<`tool-${SupportedTool}`, string>;
