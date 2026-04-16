"use strict";
/**
 * EnhancedToolRegistry的MCP扩展
 * 为EnhancedToolRegistry添加MCP工具支持
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
exports.EnhancedToolRegistryMCPExtension = void 0;
const vscode = __importStar(require("vscode"));
const MCPToolWrapper_1 = require("./MCPToolWrapper");
const Tool_1 = require("./Tool");
const index_1 = require("../types/index");
/**
 * EnhancedToolRegistry的MCP扩展
 */
class EnhancedToolRegistryMCPExtension {
    registry;
    discoveryService;
    outputChannel;
    /** 是否已初始化 */
    isInitialized = false;
    /** 已注册的MCP工具映射 */
    mcpTools = new Map();
    constructor(registry) {
        this.registry = registry;
        this.discoveryService = new MCPToolWrapper_1.MCPToolDiscoveryService();
        this.outputChannel = vscode.window.createOutputChannel('CodeLine MCP Extension');
    }
    /**
     * 初始化MCP扩展
     */
    async initialize() {
        if (this.isInitialized) {
            return true;
        }
        try {
            this.outputChannel.show(true);
            this.outputChannel.appendLine('🔧 Initializing MCP extension for EnhancedToolRegistry...');
            // 发现MCP工具
            const discoveredWrappers = await this.discoveryService.discoverAndRegisterTools();
            // 注册到EnhancedToolRegistry
            for (const wrapper of discoveredWrappers) {
                await this.registerMCPToolToRegistry(wrapper);
            }
            this.isInitialized = true;
            this.outputChannel.appendLine(`✅ MCP extension initialized with ${discoveredWrappers.length} tools`);
            return true;
        }
        catch (error) {
            this.outputChannel.appendLine(`❌ MCP extension initialization failed: ${error.message}`);
            return false;
        }
    }
    /**
     * 注册MCP工具到EnhancedToolRegistry
     */
    async registerMCPToolToRegistry(wrapper) {
        try {
            // 将MCP工具包装器转换为Tool格式
            const tool = this.convertToTool(wrapper);
            // 注册到EnhancedToolRegistry
            const success = this.registry.registerTool(tool);
            if (success) {
                this.mcpTools.set(wrapper.id, wrapper);
                this.outputChannel.appendLine(`📋 Registered MCP tool to registry: ${wrapper.name}`);
                return true;
            }
            else {
                this.outputChannel.appendLine(`⚠️ Failed to register MCP tool to registry: ${wrapper.name}`);
                return false;
            }
        }
        catch (error) {
            this.outputChannel.appendLine(`❌ Error registering MCP tool ${wrapper.name}: ${error.message}`);
            return false;
        }
    }
    /**
     * 将MCP工具包装器转换为Tool对象
     */
    convertToTool(wrapper) {
        // 创建ToolDefinition，然后使用buildTool构建Tool实例
        const toolDefinition = {
            id: wrapper.id,
            name: wrapper.name,
            description: wrapper.description,
            version: wrapper.version,
            author: 'MCP Tool', // 默认作者
            category: this.determineCategory(wrapper),
            // 输入模式：使用动态模式，接受任何参数
            inputSchema: Tool_1.z.object({
                params: Tool_1.z.record(Tool_1.z.any()).optional()
            }),
            // 工具能力：根据MCP工具能力构建
            capabilities: this.convertCapabilities(wrapper),
            // 工具是否可用：默认可用
            isEnabled: () => true,
            // 并发安全性：MCP工具默认不安全
            isConcurrencySafe: () => false,
            // 权限检查：简化实现，总是允许
            checkPermissions: async (input, context) => {
                return {
                    allowed: true,
                    requiresUserConfirmation: false,
                    reason: 'MCP tool permission'
                };
            },
            // 参数验证：使用MCP工具的验证方法
            validateParameters: async (input, context) => {
                const params = input?.params || input;
                const isValid = wrapper.validateParams(params);
                return {
                    valid: isValid,
                    errors: isValid ? [] : ['Validation failed']
                };
            },
            // 执行方法：委托给MCP工具包装器
            execute: async (input, context) => {
                try {
                    const params = input?.params || input;
                    return await wrapper.execute(params);
                }
                catch (error) {
                    throw new Error(`MCP tool execution failed: ${error.message}`);
                }
            },
            // 显示名称：使用工具名称
            getDisplayName: () => wrapper.name,
            // 活动描述：使用工具描述
            getActivityDescription: () => wrapper.description
        };
        // 使用buildTool创建Tool实例
        return (0, Tool_1.buildTool)(toolDefinition);
    }
    /**
     * 确定MCP工具的分类
     */
    determineCategory(wrapper) {
        const capabilities = wrapper.getCapabilities();
        if (capabilities.includes('file_system') || capabilities.includes('file_operations')) {
            return index_1.ToolCategory.FILE;
        }
        else if (capabilities.includes('web_search') || capabilities.includes('browser')) {
            return index_1.ToolCategory.WEB;
        }
        else if (capabilities.includes('code_analysis') || capabilities.includes('code_generation')) {
            return index_1.ToolCategory.CODE;
        }
        else if (capabilities.includes('database') || capabilities.includes('sql')) {
            return index_1.ToolCategory.DEVELOPMENT;
        }
        else if (capabilities.includes('shell') || capabilities.includes('terminal')) {
            return index_1.ToolCategory.TERMINAL;
        }
        else if (capabilities.includes('mcp') || capabilities.includes('model_context')) {
            return index_1.ToolCategory.MCP;
        }
        return index_1.ToolCategory.UTILITY;
    }
    /**
     * 转换MCP工具能力为ToolCapabilities格式
     */
    convertCapabilities(wrapper) {
        const capabilities = wrapper.getCapabilities();
        return {
            isConcurrencySafe: capabilities.includes('concurrency_safe') || false,
            isReadOnly: capabilities.includes('read_only') || true, // MCP工具默认为只读
            isDestructive: capabilities.includes('destructive') || false,
            requiresWorkspace: capabilities.includes('requires_workspace') || false,
            supportsStreaming: capabilities.includes('supports_streaming') || false
        };
    }
    /**
     * 手动注册MCP工具
     */
    async registerMCPTool(mcpTool) {
        try {
            this.outputChannel.appendLine(`🔧 Manually registering MCP tool: ${mcpTool.name}`);
            // 创建包装器
            const wrapper = this.discoveryService.registerTool(mcpTool);
            // 注册到EnhancedToolRegistry
            const success = await this.registerMCPToolToRegistry(wrapper);
            if (success) {
                this.outputChannel.appendLine(`✅ Successfully registered MCP tool: ${mcpTool.name}`);
            }
            else {
                this.outputChannel.appendLine(`⚠️ Failed to register MCP tool: ${mcpTool.name}`);
            }
            return success;
        }
        catch (error) {
            this.outputChannel.appendLine(`❌ Error registering MCP tool: ${error.message}`);
            return false;
        }
    }
    /**
     * 获取所有已注册的MCP工具
     */
    getAllMCPTools() {
        return Array.from(this.mcpTools.values());
    }
    /**
     * 根据ID获取MCP工具
     */
    getMCPToolById(toolId) {
        return this.mcpTools.get(toolId);
    }
    /**
     * 检查工具是否为MCP工具
     */
    isMCPTool(toolId) {
        return this.mcpTools.has(toolId);
    }
    /**
     * 执行MCP工具
     */
    async executeMCPTool(toolId, params = {}) {
        const wrapper = this.mcpTools.get(toolId);
        if (!wrapper) {
            throw new Error(`MCP tool not found: ${toolId}`);
        }
        this.outputChannel.appendLine(`▶️ Executing MCP tool via extension: ${wrapper.name}`);
        try {
            const result = await wrapper.execute(params);
            this.outputChannel.appendLine(`✅ MCP tool execution successful: ${wrapper.name}`);
            return result;
        }
        catch (error) {
            this.outputChannel.appendLine(`❌ MCP tool execution failed: ${error.message}`);
            throw error;
        }
    }
    /**
     * 重新发现MCP工具
     */
    async rediscoverTools() {
        this.outputChannel.appendLine('🔍 Rediscovering MCP tools...');
        try {
            // 清理现有工具
            for (const [toolId, wrapper] of this.mcpTools) {
                // 从注册表中移除
                // 注意：EnhancedToolRegistry可能需要提供移除方法
                // 目前我们只是从本地映射中移除
                wrapper.dispose();
            }
            this.mcpTools.clear();
            // 重新发现工具
            const discoveredWrappers = await this.discoveryService.discoverAndRegisterTools();
            // 重新注册
            for (const wrapper of discoveredWrappers) {
                await this.registerMCPToolToRegistry(wrapper);
            }
            this.outputChannel.appendLine(`✅ Rediscovery completed: found ${discoveredWrappers.length} tools`);
            return discoveredWrappers;
        }
        catch (error) {
            this.outputChannel.appendLine(`❌ Rediscovery failed: ${error.message}`);
            return [];
        }
    }
    /**
     * 获取MCP工具统计信息
     */
    getStatistics() {
        return {
            totalMCPTools: this.mcpTools.size,
            initialized: this.isInitialized,
            toolIds: Array.from(this.mcpTools.keys())
        };
    }
    /**
     * 释放资源
     */
    dispose() {
        for (const wrapper of this.mcpTools.values()) {
            wrapper.dispose();
        }
        this.mcpTools.clear();
        this.discoveryService.disposeAll();
        this.outputChannel.dispose();
        this.outputChannel.appendLine('🗑️ MCP extension disposed');
    }
}
exports.EnhancedToolRegistryMCPExtension = EnhancedToolRegistryMCPExtension;
//# sourceMappingURL=EnhancedToolRegistryMCPExtension.js.map