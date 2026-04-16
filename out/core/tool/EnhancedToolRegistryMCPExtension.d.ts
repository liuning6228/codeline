/**
 * EnhancedToolRegistry的MCP扩展
 * 为EnhancedToolRegistry添加MCP工具支持
 */
import { EnhancedToolRegistry } from './EnhancedToolRegistry';
import { MCPToolWrapper, SimpleMCPTool } from './MCPToolWrapper';
/**
 * EnhancedToolRegistry的MCP扩展
 */
export declare class EnhancedToolRegistryMCPExtension {
    private registry;
    private discoveryService;
    private outputChannel;
    /** 是否已初始化 */
    private isInitialized;
    /** 已注册的MCP工具映射 */
    private mcpTools;
    constructor(registry: EnhancedToolRegistry);
    /**
     * 初始化MCP扩展
     */
    initialize(): Promise<boolean>;
    /**
     * 注册MCP工具到EnhancedToolRegistry
     */
    private registerMCPToolToRegistry;
    /**
     * 将MCP工具包装器转换为Tool对象
     */
    private convertToTool;
    /**
     * 确定MCP工具的分类
     */
    private determineCategory;
    /**
     * 转换MCP工具能力为ToolCapabilities格式
     */
    private convertCapabilities;
    /**
     * 手动注册MCP工具
     */
    registerMCPTool(mcpTool: SimpleMCPTool): Promise<boolean>;
    /**
     * 获取所有已注册的MCP工具
     */
    getAllMCPTools(): MCPToolWrapper[];
    /**
     * 根据ID获取MCP工具
     */
    getMCPToolById(toolId: string): MCPToolWrapper | undefined;
    /**
     * 检查工具是否为MCP工具
     */
    isMCPTool(toolId: string): boolean;
    /**
     * 执行MCP工具
     */
    executeMCPTool(toolId: string, params?: Record<string, any>): Promise<any>;
    /**
     * 重新发现MCP工具
     */
    rediscoverTools(): Promise<MCPToolWrapper[]>;
    /**
     * 获取MCP工具统计信息
     */
    getStatistics(): {
        totalMCPTools: number;
        initialized: boolean;
        toolIds: string[];
    };
    /**
     * 释放资源
     */
    dispose(): void;
}
//# sourceMappingURL=EnhancedToolRegistryMCPExtension.d.ts.map