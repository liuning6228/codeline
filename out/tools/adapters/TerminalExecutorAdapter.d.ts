/**
 * 终端执行器适配器
 * 将现有的 TerminalExecutor 模块适配到统一的工具接口
 */
import { TerminalResult } from '../../terminal/terminalExecutor';
import { BaseToolAdapter } from './ToolAdapter';
import { ToolContext, ToolResult, PermissionResult, ValidationResult, ToolProgress } from '../ToolInterface';
/**
 * 终端命令参数类型
 */
export interface TerminalCommandParams {
    /** 命令类型 */
    type: 'single' | 'batch';
    /** 单个命令（type='single'时使用） */
    command?: string;
    /** 命令列表（type='batch'时使用） */
    commands?: string[];
    /** 工作目录 */
    cwd?: string;
    /** 环境变量 */
    env?: Record<string, string>;
    /** 超时时间（毫秒） */
    timeout?: number;
    /** 是否使用shell */
    shell?: boolean;
    /** 是否在错误时停止（批量执行时） */
    stopOnError?: boolean;
    /** 实时输出处理 */
    processOutputInRealTime?: boolean;
}
/**
 * 终端命令结果类型
 */
export interface TerminalCommandResultData {
    /** 终端执行结果 */
    results: TerminalResult[];
    /** 命令摘要 */
    summary: {
        totalCommands: number;
        successfulCommands: number;
        failedCommands: number;
        totalDuration: number;
    };
}
/**
 * 终端执行器适配器
 */
export declare class TerminalExecutorAdapter extends BaseToolAdapter<TerminalCommandParams, TerminalCommandResultData> {
    private terminalExecutor;
    private isExecuting;
    constructor(context: ToolContext);
    /**
     * 检查权限 - 终端命令需要特别注意
     */
    checkPermissions(params: TerminalCommandParams, context: ToolContext): Promise<PermissionResult>;
    /**
     * 验证参数
     */
    validateParameters(params: TerminalCommandParams, context: ToolContext): Promise<ValidationResult>;
    /**
     * 执行终端命令
     */
    execute(params: TerminalCommandParams, context: ToolContext, onProgress?: (progress: ToolProgress) => void): Promise<ToolResult<TerminalCommandResultData>>;
    /**
     * 取消执行
     */
    cancel(executionId: string): Promise<boolean>;
    /**
     * 检查是否为破坏性操作
     */
    isDestructive(context: ToolContext): boolean;
    /**
     * 获取显示名称
     */
    getDisplayName(params?: TerminalCommandParams): string;
    /**
     * 获取活动描述
     */
    getActivityDescription(params: TerminalCommandParams): string;
    /**
     * 检查命令安全性
     */
    private isCommandSafe;
    /**
     * 工厂方法：创建终端执行器适配器
     */
    static create(context: ToolContext): TerminalExecutorAdapter;
}
//# sourceMappingURL=TerminalExecutorAdapter.d.ts.map