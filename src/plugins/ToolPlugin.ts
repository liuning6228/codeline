/**
 * 工具插件基类
 * 提供工具插件的默认实现，简化工具插件开发
 * 基于Claude Code CP-20260402-003插件模式
 */

import * as vscode from 'vscode';
import { Tool, ToolContext, ToolDefinition, ToolResult, ToolProgress, ValidationResult, PermissionResult } from '../tools/ToolInterface';
import { Plugin, PluginMetadata, PluginContext, PluginConfigSchema, PluginDependency, ToolPlugin as IToolPlugin } from './PluginInterface';

/**
 * 工具插件配置
 */
export interface ToolPluginConfig {
  /** 是否自动注册工具 */
  autoRegisterTools: boolean;
  /** 工具加载策略 */
  toolLoadingStrategy: 'eager' | 'lazy';
  /** 是否启用工具缓存 */
  enableToolCaching: boolean;
  /** 最大工具数量 */
  maxTools: number;
}

/**
 * 工具插件选项
 */
export interface ToolPluginOptions {
  /** 插件元数据 */
  metadata: PluginMetadata;
  /** 插件配置模式 */
  configSchema?: PluginConfigSchema;
  /** 插件依赖 */
  dependencies?: PluginDependency[];
  /** 工具插件配置 */
  toolConfig?: Partial<ToolPluginConfig>;
}

/**
 * 工具插件基类
 */
export abstract class ToolPlugin implements IToolPlugin {
  public readonly metadata: PluginMetadata;
  public readonly configSchema?: PluginConfigSchema;
  public readonly dependencies?: PluginDependency[];
  
  protected tools = new Map<string, Tool>();
  protected toolDefinitions = new Map<string, ToolDefinition>();
  protected context: PluginContext | null = null;
  protected config: ToolPluginConfig;
  
  constructor(options: ToolPluginOptions) {
    this.metadata = options.metadata;
    this.configSchema = options.configSchema;
    this.dependencies = options.dependencies;
    
    this.config = {
      autoRegisterTools: true,
      toolLoadingStrategy: 'eager',
      enableToolCaching: true,
      maxTools: 100,
      ...options.toolConfig,
    };
  }

  /**
   * 插件激活
   */
  public async activate(context: PluginContext): Promise<void> {
    this.context = context;
    
    context.outputChannel.appendLine(`🚀 Activating tool plugin: ${this.metadata.name}`);
    
    // 加载工具定义
    await this.loadToolDefinitions();
    
    // 创建工具实例
    await this.createTools();
    
    context.outputChannel.appendLine(`✅ Tool plugin activated: ${this.metadata.name} (${this.tools.size} tools)`);
  }

  /**
   * 插件停用
   */
  public async deactivate(): Promise<void> {
    if (this.context) {
      this.context.outputChannel.appendLine(`⏸️ Deactivating tool plugin: ${this.metadata.name}`);
    }
    
    // 清理工具资源
    await this.cleanupTools();
    
    // 清空工具集合
    this.tools.clear();
    this.toolDefinitions.clear();
    
    if (this.context) {
      this.context.outputChannel.appendLine(`✅ Tool plugin deactivated: ${this.metadata.name}`);
    }
    
    this.context = null;
  }

  /**
   * 获取插件提供的工具
   */
  public getTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * 获取工具定义
   */
  public getToolDefinitions(): ToolDefinition[] {
    return Array.from(this.toolDefinitions.values());
  }

  /**
   * 注册工具到注册表
   */
  public async registerTools(registry: any): Promise<void> {
    if (!this.context) {
      throw new Error('Plugin not activated');
    }
    
    this.context.outputChannel.appendLine(`📝 Registering tools from ${this.metadata.name}...`);
    
    let registeredCount = 0;
    for (const [toolId, tool] of this.tools.entries()) {
      try {
        // 这里需要根据实际的注册表API进行调整
        // 假设注册表有一个registerTool方法
        if (typeof registry.registerTool === 'function') {
          await registry.registerTool(tool);
          registeredCount++;
        } else {
          this.context.outputChannel.appendLine(`⚠️ Registry does not have registerTool method`);
          break;
        }
      } catch (error) {
        this.context.outputChannel.appendLine(`❌ Failed to register tool ${toolId}: ${error}`);
      }
    }
    
    this.context.outputChannel.appendLine(`✅ Registered ${registeredCount} tools from ${this.metadata.name}`);
  }

  /**
   * 从注册表卸载工具
   */
  public async unregisterTools(registry: any): Promise<void> {
    if (!this.context) {
      throw new Error('Plugin not activated');
    }
    
    this.context.outputChannel.appendLine(`🗑️ Unregistering tools from ${this.metadata.name}...`);
    
    let unregisteredCount = 0;
    for (const [toolId] of this.tools.entries()) {
      try {
        // 这里需要根据实际的注册表API进行调整
        // 假设注册表有一个unregisterTool方法
        if (typeof registry.unregisterTool === 'function') {
          await registry.unregisterTool(toolId);
          unregisteredCount++;
        } else {
          this.context.outputChannel.appendLine(`⚠️ Registry does not have unregisterTool method`);
          break;
        }
      } catch (error) {
        this.context.outputChannel.appendLine(`❌ Failed to unregister tool ${toolId}: ${error}`);
      }
    }
    
    this.context.outputChannel.appendLine(`✅ Unregistered ${unregisteredCount} tools from ${this.metadata.name}`);
  }

