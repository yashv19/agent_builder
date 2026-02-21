export type Agent = {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  model: string;
  createdAt: string;
};

export type AgentFormData = {
  name: string;
  description: string;
  systemPrompt: string;
  model: string;
};
