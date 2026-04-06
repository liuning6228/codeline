import * as vscode from 'vscode';

export class CodeLineSidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'codeline.chat';
    
    private _view?: vscode.WebviewView;
    private _extension: any;
    private _context: vscode.ExtensionContext;
    
    constructor(context: vscode.ExtensionContext, extension: any) {
        this._context = context;
        this._extension = extension;
    }
    
    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;
        
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: []
        };
        
        webviewView.webview.html = this._getWebviewContent();
        
        // 处理来自WebView的消息
        webviewView.webview.onDidReceiveMessage(async (message) => {
            console.log('Sidebar收到消息:', message);
            switch (message.command) {
                case 'sendMessage':
                    console.log('发送消息:', message.text);
                    break;
                case 'test':
                    console.log('测试消息:', message.data);
                    vscode.window.showInformationMessage(`收到测试消息: ${message.data}`);
                    break;
            }
        });
    }
    
    private _getWebviewContent(): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeLine - 修复版本</title>
    <style>
        body {
            font-family: sans-serif;
            padding: 20px;
            background: #1e1e1e;
            color: white;
        }
        button {
            margin: 10px;
            padding: 10px 20px;
            background: #007acc;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background: #005a9e;
        }
    </style>
</head>
<body>
    <h1>CodeLine - 修复版本</h1>
    <p>这是一个完全修复的版本</p>
    
    <button id="testBtn">测试按钮</button>
    <button id="sendBtn">发送消息</button>
    
    <script>
        console.log('修复版本脚本开始执行');
        
        const vscode = acquireVsCodeApi();
        
        document.getElementById('testBtn').addEventListener('click', function() {
            console.log('测试按钮被点击');
            vscode.postMessage({ command: 'test', data: '按钮点击测试' });
        });
        
        document.getElementById('sendBtn').addEventListener('click', function() {
            console.log('发送按钮被点击');
            vscode.postMessage({ command: 'sendMessage', text: '测试消息' });
        });
        
        console.log('脚本加载完成');
    </script>
</body>
</html>`;
    }
    
    public show() {
        // 显示侧边栏的逻辑
        if (this._view) {
            this._view.show?.(true);
        }
    }
}