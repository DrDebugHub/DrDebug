export interface AIRequest {
    prompt: string;
    errorMessage?: string; // no clue how this would actually be send format wise. change later.
    fileStructure?: string[]; // maybe stored like this, but doesn't give file contents so who knows :D
    terminalOutput?: string;
}