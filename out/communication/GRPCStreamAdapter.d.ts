/**
 * GRPC流式传输适配器
 * 将WebSocket连接转换为GRPC流式服务接口
 *
 * 功能：
 * 1. GRPC方法到WebSocket消息的映射
 * 2. 流式响应支持（AsyncGenerator）
 * 3. 请求-响应关联
 * 4. 服务注册和发现
 */
import { EventEmitter } from 'events';
import WebSocketConnectionManager, { ConnectionState, ManagedConnection } from './WebSocketConnectionManager';
/**
 * GRPC方法定义
 */
export interface GRPCMethod {
    service: string;
    method: string;
    inputType: string;
    outputType: string;
    clientStreaming: boolean;
    serverStreaming: boolean;
}
/**
 * 流式响应控制器
 */
export interface StreamController<T> {
    next: (value: T) => void;
    error: (error: Error) => void;
    complete: () => void;
}
/**
 * 流式响应
 */
export interface StreamResponse<T> {
    [Symbol.asyncIterator](): AsyncIterator<T>;
    cancel(): void;
}
/**
 * GRPC请求选项
 */
export interface GRPCRequestOptions {
    timeout?: number;
    retryCount?: number;
    priority?: 'low' | 'normal' | 'high';
    metadata?: Record<string, any>;
}
/**
 * GRPC响应
 */
export interface GRPCResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    metadata?: {
        requestId: string;
        timestamp: number;
        duration: number;
        service: string;
        method: string;
    };
}
/**
 * GRPCStreamAdapter
 * 将WebSocket通信转换为GRPC接口
 */
export declare class GRPCStreamAdapter extends EventEmitter {
    private static instance;
    private connectionManager;
    private connections;
    private methodRegistry;
    private pendingRequests;
    private streamSubscriptions;
    private outputChannel;
    private constructor();
    /**
     * 获取单例实例
     */
    static getInstance(connectionManager?: WebSocketConnectionManager): GRPCStreamAdapter;
    /**
     * 注册GRPC方法
     */
    registerMethod(method: GRPCMethod): void;
    /**
     * 获取GRPC方法
     */
    getMethod(service: string, method: string): GRPCMethod | undefined;
    /**
     * 获取所有GRPC方法
     */
    getAllMethods(): GRPCMethod[];
    /**
     * 调用GRPC方法（非流式）
     */
    call<T = any>(connectionId: string, service: string, method: string, data: any, options?: GRPCRequestOptions): Promise<GRPCResponse<T>>;
    /**
     * 调用GRPC流式方法
     */
    streamCall<T = any>(connectionId: string, service: string, method: string, data: any, options?: GRPCRequestOptions): StreamResponse<T>;
    /**
     * 创建GRPC连接
     */
    createGRPCConnection(connectionId: string): Promise<GRPCConnection>;
    /**
     * 获取GRPC连接
     */
    getGRPCConnection(connectionId: string): GRPCConnection | undefined;
    /**
     * 关闭所有连接
     */
    shutdown(): Promise<void>;
    /**
     * 注册默认GRPC方法
     */
    private registerDefaultMethods;
    /**
     * 设置连接监听器
     */
    private setupConnectionListeners;
    /**
     * 设置消息处理器
     */
    private setupMessageHandler;
    /**
     * 处理传入消息
     */
    private handleIncomingMessage;
    /**
     * 处理响应消息
     */
    private handleResponse;
    /**
     * 处理事件消息
     */
    private handleEvent;
    /**
     * 处理错误消息
     */
    private handleError;
    /**
     * 等待响应
     */
    private waitForResponse;
    /**
     * 生成请求ID
     */
    private generateRequestId;
}
/**
 * GRPCConnection
 * GRPC连接的包装器
 */
export declare class GRPCConnection extends EventEmitter {
    id: string;
    private wsConnection;
    private adapter;
    private state;
    constructor(id: string, wsConnection: ManagedConnection, adapter: GRPCStreamAdapter);
    /**
     * 获取连接状态
     */
    getState(): ConnectionState;
    /**
     * 获取WebSocket连接
     */
    getWebSocketConnection(): ManagedConnection;
    /**
     * 调用GRPC方法
     */
    call<T = any>(service: string, method: string, data: any, options?: GRPCRequestOptions): Promise<GRPCResponse<T>>;
    /**
     * 调用GRPC流式方法
     */
    streamCall<T = any>(service: string, method: string, data: any, options?: GRPCRequestOptions): StreamResponse<T>;
    /**
     * 断开连接
     */
    disconnect(): Promise<void>;
    /**
     * 获取连接URL
     */
    getUrl(): string;
}
export default GRPCStreamAdapter;
//# sourceMappingURL=GRPCStreamAdapter.d.ts.map