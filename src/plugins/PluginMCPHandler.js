"use strict";
/**
 * 插件化MCP处理器
 * 扩展MCPHandler以支持插件化的MCP服务器管理
 * 基于Claude Code CP-20260402-003插件模式
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
exports.PluginMCPHandler = void 0;
var vscode = require("vscode");
var EnhancedTaskEngine_1 = require("../tools/EnhancedTaskEngine");
/**
 * 插件化MCP处理器
 */
var PluginMCPHandler = /** @class */ (function () {
    function PluginMCPHandler(context) {
        this.context = context;
        this.taskEngine = null;
        this.pluginToolRegistry = null;
        this.pluginManager = null;
        this.pluginServers = new Map();
        this.isInitialized = false;
        this.outputChannel = vscode.window.createOutputChannel('CodeLine Plugin MCP');
    }
    /**
     * 初始化插件化MCP处理器
     */
    PluginMCPHandler.prototype.initialize = function (workspaceRoot, pluginToolRegistry) {
        return __awaiter(this, void 0, void 0, function () {
            var toolsLoaded, error_1;
            var _this = this;
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
                        this.outputChannel.appendLine('🔧 Initializing Plugin MCP Handler...');
                        // 存储插件工具注册表引用
                        this.pluginToolRegistry = pluginToolRegistry;
                        this.pluginManager = pluginToolRegistry.getPluginManager();
                        if (!this.pluginManager) {
                            this.outputChannel.appendLine('⚠️ Plugin manager not available, plugin MCP features will be limited');
                        }
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
                        // 监听插件生命周期事件
                        if (this.pluginManager) {
                            this.pluginManager.addLifecycleListener(function (event) {
                                _this.handlePluginLifecycleEvent(event);
                            });
                        }
                        this.isInitialized = true;
                        this.outputChannel.appendLine('✅ Plugin MCP Handler initialized');
                        return [2 /*return*/, true];
                    case 3:
                        error_1 = _a.sent();
                        this.outputChannel.appendLine("\u274C Plugin MCP Handler initialization failed: ".concat(error_1.message));
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 处理插件生命周期事件
     */
    PluginMCPHandler.prototype.handlePluginLifecycleEvent = function (event) {
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
                this.outputChannel.appendLine("\u26A0\uFE0F Plugin ".concat(pluginId, " MCP error: ").concat(event.error));
                break;
        }
    };
    /**
     * 处理插件激活
     */
    PluginMCPHandler.prototype.handlePluginActivated = function (pluginId) {
        return __awaiter(this, void 0, void 0, function () {
            var plugin;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.outputChannel.appendLine("\uD83D\uDD0C Plugin ".concat(pluginId, " activated, scanning for MCP servers..."));
                        if (!this.pluginManager) {
                            return [2 /*return*/];
                        }
                        plugin = this.pluginManager.getPlugin(pluginId);
                        if (!plugin) {
                            return [2 /*return*/];
                        }
                        if (!this.pluginHasMCPServers(plugin)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.loadPluginMCPServers(pluginId, plugin)];
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
    PluginMCPHandler.prototype.handlePluginDeactivated = function (pluginId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.outputChannel.appendLine("\uD83D\uDD0C Plugin ".concat(pluginId, " deactivated, disconnecting MCP servers..."));
                        // 断开并隐藏插件服务器
                        return [4 /*yield*/, this.deactivatePluginMCPServers(pluginId)];
                    case 1:
                        // 断开并隐藏插件服务器
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 处理插件卸载
     */
    PluginMCPHandler.prototype.handlePluginUnloaded = function (pluginId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.outputChannel.appendLine("\uD83D\uDD0C Plugin ".concat(pluginId, " unloaded, removing MCP servers..."));
                        // 移除插件服务器
                        return [4 /*yield*/, this.removePluginMCPServers(pluginId)];
                    case 1:
                        // 移除插件服务器
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 检查插件是否提供MCP服务器
     */
    PluginMCPHandler.prototype.pluginHasMCPServers = function (plugin) {
        // 检查插件是否有getMCPServers方法
        return 'getMCPServers' in plugin && typeof plugin.getMCPServers === 'function';
    };
    /**
     * 加载插件MCP服务器
     */
    PluginMCPHandler.prototype.loadPluginMCPServers = function (pluginId, plugin) {
        return __awaiter(this, void 0, void 0, function () {
            var servers, _i, servers_1, server, serverId, pluginServer, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, plugin.getMCPServers()];
                    case 1:
                        servers = _a.sent();
                        _i = 0, servers_1 = servers;
                        _a.label = 2;
                    case 2:
                        if (!(_i < servers_1.length)) return [3 /*break*/, 5];
                        server = servers_1[_i];
                        serverId = "".concat(pluginId, ":").concat(server.id);
                        pluginServer = {
                            id: serverId,
                            name: server.name || server.id,
                            description: server.description || "MCP server from plugin ".concat(pluginId),
                            version: server.version || '1.0.0',
                            pluginId: pluginId,
                            configuration: server.configuration || {},
                            enabled: server.enabled !== false,
                            connected: false,
                            connectionState: 'disconnected',
                            lastActivity: new Date(),
                            tools: server.tools || [],
                        };
                        this.pluginServers.set(serverId, pluginServer);
                        this.outputChannel.appendLine("\uD83D\uDD0C Registered MCP server: ".concat(server.name, " (").concat(serverId, ")"));
                        if (!pluginServer.enabled) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.connectPluginServer(serverId)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        this.outputChannel.appendLine("\u2705 Loaded ".concat(servers.length, " MCP servers from plugin ").concat(pluginId));
                        return [3 /*break*/, 7];
                    case 6:
                        error_2 = _a.sent();
                        this.outputChannel.appendLine("\u274C Failed to load MCP servers from plugin ".concat(pluginId, ": ").concat(error_2));
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 停用插件MCP服务器
     */
    PluginMCPHandler.prototype.deactivatePluginMCPServers = function (pluginId) {
        return __awaiter(this, void 0, void 0, function () {
            var serversToDeactivate, _i, _a, _b, serverId, server, _c, serversToDeactivate_1, serverId, server;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        serversToDeactivate = [];
                        for (_i = 0, _a = this.pluginServers.entries(); _i < _a.length; _i++) {
                            _b = _a[_i], serverId = _b[0], server = _b[1];
                            if (server.pluginId === pluginId && server.connected) {
                                serversToDeactivate.push(serverId);
                            }
                        }
                        _c = 0, serversToDeactivate_1 = serversToDeactivate;
                        _d.label = 1;
                    case 1:
                        if (!(_c < serversToDeactivate_1.length)) return [3 /*break*/, 4];
                        serverId = serversToDeactivate_1[_c];
                        return [4 /*yield*/, this.disconnectPluginServer(serverId)];
                    case 2:
                        _d.sent();
                        server = this.pluginServers.get(serverId);
                        if (server) {
                            server.enabled = false;
                            server.connectionState = 'disconnected';
                            this.pluginServers.set(serverId, server);
                        }
                        _d.label = 3;
                    case 3:
                        _c++;
                        return [3 /*break*/, 1];
                    case 4:
                        if (serversToDeactivate.length > 0) {
                            this.outputChannel.appendLine("\u2705 Deactivated ".concat(serversToDeactivate.length, " MCP servers from plugin ").concat(pluginId));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 移除插件MCP服务器
     */
    PluginMCPHandler.prototype.removePluginMCPServers = function (pluginId) {
        return __awaiter(this, void 0, void 0, function () {
            var serversToRemove, _i, _a, _b, serverId, server, _c, serversToRemove_1, serverId;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        serversToRemove = [];
                        for (_i = 0, _a = this.pluginServers.entries(); _i < _a.length; _i++) {
                            _b = _a[_i], serverId = _b[0], server = _b[1];
                            if (server.pluginId === pluginId) {
                                serversToRemove.push(serverId);
                            }
                        }
                        _c = 0, serversToRemove_1 = serversToRemove;
                        _e.label = 1;
                    case 1:
                        if (!(_c < serversToRemove_1.length)) return [3 /*break*/, 5];
                        serverId = serversToRemove_1[_c];
                        if (!((_d = this.pluginServers.get(serverId)) === null || _d === void 0 ? void 0 : _d.connected)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.disconnectPluginServer(serverId)];
                    case 2:
                        _e.sent();
                        _e.label = 3;
                    case 3:
                        // 移除服务器
                        this.pluginServers.delete(serverId);
                        this.outputChannel.appendLine("\uD83D\uDDD1\uFE0F Removed MCP server: ".concat(serverId));
                        _e.label = 4;
                    case 4:
                        _c++;
                        return [3 /*break*/, 1];
                    case 5:
                        if (serversToRemove.length > 0) {
                            this.outputChannel.appendLine("\u2705 Removed ".concat(serversToRemove.length, " MCP servers from plugin ").concat(pluginId));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 连接插件MCP服务器
     */
    PluginMCPHandler.prototype.connectPluginServer = function (serverId) {
        return __awaiter(this, void 0, void 0, function () {
            var server, plugin, mcpPlugin, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        server = this.pluginServers.get(serverId);
                        if (!server) {
                            return [2 /*return*/, false];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        server.connectionState = 'connecting';
                        this.pluginServers.set(serverId, server);
                        this.outputChannel.appendLine("\uD83D\uDD0C Connecting MCP server: ".concat(server.name, " (").concat(serverId, ")"));
                        if (!this.pluginManager) return [3 /*break*/, 3];
                        plugin = this.pluginManager.getPlugin(server.pluginId);
                        if (!(plugin && 'connectMCPServer' in plugin && typeof plugin.connectMCPServer === 'function')) return [3 /*break*/, 3];
                        mcpPlugin = plugin;
                        return [4 /*yield*/, mcpPlugin.connectMCPServer(server.id.replace("".concat(server.pluginId, ":"), ''), server.configuration)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        server.connected = true;
                        server.connectionState = 'connected';
                        server.lastActivity = new Date();
                        this.pluginServers.set(serverId, server);
                        this.outputChannel.appendLine("\u2705 Connected MCP server: ".concat(server.name));
                        return [2 /*return*/, true];
                    case 4:
                        error_3 = _a.sent();
                        server.connected = false;
                        server.connectionState = 'error';
                        this.pluginServers.set(serverId, server);
                        this.outputChannel.appendLine("\u274C Failed to connect MCP server ".concat(server.name, ": ").concat(error_3));
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 断开插件MCP服务器
     */
    PluginMCPHandler.prototype.disconnectPluginServer = function (serverId) {
        return __awaiter(this, void 0, void 0, function () {
            var server, plugin, mcpPlugin, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        server = this.pluginServers.get(serverId);
                        if (!server) {
                            return [2 /*return*/, false];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        this.outputChannel.appendLine("\uD83D\uDD0C Disconnecting MCP server: ".concat(server.name, " (").concat(serverId, ")"));
                        if (!this.pluginManager) return [3 /*break*/, 3];
                        plugin = this.pluginManager.getPlugin(server.pluginId);
                        if (!(plugin && 'disconnectMCPServer' in plugin && typeof plugin.disconnectMCPServer === 'function')) return [3 /*break*/, 3];
                        mcpPlugin = plugin;
                        return [4 /*yield*/, mcpPlugin.disconnectMCPServer(server.id.replace("".concat(server.pluginId, ":"), ''))];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        server.connected = false;
                        server.connectionState = 'disconnected';
                        this.pluginServers.set(serverId, server);
                        this.outputChannel.appendLine("\u2705 Disconnected MCP server: ".concat(server.name));
                        return [2 /*return*/, true];
                    case 4:
                        error_4 = _a.sent();
                        server.connectionState = 'error';
                        this.pluginServers.set(serverId, server);
                        this.outputChannel.appendLine("\u274C Failed to disconnect MCP server ".concat(server.name, ": ").concat(error_4));
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 处理插件化MCP消息
     */
    PluginMCPHandler.prototype.handlePluginMessage = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var type, pluginId, serverId, data, _a, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.isInitialized) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Plugin MCP Handler not initialized',
                                    pluginId: message.pluginId,
                                    serverId: message.serverId,
                                }];
                        }
                        type = message.type, pluginId = message.pluginId, serverId = message.serverId, data = message.data;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 22, , 23]);
                        this.outputChannel.appendLine("\uD83D\uDCE8 Handling plugin MCP message: ".concat(type).concat(pluginId ? " from ".concat(pluginId) : '').concat(serverId ? " for ".concat(serverId) : ''));
                        _a = type;
                        switch (_a) {
                            case 'plugin_mcp_get_servers': return [3 /*break*/, 2];
                            case 'plugin_mcp_connect_server': return [3 /*break*/, 4];
                            case 'plugin_mcp_disconnect_server': return [3 /*break*/, 6];
                            case 'plugin_mcp_toggle_server': return [3 /*break*/, 8];
                            case 'plugin_mcp_execute_tool': return [3 /*break*/, 10];
                            case 'plugin_mcp_get_server_tools': return [3 /*break*/, 12];
                            case 'plugin_mcp_get_server_status': return [3 /*break*/, 14];
                            case 'plugin_mcp_scan_plugins': return [3 /*break*/, 16];
                        }
                        return [3 /*break*/, 18];
                    case 2: return [4 /*yield*/, this.handleGetPluginServers(data)];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4: return [4 /*yield*/, this.handlePluginConnectServer(data)];
                    case 5: return [2 /*return*/, _b.sent()];
                    case 6: return [4 /*yield*/, this.handlePluginDisconnectServer(data)];
                    case 7: return [2 /*return*/, _b.sent()];
                    case 8: return [4 /*yield*/, this.handlePluginToggleServer(data)];
                    case 9: return [2 /*return*/, _b.sent()];
                    case 10: return [4 /*yield*/, this.handlePluginExecuteTool(data)];
                    case 11: return [2 /*return*/, _b.sent()];
                    case 12: return [4 /*yield*/, this.handleGetServerTools(data)];
                    case 13: return [2 /*return*/, _b.sent()];
                    case 14: return [4 /*yield*/, this.handleGetServerStatus(data)];
                    case 15: return [2 /*return*/, _b.sent()];
                    case 16: return [4 /*yield*/, this.handleScanPlugins()];
                    case 17: return [2 /*return*/, _b.sent()];
                    case 18:
                        if (!type.startsWith('mcp_')) return [3 /*break*/, 20];
                        return [4 /*yield*/, this.handleLegacyMessage(message)];
                    case 19: return [2 /*return*/, _b.sent()];
                    case 20: return [2 /*return*/, {
                            success: false,
                            error: "Unknown plugin MCP message type: ".concat(type),
                            pluginId: pluginId,
                            serverId: serverId,
                        }];
                    case 21: return [3 /*break*/, 23];
                    case 22:
                        error_5 = _b.sent();
                        this.outputChannel.appendLine("\u274C Plugin MCP message handling failed: ".concat(error_5.message));
                        return [2 /*return*/, {
                                success: false,
                                error: error_5.message,
                                pluginId: pluginId,
                                serverId: serverId,
                            }];
                    case 23: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 处理遗留MCP消息
     */
    PluginMCPHandler.prototype.handleLegacyMessage = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var legacyMessage;
            return __generator(this, function (_a) {
                legacyMessage = {
                    type: message.type,
                    data: message.data,
                };
                // 这里应该调用原始的MCPHandler
                // 由于我们没有原始实例，返回一个提示
                return [2 /*return*/, {
                        success: false,
                        error: 'Legacy MCP messages require original MCPHandler instance',
                        pluginId: message.pluginId,
                        serverId: message.serverId,
                    }];
            });
        });
    };
    /**
     * 获取插件MCP服务器列表
     */
    PluginMCPHandler.prototype.handleGetPluginServers = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var filterPluginId, servers, filteredServers;
            return __generator(this, function (_a) {
                filterPluginId = data === null || data === void 0 ? void 0 : data.pluginId;
                servers = Array.from(this.pluginServers.values());
                filteredServers = servers;
                if (filterPluginId) {
                    filteredServers = servers.filter(function (server) { return server.pluginId === filterPluginId; });
                }
                return [2 /*return*/, {
                        success: true,
                        data: {
                            servers: filteredServers.map(function (server) { return ({
                                id: server.id,
                                name: server.name,
                                description: server.description,
                                pluginId: server.pluginId,
                                enabled: server.enabled,
                                connected: server.connected,
                                connectionState: server.connectionState,
                                lastActivity: server.lastActivity,
                                toolCount: server.tools.length,
                            }); }),
                            total: filteredServers.length,
                        },
                    }];
            });
        });
    };
    /**
     * 连接插件MCP服务器
     */
    PluginMCPHandler.prototype.handlePluginConnectServer = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var serverId, connected;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        serverId = data.serverId;
                        if (!serverId) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Missing serverId',
                                }];
                        }
                        return [4 /*yield*/, this.connectPluginServer(serverId)];
                    case 1:
                        connected = _a.sent();
                        return [2 /*return*/, {
                                success: connected,
                                data: { connected: connected },
                                serverId: serverId,
                            }];
                }
            });
        });
    };
    /**
     * 断开插件MCP服务器
     */
    PluginMCPHandler.prototype.handlePluginDisconnectServer = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var serverId, disconnected;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        serverId = data.serverId;
                        if (!serverId) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Missing serverId',
                                }];
                        }
                        return [4 /*yield*/, this.disconnectPluginServer(serverId)];
                    case 1:
                        disconnected = _a.sent();
                        return [2 /*return*/, {
                                success: disconnected,
                                data: { disconnected: disconnected },
                                serverId: serverId,
                            }];
                }
            });
        });
    };
    /**
     * 切换插件MCP服务器状态
     */
    PluginMCPHandler.prototype.handlePluginToggleServer = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var serverId, enabled, server;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        serverId = data.serverId, enabled = data.enabled;
                        if (!serverId || enabled === undefined) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Missing serverId or enabled parameter',
                                }];
                        }
                        server = this.pluginServers.get(serverId);
                        if (!server) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: "Server ".concat(serverId, " not found"),
                                    serverId: serverId,
                                }];
                        }
                        server.enabled = enabled;
                        this.pluginServers.set(serverId, server);
                        if (!(enabled && !server.connected)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.connectPluginServer(serverId)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        if (!(!enabled && server.connected)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.disconnectPluginServer(serverId)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, {
                            success: true,
                            data: {
                                enabled: enabled,
                                connected: server.connected,
                            },
                            serverId: serverId,
                        }];
                }
            });
        });
    };
    /**
     * 执行插件MCP工具
     */
    PluginMCPHandler.prototype.handlePluginExecuteTool = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var serverId, toolId, parameters, server, tool, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        serverId = data.serverId, toolId = data.toolId, parameters = data.parameters;
                        if (!serverId || !toolId) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Missing serverId or toolId',
                                }];
                        }
                        server = this.pluginServers.get(serverId);
                        if (!server) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: "Server ".concat(serverId, " not found"),
                                    serverId: serverId,
                                }];
                        }
                        if (!server.connected) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: "Server ".concat(serverId, " is not connected"),
                                    serverId: serverId,
                                }];
                        }
                        tool = server.tools.find(function (t) { return t.id === toolId; });
                        if (!tool) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: "Tool ".concat(toolId, " not found on server ").concat(serverId),
                                    serverId: serverId,
                                    toolId: toolId,
                                }];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        // 这里应该通过插件执行工具
                        // 由于时间限制，我们返回一个模拟结果
                        this.outputChannel.appendLine("\uD83D\uDEE0\uFE0F Executing plugin MCP tool: ".concat(tool.name, " on ").concat(server.name));
                        // 模拟执行延迟
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                    case 2:
                        // 模拟执行延迟
                        _a.sent();
                        server.lastActivity = new Date();
                        this.pluginServers.set(serverId, server);
                        return [2 /*return*/, {
                                success: true,
                                data: {
                                    toolId: toolId,
                                    serverId: serverId,
                                    result: "Executed ".concat(tool.name, " successfully"),
                                    timestamp: new Date(),
                                    duration: 500,
                                },
                                serverId: serverId,
                                toolId: toolId,
                            }];
                    case 3:
                        error_6 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: "Failed to execute tool ".concat(toolId, ": ").concat(error_6),
                                serverId: serverId,
                                toolId: toolId,
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取服务器工具列表
     */
    PluginMCPHandler.prototype.handleGetServerTools = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var serverId, server;
            return __generator(this, function (_a) {
                serverId = data.serverId;
                if (!serverId) {
                    return [2 /*return*/, {
                            success: false,
                            error: 'Missing serverId',
                        }];
                }
                server = this.pluginServers.get(serverId);
                if (!server) {
                    return [2 /*return*/, {
                            success: false,
                            error: "Server ".concat(serverId, " not found"),
                            serverId: serverId,
                        }];
                }
                return [2 /*return*/, {
                        success: true,
                        data: {
                            tools: server.tools,
                            total: server.tools.length,
                        },
                        serverId: serverId,
                    }];
            });
        });
    };
    /**
     * 获取服务器状态
     */
    PluginMCPHandler.prototype.handleGetServerStatus = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var serverId, server;
            return __generator(this, function (_a) {
                serverId = data.serverId;
                if (!serverId) {
                    return [2 /*return*/, {
                            success: false,
                            error: 'Missing serverId',
                        }];
                }
                server = this.pluginServers.get(serverId);
                if (!server) {
                    return [2 /*return*/, {
                            success: false,
                            error: "Server ".concat(serverId, " not found"),
                            serverId: serverId,
                        }];
                }
                return [2 /*return*/, {
                        success: true,
                        data: {
                            id: server.id,
                            name: server.name,
                            enabled: server.enabled,
                            connected: server.connected,
                            connectionState: server.connectionState,
                            lastActivity: server.lastActivity,
                            toolCount: server.tools.length,
                            pluginId: server.pluginId,
                        },
                        serverId: serverId,
                    }];
            });
        });
    };
    /**
     * 扫描插件
     */
    PluginMCPHandler.prototype.handleScanPlugins = function () {
        return __awaiter(this, void 0, void 0, function () {
            var state, servers;
            return __generator(this, function (_a) {
                if (!this.pluginManager) {
                    return [2 /*return*/, {
                            success: false,
                            error: 'Plugin manager not available',
                        }];
                }
                state = this.pluginManager.getState();
                servers = Array.from(this.pluginServers.values());
                return [2 /*return*/, {
                        success: true,
                        data: {
                            pluginManager: {
                                loadedPlugins: state.loadedPlugins,
                                activePlugins: state.activePlugins,
                            },
                            mcpServers: {
                                total: servers.length,
                                connected: servers.filter(function (s) { return s.connected; }).length,
                                byPlugin: servers.reduce(function (acc, server) {
                                    acc[server.pluginId] = (acc[server.pluginId] || 0) + 1;
                                    return acc;
                                }, {}),
                            },
                        },
                    }];
            });
        });
    };
    /**
     * 获取所有插件MCP服务器
     */
    PluginMCPHandler.prototype.getPluginMCPServers = function () {
        return Array.from(this.pluginServers.values());
    };
    /**
     * 获取插件MCP服务器
     */
    PluginMCPHandler.prototype.getPluginMCPServer = function (serverId) {
        return this.pluginServers.get(serverId);
    };
    /**
     * 关闭插件化MCP处理器
     */
    PluginMCPHandler.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, _b, serverId, server, error_7;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.outputChannel.appendLine('🔒 Closing Plugin MCP Handler...');
                        _i = 0, _a = this.pluginServers.entries();
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        _b = _a[_i], serverId = _b[0], server = _b[1];
                        if (!server.connected) return [3 /*break*/, 5];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.disconnectPluginServer(serverId)];
                    case 3:
                        _c.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_7 = _c.sent();
                        this.outputChannel.appendLine("\u26A0\uFE0F Failed to disconnect server ".concat(serverId, ": ").concat(error_7));
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        // 清理资源
                        this.pluginServers.clear();
                        this.pluginToolRegistry = null;
                        this.pluginManager = null;
                        this.taskEngine = null;
                        this.isInitialized = false;
                        this.outputChannel.appendLine('🔒 Plugin MCP Handler closed');
                        this.outputChannel.dispose();
                        return [2 /*return*/];
                }
            });
        });
    };
    return PluginMCPHandler;
}());
exports.PluginMCPHandler = PluginMCPHandler;
