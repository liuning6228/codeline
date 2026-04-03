"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderManager = void 0;
var deepSeekProvider_1 = require("./deepSeekProvider");
var openAIProvider_1 = require("./openAIProvider");
var anthropicProvider_1 = require("./anthropicProvider");
var qwenProvider_1 = require("./qwenProvider");
/**
 * 模型提供者管理器
 * 负责注册、管理和切换模型提供者
 */
var ProviderManager = /** @class */ (function () {
    function ProviderManager() {
        this.providers = new Map();
        this.currentProviderId = 'deepseek';
        this.registerDefaultProviders();
    }
    /**
     * 注册默认提供者
     */
    ProviderManager.prototype.registerDefaultProviders = function () {
        this.registerProvider(new deepSeekProvider_1.DeepSeekProvider());
        this.registerProvider(new openAIProvider_1.OpenAIProvider());
        this.registerProvider(new anthropicProvider_1.AnthropicProvider());
        this.registerProvider(new qwenProvider_1.QwenProvider());
    };
    /**
     * 注册提供者
     */
    ProviderManager.prototype.registerProvider = function (provider) {
        this.providers.set(provider.id, provider);
    };
    /**
     * 获取所有提供者
     */
    ProviderManager.prototype.getAllProviders = function () {
        return Array.from(this.providers.values());
    };
    /**
     * 获取提供者名称列表
     */
    ProviderManager.prototype.getProviderNames = function () {
        return this.getAllProviders().map(function (provider) { return ({
            id: provider.id,
            name: provider.name,
            supportedModels: provider.supportedModels
        }); });
    };
    /**
     * 根据ID获取提供者
     */
    ProviderManager.prototype.getProvider = function (id) {
        return this.providers.get(id);
    };
    /**
     * 设置当前提供者
     */
    ProviderManager.prototype.setCurrentProvider = function (id) {
        if (this.providers.has(id)) {
            this.currentProviderId = id;
            return true;
        }
        return false;
    };
    /**
     * 获取当前提供者
     */
    ProviderManager.prototype.getCurrentProvider = function () {
        var provider = this.providers.get(this.currentProviderId);
        if (!provider) {
            // 回退到第一个可用的提供者
            var firstProvider = this.getAllProviders()[0];
            if (!firstProvider) {
                throw new Error('No model providers available');
            }
            return firstProvider;
        }
        return provider;
    };
    /**
     * 获取当前提供者ID
     */
    ProviderManager.prototype.getCurrentProviderId = function () {
        return this.currentProviderId;
    };
    /**
     * 根据模型名称猜测最合适的提供者
     */
    ProviderManager.prototype.guessProviderByModel = function (modelName) {
        var normalizedModel = modelName.toLowerCase();
        for (var _i = 0, _a = this.getAllProviders(); _i < _a.length; _i++) {
            var provider = _a[_i];
            if (provider.supportedModels.some(function (model) {
                return normalizedModel.includes(model.toLowerCase().replace(/-/g, '')) ||
                    model.toLowerCase().includes(normalizedModel.replace(/-/g, ''));
            })) {
                return provider;
            }
            // 基于模型名称前缀的启发式匹配
            if (normalizedModel.includes('deepseek') && provider.id === 'deepseek') {
                return provider;
            }
            if (normalizedModel.includes('gpt') && provider.id === 'openai') {
                return provider;
            }
            if (normalizedModel.includes('claude') && provider.id === 'anthropic') {
                return provider;
            }
            if (normalizedModel.includes('qwen') && provider.id === 'qwen') {
                return provider;
            }
        }
        return undefined;
    };
    /**
     * 获取提供者的默认配置
     */
    ProviderManager.prototype.getDefaultConfigForProvider = function (providerId) {
        var provider = this.getProvider(providerId);
        if (!provider) {
            return {};
        }
        return provider.getDefaultConfig();
    };
    /**
     * 验证配置对于指定提供者是否有效
     */
    ProviderManager.prototype.validateConfigForProvider = function (providerId, config) {
        var provider = this.getProvider(providerId);
        if (!provider) {
            return false;
        }
        return provider.validateConfig(config);
    };
    return ProviderManager;
}());
exports.ProviderManager = ProviderManager;
