import { BaseModelProvider } from './modelProvider';
import { ModelResponse, ModelConfig } from '../types';
/**
 * DeepSeek 模型提供者
 * 支持DeepSeek系列模型
 */
export declare class DeepSeekProvider extends BaseModelProvider {
    readonly name = "DeepSeek";
    readonly id = "deepseek";
    readonly supportedModels: string[];
    getDefaultConfig(): Partial<ModelConfig>;
    getConfigHint(): string;
    generate(prompt: string, config: ModelConfig): Promise<ModelResponse>;
    validateConfig(config: ModelConfig): boolean;
}
//# sourceMappingURL=deepSeekProvider.d.ts.map