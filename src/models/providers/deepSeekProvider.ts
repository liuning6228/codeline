import { BaseModelProvider } from './modelProvider';
import { ModelResponse, ModelConfig } from '../types';

/**
 * DeepSeek 模型提供者
 * 支持DeepSeek系列模型
 */
export class DeepSeekProvider extends BaseModelProvider {
  readonly name = 'DeepSeek';
  readonly id = 'deepseek';
  readonly supportedModels = [
    'deepseek-chat',
    'deepseek-coder',
    'deepseek-reasoner'
  ];
  
  getDefaultConfig(): Partial<ModelConfig> {
    return {
      baseUrl: 'https://api.deepseek.com',
      model: 'deepseek-chat',
      temperature: 0.7,
      maxTokens: 4000
    };
  }
  
  getConfigHint(): string {
    return '请设置DeepSeek API密钥（可在 https://platform.deepseek.com/api_keys 获取）';
  }
  
  async generate(prompt: string, config: ModelConfig): Promise<ModelResponse> {
    if (!this.validateConfig(config)) {
      throw new Error('DeepSeek配置无效：API密钥不能为空');
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

    const url = `${config.baseUrl}/v1/chat/completions`;
    const result = await this.makeRequest<any>(url, data, headers);
    
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
  
  validateConfig(config: ModelConfig): boolean {
    // DeepSeek特定验证：检查模型是否受支持
    const isValidModel = this.supportedModels.includes(config.model);
    const hasApiKey = !!config.apiKey && config.apiKey.trim().length > 0;
    
    return hasApiKey && isValidModel;
  }
}