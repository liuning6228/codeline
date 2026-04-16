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
export declare abstract class BaseModelProvider implements ModelProvider {
    abstract readonly name: string;
    abstract readonly supportedModels: string[];
    abstract readonly id: string;
    abstract generate(prompt: string, config: ModelConfig): Promise<ModelResponse>;
    testConnection(config: ModelConfig): Promise<boolean>;
    validateConfig(config: ModelConfig): boolean;
    abstract getDefaultConfig(): Partial<ModelConfig>;
    getConfigHint(): string;
    /**
     * 通用HTTP请求方法
     */
    protected makeRequest<T>(url: string, data: any, headers: Record<string, string>, timeout?: number): Promise<T>;
}
//# sourceMappingURL=modelProvider.d.ts.map