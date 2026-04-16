/**
 * 简化版MCP工具包装器
 * 快速集成MCP工具到EnhancedToolRegistry，不依赖完整EnhancedBaseTool
 */

import * as vscode from 'vscode';

/**
 * 简化MCP工具接口
 */
export interface SimpleMCPTool {
  id: string;
  name: string;
  description: string;
  version: string;
  
  /** 执行方法 */
  execute(params: Record<string, any>): Promise<any>;
  
  /** 可选：验证方法 */
  validate?(params: Record<string, any>): boolean;
  
  /** 可选：工具能力标签 */
  capabilities?: string[];
  
  /** 可选：工具配置 */
  configuration?: Record<string, any>;
}

/**
 * MCP工具包装器配置
 */
export interface MCPToolWrapperConfig {
  /** 是否启用权限检查 */
  enablePermissionCheck?: boolean;
  
  /** 是否启用输入验证 */
  enableValidation?: boolean;
  
  /** 超时时间（毫秒） */
  timeoutMs?: number;
}

/**
 * MCP工具包装器
 * 简化实现，不依赖完整EnhancedBaseTool
 */
export class MCPToolWrapper {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly version: string;
  
  private mcpTool: SimpleMCPTool;
  private config: MCPToolWrapperConfig;
  private outputChannel: vscode.OutputChannel;
  
  constructor(mcpTool: SimpleMCPTool, config: MCPToolWrapperConfig = {}) {
    this.mcpTool = mcpTool;
    this.config = {
      enablePermissionCheck: true,
      enableValidation: true,
      timeoutMs: 30000,
      ...config
    };
    
    // 复制属性
    this.id = mcpTool.id;
    this.name = mcpTool.name;
    this.description = mcpTool.description;
    this.version = mcpTool.version;
    
    // 创建输出通道
    this.outputChannel = vscode.window.createOutputChannel(`MCP: ${this.name}`);
    
    this.outputChannel.appendLine(`🔧 Created MCPToolWrapper for: ${this.name} (${this.id})`);
  }
  
  /**
   * 执行MCP工具
   */
  async execute(params: Record<string, any>): Promise<any> {
    const startTime = Date.now();
    
    this.outputChannel.appendLine(`▶️ Executing MCP tool: ${this.name}`);
    this.outputChannel.appendLine(`   Params: ${JSON.stringify(params, null, 2)}`);
    
    try {
      // 输入验证
      if (this.config.enableValidation && this.mcpTool.validate) {
        const isValid = this.mcpTool.validate(params);
        if (!isValid) {
          throw new Error('Input validation failed');
        }
      }
      
      // 权限检查（简化版）
      if (this.config.enablePermissionCheck) {
        const hasPermission = await this.checkPermission(params);
        if (!hasPermission) {
          throw new Error('Permission denied');
        }
      }
      
      // 执行工具（带超时）
      let timeoutId: NodeJS.Timeout | undefined;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`MCP tool timeout after ${this.config.timeoutMs}ms`));
        }, this.config.timeoutMs);
      });
      
      const executionPromise = this.mcpTool.execute(params);
      
      const result = await Promise.race([executionPromise, timeoutPromise]);
      
      // 清理超时定时器
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      const duration = Date.now() - startTime;
      
      this.outputChannel.appendLine(`✅ Execution completed in ${duration}ms`);
      this.outputChannel.appendLine(`   Result type: ${typeof result}`);
      
      return result;
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      this.outputChannel.appendLine(`❌ Execution failed after ${duration}ms: ${error.message}`);
      
      // 重新抛出错误，保持错误堆栈
      const newError = new Error(`MCP tool execution failed: ${error.message}`);
      (newError as any).cause = error;
      throw newError;
    }
  }
  
  /**
   * 简化权限检查
   */
  private async checkPermission(params: Record<string, any>): Promise<boolean> {
    // 简化实现：默认允许所有操作
    // 在实际应用中，这里应该集成权限系统
    return true;
  }
  
  /**
   * 验证参数
   */
  validateParams(params: Record<string, any>): boolean {
    if (!this.config.enableValidation) {
      return true;
    }
    
    if (this.mcpTool.validate) {
      return this.mcpTool.validate(params);
    }
    
    // 如果没有验证方法，检查参数是否为对象
    return params !== null && typeof params === 'object';
  }
  
  /**
   * 获取工具能力标签
   */
  getCapabilities(): string[] {
    return this.mcpTool.capabilities || [];
  }
  
  /**
   * 获取工具配置
   */
  getConfiguration(): Record<string, any> {
    return this.mcpTool.configuration || {};
  }
  
  /**
   * 转换为兼容EnhancedToolRegistry的格式
   */
  toToolRegistryFormat(): any {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      version: this.version,
      category: this.determineCategory(),
      capabilities: this.getCapabilities(),
      isMCPTool: true,
      execute: this.execute.bind(this),
      validate: this.validateParams.bind(this)
    };
  }
  
  /**
   * 确定工具分类
   */
  private determineCategory(): string {
    const capabilities = this.getCapabilities();
    
    if (capabilities.includes('file_system') || capabilities.includes('file_operations')) {
      return 'file';
    } else if (capabilities.includes('web_search') || capabilities.includes('browser')) {
      return 'web';
    } else if (capabilities.includes('code_analysis') || capabilities.includes('code_generation')) {
      return 'code';
    } else if (capabilities.includes('database') || capabilities.includes('sql')) {
      return 'development';
    } else if (capabilities.includes('shell') || capabilities.includes('terminal')) {
      return 'terminal';
    } else if (capabilities.includes('mcp') || capabilities.includes('model_context')) {
      return 'mcp';
    }
    
    return 'utility';
  }
  
  /**
   * 释放资源
   */
  dispose(): void {
    this.outputChannel.dispose();
  }
}

