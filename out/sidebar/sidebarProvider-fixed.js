"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeLineSidebarProvider = void 0;
const vscode = __importStar(require("vscode"));
class CodeLineSidebarProvider {
    static viewType = 'codeline.chat';
    _view;
    _extension;
    _context;
    constructor(context, extension) {
        this._context = context;
        this._extension = extension;
    }
    resolveWebviewView(webviewView, context, _token) {
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
    _getWebviewContent() {
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
    show() {
        // 显示侧边栏的逻辑
        if (this._view) {
            this._view.show?.(true);
        }
    }
}
exports.CodeLineSidebarProvider = CodeLineSidebarProvider;
//# sourceMappingURL=sidebarProvider-fixed.js.map