/**
 * 插件化MCP处理器
 * 扩展MCPHandler以支持插件化的MCP服务器管理
 * 基于Claude Code CP-20260402-003插件模式
 */
import * as vscode from 'vscode';
import { PluginToolRegistry } from './PluginToolRegistry';
/**
 * 插件化MCP服务器
 */
export interface PluginMCPServer {
    /** 服务器ID */
    id: string;
    /** 服务器名称 */
    name: string;
    /** 服务器描述 */
    description: string;
    /** 服务器版本 */
    version: string;
    /** 插件ID */
    pluginId: string;
    /** 服务器配置 */
    configuration: Record<string, any>;
    /** 是否启用 */
    enabled: boolean;
    /** 是否已连接 */
    connected: boolean;
    /** 连接状态 */
    connectionState: 'disconnected' | 'connecting' | 'connected' | 'error';
    /** 最后活动时间 */
    lastActivity: Date;
    /** 工具列表 */
    tools: Array<{
        id: string;
        name: string;
        description: string;
    }>;
}
/**
 * 插件化MCP消息类型
 */
export interface PluginMCPMessage {
    type: string;
    pluginId?: string;
    serverId?: string;
    data: Record<string, any>;
}
/**
 * 插件化MCP响应
 */
export interface PluginMCPResponse {
    success: boolean;
    data?: any;
    error?: string;
    pluginId?: string;
    serverId?: string;
    toolId?: string;
}
/**
 * 插件化MCP处理器
 */
export declare class PluginMCPHandler {
    private context;
    private taskEngine;
    private pluginToolRegistry;
    private pluginManager;
    private pluginServers;
    private isInitialized;
    private outputChannel;
    constructor(context: vscode.ExtensionContext);
    /**
     * 初始化插件化MCP处理器
     */
    initialize(workspaceRoot: string, pluginToolRegistry: PluginToolRegistry): Promise<boolean>;
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
     * 检查插件是否提供MCP服务器
     */
    private pluginHasMCPServers;
    /**
     * 加载插件MCP服务器
     */
    private loadPluginMCPServers;
    /**
     * 停用插件MCP服务器
     */
    private deactivatePluginMCPServers;
    /**
     * 移除插件MCP服务器
     */
    private removePluginMCPServers;
    /**
     * 连接插件MCP服务器
     */
    private connectPluginServer;
    /**
     * 断开插件MCP服务器
     */
    private disconnectPluginServer;
    /**
     * 处理插件化MCP消息
     */
    handlePluginMessage(message: PluginMCPMessage): Promise<PluginMCPResponse>;
    /**
     * 处理遗留MCP消息
     */
    private handleLegacyMessage;
    /**
     * 获取插件MCP服务器列表
     */
    private handleGetPluginServers;
    /**
     * 连接插件MCP服务器
     */
    private handlePluginConnectServer;
    /**
     * 断开插件MCP服务器
     */
    private handlePluginDisconnectServer;
    /**
     * 切换插件MCP服务器状态
     */
    private handlePluginToggleServer;
    /**
     * 执行插件MCP工具
     */
    private handlePluginExecuteTool;
    /**
     * 获取服务器工具列表
     */
    private handleGetServerTools;
    /**
     * 获取服务器状态
     */
    private handleGetServerStatus;
    /**
     * 扫描插件
     */
    private handleScanPlugins;
    /**
     * 获取所有插件MCP服务器
     */
    getPluginMCPServers(): PluginMCPServer[];
    /**
     * 获取插件MCP服务器
     */
    getPluginMCPServer(serverId: string): PluginMCPServer | undefined;
    /**
     * 关闭插件化MCP处理器
     */
    close(): Promise<void>;
}
//# sourceMappingURL=PluginMCPHandler.d.ts.map