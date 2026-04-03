"use strict";
/**
 * 工具插件基类
 * 提供工具插件的默认实现，简化工具插件开发
 * 基于Claude Code CP-20260402-003插件模式
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
exports.ToolPlugin = void 0;
/**
 * 工具插件基类
 */
var ToolPlugin = /** @class */ (function () {
    function ToolPlugin(options) {
        this.tools = new Map();
        this.toolDefinitions = new Map();
        this.context = null;
        this.metadata = options.metadata;
        this.configSchema = options.configSchema;
        this.dependencies = options.dependencies;
        this.config = __assign({ autoRegisterTools: true, toolLoadingStrategy: 'eager', enableToolCaching: true, maxTools: 100 }, options.toolConfig);
    }
    /**
     * 插件激活
     */
    ToolPlugin.prototype.activate = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.context = context;
                        context.outputChannel.appendLine("\uD83D\uDE80 Activating tool plugin: ".concat(this.metadata.name));
                        // 加载工具定义
                        return [4 /*yield*/, this.loadToolDefinitions()];
                    case 1:
                        // 加载工具定义
                        _a.sent();
                        // 创建工具实例
                        return [4 /*yield*/, this.createTools()];
                    case 2:
                        // 创建工具实例
                        _a.sent();
                        context.outputChannel.appendLine("\u2705 Tool plugin activated: ".concat(this.metadata.name, " (").concat(this.tools.size, " tools)"));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 插件停用
     */
    ToolPlugin.prototype.deactivate = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.context) {
                            this.context.outputChannel.appendLine("\u23F8\uFE0F Deactivating tool plugin: ".concat(this.metadata.name));
                        }
                        // 清理工具资源
                        return [4 /*yield*/, this.cleanupTools()];
                    case 1:
                        // 清理工具资源
                        _a.sent();
                        // 清空工具集合
                        this.tools.clear();
                        this.toolDefinitions.clear();
                        if (this.context) {
                            this.context.outputChannel.appendLine("\u2705 Tool plugin deactivated: ".concat(this.metadata.name));
                        }
                        this.context = null;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取插件提供的工具
     */
    ToolPlugin.prototype.getTools = function () {
        return Array.from(this.tools.values());
    };
    /**
     * 获取工具定义
     */
    ToolPlugin.prototype.getToolDefinitions = function () {
        return Array.from(this.toolDefinitions.values());
    };
    /**
     * 注册工具到注册表
     */
    ToolPlugin.prototype.registerTools = function (registry) {
        return __awaiter(this, void 0, void 0, function () {
            var registeredCount, _i, _a, _b, toolId, tool, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.context) {
                            throw new Error('Plugin not activated');
                        }
                        this.context.outputChannel.appendLine("\uD83D\uDCDD Registering tools from ".concat(this.metadata.name, "..."));
                        registeredCount = 0;
                        _i = 0, _a = this.tools.entries();
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 8];
                        _b = _a[_i], toolId = _b[0], tool = _b[1];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 6, , 7]);
                        if (!(typeof registry.registerTool === 'function')) return [3 /*break*/, 4];
                        return [4 /*yield*/, registry.registerTool(tool)];
                    case 3:
                        _c.sent();
                        registeredCount++;
                        return [3 /*break*/, 5];
                    case 4:
                        this.context.outputChannel.appendLine("\u26A0\uFE0F Registry does not have registerTool method");
                        return [3 /*break*/, 8];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_1 = _c.sent();
                        this.context.outputChannel.appendLine("\u274C Failed to register tool ".concat(toolId, ": ").concat(error_1));
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 1];
                    case 8:
                        this.context.outputChannel.appendLine("\u2705 Registered ".concat(registeredCount, " tools from ").concat(this.metadata.name));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 从注册表卸载工具
     */
    ToolPlugin.prototype.unregisterTools = function (registry) {
        return __awaiter(this, void 0, void 0, function () {
            var unregisteredCount, _i, _a, toolId, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.context) {
                            throw new Error('Plugin not activated');
                        }
                        this.context.outputChannel.appendLine("\uD83D\uDDD1\uFE0F Unregistering tools from ".concat(this.metadata.name, "..."));
                        unregisteredCount = 0;
                        _i = 0, _a = this.tools.entries();
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 8];
                        toolId = _a[_i][0];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 6, , 7]);
                        if (!(typeof registry.unregisterTool === 'function')) return [3 /*break*/, 4];
                        return [4 /*yield*/, registry.unregisterTool(toolId)];
                    case 3:
                        _b.sent();
                        unregisteredCount++;
                        return [3 /*break*/, 5];
                    case 4:
                        this.context.outputChannel.appendLine("\u26A0\uFE0F Registry does not have unregisterTool method");
                        return [3 /*break*/, 8];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_2 = _b.sent();
                        this.context.outputChannel.appendLine("\u274C Failed to unregister tool ".concat(toolId, ": ").concat(error_2));
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 1];
                    case 8:
                        this.context.outputChannel.appendLine("\u2705 Unregistered ".concat(unregisteredCount, " tools from ").concat(this.metadata.name));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 插件配置更新
     */
    ToolPlugin.prototype.updateConfig = function (newConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var mergedConfig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mergedConfig = __assign(__assign({}, this.config), newConfig);
                        this.config = mergedConfig;
                        if (!this.context) return [3 /*break*/, 2];
                        this.context.outputChannel.appendLine("\u2699\uFE0F Updated config for plugin: ".concat(this.metadata.name));
                        if (!(newConfig.toolLoadingStrategy !== this.config.toolLoadingStrategy)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.reloadTools()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 插件健康检查
     */
    ToolPlugin.prototype.healthCheck = function () {
        return __awaiter(this, void 0, void 0, function () {
            var toolCount, definitionCount, healthy;
            return __generator(this, function (_a) {
                toolCount = this.tools.size;
                definitionCount = this.toolDefinitions.size;
                healthy = toolCount > 0 && toolCount === definitionCount;
                return [2 /*return*/, {
                        healthy: healthy,
                        message: healthy
                            ? "Plugin ".concat(this.metadata.name, " is healthy (").concat(toolCount, " tools)")
                            : "Plugin ".concat(this.metadata.name, " has issues (tools: ").concat(toolCount, ", definitions: ").concat(definitionCount, ")"),
                        details: {
                            toolCount: toolCount,
                            definitionCount: definitionCount,
                            config: this.config,
                        },
                    }];
            });
        });
    };
    /**
     * 创建工具实例
     * 子类可以实现此方法以自定义工具创建逻辑
     */
    ToolPlugin.prototype.createTools = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, _b, toolId, definition, tool;
            return __generator(this, function (_c) {
                if (!this.context) {
                    throw new Error('Plugin context not available');
                }
                for (_i = 0, _a = this.toolDefinitions.entries(); _i < _a.length; _i++) {
                    _b = _a[_i], toolId = _b[0], definition = _b[1];
                    try {
                        tool = this.createToolFromDefinition(definition);
                        this.tools.set(toolId, tool);
                    }
                    catch (error) {
                        this.context.outputChannel.appendLine("\u274C Failed to create tool ".concat(toolId, ": ").concat(error));
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 清理工具资源
     * 子类可以实现此方法以清理工具资源
     */
    ToolPlugin.prototype.cleanupTools = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    // ========== 受保护方法 ==========
    /**
     * 添加工具定义
     */
    ToolPlugin.prototype.addToolDefinition = function (definition) {
        this.toolDefinitions.set(definition.id, definition);
    };
    /**
     * 添加工具
     */
    ToolPlugin.prototype.addTool = function (tool) {
        this.tools.set(tool.id, tool);
    };
    /**
     * 从定义创建工具
     */
    ToolPlugin.prototype.createToolFromDefinition = function (definition) {
        // 创建工具实例
        var tool = {
            id: definition.id,
            name: definition.name,
            description: definition.description,
            version: definition.version,
            author: definition.author,
            capabilities: definition.capabilities,
            parameterSchema: definition.parameterSchema,
            isEnabled: definition.isEnabled || (function () { return true; }),
            isConcurrencySafe: definition.isConcurrencySafe,
            isReadOnly: definition.isReadOnly,
            isDestructive: definition.isDestructive,
            checkPermissions: definition.checkPermissions || this.defaultCheckPermissions,
            validateParameters: definition.validateParameters || this.defaultValidateParameters,
            execute: definition.execute,
            cancel: definition.cancel,
            getDisplayName: definition.getDisplayName || (function (params) { return definition.name; }),
            getActivityDescription: definition.getActivityDescription || (function (params) { return definition.description; }),
        };
        return tool;
    };
    /**
     * 重新加载工具
     */
    ToolPlugin.prototype.reloadTools = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.context) {
                            return [2 /*return*/];
                        }
                        this.context.outputChannel.appendLine("\uD83D\uDD04 Reloading tools for ".concat(this.metadata.name, "..."));
                        // 清理现有工具
                        return [4 /*yield*/, this.cleanupTools()];
                    case 1:
                        // 清理现有工具
                        _a.sent();
                        this.tools.clear();
                        this.toolDefinitions.clear();
                        // 重新加载
                        return [4 /*yield*/, this.loadToolDefinitions()];
                    case 2:
                        // 重新加载
                        _a.sent();
                        return [4 /*yield*/, this.createTools()];
                    case 3:
                        _a.sent();
                        this.context.outputChannel.appendLine("\u2705 Reloaded ".concat(this.tools.size, " tools for ").concat(this.metadata.name));
                        return [2 /*return*/];
                }
            });
        });
    };
    // ========== 默认工具方法 ==========
    /**
     * 默认权限检查方法
     */
    ToolPlugin.prototype.defaultCheckPermissions = function (params, context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        allowed: true,
                        reason: 'Default permission check passed',
                    }];
            });
        });
    };
    /**
     * 默认参数验证方法
     */
    ToolPlugin.prototype.defaultValidateParameters = function (params, context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        valid: true,
                    }];
            });
        });
    };
    /**
     * 创建默认工具结果
     */
    ToolPlugin.prototype.createToolResult = function (success, options) {
        return {
            success: success,
            output: options.output,
            error: options.error,
            toolId: options.toolId,
            duration: options.duration,
            timestamp: new Date(),
            metadata: options.metadata,
        };
    };
    /**
     * 创建工具进度
     */
    ToolPlugin.prototype.createToolProgress = function (type, progress, message, data) {
        return {
            type: type,
            progress: progress,
            message: message,
            data: data,
        };
    };
    /**
     * 获取插件上下文
     */
    ToolPlugin.prototype.getPluginContext = function () {
        if (!this.context) {
            throw new Error('Plugin context not available');
        }
        return this.context;
    };
    /**
     * 获取全局上下文
     */
    ToolPlugin.prototype.getGlobalContext = function () {
        if (!this.context) {
            throw new Error('Plugin context not available');
        }
        return this.context.globalContext;
    };
    return ToolPlugin;
}());
exports.ToolPlugin = ToolPlugin;
