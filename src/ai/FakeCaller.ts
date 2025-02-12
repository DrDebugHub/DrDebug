import { AIRequest } from "./AIRequest";
import { AIFeedback } from "./AIFeedback";
import { APICaller } from "./APICaller";
import vscode, { Uri } from "vscode";

export class FakeCaller implements APICaller {

    constructor(context: vscode.ExtensionContext) {
        vscode.commands.executeCommand("vscode.openFolder", Uri.joinPath(context.extensionUri, "src", "test", "workspace"));
    }

    isConnected() {
        return true;
    }

    sendRequest(request: AIRequest): Promise<AIFeedback> {
        let response: AIFeedback = {request: request, text: ""}

        // TODO: implement this

        return new Promise(() => response);
    }

    followUp(response: AIFeedback): Promise<AIFeedback> {
        let newRequest: AIRequest = { prompt: "Test" };
        let finalResponse: AIFeedback = {request: newRequest, filename: response.filename, line: response.line, text: ""}

        // TODO: implement this

        return new Promise(() => finalResponse);
    }

}