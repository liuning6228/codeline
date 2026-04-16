/**
 * EnhancedEngineAdapter - 增强查询引擎适配器
 *
 * 负责：
 * 1. 初始化EnhancedQueryEngine
 * 2. 配置依赖注入（ModelAdapter、ToolRegistry等）
 * 3. 与CodeLine扩展桥接
 * 4. 提供统一的接口供sidebarProvider调用
 *
 * 设计原则：单例模式，按需初始化，资源懒加载
 */
import * as vscode from 'vscode';
import { EnhancedToolRegistry, ToolRegistryConfig } from './tool/EnhancedToolRegistry';
import { EnhancedQueryEngine, ConversationState } from './EnhancedQueryEngine';
import { CodeLineExtension } from '../extension';
/**
 * 增强引擎适配器配置
 */
export interface EnhancedEngineAdapterConfig {
    extension: CodeLineExtension;
    context: vscode.ExtensionContext;
    verbose?: boolean;
    enableStreaming?: boolean;
    defaultMode?: 'plan' | 'act';
    maxConcurrentTools?: number;
    toolRegistryConfig?: Partial<ToolRegistryConfig>;
    onEngineReady?: () => void;
    onStateUpdate?: (state: ConversationState) => void;
    onError?: (error: Error) => void;
}
/**
 * 适配器状态
 */
export interface AdapterState {
    engineReady: boolean;
    engineMode: 'plan' | 'act';
    toolCount: number;
    conversationCount: number;
    lastActivity: Date;
    usageStats?: any;
}
/**
 * EnhancedEngineAdapter
 * 负责管理EnhancedQueryEngine的生命周期和与CodeLine扩展的集成
 */
export declare class EnhancedEngineAdapter {
    private static instance;
    private config;
    private engine;
    private toolRegistry;
    private adapterState;
    private outputChannel;
    private initializationPromise;
    private constructor();
    /**
     * 获取单例实例
     */
    static getInstance(config?: EnhancedEngineAdapterConfig): EnhancedEngineAdapter;
    /**
     * 初始化增强查询引擎
     * 使用懒加载模式，避免启动时阻塞
     */
    initialize(): Promise<boolean>;
    /**
     * 实际初始化过程
     */
    private doInitialize;
    /**
     * 获取当前引擎（如果已初始化）
     */
    getEngine(): EnhancedQueryEngine | null;
    /**
     * 获取工具注册表
     */
    getToolRegistry(): EnhancedToolRegistry | null;
    /**
     * 获取适配器状态
     */
    getState(): AdapterState;
    /**
     * 检查引擎是否就绪
     */
    isReady(): boolean;
    /**
     * 获取引擎模式
     */
    getMode(): 'plan' | 'act';
    /**
     * 设置引擎模式
     */
    setMode(mode: 'plan' | 'act'): void;
    /**
     * 提交消息到引擎
     */
    submitMessage(content: string, options?: {
        images?: string[];
        files?: string[];
        context?: Record<string, any>;
        skipThinking?: boolean;
        skipTools?: boolean;
    }): Promise<{
        success: boolean;
        message?: any;
        toolCalls?: any[];
        thinking?: string;
        error?: string;
    }>;
    /**
     * 获取当前对话状态
     */
    getConversationState(): ConversationState | null;
    /**
     * 清除当前对话
     */
    clearConversation(): void;
    /**
     * 导出当前对话
     */
    exportConversation(): string | null;
    /**
     * 导入对话
     */
    importConversation(json: string): boolean;
    /**
     * 重置适配器
     */
    reset(): void;
    /**
     * 初始化工具注册表
     */
    private initializeToolRegistry;
    /**
     * 注册基本工具集
     */
    private registerBasicTools;
    /**
     * 获取核心依赖
     */
    private getDependencies;
    /**
     * 创建增强查询引擎
     */
    private createEnhancedQueryEngine;
    /**
     * 配置引擎设置
     */
    private configureEngine;
}
export default EnhancedEngineAdapter;
//# sourceMappingURL=EnhancedEngineAdapter.d.ts.map