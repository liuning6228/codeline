/**
 * EnhancedToolRegistry完整模拟 - 任务2.1
 * 
 * 实现完整的EnhancedToolRegistry接口，支持真实EnhancedEngineAdapter所需的所有功能
 */

import { Tool, ToolDefinition, Tools, ToolUseContext, ToolCategory, buildTool } from '../types/ToolTypes';

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

/**
 * 增强工具注册表模拟
 */
export class MockEnhancedToolRegistry {
  private tools: Tools = new Map();
  private toolCategories: Map<ToolCategory, Set<string>> = new Map();
  private toolAliases: Map<string, string> = new Map();
  private initialized = false;
  private config: ToolRegistryConfig;
  private executionResults: Map<string, ToolExecutionResult> = new Map();
  private usageStats: Map<string, ToolUsageStats> = new Map();
  
  constructor(config?: Partial<ToolRegistryConfig>) {
    this.config = {
      enableCaching: true,
      enableLazyLoading: true,
      defaultCategories: Object.values(ToolCategory) as ToolCategory[],
      excludeToolIds: [],
      includeToolIds: [],
      maxConcurrentTools: 3,
      defaultTimeout: 30000,
      ...config,
    };
    
    // 初始化类别映射
    for (const category of this.config.defaultCategories) {
      this.toolCategories.set(category, new Set());
    }
    
    console.log('MockEnhancedToolRegistry: 初始化完成');
  }
  
