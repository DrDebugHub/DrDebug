import * as vscode from 'vscode';
import { OpenAICaller } from './ai/OpenAICaller';
import { initSettings } from './settings';
import { Inline } from './extension/Inline';

export function activate(context: vscode.ExtensionContext) {
	initSettings();

	const callAI = vscode.commands.registerCommand('debuggingAiAssistant.callAI', () => {
		let caller = new OpenAICaller();
		caller.sendRequest({ prompt: "Why is print(123) not working in my file, test.js?" }).then(response => {
			vscode.window.showInformationMessage(`Response: ${response.text}`);
		});
	});

	const inlineMessage = vscode.commands.registerTextEditorCommand('debuggingAiAssistant.sendError', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const inline = new Inline(editor.document.uri);
			inline.setDiagnostic("Test message", new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)));
		}
	});

	context.subscriptions.push(callAI);
	context.subscriptions.push(inlineMessage);
}

export function deactivate() {}