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
exports.MCPManager = void 0;
var vscode = require("vscode");
var MCPManager = /** @class */ (function () {
    function MCPManager() {
        this.tools = new Map();
        this.isInitialized = false;
        this.outputChannel = vscode.window.createOutputChannel('CodeLine MCP');
    }
    /**
     * 初始化MCP管理器
     */
    MCPManager.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isInitialized) {
                            return [2 /*return*/, true];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        this.outputChannel.show(true);
                        this.outputChannel.appendLine('🔧 Initializing MCP Manager...');
                        // 注册内置工具
                        return [4 /*yield*/, this.registerBuiltinTools()];
                    case 2:
                        // 注册内置工具
                        _a.sent();
                        this.isInitialized = true;
                        this.outputChannel.appendLine("\u2705 MCP Manager initialized with ".concat(this.tools.size, " tools"));
                        return [2 /*return*/, true];
                    case 3:
                        error_1 = _a.sent();
                        this.outputChannel.appendLine("\u274C MCP initialization failed: ".concat(error_1.message));
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 注册MCP工具
     */
    MCPManager.prototype.registerTool = function (tool) {
        if (this.tools.has(tool.id)) {
            this.outputChannel.appendLine("\u26A0\uFE0F Tool ".concat(tool.id, " already registered, skipping"));
            return false;
        }
        this.tools.set(tool.id, tool);
        this.outputChannel.appendLine("\uD83D\uDCCB Registered tool: ".concat(tool.name, " (").concat(tool.id, ")"));
        return true;
    };
    /**
     * 执行MCP工具
     */
    MCPManager.prototype.executeTool = function (toolId_1) {
        return __awaiter(this, arguments, void 0, function (toolId, params, options) {
            var startTime, initialized, tool, isValid, output, duration, error_2, duration;
            if (params === void 0) { params = {}; }
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        if (!!this.isInitialized) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initialize()];
                    case 1:
                        initialized = _a.sent();
                        if (!initialized) {
                            return [2 /*return*/, {
                                    success: false,
                                    output: null,
                                    error: 'MCP Manager not initialized',
                                    toolId: toolId,
                                    duration: 0,
                                    timestamp: new Date()
                                }];
                        }
                        _a.label = 2;
                    case 2:
                        tool = this.tools.get(toolId);
                        if (!tool) {
                            return [2 /*return*/, {
                                    success: false,
                                    output: null,
                                    error: "Tool not found: ".concat(toolId),
                                    toolId: toolId,
                                    duration: Date.now() - startTime,
                                    timestamp: new Date()
                                }];
                        }
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 7, , 8]);
                        this.outputChannel.appendLine("\uD83D\uDEE0\uFE0F Executing tool: ".concat(tool.name, " (").concat(toolId, ")"));
                        // 验证参数
                        if (tool.validate && options.validateParams !== false) {
                            isValid = tool.validate(params);
                            if (!isValid) {
                                throw new Error('Invalid parameters for tool');
                            }
                        }
                        output = void 0;
                        if (!tool.execute) return [3 /*break*/, 5];
                        return [4 /*yield*/, tool.execute(params)];
                    case 4:
                        output = _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        output = { message: "Tool ".concat(toolId, " has no execute method") };
                        _a.label = 6;
                    case 6:
                        duration = Date.now() - startTime;
                        this.outputChannel.appendLine("\u2705 Tool ".concat(tool.name, " executed successfully (").concat(duration, "ms)"));
                        return [2 /*return*/, {
                                success: true,
                                output: output,
                                toolId: toolId,
                                duration: duration,
                                timestamp: new Date()
                            }];
                    case 7:
                        error_2 = _a.sent();
                        duration = Date.now() - startTime;
                        this.outputChannel.appendLine("\u274C Tool ".concat(tool.name, " failed: ").concat(error_2.message));
                        return [2 /*return*/, {
                                success: false,
                                output: null,
                                error: error_2.message,
                                toolId: toolId,
                                duration: duration,
                                timestamp: new Date()
                            }];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 批量执行工具
     */
    MCPManager.prototype.executeTools = function (toolExecutions_1) {
        return __awaiter(this, arguments, void 0, function (toolExecutions, options) {
            var results, _i, toolExecutions_2, execution, result, retryCount, retryResult;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = [];
                        _i = 0, toolExecutions_2 = toolExecutions;
                        _a.label = 1;
                    case 1:
                        if (!(_i < toolExecutions_2.length)) return [3 /*break*/, 6];
                        execution = toolExecutions_2[_i];
                        return [4 /*yield*/, this.executeTool(execution.toolId, execution.params || {}, options)];
                    case 2:
                        result = _a.sent();
                        results.push(result);
                        if (!(!result.success && options.retryOnFailure && options.maxRetries)) return [3 /*break*/, 5];
                        retryCount = 0;
                        _a.label = 3;
                    case 3:
                        if (!(!result.success && retryCount < options.maxRetries)) return [3 /*break*/, 5];
                        retryCount++;
                        this.outputChannel.appendLine("\uD83D\uDD04 Retrying ".concat(execution.toolId, " (attempt ").concat(retryCount, "/").concat(options.maxRetries, ")"));
                        return [4 /*yield*/, this.executeTool(execution.toolId, execution.params || {}, __assign(__assign({}, options), { validateParams: false // 重试时跳过验证
                             }))];
                    case 4:
                        retryResult = _a.sent();
                        results.push(retryResult);
                        return [3 /*break*/, 3];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * 获取所有可用工具
     */
    MCPManager.prototype.getAvailableTools = function () {
        return Array.from(this.tools.values());
    };
    /**
     * 根据描述查找相关工具
     */
    MCPManager.prototype.findToolsByDescription = function (description) {
        var query = description.toLowerCase();
        return this.getAvailableTools().filter(function (tool) {
            return tool.name.toLowerCase().includes(query) ||
                tool.description.toLowerCase().includes(query) ||
                tool.capabilities.some(function (cap) { return cap.toLowerCase().includes(query); });
        });
    };
    /**
     * 生成工具执行的HTML报告
     */
    MCPManager.prototype.generateHtmlReport = function (result, tool) {
        var statusClass = result.success ? 'mcp-success' : 'mcp-error';
        var statusIcon = result.success ? '✅' : '❌';
        var duration = result.duration ? "".concat(result.duration, "ms") : 'N/A';
        var toolInfo = tool || this.tools.get(result.toolId);
        return "\n<div class=\"mcp-result ".concat(statusClass, "\">\n  <div class=\"mcp-header\">\n    <h3>").concat(statusIcon, " MCP Tool Execution</h3>\n    <div class=\"mcp-meta\">\n      <span>Tool: ").concat(result.toolId, "</span>\n      <span>Duration: ").concat(duration, "</span>\n      <span>").concat(result.timestamp.toLocaleTimeString(), "</span>\n    </div>\n  </div>\n  \n  ").concat(toolInfo ? "\n  <div class=\"mcp-tool-info\">\n    <h4>Tool Information:</h4>\n    <table>\n      <tr><th>Name:</th><td>".concat(toolInfo.name, "</td></tr>\n      <tr><th>Description:</th><td>").concat(toolInfo.description, "</td></tr>\n      <tr><th>Version:</th><td>").concat(toolInfo.version, "</td></tr>\n      ").concat(toolInfo.capabilities.length > 0 ? "\n      <tr><th>Capabilities:</th><td>".concat(toolInfo.capabilities.join(', '), "</td></tr>\n      ") : '', "\n    </table>\n  </div>\n  ") : '', "\n  \n  <div class=\"mcp-output\">\n    <h4>Output:</h4>\n    <pre>").concat(this.escapeHtml(JSON.stringify(result.output, null, 2) || '(no output)'), "</pre>\n  </div>\n  \n  ").concat(result.error ? "\n  <div class=\"mcp-error-output\">\n    <h4>Error:</h4>\n    <pre>".concat(this.escapeHtml(result.error), "</pre>\n  </div>\n  ") : '', "\n</div>");
    };
    // ===== 内置工具注册 =====
    MCPManager.prototype.registerBuiltinTools = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                // 1. 时间工具
                this.registerTool({
                    id: 'time-current',
                    name: 'Current Time',
                    description: 'Get current date and time',
                    version: '1.0.0',
                    capabilities: ['time', 'date', 'datetime'],
                    execute: function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, {
                                    timestamp: Date.now(),
                                    isoString: new Date().toISOString(),
                                    localString: new Date().toLocaleString(),
                                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                                    date: new Date().toDateString(),
                                    time: new Date().toTimeString()
                                }];
                        });
                    }); }
                });
                // 2. 计算工具
                this.registerTool({
                    id: 'math-calculator',
                    name: 'Calculator',
                    description: 'Perform mathematical calculations',
                    version: '1.0.0',
                    capabilities: ['math', 'calculation', 'arithmetic'],
                    execute: function (params) { return __awaiter(_this, void 0, void 0, function () {
                        var expression, sanitized, result;
                        return __generator(this, function (_a) {
                            expression = params.expression;
                            if (!expression) {
                                throw new Error('Missing expression parameter');
                            }
                            try {
                                sanitized = expression
                                    .replace(/[^0-9+\-*/().\s]/g, '')
                                    .replace(/(\d)\s*([+\-*/])\s*(\d)/g, '$1 $2 $3');
                                result = eval(sanitized);
                                return [2 /*return*/, {
                                        expression: expression,
                                        result: result,
                                        sanitized: sanitized,
                                        type: typeof result
                                    }];
                            }
                            catch (error) {
                                throw new Error("Calculation failed: ".concat(error.message));
                            }
                            return [2 /*return*/];
                        });
                    }); },
                    validate: function (params) {
                        return typeof params.expression === 'string' && params.expression.trim().length > 0;
                    }
                });
                // 3. 单位转换工具
                this.registerTool({
                    id: 'unit-converter',
                    name: 'Unit Converter',
                    description: 'Convert between different units',
                    version: '1.0.0',
                    capabilities: ['conversion', 'units', 'measurement'],
                    execute: function (params) { return __awaiter(_this, void 0, void 0, function () {
                        var value, from, to, numValue, conversions, result, category, fromFactor, toFactor, baseValue;
                        return __generator(this, function (_a) {
                            value = params.value, from = params.from, to = params.to;
                            if (value === undefined || !from || !to) {
                                throw new Error('Missing parameters: value, from, or to');
                            }
                            numValue = parseFloat(value);
                            if (isNaN(numValue)) {
                                throw new Error('Value must be a number');
                            }
                            conversions = {
                                length: {
                                    'm': 1,
                                    'km': 0.001,
                                    'cm': 100,
                                    'mm': 1000,
                                    'in': 39.3701,
                                    'ft': 3.28084,
                                    'yd': 1.09361,
                                    'mi': 0.000621371
                                },
                                weight: {
                                    'kg': 1,
                                    'g': 1000,
                                    'lb': 2.20462,
                                    'oz': 35.274
                                },
                                temperature: {
                                    'c': 1,
                                    'f': 1,
                                    'k': 1
                                }
                            };
                            // 温度转换特殊处理
                            if ((from.toLowerCase() === 'c' && to.toLowerCase() === 'f') ||
                                (from.toLowerCase() === 'celsius' && to.toLowerCase() === 'fahrenheit')) {
                                result = (numValue * 9 / 5) + 32;
                            }
                            else if ((from.toLowerCase() === 'f' && to.toLowerCase() === 'c') ||
                                (from.toLowerCase() === 'fahrenheit' && to.toLowerCase() === 'celsius')) {
                                result = (numValue - 32) * 5 / 9;
                            }
                            else if ((from.toLowerCase() === 'c' && to.toLowerCase() === 'k') ||
                                (from.toLowerCase() === 'celsius' && to.toLowerCase() === 'kelvin')) {
                                result = numValue + 273.15;
                            }
                            else if ((from.toLowerCase() === 'k' && to.toLowerCase() === 'c') ||
                                (from.toLowerCase() === 'kelvin' && to.toLowerCase() === 'celsius')) {
                                result = numValue - 273.15;
                            }
                            else {
                                category = 'length';
                                if (conversions.weight[from.toLowerCase()] && conversions.weight[to.toLowerCase()]) {
                                    category = 'weight';
                                }
                                fromFactor = conversions[category][from.toLowerCase()];
                                toFactor = conversions[category][to.toLowerCase()];
                                if (!fromFactor || !toFactor) {
                                    throw new Error("Unsupported conversion: ".concat(from, " to ").concat(to));
                                }
                                baseValue = numValue / fromFactor;
                                result = baseValue * toFactor;
                            }
                            return [2 /*return*/, {
                                    original: { value: numValue, unit: from },
                                    converted: { value: result, unit: to },
                                    conversion: "".concat(numValue, " ").concat(from, " = ").concat(result, " ").concat(to)
                                }];
                        });
                    }); }
                });
                // 4. 随机数生成器
                this.registerTool({
                    id: 'random-generator',
                    name: 'Random Generator',
                    description: 'Generate random numbers or make random selections',
                    version: '1.0.0',
                    capabilities: ['random', 'generator', 'selection'],
                    execute: function (params) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, min, _b, max, _c, count, items, pick, countToPick, shuffled, selected, numbers, i;
                        return __generator(this, function (_d) {
                            _a = params.min, min = _a === void 0 ? 0 : _a, _b = params.max, max = _b === void 0 ? 100 : _b, _c = params.count, count = _c === void 0 ? 1 : _c, items = params.items, pick = params.pick;
                            if (items && Array.isArray(items)) {
                                countToPick = pick || 1;
                                shuffled = __spreadArray([], items, true).sort(function () { return Math.random() - 0.5; });
                                selected = shuffled.slice(0, countToPick);
                                return [2 /*return*/, {
                                        type: 'selection',
                                        items: items,
                                        count: countToPick,
                                        selected: selected,
                                        allItems: items
                                    }];
                            }
                            else {
                                numbers = [];
                                for (i = 0; i < count; i++) {
                                    numbers.push(Math.floor(Math.random() * (max - min + 1)) + min);
                                }
                                return [2 /*return*/, {
                                        type: 'numbers',
                                        min: min,
                                        max: max,
                                        count: count,
                                        numbers: numbers,
                                        average: numbers.reduce(function (a, b) { return a + b; }, 0) / numbers.length,
                                        sum: numbers.reduce(function (a, b) { return a + b; }, 0)
                                    }];
                            }
                            return [2 /*return*/];
                        });
                    }); }
                });
                // 5. 文本处理工具
                this.registerTool({
                    id: 'text-processor',
                    name: 'Text Processor',
                    description: 'Process and analyze text',
                    version: '1.0.0',
                    capabilities: ['text', 'processing', 'analysis'],
                    execute: function (params) { return __awaiter(_this, void 0, void 0, function () {
                        var text, _a, operation;
                        return __generator(this, function (_b) {
                            text = params.text, _a = params.operation, operation = _a === void 0 ? 'analyze' : _a;
                            if (!text) {
                                throw new Error('Missing text parameter');
                            }
                            switch (operation) {
                                case 'analyze':
                                    return [2 /*return*/, {
                                            length: text.length,
                                            wordCount: text.split(/\s+/).filter(function (w) { return w.length > 0; }).length,
                                            characterCount: text.replace(/\s/g, '').length,
                                            lineCount: text.split('\n').length,
                                            averageWordLength: text.split(/\s+/).filter(function (w) { return w.length > 0; }).reduce(function (sum, word) { return sum + word.length; }, 0) /
                                                text.split(/\s+/).filter(function (w) { return w.length > 0; }).length || 0
                                        }];
                                case 'uppercase':
                                    return [2 /*return*/, text.toUpperCase()];
                                case 'lowercase':
                                    return [2 /*return*/, text.toLowerCase()];
                                case 'reverse':
                                    return [2 /*return*/, text.split('').reverse().join('')];
                                case 'trim':
                                    return [2 /*return*/, text.trim()];
                                default:
                                    throw new Error("Unsupported operation: ".concat(operation));
                            }
                            return [2 /*return*/];
                        });
                    }); }
                });
                // 6. 文件系统工具（只读）
                this.registerTool({
                    id: 'filesystem-read',
                    name: 'File System Reader',
                    description: 'Read file system information (read-only)',
                    version: '1.0.0',
                    capabilities: ['filesystem', 'read', 'directory'],
                    execute: function (params) { return __awaiter(_this, void 0, void 0, function () {
                        var path;
                        return __generator(this, function (_a) {
                            path = params.path;
                            if (!path) {
                                throw new Error('Missing path parameter');
                            }
                            // 注意：实际应用中应该使用vscode的API安全地访问文件系统
                            // 这里返回模拟数据
                            return [2 /*return*/, {
                                    path: path,
                                    exists: true,
                                    isDirectory: Math.random() > 0.5,
                                    size: Math.floor(Math.random() * 1000000),
                                    modified: new Date().toISOString(),
                                    warning: 'This is a simulated file system tool. In production, use vscode API.'
                                }];
                        });
                    }); }
                });
                this.outputChannel.appendLine("\uD83D\uDCE6 Registered ".concat(this.tools.size, " built-in MCP tools"));
                return [2 /*return*/];
            });
        });
    };
    /**
     * 关闭MCP管理器
     */
    MCPManager.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.outputChannel.appendLine('🔒 MCP Manager closed');
                this.outputChannel.dispose();
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取管理器状态
     */
    MCPManager.prototype.getStatus = function () {
        return {
            initialized: this.isInitialized,
            toolCount: this.tools.size,
            outputChannel: this.outputChannel !== null
        };
    };
    MCPManager.prototype.escapeHtml = function (text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            .replace(/\n/g, '<br>');
    };
    return MCPManager;
}());
exports.MCPManager = MCPManager;
