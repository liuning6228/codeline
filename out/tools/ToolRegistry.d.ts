/**
 * 工具注册表
 * 管理所有工具的注册、发现和生命周期
 */
import { Tool, ToolContext, ToolCategory, ToolDefinition } from './ToolInterface';
/**
 * 工具注册表配置
 */
export interface ToolRegistryConfig {
    enableCaching: boolean;
    enableLazyLoading: boolean;
    defaultCategories: ToolCategory[];
    excludeToolIds: string[];
    includeToolIds: string[];
}
/**
 * 工具注册表
 */
export declare class ToolRegistry {
    private tools;
    private toolCategories;
    private aliases;
    private initialized;
    private outputChannel;
    private config;
    constructor(config?: Partial<ToolRegistryConfig>);
    /**
     * 初始化工具注册表
     */
    initialize(): Promise<boolean>;
    /**
     * 注册工具定义
     */
    registerToolDefinition<Input = Record<string, any>, Output = any>(definition: ToolDefinition<Input, Output>, categories?: ToolCategory[]): boolean;
    /**
     * 注册工具实例
     */
    registerTool(tool: Tool, categories?: ToolCategory[]): boolean;
    /**
     * 获取工具
     */
    getTool(toolIdOrAlias: string): Tool | undefined;
    /**
     * 执行工具
     */
    executeTool(toolId: string, params: Record<string, any>, context: ToolContext, onProgress?: (progress: any) => void): Promise<any>;
    /**
     * 获取注册表状态
     */
    getStatus(): {
        initialized: boolean;
        toolCount: number;
        categoryCount: number;
        aliasCount: number;
    };
    /**
     * 注册工具别名
     */
    registerAlias(toolId: string, alias: string): boolean;
    /**
     * 获取所有工具
     */
    getAllTools(context: ToolContext, filters?: {
        categories?: ToolCategory[];
        enabledOnly?: boolean;
        searchTerm?: string;
    }): Tool[];
    /**
     * 清空注册表
     */
    clear(): void;
    /**
     * 关闭注册表
     */
    close(): Promise<void>;
}
//# sourceMappingURL=ToolRegistry.d.ts.map