/**
 * 插件化工具注册表
 * 扩展ToolRegistry以支持插件化工具管理
 * 基于Claude Code CP-20260402-003插件模式
 * 使用组合模式而非继承
 */

import * as vscode from 'vscode';
import { Tool, ToolContext, ToolCategory, ToolDefinition } from '../tools/ToolInterface';
import { ToolRegistry, ToolRegistryConfig } from '../tools/ToolRegistry';
import { PluginManager } from './PluginManager';
import { Plugin, ToolPlugin } from './PluginInterface';

/**
 * 插件化工具注册表配置
 */
export interface PluginToolRegistryConfig extends ToolRegistryConfig {
  /** 是否启用插件支持 */
  enablePluginSupport: boolean;
  /** 插件管理器配置 */
  pluginManagerConfig?: any;
  /** 自动加载插件 */
  autoLoadPlugins: boolean;
  /** 插件工具前缀 */
  pluginToolPrefix: string;
}

/**
 * 插件化工具注册表
 */
export class PluginToolRegistry {
  private toolRegistry: ToolRegistry;
  private pluginManager: PluginManager | null = null;
  private pluginTools = new Map<string, { pluginId: string; originalToolId: string }>();
  private config: PluginToolRegistryConfig;
  private outputChannel: vscode.OutputChannel;

  constructor(config?: Partial<PluginToolRegistryConfig>) {
    const mergedConfig: PluginToolRegistryConfig = {
      enableCaching: true,
      enableLazyLoading: true,
      defaultCategories: Object.values(ToolCategory),
      excludeToolIds: [],
      includeToolIds: [],
      enablePluginSupport: true,
      autoLoadPlugins: true,
      pluginToolPrefix: 'plugin:',
      ...config,
    };
    
    this.config = mergedConfig;
    this.outputChannel = vscode.window.createOutputChannel('CodeLine Plugin Tool Registry');
    this.toolRegistry = new ToolRegistry(mergedConfig);
  }

  /**
   * 初始化插件化工具注册表
   */
  public async initializeWithPlugins(
    extensionContext: vscode.ExtensionContext,
    globalContext: ToolContext
  ): Promise<boolean> {
    // 先初始化工具注册表
    const registryInitialized = await this.toolRegistry.initialize();
    if (!registryInitialized) {
      return false;
    }

    // 初始化插件管理器
    if (this.config.enablePluginSupport) {
      await this.initializePluginManager(extensionContext, globalContext);
    }

    return true;
  }

  /**
   * 初始化插件管理器
   */
  private async initializePluginManager(
    extensionContext: vscode.ExtensionContext,
    globalContext: ToolContext
  ): Promise<void> {
    this.pluginManager = new PluginManager(extensionContext, globalContext, this.config.pluginManagerConfig);
    
    // 添加插件生命周期监听器
    this.pluginManager.addLifecycleListener((event) => {
      this.handlePluginLifecycleEvent(event);
    });
    
    // 初始化插件管理器
    await this.pluginManager.initialize();
    
    this.outputChannel.appendLine('🔌 Plugin Manager initialized');
  }

  /**
   * 处理插件生命周期事件
   */
  private handlePluginLifecycleEvent(event: any): void {
    const { pluginId, type } = event;
    
    switch (type) {
      case 'activated':
        this.handlePluginActivated(pluginId);
        break;
      case 'deactivated':
        this.handlePluginDeactivated(pluginId);
        break;
      case 'unloaded':
        this.handlePluginUnloaded(pluginId);
        break;
      case 'error':
        this.outputChannel.appendLine(`⚠️ Plugin ${pluginId} error: ${event.error}`);
        break;
    }
  }

  /**
   * 处理插件激活
   */
  private async handlePluginActivated(pluginId: string): Promise<void> {
    if (!this.pluginManager) {
      return;
    }

    const plugin = this.pluginManager.getPlugin(pluginId);
    if (!plugin) {
      return;
    }

    this.outputChannel.appendLine(`🔌 Plugin activated: ${pluginId}`);

    // 如果是工具插件，注册其工具
    if (this.isToolPlugin(plugin)) {
      await this.registerPluginTools(pluginId, plugin);
    }
  }

  /**
   * 处理插件停用
   */
  private async handlePluginDeactivated(pluginId: string): Promise<void> {
    this.outputChannel.appendLine(`🔌 Plugin deactivated: ${pluginId}`);
    
    // 卸载插件工具
    await this.unregisterPluginTools(pluginId);
  }

