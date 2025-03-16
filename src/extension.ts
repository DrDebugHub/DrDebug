import * as vscode from "vscode";
import { initSettings } from "./settings";
import { InlineDiagnostic } from "./extension/InlineDiagnostic";
import { initTerminal, getTerminalOutput } from "./terminal";
import { OpenAICaller } from "./ai/OpenAICaller";
import { AIFeedback } from "./types/AIFeedback";
import { ProblemFile } from "./types/ProblemFile";

/**
 * The entry-point of the extension. Ran as soon as possible by VS Code given the extension
 * is added to the user's list of installed extensions. Provides necessary registration
 * logic like initializing settings, the terminal listener, commands, and menu options for
 * the extension.
 * @param context The extension context provided by the VS Code Extension loader
 */
export function activate(context: vscode.ExtensionContext) {
	initSettings();
	initTerminal();

	let lastResponse: AIFeedback | undefined;
	let lastInline: InlineDiagnostic | undefined;

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
			new OpenAICaller().sendRequest({ terminalOutput: getTerminalOutput() }).then(response => {
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
					lastInline = inline;
				} else {
					vscode.window.showErrorMessage("Failed to debug your code.");
				}
			});
		} else if(selectedOption === "Follow Up") {
			if(!lastResponse) {
				vscode.window.showInformationMessage("No previous debug session found. Run 'Debug' first.");
				return;
			}

			new OpenAICaller().followUp(lastResponse).then(followUpResponse => {
				if(followUpResponse !== undefined && followUpResponse.text !== undefined) {
					if (followUpResponse.fixed !== undefined && followUpResponse.fixed) {
						vscode.window.showInformationMessage(followUpResponse.text, { modal: true });
						lastInline?.hide();
					} else {
						const problemFile: ProblemFile = followUpResponse.problemFiles[0];
						const inline: InlineDiagnostic = new InlineDiagnostic(
							vscode.Uri.file(problemFile.fileName), 
							new vscode.Range(
								new vscode.Position(problemFile.line! - 1, 0), 
								new vscode.Position(problemFile.line! - 1, 0)), 
							followUpResponse.text);
						inline.show();
						lastInline = inline;
					}
					lastResponse = followUpResponse;
				} else {
					vscode.window.showErrorMessage("Failed to get a follow-up response.");
				}
			});
		}
	});

	context.subscriptions.push(askAI);
}

export function deactivate() {}