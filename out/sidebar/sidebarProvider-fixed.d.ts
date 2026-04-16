import * as vscode from 'vscode';
export declare class CodeLineSidebarProvider implements vscode.WebviewViewProvider {
    static readonly viewType = "codeline.chat";
    private _view?;
    private _extension;
    private _context;
    constructor(context: vscode.ExtensionContext, extension: any);
    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken): void;
    private _getWebviewContent;
    show(): void;
}
//# sourceMappingURL=sidebarProvider-fixed.d.ts.map