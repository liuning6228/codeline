/**
 * EnhancedToolRegistry的MCP扩展
 * 为EnhancedToolRegistry添加MCP工具支持
 */

import * as vscode from 'vscode';
import { EnhancedToolRegistry } from './EnhancedToolRegistry';
import { MCPToolWrapper, MCPToolDiscoveryService, SimpleMCPTool } from './MCPToolWrapper';
import { Tool, ToolDefinition, ToolUseContext, PermissionResult, ValidationResult, buildTool, z, ZodSchema } from './Tool';
import { ToolCategory } from '../types/index';

/**
 * EnhancedToolRegistry的MCP扩展
 */
export class EnhancedToolRegistryMCPExtension {
  private registry: EnhancedToolRegistry;
  private discoveryService: MCPToolDiscoveryService;
  private outputChannel: vscode.OutputChannel;
  
  /** 是否已初始化 */
  private isInitialized = false;
  
  /** 已注册的MCP工具映射 */
  private mcpTools: Map<string, MCPToolWrapper> = new Map();
  
  constructor(registry: EnhancedToolRegistry) {
    this.registry = registry;
    this.discoveryService = new MCPToolDiscoveryService();
    this.outputChannel = vscode.window.createOutputChannel('CodeLine MCP Extension');
  }
  
  /**
   * 初始化MCP扩展
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }
    
    try {
      this.outputChannel.show(true);
      this.outputChannel.appendLine('🔧 Initializing MCP extension for EnhancedToolRegistry...');
      
      // 发现MCP工具
      const discoveredWrappers = await this.discoveryService.discoverAndRegisterTools();
      
      // 注册到EnhancedToolRegistry
      for (const wrapper of discoveredWrappers) {
        await this.registerMCPToolToRegistry(wrapper);
      }
      
      this.isInitialized = true;
      this.outputChannel.appendLine(`✅ MCP extension initialized with ${discoveredWrappers.length} tools`);
      
      return true;
      
    } catch (error: any) {
      this.outputChannel.appendLine(`❌ MCP extension initialization failed: ${error.message}`);
      return false;
    }
  }
  
  /**
   * 注册MCP工具到EnhancedToolRegistry
   */
  private async registerMCPToolToRegistry(wrapper: MCPToolWrapper): Promise<boolean> {
    try {
      // 将MCP工具包装器转换为Tool格式
      const tool = this.convertToTool(wrapper);
      
      // 注册到EnhancedToolRegistry
      const success = this.registry.registerTool(tool);
      
      if (success) {
        this.mcpTools.set(wrapper.id, wrapper);
        this.outputChannel.appendLine(`📋 Registered MCP tool to registry: ${wrapper.name}`);
        return true;
      } else {
        this.outputChannel.appendLine(`⚠️ Failed to register MCP tool to registry: ${wrapper.name}`);
        return false;
      }
      
    } catch (error: any) {
      this.outputChannel.appendLine(`❌ Error registering MCP tool ${wrapper.name}: ${error.message}`);
      return false;
    }
  }
  
  /**
   * 将MCP工具包装器转换为Tool对象
   */
  private convertToTool(wrapper: MCPToolWrapper): Tool {
    // 创建ToolDefinition，然后使用buildTool构建Tool实例
    const toolDefinition: ToolDefinition = {
      id: wrapper.id,
      name: wrapper.name,
      description: wrapper.description,
      version: wrapper.version,
      author: 'MCP Tool', // 默认作者
      category: this.determineCategory(wrapper),
      
      // 输入模式：使用动态模式，接受任何参数
      inputSchema: z.object({
        params: z.record(z.any()).optional()
      }) as ZodSchema<any>,
      
      // 工具能力：根据MCP工具能力构建
      capabilities: this.convertCapabilities(wrapper),
      
      // 工具是否可用：默认可用
      isEnabled: () => true,
      
      // 并发安全性：MCP工具默认不安全
      isConcurrencySafe: () => false,
      
      // 权限检查：简化实现，总是允许
      checkPermissions: async (input: any, context: ToolUseContext): Promise<PermissionResult> => {
        return {
          allowed: true,
          requiresUserConfirmation: false,
          reason: 'MCP tool permission'
        };
      },
      
      // 参数验证：使用MCP工具的验证方法
      validateParameters: async (input: any, context: ToolUseContext): Promise<ValidationResult> => {
        const params = input?.params || input;
        const isValid = wrapper.validateParams(params);
        
        return {
          valid: isValid,
          errors: isValid ? [] : ['Validation failed']
        };
      },
      
      // 执行方法：委托给MCP工具包装器
      execute: async (input: any, context: ToolUseContext): Promise<any> => {
        try {
          const params = input?.params || input;
          return await wrapper.execute(params);
        } catch (error: any) {
          throw new Error(`MCP tool execution failed: ${error.message}`);
        }
      },
      
      // 显示名称：使用工具名称
      getDisplayName: () => wrapper.name,
      
      // 活动描述：使用工具描述
      getActivityDescription: () => wrapper.description
    };
    
    // 使用buildTool创建Tool实例
    return buildTool(toolDefinition);
  }
  
