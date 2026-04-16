import { ApiFormat } from "./proto/cline/models";
import type { ApiHandlerSettings } from "./storage/state-keys";
export type ApiProvider = "anthropic" | "claude-code" | "openrouter" | "bedrock" | "vertex" | "openai" | "ollama" | "lmstudio" | "gemini" | "openai-native" | "openai-codex" | "requesty" | "together" | "deepseek" | "qwen" | "qwen-code" | "doubao" | "mistral" | "vscode-lm" | "cline" | "litellm" | "moonshot" | "nebius" | "fireworks" | "asksage" | "xai" | "sambanova" | "cerebras" | "sapaicore" | "groq" | "huggingface" | "huawei-cloud-maas" | "dify" | "baseten" | "vercel-ai-gateway" | "zai" | "oca" | "aihubmix" | "minimax" | "hicap" | "nousResearch" | "wandb";
export declare const DEFAULT_API_PROVIDER: ApiProvider;
export interface ApiHandlerOptions extends Partial<ApiHandlerSettings> {
    ulid?: string;
    onRetryAttempt?: (attempt: number, maxRetries: number, delay: number, error: any) => void;
}
export type ApiConfiguration = ApiHandlerOptions;
interface PriceTier {
    tokenLimit: number;
    price: number;
}
export interface ModelInfo {
    name?: string;
    maxTokens?: number;
    contextWindow?: number;
    supportsImages?: boolean;
    supportsPromptCache: boolean;
    supportsReasoning?: boolean;
    inputPrice?: number;
    outputPrice?: number;
    thinkingConfig?: {
        maxBudget?: number;
        outputPrice?: number;
        outputPriceTiers?: PriceTier[];
        geminiThinkingLevel?: "low" | "high";
        supportsThinkingLevel?: boolean;
    };
    supportsGlobalEndpoint?: boolean;
    cacheWritesPrice?: number;
    cacheReadsPrice?: number;
    description?: string;
    tiers?: {
        contextWindow: number;
        inputPrice?: number;
        outputPrice?: number;
        cacheWritesPrice?: number;
        cacheReadsPrice?: number;
    }[];
    temperature?: number;
    apiFormat?: ApiFormat;
}
export interface OpenAiCompatibleModelInfo extends ModelInfo {
    temperature?: number;
    isR1FormatRequired?: boolean;
    systemRole?: "developer" | "system";
    supportsReasoningEffort?: boolean;
    supportsTools?: boolean;
    supportsStreaming?: boolean;
}
export interface OcaModelInfo extends OpenAiCompatibleModelInfo {
    modelName: string;
    surveyId?: string;
    banner?: string;
    surveyContent?: string;
    supportsReasoning?: boolean;
    reasoningEffortOptions: string[];
}
export declare const CLAUDE_SONNET_1M_SUFFIX = ":1m";
export declare const ANTHROPIC_FAST_MODE_SUFFIX = ":fast";
export declare const CLAUDE_SONNET_1M_TIERS: {
    contextWindow: number;
    inputPrice: number;
    outputPrice: number;
    cacheWritesPrice: number;
    cacheReadsPrice: number;
}[];
export declare const CLAUDE_OPUS_1M_TIERS: {
    contextWindow: number;
    inputPrice: number;
    outputPrice: number;
    cacheWritesPrice: number;
    cacheReadsPrice: number;
}[];
export interface HicapCompatibleModelInfo extends ModelInfo {
    temperature?: number;
}
export declare const hicapModelInfoSaneDefaults: HicapCompatibleModelInfo;
export type AnthropicModelId = keyof typeof anthropicModels;
export declare const anthropicDefaultModelId: AnthropicModelId;
export declare const ANTHROPIC_MIN_THINKING_BUDGET = 1024;
export declare const ANTHROPIC_MAX_THINKING_BUDGET = 6000;
export declare const anthropicModels: {
    readonly "claude-sonnet-4-6": {
        readonly maxTokens: 64000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
    };
    readonly "claude-sonnet-4-6:1m": {
        readonly maxTokens: 64000;
        readonly contextWindow: 1000000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
        readonly tiers: {
            contextWindow: number;
            inputPrice: number;
            outputPrice: number;
            cacheWritesPrice: number;
            cacheReadsPrice: number;
        }[];
    };
    readonly "claude-sonnet-4-5-20250929": {
        readonly maxTokens: 64000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
    };
    readonly "claude-sonnet-4-5-20250929:1m": {
        readonly maxTokens: 64000;
        readonly contextWindow: 1000000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
        readonly tiers: {
            contextWindow: number;
            inputPrice: number;
            outputPrice: number;
            cacheWritesPrice: number;
            cacheReadsPrice: number;
        }[];
    };
    readonly "claude-haiku-4-5-20251001": {
        readonly maxTokens: 64000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly inputPrice: 1;
        readonly outputPrice: 5;
        readonly cacheWritesPrice: 1.25;
        readonly cacheReadsPrice: 0.1;
    };
    readonly "claude-sonnet-4-20250514": {
        readonly maxTokens: 64000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
    };
    readonly "claude-sonnet-4-20250514:1m": {
        readonly maxTokens: 64000;
        readonly contextWindow: 1000000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
        readonly tiers: {
            contextWindow: number;
            inputPrice: number;
            outputPrice: number;
            cacheWritesPrice: number;
            cacheReadsPrice: number;
        }[];
    };
    readonly "claude-opus-4-6": {
        readonly maxTokens: 128000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly inputPrice: 5;
        readonly outputPrice: 25;
        readonly cacheWritesPrice: 6.25;
        readonly cacheReadsPrice: 0.5;
    };
    readonly "claude-opus-4-6:fast": {
        readonly maxTokens: 128000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly inputPrice: 30;
        readonly outputPrice: 150;
        readonly cacheWritesPrice: 37.5;
        readonly cacheReadsPrice: 3;
        readonly description: "Anthropic fast mode preview for Claude Opus 4.6. Same model and capabilities with higher output token speed at premium pricing. Requires fast mode access on your Anthropic account.";
    };
    readonly "claude-opus-4-6:1m": {
        readonly maxTokens: 128000;
        readonly contextWindow: 1000000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly inputPrice: 5;
        readonly outputPrice: 25;
        readonly cacheWritesPrice: 6.25;
        readonly cacheReadsPrice: 0.5;
        readonly tiers: {
            contextWindow: number;
            inputPrice: number;
            outputPrice: number;
            cacheWritesPrice: number;
            cacheReadsPrice: number;
        }[];
    };
    readonly "claude-opus-4-6:1m:fast": {
        readonly maxTokens: 128000;
        readonly contextWindow: 1000000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly inputPrice: 30;
        readonly outputPrice: 150;
        readonly cacheWritesPrice: 37.5;
        readonly cacheReadsPrice: 3;
        readonly description: "Anthropic fast mode preview for Claude Opus 4.6 with the 1M context beta enabled. Same model and capabilities with higher output token speed at premium pricing across the full 1M context window. Requires both fast mode and 1M context access on your Anthropic account.";
    };
    readonly "claude-opus-4-5-20251101": {
        readonly maxTokens: 64000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly inputPrice: 5;
        readonly outputPrice: 25;
        readonly cacheWritesPrice: 6.25;
        readonly cacheReadsPrice: 0.5;
    };
    readonly "claude-opus-4-1-20250805": {
        readonly maxTokens: 32000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly inputPrice: 15;
        readonly outputPrice: 75;
        readonly cacheWritesPrice: 18.75;
        readonly cacheReadsPrice: 1.5;
    };
    readonly "claude-opus-4-20250514": {
        readonly maxTokens: 32000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly inputPrice: 15;
        readonly outputPrice: 75;
        readonly cacheWritesPrice: 18.75;
        readonly cacheReadsPrice: 1.5;
    };
    readonly "claude-3-7-sonnet-20250219": {
        readonly maxTokens: 128000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
    };
    readonly "claude-3-5-sonnet-20241022": {
        readonly maxTokens: 8192;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
    };
    readonly "claude-3-5-haiku-20241022": {
        readonly maxTokens: 8192;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.8;
        readonly outputPrice: 4;
        readonly cacheWritesPrice: 1;
        readonly cacheReadsPrice: 0.08;
    };
    readonly "claude-3-opus-20240229": {
        readonly maxTokens: 4096;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 15;
        readonly outputPrice: 75;
        readonly cacheWritesPrice: 18.75;
        readonly cacheReadsPrice: 1.5;
    };
    readonly "claude-3-haiku-20240307": {
        readonly maxTokens: 4096;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.25;
        readonly outputPrice: 1.25;
        readonly cacheWritesPrice: 0.3;
        readonly cacheReadsPrice: 0.03;
    };
};
export type ClaudeCodeModelId = keyof typeof claudeCodeModels;
export declare const claudeCodeDefaultModelId: ClaudeCodeModelId;
export declare const claudeCodeModels: {
    readonly sonnet: {
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly maxTokens: 64000;
        readonly contextWindow: 200000;
        readonly supportsReasoning: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
    };
    readonly "sonnet[1m]": {
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly maxTokens: 64000;
        readonly contextWindow: 1000000;
        readonly supportsReasoning: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
        readonly tiers: {
            contextWindow: number;
            inputPrice: number;
            outputPrice: number;
            cacheWritesPrice: number;
            cacheReadsPrice: number;
        }[];
    };
    readonly opus: {
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly maxTokens: 128000;
        readonly contextWindow: 200000;
        readonly supportsReasoning: true;
        readonly inputPrice: 5;
        readonly outputPrice: 25;
        readonly cacheWritesPrice: 6.25;
        readonly cacheReadsPrice: 0.5;
    };
    readonly "opus[1m]": {
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly maxTokens: 128000;
        readonly contextWindow: 1000000;
        readonly supportsReasoning: true;
        readonly inputPrice: 5;
        readonly outputPrice: 25;
        readonly cacheWritesPrice: 6.25;
        readonly cacheReadsPrice: 0.5;
        readonly tiers: {
            contextWindow: number;
            inputPrice: number;
            outputPrice: number;
            cacheWritesPrice: number;
            cacheReadsPrice: number;
        }[];
    };
    readonly "claude-haiku-4-5-20251001": {
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly maxTokens: 64000;
        readonly contextWindow: 200000;
        readonly supportsReasoning: true;
        readonly inputPrice: 1;
        readonly outputPrice: 5;
        readonly cacheWritesPrice: 1.25;
        readonly cacheReadsPrice: 0.1;
    };
    readonly "claude-sonnet-4-6": {
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly maxTokens: 64000;
        readonly contextWindow: 200000;
        readonly supportsReasoning: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
    };
    readonly "claude-sonnet-4-6[1m]": {
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly maxTokens: 64000;
        readonly contextWindow: 1000000;
        readonly supportsReasoning: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
        readonly tiers: {
            contextWindow: number;
            inputPrice: number;
            outputPrice: number;
            cacheWritesPrice: number;
            cacheReadsPrice: number;
        }[];
    };
    readonly "claude-sonnet-4-5-20250929": {
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly maxTokens: 64000;
        readonly contextWindow: 200000;
        readonly supportsReasoning: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
    };
    readonly "claude-sonnet-4-5-20250929[1m]": {
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly maxTokens: 64000;
        readonly contextWindow: 1000000;
        readonly supportsReasoning: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
        readonly tiers: {
            contextWindow: number;
            inputPrice: number;
            outputPrice: number;
            cacheWritesPrice: number;
            cacheReadsPrice: number;
        }[];
    };
    readonly "claude-sonnet-4-20250514": {
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly maxTokens: 64000;
        readonly contextWindow: 200000;
        readonly supportsReasoning: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
    };
    readonly "claude-opus-4-6": {
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly maxTokens: 128000;
        readonly contextWindow: 200000;
        readonly supportsReasoning: true;
        readonly inputPrice: 5;
        readonly outputPrice: 25;
        readonly cacheWritesPrice: 6.25;
        readonly cacheReadsPrice: 0.5;
    };
    readonly "claude-opus-4-6[1m]": {
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly maxTokens: 128000;
        readonly contextWindow: 1000000;
        readonly supportsReasoning: true;
        readonly inputPrice: 5;
        readonly outputPrice: 25;
        readonly cacheWritesPrice: 6.25;
        readonly cacheReadsPrice: 0.5;
        readonly tiers: {
            contextWindow: number;
            inputPrice: number;
            outputPrice: number;
            cacheWritesPrice: number;
            cacheReadsPrice: number;
        }[];
    };
    readonly "claude-opus-4-5-20251101": {
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly maxTokens: 64000;
        readonly contextWindow: 200000;
        readonly supportsReasoning: true;
        readonly inputPrice: 5;
        readonly outputPrice: 25;
        readonly cacheWritesPrice: 6.25;
        readonly cacheReadsPrice: 0.5;
    };
    readonly "claude-opus-4-1-20250805": {
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly maxTokens: 32000;
        readonly contextWindow: 200000;
        readonly supportsReasoning: true;
        readonly inputPrice: 15;
        readonly outputPrice: 75;
        readonly cacheWritesPrice: 18.75;
        readonly cacheReadsPrice: 1.5;
    };
    readonly "claude-opus-4-20250514": {
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly maxTokens: 32000;
        readonly contextWindow: 200000;
        readonly supportsReasoning: true;
        readonly inputPrice: 15;
        readonly outputPrice: 75;
        readonly cacheWritesPrice: 18.75;
        readonly cacheReadsPrice: 1.5;
    };
    readonly "claude-3-7-sonnet-20250219": {
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly maxTokens: 128000;
        readonly contextWindow: 200000;
        readonly supportsReasoning: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
    };
    readonly "claude-3-5-haiku-20241022": {
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly maxTokens: 8192;
        readonly contextWindow: 200000;
        readonly inputPrice: 0.8;
        readonly outputPrice: 4;
        readonly cacheWritesPrice: 1;
        readonly cacheReadsPrice: 0.08;
    };
};
export type BedrockModelId = keyof typeof bedrockModels;
export declare const bedrockDefaultModelId: BedrockModelId;
export declare const bedrockModels: {
    readonly "anthropic.claude-sonnet-4-6": {
        readonly maxTokens: 64000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly supportsGlobalEndpoint: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
    };
    readonly "anthropic.claude-sonnet-4-6:1m": {
        readonly maxTokens: 64000;
        readonly contextWindow: 1000000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly supportsGlobalEndpoint: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
        readonly tiers: {
            contextWindow: number;
            inputPrice: number;
            outputPrice: number;
            cacheWritesPrice: number;
            cacheReadsPrice: number;
        }[];
    };
    readonly "anthropic.claude-sonnet-4-5-20250929-v1:0": {
        readonly maxTokens: 64000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly supportsGlobalEndpoint: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
    };
    readonly "anthropic.claude-sonnet-4-5-20250929-v1:0:1m": {
        readonly maxTokens: 64000;
        readonly contextWindow: 1000000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly supportsGlobalEndpoint: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
        readonly tiers: {
            contextWindow: number;
            inputPrice: number;
            outputPrice: number;
            cacheWritesPrice: number;
            cacheReadsPrice: number;
        }[];
    };
    readonly "anthropic.claude-haiku-4-5-20251001-v1:0": {
        readonly maxTokens: 64000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly supportsGlobalEndpoint: true;
        readonly inputPrice: 1;
        readonly outputPrice: 5;
        readonly cacheWritesPrice: 1.25;
        readonly cacheReadsPrice: 0.1;
    };
    readonly "anthropic.claude-sonnet-4-20250514-v1:0": {
        readonly maxTokens: 64000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly supportsGlobalEndpoint: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
    };
    readonly "anthropic.claude-sonnet-4-20250514-v1:0:1m": {
        readonly maxTokens: 64000;
        readonly contextWindow: 1000000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly supportsGlobalEndpoint: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
        readonly tiers: {
            contextWindow: number;
            inputPrice: number;
            outputPrice: number;
            cacheWritesPrice: number;
            cacheReadsPrice: number;
        }[];
    };
    readonly "anthropic.claude-opus-4-6-v1": {
        readonly maxTokens: 128000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly supportsGlobalEndpoint: true;
        readonly inputPrice: 5;
        readonly outputPrice: 25;
        readonly cacheWritesPrice: 6.25;
        readonly cacheReadsPrice: 0.5;
    };
    readonly "anthropic.claude-opus-4-6-v1:1m": {
        readonly maxTokens: 128000;
        readonly contextWindow: 1000000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly supportsGlobalEndpoint: true;
        readonly inputPrice: 5;
        readonly outputPrice: 25;
        readonly cacheWritesPrice: 6.25;
        readonly cacheReadsPrice: 0.5;
        readonly tiers: {
            contextWindow: number;
            inputPrice: number;
            outputPrice: number;
            cacheWritesPrice: number;
            cacheReadsPrice: number;
        }[];
    };
    readonly "anthropic.claude-opus-4-5-20251101-v1:0": {
        readonly maxTokens: 64000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly supportsGlobalEndpoint: true;
        readonly inputPrice: 5;
        readonly outputPrice: 25;
        readonly cacheWritesPrice: 6.25;
        readonly cacheReadsPrice: 0.5;
    };
    readonly "anthropic.claude-opus-4-20250514-v1:0": {
        readonly maxTokens: 32000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly inputPrice: 15;
        readonly outputPrice: 75;
        readonly cacheWritesPrice: 18.75;
        readonly cacheReadsPrice: 1.5;
    };
    readonly "anthropic.claude-opus-4-1-20250805-v1:0": {
        readonly maxTokens: 32000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly inputPrice: 15;
        readonly outputPrice: 75;
        readonly cacheWritesPrice: 18.75;
        readonly cacheReadsPrice: 1.5;
    };
    readonly "amazon.nova-premier-v1:0": {
        readonly maxTokens: 10000;
        readonly contextWindow: 1000000;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 2.5;
        readonly outputPrice: 12.5;
    };
    readonly "amazon.nova-pro-v1:0": {
        readonly maxTokens: 5000;
        readonly contextWindow: 300000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.8;
        readonly outputPrice: 3.2;
        readonly cacheReadsPrice: 0.2;
    };
    readonly "amazon.nova-lite-v1:0": {
        readonly maxTokens: 5000;
        readonly contextWindow: 300000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.06;
        readonly outputPrice: 0.24;
        readonly cacheReadsPrice: 0.015;
    };
    readonly "amazon.nova-2-lite-v1:0": {
        readonly maxTokens: 5000;
        readonly contextWindow: 1000000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.3;
        readonly outputPrice: 2.5;
        readonly cacheReadsPrice: 0.075;
        readonly supportsGlobalEndpoint: true;
    };
    readonly "amazon.nova-micro-v1:0": {
        readonly maxTokens: 5000;
        readonly contextWindow: 128000;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.035;
        readonly outputPrice: 0.14;
        readonly cacheReadsPrice: 0.00875;
    };
    readonly "anthropic.claude-3-7-sonnet-20250219-v1:0": {
        readonly maxTokens: 128000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
    };
    readonly "anthropic.claude-3-5-sonnet-20241022-v2:0": {
        readonly maxTokens: 8192;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
    };
    readonly "anthropic.claude-3-5-haiku-20241022-v1:0": {
        readonly maxTokens: 8192;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.8;
        readonly outputPrice: 4;
        readonly cacheWritesPrice: 1;
        readonly cacheReadsPrice: 0.08;
    };
    readonly "anthropic.claude-3-5-sonnet-20240620-v1:0": {
        readonly maxTokens: 8192;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
    };
    readonly "anthropic.claude-3-opus-20240229-v1:0": {
        readonly maxTokens: 4096;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 15;
        readonly outputPrice: 75;
    };
    readonly "anthropic.claude-3-sonnet-20240229-v1:0": {
        readonly maxTokens: 4096;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
    };
    readonly "anthropic.claude-3-haiku-20240307-v1:0": {
        readonly maxTokens: 4096;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.25;
        readonly outputPrice: 1.25;
    };
    readonly "deepseek.r1-v1:0": {
        readonly maxTokens: 8000;
        readonly contextWindow: 64000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 1.35;
        readonly outputPrice: 5.4;
    };
    readonly "openai.gpt-oss-120b-1:0": {
        readonly maxTokens: 8192;
        readonly contextWindow: 128000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.15;
        readonly outputPrice: 0.6;
        readonly description: "A state-of-the-art 120B open-weight Mixture-of-Experts language model optimized for strong reasoning, tool use, and efficient deployment on large GPUs";
    };
    readonly "openai.gpt-oss-20b-1:0": {
        readonly maxTokens: 8192;
        readonly contextWindow: 128000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.07;
        readonly outputPrice: 0.3;
        readonly description: "A compact 20B open-weight Mixture-of-Experts language model designed for strong reasoning and tool use, ideal for edge devices and local inference.";
    };
    readonly "qwen.qwen3-coder-30b-a3b-v1:0": {
        readonly maxTokens: 8192;
        readonly contextWindow: 262144;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.15;
        readonly outputPrice: 0.6;
        readonly description: "Qwen3 Coder 30B MoE model with 3.3B activated parameters, optimized for code generation and analysis with 256K context window.";
    };
    readonly "qwen.qwen3-coder-480b-a35b-v1:0": {
        readonly maxTokens: 8192;
        readonly contextWindow: 262144;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.22;
        readonly outputPrice: 1.8;
        readonly description: "Qwen3 Coder 480B flagship MoE model with 35B activated parameters, designed for complex coding tasks with advanced reasoning capabilities and 256K context window.";
    };
};
export declare const openRouterDefaultModelId = "anthropic/claude-sonnet-4.5";
export declare const openRouterClaudeSonnet41mModelId = "anthropic/claude-sonnet-4:1m";
export declare const openRouterClaudeSonnet451mModelId = "anthropic/claude-sonnet-4.5:1m";
export declare const openRouterClaudeSonnet461mModelId = "anthropic/claude-sonnet-4.6:1m";
export declare const openRouterClaudeOpus461mModelId = "anthropic/claude-opus-4.6:1m";
export declare const openRouterDefaultModelInfo: ModelInfo;
export declare const clineDevstralModelInfo: ModelInfo;
export declare const OPENROUTER_PROVIDER_PREFERENCES: Record<string, {
    order: string[];
    allow_fallbacks: boolean;
}>;
export type VertexModelId = keyof typeof vertexModels;
export declare const vertexDefaultModelId: VertexModelId;
export declare const vertexModels: {
    readonly "gemini-3.1-pro-preview": {
        readonly maxTokens: 8192;
        readonly contextWindow: 1048576;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsGlobalEndpoint: true;
        readonly inputPrice: 2;
        readonly outputPrice: 12;
        readonly temperature: 1;
        readonly supportsReasoning: true;
        readonly thinkingConfig: {
            readonly geminiThinkingLevel: "high";
            readonly supportsThinkingLevel: true;
        };
    };
    readonly "gemini-3-pro-preview": {
        readonly maxTokens: 8192;
        readonly contextWindow: 1048576;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsGlobalEndpoint: true;
        readonly inputPrice: 2;
        readonly outputPrice: 12;
        readonly temperature: 1;
        readonly supportsReasoning: true;
        readonly thinkingConfig: {
            readonly geminiThinkingLevel: "high";
            readonly supportsThinkingLevel: true;
        };
    };
    readonly "gemini-3-flash-preview": {
        readonly maxTokens: 65536;
        readonly contextWindow: 1048576;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsGlobalEndpoint: true;
        readonly inputPrice: 0.5;
        readonly outputPrice: 3;
        readonly cacheWritesPrice: 0.05;
        readonly temperature: 1;
        readonly supportsReasoning: true;
        readonly thinkingConfig: {
            readonly geminiThinkingLevel: "high";
            readonly supportsThinkingLevel: true;
        };
    };
    readonly "claude-sonnet-4-6": {
        readonly maxTokens: 64000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
        readonly supportsReasoning: true;
    };
    readonly "claude-sonnet-4-6:1m": {
        readonly maxTokens: 64000;
        readonly contextWindow: 1000000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
        readonly supportsReasoning: true;
        readonly tiers: {
            contextWindow: number;
            inputPrice: number;
            outputPrice: number;
            cacheWritesPrice: number;
            cacheReadsPrice: number;
        }[];
    };
    readonly "claude-sonnet-4-5@20250929": {
        readonly maxTokens: 64000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
        readonly supportsReasoning: true;
    };
    readonly "claude-sonnet-4@20250514": {
        readonly maxTokens: 64000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
        readonly supportsReasoning: true;
    };
    readonly "claude-haiku-4-5@20251001": {
        readonly maxTokens: 64000;
        readonly contextWindow: 200000;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 1;
        readonly outputPrice: 5;
        readonly cacheWritesPrice: 1.25;
        readonly cacheReadsPrice: 0.1;
        readonly supportsReasoning: true;
    };
    readonly "claude-opus-4-6": {
        readonly maxTokens: 128000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsGlobalEndpoint: true;
        readonly inputPrice: 5;
        readonly outputPrice: 25;
        readonly cacheWritesPrice: 6.25;
        readonly cacheReadsPrice: 0.5;
        readonly supportsReasoning: true;
    };
    readonly "claude-opus-4-6:1m": {
        readonly maxTokens: 128000;
        readonly contextWindow: 1000000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsGlobalEndpoint: true;
        readonly inputPrice: 5;
        readonly outputPrice: 25;
        readonly cacheWritesPrice: 6.25;
        readonly cacheReadsPrice: 0.5;
        readonly supportsReasoning: true;
        readonly tiers: {
            contextWindow: number;
            inputPrice: number;
            outputPrice: number;
            cacheWritesPrice: number;
            cacheReadsPrice: number;
        }[];
    };
    readonly "claude-opus-4-5@20251101": {
        readonly maxTokens: 64000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 5;
        readonly outputPrice: 25;
        readonly cacheWritesPrice: 6.25;
        readonly cacheReadsPrice: 0.5;
        readonly supportsReasoning: true;
    };
    readonly "claude-opus-4-1@20250805": {
        readonly maxTokens: 32000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 15;
        readonly outputPrice: 75;
        readonly cacheWritesPrice: 18.75;
        readonly cacheReadsPrice: 1.5;
        readonly supportsReasoning: true;
    };
    readonly "claude-opus-4@20250514": {
        readonly maxTokens: 32000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 15;
        readonly outputPrice: 75;
        readonly cacheWritesPrice: 18.75;
        readonly cacheReadsPrice: 1.5;
        readonly supportsReasoning: true;
    };
    readonly "claude-3-7-sonnet@20250219": {
        readonly maxTokens: 128000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
        readonly thinkingConfig: {
            readonly maxBudget: 64000;
            readonly outputPrice: 15;
        };
        readonly supportsReasoning: true;
    };
    readonly "claude-3-5-sonnet-v2@20241022": {
        readonly maxTokens: 8192;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
    };
    readonly "claude-3-5-sonnet@20240620": {
        readonly maxTokens: 8192;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly cacheWritesPrice: 3.75;
        readonly cacheReadsPrice: 0.3;
    };
    readonly "claude-3-5-haiku@20241022": {
        readonly maxTokens: 8192;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 1;
        readonly outputPrice: 5;
        readonly cacheWritesPrice: 1.25;
        readonly cacheReadsPrice: 0.1;
    };
    readonly "claude-3-opus@20240229": {
        readonly maxTokens: 4096;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 15;
        readonly outputPrice: 75;
        readonly cacheWritesPrice: 18.75;
        readonly cacheReadsPrice: 1.5;
    };
    readonly "claude-3-haiku@20240307": {
        readonly maxTokens: 4096;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.25;
        readonly outputPrice: 1.25;
        readonly cacheWritesPrice: 0.3;
        readonly cacheReadsPrice: 0.03;
    };
    readonly "mistral-large-2411": {
        readonly maxTokens: 128000;
        readonly contextWindow: 128000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 2;
        readonly outputPrice: 6;
    };
    readonly "mistral-small-2503": {
        readonly maxTokens: 128000;
        readonly contextWindow: 128000;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.1;
        readonly outputPrice: 0.3;
    };
    readonly "codestral-2501": {
        readonly maxTokens: 256000;
        readonly contextWindow: 256000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.3;
        readonly outputPrice: 0.9;
    };
    readonly "llama-4-maverick-17b-128e-instruct-maas": {
        readonly maxTokens: 128000;
        readonly contextWindow: 1048576;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.35;
        readonly outputPrice: 1.15;
    };
    readonly "llama-4-scout-17b-16e-instruct-maas": {
        readonly maxTokens: 1000000;
        readonly contextWindow: 10485760;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.25;
        readonly outputPrice: 0.7;
    };
    readonly "gemini-2.0-flash-001": {
        readonly maxTokens: 8192;
        readonly contextWindow: 1048576;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsGlobalEndpoint: true;
        readonly inputPrice: 0.15;
        readonly outputPrice: 0.6;
        readonly cacheWritesPrice: 1;
        readonly cacheReadsPrice: 0.025;
    };
    readonly "gemini-2.0-flash-lite-001": {
        readonly maxTokens: 8192;
        readonly contextWindow: 1048576;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly supportsGlobalEndpoint: true;
        readonly inputPrice: 0.075;
        readonly outputPrice: 0.3;
    };
    readonly "gemini-2.0-flash-thinking-exp-1219": {
        readonly maxTokens: 8192;
        readonly contextWindow: 32767;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly supportsGlobalEndpoint: true;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
    };
    readonly "gemini-2.0-flash-exp": {
        readonly maxTokens: 8192;
        readonly contextWindow: 1048576;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly supportsGlobalEndpoint: true;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
    };
    readonly "gemini-2.5-pro-exp-03-25": {
        readonly maxTokens: 65536;
        readonly contextWindow: 1048576;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
    };
    readonly "gemini-2.5-pro": {
        readonly maxTokens: 65536;
        readonly contextWindow: 1048576;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsGlobalEndpoint: true;
        readonly inputPrice: 2.5;
        readonly outputPrice: 15;
        readonly cacheReadsPrice: 0.625;
        readonly thinkingConfig: {
            readonly maxBudget: 32767;
        };
        readonly tiers: [{
            readonly contextWindow: 200000;
            readonly inputPrice: 1.25;
            readonly outputPrice: 10;
            readonly cacheReadsPrice: 0.31;
        }, {
            readonly contextWindow: number;
            readonly inputPrice: 2.5;
            readonly outputPrice: 15;
            readonly cacheReadsPrice: 0.625;
        }];
    };
    readonly "gemini-2.5-flash": {
        readonly maxTokens: 65536;
        readonly contextWindow: 1048576;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsGlobalEndpoint: true;
        readonly inputPrice: 0.3;
        readonly outputPrice: 2.5;
        readonly thinkingConfig: {
            readonly maxBudget: 24576;
            readonly outputPrice: 3.5;
        };
    };
    readonly "gemini-2.5-flash-lite-preview-06-17": {
        readonly maxTokens: 64000;
        readonly contextWindow: 1000000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsGlobalEndpoint: true;
        readonly inputPrice: 0.1;
        readonly outputPrice: 0.4;
        readonly cacheReadsPrice: 0.025;
        readonly description: "Preview version - may not be available in all regions";
        readonly thinkingConfig: {
            readonly maxBudget: 24576;
        };
    };
    readonly "gemini-2.0-flash-thinking-exp-01-21": {
        readonly maxTokens: 65536;
        readonly contextWindow: 1048576;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly supportsGlobalEndpoint: true;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
    };
    readonly "gemini-exp-1206": {
        readonly maxTokens: 8192;
        readonly contextWindow: 2097152;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
    };
    readonly "gemini-1.5-flash-002": {
        readonly maxTokens: 8192;
        readonly contextWindow: 1048576;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.15;
        readonly outputPrice: 0.6;
        readonly cacheWritesPrice: 1;
        readonly cacheReadsPrice: 0.0375;
        readonly tiers: [{
            readonly contextWindow: 128000;
            readonly inputPrice: 0.075;
            readonly outputPrice: 0.3;
            readonly cacheReadsPrice: 0.01875;
        }, {
            readonly contextWindow: number;
            readonly inputPrice: 0.15;
            readonly outputPrice: 0.6;
            readonly cacheReadsPrice: 0.0375;
        }];
    };
    readonly "gemini-1.5-flash-exp-0827": {
        readonly maxTokens: 8192;
        readonly contextWindow: 1048576;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
    };
    readonly "gemini-1.5-flash-8b-exp-0827": {
        readonly maxTokens: 8192;
        readonly contextWindow: 1048576;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
    };
    readonly "gemini-1.5-pro-002": {
        readonly maxTokens: 8192;
        readonly contextWindow: 2097152;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 1.25;
        readonly outputPrice: 5;
    };
    readonly "gemini-1.5-pro-exp-0827": {
        readonly maxTokens: 8192;
        readonly contextWindow: 2097152;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
    };
};
export declare const vertexGlobalModels: Record<string, ModelInfo>;
export declare const openAiModelInfoSaneDefaults: OpenAiCompatibleModelInfo;
export type GeminiModelId = keyof typeof geminiModels;
export declare const geminiDefaultModelId: GeminiModelId;
export declare const geminiModels: {
    readonly "gemini-3.1-pro-preview": {
        readonly maxTokens: 65536;
        readonly contextWindow: 1048576;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 4;
        readonly outputPrice: 18;
        readonly cacheReadsPrice: 0.4;
        readonly thinkingConfig: {
            readonly geminiThinkingLevel: "high";
            readonly supportsThinkingLevel: true;
        };
        readonly tiers: [{
            readonly contextWindow: 200000;
            readonly inputPrice: 2;
            readonly outputPrice: 12;
            readonly cacheReadsPrice: 0.2;
        }, {
            readonly contextWindow: number;
            readonly inputPrice: 4;
            readonly outputPrice: 18;
            readonly cacheReadsPrice: 0.4;
        }];
    };
    readonly "gemini-3-pro-preview": {
        readonly maxTokens: 65536;
        readonly contextWindow: 1048576;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 4;
        readonly outputPrice: 18;
        readonly cacheReadsPrice: 0.4;
        readonly thinkingConfig: {
            readonly geminiThinkingLevel: "high";
            readonly supportsThinkingLevel: true;
        };
        readonly tiers: [{
            readonly contextWindow: 200000;
            readonly inputPrice: 2;
            readonly outputPrice: 12;
            readonly cacheReadsPrice: 0.2;
        }, {
            readonly contextWindow: number;
            readonly inputPrice: 4;
            readonly outputPrice: 18;
            readonly cacheReadsPrice: 0.4;
        }];
    };
    readonly "gemini-3-flash-preview": {
        readonly maxTokens: 65536;
        readonly contextWindow: 1048576;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsGlobalEndpoint: true;
        readonly inputPrice: 0.5;
        readonly outputPrice: 3;
        readonly cacheWritesPrice: 0.05;
        readonly supportsReasoning: true;
        readonly thinkingConfig: {
            readonly geminiThinkingLevel: "low";
            readonly supportsThinkingLevel: true;
        };
        readonly tiers: [{
            readonly contextWindow: 200000;
            readonly inputPrice: 0.3;
            readonly outputPrice: 2.5;
            readonly cacheReadsPrice: 0.03;
        }, {
            readonly contextWindow: number;
            readonly inputPrice: 0.3;
            readonly outputPrice: 2.5;
            readonly cacheReadsPrice: 0.03;
        }];
    };
    readonly "gemini-2.5-pro": {
        readonly maxTokens: 65536;
        readonly contextWindow: 1048576;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 2.5;
        readonly outputPrice: 15;
        readonly cacheReadsPrice: 0.625;
        readonly thinkingConfig: {
            readonly maxBudget: 32767;
        };
        readonly tiers: [{
            readonly contextWindow: 200000;
            readonly inputPrice: 1.25;
            readonly outputPrice: 10;
            readonly cacheReadsPrice: 0.31;
        }, {
            readonly contextWindow: number;
            readonly inputPrice: 2.5;
            readonly outputPrice: 15;
            readonly cacheReadsPrice: 0.625;
        }];
    };
    readonly "gemini-2.5-flash-lite-preview-06-17": {
        readonly maxTokens: 64000;
        readonly contextWindow: 1000000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsGlobalEndpoint: true;
        readonly inputPrice: 0.1;
        readonly outputPrice: 0.4;
        readonly cacheReadsPrice: 0.025;
        readonly description: "Preview version - may not be available in all regions";
        readonly thinkingConfig: {
            readonly maxBudget: 24576;
        };
    };
    readonly "gemini-2.5-flash": {
        readonly maxTokens: 65536;
        readonly contextWindow: 1048576;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.3;
        readonly outputPrice: 2.5;
        readonly cacheReadsPrice: 0.075;
        readonly thinkingConfig: {
            readonly maxBudget: 24576;
            readonly outputPrice: 3.5;
        };
    };
    readonly "gemini-2.0-flash-001": {
        readonly maxTokens: 8192;
        readonly contextWindow: 1048576;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.1;
        readonly outputPrice: 0.4;
        readonly cacheReadsPrice: 0.025;
        readonly cacheWritesPrice: 1;
    };
    readonly "gemini-2.0-flash-lite-preview-02-05": {
        readonly maxTokens: 8192;
        readonly contextWindow: 1048576;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
    };
    readonly "gemini-2.0-pro-exp-02-05": {
        readonly maxTokens: 8192;
        readonly contextWindow: 2097152;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
    };
    readonly "gemini-2.0-flash-thinking-exp-01-21": {
        readonly maxTokens: 65536;
        readonly contextWindow: 1048576;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
    };
    readonly "gemini-2.0-flash-thinking-exp-1219": {
        readonly maxTokens: 8192;
        readonly contextWindow: 32767;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
    };
    readonly "gemini-2.0-flash-exp": {
        readonly maxTokens: 8192;
        readonly contextWindow: 1048576;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
    };
    readonly "gemini-1.5-flash-002": {
        readonly maxTokens: 8192;
        readonly contextWindow: 1048576;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.15;
        readonly outputPrice: 0.6;
        readonly cacheReadsPrice: 0.0375;
        readonly cacheWritesPrice: 1;
        readonly tiers: [{
            readonly contextWindow: 128000;
            readonly inputPrice: 0.075;
            readonly outputPrice: 0.3;
            readonly cacheReadsPrice: 0.01875;
        }, {
            readonly contextWindow: number;
            readonly inputPrice: 0.15;
            readonly outputPrice: 0.6;
            readonly cacheReadsPrice: 0.0375;
        }];
    };
    readonly "gemini-1.5-flash-exp-0827": {
        readonly maxTokens: 8192;
        readonly contextWindow: 1048576;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
    };
    readonly "gemini-1.5-flash-8b-exp-0827": {
        readonly maxTokens: 8192;
        readonly contextWindow: 1048576;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
    };
    readonly "gemini-1.5-pro-002": {
        readonly maxTokens: 8192;
        readonly contextWindow: 2097152;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
    };
    readonly "gemini-1.5-pro-exp-0827": {
        readonly maxTokens: 8192;
        readonly contextWindow: 2097152;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
    };
    readonly "gemini-exp-1206": {
        readonly maxTokens: 8192;
        readonly contextWindow: 2097152;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
    };
};
export type OpenAiNativeModelId = keyof typeof openAiNativeModels;
export declare const openAiNativeDefaultModelId: OpenAiNativeModelId;
export declare const openAiNativeModels: {
    readonly "gpt-5.2": {
        readonly maxTokens: 8192;
        readonly contextWindow: 272000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 1.75;
        readonly outputPrice: 14;
        readonly cacheReadsPrice: 0.175;
        readonly temperature: 1;
        readonly systemRole: "developer";
        readonly supportsReasoning: true;
        readonly supportsReasoningEffort: true;
    };
    readonly "gpt-5.2-codex": {
        readonly maxTokens: 8192;
        readonly contextWindow: 400000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 1.75;
        readonly outputPrice: 14;
        readonly cacheReadsPrice: 0.175;
        readonly apiFormat: ApiFormat.OPENAI_RESPONSES_WEBSOCKET_MODE;
        readonly temperature: 1;
        readonly systemRole: "developer";
        readonly supportsReasoning: true;
        readonly supportsReasoningEffort: true;
    };
    readonly "gpt-5.1-2025-11-13": {
        readonly maxTokens: 8192;
        readonly contextWindow: 272000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 1.25;
        readonly outputPrice: 10;
        readonly cacheReadsPrice: 0.125;
        readonly temperature: 1;
        readonly systemRole: "developer";
        readonly supportsReasoning: true;
        readonly supportsReasoningEffort: true;
    };
    readonly "gpt-5.1": {
        readonly maxTokens: 8192;
        readonly contextWindow: 272000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 1.25;
        readonly outputPrice: 10;
        readonly cacheReadsPrice: 0.125;
        readonly temperature: 1;
        readonly systemRole: "developer";
        readonly supportsReasoning: true;
        readonly supportsReasoningEffort: true;
    };
    readonly "gpt-5.1-codex": {
        readonly maxTokens: 8192;
        readonly contextWindow: 400000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 1.25;
        readonly outputPrice: 10;
        readonly cacheReadsPrice: 0.125;
        readonly apiFormat: ApiFormat.OPENAI_RESPONSES_WEBSOCKET_MODE;
        readonly temperature: 1;
        readonly systemRole: "developer";
        readonly supportsReasoning: true;
        readonly supportsReasoningEffort: true;
    };
    readonly "gpt-5.1-chat-latest": {
        readonly maxTokens: 8192;
        readonly contextWindow: 400000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 1.25;
        readonly outputPrice: 10;
        readonly cacheReadsPrice: 0.125;
        readonly temperature: 1;
        readonly systemRole: "developer";
        readonly supportsReasoning: true;
        readonly supportsReasoningEffort: true;
    };
    readonly "gpt-5-2025-08-07": {
        readonly maxTokens: 8192;
        readonly contextWindow: 272000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 1.25;
        readonly outputPrice: 10;
        readonly cacheReadsPrice: 0.125;
        readonly temperature: 1;
        readonly systemRole: "developer";
        readonly supportsReasoning: true;
        readonly supportsReasoningEffort: true;
    };
    readonly "gpt-5-codex": {
        readonly maxTokens: 8192;
        readonly contextWindow: 400000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 1.25;
        readonly outputPrice: 10;
        readonly cacheReadsPrice: 0.125;
        readonly apiFormat: ApiFormat.OPENAI_RESPONSES_WEBSOCKET_MODE;
        readonly temperature: 1;
        readonly systemRole: "developer";
        readonly supportsReasoning: true;
        readonly supportsReasoningEffort: true;
    };
    readonly "gpt-5-mini-2025-08-07": {
        readonly maxTokens: 8192;
        readonly contextWindow: 272000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.25;
        readonly outputPrice: 2;
        readonly cacheReadsPrice: 0.025;
        readonly temperature: 1;
        readonly systemRole: "developer";
        readonly supportsReasoning: true;
        readonly supportsReasoningEffort: true;
    };
    readonly "gpt-5-nano-2025-08-07": {
        readonly maxTokens: 8192;
        readonly contextWindow: 272000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.05;
        readonly outputPrice: 0.4;
        readonly cacheReadsPrice: 0.005;
        readonly temperature: 1;
        readonly systemRole: "developer";
        readonly supportsReasoning: true;
        readonly supportsReasoningEffort: true;
    };
    readonly "gpt-5-chat-latest": {
        readonly maxTokens: 8192;
        readonly contextWindow: 400000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 1.25;
        readonly outputPrice: 10;
        readonly cacheReadsPrice: 0.125;
        readonly temperature: 1;
        readonly systemRole: "developer";
        readonly supportsReasoning: true;
        readonly supportsReasoningEffort: true;
    };
    readonly o3: {
        readonly maxTokens: 100000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 2;
        readonly outputPrice: 8;
        readonly cacheReadsPrice: 0.5;
        readonly systemRole: "developer";
        readonly supportsReasoning: true;
        readonly supportsReasoningEffort: true;
        readonly supportsTools: false;
    };
    readonly "o4-mini": {
        readonly maxTokens: 100000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 1.1;
        readonly outputPrice: 4.4;
        readonly cacheReadsPrice: 0.275;
        readonly systemRole: "developer";
        readonly supportsReasoning: true;
        readonly supportsReasoningEffort: true;
        readonly supportsTools: false;
    };
    readonly "gpt-4.1": {
        readonly maxTokens: 32768;
        readonly contextWindow: 1047576;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 2;
        readonly outputPrice: 8;
        readonly cacheReadsPrice: 0.5;
        readonly temperature: 0;
    };
    readonly "gpt-4.1-mini": {
        readonly maxTokens: 32768;
        readonly contextWindow: 1047576;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.4;
        readonly outputPrice: 1.6;
        readonly cacheReadsPrice: 0.1;
        readonly temperature: 0;
    };
    readonly "gpt-4.1-nano": {
        readonly maxTokens: 32768;
        readonly contextWindow: 1047576;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.1;
        readonly outputPrice: 0.4;
        readonly cacheReadsPrice: 0.025;
        readonly temperature: 0;
    };
    readonly "o3-mini": {
        readonly maxTokens: 100000;
        readonly contextWindow: 200000;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 1.1;
        readonly outputPrice: 4.4;
        readonly cacheReadsPrice: 0.55;
        readonly systemRole: "developer";
        readonly supportsReasoning: true;
        readonly supportsReasoningEffort: true;
        readonly supportsTools: false;
    };
    readonly o1: {
        readonly maxTokens: 100000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 15;
        readonly outputPrice: 60;
        readonly cacheReadsPrice: 7.5;
        readonly supportsStreaming: false;
    };
    readonly "o1-preview": {
        readonly maxTokens: 32768;
        readonly contextWindow: 128000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 15;
        readonly outputPrice: 60;
        readonly cacheReadsPrice: 7.5;
        readonly supportsStreaming: false;
    };
    readonly "o1-mini": {
        readonly maxTokens: 65536;
        readonly contextWindow: 128000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 1.1;
        readonly outputPrice: 4.4;
        readonly cacheReadsPrice: 0.55;
        readonly supportsStreaming: false;
    };
    readonly "gpt-4o": {
        readonly maxTokens: 4096;
        readonly contextWindow: 128000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 2.5;
        readonly outputPrice: 10;
        readonly cacheReadsPrice: 1.25;
        readonly temperature: 0;
    };
    readonly "gpt-4o-mini": {
        readonly maxTokens: 16384;
        readonly contextWindow: 128000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.15;
        readonly outputPrice: 0.6;
        readonly cacheReadsPrice: 0.075;
        readonly temperature: 0;
    };
    readonly "chatgpt-4o-latest": {
        readonly maxTokens: 16384;
        readonly contextWindow: 128000;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 5;
        readonly outputPrice: 15;
        readonly temperature: 0;
    };
};
export type OpenAiCodexModelId = keyof typeof openAiCodexModels;
export declare const openAiCodexDefaultModelId: OpenAiCodexModelId;
export declare const openAiCodexModels: {
    readonly "gpt-5.4": {
        readonly maxTokens: 128000;
        readonly contextWindow: 1000000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly apiFormat: ApiFormat.OPENAI_RESPONSES;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
        readonly description: "GPT-5.4 Codex: OpenAI's latest flagship coding model via ChatGPT subscription";
    };
    readonly "gpt-5.3-codex": {
        readonly maxTokens: 128000;
        readonly contextWindow: 400000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly apiFormat: ApiFormat.OPENAI_RESPONSES;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
        readonly description: "GPT-5.3 Codex: OpenAI's latest flagship coding model via ChatGPT subscription";
    };
    readonly "gpt-5.2-codex": {
        readonly maxTokens: 128000;
        readonly contextWindow: 400000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly apiFormat: ApiFormat.OPENAI_RESPONSES;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
        readonly description: "GPT-5.2 Codex: OpenAI's flagship coding model via ChatGPT subscription";
    };
    readonly "gpt-5.1-codex-max": {
        readonly maxTokens: 128000;
        readonly contextWindow: 400000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly apiFormat: ApiFormat.OPENAI_RESPONSES;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
        readonly description: "GPT-5.1 Codex Max: Maximum capability coding model via ChatGPT subscription";
    };
    readonly "gpt-5.1-codex-mini": {
        readonly maxTokens: 128000;
        readonly contextWindow: 400000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly apiFormat: ApiFormat.OPENAI_RESPONSES;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
        readonly description: "GPT-5.1 Codex Mini: Faster version for coding tasks via ChatGPT subscription";
    };
    readonly "gpt-5.2": {
        readonly maxTokens: 128000;
        readonly contextWindow: 400000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly apiFormat: ApiFormat.OPENAI_RESPONSES;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
        readonly description: "GPT-5.2: Latest GPT model via ChatGPT subscription";
    };
};
export declare const azureOpenAiDefaultApiVersion = "2024-08-01-preview";
export type DeepSeekModelId = keyof typeof deepSeekModels;
export declare const deepSeekDefaultModelId: DeepSeekModelId;
export declare const deepSeekModels: {
    readonly "deepseek-chat": {
        readonly maxTokens: 8000;
        readonly contextWindow: 128000;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0;
        readonly outputPrice: 1.1;
        readonly cacheWritesPrice: 0.27;
        readonly cacheReadsPrice: 0.07;
    };
    readonly "deepseek-reasoner": {
        readonly maxTokens: 8000;
        readonly contextWindow: 128000;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0;
        readonly outputPrice: 2.19;
        readonly cacheWritesPrice: 0.55;
        readonly cacheReadsPrice: 0.14;
    };
};
export type HuggingFaceModelId = keyof typeof huggingFaceModels;
export declare const huggingFaceDefaultModelId: HuggingFaceModelId;
export declare const huggingFaceModels: {
    readonly "openai/gpt-oss-120b": {
        readonly maxTokens: 32766;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
        readonly description: "Large open-weight reasoning model for high-end desktops and data centers, built for complex coding, math, and general AI tasks.";
    };
    readonly "openai/gpt-oss-20b": {
        readonly maxTokens: 32766;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
        readonly description: "Medium open-weight reasoning model that runs on most desktops, balancing strong reasoning with broad accessibility.";
    };
    readonly "moonshotai/Kimi-K2-Instruct": {
        readonly maxTokens: 131072;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
        readonly description: "Advanced reasoning model with superior performance across coding, math, and general capabilities.";
    };
    readonly "deepseek-ai/DeepSeek-V3-0324": {
        readonly maxTokens: 8192;
        readonly contextWindow: 64000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
        readonly description: "Advanced reasoning model with superior performance across coding, math, and general capabilities.";
    };
    readonly "deepseek-ai/DeepSeek-R1": {
        readonly maxTokens: 8192;
        readonly contextWindow: 64000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
        readonly description: "DeepSeek's reasoning model with step-by-step thinking capabilities.";
    };
    readonly "deepseek-ai/DeepSeek-R1-0528": {
        readonly maxTokens: 64000;
        readonly contextWindow: 64000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
        readonly description: "DeepSeek's reasoning model's latest version with step-by-step thinking capabilities";
    };
    readonly "meta-llama/Llama-3.1-8B-Instruct": {
        readonly maxTokens: 8192;
        readonly contextWindow: 128000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
        readonly description: "Efficient 8B parameter Llama model for general-purpose tasks.";
    };
};
export declare const internationalQwenModels: {
    readonly "qwen3-coder-plus": {
        readonly maxTokens: 65536;
        readonly contextWindow: 1000000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 1;
        readonly outputPrice: 5;
    };
    readonly "qwen3-coder-480b-a35b-instruct": {
        readonly maxTokens: 65536;
        readonly contextWindow: 204800;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 1.5;
        readonly outputPrice: 7.5;
    };
    readonly "qwen3-235b-a22b": {
        readonly maxTokens: 16384;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 2;
        readonly outputPrice: 8;
        readonly cacheWritesPrice: 2;
        readonly cacheReadsPrice: 8;
        readonly thinkingConfig: {
            readonly maxBudget: 38912;
            readonly outputPrice: 20;
        };
    };
    readonly "qwen3-32b": {
        readonly maxTokens: 16384;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 2;
        readonly outputPrice: 8;
        readonly cacheWritesPrice: 2;
        readonly cacheReadsPrice: 8;
        readonly thinkingConfig: {
            readonly maxBudget: 38912;
            readonly outputPrice: 20;
        };
    };
    readonly "qwen3-30b-a3b": {
        readonly maxTokens: 16384;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.75;
        readonly outputPrice: 3;
        readonly cacheWritesPrice: 0.75;
        readonly cacheReadsPrice: 3;
        readonly thinkingConfig: {
            readonly maxBudget: 38912;
            readonly outputPrice: 7.5;
        };
    };
    readonly "qwen3-14b": {
        readonly maxTokens: 8192;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 1;
        readonly outputPrice: 4;
        readonly cacheWritesPrice: 1;
        readonly cacheReadsPrice: 4;
        readonly thinkingConfig: {
            readonly maxBudget: 38912;
            readonly outputPrice: 10;
        };
    };
    readonly "qwen3-8b": {
        readonly maxTokens: 8192;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.5;
        readonly outputPrice: 2;
        readonly cacheWritesPrice: 0.5;
        readonly cacheReadsPrice: 2;
        readonly thinkingConfig: {
            readonly maxBudget: 38912;
            readonly outputPrice: 5;
        };
    };
    readonly "qwen3-4b": {
        readonly maxTokens: 8192;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.3;
        readonly outputPrice: 1.2;
        readonly cacheWritesPrice: 0.3;
        readonly cacheReadsPrice: 1.2;
        readonly thinkingConfig: {
            readonly maxBudget: 38912;
            readonly outputPrice: 3;
        };
    };
    readonly "qwen3-1.7b": {
        readonly maxTokens: 8192;
        readonly contextWindow: 32768;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.3;
        readonly outputPrice: 1.2;
        readonly cacheWritesPrice: 0.3;
        readonly cacheReadsPrice: 1.2;
        readonly thinkingConfig: {
            readonly maxBudget: 30720;
            readonly outputPrice: 3;
        };
    };
    readonly "qwen3-0.6b": {
        readonly maxTokens: 8192;
        readonly contextWindow: 32768;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.3;
        readonly outputPrice: 1.2;
        readonly cacheWritesPrice: 0.3;
        readonly cacheReadsPrice: 1.2;
        readonly thinkingConfig: {
            readonly maxBudget: 30720;
            readonly outputPrice: 3;
        };
    };
    readonly "qwen2.5-coder-32b-instruct": {
        readonly maxTokens: 8192;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.002;
        readonly outputPrice: 0.006;
        readonly cacheWritesPrice: 0.002;
        readonly cacheReadsPrice: 0.006;
    };
    readonly "qwen2.5-coder-14b-instruct": {
        readonly maxTokens: 8192;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.002;
        readonly outputPrice: 0.006;
        readonly cacheWritesPrice: 0.002;
        readonly cacheReadsPrice: 0.006;
    };
    readonly "qwen2.5-coder-7b-instruct": {
        readonly maxTokens: 8192;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.001;
        readonly outputPrice: 0.002;
        readonly cacheWritesPrice: 0.001;
        readonly cacheReadsPrice: 0.002;
    };
    readonly "qwen2.5-coder-3b-instruct": {
        readonly maxTokens: 8192;
        readonly contextWindow: 32768;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
    };
    readonly "qwen2.5-coder-1.5b-instruct": {
        readonly maxTokens: 8192;
        readonly contextWindow: 32768;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
    };
    readonly "qwen2.5-coder-0.5b-instruct": {
        readonly maxTokens: 8192;
        readonly contextWindow: 32768;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
    };
    readonly "qwen-coder-plus-latest": {
        readonly maxTokens: 129024;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 3.5;
        readonly outputPrice: 7;
        readonly cacheWritesPrice: 3.5;
        readonly cacheReadsPrice: 7;
    };
    readonly "qwen-plus-latest": {
        readonly maxTokens: 16384;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.8;
        readonly outputPrice: 2;
        readonly cacheWritesPrice: 0.8;
        readonly cacheReadsPrice: 2;
        readonly thinkingConfig: {
            readonly maxBudget: 38912;
            readonly outputPrice: 16;
        };
    };
    readonly "qwen-turbo-latest": {
        readonly maxTokens: 16384;
        readonly contextWindow: 1000000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.3;
        readonly outputPrice: 0.6;
        readonly cacheWritesPrice: 0.3;
        readonly cacheReadsPrice: 0.6;
        readonly thinkingConfig: {
            readonly maxBudget: 38912;
            readonly outputPrice: 6;
        };
    };
    readonly "qwen-max-latest": {
        readonly maxTokens: 30720;
        readonly contextWindow: 32768;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 2.4;
        readonly outputPrice: 9.6;
        readonly cacheWritesPrice: 2.4;
        readonly cacheReadsPrice: 9.6;
    };
    readonly "qwen-coder-plus": {
        readonly maxTokens: 129024;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 3.5;
        readonly outputPrice: 7;
        readonly cacheWritesPrice: 3.5;
        readonly cacheReadsPrice: 7;
    };
    readonly "qwen-plus": {
        readonly maxTokens: 129024;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.8;
        readonly outputPrice: 2;
        readonly cacheWritesPrice: 0.8;
        readonly cacheReadsPrice: 0.2;
    };
    readonly "qwen-turbo": {
        readonly maxTokens: 1000000;
        readonly contextWindow: 1000000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.3;
        readonly outputPrice: 0.6;
        readonly cacheWritesPrice: 0.3;
        readonly cacheReadsPrice: 0.6;
    };
    readonly "qwen-max": {
        readonly maxTokens: 30720;
        readonly contextWindow: 32768;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 2.4;
        readonly outputPrice: 9.6;
        readonly cacheWritesPrice: 2.4;
        readonly cacheReadsPrice: 9.6;
    };
    readonly "deepseek-v3": {
        readonly maxTokens: 8000;
        readonly contextWindow: 64000;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0;
        readonly outputPrice: 0.28;
        readonly cacheWritesPrice: 0.14;
        readonly cacheReadsPrice: 0.014;
    };
    readonly "deepseek-r1": {
        readonly maxTokens: 8000;
        readonly contextWindow: 64000;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0;
        readonly outputPrice: 2.19;
        readonly cacheWritesPrice: 0.55;
        readonly cacheReadsPrice: 0.14;
    };
    readonly "qwen-vl-max": {
        readonly maxTokens: 30720;
        readonly contextWindow: 32768;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 3;
        readonly outputPrice: 9;
        readonly cacheWritesPrice: 3;
        readonly cacheReadsPrice: 9;
    };
    readonly "qwen-vl-max-latest": {
        readonly maxTokens: 129024;
        readonly contextWindow: 131072;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 3;
        readonly outputPrice: 9;
        readonly cacheWritesPrice: 3;
        readonly cacheReadsPrice: 9;
    };
    readonly "qwen-vl-plus": {
        readonly maxTokens: 6000;
        readonly contextWindow: 8000;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 1.5;
        readonly outputPrice: 4.5;
        readonly cacheWritesPrice: 1.5;
        readonly cacheReadsPrice: 4.5;
    };
    readonly "qwen-vl-plus-latest": {
        readonly maxTokens: 129024;
        readonly contextWindow: 131072;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 1.5;
        readonly outputPrice: 4.5;
        readonly cacheWritesPrice: 1.5;
        readonly cacheReadsPrice: 4.5;
    };
};
export declare const mainlandQwenModels: {
    readonly "qwen3-235b-a22b": {
        readonly maxTokens: 16384;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 2;
        readonly outputPrice: 8;
        readonly cacheWritesPrice: 2;
        readonly cacheReadsPrice: 8;
        readonly thinkingConfig: {
            readonly maxBudget: 38912;
            readonly outputPrice: 20;
        };
    };
    readonly "qwen3-32b": {
        readonly maxTokens: 16384;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 2;
        readonly outputPrice: 8;
        readonly cacheWritesPrice: 2;
        readonly cacheReadsPrice: 8;
        readonly thinkingConfig: {
            readonly maxBudget: 38912;
            readonly outputPrice: 20;
        };
    };
    readonly "qwen3-30b-a3b": {
        readonly maxTokens: 16384;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.75;
        readonly outputPrice: 3;
        readonly cacheWritesPrice: 0.75;
        readonly cacheReadsPrice: 3;
        readonly thinkingConfig: {
            readonly maxBudget: 38912;
            readonly outputPrice: 7.5;
        };
    };
    readonly "qwen3-14b": {
        readonly maxTokens: 8192;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 1;
        readonly outputPrice: 4;
        readonly cacheWritesPrice: 1;
        readonly cacheReadsPrice: 4;
        readonly thinkingConfig: {
            readonly maxBudget: 38912;
            readonly outputPrice: 10;
        };
    };
    readonly "qwen3-8b": {
        readonly maxTokens: 8192;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.5;
        readonly outputPrice: 2;
        readonly cacheWritesPrice: 0.5;
        readonly cacheReadsPrice: 2;
        readonly thinkingConfig: {
            readonly maxBudget: 38912;
            readonly outputPrice: 5;
        };
    };
    readonly "qwen3-4b": {
        readonly maxTokens: 8192;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.3;
        readonly outputPrice: 1.2;
        readonly cacheWritesPrice: 0.3;
        readonly cacheReadsPrice: 1.2;
        readonly thinkingConfig: {
            readonly maxBudget: 38912;
            readonly outputPrice: 3;
        };
    };
    readonly "qwen3-1.7b": {
        readonly maxTokens: 8192;
        readonly contextWindow: 32768;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.3;
        readonly outputPrice: 1.2;
        readonly cacheWritesPrice: 0.3;
        readonly cacheReadsPrice: 1.2;
        readonly thinkingConfig: {
            readonly maxBudget: 30720;
            readonly outputPrice: 3;
        };
    };
    readonly "qwen3-0.6b": {
        readonly maxTokens: 8192;
        readonly contextWindow: 32768;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.3;
        readonly outputPrice: 1.2;
        readonly cacheWritesPrice: 0.3;
        readonly cacheReadsPrice: 1.2;
        readonly thinkingConfig: {
            readonly maxBudget: 30720;
            readonly outputPrice: 3;
        };
    };
    readonly "qwen2.5-coder-32b-instruct": {
        readonly maxTokens: 8192;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.002;
        readonly outputPrice: 0.006;
        readonly cacheWritesPrice: 0.002;
        readonly cacheReadsPrice: 0.006;
    };
    readonly "qwen2.5-coder-14b-instruct": {
        readonly maxTokens: 8192;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.002;
        readonly outputPrice: 0.006;
        readonly cacheWritesPrice: 0.002;
        readonly cacheReadsPrice: 0.006;
    };
    readonly "qwen2.5-coder-7b-instruct": {
        readonly maxTokens: 8192;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.001;
        readonly outputPrice: 0.002;
        readonly cacheWritesPrice: 0.001;
        readonly cacheReadsPrice: 0.002;
    };
    readonly "qwen2.5-coder-3b-instruct": {
        readonly maxTokens: 8192;
        readonly contextWindow: 32768;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
    };
    readonly "qwen2.5-coder-1.5b-instruct": {
        readonly maxTokens: 8192;
        readonly contextWindow: 32768;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
    };
    readonly "qwen2.5-coder-0.5b-instruct": {
        readonly maxTokens: 8192;
        readonly contextWindow: 32768;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
    };
    readonly "qwen-coder-plus-latest": {
        readonly maxTokens: 129024;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 3.5;
        readonly outputPrice: 7;
        readonly cacheWritesPrice: 3.5;
        readonly cacheReadsPrice: 7;
    };
    readonly "qwen-plus-latest": {
        readonly maxTokens: 16384;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.8;
        readonly outputPrice: 2;
        readonly cacheWritesPrice: 0.8;
        readonly cacheReadsPrice: 2;
        readonly thinkingConfig: {
            readonly maxBudget: 38912;
            readonly outputPrice: 16;
        };
    };
    readonly "qwen-turbo-latest": {
        readonly maxTokens: 16384;
        readonly contextWindow: 1000000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.3;
        readonly outputPrice: 0.6;
        readonly cacheWritesPrice: 0.3;
        readonly cacheReadsPrice: 0.6;
        readonly thinkingConfig: {
            readonly maxBudget: 38912;
            readonly outputPrice: 6;
        };
    };
    readonly "qwen-max-latest": {
        readonly maxTokens: 30720;
        readonly contextWindow: 32768;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 2.4;
        readonly outputPrice: 9.6;
        readonly cacheWritesPrice: 2.4;
        readonly cacheReadsPrice: 9.6;
    };
    readonly "qwq-plus-latest": {
        readonly maxTokens: 8192;
        readonly contextWindow: 131071;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
    };
    readonly "qwq-plus": {
        readonly maxTokens: 8192;
        readonly contextWindow: 131071;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
    };
    readonly "qwen-coder-plus": {
        readonly maxTokens: 129024;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 3.5;
        readonly outputPrice: 7;
        readonly cacheWritesPrice: 3.5;
        readonly cacheReadsPrice: 7;
    };
    readonly "qwen-plus": {
        readonly maxTokens: 129024;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.8;
        readonly outputPrice: 2;
        readonly cacheWritesPrice: 0.8;
        readonly cacheReadsPrice: 0.2;
    };
    readonly "qwen-turbo": {
        readonly maxTokens: 1000000;
        readonly contextWindow: 1000000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.3;
        readonly outputPrice: 0.6;
        readonly cacheWritesPrice: 0.3;
        readonly cacheReadsPrice: 0.6;
    };
    readonly "qwen-max": {
        readonly maxTokens: 30720;
        readonly contextWindow: 32768;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 2.4;
        readonly outputPrice: 9.6;
        readonly cacheWritesPrice: 2.4;
        readonly cacheReadsPrice: 9.6;
    };
    readonly "deepseek-v3": {
        readonly maxTokens: 8000;
        readonly contextWindow: 64000;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0;
        readonly outputPrice: 0.28;
        readonly cacheWritesPrice: 0.14;
        readonly cacheReadsPrice: 0.014;
    };
    readonly "deepseek-r1": {
        readonly maxTokens: 8000;
        readonly contextWindow: 64000;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0;
        readonly outputPrice: 2.19;
        readonly cacheWritesPrice: 0.55;
        readonly cacheReadsPrice: 0.14;
    };
    readonly "qwen-vl-max": {
        readonly maxTokens: 30720;
        readonly contextWindow: 32768;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 3;
        readonly outputPrice: 9;
        readonly cacheWritesPrice: 3;
        readonly cacheReadsPrice: 9;
    };
    readonly "qwen-vl-max-latest": {
        readonly maxTokens: 129024;
        readonly contextWindow: 131072;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 3;
        readonly outputPrice: 9;
        readonly cacheWritesPrice: 3;
        readonly cacheReadsPrice: 9;
    };
    readonly "qwen-vl-plus": {
        readonly maxTokens: 6000;
        readonly contextWindow: 8000;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 1.5;
        readonly outputPrice: 4.5;
        readonly cacheWritesPrice: 1.5;
        readonly cacheReadsPrice: 4.5;
    };
    readonly "qwen-vl-plus-latest": {
        readonly maxTokens: 129024;
        readonly contextWindow: 131072;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 1.5;
        readonly outputPrice: 4.5;
        readonly cacheWritesPrice: 1.5;
        readonly cacheReadsPrice: 4.5;
    };
};
export declare enum QwenApiRegions {
    CHINA = "china",
    INTERNATIONAL = "international"
}
export type MainlandQwenModelId = keyof typeof mainlandQwenModels;
export type InternationalQwenModelId = keyof typeof internationalQwenModels;
export declare const internationalQwenDefaultModelId: InternationalQwenModelId;
export declare const mainlandQwenDefaultModelId: MainlandQwenModelId;
export type DoubaoModelId = keyof typeof doubaoModels;
export declare const doubaoDefaultModelId: DoubaoModelId;
export declare const doubaoModels: {
    readonly "doubao-1-5-pro-256k-250115": {
        readonly maxTokens: 12288;
        readonly contextWindow: 256000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.7;
        readonly outputPrice: 1.3;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
    };
    readonly "doubao-1-5-pro-32k-250115": {
        readonly maxTokens: 12288;
        readonly contextWindow: 32000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.11;
        readonly outputPrice: 0.3;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
    };
    readonly "deepseek-v3-250324": {
        readonly maxTokens: 12288;
        readonly contextWindow: 128000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.55;
        readonly outputPrice: 2.19;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
    };
    readonly "deepseek-r1-250120": {
        readonly maxTokens: 32768;
        readonly contextWindow: 64000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.27;
        readonly outputPrice: 1.09;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
    };
};
export type MistralModelId = keyof typeof mistralModels;
export declare const mistralDefaultModelId: MistralModelId;
export declare const mistralModels: {
    readonly "devstral-2512": {
        readonly maxTokens: 256000;
        readonly contextWindow: 256000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
    };
    readonly "labs-devstral-small-2512": {
        readonly maxTokens: 256000;
        readonly contextWindow: 256000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
    };
    readonly "mistral-large-2512": {
        readonly maxTokens: 256000;
        readonly contextWindow: 256000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.5;
        readonly outputPrice: 1.5;
    };
    readonly "ministral-14b-2512": {
        readonly maxTokens: 256000;
        readonly contextWindow: 256000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.2;
        readonly outputPrice: 0.2;
    };
    readonly "mistral-large-2411": {
        readonly maxTokens: 128000;
        readonly contextWindow: 128000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 2;
        readonly outputPrice: 6;
    };
    readonly "pixtral-large-2411": {
        readonly maxTokens: 131000;
        readonly contextWindow: 131000;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 2;
        readonly outputPrice: 6;
    };
    readonly "ministral-3b-2410": {
        readonly maxTokens: 128000;
        readonly contextWindow: 128000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.04;
        readonly outputPrice: 0.04;
    };
    readonly "ministral-8b-2410": {
        readonly maxTokens: 128000;
        readonly contextWindow: 128000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.1;
        readonly outputPrice: 0.1;
    };
    readonly "mistral-small-latest": {
        readonly maxTokens: 128000;
        readonly contextWindow: 128000;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.1;
        readonly outputPrice: 0.3;
    };
    readonly "mistral-medium-latest": {
        readonly maxTokens: 128000;
        readonly contextWindow: 128000;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.4;
        readonly outputPrice: 2;
    };
    readonly "mistral-small-2501": {
        readonly maxTokens: 32000;
        readonly contextWindow: 32000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.1;
        readonly outputPrice: 0.3;
    };
    readonly "pixtral-12b-2409": {
        readonly maxTokens: 128000;
        readonly contextWindow: 128000;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.15;
        readonly outputPrice: 0.15;
    };
    readonly "open-mistral-nemo-2407": {
        readonly maxTokens: 128000;
        readonly contextWindow: 128000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.15;
        readonly outputPrice: 0.15;
    };
    readonly "open-codestral-mamba": {
        readonly maxTokens: 256000;
        readonly contextWindow: 256000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.15;
        readonly outputPrice: 0.15;
    };
    readonly "codestral-2501": {
        readonly maxTokens: 256000;
        readonly contextWindow: 256000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.3;
        readonly outputPrice: 0.9;
    };
    readonly "devstral-small-2505": {
        readonly maxTokens: 128000;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.1;
        readonly outputPrice: 0.3;
    };
    readonly "devstral-medium-latest": {
        readonly maxTokens: 128000;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.4;
        readonly outputPrice: 2;
    };
};
export type LiteLLMModelId = string;
export declare const liteLlmDefaultModelId = "anthropic/claude-3-7-sonnet-20250219";
export interface LiteLLMModelInfo extends ModelInfo {
    temperature?: number;
}
export declare const liteLlmModelInfoSaneDefaults: LiteLLMModelInfo;
export type AskSageModelId = keyof typeof askSageModels;
export declare const askSageDefaultModelId: AskSageModelId;
export declare const askSageDefaultURL: string;
export declare const askSageModels: {
    "gpt-4o": {
        maxTokens: number;
        contextWindow: number;
        supportsImages: boolean;
        supportsPromptCache: boolean;
        inputPrice: number;
        outputPrice: number;
    };
    "gpt-4o-gov": {
        maxTokens: number;
        contextWindow: number;
        supportsImages: boolean;
        supportsPromptCache: boolean;
        inputPrice: number;
        outputPrice: number;
    };
    "gpt-4.1": {
        maxTokens: number;
        contextWindow: number;
        supportsImages: boolean;
        supportsPromptCache: boolean;
        inputPrice: number;
        outputPrice: number;
    };
    "claude-35-sonnet": {
        maxTokens: number;
        contextWindow: number;
        supportsImages: boolean;
        supportsPromptCache: boolean;
        inputPrice: number;
        outputPrice: number;
    };
    "aws-bedrock-claude-35-sonnet-gov": {
        maxTokens: number;
        contextWindow: number;
        supportsImages: boolean;
        supportsPromptCache: boolean;
        inputPrice: number;
        outputPrice: number;
    };
    "claude-37-sonnet": {
        maxTokens: number;
        contextWindow: number;
        supportsImages: boolean;
        supportsPromptCache: boolean;
        inputPrice: number;
        outputPrice: number;
    };
    "claude-4.6-sonnet": {
        maxTokens: number;
        contextWindow: number;
        supportsImages: boolean;
        supportsPromptCache: boolean;
        inputPrice: number;
        outputPrice: number;
    };
    "claude-4-sonnet": {
        maxTokens: number;
        contextWindow: number;
        supportsImages: boolean;
        supportsPromptCache: boolean;
        inputPrice: number;
        outputPrice: number;
    };
    "claude-4-opus": {
        maxTokens: number;
        contextWindow: number;
        supportsImages: boolean;
        supportsPromptCache: boolean;
        inputPrice: number;
        outputPrice: number;
    };
    "google-gemini-2.5-pro": {
        maxTokens: number;
        contextWindow: number;
        supportsImages: boolean;
        supportsPromptCache: boolean;
        inputPrice: number;
        outputPrice: number;
    };
    "google-claude-45-sonnet": {
        maxTokens: number;
        contextWindow: number;
        supportsImages: boolean;
        supportsPromptCache: boolean;
        inputPrice: number;
        outputPrice: number;
    };
    "google-claude-4-opus": {
        maxTokens: number;
        contextWindow: number;
        supportsImages: boolean;
        supportsPromptCache: boolean;
        inputPrice: number;
        outputPrice: number;
    };
    "gpt-5": {
        maxTokens: number;
        contextWindow: number;
        supportsImages: boolean;
        supportsPromptCache: boolean;
        inputPrice: number;
        outputPrice: number;
    };
    "gpt-5-mini": {
        maxTokens: number;
        contextWindow: number;
        supportsImages: boolean;
        supportsPromptCache: boolean;
        inputPrice: number;
        outputPrice: number;
    };
    "gpt-5-nano": {
        maxTokens: number;
        contextWindow: number;
        supportsImages: boolean;
        supportsPromptCache: boolean;
        inputPrice: number;
        outputPrice: number;
    };
};
export declare const nebiusModels: {
    readonly "deepseek-ai/DeepSeek-V3": {
        readonly maxTokens: 32000;
        readonly contextWindow: 96000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.5;
        readonly outputPrice: 1.5;
    };
    readonly "deepseek-ai/DeepSeek-V3-0324-fast": {
        readonly maxTokens: 128000;
        readonly contextWindow: 128000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 2;
        readonly outputPrice: 6;
    };
    readonly "deepseek-ai/DeepSeek-R1": {
        readonly maxTokens: 32000;
        readonly contextWindow: 96000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.8;
        readonly outputPrice: 2.4;
    };
    readonly "deepseek-ai/DeepSeek-R1-fast": {
        readonly maxTokens: 32000;
        readonly contextWindow: 96000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 2;
        readonly outputPrice: 6;
    };
    readonly "deepseek-ai/DeepSeek-R1-0528": {
        readonly maxTokens: 128000;
        readonly contextWindow: 163840;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.8;
        readonly outputPrice: 2.4;
    };
    readonly "meta-llama/Llama-3.3-70B-Instruct-fast": {
        readonly maxTokens: 32000;
        readonly contextWindow: 96000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.25;
        readonly outputPrice: 0.75;
    };
    readonly "Qwen/Qwen2.5-32B-Instruct-fast": {
        readonly maxTokens: 8192;
        readonly contextWindow: 32768;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.13;
        readonly outputPrice: 0.4;
    };
    readonly "Qwen/Qwen2.5-Coder-32B-Instruct-fast": {
        readonly maxTokens: 128000;
        readonly contextWindow: 128000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.1;
        readonly outputPrice: 0.3;
    };
    readonly "Qwen/Qwen3-4B-fast": {
        readonly maxTokens: 32000;
        readonly contextWindow: 41000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.08;
        readonly outputPrice: 0.24;
    };
    readonly "Qwen/Qwen3-30B-A3B-fast": {
        readonly maxTokens: 32000;
        readonly contextWindow: 41000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.3;
        readonly outputPrice: 0.9;
    };
    readonly "Qwen/Qwen3-235B-A22B": {
        readonly maxTokens: 32000;
        readonly contextWindow: 41000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.2;
        readonly outputPrice: 0.6;
    };
    readonly "openai/gpt-oss-120b": {
        readonly maxTokens: 32766;
        readonly contextWindow: 131000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.15;
        readonly outputPrice: 0.6;
    };
    readonly "moonshotai/Kimi-K2-Instruct": {
        readonly maxTokens: 16384;
        readonly contextWindow: 131000;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.5;
        readonly outputPrice: 2.4;
    };
    readonly "Qwen/Qwen3-Coder-480B-A35B-Instruct": {
        readonly maxTokens: 163800;
        readonly contextWindow: 262000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.4;
        readonly outputPrice: 1.8;
    };
    readonly "openai/gpt-oss-20b": {
        readonly maxTokens: 32766;
        readonly contextWindow: 131000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.05;
        readonly outputPrice: 0.2;
    };
    readonly "zai-org/GLM-4.5": {
        readonly maxTokens: 98304;
        readonly contextWindow: 128000;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.6;
        readonly outputPrice: 2.2;
    };
    readonly "zai-org/GLM-4.5-Air": {
        readonly maxTokens: 98304;
        readonly contextWindow: 128000;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.2;
        readonly outputPrice: 1.2;
    };
    readonly "deepseek-ai/DeepSeek-R1-0528-fast": {
        readonly maxTokens: 128000;
        readonly contextWindow: 164000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 2;
        readonly outputPrice: 6;
    };
    readonly "Qwen/Qwen3-235B-A22B-Instruct-2507": {
        readonly maxTokens: 64000;
        readonly contextWindow: 262000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.2;
        readonly outputPrice: 0.6;
    };
    readonly "Qwen/Qwen3-30B-A3B": {
        readonly maxTokens: 32000;
        readonly contextWindow: 41000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.1;
        readonly outputPrice: 0.3;
    };
    readonly "Qwen/Qwen3-32B": {
        readonly maxTokens: 16384;
        readonly contextWindow: 41000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.1;
        readonly outputPrice: 0.3;
    };
    readonly "Qwen/Qwen3-32B-fast": {
        readonly maxTokens: 16384;
        readonly contextWindow: 41000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.2;
        readonly outputPrice: 0.6;
    };
};
export type NebiusModelId = keyof typeof nebiusModels;
export declare const nebiusDefaultModelId = "Qwen/Qwen2.5-32B-Instruct-fast";
export declare const wandbModels: {
    readonly "deepseek-ai/DeepSeek-V3.1": {
        readonly maxTokens: 8192;
        readonly contextWindow: 161000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.55;
        readonly outputPrice: 1.65;
        readonly description: "A large hybrid model that supports both thinking and non-thinking modes via prompt templates";
    };
    readonly "meta-llama/Llama-4-Scout-17B-16E-Instruct": {
        readonly maxTokens: 16384;
        readonly contextWindow: 64000;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.17;
        readonly outputPrice: 0.66;
        readonly description: "Multimodal model integrating text and image understanding, ideal for visual tasks and combined analysis";
    };
    readonly "meta-llama/Llama-3.3-70B-Instruct": {
        readonly maxTokens: 8192;
        readonly contextWindow: 128000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.71;
        readonly outputPrice: 0.71;
        readonly description: "Multilingual model excelling in conversational tasks, detailed instruction-following, and coding";
    };
    readonly "meta-llama/Llama-3.1-70B-Instruct": {
        readonly maxTokens: 8192;
        readonly contextWindow: 128000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.8;
        readonly outputPrice: 0.8;
        readonly description: "Efficient conversational model optimized for responsive multilingual chatbot interactions";
    };
    readonly "meta-llama/Llama-3.1-8B-Instruct": {
        readonly maxTokens: 8192;
        readonly contextWindow: 128000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.22;
        readonly outputPrice: 0.22;
        readonly description: "Efficient conversational model optimized for responsive multilingual chatbot interactions";
    };
    readonly "microsoft/Phi-4-mini-instruct": {
        readonly maxTokens: 4096;
        readonly contextWindow: 128000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.08;
        readonly outputPrice: 0.35;
        readonly description: "Compact, efficient model ideal for fast responses in resource-constrained environments";
    };
    readonly "MiniMaxAI/MiniMax-M2.5": {
        readonly maxTokens: 40960;
        readonly contextWindow: 197000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.3;
        readonly outputPrice: 1.2;
        readonly description: "MoE model with a highly sparse architecture designed for high-throughput and low latency with strong coding capabilities";
    };
    readonly "nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-FP8": {
        readonly maxTokens: 8192;
        readonly contextWindow: 262000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.2;
        readonly outputPrice: 0.8;
        readonly description: "A LatentMoE model designed to deliver strong agentic, reasoning, and conversational capabilities";
    };
    readonly "openai/gpt-oss-120b": {
        readonly maxTokens: 32768;
        readonly contextWindow: 131000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.15;
        readonly outputPrice: 0.6;
        readonly description: "Efficient Mixture-of-Experts model designed for high-reasoning, agentic and general-purpose use cases";
    };
    readonly "openai/gpt-oss-20b": {
        readonly maxTokens: 32768;
        readonly contextWindow: 131000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.05;
        readonly outputPrice: 0.2;
        readonly description: "Lower latency Mixture-of-Experts model trained on OpenAI’s Harmony response format with reasoning capabilities";
    };
    readonly "OpenPipe/Qwen3-14B-Instruct": {
        readonly maxTokens: 8192;
        readonly contextWindow: 32000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.05;
        readonly outputPrice: 0.22;
        readonly description: "An efficient multilingual, dense, instruction-tuned model, optimized by OpenPipe for building agents with finetuning";
    };
    readonly "Qwen/Qwen3-235B-A22B-Thinking-2507": {
        readonly maxTokens: 32768;
        readonly contextWindow: 262000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.1;
        readonly outputPrice: 0.1;
        readonly description: "High-performance Mixture-of-Experts model optimized for structured reasoning, math, and long-form generation";
    };
    readonly "Qwen/Qwen3-235B-A22B-Instruct-2507": {
        readonly maxTokens: 32768;
        readonly contextWindow: 262000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.1;
        readonly outputPrice: 0.1;
        readonly description: "Efficient multilingual, Mixture-of-Experts, instruction-tuned model, optimized for logical reasoning";
    };
    readonly "Qwen/Qwen3-30B-A3B-Instruct-2507": {
        readonly maxTokens: 8192;
        readonly contextWindow: 262000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.1;
        readonly outputPrice: 0.3;
        readonly description: "MoE instruction-tuned model with enhanced reasoning, coding, and long-context understanding";
    };
    readonly "Qwen/Qwen3-Coder-480B-A35B-Instruct": {
        readonly maxTokens: 32768;
        readonly contextWindow: 262000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 1;
        readonly outputPrice: 1.5;
        readonly description: "Mixture-of-Experts model optimized for agentic coding tasks such as function calling, tool use, and long-context reasoning";
    };
    readonly "zai-org/GLM-5-FP8": {
        readonly maxTokens: 8192;
        readonly contextWindow: 200000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 1;
        readonly outputPrice: 3.2;
        readonly description: "Mixture-of-Experts model for long-horizon agentic tasks with strong performance on reasoning and coding";
    };
};
export type WandbModelId = keyof typeof wandbModels;
export declare const wandbDefaultModelId = "meta-llama/Llama-3.3-70B-Instruct";
export type XAIModelId = keyof typeof xaiModels;
export declare const xaiDefaultModelId: XAIModelId;
export declare const xaiModels: {
    readonly "grok-4-1-fast-reasoning": {
        readonly contextWindow: 2000000;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.2;
        readonly cacheReadsPrice: 0.05;
        readonly outputPrice: 0.5;
        readonly description: "xAI's Grok 4.1 Reasoning Fast - multimodal model with 2M context.";
    };
    readonly "grok-4-1-fast-non-reasoning": {
        readonly contextWindow: 2000000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.2;
        readonly cacheReadsPrice: 0.05;
        readonly outputPrice: 0.5;
        readonly description: "xAI's Grok 4.1 Non-Reasoning Fast - multimodal model with 2M context.";
    };
    readonly "grok-code-fast-1": {
        readonly contextWindow: 256000;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.2;
        readonly cacheReadsPrice: 0.02;
        readonly outputPrice: 1.5;
        readonly description: "xAI's Grok Coding model.";
    };
    readonly "grok-4-fast-reasoning": {
        readonly maxTokens: 30000;
        readonly contextWindow: 2000000;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.2;
        readonly cacheReadsPrice: 0.05;
        readonly outputPrice: 0.5;
        readonly description: "xAI's Grok 4 Fast (free) multimodal model with 2M context.";
    };
    readonly "grok-4": {
        readonly maxTokens: 8192;
        readonly contextWindow: 262144;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 3;
        readonly cacheReadsPrice: 0.75;
        readonly outputPrice: 15;
    };
    readonly "grok-3-beta": {
        readonly maxTokens: 8192;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly description: "X AI's Grok-3 beta model with 131K context window";
    };
    readonly "grok-3-fast-beta": {
        readonly maxTokens: 8192;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 5;
        readonly outputPrice: 25;
        readonly description: "X AI's Grok-3 fast beta model with 131K context window";
    };
    readonly "grok-3-mini-beta": {
        readonly maxTokens: 8192;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.3;
        readonly outputPrice: 0.5;
        readonly description: "X AI's Grok-3 mini beta model with 131K context window";
    };
    readonly "grok-3-mini-fast-beta": {
        readonly maxTokens: 8192;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.6;
        readonly outputPrice: 4;
        readonly description: "X AI's Grok-3 mini fast beta model with 131K context window";
    };
    readonly "grok-3": {
        readonly maxTokens: 8192;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 3;
        readonly outputPrice: 15;
        readonly description: "X AI's Grok-3 model with 131K context window";
    };
    readonly "grok-3-fast": {
        readonly maxTokens: 8192;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 5;
        readonly outputPrice: 25;
        readonly description: "X AI's Grok-3 fast model with 131K context window";
    };
    readonly "grok-3-mini": {
        readonly maxTokens: 8192;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.3;
        readonly outputPrice: 0.5;
        readonly description: "X AI's Grok-3 mini model with 131K context window";
    };
    readonly "grok-3-mini-fast": {
        readonly maxTokens: 8192;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.6;
        readonly outputPrice: 4;
        readonly description: "X AI's Grok-3 mini fast model with 131K context window";
    };
    readonly "grok-2-latest": {
        readonly maxTokens: 8192;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 2;
        readonly outputPrice: 10;
        readonly description: "X AI's Grok-2 model - latest version with 131K context window";
    };
    readonly "grok-2": {
        readonly maxTokens: 8192;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 2;
        readonly outputPrice: 10;
        readonly description: "X AI's Grok-2 model with 131K context window";
    };
    readonly "grok-2-1212": {
        readonly maxTokens: 8192;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 2;
        readonly outputPrice: 10;
        readonly description: "X AI's Grok-2 model (version 1212) with 131K context window";
    };
    readonly "grok-2-vision-latest": {
        readonly maxTokens: 8192;
        readonly contextWindow: 32768;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 2;
        readonly outputPrice: 10;
        readonly description: "X AI's Grok-2 Vision model - latest version with image support and 32K context window";
    };
    readonly "grok-2-vision": {
        readonly maxTokens: 8192;
        readonly contextWindow: 32768;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 2;
        readonly outputPrice: 10;
        readonly description: "X AI's Grok-2 Vision model with image support and 32K context window";
    };
    readonly "grok-2-vision-1212": {
        readonly maxTokens: 8192;
        readonly contextWindow: 32768;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 2;
        readonly outputPrice: 10;
        readonly description: "X AI's Grok-2 Vision model (version 1212) with image support and 32K context window";
    };
    readonly "grok-vision-beta": {
        readonly maxTokens: 8192;
        readonly contextWindow: 8192;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 5;
        readonly outputPrice: 15;
        readonly description: "X AI's Grok Vision Beta model with image support and 8K context window";
    };
    readonly "grok-beta": {
        readonly maxTokens: 8192;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 5;
        readonly outputPrice: 15;
        readonly description: "X AI's Grok Beta model (legacy) with 131K context window";
    };
};
export type SambanovaModelId = keyof typeof sambanovaModels;
export declare const sambanovaDefaultModelId: SambanovaModelId;
export declare const sambanovaModels: {
    readonly "DeepSeek-R1-0528": {
        readonly maxTokens: 7168;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly temperature: 0.6;
        readonly inputPrice: 5;
        readonly outputPrice: 7;
    };
    readonly "DeepSeek-R1-Distill-Llama-70B": {
        readonly maxTokens: 4096;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly temperature: 0.6;
        readonly inputPrice: 0.7;
        readonly outputPrice: 1.4;
    };
    readonly "DeepSeek-V3-0324": {
        readonly maxTokens: 7168;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly temperature: 0.3;
        readonly inputPrice: 3;
        readonly outputPrice: 4.5;
    };
    readonly "DeepSeek-V3.1": {
        readonly maxTokens: 7168;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly temperature: 0.6;
        readonly inputPrice: 3;
        readonly outputPrice: 4.5;
    };
    readonly "DeepSeek-V3.1-Terminus": {
        readonly maxTokens: 7168;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly temperature: 0.6;
        readonly inputPrice: 3;
        readonly outputPrice: 4.5;
    };
    readonly "Llama-4-Maverick-17B-128E-Instruct": {
        readonly maxTokens: 4096;
        readonly contextWindow: 131072;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly temperature: 0.6;
        readonly inputPrice: 0.63;
        readonly outputPrice: 1.8;
    };
    readonly "Meta-Llama-3.1-8B-Instruct": {
        readonly maxTokens: 4096;
        readonly contextWindow: 16384;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly temperature: 0.6;
        readonly inputPrice: 0.1;
        readonly outputPrice: 0.2;
    };
    readonly "Meta-Llama-3.3-70B-Instruct": {
        readonly maxTokens: 3072;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly temperature: 0.6;
        readonly inputPrice: 0.6;
        readonly outputPrice: 1.2;
    };
    readonly "MiniMax-M2.5": {
        readonly maxTokens: 16384;
        readonly contextWindow: 163840;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly temperature: 1;
        readonly inputPrice: 0.3;
        readonly outputPrice: 1.2;
    };
    readonly "Qwen3-235B": {
        readonly maxTokens: 4096;
        readonly contextWindow: 65536;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly temperature: 0.7;
        readonly inputPrice: 0.4;
        readonly outputPrice: 0.8;
    };
    readonly "Qwen3-32B": {
        readonly maxTokens: 4096;
        readonly contextWindow: 32768;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly temperature: 0.6;
        readonly inputPrice: 0.4;
        readonly outputPrice: 0.8;
    };
};
export type CerebrasModelId = keyof typeof cerebrasModels;
export declare const cerebrasDefaultModelId: CerebrasModelId;
export declare const cerebrasModels: {
    readonly "zai-glm-4.7": {
        readonly maxTokens: 40000;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly temperature: 0.9;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
        readonly description: "Highly capable general-purpose model on Cerebras (up to 1,000 tokens/s), competitive with leading proprietary models on coding tasks.";
    };
    readonly "gpt-oss-120b": {
        readonly maxTokens: 65536;
        readonly contextWindow: 128000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
        readonly description: "Intelligent general purpose model with 3,000 tokens/s";
    };
    readonly "qwen-3-235b-a22b-instruct-2507": {
        readonly maxTokens: 64000;
        readonly contextWindow: 64000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
        readonly description: "Intelligent model with ~1400 tokens/s";
    };
};
export type GroqModelId = keyof typeof groqModels;
export declare const groqDefaultModelId: GroqModelId;
export declare const groqModels: {
    readonly "openai/gpt-oss-120b": {
        readonly maxTokens: 32766;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.15;
        readonly outputPrice: 0.75;
        readonly description: "A state-of-the-art 120B open-weight Mixture-of-Experts language model optimized for strong reasoning, tool use, and efficient deployment on large GPUs";
    };
    readonly "openai/gpt-oss-20b": {
        readonly maxTokens: 32766;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.1;
        readonly outputPrice: 0.5;
        readonly description: "A compact 20B open-weight Mixture-of-Experts language model designed for strong reasoning and tool use, ideal for edge devices and local inference.";
    };
    readonly "compound-beta": {
        readonly maxTokens: 8192;
        readonly contextWindow: 128000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
        readonly description: "Compound model using Llama 4 Scout for core reasoning with Llama 3.3 70B for routing and tool use. Excellent for plan/act workflows.";
    };
    readonly "compound-beta-mini": {
        readonly maxTokens: 8192;
        readonly contextWindow: 128000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
        readonly description: "Lightweight compound model for faster inference while maintaining tool use capabilities.";
    };
    readonly "deepseek-r1-distill-llama-70b": {
        readonly maxTokens: 131072;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.75;
        readonly outputPrice: 0.99;
        readonly description: "DeepSeek R1 reasoning capabilities distilled into Llama 70B architecture. Excellent for complex problem-solving and planning.";
    };
    readonly "meta-llama/llama-4-maverick-17b-128e-instruct": {
        readonly maxTokens: 8192;
        readonly contextWindow: 131072;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.2;
        readonly outputPrice: 0.6;
        readonly description: "Meta's Llama 4 Maverick 17B model with 128 experts, supports vision and multimodal tasks.";
    };
    readonly "meta-llama/llama-4-scout-17b-16e-instruct": {
        readonly maxTokens: 8192;
        readonly contextWindow: 131072;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.11;
        readonly outputPrice: 0.34;
        readonly description: "Meta's Llama 4 Scout 17B model with 16 experts, optimized for fast inference and general tasks.";
    };
    readonly "llama-3.3-70b-versatile": {
        readonly maxTokens: 32768;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.59;
        readonly outputPrice: 0.79;
        readonly description: "Meta's latest Llama 3.3 70B model optimized for versatile use cases with excellent performance and speed.";
    };
    readonly "llama-3.1-8b-instant": {
        readonly maxTokens: 131072;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.05;
        readonly outputPrice: 0.08;
        readonly description: "Fast and efficient Llama 3.1 8B model optimized for speed, low latency, and reliable tool execution.";
    };
    readonly "moonshotai/kimi-k2-instruct": {
        readonly maxTokens: 16384;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 1;
        readonly outputPrice: 3;
        readonly cacheReadsPrice: 0.5;
        readonly description: "Kimi K2 is Moonshot AI's state-of-the-art Mixture-of-Experts (MoE) language model with 1 trillion total parameters and 32 billion activated parameters.";
    };
    readonly "moonshotai/kimi-k2-instruct-0905": {
        readonly maxTokens: 16384;
        readonly contextWindow: 262144;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.6;
        readonly outputPrice: 2.5;
        readonly cacheReadsPrice: 0.15;
        readonly description: "Kimi K2 model gets a new version update: Agentic coding: more accurate, better generalization across scaffolds. Frontend coding: improved aesthetics and functionalities on web, 3d, and other tasks. Context length: extended from 128k to 256k, providing better long-horizon support.";
    };
};
export declare const requestyDefaultModelId = "anthropic/claude-3-7-sonnet-latest";
export declare const requestyDefaultModelInfo: ModelInfo;
export type SapAiCoreModelId = keyof typeof sapAiCoreModels;
export declare const sapAiCoreDefaultModelId: SapAiCoreModelId;
export declare const sapAiCoreModels: {
    readonly "anthropic--claude-4.5-haiku": {
        readonly maxTokens: 64000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly description: "Pricing is calculated using SAP's Capacity Units rather than direct USD pricing.";
    };
    readonly "anthropic--claude-4.6-sonnet": {
        readonly maxTokens: 8192;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly description: "Pricing is calculated using SAP's Capacity Units rather than direct USD pricing.";
    };
    readonly "anthropic--claude-4.5-sonnet": {
        readonly maxTokens: 64000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly description: "Pricing is calculated using SAP's Capacity Units rather than direct USD pricing.";
    };
    readonly "anthropic--claude-4-sonnet": {
        readonly maxTokens: 64000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly description: "Pricing is calculated using SAP's Capacity Units rather than direct USD pricing.";
    };
    readonly "anthropic--claude-4.5-opus": {
        readonly maxTokens: 64000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly description: "Pricing is calculated using SAP's Capacity Units rather than direct USD pricing.";
    };
    readonly "anthropic--claude-4-opus": {
        readonly maxTokens: 32000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly description: "Pricing is calculated using SAP's Capacity Units rather than direct USD pricing.";
    };
    readonly "anthropic--claude-3.7-sonnet": {
        readonly maxTokens: 64000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly description: "Pricing is calculated using SAP's Capacity Units rather than direct USD pricing.";
    };
    readonly "anthropic--claude-3.5-sonnet": {
        readonly maxTokens: 8192;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly description: "Pricing is calculated using SAP's Capacity Units rather than direct USD pricing.";
    };
    readonly "anthropic--claude-3-sonnet": {
        readonly maxTokens: 4096;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly description: "Pricing is calculated using SAP's Capacity Units rather than direct USD pricing.";
    };
    readonly "anthropic--claude-3-haiku": {
        readonly maxTokens: 4096;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly description: "Pricing is calculated using SAP's Capacity Units rather than direct USD pricing.";
    };
    readonly "anthropic--claude-3-opus": {
        readonly maxTokens: 4096;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly description: "Pricing is calculated using SAP's Capacity Units rather than direct USD pricing.";
    };
    readonly "gemini-2.5-pro": {
        readonly maxTokens: 65536;
        readonly contextWindow: 1048576;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly thinkingConfig: {
            readonly maxBudget: 32767;
        };
        readonly description: "Pricing is calculated using SAP's Capacity Units rather than direct USD pricing.";
    };
    readonly "gemini-2.5-flash": {
        readonly maxTokens: 65536;
        readonly contextWindow: 1048576;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly thinkingConfig: {
            readonly maxBudget: 24576;
        };
        readonly description: "Pricing is calculated using SAP's Capacity Units rather than direct USD pricing.";
    };
    readonly "gpt-4": {
        readonly maxTokens: 4096;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly description: "Pricing is calculated using SAP's Capacity Units rather than direct USD pricing.";
    };
    readonly "gpt-4o": {
        readonly maxTokens: 4096;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly description: "Pricing is calculated using SAP's Capacity Units rather than direct USD pricing.";
    };
    readonly "gpt-4o-mini": {
        readonly maxTokens: 4096;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly description: "Pricing is calculated using SAP's Capacity Units rather than direct USD pricing.";
    };
    readonly "gpt-4.1": {
        readonly maxTokens: 32768;
        readonly contextWindow: 1047576;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly description: "Pricing is calculated using SAP's Capacity Units rather than direct USD pricing.";
    };
    readonly "gpt-4.1-nano": {
        readonly maxTokens: 32768;
        readonly contextWindow: 1047576;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly description: "Pricing is calculated using SAP's Capacity Units rather than direct USD pricing.";
    };
    readonly "gpt-5": {
        readonly maxTokens: 128000;
        readonly contextWindow: 272000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly description: "Pricing is calculated using SAP's Capacity Units rather than direct USD pricing.";
    };
    readonly "gpt-5-nano": {
        readonly maxTokens: 128000;
        readonly contextWindow: 272000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly description: "Pricing is calculated using SAP's Capacity Units rather than direct USD pricing.";
    };
    readonly "gpt-5-mini": {
        readonly maxTokens: 128000;
        readonly contextWindow: 272000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly description: "Pricing is calculated using SAP's Capacity Units rather than direct USD pricing.";
    };
    readonly o1: {
        readonly maxTokens: 4096;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly description: "Pricing is calculated using SAP's Capacity Units rather than direct USD pricing.";
    };
    readonly o3: {
        readonly maxTokens: 100000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly description: "Pricing is calculated using SAP's Capacity Units rather than direct USD pricing.";
    };
    readonly "o3-mini": {
        readonly maxTokens: 4096;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly description: "Pricing is calculated using SAP's Capacity Units rather than direct USD pricing.";
    };
    readonly "o4-mini": {
        readonly maxTokens: 100000;
        readonly contextWindow: 200000;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly description: "Pricing is calculated using SAP's Capacity Units rather than direct USD pricing.";
    };
    readonly sonar: {
        readonly maxTokens: 128000;
        readonly contextWindow: 128000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly description: "Pricing is calculated using SAP's Capacity Units rather than direct USD pricing.";
    };
    readonly "sonar-pro": {
        readonly maxTokens: 128000;
        readonly contextWindow: 200000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly description: "Pricing is calculated using SAP's Capacity Units rather than direct USD pricing.";
    };
};
export declare const moonshotModels: {
    readonly "kimi-k2.5": {
        readonly maxTokens: 32000;
        readonly contextWindow: 262144;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.6;
        readonly outputPrice: 3;
        readonly cacheReadsPrice: 0.1;
        readonly temperature: 1;
    };
    readonly "kimi-k2-0905-preview": {
        readonly maxTokens: 16384;
        readonly contextWindow: 262144;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.6;
        readonly outputPrice: 2.5;
        readonly temperature: 0.6;
    };
    readonly "kimi-k2-0711-preview": {
        readonly maxTokens: 32000;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.6;
        readonly outputPrice: 2.5;
        readonly temperature: 0.6;
    };
    readonly "kimi-k2-turbo-preview": {
        readonly maxTokens: 32000;
        readonly contextWindow: 262144;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 2.4;
        readonly outputPrice: 10;
        readonly temperature: 0.6;
    };
    readonly "kimi-k2-thinking": {
        readonly maxTokens: 32000;
        readonly contextWindow: 262144;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.6;
        readonly outputPrice: 2.5;
        readonly temperature: 1;
    };
    readonly "kimi-k2-thinking-turbo": {
        readonly maxTokens: 32000;
        readonly contextWindow: 262144;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 2.4;
        readonly outputPrice: 10;
        readonly temperature: 1;
    };
};
export type MoonshotModelId = keyof typeof moonshotModels;
export declare const moonshotDefaultModelId = "kimi-k2-0905-preview";
export type HuaweiCloudMaasModelId = keyof typeof huaweiCloudMaasModels;
export declare const huaweiCloudMaasDefaultModelId: HuaweiCloudMaasModelId;
export declare const huaweiCloudMaasModels: {
    readonly "DeepSeek-V3": {
        readonly maxTokens: 16384;
        readonly contextWindow: 64000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.27;
        readonly outputPrice: 1.1;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
    };
    readonly "DeepSeek-R1": {
        readonly maxTokens: 16384;
        readonly contextWindow: 64000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.55;
        readonly outputPrice: 2.2;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
        readonly thinkingConfig: {
            readonly maxBudget: 8192;
            readonly outputPrice: 2.2;
        };
    };
    readonly "deepseek-r1-250528": {
        readonly maxTokens: 16384;
        readonly contextWindow: 64000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.55;
        readonly outputPrice: 2.2;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
        readonly thinkingConfig: {
            readonly maxBudget: 8192;
            readonly outputPrice: 2.2;
        };
    };
    readonly "qwen3-235b-a22b": {
        readonly maxTokens: 8192;
        readonly contextWindow: 32000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.27;
        readonly outputPrice: 1.1;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
        readonly thinkingConfig: {
            readonly maxBudget: 4096;
            readonly outputPrice: 1.1;
        };
    };
    readonly "qwen3-32b": {
        readonly maxTokens: 8192;
        readonly contextWindow: 32000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.27;
        readonly outputPrice: 1.1;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
        readonly thinkingConfig: {
            readonly maxBudget: 4096;
            readonly outputPrice: 1.1;
        };
    };
};
export interface BasetenModelInfo extends ModelInfo {
    supportedFeatures?: string[];
}
export declare const basetenModels: {
    readonly "moonshotai/Kimi-K2-Thinking": {
        readonly maxTokens: 163800;
        readonly contextWindow: 262000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.6;
        readonly outputPrice: 2.5;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
        readonly description: "Kimi K2 Thinking - A model with enhanced reasoning capabilities from Kimi K2";
        readonly supportsReasoning: true;
    };
    readonly "zai-org/GLM-4.6": {
        readonly maxTokens: 200000;
        readonly contextWindow: 200000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.6;
        readonly outputPrice: 2.2;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
        readonly description: "Frontier open model with advanced agentic, reasoning and coding capabilities";
        readonly supportsReasoning: true;
    };
    readonly "deepseek-ai/DeepSeek-R1": {
        readonly maxTokens: 131072;
        readonly contextWindow: 163840;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 2.55;
        readonly outputPrice: 5.95;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
        readonly description: "DeepSeek's first-generation reasoning model";
        readonly supportsReasoning: true;
    };
    readonly "deepseek-ai/DeepSeek-R1-0528": {
        readonly maxTokens: 131072;
        readonly contextWindow: 163840;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 2.55;
        readonly outputPrice: 5.95;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
        readonly description: "The latest revision of DeepSeek's first-generation reasoning model";
        readonly supportsReasoning: true;
    };
    readonly "deepseek-ai/DeepSeek-V3-0324": {
        readonly maxTokens: 131072;
        readonly contextWindow: 163840;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.77;
        readonly outputPrice: 0.77;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
        readonly description: "Fast general-purpose LLM with enhanced reasoning capabilities";
        readonly supportsReasoning: true;
    };
    readonly "deepseek-ai/DeepSeek-V3.1": {
        readonly maxTokens: 131072;
        readonly contextWindow: 163840;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.5;
        readonly outputPrice: 1.5;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
        readonly description: "Extremely capable general-purpose LLM with hybrid reasoning capabilities and advanced tool calling";
        readonly supportsReasoning: true;
    };
    readonly "deepseek-ai/DeepSeek-V3.2": {
        readonly maxTokens: 131072;
        readonly contextWindow: 163840;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.3;
        readonly outputPrice: 0.45;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
        readonly description: "DeepSeek's hybrid reasoning model with efficient long context scaling with GPT-5 level performance";
        readonly supportsReasoning: true;
    };
    readonly "Qwen/Qwen3-235B-A22B-Instruct-2507": {
        readonly maxTokens: 262144;
        readonly contextWindow: 262144;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.22;
        readonly outputPrice: 0.8;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
        readonly description: "Mixture-of-experts LLM with math and reasoning capabilities";
        readonly supportsReasoning: false;
    };
    readonly "Qwen/Qwen3-Coder-480B-A35B-Instruct": {
        readonly maxTokens: 262144;
        readonly contextWindow: 262144;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.38;
        readonly outputPrice: 1.53;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
        readonly description: "Mixture-of-experts LLM with advanced coding and reasoning capabilities";
        readonly supportsReasoning: false;
    };
    readonly "openai/gpt-oss-120b": {
        readonly maxTokens: 128072;
        readonly contextWindow: 128072;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.1;
        readonly outputPrice: 0.5;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
        readonly description: "Extremely capable general-purpose LLM with strong, controllable reasoning capabilities";
        readonly supportsReasoning: true;
    };
    readonly "moonshotai/Kimi-K2-Instruct-0905": {
        readonly maxTokens: 168000;
        readonly contextWindow: 262000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.6;
        readonly outputPrice: 2.5;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
        readonly description: "State of the art language model for agentic and coding tasks. September Update.";
        readonly supportsReasoning: false;
    };
};
export type BasetenModelId = keyof typeof basetenModels;
export declare const basetenDefaultModelId = "zai-org/GLM-4.6";
export type internationalZAiModelId = keyof typeof internationalZAiModels;
export declare const internationalZAiDefaultModelId: internationalZAiModelId;
export declare const internationalZAiModels: {
    readonly "glm-5": {
        readonly maxTokens: 128000;
        readonly contextWindow: 200000;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly cacheReadsPrice: 0.2;
        readonly inputPrice: 1;
        readonly outputPrice: 3.2;
    };
    readonly "glm-4.7": {
        readonly maxTokens: 131000;
        readonly contextWindow: 200000;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly cacheReadsPrice: 0.11;
        readonly inputPrice: 0.6;
        readonly outputPrice: 2.2;
    };
    readonly "glm-4.6": {
        readonly maxTokens: 128000;
        readonly contextWindow: 200000;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly cacheReadsPrice: 0.11;
        readonly inputPrice: 0.6;
        readonly outputPrice: 2.2;
    };
    readonly "glm-4.5": {
        readonly maxTokens: 98304;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.6;
        readonly outputPrice: 2.2;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0.11;
        readonly description: "GLM-4.5 is Zhipu's latest featured model. Its comprehensive capabilities in reasoning, coding, and agent reach the state-of-the-art (SOTA) level among open-source models, with a context length of up to 128k.";
    };
    readonly "glm-4.5-air": {
        readonly maxTokens: 98304;
        readonly contextWindow: 128000;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.2;
        readonly outputPrice: 1.2;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0.03;
        readonly description: "GLM-4.5-Air is the lightweight version of GLM-4.5. It balances performance and cost-effectiveness, and can flexibly switch to hybrid thinking models.";
    };
};
export type mainlandZAiModelId = keyof typeof mainlandZAiModels;
export declare const mainlandZAiDefaultModelId: mainlandZAiModelId;
export declare const mainlandZAiModels: {
    readonly "glm-5": {
        readonly maxTokens: 128000;
        readonly contextWindow: 200000;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly cacheReadsPrice: 0.2;
        readonly inputPrice: 1;
        readonly outputPrice: 3.2;
    };
    readonly "glm-4.7": {
        readonly maxTokens: 131000;
        readonly contextWindow: 200000;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly cacheReadsPrice: 0.11;
        readonly inputPrice: 0.6;
        readonly outputPrice: 2.2;
    };
    readonly "glm-4.6": {
        readonly maxTokens: 128000;
        readonly contextWindow: 200000;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly cacheReadsPrice: 0.11;
        readonly inputPrice: 0.6;
        readonly outputPrice: 2.2;
    };
    readonly "glm-4.5": {
        readonly maxTokens: 98304;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.29;
        readonly outputPrice: 1.14;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0.057;
        readonly description: "GLM-4.5 is Zhipu's latest featured model. Its comprehensive capabilities in reasoning, coding, and agent reach the state-of-the-art (SOTA) level among open-source models, with a context length of up to 128k.";
        readonly tiers: [{
            readonly contextWindow: 32000;
            readonly inputPrice: 0.21;
            readonly outputPrice: 1;
            readonly cacheReadsPrice: 0.043;
        }, {
            readonly contextWindow: 128000;
            readonly inputPrice: 0.29;
            readonly outputPrice: 1.14;
            readonly cacheReadsPrice: 0.057;
        }, {
            readonly contextWindow: number;
            readonly inputPrice: 0.29;
            readonly outputPrice: 1.14;
            readonly cacheReadsPrice: 0.057;
        }];
    };
    readonly "glm-4.5-air": {
        readonly maxTokens: 98304;
        readonly contextWindow: 128000;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.086;
        readonly outputPrice: 0.57;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0.017;
        readonly description: "GLM-4.5-Air is the lightweight version of GLM-4.5. It balances performance and cost-effectiveness, and can flexibly switch to hybrid thinking models.";
        readonly tiers: [{
            readonly contextWindow: 32000;
            readonly inputPrice: 0.057;
            readonly outputPrice: 0.43;
            readonly cacheReadsPrice: 0.011;
        }, {
            readonly contextWindow: 128000;
            readonly inputPrice: 0.086;
            readonly outputPrice: 0.57;
            readonly cacheReadsPrice: 0.017;
        }, {
            readonly contextWindow: number;
            readonly inputPrice: 0.086;
            readonly outputPrice: 0.57;
            readonly cacheReadsPrice: 0.017;
        }];
    };
};
export type FireworksModelId = keyof typeof fireworksModels;
export declare const fireworksDefaultModelId: FireworksModelId;
export declare const fireworksModels: {
    readonly "accounts/fireworks/models/kimi-k2p5": {
        readonly maxTokens: 16384;
        readonly contextWindow: 262144;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.6;
        readonly outputPrice: 3;
        readonly cacheWritesPrice: 0.6;
        readonly cacheReadsPrice: 0.1;
        readonly description: "Moonshot's flagship open agentic model. Kimi K2.5 unifies vision and text, thinking and non-thinking modes, and single-agent and multi-agent execution.";
    };
    readonly "accounts/fireworks/models/qwen3-vl-30b-a3b-thinking": {
        readonly maxTokens: 32768;
        readonly contextWindow: 262144;
        readonly supportsImages: true;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.15;
        readonly outputPrice: 0.6;
        readonly cacheWritesPrice: 0.15;
        readonly cacheReadsPrice: 0.07;
        readonly description: "Reasoning-enabled Qwen3-VL model with strong multimodal understanding, long context support, and function calling.";
    };
    readonly "accounts/fireworks/models/qwen3-vl-30b-a3b-instruct": {
        readonly maxTokens: 32768;
        readonly contextWindow: 262144;
        readonly supportsImages: true;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.15;
        readonly outputPrice: 0.6;
        readonly description: "Qwen3-VL instruct model with strong multimodal reasoning, long context support, and function calling.";
    };
    readonly "accounts/fireworks/models/deepseek-v3p2": {
        readonly maxTokens: 16384;
        readonly contextWindow: 163840;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.56;
        readonly outputPrice: 1.68;
        readonly cacheWritesPrice: 0.56;
        readonly cacheReadsPrice: 0.28;
        readonly description: "DeepSeek V3.2 model tuned for high computational efficiency and strong reasoning and agent performance.";
    };
    readonly "accounts/fireworks/models/glm-4p7": {
        readonly maxTokens: 16384;
        readonly contextWindow: 202752;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.6;
        readonly outputPrice: 2.2;
        readonly cacheWritesPrice: 0.6;
        readonly cacheReadsPrice: 0.3;
        readonly description: "GLM-4.7 is a next-generation general-purpose model optimized for coding, reasoning, and agentic workflows.";
    };
    readonly "accounts/fireworks/models/glm-5": {
        readonly maxTokens: 16384;
        readonly contextWindow: 202752;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 1;
        readonly outputPrice: 3.2;
        readonly cacheWritesPrice: 1;
        readonly cacheReadsPrice: 0.2;
        readonly description: "GLM-5 is Z.ai's flagship reasoning model for complex systems engineering and long-horizon agentic tasks.";
    };
    readonly "accounts/fireworks/models/minimax-m2p5": {
        readonly maxTokens: 16384;
        readonly contextWindow: 196608;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.3;
        readonly outputPrice: 1.2;
        readonly cacheWritesPrice: 0.3;
        readonly cacheReadsPrice: 0.03;
        readonly description: "MiniMax M2.5 is built for state-of-the-art coding, agentic tool use.";
    };
    readonly "accounts/fireworks/models/minimax-m2p1": {
        readonly maxTokens: 16384;
        readonly contextWindow: 196608;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.3;
        readonly outputPrice: 1.2;
        readonly cacheWritesPrice: 0.3;
        readonly cacheReadsPrice: 0.03;
        readonly description: "MiniMax M2.1 is tuned for strong real-world performance across coding, agent-driven, and workflow-heavy tasks.";
    };
    readonly "accounts/fireworks/models/gpt-oss-120b": {
        readonly maxTokens: 16384;
        readonly contextWindow: 131072;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.15;
        readonly outputPrice: 0.6;
        readonly cacheWritesPrice: 0.15;
        readonly cacheReadsPrice: 0.01;
        readonly description: "OpenAI gpt-oss-120b open-weight model for production and high-reasoning use cases.";
    };
};
export declare const qwenCodeModels: {
    readonly "qwen3-coder-plus": {
        readonly maxTokens: 65536;
        readonly contextWindow: 1000000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
        readonly description: "Qwen3 Coder Plus - High-performance coding model with 1M context window for large codebases";
    };
    readonly "qwen3-coder-flash": {
        readonly maxTokens: 65536;
        readonly contextWindow: 1000000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0;
        readonly outputPrice: 0;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
        readonly description: "Qwen3 Coder Flash - Fast coding model with 1M context window optimized for speed";
    };
};
export type QwenCodeModelId = keyof typeof qwenCodeModels;
export declare const qwenCodeDefaultModelId: QwenCodeModelId;
export type MinimaxModelId = keyof typeof minimaxModels;
export declare const minimaxDefaultModelId: MinimaxModelId;
export declare const minimaxModels: {
    readonly "MiniMax-M2.7": {
        readonly maxTokens: 128000;
        readonly contextWindow: 192000;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly inputPrice: 0.3;
        readonly outputPrice: 1.2;
        readonly cacheWritesPrice: 0.375;
        readonly cacheReadsPrice: 0.06;
        readonly description: "Latest flagship model with enhanced reasoning and coding";
    };
    readonly "MiniMax-M2.7-highspeed": {
        readonly maxTokens: 128000;
        readonly contextWindow: 192000;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly inputPrice: 0.6;
        readonly outputPrice: 2.4;
        readonly cacheWritesPrice: 0.375;
        readonly cacheReadsPrice: 0.06;
        readonly description: "High-speed version of M2.7 for low-latency scenarios";
    };
    readonly "MiniMax-M2.5": {
        readonly maxTokens: 128000;
        readonly contextWindow: 192000;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly inputPrice: 0.3;
        readonly outputPrice: 1.2;
        readonly cacheWritesPrice: 0.375;
        readonly cacheReadsPrice: 0.03;
    };
    readonly "MiniMax-M2.5-highspeed": {
        readonly maxTokens: 128000;
        readonly contextWindow: 192000;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly supportsReasoning: true;
        readonly inputPrice: 0.6;
        readonly outputPrice: 2.4;
        readonly cacheWritesPrice: 0.375;
        readonly cacheReadsPrice: 0.03;
    };
    readonly "MiniMax-M2.1": {
        readonly maxTokens: 128000;
        readonly contextWindow: 192000;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.3;
        readonly outputPrice: 1.2;
        readonly cacheWritesPrice: 0.375;
        readonly cacheReadsPrice: 0.03;
    };
    readonly "MiniMax-M2.1-lightning": {
        readonly maxTokens: 128000;
        readonly contextWindow: 192000;
        readonly supportsImages: false;
        readonly supportsPromptCache: true;
        readonly inputPrice: 0.6;
        readonly outputPrice: 2.4;
        readonly cacheWritesPrice: 0.375;
        readonly cacheReadsPrice: 0.03;
    };
    readonly "MiniMax-M2": {
        readonly maxTokens: 128000;
        readonly contextWindow: 192000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.3;
        readonly outputPrice: 1.2;
        readonly cacheWritesPrice: 0;
        readonly cacheReadsPrice: 0;
    };
};
export type NousResearchModelId = keyof typeof nousResearchModels;
export declare const nousResearchDefaultModelId: NousResearchModelId;
export declare const nousResearchModels: {
    readonly "Hermes-4-405B": {
        readonly maxTokens: 8192;
        readonly contextWindow: 128000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.09;
        readonly outputPrice: 0.37;
        readonly description: "This is the largest model in the Hermes 4 family, and it is the fullest expression of our design, focused on advanced reasoning and creative depth rather than optimizing inference speed or cost.";
    };
    readonly "Hermes-4-70B": {
        readonly maxTokens: 8192;
        readonly contextWindow: 128000;
        readonly supportsImages: false;
        readonly supportsPromptCache: false;
        readonly inputPrice: 0.05;
        readonly outputPrice: 0.2;
        readonly description: "This incarnation of Hermes 4 balances scale and size. It handles complex reasoning tasks, while staying fast and cost effective. A versatile choice for many use cases.";
    };
};
export {};
//# sourceMappingURL=api.d.ts.map