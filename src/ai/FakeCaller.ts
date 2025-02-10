import { AIRequest } from "./AIRequest";
import { AIResponse } from "./AIResponse";
import { APICaller } from "./APICaller";
import fs from "fs";

class FakeCaller implements APICaller {
    // Used for testing APICaller without having to rely on the potentially variable or broken OpenAICaller
    private apiKey!: string;
    private file!: string;
    private line!: number;
    private text!: string;

    FakeCaller() {
        this.apiKey = "";
        this.file = "";
        this.line = -1;
        this.text = "";
    }

    setKey(apiKey: string) {
        this.apiKey = apiKey;
    }

    isConnected() {
        return !!this.apiKey;
    }

    sendRequest(request: AIRequest) {
        let response: AIResponse = {request: request, text: this.text}
        if (!!this.file)
            response.filename = this.file;
        if (this.line >= 0)
            response.line = this.line;
        return response;
    }

    followUp(response: AIResponse, request: AIRequest) {
        let finalResponse: AIResponse = {request: request, filename: response.filename, line: response.line, text: this.text}
        return finalResponse;
    }

    setFile(file: string) {
        if (fs.existsSync(file)) {
            this.file = file;
            return true;
        }
        return false;
    }

    getFile() {
        return this.file;
    }

    setLine(line: number) {
        if (Number.isInteger(line) && line >= 0) {
            this.line = line;
            return true;
        }
        return false;
    }

    getLine() {
        return this.line;
    }

    setText(text: string) {
        if (text != null) {
            this.text = text;
            return true;
        }
        return false;
    }
}