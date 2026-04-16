/**
 * WebSocket连接管理器
 * 管理增强查询引擎的WebSocket连接，支持GRPC流式传输
 * 
 * 功能：
 * 1. 连接池管理
 * 2. 自动重连机制
 * 3. 心跳保持活跃
 * 4. 消息队列和重发
 * 5. 连接状态监控
 */

import * as vscode from 'vscode';
import { EventEmitter } from 'events';

// ==================== 类型定义 ====================

/**
 * 连接状态
 */
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
}

/**
 * 连接配置
 */
export interface ConnectionConfig {
  // 连接参数
  url: string;
  protocols?: string | string[];
  timeout?: number; // 连接超时(ms)
  
  // 重连参数
  maxReconnectAttempts: number;
  reconnectDelay: number; // 基础重连延迟(ms)
  reconnectExponential: boolean; // 是否使用指数退避
  maxReconnectDelay: number; // 最大重连延迟(ms)
  
  // 心跳参数
  heartbeatInterval: number; // 心跳间隔(ms)
  heartbeatTimeout: number; // 心跳超时(ms)
  
  // 消息参数
  maxMessageQueueSize: number;
  messageRetryCount: number;
  messageRetryDelay: number;
}

/**
 * 连接统计
 */
export interface ConnectionStats {
  totalConnections: number;
  successfulConnections: number;
  failedConnections: number;
  totalMessagesSent: number;
  totalMessagesReceived: number;
  totalBytesSent: number;
  totalBytesReceived: number;
  currentMessageQueueSize: number;
  lastConnectionTime?: Date;
  lastDisconnectionTime?: Date;
  lastError?: string;
}

/**
 * 消息包装器
 */
export interface WebSocketMessage {
  id: string;
  type: 'request' | 'response' | 'event' | 'error';
  service?: string;
  method?: string;
  data: any;
  timestamp: number;
  correlationId?: string; // 用于请求-响应匹配
}

/**
 * 连接事件
 */
export interface ConnectionEvent {
  type: 'connected' | 'disconnected' | 'reconnecting' | 'error' | 'message' | 'heartbeat';
  data?: any;
  timestamp: number;
}

// ==================== WebSocket连接管理器 ====================

/**
 * WebSocketConnectionManager
 * 单例模式，管理所有WebSocket连接
 */
export class WebSocketConnectionManager extends EventEmitter {
  private static instance: WebSocketConnectionManager;
  private config: ConnectionConfig;
  private connections: Map<string, ManagedConnection> = new Map();
  private outputChannel: vscode.OutputChannel;
  private stats: ConnectionStats;
  private isShuttingDown = false;
  
  private constructor(config?: Partial<ConnectionConfig>) {
    super();
    
    // 默认配置
    this.config = {
      url: 'ws://localhost:8080', // 默认URL
      timeout: 10000,
      maxReconnectAttempts: 5,
      reconnectDelay: 1000,
      reconnectExponential: true,
      maxReconnectDelay: 30000,
      heartbeatInterval: 30000,
      heartbeatTimeout: 5000,
      maxMessageQueueSize: 1000,
      messageRetryCount: 3,
      messageRetryDelay: 1000,
      ...config,
    };
    
    this.outputChannel = vscode.window.createOutputChannel('CodeLine WebSocket Manager');
    this.stats = this.initializeStats();
    
    this.outputChannel.appendLine('🚀 WebSocket连接管理器已初始化');
  }
  
  /**
   * 获取单例实例
   */
  public static getInstance(config?: Partial<ConnectionConfig>): WebSocketConnectionManager {
    if (!WebSocketConnectionManager.instance) {
      WebSocketConnectionManager.instance = new WebSocketConnectionManager(config);
    }
    return WebSocketConnectionManager.instance;
  }
  
