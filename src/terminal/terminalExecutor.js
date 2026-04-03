"use strict";
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
exports.TerminalExecutor = void 0;
var vscode = require("vscode");
var cp = require("child_process");
var os = require("os");
var TerminalExecutor = /** @class */ (function () {
    function TerminalExecutor() {
        this.isExecuting = false;
        this.outputChannel = vscode.window.createOutputChannel('CodeLine Terminal');
    }
    /**
     * 执行终端命令
     */
    TerminalExecutor.prototype.executeCommand = function (command_1) {
        return __awaiter(this, arguments, void 0, function (command, options) {
            var startTime, result, duration, error_1, duration;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isExecuting) {
                            return [2 /*return*/, {
                                    success: false,
                                    output: '',
                                    error: 'Another command is already executing',
                                    command: command,
                                    timestamp: new Date()
                                }];
                        }
                        startTime = Date.now();
                        this.isExecuting = true;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        this.outputChannel.show(true);
                        this.outputChannel.appendLine("$ ".concat(command));
                        this.outputChannel.appendLine('---');
                        return [4 /*yield*/, this.spawnProcess(command, options)];
                    case 2:
                        result = _a.sent();
                        duration = Date.now() - startTime;
                        this.outputChannel.appendLine('---');
                        this.outputChannel.appendLine("Exit code: ".concat(result.exitCode, ", Duration: ").concat(duration, "ms"));
                        return [2 /*return*/, {
                                success: result.exitCode === 0,
                                output: result.output,
                                error: result.error,
                                exitCode: result.exitCode,
                                duration: duration,
                                command: command,
                                timestamp: new Date()
                            }];
                    case 3:
                        error_1 = _a.sent();
                        duration = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: false,
                                output: '',
                                error: error_1.message,
                                command: command,
                                duration: duration,
                                timestamp: new Date()
                            }];
                    case 4:
                        this.isExecuting = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 批量执行命令
     */
    TerminalExecutor.prototype.executeCommands = function (commands_1) {
        return __awaiter(this, arguments, void 0, function (commands, options) {
            var results, _i, commands_2, command, result, error_2;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = [];
                        _i = 0, commands_2 = commands;
                        _a.label = 1;
                    case 1:
                        if (!(_i < commands_2.length)) return [3 /*break*/, 6];
                        command = commands_2[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.executeCommand(command, options)];
                    case 3:
                        result = _a.sent();
                        results.push(result);
                        // 如果命令失败，可以选择停止执行后续命令
                        if (!result.success && options.stopOnError !== false) {
                            return [3 /*break*/, 6];
                        }
                        // 更新工作目录（如果有变化）
                        if (result.success && options.updateCwd && result.output.trim()) {
                            // 可以解析输出更新cwd，这里简化处理
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        results.push({
                            success: false,
                            output: '',
                            error: error_2.message,
                            command: command,
                            timestamp: new Date()
                        });
                        return [3 /*break*/, 6];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * 停止当前执行的命令
     */
    TerminalExecutor.prototype.stopCurrentCommand = function () {
        if (this.currentProcess && !this.currentProcess.killed) {
            this.currentProcess.kill('SIGTERM');
            this.outputChannel.appendLine('\n[Command terminated by user]');
            return true;
        }
        return false;
    };
    /**
     * 检查命令是否安全可执行
     */
    TerminalExecutor.prototype.isSafeCommand = function (command) {
        var dangerousCommands = [
            'rm -rf /',
            'rm -rf /*',
            'dd if=/dev/zero',
            'mkfs',
            'format',
            'chmod -R 777 /',
            'chown -R root:root /',
            ':(){ :|:& };:'
        ];
        var lowerCommand = command.toLowerCase();
        return !dangerousCommands.some(function (dangerous) { return lowerCommand.includes(dangerous); });
    };
    /**
     * 执行命令前请求用户确认（对于高风险命令）
     */
    TerminalExecutor.prototype.requestConfirmation = function (command) {
        return __awaiter(this, void 0, void 0, function () {
            var result_1, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.isSafeCommand(command)) return [3 /*break*/, 2];
                        return [4 /*yield*/, vscode.window.showWarningMessage("This command appears to be dangerous: ".concat(command), { modal: true }, 'Execute Anyway', 'Cancel')];
                    case 1:
                        result_1 = _a.sent();
                        return [2 /*return*/, result_1 === 'Execute Anyway'];
                    case 2: return [4 /*yield*/, vscode.window.showInformationMessage("Execute command: ".concat(command), 'Execute', 'Cancel')];
                    case 3:
                        result = _a.sent();
                        return [2 /*return*/, result === 'Execute'];
                }
            });
        });
    };
    /**
     * 获取系统信息
     */
    TerminalExecutor.prototype.getSystemInfo = function () {
        return {
            platform: os.platform(),
            arch: os.arch(),
            cpus: os.cpus().length,
            memory: "".concat(Math.round(os.totalmem() / 1024 / 1024 / 1024), "GB"),
            shell: process.env.SHELL || (os.platform() === 'win32' ? 'cmd.exe' : 'bash')
        };
    };
    /**
     * 分析命令输出，提取关键信息
     */
    TerminalExecutor.prototype.analyzeOutput = function (output) {
        var lines = output.split('\n');
        var hasErrors = false;
        var errorCount = 0;
        var warningCount = 0;
        var suggestions = [];
        // 简单的错误和警告检测
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            var lowerLine = line.toLowerCase();
            if (lowerLine.includes('error') || lowerLine.includes('failed') || lowerLine.includes('exception')) {
                hasErrors = true;
                errorCount++;
                // 根据错误类型提供建议
                if (lowerLine.includes('permission denied')) {
                    suggestions.push('Try running with sudo or check file permissions');
                }
                else if (lowerLine.includes('command not found')) {
                    suggestions.push('Check if the command is installed and in PATH');
                }
                else if (lowerLine.includes('no such file or directory')) {
                    suggestions.push('Check if the file path exists');
                }
            }
            else if (lowerLine.includes('warning')) {
                warningCount++;
            }
        }
        return {
            hasErrors: hasErrors,
            errorCount: errorCount,
            warningCount: warningCount,
            suggestions: suggestions
        };
    };
    /**
     * 生成命令执行的HTML报告
     */
    TerminalExecutor.prototype.generateHtmlReport = function (result) {
        var _a, _b;
        var analysis = this.analyzeOutput(result.output + (result.error || ''));
        var statusClass = result.success ? 'terminal-success' : 'terminal-error';
        var statusIcon = result.success ? '✅' : '❌';
        return "\n<div class=\"terminal-result ".concat(statusClass, "\">\n  <div class=\"terminal-header\">\n    <h3>").concat(statusIcon, " Terminal Command</h3>\n    <div class=\"terminal-meta\">\n      <span>Exit code: ").concat((_a = result.exitCode) !== null && _a !== void 0 ? _a : 'N/A', "</span>\n      <span>Duration: ").concat((_b = result.duration) !== null && _b !== void 0 ? _b : 0, "ms</span>\n      <span>").concat(result.timestamp.toLocaleTimeString(), "</span>\n    </div>\n  </div>\n  \n  <div class=\"terminal-command\">\n    <code>$ ").concat(result.command, "</code>\n  </div>\n  \n  <div class=\"terminal-output\">\n    <pre>").concat(this.escapeHtml(result.output || '(no output)'), "</pre>\n  </div>\n  \n  ").concat(result.error ? "\n  <div class=\"terminal-error-output\">\n    <h4>Error Output:</h4>\n    <pre>".concat(this.escapeHtml(result.error), "</pre>\n  </div>\n  ") : '', "\n  \n  <div class=\"terminal-analysis\">\n    <h4>Analysis:</h4>\n    <ul>\n      <li>Errors: ").concat(analysis.errorCount, "</li>\n      <li>Warnings: ").concat(analysis.warningCount, "</li>\n      ").concat(analysis.suggestions.length > 0 ? "\n      <li>Suggestions:</li>\n      <ul>\n        ".concat(analysis.suggestions.map(function (s) { return "<li>".concat(s, "</li>"); }).join(''), "\n      </ul>\n      ") : '', "\n    </ul>\n  </div>\n</div>");
    };
    // ===== 私有方法 =====
    TerminalExecutor.prototype.spawnProcess = function (command, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var _a, _b, _c, _d, _e;
                        var cwd = options.cwd || ((_b = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.uri.fsPath) || process.cwd();
                        var env = __assign(__assign({}, process.env), options.env);
                        var shell = (_c = options.shell) !== null && _c !== void 0 ? _c : true;
                        _this.currentProcess = cp.spawn(command, {
                            cwd: cwd,
                            env: env,
                            shell: shell,
                            stdio: ['pipe', 'pipe', 'pipe']
                        });
                        var output = '';
                        var error = '';
                        // 实时输出处理
                        (_d = _this.currentProcess.stdout) === null || _d === void 0 ? void 0 : _d.on('data', function (data) {
                            var text = data.toString();
                            output += text;
                            // 输出到VS Code输出面板
                            _this.outputChannel.append(text);
                            // 实时回调（用于UI更新）
                            if (options.onOutput) {
                                options.onOutput(text);
                            }
                        });
                        (_e = _this.currentProcess.stderr) === null || _e === void 0 ? void 0 : _e.on('data', function (data) {
                            var text = data.toString();
                            error += text;
                            // 错误输出到VS Code输出面板
                            _this.outputChannel.append(text);
                            // 实时回调
                            if (options.onError) {
                                options.onError(text);
                            }
                            else if (options.onOutput) {
                                options.onOutput(text);
                            }
                        });
                        _this.currentProcess.on('close', function (code) {
                            _this.currentProcess = undefined;
                            resolve({
                                output: output.trim(),
                                error: error.trim(),
                                exitCode: code !== null && code !== void 0 ? code : 0
                            });
                        });
                        _this.currentProcess.on('error', function (err) {
                            _this.currentProcess = undefined;
                            reject(err);
                        });
                        // 设置超时
                        if (options.timeout) {
                            setTimeout(function () {
                                if (_this.currentProcess && !_this.currentProcess.killed) {
                                    _this.currentProcess.kill('SIGTERM');
                                    reject(new Error("Command timed out after ".concat(options.timeout, "ms")));
                                }
                            }, options.timeout);
                        }
                    })];
            });
        });
    };
    TerminalExecutor.prototype.escapeHtml = function (text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };
    return TerminalExecutor;
}());
exports.TerminalExecutor = TerminalExecutor;
