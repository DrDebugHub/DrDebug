import * as vscode from "vscode";
import { FakeCaller } from "./ai/FakeCaller";

export function activate(context: vscode.ExtensionContext) {
	// const organizationId: string = vscode.workspace.getConfiguration("debuggingAiAssistant").get("organizationId")!;
	// const projectId: string = vscode.workspace.getConfiguration("debuggingAiAssistant").get("projectId")!;
	// const apiKey: string = vscode.workspace.getConfiguration("debuggingAiAssistant").get("apiKey")!;

	// const openai = new OpenAI({
	// 	organization: organizationId,
	// 	project: projectId,
	// 	apiKey: apiKey
	// });

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('debuggingAiAssistant.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from Debugger!'!);
		new FakeCaller(context);
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}