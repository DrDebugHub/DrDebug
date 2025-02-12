import { AIRequest } from "./AIRequest";
import { AIFeedback } from "./AIFeedback";
import { APICaller } from "./APICaller";
import OpenAI from "OpenAI";

class OpenAICaller implements APICaller {

    private openai: OpenAI;

    constructor(openai: OpenAI) {
        this.openai = openai;
    }

    isConnected(): boolean {
        return !!this.openai.organization && !!this.openai.project && !!this.openai.apiKey!;
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