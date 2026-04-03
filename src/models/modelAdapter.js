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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelAdapter = void 0;
var vscode = require("vscode");
var providerManager_1 = require("./providers/providerManager");
var ModelAdapter = /** @class */ (function () {
    function ModelAdapter() {
        this.isConfigured = false;
        // 初始化提供者管理器
        this.providerManager = new providerManager_1.ProviderManager();
        // Default configuration
        this.config = {
            apiKey: '',
            baseUrl: 'https://api.deepseek.com',
            model: 'deepseek-chat',
            temperature: 0.7,
            maxTokens: 4000,
            providerId: 'deepseek', // 默认提供者
            autoAnalyze: false,
            showExamples: true,
            typingIndicator: true,
            autoApproveCreate: false,
            autoApproveEdit: false,
            autoApproveDelete: false,
            autoApproveDelay: 5
        };
        this.loadConfiguration();
    }
    ModelAdapter.prototype.loadConfiguration = function () {
        var vscodeConfig = vscode.workspace.getConfiguration('codeline');
        var apiKey = vscodeConfig.get('apiKey') || process.env.DEEPSEEK_API_KEY || '';
        var defaultModel = vscodeConfig.get('defaultModel') || 'deepseek-chat';
        var providerId = vscodeConfig.get('providerId');
        this.config.apiKey = apiKey;
        this.config.model = defaultModel;
        this.isConfigured = !!apiKey;
        // 确定提供者ID
        if (providerId) {
            this.config.providerId = providerId;
        }
        else {
            // 根据模型名称猜测提供者
            var guessedProvider = this.providerManager.guessProviderByModel(defaultModel);
            if (guessedProvider) {
                this.config.providerId = guessedProvider.id;
            }
            else {
                this.config.providerId = 'deepseek'; // 默认
            }
        }
        // 设置当前提供者
        if (this.config.providerId) {
            this.providerManager.setCurrentProvider(this.config.providerId);
        }
        // 如果配置中没有baseUrl或需要更新，使用提供者的默认配置
        var provider = this.providerManager.getProvider(this.config.providerId || 'deepseek');
        if (provider) {
            var defaultConfig = provider.getDefaultConfig();
            // 更新缺失的配置项
            if (!this.config.baseUrl || this.config.baseUrl === 'https://api.deepseek.com') {
                this.config.baseUrl = defaultConfig.baseUrl || this.config.baseUrl;
            }
            // 确保模型在提供者支持的列表中
            if (provider.supportedModels.length > 0 && !provider.supportedModels.includes(this.config.model)) {
                // 如果不支持，使用提供者的第一个模型
                this.config.model = provider.supportedModels[0];
            }
        }
    };
    ModelAdapter.prototype.generate = function (prompt, overrideConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var provider, config, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isConfigured) {
                            throw new Error('CodeLine is not configured. Please set your API key in settings.');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        provider = this.providerManager.getCurrentProvider();
                        config = overrideConfig ? __assign(__assign({}, this.config), overrideConfig) : this.config;
                        return [4 /*yield*/, provider.generate(prompt, config)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Error calling AI API:', error_1);
                        throw new Error("Failed to generate response: ".concat(error_1.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ModelAdapter.prototype.testConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.generate('Hello')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 2:
                        error_2 = _a.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelAdapter.prototype.getConfiguration = function () {
        return __assign({}, this.config);
    };
    ModelAdapter.prototype.updateConfiguration = function (newConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var oldProviderId, provider, defaultConfig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        oldProviderId = this.config.providerId;
                        this.config = __assign(__assign({}, this.config), newConfig);
                        this.isConfigured = !!this.config.apiKey;
                        // 如果提供者ID改变，更新当前提供者
                        if (this.config.providerId && this.config.providerId !== oldProviderId) {
                            this.providerManager.setCurrentProvider(this.config.providerId);
                            provider = this.providerManager.getProvider(this.config.providerId);
                            if (provider) {
                                defaultConfig = provider.getDefaultConfig();
                                // 只更新未提供的配置项
                                if (!newConfig.baseUrl && defaultConfig.baseUrl) {
                                    this.config.baseUrl = defaultConfig.baseUrl;
                                }
                                if (!newConfig.model && defaultConfig.model) {
                                    this.config.model = defaultConfig.model;
                                }
                                if (defaultConfig.temperature !== undefined && newConfig.temperature === undefined) {
                                    this.config.temperature = defaultConfig.temperature;
                                }
                                if (defaultConfig.maxTokens !== undefined && newConfig.maxTokens === undefined) {
                                    this.config.maxTokens = defaultConfig.maxTokens;
                                }
                            }
                        }
                        // Save to VS Code configuration
                        return [4 /*yield*/, this.saveConfiguration()];
                    case 1:
                        // Save to VS Code configuration
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ModelAdapter.prototype.saveConfiguration = function () {
        return __awaiter(this, void 0, void 0, function () {
            var config, extensionContext;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = vscode.workspace.getConfiguration('codeline');
                        // Update VS Code configuration
                        return [4 /*yield*/, config.update('apiKey', this.config.apiKey, vscode.ConfigurationTarget.Global)];
                    case 1:
                        // Update VS Code configuration
                        _a.sent();
                        return [4 /*yield*/, config.update('defaultModel', this.config.model, vscode.ConfigurationTarget.Global)];
                    case 2:
                        _a.sent();
                        if (!this.config.providerId) return [3 /*break*/, 4];
                        return [4 /*yield*/, config.update('providerId', this.config.providerId, vscode.ConfigurationTarget.Global)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        extensionContext = global.extensionContext;
                        if (!extensionContext) return [3 /*break*/, 6];
                        return [4 /*yield*/, extensionContext.globalState.update('codeline.config', {
                                baseUrl: this.config.baseUrl,
                                temperature: this.config.temperature,
                                maxTokens: this.config.maxTokens,
                                providerId: this.config.providerId,
                                autoAnalyze: this.config.autoAnalyze,
                                showExamples: this.config.showExamples,
                                typingIndicator: this.config.typingIndicator,
                                autoApproveCreate: this.config.autoApproveCreate,
                                autoApproveEdit: this.config.autoApproveEdit,
                                autoApproveDelete: this.config.autoApproveDelete,
                                autoApproveDelay: this.config.autoApproveDelay
                            })];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ModelAdapter.prototype.isReady = function () {
        return this.isConfigured;
    };
    /**
     * 获取模型信息字符串
     */
    ModelAdapter.prototype.getModelInfo = function () {
        if (!this.isConfigured) {
            return 'Model not configured';
        }
        var provider = this.providerManager.getCurrentProvider();
        return "".concat(provider.name, ": ").concat(this.config.model, " (").concat(this.config.baseUrl, ")");
    };
    /**
     * 获取所有可用模型提供者
     */
    ModelAdapter.prototype.getAvailableProviders = function () {
        return this.providerManager.getProviderNames();
    };
    /**
     * 设置当前模型提供者
     * @param providerId 提供者ID
     */
    ModelAdapter.prototype.setProvider = function (providerId) {
        return __awaiter(this, void 0, void 0, function () {
            var success, provider, defaultConfig, currentApiKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        success = this.providerManager.setCurrentProvider(providerId);
                        if (!success) return [3 /*break*/, 3];
                        this.config.providerId = providerId;
                        provider = this.providerManager.getProvider(providerId);
                        if (!provider) return [3 /*break*/, 2];
                        defaultConfig = provider.getDefaultConfig();
                        currentApiKey = this.config.apiKey;
                        this.config = __assign(__assign(__assign({}, this.config), defaultConfig), { providerId: providerId });
                        this.config.apiKey = currentApiKey; // 保持API密钥不变
                        // 保存配置
                        return [4 /*yield*/, this.saveConfiguration()];
                    case 1:
                        // 保存配置
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, true];
                    case 3: return [2 /*return*/, false];
                }
            });
        });
    };
    /**
     * 获取当前提供者信息
     */
    ModelAdapter.prototype.getCurrentProviderInfo = function () {
        var provider = this.providerManager.getCurrentProvider();
        return {
            id: provider.id,
            name: provider.name,
            configHint: provider.getConfigHint()
        };
    };
    /**
     * 验证当前配置是否有效
     */
    ModelAdapter.prototype.validateCurrentConfig = function () {
        var provider = this.providerManager.getCurrentProvider();
        return provider.validateConfig(this.config);
    };
    return ModelAdapter;
}());
exports.ModelAdapter = ModelAdapter;
