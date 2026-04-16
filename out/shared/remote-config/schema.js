"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️  CRITICAL WARNING ⚠️
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * THE API SERVER MUST BE RE-DEPLOYED WHENEVER THIS SCHEMA IS UPDATED!
 *
 * This schema is used by both the extension and the API server for validation.
 * Any changes here require a coordinated deployment to avoid validation errors.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIKeySchema = exports.RemoteConfigSchema = exports.EnterpriseTelemetrySchema = exports.PromptUploadingSchema = exports.S3AccessKeySettingsSchema = exports.GlobalInstructionsFileSchema = exports.RemoteMCPServerSchema = exports.AllowedMCPServerSchema = exports.AnthropicSchema = exports.AnthropicModelSchema = exports.LiteLLMSchema = exports.LiteLLMModelSchema = exports.VertexSettingsSchema = exports.VertexModelSchema = exports.ClineSettingsSchema = exports.ClineModelSchema = exports.AwsBedrockSettingsSchema = exports.AwsBedrockCustomModelSchema = exports.AwsBedrockModelSchema = exports.OpenAiCompatibleSchema = exports.OpenAiCompatibleModelSchema = void 0;
const zod_1 = require("zod");
// OpenAI Compatible model schema with per-model settings
exports.OpenAiCompatibleModelSchema = zod_1.z.object({
    id: zod_1.z.string(), // The model ID is required
    temperature: zod_1.z.number().optional(),
    isR1FormatRequired: zod_1.z.boolean().optional(),
    maxTokens: zod_1.z.number().optional(),
    contextWindow: zod_1.z.number().optional(),
    inputPrice: zod_1.z.number().optional(),
    outputPrice: zod_1.z.number().optional(),
    supportsImages: zod_1.z.boolean().optional(),
});
// OpenAiCompatible specific settings
exports.OpenAiCompatibleSchema = zod_1.z.object({
    // A list of the allowed models with their settings
    models: zod_1.z.array(exports.OpenAiCompatibleModelSchema).optional(),
    // OpenAiCompatible specific settings:
    openAiBaseUrl: zod_1.z.string().optional(),
    openAiHeaders: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
    azureApiVersion: zod_1.z.string().optional(),
    azureIdentity: zod_1.z.boolean().optional(),
});
// AWS Bedrock model schema with per-model settings
exports.AwsBedrockModelSchema = zod_1.z.object({
    id: zod_1.z.string(), // The model ID is required
    thinkingBudgetTokens: zod_1.z.number().optional(),
});
// AWS Bedrock custom model schema (separate from regular models)
exports.AwsBedrockCustomModelSchema = zod_1.z.object({
    name: zod_1.z.string(), // The model name is required
    baseModelId: zod_1.z.string(), // The base model ID is required
    thinkingBudgetTokens: zod_1.z.number().optional(),
});
// AWS Bedrock specific settings
exports.AwsBedrockSettingsSchema = zod_1.z.object({
    // A list of the allowed models with their settings
    models: zod_1.z.array(exports.AwsBedrockModelSchema).optional(),
    // Custom models
    customModels: zod_1.z.array(exports.AwsBedrockCustomModelSchema).optional(),
    // AWS Bedrock specific settings:
    awsRegion: zod_1.z.string().optional(),
    awsUseCrossRegionInference: zod_1.z.boolean().optional(),
    awsUseGlobalInference: zod_1.z.boolean().optional(),
    awsBedrockUsePromptCache: zod_1.z.boolean().optional(),
    awsBedrockEndpoint: zod_1.z.string().optional(),
});
// Cline Provider model schema with per-model settings
exports.ClineModelSchema = zod_1.z.object({
    id: zod_1.z.string(), // The model ID is required
});
// Cline Provider specific settings
exports.ClineSettingsSchema = zod_1.z.object({
    // A list of the allowed models with their settings
    models: zod_1.z.array(exports.ClineModelSchema).optional(),
});
// Vertex Provider model schema with per-model settings
exports.VertexModelSchema = zod_1.z.object({
    id: zod_1.z.string(), // The model ID is required
    thinkingBudgetTokens: zod_1.z.number().optional(),
});
// GCP Vertex Provider specific settings
exports.VertexSettingsSchema = zod_1.z.object({
    // A list of the allowed models with their settings
    models: zod_1.z.array(exports.VertexModelSchema).optional(),
    vertexProjectId: zod_1.z.string().optional(),
    vertexRegion: zod_1.z.string().optional(),
});
exports.LiteLLMModelSchema = zod_1.z.object({
    id: zod_1.z.string(),
    thinkingBudgetTokens: zod_1.z.number().optional(),
    promptCachingEnabled: zod_1.z.boolean().optional(),
});
exports.LiteLLMSchema = zod_1.z.object({
    models: zod_1.z.array(exports.LiteLLMModelSchema).optional(),
    baseUrl: zod_1.z.string().optional(),
});
exports.AnthropicModelSchema = zod_1.z.object({
    id: zod_1.z.string(),
    thinkingBudgetTokens: zod_1.z.number().optional(),
});
exports.AnthropicSchema = zod_1.z.object({
    models: zod_1.z.array(exports.AnthropicModelSchema).optional(),
    baseUrl: zod_1.z.string().optional(),
});
// Provider settings schema
// Each provider becomes an optional field
const ProviderSettingsSchema = zod_1.z.object({
    OpenAiCompatible: exports.OpenAiCompatibleSchema.optional(),
    AwsBedrock: exports.AwsBedrockSettingsSchema.optional(),
    Cline: exports.ClineSettingsSchema.optional(),
    Vertex: exports.VertexSettingsSchema.optional(),
    LiteLLM: exports.LiteLLMSchema.optional(),
    Anthropic: exports.AnthropicSchema.optional(),
});
exports.AllowedMCPServerSchema = zod_1.z.object({
    // The ID of the MCP is the URL for their github repo.
    id: zod_1.z.string(),
});
exports.RemoteMCPServerSchema = zod_1.z.object({
    // The name of the MCP server
    name: zod_1.z.string(),
    // The URL of the MCP server
    url: zod_1.z.string(),
    // When this is true, the user cannot disable this MCP server
    alwaysEnabled: zod_1.z.boolean().optional(),
    // Headers to allow for custom auth
    headers: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
});
// Settings for a global cline rules or workflow file.
exports.GlobalInstructionsFileSchema = zod_1.z.object({
    // When this is enabled, the user cannot turn off this rule or workflow.
    alwaysEnabled: zod_1.z.boolean(),
    // The name of the rules or workflow file.
    name: zod_1.z.string(),
    // The contents of the rules or workflow file
    contents: zod_1.z.string(),
});
exports.S3AccessKeySettingsSchema = zod_1.z.object({
    bucket: zod_1.z.string(),
    accessKeyId: zod_1.z.string(),
    secretAccessKey: zod_1.z.string(),
    region: zod_1.z.string().optional(),
    endpoint: zod_1.z.string().optional(),
    accountId: zod_1.z.string().optional(),
    intervalMs: zod_1.z.number().optional(),
    maxRetries: zod_1.z.number().optional(),
    batchSize: zod_1.z.number().optional(),
    maxQueueSize: zod_1.z.number().optional(),
    maxFailedAgeMs: zod_1.z.number().optional(),
    backfillEnabled: zod_1.z.boolean().optional(),
});
exports.PromptUploadingSchema = zod_1.z.object({
    enabled: zod_1.z.boolean().optional(),
    type: zod_1.z.union([zod_1.z.literal("s3_access_keys"), zod_1.z.literal("r2_access_keys")]).optional(),
    s3AccessSettings: exports.S3AccessKeySettingsSchema.optional(),
    r2AccessSettings: exports.S3AccessKeySettingsSchema.optional(),
});
exports.EnterpriseTelemetrySchema = zod_1.z.object({
    promptUploading: exports.PromptUploadingSchema.optional(),
});
exports.RemoteConfigSchema = zod_1.z.object({
    // The version of the remote config settings, e.g. v1
    // This field is for internal use only, and won't be visible to the administrator in the UI.
    version: zod_1.z.string(),
    // Provider specific settings
    providerSettings: ProviderSettingsSchema.optional(),
    // General settings not specific to any provider
    telemetryEnabled: zod_1.z.boolean().optional(),
    kanbanEnabled: zod_1.z.boolean().optional(),
    // MCP settings
    // If this is false, the MCP marketplace is disabled in the extension
    mcpMarketplaceEnabled: zod_1.z.boolean().optional(),
    // If this is configured, the users only have access to these allowlisted MCP servers in the marketplace.
    allowedMCPServers: zod_1.z.array(exports.AllowedMCPServerSchema).optional(),
    // A list of pre-configured remote MCP servers.
    remoteMCPServers: zod_1.z.array(exports.RemoteMCPServerSchema).optional(),
    // If this is true, users cannot use or configure MCP servers that are not remotely configured.
    blockPersonalRemoteMCPServers: zod_1.z.boolean().optional(),
    // If the user is allowed to enable YOLO mode. Note this is different from the extension setting
    // yoloModeEnabled, because we do not want to force YOLO enabled for the user.
    yoloModeAllowed: zod_1.z.boolean().optional(),
    // OpenTelemetry configuration
    openTelemetryEnabled: zod_1.z.boolean().optional(),
    openTelemetryMetricsExporter: zod_1.z.string().optional(),
    openTelemetryLogsExporter: zod_1.z.string().optional(),
    openTelemetryOtlpProtocol: zod_1.z.string().optional(),
    openTelemetryOtlpEndpoint: zod_1.z.string().optional(),
    openTelemetryOtlpHeaders: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
    openTelemetryOtlpMetricsProtocol: zod_1.z.string().optional(),
    openTelemetryOtlpMetricsEndpoint: zod_1.z.string().optional(),
    openTelemetryOtlpMetricsHeaders: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
    openTelemetryOtlpLogsProtocol: zod_1.z.string().optional(),
    openTelemetryOtlpLogsEndpoint: zod_1.z.string().optional(),
    openTelemetryOtlpLogsHeaders: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
    openTelemetryMetricExportInterval: zod_1.z.number().optional(),
    openTelemetryOtlpInsecure: zod_1.z.boolean().optional(),
    openTelemetryLogBatchSize: zod_1.z.number().optional(),
    openTelemetryLogBatchTimeout: zod_1.z.number().optional(),
    openTelemetryLogMaxQueueSize: zod_1.z.number().optional(),
    enterpriseTelemetry: exports.EnterpriseTelemetrySchema.optional(),
    // Rules & Workflows
    globalRules: zod_1.z.array(exports.GlobalInstructionsFileSchema).optional(),
    globalWorkflows: zod_1.z.array(exports.GlobalInstructionsFileSchema).optional(),
});
exports.APIKeySchema = zod_1.z.record(zod_1.z.string(), zod_1.z.string());
//# sourceMappingURL=schema.js.map