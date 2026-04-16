import * as vscode from 'vscode';
export declare class TestSidebarProvider implements vscode.WebviewViewProvider {
    private readonly _extension;
    static readonly viewType = "codeline.test-chat";
    private _view?;
    constructor(_extension: any);
    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken): void;
    private _getWebviewContent;
}
//# sourceMappingURL=testSidebar.d.ts.map