  /**
   * 确定MCP工具的分类
   */
  private determineCategory(wrapper: MCPToolWrapper): ToolCategory {
    const capabilities = wrapper.getCapabilities();
    
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
    
    return ToolCategory.UTILITY;
  }
  
  /**
   * 转换MCP工具能力为ToolCapabilities格式
   */
  private convertCapabilities(wrapper: MCPToolWrapper): any {
    const capabilities = wrapper.getCapabilities();
    
    return {
      isConcurrencySafe: capabilities.includes('concurrency_safe') || false,
      isReadOnly: capabilities.includes('read_only') || true, // MCP工具默认为只读
      isDestructive: capabilities.includes('destructive') || false,
      requiresWorkspace: capabilities.includes('requires_workspace') || false,
      supportsStreaming: capabilities.includes('supports_streaming') || false
    };
  }
  
  /**
   * 手动注册MCP工具
   */
  async registerMCPTool(mcpTool: SimpleMCPTool): Promise<boolean> {
    try {
      this.outputChannel.appendLine(`🔧 Manually registering MCP tool: ${mcpTool.name}`);
      
      // 创建包装器
      const wrapper = this.discoveryService.registerTool(mcpTool);
      
      // 注册到EnhancedToolRegistry
      const success = await this.registerMCPToolToRegistry(wrapper);
      
      if (success) {
        this.outputChannel.appendLine(`✅ Successfully registered MCP tool: ${mcpTool.name}`);
      } else {
        this.outputChannel.appendLine(`⚠️ Failed to register MCP tool: ${mcpTool.name}`);
      }
      
      return success;
      
    } catch (error: any) {
      this.outputChannel.appendLine(`❌ Error registering MCP tool: ${error.message}`);
      return false;
    }
  }
  
  /**
   * 获取所有已注册的MCP工具
   */
  getAllMCPTools(): MCPToolWrapper[] {
    return Array.from(this.mcpTools.values());
  }
  
  /**
   * 根据ID获取MCP工具
   */
  getMCPToolById(toolId: string): MCPToolWrapper | undefined {
    return this.mcpTools.get(toolId);
  }
  
  /**
   * 检查工具是否为MCP工具
   */
  isMCPTool(toolId: string): boolean {
    return this.mcpTools.has(toolId);
  }
  
  /**
   * 执行MCP工具
   */
  async executeMCPTool(toolId: string, params: Record<string, any> = {}): Promise<any> {
    const wrapper = this.mcpTools.get(toolId);
    
    if (!wrapper) {
      throw new Error(`MCP tool not found: ${toolId}`);
    }
    
    this.outputChannel.appendLine(`▶️ Executing MCP tool via extension: ${wrapper.name}`);
    
    try {
      const result = await wrapper.execute(params);
      this.outputChannel.appendLine(`✅ MCP tool execution successful: ${wrapper.name}`);
      return result;
    } catch (error: any) {
      this.outputChannel.appendLine(`❌ MCP tool execution failed: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 重新发现MCP工具
   */
  async rediscoverTools(): Promise<MCPToolWrapper[]> {
    this.outputChannel.appendLine('🔍 Rediscovering MCP tools...');
    
    try {
      // 清理现有工具
      for (const [toolId, wrapper] of this.mcpTools) {
        // 从注册表中移除
        // 注意：EnhancedToolRegistry可能需要提供移除方法
        // 目前我们只是从本地映射中移除
        wrapper.dispose();
      }
      this.mcpTools.clear();
      
      // 重新发现工具
      const discoveredWrappers = await this.discoveryService.discoverAndRegisterTools();
      
      // 重新注册
      for (const wrapper of discoveredWrappers) {
        await this.registerMCPToolToRegistry(wrapper);
      }
      
      this.outputChannel.appendLine(`✅ Rediscovery completed: found ${discoveredWrappers.length} tools`);
      return discoveredWrappers;
      
    } catch (error: any) {
      this.outputChannel.appendLine(`❌ Rediscovery failed: ${error.message}`);
      return [];
    }
  }
  
  /**
   * 获取MCP工具统计信息
   */
  getStatistics(): {
    totalMCPTools: number;
    initialized: boolean;
    toolIds: string[];
  } {
    return {
      totalMCPTools: this.mcpTools.size,
      initialized: this.isInitialized,
      toolIds: Array.from(this.mcpTools.keys())
    };
  }
  
  /**
   * 释放资源
   */
  dispose(): void {
    for (const wrapper of this.mcpTools.values()) {
      wrapper.dispose();
    }
    this.mcpTools.clear();
    this.discoveryService.disposeAll();
    this.outputChannel.dispose();
    
    this.outputChannel.appendLine('🗑️ MCP extension disposed');
  }
}