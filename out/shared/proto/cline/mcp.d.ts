export interface McpServer {
    name: string;
    [key: string]: any;
}
export declare const McpServer: {
    create: (data: any) => McpServer;
};
export interface McpServerStatus {
    [key: string]: any;
}
export declare const McpServerStatus: {
    create: (data: any) => McpServerStatus;
};
export interface McpResourceTemplate {
    [key: string]: any;
}
export declare const McpResourceTemplate: {
    create: (data: any) => McpResourceTemplate;
};
export interface McpTool {
    [key: string]: any;
}
export declare const McpTool: {
    create: (data: any) => McpTool;
};
export interface AddRemoteMcpServerRequest {
    [key: string]: any;
}
export declare const AddRemoteMcpServerRequest: {
    create: (data: any) => AddRemoteMcpServerRequest;
};
export interface McpServers {
    [key: string]: any;
}
export declare const McpServers: {
    create: (data: any) => McpServers;
};
export interface ToggleToolAutoApproveRequest {
    [key: string]: any;
}
export declare const ToggleToolAutoApproveRequest: {
    create: (data: any) => ToggleToolAutoApproveRequest;
};
export interface ToggleMcpServerRequest {
    [key: string]: any;
}
export declare const ToggleMcpServerRequest: {
    create: (data: any) => ToggleMcpServerRequest;
};
export interface UpdateMcpTimeoutRequest {
    [key: string]: any;
}
export declare const UpdateMcpTimeoutRequest: {
    create: (data: any) => UpdateMcpTimeoutRequest;
};
//# sourceMappingURL=mcp.d.ts.map