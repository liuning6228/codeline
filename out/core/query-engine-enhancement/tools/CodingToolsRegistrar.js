"use strict";
/**
 * CodingToolsRegistrar - 编码工具注册器
 *
 * 负责将编码专用工具注册到EnhancedToolRegistry
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodingToolsRegistrar = void 0;
exports.createDefaultCodingToolsConfig = createDefaultCodingToolsConfig;
exports.integrateCodingTools = integrateCodingTools;
const index_1 = require("./index");
/**
 * 编码工具注册器
 */
class CodingToolsRegistrar {
    toolRegistry;
    config;
    registeredTools = new Map();
    constructor(toolRegistry, config = {}) {
        this.toolRegistry = toolRegistry;
        this.config = {
            autoRegister: true,
            overwriteExisting: false,
            ...config,
        };
    }
    /**
     * 注册所有编码工具
     */
    async registerAllTools() {
        const registered = [];
        const failed = [];
        try {
            const toolsToRegister = this.config.autoRegister
                ? index_1.CODING_TOOLS
                : index_1.CODING_TOOLS.filter(tool => this.config.toolIds?.includes(tool.id));
            for (const toolDef of toolsToRegister) {
                try {
                    await this.registerTool(toolDef.id);
                    registered.push(toolDef.id);
                }
                catch (error) {
                    failed.push({
                        toolId: toolDef.id,
                        error: error.message,
                    });
                }
            }
            return {
                success: failed.length === 0,
                registered,
                failed,
                total: registered.length + failed.length,
            };
        }
        catch (error) {
            return {
                success: false,
                registered,
                failed: [...failed, { toolId: 'unknown', error: error.message }],
                total: registered.length + failed.length + 1,
            };
        }
    }
    /**
     * 注册单个工具
     */
    async registerTool(toolId) {
        const toolDef = index_1.CODING_TOOLS.find(tool => tool.id === toolId);
        if (!toolDef) {
            throw new Error(`Unknown coding tool: ${toolId}`);
        }
        // 检查工具是否已存在
        if (this.toolRegistry.hasTool(toolId)) {
            if (!this.config.overwriteExisting) {
                throw new Error(`Tool already registered: ${toolId}. Set overwriteExisting to true to replace.`);
            }
            // 移除现有工具
            this.toolRegistry.unregisterTool(toolId);
        }
        // 创建工具实例
        const toolInstance = new toolDef.class(this.config.context);
        // 注册到工具注册表
        this.toolRegistry.registerTool(toolInstance);
        // 记录已注册的工具
        this.registeredTools.set(toolId, toolInstance);
        return true;
    }
    /**
     * 取消注册工具
     */
    unregisterTool(toolId) {
        if (!this.registeredTools.has(toolId)) {
            return false;
        }
        this.toolRegistry.unregisterTool(toolId);
        this.registeredTools.delete(toolId);
        return true;
    }
    /**
     * 取消注册所有编码工具
     */
    unregisterAllTools() {
        for (const toolId of this.registeredTools.keys()) {
            this.unregisterTool(toolId);
        }
    }
    /**
     * 获取已注册的工具
     */
    getRegisteredTools() {
        const tools = [];
        for (const toolId of this.registeredTools.keys()) {
            const toolDef = index_1.CODING_TOOLS.find(tool => tool.id === toolId);
            if (toolDef) {
                tools.push({
                    id: toolDef.id,
                    name: toolDef.name,
                    description: toolDef.description,
                    category: toolDef.category,
                });
            }
        }
        return tools;
    }
    /**
     * 获取工具实例
     */
    getToolInstance(toolId) {
        return this.registeredTools.get(toolId) || null;
    }
    /**
     * 检查工具是否已注册
     */
    hasTool(toolId) {
        return this.registeredTools.has(toolId);
    }
    /**
     * 获取工具统计
     */
    getStats() {
        const byCategory = {};
        for (const toolDef of index_1.CODING_TOOLS) {
            byCategory[toolDef.category] = (byCategory[toolDef.category] || 0) + 1;
        }
        return {
            totalAvailable: index_1.CODING_TOOLS.length,
            totalRegistered: this.registeredTools.size,
            byCategory,
        };
    }
    /**
     * 验证工具可用性
     */
    async validateTools() {
        const results = [];
        for (const toolDef of index_1.CODING_TOOLS) {
            const issues = [];
            let available = true;
            // 检查工具是否已注册
            if (!this.registeredTools.has(toolDef.id)) {
                issues.push('Tool not registered');
                available = false;
            }
            else {
                // 检查工具依赖（如果有）
                const toolInstance = this.registeredTools.get(toolDef.id);
                if (toolInstance && typeof toolInstance.validate === 'function') {
                    try {
                        const validation = await toolInstance.validate();
                        if (!validation.valid) {
                            issues.push(...validation.errors || []);
                            available = false;
                        }
                    }
                    catch (error) {
                        issues.push(`Validation failed: ${error.message}`);
                        available = false;
                    }
                }
            }
            results.push({
                toolId: toolDef.id,
                available,
                issues,
            });
        }
        return results;
    }
}
exports.CodingToolsRegistrar = CodingToolsRegistrar;
/**
 * 创建默认的编码工具注册器配置
 */
function createDefaultCodingToolsConfig(context) {
    return {
        autoRegister: true,
        overwriteExisting: true,
        context,
    };
}
/**
 * 在现有工具注册表中集成编码工具
 */
async function integrateCodingTools(toolRegistry, context, config) {
    const registrarConfig = {
        ...createDefaultCodingToolsConfig(context),
        ...config,
    };
    const registrar = new CodingToolsRegistrar(toolRegistry, registrarConfig);
    const registrationResult = await registrar.registerAllTools();
    return {
        registrar,
        registrationResult,
    };
}
exports.default = CodingToolsRegistrar;
//# sourceMappingURL=CodingToolsRegistrar.js.map