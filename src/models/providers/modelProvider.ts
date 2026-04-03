import { ModelResponse, ModelConfig } from '../types';

/**
 * 模型提供者接口
 * 定义不同AI模型提供者的统一接口
 */
export interface ModelProvider {
  /**
   * 提供者名称（用于显示）
   */
  readonly name: string;
  
  /**
   * 支持的模型列表
   */
  readonly supportedModels: string[];
  
  /**
   * 提供者ID（用于标识）
   */
  readonly id: string;
  
  /**
   * 生成AI响应
   * @param prompt 用户提示
   * @param config 模型配置
   */
  generate(prompt: string, config: ModelConfig): Promise<ModelResponse>;
  
  /**
   * 测试连接
   * @param config 模型配置
   */
  testConnection(config: ModelConfig): Promise<boolean>;
  
  /**
   * 验证配置是否有效
   * @param config 模型配置
   */
  validateConfig(config: ModelConfig): boolean;
  
  /**
   * 获取默认配置
   */
  getDefaultConfig(): Partial<ModelConfig>;
  
  /**
   * 获取提供者特定的配置提示
   */
  getConfigHint(): string;
}

/**
 * 基础提供者抽象类
 * 提供一些通用实现
 */
export abstract class BaseModelProvider implements ModelProvider {
  abstract readonly name: string;
  abstract readonly supportedModels: string[];
  abstract readonly id: string;
  
  abstract generate(prompt: string, config: ModelConfig): Promise<ModelResponse>;
  
  async testConnection(config: ModelConfig): Promise<boolean> {
    try {
      // 发送一个简单的测试请求
      await this.generate('Hello', config);
      return true;
    } catch (error) {
      console.error(`Connection test failed for ${this.name}:`, error);
      return false;
    }
  }
  
  validateConfig(config: ModelConfig): boolean {
    // 基础验证：API密钥不能为空
    return !!config.apiKey && config.apiKey.trim().length > 0;
  }
  
  abstract getDefaultConfig(): Partial<ModelConfig>;
  
  getConfigHint(): string {
    return `请设置${this.name}的API密钥`;
  }
  
  /**
   * 通用HTTP请求方法
   */
  protected async makeRequest<T>(
    url: string,
    data: any,
    headers: Record<string, string>,
    timeout: number = 30000
  ): Promise<T> {
    const axios = require('axios');
    try {
      const response = await axios.post(url, data, {
        headers,
        timeout
      });
      
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      if (error.response) {
        // 服务器响应了错误状态码
        throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // 请求已发送但没有收到响应
        throw new Error(`Network Error: No response received`);
      } else {
        // 请求设置错误
        throw new Error(`Request Error: ${error.message}`);
      }
    }
  }
}