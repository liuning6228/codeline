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
import { EventEmitter } from 'events';
/**
 * 连接状态
 */
export declare enum ConnectionState {
    DISCONNECTED = "disconnected",
    CONNECTING = "connecting",
    CONNECTED = "connected",
    RECONNECTING = "reconnecting",
    ERROR = "error"
}
/**
 * 连接配置
 */
export interface ConnectionConfig {
    url: string;
    protocols?: string | string[];
    timeout?: number;
    maxReconnectAttempts: number;
    reconnectDelay: number;
    reconnectExponential: boolean;
    maxReconnectDelay: number;
    heartbeatInterval: number;
    heartbeatTimeout: number;
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
    correlationId?: string;
}
/**
 * 连接事件
 */
export interface ConnectionEvent {
    type: 'connected' | 'disconnected' | 'reconnecting' | 'error' | 'message' | 'heartbeat';
    data?: any;
    timestamp: number;
}
/**
 * WebSocketConnectionManager
 * 单例模式，管理所有WebSocket连接
 */
export declare class WebSocketConnectionManager extends EventEmitter {
    private static instance;
    private config;
    private connections;
    private outputChannel;
    private stats;
    private isShuttingDown;
    private constructor();
    /**
     * 获取单例实例
     */
    static getInstance(config?: Partial<ConnectionConfig>): WebSocketConnectionManager;
    /**
     * 创建或获取连接
     */
    connect(connectionId: string, customConfig?: Partial<ConnectionConfig>): Promise<ManagedConnection>;
    /**
     * 断开连接
     */
    disconnect(connectionId: string): Promise<boolean>;
    /**
     * 获取连接
     */
    getConnection(connectionId: string): ManagedConnection | undefined;
    /**
     * 获取所有连接
     */
    getAllConnections(): Map<string, ManagedConnection>;
    /**
     * 获取连接状态
     */
    getConnectionState(connectionId: string): ConnectionState | undefined;
    /**
     * 发送消息
     */
    sendMessage(connectionId: string, message: Omit<WebSocketMessage, 'id' | 'timestamp'>): Promise<WebSocketMessage>;
    /**
     * 获取统计信息
     */
    getStats(): ConnectionStats;
    /**
     * 重置统计信息
     */
    resetStats(): void;
    /**
     * 关闭所有连接
     */
    shutdown(): Promise<void>;
    /**
     * 初始化统计信息
     */
    private initializeStats;
    /**
     * 设置连接事件监听
     */
    private setupConnectionListeners;
}
/**
 * ManagedConnection
 * 单个WebSocket连接的管理包装器
 */
export declare class ManagedConnection extends EventEmitter {
    id: string;
    private config;
    private manager;
    private ws;
    private state;
    private reconnectAttempts;
    private reconnectTimer;
    private heartbeatTimer;
    private lastHeartbeatTime;
    private messageQueue;
    constructor(id: string, config: ConnectionConfig, manager: WebSocketConnectionManager);
    /**
     * 获取连接状态
     */
    getState(): ConnectionState;
    /**
     * 获取连接URL
     */
    getUrl(): string;
    /**
     * 获取重连尝试次数
     */
    getReconnectAttempts(): number;
    /**
     * 获取消息队列大小
     */
    getMessageQueueSize(): number;
    /**
     * 连接
     */
    connect(): Promise<void>;
    /**
     * 断开连接
     */
    disconnect(): Promise<void>;
    /**
     * 发送消息
     */
    sendMessage(message: Omit<WebSocketMessage, 'id' | 'timestamp'>): Promise<WebSocketMessage>;
    /**
     * 清理资源
     */
    private cleanup;
    /**
     * 设置状态
     */
    private setState;
    /**
     * 处理连接打开
     */
    private handleOpen;
    /**
     * 处理连接关闭
     */
    private handleClose;
    /**
     * 处理错误
     */
    private handleError;
    /**
     * 处理消息
     */
    private handleMessage;
    /**
     * 安排重连
     */
    private scheduleReconnect;
    /**
     * 开始心跳
     */
    private startHeartbeat;
    /**
     * 刷新消息队列
     */
    private flushMessageQueue;
    /**
     * 生成消息ID
     */
    private generateMessageId;
}
export default WebSocketConnectionManager;
//# sourceMappingURL=WebSocketConnectionManager.d.ts.map