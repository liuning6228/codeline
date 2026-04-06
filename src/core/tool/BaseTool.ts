/**
 * 工具抽象基类
 * 集成 Claude-Code 和 Cline 的最佳实践
 */

import * as vscode from 'vscode';
import { Tool, ToolContext, ToolOptions, ToolProgress, ToolResult, ValidationResult, PermissionResult } from '../../tools/ToolInterface';
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
  // 来自 Claude-Code 的上下文扩展
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
export type PermissionMode = 
  | 'auto'        // 自动决定
  | 'always'      // 总是允许
  | 'ask'         // 总是询问
  | 'deny'        // 总是拒绝
  | 'sandbox';    // 沙箱模式

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
export enum ToolExecutionState {
  PENDING = 'pending',
  RUNNING = 'running',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  FAILED = 'failed',
  TIMEOUT = 'timeout'
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
export abstract class BaseTool<Input = Record<string, any>, Output = any> implements Tool<Input, Output> {
  // 工具元数据
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly version: string;
  abstract readonly author?: string;
  abstract readonly capabilities: string[];
  
  // 参数模式
  parameterSchema?: Record<string, {
    type: string;
    description: string;
    required?: boolean;
    default?: any;
    validation?: (value: any) => boolean;
    enum?: any[];
  }>;

  // 工具配置
  protected config: ToolConfig = {
    defaultTimeout: 30000,
    maxRetries: 3,
    retryDelay: 1000,
    requireApproval: true,
    autoExecute: false,
    validateParams: true,
    concurrencySafe: false,
    readOnly: false,
    destructive: false
  };

  // 执行状态跟踪
  private executions: Map<string, ToolExecutionInfo> = new Map();
  private executionCount: number = 0;

