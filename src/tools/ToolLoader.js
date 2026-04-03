"use strict";
/**
 * 工具加载器
 * 负责加载和注册所有工具适配器
 */
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
exports.ToolLoader = void 0;
var vscode = require("vscode");
var ToolRegistry_1 = require("./ToolRegistry");
var ToolInterface_1 = require("./ToolInterface");
var FileManagerAdapter_1 = require("./adapters/FileManagerAdapter");
var TerminalExecutorAdapter_1 = require("./adapters/TerminalExecutorAdapter");
var BrowserAutomatorAdapter_1 = require("./adapters/BrowserAutomatorAdapter");
var MCPManagerAdapter_1 = require("./adapters/MCPManagerAdapter");
/**
 * 工具加载器
 */
var ToolLoader = /** @class */ (function () {
    function ToolLoader(context, registry, config) {
        this.isLoaded = false;
        this.loadingPromise = null;
        this.context = context;
        // 创建或使用现有的工具注册表
        if (registry) {
            this.toolRegistry = registry;
        }
        else {
            var registryConfig = {
                enableLazyLoading: true,
                defaultCategories: Object.values(ToolInterface_1.ToolCategory),
            };
            this.toolRegistry = new ToolRegistry_1.ToolRegistry(registryConfig);
        }
        // 设置配置
        this.config = __assign({ enableFileTools: true, enableTerminalTools: true, enableBrowserTools: true, enableMCPTools: true, autoLoadTools: true, showLoadingProgress: true, loadingTimeout: 30000 }, config);
    }
    /**
     * 加载所有工具
     */
    ToolLoader.prototype.loadTools = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 如果正在加载，返回现有的Promise
                if (this.loadingPromise) {
                    return [2 /*return*/, this.loadingPromise];
                }
                // 如果已经加载，返回true
                if (this.isLoaded) {
                    return [2 /*return*/, true];
                }
                // 创建加载Promise
                this.loadingPromise = this.loadToolsInternal();
                return [2 /*return*/, this.loadingPromise];
            });
        });
    };
    /**
     * 内部加载实现
     */
    ToolLoader.prototype.loadToolsInternal = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, progressDisposable, registryInitialized, adaptersToLoad, loadedCount, failedCount, _i, adaptersToLoad_1, adapter, success, error_1, duration, registryStatus, error_2, duration;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 9, 10, 11]);
                        progressDisposable = void 0;
                        if (this.config.showLoadingProgress) {
                            progressDisposable = this.showLoadingProgress();
                        }
                        // 初始化工具注册表
                        this.context.outputChannel.appendLine('🔧 Initializing tool registry...');
                        return [4 /*yield*/, this.toolRegistry.initialize()];
                    case 2:
                        registryInitialized = _a.sent();
                        if (!registryInitialized) {
                            this.context.outputChannel.appendLine('❌ Failed to initialize tool registry');
                            return [2 /*return*/, false];
                        }
                        // 加载工具适配器
                        this.context.outputChannel.appendLine('📦 Loading tool adapters...');
                        adaptersToLoad = [];
                        // 文件工具
                        if (this.config.enableFileTools) {
                            adaptersToLoad.push({
                                name: 'File Manager',
                                loader: function () { return _this.loadFileTools(); },
                            });
                        }
                        // 终端工具
                        if (this.config.enableTerminalTools) {
                            adaptersToLoad.push({
                                name: 'Terminal Executor',
                                loader: function () { return _this.loadTerminalTools(); },
                            });
                        }
                        // 浏览器工具
                        if (this.config.enableBrowserTools) {
                            adaptersToLoad.push({
                                name: 'Browser Automator',
                                loader: function () { return _this.loadBrowserTools(); },
                            });
                        }
                        // MCP工具
                        if (this.config.enableMCPTools) {
                            adaptersToLoad.push({
                                name: 'MCP Manager',
                                loader: function () { return _this.loadMCPTools(); },
                            });
                        }
                        loadedCount = 0;
                        failedCount = 0;
                        _i = 0, adaptersToLoad_1 = adaptersToLoad;
                        _a.label = 3;
                    case 3:
                        if (!(_i < adaptersToLoad_1.length)) return [3 /*break*/, 8];
                        adapter = adaptersToLoad_1[_i];
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        this.context.outputChannel.appendLine("  Loading ".concat(adapter.name, "..."));
                        return [4 /*yield*/, adapter.loader()];
                    case 5:
                        success = _a.sent();
                        if (success) {
                            loadedCount++;
                            this.context.outputChannel.appendLine("  \u2705 ".concat(adapter.name, " loaded"));
                        }
                        else {
                            failedCount++;
                            this.context.outputChannel.appendLine("  \u26A0\uFE0F ".concat(adapter.name, " partially loaded or failed"));
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        failedCount++;
                        this.context.outputChannel.appendLine("  \u274C ".concat(adapter.name, " failed: ").concat(error_1.message));
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 3];
                    case 8:
                        // 清理进度显示
                        if (progressDisposable) {
                            progressDisposable.dispose();
                        }
                        duration = Date.now() - startTime;
                        this.context.outputChannel.appendLine("\u2705 Tool loading completed: ".concat(loadedCount, " loaded, ").concat(failedCount, " failed (").concat(duration, "ms)"));
                        registryStatus = this.toolRegistry.getStatus();
                        this.context.outputChannel.appendLine("\uD83D\uDCCA Tool Registry: ".concat(registryStatus.toolCount, " tools, ").concat(registryStatus.categoryCount, " categories"));
                        this.isLoaded = true;
                        return [2 /*return*/, true];
                    case 9:
                        error_2 = _a.sent();
                        duration = Date.now() - startTime;
                        this.context.outputChannel.appendLine("\u274C Tool loading failed after ".concat(duration, "ms: ").concat(error_2.message));
                        return [2 /*return*/, false];
                    case 10:
                        this.loadingPromise = null;
                        return [7 /*endfinally*/];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 加载文件工具
     */
    ToolLoader.prototype.loadFileTools = function () {
        return __awaiter(this, void 0, void 0, function () {
            var fileAdapter, registered;
            return __generator(this, function (_a) {
                try {
                    fileAdapter = FileManagerAdapter_1.FileManagerAdapter.create(this.context);
                    registered = this.toolRegistry.registerTool(fileAdapter, [
                        ToolInterface_1.ToolCategory.FILE,
                        ToolInterface_1.ToolCategory.DEVELOPMENT,
                    ]);
                    if (!registered) {
                        this.context.outputChannel.appendLine('  ⚠️ File manager adapter registration failed');
                        return [2 /*return*/, false];
                    }
                    // 注册文件操作的别名
                    this.toolRegistry.registerAlias(fileAdapter.id, 'file');
                    this.toolRegistry.registerAlias(fileAdapter.id, 'files');
                    this.toolRegistry.registerAlias(fileAdapter.id, 'fs');
                    this.toolRegistry.registerAlias(fileAdapter.id, 'file-system');
                    return [2 /*return*/, true];
                }
                catch (error) {
                    this.context.outputChannel.appendLine("  \u274C File tools failed: ".concat(error.message));
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 加载终端工具
     */
    ToolLoader.prototype.loadTerminalTools = function () {
        return __awaiter(this, void 0, void 0, function () {
            var terminalAdapter, registered;
            return __generator(this, function (_a) {
                try {
                    terminalAdapter = TerminalExecutorAdapter_1.TerminalExecutorAdapter.create(this.context);
                    registered = this.toolRegistry.registerTool(terminalAdapter, [
                        ToolInterface_1.ToolCategory.TERMINAL,
                        ToolInterface_1.ToolCategory.DEVELOPMENT,
                        ToolInterface_1.ToolCategory.UTILITY,
                    ]);
                    if (!registered) {
                        this.context.outputChannel.appendLine('  ⚠️ Terminal executor adapter registration failed');
                        return [2 /*return*/, false];
                    }
                    // 注册终端操作的别名
                    this.toolRegistry.registerAlias(terminalAdapter.id, 'terminal');
                    this.toolRegistry.registerAlias(terminalAdapter.id, 'shell');
                    this.toolRegistry.registerAlias(terminalAdapter.id, 'cmd');
                    this.toolRegistry.registerAlias(terminalAdapter.id, 'command');
                    return [2 /*return*/, true];
                }
                catch (error) {
                    this.context.outputChannel.appendLine("  \u274C Terminal tools failed: ".concat(error.message));
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 加载浏览器工具
     */
    ToolLoader.prototype.loadBrowserTools = function () {
        return __awaiter(this, void 0, void 0, function () {
            var browserAdapter, registered;
            return __generator(this, function (_a) {
                try {
                    browserAdapter = BrowserAutomatorAdapter_1.BrowserAutomatorAdapter.create(this.context);
                    registered = this.toolRegistry.registerTool(browserAdapter, [
                        ToolInterface_1.ToolCategory.BROWSER,
                        ToolInterface_1.ToolCategory.DEVELOPMENT,
                        ToolInterface_1.ToolCategory.UTILITY,
                    ]);
                    if (!registered) {
                        this.context.outputChannel.appendLine('  ⚠️ Browser automator adapter registration failed');
                        return [2 /*return*/, false];
                    }
                    // 注册浏览器操作的别名
                    this.toolRegistry.registerAlias(browserAdapter.id, 'browser');
                    this.toolRegistry.registerAlias(browserAdapter.id, 'web');
                    this.toolRegistry.registerAlias(browserAdapter.id, 'automation');
                    this.toolRegistry.registerAlias(browserAdapter.id, 'scraping');
                    return [2 /*return*/, true];
                }
                catch (error) {
                    this.context.outputChannel.appendLine("  \u274C Browser tools failed: ".concat(error.message));
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 加载MCP工具
     */
    ToolLoader.prototype.loadMCPTools = function () {
        return __awaiter(this, void 0, void 0, function () {
            var mcpAdapter, registered;
            return __generator(this, function (_a) {
                try {
                    mcpAdapter = MCPManagerAdapter_1.MCPManagerAdapter.create(this.context);
                    registered = this.toolRegistry.registerTool(mcpAdapter, [
                        ToolInterface_1.ToolCategory.MCP,
                        ToolInterface_1.ToolCategory.AI,
                        ToolInterface_1.ToolCategory.DEVELOPMENT,
                        ToolInterface_1.ToolCategory.UTILITY,
                    ]);
                    if (!registered) {
                        this.context.outputChannel.appendLine('  ⚠️ MCP manager adapter registration failed');
                        return [2 /*return*/, false];
                    }
                    // 注册MCP操作的别名
                    this.toolRegistry.registerAlias(mcpAdapter.id, 'mcp');
                    this.toolRegistry.registerAlias(mcpAdapter.id, 'model-context');
                    this.toolRegistry.registerAlias(mcpAdapter.id, 'tools');
                    this.toolRegistry.registerAlias(mcpAdapter.id, 'protocol');
                    return [2 /*return*/, true];
                }
                catch (error) {
                    this.context.outputChannel.appendLine("  \u274C MCP tools failed: ".concat(error.message));
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 显示加载进度
     */
    ToolLoader.prototype.showLoadingProgress = function () {
        var _this = this;
        var progressOptions = {
            location: vscode.ProgressLocation.Notification,
            title: 'Loading CodeLine Tools',
            cancellable: false,
        };
        return vscode.window.withProgress(progressOptions, function (progress) { return __awaiter(_this, void 0, void 0, function () {
            var interval;
            return __generator(this, function (_a) {
                progress.report({ message: 'Initializing...', increment: 0 });
                interval = setInterval(function () {
                    progress.report({ message: 'Loading tool adapters...' });
                }, 1000);
                // 返回清理函数
                return [2 /*return*/, {
                        dispose: function () { return clearInterval(interval); },
                    }];
            });
        }); });
    };
    /**
     * 重新加载工具
     */
    ToolLoader.prototype.reloadTools = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.isLoaded = false;
                this.loadingPromise = null;
                this.context.outputChannel.appendLine('🔄 Reloading tools...');
                return [2 /*return*/, this.loadTools()];
            });
        });
    };
    /**
     * 获取工具注册表
     */
    ToolLoader.prototype.getToolRegistry = function () {
        return this.toolRegistry;
    };
    /**
     * 获取加载状态
     */
    ToolLoader.prototype.getLoadingStatus = function () {
        return {
            isLoaded: this.isLoaded,
            isLoading: this.loadingPromise !== null,
            registryStatus: this.isLoaded ? this.toolRegistry.getStatus() : undefined,
        };
    };
    /**
     * 获取工具统计信息
     */
    ToolLoader.prototype.getToolStats = function () {
        var registryStatus = this.toolRegistry.getStatus();
        var loadingStatus = this.getLoadingStatus();
        return {
            totalTools: registryStatus.toolCount,
            loadedTools: this.isLoaded ? registryStatus.toolCount : 0,
            failedTools: 0, // 需要跟踪失败的工具
            toolCategories: registryStatus.categoryCount,
        };
    };
    /**
     * 关闭工具加载器
     */
    ToolLoader.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.context.outputChannel.appendLine('🔒 Closing tool loader...');
                        // 关闭工具注册表
                        return [4 /*yield*/, this.toolRegistry.close()];
                    case 1:
                        // 关闭工具注册表
                        _a.sent();
                        this.context.outputChannel.appendLine('✅ Tool loader closed');
                        return [2 /*return*/];
                }
            });
        });
    };
    return ToolLoader;
}());
exports.ToolLoader = ToolLoader;
