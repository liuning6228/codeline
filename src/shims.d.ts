// 模块类型声明填充
declare module '@anthropic-ai/sdk/resources/index' {
  export * from '@anthropic-ai/sdk';
}

declare module '@google/genai' {
  export interface GenerateContentRequest {
    contents: Array<{
      parts: Array<{
        text: string;
      }>;
    }>;
    generationConfig?: {
      temperature?: number;
      maxOutputTokens?: number;
    };
  }
  
  export interface GenerateContentResponse {
    candidates: Array<{
      content: {
        parts: Array<{
          text: string;
        }>;
      };
    }>;
  }
  
  export class GenerativeModel {
    constructor(apiKey: string, model: string);
    generateContent(params: GenerateContentRequest): Promise<GenerateContentResponse>;
  }
  
  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(model: string): GenerativeModel;
  }
}

declare module 'openai/resources/chat/completions' {
  export * from 'openai';
}

// 全局测试声明
interface String {
  should: any;
}

// 缺失模块声明
declare module '@anthropic-ai/sdk' {
  export namespace Anthropic {
    export interface Tool {
      name: string;
      description: string;
      input_schema?: any;
    }
    
    export interface TextBlockParam {
      type: 'text';
      text: string;
    }
    
    export interface ImageBlockParam {
      type: 'image';
      source: {
        type: 'base64';
        media_type: string;
        data: string;
      };
    }
    
    export interface ToolUseBlockParam {
      type: 'tool_use';
      id: string;
      name: string;
      input: any;
    }
    
    export interface ToolResultBlockParam {
      type: 'tool_result';
      tool_use_id: string;
      content: string | Array<TextBlockParam>;
    }
    
    export interface ThinkingBlockParam {
      type: 'thinking';
      thinking: string;
      signature?: string;
    }
    
    export interface DocumentBlockParam {
      type: 'document';
      document?: any;
    }
    
    export interface ThinkingBlock {
      type: 'thinking';
      thinking: string;
      signature?: string;
    }
    
    export interface RedactedThinkingBlockParam {
      type: 'redacted_thinking';
      thinking?: string;
      signature?: string;
    }
    
    export type ContentBlockParam = TextBlockParam | ImageBlockParam | ToolUseBlockParam | ToolResultBlockParam | ThinkingBlockParam | DocumentBlockParam | RedactedThinkingBlockParam;
    
    export interface MessageParam {
      role: 'user' | 'assistant';
      content: string | ContentBlockParam[];
    }
    
    export interface ToolUseBlock {
      type: 'tool_use';
      id: string;
      name: string;
      input: any;
    }
    
    export interface ToolResultBlock {
      type: 'tool_result';
      tool_use_id: string;
      content: string;
    }
    
    export interface Message {
      id: string;
      type: 'message';
      role: 'assistant';
      content: ContentBlockParam[];
      model: string;
      stop_reason: string | null;
      stop_sequence: string | null;
      usage: {
        input_tokens: number;
        output_tokens: number;
      };
    }
    
    export class API {
      constructor(config: { apiKey: string });
      messages: {
        create(params: {
          model: string;
          max_tokens: number;
          messages: MessageParam[];
          tools?: Tool[];
          tool_choice?: any;
        }): Promise<Message>;
      };
    }
    
    // 导出类型别名
    export type TextBlock = TextBlockParam;
    export type ImageBlock = ImageBlockParam;
    export type ContentBlock = ContentBlockParam;
  }
  
  export class Anthropic extends Anthropic.API {}
  
  // 导出命名空间
  export { Anthropic };
}

declare module 'aws4fetch' {
  export class AwsClient {
    constructor(config: any);
    fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
  }
}

