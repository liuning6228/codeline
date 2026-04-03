"use strict";
/**
 * 示例MCP插件
 * 展示如何创建和使用MCP插件
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
exports.ExampleMCPPlugin = void 0;
/**
 * 示例MCP插件
 */
var ExampleMCPPlugin = /** @class */ (function () {
    function ExampleMCPPlugin() {
        this.context = null;
        this.servers = new Map();
        this.connectedServers = new Set();
        this.metadata = {
            id: 'example-mcp-plugin',
            name: '示例MCP插件',
            description: '一个展示MCP插件功能的示例插件',
            version: '1.0.0',
            author: 'CodeLine Team',
            categories: ['examples', 'mcp', 'servers'],
            keywords: ['example', 'mcp', 'server', 'demo'],
        };
        this.configSchema = {
            fields: {
                enableMockServer: {
                    type: 'boolean',
                    description: '是否启用模拟MCP服务器',
                    default: true,
                },
                mockServerPort: {
                    type: 'number',
                    description: '模拟服务器端口',
                    default: 8080,
                },
                autoConnectServers: {
                    type: 'boolean',
                    description: '是否自动连接服务器',
                    default: true,
                },
                debugMode: {
                    type: 'boolean',
                    description: '是否启用调试模式',
                    default: false,
                },
            },
        };
        this.config = {
            enableMockServer: true,
            mockServerPort: 8080,
            autoConnectServers: true,
            debugMode: false,
        };
    }
    /**
     * 插件激活
     */
    ExampleMCPPlugin.prototype.activate = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.context = context;
                        // 合并配置
                        this.config = __assign(__assign({}, this.config), context.config);
                        context.outputChannel.show(true);
                        context.outputChannel.appendLine('🚀 Activating Example MCP Plugin...');
                        if (!this.config.enableMockServer) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initializeMockServers()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        context.outputChannel.appendLine('✅ Example MCP Plugin activated');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 插件停用
     */
    ExampleMCPPlugin.prototype.deactivate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, serverId, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.context) {
                            this.context.outputChannel.appendLine('⏸️ Deactivating Example MCP Plugin...');
                        }
                        _i = 0, _a = this.connectedServers;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        serverId = _a[_i];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.disconnectMCPServer(serverId)];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _b.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        this.connectedServers.clear();
                        this.servers.clear();
                        if (this.context) {
                            this.context.outputChannel.appendLine('✅ Example MCP Plugin deactivated');
                        }
                        this.context = null;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取工具
     */
    ExampleMCPPlugin.prototype.getTools = function () {
        // MCP插件不直接提供工具，工具由MCP服务器提供
        return [];
    };
    /**
     * 获取工具定义
     */
    ExampleMCPPlugin.prototype.getToolDefinitions = function () {
        // MCP插件不直接提供工具定义
        return [];
    };
    /**
     * 获取MCP服务器列表
     */
    ExampleMCPPlugin.prototype.getMCPServers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var servers;
            return __generator(this, function (_a) {
                servers = [];
                // 添加模拟服务器
                if (this.config.enableMockServer) {
                    servers.push({
                        id: 'mock-server-1',
                        name: '模拟MCP服务器 1',
                        description: '一个用于演示的模拟MCP服务器',
                        version: '1.0.0',
                        configuration: {
                            host: 'localhost',
                            port: this.config.mockServerPort,
                            protocol: 'ws',
                        },
                        enabled: true,
                        tools: [
                            {
                                id: 'mock-tool-1',
                                name: '模拟工具 1',
                                description: '返回当前时间和日期',
                            },
                            {
                                id: 'mock-tool-2',
                                name: '模拟工具 2',
                                description: '生成随机数据',
                            },
                            {
                                id: 'mock-tool-3',
                                name: '模拟工具 3',
                                description: '执行模拟计算',
                            },
                        ],
                    });
                    servers.push({
                        id: 'mock-server-2',
                        name: '模拟MCP服务器 2',
                        description: '另一个用于演示的模拟MCP服务器',
                        version: '1.0.0',
                        configuration: {
                            host: 'localhost',
                            port: this.config.mockServerPort + 1,
                            protocol: 'http',
                        },
                        enabled: false,
                        tools: [
                            {
                                id: 'mock-tool-a',
                                name: '模拟工具 A',
                                description: '模拟数据分析工具',
                            },
                            {
                                id: 'mock-tool-b',
                                name: '模拟工具 B',
                                description: '模拟机器学习工具',
                            },
                        ],
                    });
                }
                return [2 /*return*/, servers];
            });
        });
    };
    /**
     * 连接MCP服务器
     */
    ExampleMCPPlugin.prototype.connectMCPServer = function (serverId, configuration) {
        return __awaiter(this, void 0, void 0, function () {
            var server;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.context) {
                            throw new Error('Plugin not activated');
                        }
                        server = this.servers.get(serverId);
                        if (!server) {
                            throw new Error("Server ".concat(serverId, " not found"));
                        }
                        this.context.outputChannel.appendLine("\uD83D\uDD0C Connecting to MCP server: ".concat(server.name, " (").concat(serverId, ")"));
                        // 模拟连接延迟
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                    case 1:
                        // 模拟连接延迟
                        _b.sent();
                        // 模拟连接逻辑
                        server.connected = true;
                        server.lastConnectTime = new Date();
                        this.servers.set(serverId, server);
                        this.connectedServers.add(serverId);
                        this.context.outputChannel.appendLine("\u2705 Connected to MCP server: ".concat(server.name));
                        // 模拟服务器握手和工具发现
                        if (this.config.debugMode) {
                            this.context.outputChannel.appendLine("\uD83D\uDCCA Server ".concat(server.name, " tools: ").concat(((_a = server.tools) === null || _a === void 0 ? void 0 : _a.length) || 0, " tools available"));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 断开MCP服务器
     */
    ExampleMCPPlugin.prototype.disconnectMCPServer = function (serverId) {
        return __awaiter(this, void 0, void 0, function () {
            var server;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.context) {
                            throw new Error('Plugin not activated');
                        }
                        server = this.servers.get(serverId);
                        if (!server) {
                            throw new Error("Server ".concat(serverId, " not found"));
                        }
                        this.context.outputChannel.appendLine("\uD83D\uDD0C Disconnecting from MCP server: ".concat(server.name, " (").concat(serverId, ")"));
                        // 模拟断开延迟
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 300); })];
                    case 1:
                        // 模拟断开延迟
                        _a.sent();
                        // 模拟断开逻辑
                        server.connected = false;
                        server.lastDisconnectTime = new Date();
                        this.servers.set(serverId, server);
                        this.connectedServers.delete(serverId);
                        this.context.outputChannel.appendLine("\u2705 Disconnected from MCP server: ".concat(server.name));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 启动MCP服务器
     */
    ExampleMCPPlugin.prototype.startMCPServer = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.context) {
                            throw new Error('Plugin not activated');
                        }
                        this.context.outputChannel.appendLine('🚀 Starting example MCP servers...');
                        // 模拟服务器启动
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 1:
                        // 模拟服务器启动
                        _a.sent();
                        this.context.outputChannel.appendLine('✅ Example MCP servers started');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 停止MCP服务器
     */
    ExampleMCPPlugin.prototype.stopMCPServer = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, serverId, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.context) {
                            throw new Error('Plugin not activated');
                        }
                        this.context.outputChannel.appendLine('⏹️ Stopping example MCP servers...');
                        _i = 0, _a = this.connectedServers;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        serverId = _a[_i];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.disconnectMCPServer(serverId)];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _b.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        this.context.outputChannel.appendLine('✅ Example MCP servers stopped');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 配置更新
     */
    ExampleMCPPlugin.prototype.updateConfig = function (newConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var oldConfig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        oldConfig = this.config;
                        this.config = __assign(__assign({}, oldConfig), newConfig);
                        if (!this.context) return [3 /*break*/, 4];
                        this.context.outputChannel.appendLine('⚙️ Example MCP Plugin config updated');
                        if (!(newConfig.enableMockServer !== oldConfig.enableMockServer)) return [3 /*break*/, 4];
                        if (!newConfig.enableMockServer) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initializeMockServers()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.stopMCPServer()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 健康检查
     */
    ExampleMCPPlugin.prototype.healthCheck = function () {
        return __awaiter(this, void 0, void 0, function () {
            var serverCount, connectedCount, healthy;
            return __generator(this, function (_a) {
                serverCount = this.servers.size;
                connectedCount = this.connectedServers.size;
                healthy = serverCount > 0;
                return [2 /*return*/, {
                        healthy: healthy,
                        message: healthy
                            ? "Example MCP Plugin is healthy (".concat(serverCount, " servers, ").concat(connectedCount, " connected)")
                            : 'Example MCP Plugin has no servers configured',
                        details: {
                            serverCount: serverCount,
                            connectedCount: connectedCount,
                            config: this.config,
                            servers: Array.from(this.servers.values()).map(function (server) { return ({
                                id: server.id,
                                name: server.name,
                                connected: server.connected,
                            }); }),
                        },
                    }];
            });
        });
    };
    // ========== 私有方法 ==========
    /**
     * 初始化模拟服务器
     */
    ExampleMCPPlugin.prototype.initializeMockServers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var servers, _i, servers_1, server, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.context) {
                            return [2 /*return*/];
                        }
                        this.context.outputChannel.appendLine('🔧 Initializing mock MCP servers...');
                        return [4 /*yield*/, this.getMCPServers()];
                    case 1:
                        servers = _a.sent();
                        _i = 0, servers_1 = servers;
                        _a.label = 2;
                    case 2:
                        if (!(_i < servers_1.length)) return [3 /*break*/, 7];
                        server = servers_1[_i];
                        this.servers.set(server.id, __assign(__assign({}, server), { connected: false, lastConnectTime: null, lastDisconnectTime: null }));
                        this.context.outputChannel.appendLine("\uD83D\uDCE1 Registered mock server: ".concat(server.name, " (").concat(server.id, ")"));
                        if (!(this.config.autoConnectServers && server.enabled)) return [3 /*break*/, 6];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.connectMCPServer(server.id, server.configuration)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_3 = _a.sent();
                        this.context.outputChannel.appendLine("\u26A0\uFE0F Failed to auto-connect server ".concat(server.id, ": ").concat(error_3));
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7:
                        this.context.outputChannel.appendLine("\u2705 Initialized ".concat(servers.length, " mock MCP servers"));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 执行模拟MCP工具
     * 仅供内部使用
     */
    ExampleMCPPlugin.prototype.executeMockTool = function (serverId, toolId, params) {
        return __awaiter(this, void 0, void 0, function () {
            var server, tool, _a, _b, operation, _c, a, _d, b, result;
            var _e;
            return __generator(this, function (_f) {
                server = this.servers.get(serverId);
                if (!server) {
                    throw new Error("Server ".concat(serverId, " not found"));
                }
                if (!server.connected) {
                    throw new Error("Server ".concat(serverId, " is not connected"));
                }
                tool = (_e = server.tools) === null || _e === void 0 ? void 0 : _e.find(function (t) { return t.id === toolId; });
                if (!tool) {
                    throw new Error("Tool ".concat(toolId, " not found on server ").concat(serverId));
                }
                // 模拟工具执行
                switch (toolId) {
                    case 'mock-tool-1':
                        return [2 /*return*/, {
                                success: true,
                                data: {
                                    toolId: toolId,
                                    serverId: serverId,
                                    result: {
                                        timestamp: new Date().toISOString(),
                                        date: new Date().toLocaleDateString(),
                                        time: new Date().toLocaleTimeString(),
                                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                                    },
                                },
                            }];
                    case 'mock-tool-2':
                        return [2 /*return*/, {
                                success: true,
                                data: {
                                    toolId: toolId,
                                    serverId: serverId,
                                    result: {
                                        randomNumber: Math.random(),
                                        randomString: Math.random().toString(36).substring(2, 10),
                                        randomBoolean: Math.random() > 0.5,
                                        randomArray: Array.from({ length: 5 }, function () { return Math.random(); }),
                                    },
                                },
                            }];
                    case 'mock-tool-3':
                        _a = params || {}, _b = _a.operation, operation = _b === void 0 ? 'add' : _b, _c = _a.a, a = _c === void 0 ? 0 : _c, _d = _a.b, b = _d === void 0 ? 0 : _d;
                        result = void 0;
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
                                result = b !== 0 ? a / b : NaN;
                                break;
                            default:
                                result = a + b;
                        }
                        return [2 /*return*/, {
                                success: true,
                                data: {
                                    toolId: toolId,
                                    serverId: serverId,
                                    result: {
                                        operation: operation,
                                        a: a,
                                        b: b,
                                        result: result,
                                        expression: "".concat(a, " ").concat(operation, " ").concat(b, " = ").concat(result),
                                    },
                                },
                            }];
                    default:
                        return [2 /*return*/, {
                                success: true,
                                data: {
                                    toolId: toolId,
                                    serverId: serverId,
                                    result: "Mock tool ".concat(toolId, " executed successfully"),
                                    params: params,
                                },
                            }];
                }
                return [2 /*return*/];
            });
        });
    };
    return ExampleMCPPlugin;
}());
exports.ExampleMCPPlugin = ExampleMCPPlugin;
