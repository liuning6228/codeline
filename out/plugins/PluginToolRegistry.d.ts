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
export declare class PluginToolRegistry {
    private toolRegistry;
    private pluginManager;
    private pluginTools;
    private config;
    private outputChannel;
    constructor(config?: Partial<PluginToolRegistryConfig>);
    /**
     * 初始化插件化工具注册表
     */
    initializeWithPlugins(extensionContext: vscode.ExtensionContext, globalContext: ToolContext): Promise<boolean>;
    /**
     * 初始化插件管理器
     */
    private initializePluginManager;
    /**
     * 处理插件生命周期事件
     */
    private handlePluginLifecycleEvent;
    /**
     * 处理插件激活
     */
    private handlePluginActivated;
    /**
     * 处理插件停用
     */
    private handlePluginDeactivated;
    /**
     * 处理插件卸载
     */
    private handlePluginUnloaded;
    /**
     * 注册插件工具
     */
    private registerPluginTools;
    /**
     * 卸载插件工具
     */
    private unregisterPluginTools;
    /**
     * 清理插件工具记录
     */
    private cleanupPluginTools;
    /**
     * 创建插件工具
     */
    private createPluginTool;
    /**
     * 获取带前缀的工具ID
     */
    private getPrefixedToolId;
    /**
     * 检查是否为工具插件
     */
    private isToolPlugin;
    /**
     * 获取工具注册表
     */
    getToolRegistry(): ToolRegistry;
    /**
     * 获取插件管理器
     */
    getPluginManager(): PluginManager | null;
    /**
     * 加载插件
     */
    loadPlugin(pluginPath: string): Promise<void>;
    /**
     * 卸载插件
     */
    unloadPlugin(pluginId: string): Promise<void>;
    /**
     * 获取插件工具信息
     */
    getPluginToolInfo(toolId: string): {
        pluginId: string;
        originalToolId: string;
    } | null;
    /**
     * 获取所有插件工具
     */
    getPluginTools(): Map<string, {
        pluginId: string;
        originalToolId: string;
    }>;
    /**
     * 关闭插件化工具注册表
     */
    closeWithPlugins(): Promise<void>;
    /**
     * 获取插件化工具注册表状态
     */
    getPluginRegistryState(): {
        pluginManagerInitialized: boolean;
        loadedPlugins: number;
        pluginToolsCount: number;
    };
    /**
     * 代理ToolRegistry的方法
     */
    initialize(): Promise<boolean>;
    registerToolDefinition<Input = Record<string, any>, Output = any>(definition: ToolDefinition<Input, Output>, categories?: ToolCategory[]): boolean;
    getTool(toolId: string): Tool | undefined;
    getAllTools(context: ToolContext, filters?: {
        categories?: ToolCategory[];
        enabledOnly?: boolean;
        searchTerm?: string;
    }): Tool[];
}
//# sourceMappingURL=PluginToolRegistry.d.ts.map