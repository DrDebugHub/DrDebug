import { AIRequest } from "./AIRequest";
import { AIResponse } from "./AIResponse";

export interface APICaller {
    setKey(apiKey: string): void;
    isConnected(): boolean;
    sendRequest(request: AIRequest): AIResponse;
    followUp(respone: AIResponse, request: AIRequest): AIResponse;
}