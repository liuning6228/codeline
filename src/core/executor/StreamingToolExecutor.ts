/**
 * 流式工具执行器
 * 集成 Claude-Code 的流式执行架构
 */

import * as vscode from 'vscode';
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
 * 缓存结果类型（不包含执行ID和缓存命中标记）
 */
type CachedResult = Omit<ExecutionResult, 'executionId' | 'cacheHit'>;

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
export class StreamingToolExecutor {
  private config: ExecutorConfig;
  private executions: Map<string, ToolExecutionInfo> = new Map();
  private executionQueue: Array<{
    request: ExecutionRequest;
    resolve: (result: ExecutionResult) => void;
    reject: (error: Error) => void;
    options: ExecutionOptions;
  }> = [];
  private activeExecutions: Set<string> = new Set();
  private eventListeners: Map<keyof ExecutorEvents, Function[]> = new Map();
  private cache: Map<string, { result: ExecutionResult; timestamp: Date }> = new Map();
  private isRunning: boolean = true;

  /**
   * 构造函数
   */
  constructor(config?: Partial<ExecutorConfig>) {
    this.config = {
      maxConcurrent: 5,
      defaultTimeout: 30000,
      enableCache: true,
      cacheMaxSize: 100,
      enableRetry: true,
      maxRetries: 3,
      retryDelay: 1000,
      enableSandbox: false,
      sandboxTimeout: 10000,
      ...config
    };
  }

  /**
   * 执行工具
   */
  async execute<Input, Output>(
    request: ExecutionRequest<Input>,
    options?: ExecutionOptions
  ): Promise<ExecutionResult<Output>> {
    const executionId = options?.executionId || this.generateExecutionId();
    
    // 检查缓存
    if (this.config.enableCache && options?.enableCache !== false) {
      const cached = this.getFromCache<Output>(executionId, request);
      if (cached) {
        this.emit('execution:complete', cached);
        return cached;
      }
    }

    // 创建执行信息
    const executionInfo: ToolExecutionInfo = {
      executionId,
      toolId: request.tool.id,
      state: ToolExecutionState.PENDING,
      startTime: new Date(),
      metadata: {
        params: request.params,
        options
      }
    };
    this.executions.set(executionId, executionInfo);

    // 检查并发限制
    if (this.activeExecutions.size >= this.config.maxConcurrent) {
      return new Promise((resolve, reject) => {
        this.executionQueue.push({
          request,
          resolve: resolve as any,
          reject,
          options: options || {}
        });
      });
    }

    // 开始执行
    return this.startExecution(executionId, request, options || {});
  }

