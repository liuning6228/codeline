/**
 * MCP工具适配器
 * 将MCPTool包装成EnhancedBaseTool，实现MCP协议到工具系统的集成
 */

import * as vscode from 'vscode';
import { EnhancedBaseTool, EnhancedToolConfig, EnhancedToolContext } from './EnhancedBaseTool';
import { ToolCategory } from './Tool';
import { z, ZodSchema } from './ZodCompatibility';
import { 
  ToolUseContext, 
  PermissionResult as NewPermissionResult,
  ValidationResult as NewValidationResult,
  ToolCapabilities
} from './Tool';
import { 
  ToolContext as OldToolContext, 
  ToolResult as OldToolResult,
  ValidationResult as OldValidationResult,
  PermissionResult as OldPermissionResult
} from '../../tools/ToolInterface';

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
export class MCPToolAdapter<Input = Record<string, any>, Output = any> 
  extends EnhancedBaseTool<Input, Output> {
  
  // ==================== EnhancedBaseTool必需属性 ====================
  
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly author?: string;
  readonly category: ToolCategory;
  
  /** 是否支持MCP协议 */
  readonly supportMCP: boolean = true;
  
  // ==================== 私有属性 ====================
  
  private mcpTool: any; // MCPTool类型，使用any避免循环依赖
  private mcpConfig: MCPToolAdapterConfig;
  private outputChannel: vscode.OutputChannel;
  
  // ==================== 构造函数 ====================
  
  constructor(
    mcpTool: any, // MCPTool实例
    config: Partial<MCPToolAdapterConfig> = {}
  ) {
    // 合并MCP特定配置到EnhancedToolConfig
    const enhancedConfig: EnhancedToolConfig = {
      enableZodValidation: true,
      maintainLegacyCompatibility: true,
      permissionLevel: 'basic',
      supportMCP: true, // MCP适配器默认支持MCP
      defaultTimeout: 30000,
      ...config
    };
    
    super(enhancedConfig);
    
    this.mcpTool = mcpTool;
    this.mcpConfig = {
      ...enhancedConfig,
      enablePermissionCheck: config.enablePermissionCheck ?? true,
      defaultPermissionLevel: config.defaultPermissionLevel ?? 'READ',
      enableInputValidation: config.enableInputValidation ?? true,
      enableDetailedLogging: config.enableDetailedLogging ?? false,
    };
    
    // 从MCPTool复制属性
    this.id = mcpTool.id;
    this.name = mcpTool.name;
    this.description = mcpTool.description;
    this.version = mcpTool.version;
    this.author = mcpTool.author;
    
    // 根据能力确定分类
    this.category = this.determineCategory(mcpTool.capabilities || []);
    
    // 创建输出通道
    this.outputChannel = vscode.window.createOutputChannel(`CodeLine MCP Adapter: ${this.name}`);
    
    if (this.mcpConfig.enableDetailedLogging) {
      this.outputChannel.appendLine(`🔧 Created MCPToolAdapter for: ${this.name} (${this.id})`);
    }
  }
  
  // ==================== 工具分类判断 ====================
  
  private determineCategory(capabilities: string[]): ToolCategory {
    // 根据MCP工具能力确定分类
    if (capabilities.includes('file_system') || capabilities.includes('file_operations')) {
      return ToolCategory.FILE;
    } else if (capabilities.includes('web_search') || capabilities.includes('browser')) {
      return ToolCategory.WEB;
    } else if (capabilities.includes('code_analysis') || capabilities.includes('code_generation')) {
      return ToolCategory.CODE;
    } else if (capabilities.includes('database') || capabilities.includes('sql')) {
      return ToolCategory.DEVELOPMENT;
    } else if (capabilities.includes('shell') || capabilities.includes('terminal')) {
      return ToolCategory.TERMINAL;
    } else if (capabilities.includes('mcp') || capabilities.includes('model_context')) {
      return ToolCategory.MCP;
    }
    
    // 默认分类
    return ToolCategory.UTILITY;
  }
  
  // ==================== Zod输入模式 ====================
  
  /**
   * 获取Zod输入模式
   * 根据MCP工具的配置生成动态模式
   */
  get inputSchema(): ZodSchema<Input> {
    try {
      // 如果MCP工具有验证方法，尝试从中提取模式
      if (this.mcpTool.validate && typeof this.mcpTool.validate === 'function') {
        // 这是一个简化实现，实际中需要更复杂的模式提取
        return z.object({
          params: z.record(z.any()).optional(),
          options: z.record(z.any()).optional()
        }) as unknown as ZodSchema<Input>;
      }
      
      // 如果MCP工具有配置信息，使用它生成模式
      if (this.mcpTool.configuration && typeof this.mcpTool.configuration === 'object') {
        const schemaObject: Record<string, any> = {};
        
        for (const [key, config] of Object.entries(this.mcpTool.configuration)) {
          if (typeof config === 'object' && config !== null && 'type' in config) {
            switch ((config as any).type) {
              case 'string':
                schemaObject[key] = z.string();
                if ((config as any).required !== false) {
                  schemaObject[key] = schemaObject[key].min(1);
                }
                break;
              case 'number':
                schemaObject[key] = z.number();
                break;
              case 'boolean':
                schemaObject[key] = z.boolean();
                break;
              case 'array':
                schemaObject[key] = z.array(z.any());
                break;
              default:
                schemaObject[key] = z.any();
            }
          } else {
            schemaObject[key] = z.any();
          }
        }
        
        return z.object(schemaObject) as unknown as ZodSchema<Input>;
      }
      
      // 默认：接受任何参数
      return z.record(z.any()) as unknown as ZodSchema<Input>;
      
    } catch (error) {
      this.outputChannel.appendLine(`⚠️ Failed to generate input schema: ${error}`);
      
      // 回退到基本模式
      return z.object({
        params: z.record(z.any()).optional()
      }) as unknown as ZodSchema<Input>;
    }
  }
  
  // ==================== 工具能力 ====================
  
  get capabilities(): ToolCapabilities {
    // 从MCP工具能力转换到ToolCapabilities接口
    const mcpCapabilities = this.mcpTool.capabilities || [];
    
    return {
      isConcurrencySafe: mcpCapabilities.includes('concurrency_safe') || false,
      isReadOnly: mcpCapabilities.includes('read_only') || true, // MCP工具默认为只读
      isDestructive: mcpCapabilities.includes('destructive') || mcpCapabilities.includes('modify') || false,
      requiresWorkspace: mcpCapabilities.includes('requires_workspace') || false,
      supportsStreaming: mcpCapabilities.includes('supports_streaming') || false
    };
  }
  
  // ==================== 执行方法 ====================
  
  /**
   * 执行工具（新接口）
   */
  async execute(
    input: Input,
    context: ToolUseContext
  ): Promise<Output> {
    const startTime = Date.now();
    
    if (this.mcpConfig.enableDetailedLogging) {
      this.outputChannel.appendLine(`▶️ Executing MCP tool: ${this.name}`);
      this.outputChannel.appendLine(`   Input: ${JSON.stringify(input, null, 2)}`);
    }
    
    try {
      // 检查权限
      if (this.mcpConfig.enablePermissionCheck) {
        const permissionResult = await this.checkPermission(input, context);
        if (!permissionResult.allowed) {
          throw new Error(`Permission denied: ${permissionResult.reason || 'No permission to execute tool'}`);
        }
      }
      
      // 验证输入
      if (this.mcpConfig.enableInputValidation && this.mcpTool.validate) {
        const isValid = this.mcpTool.validate(input);
        if (!isValid) {
          throw new Error('Input validation failed');
        }
      }
      
      // 执行MCP工具
      let result: any;
      if (typeof this.mcpTool.execute === 'function') {
        result = await this.mcpTool.execute(input);
      } else {
        throw new Error('MCP tool does not have an execute method');
      }
      
      const duration = Date.now() - startTime;
      
      if (this.mcpConfig.enableDetailedLogging) {
        this.outputChannel.appendLine(`✅ MCP tool execution completed in ${duration}ms`);
        this.outputChannel.appendLine(`   Result: ${JSON.stringify(result, null, 2)}`);
      }
      
      return result as Output;
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      this.outputChannel.appendLine(`❌ MCP tool execution failed after ${duration}ms: ${error.message}`);
      
      throw new Error(`MCP tool execution failed: ${error.message}`);
    }
  }
  
  /**
   * 执行工具核心方法（实现EnhancedBaseTool抽象方法）
   */
  protected async executeCore(input: Input, context: EnhancedToolContext): Promise<Output> {
    // 从EnhancedToolContext中获取ToolUseContext
    const toolUseContext = context.newToolUseContext;
    
    if (!toolUseContext) {
      // 如果没有提供newToolUseContext，创建一个默认的
      // 这通常不会发生，因为EnhancedBaseTool会提供
      const defaultContext: ToolUseContext = {
        workspaceRoot: context.workspaceRoot || '',
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
      
      return this.execute(input, defaultContext);
    }
    
    // 使用提供的ToolUseContext执行
    return this.execute(input, toolUseContext);
  }
  
  /**
   * 检查权限（新接口）
   */
  async checkPermission(
    input: Input,
    context: ToolUseContext
  ): Promise<NewPermissionResult> {
    // 默认实现：允许所有操作
    // 在实际实现中，这里应该调用权限系统
    return {
      allowed: true,
      requiresUserConfirmation: false,
      reason: 'MCP tools have default permissions',
      level: this.mcpConfig.defaultPermissionLevel as any || 'READ'
    };
  }
  
  /**
   * 验证输入（新接口）
   */
  async validateInput(input: Input): Promise<NewValidationResult> {
    if (!this.mcpConfig.enableInputValidation) {
      return {
        valid: true,
        errors: []
      };
    }
    
    try {
      // 使用Zod模式验证
      const parseResult = this.inputSchema.safeParse(input);
      
      if (parseResult.success) {
        return {
          valid: true,
          errors: []
        };
      } else {
        const errors = parseResult.error.errors.map((err: any) => 
          `${err.path.join('.')}: ${err.message} (${err.code})`
        );
        
        return {
          valid: false,
          errors
        };
      }
    } catch (error) {
      return {
        valid: false,
        errors: [`Validation error: ${String(error)}`]
      };
    }
  }
  
  // 注意：旧接口方法已移除，因为EnhancedBaseTool已经提供了兼容性支持
  // MCP工具适配器专注于新的EnhancedBaseTool接口
  
  // ==================== 辅助方法 ====================
  
  /**
   * 获取原始MCP工具
   */
  getMCPTool(): any {
    return this.mcpTool;
  }
  
  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<MCPToolAdapterConfig>): void {
    this.mcpConfig = { ...this.mcpConfig, ...newConfig };
    
    if (this.mcpConfig.enableDetailedLogging) {
      this.outputChannel.appendLine(`⚙️ Updated config for: ${this.name}`);
    }
  }
  
  /**
   * 释放资源
   */
  dispose(): void {
    this.outputChannel.dispose();
  }
}