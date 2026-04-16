import * as vscode from 'vscode';
export declare class CodeLineSidebarProvider implements vscode.WebviewViewProvider {
    static readonly viewType = "codeline.chat";
    private _view?;
    private _extension;
    constructor(context: vscode.ExtensionContext, extension: any);
    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken): void;
    private handleSendMessage;
    private getAIResponse;
    private _getWebviewContent;
    show(): void;
    sendMessageToChat(message: string): void;
    focusChatInput(): void;
}
//# sourceMappingURL=sidebarProvider-clean.d.ts.map