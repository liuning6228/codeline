"use strict";
/**
 * 插件扩展集成
 * 将插件系统集成到CodeLine主扩展中
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
exports.PluginExtension = void 0;
var vscode = require("vscode");
var PluginManager_1 = require("./PluginManager");
var PluginToolRegistry_1 = require("./PluginToolRegistry");
var PluginMCPHandler_1 = require("./PluginMCPHandler");
var ToolRegistry_1 = require("../tools/ToolRegistry");
var MCPHandler_1 = require("../mcp/MCPHandler");
var PluginInterface_1 = require("./PluginInterface");
/**
 * 插件扩展
 * 负责在CodeLine扩展中集成插件系统
 */
var PluginExtension = /** @class */ (function () {
    function PluginExtension(extensionContext, toolContext, config) {
        this.extensionContext = extensionContext;
        this.toolContext = toolContext;
        this.outputChannel = vscode.window.createOutputChannel('CodeLine Plugin Extension');
        this.config = __assign({ enabled: true, autoLoadBuiltins: true, pluginDirs: [
                path.join(extensionContext.extensionPath, 'plugins'),
                path.join(toolContext.workspaceRoot, '.codeline', 'plugins'),
            ], enableManagementUI: true, enableMarketplace: false }, config);
        this.state = {
            pluginManagerReady: false,
            loadedPlugins: 0,
            activePlugins: 0,
            pluginTools: 0,
            pluginMCPServers: 0,
        };
    }
    PluginExtension.getInstance = function (extensionContext, toolContext, config) {
        if (!PluginExtension.instance && extensionContext && toolContext) {
            PluginExtension.instance = new PluginExtension(extensionContext, toolContext, config);
        }
        return PluginExtension.instance;
    };
    /**
     * 初始化插件扩展
     */
    PluginExtension.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.config.enabled) {
                            this.outputChannel.appendLine('ℹ️ Plugin system is disabled by configuration');
                            return [2 /*return*/];
                        }
                        this.outputChannel.show(true);
                        this.outputChannel.appendLine('🔧 Initializing CodeLine Plugin Extension...');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 9]);
                        // 1. 初始化插件管理器
                        return [4 /*yield*/, this.initializePluginManager()];
                    case 2:
                        // 1. 初始化插件管理器
                        _a.sent();
                        // 2. 初始化插件工具注册表
                        return [4 /*yield*/, this.initializePluginToolRegistry()];
                    case 3:
                        // 2. 初始化插件工具注册表
                        _a.sent();
                        // 3. 初始化插件MCP处理器
                        return [4 /*yield*/, this.initializePluginMCPHandler()];
                    case 4:
                        // 3. 初始化插件MCP处理器
                        _a.sent();
                        if (!this.config.autoLoadBuiltins) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.loadBuiltinPlugins()];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: 
                    // 5. 注册命令和UI
                    return [4 /*yield*/, this.registerCommandsAndUI()];
                    case 7:
                        // 5. 注册命令和UI
                        _a.sent();
                        this.state.pluginManagerReady = true;
                        this.outputChannel.appendLine('✅ Plugin Extension initialized successfully');
                        this.outputChannel.appendLine("   Loaded plugins: ".concat(this.state.loadedPlugins));
                        this.outputChannel.appendLine("   Active plugins: ".concat(this.state.activePlugins));
                        this.outputChannel.appendLine("   Plugin tools: ".concat(this.state.pluginTools));
                        this.outputChannel.appendLine("   Plugin MCP servers: ".concat(this.state.pluginMCPServers));
                        return [3 /*break*/, 9];
                    case 8:
                        error_1 = _a.sent();
                        this.state.lastError = error_1 instanceof Error ? error_1.message : String(error_1);
                        this.outputChannel.appendLine("\u274C Failed to initialize Plugin Extension: ".concat(this.state.lastError));
                        throw error_1;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 初始化插件管理器
     */
    PluginExtension.prototype.initializePluginManager = function () {
        return __awaiter(this, void 0, void 0, function () {
            var plugins;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.outputChannel.appendLine('📦 Initializing Plugin Manager...');
                        this.pluginManager = new PluginManager_1.PluginManager(this.extensionContext, this.toolContext, {
                            pluginDirs: this.config.pluginDirs,
                            autoDiscover: true,
                            autoLoad: true,
                        });
                        // 设置状态监听器
                        this.pluginManager.addLifecycleListener(function (event) {
                            _this.handlePluginLifecycleEvent(event);
                        });
                        return [4 /*yield*/, this.pluginManager.initialize()];
                    case 1:
                        _a.sent();
                        plugins = this.pluginManager.getPlugins();
                        this.state.loadedPlugins = plugins.length;
                        this.state.activePlugins = plugins.filter(function (p) { var _a; return ((_a = _this.pluginManager) === null || _a === void 0 ? void 0 : _a.getPluginState(p.metadata.id)) === PluginInterface_1.PluginLifecycleState.ACTIVATED; }).length;
                        this.outputChannel.appendLine("\u2705 Plugin Manager initialized (".concat(plugins.length, " plugins discovered)"));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 初始化插件工具注册表
     */
    PluginExtension.prototype.initializePluginToolRegistry = function () {
        return __awaiter(this, void 0, void 0, function () {
            var baseToolRegistry, tools;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.outputChannel.appendLine('🔧 Initializing Plugin Tool Registry...');
                        return [4 /*yield*/, this.getOrCreateBaseToolRegistry()];
                    case 1:
                        baseToolRegistry = _a.sent();
                        this.pluginToolRegistry = new PluginToolRegistry_1.PluginToolRegistry({
                            enablePluginSupport: true,
                            autoLoadPlugins: true,
                            pluginToolPrefix: 'plugin:',
                        });
                        // 初始化插件工具注册表
                        return [4 /*yield*/, this.pluginToolRegistry.initializeWithPlugins(this.extensionContext, this.toolContext)];
                    case 2:
                        // 初始化插件工具注册表
                        _a.sent();
                        tools = this.pluginToolRegistry.getPluginTools();
                        this.state.pluginTools = tools.size;
                        this.outputChannel.appendLine("\u2705 Plugin Tool Registry initialized (".concat(tools.size, " plugin tools registered)"));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 初始化插件MCP处理器
     */
    PluginExtension.prototype.initializePluginMCPHandler = function () {
        return __awaiter(this, void 0, void 0, function () {
            var servers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.outputChannel.appendLine('🔌 Initializing Plugin MCP Handler...');
                        this.pluginMCPHandler = new PluginMCPHandler_1.PluginMCPHandler(this.extensionContext);
                        // 初始化插件MCP处理器
                        return [4 /*yield*/, this.pluginMCPHandler.initialize(this.toolContext.workspaceRoot, this.pluginToolRegistry)];
                    case 1:
                        // 初始化插件MCP处理器
                        _a.sent();
                        servers = this.pluginMCPHandler.getPluginMCPServers();
                        this.state.pluginMCPServers = servers.length;
                        this.outputChannel.appendLine("\u2705 Plugin MCP Handler initialized (".concat(servers.length, " plugin MCP servers registered)"));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取或创建基础工具注册表
     */
    PluginExtension.prototype.getOrCreateBaseToolRegistry = function () {
        return __awaiter(this, void 0, void 0, function () {
            var toolRegistry;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // 尝试从全局上下文中获取
                        if ((_a = this.toolContext.sharedResources) === null || _a === void 0 ? void 0 : _a.toolRegistry) {
                            return [2 /*return*/, this.toolContext.sharedResources.toolRegistry];
                        }
                        toolRegistry = new ToolRegistry_1.ToolRegistry();
                        return [4 /*yield*/, toolRegistry.initialize()];
                    case 1:
                        _b.sent();
                        // 存储到全局上下文
                        if (!this.toolContext.sharedResources) {
                            this.toolContext.sharedResources = {};
                        }
                        this.toolContext.sharedResources.toolRegistry = toolRegistry;
                        return [2 /*return*/, toolRegistry];
                }
            });
        });
    };
    /**
     * 获取或创建基础MCP处理器
     */
    PluginExtension.prototype.getOrCreateBaseMCPHandler = function () {
        return __awaiter(this, void 0, void 0, function () {
            var mcpHandler;
            var _a;
            return __generator(this, function (_b) {
                // 尝试从全局上下文中获取
                if ((_a = this.toolContext.sharedResources) === null || _a === void 0 ? void 0 : _a.mcpHandler) {
                    return [2 /*return*/, this.toolContext.sharedResources.mcpHandler];
                }
                mcpHandler = new MCPHandler_1.MCPHandler(this.toolContext // 转换为MCP处理器所需的上下文
                );
                // 存储到全局上下文
                if (!this.toolContext.sharedResources) {
                    this.toolContext.sharedResources = {};
                }
                this.toolContext.sharedResources.mcpHandler = mcpHandler;
                return [2 /*return*/, mcpHandler];
            });
        });
    };
    /**
     * 加载内置插件
     */
    PluginExtension.prototype.loadBuiltinPlugins = function () {
        return __awaiter(this, void 0, void 0, function () {
            var builtinPluginDir, pluginDirs, loadedCount, _i, pluginDirs_1, pluginDir, pluginPath, stat, configPath, _a, error_2, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.outputChannel.appendLine('📥 Loading builtin plugins...');
                        builtinPluginDir = path.join(this.extensionContext.extensionPath, 'builtin-plugins');
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 15, , 16]);
                        return [4 /*yield*/, fs.access(builtinPluginDir)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, fs.readdir(builtinPluginDir)];
                    case 3:
                        pluginDirs = _b.sent();
                        loadedCount = 0;
                        _i = 0, pluginDirs_1 = pluginDirs;
                        _b.label = 4;
                    case 4:
                        if (!(_i < pluginDirs_1.length)) return [3 /*break*/, 14];
                        pluginDir = pluginDirs_1[_i];
                        pluginPath = path.join(builtinPluginDir, pluginDir);
                        _b.label = 5;
                    case 5:
                        _b.trys.push([5, 12, , 13]);
                        return [4 /*yield*/, fs.stat(pluginPath)];
                    case 6:
                        stat = _b.sent();
                        if (!stat.isDirectory()) {
                            return [3 /*break*/, 13];
                        }
                        configPath = path.join(pluginPath, 'plugin.json');
                        _b.label = 7;
                    case 7:
                        _b.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, fs.access(configPath)];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        _a = _b.sent();
                        this.outputChannel.appendLine("\u26A0\uFE0F Skipping ".concat(pluginDir, ": missing plugin.json"));
                        return [3 /*break*/, 13];
                    case 10: 
                    // 加载插件
                    return [4 /*yield*/, this.pluginManager.loadPlugin(pluginPath)];
                    case 11:
                        // 加载插件
                        _b.sent();
                        loadedCount++;
                        return [3 /*break*/, 13];
                    case 12:
                        error_2 = _b.sent();
                        this.outputChannel.appendLine("\u26A0\uFE0F Failed to load builtin plugin ".concat(pluginDir, ": ").concat(error_2));
                        return [3 /*break*/, 13];
                    case 13:
                        _i++;
                        return [3 /*break*/, 4];
                    case 14:
                        this.outputChannel.appendLine("\u2705 Loaded ".concat(loadedCount, " builtin plugins"));
                        return [3 /*break*/, 16];
                    case 15:
                        error_3 = _b.sent();
                        // 内置插件目录不存在，跳过
                        this.outputChannel.appendLine('ℹ️ Builtin plugins directory not found, skipping');
                        return [3 /*break*/, 16];
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 注册命令和UI
     */
    PluginExtension.prototype.registerCommandsAndUI = function () {
        return __awaiter(this, void 0, void 0, function () {
            var commands, _i, commands_1, cmd;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.outputChannel.appendLine('🎛️ Registering plugin commands and UI...');
                        commands = [
                            {
                                command: 'codeline.plugins.manage',
                                callback: function () { return _this.showPluginManagementUI(); },
                                title: 'Manage CodeLine Plugins'
                            },
                            {
                                command: 'codeline.plugins.reload',
                                callback: function () { return _this.reloadPlugins(); },
                                title: 'Reload All Plugins'
                            },
                            {
                                command: 'codeline.plugins.list',
                                callback: function () { return _this.listPlugins(); },
                                title: 'List Installed Plugins'
                            },
                            {
                                command: 'codeline.plugins.install',
                                callback: function () { return _this.installPlugin(); },
                                title: 'Install Plugin'
                            },
                            {
                                command: 'codeline.plugins.uninstall',
                                callback: function (pluginId) { return _this.uninstallPlugin(pluginId); },
                                title: 'Uninstall Plugin'
                            },
                            {
                                command: 'codeline.plugins.enable',
                                callback: function (pluginId) { return _this.enablePlugin(pluginId); },
                                title: 'Enable Plugin'
                            },
                            {
                                command: 'codeline.plugins.disable',
                                callback: function (pluginId) { return _this.disablePlugin(pluginId); },
                                title: 'Disable Plugin'
                            },
                        ];
                        for (_i = 0, commands_1 = commands; _i < commands_1.length; _i++) {
                            cmd = commands_1[_i];
                            this.extensionContext.subscriptions.push(vscode.commands.registerCommand(cmd.command, cmd.callback));
                        }
                        if (!this.config.enableManagementUI) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.createPluginManagementView()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.outputChannel.appendLine('✅ Plugin commands and UI registered');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建插件管理视图
     */
    PluginExtension.prototype.createPluginManagementView = function () {
        return __awaiter(this, void 0, void 0, function () {
            var provider, registration;
            return __generator(this, function (_a) {
                provider = new PluginManagementViewProvider(this.extensionContext, this.pluginManager, this.pluginToolRegistry, this.pluginMCPHandler);
                registration = vscode.window.registerWebviewViewProvider('codeline.plugins', provider);
                this.extensionContext.subscriptions.push(registration);
                return [2 /*return*/];
            });
        });
    };
    /**
     * 显示插件管理UI
     */
    PluginExtension.prototype.showPluginManagementUI = function () {
        vscode.commands.executeCommand('workbench.view.extension.codeline.plugins');
    };
    /**
     * 重新加载所有插件
     */
    PluginExtension.prototype.reloadPlugins = function () {
        return __awaiter(this, void 0, void 0, function () {
            var answer, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.window.showWarningMessage('Reload all plugins? This will unload and reload all plugins.', { modal: true }, 'Reload', 'Cancel')];
                    case 1:
                        answer = _a.sent();
                        if (answer !== 'Reload') {
                            return [2 /*return*/];
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 7]);
                        if (!(this.pluginManager && this.pluginManager.discoverAndLoadPlugins)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.pluginManager.discoverAndLoadPlugins()];
                    case 3:
                        _a.sent();
                        vscode.window.showInformationMessage('Plugins reloaded successfully');
                        return [3 /*break*/, 5];
                    case 4:
                        vscode.window.showInformationMessage('Plugin reload not yet implemented');
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_4 = _a.sent();
                        vscode.window.showErrorMessage("Failed to reload plugins: ".concat(error_4));
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 列出所有插件
     */
    PluginExtension.prototype.listPlugins = function () {
        return __awaiter(this, void 0, void 0, function () {
            var plugins, items, selected;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        plugins = this.pluginManager.getPlugins();
                        if (plugins.length === 0) {
                            vscode.window.showInformationMessage('No plugins installed');
                            return [2 /*return*/];
                        }
                        items = plugins.map(function (plugin) { return ({
                            label: plugin.metadata.name,
                            description: "v".concat(plugin.metadata.version, " - ").concat(plugin.metadata.id),
                            detail: plugin.metadata.description,
                            id: plugin.metadata.id,
                            state: _this.pluginManager.getPluginState(plugin.metadata.id)
                        }); });
                        return [4 /*yield*/, vscode.window.showQuickPick(items, {
                                placeHolder: 'Select a plugin for details',
                            })];
                    case 1:
                        selected = _a.sent();
                        if (!selected) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.showPluginDetails(selected.id)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 显示插件详情
     */
    PluginExtension.prototype.showPluginDetails = function (pluginId) {
        return __awaiter(this, void 0, void 0, function () {
            var plugin, state, pluginManagerAny, config, message, doc;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        plugin = this.pluginManager.getPlugin(pluginId);
                        state = this.pluginManager.getPluginState(pluginId);
                        pluginManagerAny = this.pluginManager;
                        config = ((_b = (_a = pluginManagerAny.pluginConfigs) === null || _a === void 0 ? void 0 : _a.get) === null || _b === void 0 ? void 0 : _b.call(_a, pluginId)) || {};
                        if (!plugin) {
                            vscode.window.showErrorMessage("Plugin ".concat(pluginId, " not found"));
                            return [2 /*return*/];
                        }
                        message = [
                            "# ".concat(plugin.metadata.name),
                            "**Version:** ".concat(plugin.metadata.version),
                            "**ID:** ".concat(plugin.metadata.id),
                            "**State:** ".concat(state),
                            "**Author:** ".concat(plugin.metadata.author || 'Unknown'),
                            "**Description:** ".concat(plugin.metadata.description),
                            '',
                            '## Configuration',
                            '```json',
                            JSON.stringify(config, null, 2),
                            '```',
                        ].join('\n');
                        return [4 /*yield*/, vscode.workspace.openTextDocument({
                                content: message,
                                language: 'markdown'
                            })];
                    case 1:
                        doc = _c.sent();
                        return [4 /*yield*/, vscode.window.showTextDocument(doc, { preview: true })];
                    case 2:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 安装插件
     */
    PluginExtension.prototype.installPlugin = function () {
        return __awaiter(this, void 0, void 0, function () {
            var answer, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.window.showInputBox({
                            prompt: 'Enter plugin installation source (local path or URL)',
                            placeHolder: '/path/to/plugin or https://example.com/plugin.zip'
                        })];
                    case 1:
                        answer = _a.sent();
                        if (!answer) {
                            return [2 /*return*/];
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 7]);
                        if (!(this.pluginManager && this.pluginManager.installPlugin)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.pluginManager.installPlugin(answer)];
                    case 3:
                        _a.sent();
                        vscode.window.showInformationMessage('Plugin installed successfully');
                        return [3 /*break*/, 5];
                    case 4:
                        vscode.window.showInformationMessage('Manual plugin installation required. Place plugin folder in: ' + this.config.pluginDirs[0]);
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_5 = _a.sent();
                        vscode.window.showErrorMessage("Failed to install plugin: ".concat(error_5));
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 卸载插件
     */
    PluginExtension.prototype.uninstallPlugin = function (pluginId) {
        return __awaiter(this, void 0, void 0, function () {
            var plugin, answer, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        plugin = this.pluginManager.getPlugin(pluginId);
                        if (!plugin) {
                            vscode.window.showErrorMessage("Plugin ".concat(pluginId, " not found"));
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, vscode.window.showWarningMessage("Uninstall plugin \"".concat(plugin.metadata.name, "\"?"), { modal: true }, 'Uninstall', 'Cancel')];
                    case 1:
                        answer = _a.sent();
                        if (answer !== 'Uninstall') {
                            return [2 /*return*/];
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.pluginManager.unloadPlugin(pluginId)];
                    case 3:
                        _a.sent();
                        vscode.window.showInformationMessage("Plugin \"".concat(plugin.metadata.name, "\" uninstalled"));
                        return [3 /*break*/, 5];
                    case 4:
                        error_6 = _a.sent();
                        vscode.window.showErrorMessage("Failed to uninstall plugin: ".concat(error_6));
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 启用插件
     */
    PluginExtension.prototype.enablePlugin = function (pluginId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.pluginManager.activatePlugin(pluginId)];
                    case 1:
                        _a.sent();
                        vscode.window.showInformationMessage("Plugin ".concat(pluginId, " enabled"));
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        vscode.window.showErrorMessage("Failed to enable plugin: ".concat(error_7));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 禁用插件
     */
    PluginExtension.prototype.disablePlugin = function (pluginId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.pluginManager.deactivatePlugin(pluginId)];
                    case 1:
                        _a.sent();
                        vscode.window.showInformationMessage("Plugin ".concat(pluginId, " disabled"));
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _a.sent();
                        vscode.window.showErrorMessage("Failed to disable plugin: ".concat(error_8));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 处理插件生命周期事件
     */
    PluginExtension.prototype.handlePluginLifecycleEvent = function (event) {
        // 更新状态
        switch (event.type) {
            case 'loaded':
                this.state.loadedPlugins++;
                break;
            case 'unloaded':
                this.state.loadedPlugins--;
                break;
            case 'activated':
                this.state.activePlugins++;
                break;
            case 'deactivated':
                this.state.activePlugins--;
                break;
        }
        // 记录事件
        this.outputChannel.appendLine("\uD83D\uDD14 Plugin event: ".concat(event.pluginId, " - ").concat(event.type));
    };
    /**
     * 获取插件扩展状态
     */
    PluginExtension.prototype.getState = function () {
        return __assign({}, this.state);
    };
    /**
     * 获取插件管理器
     */
    PluginExtension.prototype.getPluginManager = function () {
        return this.pluginManager;
    };
    /**
     * 获取插件工具注册表
     */
    PluginExtension.prototype.getPluginToolRegistry = function () {
        return this.pluginToolRegistry;
    };
    /**
     * 获取插件MCP处理器
     */
    PluginExtension.prototype.getPluginMCPHandler = function () {
        return this.pluginMCPHandler;
    };
    /**
     * 清理资源
     */
    PluginExtension.prototype.dispose = function () {
        // 检查并调用dispose方法（如果存在）
        if (this.pluginManager && typeof this.pluginManager.dispose === 'function') {
            this.pluginManager.dispose();
        }
        if (this.pluginToolRegistry && typeof this.pluginToolRegistry.dispose === 'function') {
            this.pluginToolRegistry.dispose();
        }
        if (this.pluginMCPHandler && typeof this.pluginMCPHandler.dispose === 'function') {
            this.pluginMCPHandler.dispose();
        }
        this.outputChannel.dispose();
    };
    return PluginExtension;
}());
exports.PluginExtension = PluginExtension;
// 导入缺失的模块
var path = require("path");
var fs = require("fs/promises");
/**
 * 插件管理视图提供者
 */
var PluginManagementViewProvider = /** @class */ (function () {
    function PluginManagementViewProvider(extensionContext, pluginManager, pluginToolRegistry, pluginMCPHandler) {
        this.extensionContext = extensionContext;
        this.pluginManager = pluginManager;
        this.pluginToolRegistry = pluginToolRegistry;
        this.pluginMCPHandler = pluginMCPHandler;
    }
    PluginManagementViewProvider.prototype.resolveWebviewView = function (webviewView, context, token) {
        var _this = this;
        this.view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this.extensionContext.extensionUri
            ]
        };
        webviewView.webview.html = this.getWebviewContent();
        // 设置消息处理器
        webviewView.webview.onDidReceiveMessage(function (message) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.handleWebviewMessage(message)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // 定期更新插件状态
        this.updatePluginStatus();
    };
    PluginManagementViewProvider.prototype.getWebviewContent = function () {
        return "\n      <!DOCTYPE html>\n      <html lang=\"en\">\n      <head>\n        <meta charset=\"UTF-8\">\n        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n        <title>CodeLine Plugins</title>\n        <style>\n          body {\n            font-family: var(--vscode-font-family);\n            padding: 20px;\n            color: var(--vscode-foreground);\n            background: var(--vscode-editor-background);\n          }\n          .header {\n            margin-bottom: 20px;\n            border-bottom: 1px solid var(--vscode-panel-border);\n            padding-bottom: 10px;\n          }\n          .stats {\n            display: grid;\n            grid-template-columns: repeat(4, 1fr);\n            gap: 10px;\n            margin-bottom: 20px;\n          }\n          .stat-card {\n            background: var(--vscode-editor-inactiveSelectionBackground);\n            border-radius: 4px;\n            padding: 10px;\n            text-align: center;\n          }\n          .stat-value {\n            font-size: 24px;\n            font-weight: bold;\n            color: var(--vscode-textLink-foreground);\n          }\n          .stat-label {\n            font-size: 12px;\n            color: var(--vscode-descriptionForeground);\n          }\n          .plugins-list {\n            margin-top: 20px;\n          }\n          .plugin-card {\n            background: var(--vscode-sideBar-background);\n            border: 1px solid var(--vscode-panel-border);\n            border-radius: 4px;\n            padding: 15px;\n            margin-bottom: 10px;\n          }\n          .plugin-header {\n            display: flex;\n            justify-content: space-between;\n            align-items: center;\n            margin-bottom: 10px;\n          }\n          .plugin-title {\n            font-size: 16px;\n            font-weight: bold;\n          }\n          .plugin-state {\n            padding: 2px 8px;\n            border-radius: 10px;\n            font-size: 12px;\n            font-weight: bold;\n          }\n          .state-active {\n            background: var(--vscode-testing-iconPassed);\n            color: white;\n          }\n          .state-inactive {\n            background: var(--vscode-testing-iconFailed);\n            color: white;\n          }\n          .plugin-description {\n            color: var(--vscode-descriptionForeground);\n            margin-bottom: 10px;\n          }\n          .plugin-actions {\n            display: flex;\n            gap: 10px;\n          }\n          button {\n            background: var(--vscode-button-background);\n            color: var(--vscode-button-foreground);\n            border: none;\n            padding: 4px 12px;\n            border-radius: 2px;\n            cursor: pointer;\n          }\n          button:hover {\n            background: var(--vscode-button-hoverBackground);\n          }\n          .button-danger {\n            background: var(--vscode-errorForeground);\n          }\n          .button-success {\n            background: var(--vscode-testing-iconPassed);\n          }\n          .button-warning {\n            background: var(--vscode-testing-iconQueued);\n          }\n        </style>\n      </head>\n      <body>\n        <div class=\"header\">\n          <h1>CodeLine Plugins</h1>\n          <p>Manage plugins that extend CodeLine functionality</p>\n        </div>\n        \n        <div class=\"stats\">\n          <div class=\"stat-card\">\n            <div class=\"stat-value\" id=\"total-plugins\">0</div>\n            <div class=\"stat-label\">Total Plugins</div>\n          </div>\n          <div class=\"stat-card\">\n            <div class=\"stat-value\" id=\"active-plugins\">0</div>\n            <div class=\"stat-label\">Active Plugins</div>\n          </div>\n          <div class=\"stat-card\">\n            <div class=\"stat-value\" id=\"plugin-tools\">0</div>\n            <div class=\"stat-label\">Plugin Tools</div>\n          </div>\n          <div class=\"stat-card\">\n            <div class=\"stat-value\" id=\"mcp-servers\">0</div>\n            <div class=\"stat-label\">MCP Servers</div>\n          </div>\n        </div>\n        \n        <div>\n          <button onclick=\"handleAction('reload')\">Reload All Plugins</button>\n          <button onclick=\"handleAction('install')\">Install Plugin</button>\n          <button onclick=\"handleAction('open-dir')\">Open Plugin Directory</button>\n        </div>\n        \n        <div class=\"plugins-list\" id=\"plugins-list\">\n          <!-- Plugin cards will be populated here -->\n        </div>\n        \n        <script>\n          const vscode = acquireVsCodeApi();\n          \n          // \u5904\u7406\u6309\u94AE\u70B9\u51FB\n          function handleAction(action, data = null) {\n            vscode.postMessage({ type: 'action', action, data });\n          }\n          \n          // \u5904\u7406\u63D2\u4EF6\u64CD\u4F5C\n          function handlePluginAction(pluginId, action) {\n            vscode.postMessage({ type: 'plugin-action', pluginId, action });\n          }\n          \n          // \u521D\u59CB\u52A0\u8F7D\n          window.addEventListener('load', () => {\n            vscode.postMessage({ type: 'get-status' });\n          });\n          \n          // \u76D1\u542C\u6D88\u606F\n          window.addEventListener('message', (event) => {\n            const message = event.data;\n            \n            switch (message.type) {\n              case 'status':\n                updateStatus(message.data);\n                break;\n              case 'plugins':\n                updatePluginsList(message.data);\n                break;\n            }\n          });\n          \n          function updateStatus(data) {\n            document.getElementById('total-plugins').textContent = data.totalPlugins;\n            document.getElementById('active-plugins').textContent = data.activePlugins;\n            document.getElementById('plugin-tools').textContent = data.pluginTools;\n            document.getElementById('mcp-servers').textContent = data.mcpServers;\n          }\n          \n          function updatePluginsList(plugins) {\n            const container = document.getElementById('plugins-list');\n            container.innerHTML = '';\n            \n            if (plugins.length === 0) {\n              container.innerHTML = '<p>No plugins installed. Click \"Install Plugin\" to add some!</p>';\n              return;\n            }\n            \n            plugins.forEach(plugin => {\n              const card = document.createElement('div');\n              card.className = 'plugin-card';\n              \n              const stateClass = plugin.state === 'active' ? 'state-active' : 'state-inactive';\n              \n              card.innerHTML = `\n                <div class=\"plugin-header\">\n                  <div>\n                    <span class=\"plugin-title\">${plugin.name}</span>\n                    <span style=\"font-size: 12px; color: #999; margin-left: 10px;\">v${plugin.version}</span>\n                  </div>\n                  <span class=\"plugin-state ${stateClass}\">${plugin.state}</span>\n                </div>\n                <div class=\"plugin-description\">${plugin.description}</div>\n                <div class=\"plugin-actions\">\n                  ${plugin.state === 'active' \n                    ? '<button class=\"button-warning\" onclick=\"handlePluginAction(\\'' + plugin.id + '\\', \\'deactivate\\')\">Disable</button>'\n                    : '<button class=\"button-success\" onclick=\"handlePluginAction(\\'' + plugin.id + '\\', \\'activate\\')\">Enable</button>'\n                  }\n                  <button onclick=\"handlePluginAction(\\'' + plugin.id + '\\', \\'details\\')\">Details</button>\n                  <button class=\"button-danger\" onclick=\"handlePluginAction(\\'' + plugin.id + '\\', \\'uninstall\\')\">Uninstall</button>\n                </div>\n              `;\n              \n              container.appendChild(card);\n            });\n          }\n        </script>\n      </body>\n      </html>\n    ";
    };
    PluginManagementViewProvider.prototype.handleWebviewMessage = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = message.type;
                        switch (_a) {
                            case 'get-status': return [3 /*break*/, 1];
                            case 'action': return [3 /*break*/, 3];
                            case 'plugin-action': return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 7];
                    case 1: return [4 /*yield*/, this.sendPluginStatus()];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 3: return [4 /*yield*/, this.handleAction(message.action, message.data)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, this.handlePluginAction(message.pluginId, message.action)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    PluginManagementViewProvider.prototype.sendPluginStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var plugins, activePlugins, pluginTools, mcpServers, pluginData;
            var _this = this;
            var _a, _b;
            return __generator(this, function (_c) {
                plugins = this.pluginManager.getPlugins();
                activePlugins = plugins.filter(function (p) {
                    return _this.pluginManager.getPluginState(p.metadata.id) === 'activated';
                }).length;
                pluginTools = this.pluginToolRegistry.getPluginTools().size;
                mcpServers = this.pluginMCPHandler.getPluginMCPServers().length;
                // 发送状态
                (_a = this.view) === null || _a === void 0 ? void 0 : _a.webview.postMessage({
                    type: 'status',
                    data: {
                        totalPlugins: plugins.length,
                        activePlugins: activePlugins,
                        pluginTools: pluginTools,
                        mcpServers: mcpServers
                    }
                });
                pluginData = plugins.map(function (plugin) { return ({
                    id: plugin.metadata.id,
                    name: plugin.metadata.name,
                    version: plugin.metadata.version,
                    description: plugin.metadata.description,
                    state: _this.pluginManager.getPluginState(plugin.metadata.id)
                }); });
                (_b = this.view) === null || _b === void 0 ? void 0 : _b.webview.postMessage({
                    type: 'plugins',
                    data: pluginData
                });
                return [2 /*return*/];
            });
        });
    };
    PluginManagementViewProvider.prototype.handleAction = function (action, data) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, pluginManagerAny, pluginDirs;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = action;
                        switch (_a) {
                            case 'reload': return [3 /*break*/, 1];
                            case 'install': return [3 /*break*/, 6];
                            case 'open-dir': return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 8];
                    case 1:
                        if (!(typeof this.pluginManager.discoverAndLoadPlugins === 'function')) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.pluginManager.discoverAndLoadPlugins()];
                    case 2:
                        _c.sent();
                        vscode.window.showInformationMessage('Plugins reloaded');
                        return [4 /*yield*/, this.sendPluginStatus()];
                    case 3:
                        _c.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        vscode.window.showInformationMessage('Plugin reload not yet implemented');
                        _c.label = 5;
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        vscode.commands.executeCommand('codeline.plugins.install');
                        return [3 /*break*/, 8];
                    case 7:
                        pluginManagerAny = this.pluginManager;
                        pluginDirs = ((_b = pluginManagerAny.config) === null || _b === void 0 ? void 0 : _b.pluginDirs) || pluginManagerAny.pluginDirs || [];
                        if (pluginDirs.length > 0) {
                            vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(pluginDirs[0]));
                        }
                        else {
                            vscode.window.showWarningMessage('No plugin directories configured');
                        }
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    PluginManagementViewProvider.prototype.handlePluginAction = function (pluginId, action) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, answer;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = action;
                        switch (_a) {
                            case 'activate': return [3 /*break*/, 1];
                            case 'deactivate': return [3 /*break*/, 3];
                            case 'details': return [3 /*break*/, 5];
                            case 'uninstall': return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 10];
                    case 1: return [4 /*yield*/, this.pluginManager.activatePlugin(pluginId)];
                    case 2:
                        _b.sent();
                        vscode.window.showInformationMessage("Plugin ".concat(pluginId, " activated"));
                        return [3 /*break*/, 10];
                    case 3: return [4 /*yield*/, this.pluginManager.deactivatePlugin(pluginId)];
                    case 4:
                        _b.sent();
                        vscode.window.showInformationMessage("Plugin ".concat(pluginId, " deactivated"));
                        return [3 /*break*/, 10];
                    case 5:
                        vscode.commands.executeCommand('codeline.plugins.list');
                        return [3 /*break*/, 10];
                    case 6: return [4 /*yield*/, vscode.window.showWarningMessage("Uninstall plugin?", { modal: true }, 'Uninstall', 'Cancel')];
                    case 7:
                        answer = _b.sent();
                        if (!(answer === 'Uninstall')) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.pluginManager.unloadPlugin(pluginId)];
                    case 8:
                        _b.sent();
                        vscode.window.showInformationMessage("Plugin ".concat(pluginId, " uninstalled"));
                        _b.label = 9;
                    case 9: return [3 /*break*/, 10];
                    case 10: return [4 /*yield*/, this.sendPluginStatus()];
                    case 11:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PluginManagementViewProvider.prototype.updatePluginStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.view) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.sendPluginStatus()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        // 每30秒更新一次状态
                        setTimeout(function () { return _this.updatePluginStatus(); }, 30000);
                        return [2 /*return*/];
                }
            });
        });
    };
    return PluginManagementViewProvider;
}());
