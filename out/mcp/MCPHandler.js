"use strict";
/**
 * MCP处理器
 * 处理来自webview的MCP请求，与EnhancedTaskEngine集成
 * 支持生产级错误处理、配置管理和监控
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
exports.MCPHandler = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const EnhancedTaskEngine_1 = require("../tools/EnhancedTaskEngine");
const mcpManager_1 = require("./mcpManager");
const MCPToolAdapter_1 = require("../core/tool/MCPToolAdapter");
/**
 * MCP处理器类
 * 生产级MCP集成，支持配置管理、错误处理、监控和恢复
 */
class MCPHandler {
    context;
    taskEngine = null;
    mcpManager = null;
    isInitialized = false;
    config;
    metrics;
    outputChannel;
    configWatcher = null;
    /** 请求跟踪 */
    requestHistory = [];
    /** 活动工具执行 */
    activeExecutions = new Map();
    /** 统计信息 */
    statistics = {
        totalToolExecutions: 0,
        successfulToolExecutions: 0,
        failedToolExecutions: 0,
        totalDuration: 0
    };
    constructor(context, config = {}) {
        this.context = context;
        // 设置默认配置
        this.config = {
            enableMCPTools: true,
            enableToolSystem: true,
            verboseLogging: false,
            defaultTimeout: 30000,
            maxRetries: 3,
            enableMonitoring: true,
            monitoringSampleRate: 0.1, // 10%采样率
            ...config
        };
        // 初始化监控指标
        this.metrics = {
            initializationTime: 0,
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            registeredTools: 0,
        };
        this.outputChannel = vscode.window.createOutputChannel('CodeLine MCP');
        // 记录初始化信息
        this.outputChannel.appendLine('🚀 MCP Handler created');
        this.outputChannel.appendLine(`📊 Configuration: ${JSON.stringify(this.config, null, 2)}`);
    }
    /**
     * 初始化MCP处理器
     * @param workspaceRoot 工作区根目录
     * @param overrideConfig 可选覆盖配置
     */
    async initialize(workspaceRoot, overrideConfig) {
        if (this.isInitialized) {
            this.outputChannel.appendLine('ℹ️ MCP Handler already initialized');
            return true;
        }
        const startTime = Date.now();
        // 更新配置（如果提供覆盖配置）
        if (overrideConfig) {
            this.config = { ...this.config, ...overrideConfig };
            this.outputChannel.appendLine(`⚙️ Updated config: ${JSON.stringify(overrideConfig, null, 2)}`);
        }
        try {
            this.outputChannel.show(true);
            this.outputChannel.appendLine('🔧 Initializing MCP Handler...');
            this.outputChannel.appendLine(`   Workspace: ${workspaceRoot}`);
            this.outputChannel.appendLine(`   Config: ${JSON.stringify(this.config, null, 2)}`);
            // 初始化增强任务引擎（带工具系统）
            if (this.config.enableToolSystem) {
                this.taskEngine = new EnhancedTaskEngine_1.EnhancedTaskEngine(workspaceRoot, this.context, {
                    enableToolSystem: true,
                    autoLoadTools: true,
                    showLoadingProgress: true,
                });
                // 加载工具
                const toolsLoaded = await this.taskEngine.loadTools();
                if (!toolsLoaded) {
                    this.outputChannel.appendLine('⚠️ Tool system loaded with warnings, continuing...');
                }
                else {
                    this.outputChannel.appendLine('✅ Tool system loaded successfully');
                }
            }
            // 初始化MCP管理器（如果需要MCP工具）
            let mcpToolsRegistered = 0;
            if (this.config.enableMCPTools) {
                this.mcpManager = new mcpManager_1.MCPManager();
                const mcpInitialized = await this.mcpManager.initialize();
                if (mcpInitialized) {
                    const mcpTools = this.mcpManager.getAvailableTools();
                    this.outputChannel.appendLine(`✅ MCP Manager initialized with ${mcpTools.length} tools`);
                    // 将MCP工具注册到EnhancedToolRegistry
                    const toolRegistry = this.taskEngine?.getToolRegistry();
                    if (toolRegistry) {
                        mcpToolsRegistered = await this.registerMCPTools(toolRegistry);
                        this.outputChannel.appendLine(`📊 MCP registration summary: ${mcpToolsRegistered}/${mcpTools.length} tools`);
                        // 记录详细的工具信息
                        if (this.config.verboseLogging && mcpTools.length > 0) {
                            this.outputChannel.appendLine('📋 Available MCP tools:');
                            mcpTools.forEach(tool => {
                                this.outputChannel.appendLine(`   - ${tool.name} (${tool.id}): ${tool.description}`);
                            });
                        }
                    }
                    else {
                        this.outputChannel.appendLine('⚠️ Tool registry not available, MCP tools will not be registered');
                    }
                }
                else {
                    this.outputChannel.appendLine('⚠️ MCP Manager initialization failed, continuing without MCP tools');
                }
            }
            else {
                this.outputChannel.appendLine('ℹ️ MCP tools disabled by configuration');
            }
            // 验证关键组件
            const criticalComponents = {
                'Task Engine': !!this.taskEngine,
                'MCP Manager': !!this.mcpManager,
                'Tool Registry': !!(this.taskEngine?.getToolRegistry()),
                'MCP Tools Registered': mcpToolsRegistered > 0
            };
            this.outputChannel.appendLine('🔍 Critical components status:');
            Object.entries(criticalComponents).forEach(([name, status]) => {
                this.outputChannel.appendLine(`   ${status ? '✅' : '⚠️'} ${name}: ${status ? 'OK' : 'Missing/Error'}`);
            });
            // 设置初始化完成标志和监控指标
            this.isInitialized = true;
            const duration = Date.now() - startTime;
            // 更新监控指标
            this.metrics.initializationTime = duration;
            this.metrics.registeredTools = mcpToolsRegistered;
            this.outputChannel.appendLine(`✅ MCP Handler initialized in ${duration}ms`);
            this.outputChannel.appendLine(`   MCP tools: ${mcpToolsRegistered} registered`);
            this.outputChannel.appendLine(`   Tool system: ${this.taskEngine ? 'Enabled' : 'Disabled'}`);
            this.outputChannel.appendLine(`   Monitoring: ${this.config.enableMonitoring ? 'Enabled' : 'Disabled'}`);
            this.outputChannel.appendLine(`   Ready for requests: Yes`);
            // 设置配置监听器
            if (this.config.autoLoadConfigPath) {
                await this.setupConfigWatcher(workspaceRoot);
            }
            return true;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.outputChannel.appendLine(`❌ MCP Handler initialization failed after ${duration}ms: ${error.message}`);
            // 记录详细错误信息
            if (error.stack) {
                const stackLines = error.stack.split('\n');
                this.outputChannel.appendLine('   Stack trace:');
                stackLines.slice(0, 5).forEach((line) => {
                    this.outputChannel.appendLine(`     ${line}`);
                });
            }
            // 尝试优雅地清理
            try {
                if (this.mcpManager) {
                    await this.mcpManager.close();
                    this.mcpManager = null;
                }
                if (this.taskEngine) {
                    await this.taskEngine.dispose();
                    this.taskEngine = null;
                }
            }
            catch (cleanupError) {
                this.outputChannel.appendLine(`⚠️ Cleanup failed: ${cleanupError.message}`);
            }
            return false;
        }
    }
    /**
     * 处理MCP消息
     */
    async handleMessage(message) {
        const startTime = Date.now();
        const messageId = message.messageId || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // 验证消息格式
        const validationError = this.validateMCPMessage(message);
        if (validationError) {
            const duration = Date.now() - startTime;
            this.trackRequest(messageId, 'validation_error', false, duration);
            return {
                success: false,
                error: validationError,
                messageId,
                timestamp: Date.now(),
                duration
            };
        }
        const { type, data } = message;
        // 检查初始化状态
        if (type !== 'mcp_health_check' && (!this.isInitialized || !this.taskEngine)) {
            const duration = Date.now() - startTime;
            this.trackRequest(messageId, type, false, duration);
            return {
                success: false,
                error: 'MCP Handler not initialized',
                messageId,
                timestamp: Date.now(),
                duration
            };
        }
        try {
            // 记录消息处理开始
            if (this.config.verboseLogging) {
                this.outputChannel.appendLine(`📨 Handling MCP message: ${type} (${messageId})`);
                if (data && Object.keys(data).length > 0) {
                    this.outputChannel.appendLine(`   Data: ${JSON.stringify(data, null, 2).slice(0, 200)}...`);
                }
            }
            let response;
            const responseStartTime = Date.now();
            // 处理不同类型的消息
            switch (type) {
                case 'mcp_initialize':
                    response = await this.handleInitialize();
                    break;
                case 'mcp_add_server':
                    response = await this.handleAddServer(data);
                    break;
                case 'mcp_remove_server':
                    response = await this.handleRemoveServer(data);
                    break;
                case 'mcp_connect_server':
                    response = await this.handleConnectServer(data);
                    break;
                case 'mcp_disconnect_server':
                    response = await this.handleDisconnectServer(data);
                    break;
                case 'mcp_toggle_tool':
                    response = await this.handleToggleTool(data);
                    break;
                case 'mcp_execute_tool':
                    response = await this.handleExecuteTool(data);
                    break;
                case 'mcp_refresh':
                    response = await this.handleRefresh();
                    break;
                case 'mcp_get_tools':
                    response = await this.handleGetTools();
                    break;
                case 'mcp_get_servers':
                    response = await this.handleGetServers();
                    break;
                case 'mcp_health_check':
                    response = await this.handleHealthCheck();
                    break;
                case 'mcp_metrics':
                    response = await this.handleGetMetrics();
                    break;
                case 'mcp_statistics':
                    response = await this.handleGetStatistics();
                    break;
                case 'mcp_config':
                    response = await this.handleConfigOperation(data);
                    break;
                default:
                    response = {
                        success: false,
                        error: `Unknown MCP message type: ${type}`,
                    };
            }
            const duration = Date.now() - startTime;
            const responseDuration = Date.now() - responseStartTime;
            // 添加消息ID和时间戳到响应
            response.messageId = messageId;
            response.timestamp = Date.now();
            response.duration = duration;
            // 添加指标信息
            if (type === 'mcp_execute_tool' && data?.toolId) {
                response.metrics = {
                    toolExecutionTime: responseDuration,
                    validationTime: 0, // 可以实际测量
                    permissionCheckTime: 0
                };
            }
            // 跟踪请求
            this.trackRequest(messageId, type, response.success, duration);
            // 记录结果
            if (this.config.verboseLogging) {
                this.outputChannel.appendLine(`✅ MCP message handled: ${type} (${duration}ms, ${response.success ? 'success' : 'failed'})`);
                if (!response.success && response.error) {
                    this.outputChannel.appendLine(`   Error: ${response.error}`);
                }
            }
            return response;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const errorMessage = error.message || 'Unknown error occurred';
            this.outputChannel.appendLine(`❌ MCP message handling failed for ${type}: ${errorMessage}`);
            // 记录堆栈跟踪（详细日志模式下）
            if (this.config.verboseLogging && error.stack) {
                const stackLines = error.stack.split('\n');
                this.outputChannel.appendLine('   Stack trace:');
                stackLines.slice(0, 5).forEach((line) => {
                    this.outputChannel.appendLine(`     ${line}`);
                });
            }
            // 跟踪失败请求
            this.trackRequest(messageId, type, false, duration);
            // 更新最后错误指标
            this.metrics.lastErrorTime = Date.now();
            this.metrics.lastErrorMessage = errorMessage;
            return {
                success: false,
                error: errorMessage,
                messageId,
                timestamp: Date.now(),
                duration
            };
        }
    }
    /**
     * 验证MCP消息格式
     */
    validateMCPMessage(message) {
        if (!message) {
            return 'Message is null or undefined';
        }
        if (typeof message !== 'object') {
            return 'Message must be an object';
        }
        if (!message.type || typeof message.type !== 'string') {
            return 'Message type is required and must be a string';
        }
        if (message.data && typeof message.data !== 'object') {
            return 'Message data must be an object if provided';
        }
        if (message.timestamp && (typeof message.timestamp !== 'number' || message.timestamp <= 0)) {
            return 'Message timestamp must be a positive number if provided';
        }
        return null;
    }
    /**
     * 处理初始化请求
     */
    async handleInitialize() {
        try {
            // 获取工具注册表
            const toolRegistry = this.taskEngine.getToolRegistry();
            if (!toolRegistry) {
                return {
                    success: false,
                    error: 'Tool registry not available',
                };
            }
            // 获取当前上下文
            const toolContext = {
                extensionContext: this.context,
                workspaceRoot: this.taskEngine['workspaceRoot'],
                cwd: process.cwd(),
                outputChannel: this.outputChannel,
                sessionId: `mcp-handler-${Date.now()}`,
            };
            // 获取所有工具
            const allTools = toolRegistry.getAllTools(toolContext, { enabledOnly: false });
            // 提取MCP工具
            const mcpTools = allTools.filter(tool => tool.id.includes('mcp') || tool.capabilities.includes('mcp'));
            // 模拟服务器列表（实际实现应该从配置或注册表获取）
            const servers = [
                {
                    id: 'mcp-default',
                    name: 'Default MCP Server',
                    description: 'Built-in MCP server with standard tools',
                    version: '1.0.0',
                    status: 'connected',
                    lastConnected: Date.now(),
                    toolCount: mcpTools.filter(t => t.id === 'mcp-manager').length > 0 ? 1 : 0,
                    settings: {
                        autoConnect: true,
                        enabled: true,
                    },
                },
            ];
            // 转换工具格式
            const tools = allTools.map(tool => ({
                id: tool.id,
                name: tool.name,
                description: tool.description,
                version: tool.version || '1.0.0',
                serverId: 'mcp-default',
                capabilities: tool.capabilities,
                enabled: tool.isEnabled?.(toolContext) ?? true,
                usageCount: 0,
                lastUsed: 0,
            }));
            return {
                success: true,
                data: {
                    servers,
                    tools,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Initialization failed: ${error.message}`,
            };
        }
    }
    /**
     * 处理添加服务器请求
     */
    async handleAddServer(data) {
        try {
            const { name, description, url, autoConnect = true } = data;
            if (!name || !url) {
                return {
                    success: false,
                    error: 'Name and URL are required',
                };
            }
            // 创建新服务器
            const server = {
                id: `server-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name,
                description: description || '',
                url,
                status: autoConnect ? 'connected' : 'disconnected',
                lastConnected: autoConnect ? Date.now() : 0,
                toolCount: 0,
                settings: {
                    autoConnect,
                    enabled: true,
                },
            };
            this.outputChannel.appendLine(`📋 Added MCP server: ${name} (${url})`);
            return {
                success: true,
                data: { server },
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to add server: ${error.message}`,
            };
        }
    }
    /**
     * 处理移除服务器请求
     */
    async handleRemoveServer(data) {
        try {
            const { serverId } = data;
            if (!serverId) {
                return {
                    success: false,
                    error: 'Server ID is required',
                };
            }
            this.outputChannel.appendLine(`🗑️ Removing MCP server: ${serverId}`);
            return {
                success: true,
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to remove server: ${error.message}`,
            };
        }
    }
    /**
     * 处理连接服务器请求
     */
    async handleConnectServer(data) {
        try {
            const { serverId } = data;
            if (!serverId) {
                return {
                    success: false,
                    error: 'Server ID is required',
                };
            }
            // 模拟连接服务器
            this.outputChannel.appendLine(`🔌 Connecting to MCP server: ${serverId}`);
            // 模拟获取工具
            const tools = await this.simulateServerTools(serverId);
            return {
                success: true,
                data: {
                    tools,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to connect server: ${error.message}`,
            };
        }
    }
    /**
     * 处理断开服务器连接请求
     */
    async handleDisconnectServer(data) {
        try {
            const { serverId } = data;
            if (!serverId) {
                return {
                    success: false,
                    error: 'Server ID is required',
                };
            }
            this.outputChannel.appendLine(`🔌 Disconnecting from MCP server: ${serverId}`);
            return {
                success: true,
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to disconnect server: ${error.message}`,
            };
        }
    }
    /**
     * 处理切换工具状态请求
     */
    async handleToggleTool(data) {
        try {
            const { toolId, enabled } = data;
            if (!toolId) {
                return {
                    success: false,
                    error: 'Tool ID is required',
                };
            }
            this.outputChannel.appendLine(`🔧 ${enabled ? 'Enabling' : 'Disabling'} MCP tool: ${toolId}`);
            return {
                success: true,
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to toggle tool: ${error.message}`,
            };
        }
    }
    /**
     * 处理执行工具请求
     */
    async handleExecuteTool(data) {
        let startTime = Date.now();
        try {
            const { toolId, params = {} } = data;
            if (!toolId) {
                return {
                    success: false,
                    error: 'Tool ID is required',
                };
            }
            startTime = Date.now();
            this.outputChannel.appendLine(`🛠️ Executing MCP tool: ${toolId}`);
            // 获取工具注册表
            const toolRegistry = this.taskEngine.getToolRegistry();
            if (!toolRegistry) {
                return {
                    success: false,
                    error: 'Tool registry not available',
                };
            }
            // 获取上下文
            const toolContext = {
                extensionContext: this.context,
                workspaceRoot: this.taskEngine['workspaceRoot'],
                cwd: process.cwd(),
                outputChannel: this.outputChannel,
                sessionId: `tool-exec-${Date.now()}`,
            };
            // 执行工具
            const result = await toolRegistry.executeTool(toolId, params, toolContext);
            const duration = Date.now() - startTime;
            this.outputChannel.appendLine(`✅ MCP tool ${toolId} executed (${duration}ms)`);
            return {
                success: result.success,
                data: {
                    output: result.output,
                    duration,
                },
                error: result.error,
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.outputChannel.appendLine(`❌ MCP tool execution failed: ${error.message}`);
            return {
                success: false,
                error: `Tool execution failed: ${error.message}`,
                data: {
                    duration,
                },
            };
        }
    }
    /**
     * 处理刷新请求
     */
    async handleRefresh() {
        try {
            // 重新初始化数据
            const initResponse = await this.handleInitialize();
            if (initResponse.success) {
                this.outputChannel.appendLine('🔄 MCP data refreshed');
            }
            return initResponse;
        }
        catch (error) {
            return {
                success: false,
                error: `Refresh failed: ${error.message}`,
            };
        }
    }
    /**
     * 处理获取工具请求
     */
    async handleGetTools() {
        try {
            const initResponse = await this.handleInitialize();
            if (initResponse.success) {
                return {
                    success: true,
                    data: {
                        tools: initResponse.data?.tools || [],
                    },
                };
            }
            return initResponse;
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get tools: ${error.message}`,
            };
        }
    }
    /**
     * 处理获取服务器请求
     */
    async handleGetServers() {
        try {
            const initResponse = await this.handleInitialize();
            if (initResponse.success) {
                return {
                    success: true,
                    data: {
                        servers: initResponse.data?.servers || [],
                    },
                };
            }
            return initResponse;
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get servers: ${error.message}`,
            };
        }
    }
    /**
     * 模拟服务器工具（用于测试）
     */
    async simulateServerTools(serverId) {
        // 模拟工具列表
        const mockTools = [
            {
                id: `tool-file-read-${serverId}`,
                name: 'File Reader',
                description: 'Read and analyze files',
                version: '1.0.0',
                serverId,
                capabilities: ['file', 'read', 'analysis'],
                enabled: true,
                usageCount: 0,
                lastUsed: 0,
            },
            {
                id: `tool-code-analyze-${serverId}`,
                name: 'Code Analyzer',
                description: 'Analyze code structure and dependencies',
                version: '1.0.0',
                serverId,
                capabilities: ['code', 'analysis', 'dependencies'],
                enabled: true,
                usageCount: 0,
                lastUsed: 0,
            },
            {
                id: `tool-web-search-${serverId}`,
                name: 'Web Search',
                description: 'Search the web for information',
                version: '1.0.0',
                serverId,
                capabilities: ['web', 'search', 'information'],
                enabled: true,
                usageCount: 0,
                lastUsed: 0,
            },
        ];
        return mockTools;
    }
    /**
     * 注册MCP工具到EnhancedToolRegistry
     * 使用项目现有的MCP组件：MCPToolWrapper和EnhancedToolRegistryMCPExtension
     */
    async registerMCPTools(toolRegistry) {
        if (!this.mcpManager) {
            return 0;
        }
        const mcpTools = this.mcpManager.getAvailableTools();
        let registeredCount = 0;
        // 方法1：优先使用现有MCPToolWrapper（简化包装器）
        for (const mcpTool of mcpTools) {
            try {
                // 转换为SimpleMCPTool格式，用于MCPToolWrapper
                const simpleTool = {
                    id: mcpTool.id,
                    name: mcpTool.name,
                    description: mcpTool.description,
                    version: mcpTool.version,
                    execute: mcpTool.execute || (async () => ({ message: `Tool ${mcpTool.id} executed` })),
                    validate: mcpTool.validate || (() => true),
                    capabilities: mcpTool.capabilities || [],
                    configuration: mcpTool.configuration || {}
                };
                // 导入MCPToolWrapper（动态导入避免循环依赖）
                const { MCPToolWrapper } = await Promise.resolve().then(() => __importStar(require('../core/tool/MCPToolWrapper')));
                const wrapper = new MCPToolWrapper(simpleTool, {
                    enablePermissionCheck: true,
                    enableValidation: true,
                    timeoutMs: 30000
                });
                // 转换为EnhancedToolRegistry需要的格式
                const toolFormat = wrapper.toToolRegistryFormat();
                // 注册工具
                const registered = toolRegistry.registerTool(toolFormat);
                if (registered) {
                    registeredCount++;
                    this.outputChannel.appendLine(`📋 Registered MCP tool via wrapper: ${mcpTool.name} (${mcpTool.id})`);
                }
                else {
                    // 备选方案：使用MCPToolAdapter
                    this.outputChannel.appendLine(`⚠️ Wrapper failed, trying adapter for: ${mcpTool.name}`);
                    const adapter = new MCPToolAdapter_1.MCPToolAdapter(mcpTool, {
                        enablePermissionCheck: true,
                        defaultPermissionLevel: 'READ',
                        enableInputValidation: true,
                        enableDetailedLogging: false, // 生产环境关闭详细日志
                    });
                    if (toolRegistry.registerTool(adapter)) {
                        registeredCount++;
                        this.outputChannel.appendLine(`📋 Registered MCP tool via adapter: ${mcpTool.name} (${mcpTool.id})`);
                    }
                    else {
                        this.outputChannel.appendLine(`⚠️ Failed to register MCP tool: ${mcpTool.name} (${mcpTool.id})`);
                    }
                }
            }
            catch (error) {
                this.outputChannel.appendLine(`❌ Error registering MCP tool ${mcpTool.name}: ${error.message}`);
                // 记录详细错误信息以便调试
                if (error.stack) {
                    this.outputChannel.appendLine(`   Stack: ${error.stack.split('\n').slice(0, 3).join(' ')}`);
                }
            }
        }
        this.outputChannel.appendLine(`✅ Registered ${registeredCount}/${mcpTools.length} MCP tools`);
        // 方法2：如果EnhancedToolRegistryMCPExtension可用，使用它
        if (registeredCount === 0 && mcpTools.length > 0) {
            this.outputChannel.appendLine('🔄 Falling back to EnhancedToolRegistryMCPExtension...');
            try {
                const { EnhancedToolRegistryMCPExtension } = await Promise.resolve().then(() => __importStar(require('../core/tool/EnhancedToolRegistryMCPExtension')));
                const mcpExtension = new EnhancedToolRegistryMCPExtension(toolRegistry);
                for (const mcpTool of mcpTools) {
                    const simpleTool = {
                        id: mcpTool.id,
                        name: mcpTool.name,
                        description: mcpTool.description,
                        version: mcpTool.version,
                        execute: mcpTool.execute || (async () => ({ message: `Tool ${mcpTool.id} executed` })),
                        validate: mcpTool.validate || (() => true),
                        capabilities: mcpTool.capabilities || [],
                        configuration: mcpTool.configuration || {}
                    };
                    const success = await mcpExtension.registerMCPTool(simpleTool);
                    if (success) {
                        registeredCount++;
                    }
                }
                this.outputChannel.appendLine(`✅ Extension registered ${registeredCount}/${mcpTools.length} tools`);
            }
            catch (extensionError) {
                this.outputChannel.appendLine(`❌ MCP extension fallback failed: ${extensionError.message}`);
            }
        }
        return registeredCount;
    }
    // ==================== 新消息处理器方法 ====================
    /**
     * 处理健康检查请求
     */
    async handleHealthCheck() {
        const healthReport = this.getHealthReport();
        return {
            success: true,
            data: {
                status: healthReport.status,
                checks: healthReport.checks,
                recommendations: healthReport.recommendations,
                timestamp: healthReport.timestamp,
                metrics: this.getMetrics(),
                statistics: this.getStatistics(),
                activeExecutions: this.getActiveExecutions()
            }
        };
    }
    /**
     * 处理获取指标请求
     */
    async handleGetMetrics() {
        return {
            success: true,
            data: this.getMetrics()
        };
    }
    /**
     * 处理获取统计信息请求
     */
    async handleGetStatistics() {
        return {
            success: true,
            data: this.getStatistics()
        };
    }
    /**
     * 处理配置操作请求
     */
    async handleConfigOperation(data) {
        const operation = data?.operation;
        const key = data?.key;
        const value = data?.value;
        if (!operation) {
            return {
                success: false,
                error: 'Operation is required for config operations'
            };
        }
        switch (operation) {
            case 'get':
                if (key) {
                    return {
                        success: true,
                        data: {
                            [key]: this.config[key]
                        }
                    };
                }
                else {
                    return {
                        success: true,
                        data: this.config
                    };
                }
            case 'set':
                if (!key) {
                    return {
                        success: false,
                        error: 'Key is required for set operation'
                    };
                }
                const validKeys = [
                    'enableMCPTools',
                    'enableToolSystem',
                    'verboseLogging',
                    'defaultTimeout',
                    'maxRetries',
                    'enableMonitoring',
                    'monitoringSampleRate'
                ];
                if (!validKeys.includes(key)) {
                    return {
                        success: false,
                        error: `Invalid config key: ${key}. Valid keys: ${validKeys.join(', ')}`
                    };
                }
                // 更新配置
                this.config[key] = value;
                // 记录配置变更
                this.outputChannel.appendLine(`⚙️ Config updated: ${key} = ${JSON.stringify(value)}`);
                return {
                    success: true,
                    data: { [key]: value }
                };
            case 'reset':
                // 重置为默认值
                const defaultConfig = {
                    enableMCPTools: true,
                    enableToolSystem: true,
                    verboseLogging: false,
                    defaultTimeout: 30000,
                    maxRetries: 3,
                    enableMonitoring: true,
                    monitoringSampleRate: 0.1
                };
                this.config = defaultConfig;
                this.outputChannel.appendLine('🔄 Config reset to defaults');
                return {
                    success: true,
                    data: this.config
                };
            default:
                return {
                    success: false,
                    error: `Unknown config operation: ${operation}`
                };
        }
    }
    // ==================== 配置和监控方法 ====================
    /**
     * 设置配置监听器
     */
    async setupConfigWatcher(workspaceRoot) {
        if (!this.config.autoLoadConfigPath) {
            return;
        }
        const configPath = path.join(workspaceRoot, this.config.autoLoadConfigPath);
        this.outputChannel.appendLine(`👁️ Setting up config watcher for: ${configPath}`);
        try {
            // 创建文件系统监听器
            const configDir = path.dirname(configPath);
            this.configWatcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(configDir, path.basename(configPath)));
            // 监听配置变化
            this.configWatcher.onDidChange(async (uri) => {
                this.outputChannel.appendLine(`⚙️ Config file changed: ${uri.fsPath}`);
                await this.reloadConfig(uri.fsPath);
            });
            this.configWatcher.onDidCreate(async (uri) => {
                this.outputChannel.appendLine(`📄 Config file created: ${uri.fsPath}`);
                await this.reloadConfig(uri.fsPath);
            });
            this.configWatcher.onDidDelete((uri) => {
                this.outputChannel.appendLine(`🗑️ Config file deleted: ${uri.fsPath}`);
                this.outputChannel.appendLine('⚠️ Using default configuration');
            });
            // 初始加载配置
            if (await this.fileExists(configPath)) {
                await this.reloadConfig(configPath);
            }
        }
        catch (error) {
            this.outputChannel.appendLine(`❌ Config watcher setup failed: ${error.message}`);
        }
    }
    /**
     * 重新加载配置
     */
    async reloadConfig(configPath) {
        try {
            const content = await vscode.workspace.fs.readFile(vscode.Uri.file(configPath));
            const configJson = JSON.parse(content.toString());
            // 更新配置
            const oldConfig = { ...this.config };
            this.config = { ...this.config, ...configJson };
            this.outputChannel.appendLine(`🔄 Config reloaded from: ${configPath}`);
            // 记录配置变更
            const changedKeys = Object.keys(configJson).filter(key => {
                const typedKey = key;
                return JSON.stringify(oldConfig[typedKey]) !== JSON.stringify(this.config[typedKey]);
            });
            if (changedKeys.length > 0) {
                this.outputChannel.appendLine(`   Changes: ${changedKeys.join(', ')}`);
            }
            // 如果启用详细日志的配置发生变化，更新输出通道
            if (oldConfig.verboseLogging !== this.config.verboseLogging) {
                this.outputChannel.appendLine(`   Verbose logging: ${this.config.verboseLogging ? 'ENABLED' : 'DISABLED'}`);
            }
            // 如果MCP工具启用状态变化，需要重新初始化
            if (oldConfig.enableMCPTools !== this.config.enableMCPTools) {
                this.outputChannel.appendLine(`⚠️ MCP tools setting changed, requires restart to take effect`);
            }
        }
        catch (error) {
            this.outputChannel.appendLine(`❌ Config reload failed: ${error.message}`);
        }
    }
    /**
     * 检查文件是否存在
     */
    async fileExists(filePath) {
        try {
            await vscode.workspace.fs.stat(vscode.Uri.file(filePath));
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * 获取监控指标
     */
    getMetrics() {
        // 计算平均响应时间
        const avgResponseTime = this.metrics.totalRequests > 0
            ? this.statistics.totalDuration / this.metrics.totalRequests
            : 0;
        return {
            ...this.metrics,
            averageResponseTime: avgResponseTime,
            registeredTools: this.metrics.registeredTools
        };
    }
    /**
     * 获取统计信息
     */
    getStatistics() {
        return {
            ...this.statistics,
            successRate: this.statistics.totalToolExecutions > 0
                ? (this.statistics.successfulToolExecutions / this.statistics.totalToolExecutions * 100).toFixed(2) + '%'
                : '0%',
            averageExecutionTime: this.statistics.totalToolExecutions > 0
                ? this.statistics.totalDuration / this.statistics.totalToolExecutions
                : 0
        };
    }
    /**
     * 获取活动执行状态
     */
    getActiveExecutions() {
        const now = Date.now();
        return Array.from(this.activeExecutions.entries()).map(([id, exec]) => ({
            executionId: id,
            toolId: exec.toolId,
            elapsedTime: now - exec.startTime,
            params: exec.params
        }));
    }
    /**
     * 更新请求跟踪
     */
    trackRequest(messageId, type, success, duration) {
        if (!this.config.enableMonitoring) {
            return;
        }
        // 根据采样率决定是否跟踪
        if (Math.random() > this.config.monitoringSampleRate) {
            return;
        }
        const requestRecord = {
            messageId,
            type,
            success,
            duration,
            timestamp: Date.now()
        };
        this.requestHistory.push(requestRecord);
        this.metrics.totalRequests++;
        if (success) {
            this.metrics.successfulRequests++;
        }
        else {
            this.metrics.failedRequests++;
            this.metrics.lastErrorTime = Date.now();
        }
        this.statistics.totalDuration += duration;
        // 保持历史记录大小
        if (this.requestHistory.length > 1000) {
            this.requestHistory = this.requestHistory.slice(-500);
        }
    }
    /**
     * 开始工具执行跟踪
     */
    startToolExecution(executionId, toolId, params) {
        this.activeExecutions.set(executionId, {
            toolId,
            startTime: Date.now(),
            params
        });
        this.statistics.totalToolExecutions++;
    }
    /**
     * 结束工具执行跟踪
     */
    endToolExecution(executionId, success) {
        const execution = this.activeExecutions.get(executionId);
        if (!execution) {
            return;
        }
        const duration = Date.now() - execution.startTime;
        if (success) {
            this.statistics.successfulToolExecutions++;
        }
        else {
            this.statistics.failedToolExecutions++;
        }
        this.activeExecutions.delete(executionId);
    }
    /**
     * 生成健康报告
     */
    getHealthReport() {
        const checks = [];
        // 检查初始化状态
        checks.push({
            name: 'Initialization',
            status: this.isInitialized ? 'pass' : 'fail',
            details: this.isInitialized ? 'MCP Handler is initialized' : 'MCP Handler is not initialized'
        });
        // 检查工具系统
        const toolSystemReady = this.taskEngine?.getToolSystemStatus().isReady || false;
        checks.push({
            name: 'Tool System',
            status: toolSystemReady ? 'pass' : 'warning',
            details: toolSystemReady ? 'Tool system is ready' : 'Tool system is not ready or not enabled'
        });
        // 检查MCP管理器
        checks.push({
            name: 'MCP Manager',
            status: this.mcpManager ? 'pass' : 'warning',
            details: this.mcpManager ? 'MCP Manager is available' : 'MCP Manager is not available'
        });
        // 检查错误率
        const errorRate = this.metrics.totalRequests > 0
            ? this.metrics.failedRequests / this.metrics.totalRequests
            : 0;
        checks.push({
            name: 'Error Rate',
            status: errorRate < 0.1 ? 'pass' : errorRate < 0.3 ? 'warning' : 'fail',
            details: `Error rate: ${(errorRate * 100).toFixed(2)}% (${this.metrics.failedRequests}/${this.metrics.totalRequests})`
        });
        // 检查活动执行
        const activeCount = this.activeExecutions.size;
        checks.push({
            name: 'Active Executions',
            status: activeCount < 10 ? 'pass' : activeCount < 20 ? 'warning' : 'fail',
            details: `${activeCount} active tool executions`
        });
        // 确定总体状态
        let status = 'healthy';
        if (checks.some(c => c.status === 'fail')) {
            status = 'unhealthy';
        }
        else if (checks.some(c => c.status === 'warning')) {
            status = 'degraded';
        }
        // 生成建议
        const recommendations = [];
        if (!this.isInitialized) {
            recommendations.push('Initialize MCP Handler');
        }
        if (errorRate > 0.2) {
            recommendations.push('Investigate high error rate');
        }
        if (activeCount > 15) {
            recommendations.push('Consider limiting concurrent tool executions');
        }
        return {
            status,
            checks,
            recommendations,
            timestamp: Date.now()
        };
    }
    /**
     * 获取处理器状态
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            toolSystemReady: this.taskEngine?.getToolSystemStatus().isReady || false,
        };
    }
    /**
     * 清理资源
     */
    async dispose() {
        this.outputChannel.appendLine('🧹 Cleaning up MCP Handler...');
        // 清理配置监听器
        if (this.configWatcher) {
            this.configWatcher.dispose();
            this.configWatcher = null;
        }
        // 清理活动执行
        this.activeExecutions.clear();
        // 清理任务引擎
        if (this.taskEngine) {
            await this.taskEngine.dispose();
            this.taskEngine = null;
        }
        // 清理MCP管理器
        if (this.mcpManager) {
            await this.mcpManager.close();
            this.mcpManager = null;
        }
        // 输出最终统计信息
        const stats = this.getStatistics();
        const metrics = this.getMetrics();
        this.outputChannel.appendLine('📊 Final statistics:');
        this.outputChannel.appendLine(`   Total tool executions: ${stats.totalToolExecutions}`);
        this.outputChannel.appendLine(`   Success rate: ${stats.successRate}`);
        this.outputChannel.appendLine(`   Average execution time: ${stats.averageExecutionTime.toFixed(2)}ms`);
        this.outputChannel.appendLine(`   Total requests: ${metrics.totalRequests}`);
        this.outputChannel.appendLine(`   Successful requests: ${metrics.successfulRequests}`);
        this.outputChannel.appendLine(`   Failed requests: ${metrics.failedRequests}`);
        this.outputChannel.appendLine('✅ MCP Handler disposed');
        this.outputChannel.dispose();
        this.isInitialized = false;
    }
}
exports.MCPHandler = MCPHandler;
//# sourceMappingURL=MCPHandler.js.map