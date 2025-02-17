import vscode, { TextDocument } from "vscode";
import { Inline } from "../types/Inline";

const diagnosticName = "[Debugging AI Assistant]";
const diagnosticCollection: vscode.DiagnosticCollection = vscode.languages.createDiagnosticCollection(diagnosticName);

export class InlineDiagnostic implements Inline {

    file: vscode.Uri;
    range: vscode.Range;
    message: string;

    constructor(file: vscode.Uri, range: vscode.Range, message: string) {
        this.file = file;
        this.range = range;
        this.message = message;
    }

    public async show(): Promise<void> {
        // Create diagnostic
        const diagnostic = new vscode.Diagnostic(this.range, this.message, vscode.DiagnosticSeverity.Error);
        diagnostic.source = diagnosticName;
        diagnosticCollection.clear();
        diagnosticCollection.set(this.file, [diagnostic]);

        // Focus file
        const document: TextDocument = await vscode.workspace.openTextDocument(this.file);
        await vscode.window.showTextDocument(document);

        // Show expanded view
        for(let diagnostic of vscode.languages.getDiagnostics(this.file)) {
			vscode.commands.executeCommand("editor.action.marker.next");
			if(diagnostic.source === diagnosticName) break;
		}
    }

}