"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnthropicProvider = void 0;
const modelProvider_1 = require("./modelProvider");
/**
 * Anthropic 模型提供者
 * 支持Claude系列模型
 */
class AnthropicProvider extends modelProvider_1.BaseModelProvider {
    name = 'Anthropic (Claude)';
    id = 'anthropic';
    supportedModels = [
        'claude-3-5-sonnet-20241022',
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307',
        'claude-2.1',
        'claude-2.0',
        'claude-instant-1.2'
    ];
    getDefaultConfig() {
        return {
            baseUrl: 'https://api.anthropic.com',
            model: 'claude-3-5-sonnet-20241022',
            temperature: 0.7,
            maxTokens: 4000
        };
    }
    getConfigHint() {
        return '请设置Anthropic API密钥（可在 https://console.anthropic.com/settings/keys 获取）';
    }
    async generate(prompt, config) {
        if (!this.validateConfig(config)) {
            throw new Error('Anthropic配置无效：API密钥不能为空');
        }
        const headers = {
            'Content-Type': 'application/json',
            'x-api-key': config.apiKey,
            'anthropic-version': '2023-06-01'
        };
        const data = {
            model: config.model,
            max_tokens: config.maxTokens,
            temperature: config.temperature,
            system: 'You are a professional AI programming assistant skilled in generating high-quality code. Return code directly with necessary explanations, without extra formatting markers.',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        };
        const url = `${config.baseUrl}/v1/messages`;
        const result = await this.makeRequest(url, data, headers);
        // Anthropic API返回格式不同，需要适配
        const content = result.content?.[0]?.text || '';
        return {
            content,
            usage: result.usage ? {
                promptTokens: result.usage.input_tokens,
                completionTokens: result.usage.output_tokens,
                totalTokens: result.usage.input_tokens + result.usage.output_tokens
            } : undefined,
            model: result.model
        };
    }
    validateConfig(config) {
        // Anthropic特定验证：检查模型是否受支持
        const isValidModel = this.supportedModels.includes(config.model);
        const hasApiKey = !!config.apiKey && config.apiKey.trim().length > 0;
        return hasApiKey && isValidModel;
    }
}
exports.AnthropicProvider = AnthropicProvider;
//# sourceMappingURL=anthropicProvider.js.map