"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertMcpServersToProtoMcpServers = convertMcpServersToProtoMcpServers;
exports.convertProtoMcpServersToMcpServers = convertProtoMcpServersToMcpServers;
const mcp_1 = require("@shared/proto/cline/mcp");
// Helper to convert TS status to Proto enum
function convertMcpStatusToProto(status) {
    switch (status) {
        case "connected":
            return mcp_1.McpServerStatus.MCP_SERVER_STATUS_CONNECTED;
        case "connecting":
            return mcp_1.McpServerStatus.MCP_SERVER_STATUS_CONNECTING;
        case "disconnected":
            return mcp_1.McpServerStatus.MCP_SERVER_STATUS_DISCONNECTED;
    }
}
function convertMcpServersToProtoMcpServers(mcpServers) {
    const protoServers = mcpServers.map((server) => ({
        name: server.name,
        config: server.config,
        status: convertMcpStatusToProto(server.status),
        error: server.error || "",
        // Convert nested types
        tools: (server.tools || []).map(convertTool),
        resources: (server.resources || []).map(convertResource),
        resourceTemplates: (server.resourceTemplates || []).map(convertResourceTemplate),
        prompts: (server.prompts || []).map(convertPrompt),
        disabled: server.disabled,
        timeout: server.timeout,
        oauthRequired: server.oauthRequired,
        oauthAuthStatus: server.oauthAuthStatus,
    }));
    return protoServers;
}
/**
 * Converts McpTool to ProtoMcpTool format, ensuring all required fields have values
 */
function convertTool(tool) {
    const inputSchemaString = tool.inputSchema
        ? typeof tool.inputSchema === "object"
            ? JSON.stringify(tool.inputSchema)
            : tool.inputSchema
        : undefined;
    return {
        name: tool.name,
        description: tool.description,
        inputSchema: inputSchemaString,
        // autoApprove: tool.autoApprove, // Proto type doesn't have autoApprove field
    };
}
/**
 * Converts McpResource to ProtoMcpResource format, ensuring all required fields have values
 */
function convertResource(resource) {
    return {
        uri: resource.uri,
        name: resource.name,
        mimeType: resource.mimeType,
        description: resource.description,
    };
}
/**
 * Converts McpResourceTemplate to ProtoMcpResourceTemplate format, ensuring all required fields have values
 */
function convertResourceTemplate(template) {
    return {
        uriTemplate: template.uriTemplate,
        name: template.name,
        // mimeType: template.mimeType, // Proto type doesn't have mimeType field
        description: template.description,
    };
}
/**
 * Converts McpPromptArgument to ProtoMcpPromptArgument format
 */
function convertPromptArgument(arg) {
    return {
        name: arg.name,
        description: arg.description,
        required: arg.required,
    };
}
/**
 * Converts McpPrompt to ProtoMcpPrompt format
 */
function convertPrompt(prompt) {
    return {
        name: prompt.name,
        // title: prompt.title, // Proto type doesn't have title field
        description: prompt.description,
        arguments: (prompt.arguments || []).map(convertPromptArgument),
    };
}
// Helper to convert Proto enum to TS status
function convertProtoStatusToMcp(status) {
    if (status === undefined) {
        return "disconnected";
    }
    switch (status) {
        case mcp_1.McpServerStatus.MCP_SERVER_STATUS_CONNECTED:
            return "connected";
        case mcp_1.McpServerStatus.MCP_SERVER_STATUS_CONNECTING:
            return "connecting";
        case mcp_1.McpServerStatus.MCP_SERVER_STATUS_DISCONNECTED:
        default: // Includes UNSPECIFIED if it were present, maps to disconnected
            return "disconnected";
    }
}
function convertProtoMcpServersToMcpServers(protoServers) {
    const mcpServers = protoServers.map((protoServer) => {
        const server = {
            name: protoServer.name ?? "",
            config: protoServer.config || "",
            status: convertProtoStatusToMcp(protoServer.status),
            error: protoServer.error,
            // Convert nested types
            tools: (protoServer.tools || []).map(convertProtoTool),
            resources: (protoServer.resources || []).map(convertProtoResource),
            resourceTemplates: (protoServer.resourceTemplates || []).map(convertProtoResourceTemplate),
            prompts: (protoServer.prompts || []).map(convertProtoPrompt),
            disabled: protoServer.disabled,
            timeout: protoServer.timeout,
            oauthRequired: protoServer.oauthRequired,
            oauthAuthStatus: protoServer.oauthAuthStatus === "" ? undefined : protoServer.oauthAuthStatus,
        };
        return server;
    });
    return mcpServers;
}
/**
 * Converts ProtoMcpTool to McpTool format, parsing inputSchema if needed
 */
function convertProtoTool(protoTool) {
    return {
        name: protoTool.name || "",
        description: protoTool.description === "" ? undefined : protoTool.description,
        inputSchema: protoTool.inputSchema
            ? protoTool.inputSchema.startsWith("{")
                ? JSON.parse(protoTool.inputSchema)
                : protoTool.inputSchema
            : undefined,
        autoApprove: protoTool.autoApprove,
    };
}
/**
 * Converts ProtoMcpResource to McpResource format
 */
function convertProtoResource(protoResource) {
    return {
        uri: protoResource.uri || "",
        name: protoResource.name || "",
        mimeType: protoResource.mimeType === "" ? undefined : protoResource.mimeType,
        description: protoResource.description === "" ? undefined : protoResource.description,
    };
}
/**
 * Converts ProtoMcpResourceTemplate to McpResourceTemplate format
 */
function convertProtoResourceTemplate(protoTemplate) {
    return {
        uriTemplate: protoTemplate.uriTemplate || "",
        name: protoTemplate.name || "",
        mimeType: protoTemplate.mimeType === "" ? undefined : protoTemplate.mimeType,
        description: protoTemplate.description === "" ? undefined : protoTemplate.description,
    };
}
/**
 * Converts ProtoMcpPromptArgument to McpPromptArgument format
 */
function convertProtoPromptArgument(protoArg) {
    return {
        name: protoArg.name || "",
        description: protoArg.description === "" ? undefined : protoArg.description,
        required: protoArg.required,
    };
}
/**
 * Converts ProtoMcpPrompt to McpPrompt format
 */
function convertProtoPrompt(protoPrompt) {
    return {
        name: protoPrompt.name || "",
        title: protoPrompt.title === "" ? undefined : protoPrompt.title,
        description: protoPrompt.description === "" ? undefined : protoPrompt.description,
        arguments: (protoPrompt.arguments || []).map(convertProtoPromptArgument),
    };
}
//# sourceMappingURL=mcp-server-conversion.js.map