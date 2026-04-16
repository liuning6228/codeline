"use strict";
// Temporary implementation for Cline model types
Object.defineProperty(exports, "__esModule", { value: true });
exports.SapAiCoreModelDeployment = exports.SapAiCoreModelsRequest = exports.OpenAiModelsRequest = exports.UpdateApiConfigurationRequestNew = exports.ClineRecommendedModelsResponse = exports.ClineRecommendedModel = exports.UpdateApiConfigurationRequest = exports.ModelsApiConfiguration = exports.ApiProvider = exports.Metadata = exports.ApiFormat = exports.LiteLLMModelInfo = exports.OpenRouterModelInfo = exports.OpenAiCompatibleModelInfo = exports.OcaModelInfo = exports.ThinkingConfig = exports.ModelInfo = void 0;
exports.ModelInfo = {
    create: (data) => data
};
exports.ThinkingConfig = {
    create: (data) => data
};
exports.OcaModelInfo = {
    create: (data) => data
};
exports.OpenAiCompatibleModelInfo = {
    create: (data) => data
};
exports.OpenRouterModelInfo = {
    create: (data) => data
};
exports.LiteLLMModelInfo = {
    create: (data) => data
};
var ApiFormat;
(function (ApiFormat) {
    ApiFormat[ApiFormat["ANTHROPIC_CHAT"] = 0] = "ANTHROPIC_CHAT";
    ApiFormat[ApiFormat["GEMINI_CHAT"] = 1] = "GEMINI_CHAT";
    ApiFormat[ApiFormat["OPENAI_CHAT"] = 2] = "OPENAI_CHAT";
    ApiFormat[ApiFormat["R1_CHAT"] = 3] = "R1_CHAT";
    ApiFormat[ApiFormat["OPENAI_RESPONSES"] = 4] = "OPENAI_RESPONSES";
    ApiFormat[ApiFormat["OPENAI_RESPONSES_WEBSOCKET_MODE"] = 5] = "OPENAI_RESPONSES_WEBSOCKET_MODE";
    ApiFormat[ApiFormat["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(ApiFormat || (exports.ApiFormat = ApiFormat = {}));
exports.Metadata = {
    create: (data) => data
};
var ApiProvider;
(function (ApiProvider) {
    ApiProvider[ApiProvider["ANTHROPIC"] = 0] = "ANTHROPIC";
    ApiProvider[ApiProvider["OPENROUTER"] = 1] = "OPENROUTER";
    ApiProvider[ApiProvider["BEDROCK"] = 2] = "BEDROCK";
    ApiProvider[ApiProvider["VERTEX"] = 3] = "VERTEX";
    ApiProvider[ApiProvider["OPENAI"] = 4] = "OPENAI";
    ApiProvider[ApiProvider["OLLAMA"] = 5] = "OLLAMA";
    ApiProvider[ApiProvider["LMSTUDIO"] = 6] = "LMSTUDIO";
    ApiProvider[ApiProvider["GEMINI"] = 7] = "GEMINI";
    ApiProvider[ApiProvider["OPENAI_NATIVE"] = 8] = "OPENAI_NATIVE";
    ApiProvider[ApiProvider["REQUESTY"] = 9] = "REQUESTY";
    ApiProvider[ApiProvider["TOGETHER"] = 10] = "TOGETHER";
    ApiProvider[ApiProvider["DEEPSEEK"] = 11] = "DEEPSEEK";
    ApiProvider[ApiProvider["QWEN"] = 12] = "QWEN";
    ApiProvider[ApiProvider["DOUBAO"] = 13] = "DOUBAO";
    ApiProvider[ApiProvider["MISTRAL"] = 14] = "MISTRAL";
    ApiProvider[ApiProvider["VSCODE_LM"] = 15] = "VSCODE_LM";
    ApiProvider[ApiProvider["CLINE"] = 16] = "CLINE";
    ApiProvider[ApiProvider["LITELLM"] = 17] = "LITELLM";
    ApiProvider[ApiProvider["NEBIUS"] = 18] = "NEBIUS";
    ApiProvider[ApiProvider["FIREWORKS"] = 19] = "FIREWORKS";
    ApiProvider[ApiProvider["ASKSAGE"] = 20] = "ASKSAGE";
    ApiProvider[ApiProvider["XAI"] = 21] = "XAI";
    ApiProvider[ApiProvider["SAMBANOVA"] = 22] = "SAMBANOVA";
    ApiProvider[ApiProvider["CEREBRAS"] = 23] = "CEREBRAS";
    ApiProvider[ApiProvider["GROQ"] = 24] = "GROQ";
    ApiProvider[ApiProvider["SAPAICORE"] = 25] = "SAPAICORE";
    ApiProvider[ApiProvider["CLAUDE_CODE"] = 26] = "CLAUDE_CODE";
    ApiProvider[ApiProvider["MOONSHOT"] = 27] = "MOONSHOT";
    ApiProvider[ApiProvider["HUGGINGFACE"] = 28] = "HUGGINGFACE";
    ApiProvider[ApiProvider["HUAWEI_CLOUD_MAAS"] = 29] = "HUAWEI_CLOUD_MAAS";
    ApiProvider[ApiProvider["BASETEN"] = 30] = "BASETEN";
    ApiProvider[ApiProvider["ZAI"] = 31] = "ZAI";
    ApiProvider[ApiProvider["VERCEL_AI_GATEWAY"] = 32] = "VERCEL_AI_GATEWAY";
    ApiProvider[ApiProvider["QWEN_CODE"] = 33] = "QWEN_CODE";
    ApiProvider[ApiProvider["DIFY"] = 34] = "DIFY";
    ApiProvider[ApiProvider["OCA"] = 35] = "OCA";
    ApiProvider[ApiProvider["MINIMAX"] = 36] = "MINIMAX";
    ApiProvider[ApiProvider["HICAP"] = 37] = "HICAP";
    ApiProvider[ApiProvider["AIHUBMIX"] = 38] = "AIHUBMIX";
    ApiProvider[ApiProvider["NOUSRESEARCH"] = 39] = "NOUSRESEARCH";
    ApiProvider[ApiProvider["OPENAI_CODEX"] = 40] = "OPENAI_CODEX";
    ApiProvider[ApiProvider["WANDB"] = 41] = "WANDB";
    ApiProvider[ApiProvider["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(ApiProvider || (exports.ApiProvider = ApiProvider = {}));
exports.ModelsApiConfiguration = {
    create: (data) => data
};
exports.UpdateApiConfigurationRequest = {
    create: (data) => data
};
exports.ClineRecommendedModel = {
    create: (data) => data
};
exports.ClineRecommendedModelsResponse = {
    create: (data) => data
};
exports.UpdateApiConfigurationRequestNew = {
    create: (data) => data
};
exports.OpenAiModelsRequest = {
    create: (data) => data
};
exports.SapAiCoreModelsRequest = {
    create: (data) => data
};
exports.SapAiCoreModelDeployment = {
    create: (data) => data
};
//# sourceMappingURL=models.js.map