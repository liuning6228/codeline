/**
 * 统一工具接口
 * 基于Claude Code CP-20260402-003模式，适配CodeLine架构
 */
import * as vscode from 'vscode';
/**
 * 工具执行上下文
 * 提供工具执行所需的环境信息和资源
 */
export interface ToolContext {
    /** VS Code扩展上下文 */
    extensionContext: vscode.ExtensionContext;
    /** 工作区根路径 */
    workspaceRoot: string;
    /** 当前目录 */
    cwd: string;
    /** 输出通道 */
    outputChannel: vscode.OutputChannel;
    /** 工具执行选项 */
    options?: ToolOptions;
    /** 用户信息 */
    userId?: string;
    /** 会话ID */
    sessionId: string;
    /** 共享资源 */
    sharedResources?: Record<string, any>;
}
/**
 * 工具选项
 */
export interface ToolOptions {
    /** 是否自动执行 */
    autoExecute?: boolean;
    /** 是否需要批准 */
    requireApproval?: boolean;
    /** 超时时间（毫秒） */
    timeout?: number;
    /** 是否验证参数 */
    validateParams?: boolean;
    /** 重试选项 */
    retry?: {
        maxRetries: number;
        retryDelay: number;
    };
}
/**
 * 工具参数验证结果
 */
export interface ValidationResult {
    /** 是否有效 */
    valid: boolean;
    /** 错误信息 */
    error?: string;
    /** 修复后的参数 */
    sanitizedParams?: Record<string, any>;
}
/**
 * 工具权限检查结果
 */
export interface PermissionResult {
    /** 是否允许 */
    allowed: boolean;
    /** 原因 */
    reason?: string;
    /** 需要用户确认 */
    requiresUserConfirmation?: boolean;
    /** 确认提示信息 */
    confirmationPrompt?: string;
}
/**
 * 工具执行进度
 */
export interface ToolProgress {
    /** 进度类型 */
    type: string;
    /** 当前进度值 (0-1) */
    progress: number;
    /** 状态消息 */
    message?: string;
    /** 附加数据 */
    data?: Record<string, any>;
}
/**
 * 工具执行结果
 */
export interface ToolResult<T = any> {
    /** 是否成功 */
    success: boolean;
    /** 输出数据 */
    output?: T;
    /** 错误信息 */
    error?: string;
    /** 工具ID */
    toolId: string;
    /** 执行耗时（毫秒） */
    duration: number;
    /** 时间戳 */
    timestamp: Date;
    /** 元数据 */
    metadata?: Record<string, any>;
}
/**
 * 统一工具接口
 * 所有工具（文件操作、终端、浏览器、MCP等）都必须实现此接口
 */
export interface Tool<Input = Record<string, any>, Output = any> {
    /** 工具唯一标识符 */
    readonly id: string;
    /** 工具名称 */
    readonly name: string;
    /** 工具描述 */
    readonly description: string;
    /** 工具版本 */
    readonly version: string;
    /** 作者信息 */
    readonly author?: string;
    /** 工具能力标签 */
    readonly capabilities: string[];
    /** 工具参数模式 */
    readonly parameterSchema?: Record<string, {
        type: string;
        description: string;
        required?: boolean;
        default?: any;
        validation?: (value: any) => boolean;
    }>;
    /** 是否启用 */
    isEnabled(context: ToolContext): boolean;
    /** 是否支持并发执行 */
    isConcurrencySafe?(context: ToolContext): boolean;
    /** 是否是只读操作 */
    isReadOnly?(context: ToolContext): boolean;
    /** 是否是破坏性操作（删除、修改关键文件等） */
    isDestructive?(context: ToolContext): boolean;
    /** 权限检查 */
    checkPermissions(params: Input, context: ToolContext): Promise<PermissionResult>;
    /** 参数验证 */
    validateParameters(params: Input, context: ToolContext): Promise<ValidationResult>;
    /** 工具执行方法 */
    execute(params: Input, context: ToolContext, onProgress?: (progress: ToolProgress) => void): Promise<ToolResult<Output>>;
    /** 工具取消方法（如果支持取消） */
    cancel?(executionId: string): Promise<boolean>;
    /** 获取工具UI显示名称 */
    getDisplayName?(params?: Input): string;
    /** 获取工具活动描述 */
    getActivityDescription(params: Input): string;
}
/**
 * 工具定义（用于工具注册的简化版本）
 */
export interface ToolDefinition<Input = Record<string, any>, Output = any> {
    /** 工具ID */
    id: string;
    /** 工具名称 */
    name: string;
    /** 工具描述 */
    description: string;
    /** 工具版本 */
    version: string;
    /** 作者信息 */
    author?: string;
    /** 能力标签 */
    capabilities: string[];
    /** 参数模式 */
    parameterSchema?: Tool['parameterSchema'];
    /** 是否启用（默认true） */
    isEnabled?(context: ToolContext): boolean;
    /** 是否支持并发执行（默认false） */
    isConcurrencySafe?(context: ToolContext): boolean;
    /** 是否只读（默认false） */
    isReadOnly?(context: ToolContext): boolean;
    /** 是否破坏性（默认false） */
    isDestructive?(context: ToolContext): boolean;
    /** 权限检查（默认允许） */
    checkPermissions?(params: Input, context: ToolContext): Promise<PermissionResult>;
    /** 参数验证（默认通过） */
    validateParameters?(params: Input, context: ToolContext): Promise<ValidationResult>;
    /** 工具执行 */
    execute(params: Input, context: ToolContext, onProgress?: (progress: ToolProgress) => void): Promise<ToolResult<Output>>;
    /** 工具取消 */
    cancel?(executionId: string): Promise<boolean>;
    /** UI显示名称 */
    getDisplayName?(params?: Input): string;
    /** 活动描述 */
    getActivityDescription(params: Input): string;
}
/**
 * 工具类别
 */
export declare enum ToolCategory {
    FILE = "file",
    TERMINAL = "terminal",
    BROWSER = "browser",
    MCP = "mcp",
    UTILITY = "utility",
    AI = "ai",
    DEVELOPMENT = "development",
    OTHER = "other"
}
//# sourceMappingURL=ToolInterface.d.ts.map