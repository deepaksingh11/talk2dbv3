import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { AgentExecutor, AgentStep } from "langchain/agents";
import { convertToOpenAIFunction } from "@langchain/core/utils/function_calling";
import { OpenAIFunctionsAgentOutputParser } from "langchain/agents/openai/output_parser";
import { CustomTools } from "./CustomTools";
import { DbConfig } from "../db/dbConfig";
import { createModel, ModelConfig } from "../model/openAI";
import { formatToOpenAIFunctionMessages } from "langchain/agents/format_scratchpad";

export class AgentExecutorService {
  private tools: any[];
  private model: ChatOpenAI;

  constructor(dbConfig: DbConfig, modelConfig: ModelConfig) {
    const customTools = new CustomTools(dbConfig);
    this.tools = customTools.getTools();
    this.model = createModel(modelConfig);
  }

  private createPromptTemplate() {
    return ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are an agent designed to interact with a postgres SQL database.
        Given an input question, create a syntactically correct postgres SQL query to run, then look at the results of the query and return the answer.
        Unless the user specifies a specific number of examples they wish to obtain, always limit your query to at most 10 results.
        You can order the results by a relevant column to return the most interesting examples in the database.
        Never query for all the columns from a specific table, only ask for the relevant columns given the question.
        You have access to tools for interacting with the database.
        Only use the below tools. Only use the information returned by the below tools to construct your final answer.
        You MUST double-check your query before executing it. If you get an error while executing a query, rewrite the query and try again.
        DO NOT make any DML statements (INSERT, UPDATE, DELETE, DROP etc.) to the database.
        Ensure that the final response is detailed and in natural language, and does not include any special characters such as newlines.
        If the question does not seem related to the database, just return "I don't know" as the answer.`,
      ],
      ["human", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);
  }

  private createModelWithFunctions() {
    return this.model.bind({
      functions: this.tools.map((tool) => convertToOpenAIFunction(tool)),
    });
  }

  private createRunnableAgent() {
    return RunnableSequence.from([
      {
        input: (i: { input: string; steps: AgentStep[] }) => i.input,
        agent_scratchpad: (i: { input: string; steps: AgentStep[] }) =>
          formatToOpenAIFunctionMessages(i.steps),
      },
      this.createPromptTemplate(),
      this.createModelWithFunctions(),
      new OpenAIFunctionsAgentOutputParser(),
    ]);
  }

  public getAgentExecutor() {
    return AgentExecutor.fromAgentAndTools({
      agent: this.createRunnableAgent(),
      tools: this.tools,
      //   verbose: true,
    });
  }
}
