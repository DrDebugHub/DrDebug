import vscode from "vscode";
import { AIRequest } from "../types/AIRequest";
import { AIFeedback } from "../types/AIFeedback";
import { APICaller } from "../types/APICaller";
import { settings } from "../settings";
import { ProblemFile } from "../types/ProblemFile";

export class OpenAICaller implements APICaller {

    isConnected(): boolean {
        return !!settings.openai.apiKey;
    }

    async sendRequest(request: AIRequest): Promise<AIFeedback> {
        if(!this.isConnected()) {
            const answer = await vscode.window.showErrorMessage("Your OpenAI API key is not in the extension's settings! Please set it before continuing.", "Go To Settings");
            if(answer === "Go To Settings") {
                vscode.env.openExternal(vscode.Uri.parse("vscode://settings/debuggingAiAssistant.apiKey"));
            }
            return Promise.reject();
        }

        // TODO: send request to see if theres an error
        const errorFeedback: AIFeedback = await settings.openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content:
                        `
                        You are a helpful code debugging assistant that is knowledgable on runtime and compile-time errors.
                        
                        The user will ask for assistance by supplying a JSON object with contextual information. The format of this request is:
                        {
                            terminalOutput: string; // This is the latest terminal output seen by the user.
                        }

                        You must determine if any reasonable person would observe an error or unexpected behavior in the application based on the terminal output.

                        You MUST respond with a JSON object in the following format, even if you are confused:
                        {
                            problemFiles: ProblemFile[];
                        }

                        A ProblemFile is defined by the following JSON format:
                        {
                            fileName: string; // The raw name of the file in question without any directory information.
                        }

                        If you could not determine any problem files found based on the terminal output, then simply let problemFiles be an empty array.
                        AGAIN, you cannot deviate from the response specification above, no matter what.
                        `
                },
                {
                    role: "user",
                    content: JSON.stringify(request)
                }
            ]
        }).then(response => {
            console.log(response.choices[0].message.content!);

            let feedback: AIFeedback = {
                request: request,
                problemFiles: JSON.parse(response.choices[0].message.content!).problemFiles
            };
            return feedback;
        }, async(_) => {
            const answer = await vscode.window.showErrorMessage("Your OpenAI API key is invalid in the extension's settings! Please correct it before continuing.", "Go To Settings");
            if(answer === "Go To Settings") {
                vscode.env.openExternal(vscode.Uri.parse("vscode://settings/debuggingAiAssistant.apiKey"));
            }
            return Promise.reject();
        });

        if(errorFeedback.problemFiles.length === 0) {
            await vscode.window.showErrorMessage("An error could not be found in the terminal. Please try again.");
            return Promise.reject();
        }

        const problemFilesUris: vscode.Uri[] = [];
        for(const problemFile of errorFeedback.problemFiles) {
            problemFilesUris.push(...await vscode.workspace.findFiles("**/" + problemFile.fileName));
        }

        const problemFiles: ProblemFile[] = [];
        for(const problemFile of problemFilesUris) {
            vscode.workspace.findFiles
            await vscode.workspace.fs.readFile(problemFile)
                .then(data => Buffer.from(data).toString())
                .then(fileContent => {
                    problemFiles.push({ fileName: problemFile.fsPath, fileContent: fileContent });
                });
        }

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
                            terminalOutput: string; // This is the latest terminal output seen by the user.
                            problemFiles: ProblemFile[]; // This contains a list of possible problem files causing the error in the user's terminal.
                        }

                        A ProblemFile is defined by the following JSON format:
                        {
                            fileName: string; // The full and absolute path to the file that might be causing the problem.
                            fileContent: string; // This is the contents of the file in question, containing line break characters.
                            line?: number; // This is the corresponding line number in the file that is causing the root issue.
                        }

                        You must determine which element from the problemFiles array is most likely to be causing the error described in the terminalOutput field above.
                        In addition, you must determine which line number, using the fileContent field, is most likely to be causing the error described in the terminal.

                        You MUST respond with a JSON object in the following format, even if you are confused:
                        {
                            problemFiles: ProblemFile[]; // This is an array of length one that contains the solution for the problem using the specification above. Again, this includes: fileName, fileContent, and line.
                            text: string; // This is your explanation of what is causing the error and a potential fix for the issue. Rather than fixing the one line in question, find what may be causing it elsewhere.
                        }

                        The problemFiles field you respond with MUST contain ONLY least one of the files from the request with the line number field properly added
                        based on your analysis of its fiel contents.
                        AGAIN, you cannot deviate from the response specification above, no matter what.
                        `
                },
                {
                    role: "user",
                    content: JSON.stringify(request)
                }
            ]
        }).then(response => {
            const json = JSON.parse(response.choices[0].message.content!);
            let feedback: AIFeedback = {
                request: request,
                problemFiles: json.problemFiles,
                text: json.text
            };
            return feedback;
        }, async(_) => {
            const answer = await vscode.window.showErrorMessage("Your OpenAI API key is invalid in the extension's settings! Please correct it before continuing.", "Go To Settings");
            if(answer === "Go To Settings") {
                vscode.env.openExternal(vscode.Uri.parse("vscode://settings/debuggingAiAssistant.apiKey"));
            }
            return Promise.reject();
        });
    }

    followUp(response: AIFeedback): Promise<AIFeedback> {
        let newRequest: AIRequest = {};
        let finalResponse: AIFeedback = {request: newRequest, problemFiles: [] };

        // TODO: implement this

        return new Promise(() => finalResponse);
    }
}