"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIProvider = void 0;
const modelProvider_1 = require("./modelProvider");
/**
 * OpenAI 模型提供者
 * 支持GPT系列模型
 */
class OpenAIProvider extends modelProvider_1.BaseModelProvider {
    name = 'OpenAI';
    id = 'openai';
    supportedModels = [
        'gpt-4o',
        'gpt-4-turbo',
        'gpt-4',
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-instruct'
    ];
    getDefaultConfig() {
        return {
            baseUrl: 'https://api.openai.com',
            model: 'gpt-4o',
            temperature: 0.7,
            maxTokens: 4000
        };
    }
    getConfigHint() {
        return '请设置OpenAI API密钥（可在 https://platform.openai.com/api-keys 获取）';
    }
    async generate(prompt, config) {
        if (!this.validateConfig(config)) {
            throw new Error('OpenAI配置无效：API密钥不能为空');
        }
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
        };
        const data = {
            model: config.model,
            messages: [
                {
                    role: 'system',
                    content: 'You are a professional AI programming assistant skilled in generating high-quality code. Return code directly with necessary explanations, without extra formatting markers.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: config.temperature,
            max_tokens: config.maxTokens,
            stream: false
        };
        const url = `${config.baseUrl}/v1/chat/completions`;
        const result = await this.makeRequest(url, data, headers);
        return {
            content: result.choices[0]?.message?.content || '',
            usage: result.usage ? {
                promptTokens: result.usage.prompt_tokens,
                completionTokens: result.usage.completion_tokens,
                totalTokens: result.usage.total_tokens
            } : undefined,
            model: result.model
        };
    }
    validateConfig(config) {
        // OpenAI特定验证：检查模型是否受支持
        const isValidModel = this.supportedModels.includes(config.model);
        const hasApiKey = !!config.apiKey && config.apiKey.trim().length > 0;
        return hasApiKey && isValidModel;
    }
}
exports.OpenAIProvider = OpenAIProvider;
//# sourceMappingURL=openAIProvider.js.map