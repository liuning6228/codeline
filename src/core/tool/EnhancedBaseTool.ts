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

import * as vscode from 'vscode';
import { 
  Tool as NewTool, 
  ToolDefinition as NewToolDefinition, 
  ToolUseContext, 
  ToolCategory, 
  PermissionResult as NewPermissionResult,
  ValidationResult as NewValidationResult,
  ToolCapabilities,
  PermissionLevel,
  buildTool
} from './Tool';
import { 
  Tool as OldTool, 
  ToolContext, 
  ToolResult, 
  ValidationResult as OldValidationResult, 
  PermissionResult as OldPermissionResult,
  ToolProgress as OldToolProgress,
  ToolOptions,
  ToolDefinition as OldToolDefinition
} from '../../tools/ToolInterface';
import { 
  z, 
  ZodSchema,
  createCompatibleSchema, 
  isCompatibleSchema, 
  getRealSchema, 
  compatibility,
  unifiedParse,
  unifiedSafeParse
} from './ZodCompatibility';
import { 
  checkPermissionWithBaseResult,
  initializePermissionSystem 
} from './permission/PermissionIntegration';

// ==================== 类型适配器 ====================

/**
 * 类型适配器：将新旧接口类型进行转换
 */
export namespace TypeAdapter {
  
  /**
   * 将旧接口的ValidationResult转换为新接口的ValidationResult
   */
  export function adaptValidationResult(oldResult: OldValidationResult): NewValidationResult {
    return {
      valid: oldResult.valid,
      errors: oldResult.error ? [oldResult.error] : undefined,
      warnings: []
    };
  }
  
  /**
   * 将新接口的ValidationResult转换为旧接口的ValidationResult
   */
  export function adaptValidationResultToOld(newResult: NewValidationResult): OldValidationResult {
    return {
      valid: newResult.valid,
      error: newResult.errors?.join(', '),
      sanitizedParams: undefined
    };
  }
  
  /**
   * 将旧接口的PermissionResult转换为新接口的PermissionResult
   */
  export function adaptPermissionResult(oldResult: OldPermissionResult): NewPermissionResult {
    return {
      allowed: oldResult.allowed,
      requiresUserConfirmation: oldResult.requiresUserConfirmation || false,
      reason: oldResult.reason,
      level: oldResult.requiresUserConfirmation ? PermissionLevel.WRITE : PermissionLevel.READ,
      autoApprove: false
    };
  }
  
  /**
   * 将新接口的PermissionResult转换为旧接口的PermissionResult
   */
  export function adaptPermissionResultToOld(newResult: NewPermissionResult): OldPermissionResult {
    return {
      allowed: newResult.allowed,
      reason: newResult.reason,
      requiresUserConfirmation: newResult.requiresUserConfirmation,
      confirmationPrompt: newResult.reason ? `确认执行：${newResult.reason}` : undefined
    };
  }
  
  /**
   * 将字符串数组能力转换为ToolCapabilities对象
   */
  export function adaptCapabilities(capabilities: string[]): ToolCapabilities {
    const isConcurrencySafe = capabilities.includes('concurrent') || capabilities.includes('concurrency-safe');
    const isReadOnly = capabilities.includes('readonly') || capabilities.includes('read-only');
    const isDestructive = capabilities.includes('destructive') || capabilities.includes('modify');
    const requiresWorkspace = capabilities.includes('workspace') || capabilities.includes('requires-workspace');
    const supportsStreaming = capabilities.includes('streaming') || capabilities.includes('supports-streaming');
    
    return {
      isConcurrencySafe,
      isReadOnly,
      isDestructive,
      requiresWorkspace,
      supportsStreaming
    };
  }
  
  /**
   * 将ToolCapabilities对象转换为字符串数组
   */
  export function adaptCapabilitiesToStrings(capabilities: ToolCapabilities): string[] {
    const result: string[] = [];
    if (capabilities.isConcurrencySafe) result.push('concurrency-safe');
    if (capabilities.isReadOnly) result.push('read-only');
    if (capabilities.isDestructive) result.push('destructive');
    if (capabilities.requiresWorkspace) result.push('requires-workspace');
    if (capabilities.supportsStreaming) result.push('supports-streaming');
    return result;
  }
  
