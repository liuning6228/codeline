/**
 * QueryEngine - Manages conversation lifecycle and message state
 * Inspired by Claude Code's QueryEngine architecture
 * 
 * One QueryEngine per conversation. Each submitMessage() call starts a new
 * turn within the same conversation. State (messages, file cache, usage, etc.)
 * persists across turns.
 */

import { ModelAdapter, ModelResponse } from '../models/modelAdapter';
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
export class QueryEngine {
  private config: QueryEngineConfig;
  private messages: QueryMessage[] = [];
  private usage: UsageStats = {
    totalTokens: 0,
    promptTokens: 0,
    completionTokens: 0,
    totalCost: 0,
    requestCount: 0,
  };
  private turnCount = 0;
  private abortController?: AbortController;
  private mode: 'plan' | 'act' = 'act';

  constructor(config: QueryEngineConfig) {
    this.config = config;
  }

  /**
   * Get all messages in the conversation
   */
  public getMessages(): QueryMessage[] {
    return [...this.messages];
  }

  /**
   * Get usage statistics
   */
  public getUsage(): UsageStats {
    return { ...this.usage };
  }

  /**
   * Get current turn count
   */
  public getTurnCount(): number {
    return this.turnCount;
  }

  /**
   * Set the mode (plan or act)
   */
  public setMode(mode: 'plan' | 'act'): void {
    this.mode = mode;
  }

  /**
   * Get current mode
   */
  public getMode(): 'plan' | 'act' {
    return this.mode;
  }

  /**
   * Clear the conversation
   */
  public clear(): void {
    this.messages = [];
    this.turnCount = 0;
    // Note: we don't reset usage to track cumulative usage
  }

  /**
   * Add a message to the conversation
   */
  public addMessage(message: Omit<QueryMessage, 'id' | 'timestamp'>): QueryMessage {
    const fullMessage: QueryMessage = {
      ...message,
      id: this.generateId(),
      timestamp: Date.now(),
    };
    this.messages.push(fullMessage);
    return fullMessage;
  }

  /**
   * Submit a user message and get AI response
   */
  public async submitMessage(content: string, options: SubmitOptions = {}): Promise<QueryResult> {
    this.turnCount++;
    
    // Check max turns
    if (this.config.maxTurns && this.turnCount > this.config.maxTurns) {
      return {
        success: false,
        error: `Maximum turns (${this.config.maxTurns}) exceeded`,
      };
    }

    // Create abort controller for this request
    this.abortController = new AbortController();

    try {
      // Add user message
      const userMessage = this.addMessage({
        role: 'user',
        content,
        metadata: {
          toolCalls: options.files?.map(f => ({
            id: this.generateId(),
            name: 'attach_file',
            arguments: { path: f },
          })) || [],
        },
      });

      // Build prompt with context
      const systemPrompt = this.buildSystemPrompt(options.context);
      const conversationHistory = this.buildConversationHistory();

      // Call model
      const response = await this.callModel(
        systemPrompt,
        conversationHistory,
        content,
        options.images
      );

      if (!response.success) {
        return {
          success: false,
          error: response.error || 'Model call failed',
        };
      }

      // Add assistant message
      const assistantMessage = this.addMessage({
        role: 'assistant',
        content: response.content || '',
        metadata: {
          tokens: response.usage?.totalTokens,
          cost: response.usage?.cost,
        },
      });

      // Update usage stats
      if (response.usage) {
        this.usage.totalTokens += response.usage.totalTokens || 0;
        this.usage.promptTokens += response.usage.promptTokens || 0;
        this.usage.completionTokens += response.usage.completionTokens || 0;
        this.usage.totalCost += response.usage?.cost || 0;
        this.usage.requestCount++;
      }

      return {
        success: true,
        message: assistantMessage,
        usage: response.usage,
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    } finally {
      this.abortController = undefined;
    }
  }

  /**
   * Abort the current request
   */
  public abort(): void {
    this.abortController?.abort();
  }

  /**
   * Build system prompt with context
   */
  private buildSystemPrompt(context?: Record<string, any>): string {
    const basePrompt = this.config.systemPrompt || 
      `You are CodeLine, an AI coding assistant integrated into VS Code.
You help developers write, understand, and modify code.
Always be concise, accurate, and helpful.

Current mode: ${this.mode.toUpperCase()}
${this.mode === 'plan' ? 'In PLAN mode, you only plan tasks without executing them.' : 'In ACT mode, you plan and execute tasks automatically.'}`;

    // Add context if available
    let contextStr = '';
    if (context) {
      contextStr = '\n\n## Context\n' + Object.entries(context)
        .map(([key, value]) => `- ${key}: ${JSON.stringify(value)}`)
        .join('\n');
    }

    return basePrompt + contextStr;
  }

  /**
   * Build conversation history for context
   */
  private buildConversationHistory(): Array<{ role: string; content: string }> {
    return this.messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content,
    }));
  }

  /**
   * Call the model adapter
   */
  private async callModel(
    systemPrompt: string,
    history: Array<{ role: string; content: string }>,
    userMessage: string,
    images?: string[]
  ): Promise<{
    success: boolean;
    content?: string;
    usage?: {
      totalTokens?: number;
      promptTokens?: number;
      completionTokens?: number;
      cost?: number;
    };
    error?: string;
  }> {
    try {
      // Build the full prompt with history
      const fullPrompt = history.length > 0
        ? history.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n\n') + '\n\nUser: ' + userMessage
        : userMessage;

      const response: ModelResponse = await this.config.modelAdapter.generate(fullPrompt);

      return {
        success: true,
        content: response.content,
        usage: {
          totalTokens: response.usage?.totalTokens,
          promptTokens: response.usage?.promptTokens,
          completionTokens: response.usage?.completionTokens,
          cost: this.calculateCost(response.usage),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Calculate cost from usage
   */
  private calculateCost(usage?: any): number {
    if (!usage) return 0;
    // Simple cost calculation - can be enhanced with model-specific pricing
    const promptCost = (usage.prompt_tokens || 0) * 0.000003; // $3 per 1M tokens
    const completionCost = (usage.completion_tokens || 0) * 0.000015; // $15 per 1M tokens
    return promptCost + completionCost;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export conversation as JSON
   */
  public exportConversation(): string {
    return JSON.stringify({
      messages: this.messages,
      usage: this.usage,
      turnCount: this.turnCount,
      mode: this.mode,
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  /**
   * Import conversation from JSON
   */
  public importConversation(json: string): void {
    try {
      const data = JSON.parse(json);
      if (data.messages) {
        this.messages = data.messages;
      }
      if (data.usage) {
        this.usage = { ...this.usage, ...data.usage };
      }
      if (data.turnCount) {
        this.turnCount = data.turnCount;
      }
      if (data.mode) {
        this.mode = data.mode;
      }
    } catch (error) {
      console.error('Failed to import conversation:', error);
    }
  }
}

export default QueryEngine;
