/**
 * 核心类型定义
 * 集成 Claude-Code、Cline 和 CodeLine 的类型系统
 */
import * as vscode from 'vscode';
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
    CODE = "code",
    GIT = "git",
    SEARCH = "search",
    WEB = "web",
    OTHER = "other"
}
/**
 * 工具能力
 */
export declare enum ToolCapability {
    READ = "read",
    WRITE = "write",
    EXECUTE = "execute",
    NETWORK = "network",
    FILESYSTEM = "filesystem",
    PROCESS = "process",
    UI = "ui",
    AI = "ai",
    DATABASE = "database",
    CACHE = "cache"
}
/**
 * 工具参数模式
 */
export interface ToolParameterSchema {
    [key: string]: {
        type: string;
        description: string;
        required?: boolean;
        default?: any;
        validation?: (value: any) => boolean;
        enum?: any[];
        pattern?: string;
        minimum?: number;
        maximum?: number;
        minLength?: number;
        maxLength?: number;
    };
}
/**
 * 工具执行上下文
 */
export interface ToolContext {
    extensionContext: vscode.ExtensionContext;
    workspaceRoot: string;
    cwd: string;
    outputChannel: vscode.OutputChannel;
    options?: ToolOptions;
    userId?: string;
    sessionId: string;
    sharedResources?: Record<string, any>;
}
/**
 * 工具选项
 */
export interface ToolOptions {
    autoExecute?: boolean;
    requireApproval?: boolean;
    timeout?: number;
    validateParams?: boolean;
    retry?: {
        maxRetries: number;
        retryDelay: number;
    };
}
/**
 * 参数验证结果
 */
export interface ValidationResult {
    valid: boolean;
    error?: string;
    sanitizedParams?: Record<string, any>;
}
/**
 * 权限检查结果
 */
export interface PermissionResult {
    allowed: boolean;
    reason?: string;
    requiresUserConfirmation?: boolean;
    confirmationPrompt?: string;
}
/**
 * 工具进度
 */
export interface ToolProgress {
    type: string;
    progress: number;
    message?: string;
    data?: Record<string, any>;
}
/**
 * 工具结果
 */
export interface ToolResult<T = any> {
    success: boolean;
    output?: T;
    error?: string;
    toolId: string;
    duration: number;
    timestamp: Date;
    metadata?: Record<string, any>;
}
/**
 * 执行器配置
 */
export interface ExecutorConfig {
    maxConcurrent: number;
    defaultTimeout: number;
    enableCache: boolean;
    cacheMaxSize: number;
    enableRetry: boolean;
    maxRetries: number;
    retryDelay: number;
    enableSandbox: boolean;
    sandboxTimeout: number;
}
/**
 * 执行选项
 */
export interface ExecutionOptions {
    executionId?: string;
    timeout?: number;
    enableProgress?: boolean;
    enableStreaming?: boolean;
    enableCache?: boolean;
    enableRetry?: boolean;
    enableSandbox?: boolean;
    priority?: number;
    tags?: string[];
}
/**
 * 执行结果
 */
export interface ExecutionResult<Output = any> extends ToolResult<Output> {
    executionId: string;
    toolId: string;
    state: ToolExecutionState;
    startTime: Date;
    endTime: Date;
    progressHistory: ToolProgress[];
    cacheHit?: boolean;
    retryCount?: number;
}
/**
 * 权限模式
 */
export type PermissionMode = 'auto' | 'always' | 'ask' | 'deny' | 'sandbox';
/**
 * 权限规则
 */
export interface PermissionRule {
    id: string;
    name: string;
    description: string;
    pattern: string | RegExp;
    action: 'allow' | 'deny' | 'ask';
    priority: number;
    conditions?: PermissionCondition[];
    metadata?: Record<string, any>;
}
/**
 * 权限条件
 */
export interface PermissionCondition {
    type: 'user' | 'time' | 'resource' | 'context';
    field: string;
    operator: 'equals' | 'contains' | 'matches' | 'in' | 'gt' | 'lt';
    value: any;
}
/**
 * 权限决策
 */
export interface PermissionDecision {
    allowed: boolean;
    ruleId?: string;
    reason?: string;
    requiresConfirmation?: boolean;
    confirmationPrompt?: string;
    mode?: PermissionMode;
}
/**
 * 终端命令
 */
export interface TerminalCommand {
    command: string;
    args?: string[];
    cwd?: string;
    env?: Record<string, string>;
    timeout?: number;
    shell?: string;
}
/**
 * 命令执行结果
 */
export interface CommandResult {
    exitCode: number;
    stdout: string;
    stderr: string;
    duration: number;
    timedOut: boolean;
}
/**
 * 流式命令输出
 */
export interface CommandStreamOutput {
    type: 'stdout' | 'stderr' | 'exit';
    data: string | number;
    timestamp: Date;
}
/**
 * 文件操作
 */
