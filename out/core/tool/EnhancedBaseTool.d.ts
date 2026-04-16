/**
 * 增强基础工具类
 * 实现双接口兼容：同时支持ZodSchema（新接口）和parameterSchema（旧接口）
 *
 * 设计目标：
 * 1. 保持向后兼容性 - 现有BaseTool子类无需修改
 * 2. 支持完整Zod功能 - 新工具可以使用完整的Zod验证
 * 3. 渐进式迁移 - 可以逐步从旧接口迁移到新接口
 * 4. 集成Claude Code架构特性 - 为权限控制、MCP支持等做好准备
 */
import { Tool as NewTool, ToolUseContext, ToolCategory, PermissionResult as NewPermissionResult, ValidationResult as NewValidationResult, ToolCapabilities } from './Tool';
import { Tool as OldTool, ToolContext, ToolResult, ValidationResult as OldValidationResult, PermissionResult as OldPermissionResult, ToolProgress as OldToolProgress } from '../../tools/ToolInterface';
import { ZodSchema } from './ZodCompatibility';
/**
 * 类型适配器：将新旧接口类型进行转换
 */
export declare namespace TypeAdapter {
    /**
     * 将旧接口的ValidationResult转换为新接口的ValidationResult
     */
    function adaptValidationResult(oldResult: OldValidationResult): NewValidationResult;
    /**
     * 将新接口的ValidationResult转换为旧接口的ValidationResult
     */
    function adaptValidationResultToOld(newResult: NewValidationResult): OldValidationResult;
    /**
     * 将旧接口的PermissionResult转换为新接口的PermissionResult
     */
    function adaptPermissionResult(oldResult: OldPermissionResult): NewPermissionResult;
    /**
     * 将新接口的PermissionResult转换为旧接口的PermissionResult
     */
    function adaptPermissionResultToOld(newResult: NewPermissionResult): OldPermissionResult;
    /**
     * 将字符串数组能力转换为ToolCapabilities对象
     */
    function adaptCapabilities(capabilities: string[]): ToolCapabilities;
    /**
     * 将ToolCapabilities对象转换为字符串数组
     */
    function adaptCapabilitiesToStrings(capabilities: ToolCapabilities): string[];
    /**
     * 将旧接口的ToolContext转换为新接口的ToolUseContext
     */
    function adaptToolContextToNew(context: ToolContext): ToolUseContext;
    /**
     * 将新接口的ToolUseContext转换为旧接口的ToolContext
     */
    function adaptToolContextToOld(context: ToolUseContext): ToolContext;
    /**
     * 将旧接口的parameterSchema转换为Zod schema
     */
    function adaptParameterSchemaToZod(parameterSchema?: Record<string, {
        type: string;
        description: string;
        required?: boolean;
        default?: any;
        validation?: (value: any) => boolean;
        enum?: any[];
    }>): ZodSchema<any> | undefined;
}
/**
 * 增强工具配置
 */
export interface EnhancedToolConfig {
    /** 是否启用Zod验证（默认：true） */
    enableZodValidation?: boolean;
    /** 是否保持旧接口兼容（默认：true） */
    maintainLegacyCompatibility?: boolean;
    /** 权限检查级别 */
    permissionLevel?: 'none' | 'basic' | 'strict';
    /** 是否支持MCP协议 */
    supportMCP?: boolean;
    /** 默认执行超时（毫秒） */
    defaultTimeout?: number;
}
/**
 * 增强工具上下文
 * 同时包含新旧接口的上下文信息
 */
export interface EnhancedToolContext extends ToolContext {
    /** 新接口的工具使用上下文 */
    newToolUseContext?: ToolUseContext;
    /** 旧接口的扩展上下文 */
    oldExtendedContext?: any;
    /** 权限检查结果 */
    permissionResult?: NewPermissionResult;
    /** Zod验证结果 */
    validationResult?: {
        success: boolean;
        data?: any;
        error?: any;
    };
}
/**
 * 抽象增强基础工具类
 * 同时实现新旧工具接口
 */
