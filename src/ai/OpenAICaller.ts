import vscode, { ProgressLocation } from "vscode";
import { AIRequest } from "../types/AIRequest";
import { AIFeedback } from "../types/AIFeedback";
import { APICaller } from "../types/APICaller";
import { settings } from "../settings";
import { ProblemFile } from "../types/ProblemFile";
import { APIError } from "openai";

export class OpenAICaller implements APICaller {

    isConnected(): boolean {
        return !!settings.openai.apiKey;
    }

    /**
     * Handles when an error is found when making API calls.
     * Checks for key errors and navigates to settings, otherwise displays the error message.
     * @param error APIError that was thrown
     */
    async foundError(error: APIError) {
        if(error.status == 401) {
            var answer;
            if(error.code === 'invalid_api_key') {
                answer = await vscode.window.showErrorMessage("Your OpenAI API key is incorrect. Please correct it in settings before continuing.", "Go To Settings");
            } else {
                answer = await vscode.window.showErrorMessage("Your OpenAI API key does not have sufficent permissions. Please update the key in settings before continuing.", "Go To Settings");
            }
            if(answer === "Go To Settings") {
                vscode.env.openExternal(vscode.Uri.parse("vscode://settings/drDebug.apiKey"));
            }
        } else {
            vscode.window.showErrorMessage(error.message);
        }
    }
    
