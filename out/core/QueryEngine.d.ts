/**
 * QueryEngine - Manages conversation lifecycle and message state
 * Inspired by Claude Code's QueryEngine architecture
 *
 * One QueryEngine per conversation. Each submitMessage() call starts a new
 * turn within the same conversation. State (messages, file cache, usage, etc.)
 * persists across turns.
 */
import { ModelAdapter } from '../models/modelAdapter';
import { EnhancedProjectAnalyzer } from '../analyzer/enhancedProjectAnalyzer';
import { PromptEngine } from '../prompt/promptEngine';
/**
 * Message types
 */
export interface QueryMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    partial?: boolean;
    metadata?: {
        tokens?: number;
        cost?: number;
        toolCalls?: ToolCall[];
    };
}
/**
 * Tool call representation
 */
export interface ToolCall {
    id: string;
    name: string;
    arguments: Record<string, any>;
    result?: any;
}
/**
 * Usage statistics
 */
export interface UsageStats {
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    totalCost: number;
    requestCount: number;
}
/**
 * Query engine configuration
 */
export interface QueryEngineConfig {
    modelAdapter: ModelAdapter;
    projectAnalyzer: EnhancedProjectAnalyzer;
    promptEngine: PromptEngine;
    maxTurns?: number;
    maxBudgetUsd?: number;
    verbose?: boolean;
    systemPrompt?: string;
}
/**
 * Submit options for a single message
 */
export interface SubmitOptions {
    images?: string[];
    files?: string[];
    context?: Record<string, any>;
}
/**
 * Query result for a single turn
 */
export interface QueryResult {
    success: boolean;
    message?: QueryMessage;
    usage?: Partial<UsageStats>;
    error?: string;
}
/**
 * QueryEngine owns the query lifecycle and session state for a conversation.
 */
export declare class QueryEngine {
    private config;
    private messages;
    private usage;
    private turnCount;
    private abortController?;
    private mode;
    constructor(config: QueryEngineConfig);
    /**
     * Get all messages in the conversation
     */
    getMessages(): QueryMessage[];
    /**
     * Get usage statistics
     */
    getUsage(): UsageStats;
    /**
     * Get current turn count
     */
    getTurnCount(): number;
    /**
     * Set the mode (plan or act)
     */
    setMode(mode: 'plan' | 'act'): void;
    /**
     * Get current mode
     */
    getMode(): 'plan' | 'act';
    /**
     * Clear the conversation
     */
    clear(): void;
    /**
     * Add a message to the conversation
     */
    addMessage(message: Omit<QueryMessage, 'id' | 'timestamp'>): QueryMessage;
    /**
     * Submit a user message and get AI response
     */
    submitMessage(content: string, options?: SubmitOptions): Promise<QueryResult>;
    /**
     * Abort the current request
     */
    abort(): void;
    /**
     * Build system prompt with context
     */
    private buildSystemPrompt;
    /**
     * Build conversation history for context
     */
    private buildConversationHistory;
    /**
     * Call the model adapter
     */
    private callModel;
    /**
     * Calculate cost from usage
     */
    private calculateCost;
    /**
     * Generate unique ID
     */
    private generateId;
    /**
     * Export conversation as JSON
     */
    exportConversation(): string;
    /**
     * Import conversation from JSON
     */
    importConversation(json: string): void;
}
export default QueryEngine;
//# sourceMappingURL=QueryEngine.d.ts.map