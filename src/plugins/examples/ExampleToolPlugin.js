"use strict";
/**
 * 示例工具插件
 * 展示如何创建和使用工具插件
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
exports.ExampleToolPlugin = void 0;
/**
 * 示例工具插件
 */
var ExampleToolPlugin = /** @class */ (function () {
    function ExampleToolPlugin() {
        this.tools = new Map();
        this.context = null;
        this.metadata = {
            id: 'example-tool-plugin',
            name: '示例工具插件',
            description: '一个展示工具插件功能的示例插件',
            version: '1.0.0',
            author: 'CodeLine Team',
            categories: ['examples', 'tools'],
            keywords: ['example', 'tool', 'demo'],
        };
        this.configSchema = {
            fields: {
                enableGreetingTool: {
                    type: 'boolean',
                    description: '是否启用问候工具',
                    default: true,
                },
                enableCalculatorTool: {
                    type: 'boolean',
                    description: '是否启用计算工具',
                    default: true,
                },
                defaultGreeting: {
                    type: 'string',
                    description: '默认问候语',
                    default: 'Hello from Example Tool Plugin!',
                },
                enableDebugLogs: {
                    type: 'boolean',
                    description: '是否启用调试日志',
                    default: false,
                },
            },
        };
        this.config = {
            enableGreetingTool: true,
            enableCalculatorTool: true,
            defaultGreeting: 'Hello from Example Tool Plugin!',
            enableDebugLogs: false,
        };
    }
    /**
     * 插件激活
     */
    ExampleToolPlugin.prototype.activate = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.context = context;
                        // 合并配置
                        this.config = __assign(__assign({}, this.config), context.config);
                        context.outputChannel.show(true);
                        context.outputChannel.appendLine('🚀 Activating Example Tool Plugin...');
                        // 创建工具
                        return [4 /*yield*/, this.createTools()];
                    case 1:
                        // 创建工具
                        _a.sent();
                        context.outputChannel.appendLine("\u2705 Example Tool Plugin activated with ".concat(this.tools.size, " tools"));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 插件停用
     */
    ExampleToolPlugin.prototype.deactivate = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.context) {
                    this.context.outputChannel.appendLine('⏸️ Deactivating Example Tool Plugin...');
                }
                // 清理工具资源
                this.tools.clear();
                if (this.context) {
                    this.context.outputChannel.appendLine('✅ Example Tool Plugin deactivated');
                }
                this.context = null;
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取工具
     */
    ExampleToolPlugin.prototype.getTools = function () {
        return Array.from(this.tools.values());
    };
    /**
     * 获取工具定义
     */
    ExampleToolPlugin.prototype.getToolDefinitions = function () {
        // 返回工具定义（用于动态注册）
        return [
            {
                id: 'example-greeting',
                name: '示例问候工具',
                description: '根据配置返回问候语',
                version: '1.0.0',
                author: 'CodeLine Team',
                capabilities: ['greeting', 'utility'],
                parameterSchema: {
                    name: {
                        type: 'string',
                        description: '问候的对象名称',
                        required: false,
                    },
                    language: {
                        type: 'string',
                        description: '问候语语言',
                        required: false,
                        options: ['en', 'zh', 'ja', 'ko'],
                    },
                },
            },
            {
                id: 'example-calculator',
                name: '示例计算工具',
                description: '执行简单的数学计算',
                version: '1.0.0',
                author: 'CodeLine Team',
                capabilities: ['calculation', 'utility'],
                parameterSchema: {
                    operation: {
                        type: 'string',
                        description: '计算操作',
                        required: true,
                        options: ['add', 'subtract', 'multiply', 'divide'],
                    },
                    a: {
                        type: 'number',
                        description: '第一个操作数',
                        required: true,
                    },
                    b: {
                        type: 'number',
                        description: '第二个操作数',
                        required: true,
                    },
                },
            },
        ];
    };
    /**
     * 注册工具
     */
    ExampleToolPlugin.prototype.registerTools = function (registry) {
        return __awaiter(this, void 0, void 0, function () {
            var registeredCount, _i, _a, tool, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.context) {
                            throw new Error('Plugin not activated');
                        }
                        this.context.outputChannel.appendLine('📝 Registering example tools...');
                        registeredCount = 0;
                        _i = 0, _a = this.getTools();
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        tool = _a[_i];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        if (!(typeof registry.registerTool === 'function')) return [3 /*break*/, 4];
                        return [4 /*yield*/, registry.registerTool(tool)];
                    case 3:
                        _b.sent();
                        registeredCount++;
                        _b.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_1 = _b.sent();
                        this.context.outputChannel.appendLine("\u274C Failed to register tool ".concat(tool.id, ": ").concat(error_1));
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7:
                        this.context.outputChannel.appendLine("\u2705 Registered ".concat(registeredCount, " example tools"));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 卸载工具
     */
    ExampleToolPlugin.prototype.unregisterTools = function (registry) {
        return __awaiter(this, void 0, void 0, function () {
            var unregisteredCount, _i, _a, tool, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.context) {
                            throw new Error('Plugin not activated');
                        }
                        this.context.outputChannel.appendLine('🗑️ Unregistering example tools...');
                        unregisteredCount = 0;
                        _i = 0, _a = this.getTools();
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        tool = _a[_i];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        if (!(typeof registry.unregisterTool === 'function')) return [3 /*break*/, 4];
                        return [4 /*yield*/, registry.unregisterTool(tool.id)];
                    case 3:
                        _b.sent();
                        unregisteredCount++;
                        _b.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_2 = _b.sent();
                        this.context.outputChannel.appendLine("\u274C Failed to unregister tool ".concat(tool.id, ": ").concat(error_2));
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7:
                        this.context.outputChannel.appendLine("\u2705 Unregistered ".concat(unregisteredCount, " example tools"));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 配置更新
     */
    ExampleToolPlugin.prototype.updateConfig = function (newConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var oldConfig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        oldConfig = this.config;
                        this.config = __assign(__assign({}, oldConfig), newConfig);
                        if (!this.context) return [3 /*break*/, 2];
                        this.context.outputChannel.appendLine('⚙️ Example Tool Plugin config updated');
                        if (!(newConfig.enableGreetingTool !== oldConfig.enableGreetingTool ||
                            newConfig.enableCalculatorTool !== oldConfig.enableCalculatorTool)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.recreateTools()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 健康检查
     */
    ExampleToolPlugin.prototype.healthCheck = function () {
        return __awaiter(this, void 0, void 0, function () {
            var toolCount, expectedTools, healthy;
            return __generator(this, function (_a) {
                toolCount = this.tools.size;
                expectedTools = (this.config.enableGreetingTool ? 1 : 0) + (this.config.enableCalculatorTool ? 1 : 0);
                healthy = toolCount === expectedTools;
                return [2 /*return*/, {
                        healthy: healthy,
                        message: healthy
                            ? "Example Tool Plugin is healthy (".concat(toolCount, " tools)")
                            : "Example Tool Plugin has issues (expected ".concat(expectedTools, " tools, got ").concat(toolCount, ")"),
                        details: {
                            toolCount: toolCount,
                            expectedTools: expectedTools,
                            config: this.config,
                        },
                    }];
            });
        });
    };
    // ========== 私有方法 ==========
    /**
     * 创建工具
     */
    ExampleToolPlugin.prototype.createTools = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.tools.clear();
                if (this.config.enableGreetingTool) {
                    this.createGreetingTool();
                }
                if (this.config.enableCalculatorTool) {
                    this.createCalculatorTool();
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 重新创建工具
     */
    ExampleToolPlugin.prototype.recreateTools = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.context) {
                            this.context.outputChannel.appendLine('🔄 Recreating example tools...');
                        }
                        return [4 /*yield*/, this.createTools()];
                    case 1:
                        _a.sent();
                        if (this.context) {
                            this.context.outputChannel.appendLine("\u2705 Recreated ".concat(this.tools.size, " example tools"));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建问候工具
     */
    ExampleToolPlugin.prototype.createGreetingTool = function () {
        var _this = this;
        var tool = {
            id: 'example-greeting',
            name: '示例问候工具',
            description: '根据配置返回问候语',
            version: '1.0.0',
            author: 'CodeLine Team',
            capabilities: ['greeting', 'utility'],
            parameterSchema: {
                name: {
                    type: 'string',
                    description: '问候的对象名称',
                    required: false,
                },
                language: {
                    type: 'string',
                    description: '问候语语言（支持：en, zh, ja, ko）',
                    required: false,
                },
            },
            isEnabled: function () { return _this.config.enableGreetingTool; },
            isConcurrencySafe: function () { return true; },
            isReadOnly: function () { return true; },
            isDestructive: function () { return false; },
            checkPermissions: function (params, context) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, ({
                            allowed: true,
                            reason: 'Example greeting tool is always allowed',
                        })];
                });
            }); },
            validateParameters: function (params, context) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, ({
                            valid: true,
                        })];
                });
            }); },
            execute: function (params, context, onProgress) { return __awaiter(_this, void 0, void 0, function () {
                var name, language, greetings, greeting, fullGreeting;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            name = params.name || 'World';
                            language = params.language || 'en';
                            greetings = {
                                en: "Hello, ".concat(name, "!"),
                                zh: "\u4F60\u597D\uFF0C".concat(name, "\uFF01"),
                                ja: "\u3053\u3093\u306B\u3061\u306F\u3001".concat(name, "\u3055\u3093\uFF01"),
                                ko: "\uC548\uB155\uD558\uC138\uC694, ".concat(name, "\uB2D8!"),
                            };
                            greeting = greetings[language] || greetings.en;
                            fullGreeting = "".concat(greeting, " ").concat(this.config.defaultGreeting);
                            if (!onProgress) return [3 /*break*/, 2];
                            onProgress({
                                type: 'processing',
                                progress: 50,
                                message: 'Generating greeting...',
                            });
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                        case 1:
                            _a.sent();
                            onProgress({
                                type: 'processing',
                                progress: 100,
                                message: 'Greeting generated successfully',
                            });
                            _a.label = 2;
                        case 2: return [2 /*return*/, {
                                success: true,
                                output: fullGreeting,
                                toolId: 'example-greeting',
                                duration: 100,
                                timestamp: new Date(),
                            }];
                    }
                });
            }); },
            getDisplayName: function (params) {
                var name = (params === null || params === void 0 ? void 0 : params.name) || 'World';
                return "Greet ".concat(name);
            },
            getActivityDescription: function (params) {
                var language = params.language || 'en';
                return "Generate a ".concat(language, " greeting");
            },
        };
        this.tools.set(tool.id, tool);
    };
    /**
     * 创建计算工具
     */
    ExampleToolPlugin.prototype.createCalculatorTool = function () {
        var _this = this;
        var tool = {
            id: 'example-calculator',
            name: '示例计算工具',
            description: '执行简单的数学计算',
            version: '1.0.0',
            author: 'CodeLine Team',
            capabilities: ['calculation', 'utility'],
            parameterSchema: {
                operation: {
                    type: 'string',
                    description: '计算操作（支持：add, subtract, multiply, divide）',
                    required: true,
                    validation: function (value) { return ['add', 'subtract', 'multiply', 'divide'].includes(value); },
                },
                a: {
                    type: 'number',
                    description: '第一个操作数',
                    required: true,
                },
                b: {
                    type: 'number',
                    description: '第二个操作数',
                    required: true,
                },
            },
            isEnabled: function () { return _this.config.enableCalculatorTool; },
            isConcurrencySafe: function () { return true; },
            isReadOnly: function () { return true; },
            isDestructive: function () { return false; },
            checkPermissions: function (params, context) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, ({
                            allowed: true,
                            reason: 'Example calculator tool is always allowed',
                        })];
                });
            }); },
            validateParameters: function (params, context) { return __awaiter(_this, void 0, void 0, function () {
                var operation, a, b;
                return __generator(this, function (_a) {
                    operation = params.operation, a = params.a, b = params.b;
                    if (!operation || !['add', 'subtract', 'multiply', 'divide'].includes(operation)) {
                        return [2 /*return*/, {
                                valid: false,
                                errors: ['Invalid operation. Must be one of: add, subtract, multiply, divide'],
                            }];
                    }
                    if (typeof a !== 'number' || typeof b !== 'number') {
                        return [2 /*return*/, {
                                valid: false,
                                errors: ['Both a and b must be numbers'],
                            }];
                    }
                    if (operation === 'divide' && b === 0) {
                        return [2 /*return*/, {
                                valid: false,
                                errors: ['Division by zero is not allowed'],
                            }];
                    }
                    return [2 /*return*/, {
                            valid: true,
                        }];
                });
            }); },
            execute: function (params, context, onProgress) { return __awaiter(_this, void 0, void 0, function () {
                var operation, a, b, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            operation = params.operation, a = params.a, b = params.b;
                            if (!onProgress) return [3 /*break*/, 3];
                            onProgress({
                                type: 'processing',
                                progress: 25,
                                message: 'Validating parameters...',
                            });
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 50); })];
                        case 1:
                            _a.sent();
                            onProgress({
                                type: 'processing',
                                progress: 50,
                                message: 'Performing calculation...',
                            });
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 50); })];
                        case 2:
                            _a.sent();
                            onProgress({
                                type: 'processing',
                                progress: 75,
                                message: 'Formatting result...',
                            });
                            _a.label = 3;
                        case 3:
                            switch (operation) {
                                case 'add':
                                    result = a + b;
                                    break;
                                case 'subtract':
                                    result = a - b;
                                    break;
                                case 'multiply':
                                    result = a * b;
                                    break;
                                case 'divide':
                                    result = a / b;
                                    break;
                                default:
                                    throw new Error("Unknown operation: ".concat(operation));
                            }
                            if (onProgress) {
                                onProgress({
                                    type: 'processing',
                                    progress: 100,
                                    message: 'Calculation complete',
                                });
                            }
                            return [2 /*return*/, {
                                    success: true,
                                    output: {
                                        operation: operation,
                                        a: a,
                                        b: b,
                                        result: result,
                                        expression: "".concat(a, " ").concat(operation, " ").concat(b, " = ").concat(result),
                                    },
                                    toolId: 'example-calculator',
                                    duration: 100,
                                    timestamp: new Date(),
                                }];
                    }
                });
            }); },
            getDisplayName: function (params) {
                var operation = (params === null || params === void 0 ? void 0 : params.operation) || 'calculate';
                return "".concat(operation.charAt(0).toUpperCase() + operation.slice(1), " Operation");
            },
            getActivityDescription: function (params) {
                var operation = params.operation, a = params.a, b = params.b;
                return "Calculate ".concat(a, " ").concat(operation, " ").concat(b);
            },
        };
        this.tools.set(tool.id, tool);
    };
    return ExampleToolPlugin;
}());
exports.ExampleToolPlugin = ExampleToolPlugin;
