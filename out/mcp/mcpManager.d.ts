export interface MCPTool {
    id: string;
    name: string;
    description: string;
    version: string;
    author?: string;
    capabilities: string[];
    execute?(params: Record<string, any>): Promise<any>;
    validate?(params: Record<string, any>): boolean;
    configuration?: Record<string, any>;
}
export interface MCPResult {
    success: boolean;
    output: any;
    error?: string;
    toolId: string;
    duration: number;
    timestamp: Date;
}
export interface MCPOptions {
    timeout?: number;
    validateParams?: boolean;
    retryOnFailure?: boolean;
    maxRetries?: number;
}
export declare class MCPManager {
    private tools;
    private outputChannel;
    private isInitialized;
    constructor();
    /**
     * 初始化MCP管理器
     */
    initialize(): Promise<boolean>;
    /**
     * 注册MCP工具
     */
    registerTool(tool: MCPTool): boolean;
    /**
     * 执行MCP工具
     */
    executeTool(toolId: string, params?: Record<string, any>, options?: MCPOptions): Promise<MCPResult>;
    /**
     * 批量执行工具
     */
    executeTools(toolExecutions: Array<{
        toolId: string;
        params?: Record<string, any>;
    }>, options?: MCPOptions): Promise<MCPResult[]>;
    /**
     * 获取所有可用工具
     */
    getAvailableTools(): MCPTool[];
    /**
     * 根据描述查找相关工具
     */
    findToolsByDescription(description: string): MCPTool[];
    /**
     * 生成工具执行的HTML报告
     */
    generateHtmlReport(result: MCPResult, tool?: MCPTool): string;
    private registerBuiltinTools;
    /**
     * 关闭MCP管理器
     */
    close(): Promise<void>;
    /**
     * 获取管理器状态
     */
    getStatus(): {
        initialized: boolean;
        toolCount: number;
        outputChannel: boolean;
    };
    private escapeHtml;
}
//# sourceMappingURL=mcpManager.d.ts.map