import { AIRequest } from "./AIRequest";

export interface AIFeedback {
    request: AIRequest;
    filename?: String;
    line?: number;
    text: string;
}