/**
 * MCP工具发现服务
 */
export class MCPToolDiscoveryService {
  private wrappers: Map<string, MCPToolWrapper> = new Map();
  private outputChannel: vscode.OutputChannel;
  
  constructor() {
    this.outputChannel = vscode.window.createOutputChannel('MCP Discovery');
  }
  
  /**
   * 发现并注册MCP工具
   */
  async discoverAndRegisterTools(): Promise<MCPToolWrapper[]> {
    this.outputChannel.appendLine('🔍 Discovering MCP tools...');
    
    try {
      // 这里应该实现实际的MCP工具发现逻辑
      // 例如：扫描目录、查询MCP服务器、加载配置文件等
      
      // 临时：返回空数组，表示没有发现工具
      // 在实际实现中，这里应该返回发现的工具
      const discoveredTools: SimpleMCPTool[] = [];
      
      // 为每个发现的工具创建包装器
      const wrappers: MCPToolWrapper[] = [];
      for (const tool of discoveredTools) {
        const wrapper = new MCPToolWrapper(tool);
        this.wrappers.set(tool.id, wrapper);
        wrappers.push(wrapper);
        
        this.outputChannel.appendLine(`   Found: ${tool.name} (${tool.id})`);
      }
      
      if (wrappers.length === 0) {
        this.outputChannel.appendLine('ℹ️ No MCP tools discovered');
      } else {
        this.outputChannel.appendLine(`✅ Discovered ${wrappers.length} MCP tools`);
      }
      
      return wrappers;
      
    } catch (error: any) {
      this.outputChannel.appendLine(`❌ MCP tool discovery failed: ${error.message}`);
      return [];
    }
  }
  
  /**
   * 注册单个MCP工具
   */
  registerTool(mcpTool: SimpleMCPTool): MCPToolWrapper {
    const wrapper = new MCPToolWrapper(mcpTool);
    this.wrappers.set(mcpTool.id, wrapper);
    
    this.outputChannel.appendLine(`📋 Registered MCP tool: ${mcpTool.name} (${mcpTool.id})`);
    
    return wrapper;
  }
  
  /**
   * 获取所有已注册的MCP工具包装器
   */
  getAllWrappers(): MCPToolWrapper[] {
    return Array.from(this.wrappers.values());
  }
  
  /**
   * 根据ID获取MCP工具包装器
   */
  getWrapperById(toolId: string): MCPToolWrapper | undefined {
    return this.wrappers.get(toolId);
  }
  
  /**
   * 释放所有资源
   */
  disposeAll(): void {
    for (const wrapper of this.wrappers.values()) {
      wrapper.dispose();
    }
    this.wrappers.clear();
    this.outputChannel.dispose();
  }
}