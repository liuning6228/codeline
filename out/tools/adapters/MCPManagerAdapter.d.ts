/**
 * MCP管理器适配器
 * 将现有的 MCPManager 模块适配到统一的工具接口
 */
import { MCPResult, MCPOptions, MCPTool } from '../../mcp/mcpManager';
import { BaseToolAdapter } from './ToolAdapter';
import { ToolContext, ToolResult, PermissionResult, ValidationResult, ToolProgress } from '../ToolInterface';
/**
 * MCP工具参数类型
 */
export interface MCPToolParams {
    /** 操作类型 */
    operation: 'execute' | 'list' | 'info' | 'test';
    /** 工具ID（用于execute/info/test操作） */
    toolId?: string;
    /** 工具参数（用于execute操作） */
    params?: Record<string, any>;
    /** 搜索词（用于list操作） */
    searchTerm?: string;
    /** 测试类型 */
    testType?: 'validation' | 'execution' | 'performance';
    /** MCP选项 */
    mcpOptions?: MCPOptions;
}
/**
 * MCP工具结果类型
 */
export interface MCPToolResultData {
    /** MCP执行结果 */
    mcpResult?: MCPResult;
    /** 工具列表 */
    tools?: MCPTool[];
    /** 工具信息 */
    toolInfo?: MCPTool;
    /** 测试结果 */
    testResults?: {
        validation: boolean;
        execution: boolean;
        performance?: number;
        errors?: string[];
    };
    /** 摘要信息 */
    summary?: {
        toolCount: number;
        availableTools: number;
        testResults?: {
            passed: number;
            failed: number;
        };
    };
}
/**
 * MCP管理器适配器
 */
export declare class MCPManagerAdapter extends BaseToolAdapter<MCPToolParams, MCPToolResultData> {
    private mcpManager;
    constructor(context: ToolContext);
    /**
     * 检查权限 - MCP工具需要特别注意
     */
    checkPermissions(params: MCPToolParams, context: ToolContext): Promise<PermissionResult>;
    /**
     * 验证参数
     */
    validateParameters(params: MCPToolParams, context: ToolContext): Promise<ValidationResult>;
    /**
     * 执行MCP操作
     */
    execute(params: MCPToolParams, context: ToolContext, onProgress?: (progress: ToolProgress) => void): Promise<ToolResult<MCPToolResultData>>;
    /**
     * 执行MCP测试
     */
    private performMCPTests;
    /**
     * 检查是否为只读操作
     */
    isReadOnly(context: ToolContext): boolean;
    /**
     * 获取显示名称
     */
    getDisplayName(params?: MCPToolParams): string;
    /**
     * 获取活动描述
     */
    getActivityDescription(params: MCPToolParams): string;
    /**
     * 工厂方法：创建MCP管理器适配器
     */
    static create(context: ToolContext): MCPManagerAdapter;
}
//# sourceMappingURL=MCPManagerAdapter.d.ts.map