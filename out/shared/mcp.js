"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MIN_MCP_TIMEOUT_SECONDS = exports.DEFAULT_MCP_TIMEOUT_SECONDS = exports.CLINE_MCP_TOOL_IDENTIFIER = void 0;
/**
 * Identifier for the MCP tools that are used in native tool calls,
 * where each tool name is the combination of the server name + identifier + tool name.
 * This enables to uniquely identify which MCP server a tool belongs to.
 */
exports.CLINE_MCP_TOOL_IDENTIFIER = "0mcp0";
exports.DEFAULT_MCP_TIMEOUT_SECONDS = 60; // matches Anthropic's default timeout in their MCP SDK
exports.MIN_MCP_TIMEOUT_SECONDS = 1;
//# sourceMappingURL=mcp.js.map