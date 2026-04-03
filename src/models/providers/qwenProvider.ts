import { BaseModelProvider } from './modelProvider';
import { ModelResponse, ModelConfig } from '../types';

/**
 * Qwen 模型提供者
 * 支持通义千问系列模型
 */
export class QwenProvider extends BaseModelProvider {
  readonly name = 'Qwen (通义千问)';
  readonly id = 'qwen';
  readonly supportedModels = [
    'qwen-max',
    'qwen-plus',
    'qwen-turbo',
    'qwen2.5-coder-32b-instruct',
    'qwen2.5-coder-7b-instruct',
    'qwen2.5-32b-instruct',
    'qwen2.5-7b-instruct'
  ];
  
  getDefaultConfig(): Partial<ModelConfig> {
    return {
      baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      model: 'qwen-max',
      temperature: 0.7,
      maxTokens: 4000
    };
  }
  
  getConfigHint(): string {
    return '请设置阿里云通义千问API密钥（可在 https://dashscope.console.aliyun.com/apiKey 获取）';
  }
  
  async generate(prompt: string, config: ModelConfig): Promise<ModelResponse> {
    if (!this.validateConfig(config)) {
      throw new Error('Qwen配置无效：API密钥不能为空');
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

    const url = config.baseUrl.endsWith('/chat/completions') 
      ? config.baseUrl 
      : `${config.baseUrl}/chat/completions`;
    
    const result = await this.makeRequest<any>(url, data, headers);
    
    // Qwen API返回格式可能不同，需要检查
    let content = '';
    let modelName = config.model;
    let usage = undefined;
    
    if (result.choices && result.choices[0]?.message?.content) {
      // OpenAI兼容格式
      content = result.choices[0].message.content;
      modelName = result.model || config.model;
      if (result.usage) {
        usage = {
          promptTokens: result.usage.prompt_tokens || result.usage.input_tokens || 0,
          completionTokens: result.usage.completion_tokens || result.usage.output_tokens || 0,
          totalTokens: result.usage.total_tokens || 
            ((result.usage.prompt_tokens || result.usage.input_tokens || 0) + 
             (result.usage.completion_tokens || result.usage.output_tokens || 0))
        };
      }
    } else if (result.output && result.output.text) {
      // Qwen原始格式
      content = result.output.text;
      modelName = config.model;
      if (result.usage) {
        usage = {
          promptTokens: result.usage.input_tokens || 0,
          completionTokens: result.usage.output_tokens || 0,
          totalTokens: (result.usage.input_tokens || 0) + (result.usage.output_tokens || 0)
        };
      }
    } else {
      // 尝试其他常见格式
      content = result.text || result.content || JSON.stringify(result);
    }
    
    return {
      content,
      usage,
      model: modelName
    };
  }
  
  validateConfig(config: ModelConfig): boolean {
    // Qwen特定验证：检查模型是否受支持
    const isValidModel = this.supportedModels.includes(config.model);
    const hasApiKey = !!config.apiKey && config.apiKey.trim().length > 0;
    
    return hasApiKey && isValidModel;
  }
}