import { BaseModelProvider } from './modelProvider';
import { ModelResponse, ModelConfig } from '../types';
/**
 * Anthropic 模型提供者
 * 支持Claude系列模型
 */
export declare class AnthropicProvider extends BaseModelProvider {
    readonly name = "Anthropic (Claude)";
    readonly id = "anthropic";
    readonly supportedModels: string[];
    getDefaultConfig(): Partial<ModelConfig>;
    getConfigHint(): string;
    generate(prompt: string, config: ModelConfig): Promise<ModelResponse>;
    validateConfig(config: ModelConfig): boolean;
}
//# sourceMappingURL=anthropicProvider.d.ts.map