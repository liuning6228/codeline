"use strict";
/**
 * 工具进度服务
 * 桥接StreamingToolExecutor进度事件和WebView UI
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolProgressService = void 0;
exports.createToolProgressService = createToolProgressService;
/**
 * 工具进度服务
 */
class ToolProgressService {
    static instance;
    executors = new Map();
    webviewPanel = null;
    isInitialized = false;
    constructor() { }
    /**
     * 获取单例实例
     */
    static getInstance() {
        if (!ToolProgressService.instance) {
            ToolProgressService.instance = new ToolProgressService();
        }
        return ToolProgressService.instance;
    }
    /**
     * 初始化服务
     */
    initialize() {
        if (this.isInitialized) {
            return;
        }
        console.log('ToolProgressService: 初始化工具进度服务');
        this.isInitialized = true;
    }
    /**
     * 注册执行器以监听进度事件
     */
    registerExecutor(executorId, executor) {
        if (this.executors.has(executorId)) {
            console.warn(`ToolProgressService: 执行器 ${executorId} 已注册`);
            return;
        }
        this.executors.set(executorId, executor);
        // 监听执行器事件
        executor.on('execution:start', (executionInfo) => {
            this.handleExecutionStart(executorId, executionInfo);
        });
        executor.on('execution:progress', (executionId, progress) => {
            this.handleExecutionProgress(executorId, executionId, progress);
        });
        executor.on('execution:complete', (executionResult) => {
            this.handleExecutionComplete(executorId, executionResult);
        });
        executor.on('execution:error', (executionId, error) => {
            this.handleExecutionError(executorId, executionId, error);
        });
        console.log(`ToolProgressService: 注册执行器 ${executorId}`);
    }
    /**
     * 注销执行器
     */
    unregisterExecutor(executorId) {
        this.executors.delete(executorId);
        console.log(`ToolProgressService: 注销执行器 ${executorId}`);
    }
    /**
     * 设置WebView面板（用于发送消息）
     */
    setWebviewPanel(panel) {
        this.webviewPanel = panel;
        console.log('ToolProgressService: WebView面板已设置');
    }
    /**
     * 清除WebView面板
     */
    clearWebviewPanel() {
        this.webviewPanel = null;
        console.log('ToolProgressService: WebView面板已清除');
    }
    /**
     * 发送进度消息到WebView
     */
    sendProgressMessage(message) {
        if (!this.webviewPanel) {
            console.warn('ToolProgressService: 没有可用的WebView面板，无法发送消息');
            return;
        }
        try {
            // 发送消息，command 字段设置为消息类型，以便 EnhancedChatView 正确路由
            this.webviewPanel.webview.postMessage({
                command: message.type, // 使用消息类型作为命令
                ...message
            });
            console.log(`ToolProgressService: 发送进度消息 ${message.type} 执行ID ${message.executionId}`);
        }
        catch (error) {
            console.error('ToolProgressService: 发送消息失败:', error);
        }
    }
    /**
     * 处理执行开始事件
     */
    handleExecutionStart(executorId, executionInfo) {
        const message = {
            type: 'tool_execution_start',
            executionId: executionInfo.executionId,
            toolId: executionInfo.toolId,
            toolName: this.getToolName(executionInfo.toolId),
            progress: 0.1,
            message: `开始执行 ${this.getToolName(executionInfo.toolId)}`,
            timestamp: new Date(),
            data: executionInfo.metadata
        };
        this.sendProgressMessage(message);
    }
    /**
     * 处理执行进度事件
     */
    handleExecutionProgress(executorId, executionId, progress) {
        const message = {
            type: 'tool_execution_progress',
            executionId,
            toolId: this.getToolIdFromExecution(executorId, executionId),
            progress: progress.progress,
            message: progress.message,
            timestamp: new Date(),
            data: progress
        };
        this.sendProgressMessage(message);
    }
    /**
     * 处理执行完成事件
     */
    handleExecutionComplete(executorId, executionResult) {
        const duration = executionResult.endTime && executionResult.startTime
            ? executionResult.endTime.getTime() - executionResult.startTime.getTime()
            : 0;
        const message = {
            type: 'tool_execution_complete',
            executionId: executionResult.executionId,
            toolId: executionResult.toolId,
            toolName: this.getToolName(executionResult.toolId),
            progress: 1.0,
            message: `执行完成 (${duration}ms)`,
            timestamp: new Date(),
            duration,
            result: executionResult,
            data: executionResult
        };
        this.sendProgressMessage(message);
    }
    /**
     * 处理执行错误事件
     */
    handleExecutionError(executorId, executionId, error) {
        const message = {
            type: 'tool_execution_error',
            executionId,
            toolId: this.getToolIdFromExecution(executorId, executionId),
            progress: 1.0,
            message: `执行失败: ${error.message}`,
            timestamp: new Date(),
            error: error.message,
            data: { error }
        };
        this.sendProgressMessage(message);
    }
    /**
     * 从执行器中获取工具ID
     */
    getToolIdFromExecution(executorId, executionId) {
        const executor = this.executors.get(executorId);
        if (!executor) {
            return 'unknown';
        }
        // 简化实现：尝试从执行信息中获取
        // 在实际实现中，需要访问执行器的内部状态
        return 'unknown';
    }
    /**
     * 获取工具显示名称
     */
    getToolName(toolId) {
        const toolNames = {
            'bash': 'Bash 命令执行',
            'enhanced-bash': '增强Bash命令',
            'file': '文件操作',
            'git': 'Git 操作',
            'search': '代码搜索',
            'edit': '代码编辑'
        };
        return toolNames[toolId] || toolId;
    }
    /**
     * 获取所有注册的执行器
     */
    getRegisteredExecutors() {
        return Array.from(this.executors.keys());
    }
    /**
     * 清理服务
     */
    dispose() {
        this.executors.clear();
        this.webviewPanel = null;
        this.isInitialized = false;
        console.log('ToolProgressService: 服务已清理');
    }
}
exports.ToolProgressService = ToolProgressService;
/**
 * 创建工具进度服务实例
 */
function createToolProgressService() {
    return ToolProgressService.getInstance();
}
//# sourceMappingURL=ToolProgressService.js.map