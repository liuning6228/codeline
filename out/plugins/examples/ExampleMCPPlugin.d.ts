/**
 * 示例MCP插件
 * 展示如何创建和使用MCP插件
 * 基于Claude Code CP-20260402-003插件模式
 */
import { Tool } from '../../tools/ToolInterface';
import { PluginMetadata, PluginContext, PluginConfigSchema, MCPPlugin } from '../PluginInterface';
/**
 * 示例MCP插件
 */
export declare class ExampleMCPPlugin implements MCPPlugin {
    readonly metadata: PluginMetadata;
    readonly configSchema: PluginConfigSchema;
    readonly dependencies?: undefined;
    private context;
    private config;
    private servers;
    private connectedServers;
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
     * 获取MCP服务器列表
     */
    getMCPServers(): Promise<Array<{
        id: string;
        name: string;
        description: string;
        version?: string;
        configuration?: Record<string, any>;
        enabled?: boolean;
        tools?: Array<{
            id: string;
            name: string;
            description: string;
        }>;
    }>>;
    /**
     * 连接MCP服务器
     */
    connectMCPServer(serverId: string, configuration?: Record<string, any>): Promise<void>;
    /**
     * 断开MCP服务器
     */
    disconnectMCPServer(serverId: string): Promise<void>;
    /**
     * 启动MCP服务器
     */
    startMCPServer(): Promise<void>;
    /**
     * 停止MCP服务器
     */
    stopMCPServer(): Promise<void>;
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
     * 初始化模拟服务器
     */
    private initializeMockServers;
    /**
     * 执行模拟MCP工具
     * 仅供内部使用
     */
    private executeMockTool;
}
//# sourceMappingURL=ExampleMCPPlugin.d.ts.map