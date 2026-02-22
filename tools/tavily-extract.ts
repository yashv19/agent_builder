import "server-only";

import { tavilyExtract } from "@tavily/ai-sdk";

export const tavilyExtractTool = tavilyExtract({
  extractDepth: "basic",
  format: "markdown",
  includeImages: false,
});
