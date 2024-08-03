// export * from './NaturalLanguageToSQL';

// Below code is for testing purpose
import { DbConfig } from "./db/dbConfig";
import { ModelConfig } from "./model/openAI";
import { NaturalLanguageToSQL } from "./NaturalLanguageToSQL";

const dbConfig: DbConfig = {
  type: "postgres",
  host: "host",
  port: 5432,
  username: "username",
  password: "password",
  database: "database",
};

const modelConfig: ModelConfig = {
  model: "gpt-4o",
  temperature: 0,
  apiKey: "API_KEY",
};

const naturalLanguageToSQL = new NaturalLanguageToSQL(dbConfig, modelConfig);

const inputs = [
  "List all users with claim status approved",
  "How many users are there in user table",
  "Write an email for me",
];

inputs.forEach((input) => {
  console.log(`Calling agent executor with query: ${input}`);
  naturalLanguageToSQL.query(input);
});
