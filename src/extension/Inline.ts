import * as vscode from 'vscode';

export class Inline{
    private file: vscode.Uri;
    private static diagnosticCollection: vscode.DiagnosticCollection = vscode.languages.createDiagnosticCollection("collection");

    constructor(file: vscode.Uri){
        this.file = file;
    }

    public setDiagnostic(message: string, range: vscode.Range){
        const diagnostic = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error);
        Inline.diagnosticCollection.clear();
        Inline.diagnosticCollection.set(this.file, [diagnostic]);
    }
}