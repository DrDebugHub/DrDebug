import { ProblemFile } from "./ProblemFile";

export interface AIRequest {
    terminalOutput?: string;
    problemFiles?: ProblemFile[]
}