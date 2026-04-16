import * as vscode from 'vscode';
import axios from 'axios';
import { ProviderManager } from './providers/providerManager';
import { ModelResponse, ModelConfig } from './types';

// 重新导出类型以保持向后兼容性
export { ModelResponse, ModelConfig };

export class ModelAdapter {
  private config: ModelConfig;
  private isConfigured = false;
  private providerManager: ProviderManager;

  /**
   * 获取当前模型名称
   */
  public get modelName(): string {
    return this.config.model;
  }

  constructor() {
    // 初始化提供者管理器
    this.providerManager = new ProviderManager();
    
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

  private loadConfiguration() {
    const vscodeConfig = vscode.workspace.getConfiguration('codeline');
    
    const apiKey = vscodeConfig.get<string>('apiKey') || process.env.DEEPSEEK_API_KEY || '';
    const defaultModel = vscodeConfig.get<string>('defaultModel') || 'deepseek-chat';
    const providerId = vscodeConfig.get<string>('providerId');
    
    this.config.apiKey = apiKey;
    this.config.model = defaultModel;
    this.isConfigured = !!apiKey;
    
    // 确定提供者ID
    if (providerId) {
      this.config.providerId = providerId;
    } else {
      // 根据模型名称猜测提供者
      const guessedProvider = this.providerManager.guessProviderByModel(defaultModel);
      if (guessedProvider) {
        this.config.providerId = guessedProvider.id;
      } else {
        this.config.providerId = 'deepseek'; // 默认
      }
    }
    
    // 设置当前提供者
    if (this.config.providerId) {
      this.providerManager.setCurrentProvider(this.config.providerId);
    }
    
    // 如果配置中没有baseUrl或需要更新，使用提供者的默认配置
    const provider = this.providerManager.getProvider(this.config.providerId || 'deepseek');
    if (provider) {
      const defaultConfig = provider.getDefaultConfig();
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
  }

  public async generate(prompt: string, overrideConfig?: Partial<ModelConfig>): Promise<ModelResponse> {
    if (!this.isConfigured) {
      throw new Error('CodeLine is not configured. Please set your API key in settings.');
    }

    try {
      // 使用当前提供者生成响应，允许覆盖配置
      const provider = this.providerManager.getCurrentProvider();
      const config = overrideConfig ? { ...this.config, ...overrideConfig } : this.config;
      return await provider.generate(prompt, config);
    } catch (error: any) {
      console.error('Error calling AI API:', error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }



  public async testConnection(): Promise<boolean> {
    try {
      await this.generate('Hello');
      return true;
    } catch (error) {
      return false;
    }
  }

  public getConfiguration(): ModelConfig {
    return { ...this.config };
  }

  public async updateConfiguration(newConfig: Partial<ModelConfig>) {
    const oldProviderId = this.config.providerId;
    this.config = { ...this.config, ...newConfig };
    this.isConfigured = !!this.config.apiKey;
    
    // 如果提供者ID改变，更新当前提供者
    if (this.config.providerId && this.config.providerId !== oldProviderId) {
      this.providerManager.setCurrentProvider(this.config.providerId);
      
      // 如果提供者改变，应用该提供者的默认配置到缺失的字段
      const provider = this.providerManager.getProvider(this.config.providerId);
      if (provider) {
        const defaultConfig = provider.getDefaultConfig();
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
    await this.saveConfiguration();
  }

  private async saveConfiguration() {
    const config = vscode.workspace.getConfiguration('codeline');
    
    // Update VS Code configuration
    await config.update('apiKey', this.config.apiKey, vscode.ConfigurationTarget.Global);
    await config.update('defaultModel', this.config.model, vscode.ConfigurationTarget.Global);
    if (this.config.providerId) {
      await config.update('providerId', this.config.providerId, vscode.ConfigurationTarget.Global);
    }
    
    // Save other settings to global state
    const extensionContext = (global as any).extensionContext as vscode.ExtensionContext | undefined;
    if (extensionContext) {
      await extensionContext.globalState.update('codeline.config', {
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
      });
    }
  }

  public isReady(): boolean {
    return this.isConfigured;
  }

  /**
   * 获取模型信息字符串
   */
  public getModelInfo(): string {
    if (!this.isConfigured) {
      return 'Model not configured';
    }
    const provider = this.providerManager.getCurrentProvider();
    return `${provider.name}: ${this.config.model} (${this.config.baseUrl})`;
  }
  
  /**
   * 获取所有可用模型提供者
   */
  public getAvailableProviders(): Array<{id: string, name: string, supportedModels: string[]}> {
    return this.providerManager.getProviderNames();
  }
  
  /**
   * 设置当前模型提供者
   * @param providerId 提供者ID
   */
  public async setProvider(providerId: string): Promise<boolean> {
    const success = this.providerManager.setCurrentProvider(providerId);
    if (success) {
      this.config.providerId = providerId;
      // 应用新提供者的默认配置
      const provider = this.providerManager.getProvider(providerId);
      if (provider) {
        const defaultConfig = provider.getDefaultConfig();
        // 更新配置，但保留用户已设置的API密钥
        const currentApiKey = this.config.apiKey;
        this.config = { ...this.config, ...defaultConfig, providerId };
        this.config.apiKey = currentApiKey; // 保持API密钥不变
        
        // 保存配置
        await this.saveConfiguration();
      }
      return true;
    }
    return false;
  }
  
  /**
   * 获取当前提供者信息
   */
  public getCurrentProviderInfo(): {id: string, name: string, configHint: string} {
    const provider = this.providerManager.getCurrentProvider();
    return {
      id: provider.id,
      name: provider.name,
      configHint: provider.getConfigHint()
    };
  }
  
  /**
   * 验证当前配置是否有效
   */
  public validateCurrentConfig(): boolean {
    const provider = this.providerManager.getCurrentProvider();
    return provider.validateConfig(this.config);
  }

  /**
   * 清理JSON响应中的Markdown代码块
   * @param jsonString 可能包含Markdown代码块的JSON字符串
   * @returns 清理后的纯JSON字符串
   */
  public static cleanJsonResponse(jsonString: string): string {
    if (!jsonString || typeof jsonString !== 'string') {
      return jsonString;
    }
    
    // 移除开头的 ```json 或 ``` 标记
    let cleaned = jsonString.trim();
    
    // 移除开头的 ```json、```javascript、```typescript 等
    if (cleaned.startsWith('```')) {
      const firstNewline = cleaned.indexOf('\n');
      if (firstNewline !== -1) {
        cleaned = cleaned.substring(firstNewline + 1);
      } else {
        // 如果没有换行符，直接移除 ```
        cleaned = cleaned.substring(3);
      }
    }
    
    // 移除结尾的 ```
    const lastBackticks = cleaned.lastIndexOf('```');
    if (lastBackticks !== -1) {
      cleaned = cleaned.substring(0, lastBackticks);
    }
    
    // 清理后再次trim
    cleaned = cleaned.trim();
    
    // 如果字符串以 { 或 [ 开头，确保它是有效的JSON
    return cleaned;
  }
  
  /**
   * 安全解析JSON，自动清理Markdown代码块
   * @param jsonString 可能包含Markdown代码块的JSON字符串
   * @returns 解析后的JSON对象
   */
  public static safeParseJson(jsonString: string): any {
    try {
      const cleaned = ModelAdapter.cleanJsonResponse(jsonString);
      return JSON.parse(cleaned);
    } catch (error) {
      // 如果清理后仍然失败，尝试更激进的清理
      console.warn('Failed to parse JSON after cleaning:', error);
      
      // 尝试提取第一个 { 和最后一个 } 之间的内容
      const firstBrace = jsonString.indexOf('{');
      const lastBrace = jsonString.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const extracted = jsonString.substring(firstBrace, lastBrace + 1);
        try {
          return JSON.parse(extracted);
        } catch (innerError) {
          console.error('Failed to parse extracted JSON:', innerError);
          throw new Error(`Invalid JSON response: ${jsonString.substring(0, 100)}...`);
        }
      }
      
      throw error;
    }
  }
}