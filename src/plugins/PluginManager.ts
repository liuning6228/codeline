/**
 * 插件管理器
 * 负责插件的加载、卸载、激活、停用和生命周期管理
 * 基于Claude Code CP-20260402-003插件模式
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { Plugin, PluginMetadata, PluginContext, PluginLifecycleState, PluginLifecycleEvent, PluginManager as IPluginManager, PluginConfig, PluginDependency } from './PluginInterface';
import { ToolContext } from '../tools/ToolInterface';

/**
 * 插件管理器配置
 */
export interface PluginManagerConfig {
  /** 插件目录 */
  pluginDirs: string[];
  /** 是否启用插件自动发现 */
  autoDiscover: boolean;
  /** 是否启用插件自动加载 */
  autoLoad: boolean;
  /** 是否启用插件依赖检查 */
  enableDependencyCheck: boolean;
  /** 最大插件加载数量 */
  maxPlugins: number;
  /** 插件配置文件名 */
  configFileName: string;
  /** 插件元数据文件名 */
  metadataFileName: string;
}

/**
 * 插件管理器状态
 */
export interface PluginManagerState {
  /** 加载的插件数量 */
  loadedPlugins: number;
  /** 激活的插件数量 */
  activePlugins: number;
  /** 插件状态 */
  pluginStates: Record<string, PluginLifecycleState>;
  /** 最后错误 */
  lastError?: string;
}

/**
 * 插件管理器
 */
export class PluginManager implements IPluginManager {
  private plugins = new Map<string, Plugin>();
  private pluginStates = new Map<string, PluginLifecycleState>();
  private pluginContexts = new Map<string, PluginContext>();
  private pluginConfigs = new Map<string, PluginConfig>();
  private pluginDependencies = new Map<string, PluginDependency[]>();
  private outputChannel: vscode.OutputChannel;
  private config: PluginManagerConfig;
  private globalContext: ToolContext;
  private extensionContext: vscode.ExtensionContext;
  private lifecycleListeners: Array<(event: PluginLifecycleEvent) => void> = [];

  constructor(
    extensionContext: vscode.ExtensionContext,
    globalContext: ToolContext,
    config?: Partial<PluginManagerConfig>
  ) {
    this.extensionContext = extensionContext;
    this.globalContext = globalContext;
    this.outputChannel = vscode.window.createOutputChannel('CodeLine Plugin Manager');
    
    this.config = {
      pluginDirs: [
        path.join(extensionContext.extensionPath, 'plugins'),
        path.join(globalContext.workspaceRoot, '.codeline', 'plugins'),
      ],
      autoDiscover: true,
      autoLoad: true,
      enableDependencyCheck: true,
      maxPlugins: 50,
      configFileName: 'plugin.json',
      metadataFileName: 'package.json',
      ...config,
    };
  }

  /**
   * 初始化插件管理器
   */
  public async initialize(): Promise<void> {
    this.outputChannel.show(true);
    this.outputChannel.appendLine('🔧 Initializing Plugin Manager...');

    // 创建插件目录
    for (const pluginDir of this.config.pluginDirs) {
      try {
        await fs.mkdir(pluginDir, { recursive: true });
        this.outputChannel.appendLine(`📁 Created plugin directory: ${pluginDir}`);
      } catch (error) {
        this.outputChannel.appendLine(`⚠️ Failed to create plugin directory ${pluginDir}: ${error}`);
      }
    }

    // 自动发现并加载插件
    if (this.config.autoDiscover) {
      await this.discoverAndLoadPlugins();
    }

    this.outputChannel.appendLine('✅ Plugin Manager initialized');
  }

