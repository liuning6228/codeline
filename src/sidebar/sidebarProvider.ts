import * as vscode from 'vscode';
import { TaskEngine, TaskResult, TaskStep } from '../task/taskEngine';
import { DiffViewer, ChangedFile } from '../diff/diffViewer';
import { FileManager, FileDiff } from '../file/fileManager';
import { createPermissionManager } from '../auth/PermissionManager';
import { AutoApprovalSettings } from '../auth/PermissionManager';
import { getWebviewContent } from './webviewContent';

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
        return getWebviewContent();
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