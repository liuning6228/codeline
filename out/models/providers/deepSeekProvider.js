"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepSeekProvider = void 0;
const modelProvider_1 = require("./modelProvider");
/**
 * DeepSeek 模型提供者
 * 支持DeepSeek系列模型
 */
class DeepSeekProvider extends modelProvider_1.BaseModelProvider {
    name = 'DeepSeek';
    id = 'deepseek';
    supportedModels = [
        'deepseek-chat',
        'deepseek-coder',
        'deepseek-reasoner'
    ];
    getDefaultConfig() {
        return {
            baseUrl: 'https://api.deepseek.com',
            model: 'deepseek-chat',
            temperature: 0.7,
            maxTokens: 4000
        };
    }
    getConfigHint() {
        return '请设置DeepSeek API密钥（可在 https://platform.deepseek.com/api_keys 获取）';
    }
    async generate(prompt, config) {
        if (!this.validateConfig(config)) {
            throw new Error('DeepSeek配置无效：API密钥不能为空');
        }
        console.log(`[CodeLine] DeepSeekProvider generating response for prompt: ${prompt.substring(0, 50)}...`);
        console.log(`[CodeLine] Using model: ${config.model}, baseUrl: ${config.baseUrl}`);
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
        };
        const data = {
            model: config.model,
            messages: [
                {
                    role: 'system',
                    content: '你是一个专业的AI编程助手，擅长生成高质量的代码。请直接返回代码和必要的解释，不要包含额外的格式标记。'
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
        // 尝试两种可能的URL格式
        let url = `${config.baseUrl}/v1/chat/completions`;
        console.log(`[CodeLine] Request URL: ${url}`);
        console.log(`[CodeLine] Request headers:`, headers);
        console.log(`[CodeLine] Request data (truncated):`, {
            model: data.model,
            messages: data.messages.map(m => ({ role: m.role, content_length: m.content.length })),
            temperature: data.temperature,
            max_tokens: data.max_tokens
        });
        try {
            const result = await this.makeRequest(url, data, headers);
            console.log(`[CodeLine] DeepSeek request successful, response received`);
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
        catch (error) {
            console.error(`[CodeLine] DeepSeek request failed, trying alternative URL format...`);
            // 尝试备用URL格式
            const altUrl = `${config.baseUrl}/chat/completions`;
            console.log(`[CodeLine] Trying alternative URL: ${altUrl}`);
            try {
                const result = await this.makeRequest(altUrl, data, headers);
                console.log(`[CodeLine] Alternative URL request successful`);
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
            catch (altError) {
                console.error(`[CodeLine] Both URL formats failed`);
                throw error; // 抛出原始错误
            }
        }
    }
    validateConfig(config) {
        // DeepSeek特定验证：检查模型是否受支持
        const isValidModel = this.supportedModels.includes(config.model);
        const hasApiKey = !!config.apiKey && config.apiKey.trim().length > 0;
        return hasApiKey && isValidModel;
    }
}
exports.DeepSeekProvider = DeepSeekProvider;
//# sourceMappingURL=deepSeekProvider.js.map