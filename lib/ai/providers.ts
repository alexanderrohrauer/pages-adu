import { claudeCode } from "ai-sdk-provider-claude-code";

export function getLanguageModel(modelId: string) {
  return claudeCode(modelId);
}

export function getTitleModel() {
  return claudeCode("claude-haiku-4-5-20251001");
}