export declare abstract class EnhancedBaseTool<Input = Record<string, any>, Output = any> {
    /** 工具唯一标识符 */
    abstract readonly id: string;
    /** 工具名称 */
    abstract readonly name: string;
    /** 工具描述 */
    abstract readonly description: string;
    /** 工具版本 */
    abstract readonly version: string;
    /** 作者信息 */
    abstract readonly author?: string;
    /** 工具分类 */
    abstract readonly category: ToolCategory;
    /** Zod输入模式（新接口） */
    get inputSchema(): ZodSchema<Input>;
    /** 工具能力（新接口格式） */
    get capabilities(): ToolCapabilities;
    /** 参数模式（旧接口） */
    get parameterSchema(): Record<string, {
        type: string;
        description: string;
        required?: boolean;
        default?: any;
        validation?: (value: any) => boolean;
        enum?: any[];
    }> | undefined;
    /** 工具能力数组（旧接口格式） */
    get capabilitiesArray(): string[];
    /** 工具配置 */
    protected config: EnhancedToolConfig;
    /** 执行状态跟踪 */
    private executions;
    /**
     * 构造函数
     */
    constructor(config?: Partial<EnhancedToolConfig>);
    /**
     * 执行工具（核心方法）
     */
    protected abstract executeCore(input: Input, context: EnhancedToolContext): Promise<Output>;
    /**
     * 检查工具是否可用（新接口）
     */
    isEnabled(context: ToolUseContext): boolean | Promise<boolean>;
    /**
     * 检查并发安全性（新接口）
     */
    isConcurrencySafe(input: Input, context: ToolUseContext): boolean | Promise<boolean>;
    /**
     * 检查权限（新接口）
     */
    checkPermissions(input: Input, context: ToolUseContext): Promise<NewPermissionResult>;
    /**
     * 验证参数（新接口）
     */
    validateParameters(input: Input, context: ToolUseContext): Promise<NewValidationResult>;
    /**
     * 执行工具（新接口）
     */
    execute(input: Input, context: ToolUseContext): Promise<Output>;
    /**
     * 是否启用（旧接口）
     */
    isEnabledForOld(context: ToolContext): boolean;
    /**
     * 是否支持并发执行（旧接口）
     */
    isConcurrencySafeForOld(context: ToolContext): boolean;
    /**
     * 是否是只读操作（旧接口）
     */
    isReadOnlyForOld?(context: ToolContext): boolean;
    /**
     * 是否是破坏性操作（旧接口）
     */
    isDestructiveForOld?(context: ToolContext): boolean;
    /**
     * 权限检查（旧接口）
     */
    checkPermissionsForOld(params: Input, context: ToolContext): Promise<OldPermissionResult>;
    /**
     * 参数验证（旧接口）
     */
    validateParametersForOld(params: Input, context: ToolContext): Promise<OldValidationResult>;
    /**
     * 工具执行方法（旧接口）
     */
    executeForOld(params: Input, context: ToolContext, onProgress?: (progress: OldToolProgress) => void): Promise<ToolResult<Output>>;
    /**
     * 检查权限（新接口默认实现）
     * 使用Claude Code三层权限系统
     */
    protected checkPermissionsForNew(input: Input, context: EnhancedToolContext): Promise<NewPermissionResult>;
    /**
     * 验证参数（新接口默认实现）
     */
    protected validateParametersForNew(input: Input, context: EnhancedToolContext): Promise<NewValidationResult>;
    /**
     * 获取默认输入schema
     */
    protected getDefaultInputSchema(): ZodSchema<Input>;
    /**
     * 从Zod schema生成parameterSchema
     */
    private generateParameterSchemaFromZod;
    /**
     * 获取新接口的工具实例
     */
    getNewToolInstance(): NewTool<Input, Output>;
    /**
     * 获取旧接口的工具实例
     */
    getOldToolInstance(): OldTool<Input, Output>;
    /**
     * 兼容性报告
     */
    getCompatibilityReport(): {
        hasZodSchema: boolean;
        hasParameterSchema: boolean;
        supportsNewInterface: boolean;
        supportsOldInterface: boolean;
        migrationStatus: "enhanced";
        recommendations: string;
    };
}
/**
 * 创建增强工具的辅助函数
 */
export declare function createEnhancedTool<Input, Output>(definition: {
    id: string;
    name: string;
    description: string;
    category?: ToolCategory;
    version?: string;
    author?: string;
    inputSchema?: ZodSchema<Input>;
    parameterSchema?: Record<string, any>;
    capabilities?: string[] | ToolCapabilities;
    execute: (input: Input, context: EnhancedToolContext) => Promise<Output>;
    config?: Partial<EnhancedToolConfig>;
}): EnhancedBaseTool<Input, Output>;
/**
 * 将旧工具适配为增强工具
 */
export declare function adaptLegacyTool<Input, Output>(legacyTool: OldTool<Input, Output>, config?: Partial<EnhancedToolConfig>): EnhancedBaseTool<Input, Output>;
//# sourceMappingURL=EnhancedBaseTool.d.ts.map