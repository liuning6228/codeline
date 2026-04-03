/**
 * MCP处理器
 * 处理来自webview的MCP请求，与EnhancedTaskEngine集成
 */

import * as vscode from 'vscode';
import { EnhancedTaskEngine } from '../tools/EnhancedTaskEngine';
import { MCPManager } from './mcpManager';

/**
 * MCP消息类型
 */
export interface MCPMessage {
  type: string;
  data: Record<string, any>;
}

/**
 * MCP响应类型
 */
export interface MCPResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * MCP处理器类
 */
export class MCPHandler {
  private taskEngine: EnhancedTaskEngine | null = null;
  private mcpManager: MCPManager | null = null;
  private isInitialized = false;
  private outputChannel: vscode.OutputChannel;
  
  constructor(private context: vscode.ExtensionContext) {
    this.outputChannel = vscode.window.createOutputChannel('CodeLine MCP');
  }
  
  /**
   * 初始化MCP处理器
   */
  public async initialize(workspaceRoot: string): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }
    
    try {
      this.outputChannel.show(true);
      this.outputChannel.appendLine('🔧 Initializing MCP Handler...');
      
      // 初始化增强任务引擎（带工具系统）
      this.taskEngine = new EnhancedTaskEngine(workspaceRoot, this.context, {
        enableToolSystem: true,
        autoLoadTools: true,
        showLoadingProgress: true,
      });
      
      // 加载工具
      const toolsLoaded = await this.taskEngine.loadTools();
      if (!toolsLoaded) {
        this.outputChannel.appendLine('⚠️ Tool system loaded with warnings');
      }
      
      // 获取MCP管理器适配器
      const toolRegistry = this.taskEngine.getToolRegistry();
      if (toolRegistry) {
        const mcpTool = toolRegistry.getTool('mcp-manager');
        if (mcpTool) {
          this.outputChannel.appendLine('✅ MCP tool adapter found');
        }
      }
      
      this.isInitialized = true;
      this.outputChannel.appendLine('✅ MCP Handler initialized');
      return true;
      
    } catch (error: any) {
      this.outputChannel.appendLine(`❌ MCP Handler initialization failed: ${error.message}`);
      return false;
    }
  }
  
  /**
   * 处理MCP消息
   */
  public async handleMessage(message: MCPMessage): Promise<MCPResponse> {
    if (!this.isInitialized || !this.taskEngine) {
      return {
        success: false,
        error: 'MCP Handler not initialized',
      };
    }
    
    const { type, data } = message;
    
    try {
      this.outputChannel.appendLine(`📨 Handling MCP message: ${type}`);
      
      switch (type) {
        case 'mcp_initialize':
          return await this.handleInitialize();
          
        case 'mcp_add_server':
          return await this.handleAddServer(data);
          
        case 'mcp_remove_server':
          return await this.handleRemoveServer(data);
          
        case 'mcp_connect_server':
          return await this.handleConnectServer(data);
          
        case 'mcp_disconnect_server':
          return await this.handleDisconnectServer(data);
          
        case 'mcp_toggle_tool':
          return await this.handleToggleTool(data);
          
        case 'mcp_execute_tool':
          return await this.handleExecuteTool(data);
          
        case 'mcp_refresh':
          return await this.handleRefresh();
          
        case 'mcp_get_tools':
          return await this.handleGetTools();
          
        case 'mcp_get_servers':
          return await this.handleGetServers();
          
        default:
          return {
            success: false,
            error: `Unknown MCP message type: ${type}`,
          };
      }
    } catch (error: any) {
      this.outputChannel.appendLine(`❌ MCP message handling failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  
  /**
   * 处理初始化请求
   */
  private async handleInitialize(): Promise<MCPResponse> {
    try {
      // 获取工具注册表
      const toolRegistry = this.taskEngine!.getToolRegistry();
      if (!toolRegistry) {
        return {
          success: false,
          error: 'Tool registry not available',
        };
      }
      
      // 获取当前上下文
      const toolContext = {
        extensionContext: this.context,
        workspaceRoot: this.taskEngine!['workspaceRoot'],
        cwd: process.cwd(),
        outputChannel: this.outputChannel,
        sessionId: `mcp-handler-${Date.now()}`,
      };
      
      // 获取所有工具
      const allTools = toolRegistry.getAllTools(toolContext, { enabledOnly: false });
      
      // 提取MCP工具
      const mcpTools = allTools.filter(tool => tool.id.includes('mcp') || tool.capabilities.includes('mcp'));
      
      // 模拟服务器列表（实际实现应该从配置或注册表获取）
      const servers = [
        {
          id: 'mcp-default',
          name: 'Default MCP Server',
          description: 'Built-in MCP server with standard tools',
          version: '1.0.0',
          status: 'connected' as const,
          lastConnected: Date.now(),
          toolCount: mcpTools.filter(t => t.id === 'mcp-manager').length > 0 ? 1 : 0,
          settings: {
            autoConnect: true,
            enabled: true,
          },
        },
      ];
      
      // 转换工具格式
      const tools = allTools.map(tool => ({
        id: tool.id,
        name: tool.name,
        description: tool.description,
        version: tool.version || '1.0.0',
        serverId: 'mcp-default',
        capabilities: tool.capabilities,
        enabled: tool.isEnabled?.(toolContext) ?? true,
        usageCount: 0,
        lastUsed: 0,
      }));
      
      return {
        success: true,
        data: {
          servers,
          tools,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Initialization failed: ${error.message}`,
      };
    }
  }
  
  /**
   * 处理添加服务器请求
   */
  private async handleAddServer(data: any): Promise<MCPResponse> {
    try {
      const { name, description, url, autoConnect = true } = data;
      
      if (!name || !url) {
        return {
          success: false,
          error: 'Name and URL are required',
        };
      }
      
      // 创建新服务器
      const server = {
        id: `server-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        description: description || '',
        url,
        status: autoConnect ? 'connected' : 'disconnected' as const,
        lastConnected: autoConnect ? Date.now() : 0,
        toolCount: 0,
        settings: {
          autoConnect,
          enabled: true,
        },
      };
      
      this.outputChannel.appendLine(`📋 Added MCP server: ${name} (${url})`);
      
      return {
        success: true,
        data: { server },
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to add server: ${error.message}`,
      };
    }
  }
  
  /**
   * 处理移除服务器请求
   */
  private async handleRemoveServer(data: any): Promise<MCPResponse> {
    try {
      const { serverId } = data;
      
      if (!serverId) {
        return {
          success: false,
          error: 'Server ID is required',
        };
      }
      
      this.outputChannel.appendLine(`🗑️ Removing MCP server: ${serverId}`);
      
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to remove server: ${error.message}`,
      };
    }
  }
  
  /**
   * 处理连接服务器请求
   */
  private async handleConnectServer(data: any): Promise<MCPResponse> {
    try {
      const { serverId } = data;
      
      if (!serverId) {
        return {
          success: false,
          error: 'Server ID is required',
        };
      }
      
      // 模拟连接服务器
      this.outputChannel.appendLine(`🔌 Connecting to MCP server: ${serverId}`);
      
      // 模拟获取工具
      const tools = await this.simulateServerTools(serverId);
      
      return {
        success: true,
        data: {
          tools,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to connect server: ${error.message}`,
      };
    }
  }
  
  /**
   * 处理断开服务器连接请求
   */
  private async handleDisconnectServer(data: any): Promise<MCPResponse> {
    try {
      const { serverId } = data;
      
      if (!serverId) {
        return {
          success: false,
          error: 'Server ID is required',
        };
      }
      
      this.outputChannel.appendLine(`🔌 Disconnecting from MCP server: ${serverId}`);
      
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to disconnect server: ${error.message}`,
      };
    }
  }
  
  /**
   * 处理切换工具状态请求
   */
  private async handleToggleTool(data: any): Promise<MCPResponse> {
    try {
      const { toolId, enabled } = data;
      
      if (!toolId) {
        return {
          success: false,
          error: 'Tool ID is required',
        };
      }
      
      this.outputChannel.appendLine(`🔧 ${enabled ? 'Enabling' : 'Disabling'} MCP tool: ${toolId}`);
      
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to toggle tool: ${error.message}`,
      };
    }
  }
  
  /**
   * 处理执行工具请求
   */
  private async handleExecuteTool(data: any): Promise<MCPResponse> {
    let startTime = Date.now();
    try {
      const { toolId, params = {} } = data;
      
      if (!toolId) {
        return {
          success: false,
          error: 'Tool ID is required',
        };
      }
      
      startTime = Date.now();
      this.outputChannel.appendLine(`🛠️ Executing MCP tool: ${toolId}`);
      
      // 获取工具注册表
      const toolRegistry = this.taskEngine!.getToolRegistry();
      if (!toolRegistry) {
        return {
          success: false,
          error: 'Tool registry not available',
        };
      }
      
      // 获取上下文
      const toolContext = {
        extensionContext: this.context,
        workspaceRoot: this.taskEngine!['workspaceRoot'],
        cwd: process.cwd(),
        outputChannel: this.outputChannel,
        sessionId: `tool-exec-${Date.now()}`,
      };
      
      // 执行工具
      const result = await toolRegistry.executeTool(toolId, params, toolContext);
      
      const duration = Date.now() - startTime;
      
      this.outputChannel.appendLine(`✅ MCP tool ${toolId} executed (${duration}ms)`);
      
      return {
        success: result.success,
        data: {
          output: result.output,
          duration,
        },
        error: result.error,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.outputChannel.appendLine(`❌ MCP tool execution failed: ${error.message}`);
      
      return {
        success: false,
        error: `Tool execution failed: ${error.message}`,
        data: {
          duration,
        },
      };
    }
  }
  
  /**
   * 处理刷新请求
   */
  private async handleRefresh(): Promise<MCPResponse> {
    try {
      // 重新初始化数据
      const initResponse = await this.handleInitialize();
      
      if (initResponse.success) {
        this.outputChannel.appendLine('🔄 MCP data refreshed');
      }
      
      return initResponse;
    } catch (error: any) {
      return {
        success: false,
        error: `Refresh failed: ${error.message}`,
      };
    }
  }
  
  /**
   * 处理获取工具请求
   */
  private async handleGetTools(): Promise<MCPResponse> {
    try {
      const initResponse = await this.handleInitialize();
      
      if (initResponse.success) {
        return {
          success: true,
          data: {
            tools: initResponse.data?.tools || [],
          },
        };
      }
      
      return initResponse;
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to get tools: ${error.message}`,
      };
    }
  }
  
  /**
   * 处理获取服务器请求
   */
  private async handleGetServers(): Promise<MCPResponse> {
    try {
      const initResponse = await this.handleInitialize();
      
      if (initResponse.success) {
        return {
          success: true,
          data: {
            servers: initResponse.data?.servers || [],
          },
        };
      }
      
      return initResponse;
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to get servers: ${error.message}`,
      };
    }
  }
  
  /**
   * 模拟服务器工具（用于测试）
   */
  private async simulateServerTools(serverId: string): Promise<any[]> {
    // 模拟工具列表
    const mockTools = [
      {
        id: `tool-file-read-${serverId}`,
        name: 'File Reader',
        description: 'Read and analyze files',
        version: '1.0.0',
        serverId,
        capabilities: ['file', 'read', 'analysis'],
        enabled: true,
        usageCount: 0,
        lastUsed: 0,
      },
      {
        id: `tool-code-analyze-${serverId}`,
        name: 'Code Analyzer',
        description: 'Analyze code structure and dependencies',
        version: '1.0.0',
        serverId,
        capabilities: ['code', 'analysis', 'dependencies'],
        enabled: true,
        usageCount: 0,
        lastUsed: 0,
      },
      {
        id: `tool-web-search-${serverId}`,
        name: 'Web Search',
        description: 'Search the web for information',
        version: '1.0.0',
        serverId,
        capabilities: ['web', 'search', 'information'],
        enabled: true,
        usageCount: 0,
        lastUsed: 0,
      },
    ];
    
    return mockTools;
  }
  
  /**
   * 获取处理器状态
   */
  public getStatus(): {
    isInitialized: boolean;
    toolSystemReady: boolean;
  } {
    return {
      isInitialized: this.isInitialized,
      toolSystemReady: this.taskEngine?.getToolSystemStatus().isReady || false,
    };
  }
  
  /**
   * 清理资源
   */
  public async dispose(): Promise<void> {
    if (this.taskEngine) {
      await this.taskEngine.dispose();
    }
    
    this.outputChannel.dispose();
  }
}