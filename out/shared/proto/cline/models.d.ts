export interface ModelInfo {
    id: string;
    name: string;
    [key: string]: any;
}
export declare const ModelInfo: {
    create: (data: any) => ModelInfo;
};
export interface ThinkingConfig {
    [key: string]: any;
}
export declare const ThinkingConfig: {
    create: (data: any) => ThinkingConfig;
};
export interface OcaModelInfo {
    [key: string]: any;
}
export declare const OcaModelInfo: {
    create: (data: any) => OcaModelInfo;
};
export interface OpenAiCompatibleModelInfo {
    [key: string]: any;
}
export declare const OpenAiCompatibleModelInfo: {
    create: (data: any) => OpenAiCompatibleModelInfo;
};
export interface OpenRouterModelInfo {
    [key: string]: any;
}
export declare const OpenRouterModelInfo: {
    create: (data: any) => OpenRouterModelInfo;
};
export interface LiteLLMModelInfo {
    [key: string]: any;
}
export declare const LiteLLMModelInfo: {
    create: (data: any) => LiteLLMModelInfo;
};
export declare enum ApiFormat {
    ANTHROPIC_CHAT = 0,
    GEMINI_CHAT = 1,
    OPENAI_CHAT = 2,
    R1_CHAT = 3,
    OPENAI_RESPONSES = 4,
    OPENAI_RESPONSES_WEBSOCKET_MODE = 5,
    UNRECOGNIZED = -1
}
export interface Metadata {
    [key: string]: any;
}
export declare const Metadata: {
    create: (data: any) => Metadata;
};
export declare enum ApiProvider {
    ANTHROPIC = 0,
    OPENROUTER = 1,
    BEDROCK = 2,
    VERTEX = 3,
    OPENAI = 4,
    OLLAMA = 5,
    LMSTUDIO = 6,
    GEMINI = 7,
    OPENAI_NATIVE = 8,
    REQUESTY = 9,
    TOGETHER = 10,
    DEEPSEEK = 11,
    QWEN = 12,
    DOUBAO = 13,
    MISTRAL = 14,
    VSCODE_LM = 15,
    CLINE = 16,
    LITELLM = 17,
    NEBIUS = 18,
    FIREWORKS = 19,
    ASKSAGE = 20,
    XAI = 21,
    SAMBANOVA = 22,
    CEREBRAS = 23,
    GROQ = 24,
    SAPAICORE = 25,
    CLAUDE_CODE = 26,
    MOONSHOT = 27,
    HUGGINGFACE = 28,
    HUAWEI_CLOUD_MAAS = 29,
    BASETEN = 30,
    ZAI = 31,
    VERCEL_AI_GATEWAY = 32,
    QWEN_CODE = 33,
    DIFY = 34,
    OCA = 35,
    MINIMAX = 36,
    HICAP = 37,
    AIHUBMIX = 38,
    NOUSRESEARCH = 39,
    OPENAI_CODEX = 40,
    WANDB = 41,
    UNRECOGNIZED = -1
}
export interface ModelsApiConfiguration {
    [key: string]: any;
}
export declare const ModelsApiConfiguration: {
    create: (data: any) => ModelsApiConfiguration;
};
export interface UpdateApiConfigurationRequest {
    [key: string]: any;
}
export declare const UpdateApiConfigurationRequest: {
    create: (data: any) => UpdateApiConfigurationRequest;
};
export interface ClineRecommendedModel {
    [key: string]: any;
}
export declare const ClineRecommendedModel: {
    create: (data: any) => ClineRecommendedModel;
};
export interface ClineRecommendedModelsResponse {
    [key: string]: any;
}
export declare const ClineRecommendedModelsResponse: {
    create: (data: any) => ClineRecommendedModelsResponse;
};
export interface UpdateApiConfigurationRequestNew {
    [key: string]: any;
}
export declare const UpdateApiConfigurationRequestNew: {
    create: (data: any) => UpdateApiConfigurationRequestNew;
};
export interface OpenAiModelsRequest {
    [key: string]: any;
}
export declare const OpenAiModelsRequest: {
    create: (data: any) => OpenAiModelsRequest;
};
export interface SapAiCoreModelsRequest {
    [key: string]: any;
}
export declare const SapAiCoreModelsRequest: {
    create: (data: any) => SapAiCoreModelsRequest;
};
export interface SapAiCoreModelDeployment {
    [key: string]: any;
}
export declare const SapAiCoreModelDeployment: {
    create: (data: any) => SapAiCoreModelDeployment;
};
//# sourceMappingURL=models.d.ts.map