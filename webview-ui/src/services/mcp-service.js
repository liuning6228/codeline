"use strict";
/**
 * MCP服务
 * 提供前端与后端MCP工具系统的通信接口
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
exports.McpService = void 0;
var vscode_1 = require("../lib/vscode");
/**
 * MCP服务类
 */
var McpService = /** @class */ (function () {
    function McpService() {
        this.servers = [];
        this.tools = [];
        this.isInitialized = false;
    }
    /**
     * 获取单例实例
     */
    McpService.getInstance = function () {
        if (!McpService.instance) {
            McpService.instance = new McpService();
        }
        return McpService.instance;
    };
    /**
     * 初始化MCP服务
     */
    McpService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isInitialized) {
                            return [2 /*return*/, true];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, vscode_1.vscode.postMessage({
                                type: 'mcp_initialize',
                                data: {},
                            })];
                    case 2:
                        response = _a.sent();
                        if (response.success) {
                            this.servers = response.servers || [];
                            this.tools = response.tools || [];
                            this.isInitialized = true;
                            console.log('MCP Service initialized:', {
                                serverCount: this.servers.length,
                                toolCount: this.tools.length,
                            });
                            return [2 /*return*/, true];
                        }
                        else {
                            console.error('MCP Service initialization failed:', response.error);
                            return [2 /*return*/, false];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('MCP Service initialization error:', error_1);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取所有MCP服务器
     */
    McpService.prototype.getServers = function () {
        return this.servers;
    };
    /**
     * 获取所有MCP工具
     */
    McpService.prototype.getTools = function () {
        return this.tools;
    };
    /**
     * 获取指定服务器的工具
     */
    McpService.prototype.getToolsByServer = function (serverId) {
        return this.tools.filter(function (tool) { return tool.serverId === serverId; });
    };
    /**
     * 获取可用工具（启用的）
     */
    McpService.prototype.getAvailableTools = function () {
        return this.tools.filter(function (tool) { return tool.enabled; });
    };
    /**
     * 获取工具信息
     */
    McpService.prototype.getTool = function (toolId) {
        return this.tools.find(function (tool) { return tool.id === toolId; });
    };
    /**
     * 获取服务器信息
     */
    McpService.prototype.getServer = function (serverId) {
        return this.servers.find(function (server) { return server.id === serverId; });
    };
    /**
     * 添加MCP服务器
     */
    McpService.prototype.addServer = function (serverConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, vscode_1.vscode.postMessage({
                                type: 'mcp_add_server',
                                data: serverConfig,
                            })];
                    case 1:
                        response = _a.sent();
                        if (response.success && response.server) {
                            this.servers.push(response.server);
                            return [2 /*return*/, true];
                        }
                        return [2 /*return*/, false];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Failed to add MCP server:', error_2);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除MCP服务器
     */
    McpService.prototype.removeServer = function (serverId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, vscode_1.vscode.postMessage({
                                type: 'mcp_remove_server',
                                data: { serverId: serverId },
                            })];
                    case 1:
                        response = _a.sent();
                        if (response.success) {
                            this.servers = this.servers.filter(function (server) { return server.id !== serverId; });
                            this.tools = this.tools.filter(function (tool) { return tool.serverId !== serverId; });
                            return [2 /*return*/, true];
                        }
                        return [2 /*return*/, false];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Failed to remove MCP server:', error_3);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 连接服务器
     */
    McpService.prototype.connectServer = function (serverId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, server, error_4;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, vscode_1.vscode.postMessage({
                                type: 'mcp_connect_server',
                                data: { serverId: serverId },
                            })];
                    case 1:
                        response = _b.sent();
                        if (response.success) {
                            server = this.servers.find(function (s) { return s.id === serverId; });
                            if (server) {
                                server.status = 'connected';
                                server.lastConnected = Date.now();
                                // 更新工具列表
                                if (response.tools) {
                                    this.tools = this.tools.filter(function (tool) { return tool.serverId !== serverId; });
                                    (_a = this.tools).push.apply(_a, response.tools);
                                }
                            }
                            return [2 /*return*/, true];
                        }
                        return [2 /*return*/, false];
                    case 2:
                        error_4 = _b.sent();
                        console.error('Failed to connect MCP server:', error_4);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 断开服务器连接
     */
    McpService.prototype.disconnectServer = function (serverId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, server, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, vscode_1.vscode.postMessage({
                                type: 'mcp_disconnect_server',
                                data: { serverId: serverId },
                            })];
                    case 1:
                        response = _a.sent();
                        if (response.success) {
                            server = this.servers.find(function (s) { return s.id === serverId; });
                            if (server) {
                                server.status = 'disconnected';
                            }
                            return [2 /*return*/, true];
                        }
                        return [2 /*return*/, false];
                    case 2:
                        error_5 = _a.sent();
                        console.error('Failed to disconnect MCP server:', error_5);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 启用/禁用工具
     */
    McpService.prototype.toggleTool = function (toolId, enabled) {
        return __awaiter(this, void 0, void 0, function () {
            var response, tool, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, vscode_1.vscode.postMessage({
                                type: 'mcp_toggle_tool',
                                data: { toolId: toolId, enabled: enabled },
                            })];
                    case 1:
                        response = _a.sent();
                        if (response.success) {
                            tool = this.tools.find(function (t) { return t.id === toolId; });
                            if (tool) {
                                tool.enabled = enabled;
                            }
                            return [2 /*return*/, true];
                        }
                        return [2 /*return*/, false];
                    case 2:
                        error_6 = _a.sent();
                        console.error('Failed to toggle MCP tool:', error_6);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 执行MCP工具
     */
    McpService.prototype.executeTool = function (toolId_1) {
        return __awaiter(this, arguments, void 0, function (toolId, params) {
            var response, tool, error_7;
            if (params === void 0) { params = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, vscode_1.vscode.postMessage({
                                type: 'mcp_execute_tool',
                                data: { toolId: toolId, params: params },
                            })];
                    case 1:
                        response = _a.sent();
                        if (response.success) {
                            tool = this.tools.find(function (t) { return t.id === toolId; });
                            if (tool) {
                                tool.usageCount++;
                                tool.lastUsed = Date.now();
                            }
                            return [2 /*return*/, {
                                    success: true,
                                    output: response.output,
                                    duration: response.duration || 0,
                                    toolId: toolId,
                                }];
                        }
                        else {
                            return [2 /*return*/, {
                                    success: false,
                                    error: response.error || 'Tool execution failed',
                                    duration: response.duration || 0,
                                    toolId: toolId,
                                }];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_7.message || 'Unknown error',
                                duration: 0,
                                toolId: toolId,
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 刷新工具列表
     */
    McpService.prototype.refresh = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, vscode_1.vscode.postMessage({
                                type: 'mcp_refresh',
                                data: {},
                            })];
                    case 1:
                        response = _a.sent();
                        if (response.success) {
                            this.servers = response.servers || [];
                            this.tools = response.tools || [];
                            return [2 /*return*/, true];
                        }
                        return [2 /*return*/, false];
                    case 2:
                        error_8 = _a.sent();
                        console.error('Failed to refresh MCP data:', error_8);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 搜索工具
     */
    McpService.prototype.searchTools = function (query) {
        if (!query.trim()) {
            return this.tools;
        }
        var queryLower = query.toLowerCase();
        return this.tools.filter(function (tool) {
            return tool.name.toLowerCase().includes(queryLower) ||
                tool.description.toLowerCase().includes(queryLower) ||
                tool.capabilities.some(function (cap) { return cap.toLowerCase().includes(queryLower); });
        });
    };
    /**
     * 获取服务状态
     */
    McpService.prototype.getStatus = function () {
        return {
            initialized: this.isInitialized,
            serverCount: this.servers.length,
            toolCount: this.tools.length,
            availableToolCount: this.getAvailableTools().length,
        };
    };
    return McpService;
}());
exports.McpService = McpService;
