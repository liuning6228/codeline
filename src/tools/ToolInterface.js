"use strict";
/**
 * 统一工具接口
 * 基于Claude Code CP-20260402-003模式，适配CodeLine架构
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolCategory = void 0;
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
    ToolCategory["OTHER"] = "other";
})(ToolCategory || (exports.ToolCategory = ToolCategory = {}));
