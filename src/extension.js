"use strict";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeLineExtension = void 0;
exports.activate = activate;
exports.deactivate = deactivate;
var vscode = require("vscode");
var enhancedProjectAnalyzer_1 = require("./analyzer/enhancedProjectAnalyzer");
var promptEngine_1 = require("./prompt/promptEngine");
var modelAdapter_1 = require("./models/modelAdapter");
var taskEngine_1 = require("./task/taskEngine");
var EnhancedTaskEngine_1 = require("./task/EnhancedTaskEngine");
var fileManager_1 = require("./file/fileManager");
var terminalExecutor_1 = require("./terminal/terminalExecutor");
var browserAutomator_1 = require("./browser/browserAutomator");
var codeCompletionProvider_1 = require("./completion/codeCompletionProvider");
var sidebarProvider_1 = require("./sidebar/sidebarProvider");
var approvalWorkflow_1 = require("./workflow/approvalWorkflow");
var editorCommands_1 = require("./commands/editorCommands");
var PluginExtension_1 = require("./plugins/PluginExtension");
var CodeLineExtension = /** @class */ (function () {
    function CodeLineExtension(context) {
        this.context = context;
        this.projectAnalyzer = new enhancedProjectAnalyzer_1.EnhancedProjectAnalyzer();
        this.promptEngine = new promptEngine_1.PromptEngine();
        this.modelAdapter = new modelAdapter_1.ModelAdapter();
        this.approvalWorkflow = new approvalWorkflow_1.ApprovalWorkflow();
    }
    CodeLineExtension.getInstance = function (context) {
        if (!CodeLineExtension.instance && context) {
            CodeLineExtension.instance = new CodeLineExtension(context);
        }
        return CodeLineExtension.instance;
    };
    /**
     * 初始化Cline风格的任务引擎（按需创建）
     */
    CodeLineExtension.prototype.ensureTaskEngineInitialized = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workspaceFolders, workspaceRoot;
            return __generator(this, function (_a) {
                if (!this.fileManager || !this.taskEngine || !this.terminalExecutor || !this.browserAutomator) {
                    workspaceFolders = vscode.workspace.workspaceFolders;
                    if (!workspaceFolders || workspaceFolders.length === 0) {
                        throw new Error('No workspace folder open. Please open a project first.');
                    }
                    workspaceRoot = workspaceFolders[0].uri.fsPath;
                    this.fileManager = new fileManager_1.FileManager(workspaceRoot);
                    this.terminalExecutor = new terminalExecutor_1.TerminalExecutor();
                    this.browserAutomator = new browserAutomator_1.BrowserAutomator();
                    this.taskEngine = new taskEngine_1.TaskEngine(this.projectAnalyzer, this.promptEngine, this.modelAdapter, this.fileManager, this.terminalExecutor, this.browserAutomator);
                    // 初始化增强任务引擎
                    this.enhancedTaskEngine = new EnhancedTaskEngine_1.EnhancedTaskEngine(this.projectAnalyzer, this.promptEngine, this.modelAdapter, this.fileManager, this.terminalExecutor, this.browserAutomator);
                }
                return [2 /*return*/, {
                        fileManager: this.fileManager,
                        taskEngine: this.taskEngine,
                        enhancedTaskEngine: this.enhancedTaskEngine,
                        terminalExecutor: this.terminalExecutor,
                        browserAutomator: this.browserAutomator
                    }];
            });
        });
    };
    /**
     * 初始化代码补全提供者（按需创建）
     */
    CodeLineExtension.prototype.ensureCompletionProviderInitialized = function () {
        if (!this.completionProvider) {
            // 从配置读取设置
            var config = vscode.workspace.getConfiguration('codeline');
            this.completionProvider = new codeCompletionProvider_1.CodeCompletionProvider(this.modelAdapter, this.projectAnalyzer, {
                enabled: config.get('enableCodeCompletion', true),
                triggerDelay: config.get('completionTriggerDelay', 300),
                maxItems: config.get('completionMaxItems', 10),
                useCache: config.get('completionCacheEnabled', true),
                cacheTTL: 60000,
                useEnhancedContext: config.get('completionUseEnhancedContext', true),
                showAISuggestions: true,
                minConfidence: config.get('completionMinConfidence', 0.3)
            });
            console.log('CodeLine: Code completion provider initialized');
        }
        return this.completionProvider;
    };
    /**
     * 获取代码补全提供者
     */
    CodeLineExtension.prototype.getCompletionProvider = function () {
        return this.ensureCompletionProviderInitialized();
    };
    /**
     * 初始化插件系统（按需创建）
     */
    CodeLineExtension.prototype.ensurePluginSystemInitialized = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workspaceFolders, workspaceRoot, outputChannel, toolContext;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.pluginExtension) return [3 /*break*/, 2];
                        workspaceFolders = vscode.workspace.workspaceFolders;
                        if (!workspaceFolders || workspaceFolders.length === 0) {
                            throw new Error('No workspace folder open. Please open a project first.');
                        }
                        workspaceRoot = workspaceFolders[0].uri.fsPath;
                        outputChannel = vscode.window.createOutputChannel('CodeLine Tools');
                        toolContext = {
                            extensionContext: this.context,
                            workspaceRoot: workspaceRoot,
                            cwd: workspaceRoot,
                            outputChannel: outputChannel,
                            sessionId: "session-".concat(Date.now()),
                            sharedResources: {}
                        };
                        // 初始化插件扩展
                        this.pluginExtension = PluginExtension_1.PluginExtension.getInstance(this.context, toolContext);
                        return [4 /*yield*/, this.pluginExtension.initialize()];
                    case 1:
                        _a.sent();
                        console.log('CodeLine: Plugin system initialized');
                        _a.label = 2;
                    case 2: return [2 /*return*/, this.pluginExtension];
                }
            });
        });
    };
    /**
     * 获取插件扩展（按需初始化）
     */
    CodeLineExtension.prototype.getPluginExtension = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensurePluginSystemInitialized()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 获取插件系统状态
     */
    CodeLineExtension.prototype.getPluginSystemStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pluginExtension, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.ensurePluginSystemInitialized()];
                    case 1:
                        pluginExtension = _a.sent();
                        return [2 /*return*/, pluginExtension.getState()];
                    case 2:
                        error_1 = _a.sent();
                        return [2 /*return*/, {
                                initialized: false,
                                error: error_1 instanceof Error ? error_1.message : String(error_1)
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 启用/禁用代码补全功能
     */
    CodeLineExtension.prototype.setCompletionEnabled = function (enabled) {
        var provider = this.ensureCompletionProviderInitialized();
        provider.setEnabled(enabled);
        vscode.window.showInformationMessage("CodeLine code completion ".concat(enabled ? 'enabled' : 'disabled'));
    };
    /**
     * 获取侧边栏提供者（按需创建）
     */
    CodeLineExtension.prototype.getSidebarProvider = function () {
        if (!this.sidebarProvider) {
            this.sidebarProvider = new sidebarProvider_1.CodeLineSidebarProvider(this.context, this);
            console.log('CodeLine: Sidebar provider initialized');
        }
        return this.sidebarProvider;
    };
    /**
     * 获取编辑器命令实例（按需创建）
     */
    CodeLineExtension.prototype.getEditorCommands = function () {
        if (!this.editorCommands) {
            this.editorCommands = new editorCommands_1.EditorCommands(this);
            console.log('CodeLine: Editor commands initialized');
        }
        return this.editorCommands;
    };
    /**
     * 显示侧边栏并切换到指定视图
     */
    CodeLineExtension.prototype.showSidebar = function (view) {
        var provider = this.getSidebarProvider();
        provider.show();
        // TODO: 实现视图切换逻辑，需要在sidebar provider中添加切换方法
        console.log("CodeLine: Sidebar shown".concat(view ? " with view: ".concat(view) : ''));
    };
    /**
     * 切换到聊天视图（Cline风格）
     */
    CodeLineExtension.prototype.switchToChatView = function () {
        this.showSidebar('chat');
        // 实际切换逻辑在sidebar provider内部处理
    };
    /**
     * 获取批准工作流实例
     */
    CodeLineExtension.prototype.getApprovalWorkflow = function () {
        if (!this.approvalWorkflow) {
            this.approvalWorkflow = new approvalWorkflow_1.ApprovalWorkflow();
        }
        return this.approvalWorkflow;
    };
    CodeLineExtension.prototype.startChat = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.modelAdapter.isReady()) return [3 /*break*/, 2];
                        return [4 /*yield*/, vscode.window.showErrorMessage('CodeLine is not configured. Please set your API key in settings.', 'Open Settings', 'Cancel')];
                    case 1:
                        result = _a.sent();
                        if (result === 'Open Settings') {
                            vscode.commands.executeCommand('codeline.openSettings');
                        }
                        return [2 /*return*/];
                    case 2:
                        // Cline风格：在侧边栏中打开聊天
                        this.switchToChatView();
                        return [2 /*return*/];
                }
            });
        });
    };
    CodeLineExtension.prototype.executeTask = function (taskDescription) {
        return __awaiter(this, void 0, void 0, function () {
            var result, taskEngine_2, progressOptions, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.modelAdapter.isReady()) return [3 /*break*/, 2];
                        return [4 /*yield*/, vscode.window.showErrorMessage('CodeLine is not configured. Please set your API key in settings.', 'Open Settings', 'Cancel')];
                    case 1:
                        result = _a.sent();
                        if (result === 'Open Settings') {
                            vscode.commands.executeCommand('codeline.openSettings');
                        }
                        return [2 /*return*/];
                    case 2:
                        _a.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, this.ensureTaskEngineInitialized()];
                    case 3:
                        taskEngine_2 = (_a.sent()).taskEngine;
                        progressOptions = {
                            location: vscode.ProgressLocation.Notification,
                            title: "CodeLine Task",
                            cancellable: true
                        };
                        return [4 /*yield*/, vscode.window.withProgress(progressOptions, function (progress, token) { return __awaiter(_this, void 0, void 0, function () {
                                var taskResult, completedSteps, totalSteps, resultMessage;
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            progress.report({ message: "Analyzing task and generating plan..." });
                                            return [4 /*yield*/, taskEngine_2.startTask(taskDescription, {
                                                    autoExecute: true,
                                                    requireApproval: false, // 初始版本自动执行，后续添加批准流程
                                                    promptOptions: {
                                                        includeExamples: true,
                                                        includeConstraints: true,
                                                        includeBestPractices: true
                                                    }
                                                })];
                                        case 1:
                                            taskResult = _a.sent();
                                            if (taskResult.success) {
                                                progress.report({ message: "Task completed successfully!" });
                                                completedSteps = taskResult.steps.filter(function (s) { return s.status === 'completed'; }).length;
                                                totalSteps = taskResult.steps.length;
                                                resultMessage = "Task completed: ".concat(completedSteps, "/").concat(totalSteps, " steps executed");
                                                vscode.window.showInformationMessage(resultMessage, 'View Details').then(function (selection) {
                                                    if (selection === 'View Details') {
                                                        // 在输出面板显示详细结果
                                                        _this.showTaskResults(taskResult);
                                                    }
                                                });
                                                return [2 /*return*/, taskResult];
                                            }
                                            else {
                                                progress.report({ message: "Task failed" });
                                                vscode.window.showErrorMessage("Task failed: ".concat(taskResult.error));
                                                return [2 /*return*/, taskResult];
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 4: return [2 /*return*/, _a.sent()];
                    case 5:
                        error_2 = _a.sent();
                        vscode.window.showErrorMessage("Task execution error: ".concat(error_2.message));
                        throw error_2;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 流式任务执行 - 支持实时事件反馈
     * 基于EnhancedTaskEngine的异步生成器API
     */
    CodeLineExtension.prototype.executeTaskWithStream = function (taskDescription, options) {
        return __awaiter(this, void 0, void 0, function () {
            var result, enhancedTaskEngine_1, progressOptions, error_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.modelAdapter.isReady()) return [3 /*break*/, 2];
                        return [4 /*yield*/, vscode.window.showErrorMessage('CodeLine is not configured. Please set your API key in settings.', 'Open Settings', 'Cancel')];
                    case 1:
                        result = _a.sent();
                        if (result === 'Open Settings') {
                            vscode.commands.executeCommand('codeline.openSettings');
                        }
                        return [2 /*return*/];
                    case 2:
                        _a.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, this.ensureTaskEngineInitialized()];
                    case 3:
                        enhancedTaskEngine_1 = (_a.sent()).enhancedTaskEngine;
                        if (!enhancedTaskEngine_1) {
                            throw new Error('Enhanced task engine not initialized');
                        }
                        progressOptions = {
                            location: vscode.ProgressLocation.Notification,
                            title: "CodeLine Task",
                            cancellable: true
                        };
                        return [4 /*yield*/, vscode.window.withProgress(progressOptions, function (progress, token) { return __awaiter(_this, void 0, void 0, function () {
                                var eventHandler, progressHandler, streamResult, resultMessage;
                                var _this = this;
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            progress.report({ message: "Starting task with real-time updates..." });
                                            eventHandler = (options === null || options === void 0 ? void 0 : options.onEvent) || (function (event) {
                                                // 默认事件处理：记录到控制台
                                                console.log('Task event:', event);
                                            });
                                            progressHandler = (options === null || options === void 0 ? void 0 : options.onProgress) || (function (progressValue, message) {
                                                // 默认进度处理：更新VS Code进度条
                                                progress.report({
                                                    message: "[".concat(progressValue, "%] ").concat(message),
                                                    increment: 0
                                                });
                                            });
                                            return [4 /*yield*/, enhancedTaskEngine_1.executeTaskWithStream(taskDescription, {
                                                    onEvent: eventHandler,
                                                    onProgress: progressHandler,
                                                    configOverrides: {
                                                        autoExecute: true,
                                                        requireApproval: false,
                                                        enableEventStream: (_a = options === null || options === void 0 ? void 0 : options.enableEventStream) !== null && _a !== void 0 ? _a : true,
                                                        cancellable: true
                                                    }
                                                })];
                                        case 1:
                                            streamResult = _b.sent();
                                            // 根据结果显示通知
                                            if (streamResult.status === 'completed') {
                                                progress.report({ message: "Task completed successfully!" });
                                                resultMessage = "Task completed: ".concat(streamResult.steps.completed, "/").concat(streamResult.steps.total, " steps executed");
                                                vscode.window.showInformationMessage(resultMessage, 'View Details').then(function (selection) {
                                                    if (selection === 'View Details' && streamResult.result) {
                                                        _this.showTaskResults(streamResult.result);
                                                    }
                                                });
                                                return [2 /*return*/, streamResult];
                                            }
                                            else if (streamResult.status === 'failed') {
                                                progress.report({ message: "Task failed" });
                                                vscode.window.showErrorMessage("Task failed: ".concat(streamResult.error));
                                                return [2 /*return*/, streamResult];
                                            }
                                            else {
                                                // cancelled
                                                progress.report({ message: "Task cancelled" });
                                                vscode.window.showInformationMessage('Task cancelled by user');
                                                return [2 /*return*/, streamResult];
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 4: return [2 /*return*/, _a.sent()];
                    case 5:
                        error_3 = _a.sent();
                        vscode.window.showErrorMessage("Stream task execution error: ".concat(error_3.message));
                        throw error_3;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 执行文件管理命令
     */
    CodeLineExtension.prototype.executeFileCommand = function (command, data) {
        return __awaiter(this, void 0, void 0, function () {
            var fileManager, _a, listResult, searchOptions, searchResults, stats, selectedUri, path, listResult_1, createResult, renameResult, copyResult, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 20, , 21]);
                        return [4 /*yield*/, this.ensureTaskEngineInitialized()];
                    case 1:
                        fileManager = (_b.sent()).fileManager;
                        _a = command;
                        switch (_a) {
                            case 'listFiles': return [3 /*break*/, 2];
                            case 'searchFiles': return [3 /*break*/, 4];
                            case 'getStats': return [3 /*break*/, 6];
                            case 'browseDirectory': return [3 /*break*/, 8];
                            case 'createFile': return [3 /*break*/, 12];
                            case 'renameFile': return [3 /*break*/, 14];
                            case 'copyFile': return [3 /*break*/, 16];
                        }
                        return [3 /*break*/, 18];
                    case 2: return [4 /*yield*/, fileManager.listDirectory((data === null || data === void 0 ? void 0 : data.path) || '.')];
                    case 3:
                        listResult = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                type: 'listFiles',
                                data: listResult,
                                message: "Listed ".concat(listResult.files.length, " items in ").concat((data === null || data === void 0 ? void 0 : data.path) || 'current directory')
                            }];
                    case 4:
                        searchOptions = (data === null || data === void 0 ? void 0 : data.options) || {
                            pattern: (data === null || data === void 0 ? void 0 : data.pattern) || '',
                            content: (data === null || data === void 0 ? void 0 : data.content) || '',
                            recursive: (data === null || data === void 0 ? void 0 : data.recursive) || true,
                            maxResults: (data === null || data === void 0 ? void 0 : data.maxResults) || 50
                        };
                        return [4 /*yield*/, fileManager.searchFiles(searchOptions)];
                    case 5:
                        searchResults = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                type: 'searchFiles',
                                data: searchResults,
                                message: "Found ".concat(searchResults.length, " files matching search criteria")
                            }];
                    case 6: return [4 /*yield*/, fileManager.getWorkspaceStats()];
                    case 7:
                        stats = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                type: 'getStats',
                                data: stats,
                                message: "Workspace statistics: ".concat(stats.totalFiles, " files, ").concat(stats.totalLines, " lines, ").concat(stats.totalSize, " bytes")
                            }];
                    case 8: return [4 /*yield*/, vscode.window.showOpenDialog({
                            canSelectFiles: false,
                            canSelectFolders: true,
                            canSelectMany: false,
                            openLabel: 'Browse',
                            title: 'Select directory to browse'
                        })];
                    case 9:
                        selectedUri = _b.sent();
                        if (!(selectedUri && selectedUri[0])) return [3 /*break*/, 11];
                        path = vscode.workspace.asRelativePath(selectedUri[0]);
                        return [4 /*yield*/, fileManager.listDirectory(path)];
                    case 10:
                        listResult_1 = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                type: 'browseDirectory',
                                data: listResult_1,
                                path: path,
                                message: "Browsing directory: ".concat(path)
                            }];
                    case 11: return [2 /*return*/, {
                            success: false,
                            type: 'browseDirectory',
                            message: 'No directory selected'
                        }];
                    case 12:
                        if (!(data === null || data === void 0 ? void 0 : data.path) || !(data === null || data === void 0 ? void 0 : data.content)) {
                            return [2 /*return*/, {
                                    success: false,
                                    type: 'createFile',
                                    message: 'Missing path or content for file creation'
                                }];
                        }
                        return [4 /*yield*/, fileManager.createFile(data.path, data.content)];
                    case 13:
                        createResult = _b.sent();
                        return [2 /*return*/, createResult];
                    case 14:
                        if (!(data === null || data === void 0 ? void 0 : data.oldPath) || !(data === null || data === void 0 ? void 0 : data.newPath)) {
                            return [2 /*return*/, {
                                    success: false,
                                    type: 'renameFile',
                                    message: 'Missing oldPath or newPath for rename operation'
                                }];
                        }
                        return [4 /*yield*/, fileManager.renameFile(data.oldPath, data.newPath)];
                    case 15:
                        renameResult = _b.sent();
                        return [2 /*return*/, renameResult];
                    case 16:
                        if (!(data === null || data === void 0 ? void 0 : data.sourcePath) || !(data === null || data === void 0 ? void 0 : data.destPath)) {
                            return [2 /*return*/, {
                                    success: false,
                                    type: 'copyFile',
                                    message: 'Missing sourcePath or destPath for copy operation'
                                }];
                        }
                        return [4 /*yield*/, fileManager.copyFile(data.sourcePath, data.destPath)];
                    case 17:
                        copyResult = _b.sent();
                        return [2 /*return*/, copyResult];
                    case 18: return [2 /*return*/, {
                            success: false,
                            type: 'unknown',
                            message: "Unknown file command: ".concat(command)
                        }];
                    case 19: return [3 /*break*/, 21];
                    case 20:
                        error_4 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                type: command,
                                error: error_4.message,
                                message: "File command failed: ".concat(error_4.message)
                            }];
                    case 21: return [2 /*return*/];
                }
            });
        });
    };
    CodeLineExtension.prototype.analyzeProject = function () {
        return __awaiter(this, void 0, void 0, function () {
            var enhancedContext_1, analysisDepth, context_1, _a, error_5;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        enhancedContext_1 = null;
                        analysisDepth = 'basic';
                        if (!('analyzeEnhancedWorkspace' in this.projectAnalyzer)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.projectAnalyzer.analyzeEnhancedWorkspace()];
                    case 1:
                        enhancedContext_1 = _b.sent();
                        analysisDepth = 'enhanced';
                        _b.label = 2;
                    case 2:
                        _a = enhancedContext_1;
                        if (_a) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.projectAnalyzer.analyzeCurrentWorkspace()];
                    case 3:
                        _a = (_b.sent());
                        _b.label = 4;
                    case 4:
                        context_1 = _a;
                        // 显示基本信息
                        vscode.window.showInformationMessage("Project analyzed (".concat(analysisDepth, "): ").concat(context_1.projectType, ", ").concat(context_1.language, ", ").concat(context_1.files.length, " files"), 'View Details').then(function (selection) {
                            if (selection === 'View Details') {
                                _this.showProjectAnalysis(context_1, enhancedContext_1);
                            }
                        });
                        return [2 /*return*/, context_1];
                    case 5:
                        error_5 = _b.sent();
                        vscode.window.showErrorMessage("Project analysis failed: ".concat(error_5.message));
                        throw error_5;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 显示增强的项目分析报告
     */
    CodeLineExtension.prototype.showEnhancedAnalysis = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_6;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!!('analyzeEnhancedWorkspace' in this.projectAnalyzer)) return [3 /*break*/, 2];
                        vscode.window.showWarningMessage('Enhanced analysis not available in current version');
                        return [4 /*yield*/, this.analyzeProject()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2: 
                    // 显示进度
                    return [4 /*yield*/, vscode.window.withProgress({
                            location: vscode.ProgressLocation.Notification,
                            title: 'Enhanced Project Analysis',
                            cancellable: false
                        }, function (progress) { return __awaiter(_this, void 0, void 0, function () {
                            var enhancedContext;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        progress.report({ message: 'Analyzing project structure...' });
                                        return [4 /*yield*/, this.projectAnalyzer.analyzeEnhancedWorkspace()];
                                    case 1:
                                        enhancedContext = _a.sent();
                                        progress.report({ message: 'Generating analysis report...' });
                                        // 显示详细报告
                                        this.showProjectAnalysis(enhancedContext, enhancedContext);
                                        // 显示完成消息
                                        vscode.window.showInformationMessage("Enhanced analysis completed: ".concat(enhancedContext.files.length, " files analyzed"), 'View Report');
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 3:
                        // 显示进度
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_6 = _a.sent();
                        vscode.window.showErrorMessage("Enhanced analysis failed: ".concat(error_6.message));
                        console.error('Enhanced analysis error:', error_6);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 显示详细的项目分析报告
     */
    CodeLineExtension.prototype.showProjectAnalysis = function (context, enhancedContext) {
        var outputChannel = vscode.window.createOutputChannel('CodeLine Project Analysis');
        outputChannel.show(true);
        outputChannel.appendLine('=== CodeLine Project Analysis Report ===');
        outputChannel.appendLine("Generated: ".concat(new Date().toISOString()));
        outputChannel.appendLine('');
        // 基础项目信息
        outputChannel.appendLine('## Project Overview');
        outputChannel.appendLine("- Type: ".concat(context.projectType));
        outputChannel.appendLine("- Language: ".concat(context.language));
        if (context.framework) {
            outputChannel.appendLine("- Framework: ".concat(context.framework));
        }
        if (context.architecture) {
            outputChannel.appendLine("- Architecture: ".concat(context.architecture));
        }
        outputChannel.appendLine("- Root: ".concat(context.rootPath));
        outputChannel.appendLine("- Files analyzed: ".concat(context.files.length));
        outputChannel.appendLine('');
        // 代码风格
        outputChannel.appendLine('## Code Style');
        outputChannel.appendLine("- Indent: ".concat(context.codeStyle.indent, " spaces"));
        outputChannel.appendLine("- Quote style: ".concat(context.codeStyle.quoteStyle));
        outputChannel.appendLine("- Line ending: ".concat(context.codeStyle.lineEnding));
        outputChannel.appendLine('');
        // 依赖信息
        if (context.dependencies.length > 0) {
            outputChannel.appendLine('## Dependencies');
            outputChannel.appendLine("Found ".concat(context.dependencies.length, " dependencies:"));
            context.dependencies.forEach(function (dep, index) {
                outputChannel.appendLine("  ".concat(index + 1, ". ").concat(dep));
            });
            outputChannel.appendLine('');
        }
        // 增强分析信息
        if (enhancedContext) {
            outputChannel.appendLine('## Enhanced Analysis');
            // 分析元数据
            if (enhancedContext.analysisMetadata) {
                outputChannel.appendLine("- Analysis depth: ".concat(enhancedContext.analysisMetadata.depth));
                outputChannel.appendLine("- Analysis time: ".concat(enhancedContext.analysisMetadata.analysisTime, "ms"));
                outputChannel.appendLine("- Files analyzed: ".concat(enhancedContext.analysisMetadata.filesAnalyzed));
                outputChannel.appendLine('');
            }
            // 代码质量报告
            if (enhancedContext.codeQuality) {
                var quality = enhancedContext.codeQuality;
                outputChannel.appendLine('### Code Quality');
                outputChannel.appendLine("- Overall score: ".concat(quality.overallScore.toFixed(1), "/100"));
                outputChannel.appendLine("- Lines of code: ".concat(quality.metrics.linesOfCode));
                outputChannel.appendLine("- Complexity: ".concat(quality.metrics.complexity.toFixed(2)));
                outputChannel.appendLine("- Maintainability: ".concat(quality.metrics.maintainabilityIndex.toFixed(1)));
                outputChannel.appendLine("- Duplication rate: ".concat((quality.metrics.duplicationRate * 100).toFixed(1), "%"));
                outputChannel.appendLine('');
                if (quality.issues.length > 0) {
                    outputChannel.appendLine("Found ".concat(quality.issues.length, " issues:"));
                    quality.issues.slice(0, 10).forEach(function (issue, index) {
                        outputChannel.appendLine("  ".concat(index + 1, ". [").concat(issue.severity.toUpperCase(), "] ").concat(issue.message, " (").concat(issue.file).concat(issue.line ? ":".concat(issue.line) : '', ")"));
                    });
                    if (quality.issues.length > 10) {
                        outputChannel.appendLine("  ... and ".concat(quality.issues.length - 10, " more issues"));
                    }
                    outputChannel.appendLine('');
                }
                if (quality.suggestions.length > 0) {
                    outputChannel.appendLine("Generated ".concat(quality.suggestions.length, " refactoring suggestions:"));
                    quality.suggestions.slice(0, 5).forEach(function (suggestion, index) {
                        outputChannel.appendLine("  ".concat(index + 1, ". [").concat(suggestion.type, "] ").concat(suggestion.description, " (confidence: ").concat((suggestion.confidence * 100).toFixed(0), "%)"));
                    });
                    if (quality.suggestions.length > 5) {
                        outputChannel.appendLine("  ... and ".concat(quality.suggestions.length - 5, " more suggestions"));
                    }
                    outputChannel.appendLine('');
                }
            }
            // 架构模式
            if (enhancedContext.architecturePatterns && enhancedContext.architecturePatterns.length > 0) {
                outputChannel.appendLine('### Architecture Patterns');
                enhancedContext.architecturePatterns.forEach(function (pattern, index) {
                    outputChannel.appendLine("  ".concat(index + 1, ". ").concat(pattern.name, " (confidence: ").concat((pattern.confidence * 100).toFixed(0), "%)"));
                });
                outputChannel.appendLine('');
            }
            // 依赖关系图
            if (enhancedContext.dependencyGraph) {
                var graph = enhancedContext.dependencyGraph;
                outputChannel.appendLine('### Dependency Graph');
                outputChannel.appendLine("- Nodes: ".concat(graph.nodes.length, " (").concat(graph.nodes.filter(function (n) { return n.type === 'external'; }).length, " external, ").concat(graph.nodes.filter(function (n) { return n.type === 'dev'; }).length, " dev)"));
                outputChannel.appendLine("- Edges: ".concat(graph.edges.length));
                if (graph.circularDependencies.length > 0) {
                    outputChannel.appendLine("- Circular dependencies: ".concat(graph.circularDependencies.length, " found"));
                }
                outputChannel.appendLine('');
            }
            // 模块关系
            if (enhancedContext.moduleRelations && enhancedContext.moduleRelations.length > 0) {
                outputChannel.appendLine("### Module Relations (".concat(enhancedContext.moduleRelations.length, " imports found)"));
                // 显示前10个
                enhancedContext.moduleRelations.slice(0, 10).forEach(function (rel, index) {
                    outputChannel.appendLine("  ".concat(index + 1, ". ").concat(rel.sourceFile, " \u2192 ").concat(rel.targetFile, " (").concat(rel.importType, ")"));
                });
                if (enhancedContext.moduleRelations.length > 10) {
                    outputChannel.appendLine("  ... and ".concat(enhancedContext.moduleRelations.length - 10, " more relations"));
                }
                outputChannel.appendLine('');
            }
            // 相关上下文
            if (enhancedContext.relevantContext) {
                var relevant = enhancedContext.relevantContext;
                outputChannel.appendLine('### Relevant Context');
                if (relevant.focusedFile) {
                    outputChannel.appendLine("- Focused file: ".concat(relevant.focusedFile));
                }
                if (relevant.relatedFiles.length > 0) {
                    outputChannel.appendLine("- Related files: ".concat(relevant.relatedFiles.length, " (top 5 by relevance)"));
                    relevant.relatedFiles.slice(0, 5).forEach(function (file, index) {
                        outputChannel.appendLine("  ".concat(index + 1, ". ").concat(file.path, " (score: ").concat((file.relevanceScore * 100).toFixed(0), "%)"));
                    });
                }
                if (relevant.recentChanges.length > 0) {
                    outputChannel.appendLine("- Recently changed files: ".concat(relevant.recentChanges.slice(0, 3).join(', ')));
                }
                if (relevant.activeComponents.length > 0) {
                    outputChannel.appendLine("- Active components: ".concat(relevant.activeComponents.slice(0, 5).join(', ')));
                }
                outputChannel.appendLine('');
            }
        }
        outputChannel.appendLine('=== End of Report ===');
    };
    /**
     * 在输出面板显示任务结果
     */
    CodeLineExtension.prototype.showTaskResults = function (taskResult) {
        var outputChannel = vscode.window.createOutputChannel('CodeLine Task Results');
        outputChannel.show(true);
        outputChannel.appendLine('=== CodeLine Task Results ===');
        outputChannel.appendLine("Task: ".concat(taskResult.success ? 'SUCCESS' : 'FAILED'));
        outputChannel.appendLine('');
        if (taskResult.error) {
            outputChannel.appendLine("Error: ".concat(taskResult.error));
            outputChannel.appendLine('');
        }
        // 显示步骤摘要
        outputChannel.appendLine('Steps Summary:');
        taskResult.steps.forEach(function (step, index) {
            var statusIcon = step.status === 'completed' ? '✓' :
                step.status === 'failed' ? '✗' :
                    step.status === 'executing' ? '⟳' : '⏸';
            outputChannel.appendLine("  ".concat(index + 1, ". [").concat(statusIcon, "] ").concat(step.type, ": ").concat(step.description));
            if (step.result) {
                outputChannel.appendLine("     Result: ".concat(step.result.substring(0, 200)).concat(step.result.length > 200 ? '...' : ''));
            }
            if (step.error) {
                outputChannel.appendLine("     Error: ".concat(step.error));
            }
        });
        outputChannel.appendLine('');
        outputChannel.appendLine('Detailed Output:');
        outputChannel.appendLine(taskResult.output);
    };
    CodeLineExtension.prototype.getModelAdapter = function () {
        return this.modelAdapter;
    };
    CodeLineExtension.prototype.getModelInfo = function () {
        var config = this.modelAdapter.getConfiguration();
        if (!config.apiKey) {
            return 'Not configured';
        }
        return "".concat(config.model, " (").concat(config.baseUrl, ")");
    };
    CodeLineExtension.prototype.getConfig = function () {
        return this.modelAdapter.getConfiguration();
    };
    CodeLineExtension.prototype.updateConfig = function (newConfig) {
        this.modelAdapter.updateConfiguration(newConfig);
    };
    /**
     * 批准或拒绝文件差异（从UI调用）
     */
    CodeLineExtension.prototype.approveFileDiff = function (diffId, action) {
        return __awaiter(this, void 0, void 0, function () {
            var taskEngine, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureTaskEngineInitialized()];
                    case 1:
                        taskEngine = (_a.sent()).taskEngine;
                        return [4 /*yield*/, taskEngine.approveDiff(diffId, action)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_7 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                message: "Failed to ".concat(action, " file changes: ").concat(error_7.message),
                                error: error_7.message
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return CodeLineExtension;
}());
exports.CodeLineExtension = CodeLineExtension;
function activate(context) {
    var _a;
    var _this = this;
    console.log('CodeLine extension is now active!');
    var codeLine = CodeLineExtension.getInstance(context);
    // Register commands
    var startChatCommand = vscode.commands.registerCommand('codeline.startChat', function () {
        codeLine.startChat();
    });
    var executeTaskCommand = vscode.commands.registerCommand('codeline.executeTask', function () { return __awaiter(_this, void 0, void 0, function () {
        var task;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, vscode.window.showInputBox({
                        prompt: 'Enter the task you want CodeLine to execute',
                        placeHolder: 'e.g., Create a user login API endpoint'
                    })];
                case 1:
                    task = _a.sent();
                    if (!task) return [3 /*break*/, 3];
                    return [4 /*yield*/, codeLine.executeTask(task)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); });
    var analyzeProjectCommand = vscode.commands.registerCommand('codeline.analyzeProject', function () {
        codeLine.analyzeProject();
    });
    var showEnhancedAnalysisCommand = vscode.commands.registerCommand('codeline.showEnhancedAnalysis', function () {
        codeLine.showEnhancedAnalysis();
    });
    var openSettingsCommand = vscode.commands.registerCommand('codeline.openSettings', function () {
        vscode.commands.executeCommand('workbench.action.openSettings', '@ext:codeline');
    });
    // 代码补全相关命令
    var toggleCompletionCommand = vscode.commands.registerCommand('codeline.toggleCodeCompletion', function () { return __awaiter(_this, void 0, void 0, function () {
        var isEnabled;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, vscode.window.showQuickPick(['Enable', 'Disable'], { placeHolder: 'Enable or disable CodeLine code completion?' })];
                case 1:
                    isEnabled = _a.sent();
                    if (isEnabled === 'Enable') {
                        codeLine.setCompletionEnabled(true);
                    }
                    else if (isEnabled === 'Disable') {
                        codeLine.setCompletionEnabled(false);
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    var clearCompletionCacheCommand = vscode.commands.registerCommand('codeline.clearCompletionCache', function () {
        var _a, _b;
        var provider = codeLine.getCompletionProvider();
        (_b = (_a = provider).clearCache) === null || _b === void 0 ? void 0 : _b.call(_a);
        vscode.window.showInformationMessage('CodeLine completion cache cleared');
    });
    // 插件管理命令
    var managePluginsCommand = vscode.commands.registerCommand('codeline.plugins.manage', function () { return __awaiter(_this, void 0, void 0, function () {
        var pluginExtension, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, codeLine.getPluginExtension()];
                case 1:
                    pluginExtension = _a.sent();
                    pluginExtension.showPluginManagementUI();
                    return [3 /*break*/, 3];
                case 2:
                    error_8 = _a.sent();
                    vscode.window.showErrorMessage("Failed to open plugin management: ".concat(error_8));
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    var reloadPluginsCommand = vscode.commands.registerCommand('codeline.plugins.reload', function () { return __awaiter(_this, void 0, void 0, function () {
        var pluginExtension, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, codeLine.getPluginExtension()];
                case 1:
                    pluginExtension = _a.sent();
                    return [4 /*yield*/, pluginExtension.reloadPlugins()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_9 = _a.sent();
                    vscode.window.showErrorMessage("Failed to reload plugins: ".concat(error_9));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    var listPluginsCommand = vscode.commands.registerCommand('codeline.plugins.list', function () { return __awaiter(_this, void 0, void 0, function () {
        var pluginExtension, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, codeLine.getPluginExtension()];
                case 1:
                    pluginExtension = _a.sent();
                    return [4 /*yield*/, pluginExtension.listPlugins()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_10 = _a.sent();
                    vscode.window.showErrorMessage("Failed to list plugins: ".concat(error_10));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    var installPluginCommand = vscode.commands.registerCommand('codeline.plugins.install', function () { return __awaiter(_this, void 0, void 0, function () {
        var pluginExtension, error_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, codeLine.getPluginExtension()];
                case 1:
                    pluginExtension = _a.sent();
                    return [4 /*yield*/, pluginExtension.installPlugin()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_11 = _a.sent();
                    vscode.window.showErrorMessage("Failed to install plugin: ".concat(error_11));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    var pluginsStatusCommand = vscode.commands.registerCommand('codeline.plugins.status', function () { return __awaiter(_this, void 0, void 0, function () {
        var status_1, message, doc, error_12;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, codeLine.getPluginSystemStatus()];
                case 1:
                    status_1 = _a.sent();
                    message = [
                        'CodeLine Plugin System Status:',
                        "- Initialized: ".concat(status_1.initialized ? 'Yes' : 'No'),
                        "- Loaded plugins: ".concat(status_1.loadedPlugins || 0),
                        "- Active plugins: ".concat(status_1.activePlugins || 0),
                        "- Plugin tools: ".concat(status_1.pluginTools || 0),
                        "- MCP servers: ".concat(status_1.pluginMCPServers || 0),
                        status_1.error ? "- Error: ".concat(status_1.error) : ''
                    ].filter(Boolean).join('\n');
                    return [4 /*yield*/, vscode.workspace.openTextDocument({
                            content: message,
                            language: 'markdown'
                        })];
                case 2:
                    doc = _a.sent();
                    return [4 /*yield*/, vscode.window.showTextDocument(doc, { preview: true })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_12 = _a.sent();
                    vscode.window.showErrorMessage("Failed to get plugin status: ".concat(error_12));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    // Cline风格的新命令
    var executeClineTaskCommand = vscode.commands.registerCommand('codeline.executeClineTask', function () { return __awaiter(_this, void 0, void 0, function () {
        var task;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, vscode.window.showInputBox({
                        prompt: 'Enter task for Cline-style execution (with Qoder prompts)',
                        placeHolder: 'e.g., Create a user login API endpoint with Spring Boot',
                        value: 'Create a REST API endpoint for user authentication with proper validation'
                    })];
                case 1:
                    task = _a.sent();
                    if (!task) return [3 /*break*/, 3];
                    return [4 /*yield*/, codeLine.executeTask(task)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); });
    var showFileDiffCommand = vscode.commands.registerCommand('codeline.showFileDiff', function () { return __awaiter(_this, void 0, void 0, function () {
        var pendingItems, fileChanges, changedFiles, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pendingItems = codeLine.getApprovalWorkflow().getPendingItems();
                    fileChanges = pendingItems.filter(function (item) { return item.type === 'file'; });
                    if (fileChanges.length === 0) {
                        vscode.window.showInformationMessage('No pending file changes to review.');
                        return [2 /*return*/];
                    }
                    changedFiles = fileChanges.map(function (item) { return ({
                        relativePath: item.description,
                        absolutePath: item.data.filePath,
                        before: item.data.oldContent || '',
                        after: item.data.newContent || ''
                    }); });
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./diff/diffViewer'); }).then(function (module) {
                            return module.DiffViewer.openMultiFileDiff(changedFiles, {
                                title: 'CodeLine - Review Changes',
                                showApplyButton: true,
                                showRejectButton: true
                            });
                        })];
                case 1:
                    result = _a.sent();
                    // Handle user decision
                    if (result.applied) {
                        vscode.window.showInformationMessage('Changes applied successfully.');
                        // Update approval workflow status
                        fileChanges.forEach(function (item) {
                            codeLine.getApprovalWorkflow().approveItem(item.id, { reason: 'Changes applied via diff view' });
                        });
                    }
                    else if (result.rejected) {
                        vscode.window.showInformationMessage('Changes rejected.');
                        fileChanges.forEach(function (item) {
                            codeLine.getApprovalWorkflow().rejectItem(item.id, { reason: 'Changes rejected via diff view' });
                        });
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    var approveChangesCommand = vscode.commands.registerCommand('codeline.approveChanges', function () { return __awaiter(_this, void 0, void 0, function () {
        var approvalWorkflow, pendingItems, fileChanges, changedFiles_1, result, choice;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    approvalWorkflow = codeLine.getApprovalWorkflow();
                    pendingItems = approvalWorkflow.getPendingItems();
                    if (pendingItems.length === 0) {
                        vscode.window.showInformationMessage('No pending changes to approve.');
                        return [2 /*return*/];
                    }
                    fileChanges = pendingItems.filter(function (item) { return item.type === 'file'; });
                    if (!(fileChanges.length > 0)) return [3 /*break*/, 2];
                    changedFiles_1 = fileChanges.map(function (item) { return ({
                        relativePath: item.description,
                        absolutePath: item.data.filePath,
                        before: item.data.oldContent || '',
                        after: item.data.newContent || ''
                    }); });
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./diff/diffViewer'); }).then(function (module) {
                            return module.DiffViewer.openMultiFileDiff(changedFiles_1, {
                                title: 'CodeLine - Review and Approve Changes',
                                showApplyButton: true,
                                showRejectButton: true
                            });
                        })];
                case 1:
                    result = _a.sent();
                    if (result.applied) {
                        // Approve all pending items, not just files
                        pendingItems.forEach(function (item) {
                            approvalWorkflow.approveItem(item.id, { reason: 'Approved via approve changes command' });
                        });
                        vscode.window.showInformationMessage("Approved ".concat(pendingItems.length, " pending changes."));
                    }
                    else if (result.rejected) {
                        // Reject all pending items
                        pendingItems.forEach(function (item) {
                            approvalWorkflow.rejectItem(item.id, { reason: 'Rejected via approve changes command' });
                        });
                        vscode.window.showInformationMessage("Rejected ".concat(pendingItems.length, " pending changes."));
                    }
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, vscode.window.showInformationMessage("Approve ".concat(pendingItems.length, " pending changes?"), { modal: true }, 'Approve All', 'Reject All', 'Cancel')];
                case 3:
                    choice = _a.sent();
                    if (choice === 'Approve All') {
                        pendingItems.forEach(function (item) {
                            approvalWorkflow.approveItem(item.id, { reason: 'Approved via approve changes command' });
                        });
                        vscode.window.showInformationMessage("Approved ".concat(pendingItems.length, " pending changes."));
                    }
                    else if (choice === 'Reject All') {
                        pendingItems.forEach(function (item) {
                            approvalWorkflow.rejectItem(item.id, { reason: 'Rejected via approve changes command' });
                        });
                        vscode.window.showInformationMessage("Rejected ".concat(pendingItems.length, " pending changes."));
                    }
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); });
    // Register view for activity bar icon - Cline style comprehensive sidebar
    var sidebarProvider = codeLine.getSidebarProvider();
    var chatViewProviderRegistration = vscode.window.registerWebviewViewProvider('codeline.chat', sidebarProvider);
    // Register navigation button commands for Cline-style UI
    var chatButtonCommand = vscode.commands.registerCommand('codeline.chatButtonClicked', function () {
        codeLine.showSidebar('chat');
        console.log('CodeLine: Chat button clicked');
    });
    var tasksButtonCommand = vscode.commands.registerCommand('codeline.tasksButtonClicked', function () {
        codeLine.showSidebar('tasks');
        console.log('CodeLine: Tasks button clicked');
    });
    var settingsButtonCommand = vscode.commands.registerCommand('codeline.settingsButtonClicked', function () {
        codeLine.showSidebar('settings');
        console.log('CodeLine: Settings button clicked');
    });
    var historyButtonCommand = vscode.commands.registerCommand('codeline.historyButtonClicked', function () {
        codeLine.showSidebar('history');
        console.log('CodeLine: History button clicked');
    });
    // Register Cline-style editor commands
    var addToChatCommand = vscode.commands.registerCommand('codeline.addToChat', function () {
        var editorCommands = codeLine.getEditorCommands();
        editorCommands.addToChat();
        console.log('CodeLine: Add to chat command executed');
    });
    var focusChatInputCommand = vscode.commands.registerCommand('codeline.focusChatInput', function () {
        var editorCommands = codeLine.getEditorCommands();
        editorCommands.focusChatInput();
        console.log('CodeLine: Focus chat input command executed');
    });
    var explainCodeCommand = vscode.commands.registerCommand('codeline.explainCode', function () {
        var editorCommands = codeLine.getEditorCommands();
        editorCommands.explainCode();
        console.log('CodeLine: Explain code command executed');
    });
    var improveCodeCommand = vscode.commands.registerCommand('codeline.improveCode', function () {
        var editorCommands = codeLine.getEditorCommands();
        editorCommands.improveCode();
        console.log('CodeLine: Improve code command executed');
    });
    var generateGitCommitMessageCommand = vscode.commands.registerCommand('codeline.generateGitCommitMessage', function () {
        var editorCommands = codeLine.getEditorCommands();
        editorCommands.generateGitCommitMessage();
        console.log('CodeLine: Generate Git commit message command executed');
    });
    // 注册代码补全提供者
    var completionProvider = codeLine.getCompletionProvider();
    var supportedLanguages = [
        'typescript', 'javascript', 'typescriptreact', 'javascriptreact',
        'python', 'java', 'go', 'rust', 'cpp', 'csharp'
    ];
    var completionRegistration = (_a = vscode.languages).registerCompletionItemProvider.apply(_a, __spreadArray([supportedLanguages.map(function (lang) { return ({ language: lang }); }),
        completionProvider,
        '.'], [' ', '(', '[', '{', "'", '"', '`'] // 更多触发字符
    , false));
    context.subscriptions.push(startChatCommand, executeTaskCommand, executeClineTaskCommand, showFileDiffCommand, approveChangesCommand, analyzeProjectCommand, showEnhancedAnalysisCommand, openSettingsCommand, toggleCompletionCommand, clearCompletionCacheCommand, managePluginsCommand, reloadPluginsCommand, listPluginsCommand, installPluginCommand, pluginsStatusCommand, chatViewProviderRegistration, chatButtonCommand, tasksButtonCommand, settingsButtonCommand, historyButtonCommand, addToChatCommand, focusChatInputCommand, explainCodeCommand, improveCodeCommand, generateGitCommitMessageCommand, completionRegistration);
}
function deactivate() { }
