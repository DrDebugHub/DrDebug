import vscode from "vscode";

export interface Inline {
    file: vscode.Uri,
    range: vscode.Range,
    message: string,
    show(): void
}