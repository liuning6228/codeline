"use strict";
/**
 * CodeLine 配置服务
 * 基于Claude Code的配置驱动对话引擎模式 (CP-20260401-001)
 * 提供配置加载、验证、管理和热更新功能
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
exports.ConfigService = void 0;
var codeline_config_1 = require("./codeline-config");
var vscode_1 = require("../lib/vscode");
/**
 * 配置服务类 - 单例模式
 */
var ConfigService = /** @class */ (function () {
    function ConfigService() {
        this.configListeners = [];
        // 初始化使用默认配置
        this.config = __assign({}, codeline_config_1.defaultConfig);
    }
    /**
     * 获取配置服务实例
     */
    ConfigService.getInstance = function () {
        if (!ConfigService.instance) {
            ConfigService.instance = new ConfigService();
        }
        return ConfigService.instance;
    };
    /**
     * 加载配置
     * 优先从VS Code扩展加载，如果失败则使用默认配置
     */
    ConfigService.prototype.loadConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!vscode_1.default.isInVSCode()) return [3 /*break*/, 2];
                        console.log('Loading configuration from VS Code extension...');
                        // 发送配置加载请求
                        vscode_1.default.postMessage({
                            command: 'loadConfig',
                        });
                        // 在真实实现中，这里应该等待VS Code返回配置
                        // 暂时使用默认配置并模拟延迟
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                    case 1:
                        // 在真实实现中，这里应该等待VS Code返回配置
                        // 暂时使用默认配置并模拟延迟
                        _a.sent();
                        // 实际应该接收配置，这里返回默认配置
                        return [2 /*return*/, this.config];
                    case 2:
                        // 非VS Code环境使用默认配置
                        console.log('Running in non-VSCode environment, using default configuration');
                        return [2 /*return*/, this.config];
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error('Failed to load configuration:', error_1);
                        return [2 /*return*/, this.config]; // 出错时返回默认配置
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取当前配置
     */
    ConfigService.prototype.getConfig = function () {
        return __assign({}, this.config);
    };
    /**
     * 更新配置（部分更新）
     */
    ConfigService.prototype.updateConfig = function (updates) {
        return __awaiter(this, void 0, void 0, function () {
            var oldConfig, newConfig, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        oldConfig = __assign({}, this.config);
                        newConfig = __assign(__assign({}, this.config), updates);
                        // 验证配置
                        this.validateConfig(newConfig);
                        // 更新本地配置
                        this.config = newConfig;
                        // 更新配置元数据
                        this.config.metadata = __assign(__assign({}, this.config.metadata), { lastModified: Date.now() });
                        if (!vscode_1.default.isInVSCode()) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.saveToVSCode(newConfig)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        // 通知配置更新
                        this.notifyConfigChange(newConfig);
                        console.log('Configuration updated successfully');
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Failed to update configuration:', error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 重置为默认配置
     */
    ConfigService.prototype.resetToDefaults = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.updateConfig(codeline_config_1.defaultConfig)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 验证配置
     */
    ConfigService.prototype.validateConfig = function (config) {
        // 基本验证
        if (!config.views) {
            throw new Error('Configuration must have views section');
        }
        if (!config.taskExecution) {
            throw new Error('Configuration must have taskExecution section');
        }
        if (!config.model) {
            throw new Error('Configuration must have model section');
        }
        if (!config.tools) {
            throw new Error('Configuration must have tools section');
        }
        if (!config.ui) {
            throw new Error('Configuration must have ui section');
        }
        // 视图配置验证
        this.validateViewConfig(config.views);
        // 任务执行配置验证
        this.validateTaskExecutionConfig(config.taskExecution);
        // 模型配置验证
        this.validateModelConfig(config.model);
        // 工具配置验证
        this.validateToolConfig(config.tools);
        // UI配置验证
        this.validateUIConfig(config.ui);
    };
    /**
     * 验证视图配置
     */
    ConfigService.prototype.validateViewConfig = function (views) {
        // 确保至少一个视图启用
        var enabledViews = Object.values(views).filter(function (view) { return view.enabled; });
        if (enabledViews.length === 0) {
            throw new Error('At least one view must be enabled');
        }
        // 特定视图验证
        if (views.chat.enabled && !views.chat.showTaskSection) {
            console.warn('Chat view enabled but task section is hidden');
        }
        if (views.mcp.enabled && views.mcp.maxConnections < 0) {
            throw new Error('MCP maxConnections must be non-negative');
        }
        if (views.worktrees.enabled && views.worktrees.maxSnapshots < 0) {
            throw new Error('Worktrees maxSnapshots must be non-negative');
        }
    };
    /**
     * 验证任务执行配置
     */
    ConfigService.prototype.validateTaskExecutionConfig = function (taskExecution) {
        if (taskExecution.maxConcurrentTasks < 1) {
            throw new Error('maxConcurrentTasks must be at least 1');
        }
        if (taskExecution.taskTimeoutMs < 0) {
            throw new Error('taskTimeoutMs must be non-negative');
        }
        if (!taskExecution.allowedToolTypes || taskExecution.allowedToolTypes.length === 0) {
            throw new Error('allowedToolTypes must contain at least one tool type');
        }
    };
    /**
     * 验证模型配置
     */
    ConfigService.prototype.validateModelConfig = function (model) {
        if (model.maxTokens < 1) {
            throw new Error('maxTokens must be at least 1');
        }
        if (model.temperature < 0 || model.temperature > 2) {
            throw new Error('temperature must be between 0 and 2');
        }
        if (model.contextWindow < 1) {
            throw new Error('contextWindow must be at least 1');
        }
    };
    /**
     * 验证工具配置
     */
    ConfigService.prototype.validateToolConfig = function (tools) {
        if (tools.maxConcurrentTools < 1) {
            throw new Error('maxConcurrentTools must be at least 1');
        }
        // 验证默认工具
        if (tools.defaultTools) {
            tools.defaultTools.forEach(function (tool, index) {
                if (!tool.name || !tool.type) {
                    throw new Error("Default tool at index ".concat(index, " must have name and type"));
                }
            });
        }
    };
    /**
     * 验证UI配置
     */
    ConfigService.prototype.validateUIConfig = function (ui) {
        if (!['light', 'dark', 'system'].includes(ui.theme)) {
            throw new Error('theme must be one of: light, dark, system');
        }
        if (!['small', 'medium', 'large'].includes(ui.fontSize)) {
            throw new Error('fontSize must be one of: small, medium, large');
        }
        if (ui.animations.duration < 0) {
            throw new Error('animation duration must be non-negative');
        }
    };
    /**
     * 保存配置到VS Code扩展
     */
    ConfigService.prototype.saveToVSCode = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // 发送配置保存请求
                        vscode_1.default.postMessage({
                            command: 'saveConfig',
                            config: config,
                        });
                        // 模拟异步保存
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 50); })];
                    case 1:
                        // 模拟异步保存
                        _a.sent();
                        console.log('Configuration saved to VS Code extension');
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Failed to save configuration to VS Code:', error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 添加配置变更监听器
     */
    ConfigService.prototype.addConfigChangeListener = function (listener) {
        this.configListeners.push(listener);
    };
    /**
     * 移除配置变更监听器
     */
    ConfigService.prototype.removeConfigChangeListener = function (listener) {
        var index = this.configListeners.indexOf(listener);
        if (index > -1) {
            this.configListeners.splice(index, 1);
        }
    };
    /**
     * 通知配置变更
     */
    ConfigService.prototype.notifyConfigChange = function (config) {
        // 复制配置以避免外部修改
        var configCopy = __assign({}, config);
        // 通知所有监听器
        this.configListeners.forEach(function (listener) {
            try {
                listener(configCopy);
            }
            catch (error) {
                console.error('Error in config change listener:', error);
            }
        });
    };
    /**
     * 获取特定视图的配置
     */
    ConfigService.prototype.getViewConfig = function (viewName) {
        return __assign({}, this.config.views[viewName]);
    };
    /**
     * 检查视图是否启用
     */
    ConfigService.prototype.isViewEnabled = function (viewName) {
        var _a;
        return ((_a = this.config.views[viewName]) === null || _a === void 0 ? void 0 : _a.enabled) || false;
    };
    /**
     * 获取所有启用的视图名称
     */
    ConfigService.prototype.getEnabledViews = function () {
        return Object.entries(this.config.views)
            .filter(function (_a) {
            var _ = _a[0], config = _a[1];
            return config.enabled;
        })
            .map(function (_a) {
            var name = _a[0];
            return name;
        });
    };
    /**
     * 导出配置为JSON字符串
     */
    ConfigService.prototype.exportConfig = function () {
        return JSON.stringify(this.config, null, 2);
    };
    /**
     * 从JSON字符串导入配置
     */
    ConfigService.prototype.importConfig = function (configJson) {
        return __awaiter(this, void 0, void 0, function () {
            var parsedConfig, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        parsedConfig = JSON.parse(configJson);
                        return [4 /*yield*/, this.updateConfig(parsedConfig)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        console.error('Failed to import configuration:', error_4);
                        throw new Error('Invalid configuration JSON');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ConfigService;
}());
exports.ConfigService = ConfigService;
