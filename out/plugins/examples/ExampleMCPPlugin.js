"use strict";
/**
 * 示例MCP插件
 * 展示如何创建和使用MCP插件
 * 基于Claude Code CP-20260402-003插件模式
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExampleMCPPlugin = void 0;
/**
 * 示例MCP插件
 */
class ExampleMCPPlugin {
    metadata;
    configSchema;
    dependencies;
    context = null;
    config;
    servers = new Map();
    connectedServers = new Set();
    constructor() {
        this.metadata = {
            id: 'example-mcp-plugin',
            name: '示例MCP插件',
            description: '一个展示MCP插件功能的示例插件',
            version: '1.0.0',
            author: 'CodeLine Team',
            categories: ['examples', 'mcp', 'servers'],
            keywords: ['example', 'mcp', 'server', 'demo'],
        };
        this.configSchema = {
            fields: {
                enableMockServer: {
                    type: 'boolean',
                    description: '是否启用模拟MCP服务器',
                    default: true,
                },
                mockServerPort: {
                    type: 'number',
                    description: '模拟服务器端口',
                    default: 8080,
                },
                autoConnectServers: {
                    type: 'boolean',
                    description: '是否自动连接服务器',
                    default: true,
                },
                debugMode: {
                    type: 'boolean',
                    description: '是否启用调试模式',
                    default: false,
                },
            },
        };
        this.config = {
            enableMockServer: true,
            mockServerPort: 8080,
            autoConnectServers: true,
            debugMode: false,
        };
    }
    /**
     * 插件激活
     */
    async activate(context) {
        this.context = context;
        // 合并配置
        this.config = { ...this.config, ...context.config };
        context.outputChannel.show(true);
        context.outputChannel.appendLine('🚀 Activating Example MCP Plugin...');
        // 初始化模拟服务器
        if (this.config.enableMockServer) {
            await this.initializeMockServers();
        }
        context.outputChannel.appendLine('✅ Example MCP Plugin activated');
    }
    /**
     * 插件停用
     */
    async deactivate() {
        if (this.context) {
            this.context.outputChannel.appendLine('⏸️ Deactivating Example MCP Plugin...');
        }
        // 断开所有服务器连接
        for (const serverId of this.connectedServers) {
            try {
                await this.disconnectMCPServer(serverId);
            }
            catch (error) {
                // 忽略断开连接错误
            }
        }
        this.connectedServers.clear();
        this.servers.clear();
        if (this.context) {
            this.context.outputChannel.appendLine('✅ Example MCP Plugin deactivated');
        }
        this.context = null;
    }
    /**
     * 获取工具
     */
    getTools() {
        // MCP插件不直接提供工具，工具由MCP服务器提供
        return [];
    }
    /**
     * 获取工具定义
     */
    getToolDefinitions() {
        // MCP插件不直接提供工具定义
        return [];
    }
    /**
     * 获取MCP服务器列表
     */
    async getMCPServers() {
        const servers = [];
        // 添加模拟服务器
        if (this.config.enableMockServer) {
            servers.push({
                id: 'mock-server-1',
                name: '模拟MCP服务器 1',
                description: '一个用于演示的模拟MCP服务器',
                version: '1.0.0',
                configuration: {
                    host: 'localhost',
                    port: this.config.mockServerPort,
                    protocol: 'ws',
                },
                enabled: true,
                tools: [
                    {
                        id: 'mock-tool-1',
                        name: '模拟工具 1',
                        description: '返回当前时间和日期',
                    },
                    {
                        id: 'mock-tool-2',
                        name: '模拟工具 2',
                        description: '生成随机数据',
                    },
                    {
                        id: 'mock-tool-3',
                        name: '模拟工具 3',
                        description: '执行模拟计算',
                    },
                ],
            });
            servers.push({
                id: 'mock-server-2',
                name: '模拟MCP服务器 2',
                description: '另一个用于演示的模拟MCP服务器',
                version: '1.0.0',
                configuration: {
                    host: 'localhost',
                    port: this.config.mockServerPort + 1,
                    protocol: 'http',
                },
                enabled: false,
                tools: [
                    {
                        id: 'mock-tool-a',
                        name: '模拟工具 A',
                        description: '模拟数据分析工具',
                    },
                    {
                        id: 'mock-tool-b',
                        name: '模拟工具 B',
                        description: '模拟机器学习工具',
                    },
                ],
            });
        }
        return servers;
    }
    /**
     * 连接MCP服务器
     */
    async connectMCPServer(serverId, configuration) {
        if (!this.context) {
            throw new Error('Plugin not activated');
        }
        const server = this.servers.get(serverId);
        if (!server) {
            throw new Error(`Server ${serverId} not found`);
        }
        this.context.outputChannel.appendLine(`🔌 Connecting to MCP server: ${server.name} (${serverId})`);
        // 模拟连接延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        // 模拟连接逻辑
        server.connected = true;
        server.lastConnectTime = new Date();
        this.servers.set(serverId, server);
        this.connectedServers.add(serverId);
        this.context.outputChannel.appendLine(`✅ Connected to MCP server: ${server.name}`);
        // 模拟服务器握手和工具发现
        if (this.config.debugMode) {
            this.context.outputChannel.appendLine(`📊 Server ${server.name} tools: ${server.tools?.length || 0} tools available`);
        }
    }
    /**
     * 断开MCP服务器
     */
    async disconnectMCPServer(serverId) {
        if (!this.context) {
            throw new Error('Plugin not activated');
        }
        const server = this.servers.get(serverId);
        if (!server) {
            throw new Error(`Server ${serverId} not found`);
        }
        this.context.outputChannel.appendLine(`🔌 Disconnecting from MCP server: ${server.name} (${serverId})`);
        // 模拟断开延迟
        await new Promise(resolve => setTimeout(resolve, 300));
        // 模拟断开逻辑
        server.connected = false;
        server.lastDisconnectTime = new Date();
        this.servers.set(serverId, server);
        this.connectedServers.delete(serverId);
        this.context.outputChannel.appendLine(`✅ Disconnected from MCP server: ${server.name}`);
    }
    /**
     * 启动MCP服务器
     */
    async startMCPServer() {
        if (!this.context) {
            throw new Error('Plugin not activated');
        }
        this.context.outputChannel.appendLine('🚀 Starting example MCP servers...');
        // 模拟服务器启动
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.context.outputChannel.appendLine('✅ Example MCP servers started');
    }
    /**
     * 停止MCP服务器
     */
    async stopMCPServer() {
        if (!this.context) {
            throw new Error('Plugin not activated');
        }
        this.context.outputChannel.appendLine('⏹️ Stopping example MCP servers...');
        // 断开所有连接的服务器
        for (const serverId of this.connectedServers) {
            try {
                await this.disconnectMCPServer(serverId);
            }
            catch (error) {
                // 忽略错误
            }
        }
        this.context.outputChannel.appendLine('✅ Example MCP servers stopped');
    }
    /**
     * 配置更新
     */
    async updateConfig(newConfig) {
        const oldConfig = this.config;
        this.config = { ...oldConfig, ...newConfig };
        if (this.context) {
            this.context.outputChannel.appendLine('⚙️ Example MCP Plugin config updated');
            // 如果服务器启用状态变化，重新初始化
            if (newConfig.enableMockServer !== oldConfig.enableMockServer) {
                if (newConfig.enableMockServer) {
                    await this.initializeMockServers();
                }
                else {
                    await this.stopMCPServer();
                }
            }
        }
    }
    /**
     * 健康检查
     */
    async healthCheck() {
        const serverCount = this.servers.size;
        const connectedCount = this.connectedServers.size;
        const healthy = serverCount > 0;
        return {
            healthy,
            message: healthy
                ? `Example MCP Plugin is healthy (${serverCount} servers, ${connectedCount} connected)`
                : 'Example MCP Plugin has no servers configured',
            details: {
                serverCount,
                connectedCount,
                config: this.config,
                servers: Array.from(this.servers.values()).map(server => ({
                    id: server.id,
                    name: server.name,
                    connected: server.connected,
                })),
            },
        };
    }
    // ========== 私有方法 ==========
    /**
     * 初始化模拟服务器
     */
    async initializeMockServers() {
        if (!this.context) {
            return;
        }
        this.context.outputChannel.appendLine('🔧 Initializing mock MCP servers...');
        // 获取服务器配置
        const servers = await this.getMCPServers();
        for (const server of servers) {
            this.servers.set(server.id, {
                ...server,
                connected: false,
                lastConnectTime: null,
                lastDisconnectTime: null,
            });
            this.context.outputChannel.appendLine(`📡 Registered mock server: ${server.name} (${server.id})`);
            // 自动连接启用的服务器
            if (this.config.autoConnectServers && server.enabled) {
                try {
                    await this.connectMCPServer(server.id, server.configuration);
                }
                catch (error) {
                    this.context.outputChannel.appendLine(`⚠️ Failed to auto-connect server ${server.id}: ${error}`);
                }
            }
        }
        this.context.outputChannel.appendLine(`✅ Initialized ${servers.length} mock MCP servers`);
    }
    /**
     * 执行模拟MCP工具
     * 仅供内部使用
     */
    async executeMockTool(serverId, toolId, params) {
        const server = this.servers.get(serverId);
        if (!server) {
            throw new Error(`Server ${serverId} not found`);
        }
        if (!server.connected) {
            throw new Error(`Server ${serverId} is not connected`);
        }
        const tool = server.tools?.find((t) => t.id === toolId);
        if (!tool) {
            throw new Error(`Tool ${toolId} not found on server ${serverId}`);
        }
        // 模拟工具执行
        switch (toolId) {
            case 'mock-tool-1':
                return {
                    success: true,
                    data: {
                        toolId,
                        serverId,
                        result: {
                            timestamp: new Date().toISOString(),
                            date: new Date().toLocaleDateString(),
                            time: new Date().toLocaleTimeString(),
                            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        },
                    },
                };
            case 'mock-tool-2':
                return {
                    success: true,
                    data: {
                        toolId,
                        serverId,
                        result: {
                            randomNumber: Math.random(),
                            randomString: Math.random().toString(36).substring(2, 10),
                            randomBoolean: Math.random() > 0.5,
                            randomArray: Array.from({ length: 5 }, () => Math.random()),
                        },
                    },
                };
            case 'mock-tool-3':
                const { operation = 'add', a = 0, b = 0 } = params || {};
                let result;
                switch (operation) {
                    case 'add':
                        result = a + b;
                        break;
                    case 'subtract':
                        result = a - b;
                        break;
                    case 'multiply':
                        result = a * b;
                        break;
                    case 'divide':
                        result = b !== 0 ? a / b : NaN;
                        break;
                    default:
                        result = a + b;
                }
                return {
                    success: true,
                    data: {
                        toolId,
                        serverId,
                        result: {
                            operation,
                            a,
                            b,
                            result,
                            expression: `${a} ${operation} ${b} = ${result}`,
                        },
                    },
                };
            default:
                return {
                    success: true,
                    data: {
                        toolId,
                        serverId,
                        result: `Mock tool ${toolId} executed successfully`,
                        params,
                    },
                };
        }
    }
}
exports.ExampleMCPPlugin = ExampleMCPPlugin;
//# sourceMappingURL=ExampleMCPPlugin.js.map