  /**
   * 将旧接口的ToolContext转换为新接口的ToolUseContext
   */
  export function adaptToolContextToNew(context: ToolContext): ToolUseContext {
    return {
      workspaceRoot: context.workspaceRoot,
      workspaceFolders: undefined,
      extensionContext: context.extensionContext,
      outputChannel: context.outputChannel,
      abortController: new AbortController(),
      permissionContext: {
        mode: 'default',
        alwaysAllowRules: {},
        alwaysDenyRules: {},
        alwaysAskRules: {},
        isBypassPermissionsModeAvailable: false
      },
      showInformationMessage: (message: string, ...items: string[]) => 
        vscode.window.showInformationMessage(message, ...items),
      showWarningMessage: (message: string, ...items: string[]) => 
        vscode.window.showWarningMessage(message, ...items),
      showErrorMessage: (message: string, ...items: string[]) => 
        vscode.window.showErrorMessage(message, ...items),
      readFile: async (path: string) => {
        const uri = vscode.Uri.file(path);
        const bytes = await vscode.workspace.fs.readFile(uri);
        return Buffer.from(bytes).toString('utf-8');
      },
      writeFile: async (path: string, content: string) => {
        const uri = vscode.Uri.file(path);
        await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf-8'));
      },
      fileExists: async (path: string) => {
        try {
          const uri = vscode.Uri.file(path);
          await vscode.workspace.fs.stat(uri);
          return true;
        } catch {
          return false;
        }
      }
    };
  }
  
  /**
   * 将新接口的ToolUseContext转换为旧接口的ToolContext
   */
  export function adaptToolContextToOld(context: ToolUseContext): ToolContext {
    return {
      extensionContext: context.extensionContext,
      workspaceRoot: context.workspaceRoot,
      cwd: context.workspaceRoot,
      outputChannel: context.outputChannel,
      sessionId: 'adapted-session',
      options: {
        autoExecute: false,
        requireApproval: true,
        timeout: 30000,
        validateParams: true
      }
    };
  }
  
  /**
   * 将旧接口的parameterSchema转换为Zod schema
   */
  export function adaptParameterSchemaToZod(parameterSchema?: Record<string, {
    type: string;
    description: string;
    required?: boolean;
    default?: any;
    validation?: (value: any) => boolean;
    enum?: any[];
  }>): ZodSchema<any> | undefined {
    if (!parameterSchema) return undefined;
    
    const shape: Record<string, ZodSchema<any>> = {};
    
    for (const [key, schema] of Object.entries(parameterSchema)) {
      let zodType: ZodSchema<any>;
      
      switch (schema.type) {
        case 'string':
          zodType = z.string();
          break;
        case 'number':
          zodType = z.number();
          break;
        case 'boolean':
          zodType = z.boolean();
          break;
        case 'object':
          zodType = z.object({}).passthrough(); // 任意对象
          break;
        case 'array':
          zodType = z.array(z.any());
          break;
        default:
          zodType = z.any();
      }
      
      // 添加描述
      if (schema.description && typeof zodType.describe === 'function') {
        zodType = zodType.describe(schema.description);
      }
      
      // 处理必需/可选
      if (schema.required) {
        shape[key] = zodType;
      } else {
        shape[key] = typeof zodType.optional === 'function' ? zodType.optional() : zodType;
      }
      
      // 处理枚举
      if (schema.enum && schema.enum.length > 0 && typeof z.enum === 'function') {
        shape[key] = z.enum(schema.enum as [any, ...any[]]);
      }
    }
    
    return z.object(shape);
  }
}

// ==================== 增强工具定义 ====================

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
export abstract class EnhancedBaseTool<Input = Record<string, any>, Output = any> {
  
  // ==================== 共享属性 ====================
  
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
  
  // ==================== 新接口属性 ====================
  
