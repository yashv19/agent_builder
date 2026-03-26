import "server-only";

import { Script, createContext } from "node:vm";
import { tool } from "ai";
import { z } from "zod";

import { TOOL_METADATA } from "@/lib/tools/tool-metadata";

const MAX_CODE_LENGTH = 10_000;
const MAX_OUTPUT_LENGTH = 8_000;
const EXECUTION_TIMEOUT_MS = 300;

function trimOutput(value: string): string {
  if (value.length <= MAX_OUTPUT_LENGTH) {
    return value;
  }

  return `${value.slice(0, MAX_OUTPUT_LENGTH)}\n...output truncated...`;
}

export const codeExecutionTool = tool({
  description: TOOL_METADATA.code_execution.description,
  inputSchema: z.object({
    code: z
      .string()
      .min(1, "Code is required")
      .max(MAX_CODE_LENGTH, `Code is too long (max ${MAX_CODE_LENGTH} characters)`),
  }),
  execute: async ({ code }) => {
    const logs: string[] = [];

    const safeConsole = {
      log: (...args: unknown[]) => {
        logs.push(args.map((arg) => String(arg)).join(" "));
      },
      error: (...args: unknown[]) => {
        logs.push(args.map((arg) => String(arg)).join(" "));
      },
      warn: (...args: unknown[]) => {
        logs.push(args.map((arg) => String(arg)).join(" "));
      },
    };

    const sandbox = {
      console: safeConsole,
      Math,
      Number,
      String,
      Boolean,
      Array,
      Object,
      JSON,
      Date,
      RegExp,
      Set,
      Map,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
    };

    const context = createContext(sandbox);

    try {
      const script = new Script(code);
      const result = script.runInContext(context, {
        timeout: EXECUTION_TIMEOUT_MS,
      });

      return {
        ok: true,
        logs: trimOutput(logs.join("\n")),
        result: trimOutput(typeof result === "undefined" ? "undefined" : String(result)),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown execution error";

      return {
        ok: false,
        logs: trimOutput(logs.join("\n")),
        error: trimOutput(message),
      };
    }
  },
});
