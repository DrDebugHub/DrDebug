import * as vscode from 'vscode';
import { Inline } from './extension/Inline';

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('debugger.SendError', () => {
		const editor = vscode.window.activeTextEditor;
		if(editor){
			const inline = new Inline(editor.document.uri);
			inline.setDiagnostic("Test message", new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)));
		}
	});

	context.subscriptions.push(disposable);
}
export function deactivate() {}
