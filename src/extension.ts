import * as vscode from "vscode";
import { initSettings } from "./settings";
import { InlineDiagnostic } from "./extension/InlineDiagnostic";
import { initTerminal } from "./terminal";

export function activate(context: vscode.ExtensionContext) {
	initSettings();
	initTerminal();

	const sendError = vscode.commands.registerCommand("debuggingAiAssistant.sendError", () => {
		const file: vscode.Uri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri, "test.js");
		const inline: InlineDiagnostic = new InlineDiagnostic(file, new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)), "Test Message");
		inline.show();
	});

	context.subscriptions.push(sendError);
}

export function deactivate() {}