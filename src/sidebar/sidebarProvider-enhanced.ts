import * as vscode from 'vscode';

export class CodeLineSidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'codeline.chat';
    
    private _view?: vscode.WebviewView;
    private _extension: any;
    private _currentView: string = 'chat';
    
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
                case 'switchView':
                    this._currentView = message.view;
                    this.updateView(webviewView);
                    break;
                case 'test':
                    vscode.window.showInformationMessage(`测试: ${message.data}`);
                    break;
                case 'copyMessage':
                    console.log('复制消息:', message.messageId);
                    vscode.window.showInformationMessage('消息已复制');
                    break;
                case 'editMessage':
                    console.log('编辑消息:', message.messageId);
                    vscode.window.showInformationMessage('编辑功能开发中');
                    break;
                case 'regenerateMessage':
                    console.log('重新生成消息:', message.messageId);
                    vscode.window.showInformationMessage('重新生成功能开发中');
                    break;
            }
        });
    }
    
    private async handleSendMessage(text: string, webviewView: vscode.WebviewView) {
        console.log('开始处理消息:', text);
        
        try {
            // 显示用户消息
            console.log('发送用户消息到WebView');
            webviewView.webview.postMessage({
                command: 'addMessage',
                role: 'user',
                content: text,
                id: Date.now().toString(),
                timestamp: new Date()
            });
            
            // 获取AI回复
            console.log('获取AI回复...');
            const reply = await this.getAIResponse(text);
            console.log('收到AI回复:', reply.substring(0, 100) + (reply.length > 100 ? '...' : ''));
            
            // 显示AI回复
            console.log('发送AI回复到WebView');
            webviewView.webview.postMessage({
                command: 'addMessage',
                role: 'assistant',
                content: reply,
                id: (Date.now() + 1).toString(),
                timestamp: new Date()
            });
            
            console.log('消息处理完成');
            
        } catch (error) {
            console.error('处理消息时出错:', error);
            const errorMsg = `抱歉，处理消息时出错: ${error instanceof Error ? error.message : String(error)}`;
            webviewView.webview.postMessage({
                command: 'addMessage',
                role: 'assistant',
                content: errorMsg,
                id: (Date.now() + 2).toString(),
                timestamp: new Date()
            });
        }
    }
    
    private async getAIResponse(text: string): Promise<string> {
        console.log('获取AI回复:', text);
        
        // 先检查扩展和模型适配器
        if (!this._extension) {
            console.log('扩展实例不存在');
            return `扩展实例不存在，模拟回复: 我收到了"${text}"。`;
        }
        
        if (!this._extension.modelAdapter) {
            console.log('模型适配器不存在');
            return `模型适配器未初始化，模拟回复: 我收到了"${text}"。请检查扩展配置。`;
        }
        
        // 检查模型是否已配置
        if (!this._extension.modelAdapter.isReady()) {
            console.log('模型未配置');
            return `模型未配置。请设置API密钥后使用。

为了使用完整的AI功能，您需要：
1. 点击左侧齿轮图标 ⚙️ 进入设置
2. 配置您的API密钥
3. 选择模型提供者

现在我可以作为基础聊天助手回答一些简单问题。有什么可以帮您的吗？`;
        }
        
        // 尝试使用模型适配器 - 使用正确的generate方法
        try {
            console.log('调用模型适配器generate方法...');
            const response = await this._extension.modelAdapter.generate(text, {
                maxTokens: 500
            });
            console.log('模型响应:', response);
            // 注意：这里需要根据实际ModelResponse类型调整
            // 假设response有text属性或content属性
            return response.text || response.content || '模型没有返回有效回复';
        } catch (error) {
            console.error('模型调用失败:', error);
            // 根据错误类型提供更友好的回复
            const errorMsg = error instanceof Error ? error.message : String(error);
            
            if (errorMsg.includes('not configured') || errorMsg.includes('API key')) {
                return `模型未配置。请设置API密钥后使用。

配置步骤：
1. 点击左侧齿轮图标 ⚙️ 进入设置
2. 配置您的API密钥
3. 选择模型提供者

现在我可以作为基础聊天助手回答一些简单问题。有什么可以帮您的吗？`;
            }
            
            // 返回友好的模拟回复
            return `暂时无法连接到AI服务。

可能的原因：
1. API密钥配置错误
2. 网络连接问题
3. 模型服务暂时不可用

模拟回复: 我收到了"${text}"。请检查模型配置或稍后重试。`;
        }
    }
    
    private updateView(webviewView: vscode.WebviewView) {
        console.log('更新视图到:', this._currentView);
        // 发送视图更新消息到WebView
        webviewView.webview.postMessage({
            command: 'updateView',
            view: this._currentView
        });
    }
    
    private _getWebviewContent(): string {
        // 增强的HTML，包含导航栏和消息操作
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeLine</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: #1e1e1e;
            color: #ffffff;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        /* 导航栏 */
        .nav-bar {
            display: flex;
            background: #252526;
            border-bottom: 1px solid #333;
            padding: 8px 12px;
            gap: 8px;
        }
        
        .nav-tab {
            padding: 8px 16px;
            background: transparent;
            color: #cccccc;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
        }
        
        .nav-tab:hover {
            background: #2a2d2e;
        }
        
        .nav-tab.active {
            background: #094771;
            color: #ffffff;
        }
        
        /* 主要内容区域 */
        .main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        /* 聊天视图 */
        .chat-view {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        /* 消息容器 */
        .messages-container {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
        }
        
        /* 消息样式 */
        .message {
            margin-bottom: 20px;
            max-width: 85%;
        }
        
        .message.user {
            margin-left: auto;
        }
        
        .message-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
            font-size: 12px;
            opacity: 0.8;
        }
        
        .message-actions {
            display: flex;
            gap: 8px;
            margin-left: 10px;
        }
        
        .message-action {
            background: transparent;
            border: none;
            color: #cccccc;
            cursor: pointer;
            padding: 2px 4px;
            border-radius: 3px;
            font-size: 12px;
        }
        
        .message-action:hover {
            background: #2a2d2e;
            color: #ffffff;
        }
        
        .message-content {
            padding: 12px 16px;
            border-radius: 8px;
            line-height: 1.5;
            word-wrap: break-word;
        }
        
        .message.user .message-content {
            background: #005a9e;
        }
        
        .message.assistant .message-content {
            background: #252526;
            border: 1px solid #333;
        }
        
        /* 输入区域 */
        .input-area {
            padding: 16px;
            background: #252526;
            border-top: 1px solid #333;
        }
        
        .input-wrapper {
            display: flex;
            gap: 12px;
            align-items: flex-end;
        }
        
        textarea {
            flex: 1;
            min-height: 60px;
            max-height: 200px;
            padding: 12px;
            background: #333;
            color: white;
            border: 1px solid #444;
            border-radius: 6px;
            font-family: inherit;
            font-size: 14px;
            resize: vertical;
            line-height: 1.5;
        }
        
        textarea:focus {
            outline: none;
            border-color: #007acc;
        }
        
        .send-button {
            padding: 12px 24px;
            height: 44px;
            background: #007acc;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: background 0.2s;
        }
        
        .send-button:hover {
            background: #005a9e;
        }
        
        .send-button:disabled {
            background: #333;
            color: #666;
            cursor: not-allowed;
        }
        
        /* 设置视图 */
        .settings-view {
            display: none;
            padding: 24px;
            overflow-y: auto;
        }
        
        .settings-view.active {
            display: block;
        }
        
        .settings-title {
            font-size: 20px;
            margin-bottom: 20px;
            color: #007acc;
        }
        
        .settings-section {
            margin-bottom: 30px;
            padding: 20px;
            background: #252526;
            border-radius: 8px;
            border: 1px solid #333;
        }
        
        .settings-section h3 {
            margin-bottom: 15px;
            color: #cccccc;
        }
        
        .settings-group {
            margin-bottom: 15px;
        }
        
        .settings-label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            color: #cccccc;
        }
        
        .settings-input {
            width: 100%;
            padding: 10px;
            background: #333;
            color: white;
            border: 1px solid #444;
            border-radius: 4px;
            font-family: inherit;
        }
        
        .settings-button {
            padding: 10px 20px;
            background: #007acc;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 10px;
        }
        
        .settings-button:hover {
            background: #005a9e;
        }
        
        .settings-button.secondary {
            background: #333;
        }
        
        .settings-button.secondary:hover {
            background: #2a2d2e;
        }
        
        /* 自动批准设置 */
        .auto-approve-bar {
            background: #2a2d2e;
            border: 1px solid #333;
            border-radius: 6px;
            padding: 12px 16px;
            margin: 16px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .auto-approve-bar:hover {
            background: #323537;
        }
        
        .auto-approve-title {
            font-size: 14px;
            color: #cccccc;
        }
        
        .auto-approve-status {
            font-size: 12px;
            color: #888;
        }
    </style>
</head>
<body>
    <!-- 导航栏 -->
    <div class="nav-bar">
        <button class="nav-tab active" data-view="chat" data-action="switch-view">
            <span>💬</span>
            <span>聊天</span>
        </button>
        <button class="nav-tab" data-view="tasks" data-action="switch-view">
            <span>🗂️</span>
            <span>任务</span>
        </button>
        <button class="nav-tab" data-view="settings" data-action="switch-view">
            <span>⚙️</span>
            <span>设置</span>
        </button>
        <button class="nav-tab" data-view="history" data-action="switch-view">
            <span>📜</span>
            <span>历史</span>
        </button>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="main-content">
        <!-- 聊天视图 -->
        <div class="chat-view active" id="chatView">
            <!-- 自动批准设置栏 -->
            <div class="auto-approve-bar" data-action="toggle-auto-approve">
                <div class="auto-approve-title">⚙️ 自动批准设置</div>
                <div class="auto-approve-status">点击配置权限</div>
            </div>
            
            <!-- 消息容器 -->
            <div class="messages-container" id="messagesContainer">
                <!-- 初始消息 -->
                <div class="message assistant">
                    <div class="message-header">
                        <span class="role">CodeLine</span>
                        <span class="time">${new Date().toLocaleTimeString()}</span>
                    </div>
                    <div class="message-content">
                        你好！我是CodeLine助手。有什么可以帮您的？
                    </div>
                </div>
            </div>
            
            <!-- 输入区域 -->
            <div class="input-area">
                <div class="input-wrapper">
                    <textarea 
                        id="messageInput" 
                        placeholder="输入消息... (Enter发送，Shift+Enter换行)"
                        rows="1"></textarea>
                    <button class="send-button" id="sendButton">发送</button>
                </div>
            </div>
        </div>
        
        <!-- 设置视图 -->
        <div class="settings-view" id="settingsView">
            <h2 class="settings-title">设置</h2>
            
            <div class="settings-section">
                <h3>API 配置</h3>
                <div class="settings-group">
                    <label class="settings-label">API 密钥</label>
                    <input type="password" class="settings-input" id="apiKey" placeholder="输入您的API密钥">
                </div>
                <div class="settings-group">
                    <label class="settings-label">模型提供者</label>
                    <select class="settings-input" id="modelProvider">
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="deepseek">DeepSeek</option>
                    </select>
                </div>
                <div class="settings-group">
                    <label class="settings-label">模型名称</label>
                    <input type="text" class="settings-input" id="modelName" placeholder="例如: gpt-4-turbo">
                </div>
                <button class="settings-button" data-action="save-settings">保存设置</button>
                <button class="settings-button secondary" data-action="test-connection">测试连接</button>
            </div>
            
            <div class="settings-section">
                <h3>聊天管理</h3>
                <button class="settings-button" data-action="clear-chat">清除聊天记录</button>
            </div>
            
            <div class="settings-section">
                <h3>自动批准设置</h3>
                <p style="color: #888; margin-bottom: 15px; font-size: 14px;">
                    配置哪些操作可以自动批准，无需手动确认。
                </p>
                <div id="autoApproveOptions">
                    <!-- 自动批准选项将通过JavaScript动态生成 -->
                </div>
                <button class="settings-button" data-action="save-auto-approve">保存自动批准设置</button>
            </div>
        </div>
        
        <!-- 任务视图和历史视图占位 -->
        <div class="settings-view" id="tasksView">
            <h2 class="settings-title">任务管理</h2>
            <p style="color: #888; padding: 20px; text-align: center;">
                任务管理功能开发中...
            </p>
        </div>
        
        <div class="settings-view" id="historyView">
            <h2 class="settings-title">历史记录</h2>
            <p style="color: #888; padding: 20px; text-align: center;">
                历史记录功能开发中...
            </p>
        </div>
    </div>
    
    <script>
        console.log('CodeLine增强界面开始加载');
        
        // 获取VS Code API
        const vscode = acquireVsCodeApi();
        
        // 获取DOM元素
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        const messagesContainer = document.getElementById('messagesContainer');
        
        // 当前视图状态
        let currentView = 'chat';
        
        // 消息ID计数器
        let messageIdCounter = 1;
        
        // HTML转义函数
        function escapeHtml(text) {
            if (!text) return '';
            return text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;')
                .replace(/\\n/g, '<br>');
        }
        
        // 添加消息到聊天界面
        function addMessage(message) {
            const messageElement = document.createElement('div');
            messageElement.className = 'message ' + message.role;
            messageElement.dataset.messageId = message.id;
            
            // 生成消息操作按钮
            let actionButtons = '';
            if (message.role === 'assistant') {
                actionButtons = \`
                    <div class="message-actions">
                        <button class="message-action" data-action="copy-message" data-id="\${message.id}" title="复制">📋</button>
                        <button class="message-action" data-action="regenerate-message" data-id="\${message.id}" title="重新生成">🔄</button>
                    </div>
                \`;
            } else if (message.role === 'user') {
                actionButtons = \`
                    <div class="message-actions">
                        <button class="message-action" data-action="copy-message" data-id="\${message.id}" title="复制">📋</button>
                        <button class="message-action" data-action="edit-message" data-id="\${message.id}" title="编辑">✏️</button>
                    </div>
                \`;
            }
            
            messageElement.innerHTML = \`
                <div class="message-header">
                    <span class="role">\${message.role === 'user' ? '您' : 'CodeLine'}</span>
                    \${actionButtons}
                    <span class="time">\${new Date(message.timestamp).toLocaleTimeString()}</span>
                </div>
                <div class="message-content">\${escapeHtml(message.content)}</div>
            \`;
            
            messagesContainer.appendChild(messageElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        // 发送消息
        function sendMessage() {
            const text = messageInput.value.trim();
            if (!text) return;
            
            console.log('发送消息:', text);
            vscode.postMessage({ command: 'sendMessage', text: text });
            
            // 清空输入框
            messageInput.value = '';
            messageInput.style.height = 'auto';
            sendButton.disabled = true;
        }
        
        // 切换视图
        function switchView(view) {
            console.log('切换视图到:', view);
            currentView = view;
            
            // 更新导航栏
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.classList.remove('active');
                if (tab.dataset.view === view) {
                    tab.classList.add('active');
                }
            });
            
            // 更新内容区域
            document.querySelectorAll('.chat-view, .settings-view').forEach(el => {
                el.classList.remove('active');
            });
            
            if (view === 'chat') {
                document.getElementById('chatView').classList.add('active');
            } else if (view === 'settings') {
                document.getElementById('settingsView').classList.add('active');
            } else if (view === 'tasks') {
                document.getElementById('tasksView').classList.add('active');
            } else if (view === 'history') {
                document.getElementById('historyView').classList.add('active');
            }
            
            vscode.postMessage({ command: 'switchView', view: view });
        }
        
        // 事件委托系统
        document.addEventListener('click', function(e) {
            const target = e.target.closest('[data-action]');
            if (!target) return;
            
            const action = target.dataset.action;
            console.log('点击事件:', action, target.dataset);
            
            switch (action) {
                case 'switch-view':
                    const view = target.dataset.view;
                    if (view) {
                        switchView(view);
                    }
                    break;
                    
                case 'send-message':
                case 'send':
                    sendMessage();
                    break;
                    
                case 'copy-message':
                    const messageId = target.dataset.id;
                    vscode.postMessage({ 
                        command: 'copyMessage', 
                        messageId: messageId 
                    });
                    break;
                    
                case 'edit-message':
                    const editMessageId = target.dataset.id;
                    vscode.postMessage({ 
                        command: 'editMessage', 
                        messageId: editMessageId 
                    });
                    break;
                    
                case 'regenerate-message':
                    const regenerateMessageId = target.dataset.id;
                    vscode.postMessage({ 
                        command: 'regenerateMessage', 
                        messageId: regenerateMessageId 
                    });
                    break;
                    
                case 'toggle-auto-approve':
                    console.log('打开自动批准设置');
                    switchView('settings');
                    break;
                    
                case 'save-settings':
                    console.log('保存设置');
                    vscode.postMessage({ command: 'test', data: '保存设置' });
                    break;
                    
                case 'test-connection':
                    console.log('测试连接');
                    vscode.postMessage({ command: 'test', data: '测试连接' });
                    break;
                    
                case 'clear-chat':
                    console.log('清除聊天记录');
                    vscode.postMessage({ command: 'test', data: '清除聊天记录' });
                    break;
                    
                case 'save-auto-approve':
                    console.log('保存自动批准设置');
                    vscode.postMessage({ command: 'test', data: '保存自动批准设置' });
                    break;
            }
        });
        
        // 输入框事件处理
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
            sendButton.disabled = !this.value.trim();
        });
        
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // 处理来自扩展的消息
        window.addEventListener('message', function(event) {
            const message = event.data;
            console.log('WebView收到消息:', message);
            
            switch (message.command) {
                case 'addMessage':
                    addMessage(message);
                    sendButton.disabled = false;
                    break;
                    
                case 'updateView':
                    switchView(message.view);
                    break;
            }
        });
        
        // 初始聚焦输入框
        messageInput.focus();
        
        console.log('CodeLine增强界面加载完成');
    </script>
</body>
</html>`;
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