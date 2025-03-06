import * as vscode from "vscode";
import { initSettings } from "./settings";
import { InlineDiagnostic } from "./extension/InlineDiagnostic";
import { initTerminal, getTerminalOutput } from "./terminal";
import { OpenAICaller } from "./ai/OpenAICaller";

export function activate(context: vscode.ExtensionContext) {
	initSettings();
	initTerminal();

	const askAI = vscode.commands.registerCommand("drDebug.askAI", async () => {
		const options = [
			"Debug",
			"Follow Up"
		];

		const selectedOption = await vscode.window.showQuickPick(options, {
			placeHolder: "Debug or follow up",
			canPickMany: false
		});

		if (!selectedOption) {
			return;
		}

		if (selectedOption == "Debug") {
			let response = (await new OpenAICaller().sendRequest({ terminalOutput: getTerminalOutput() }))
			if (response !== undefined && response.text !== undefined) {
				vscode.window.showInformationMessage(response.text, { modal: true });
			}
		}

		if (selectedOption == "Follow up") {
			// figure out how to get id of previous response (completion_id)
			// await new OpenAICaller().followUp(previous response)
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