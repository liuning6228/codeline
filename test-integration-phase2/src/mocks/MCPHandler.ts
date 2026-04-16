/**
 * MCPHandler模拟类
 * 模拟真实MCPHandler的核心功能，用于测试EnhancedEngineAdapter与MCP的交互
 */

// ==================== 类型定义 ====================

/**
 * MCPHandler配置
 */
export interface MCPHandlerConfig {
  enableMCPTools?: boolean;
  enableToolSystem?: boolean;
  verboseLogging?: boolean;
  autoLoadConfigPath?: string;
  defaultTimeout?: number;
  maxRetries?: number;
  enableMonitoring?: boolean;
  monitoringSampleRate?: number;
}

/**
 * MCP消息类型
 */
export interface MCPMessage {
  type: string;
  data: Record<string, any>;
  messageId?: string;
  timestamp?: number;
}

/**
 * MCP响应类型
 */
export interface MCPResponse {
  success: boolean;
  data?: any;
  error?: string;
  messageId?: string;
  timestamp?: number;
  duration?: number;
  metrics?: {
    toolExecutionTime?: number;
    validationTime?: number;
    permissionCheckTime?: number;
  };
}

/**
 * MCP监控指标
 */
export interface MCPMetrics {
  initializationTime: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  registeredTools: number;
  lastErrorTime?: number;
  lastErrorMessage?: string;
}

/**
 * 工具信息
 */
export interface MCPToolInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters: Record<string, any>;
  enabled: boolean;
}

// ==================== MCPHandler模拟 ====================

export class MockMCPHandler {
  private config: MCPHandlerConfig;
  private isInitialized = false;
  private metrics: MCPMetrics;
  private tools: MCPToolInfo[] = [];
  private servers: any[] = [];
  private context: any;
  
  constructor(context: any, config: Partial<MCPHandlerConfig> = {}) {
    console.log('MockMCPHandler: 创建实例');
    
    this.context = context;
    this.config = {
      enableMCPTools: true,
      enableToolSystem: true,
      verboseLogging: false,
      defaultTimeout: 30000,
      maxRetries: 3,
      enableMonitoring: true,
      monitoringSampleRate: 0.1,
      ...config
    };
    
    // 初始化指标
    this.metrics = {
      initializationTime: 0,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      registeredTools: 0,
    };
    
    if (this.config.verboseLogging) {
      console.log('MockMCPHandler: 详细日志已启用');
    }
  }
  
  // ========== 核心API方法 ==========
  
  /**
   * 初始化MCP处理器
   */
  public async initialize(workspaceRoot: string, overrideConfig?: Partial<MCPHandlerConfig>): Promise<boolean> {
    if (this.isInitialized) {
      console.log('MockMCPHandler: 已经初始化');
      return true;
    }
    
    const startTime = Date.now();
    
    // 更新配置
    if (overrideConfig) {
      this.config = { ...this.config, ...overrideConfig };
    }
    
    try {
      console.log(`MockMCPHandler: 正在初始化，工作区: ${workspaceRoot}`);
      
      // 模拟初始化延迟
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 加载模拟工具
      this.loadDefaultTools();
      
      // 设置指标
      this.metrics.initializationTime = Date.now() - startTime;
      this.metrics.registeredTools = this.tools.length;
      
      this.isInitialized = true;
      
      console.log(`MockMCPHandler: 初始化成功，加载了 ${this.tools.length} 个工具`);
      return true;
      
    } catch (error: any) {
      console.error('MockMCPHandler: 初始化失败:', error.message);
      this.metrics.lastErrorTime = Date.now();
      this.metrics.lastErrorMessage = error.message;
      return false;
    }
  }
  
