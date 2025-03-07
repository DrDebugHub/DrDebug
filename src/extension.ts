import * as vscode from "vscode";
import { initSettings } from "./settings";
import { InlineDiagnostic } from "./extension/InlineDiagnostic";
import { initTerminal, getTerminalOutput } from "./terminal";
import { OpenAICaller } from "./ai/OpenAICaller";
import { AIFeedback } from "./types/AIFeedback";
import { ProblemFile } from "./types/ProblemFile";

export function activate(context: vscode.ExtensionContext) {
	initSettings();
	initTerminal();

	let lastResponse: AIFeedback | undefined;

	const askAI = vscode.commands.registerCommand("drDebug.askAI", async () => {
		const options = [
			"Debug",
			"Follow Up"
		];

		const selectedOption = await vscode.window.showQuickPick(options, {
			placeHolder: "Debug or Follow Up",
			canPickMany: false
		});

		if(selectedOption === "Debug") {
			let response = await new OpenAICaller().sendRequest({ terminalOutput: getTerminalOutput() });
		 	if(response !== undefined && response.problemFiles && response.text !== undefined) {
				const problemFile: ProblemFile = response.problemFiles[0];
				const inline: InlineDiagnostic = new InlineDiagnostic(
					vscode.Uri.file(problemFile.fileName), 
					new vscode.Range(
						new vscode.Position(problemFile.line! - 1, 0), 
						new vscode.Position(problemFile.line! - 1, 0)), 
					response.text);
				inline.show();
				lastResponse = response;
			} else {
				vscode.window.showErrorMessage("Failed to debug your code.");
			}
		} else if(selectedOption === "Follow Up") {
			if(!lastResponse) {
				vscode.window.showInformationMessage("No previous debug session found. Run 'Debug' first.");
				return;
			}

			let followUpResponse = await new OpenAICaller().followUp(lastResponse);
			if(followUpResponse !== undefined && followUpResponse.text !== undefined) {
				vscode.window.showInformationMessage(followUpResponse.text, { modal: true });
				lastResponse = followUpResponse;
			} else {
				vscode.window.showErrorMessage("Failed to get a follow-up response.");
			}
		}
	});

	context.subscriptions.push(askAI);
}

export function deactivate() {}