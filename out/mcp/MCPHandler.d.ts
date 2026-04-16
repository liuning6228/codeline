/**
 * MCP处理器
 * 处理来自webview的MCP请求，与EnhancedTaskEngine集成
 * 支持生产级错误处理、配置管理和监控
 */
import * as vscode from 'vscode';
/**
 * MCP处理器配置
 */
export interface MCPHandlerConfig {
    /** 是否启用MCP工具 */
    enableMCPTools?: boolean;
    /** 是否启用工具系统 */
    enableToolSystem?: boolean;
    /** 是否启用详细日志 */
    verboseLogging?: boolean;
    /** 自动加载配置路径 */
    autoLoadConfigPath?: string;
    /** 默认超时时间（毫秒） */
    defaultTimeout?: number;
    /** 最大重试次数 */
    maxRetries?: number;
    /** 是否启用监控 */
    enableMonitoring?: boolean;
    /** 监控采样率（0-1） */
    monitoringSampleRate?: number;
}
/**
 * MCP监控指标
 */
export interface MCPMetrics {
    /** 初始化时间 */
    initializationTime: number;
    /** 处理的请求总数 */
    totalRequests: number;
    /** 成功的请求数 */
    successfulRequests: number;
    /** 失败的请求数 */
    failedRequests: number;
    /** 平均响应时间（毫秒） */
    averageResponseTime: number;
    /** 注册的MCP工具数 */
    registeredTools: number;
    /** 最后一次错误时间 */
    lastErrorTime?: number;
    /** 最后一次错误消息 */
    lastErrorMessage?: string;
}
/**
 * MCP消息类型
 */
export interface MCPMessage {
    type: string;
    data: Record<string, any>;
    messageId?: string;
    timestamp?: number;
}
/**
 * MCP响应类型
 */
export interface MCPResponse {
    success: boolean;
    data?: any;
    error?: string;
    messageId?: string;
    timestamp?: number;
    duration?: number;
    metrics?: {
        toolExecutionTime?: number;
        validationTime?: number;
        permissionCheckTime?: number;
    };
}
/**
 * MCP处理器类
 * 生产级MCP集成，支持配置管理、错误处理、监控和恢复
 */
export declare class MCPHandler {
    private context;
    private taskEngine;
    private mcpManager;
    private isInitialized;
    private config;
    private metrics;
    private outputChannel;
    private configWatcher;
    /** 请求跟踪 */
    private requestHistory;
    /** 活动工具执行 */
    private activeExecutions;
    /** 统计信息 */
    private statistics;
    constructor(context: vscode.ExtensionContext, config?: Partial<MCPHandlerConfig>);
    /**
     * 初始化MCP处理器
     * @param workspaceRoot 工作区根目录
     * @param overrideConfig 可选覆盖配置
     */
    initialize(workspaceRoot: string, overrideConfig?: Partial<MCPHandlerConfig>): Promise<boolean>;
    /**
     * 处理MCP消息
     */
    handleMessage(message: MCPMessage): Promise<MCPResponse>;
    /**
     * 验证MCP消息格式
     */
    private validateMCPMessage;
    /**
     * 处理初始化请求
     */
    private handleInitialize;
    /**
     * 处理添加服务器请求
     */
    private handleAddServer;
    /**
     * 处理移除服务器请求
     */
    private handleRemoveServer;
    /**
     * 处理连接服务器请求
     */
    private handleConnectServer;
    /**
     * 处理断开服务器连接请求
     */
    private handleDisconnectServer;
    /**
     * 处理切换工具状态请求
     */
    private handleToggleTool;
    /**
     * 处理执行工具请求
     */
    private handleExecuteTool;
    /**
     * 处理刷新请求
     */
    private handleRefresh;
    /**
     * 处理获取工具请求
     */
    private handleGetTools;
    /**
     * 处理获取服务器请求
     */
    private handleGetServers;
    /**
     * 模拟服务器工具（用于测试）
     */
    private simulateServerTools;
    /**
     * 注册MCP工具到EnhancedToolRegistry
     * 使用项目现有的MCP组件：MCPToolWrapper和EnhancedToolRegistryMCPExtension
     */
    private registerMCPTools;
    /**
     * 处理健康检查请求
     */
    private handleHealthCheck;
    /**
     * 处理获取指标请求
     */
    private handleGetMetrics;
    /**
     * 处理获取统计信息请求
     */
    private handleGetStatistics;
    /**
     * 处理配置操作请求
     */
    private handleConfigOperation;
    /**
     * 设置配置监听器
     */
    private setupConfigWatcher;
    /**
     * 重新加载配置
     */
    private reloadConfig;
    /**
     * 检查文件是否存在
     */
    private fileExists;
    /**
     * 获取监控指标
     */
    getMetrics(): MCPMetrics;
    /**
     * 获取统计信息
     */
    getStatistics(): {
        successRate: string;
        averageExecutionTime: number;
        totalToolExecutions: number;
        successfulToolExecutions: number;
        failedToolExecutions: number;
        totalDuration: number;
    };
    /**
     * 获取活动执行状态
     */
    getActiveExecutions(): Array<{
        executionId: string;
        toolId: string;
        elapsedTime: number;
        params: any;
    }>;
    /**
     * 更新请求跟踪
     */
    private trackRequest;
    /**
     * 开始工具执行跟踪
     */
    private startToolExecution;
    /**
     * 结束工具执行跟踪
     */
    private endToolExecution;
    /**
     * 生成健康报告
     */
    getHealthReport(): {
        status: 'healthy' | 'degraded' | 'unhealthy';
        checks: Array<{
            name: string;
            status: 'pass' | 'fail' | 'warning';
            details: string;
        }>;
        recommendations: string[];
        timestamp: number;
    };
    /**
     * 获取处理器状态
     */
    getStatus(): {
        isInitialized: boolean;
        toolSystemReady: boolean;
    };
    /**
     * 清理资源
     */
    dispose(): Promise<void>;
}
//# sourceMappingURL=MCPHandler.d.ts.map