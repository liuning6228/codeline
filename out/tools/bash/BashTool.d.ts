/**
 * BashTool - 终端命令执行工具
 * 集成 Claude-Code 的 BashTool 核心逻辑，适配 CodeLine 架构
 */
import { BaseTool, ExtendedToolContext, ExtendedToolProgress } from '../../core/tool/BaseTool';
import { ToolResult, ValidationResult, PermissionResult } from '../ToolInterface';
import { ToolCategory } from '../../core/tool/Tool';
export interface BashToolInput {
    command: string;
    timeout?: number;
    description?: string;
    run_in_background?: boolean;
    dangerouslyDisableSandbox?: boolean;
}
export interface BashToolOutput {
    stdout: string;
    stderr: string;
    interrupted: boolean;
    exitCode?: number;
    duration?: number;
}
/**
 * BashTool 类
 * 提供完整的终端命令执行能力，包括流式输出、权限控制和安全验证
 */
export declare class BashTool extends BaseTool<BashToolInput, BashToolOutput> {
    readonly id = "bash";
    readonly name = "Bash";
    readonly description = "Execute shell commands with full terminal capabilities";
    readonly version = "1.0.0";
    readonly author = "CodeLine Team";
    readonly capabilities: string[];
    protected config: {
        defaultTimeout: number;
        maxRetries: number;
        retryDelay: number;
        requireApproval: boolean;
        autoExecute: boolean;
        validateParams: boolean;
        concurrencySafe: boolean;
        readOnly: boolean;
        destructive: boolean;
    };
    parameterSchema: {
        command: {
            type: string;
            description: string;
            required: boolean;
        };
        timeout: {
            type: string;
            description: string;
            required: boolean;
            default: number;
        };
        description: {
            type: string;
            description: string;
            required: boolean;
        };
        run_in_background: {
            type: string;
            description: string;
            required: boolean;
            default: boolean;
        };
        dangerouslyDisableSandbox: {
            type: string;
            description: string;
            required: boolean;
            default: boolean;
        };
    };
    private terminalExecutor;
    constructor();
    /**
     * 获取工具类别
     */
    protected getToolCategory(): ToolCategory;
    /**
     * 初始化终端执行器
     */
    private initializeTerminalExecutor;
    /**
     * 简化的命令执行实现
     */
    private executeCommandSimple;
    /**
     * 是否启用
     */
    isEnabled(context: ExtendedToolContext): boolean;
    /**
     * 检查权限
     */
    /**
     * 工具特定权限检查
     */
    protected checkSpecificPermissions(params: BashToolInput, context: ExtendedToolContext): Promise<Partial<PermissionResult> | null>;
    /**
     * 基本权限检查
     */
    private basicPermissionCheck;
    /**
     * 验证参数
     */
    validateParameters(params: BashToolInput, context: ExtendedToolContext): Promise<ValidationResult>;
    /**
     * 执行工具（核心方法）
     */
    protected executeTool(params: BashToolInput, context: ExtendedToolContext, onProgress?: (progress: ExtendedToolProgress) => void): Promise<ToolResult<BashToolOutput>>;
    /**
     * 执行终端命令
     */
    private executeTerminalCommand;
    /**
     * 获取显示名称
     */
    getDisplayName(params?: BashToolInput): string;
    /**
     * 获取活动描述
     */
    getActivityDescription(params: BashToolInput): string;
    /**
     * 检查是否为只读操作
     */
    isReadOnly(context: ExtendedToolContext): boolean;
    /**
     * 检查是否为破坏性操作
     */
    isDestructive(context: ExtendedToolContext): boolean;
}
/**
 * 工厂函数：创建 BashTool 实例
 */
export declare function createBashTool(context: ExtendedToolContext): BashTool;
//# sourceMappingURL=BashTool.d.ts.map