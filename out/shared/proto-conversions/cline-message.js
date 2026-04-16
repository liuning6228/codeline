"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertClineMessageToProto = convertClineMessageToProto;
exports.convertProtoToClineMessage = convertProtoToClineMessage;
const ui_1 = require("@shared/proto/cline/ui");
// Helper function to convert ClineAsk string to enum
function convertClineAskToProtoEnum(ask) {
    if (!ask) {
        return undefined;
    }
    const mapping = {
        followup: ui_1.ClineAsk.FOLLOWUP,
        plan_mode_respond: ui_1.ClineAsk.PLAN_MODE_RESPOND,
        act_mode_respond: ui_1.ClineAsk.ACT_MODE_RESPOND,
        command: ui_1.ClineAsk.COMMAND,
        command_output: ui_1.ClineAsk.COMMAND_OUTPUT,
        completion_result: ui_1.ClineAsk.COMPLETION_RESULT,
        tool: ui_1.ClineAsk.TOOL,
        api_req_failed: ui_1.ClineAsk.API_REQ_FAILED,
        resume_task: ui_1.ClineAsk.RESUME_TASK,
        resume_completed_task: ui_1.ClineAsk.RESUME_COMPLETED_TASK,
        mistake_limit_reached: ui_1.ClineAsk.MISTAKE_LIMIT_REACHED,
        browser_action_launch: ui_1.ClineAsk.BROWSER_ACTION_LAUNCH,
        use_mcp_server: ui_1.ClineAsk.USE_MCP_SERVER,
        new_task: ui_1.ClineAsk.NEW_TASK,
        condense: ui_1.ClineAsk.CONDENSE,
        summarize_task: ui_1.ClineAsk.SUMMARIZE_TASK,
        report_bug: ui_1.ClineAsk.REPORT_BUG,
        use_subagents: ui_1.ClineAsk.USE_SUBAGENTS,
    };
    const result = mapping[ask];
    if (result === undefined) {
    }
    return result;
}
// Helper function to convert ClineAsk enum to string
function convertProtoEnumToClineAsk(ask) {
    if (!ask || ask === ui_1.ClineAsk.UNRECOGNIZED) {
        return undefined;
    }
    const mapping = {
        [ui_1.ClineAsk.FOLLOWUP]: "followup",
        [ui_1.ClineAsk.PLAN_MODE_RESPOND]: "plan_mode_respond",
        [ui_1.ClineAsk.ACT_MODE_RESPOND]: "act_mode_respond",
        [ui_1.ClineAsk.COMMAND]: "command",
        [ui_1.ClineAsk.COMMAND_OUTPUT]: "command_output",
        [ui_1.ClineAsk.COMPLETION_RESULT]: "completion_result",
        [ui_1.ClineAsk.TOOL]: "tool",
        [ui_1.ClineAsk.API_REQ_FAILED]: "api_req_failed",
        [ui_1.ClineAsk.RESUME_TASK]: "resume_task",
        [ui_1.ClineAsk.RESUME_COMPLETED_TASK]: "resume_completed_task",
        [ui_1.ClineAsk.MISTAKE_LIMIT_REACHED]: "mistake_limit_reached",
        [ui_1.ClineAsk.BROWSER_ACTION_LAUNCH]: "browser_action_launch",
        [ui_1.ClineAsk.USE_MCP_SERVER]: "use_mcp_server",
        [ui_1.ClineAsk.NEW_TASK]: "new_task",
        [ui_1.ClineAsk.CONDENSE]: "condense",
        [ui_1.ClineAsk.SUMMARIZE_TASK]: "summarize_task",
        [ui_1.ClineAsk.REPORT_BUG]: "report_bug",
        [ui_1.ClineAsk.USE_SUBAGENTS]: "use_subagents",
    };
    return mapping[ask];
}
// Helper function to convert ClineSay string to enum
function convertClineSayToProtoEnum(say) {
    if (!say) {
        return undefined;
    }
    const mapping = {
        task: ui_1.ClineSay.TASK,
        error: ui_1.ClineSay.ERROR,
        api_req_started: ui_1.ClineSay.API_REQ_STARTED,
        api_req_finished: ui_1.ClineSay.API_REQ_FINISHED,
        text: ui_1.ClineSay.TEXT,
        reasoning: ui_1.ClineSay.REASONING,
        completion_result: ui_1.ClineSay.COMPLETION_RESULT_SAY,
        user_feedback: ui_1.ClineSay.USER_FEEDBACK,
        user_feedback_diff: ui_1.ClineSay.USER_FEEDBACK_DIFF,
        api_req_retried: ui_1.ClineSay.API_REQ_RETRIED,
        command: ui_1.ClineSay.COMMAND_SAY,
        command_output: ui_1.ClineSay.COMMAND_OUTPUT_SAY,
        tool: ui_1.ClineSay.TOOL_SAY,
        shell_integration_warning: ui_1.ClineSay.SHELL_INTEGRATION_WARNING,
        shell_integration_warning_with_suggestion: ui_1.ClineSay.SHELL_INTEGRATION_WARNING,
        browser_action_launch: ui_1.ClineSay.BROWSER_ACTION_LAUNCH_SAY,
        browser_action: ui_1.ClineSay.BROWSER_ACTION,
        browser_action_result: ui_1.ClineSay.BROWSER_ACTION_RESULT,
        mcp_server_request_started: ui_1.ClineSay.MCP_SERVER_REQUEST_STARTED,
        mcp_server_response: ui_1.ClineSay.MCP_SERVER_RESPONSE,
        mcp_notification: ui_1.ClineSay.MCP_NOTIFICATION,
        use_mcp_server: ui_1.ClineSay.USE_MCP_SERVER_SAY,
        diff_error: ui_1.ClineSay.DIFF_ERROR,
        deleted_api_reqs: ui_1.ClineSay.DELETED_API_REQS,
        clineignore_error: ui_1.ClineSay.CLINEIGNORE_ERROR,
        command_permission_denied: ui_1.ClineSay.COMMAND_PERMISSION_DENIED,
        checkpoint_created: ui_1.ClineSay.CHECKPOINT_CREATED,
        load_mcp_documentation: ui_1.ClineSay.LOAD_MCP_DOCUMENTATION,
        info: ui_1.ClineSay.INFO,
        task_progress: ui_1.ClineSay.TASK_PROGRESS,
        error_retry: ui_1.ClineSay.ERROR_RETRY,
        hook_status: ui_1.ClineSay.HOOK_STATUS,
        hook_output_stream: ui_1.ClineSay.HOOK_OUTPUT_STREAM,
        conditional_rules_applied: ui_1.ClineSay.CONDITIONAL_RULES_APPLIED,
        subagent: ui_1.ClineSay.SUBAGENT_STATUS,
        use_subagents: ui_1.ClineSay.USE_SUBAGENTS_SAY,
        subagent_usage: ui_1.ClineSay.SUBAGENT_USAGE,
        generate_explanation: ui_1.ClineSay.GENERATE_EXPLANATION,
    };
    const result = mapping[say];
    return result;
}
// Helper function to convert ClineSay enum to string
function convertProtoEnumToClineSay(say) {
    if (!say || say === ui_1.ClineSay.UNRECOGNIZED) {
        return undefined;
    }
    const mapping = {
        [ui_1.ClineSay.TASK]: "task",
        [ui_1.ClineSay.ERROR]: "error",
        [ui_1.ClineSay.API_REQ_STARTED]: "api_req_started",
        [ui_1.ClineSay.API_REQ_FINISHED]: "api_req_finished",
        [ui_1.ClineSay.TEXT]: "text",
        [ui_1.ClineSay.REASONING]: "reasoning",
        [ui_1.ClineSay.COMPLETION_RESULT_SAY]: "completion_result",
        [ui_1.ClineSay.USER_FEEDBACK]: "user_feedback",
        [ui_1.ClineSay.USER_FEEDBACK_DIFF]: "user_feedback_diff",
        [ui_1.ClineSay.API_REQ_RETRIED]: "api_req_retried",
        [ui_1.ClineSay.COMMAND_SAY]: "command",
        [ui_1.ClineSay.COMMAND_OUTPUT_SAY]: "command_output",
        [ui_1.ClineSay.TOOL_SAY]: "tool",
        [ui_1.ClineSay.SHELL_INTEGRATION_WARNING]: "shell_integration_warning",
        [ui_1.ClineSay.BROWSER_ACTION_LAUNCH_SAY]: "browser_action_launch",
        [ui_1.ClineSay.BROWSER_ACTION]: "browser_action",
        [ui_1.ClineSay.BROWSER_ACTION_RESULT]: "browser_action_result",
        [ui_1.ClineSay.MCP_SERVER_REQUEST_STARTED]: "mcp_server_request_started",
        [ui_1.ClineSay.MCP_SERVER_RESPONSE]: "mcp_server_response",
        [ui_1.ClineSay.MCP_NOTIFICATION]: "mcp_notification",
        [ui_1.ClineSay.USE_MCP_SERVER_SAY]: "use_mcp_server",
        [ui_1.ClineSay.DIFF_ERROR]: "diff_error",
        [ui_1.ClineSay.DELETED_API_REQS]: "deleted_api_reqs",
        [ui_1.ClineSay.CLINEIGNORE_ERROR]: "clineignore_error",
        [ui_1.ClineSay.COMMAND_PERMISSION_DENIED]: "command_permission_denied",
        [ui_1.ClineSay.CHECKPOINT_CREATED]: "checkpoint_created",
        [ui_1.ClineSay.LOAD_MCP_DOCUMENTATION]: "load_mcp_documentation",
        [ui_1.ClineSay.INFO]: "info",
        [ui_1.ClineSay.TASK_PROGRESS]: "task_progress",
        [ui_1.ClineSay.ERROR_RETRY]: "error_retry",
        [ui_1.ClineSay.GENERATE_EXPLANATION]: "generate_explanation",
        [ui_1.ClineSay.HOOK_STATUS]: "hook_status",
        [ui_1.ClineSay.HOOK_OUTPUT_STREAM]: "hook_output_stream",
        [ui_1.ClineSay.CONDITIONAL_RULES_APPLIED]: "conditional_rules_applied",
        [ui_1.ClineSay.SUBAGENT_STATUS]: "subagent",
        [ui_1.ClineSay.USE_SUBAGENTS_SAY]: "use_subagents",
        [ui_1.ClineSay.SUBAGENT_USAGE]: "subagent_usage",
    };
    return mapping[say];
}
/**
 * Convert application ClineMessage to proto ClineMessage
 */
