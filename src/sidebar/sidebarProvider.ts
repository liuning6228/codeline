import * as vscode from 'vscode';
import { TaskEngine, TaskResult, TaskStep } from '../task/taskEngine';
import { DiffViewer, ChangedFile } from '../diff/diffViewer';
import { FileManager, FileDiff } from '../file/fileManager';
import { createPermissionManager } from '../auth/PermissionManager';
import { AutoApprovalSettings } from '../auth/PermissionManager';

/**
 * 待处理的文件差异
 */
interface PendingDiff {
    diffId: string;
    filePath: string;
    diff: FileDiff;
    timestamp: Date;
}

export class CodeLineSidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'codeline.chat';
    
    private _view?: vscode.WebviewView;
    private _extension: any;
    private _currentView: string = 'chat';
    
    // 新增：任务引擎和权限管理
    private _taskEngine: TaskEngine | null = null;
    private _permissionManager = createPermissionManager();
    private _fileManager: FileManager | null = null;
    private _pendingDiffs: Map<string, PendingDiff> = new Map();
    
    // 自动批准设置
    private _autoApprovalSettings: AutoApprovalSettings = {
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
    
    constructor(context: vscode.ExtensionContext, extension: any) {
        this._extension = extension;
        this.loadAutoApprovalSettings(context);
    }
    
    /**
     * 设置任务引擎
     */
    public setTaskEngine(taskEngine: TaskEngine): void {
        this._taskEngine = taskEngine;
    }
    
    /**
     * 设置文件管理器
     */
    public setFileManager(fileManager: FileManager): void {
        this._fileManager = fileManager;
    }
    
    /**
     * 加载自动批准设置
     */
    private loadAutoApprovalSettings(context: vscode.ExtensionContext): void {
        const savedSettings = context.globalState.get('codeline.autoApprovalSettings') as Partial<AutoApprovalSettings>;
        if (savedSettings) {
            this._autoApprovalSettings = {
                ...this._autoApprovalSettings,
                ...savedSettings,
                actions: {
                    ...this._autoApprovalSettings.actions,
                    ...(savedSettings.actions || {})
                }
            };
        }
        this._permissionManager.setAutoApprovalSettings(this._autoApprovalSettings);
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
                // New message types for enhanced functionality
                case 'requestState':
                    await this.handleRequestState(webviewView);
                    break;
                case 'executeTask':
                    await this.handleExecuteTask(message.text, message.images, message.files, webviewView);
                    break;
                case 'setMode':
                    await this.handleSetMode(message.mode, webviewView);
                    break;
                case 'toggleMode':
                    await this.handleToggleMode(webviewView);
                    break;
                case 'clearTask':
                    await this.handleClearTask(webviewView);
                    break;
                case 'approveDiff':
                    await this.handleApproveDiff(message.diffId, message.action, webviewView);
                    break;
                case 'previewDiff':
                    await this.handlePreviewDiff(message.diffId, message.filePath, webviewView);
                    break;
                case 'setAutoApprove':
                    await this.handleSetAutoApprove(message.permission, message.enabled, webviewView);
                    break;
                case 'setYoloMode':
                    await this.handleSetYoloMode(message.enabled, webviewView);
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
            
            // 显示处理中状态
            webviewView.webview.postMessage({
                command: 'setProcessing',
                isProcessing: true
            });
            
            // 优先使用TaskEngine执行任务（支持文件操作和权限检查）
            if (this._taskEngine) {
                console.log('使用TaskEngine执行任务...');
                const result = await this.executeTaskWithPermissionCheck(text, webviewView);
                
                // 显示结果
                webviewView.webview.postMessage({
                    command: 'addMessage',
                    role: 'assistant',
                    content: result.output || result.error || '任务执行完成',
                    id: (Date.now() + 1).toString(),
                    timestamp: new Date(),
                    steps: result.steps,
                    pendingDiffs: Array.from(this._pendingDiffs.entries()).map(([id, diff]) => ({
                        diffId: id,
                        filePath: diff.filePath,
                        summary: diff.diff.summary
                    }))
                });
            } else {
                // 回退到简单的AI回复
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
            }
            
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
        } finally {
            // 清除处理中状态
            webviewView.webview.postMessage({
                command: 'setProcessing',
                isProcessing: false
            });
        }
    }
    
    /**
     * 使用TaskEngine执行任务，并进行权限检查和Diff预览
     */
    private async executeTaskWithPermissionCheck(text: string, webviewView: vscode.WebviewView): Promise<TaskResult> {
        if (!this._taskEngine) {
            return {
                success: false,
                steps: [],
                output: 'TaskEngine未初始化',
                error: 'TaskEngine未初始化'
            };
        }
        
        // 执行任务
        const result = await this._taskEngine.startTask(text, {
            autoExecute: true,
            requireApproval: true,
            mode: 'act'
        });
        
        // 检查是否有待处理的文件差异
        const pendingDiffs = this._taskEngine.getPendingDiffs();
        
        // 收集所有待处理的差异（不立即打开diff编辑器）
        const diffsForUI = [];
        
        for (const { diffId, diff } of pendingDiffs) {
            // 检查是否在自动批准列表中
            const autoApproved = this._autoApprovalSettings.actions.editFiles;
            
            if (autoApproved) {
                // 自动批准
                await this._taskEngine.approveDiff(diffId, 'approve');
                console.log(`自动批准文件修改: ${diff.filePath}`);
            } else {
                // 存储待处理的差异（不立即打开diff预览，等待用户点击）
                this._pendingDiffs.set(diffId, {
                    diffId,
                    filePath: diff.filePath,
                    diff,
                    timestamp: new Date()
                });
                
                diffsForUI.push({
                    diffId,
                    filePath: diff.filePath,
                    summary: diff.summary
                });
            }
        }
        
        // 如果有待处理的差异，在UI中显示（只显示列表，不自动打开diff编辑器）
        if (diffsForUI.length > 0) {
            webviewView.webview.postMessage({
                command: 'showPendingDiffs',
                diffs: diffsForUI
            });
        }
        
        return result;
    }
    
    /**
     * 显示Diff预览（在编辑器中打开对比视图）
     */
    private async showDiffPreview(diffId: string, diff: FileDiff, webviewView: vscode.WebviewView): Promise<void> {
        try {
            // 获取工作区路径
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                vscode.window.showErrorMessage('无法显示Diff预览：未打开工作区');
                return;
            }
            
            const workspacePath = workspaceFolders[0].uri.fsPath;
            const absolutePath = diff.filePath.startsWith('/') 
                ? diff.filePath 
                : require('path').join(workspacePath, diff.filePath);
            
            // 创建ChangedFile对象
            const changedFile: ChangedFile = {
                relativePath: diff.filePath,
                absolutePath: absolutePath,
                before: diff.oldContent,
                after: diff.newContent
            };
            
            // 使用DiffViewer打开对比视图
            const result = await DiffViewer.openMultiFileDiff([changedFile], {
                title: `CodeLine - 审查更改: ${diff.filePath}`,
                showApplyButton: true,
                showRejectButton: true,
                contextDescription: diff.summary
            });
            
            // 根据用户操作处理结果
            if (result.applied) {
                await this._taskEngine?.approveDiff(diffId, 'approve');
                this._pendingDiffs.delete(diffId);
                
                // 通知WebView
                webviewView.webview.postMessage({
                    command: 'diffApproved',
                    diffId,
                    filePath: diff.filePath
                });
            } else if (result.rejected) {
                await this._taskEngine?.approveDiff(diffId, 'reject');
                this._pendingDiffs.delete(diffId);
                
                // 通知WebView
                webviewView.webview.postMessage({
                    command: 'diffRejected',
                    diffId,
                    filePath: diff.filePath
                });
            }
            
        } catch (error) {
            console.error('显示Diff预览失败:', error);
            vscode.window.showErrorMessage(`无法显示Diff预览: ${error instanceof Error ? error.message : String(error)}`);
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
    
    /**
     * Post a message to the webview
     */
    public postMessage(message: any): void {
        if (this._view) {
            this._view.webview.postMessage(message);
        }
    }
    
    // ===== New message handlers =====
    
    private async handleRequestState(webviewView: vscode.WebviewView) {
        try {
            const mode = await this._extension.getMode();
            const config = this._extension.getConfig();
            
            webviewView.webview.postMessage({
                type: 'state',
                state: {
                    mode,
                    apiConfiguration: config ? {
                        providerId: config.provider || 'unknown',
                        modelId: config.model || 'unknown'
                    } : undefined,
                    version: '0.2.0'
                }
            });
        } catch (error) {
            console.error('Failed to get state:', error);
        }
    }
    
    private async handleExecuteTask(text: string, images: string[] = [], files: string[] = [], webviewView: vscode.WebviewView) {
        try {
            // Notify UI that task is starting
            webviewView.webview.postMessage({
                type: 'taskStarted',
                task: text
            });
            
            // Execute the task
            const result = await this._extension.executeTask(text);
            
            if (result && result.success) {
                // Send each step as a message
                for (const step of result.steps) {
                    webviewView.webview.postMessage({
                        command: 'addMessage',
                        ts: Date.now() + Math.random(),
                        messageType: 'say',
                        say: step.type,
                        text: step.description + (step.result ? `\n\n${step.result}` : '')
                    });
                }
                
                webviewView.webview.postMessage({
                    type: 'taskCompleted',
                    result
                });
            } else {
                webviewView.webview.postMessage({
                    type: 'taskError',
                    error: result?.error || 'Task execution failed'
                });
            }
        } catch (error: any) {
            console.error('Task execution error:', error);
            webviewView.webview.postMessage({
                type: 'taskError',
                error: error.message
            });
        }
    }
    
    private async handleSetMode(mode: 'plan' | 'act', webviewView: vscode.WebviewView) {
        try {
            await this._extension.setMode(mode);
            webviewView.webview.postMessage({
                type: 'modeChanged',
                mode
            });
        } catch (error) {
            console.error('Failed to set mode:', error);
        }
    }
    
    private async handleToggleMode(webviewView: vscode.WebviewView) {
        try {
            const newMode = await this._extension.toggleMode();
            webviewView.webview.postMessage({
                type: 'modeChanged',
                mode: newMode
            });
        } catch (error) {
            console.error('Failed to toggle mode:', error);
        }
    }
    
    private async handleClearTask(webviewView: vscode.WebviewView) {
        try {
            webviewView.webview.postMessage({
                type: 'clearMessages'
            });
            webviewView.webview.postMessage({
                type: 'state',
                state: {
                    showWelcome: true
                }
            });
        } catch (error) {
            console.error('Failed to clear task:', error);
        }
    }
    
    private async handleApproveDiff(diffId: string, action: 'approve' | 'reject', webviewView: vscode.WebviewView) {
        try {
            let result: any;
            
            // 首先尝试使用TaskEngine
            if (this._taskEngine) {
                result = await this._taskEngine.approveDiff(diffId, action);
            } else {
                // 回退到扩展方法
                result = await this._extension.approveFileDiff(diffId, action);
            }
            
            // 如果成功，从待处理列表中移除
            if (result.success) {
                this._pendingDiffs.delete(diffId);
            }
            
            // 发送结果到WebView - 使用command格式与前端匹配
            webviewView.webview.postMessage({
                command: action === 'approve' ? 'diffApproved' : 'diffRejected',
                diffId,
                filePath: result.filePath || '',
                success: result.success,
                message: result.message
            });
        } catch (error: any) {
            console.error('Failed to approve/reject diff:', error);
            webviewView.webview.postMessage({
                command: action === 'approve' ? 'diffApproved' : 'diffRejected',
                diffId,
                filePath: '',
                success: false,
                message: error.message
            });
        }
    }
    
    /**
     * 处理预览差异请求 - 打开Diff编辑器
     */
    private async handlePreviewDiff(diffId: string, filePath: string, webviewView: vscode.WebviewView) {
        try {
            // 从待处理差异中获取文件内容
            const pendingDiff = this._pendingDiffs.get(diffId);
            
            if (pendingDiff) {
                // 使用 DiffViewer 打开预览
                await this.showDiffPreview(diffId, pendingDiff.diff, webviewView);
            } else {
                // 如果差异不在待处理列表中，尝试直接打开文件
                const workspaceFolders = vscode.workspace.workspaceFolders;
                if (workspaceFolders && workspaceFolders.length > 0) {
                    const workspacePath = workspaceFolders[0].uri.fsPath;
                    const fullPath = filePath.startsWith('/') 
                        ? filePath 
                        : require('path').join(workspacePath, filePath);
                    
                    const uri = vscode.Uri.file(fullPath);
                    const document = await vscode.workspace.openTextDocument(uri);
                    await vscode.window.showTextDocument(document, { preview: false });
                }
            }
        } catch (error: any) {
            console.error('Failed to preview diff:', error);
            vscode.window.showErrorMessage(`无法预览差异: ${error.message}`);
        }
    }
    
    private async handleSetAutoApprove(permission: string, enabled: boolean, webviewView: vscode.WebviewView) {
        try {
            console.log(`设置自动批准权限: ${permission} = ${enabled}`);
            
            // 更新本地设置
            if (permission in this._autoApprovalSettings.actions) {
                (this._autoApprovalSettings.actions as any)[permission] = enabled;
            }
            
            // 更新权限管理器
            this._permissionManager.setAutoApprovalSettings(this._autoApprovalSettings);
            
            // 保存到全局状态
            if (this._extension && this._extension.context) {
                await this._extension.context.globalState.update('codeline.autoApprovalSettings', this._autoApprovalSettings);
            }
            
            // 通知WebView更新
            webviewView.webview.postMessage({
                type: 'autoApproveSettingsUpdated',
                settings: this._autoApprovalSettings
            });
            
            vscode.window.showInformationMessage(`自动批准权限 "${permission}" 已${enabled ? '启用' : '禁用'}`);
        } catch (error: any) {
            console.error('Failed to set auto approve:', error);
        }
    }
    
    private async handleSetYoloMode(enabled: boolean, webviewView: vscode.WebviewView) {
        try {
            console.log(`设置YOLO模式: ${enabled}`);
            
            if (enabled) {
                // YOLO模式：启用所有权限
                this._autoApprovalSettings.actions = {
                    readFiles: true,
                    readFilesExternally: true,
                    editFiles: true,
                    editFilesExternally: true,
                    executeSafeCommands: true,
                    executeAllCommands: true,
                    useBrowser: true,
                    useMcp: true,
                };
                vscode.window.showWarningMessage('⚠️ YOLO模式已启用 - 所有操作将自动批准！');
            } else {
                // 禁用YOLO模式：恢复默认设置
                this._autoApprovalSettings.actions = {
                    readFiles: true,
                    readFilesExternally: false,
                    editFiles: false,
                    editFilesExternally: false,
                    executeSafeCommands: true,
                    executeAllCommands: false,
                    useBrowser: false,
                    useMcp: false,
                };
                vscode.window.showInformationMessage('YOLO模式已禁用');
            }
            
            // 更新权限管理器
            this._permissionManager.setAutoApprovalSettings(this._autoApprovalSettings);
            
            // 保存到全局状态
            if (this._extension && this._extension.context) {
                await this._extension.context.globalState.update('codeline.autoApprovalSettings', this._autoApprovalSettings);
            }
            
            // 通知WebView更新
            webviewView.webview.postMessage({
                type: 'autoApproveSettingsUpdated',
                settings: this._autoApprovalSettings,
                yoloMode: enabled
            });
        } catch (error: any) {
            console.error('Failed to set YOLO mode:', error);
        }
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
        
        /* Cline风格导航栏 */
        .nav-bar {
            display: flex;
            background: var(--vscode-editor-inactiveSelectionBackground, #252526);
            border-bottom: 1px solid var(--vscode-panel-border, #3e3e42);
            padding: 4px 8px;
            gap: 2px;
        }
        
        .nav-tab {
            padding: 6px 12px;
            background: transparent;
            color: var(--vscode-descriptionForeground, #888);
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: all 0.15s;
        }
        
        .nav-tab:hover {
            background: var(--vscode-list-hoverBackground, #2a2d2e);
            color: var(--vscode-foreground, #cccccc);
        }
        
        .nav-tab.active {
            background: var(--vscode-editor-background, #1e1e1e);
            color: var(--vscode-foreground, #ffffff);
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
            display: none;
            flex-direction: column;
            overflow: hidden;
            opacity: 0;
            transform: translateX(-20px);
            transition: opacity 0.2s ease, transform 0.2s ease;
        }
        
        .chat-view.active {
            display: flex;
            opacity: 1;
            transform: translateX(0);
        }
        
        /* 消息容器 */
        .messages-container {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
        }
        
        /* Cline风格消息样式 */
        .message {
            margin-bottom: 16px;
            padding: 0 16px;
        }
        
        .message-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
            font-size: 11px;
            color: var(--vscode-descriptionForeground, #888);
        }
        
        .message-header .role {
            font-weight: 600;
            color: var(--vscode-foreground, #cccccc);
        }
        
        .message-actions {
            display: flex;
            gap: 4px;
            opacity: 0;
            transition: opacity 0.15s;
        }
        
        .message:hover .message-actions {
            opacity: 1;
        }
        
        .message-action {
            background: transparent;
            border: none;
            color: var(--vscode-descriptionForeground, #888);
            cursor: pointer;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 11px;
        }
        
        .message-action:hover {
            background: var(--vscode-toolbar-hoverBackground, #2a2d2e);
            color: var(--vscode-foreground, #cccccc);
        }
        
        .message-content {
            line-height: 1.6;
            word-wrap: break-word;
            color: var(--vscode-foreground, #cccccc);
            font-size: 13px;
        }
        
        .message-content pre {
            background: var(--vscode-textCodeBlock-background, #0d0d0d);
            padding: 12px;
            border-radius: 3px;
            overflow-x: auto;
            font-family: var(--vscode-editor-font-family, 'Consolas', monospace);
            font-size: 12px;
            margin: 8px 0;
        }
        
        .message-content code {
            background: var(--vscode-textCodeBlock-background, #0d0d0d);
            padding: 2px 4px;
            border-radius: 2px;
            font-family: var(--vscode-editor-font-family, 'Consolas', monospace);
            font-size: 12px;
        }
        
        /* Cline风格输入区域 */
        .input-area {
            padding: 12px 16px;
            background: var(--vscode-editor-background, #1e1e1e);
            border-top: 1px solid var(--vscode-panel-border, #3e3e42);
        }
        
        .input-wrapper {
            display: flex;
            gap: 8px;
            align-items: flex-end;
            background: var(--vscode-input-background, #3c3c3c);
            border: 1px solid var(--vscode-input-border, #3e3e42);
            border-radius: 4px;
            padding: 8px;
        }
        
        .input-wrapper:focus-within {
            border-color: var(--vscode-focusBorder, #007fd4);
        }
        
        textarea {
            flex: 1;
            min-height: 40px;
            max-height: 200px;
            padding: 4px 8px;
            background: transparent;
            color: var(--vscode-input-foreground, #cccccc);
            border: none;
            font-family: inherit;
            font-size: 13px;
            resize: none;
            line-height: 1.5;
            outline: none;
        }
        
        .input-actions {
            display: flex;
            gap: 4px;
            align-items: center;
        }
        
        .input-action-btn {
            padding: 4px 8px;
            background: transparent;
            border: none;
            color: var(--vscode-descriptionForeground, #888);
            font-size: 12px;
            cursor: pointer;
            border-radius: 3px;
            transition: all 0.15s;
        }
        
        .input-action-btn:hover {
            background: var(--vscode-toolbar-hoverBackground, #2a2d2e);
            color: var(--vscode-foreground, #cccccc);
        }
        
        .send-button {
            padding: 6px 12px;
            background: var(--vscode-button-background, #0e639c);
            color: var(--vscode-button-foreground, #ffffff);
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            transition: background 0.15s;
        }
        
        .send-button:hover {
            background: var(--vscode-button-hoverBackground, #1177bb);
        }
        
        .send-button:disabled {
            background: var(--vscode-button-secondaryBackground, #5a5a5a);
            color: var(--vscode-button-secondaryForeground, #cccccc);
            cursor: not-allowed;
        }
        
        /* Cline风格设置视图 */
        .settings-view {
            display: none;
            padding: 16px;
            overflow-y: auto;
            opacity: 0;
            transform: translateX(20px);
            transition: opacity 0.2s ease, transform 0.2s ease;
        }
        
        .settings-view.active {
            display: block;
            opacity: 1;
            transform: translateX(0);
        }
        
        .settings-title {
            font-size: 16px;
            margin-bottom: 16px;
            color: var(--vscode-foreground, #cccccc);
            font-weight: 600;
        }
        
        .settings-section {
            margin-bottom: 20px;
            padding: 16px;
            background: var(--vscode-editor-inactiveSelectionBackground, #252526);
            border-radius: 4px;
            border: 1px solid var(--vscode-panel-border, #3e3e42);
        }
        
        .settings-section h3 {
            margin-bottom: 12px;
            color: var(--vscode-foreground, #cccccc);
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .settings-group {
            margin-bottom: 12px;
        }
        
        .settings-label {
            display: block;
            margin-bottom: 6px;
            font-size: 12px;
            color: var(--vscode-foreground, #cccccc);
        }
        
        .settings-input {
            width: 100%;
            padding: 8px 10px;
            background: var(--vscode-input-background, #3c3c3c);
            color: var(--vscode-input-foreground, #cccccc);
            border: 1px solid var(--vscode-input-border, #3e3e42);
            border-radius: 3px;
            font-family: inherit;
            font-size: 13px;
        }
        
        .settings-input:focus {
            outline: none;
            border-color: var(--vscode-focusBorder, #007fd4);
        }
        
        .settings-button {
            padding: 6px 12px;
            background: var(--vscode-button-background, #0e639c);
            color: var(--vscode-button-foreground, #ffffff);
            border: none;
            border-radius: 3px;
            cursor: pointer;
            margin-right: 8px;
            font-size: 12px;
            transition: background 0.15s;
        }
        
        .settings-button:hover {
            background: var(--vscode-button-hoverBackground, #1177bb);
        }
        
        .settings-button.secondary {
            background: var(--vscode-button-secondaryBackground, #5a5a5a);
            color: var(--vscode-button-secondaryForeground, #cccccc);
        }
        
        .settings-button.secondary:hover {
            background: var(--vscode-toolbar-hoverBackground, #3c3c3c);
        }
        
        /* Cline风格自动批准设置 */
        .auto-approve-panel {
            background: var(--vscode-editor-background, #1e1e1e);
            border-top: 1px solid var(--vscode-panel-border, #3e3e42);
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
        }
        
        .auto-approve-panel.expanded {
            max-height: 500px;
            overflow-y: auto;
        }
        
        .auto-approve-content {
            padding: 12px 16px;
        }
        
        .auto-approve-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--vscode-panel-border, #3e3e42);
        }
        
        .auto-approve-header h4 {
            color: var(--vscode-foreground, #cccccc);
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .auto-approve-toggle {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: var(--vscode-editor-inactiveSelectionBackground, #252526);
            border-top: 1px solid var(--vscode-panel-border, #3e3e42);
            cursor: pointer;
            transition: background 0.15s;
        }
        
        .auto-approve-toggle:hover {
            background: var(--vscode-list-hoverBackground, #2a2d2e);
        }
        
        .auto-approve-toggle-icon {
            color: var(--vscode-descriptionForeground, #888);
            font-size: 10px;
            transition: transform 0.2s;
        }
        
        .auto-approve-toggle.expanded .auto-approve-toggle-icon {
            transform: rotate(180deg);
        }
        
        .auto-approve-toggle-text {
            flex: 1;
            font-size: 12px;
            color: var(--vscode-foreground, #cccccc);
        }
        
        .auto-approve-count {
            background: var(--vscode-badge-background, #007acc);
            color: var(--vscode-badge-foreground, #ffffff);
            font-size: 11px;
            padding: 2px 6px;
            border-radius: 10px;
            min-width: 18px;
            text-align: center;
        }
        
        .auto-approve-count.zero {
            background: var(--vscode-disabledForeground, #666);
            color: var(--vscode-foreground, #888);
        }
        
        /* Cline风格权限项 */
        .permission-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 6px 0;
            border-bottom: 1px solid var(--vscode-panel-border, #2a2d2e);
        }
        
        .permission-item:last-child {
            border-bottom: none;
        }
        
        .permission-checkbox {
            cursor: pointer;
            accent-color: var(--vscode-focusBorder, #007fd4);
        }
        
        .permission-info {
            flex: 1;
        }
        
        .permission-label {
            font-size: 12px;
            color: var(--vscode-foreground, #cccccc);
        }
        
        .permission-desc {
            font-size: 11px;
            color: var(--vscode-descriptionForeground, #888);
            margin-top: 2px;
        }
        
        .permission-item.enabled .permission-label {
            color: var(--vscode-textLink-foreground, #3794ff);
        }
        
        /* Cline风格YOLO Mode */
        .yolo-mode-section {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid var(--vscode-panel-border, #3e3e42);
        }
        
        .yolo-mode-toggle {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: rgba(248, 81, 73, 0.1);
            border: 1px solid rgba(248, 81, 73, 0.3);
            border-radius: 3px;
            cursor: pointer;
        }
        
        .yolo-mode-toggle:hover {
            background: rgba(248, 81, 73, 0.15);
        }
        
        .yolo-mode-toggle label {
            color: #f85149;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
        }
        
        .yolo-warning {
            font-size: 11px;
            color: #ff9800;
            margin-top: 6px;
            padding-left: 28px;
        }
        
        /* Cline 精确复制 - 工具调用卡片 */
        .cline-tool-card {
            margin: 8px 0;
            background: var(--vscode-editor-background, #1e1e1e);
            border: 1px solid var(--vscode-panel-border, #3e3e42);
            border-radius: 3px;
            overflow: hidden;
        }

        .cline-tool-header {
            display: flex;
            align-items: center;
            padding: 8px 12px;
            background: var(--vscode-editor-inactiveSelectionBackground, #252526);
            border-bottom: 1px solid var(--vscode-panel-border, #3e3e42);
            cursor: pointer;
            user-select: none;
        }

        .cline-tool-header:hover {
            background: var(--vscode-list-hoverBackground, #2a2d2e);
        }

        .cline-tool-tag {
            font-size: 11px;
            font-weight: 600;
            color: var(--vscode-textLink-foreground, #3794ff);
            margin-right: 8px;
            font-family: var(--vscode-editor-font-family, 'Consolas', monospace);
        }

        .cline-tool-path {
            flex: 1;
            font-size: 12px;
            color: var(--vscode-foreground, #cccccc);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-family: var(--vscode-editor-font-family, 'Consolas', monospace);
        }

        .cline-tool-arrow {
            font-size: 10px;
            color: var(--vscode-descriptionForeground, #888);
            margin-left: 8px;
            transition: transform 0.2s;
        }

        .cline-tool-card.expanded .cline-tool-arrow {
            transform: rotate(90deg);
        }

        .cline-tool-content {
            display: none;
            border-bottom: 1px solid var(--vscode-panel-border, #3e3e42);
        }

        .cline-tool-card.expanded .cline-tool-content {
            display: block;
        }

        .cline-code-block {
            background: var(--vscode-textCodeBlock-background, #0d0d0d);
            padding: 12px;
            font-family: var(--vscode-editor-font-family, 'Consolas', monospace);
            font-size: 12px;
            line-height: 1.4;
            overflow-x: auto;
            white-space: pre;
            color: var(--vscode-foreground, #d4d4d4);
            max-height: 300px;
            overflow-y: auto;
        }

        .cline-code-line {
            display: block;
            padding: 0 4px;
        }

        .cline-code-line.added {
            background: rgba(46, 160, 67, 0.2);
            color: #3fb950;
        }

        .cline-code-line.removed {
            background: rgba(248, 81, 73, 0.2);
            color: #f85149;
        }

        .cline-tool-actions {
            display: flex;
            padding: 8px 12px;
            gap: 8px;
            background: var(--vscode-editor-inactiveSelectionBackground, #252526);
        }

        .cline-btn {
            padding: 4px 12px;
            border: 1px solid;
            border-radius: 2px;
            font-size: 11px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s;
            font-family: var(--vscode-font-family, -apple-system, sans-serif);
        }

        .cline-btn-save {
            background: #2ea043;
            border-color: #2ea043;
            color: white;
        }

        .cline-btn-save:hover {
            background: #3fb950;
            border-color: #3fb950;
        }

        .cline-btn-reject {
            background: transparent;
            border-color: var(--vscode-button-secondaryBackground, #5a5a5a);
            color: var(--vscode-button-secondaryForeground, #cccccc);
        }

        .cline-btn-reject:hover {
            background: #da3633;
            border-color: #da3633;
            color: white;
        }

        /* 状态样式 */
        .cline-tool-card.saved {
            border-color: #2ea043;
        }

        .cline-tool-card.saved .cline-tool-header {
            background: rgba(46, 160, 67, 0.1);
        }

        .cline-tool-card.saved .cline-tool-tag::before {
            content: '✓ ';
        }

        .cline-tool-card.rejected {
            border-color: #da3633;
            opacity: 0.6;
        }

        .cline-tool-card.rejected .cline-tool-header {
            background: rgba(248, 81, 73, 0.1);
        }

        .cline-tool-card.rejected .cline-tool-path {
            text-decoration: line-through;
            color: #888;
        }

        /* Cline 批量操作栏 */
        .cline-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 12px;
            background: var(--vscode-editor-inactiveSelectionBackground, #252526);
            border: 1px solid var(--vscode-panel-border, #3e3e42);
            border-radius: 3px;
            margin: 8px 0;
        }

        .cline-toolbar-text {
            font-size: 12px;
            color: var(--vscode-foreground, #cccccc);
        }

        .cline-toolbar-actions {
            display: flex;
            gap: 6px;
        }

        .cline-toolbar-btn {
            padding: 4px 10px;
            border: 1px solid var(--vscode-button-secondaryBackground, #5a5a5a);
            border-radius: 2px;
            background: transparent;
            color: var(--vscode-button-secondaryForeground, #cccccc);
            font-size: 11px;
            cursor: pointer;
        }

        .cline-toolbar-btn:hover {
            background: var(--vscode-button-hoverBackground, #3c3c3c);
        }

        .cline-toolbar-btn.primary {
            background: #2ea043;
            border-color: #2ea043;
            color: white;
        }

        .cline-toolbar-btn.primary:hover {
            background: #3fb950;
        }

        /* 旧版兼容样式 */
        .diff-content {
            padding: 12px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 12px;
            line-height: 1.6;
            max-height: 300px;
            overflow-y: auto;
        }
        
        .diff-line-added {
            background: rgba(46, 160, 67, 0.15);
            color: #3fb950;
        }
        
        .diff-line-removed {
            background: rgba(248, 81, 73, 0.15);
            color: #f85149;
        }
        
        .diff-line-context {
            color: #888;
        }
        
        .diff-line-number {
            display: inline-block;
            width: 40px;
            text-align: right;
            padding-right: 10px;
            color: #555;
            user-select: none;
        }
        
        /* 处理中状态 */
        .processing-indicator {
            display: none;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: #252526;
            border-top: 1px solid #333;
        }
        
        .processing-indicator.active {
            display: flex;
        }
        
        .processing-spinner {
            width: 14px;
            height: 14px;
            border: 2px solid #444;
            border-top-color: #007acc;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .processing-text {
            font-size: 12px;
            color: #888;
        }
        
        /* Cline风格任务步骤 */
        .task-steps {
            margin: 8px 0;
            padding: 8px 12px;
            background: var(--vscode-editor-background, #1e1e1e);
            border: 1px solid var(--vscode-panel-border, #3e3e42);
            border-radius: 3px;
        }
        
        .task-step {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 4px 0;
            border-bottom: 1px solid var(--vscode-panel-border, #2a2d2e);
        }
        
        .task-step:last-child {
            border-bottom: none;
        }
        
        .task-step-icon {
            width: 14px;
            height: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
        }
        
        .task-step-icon.pending { color: var(--vscode-descriptionForeground, #888); }
        .task-step-icon.executing { color: var(--vscode-progressBar-background, #007acc); }
        .task-step-icon.completed { color: #2ea043; }
        .task-step-icon.failed { color: #f85149; }
        
        .task-step-content {
            flex: 1;
            font-size: 12px;
            color: var(--vscode-foreground, #cccccc);
        }
    </style>
</head>
<body>
    <!-- 导航栏 -->
    <div class="nav-bar">
        <button class="nav-tab active" data-view="chat" data-action="switch-view">
            <span>Chat</span>
        </button>
        <button class="nav-tab" data-view="tasks" data-action="switch-view">
            <span>Tasks</span>
        </button>
        <button class="nav-tab" data-view="settings" data-action="switch-view">
            <span>Settings</span>
        </button>
        <button class="nav-tab" data-view="history" data-action="switch-view">
            <span>History</span>
        </button>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="main-content">
        <!-- 聊天视图 -->
        <div class="chat-view active" id="chatView">
            <!-- 消息容器 -->
            <div class="messages-container" id="messagesContainer">
                <!-- Initial message -->
                <div class="message assistant">
                    <div class="message-header">
                        <span class="role">CodeLine</span>
                        <span class="time">${new Date().toLocaleTimeString()}</span>
                    </div>
                    <div class="message-content">
                        Hi! I'm CodeLine. How can I help you today?
                    </div>
                </div>
            </div>
            
            <!-- Auto-approve settings - above input, Cline style -->
            <div class="auto-approve-toggle" id="autoApproveToggle" data-action="toggle-auto-approve-panel">
                <span class="auto-approve-toggle-icon">▼</span>
                <span class="auto-approve-toggle-text">Auto-approve Settings</span>
                <span class="auto-approve-count zero" id="autoApproveCount">0</span>
            </div>
            <div class="auto-approve-panel" id="autoApprovePanel">
                <div class="auto-approve-content">
                    <div class="auto-approve-header">
                        <h4>Permissions</h4>
                    </div>
                    <div id="autoApproveOptions">
                        <!-- Permission options will be generated dynamically -->
                    </div>
                    <div class="yolo-mode-section">
                        <div class="yolo-mode-toggle">
                            <input type="checkbox" id="yoloMode" data-action="toggle-yolo-mode">
                            <label for="yoloMode">YOLO Mode (Auto-approve all)</label>
                        </div>
                        <div class="yolo-warning">Warning: Will auto-approve all operations, including high-risk actions like file deletion</div>
                    </div>
                </div>
            </div>
            
            <!-- 输入区域 - Cline风格 -->
            <div class="input-area">
                <div class="input-wrapper">
                    <textarea 
                        id="messageInput" 
                        placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                        rows="1"></textarea>
                    <div class="input-actions">
                        <button class="input-action-btn" data-action="add-context" title="Add context">@</button>
                        <button class="send-button" id="sendButton">Send</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 设置视图 -->
        <div class="settings-view" id="settingsView">
            <h2 class="settings-title">Settings</h2>
            
            <div class="settings-section">
                <h3>API 配置</h3>
                <div class="settings-group">
                    <label class="settings-label">API Key</label>
                    <input type="password" class="settings-input" id="apiKey" placeholder="Enter your API key">
                </div>
                <div class="settings-group">
                    <label class="settings-label">Provider</label>
                    <select class="settings-input" id="modelProvider">
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="deepseek">DeepSeek</option>
                    </select>
                </div>
                <div class="settings-group">
                    <label class="settings-label">Model</label>
                    <input type="text" class="settings-input" id="modelName" placeholder="e.g., gpt-4-turbo">
                </div>
                <button class="settings-button" data-action="save-settings">Save Settings</button>
                <button class="settings-button secondary" data-action="test-connection">Test Connection</button>
            </div>
            
            <div class="settings-section">
                <h3>Chat Management</h3>
                <button class="settings-button" data-action="clear-chat">Clear Chat History</button>
            </div>
            
            <div class="settings-section">
                <h3>Auto-Approve Settings</h3>
                <p style="color: var(--vscode-descriptionForeground, #888); margin-bottom: 15px; font-size: 12px;">
                    Configure which operations can be auto-approved without manual confirmation.
                </p>
                <div id="autoApproveOptions">
                    <!-- Auto-approve options will be generated dynamically -->
                </div>
                <button class="settings-button" data-action="save-auto-approve">Save Auto-Approve Settings</button>
            </div>
        </div>
        
        <!-- Tasks and History views -->
        <div class="settings-view" id="tasksView">
            <h2 class="settings-title">Tasks</h2>
            <p style="color: var(--vscode-descriptionForeground, #888); padding: 20px; text-align: center; font-size: 13px;">
                Task management coming soon...
            </p>
        </div>
        
        <div class="settings-view" id="historyView">
            <h2 class="settings-title">History</h2>
            <p style="color: var(--vscode-descriptionForeground, #888); padding: 20px; text-align: center; font-size: 13px;">
                History feature coming soon...
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
                actionButtons = '<div class="message-actions">' +
                    '<button class="message-action" data-action="copy-message" data-id="' + message.id + '" title="复制">📋</button>' +
                    '<button class="message-action" data-action="regenerate-message" data-id="' + message.id + '" title="重新生成">🔄</button>' +
                    '</div>';
            } else if (message.role === 'user') {
                actionButtons = '<div class="message-actions">' +
                    '<button class="message-action" data-action="copy-message" data-id="' + message.id + '" title="复制">📋</button>' +
                    '<button class="message-action" data-action="edit-message" data-id="' + message.id + '" title="编辑">✏️</button>' +
                    '</div>';
            }
            
            // 构建消息内容
            let contentHtml = '<div class="message-header">' +
                    '<span class="role">' + (message.role === 'user' ? '您' : 'CodeLine') + '</span>' +
                    actionButtons +
                    '<span class="time">' + new Date(message.timestamp).toLocaleTimeString() + '</span>' +
                '</div>' +
                '<div class="message-content">' + escapeHtml(message.content) + '</div>';
            
            // 如果有待处理的差异，显示差异预览
            if (message.pendingDiffs && message.pendingDiffs.length > 0) {
                contentHtml += '<div class="pending-diffs-container">';
                contentHtml += '<div class="pending-diffs-header">📝 待审批的文件更改 (' + message.pendingDiffs.length + ')</div>';
                
                for (const diff of message.pendingDiffs) {
                    contentHtml += '<div class="diff-preview-container" data-diff-id="' + diff.diffId + '">';
                    contentHtml += '  <div class="diff-preview-header">';
                    contentHtml += '    <div>';
                    contentHtml += '      <div class="diff-preview-title">📄 ' + escapeHtml(diff.filePath) + '</div>';
                    contentHtml += '      <div class="diff-preview-summary">' + escapeHtml(diff.summary) + '</div>';
                    contentHtml += '    </div>';
                    contentHtml += '    <div class="diff-preview-actions">';
                    contentHtml += '      <button class="diff-action-btn diff-approve-btn" data-action="approve-diff" data-diff-id="' + diff.diffId + '" data-file-path="' + escapeHtml(diff.filePath) + '">✓ 批准</button>';
                    contentHtml += '      <button class="diff-action-btn diff-reject-btn" data-action="reject-diff" data-diff-id="' + diff.diffId + '" data-file-path="' + escapeHtml(diff.filePath) + '">✗ 拒绝</button>';
                    contentHtml += '      <button class="diff-action-btn diff-preview-btn" data-action="preview-diff" data-diff-id="' + diff.diffId + '" data-file-path="' + escapeHtml(diff.filePath) + '">👁 预览</button>';
                    contentHtml += '    </div>';
                    contentHtml += '  </div>';
                    contentHtml += '</div>';
                }
                
                contentHtml += '<div class="pending-diffs-actions">';
                contentHtml += '  <button class="diff-action-btn" data-action="approve-all-diffs">✓ 全部批准</button>';
                contentHtml += '  <button class="diff-action-btn" data-action="reject-all-diffs">✗ 全部拒绝</button>';
                contentHtml += '</div>';
                contentHtml += '</div>';
            }
            
            messageElement.innerHTML = contentHtml;
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
        
        // 渲染自动批准选项
        function renderAutoApproveOptions() {
            const container = document.getElementById('autoApproveOptions');
            if (!container) return;
            
            const options = [
                {
                    id: 'readFiles',
                    label: 'Read Files',
                    description: 'Allow reading files in the workspace'
                },
                {
                    id: 'readFilesExternally',
                    label: 'Read Files Outside Workspace',
                    description: 'Allow reading files outside the workspace'
                },
                {
                    id: 'editFiles',
                    label: 'Edit Files',
                    description: 'Allow editing files in the workspace'
                },
                {
                    id: 'editFilesExternally',
                    label: 'Edit Files Outside Workspace',
                    description: 'Allow editing files outside the workspace'
                },
                {
                    id: 'executeSafeCommands',
                    label: 'Execute Safe Commands',
                    description: 'Allow executing safe terminal commands'
                },
                {
                    id: 'executeAllCommands',
                    label: 'Execute All Commands',
                    description: 'Allow executing all terminal commands'
                },
                {
                    id: 'useBrowser',
                    label: 'Use Browser',
                    description: 'Allow using the browser for web operations'
                },
                {
                    id: 'useMcp',
                    label: 'Use MCP Servers',
                    description: 'Allow using MCP (Model Context Protocol) servers'
                },
                {
                    id: 'enableNotifications',
                    label: 'Enable Notifications',
                    description: 'Show notifications for approvals and task completion'
                }
            ];
            
            let html = '';
            for (const option of options) {
                html += '<div class="permission-item" data-permission-id="' + option.id + '">' +
                    '<input type="checkbox" class="permission-checkbox" id="autoApprove_' + option.id + '" data-action="update-auto-approve" data-id="' + option.id + '">' +
                    '<div class="permission-info">' +
                    '<div class="permission-label">' + escapeHtml(option.label) + '</div>' +
                    '<div class="permission-desc">' + escapeHtml(option.description) + '</div>' +
                    '</div></div>';
            }
            
            container.innerHTML = html;
            
            // 初始化时渲染一次
            updateAutoApproveCount();
        }
        
        // 更新自动批准计数
        function updateAutoApproveCount() {
            const count = document.querySelectorAll('.permission-checkbox:checked').length;
            const countEl = document.getElementById('autoApproveCount');
            if (countEl) {
                countEl.textContent = count;
                if (count === 0) {
                    countEl.classList.add('zero');
                } else {
                    countEl.classList.remove('zero');
                }
            }
        }
        
        // 切换自动批准面板
        function toggleAutoApprovePanel() {
            const toggle = document.getElementById('autoApproveToggle');
            const panel = document.getElementById('autoApprovePanel');
            if (toggle && panel) {
                toggle.classList.toggle('expanded');
                panel.classList.toggle('expanded');
                // 如果展开且还没有渲染选项，则渲染
                if (panel.classList.contains('expanded')) {
                    renderAutoApproveOptions();
                }
            }
        }
        
        // 切换视图 - 优化显示效果
        function switchView(view) {
            console.log('切换视图到:', view);
            
            // 如果已经在当前视图，不执行切换
            if (currentView === view) return;
            
            currentView = view;
            
            // 更新导航栏
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.classList.remove('active');
                if (tab.dataset.view === view) {
                    tab.classList.add('active');
                }
            });
            
            // 更新内容区域 - 使用requestAnimationFrame避免闪烁
            requestAnimationFrame(() => {
                document.querySelectorAll('.chat-view, .settings-view').forEach(el => {
                    el.classList.remove('active');
                });
                
                if (view === 'chat') {
                    document.getElementById('chatView').classList.add('active');
                } else if (view === 'settings') {
                    document.getElementById('settingsView').classList.add('active');
                    // 渲染自动批准选项
                    renderAutoApproveOptions();
                } else if (view === 'tasks') {
                    document.getElementById('tasksView').classList.add('active');
                } else if (view === 'history') {
                    document.getElementById('historyView').classList.add('active');
                }
                
                vscode.postMessage({ command: 'switchView', view: view });
            });
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
                case 'toggle-auto-approve-panel':
                    console.log('切换自动批准面板');
                    toggleAutoApprovePanel();
                    break;
                    
                case 'toggle-yolo-mode':
                    const yoloChecked = target.checked;
                    console.log('YOLO Mode:', yoloChecked);
                    if (yoloChecked) {
                        // YOLO模式：勾选所有权限
                        document.querySelectorAll('.permission-checkbox').forEach(cb => {
                            cb.checked = true;
                        });
                    }
                    updateAutoApproveCount();
                    vscode.postMessage({ command: 'setYoloMode', enabled: yoloChecked });
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
                    
                case 'add-context':
                    console.log('添加上下文');
                    // 在输入框中添加@符号
                    const input = document.getElementById('messageInput');
                    if (input) {
                        input.value += '@';
                        input.focus();
                    }
                    break;
                    
                case 'save-auto-approve':
                    console.log('保存自动批准设置');
                    vscode.postMessage({ command: 'test', data: '保存自动批准设置' });
                    // 收集所有选中的选项
                    const checkedOptions = [];
                    document.querySelectorAll('input[data-action="update-auto-approve"]:checked').forEach(input => {
                        checkedOptions.push(input.dataset.id);
                    });
                    console.log('选中的自动批准选项:', checkedOptions);
                    break;
                    
                case 'update-auto-approve':
                    // 处理复选框点击
                    const optionId = target.dataset.id;
                    const isChecked = target.checked;
                    console.log('更新自动批准选项:', optionId, isChecked);
                    // 更新权限项的样式
                    const permItem = target.closest('.permission-item');
                    if (permItem) {
                        if (isChecked) {
                            permItem.classList.add('enabled');
                        } else {
                            permItem.classList.remove('enabled');
                        }
                    }
                    updateAutoApproveCount();
                    vscode.postMessage({ 
                        command: 'setAutoApprove', 
                        permission: optionId, 
                        enabled: isChecked 
                    });
                    break;
                    
                // 差异操作处理
                case 'approve-diff':
                    const approveDiffId = target.dataset.diffId;
                    const approveFilePath = target.dataset.filePath;
                    console.log('批准差异:', approveDiffId, approveFilePath);
                    // 更新UI状态
                    var approveContainer = document.querySelector('[data-diff-id="' + approveDiffId + '"]');
                    if (approveContainer) {
                        approveContainer.classList.add('diff-approved');
                    }
                    vscode.postMessage({ 
                        command: 'approveDiff', 
                        diffId: approveDiffId, 
                        action: 'approve' 
                    });
                    break;
                    
                case 'reject-diff':
                    const rejectDiffId = target.dataset.diffId;
                    const rejectFilePath = target.dataset.filePath;
                    console.log('拒绝差异:', rejectDiffId, rejectFilePath);
                    // 更新UI状态
                    var rejectContainer = document.querySelector('[data-diff-id="' + rejectDiffId + '"]');
                    if (rejectContainer) {
                        rejectContainer.classList.add('diff-rejected');
                    }
                    vscode.postMessage({ 
                        command: 'approveDiff', 
                        diffId: rejectDiffId, 
                        action: 'reject' 
                    });
                    break;
                    
                case 'preview-diff':
                    const previewDiffId = target.dataset.diffId;
                    const previewFilePath = target.dataset.filePath;
                    console.log('预览差异:', previewDiffId, previewFilePath);
                    vscode.postMessage({ 
                        command: 'previewDiff', 
                        diffId: previewDiffId, 
                        filePath: previewFilePath 
                    });
                    break;
                    
                case 'approve-all-diffs':
                    console.log('批准所有差异');
                    // 处理Cline风格卡片
                    document.querySelectorAll('.cline-tool-card').forEach(function(card) {
                        if (!card.classList.contains('saved') && !card.classList.contains('rejected')) {
                            card.classList.add('saved');
                            card.classList.remove('expanded');
                            // 禁用按钮
                            var buttons = card.querySelectorAll('.cline-btn');
                            buttons.forEach(function(btn) {
                                btn.disabled = true;
                                btn.style.opacity = '0.5';
                            });
                        }
                    });
                    // 处理旧版diff容器
                    document.querySelectorAll('.diff-preview-container').forEach(function(container) {
                        if (!container.classList.contains('diff-approved') && !container.classList.contains('diff-rejected')) {
                            container.classList.add('diff-approved');
                        }
                    });
                    // 发送消息
                    document.querySelectorAll('[data-action="approve-diff"]').forEach(function(btn) {
                        if (!btn.disabled) {
                            vscode.postMessage({ 
                                command: 'approveDiff', 
                                diffId: btn.dataset.diffId, 
                                action: 'approve' 
                            });
                        }
                    });
                    break;
                    
                case 'reject-all-diffs':
                    console.log('拒绝所有差异');
                    // 处理Cline风格卡片
                    document.querySelectorAll('.cline-tool-card').forEach(function(card) {
                        if (!card.classList.contains('saved') && !card.classList.contains('rejected')) {
                            card.classList.add('rejected');
                            card.classList.remove('expanded');
                            // 禁用按钮
                            var buttons = card.querySelectorAll('.cline-btn');
                            buttons.forEach(function(btn) {
                                btn.disabled = true;
                                btn.style.opacity = '0.5';
                            });
                        }
                    });
                    // 处理旧版diff容器
                    document.querySelectorAll('.diff-preview-container').forEach(function(container) {
                        if (!container.classList.contains('diff-approved') && !container.classList.contains('diff-rejected')) {
                            container.classList.add('diff-rejected');
                        }
                    });
                    // 发送消息
                    document.querySelectorAll('[data-action="reject-diff"]').forEach(function(btn) {
                        if (!btn.disabled) {
                            vscode.postMessage({ 
                                command: 'approveDiff', 
                                diffId: btn.dataset.diffId, 
                                action: 'reject' 
                            });
                        }
                    });
                    break;
            }
        });
        
        // 处理复选框的change事件
        document.addEventListener('change', function(e) {
            if (e.target.matches('input[data-action="update-auto-approve"]')) {
                const optionId = e.target.dataset.id;
                const isChecked = e.target.checked;
                console.log('自动批准选项变更:', optionId, isChecked);
                // 更新权限项的样式
                const permItem = e.target.closest('.permission-item');
                if (permItem) {
                    if (isChecked) {
                        permItem.classList.add('enabled');
                    } else {
                        permItem.classList.remove('enabled');
                    }
                }
                updateAutoApproveCount();
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
                    
                case 'showPendingDiffs':
                    console.log('显示待处理差异:', message.diffs);
                    // 将待处理差异添加到最近的消息中
                    showPendingDiffsInUI(message.diffs);
                    break;
                    
                case 'diffApproved':
                    console.log('差异已批准:', message.diffId, message.filePath);
                    // 更新UI - 使用Cline精确样式
                    var approvedCard = document.querySelector('[data-diff-id="' + message.diffId + '"]');
                    if (approvedCard) {
                        approvedCard.classList.add('saved');
                        approvedCard.classList.remove('expanded');
                        // 禁用按钮
                        var buttons = approvedCard.querySelectorAll('.cline-btn');
                        buttons.forEach(function(btn) {
                            btn.disabled = true;
                            btn.style.opacity = '0.5';
                        });
                    }
                    break;
                    
                case 'diffRejected':
                    console.log('差异已拒绝:', message.diffId, message.filePath);
                    // 更新UI - 使用Cline精确样式
                    var rejectedCard = document.querySelector('[data-diff-id="' + message.diffId + '"]');
                    if (rejectedCard) {
                        rejectedCard.classList.add('rejected');
                        rejectedCard.classList.remove('expanded');
                        // 禁用按钮
                        var buttons = rejectedCard.querySelectorAll('.cline-btn');
                        buttons.forEach(function(btn) {
                            btn.disabled = true;
                            btn.style.opacity = '0.5';
                        });
                    }
                    break;
                    
                case 'pendingDiffs':
                    console.log('收到待处理差异列表:', message.diffs);
                    // 可以在这里更新差异计数或显示通知
                    break;
            }
        });
        
        // 在UI中显示待处理差异列表 - Cline精确复制
        function showPendingDiffsInUI(diffs) {
            if (!diffs || diffs.length === 0) return;
            
            // 创建Cline风格批量操作栏
            var toolbar = document.createElement('div');
            toolbar.className = 'cline-toolbar';
            toolbar.innerHTML = 
                '<span class="cline-toolbar-text">' + diffs.length + ' files to edit</span>' +
                '<div class="cline-toolbar-actions">' +
                '<button class="cline-toolbar-btn" data-action="reject-all-diffs">Reject All</button>' +
                '<button class="cline-toolbar-btn primary" data-action="approve-all-diffs">Save All</button>' +
                '</div>';
            messagesContainer.appendChild(toolbar);
            
            // 为每个差异创建Cline风格工具卡片
            diffs.forEach(function(diff) {
                var card = createClineToolCard(diff);
                messagesContainer.appendChild(card);
            });
            
            // 滚动到底部
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        // 创建Cline精确复制的工具卡片
        function createClineToolCard(diff) {
            var card = document.createElement('div');
            card.className = 'cline-tool-card expanded';
            card.setAttribute('data-diff-id', diff.diffId);
            
            // 生成代码预览
            var codePreview = generateClineCodePreview(diff);
            
            // 获取操作类型标签
            var operationTag = diff.filePath.includes('create') ? 'create_file' : 'write_to_file';
            
            card.innerHTML = 
                '<div class="cline-tool-header" onclick="toggleClineCard(this)">' +
                '  <span class="cline-tool-tag">' + operationTag + '</span>' +
                '  <span class="cline-tool-path">' + escapeHtml(diff.filePath) + '</span>' +
                '  <span class="cline-tool-arrow">▶</span>' +
                '</div>' +
                '<div class="cline-tool-content">' +
                '  <div class="cline-code-block">' + codePreview + '</div>' +
                '</div>' +
                '<div class="cline-tool-actions">' +
                '  <button class="cline-btn cline-btn-reject" data-action="reject-diff" data-diff-id="' + diff.diffId + '">Reject</button>' +
                '  <button class="cline-btn cline-btn-save" data-action="approve-diff" data-diff-id="' + diff.diffId + '">Save</button>' +
                '</div>';
            
            return card;
        }
        
        // 切换卡片展开/折叠
        window.toggleClineCard = function(header) {
            var card = header.parentElement;
            card.classList.toggle('expanded');
        };
        
        // 生成Cline风格代码预览
        function generateClineCodePreview(diff) {
            if (!diff.newContent) return '// No preview available';
            
            var lines = diff.newContent.split('\n');
            var previewLines = [];
            var maxLines = 20;
            
            for (var i = 0; i < Math.min(lines.length, maxLines); i++) {
                var line = lines[i];
                var escapedLine = escapeHtml(line);
                previewLines.push('<span class="cline-code-line">' + escapedLine + '</span>');
            }
            
            if (lines.length > maxLines) {
                previewLines.push('<span class="cline-code-line">// ... (' + (lines.length - maxLines) + ' more lines)</span>');
            }
            
            return previewLines.join('\n');
        }
        
        // 解析差异统计（保留兼容）
        function parseDiffStats(summary) {
            var result = { added: 0, removed: 0 };
            if (!summary) return result;
            
            var addedMatch = summary.match(/(\d+)\s*lines?\s*added/i);
            var removedMatch = summary.match(/(\d+)\s*lines?\s*removed/i);
            
            if (addedMatch) result.added = parseInt(addedMatch[1]);
            if (removedMatch) result.removed = parseInt(removedMatch[1]);
            
            return result;
        }
        
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