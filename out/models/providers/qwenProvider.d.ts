import { BaseModelProvider } from './modelProvider';
import { ModelResponse, ModelConfig } from '../types';
/**
 * Qwen 模型提供者
 * 支持通义千问系列模型
 */
export declare class QwenProvider extends BaseModelProvider {
    readonly name = "Qwen (\u901A\u4E49\u5343\u95EE)";
    readonly id = "qwen";
    readonly supportedModels: string[];
    getDefaultConfig(): Partial<ModelConfig>;
    getConfigHint(): string;
    generate(prompt: string, config: ModelConfig): Promise<ModelResponse>;
    validateConfig(config: ModelConfig): boolean;
}
//# sourceMappingURL=qwenProvider.d.ts.map