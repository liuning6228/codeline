import * as vscode from 'vscode';
import { CodeLineExtension } from '../extension';
import { ChatMessage } from '../chat/chatPanel';

export class CodeLineSidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'codeline.chat';
    
    private _view?: vscode.WebviewView;
    private _extension: CodeLineExtension;
    private _context: vscode.ExtensionContext;
    private _messages: ChatMessage[] = [];
    private _currentView: 'chat' | 'tasks' | 'settings' | 'history' = 'chat';
    private _isProcessing = false;

    constructor(
        context: vscode.ExtensionContext,
        extension: CodeLineExtension
    ) {
        this._context = context;
        this._extension = extension;
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: []
        };

        webviewView.webview.html = this._getWebviewContent();

        webviewView.webview.onDidReceiveMessage(async (message) => {
            await this._handleWebviewMessage(message);
        });

        // Update the webview when it becomes visible
        webviewView.onDidChangeVisibility(() => {
            if (webviewView.visible) {
                this._updateWebview();
            }
        });

        // Handle extension dispose
        token.onCancellationRequested(() => {
            this.dispose();
        });
    }

    public show() {
        if (this._view) {
            this._view.show?.(true);
        }
    }

    public focus() {
        if (this._view) {
            this._view.show?.(true);
        }
    }

    /**
     * Send a message to the chat from external source (e.g., editor context menu)
     */
    public sendMessageToChat(message: string): void {
        if (!this._view) {
            console.warn('Sidebar view not available');
            return;
        }

        // Show the sidebar first
        this.show();

        // Send message to webview
        this._view.webview.postMessage({
            command: 'externalMessage',
            content: message,
            timestamp: new Date().toISOString()
        });

        // Also add to local messages
        const chatMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: message,
            timestamp: new Date()
        };
        this._messages.push(chatMessage);
    }

    /**
     * Focus the chat input in the sidebar
     */
    public focusChatInput(): void {
        if (!this._view) {
            return;
        }

        this.show();
        this._currentView = 'chat';
        this._updateWebview();

        // Send focus command to webview
        this._view.webview.postMessage({
            command: 'focusInput'
        });
    }

    public dispose() {
        // Cleanup if needed
    }

    private async _handleWebviewMessage(message: any) {
        console.log('Sidebar received message:', message);
        
        switch (message.command) {
            case 'switchView':
                this._currentView = message.view;
                this._updateWebview();
                break;
                
            case 'sendMessage':
                await this._handleUserMessage(message.text);
                break;
                
            case 'executeTask':
                await this._handleTaskExecution(message.task);
                break;
                
            case 'clearChat':
                this._messages = [];
                this._updateWebview();
                break;
                
            case 'openSettings':
                vscode.commands.executeCommand('codeline.openSettings');
                break;
                
            case 'saveSettings':
                await this._handleSaveSettings(message.config);
                break;
                
            case 'testConnection':
                await this._handleTestConnection();
                break;
                
            case 'getModelInfo':
                this._sendMessageToWebview('modelInfo', {
                    modelInfo: this._extension.getModelInfo()
                });
                break;
                
            case 'copyMessage':
                await vscode.env.clipboard.writeText(message.text);
                vscode.window.showInformationMessage('Message copied to clipboard');
                break;
                
            case 'editMessage':
                await this._handleEditMessage(message.messageId, message.newContent);
                break;
                
            case 'regenerateMessage':
                await this._handleRegenerateMessage(message.messageId);
                break;
        }
    }

    private async _handleUserMessage(text: string) {
        if (this._isProcessing || !text.trim()) {
            return;
        }

        this._isProcessing = true;
        
        try {
            // Add user message
            const userMessage: ChatMessage = {
                id: Date.now().toString(),
                role: 'user',
                content: text,
                timestamp: new Date()
            };
            this._messages.push(userMessage);
            this._updateWebview();

            // Send typing indicator
            this._sendMessageToWebview('typing', { isTyping: true });

            // Process through task engine
            const response = await this._extension.executeTask(text);
            
            // Add assistant response
            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response?.output || 'No response received',
                timestamp: new Date()
            };
            this._messages.push(assistantMessage);
            this._updateWebview();

        } catch (error: any) {
            console.error('Error processing message:', error);
            
            const errorMessage: ChatMessage = {
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: `Error: ${error.message}`,
                timestamp: new Date()
            };
            this._messages.push(errorMessage);
            this._updateWebview();
            
            vscode.window.showErrorMessage(`Failed to process message: ${error.message}`);
            
        } finally {
            this._isProcessing = false;
            this._sendMessageToWebview('typing', { isTyping: false });
        }
    }

    private async _handleTaskExecution(task: string) {
        try {
            const result = await this._extension.executeTask(task);
            
            const taskMessage: ChatMessage = {
                id: Date.now().toString(),
                role: 'assistant',
                content: result?.output || 'Task executed',
                timestamp: new Date()
            };
            this._messages.push(taskMessage);
            this._updateWebview();
            
        } catch (error: any) {
            vscode.window.showErrorMessage(`Task execution failed: ${error.message}`);
        }
    }

    private async _handleSaveSettings(config: any) {
        try {
            // Update configuration
            await this._extension.updateConfig(config);
            this._updateWebview();
            vscode.window.showInformationMessage('Settings saved successfully');
            
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to save settings: ${error.message}`);
        }
    }

    private async _handleTestConnection() {
        try {
            const isReady = this._extension.getModelAdapter().isReady();
            
            if (isReady) {
                this._sendMessageToWebview('connectionTest', {
                    success: true,
                    message: 'Connection test successful'
                });
                vscode.window.showInformationMessage('Connection test successful');
            } else {
                throw new Error('Model adapter is not ready');
            }
            
        } catch (error: any) {
            this._sendMessageToWebview('connectionTest', {
                success: false,
                message: error.message
            });
            vscode.window.showErrorMessage(`Connection test failed: ${error.message}`);
        }
    }

    private async _handleEditMessage(messageId: string, newContent: string) {
        const message = this._messages.find(msg => msg.id === messageId);
        if (message && message.role === 'user') {
            message.content = newContent;
            this._updateWebview();
            vscode.window.showInformationMessage('Message updated successfully');
        }
    }

    private async _handleRegenerateMessage(messageId: string) {
        const messageIndex = this._messages.findIndex(msg => msg.id === messageId);
        if (messageIndex > 0 && this._messages[messageIndex].role === 'assistant') {
            // Remove the assistant message and regenerate from previous user message
            const userMessage = this._messages[messageIndex - 1];
            this._messages.splice(messageIndex, 1);
            await this._handleUserMessage(userMessage.content);
        }
    }

    private _updateWebview() {
        if (this._view) {
            this._view.webview.html = this._getWebviewContent();
        }
    }

    private _sendMessageToWebview(type: string, data: any) {
        if (this._view) {
            this._view.webview.postMessage({ type, data });
        }
    }

    private _getWebviewContent(): string {
        const config = this._extension.getConfig();
        const isConfigured = this._extension.getModelAdapter().isReady();
        const modelInfo = this._extension.getModelInfo();
        
        // Escape HTML helper
        const escapeHtml = (text: string) => {
            return text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        };

        // Messages HTML for chat view
        const messagesHtml = this._messages.map(msg => `
            <div class="message ${msg.role}" data-id="${msg.id}">
                <div class="message-actions">
                    <button class="message-action" title="Copy" onclick="copyMessage('${msg.id}')">
                        📋
                    </button>
                    ${msg.role === 'user' ? `
                        <button class="message-action" title="Edit" onclick="editMessage('${msg.id}')">
                            ✏️
                        </button>
                    ` : ''}
                    ${msg.role === 'assistant' ? `
                        <button class="message-action" title="Regenerate" onclick="regenerateMessage('${msg.id}')">
                            🔄
                        </button>
                    ` : ''}
                </div>
                <div class="message-header">
                    <span class="role">${msg.role === 'user' ? 'You' : msg.role === 'assistant' ? 'CodeLine' : 'System'}</span>
                    <span class="time">${msg.timestamp.toLocaleTimeString()}</span>
                </div>
                <div class="message-content">
                    ${escapeHtml(msg.content)}
                </div>
            </div>
        `).join('');

        // Determine which view to show
        let mainContent = '';
        
        switch (this._currentView) {
            case 'chat':
                mainContent = `
                    <div class="chat-container">
                        <div class="messages-container" id="messagesContainer">
                            ${messagesHtml}
                            ${this._isProcessing ? `
                                <div class="typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="input-container">
                            <textarea 
                                id="messageInput" 
                                placeholder="${isConfigured ? 'Type your message here...' : 'Please configure API key first'}"
                                ${!isConfigured ? 'disabled' : ''}
                                rows="3"
                            ></textarea>
                            <button 
                                id="sendButton" 
                                onclick="sendMessage()"
                                ${!isConfigured ? 'disabled' : ''}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                `;
                break;
                
            case 'tasks':
                mainContent = `
                    <div class="tasks-container">
                        <h3>Recent Tasks</h3>
                        ${this._messages.length > 0 ? `
                            <div class="tasks-list">
                                ${this._messages.slice(-5).reverse().map(msg => `
                                    <div class="task-item">
                                        <div class="task-preview">
                                            ${escapeHtml(msg.content.substring(0, 100))}${msg.content.length > 100 ? '...' : ''}
                                        </div>
                                        <div class="task-meta">
                                            <span class="task-role">${msg.role}</span>
                                            <span class="task-time">${msg.timestamp.toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="no-tasks">
                                No recent tasks. Start a conversation!
                            </div>
                        `}
                    </div>
                `;
                break;
                
            case 'settings':
                mainContent = `
                    <div class="settings-container">
                        <h3>Settings</h3>
                        
                        <div class="form-group">
                            <label for="apiKey">API Key</label>
                            <input type="password" id="apiKey" value="${config.apiKey || ''}" placeholder="Enter your API key">
                        </div>
                        
                        <div class="form-group">
                            <label for="model">Model</label>
                            <select id="model">
                                <option value="deepseek-chat" ${config.model === 'deepseek-chat' ? 'selected' : ''}>DeepSeek Chat</option>
                                <option value="claude-3-sonnet" ${config.model === 'claude-3-sonnet' ? 'selected' : ''}>Claude 3 Sonnet</option>
                                <option value="gpt-4" ${config.model === 'gpt-4' ? 'selected' : ''}>GPT-4</option>
                                <option value="qwen-max" ${config.model === 'qwen-max' ? 'selected' : ''}>Qwen Max</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="baseUrl">API Base URL</label>
                            <input type="text" id="baseUrl" value="${config.baseUrl || ''}" placeholder="https://api.deepseek.com">
                        </div>
                        
                        <div class="form-group checkbox">
                            <input type="checkbox" id="autoAnalyze" ${config.autoAnalyze ? 'checked' : ''}>
                            <label for="autoAnalyze">Auto-analyze project on startup</label>
                        </div>
                        
                        <div class="button-group">
                            <button onclick="saveSettings()">Save Settings</button>
                            <button onclick="testConnection()" class="secondary">Test Connection</button>
                        </div>
                    </div>
                `;
                break;
                
            case 'history':
                mainContent = `
                    <div class="history-container">
                        <h3>Chat History</h3>
                        ${this._messages.length > 0 ? `
                            <div class="history-list">
                                ${this._messages.map((msg, index) => `
                                    <div class="history-item" data-id="${msg.id}">
                                        <div class="history-index">${index + 1}</div>
                                        <div class="history-content">
                                            <div class="history-preview">
                                                ${escapeHtml(msg.content.substring(0, 80))}${msg.content.length > 80 ? '...' : ''}
                                            </div>
                                            <div class="history-meta">
                                                <span class="history-role">${msg.role}</span>
                                                <span class="history-time">${msg.timestamp.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="no-history">
                                No chat history yet.
                            </div>
                        `}
                        <div class="history-actions">
                            <button onclick="clearChat()">Clear Chat</button>
                        </div>
                    </div>
                `;
                break;
        }

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    :root {
                        --bg-primary: #1e1e1e;
                        --bg-secondary: #252526;
                        --bg-tertiary: #2d2d30;
                        --text-primary: #d4d4d4;
                        --text-secondary: #858585;
                        --accent: #007acc;
                        --accent-hover: #0062a3;
                        --border: #3e3e42;
                        --success: #2d7d46;
                        --error: #a1260d;
                        --warning: #d69d2e;
                    }
                    
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        background: var(--bg-primary);
                        color: var(--text-primary);
                        height: 100vh;
                        overflow: hidden;
                        display: flex;
                        flex-direction: column;
                    }
                    
                    /* Header */
                    .header {
                        background: var(--bg-secondary);
                        border-bottom: 1px solid var(--border);
                        padding: 12px 16px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    }
                    
                    .header h2 {
                        font-size: 14px;
                        font-weight: 600;
                        margin: 0;
                    }
                    
                    .nav-tabs {
                        display: flex;
                        gap: 4px;
                        background: var(--bg-tertiary);
                        border-radius: 4px;
                        padding: 2px;
                    }
                    
                    .nav-tab {
                        padding: 6px 12px;
                        border: none;
                        background: transparent;
                        color: var(--text-secondary);
                        font-size: 12px;
                        cursor: pointer;
                        border-radius: 2px;
                        transition: all 0.2s;
                    }
                    
                    .nav-tab:hover {
                        background: rgba(255, 255, 255, 0.05);
                        color: var(--text-primary);
                    }
                    
                    .nav-tab.active {
                        background: var(--accent);
                        color: white;
                    }
                    
                    /* Status bar */
                    .status-bar {
                        background: var(--bg-secondary);
                        border-top: 1px solid var(--border);
                        padding: 8px 16px;
                        font-size: 11px;
                        color: var(--text-secondary);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    
                    .status-indicator {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    }
                    
                    .status-dot {
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        background: ${isConfigured ? 'var(--success)' : 'var(--error)'};
                    }
                    
                    /* Main content */
                    .content {
                        flex: 1;
                        overflow: hidden;
                        display: flex;
                        flex-direction: column;
                    }
                    
                    .view-container {
                        flex: 1;
                        overflow: auto;
                        padding: 16px;
                    }
                    
                    /* Chat view */
                    .chat-container {
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                    }
                    
                    .messages-container {
                        flex: 1;
                        overflow-y: auto;
                        margin-bottom: 16px;
                    }
                    
                    .message {
                        background: var(--bg-secondary);
                        border-radius: 6px;
                        padding: 12px;
                        margin-bottom: 12px;
                        position: relative;
                    }
                    
                    .message.user {
                        border-left: 3px solid var(--accent);
                    }
                    
                    .message.assistant {
                        border-left: 3px solid var(--success);
                    }
                    
                    .message.system {
                        border-left: 3px solid var(--warning);
                    }
                    
                    .message-actions {
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        display: flex;
                        gap: 4px;
                        opacity: 0;
                        transition: opacity 0.2s;
                    }
                    
                    .message:hover .message-actions {
                        opacity: 1;
                    }
                    
                    .message-action {
                        background: rgba(255, 255, 255, 0.1);
                        border: none;
                        color: var(--text-primary);
                        width: 24px;
                        height: 24px;
                        border-radius: 3px;
                        cursor: pointer;
                        font-size: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    .message-action:hover {
                        background: rgba(255, 255, 255, 0.2);
                    }
                    
                    .message-header {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 8px;
                        font-size: 12px;
                    }
                    
                    .role {
                        font-weight: 600;
                        color: var(--accent);
                    }
                    
                    .time {
                        color: var(--text-secondary);
                    }
                    
                    .message-content {
                        line-height: 1.5;
                        white-space: pre-wrap;
                        font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
                        font-size: 13px;
                    }
                    
                    .input-container {
                        display: flex;
                        gap: 8px;
                        padding-top: 16px;
                        border-top: 1px solid var(--border);
                    }
                    
                    textarea {
                        flex: 1;
                        background: var(--bg-secondary);
                        border: 1px solid var(--border);
                        border-radius: 4px;
                        color: var(--text-primary);
                        padding: 8px 12px;
                        font-family: inherit;
                        font-size: 13px;
                        resize: none;
                        outline: none;
                    }
                    
                    textarea:focus {
                        border-color: var(--accent);
                    }
                    
                    textarea:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }
                    
                    button {
                        background: var(--accent);
                        color: white;
                        border: none;
                        border-radius: 4px;
                        padding: 8px 16px;
                        font-size: 13px;
                        cursor: pointer;
                        transition: background 0.2s;
                    }
                    
                    button:hover:not(:disabled) {
                        background: var(--accent-hover);
                    }
                    
                    button:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }
                    
                    button.secondary {
                        background: var(--bg-tertiary);
                        color: var(--text-primary);
                    }
                    
                    button.secondary:hover {
                        background: rgba(255, 255, 255, 0.1);
                    }
                    
                    /* Typing indicator */
                    .typing-indicator {
                        display: flex;
                        gap: 4px;
                        padding: 16px;
                        justify-content: center;
                    }
                    
                    .typing-indicator span {
                        width: 8px;
                        height: 8px;
                        background: var(--text-secondary);
                        border-radius: 50%;
                        animation: typing 1.4s infinite both;
                    }
                    
                    .typing-indicator span:nth-child(2) {
                        animation-delay: 0.2s;
                    }
                    
                    .typing-indicator span:nth-child(3) {
                        animation-delay: 0.4s;
                    }
                    
                    @keyframes typing {
                        0%, 60%, 100% {
                            transform: translateY(0);
                        }
                        30% {
                            transform: translateY(-8px);
                        }
                    }
                    
                    /* Tasks view */
                    .tasks-container, .settings-container, .history-container {
                        height: 100%;
                    }
                    
                    h3 {
                        margin-bottom: 16px;
                        font-size: 16px;
                        font-weight: 600;
                    }
                    
                    .tasks-list, .history-list {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                    }
                    
                    .task-item, .history-item {
                        background: var(--bg-secondary);
                        border-radius: 4px;
                        padding: 12px;
                        border-left: 3px solid var(--border);
                    }
                    
                    .task-item:hover, .history-item:hover {
                        background: rgba(255, 255, 255, 0.05);
                    }
                    
                    .task-preview, .history-preview {
                        font-size: 13px;
                        line-height: 1.4;
                        margin-bottom: 4px;
                    }
                    
                    .task-meta, .history-meta {
                        display: flex;
                        justify-content: space-between;
                        font-size: 11px;
                        color: var(--text-secondary);
                    }
                    
                    .history-item {
                        display: flex;
                        gap: 12px;
                    }
                    
                    .history-index {
                        background: var(--bg-tertiary);
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 11px;
                        flex-shrink: 0;
                    }
                    
                    .history-content {
                        flex: 1;
                    }
                    
                    /* Settings view */
                    .form-group {
                        margin-bottom: 16px;
                    }
                    
                    label {
                        display: block;
                        margin-bottom: 4px;
                        font-size: 13px;
                        color: var(--text-primary);
                    }
                    
                    input, select {
                        width: 100%;
                        background: var(--bg-secondary);
                        border: 1px solid var(--border);
                        border-radius: 4px;
                        color: var(--text-primary);
                        padding: 8px 12px;
                        font-size: 13px;
                        outline: none;
                    }
                    
                    input:focus, select:focus {
                        border-color: var(--accent);
                    }
                    
                    .checkbox {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    
                    .checkbox input {
                        width: auto;
                        margin: 0;
                    }
                    
                    .checkbox label {
                        margin: 0;
                    }
                    
                    .button-group {
                        display: flex;
                        gap: 8px;
                        margin-top: 24px;
                    }
                    
                    /* Empty states */
                    .no-tasks, .no-history {
                        text-align: center;
                        padding: 40px 20px;
                        color: var(--text-secondary);
                        font-style: italic;
                    }
                    
                    .history-actions {
                        margin-top: 16px;
                        display: flex;
                        justify-content: flex-end;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>CodeLine</h2>
                    <div class="nav-tabs">
                        <button class="nav-tab ${this._currentView === 'chat' ? 'active' : ''}" onclick="switchView('chat')">
                            Chat
                        </button>
                        <button class="nav-tab ${this._currentView === 'tasks' ? 'active' : ''}" onclick="switchView('tasks')">
                            Tasks
                        </button>
                        <button class="nav-tab ${this._currentView === 'settings' ? 'active' : ''}" onclick="switchView('settings')">
                            Settings
                        </button>
                        <button class="nav-tab ${this._currentView === 'history' ? 'active' : ''}" onclick="switchView('history')">
                            History
                        </button>
                    </div>
                </div>
                
                <div class="content">
                    <div class="view-container" id="viewContainer">
                        ${mainContent}
                    </div>
                </div>
                
                <div class="status-bar">
                    <div class="status-indicator">
                        <div class="status-dot"></div>
                        <span>${isConfigured ? 'Connected' : 'Not configured'}</span>
                    </div>
                    <div class="model-info">${modelInfo}</div>
                </div>
                
                <script>
                    const vscode = acquireVsCodeApi();
                    
                    // Auto-scroll messages to bottom
                    function scrollToBottom() {
                        const container = document.getElementById('messagesContainer');
                        if (container) {
                            container.scrollTop = container.scrollHeight;
                        }
                    }
                    
                    // View switching
                    function switchView(view) {
                        vscode.postMessage({
                            command: 'switchView',
                            view: view
                        });
                    }
                    
                    // Message handling
                    function sendMessage() {
                        const input = document.getElementById('messageInput');
                        const text = input.value.trim();
                        
                        if (text) {
                            vscode.postMessage({
                                command: 'sendMessage',
                                text: text
                            });
                            input.value = '';
                            input.focus();
                            setTimeout(scrollToBottom, 100);
                        }
                    }
                    
                    // Handle Enter key in textarea (Ctrl+Enter to send)
                    const messageInput = document.getElementById('messageInput');
                    if (messageInput) {
                        messageInput.addEventListener('keydown', (e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        });
                    }
                    
                    // Message actions
                    function copyMessage(messageId) {
                        const messageElement = document.querySelector(\`.message[data-id="\${messageId}"] .message-content\`);
                        if (messageElement) {
                            const text = messageElement.textContent;
                            vscode.postMessage({
                                command: 'copyMessage',
                                text: text
                            });
                        }
                    }
                    
                    function editMessage(messageId) {
                        const messageElement = document.querySelector(\`.message[data-id="\${messageId}"] .message-content\`);
                        if (messageElement) {
                            const currentText = messageElement.textContent;
                            const newText = prompt('Edit message:', currentText);
                            if (newText !== null && newText !== currentText) {
                                vscode.postMessage({
                                    command: 'editMessage',
                                    messageId: messageId,
                                    newContent: newText
                                });
                            }
                        }
                    }
                    
                    function regenerateMessage(messageId) {
                        vscode.postMessage({
                            command: 'regenerateMessage',
                            messageId: messageId
                        });
                    }
                    
                    // Settings
                    function saveSettings() {
                        const apiKey = document.getElementById('apiKey').value;
                        const model = document.getElementById('model').value;
                        const baseUrl = document.getElementById('baseUrl').value;
                        const autoAnalyze = document.getElementById('autoAnalyze').checked;
                        
                        vscode.postMessage({
                            command: 'saveSettings',
                            config: {
                                apiKey: apiKey,
                                model: model,
                                baseUrl: baseUrl,
                                autoAnalyze: autoAnalyze
                            }
                        });
                    }
                    
                    function testConnection() {
                        vscode.postMessage({
                            command: 'testConnection'
                        });
                    }
                    
                    // Chat history
                    function clearChat() {
                        if (confirm('Are you sure you want to clear all chat history?')) {
                            vscode.postMessage({
                                command: 'clearChat'
                            });
                        }
                    }
                    
                    // Initialize
                    setTimeout(scrollToBottom, 100);
                    
                    // Handle messages from extension
                    window.addEventListener('message', event => {
                        const message = event.data;
                        
                        switch (message.type) {
                            case 'typing':
                                // Handle typing indicator
                                const typingIndicator = document.querySelector('.typing-indicator');
                                if (typingIndicator) {
                                    typingIndicator.style.display = message.data.isTyping ? 'flex' : 'none';
                                }
                                break;
                                
                            case 'modelInfo':
                                // Update model info in status bar
                                const modelInfoElement = document.querySelector('.model-info');
                                if (modelInfoElement) {
                                    modelInfoElement.textContent = message.data.modelInfo;
                                }
                                break;
                                
                            case 'connectionTest':
                                alert(message.data.message);
                                break;
                        }
                    });
                </script>
            </body>
            </html>
        `;
    }
}