// Proto生成类型补丁
declare module '@shared/proto/cline/state' {
  export interface OnboardingModel {
    id?: string;
    name?: string;
    description?: string;
    icon?: string;
    category?: string;
    isEnabled?: boolean;
    order?: number;
    group?: string;
    score?: number;
    latency?: number;
    badge?: string;
    info?: {
      contextWindow?: number;
      supportsImages?: boolean;
      supportsPromptCache?: boolean;
      inputPrice?: number;
      outputPrice?: number;
      cacheWritesPrice?: number;
      cacheReadsPrice?: number;
      tiers?: any[];
    };
  }
  
  export enum TelemetrySettingEnum {
    UNSET = 0,
    ENABLED = 1,
    DISABLED = 2,
    UNRECOGNIZED = -1
  }
}



declare module '@shared/proto/cline/mcp' {
  export interface McpPrompt {
    name?: string;
    title?: string;
    description?: string;
    arguments?: McpPromptArgument[];
  }
  
  export interface McpPromptArgument {
    name?: string;
    description?: string;
    required?: boolean;
  }
  
  export interface McpResource {
    uri?: string;
    name?: string;
    description?: string;
    mimeType?: string;
  }
  
  export interface McpResourceTemplate {
    name?: string;
    description?: string;
    uriTemplate?: string;
    mimeType?: string;
  }
  
  export interface McpServer {
    name?: string;
    description?: string;
    config?: any;
    status?: McpServerStatus;
    error?: string | undefined;
    tools?: any[];
    resources?: any[];
    resourceTemplates?: any[];
    prompts?: any[];
    disabled?: boolean;
    timeout?: number;
    uid?: string;
    oauthRequired?: boolean;
    oauthAuthStatus?: any;
  }
  
  export enum McpServerStatus {
    MCP_SERVER_STATUS_CONNECTED = 0,
    MCP_SERVER_STATUS_CONNECTING = 1,
    MCP_SERVER_STATUS_DISCONNECTED = 2,
    UNRECOGNIZED = -1
  }
  
  export interface McpTool {
    name?: string;
    description?: string;
    inputSchema?: any;
    autoApprove?: boolean;
  }
  
  // MCP服务器状态枚举常量
  export const MCP_SERVER_STATUS_CONNECTED: any;
  export const MCP_SERVER_STATUS_CONNECTING: any;
  export const MCP_SERVER_STATUS_DISCONNECTED: any;
}

// 缺失模块声明
declare module '@/services/EnvUtils' {
  export class EnvUtils {
    static getEnvVar(key: string): string | undefined;
    static isDevelopment(): boolean;
    static isProduction(): boolean;
    static buildExternalBasicHeaders(): Record<string, string>;
  }
}

declare module '@/services/feature-flags/providers/IFeatureFlagsProvider' {
  export interface IFeatureFlagsProvider {
    getFlag(key: string): boolean;
    setFlag(key: string, value: boolean): void;
  }
}

declare module '@/core/storage/disk' {
  export interface DiskStorage {
    read(path: string): Promise<Buffer>;
    write(path: string, data: Buffer): Promise<void>;
  }
}

declare module '@/hosts/host-provider' {
  export interface HostProvider {
    getHost(): string;
    getPort(): number;
    globalStorageFsPath: string;
  }
  
  export const HostProvider: {
    get(): HostProvider;
  }
}

declare module '@integrations/misc/link-preview' {
  export interface LinkPreview {
    title: string;
    description: string;
    image: string;
  }
  
  export interface OpenGraphData {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    siteName?: string;
  }
  
  export function fetchLinkPreview(url: string): Promise<LinkPreview>;
  export function fetchOpenGraphData(url: string): Promise<OpenGraphData>;
}

declare module '@shared/proto/cline/web' {
  export interface OpenGraphPreview {
    title?: string;
    description?: string;
    imageUrl?: string;
    siteName?: string;
    url?: string;
  }
  
  export interface OpenGraphData {
    type?: string;
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    siteName?: string;
  }
  
  export const OpenGraphData: {
    create(data: Partial<OpenGraphData>): OpenGraphData;
  };
}

