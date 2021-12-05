import * as vscode from 'vscode';
import { pgColumnTypes, PgConnectionInfo, PgHelper, PgTable } from "./pghelper";

export function activate(context: vscode.ExtensionContext) {
	var pgHelper: PgHelper | null = null;
	var lastTable = "";
	
	async function getPgHelper(context: vscode.ExtensionContext) : Promise<PgHelper | null> {
		if (!pgHelper) {
			var connectionInfo = context.globalState.get("pgConnectionInfo") as PgConnectionInfo | null;
			if (!connectionInfo) {
				connectionInfo = await promptConnectionInfo();
		
				if (connectionInfo) {
					context.globalState.update("pgConnectionInfo", connectionInfo);
				}
			}

			if (connectionInfo) {
				pgHelper = new PgHelper(connectionInfo);
			}
		}
		
		return pgHelper;
	}

	async function promptExistingTable() : Promise<PgTable | null> {
		var pgHelper = await getPgHelper(context);
		if (pgHelper) {
			const tables = await pgHelper.getTables();
			const options = tables.map(t => {
				return { label: t.tableName, table: t };
			});

			var selection = await vscode.window.showQuickPick(options);
			if (selection) {
				return selection.table;
			}
		}

		return null;
	}

	async function promptExistingColumn(table: PgTable) : Promise<string | null> {
		var pgHelper = await getPgHelper(context);
		if (pgHelper) {
			const columnNames = await pgHelper.getColumns(table);
			const options = columnNames.map(c => {
				return { label: c };
			});

			var selection = await vscode.window.showQuickPick(options);
			if (selection) {
				return selection.label;
			}
		}

		return null;
	}


	context.subscriptions.push(vscode.commands.registerCommand('pgextension.createTable', async () => {
		var pgHelper = await getPgHelper(context);
		if (pgHelper) {
			let tableName = await vscode.window.showInputBox({ prompt: 'Table Name...' });
			if (tableName) {
				lastTable = tableName;			
				await pgHelper.createTable(tableName);
			}
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('pgextension.dropTable', async () => {
		var pgHelper = await getPgHelper(context);
		if (pgHelper) {
			var table = await promptExistingTable();
			if (table) {
				await pgHelper.dropTable(table);
			}
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('pgextension.addColumn', async () => {
		var pgHelper = await getPgHelper(context);
		if (pgHelper) {
			var tableName:  string | undefined;
			if (lastTable === "") {
				let table = await promptExistingTable();
				tableName = table?.tableName ?? undefined;
			}
			else {
				tableName = await vscode.window.showInputBox({ prompt: 'Table Name...', value: lastTable });
			}
			if (tableName) {
				lastTable = tableName;		
				let columnName = await vscode.window.showInputBox({ prompt: 'Column Name...' });
				if (columnName) {
					let type = await vscode.window.showQuickPick(pgColumnTypes);
					if (type) {
						await pgHelper.addColumn(tableName, columnName, type.queryName);					
					}
				}
			}
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('pgextension.dropColumn', async () => {
		var pgHelper = await getPgHelper(context);
		if (pgHelper) {
			var table = await promptExistingTable();
			if (table) {
				var columnName = await promptExistingColumn(table);
				if (columnName) {
					await pgHelper.dropColumn(table, columnName);
				}
			}
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('pgextension.connection', async () => {
		var connectionInfo = await promptConnectionInfo();
		if (connectionInfo) {
			if (pgHelper) { 
				//TODO: show disconnecting in status bar
				await pgHelper.disconnect();
			}

			context.globalState.update("pgConnectionInfo", connectionInfo);
			pgHelper = new PgHelper(connectionInfo);
		}
	}));
}

export function deactivate() {}

async function promptConnectionInfo(): Promise<PgConnectionInfo | null> {
	let host = await vscode.window.showInputBox({prompt: "Host", value: "localhost"});
	if (host) {
		let portStr = await vscode.window.showInputBox({prompt: "Port", value: "5432"});
		if (portStr) {
			let port = parseInt(portStr);
			let database = await vscode.window.showInputBox({ prompt: "Database" });
			if (database) {
				let user = await vscode.window.showInputBox({ prompt: "User" });
				if (user) {
					let password = await vscode.window.showInputBox({ prompt: "Password" }); //TODO hide input
					if (password) {
						return new PgConnectionInfo(host, port, database, user, password);
					}
				}
			}
		}
	}

	return null;
}
