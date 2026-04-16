/**
 * 简化版MCP工具包装器
 * 快速集成MCP工具到EnhancedToolRegistry，不依赖完整EnhancedBaseTool
 */
/**
 * 简化MCP工具接口
 */
export interface SimpleMCPTool {
    id: string;
    name: string;
    description: string;
    version: string;
    /** 执行方法 */
    execute(params: Record<string, any>): Promise<any>;
    /** 可选：验证方法 */
    validate?(params: Record<string, any>): boolean;
    /** 可选：工具能力标签 */
    capabilities?: string[];
    /** 可选：工具配置 */
    configuration?: Record<string, any>;
}
/**
 * MCP工具包装器配置
 */
export interface MCPToolWrapperConfig {
    /** 是否启用权限检查 */
    enablePermissionCheck?: boolean;
    /** 是否启用输入验证 */
    enableValidation?: boolean;
    /** 超时时间（毫秒） */
    timeoutMs?: number;
}
/**
 * MCP工具包装器
 * 简化实现，不依赖完整EnhancedBaseTool
 */
export declare class MCPToolWrapper {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly version: string;
    private mcpTool;
    private config;
    private outputChannel;
    constructor(mcpTool: SimpleMCPTool, config?: MCPToolWrapperConfig);
    /**
     * 执行MCP工具
     */
    execute(params: Record<string, any>): Promise<any>;
    /**
     * 简化权限检查
     */
    private checkPermission;
    /**
     * 验证参数
     */
    validateParams(params: Record<string, any>): boolean;
    /**
     * 获取工具能力标签
     */
    getCapabilities(): string[];
    /**
     * 获取工具配置
     */
    getConfiguration(): Record<string, any>;
    /**
     * 转换为兼容EnhancedToolRegistry的格式
     */
    toToolRegistryFormat(): any;
    /**
     * 确定工具分类
     */
    private determineCategory;
    /**
     * 释放资源
     */
    dispose(): void;
}
/**
 * MCP工具发现服务
 */
export declare class MCPToolDiscoveryService {
    private wrappers;
    private outputChannel;
    constructor();
    /**
     * 发现并注册MCP工具
     */
    discoverAndRegisterTools(): Promise<MCPToolWrapper[]>;
    /**
     * 注册单个MCP工具
     */
    registerTool(mcpTool: SimpleMCPTool): MCPToolWrapper;
    /**
     * 获取所有已注册的MCP工具包装器
     */
    getAllWrappers(): MCPToolWrapper[];
    /**
     * 根据ID获取MCP工具包装器
     */
    getWrapperById(toolId: string): MCPToolWrapper | undefined;
    /**
     * 释放所有资源
     */
    disposeAll(): void;
}
//# sourceMappingURL=MCPToolWrapper.d.ts.map