  /**
   * 插件配置更新
   */
  public async updateConfig(newConfig: any): Promise<void> {
    // 合并配置
    const mergedConfig = { ...this.config, ...newConfig };
    this.config = mergedConfig;
    
    if (this.context) {
      this.context.outputChannel.appendLine(`⚙️ Updated config for plugin: ${this.metadata.name}`);
      
      // 配置变更后重新加载工具
      if (newConfig.toolLoadingStrategy !== this.config.toolLoadingStrategy) {
        await this.reloadTools();
      }
    }
  }

  /**
   * 插件健康检查
   */
  public async healthCheck(): Promise<{
    healthy: boolean;
    message?: string;
    details?: Record<string, any>;
  }> {
    const toolCount = this.tools.size;
    const definitionCount = this.toolDefinitions.size;
    
    const healthy = toolCount > 0 && toolCount === definitionCount;
    
    return {
      healthy,
      message: healthy 
        ? `Plugin ${this.metadata.name} is healthy (${toolCount} tools)` 
        : `Plugin ${this.metadata.name} has issues (tools: ${toolCount}, definitions: ${definitionCount})`,
      details: {
        toolCount,
        definitionCount,
        config: this.config,
      },
    };
  }

  // ========== 抽象方法 ==========
  
  /**
   * 加载工具定义
   * 子类必须实现此方法以提供工具定义
   */
  protected abstract loadToolDefinitions(): Promise<void>;
  
  /**
   * 创建工具实例
   * 子类可以实现此方法以自定义工具创建逻辑
   */
  protected async createTools(): Promise<void> {
    if (!this.context) {
      throw new Error('Plugin context not available');
    }
    
    for (const [toolId, definition] of this.toolDefinitions.entries()) {
      try {
        const tool = this.createToolFromDefinition(definition);
        this.tools.set(toolId, tool);
      } catch (error) {
        this.context.outputChannel.appendLine(`❌ Failed to create tool ${toolId}: ${error}`);
      }
    }
  }
  
  /**
   * 清理工具资源
   * 子类可以实现此方法以清理工具资源
   */
  protected async cleanupTools(): Promise<void> {
    // 默认实现不执行任何操作
  }

  // ========== 受保护方法 ==========
  
  /**
   * 添加工具定义
   */
  protected addToolDefinition(definition: ToolDefinition): void {
    this.toolDefinitions.set(definition.id, definition);
  }
  
  /**
   * 添加工具
   */
  protected addTool(tool: Tool): void {
    this.tools.set(tool.id, tool);
  }
  
  /**
   * 从定义创建工具
   */
  protected createToolFromDefinition(definition: ToolDefinition): Tool {
    // 创建工具实例
    const tool: Tool = {
      id: definition.id,
      name: definition.name,
      description: definition.description,
      version: definition.version,
      author: definition.author,
      capabilities: definition.capabilities,
      parameterSchema: definition.parameterSchema,
      
      isEnabled: definition.isEnabled || (() => true),
      isConcurrencySafe: definition.isConcurrencySafe,
      isReadOnly: definition.isReadOnly,
      isDestructive: definition.isDestructive,
      
      checkPermissions: definition.checkPermissions || this.defaultCheckPermissions,
      validateParameters: definition.validateParameters || this.defaultValidateParameters,
      execute: definition.execute,
      
      cancel: definition.cancel,
      getDisplayName: definition.getDisplayName || ((params?: any) => definition.name),
      getActivityDescription: definition.getActivityDescription || ((params: any) => definition.description),
    };
    
    return tool;
  }
  
  /**
   * 重新加载工具
   */
  protected async reloadTools(): Promise<void> {
    if (!this.context) {
      return;
    }
    
    this.context.outputChannel.appendLine(`🔄 Reloading tools for ${this.metadata.name}...`);
    
    // 清理现有工具
    await this.cleanupTools();
    this.tools.clear();
    this.toolDefinitions.clear();
    
    // 重新加载
    await this.loadToolDefinitions();
    await this.createTools();
    
    this.context.outputChannel.appendLine(`✅ Reloaded ${this.tools.size} tools for ${this.metadata.name}`);
  }

  // ========== 默认工具方法 ==========
  
  /**
   * 默认权限检查方法
   */
  protected async defaultCheckPermissions(
    params: any,
    context: ToolContext
  ): Promise<PermissionResult> {
    return {
      allowed: true,
      reason: 'Default permission check passed',
    };
  }
  
  /**
   * 默认参数验证方法
   */
  protected async defaultValidateParameters(
    params: any,
    context: ToolContext
  ): Promise<ValidationResult> {
    return {
      valid: true,
    };
  }
  
  /**
   * 创建默认工具结果
   */
  protected createToolResult<T = any>(
    success: boolean,
    options: {
      output?: T;
      error?: string;
      toolId: string;
      duration: number;
      metadata?: Record<string, any>;
    }
  ): ToolResult<T> {
    return {
      success,
      output: options.output,
      error: options.error,
      toolId: options.toolId,
      duration: options.duration,
      timestamp: new Date(),
      metadata: options.metadata,
    };
  }
  
  /**
   * 创建工具进度
   */
  protected createToolProgress(
    type: string,
    progress: number,
    message?: string,
    data?: Record<string, any>
  ): ToolProgress {
    return {
      type,
      progress,
      message,
      data,
    };
  }
  
  /**
   * 获取插件上下文
   */
  protected getPluginContext(): PluginContext {
    if (!this.context) {
      throw new Error('Plugin context not available');
    }
    return this.context;
  }
  
  /**
   * 获取全局上下文
   */
  protected getGlobalContext(): ToolContext {
    if (!this.context) {
      throw new Error('Plugin context not available');
    }
    return this.context.globalContext;
  }
}