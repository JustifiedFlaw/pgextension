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

    async dropTable(tableName: string): Promise<void> {
        await this.client.query(`DROP TABLE ${tableName}`);
        vscode.window.showInformationMessage(`Droped table ${tableName}`);
    }

    async addColumn(tableName: string, columnName: string, type: string): Promise<void> {
        await this.client.query(`ALTER TABLE ${tableName}\n` +
                                `ADD COLUMN ${columnName} ${type}`);
        vscode.window.showInformationMessage(`Added ${columnName} to ${tableName}`);
    }

    async getTables(): Promise<string[]> {
        const query = "SELECT * FROM pg_catalog.pg_tables " + 
                    "WHERE schemaname != 'pg_catalog' " + 
                    "AND schemaname != 'information_schema';";
        var result = await this.client.query(query);
        return result.rows.map(r => r.tablename);
    }

    // TODO: function to return dbs
    // TODO: function to return columns

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
    // { 
    //     label: 'interval',
    //     description: 'interval',
    //     queryName: 'interval [ fields ] [ (p) ]'
    // },
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
    // { 
    //     label: 'numeric',
    //     description: 'numeric',
    //     queryName: 'numeric [ (p, s) ]'
    // },
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