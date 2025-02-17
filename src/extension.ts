import * as vscode from "vscode";
import { OpenAICaller } from "./ai/OpenAICaller";
import { initSettings } from "./settings";

export function activate(context: vscode.ExtensionContext) {
	initSettings();

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('debuggingAiAssistant.helloWorld', () => {
		let caller = new OpenAICaller();
		caller.sendRequest({ prompt: "Why is print(123) not working in my file, test.js?" }).then(response => {
			vscode.window.showInformationMessage(`Response: ${response.text}`);
		});
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}