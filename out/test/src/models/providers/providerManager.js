"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderManager = void 0;
const deepSeekProvider_1 = require("./deepSeekProvider");
const openAIProvider_1 = require("./openAIProvider");
const anthropicProvider_1 = require("./anthropicProvider");
const qwenProvider_1 = require("./qwenProvider");
/**
 * 模型提供者管理器
 * 负责注册、管理和切换模型提供者
 */
class ProviderManager {
    providers = new Map();
    currentProviderId = 'deepseek';
    constructor() {
        this.registerDefaultProviders();
    }
    /**
     * 注册默认提供者
     */
    registerDefaultProviders() {
        this.registerProvider(new deepSeekProvider_1.DeepSeekProvider());
        this.registerProvider(new openAIProvider_1.OpenAIProvider());
        this.registerProvider(new anthropicProvider_1.AnthropicProvider());
        this.registerProvider(new qwenProvider_1.QwenProvider());
    }
    /**
     * 注册提供者
     */
    registerProvider(provider) {
        this.providers.set(provider.id, provider);
    }
    /**
     * 获取所有提供者
     */
    getAllProviders() {
        return Array.from(this.providers.values());
    }
    /**
     * 获取提供者名称列表
     */
    getProviderNames() {
        return this.getAllProviders().map(provider => ({
            id: provider.id,
            name: provider.name,
            supportedModels: provider.supportedModels
        }));
    }
    /**
     * 根据ID获取提供者
     */
    getProvider(id) {
        return this.providers.get(id);
    }
    /**
     * 设置当前提供者
     */
    setCurrentProvider(id) {
        if (this.providers.has(id)) {
            this.currentProviderId = id;
            return true;
        }
        return false;
    }
    /**
     * 获取当前提供者
     */
    getCurrentProvider() {
        const provider = this.providers.get(this.currentProviderId);
        if (!provider) {
            // 回退到第一个可用的提供者
            const firstProvider = this.getAllProviders()[0];
            if (!firstProvider) {
                throw new Error('No model providers available');
            }
            return firstProvider;
        }
        return provider;
    }
    /**
     * 获取当前提供者ID
     */
    getCurrentProviderId() {
        return this.currentProviderId;
    }
    /**
     * 根据模型名称猜测最合适的提供者
     */
    guessProviderByModel(modelName) {
        const normalizedModel = modelName.toLowerCase();
        for (const provider of this.getAllProviders()) {
            if (provider.supportedModels.some(model => normalizedModel.includes(model.toLowerCase().replace(/-/g, '')) ||
                model.toLowerCase().includes(normalizedModel.replace(/-/g, '')))) {
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
    }
    /**
     * 获取提供者的默认配置
     */
    getDefaultConfigForProvider(providerId) {
        const provider = this.getProvider(providerId);
        if (!provider) {
            return {};
        }
        return provider.getDefaultConfig();
    }
    /**
     * 验证配置对于指定提供者是否有效
     */
    validateConfigForProvider(providerId, config) {
        const provider = this.getProvider(providerId);
        if (!provider) {
            return false;
        }
        return provider.validateConfig(config);
    }
}
exports.ProviderManager = ProviderManager;
//# sourceMappingURL=providerManager.js.map