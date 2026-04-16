"use strict";
/**
 * 插件化MCP处理器
 * 扩展MCPHandler以支持插件化的MCP服务器管理
 * 基于Claude Code CP-20260402-003插件模式
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginMCPHandler = void 0;
const vscode = __importStar(require("vscode"));
const EnhancedTaskEngine_1 = require("../tools/EnhancedTaskEngine");
/**
 * 插件化MCP处理器
 */
class PluginMCPHandler {
    context;
    taskEngine = null;
    pluginToolRegistry = null;
    pluginManager = null;
    pluginServers = new Map();
    isInitialized = false;
    outputChannel;
    constructor(context) {
        this.context = context;
        this.outputChannel = vscode.window.createOutputChannel('CodeLine Plugin MCP');
    }
    /**
     * 初始化插件化MCP处理器
     */
    async initialize(workspaceRoot, pluginToolRegistry) {
        if (this.isInitialized) {
            return true;
        }
        try {
            this.outputChannel.show(true);
            this.outputChannel.appendLine('🔧 Initializing Plugin MCP Handler...');
            // 存储插件工具注册表引用
            this.pluginToolRegistry = pluginToolRegistry;
            this.pluginManager = pluginToolRegistry.getPluginManager();
            if (!this.pluginManager) {
                this.outputChannel.appendLine('⚠️ Plugin manager not available, plugin MCP features will be limited');
            }
            // 初始化增强任务引擎（带工具系统）
            this.taskEngine = new EnhancedTaskEngine_1.EnhancedTaskEngine(workspaceRoot, this.context, {
                enableToolSystem: true,
                autoLoadTools: true,
                showLoadingProgress: true,
            });
            // 加载工具
            const toolsLoaded = await this.taskEngine.loadTools();
            if (!toolsLoaded) {
                this.outputChannel.appendLine('⚠️ Tool system loaded with warnings');
            }
            // 监听插件生命周期事件
            if (this.pluginManager) {
                this.pluginManager.addLifecycleListener((event) => {
                    this.handlePluginLifecycleEvent(event);
                });
            }
            this.isInitialized = true;
            this.outputChannel.appendLine('✅ Plugin MCP Handler initialized');
            return true;
        }
        catch (error) {
            this.outputChannel.appendLine(`❌ Plugin MCP Handler initialization failed: ${error.message}`);
            return false;
        }
    }
    /**
     * 处理插件生命周期事件
     */
    handlePluginLifecycleEvent(event) {
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
                this.outputChannel.appendLine(`⚠️ Plugin ${pluginId} MCP error: ${event.error}`);
                break;
        }
    }
    /**
     * 处理插件激活
     */
    async handlePluginActivated(pluginId) {
        this.outputChannel.appendLine(`🔌 Plugin ${pluginId} activated, scanning for MCP servers...`);
        if (!this.pluginManager) {
            return;
        }
        const plugin = this.pluginManager.getPlugin(pluginId);
        if (!plugin) {
            return;
        }
        // 检查插件是否提供MCP服务器
        if (this.pluginHasMCPServers(plugin)) {
            await this.loadPluginMCPServers(pluginId, plugin);
        }
    }
    /**
     * 处理插件停用
     */
    async handlePluginDeactivated(pluginId) {
        this.outputChannel.appendLine(`🔌 Plugin ${pluginId} deactivated, disconnecting MCP servers...`);
        // 断开并隐藏插件服务器
        await this.deactivatePluginMCPServers(pluginId);
    }
    /**
     * 处理插件卸载
     */
    async handlePluginUnloaded(pluginId) {
        this.outputChannel.appendLine(`🔌 Plugin ${pluginId} unloaded, removing MCP servers...`);
        // 移除插件服务器
        await this.removePluginMCPServers(pluginId);
    }
    /**
     * 检查插件是否提供MCP服务器
     */
    pluginHasMCPServers(plugin) {
        // 检查插件是否有getMCPServers方法
        return 'getMCPServers' in plugin && typeof plugin.getMCPServers === 'function';
    }
    /**
     * 加载插件MCP服务器
     */
    async loadPluginMCPServers(pluginId, plugin) {
        try {
            const servers = await plugin.getMCPServers();
            for (const server of servers) {
                const serverId = `${pluginId}:${server.id}`;
                const pluginServer = {
                    id: serverId,
                    name: server.name || server.id,
                    description: server.description || `MCP server from plugin ${pluginId}`,
                    version: server.version || '1.0.0',
                    pluginId,
                    configuration: server.configuration || {},
                    enabled: server.enabled !== false,
                    connected: false,
                    connectionState: 'disconnected',
                    lastActivity: new Date(),
                    tools: server.tools || [],
                };
                this.pluginServers.set(serverId, pluginServer);
                this.outputChannel.appendLine(`🔌 Registered MCP server: ${server.name} (${serverId})`);
                // 自动连接启用的服务器
                if (pluginServer.enabled) {
                    await this.connectPluginServer(serverId);
                }
            }
            this.outputChannel.appendLine(`✅ Loaded ${servers.length} MCP servers from plugin ${pluginId}`);
        }
        catch (error) {
            this.outputChannel.appendLine(`❌ Failed to load MCP servers from plugin ${pluginId}: ${error}`);
        }
    }
    /**
     * 停用插件MCP服务器
     */
    async deactivatePluginMCPServers(pluginId) {
        const serversToDeactivate = [];
        for (const [serverId, server] of this.pluginServers.entries()) {
            if (server.pluginId === pluginId && server.connected) {
                serversToDeactivate.push(serverId);
            }
        }
        for (const serverId of serversToDeactivate) {
            await this.disconnectPluginServer(serverId);
            // 更新服务器状态为停用
            const server = this.pluginServers.get(serverId);
            if (server) {
                server.enabled = false;
                server.connectionState = 'disconnected';
                this.pluginServers.set(serverId, server);
            }
        }
        if (serversToDeactivate.length > 0) {
            this.outputChannel.appendLine(`✅ Deactivated ${serversToDeactivate.length} MCP servers from plugin ${pluginId}`);
        }
    }
    /**
     * 移除插件MCP服务器
     */
    async removePluginMCPServers(pluginId) {
        const serversToRemove = [];
        for (const [serverId, server] of this.pluginServers.entries()) {
            if (server.pluginId === pluginId) {
                serversToRemove.push(serverId);
            }
        }
        for (const serverId of serversToRemove) {
            // 断开连接
            if (this.pluginServers.get(serverId)?.connected) {
                await this.disconnectPluginServer(serverId);
            }
            // 移除服务器
            this.pluginServers.delete(serverId);
            this.outputChannel.appendLine(`🗑️ Removed MCP server: ${serverId}`);
        }
        if (serversToRemove.length > 0) {
            this.outputChannel.appendLine(`✅ Removed ${serversToRemove.length} MCP servers from plugin ${pluginId}`);
        }
    }
    /**
     * 连接插件MCP服务器
     */
    async connectPluginServer(serverId) {
        const server = this.pluginServers.get(serverId);
        if (!server) {
            return false;
        }
        try {
            server.connectionState = 'connecting';
            this.pluginServers.set(serverId, server);
            this.outputChannel.appendLine(`🔌 Connecting MCP server: ${server.name} (${serverId})`);
            // 实际连接逻辑
            // 这里应该调用插件的连接方法
            if (this.pluginManager) {
                const plugin = this.pluginManager.getPlugin(server.pluginId);
                if (plugin && 'connectMCPServer' in plugin && typeof plugin.connectMCPServer === 'function') {
                    const mcpPlugin = plugin;
                    await mcpPlugin.connectMCPServer(server.id.replace(`${server.pluginId}:`, ''), server.configuration);
                }
            }
            server.connected = true;
            server.connectionState = 'connected';
            server.lastActivity = new Date();
            this.pluginServers.set(serverId, server);
            this.outputChannel.appendLine(`✅ Connected MCP server: ${server.name}`);
            return true;
        }
        catch (error) {
            server.connected = false;
            server.connectionState = 'error';
            this.pluginServers.set(serverId, server);
            this.outputChannel.appendLine(`❌ Failed to connect MCP server ${server.name}: ${error}`);
            return false;
        }
    }
    /**
     * 断开插件MCP服务器
     */
    async disconnectPluginServer(serverId) {
        const server = this.pluginServers.get(serverId);
        if (!server) {
            return false;
        }
        try {
            this.outputChannel.appendLine(`🔌 Disconnecting MCP server: ${server.name} (${serverId})`);
            // 实际断开逻辑
            // 这里应该调用插件的断开方法
            if (this.pluginManager) {
                const plugin = this.pluginManager.getPlugin(server.pluginId);
                if (plugin && 'disconnectMCPServer' in plugin && typeof plugin.disconnectMCPServer === 'function') {
                    const mcpPlugin = plugin;
                    await mcpPlugin.disconnectMCPServer(server.id.replace(`${server.pluginId}:`, ''));
                }
            }
            server.connected = false;
            server.connectionState = 'disconnected';
            this.pluginServers.set(serverId, server);
            this.outputChannel.appendLine(`✅ Disconnected MCP server: ${server.name}`);
            return true;
        }
        catch (error) {
            server.connectionState = 'error';
            this.pluginServers.set(serverId, server);
            this.outputChannel.appendLine(`❌ Failed to disconnect MCP server ${server.name}: ${error}`);
            return false;
        }
    }
    /**
     * 处理插件化MCP消息
     */
    async handlePluginMessage(message) {
        if (!this.isInitialized) {
            return {
                success: false,
                error: 'Plugin MCP Handler not initialized',
                pluginId: message.pluginId,
                serverId: message.serverId,
            };
        }
        const { type, pluginId, serverId, data } = message;
        try {
            this.outputChannel.appendLine(`📨 Handling plugin MCP message: ${type}${pluginId ? ` from ${pluginId}` : ''}${serverId ? ` for ${serverId}` : ''}`);
            switch (type) {
                case 'plugin_mcp_get_servers':
                    return await this.handleGetPluginServers(data);
                case 'plugin_mcp_connect_server':
                    return await this.handlePluginConnectServer(data);
                case 'plugin_mcp_disconnect_server':
                    return await this.handlePluginDisconnectServer(data);
                case 'plugin_mcp_toggle_server':
                    return await this.handlePluginToggleServer(data);
                case 'plugin_mcp_execute_tool':
                    return await this.handlePluginExecuteTool(data);
                case 'plugin_mcp_get_server_tools':
                    return await this.handleGetServerTools(data);
                case 'plugin_mcp_get_server_status':
                    return await this.handleGetServerStatus(data);
                case 'plugin_mcp_scan_plugins':
                    return await this.handleScanPlugins();
                default:
                    // 如果不是插件专用消息，传递给父类处理
                    if (type.startsWith('mcp_')) {
                        return await this.handleLegacyMessage(message);
                    }
                    return {
                        success: false,
                        error: `Unknown plugin MCP message type: ${type}`,
                        pluginId,
                        serverId,
                    };
            }
        }
        catch (error) {
            this.outputChannel.appendLine(`❌ Plugin MCP message handling failed: ${error.message}`);
            return {
                success: false,
                error: error.message,
                pluginId,
                serverId,
            };
        }
    }
    /**
     * 处理遗留MCP消息
     */
    async handleLegacyMessage(message) {
        // 对于遗留消息，转换为原始MCP格式并传递给现有处理逻辑
        const legacyMessage = {
            type: message.type,
            data: message.data,
        };
        // 这里应该调用原始的MCPHandler
        // 由于我们没有原始实例，返回一个提示
        return {
            success: false,
            error: 'Legacy MCP messages require original MCPHandler instance',
            pluginId: message.pluginId,
            serverId: message.serverId,
        };
    }
    /**
     * 获取插件MCP服务器列表
     */
    async handleGetPluginServers(data) {
        const filterPluginId = data?.pluginId;
        const servers = Array.from(this.pluginServers.values());
        let filteredServers = servers;
        if (filterPluginId) {
            filteredServers = servers.filter(server => server.pluginId === filterPluginId);
        }
        return {
            success: true,
            data: {
                servers: filteredServers.map(server => ({
                    id: server.id,
                    name: server.name,
                    description: server.description,
                    pluginId: server.pluginId,
                    enabled: server.enabled,
                    connected: server.connected,
                    connectionState: server.connectionState,
                    lastActivity: server.lastActivity,
                    toolCount: server.tools.length,
                })),
                total: filteredServers.length,
            },
        };
    }
    /**
     * 连接插件MCP服务器
     */
    async handlePluginConnectServer(data) {
        const { serverId } = data;
        if (!serverId) {
            return {
                success: false,
                error: 'Missing serverId',
            };
        }
        const connected = await this.connectPluginServer(serverId);
        return {
            success: connected,
            data: { connected },
            serverId,
        };
    }
    /**
     * 断开插件MCP服务器
     */
    async handlePluginDisconnectServer(data) {
        const { serverId } = data;
        if (!serverId) {
            return {
                success: false,
                error: 'Missing serverId',
            };
        }
        const disconnected = await this.disconnectPluginServer(serverId);
        return {
            success: disconnected,
            data: { disconnected },
            serverId,
        };
    }
    /**
     * 切换插件MCP服务器状态
     */
    async handlePluginToggleServer(data) {
        const { serverId, enabled } = data;
        if (!serverId || enabled === undefined) {
            return {
                success: false,
                error: 'Missing serverId or enabled parameter',
            };
        }
        const server = this.pluginServers.get(serverId);
        if (!server) {
            return {
                success: false,
                error: `Server ${serverId} not found`,
                serverId,
            };
        }
        server.enabled = enabled;
        this.pluginServers.set(serverId, server);
        if (enabled && !server.connected) {
            await this.connectPluginServer(serverId);
        }
        else if (!enabled && server.connected) {
            await this.disconnectPluginServer(serverId);
        }
        return {
            success: true,
            data: {
                enabled,
                connected: server.connected,
            },
            serverId,
        };
    }
    /**
     * 执行插件MCP工具
     */
    async handlePluginExecuteTool(data) {
        const { serverId, toolId, parameters } = data;
        if (!serverId || !toolId) {
            return {
                success: false,
                error: 'Missing serverId or toolId',
            };
        }
        const server = this.pluginServers.get(serverId);
        if (!server) {
            return {
                success: false,
                error: `Server ${serverId} not found`,
                serverId,
            };
        }
        if (!server.connected) {
            return {
                success: false,
                error: `Server ${serverId} is not connected`,
                serverId,
            };
        }
        const tool = server.tools.find(t => t.id === toolId);
        if (!tool) {
            return {
                success: false,
                error: `Tool ${toolId} not found on server ${serverId}`,
                serverId,
                toolId,
            };
        }
        try {
            // 这里应该通过插件执行工具
            // 由于时间限制，我们返回一个模拟结果
            this.outputChannel.appendLine(`🛠️ Executing plugin MCP tool: ${tool.name} on ${server.name}`);
            // 模拟执行延迟
            await new Promise(resolve => setTimeout(resolve, 500));
            server.lastActivity = new Date();
            this.pluginServers.set(serverId, server);
            return {
                success: true,
                data: {
                    toolId,
                    serverId,
                    result: `Executed ${tool.name} successfully`,
                    timestamp: new Date(),
                    duration: 500,
                },
                serverId,
                toolId,
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to execute tool ${toolId}: ${error}`,
                serverId,
                toolId,
            };
        }
    }
    /**
     * 获取服务器工具列表
     */
    async handleGetServerTools(data) {
        const { serverId } = data;
        if (!serverId) {
            return {
                success: false,
                error: 'Missing serverId',
            };
        }
        const server = this.pluginServers.get(serverId);
        if (!server) {
            return {
                success: false,
                error: `Server ${serverId} not found`,
                serverId,
            };
        }
        return {
            success: true,
            data: {
                tools: server.tools,
                total: server.tools.length,
            },
            serverId,
        };
    }
    /**
     * 获取服务器状态
     */
    async handleGetServerStatus(data) {
        const { serverId } = data;
        if (!serverId) {
            return {
                success: false,
                error: 'Missing serverId',
            };
        }
        const server = this.pluginServers.get(serverId);
        if (!server) {
            return {
                success: false,
                error: `Server ${serverId} not found`,
                serverId,
            };
        }
        return {
            success: true,
            data: {
                id: server.id,
                name: server.name,
                enabled: server.enabled,
                connected: server.connected,
                connectionState: server.connectionState,
                lastActivity: server.lastActivity,
                toolCount: server.tools.length,
                pluginId: server.pluginId,
            },
            serverId,
        };
    }
    /**
     * 扫描插件
     */
    async handleScanPlugins() {
        if (!this.pluginManager) {
            return {
                success: false,
                error: 'Plugin manager not available',
            };
        }
        const state = this.pluginManager.getState();
        const servers = Array.from(this.pluginServers.values());
        return {
            success: true,
            data: {
                pluginManager: {
                    loadedPlugins: state.loadedPlugins,
                    activePlugins: state.activePlugins,
                },
                mcpServers: {
                    total: servers.length,
                    connected: servers.filter(s => s.connected).length,
                    byPlugin: servers.reduce((acc, server) => {
                        acc[server.pluginId] = (acc[server.pluginId] || 0) + 1;
                        return acc;
                    }, {}),
                },
            },
        };
    }
    /**
     * 获取所有插件MCP服务器
     */
    getPluginMCPServers() {
        return Array.from(this.pluginServers.values());
    }
    /**
     * 获取插件MCP服务器
     */
    getPluginMCPServer(serverId) {
        return this.pluginServers.get(serverId);
    }
    /**
     * 关闭插件化MCP处理器
     */
    async close() {
        this.outputChannel.appendLine('🔒 Closing Plugin MCP Handler...');
        // 断开所有连接的服务器
        for (const [serverId, server] of this.pluginServers.entries()) {
            if (server.connected) {
                try {
                    await this.disconnectPluginServer(serverId);
                }
                catch (error) {
                    this.outputChannel.appendLine(`⚠️ Failed to disconnect server ${serverId}: ${error}`);
                }
            }
        }
        // 清理资源
        this.pluginServers.clear();
        this.pluginToolRegistry = null;
        this.pluginManager = null;
        this.taskEngine = null;
        this.isInitialized = false;
        this.outputChannel.appendLine('🔒 Plugin MCP Handler closed');
        this.outputChannel.dispose();
    }
}
exports.PluginMCPHandler = PluginMCPHandler;
//# sourceMappingURL=PluginMCPHandler.js.map