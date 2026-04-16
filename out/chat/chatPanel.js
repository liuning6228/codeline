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
exports.CodeLineChatPanel = void 0;
const vscode = __importStar(require("vscode"));
const ToolProgressService_1 = require("../services/ToolProgressService");
const ConfigManager_1 = require("../config/ConfigManager");
const PermissionManager_1 = require("../auth/PermissionManager");
class CodeLineChatPanel {
    static currentPanel;
    panel;
    extension;
    context;
    messages = [];
    isProcessing = false;
    currentView = 'chat';
    toolProgressService = (0, ToolProgressService_1.createToolProgressService)();
    configManager = (0, ConfigManager_1.createConfigManager)();
    permissionManager = (0, PermissionManager_1.createPermissionManager)();
    autoApprovalSettings = {
        version: 1,
        enabled: true,
        favorites: [],
        maxRequests: 20,
        actions: {
            readFiles: true,
            readFilesExternally: false,
            editFiles: false,
            editFilesExternally: false,
            executeSafeCommands: true,
            executeAllCommands: false,
            useBrowser: false,
            useMcp: false,
        },
        enableNotifications: false,
    };
    static createOrShow(context, extension) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        // If we already have a panel, show it
        if (CodeLineChatPanel.currentPanel) {
            CodeLineChatPanel.currentPanel.panel.reveal(column);
            return;
        }
        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel('codelineChat', 'CodeLine Chat', column || vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: []
        });
        CodeLineChatPanel.currentPanel = new CodeLineChatPanel(panel, context, extension);
    }
    constructor(panel, context, extension) {
        this.panel = panel;
        this.context = context;
        this.extension = extension;
        // Set the webview's initial html content
        this.updateWebview();
        // 加载自动批准设置
        this.loadAutoApprovalSettings();
        // Listen for when the panel is disposed
        this.panel.onDidDispose(() => this.dispose(), null, this.context.subscriptions);
        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(async (message) => {
            await this.handleWebviewMessage(message);
        }, null, this.context.subscriptions);
        // 设置工具进度服务的WebView面板
        this.toolProgressService.setWebviewPanel(panel);
    }
    /**
     * 从存储加载自动批准设置
     */
    loadAutoApprovalSettings() {
        try {
            // 从全局存储加载设置
            const savedSettings = this.context.globalState.get('codeline.autoApprovalSettings');
            if (savedSettings) {
                // 合并保存的设置与默认设置，确保所有字段都存在
                this.autoApprovalSettings = {
                    ...this.autoApprovalSettings, // 默认设置
                    ...savedSettings, // 保存的设置
                    actions: {
                        ...this.autoApprovalSettings.actions, // 默认操作设置
                        ...(savedSettings.actions || {}) // 保存的操作设置
                    }
                };
                console.log('已加载自动批准设置:', this.autoApprovalSettings);
            }
            else {
                console.log('未找到保存的自动批准设置，使用默认设置');
            }
            // 更新权限管理器的自动批准设置
            this.permissionManager.setAutoApprovalSettings(this.autoApprovalSettings);
        }
        catch (error) {
            console.error('加载自动批准设置失败:', error);
            // 继续使用默认设置
            this.permissionManager.setAutoApprovalSettings(this.autoApprovalSettings);
        }
    }
    async show() {
        CodeLineChatPanel.createOrShow(this.context, this.extension);
    }
    async handleWebviewMessage(message) {
        console.log('Received message from webview:', message);
        switch (message.command) {
            case 'sendMessage':
                await this.handleUserMessage(message.text, message.isExternal, message.externalTimestamp);
                break;
            case 'executeTask':
                await this.handleTaskExecution(message.task);
                break;
            case 'clearChat':
                this.messages = [];
                this.updateWebview();
                break;
            case 'getHistory':
                this.sendMessageToWebview('history', { messages: this.messages });
                break;
            case 'openSettings':
                vscode.commands.executeCommand('codeline.openSettings');
                break;
            case 'switchView':
                this.currentView = message.view;
                this.updateWebview();
                break;
            case 'saveSettings':
                await this.handleSaveSettings(message.config);
                break;
            case 'testConnection':
                await this.handleTestConnection();
                break;
            case 'approveDiff':
                await this.handleApproveDiff(message.filePath, message.diffId, message.action);
                break;
            case 'resetSettings':
                await this.handleResetSettings();
                break;
            case 'fileCommand':
                await this.handleFileCommand(message.fileCommand, message.data);
                break;
            case 'editMessage':
                await this.handleEditMessage(message.messageId, message.newContent);
                break;
            case 'regenerateMessage':
                await this.handleRegenerateMessage(message.messageId);
                break;
            case 'signOut':
                await this.handleSignOut();
                break;
            case 'upgradeAccount':
                await this.handleUpgradeAccount();
                break;
            case 'addMCP':
                await this.handleAddMCP();
                break;
            case 'loadConfig':
                await this.handleLoadConfig();
                break;
            case 'saveConfig':
                await this.handleSaveConfig(message.config);
                break;
            case 'executeTaskWithStream':
                await this.handleTaskExecutionWithStream(message.task);
                break;
            case 'taskEvent':
                await this.handleTaskEvent(message.event);
                break;
            case 'loadAutoApproveSettings':
                await this.handleLoadAutoApproveSettings();
                break;
            case 'updateAutoApproveSettings':
                await this.handleUpdateAutoApproveSettings(message.settings);
                break;
        }
    }
    async handleSaveSettings(config) {
        try {
            // Update configuration
            this.extension.updateConfig(config);
            // Show success message
            vscode.window.showInformationMessage('CodeLine settings saved successfully');
            // Update webview with new config
            this.sendMessageToWebview('configUpdated', { config });
            this.updateWebview();
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to save settings: ${error.message}`);
        }
    }
    async handleTestConnection() {
        try {
            // Test the connection by getting model info
            const modelInfo = this.extension.getModelInfo();
            if (modelInfo === 'Not configured') {
                vscode.window.showWarningMessage('CodeLine is not configured. Please set your API key first.');
            }
            else {
                vscode.window.showInformationMessage(`Connection test successful! Model: ${modelInfo}`);
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Connection test failed: ${error.message}`);
        }
    }
    async handleResetSettings() {
        try {
            // Reset to default configuration
            const defaultConfig = {
                apiKey: '',
                model: 'deepseek-chat',
                baseUrl: 'https://api.deepseek.com',
                temperature: 0.7,
                maxTokens: 2048,
                autoAnalyze: false,
                showExamples: true,
                typingIndicator: true
            };
            this.extension.updateConfig(defaultConfig);
            // Show success message
            vscode.window.showInformationMessage('CodeLine settings reset to defaults');
            // Update webview with new config
            this.sendMessageToWebview('configUpdated', { config: defaultConfig });
            this.updateWebview();
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to reset settings: ${error.message}`);
        }
    }
    async handleApproveDiff(filePath, diffId, action) {
        try {
            // 调用扩展的批准/拒绝方法
            const result = await this.extension.approveFileDiff(diffId, action);
            if (result.success) {
                const message = action === 'approve' ?
                    `✓ Approved changes for: ${filePath}` :
                    `✗ Rejected changes for: ${filePath}`;
                vscode.window.showInformationMessage(message, 'View Details').then(selection => {
                    if (selection === 'View Details') {
                        // 可以在输出面板显示操作详情
                        const outputChannel = vscode.window.createOutputChannel('CodeLine File Operations');
                        outputChannel.show(true);
                        outputChannel.appendLine(`File: ${filePath}`);
                        outputChannel.appendLine(`Action: ${action === 'approve' ? 'Approved' : 'Rejected'}`);
                        outputChannel.appendLine(`Result: ${result.message}`);
                    }
                });
            }
            else {
                vscode.window.showErrorMessage(`Failed to ${action} changes: ${result.error || 'Unknown error'}`);
            }
            // 更新UI状态
            this.sendMessageToWebview('diffActionResult', {
                filePath,
                diffId,
                action,
                success: result.success,
                message: result.message,
                error: result.error
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to ${action} changes: ${error.message}`);
            this.sendMessageToWebview('diffActionResult', {
                filePath,
                diffId,
                action,
                success: false,
                error: error.message
            });
        }
    }
    /**
     * 添加助手消息到聊天
     */
    addAssistantMessage(content) {
        const assistantMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: content,
            timestamp: new Date()
        };
        this.messages.push(assistantMessage);
        this.updateWebview();
    }
    /**
     * 格式化文件命令结果为可读消息
     */
    formatFileCommandResult(command, result) {
        if (!result.success) {
            return `❌ File command "${command}" failed: ${result.message || result.error || 'Unknown error'}`;
        }
        switch (command) {
            case 'listFiles':
                const listData = result.data;
                let listMessage = `📁 **Directory Listing** (${listData.path || 'current directory'})\n\n`;
                listMessage += `📂 Directories: ${listData.directories}\n`;
                listMessage += `📄 Files: ${listData.filesCount}\n`;
                listMessage += `📊 Total Size: ${this.formatFileSize(listData.totalSize)}\n\n`;
                if (listData.files && listData.files.length > 0) {
                    listMessage += `**Contents**:\n`;
                    listData.files.forEach((file, index) => {
                        if (index < 10) { // 只显示前10个
                            const icon = file.type === 'directory' ? '📁' : '📄';
                            const size = file.type === 'directory' ? '' : ` (${this.formatFileSize(file.size)})`;
                            const ext = file.extension ? ` ${file.extension}` : '';
                            listMessage += `${icon} **${file.name}**${ext}${size}\n`;
                        }
                    });
                    if (listData.files.length > 10) {
                        listMessage += `... and ${listData.files.length - 10} more items\n`;
                    }
                }
                else {
                    listMessage += `*Directory is empty*\n`;
                }
                return listMessage;
            case 'searchFiles':
                const searchData = result.data;
                let searchMessage = `🔍 **File Search Results**\n\n`;
                searchMessage += `📊 Found: ${searchData.length} files\n\n`;
                if (searchData.length > 0) {
                    searchMessage += `**Top Results**:\n`;
                    searchData.slice(0, 5).forEach((file, index) => {
                        searchMessage += `${index + 1}. **${file.name}** (${file.path})\n`;
                        if (file.matches && file.matches.length > 0) {
                            searchMessage += `   Matches: ${file.matches.length} content matches\n`;
                        }
                    });
                    if (searchData.length > 5) {
                        searchMessage += `... and ${searchData.length - 5} more files\n`;
                    }
                }
                else {
                    searchMessage += `*No files found matching search criteria*\n`;
                }
                return searchMessage;
            case 'getStats':
                const statsData = result.data;
                let statsMessage = `📊 **Workspace Statistics**\n\n`;
                statsMessage += `📂 Total Files: ${statsData.totalFiles}\n`;
                statsMessage += `📝 Total Lines: ${statsData.totalLines}\n`;
                statsMessage += `💾 Total Size: ${this.formatFileSize(statsData.totalSize)}\n\n`;
                statsMessage += `**File Types**:\n`;
                Object.entries(statsData.byType).forEach(([type, count]) => {
                    const icon = type === 'directory' ? '📁' : type === 'file' ? '📄' : '🔗';
                    statsMessage += `${icon} ${type}: ${count}\n`;
                });
                if (Object.keys(statsData.byExtension).length > 0) {
                    statsMessage += `\n**Extensions**:\n`;
                    const topExtensions = Object.entries(statsData.byExtension)
                        .sort((a, b) => b[1].count - a[1].count)
                        .slice(0, 5);
                    topExtensions.forEach(([ext, data]) => {
                        statsMessage += `${ext}: ${data.count} files, ${data.lines} lines\n`;
                    });
                }
                return statsMessage;
            case 'browseDirectory':
                const browseData = result.data;
                let browseMessage = `📂 **Directory Browser**\n\n`;
                browseMessage += `📁 Selected: ${result.path || 'current directory'}\n`;
                browseMessage += `📊 Items: ${browseData.files?.length || 0}\n\n`;
                if (browseData.files && browseData.files.length > 0) {
                    browseMessage += `**Contents**:\n`;
                    browseData.files.slice(0, 8).forEach((file) => {
                        const icon = file.type === 'directory' ? '📁' : '📄';
                        browseMessage += `${icon} ${file.name}\n`;
                    });
                    if (browseData.files.length > 8) {
                        browseMessage += `... and ${browseData.files.length - 8} more items\n`;
                    }
                }
                return browseMessage;
            default:
                return `✅ File operation "${command}" completed: ${result.message}`;
        }
    }
    /**
     * 格式化文件大小（B, KB, MB, GB）
     */
    formatFileSize(bytes) {
        if (bytes === 0)
            return '0 B';
        const units = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
    }
    async handleUserMessage(text, isExternal, externalTimestamp) {
        if (this.isProcessing) {
            return;
        }
        this.isProcessing = true;
        try {
            // Add user message
            const userMessage = {
                id: Date.now().toString(),
                role: 'user',
                content: text,
                timestamp: externalTimestamp ? new Date(externalTimestamp) : new Date(),
                isExternal: isExternal || false
            };
            this.messages.push(userMessage);
            this.updateWebview();
            // Show typing indicator
            this.sendMessageToWebview('typing', { isTyping: true });
            // Process the message using the new TaskEngine
            const taskResult = await this.extension.executeTask(text);
            // 构建响应消息
            let responseContent = '';
            if (taskResult && 'success' in taskResult) {
                // 新的TaskResult格式
                if (taskResult.success) {
                    const completedSteps = taskResult.steps?.filter((s) => s.status === 'completed').length || 0;
                    const totalSteps = taskResult.steps?.length || 0;
                    responseContent = `✅ Task completed successfully!\n\n`;
                    responseContent += `**Summary**: ${completedSteps}/${totalSteps} steps executed\n\n`;
                    if (taskResult.output) {
                        responseContent += `**Output**:\n${taskResult.output.substring(0, 500)}`;
                        if (taskResult.output.length > 500) {
                            responseContent += '...\n*(output truncated)*';
                        }
                    }
                    // 显示步骤摘要
                    if (taskResult.steps && taskResult.steps.length > 0) {
                        responseContent += `\n\n**Steps**:\n`;
                        taskResult.steps.forEach((step, index) => {
                            const statusIcon = step.status === 'completed' ? '✓' :
                                step.status === 'failed' ? '✗' :
                                    step.status === 'executing' ? '⟳' : '⏸';
                            responseContent += `${index + 1}. ${statusIcon} ${step.type}: ${step.description}\n`;
                        });
                    }
                }
                else {
                    responseContent = `❌ Task failed: ${taskResult.error || 'Unknown error'}\n\n`;
                    if (taskResult.output) {
                        responseContent += `**Error Details**:\n${taskResult.output}`;
                    }
                }
            }
            else {
                // 向后兼容：旧的响应格式
                const oldResponse = taskResult;
                responseContent = oldResponse.content || 'I processed your request.';
            }
            // Add assistant response
            const assistantMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: responseContent,
                timestamp: new Date()
            };
            this.messages.push(assistantMessage);
            // Hide typing indicator
            this.sendMessageToWebview('typing', { isTyping: false });
            this.updateWebview();
        }
        catch (error) {
            console.error('Error processing message:', error);
            // Add error message
            const errorMessage = {
                id: Date.now().toString(),
                role: 'system',
                content: `Error: ${error.message}`,
                timestamp: new Date()
            };
            this.messages.push(errorMessage);
            this.sendMessageToWebview('typing', { isTyping: false });
            this.updateWebview();
        }
        finally {
            this.isProcessing = false;
        }
    }
    async handleTaskExecution(task) {
        try {
            const result = await this.extension.executeTask(task);
            this.sendMessageToWebview('taskResult', { result });
        }
        catch (error) {
            this.sendMessageToWebview('taskError', { error: error.message });
        }
    }
    async handleEditMessage(messageId, newContent) {
        try {
            // Find the message by ID
            const messageIndex = this.messages.findIndex(msg => msg.id === messageId);
            if (messageIndex === -1) {
                throw new Error('Message not found');
            }
            // Update the message content
            this.messages[messageIndex].content = newContent;
            this.messages[messageIndex].timestamp = new Date();
            // Update the webview
            this.updateWebview();
            // Show success feedback
            vscode.window.showInformationMessage('Message updated successfully', 'OK');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to edit message: ${error.message}`);
        }
    }
    async handleRegenerateMessage(messageId) {
        try {
            // Find the message by ID
            const messageIndex = this.messages.findIndex(msg => msg.id === messageId);
            if (messageIndex === -1) {
                throw new Error('Message not found');
            }
            const message = this.messages[messageIndex];
            // Only regenerate assistant messages
            if (message.role !== 'assistant') {
                throw new Error('Only assistant messages can be regenerated');
            }
            // Find the previous user message to use as context
            const previousMessages = this.messages.slice(0, messageIndex + 1);
            // Use reverse loop to find last user message (compatible with older ES versions)
            let userMessageIndex = -1;
            for (let i = previousMessages.length - 1; i >= 0; i--) {
                if (previousMessages[i].role === 'user') {
                    userMessageIndex = i;
                    break;
                }
            }
            if (userMessageIndex === -1) {
                throw new Error('No user message found for context');
            }
            const userMessage = this.messages[userMessageIndex];
            // Show loading indicator
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Regenerating response...",
                cancellable: false
            }, async (progress) => {
                // Simulate regeneration (in real implementation, call AI)
                progress.report({ increment: 50 });
                // For now, just mark as regenerated
                message.content = `${message.content}\n\n[Regenerated at ${new Date().toLocaleTimeString()}]`;
                message.timestamp = new Date();
                this.updateWebview();
                vscode.window.showInformationMessage('Response regenerated successfully', 'OK');
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to regenerate message: ${error.message}`);
        }
    }
    async handleFileCommand(command, data) {
        try {
            const result = await this.extension.executeFileCommand(command, data);
            this.sendMessageToWebview('fileCommandResult', { command, result });
            // 同时将结果显示为聊天消息
            this.addAssistantMessage(this.formatFileCommandResult(command, result));
        }
        catch (error) {
            this.sendMessageToWebview('fileCommandError', { command, error: error.message });
            this.addAssistantMessage(`File command "${command}" failed: ${error.message}`);
        }
    }
    sendMessageToWebview(command, data) {
        this.panel.webview.postMessage({ command, ...data });
    }
    updateWebview() {
        this.panel.webview.html = this.getWebviewContent();
        // Send model info to webview
        const modelInfo = this.extension.getModelInfo();
        this.sendMessageToWebview('modelInfo', { modelInfo });
    }
    getWebviewContent() {
        const config = this.extension.getConfig();
        // Messages HTML for chat display
        const messagesHtml = this.messages.map(msg => `
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
          <span class="role">${msg.role === 'user' ? (msg.isExternal ? 'You (Editor)' : 'You') : msg.role === 'assistant' ? 'CodeLine' : 'System'}</span>
          <span class="time">${msg.timestamp.toLocaleTimeString()}</span>
        </div>
        <div class="message-content">
          ${this.escapeHtml(msg.content)}
        </div>
      </div>
    `).join('');
        // Recent tasks HTML (last 3 messages)
        const recentTasks = this.messages.slice(-3).reverse();
        const recentTasksHtml = recentTasks.length > 0 ? recentTasks.map((msg, index) => `
      <div class="recent-task" data-id="${msg.id}">
        <div class="recent-task-preview">
          ${msg.content.substring(0, 80)}${msg.content.length > 80 ? '...' : ''}
        </div>
        <div class="recent-task-meta">
          <span class="recent-task-role">${msg.role}${msg.isExternal ? ' (Editor)' : ''}</span>
          <span class="recent-task-time">${msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    `).join('') : `
      <div class="no-recent-tasks">
        No recent tasks. Start a new conversation!
      </div>
    `;
        // Settings panel HTML (hidden by default)
        const settingsPanelHtml = `
      <div class="settings-panel" id="settingsPanel" style="display: none;">
        <div class="settings-header">
          <button class="settings-back-btn" onclick="closeSettingsPanel()">← Back</button>
          <h3>Settings</h3>
        </div>
        
        <div class="settings-content">
          <div class="settings-section">
            <h4>API Configuration</h4>
            
            <div class="form-group">
              <label for="apiKey">API Key</label>
              <input type="password" id="apiKey" value="${config.apiKey || ''}" placeholder="Enter your API key">
              <div class="help-text">Your API key for AI services</div>
            </div>
            
            <div class="form-group">
              <label for="model">Default Model</label>
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
          </div>
          
          <div class="settings-section">
            <h4>Features</h4>
            
            <div class="form-group checkbox">
              <input type="checkbox" id="autoAnalyze" ${config.autoAnalyze ? 'checked' : ''}>
              <label for="autoAnalyze">Auto-analyze project on startup</label>
            </div>
            
            <div class="form-group checkbox">
              <input type="checkbox" id="showExamples" ${config.showExamples !== false ? 'checked' : ''}>
              <label for="showExamples">Show example tasks</label>
            </div>
          </div>
          
          <div class="settings-actions">
            <button id="saveSettings" class="primary">Save Settings</button>
            <button id="resetSettings">Reset to Defaults</button>
          </div>
        </div>
      </div>
    `;
        // MCP settings panel HTML
        const mcpSettingsPanelHtml = `
      <div class="settings-panel" id="mcpSettingsPanel">
        <div class="settings-header">
          <button class="settings-back-btn" onclick="switchView('chat')">← Back</button>
          <h3>MCP Servers</h3>
        </div>
        
        <div class="settings-content">
          <div class="settings-section">
            <h4>Configure MCP Servers</h4>
            <div class="mcp-server-list" id="mcpServerList">
              <div class="no-mcp-servers">
                No MCP servers configured.
              </div>
            </div>
            
            <div class="form-group">
              <button id="addMCPBtn">Add MCP Server</button>
            </div>
          </div>
          
          <div class="settings-section">
            <h4>About MCP</h4>
            <p class="help-text">
              MCP (Model Context Protocol) servers allow CodeLine to access external tools and data sources.
              Add servers to enhance CodeLine's capabilities with file system access, web search, database queries, and more.
            </p>
          </div>
        </div>
      </div>
    `;
        // History detail panel HTML
        const historyPanelHtml = `
      <div class="settings-panel" id="historyPanel" style="display: none;">
        <div class="settings-header">
          <button class="settings-back-btn" onclick="closeHistoryPanel()">← Back</button>
          <h3>History</h3>
        </div>
        
        <div class="settings-content">
          <div class="history-list">
            ${this.messages.length > 0 ? `
              <div class="history-items">
                ${this.messages.map((msg, index) => `
                  <div class="history-item" data-index="${index}">
                    <div class="history-item-header">
                      <span class="role">${msg.role}</span>
                      <span class="time">${msg.timestamp.toLocaleString()}</span>
                    </div>
                    <div class="history-item-content">
                      ${msg.content.substring(0, 150)}${msg.content.length > 150 ? '...' : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="empty-state">
                <p>No conversation history yet.</p>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
        // Auto-approve settings panel
        const autoApprovePanelHtml = `
      <div class="settings-panel" id="autoApprovePanel" style="display: none;">
        <div class="settings-header">
          <button class="settings-back-btn" onclick="closeAutoApprovePanel()">← Back</button>
          <h3>Auto-approve Settings</h3>
        </div>
        
        <div class="settings-content">
          <div class="settings-section">
            <h4>File Operations Permissions</h4>
            
            <div class="form-group checkbox">
              <input type="checkbox" id="autoApproveCreate" ${config.autoApproveCreate ? 'checked' : ''}>
              <label for="autoApproveCreate">Auto-approve file creation</label>
            </div>
            
            <div class="form-group checkbox">
              <input type="checkbox" id="autoApproveEdit" ${config.autoApproveEdit ? 'checked' : ''}>
              <label for="autoApproveEdit">Auto-approve file edits</label>
            </div>
            
            <div class="form-group checkbox">
              <input type="checkbox" id="autoApproveDelete" ${config.autoApproveDelete ? 'checked' : ''}>
              <label for="autoApproveDelete">Auto-approve file deletion</label>
            </div>
            
            <div class="form-group">
              <label for="autoApproveDelay">Auto-approve delay (seconds)</label>
              <input type="number" id="autoApproveDelay" value="${config.autoApproveDelay || 5}" min="0" max="60">
              <div class="help-text">Delay before auto-approving operations (0 = immediate)</div>
            </div>
          </div>
          
          <div class="settings-actions">
            <button id="saveAutoApproveSettings" class="primary">Save Settings</button>
          </div>
        </div>
      </div>
    `;
        // Account settings panel HTML
        const accountPanelHtml = `
      <div class="settings-panel">
        <div class="settings-header">
          <h3>Account</h3>
        </div>
        
        <div class="settings-content">
          <div class="settings-section">
            <h4>Profile Information</h4>
            
            <div class="account-info">
              <div class="account-avatar">
                <div class="avatar-placeholder">👤</div>
              </div>
              
              <div class="account-details">
                <h5>CodeLine User</h5>
                <p class="account-email">user@example.com</p>
                <p class="account-status">
                  <span class="status-indicator active"></span>
                  <span>Active</span>
                </p>
              </div>
            </div>
          </div>
          
          <div class="settings-section">
            <h4>Subscription</h4>
            
            <div class="subscription-info">
              <div class="subscription-tier">
                <h5>Free Tier</h5>
                <p>Basic features available</p>
              </div>
              
              <div class="usage-stats">
                <div class="usage-item">
                  <span class="usage-label">API Credits:</span>
                  <span class="usage-value">Unlimited</span>
                </div>
                <div class="usage-item">
                  <span class="usage-label">Requests Today:</span>
                  <span class="usage-value">12 / Unlimited</span>
                </div>
                <div class="usage-item">
                  <span class="usage-label">Storage:</span>
                  <span class="usage-value">512 MB / 1 GB</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="settings-section">
            <h4>Connected Services</h4>
            
            <div class="connected-services">
              <div class="service-item">
                <div class="service-icon">🔑</div>
                <div class="service-info">
                  <h6>API Key</h6>
                  <p>Configured</p>
                </div>
                <button class="service-action">Manage</button>
              </div>
              
              <div class="service-item">
                <div class="service-icon">🔄</div>
                <div class="service-info">
                  <h6>Model Providers</h6>
                  <p>DeepSeek, OpenAI, Anthropic, Qwen</p>
                </div>
                <button class="service-action">Configure</button>
              </div>
              
              <div class="service-item">
                <div class="service-icon">⚡</div>
                <div class="service-info">
                  <h6>MCP Servers</h6>
                  <p>0 servers connected</p>
                </div>
                <button class="service-action" onclick="switchView('mcp')">Setup</button>
              </div>
            </div>
          </div>
          
          <div class="settings-actions">
            <button id="signOutBtn" class="secondary">Sign Out</button>
            <button id="upgradeAccountBtn" class="primary">Upgrade Account</button>
          </div>
        </div>
      </div>
    `;
        // Define view HTML variables
        const historyHtml = historyPanelHtml;
        const settingsHtml = settingsPanelHtml;
        const mcpHtml = mcpSettingsPanelHtml;
        const accountHtml = accountPanelHtml;
        return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CodeLine - AI Coding Assistant</title>
        <style>
          /* Cline Style - CodeLine复刻 */
          * {
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            margin: 0;
            padding: 0;
            background: #0d1117; /* GitHub深色主题背景 */
            color: #c9d1d9;
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          
          /* Navigation - Cline Style */
          .nav {
            display: flex;
            background: #161b22; /* GitHub dark theme navigation background */
            border-bottom: 1px solid #3e3e42;
            padding: 0 16px;
            height: 48px;
            align-items: center;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
          }
          
          .nav-item {
            padding: 8px 16px;
            background: none;
            border: none;
            color: #c9d1d9; /* GitHub dark theme text color */
            font-size: 13px;
            cursor: pointer;
            border-radius: 6px; /* Increased roundness */
            display: flex;
            align-items: center;
            gap: 6px;
            transition: background-color 0.2s, color 0.2s;
          }
          
          .nav-item:hover {
            background: #2a2d2e;
          }
          
          .nav-item.active {
            color: #ffffff;
            background: #2a2d2e;
          }
          
          .nav-icon {
            font-size: 14px;
          }
          
          .nav-spacer {
            flex: 1;
          }
          
          .model-info {
            padding: 8px 12px;
            font-size: 11px;
            color: #4ec9b0;
            background: #2a2d2e;
            border-radius: 6px; /* Increased roundness */
            border: 1px solid #3e3e42;
            box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
          }
          
          /* Main content */
          .main-content {
            flex: 1;
            overflow: auto;
            padding: 0;
            display: flex;
            flex-direction: column;
          }
          
          /* Chat view */
          .chat-view {
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          
          .chat-container {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            padding-bottom: 0;
          }
          
          .message {
            margin-bottom: 24px;
            padding: 18px 20px;
            border-radius: 16px;
            background: linear-gradient(135deg, #2d2d30 0%, #252526 100%);
            border: 1px solid #3e3e42;
            max-width: 85%;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            position: relative;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            opacity: 0;
            transform: translateY(10px);
            animation: messageAppear 0.4s ease-out forwards;
          }
          
          .message:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
            border-color: #4a4a4e;
          }
          
          .message.user {
            background: linear-gradient(135deg, #007acc 0%, #0062a3 100%);
            border-color: #007acc;
            margin-left: auto;
            color: white;
          }
          
          .message.assistant {
            background: linear-gradient(135deg, #1a4731 0%, #0d3823 100%);
            border-color: #4ec9b0;
            margin-right: auto;
          }
          
          .message.system {
            background: linear-gradient(135deg, #4a1c1c 0%, #331212 100%);
            border-color: #f44747;
            margin-left: auto;
            margin-right: auto;
            max-width: 90%;
          }
          
          /* Message actions (copy, edit, regenerate) */
          .message-actions {
            position: absolute;
            top: 8px;
            right: 8px;
            display: flex;
            gap: 6px;
            opacity: 0;
            transition: opacity 0.2s;
          }
          
          .message:hover .message-actions {
            opacity: 1;
          }
          
          .message-action {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: rgba(255, 255, 255, 0.8);
            border-radius: 6px;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
          }
          
          .message-action:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.1);
          }
          
          /* Message animation */
          @keyframes messageAppear {
            0% {
              opacity: 0;
              transform: translateY(10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          /* Staggered animation for multiple messages */
          .message:nth-child(1) { animation-delay: 0.1s; }
          .message:nth-child(2) { animation-delay: 0.2s; }
          .message:nth-child(3) { animation-delay: 0.3s; }
          .message:nth-child(4) { animation-delay: 0.4s; }
          .message:nth-child(5) { animation-delay: 0.5s; }
          
          .message-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .message.user .message-header {
            color: rgba(255, 255, 255, 0.9);
          }
          
          .message.assistant .message-header {
            color: #4ec9b0;
          }
          
          .message.system .message-header {
            color: #f44747;
          }
          
          .message-content {
            white-space: pre-wrap;
            line-height: 1.6;
            font-family: 'Consolas', 'Monaco', 'JetBrains Mono', monospace;
            font-size: 14px;
            color: inherit;
          }
          }
          
          .message-content code {
            background: #2d2d30;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Consolas', 'Monaco', monospace;
          }
          
          .message-content pre {
            background: #2d2d30;
            padding: 12px;
            border-radius: 8px; /* Increased roundness */
            overflow-x: auto;
            margin: 8px 0;
            border: 1px solid #3e3e42;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          
          .message-content pre code {
            background: none;
            padding: 0;
          }
          
          .chat-controls {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            padding: 0 20px;
            padding-top: 20px;
            border-bottom: 1px solid #3e3e42;
            padding-bottom: 20px;
          }
          
          .chat-controls button {
            background: linear-gradient(135deg, #3e3e42 0%, #4a4a4e 100%);
            color: #d4d4d4;
            border: none;
            padding: 8px 16px;
            border-radius: 6px; /* Increased roundness */
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
          }
          
          .chat-controls button:hover {
            background: linear-gradient(135deg, #4a4a4e 0%, #56565a 100%);
            transform: translateY(-1px);
          }
          
          .file-controls {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            padding: 0 20px;
            padding-top: 10px;
            flex-wrap: wrap;
          }
          
          .file-controls button {
            background: linear-gradient(135deg, #0d3c61 0%, #1a4f7a 100%);
            color: #d4d4d4;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
          }
          
          .file-controls button:hover {
            background: linear-gradient(135deg, #1a4f7a 0%, #256a9a 100%);
            transform: translateY(-1px);
          }
          
          .input-container {
            display: flex;
            gap: 12px;
            padding: 20px;
            border-top: 1px solid #3e3e42;
            background: #252526;
          }
          
          textarea {
            flex: 1;
            padding: 12px;
            border: 1px solid #3e3e42;
            border-radius: 8px; /* Increased roundness */
            background: #1e1e1e;
            color: #d4d4d4;
            font-family: inherit;
            font-size: 14px;
            resize: none;
            min-height: 60px;
            transition: border-color 0.2s;
          }
          
          textarea:focus {
            outline: none;
            border-color: #007acc;
          }
          
          #sendButton {
            padding: 12px 24px;
            background: #007acc;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            align-self: flex-end;
          }
          
          #sendButton:hover {
            background: #0062a3;
          }
          
          #sendButton:disabled {
            background: #3e3e42;
            cursor: not-allowed;
          }
          
          .typing-indicator {
            display: none;
            padding: 10px;
            color: #4ec9b0;
            font-style: italic;
            text-align: center;
          }
          
          .typing-indicator.active {
            display: block;
          }
          
          .typing-indicator::after {
            content: '...';
            animation: dots 1.5s infinite;
          }
          
          @keyframes dots {
            0%, 20% { content: '.'; }
            40% { content: '..'; }
            60%, 100% { content: '...'; }
          }
          
          /* Settings view */
          .settings-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          
          .settings-container h2 {
            margin-top: 0;
            color: #4ec9b0;
          }
          
          .settings-section {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #3e3e42;
          }
          
          .settings-section h3 {
            color: #d4d4d4;
            margin-bottom: 16px;
            font-size: 16px;
          }
          
          .form-group {
            margin-bottom: 20px;
          }
          
          .form-group label {
            display: block;
            margin-bottom: 6px;
            font-size: 14px;
            color: #cccccc;
          }
          
          .form-group input[type="text"],
          .form-group input[type="password"],
          .form-group input[type="number"],
          .form-group select {
            width: 100%;
            padding: 10px;
            background: #252526;
            border: 1px solid #3e3e42;
            border-radius: 4px;
            color: #d4d4d4;
            font-size: 14px;
          }
          
          .form-group input[type="range"] {
            width: 200px;
            margin-right: 10px;
          }
          
          .help-text {
            font-size: 12px;
            color: #858585;
            margin-top: 4px;
          }
          
          .checkbox {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .checkbox input[type="checkbox"] {
            width: auto;
          }
          
          .checkbox label {
            margin-bottom: 0;
          }
          
          .settings-actions {
            display: flex;
            gap: 10px;
            margin-top: 30px;
          }
          
          .settings-actions button {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          }
          
          .settings-actions .primary {
            background: #007acc;
            color: white;
          }
          
          .settings-actions .primary:hover {
            background: #0062a3;
          }
          
          .settings-actions button:not(.primary) {
            background: #3e3e42;
            color: #d4d4d4;
          }
          
          .settings-actions button:not(.primary):hover {
            background: #4e4e52;
          }
          
          /* History view */
          .history-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          
          .history-container h2 {
            margin-top: 0;
            color: #4ec9b0;
          }
          
          .history-item {
            padding: 15px;
            background: #252526;
            border-radius: 6px;
            margin-bottom: 10px;
            border-left: 4px solid transparent;
            cursor: pointer;
          }
          
          .history-item:hover {
            background: #2d2d30;
          }
          
          .history-item.user {
            border-left-color: #007acc;
          }
          
          .history-item.assistant {
            border-left-color: #4ec9b0;
          }
          
          .history-item.system {
            border-left-color: #f44747;
          }
          
          .history-item-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 12px;
            opacity: 0.8;
          }
          
          .history-item-content {
            font-size: 14px;
            line-height: 1.4;
          }
          
          .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: #858585;
          }
          
          /* View management */
          .view {
            display: none;
            height: 100%;
          }
          
          .view.active {
            display: flex;
            flex-direction: column;
          }
          
          /* Scrollbar styling */
          ::-webkit-scrollbar {
            width: 10px;
          }
          
          ::-webkit-scrollbar-track {
            background: #1e1e1e;
          }
          
          ::-webkit-scrollbar-thumb {
            background: #424242;
            border-radius: 5px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: #555555;
          }
          
          /* Cline-style Diff View Styles */
          .diff-container {
            margin: 12px 0;
            border: 1px solid #3e3e42;
            border-radius: 8px;
            overflow: hidden;
            background: #1e1e1e;
          }
          
          .diff-header {
            padding: 12px 16px;
            background: #252526;
            border-bottom: 1px solid #3e3e42;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .diff-header h3 {
            margin: 0;
            font-size: 14px;
            font-weight: 500;
            color: #d4d4d4;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          }
          
          .diff-summary {
            font-size: 12px;
            color: #858585;
            margin-top: 4px;
          }
          
          .diff-actions {
            display: flex;
            gap: 8px;
          }
          
          .diff-action-btn {
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          
          .diff-approve {
            background: #2d7d46;
            color: white;
          }
          
          .diff-approve:hover {
            background: #236b3a;
          }
          
          .diff-reject {
            background: #c42b1c;
            color: white;
          }
          
          .diff-reject:hover {
            background: #a82316;
          }
          
          .diff-review {
            background: #007acc;
            color: white;
          }
          
          .diff-review:hover {
            background: #0062a3;
          }
          
          .diff-content {
            padding: 8px 0;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 12px;
            line-height: 1.4;
            max-height: 300px;
            overflow-y: auto;
          }
          
          .diff-line {
            padding: 2px 12px;
            display: flex;
            min-height: 20px;
            align-items: center;
            border-left: 4px solid transparent;
          }
          
          .diff-line:hover {
            background: #2d2d30;
          }
          
          .diff-line-info {
            width: 100px;
            min-width: 100px;
            color: #858585;
            font-size: 11px;
            text-align: right;
            padding-right: 12px;
            user-select: none;
          }
          
          .diff-line-content {
            flex: 1;
            white-space: pre;
            overflow-x: auto;
          }
          
          .diff-added {
            border-left-color: #2d7d46;
            background: rgba(45, 125, 70, 0.1);
          }
          
          .diff-removed {
            border-left-color: #c42b1c;
            background: rgba(196, 43, 28, 0.1);
          }
          
          .diff-modified {
            border-left-color: #d19a66;
            background: rgba(209, 154, 102, 0.1);
          }
          
          /* Collapsible diff */
          .diff-collapsible {
            cursor: pointer;
          }
          
          .diff-collapsible-header {
            padding: 8px 16px;
            background: #2d2d30;
            border-bottom: 1px solid #3e3e42;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .diff-collapsible-header:hover {
            background: #37373a;
          }
          
          .diff-collapsible-content {
            display: none;
          }
          
          .diff-collapsible.expanded .diff-collapsible-content {
            display: block;
          }
          
          .diff-icon {
            margin-right: 8px;
            font-size: 12px;
          }
          
          /* Terminal result styles (Cline风格) */
          .terminal-result {
            border: 1px solid #3e3e42;
            border-radius: 8px;
            margin: 16px 0;
            background: #252526;
            overflow: hidden;
            font-family: 'SF Mono', 'Consolas', 'Monaco', 'Courier New', monospace;
          }
          
          .terminal-result.terminal-success {
            border-left: 4px solid #30d158;
          }
          
          .terminal-result.terminal-error {
            border-left: 4px solid #ff453a;
          }
          
          .terminal-header {
            padding: 12px 16px;
            background: #2d2d30;
            border-bottom: 1px solid #3e3e42;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .terminal-header h3 {
            margin: 0;
            font-size: 14px;
            color: #d4d4d4;
            font-weight: 500;
          }
          
          .terminal-meta {
            font-size: 11px;
            color: #cccccc;
            display: flex;
            gap: 12px;
          }
          
          .terminal-meta span {
            padding: 2px 6px;
            background: #3e3e42;
            border-radius: 3px;
          }
          
          .terminal-command {
            padding: 12px 16px;
            background: #1e1e1e;
            border-bottom: 1px solid #3e3e42;
            font-size: 13px;
          }
          
          .terminal-command code {
            color: #4ec9b0;
            font-weight: 600;
          }
          
          .terminal-output {
            padding: 16px;
            max-height: 300px;
            overflow-y: auto;
            background: #1e1e1e;
          }
          
          .terminal-output pre {
            margin: 0;
            font-size: 12px;
            color: #d4d4d4;
            white-space: pre-wrap;
            word-break: break-all;
            line-height: 1.4;
          }
          
          .terminal-error-output {
            padding: 12px 16px;
            background: rgba(255, 69, 58, 0.1);
            border-top: 1px solid rgba(255, 69, 58, 0.3);
          }
          
          .terminal-error-output h4 {
            margin: 0 0 8px 0;
            color: #ff453a;
            font-size: 12px;
            font-weight: 600;
          }
          
          .terminal-error-output pre {
            margin: 0;
            font-size: 12px;
            color: #ff453a;
            white-space: pre-wrap;
          }
          
          .terminal-analysis {
            padding: 12px 16px;
            background: #2d2d30;
            border-top: 1px solid #3e3e42;
            font-size: 12px;
          }
          
          .terminal-analysis h4 {
            margin: 0 0 8px 0;
            color: #cccccc;
            font-weight: 600;
          }
          
          .terminal-analysis ul {
            margin: 0;
            padding-left: 16px;
            color: #a5a5a5;
          }
          
          .terminal-analysis li {
            margin-bottom: 4px;
          }
          
          /* Terminal controls for active commands */
          .terminal-controls {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
            padding: 8px;
            background: #2d2d30;
            border-radius: 6px;
            border: 1px solid #3e3e42;
          }
          
          .terminal-control-btn {
            padding: 6px 12px;
            background: #007acc;
            border: none;
            border-radius: 4px;
            color: white;
            font-size: 12px;
            cursor: pointer;
            font-weight: 500;
            transition: background 0.2s;
          }
          
          .terminal-control-btn:hover {
            background: #0e639c;
          }
          
          .terminal-control-btn.stop {
            background: #ff453a;
          }
          
          .terminal-control-btn.stop:hover {
            background: #e53935;
          }
          
          /* Real-time output animation */
          .terminal-live-output {
            border: 1px solid #3e3e42;
            border-radius: 6px;
            margin: 12px 0;
            background: #1e1e1e;
            max-height: 200px;
            overflow-y: auto;
            padding: 12px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 12px;
          }
          
          .terminal-live-output .line {
            padding: 2px 0;
            color: #d4d4d4;
            white-space: pre-wrap;
            animation: fadeIn 0.3s ease-out;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(2px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          /* Command history */
          .terminal-history {
            margin-top: 16px;
            border-top: 1px solid #3e3e42;
            padding-top: 12px;
          }
          
          .terminal-history h4 {
            margin: 0 0 8px 0;
            color: #cccccc;
            font-size: 12px;
            font-weight: 600;
          }
          
          .terminal-history-list {
            max-height: 150px;
            overflow-y: auto;
            background: #1e1e1e;
            border-radius: 4px;
            padding: 8px;
          }
          
          .terminal-history-item {
            padding: 6px 8px;
            border-bottom: 1px solid #2d2d30;
            font-size: 11px;
            color: #a5a5a5;
            cursor: pointer;
            transition: background 0.2s;
          }
          
          .terminal-history-item:hover {
            background: #2d2d30;
          }
          
          .terminal-history-item:last-child {
            border-bottom: none;
          }
          
          .terminal-history-item.success code {
            color: #30d158;
          }
          
          .terminal-history-item.error code {
            color: #ff453a;
          }
          
          /* File operation status */
          .file-status {
            display: inline-flex;
            align-items: center;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
            margin-left: 8px;
          }
          
          .file-status-created {
            background: rgba(45, 125, 70, 0.2);
            color: #4ec9b0;
          }
          
          .file-status-modified {
            background: rgba(209, 154, 102, 0.2);
            color: #d19a66;
          }
          
          .file-status-deleted {
            background: rgba(196, 43, 28, 0.2);
            color: #f44747;
          }
          
          /* Task steps visualization */
          .task-steps {
            margin: 12px 0;
            background: #252526;
            border-radius: 6px;
            padding: 12px;
          }
          
          .task-step {
            display: flex;
            align-items: center;
            padding: 8px;
            margin: 4px 0;
            border-radius: 4px;
            background: #2d2d30;
          }
          
          .task-step-status {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            font-size: 12px;
          }
          
          .task-step.completed .task-step-status {
            background: #2d7d46;
            color: white;
          }
          
          .task-step.failed .task-step-status {
            background: #c42b1c;
            color: white;
          }
          
          .task-step.pending .task-step-status {
            background: #3e3e42;
            color: #858585;
          }
          
          .task-step.executing .task-step-status {
            background: #007acc;
            color: white;
            animation: pulse 1.5s infinite;
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          .task-step-info {
            flex: 1;
          }
          
          .task-step-title {
            font-weight: 500;
            font-size: 13px;
          }
          
          .task-step-desc {
            font-size: 11px;
            color: #858585;
            margin-top: 2px;
          }
          
          /* Account Panel Styles */
          .account-info {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 24px;
            padding-bottom: 24px;
            border-bottom: 1px solid #3e3e42;
          }
          
          .account-avatar {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: #2a2d2e;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
          }
          
          .account-details h5 {
            margin: 0 0 4px 0;
            font-size: 18px;
            color: #ffffff;
          }
          
          .account-email {
            margin: 0 0 8px 0;
            color: #858585;
            font-size: 14px;
          }
          
          .account-status {
            display: flex;
            align-items: center;
            gap: 6px;
            margin: 0;
            font-size: 14px;
            color: #4ec9b0;
          }
          
          .status-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #4ec9b0;
          }
          
          .status-indicator.active {
            background: #4ec9b0;
          }
          
          .subscription-info {
            margin-bottom: 24px;
          }
          
          .subscription-tier h5 {
            margin: 0 0 4px 0;
            font-size: 16px;
            color: #ffffff;
          }
          
          .subscription-tier p {
            margin: 0 0 16px 0;
            color: #858585;
            font-size: 14px;
          }
          
          .usage-stats {
            background: #1e1e1e;
            border-radius: 8px;
            padding: 16px;
            border: 1px solid #3e3e42;
          }
          
          .usage-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #2d2d30;
          }
          
          .usage-item:last-child {
            border-bottom: none;
          }
          
          .usage-label {
            color: #cccccc;
            font-size: 13px;
          }
          
          .usage-value {
            color: #ffffff;
            font-weight: 500;
            font-size: 13px;
          }
          
          .connected-services {
            margin-bottom: 24px;
          }
          
          .service-item {
            display: flex;
            align-items: center;
            padding: 12px;
            background: #1e1e1e;
            border-radius: 8px;
            border: 1px solid #3e3e42;
            margin-bottom: 12px;
          }
          
          .service-item:last-child {
            margin-bottom: 0;
          }
          
          .service-icon {
            font-size: 20px;
            margin-right: 12px;
          }
          
          .service-info {
            flex: 1;
          }
          
          .service-info h6 {
            margin: 0 0 4px 0;
            font-size: 14px;
            color: #ffffff;
          }
          
          .service-info p {
            margin: 0;
            color: #858585;
            font-size: 12px;
          }
          
          .service-action {
            padding: 6px 12px;
            background: #2a2d2e;
            color: #d4d4d4;
            border: 1px solid #3e3e42;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          
          .service-action:hover {
            background: #3e3e42;
          }
        </style>
      </head>
      <body>
        <!-- Navigation - Cline Style -->
        <div class="nav">
          <button class="nav-item ${this.currentView === 'chat' ? 'active' : ''}" data-view="chat">
            <span class="nav-icon">+</span>
            <span>New Chat</span>
          </button>
          <button class="nav-item ${this.currentView === 'mcp' ? 'active' : ''}" data-view="mcp">
            <span class="nav-icon">🖥️</span>
            <span>MCP</span>
          </button>
          <button class="nav-item ${this.currentView === 'history' ? 'active' : ''}" data-view="history">
            <span class="nav-icon">📜</span>
            <span>History</span>
          </button>
          <button class="nav-item ${this.currentView === 'account' ? 'active' : ''}" data-view="account">
            <span class="nav-icon">👤</span>
            <span>Account</span>
          </button>
          <button class="nav-item ${this.currentView === 'settings' ? 'active' : ''}" data-view="settings">
            <span class="nav-icon">⚙️</span>
            <span>Settings</span>
          </button>
          
          <div class="nav-spacer"></div>
          
          <div class="model-info" id="modelInfo">
            ${this.extension.getModelInfo()}
          </div>
        </div>
        
        <!-- Main Content -->
        <div class="main-content">
          <!-- Chat View -->
          <div class="view ${this.currentView === 'chat' ? 'active' : ''}" id="chatView">
            <div class="chat-controls">
              <button onclick="executeSampleTask('Create a simple REST API endpoint')">Sample: REST API</button>
              <button onclick="executeSampleTask('Implement user authentication')">Sample: Auth</button>
              <button onclick="executeSampleTask('Fix syntax errors in current file')">Sample: Fix Errors</button>
              <button onclick="clearChat()">Clear Chat</button>
            </div>
            
            <div class="file-controls">
              <button onclick="executeFileCommand('listFiles')">📁 List Files</button>
              <button onclick="executeFileCommand('searchFiles')">🔍 Search Files</button>
              <button onclick="executeFileCommand('getStats')">📊 Workspace Stats</button>
              <button onclick="executeFileCommand('browseDirectory')">📂 Browse Directory</button>
            </div>
            
            <div class="chat-container" id="chatContainer">
              ${messagesHtml}
              <div id="typingIndicator" class="typing-indicator">
                CodeLine is thinking
              </div>
            </div>
            
            <div class="input-container">
              <textarea 
                id="messageInput" 
                placeholder="Describe what you want CodeLine to do (e.g., 'Create a login form', 'Fix this bug', 'Add validation')"
                onkeydown="handleKeydown(event)"
              ></textarea>
              <button id="sendButton" onclick="sendMessage()">Send</button>
            </div>
          </div>
          
          <!-- History View -->
          <div class="view ${this.currentView === 'history' ? 'active' : ''}" id="historyView">
            ${historyHtml}
          </div>
          
          <!-- Settings View -->
          <div class="view ${this.currentView === 'settings' ? 'active' : ''}" id="settingsView">
            ${settingsHtml}
          </div>
          
          <!-- MCP View -->
          <div class="view ${this.currentView === 'mcp' ? 'active' : ''}" id="mcpView">
            ${mcpHtml}
          </div>
          
          <!-- Account View -->
          <div class="view ${this.currentView === 'account' ? 'active' : ''}" id="accountView">
            ${accountHtml}
          </div>
        </div>
        
        <script>
          const vscode = acquireVsCodeApi();
          
          // View management
          const navItems = document.querySelectorAll('.nav-item');
          const views = document.querySelectorAll('.view');
          
          navItems.forEach(item => {
            item.addEventListener('click', () => {
              const view = item.getAttribute('data-view');
              switchView(view);
            });
          });
          
          function switchView(view) {
            // Update nav
            navItems.forEach(item => {
              item.classList.toggle('active', item.getAttribute('data-view') === view);
            });
            
            // Update views
            views.forEach(v => {
              v.classList.toggle('active', v.id === view + 'View');
            });
            
            // Notify extension
            vscode.postMessage({
              command: 'switchView',
              view: view
            });
          }
          
          // Chat functionality
          const chatContainer = document.getElementById('chatContainer');
          const messageInput = document.getElementById('messageInput');
          const sendButton = document.getElementById('sendButton');
          const typingIndicator = document.getElementById('typingIndicator');
          
          // Handle window messages
          window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.command) {
              case 'typing':
                typingIndicator.classList.toggle('active', message.isTyping);
                break;
              case 'history':
                // Handle history update
                break;
              case 'modelInfo':
                document.getElementById('modelInfo').textContent = message.modelInfo;
                break;
              case 'taskResult':
                console.log('Task result:', message.result);
                break;
              case 'taskError':
                console.error('Task error:', message.error);
                break;
              case 'configUpdated':
                // Update settings form with new config
                if (message.config) {
                  updateSettingsForm(message.config);
                }
                break;
              case 'diffActionResult':
                // Handle diff approval/rejection result
                console.log('Diff action result:', message);
                if (!message.success && message.error) {
                  // 显示错误
                  console.error('Diff action failed:', message.error);
                }
                break;
              case 'fileCommandResult':
                // Handle file command results
                console.log('File command result:', message.command, message.result);
                // 可以在这里添加UI更新，比如显示结果面板
                break;
              case 'fileCommandError':
                // Handle file command errors
                console.error('File command error:', message.command, message.error);
                // 可以在这里显示错误通知
                break;
              case 'externalMessage':
                // Handle external messages from editor commands
                console.log('External message received:', message);
                // Add the external message to chat
                addExternalMessageToChat(message.content, message.timestamp);
                break;
            }
          });
          
          function sendMessage() {
            const text = messageInput.value.trim();
            if (!text) return;
            
            vscode.postMessage({
              command: 'sendMessage',
              text: text
            });
            
            messageInput.value = '';
            messageInput.focus();
          }
          
          function addExternalMessageToChat(content, timestamp) {
            console.log('Adding external message to chat:', content);
            
            // Send to extension for processing
            vscode.postMessage({
              command: 'sendMessage',
              text: content,
              isExternal: true,
              externalTimestamp: timestamp
            });
            
            // Show typing indicator for assistant response
            const typingIndicator = document.getElementById('typingIndicator');
            typingIndicator.classList.add('active');
          }
          
          function executeSampleTask(task) {
            vscode.postMessage({
              command: 'executeTask',
              task: task
            });
          }
          
          function executeFileCommand(command) {
            vscode.postMessage({
              command: 'fileCommand',
              fileCommand: command
            });
          }
          
          function clearChat() {
            if (confirm('Clear all messages?')) {
              vscode.postMessage({
                command: 'clearChat'
              });
            }
          }
          
          // Settings functionality
          const temperatureSlider = document.getElementById('temperature');
          const temperatureValue = document.getElementById('temperatureValue');
          
          if (temperatureSlider && temperatureValue) {
            temperatureSlider.addEventListener('input', function() {
              temperatureValue.textContent = this.value;
            });
          }
          
          document.getElementById('saveSettings')?.addEventListener('click', saveSettings);
          document.getElementById('testConnection')?.addEventListener('click', testConnection);
          document.getElementById('resetSettings')?.addEventListener('click', resetSettings);
          
          function saveSettings() {
            const config = {
              apiKey: document.getElementById('apiKey').value,
              model: document.getElementById('model').value,
              baseUrl: document.getElementById('baseUrl').value || undefined,
              temperature: parseFloat(document.getElementById('temperature').value),
              maxTokens: parseInt(document.getElementById('maxTokens').value),
              autoAnalyze: document.getElementById('autoAnalyze').checked,
              showExamples: document.getElementById('showExamples').checked,
              typingIndicator: document.getElementById('typingIndicator').checked
            };
            
            vscode.postMessage({
              command: 'saveSettings',
              config: config
            });
          }
          
          function testConnection() {
            vscode.postMessage({
              command: 'testConnection'
            });
          }
          
          function resetSettings() {
            if (confirm('Reset all settings to defaults?')) {
              vscode.postMessage({
                command: 'resetSettings'
              });
            }
          }
          
          function updateSettingsForm(config) {
            if (!config) return;
            
            const apiKeyInput = document.getElementById('apiKey');
            const modelSelect = document.getElementById('model');
            const baseUrlInput = document.getElementById('baseUrl');
            const temperatureInput = document.getElementById('temperature');
            const temperatureValueSpan = document.getElementById('temperatureValue');
            const maxTokensInput = document.getElementById('maxTokens');
            const autoAnalyzeCheckbox = document.getElementById('autoAnalyze');
            const showExamplesCheckbox = document.getElementById('showExamples');
            const typingIndicatorCheckbox = document.getElementById('typingIndicator');
            
            if (apiKeyInput) apiKeyInput.value = config.apiKey || '';
            if (modelSelect) modelSelect.value = config.model || 'deepseek-chat';
            if (baseUrlInput) baseUrlInput.value = config.baseUrl || '';
            if (temperatureInput) {
              temperatureInput.value = config.temperature || 0.7;
              if (temperatureValueSpan) temperatureValueSpan.textContent = config.temperature || 0.7;
            }
            if (maxTokensInput) maxTokensInput.value = config.maxTokens || 2048;
            if (autoAnalyzeCheckbox) autoAnalyzeCheckbox.checked = !!config.autoAnalyze;
            if (showExamplesCheckbox) showExamplesCheckbox.checked = config.showExamples !== false;
            if (typingIndicatorCheckbox) typingIndicatorCheckbox.checked = config.typingIndicator !== false;
          }
          
          function handleKeydown(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              sendMessage();
            }
          }
          
          // Auto-resize textarea
          messageInput?.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 200) + 'px';
          });
          
          // Initial focus
          if (messageInput && document.getElementById('chatView').classList.contains('active')) {
            messageInput.focus();
          }
          
          // Scroll to bottom of chat container
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
          
          // Message action functions
          function copyMessage(messageId) {
            const messageElement = document.querySelector('.message[data-id="' + messageId + '"]');
            if (messageElement) {
              const contentElement = messageElement.querySelector('.message-content');
              if (contentElement) {
                const text = contentElement.textContent;
                navigator.clipboard.writeText(text)
                  .then(() => {
                    // Show feedback
                    const actionButton = messageElement.querySelector('[onclick*="copyMessage"]');
                    if (actionButton) {
                      const originalHTML = actionButton.innerHTML;
                      actionButton.innerHTML = '✓';
                      actionButton.style.color = '#4ec9b0';
                      setTimeout(() => {
                        actionButton.innerHTML = originalHTML;
                        actionButton.style.color = '';
                      }, 1500);
                    }
                  })
                  .catch(err => {
                    console.error('Failed to copy:', err);
                  });
              }
            }
          }
          
          function editMessage(messageId) {
            const messageElement = document.querySelector('.message[data-id="' + messageId + '"]');
            if (messageElement) {
              const contentElement = messageElement.querySelector('.message-content');
              if (contentElement) {
                const originalText = contentElement.textContent;
                // Replace content with editable textarea
                const textarea = document.createElement('textarea');
                textarea.value = originalText;
                textarea.style.width = '100%';
                textarea.style.height = '120px';
                textarea.style.padding = '8px';
                textarea.style.borderRadius = '6px';
                textarea.style.background = '#1e1e1e';
                textarea.style.color = '#d4d4d4';
                textarea.style.border = '1px solid #3e3e42';
                textarea.style.fontFamily = 'Consolas, Monaco, monospace';
                textarea.style.fontSize = '14px';
                
                const buttonContainer = document.createElement('div');
                buttonContainer.style.display = 'flex';
                buttonContainer.style.gap = '8px';
                buttonContainer.style.marginTop = '12px';
                
                const saveButton = document.createElement('button');
                saveButton.textContent = 'Save';
                saveButton.style.padding = '6px 12px';
                saveButton.style.background = '#007acc';
                saveButton.style.color = 'white';
                saveButton.style.border = 'none';
                saveButton.style.borderRadius = '4px';
                saveButton.style.cursor = 'pointer';
                
                const cancelButton = document.createElement('button');
                cancelButton.textContent = 'Cancel';
                cancelButton.style.padding = '6px 12px';
                cancelButton.style.background = '#3e3e42';
                cancelButton.style.color = '#d4d4d4';
                cancelButton.style.border = 'none';
                cancelButton.style.borderRadius = '4px';
                cancelButton.style.cursor = 'pointer';
                
                buttonContainer.appendChild(saveButton);
                buttonContainer.appendChild(cancelButton);
                
                contentElement.parentNode.replaceChild(textarea, contentElement);
                textarea.parentNode.insertBefore(buttonContainer, textarea.nextSibling);
                
                saveButton.onclick = () => {
                  const newText = textarea.value;
                  vscode.postMessage({
                    command: 'editMessage',
                    messageId: messageId,
                    newContent: newText
                  });
                  
                  // Restore content display
                  contentElement.textContent = newText;
                  textarea.parentNode.replaceChild(contentElement, textarea);
                  buttonContainer.remove();
                };
                
                cancelButton.onclick = () => {
                  textarea.parentNode.replaceChild(contentElement, textarea);
                  buttonContainer.remove();
                };
                
                textarea.focus();
                textarea.select();
              }
            }
          }
          
          function regenerateMessage(messageId) {
            vscode.postMessage({
              command: 'regenerateMessage',
              messageId: messageId
            });
          }
          
          // Handle diff approval/rejection clicks (event delegation)
          document.addEventListener('click', function(event) {
            const target = event.target as HTMLElement;
            
            // Check if it's a diff approve button
            if (target.classList.contains('diff-approve') || 
                target.closest('.diff-approve')) {
              const button = target.classList.contains('diff-approve') ? target : target.closest('.diff-approve');
              const filePath = button.getAttribute('data-file-path');
              const diffId = button.getAttribute('data-diff-id');
              
              console.log('Approving changes for:', filePath);
              vscode.postMessage({
                command: 'approveDiff',
                filePath,
                diffId,
                action: 'approve'
              });
              
              // Update UI
              const diffContainer = button.closest('.diff-container');
              if (diffContainer) {
                const actions = diffContainer.querySelector('.diff-actions');
                if (actions) {
                  actions.innerHTML = '<span style="color: #2d7d46; font-weight: 500;">✓ Approved</span>';
                }
              }
            }
            
            // Check if it's a diff reject button
            if (target.classList.contains('diff-reject') || 
                target.closest('.diff-reject')) {
              const button = target.classList.contains('diff-reject') ? target : target.closest('.diff-reject');
              const filePath = button.getAttribute('data-file-path');
              const diffId = button.getAttribute('data-diff-id');
              
              console.log('Rejecting changes for:', filePath);
              vscode.postMessage({
                command: 'approveDiff',
                filePath,
                diffId,
                action: 'reject'
              });
              
              // Update UI
              const diffContainer = button.closest('.diff-container');
              if (diffContainer) {
                const actions = diffContainer.querySelector('.diff-actions');
                if (actions) {
                  actions.innerHTML = '<span style="color: #c42b1c; font-weight: 500;">✗ Rejected</span>';
                }
              }
            }
          });
          
          // Handle collapsible diff sections
          document.addEventListener('click', function(event) {
            const target = event.target as HTMLElement;
            
            if (target.classList.contains('diff-collapsible-header') || 
                target.closest('.diff-collapsible-header')) {
              const header = target.classList.contains('diff-collapsible-header') ? 
                            target : target.closest('.diff-collapsible-header');
              const collapsible = header.closest('.diff-collapsible');
              
              if (collapsible) {
                collapsible.classList.toggle('expanded');
              }
            }
          });
          
          // Account panel functionality
          document.getElementById('signOutBtn')?.addEventListener('click', function() {
            if (confirm('Are you sure you want to sign out? This will clear your API keys and preferences.')) {
              vscode.postMessage({
                command: 'signOut'
              });
            }
          });
          
          document.getElementById('upgradeAccountBtn')?.addEventListener('click', function() {
            vscode.postMessage({
              command: 'upgradeAccount'
            });
          });
          
          document.getElementById('addMCPBtn')?.addEventListener('click', function() {
            vscode.postMessage({
              command: 'addMCP'
            });
          });
        </script>
      </body>
      </html>
    `;
    }
    escapeHtml(unsafe) {
        // 检查是否包含差异HTML（由FileManager.generateHtmlDiff生成）
        if (unsafe.includes('class="diff-')) {
            // 差异HTML已经安全，直接返回
            return unsafe.replace(/\n/g, "<br>").replace(/  /g, "&nbsp;&nbsp;");
        }
        // 检查是否包含终端结果HTML（由TerminalExecutor.generateHtmlReport生成）
        if (unsafe.includes('class="terminal-')) {
            // 终端HTML已经安全，直接返回
            return unsafe.replace(/\n/g, "<br>").replace(/  /g, "&nbsp;&nbsp;");
        }
        // 否则转义所有HTML标签
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .replace(/\n/g, "<br>")
            .replace(/  /g, "&nbsp;&nbsp;");
    }
    async handleSignOut() {
        try {
            // Clear configuration (API keys, etc.)
            const config = vscode.workspace.getConfiguration('codeline');
            // Reset all configuration keys to undefined (which will remove them)
            await config.update('apiKey', undefined, vscode.ConfigurationTarget.Global);
            await config.update('modelProvider', undefined, vscode.ConfigurationTarget.Global);
            await config.update('model', undefined, vscode.ConfigurationTarget.Global);
            await config.update('baseURL', undefined, vscode.ConfigurationTarget.Global);
            await config.update('temperature', undefined, vscode.ConfigurationTarget.Global);
            await config.update('maxTokens', undefined, vscode.ConfigurationTarget.Global);
            // Clear messages
            this.messages = [];
            this.currentView = 'chat';
            // Update webview
            this.updateWebview();
            vscode.window.showInformationMessage('Signed out successfully. All API keys and preferences have been cleared.', 'OK');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to sign out: ${error.message}`);
        }
    }
    async handleUpgradeAccount() {
        vscode.window.showInformationMessage('Account upgrade feature coming soon!', 'OK');
        // In a real implementation, this would open a payment portal or upgrade page
    }
    async handleAddMCP() {
        vscode.window.showInformationMessage('MCP server configuration coming soon!', 'OK');
        // In a real implementation, this would open a dialog to add MCP server configuration
    }
    /**
     * 处理流式任务执行请求
     */
    async handleTaskExecutionWithStream(task) {
        try {
            // 调用extension的流式任务执行API
            // 注意：这里需要extension支持executeTaskWithStream方法
            const result = await this.extension.executeTaskWithStream(task, {
                onEvent: (event) => {
                    // 将事件转发到Webview
                    this.sendMessageToWebview('task_event', { event });
                },
                onProgress: (progress, message) => {
                    // 发送进度更新到Webview
                    this.sendMessageToWebview('task_progress', { progress, message });
                },
                enableEventStream: true
            });
            // 任务完成后发送最终结果
            this.sendMessageToWebview('task_result', { result });
        }
        catch (error) {
            this.sendMessageToWebview('task_error', { error: error.message });
        }
    }
    /**
     * 处理从extension转发过来的任务事件
     * 用于扩展的事件转发机制
     */
    async handleTaskEvent(event) {
        // 直接将事件转发到Webview
        this.sendMessageToWebview('task_event', { event });
    }
    /**
     * 处理加载自动批准设置请求
     */
    async handleLoadAutoApproveSettings() {
        try {
            // 返回当前自动批准设置
            this.sendMessageToWebview('autoApproveSettingsLoaded', {
                success: true,
                settings: this.autoApprovalSettings
            });
        }
        catch (error) {
            console.error('加载自动批准设置失败:', error);
            this.sendMessageToWebview('autoApproveSettingsLoaded', {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    /**
     * 处理更新自动批准设置请求
     */
    async handleUpdateAutoApproveSettings(settings) {
        try {
            // 验证设置版本
            const currentVersion = this.autoApprovalSettings.version || 1;
            const newVersion = settings.version || 1;
            if (newVersion <= currentVersion) {
                throw new Error(`设置版本过时。当前版本: ${currentVersion}, 接收版本: ${newVersion}`);
            }
            // 更新设置
            this.autoApprovalSettings = settings;
            // 更新权限管理器的自动批准设置
            this.permissionManager.setAutoApprovalSettings(settings);
            // 保存到扩展存储
            if (this.context.globalState) {
                await this.context.globalState.update('codeline.autoApprovalSettings', settings);
            }
            this.sendMessageToWebview('autoApproveSettingsUpdated', {
                success: true,
                version: settings.version
            });
            // 通知所有组件设置已更新
            this.sendMessageToWebview('autoApproveSettingsChanged', {
                settings: this.autoApprovalSettings
            });
        }
        catch (error) {
            console.error('保存自动批准设置失败:', error);
            this.sendMessageToWebview('autoApproveSettingsUpdateError', {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    /**
     * 处理加载配置请求
     */
    async handleLoadConfig() {
        try {
            // 确保配置已加载
            await this.configManager.load();
            const config = this.configManager.getConfig();
            this.sendMessageToWebview('configLoaded', {
                success: true,
                config
            });
        }
        catch (error) {
            console.error('加载配置失败:', error);
            this.sendMessageToWebview('configLoaded', {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    /**
     * 处理保存配置请求
     */
    async handleSaveConfig(config) {
        try {
            // 更新配置
            const success = await this.configManager.updateConfig(config);
            if (success) {
                this.sendMessageToWebview('configSaved', {
                    success: true,
                    message: 'Configuration saved successfully'
                });
                // 通知所有组件配置已更新
                this.sendMessageToWebview('configUpdated', {
                    config: this.configManager.getConfig()
                });
            }
            else {
                this.sendMessageToWebview('configSaved', {
                    success: false,
                    error: 'Failed to save configuration'
                });
            }
        }
        catch (error) {
            console.error('保存配置失败:', error);
            this.sendMessageToWebview('configSaved', {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    dispose() {
        CodeLineChatPanel.currentPanel = undefined;
        // 清理工具进度服务
        this.toolProgressService.clearWebviewPanel();
        this.panel.dispose();
    }
}
exports.CodeLineChatPanel = CodeLineChatPanel;
//# sourceMappingURL=chatPanel.js.map