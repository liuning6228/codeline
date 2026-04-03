"use strict";
/**
 * 插件管理器
 * 负责插件的加载、卸载、激活、停用和生命周期管理
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
exports.PluginManager = void 0;
var vscode = require("vscode");
var path = require("path");
var fs = require("fs/promises");
var PluginInterface_1 = require("./PluginInterface");
/**
 * 插件管理器
 */
var PluginManager = /** @class */ (function () {
    function PluginManager(extensionContext, globalContext, config) {
        this.plugins = new Map();
        this.pluginStates = new Map();
        this.pluginContexts = new Map();
        this.pluginConfigs = new Map();
        this.pluginDependencies = new Map();
        this.lifecycleListeners = [];
        this.extensionContext = extensionContext;
        this.globalContext = globalContext;
        this.outputChannel = vscode.window.createOutputChannel('CodeLine Plugin Manager');
        this.config = __assign({ pluginDirs: [
                path.join(extensionContext.extensionPath, 'plugins'),
                path.join(globalContext.workspaceRoot, '.codeline', 'plugins'),
            ], autoDiscover: true, autoLoad: true, enableDependencyCheck: true, maxPlugins: 50, configFileName: 'plugin.json', metadataFileName: 'package.json' }, config);
    }
    /**
     * 初始化插件管理器
     */
    PluginManager.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, pluginDir, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.outputChannel.show(true);
                        this.outputChannel.appendLine('🔧 Initializing Plugin Manager...');
                        _i = 0, _a = this.config.pluginDirs;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        pluginDir = _a[_i];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, fs.mkdir(pluginDir, { recursive: true })];
                    case 3:
                        _b.sent();
                        this.outputChannel.appendLine("\uD83D\uDCC1 Created plugin directory: ".concat(pluginDir));
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _b.sent();
                        this.outputChannel.appendLine("\u26A0\uFE0F Failed to create plugin directory ".concat(pluginDir, ": ").concat(error_1));
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        if (!this.config.autoDiscover) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.discoverAndLoadPlugins()];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8:
                        this.outputChannel.appendLine('✅ Plugin Manager initialized');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 加载插件
     */
    PluginManager.prototype.loadPlugin = function (pluginPath) {
        return __awaiter(this, void 0, void 0, function () {
            var pluginId, error_2, metadata, config, pluginModule, pluginContext, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pluginId = path.basename(pluginPath);
                        // 检查是否已加载
                        if (this.plugins.has(pluginId)) {
                            throw new Error("Plugin ".concat(pluginId, " is already loaded"));
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs.access(pluginPath)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        throw new Error("Plugin directory ".concat(pluginPath, " does not exist: ").concat(error_2));
                    case 4:
                        this.outputChannel.appendLine("\uD83D\uDCE6 Loading plugin: ".concat(pluginId));
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 11, , 12]);
                        return [4 /*yield*/, this.loadPluginMetadata(pluginPath)];
                    case 6:
                        metadata = _a.sent();
                        return [4 /*yield*/, this.loadPluginConfig(pluginPath, pluginId)];
                    case 7:
                        config = _a.sent();
                        return [4 /*yield*/, this.loadPluginModule(pluginPath)];
                    case 8:
                        pluginModule = _a.sent();
                        // 验证插件接口
                        if (!this.validatePlugin(pluginModule)) {
                            throw new Error("Plugin ".concat(pluginId, " does not implement the required interface"));
                        }
                        pluginContext = {
                            extensionContext: this.extensionContext,
                            pluginDir: pluginPath,
                            outputChannel: vscode.window.createOutputChannel("Plugin: ".concat(metadata.name)),
                            config: config,
                            globalContext: this.globalContext,
                            pluginManager: this,
                        };
                        // 存储插件和上下文
                        this.plugins.set(pluginId, pluginModule);
                        this.pluginContexts.set(pluginId, pluginContext);
                        this.pluginConfigs.set(pluginId, config);
                        this.pluginStates.set(pluginId, PluginInterface_1.PluginLifecycleState.LOADED);
                        // 触发生命周期事件
                        this.emitLifecycleEvent({
                            pluginId: pluginId,
                            type: 'loaded',
                            timestamp: Date.now(),
                        });
                        this.outputChannel.appendLine("\u2705 Plugin loaded: ".concat(metadata.name, " v").concat(metadata.version));
                        if (!this.config.autoLoad) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.activatePlugin(pluginId)];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10: return [2 /*return*/, pluginModule];
                    case 11:
                        error_3 = _a.sent();
                        this.outputChannel.appendLine("\u274C Failed to load plugin ".concat(pluginId, ": ").concat(error_3));
                        this.pluginStates.set(pluginId, PluginInterface_1.PluginLifecycleState.ERROR);
                        this.emitLifecycleEvent({
                            pluginId: pluginId,
                            type: 'error',
                            timestamp: Date.now(),
                            error: error_3 instanceof Error ? error_3.message : String(error_3),
                        });
                        throw error_3;
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 卸载插件
     */
    PluginManager.prototype.unloadPlugin = function (pluginId) {
        return __awaiter(this, void 0, void 0, function () {
            var plugin, dependentPlugins, dependentNames, state, error_4, context;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        plugin = this.plugins.get(pluginId);
                        if (!plugin) {
                            throw new Error("Plugin ".concat(pluginId, " not found"));
                        }
                        this.outputChannel.appendLine("\uD83D\uDDD1\uFE0F Unloading plugin: ".concat(pluginId));
                        return [4 /*yield*/, this.findDependentPlugins(pluginId)];
                    case 1:
                        dependentPlugins = _a.sent();
                        if (dependentPlugins.length > 0) {
                            dependentNames = dependentPlugins.map(function (p) { return p.metadata.name; }).join(', ');
                            throw new Error("Cannot unload plugin ".concat(pluginId, ". The following plugins depend on it: ").concat(dependentNames));
                        }
                        state = this.pluginStates.get(pluginId);
                        if (!(state === PluginInterface_1.PluginLifecycleState.ACTIVATED)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.deactivatePlugin(pluginId)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, plugin.deactivate()];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_4 = _a.sent();
                        this.outputChannel.appendLine("\u26A0\uFE0F Plugin ".concat(pluginId, " deactivation failed: ").concat(error_4));
                        return [3 /*break*/, 6];
                    case 6:
                        context = this.pluginContexts.get(pluginId);
                        if (context) {
                            context.outputChannel.dispose();
                        }
                        // 移除插件
                        this.plugins.delete(pluginId);
                        this.pluginContexts.delete(pluginId);
                        this.pluginConfigs.delete(pluginId);
                        this.pluginStates.delete(pluginId);
                        this.pluginDependencies.delete(pluginId);
                        // 触发生命周期事件
                        this.emitLifecycleEvent({
                            pluginId: pluginId,
                            type: 'unloaded',
                            timestamp: Date.now(),
                        });
                        this.outputChannel.appendLine("\u2705 Plugin unloaded: ".concat(pluginId));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 激活插件
     */
    PluginManager.prototype.activatePlugin = function (pluginId) {
        return __awaiter(this, void 0, void 0, function () {
            var plugin, state, context_1, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        plugin = this.plugins.get(pluginId);
                        if (!plugin) {
                            throw new Error("Plugin ".concat(pluginId, " not found"));
                        }
                        state = this.pluginStates.get(pluginId);
                        if (state === PluginInterface_1.PluginLifecycleState.ACTIVATED) {
                            this.outputChannel.appendLine("\u2139\uFE0F Plugin ".concat(pluginId, " is already activated"));
                            return [2 /*return*/];
                        }
                        this.outputChannel.appendLine("\uD83D\uDE80 Activating plugin: ".concat(pluginId));
                        if (!(this.config.enableDependencyCheck && plugin.dependencies)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.checkPluginDependencies(pluginId, plugin.dependencies)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        context_1 = this.pluginContexts.get(pluginId);
                        if (!context_1) {
                            throw new Error("Plugin context not found for ".concat(pluginId));
                        }
                        return [4 /*yield*/, plugin.activate(context_1)];
                    case 3:
                        _a.sent();
                        this.pluginStates.set(pluginId, PluginInterface_1.PluginLifecycleState.ACTIVATED);
                        // 触发生命周期事件
                        this.emitLifecycleEvent({
                            pluginId: pluginId,
                            type: 'activated',
                            timestamp: Date.now(),
                        });
                        this.outputChannel.appendLine("\u2705 Plugin activated: ".concat(pluginId));
                        return [3 /*break*/, 5];
                    case 4:
                        error_5 = _a.sent();
                        this.outputChannel.appendLine("\u274C Failed to activate plugin ".concat(pluginId, ": ").concat(error_5));
                        this.pluginStates.set(pluginId, PluginInterface_1.PluginLifecycleState.ERROR);
                        this.emitLifecycleEvent({
                            pluginId: pluginId,
                            type: 'error',
                            timestamp: Date.now(),
                            error: error_5 instanceof Error ? error_5.message : String(error_5),
                        });
                        throw error_5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 停用插件
     */
    PluginManager.prototype.deactivatePlugin = function (pluginId) {
        return __awaiter(this, void 0, void 0, function () {
            var plugin, state, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        plugin = this.plugins.get(pluginId);
                        if (!plugin) {
                            throw new Error("Plugin ".concat(pluginId, " not found"));
                        }
                        state = this.pluginStates.get(pluginId);
                        if (state !== PluginInterface_1.PluginLifecycleState.ACTIVATED) {
                            this.outputChannel.appendLine("\u2139\uFE0F Plugin ".concat(pluginId, " is not activated"));
                            return [2 /*return*/];
                        }
                        this.outputChannel.appendLine("\u23F8\uFE0F Deactivating plugin: ".concat(pluginId));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        // 停用插件
                        return [4 /*yield*/, plugin.deactivate()];
                    case 2:
                        // 停用插件
                        _a.sent();
                        this.pluginStates.set(pluginId, PluginInterface_1.PluginLifecycleState.DEACTIVATED);
                        // 触发生命周期事件
                        this.emitLifecycleEvent({
                            pluginId: pluginId,
                            type: 'deactivated',
                            timestamp: Date.now(),
                        });
                        this.outputChannel.appendLine("\u2705 Plugin deactivated: ".concat(pluginId));
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _a.sent();
                        this.outputChannel.appendLine("\u274C Failed to deactivate plugin ".concat(pluginId, ": ").concat(error_6));
                        this.pluginStates.set(pluginId, PluginInterface_1.PluginLifecycleState.ERROR);
                        this.emitLifecycleEvent({
                            pluginId: pluginId,
                            type: 'error',
                            timestamp: Date.now(),
                            error: error_6 instanceof Error ? error_6.message : String(error_6),
                        });
                        throw error_6;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取所有插件
     */
    PluginManager.prototype.getPlugins = function () {
        return Array.from(this.plugins.values());
    };
    /**
     * 获取插件
     */
    PluginManager.prototype.getPlugin = function (pluginId) {
        return this.plugins.get(pluginId);
    };
    /**
     * 获取插件状态
     */
    PluginManager.prototype.getPluginState = function (pluginId) {
        return this.pluginStates.get(pluginId) || PluginInterface_1.PluginLifecycleState.UNLOADED;
    };
    /**
     * 发现插件
     */
    PluginManager.prototype.discoverPlugins = function (pluginDir) {
        return __awaiter(this, void 0, void 0, function () {
            var entries, pluginPaths, _i, entries_1, entry, pluginPath, metadataPath, _a, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, fs.readdir(pluginDir, { withFileTypes: true })];
                    case 1:
                        entries = _b.sent();
                        pluginPaths = [];
                        _i = 0, entries_1 = entries;
                        _b.label = 2;
                    case 2:
                        if (!(_i < entries_1.length)) return [3 /*break*/, 7];
                        entry = entries_1[_i];
                        if (!entry.isDirectory()) return [3 /*break*/, 6];
                        pluginPath = path.join(pluginDir, entry.name);
                        metadataPath = path.join(pluginPath, this.config.metadataFileName);
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, fs.access(metadataPath)];
                    case 4:
                        _b.sent();
                        pluginPaths.push(pluginPath);
                        return [3 /*break*/, 6];
                    case 5:
                        _a = _b.sent();
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7:
                        this.outputChannel.appendLine("\uD83D\uDD0D Discovered ".concat(pluginPaths.length, " plugins in ").concat(pluginDir));
                        return [2 /*return*/, pluginPaths];
                    case 8:
                        error_7 = _b.sent();
                        this.outputChannel.appendLine("\u26A0\uFE0F Failed to discover plugins in ".concat(pluginDir, ": ").concat(error_7));
                        return [2 /*return*/, []];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取插件管理器状态
     */
    PluginManager.prototype.getState = function () {
        var pluginStates = {};
        for (var _i = 0, _a = this.pluginStates.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], pluginId = _b[0], state = _b[1];
            pluginStates[pluginId] = state;
        }
        return {
            loadedPlugins: this.plugins.size,
            activePlugins: Array.from(this.pluginStates.values()).filter(function (state) { return state === PluginInterface_1.PluginLifecycleState.ACTIVATED; }).length,
            pluginStates: pluginStates,
        };
    };
    /**
     * 添加生命周期监听器
     */
    PluginManager.prototype.addLifecycleListener = function (listener) {
        this.lifecycleListeners.push(listener);
    };
    /**
     * 移除生命周期监听器
     */
    PluginManager.prototype.removeLifecycleListener = function (listener) {
        var index = this.lifecycleListeners.indexOf(listener);
        if (index !== -1) {
            this.lifecycleListeners.splice(index, 1);
        }
    };
    /**
     * 更新插件配置
     */
    PluginManager.prototype.updatePluginConfig = function (pluginId, newConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var plugin, oldConfig, mergedConfig, context, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        plugin = this.plugins.get(pluginId);
                        if (!plugin) {
                            throw new Error("Plugin ".concat(pluginId, " not found"));
                        }
                        oldConfig = this.pluginConfigs.get(pluginId) || {};
                        mergedConfig = __assign(__assign({}, oldConfig), newConfig);
                        // 更新插件配置
                        this.pluginConfigs.set(pluginId, mergedConfig);
                        context = this.pluginContexts.get(pluginId);
                        if (context) {
                            context.config = mergedConfig;
                        }
                        if (!plugin.updateConfig) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, plugin.updateConfig(mergedConfig)];
                    case 2:
                        _a.sent();
                        this.outputChannel.appendLine("\u2699\uFE0F Updated config for plugin: ".concat(pluginId));
                        return [3 /*break*/, 4];
                    case 3:
                        error_8 = _a.sent();
                        this.outputChannel.appendLine("\u26A0\uFE0F Plugin ".concat(pluginId, " failed to update config: ").concat(error_8));
                        throw error_8;
                    case 4: 
                    // 保存配置到文件
                    return [4 /*yield*/, this.savePluginConfig(pluginId)];
                    case 5:
                        // 保存配置到文件
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 关闭插件管理器
     */
    PluginManager.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, _b, pluginId, state, error_9;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.outputChannel.appendLine('🔒 Closing Plugin Manager...');
                        _i = 0, _a = this.pluginStates.entries();
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        _b = _a[_i], pluginId = _b[0], state = _b[1];
                        if (!(state === PluginInterface_1.PluginLifecycleState.ACTIVATED)) return [3 /*break*/, 5];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.deactivatePlugin(pluginId)];
                    case 3:
                        _c.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_9 = _c.sent();
                        this.outputChannel.appendLine("\u26A0\uFE0F Failed to deactivate plugin ".concat(pluginId, ": ").concat(error_9));
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        // 清理资源
                        this.plugins.clear();
                        this.pluginStates.clear();
                        this.pluginContexts.clear();
                        this.pluginConfigs.clear();
                        this.pluginDependencies.clear();
                        this.lifecycleListeners = [];
                        this.outputChannel.appendLine('🔒 Plugin Manager closed');
                        this.outputChannel.dispose();
                        return [2 /*return*/];
                }
            });
        });
    };
    // ========== 私有方法 ==========
    /**
     * 发现并加载插件
     */
    PluginManager.prototype.discoverAndLoadPlugins = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, pluginDir, pluginPaths, _b, pluginPaths_1, pluginPath, error_10, error_11;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _i = 0, _a = this.config.pluginDirs;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 12];
                        pluginDir = _a[_i];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 10, , 11]);
                        return [4 /*yield*/, this.discoverPlugins(pluginDir)];
                    case 3:
                        pluginPaths = _c.sent();
                        _b = 0, pluginPaths_1 = pluginPaths;
                        _c.label = 4;
                    case 4:
                        if (!(_b < pluginPaths_1.length)) return [3 /*break*/, 9];
                        pluginPath = pluginPaths_1[_b];
                        _c.label = 5;
                    case 5:
                        _c.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this.loadPlugin(pluginPath)];
                    case 6:
                        _c.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_10 = _c.sent();
                        this.outputChannel.appendLine("\u26A0\uFE0F Failed to load plugin from ".concat(pluginPath, ": ").concat(error_10));
                        return [3 /*break*/, 8];
                    case 8:
                        _b++;
                        return [3 /*break*/, 4];
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        error_11 = _c.sent();
                        this.outputChannel.appendLine("\u26A0\uFE0F Failed to discover plugins in ".concat(pluginDir, ": ").concat(error_11));
                        return [3 /*break*/, 11];
                    case 11:
                        _i++;
                        return [3 /*break*/, 1];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 加载插件元数据
     */
    PluginManager.prototype.loadPluginMetadata = function (pluginPath) {
        return __awaiter(this, void 0, void 0, function () {
            var metadataPath, metadataContent, metadata, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        metadataPath = path.join(pluginPath, this.config.metadataFileName);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs.readFile(metadataPath, 'utf-8')];
                    case 2:
                        metadataContent = _a.sent();
                        metadata = JSON.parse(metadataContent);
                        // 验证必需字段
                        if (!metadata.id || !metadata.name || !metadata.version) {
                            throw new Error('Plugin metadata must contain id, name, and version');
                        }
                        return [2 /*return*/, metadata];
                    case 3:
                        error_12 = _a.sent();
                        throw new Error("Failed to load plugin metadata from ".concat(metadataPath, ": ").concat(error_12));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 加载插件配置
     */
    PluginManager.prototype.loadPluginConfig = function (pluginPath, pluginId) {
        return __awaiter(this, void 0, void 0, function () {
            var configPath, configContent, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        configPath = path.join(pluginPath, this.config.configFileName);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs.readFile(configPath, 'utf-8')];
                    case 2:
                        configContent = _a.sent();
                        return [2 /*return*/, JSON.parse(configContent)];
                    case 3:
                        error_13 = _a.sent();
                        // 配置文件不存在，返回空配置
                        return [2 /*return*/, {}];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 加载插件模块
     */
    PluginManager.prototype.loadPluginModule = function (pluginPath) {
        return __awaiter(this, void 0, void 0, function () {
            var entryPoints, _i, entryPoints_1, entryPoint, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        entryPoints = [
                            path.join(pluginPath, 'index.js'),
                            path.join(pluginPath, 'index.ts'),
                            path.join(pluginPath, 'plugin.js'),
                            path.join(pluginPath, 'plugin.ts'),
                            path.join(pluginPath, 'src', 'index.js'),
                            path.join(pluginPath, 'src', 'index.ts'),
                        ];
                        _i = 0, entryPoints_1 = entryPoints;
                        _b.label = 1;
                    case 1:
                        if (!(_i < entryPoints_1.length)) return [3 /*break*/, 6];
                        entryPoint = entryPoints_1[_i];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, fs.access(entryPoint)];
                    case 3:
                        _b.sent();
                        // 在实际实现中，这里需要动态导入模块
                        // 由于TypeScript编译限制，我们返回一个模拟对象
                        // 实际实现应该使用类似以下的代码：
                        // const module = require(entryPoint);
                        // return module.default || module;
                        throw new Error('Dynamic module loading not implemented in this prototype');
                    case 4:
                        _a = _b.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: throw new Error("No entry point found in plugin directory: ".concat(pluginPath));
                }
            });
        });
    };
    /**
     * 验证插件接口
     */
    PluginManager.prototype.validatePlugin = function (plugin) {
        return (plugin &&
            typeof plugin === 'object' &&
            plugin.metadata &&
            typeof plugin.metadata === 'object' &&
            typeof plugin.metadata.id === 'string' &&
            typeof plugin.metadata.name === 'string' &&
            typeof plugin.metadata.version === 'string' &&
            typeof plugin.activate === 'function' &&
            typeof plugin.deactivate === 'function' &&
            typeof plugin.getTools === 'function' &&
            typeof plugin.getToolDefinitions === 'function');
    };
    /**
     * 检查插件依赖
     */
    PluginManager.prototype.checkPluginDependencies = function (pluginId, dependencies) {
        return __awaiter(this, void 0, void 0, function () {
            var missingDependencies, versionMismatches, _i, dependencies_1, dependency, dependentPlugin, pluginVersion;
            return __generator(this, function (_a) {
                missingDependencies = [];
                versionMismatches = [];
                for (_i = 0, dependencies_1 = dependencies; _i < dependencies_1.length; _i++) {
                    dependency = dependencies_1[_i];
                    dependentPlugin = this.plugins.get(dependency.pluginId);
                    if (!dependentPlugin) {
                        if (!dependency.optional) {
                            missingDependencies.push(dependency.pluginId);
                        }
                        continue;
                    }
                    // 检查版本兼容性
                    if (dependency.minVersion || dependency.maxVersion) {
                        pluginVersion = dependentPlugin.metadata.version;
                        if (dependency.minVersion && this.compareVersions(pluginVersion, dependency.minVersion) < 0) {
                            versionMismatches.push("".concat(dependency.pluginId, " (requires >= ").concat(dependency.minVersion, ", found ").concat(pluginVersion, ")"));
                        }
                        if (dependency.maxVersion && this.compareVersions(pluginVersion, dependency.maxVersion) > 0) {
                            versionMismatches.push("".concat(dependency.pluginId, " (requires <= ").concat(dependency.maxVersion, ", found ").concat(pluginVersion, ")"));
                        }
                    }
                }
                if (missingDependencies.length > 0) {
                    throw new Error("Missing dependencies: ".concat(missingDependencies.join(', ')));
                }
                if (versionMismatches.length > 0) {
                    throw new Error("Version mismatches: ".concat(versionMismatches.join(', ')));
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 查找依赖此插件的其他插件
     */
    PluginManager.prototype.findDependentPlugins = function (pluginId) {
        return __awaiter(this, void 0, void 0, function () {
            var dependentPlugins, _i, _a, _b, otherPluginId, plugin, dependencies, dependsOnThisPlugin;
            return __generator(this, function (_c) {
                dependentPlugins = [];
                for (_i = 0, _a = this.plugins.entries(); _i < _a.length; _i++) {
                    _b = _a[_i], otherPluginId = _b[0], plugin = _b[1];
                    if (otherPluginId === pluginId) {
                        continue;
                    }
                    dependencies = this.pluginDependencies.get(otherPluginId) || [];
                    dependsOnThisPlugin = dependencies.some(function (dep) { return dep.pluginId === pluginId && !dep.optional; });
                    if (dependsOnThisPlugin) {
                        dependentPlugins.push(plugin);
                    }
                }
                return [2 /*return*/, dependentPlugins];
            });
        });
    };
    /**
     * 保存插件配置
     */
    PluginManager.prototype.savePluginConfig = function (pluginId) {
        return __awaiter(this, void 0, void 0, function () {
            var context, config, configPath, error_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        context = this.pluginContexts.get(pluginId);
                        if (!context) {
                            return [2 /*return*/];
                        }
                        config = this.pluginConfigs.get(pluginId);
                        if (!config) {
                            return [2 /*return*/];
                        }
                        configPath = path.join(context.pluginDir, this.config.configFileName);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8')];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_14 = _a.sent();
                        this.outputChannel.appendLine("\u26A0\uFE0F Failed to save config for plugin ".concat(pluginId, ": ").concat(error_14));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 比较版本号
     */
    PluginManager.prototype.compareVersions = function (version1, version2) {
        var v1Parts = version1.split('.').map(Number);
        var v2Parts = version2.split('.').map(Number);
        for (var i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
            var v1 = v1Parts[i] || 0;
            var v2 = v2Parts[i] || 0;
            if (v1 > v2)
                return 1;
            if (v1 < v2)
                return -1;
        }
        return 0;
    };
    /**
     * 触发生命周期事件
     */
    PluginManager.prototype.emitLifecycleEvent = function (event) {
        for (var _i = 0, _a = this.lifecycleListeners; _i < _a.length; _i++) {
            var listener = _a[_i];
            try {
                listener(event);
            }
            catch (error) {
                this.outputChannel.appendLine("\u26A0\uFE0F Lifecycle listener error: ".concat(error));
            }
        }
    };
    return PluginManager;
}());
exports.PluginManager = PluginManager;
