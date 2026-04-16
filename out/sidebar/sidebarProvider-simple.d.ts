import * as vscode from 'vscode';
export declare class SimpleSidebarProvider implements vscode.WebviewViewProvider {
    private readonly _extension;
    static readonly viewType = "codeline.chat-simple";
    private _view?;
    constructor(_extension: any);
    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken): void;
    private _getWebviewContent;
}
//# sourceMappingURL=sidebarProvider-simple.d.ts.map