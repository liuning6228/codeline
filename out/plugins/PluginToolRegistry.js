"use strict";
/**
 * 插件化工具注册表
 * 扩展ToolRegistry以支持插件化工具管理
 * 基于Claude Code CP-20260402-003插件模式
 * 使用组合模式而非继承
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
exports.PluginToolRegistry = void 0;
const vscode = __importStar(require("vscode"));
const ToolInterface_1 = require("../tools/ToolInterface");
const ToolRegistry_1 = require("../tools/ToolRegistry");
const PluginManager_1 = require("./PluginManager");
/**
 * 插件化工具注册表
 */
class PluginToolRegistry {
    toolRegistry;
    pluginManager = null;
    pluginTools = new Map();
    config;
    outputChannel;
    constructor(config) {
        const mergedConfig = {
            enableCaching: true,
            enableLazyLoading: true,
            defaultCategories: Object.values(ToolInterface_1.ToolCategory),
            excludeToolIds: [],
            includeToolIds: [],
            enablePluginSupport: true,
            autoLoadPlugins: true,
            pluginToolPrefix: 'plugin:',
            ...config,
        };
        this.config = mergedConfig;
        this.outputChannel = vscode.window.createOutputChannel('CodeLine Plugin Tool Registry');
        this.toolRegistry = new ToolRegistry_1.ToolRegistry(mergedConfig);
    }
    /**
     * 初始化插件化工具注册表
     */
    async initializeWithPlugins(extensionContext, globalContext) {
        // 先初始化工具注册表
        const registryInitialized = await this.toolRegistry.initialize();
        if (!registryInitialized) {
            return false;
        }
        // 初始化插件管理器
        if (this.config.enablePluginSupport) {
            await this.initializePluginManager(extensionContext, globalContext);
        }
        return true;
    }
    /**
     * 初始化插件管理器
     */
    async initializePluginManager(extensionContext, globalContext) {
        this.pluginManager = new PluginManager_1.PluginManager(extensionContext, globalContext, this.config.pluginManagerConfig);
        // 添加插件生命周期监听器
        this.pluginManager.addLifecycleListener((event) => {
            this.handlePluginLifecycleEvent(event);
        });
        // 初始化插件管理器
        await this.pluginManager.initialize();
        this.outputChannel.appendLine('🔌 Plugin Manager initialized');
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
                this.outputChannel.appendLine(`⚠️ Plugin ${pluginId} error: ${event.error}`);
                break;
        }
    }
    /**
     * 处理插件激活
     */
    async handlePluginActivated(pluginId) {
        if (!this.pluginManager) {
            return;
        }
        const plugin = this.pluginManager.getPlugin(pluginId);
        if (!plugin) {
            return;
        }
        this.outputChannel.appendLine(`🔌 Plugin activated: ${pluginId}`);
        // 如果是工具插件，注册其工具
        if (this.isToolPlugin(plugin)) {
            await this.registerPluginTools(pluginId, plugin);
        }
    }
    /**
     * 处理插件停用
     */
    async handlePluginDeactivated(pluginId) {
        this.outputChannel.appendLine(`🔌 Plugin deactivated: ${pluginId}`);
        // 卸载插件工具
        await this.unregisterPluginTools(pluginId);
    }
    /**
     * 处理插件卸载
     */
    async handlePluginUnloaded(pluginId) {
        this.outputChannel.appendLine(`🔌 Plugin unloaded: ${pluginId}`);
        // 清理插件工具记录
        await this.cleanupPluginTools(pluginId);
    }
    /**
     * 注册插件工具
     */
    async registerPluginTools(pluginId, plugin) {
        try {
            // 获取插件工具
            const tools = plugin.getTools();
            for (const tool of tools) {
                // 为插件工具添加前缀，避免ID冲突
                const prefixedToolId = this.getPrefixedToolId(pluginId, tool.id);
                // 克隆工具并更新ID
                const pluginTool = this.createPluginTool(pluginId, tool, prefixedToolId);
                // 注册工具
                const registered = await this.toolRegistry.registerToolDefinition({
                    ...pluginTool,
                    id: prefixedToolId,
                });
                if (registered) {
                    this.pluginTools.set(prefixedToolId, { pluginId, originalToolId: tool.id });
                    this.outputChannel.appendLine(`🔧 Registered plugin tool: ${prefixedToolId} (from ${pluginId})`);
                }
            }
            this.outputChannel.appendLine(`✅ Registered ${tools.length} tools from plugin ${pluginId}`);
        }
        catch (error) {
            this.outputChannel.appendLine(`❌ Failed to register tools from plugin ${pluginId}: ${error}`);
        }
    }
    /**
     * 卸载插件工具
     */
    async unregisterPluginTools(pluginId) {
        const toolsToRemove = [];
        // 查找属于该插件的所有工具
        for (const [prefixedToolId, info] of this.pluginTools.entries()) {
            if (info.pluginId === pluginId) {
                toolsToRemove.push(prefixedToolId);
            }
        }
        // 卸载工具
        for (const toolId of toolsToRemove) {
            // 由于ToolRegistry没有unregister方法，我们只能标记为不启用
            // 实际实现中可能需要扩展ToolRegistry添加unregister功能
            this.outputChannel.appendLine(`⚠️ Note: ToolRegistry does not support unregister, tool ${toolId} remains registered but disabled`);
            this.pluginTools.delete(toolId);
        }
        if (toolsToRemove.length > 0) {
            this.outputChannel.appendLine(`✅ Marked ${toolsToRemove.length} tools from plugin ${pluginId} for removal`);
        }
    }
    /**
     * 清理插件工具记录
     */
    async cleanupPluginTools(pluginId) {
        const toolsToRemove = [];
        for (const [prefixedToolId, info] of this.pluginTools.entries()) {
            if (info.pluginId === pluginId) {
                toolsToRemove.push(prefixedToolId);
            }
        }
        for (const toolId of toolsToRemove) {
            this.pluginTools.delete(toolId);
        }
    }
    /**
     * 创建插件工具
     */
    createPluginTool(pluginId, originalTool, prefixedToolId) {
        // 创建工具副本
        const pluginTool = {
            ...originalTool,
            id: prefixedToolId,
            // 包装执行方法，添加插件上下文
            execute: async (params, context, onProgress) => {
                // 添加插件ID到上下文
                const enhancedContext = {
                    ...context,
                    pluginId,
                    originalToolId: originalTool.id,
                };
                // 调用原始工具的执行方法
                return originalTool.execute(params, enhancedContext, onProgress);
            },
            // 包装权限检查方法
            checkPermissions: async (params, context) => {
                // 添加插件ID到上下文
                const enhancedContext = {
                    ...context,
                    pluginId,
                    originalToolId: originalTool.id,
                };
                if (originalTool.checkPermissions) {
                    return originalTool.checkPermissions(params, enhancedContext);
                }
                else {
                    // 默认权限检查
                    return {
                        allowed: true,
                        reason: 'Default permission check passed',
                    };
                }
            },
            // 包装参数验证方法
            validateParameters: async (params, context) => {
                // 添加插件ID到上下文
                const enhancedContext = {
                    ...context,
                    pluginId,
                    originalToolId: originalTool.id,
                };
                if (originalTool.validateParameters) {
                    return originalTool.validateParameters(params, enhancedContext);
                }
                else {
                    // 默认参数验证
                    return {
                        valid: true,
                    };
                }
            },
            // 包装显示名称方法
            getDisplayName: (params) => {
                if (originalTool.getDisplayName) {
                    const name = originalTool.getDisplayName(params);
                    return `[${pluginId}] ${name}`;
                }
                else {
                    return `[${pluginId}] ${originalTool.name}`;
                }
            },
            // 包装活动描述方法
            getActivityDescription: (params) => {
                if (originalTool.getActivityDescription) {
                    const description = originalTool.getActivityDescription(params);
                    return `Plugin ${pluginId}: ${description}`;
                }
                else {
                    return `Plugin ${pluginId}: ${originalTool.description}`;
                }
            },
        };
        return pluginTool;
    }
    /**
     * 获取带前缀的工具ID
     */
    getPrefixedToolId(pluginId, toolId) {
        return `${this.config.pluginToolPrefix}${pluginId}:${toolId}`;
    }
    /**
     * 检查是否为工具插件
     */
    isToolPlugin(plugin) {
        return 'registerTools' in plugin && 'unregisterTools' in plugin;
    }
    /**
     * 获取工具注册表
     */
    getToolRegistry() {
        return this.toolRegistry;
    }
    /**
     * 获取插件管理器
     */
    getPluginManager() {
        return this.pluginManager;
    }
    /**
     * 加载插件
     */
    async loadPlugin(pluginPath) {
        if (!this.pluginManager) {
            throw new Error('Plugin manager not initialized');
        }
        await this.pluginManager.loadPlugin(pluginPath);
    }
    /**
     * 卸载插件
     */
    async unloadPlugin(pluginId) {
        if (!this.pluginManager) {
            throw new Error('Plugin manager not initialized');
        }
        await this.pluginManager.unloadPlugin(pluginId);
    }
    /**
     * 获取插件工具信息
     */
    getPluginToolInfo(toolId) {
        return this.pluginTools.get(toolId) || null;
    }
    /**
     * 获取所有插件工具
     */
    getPluginTools() {
        return new Map(this.pluginTools);
    }
    /**
     * 关闭插件化工具注册表
     */
    async closeWithPlugins() {
        // 关闭插件管理器
        if (this.pluginManager) {
            await this.pluginManager.close();
            this.pluginManager = null;
        }
        // 清理插件工具记录
        this.pluginTools.clear();
        // 关闭工具注册表
        await this.toolRegistry.close();
        this.outputChannel.appendLine('🔌 Plugin Tool Registry closed');
        this.outputChannel.dispose();
    }
    /**
     * 获取插件化工具注册表状态
     */
    getPluginRegistryState() {
        const pluginManagerState = this.pluginManager?.getState();
        return {
            pluginManagerInitialized: !!this.pluginManager,
            loadedPlugins: pluginManagerState?.loadedPlugins || 0,
            pluginToolsCount: this.pluginTools.size,
        };
    }
    /**
     * 代理ToolRegistry的方法
     */
    async initialize() {
        return this.toolRegistry.initialize();
    }
    registerToolDefinition(definition, categories = [ToolInterface_1.ToolCategory.OTHER]) {
        return this.toolRegistry.registerToolDefinition(definition, categories);
    }
    getTool(toolId) {
        return this.toolRegistry.getTool(toolId);
    }
    getAllTools(context, filters) {
        return this.toolRegistry.getAllTools(context, filters);
    }
}
exports.PluginToolRegistry = PluginToolRegistry;
//# sourceMappingURL=PluginToolRegistry.js.map