export interface FileOperation {
    type: 'create' | 'read' | 'update' | 'delete' | 'move' | 'copy';
    path: string;
    content?: string;
    targetPath?: string;
    encoding?: string;
}
/**
 * 文件差异
 */
export interface FileDiff {
    path: string;
    originalContent?: string;
    newContent: string;
    changes: DiffChange[];
}
/**
 * 差异变更
 */
export interface DiffChange {
    type: 'add' | 'remove' | 'modify';
    line: number;
    content: string;
    originalLine?: number;
}
/**
 * AI 模型配置
 */
export interface AIModelConfig {
    provider: string;
    model: string;
    apiKey?: string;
    baseUrl?: string;
    temperature?: number;
    maxTokens?: number;
    timeout?: number;
}
/**
 * AI 请求
 */
export interface AIRequest {
    prompt: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
    context?: any;
}
/**
 * AI 响应
 */
export interface AIResponse {
    content: string;
    model: string;
    tokens: {
        prompt: number;
        completion: number;
        total: number;
    };
    finishReason?: string;
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
    executionId: string;
    toolId: string;
    state: ToolExecutionState;
    startTime: Date;
    endTime?: Date;
    progress?: ToolProgress;
    result?: ToolResult;
    error?: Error;
    metadata?: Record<string, any>;
}
/**
 * 应用程序状态
 */
export interface AppState {
    tools: {
        [toolId: string]: {
            enabled: boolean;
            executions: ToolExecutionInfo[];
            stats: ToolStats;
        };
    };
    executions: ToolExecutionInfo[];
    settings: AppSettings;
    user: UserInfo;
}
/**
 * 工具统计
 */
export interface ToolStats {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageDuration: number;
    lastExecution?: Date;
}
/**
 * 应用程序设置
 */
export interface AppSettings {
    defaultModel: string;
    enableAutoApproval: boolean;
    enableSandbox: boolean;
    maxConcurrentExecutions: number;
    defaultTimeout: number;
    enableTelemetry: boolean;
    theme: string;
}
/**
 * 用户信息
 */
export interface UserInfo {
    id: string;
    name?: string;
    email?: string;
    preferences: UserPreferences;
    permissions: UserPermissions;
}
/**
 * 用户偏好
 */
export interface UserPreferences {
    language: string;
    theme: string;
    autoSave: boolean;
    notifications: boolean;
    keyboardShortcuts: Record<string, string>;
}
/**
 * 用户权限
 */
export interface UserPermissions {
    canExecuteTools: boolean;
    canModifyFiles: boolean;
    canExecuteCommands: boolean;
    canAccessNetwork: boolean;
    canUseAI: boolean;
    canManageSettings: boolean;
}
/**
 * 应用程序事件
 */
export declare enum AppEvent {
    TOOL_EXECUTION_START = "tool:execution:start",
    TOOL_EXECUTION_PROGRESS = "tool:execution:progress",
    TOOL_EXECUTION_COMPLETE = "tool:execution:complete",
    TOOL_EXECUTION_ERROR = "tool:execution:error",
    TOOL_EXECUTION_CANCELLED = "tool:execution:cancelled",
    FILE_CHANGED = "file:changed",
    SETTINGS_CHANGED = "settings:changed",
    USER_LOGGED_IN = "user:logged:in",
    USER_LOGGED_OUT = "user:logged:out"
}
/**
 * 事件数据
 */
export interface EventData {
    type: AppEvent;
    timestamp: Date;
    data: any;
    source: string;
    metadata?: Record<string, any>;
}
/**
 * 应用程序配置
 */
export interface AppConfig {
    version: string;
    name: string;
    description: string;
    author: string;
    license: string;
    repository: string;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    scripts: Record<string, string>;
}
/**
 * 扩展配置
 */
export interface ExtensionConfig {
    id: string;
    name: string;
    publisher: string;
    version: string;
    engines: {
        vscode: string;
    };
    activationEvents: string[];
    contributes: any;
    main: string;
}
/**
 * 工具定义
 */
export interface ToolDefinition<Input = any, Output = any> {
    id: string;
    name: string;
    description: string;
    version: string;
    author?: string;
    capabilities: string[];
    parameterSchema?: ToolParameterSchema;
    isEnabled?(context: ToolContext): boolean;
    isConcurrencySafe?(context: ToolContext): boolean;
    isReadOnly?(context: ToolContext): boolean;
    isDestructive?(context: ToolContext): boolean;
    checkPermissions?(params: Input, context: ToolContext): Promise<PermissionResult>;
    validateParameters?(params: Input, context: ToolContext): Promise<ValidationResult>;
    execute(params: Input, context: ToolContext, onProgress?: (progress: ToolProgress) => void): Promise<ToolResult<Output>>;
    cancel?(executionId: string): Promise<boolean>;
    getDisplayName?(params?: Input): string;
    getActivityDescription(params: Input): string;
}
//# sourceMappingURL=index.d.ts.map