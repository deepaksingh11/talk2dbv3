import { DynamicTool } from "@langchain/core/tools";
import { DbOperations } from "../db/DbOperations";
import { DbConfig } from "../db/dbConfig";

export class CustomTools {
  private dbOperations: DbOperations;

  constructor(dbConfig: DbConfig) {
    this.dbOperations = new DbOperations(dbConfig);
  }

  private sqlDbListTablesTool = new DynamicTool({
    name: "sql_db_list_tables",
    description:
      "Input is an empty string, output is a comma-separated list of tables in the database.",
    func: async () => {
      const tables = await this.dbOperations.listTables();
      return JSON.stringify(tables);
    },
  });

  private sqlDbSchemaTool = new DynamicTool({
    name: "sql_db_schema",
    description:
      "Input to this tool is a comma-separated list of tables, output is the schema and sample rows for those tables. Be sure that the tables actually exist by calling sql_db_list_tables first! Example Input: table1, table2, table3",
    func: async (input: string) => {
      const tableNames = input.split(",");
      const schema = await this.dbOperations.getTableSchema(tableNames);
      return JSON.stringify(schema);
    },
  });

  private sqlDbQueryTool = new DynamicTool({
    name: "sql_db_query",
    description:
      "Input to this tool is a detailed and correct SQL query, output is a result from the database. If the query is not correct, an error message will be returned. If an error is returned, rewrite the query, check the query, and try again. If you encounter an issue with Unknown column 'xxxx' in 'field list', use sql_db_schema to query the correct table fields.",
    func: async (input: string) => {
      const result = await this.dbOperations.executeQuery(input);
      return JSON.stringify(result);
    },
  });

  private sqlDbQueryCheckerTool = new DynamicTool({
    name: "sql_db_query_checker",
    description:
      "Use this tool to double check if your query is correct before executing it. Always use this tool before executing a query with sql_db_query!",
    func: async (input: string) => {
      const checkedQuery = await this.dbOperations.checkQuery(input);
      return checkedQuery;
    },
  });

  public getTools() {
    return [
      this.sqlDbListTablesTool,
      this.sqlDbSchemaTool,
      this.sqlDbQueryTool,
      this.sqlDbQueryCheckerTool,
    ];
  }
}
