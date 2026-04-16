"use strict";
/**
 * 工具插件基类
 * 提供工具插件的默认实现，简化工具插件开发
 * 基于Claude Code CP-20260402-003插件模式
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolPlugin = void 0;
/**
 * 工具插件基类
 */
class ToolPlugin {
    metadata;
    configSchema;
    dependencies;
    tools = new Map();
    toolDefinitions = new Map();
    context = null;
    config;
    constructor(options) {
        this.metadata = options.metadata;
        this.configSchema = options.configSchema;
        this.dependencies = options.dependencies;
        this.config = {
            autoRegisterTools: true,
            toolLoadingStrategy: 'eager',
            enableToolCaching: true,
            maxTools: 100,
            ...options.toolConfig,
        };
    }
    /**
     * 插件激活
     */
    async activate(context) {
        this.context = context;
        context.outputChannel.appendLine(`🚀 Activating tool plugin: ${this.metadata.name}`);
        // 加载工具定义
        await this.loadToolDefinitions();
        // 创建工具实例
        await this.createTools();
        context.outputChannel.appendLine(`✅ Tool plugin activated: ${this.metadata.name} (${this.tools.size} tools)`);
    }
    /**
     * 插件停用
     */
    async deactivate() {
        if (this.context) {
            this.context.outputChannel.appendLine(`⏸️ Deactivating tool plugin: ${this.metadata.name}`);
        }
        // 清理工具资源
        await this.cleanupTools();
        // 清空工具集合
        this.tools.clear();
        this.toolDefinitions.clear();
        if (this.context) {
            this.context.outputChannel.appendLine(`✅ Tool plugin deactivated: ${this.metadata.name}`);
        }
        this.context = null;
    }
    /**
     * 获取插件提供的工具
     */
    getTools() {
        return Array.from(this.tools.values());
    }
    /**
     * 获取工具定义
     */
    getToolDefinitions() {
        return Array.from(this.toolDefinitions.values());
    }
    /**
     * 注册工具到注册表
     */
    async registerTools(registry) {
        if (!this.context) {
            throw new Error('Plugin not activated');
        }
        this.context.outputChannel.appendLine(`📝 Registering tools from ${this.metadata.name}...`);
        let registeredCount = 0;
        for (const [toolId, tool] of this.tools.entries()) {
            try {
                // 这里需要根据实际的注册表API进行调整
                // 假设注册表有一个registerTool方法
                if (typeof registry.registerTool === 'function') {
                    await registry.registerTool(tool);
                    registeredCount++;
                }
                else {
                    this.context.outputChannel.appendLine(`⚠️ Registry does not have registerTool method`);
                    break;
                }
            }
            catch (error) {
                this.context.outputChannel.appendLine(`❌ Failed to register tool ${toolId}: ${error}`);
            }
        }
        this.context.outputChannel.appendLine(`✅ Registered ${registeredCount} tools from ${this.metadata.name}`);
    }
    /**
     * 从注册表卸载工具
     */
    async unregisterTools(registry) {
        if (!this.context) {
            throw new Error('Plugin not activated');
        }
        this.context.outputChannel.appendLine(`🗑️ Unregistering tools from ${this.metadata.name}...`);
        let unregisteredCount = 0;
        for (const [toolId] of this.tools.entries()) {
            try {
                // 这里需要根据实际的注册表API进行调整
                // 假设注册表有一个unregisterTool方法
                if (typeof registry.unregisterTool === 'function') {
                    await registry.unregisterTool(toolId);
                    unregisteredCount++;
                }
                else {
                    this.context.outputChannel.appendLine(`⚠️ Registry does not have unregisterTool method`);
                    break;
                }
            }
            catch (error) {
                this.context.outputChannel.appendLine(`❌ Failed to unregister tool ${toolId}: ${error}`);
            }
        }
        this.context.outputChannel.appendLine(`✅ Unregistered ${unregisteredCount} tools from ${this.metadata.name}`);
    }
    /**
     * 插件配置更新
     */
    async updateConfig(newConfig) {
        // 合并配置
        const mergedConfig = { ...this.config, ...newConfig };
        this.config = mergedConfig;
        if (this.context) {
            this.context.outputChannel.appendLine(`⚙️ Updated config for plugin: ${this.metadata.name}`);
            // 配置变更后重新加载工具
            if (newConfig.toolLoadingStrategy !== this.config.toolLoadingStrategy) {
                await this.reloadTools();
            }
        }
    }
    /**
     * 插件健康检查
     */
    async healthCheck() {
        const toolCount = this.tools.size;
        const definitionCount = this.toolDefinitions.size;
        const healthy = toolCount > 0 && toolCount === definitionCount;
        return {
            healthy,
            message: healthy
                ? `Plugin ${this.metadata.name} is healthy (${toolCount} tools)`
                : `Plugin ${this.metadata.name} has issues (tools: ${toolCount}, definitions: ${definitionCount})`,
            details: {
                toolCount,
                definitionCount,
                config: this.config,
            },
        };
    }
    /**
     * 创建工具实例
     * 子类可以实现此方法以自定义工具创建逻辑
     */
    async createTools() {
        if (!this.context) {
            throw new Error('Plugin context not available');
        }
        for (const [toolId, definition] of this.toolDefinitions.entries()) {
            try {
                const tool = this.createToolFromDefinition(definition);
                this.tools.set(toolId, tool);
            }
            catch (error) {
                this.context.outputChannel.appendLine(`❌ Failed to create tool ${toolId}: ${error}`);
            }
        }
    }
    /**
     * 清理工具资源
     * 子类可以实现此方法以清理工具资源
     */
    async cleanupTools() {
        // 默认实现不执行任何操作
    }
    // ========== 受保护方法 ==========
    /**
     * 添加工具定义
     */
    addToolDefinition(definition) {
        this.toolDefinitions.set(definition.id, definition);
    }
    /**
     * 添加工具
     */
    addTool(tool) {
        this.tools.set(tool.id, tool);
    }
    /**
     * 从定义创建工具
     */
    createToolFromDefinition(definition) {
        // 创建工具实例
        const tool = {
            id: definition.id,
            name: definition.name,
            description: definition.description,
            version: definition.version,
            author: definition.author,
            capabilities: definition.capabilities,
            parameterSchema: definition.parameterSchema,
            isEnabled: definition.isEnabled || (() => true),
            isConcurrencySafe: definition.isConcurrencySafe,
            isReadOnly: definition.isReadOnly,
            isDestructive: definition.isDestructive,
            checkPermissions: definition.checkPermissions || this.defaultCheckPermissions,
            validateParameters: definition.validateParameters || this.defaultValidateParameters,
            execute: definition.execute,
            cancel: definition.cancel,
            getDisplayName: definition.getDisplayName || ((params) => definition.name),
            getActivityDescription: definition.getActivityDescription || ((params) => definition.description),
        };
        return tool;
    }
    /**
     * 重新加载工具
     */
    async reloadTools() {
        if (!this.context) {
            return;
        }
        this.context.outputChannel.appendLine(`🔄 Reloading tools for ${this.metadata.name}...`);
        // 清理现有工具
        await this.cleanupTools();
        this.tools.clear();
        this.toolDefinitions.clear();
        // 重新加载
        await this.loadToolDefinitions();
        await this.createTools();
        this.context.outputChannel.appendLine(`✅ Reloaded ${this.tools.size} tools for ${this.metadata.name}`);
    }
    // ========== 默认工具方法 ==========
    /**
     * 默认权限检查方法
     */
    async defaultCheckPermissions(params, context) {
        return {
            allowed: true,
            reason: 'Default permission check passed',
        };
    }
    /**
     * 默认参数验证方法
     */
    async defaultValidateParameters(params, context) {
        return {
            valid: true,
        };
    }
    /**
     * 创建默认工具结果
     */
    createToolResult(success, options) {
        return {
            success,
            output: options.output,
            error: options.error,
            toolId: options.toolId,
            duration: options.duration,
            timestamp: new Date(),
            metadata: options.metadata,
        };
    }
    /**
     * 创建工具进度
     */
    createToolProgress(type, progress, message, data) {
        return {
            type,
            progress,
            message,
            data,
        };
    }
    /**
     * 获取插件上下文
     */
    getPluginContext() {
        if (!this.context) {
            throw new Error('Plugin context not available');
        }
        return this.context;
    }
    /**
     * 获取全局上下文
     */
    getGlobalContext() {
        if (!this.context) {
            throw new Error('Plugin context not available');
        }
        return this.context.globalContext;
    }
}
exports.ToolPlugin = ToolPlugin;
//# sourceMappingURL=ToolPlugin.js.map