// Proto模型导出
declare module '@shared/proto/cline/models' {
  export interface LiteLLMModelInfo {
    modelName?: string;
    provider?: string;
    maxTokens?: number;
    contextWindow?: number;
    supportsImages?: boolean;
    supportsPromptCache?: boolean;
    inputPrice?: number;
    outputPrice?: number;
    cacheWritesPrice?: number;
    cacheReadsPrice?: number;
    description?: string;
    thinkingConfig?: ThinkingConfig;
    supportsGlobalEndpoint?: boolean;
    tiers?: any[];
    temperature?: number;
    supportsReasoning?: boolean;
  }
  
  export interface OpenAiCompatibleModelInfo {
    model?: string;
    baseUrl?: string;
    apiKey?: string;
    maxTokens?: number;
    contextWindow?: number;
    supportsImages?: boolean;
    supportsPromptCache: boolean;
    inputPrice?: number;
    outputPrice?: number;
    cacheWritesPrice?: number;
    cacheReadsPrice?: number;
    description?: string;
    thinkingConfig?: ThinkingConfig;
    supportsGlobalEndpoint?: boolean;
    tiers?: any[];
    temperature?: number;
    isR1FormatRequired?: boolean;
    supportsReasoning?: boolean;
  }
  
  export interface OpenRouterModelInfo {
    model?: string;
    provider?: string;
    maxTokens?: number;
    contextWindow?: number;
    supportsImages?: boolean;
    supportsPromptCache?: boolean;
    inputPrice?: number;
    outputPrice?: number;
    cacheWritesPrice?: number;
    cacheReadsPrice?: number;
    description?: string;
    thinkingConfig?: ThinkingConfig;
    supportsGlobalEndpoint?: boolean;
    tiers?: any[];
    temperature?: number;
    supportsReasoning?: boolean;
  }
  