  /** Zod输入模式（新接口） */
  get inputSchema(): ZodSchema<Input> {
    // 如果子类提供了zodSchema，使用它
    if ((this as any).zodSchema) {
      return (this as any).zodSchema;
    }
    
    // 否则从parameterSchema转换，或返回默认
    return this.getDefaultInputSchema();
  }
  
  /** 工具能力（新接口格式） */
  get capabilities(): ToolCapabilities {
    // 如果子类提供了capabilities数组，转换它
    if (Array.isArray((this as any).capabilitiesArray)) {
      return TypeAdapter.adaptCapabilities((this as any).capabilitiesArray);
    }
    
    // 返回默认能力
    return {
      isConcurrencySafe: false,
      isReadOnly: false,
      isDestructive: false,
      requiresWorkspace: true,
      supportsStreaming: false
    };
  }
  
  // ==================== 旧接口属性 ====================
  
  /** 参数模式（旧接口） */
  get parameterSchema(): Record<string, {
    type: string;
    description: string;
    required?: boolean;
    default?: any;
    validation?: (value: any) => boolean;
    enum?: any[];
  }> | undefined {
    // 如果子类提供了parameterSchema，使用它
    if ((this as any)._parameterSchema) {
      return (this as any)._parameterSchema;
    }
    
    // 否则尝试从Zod schema生成
    return this.generateParameterSchemaFromZod();
  }
  
  /** 工具能力数组（旧接口格式） */
  get capabilitiesArray(): string[] {
    // 如果子类提供了capabilities数组，使用它
    if (Array.isArray((this as any).capabilitiesArray)) {
      return (this as any).capabilitiesArray;
    }
    
    // 否则从新接口的capabilities转换
    return TypeAdapter.adaptCapabilitiesToStrings(this.capabilities);
  }
  
  // ==================== 配置和状态 ====================
  
  /** 工具配置 */
  protected config: EnhancedToolConfig;
  
  /** 执行状态跟踪 */
  private executions: Map<string, any> = new Map();
  
  /**
   * 构造函数
   */
  constructor(config?: Partial<EnhancedToolConfig>) {
    this.config = {
      enableZodValidation: true,
      maintainLegacyCompatibility: true,
      permissionLevel: 'basic',
      supportMCP: false,
      defaultTimeout: 30000,
      ...config
    };
  }
  
  // ==================== 核心方法（抽象） ====================
  
  /**
   * 执行工具（核心方法）
   */
  protected abstract executeCore(input: Input, context: EnhancedToolContext): Promise<Output>;
  
  // ==================== 新接口方法实现 ====================
  
  /**
   * 检查工具是否可用（新接口）
   */
  isEnabled(context: ToolUseContext): boolean | Promise<boolean> {
    const oldContext = TypeAdapter.adaptToolContextToOld(context);
    return this.isEnabledForOld(oldContext);
  }
  
  /**
   * 检查并发安全性（新接口）
   */
  isConcurrencySafe(input: Input, context: ToolUseContext): boolean | Promise<boolean> {
    const oldContext = TypeAdapter.adaptToolContextToOld(context);
    return this.isConcurrencySafeForOld(oldContext);
  }
  
  /**
   * 检查权限（新接口）
   */
  async checkPermissions(input: Input, context: ToolUseContext): Promise<NewPermissionResult> {
    const oldContext = TypeAdapter.adaptToolContextToOld(context);
    const enhancedContext: EnhancedToolContext = {
      ...oldContext,
      newToolUseContext: context
    };
    return this.checkPermissionsForNew(input, enhancedContext);
  }
  
  /**
   * 验证参数（新接口）
   */
  async validateParameters(input: Input, context: ToolUseContext): Promise<NewValidationResult> {
    const oldContext = TypeAdapter.adaptToolContextToOld(context);
    const enhancedContext: EnhancedToolContext = {
      ...oldContext,
      newToolUseContext: context
    };
    return this.validateParametersForNew(input, enhancedContext);
  }
  
  /**
   * 执行工具（新接口）
   */
  async execute(input: Input, context: ToolUseContext): Promise<Output> {
    const oldContext = TypeAdapter.adaptToolContextToOld(context);
    const enhancedContext: EnhancedToolContext = {
      ...oldContext,
      newToolUseContext: context
    };
    return this.executeCore(input, enhancedContext);
  }
  
