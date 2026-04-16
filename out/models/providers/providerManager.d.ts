import { ModelProvider } from './modelProvider';
import { ModelConfig } from '../types';
/**
 * 模型提供者管理器
 * 负责注册、管理和切换模型提供者
 */
export declare class ProviderManager {
    private providers;
    private currentProviderId;
    constructor();
    /**
     * 注册默认提供者
     */
    private registerDefaultProviders;
    /**
     * 注册提供者
     */
    registerProvider(provider: ModelProvider): void;
    /**
     * 获取所有提供者
     */
    getAllProviders(): ModelProvider[];
    /**
     * 获取提供者名称列表
     */
    getProviderNames(): {
        id: string;
        name: string;
        supportedModels: string[];
    }[];
    /**
     * 根据ID获取提供者
     */
    getProvider(id: string): ModelProvider | undefined;
    /**
     * 设置当前提供者
     */
    setCurrentProvider(id: string): boolean;
    /**
     * 获取当前提供者
     */
    getCurrentProvider(): ModelProvider;
    /**
     * 获取当前提供者ID
     */
    getCurrentProviderId(): string;
    /**
     * 根据模型名称猜测最合适的提供者
     */
    guessProviderByModel(modelName: string): ModelProvider | undefined;
    /**
     * 获取提供者的默认配置
     */
    getDefaultConfigForProvider(providerId: string): Partial<ModelConfig>;
    /**
     * 验证配置对于指定提供者是否有效
     */
    validateConfigForProvider(providerId: string, config: ModelConfig): boolean;
}
//# sourceMappingURL=providerManager.d.ts.map