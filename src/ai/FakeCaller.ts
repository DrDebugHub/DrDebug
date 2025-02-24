import { AIRequest } from "../types/AIRequest";
import { AIFeedback } from "../types/AIFeedback";
import { APICaller } from "../types/APICaller";
import vscode, { Uri } from "vscode";

export class FakeCaller implements APICaller {

    constructor(context: vscode.ExtensionContext) {
        vscode.commands.executeCommand("vscode.openFolder", Uri.joinPath(context.extensionUri, "src", "test", "workspace"));
    }

    isConnected() {
        return true;
    }

    sendRequest(request: AIRequest): Promise<AIFeedback> {
        let response: AIFeedback = {request: request, text: ""};

        // TODO: implement this
        return new Promise(() => response);
    }

    followUp(response: AIFeedback): Promise<AIFeedback> {
        let newRequest: AIRequest = {};
        let finalResponse: AIFeedback = {request: newRequest, fileName: response.fileName, line: response.line, text: ""};

        // TODO: implement this

        return new Promise(() => finalResponse);
    }

}