  // ==================== 旧接口方法实现 ====================
  
  /**
   * 是否启用（旧接口）
   */
  isEnabledForOld(context: ToolContext): boolean {
    return true; // 默认启用，子类可重写
  }
  
  /**
   * 是否支持并发执行（旧接口）
   */
  isConcurrencySafeForOld(context: ToolContext): boolean {
    return this.capabilities.isConcurrencySafe;
  }
  
  /**
   * 是否是只读操作（旧接口）
   */
  isReadOnlyForOld?(context: ToolContext): boolean {
    return this.capabilities.isReadOnly;
  }
  
  /**
   * 是否是破坏性操作（旧接口）
   */
  isDestructiveForOld?(context: ToolContext): boolean {
    return this.capabilities.isDestructive;
  }
  
  /**
   * 权限检查（旧接口）
   */
  async checkPermissionsForOld(
    params: Input,
    context: ToolContext
  ): Promise<OldPermissionResult> {
    const enhancedContext: EnhancedToolContext = {
      ...context,
      oldExtendedContext: context
    };
    const newResult = await this.checkPermissionsForNew(params, enhancedContext);
    return TypeAdapter.adaptPermissionResultToOld(newResult);
  }
  
  /**
   * 参数验证（旧接口）
   */
  async validateParametersForOld(
    params: Input,
    context: ToolContext
  ): Promise<OldValidationResult> {
    const enhancedContext: EnhancedToolContext = {
      ...context,
      oldExtendedContext: context
    };
    const newResult = await this.validateParametersForNew(params, enhancedContext);
    return TypeAdapter.adaptValidationResultToOld(newResult);
  }
  
  /**
   * 工具执行方法（旧接口）
   */
  async executeForOld(
    params: Input,
    context: ToolContext,
    onProgress?: (progress: OldToolProgress) => void
  ): Promise<ToolResult<Output>> {
    const startTime = new Date();
    
    try {
      const enhancedContext: EnhancedToolContext = {
        ...context,
        oldExtendedContext: context
      };
      
      // 验证参数
      const validation = await this.validateParametersForOld(params, context);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
          toolId: this.id,
          duration: 0,
          timestamp: new Date()
        };
      }
      
      // 检查权限
      const permission = await this.checkPermissionsForOld(params, context);
      if (!permission.allowed) {
        return {
          success: false,
          error: permission.reason || '权限被拒绝',
          toolId: this.id,
          duration: 0,
          timestamp: new Date()
        };
      }
      
      // 执行工具
      const result = await this.executeCore(params, enhancedContext);
      const duration = Date.now() - startTime.getTime();
      
