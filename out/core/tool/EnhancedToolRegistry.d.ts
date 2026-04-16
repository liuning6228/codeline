/**
 * 增强工具注册表
 * 集成claude-code-haha-main的工具管理能力，支持流式执行和权限控制
 *
 * Zod兼容性更新（2026-04-08）：使用真正的Zod库
 */
import { Tool, ToolDefinition, ToolUseContext, ToolCategory, ToolProgress } from './Tool';
/**
 * 工具注册表配置
 */
export interface ToolRegistryConfig {
    enableCaching: boolean;
    enableLazyLoading: boolean;
    defaultCategories: ToolCategory[];
    excludeToolIds: string[];
    includeToolIds: string[];
    maxConcurrentTools: number;
    defaultTimeout: number;
}
/**
 * 工具执行结果
 */
export interface ToolExecutionResult {
    toolId: string;
    executionId: string;
    success: boolean;
    result?: any;
    error?: Error;
    duration: number;
    timestamp: Date;
}
/**
 * 工具使用统计
 */
export interface ToolUsageStats {
    toolId: string;
    usageCount: number;
    lastUsed: Date | null;
    successCount: number;
    failureCount: number;
    averageDuration: number;
}
/**
 * 增强工具注册表
 * 支持工具发现、生命周期管理、流式执行和权限控制
 */
export declare class EnhancedToolRegistry {
    private tools;
    private toolCategories;
    private toolAliases;
    private initialized;
    private outputChannel;
    private config;
    private streamingExecutor;
    private executionResults;
    private usageStats;
    private toolProgressService;
    constructor(config?: Partial<ToolRegistryConfig>);
    /**
     * 初始化工具注册表
     */
    initialize(): Promise<boolean>;
    /**
     * 注册工具
     */
    registerTool(tool: Tool, categories?: ToolCategory[]): boolean;
    /**
     * 检查工具是否已注册
     */
    hasTool(toolId: string): boolean;
    /**
     * 取消注册工具
     */
    unregisterTool(toolId: string): boolean;
    /**
     * 注册工具定义
     */
    registerToolDefinition<Input = any, Output = any>(definition: ToolDefinition<Input, Output>, categories?: ToolCategory[]): boolean;
    /**
     * 注册工具别名
     */
    registerToolAlias(alias: string, toolId: string): boolean;
    /**
     * 获取工具
     */
    getTool(toolId: string): Tool | undefined;
    /**
     * 获取所有工具
     */
    getAllTools(): Tool[];
    /**
     * 按类别获取工具
     */
    getToolsByCategory(category: ToolCategory): Tool[];
    /**
     * 获取所有类别
     */
    getAllCategories(): ToolCategory[];
    /**
     * 执行工具（流式）
     */
    executeToolStreaming(toolId: string, input: any, context: ToolUseContext): Promise<{
        executionId: string;
        stream: AsyncIterable<ToolProgress>;
        result: Promise<any>;
    }>;
    /**
     * 执行工具（同步）
     */
    executeTool(toolId: string, input: any, context: ToolUseContext): Promise<any>;
    /**
     * 批量执行工具
     */
    executeToolsBatch(toolExecutions: Array<{
        toolId: string;
        input: any;
    }>, context: ToolUseContext): Promise<Array<{
        toolId: string;
        result?: any;
        error?: Error;
    }>>;
    /**
     * 取消工具执行
     */
    cancelToolExecution(executionId: string): Promise<boolean>;
    /**
     * 获取工具执行状态
     */
    getToolExecutionStatus(executionId: string): {
        status: 'queued' | 'executing' | 'completed' | 'failed' | 'cancelled';
        progress: ToolProgress[];
        startTime?: Date;
        endTime?: Date;
    };
    /**
     * 获取工具使用统计
     */
    getToolUsageStats(toolId?: string): ToolUsageStats | ToolUsageStats[];
    /**
     * 获取执行统计
     */
    getExecutionStats(): {
        activeExecutions: number;
        queuedExecutions: number;
        completedExecutions: number;
        failedExecutions: number;
        totalExecutions: number;
        averageExecutionTime: number;
    };
    /**
     * 清理资源
     */
    cleanup(): Promise<void>;
    /**
     * 加载内置工具
     */
    private loadBuiltinTools;
    /**
     * 加载用户工具
     */
    private loadUserTools;
    /**
     * 加载工具配置
     */
    private loadToolConfigs;
    /**
     * 创建进度流（简化实现）
     */
    private createProgressStream;
    /**
     * 处理工具进度
     */
    private handleToolProgress;
    /**
     * 处理工具完成
     */
    private handleToolComplete;
    /**
     * 更新使用统计
     */
    private updateUsageStats;
    /**
     * 查找工具（按名称）
     */
    findToolByName(name: string): Tool | undefined;
    /**
     * 查找工具（按类别）
     */
    findToolsByCategory(category: ToolCategory): Tool[];
}
//# sourceMappingURL=EnhancedToolRegistry.d.ts.map