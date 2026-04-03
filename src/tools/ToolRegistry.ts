/**
 * 工具注册表
 * 管理所有工具的注册、发现和生命周期
 */

import * as vscode from 'vscode';
import { Tool, ToolContext, ToolCategory, ToolDefinition, PermissionResult, ValidationResult } from './ToolInterface';

/**
 * 工具注册表配置
 */
export interface ToolRegistryConfig {
  enableCaching: boolean;
  enableLazyLoading: boolean;
  defaultCategories: ToolCategory[];
  excludeToolIds: string[];
  includeToolIds: string[];
}

/**
 * 工具注册表
 */
export class ToolRegistry {
  private tools = new Map<string, Tool>();
  private toolCategories = new Map<ToolCategory, Set<string>>();
  private aliases = new Map<string, string>();
  private initialized = false;
  private outputChannel: vscode.OutputChannel;
  private config: ToolRegistryConfig;

  constructor(config?: Partial<ToolRegistryConfig>) {
    this.outputChannel = vscode.window.createOutputChannel('CodeLine Tool Registry');
    this.config = {
      enableCaching: true,
      enableLazyLoading: true,
      defaultCategories: Object.values(ToolCategory),
      excludeToolIds: [],
      includeToolIds: [],
      ...config,
    };
  }

  /**
   * 初始化工具注册表
   */
  public async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }
    try {
      this.outputChannel.appendLine('🛠️ Initializing Tool Registry...');
      this.initialized = true;
      this.outputChannel.appendLine('✅ Tool Registry initialized');
      return true;
    } catch (error: any) {
      this.outputChannel.appendLine(`❌ Tool Registry initialization failed: ${error.message}`);
      return false;
    }
  }

  /**
   * 注册工具定义
   */
  public registerToolDefinition<Input = Record<string, any>, Output = any>(
    definition: ToolDefinition<Input, Output>,
    categories: ToolCategory[] = [ToolCategory.OTHER]
  ): boolean {
    try {
      const tool: Tool = {
        id: definition.id,
        name: definition.name,
        description: definition.description,
        version: definition.version,
        author: definition.author,
        capabilities: definition.capabilities,
        parameterSchema: definition.parameterSchema,
        isEnabled: definition.isEnabled || ((context: ToolContext) => true),
        isConcurrencySafe: definition.isConcurrencySafe || ((context: ToolContext) => false),
        isReadOnly: definition.isReadOnly || ((context: ToolContext) => false),
        isDestructive: definition.isDestructive || ((context: ToolContext) => false),
        checkPermissions: (definition.checkPermissions as any) || (async (params: any, context: ToolContext): Promise<PermissionResult> => ({
          allowed: true,
          requiresUserConfirmation: false,
        })),
        validateParameters: (definition.validateParameters as any) || (async (params: any, context: ToolContext): Promise<ValidationResult> => ({
          valid: true,
        })),
        execute: definition.execute as any,
        cancel: definition.cancel,
        getDisplayName: definition.getDisplayName 
          ? (definition.getDisplayName as (params?: Record<string, any>) => string)
          : ((params?: Record<string, any>) => definition.name),
        getActivityDescription: definition.getActivityDescription
          ? (definition.getActivityDescription as (params: Record<string, any>) => string)
          : ((params: Record<string, any>) => definition.description),
      };
      return this.registerTool(tool, categories);
    } catch (error: any) {
      this.outputChannel.appendLine(`❌ Failed to register tool definition ${definition.id}: ${error.message}`);
      return false;
    }
  }

  /**
   * 注册工具实例
   */
  public registerTool(tool: Tool, categories: ToolCategory[] = [ToolCategory.OTHER]): boolean {
    if (this.tools.has(tool.id)) {
      this.outputChannel.appendLine(`⚠️ Tool ${tool.id} already registered`);
      return false;
    }
    this.tools.set(tool.id, tool);
    for (const category of categories) {
      let categorySet = this.toolCategories.get(category);
      if (!categorySet) {
        categorySet = new Set<string>();
        this.toolCategories.set(category, categorySet);
      }
      categorySet.add(tool.id);
    }
    this.outputChannel.appendLine(`✅ Registered tool: ${tool.id} (${tool.name})`);
    return true;
  }

  /**
   * 获取工具
   */
  public getTool(toolIdOrAlias: string): Tool | undefined {
    if (this.tools.has(toolIdOrAlias)) {
      return this.tools.get(toolIdOrAlias);
    }
    const actualToolId = this.aliases.get(toolIdOrAlias);
    if (actualToolId) {
      return this.tools.get(actualToolId);
    }
    return undefined;
  }

  /**
   * 执行工具
   */
  public async executeTool(
    toolId: string,
    params: Record<string, any>,
    context: ToolContext,
    onProgress?: (progress: any) => void
  ): Promise<any> {
    const tool = this.getTool(toolId);
    if (!tool) {
      throw new Error(`Tool ${toolId} not found`);
    }
    if (!tool.isEnabled(context)) {
      throw new Error(`Tool ${toolId} is not enabled in current context`);
    }
    const permissionResult = await tool.checkPermissions(params, context);
    if (!permissionResult.allowed) {
      throw new Error(`Permission denied for tool ${toolId}: ${permissionResult.reason || 'No reason provided'}`);
    }
    const validationResult = await tool.validateParameters(params, context);
    if (!validationResult.valid) {
      throw new Error(`Invalid parameters for tool ${toolId}: ${validationResult.error || 'Validation failed'}`);
    }
    if (onProgress) {
      onProgress({ progress: 0, message: 'Starting execution' });
    }
    try {
      const result = await tool.execute(params, context, onProgress);
      if (onProgress) {
        onProgress({ progress: 1, message: 'Execution completed' });
      }
      return result;
    } catch (error: any) {
      if (onProgress) {
        onProgress({ progress: 0, message: `Execution failed: ${error.message}` });
      }
      throw error;
    }
  }

  /**
   * 获取注册表状态
   */
  public getStatus(): {
    initialized: boolean;
    toolCount: number;
    categoryCount: number;
    aliasCount: number;
  } {
    return {
      initialized: this.initialized,
      toolCount: this.tools.size,
      categoryCount: this.toolCategories.size,
      aliasCount: this.aliases.size,
    };
  }

  /**
   * 注册工具别名
   */
  public registerAlias(toolId: string, alias: string): boolean {
    if (!this.tools.has(toolId)) {
      this.outputChannel.appendLine(`⚠️ Cannot register alias for unknown tool: ${toolId}`);
      return false;
    }
    if (this.aliases.has(alias)) {
      this.outputChannel.appendLine(`⚠️ Alias ${alias} already registered`);
      return false;
    }
    this.aliases.set(alias, toolId);
    this.outputChannel.appendLine(`🏷️ Registered alias: ${alias} -> ${toolId}`);
    return true;
  }

  /**
   * 获取所有工具
   */
  public getAllTools(context: ToolContext, filters?: {
    categories?: ToolCategory[];
    enabledOnly?: boolean;
    searchTerm?: string;
  }): Tool[] {
    const { categories = this.config.defaultCategories, enabledOnly = true, searchTerm = '' } = filters || {};
    const result: Tool[] = [];
    for (const [toolId, tool] of this.tools.entries()) {
      let inCategory = false;
      for (const category of categories) {
        const categorySet = this.toolCategories.get(category);
        if (categorySet && categorySet.has(toolId)) {
          inCategory = true;
          break;
        }
      }
      if (!inCategory && categories.length > 0) {
        continue;
      }
      if (enabledOnly && !tool.isEnabled(context)) {
        continue;
      }
      if (searchTerm && !tool.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !tool.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        continue;
      }
      result.push(tool);
    }
    return result;
  }

  /**
   * 清空注册表
   */
  public clear(): void {
    this.tools.clear();
    this.toolCategories.clear();
    this.aliases.clear();
    this.outputChannel.appendLine('🗑️ Tool Registry cleared');
  }

  /**
   * 关闭注册表
   */
  public async close(): Promise<void> {
    this.outputChannel.appendLine('🔒 Tool Registry closed');
    this.outputChannel.dispose();
    this.initialized = false;
  }
}