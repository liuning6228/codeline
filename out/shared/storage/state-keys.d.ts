import { AutoApprovalSettings } from "@shared/AutoApprovalSettings";
import { ApiProvider, LiteLLMModelInfo, ModelInfo, type OcaModelInfo, OpenAiCompatibleModelInfo } from "@shared/api";
import { BrowserSettings } from "@shared/BrowserSettings";
import { ClineRulesToggles } from "@shared/cline-rules";
import { FocusChainSettings } from "@shared/FocusChainSettings";
import { HistoryItem } from "@shared/HistoryItem";
import { McpDisplayMode } from "@shared/McpDisplayMode";
import { WorkspaceRoot } from "@shared/multi-root/types";
import { GlobalInstructionsFile } from "@shared/remote-config/schema";
import { Mode } from "@shared/storage/types";
import { TelemetrySetting } from "@shared/TelemetrySetting";
import { UserInfo } from "@shared/UserInfo";
import { LanguageModelChatSelector } from "vscode";
import { BlobStoreSettings } from "./ClineBlobStorage";
export type ConfiguredAPIKeys = Partial<Record<ApiProvider, boolean>>;
declare const REMOTE_CONFIG_EXTRA_FIELDS: {
    remoteConfiguredProviders: {
        default: ApiProvider[];
    };
    allowedMCPServers: {
        default: Array<{
            id: string;
        }>;
    };
    remoteMCPServers: {
        default: Array<{
            name: string;
            url: string;
            alwaysEnabled?: boolean;
        }> | undefined;
    };
    previousRemoteMCPServers: {
        default: Array<{
            name: string;
            url: string;
        }> | undefined;
    };
    remoteGlobalRules: {
        default: GlobalInstructionsFile[] | undefined;
    };
    remoteGlobalWorkflows: {
        default: GlobalInstructionsFile[] | undefined;
    };
    blockPersonalRemoteMCPServers: {
        default: boolean;
    };
    openTelemetryOtlpHeaders: {
        default: Record<string, string> | undefined;
    };
    otlpMetricsHeaders: {
        default: Record<string, string> | undefined;
    };
    otlpLogsHeaders: {
        default: Record<string, string> | undefined;
    };
    blobStoreConfig: {
        default: BlobStoreSettings | undefined;
    };
    configuredApiKeys: {
        default: ConfiguredAPIKeys | undefined;
    };
};
declare const GLOBAL_STATE_FIELDS: {
    clineVersion: {
        default: string | undefined;
    };
    "cline.generatedMachineId": {
        default: string | undefined;
    };
    lastShownAnnouncementId: {
        default: string | undefined;
    };
    taskHistory: {
        default: HistoryItem[];
        isAsync: true;
    };
    userInfo: {
        default: UserInfo | undefined;
    };
    favoritedModelIds: {
        default: string[];
    };
    mcpMarketplaceEnabled: {
        default: boolean;
    };
    mcpResponsesCollapsed: {
        default: boolean;
    };
    terminalReuseEnabled: {
        default: boolean;
    };
    vscodeTerminalExecutionMode: {
        default: "vscodeTerminal" | "backgroundExec";
    };
    isNewUser: {
        default: boolean;
    };
    welcomeViewCompleted: {
        default: boolean | undefined;
    };
    cliKanbanMigrationAnnouncementShown: {
        default: boolean;
    };
    mcpDisplayMode: {
        default: McpDisplayMode;
    };
    workspaceRoots: {
        default: WorkspaceRoot[] | undefined;
    };
    primaryRootIndex: {
        default: number;
    };
    multiRootEnabled: {
        default: boolean;
    };
    lastDismissedInfoBannerVersion: {
        default: number;
    };
    lastDismissedModelBannerVersion: {
        default: number;
    };
    lastDismissedCliBannerVersion: {
        default: number;
    };
    nativeToolCallEnabled: {
        default: boolean;
    };
    remoteRulesToggles: {
        default: ClineRulesToggles;
    };
    remoteWorkflowToggles: {
        default: ClineRulesToggles;
    };
    dismissedBanners: {
        default: Array<{
            bannerId: string;
            dismissedAt: number;
        }>;
    };
    worktreeAutoOpenPath: {
        default: string | undefined;
    };
};
declare const API_HANDLER_SETTINGS_FIELDS: {
    liteLlmBaseUrl: {
        default: string | undefined;
    };
    liteLlmUsePromptCache: {
        default: boolean | undefined;
    };
    openAiHeaders: {
        default: Record<string, string>;
    };
    anthropicBaseUrl: {
        default: string | undefined;
    };
    openRouterProviderSorting: {
        default: string | undefined;
    };
    awsRegion: {
        default: string | undefined;
    };
    awsUseCrossRegionInference: {
        default: boolean | undefined;
    };
    awsUseGlobalInference: {
        default: boolean | undefined;
    };
    awsBedrockUsePromptCache: {
        default: boolean | undefined;
    };
    awsAuthentication: {
        default: string | undefined;
    };
    awsUseProfile: {
        default: boolean | undefined;
    };
    awsProfile: {
        default: string | undefined;
    };
    awsBedrockEndpoint: {
        default: string | undefined;
    };
    claudeCodePath: {
        default: string | undefined;
    };
    vertexProjectId: {
        default: string | undefined;
    };
    vertexRegion: {
        default: string | undefined;
    };
    openAiBaseUrl: {
        default: string | undefined;
    };
    ollamaBaseUrl: {
        default: string | undefined;
    };
    ollamaApiOptionsCtxNum: {
        default: string | undefined;
    };
    lmStudioBaseUrl: {
        default: string | undefined;
    };
    lmStudioMaxTokens: {
        default: string | undefined;
    };
    geminiBaseUrl: {
        default: string | undefined;
    };
    requestyBaseUrl: {
        default: string | undefined;
    };
    fireworksModelMaxCompletionTokens: {
        default: number | undefined;
    };
    fireworksModelMaxTokens: {
        default: number | undefined;
    };
    qwenCodeOauthPath: {
        default: string | undefined;
    };
    azureApiVersion: {
        default: string | undefined;
    };
    azureIdentity: {
        default: boolean | undefined;
    };
    qwenApiLine: {
        default: string | undefined;
    };
    moonshotApiLine: {
        default: string | undefined;
    };
    asksageApiUrl: {
        default: string | undefined;
    };
    requestTimeoutMs: {
        default: number | undefined;
    };
    sapAiResourceGroup: {
        default: string | undefined;
    };
    sapAiCoreTokenUrl: {
        default: string | undefined;
    };
    sapAiCoreBaseUrl: {
        default: string | undefined;
    };
    sapAiCoreUseOrchestrationMode: {
        default: boolean;
    };
    difyBaseUrl: {
        default: string | undefined;
    };
    zaiApiLine: {
        default: string | undefined;
    };
    ocaBaseUrl: {
        default: string | undefined;
    };
    minimaxApiLine: {
        default: string | undefined;
    };
    ocaMode: {
        default: string;
    };
    aihubmixBaseUrl: {
        default: string | undefined;
    };
    aihubmixAppCode: {
        default: string | undefined;
    };
    enableParallelToolCalling: {
        default: boolean;
    };
    planModeApiModelId: {
        default: string | undefined;
    };
    planModeThinkingBudgetTokens: {
        default: number | undefined;
    };
    geminiPlanModeThinkingLevel: {
        default: string | undefined;
    };
    planModeReasoningEffort: {
        default: string | undefined;
    };
    planModeVerbosity: {
        default: string | undefined;
    };
    planModeVsCodeLmModelSelector: {
        default: LanguageModelChatSelector | undefined;
    };
    planModeAwsBedrockCustomSelected: {
        default: boolean | undefined;
    };
    planModeAwsBedrockCustomModelBaseId: {
        default: string | undefined;
    };
    planModeOpenRouterModelId: {
        default: string | undefined;
    };
    planModeOpenRouterModelInfo: {
        default: ModelInfo | undefined;
    };
    planModeClineModelId: {
        default: string | undefined;
    };
    planModeClineModelInfo: {
        default: ModelInfo | undefined;
    };
    planModeOpenAiModelId: {
        default: string | undefined;
    };
    planModeOpenAiModelInfo: {
        default: OpenAiCompatibleModelInfo | undefined;
    };
    planModeOllamaModelId: {
        default: string | undefined;
    };
    planModeLmStudioModelId: {
        default: string | undefined;
    };
    planModeLiteLlmModelId: {
        default: string | undefined;
    };
    planModeLiteLlmModelInfo: {
        default: LiteLLMModelInfo | undefined;
    };
    planModeRequestyModelId: {
        default: string | undefined;
    };
    planModeRequestyModelInfo: {
        default: ModelInfo | undefined;
    };
    planModeTogetherModelId: {
        default: string | undefined;
    };
    planModeFireworksModelId: {
        default: string | undefined;
    };
    planModeSapAiCoreModelId: {
        default: string | undefined;
    };
    planModeSapAiCoreDeploymentId: {
        default: string | undefined;
    };
    planModeGroqModelId: {
        default: string | undefined;
    };
    planModeGroqModelInfo: {
        default: ModelInfo | undefined;
    };
    planModeBasetenModelId: {
        default: string | undefined;
    };
    planModeBasetenModelInfo: {
        default: ModelInfo | undefined;
    };
    planModeHuggingFaceModelId: {
        default: string | undefined;
    };
    planModeHuggingFaceModelInfo: {
        default: ModelInfo | undefined;
    };
    planModeHuaweiCloudMaasModelId: {
        default: string | undefined;
    };
    planModeHuaweiCloudMaasModelInfo: {
        default: ModelInfo | undefined;
    };
    planModeOcaModelId: {
        default: string | undefined;
    };
    planModeOcaModelInfo: {
        default: OcaModelInfo | undefined;
    };
    planModeOcaReasoningEffort: {
        default: string | undefined;
    };
    planModeAihubmixModelId: {
        default: string | undefined;
    };
    planModeAihubmixModelInfo: {
        default: OpenAiCompatibleModelInfo | undefined;
    };
    planModeHicapModelId: {
        default: string | undefined;
    };
    planModeHicapModelInfo: {
        default: ModelInfo | undefined;
    };
    planModeNousResearchModelId: {
        default: string | undefined;
    };
    planModeVercelAiGatewayModelId: {
        default: string | undefined;
    };
    planModeVercelAiGatewayModelInfo: {
        default: ModelInfo | undefined;
    };
    actModeApiModelId: {
        default: string | undefined;
    };
    actModeThinkingBudgetTokens: {
        default: number | undefined;
    };
    geminiActModeThinkingLevel: {
        default: string | undefined;
    };
    actModeReasoningEffort: {
        default: string | undefined;
    };
    actModeVerbosity: {
        default: string | undefined;
    };
    actModeVsCodeLmModelSelector: {
        default: LanguageModelChatSelector | undefined;
    };
    actModeAwsBedrockCustomSelected: {
        default: boolean | undefined;
    };
    actModeAwsBedrockCustomModelBaseId: {
        default: string | undefined;
    };
    actModeOpenRouterModelId: {
        default: string | undefined;
    };
    actModeOpenRouterModelInfo: {
        default: ModelInfo | undefined;
    };
    actModeClineModelId: {
        default: string | undefined;
    };
    actModeClineModelInfo: {
        default: ModelInfo | undefined;
    };
    actModeOpenAiModelId: {
        default: string | undefined;
    };
    actModeOpenAiModelInfo: {
        default: OpenAiCompatibleModelInfo | undefined;
    };
    actModeOllamaModelId: {
        default: string | undefined;
    };
    actModeLmStudioModelId: {
        default: string | undefined;
    };
    actModeLiteLlmModelId: {
        default: string | undefined;
    };
    actModeLiteLlmModelInfo: {
        default: LiteLLMModelInfo | undefined;
    };
    actModeRequestyModelId: {
        default: string | undefined;
    };
    actModeRequestyModelInfo: {
        default: ModelInfo | undefined;
    };
    actModeTogetherModelId: {
        default: string | undefined;
    };
    actModeFireworksModelId: {
        default: string | undefined;
    };
    actModeSapAiCoreModelId: {
        default: string | undefined;
    };
    actModeSapAiCoreDeploymentId: {
        default: string | undefined;
    };
    actModeGroqModelId: {
        default: string | undefined;
    };
    actModeGroqModelInfo: {
        default: ModelInfo | undefined;
    };
    actModeBasetenModelId: {
        default: string | undefined;
    };
    actModeBasetenModelInfo: {
        default: ModelInfo | undefined;
    };
    actModeHuggingFaceModelId: {
        default: string | undefined;
    };
    actModeHuggingFaceModelInfo: {
        default: ModelInfo | undefined;
    };
    actModeHuaweiCloudMaasModelId: {
        default: string | undefined;
    };
    actModeHuaweiCloudMaasModelInfo: {
        default: ModelInfo | undefined;
    };
    actModeOcaModelId: {
        default: string | undefined;
    };
    actModeOcaModelInfo: {
        default: OcaModelInfo | undefined;
    };
    actModeOcaReasoningEffort: {
        default: string | undefined;
    };
    actModeAihubmixModelId: {
        default: string | undefined;
    };
    actModeAihubmixModelInfo: {
        default: OpenAiCompatibleModelInfo | undefined;
    };
    actModeHicapModelId: {
        default: string | undefined;
    };
    actModeHicapModelInfo: {
        default: ModelInfo | undefined;
    };
    actModeNousResearchModelId: {
        default: string | undefined;
    };
    actModeVercelAiGatewayModelId: {
        default: string | undefined;
    };
    actModeVercelAiGatewayModelInfo: {
        default: ModelInfo | undefined;
    };
    planModeApiProvider: {
        default: ApiProvider;
    };
    actModeApiProvider: {
        default: ApiProvider;
    };
    hicapModelId: {
        default: string | undefined;
    };
    lmStudioModelId: {
        default: string | undefined;
    };
};
declare const SETTINGS_FIELDS: {
    autoApprovalSettings: {
        default: AutoApprovalSettings;
    };
    globalClineRulesToggles: {
        default: ClineRulesToggles;
    };
    globalWorkflowToggles: {
        default: ClineRulesToggles;
    };
    globalSkillsToggles: {
        default: Record<string, boolean>;
    };
    browserSettings: {
        default: BrowserSettings;
        transform: (v: any) => any;
    };
    telemetrySetting: {
        default: TelemetrySetting;
    };
    planActSeparateModelsSetting: {
        default: boolean;
        isComputed: true;
    };
    enableCheckpointsSetting: {
        default: boolean;
    };
    shellIntegrationTimeout: {
        default: number;
    };
    defaultTerminalProfile: {
        default: string;
    };
    terminalOutputLineLimit: {
        default: number;
    };
    maxConsecutiveMistakes: {
        default: number;
    };
    strictPlanModeEnabled: {
        default: boolean;
    };
    hooksEnabled: {
        default: boolean;
    };
    yoloModeToggled: {
        default: boolean;
    };
    autoApproveAllToggled: {
        default: boolean;
    };
    useAutoCondense: {
        default: boolean;
    };
    subagentsEnabled: {
        default: boolean;
    };
    clineWebToolsEnabled: {
        default: boolean;
    };
    worktreesEnabled: {
        default: boolean;
    };
    preferredLanguage: {
        default: string;
    };
    mode: {
        default: Mode;
    };
    focusChainSettings: {
        default: FocusChainSettings;
    };
    customPrompt: {
        default: "compact" | undefined;
    };
    backgroundEditEnabled: {
        default: boolean;
    };
    optOutOfRemoteConfig: {
        default: boolean;
    };
    doubleCheckCompletionEnabled: {
        default: boolean;
    };
    showFeatureTips: {
        default: boolean;
    };
    openTelemetryEnabled: {
        default: boolean;
    };
    openTelemetryMetricsExporter: {
        default: string | undefined;
    };
    openTelemetryLogsExporter: {
        default: string | undefined;
    };
    openTelemetryOtlpProtocol: {
        default: string | undefined;
    };
    openTelemetryOtlpEndpoint: {
        default: string | undefined;
    };
    openTelemetryOtlpMetricsProtocol: {
        default: string | undefined;
    };
    openTelemetryOtlpMetricsEndpoint: {
        default: string | undefined;
    };
    openTelemetryOtlpLogsProtocol: {
        default: string | undefined;
    };
    openTelemetryOtlpLogsEndpoint: {
        default: string | undefined;
    };
    openTelemetryMetricExportInterval: {
        default: number | undefined;
    };
    openTelemetryOtlpInsecure: {
        default: boolean | undefined;
    };
    openTelemetryLogBatchSize: {
        default: number | undefined;
    };
    openTelemetryLogBatchTimeout: {
        default: number | undefined;
    };
    openTelemetryLogMaxQueueSize: {
        default: number | undefined;
    };
    liteLlmBaseUrl: {
        default: string | undefined;
    };
    liteLlmUsePromptCache: {
        default: boolean | undefined;
    };
    openAiHeaders: {
        default: Record<string, string>;
    };
    anthropicBaseUrl: {
        default: string | undefined;
    };
    openRouterProviderSorting: {
        default: string | undefined;
    };
    awsRegion: {
        default: string | undefined;
    };
    awsUseCrossRegionInference: {
        default: boolean | undefined;
    };
    awsUseGlobalInference: {
        default: boolean | undefined;
    };
    awsBedrockUsePromptCache: {
        default: boolean | undefined;
    };
    awsAuthentication: {
        default: string | undefined;
    };
    awsUseProfile: {
        default: boolean | undefined;
    };
    awsProfile: {
        default: string | undefined;
    };
    awsBedrockEndpoint: {
        default: string | undefined;
    };
    claudeCodePath: {
        default: string | undefined;
    };
    vertexProjectId: {
        default: string | undefined;
    };
    vertexRegion: {
        default: string | undefined;
    };
    openAiBaseUrl: {
        default: string | undefined;
    };
    ollamaBaseUrl: {
        default: string | undefined;
    };
    ollamaApiOptionsCtxNum: {
        default: string | undefined;
    };
    lmStudioBaseUrl: {
        default: string | undefined;
    };
    lmStudioMaxTokens: {
        default: string | undefined;
    };
    geminiBaseUrl: {
        default: string | undefined;
    };
    requestyBaseUrl: {
        default: string | undefined;
    };
    fireworksModelMaxCompletionTokens: {
        default: number | undefined;
    };
    fireworksModelMaxTokens: {
        default: number | undefined;
    };
    qwenCodeOauthPath: {
        default: string | undefined;
    };
    azureApiVersion: {
        default: string | undefined;
    };
    azureIdentity: {
        default: boolean | undefined;
    };
    qwenApiLine: {
        default: string | undefined;
    };
    moonshotApiLine: {
        default: string | undefined;
    };
    asksageApiUrl: {
        default: string | undefined;
    };
    requestTimeoutMs: {
        default: number | undefined;
    };
    sapAiResourceGroup: {
        default: string | undefined;
    };
    sapAiCoreTokenUrl: {
        default: string | undefined;
    };
    sapAiCoreBaseUrl: {
        default: string | undefined;
    };
    sapAiCoreUseOrchestrationMode: {
        default: boolean;
    };
    difyBaseUrl: {
        default: string | undefined;
    };
    zaiApiLine: {
        default: string | undefined;
    };
    ocaBaseUrl: {
        default: string | undefined;
    };
    minimaxApiLine: {
        default: string | undefined;
    };
    ocaMode: {
        default: string;
    };
    aihubmixBaseUrl: {
        default: string | undefined;
    };
    aihubmixAppCode: {
        default: string | undefined;
    };
    enableParallelToolCalling: {
        default: boolean;
    };
    planModeApiModelId: {
        default: string | undefined;
    };
    planModeThinkingBudgetTokens: {
        default: number | undefined;
    };
    geminiPlanModeThinkingLevel: {
        default: string | undefined;
    };
    planModeReasoningEffort: {
        default: string | undefined;
    };
    planModeVerbosity: {
        default: string | undefined;
    };
    planModeVsCodeLmModelSelector: {
        default: LanguageModelChatSelector | undefined;
    };
    planModeAwsBedrockCustomSelected: {
        default: boolean | undefined;
    };
    planModeAwsBedrockCustomModelBaseId: {
        default: string | undefined;
    };
    planModeOpenRouterModelId: {
        default: string | undefined;
    };
    planModeOpenRouterModelInfo: {
        default: ModelInfo | undefined;
    };
    planModeClineModelId: {
        default: string | undefined;
    };
    planModeClineModelInfo: {
        default: ModelInfo | undefined;
    };
    planModeOpenAiModelId: {
        default: string | undefined;
    };
    planModeOpenAiModelInfo: {
        default: OpenAiCompatibleModelInfo | undefined;
    };
    planModeOllamaModelId: {
        default: string | undefined;
    };
    planModeLmStudioModelId: {
        default: string | undefined;
    };
    planModeLiteLlmModelId: {
        default: string | undefined;
    };
    planModeLiteLlmModelInfo: {
        default: LiteLLMModelInfo | undefined;
    };
    planModeRequestyModelId: {
        default: string | undefined;
    };
    planModeRequestyModelInfo: {
        default: ModelInfo | undefined;
    };
    planModeTogetherModelId: {
        default: string | undefined;
    };
    planModeFireworksModelId: {
        default: string | undefined;
    };
    planModeSapAiCoreModelId: {
        default: string | undefined;
    };
    planModeSapAiCoreDeploymentId: {
        default: string | undefined;
    };
    planModeGroqModelId: {
        default: string | undefined;
    };
    planModeGroqModelInfo: {
        default: ModelInfo | undefined;
    };
    planModeBasetenModelId: {
        default: string | undefined;
    };
    planModeBasetenModelInfo: {
        default: ModelInfo | undefined;
    };
    planModeHuggingFaceModelId: {
        default: string | undefined;
    };
    planModeHuggingFaceModelInfo: {
        default: ModelInfo | undefined;
    };
    planModeHuaweiCloudMaasModelId: {
        default: string | undefined;
    };
    planModeHuaweiCloudMaasModelInfo: {
        default: ModelInfo | undefined;
    };
    planModeOcaModelId: {
        default: string | undefined;
    };
    planModeOcaModelInfo: {
        default: OcaModelInfo | undefined;
    };
    planModeOcaReasoningEffort: {
        default: string | undefined;
    };
    planModeAihubmixModelId: {
        default: string | undefined;
    };
    planModeAihubmixModelInfo: {
        default: OpenAiCompatibleModelInfo | undefined;
    };
    planModeHicapModelId: {
        default: string | undefined;
    };
    planModeHicapModelInfo: {
        default: ModelInfo | undefined;
    };
    planModeNousResearchModelId: {
        default: string | undefined;
    };
    planModeVercelAiGatewayModelId: {
        default: string | undefined;
    };
    planModeVercelAiGatewayModelInfo: {
        default: ModelInfo | undefined;
    };
    actModeApiModelId: {
        default: string | undefined;
    };
    actModeThinkingBudgetTokens: {
        default: number | undefined;
    };
    geminiActModeThinkingLevel: {
        default: string | undefined;
    };
    actModeReasoningEffort: {
        default: string | undefined;
    };
    actModeVerbosity: {
        default: string | undefined;
    };
    actModeVsCodeLmModelSelector: {
        default: LanguageModelChatSelector | undefined;
    };
    actModeAwsBedrockCustomSelected: {
        default: boolean | undefined;
    };
    actModeAwsBedrockCustomModelBaseId: {
        default: string | undefined;
    };
    actModeOpenRouterModelId: {
        default: string | undefined;
    };
    actModeOpenRouterModelInfo: {
        default: ModelInfo | undefined;
    };
    actModeClineModelId: {
        default: string | undefined;
    };
    actModeClineModelInfo: {
        default: ModelInfo | undefined;
    };
    actModeOpenAiModelId: {
        default: string | undefined;
    };
    actModeOpenAiModelInfo: {
        default: OpenAiCompatibleModelInfo | undefined;
    };
    actModeOllamaModelId: {
        default: string | undefined;
    };
    actModeLmStudioModelId: {
        default: string | undefined;
    };
    actModeLiteLlmModelId: {
        default: string | undefined;
    };
    actModeLiteLlmModelInfo: {
        default: LiteLLMModelInfo | undefined;
    };
    actModeRequestyModelId: {
        default: string | undefined;
    };
    actModeRequestyModelInfo: {
        default: ModelInfo | undefined;
    };
    actModeTogetherModelId: {
        default: string | undefined;
    };
    actModeFireworksModelId: {
        default: string | undefined;
    };
    actModeSapAiCoreModelId: {
        default: string | undefined;
    };
    actModeSapAiCoreDeploymentId: {
        default: string | undefined;
    };
    actModeGroqModelId: {
        default: string | undefined;
    };
    actModeGroqModelInfo: {
        default: ModelInfo | undefined;
    };
    actModeBasetenModelId: {
        default: string | undefined;
    };
    actModeBasetenModelInfo: {
        default: ModelInfo | undefined;
    };
    actModeHuggingFaceModelId: {
        default: string | undefined;
    };
    actModeHuggingFaceModelInfo: {
        default: ModelInfo | undefined;
    };
    actModeHuaweiCloudMaasModelId: {
        default: string | undefined;
    };
    actModeHuaweiCloudMaasModelInfo: {
        default: ModelInfo | undefined;
    };
    actModeOcaModelId: {
        default: string | undefined;
    };
    actModeOcaModelInfo: {
        default: OcaModelInfo | undefined;
    };
    actModeOcaReasoningEffort: {
        default: string | undefined;
    };
    actModeAihubmixModelId: {
        default: string | undefined;
    };
    actModeAihubmixModelInfo: {
        default: OpenAiCompatibleModelInfo | undefined;
    };
    actModeHicapModelId: {
        default: string | undefined;
    };
    actModeHicapModelInfo: {
        default: ModelInfo | undefined;
    };
    actModeNousResearchModelId: {
        default: string | undefined;
    };
    actModeVercelAiGatewayModelId: {
        default: string | undefined;
    };
    actModeVercelAiGatewayModelInfo: {
        default: ModelInfo | undefined;
    };
    planModeApiProvider: {
        default: ApiProvider;
    };
    actModeApiProvider: {
        default: ApiProvider;
    };
    hicapModelId: {
        default: string | undefined;
    };
    lmStudioModelId: {
        default: string | undefined;
    };
};
export declare const LocalStateKeys: readonly ["localClineRulesToggles", "localCursorRulesToggles", "localWindsurfRulesToggles", "localAgentsRulesToggles", "localSkillsToggles", "workflowToggles"];
type ExtractDefault<T> = T extends {
    default: infer U;
} ? U : never;
type BuildInterface<T extends Record<string, {
    default: any;
}>> = {
    [K in keyof T]: ExtractDefault<T[K]>;
};
export type GlobalState = BuildInterface<typeof GLOBAL_STATE_FIELDS>;
export type Settings = BuildInterface<typeof SETTINGS_FIELDS>;
type RemoteConfigExtra = BuildInterface<typeof REMOTE_CONFIG_EXTRA_FIELDS>;
export type ApiHandlerOptionSettings = BuildInterface<typeof API_HANDLER_SETTINGS_FIELDS>;
export type ApiHandlerSettings = ApiHandlerOptionSettings & Secrets;
export type GlobalStateAndSettings = GlobalState & Settings;
export type RemoteConfigFields = GlobalStateAndSettings & RemoteConfigExtra;
export type Secrets = {
    [K in (typeof SecretKeys)[number]]: string | undefined;
};
export type LocalState = {
    [K in (typeof LocalStateKeys)[number]]: ClineRulesToggles;
};
export type SecretKey = (typeof SecretKeys)[number];
export type GlobalStateKey = keyof GlobalState;
export type LocalStateKey = keyof LocalState;
export type SettingsKey = keyof Settings;
export type GlobalStateAndSettingsKey = keyof GlobalStateAndSettings;
export declare const SecretKeys: ("apiKey" | "clineApiKey" | "clineAccountId" | "cline:clineAccountId" | "openRouterApiKey" | "awsAccessKey" | "awsSecretKey" | "awsSessionToken" | "awsBedrockApiKey" | "openAiApiKey" | "geminiApiKey" | "openAiNativeApiKey" | "ollamaApiKey" | "deepSeekApiKey" | "requestyApiKey" | "togetherApiKey" | "fireworksApiKey" | "qwenApiKey" | "doubaoApiKey" | "mistralApiKey" | "liteLlmApiKey" | "authNonce" | "asksageApiKey" | "xaiApiKey" | "moonshotApiKey" | "zaiApiKey" | "huggingFaceApiKey" | "nebiusApiKey" | "sambanovaApiKey" | "cerebrasApiKey" | "sapAiCoreClientId" | "sapAiCoreClientSecret" | "groqApiKey" | "huaweiCloudMaasApiKey" | "basetenApiKey" | "vercelAiGatewayApiKey" | "difyApiKey" | "minimaxApiKey" | "hicapApiKey" | "aihubmixApiKey" | "nousResearchApiKey" | "remoteLiteLlmApiKey" | "ocaApiKey" | "ocaRefreshToken" | "mcpOAuthSecrets" | "openai-codex-oauth-credentials" | "wandbApiKey")[];
export declare const SettingsKeys: (keyof Settings)[];
export declare const ApiHandlerSettingsKeys: (keyof ApiHandlerOptionSettings)[];
export declare const GlobalStateAndSettingKeys: GlobalStateAndSettingsKey[];
export declare const GLOBAL_STATE_DEFAULTS: Partial<BuildInterface<{
    clineVersion: {
        default: string | undefined;
    };
    "cline.generatedMachineId": {
        default: string | undefined;
    };
    lastShownAnnouncementId: {
        default: string | undefined;
    };
    taskHistory: {
        default: HistoryItem[];
        isAsync: true;
    };
    userInfo: {
        default: UserInfo | undefined;
    };
    favoritedModelIds: {
        default: string[];
    };
    mcpMarketplaceEnabled: {
        default: boolean;
    };
    mcpResponsesCollapsed: {
        default: boolean;
    };
    terminalReuseEnabled: {
        default: boolean;
    };
    vscodeTerminalExecutionMode: {
        default: "vscodeTerminal" | "backgroundExec";
    };
    isNewUser: {
        default: boolean;
    };
    welcomeViewCompleted: {
        default: boolean | undefined;
    };
    cliKanbanMigrationAnnouncementShown: {
        default: boolean;
    };
    mcpDisplayMode: {
        default: McpDisplayMode;
    };
    workspaceRoots: {
        default: WorkspaceRoot[] | undefined;
    };
    primaryRootIndex: {
        default: number;
    };
    multiRootEnabled: {
        default: boolean;
    };
    lastDismissedInfoBannerVersion: {
        default: number;
    };
    lastDismissedModelBannerVersion: {
        default: number;
    };
    lastDismissedCliBannerVersion: {
        default: number;
    };
    nativeToolCallEnabled: {
        default: boolean;
    };
    remoteRulesToggles: {
        default: ClineRulesToggles;
    };
    remoteWorkflowToggles: {
        default: ClineRulesToggles;
    };
    dismissedBanners: {
        default: Array<{
            bannerId: string;
            dismissedAt: number;
        }>;
    };
    worktreeAutoOpenPath: {
        default: string | undefined;
    };
}>>;
export declare const SETTINGS_DEFAULTS: Partial<BuildInterface<{
    autoApprovalSettings: {
        default: AutoApprovalSettings;
    };
    globalClineRulesToggles: {
        default: ClineRulesToggles;
    };
    globalWorkflowToggles: {
        default: ClineRulesToggles;
    };
    globalSkillsToggles: {
        default: Record<string, boolean>;
    };
    browserSettings: {
        default: BrowserSettings;
        transform: (v: any) => any;
    };
    telemetrySetting: {
        default: TelemetrySetting;
    };
    planActSeparateModelsSetting: {
        default: boolean;
        isComputed: true;
    };
    enableCheckpointsSetting: {
        default: boolean;
    };
    shellIntegrationTimeout: {
        default: number;
    };
    defaultTerminalProfile: {
        default: string;
    };
    terminalOutputLineLimit: {
        default: number;
    };
    maxConsecutiveMistakes: {
        default: number;
    };
    strictPlanModeEnabled: {
        default: boolean;
    };
    hooksEnabled: {
        default: boolean;
    };
    yoloModeToggled: {
        default: boolean;
    };
    autoApproveAllToggled: {
        default: boolean;
    };
    useAutoCondense: {
        default: boolean;
    };
    subagentsEnabled: {
        default: boolean;
    };
    clineWebToolsEnabled: {
        default: boolean;
    };
    worktreesEnabled: {
        default: boolean;
    };
    preferredLanguage: {
        default: string;
    };
    mode: {
        default: Mode;
    };
    focusChainSettings: {
        default: FocusChainSettings;
    };
    customPrompt: {
        default: "compact" | undefined;
    };
    backgroundEditEnabled: {
        default: boolean;
    };
    optOutOfRemoteConfig: {
        default: boolean;
    };
    doubleCheckCompletionEnabled: {
        default: boolean;
    };
    showFeatureTips: {
        default: boolean;
    };
    openTelemetryEnabled: {
        default: boolean;
    };
    openTelemetryMetricsExporter: {
        default: string | undefined;
    };
    openTelemetryLogsExporter: {
        default: string | undefined;
    };
    openTelemetryOtlpProtocol: {
        default: string | undefined;
    };
    openTelemetryOtlpEndpoint: {
        default: string | undefined;
    };
    openTelemetryOtlpMetricsProtocol: {
        default: string | undefined;
    };
    openTelemetryOtlpMetricsEndpoint: {
        default: string | undefined;
    };
    openTelemetryOtlpLogsProtocol: {
        default: string | undefined;
    };
    openTelemetryOtlpLogsEndpoint: {
        default: string | undefined;
    };
    openTelemetryMetricExportInterval: {
        default: number | undefined;
    };
    openTelemetryOtlpInsecure: {
        default: boolean | undefined;
    };
    openTelemetryLogBatchSize: {
        default: number | undefined;
    };
    openTelemetryLogBatchTimeout: {
        default: number | undefined;
    };
    openTelemetryLogMaxQueueSize: {
        default: number | undefined;
    };
    liteLlmBaseUrl: {
        default: string | undefined;
    };
    liteLlmUsePromptCache: {
        default: boolean | undefined;
    };
    openAiHeaders: {
        default: Record<string, string>;
    };
    anthropicBaseUrl: {
        default: string | undefined;
    };
    openRouterProviderSorting: {
        default: string | undefined;
    };
    awsRegion: {
        default: string | undefined;
    };
    awsUseCrossRegionInference: {
        default: boolean | undefined;
    };
    awsUseGlobalInference: {
        default: boolean | undefined;
    };
    awsBedrockUsePromptCache: {
        default: boolean | undefined;
    };
    awsAuthentication: {
        default: string | undefined;
    };
    awsUseProfile: {
        default: boolean | undefined;
    };
    awsProfile: {
        default: string | undefined;
    };
    awsBedrockEndpoint: {
        default: string | undefined;
    };
    claudeCodePath: {
        default: string | undefined;
    };
    vertexProjectId: {
        default: string | undefined;
    };
    vertexRegion: {
        default: string | undefined;
    };
    openAiBaseUrl: {
        default: string | undefined;
    };
    ollamaBaseUrl: {
        default: string | undefined;
    };
    ollamaApiOptionsCtxNum: {
        default: string | undefined;
    };
    lmStudioBaseUrl: {
        default: string | undefined;
    };
    lmStudioMaxTokens: {
        default: string | undefined;
    };
    geminiBaseUrl: {
        default: string | undefined;
    };
    requestyBaseUrl: {
        default: string | undefined;
    };
    fireworksModelMaxCompletionTokens: {
        default: number | undefined;
    };
    fireworksModelMaxTokens: {
        default: number | undefined;
    };
    qwenCodeOauthPath: {
        default: string | undefined;
    };
    azureApiVersion: {
        default: string | undefined;
    };
    azureIdentity: {
        default: boolean | undefined;
    };
    qwenApiLine: {
        default: string | undefined;
    };
    moonshotApiLine: {
        default: string | undefined;
    };
    asksageApiUrl: {
        default: string | undefined;
    };
    requestTimeoutMs: {
        default: number | undefined;
    };
    sapAiResourceGroup: {
        default: string | undefined;
    };
    sapAiCoreTokenUrl: {
        default: string | undefined;
    };
    sapAiCoreBaseUrl: {
        default: string | undefined;
    };
    sapAiCoreUseOrchestrationMode: {
        default: boolean;
    };
    difyBaseUrl: {
        default: string | undefined;
    };
    zaiApiLine: {
        default: string | undefined;
    };
    ocaBaseUrl: {
        default: string | undefined;
    };
    minimaxApiLine: {
        default: string | undefined;
    };
    ocaMode: {
        default: string;
    };
    aihubmixBaseUrl: {
        default: string | undefined;
    };
    aihubmixAppCode: {
        default: string | undefined;
    };
    enableParallelToolCalling: {
        default: boolean;
    };
    planModeApiModelId: {
        default: string | undefined;
    };
    planModeThinkingBudgetTokens: {
        default: number | undefined;
    };
    geminiPlanModeThinkingLevel: {
        default: string | undefined;
    };
    planModeReasoningEffort: {
        default: string | undefined;
    };
    planModeVerbosity: {
        default: string | undefined;
    };
    planModeVsCodeLmModelSelector: {
        default: LanguageModelChatSelector | undefined;
    };
    planModeAwsBedrockCustomSelected: {
        default: boolean | undefined;
    };
    planModeAwsBedrockCustomModelBaseId: {
        default: string | undefined;
    };
    planModeOpenRouterModelId: {
        default: string | undefined;
    };
    planModeOpenRouterModelInfo: {
        default: ModelInfo | undefined;
    };
    planModeClineModelId: {
        default: string | undefined;
    };
    planModeClineModelInfo: {
        default: ModelInfo | undefined;
    };
    planModeOpenAiModelId: {
        default: string | undefined;
    };
    planModeOpenAiModelInfo: {
        default: OpenAiCompatibleModelInfo | undefined;
    };
    planModeOllamaModelId: {
        default: string | undefined;
    };
    planModeLmStudioModelId: {
        default: string | undefined;
    };
    planModeLiteLlmModelId: {
        default: string | undefined;
    };
    planModeLiteLlmModelInfo: {
        default: LiteLLMModelInfo | undefined;
    };
    planModeRequestyModelId: {
        default: string | undefined;
    };
    planModeRequestyModelInfo: {
        default: ModelInfo | undefined;
    };
    planModeTogetherModelId: {
        default: string | undefined;
    };
    planModeFireworksModelId: {
        default: string | undefined;
    };
    planModeSapAiCoreModelId: {
        default: string | undefined;
    };
    planModeSapAiCoreDeploymentId: {
        default: string | undefined;
    };
    planModeGroqModelId: {
        default: string | undefined;
    };
    planModeGroqModelInfo: {
        default: ModelInfo | undefined;
    };
    planModeBasetenModelId: {
        default: string | undefined;
    };
    planModeBasetenModelInfo: {
        default: ModelInfo | undefined;
    };
    planModeHuggingFaceModelId: {
        default: string | undefined;
    };
    planModeHuggingFaceModelInfo: {
        default: ModelInfo | undefined;
    };
    planModeHuaweiCloudMaasModelId: {
        default: string | undefined;
    };
    planModeHuaweiCloudMaasModelInfo: {
        default: ModelInfo | undefined;
    };
    planModeOcaModelId: {
        default: string | undefined;
    };
    planModeOcaModelInfo: {
        default: OcaModelInfo | undefined;
    };
    planModeOcaReasoningEffort: {
        default: string | undefined;
    };
    planModeAihubmixModelId: {
        default: string | undefined;
    };
    planModeAihubmixModelInfo: {
        default: OpenAiCompatibleModelInfo | undefined;
    };
    planModeHicapModelId: {
        default: string | undefined;
    };
    planModeHicapModelInfo: {
        default: ModelInfo | undefined;
    };
    planModeNousResearchModelId: {
        default: string | undefined;
    };
    planModeVercelAiGatewayModelId: {
        default: string | undefined;
    };
    planModeVercelAiGatewayModelInfo: {
        default: ModelInfo | undefined;
    };
    actModeApiModelId: {
        default: string | undefined;
    };
    actModeThinkingBudgetTokens: {
        default: number | undefined;
    };
    geminiActModeThinkingLevel: {
        default: string | undefined;
    };
    actModeReasoningEffort: {
        default: string | undefined;
    };
    actModeVerbosity: {
        default: string | undefined;
    };
    actModeVsCodeLmModelSelector: {
        default: LanguageModelChatSelector | undefined;
    };
    actModeAwsBedrockCustomSelected: {
        default: boolean | undefined;
    };
    actModeAwsBedrockCustomModelBaseId: {
        default: string | undefined;
    };
    actModeOpenRouterModelId: {
        default: string | undefined;
    };
    actModeOpenRouterModelInfo: {
        default: ModelInfo | undefined;
    };
    actModeClineModelId: {
        default: string | undefined;
    };
    actModeClineModelInfo: {
        default: ModelInfo | undefined;
    };
    actModeOpenAiModelId: {
        default: string | undefined;
    };
    actModeOpenAiModelInfo: {
        default: OpenAiCompatibleModelInfo | undefined;
    };
    actModeOllamaModelId: {
        default: string | undefined;
    };
    actModeLmStudioModelId: {
        default: string | undefined;
    };
    actModeLiteLlmModelId: {
        default: string | undefined;
    };
    actModeLiteLlmModelInfo: {
        default: LiteLLMModelInfo | undefined;
    };
    actModeRequestyModelId: {
        default: string | undefined;
    };
    actModeRequestyModelInfo: {
        default: ModelInfo | undefined;
    };
    actModeTogetherModelId: {
        default: string | undefined;
    };
    actModeFireworksModelId: {
        default: string | undefined;
    };
    actModeSapAiCoreModelId: {
        default: string | undefined;
    };
    actModeSapAiCoreDeploymentId: {
        default: string | undefined;
    };
    actModeGroqModelId: {
        default: string | undefined;
    };
    actModeGroqModelInfo: {
        default: ModelInfo | undefined;
    };
    actModeBasetenModelId: {
        default: string | undefined;
    };
    actModeBasetenModelInfo: {
        default: ModelInfo | undefined;
    };
    actModeHuggingFaceModelId: {
        default: string | undefined;
    };
    actModeHuggingFaceModelInfo: {
        default: ModelInfo | undefined;
    };
    actModeHuaweiCloudMaasModelId: {
        default: string | undefined;
    };
    actModeHuaweiCloudMaasModelInfo: {
        default: ModelInfo | undefined;
    };
    actModeOcaModelId: {
        default: string | undefined;
    };
    actModeOcaModelInfo: {
        default: OcaModelInfo | undefined;
    };
    actModeOcaReasoningEffort: {
        default: string | undefined;
    };
    actModeAihubmixModelId: {
        default: string | undefined;
    };
    actModeAihubmixModelInfo: {
        default: OpenAiCompatibleModelInfo | undefined;
    };
    actModeHicapModelId: {
        default: string | undefined;
    };
    actModeHicapModelInfo: {
        default: ModelInfo | undefined;
    };
    actModeNousResearchModelId: {
        default: string | undefined;
    };
    actModeVercelAiGatewayModelId: {
        default: string | undefined;
    };
    actModeVercelAiGatewayModelInfo: {
        default: ModelInfo | undefined;
    };
    planModeApiProvider: {
        default: ApiProvider;
    };
    actModeApiProvider: {
        default: ApiProvider;
    };
    hicapModelId: {
        default: string | undefined;
    };
    lmStudioModelId: {
        default: string | undefined;
    };
}>>;
export declare const SETTINGS_TRANSFORMS: Record<string, (value: any) => any>;
export declare const ASYNC_PROPERTIES: Set<string>;
export declare const COMPUTED_PROPERTIES: Set<string>;
export declare const isGlobalStateKey: (key: string) => key is GlobalStateKey;
export declare const isSettingsKey: (key: string) => key is SettingsKey;
export declare const isSecretKey: (key: string) => key is SecretKey;
export declare const isLocalStateKey: (key: string) => key is LocalStateKey;
export declare const isAsyncProperty: (key: string) => boolean;
export declare const isComputedProperty: (key: string) => boolean;
export declare const getDefaultValue: <K extends GlobalStateAndSettingsKey>(key: K) => GlobalStateAndSettings[K] | undefined;
export declare const hasTransform: (key: string) => boolean;
export declare const applyTransform: <T>(key: string, value: T) => T;
export {};
//# sourceMappingURL=state-keys.d.ts.map