function convertClineMessageToProto(message) {
    // For sending messages, we need to provide values for required proto fields
    const askEnum = message.ask ? convertClineAskToProtoEnum(message.ask) : undefined;
    const sayEnum = message.say ? convertClineSayToProtoEnum(message.say) : undefined;
    // Determine appropriate enum values based on message type
    let finalAskEnum = ui_1.ClineAsk.FOLLOWUP; // Proto default
    let finalSayEnum = ui_1.ClineSay.TEXT; // Proto default
    if (message.type === "ask") {
        finalAskEnum = askEnum ?? ui_1.ClineAsk.FOLLOWUP; // Use FOLLOWUP as default for ask messages
    }
    else if (message.type === "say") {
        finalSayEnum = sayEnum ?? ui_1.ClineSay.TEXT; // Use TEXT as default for say messages
    }
    const protoMessage = {
        ts: message.ts,
        type: message.type === "ask" ? ui_1.ClineMessageType.ASK : ui_1.ClineMessageType.SAY,
        ask: finalAskEnum,
        say: finalSayEnum,
        text: message.text ?? "",
        reasoning: message.reasoning ?? "",
        images: message.images ?? [],
        files: message.files ?? [],
        partial: message.partial ?? false,
        lastCheckpointHash: message.lastCheckpointHash ?? "",
        isCheckpointCheckedOut: message.isCheckpointCheckedOut ?? false,
        isOperationOutsideWorkspace: message.isOperationOutsideWorkspace ?? false,
        conversationHistoryIndex: message.conversationHistoryIndex ?? 0,
        conversationHistoryDeletedRange: message.conversationHistoryDeletedRange
            ? {
                startIndex: message.conversationHistoryDeletedRange[0],
                endIndex: message.conversationHistoryDeletedRange[1],
            }
            : undefined,
        // Additional optional fields for specific ask/say types
        sayTool: undefined,
        sayBrowserAction: undefined,
        browserActionResult: undefined,
        askUseMcpServer: undefined,
        planModeResponse: undefined,
        askQuestion: undefined,
        askNewTask: undefined,
        apiReqInfo: undefined,
        modelInfo: message.modelInfo ?? undefined,
    };
    return protoMessage;
}
/**
 * Convert proto ClineMessage to application ClineMessage
 */
