import { ChatOpenAI } from "@langchain/openai";

export interface ModelConfig {
  model: string;
  temperature: number;
  apiKey: string;
}

export const createModel = (modelConfig: ModelConfig) => {
  return new ChatOpenAI({
    model: modelConfig.model,
    temperature: modelConfig.temperature,
    openAIApiKey: modelConfig.apiKey,
  });
};
