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
        this.cleanMessage();

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
			if(diagnostic.source === diagnosticName) {
                break;
            }
		}
    }

    public async hide(): Promise<void> {
        diagnosticCollection.clear();
    }

    private cleanMessage(): void {
        let result = "";
        let lineLength = 0;
        for(const word of this.message.split(" ")) {
            if(lineLength + word.length <= 80) {
                result += word + " ";
                lineLength += word.length + 1;
            } else {
                result += "\n" + word + " ";
                lineLength = word.length + 1;
            }
        }
        this.message = result;
    }

}