function convertProtoToClineMessage(protoMessage) {
    const message = {
        ts: protoMessage.ts,
        type: protoMessage.type === ui_1.ClineMessageType.ASK ? "ask" : "say",
    };
    // Convert ask enum to string
    if (protoMessage.type === ui_1.ClineMessageType.ASK) {
        const ask = convertProtoEnumToClineAsk(protoMessage.ask);
        if (ask !== undefined) {
            message.ask = ask;
        }
    }
    // Convert say enum to string
    if (protoMessage.type === ui_1.ClineMessageType.SAY) {
        const say = convertProtoEnumToClineSay(protoMessage.say);
        if (say !== undefined) {
            message.say = say;
        }
    }
    // Convert other fields - preserve empty strings as they may be intentional
    if (protoMessage.text !== "") {
        message.text = protoMessage.text;
    }
    if (protoMessage.reasoning !== "") {
        message.reasoning = protoMessage.reasoning;
    }
    if (protoMessage.images && protoMessage.images.length > 0) {
        message.images = protoMessage.images;
    }
    if (protoMessage.files && protoMessage.files.length > 0) {
        message.files = protoMessage.files;
    }
    if (protoMessage.partial) {
        message.partial = protoMessage.partial;
    }
    if (protoMessage.lastCheckpointHash !== "") {
        message.lastCheckpointHash = protoMessage.lastCheckpointHash;
    }
    if (protoMessage.isCheckpointCheckedOut) {
        message.isCheckpointCheckedOut = protoMessage.isCheckpointCheckedOut;
    }
    if (protoMessage.isOperationOutsideWorkspace) {
        message.isOperationOutsideWorkspace = protoMessage.isOperationOutsideWorkspace;
    }
    if (protoMessage.conversationHistoryIndex !== 0) {
        message.conversationHistoryIndex = protoMessage.conversationHistoryIndex;
    }
    // Convert conversationHistoryDeletedRange from object to tuple
    if (protoMessage.conversationHistoryDeletedRange) {
        message.conversationHistoryDeletedRange = [
            protoMessage.conversationHistoryDeletedRange.startIndex,
            protoMessage.conversationHistoryDeletedRange.endIndex,
        ];
    }
    return message;
}
//# sourceMappingURL=cline-message.js.map