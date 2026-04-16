"use strict";
/**
 * 增强工具注册表
 * 集成claude-code-haha-main的工具管理能力，支持流式执行和权限控制
 *
 * Zod兼容性更新（2026-04-08）：使用真正的Zod库
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
exports.EnhancedToolRegistry = void 0;
const vscode = __importStar(require("vscode"));
const Tool_1 = require("./Tool");
const StreamingToolExecutor_1 = require("../executor/StreamingToolExecutor");
const ToolProgressService_1 = require("../../services/ToolProgressService");
// ==================== 增强工具注册表 ====================
/**
 * 增强工具注册表
 * 支持工具发现、生命周期管理、流式执行和权限控制
 */
class EnhancedToolRegistry {
    tools = new Map();
    toolCategories = new Map();
    toolAliases = new Map();
    initialized = false;
    outputChannel;
    config;
    streamingExecutor;
    executionResults = new Map();
    usageStats = new Map();
    toolProgressService;
    constructor(config) {
        this.outputChannel = vscode.window.createOutputChannel('CodeLine Tool Registry');
        this.config = {
            enableCaching: true,
            enableLazyLoading: true,
            defaultCategories: Object.values(Tool_1.ToolCategory),
            excludeToolIds: [],
            includeToolIds: [],
            maxConcurrentTools: 3,
            defaultTimeout: 30000,
            ...config,
        };
        // 初始化流式执行器
        const executorConfig = {
            maxConcurrent: this.config.maxConcurrentTools,
            defaultTimeout: this.config.defaultTimeout,
            enableCache: true,
            enableRetry: true,
            maxRetries: 3,
            retryDelay: 1000,
            enableSandbox: false,
            sandboxTimeout: 10000
        };
        this.streamingExecutor = new StreamingToolExecutor_1.StreamingToolExecutor(executorConfig);
        // 初始化工具进度服务
        this.toolProgressService = (0, ToolProgressService_1.createToolProgressService)();
        this.toolProgressService.initialize();
        this.toolProgressService.registerExecutor('default', this.streamingExecutor);
        // 设置事件监听器
        this.streamingExecutor.on('execution:progress', (executionId, progress) => {
            this.handleToolProgress(executionId, progress);
        });
        this.streamingExecutor.on('execution:complete', (result) => {
            this.handleToolComplete(result.executionId, result);
        });
        // 初始化类别映射
        for (const category of this.config.defaultCategories) {
            this.toolCategories.set(category, new Set());
        }
    }
    /**
     * 初始化工具注册表
     */
    async initialize() {
        if (this.initialized) {
            return true;
        }
        try {
            this.outputChannel.appendLine('🛠️ Initializing Enhanced Tool Registry...');
            // 加载内置工具
            await this.loadBuiltinTools();
            // 加载用户自定义工具
            await this.loadUserTools();
            // 加载工具配置
            await this.loadToolConfigs();
            this.initialized = true;
            this.outputChannel.appendLine(`✅ Tool Registry initialized with ${this.tools.size} tools`);
            return true;
        }
        catch (error) {
            this.outputChannel.appendLine(`❌ Tool Registry initialization failed: ${error.message}`);
            return false;
        }
    }
    /**
     * 注册工具
     */
    registerTool(tool, categories = [Tool_1.ToolCategory.OTHER]) {
        try {
            // 检查排除列表
            if (this.config.excludeToolIds.includes(tool.id)) {
                this.outputChannel.appendLine(`⚠️ Tool ${tool.id} is in exclude list, skipping registration`);
                return false;
            }
            // 检查包含列表（如果设置了）
            if (this.config.includeToolIds.length > 0 && !this.config.includeToolIds.includes(tool.id)) {
                this.outputChannel.appendLine(`⚠️ Tool ${tool.id} is not in include list, skipping registration`);
                return false;
            }
            // 注册工具
            this.tools.set(tool.id, tool);
            // 添加到类别
            for (const category of categories) {
                const categorySet = this.toolCategories.get(category);
                if (categorySet) {
                    categorySet.add(tool.id);
                }
                else {
                    // 创建新的类别集合
                    this.toolCategories.set(category, new Set([tool.id]));
                }
            }
            // 初始化使用统计
            this.usageStats.set(tool.id, {
                toolId: tool.id,
                usageCount: 0,
                lastUsed: null,
                successCount: 0,
                failureCount: 0,
                averageDuration: 0
            });
            this.outputChannel.appendLine(`✅ Registered tool: ${tool.id} (${tool.name})`);
            return true;
        }
        catch (error) {
            this.outputChannel.appendLine(`❌ Failed to register tool ${tool.id}: ${error.message}`);
            return false;
        }
    }
    /**
     * 检查工具是否已注册
     */
    hasTool(toolId) {
        return this.tools.has(toolId);
    }
    /**
     * 取消注册工具
     */
    unregisterTool(toolId) {
        try {
            // 检查工具是否存在
            if (!this.tools.has(toolId)) {
                return false;
            }
            // 从工具映射中移除
            this.tools.delete(toolId);
            // 从类别中移除
            for (const [category, toolSet] of this.toolCategories) {
                toolSet.delete(toolId);
                if (toolSet.size === 0) {
                    this.toolCategories.delete(category);
                }
            }
            // 移除使用统计
            this.usageStats.delete(toolId);
            // 移除别名
            for (const [alias, id] of this.toolAliases) {
                if (id === toolId) {
                    this.toolAliases.delete(alias);
                }
            }
            this.outputChannel.appendLine(`🗑️ Unregistered tool: ${toolId}`);
            return true;
        }
        catch (error) {
            this.outputChannel.appendLine(`❌ Failed to unregister tool ${toolId}: ${error.message}`);
            return false;
        }
    }
    /**
     * 注册工具定义
     */
    registerToolDefinition(definition, categories = [Tool_1.ToolCategory.OTHER]) {
        try {
            const tool = (0, Tool_1.buildTool)(definition);
            return this.registerTool(tool, categories);
        }
        catch (error) {
            this.outputChannel.appendLine(`❌ Failed to register tool definition ${definition.id}: ${error.message}`);
            return false;
        }
    }
    /**
     * 注册工具别名
     */
    registerToolAlias(alias, toolId) {
        if (!this.tools.has(toolId)) {
            this.outputChannel.appendLine(`❌ Cannot register alias ${alias} for non-existent tool ${toolId}`);
            return false;
        }
        this.toolAliases.set(alias, toolId);
        this.outputChannel.appendLine(`✅ Registered alias: ${alias} -> ${toolId}`);
        return true;
    }
    /**
     * 获取工具
     */
    getTool(toolId) {
        // 检查别名
        const actualToolId = this.toolAliases.get(toolId) || toolId;
        return this.tools.get(actualToolId);
    }
    /**
     * 获取所有工具
     */
    getAllTools() {
        return Array.from(this.tools.values());
    }
    /**
     * 按类别获取工具
     */
    getToolsByCategory(category) {
        const toolIds = this.toolCategories.get(category);
        if (!toolIds) {
            return [];
        }
        const tools = [];
        for (const toolId of toolIds) {
            const tool = this.tools.get(toolId);
            if (tool) {
                tools.push(tool);
            }
        }
        return tools;
    }
    /**
     * 获取所有类别
     */
    getAllCategories() {
        return Array.from(this.toolCategories.keys());
    }
    /**
     * 执行工具（流式）
     */
    async executeToolStreaming(toolId, input, context) {
        const tool = this.getTool(toolId);
        if (!tool) {
            throw new Error(`Tool not found: ${toolId}`);
        }
        // 更新使用统计
        this.updateUsageStats(toolId, 'start');
        // 使用执行器执行工具
        const request = {
            tool: tool,
            params: input,
            context: context
        };
        const executionResult = await this.streamingExecutor.execute(request);
        const executionId = executionResult.executionId;
        // 创建进度流（简化：返回空流）
        const progressStream = this.createProgressStream(executionId);
        // 创建结果Promise
        const resultPromise = executionResult.success
            ? Promise.resolve(executionResult.output)
            : Promise.reject(new Error(executionResult.error || 'Tool execution failed'));
        return {
            executionId,
            stream: progressStream,
            result: resultPromise
        };
    }
    /**
     * 执行工具（同步）
     */
    async executeTool(toolId, input, context) {
        const { result } = await this.executeToolStreaming(toolId, input, context);
        return await result;
    }
    /**
     * 批量执行工具
     */
    async executeToolsBatch(toolExecutions, context) {
        const executions = [];
        // 启动所有工具执行
        for (const { toolId, input } of toolExecutions) {
            try {
                const { executionId, result } = await this.executeToolStreaming(toolId, input, context);
                executions.push({ toolId, executionId, result });
            }
            catch (error) {
                executions.push({
                    toolId,
                    executionId: '',
                    result: Promise.reject(error)
                });
            }
        }
        // 等待所有执行完成
        const results = [];
        for (const exec of executions) {
            try {
                const result = await exec.result;
                results.push({ toolId: exec.toolId, result });
            }
            catch (error) {
                results.push({ toolId: exec.toolId, error: error });
            }
        }
        return results;
    }
    /**
     * 取消工具执行
     */
    async cancelToolExecution(executionId) {
        return await this.streamingExecutor.cancel(executionId);
    }
    /**
     * 获取工具执行状态
     */
    getToolExecutionStatus(executionId) {
        const executionInfo = this.streamingExecutor.getExecutionInfo(executionId);
        if (!executionInfo) {
            return {
                status: 'failed',
                progress: [],
                startTime: undefined,
                endTime: undefined
            };
        }
        // 映射执行状态
        let status;
        switch (executionInfo.state) {
            case 'pending':
                status = 'queued';
                break;
            case 'running':
                status = 'executing';
                break;
            case 'completed':
                status = 'completed';
                break;
            case 'failed':
                status = 'failed';
                break;
            case 'cancelled':
                status = 'cancelled';
                break;
            default:
                status = 'failed';
        }
        const progress = executionInfo.progress ? [executionInfo.progress] : [];
        return {
            status,
            progress,
            startTime: executionInfo.startTime,
            endTime: executionInfo.endTime
        };
    }
    /**
     * 获取工具使用统计
     */
    getToolUsageStats(toolId) {
        if (toolId) {
            return this.usageStats.get(toolId) || {
                toolId,
                usageCount: 0,
                lastUsed: null,
                successCount: 0,
                failureCount: 0,
                averageDuration: 0
            };
        }
        return Array.from(this.usageStats.values());
    }
    /**
     * 获取执行统计
     */
    getExecutionStats() {
        // 返回模拟统计信息
        return {
            activeExecutions: 0,
            queuedExecutions: 0,
            completedExecutions: 0,
            failedExecutions: 0,
            totalExecutions: 0,
            averageExecutionTime: 0
        };
    }
    /**
     * 清理资源
     */
    async cleanup() {
        // streamingExecutor 没有 destroy 方法，跳过
        this.executionResults.clear();
        this.outputChannel.dispose();
    }
    // ==================== 私有方法 ====================
    /**
     * 加载内置工具
     */
    async loadBuiltinTools() {
        this.outputChannel.appendLine('📦 Loading builtin tools...');
        // 这里将加载内置工具定义
        // 实际实现中会从特定目录加载
        this.outputChannel.appendLine('✅ Builtin tools loaded');
    }
    /**
     * 加载用户工具
     */
    async loadUserTools() {
        this.outputChannel.appendLine('👤 Loading user tools...');
        // 这里将加载用户自定义工具
        // 实际实现中会从用户配置目录加载
        this.outputChannel.appendLine('✅ User tools loaded');
    }
    /**
     * 加载工具配置
     */
    async loadToolConfigs() {
        this.outputChannel.appendLine('⚙️ Loading tool configurations...');
        // 这里将加载工具配置
        // 实际实现中会从配置文件加载
        this.outputChannel.appendLine('✅ Tool configurations loaded');
    }
    /**
     * 创建进度流（简化实现）
     */
    async *createProgressStream(executionId) {
        // 简化实现：不返回任何进度
        // 在实际实现中，应该从执行器的事件系统获取进度
        return;
    }
    /**
     * 处理工具进度
     */
    handleToolProgress(toolId, progress) {
        // 这里可以处理进度更新，比如更新UI、记录日志等
        if (progress.type === 'error') {
            this.outputChannel.appendLine(`❌ Tool ${toolId} error: ${JSON.stringify(progress.data)}`);
        }
    }
    /**
     * 处理工具完成
     */
    handleToolComplete(toolId, result, error) {
        // 记录执行结果
        const executionResult = {
            toolId,
            executionId: toolId, // 这里应该使用实际的executionId
            success: !error,
            result,
            error,
            duration: 0, // 需要从执行器获取实际时长
            timestamp: new Date()
        };
        this.executionResults.set(toolId, executionResult);
        if (error) {
            this.outputChannel.appendLine(`❌ Tool ${toolId} execution failed: ${error.message}`);
        }
        else {
            this.outputChannel.appendLine(`✅ Tool ${toolId} execution completed`);
        }
    }
    /**
     * 更新使用统计
     */
    updateUsageStats(toolId, event) {
        const stats = this.usageStats.get(toolId);
        if (!stats) {
            return;
        }
        switch (event) {
            case 'start':
                stats.usageCount++;
                stats.lastUsed = new Date();
                break;
            case 'success':
                stats.successCount++;
                break;
            case 'failure':
                stats.failureCount++;
                break;
        }
        this.usageStats.set(toolId, stats);
    }
    /**
     * 查找工具（按名称）
     */
    findToolByName(name) {
        return (0, Tool_1.findToolByName)(this.tools, name);
    }
    /**
     * 查找工具（按类别）
     */
    findToolsByCategory(category) {
        return (0, Tool_1.findToolsByCategory)(this.tools, category);
    }
}
exports.EnhancedToolRegistry = EnhancedToolRegistry;
//# sourceMappingURL=EnhancedToolRegistry.js.map