  /**
   * 创建或获取连接
   */
  public async connect(connectionId: string, customConfig?: Partial<ConnectionConfig>): Promise<ManagedConnection> {
    if (this.isShuttingDown) {
      throw new Error('连接管理器正在关闭');
    }
    
    // 如果连接已存在，返回现有连接
    const existingConnection = this.connections.get(connectionId);
    if (existingConnection && existingConnection.getState() !== ConnectionState.ERROR) {
      this.outputChannel.appendLine(`📞 使用现有连接: ${connectionId}`);
      return existingConnection;
    }
    
    // 创建新连接
    this.outputChannel.appendLine(`🔗 创建新连接: ${connectionId}`);
    const config = customConfig ? { ...this.config, ...customConfig } : this.config;
    const connection = new ManagedConnection(connectionId, config, this);
    
    // 设置事件监听
    this.setupConnectionListeners(connection);
    
    // 存储连接
    this.connections.set(connectionId, connection);
    
    // 更新统计
    this.stats.totalConnections++;
    
    // 尝试连接
    try {
      await connection.connect();
      this.stats.successfulConnections++;
      this.stats.lastConnectionTime = new Date();
      this.outputChannel.appendLine(`✅ 连接成功: ${connectionId}`);
    } catch (error: any) {
      this.stats.failedConnections++;
      this.stats.lastError = error.message;
      this.outputChannel.appendLine(`❌ 连接失败: ${connectionId} - ${error.message}`);
      throw error;
    }
    
    return connection;
  }
  
  /**
   * 断开连接
   */
  public async disconnect(connectionId: string): Promise<boolean> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      this.outputChannel.appendLine(`⚠️  连接不存在: ${connectionId}`);
      return false;
    }
    
    try {
      await connection.disconnect();
      this.connections.delete(connectionId);
      this.stats.lastDisconnectionTime = new Date();
      this.outputChannel.appendLine(`🔌 连接已断开: ${connectionId}`);
      return true;
    } catch (error: any) {
      this.outputChannel.appendLine(`❌ 断开连接失败: ${connectionId} - ${error.message}`);
      return false;
    }
  }
  
  /**
   * 获取连接
   */
  public getConnection(connectionId: string): ManagedConnection | undefined {
    return this.connections.get(connectionId);
  }
  
  /**
   * 获取所有连接
   */
  public getAllConnections(): Map<string, ManagedConnection> {
    return new Map(this.connections);
  }
  
  /**
   * 获取连接状态
   */
  public getConnectionState(connectionId: string): ConnectionState | undefined {
    const connection = this.connections.get(connectionId);
    return connection?.getState();
  }
  
  /**
   * 发送消息
   */
  public async sendMessage(
    connectionId: string,
    message: Omit<WebSocketMessage, 'id' | 'timestamp'>
  ): Promise<WebSocketMessage> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`连接不存在: ${connectionId}`);
    }
    
    return await connection.sendMessage(message);
  }
  
  /**
   * 获取统计信息
   */
  public getStats(): ConnectionStats {
    return { ...this.stats };
  }
  
  /**
   * 重置统计信息
   */
  public resetStats(): void {
    this.stats = this.initializeStats();
    this.outputChannel.appendLine('📊 统计信息已重置');
  }
  
  /**
   * 关闭所有连接
   */
  public async shutdown(): Promise<void> {
    this.isShuttingDown = true;
    this.outputChannel.appendLine('🛑 正在关闭所有连接...');
    
    const disconnectPromises = Array.from(this.connections.keys()).map(
      connectionId => this.disconnect(connectionId)
    );
    
    await Promise.allSettled(disconnectPromises);
    
    this.connections.clear();
    this.outputChannel.appendLine('✅ 所有连接已关闭');
  }
  
  // ==================== 私有方法 ====================
  
  /**
   * 初始化统计信息
   */
  private initializeStats(): ConnectionStats {
    return {
      totalConnections: 0,
      successfulConnections: 0,
      failedConnections: 0,
      totalMessagesSent: 0,
      totalMessagesReceived: 0,
      totalBytesSent: 0,
      totalBytesReceived: 0,
      currentMessageQueueSize: 0,
    };
  }
  
  /**
   * 设置连接事件监听
   */
  private setupConnectionListeners(connection: ManagedConnection): void {
    connection.on('connected', () => {
      this.outputChannel.appendLine(`🔗 连接已建立: ${connection.id}`);
      this.emit('connection:connected', { connectionId: connection.id });
    });
    
    connection.on('disconnected', () => {
      this.outputChannel.appendLine(`🔌 连接已断开: ${connection.id}`);
      this.emit('connection:disconnected', { connectionId: connection.id });
    });
    
    connection.on('reconnecting', (attempt) => {
      this.outputChannel.appendLine(`🔄 正在重连: ${connection.id} (尝试 ${attempt})`);
      this.emit('connection:reconnecting', { connectionId: connection.id, attempt });
    });
    
    connection.on('error', (error) => {
      this.outputChannel.appendLine(`❌ 连接错误: ${connection.id} - ${error.message}`);
      this.stats.lastError = error.message;
      this.emit('connection:error', { connectionId: connection.id, error });
    });
    
    connection.on('message:sent', (message) => {
      this.stats.totalMessagesSent++;
      this.stats.totalBytesSent += JSON.stringify(message).length;
    });
    
    connection.on('message:received', (message) => {
      this.stats.totalMessagesReceived++;
      this.stats.totalBytesReceived += JSON.stringify(message).length;
    });
  }
}