    /**
     * Asks the AI the reason for an error to occur, determining what to fix and where to display the feedback.
     * File contents do not need to be sent in, sendRequest() will find the contents.
     * @param request AIRequest containing information about the error that occured
     * @returns Promise<AIFeedback> The feedback from the AI about where the error is and how it should be fixed
     */
    async sendRequest(request: AIRequest): Promise<AIFeedback> {
        if(!this.isConnected()) {
            const answer = await vscode.window.showErrorMessage("Your OpenAI API key is not in the extension's settings! Please set it before continuing.", "Go To Settings");
            if(answer === "Go To Settings") {
                vscode.env.openExternal(vscode.Uri.parse("vscode://settings/drDebug.apiKey"));
            }
            return Promise.reject();
        }
        var progressMessage: string = "Checking For Error";
        var done = false;
        void vscode.window.withProgress(
            {
                location: ProgressLocation.Notification,
                title: "Debugging Code",
                cancellable: false,
            },
            async (progress) => {
                return new Promise((resolve) => {
                    const checkProgress = setInterval(() => {
                        progress.report({ message: progressMessage });
                        if (done) {
                            clearInterval(checkProgress);
                            resolve("Completed!");
                        }
                    }, 500);
                });
            }
        );

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
            let feedback: AIFeedback = {
                request: request,
                problemFiles: JSON.parse(response.choices[0].message.content!).problemFiles
            };
            return feedback;
        }, async(error) => {
            done = true;
            await this.foundError(error);
            return Promise.reject();
        });

        if(done) {
            return Promise.reject();
        }

        if(errorFeedback.problemFiles.length === 0) {
            done = true;
            await vscode.window.showWarningMessage("An error could not be found in the terminal. Please try again.");
            return Promise.reject();
        }
        
        progressMessage = "Error Found, Debugging...";

        const problemFilesUris: vscode.Uri[] = [];
        for(const problemFile of errorFeedback.problemFiles) {
            problemFilesUris.push(...await vscode.workspace.findFiles("**/" + problemFile.fileName));
        }

        const problemFiles: ProblemFile[] = [];
        for(const problemFile of problemFilesUris) {
            await vscode.workspace.fs.readFile(problemFile)
                .then(data => Buffer.from(data).toString())
                .then(fileContent => {
                    problemFiles.push({ fileName: problemFile.fsPath, fileContent: fileContent });
                });
        }
        request.problemFiles = problemFiles;

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
            done = true;
            return {
                request: request,
                problemFiles: json.problemFiles,
                text: json.text
            };
        }, async(error) => {
            done = true;
            await this.foundError(error);
            return Promise.reject();
        });
    }

    /**
     * Asks the AI about changes made to the problem files and determines whether the changes should fix the issue or if more changes are needed.
     * @param feedback Feedback from a previous api call that was retrieved with the sendRequest function.
     * @returns Promise<AIFeedback> with new feedback regarding changes made and whether it should fix the issue.
     */
    async followUp(feedback: AIFeedback): Promise<AIFeedback> {
        // Ensuring API Key not blank
        if(!this.isConnected()) {
            const answer = await vscode.window.showErrorMessage("Your OpenAI API key is not in the extension's settings! Please set it before continuing.", "Go To Settings");
            if(answer === "Go To Settings") {
                vscode.env.openExternal(vscode.Uri.parse("vscode://settings/drDebug.apiKey"));
            }
            return Promise.reject();
        }

        // Create Progress Bar
        var progressMessage: string = "Retrieving Updated Files";
        var done = false;
        void vscode.window.withProgress(
            {
                location: ProgressLocation.Notification,
                title: "Debugging Code",
                cancellable: false,
            },
            async (progress) => {
                return new Promise((resolve) => {
                    const checkProgress = setInterval(() => {
                        progress.report({ message: progressMessage });
        
                        if (done) {
                            clearInterval(checkProgress);
                            resolve("Completed!");
                        }
                    }, 500);
                });
            }
        );

        // Get list of the new file contents from the old list of files
        const problemFiles: ProblemFile[] = [];
        if (feedback.request.problemFiles != undefined) {
            for(const problemFile of feedback.request.problemFiles) {
                problemFile.fileName
                
                await vscode.workspace.fs.readFile(vscode.Uri.file(problemFile.fileName))
                    .then(data => Buffer.from(data).toString())
                    .then(fileContent => {
                        problemFiles.push({ fileName: problemFile.fileName, fileContent: fileContent });
                    });
            }
        }

        progressMessage = "Reviewing Updated Contents";

        // Ask the AI for feedback
        return settings.openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content:
                        `
                        You are a helpful code debugging assistant that is knowledgable on runtime and compile-time errors.

                        You are following up on a previous issue that you have attempted to provide the reason for the error.
                        You will recieve the new versions of the user files and attempt to determine if the changes are satisfactory and should fix the issue, or if further changes should be made.
                        Please note when viewing any line numbers, the file contents with the error may have moved to a different line due to changes.

                        The user will ask for assistance by supplying a JSON object with contextual information. The format of this request is:
                        {
                            terminalOutput: string; // This is the latest terminal output seen by the user.
                            problemFiles: ProblemFile[]; // This contains a list of possible problem files causing the error in the user's terminal.
                            previousResponse: // This is your previous response about what the error was
                        }

                        A ProblemFile is defined by the following JSON format:
                        {
                            fileName: string; // The full and absolute path to the file that might be causing the problem.
                            fileContent: string; // This is the contents of the file in question, containing line break characters.
                            line?: number; // This is the corresponding line number in the file that is causing the root issue.
                        }

                        You must determine whether the changes should fix the previous error, or if more fixes are necessary. If more fixes are necessary, what should be changed.

                        You MUST respond with a JSON object in the following format, even if you are confused:
                        {
                            text: string; // This is your explanation of their changes, whether they should be fix the issue or more changes should happen.
                        }

                        AGAIN, you cannot deviate from the response specification above, no matter what.
                        `
                },
                {
                    role: "user",
                    content: JSON.stringify({"terminalOutput": feedback.request.terminalOutput, "problemFiles": problemFiles, "previousResponse": feedback.text})
                }
            ]
        }).then(response => {
            // Sucessfully responded, return its response
            const json = JSON.parse(response.choices[0].message.content!);
            done = true;
            return {
                request: feedback.request,
                problemFiles: json.problemFiles,
                text: json.text
            };
        }, async(error) => {
            // Failed to respond, likely caused by an invalid key
            done = true;
            await this.foundError(error);
            return Promise.reject();
        });
    }
}