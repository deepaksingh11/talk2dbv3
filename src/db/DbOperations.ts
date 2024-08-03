import { DataSource } from "typeorm";
import { SqlDatabase } from "langchain/sql_db";
import { DbConfig } from "./dbConfig";

export class DbOperations {
  private datasource: DataSource;

  constructor(dbConfig: DbConfig) {
    this.datasource = new DataSource({
      type: dbConfig.type,
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
    });
  }

  public async listTables(): Promise<string[]> {
    try {
      const db = await this.getDataSource();
      const tableInfo = db.allTables;
      const tableNames = this.extractTableNames(tableInfo);
      return tableNames;
    } catch (error: any) {
      throw new Error(`Failed to list tables: ${error.message}`);
    }
  }

  public async getTableSchema(tableNames: string[]): Promise<any> {
    const db = await this.getDataSource();
    const tableSchema = await db.getTableInfo(tableNames);
    return tableSchema;
  }

  public async executeQuery(query: string): Promise<string> {
    try {
      const db = await this.getDataSource();
      const response = await db.run(query);
      return response;
    } catch (error: any) {
      throw new Error(`Failed to run query: ${error.message}`);
    }
  }

  public async checkQuery(query: string): Promise<string> {
    try {
      const db = await this.getDataSource();
      const response = await db.run(`EXPLAIN ${query}`);
      return response;
    } catch (error: any) {
      throw new Error(`Query validation failed: ${error.message}`);
    }
  }

  private async getDataSource(): Promise<SqlDatabase> {
    const db = await SqlDatabase.fromDataSourceParams({
      appDataSource: this.datasource,
    });
    return db;
  }

  private extractTableNames(
    response: { tableName: string; columns: object[] }[]
  ): string[] {
    return response.map((table) => table.tableName);
  }
}
