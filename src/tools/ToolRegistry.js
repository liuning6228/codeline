"use strict";
/**
 * 工具注册表
 * 管理所有工具的注册、发现和生命周期
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
exports.ToolRegistry = void 0;
var vscode = require("vscode");
var ToolInterface_1 = require("./ToolInterface");
/**
 * 工具注册表
 */
var ToolRegistry = /** @class */ (function () {
    function ToolRegistry(config) {
        this.tools = new Map();
        this.toolCategories = new Map();
        this.aliases = new Map();
        this.initialized = false;
        this.outputChannel = vscode.window.createOutputChannel('CodeLine Tool Registry');
        this.config = __assign({ enableCaching: true, enableLazyLoading: true, defaultCategories: Object.values(ToolInterface_1.ToolCategory), excludeToolIds: [], includeToolIds: [] }, config);
    }
    /**
     * 初始化工具注册表
     */
    ToolRegistry.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.initialized) {
                    return [2 /*return*/, true];
                }
                try {
                    this.outputChannel.appendLine('🛠️ Initializing Tool Registry...');
                    this.initialized = true;
                    this.outputChannel.appendLine('✅ Tool Registry initialized');
                    return [2 /*return*/, true];
                }
                catch (error) {
                    this.outputChannel.appendLine("\u274C Tool Registry initialization failed: ".concat(error.message));
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 注册工具定义
     */
    ToolRegistry.prototype.registerToolDefinition = function (definition, categories) {
        var _this = this;
        if (categories === void 0) { categories = [ToolInterface_1.ToolCategory.OTHER]; }
        try {
            var tool = {
                id: definition.id,
                name: definition.name,
                description: definition.description,
                version: definition.version,
                author: definition.author,
                capabilities: definition.capabilities,
                parameterSchema: definition.parameterSchema,
                isEnabled: definition.isEnabled || (function (context) { return true; }),
                isConcurrencySafe: definition.isConcurrencySafe || (function (context) { return false; }),
                isReadOnly: definition.isReadOnly || (function (context) { return false; }),
                isDestructive: definition.isDestructive || (function (context) { return false; }),
                checkPermissions: definition.checkPermissions || (function (params, context) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, ({
                                allowed: true,
                                requiresUserConfirmation: false,
                            })];
                    });
                }); }),
                validateParameters: definition.validateParameters || (function (params, context) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, ({
                                valid: true,
                            })];
                    });
                }); }),
                execute: definition.execute,
                cancel: definition.cancel,
                getDisplayName: definition.getDisplayName
                    ? definition.getDisplayName
                    : (function (params) { return definition.name; }),
                getActivityDescription: definition.getActivityDescription
                    ? definition.getActivityDescription
                    : (function (params) { return definition.description; }),
            };
            return this.registerTool(tool, categories);
        }
        catch (error) {
            this.outputChannel.appendLine("\u274C Failed to register tool definition ".concat(definition.id, ": ").concat(error.message));
            return false;
        }
    };
    /**
     * 注册工具实例
     */
    ToolRegistry.prototype.registerTool = function (tool, categories) {
        if (categories === void 0) { categories = [ToolInterface_1.ToolCategory.OTHER]; }
        if (this.tools.has(tool.id)) {
            this.outputChannel.appendLine("\u26A0\uFE0F Tool ".concat(tool.id, " already registered"));
            return false;
        }
        this.tools.set(tool.id, tool);
        for (var _i = 0, categories_1 = categories; _i < categories_1.length; _i++) {
            var category = categories_1[_i];
            var categorySet = this.toolCategories.get(category);
            if (!categorySet) {
                categorySet = new Set();
                this.toolCategories.set(category, categorySet);
            }
            categorySet.add(tool.id);
        }
        this.outputChannel.appendLine("\u2705 Registered tool: ".concat(tool.id, " (").concat(tool.name, ")"));
        return true;
    };
    /**
     * 获取工具
     */
    ToolRegistry.prototype.getTool = function (toolIdOrAlias) {
        if (this.tools.has(toolIdOrAlias)) {
            return this.tools.get(toolIdOrAlias);
        }
        var actualToolId = this.aliases.get(toolIdOrAlias);
        if (actualToolId) {
            return this.tools.get(actualToolId);
        }
        return undefined;
    };
    /**
     * 执行工具
     */
    ToolRegistry.prototype.executeTool = function (toolId, params, context, onProgress) {
        return __awaiter(this, void 0, void 0, function () {
            var tool, permissionResult, validationResult, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tool = this.getTool(toolId);
                        if (!tool) {
                            throw new Error("Tool ".concat(toolId, " not found"));
                        }
                        if (!tool.isEnabled(context)) {
                            throw new Error("Tool ".concat(toolId, " is not enabled in current context"));
                        }
                        return [4 /*yield*/, tool.checkPermissions(params, context)];
                    case 1:
                        permissionResult = _a.sent();
                        if (!permissionResult.allowed) {
                            throw new Error("Permission denied for tool ".concat(toolId, ": ").concat(permissionResult.reason || 'No reason provided'));
                        }
                        return [4 /*yield*/, tool.validateParameters(params, context)];
                    case 2:
                        validationResult = _a.sent();
                        if (!validationResult.valid) {
                            throw new Error("Invalid parameters for tool ".concat(toolId, ": ").concat(validationResult.error || 'Validation failed'));
                        }
                        if (onProgress) {
                            onProgress({ progress: 0, message: 'Starting execution' });
                        }
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, tool.execute(params, context, onProgress)];
                    case 4:
                        result = _a.sent();
                        if (onProgress) {
                            onProgress({ progress: 1, message: 'Execution completed' });
                        }
                        return [2 /*return*/, result];
                    case 5:
                        error_1 = _a.sent();
                        if (onProgress) {
                            onProgress({ progress: 0, message: "Execution failed: ".concat(error_1.message) });
                        }
                        throw error_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取注册表状态
     */
    ToolRegistry.prototype.getStatus = function () {
        return {
            initialized: this.initialized,
            toolCount: this.tools.size,
            categoryCount: this.toolCategories.size,
            aliasCount: this.aliases.size,
        };
    };
    /**
     * 注册工具别名
     */
    ToolRegistry.prototype.registerAlias = function (toolId, alias) {
        if (!this.tools.has(toolId)) {
            this.outputChannel.appendLine("\u26A0\uFE0F Cannot register alias for unknown tool: ".concat(toolId));
            return false;
        }
        if (this.aliases.has(alias)) {
            this.outputChannel.appendLine("\u26A0\uFE0F Alias ".concat(alias, " already registered"));
            return false;
        }
        this.aliases.set(alias, toolId);
        this.outputChannel.appendLine("\uD83C\uDFF7\uFE0F Registered alias: ".concat(alias, " -> ").concat(toolId));
        return true;
    };
    /**
     * 获取所有工具
     */
    ToolRegistry.prototype.getAllTools = function (context, filters) {
        var _a = filters || {}, _b = _a.categories, categories = _b === void 0 ? this.config.defaultCategories : _b, _c = _a.enabledOnly, enabledOnly = _c === void 0 ? true : _c, _d = _a.searchTerm, searchTerm = _d === void 0 ? '' : _d;
        var result = [];
        for (var _i = 0, _e = this.tools.entries(); _i < _e.length; _i++) {
            var _f = _e[_i], toolId = _f[0], tool = _f[1];
            var inCategory = false;
            for (var _g = 0, categories_2 = categories; _g < categories_2.length; _g++) {
                var category = categories_2[_g];
                var categorySet = this.toolCategories.get(category);
                if (categorySet && categorySet.has(toolId)) {
                    inCategory = true;
                    break;
                }
            }
            if (!inCategory && categories.length > 0) {
                continue;
            }
            if (enabledOnly && !tool.isEnabled(context)) {
                continue;
            }
            if (searchTerm && !tool.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !tool.description.toLowerCase().includes(searchTerm.toLowerCase())) {
                continue;
            }
            result.push(tool);
        }
        return result;
    };
    /**
     * 清空注册表
     */
    ToolRegistry.prototype.clear = function () {
        this.tools.clear();
        this.toolCategories.clear();
        this.aliases.clear();
        this.outputChannel.appendLine('🗑️ Tool Registry cleared');
    };
    /**
     * 关闭注册表
     */
    ToolRegistry.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.outputChannel.appendLine('🔒 Tool Registry closed');
                this.outputChannel.dispose();
                this.initialized = false;
                return [2 /*return*/];
            });
        });
    };
    return ToolRegistry;
}());
exports.ToolRegistry = ToolRegistry;
