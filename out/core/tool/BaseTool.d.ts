/**
 * 工具抽象基类
 * 集成 Claude-Code 和 Cline 的最佳实践
 */
import { Tool, ToolContext, ToolProgress, ToolResult, ValidationResult, PermissionResult } from '../../tools/ToolInterface';
import { ToolCategory } from './Tool';
/**
 * 权限管理器接口（避免循环依赖）
 */
export interface PermissionManagerInterface {
    checkPermission(request: {
        toolId: string;
        toolCategory: any;
        input: any;
        context: ExtendedToolContext;
        workspaceRoot?: string;
        userId?: string;
    }): Promise<PermissionResult>;
}
/**
 * 工具执行上下文扩展
 */
export interface ExtendedToolContext extends ToolContext {
    /** 工具使用上下文 */
    toolUseContext?: ToolUseContext;
    /** 权限模式 */
    permissionMode?: PermissionMode;
    /** 权限管理器 */
    permissionManager?: PermissionManagerInterface;
    /** 工作目录扩展 */
    additionalWorkingDirectory?: AdditionalWorkingDirectory;
    /** 文件状态缓存 */
    fileStateCache?: FileStateCache;
    /** 通知管理器 */
    notifications?: NotificationManager;
}
/**
 * 工具使用上下文（来自 Claude-Code）
 */
export interface ToolUseContext {
    /** 工具使用ID */
    toolUseId: string;
    /** 请求ID */
    requestId: string;
    /** 会话ID */
    sessionId: string;
    /** 用户ID */
    userId: string;
    /** 工具调用链ID */
    chainId?: string;
    /** 工具调用深度 */
    depth?: number;
    /** 父工具使用ID */
    parentToolUseId?: string;
}
/**
 * 权限模式（来自 Claude-Code）
 */
export type PermissionMode = 'auto' | 'always' | 'ask' | 'deny' | 'sandbox';
/**
 * 额外工作目录（来自 Claude-Code）
 */
export interface AdditionalWorkingDirectory {
    /** 工作目录路径 */
    path: string;
    /** 是否临时目录 */
    isTemporary?: boolean;
    /** 是否只读 */
    readOnly?: boolean;
}
/**
 * 文件状态缓存接口
 */
export interface FileStateCache {
    getFileState(path: string): Promise<FileState>;
    setFileState(path: string, state: FileState): Promise<void>;
    invalidate(path: string): Promise<void>;
}
/**
 * 文件状态
 */
export interface FileState {
    exists: boolean;
    size?: number;
    modified?: Date;
    contentHash?: string;
}
/**
 * 通知管理器
 */
export interface NotificationManager {
    showInfo(message: string, options?: NotificationOptions): void;
    showWarning(message: string, options?: NotificationOptions): void;
    showError(message: string, options?: NotificationOptions): void;
    showProgress(message: string, progress?: number): ProgressNotification;
}
/**
 * 通知选项
 */
export interface NotificationOptions {
    modal?: boolean;
    detail?: string;
    actions?: string[];
}
/**
 * 进度通知
 */
export interface ProgressNotification {
    update(progress: number, message?: string): void;
    complete(message?: string): void;
    cancel(): void;
}
/**
 * 流式工具结果
 */
export interface StreamingToolResult<T = any> extends ToolResult<T> {
    /** 是否是流式结果 */
    isStreaming: true;
    /** 流式数据生成器 */
    stream: AsyncGenerator<ToolProgress | T>;
    /** 取消函数 */
    cancel: () => Promise<void>;
}
/**
 * 工具进度类型扩展
 */
export interface ExtendedToolProgress extends ToolProgress {
    /** 进度阶段 */
    phase?: string;
    /** 估计剩余时间（毫秒） */
    estimatedRemaining?: number;
    /** 子进度 */
    subProgress?: ToolProgress[];
    /** 是否可取消 */
    cancellable?: boolean;
}
/**
 * 工具执行状态
 */
export declare enum ToolExecutionState {
    PENDING = "pending",
    RUNNING = "running",
    PAUSED = "paused",
    CANCELLED = "cancelled",
    COMPLETED = "completed",
    FAILED = "failed",
    TIMEOUT = "timeout"
}
/**
 * 工具执行信息
 */
export interface ToolExecutionInfo {
    /** 执行ID */
    executionId: string;
    /** 工具ID */
    toolId: string;
    /** 状态 */
    state: ToolExecutionState;
    /** 开始时间 */
    startTime: Date;
    /** 结束时间 */
    endTime?: Date;
    /** 进度 */
    progress?: ExtendedToolProgress;
    /** 结果 */
    result?: ToolResult;
    /** 错误 */
    error?: Error;
    /** 元数据 */
    metadata?: Record<string, any>;
}
/**
 * 抽象工具基类
 * 提供工具实现的通用功能
 */
