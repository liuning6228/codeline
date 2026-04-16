"use strict";
/**
 * 工具注册表
 * 管理所有工具的注册、发现和生命周期
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
exports.ToolRegistry = void 0;
const vscode = __importStar(require("vscode"));
const ToolInterface_1 = require("./ToolInterface");
/**
 * 工具注册表
 */
class ToolRegistry {
    tools = new Map();
    toolCategories = new Map();
    aliases = new Map();
    initialized = false;
    outputChannel;
    config;
    constructor(config) {
        this.outputChannel = vscode.window.createOutputChannel('CodeLine Tool Registry');
        this.config = {
            enableCaching: true,
            enableLazyLoading: true,
            defaultCategories: Object.values(ToolInterface_1.ToolCategory),
            excludeToolIds: [],
            includeToolIds: [],
            ...config,
        };
    }
    /**
     * 初始化工具注册表
     */
    async initialize() {
        if (this.initialized) {
            return true;
        }
        try {
            this.outputChannel.appendLine('🛠️ Initializing Tool Registry...');
            this.initialized = true;
            this.outputChannel.appendLine('✅ Tool Registry initialized');
            return true;
        }
        catch (error) {
            this.outputChannel.appendLine(`❌ Tool Registry initialization failed: ${error.message}`);
            return false;
        }
    }
    /**
     * 注册工具定义
     */
    registerToolDefinition(definition, categories = [ToolInterface_1.ToolCategory.OTHER]) {
        try {
            const tool = {
                id: definition.id,
                name: definition.name,
                description: definition.description,
                version: definition.version,
                author: definition.author,
                capabilities: definition.capabilities,
                parameterSchema: definition.parameterSchema,
                isEnabled: definition.isEnabled || ((context) => true),
                isConcurrencySafe: definition.isConcurrencySafe || ((context) => false),
                isReadOnly: definition.isReadOnly || ((context) => false),
                isDestructive: definition.isDestructive || ((context) => false),
                checkPermissions: definition.checkPermissions || (async (params, context) => ({
                    allowed: true,
                    requiresUserConfirmation: false,
                })),
                validateParameters: definition.validateParameters || (async (params, context) => ({
                    valid: true,
                })),
                execute: definition.execute,
                cancel: definition.cancel,
                getDisplayName: definition.getDisplayName
                    ? definition.getDisplayName
                    : ((params) => definition.name),
                getActivityDescription: definition.getActivityDescription
                    ? definition.getActivityDescription
                    : ((params) => definition.description),
            };
            return this.registerTool(tool, categories);
        }
        catch (error) {
            this.outputChannel.appendLine(`❌ Failed to register tool definition ${definition.id}: ${error.message}`);
            return false;
        }
    }
    /**
     * 注册工具实例
     */
    registerTool(tool, categories = [ToolInterface_1.ToolCategory.OTHER]) {
        if (this.tools.has(tool.id)) {
            this.outputChannel.appendLine(`⚠️ Tool ${tool.id} already registered`);
            return false;
        }
        this.tools.set(tool.id, tool);
        for (const category of categories) {
            let categorySet = this.toolCategories.get(category);
            if (!categorySet) {
                categorySet = new Set();
                this.toolCategories.set(category, categorySet);
            }
            categorySet.add(tool.id);
        }
        this.outputChannel.appendLine(`✅ Registered tool: ${tool.id} (${tool.name})`);
        return true;
    }
    /**
     * 获取工具
     */
    getTool(toolIdOrAlias) {
        if (this.tools.has(toolIdOrAlias)) {
            return this.tools.get(toolIdOrAlias);
        }
        const actualToolId = this.aliases.get(toolIdOrAlias);
        if (actualToolId) {
            return this.tools.get(actualToolId);
        }
        return undefined;
    }
    /**
     * 执行工具
     */
    async executeTool(toolId, params, context, onProgress) {
        const tool = this.getTool(toolId);
        if (!tool) {
            throw new Error(`Tool ${toolId} not found`);
        }
        if (!tool.isEnabled(context)) {
            throw new Error(`Tool ${toolId} is not enabled in current context`);
        }
        const permissionResult = await tool.checkPermissions(params, context);
        if (!permissionResult.allowed) {
            throw new Error(`Permission denied for tool ${toolId}: ${permissionResult.reason || 'No reason provided'}`);
        }
        const validationResult = await tool.validateParameters(params, context);
        if (!validationResult.valid) {
            throw new Error(`Invalid parameters for tool ${toolId}: ${validationResult.error || 'Validation failed'}`);
        }
        if (onProgress) {
            onProgress({ progress: 0, message: 'Starting execution' });
        }
        try {
            const result = await tool.execute(params, context, onProgress);
            if (onProgress) {
                onProgress({ progress: 1, message: 'Execution completed' });
            }
            return result;
        }
        catch (error) {
            if (onProgress) {
                onProgress({ progress: 0, message: `Execution failed: ${error.message}` });
            }
            throw error;
        }
    }
    /**
     * 获取注册表状态
     */
    getStatus() {
        return {
            initialized: this.initialized,
            toolCount: this.tools.size,
            categoryCount: this.toolCategories.size,
            aliasCount: this.aliases.size,
        };
    }
    /**
     * 注册工具别名
     */
    registerAlias(toolId, alias) {
        if (!this.tools.has(toolId)) {
            this.outputChannel.appendLine(`⚠️ Cannot register alias for unknown tool: ${toolId}`);
            return false;
        }
        if (this.aliases.has(alias)) {
            this.outputChannel.appendLine(`⚠️ Alias ${alias} already registered`);
            return false;
        }
        this.aliases.set(alias, toolId);
        this.outputChannel.appendLine(`🏷️ Registered alias: ${alias} -> ${toolId}`);
        return true;
    }
    /**
     * 获取所有工具
     */
    getAllTools(context, filters) {
        const { categories = this.config.defaultCategories, enabledOnly = true, searchTerm = '' } = filters || {};
        const result = [];
        for (const [toolId, tool] of this.tools.entries()) {
            let inCategory = false;
            for (const category of categories) {
                const categorySet = this.toolCategories.get(category);
                if (categorySet && categorySet.has(toolId)) {
                    inCategory = true;
                    break;
                }
            }
            if (!inCategory && categories.length > 0) {
                continue;
            }
            if (enabledOnly && !tool.isEnabled(context)) {
                continue;
            }
            if (searchTerm && !tool.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !tool.description.toLowerCase().includes(searchTerm.toLowerCase())) {
                continue;
            }
            result.push(tool);
        }
        return result;
    }
    /**
     * 清空注册表
     */
    clear() {
        this.tools.clear();
        this.toolCategories.clear();
        this.aliases.clear();
        this.outputChannel.appendLine('🗑️ Tool Registry cleared');
    }
    /**
     * 关闭注册表
     */
    async close() {
        this.outputChannel.appendLine('🔒 Tool Registry closed');
        this.outputChannel.dispose();
        this.initialized = false;
    }
}
exports.ToolRegistry = ToolRegistry;
//# sourceMappingURL=ToolRegistry.js.map