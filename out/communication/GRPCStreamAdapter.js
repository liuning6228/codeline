"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GRPCConnection = exports.GRPCStreamAdapter = void 0;
const vscode = __importStar(require("vscode"));
const events_1 = require("events");
const WebSocketConnectionManager_1 = __importStar(require("./WebSocketConnectionManager"));
// ==================== GRPC流式传输适配器 ====================
/**
 * GRPCStreamAdapter
 * 将WebSocket通信转换为GRPC接口
 */
class GRPCStreamAdapter extends events_1.EventEmitter {
    static instance;
    connectionManager;
    connections = new Map();
    methodRegistry = new Map();
    pendingRequests = new Map();
    streamSubscriptions = new Map();
    outputChannel;
    constructor(connectionManager) {
        super();
        this.connectionManager = connectionManager || WebSocketConnectionManager_1.default.getInstance();
        this.outputChannel = vscode.window.createOutputChannel('CodeLine GRPC Adapter');
        // 注册默认GRPC方法
        this.registerDefaultMethods();
        // 监听连接事件
        this.setupConnectionListeners();
        this.outputChannel.appendLine('🚀 GRPC流式传输适配器已初始化');
    }
    /**
     * 获取单例实例
     */
    static getInstance(connectionManager) {
        if (!GRPCStreamAdapter.instance) {
            GRPCStreamAdapter.instance = new GRPCStreamAdapter(connectionManager);
        }
        return GRPCStreamAdapter.instance;
    }
    /**
     * 注册GRPC方法
     */
    registerMethod(method) {
        const key = `${method.service}.${method.method}`;
        this.methodRegistry.set(key, method);
        this.outputChannel.appendLine(`📋 注册GRPC方法: ${key}`);
    }
    /**
     * 获取GRPC方法
     */
    getMethod(service, method) {
        const key = `${service}.${method}`;
        return this.methodRegistry.get(key);
    }
    /**
     * 获取所有GRPC方法
     */
    getAllMethods() {
        return Array.from(this.methodRegistry.values());
    }
    /**
     * 调用GRPC方法（非流式）
     */
    async call(connectionId, service, method, data, options = {}) {
        const startTime = Date.now();
        const requestId = this.generateRequestId();
        this.outputChannel.appendLine(`📤 调用GRPC方法: ${service}.${method} [${requestId}]`);
        // 检查方法是否存在
        const grpcMethod = this.getMethod(service, method);
        if (!grpcMethod) {
            return {
                success: false,
                error: `方法未注册: ${service}.${method}`,
                metadata: {
                    requestId,
                    timestamp: startTime,
                    duration: Date.now() - startTime,
                    service,
                    method,
                },
            };
        }
        // 如果是流式方法，需要使用流式调用
        if (grpcMethod.serverStreaming) {
            return {
                success: false,
                error: `方法 ${service}.${method} 是流式方法，请使用 streamCall`,
                metadata: {
                    requestId,
                    timestamp: startTime,
                    duration: Date.now() - startTime,
                    service,
                    method,
                },
            };
        }
        try {
            // 发送消息
            const message = await this.connectionManager.sendMessage(connectionId, {
                type: 'request',
                service,
                method,
                data,
                correlationId: requestId,
            });
            // 等待响应
            const response = await this.waitForResponse(requestId, options.timeout || 30000);
            const duration = Date.now() - startTime;
            this.outputChannel.appendLine(`📥 GRPC响应: ${service}.${method} [${requestId}] (${duration}ms)`);
            return {
                success: true,
                data: response.data,
                metadata: {
                    requestId,
                    timestamp: startTime,
                    duration,
                    service,
                    method,
                },
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.outputChannel.appendLine(`❌ GRPC调用失败: ${service}.${method} [${requestId}] - ${error.message}`);
            return {
                success: false,
                error: error.message,
                metadata: {
                    requestId,
                    timestamp: startTime,
                    duration,
                    service,
                    method,
                },
            };
        }
    }
    /**
     * 调用GRPC流式方法
     */
    streamCall(connectionId, service, method, data, options = {}) {
        const requestId = this.generateRequestId();
        const startTime = Date.now();
        this.outputChannel.appendLine(`🌀 调用GRPC流式方法: ${service}.${method} [${requestId}]`);
        // 检查方法是否存在
        const grpcMethod = this.getMethod(service, method);
        if (!grpcMethod) {
            throw new Error(`方法未注册: ${service}.${method}`);
        }
        if (!grpcMethod.serverStreaming) {
            throw new Error(`方法 ${service}.${method} 不是流式方法，请使用 call`);
        }
        // 创建流式控制器
        const streamQueue = [];
        let streamResolve = null;
        let streamReject = null;
        let isCancelled = false;
        // 存储流式控制器
        const streamController = {
            next: (value) => {
                if (isCancelled)
                    return;
                if (streamResolve) {
                    streamResolve({ value, done: false });
                    streamResolve = null;
                }
                else {
                    streamQueue.push({ value, done: false });
                }
            },
            error: (error) => {
                if (isCancelled)
                    return;
                if (streamReject) {
                    streamReject(error);
                }
                this.streamSubscriptions.delete(requestId);
            },
            complete: () => {
                if (isCancelled)
                    return;
                if (streamResolve) {
                    streamResolve({ value: undefined, done: true });
                    streamResolve = null;
                }
                else {
                    streamQueue.push({ value: undefined, done: true });
                }
                this.streamSubscriptions.delete(requestId);
            },
        };
        this.streamSubscriptions.set(requestId, streamController);
        // 发送流式请求
        this.connectionManager.sendMessage(connectionId, {
            type: 'request',
            service,
            method,
            data,
            correlationId: requestId,
        }).catch(error => {
            streamController.error(new Error(`流式请求发送失败: ${error.message}`));
        });
        // 创建异步迭代器
        const iterator = {
            next: async () => {
                if (isCancelled) {
                    return { value: undefined, done: true };
                }
                if (streamQueue.length > 0) {
                    const item = streamQueue.shift();
                    return { value: item.value, done: item.done };
                }
                return new Promise((resolve, reject) => {
                    streamResolve = resolve;
                    streamReject = reject;
                });
            },
        };
        // 创建流式响应
        const streamResponse = {
            [Symbol.asyncIterator]: () => iterator,
            cancel: () => {
                isCancelled = true;
                // 发送取消请求
                this.connectionManager.sendMessage(connectionId, {
                    type: 'request',
                    service,
                    method: `${method}.cancel`,
                    data: { requestId },
                }).catch(() => {
                    // 忽略取消错误
                });
                this.streamSubscriptions.delete(requestId);
                this.outputChannel.appendLine(`⏹️ 流式调用已取消: ${service}.${method} [${requestId}]`);
            },
        };
        return streamResponse;
    }
    /**
     * 创建GRPC连接
     */
    async createGRPCConnection(connectionId) {
        // 如果连接已存在，返回现有连接
        const existingConnection = this.connections.get(connectionId);
        if (existingConnection) {
            return existingConnection;
        }
        // 创建WebSocket连接
        const wsConnection = await this.connectionManager.connect(connectionId);
        // 创建GRPC连接
        const grpcConnection = new GRPCConnection(connectionId, wsConnection, this);
        this.connections.set(connectionId, grpcConnection);
        // 设置消息处理器
        this.setupMessageHandler(grpcConnection);
        this.outputChannel.appendLine(`🔗 创建GRPC连接: ${connectionId}`);
        return grpcConnection;
    }
    /**
     * 获取GRPC连接
     */
    getGRPCConnection(connectionId) {
        return this.connections.get(connectionId);
    }
    /**
     * 关闭所有连接
     */
    async shutdown() {
        // 取消所有流式订阅
        for (const [requestId, controller] of this.streamSubscriptions) {
            controller.complete();
        }
        this.streamSubscriptions.clear();
        // 拒绝所有待处理请求
        for (const [requestId, pending] of this.pendingRequests) {
            clearTimeout(pending.timeout);
            pending.reject(new Error('GRPC适配器正在关闭'));
        }
        this.pendingRequests.clear();
        // 关闭所有GRPC连接
        for (const connection of this.connections.values()) {
            await connection.disconnect();
        }
        this.connections.clear();
        this.outputChannel.appendLine('🛑 GRPC流式传输适配器已关闭');
    }
    // ==================== 私有方法 ====================
    /**
     * 注册默认GRPC方法
     */
    registerDefaultMethods() {
        // UiService
        this.registerMethod({
            service: 'UiService',
            method: 'onDidShowAnnouncement',
            inputType: 'Empty',
            outputType: 'BooleanValue',
            clientStreaming: false,
            serverStreaming: false,
        });
        this.registerMethod({
            service: 'UiService',
            method: 'initializeWebview',
            inputType: 'Empty',
            outputType: 'Empty',
            clientStreaming: false,
            serverStreaming: false,
        });
        this.registerMethod({
            service: 'UiService',
            method: 'getWebviewHtml',
            inputType: 'Empty',
            outputType: 'StringValue',
            clientStreaming: false,
            serverStreaming: false,
        });
        this.registerMethod({
            service: 'UiService',
            method: 'openUrl',
            inputType: 'StringValue',
            outputType: 'Empty',
            clientStreaming: false,
            serverStreaming: false,
        });
        // StateService
        this.registerMethod({
            service: 'StateService',
            method: 'getLatestState',
            inputType: 'Empty',
            outputType: 'State',
            clientStreaming: false,
            serverStreaming: false,
        });
        this.registerMethod({
            service: 'StateService',
            method: 'subscribeToState',
            inputType: 'Empty',
            outputType: 'State',
            clientStreaming: false,
            serverStreaming: true, // 流式方法
        });
        this.registerMethod({
            service: 'StateService',
            method: 'dismissBanner',
            inputType: 'StringValue',
            outputType: 'Empty',
            clientStreaming: false,
            serverStreaming: false,
        });
        this.registerMethod({
            service: 'StateService',
            method: 'updateSettings',
            inputType: 'Settings',
            outputType: 'Empty',
            clientStreaming: false,
            serverStreaming: false,
        });
        this.registerMethod({
            service: 'StateService',
            method: 'togglePlanActModeProto',
            inputType: 'Empty',
            outputType: 'BooleanValue',
            clientStreaming: false,
            serverStreaming: false,
        });
        // QueryService
        this.registerMethod({
            service: 'QueryService',
            method: 'submitMessage',
            inputType: 'StringValue',
            outputType: 'MessageResponse',
            clientStreaming: false,
            serverStreaming: false,
        });
        this.registerMethod({
            service: 'QueryService',
            method: 'cancelMessage',
            inputType: 'StringValue',
            outputType: 'Empty',
            clientStreaming: false,
            serverStreaming: false,
        });
    }
    /**
     * 设置连接监听器
     */
    setupConnectionListeners() {
        this.connectionManager.on('connection:connected', ({ connectionId }) => {
            this.outputChannel.appendLine(`🔗 WebSocket连接已建立: ${connectionId}`);
        });
        this.connectionManager.on('connection:disconnected', ({ connectionId }) => {
            this.outputChannel.appendLine(`🔌 WebSocket连接已断开: ${connectionId}`);
            // 清理相关的GRPC连接
            const grpcConnection = this.connections.get(connectionId);
            if (grpcConnection) {
                grpcConnection.disconnect();
                this.connections.delete(connectionId);
            }
        });
        this.connectionManager.on('connection:error', ({ connectionId, error }) => {
            this.outputChannel.appendLine(`❌ WebSocket连接错误: ${connectionId} - ${error.message}`);
        });
    }
    /**
     * 设置消息处理器
     */
    setupMessageHandler(grpcConnection) {
        const wsConnection = grpcConnection.getWebSocketConnection();
        wsConnection.on('message', (message) => {
            this.handleIncomingMessage(message, grpcConnection);
        });
    }
    /**
     * 处理传入消息
     */
    handleIncomingMessage(message, grpcConnection) {
        switch (message.type) {
            case 'response':
                this.handleResponse(message);
                break;
            case 'event':
                this.handleEvent(message, grpcConnection);
                break;
            case 'error':
                this.handleError(message);
                break;
            default:
                this.outputChannel.appendLine(`⚠️  未知消息类型: ${message.type}`);
        }
    }
    /**
     * 处理响应消息
     */
    handleResponse(message) {
        if (!message.correlationId) {
            this.outputChannel.appendLine('⚠️  响应消息缺少correlationId');
            return;
        }
        const pendingRequest = this.pendingRequests.get(message.correlationId);
        if (!pendingRequest) {
            // 可能是流式响应的第一个消息
            const streamController = this.streamSubscriptions.get(message.correlationId);
            if (streamController) {
                streamController.next(message.data);
            }
            else {
                this.outputChannel.appendLine(`⚠️  未知的correlationId: ${message.correlationId}`);
            }
            return;
        }
        // 清除超时
        clearTimeout(pendingRequest.timeout);
        // 解析响应
        pendingRequest.resolve({
            data: message.data,
            metadata: message.correlationId,
        });
        this.pendingRequests.delete(message.correlationId);
    }
    /**
     * 处理事件消息
     */
    handleEvent(message, grpcConnection) {
        const { service, method, data } = message;
        if (service && method) {
            // 服务事件
            grpcConnection.emit('service:event', { service, method, data });
            this.emit('service:event', {
                connectionId: grpcConnection.id,
                service,
                method,
                data
            });
        }
        else {
            // 通用事件
            grpcConnection.emit('event', data);
            this.emit('event', { connectionId: grpcConnection.id, data });
        }
    }
    /**
     * 处理错误消息
     */
    handleError(message) {
        if (message.correlationId) {
            const pendingRequest = this.pendingRequests.get(message.correlationId);
            if (pendingRequest) {
                clearTimeout(pendingRequest.timeout);
                pendingRequest.reject(new Error(message.data?.message || 'GRPC错误'));
                this.pendingRequests.delete(message.correlationId);
            }
            const streamController = this.streamSubscriptions.get(message.correlationId);
            if (streamController) {
                streamController.error(new Error(message.data?.message || 'GRPC流式错误'));
                this.streamSubscriptions.delete(message.correlationId);
            }
        }
        this.outputChannel.appendLine(`❌ GRPC错误: ${JSON.stringify(message.data)}`);
    }
    /**
     * 等待响应
     */
    waitForResponse(requestId, timeout) {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                this.pendingRequests.delete(requestId);
                reject(new Error('请求超时'));
            }, timeout);
            this.pendingRequests.set(requestId, {
                resolve,
                reject,
                timeout: timeoutId,
                metadata: { requestId },
            });
        });
    }
    /**
     * 生成请求ID
     */
    generateRequestId() {
        return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.GRPCStreamAdapter = GRPCStreamAdapter;
// ==================== GRPC连接 ====================
/**
 * GRPCConnection
 * GRPC连接的包装器
 */
class GRPCConnection extends events_1.EventEmitter {
    id;
    wsConnection;
    adapter;
    state = WebSocketConnectionManager_1.ConnectionState.DISCONNECTED;
    constructor(id, wsConnection, adapter) {
        super();
        this.id = id;
        this.wsConnection = wsConnection;
        this.adapter = adapter;
        this.state = wsConnection.getState();
        // 监听WebSocket连接状态
        wsConnection.on('state:changed', ({ oldState, newState }) => {
            this.state = newState;
            this.emit('state:changed', { oldState, newState });
        });
    }
    /**
     * 获取连接状态
     */
    getState() {
        return this.state;
    }
    /**
     * 获取WebSocket连接
     */
    getWebSocketConnection() {
        return this.wsConnection;
    }
    /**
     * 调用GRPC方法
     */
    async call(service, method, data, options = {}) {
        return await this.adapter.call(this.id, service, method, data, options);
    }
    /**
     * 调用GRPC流式方法
     */
    streamCall(service, method, data, options = {}) {
        return this.adapter.streamCall(this.id, service, method, data, options);
    }
    /**
     * 断开连接
     */
    async disconnect() {
        await this.wsConnection.disconnect();
        this.state = WebSocketConnectionManager_1.ConnectionState.DISCONNECTED;
        this.emit('disconnected');
    }
    /**
     * 获取连接URL
     */
    getUrl() {
        return this.wsConnection.getUrl();
    }
}
exports.GRPCConnection = GRPCConnection;
exports.default = GRPCStreamAdapter;
//# sourceMappingURL=GRPCStreamAdapter.js.map