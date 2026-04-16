/**
 * MCP工具适配器
 * 将MCPTool包装成EnhancedBaseTool，实现MCP协议到工具系统的集成
 */
import { EnhancedBaseTool, EnhancedToolConfig, EnhancedToolContext } from './EnhancedBaseTool';
import { ToolCategory } from './Tool';
import { ZodSchema } from './ZodCompatibility';
import { ToolUseContext, PermissionResult as NewPermissionResult, ValidationResult as NewValidationResult, ToolCapabilities } from './Tool';
/**
 * MCP工具适配器配置
 * 扩展EnhancedToolConfig以添加MCP特定配置
 */
export interface MCPToolAdapterConfig extends EnhancedToolConfig {
    /** 是否启用MCP特定权限检查 */
    enablePermissionCheck?: boolean;
    /** 默认权限级别 */
    defaultPermissionLevel?: string;
    /** 是否启用输入验证 */
    enableInputValidation?: boolean;
    /** 是否记录详细日志 */
    enableDetailedLogging?: boolean;
}
/**
 * MCP工具适配器
 * 将MCPTool实例包装成EnhancedBaseTool
 */
export declare class MCPToolAdapter<Input = Record<string, any>, Output = any> extends EnhancedBaseTool<Input, Output> {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly version: string;
    readonly author?: string;
    readonly category: ToolCategory;
    /** 是否支持MCP协议 */
    readonly supportMCP: boolean;
    private mcpTool;
    private mcpConfig;
    private outputChannel;
    constructor(mcpTool: any, // MCPTool实例
    config?: Partial<MCPToolAdapterConfig>);
    private determineCategory;
    /**
     * 获取Zod输入模式
     * 根据MCP工具的配置生成动态模式
     */
    get inputSchema(): ZodSchema<Input>;
    get capabilities(): ToolCapabilities;
    /**
     * 执行工具（新接口）
     */
    execute(input: Input, context: ToolUseContext): Promise<Output>;
    /**
     * 执行工具核心方法（实现EnhancedBaseTool抽象方法）
     */
    protected executeCore(input: Input, context: EnhancedToolContext): Promise<Output>;
    /**
     * 检查权限（新接口）
     */
    checkPermission(input: Input, context: ToolUseContext): Promise<NewPermissionResult>;
    /**
     * 验证输入（新接口）
     */
    validateInput(input: Input): Promise<NewValidationResult>;
    /**
     * 获取原始MCP工具
     */
    getMCPTool(): any;
    /**
     * 更新配置
     */
    updateConfig(newConfig: Partial<MCPToolAdapterConfig>): void;
    /**
     * 释放资源
     */
    dispose(): void;
}
//# sourceMappingURL=MCPToolAdapter.d.ts.map