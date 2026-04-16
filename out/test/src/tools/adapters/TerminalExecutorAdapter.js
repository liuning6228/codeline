"use strict";
/**
 * 终端执行器适配器
 * 将现有的 TerminalExecutor 模块适配到统一的工具接口
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalExecutorAdapter = void 0;
const terminalExecutor_1 = require("../../terminal/terminalExecutor");
const ToolAdapter_1 = require("./ToolAdapter");
/**
 * 终端执行器适配器
 */
class TerminalExecutorAdapter extends ToolAdapter_1.BaseToolAdapter {
    terminalExecutor;
    isExecuting = false;
    constructor(context) {
        super('terminal-executor', 'Terminal Executor', 'Execute shell commands and scripts in the terminal', '1.0.0', 'CodeLine Team', ['terminal', 'shell', 'command', 'execution', 'system'], {
            type: {
                type: 'string',
                description: 'Command execution type (single or batch)',
                required: true,
                validation: (value) => ['single', 'batch'].includes(value),
                default: 'single',
            },
            command: {
                type: 'string',
                description: 'Single command to execute (for type="single")',
                required: false,
            },
            commands: {
                type: 'array',
                description: 'List of commands to execute (for type="batch")',
                required: false,
            },
            cwd: {
                type: 'string',
                description: 'Working directory (relative to workspace)',
                required: false,
                default: '.',
            },
            env: {
                type: 'object',
                description: 'Environment variables',
                required: false,
            },
            timeout: {
                type: 'number',
                description: 'Timeout in milliseconds',
                required: false,
                default: 30000,
            },
            shell: {
                type: 'boolean',
                description: 'Use shell for command execution',
                required: false,
                default: true,
            },
            stopOnError: {
                type: 'boolean',
                description: 'Stop execution on first error (for batch mode)',
                required: false,
                default: true,
            },
            processOutputInRealTime: {
                type: 'boolean',
                description: 'Process output in real-time',
                required: false,
                default: false,
            },
        });
        this.terminalExecutor = new terminalExecutor_1.TerminalExecutor();
    }
    /**
     * 检查权限 - 终端命令需要特别注意
     */
    async checkPermissions(params, context) {
        const { type, command, commands } = params;
        // 检查命令安全性
        let commandsToCheck = [];
        if (type === 'single' && command) {
            commandsToCheck = [command];
        }
        else if (type === 'batch' && commands) {
            commandsToCheck = commands;
        }
        // 检查每个命令的安全性
        const unsafeCommands = [];
        for (const cmd of commandsToCheck) {
            if (!this.isCommandSafe(cmd)) {
                unsafeCommands.push(cmd);
            }
        }
        if (unsafeCommands.length > 0) {
            return {
                allowed: false,
                reason: `Unsafe commands detected: ${unsafeCommands.join(', ')}`,
                requiresUserConfirmation: true,
                confirmationPrompt: `The following commands may be unsafe: ${unsafeCommands.join(', ')}. Are you sure you want to execute them?`,
            };
        }
        // 需要用户确认终端命令
        return {
            allowed: true,
            requiresUserConfirmation: true,
            confirmationPrompt: `Are you sure you want to execute ${type === 'single' ? 'a terminal command' : `${commandsToCheck.length} terminal commands`}?`,
        };
    }
    /**
     * 验证参数
     */
    async validateParameters(params, context) {
        const { type, command, commands } = params;
        // 基本验证
        if (!type) {
            return {
                valid: false,
                error: 'Type is required (single or batch)',
            };
        }
        // 类型特定验证
        if (type === 'single') {
            if (!command || command.trim().length === 0) {
                return {
                    valid: false,
                    error: 'Command is required for single execution',
                };
            }
        }
        else if (type === 'batch') {
            if (!commands || !Array.isArray(commands) || commands.length === 0) {
                return {
                    valid: false,
                    error: 'Commands array is required for batch execution',
                };
            }
            // 验证每个命令
            for (let i = 0; i < commands.length; i++) {
                const cmd = commands[i];
                if (!cmd || cmd.trim().length === 0) {
                    return {
                        valid: false,
                        error: `Command at index ${i} is empty`,
                    };
                }
            }
        }
        else {
            return {
                valid: false,
                error: `Invalid type: ${type}. Must be 'single' or 'batch'`,
            };
        }
        // 清理参数
        const sanitizedParams = {
            ...params,
            cwd: params.cwd || '.',
            timeout: params.timeout || 30000,
            shell: params.shell !== undefined ? params.shell : true,
            stopOnError: params.stopOnError !== undefined ? params.stopOnError : true,
            processOutputInRealTime: params.processOutputInRealTime !== undefined ? params.processOutputInRealTime : false,
        };
        return {
            valid: true,
            sanitizedParams,
        };
    }
    /**
     * 执行终端命令
     */
    async execute(params, context, onProgress) {
        const startTime = Date.now();
        const { type, cwd } = params;
        if (this.isExecuting) {
            return this.createErrorResult('Another terminal command is already executing', Date.now() - startTime);
        }
        this.isExecuting = true;
        try {
            // 设置终端选项
            const terminalOptions = {
                cwd: cwd || context.cwd,
                env: params.env,
                timeout: params.timeout,
                shell: params.shell,
                stopOnError: params.stopOnError,
                onOutput: params.processOutputInRealTime ? (data) => {
                    this.reportProgress(onProgress, {
                        type: 'terminal_output',
                        progress: 0.5, // 中间进度
                        message: 'Command output received',
                        data: { output: data },
                    });
                } : undefined,
            };
            let terminalResults;
            // 报告开始进度
            this.reportProgress(onProgress, {
                type: 'terminal_start',
                progress: 0.1,
                message: 'Starting terminal execution',
                data: { type },
            });
            // 执行命令
            if (type === 'single' && params.command) {
                this.reportProgress(onProgress, {
                    type: 'terminal_command_executing',
                    progress: 0.3,
                    message: `Executing command: ${params.command}`,
                    data: { command: params.command },
                });
                const result = await this.terminalExecutor.executeCommand(params.command, terminalOptions);
                terminalResults = [result];
            }
            else if (type === 'batch' && params.commands) {
                this.reportProgress(onProgress, {
                    type: 'terminal_batch_start',
                    progress: 0.2,
                    message: `Executing batch of ${params.commands.length} commands`,
                    data: { commandCount: params.commands.length },
                });
                // 批量执行
                terminalResults = await this.terminalExecutor.executeCommands(params.commands, terminalOptions);
                // 报告批量进度
                for (let i = 0; i < terminalResults.length; i++) {
                    const result = terminalResults[i];
                    const progressValue = 0.2 + (0.6 * (i + 1)) / terminalResults.length;
                    this.reportProgress(onProgress, {
                        type: 'terminal_batch_progress',
                        progress: progressValue,
                        message: `Command ${i + 1}/${params.commands.length}: ${result.success ? '✓' : '✗'}`,
                        data: {
                            index: i,
                            total: params.commands.length,
                            success: result.success,
                            command: params.commands[i],
                        },
                    });
                }
            }
            else {
                throw new Error(`Invalid execution parameters: type=${type}`);
            }
            // 计算摘要
            const summary = {
                totalCommands: terminalResults.length,
                successfulCommands: terminalResults.filter(r => r.success).length,
                failedCommands: terminalResults.filter(r => !r.success).length,
                totalDuration: terminalResults.reduce((sum, r) => sum + (r.duration || 0), 0),
            };
            // 报告完成进度
            this.reportProgress(onProgress, {
                type: 'terminal_complete',
                progress: 1.0,
                message: `Terminal execution complete: ${summary.successfulCommands}/${summary.totalCommands} successful`,
                data: { summary },
            });
            const duration = Date.now() - startTime;
            // 返回结果
            if (summary.successfulCommands > 0 || summary.failedCommands === 0) {
                return this.createSuccessResult({
                    results: terminalResults,
                    summary,
                }, duration, {
                    type,
                    cwd: terminalOptions.cwd,
                    totalCommands: summary.totalCommands,
                });
            }
            else {
                return this.createErrorResult(`All ${summary.totalCommands} commands failed`, duration, {
                    type,
                    cwd: terminalOptions.cwd,
                    results: terminalResults,
                });
            }
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.reportProgress(onProgress, {
                type: 'terminal_error',
                progress: 1.0,
                message: `Terminal execution failed: ${error.message}`,
            });
            return this.createErrorResult(`Terminal execution failed: ${error.message}`, duration, {
                type,
                cwd: params.cwd || context.cwd,
            });
        }
        finally {
            this.isExecuting = false;
        }
    }
    /**
     * 取消执行
     */
    async cancel(executionId) {
        try {
            const stopped = this.terminalExecutor.stopCurrentCommand();
            if (stopped) {
                this.outputChannel.appendLine(`Command cancelled by user`);
                return true;
            }
            return false;
        }
        catch (error) {
            this.outputChannel.appendLine(`Failed to cancel command: ${error.message}`);
            return false;
        }
    }
    /**
     * 检查是否为破坏性操作
     */
    isDestructive(context) {
        return true; // 终端命令可能是破坏性的
    }
    /**
     * 获取显示名称
     */
    getDisplayName(params) {
        const type = params?.type || 'single';
        return type === 'single' ? 'Terminal Command' : 'Terminal Batch';
    }
    /**
     * 获取活动描述
     */
    getActivityDescription(params) {
        const { type, command, commands } = params;
        if (type === 'single' && command) {
            return `Executing terminal command: ${command}`;
        }
        else if (type === 'batch' && commands) {
            return `Executing ${commands.length} terminal commands`;
        }
        else {
            return 'Executing terminal commands';
        }
    }
    /**
     * 检查命令安全性
     */
    isCommandSafe(command) {
        // 危险命令模式
        const dangerousPatterns = [
            /rm\s+-rf\s+\/\S*/i, // rm -rf /
            /rm\s+-rf\s+\/\*/i, // rm -rf /*
            /dd\s+if=\/dev\/zero/i, // dd if=/dev/zero
            /mkfs\.?\s+/i, // mkfs
            /format\s+/i, // format
            /chmod\s+-R\s+777\s+\//i, // chmod -R 777 /
            /chown\s+-R\s+root:root\s+\//i, // chown -R root:root /
            /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\};\s*:/i, // fork bomb
            /wget\s+.*\|\s*sh/i, // wget ... | sh
            /curl\s+.*\|\s*sh/i, // curl ... | sh
        ];
        // 检查命令是否匹配危险模式
        for (const pattern of dangerousPatterns) {
            if (pattern.test(command)) {
                return false;
            }
        }
        return true;
    }
    /**
     * 工厂方法：创建终端执行器适配器
     */
    static create(context) {
        return new TerminalExecutorAdapter(context);
    }
}
exports.TerminalExecutorAdapter = TerminalExecutorAdapter;
//# sourceMappingURL=TerminalExecutorAdapter.js.map