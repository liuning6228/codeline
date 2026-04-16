/**
 * 工具进度服务
 * 桥接StreamingToolExecutor进度事件和WebView UI
 */
import * as vscode from 'vscode';
import { StreamingToolExecutor } from '../core/executor/StreamingToolExecutor';
/**
 * 工具进度消息
 */
export interface ToolProgressMessage {
    /** 消息类型 */
    type: 'tool_execution_start' | 'tool_execution_progress' | 'tool_execution_complete' | 'tool_execution_error';
    /** 执行ID */
    executionId: string;
    /** 工具ID */
    toolId: string;
    /** 工具名称 */
    toolName?: string;
    /** 进度 (0-1) */
    progress?: number;
    /** 进度消息 */
    message?: string;
    /** 数据 */
    data?: any;
    /** 时间戳 */
    timestamp: Date;
    /** 持续时间（毫秒） */
    duration?: number;
    /** 结果 */
    result?: any;
    /** 错误 */
    error?: string;
}
/**
 * 工具进度服务
 */
export declare class ToolProgressService {
    private static instance;
    private executors;
    private webviewPanel;
    private isInitialized;
    private constructor();
    /**
     * 获取单例实例
     */
    static getInstance(): ToolProgressService;
    /**
     * 初始化服务
     */
    initialize(): void;
    /**
     * 注册执行器以监听进度事件
     */
    registerExecutor(executorId: string, executor: StreamingToolExecutor): void;
    /**
     * 注销执行器
     */
    unregisterExecutor(executorId: string): void;
    /**
     * 设置WebView面板（用于发送消息）
     */
    setWebviewPanel(panel: vscode.WebviewPanel): void;
    /**
     * 清除WebView面板
     */
    clearWebviewPanel(): void;
    /**
     * 发送进度消息到WebView
     */
    sendProgressMessage(message: ToolProgressMessage): void;
    /**
     * 处理执行开始事件
     */
    private handleExecutionStart;
    /**
     * 处理执行进度事件
     */
    private handleExecutionProgress;
    /**
     * 处理执行完成事件
     */
    private handleExecutionComplete;
    /**
     * 处理执行错误事件
     */
    private handleExecutionError;
    /**
     * 从执行器中获取工具ID
     */
    private getToolIdFromExecution;
    /**
     * 获取工具显示名称
     */
    private getToolName;
    /**
     * 获取所有注册的执行器
     */
    getRegisteredExecutors(): string[];
    /**
     * 清理服务
     */
    dispose(): void;
}
/**
 * 创建工具进度服务实例
 */
export declare function createToolProgressService(): ToolProgressService;
//# sourceMappingURL=ToolProgressService.d.ts.map