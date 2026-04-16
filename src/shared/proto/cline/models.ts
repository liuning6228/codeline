// Temporary implementation for Cline model types

export interface ModelInfo {
  id: string
  name: string
  // Add other fields as needed
  [key: string]: any
}

export const ModelInfo = {
  create: (data: any): ModelInfo => data
}

export interface ThinkingConfig {
  // Placeholder for thinking config
  [key: string]: any
}

export const ThinkingConfig = {
  create: (data: any): ThinkingConfig => data
}

export interface OcaModelInfo {
  // Placeholder for OCA model info
  [key: string]: any
}

export const OcaModelInfo = {
  create: (data: any): OcaModelInfo => data
}

export interface OpenAiCompatibleModelInfo {
  // Placeholder for OpenAI compatible model info
  [key: string]: any
}

export const OpenAiCompatibleModelInfo = {
  create: (data: any): OpenAiCompatibleModelInfo => data
}

export interface OpenRouterModelInfo {
  // Placeholder for OpenRouter model info
  [key: string]: any
}

export const OpenRouterModelInfo = {
  create: (data: any): OpenRouterModelInfo => data
}

export interface LiteLLMModelInfo {
  // Placeholder for LiteLLM model info
  [key: string]: any
}

export const LiteLLMModelInfo = {
  create: (data: any): LiteLLMModelInfo => data
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

export interface Metadata {
  // Placeholder for metadata
  [key: string]: any
}

export const Metadata = {
  create: (data: any): Metadata => data
}

export enum ApiProvider {
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
  // Placeholder for models API configuration
  [key: string]: any
}

export const ModelsApiConfiguration = {
  create: (data: any): ModelsApiConfiguration => data
}

export interface UpdateApiConfigurationRequest {
  // Placeholder for update API configuration request
  [key: string]: any
}

export const UpdateApiConfigurationRequest = {
  create: (data: any): UpdateApiConfigurationRequest => data
}

export interface ClineRecommendedModel {
  // Placeholder for Cline recommended model
  [key: string]: any
}

export const ClineRecommendedModel = {
  create: (data: any): ClineRecommendedModel => data
}

export interface ClineRecommendedModelsResponse {
  // Placeholder for Cline recommended models response
  [key: string]: any
}

export const ClineRecommendedModelsResponse = {
  create: (data: any): ClineRecommendedModelsResponse => data
}

export interface UpdateApiConfigurationRequestNew {
  // Placeholder for update API configuration request new
  [key: string]: any
}

export const UpdateApiConfigurationRequestNew = {
  create: (data: any): UpdateApiConfigurationRequestNew => data
}

export interface OpenAiModelsRequest {
  // Placeholder for OpenAI models request
  [key: string]: any
}

export const OpenAiModelsRequest = {
  create: (data: any): OpenAiModelsRequest => data
}

export interface SapAiCoreModelsRequest {
  // Placeholder for SAP AI Core models request
  [key: string]: any
}

export const SapAiCoreModelsRequest = {
  create: (data: any): SapAiCoreModelsRequest => data
}

export interface SapAiCoreModelDeployment {
  // Placeholder for SAP AI Core model deployment
  [key: string]: any
}

export const SapAiCoreModelDeployment = {
  create: (data: any): SapAiCoreModelDeployment => data
}