  /**
   * 处理MCP消息
   */
  public async handleMessage(message: MCPMessage): Promise<MCPResponse> {
    const startTime = Date.now();
    const messageId = message.messageId || `mock-msg-${Date.now()}`;
    
    // 更新指标
    this.metrics.totalRequests++;
    
    try {
      // 验证消息
      if (!message.type) {
        throw new Error('消息类型缺失');
      }
      
      if (this.config.verboseLogging) {
        console.log(`MockMCPHandler: 处理消息类型: ${message.type}`);
      }
      
      let responseData: any;
      
      // 根据消息类型处理
      switch (message.type) {
        case 'mcp_initialize':
          responseData = await this.handleInitialize();
          break;
          
        case 'mcp_add_server':
          responseData = await this.handleAddServer(message.data);
          break;
          
        case 'mcp_remove_server':
          responseData = await this.handleRemoveServer(message.data);
          break;
          
        case 'mcp_connect_server':
          responseData = await this.handleConnectServer(message.data);
          break;
          
        case 'mcp_disconnect_server':
          responseData = await this.handleDisconnectServer(message.data);
          break;
          
        case 'mcp_toggle_tool':
          responseData = await this.handleToggleTool(message.data);
          break;
          
        case 'mcp_execute_tool':
          responseData = await this.handleExecuteTool(message.data);
          break;
          
        case 'mcp_refresh':
          responseData = await this.handleRefresh();
          break;
          
        case 'mcp_get_tools':
          responseData = await this.handleGetTools();
          break;
          
        case 'mcp_get_servers':
          responseData = await this.handleGetServers();
          break;
          
        case 'mcp_health_check':
          responseData = await this.handleHealthCheck();
          break;
          
        case 'mcp_metrics':
          responseData = await this.handleGetMetrics();
          break;
          
        default:
          throw new Error(`不支持的消息类型: ${message.type}`);
      }
      
      const duration = Date.now() - startTime;
      this.metrics.successfulRequests++;
      
      // 更新平均响应时间
      const totalRequests = this.metrics.totalRequests;
      const prevAvg = this.metrics.averageResponseTime;
      this.metrics.averageResponseTime = prevAvg + (duration - prevAvg) / totalRequests;
      
      return {
        success: true,
        data: responseData,
        messageId,
        timestamp: Date.now(),
        duration,
        metrics: {
          toolExecutionTime: duration,
          validationTime: 10,
          permissionCheckTime: 5,
        }
      };
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.metrics.failedRequests++;
      this.metrics.lastErrorTime = Date.now();
      this.metrics.lastErrorMessage = error.message;
      
      return {
        success: false,
        error: error.message,
        messageId,
        timestamp: Date.now(),
        duration,
      };
    }
  }
  
  /**
   * 获取指标
   */
  public getMetrics(): MCPMetrics {
    return { ...this.metrics };
  }
  
  /**
   * 获取状态
   */
  public getStatus(): string {
    return this.isInitialized ? '已初始化' : '未初始化';
  }
  
