/**
 * 插件系统接口
 * 支持动态加载和卸载工具插件
 * 基于Claude Code CP-20260402-003插件模式
 */

import * as vscode from 'vscode';
import { Tool, ToolContext, ToolDefinition } from '../tools/ToolInterface';

/**
 * 插件元数据
 */
export interface PluginMetadata {
  /** 插件ID */
  id: string;
  /** 插件名称 */
  name: string;
  /** 插件描述 */
  description: string;
  /** 插件版本 */
  version: string;
  /** 插件作者 */
  author?: string;
  /** 插件图标（Base64或URL） */
  icon?: string;
  /** 插件主页URL */
  homepage?: string;
  /** 许可证信息 */
  license?: string;
  /** 插件类别 */
  categories?: string[];
  /** 关键词 */
  keywords?: string[];
  /** 最小兼容版本 */
  minEngineVersion?: string;
  /** 最大兼容版本 */
  maxEngineVersion?: string;
}

/**
 * 插件依赖
 */
export interface PluginDependency {
  /** 依赖插件ID */
  pluginId: string;
  /** 最小版本 */
  minVersion?: string;
  /** 最大版本 */
  maxVersion?: string;
  /** 是否可选 */
  optional?: boolean;
}

/**
 * 插件配置模式
 */
export interface PluginConfigSchema {
  /** 配置字段定义 */
  fields: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    description: string;
    default?: any;
    required?: boolean;
    validation?: (value: any) => boolean;
    options?: string[] | number[];
  }>;
}

/**
 * 插件配置
 */
export interface PluginConfig {
  [key: string]: any;
}

/**
 * 插件上下文
 */
export interface PluginContext {
  /** VS Code扩展上下文 */
  extensionContext: vscode.ExtensionContext;
  /** 插件安装目录 */
  pluginDir: string;
  /** 插件输出通道 */
  outputChannel: vscode.OutputChannel;
  /** 插件配置 */
  config: PluginConfig;
  /** 全局上下文 */
  globalContext: ToolContext;
  /** 插件管理器 */
  pluginManager: PluginManager;
}

/**
 * 插件生命周期状态
 */
export enum PluginLifecycleState {
  /** 已加载 */
  LOADED = 'loaded',
  /** 已激活 */
  ACTIVATED = 'activated',
  /** 已停用 */
  DEACTIVATED = 'deactivated',
  /** 已卸载 */
  UNLOADED = 'unloaded',
  /** 错误状态 */
  ERROR = 'error',
}

/**
 * 插件生命周期事件
 */
export interface PluginLifecycleEvent {
  /** 插件ID */
  pluginId: string;
  /** 事件类型 */
  type: 'loaded' | 'activated' | 'deactivated' | 'unloaded' | 'error';
  /** 时间戳 */
  timestamp: number;
  /** 错误信息（如果是错误事件） */
  error?: string;
}

/**
 * 插件接口
 * 所有插件必须实现此接口
 */
export interface Plugin {
  /** 插件元数据 */
  readonly metadata: PluginMetadata;
  /** 插件配置模式 */
  readonly configSchema?: PluginConfigSchema;
  /** 插件依赖 */
  readonly dependencies?: PluginDependency[];
  
  /**
   * 插件激活方法
   * 在插件加载后调用，用于初始化插件
   */
  activate(context: PluginContext): Promise<void>;
  
  /**
   * 插件停用方法
   * 在插件卸载前调用，用于清理资源
   */
  deactivate(): Promise<void>;
  
  /**
   * 获取插件提供的工具
   * 返回此插件注册的所有工具
   */
  getTools(): Tool[];
  
  /**
   * 获取工具定义
   * 返回此插件提供的工具定义（用于动态注册）
   */
  getToolDefinitions(): ToolDefinition[];
  
  /**
   * 插件配置更新
   * 当插件配置发生变化时调用
   */
  updateConfig?(newConfig: PluginConfig): Promise<void>;
  
  /**
   * 插件健康检查
   * 返回插件健康状态
   */
  healthCheck?(): Promise<{
    healthy: boolean;
    message?: string;
    details?: Record<string, any>;
  }>;
}

/**
 * 工具插件接口
 * 专门用于提供工具的插件
 */
export interface ToolPlugin extends Plugin {
  /**
   * 注册工具
   * 将工具注册到工具注册表
   */
  registerTools(registry: any): Promise<void>;
  
  /**
   * 卸载工具
   * 从工具注册表卸载工具
   */
  unregisterTools(registry: any): Promise<void>;
}

/**
 * MCP插件接口
 * 提供MCP服务器功能的插件
 */
export interface MCPPlugin extends Plugin {
  /**
   * 获取MCP服务器列表
   */
  getMCPServers?(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    version?: string;
    configuration?: Record<string, any>;
    enabled?: boolean;
    tools?: Array<{
      id: string;
      name: string;
      description: string;
    }>;
  }>>;
  
  /**
   * 获取MCP服务器配置
   */
  getMCPServerConfig?(serverId: string): {
    host: string;
    port: number;
    protocols: string[];
    capabilities: string[];
  };
  
  /**
   * 连接MCP服务器
   */
  connectMCPServer?(serverId: string, configuration?: Record<string, any>): Promise<void>;
  
  /**
   * 断开MCP服务器
   */
  disconnectMCPServer?(serverId: string): Promise<void>;
  
  /**
   * 启动MCP服务器
   */
  startMCPServer?(): Promise<void>;
  
  /**
   * 停止MCP服务器
   */
  stopMCPServer?(): Promise<void>;
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
 * 插件管理器接口
 */
export interface PluginManager {
  /**
   * 加载插件
   * @param pluginPath 插件路径
   */
  loadPlugin(pluginPath: string): Promise<Plugin>;
  
  /**
   * 卸载插件
   * @param pluginId 插件ID
   */
  unloadPlugin(pluginId: string): Promise<void>;
  
  /**
   * 激活插件
   * @param pluginId 插件ID
   */
  activatePlugin(pluginId: string): Promise<void>;
  
  /**
   * 停用插件
   * @param pluginId 插件ID
   */
  deactivatePlugin(pluginId: string): Promise<void>;
  
  /**
   * 获取所有插件
   */
  getPlugins(): Plugin[];
  
  /**
   * 获取插件
   * @param pluginId 插件ID
   */
  getPlugin(pluginId: string): Plugin | undefined;
  
  /**
   * 获取插件状态
   * @param pluginId 插件ID
   */
  getPluginState(pluginId: string): PluginLifecycleState;
  
  /**
   * 发现插件
   * 扫描指定目录寻找插件
   */
  discoverPlugins(pluginDir: string): Promise<string[]>;
  
  /**
   * 添加生命周期监听器
   */
  addLifecycleListener(listener: (event: PluginLifecycleEvent) => void): void;
  
  /**
   * 移除生命周期监听器
   */
  removeLifecycleListener(listener: (event: PluginLifecycleEvent) => void): void;
  
  /**
   * 获取插件管理器状态
   */
  getState(): PluginManagerState;
  
  /**
   * 关闭插件管理器
   */
  close(): Promise<void>;
}