  /**
   * 处理插件卸载
   */
  private async handlePluginUnloaded(pluginId: string): Promise<void> {
    this.outputChannel.appendLine(`🔌 Plugin unloaded: ${pluginId}`);
    
    // 清理插件工具记录
    await this.cleanupPluginTools(pluginId);
  }

  /**
   * 注册插件工具
   */
  private async registerPluginTools(pluginId: string, plugin: ToolPlugin): Promise<void> {
    try {
      // 获取插件工具
      const tools = plugin.getTools();
      
      for (const tool of tools) {
        // 为插件工具添加前缀，避免ID冲突
        const prefixedToolId = this.getPrefixedToolId(pluginId, tool.id);
        
        // 克隆工具并更新ID
        const pluginTool = this.createPluginTool(pluginId, tool, prefixedToolId);
        
        // 注册工具
        const registered = await this.toolRegistry.registerToolDefinition({
          ...pluginTool,
          id: prefixedToolId,
        });
        
        if (registered) {
          this.pluginTools.set(prefixedToolId, { pluginId, originalToolId: tool.id });
          this.outputChannel.appendLine(`🔧 Registered plugin tool: ${prefixedToolId} (from ${pluginId})`);
        }
      }
      
      this.outputChannel.appendLine(`✅ Registered ${tools.length} tools from plugin ${pluginId}`);
    } catch (error) {
      this.outputChannel.appendLine(`❌ Failed to register tools from plugin ${pluginId}: ${error}`);
    }
  }

  /**
   * 卸载插件工具
   */
  private async unregisterPluginTools(pluginId: string): Promise<void> {
    const toolsToRemove: string[] = [];
    
    // 查找属于该插件的所有工具
    for (const [prefixedToolId, info] of this.pluginTools.entries()) {
      if (info.pluginId === pluginId) {
        toolsToRemove.push(prefixedToolId);
      }
    }
    
    // 卸载工具
    for (const toolId of toolsToRemove) {
      // 由于ToolRegistry没有unregister方法，我们只能标记为不启用
      // 实际实现中可能需要扩展ToolRegistry添加unregister功能
      this.outputChannel.appendLine(`⚠️ Note: ToolRegistry does not support unregister, tool ${toolId} remains registered but disabled`);
      this.pluginTools.delete(toolId);
    }
    
    if (toolsToRemove.length > 0) {
      this.outputChannel.appendLine(`✅ Marked ${toolsToRemove.length} tools from plugin ${pluginId} for removal`);
    }
  }

  /**
   * 清理插件工具记录
   */
  private async cleanupPluginTools(pluginId: string): Promise<void> {
    const toolsToRemove: string[] = [];
    
    for (const [prefixedToolId, info] of this.pluginTools.entries()) {
      if (info.pluginId === pluginId) {
        toolsToRemove.push(prefixedToolId);
      }
    }
    
    for (const toolId of toolsToRemove) {
      this.pluginTools.delete(toolId);
    }
  }

  /**
   * 创建插件工具
   */
  private createPluginTool(pluginId: string, originalTool: Tool, prefixedToolId: string): Tool {
    // 创建工具副本
    const pluginTool: Tool = {
      ...originalTool,
      id: prefixedToolId,
      
      // 包装执行方法，添加插件上下文
      execute: async (params: Record<string, any>, context: ToolContext, onProgress?: any) => {
        // 添加插件ID到上下文
        const enhancedContext = {
          ...context,
          pluginId,
          originalToolId: originalTool.id,
        };
        
        // 调用原始工具的执行方法
        return originalTool.execute(params, enhancedContext, onProgress);
      },
      
      // 包装权限检查方法
      checkPermissions: async (params: Record<string, any>, context: ToolContext) => {
        // 添加插件ID到上下文
        const enhancedContext = {
          ...context,
          pluginId,
          originalToolId: originalTool.id,
        };
        
        if (originalTool.checkPermissions) {
          return originalTool.checkPermissions(params, enhancedContext);
        } else {
          // 默认权限检查
          return {
            allowed: true,
            reason: 'Default permission check passed',
          };
        }
      },
      
      // 包装参数验证方法
      validateParameters: async (params: Record<string, any>, context: ToolContext) => {
        // 添加插件ID到上下文
        const enhancedContext = {
          ...context,
          pluginId,
          originalToolId: originalTool.id,
        };
        
        if (originalTool.validateParameters) {
          return originalTool.validateParameters(params, enhancedContext);
        } else {
          // 默认参数验证
          return {
            valid: true,
          };
        }
      },
      
      // 包装显示名称方法
      getDisplayName: (params?: Record<string, any>) => {
        if (originalTool.getDisplayName) {
          const name = originalTool.getDisplayName(params);
          return `[${pluginId}] ${name}`;
        } else {
          return `[${pluginId}] ${originalTool.name}`;
        }
      },
      
      // 包装活动描述方法
      getActivityDescription: (params: Record<string, any>) => {
        if (originalTool.getActivityDescription) {
          const description = originalTool.getActivityDescription(params);
          return `Plugin ${pluginId}: ${description}`;
        } else {
          return `Plugin ${pluginId}: ${originalTool.description}`;
        }
      },
    };
    
    return pluginTool;
  }

