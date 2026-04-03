/**
 * 工具适配器基类
 * 为现有模块提供统一的工具接口适配
 */

import * as vscode from 'vscode';
import { Tool, ToolContext, ToolResult, PermissionResult, ValidationResult, ToolProgress, ToolCategory } from '../ToolInterface';

/**
 * 基础工具适配器
 */
export abstract class BaseToolAdapter<Input extends Record<string, any> = Record<string, any>, Output = any> implements Tool<Input, Output> {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly version: string;
  public readonly author?: string;
  public readonly capabilities: string[];
  public readonly parameterSchema?: Tool['parameterSchema'];
  
  protected outputChannel: vscode.OutputChannel;
  
  constructor(
    id: string,
    name: string,
    description: string,
    version: string,
    author?: string,
    capabilities: string[] = [],
    parameterSchema?: Tool['parameterSchema']
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.version = version;
    this.author = author;
    this.capabilities = capabilities;
    this.parameterSchema = parameterSchema;
    
    this.outputChannel = vscode.window.createOutputChannel(`CodeLine Tool: ${name}`);
  }
  
  /**
   * 默认实现：总是启用
   */
  isEnabled(context: ToolContext): boolean {
    return true;
  }
  
  /**
   * 默认实现：不支持并发
   */
  isConcurrencySafe(context: ToolContext): boolean {
    return false;
  }
  
  /**
   * 默认实现：不是只读
   */
  isReadOnly(context: ToolContext): boolean {
    return false;
  }
  
  /**
   * 默认实现：不是破坏性操作
   */
  isDestructive(context: ToolContext): boolean {
    return false;
  }
  
  /**
   * 默认权限检查：允许所有操作
   */
  async checkPermissions(params: Input, context: ToolContext): Promise<PermissionResult> {
    return {
      allowed: true,
      requiresUserConfirmation: false,
    };
  }
  
  /**
   * 默认参数验证：总是有效
   */
  async validateParameters(params: Input, context: ToolContext): Promise<ValidationResult> {
    return {
      valid: true,
      sanitizedParams: params,
    };
  }
  
  /**
   * 抽象执行方法，子类必须实现
   */
  abstract execute(
    params: Input,
    context: ToolContext,
    onProgress?: (progress: ToolProgress) => void
  ): Promise<ToolResult<Output>>;
  
  /**
   * 默认取消方法：不支持取消
   */
  async cancel(executionId: string): Promise<boolean> {
    this.outputChannel.appendLine(`⚠️ Tool ${this.id} does not support cancellation`);
    return false;
  }
  
  /**
   * 默认显示名称：使用工具名称
   */
  getDisplayName(params?: Input): string {
    return this.name;
  }
  
  /**
   * 默认活动描述：使用工具描述
   */
  getActivityDescription(params: Input): string {
    return `${this.name}: ${this.description}`;
  }
  
  /**
   * 报告进度
   */
  protected reportProgress(onProgress: ((progress: ToolProgress) => void) | undefined, progress: ToolProgress): void {
    if (onProgress) {
      onProgress(progress);
    }
  }
  
  /**
   * 创建成功结果
   */
  protected createSuccessResult(output: Output, duration: number, metadata?: Record<string, any>): ToolResult<Output> {
    return {
      success: true,
      output,
      toolId: this.id,
      duration,
      timestamp: new Date(),
      metadata,
    };
  }
  
  /**
   * 创建失败结果
   */
  protected createErrorResult(error: string, duration: number, metadata?: Record<string, any>): ToolResult<Output> {
    return {
      success: false,
      error,
      toolId: this.id,
      duration,
      timestamp: new Date(),
      metadata,
    };
  }
  
  /**
   * 关闭输出通道
   */
  public dispose(): void {
    this.outputChannel.dispose();
  }
}