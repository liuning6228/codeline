/**
 * MCP服务
 * 提供前端与后端MCP工具系统的通信接口
 */

import { vscode } from '../lib/vscode';

/**
 * MCP服务器信息
 */
export interface MCPServer {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'connected' | 'disconnected' | 'error';
  lastConnected: number;
  toolCount: number;
  settings: {
    autoConnect: boolean;
    enabled: boolean;
  };
}

/**
 * MCP工具信息
 */
export interface MCPTool {
  id: string;
  name: string;
  description: string;
  version: string;
  serverId: string;
  capabilities: string[];
  enabled: boolean;
  usageCount: number;
  lastUsed: number;
}

/**
 * MCP工具执行结果
 */
export interface MCPToolResult {
  success: boolean;
  output?: any;
  error?: string;
  duration: number;
  toolId: string;
}

/**
 * MCP服务类
 */
export class McpService {
  private static instance: McpService;
  private servers: MCPServer[] = [];
  private tools: MCPTool[] = [];
  private isInitialized = false;
  
  private constructor() {}
  
  /**
   * 获取单例实例
   */
  public static getInstance(): McpService {
    if (!McpService.instance) {
      McpService.instance = new McpService();
    }
    return McpService.instance;
  }
  
  /**
   * 初始化MCP服务
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }
    
    try {
      // 发送初始化请求到VS Code扩展
      const response = await vscode.postMessage({
        type: 'mcp_initialize',
        data: {},
      });
      
      if (response.success) {
        this.servers = response.servers || [];
        this.tools = response.tools || [];
        this.isInitialized = true;
        
        console.log('MCP Service initialized:', {
          serverCount: this.servers.length,
          toolCount: this.tools.length,
        });
        
        return true;
      } else {
        console.error('MCP Service initialization failed:', response.error);
        return false;
      }
    } catch (error) {
      console.error('MCP Service initialization error:', error);
      return false;
    }
  }
  
  /**
   * 获取所有MCP服务器
   */
  public getServers(): MCPServer[] {
    return this.servers;
  }
  
  /**
   * 获取所有MCP工具
   */
  public getTools(): MCPTool[] {
    return this.tools;
  }
  
  /**
   * 获取指定服务器的工具
   */
  public getToolsByServer(serverId: string): MCPTool[] {
    return this.tools.filter(tool => tool.serverId === serverId);
  }
  
  /**
   * 获取可用工具（启用的）
   */
  public getAvailableTools(): MCPTool[] {
    return this.tools.filter(tool => tool.enabled);
  }
  
  /**
   * 获取工具信息
   */
  public getTool(toolId: string): MCPTool | undefined {
    return this.tools.find(tool => tool.id === toolId);
  }
  
  /**
   * 获取服务器信息
   */
  public getServer(serverId: string): MCPServer | undefined {
    return this.servers.find(server => server.id === serverId);
  }
  
  /**
   * 添加MCP服务器
   */
  public async addServer(serverConfig: {
    name: string;
    description: string;
    url: string;
    autoConnect?: boolean;
  }): Promise<boolean> {
    try {
      const response = await vscode.postMessage({
        type: 'mcp_add_server',
        data: serverConfig,
      });
      
      if (response.success && response.server) {
        this.servers.push(response.server);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to add MCP server:', error);
      return false;
    }
  }
  
  /**
   * 删除MCP服务器
   */
  public async removeServer(serverId: string): Promise<boolean> {
    try {
      const response = await vscode.postMessage({
        type: 'mcp_remove_server',
        data: { serverId },
      });
      
      if (response.success) {
        this.servers = this.servers.filter(server => server.id !== serverId);
        this.tools = this.tools.filter(tool => tool.serverId !== serverId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to remove MCP server:', error);
      return false;
    }
  }
  
  /**
   * 连接服务器
   */
  public async connectServer(serverId: string): Promise<boolean> {
    try {
      const response = await vscode.postMessage({
        type: 'mcp_connect_server',
        data: { serverId },
      });
      
      if (response.success) {
        const server = this.servers.find(s => s.id === serverId);
        if (server) {
          server.status = 'connected';
          server.lastConnected = Date.now();
          
          // 更新工具列表
          if (response.tools) {
            this.tools = this.tools.filter(tool => tool.serverId !== serverId);
            this.tools.push(...response.tools);
          }
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to connect MCP server:', error);
      return false;
    }
  }
  
  /**
   * 断开服务器连接
   */
  public async disconnectServer(serverId: string): Promise<boolean> {
    try {
      const response = await vscode.postMessage({
        type: 'mcp_disconnect_server',
        data: { serverId },
      });
      
      if (response.success) {
        const server = this.servers.find(s => s.id === serverId);
        if (server) {
          server.status = 'disconnected';
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to disconnect MCP server:', error);
      return false;
    }
  }
  
  /**
   * 启用/禁用工具
   */
  public async toggleTool(toolId: string, enabled: boolean): Promise<boolean> {
    try {
      const response = await vscode.postMessage({
        type: 'mcp_toggle_tool',
        data: { toolId, enabled },
      });
      
      if (response.success) {
        const tool = this.tools.find(t => t.id === toolId);
        if (tool) {
          tool.enabled = enabled;
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to toggle MCP tool:', error);
      return false;
    }
  }
  
  /**
   * 执行MCP工具
   */
  public async executeTool(
    toolId: string, 
    params: Record<string, any> = {}
  ): Promise<MCPToolResult> {
    try {
      const response = await vscode.postMessage({
        type: 'mcp_execute_tool',
        data: { toolId, params },
      });
      
      if (response.success) {
        // 更新工具使用统计
        const tool = this.tools.find(t => t.id === toolId);
        if (tool) {
          tool.usageCount++;
          tool.lastUsed = Date.now();
        }
        
        return {
          success: true,
          output: response.output,
          duration: response.duration || 0,
          toolId,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Tool execution failed',
          duration: response.duration || 0,
          toolId,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error',
        duration: 0,
        toolId,
      };
    }
  }
  
  /**
   * 刷新工具列表
   */
  public async refresh(): Promise<boolean> {
    try {
      const response = await vscode.postMessage({
        type: 'mcp_refresh',
        data: {},
      });
      
      if (response.success) {
        this.servers = response.servers || [];
        this.tools = response.tools || [];
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to refresh MCP data:', error);
      return false;
    }
  }
  
  /**
   * 搜索工具
   */
  public searchTools(query: string): MCPTool[] {
    if (!query.trim()) {
      return this.tools;
    }
    
    const queryLower = query.toLowerCase();
    return this.tools.filter(tool => 
      tool.name.toLowerCase().includes(queryLower) ||
      tool.description.toLowerCase().includes(queryLower) ||
      tool.capabilities.some(cap => cap.toLowerCase().includes(queryLower))
    );
  }
  
  /**
   * 获取服务状态
   */
  public getStatus(): {
    initialized: boolean;
    serverCount: number;
    toolCount: number;
    availableToolCount: number;
  } {
    return {
      initialized: this.isInitialized,
      serverCount: this.servers.length,
      toolCount: this.tools.length,
      availableToolCount: this.getAvailableTools().length,
    };
  }
}