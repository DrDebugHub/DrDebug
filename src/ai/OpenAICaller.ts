import { AIRequst } from "./AIRequest";
import { AIResponse } from "./AIResponse";
import { APICaller } from "./APICaller";

class OpenAICaller implements APICaller {
    // Used for making API calls to OpenAI in a simple format for the rest of the code to use
        private apiKey!: string;
    
        OpenAICaller() {
            this.apiKey = "";
        }
        
        setKey(apiKey: string) {
            this.apiKey = apiKey;
        }
    
        isConnected() {
            // TODO: implement this

            return false;
        }
    
        sendRequest(request: AIRequst) {
            let response: AIResponse = {request: request, text: ""}

            // TODO: implement this

            return response;
        }
    
        followUp(response: AIResponse, request: AIRequst) {
            let finalResponse: AIResponse = {request: request, filename: response.filename, line: response.line, text: ""}

            // TODO: implement this

            return finalResponse;
        }
}