  export interface ModelsApiConfiguration {
    providers?: any[];
    defaultProvider?: string;
    actModeNousResearchModelId?: string;
    actModeHicapModelInfo?: any;
    actModeVercelAiGatewayModelId?: string;
    actModeVercelAiGatewayModelInfo?: any;
    actModeThinkingBudgetTokens?: number;
    geminiActModeThinkingLevel?: string;
    actModeReasoningEffort?: string;
    actModeVsCodeLmModelSelector?: any;
    actModeAwsBedrockCustomSelected?: boolean;
    actModeAwsBedrockCustomModelBaseId?: string;
    actModeOpenRouterModelId?: string;
    actModeOpenRouterModelInfo?: any;
    actModeClineModelId?: string;
    maxConversationTokens?: number;
    maxConversationContextTokens?: number;
    maxConversationHistoryMessages?: number;
    apiKey?: string;
    baseUrl?: string;
    openAiApiKey?: string;
    anthropicApiKey?: string;
    geminiApiKey?: string;
    openrouterApiKey?: string;
    clineAccountId?: string;
    actModeOcaModelId?: string;
    actModeOcaModelInfo?: any;
    actModeOcaReasoningEffort?: string;
    actModeSapAiCoreModelId?: string;
    actModeSapAiCoreDeploymentId?: string;
    actModeHuaweiCloudMaasModelId?: string;
    actModeHuaweiCloudMaasModelInfo?: any;
    actModeHuggingFaceModelId?: string;
    actModeHuggingFaceModelInfo?: any;
    actModeAihubmixModelId?: string;
    actModeAihubmixModelInfo?: any;
    actModeHicapModelId?: string;
    actModeHicapModelInfo?: any;
    actModeFireworksModelId?: string;
    actModeFireworksModelInfo?: any;
    actModeGroqModelId?: string;
    actModeGroqModelInfo?: any;
    actModeBasetenModelId?: string;
    actModeBasetenModelInfo?: any;
    actModeClineModelInfo?: any;
    actModeOpenAiModelId?: string;
    actModeOpenAiModelInfo?: any;
    actModeOllamaModelId?: string;
    actModeLmStudioModelId?: string;
    actModeLiteLlmModelId?: string;
    actModeLiteLlmModelInfo?: any;
    actModeRequestyModelId?: string;
    actModeRequestyModelInfo?: any;
    actModeTogetherModelId?: string;
    ulid?: string;
    liteLlmBaseUrl?: string;
    liteLlmApiKey?: string;
    liteLlmUsePromptCache?: boolean;
    openAiHeaders?: Record<string, string>;
    anthropicBaseUrl?: string;
    openRouterProviderSorting?: string;
    awsRegion?: string;
    awsUseCrossRegionInference?: boolean;
    awsUseGlobalInference?: boolean;
    awsBedrockUsePromptCache?: boolean;
    awsAuthentication?: string;
    awsUseProfile?: boolean;
    awsProfile?: string;
    awsBedrockEndpoint?: string;
    claudeCodePath?: string;
    vertexProjectId?: string;
    vertexRegion?: string;
    openAiBaseUrl?: string;
    ollamaBaseUrl?: string;
    ollamaApiOptionsCtxNum?: string;
    lmStudioBaseUrl?: string;
    lmStudioMaxTokens?: string;
    geminiBaseUrl?: string;
    requestyBaseUrl?: string;
    fireworksModelMaxCompletionTokens?: number;
    fireworksModelMaxTokens?: number;
    qwenCodeOauthPath?: string;
    azureApiVersion?: string;
    azureIdentity?: boolean;
    qwenApiLine?: string;
    moonshotApiLine?: string;
    moonshotApiKey?: string;
    asksageApiUrl?: string;
    requestTimeoutMs?: number;
    sapAiResourceGroup?: string;
    sapAiCoreTokenUrl?: string;
    sapAiCoreBaseUrl?: string;
    sapAiCoreUseOrchestrationMode?: boolean;
    difyBaseUrl?: string;
    zaiApiLine?: string;
    ocaBaseUrl?: string;
    minimaxApiLine?: string;
    ocaMode?: string;
    aihubmixBaseUrl?: string;
    aihubmixAppCode?: string;
    enableParallelToolCalling?: boolean;
    clineApiKey?: string;
    awsAccessKey?: string;
    awsSecretKey?: string;
    awsSessionToken?: string;
    awsBedrockApiKey?: string;
    openAiNativeApiKey?: string;
    ollamaApiKey?: string;
    deepSeekApiKey?: string;
    requestyApiKey?: string;
    togetherApiKey?: string;
    fireworksApiKey?: string;
    qwenApiKey?: string;
    doubaoApiKey?: string;
    mistralApiKey?: string;
    authNonce?: string;
    asksageApiKey?: string;
    xaiApiKey?: string;
    zaiApiKey?: string;
    huggingFaceApiKey?: string;
    nebiusApiKey?: string;
    sambanovaApiKey?: string;
    cerebrasApiKey?: string;
    sapAiCoreClientId?: string;
    sapAiCoreClientSecret?: string;
    groqApiKey?: string;
    huaweiCloudMaasApiKey?: string;
    basetenApiKey?: string;
    vercelAiGatewayApiKey?: string;
    difyApiKey?: string;
    minimaxApiKey?: string;
    hicapApiKey?: string;
    hicapModelId?: string;
    aihubmixApiKey?: string;
    nousResearchApiKey?: string;
    remoteLiteLlmApiKey?: string;
    ocaApiKey?: string;
    ocaRefreshToken?: string;
    mcpOAuthSecrets?: any;
    wandbApiKey?: string;
    planModeApiProvider?: any;
    planModeApiModelId?: string;
    planModeThinkingBudgetTokens?: number;
    geminiPlanModeThinkingLevel?: string;
    planModeReasoningEffort?: string;
    planModeVsCodeLmModelSelector?: any;
    planModeAwsBedrockCustomSelected?: boolean;
    planModeAwsBedrockCustomModelBaseId?: string;
    planModeOpenRouterModelId?: string;
    planModeOpenRouterModelInfo?: any;
    planModeClineModelId?: string;
    planModeClineModelInfo?: any;
    planModeOpenAiModelId?: string;
    planModeOpenAiModelInfo?: any;
    planModeOllamaModelId?: string;
    planModeLmStudioModelId?: string;
    planModeLiteLlmModelId?: string;
    planModeLiteLlmModelInfo?: any;
    planModeRequestyModelId?: string;
    planModeRequestyModelInfo?: any;
    planModeTogetherModelId?: string;
    planModeFireworksModelId?: string;
    planModeGroqModelId?: string;
    planModeGroqModelInfo?: any;
    planModeBasetenModelId?: string;
    planModeBasetenModelInfo?: any;
    planModeHuggingFaceModelId?: string;
    planModeHuggingFaceModelInfo?: any;
    planModeSapAiCoreModelId?: string;
    planModeHuaweiCloudMaasModelId?: string;
    planModeHuaweiCloudMaasModelInfo?: any;
    planModeSapAiCoreDeploymentId?: string;
    planModeOcaModelId?: string;
    planModeOcaModelInfo?: any;
    planModeOcaReasoningEffort?: string;
    planModeAihubmixModelId?: string;
    planModeAihubmixModelInfo?: any;
    planModeHicapModelId?: string;
    planModeHicapModelInfo?: any;
    planModeNousResearchModelId?: string;
    planModeVercelAiGatewayModelId?: string;
    planModeVercelAiGatewayModelInfo?: any;
    actModeApiProvider?: any;
    actModeApiModelId?: string;
  }
  
