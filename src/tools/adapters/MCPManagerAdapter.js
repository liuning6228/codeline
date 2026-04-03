"use strict";
/**
 * MCP管理器适配器
 * 将现有的 MCPManager 模块适配到统一的工具接口
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
exports.MCPManagerAdapter = void 0;
var mcpManager_1 = require("../../mcp/mcpManager");
var ToolAdapter_1 = require("./ToolAdapter");
/**
 * MCP管理器适配器
 */
var MCPManagerAdapter = /** @class */ (function (_super) {
    __extends(MCPManagerAdapter, _super);
    function MCPManagerAdapter(context) {
        var _this = _super.call(this, 'mcp-manager', 'MCP Manager', 'Manage and execute Model Context Protocol (MCP) tools', '1.0.0', 'CodeLine Team', ['mcp', 'tools', 'protocol', 'model-context', 'integration'], {
            operation: {
                type: 'string',
                description: 'MCP operation type',
                required: true,
                validation: function (value) { return ['execute', 'list', 'info', 'test'].includes(value); },
                default: 'list',
            },
            toolId: {
                type: 'string',
                description: 'MCP tool ID (for execute/info/test operations)',
                required: false,
            },
            params: {
                type: 'object',
                description: 'Tool parameters (for execute operation)',
                required: false,
            },
            searchTerm: {
                type: 'string',
                description: 'Search term for filtering tools (for list operation)',
                required: false,
            },
            testType: {
                type: 'string',
                description: 'Test type (for test operation)',
                required: false,
                validation: function (value) { return !value || ['validation', 'execution', 'performance'].includes(value); },
            },
            mcpOptions: {
                type: 'object',
                description: 'MCP execution options',
                required: false,
            },
        }) || this;
        _this.mcpManager = new mcpManager_1.MCPManager();
        return _this;
    }
    /**
     * 检查权限 - MCP工具需要特别注意
     */
    MCPManagerAdapter.prototype.checkPermissions = function (params, context) {
        return __awaiter(this, void 0, void 0, function () {
            var operation, toolId;
            return __generator(this, function (_a) {
                operation = params.operation, toolId = params.toolId;
                // 检查操作权限
                switch (operation) {
                    case 'list':
                    case 'info':
                        // 列表和信息操作通常允许
                        return [2 /*return*/, {
                                allowed: true,
                                requiresUserConfirmation: false,
                            }];
                    case 'execute':
                        // 执行工具需要确认
                        return [2 /*return*/, {
                                allowed: true,
                                requiresUserConfirmation: true,
                                confirmationPrompt: "Are you sure you want to execute MCP tool: ".concat(toolId || 'unknown', "?"),
                            }];
                    case 'test':
                        // 测试操作可能需要确认
                        return [2 /*return*/, {
                                allowed: true,
                                requiresUserConfirmation: true,
                                confirmationPrompt: "Are you sure you want to test MCP ".concat(toolId ? "tool: ".concat(toolId) : 'tools', "?"),
                            }];
                    default:
                        return [2 /*return*/, {
                                allowed: false,
                                reason: "Unknown operation: ".concat(operation),
                            }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 验证参数
     */
    MCPManagerAdapter.prototype.validateParameters = function (params, context) {
        return __awaiter(this, void 0, void 0, function () {
            var operation, toolId, testType, sanitizedParams;
            return __generator(this, function (_a) {
                operation = params.operation, toolId = params.toolId, testType = params.testType;
                // 基本验证
                if (!operation) {
                    return [2 /*return*/, {
                            valid: false,
                            error: 'Operation type is required',
                        }];
                }
                // 操作特定验证
                switch (operation) {
                    case 'execute':
                        if (!toolId) {
                            return [2 /*return*/, {
                                    valid: false,
                                    error: 'toolId is required for execute operation',
                                }];
                        }
                        break;
                    case 'info':
                    case 'test':
                        if (!toolId && testType === 'performance') {
                            return [2 /*return*/, {
                                    valid: false,
                                    error: 'toolId is required for performance testing',
                                }];
                        }
                        break;
                    case 'list':
                        // 列表操作不需要额外验证
                        break;
                    default:
                        return [2 /*return*/, {
                                valid: false,
                                error: "Unsupported operation: ".concat(operation),
                            }];
                }
                sanitizedParams = __assign(__assign({}, params), { params: params.params || {}, mcpOptions: params.mcpOptions || {} });
                return [2 /*return*/, {
                        valid: true,
                        sanitizedParams: sanitizedParams,
                    }];
            });
        });
    };
    /**
     * 执行MCP操作
     */
    MCPManagerAdapter.prototype.execute = function (params, context, onProgress) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, operation, toolId, error_1, duration, resultData, _a, tools, searchLower_1, mcpResult, allTools, tool, testResults, duration, error_2, duration;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        startTime = Date.now();
                        operation = params.operation, toolId = params.toolId;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        if (!!this.mcpManager['isInitialized']) return [3 /*break*/, 3];
                        this.reportProgress(onProgress, {
                            type: 'mcp_initializing',
                            progress: 0.1,
                            message: 'Initializing MCP manager',
                        });
                        return [4 /*yield*/, this.mcpManager.initialize()];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_1 = _c.sent();
                        duration = Date.now() - startTime;
                        return [2 /*return*/, this.createErrorResult("Failed to initialize MCP manager: ".concat(error_1.message), duration)];
                    case 5:
                        _c.trys.push([5, 14, , 15]);
                        resultData = {};
                        // 报告开始进度
                        this.reportProgress(onProgress, {
                            type: 'mcp_operation_start',
                            progress: 0.2,
                            message: "Starting MCP ".concat(operation, " operation"),
                            data: { operation: operation, toolId: toolId },
                        });
                        _a = operation;
                        switch (_a) {
                            case 'list': return [3 /*break*/, 6];
                            case 'execute': return [3 /*break*/, 7];
                            case 'info': return [3 /*break*/, 9];
                            case 'test': return [3 /*break*/, 10];
                        }
                        return [3 /*break*/, 12];
                    case 6:
                        this.reportProgress(onProgress, {
                            type: 'mcp_listing_tools',
                            progress: 0.4,
                            message: 'Listing available MCP tools',
                        });
                        tools = this.mcpManager.getAvailableTools();
                        // 应用搜索过滤
                        if (params.searchTerm) {
                            searchLower_1 = params.searchTerm.toLowerCase();
                            tools = tools.filter(function (tool) {
                                return tool.name.toLowerCase().includes(searchLower_1) ||
                                    tool.description.toLowerCase().includes(searchLower_1) ||
                                    tool.capabilities.some(function (cap) { return cap.toLowerCase().includes(searchLower_1); });
                            });
                        }
                        resultData = {
                            tools: tools,
                            summary: {
                                toolCount: tools.length,
                                availableTools: this.mcpManager.getAvailableTools().length,
                            },
                        };
                        return [3 /*break*/, 13];
                    case 7:
                        if (!toolId) {
                            throw new Error('toolId is required for execute operation');
                        }
                        this.reportProgress(onProgress, {
                            type: 'mcp_executing_tool',
                            progress: 0.4,
                            message: "Executing MCP tool: ".concat(toolId),
                            data: { toolId: toolId, params: params.params },
                        });
                        return [4 /*yield*/, this.mcpManager.executeTool(toolId, params.params || {}, params.mcpOptions || {})];
                    case 8:
                        mcpResult = _c.sent();
                        resultData = {
                            mcpResult: mcpResult,
                        };
                        return [3 /*break*/, 13];
                    case 9:
                        if (!toolId) {
                            throw new Error('toolId is required for info operation');
                        }
                        this.reportProgress(onProgress, {
                            type: 'mcp_getting_tool_info',
                            progress: 0.4,
                            message: "Getting info for MCP tool: ".concat(toolId),
                        });
                        allTools = this.mcpManager.getAvailableTools();
                        tool = allTools.find(function (t) { return t.id === toolId; });
                        if (!tool) {
                            throw new Error("MCP tool not found: ".concat(toolId));
                        }
                        resultData = {
                            toolInfo: tool,
                        };
                        return [3 /*break*/, 13];
                    case 10:
                        this.reportProgress(onProgress, {
                            type: 'mcp_testing',
                            progress: 0.3,
                            message: "Testing MCP ".concat(toolId ? "tool: ".concat(toolId) : 'tools'),
                            data: { toolId: toolId, testType: params.testType },
                        });
                        return [4 /*yield*/, this.performMCPTests(toolId, params.testType)];
                    case 11:
                        testResults = _c.sent();
                        resultData = {
                            testResults: testResults,
                            summary: {
                                toolCount: this.mcpManager.getAvailableTools().length,
                                availableTools: this.mcpManager.getAvailableTools().length,
                                testResults: {
                                    passed: testResults.errors ? testResults.errors.length === 0 ? 1 : 0 : 0,
                                    failed: testResults.errors ? testResults.errors.length : 0,
                                },
                            },
                        };
                        return [3 /*break*/, 13];
                    case 12: throw new Error("Unsupported operation: ".concat(operation));
                    case 13:
                        // 报告完成进度
                        this.reportProgress(onProgress, {
                            type: 'mcp_operation_complete',
                            progress: 1.0,
                            message: "MCP ".concat(operation, " operation completed"),
                            data: { operation: operation, toolId: toolId },
                        });
                        duration = Date.now() - startTime;
                        // 返回成功结果
                        return [2 /*return*/, this.createSuccessResult(resultData, duration, {
                                operation: operation,
                                toolId: toolId,
                                toolCount: (_b = resultData.summary) === null || _b === void 0 ? void 0 : _b.toolCount,
                            })];
                    case 14:
                        error_2 = _c.sent();
                        duration = Date.now() - startTime;
                        this.reportProgress(onProgress, {
                            type: 'mcp_operation_error',
                            progress: 1.0,
                            message: "MCP operation failed: ".concat(error_2.message),
                        });
                        return [2 /*return*/, this.createErrorResult("MCP operation failed: ".concat(error_2.message), duration, {
                                operation: operation,
                                toolId: toolId,
                            })];
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 执行MCP测试
     */
    MCPManagerAdapter.prototype.performMCPTests = function (toolId, testType) {
        return __awaiter(this, void 0, void 0, function () {
            var errors, validation, execution, performance, tools, _i, tools_1, tool, testTool, testStartTime, result, testDuration, error_3, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        errors = [];
                        validation = false;
                        execution = false;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        tools = toolId
                            ? this.mcpManager.getAvailableTools().filter(function (t) { return t.id === toolId; })
                            : this.mcpManager.getAvailableTools();
                        if (tools.length === 0) {
                            throw new Error(toolId ? "Tool not found: ".concat(toolId) : 'No MCP tools available');
                        }
                        // 执行验证测试
                        if (!testType || testType === 'validation') {
                            try {
                                // 验证工具结构
                                for (_i = 0, tools_1 = tools; _i < tools_1.length; _i++) {
                                    tool = tools_1[_i];
                                    if (!tool.id || !tool.name || !tool.description) {
                                        errors.push("Tool ".concat(tool.id || 'unknown', " has missing required fields"));
                                    }
                                    if (!tool.execute) {
                                        errors.push("Tool ".concat(tool.id, " has no execute method"));
                                    }
                                }
                                validation = errors.length === 0;
                            }
                            catch (error) {
                                errors.push("Validation failed: ".concat(error.message));
                            }
                        }
                        if (!(!testType || testType === 'execution' || testType === 'performance')) return [3 /*break*/, 5];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        testTool = tools[0];
                        testStartTime = Date.now();
                        return [4 /*yield*/, this.mcpManager.executeTool(testTool.id, {}, { timeout: 5000 })];
                    case 3:
                        result = _a.sent();
                        testDuration = Date.now() - testStartTime;
                        if (testType === 'performance') {
                            performance = testDuration;
                        }
                        if (result.success) {
                            execution = true;
                        }
                        else {
                            errors.push("Execution test failed for ".concat(testTool.id, ": ").concat(result.error));
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _a.sent();
                        errors.push("Execution test failed: ".concat(error_3.message));
                        return [3 /*break*/, 5];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_4 = _a.sent();
                        errors.push("Test setup failed: ".concat(error_4.message));
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/, {
                            validation: validation,
                            execution: execution,
                            performance: performance,
                            errors: errors.length > 0 ? errors : undefined,
                        }];
                }
            });
        });
    };
    /**
     * 检查是否为只读操作
     */
    MCPManagerAdapter.prototype.isReadOnly = function (context) {
        // 大多数MCP操作是只读的，但有些可能不是
        return true;
    };
    /**
     * 获取显示名称
     */
    MCPManagerAdapter.prototype.getDisplayName = function (params) {
        var operation = (params === null || params === void 0 ? void 0 : params.operation) || 'list';
        var operationNames = {
            execute: 'Execute MCP Tool',
            list: 'List MCP Tools',
            info: 'MCP Tool Info',
            test: 'Test MCP Tools',
        };
        return operationNames[operation] || 'MCP Operation';
    };
    /**
     * 获取活动描述
     */
    MCPManagerAdapter.prototype.getActivityDescription = function (params) {
        var operation = params.operation, toolId = params.toolId;
        switch (operation) {
            case 'execute':
                return "Executing MCP tool: ".concat(toolId || 'unknown');
            case 'list':
                return "Listing available MCP tools";
            case 'info':
                return "Getting information for MCP tool: ".concat(toolId || 'unknown');
            case 'test':
                return "Testing MCP ".concat(toolId ? "tool: ".concat(toolId) : 'tools');
            default:
                return "MCP operation: ".concat(operation);
        }
    };
    /**
     * 工厂方法：创建MCP管理器适配器
     */
    MCPManagerAdapter.create = function (context) {
        return new MCPManagerAdapter(context);
    };
    return MCPManagerAdapter;
}(ToolAdapter_1.BaseToolAdapter));
exports.MCPManagerAdapter = MCPManagerAdapter;
