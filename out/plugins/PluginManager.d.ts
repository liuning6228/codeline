/**
 * 插件管理器
 * 负责插件的加载、卸载、激活、停用和生命周期管理
 * 基于Claude Code CP-20260402-003插件模式
 */
import * as vscode from 'vscode';
import { Plugin, PluginLifecycleState, PluginLifecycleEvent, PluginManager as IPluginManager, PluginConfig } from './PluginInterface';
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
export declare class PluginManager implements IPluginManager {
    private plugins;
    private pluginStates;
    private pluginContexts;
    private pluginConfigs;
    private pluginDependencies;
    private outputChannel;
    private config;
    private globalContext;
    private extensionContext;
    private lifecycleListeners;
    constructor(extensionContext: vscode.ExtensionContext, globalContext: ToolContext, config?: Partial<PluginManagerConfig>);
    /**
     * 初始化插件管理器
     */
    initialize(): Promise<void>;
    /**
     * 加载插件
     */
    loadPlugin(pluginPath: string): Promise<Plugin>;
    /**
     * 卸载插件
     */
    unloadPlugin(pluginId: string): Promise<void>;
    /**
     * 激活插件
     */
    activatePlugin(pluginId: string): Promise<void>;
    /**
     * 停用插件
     */
    deactivatePlugin(pluginId: string): Promise<void>;
    /**
     * 获取所有插件
     */
    getPlugins(): Plugin[];
    /**
     * 获取插件
     */
    getPlugin(pluginId: string): Plugin | undefined;
    /**
     * 获取插件状态
     */
    getPluginState(pluginId: string): PluginLifecycleState;
    /**
     * 发现插件
     */
    discoverPlugins(pluginDir: string): Promise<string[]>;
    /**
     * 获取插件管理器状态
     */
    getState(): PluginManagerState;
    /**
     * 添加生命周期监听器
     */
    addLifecycleListener(listener: (event: PluginLifecycleEvent) => void): void;
    /**
     * 移除生命周期监听器
     */
    removeLifecycleListener(listener: (event: PluginLifecycleEvent) => void): void;
    /**
     * 更新插件配置
     */
    updatePluginConfig(pluginId: string, newConfig: PluginConfig): Promise<void>;
    /**
     * 关闭插件管理器
     */
    close(): Promise<void>;
    /**
     * 发现并加载插件
     */
    private discoverAndLoadPlugins;
    /**
     * 加载插件元数据
     */
    private loadPluginMetadata;
    /**
     * 加载插件配置
     */
    private loadPluginConfig;
    /**
     * 加载插件模块
     */
    private loadPluginModule;
    /**
     * 验证插件接口
     */
    private validatePlugin;
    /**
     * 检查插件依赖
     */
    private checkPluginDependencies;
    /**
     * 查找依赖此插件的其他插件
     */
    private findDependentPlugins;
    /**
     * 保存插件配置
     */
    private savePluginConfig;
    /**
     * 比较版本号
     */
    private compareVersions;
    /**
     * 触发生命周期事件
     */
    private emitLifecycleEvent;
}
//# sourceMappingURL=PluginManager.d.ts.map