export declare abstract class BaseTool<Input = Record<string, any>, Output = any> implements Tool<Input, Output> {
    abstract readonly id: string;
    abstract readonly name: string;
    abstract readonly description: string;
    abstract readonly version: string;
    abstract readonly author?: string;
    abstract readonly capabilities: string[];
    parameterSchema?: Record<string, {
        type: string;
        description: string;
        required?: boolean;
        default?: any;
        validation?: (value: any) => boolean;
        enum?: any[];
    }>;
    protected config: ToolConfig;
    private executions;
    private executionCount;
    /**
     * 构造函数
     */
    constructor(config?: Partial<ToolConfig>);
    /**
     * 是否启用
     */
    isEnabled(context: ExtendedToolContext): boolean;
    /**
     * 是否支持并发执行
     */
    isConcurrencySafe(context: ExtendedToolContext): boolean;
    /**
     * 是否是只读操作
     */
    isReadOnly(context: ExtendedToolContext): boolean;
    /**
     * 是否是破坏性操作
     */
    isDestructive(context: ExtendedToolContext): boolean;
    /**
     * 权限检查
     */
    checkPermissions(params: Input, context: ExtendedToolContext): Promise<PermissionResult>;
    /**
     * 获取工具类别（子类可重写）
     */
    protected getToolCategory(): ToolCategory;
    /**
     * 工具特定权限检查（子类可重写）
     */
    protected checkSpecificPermissions(params: Input, context: ExtendedToolContext): Promise<Partial<PermissionResult> | null>;
    /**
     * 获取权限提示信息
     */
    protected getPermissionPrompt(params: Input, context: ExtendedToolContext): string;
    /**
     * 参数验证
     */
    validateParameters(params: Input, context: ExtendedToolContext): Promise<ValidationResult>;
    /**
     * 类型验证
     */
    private validateType;
    /**
     * 工具特定参数验证（子类可重写）
     */
    protected validateSpecificParameters(params: Input, context: ExtendedToolContext): Promise<ValidationResult | null>;
    /**
     * 工具执行方法
     */
    execute(params: Input, context: ExtendedToolContext, onProgress?: (progress: ExtendedToolProgress) => void): Promise<ToolResult<Output>>;
    /**
     * 执行工具（抽象方法，子类必须实现）
     */
    protected abstract executeTool(params: Input, context: ExtendedToolContext, onProgress?: (progress: ExtendedToolProgress) => void): Promise<ToolResult<Output>>;
    /**
     * 请求用户确认
     */
    protected requestUserConfirmation(message: string, context: ExtendedToolContext): Promise<boolean>;
    /**
     * 基本确认对话框
     */
    private requestBasicConfirmation;
    /**
     * 增强确认对话框
     */
    private requestEnhancedConfirmation;
    /**
     * 生成执行ID
     */
    protected generateExecutionId(): string;
    /**
     * 清理旧的执行记录
     */
    private cleanupOldExecutions;
    /**
     * 工具取消方法
     */
    cancel(executionId: string): Promise<boolean>;
    /**
     * 工具特定取消逻辑（子类可重写）
     */
    protected cancelTool(executionId: string): Promise<boolean>;
    /**
     * 获取工具UI显示名称
     */
    getDisplayName(params?: Input): string;
    /**
     * 获取工具活动描述
     */
    getActivityDescription(params: Input): string;
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
}
/**
 * 工具配置
 */
export interface ToolConfig {
    defaultTimeout: number;
    maxRetries: number;
    retryDelay: number;
    requireApproval: boolean;
    autoExecute: boolean;
    validateParams: boolean;
    concurrencySafe: boolean;
    readOnly: boolean;
    destructive: boolean;
}
/**
 * 流式工具基类
 */
export declare abstract class StreamingBaseTool<Input = Record<string, any>, Output = any> extends BaseTool<Input, Output> {
    /**
     * 执行工具（流式版本）
     */
    protected executeTool(params: Input, context: ExtendedToolContext, onProgress?: (progress: ExtendedToolProgress) => void): Promise<ToolResult<Output>>;
    /**
     * 创建数据流（抽象方法）
     */
    protected abstract createStream(params: Input, context: ExtendedToolContext): AsyncGenerator<ExtendedToolProgress | Output>;
    /**
     * 聚合结果（子类可重写）
     */
    protected aggregateResults(results: Output[]): Output;
}
/**
 * 工具工厂接口
 */
export interface ToolFactory {
    createTool(context: ExtendedToolContext): BaseTool;
    getToolType(): string;
    getSupportedCapabilities(): string[];
}
/**
 * 工具注册表项
 */
export interface ToolRegistryEntry {
    factory: ToolFactory;
    priority: number;
    enabled: boolean;
    metadata: Record<string, any>;
}
//# sourceMappingURL=BaseTool.d.ts.map