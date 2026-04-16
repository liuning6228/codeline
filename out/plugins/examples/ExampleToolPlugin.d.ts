/**
 * 示例工具插件
 * 展示如何创建和使用工具插件
 * 基于Claude Code CP-20260402-003插件模式
 */
import { Tool } from '../../tools/ToolInterface';
import { ToolPlugin, PluginMetadata, PluginContext, PluginConfigSchema } from '../PluginInterface';
/**
 * 示例工具插件
 */
export declare class ExampleToolPlugin implements ToolPlugin {
    readonly metadata: PluginMetadata;
    readonly configSchema: PluginConfigSchema;
    readonly dependencies?: undefined;
    private tools;
    private context;
    private config;
    constructor();
    /**
     * 插件激活
     */
    activate(context: PluginContext): Promise<void>;
    /**
     * 插件停用
     */
    deactivate(): Promise<void>;
    /**
     * 获取工具
     */
    getTools(): Tool[];
    /**
     * 获取工具定义
     */
    getToolDefinitions(): any[];
    /**
     * 注册工具
     */
    registerTools(registry: any): Promise<void>;
    /**
     * 卸载工具
     */
    unregisterTools(registry: any): Promise<void>;
    /**
     * 配置更新
     */
    updateConfig(newConfig: any): Promise<void>;
    /**
     * 健康检查
     */
    healthCheck(): Promise<{
        healthy: boolean;
        message?: string;
        details?: Record<string, any>;
    }>;
    /**
     * 创建工具
     */
    private createTools;
    /**
     * 重新创建工具
     */
    private recreateTools;
    /**
     * 创建问候工具
     */
    private createGreetingTool;
    /**
     * 创建计算工具
     */
    private createCalculatorTool;
}
//# sourceMappingURL=ExampleToolPlugin.d.ts.map