  /**
   * 构造函数
   */
  constructor(config?: Partial<ToolConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * 是否启用
   */
  isEnabled(context: ExtendedToolContext): boolean {
    return true; // 默认启用
  }

  /**
   * 是否支持并发执行
   */
  isConcurrencySafe(context: ExtendedToolContext): boolean {
    return this.config.concurrencySafe;
  }

  /**
   * 是否是只读操作
   */
  isReadOnly(context: ExtendedToolContext): boolean {
    return this.config.readOnly;
  }

  /**
   * 是否是破坏性操作
   */
  isDestructive(context: ExtendedToolContext): boolean {
    return this.config.destructive;
  }

  /**
   * 权限检查
   */
  async checkPermissions(
    params: Input,
    context: ExtendedToolContext
  ): Promise<PermissionResult> {
    // 尝试使用全局权限管理器实例
    try {
      const { PermissionManager } = await import('../../auth/PermissionManager');
      const permissionManager = PermissionManager.getInstance();
      
      if (permissionManager) {
        const request = {
          toolId: this.id,
          toolCategory: this.getToolCategory(),
          input: params,
          context,
          workspaceRoot: context.cwd || context.workspaceRoot,
          userId: context.userId,
        };
        
        return await permissionManager.checkToolPermission(request);
      }
    } catch (error: any) {
      console.error('全局权限管理器检查失败:', error.message);
    }
    
    // 回退到context中的权限管理器（如果可用）
    if (context.permissionManager) {
      try {
        const request = {
          toolId: this.id,
          toolCategory: this.getToolCategory(),
          input: params,
          context,
          workspaceRoot: context.cwd || context.workspaceRoot,
          userId: context.userId,
        };
        
        return await context.permissionManager.checkPermission(request);
      } catch (error: any) {
        // 如果权限管理器出错，回退到默认检查
        console.error('上下文权限管理器检查失败:', error.message);
      }
    }
    
    // 回退到默认权限检查逻辑
    const result: PermissionResult = {
      allowed: true,
      requiresUserConfirmation: this.config.requireApproval,
      confirmationPrompt: this.getPermissionPrompt(params, context)
    };

    // 检查工具特定权限
    const specificCheck = await this.checkSpecificPermissions(params, context);
    if (specificCheck) {
      return { ...result, ...specificCheck };
    }

    return result;
  }

  /**
   * 获取工具类别（子类可重写）
   */
  protected getToolCategory(): ToolCategory {
    return ToolCategory.OTHER;
  }

  /**
   * 工具特定权限检查（子类可重写）
   */
  protected async checkSpecificPermissions(
    params: Input,
    context: ExtendedToolContext
  ): Promise<Partial<PermissionResult> | null> {
    return null;
  }

  /**
   * 获取权限提示信息
   */
  protected getPermissionPrompt(
    params: Input,
    context: ExtendedToolContext
  ): string {
    return `是否允许执行工具 "${this.name}"？\n操作：${this.getActivityDescription(params)}`;
  }

  /**
   * 参数验证
   */
  async validateParameters(
    params: Input,
    context: ExtendedToolContext
  ): Promise<ValidationResult> {
    if (!this.config.validateParams) {
      return { valid: true };
    }

    // 检查必需参数
    if (this.parameterSchema) {
      for (const [key, schema] of Object.entries(this.parameterSchema)) {
        if (schema.required && (params[key as keyof Input] === undefined || params[key as keyof Input] === null)) {
          return {
            valid: false,
            error: `必需参数 "${key}" 缺失`
          };
        }

        // 类型检查
        if (params[key as keyof Input] !== undefined && params[key as keyof Input] !== null) {
          const value = params[key as keyof Input];
          const typeCheck = this.validateType(value, schema.type);
          if (!typeCheck.valid) {
            return {
              valid: false,
              error: `参数 "${key}" 类型错误：期望 ${schema.type}，实际 ${typeof value}`
            };
          }

          // 枚举检查
          if (schema.enum && !schema.enum.includes(value)) {
            return {
              valid: false,
              error: `参数 "${key}" 值无效：必须是 ${schema.enum.join(', ')} 之一`
            };
          }

          // 自定义验证
          if (schema.validation && !schema.validation(value)) {
            return {
              valid: false,
              error: `参数 "${key}" 验证失败`
            };
          }
        }
      }
    }

    // 工具特定验证
    const specificValidation = await this.validateSpecificParameters(params, context);
    if (specificValidation) {
      return specificValidation;
    }

    return { valid: true };
  }

  /**
   * 类型验证
   */
  private validateType(value: any, expectedType: string): { valid: boolean; actualType: string } {
    const actualType = typeof value;
    
    switch (expectedType) {
      case 'string':
        return { valid: typeof value === 'string', actualType };
      case 'number':
        return { valid: typeof value === 'number', actualType };
      case 'boolean':
        return { valid: typeof value === 'boolean', actualType };
      case 'object':
        return { valid: value !== null && typeof value === 'object', actualType };
      case 'array':
        return { valid: Array.isArray(value), actualType: 'array' };
      default:
        return { valid: true, actualType }; // 未知类型不验证
    }
  }

  /**
   * 工具特定参数验证（子类可重写）
   */
  protected async validateSpecificParameters(
    params: Input,
    context: ExtendedToolContext
  ): Promise<ValidationResult | null> {
    return null;
  }

  /**
   * 工具执行方法
   */
  async execute(
    params: Input,
    context: ExtendedToolContext,
    onProgress?: (progress: ExtendedToolProgress) => void
  ): Promise<ToolResult<Output>> {
    const executionId = this.generateExecutionId();
    const startTime = new Date();
    
    try {
      // 创建执行信息
      const executionInfo: ToolExecutionInfo = {
        executionId,
        toolId: this.id,
        state: ToolExecutionState.RUNNING,
        startTime,
        metadata: { params }
      };
      this.executions.set(executionId, executionInfo);

      // 发送开始进度
      if (onProgress) {
        onProgress({
          type: 'start',
          progress: 0,
          message: `开始执行 ${this.name}`,
          phase: 'initialization'
        });
      }

      // 验证参数
      const validation = await this.validateParameters(params, context);
      if (!validation.valid) {
        throw new Error(`参数验证失败: ${validation.error}`);
      }

      // 检查权限
      const permission = await this.checkPermissions(params, context);
      if (!permission.allowed) {
        throw new Error(`权限检查失败: ${permission.reason || '操作被拒绝'}`);
      }

      // 如果需要用户确认
      if (permission.requiresUserConfirmation) {
        const confirmed = await this.requestUserConfirmation(permission.confirmationPrompt || '', context);
        if (!confirmed) {
          throw new Error('用户取消了操作');
        }
      }

      // 执行工具
      const result = await this.executeTool(params, context, (progress) => {
        executionInfo.progress = progress;
        if (onProgress) {
          onProgress(progress);
        }
      });

      // 更新执行信息
      executionInfo.state = ToolExecutionState.COMPLETED;
      executionInfo.endTime = new Date();
      executionInfo.result = result;

      return result;

    } catch (error) {
      // 更新执行信息
      const executionInfo = this.executions.get(executionId);
      if (executionInfo) {
        executionInfo.state = ToolExecutionState.FAILED;
        executionInfo.endTime = new Date();
        executionInfo.error = error instanceof Error ? error : new Error(String(error));
      }

      // 发送错误进度
      if (onProgress) {
        onProgress({
          type: 'error',
          progress: 1,
          message: `执行失败: ${error instanceof Error ? error.message : String(error)}`,
          phase: 'error'
        });
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        toolId: this.id,
        duration: Date.now() - startTime.getTime(),
        timestamp: new Date()
      };
    } finally {
      // 清理旧的执行记录
      this.cleanupOldExecutions();
    }
  }

  /**
   * 执行工具（抽象方法，子类必须实现）
   */
  protected abstract executeTool(
    params: Input,
    context: ExtendedToolContext,
    onProgress?: (progress: ExtendedToolProgress) => void
  ): Promise<ToolResult<Output>>;

  /**
   * 请求用户确认
   */
  protected async requestUserConfirmation(
    message: string,
    context: ExtendedToolContext
  ): Promise<boolean> {
    // 如果上下文中有权限管理器，使用它
    if (context.permissionManager) {
      try {
        // 这里需要更完整的请求信息，但简化处理
        // 在实际实现中，应该传递完整的请求上下文
        const result = await this.requestEnhancedConfirmation(message, context);
        return result;
      } catch (error) {
        console.warn('增强确认失败，回退到基本确认:', error);
      }
    }
    
    // 回退到基本确认
    return this.requestBasicConfirmation(message);
  }

  /**
   * 基本确认对话框
   */
  private async requestBasicConfirmation(message: string): Promise<boolean> {
    const result = await vscode.window.showWarningMessage(
      message,
      { modal: true },
      '允许',
      '拒绝'
    );
    
    return result === '允许';
  }

  /**
   * 增强确认对话框
   */
  private async requestEnhancedConfirmation(
    message: string,
    context: ExtendedToolContext
  ): Promise<boolean> {
    // 尝试导入和使用权限对话框
    try {
      // 动态导入以避免循环依赖
      const { PermissionManager } = await import('../../auth/PermissionManager');
      const permissionManager = PermissionManager.getInstance();
      
      if (permissionManager) {
        // 使用权限管理器的快速确认
        return await permissionManager.showQuickConfirmation(message);
      }
    } catch (error) {
      console.warn('无法加载权限对话框:', error);
    }
    
    // 回退到基本确认
    return this.requestBasicConfirmation(message);
  }

  /**
   * 生成执行ID
   */
  protected generateExecutionId(): string {
    this.executionCount++;
    return `${this.id}-${Date.now()}-${this.executionCount}`;
  }

  /**
   * 清理旧的执行记录
   */
  private cleanupOldExecutions(maxAgeHours: number = 24): void {
    const cutoff = Date.now() - (maxAgeHours * 60 * 60 * 1000);
    
    for (const [executionId, info] of this.executions.entries()) {
      if (info.endTime && info.endTime.getTime() < cutoff) {
        this.executions.delete(executionId);
      }
    }
  }

  /**
   * 工具取消方法
   */
  async cancel(executionId: string): Promise<boolean> {
    const executionInfo = this.executions.get(executionId);
    if (!executionInfo || executionInfo.state !== ToolExecutionState.RUNNING) {
      return false;
    }

    // 调用工具特定的取消逻辑
    const cancelled = await this.cancelTool(executionId);
    if (cancelled) {
      executionInfo.state = ToolExecutionState.CANCELLED;
      executionInfo.endTime = new Date();
    }

    return cancelled;
  }

  /**
   * 工具特定取消逻辑（子类可重写）
   */
  protected async cancelTool(executionId: string): Promise<boolean> {
    return false; // 默认不支持取消
  }

  /**
   * 获取工具UI显示名称
   */
  getDisplayName(params?: Input): string {
    return this.name;
  }

  /**
   * 获取工具活动描述
   */
  getActivityDescription(params: Input): string {
    return `执行 ${this.name}`;
  }

  /**
   * 获取执行信息
   */
  getExecutionInfo(executionId: string): ToolExecutionInfo | undefined {
    return this.executions.get(executionId);
  }

  /**
   * 获取所有执行信息
   */
  getAllExecutions(): ToolExecutionInfo[] {
    return Array.from(this.executions.values());
  }

  /**
   * 获取活跃执行数量
   */
  getActiveExecutionCount(): number {
    return Array.from(this.executions.values()).filter(
      info => info.state === ToolExecutionState.RUNNING
    ).length;
  }
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
export abstract class StreamingBaseTool<Input = Record<string, any>, Output = any> 
  extends BaseTool<Input, Output> {
  
  /**
   * 执行工具（流式版本）
   */
  protected async executeTool(
    params: Input,
    context: ExtendedToolContext,
    onProgress?: (progress: ExtendedToolProgress) => void
  ): Promise<ToolResult<Output>> {
    const startTime = Date.now();
    
    try {
      // 创建流式执行器
      const stream = this.createStream(params, context);
      const result: Output[] = [];
      
      // 处理流式数据
      for await (const chunk of stream) {
        if (chunk instanceof Object && 'type' in chunk && 'progress' in chunk) {
          // 进度更新
          if (onProgress) {
            onProgress(chunk as ExtendedToolProgress);
          }
        } else {
          // 数据块
          result.push(chunk as Output);
        }
      }
      
      return {
        success: true,
        output: this.aggregateResults(result),
        toolId: this.id,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        toolId: this.id,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    }
  }

  /**
   * 创建数据流（抽象方法）
   */
  protected abstract createStream(
    params: Input,
    context: ExtendedToolContext
  ): AsyncGenerator<ExtendedToolProgress | Output>;

  /**
   * 聚合结果（子类可重写）
   */
  protected aggregateResults(results: Output[]): Output {
    // 默认返回最后一个结果，或所有结果的数组
    if (results.length === 0) {
      return undefined as any;
    } else if (results.length === 1) {
      return results[0];
    } else {
      return results as any;
    }
  }
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
