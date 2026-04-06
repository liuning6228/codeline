/**
 * 增强工具注册表
 * 集成claude-code-haha-main的工具管理能力，支持流式执行和权限控制
 */

import * as vscode from 'vscode';
import { z } from 'zod';
import { 
  Tool, 
  ToolDefinition, 
  Tools, 
  ToolUseContext, 
  ToolCategory, 
  buildTool, 
  findToolByName,
  findToolsByCategory,
  ToolProgress,
  PermissionResult
} from './Tool';
import { BaseTool, ExtendedToolContext } from './BaseTool';
import { StreamingToolExecutor, ExecutionOptions } from '../executor/StreamingToolExecutor';
import { createToolProgressService } from '../../services/ToolProgressService';

// ==================== 类型定义 ====================

/**
 * 工具注册表配置
 */
export interface ToolRegistryConfig {
  enableCaching: boolean;
  enableLazyLoading: boolean;
  defaultCategories: ToolCategory[];
  excludeToolIds: string[];
  includeToolIds: string[];
  maxConcurrentTools: number;
  defaultTimeout: number;
}

/**
 * 工具执行结果
 */
export interface ToolExecutionResult {
  toolId: string;
  executionId: string;
  success: boolean;
  result?: any;
  error?: Error;
  duration: number;
  timestamp: Date;
}

/**
 * 工具使用统计
 */
export interface ToolUsageStats {
  toolId: string;
  usageCount: number;
  lastUsed: Date | null;
  successCount: number;
  failureCount: number;
  averageDuration: number;
}

// ==================== 增强工具注册表 ====================

/**
 * 增强工具注册表
 * 支持工具发现、生命周期管理、流式执行和权限控制
 */
export class EnhancedToolRegistry {
  private tools: Tools = new Map();
  private toolCategories: Map<ToolCategory, Set<string>> = new Map();
  private toolAliases: Map<string, string> = new Map();
  private initialized = false;
  private outputChannel: vscode.OutputChannel;
  private config: ToolRegistryConfig;
  
  private streamingExecutor: StreamingToolExecutor;
  private executionResults: Map<string, ToolExecutionResult> = new Map();
  private usageStats: Map<string, ToolUsageStats> = new Map();
  private toolProgressService: ReturnType<typeof createToolProgressService>;
  
  constructor(config?: Partial<ToolRegistryConfig>) {
    this.outputChannel = vscode.window.createOutputChannel('CodeLine Tool Registry');
    this.config = {
      enableCaching: true,
      enableLazyLoading: true,
      defaultCategories: Object.values(ToolCategory),
      excludeToolIds: [],
      includeToolIds: [],
      maxConcurrentTools: 3,
      defaultTimeout: 30000,
      ...config,
    };
    
    // 初始化流式执行器
    const executorConfig: Partial<import('../executor/StreamingToolExecutor').ExecutorConfig> = {
      maxConcurrent: this.config.maxConcurrentTools,
      defaultTimeout: this.config.defaultTimeout,
      enableCache: true,
      enableRetry: true,
      maxRetries: 3,
      retryDelay: 1000,
      enableSandbox: false,
      sandboxTimeout: 10000
    };
    
    this.streamingExecutor = new StreamingToolExecutor(executorConfig);
    
    // 初始化工具进度服务
    this.toolProgressService = createToolProgressService();
    this.toolProgressService.initialize();
    this.toolProgressService.registerExecutor('default', this.streamingExecutor);
    
    // 设置事件监听器
    this.streamingExecutor.on('execution:progress', (executionId: string, progress: any) => {
      this.handleToolProgress(executionId, progress);
    });
    
    this.streamingExecutor.on('execution:complete', (result: any) => {
      this.handleToolComplete(result.executionId, result);
    });
    
    // 初始化类别映射
    for (const category of this.config.defaultCategories) {
      this.toolCategories.set(category, new Set());
    }
  }
  