  /**
   * 开始执行
   */
  private async startExecution<Input, Output>(
    executionId: string,
    request: ExecutionRequest<Input>,
    options: ExecutionOptions
  ): Promise<ExecutionResult<Output>> {
    const executionInfo = this.executions.get(executionId);
    if (!executionInfo) {
      throw new Error(`执行信息不存在: ${executionId}`);
    }

    // 更新状态
    executionInfo.state = ToolExecutionState.RUNNING;
    this.activeExecutions.add(executionId);
    this.emit('execution:start', executionInfo);

    const startTime = Date.now();
    let retryCount = 0;
    let lastError: Error | null = null;

    // 进度回调
    const progressCallback = options.enableProgress !== false 
      ? (progress: ExtendedToolProgress) => {
          executionInfo.progress = progress;
          this.emit('execution:progress', executionId, progress);
        }
      : undefined;

    // 执行循环（支持重试）
    while (retryCount <= (options.enableRetry !== false ? this.config.maxRetries : 0)) {
      try {
        // 设置超时
        const timeout = options.timeout || this.config.defaultTimeout;
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`执行超时: ${timeout}ms`)), timeout);
        });

        // 执行工具
        const executionPromise = request.tool.execute(
          request.params,
          request.context,
          progressCallback
        );

        // 等待执行完成或超时
        const result = await Promise.race([executionPromise, timeoutPromise]) as ToolResult<Output>;

        // 创建执行结果
        const executionResult: ExecutionResult<Output> = {
          ...result,
          executionId,
          toolId: request.tool.id,
          state: ToolExecutionState.COMPLETED,
          startTime: executionInfo.startTime,
          endTime: new Date(),
          progressHistory: executionInfo.progress ? [executionInfo.progress] : [],
          retryCount
        };

        // 更新执行信息
        executionInfo.state = ToolExecutionState.COMPLETED;
        executionInfo.endTime = new Date();
        executionInfo.result = result;

        // 清理
        this.activeExecutions.delete(executionId);
        this.processNextInQueue();

        // 缓存结果
        if (this.config.enableCache && options.enableCache !== false) {
          this.addToCache(executionId, request, executionResult);
        }

        // 发送完成事件
        this.emit('execution:complete', executionResult);

        return executionResult;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        retryCount++;

        if (retryCount <= (options.enableRetry !== false ? this.config.maxRetries : 0)) {
          // 等待重试延迟
          await this.delay(this.config.retryDelay);
          continue;
        }
      }
    }

    // 执行失败
    executionInfo.state = ToolExecutionState.FAILED;
    executionInfo.endTime = new Date();
    executionInfo.error = lastError!;
    this.activeExecutions.delete(executionId);
    this.processNextInQueue();

    // 发送错误事件
    this.emit('execution:error', executionId, lastError!);

    throw lastError!;
  }

  /**
   * 取消执行
   */
  async cancel(executionId: string): Promise<boolean> {
    const executionInfo = this.executions.get(executionId);
    if (!executionInfo) {
      return false;
    }

    // 从队列中移除
    this.executionQueue = this.executionQueue.filter(item => {
      if (item.request.tool.id === executionInfo.toolId) {
        item.reject(new Error('执行被取消'));
        return false;
      }
      return true;
    });

    // 取消活跃执行
    if (this.activeExecutions.has(executionId)) {
      // 调用工具的取消方法
      // 注意：这里需要知道具体的工具实例，简化处理
      this.activeExecutions.delete(executionId);
      executionInfo.state = ToolExecutionState.CANCELLED;
      executionInfo.endTime = new Date();
      
      this.emit('execution:cancelled', executionId);
      this.processNextInQueue();
      
      return true;
    }

    return false;
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
    return this.activeExecutions.size;
  }

  /**
   * 获取队列长度
   */
  getQueueLength(): number {
    return this.executionQueue.length;
  }

  /**
   * 清理旧的执行记录
   */
  cleanupOldExecutions(maxAgeHours: number = 24): number {
    const cutoff = Date.now() - (maxAgeHours * 60 * 60 * 1000);
    let removed = 0;

    for (const [executionId, info] of this.executions.entries()) {
      if (info.endTime && info.endTime.getTime() < cutoff) {
        this.executions.delete(executionId);
        removed++;
      }
    }

    return removed;
  }

  /**
   * 清理缓存
   */
  cleanupCache(maxAgeHours: number = 24): number {
    const cutoff = Date.now() - (maxAgeHours * 60 * 60 * 1000);
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp.getTime() < cutoff) {
        this.cache.delete(key);
        removed++;
      }
    }

    // 限制缓存大小
    if (this.cache.size > this.config.cacheMaxSize) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime());
      
      const toRemove = entries.slice(0, this.cache.size - this.config.cacheMaxSize);
      toRemove.forEach(([key]) => {
        this.cache.delete(key);
        removed++;
      });
    }

    return removed;
  }

  /**
   * 停止执行器
   */
  async stop(): Promise<void> {
    this.isRunning = false;

    // 取消所有活跃执行
    const cancelPromises = Array.from(this.activeExecutions).map(id => this.cancel(id));
    await Promise.all(cancelPromises);

    // 拒绝所有队列中的请求
    this.executionQueue.forEach(item => {
      item.reject(new Error('执行器已停止'));
    });
    this.executionQueue = [];

    // 清理资源
    this.activeExecutions.clear();
  }

  /**
   * 添加事件监听器
   */
  on<K extends keyof ExecutorEvents>(event: K, listener: ExecutorEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * 移除事件监听器
   */
  off<K extends keyof ExecutorEvents>(event: K, listener: ExecutorEvents[K]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   */
  private emit<K extends keyof ExecutorEvents>(event: K, ...args: Parameters<ExecutorEvents[K]>): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          (listener as Function)(...args);
        } catch (error) {
          console.error(`事件监听器错误 (${event}):`, error);
        }
      });
    }
  }

  /**
   * 处理队列中的下一个请求
   */
  private processNextInQueue(): void {
    if (this.executionQueue.length === 0 || this.activeExecutions.size >= this.config.maxConcurrent) {
      return;
    }

    const next = this.executionQueue.shift();
    if (next) {
      this.startExecution(
        next.options.executionId || this.generateExecutionId(),
        next.request,
        next.options
      ).then(next.resolve).catch(next.reject);
    }
  }

  /**
   * 从缓存获取结果
   */
  private getFromCache<Output>(executionId: string, request: ExecutionRequest): ExecutionResult<Output> | null {
    // 暂时禁用缓存
    return null;
  }

  /**
   * 添加到缓存
   */
  private addToCache(executionIdParam: string, request: ExecutionRequest, result: ExecutionResult): void {
    // 暂时禁用缓存
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(request: ExecutionRequest): string {
    const { tool, params, context } = request;
    const keyData = {
      toolId: tool.id,
      params: JSON.stringify(params),
      workspaceRoot: context.workspaceRoot,
      cwd: context.cwd,
      userId: context.userId
    };
    return JSON.stringify(keyData);
  }

  /**
   * 生成执行ID
   */
  private generateExecutionId(): string {
    return `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 执行器管理器
 */
export class ExecutorManager {
  private executors: Map<string, StreamingToolExecutor> = new Map();
  private defaultExecutor: StreamingToolExecutor;

  constructor(defaultConfig?: Partial<ExecutorConfig>) {
    this.defaultExecutor = new StreamingToolExecutor(defaultConfig);
    this.executors.set('default', this.defaultExecutor);
  }

  /**
   * 获取执行器
   */
  getExecutor(name: string = 'default'): StreamingToolExecutor {
    let executor = this.executors.get(name);
    if (!executor) {
      executor = new StreamingToolExecutor();
      this.executors.set(name, executor);
    }
    return executor;
  }

  /**
   * 创建执行器
   */
  createExecutor(name: string, config?: Partial<ExecutorConfig>): StreamingToolExecutor {
    const executor = new StreamingToolExecutor(config);
    this.executors.set(name, executor);
    return executor;
  }

  /**
   * 移除执行器
   */
  removeExecutor(name: string): boolean {
    if (name === 'default') {
      return false; // 不能移除默认执行器
    }
    return this.executors.delete(name);
  }

  /**
   * 获取所有执行器
   */
  getAllExecutors(): Map<string, StreamingToolExecutor> {
    return new Map(this.executors);
  }

  /**
   * 停止所有执行器
   */
  async stopAll(): Promise<void> {
    const stopPromises = Array.from(this.executors.values()).map(executor => executor.stop());
    await Promise.all(stopPromises);
  }

  /**
   * 清理所有执行器
   */
  cleanupAll(maxAgeHours: number = 24): { executions: number; cache: number } {
    let totalExecutions = 0;
    let totalCache = 0;

    for (const executor of this.executors.values()) {
      totalExecutions += executor.cleanupOldExecutions(maxAgeHours);
      totalCache += executor.cleanupCache(maxAgeHours);
    }

    return { executions: totalExecutions, cache: totalCache };
  }
}

/**
 * 工具执行器工厂
 */
export class ToolExecutorFactory {
  private static instance: ToolExecutorFactory;
  private executors: Map<string, StreamingToolExecutor> = new Map();

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): ToolExecutorFactory {
    if (!ToolExecutorFactory.instance) {
      ToolExecutorFactory.instance = new ToolExecutorFactory();
    }
    return ToolExecutorFactory.instance;
  }

  /**
   * 获取或创建执行器
   */
  getOrCreateExecutor(name: string, config?: Partial<ExecutorConfig>): StreamingToolExecutor {
    let executor = this.executors.get(name);
    if (!executor) {
      executor = new StreamingToolExecutor(config);
      this.executors.set(name, executor);
    }
    return executor;
  }

  /**
   * 获取默认执行器
   */
  getDefaultExecutor(): StreamingToolExecutor {
    return this.getOrCreateExecutor('default');
  }

  /**
   * 获取所有执行器
   */
  getAllExecutors(): Map<string, StreamingToolExecutor> {
    return new Map(this.executors);
  }

  /**
   * 清理所有执行器
   */
  async cleanupAll(): Promise<void> {
    const cleanupPromises = Array.from(this.executors.values()).map(async executor => {
      executor.cleanupOldExecutions();
      executor.cleanupCache();
    });
    await Promise.all(cleanupPromises);
  }

  /**
   * 停止所有执行器
   */
  async stopAll(): Promise<void> {
    const stopPromises = Array.from(this.executors.values()).map(executor => executor.stop());
    await Promise.all(stopPromises);
    this.executors.clear();
  }
}