  export const DEFAULT_API_PROVIDER: ApiProvider;
  
  export enum ApiProvider {
    UNKNOWN = 0,
    OPENAI = 1,
    ANTHROPIC = 2,
    GEMINI = 3,
    OLLAMA = 4,
    OPENROUTER = 5,
    LITELLM = 6,
    BEDROCK = 7,
    VERTEX = 8,
    LMSTUDIO = 9,
    OPENAI_NATIVE = 10,
    REQUESTY = 11,
    TOGETHER = 12,
    DEEPSEEK = 13,
    QWEN = 14,
    QWEN_CODE = 15,
    DOUBAO = 16,
    MISTRAL = 17,
    VSCODE_LM = 18,
    CLINE = 19,
    MOONSHOT = 20,
    HUGGINGFACE = 21,
    NEBIUS = 22,
    WANDB = 23,
    FIREWORKS = 24,
    ASKSAGE = 25,
    XAI = 26,
    SAMBANOVA = 27,
    CEREBRAS = 28,
    GROQ = 29,
    BASETEN = 30,
    SAPAICORE = 31,
    CLAUDE_CODE = 32,
    HUAWEI_CLOUD_MAAS = 33,
    VERCEL_AI_GATEWAY = 34,
    ZAI = 35,
    DIFY = 36,
    OCA = 37,
    AIHUBMIX = 38,
    MINIMAX = 39,
    HICAP = 40,
    NOUSRESEARCH = 41,
    OPENAI_CODEX = 42,
    UNRECOGNIZED = -1
  }
  
  export enum ApiFormat {
    ANTHROPIC_CHAT = 0,
    GEMINI_CHAT = 1,
    OPENAI_CHAT = 2,
    R1_CHAT = 3,
    OPENAI_RESPONSES = 4,
    OPENAI_RESPONSES_WEBSOCKET_MODE = 5,
    UNRECOGNIZED = -1
  }
  
  export interface OcaModelInfo {
    model?: string;
    accountId?: string;
    maxTokens?: number;
    contextWindow?: number;
    supportsImages?: boolean;
    supportsPromptCache?: boolean;
    inputPrice?: number;
    outputPrice?: number;
    cacheWritesPrice?: number;
    cacheReadsPrice?: number;
    description?: string;
    thinkingConfig?: ThinkingConfig;
    temperature?: number;
    modelName?: string;
    surveyId?: string;
    banner?: string;
    surveyContent?: string;
    apiFormat?: ApiFormat;
    supportsReasoning?: boolean;
    reasoningEffortOptions?: string[];
  }
  
