import { AIRequest } from "./AIRequest";

export interface AIFeedback {
    request: AIRequest;
    text: string;
    fileName?: string;
    line?: number;
}