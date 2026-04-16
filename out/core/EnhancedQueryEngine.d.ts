/**
 * EnhancedQueryEngine - 基于Claude Code架构的增强对话引擎
 *
 * 设计原则：
 * 1. 配置驱动：所有可变依赖通过配置对象注入
 * 2. 工具集成：支持插件化工具系统
 * 3. 流式响应：支持异步生成器流式输出
 * 4. 状态管理：完整的对话状态和工具执行状态
 * 5. 类型安全：完整的TypeScript类型定义
 *
 * 参考模式：CP-20260401-001 配置驱动的对话引擎
 */
import * as vscode from 'vscode';
import { ModelAdapter } from '../models/modelAdapter';
import { EnhancedProjectAnalyzer } from '../analyzer/enhancedProjectAnalyzer';
import { PromptEngine } from '../prompt/promptEngine';
import { EnhancedToolRegistry } from './tool/EnhancedToolRegistry';
import { ToolResult, AppState } from './types';
/**
 * 增强查询引擎配置
 * 基于Claude Code QueryEngineConfig设计，适配CodeLine架构
 */
export interface EnhancedQueryEngineConfig {
    modelAdapter: ModelAdapter;
    projectAnalyzer: EnhancedProjectAnalyzer;
    promptEngine: PromptEngine;
    toolRegistry: EnhancedToolRegistry;
    cwd: string;
    extensionContext: vscode.ExtensionContext;
    workspaceRoot: string;
    workspaceFolders?: readonly vscode.WorkspaceFolder[];
    verbose?: boolean;
    thinkingConfig?: ThinkingConfig;
    maxTurns?: number;
    maxBudgetUsd?: number;
    userSpecifiedModel?: string;
    fallbackModel?: string;
    customSystemPrompt?: string;
    appendSystemPrompt?: string;
    enabledToolCategories?: string[];
    disabledToolIds?: string[];
    getAppState?: () => AppState;
    setAppState?: (state: AppState) => void;
    onStateUpdate?: (state: ConversationState) => void;
    onProgress?: (progress: EngineProgress) => void;
    permissionMode?: 'default' | 'auto' | 'bypass' | 'strict';
}
/**
 * 思考配置
 */
export interface ThinkingConfig {
    type: 'adaptive' | 'disabled' | 'enhanced';
    maxTokens?: number;
    temperature?: number;
}
/**
 * 引擎进度
 */
export interface EngineProgress {
    type: 'thinking' | 'tool_call' | 'response' | 'error';
    stage: string;
    message?: string;
    data?: any;
    timestamp: number;
}
/**
 * 消息类型
 */
export interface EngineMessage {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    timestamp: number;
    metadata?: {
        toolCalls?: ToolCall[];
        toolResults?: ToolResult[];
        thinking?: string;
        tokens?: number;
        cost?: number;
        intent?: any;
        codeContext?: any;
        [key: string]: any;
    };
}
/**
 * 工具调用
 */
export interface ToolCall {
    id: string;
    toolId: string;
    name: string;
    arguments: Record<string, any>;
    status: 'pending' | 'executing' | 'completed' | 'failed';
    result?: any;
    error?: string;
    startTime?: number;
    endTime?: number;
}
/**
 * 对话状态
 */
export interface ConversationState {
    messages: EngineMessage[];
    toolCalls: ToolCall[];
    currentToolCall?: ToolCall;
    thinking: string;
    mode: 'plan' | 'act';
    turnCount: number;
    usage: UsageStats;
}
/**
 * 使用统计
 */
export interface UsageStats {
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    totalCost: number;
    requestCount: number;
    toolCallCount: number;
}
/**
 * 提交选项
 */
export interface SubmitOptions {
    images?: string[];
    files?: string[];
    context?: Record<string, any>;
    skipThinking?: boolean;
    skipTools?: boolean;
    userMessageId?: string;
}
/**
 * 提交结果
 */
export interface SubmitResult {
    success: boolean;
    message?: EngineMessage;
    toolCalls?: ToolCall[];
    usage?: Partial<UsageStats>;
    error?: string;
    thinking?: string;
}
/**
 * EnhancedQueryEngine
 * 每个对话一个实例，管理完整的对话生命周期
 */
export declare class EnhancedQueryEngine {
    protected config: EnhancedQueryEngineConfig;
    protected conversationState: ConversationState;
    private abortController?;
    private isProcessing;
    protected outputChannel: vscode.OutputChannel;
    private toolContext;
    constructor(config: EnhancedQueryEngineConfig);
    /**
     * 获取对话状态
     */
    getState(): ConversationState;
    /**
     * 获取所有消息
     */
    getMessages(): EngineMessage[];
    /**
     * 获取使用统计
     */
    getUsage(): UsageStats;
    /**
     * 设置模式 (plan/act)
     */
    setMode(mode: 'plan' | 'act'): void;
    /**
     * 获取当前模式
     */
    getMode(): 'plan' | 'act';
    /**
     * 清除对话
     */
    clear(): void;
    /**
     * 提交消息并获取AI响应（流式）
     */
    submitMessage(content: string, options?: SubmitOptions): AsyncGenerator<EngineProgress, SubmitResult, void>;
    /**
     * 提交消息（同步简化版）
     */
    submitMessageSync(content: string, options?: SubmitOptions): Promise<SubmitResult>;
    /**
     * 中止当前处理
     */
    abort(): void;
    /**
     * 导出对话
     */
    exportConversation(): string;
    /**
     * 导入对话
     */
    importConversation(json: string): void;
    /**
     * 创建工具上下文
     */
    private createToolContext;
    /**
     * 添加消息
     */
    protected addMessage(message: Omit<EngineMessage, 'id' | 'timestamp'>): EngineMessage;
    /**
     * 创建进度事件
     */
    protected createProgress(type: EngineProgress['type'], stage: string, message?: string, data?: any): EngineProgress;
    /**
     * 构建系统提示
     */
    private buildSystemPrompt;
    /**
     * 构建对话历史
     */
    private buildConversationHistory;
    /**
     * 思考响应
     */
    private thinkAboutResponse;
    /**
     * 确定工具调用
     */
    private determineToolCalls;
    /**
     * 执行工具调用
     */
    protected executeToolCall(toolCall: ToolCall): Promise<ToolCall>;
    /**
     * 生成响应
     */
    private generateResponse;
    /**
     * 计算成本
     */
    private calculateCost;
    /**
     * 生成唯一ID
     */
    protected generateId(): string;
}
export default EnhancedQueryEngine;
//# sourceMappingURL=EnhancedQueryEngine.d.ts.map