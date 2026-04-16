"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertProtoToApiProvider = convertProtoToApiProvider;
exports.convertApiConfigurationToProto = convertApiConfigurationToProto;
exports.convertProtoToApiConfiguration = convertProtoToApiConfiguration;
const models_1 = require("@shared/proto/cline/models");
// Convert application ThinkingConfig to proto ThinkingConfig
function convertThinkingConfigToProto(config) {
    if (!config) {
        return undefined;
    }
    return {
        maxBudget: config.maxBudget,
        outputPrice: config.outputPrice,
        outputPriceTiers: config.outputPriceTiers || [], // Provide empty array if undefined
    };
}
// Convert proto ThinkingConfig to application ThinkingConfig
function convertProtoToThinkingConfig(config) {
    if (!config) {
        return undefined;
    }
    return {
        maxBudget: config.maxBudget,
        outputPrice: config.outputPrice,
        outputPriceTiers: config.outputPriceTiers && config.outputPriceTiers.length > 0 ? config.outputPriceTiers : undefined,
    };
}
// Convert application ModelInfo to proto OpenRouterModelInfo
function convertModelInfoToProtoOpenRouter(info) {
    if (!info) {
        return undefined;
    }
    return {
        maxTokens: info.maxTokens,
        contextWindow: info.contextWindow,
        supportsImages: info.supportsImages,
        supportsPromptCache: info.supportsPromptCache ?? false,
        inputPrice: info.inputPrice,
        outputPrice: info.outputPrice,
        cacheWritesPrice: info.cacheWritesPrice,
        cacheReadsPrice: info.cacheReadsPrice,
        description: info.description,
        thinkingConfig: convertThinkingConfigToProto(info.thinkingConfig),
        supportsGlobalEndpoint: info.supportsGlobalEndpoint,
        tiers: info.tiers || [],
    };
}
// Convert proto OpenRouterModelInfo to application ModelInfo
function convertProtoToModelInfo(info) {
    if (!info) {
        return undefined;
    }
    return {
        maxTokens: info.maxTokens,
        contextWindow: info.contextWindow,
        supportsImages: info.supportsImages ?? false,
        supportsPromptCache: info.supportsPromptCache ?? false,
        inputPrice: info.inputPrice,
        outputPrice: info.outputPrice,
        cacheWritesPrice: info.cacheWritesPrice,
        cacheReadsPrice: info.cacheReadsPrice,
        description: info.description,
        thinkingConfig: convertProtoToThinkingConfig(info.thinkingConfig),
        supportsGlobalEndpoint: info.supportsGlobalEndpoint ?? false,
        tiers: info.tiers && info.tiers.length > 0 ? info.tiers : undefined,
    };
}
// Convert application ModelInfo to proto OcaModelInfo
function convertOcaModelInfoToProtoOcaModelInfo(info) {
    if (!info) {
        return undefined;
    }
    return {
        maxTokens: info.maxTokens,
        contextWindow: info.contextWindow,
        supportsImages: info.supportsImages ?? false,
        supportsPromptCache: info.supportsPromptCache ?? false,
        inputPrice: info.inputPrice,
        outputPrice: info.outputPrice,
        cacheWritesPrice: info.cacheWritesPrice,
        cacheReadsPrice: info.cacheReadsPrice,
        description: info.description,
        thinkingConfig: convertThinkingConfigToProto(info.thinkingConfig),
        surveyContent: info.surveyContent,
        surveyId: info.surveyId,
        banner: info.banner,
        modelName: info.modelName || "",
        apiFormat: info.apiFormat, // ApiFormat is string alias
        supportsReasoning: info.supportsReasoning ?? false,
        reasoningEffortOptions: info.reasoningEffortOptions || [],
    };
}
// Convert proto OpenRouterModelInfo to application ModelInfo
function convertProtoOcaModelInfoToOcaModelInfo(info) {
    if (!info) {
        return undefined;
    }
    return {
        maxTokens: info.maxTokens,
        contextWindow: info.contextWindow,
        supportsImages: info.supportsImages ?? false,
        supportsPromptCache: info.supportsPromptCache ?? false,
        inputPrice: info.inputPrice,
        outputPrice: info.outputPrice,
        cacheWritesPrice: info.cacheWritesPrice,
        cacheReadsPrice: info.cacheReadsPrice,
        description: info.description,
        surveyContent: info.surveyContent,
        surveyId: info.surveyId,
        banner: info.banner,
        modelName: info.modelName || "",
        apiFormat: info.apiFormat, // ApiFormat is string alias
        supportsReasoning: info.supportsReasoning ?? false,
        reasoningEffortOptions: info.reasoningEffortOptions || [],
    };
}
// Convert application LiteLLMModelInfo to proto LiteLLMModelInfo
function convertLiteLLMModelInfoToProto(info) {
    if (!info) {
        return undefined;
    }
    return {
        maxTokens: info.maxTokens,
        contextWindow: info.contextWindow,
        supportsImages: info.supportsImages ?? false,
        supportsPromptCache: info.supportsPromptCache ?? false,
        inputPrice: info.inputPrice,
        outputPrice: info.outputPrice,
        thinkingConfig: convertThinkingConfigToProto(info.thinkingConfig),
        supportsGlobalEndpoint: info.supportsGlobalEndpoint ?? false,
        cacheWritesPrice: info.cacheWritesPrice,
        cacheReadsPrice: info.cacheReadsPrice,
        description: info.description,
        tiers: info.tiers || [],
        temperature: info.temperature,
        supportsReasoning: info.supportsReasoning ?? false,
    };
}
// Convert proto LiteLLMModelInfo to application LiteLLMModelInfo
function convertProtoToLiteLLMModelInfo(info) {
    if (!info) {
        return undefined;
    }
    return {
        maxTokens: info.maxTokens,
        contextWindow: info.contextWindow,
        supportsImages: info.supportsImages ?? false,
        supportsPromptCache: info.supportsPromptCache ?? false,
        inputPrice: info.inputPrice,
        outputPrice: info.outputPrice,
        thinkingConfig: convertProtoToThinkingConfig(info.thinkingConfig),
        supportsGlobalEndpoint: info.supportsGlobalEndpoint ?? false,
        cacheWritesPrice: info.cacheWritesPrice,
        cacheReadsPrice: info.cacheReadsPrice,
        description: info.description,
        tiers: info.tiers && info.tiers.length > 0 ? info.tiers : undefined,
        temperature: info.temperature,
        supportsReasoning: info.supportsReasoning ?? false,
    };
}
// Convert application OpenAiCompatibleModelInfo to proto OpenAiCompatibleModelInfo
function convertOpenAiCompatibleModelInfoToProto(info) {
    if (!info) {
        return undefined;
    }
    return {
        maxTokens: info.maxTokens,
        contextWindow: info.contextWindow,
        supportsImages: info.supportsImages,
        supportsPromptCache: info.supportsPromptCache ?? false,
        inputPrice: info.inputPrice,
        outputPrice: info.outputPrice,
        thinkingConfig: convertThinkingConfigToProto(info.thinkingConfig),
        supportsGlobalEndpoint: info.supportsGlobalEndpoint,
        cacheWritesPrice: info.cacheWritesPrice,
        cacheReadsPrice: info.cacheReadsPrice,
        description: info.description,
        tiers: info.tiers || [],
        temperature: info.temperature,
        isR1FormatRequired: info.isR1FormatRequired,
    };
}
// Convert proto OpenAiCompatibleModelInfo to application OpenAiCompatibleModelInfo
function convertProtoToOpenAiCompatibleModelInfo(info) {
    if (!info) {
        return undefined;
    }
    return {
        maxTokens: info.maxTokens,
        contextWindow: info.contextWindow,
        supportsImages: info.supportsImages ?? false,
        supportsPromptCache: info.supportsPromptCache ?? false,
        inputPrice: info.inputPrice,
        outputPrice: info.outputPrice,
        thinkingConfig: convertProtoToThinkingConfig(info.thinkingConfig),
        supportsGlobalEndpoint: info.supportsGlobalEndpoint ?? false,
        cacheWritesPrice: info.cacheWritesPrice,
        cacheReadsPrice: info.cacheReadsPrice,
        description: info.description,
        tiers: info.tiers && info.tiers.length > 0 ? info.tiers : undefined,
        temperature: info.temperature,
        isR1FormatRequired: info.isR1FormatRequired ?? false,
    };
}
// Convert application ApiProvider to proto ApiProvider
function convertApiProviderToProto(provider) {
    switch (provider) {
        case "anthropic":
            return models_1.ApiProvider.ANTHROPIC;
        case "openrouter":
            return models_1.ApiProvider.OPENROUTER;
        case "bedrock":
            return models_1.ApiProvider.BEDROCK;
        case "vertex":
            return models_1.ApiProvider.VERTEX;
        case "openai":
            return models_1.ApiProvider.OPENAI;
        case "ollama":
            return models_1.ApiProvider.OLLAMA;
        case "lmstudio":
            return models_1.ApiProvider.LMSTUDIO;
        case "gemini":
            return models_1.ApiProvider.GEMINI;
        case "openai-native":
            return models_1.ApiProvider.OPENAI_NATIVE;
        case "requesty":
            return models_1.ApiProvider.REQUESTY;
        case "together":
            return models_1.ApiProvider.TOGETHER;
        case "deepseek":
            return models_1.ApiProvider.DEEPSEEK;
        case "qwen":
            return models_1.ApiProvider.QWEN;
        case "qwen-code":
            return models_1.ApiProvider.QWEN_CODE;
        case "doubao":
            return models_1.ApiProvider.DOUBAO;
        case "mistral":
            return models_1.ApiProvider.MISTRAL;
        case "vscode-lm":
            return models_1.ApiProvider.VSCODE_LM;
        case "cline":
            return models_1.ApiProvider.CLINE;
        case "litellm":
            return models_1.ApiProvider.LITELLM;
        case "moonshot":
            return models_1.ApiProvider.MOONSHOT;
        case "huggingface":
            return models_1.ApiProvider.HUGGINGFACE;
        case "nebius":
            return models_1.ApiProvider.NEBIUS;
        case "wandb":
            return models_1.ApiProvider.WANDB;
        case "fireworks":
            return models_1.ApiProvider.FIREWORKS;
        case "asksage":
            return models_1.ApiProvider.ASKSAGE;
        case "xai":
            return models_1.ApiProvider.XAI;
        case "sambanova":
            return models_1.ApiProvider.SAMBANOVA;
        case "cerebras":
            return models_1.ApiProvider.CEREBRAS;
        case "groq":
            return models_1.ApiProvider.GROQ;
        case "baseten":
            return models_1.ApiProvider.BASETEN;
        case "sapaicore":
            return models_1.ApiProvider.SAPAICORE;
        case "claude-code":
            return models_1.ApiProvider.CLAUDE_CODE;
        case "huawei-cloud-maas":
            return models_1.ApiProvider.HUAWEI_CLOUD_MAAS;
        case "vercel-ai-gateway":
            return models_1.ApiProvider.VERCEL_AI_GATEWAY;
        case "zai":
            return models_1.ApiProvider.ZAI;
        case "dify":
            return models_1.ApiProvider.DIFY;
        case "oca":
            return models_1.ApiProvider.OCA;
        case "aihubmix":
            return models_1.ApiProvider.AIHUBMIX;
        case "minimax":
            return models_1.ApiProvider.MINIMAX;
        case "hicap":
            return models_1.ApiProvider.HICAP;
        case "nousResearch":
            return models_1.ApiProvider.NOUSRESEARCH;
        case "openai-codex":
            return models_1.ApiProvider.OPENAI_CODEX;
        default:
            return models_1.ApiProvider.ANTHROPIC;
    }
}
// Convert proto ApiProvider to application ApiProvider
function convertProtoToApiProvider(provider) {
    switch (provider) {
        case models_1.ApiProvider.ANTHROPIC:
            return "anthropic";
        case models_1.ApiProvider.OPENROUTER:
            return "openrouter";
        case models_1.ApiProvider.BEDROCK:
            return "bedrock";
        case models_1.ApiProvider.VERTEX:
            return "vertex";
        case models_1.ApiProvider.OPENAI:
            return "openai";
        case models_1.ApiProvider.OLLAMA:
            return "ollama";
        case models_1.ApiProvider.LMSTUDIO:
            return "lmstudio";
        case models_1.ApiProvider.GEMINI:
            return "gemini";
        case models_1.ApiProvider.OPENAI_NATIVE:
            return "openai-native";
        case models_1.ApiProvider.REQUESTY:
            return "requesty";
        case models_1.ApiProvider.TOGETHER:
            return "together";
        case models_1.ApiProvider.DEEPSEEK:
            return "deepseek";
        case models_1.ApiProvider.QWEN:
            return "qwen";
        case models_1.ApiProvider.QWEN_CODE:
            return "qwen-code";
        case models_1.ApiProvider.DOUBAO:
            return "doubao";
        case models_1.ApiProvider.MISTRAL:
            return "mistral";
        case models_1.ApiProvider.VSCODE_LM:
            return "vscode-lm";
        case models_1.ApiProvider.CLINE:
            return "cline";
        case models_1.ApiProvider.LITELLM:
            return "litellm";
        case models_1.ApiProvider.MOONSHOT:
            return "moonshot";
        case models_1.ApiProvider.HUGGINGFACE:
            return "huggingface";
        case models_1.ApiProvider.NEBIUS:
            return "nebius";
        case models_1.ApiProvider.WANDB:
            return "wandb";
        case models_1.ApiProvider.FIREWORKS:
            return "fireworks";
        case models_1.ApiProvider.ASKSAGE:
            return "asksage";
        case models_1.ApiProvider.XAI:
            return "xai";
        case models_1.ApiProvider.SAMBANOVA:
            return "sambanova";
        case models_1.ApiProvider.CEREBRAS:
            return "cerebras";
        case models_1.ApiProvider.GROQ:
            return "groq";
        case models_1.ApiProvider.BASETEN:
            return "baseten";
        case models_1.ApiProvider.SAPAICORE:
            return "sapaicore";
        case models_1.ApiProvider.CLAUDE_CODE:
            return "claude-code";
        case models_1.ApiProvider.HUAWEI_CLOUD_MAAS:
            return "huawei-cloud-maas";
        case models_1.ApiProvider.VERCEL_AI_GATEWAY:
            return "vercel-ai-gateway";
        case models_1.ApiProvider.ZAI:
            return "zai";
        case models_1.ApiProvider.HICAP:
            return "hicap";
        case models_1.ApiProvider.DIFY:
            return "dify";
        case models_1.ApiProvider.OCA:
            return "oca";
        case models_1.ApiProvider.AIHUBMIX:
            return "aihubmix";
        case models_1.ApiProvider.MINIMAX:
            return "minimax";
        case models_1.ApiProvider.NOUSRESEARCH:
            return "nousResearch";
        case models_1.ApiProvider.OPENAI_CODEX:
            return "openai-codex";
        default:
            return "anthropic";
    }
}
// Converts application ApiConfiguration to proto ApiConfiguration
function convertApiConfigurationToProto(config) {
    return {
        // Global configuration fields
        apiKey: config.apiKey,
        clineAccountId: config.clineAccountId,
        ulid: config.ulid,
        liteLlmBaseUrl: config.liteLlmBaseUrl,
        liteLlmApiKey: config.liteLlmApiKey,
        liteLlmUsePromptCache: config.liteLlmUsePromptCache,
        openAiHeaders: config.openAiHeaders || {},
        anthropicBaseUrl: config.anthropicBaseUrl,
        openrouterApiKey: config.openRouterApiKey,
        openRouterProviderSorting: config.openRouterProviderSorting,
        awsAccessKey: config.awsAccessKey,
        awsSecretKey: config.awsSecretKey,
        awsSessionToken: config.awsSessionToken,
        awsRegion: config.awsRegion,
        awsUseCrossRegionInference: config.awsUseCrossRegionInference,
        awsUseGlobalInference: config.awsUseGlobalInference,
        awsBedrockUsePromptCache: config.awsBedrockUsePromptCache,
        awsUseProfile: config.awsUseProfile,
        awsAuthentication: config.awsAuthentication,
        awsProfile: config.awsProfile,
        awsBedrockApiKey: config.awsBedrockApiKey,
        awsBedrockEndpoint: config.awsBedrockEndpoint,
        claudeCodePath: config.claudeCodePath,
        vertexProjectId: config.vertexProjectId,
        vertexRegion: config.vertexRegion,
        openAiBaseUrl: config.openAiBaseUrl,
        openAiApiKey: config.openAiApiKey,
        ollamaBaseUrl: config.ollamaBaseUrl,
        ollamaApiKey: config.ollamaApiKey,
        ollamaApiOptionsCtxNum: config.ollamaApiOptionsCtxNum,
        lmStudioBaseUrl: config.lmStudioBaseUrl,
        lmStudioMaxTokens: config.lmStudioMaxTokens,
        geminiApiKey: config.geminiApiKey,
        geminiBaseUrl: config.geminiBaseUrl,
        openAiNativeApiKey: config.openAiNativeApiKey,
        deepSeekApiKey: config.deepSeekApiKey,
        requestyApiKey: config.requestyApiKey,
        requestyBaseUrl: config.requestyBaseUrl,
        togetherApiKey: config.togetherApiKey,
        fireworksApiKey: config.fireworksApiKey,
        fireworksModelMaxCompletionTokens: config.fireworksModelMaxCompletionTokens,
        fireworksModelMaxTokens: config.fireworksModelMaxTokens,
        qwenApiKey: config.qwenApiKey,
        qwenCodeOauthPath: config.qwenCodeOauthPath,
        doubaoApiKey: config.doubaoApiKey,
        mistralApiKey: config.mistralApiKey,
        azureApiVersion: config.azureApiVersion,
        azureIdentity: config.azureIdentity,
        qwenApiLine: config.qwenApiLine,
        moonshotApiLine: config.moonshotApiLine,
        moonshotApiKey: config.moonshotApiKey,
        huggingFaceApiKey: config.huggingFaceApiKey,
        nebiusApiKey: config.nebiusApiKey,
        wandbApiKey: config.wandbApiKey,
        asksageApiUrl: config.asksageApiUrl,
        asksageApiKey: config.asksageApiKey,
        xaiApiKey: config.xaiApiKey,
        sambanovaApiKey: config.sambanovaApiKey,
        cerebrasApiKey: config.cerebrasApiKey,
        vercelAiGatewayApiKey: config.vercelAiGatewayApiKey,
        groqApiKey: config.groqApiKey,
        basetenApiKey: config.basetenApiKey,
        requestTimeoutMs: config.requestTimeoutMs,
        sapAiCoreClientId: config.sapAiCoreClientId,
        sapAiCoreClientSecret: config.sapAiCoreClientSecret,
        sapAiResourceGroup: config.sapAiResourceGroup,
        sapAiCoreTokenUrl: config.sapAiCoreTokenUrl,
        sapAiCoreBaseUrl: config.sapAiCoreBaseUrl,
        sapAiCoreUseOrchestrationMode: config.sapAiCoreUseOrchestrationMode,
        huaweiCloudMaasApiKey: config.huaweiCloudMaasApiKey,
        zaiApiLine: config.zaiApiLine,
        zaiApiKey: config.zaiApiKey,
        difyApiKey: config.difyApiKey,
        difyBaseUrl: config.difyBaseUrl,
        ocaBaseUrl: config.ocaBaseUrl,
        minimaxApiKey: config.minimaxApiKey,
        minimaxApiLine: config.minimaxApiLine,
        nousResearchApiKey: config.nousResearchApiKey,
        clineApiKey: config.clineApiKey,
        ocaMode: config.ocaMode,
        aihubmixApiKey: config.aihubmixApiKey,
        aihubmixBaseUrl: config.aihubmixBaseUrl,
        aihubmixAppCode: config.aihubmixAppCode,
        hicapApiKey: config.hicapApiKey,
        hicapModelId: config.hicapModelId,
        // Plan mode configurations
        planModeApiProvider: config.planModeApiProvider,
        planModeApiModelId: config.planModeApiModelId,
        planModeThinkingBudgetTokens: config.planModeThinkingBudgetTokens,
        geminiPlanModeThinkingLevel: config.geminiPlanModeThinkingLevel,
        planModeReasoningEffort: config.planModeReasoningEffort,
        planModeVsCodeLmModelSelector: config.planModeVsCodeLmModelSelector,
        planModeAwsBedrockCustomSelected: config.planModeAwsBedrockCustomSelected,
        planModeAwsBedrockCustomModelBaseId: config.planModeAwsBedrockCustomModelBaseId,
        planModeOpenRouterModelId: config.planModeOpenRouterModelId,
        planModeOpenRouterModelInfo: convertModelInfoToProtoOpenRouter(config.planModeOpenRouterModelInfo),
        planModeClineModelId: config.planModeClineModelId,
        planModeClineModelInfo: convertModelInfoToProtoOpenRouter(config.planModeClineModelInfo),
        planModeOpenAiModelId: config.planModeOpenAiModelId,
        planModeOpenAiModelInfo: convertOpenAiCompatibleModelInfoToProto(config.planModeOpenAiModelInfo),
        planModeOllamaModelId: config.planModeOllamaModelId,
        planModeLmStudioModelId: config.planModeLmStudioModelId,
        planModeLiteLlmModelId: config.planModeLiteLlmModelId,
        planModeLiteLlmModelInfo: convertLiteLLMModelInfoToProto(config.planModeLiteLlmModelInfo),
        planModeRequestyModelId: config.planModeRequestyModelId,
        planModeRequestyModelInfo: convertModelInfoToProtoOpenRouter(config.planModeRequestyModelInfo),
        planModeTogetherModelId: config.planModeTogetherModelId,
        planModeFireworksModelId: config.planModeFireworksModelId,
        planModeGroqModelId: config.planModeGroqModelId,
        planModeGroqModelInfo: convertModelInfoToProtoOpenRouter(config.planModeGroqModelInfo),
        planModeBasetenModelId: config.planModeBasetenModelId,
        planModeBasetenModelInfo: convertModelInfoToProtoOpenRouter(config.planModeBasetenModelInfo),
        planModeHuggingFaceModelId: config.planModeHuggingFaceModelId,
        planModeHuggingFaceModelInfo: convertModelInfoToProtoOpenRouter(config.planModeHuggingFaceModelInfo),
        planModeSapAiCoreModelId: config.planModeSapAiCoreModelId,
        planModeHuaweiCloudMaasModelId: config.planModeHuaweiCloudMaasModelId,
        planModeHuaweiCloudMaasModelInfo: convertModelInfoToProtoOpenRouter(config.planModeHuaweiCloudMaasModelInfo),
        planModeSapAiCoreDeploymentId: config.planModeSapAiCoreDeploymentId,
        planModeOcaModelId: config.planModeOcaModelId,
        planModeOcaModelInfo: convertOcaModelInfoToProtoOcaModelInfo(config.planModeOcaModelInfo),
        planModeOcaReasoningEffort: config.planModeOcaReasoningEffort,
        planModeAihubmixModelId: config.planModeAihubmixModelId,
        planModeAihubmixModelInfo: convertOpenAiCompatibleModelInfoToProto(config.planModeAihubmixModelInfo),
        planModeHicapModelId: config.planModeHicapModelId,
        planModeHicapModelInfo: convertModelInfoToProtoOpenRouter(config.planModeHicapModelInfo),
        planModeNousResearchModelId: config.planModeNousResearchModelId,
        planModeVercelAiGatewayModelId: config.planModeVercelAiGatewayModelId,
        planModeVercelAiGatewayModelInfo: convertModelInfoToProtoOpenRouter(config.planModeVercelAiGatewayModelInfo),
        // Act mode configurations
        actModeApiProvider: config.actModeApiProvider ? convertApiProviderToProto(config.actModeApiProvider) : undefined,
        actModeApiModelId: config.actModeApiModelId,
        actModeThinkingBudgetTokens: config.actModeThinkingBudgetTokens,
        geminiActModeThinkingLevel: config.geminiActModeThinkingLevel,
        actModeReasoningEffort: config.actModeReasoningEffort,
        actModeVsCodeLmModelSelector: config.actModeVsCodeLmModelSelector,
        actModeAwsBedrockCustomSelected: config.actModeAwsBedrockCustomSelected,
        actModeAwsBedrockCustomModelBaseId: config.actModeAwsBedrockCustomModelBaseId,
        actModeOpenRouterModelId: config.actModeOpenRouterModelId,
        actModeOpenRouterModelInfo: convertModelInfoToProtoOpenRouter(config.actModeOpenRouterModelInfo),
        actModeClineModelId: config.actModeClineModelId,
        actModeClineModelInfo: convertModelInfoToProtoOpenRouter(config.actModeClineModelInfo),
        actModeOpenAiModelId: config.actModeOpenAiModelId,
        actModeOpenAiModelInfo: convertOpenAiCompatibleModelInfoToProto(config.actModeOpenAiModelInfo),
        actModeOllamaModelId: config.actModeOllamaModelId,
        actModeLmStudioModelId: config.actModeLmStudioModelId,
        actModeLiteLlmModelId: config.actModeLiteLlmModelId,
        actModeLiteLlmModelInfo: convertLiteLLMModelInfoToProto(config.actModeLiteLlmModelInfo),
        actModeRequestyModelId: config.actModeRequestyModelId,
        actModeRequestyModelInfo: convertModelInfoToProtoOpenRouter(config.actModeRequestyModelInfo),
        actModeTogetherModelId: config.actModeTogetherModelId,
        actModeFireworksModelId: config.actModeFireworksModelId,
        actModeGroqModelId: config.actModeGroqModelId,
        actModeGroqModelInfo: convertModelInfoToProtoOpenRouter(config.actModeGroqModelInfo),
        actModeBasetenModelId: config.actModeBasetenModelId,
        actModeBasetenModelInfo: convertModelInfoToProtoOpenRouter(config.actModeBasetenModelInfo),
        actModeHuggingFaceModelId: config.actModeHuggingFaceModelId,
        actModeHuggingFaceModelInfo: convertModelInfoToProtoOpenRouter(config.actModeHuggingFaceModelInfo),
        actModeSapAiCoreModelId: config.actModeSapAiCoreModelId,
        actModeHuaweiCloudMaasModelId: config.actModeHuaweiCloudMaasModelId,
        actModeHuaweiCloudMaasModelInfo: convertModelInfoToProtoOpenRouter(config.actModeHuaweiCloudMaasModelInfo),
        actModeSapAiCoreDeploymentId: config.actModeSapAiCoreDeploymentId,
        actModeOcaModelId: config.actModeOcaModelId,
        actModeOcaModelInfo: convertOcaModelInfoToProtoOcaModelInfo(config.actModeOcaModelInfo),
        actModeOcaReasoningEffort: config.actModeOcaReasoningEffort,
        actModeAihubmixModelId: config.actModeAihubmixModelId,
        actModeAihubmixModelInfo: convertOpenAiCompatibleModelInfoToProto(config.actModeAihubmixModelInfo),
        actModeHicapModelId: config.actModeHicapModelId,
        actModeHicapModelInfo: convertModelInfoToProtoOpenRouter(config.actModeHicapModelInfo),
        actModeNousResearchModelId: config.actModeNousResearchModelId,
        actModeVercelAiGatewayModelId: config.actModeVercelAiGatewayModelId,
        actModeVercelAiGatewayModelInfo: convertModelInfoToProtoOpenRouter(config.actModeVercelAiGatewayModelInfo),
    };
}
// Converts proto ApiConfiguration to application ApiConfiguration
function convertProtoToApiConfiguration(protoConfig) {
    return {
        // Global configuration fields
        apiKey: protoConfig.apiKey,
        clineAccountId: protoConfig.clineAccountId,
        ulid: protoConfig.ulid,
        liteLlmBaseUrl: protoConfig.liteLlmBaseUrl,
        liteLlmApiKey: protoConfig.liteLlmApiKey,
        liteLlmUsePromptCache: protoConfig.liteLlmUsePromptCache,
        openAiHeaders: Object.keys(protoConfig.openAiHeaders || {}).length > 0 ? protoConfig.openAiHeaders : undefined,
        anthropicBaseUrl: protoConfig.anthropicBaseUrl,
        openRouterApiKey: protoConfig.openrouterApiKey,
        openRouterProviderSorting: protoConfig.openRouterProviderSorting,
        awsAccessKey: protoConfig.awsAccessKey,
        awsSecretKey: protoConfig.awsSecretKey,
        awsSessionToken: protoConfig.awsSessionToken,
        awsRegion: protoConfig.awsRegion,
        awsUseCrossRegionInference: protoConfig.awsUseCrossRegionInference,
        awsUseGlobalInference: protoConfig.awsUseGlobalInference,
        awsBedrockUsePromptCache: protoConfig.awsBedrockUsePromptCache,
        awsUseProfile: protoConfig.awsUseProfile,
        awsAuthentication: protoConfig.awsAuthentication,
        awsProfile: protoConfig.awsProfile,
        awsBedrockApiKey: protoConfig.awsBedrockApiKey,
        awsBedrockEndpoint: protoConfig.awsBedrockEndpoint,
        claudeCodePath: protoConfig.claudeCodePath,
        vertexProjectId: protoConfig.vertexProjectId,
        vertexRegion: protoConfig.vertexRegion,
        openAiBaseUrl: protoConfig.openAiBaseUrl,
        openAiApiKey: protoConfig.openAiApiKey,
        ollamaBaseUrl: protoConfig.ollamaBaseUrl,
        ollamaApiKey: protoConfig.ollamaApiKey,
        ollamaApiOptionsCtxNum: protoConfig.ollamaApiOptionsCtxNum,
        lmStudioBaseUrl: protoConfig.lmStudioBaseUrl,
        lmStudioMaxTokens: protoConfig.lmStudioMaxTokens,
        geminiApiKey: protoConfig.geminiApiKey,
        geminiBaseUrl: protoConfig.geminiBaseUrl,
        openAiNativeApiKey: protoConfig.openAiNativeApiKey,
        deepSeekApiKey: protoConfig.deepSeekApiKey,
        requestyApiKey: protoConfig.requestyApiKey,
        requestyBaseUrl: protoConfig.requestyBaseUrl,
        togetherApiKey: protoConfig.togetherApiKey,
        fireworksApiKey: protoConfig.fireworksApiKey,
        fireworksModelMaxCompletionTokens: protoConfig.fireworksModelMaxCompletionTokens,
        fireworksModelMaxTokens: protoConfig.fireworksModelMaxTokens,
        qwenApiKey: protoConfig.qwenApiKey,
        qwenCodeOauthPath: protoConfig.qwenCodeOauthPath,
        doubaoApiKey: protoConfig.doubaoApiKey,
        mistralApiKey: protoConfig.mistralApiKey,
        azureApiVersion: protoConfig.azureApiVersion,
        azureIdentity: protoConfig.azureIdentity,
        qwenApiLine: protoConfig.qwenApiLine,
        moonshotApiLine: protoConfig.moonshotApiLine,
        moonshotApiKey: protoConfig.moonshotApiKey,
        huggingFaceApiKey: protoConfig.huggingFaceApiKey,
        nebiusApiKey: protoConfig.nebiusApiKey,
        wandbApiKey: protoConfig.wandbApiKey,
        asksageApiUrl: protoConfig.asksageApiUrl,
        asksageApiKey: protoConfig.asksageApiKey,
        xaiApiKey: protoConfig.xaiApiKey,
        sambanovaApiKey: protoConfig.sambanovaApiKey,
        cerebrasApiKey: protoConfig.cerebrasApiKey,
        vercelAiGatewayApiKey: protoConfig.vercelAiGatewayApiKey,
        groqApiKey: protoConfig.groqApiKey,
        basetenApiKey: protoConfig.basetenApiKey,
        requestTimeoutMs: protoConfig.requestTimeoutMs,
        sapAiCoreClientId: protoConfig.sapAiCoreClientId,
        sapAiCoreClientSecret: protoConfig.sapAiCoreClientSecret,
        sapAiResourceGroup: protoConfig.sapAiResourceGroup,
        sapAiCoreTokenUrl: protoConfig.sapAiCoreTokenUrl,
        sapAiCoreBaseUrl: protoConfig.sapAiCoreBaseUrl,
        sapAiCoreUseOrchestrationMode: protoConfig.sapAiCoreUseOrchestrationMode,
        huaweiCloudMaasApiKey: protoConfig.huaweiCloudMaasApiKey,
        zaiApiLine: protoConfig.zaiApiLine,
        zaiApiKey: protoConfig.zaiApiKey,
        difyApiKey: protoConfig.difyApiKey,
        difyBaseUrl: protoConfig.difyBaseUrl,
        ocaBaseUrl: protoConfig.ocaBaseUrl,
        ocaMode: protoConfig.ocaMode,
        aihubmixApiKey: protoConfig.aihubmixApiKey,
        aihubmixBaseUrl: protoConfig.aihubmixBaseUrl,
        aihubmixAppCode: protoConfig.aihubmixAppCode,
        minimaxApiKey: protoConfig.minimaxApiKey,
        minimaxApiLine: protoConfig.minimaxApiLine,
        hicapApiKey: protoConfig.hicapApiKey,
        hicapModelId: protoConfig.hicapModelId,
        nousResearchApiKey: protoConfig.nousResearchApiKey,
        clineApiKey: protoConfig.clineApiKey,
        // Plan mode configurations
        planModeApiProvider: protoConfig.planModeApiProvider !== undefined
            ? protoConfig.planModeApiProvider
            : undefined,
        planModeApiModelId: protoConfig.planModeApiModelId,
        planModeThinkingBudgetTokens: protoConfig.planModeThinkingBudgetTokens,
        geminiPlanModeThinkingLevel: protoConfig.geminiPlanModeThinkingLevel,
        planModeReasoningEffort: protoConfig.planModeReasoningEffort,
        planModeVsCodeLmModelSelector: protoConfig.planModeVsCodeLmModelSelector,
        planModeAwsBedrockCustomSelected: protoConfig.planModeAwsBedrockCustomSelected,
        planModeAwsBedrockCustomModelBaseId: protoConfig.planModeAwsBedrockCustomModelBaseId,
        planModeOpenRouterModelId: protoConfig.planModeOpenRouterModelId,
        planModeOpenRouterModelInfo: convertProtoToModelInfo(protoConfig.planModeOpenRouterModelInfo),
        planModeClineModelId: protoConfig.planModeClineModelId,
        planModeClineModelInfo: convertProtoToModelInfo(protoConfig.planModeClineModelInfo),
        planModeOpenAiModelId: protoConfig.planModeOpenAiModelId,
        planModeOpenAiModelInfo: convertProtoToOpenAiCompatibleModelInfo(protoConfig.planModeOpenAiModelInfo),
        planModeOllamaModelId: protoConfig.planModeOllamaModelId,
        planModeLmStudioModelId: protoConfig.planModeLmStudioModelId,
        planModeLiteLlmModelId: protoConfig.planModeLiteLlmModelId,
        planModeLiteLlmModelInfo: convertProtoToLiteLLMModelInfo(protoConfig.planModeLiteLlmModelInfo),
        planModeRequestyModelId: protoConfig.planModeRequestyModelId,
        planModeRequestyModelInfo: convertProtoToModelInfo(protoConfig.planModeRequestyModelInfo),
        planModeTogetherModelId: protoConfig.planModeTogetherModelId,
        planModeFireworksModelId: protoConfig.planModeFireworksModelId,
        planModeGroqModelId: protoConfig.planModeGroqModelId,
        planModeGroqModelInfo: convertProtoToModelInfo(protoConfig.planModeGroqModelInfo),
        planModeBasetenModelId: protoConfig.planModeBasetenModelId,
        planModeBasetenModelInfo: convertProtoToModelInfo(protoConfig.planModeBasetenModelInfo),
        planModeHuggingFaceModelId: protoConfig.planModeHuggingFaceModelId,
        planModeHuggingFaceModelInfo: convertProtoToModelInfo(protoConfig.planModeHuggingFaceModelInfo),
        planModeSapAiCoreModelId: protoConfig.planModeSapAiCoreModelId,
        planModeHuaweiCloudMaasModelId: protoConfig.planModeHuaweiCloudMaasModelId,
        planModeHuaweiCloudMaasModelInfo: convertProtoToModelInfo(protoConfig.planModeHuaweiCloudMaasModelInfo),
        planModeSapAiCoreDeploymentId: protoConfig.planModeSapAiCoreDeploymentId,
        planModeOcaModelId: protoConfig.planModeOcaModelId,
        planModeOcaModelInfo: convertProtoOcaModelInfoToOcaModelInfo(protoConfig.planModeOcaModelInfo),
        planModeOcaReasoningEffort: protoConfig.planModeOcaReasoningEffort,
        planModeAihubmixModelId: protoConfig.planModeAihubmixModelId,
        planModeAihubmixModelInfo: convertProtoToOpenAiCompatibleModelInfo(protoConfig.planModeAihubmixModelInfo),
        planModeHicapModelId: protoConfig.planModeHicapModelId,
        planModeHicapModelInfo: convertProtoToModelInfo(protoConfig.planModeHicapModelInfo),
        planModeNousResearchModelId: protoConfig.planModeNousResearchModelId,
        planModeVercelAiGatewayModelId: protoConfig.planModeVercelAiGatewayModelId,
        planModeVercelAiGatewayModelInfo: convertProtoToModelInfo(protoConfig.planModeVercelAiGatewayModelInfo),
        // Act mode configurations
        actModeApiProvider: protoConfig.actModeApiProvider !== undefined ? convertProtoToApiProvider(protoConfig.actModeApiProvider) : undefined,
        actModeApiModelId: protoConfig.actModeApiModelId,
        actModeThinkingBudgetTokens: protoConfig.actModeThinkingBudgetTokens,
        geminiActModeThinkingLevel: protoConfig.geminiActModeThinkingLevel,
        actModeReasoningEffort: protoConfig.actModeReasoningEffort,
        actModeVsCodeLmModelSelector: protoConfig.actModeVsCodeLmModelSelector,
        actModeAwsBedrockCustomSelected: protoConfig.actModeAwsBedrockCustomSelected,
        actModeAwsBedrockCustomModelBaseId: protoConfig.actModeAwsBedrockCustomModelBaseId,
        actModeOpenRouterModelId: protoConfig.actModeOpenRouterModelId,
        actModeOpenRouterModelInfo: convertProtoToModelInfo(protoConfig.actModeOpenRouterModelInfo),
        actModeClineModelId: protoConfig.actModeClineModelId,
        actModeClineModelInfo: convertProtoToModelInfo(protoConfig.actModeClineModelInfo),
        actModeOpenAiModelId: protoConfig.actModeOpenAiModelId,
        actModeOpenAiModelInfo: convertProtoToOpenAiCompatibleModelInfo(protoConfig.actModeOpenAiModelInfo),
        actModeOllamaModelId: protoConfig.actModeOllamaModelId,
        actModeLmStudioModelId: protoConfig.actModeLmStudioModelId,
        actModeLiteLlmModelId: protoConfig.actModeLiteLlmModelId,
        actModeLiteLlmModelInfo: convertProtoToLiteLLMModelInfo(protoConfig.actModeLiteLlmModelInfo),
        actModeRequestyModelId: protoConfig.actModeRequestyModelId,
        actModeRequestyModelInfo: convertProtoToModelInfo(protoConfig.actModeRequestyModelInfo),
        actModeTogetherModelId: protoConfig.actModeTogetherModelId,
        actModeFireworksModelId: protoConfig.actModeFireworksModelId,
        actModeGroqModelId: protoConfig.actModeGroqModelId,
        actModeGroqModelInfo: convertProtoToModelInfo(protoConfig.actModeGroqModelInfo),
        actModeBasetenModelId: protoConfig.actModeBasetenModelId,
        actModeBasetenModelInfo: convertProtoToModelInfo(protoConfig.actModeBasetenModelInfo),
        actModeHuggingFaceModelId: protoConfig.actModeHuggingFaceModelId,
        actModeHuggingFaceModelInfo: convertProtoToModelInfo(protoConfig.actModeHuggingFaceModelInfo),
        actModeSapAiCoreModelId: protoConfig.actModeSapAiCoreModelId,
        actModeHuaweiCloudMaasModelId: protoConfig.actModeHuaweiCloudMaasModelId,
        actModeHuaweiCloudMaasModelInfo: convertProtoToModelInfo(protoConfig.actModeHuaweiCloudMaasModelInfo),
        actModeSapAiCoreDeploymentId: protoConfig.actModeSapAiCoreDeploymentId,
        actModeOcaModelId: protoConfig.actModeOcaModelId,
        actModeOcaModelInfo: convertProtoOcaModelInfoToOcaModelInfo(protoConfig.actModeOcaModelInfo),
        actModeOcaReasoningEffort: protoConfig.actModeOcaReasoningEffort,
        actModeAihubmixModelId: protoConfig.actModeAihubmixModelId,
        actModeAihubmixModelInfo: convertProtoToOpenAiCompatibleModelInfo(protoConfig.actModeAihubmixModelInfo),
        actModeHicapModelId: protoConfig.actModeHicapModelId,
        actModeHicapModelInfo: convertProtoToModelInfo(protoConfig.actModeHicapModelInfo),
        actModeNousResearchModelId: protoConfig.actModeNousResearchModelId,
        actModeVercelAiGatewayModelId: protoConfig.actModeVercelAiGatewayModelId,
        actModeVercelAiGatewayModelInfo: convertProtoToModelInfo(protoConfig.actModeVercelAiGatewayModelInfo),
    };
}
//# sourceMappingURL=api-configuration-conversion.js.map