  /**
   * 初始化工具注册表
   */
  public async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }
    
    try {
      this.outputChannel.appendLine('🛠️ Initializing Enhanced Tool Registry...');
      
      // 加载内置工具
      await this.loadBuiltinTools();
      
      // 加载用户自定义工具
      await this.loadUserTools();
      
      // 加载工具配置
      await this.loadToolConfigs();
      
      this.initialized = true;
      this.outputChannel.appendLine(`✅ Tool Registry initialized with ${this.tools.size} tools`);
      
      return true;
    } catch (error: any) {
      this.outputChannel.appendLine(`❌ Tool Registry initialization failed: ${error.message}`);
      return false;
    }
  }
  
  /**
   * 注册工具
   */
  public registerTool(tool: Tool, categories: ToolCategory[] = [ToolCategory.OTHER]): boolean {
    try {
      // 检查排除列表
      if (this.config.excludeToolIds.includes(tool.id)) {
        this.outputChannel.appendLine(`⚠️ Tool ${tool.id} is in exclude list, skipping registration`);
        return false;
      }
      
      // 检查包含列表（如果设置了）
      if (this.config.includeToolIds.length > 0 && !this.config.includeToolIds.includes(tool.id)) {
        this.outputChannel.appendLine(`⚠️ Tool ${tool.id} is not in include list, skipping registration`);
        return false;
      }
      
      // 注册工具
      this.tools.set(tool.id, tool);
      
      // 添加到类别
      for (const category of categories) {
        const categorySet = this.toolCategories.get(category);
        if (categorySet) {
          categorySet.add(tool.id);
        } else {
          // 创建新的类别集合
          this.toolCategories.set(category, new Set([tool.id]));
        }
      }
      
      // 初始化使用统计
      this.usageStats.set(tool.id, {
        toolId: tool.id,
        usageCount: 0,
        lastUsed: null,
        successCount: 0,
        failureCount: 0,
        averageDuration: 0
      });
      
      this.outputChannel.appendLine(`✅ Registered tool: ${tool.id} (${tool.name})`);
      return true;
    } catch (error: any) {
      this.outputChannel.appendLine(`❌ Failed to register tool ${tool.id}: ${error.message}`);
      return false;
    }
  }
  
  /**
   * 注册工具定义
   */
  public registerToolDefinition<Input = any, Output = any>(
    definition: ToolDefinition<Input, Output>,
    categories: ToolCategory[] = [ToolCategory.OTHER]
  ): boolean {
    try {
      const tool = buildTool(definition);
      return this.registerTool(tool, categories);
    } catch (error: any) {
      this.outputChannel.appendLine(`❌ Failed to register tool definition ${definition.id}: ${error.message}`);
      return false;
    }
  }
  
  /**
   * 注册工具别名
   */
  public registerToolAlias(alias: string, toolId: string): boolean {
    if (!this.tools.has(toolId)) {
      this.outputChannel.appendLine(`❌ Cannot register alias ${alias} for non-existent tool ${toolId}`);
      return false;
    }
    
    this.toolAliases.set(alias, toolId);
    this.outputChannel.appendLine(`✅ Registered alias: ${alias} -> ${toolId}`);
    return true;
  }
  
  /**
   * 获取工具
   */
  public getTool(toolId: string): Tool | undefined {
    // 检查别名
    const actualToolId = this.toolAliases.get(toolId) || toolId;
    return this.tools.get(actualToolId);
  }
  
  /**
   * 获取所有工具
   */
  public getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }
  
  /**
   * 按类别获取工具
   */
  public getToolsByCategory(category: ToolCategory): Tool[] {
    const toolIds = this.toolCategories.get(category);
    if (!toolIds) {
      return [];
    }
    
    const tools: Tool[] = [];
    for (const toolId of toolIds) {
      const tool = this.tools.get(toolId);
      if (tool) {
        tools.push(tool);
      }
    }
    
    return tools;
  }
  
  /**
   * 获取所有类别
   */
  public getAllCategories(): ToolCategory[] {
    return Array.from(this.toolCategories.keys());
  }
  
  /**
   * 执行工具（流式）
   */
  public async executeToolStreaming(
    toolId: string,
    input: any,
    context: ToolUseContext
  ): Promise<{
    executionId: string;
    stream: AsyncIterable<ToolProgress>;
    result: Promise<any>;
  }> {
    const tool = this.getTool(toolId);
    if (!tool) {
      throw new Error(`Tool not found: ${toolId}`);
    }
    
    // 更新使用统计
    this.updateUsageStats(toolId, 'start');
    
    // 使用执行器执行工具
    const request = {
      tool: tool as unknown as BaseTool<any, any>,
      params: input,
      context: context as unknown as ExtendedToolContext
    };

    const executionResult = await this.streamingExecutor.execute(request);
    const executionId = executionResult.executionId;

    // 创建进度流（简化：返回空流）
    const progressStream = this.createProgressStream(executionId);

    // 创建结果Promise
    const resultPromise = executionResult.success 
      ? Promise.resolve(executionResult.output)
      : Promise.reject(new Error(executionResult.error || 'Tool execution failed'));
    
    return {
      executionId,
      stream: progressStream,
      result: resultPromise
    };
  }
  
  /**
   * 执行工具（同步）
   */
  public async executeTool(
    toolId: string,
    input: any,
    context: ToolUseContext
  ): Promise<any> {
    const { result } = await this.executeToolStreaming(toolId, input, context);
    return await result;
  }
  
  /**
   * 批量执行工具
   */
  public async executeToolsBatch(
    toolExecutions: Array<{ toolId: string; input: any }>,
    context: ToolUseContext
  ): Promise<Array<{ toolId: string; result?: any; error?: Error }>> {
    const executions: Array<{
      toolId: string;
      executionId: string;
      result: Promise<any>;
    }> = [];
    
    // 启动所有工具执行
    for (const { toolId, input } of toolExecutions) {
      try {
        const { executionId, result } = await this.executeToolStreaming(toolId, input, context);
        executions.push({ toolId, executionId, result });
      } catch (error) {
        executions.push({
          toolId,
          executionId: '',
          result: Promise.reject(error)
        });
      }
    }
    
    // 等待所有执行完成
    const results = [];
    for (const exec of executions) {
      try {
        const result = await exec.result;
        results.push({ toolId: exec.toolId, result });
      } catch (error) {
        results.push({ toolId: exec.toolId, error: error as Error });
      }
    }
    
    return results;
  }
  
  /**
   * 取消工具执行
   */
  public async cancelToolExecution(executionId: string): Promise<boolean> {
    return await this.streamingExecutor.cancel(executionId);
  }
  
  /**
   * 获取工具执行状态
   */
  public getToolExecutionStatus(executionId: string): {
    status: 'queued' | 'executing' | 'completed' | 'failed' | 'cancelled';
    progress: ToolProgress[];
    startTime?: Date;
    endTime?: Date;
  } {
    const executionInfo = this.streamingExecutor.getExecutionInfo(executionId);
    if (!executionInfo) {
      return {
        status: 'failed',
        progress: [],
        startTime: undefined,
        endTime: undefined
      };
    }
    
    // 映射执行状态
    let status: 'queued' | 'executing' | 'completed' | 'failed' | 'cancelled';
    switch (executionInfo.state) {
      case 'pending':
        status = 'queued';
        break;
      case 'running':
        status = 'executing';
        break;
      case 'completed':
        status = 'completed';
        break;
      case 'failed':
        status = 'failed';
        break;
      case 'cancelled':
        status = 'cancelled';
        break;
      default:
        status = 'failed';
    }
    
    const progress = executionInfo.progress ? [executionInfo.progress as unknown as ToolProgress] : [];
    
    return {
      status,
      progress,
      startTime: executionInfo.startTime,
      endTime: executionInfo.endTime
    };
  }
  
  /**
   * 获取工具使用统计
   */
  public getToolUsageStats(toolId?: string): ToolUsageStats | ToolUsageStats[] {
    if (toolId) {
      return this.usageStats.get(toolId) || {
        toolId,
        usageCount: 0,
        lastUsed: null,
        successCount: 0,
        failureCount: 0,
        averageDuration: 0
      };
    }
    
    return Array.from(this.usageStats.values());
  }
  
  /**
   * 获取执行统计
   */
  public getExecutionStats() {
    // 返回模拟统计信息
    return {
      activeExecutions: 0,
      queuedExecutions: 0,
      completedExecutions: 0,
      failedExecutions: 0,
      totalExecutions: 0,
      averageExecutionTime: 0
    };
  }
  
  /**
   * 清理资源
   */
  public async cleanup(): Promise<void> {
    // streamingExecutor 没有 destroy 方法，跳过
    this.executionResults.clear();
    this.outputChannel.dispose();
  }
  
  // ==================== 私有方法 ====================
  
  /**
   * 加载内置工具
   */
  private async loadBuiltinTools(): Promise<void> {
    this.outputChannel.appendLine('📦 Loading builtin tools...');
    
    // 这里将加载内置工具定义
    // 实际实现中会从特定目录加载
    
    this.outputChannel.appendLine('✅ Builtin tools loaded');
  }
  
  /**
   * 加载用户工具
   */
  private async loadUserTools(): Promise<void> {
    this.outputChannel.appendLine('👤 Loading user tools...');
    
    // 这里将加载用户自定义工具
    // 实际实现中会从用户配置目录加载
    
    this.outputChannel.appendLine('✅ User tools loaded');
  }
  
  /**
   * 加载工具配置
   */
  private async loadToolConfigs(): Promise<void> {
    this.outputChannel.appendLine('⚙️ Loading tool configurations...');
    
    // 这里将加载工具配置
    // 实际实现中会从配置文件加载
    
    this.outputChannel.appendLine('✅ Tool configurations loaded');
  }
  
  /**
   * 创建进度流（简化实现）
   */
  private async *createProgressStream(executionId: string): AsyncIterable<ToolProgress> {
    // 简化实现：不返回任何进度
    // 在实际实现中，应该从执行器的事件系统获取进度
    return;
  }
  
  /**
   * 处理工具进度
   */
  private handleToolProgress(toolId: string, progress: ToolProgress): void {
    // 这里可以处理进度更新，比如更新UI、记录日志等
    if (progress.type === 'error') {
      this.outputChannel.appendLine(`❌ Tool ${toolId} error: ${JSON.stringify(progress.data)}`);
    }
  }
  
  /**
   * 处理工具完成
   */
  private handleToolComplete(toolId: string, result: any, error?: Error): void {
    // 记录执行结果
    const executionResult: ToolExecutionResult = {
      toolId,
      executionId: toolId, // 这里应该使用实际的executionId
      success: !error,
      result,
      error,
      duration: 0, // 需要从执行器获取实际时长
      timestamp: new Date()
    };
    
    this.executionResults.set(toolId, executionResult);
    
    if (error) {
      this.outputChannel.appendLine(`❌ Tool ${toolId} execution failed: ${error.message}`);
    } else {
      this.outputChannel.appendLine(`✅ Tool ${toolId} execution completed`);
    }
  }
  
  /**
   * 更新使用统计
   */
  private updateUsageStats(toolId: string, event: 'start' | 'success' | 'failure'): void {
    const stats = this.usageStats.get(toolId);
    if (!stats) {
      return;
    }
    
    switch (event) {
      case 'start':
        stats.usageCount++;
        stats.lastUsed = new Date();
        break;
      case 'success':
        stats.successCount++;
        break;
      case 'failure':
        stats.failureCount++;
        break;
    }
    
    this.usageStats.set(toolId, stats);
  }
  
  /**
   * 查找工具（按名称）
   */
  public findToolByName(name: string): Tool | undefined {
    return findToolByName(this.tools, name);
  }
  
  /**
   * 查找工具（按类别）
   */
  public findToolsByCategory(category: ToolCategory): Tool[] {
    return findToolsByCategory(this.tools, category);
  }
}