  export interface ThinkingConfig {
    enabled?: boolean;
    format?: string;
    maxBudget?: number;
    outputPrice?: number;
    outputPriceTiers?: any[];
  }
  
  export interface LanguageModelChatSelector {
    provider?: string;
    model?: string;
    version?: string;
  }
  
  // 导出常量
  export const ApiProvider: { [key: string]: number };
  export const ThinkingConfig: { create: (data: any) => any };
  export const OpenRouterModelInfo: { create: (data: any) => any };
  export const LiteLLMModelInfo: { create: (data: any) => any };
  export const OcaModelInfo: { create: (data: any) => any };
  export const OpenAiCompatibleModelInfo: { create: (data: any) => any };
}

declare module '@shared/api' {
  export enum ApiFormat {
    ANTHROPIC_CHAT = 0,
    GEMINI_CHAT = 1,
    OPENAI_CHAT = 2,
    R1_CHAT = 3,
    OPENAI_RESPONSES = 4,
    OPENAI_RESPONSES_WEBSOCKET_MODE = 5,
    UNRECOGNIZED = -1
  }

  export type ApiProvider =
    | "anthropic"
    | "claude-code"
    | "openrouter"
    | "bedrock"
    | "vertex"
    | "openai"
    | "ollama"
    | "lmstudio"
    | "gemini"
    | "openai-native"
    | "openai-codex"
    | "requesty"
    | "together"
    | "deepseek"
    | "qwen"
    | "qwen-code"
    | "doubao"
    | "mistral"
    | "vscode-lm"
    | "cline"
    | "litellm"
    | "moonshot"
    | "nebius"
    | "fireworks"
    | "asksage"
    | "xai"
    | "sambanova"
    | "cerebras"
    | "sapaicore"
    | "groq"
    | "huggingface"
    | "huawei-cloud-maas"
    | "dify"
    | "baseten"
    | "vercel-ai-gateway"
    | "zai"
    | "oca"
    | "aihubmix"
    | "minimax"
    | "hicap"
    | "nousResearch"
    | "wandb";
  
  export interface ApiHandlerOptions {
    ulid?: string;
    onRetryAttempt?: (attempt: number, maxRetries: number, delay: number, error: any) => void;
  }
  
  export type ApiConfiguration = ModelsApiConfiguration;
  
  export type BedrockModelId = string;
  
  export interface ModelInfo {
    maxTokens?: number;
    contextWindow?: number;
    supportsImages?: boolean;
    supportsPromptCache?: boolean;
    supportsReasoning?: boolean;
    inputPrice?: number;
    outputPrice?: number;
    cacheWritesPrice?: number;
    cacheReadsPrice?: number;
    description?: string;
    thinkingConfig?: any;
    supportsGlobalEndpoint?: boolean;
    tiers?: any[];
    temperature?: number;
    isR1FormatRequired?: boolean;
    modelName?: string;
    surveyId?: string;
    banner?: string;
    surveyContent?: string;
    apiFormat?: ApiFormat;
    reasoningEffortOptions?: string[];
  }
  
  export interface OpenAiCompatibleModelInfo {
    model?: string;
    baseUrl?: string;
    apiKey?: string;
    maxTokens?: number;
    contextWindow?: number;
    supportsImages?: boolean;
    supportsPromptCache: boolean;
    inputPrice?: number;
    outputPrice?: number;
    cacheWritesPrice?: number;
    cacheReadsPrice?: number;
    description?: string;
    thinkingConfig?: any;
    supportsGlobalEndpoint?: boolean;
    tiers?: any[];
    temperature?: number;
    isR1FormatRequired?: boolean;
    supportsReasoning?: boolean;
  }
  
  export interface LiteLLMModelInfo {
    modelName?: string;
    provider?: string;
    maxTokens?: number;
    contextWindow?: number;
    supportsImages?: boolean;
    supportsPromptCache?: boolean;
    supportsReasoning?: boolean;
    inputPrice?: number;
    outputPrice?: number;
    cacheWritesPrice?: number;
    cacheReadsPrice?: number;
    description?: string;
    thinkingConfig?: any;
    supportsGlobalEndpoint?: boolean;
    tiers?: any[];
    temperature?: number;
  }
  
