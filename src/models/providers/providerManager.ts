import { ModelProvider } from './modelProvider';
import { DeepSeekProvider } from './deepSeekProvider';
import { OpenAIProvider } from './openAIProvider';
import { AnthropicProvider } from './anthropicProvider';
import { QwenProvider } from './qwenProvider';
import { ModelConfig } from '../types';

/**
 * 模型提供者管理器
 * 负责注册、管理和切换模型提供者
 */
export class ProviderManager {
  private providers: Map<string, ModelProvider> = new Map();
  private currentProviderId: string = 'deepseek';
  
  constructor() {
    this.registerDefaultProviders();
  }
  
  /**
   * 注册默认提供者
   */
  private registerDefaultProviders() {
    this.registerProvider(new DeepSeekProvider());
    this.registerProvider(new OpenAIProvider());
    this.registerProvider(new AnthropicProvider());
    this.registerProvider(new QwenProvider());
  }
  
  /**
   * 注册提供者
   */
  registerProvider(provider: ModelProvider): void {
    this.providers.set(provider.id, provider);
  }
  
  /**
   * 获取所有提供者
   */
  getAllProviders(): ModelProvider[] {
    return Array.from(this.providers.values());
  }
  
  /**
   * 获取提供者名称列表
   */
  getProviderNames(): { id: string; name: string; supportedModels: string[] }[] {
    return this.getAllProviders().map(provider => ({
      id: provider.id,
      name: provider.name,
      supportedModels: provider.supportedModels
    }));
  }
  
  /**
   * 根据ID获取提供者
   */
  getProvider(id: string): ModelProvider | undefined {
    return this.providers.get(id);
  }
  
  /**
   * 设置当前提供者
   */
  setCurrentProvider(id: string): boolean {
    if (this.providers.has(id)) {
      this.currentProviderId = id;
      return true;
    }
    return false;
  }
  
  /**
   * 获取当前提供者
   */
  getCurrentProvider(): ModelProvider {
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
  getCurrentProviderId(): string {
    return this.currentProviderId;
  }
  
  /**
   * 根据模型名称猜测最合适的提供者
   */
  guessProviderByModel(modelName: string): ModelProvider | undefined {
    const normalizedModel = modelName.toLowerCase();
    
    for (const provider of this.getAllProviders()) {
      if (provider.supportedModels.some(model => 
        normalizedModel.includes(model.toLowerCase().replace(/-/g, '')) ||
        model.toLowerCase().includes(normalizedModel.replace(/-/g, ''))
      )) {
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
  getDefaultConfigForProvider(providerId: string): Partial<ModelConfig> {
    const provider = this.getProvider(providerId);
    if (!provider) {
      return {};
    }
    return provider.getDefaultConfig();
  }
  
  /**
   * 验证配置对于指定提供者是否有效
   */
  validateConfigForProvider(providerId: string, config: ModelConfig): boolean {
    const provider = this.getProvider(providerId);
    if (!provider) {
      return false;
    }
    return provider.validateConfig(config);
  }
}