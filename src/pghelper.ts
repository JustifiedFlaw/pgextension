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

    async createTable(table: PgTable): Promise<void> {
        await this.client.query(`CREATE TABLE IF NOT EXISTS "${table.schemaName}"."${table.tableName}" (Id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY)`);
        vscode.window.showInformationMessage(`Created table ${table.schemaName}.${table.tableName}`);
    }

    async dropTable(table: PgTable): Promise<void> {
        await this.client.query(`DROP TABLE "${table.schemaName}"."${table.tableName}"`);
        vscode.window.showInformationMessage(`Droped table ${table.schemaName}.${table.tableName}`);
    }

    async addColumn(table: PgTable, columnName: string, type: string): Promise<void> {
        await this.client.query(`ALTER TABLE "${table.schemaName}"."${table.tableName}"\n` +
                                `ADD COLUMN ${columnName} ${type}`);
        vscode.window.showInformationMessage(`Added ${columnName} to ${table.schemaName}.${table.tableName}`);
    }

    async dropColumn(table: PgTable, columnName: string): Promise<void> {
        await this.client.query(`ALTER TABLE "${table.schemaName}"."${table.tableName}"\n` +
                                `DROP COLUMN ${columnName}`);
        vscode.window.showInformationMessage(`Droped ${columnName} of ${table.schemaName}.${table.tableName}`);
    }

    async getTables(): Promise<PgTable[]> {
        const query = "SELECT * FROM pg_catalog.pg_tables " + 
                    "WHERE schemaname != 'pg_catalog' " + 
                    "AND schemaname != 'information_schema';";
        var result = await this.client.query(query);
        return result.rows.map(r => new PgTable(r.tablename, r.schemaname));
    }

    async getColumns(table: PgTable): Promise<string[]> {
        const query = "SELECT column_name as columnname " +
                    "FROM information_schema.columns " +
                    "WHERE table_schema = $1 " +
                    "AND table_name = $2;";
        var result = await this.client.query(query, [table.schemaName, table.tableName]);
        return result.rows.map(r => r.columnname);
    }

    async disconnect() {
        await this.client.end();
    }
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

export class PgTable {
    constructor(
        public tableName: string,
        public schemaName: string
    ) {
        
    }
}

export var pgColumnTypes = [
    { 
        label: 'bigint',
        description: 'bigint',
        queryName: 'bigint'
    },
    { 
        label: 'bigserial',
        description: 'bigserial',
        queryName: 'bigserial'
    },
    { 
        label: 'bit',
        description: 'bit',
        queryName: 'bit'
    },
    { 
        label: 'bit varying',
        description: 'bit varying',
        queryName: 'bit varying'
    },
    { 
        label: 'boolean',
        description: 'boolean',
        queryName: 'boolean'
    },
    { 
        label: 'box',
        description: 'box',
        queryName: 'box'
    },
    { 
        label: 'bytea',
        description: 'bytea',
        queryName: 'bytea'
    },
    { 
        label: 'character',
        description: 'character',
        queryName: 'char'
    },
    { 
        label: 'character varying',
        description: 'character varying',
        queryName: 'varchar'
    },
    { 
        label: 'cidr',
        description: 'cidr',
        queryName: 'cidr'
    },
    { 
        label: 'circle',
        description: 'circle',
        queryName: 'circle'
    },
    { 
        label: 'date',
        description: 'date',
        queryName: 'date'
    },
    { 
        label: 'double',
        description: 'double',
        queryName: 'double precision'
    },
    { 
        label: 'inet',
        description: 'inet',
        queryName: 'inet'
    },
    { 
        label: 'integer',
        description: 'integer',
        queryName: 'integer'
    },
    { 
        label: 'interval',
        description: 'interval',
        queryName: 'interval'
    },
    { 
        label: 'json',
        description: 'json',
        queryName: 'json'
    },
    { 
        label: 'jsonb',
        description: 'jsonb',
        queryName: 'jsonb'
    },
    { 
        label: 'line',
        description: 'line',
        queryName: 'line'
    },
    { 
        label: 'lseg',
        description: 'lseg',
        queryName: 'lseg'
    },
    { 
        label: 'macaddr',
        description: 'macaddr',
        queryName: 'macaddr'
    },
    { 
        label: 'money',
        description: 'money',
        queryName: 'money'
    },
    { 
        label: 'numeric',
        description: 'numeric',
        queryName: 'numeric'
    },
    { 
        label: 'path',
        description: 'path',
        queryName: 'path'
    },
    { 
        label: 'pg_lsn',
        description: 'pg_lsn',
        queryName: 'pg_lsn'
    },
    { 
        label: 'point',
        description: 'point',
        queryName: 'point'
    },
    { 
        label: 'polygon',
        description: 'polygon',
        queryName: 'polygon'
    },
    { 
        label: 'real',
        description: 'real',
        queryName: 'real'
    },
    { 
        label: 'smallint',
        description: 'smallint',
        queryName: 'smallint'
    },
    { 
        label: 'smallserial',
        description: 'smallserial',
        queryName: 'smallserial'
    },
    { 
        label: 'serial',
        description: 'serial',
        queryName: 'serial'
    },
    { 
        label: 'text',
        description: 'text',
        queryName: 'text'
    },
    { 
        label: 'time without time zone',
        description: 'time without time zone',
        queryName: 'time without time zone'
    },
    { 
        label: 'time with time zone',
        description: 'time with time zone',
        queryName: 'time with time zone'
    },
    { 
        label: 'timestamp without time zone',
        description: 'timestamp without time zone',
        queryName: 'timestamp without time zone'
    },
    { 
        label: 'timestamp with time zone',
        description: 'timestamp with time zone',
        queryName: 'timestamp with time zone'
    },
    { 
        label: 'tsquery',
        description: 'tsquery',
        queryName: 'tsquery'
    },
    { 
        label: 'tsvector',
        description: 'tsvector',
        queryName: 'tsvector'
    },
    { 
        label: 'txid_snapshot',
        description: 'txid_snapshot',
        queryName: 'txid_snapshot'
    },
    { 
        label: 'uuid',
        description: 'uuid',
        queryName: 'uuid'
    },
    { 
        label: 'xml',
        description: 'xml',
        queryName: 'xml'
    },
];