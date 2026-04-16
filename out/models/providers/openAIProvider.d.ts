import { BaseModelProvider } from './modelProvider';
import { ModelResponse, ModelConfig } from '../types';
/**
 * OpenAI 模型提供者
 * 支持GPT系列模型
 */
export declare class OpenAIProvider extends BaseModelProvider {
    readonly name = "OpenAI";
    readonly id = "openai";
    readonly supportedModels: string[];
    getDefaultConfig(): Partial<ModelConfig>;
    getConfigHint(): string;
    generate(prompt: string, config: ModelConfig): Promise<ModelResponse>;
    validateConfig(config: ModelConfig): boolean;
}
//# sourceMappingURL=openAIProvider.d.ts.map