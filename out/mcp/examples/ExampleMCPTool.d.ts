/**
 * 示例MCP工具
 * 用于测试MCP集成
 */
/**
 * 示例MCP工具实现
 */
export declare class ExampleMCPTool {
    readonly id = "example-mcp-tool";
    readonly name = "\u793A\u4F8BMCP\u5DE5\u5177";
    readonly description = "\u4E00\u4E2A\u7528\u4E8E\u6D4B\u8BD5MCP\u96C6\u6210\u7684\u793A\u4F8B\u5DE5\u5177";
    readonly version = "1.0.0";
    readonly author = "CodeLine Team";
    /** 工具能力 */
    readonly capabilities: string[];
    /** 工具配置 */
    readonly configuration: {
        timeout: {
            type: string;
            description: string;
            default: number;
        };
        format: {
            type: string;
            description: string;
            default: string;
        };
    };
    /**
     * 执行工具
     */
    execute(params: Record<string, any>): Promise<any>;
    /**
     * 验证参数
     */
    validate(params: Record<string, any>): boolean;
}
/**
 * 另一个示例MCP工具：文件信息工具
 */
export declare class FileInfoMCPTool {
    readonly id = "file-info-mcp-tool";
    readonly name = "\u6587\u4EF6\u4FE1\u606FMCP\u5DE5\u5177";
    readonly description = "\u83B7\u53D6\u6587\u4EF6\u4FE1\u606F\u7684\u793A\u4F8BMCP\u5DE5\u5177";
    readonly version = "1.0.0";
    readonly author = "CodeLine Team";
    /** 工具能力 */
    readonly capabilities: string[];
    /**
     * 执行工具
     */
    execute(params: Record<string, any>): Promise<any>;
    /**
     * 验证参数
     */
    validate(params: Record<string, any>): boolean;
}
/**
 * 创建示例MCP工具列表
 */
export declare function createExampleMCPTools(): any[];
/**
 * MCP工具工厂
 */
export declare class MCPToolFactory {
    /**
     * 创建所有示例MCP工具
     */
    static createAll(): any[];
    /**
     * 根据ID创建MCP工具
     */
    static createById(toolId: string): any | null;
}
//# sourceMappingURL=ExampleMCPTool.d.ts.map