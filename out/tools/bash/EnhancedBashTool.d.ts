/**
 * EnhancedBashTool - 增强版终端命令执行工具
 * 集成 TerminalProcess、沙箱管理、命令解析和权限系统
 */
import { BaseTool, ExtendedToolContext, ExtendedToolProgress } from '../../core/tool/BaseTool';
import { ToolCategory } from '../../core/tool/Tool';
import { ToolResult, ValidationResult, PermissionResult } from '../ToolInterface';
export interface EnhancedBashToolInput {
    command: string;
    timeout?: number;
    description?: string;
    run_in_background?: boolean;
    dangerouslyDisableSandbox?: boolean;
    requireConfirmation?: boolean;
}
export interface EnhancedBashToolOutput {
    stdout: string;
    stderr: string;
    interrupted: boolean;
    exitCode?: number;
    duration?: number;
    warnings?: string[];
    suggestions?: string[];
    riskLevel?: number;
}
/**
 * EnhancedBashTool 类
 * 提供完整的终端命令执行能力，包括流式输出、沙箱执行、权限控制和智能分析
 */
export declare class EnhancedBashTool extends BaseTool<EnhancedBashToolInput, EnhancedBashToolOutput> {
    readonly id = "enhanced-bash";
    readonly name = "Enhanced Bash";
    readonly description = "Execute shell commands with full terminal capabilities, sandboxing, and AI-powered security";
    readonly version = "2.0.0";
    readonly author = "CodeLine Team";
    readonly category = ToolCategory.TERMINAL;
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
        enableSandbox: boolean;
        enableStreaming: boolean;
        enableProgressUpdates: boolean;
        maxOutputSize: number;
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
        requireConfirmation: {
            type: string;
            description: string;
            required: boolean;
            default: boolean;
        };
    };
    private sandboxManager;
    private commandParser;
    private ruleManager;
    private commandClassifier;
    private activeProcesses;
    constructor();
    /**
     * 获取工具类别
     */
    getToolCategory(): ToolCategory;
    /**
     * 是否启用
     */
    isEnabled(context: ExtendedToolContext): boolean;
    /**
     * 检查权限
     */
    checkPermissions(input: EnhancedBashToolInput, context: ExtendedToolContext): Promise<PermissionResult>;
    /**
     * 验证参数
     */
    validateParameters(input: EnhancedBashToolInput, context: ExtendedToolContext): Promise<ValidationResult>;
    /**
     * 执行工具（抽象方法实现）
     */
    protected executeTool(input: EnhancedBashToolInput, context: ExtendedToolContext, onProgress?: (progress: ExtendedToolProgress) => void): Promise<ToolResult<EnhancedBashToolOutput>>;
    /**
     * 取消执行
     */
    cancel(executionId: string): Promise<boolean>;
    /**
     * 获取显示名称
     */
    getDisplayName(input?: EnhancedBashToolInput): string;
    /**
     * 获取活动描述
     */
    getActivityDescription(input: EnhancedBashToolInput): string;
    /**
     * 是否只读
     */
    isReadOnly(context: ExtendedToolContext): boolean;
    /**
     * 是否破坏性
     */
    isDestructive(context: ExtendedToolContext): boolean;
    /**
     * 清理资源
     */
    cleanup(): Promise<void>;
}
/**
 * 工厂函数：创建 EnhancedBashTool 实例
 */
export declare function createEnhancedBashTool(context: ExtendedToolContext): EnhancedBashTool;
//# sourceMappingURL=EnhancedBashTool.d.ts.map