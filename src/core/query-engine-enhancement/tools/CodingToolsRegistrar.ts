/**
 * CodingToolsRegistrar - 编码工具注册器
 * 
 * 负责将编码专用工具注册到EnhancedToolRegistry
 */

import { EnhancedToolRegistry } from '../../tool/EnhancedToolRegistry';
import { 
  CodeGeneratorTool, 
  FileEditorTool, 
  DebugAnalyzerTool, 
  TestRunnerTool, 
  CodeAnalysisTool,
  CODING_TOOLS 
} from './index';

/**
 * 编码工具注册器配置
 */
export interface CodingToolsRegistrarConfig {
  /** 是否自动注册所有编码工具 */
  autoRegister: boolean;
  
  /** 要注册的特定工具ID列表（如果autoRegister为false） */
  toolIds?: string[];
  
  /** 工具上下文 */
  context?: any;
  
  /** 是否覆盖已存在的工具 */
  overwriteExisting: boolean;
}

/**
 * 编码工具注册器
 */
export class CodingToolsRegistrar {
  private toolRegistry: EnhancedToolRegistry;
  private config: CodingToolsRegistrarConfig;
  private registeredTools: Map<string, any> = new Map();
  
  constructor(toolRegistry: EnhancedToolRegistry, config: Partial<CodingToolsRegistrarConfig> = {}) {
    this.toolRegistry = toolRegistry;
    this.config = {
      autoRegister: true,
      overwriteExisting: false,
      ...config,
    };
  }
  
  /**
   * 注册所有编码工具
   */
  public async registerAllTools(): Promise<{
    success: boolean;
    registered: string[];
    failed: Array<{ toolId: string; error: string }>;
    total: number;
  }> {
    const registered: string[] = [];
    const failed: Array<{ toolId: string; error: string }> = [];
    
    try {
      const toolsToRegister = this.config.autoRegister 
        ? CODING_TOOLS 
        : CODING_TOOLS.filter(tool => this.config.toolIds?.includes(tool.id));
      
      for (const toolDef of toolsToRegister) {
        try {
          await this.registerTool(toolDef.id);
          registered.push(toolDef.id);
        } catch (error: any) {
          failed.push({
            toolId: toolDef.id,
            error: error.message,
          });
        }
      }
      
      return {
        success: failed.length === 0,
        registered,
        failed,
        total: registered.length + failed.length,
      };
      
    } catch (error: any) {
      return {
        success: false,
        registered,
        failed: [...failed, { toolId: 'unknown', error: error.message }],
        total: registered.length + failed.length + 1,
      };
    }
  }
  
  /**
   * 注册单个工具
   */
  public async registerTool(toolId: string): Promise<boolean> {
    const toolDef = CODING_TOOLS.find(tool => tool.id === toolId);
    if (!toolDef) {
      throw new Error(`Unknown coding tool: ${toolId}`);
    }
    
    // 检查工具是否已存在
    if (this.toolRegistry.hasTool(toolId)) {
      if (!this.config.overwriteExisting) {
        throw new Error(`Tool already registered: ${toolId}. Set overwriteExisting to true to replace.`);
      }
      
      // 移除现有工具
      this.toolRegistry.unregisterTool(toolId);
    }
    
    // 创建工具实例
    const toolInstance = new toolDef.class(this.config.context);
    
    // 注册到工具注册表
    this.toolRegistry.registerTool(toolInstance);
    
    // 记录已注册的工具
    this.registeredTools.set(toolId, toolInstance);
    
    return true;
  }
  
  /**
   * 取消注册工具
   */
  public unregisterTool(toolId: string): boolean {
    if (!this.registeredTools.has(toolId)) {
      return false;
    }
    
    this.toolRegistry.unregisterTool(toolId);
    this.registeredTools.delete(toolId);
    
    return true;
  }
  
  /**
   * 取消注册所有编码工具
   */
  public unregisterAllTools(): void {
    for (const toolId of this.registeredTools.keys()) {
      this.unregisterTool(toolId);
    }
  }
  
  /**
   * 获取已注册的工具
   */
  public getRegisteredTools(): Array<{
    id: string;
    name: string;
    description: string;
    category: string;
  }> {
    const tools: Array<{
      id: string;
      name: string;
      description: string;
      category: string;
    }> = [];
    
    for (const toolId of this.registeredTools.keys()) {
      const toolDef = CODING_TOOLS.find(tool => tool.id === toolId);
      if (toolDef) {
        tools.push({
          id: toolDef.id,
          name: toolDef.name,
          description: toolDef.description,
          category: toolDef.category,
        });
      }
    }
    
    return tools;
  }
  
  /**
   * 获取工具实例
   */
  public getToolInstance(toolId: string): any | null {
    return this.registeredTools.get(toolId) || null;
  }
  
  /**
   * 检查工具是否已注册
   */
  public hasTool(toolId: string): boolean {
    return this.registeredTools.has(toolId);
  }
  
  /**
   * 获取工具统计
   */
  public getStats(): {
    totalAvailable: number;
    totalRegistered: number;
    byCategory: Record<string, number>;
  } {
    const byCategory: Record<string, number> = {};
    
    for (const toolDef of CODING_TOOLS) {
      byCategory[toolDef.category] = (byCategory[toolDef.category] || 0) + 1;
    }
    
    return {
      totalAvailable: CODING_TOOLS.length,
      totalRegistered: this.registeredTools.size,
      byCategory,
    };
  }
  
  /**
   * 验证工具可用性
   */
  public async validateTools(): Promise<Array<{
    toolId: string;
    available: boolean;
    issues: string[];
  }>> {
    const results: Array<{
      toolId: string;
      available: boolean;
      issues: string[];
    }> = [];
    
    for (const toolDef of CODING_TOOLS) {
      const issues: string[] = [];
      let available = true;
      
      // 检查工具是否已注册
      if (!this.registeredTools.has(toolDef.id)) {
        issues.push('Tool not registered');
        available = false;
      } else {
        // 检查工具依赖（如果有）
        const toolInstance = this.registeredTools.get(toolDef.id);
        if (toolInstance && typeof toolInstance.validate === 'function') {
          try {
            const validation = await toolInstance.validate();
            if (!validation.valid) {
              issues.push(...validation.errors || []);
              available = false;
            }
          } catch (error: any) {
            issues.push(`Validation failed: ${error.message}`);
            available = false;
          }
        }
      }
      
      results.push({
        toolId: toolDef.id,
        available,
        issues,
      });
    }
    
    return results;
  }
}

/**
 * 创建默认的编码工具注册器配置
 */
export function createDefaultCodingToolsConfig(context?: any): CodingToolsRegistrarConfig {
  return {
    autoRegister: true,
    overwriteExisting: true,
    context,
  };
}

/**
 * 在现有工具注册表中集成编码工具
 */
export async function integrateCodingTools(
  toolRegistry: EnhancedToolRegistry,
  context?: any,
  config?: Partial<CodingToolsRegistrarConfig>
): Promise<{
  registrar: CodingToolsRegistrar;
  registrationResult: {
    success: boolean;
    registered: string[];
    failed: Array<{ toolId: string; error: string }>;
    total: number;
  };
}> {
  const registrarConfig = {
    ...createDefaultCodingToolsConfig(context),
    ...config,
  };
  
  const registrar = new CodingToolsRegistrar(toolRegistry, registrarConfig);
  const registrationResult = await registrar.registerAllTools();
  
  return {
    registrar,
    registrationResult,
  };
}

export default CodingToolsRegistrar;