      return {
        success: true,
        output: result,
        toolId: this.id,
        duration,
        timestamp: new Date()
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        toolId: this.id,
        duration: Date.now() - startTime.getTime(),
        timestamp: new Date()
      };
    }
  }
  
  // ==================== 默认实现方法 ====================
  
  /**
   * 检查权限（新接口默认实现）
   * 使用Claude Code三层权限系统
   */
  protected async checkPermissionsForNew(
    input: Input, 
    context: EnhancedToolContext
  ): Promise<NewPermissionResult> {
    // 确保权限系统已初始化
    await initializePermissionSystem();
    
    // 创建工具使用上下文
    const toolUseContext: ToolUseContext = {
      workspaceRoot: context.workspaceRoot,
      extensionContext: context.extensionContext,
      outputChannel: context.outputChannel,
      abortController: new AbortController(),
      permissionContext: context.newToolUseContext?.permissionContext || {
        mode: 'default',
        alwaysAllowRules: {},
        alwaysDenyRules: {},
        alwaysAskRules: {},
        isBypassPermissionsModeAvailable: false
      },
      showInformationMessage: async (message: string, ...items: string[]) => {
        // 默认实现
        return message;
      },
      showWarningMessage: async (message: string, ...items: string[]) => {
        // 默认实现
        return message;
      },
      showErrorMessage: async (message: string, ...items: string[]) => {
        // 默认实现
        return message;
      },
      readFile: async (path: string) => {
        // 默认实现
        return '';
      },
      writeFile: async (path: string, content: string) => {
        // 默认实现
      },
      fileExists: async (path: string) => {
        // 默认实现
        return false;
      }
    };
    
    // 使用权限集成系统检查权限
    try {
      const permissionResult = await checkPermissionWithBaseResult(
        this.id,
        this.name,
        input,
        toolUseContext
      );
      
      return permissionResult;
    } catch (error) {
      // 权限系统失败时回退到默认检查
      console.error('权限系统检查失败，使用默认权限:', error);
      return {
        allowed: true,
        requiresUserConfirmation: false,
        reason: `权限系统检查失败: ${error instanceof Error ? error.message : String(error)}`,
        level: PermissionLevel.READ,
        autoApprove: false
      };
    }
  }
  
  /**
   * 验证参数（新接口默认实现）
   */
  protected async validateParametersForNew(
    input: Input, 
    context: EnhancedToolContext
  ): Promise<NewValidationResult> {
    if (!this.config.enableZodValidation) {
      return { valid: true };
    }
    
    try {
      const result = unifiedSafeParse(this.inputSchema, input);
      if (result.success) {
        return { valid: true };
      } else {
        const error = result.error;
        const errors = error.errors 
          ? error.errors.map((err: any) => 
              `${err.path?.join?.('.') || 'unknown'}: ${err.message || 'validation error'}`
            )
          : [`Validation failed: ${error.message || 'unknown error'}`];
        
        return { 
          valid: false, 
          errors
        };
      }
    } catch (error) {
      return { 
        valid: false, 
        errors: [`验证错误: ${error instanceof Error ? error.message : String(error)}`] 
      };
    }
  }
  
  /**
   * 获取默认输入schema
   */
  protected getDefaultInputSchema(): ZodSchema<Input> {
    // 创建默认schema：接受任何输入
    return z.object({}).passthrough() as unknown as ZodSchema<Input>;
  }
  
  /**
   * 从Zod schema生成parameterSchema
   */
  private generateParameterSchemaFromZod(): any {
    // 简化的转换逻辑
    // 在实际项目中，需要解析Zod schema并生成对应的parameterSchema
    return undefined; // 返回undefined表示没有parameterSchema
  }
  
  // ==================== 辅助方法 ====================
  
  /**
   * 获取新接口的工具实例
   */
  getNewToolInstance(): NewTool<Input, Output> {
    const definition: NewToolDefinition<Input, Output> = {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      version: this.version,
      author: this.author || 'Unknown',
      inputSchema: this.inputSchema,
      capabilities: this.capabilities,
      isEnabled: (context: ToolUseContext) => this.isEnabled(context),
      isConcurrencySafe: (input: Input, context: ToolUseContext) => 
        this.isConcurrencySafe(input, context),
      checkPermissions: (input: Input, context: ToolUseContext) => 
        this.checkPermissions(input, context),
      validateParameters: (input: Input, context: ToolUseContext) => 
        this.validateParameters(input, context),
      execute: (input: Input, context: ToolUseContext) => 
        this.execute(input, context)
    };
    
    return buildTool(definition);
  }
  
  /**
   * 获取旧接口的工具实例
   */
  getOldToolInstance(): OldTool<Input, Output> {
    const self = this;
    
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      version: this.version,
      author: this.author,
      capabilities: this.capabilitiesArray,
      parameterSchema: this.parameterSchema,
      isEnabled: (context: ToolContext) => this.isEnabledForOld(context),
      isConcurrencySafe: (context: ToolContext) => this.isConcurrencySafeForOld(context),
      isReadOnly: (context: ToolContext) => this.isReadOnlyForOld?.(context) ?? false,
      isDestructive: (context: ToolContext) => this.isDestructiveForOld?.(context) ?? false,
      checkPermissions: (params: Input, context: ToolContext) => 
        this.checkPermissionsForOld(params, context),
      validateParameters: (params: Input, context: ToolContext) => 
        this.validateParametersForOld(params, context),
      execute: (params: Input, context: ToolContext, onProgress?: (progress: OldToolProgress) => void) => 
        this.executeForOld(params, context, onProgress),
      getDisplayName: (params?: Input) => this.name,
      getActivityDescription: (params: Input) => `执行工具: ${this.name}`
    };
  }
  
  /**
   * 兼容性报告
   */
  getCompatibilityReport() {
    return {
      hasZodSchema: true,
      hasParameterSchema: !!this.parameterSchema,
      supportsNewInterface: true,
      supportsOldInterface: true,
      migrationStatus: 'enhanced' as const,
      recommendations: '此工具使用增强的双接口兼容性设计'
    };
  }
}