// ==================== 管理连接 ====================

/**
 * ManagedConnection
 * 单个WebSocket连接的管理包装器
 */
export class ManagedConnection extends EventEmitter {
  public id: string;
  private config: ConnectionConfig;
  private manager: WebSocketConnectionManager;
  private ws: WebSocket | null = null;
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private lastHeartbeatTime: number = 0;
  private messageQueue: Array<{
    message: WebSocketMessage;
    resolve: (value: WebSocketMessage) => void;
    reject: (reason: any) => void;
    retries: number;
  }> = [];
  
  constructor(id: string, config: ConnectionConfig, manager: WebSocketConnectionManager) {
    super();
    this.id = id;
    this.config = config;
    this.manager = manager;
  }
  
  /**
   * 获取连接状态
   */
  public getState(): ConnectionState {
    return this.state;
  }
  
  /**
   * 获取连接URL
   */
  public getUrl(): string {
    return this.config.url;
  }
  
  /**
   * 获取重连尝试次数
   */
  public getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }
  
  /**
   * 获取消息队列大小
   */
  public getMessageQueueSize(): number {
    return this.messageQueue.length;
  }
  
  /**
   * 连接
   */
  public async connect(): Promise<void> {
    if (this.state !== ConnectionState.DISCONNECTED) {
      throw new Error(`连接状态为 ${this.state}，无法重新连接`);
    }
    
    this.setState(ConnectionState.CONNECTING);
    
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.cleanup();
        reject(new Error('连接超时'));
      }, this.config.timeout);
      
      try {
        this.ws = new WebSocket(this.config.url, this.config.protocols);
        
        this.ws.onopen = () => {
          clearTimeout(timeoutId);
          this.handleOpen();
          resolve();
        };
        
        this.ws.onclose = (event) => {
          clearTimeout(timeoutId);
          this.handleClose(event);
        };
        
        this.ws.onerror = (error) => {
          clearTimeout(timeoutId);
          this.handleError(error);
          reject(new Error('连接错误'));
        };
        
        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };
        
      } catch (error: any) {
        clearTimeout(timeoutId);
        this.cleanup();
        reject(error);
      }
    });
  }
  
  /**
   * 断开连接
   */
  public async disconnect(): Promise<void> {
    this.setState(ConnectionState.DISCONNECTED);
    this.cleanup();
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close(1000, '正常关闭');
    }
    
    this.ws = null;
    this.emit('disconnected');
  }
  
  /**
   * 发送消息
   */
  public async sendMessage(message: Omit<WebSocketMessage, 'id' | 'timestamp'>): Promise<WebSocketMessage> {
    const fullMessage: WebSocketMessage = {
      ...message,
      id: this.generateMessageId(),
      timestamp: Date.now(),
    };
    
    // 如果连接未就绪，添加到队列
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      if (this.messageQueue.length >= this.config.maxMessageQueueSize) {
        throw new Error('消息队列已满');
      }
      
      return new Promise((resolve, reject) => {
        this.messageQueue.push({
          message: fullMessage,
          resolve,
          reject,
          retries: 0,
        });
        
        // 尝试重新连接
        if (this.state === ConnectionState.DISCONNECTED) {
          this.scheduleReconnect();
        }
      });
    }
    
    // 直接发送
    try {
      this.ws.send(JSON.stringify(fullMessage));
      this.emit('message:sent', fullMessage);
      return fullMessage;
    } catch (error: any) {
      throw new Error(`发送消息失败: ${error.message}`);
    }
  }
  
  /**
   * 清理资源
   */
  private cleanup(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    this.reconnectAttempts = 0;
  }
  
  /**
   * 设置状态
   */
  private setState(newState: ConnectionState): void {
    const oldState = this.state;
    this.state = newState;
    
    if (oldState !== newState) {
      this.emit('state:changed', { oldState, newState });
    }
  }
  
  /**
   * 处理连接打开
   */
  private handleOpen(): void {
    this.setState(ConnectionState.CONNECTED);
    this.reconnectAttempts = 0;
    
    // 开始心跳
    this.startHeartbeat();
    
    // 发送队列中的消息
    this.flushMessageQueue();
    
    this.emit('connected');
  }
  
  /**
   * 处理连接关闭
   */
  private handleClose(event: CloseEvent): void {
    this.cleanup();
    
    if (event.wasClean) {
      this.setState(ConnectionState.DISCONNECTED);
      this.emit('disconnected');
    } else {
      this.setState(ConnectionState.ERROR);
      this.scheduleReconnect();
    }
  }
  
  /**
   * 处理错误
   */
  private handleError(error: Event): void {
    this.setState(ConnectionState.ERROR);
    this.emit('error', new Error('WebSocket错误'));
    
    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }
  
  /**
   * 处理消息
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as WebSocketMessage;
      this.lastHeartbeatTime = Date.now();
      this.emit('message:received', message);
      
      // 如果是心跳响应，忽略
      if (message.type === 'event' && message.data?.type === 'heartbeat') {
        return;
      }
      
      // 处理消息
      this.emit('message', message);
    } catch (error) {
      this.emit('error', new Error(`消息解析失败: ${error}`));
    }
  }
  
  /**
   * 安排重连
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.emit('error', new Error('超过最大重连尝试次数'));
      return;
    }
    
    this.reconnectAttempts++;
    this.setState(ConnectionState.RECONNECTING);
    this.emit('reconnecting', this.reconnectAttempts);
    
    // 计算重连延迟
    let delay = this.config.reconnectDelay;
    if (this.config.reconnectExponential) {
      delay = Math.min(
        this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
        this.config.maxReconnectDelay
      );
    }
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        // 连接失败，继续重试
        if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      });
    }, delay);
  }
  
  /**
   * 开始心跳
   */
  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    
    this.lastHeartbeatTime = Date.now();
    
    this.heartbeatTimer = setInterval(() => {
      // 发送心跳
      this.sendMessage({
        type: 'event',
        data: { type: 'heartbeat' },
      }).catch(() => {
        // 心跳发送失败，检查连接
        if (Date.now() - this.lastHeartbeatTime > this.config.heartbeatTimeout) {
          this.emit('error', new Error('心跳超时'));
          this.scheduleReconnect();
        }
      });
      
      // 检查心跳响应
      if (Date.now() - this.lastHeartbeatTime > this.config.heartbeatTimeout) {
        this.emit('error', new Error('心跳超时'));
        this.scheduleReconnect();
      }
    }, this.config.heartbeatInterval);
  }
  
  /**
   * 刷新消息队列
   */
  private flushMessageQueue(): void {
    const queue = [...this.messageQueue];
    this.messageQueue = [];
    
    for (const item of queue) {
      if (item.retries < this.config.messageRetryCount) {
        this.sendMessage(item.message)
          .then(item.resolve)
          .catch(() => {
            // 发送失败，重新添加到队列
            item.retries++;
            this.messageQueue.push(item);
          });
      } else {
        item.reject(new Error('消息发送失败，超过最大重试次数'));
      }
    }
  }
  
  /**
   * 生成消息ID
   */
  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default WebSocketConnectionManager;