  /**
   * 加载插件
   */
  public async loadPlugin(pluginPath: string): Promise<Plugin> {
    const pluginId = path.basename(pluginPath);
    
    // 检查是否已加载
    if (this.plugins.has(pluginId)) {
      throw new Error(`Plugin ${pluginId} is already loaded`);
    }

    // 检查插件目录是否存在
    try {
      await fs.access(pluginPath);
    } catch (error) {
      throw new Error(`Plugin directory ${pluginPath} does not exist: ${error}`);
    }

    this.outputChannel.appendLine(`📦 Loading plugin: ${pluginId}`);

    try {
      // 加载插件元数据
      const metadata = await this.loadPluginMetadata(pluginPath);
      
      // 加载插件配置
      const config = await this.loadPluginConfig(pluginPath, pluginId);
      
      // 加载插件模块
      const pluginModule = await this.loadPluginModule(pluginPath);
      
      // 验证插件接口
      if (!this.validatePlugin(pluginModule)) {
        throw new Error(`Plugin ${pluginId} does not implement the required interface`);
      }

      // 创建插件上下文
      const pluginContext: PluginContext = {
        extensionContext: this.extensionContext,
        pluginDir: pluginPath,
        outputChannel: vscode.window.createOutputChannel(`Plugin: ${metadata.name}`),
        config,
        globalContext: this.globalContext,
        pluginManager: this,
      };

      // 存储插件和上下文
      this.plugins.set(pluginId, pluginModule);
      this.pluginContexts.set(pluginId, pluginContext);
      this.pluginConfigs.set(pluginId, config);
      this.pluginStates.set(pluginId, PluginLifecycleState.LOADED);

      // 触发生命周期事件
      this.emitLifecycleEvent({
        pluginId,
        type: 'loaded',
        timestamp: Date.now(),
      });

      this.outputChannel.appendLine(`✅ Plugin loaded: ${metadata.name} v${metadata.version}`);
      
      // 自动激活插件
      if (this.config.autoLoad) {
        await this.activatePlugin(pluginId);
      }

      return pluginModule;
    } catch (error) {
      this.outputChannel.appendLine(`❌ Failed to load plugin ${pluginId}: ${error}`);
      this.pluginStates.set(pluginId, PluginLifecycleState.ERROR);
      
      this.emitLifecycleEvent({
        pluginId,
        type: 'error',
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : String(error),
      });
      
      throw error;
    }
  }

  /**
   * 卸载插件
   */
  public async unloadPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    this.outputChannel.appendLine(`🗑️ Unloading plugin: ${pluginId}`);

    // 检查依赖关系
    const dependentPlugins = await this.findDependentPlugins(pluginId);
    if (dependentPlugins.length > 0) {
      const dependentNames = dependentPlugins.map(p => p.metadata.name).join(', ');
      throw new Error(`Cannot unload plugin ${pluginId}. The following plugins depend on it: ${dependentNames}`);
    }

    // 停用插件
    const state = this.pluginStates.get(pluginId);
    if (state === PluginLifecycleState.ACTIVATED) {
      await this.deactivatePlugin(pluginId);
    }

    // 执行插件停用方法
    try {
      await plugin.deactivate();
    } catch (error) {
      this.outputChannel.appendLine(`⚠️ Plugin ${pluginId} deactivation failed: ${error}`);
    }

    // 清理资源
    const context = this.pluginContexts.get(pluginId);
    if (context) {
      context.outputChannel.dispose();
    }

    // 移除插件
    this.plugins.delete(pluginId);
    this.pluginContexts.delete(pluginId);
    this.pluginConfigs.delete(pluginId);
    this.pluginStates.delete(pluginId);
    this.pluginDependencies.delete(pluginId);

    // 触发生命周期事件
    this.emitLifecycleEvent({
      pluginId,
      type: 'unloaded',
      timestamp: Date.now(),
    });

