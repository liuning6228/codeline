import { WorkspaceRoot } from "@shared/multi-root/types";
import { RemoteConfigFields } from "@shared/storage/state-keys";
import type { Environment } from "./config-types";
import { AutoApprovalSettings } from "./AutoApprovalSettings";
import { ApiConfiguration } from "./api";
import { BrowserSettings } from "./BrowserSettings";
import { ClineFeatureSetting } from "./ClineFeatureSetting";
import { BannerCardData } from "./cline/banner";
import { ClineRulesToggles } from "./cline-rules";
import { FocusChainSettings } from "./FocusChainSettings";
import { HistoryItem } from "./HistoryItem";
import { McpDisplayMode } from "./McpDisplayMode";
import { ClineMessageModelInfo } from "./messages";
type OnboardingModelGroup = any;
import { Mode } from "./storage/types";
import { TelemetrySetting } from "./TelemetrySetting";
import { UserInfo } from "./UserInfo";
export interface ExtensionMessage {
    type: "grpc_response";
    grpc_response?: GrpcResponse;
}
export type GrpcResponse = {
    message?: any;
    request_id: string;
    error?: string;
    is_streaming?: boolean;
    sequence_number?: number;
};
export type Platform = "aix" | "darwin" | "freebsd" | "linux" | "openbsd" | "sunos" | "win32" | "unknown";
export declare const DEFAULT_PLATFORM = "unknown";
export declare const COMMAND_CANCEL_TOKEN = "__cline_command_cancel__";
export interface ExtensionState {
    isNewUser: boolean;
    welcomeViewCompleted: boolean;
    onboardingModels: OnboardingModelGroup | undefined;
    apiConfiguration?: ApiConfiguration;
    autoApprovalSettings: AutoApprovalSettings;
    browserSettings: BrowserSettings;
    remoteBrowserHost?: string;
    preferredLanguage?: string;
    mode: Mode;
    checkpointManagerErrorMessage?: string;
    clineMessages: ClineMessage[];
    currentTaskItem?: HistoryItem;
    currentFocusChainChecklist?: string | null;
    mcpMarketplaceEnabled?: boolean;
    mcpDisplayMode: McpDisplayMode;
    planActSeparateModelsSetting: boolean;
    enableCheckpointsSetting?: boolean;
    platform: Platform;
    environment?: Environment;
    shouldShowAnnouncement: boolean;
    taskHistory: HistoryItem[];
    telemetrySetting: TelemetrySetting;
    shellIntegrationTimeout: number;
    terminalReuseEnabled?: boolean;
    terminalOutputLineLimit: number;
    maxConsecutiveMistakes: number;
    defaultTerminalProfile?: string;
    vscodeTerminalExecutionMode: string;
    backgroundCommandRunning?: boolean;
    backgroundCommandTaskId?: string;
    lastCompletedCommandTs?: number;
    userInfo?: UserInfo;
    version: string;
    distinctId: string;
    globalClineRulesToggles: ClineRulesToggles;
    localClineRulesToggles: ClineRulesToggles;
    localWorkflowToggles: ClineRulesToggles;
    globalWorkflowToggles: ClineRulesToggles;
    localCursorRulesToggles: ClineRulesToggles;
    localWindsurfRulesToggles: ClineRulesToggles;
    remoteRulesToggles?: ClineRulesToggles;
    remoteWorkflowToggles?: ClineRulesToggles;
    localAgentsRulesToggles: ClineRulesToggles;
    mcpResponsesCollapsed?: boolean;
    strictPlanModeEnabled?: boolean;
    yoloModeToggled?: boolean;
    useAutoCondense?: boolean;
    subagentsEnabled?: boolean;
    clineWebToolsEnabled?: ClineFeatureSetting;
    worktreesEnabled?: ClineFeatureSetting;
    focusChainSettings: FocusChainSettings;
    customPrompt?: string;
    favoritedModelIds: string[];
    workspaceRoots: WorkspaceRoot[];
    primaryRootIndex: number;
    isMultiRootWorkspace: boolean;
    multiRootSetting: ClineFeatureSetting;
    lastDismissedInfoBannerVersion: number;
    lastDismissedModelBannerVersion: number;
    lastDismissedCliBannerVersion: number;
    dismissedBanners?: Array<{
        bannerId: string;
        dismissedAt: number;
    }>;
    hooksEnabled?: boolean;
    remoteConfigSettings?: Partial<RemoteConfigFields>;
    globalSkillsToggles?: Record<string, boolean>;
    localSkillsToggles?: Record<string, boolean>;
    nativeToolCallSetting?: boolean;
    enableParallelToolCalling?: boolean;
    backgroundEditEnabled?: boolean;
    optOutOfRemoteConfig?: boolean;
    doubleCheckCompletionEnabled?: boolean;
    showFeatureTips?: boolean;
    banners?: BannerCardData[];
    welcomeBanners?: BannerCardData[];
    openAiCodexIsAuthenticated?: boolean;
}
export interface ClineMessage {
    ts: number;
    type: "ask" | "say";
    ask?: ClineAsk;
    say?: ClineSay;
    text?: string;
    reasoning?: string;
    images?: string[];
    files?: string[];
    partial?: boolean;
    commandCompleted?: boolean;
    lastCheckpointHash?: string;
    isCheckpointCheckedOut?: boolean;
    isOperationOutsideWorkspace?: boolean;
    conversationHistoryIndex?: number;
    conversationHistoryDeletedRange?: [number, number];
    modelInfo?: ClineMessageModelInfo;
}
export type ClineAsk = "followup" | "plan_mode_respond" | "act_mode_respond" | "command" | "command_output" | "completion_result" | "tool" | "api_req_failed" | "resume_task" | "resume_completed_task" | "mistake_limit_reached" | "browser_action_launch" | "use_mcp_server" | "new_task" | "condense" | "summarize_task" | "report_bug" | "use_subagents";
export type ClineSay = "task" | "error" | "error_retry" | "api_req_started" | "api_req_finished" | "text" | "reasoning" | "completion_result" | "user_feedback" | "user_feedback_diff" | "api_req_retried" | "command" | "command_output" | "tool" | "shell_integration_warning" | "shell_integration_warning_with_suggestion" | "browser_action_launch" | "browser_action" | "browser_action_result" | "mcp_server_request_started" | "mcp_server_response" | "mcp_notification" | "use_mcp_server" | "diff_error" | "deleted_api_reqs" | "clineignore_error" | "command_permission_denied" | "checkpoint_created" | "load_mcp_documentation" | "generate_explanation" | "info" | "task_progress" | "hook_status" | "hook_output_stream" | "subagent" | "use_subagents" | "subagent_usage" | "conditional_rules_applied";
export interface ClineSayTool {
    tool: "editedExistingFile" | "newFileCreated" | "fileDeleted" | "readFile" | "listFilesTopLevel" | "listFilesRecursive" | "listCodeDefinitionNames" | "searchFiles" | "webFetch" | "webSearch" | "summarizeTask" | "useSkill";
    path?: string;
    diff?: string;
    content?: string;
    regex?: string;
    filePattern?: string;
    operationIsLocatedInWorkspace?: boolean;
    /** Starting line numbers in the original file where each SEARCH block matched */
    startLineNumbers?: number[];
}
export interface ClineSayHook {
    hookName: string;
    toolName?: string;
    status: "running" | "completed" | "failed" | "cancelled";
    exitCode?: number;
    hasJsonResponse?: boolean;
    pendingToolInfo?: {
        tool: string;
        path?: string;
        command?: string;
        content?: string;
        diff?: string;
        regex?: string;
        url?: string;
        mcpTool?: string;
        mcpServer?: string;
        resourceUri?: string;
    };
    error?: {
        type: "timeout" | "validation" | "execution" | "cancellation";
        message: string;
        details?: string;
        scriptPath?: string;
    };
}
export type HookOutputStreamMeta = {
    /** Which hook configuration the script originated from (global vs workspace). */
    source: "global" | "workspace";
    /** Full path to the hook script that emitted the output. */
    scriptPath: string;
};
export declare const browserActions: readonly ["launch", "click", "type", "scroll_down", "scroll_up", "close"];
export type BrowserAction = (typeof browserActions)[number];
export interface ClineSayBrowserAction {
    action: BrowserAction;
    coordinate?: string;
    text?: string;
}
export interface ClineSayGenerateExplanation {
    title: string;
    fromRef: string;
    toRef: string;
    status: "generating" | "complete" | "error";
    error?: string;
}
export type SubagentExecutionStatus = "pending" | "running" | "completed" | "failed";
export interface SubagentStatusItem {
    index: number;
    prompt: string;
    status: SubagentExecutionStatus;
    toolCalls: number;
    inputTokens: number;
    outputTokens: number;
    totalCost: number;
    contextTokens: number;
    contextWindow: number;
    contextUsagePercentage: number;
    latestToolCall?: string;
    result?: string;
    error?: string;
}
export interface ClineSaySubagentStatus {
    status: "running" | "completed" | "failed";
    total: number;
    completed: number;
    successes: number;
    failures: number;
    toolCalls: number;
    inputTokens: number;
    outputTokens: number;
    contextWindow: number;
    maxContextTokens: number;
    maxContextUsagePercentage: number;
    items: SubagentStatusItem[];
}
export type BrowserActionResult = {
    screenshot?: string;
    logs?: string;
    currentUrl?: string;
    currentMousePosition?: string;
};
export interface ClineAskUseMcpServer {
    serverName: string;
    type: "use_mcp_tool" | "access_mcp_resource";
    toolName?: string;
    arguments?: string;
    uri?: string;
}
export interface ClineAskUseSubagents {
    prompts: string[];
}
export interface ClinePlanModeResponse {
    response: string;
    options?: string[];
    selected?: string;
}
export interface ClineAskQuestion {
    question: string;
    options?: string[];
    selected?: string;
}
export interface ClineAskNewTask {
    context: string;
}
export interface ClineApiReqInfo {
    request?: string;
    tokensIn?: number;
    tokensOut?: number;
    cacheWrites?: number;
    cacheReads?: number;
    cost?: number;
    cancelReason?: ClineApiReqCancelReason;
    streamingFailedMessage?: string;
    retryStatus?: {
        attempt: number;
        maxAttempts: number;
        delaySec: number;
        errorSnippet?: string;
    };
}
export interface ClineSubagentUsageInfo {
    source: "subagents";
    tokensIn: number;
    tokensOut: number;
    cacheWrites: number;
    cacheReads: number;
    cost: number;
}
export type ClineApiReqCancelReason = "streaming_failed" | "user_cancelled" | "retries_exhausted";
export declare const COMPLETION_RESULT_CHANGES_FLAG = "HAS_CHANGES";
export {};
//# sourceMappingURL=ExtensionMessage.d.ts.map