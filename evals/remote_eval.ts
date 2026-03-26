import Anthropic from "@anthropic-ai/sdk";
import { LLMClassifierFromSpec } from "autoevals";
import { Eval } from "braintrust";
import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

type Message = { role: "user" | "assistant"; content: string };
type Input = { messages: Message[] };

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const responseQualityPromptTemplate = `
You are evaluating a support agent's response to a customer.

Agent response: {{output}}

Rate the response:
A: Excellent — addresses the issue, empathetic, actionable
B: Good — mostly helpful with minor gaps
C: Adequate — partially addresses the issue
D: Poor — unhelpful or off-topic
`;

const ResponseQuality = LLMClassifierFromSpec("ResponseQuality", {
  prompt: responseQualityPromptTemplate,
  choice_scores: { A: 1.0, B: 0.75, C: 0.5, D: 0.0 },
  use_cot: true,
  model: "claude-haiku-4-5-20251001",
});

Eval("Support Agent", {
  data: () => [],

  task: async (input: Input, { parameters }) => {
    const response = await client.messages.create({
      model: parameters?.model ?? "claude-sonnet-4-6",
      max_tokens: 512,
      system:
        parameters?.systemPrompt ??
        "You are a helpful support agent. Be empathetic, concise, and provide actionable next steps.",
      messages: input.messages,
    });
    return response.content[0].type === "text" ? response.content[0].text : "";
  },

  scores: [ResponseQuality],

  parameters: {
    systemPrompt: z
      .string()
      .describe("System prompt for the travel support agent")
      .default(
        "You are a helpful support agent. Be empathetic, concise, and provide actionable next steps.",
      ),
    model: z.string().describe("Model to use for task execution").default("claude-sonnet-4-6")
  },
});
