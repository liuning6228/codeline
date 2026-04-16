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
exports.TestSidebarProvider = void 0;
const vscode = __importStar(require("vscode"));
class TestSidebarProvider {
    _extension;
    static viewType = 'codeline.test-chat';
    _view;
    constructor(_extension) {
        this._extension = _extension;
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
            console.log('TestSidebar收到消息:', message);
            switch (message.command) {
                case 'test':
                    console.log('测试消息:', message.data);
                    vscode.window.showInformationMessage(`收到测试消息: ${message.data}`);
                    break;
                case 'sendMessage':
                    console.log('发送消息:', message.text);
                    vscode.window.showInformationMessage(`发送消息: ${message.text}`);
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
    <title>CodeLine Test</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            margin: 0;
            padding: 20px;
            background: #1e1e1e;
            color: #ffffff;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        
        h1 {
            color: #007acc;
            margin-bottom: 20px;
        }
        
        .button-group {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        
        button {
            background: #007acc;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s;
        }
        
        button:hover {
            background: #005a9e;
        }
        
        .log {
            background: #252526;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
            max-height: 200px;
            overflow-y: auto;
            font-family: monospace;
            font-size: 12px;
        }
        
        .log div {
            margin-bottom: 5px;
            padding: 3px 0;
            border-bottom: 1px solid #333;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>CodeLine - 全新测试版本</h1>
        <p>这是一个完全独立的测试版本，用于验证基本功能。</p>
        
        <div class="button-group">
            <button id="testBtn1">测试按钮 1</button>
            <button id="testBtn2">测试按钮 2</button>
            <button id="sendBtn">发送测试消息</button>
            <button id="alertBtn">显示弹窗</button>
        </div>
        
        <div class="log" id="log">
            <div>日志区域：</div>
        </div>
    </div>
    
    <script>
        // 简单日志函数
        function log(message) {
            const logElement = document.getElementById('log');
            const time = new Date().toLocaleTimeString();
            logElement.innerHTML += '<div>' + time + ': ' + message + '</div>';
            logElement.scrollTop = logElement.scrollHeight;
            console.log(time + ': ' + message);
        }
        
        // 初始化日志
        log('脚本开始执行');
        
        // 获取VS Code API
        let vscode;
        try {
            vscode = acquireVsCodeApi();
            log('VS Code API获取成功');
        } catch (error) {
            log('错误: ' + error.message);
            // 即使没有VS Code API，也允许按钮工作（用于测试）
            vscode = {
                postMessage: function(msg) {
                    console.log('模拟postMessage:', msg);
                }
            };
        }
        
        // 设置按钮事件
        document.getElementById('testBtn1').addEventListener('click', function() {
            log('测试按钮 1 被点击');
            vscode.postMessage({ command: 'test', data: '按钮1点击' });
        });
        
        document.getElementById('testBtn2').addEventListener('click', function() {
            log('测试按钮 2 被点击');
            vscode.postMessage({ command: 'test', data: '按钮2点击' });
        });
        
        document.getElementById('sendBtn').addEventListener('click', function() {
            log('发送按钮被点击');
            vscode.postMessage({ command: 'sendMessage', text: '测试消息内容' });
        });
        
        document.getElementById('alertBtn').addEventListener('click', function() {
            log('弹窗按钮被点击');
            alert('弹窗测试成功！');
        });
        
        log('所有按钮事件绑定完成');
        log('页面加载完成，可以测试按钮');
    </script>
</body>
</html>`;
    }
}
exports.TestSidebarProvider = TestSidebarProvider;
//# sourceMappingURL=testSidebar.js.map