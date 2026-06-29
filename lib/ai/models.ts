export const DEFAULT_CHAT_MODEL = "claude-sonnet-4-6";

export type ModelCapabilities = {
  tools: boolean;
  vision: boolean;
  reasoning: boolean;
};

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  capabilities: ModelCapabilities;
};

export const chatModels: ChatModel[] = [
  {
    id: "claude-opus-4-8",
    name: "Claude Opus 4.8",
    provider: "anthropic",
    description: "Most capable Claude model",
    capabilities: { tools: true, vision: true, reasoning: true },
  },
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    provider: "anthropic",
    description: "Balanced performance and speed",
    capabilities: { tools: true, vision: true, reasoning: true },
  },
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    provider: "anthropic",
    description: "Fast and cost-effective",
    capabilities: { tools: true, vision: true, reasoning: false },
  },
];

export const allowedModelIds = new Set(chatModels.map((m) => m.id));
