"use strict";
/**
 * 核心类型定义
 * 集成 Claude-Code、Cline 和 CodeLine 的类型系统
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppEvent = exports.ToolExecutionState = exports.ToolCapability = exports.ToolCategory = void 0;
// ========== 基础类型 ==========
/**
 * 工具类别
 */
var ToolCategory;
(function (ToolCategory) {
    ToolCategory["FILE"] = "file";
    ToolCategory["TERMINAL"] = "terminal";
    ToolCategory["BROWSER"] = "browser";
    ToolCategory["MCP"] = "mcp";
    ToolCategory["UTILITY"] = "utility";
    ToolCategory["AI"] = "ai";
    ToolCategory["DEVELOPMENT"] = "development";
    ToolCategory["CODE"] = "code";
    ToolCategory["GIT"] = "git";
    ToolCategory["SEARCH"] = "search";
    ToolCategory["WEB"] = "web";
    ToolCategory["OTHER"] = "other";
})(ToolCategory || (exports.ToolCategory = ToolCategory = {}));
/**
 * 工具能力
 */
var ToolCapability;
(function (ToolCapability) {
    ToolCapability["READ"] = "read";
    ToolCapability["WRITE"] = "write";
    ToolCapability["EXECUTE"] = "execute";
    ToolCapability["NETWORK"] = "network";
    ToolCapability["FILESYSTEM"] = "filesystem";
    ToolCapability["PROCESS"] = "process";
    ToolCapability["UI"] = "ui";
    ToolCapability["AI"] = "ai";
    ToolCapability["DATABASE"] = "database";
    ToolCapability["CACHE"] = "cache";
})(ToolCapability || (exports.ToolCapability = ToolCapability = {}));
// ========== 状态管理类型 ==========
/**
 * 工具执行状态
 */
var ToolExecutionState;
(function (ToolExecutionState) {
    ToolExecutionState["PENDING"] = "pending";
    ToolExecutionState["RUNNING"] = "running";
    ToolExecutionState["PAUSED"] = "paused";
    ToolExecutionState["CANCELLED"] = "cancelled";
    ToolExecutionState["COMPLETED"] = "completed";
    ToolExecutionState["FAILED"] = "failed";
    ToolExecutionState["TIMEOUT"] = "timeout";
})(ToolExecutionState || (exports.ToolExecutionState = ToolExecutionState = {}));
// ========== 事件类型 ==========
/**
 * 应用程序事件
 */
var AppEvent;
(function (AppEvent) {
    AppEvent["TOOL_EXECUTION_START"] = "tool:execution:start";
    AppEvent["TOOL_EXECUTION_PROGRESS"] = "tool:execution:progress";
    AppEvent["TOOL_EXECUTION_COMPLETE"] = "tool:execution:complete";
    AppEvent["TOOL_EXECUTION_ERROR"] = "tool:execution:error";
    AppEvent["TOOL_EXECUTION_CANCELLED"] = "tool:execution:cancelled";
    AppEvent["FILE_CHANGED"] = "file:changed";
    AppEvent["SETTINGS_CHANGED"] = "settings:changed";
    AppEvent["USER_LOGGED_IN"] = "user:logged:in";
    AppEvent["USER_LOGGED_OUT"] = "user:logged:out";
})(AppEvent || (exports.AppEvent = AppEvent = {}));
//# sourceMappingURL=index.js.map