import { AIRequest } from "../types/AIRequest";
import { AIFeedback } from "../types/AIFeedback";
import { APICaller } from "../types/APICaller";
import { settings } from "../settings";

export class OpenAICaller implements APICaller {

    isConnected(): boolean {
        return !!settings.openai.apiKey;
    }

    async sendRequest(request: AIRequest): Promise<AIFeedback> {
        // TODO: implement this
        return settings.openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: 
                        `
                        You are a helpful code debugging assistant that is knowledgable on runtime and compile-time errors.
                        
                        The user will ask for assistance by supplying a JSON object with contextual information. The format of this request is:
                        {
                            prompt: string; // This is the message of assistance sent by the user.
                        }

                        You must analyze their issue and all contextual information to eliminate the issue altogether. You MUST respond with a JSON object in the following format, even if you are confused:
                        {
                            text: string; // Your solution and reasoning goes here.
                        }

                        Again, you CANNOT deviate from this request/response communication protocol defined above.
                        `
                },
                {
                    role: "user",
                    content: 
                        `
                        {
                            "prompt": "${request.prompt}"
                        }
                        `
                }
            ]
        }).then(response => {
            let feedback: AIFeedback = {
                request: request,
                text: response.choices[0].message.content!
            };
            return feedback;
        });
    }

    followUp(response: AIFeedback): Promise<AIFeedback> {
        let newRequest: AIRequest = { prompt: "Test" };
        let finalResponse: AIFeedback = {request: newRequest, filename: response.filename, line: response.line, text: ""}

        // TODO: implement this

        return new Promise(() => finalResponse);
    }
}