    this.outputChannel.appendLine(`✅ Plugin unloaded: ${pluginId}`);
  }

  /**
   * 激活插件
   */
  public async activatePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const state = this.pluginStates.get(pluginId);
    if (state === PluginLifecycleState.ACTIVATED) {
      this.outputChannel.appendLine(`ℹ️ Plugin ${pluginId} is already activated`);
      return;
    }

    this.outputChannel.appendLine(`🚀 Activating plugin: ${pluginId}`);

    // 检查插件依赖
    if (this.config.enableDependencyCheck && plugin.dependencies) {
      await this.checkPluginDependencies(pluginId, plugin.dependencies);
    }

    try {
      // 激活插件
      const context = this.pluginContexts.get(pluginId);
      if (!context) {
        throw new Error(`Plugin context not found for ${pluginId}`);
      }

      await plugin.activate(context);
      this.pluginStates.set(pluginId, PluginLifecycleState.ACTIVATED);

      // 触发生命周期事件
      this.emitLifecycleEvent({
        pluginId,
        type: 'activated',
        timestamp: Date.now(),
      });

      this.outputChannel.appendLine(`✅ Plugin activated: ${pluginId}`);
    } catch (error) {
      this.outputChannel.appendLine(`❌ Failed to activate plugin ${pluginId}: ${error}`);
      this.pluginStates.set(pluginId, PluginLifecycleState.ERROR);
      
      this.emitLifecycleEvent({
        pluginId,
        type: 'error',
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : String(error),
      });
      
      throw error;
    }
  }

  /**
   * 停用插件
   */
  public async deactivatePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const state = this.pluginStates.get(pluginId);
    if (state !== PluginLifecycleState.ACTIVATED) {
      this.outputChannel.appendLine(`ℹ️ Plugin ${pluginId} is not activated`);
      return;
    }

    this.outputChannel.appendLine(`⏸️ Deactivating plugin: ${pluginId}`);

    try {
      // 停用插件
      await plugin.deactivate();
      this.pluginStates.set(pluginId, PluginLifecycleState.DEACTIVATED);

      // 触发生命周期事件
      this.emitLifecycleEvent({
        pluginId,
        type: 'deactivated',
        timestamp: Date.now(),
      });

      this.outputChannel.appendLine(`✅ Plugin deactivated: ${pluginId}`);
    } catch (error) {
      this.outputChannel.appendLine(`❌ Failed to deactivate plugin ${pluginId}: ${error}`);
      this.pluginStates.set(pluginId, PluginLifecycleState.ERROR);
      
      this.emitLifecycleEvent({
        pluginId,
        type: 'error',
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : String(error),
      });
      
      throw error;
    }
  }

  /**
   * 获取所有插件
   */
  public getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 获取插件
   */
  public getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * 获取插件状态
   */
  public getPluginState(pluginId: string): PluginLifecycleState {
    return this.pluginStates.get(pluginId) || PluginLifecycleState.UNLOADED;
  }

  /**
   * 发现插件
   */
  public async discoverPlugins(pluginDir: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(pluginDir, { withFileTypes: true });
      const pluginPaths: string[] = [];

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const pluginPath = path.join(pluginDir, entry.name);
          
          // 检查是否是插件目录（包含元数据文件）
          const metadataPath = path.join(pluginPath, this.config.metadataFileName);
          try {
            await fs.access(metadataPath);
            pluginPaths.push(pluginPath);
          } catch {
            // 不是插件目录，跳过
          }
        }
      }

      this.outputChannel.appendLine(`🔍 Discovered ${pluginPaths.length} plugins in ${pluginDir}`);
      return pluginPaths;
    } catch (error) {
      this.outputChannel.appendLine(`⚠️ Failed to discover plugins in ${pluginDir}: ${error}`);
      return [];
    }
  }

  /**
   * 获取插件管理器状态
   */
  public getState(): PluginManagerState {
    const pluginStates: Record<string, PluginLifecycleState> = {};
    for (const [pluginId, state] of this.pluginStates.entries()) {
      pluginStates[pluginId] = state;
    }

    return {
      loadedPlugins: this.plugins.size,
      activePlugins: Array.from(this.pluginStates.values()).filter(
        state => state === PluginLifecycleState.ACTIVATED
      ).length,
      pluginStates,
    };
  }

  /**
   * 添加生命周期监听器
   */
  public addLifecycleListener(listener: (event: PluginLifecycleEvent) => void): void {
    this.lifecycleListeners.push(listener);
  }

  /**
   * 移除生命周期监听器
   */
  public removeLifecycleListener(listener: (event: PluginLifecycleEvent) => void): void {
    const index = this.lifecycleListeners.indexOf(listener);
    if (index !== -1) {
      this.lifecycleListeners.splice(index, 1);
    }
  }

  /**
   * 更新插件配置
   */
  public async updatePluginConfig(pluginId: string, newConfig: PluginConfig): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const oldConfig = this.pluginConfigs.get(pluginId) || {};
    const mergedConfig = { ...oldConfig, ...newConfig };

    // 更新插件配置
    this.pluginConfigs.set(pluginId, mergedConfig);

    // 更新插件上下文
    const context = this.pluginContexts.get(pluginId);
    if (context) {
      context.config = mergedConfig;
    }

    // 通知插件配置更新
    if (plugin.updateConfig) {
      try {
        await plugin.updateConfig(mergedConfig);
        this.outputChannel.appendLine(`⚙️ Updated config for plugin: ${pluginId}`);
      } catch (error) {
        this.outputChannel.appendLine(`⚠️ Plugin ${pluginId} failed to update config: ${error}`);
        throw error;
      }
    }

    // 保存配置到文件
    await this.savePluginConfig(pluginId);
  }

  /**
   * 关闭插件管理器
   */
  public async close(): Promise<void> {
    this.outputChannel.appendLine('🔒 Closing Plugin Manager...');

    // 停用所有激活的插件
    for (const [pluginId, state] of this.pluginStates.entries()) {
      if (state === PluginLifecycleState.ACTIVATED) {
        try {
          await this.deactivatePlugin(pluginId);
        } catch (error) {
          this.outputChannel.appendLine(`⚠️ Failed to deactivate plugin ${pluginId}: ${error}`);
        }
      }
    }

    // 清理资源
    this.plugins.clear();
    this.pluginStates.clear();
    this.pluginContexts.clear();
    this.pluginConfigs.clear();
    this.pluginDependencies.clear();
    this.lifecycleListeners = [];

    this.outputChannel.appendLine('🔒 Plugin Manager closed');
    this.outputChannel.dispose();
  }

  // ========== 私有方法 ==========

  /**
   * 发现并加载插件
   */
  private async discoverAndLoadPlugins(): Promise<void> {
    for (const pluginDir of this.config.pluginDirs) {
      try {
        const pluginPaths = await this.discoverPlugins(pluginDir);
        
        for (const pluginPath of pluginPaths) {
          try {
            await this.loadPlugin(pluginPath);
          } catch (error) {
            this.outputChannel.appendLine(`⚠️ Failed to load plugin from ${pluginPath}: ${error}`);
          }
        }
      } catch (error) {
        this.outputChannel.appendLine(`⚠️ Failed to discover plugins in ${pluginDir}: ${error}`);
      }
    }
  }

  /**
   * 加载插件元数据
   */
  private async loadPluginMetadata(pluginPath: string): Promise<PluginMetadata> {
    const metadataPath = path.join(pluginPath, this.config.metadataFileName);
    
    try {
      const metadataContent = await fs.readFile(metadataPath, 'utf-8');
      const metadata = JSON.parse(metadataContent);
      
      // 验证必需字段
      if (!metadata.id || !metadata.name || !metadata.version) {
        throw new Error('Plugin metadata must contain id, name, and version');
      }
      
      return metadata;
    } catch (error) {
      throw new Error(`Failed to load plugin metadata from ${metadataPath}: ${error}`);
    }
  }

  /**
   * 加载插件配置
   */
  private async loadPluginConfig(pluginPath: string, pluginId: string): Promise<PluginConfig> {
    const configPath = path.join(pluginPath, this.config.configFileName);
    
    try {
      const configContent = await fs.readFile(configPath, 'utf-8');
      return JSON.parse(configContent);
    } catch (error) {
      // 配置文件不存在，返回空配置
      return {};
    }
  }

  /**
   * 加载插件模块
   */
  private async loadPluginModule(pluginPath: string): Promise<Plugin> {
    // 注意：在VS Code扩展中，我们需要动态导入模块
    // 这里简化处理，实际实现可能需要使用require或import()
    
    // 尝试加载入口文件
    const entryPoints = [
      path.join(pluginPath, 'index.js'),
      path.join(pluginPath, 'index.ts'),
      path.join(pluginPath, 'plugin.js'),
      path.join(pluginPath, 'plugin.ts'),
      path.join(pluginPath, 'src', 'index.js'),
      path.join(pluginPath, 'src', 'index.ts'),
    ];
    
    for (const entryPoint of entryPoints) {
      try {
        await fs.access(entryPoint);
        
        // 在实际实现中，这里需要动态导入模块
        // 由于TypeScript编译限制，我们返回一个模拟对象
        // 实际实现应该使用类似以下的代码：
        // const module = require(entryPoint);
        // return module.default || module;
        
        throw new Error('Dynamic module loading not implemented in this prototype');
      } catch {
        continue;
      }
    }
    
    throw new Error(`No entry point found in plugin directory: ${pluginPath}`);
  }

  /**
   * 验证插件接口
   */
  private validatePlugin(plugin: any): plugin is Plugin {
    return (
      plugin &&
      typeof plugin === 'object' &&
      plugin.metadata &&
      typeof plugin.metadata === 'object' &&
      typeof plugin.metadata.id === 'string' &&
      typeof plugin.metadata.name === 'string' &&
      typeof plugin.metadata.version === 'string' &&
      typeof plugin.activate === 'function' &&
      typeof plugin.deactivate === 'function' &&
      typeof plugin.getTools === 'function' &&
      typeof plugin.getToolDefinitions === 'function'
    );
  }

  /**
   * 检查插件依赖
   */
  private async checkPluginDependencies(pluginId: string, dependencies: PluginDependency[]): Promise<void> {
    const missingDependencies: string[] = [];
    const versionMismatches: string[] = [];

    for (const dependency of dependencies) {
      const dependentPlugin = this.plugins.get(dependency.pluginId);
      
      if (!dependentPlugin) {
        if (!dependency.optional) {
          missingDependencies.push(dependency.pluginId);
        }
        continue;
      }

      // 检查版本兼容性
      if (dependency.minVersion || dependency.maxVersion) {
        const pluginVersion = dependentPlugin.metadata.version;
        
        if (dependency.minVersion && this.compareVersions(pluginVersion, dependency.minVersion) < 0) {
          versionMismatches.push(`${dependency.pluginId} (requires >= ${dependency.minVersion}, found ${pluginVersion})`);
        }
        
        if (dependency.maxVersion && this.compareVersions(pluginVersion, dependency.maxVersion) > 0) {
          versionMismatches.push(`${dependency.pluginId} (requires <= ${dependency.maxVersion}, found ${pluginVersion})`);
        }
      }
    }

    if (missingDependencies.length > 0) {
      throw new Error(`Missing dependencies: ${missingDependencies.join(', ')}`);
    }

    if (versionMismatches.length > 0) {
      throw new Error(`Version mismatches: ${versionMismatches.join(', ')}`);
    }
  }

  /**
   * 查找依赖此插件的其他插件
   */
  private async findDependentPlugins(pluginId: string): Promise<Plugin[]> {
    const dependentPlugins: Plugin[] = [];

    for (const [otherPluginId, plugin] of this.plugins.entries()) {
      if (otherPluginId === pluginId) {
        continue;
      }

      const dependencies = this.pluginDependencies.get(otherPluginId) || [];
      const dependsOnThisPlugin = dependencies.some(dep => dep.pluginId === pluginId && !dep.optional);

      if (dependsOnThisPlugin) {
        dependentPlugins.push(plugin);
      }
    }

    return dependentPlugins;
  }

  /**
   * 保存插件配置
   */
  private async savePluginConfig(pluginId: string): Promise<void> {
    const context = this.pluginContexts.get(pluginId);
    if (!context) {
      return;
    }

    const config = this.pluginConfigs.get(pluginId);
    if (!config) {
      return;
    }

    const configPath = path.join(context.pluginDir, this.config.configFileName);
    
    try {
      await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    } catch (error) {
      this.outputChannel.appendLine(`⚠️ Failed to save config for plugin ${pluginId}: ${error}`);
    }
  }

  /**
   * 比较版本号
   */
  private compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1 = v1Parts[i] || 0;
      const v2 = v2Parts[i] || 0;
      
      if (v1 > v2) return 1;
      if (v1 < v2) return -1;
    }
    
    return 0;
  }

  /**
   * 触发生命周期事件
   */
  private emitLifecycleEvent(event: PluginLifecycleEvent): void {
    for (const listener of this.lifecycleListeners) {
      try {
        listener(event);
      } catch (error) {
        this.outputChannel.appendLine(`⚠️ Lifecycle listener error: ${error}`);
      }
    }
  }
}