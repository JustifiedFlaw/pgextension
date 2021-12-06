import * as vscode from 'vscode';
import { pgColumnTypes, PgConnectionInfo, PgHelper, PgTable } from "./pghelper";

export function activate(context: vscode.ExtensionContext) {
	var pgHelper: PgHelper | null = null;
	var lastTable: PgTable | null = null;
	
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
			// TODO: put lastTable first

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
			let schemaName = await vscode.window.showInputBox({ prompt: 'Schema Name...', value: 'public' });
			if (schemaName) {
				let tableName = await vscode.window.showInputBox({ prompt: 'Table Name...' });
				if (tableName) {
					lastTable = new PgTable(tableName, schemaName);			
					await pgHelper.createTable(lastTable);
				}
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
			let canceled = true;

			
			let table = await promptExistingTable();
			if (table) {
				lastTable = table;		
				
				do {
					canceled = true;
					let columnName = await vscode.window.showInputBox({ prompt: 'Column Name...' });
					if (columnName) {
						let type = await vscode.window.showQuickPick(pgColumnTypes);
						if (type) {
							await pgHelper.addColumn(table, columnName, type.queryName);
							canceled = false;
						}
					}
				} while (!canceled);
			}
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('pgextension.dropColumn', async () => {
		var pgHelper = await getPgHelper(context);
		if (pgHelper) {
			var table = await promptExistingTable();
			if (table) {
				lastTable = table;
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
				var status = vscode.window.setStatusBarMessage("Disconnecting...");
				await pgHelper.disconnect();
				status.dispose();
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
					let password = await vscode.window.showInputBox({ prompt: "Password", password: true });
					if (password) {
						return new PgConnectionInfo(host, port, database, user, password);
					}
				}
			}
		}
	}

	return null;
}
