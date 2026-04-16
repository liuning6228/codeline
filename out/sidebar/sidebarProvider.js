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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeLineSidebarProvider = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const diffViewer_1 = require("../diff/diffViewer");
const PermissionManager_1 = require("../auth/PermissionManager");
const webviewContent_1 = require("./webviewContent");
const GRPCStreamAdapter_1 = __importDefault(require("../communication/GRPCStreamAdapter"));
class CodeLineSidebarProvider {
    static viewType = 'codeline.chat';
    _view;
    _extension;
    _currentView = 'chat';
    _currentMode = 'act'; // 新增：当前模式（act/plan）
    // 新增：任务引擎和权限管理
    _taskEngine = null;
    _permissionManager = (0, PermissionManager_1.createPermissionManager)();
    _fileManager = null;
    _pendingDiffs = new Map();
    // 新增：增强查询引擎
    _enhancedQueryEngine = null;
    _toolRegistry = null;
    // 新增：GRPC流式通信
    _grpcAdapter = null;
    _grpcConnection = null;
    // 自动批准设置
    _autoApprovalSettings = {
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
    constructor(context, extension) {
        this._extension = extension;
        this.loadAutoApprovalSettings(context);
    }
    /**
     * 设置任务引擎
     */
    setTaskEngine(taskEngine) {
        this._taskEngine = taskEngine;
    }
    /**
     * 设置文件管理器
     */
    setFileManager(fileManager) {
        this._fileManager = fileManager;
    }
    /**
     * 设置增强查询引擎
     */
    setEnhancedQueryEngine(engine) {
        this._enhancedQueryEngine = engine;
    }
    /**
     * 设置工具注册表
     */
    setToolRegistry(registry) {
        this._toolRegistry = registry;
    }
    /**
     * 加载自动批准设置
     */
    loadAutoApprovalSettings(context) {
        const savedSettings = context.globalState.get('codeline.autoApprovalSettings');
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
    async resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        // 获取构建目录的URI
        let buildDir;
        if (this._extension?.context?.extensionPath) {
            // 如果有扩展上下文，使用扩展路径
            const extensionPath = this._extension.context.extensionPath;
            buildDir = vscode.Uri.joinPath(vscode.Uri.file(extensionPath), 'webview-ui', 'build');
        }
        else {
            // 否则，从当前文件位置计算相对路径
            // 当前文件：/home/liuning/workspace/codeline/src/sidebar/sidebarProvider.ts
            // 构建目录：/home/liuning/workspace/codeline/webview-ui/build
            const relativeBuildPath = path.join(__dirname, '..', '..', 'webview-ui', 'build');
            buildDir = vscode.Uri.file(relativeBuildPath);
        }
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [buildDir]
        };
        // 加载构建的index.html
        const indexPath = vscode.Uri.joinPath(buildDir, 'index.html');
        const htmlContent = await this._loadHtmlFromFile(indexPath, webviewView.webview);
        webviewView.webview.html = htmlContent;
        // 初始化GRPC适配器（延迟加载）
        this.initializeGRPCAdapter().catch(error => {
            console.warn('GRPC适配器初始化失败，将继续使用降级模式:', error);
        });
        webviewView.webview.onDidReceiveMessage(async (message) => {
            console.log('Sidebar收到消息:', message);
            // 处理GRPC请求（Cline UI兼容）
            if (message.type === 'grpc_request' && message.grpc_request) {
                await this.handleGrpcRequest(message.grpc_request, webviewView);
                return;
            }
            // 原有命令处理
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
                // 适配器命令处理
                case 'file.openRelativePath':
                    await this.handleFileOpenRelativePath(message.data?.path, message.messageId, webviewView);
                    break;
                case 'file.selectFiles':
                    await this.handleFileSelectFiles(message.data?.supportsImages, message.messageId, webviewView);
                    break;
                case 'file.copyToClipboard':
                    await this.handleFileCopyToClipboard(message.data?.text, message.messageId, webviewView);
                    break;
                case 'file.read':
                    await this.handleFileRead(message.data?.path, message.messageId, webviewView);
                    break;
                case 'file.write':
                    await this.handleFileWrite(message.data?.path, message.data?.content, message.messageId, webviewView);
                    break;
                case 'file.list':
                    await this.handleFileList(message.data?.path, message.messageId, webviewView);
                    break;
                case 'ui.showAnnouncement':
                    await this.handleUiShowAnnouncement(message.messageId, webviewView);
                    break;
                case 'ui.navigate':
                    await this.handleUiNavigate(message.data?.view, message.data?.data, message.messageId, webviewView);
                    break;
                case 'state.dismissBanner':
                    await this.handleStateDismissBanner(message.data?.value, message.messageId, webviewView);
                    break;
                case 'tool.execute':
                    await this.handleToolExecute(message.data?.toolName, message.data?.params, message.messageId, webviewView);
                    break;
                case 'tool.cancel':
                    await this.handleToolCancel(message.data?.executionId, message.messageId, webviewView);
                    break;
                case 'tool.list':
                    await this.handleToolList(message.messageId, webviewView);
                    break;
                // 新增适配器命令处理
                case 'account.getUserOrganizations':
                    await this.handleAccountGetUserOrganizations(message.data, message.messageId, webviewView);
                    break;
                case 'account.loginClicked':
                    await this.handleAccountLoginClicked(message.data, message.messageId, webviewView);
                    break;
                case 'account.logoutClicked':
                    await this.handleAccountLogoutClicked(message.data, message.messageId, webviewView);
                    break;
                case 'account.authStateChanged':
                    await this.handleAccountAuthStateChanged(message.data, message.messageId, webviewView);
                    break;
                case 'account.getUserCredits':
                    await this.handleAccountGetUserCredits(message.data, message.messageId, webviewView);
                    break;
                case 'account.getOrganizationCredits':
                    await this.handleAccountGetOrganizationCredits(message.data, message.messageId, webviewView);
                    break;
                case 'account.setUserOrganization':
                    await this.handleAccountSetUserOrganization(message.data, message.messageId, webviewView);
                    break;
                case 'account.getRedirectUrl':
                    await this.handleAccountGetRedirectUrl(message.data, message.messageId, webviewView);
                    break;
                case 'account.openAiCodexSignIn':
                    await this.handleAccountOpenAiCodexSignIn(message.data, message.messageId, webviewView);
                    break;
                case 'account.openAiCodexSignOut':
                    await this.handleAccountOpenAiCodexSignOut(message.data, message.messageId, webviewView);
                    break;
                case 'mcp.getMarketplaceCatalog':
                    await this.handleMcpGetMarketplaceCatalog(message.data, message.messageId, webviewView);
                    break;
                case 'mcp.getServer':
                    await this.handleMcpGetServer(message.data, message.messageId, webviewView);
                    break;
                case 'models.getModels':
                    await this.handleModelsGetModels(message.data, message.messageId, webviewView);
                    break;
                case 'models.getDefaultModel':
                    await this.handleModelsGetDefaultModel(message.data, message.messageId, webviewView);
                    break;
                case 'slash.executeCommand':
                    await this.handleSlashExecuteCommand(message.data, message.messageId, webviewView);
                    break;
                case 'checkpoints.list':
                    await this.handleCheckpointsList(message.data, message.messageId, webviewView);
                    break;
                case 'oca.signIn':
                    await this.handleOcaSignIn(message.data, message.messageId, webviewView);
                    break;
                case 'oca.signOut':
                    await this.handleOcaSignOut(message.data, message.messageId, webviewView);
                    break;
                case 'web.openUrl':
                    await this.handleWebOpenUrl(message.data, message.messageId, webviewView);
                    break;
                case 'web.capturePage':
                    await this.handleWebCapturePage(message.data, message.messageId, webviewView);
                    break;
                case 'browser.getConnectionInfo':
                    await this.handleBrowserGetConnectionInfo(message.data, message.messageId, webviewView);
                    break;
                case 'worktree.list':
                    await this.handleWorktreeList(message.data, message.messageId, webviewView);
                    break;
                case 'worktree.trackViewOpened':
                    await this.handleWorktreeTrackViewOpened(message.data, message.messageId, webviewView);
                    break;
            }
        });
    }
    async handleSendMessage(text, webviewView) {
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
            // 优先级1: 使用增强查询引擎（如果可用且启用）
            if (this._enhancedQueryEngine && this._enhancedQueryEngine.getMode() === 'act') {
                console.log('使用EnhancedQueryEngine处理消息...');
                const result = await this._enhancedQueryEngine.submitMessageSync(text);
                if (result.success && result.message) {
                    // 显示结果
                    webviewView.webview.postMessage({
                        command: 'addMessage',
                        role: 'assistant',
                        content: result.message.content,
                        id: (Date.now() + 1).toString(),
                        timestamp: new Date(),
                        thinking: result.thinking,
                        toolCalls: result.toolCalls,
                        mode: this._enhancedQueryEngine.getMode()
                    });
                }
                else {
                    // 回退到TaskEngine
                    console.log('EnhancedQueryEngine处理失败，回退到TaskEngine');
                    await this.fallbackToTaskEngine(text, webviewView);
                }
            }
            // 优先级2: 使用TaskEngine执行任务（支持文件操作和权限检查）
            else if (this._taskEngine) {
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
            }
            else {
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
        }
        catch (error) {
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
        finally {
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
    async executeTaskWithPermissionCheck(text, webviewView) {
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
            }
            else {
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
    async showDiffPreview(diffId, diff, webviewView) {
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
            const changedFile = {
                relativePath: diff.filePath,
                absolutePath: absolutePath,
                before: diff.oldContent,
                after: diff.newContent
            };
            // 使用DiffViewer打开对比视图
            const result = await diffViewer_1.DiffViewer.openMultiFileDiff([changedFile], {
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
            }
            else if (result.rejected) {
                await this._taskEngine?.approveDiff(diffId, 'reject');
                this._pendingDiffs.delete(diffId);
                // 通知WebView
                webviewView.webview.postMessage({
                    command: 'diffRejected',
                    diffId,
                    filePath: diff.filePath
                });
            }
        }
        catch (error) {
            console.error('显示Diff预览失败:', error);
            vscode.window.showErrorMessage(`无法显示Diff预览: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getAIResponse(text) {
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
        }
        catch (error) {
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
    /**
     * 初始化GRPC适配器
     */
    async initializeGRPCAdapter() {
        if (this._grpcAdapter) {
            return;
        }
        try {
            this._grpcAdapter = GRPCStreamAdapter_1.default.getInstance();
            // 创建连接ID（基于扩展和会话）
            const connectionId = `codeline-sidebar-${Date.now()}`;
            // 创建GRPC连接
            this._grpcConnection = await this._grpcAdapter.createGRPCConnection(connectionId);
            // 监听连接事件
            this._grpcConnection.on('state:changed', ({ oldState, newState }) => {
                console.log(`GRPC连接状态变更: ${oldState} -> ${newState}`);
            });
            this._grpcConnection.on('service:event', ({ service, method, data }) => {
                console.log(`GRPC服务事件: ${service}.${method}`, data);
            });
            this._grpcConnection.on('event', (data) => {
                console.log('GRPC通用事件:', data);
            });
            console.log('✅ GRPC适配器初始化成功');
        }
        catch (error) {
            console.error('❌ GRPC适配器初始化失败:', error);
            this._grpcAdapter = null;
            this._grpcConnection = null;
            throw error;
        }
    }
    /**
     * 获取GRPC适配器
     */
    async getGRPCAdapter() {
        if (!this._grpcAdapter) {
            try {
                await this.initializeGRPCAdapter();
            }
            catch {
                // 初始化失败，返回null
            }
        }
        return this._grpcAdapter;
    }
    /**
     * 获取GRPC连接
     */
    async getGRPCConnection() {
        if (!this._grpcConnection) {
            const adapter = await this.getGRPCAdapter();
            if (!adapter) {
                return null;
            }
        }
        return this._grpcConnection;
    }
    /**
     * 回退到TaskEngine处理消息
     */
    async fallbackToTaskEngine(text, webviewView) {
        try {
            console.log('使用TaskEngine回退处理...');
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
        }
        catch (error) {
            console.error('TaskEngine回退处理失败:', error);
            // 最终回退到简单AI回复
            const reply = await this.getAIResponse(text);
            webviewView.webview.postMessage({
                command: 'addMessage',
                role: 'assistant',
                content: reply,
                id: (Date.now() + 1).toString(),
                timestamp: new Date()
            });
        }
    }
    updateView(webviewView) {
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
    postMessage(message) {
        if (this._view) {
            this._view.webview.postMessage(message);
        }
    }
    // ===== New message handlers =====
    async handleRequestState(webviewView) {
        try {
            // 优先使用增强查询引擎的状态
            let mode = 'act';
            let enhancedState = null;
            if (this._enhancedQueryEngine) {
                mode = this._enhancedQueryEngine.getMode();
                const engineState = this._enhancedQueryEngine.getState();
                enhancedState = {
                    hasEnhancedEngine: true,
                    turnCount: engineState.turnCount,
                    messageCount: engineState.messages.length,
                    toolCallCount: engineState.toolCalls.length,
                    usage: engineState.usage
                };
            }
            else {
                // 回退到扩展模式
                mode = await this._extension.getMode();
            }
            const config = this._extension.getConfig();
            webviewView.webview.postMessage({
                type: 'state',
                state: {
                    mode,
                    apiConfiguration: config ? {
                        providerId: config.provider || 'unknown',
                        modelId: config.model || 'unknown'
                    } : undefined,
                    version: '0.2.0',
                    enhancedState
                }
            });
        }
        catch (error) {
            console.error('Failed to get state:', error);
        }
    }
    async handleExecuteTask(text, images = [], files = [], webviewView) {
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
            }
            else {
                webviewView.webview.postMessage({
                    type: 'taskError',
                    error: result?.error || 'Task execution failed'
                });
            }
        }
        catch (error) {
            console.error('Task execution error:', error);
            webviewView.webview.postMessage({
                type: 'taskError',
                error: error.message
            });
        }
    }
    async handleSetMode(mode, webviewView) {
        try {
            await this._extension.setMode(mode);
            webviewView.webview.postMessage({
                type: 'modeChanged',
                mode
            });
        }
        catch (error) {
            console.error('Failed to set mode:', error);
        }
    }
    async handleToggleMode(webviewView) {
        try {
            const newMode = await this._extension.toggleMode();
            webviewView.webview.postMessage({
                type: 'modeChanged',
                mode: newMode
            });
        }
        catch (error) {
            console.error('Failed to toggle mode:', error);
        }
    }
    async handleClearTask(webviewView) {
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
        }
        catch (error) {
            console.error('Failed to clear task:', error);
        }
    }
    async handleApproveDiff(diffId, action, webviewView) {
        try {
            let result;
            // 首先尝试使用TaskEngine
            if (this._taskEngine) {
                result = await this._taskEngine.approveDiff(diffId, action);
            }
            else {
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
        }
        catch (error) {
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
    async handlePreviewDiff(diffId, filePath, webviewView) {
        try {
            // 从待处理差异中获取文件内容
            const pendingDiff = this._pendingDiffs.get(diffId);
            if (pendingDiff) {
                // 使用 DiffViewer 打开预览
                await this.showDiffPreview(diffId, pendingDiff.diff, webviewView);
            }
            else {
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
        }
        catch (error) {
            console.error('Failed to preview diff:', error);
            vscode.window.showErrorMessage(`无法预览差异: ${error.message}`);
        }
    }
    async handleSetAutoApprove(permission, enabled, webviewView) {
        try {
            console.log(`设置自动批准权限: ${permission} = ${enabled}`);
            // 更新本地设置
            if (permission in this._autoApprovalSettings.actions) {
                this._autoApprovalSettings.actions[permission] = enabled;
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
        }
        catch (error) {
            console.error('Failed to set auto approve:', error);
        }
    }
    async handleSetYoloMode(enabled, webviewView) {
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
            }
            else {
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
        }
        catch (error) {
            console.error('Failed to set YOLO mode:', error);
        }
    }
    /**
     * 处理GRPC请求（Cline UI兼容）
     */
    async handleGrpcRequest(grpcRequest, webviewView) {
        console.log('处理GRPC请求:', grpcRequest);
        const { service, method, message, request_id, is_streaming } = grpcRequest;
        // 优先级1: 尝试使用GRPC适配器（如果可用且不是流式方法）
        if (!is_streaming) {
            const grpcConnection = await this.getGRPCConnection();
            if (grpcConnection && grpcConnection.getState() === 'connected') {
                try {
                    const grpcResponse = await grpcConnection.call(service, method, message, {
                        timeout: 30000,
                    });
                    // 发送GRPC响应
                    webviewView.webview.postMessage({
                        type: 'grpc_response',
                        grpc_response: {
                            request_id,
                            message: grpcResponse.data || {},
                            metadata: grpcResponse.metadata,
                            is_streaming: false
                        }
                    });
                    return;
                }
                catch (grpcError) {
                    console.warn('GRPC适配器调用失败，回退到本地处理:', grpcError.message);
                    // 继续使用本地处理
                }
            }
        }
        // 优先级2: 使用本地处理
        try {
            // 根据service和method路由到相应的处理函数
            let response;
            let error;
            // UiService 方法映射
            if (service === 'UiService') {
                switch (method) {
                    case 'onDidShowAnnouncement':
                        response = { value: true };
                        break;
                    case 'initializeWebview':
                        response = {};
                        break;
                    case 'getWebviewHtml':
                        response = { value: this._getWebviewContent() };
                        break;
                    case 'openUrl':
                        if (message && message.value) {
                            vscode.env.openExternal(vscode.Uri.parse(message.value));
                        }
                        response = {};
                        break;
                    case 'scrollToSettings':
                        // 暂时返回成功
                        response = { key: 'scroll', value: 'success' };
                        break;
                    default:
                        // 对于流式方法，返回空响应
                        if (method.startsWith('subscribeTo')) {
                            response = {};
                        }
                        else {
                            response = await this.mapGrpcToCommand(service, method, message, webviewView);
                        }
                }
            }
            // StateService 方法映射
            else if (service === 'StateService') {
                switch (method) {
                    case 'dismissBanner':
                        response = { success: true };
                        break;
                    case 'getLatestState':
                        // 返回模拟状态（包含增强引擎信息）
                        response = await this.getSimulatedState();
                        break;
                    case 'updateSettings':
                        // 暂时返回成功
                        response = {};
                        break;
                    case 'togglePlanActModeProto':
                        // 切换计划/行动模式（支持增强查询引擎）
                        response = { value: await this.toggleModeWithEnhancedEngine() };
                        break;
                    default:
                        response = await this.mapGrpcToCommand(service, method, message, webviewView);
                }
            }
            // EnhancedEngineService 方法映射（新增）
            else if (service === 'EnhancedEngineService') {
                switch (method) {
                    case 'getEnhancedEngineStatus':
                        response = await this.getEnhancedEngineStatus();
                        break;
                    case 'toggleEnhancedEngineMode':
                        if (this._enhancedQueryEngine) {
                            const currentMode = this._enhancedQueryEngine.getMode();
                            const newMode = currentMode === 'act' ? 'plan' : 'act';
                            this._enhancedQueryEngine.setMode(newMode);
                            response = { success: true, mode: newMode };
                        }
                        else {
                            response = { success: false, error: 'Enhanced engine not available' };
                        }
                        break;
                    case 'getEnhancedEngineState':
                        response = await this.getEnhancedEngineDetailedState();
                        break;
                    case 'clearEnhancedEngineConversation':
                        if (this._enhancedQueryEngine) {
                            this._enhancedQueryEngine.clear();
                            response = { success: true };
                        }
                        else {
                            response = { success: false, error: 'Enhanced engine not available' };
                        }
                        break;
                    case 'exportEnhancedEngineConversation':
                        if (this._enhancedQueryEngine) {
                            const exportData = this._enhancedQueryEngine.exportConversation();
                            response = { success: true, exportData };
                        }
                        else {
                            response = { success: false, error: 'Enhanced engine not available' };
                        }
                        break;
                    default:
                        response = { success: false, error: `Method ${method} not supported for EnhancedEngineService` };
                }
            }
            // 未知服务
            else {
                response = await this.mapGrpcToCommand(service, method, message, webviewView);
            }
            // 发送GRPC响应
            webviewView.webview.postMessage({
                type: 'grpc_response',
                grpc_response: {
                    request_id,
                    message: response,
                    error,
                    is_streaming: false
                }
            });
        }
        catch (err) {
            console.error('处理GRPC请求时出错:', err);
            webviewView.webview.postMessage({
                type: 'grpc_response',
                grpc_response: {
                    request_id,
                    error: err.message || '未知错误',
                    is_streaming: false
                }
            });
        }
    }
    /**
     * 将GRPC请求映射到现有命令或增强查询引擎
     */
    async mapGrpcToCommand(service, method, message, webviewView) {
        console.log(`映射GRPC请求: ${service}.${method}`, message);
        // 尝试将GRPC方法映射到增强查询引擎操作
        if (this._enhancedQueryEngine) {
            const result = await this.mapToEnhancedEngine(service, method, message, webviewView);
            if (result.handled) {
                return result.response;
            }
        }
        // 默认映射：尝试将GRPC方法映射到现有CodeLine命令
        switch (service) {
            case 'UiService':
                return await this.mapUiService(method, message, webviewView);
            case 'StateService':
                return await this.mapStateService(method, message, webviewView);
            case 'QueryService':
                return await this.mapQueryService(method, message, webviewView);
            default:
                console.warn(`未知的GRPC服务: ${service}`);
                return {};
        }
    }
    /**
     * 映射到增强查询引擎
     */
    async mapToEnhancedEngine(service, method, message, webviewView) {
        try {
            switch (service) {
                case 'UiService':
                    switch (method) {
                        case 'onDidShowAnnouncement':
                            return { handled: true, response: { value: true } };
                        case 'initializeWebview':
                            return { handled: true, response: {} };
                        case 'getWebviewHtml':
                            return { handled: true, response: { value: this._getWebviewContent() } };
                        case 'openUrl':
                            if (message && message.value) {
                                vscode.env.openExternal(vscode.Uri.parse(message.value));
                            }
                            return { handled: true, response: {} };
                    }
                    break;
                case 'StateService':
                    switch (method) {
                        case 'getLatestState':
                            const state = await this.getSimulatedState();
                            return { handled: true, response: state };
                        case 'dismissBanner':
                            return { handled: true, response: { success: true } };
                        case 'updateSettings':
                            // TODO: 实现设置更新
                            return { handled: true, response: {} };
                        case 'togglePlanActModeProto':
                            const isPlanMode = await this.toggleMode();
                            return { handled: true, response: { value: isPlanMode } };
                    }
                    break;
                case 'QueryService':
                    switch (method) {
                        case 'submitMessage':
                            if (message && message.value) {
                                // 这里可以调用增强查询引擎，但为了避免阻塞，暂时返回成功
                                return { handled: true, response: { success: true, messageId: `msg-${Date.now()}` } };
                            }
                            break;
                    }
                    break;
            }
        }
        catch (error) {
            console.error(`映射到增强引擎失败: ${error.message}`);
        }
        return { handled: false, response: {} };
    }
    /**
     * 映射UiService方法
     */
    async mapUiService(method, message, webviewView) {
        switch (method) {
            case 'openUrl':
                if (message && message.value) {
                    vscode.env.openExternal(vscode.Uri.parse(message.value));
                }
                return {};
            case 'showInformationMessage':
                if (message && message.value) {
                    vscode.window.showInformationMessage(message.value);
                }
                return {};
            default:
                console.warn(`未实现的UiService方法: ${method}`);
                return {};
        }
    }
    /**
     * 映射StateService方法
     */
    async mapStateService(method, message, webviewView) {
        switch (method) {
            case 'getLatestState':
                return await this.handleRequestState(webviewView);
            case 'updateSettings':
                // TODO: 实现设置更新
                console.log('StateService.updateSettings called:', message);
                return {};
            default:
                console.warn(`未实现的StateService方法: ${method}`);
                return {};
        }
    }
    /**
     * 映射QueryService方法
     */
    async mapQueryService(method, message, webviewView) {
        switch (method) {
            case 'submitMessage':
                if (message && message.value) {
                    // 处理消息提交
                    await this.handleSendMessage(message.value, webviewView);
                    return { success: true, messageId: `msg-${Date.now()}` };
                }
                break;
            case 'cancelMessage':
                if (message && message.messageId) {
                    // 取消消息处理
                    console.log(`取消消息: ${message.messageId}`);
                    return { success: true };
                }
                break;
            default:
                console.warn(`未实现的QueryService方法: ${method}`);
                return {};
        }
        return {};
    }
    /**
     * 获取模拟状态（临时实现）
     */
    async getSimulatedState() {
        // 如果有增强查询引擎，返回其真实状态
        if (this._enhancedQueryEngine) {
            const engineState = this._enhancedQueryEngine.getState();
            const engineMode = this._enhancedQueryEngine.getMode();
            return {
                mode: engineMode,
                showWelcome: false,
                shouldShowAnnouncement: false,
                showSettings: false,
                showHistory: false,
                showAccount: false,
                showWorktrees: false,
                showMcp: false,
                mcpTab: 'servers',
                settingsTargetSection: 'general',
                didHydrateState: true,
                showAnnouncement: false,
                dismissedBanners: [],
                hasShownKanbanModal: true,
                showKanbanModal: false,
                activeOrganization: null,
                clineUser: null,
                organizations: [],
                version: '1.0.0',
                distinctId: 'codeline-' + Date.now(),
                // 增强查询引擎特定状态
                enhancedEngine: {
                    hasEngine: true,
                    turnCount: engineState.turnCount,
                    messageCount: engineState.messages.length,
                    toolCallCount: engineState.toolCalls.length,
                    usage: engineState.usage,
                    mode: engineMode
                }
            };
        }
        // 否则返回默认模拟状态
        return {
            mode: 'chat',
            showWelcome: false,
            shouldShowAnnouncement: false,
            showSettings: false,
            showHistory: false,
            showAccount: false,
            showWorktrees: false,
            showMcp: false,
            mcpTab: 'servers',
            settingsTargetSection: 'general',
            didHydrateState: true,
            showAnnouncement: false,
            dismissedBanners: [],
            hasShownKanbanModal: true,
            showKanbanModal: false,
            activeOrganization: null,
            clineUser: null,
            organizations: [],
            version: '1.0.0',
            distinctId: 'codeline-' + Date.now()
        };
    }
    /**
     * 切换计划/行动模式
     */
    async toggleMode() {
        // 优先切换增强查询引擎的模式
        if (this._enhancedQueryEngine) {
            const currentMode = this._enhancedQueryEngine.getMode();
            const newMode = currentMode === 'act' ? 'plan' : 'act';
            this._enhancedQueryEngine.setMode(newMode);
            console.log(`切换增强查询引擎模式: ${currentMode} -> ${newMode}`);
            return newMode === 'plan';
        }
        // 否则切换内部模式
        const currentMode = this._currentMode || 'act';
        this._currentMode = currentMode === 'act' ? 'plan' : 'act';
        console.log(`切换内部模式: ${currentMode} -> ${this._currentMode}`);
        return this._currentMode === 'plan';
    }
    /**
     * 切换计划/行动模式（增强引擎版本）
     */
    async toggleModeWithEnhancedEngine() {
        return await this.toggleMode();
    }
    /**
     * 获取增强引擎状态
     */
    async getEnhancedEngineStatus() {
        try {
            if (this._enhancedQueryEngine) {
                const state = this._enhancedQueryEngine.getState();
                const mode = this._enhancedQueryEngine.getMode();
                const usage = this._enhancedQueryEngine.getUsage();
                const messages = this._enhancedQueryEngine.getMessages();
                return {
                    available: true,
                    ready: true,
                    mode,
                    stats: {
                        turnCount: state.turnCount,
                        messageCount: messages.length,
                        toolCallCount: state.toolCalls.length,
                        usage: usage,
                    },
                    state: {
                        mode,
                        thinking: state.thinking,
                        messages: messages.slice(-5), // 最近5条消息
                        toolCalls: state.toolCalls.slice(-5), // 最近5个工具调用
                    },
                    timestamp: new Date().toISOString(),
                };
            }
            // 如果增强查询引擎不可用，尝试从扩展获取
            if (this._extension) {
                try {
                    const adapter = await this._extension.getEnhancedEngineAdapter();
                    const adapterState = adapter.getState();
                    const engine = adapter.getEngine();
                    if (engine) {
                        const state = engine.getState();
                        const mode = engine.getMode();
                        const usage = engine.getUsage();
                        const messages = engine.getMessages();
                        return {
                            available: true,
                            ready: adapterState.engineReady,
                            mode,
                            stats: {
                                turnCount: state.turnCount,
                                messageCount: messages.length,
                                toolCallCount: state.toolCalls.length,
                                usage: usage,
                            },
                            adapterState: adapterState,
                            timestamp: new Date().toISOString(),
                        };
                    }
                    else {
                        return {
                            available: false,
                            ready: false,
                            error: 'Engine not created yet',
                            adapterState: adapterState,
                        };
                    }
                }
                catch (error) {
                    return {
                        available: false,
                        ready: false,
                        error: `Failed to get adapter: ${error.message}`,
                    };
                }
            }
            return {
                available: false,
                ready: false,
                error: 'Enhanced engine not available',
            };
        }
        catch (error) {
            console.error('获取增强引擎状态失败:', error);
            return {
                available: false,
                ready: false,
                error: error.message,
            };
        }
    }
    /**
     * 获取增强引擎详细状态
     */
    async getEnhancedEngineDetailedState() {
        try {
            const status = await this.getEnhancedEngineStatus();
            // 如果引擎可用，获取更多详细信息
            if (status.available && this._enhancedQueryEngine) {
                const state = this._enhancedQueryEngine.getState();
                const messages = this._enhancedQueryEngine.getMessages();
                const usage = this._enhancedQueryEngine.getUsage();
                return {
                    ...status,
                    detailed: {
                        conversationState: {
                            mode: state.mode,
                            thinking: state.thinking,
                            turnCount: state.turnCount,
                            toolCalls: state.toolCalls,
                        },
                        messages: messages,
                        usage: usage,
                        toolRegistry: this._toolRegistry ? {
                            toolCount: this._toolRegistry.getAllTools().length,
                            categories: this._toolRegistry.getAllTools().reduce((cats, tool) => {
                                if (!cats.includes(tool.category))
                                    cats.push(tool.category);
                                return cats;
                            }, []),
                        } : null,
                        exportAvailable: true,
                        importAvailable: true,
                    },
                    timestamp: new Date().toISOString(),
                };
            }
            return status;
        }
        catch (error) {
            console.error('获取增强引擎详细状态失败:', error);
            return {
                available: false,
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
    /**
     * 从构建目录加载HTML内容并转换资源路径
     */
    async _loadHtmlFromFile(indexPath, webview) {
        try {
            console.log('加载构建的HTML:', indexPath.fsPath);
            // 读取HTML文件
            let html = fs.readFileSync(indexPath.fsPath, 'utf-8');
            // 转换资源路径：将相对路径转换为webview可访问的URI
            const buildDir = path.dirname(indexPath.fsPath);
            const assetsDir = path.join(buildDir, 'assets');
            // 转换CSS和JS引用
            html = html.replace(/(href|src)=["']([^"']+\.(css|js|woff2?|ttf|mp4))["']/g, (match, attr, resourcePath) => {
                const fullPath = path.join(buildDir, resourcePath);
                if (fs.existsSync(fullPath)) {
                    const webviewUri = webview.asWebviewUri(vscode.Uri.file(fullPath));
                    return `${attr}="${webviewUri}"`;
                }
                return match;
            });
            console.log('HTML转换完成');
            return html;
        }
        catch (error) {
            console.error('加载构建HTML失败:', error);
            // 回退到原始内容
            return this._getWebviewContent();
        }
    }
    _getWebviewContent() {
        return (0, webviewContent_1.getWebviewContent)();
    }
    show() {
        if (this._view) {
            this._view.show?.(true);
        }
    }
    sendMessageToChat(message) {
        if (this._view) {
            this._view.webview.postMessage({
                command: 'receiveMessage',
                text: message
            });
        }
    }
    focusChatInput() {
        if (this._view) {
            this._view.webview.postMessage({
                command: 'focusInput'
            });
        }
    }
    // ------------------------------------------------------------
    // 适配器命令处理函数
    // ------------------------------------------------------------
    /**
     * 发送响应消息到WebView
     */
    sendAdapterResponse(messageId, data, error, webviewView) {
        const targetView = webviewView || this._view;
        if (!targetView)
            return;
        targetView.webview.postMessage({
            messageId,
            data,
            error
        });
    }
    // 文件操作处理函数
    async handleFileOpenRelativePath(path, messageId, webviewView) {
        try {
            if (!path) {
                this.sendAdapterResponse(messageId, null, 'Path is required', webviewView);
                return;
            }
            // 打开文件
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                this.sendAdapterResponse(messageId, null, 'No workspace folder open', webviewView);
                return;
            }
            const workspacePath = workspaceFolders[0].uri.fsPath;
            const filePath = require('path').join(workspacePath, path);
            const uri = vscode.Uri.file(filePath);
            const document = await vscode.workspace.openTextDocument(uri);
            await vscode.window.showTextDocument(document);
            this.sendAdapterResponse(messageId, { success: true }, undefined, webviewView);
        }
        catch (error) {
            this.sendAdapterResponse(messageId, null, error.message, webviewView);
        }
    }
    async handleFileSelectFiles(supportsImages, messageId, webviewView) {
        try {
            const options = {
                canSelectMany: true,
                openLabel: 'Select',
                filters: supportsImages ? {
                    'Images': ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'],
                    'All files': ['*']
                } : undefined
            };
            const fileUris = await vscode.window.showOpenDialog(options);
            if (!fileUris || fileUris.length === 0) {
                this.sendAdapterResponse(messageId, { images: [], files: [] }, undefined, webviewView);
                return;
            }
            const images = [];
            const files = [];
            fileUris.forEach(uri => {
                const extension = require('path').extname(uri.fsPath).toLowerCase();
                const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'];
                if (supportsImages && imageExtensions.includes(extension)) {
                    images.push(uri.fsPath);
                }
                else {
                    files.push(uri.fsPath);
                }
            });
            this.sendAdapterResponse(messageId, { images, files }, undefined, webviewView);
        }
        catch (error) {
            this.sendAdapterResponse(messageId, null, error.message, webviewView);
        }
    }
    async handleFileCopyToClipboard(text, messageId, webviewView) {
        try {
            if (!text) {
                this.sendAdapterResponse(messageId, null, 'Text is required', webviewView);
                return;
            }
            await vscode.env.clipboard.writeText(text);
            this.sendAdapterResponse(messageId, { success: true }, undefined, webviewView);
        }
        catch (error) {
            this.sendAdapterResponse(messageId, null, error.message, webviewView);
        }
    }
    async handleFileRead(path, messageId, webviewView) {
        try {
            if (!path) {
                this.sendAdapterResponse(messageId, null, 'Path is required', webviewView);
                return;
            }
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                this.sendAdapterResponse(messageId, null, 'No workspace folder open', webviewView);
                return;
            }
            const workspacePath = workspaceFolders[0].uri.fsPath;
            const filePath = require('path').join(workspacePath, path);
            const uri = vscode.Uri.file(filePath);
            const document = await vscode.workspace.openTextDocument(uri);
            const content = document.getText();
            this.sendAdapterResponse(messageId, { content }, undefined, webviewView);
        }
        catch (error) {
            this.sendAdapterResponse(messageId, null, error.message, webviewView);
        }
    }
    async handleFileWrite(path, content, messageId, webviewView) {
        try {
            if (!path) {
                this.sendAdapterResponse(messageId, null, 'Path is required', webviewView);
                return;
            }
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                this.sendAdapterResponse(messageId, null, 'No workspace folder open', webviewView);
                return;
            }
            const workspacePath = workspaceFolders[0].uri.fsPath;
            const filePath = require('path').join(workspacePath, path);
            const uri = vscode.Uri.file(filePath);
            await vscode.workspace.fs.writeFile(uri, Buffer.from(content || '', 'utf8'));
            this.sendAdapterResponse(messageId, { success: true }, undefined, webviewView);
        }
        catch (error) {
            this.sendAdapterResponse(messageId, null, error.message, webviewView);
        }
    }
    async handleFileList(path, messageId, webviewView) {
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                this.sendAdapterResponse(messageId, null, 'No workspace folder open', webviewView);
                return;
            }
            const workspacePath = workspaceFolders[0].uri.fsPath;
            const targetPath = path ? require('path').join(workspacePath, path) : workspacePath;
            const uri = vscode.Uri.file(targetPath);
            const entries = await vscode.workspace.fs.readDirectory(uri);
            const files = entries
                .filter(([name, type]) => type === vscode.FileType.File)
                .map(([name]) => name);
            this.sendAdapterResponse(messageId, { files }, undefined, webviewView);
        }
        catch (error) {
            this.sendAdapterResponse(messageId, null, error.message, webviewView);
        }
    }
    // UI操作处理函数
    async handleUiShowAnnouncement(messageId, webviewView) {
        try {
            vscode.window.showInformationMessage('Show announcement (placeholder)');
            this.sendAdapterResponse(messageId, { success: true }, undefined, webviewView);
        }
        catch (error) {
            this.sendAdapterResponse(messageId, null, error.message, webviewView);
        }
    }
    async handleUiNavigate(view, data, messageId, webviewView) {
        try {
            // 发送切换视图消息到WebView
            webviewView.webview.postMessage({
                command: 'switchView',
                view: view
            });
            this.sendAdapterResponse(messageId, { success: true }, undefined, webviewView);
        }
        catch (error) {
            this.sendAdapterResponse(messageId, null, error.message, webviewView);
        }
    }
    async handleStateDismissBanner(bannerId, messageId, webviewView) {
        try {
            // 处理横幅关闭
            console.log('Dismiss banner:', bannerId);
            this.sendAdapterResponse(messageId, { success: true }, undefined, webviewView);
        }
        catch (error) {
            this.sendAdapterResponse(messageId, null, error.message, webviewView);
        }
    }
    // 工具操作处理函数
    async handleToolExecute(toolName, params, messageId, webviewView) {
        try {
            console.log('Execute tool:', toolName, params);
            // 这里应该调用Claude Code的QueryEngine
            // 暂时返回模拟结果
            const result = {
                success: true,
                output: `Tool ${toolName} executed with params: ${JSON.stringify(params)}`,
                executionId: Date.now().toString(),
            };
            this.sendAdapterResponse(messageId, result, undefined, webviewView);
        }
        catch (error) {
            this.sendAdapterResponse(messageId, null, error.message, webviewView);
        }
    }
    async handleToolCancel(executionId, messageId, webviewView) {
        try {
            console.log('Cancel tool:', executionId);
            this.sendAdapterResponse(messageId, { success: true }, undefined, webviewView);
        }
        catch (error) {
            this.sendAdapterResponse(messageId, null, error.message, webviewView);
        }
    }
    async handleToolList(messageId, webviewView) {
        try {
            // 返回工具列表
            const tools = [
                { name: 'read_file', description: '读取文件内容', category: 'file' },
                { name: 'write_file', description: '写入文件', category: 'file' },
                { name: 'execute_command', description: '执行终端命令', category: 'terminal' },
            ];
            this.sendAdapterResponse(messageId, { tools }, undefined, webviewView);
        }
        catch (error) {
            this.sendAdapterResponse(messageId, null, error.message, webviewView);
        }
    }
    // 账户相关方法存根
    async handleAccountGetUserOrganizations(data, messageId, webviewView) {
        this.sendAdapterResponse(messageId, { organizations: [] }, undefined, webviewView);
    }
    async handleAccountLoginClicked(data, messageId, webviewView) {
        this.sendAdapterResponse(messageId, { success: true }, undefined, webviewView);
    }
    async handleAccountLogoutClicked(data, messageId, webviewView) {
        this.sendAdapterResponse(messageId, { success: true }, undefined, webviewView);
    }
    async handleAccountAuthStateChanged(data, messageId, webviewView) {
        this.sendAdapterResponse(messageId, { status: 'not_implemented' }, undefined, webviewView);
    }
    async handleAccountGetUserCredits(data, messageId, webviewView) {
        this.sendAdapterResponse(messageId, { credits: 0 }, undefined, webviewView);
    }
    async handleAccountGetOrganizationCredits(data, messageId, webviewView) {
        this.sendAdapterResponse(messageId, { credits: 0 }, undefined, webviewView);
    }
    async handleAccountSetUserOrganization(data, messageId, webviewView) {
        this.sendAdapterResponse(messageId, { success: true }, undefined, webviewView);
    }
    async handleAccountGetRedirectUrl(data, messageId, webviewView) {
        this.sendAdapterResponse(messageId, { url: '' }, undefined, webviewView);
    }
    async handleAccountOpenAiCodexSignIn(data, messageId, webviewView) {
        this.sendAdapterResponse(messageId, { success: true }, undefined, webviewView);
    }
    async handleAccountOpenAiCodexSignOut(data, messageId, webviewView) {
        this.sendAdapterResponse(messageId, { success: true }, undefined, webviewView);
    }
    // MCP相关方法存根
    async handleMcpGetMarketplaceCatalog(data, messageId, webviewView) {
        this.sendAdapterResponse(messageId, { catalog: [] }, undefined, webviewView);
    }
    async handleMcpGetServer(data, messageId, webviewView) {
        this.sendAdapterResponse(messageId, { server: null }, undefined, webviewView);
    }
    // 模型相关方法存根
    async handleModelsGetModels(data, messageId, webviewView) {
        this.sendAdapterResponse(messageId, { models: [] }, undefined, webviewView);
    }
    async handleModelsGetDefaultModel(data, messageId, webviewView) {
        this.sendAdapterResponse(messageId, { model: null }, undefined, webviewView);
    }
    // 斜杠命令方法存根
    async handleSlashExecuteCommand(data, messageId, webviewView) {
        this.sendAdapterResponse(messageId, { success: true }, undefined, webviewView);
    }
    // 检查点方法存根
    async handleCheckpointsList(data, messageId, webviewView) {
        this.sendAdapterResponse(messageId, { checkpoints: [] }, undefined, webviewView);
    }
    // OCA方法存根
    async handleOcaSignIn(data, messageId, webviewView) {
        this.sendAdapterResponse(messageId, { success: true }, undefined, webviewView);
    }
    async handleOcaSignOut(data, messageId, webviewView) {
        this.sendAdapterResponse(messageId, { success: true }, undefined, webviewView);
    }
    // Web方法存根
    async handleWebOpenUrl(data, messageId, webviewView) {
        this.sendAdapterResponse(messageId, { success: true }, undefined, webviewView);
    }
    async handleWebCapturePage(data, messageId, webviewView) {
        this.sendAdapterResponse(messageId, { success: true }, undefined, webviewView);
    }
    // 浏览器方法存根
    async handleBrowserGetConnectionInfo(data, messageId, webviewView) {
        this.sendAdapterResponse(messageId, { connectionInfo: null }, undefined, webviewView);
    }
    // 工作树方法存根
    async handleWorktreeList(data, messageId, webviewView) {
        this.sendAdapterResponse(messageId, { worktrees: [] }, undefined, webviewView);
    }
    async handleWorktreeTrackViewOpened(data, messageId, webviewView) {
        this.sendAdapterResponse(messageId, { success: true }, undefined, webviewView);
    }
}
exports.CodeLineSidebarProvider = CodeLineSidebarProvider;
//# sourceMappingURL=sidebarProvider.js.map