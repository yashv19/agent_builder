export type Agent = {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  braintrustProjectName: string;
  model: string;
  tools: string[];
  createdAt: string;
  updatedAt: string;
};

export type AgentFormData = {
  name: string;
  description: string;
  systemPrompt: string;
  braintrustProjectName: string;
  model: string;
  tools: string[];
};
