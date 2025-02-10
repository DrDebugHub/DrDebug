import { AIRequest } from "./AIRequest";
import { AIFeedback } from "./AIFeedback";

export interface APICaller {
    setKey(apiKey: string): void;
    isConnected(): boolean;
    sendRequest(request: AIRequest): AIFeedback;
    followUp(respone: AIFeedback, request: AIRequest): AIFeedback;
}