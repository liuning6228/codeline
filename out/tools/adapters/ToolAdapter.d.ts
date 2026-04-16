/**
 * 工具适配器基类
 * 为现有模块提供统一的工具接口适配
 */
import * as vscode from 'vscode';
import { Tool, ToolContext, ToolResult, PermissionResult, ValidationResult, ToolProgress } from '../ToolInterface';
/**
 * 基础工具适配器
 */
export declare abstract class BaseToolAdapter<Input extends Record<string, any> = Record<string, any>, Output = any> implements Tool<Input, Output> {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly version: string;
    readonly author?: string;
    readonly capabilities: string[];
    readonly parameterSchema?: Tool['parameterSchema'];
    protected outputChannel: vscode.OutputChannel;
    constructor(id: string, name: string, description: string, version: string, author?: string, capabilities?: string[], parameterSchema?: Tool['parameterSchema']);
    /**
     * 默认实现：总是启用
     */
    isEnabled(context: ToolContext): boolean;
    /**
     * 默认实现：不支持并发
     */
    isConcurrencySafe(context: ToolContext): boolean;
    /**
     * 默认实现：不是只读
     */
    isReadOnly(context: ToolContext): boolean;
    /**
     * 默认实现：不是破坏性操作
     */
    isDestructive(context: ToolContext): boolean;
    /**
     * 默认权限检查：允许所有操作
     */
    checkPermissions(params: Input, context: ToolContext): Promise<PermissionResult>;
    /**
     * 默认参数验证：总是有效
     */
    validateParameters(params: Input, context: ToolContext): Promise<ValidationResult>;
    /**
     * 抽象执行方法，子类必须实现
     */
    abstract execute(params: Input, context: ToolContext, onProgress?: (progress: ToolProgress) => void): Promise<ToolResult<Output>>;
    /**
     * 默认取消方法：不支持取消
     */
    cancel(executionId: string): Promise<boolean>;
    /**
     * 默认显示名称：使用工具名称
     */
    getDisplayName(params?: Input): string;
    /**
     * 默认活动描述：使用工具描述
     */
    getActivityDescription(params: Input): string;
    /**
     * 报告进度
     */
    protected reportProgress(onProgress: ((progress: ToolProgress) => void) | undefined, progress: ToolProgress): void;
    /**
     * 创建成功结果
     */
    protected createSuccessResult(output: Output, duration: number, metadata?: Record<string, any>): ToolResult<Output>;
    /**
     * 创建失败结果
     */
    protected createErrorResult(error: string, duration: number, metadata?: Record<string, any>): ToolResult<Output>;
    /**
     * 关闭输出通道
     */
    dispose(): void;
}
//# sourceMappingURL=ToolAdapter.d.ts.map