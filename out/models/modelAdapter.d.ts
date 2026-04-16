import { ModelResponse, ModelConfig } from './types';
export { ModelResponse, ModelConfig };
export declare class ModelAdapter {
    private config;
    private isConfigured;
    private providerManager;
    /**
     * 获取当前模型名称
     */
    get modelName(): string;
    constructor();
    private loadConfiguration;
    generate(prompt: string, overrideConfig?: Partial<ModelConfig>): Promise<ModelResponse>;
    testConnection(): Promise<boolean>;
    getConfiguration(): ModelConfig;
    updateConfiguration(newConfig: Partial<ModelConfig>): Promise<void>;
    private saveConfiguration;
    isReady(): boolean;
    /**
     * 获取模型信息字符串
     */
    getModelInfo(): string;
    /**
     * 获取所有可用模型提供者
     */
    getAvailableProviders(): Array<{
        id: string;
        name: string;
        supportedModels: string[];
    }>;
    /**
     * 设置当前模型提供者
     * @param providerId 提供者ID
     */
    setProvider(providerId: string): Promise<boolean>;
    /**
     * 获取当前提供者信息
     */
    getCurrentProviderInfo(): {
        id: string;
        name: string;
        configHint: string;
    };
    /**
     * 验证当前配置是否有效
     */
    validateCurrentConfig(): boolean;
    /**
     * 清理JSON响应中的Markdown代码块
     * @param jsonString 可能包含Markdown代码块的JSON字符串
     * @returns 清理后的纯JSON字符串
     */
    static cleanJsonResponse(jsonString: string): string;
    /**
     * 安全解析JSON，自动清理Markdown代码块
     * @param jsonString 可能包含Markdown代码块的JSON字符串
     * @returns 解析后的JSON对象
     */
    static safeParseJson(jsonString: string): any;
}
//# sourceMappingURL=modelAdapter.d.ts.map