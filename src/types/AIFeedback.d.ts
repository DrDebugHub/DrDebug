import { AIRequest } from "./AIRequest";
import { ProblemFile } from "./ProblemFile";

export interface AIFeedback {
    request: AIRequest;
    problemFiles: ProblemFile[];
    text?: string;
}