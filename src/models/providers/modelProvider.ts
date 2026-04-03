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
    timeout: number = 60000
  ): Promise<T> {
    const axios = require('axios');
    try {
      // 配置代理（如果存在环境变量）
      const proxyConfig: any = {};
      const httpProxy = process.env.http_proxy || process.env.HTTP_PROXY;
      const httpsProxy = process.env.https_proxy || process.env.HTTPS_PROXY;
      
      // 调试信息：记录网络配置
      console.log(`[CodeLine] Making request to: ${url}`);
      console.log(`[CodeLine] Proxy config - http: ${httpProxy || 'none'}, https: ${httpsProxy || 'none'}`);
      console.log(`[CodeLine] Timeout: ${timeout}ms`);
      
      if (httpsProxy) {
        // 解析代理URL
        const proxyUrl = new URL(httpsProxy);
        proxyConfig.host = proxyUrl.hostname;
        proxyConfig.port = proxyUrl.port ? parseInt(proxyUrl.port) : (proxyUrl.protocol === 'https:' ? 443 : 80);
        proxyConfig.protocol = proxyUrl.protocol;
        console.log(`[CodeLine] Using HTTPS proxy: ${proxyConfig.host}:${proxyConfig.port}`);
      } else if (httpProxy) {
        const proxyUrl = new URL(httpProxy);
        proxyConfig.host = proxyUrl.hostname;
        proxyConfig.port = proxyUrl.port ? parseInt(proxyUrl.port) : (proxyUrl.protocol === 'https:' ? 443 : 80);
        proxyConfig.protocol = proxyUrl.protocol;
        console.log(`[CodeLine] Using HTTP proxy: ${proxyConfig.host}:${proxyConfig.port}`);
      }
      
      const axiosConfig: any = {
        headers,
        timeout,
        ...(Object.keys(proxyConfig).length > 0 ? { proxy: proxyConfig } : {})
      };

      // 对于中国用户，尝试设置更宽松的SSL验证
      if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
        console.log(`[CodeLine] Disabling SSL certificate verification (NODE_TLS_REJECT_UNAUTHORIZED=0)`);
        axiosConfig.httpsAgent = new (require('https').Agent)({ rejectUnauthorized: false });
      }

      console.log(`[CodeLine] Sending request with config:`, {
        url,
        timeout: axiosConfig.timeout,
        hasProxy: Object.keys(proxyConfig).length > 0,
        sslDisabled: !!axiosConfig.httpsAgent
      });

      const response = await axios.post(url, data, axiosConfig);
      
      console.log(`[CodeLine] Request successful, status: ${response.status}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error(`[CodeLine] Request failed:`, error);
      
      if (error.response) {
        // 服务器响应了错误状态码
        const errorDetails = {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        };
        console.error(`[CodeLine] API Error details:`, errorDetails);
        throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // 请求已发送但没有收到响应
        console.error(`[CodeLine] No response received. Request was sent but no response.`);
        console.error(`[CodeLine] Error code: ${error.code}, message: ${error.message}`);
        throw new Error(`Network Error: No response received. Please check your network connection and proxy settings. Error details: ${error.code || 'unknown'} - ${error.message}`);
      } else {
        // 请求设置错误
        console.error(`[CodeLine] Request setup error:`, error.message);
        throw new Error(`Request Error: ${error.message}`);
      }
    }
  }
}