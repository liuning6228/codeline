import * as vscode from 'vscode';

export class CodeLineSidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'codeline.chat';
    
    private _view?: vscode.WebviewView;
    private _extension: any;
    
    constructor(context: vscode.ExtensionContext, extension: any) {
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
        
        webviewView.webview.onDidReceiveMessage(async (message) => {
            console.log('Sidebar收到消息:', message);
            switch (message.command) {
                case 'sendMessage':
                    await this.handleSendMessage(message.text, webviewView);
                    break;
                case 'test':
                    vscode.window.showInformationMessage(`测试: ${message.data}`);
                    break;
            }
        });
    }
    
    private async handleSendMessage(text: string, webviewView: vscode.WebviewView) {
        console.log('处理消息:', text);
        
        // 显示用户消息
        webviewView.webview.postMessage({
            command: 'addMessage',
            role: 'user',
            content: text
        });
        
        try {
            // 获取AI回复
            const reply = await this.getAIResponse(text);
            
            // 显示AI回复
            webviewView.webview.postMessage({
                command: 'addMessage',
                role: 'assistant',
                content: reply
            });
            
        } catch (error) {
            console.error('处理消息时出错:', error);
            webviewView.webview.postMessage({
                command: 'addMessage',
                role: 'assistant',
                content: `抱歉，处理消息时出错: ${error instanceof Error ? error.message : String(error)}`
            });
        }
    }
    
    private async getAIResponse(text: string): Promise<string> {
        console.log('获取AI回复:', text);
        
        // 尝试使用模型适配器
        if (this._extension?.modelAdapter) {
            try {
                const response = await this._extension.modelAdapter.complete({
                    prompt: text,
                    maxTokens: 500
                });
                return response.text || '模型没有返回有效回复';
            } catch (error) {
                console.error('模型调用失败:', error);
                // 返回模拟回复
                return `模型调用失败，模拟回复: 我收到了"${text}"。请检查模型配置。`;
            }
        }
        
        // 模拟回复
        return `我收到了你的消息: "${text}"。这是一个测试回复，实际功能需要配置模型API。`;
    }
    
    private _getWebviewContent(): string {
        // 简单的HTML，避免复杂的模板字符串嵌套
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeLine Chat</title>
    <style>
        body {
            font-family: sans-serif;
            margin: 0;
            padding: 0;
            background: #1e1e1e;
            color: white;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        .messages {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
        }
        .message {
            margin-bottom: 12px;
            padding: 10px 15px;
            border-radius: 8px;
            max-width: 85%;
            word-wrap: break-word;
        }
        .user {
            background: #005a9e;
            margin-left: auto;
        }
        .assistant {
            background: #252526;
            border: 1px solid #333;
        }
        .input-area {
            padding: 12px;
            background: #252526;
            border-top: 1px solid #333;
            display: flex;
            gap: 10px;
        }
        textarea {
            flex: 1;
            padding: 10px;
            background: #333;
            color: white;
            border: 1px solid #444;
            border-radius: 5px;
            font-family: inherit;
            font-size: 14px;
            resize: vertical;
            min-height: 50px;
        }
        button {
            padding: 10px 20px;
            background: #007acc;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 500;
        }
        button:hover {
            background: #005a9e;
        }
        button:disabled {
            background: #333;
            color: #666;
            cursor: not-allowed;
        }
    </style>
</head>
<body>
    <div class="messages" id="messages">
        <div class="message assistant">你好！我是CodeLine助手。</div>
    </div>
    <div class="input-area">
        <textarea id="input" placeholder="输入消息..."></textarea>
        <button id="send">发送</button>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        const messagesEl = document.getElementById('messages');
        const inputEl = document.getElementById('input');
        const sendBtn = document.getElementById('send');
        
        function addMessage(content, isUser) {
            const msg = document.createElement('div');
            msg.className = 'message ' + (isUser ? 'user' : 'assistant');
            msg.textContent = content;
            messagesEl.appendChild(msg);
            messagesEl.scrollTop = messagesEl.scrollHeight;
        }
        
        function sendMessage() {
            const text = inputEl.value.trim();
            if (!text) return;
            
            addMessage(text, true);
            vscode.postMessage({ command: 'sendMessage', text: text });
            inputEl.value = '';
            sendBtn.disabled = true;
        }
        
        sendBtn.addEventListener('click', sendMessage);
        
        inputEl.addEventListener('input', function() {
            sendBtn.disabled = !this.value.trim();
        });
        
        inputEl.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        window.addEventListener('message', function(event) {
            const msg = event.data;
            if (msg.command === 'addMessage') {
                addMessage(msg.content, msg.role === 'user');
                sendBtn.disabled = false;
            }
        });
        
        inputEl.focus();
        console.log('聊天界面已加载');
    </script>
</body>
</html>`;
        
        return html;
    }
    
    public show() {
        if (this._view) {
            this._view.show?.(true);
        }
    }
    
    public sendMessageToChat(message: string) {
        if (this._view) {
            this._view.webview.postMessage({
                command: 'receiveMessage',
                text: message
            });
        }
    }
    
    public focusChatInput() {
        if (this._view) {
            this._view.webview.postMessage({
                command: 'focusInput'
            });
        }
    }
}