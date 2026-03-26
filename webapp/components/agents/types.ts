export type Agent = {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  model: string;
  tools: string[];
  createdAt: string;
  updatedAt: string;
};

export type AgentFormData = {
  name: string;
  description: string;
  systemPrompt: string;
  model: string;
  tools: string[];
};
