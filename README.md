# DrDebug

DrDebug is an integrated tool that can intelligently suggest fixes and assist with debugging code. It supports the software developing workflow by suggesting fixes for existing errors and pointing out potential issues and fixes that lead to various compile-time or runtime errors.

## Features

### Native VS Code Support 
The application should be directly integrated into the VS Code editor to support a variety of development workflows and programming languages. The debugging assistant will be built-in as an extension for the code editor.

### Terminal Access
The extension should have read permissions on the user's terminal so that it can respond to various debugging requests with all relevant information.

### File System Acces
The extension should have read permissions on the user's open workspace so that it can use it as context for assisting the user with debugging their projects.

### AI Integration
Under the hood, the extension should be able to communicate with an AI model that will have the capability to cognitively understand and parse complex coding projects.

### Debug Command
The extension should provide a debug button somewhere convenient in the editor to ask an AI model, with context of their project, what the possible issue may be with their code. This command can also be invoked via a keyboard shortcut.

### Debug Feedback
The AI model should promptly navigate the user to the file & file line of interest with a dialog message on the issue in their codebase. The feedback will suggest possible quick fixes or highlight issues with the current approach taken.

### Debug Follow-Up
After the user amends an issue in their codebase after running the Debug Command, then an option to ask the AI model again will be present.

## Requirements

### OpenAI API Key
An OpenAI API Key is required to use this extension. The API Key can be entered in the extension settings.

<!-- ## Known Issues -->


## Release Notes

### v0.0.1
Initial release

### v0.0.2
Debugger reads output in terminal and gives feedback if an error is found.

### Future Releases
Future features include inline feedback, follow-up button, and a keyboard shortcut.