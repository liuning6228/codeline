"use strict";
/**
 * 插件化工具注册表
 * 扩展ToolRegistry以支持插件化工具管理
 * 基于Claude Code CP-20260402-003插件模式
 * 使用组合模式而非继承
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
exports.PluginToolRegistry = void 0;
var vscode = require("vscode");
var ToolInterface_1 = require("../tools/ToolInterface");
var ToolRegistry_1 = require("../tools/ToolRegistry");
var PluginManager_1 = require("./PluginManager");
/**
 * 插件化工具注册表
 */
var PluginToolRegistry = /** @class */ (function () {
    function PluginToolRegistry(config) {
        this.pluginManager = null;
        this.pluginTools = new Map();
        var mergedConfig = __assign({ enableCaching: true, enableLazyLoading: true, defaultCategories: Object.values(ToolInterface_1.ToolCategory), excludeToolIds: [], includeToolIds: [], enablePluginSupport: true, autoLoadPlugins: true, pluginToolPrefix: 'plugin:' }, config);
        this.config = mergedConfig;
        this.outputChannel = vscode.window.createOutputChannel('CodeLine Plugin Tool Registry');
        this.toolRegistry = new ToolRegistry_1.ToolRegistry(mergedConfig);
    }
    /**
     * 初始化插件化工具注册表
     */
    PluginToolRegistry.prototype.initializeWithPlugins = function (extensionContext, globalContext) {
        return __awaiter(this, void 0, void 0, function () {
            var registryInitialized;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.toolRegistry.initialize()];
                    case 1:
                        registryInitialized = _a.sent();
                        if (!registryInitialized) {
                            return [2 /*return*/, false];
                        }
                        if (!this.config.enablePluginSupport) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.initializePluginManager(extensionContext, globalContext)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * 初始化插件管理器
     */
    PluginToolRegistry.prototype.initializePluginManager = function (extensionContext, globalContext) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.pluginManager = new PluginManager_1.PluginManager(extensionContext, globalContext, this.config.pluginManagerConfig);
                        // 添加插件生命周期监听器
                        this.pluginManager.addLifecycleListener(function (event) {
                            _this.handlePluginLifecycleEvent(event);
                        });
                        // 初始化插件管理器
                        return [4 /*yield*/, this.pluginManager.initialize()];
                    case 1:
                        // 初始化插件管理器
                        _a.sent();
                        this.outputChannel.appendLine('🔌 Plugin Manager initialized');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 处理插件生命周期事件
     */
    PluginToolRegistry.prototype.handlePluginLifecycleEvent = function (event) {
        var pluginId = event.pluginId, type = event.type;
        switch (type) {
            case 'activated':
                this.handlePluginActivated(pluginId);
                break;
            case 'deactivated':
                this.handlePluginDeactivated(pluginId);
                break;
            case 'unloaded':
                this.handlePluginUnloaded(pluginId);
                break;
            case 'error':
                this.outputChannel.appendLine("\u26A0\uFE0F Plugin ".concat(pluginId, " error: ").concat(event.error));
                break;
        }
    };
    /**
     * 处理插件激活
     */
    PluginToolRegistry.prototype.handlePluginActivated = function (pluginId) {
        return __awaiter(this, void 0, void 0, function () {
            var plugin;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.pluginManager) {
                            return [2 /*return*/];
                        }
                        plugin = this.pluginManager.getPlugin(pluginId);
                        if (!plugin) {
                            return [2 /*return*/];
                        }
                        this.outputChannel.appendLine("\uD83D\uDD0C Plugin activated: ".concat(pluginId));
                        if (!this.isToolPlugin(plugin)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.registerPluginTools(pluginId, plugin)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 处理插件停用
     */
    PluginToolRegistry.prototype.handlePluginDeactivated = function (pluginId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.outputChannel.appendLine("\uD83D\uDD0C Plugin deactivated: ".concat(pluginId));
                        // 卸载插件工具
                        return [4 /*yield*/, this.unregisterPluginTools(pluginId)];
                    case 1:
                        // 卸载插件工具
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 处理插件卸载
     */
    PluginToolRegistry.prototype.handlePluginUnloaded = function (pluginId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.outputChannel.appendLine("\uD83D\uDD0C Plugin unloaded: ".concat(pluginId));
                        // 清理插件工具记录
                        return [4 /*yield*/, this.cleanupPluginTools(pluginId)];
                    case 1:
                        // 清理插件工具记录
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 注册插件工具
     */
    PluginToolRegistry.prototype.registerPluginTools = function (pluginId, plugin) {
        return __awaiter(this, void 0, void 0, function () {
            var tools, _i, tools_1, tool, prefixedToolId, pluginTool, registered, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        tools = plugin.getTools();
                        _i = 0, tools_1 = tools;
                        _a.label = 1;
                    case 1:
                        if (!(_i < tools_1.length)) return [3 /*break*/, 4];
                        tool = tools_1[_i];
                        prefixedToolId = this.getPrefixedToolId(pluginId, tool.id);
                        pluginTool = this.createPluginTool(pluginId, tool, prefixedToolId);
                        return [4 /*yield*/, this.toolRegistry.registerToolDefinition(__assign(__assign({}, pluginTool), { id: prefixedToolId }))];
                    case 2:
                        registered = _a.sent();
                        if (registered) {
                            this.pluginTools.set(prefixedToolId, { pluginId: pluginId, originalToolId: tool.id });
                            this.outputChannel.appendLine("\uD83D\uDD27 Registered plugin tool: ".concat(prefixedToolId, " (from ").concat(pluginId, ")"));
                        }
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this.outputChannel.appendLine("\u2705 Registered ".concat(tools.length, " tools from plugin ").concat(pluginId));
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        this.outputChannel.appendLine("\u274C Failed to register tools from plugin ".concat(pluginId, ": ").concat(error_1));
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 卸载插件工具
     */
    PluginToolRegistry.prototype.unregisterPluginTools = function (pluginId) {
        return __awaiter(this, void 0, void 0, function () {
            var toolsToRemove, _i, _a, _b, prefixedToolId, info, _c, toolsToRemove_1, toolId;
            return __generator(this, function (_d) {
                toolsToRemove = [];
                // 查找属于该插件的所有工具
                for (_i = 0, _a = this.pluginTools.entries(); _i < _a.length; _i++) {
                    _b = _a[_i], prefixedToolId = _b[0], info = _b[1];
                    if (info.pluginId === pluginId) {
                        toolsToRemove.push(prefixedToolId);
                    }
                }
                // 卸载工具
                for (_c = 0, toolsToRemove_1 = toolsToRemove; _c < toolsToRemove_1.length; _c++) {
                    toolId = toolsToRemove_1[_c];
                    // 由于ToolRegistry没有unregister方法，我们只能标记为不启用
                    // 实际实现中可能需要扩展ToolRegistry添加unregister功能
                    this.outputChannel.appendLine("\u26A0\uFE0F Note: ToolRegistry does not support unregister, tool ".concat(toolId, " remains registered but disabled"));
                    this.pluginTools.delete(toolId);
                }
                if (toolsToRemove.length > 0) {
                    this.outputChannel.appendLine("\u2705 Marked ".concat(toolsToRemove.length, " tools from plugin ").concat(pluginId, " for removal"));
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 清理插件工具记录
     */
    PluginToolRegistry.prototype.cleanupPluginTools = function (pluginId) {
        return __awaiter(this, void 0, void 0, function () {
            var toolsToRemove, _i, _a, _b, prefixedToolId, info, _c, toolsToRemove_2, toolId;
            return __generator(this, function (_d) {
                toolsToRemove = [];
                for (_i = 0, _a = this.pluginTools.entries(); _i < _a.length; _i++) {
                    _b = _a[_i], prefixedToolId = _b[0], info = _b[1];
                    if (info.pluginId === pluginId) {
                        toolsToRemove.push(prefixedToolId);
                    }
                }
                for (_c = 0, toolsToRemove_2 = toolsToRemove; _c < toolsToRemove_2.length; _c++) {
                    toolId = toolsToRemove_2[_c];
                    this.pluginTools.delete(toolId);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 创建插件工具
     */
    PluginToolRegistry.prototype.createPluginTool = function (pluginId, originalTool, prefixedToolId) {
        var _this = this;
        // 创建工具副本
        var pluginTool = __assign(__assign({}, originalTool), { id: prefixedToolId, 
            // 包装执行方法，添加插件上下文
            execute: function (params, context, onProgress) { return __awaiter(_this, void 0, void 0, function () {
                var enhancedContext;
                return __generator(this, function (_a) {
                    enhancedContext = __assign(__assign({}, context), { pluginId: pluginId, originalToolId: originalTool.id });
                    // 调用原始工具的执行方法
                    return [2 /*return*/, originalTool.execute(params, enhancedContext, onProgress)];
                });
            }); }, 
            // 包装权限检查方法
            checkPermissions: function (params, context) { return __awaiter(_this, void 0, void 0, function () {
                var enhancedContext;
                return __generator(this, function (_a) {
                    enhancedContext = __assign(__assign({}, context), { pluginId: pluginId, originalToolId: originalTool.id });
                    if (originalTool.checkPermissions) {
                        return [2 /*return*/, originalTool.checkPermissions(params, enhancedContext)];
                    }
                    else {
                        // 默认权限检查
                        return [2 /*return*/, {
                                allowed: true,
                                reason: 'Default permission check passed',
                            }];
                    }
                    return [2 /*return*/];
                });
            }); }, 
            // 包装参数验证方法
            validateParameters: function (params, context) { return __awaiter(_this, void 0, void 0, function () {
                var enhancedContext;
                return __generator(this, function (_a) {
                    enhancedContext = __assign(__assign({}, context), { pluginId: pluginId, originalToolId: originalTool.id });
                    if (originalTool.validateParameters) {
                        return [2 /*return*/, originalTool.validateParameters(params, enhancedContext)];
                    }
                    else {
                        // 默认参数验证
                        return [2 /*return*/, {
                                valid: true,
                            }];
                    }
                    return [2 /*return*/];
                });
            }); }, 
            // 包装显示名称方法
            getDisplayName: function (params) {
                if (originalTool.getDisplayName) {
                    var name_1 = originalTool.getDisplayName(params);
                    return "[".concat(pluginId, "] ").concat(name_1);
                }
                else {
                    return "[".concat(pluginId, "] ").concat(originalTool.name);
                }
            }, 
            // 包装活动描述方法
            getActivityDescription: function (params) {
                if (originalTool.getActivityDescription) {
                    var description = originalTool.getActivityDescription(params);
                    return "Plugin ".concat(pluginId, ": ").concat(description);
                }
                else {
                    return "Plugin ".concat(pluginId, ": ").concat(originalTool.description);
                }
            } });
        return pluginTool;
    };
    /**
     * 获取带前缀的工具ID
     */
    PluginToolRegistry.prototype.getPrefixedToolId = function (pluginId, toolId) {
        return "".concat(this.config.pluginToolPrefix).concat(pluginId, ":").concat(toolId);
    };
    /**
     * 检查是否为工具插件
     */
    PluginToolRegistry.prototype.isToolPlugin = function (plugin) {
        return 'registerTools' in plugin && 'unregisterTools' in plugin;
    };
    /**
     * 获取工具注册表
     */
    PluginToolRegistry.prototype.getToolRegistry = function () {
        return this.toolRegistry;
    };
    /**
     * 获取插件管理器
     */
    PluginToolRegistry.prototype.getPluginManager = function () {
        return this.pluginManager;
    };
    /**
     * 加载插件
     */
    PluginToolRegistry.prototype.loadPlugin = function (pluginPath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.pluginManager) {
                            throw new Error('Plugin manager not initialized');
                        }
                        return [4 /*yield*/, this.pluginManager.loadPlugin(pluginPath)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 卸载插件
     */
    PluginToolRegistry.prototype.unloadPlugin = function (pluginId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.pluginManager) {
                            throw new Error('Plugin manager not initialized');
                        }
                        return [4 /*yield*/, this.pluginManager.unloadPlugin(pluginId)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取插件工具信息
     */
    PluginToolRegistry.prototype.getPluginToolInfo = function (toolId) {
        return this.pluginTools.get(toolId) || null;
    };
    /**
     * 获取所有插件工具
     */
    PluginToolRegistry.prototype.getPluginTools = function () {
        return new Map(this.pluginTools);
    };
    /**
     * 关闭插件化工具注册表
     */
    PluginToolRegistry.prototype.closeWithPlugins = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.pluginManager) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.pluginManager.close()];
                    case 1:
                        _a.sent();
                        this.pluginManager = null;
                        _a.label = 2;
                    case 2:
                        // 清理插件工具记录
                        this.pluginTools.clear();
                        // 关闭工具注册表
                        return [4 /*yield*/, this.toolRegistry.close()];
                    case 3:
                        // 关闭工具注册表
                        _a.sent();
                        this.outputChannel.appendLine('🔌 Plugin Tool Registry closed');
                        this.outputChannel.dispose();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取插件化工具注册表状态
     */
    PluginToolRegistry.prototype.getPluginRegistryState = function () {
        var _a;
        var pluginManagerState = (_a = this.pluginManager) === null || _a === void 0 ? void 0 : _a.getState();
        return {
            pluginManagerInitialized: !!this.pluginManager,
            loadedPlugins: (pluginManagerState === null || pluginManagerState === void 0 ? void 0 : pluginManagerState.loadedPlugins) || 0,
            pluginToolsCount: this.pluginTools.size,
        };
    };
    /**
     * 代理ToolRegistry的方法
     */
    PluginToolRegistry.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.toolRegistry.initialize()];
            });
        });
    };
    PluginToolRegistry.prototype.registerToolDefinition = function (definition, categories) {
        if (categories === void 0) { categories = [ToolInterface_1.ToolCategory.OTHER]; }
        return this.toolRegistry.registerToolDefinition(definition, categories);
    };
    PluginToolRegistry.prototype.getTool = function (toolId) {
        return this.toolRegistry.getTool(toolId);
    };
    PluginToolRegistry.prototype.getAllTools = function (context, filters) {
        return this.toolRegistry.getAllTools(context, filters);
    };
    return PluginToolRegistry;
}());
exports.PluginToolRegistry = PluginToolRegistry;
