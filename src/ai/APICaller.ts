import { AIRequst } from "./AIRequest";
import { AIResponse } from "./AIResponse";

export interface APICaller {
    setKey(apiKey: string): void;
    isConnected(): boolean;
    sendRequest(request: AIRequst): AIResponse;
    followUp(respone: AIResponse, request: AIRequst): AIResponse;
}