/**
 * 创建增强工具的辅助函数
 */
export function createEnhancedTool<Input, Output>(
  definition: {
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
  }
): EnhancedBaseTool<Input, Output> {
  
  // 创建一个具体的增强工具实例
  class ConcreteEnhancedTool extends EnhancedBaseTool<Input, Output> {
    readonly id = definition.id;
    readonly name = definition.name;
    readonly description = definition.description;
    readonly version = definition.version || '1.0.0';
    readonly author = definition.author;
    readonly category = definition.category || ToolCategory.OTHER;
    
    // 存储自定义schema和能力
    private customInputSchema = definition.inputSchema;
    private customParameterSchema = definition.parameterSchema;
    private customCapabilities = definition.capabilities;
    
    constructor() {
      super(definition.config);
    }
    
    protected executeCore(input: Input, context: EnhancedToolContext): Promise<Output> {
      return definition.execute(input, context);
    }
    
    // 重写inputSchema获取器
    override get inputSchema(): ZodSchema<Input> {
      if (this.customInputSchema) {
        return this.customInputSchema;
      }
      
      // 尝试从parameterSchema转换
      if (this.customParameterSchema) {
        const zodSchema = TypeAdapter.adaptParameterSchemaToZod(this.customParameterSchema);
        if (zodSchema) {
          return zodSchema as ZodSchema<Input>;
        }
      }
      
      return super.getDefaultInputSchema();
    }
    
    // 重写parameterSchema获取器
    override get parameterSchema(): Record<string, any> | undefined {
      return this.customParameterSchema;
    }
    
    // 重写capabilities获取器
    override get capabilities(): ToolCapabilities {
      if (this.customCapabilities) {
        if (Array.isArray(this.customCapabilities)) {
          return TypeAdapter.adaptCapabilities(this.customCapabilities);
        } else {
          return this.customCapabilities;
        }
      }
      // 使用默认能力实现，而不是super.capabilities
      return {
        isConcurrencySafe: false,
        isReadOnly: false,
        isDestructive: false,
        requiresWorkspace: true,
        supportsStreaming: false
      };
    }
    
    // 重写capabilitiesArray获取器
    override get capabilitiesArray(): string[] {
      if (this.customCapabilities && Array.isArray(this.customCapabilities)) {
        return this.customCapabilities;
      }
      // 从默认capabilities转换
      const defaultCapabilities = this.capabilities;
      return TypeAdapter.adaptCapabilitiesToStrings(defaultCapabilities);
    }
  }
  
  return new ConcreteEnhancedTool();
}

/**
 * 将旧工具适配为增强工具
 */
export function adaptLegacyTool<Input, Output>(
  legacyTool: OldTool<Input, Output>,
  config?: Partial<EnhancedToolConfig>
): EnhancedBaseTool<Input, Output> {
  
  return createEnhancedTool<Input, Output>({
    id: legacyTool.id,
    name: legacyTool.name,
    description: legacyTool.description,
    version: legacyTool.version,
    author: legacyTool.author,
    parameterSchema: legacyTool.parameterSchema,
    capabilities: legacyTool.capabilities,
    config,
    execute: async (input: Input, context: EnhancedToolContext) => {
      const result = await legacyTool.execute(input, context, undefined);
      if (!result.success) {
        throw new Error(result.error || '旧工具执行失败');
      }
      return result.output!;
    }
  });
}