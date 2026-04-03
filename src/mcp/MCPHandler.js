"use strict";
/**
 * MCP处理器
 * 处理来自webview的MCP请求，与EnhancedTaskEngine集成
 */
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
exports.MCPHandler = void 0;
var vscode = require("vscode");
var EnhancedTaskEngine_1 = require("../tools/EnhancedTaskEngine");
/**
 * MCP处理器类
 */
var MCPHandler = /** @class */ (function () {
    function MCPHandler(context) {
        this.context = context;
        this.taskEngine = null;
        this.mcpManager = null;
        this.isInitialized = false;
        this.outputChannel = vscode.window.createOutputChannel('CodeLine MCP');
    }
    /**
     * 初始化MCP处理器
     */
    MCPHandler.prototype.initialize = function (workspaceRoot) {
        return __awaiter(this, void 0, void 0, function () {
            var toolsLoaded, toolRegistry, mcpTool, error_1;
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
                        this.outputChannel.appendLine('🔧 Initializing MCP Handler...');
                        // 初始化增强任务引擎（带工具系统）
                        this.taskEngine = new EnhancedTaskEngine_1.EnhancedTaskEngine(workspaceRoot, this.context, {
                            enableToolSystem: true,
                            autoLoadTools: true,
                            showLoadingProgress: true,
                        });
                        return [4 /*yield*/, this.taskEngine.loadTools()];
                    case 2:
                        toolsLoaded = _a.sent();
                        if (!toolsLoaded) {
                            this.outputChannel.appendLine('⚠️ Tool system loaded with warnings');
                        }
                        toolRegistry = this.taskEngine.getToolRegistry();
                        if (toolRegistry) {
                            mcpTool = toolRegistry.getTool('mcp-manager');
                            if (mcpTool) {
                                this.outputChannel.appendLine('✅ MCP tool adapter found');
                            }
                        }
                        this.isInitialized = true;
                        this.outputChannel.appendLine('✅ MCP Handler initialized');
                        return [2 /*return*/, true];
                    case 3:
                        error_1 = _a.sent();
                        this.outputChannel.appendLine("\u274C MCP Handler initialization failed: ".concat(error_1.message));
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 处理MCP消息
     */
    MCPHandler.prototype.handleMessage = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var type, data, _a, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.isInitialized || !this.taskEngine) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'MCP Handler not initialized',
                                }];
                        }
                        type = message.type, data = message.data;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 24, , 25]);
                        this.outputChannel.appendLine("\uD83D\uDCE8 Handling MCP message: ".concat(type));
                        _a = type;
                        switch (_a) {
                            case 'mcp_initialize': return [3 /*break*/, 2];
                            case 'mcp_add_server': return [3 /*break*/, 4];
                            case 'mcp_remove_server': return [3 /*break*/, 6];
                            case 'mcp_connect_server': return [3 /*break*/, 8];
                            case 'mcp_disconnect_server': return [3 /*break*/, 10];
                            case 'mcp_toggle_tool': return [3 /*break*/, 12];
                            case 'mcp_execute_tool': return [3 /*break*/, 14];
                            case 'mcp_refresh': return [3 /*break*/, 16];
                            case 'mcp_get_tools': return [3 /*break*/, 18];
                            case 'mcp_get_servers': return [3 /*break*/, 20];
                        }
                        return [3 /*break*/, 22];
                    case 2: return [4 /*yield*/, this.handleInitialize()];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4: return [4 /*yield*/, this.handleAddServer(data)];
                    case 5: return [2 /*return*/, _b.sent()];
                    case 6: return [4 /*yield*/, this.handleRemoveServer(data)];
                    case 7: return [2 /*return*/, _b.sent()];
                    case 8: return [4 /*yield*/, this.handleConnectServer(data)];
                    case 9: return [2 /*return*/, _b.sent()];
                    case 10: return [4 /*yield*/, this.handleDisconnectServer(data)];
                    case 11: return [2 /*return*/, _b.sent()];
                    case 12: return [4 /*yield*/, this.handleToggleTool(data)];
                    case 13: return [2 /*return*/, _b.sent()];
                    case 14: return [4 /*yield*/, this.handleExecuteTool(data)];
                    case 15: return [2 /*return*/, _b.sent()];
                    case 16: return [4 /*yield*/, this.handleRefresh()];
                    case 17: return [2 /*return*/, _b.sent()];
                    case 18: return [4 /*yield*/, this.handleGetTools()];
                    case 19: return [2 /*return*/, _b.sent()];
                    case 20: return [4 /*yield*/, this.handleGetServers()];
                    case 21: return [2 /*return*/, _b.sent()];
                    case 22: return [2 /*return*/, {
                            success: false,
                            error: "Unknown MCP message type: ".concat(type),
                        }];
                    case 23: return [3 /*break*/, 25];
                    case 24:
                        error_2 = _b.sent();
                        this.outputChannel.appendLine("\u274C MCP message handling failed: ".concat(error_2.message));
                        return [2 /*return*/, {
                                success: false,
                                error: error_2.message,
                            }];
                    case 25: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 处理初始化请求
     */
    MCPHandler.prototype.handleInitialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var toolRegistry, toolContext_1, allTools, mcpTools, servers, tools;
            return __generator(this, function (_a) {
                try {
                    toolRegistry = this.taskEngine.getToolRegistry();
                    if (!toolRegistry) {
                        return [2 /*return*/, {
                                success: false,
                                error: 'Tool registry not available',
                            }];
                    }
                    toolContext_1 = {
                        extensionContext: this.context,
                        workspaceRoot: this.taskEngine['workspaceRoot'],
                        cwd: process.cwd(),
                        outputChannel: this.outputChannel,
                        sessionId: "mcp-handler-".concat(Date.now()),
                    };
                    allTools = toolRegistry.getAllTools(toolContext_1, { enabledOnly: false });
                    mcpTools = allTools.filter(function (tool) { return tool.id.includes('mcp') || tool.capabilities.includes('mcp'); });
                    servers = [
                        {
                            id: 'mcp-default',
                            name: 'Default MCP Server',
                            description: 'Built-in MCP server with standard tools',
                            version: '1.0.0',
                            status: 'connected',
                            lastConnected: Date.now(),
                            toolCount: mcpTools.filter(function (t) { return t.id === 'mcp-manager'; }).length > 0 ? 1 : 0,
                            settings: {
                                autoConnect: true,
                                enabled: true,
                            },
                        },
                    ];
                    tools = allTools.map(function (tool) {
                        var _a, _b;
                        return ({
                            id: tool.id,
                            name: tool.name,
                            description: tool.description,
                            version: tool.version || '1.0.0',
                            serverId: 'mcp-default',
                            capabilities: tool.capabilities,
                            enabled: (_b = (_a = tool.isEnabled) === null || _a === void 0 ? void 0 : _a.call(tool, toolContext_1)) !== null && _b !== void 0 ? _b : true,
                            usageCount: 0,
                            lastUsed: 0,
                        });
                    });
                    return [2 /*return*/, {
                            success: true,
                            data: {
                                servers: servers,
                                tools: tools,
                            },
                        }];
                }
                catch (error) {
                    return [2 /*return*/, {
                            success: false,
                            error: "Initialization failed: ".concat(error.message),
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 处理添加服务器请求
     */
    MCPHandler.prototype.handleAddServer = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var name_1, description, url, _a, autoConnect, server;
            return __generator(this, function (_b) {
                try {
                    name_1 = data.name, description = data.description, url = data.url, _a = data.autoConnect, autoConnect = _a === void 0 ? true : _a;
                    if (!name_1 || !url) {
                        return [2 /*return*/, {
                                success: false,
                                error: 'Name and URL are required',
                            }];
                    }
                    server = {
                        id: "server-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9)),
                        name: name_1,
                        description: description || '',
                        url: url,
                        status: autoConnect ? 'connected' : 'disconnected',
                        lastConnected: autoConnect ? Date.now() : 0,
                        toolCount: 0,
                        settings: {
                            autoConnect: autoConnect,
                            enabled: true,
                        },
                    };
                    this.outputChannel.appendLine("\uD83D\uDCCB Added MCP server: ".concat(name_1, " (").concat(url, ")"));
                    return [2 /*return*/, {
                            success: true,
                            data: { server: server },
                        }];
                }
                catch (error) {
                    return [2 /*return*/, {
                            success: false,
                            error: "Failed to add server: ".concat(error.message),
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 处理移除服务器请求
     */
    MCPHandler.prototype.handleRemoveServer = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var serverId;
            return __generator(this, function (_a) {
                try {
                    serverId = data.serverId;
                    if (!serverId) {
                        return [2 /*return*/, {
                                success: false,
                                error: 'Server ID is required',
                            }];
                    }
                    this.outputChannel.appendLine("\uD83D\uDDD1\uFE0F Removing MCP server: ".concat(serverId));
                    return [2 /*return*/, {
                            success: true,
                        }];
                }
                catch (error) {
                    return [2 /*return*/, {
                            success: false,
                            error: "Failed to remove server: ".concat(error.message),
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 处理连接服务器请求
     */
    MCPHandler.prototype.handleConnectServer = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var serverId, tools, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        serverId = data.serverId;
                        if (!serverId) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Server ID is required',
                                }];
                        }
                        // 模拟连接服务器
                        this.outputChannel.appendLine("\uD83D\uDD0C Connecting to MCP server: ".concat(serverId));
                        return [4 /*yield*/, this.simulateServerTools(serverId)];
                    case 1:
                        tools = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                data: {
                                    tools: tools,
                                },
                            }];
                    case 2:
                        error_3 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: "Failed to connect server: ".concat(error_3.message),
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 处理断开服务器连接请求
     */
    MCPHandler.prototype.handleDisconnectServer = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var serverId;
            return __generator(this, function (_a) {
                try {
                    serverId = data.serverId;
                    if (!serverId) {
                        return [2 /*return*/, {
                                success: false,
                                error: 'Server ID is required',
                            }];
                    }
                    this.outputChannel.appendLine("\uD83D\uDD0C Disconnecting from MCP server: ".concat(serverId));
                    return [2 /*return*/, {
                            success: true,
                        }];
                }
                catch (error) {
                    return [2 /*return*/, {
                            success: false,
                            error: "Failed to disconnect server: ".concat(error.message),
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 处理切换工具状态请求
     */
    MCPHandler.prototype.handleToggleTool = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var toolId, enabled;
            return __generator(this, function (_a) {
                try {
                    toolId = data.toolId, enabled = data.enabled;
                    if (!toolId) {
                        return [2 /*return*/, {
                                success: false,
                                error: 'Tool ID is required',
                            }];
                    }
                    this.outputChannel.appendLine("\uD83D\uDD27 ".concat(enabled ? 'Enabling' : 'Disabling', " MCP tool: ").concat(toolId));
                    return [2 /*return*/, {
                            success: true,
                        }];
                }
                catch (error) {
                    return [2 /*return*/, {
                            success: false,
                            error: "Failed to toggle tool: ".concat(error.message),
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 处理执行工具请求
     */
    MCPHandler.prototype.handleExecuteTool = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, toolId, _a, params, toolRegistry, toolContext, result, duration, error_4, duration;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        startTime = Date.now();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        toolId = data.toolId, _a = data.params, params = _a === void 0 ? {} : _a;
                        if (!toolId) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Tool ID is required',
                                }];
                        }
                        startTime = Date.now();
                        this.outputChannel.appendLine("\uD83D\uDEE0\uFE0F Executing MCP tool: ".concat(toolId));
                        toolRegistry = this.taskEngine.getToolRegistry();
                        if (!toolRegistry) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Tool registry not available',
                                }];
                        }
                        toolContext = {
                            extensionContext: this.context,
                            workspaceRoot: this.taskEngine['workspaceRoot'],
                            cwd: process.cwd(),
                            outputChannel: this.outputChannel,
                            sessionId: "tool-exec-".concat(Date.now()),
                        };
                        return [4 /*yield*/, toolRegistry.executeTool(toolId, params, toolContext)];
                    case 2:
                        result = _b.sent();
                        duration = Date.now() - startTime;
                        this.outputChannel.appendLine("\u2705 MCP tool ".concat(toolId, " executed (").concat(duration, "ms)"));
                        return [2 /*return*/, {
                                success: result.success,
                                data: {
                                    output: result.output,
                                    duration: duration,
                                },
                                error: result.error,
                            }];
                    case 3:
                        error_4 = _b.sent();
                        duration = Date.now() - startTime;
                        this.outputChannel.appendLine("\u274C MCP tool execution failed: ".concat(error_4.message));
                        return [2 /*return*/, {
                                success: false,
                                error: "Tool execution failed: ".concat(error_4.message),
                                data: {
                                    duration: duration,
                                },
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 处理刷新请求
     */
    MCPHandler.prototype.handleRefresh = function () {
        return __awaiter(this, void 0, void 0, function () {
            var initResponse, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.handleInitialize()];
                    case 1:
                        initResponse = _a.sent();
                        if (initResponse.success) {
                            this.outputChannel.appendLine('🔄 MCP data refreshed');
                        }
                        return [2 /*return*/, initResponse];
                    case 2:
                        error_5 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: "Refresh failed: ".concat(error_5.message),
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 处理获取工具请求
     */
    MCPHandler.prototype.handleGetTools = function () {
        return __awaiter(this, void 0, void 0, function () {
            var initResponse, error_6;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.handleInitialize()];
                    case 1:
                        initResponse = _b.sent();
                        if (initResponse.success) {
                            return [2 /*return*/, {
                                    success: true,
                                    data: {
                                        tools: ((_a = initResponse.data) === null || _a === void 0 ? void 0 : _a.tools) || [],
                                    },
                                }];
                        }
                        return [2 /*return*/, initResponse];
                    case 2:
                        error_6 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: "Failed to get tools: ".concat(error_6.message),
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 处理获取服务器请求
     */
    MCPHandler.prototype.handleGetServers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var initResponse, error_7;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.handleInitialize()];
                    case 1:
                        initResponse = _b.sent();
                        if (initResponse.success) {
                            return [2 /*return*/, {
                                    success: true,
                                    data: {
                                        servers: ((_a = initResponse.data) === null || _a === void 0 ? void 0 : _a.servers) || [],
                                    },
                                }];
                        }
                        return [2 /*return*/, initResponse];
                    case 2:
                        error_7 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: "Failed to get servers: ".concat(error_7.message),
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 模拟服务器工具（用于测试）
     */
    MCPHandler.prototype.simulateServerTools = function (serverId) {
        return __awaiter(this, void 0, void 0, function () {
            var mockTools;
            return __generator(this, function (_a) {
                mockTools = [
                    {
                        id: "tool-file-read-".concat(serverId),
                        name: 'File Reader',
                        description: 'Read and analyze files',
                        version: '1.0.0',
                        serverId: serverId,
                        capabilities: ['file', 'read', 'analysis'],
                        enabled: true,
                        usageCount: 0,
                        lastUsed: 0,
                    },
                    {
                        id: "tool-code-analyze-".concat(serverId),
                        name: 'Code Analyzer',
                        description: 'Analyze code structure and dependencies',
                        version: '1.0.0',
                        serverId: serverId,
                        capabilities: ['code', 'analysis', 'dependencies'],
                        enabled: true,
                        usageCount: 0,
                        lastUsed: 0,
                    },
                    {
                        id: "tool-web-search-".concat(serverId),
                        name: 'Web Search',
                        description: 'Search the web for information',
                        version: '1.0.0',
                        serverId: serverId,
                        capabilities: ['web', 'search', 'information'],
                        enabled: true,
                        usageCount: 0,
                        lastUsed: 0,
                    },
                ];
                return [2 /*return*/, mockTools];
            });
        });
    };
    /**
     * 获取处理器状态
     */
    MCPHandler.prototype.getStatus = function () {
        var _a;
        return {
            isInitialized: this.isInitialized,
            toolSystemReady: ((_a = this.taskEngine) === null || _a === void 0 ? void 0 : _a.getToolSystemStatus().isReady) || false,
        };
    };
    /**
     * 清理资源
     */
    MCPHandler.prototype.dispose = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.taskEngine) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.taskEngine.dispose()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.outputChannel.dispose();
                        return [2 /*return*/];
                }
            });
        });
    };
    return MCPHandler;
}());
exports.MCPHandler = MCPHandler;
