/**
 * 工具插件基类
 * 提供工具插件的默认实现，简化工具插件开发
 * 基于Claude Code CP-20260402-003插件模式
 */
import { Tool, ToolContext, ToolDefinition, ToolResult, ToolProgress, ValidationResult, PermissionResult } from '../tools/ToolInterface';
import { PluginMetadata, PluginContext, PluginConfigSchema, PluginDependency, ToolPlugin as IToolPlugin } from './PluginInterface';
/**
 * 工具插件配置
 */
export interface ToolPluginConfig {
    /** 是否自动注册工具 */
    autoRegisterTools: boolean;
    /** 工具加载策略 */
    toolLoadingStrategy: 'eager' | 'lazy';
    /** 是否启用工具缓存 */
    enableToolCaching: boolean;
    /** 最大工具数量 */
    maxTools: number;
}
/**
 * 工具插件选项
 */
export interface ToolPluginOptions {
    /** 插件元数据 */
    metadata: PluginMetadata;
    /** 插件配置模式 */
    configSchema?: PluginConfigSchema;
    /** 插件依赖 */
    dependencies?: PluginDependency[];
    /** 工具插件配置 */
    toolConfig?: Partial<ToolPluginConfig>;
}
/**
 * 工具插件基类
 */
export declare abstract class ToolPlugin implements IToolPlugin {
    readonly metadata: PluginMetadata;
    readonly configSchema?: PluginConfigSchema;
    readonly dependencies?: PluginDependency[];
    protected tools: Map<string, Tool<Record<string, any>, any>>;
    protected toolDefinitions: Map<string, ToolDefinition<Record<string, any>, any>>;
    protected context: PluginContext | null;
    protected config: ToolPluginConfig;
    constructor(options: ToolPluginOptions);
    /**
     * 插件激活
     */
    activate(context: PluginContext): Promise<void>;
    /**
     * 插件停用
     */
    deactivate(): Promise<void>;
    /**
     * 获取插件提供的工具
     */
    getTools(): Tool[];
    /**
     * 获取工具定义
     */
    getToolDefinitions(): ToolDefinition[];
    /**
     * 注册工具到注册表
     */
    registerTools(registry: any): Promise<void>;
    /**
     * 从注册表卸载工具
     */
    unregisterTools(registry: any): Promise<void>;
    /**
     * 插件配置更新
     */
    updateConfig(newConfig: any): Promise<void>;
    /**
     * 插件健康检查
     */
    healthCheck(): Promise<{
        healthy: boolean;
        message?: string;
        details?: Record<string, any>;
    }>;
    /**
     * 加载工具定义
     * 子类必须实现此方法以提供工具定义
     */
    protected abstract loadToolDefinitions(): Promise<void>;
    /**
     * 创建工具实例
     * 子类可以实现此方法以自定义工具创建逻辑
     */
    protected createTools(): Promise<void>;
    /**
     * 清理工具资源
     * 子类可以实现此方法以清理工具资源
     */
    protected cleanupTools(): Promise<void>;
    /**
     * 添加工具定义
     */
    protected addToolDefinition(definition: ToolDefinition): void;
    /**
     * 添加工具
     */
    protected addTool(tool: Tool): void;
    /**
     * 从定义创建工具
     */
    protected createToolFromDefinition(definition: ToolDefinition): Tool;
    /**
     * 重新加载工具
     */
    protected reloadTools(): Promise<void>;
    /**
     * 默认权限检查方法
     */
    protected defaultCheckPermissions(params: any, context: ToolContext): Promise<PermissionResult>;
    /**
     * 默认参数验证方法
     */
    protected defaultValidateParameters(params: any, context: ToolContext): Promise<ValidationResult>;
    /**
     * 创建默认工具结果
     */
    protected createToolResult<T = any>(success: boolean, options: {
        output?: T;
        error?: string;
        toolId: string;
        duration: number;
        metadata?: Record<string, any>;
    }): ToolResult<T>;
    /**
     * 创建工具进度
     */
    protected createToolProgress(type: string, progress: number, message?: string, data?: Record<string, any>): ToolProgress;
    /**
     * 获取插件上下文
     */
    protected getPluginContext(): PluginContext;
    /**
     * 获取全局上下文
     */
    protected getGlobalContext(): ToolContext;
}
//# sourceMappingURL=ToolPlugin.d.ts.map