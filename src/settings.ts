import vscode from "vscode";
import { Settings } from "./types/Settings";
import OpenAI from "openai";

export let settings: Settings;

export function initSettings(): void {
    settings = {
        openai: new OpenAI({ apiKey: vscode.workspace.getConfiguration("drDebug").get("apiKey")! })
    };

    vscode.workspace.onDidChangeConfiguration(event => {
        if(event.affectsConfiguration("drDebug.apiKey")) {
            settings.openai.apiKey = vscode.workspace.getConfiguration("drDebug").get("apiKey")!;
        }
    });
} 