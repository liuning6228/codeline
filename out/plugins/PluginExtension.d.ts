/**
 * 插件扩展集成
 * 将插件系统集成到CodeLine主扩展中
 */
import * as vscode from 'vscode';
import { PluginManager } from './PluginManager';
import { PluginToolRegistry } from './PluginToolRegistry';
import { PluginMCPHandler } from './PluginMCPHandler';
import { ToolContext } from '../tools/ToolInterface';
/**
 * 插件扩展配置
 */
export interface PluginExtensionConfig {
    /** 是否启用插件系统 */
    enabled: boolean;
    /** 是否自动加载内置插件 */
    autoLoadBuiltins: boolean;
    /** 插件目录 */
    pluginDirs: string[];
    /** 是否启用插件管理UI */
    enableManagementUI: boolean;
    /** 是否启用插件市场 */
    enableMarketplace: boolean;
}
/**
 * 插件扩展状态
 */
export interface PluginExtensionState {
    /** 插件管理器是否就绪 */
    pluginManagerReady: boolean;
    /** 加载的插件数量 */
    loadedPlugins: number;
    /** 激活的插件数量 */
    activePlugins: number;
    /** 插件工具数量 */
    pluginTools: number;
    /** 插件MCP服务器数量 */
    pluginMCPServers: number;
    /** 最后错误 */
    lastError?: string;
}
/**
 * 插件扩展
 * 负责在CodeLine扩展中集成插件系统
 */
export declare class PluginExtension {
    private static instance;
    private pluginManager?;
    private pluginToolRegistry?;
    private pluginMCPHandler?;
    private outputChannel;
    private config;
    private state;
    private extensionContext;
    private toolContext;
    private constructor();
    static getInstance(extensionContext?: vscode.ExtensionContext, toolContext?: ToolContext, config?: Partial<PluginExtensionConfig>): PluginExtension;
    /**
     * 初始化插件扩展
     */
    initialize(): Promise<void>;
    /**
     * 初始化插件管理器
     */
    private initializePluginManager;
    /**
     * 初始化插件工具注册表
     */
    private initializePluginToolRegistry;
    /**
     * 初始化插件MCP处理器
     */
    private initializePluginMCPHandler;
    /**
     * 获取或创建基础工具注册表
     */
    private getOrCreateBaseToolRegistry;
    /**
     * 获取或创建基础MCP处理器
     */
    private getOrCreateBaseMCPHandler;
    /**
     * 加载内置插件
     */
    private loadBuiltinPlugins;
    /**
     * 注册命令和UI
     */
    private registerCommandsAndUI;
    /**
     * 创建插件管理视图
     */
    private createPluginManagementView;
    /**
     * 显示插件管理UI
     */
    showPluginManagementUI(): void;
    /**
     * 重新加载所有插件
     */
    reloadPlugins(): Promise<void>;
    /**
     * 列出所有插件
     */
    listPlugins(): Promise<void>;
    /**
     * 显示插件详情
     */
    private showPluginDetails;
    /**
     * 安装插件
     */
    installPlugin(): Promise<void>;
    /**
     * 卸载插件
     */
    private uninstallPlugin;
    /**
     * 启用插件
     */
    private enablePlugin;
    /**
     * 禁用插件
     */
    private disablePlugin;
    /**
     * 处理插件生命周期事件
     */
    private handlePluginLifecycleEvent;
    /**
     * 获取插件扩展状态
     */
    getState(): PluginExtensionState;
    /**
     * 获取插件管理器
     */
    getPluginManager(): PluginManager | undefined;
    /**
     * 获取插件工具注册表
     */
    getPluginToolRegistry(): PluginToolRegistry | undefined;
    /**
     * 获取插件MCP处理器
     */
    getPluginMCPHandler(): PluginMCPHandler | undefined;
    /**
     * 清理资源
     */
    dispose(): void;
}
//# sourceMappingURL=PluginExtension.d.ts.map