  export interface OcaModelInfo {
    model?: string;
    accountId?: string;
    maxTokens?: number;
    contextWindow?: number;
    supportsImages?: boolean;
    supportsPromptCache?: boolean;
    inputPrice?: number;
    outputPrice?: number;
    cacheWritesPrice?: number;
    cacheReadsPrice?: number;
    description?: string;
    thinkingConfig?: any;
    temperature?: number;
    modelName?: string;
    surveyId?: string;
    banner?: string;
    surveyContent?: string;
    apiFormat?: ApiFormat;
    supportsReasoning?: boolean;
    reasoningEffortOptions?: string[];
  }
  
  export const DEFAULT_API_PROVIDER: ApiProvider = "openrouter";
}

declare module '@integrations/misc/link-preview' {
  export interface OpenGraphData {
    type?: string;
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    siteName?: string;
  }
}

// Opentelemetry导出
declare module '@opentelemetry/core' {
  export function parseKeyPairsIntoRecord(pairs: string): Record<string, string>;
  export interface DiagLogger {}
  export interface DiagConsoleLogger {}
  export interface DiagLogFunction {}
  export const diag: {
    debug: DiagLogFunction;
    error: DiagLogFunction;
    info: DiagLogFunction;
    warn: DiagLogFunction;
    verbose: DiagLogFunction;
  };
  export class DiagLogLevel {}
  export function createComponentLogger(): DiagLogger;
  export function getGlobal(): any;
}

// 扩展IFeatureFlagsProvider模块
declare module '@/services/feature-flags/providers/IFeatureFlagsProvider' {
  export interface FeatureFlagPayload {
    key: string;
    value: any;
    description?: string;
  }
  
  export interface IFeatureFlagsProvider {
    getFlag(key: string): boolean;
    setFlag(key: string, value: boolean): void;
  }
}

// 扩展disk存储模块
declare module '@/core/storage/disk' {
  export interface DiskStorage {
    read(path: string): Promise<Buffer>;
    write(path: string, data: Buffer): Promise<void>;
  }
  
  export interface GlobalFileNames {
    API_CONVERSATION_HISTORY: string;
    TASK_HISTORY_STATE: string;
  }
  
  // 常量值，因为GlobalFileNames是接口而不是枚举
  export const GlobalFileNames: {
    API_CONVERSATION_HISTORY: string;
    TASK_HISTORY_STATE: string;
  }
  
  export function getSavedApiConversationHistory(taskId?: string): Promise<any>;
  export function getTaskHistoryStateFilePath(): string;
}

// 扩展Anthropic工具导出
declare module '@anthropic-ai/sdk/resources/index' {
  export interface Tool {
    name: string;
    description: string;
    input_schema?: any;
  }
}

// Google GenAI导出
declare module '@google/genai' {
  export interface FunctionDeclaration {
    name: string;
    description?: string;
    parameters?: any;
  }
  
  export interface GenerateContentRequest {
    contents: Array<{
      parts: Array<{
        text: string;
      }>;
    }>;
    generationConfig?: {
      temperature?: number;
      maxOutputTokens?: number;
    };
  }
  
  export interface GenerateContentResponse {
    candidates: Array<{
      content: {
        parts: Array<{
          text: string;
        }>;
      };
    }>;
  }
  
  export class GenerativeModel {
    constructor(apiKey: string, model: string);
    generateContent(params: GenerateContentRequest): Promise<GenerateContentResponse>;
  }
  
  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(model: string): GenerativeModel;
  }
}

// OpenAI导出
declare module 'openai/resources/chat/completions' {
  export interface ChatCompletionTool {
    type: 'function';
    function: {
      name: string;
      description?: string;
      parameters?: any;
    };
  }
}



