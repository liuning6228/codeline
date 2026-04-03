"use strict";
/**
 * 终端执行器适配器
 * 将现有的 TerminalExecutor 模块适配到统一的工具接口
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalExecutorAdapter = void 0;
var terminalExecutor_1 = require("../../terminal/terminalExecutor");
var ToolAdapter_1 = require("./ToolAdapter");
/**
 * 终端执行器适配器
 */
var TerminalExecutorAdapter = /** @class */ (function (_super) {
    __extends(TerminalExecutorAdapter, _super);
    function TerminalExecutorAdapter(context) {
        var _this = _super.call(this, 'terminal-executor', 'Terminal Executor', 'Execute shell commands and scripts in the terminal', '1.0.0', 'CodeLine Team', ['terminal', 'shell', 'command', 'execution', 'system'], {
            type: {
                type: 'string',
                description: 'Command execution type (single or batch)',
                required: true,
                validation: function (value) { return ['single', 'batch'].includes(value); },
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
        }) || this;
        _this.isExecuting = false;
        _this.terminalExecutor = new terminalExecutor_1.TerminalExecutor();
        return _this;
    }
    /**
     * 检查权限 - 终端命令需要特别注意
     */
    TerminalExecutorAdapter.prototype.checkPermissions = function (params, context) {
        return __awaiter(this, void 0, void 0, function () {
            var type, command, commands, commandsToCheck, unsafeCommands, _i, commandsToCheck_1, cmd;
            return __generator(this, function (_a) {
                type = params.type, command = params.command, commands = params.commands;
                commandsToCheck = [];
                if (type === 'single' && command) {
                    commandsToCheck = [command];
                }
                else if (type === 'batch' && commands) {
                    commandsToCheck = commands;
                }
                unsafeCommands = [];
                for (_i = 0, commandsToCheck_1 = commandsToCheck; _i < commandsToCheck_1.length; _i++) {
                    cmd = commandsToCheck_1[_i];
                    if (!this.isCommandSafe(cmd)) {
                        unsafeCommands.push(cmd);
                    }
                }
                if (unsafeCommands.length > 0) {
                    return [2 /*return*/, {
                            allowed: false,
                            reason: "Unsafe commands detected: ".concat(unsafeCommands.join(', ')),
                            requiresUserConfirmation: true,
                            confirmationPrompt: "The following commands may be unsafe: ".concat(unsafeCommands.join(', '), ". Are you sure you want to execute them?"),
                        }];
                }
                // 需要用户确认终端命令
                return [2 /*return*/, {
                        allowed: true,
                        requiresUserConfirmation: true,
                        confirmationPrompt: "Are you sure you want to execute ".concat(type === 'single' ? 'a terminal command' : "".concat(commandsToCheck.length, " terminal commands"), "?"),
                    }];
            });
        });
    };
    /**
     * 验证参数
     */
    TerminalExecutorAdapter.prototype.validateParameters = function (params, context) {
        return __awaiter(this, void 0, void 0, function () {
            var type, command, commands, i, cmd, sanitizedParams;
            return __generator(this, function (_a) {
                type = params.type, command = params.command, commands = params.commands;
                // 基本验证
                if (!type) {
                    return [2 /*return*/, {
                            valid: false,
                            error: 'Type is required (single or batch)',
                        }];
                }
                // 类型特定验证
                if (type === 'single') {
                    if (!command || command.trim().length === 0) {
                        return [2 /*return*/, {
                                valid: false,
                                error: 'Command is required for single execution',
                            }];
                    }
                }
                else if (type === 'batch') {
                    if (!commands || !Array.isArray(commands) || commands.length === 0) {
                        return [2 /*return*/, {
                                valid: false,
                                error: 'Commands array is required for batch execution',
                            }];
                    }
                    // 验证每个命令
                    for (i = 0; i < commands.length; i++) {
                        cmd = commands[i];
                        if (!cmd || cmd.trim().length === 0) {
                            return [2 /*return*/, {
                                    valid: false,
                                    error: "Command at index ".concat(i, " is empty"),
                                }];
                        }
                    }
                }
                else {
                    return [2 /*return*/, {
                            valid: false,
                            error: "Invalid type: ".concat(type, ". Must be 'single' or 'batch'"),
                        }];
                }
                sanitizedParams = __assign(__assign({}, params), { cwd: params.cwd || '.', timeout: params.timeout || 30000, shell: params.shell !== undefined ? params.shell : true, stopOnError: params.stopOnError !== undefined ? params.stopOnError : true, processOutputInRealTime: params.processOutputInRealTime !== undefined ? params.processOutputInRealTime : false });
                return [2 /*return*/, {
                        valid: true,
                        sanitizedParams: sanitizedParams,
                    }];
            });
        });
    };
    /**
     * 执行终端命令
     */
    TerminalExecutorAdapter.prototype.execute = function (params, context, onProgress) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, type, cwd, terminalOptions, terminalResults, result, i, result, progressValue, summary, duration, error_1, duration;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        type = params.type, cwd = params.cwd;
                        if (this.isExecuting) {
                            return [2 /*return*/, this.createErrorResult('Another terminal command is already executing', Date.now() - startTime)];
                        }
                        this.isExecuting = true;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, 8, 9]);
                        terminalOptions = {
                            cwd: cwd || context.cwd,
                            env: params.env,
                            timeout: params.timeout,
                            shell: params.shell,
                            stopOnError: params.stopOnError,
                            onOutput: params.processOutputInRealTime ? function (data) {
                                _this.reportProgress(onProgress, {
                                    type: 'terminal_output',
                                    progress: 0.5, // 中间进度
                                    message: 'Command output received',
                                    data: { output: data },
                                });
                            } : undefined,
                        };
                        terminalResults = void 0;
                        // 报告开始进度
                        this.reportProgress(onProgress, {
                            type: 'terminal_start',
                            progress: 0.1,
                            message: 'Starting terminal execution',
                            data: { type: type },
                        });
                        if (!(type === 'single' && params.command)) return [3 /*break*/, 3];
                        this.reportProgress(onProgress, {
                            type: 'terminal_command_executing',
                            progress: 0.3,
                            message: "Executing command: ".concat(params.command),
                            data: { command: params.command },
                        });
                        return [4 /*yield*/, this.terminalExecutor.executeCommand(params.command, terminalOptions)];
                    case 2:
                        result = _a.sent();
                        terminalResults = [result];
                        return [3 /*break*/, 6];
                    case 3:
                        if (!(type === 'batch' && params.commands)) return [3 /*break*/, 5];
                        this.reportProgress(onProgress, {
                            type: 'terminal_batch_start',
                            progress: 0.2,
                            message: "Executing batch of ".concat(params.commands.length, " commands"),
                            data: { commandCount: params.commands.length },
                        });
                        return [4 /*yield*/, this.terminalExecutor.executeCommands(params.commands, terminalOptions)];
                    case 4:
                        // 批量执行
                        terminalResults = _a.sent();
                        // 报告批量进度
                        for (i = 0; i < terminalResults.length; i++) {
                            result = terminalResults[i];
                            progressValue = 0.2 + (0.6 * (i + 1)) / terminalResults.length;
                            this.reportProgress(onProgress, {
                                type: 'terminal_batch_progress',
                                progress: progressValue,
                                message: "Command ".concat(i + 1, "/").concat(params.commands.length, ": ").concat(result.success ? '✓' : '✗'),
                                data: {
                                    index: i,
                                    total: params.commands.length,
                                    success: result.success,
                                    command: params.commands[i],
                                },
                            });
                        }
                        return [3 /*break*/, 6];
                    case 5: throw new Error("Invalid execution parameters: type=".concat(type));
                    case 6:
                        summary = {
                            totalCommands: terminalResults.length,
                            successfulCommands: terminalResults.filter(function (r) { return r.success; }).length,
                            failedCommands: terminalResults.filter(function (r) { return !r.success; }).length,
                            totalDuration: terminalResults.reduce(function (sum, r) { return sum + (r.duration || 0); }, 0),
                        };
                        // 报告完成进度
                        this.reportProgress(onProgress, {
                            type: 'terminal_complete',
                            progress: 1.0,
                            message: "Terminal execution complete: ".concat(summary.successfulCommands, "/").concat(summary.totalCommands, " successful"),
                            data: { summary: summary },
                        });
                        duration = Date.now() - startTime;
                        // 返回结果
                        if (summary.successfulCommands > 0 || summary.failedCommands === 0) {
                            return [2 /*return*/, this.createSuccessResult({
                                    results: terminalResults,
                                    summary: summary,
                                }, duration, {
                                    type: type,
                                    cwd: terminalOptions.cwd,
                                    totalCommands: summary.totalCommands,
                                })];
                        }
                        else {
                            return [2 /*return*/, this.createErrorResult("All ".concat(summary.totalCommands, " commands failed"), duration, {
                                    type: type,
                                    cwd: terminalOptions.cwd,
                                    results: terminalResults,
                                })];
                        }
                        return [3 /*break*/, 9];
                    case 7:
                        error_1 = _a.sent();
                        duration = Date.now() - startTime;
                        this.reportProgress(onProgress, {
                            type: 'terminal_error',
                            progress: 1.0,
                            message: "Terminal execution failed: ".concat(error_1.message),
                        });
                        return [2 /*return*/, this.createErrorResult("Terminal execution failed: ".concat(error_1.message), duration, {
                                type: type,
                                cwd: params.cwd || context.cwd,
                            })];
                    case 8:
                        this.isExecuting = false;
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 取消执行
     */
    TerminalExecutorAdapter.prototype.cancel = function (executionId) {
        return __awaiter(this, void 0, void 0, function () {
            var stopped;
            return __generator(this, function (_a) {
                try {
                    stopped = this.terminalExecutor.stopCurrentCommand();
                    if (stopped) {
                        this.outputChannel.appendLine("Command cancelled by user");
                        return [2 /*return*/, true];
                    }
                    return [2 /*return*/, false];
                }
                catch (error) {
                    this.outputChannel.appendLine("Failed to cancel command: ".concat(error.message));
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 检查是否为破坏性操作
     */
    TerminalExecutorAdapter.prototype.isDestructive = function (context) {
        return true; // 终端命令可能是破坏性的
    };
    /**
     * 获取显示名称
     */
    TerminalExecutorAdapter.prototype.getDisplayName = function (params) {
        var type = (params === null || params === void 0 ? void 0 : params.type) || 'single';
        return type === 'single' ? 'Terminal Command' : 'Terminal Batch';
    };
    /**
     * 获取活动描述
     */
    TerminalExecutorAdapter.prototype.getActivityDescription = function (params) {
        var type = params.type, command = params.command, commands = params.commands;
        if (type === 'single' && command) {
            return "Executing terminal command: ".concat(command);
        }
        else if (type === 'batch' && commands) {
            return "Executing ".concat(commands.length, " terminal commands");
        }
        else {
            return 'Executing terminal commands';
        }
    };
    /**
     * 检查命令安全性
     */
    TerminalExecutorAdapter.prototype.isCommandSafe = function (command) {
        // 危险命令模式
        var dangerousPatterns = [
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
        for (var _i = 0, dangerousPatterns_1 = dangerousPatterns; _i < dangerousPatterns_1.length; _i++) {
            var pattern = dangerousPatterns_1[_i];
            if (pattern.test(command)) {
                return false;
            }
        }
        return true;
    };
    /**
     * 工厂方法：创建终端执行器适配器
     */
    TerminalExecutorAdapter.create = function (context) {
        return new TerminalExecutorAdapter(context);
    };
    return TerminalExecutorAdapter;
}(ToolAdapter_1.BaseToolAdapter));
exports.TerminalExecutorAdapter = TerminalExecutorAdapter;
