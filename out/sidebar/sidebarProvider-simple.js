"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleSidebarProvider = void 0;
class SimpleSidebarProvider {
    _extension;
    static viewType = 'codeline.chat-simple';
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
            switch (message.command) {
                case 'test':
                    console.log('收到测试消息:', message.data);
                    break;
                case 'switchView':
                    console.log('切换视图到:', message.view);
                    break;
                case 'sendMessage':
                    console.log('发送消息:', message.text);
                    break;
            }
        });
    }
    _getWebviewContent() {
        const isConfigured = this._extension.getModelAdapter().isReady();
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                        margin: 0;
                        padding: 20px;
                        background: #1e1e1e;
                        color: #ffffff;
                    }
                    
                    .container {
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    
                    h2 {
                        color: #007acc;
                        margin-bottom: 20px;
                    }
                    
                    #status {
                        background: #252526;
                        padding: 10px;
                        border-radius: 5px;
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
                    
                    button:disabled {
                        background: #333;
                        color: #666;
                        cursor: not-allowed;
                    }
                    
                    textarea {
                        width: 100%;
                        min-height: 100px;
                        padding: 10px;
                        background: #252526;
                        color: white;
                        border: 1px solid #333;
                        border-radius: 5px;
                        font-family: inherit;
                        font-size: 14px;
                        resize: vertical;
                        margin-bottom: 10px;
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
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>CodeLine - 简化测试版</h2>
                    
                    <div id="status">
                        状态: ${isConfigured ? '✅ 已配置' : '❌ 未配置'}
                    </div>
                    
                    <div class="button-group">
                        <button id="testButton1">测试按钮 1</button>
                        <button id="testButton2">测试按钮 2</button>
                        <button id="switchToChat">💬 聊天视图</button>
                        <button id="switchToSettings">⚙️ 设置视图</button>
                    </div>
                    
                    <textarea id="messageInput" placeholder="输入消息..."></textarea>
                    <button id="sendButton">发送消息</button>
                    
                    <div class="log">
                        <div id="logContent">日志:</div>
                    </div>
                </div>
                
                <script>
                    // 简单的日志函数
                    function log(message) {
                        const logElement = document.getElementById('logContent');
                        logElement.innerHTML += '<div>' + new Date().toLocaleTimeString() + ': ' + message + '</div>';
                        logElement.scrollTop = logElement.scrollHeight;
                    }
                    
                    // 初始化
                    log('脚本开始执行');
                    
                    // 获取VS Code API
                    let vscode;
                    try {
                        vscode = acquireVsCodeApi();
                        log('VS Code API 获取成功');
                    } catch (error) {
                        log('获取VS Code API失败: ' + error.message);
                        return;
                    }
                    
                    // 设置按钮事件
                    document.getElementById('testButton1').addEventListener('click', () => {
                        log('测试按钮 1 被点击');
                        vscode.postMessage({ command: 'test', data: '按钮1点击' });
                        alert('测试按钮1点击成功！');
                    });
                    
                    document.getElementById('testButton2').addEventListener('click', () => {
                        log('测试按钮 2 被点击');
                        vscode.postMessage({ command: 'test', data: '按钮2点击' });
                        alert('测试按钮2点击成功！');
                    });
                    
                    document.getElementById('switchToChat').addEventListener('click', () => {
                        log('切换到聊天视图');
                        vscode.postMessage({ command: 'switchView', view: 'chat' });
                    });
                    
                    document.getElementById('switchToSettings').addEventListener('click', () => {
                        log('切换到设置视图');
                        vscode.postMessage({ command: 'switchView', view: 'settings' });
                    });
                    
                    document.getElementById('sendButton').addEventListener('click', () => {
                        const input = document.getElementById('messageInput');
                        const text = input.value.trim();
                        if (text) {
                            log('发送消息: ' + text.substring(0, 50) + (text.length > 50 ? '...' : ''));
                            vscode.postMessage({ command: 'sendMessage', text: text });
                            input.value = '';
                        } else {
                            alert('请输入消息');
                        }
                    });
                    
                    // 处理Enter键
                    document.getElementById('messageInput').addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            document.getElementById('sendButton').click();
                        }
                    });
                    
                    log('初始化完成，所有按钮已绑定事件');
                </script>
            </body>
            </html>
        `;
    }
}
exports.SimpleSidebarProvider = SimpleSidebarProvider;
//# sourceMappingURL=sidebarProvider-simple.js.map