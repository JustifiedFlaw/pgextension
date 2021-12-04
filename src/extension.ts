import * as vscode from 'vscode';
import { pgColumnTypes, PgConnectionInfo, PgHelper } from "./pghelper";

export function activate(context: vscode.ExtensionContext) {
	var pgHelper: PgHelper | null = null;
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


	var lastTable = "";

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

	context.subscriptions.push(vscode.commands.registerCommand('pgextension.addColumn', async () => {
		var pgHelper = await getPgHelper(context);
		if (pgHelper) {
			let tableName = await vscode.window.showInputBox({ prompt: 'Table Name...', value: lastTable });
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

