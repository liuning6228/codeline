"use strict";
/**
 * 简化版MCP工具包装器
 * 快速集成MCP工具到EnhancedToolRegistry，不依赖完整EnhancedBaseTool
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
exports.MCPToolDiscoveryService = exports.MCPToolWrapper = void 0;
const vscode = __importStar(require("vscode"));
/**
 * MCP工具包装器
 * 简化实现，不依赖完整EnhancedBaseTool
 */
class MCPToolWrapper {
    id;
    name;
    description;
    version;
    mcpTool;
    config;
    outputChannel;
    constructor(mcpTool, config = {}) {
        this.mcpTool = mcpTool;
        this.config = {
            enablePermissionCheck: true,
            enableValidation: true,
            timeoutMs: 30000,
            ...config
        };
        // 复制属性
        this.id = mcpTool.id;
        this.name = mcpTool.name;
        this.description = mcpTool.description;
        this.version = mcpTool.version;
        // 创建输出通道
        this.outputChannel = vscode.window.createOutputChannel(`MCP: ${this.name}`);
        this.outputChannel.appendLine(`🔧 Created MCPToolWrapper for: ${this.name} (${this.id})`);
    }
    /**
     * 执行MCP工具
     */
    async execute(params) {
        const startTime = Date.now();
        this.outputChannel.appendLine(`▶️ Executing MCP tool: ${this.name}`);
        this.outputChannel.appendLine(`   Params: ${JSON.stringify(params, null, 2)}`);
        try {
            // 输入验证
            if (this.config.enableValidation && this.mcpTool.validate) {
                const isValid = this.mcpTool.validate(params);
                if (!isValid) {
                    throw new Error('Input validation failed');
                }
            }
            // 权限检查（简化版）
            if (this.config.enablePermissionCheck) {
                const hasPermission = await this.checkPermission(params);
                if (!hasPermission) {
                    throw new Error('Permission denied');
                }
            }
            // 执行工具（带超时）
            let timeoutId;
            const timeoutPromise = new Promise((_, reject) => {
                timeoutId = setTimeout(() => {
                    reject(new Error(`MCP tool timeout after ${this.config.timeoutMs}ms`));
                }, this.config.timeoutMs);
            });
            const executionPromise = this.mcpTool.execute(params);
            const result = await Promise.race([executionPromise, timeoutPromise]);
            // 清理超时定时器
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            const duration = Date.now() - startTime;
            this.outputChannel.appendLine(`✅ Execution completed in ${duration}ms`);
            this.outputChannel.appendLine(`   Result type: ${typeof result}`);
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.outputChannel.appendLine(`❌ Execution failed after ${duration}ms: ${error.message}`);
            // 重新抛出错误，保持错误堆栈
            const newError = new Error(`MCP tool execution failed: ${error.message}`);
            newError.cause = error;
            throw newError;
        }
    }
    /**
     * 简化权限检查
     */
    async checkPermission(params) {
        // 简化实现：默认允许所有操作
        // 在实际应用中，这里应该集成权限系统
        return true;
    }
    /**
     * 验证参数
     */
    validateParams(params) {
        if (!this.config.enableValidation) {
            return true;
        }
        if (this.mcpTool.validate) {
            return this.mcpTool.validate(params);
        }
        // 如果没有验证方法，检查参数是否为对象
        return params !== null && typeof params === 'object';
    }
    /**
     * 获取工具能力标签
     */
    getCapabilities() {
        return this.mcpTool.capabilities || [];
    }
    /**
     * 获取工具配置
     */
    getConfiguration() {
        return this.mcpTool.configuration || {};
    }
    /**
     * 转换为兼容EnhancedToolRegistry的格式
     */
    toToolRegistryFormat() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            version: this.version,
            category: this.determineCategory(),
            capabilities: this.getCapabilities(),
            isMCPTool: true,
            execute: this.execute.bind(this),
            validate: this.validateParams.bind(this)
        };
    }
    /**
     * 确定工具分类
     */
    determineCategory() {
        const capabilities = this.getCapabilities();
        if (capabilities.includes('file_system') || capabilities.includes('file_operations')) {
            return 'file';
        }
        else if (capabilities.includes('web_search') || capabilities.includes('browser')) {
            return 'web';
        }
        else if (capabilities.includes('code_analysis') || capabilities.includes('code_generation')) {
            return 'code';
        }
        else if (capabilities.includes('database') || capabilities.includes('sql')) {
            return 'development';
        }
        else if (capabilities.includes('shell') || capabilities.includes('terminal')) {
            return 'terminal';
        }
        else if (capabilities.includes('mcp') || capabilities.includes('model_context')) {
            return 'mcp';
        }
        return 'utility';
    }
    /**
     * 释放资源
     */
    dispose() {
        this.outputChannel.dispose();
    }
}
exports.MCPToolWrapper = MCPToolWrapper;
/**
 * MCP工具发现服务
 */
class MCPToolDiscoveryService {
    wrappers = new Map();
    outputChannel;
    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('MCP Discovery');
    }
    /**
     * 发现并注册MCP工具
     */
    async discoverAndRegisterTools() {
        this.outputChannel.appendLine('🔍 Discovering MCP tools...');
        try {
            // 这里应该实现实际的MCP工具发现逻辑
            // 例如：扫描目录、查询MCP服务器、加载配置文件等
            // 临时：返回空数组，表示没有发现工具
            // 在实际实现中，这里应该返回发现的工具
            const discoveredTools = [];
            // 为每个发现的工具创建包装器
            const wrappers = [];
            for (const tool of discoveredTools) {
                const wrapper = new MCPToolWrapper(tool);
                this.wrappers.set(tool.id, wrapper);
                wrappers.push(wrapper);
                this.outputChannel.appendLine(`   Found: ${tool.name} (${tool.id})`);
            }
            if (wrappers.length === 0) {
                this.outputChannel.appendLine('ℹ️ No MCP tools discovered');
            }
            else {
                this.outputChannel.appendLine(`✅ Discovered ${wrappers.length} MCP tools`);
            }
            return wrappers;
        }
        catch (error) {
            this.outputChannel.appendLine(`❌ MCP tool discovery failed: ${error.message}`);
            return [];
        }
    }
    /**
     * 注册单个MCP工具
     */
    registerTool(mcpTool) {
        const wrapper = new MCPToolWrapper(mcpTool);
        this.wrappers.set(mcpTool.id, wrapper);
        this.outputChannel.appendLine(`📋 Registered MCP tool: ${mcpTool.name} (${mcpTool.id})`);
        return wrapper;
    }
    /**
     * 获取所有已注册的MCP工具包装器
     */
    getAllWrappers() {
        return Array.from(this.wrappers.values());
    }
    /**
     * 根据ID获取MCP工具包装器
     */
    getWrapperById(toolId) {
        return this.wrappers.get(toolId);
    }
    /**
     * 释放所有资源
     */
    disposeAll() {
        for (const wrapper of this.wrappers.values()) {
            wrapper.dispose();
        }
        this.wrappers.clear();
        this.outputChannel.dispose();
    }
}
exports.MCPToolDiscoveryService = MCPToolDiscoveryService;
//# sourceMappingURL=MCPToolWrapper.js.map