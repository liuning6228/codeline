"use strict";
/**
 * 增强任务引擎
 * 集成统一工具系统的 TaskEngine 扩展
 * 基于Claude Code CP-20260402-003插件化工具系统模式
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
exports.EnhancedTaskEngine = void 0;
const vscode = __importStar(require("vscode"));
const taskEngine_1 = require("../task/taskEngine");
const ToolRegistry_1 = require("./ToolRegistry");
const ToolLoader_1 = require("./ToolLoader");
/**
 * 增强任务引擎
 */
class EnhancedTaskEngine extends taskEngine_1.TaskEngine {
    toolRegistry = null;
    toolLoader = null;
    isToolSystemReady = false;
    toolContext = null;
    workspaceRoot;
    vscodeContext = null;
    constructor(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        // 检测调用模式：旧版(workspaceRoot, vscodeContext, options) 或 新版(projectAnalyzer, promptEngine, ...)
        const isLegacyCall = typeof arg1 === 'string' && arg2?.extensionPath !== undefined;
        // 准备父类构造函数参数
        let projectAnalyzer;
        let promptEngine;
        let modelAdapter;
        let fileManager;
        let terminalExecutor;
        let browserAutomator;
        if (isLegacyCall) {
            // 旧版调用: 使用默认依赖
            projectAnalyzer = {};
            promptEngine = {};
            modelAdapter = {};
            fileManager = {};
            terminalExecutor = {};
            browserAutomator = {};
        }
        else {
            // 新版调用: 使用提供的依赖
            projectAnalyzer = arg1;
            promptEngine = arg2;
            modelAdapter = arg3;
            fileManager = arg4;
            terminalExecutor = arg5;
            browserAutomator = arg6;
        }
        // 必须的super调用（无条件的根级语句）
        super(projectAnalyzer, promptEngine, modelAdapter, fileManager, terminalExecutor, browserAutomator);
        // 现在可以设置其他属性
        if (isLegacyCall) {
            // 旧版调用: (workspaceRoot: string, vscodeContext: vscode.ExtensionContext, options?: EnhancedTaskEngineOptions)
            const workspaceRoot = arg1;
            const vscodeContext = arg2;
            const options = arg3 || {
                enableToolSystem: true,
                autoLoadTools: true,
                showLoadingProgress: true,
            };
            this.workspaceRoot = workspaceRoot || process.cwd();
            this.vscodeContext = vscodeContext;
            // 如果启用工具系统，初始化它
            if (options.enableToolSystem && vscodeContext) {
                this.initializeToolSystem(vscodeContext, options);
            }
        }
        else {
            // 新版调用: (projectAnalyzer, promptEngine, modelAdapter, fileManager, terminalExecutor, browserAutomator?, workspaceRoot?, vscodeContext?, options?)
            const workspaceRoot = arg7;
            const vscodeContext = arg8;
            const options = arg9 || {
                enableToolSystem: true,
                autoLoadTools: true,
                showLoadingProgress: true,
            };
            this.workspaceRoot = workspaceRoot || process.cwd();
            if (vscodeContext) {
                this.vscodeContext = vscodeContext;
            }
            // 如果启用工具系统，初始化它
            if (options.enableToolSystem && vscodeContext) {
                this.initializeToolSystem(vscodeContext, options);
            }
        }
    }
    /**
     * 初始化工具系统
     */
    async initializeToolSystem(vscodeContext, options) {
        try {
            // 创建输出通道
            const outputChannel = vscode.window.createOutputChannel('CodeLine Tools');
            // 创建工具上下文
            this.toolContext = {
                extensionContext: vscodeContext,
                workspaceRoot: this.workspaceRoot,
                cwd: process.cwd(),
                outputChannel,
                sessionId: `task-engine-${Date.now()}`,
                sharedResources: {},
            };
            // 创建工具注册表
            const toolRegistry = new ToolRegistry_1.ToolRegistry();
            this.toolRegistry = toolRegistry;
            // 创建工具加载器
            this.toolLoader = new ToolLoader_1.ToolLoader(this.toolContext, toolRegistry, {
                enableFileTools: true,
                enableTerminalTools: true,
                enableBrowserTools: true,
                enableMCPTools: true,
                autoLoadTools: options.autoLoadTools,
                showLoadingProgress: options.showLoadingProgress,
                loadingTimeout: 30000,
            });
            // 异步加载工具
            if (options.autoLoadTools) {
                this.loadTools();
            }
            // 获取配置服务
            // ConfigService initialization removed - module not found
            outputChannel.appendLine('✅ Enhanced Task Engine initialized with tool system');
            this.isToolSystemReady = true;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to initialize tool system: ${error.message}`);
            this.isToolSystemReady = false;
        }
    }
    /**
     * 加载工具
     */
    async loadTools() {
        if (!this.toolLoader) {
            throw new Error('Tool system not initialized');
        }
        try {
            const success = await this.toolLoader.loadTools();
            this.isToolSystemReady = success;
            if (success) {
                this.toolContext?.outputChannel.appendLine('✅ Tools loaded successfully');
            }
            else {
                this.toolContext?.outputChannel.appendLine('⚠️ Tools partially loaded or failed');
            }
            return success;
        }
        catch (error) {
            this.toolContext?.outputChannel.appendLine(`❌ Tool loading failed: ${error.message}`);
            this.isToolSystemReady = false;
            return false;
        }
    }
    /**
     * 增强的任务执行方法（AsyncGenerator版本）
     */
    async *executeTask(taskDescription, options) {
        if (!this.isToolSystemReady) {
            // 如果工具系统未就绪，使用父类的执行方法
            const result = yield* this.executeLegacyTask(taskDescription, options);
            return result;
        }
        const startTime = Date.now();
        const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const toolExecutions = [];
        try {
            // 发送任务开始事件
            yield {
                type: 'task_started',
                taskId,
                taskDescription,
                timestamp: new Date().toISOString(),
                message: `Starting enhanced task: ${taskDescription}`,
            };
            // 分析任务描述，提取工具调用
            const toolCalls = await this.analyzeTaskForToolCalls(taskDescription);
            // 发送分析完成事件
            yield {
                type: 'task_analyzed',
                taskId,
                toolCount: toolCalls.length,
                timestamp: new Date().toISOString(),
                message: `Task analysis complete: ${toolCalls.length} tool calls identified`,
            };
            // 执行工具调用
            let executionIndex = 0;
            for (const toolCall of toolCalls) {
                executionIndex++;
                // 发送工具开始事件
                yield {
                    type: 'tool_execution_started',
                    taskId,
                    toolId: toolCall.toolId,
                    executionIndex,
                    totalExecutions: toolCalls.length,
                    timestamp: new Date().toISOString(),
                    message: `Executing tool: ${toolCall.toolId}`,
                };
                let toolStartTime = Date.now();
                try {
                    toolStartTime = Date.now();
                    // 执行工具
                    const toolResult = await this.executeToolWithRegistry(toolCall.toolId, toolCall.params, executionIndex, toolCalls.length);
                    const toolDuration = Date.now() - toolStartTime;
                    // 记录执行结果
                    toolExecutions.push({
                        toolId: toolCall.toolId,
                        success: toolResult.success,
                        duration: toolDuration,
                        output: toolResult.output,
                        error: toolResult.error,
                    });
                    // 发送工具完成事件
                    yield {
                        type: 'tool_execution_completed',
                        taskId,
                        toolId: toolCall.toolId,
                        success: toolResult.success,
                        duration: toolDuration,
                        executionIndex,
                        totalExecutions: toolCalls.length,
                        timestamp: new Date().toISOString(),
                        message: toolResult.success
                            ? `Tool ${toolCall.toolId} executed successfully`
                            : `Tool ${toolCall.toolId} failed: ${toolResult.error}`,
                    };
                }
                catch (error) {
                    const toolDuration = Date.now() - toolStartTime;
                    // 记录失败结果
                    toolExecutions.push({
                        toolId: toolCall.toolId,
                        success: false,
                        duration: toolDuration,
                        error: error.message,
                    });
                    // 发送工具失败事件
                    yield {
                        type: 'tool_execution_failed',
                        taskId,
                        toolId: toolCall.toolId,
                        error: error.message,
                        executionIndex,
                        totalExecutions: toolCalls.length,
                        timestamp: new Date().toISOString(),
                        message: `Tool ${toolCall.toolId} failed: ${error.message}`,
                    };
                    // 如果任务选项要求错误时停止，则中断执行
                    if (options?.stopOnError) {
                        throw new Error(`Tool execution failed: ${error.message}`);
                    }
                }
            }
            // 计算统计信息
            const toolStats = {
                totalTools: toolExecutions.length,
                successfulTools: toolExecutions.filter(t => t.success).length,
                failedTools: toolExecutions.filter(t => !t.success).length,
                totalDuration: toolExecutions.reduce((sum, t) => sum + t.duration, 0),
            };
            const totalDuration = Date.now() - startTime;
            // 创建增强任务结果
            const result = {
                success: toolStats.failedTools === 0,
                output: {
                    taskDescription,
                    toolExecutions,
                    toolStats,
                    totalDuration,
                },
                duration: totalDuration,
                taskId,
                toolDetails: toolExecutions,
                toolStats,
            };
            // 发送任务完成事件
            yield {
                type: 'task_completed',
                taskId,
                success: result.success,
                duration: totalDuration,
                toolStats,
                timestamp: new Date().toISOString(),
                message: `Task ${result.success ? 'completed successfully' : 'completed with errors'}`,
            };
            return result;
        }
        catch (error) {
            const totalDuration = Date.now() - startTime;
            // 发送任务失败事件
            yield {
                type: 'task_failed',
                taskId,
                error: error.message,
                duration: totalDuration,
                timestamp: new Date().toISOString(),
                message: `Task failed: ${error.message}`,
            };
            // 返回失败结果
            return {
                success: false,
                output: error.message, // 添加必需的output属性
                error: error.message,
                duration: totalDuration,
                taskId,
                toolDetails: toolExecutions,
                toolStats: {
                    totalTools: toolExecutions.length,
                    successfulTools: toolExecutions.filter(t => t.success).length,
                    failedTools: toolExecutions.filter(t => !t.success).length,
                    totalDuration: toolExecutions.reduce((sum, t) => sum + t.duration, 0),
                },
            };
        }
    }
    /**
     * 使用工具注册表执行工具（带进度报告）
     */
    async executeToolWithRegistry(toolId, params, currentIndex, totalCount) {
        if (!this.toolRegistry || !this.toolContext) {
            throw new Error('Tool system not ready');
        }
        // 创建进度回调
        const onProgress = (progress) => {
            // 可以在这里发送进度事件到UI
            if (this.toolContext?.outputChannel) {
                this.toolContext.outputChannel.appendLine(`Tool ${toolId} progress: ${progress.progress * 100}% - ${progress.message || ''}`);
            }
        };
        return await this.toolRegistry.executeTool(toolId, params, this.toolContext, onProgress);
    }
    /**
     * 分析任务描述，提取工具调用
     */
    async analyzeTaskForToolCalls(taskDescription) {
        // 简单的规则引擎，基于任务描述识别工具调用
        const toolCalls = [];
        const descriptionLower = taskDescription.toLowerCase();
        // 文件操作检测
        if (descriptionLower.includes('read file') || descriptionLower.includes('open file')) {
            const fileNameMatch = taskDescription.match(/(?:read|open) (?:the )?file[:\s]+"?([^"\n]+)"?/i);
            if (fileNameMatch) {
                toolCalls.push({
                    toolId: 'file-manager',
                    params: {
                        operation: 'read',
                        filePath: fileNameMatch[1].trim(),
                    },
                });
            }
        }
        if (descriptionLower.includes('create file') || descriptionLower.includes('write file')) {
            const fileNameMatch = taskDescription.match(/(?:create|write) (?:a )?file[:\s]+"?([^"\n]+)"?/i);
            if (fileNameMatch) {
                const contentMatch = taskDescription.match(/with content[:\s]+"?([^"\n]+)"?/i);
                toolCalls.push({
                    toolId: 'file-manager',
                    params: {
                        operation: 'create',
                        filePath: fileNameMatch[1].trim(),
                        content: contentMatch ? contentMatch[1].trim() : '',
                    },
                });
            }
        }
        if (descriptionLower.includes('list files') || descriptionLower.includes('list directory')) {
            const dirMatch = taskDescription.match(/(?:list) (?:files in|directory)[:\s]+"?([^"\n]+)"?/i);
            toolCalls.push({
                toolId: 'file-manager',
                params: {
                    operation: 'list',
                    filePath: dirMatch ? dirMatch[1].trim() : '.',
                    recursive: descriptionLower.includes('recursive'),
                },
            });
        }
        // 终端命令检测
        if (descriptionLower.includes('run command') || descriptionLower.includes('execute command')) {
            const commandMatch = taskDescription.match(/(?:run|execute) (?:the )?command[:\s]+"?([^"\n]+)"?/i);
            if (commandMatch) {
                toolCalls.push({
                    toolId: 'terminal-executor',
                    params: {
                        type: 'single',
                        command: commandMatch[1].trim(),
                    },
                });
            }
        }
        // 浏览器自动化检测
        if (descriptionLower.includes('open url') || descriptionLower.includes('navigate to')) {
            const urlMatch = taskDescription.match(/(?:open|navigate to) (?:the )?(?:url|website)[:\s]+"?([^"\n]+)"?/i);
            if (urlMatch) {
                toolCalls.push({
                    toolId: 'browser-automator',
                    params: {
                        mode: 'navigate',
                        url: urlMatch[1].trim(),
                    },
                });
            }
        }
        // MCP工具检测
        if (descriptionLower.includes('mcp tool') || descriptionLower.includes('use tool')) {
            const toolMatch = taskDescription.match(/(?:use|execute) (?:mcp )?tool[:\s]+"?([^"\n]+)"?/i);
            if (toolMatch) {
                toolCalls.push({
                    toolId: 'mcp-manager',
                    params: {
                        operation: 'execute',
                        toolId: toolMatch[1].trim(),
                    },
                });
            }
        }
        // 如果没有检测到工具调用，使用默认的文件管理工具
        if (toolCalls.length === 0) {
            toolCalls.push({
                toolId: 'file-manager',
                params: {
                    operation: 'list',
                    filePath: '.',
                    recursive: false,
                },
            });
        }
        return toolCalls;
    }
    /**
     * 传统任务执行方法（工具系统未就绪时使用）
     */
    async *executeLegacyTask(taskDescription, options) {
        const startTime = Date.now();
        const taskId = `legacy-${startTime}`;
        yield {
            type: 'task_started',
            taskId,
            taskDescription,
            timestamp: new Date().toISOString(),
            message: 'Starting legacy task execution (tool system not ready)',
        };
        // 使用父类的startTask方法
        const result = await super.startTask(taskDescription, options);
        const duration = Date.now() - startTime;
        yield {
            type: 'task_completed',
            taskId,
            success: result.success,
            duration,
            timestamp: new Date().toISOString(),
            message: 'Legacy task execution completed',
        };
        // 将TaskResult转换为EnhancedTaskResult
        const enhancedResult = {
            success: result.success,
            output: result.output, // string类型，符合EnhancedTaskResult的string | any类型
            duration,
            taskId,
            error: result.error,
            toolDetails: [],
            toolStats: {
                totalTools: 0,
                successfulTools: 0,
                failedTools: 0,
                totalDuration: 0,
            },
        };
        return enhancedResult;
    }
    /**
     * 获取工具注册表
     */
    getToolRegistry() {
        return this.toolRegistry;
    }
    /**
     * 获取工具加载状态
     */
    getToolSystemStatus() {
        if (!this.toolRegistry || !this.toolLoader) {
            return {
                isReady: false,
                toolCount: 0,
                loadedTools: 0,
            };
        }
        const registryStatus = this.toolRegistry.getStatus();
        const loaderStatus = this.toolLoader.getLoadingStatus();
        return {
            isReady: loaderStatus.isLoaded && this.isToolSystemReady,
            toolCount: registryStatus.toolCount,
            loadedTools: registryStatus.toolCount,
        };
    }
    /**
     * 获取可用工具列表
     */
    getAvailableTools() {
        if (!this.toolRegistry || !this.toolContext) {
            return [];
        }
        const tools = this.toolRegistry.getAllTools(this.toolContext, {
            enabledOnly: true,
        });
        return tools.map(tool => ({
            id: tool.id,
            name: tool.name,
            description: tool.description,
            category: tool.capabilities?.[0] || 'other',
        }));
    }
    /**
     * 清理资源
     */
    async dispose() {
        if (this.toolLoader) {
            await this.toolLoader.close();
        }
        if (this.toolContext?.outputChannel) {
            this.toolContext.outputChannel.dispose();
        }
        // 父类TaskEngine没有dispose方法，跳过调用
    }
}
exports.EnhancedTaskEngine = EnhancedTaskEngine;
//# sourceMappingURL=EnhancedTaskEngine.js.map