import vscode from "vscode";
import { Terminal } from "./types/Terminal";
import { LinkedList } from "linked-list-typescript";

const MAX_NUMBER_LINES = 10;
let terminal: Terminal;

export function initTerminal(): void {
    terminal = { lines: new LinkedList<string>() };

    vscode.window.onDidStartTerminalShellExecution(async (e) => {
		const stream = e.execution.read();
		for await (const data of stream) {
			terminal.lines.append(data);
            if(terminal.lines.length > MAX_NUMBER_LINES) {
                terminal.lines.removeHead();
            }
		}
	});
}

export function getTerminalOutput(): string {
    return terminal.lines.toArray().join("");
}