  /**
   * 获取监控数据
   */
  public getMonitoringData(): any {
    return {
      metrics: this.metrics,
      recentErrors: this.metrics.lastErrorMessage ? [
        {
          timestamp: this.metrics.lastErrorTime || Date.now(),
          message: this.metrics.lastErrorMessage,
          type: 'error'
        }
      ] : [],
      toolStats: this.tools.map(tool => ({
        id: tool.id,
        name: tool.name,
        enabled: tool.enabled,
        category: tool.category
      })),
      serverStats: this.servers.map(server => ({
        name: server.name || '未知',
        status: server.status || 'unknown',
        tools: server.tools || 0
      })),
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * 清理资源
   */
  public async dispose(): Promise<void> {
    console.log('MockMCPHandler: 清理资源');
    this.isInitialized = false;
    this.tools = [];
    this.servers = [];
  }
  
  // ========== 消息处理程序 ==========
  
  /**
   * 处理初始化消息
   */
  private async handleInitialize(): Promise<any> {
    return {
      initialized: this.isInitialized,
      toolCount: this.tools.length,
      serverCount: this.servers.length,
      status: this.getStatus(),
    };
  }
  
  /**
   * 处理添加服务器消息
   */
  private async handleAddServer(data: any): Promise<any> {
    const server = {
      id: `server-${Date.now()}`,
      name: data.name || '未命名服务器',
      type: data.type || 'custom',
      connected: false,
      config: data,
    };
    
    this.servers.push(server);
    
    return {
      serverId: server.id,
      success: true,
    };
  }
  
  /**
   * 处理移除服务器消息
   */
  private async handleRemoveServer(data: any): Promise<any> {
    const index = this.servers.findIndex(s => s.id === data.serverId);
    if (index === -1) {
      throw new Error(`服务器未找到: ${data.serverId}`);
    }
    
    this.servers.splice(index, 1);
    
    return {
      success: true,
      removed: data.serverId,
    };
  }
  
  /**
   * 处理连接服务器消息
   */
  private async handleConnectServer(data: any): Promise<any> {
    const server = this.servers.find(s => s.id === data.serverId);
    if (!server) {
      throw new Error(`服务器未找到: ${data.serverId}`);
    }
    
    // 模拟连接延迟
    await new Promise(resolve => setTimeout(resolve, 50));
    
    server.connected = true;
    
    return {
      success: true,
      connected: true,
      serverId: server.id,
    };
  }
  
  /**
   * 处理断开服务器连接消息
   */
  private async handleDisconnectServer(data: any): Promise<any> {
    const server = this.servers.find(s => s.id === data.serverId);
    if (!server) {
      throw new Error(`服务器未找到: ${data.serverId}`);
    }
    
    server.connected = false;
    
    return {
      success: true,
      connected: false,
      serverId: server.id,
    };
  }
  
  /**
   * 处理切换工具状态消息
   */
  private async handleToggleTool(data: any): Promise<any> {
    const tool = this.tools.find(t => t.id === data.toolId);
    if (!tool) {
      throw new Error(`工具未找到: ${data.toolId}`);
    }
    
    tool.enabled = !tool.enabled;
    
    return {
      success: true,
      toolId: tool.id,
      enabled: tool.enabled,
    };
  }
  
  /**
   * 处理执行工具消息
   */
  private async handleExecuteTool(data: any): Promise<any> {
    const tool = this.tools.find(t => t.id === data.toolId);
    if (!tool) {
      throw new Error(`工具未找到: ${data.toolId}`);
    }
    
    if (!tool.enabled) {
      throw new Error(`工具已禁用: ${data.toolId}`);
    }
    
    // 模拟工具执行延迟
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // 生成模拟结果
    const result = {
      toolId: tool.id,
      toolName: tool.name,
      executionTime: 200,
      success: true,
      output: `模拟工具执行结果: ${tool.name}`,
      data: {
        parameters: data.parameters || {},
        timestamp: new Date().toISOString(),
      },
    };
    
    return result;
  }
  
  /**
   * 处理刷新消息
   */
  private async handleRefresh(): Promise<any> {
    // 重新加载工具
    this.loadDefaultTools();
    
    return {
      success: true,
      toolCount: this.tools.length,
      serverCount: this.servers.length,
    };
  }
  
  /**
   * 处理获取工具消息
   */
  private async handleGetTools(): Promise<any> {
    return {
      tools: this.tools,
      count: this.tools.length,
    };
  }
  
  /**
   * 处理获取服务器消息
   */
  private async handleGetServers(): Promise<any> {
    return {
      servers: this.servers,
      count: this.servers.length,
    };
  }
  
  /**
   * 处理健康检查消息
   */
  private async handleHealthCheck(): Promise<any> {
    return {
      healthy: this.isInitialized,
      status: this.getStatus(),
      metrics: this.getMetrics(),
      timestamp: new Date().toISOString(),
    };
  }
  
  /**
   * 处理获取指标消息
   */
  private async handleGetMetrics(): Promise<any> {
    return {
      metrics: this.getMetrics(),
      status: this.getStatus(),
    };
  }
  
  // ========== 辅助方法 ==========
  
  /**
   * 加载默认工具
   */
  private loadDefaultTools(): void {
    this.tools = [
      {
        id: 'read_file',
        name: '读取文件',
        description: '读取文件内容',
        category: 'file',
        parameters: {
          path: { type: 'string', required: true, description: '文件路径' }
        },
        enabled: true,
      },
      {
        id: 'write_file',
        name: '写入文件',
        description: '写入内容到文件',
        category: 'file',
        parameters: {
          path: { type: 'string', required: true, description: '文件路径' },
          content: { type: 'string', required: true, description: '文件内容' }
        },
        enabled: true,
      },
      {
        id: 'execute_command',
        name: '执行命令',
        description: '在终端中执行命令',
        category: 'terminal',
        parameters: {
          command: { type: 'string', required: true, description: '要执行的命令' },
          cwd: { type: 'string', required: false, description: '工作目录' }
        },
        enabled: true,
      },
      {
        id: 'analyze_code',
        name: '分析代码',
        description: '分析代码结构和质量',
        category: 'code',
        parameters: {
          path: { type: 'string', required: true, description: '代码路径' },
          language: { type: 'string', required: false, description: '编程语言' }
        },
        enabled: true,
      },
    ];
    
    console.log(`MockMCPHandler: 加载了 ${this.tools.length} 个默认工具`);
  }
}

// ==================== 导出 ====================

export default MockMCPHandler;