import "server-only";

import { tavilySearch } from "@tavily/ai-sdk";

export const tavilySearchTool = tavilySearch({
  searchDepth: "basic",
  maxResults: 5,
  includeAnswer: false,
});