  /**
   * 初始化工具注册表
   */
  public async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }
    
    console.log('MockEnhancedToolRegistry: 开始初始化');
    
    try {
      // 加载模拟工具
      await this.loadMockTools();
      this.initialized = true;
      console.log('MockEnhancedToolRegistry: 初始化成功');
      return true;
    } catch (error) {
      console.error('MockEnhancedToolRegistry: 初始化失败', error);
      return false;
    }
  }
  
  /**
   * 加载模拟工具
   */
  private async loadMockTools(): Promise<void> {
    // 添加一些基本的模拟工具
    const mockTools: ToolDefinition[] = [
      {
        id: 'read_file',
        name: 'Read File',
        description: '读取文件内容',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: '文件路径' }
          },
          required: ['path']
        },
        category: ToolCategory.FILE
      },
      {
        id: 'write_file',
        name: 'Write File',
        description: '写入文件内容',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: '文件路径' },
            content: { type: 'string', description: '文件内容' }
          },
          required: ['path', 'content']
        },
        category: ToolCategory.FILE
      },
      {
        id: 'execute_command',
        name: 'Execute Command',
        description: '执行终端命令',
        parameters: {
          type: 'object',
          properties: {
            command: { type: 'string', description: '终端命令' }
          },
          required: ['command']
        },
        category: ToolCategory.TERMINAL
      },
      {
        id: 'analyze_code',
        name: 'Analyze Code',
        description: '分析代码结构',
        parameters: {
          type: 'object',
          properties: {
            code: { type: 'string', description: '代码内容' }
          },
          required: ['code']
        },
        category: ToolCategory.CODE
      }
    ];
    
    for (const toolDef of mockTools) {
      const tool = this.createMockTool(toolDef);
      this.registerTool(tool, [toolDef.category]);
    }
    
    console.log(`MockEnhancedToolRegistry: 加载了 ${mockTools.length} 个模拟工具`);
  }
  
  /**
   * 创建模拟工具
   */
  private createMockTool(toolDef: ToolDefinition): Tool {
    const executeFn = async (args: any, context?: ToolUseContext): Promise<any> => {
      const startTime = Date.now();
      const executionId = `exec-${toolDef.id}-${Date.now()}`;
      
      console.log(`MockEnhancedToolRegistry: 执行工具 ${toolDef.id}`, args);
      
      try {
        let result: any;
        
        // 根据不同工具ID返回模拟结果
        switch (toolDef.id) {
          case 'read_file':
            result = { content: `模拟文件内容: ${args.path}`, success: true };
            break;
          case 'write_file':
            result = { success: true, bytesWritten: args.content?.length || 0, path: args.path };
            break;
          case 'execute_command':
            result = { stdout: `模拟命令输出: ${args.command}`, stderr: '', exitCode: 0 };
            break;
          case 'analyze_code':
            result = { 
              analysis: { 
                lines: (args.code || '').split('\n').length,
                issues: [],
                suggestions: ['建议添加注释', '考虑重构复杂逻辑']
              } 
            };
            break;
          default:
            result = { success: true, message: '工具执行成功' };
        }
        
        const duration = Date.now() - startTime;
        
        // 记录执行结果
        const executionResult: ToolExecutionResult = {
          toolId: toolDef.id,
          executionId,
          success: true,
          result,
          duration,
          timestamp: new Date()
        };
        this.executionResults.set(executionId, executionResult);
        
        // 更新使用统计
        this.updateUsageStats(toolDef.id, true, duration);
        
        return result;
      } catch (error: any) {
        const duration = Date.now() - startTime;
        
        // 记录失败结果
        const executionResult: ToolExecutionResult = {
          toolId: toolDef.id,
          executionId,
          success: false,
          error,
          duration,
          timestamp: new Date()
        };
        this.executionResults.set(executionId, executionResult);
        
        // 更新使用统计
        this.updateUsageStats(toolDef.id, false, duration);
        
        throw error;
      }
    };
    
    // 构建工具对象
    return {
      ...toolDef,
      execute: executeFn,
      validateParameters: (params: any) => ({ valid: true, errors: [] })
    };
  }
  
  /**
   * 注册工具
   */
  public registerTool(tool: Tool, categories: ToolCategory[] = [ToolCategory.OTHER]): boolean {
    if (this.tools.has(tool.id)) {
      console.warn(`MockEnhancedToolRegistry: 工具 ${tool.id} 已存在`);
      return false;
    }
    
    this.tools.set(tool.id, tool);
    
    // 添加工具到类别
    for (const category of categories) {
      if (!this.toolCategories.has(category)) {
        this.toolCategories.set(category, new Set());
      }
      this.toolCategories.get(category)!.add(tool.id);
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
    
    console.log(`MockEnhancedToolRegistry: 注册工具 ${tool.id} (类别: ${categories.join(', ')})`);
    return true;
  }
  
  /**
   * 检查工具是否存在
   */
  public hasTool(toolId: string): boolean {
    return this.tools.has(toolId) || this.toolAliases.has(toolId);
  }
  
  /**
   * 注销工具
   */
  public unregisterTool(toolId: string): boolean {
    const aliasTarget = this.toolAliases.get(toolId);
    const actualToolId = aliasTarget || toolId;
    
    if (!this.tools.has(actualToolId)) {
      return false;
    }
    
    // 从所有类别中移除
    for (const [category, toolSet] of this.toolCategories) {
      toolSet.delete(actualToolId);
    }
    
    // 移除工具
    this.tools.delete(actualToolId);
    
    // 移除相关别名
    const aliasesToRemove: string[] = [];
    for (const [alias, target] of this.toolAliases) {
      if (target === actualToolId) {
        aliasesToRemove.push(alias);
      }
    }
    for (const alias of aliasesToRemove) {
      this.toolAliases.delete(alias);
    }
    
    // 移除使用统计
    this.usageStats.delete(actualToolId);
    
    console.log(`MockEnhancedToolRegistry: 注销工具 ${actualToolId}`);
    return true;
  }
  
  /**
   * 注册工具定义
   */
  public registerToolDefinition<Input = any, Output = any>(
    definition: ToolDefinition,
    executor?: (input: Input, context?: ToolUseContext) => Promise<Output>
  ): boolean {
    const tool = this.createMockTool(definition);
    if (executor) {
      tool.execute = async (args: Input, context?: ToolUseContext) => {
        return await executor(args, context);
      };
    }
    return this.registerTool(tool, [definition.category]);
  }
  
  /**
   * 注册工具别名
   */
  public registerToolAlias(alias: string, toolId: string): boolean {
    if (!this.tools.has(toolId)) {
      console.warn(`MockEnhancedToolRegistry: 工具 ${toolId} 不存在，无法注册别名`);
      return false;
    }
    
    this.toolAliases.set(alias, toolId);
    console.log(`MockEnhancedToolRegistry: 注册别名 ${alias} -> ${toolId}`);
    return true;
  }
  
  /**
   * 获取工具
   */
  public getTool(toolId: string): Tool | undefined {
    const aliasTarget = this.toolAliases.get(toolId);
    const actualToolId = aliasTarget || toolId;
    return this.tools.get(actualToolId);
  }
  
  /**
   * 获取所有工具
   */
  public getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }
  
  /**
   * 根据类别获取工具
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
    args: any,
    context?: ToolUseContext,
    options?: any
  ): Promise<any> {
    const tool = this.getTool(toolId);
    if (!tool) {
      throw new Error(`工具 ${toolId} 未找到`);
    }
    
    // 简单模拟流式执行 - 直接调用execute方法
    return await tool.execute(args, context);
  }
  
  /**
   * 执行工具
   */
  public async executeTool(
    toolId: string,
    args: any,
    context?: ToolUseContext
  ): Promise<any> {
    return await this.executeToolStreaming(toolId, args, context);
  }
  
  /**
   * 批量执行工具
   */
  public async executeToolsBatch(
    toolRequests: Array<{ toolId: string; args: any }>,
    context?: ToolUseContext
  ): Promise<any[]> {
    const results = [];
    for (const request of toolRequests) {
      try {
        const result = await this.executeTool(request.toolId, request.args, context);
        results.push(result);
      } catch (error: any) {
        results.push({ success: false, error: error.message });
      }
    }
    return results;
  }
  
  /**
   * 取消工具执行
   */
  public async cancelToolExecution(executionId: string): Promise<boolean> {
    console.log(`MockEnhancedToolRegistry: 取消执行 ${executionId} (模拟操作)`);
    return true;
  }
  
  /**
   * 获取工具执行状态
   */
  public getToolExecutionStatus(executionId: string): {
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    progress?: number;
    result?: any;
    error?: Error;
  } {
    const executionResult = this.executionResults.get(executionId);
    if (!executionResult) {
      return { status: 'pending' };
    }
    
    return {
      status: executionResult.success ? 'completed' : 'failed',
      result: executionResult.result,
      error: executionResult.error
    };
  }
  
  /**
   * 获取工具使用统计
   */
  public getToolUsageStats(toolId?: string): ToolUsageStats | ToolUsageStats[] {
    if (toolId) {
      const stats = this.usageStats.get(toolId);
      if (!stats) {
        throw new Error(`工具 ${toolId} 的使用统计不存在`);
      }
      return stats;
    }
    
    return Array.from(this.usageStats.values());
  }
  
  /**
   * 获取执行统计
   */
  public getExecutionStats() {
    const allResults = Array.from(this.executionResults.values());
    return {
      totalExecutions: allResults.length,
      successfulExecutions: allResults.filter(r => r.success).length,
      failedExecutions: allResults.filter(r => !r.success).length,
      averageDuration: allResults.length > 0 
        ? allResults.reduce((sum, r) => sum + r.duration, 0) / allResults.length 
        : 0
    };
  }
  
  /**
   * 清理资源
   */
  public async cleanup(): Promise<void> {
    console.log('MockEnhancedToolRegistry: 清理资源');
    this.tools.clear();
    this.toolCategories.clear();
    this.toolAliases.clear();
    this.executionResults.clear();
    this.usageStats.clear();
    this.initialized = false;
  }
  
  /**
   * 按名称查找工具
   */
  public findToolByName(name: string): Tool | undefined {
    for (const tool of this.getAllTools()) {
      if (tool.name === name) {
        return tool;
      }
    }
    return undefined;
  }
  
  /**
   * 按类别查找工具
   */
  public findToolsByCategory(category: ToolCategory): Tool[] {
    return this.getToolsByCategory(category);
  }
  
  /**
   * 更新使用统计
   */
  private updateUsageStats(toolId: string, success: boolean, duration: number): void {
    const stats = this.usageStats.get(toolId);
    if (!stats) {
      return;
    }
    
    stats.usageCount++;
    stats.lastUsed = new Date();
    
    if (success) {
      stats.successCount++;
    } else {
      stats.failureCount++;
    }
    
    // 更新平均持续时间
    const totalDuration = stats.averageDuration * (stats.usageCount - 1) + duration;
    stats.averageDuration = totalDuration / stats.usageCount;
  }
}

/**
 * 创建MockEnhancedToolRegistry实例
 */
export function createMockEnhancedToolRegistry(config?: Partial<ToolRegistryConfig>): MockEnhancedToolRegistry {
  return new MockEnhancedToolRegistry(config);
}