import * as vscode from "vscode";
import { initSettings } from "./settings";
import { InlineDiagnostic } from "./extension/InlineDiagnostic";
import { initTerminal, getTerminalOutput } from "./terminal";
import { OpenAICaller } from "./ai/OpenAICaller";
import { ProblemFile } from "./types/ProblemFile";

export function activate(context: vscode.ExtensionContext) {
	initSettings();
	initTerminal();

	const askAI = vscode.commands.registerCommand("drDebug.askAI", async () => {
		let response = await new OpenAICaller().sendRequest({ terminalOutput: getTerminalOutput() });
		if (response !== undefined && response.problemFiles && response.text !== undefined) {
			const problemFile: ProblemFile = response.problemFiles[0]
			const inline: InlineDiagnostic = new InlineDiagnostic(vscode.Uri.file(problemFile.fileName), 
				new vscode.Range(
					new vscode.Position(problemFile.line! - 1, 0), 
					new vscode.Position(problemFile.line! - 1, 0)), 
				response.text);
			inline.show();
		}
	});

	const sendError = vscode.commands.registerCommand("drDebug.sendError", () => {
		const file: vscode.Uri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri, "test.js");
		const inline: InlineDiagnostic = new InlineDiagnostic(file, new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)), "Test Message");
		inline.show();
	});

	context.subscriptions.push(askAI);
	context.subscriptions.push(sendError);
}

export function deactivate() {}