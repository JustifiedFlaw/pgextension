import * as vscode from 'vscode';
import { Client } from 'pg';

export class PgHelper {
    private client: Client;

    constructor(connectionInfo: PgConnectionInfo) {
        this.client = new Client();
        this.client.host = connectionInfo.host;
        this.client.port = connectionInfo.port;
        this.client.database = connectionInfo.database;
        this.client.user = connectionInfo.user;
        this.client.password = connectionInfo.password;
        this.client.connect();
    }

    async createTable(tableName: string): Promise<void> {
        await this.client.query(`CREATE TABLE IF NOT EXISTS ${tableName} (Id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY)`);
        vscode.window.showInformationMessage(`Created table ${tableName}`);
    }

    async addColumn(tableName: string, columnName: string, type: string): Promise<void> {
        await this.client.query(`ALTER TABLE ${tableName}\n` +
                                `ADD COLUMN ${columnName} ${type}`);
        vscode.window.showInformationMessage(`Added ${columnName} to ${tableName}`);
    }

    // TODO: function to return dbs
    // TODO: function to return tables
    // TODO: function to return columns
}

export class PgConnectionInfo {
    constructor(
        public host: string,
        public port: number,
        public database: string,
        public user: string,
        public password: string
    ) {}
};

export var pgColumnTypes = [
    {
        label: 'BigInt',
        description: 'BigInt (Int64)',
        queryName: 'BIGINT'
    },
    {
        label: 'char variable',
        description: 'char variable (varchar)',
        queryName: 'VARCHAR(50)'
    }
];