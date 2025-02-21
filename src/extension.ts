import * as vscode from "vscode";
import { OpenAICaller } from "./ai/OpenAICaller";
import { initSettings } from "./settings";
import { InlineDiagnostic } from "./extension/InlineDiagnostic";

export function activate(context: vscode.ExtensionContext) {
	initSettings();

	const callAI = vscode.commands.registerCommand("debuggingAiAssistant.callAI", () => {
		let caller: OpenAICaller = new OpenAICaller();
		caller.sendRequest({ prompt: "Why is print(123) not working in my file, test.js?" }).then(response => {
			vscode.window.showInformationMessage(`Response: ${response.text}`);
		});
	});

	const sendError = vscode.commands.registerCommand("debuggingAiAssistant.sendError", () => {
		const file: vscode.Uri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri, "test.js");
		const inline: InlineDiagnostic = new InlineDiagnostic(file, new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)), "Test Message");
		inline.show();
	});

	vscode.window.onDidStartTerminalShellExecution(async (e) => {
		const stream = e.execution.read();
		for await (const data of stream) {
			console.log(data);
		}
	});

	context.subscriptions.push(callAI);
	context.subscriptions.push(sendError);
}

export function deactivate() {}