  /**
   * 获取带前缀的工具ID
   */
  private getPrefixedToolId(pluginId: string, toolId: string): string {
    return `${this.config.pluginToolPrefix}${pluginId}:${toolId}`;
  }

  /**
   * 检查是否为工具插件
   */
  private isToolPlugin(plugin: Plugin): plugin is ToolPlugin {
    return 'registerTools' in plugin && 'unregisterTools' in plugin;
  }

  /**
   * 获取工具注册表
   */
  public getToolRegistry(): ToolRegistry {
    return this.toolRegistry;
  }

  /**
   * 获取插件管理器
   */
  public getPluginManager(): PluginManager | null {
    return this.pluginManager;
  }

  /**
   * 加载插件
   */
  public async loadPlugin(pluginPath: string): Promise<void> {
    if (!this.pluginManager) {
      throw new Error('Plugin manager not initialized');
    }
    
    await this.pluginManager.loadPlugin(pluginPath);
  }

  /**
   * 卸载插件
   */
  public async unloadPlugin(pluginId: string): Promise<void> {
    if (!this.pluginManager) {
      throw new Error('Plugin manager not initialized');
    }
    
    await this.pluginManager.unloadPlugin(pluginId);
  }

  /**
   * 获取插件工具信息
   */
  public getPluginToolInfo(toolId: string): { pluginId: string; originalToolId: string } | null {
    return this.pluginTools.get(toolId) || null;
  }

  /**
   * 获取所有插件工具
   */
  public getPluginTools(): Map<string, { pluginId: string; originalToolId: string }> {
    return new Map(this.pluginTools);
  }

  /**
   * 关闭插件化工具注册表
   */
  public async closeWithPlugins(): Promise<void> {
    // 关闭插件管理器
    if (this.pluginManager) {
      await this.pluginManager.close();
      this.pluginManager = null;
    }
    
    // 清理插件工具记录
    this.pluginTools.clear();
    
    // 关闭工具注册表
    await this.toolRegistry.close();
    
    this.outputChannel.appendLine('🔌 Plugin Tool Registry closed');
    this.outputChannel.dispose();
  }

  /**
   * 获取插件化工具注册表状态
   */
  public getPluginRegistryState(): {
    pluginManagerInitialized: boolean;
    loadedPlugins: number;
    pluginToolsCount: number;
  } {
    const pluginManagerState = this.pluginManager?.getState();
    
    return {
      pluginManagerInitialized: !!this.pluginManager,
      loadedPlugins: pluginManagerState?.loadedPlugins || 0,
      pluginToolsCount: this.pluginTools.size,
    };
  }

  /**
   * 代理ToolRegistry的方法
   */
  public async initialize(): Promise<boolean> {
    return this.toolRegistry.initialize();
  }

  public registerToolDefinition<Input = Record<string, any>, Output = any>(
    definition: ToolDefinition<Input, Output>,
    categories: ToolCategory[] = [ToolCategory.OTHER]
  ): boolean {
    return this.toolRegistry.registerToolDefinition(definition, categories);
  }

  public getTool(toolId: string): Tool | undefined {
    return this.toolRegistry.getTool(toolId);
  }

  public getAllTools(
    context: ToolContext,
    filters?: {
      categories?: ToolCategory[];
      enabledOnly?: boolean;
      searchTerm?: string;
    }
  ): Tool[] {
    return this.toolRegistry.getAllTools(context, filters);
  }

  // 可以根据需要添加更多代理方法
}