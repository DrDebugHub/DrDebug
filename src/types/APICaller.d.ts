import { AIRequest } from "./AIRequest";
import { AIFeedback } from "./AIFeedback";

export interface APICaller {
    isConnected(): boolean;
    sendRequest(request: AIRequest): Promise<AIFeedback>;
    followUp(respone: AIFeedback): Promise<AIFeedback>;
}