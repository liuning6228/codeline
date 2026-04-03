"use strict";
/**
 * 增强任务引擎
 * 集成统一工具系统的 TaskEngine 扩展
 * 基于Claude Code CP-20260402-003插件化工具系统模式
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedTaskEngine = void 0;
var vscode = require("vscode");
var taskEngine_1 = require("../task/taskEngine");
var ToolRegistry_1 = require("./ToolRegistry");
var ToolLoader_1 = require("./ToolLoader");
/**
 * 增强任务引擎
 */
var EnhancedTaskEngine = /** @class */ (function (_super) {
    __extends(EnhancedTaskEngine, _super);
    function EnhancedTaskEngine(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        var _this = this;
        // 检测调用模式：旧版(workspaceRoot, vscodeContext, options) 或 新版(projectAnalyzer, promptEngine, ...)
        var isLegacyCall = typeof arg1 === 'string' && (arg2 === null || arg2 === void 0 ? void 0 : arg2.extensionPath) !== undefined;
        // 准备父类构造函数参数
        var projectAnalyzer;
        var promptEngine;
        var modelAdapter;
        var fileManager;
        var terminalExecutor;
        var browserAutomator;
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
        _this = _super.call(this, projectAnalyzer, promptEngine, modelAdapter, fileManager, terminalExecutor, browserAutomator) || this;
        _this.toolRegistry = null;
        _this.toolLoader = null;
        _this.isToolSystemReady = false;
        _this.toolContext = null;
        _this.vscodeContext = null;
        // 现在可以设置其他属性
        if (isLegacyCall) {
            // 旧版调用: (workspaceRoot: string, vscodeContext: vscode.ExtensionContext, options?: EnhancedTaskEngineOptions)
            var workspaceRoot = arg1;
            var vscodeContext = arg2;
            var options = arg3 || {
                enableToolSystem: true,
                autoLoadTools: true,
                showLoadingProgress: true,
            };
            _this.workspaceRoot = workspaceRoot || process.cwd();
            _this.vscodeContext = vscodeContext;
            // 如果启用工具系统，初始化它
            if (options.enableToolSystem && vscodeContext) {
                _this.initializeToolSystem(vscodeContext, options);
            }
        }
        else {
            // 新版调用: (projectAnalyzer, promptEngine, modelAdapter, fileManager, terminalExecutor, browserAutomator?, workspaceRoot?, vscodeContext?, options?)
            var workspaceRoot = arg7;
            var vscodeContext = arg8;
            var options = arg9 || {
                enableToolSystem: true,
                autoLoadTools: true,
                showLoadingProgress: true,
            };
            _this.workspaceRoot = workspaceRoot || process.cwd();
            if (vscodeContext) {
                _this.vscodeContext = vscodeContext;
            }
            // 如果启用工具系统，初始化它
            if (options.enableToolSystem && vscodeContext) {
                _this.initializeToolSystem(vscodeContext, options);
            }
        }
        return _this;
    }
    /**
     * 初始化工具系统
     */
    EnhancedTaskEngine.prototype.initializeToolSystem = function (vscodeContext, options) {
        return __awaiter(this, void 0, void 0, function () {
            var outputChannel, toolRegistry;
            return __generator(this, function (_a) {
                try {
                    outputChannel = vscode.window.createOutputChannel('CodeLine Tools');
                    // 创建工具上下文
                    this.toolContext = {
                        extensionContext: vscodeContext,
                        workspaceRoot: this.workspaceRoot,
                        cwd: process.cwd(),
                        outputChannel: outputChannel,
                        sessionId: "task-engine-".concat(Date.now()),
                        sharedResources: {},
                    };
                    toolRegistry = new ToolRegistry_1.ToolRegistry();
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
                    vscode.window.showErrorMessage("Failed to initialize tool system: ".concat(error.message));
                    this.isToolSystemReady = false;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 加载工具
     */
    EnhancedTaskEngine.prototype.loadTools = function () {
        return __awaiter(this, void 0, void 0, function () {
            var success, error_1;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!this.toolLoader) {
                            throw new Error('Tool system not initialized');
                        }
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.toolLoader.loadTools()];
                    case 2:
                        success = _d.sent();
                        this.isToolSystemReady = success;
                        if (success) {
                            (_a = this.toolContext) === null || _a === void 0 ? void 0 : _a.outputChannel.appendLine('✅ Tools loaded successfully');
                        }
                        else {
                            (_b = this.toolContext) === null || _b === void 0 ? void 0 : _b.outputChannel.appendLine('⚠️ Tools partially loaded or failed');
                        }
                        return [2 /*return*/, success];
                    case 3:
                        error_1 = _d.sent();
                        (_c = this.toolContext) === null || _c === void 0 ? void 0 : _c.outputChannel.appendLine("\u274C Tool loading failed: ".concat(error_1.message));
                        this.isToolSystemReady = false;
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 增强的任务执行方法（AsyncGenerator版本）
     */
    EnhancedTaskEngine.prototype.executeTask = function (taskDescription, options) {
        return __asyncGenerator(this, arguments, function executeTask_1() {
            var result, startTime, taskId, toolExecutions, toolCalls, executionIndex, _i, toolCalls_1, toolCall, toolStartTime, toolResult, toolDuration, error_2, toolDuration, toolStats, totalDuration, result, error_3, totalDuration;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.isToolSystemReady) return [3 /*break*/, 4];
                        return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(this.executeLegacyTask(taskDescription, options))))];
                    case 1: return [4 /*yield*/, __await.apply(void 0, [_a.sent()])];
                    case 2:
                        result = _a.sent();
                        return [4 /*yield*/, __await(result)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        startTime = Date.now();
                        taskId = "task-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
                        toolExecutions = [];
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 26, , 30]);
                        return [4 /*yield*/, __await({
                                type: 'task_started',
                                taskId: taskId,
                                taskDescription: taskDescription,
                                timestamp: new Date().toISOString(),
                                message: "Starting enhanced task: ".concat(taskDescription),
                            })];
                    case 6: 
                    // 发送任务开始事件
                    return [4 /*yield*/, _a.sent()];
                    case 7:
                        // 发送任务开始事件
                        _a.sent();
                        return [4 /*yield*/, __await(this.analyzeTaskForToolCalls(taskDescription))];
                    case 8:
                        toolCalls = _a.sent();
                        return [4 /*yield*/, __await({
                                type: 'task_analyzed',
                                taskId: taskId,
                                toolCount: toolCalls.length,
                                timestamp: new Date().toISOString(),
                                message: "Task analysis complete: ".concat(toolCalls.length, " tool calls identified"),
                            })];
                    case 9: 
                    // 发送分析完成事件
                    return [4 /*yield*/, _a.sent()];
                    case 10:
                        // 发送分析完成事件
                        _a.sent();
                        executionIndex = 0;
                        _i = 0, toolCalls_1 = toolCalls;
                        _a.label = 11;
                    case 11:
                        if (!(_i < toolCalls_1.length)) return [3 /*break*/, 22];
                        toolCall = toolCalls_1[_i];
                        executionIndex++;
                        return [4 /*yield*/, __await({
                                type: 'tool_execution_started',
                                taskId: taskId,
                                toolId: toolCall.toolId,
                                executionIndex: executionIndex,
                                totalExecutions: toolCalls.length,
                                timestamp: new Date().toISOString(),
                                message: "Executing tool: ".concat(toolCall.toolId),
                            })];
                    case 12: 
                    // 发送工具开始事件
                    return [4 /*yield*/, _a.sent()];
                    case 13:
                        // 发送工具开始事件
                        _a.sent();
                        toolStartTime = Date.now();
                        _a.label = 14;
                    case 14:
                        _a.trys.push([14, 18, , 21]);
                        toolStartTime = Date.now();
                        return [4 /*yield*/, __await(this.executeToolWithRegistry(toolCall.toolId, toolCall.params, executionIndex, toolCalls.length))];
                    case 15:
                        toolResult = _a.sent();
                        toolDuration = Date.now() - toolStartTime;
                        // 记录执行结果
                        toolExecutions.push({
                            toolId: toolCall.toolId,
                            success: toolResult.success,
                            duration: toolDuration,
                            output: toolResult.output,
                            error: toolResult.error,
                        });
                        return [4 /*yield*/, __await({
                                type: 'tool_execution_completed',
                                taskId: taskId,
                                toolId: toolCall.toolId,
                                success: toolResult.success,
                                duration: toolDuration,
                                executionIndex: executionIndex,
                                totalExecutions: toolCalls.length,
                                timestamp: new Date().toISOString(),
                                message: toolResult.success
                                    ? "Tool ".concat(toolCall.toolId, " executed successfully")
                                    : "Tool ".concat(toolCall.toolId, " failed: ").concat(toolResult.error),
                            })];
                    case 16: 
                    // 发送工具完成事件
                    return [4 /*yield*/, _a.sent()];
                    case 17:
                        // 发送工具完成事件
                        _a.sent();
                        return [3 /*break*/, 21];
                    case 18:
                        error_2 = _a.sent();
                        toolDuration = Date.now() - toolStartTime;
                        // 记录失败结果
                        toolExecutions.push({
                            toolId: toolCall.toolId,
                            success: false,
                            duration: toolDuration,
                            error: error_2.message,
                        });
                        return [4 /*yield*/, __await({
                                type: 'tool_execution_failed',
                                taskId: taskId,
                                toolId: toolCall.toolId,
                                error: error_2.message,
                                executionIndex: executionIndex,
                                totalExecutions: toolCalls.length,
                                timestamp: new Date().toISOString(),
                                message: "Tool ".concat(toolCall.toolId, " failed: ").concat(error_2.message),
                            })];
                    case 19: 
                    // 发送工具失败事件
                    return [4 /*yield*/, _a.sent()];
                    case 20:
                        // 发送工具失败事件
                        _a.sent();
                        // 如果任务选项要求错误时停止，则中断执行
                        if (options === null || options === void 0 ? void 0 : options.stopOnError) {
                            throw new Error("Tool execution failed: ".concat(error_2.message));
                        }
                        return [3 /*break*/, 21];
                    case 21:
                        _i++;
                        return [3 /*break*/, 11];
                    case 22:
                        toolStats = {
                            totalTools: toolExecutions.length,
                            successfulTools: toolExecutions.filter(function (t) { return t.success; }).length,
                            failedTools: toolExecutions.filter(function (t) { return !t.success; }).length,
                            totalDuration: toolExecutions.reduce(function (sum, t) { return sum + t.duration; }, 0),
                        };
                        totalDuration = Date.now() - startTime;
                        result = {
                            success: toolStats.failedTools === 0,
                            output: {
                                taskDescription: taskDescription,
                                toolExecutions: toolExecutions,
                                toolStats: toolStats,
                                totalDuration: totalDuration,
                            },
                            duration: totalDuration,
                            taskId: taskId,
                            toolDetails: toolExecutions,
                            toolStats: toolStats,
                        };
                        return [4 /*yield*/, __await({
                                type: 'task_completed',
                                taskId: taskId,
                                success: result.success,
                                duration: totalDuration,
                                toolStats: toolStats,
                                timestamp: new Date().toISOString(),
                                message: "Task ".concat(result.success ? 'completed successfully' : 'completed with errors'),
                            })];
                    case 23: 
                    // 发送任务完成事件
                    return [4 /*yield*/, _a.sent()];
                    case 24:
                        // 发送任务完成事件
                        _a.sent();
                        return [4 /*yield*/, __await(result)];
                    case 25: return [2 /*return*/, _a.sent()];
                    case 26:
                        error_3 = _a.sent();
                        totalDuration = Date.now() - startTime;
                        return [4 /*yield*/, __await({
                                type: 'task_failed',
                                taskId: taskId,
                                error: error_3.message,
                                duration: totalDuration,
                                timestamp: new Date().toISOString(),
                                message: "Task failed: ".concat(error_3.message),
                            })];
                    case 27: 
                    // 发送任务失败事件
                    return [4 /*yield*/, _a.sent()];
                    case 28:
                        // 发送任务失败事件
                        _a.sent();
                        return [4 /*yield*/, __await({
                                success: false,
                                output: error_3.message, // 添加必需的output属性
                                error: error_3.message,
                                duration: totalDuration,
                                taskId: taskId,
                                toolDetails: toolExecutions,
                                toolStats: {
                                    totalTools: toolExecutions.length,
                                    successfulTools: toolExecutions.filter(function (t) { return t.success; }).length,
                                    failedTools: toolExecutions.filter(function (t) { return !t.success; }).length,
                                    totalDuration: toolExecutions.reduce(function (sum, t) { return sum + t.duration; }, 0),
                                },
                            })];
                    case 29: 
                    // 返回失败结果
                    return [2 /*return*/, _a.sent()];
                    case 30: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 使用工具注册表执行工具（带进度报告）
     */
    EnhancedTaskEngine.prototype.executeToolWithRegistry = function (toolId, params, currentIndex, totalCount) {
        return __awaiter(this, void 0, void 0, function () {
            var onProgress;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.toolRegistry || !this.toolContext) {
                            throw new Error('Tool system not ready');
                        }
                        onProgress = function (progress) {
                            var _a;
                            // 可以在这里发送进度事件到UI
                            if ((_a = _this.toolContext) === null || _a === void 0 ? void 0 : _a.outputChannel) {
                                _this.toolContext.outputChannel.appendLine("Tool ".concat(toolId, " progress: ").concat(progress.progress * 100, "% - ").concat(progress.message || ''));
                            }
                        };
                        return [4 /*yield*/, this.toolRegistry.executeTool(toolId, params, this.toolContext, onProgress)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 分析任务描述，提取工具调用
     */
    EnhancedTaskEngine.prototype.analyzeTaskForToolCalls = function (taskDescription) {
        return __awaiter(this, void 0, void 0, function () {
            var toolCalls, descriptionLower, fileNameMatch, fileNameMatch, contentMatch, dirMatch, commandMatch, urlMatch, toolMatch;
            return __generator(this, function (_a) {
                toolCalls = [];
                descriptionLower = taskDescription.toLowerCase();
                // 文件操作检测
                if (descriptionLower.includes('read file') || descriptionLower.includes('open file')) {
                    fileNameMatch = taskDescription.match(/(?:read|open) (?:the )?file[:\s]+"?([^"\n]+)"?/i);
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
                    fileNameMatch = taskDescription.match(/(?:create|write) (?:a )?file[:\s]+"?([^"\n]+)"?/i);
                    if (fileNameMatch) {
                        contentMatch = taskDescription.match(/with content[:\s]+"?([^"\n]+)"?/i);
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
                    dirMatch = taskDescription.match(/(?:list) (?:files in|directory)[:\s]+"?([^"\n]+)"?/i);
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
                    commandMatch = taskDescription.match(/(?:run|execute) (?:the )?command[:\s]+"?([^"\n]+)"?/i);
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
                    urlMatch = taskDescription.match(/(?:open|navigate to) (?:the )?(?:url|website)[:\s]+"?([^"\n]+)"?/i);
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
                    toolMatch = taskDescription.match(/(?:use|execute) (?:mcp )?tool[:\s]+"?([^"\n]+)"?/i);
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
                return [2 /*return*/, toolCalls];
            });
        });
    };
    /**
     * 传统任务执行方法（工具系统未就绪时使用）
     */
    EnhancedTaskEngine.prototype.executeLegacyTask = function (taskDescription, options) {
        return __asyncGenerator(this, arguments, function executeLegacyTask_1() {
            var startTime, taskId, result, duration, enhancedResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        taskId = "legacy-".concat(startTime);
                        return [4 /*yield*/, __await({
                                type: 'task_started',
                                taskId: taskId,
                                taskDescription: taskDescription,
                                timestamp: new Date().toISOString(),
                                message: 'Starting legacy task execution (tool system not ready)',
                            })];
                    case 1: return [4 /*yield*/, _a.sent()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, __await(_super.prototype.startTask.call(this, taskDescription, options))];
                    case 3:
                        result = _a.sent();
                        duration = Date.now() - startTime;
                        return [4 /*yield*/, __await({
                                type: 'task_completed',
                                taskId: taskId,
                                success: result.success,
                                duration: duration,
                                timestamp: new Date().toISOString(),
                                message: 'Legacy task execution completed',
                            })];
                    case 4: return [4 /*yield*/, _a.sent()];
                    case 5:
                        _a.sent();
                        enhancedResult = {
                            success: result.success,
                            output: result.output, // string类型，符合EnhancedTaskResult的string | any类型
                            duration: duration,
                            taskId: taskId,
                            error: result.error,
                            toolDetails: [],
                            toolStats: {
                                totalTools: 0,
                                successfulTools: 0,
                                failedTools: 0,
                                totalDuration: 0,
                            },
                        };
                        return [4 /*yield*/, __await(enhancedResult)];
                    case 6: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 获取工具注册表
     */
    EnhancedTaskEngine.prototype.getToolRegistry = function () {
        return this.toolRegistry;
    };
    /**
     * 获取工具加载状态
     */
    EnhancedTaskEngine.prototype.getToolSystemStatus = function () {
        if (!this.toolRegistry || !this.toolLoader) {
            return {
                isReady: false,
                toolCount: 0,
                loadedTools: 0,
            };
        }
        var registryStatus = this.toolRegistry.getStatus();
        var loaderStatus = this.toolLoader.getLoadingStatus();
        return {
            isReady: loaderStatus.isLoaded && this.isToolSystemReady,
            toolCount: registryStatus.toolCount,
            loadedTools: registryStatus.toolCount,
        };
    };
    /**
     * 获取可用工具列表
     */
    EnhancedTaskEngine.prototype.getAvailableTools = function () {
        if (!this.toolRegistry || !this.toolContext) {
            return [];
        }
        var tools = this.toolRegistry.getAllTools(this.toolContext, {
            enabledOnly: true,
        });
        return tools.map(function (tool) {
            var _a;
            return ({
                id: tool.id,
                name: tool.name,
                description: tool.description,
                category: ((_a = tool.capabilities) === null || _a === void 0 ? void 0 : _a[0]) || 'other',
            });
        });
    };
    /**
     * 清理资源
     */
    EnhancedTaskEngine.prototype.dispose = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.toolLoader) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.toolLoader.close()];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        if ((_a = this.toolContext) === null || _a === void 0 ? void 0 : _a.outputChannel) {
                            this.toolContext.outputChannel.dispose();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return EnhancedTaskEngine;
}(taskEngine_1.TaskEngine));
exports.EnhancedTaskEngine = EnhancedTaskEngine;
