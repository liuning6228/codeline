/**
 * 流式工具执行器
 * 集成 Claude-Code 的流式执行架构
 */
import { BaseTool, ExtendedToolContext, ExtendedToolProgress, ToolExecutionInfo, ToolExecutionState } from '../tool/BaseTool';
import { ToolResult } from '../../tools/ToolInterface';
/**
 * 执行器配置
 */
export interface ExecutorConfig {
    /** 最大并发执行数 */
    maxConcurrent: number;
    /** 默认超时时间（毫秒） */
    defaultTimeout: number;
    /** 是否启用缓存 */
    enableCache: boolean;
    /** 缓存最大大小 */
    cacheMaxSize: number;
    /** 是否启用重试 */
    enableRetry: boolean;
    /** 最大重试次数 */
    maxRetries: number;
    /** 重试延迟（毫秒） */
    retryDelay: number;
    /** 是否启用沙箱 */
    enableSandbox: boolean;
    /** 沙箱超时时间（毫秒） */
    sandboxTimeout: number;
}
/**
 * 执行请求
 */
export interface ExecutionRequest<Input = any> {
    /** 工具实例 */
    tool: BaseTool<Input, any>;
    /** 工具参数 */
    params: Input;
    /** 执行上下文 */
    context: ExtendedToolContext;
    /** 执行选项 */
    options?: ExecutionOptions;
}
/**
 * 执行选项
 */
export interface ExecutionOptions {
    /** 执行ID */
    executionId?: string;
    /** 超时时间（毫秒） */
    timeout?: number;
    /** 是否启用进度回调 */
    enableProgress?: boolean;
    /** 是否启用流式输出 */
    enableStreaming?: boolean;
    /** 是否启用缓存 */
    enableCache?: boolean;
    /** 是否启用重试 */
    enableRetry?: boolean;
    /** 是否启用沙箱 */
    enableSandbox?: boolean;
    /** 优先级 */
    priority?: number;
    /** 标签 */
    tags?: string[];
}
/**
 * 执行结果
 */
export interface ExecutionResult<Output = any> extends ToolResult<Output> {
    /** 执行ID */
    executionId: string;
    /** 工具ID */
    toolId: string;
    /** 执行状态 */
    state: ToolExecutionState;
    /** 开始时间 */
    startTime: Date;
    /** 结束时间 */
    endTime: Date;
    /** 进度历史 */
    progressHistory: ExtendedToolProgress[];
    /** 缓存命中 */
    cacheHit?: boolean;
    /** 重试次数 */
    retryCount?: number;
}
/**
 * 执行器事件
 */
export interface ExecutorEvents {
    'execution:start': (info: ToolExecutionInfo) => void;
    'execution:progress': (executionId: string, progress: ExtendedToolProgress) => void;
    'execution:complete': (result: ExecutionResult) => void;
    'execution:error': (executionId: string, error: Error) => void;
    'execution:cancelled': (executionId: string) => void;
    'execution:timeout': (executionId: string) => void;
}
/**
 * 流式工具执行器
 */
export declare class StreamingToolExecutor {
    private config;
    private executions;
    private executionQueue;
    private activeExecutions;
    private eventListeners;
    private cache;
    private isRunning;
    /**
     * 构造函数
     */
    constructor(config?: Partial<ExecutorConfig>);
    /**
     * 执行工具
     */
    execute<Input, Output>(request: ExecutionRequest<Input>, options?: ExecutionOptions): Promise<ExecutionResult<Output>>;
    /**
     * 开始执行
     */
    private startExecution;
    /**
     * 取消执行
     */
    cancel(executionId: string): Promise<boolean>;
    /**
     * 获取执行信息
     */
    getExecutionInfo(executionId: string): ToolExecutionInfo | undefined;
    /**
     * 获取所有执行信息
     */
    getAllExecutions(): ToolExecutionInfo[];
    /**
     * 获取活跃执行数量
     */
    getActiveExecutionCount(): number;
    /**
     * 获取队列长度
     */
    getQueueLength(): number;
    /**
     * 清理旧的执行记录
     */
    cleanupOldExecutions(maxAgeHours?: number): number;
    /**
     * 清理缓存
     */
    cleanupCache(maxAgeHours?: number): number;
    /**
     * 停止执行器
     */
    stop(): Promise<void>;
    /**
     * 添加事件监听器
     */
    on<K extends keyof ExecutorEvents>(event: K, listener: ExecutorEvents[K]): void;
    /**
     * 移除事件监听器
     */
    off<K extends keyof ExecutorEvents>(event: K, listener: ExecutorEvents[K]): void;
    /**
     * 触发事件
     */
    private emit;
    /**
     * 处理队列中的下一个请求
     */
    private processNextInQueue;
    /**
     * 从缓存获取结果
     */
    private getFromCache;
    /**
     * 添加到缓存
     */
    private addToCache;
    /**
     * 生成缓存键
     */
    private generateCacheKey;
    /**
     * 生成执行ID
     */
    private generateExecutionId;
    /**
     * 延迟函数
     */
    private delay;
}
/**
 * 执行器管理器
 */
export declare class ExecutorManager {
    private executors;
    private defaultExecutor;
    constructor(defaultConfig?: Partial<ExecutorConfig>);
    /**
     * 获取执行器
     */
    getExecutor(name?: string): StreamingToolExecutor;
    /**
     * 创建执行器
     */
    createExecutor(name: string, config?: Partial<ExecutorConfig>): StreamingToolExecutor;
    /**
     * 移除执行器
     */
    removeExecutor(name: string): boolean;
    /**
     * 获取所有执行器
     */
    getAllExecutors(): Map<string, StreamingToolExecutor>;
    /**
     * 停止所有执行器
     */
    stopAll(): Promise<void>;
    /**
     * 清理所有执行器
     */
    cleanupAll(maxAgeHours?: number): {
        executions: number;
        cache: number;
    };
}
/**
 * 工具执行器工厂
 */
export declare class ToolExecutorFactory {
    private static instance;
    private executors;
    private constructor();
    /**
     * 获取单例实例
     */
    static getInstance(): ToolExecutorFactory;
    /**
     * 获取或创建执行器
     */
    getOrCreateExecutor(name: string, config?: Partial<ExecutorConfig>): StreamingToolExecutor;
    /**
     * 获取默认执行器
     */
    getDefaultExecutor(): StreamingToolExecutor;
    /**
     * 获取所有执行器
     */
    getAllExecutors(): Map<string, StreamingToolExecutor>;
    /**
     * 清理所有执行器
     */
    cleanupAll(): Promise<void>;
    /**
     * 停止所有执行器
     */
    stopAll(): Promise<void>;
}
//# sourceMappingURL=StreamingToolExecutor.d.ts.map