import * as vscode from 'vscode';
import { TaskEngine } from '../task/taskEngine';
import { FileManager } from '../file/fileManager';
import { EnhancedQueryEngine } from '../core/EnhancedQueryEngine';
import { EnhancedToolRegistry } from '../core/tool/EnhancedToolRegistry';
export declare class CodeLineSidebarProvider implements vscode.WebviewViewProvider {
    static readonly viewType = "codeline.chat";
    private _view?;
    private _extension;
    private _currentView;
    private _currentMode;
    private _taskEngine;
    private _permissionManager;
    private _fileManager;
    private _pendingDiffs;
    private _enhancedQueryEngine;
    private _toolRegistry;
    private _grpcAdapter;
    private _grpcConnection;
    private _autoApprovalSettings;
    constructor(context: vscode.ExtensionContext, extension: any);
    /**
     * 设置任务引擎
     */
    setTaskEngine(taskEngine: TaskEngine): void;
    /**
     * 设置文件管理器
     */
    setFileManager(fileManager: FileManager): void;
    /**
     * 设置增强查询引擎
     */
    setEnhancedQueryEngine(engine: EnhancedQueryEngine): void;
    /**
     * 设置工具注册表
     */
    setToolRegistry(registry: EnhancedToolRegistry): void;
    /**
     * 加载自动批准设置
     */
    private loadAutoApprovalSettings;
    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken): Promise<void>;
    private handleSendMessage;
    /**
     * 使用TaskEngine执行任务，并进行权限检查和Diff预览
     */
    private executeTaskWithPermissionCheck;
    /**
     * 显示Diff预览（在编辑器中打开对比视图）
     */
    private showDiffPreview;
    private getAIResponse;
    /**
     * 初始化GRPC适配器
     */
    private initializeGRPCAdapter;
    /**
     * 获取GRPC适配器
     */
    private getGRPCAdapter;
    /**
     * 获取GRPC连接
     */
    private getGRPCConnection;
    /**
     * 回退到TaskEngine处理消息
     */
    private fallbackToTaskEngine;
    private updateView;
    /**
     * Post a message to the webview
     */
    postMessage(message: any): void;
    private handleRequestState;
    private handleExecuteTask;
    private handleSetMode;
    private handleToggleMode;
    private handleClearTask;
    private handleApproveDiff;
    /**
     * 处理预览差异请求 - 打开Diff编辑器
     */
    private handlePreviewDiff;
    private handleSetAutoApprove;
    private handleSetYoloMode;
    /**
     * 处理GRPC请求（Cline UI兼容）
     */
    private handleGrpcRequest;
    /**
     * 将GRPC请求映射到现有命令或增强查询引擎
     */
    private mapGrpcToCommand;
    /**
     * 映射到增强查询引擎
     */
    private mapToEnhancedEngine;
    /**
     * 映射UiService方法
     */
    private mapUiService;
    /**
     * 映射StateService方法
     */
    private mapStateService;
    /**
     * 映射QueryService方法
     */
    private mapQueryService;
    /**
     * 获取模拟状态（临时实现）
     */
    private getSimulatedState;
    /**
     * 切换计划/行动模式
     */
    private toggleMode;
    /**
     * 切换计划/行动模式（增强引擎版本）
     */
    private toggleModeWithEnhancedEngine;
    /**
     * 获取增强引擎状态
     */
    private getEnhancedEngineStatus;
    /**
     * 获取增强引擎详细状态
     */
    private getEnhancedEngineDetailedState;
    /**
     * 从构建目录加载HTML内容并转换资源路径
     */
    private _loadHtmlFromFile;
    private _getWebviewContent;
    show(): void;
    sendMessageToChat(message: string): void;
    focusChatInput(): void;
    /**
     * 发送响应消息到WebView
     */
    private sendAdapterResponse;
    private handleFileOpenRelativePath;
    private handleFileSelectFiles;
    private handleFileCopyToClipboard;
    private handleFileRead;
    private handleFileWrite;
    private handleFileList;
    private handleUiShowAnnouncement;
    private handleUiNavigate;
    private handleStateDismissBanner;
    private handleToolExecute;
    private handleToolCancel;
    private handleToolList;
    private handleAccountGetUserOrganizations;
    private handleAccountLoginClicked;
    private handleAccountLogoutClicked;
    private handleAccountAuthStateChanged;
    private handleAccountGetUserCredits;
    private handleAccountGetOrganizationCredits;
    private handleAccountSetUserOrganization;
    private handleAccountGetRedirectUrl;
    private handleAccountOpenAiCodexSignIn;
    private handleAccountOpenAiCodexSignOut;
    private handleMcpGetMarketplaceCatalog;
    private handleMcpGetServer;
    private handleModelsGetModels;
    private handleModelsGetDefaultModel;
    private handleSlashExecuteCommand;
    private handleCheckpointsList;
    private handleOcaSignIn;
    private handleOcaSignOut;
    private handleWebOpenUrl;
    private handleWebCapturePage;
    private handleBrowserGetConnectionInfo;
    private handleWorktreeList;
    private handleWorktreeTrackViewOpened;
}
//# sourceMappingURL=sidebarProvider.d.ts.map