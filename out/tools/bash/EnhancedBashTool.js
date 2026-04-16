"use strict";
/**
 * EnhancedBashTool - 增强版终端命令执行工具
 * 集成 TerminalProcess、沙箱管理、命令解析和权限系统
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedBashTool = void 0;
exports.createEnhancedBashTool = createEnhancedBashTool;
const BaseTool_1 = require("../../core/tool/BaseTool");
const Tool_1 = require("../../core/tool/Tool");
const TerminalProcess_1 = require("../../terminal/executor/TerminalProcess");
const SandboxManager_1 = require("../../terminal/sandbox/SandboxManager");
const CommandParser_1 = require("../../terminal/parser/CommandParser");
const RuleManager_1 = require("../../auth/permissions/RuleManager");
const CommandClassifier_1 = require("../../auth/classifier/CommandClassifier");
/**
 * EnhancedBashTool 类
 * 提供完整的终端命令执行能力，包括流式输出、沙箱执行、权限控制和智能分析
 */
class EnhancedBashTool extends BaseTool_1.BaseTool {
    id = 'enhanced-bash';
    name = 'Enhanced Bash';
    description = 'Execute shell commands with full terminal capabilities, sandboxing, and AI-powered security';
    version = '2.0.0';
    author = 'CodeLine Team';
    category = Tool_1.ToolCategory.TERMINAL;
    capabilities = ['terminal', 'shell', 'command', 'execution', 'system', 'sandbox', 'security'];
    // 工具配置
    config = {
        defaultTimeout: 30000,
        maxRetries: 3,
        retryDelay: 1000,
        requireApproval: true,
        autoExecute: false,
        validateParams: true,
        concurrencySafe: false,
        readOnly: false,
        destructive: true,
        enableSandbox: true,
        enableStreaming: true,
        enableProgressUpdates: true,
        maxOutputSize: 1024 * 1024, // 1MB
    };
    // 参数模式
    parameterSchema = {
        command: {
            type: 'string',
            description: 'Shell command to execute',
            required: true,
        },
        timeout: {
            type: 'number',
            description: 'Timeout in milliseconds',
            required: false,
            default: 30000,
        },
        description: {
            type: 'string',
            description: 'Clear, concise description of what the command does',
            required: false,
        },
        run_in_background: {
            type: 'boolean',
            description: 'Whether to run the command in the background',
            required: false,
            default: false,
        },
        dangerouslyDisableSandbox: {
            type: 'boolean',
            description: 'DANGEROUS: Disable sandbox execution (not recommended)',
            required: false,
            default: false,
        },
        requireConfirmation: {
            type: 'boolean',
            description: 'Whether to require user confirmation before execution',
            required: false,
            default: true,
        },
    };
    // 核心组件
    sandboxManager;
    commandParser;
    ruleManager;
    commandClassifier;
    activeProcesses = new Map();
    constructor() {
        super();
        // 初始化核心组件
        this.sandboxManager = (0, SandboxManager_1.createSandboxManager)({
            workspaceRoot: process.cwd(),
            allowedPaths: [process.cwd()],
            maxExecutionTime: this.config.defaultTimeout,
            maxOutputSize: this.config.maxOutputSize,
            allowNetwork: false,
        });
        this.commandParser = (0, CommandParser_1.createCommandParser)();
        this.ruleManager = (0, RuleManager_1.createRuleManager)();
        this.commandClassifier = (0, CommandClassifier_1.createCommandClassifier)();
    }
    /**
     * 获取工具类别
     */
    getToolCategory() {
        return Tool_1.ToolCategory.TERMINAL;
    }
    /**
     * 是否启用
     */
    isEnabled(context) {
        return true; // EnhancedBashTool 总是启用
    }
    /**
     * 检查权限
     */
    async checkPermissions(input, context) {
        const { command, dangerouslyDisableSandbox } = input;
        try {
            // 1. 使用命令解析器进行语义分析
            const parsed = this.commandParser.parse(command);
            const semantic = parsed.semantic;
            if (!semantic) {
                return {
                    allowed: true,
                    requiresUserConfirmation: true,
                    reason: '无法分析命令语义，建议确认',
                };
            }
            // 2. 使用AI分类器进行风险评估
            const classification = await this.commandClassifier.classify(command, {
                workspaceRoot: context.cwd || context.workspaceRoot,
                userId: context.userId,
            });
            // 3. 使用规则管理器检查权限
            const ruleCheck = this.ruleManager.checkPermission(this.id, input, {
                ...context,
                parsedCommand: parsed,
                semantic,
                classification,
            });
            // 4. 综合决策
            const riskLevel = Math.max(semantic.riskLevel, classification.riskLevel);
            const requiresConfirmation = ruleCheck.requiresConfirmation ||
                classification.suggestedAction === 'ask' ||
                semantic.suggestedSandboxLevel === 'high' ||
                riskLevel >= 7 ||
                input.requireConfirmation !== false;
            // 5. 检查是否禁用沙箱（危险操作）
            if (dangerouslyDisableSandbox && riskLevel >= 5) {
                return {
                    allowed: false,
                    requiresUserConfirmation: false,
                    reason: '高风险命令不允许禁用沙箱',
                };
            }
            return {
                allowed: ruleCheck.allowed,
                requiresUserConfirmation: requiresConfirmation,
                reason: ruleCheck.reason || `风险评估: ${riskLevel}/10, 建议沙箱级别: ${semantic.suggestedSandboxLevel}`,
            };
        }
        catch (error) {
            console.error('权限检查失败:', error);
            return {
                allowed: true, // 出错时默认允许但需要确认
                requiresUserConfirmation: true,
                reason: `权限检查出错: ${error.message}`,
            };
        }
    }
    /**
     * 验证参数
     */
    async validateParameters(input, context) {
        const { command, timeout } = input;
        if (!command || command.trim().length === 0) {
            return {
                valid: false,
                error: '命令不能为空',
            };
        }
        // 检查命令长度
        if (command.length > 10000) {
            return {
                valid: false,
                error: '命令过长，最大长度为10000字符',
            };
        }
        // 检查超时时间
        if (timeout && (timeout < 100 || timeout > 600000)) {
            return {
                valid: false,
                error: '超时时间必须在100ms到600000ms（10分钟）之间',
            };
        }
        // 使用命令解析器验证语法
        try {
            const parsed = this.commandParser.parse(command);
            const safetyCheck = this.commandParser.validateSafety(parsed);
            if (!safetyCheck.safe) {
                // 语法有效但危险，我们仍然返回valid: true，但将警告信息放在错误中
                return {
                    valid: true,
                    error: `命令安全检查警告: ${safetyCheck.warnings.join(', ')}`,
                    sanitizedParams: {
                        ...input,
                        _riskLevel: safetyCheck.riskLevel,
                        _warnings: safetyCheck.warnings,
                    },
                };
            }
            return {
                valid: true,
                sanitizedParams: {
                    ...input,
                    _parsedCommand: parsed,
                    _safetyCheck: safetyCheck,
                },
            };
        }
        catch (error) {
            return {
                valid: false,
                error: `命令解析失败: ${error.message}`,
            };
        }
    }
    /**
     * 执行工具（抽象方法实现）
     */
    async executeTool(input, context, onProgress) {
        const startTime = Date.now();
        const { command, timeout, dangerouslyDisableSandbox, run_in_background } = input;
        try {
            // 报告开始执行
            if (onProgress) {
                onProgress({
                    type: 'enhanced_bash_start',
                    data: { command, toolId: this.id },
                    progress: 0.1,
                    message: `开始执行命令: ${command.substring(0, 50)}${command.length > 50 ? '...' : ''}`,
                });
            }
            // 解析命令
            const parsed = this.commandParser.parse(command);
            const semantic = parsed.semantic;
            // 报告解析结果
            if (onProgress) {
                onProgress({
                    type: 'enhanced_bash_parsed',
                    data: { parsed, semantic, toolId: this.id },
                    progress: 0.2,
                    message: `命令解析完成: ${semantic.type} (风险等级: ${semantic.riskLevel}/10)`,
                });
            }
            // 确定执行策略
            const useSandbox = this.config.enableSandbox &&
                !dangerouslyDisableSandbox &&
                semantic.suggestedSandboxLevel !== 'none';
            let result;
            if (useSandbox) {
                // 沙箱执行
                if (onProgress) {
                    onProgress({
                        type: 'enhanced_bash_sandbox',
                        data: { sandboxLevel: semantic.suggestedSandboxLevel, toolId: this.id },
                        progress: 0.3,
                        message: `在沙箱中执行命令 (级别: ${semantic.suggestedSandboxLevel})`,
                    });
                }
                const sandboxResult = await this.sandboxManager.executeInSandbox(command, {
                    timeout: timeout || this.config.defaultTimeout,
                    cwd: context.cwd || context.workspaceRoot,
                });
                if (!sandboxResult.success) {
                    throw new Error(`沙箱执行失败: ${sandboxResult.error?.message || '未知错误'}`);
                }
                result = sandboxResult.result;
            }
            else {
                // 直接执行
                if (onProgress) {
                    onProgress({
                        type: 'enhanced_bash_executing',
                        data: { command, toolId: this.id },
                        progress: 0.3,
                        message: '直接执行命令',
                    });
                }
                const process = (0, TerminalProcess_1.createTerminalProcess)({
                    command,
                    cwd: context.cwd || context.workspaceRoot,
                    timeout: timeout || this.config.defaultTimeout,
                    shell: true,
                });
                // 注册进程以便取消
                const processId = `bash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                this.activeProcesses.set(processId, process);
                // 监听进度
                if (this.config.enableStreaming && onProgress) {
                    process.on('output', (event) => {
                        onProgress({
                            type: 'enhanced_bash_output',
                            data: { ...event, toolId: this.id },
                            progress: 0.5, // 输出阶段进度
                            message: `输出: ${event.data.substring(0, 100)}${event.data.length > 100 ? '...' : ''}`,
                        });
                    });
                }
                const processResult = await process.start();
                this.activeProcesses.delete(processId);
                result = processResult;
            }
            const duration = Date.now() - startTime;
            // 报告完成
            if (onProgress) {
                onProgress({
                    type: 'enhanced_bash_complete',
                    data: { result, duration, toolId: this.id },
                    progress: 1.0,
                    message: `命令执行完成 (${duration}ms)`,
                });
            }
            // 获取建议和警告
            const suggestions = this.commandParser.getSuggestions(parsed);
            const safetyCheck = this.commandParser.validateSafety(parsed);
            return {
                success: true,
                output: {
                    stdout: result.stdout || '',
                    stderr: result.stderr || '',
                    interrupted: result.interrupted || false,
                    exitCode: result.exitCode,
                    duration: result.duration || duration,
                    warnings: safetyCheck.warnings,
                    suggestions,
                    riskLevel: semantic.riskLevel,
                },
                toolId: this.id,
                duration,
                timestamp: new Date(),
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            // 报告错误
            if (onProgress) {
                onProgress({
                    type: 'enhanced_bash_error',
                    data: { error: error.message, toolId: this.id },
                    progress: 1.0,
                    message: `命令执行失败: ${error.message}`,
                });
            }
            return {
                success: false,
                error: error.message,
                toolId: this.id,
                duration,
                timestamp: new Date(),
            };
        }
    }
    /**
     * 取消执行
     */
    async cancel(executionId) {
        // 简化实现：取消所有活动进程
        let cancelled = false;
        for (const [processId, process] of this.activeProcesses) {
            try {
                process.stop('SIGTERM');
                this.activeProcesses.delete(processId);
                cancelled = true;
            }
            catch (error) {
                console.error(`取消进程失败 ${processId}:`, error);
            }
        }
        return cancelled;
    }
    /**
     * 获取显示名称
     */
    getDisplayName(input) {
        if (input?.command) {
            return `Bash: ${input.command.substring(0, 30)}${input.command.length > 30 ? '...' : ''}`;
        }
        return this.name;
    }
    /**
     * 获取活动描述
     */
    getActivityDescription(input) {
        return input.description || `执行命令: ${input.command.substring(0, 50)}${input.command.length > 50 ? '...' : ''}`;
    }
    /**
     * 是否只读
     */
    isReadOnly(context) {
        return false; // Bash 命令通常是可写的
    }
    /**
     * 是否破坏性
     */
    isDestructive(context) {
        return true; // Bash 命令可能是破坏性的
    }
    /**
     * 清理资源
     */
    async cleanup() {
        // 取消所有活动进程（传递空字符串作为执行ID）
        await this.cancel('');
        // 清理沙箱资源
        await this.sandboxManager.cleanup();
        // 清理其他资源
        this.activeProcesses.clear();
    }
}
exports.EnhancedBashTool = EnhancedBashTool;
/**
 * 工厂函数：创建 EnhancedBashTool 实例
 */
function createEnhancedBashTool(context) {
    return new EnhancedBashTool();
}
//# sourceMappingURL=EnhancedBashTool.js.map