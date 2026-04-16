"use strict";
// Map providers to their specific model ID keys
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderToApiKeyMap = void 0;
exports.getProviderModelIdKey = getProviderModelIdKey;
exports.getProviderDefaultModelId = getProviderDefaultModelId;
const api_1 = require("../api");
const ProviderKeyMap = {
    openrouter: "OpenRouterModelId",
    cline: "ClineModelId",
    openai: "OpenAiModelId",
    ollama: "OllamaModelId",
    lmstudio: "LmStudioModelId",
    litellm: "LiteLlmModelId",
    requesty: "RequestyModelId",
    together: "TogetherModelId",
    fireworks: "FireworksModelId",
    sapaicore: "SapAiCoreModelId",
    groq: "GroqModelId",
    baseten: "BasetenModelId",
    huggingface: "HuggingFaceModelId",
    "huawei-cloud-maas": "HuaweiCloudMaasModelId",
    oca: "OcaModelId",
    aihubmix: "AihubmixModelId",
    hicap: "HicapModelId",
    nousResearch: "NousResearchModelId",
    "vercel-ai-gateway": "VercelAiGatewayModelId",
};
exports.ProviderToApiKeyMap = {
    cline: ["clineApiKey", "clineAccountId"],
    anthropic: "apiKey",
    openrouter: "openRouterApiKey",
    bedrock: ["awsAccessKey", "awsBedrockApiKey"],
    openai: "openAiApiKey",
    gemini: "geminiApiKey",
    "openai-native": "openAiNativeApiKey",
    ollama: "ollamaApiKey",
    requesty: "requestyApiKey",
    together: "togetherApiKey",
    deepseek: "deepSeekApiKey",
    qwen: "qwenApiKey",
    "qwen-code": "qwenApiKey",
    doubao: "doubaoApiKey",
    mistral: "mistralApiKey",
    litellm: "liteLlmApiKey",
    moonshot: "moonshotApiKey",
    nebius: "nebiusApiKey",
    fireworks: "fireworksApiKey",
    asksage: "asksageApiKey",
    xai: "xaiApiKey",
    sambanova: "sambanovaApiKey",
    cerebras: "cerebrasApiKey",
    groq: "groqApiKey",
    huggingface: "huggingFaceApiKey",
    "huawei-cloud-maas": "huaweiCloudMaasApiKey",
    dify: "difyApiKey",
    baseten: "basetenApiKey",
    "vercel-ai-gateway": "vercelAiGatewayApiKey",
    zai: "zaiApiKey",
    oca: "ocaApiKey",
    aihubmix: "aihubmixApiKey",
    minimax: "minimaxApiKey",
    hicap: "hicapApiKey",
    nousResearch: "nousResearchApiKey",
    sapaicore: ["sapAiCoreClientId", "sapAiCoreClientSecret"],
    wandb: "wandbApiKey",
};
const ProviderDefaultModelMap = {
    anthropic: api_1.anthropicDefaultModelId,
    openrouter: api_1.openRouterDefaultModelId,
    cline: api_1.openRouterDefaultModelId,
    openai: api_1.openAiNativeDefaultModelId,
    ollama: "",
    lmstudio: "",
    litellm: api_1.liteLlmDefaultModelId,
    requesty: api_1.requestyDefaultModelId,
    together: api_1.openRouterDefaultModelId,
    fireworks: api_1.fireworksDefaultModelId,
    sapaicore: api_1.sapAiCoreDefaultModelId,
    groq: api_1.groqDefaultModelId,
    baseten: api_1.basetenDefaultModelId,
    huggingface: api_1.huggingFaceDefaultModelId,
    "huawei-cloud-maas": api_1.huaweiCloudMaasDefaultModelId,
    oca: api_1.liteLlmDefaultModelId,
    aihubmix: api_1.openRouterDefaultModelId,
    bedrock: api_1.bedrockDefaultModelId,
    hicap: "",
    nousResearch: api_1.nousResearchDefaultModelId,
    "vercel-ai-gateway": api_1.openRouterDefaultModelId,
    xai: api_1.xaiDefaultModelId,
    gemini: api_1.geminiDefaultModelId,
    minimax: api_1.minimaxDefaultModelId,
    moonshot: api_1.moonshotDefaultModelId,
    qwen: api_1.internationalQwenDefaultModelId,
    deepseek: api_1.deepSeekDefaultModelId,
    wandb: api_1.wandbDefaultModelId,
};
/**
 * Get the provider-specific model ID key for a given provider and mode.
 * Different providers store their model IDs in different state keys.
 */
function getProviderModelIdKey(provider, mode) {
    const keySuffix = ProviderKeyMap[provider];
    if (keySuffix) {
        // E.g. actModeOpenAiModelId, planModeOpenAiModelId, etc.
        return `${mode}Mode${keySuffix}`;
    }
    // For providers without a specific key (anthropic, gemini, bedrock, etc.),
    // they use the generic actModeApiModelId/planModeApiModelId
    return `${mode}ModeApiModelId`;
}
function getProviderDefaultModelId(provider) {
    return ProviderDefaultModelMap[provider] || "";
}
//# sourceMappingURL=provider-keys.js.map