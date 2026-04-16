"use strict";
// Temporary implementation for Cline UI proto types
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClineApiReqCancelReason = exports.McpServerRequestType = exports.BrowserAction = exports.ClineSayToolType = exports.ClineSay = exports.ClineAsk = exports.ClineMessageType = void 0;
// Enum for ClineMessage type
var ClineMessageType;
(function (ClineMessageType) {
    ClineMessageType[ClineMessageType["ASK"] = 0] = "ASK";
    ClineMessageType[ClineMessageType["SAY"] = 1] = "SAY";
})(ClineMessageType || (exports.ClineMessageType = ClineMessageType = {}));
// Enum for ClineAsk types
var ClineAsk;
(function (ClineAsk) {
    ClineAsk[ClineAsk["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
    ClineAsk[ClineAsk["FOLLOWUP"] = 0] = "FOLLOWUP";
    ClineAsk[ClineAsk["PLAN_MODE_RESPOND"] = 1] = "PLAN_MODE_RESPOND";
    ClineAsk[ClineAsk["COMMAND"] = 2] = "COMMAND";
    ClineAsk[ClineAsk["COMMAND_OUTPUT"] = 3] = "COMMAND_OUTPUT";
    ClineAsk[ClineAsk["COMPLETION_RESULT"] = 4] = "COMPLETION_RESULT";
    ClineAsk[ClineAsk["TOOL"] = 5] = "TOOL";
    ClineAsk[ClineAsk["API_REQ_FAILED"] = 6] = "API_REQ_FAILED";
    ClineAsk[ClineAsk["RESUME_TASK"] = 7] = "RESUME_TASK";
    ClineAsk[ClineAsk["RESUME_COMPLETED_TASK"] = 8] = "RESUME_COMPLETED_TASK";
    ClineAsk[ClineAsk["MISTAKE_LIMIT_REACHED"] = 9] = "MISTAKE_LIMIT_REACHED";
    ClineAsk[ClineAsk["BROWSER_ACTION_LAUNCH"] = 10] = "BROWSER_ACTION_LAUNCH";
    ClineAsk[ClineAsk["USE_MCP_SERVER"] = 11] = "USE_MCP_SERVER";
    ClineAsk[ClineAsk["NEW_TASK"] = 12] = "NEW_TASK";
    ClineAsk[ClineAsk["CONDENSE"] = 13] = "CONDENSE";
    ClineAsk[ClineAsk["REPORT_BUG"] = 14] = "REPORT_BUG";
    ClineAsk[ClineAsk["SUMMARIZE_TASK"] = 15] = "SUMMARIZE_TASK";
    ClineAsk[ClineAsk["ACT_MODE_RESPOND"] = 16] = "ACT_MODE_RESPOND";
    ClineAsk[ClineAsk["USE_SUBAGENTS"] = 17] = "USE_SUBAGENTS";
})(ClineAsk || (exports.ClineAsk = ClineAsk = {}));
// Enum for ClineSay types
var ClineSay;
(function (ClineSay) {
    ClineSay[ClineSay["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
    ClineSay[ClineSay["TASK"] = 0] = "TASK";
    ClineSay[ClineSay["ERROR"] = 1] = "ERROR";
    ClineSay[ClineSay["API_REQ_STARTED"] = 2] = "API_REQ_STARTED";
    ClineSay[ClineSay["API_REQ_FINISHED"] = 3] = "API_REQ_FINISHED";
    ClineSay[ClineSay["TEXT"] = 4] = "TEXT";
    ClineSay[ClineSay["REASONING"] = 5] = "REASONING";
    ClineSay[ClineSay["COMPLETION_RESULT_SAY"] = 6] = "COMPLETION_RESULT_SAY";
    ClineSay[ClineSay["USER_FEEDBACK"] = 7] = "USER_FEEDBACK";
    ClineSay[ClineSay["USER_FEEDBACK_DIFF"] = 8] = "USER_FEEDBACK_DIFF";
    ClineSay[ClineSay["API_REQ_RETRIED"] = 9] = "API_REQ_RETRIED";
    ClineSay[ClineSay["COMMAND_SAY"] = 10] = "COMMAND_SAY";
    ClineSay[ClineSay["COMMAND_OUTPUT_SAY"] = 11] = "COMMAND_OUTPUT_SAY";
    ClineSay[ClineSay["TOOL_SAY"] = 12] = "TOOL_SAY";
    ClineSay[ClineSay["SHELL_INTEGRATION_WARNING"] = 13] = "SHELL_INTEGRATION_WARNING";
    ClineSay[ClineSay["BROWSER_ACTION_LAUNCH_SAY"] = 14] = "BROWSER_ACTION_LAUNCH_SAY";
    ClineSay[ClineSay["BROWSER_ACTION"] = 15] = "BROWSER_ACTION";
    ClineSay[ClineSay["BROWSER_ACTION_RESULT"] = 16] = "BROWSER_ACTION_RESULT";
    ClineSay[ClineSay["MCP_SERVER_REQUEST_STARTED"] = 17] = "MCP_SERVER_REQUEST_STARTED";
    ClineSay[ClineSay["MCP_SERVER_RESPONSE"] = 18] = "MCP_SERVER_RESPONSE";
    ClineSay[ClineSay["MCP_NOTIFICATION"] = 19] = "MCP_NOTIFICATION";
    ClineSay[ClineSay["USE_MCP_SERVER_SAY"] = 20] = "USE_MCP_SERVER_SAY";
    ClineSay[ClineSay["DIFF_ERROR"] = 21] = "DIFF_ERROR";
    ClineSay[ClineSay["DELETED_API_REQS"] = 22] = "DELETED_API_REQS";
    ClineSay[ClineSay["CLINEIGNORE_ERROR"] = 23] = "CLINEIGNORE_ERROR";
    ClineSay[ClineSay["CHECKPOINT_CREATED"] = 24] = "CHECKPOINT_CREATED";
    ClineSay[ClineSay["LOAD_MCP_DOCUMENTATION"] = 25] = "LOAD_MCP_DOCUMENTATION";
    ClineSay[ClineSay["INFO"] = 26] = "INFO";
    ClineSay[ClineSay["TASK_PROGRESS"] = 27] = "TASK_PROGRESS";
    ClineSay[ClineSay["ERROR_RETRY"] = 28] = "ERROR_RETRY";
    ClineSay[ClineSay["GENERATE_EXPLANATION"] = 29] = "GENERATE_EXPLANATION";
    ClineSay[ClineSay["HOOK_STATUS"] = 30] = "HOOK_STATUS";
    ClineSay[ClineSay["HOOK_OUTPUT_STREAM"] = 31] = "HOOK_OUTPUT_STREAM";
    ClineSay[ClineSay["COMMAND_PERMISSION_DENIED"] = 32] = "COMMAND_PERMISSION_DENIED";
    ClineSay[ClineSay["CONDITIONAL_RULES_APPLIED"] = 33] = "CONDITIONAL_RULES_APPLIED";
    ClineSay[ClineSay["SUBAGENT_STATUS"] = 34] = "SUBAGENT_STATUS";
    ClineSay[ClineSay["USE_SUBAGENTS_SAY"] = 35] = "USE_SUBAGENTS_SAY";
    ClineSay[ClineSay["SUBAGENT_USAGE"] = 36] = "SUBAGENT_USAGE";
})(ClineSay || (exports.ClineSay = ClineSay = {}));
// Enum for ClineSayTool tool types
var ClineSayToolType;
(function (ClineSayToolType) {
    ClineSayToolType[ClineSayToolType["EDITED_EXISTING_FILE"] = 0] = "EDITED_EXISTING_FILE";
    ClineSayToolType[ClineSayToolType["NEW_FILE_CREATED"] = 1] = "NEW_FILE_CREATED";
    ClineSayToolType[ClineSayToolType["READ_FILE"] = 2] = "READ_FILE";
    ClineSayToolType[ClineSayToolType["LIST_FILES_TOP_LEVEL"] = 3] = "LIST_FILES_TOP_LEVEL";
    ClineSayToolType[ClineSayToolType["LIST_FILES_RECURSIVE"] = 4] = "LIST_FILES_RECURSIVE";
    ClineSayToolType[ClineSayToolType["LIST_CODE_DEFINITION_NAMES"] = 5] = "LIST_CODE_DEFINITION_NAMES";
    ClineSayToolType[ClineSayToolType["SEARCH_FILES"] = 6] = "SEARCH_FILES";
    ClineSayToolType[ClineSayToolType["WEB_FETCH"] = 7] = "WEB_FETCH";
    ClineSayToolType[ClineSayToolType["FILE_DELETED"] = 8] = "FILE_DELETED";
})(ClineSayToolType || (exports.ClineSayToolType = ClineSayToolType = {}));
// Enum for browser actions
var BrowserAction;
(function (BrowserAction) {
    BrowserAction[BrowserAction["LAUNCH"] = 0] = "LAUNCH";
    BrowserAction[BrowserAction["CLICK"] = 1] = "CLICK";
    BrowserAction[BrowserAction["TYPE"] = 2] = "TYPE";
    BrowserAction[BrowserAction["SCROLL_DOWN"] = 3] = "SCROLL_DOWN";
    BrowserAction[BrowserAction["SCROLL_UP"] = 4] = "SCROLL_UP";
    BrowserAction[BrowserAction["CLOSE"] = 5] = "CLOSE";
})(BrowserAction || (exports.BrowserAction = BrowserAction = {}));
// Enum for MCP server request types
var McpServerRequestType;
(function (McpServerRequestType) {
    McpServerRequestType[McpServerRequestType["USE_MCP_TOOL"] = 0] = "USE_MCP_TOOL";
    McpServerRequestType[McpServerRequestType["ACCESS_MCP_RESOURCE"] = 1] = "ACCESS_MCP_RESOURCE";
})(McpServerRequestType || (exports.McpServerRequestType = McpServerRequestType = {}));
// Enum for API request cancel reasons
var ClineApiReqCancelReason;
(function (ClineApiReqCancelReason) {
    ClineApiReqCancelReason[ClineApiReqCancelReason["STREAMING_FAILED"] = 0] = "STREAMING_FAILED";
    ClineApiReqCancelReason[ClineApiReqCancelReason["USER_CANCELLED"] = 1] = "USER_CANCELLED";
    ClineApiReqCancelReason[ClineApiReqCancelReason["RETRIES_EXHAUSTED"] = 2] = "RETRIES_EXHAUSTED";
})(ClineApiReqCancelReason || (exports.ClineApiReqCancelReason = ClineApiReqCancelReason = {}));
//# sourceMappingURL=ui.js.map