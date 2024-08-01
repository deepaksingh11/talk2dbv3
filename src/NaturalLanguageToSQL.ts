import { AgentExecutorService } from "./agent/AgentExecutorService";
import { DbConfig } from "./db/dbConfig";
import { ModelConfig } from "./model/openAI";

export class NaturalLanguageToSQL {
  private agentExecutorService: any;

  constructor(dbConfig: DbConfig, modelConfig: ModelConfig) {
    this.agentExecutorService = new AgentExecutorService(dbConfig, modelConfig);
  }

  async query(input: string): Promise<string> {
    const executor = this.agentExecutorService.getAgentExecutor();
    try {
      const result = await executor.invoke({ input });
      console.log(result);
      return JSON.stringify(result);
    } catch (error: any) {
      console.error(error);
      throw new Error(`Query execution failed: ${error.message}`);
    }
  }
}
