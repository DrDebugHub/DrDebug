import { AIRequst } from "./AIRequest";

export interface AIResponse {
    request: AIRequst;
    filename?: String;
    line?: number;
    text: string;
}