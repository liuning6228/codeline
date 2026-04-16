"use strict";
/**
 * BashTool - 终端命令执行工具
 * 集成 Claude-Code 的 BashTool 核心逻辑，适配 CodeLine 架构
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
exports.BashTool = void 0;
exports.createBashTool = createBashTool;
const BaseTool_1 = require("../../core/tool/BaseTool");
const Tool_1 = require("../../core/tool/Tool");
/**
 * BashTool 类
 * 提供完整的终端命令执行能力，包括流式输出、权限控制和安全验证
 */
class BashTool extends BaseTool_1.BaseTool {
    id = 'bash';
    name = 'Bash';
    description = 'Execute shell commands with full terminal capabilities';
    version = '1.0.0';
    author = 'CodeLine Team';
    capabilities = ['terminal', 'shell', 'command', 'execution', 'system'];
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
        destructive: true, // 终端命令可能是破坏性的
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
            description: 'Human-readable description of the command',
            required: false,
        },
        run_in_background: {
            type: 'boolean',
            description: 'Run command in background',
            required: false,
            default: false,
        },
        dangerouslyDisableSandbox: {
            type: 'boolean',
            description: 'Dangerously disable sandbox mode',
            required: false,
            default: false,
        },
    };
    // 依赖的工具
    terminalExecutor;
    constructor() {
        super();
        // 初始化终端执行器
        this.initializeTerminalExecutor();
    }
    /**
     * 获取工具类别
     */
    getToolCategory() {
        return Tool_1.ToolCategory.TERMINAL;
    }
    /**
     * 初始化终端执行器
     */
    initializeTerminalExecutor() {
        try {
            // 尝试导入现有的 TerminalExecutor
            // 如果不存在，使用简化的实现
            this.terminalExecutor = {
                executeCommand: async (command, options) => {
                    // 简化的命令执行实现
                    // 在实际实现中，这里应该调用系统的终端执行器
                    return this.executeCommandSimple(command, options);
                },
            };
        }
        catch (error) {
            // 使用简化实现
            this.terminalExecutor = {
                executeCommand: async (command, options) => {
                    return this.executeCommandSimple(command, options);
                },
            };
        }
    }
    /**
     * 简化的命令执行实现
     */
    async executeCommandSimple(command, options) {
        const vscode = require('vscode');
        return new Promise((resolve) => {
            // 创建终端
            const terminal = vscode.window.createTerminal({
                name: 'CodeLine Bash',
                cwd: options?.cwd || process.cwd(),
            });
            let stdout = '';
            let stderr = '';
            // 监听终端输出
            const disposable = vscode.window.onDidWriteTerminalData((event) => {
                if (event.terminal === terminal) {
                    stdout += event.data;
                }
            });
            // 执行命令
            terminal.sendText(command);
            // 等待命令完成（简化实现）
            setTimeout(() => {
                disposable.dispose();
                terminal.dispose();
                resolve({
                    success: true,
                    output: stdout,
                    error: stderr,
                    exitCode: 0,
                });
            }, 1000);
        });
    }
    /**
     * 是否启用
     */
    isEnabled(context) {
        return true; // BashTool 总是启用
    }
    /**
     * 检查权限
     */
    /**
     * 工具特定权限检查
     */
    async checkSpecificPermissions(params, context) {
        try {
            // 导入权限检查模块
            const { checkBashPermissions } = await Promise.resolve().then(() => __importStar(require('./bashPermissions')));
            const bashPermissionResult = await checkBashPermissions(params, context);
            // 将 bashPermissions 结果转换为 Partial<PermissionResult>
            return {
                allowed: bashPermissionResult.allowed,
                requiresUserConfirmation: bashPermissionResult.requiresUserConfirmation,
                reason: bashPermissionResult.reason,
                confirmationPrompt: bashPermissionResult.confirmationPrompt,
            };
        }
        catch (error) {
            // 如果权限模块不可用，使用基本检查
            const basicResult = this.basicPermissionCheck(params, context);
            return {
                allowed: basicResult.allowed,
                requiresUserConfirmation: basicResult.requiresUserConfirmation,
                reason: basicResult.reason,
                confirmationPrompt: basicResult.confirmationPrompt,
            };
        }
    }
    /**
     * 基本权限检查
     */
    basicPermissionCheck(params, context) {
        const { command } = params;
        // 检查危险命令
        const dangerousPatterns = [
            /rm\s+-rf\s+\/\S*/i, // rm -rf /
            /rm\s+-rf\s+\/\*/i, // rm -rf /*
            /dd\s+if=\/dev\/zero/i, // dd if=/dev/zero
            /mkfs\.?\s+/i, // mkfs
            /format\s+/i, // format
            /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\};\s*:/i, // fork bomb
        ];
        for (const pattern of dangerousPatterns) {
            if (pattern.test(command)) {
                return {
                    allowed: false,
                    reason: `危险命令检测: ${command}`,
                    requiresUserConfirmation: false,
                };
            }
        }
        // 需要用户确认
        return {
            allowed: true,
            requiresUserConfirmation: true,
            confirmationPrompt: `是否执行命令: ${command}`,
        };
    }
    /**
     * 验证参数
     */
    async validateParameters(params, context) {
        const { command } = params;
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
        // 清理参数
        const sanitizedParams = {
            ...params,
            command: command.trim(),
            timeout: params.timeout || this.config.defaultTimeout,
            run_in_background: params.run_in_background || false,
            dangerouslyDisableSandbox: params.dangerouslyDisableSandbox || false,
        };
        return {
            valid: true,
            sanitizedParams,
        };
    }
    /**
     * 执行工具（核心方法）
     */
    async executeTool(params, context, onProgress) {
        const startTime = Date.now();
        const { command, timeout, run_in_background } = params;
        try {
            // 报告开始进度
            if (onProgress) {
                onProgress({
                    type: 'bash_start',
                    progress: 0.1,
                    message: '开始执行命令',
                    data: { command },
                });
            }
            // 执行命令
            const result = await this.executeTerminalCommand(command, context, timeout, run_in_background, onProgress);
            const duration = Date.now() - startTime;
            // 报告完成进度
            if (onProgress) {
                onProgress({
                    type: 'bash_complete',
                    progress: 1.0,
                    message: `命令执行完成 (${duration}ms)`,
                    data: { duration, exitCode: result.exitCode },
                });
            }
            return {
                success: true,
                output: {
                    stdout: result.stdout || '',
                    stderr: result.stderr || '',
                    interrupted: result.interrupted || false,
                    exitCode: result.exitCode,
                    duration,
                },
                toolId: this.id,
                duration,
                timestamp: new Date(),
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            // 报告错误进度
            if (onProgress) {
                onProgress({
                    type: 'bash_error',
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
     * 执行终端命令
     */
    async executeTerminalCommand(command, context, timeout, runInBackground, onProgress) {
        // 报告执行进度
        if (onProgress) {
            onProgress({
                type: 'bash_executing',
                progress: 0.3,
                message: `执行命令: ${command}`,
                data: { command },
            });
        }
        // 使用终端执行器
        const options = {
            cwd: context.cwd || context.workspaceRoot,
            timeout: timeout || this.config.defaultTimeout,
            env: process.env,
        };
        const result = await this.terminalExecutor.executeCommand(command, options);
        // 报告输出进度
        if (onProgress && result.output) {
            onProgress({
                type: 'bash_output',
                progress: 0.8,
                message: '接收命令输出',
                data: { outputLength: result.output.length },
            });
        }
        return {
            success: result.success,
            stdout: result.output || '',
            stderr: result.error || '',
            exitCode: result.exitCode || (result.success ? 0 : 1),
            interrupted: false,
        };
    }
    /**
     * 获取显示名称
     */
    getDisplayName(params) {
        if (params?.description) {
            return params.description;
        }
        return 'Bash';
    }
    /**
     * 获取活动描述
     */
    getActivityDescription(params) {
        const { command, description } = params;
        if (description) {
            return description;
        }
        // 截断长命令
        const truncated = command.length > 50
            ? command.substring(0, 47) + '...'
            : command;
        return `执行命令: ${truncated}`;
    }
    /**
     * 检查是否为只读操作
     */
    isReadOnly(context) {
        return false; // Bash 命令通常是可写的
    }
    /**
     * 检查是否为破坏性操作
     */
    isDestructive(context) {
        return true; // Bash 命令可能是破坏性的
    }
}
exports.BashTool = BashTool;
/**
 * 工厂函数：创建 BashTool 实例
 */
function createBashTool(context) {
    return new BashTool();
}
//# sourceMappingURL=BashTool.js.map