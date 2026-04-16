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
import { ModelAdapter, ModelResponse } from '../models/modelAdapter';
import { EnhancedProjectAnalyzer } from '../analyzer/enhancedProjectAnalyzer';
import { PromptEngine } from '../prompt/promptEngine';
import { Tool, ToolUseContext, PermissionResult } from './tool/Tool';
import { EnhancedToolRegistry } from './tool/EnhancedToolRegistry';
import { ToolExecutionState, ToolProgress, ToolResult, AppState } from './types';

// ==================== 类型定义 ====================

/**
 * 增强查询引擎配置
 * 基于Claude Code QueryEngineConfig设计，适配CodeLine架构
 */
export interface EnhancedQueryEngineConfig {
  // 核心依赖注入
  modelAdapter: ModelAdapter;
  projectAnalyzer: EnhancedProjectAnalyzer;
  promptEngine: PromptEngine;
  toolRegistry: EnhancedToolRegistry;
  
  // 工作目录和上下文
  cwd: string;
  extensionContext: vscode.ExtensionContext;
  workspaceRoot: string;
  workspaceFolders?: readonly vscode.WorkspaceFolder[];
  
  // 行为控制
  verbose?: boolean;
  thinkingConfig?: ThinkingConfig;
  maxTurns?: number;
  maxBudgetUsd?: number;
  
  // 模型控制
  userSpecifiedModel?: string;
  fallbackModel?: string;
  customSystemPrompt?: string;
  appendSystemPrompt?: string;
  
  // 工具控制
  enabledToolCategories?: string[];
  disabledToolIds?: string[];
  
  // 状态管理回调
  getAppState?: () => AppState;
  setAppState?: (state: AppState) => void;
  onStateUpdate?: (state: ConversationState) => void;
  
  // 进度回调
  onProgress?: (progress: EngineProgress) => void;
  
  // 权限控制
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

// ==================== 增强查询引擎 ====================

/**
 * EnhancedQueryEngine
 * 每个对话一个实例，管理完整的对话生命周期
 */
export class EnhancedQueryEngine {
  protected config: EnhancedQueryEngineConfig;
  protected conversationState: ConversationState;
  private abortController?: AbortController;
  private isProcessing = false;
  protected outputChannel: vscode.OutputChannel;
  
  // 工具执行上下文
  private toolContext: ToolUseContext;

  constructor(config: EnhancedQueryEngineConfig) {
    this.config = config;
    this.outputChannel = vscode.window.createOutputChannel('CodeLine EnhancedQueryEngine');
    
    // 初始化对话状态
    this.conversationState = {
      messages: [],
      toolCalls: [],
      thinking: '',
      mode: 'act',
      turnCount: 0,
      usage: {
        totalTokens: 0,
        promptTokens: 0,
        completionTokens: 0,
        totalCost: 0,
        requestCount: 0,
        toolCallCount: 0,
      },
    };
    
    // 初始化工具上下文
    this.toolContext = this.createToolContext();
    
    this.outputChannel.appendLine(`✅ EnhancedQueryEngine initialized with ${this.config.toolRegistry.getAllTools().length} tools`);
  }

  /**
   * 获取对话状态
   */
  public getState(): ConversationState {
    return { ...this.conversationState };
  }

  /**
   * 获取所有消息
   */
  public getMessages(): EngineMessage[] {
    return [...this.conversationState.messages];
  }

  /**
   * 获取使用统计
   */
  public getUsage(): UsageStats {
    return { ...this.conversationState.usage };
  }

  /**
   * 设置模式 (plan/act)
   */
  public setMode(mode: 'plan' | 'act'): void {
    this.conversationState.mode = mode;
    this.outputChannel.appendLine(`🔄 Mode changed to: ${mode}`);
  }

  /**
   * 获取当前模式
   */
  public getMode(): 'plan' | 'act' {
    return this.conversationState.mode;
  }

  /**
   * 清除对话
   */
  public clear(): void {
    this.conversationState = {
      messages: [],
      toolCalls: [],
      thinking: '',
      mode: 'act',
      turnCount: 0,
      usage: {
        totalTokens: 0,
        promptTokens: 0,
        completionTokens: 0,
        totalCost: 0,
        requestCount: 0,
        toolCallCount: 0,
      },
    };
    this.outputChannel.appendLine('🗑️ Conversation cleared');
  }

  /**
   * 提交消息并获取AI响应（流式）
   */
  public async *submitMessage(
    content: string,
    options: SubmitOptions = {}
  ): AsyncGenerator<EngineProgress, SubmitResult, void> {
    if (this.isProcessing) {
      throw new Error('Another message is being processed');
    }

    this.isProcessing = true;
    this.conversationState.turnCount++;
    this.abortController = new AbortController();

    try {
      // 检查最大轮数限制
      if (this.config.maxTurns && this.conversationState.turnCount > this.config.maxTurns) {
        yield this.createProgress('error', 'max_turns_exceeded', `Maximum turns (${this.config.maxTurns}) exceeded`);
        return {
          success: false,
          error: `Maximum turns (${this.config.maxTurns}) exceeded`,
        };
      }

      // 添加用户消息
      const userMessage = this.addMessage({
        role: 'user',
        content,
        metadata: {
          toolCalls: options.files?.map(f => ({
            id: this.generateId(),
            toolId: 'file_attachment',
            name: 'attach_file',
            arguments: { path: f },
            status: 'completed',
          })) || [],
        },
      });

      yield this.createProgress('thinking', 'user_message_received', 'User message received');

      // 构建系统提示
      const systemPrompt = this.buildSystemPrompt(options.context);

      // 构建对话历史
      const conversationHistory = this.buildConversationHistory();

      // 思考阶段（如果启用）
      if (!options.skipThinking && this.config.thinkingConfig?.type !== 'disabled') {
        yield this.createProgress('thinking', 'thinking_started', 'AI is thinking...');
        const thinkingResult = await this.thinkAboutResponse(systemPrompt, conversationHistory, content);
        this.conversationState.thinking = thinkingResult;
        yield this.createProgress('thinking', 'thinking_completed', 'Thinking completed', { thinking: thinkingResult });
      }

      // 工具调用阶段（如果启用且处于act模式）
      let toolCalls: ToolCall[] = [];
      if (!options.skipTools && this.conversationState.mode === 'act') {
        yield this.createProgress('tool_call', 'tool_analysis_started', 'Analyzing tools needed...');
        
        const toolCallResult = await this.determineToolCalls(content, options);
        toolCalls = toolCallResult.calls;
        
        if (toolCalls.length > 0) {
          yield this.createProgress('tool_call', 'tools_identified', `${toolCalls.length} tools identified`);
          
          // 执行工具调用
          for (const toolCall of toolCalls) {
            yield this.createProgress('tool_call', 'tool_execution_started', `Executing tool: ${toolCall.name}`, { toolCall });
            
            const executionResult = await this.executeToolCall(toolCall);
            this.conversationState.toolCalls.push(executionResult);
            
            yield this.createProgress('tool_call', 'tool_execution_completed', `Tool ${toolCall.name} completed`, { 
              toolCall: executionResult,
              result: executionResult.result,
            });
          }
        }
      }

      // 生成AI响应
      yield this.createProgress('response', 'generating_response', 'Generating AI response...');
      
      const responseContent = await this.generateResponse(
        systemPrompt,
        conversationHistory,
        content,
        toolCalls,
        options.images
      );

      // 添加助手消息
      const assistantMessage = this.addMessage({
        role: 'assistant',
        content: responseContent,
        metadata: {
          toolCalls,
          thinking: this.conversationState.thinking,
        },
      });

      yield this.createProgress('response', 'response_completed', 'Response generated', { message: assistantMessage });

      return {
        success: true,
        message: assistantMessage,
        toolCalls,
        thinking: this.conversationState.thinking,
      };

    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';
      yield this.createProgress('error', 'processing_failed', `Processing failed: ${errorMessage}`, { error });
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      this.isProcessing = false;
      this.abortController = undefined;
    }
  }

  /**
   * 提交消息（同步简化版）
   */
  public async submitMessageSync(
    content: string,
    options: SubmitOptions = {}
  ): Promise<SubmitResult> {
    const progressGenerator = this.submitMessage(content, options);
    let finalResult: SubmitResult | undefined;
    
    // 消费所有进度事件
    for await (const progress of progressGenerator) {
      // 进度事件被消费，但不处理
    }
    
    // 获取最终结果
    const result = await progressGenerator.next();
    if (!result.done) {
      throw new Error('Unexpected generator state');
    }
    
    return result.value;
  }

  /**
   * 中止当前处理
   */
  public abort(): void {
    this.abortController?.abort();
    this.isProcessing = false;
    this.outputChannel.appendLine('⏹️ Processing aborted');
  }

  /**
   * 导出对话
   */
  public exportConversation(): string {
    return JSON.stringify({
      state: this.conversationState,
      config: {
        cwd: this.config.cwd,
        mode: this.conversationState.mode,
        toolCount: this.config.toolRegistry.getAllTools().length,
      },
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  /**
   * 导入对话
   */
  public importConversation(json: string): void {
    try {
      const data = JSON.parse(json);
      if (data.state) {
        this.conversationState = data.state;
      }
      this.outputChannel.appendLine('📥 Conversation imported');
    } catch (error: any) {
      this.outputChannel.appendLine(`❌ Failed to import conversation: ${error.message}`);
    }
  }

  // ==================== 私有方法 ====================

  /**
   * 创建工具上下文
   */
  private createToolContext(): ToolUseContext {
    return {
      workspaceRoot: this.config.workspaceRoot,
      workspaceFolders: vscode.workspace.workspaceFolders ? [...vscode.workspace.workspaceFolders] : undefined,
      extensionContext: this.config.extensionContext,
      outputChannel: this.outputChannel,
      abortController: new AbortController(),
      permissionContext: {
        mode: this.config.permissionMode || 'default',
        alwaysAllowRules: {},
        alwaysDenyRules: {},
        alwaysAskRules: {},
        isBypassPermissionsModeAvailable: false,
      },
      showInformationMessage: vscode.window.showInformationMessage,
      showWarningMessage: vscode.window.showWarningMessage,
      showErrorMessage: vscode.window.showErrorMessage,
      readFile: async (path: string) => {
        const uri = vscode.Uri.file(path);
        const bytes = await vscode.workspace.fs.readFile(uri);
        return new TextDecoder().decode(bytes);
      },
      writeFile: async (path: string, content: string) => {
        const uri = vscode.Uri.file(path);
        const bytes = new TextEncoder().encode(content);
        await vscode.workspace.fs.writeFile(uri, bytes);
      },
      fileExists: async (path: string) => {
        try {
          const uri = vscode.Uri.file(path);
          await vscode.workspace.fs.stat(uri);
          return true;
        } catch {
          return false;
        }
      },
    };
  }

  /**
   * 添加消息
   */
  protected addMessage(message: Omit<EngineMessage, 'id' | 'timestamp'>): EngineMessage {
    const fullMessage: EngineMessage = {
      ...message,
      id: this.generateId(),
      timestamp: Date.now(),
    };
    this.conversationState.messages.push(fullMessage);
    return fullMessage;
  }

  /**
   * 创建进度事件
   */
  protected createProgress(
    type: EngineProgress['type'],
    stage: string,
    message?: string,
    data?: any
  ): EngineProgress {
    const progress: EngineProgress = {
      type,
      stage,
      message,
      data,
      timestamp: Date.now(),
    };
    
    // 调用进度回调
    if (this.config.onProgress) {
      this.config.onProgress(progress);
    }
    
    return progress;
  }

  /**
   * 构建系统提示
   */
  private buildSystemPrompt(context?: Record<string, any>): string {
    const basePrompt = this.config.customSystemPrompt || 
      `You are CodeLine, an enhanced AI coding assistant integrated into VS Code.
You have access to various tools and can help with coding tasks, file operations, terminal commands, and more.

Current mode: ${this.conversationState.mode.toUpperCase()}
${this.conversationState.mode === 'plan' ? 'In PLAN mode, you only plan tasks without executing them.' : 'In ACT mode, you can plan and execute tasks using available tools.'}

Available tools: ${this.config.toolRegistry.getAllTools().map(t => t.name).join(', ')}

Always be helpful, accurate, and concise.`;

    // 添加附加系统提示
    if (this.config.appendSystemPrompt) {
      basePrompt + `\n\n${this.config.appendSystemPrompt}`;
    }

    // 添加上下文
    let contextStr = '';
    if (context) {
      contextStr = '\n\n## Context\n' + Object.entries(context)
        .map(([key, value]) => `- ${key}: ${JSON.stringify(value)}`)
        .join('\n');
    }

    return basePrompt + contextStr;
  }

  /**
   * 构建对话历史
   */
  private buildConversationHistory(): Array<{ role: string; content: string }> {
    // 返回最近10条消息
    return this.conversationState.messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content,
    }));
  }

  /**
   * 思考响应
   */
  private async thinkAboutResponse(
    systemPrompt: string,
    history: Array<{ role: string; content: string }>,
    userMessage: string
  ): Promise<string> {
    // 简化实现：在实际应用中，这里会调用专门的思考模型
    const thinkingPrompt = `${systemPrompt}\n\nUser message: ${userMessage}\n\nThink step by step about how to respond. Consider available tools and context.`;
    
    try {
      const response = await this.config.modelAdapter.generate(thinkingPrompt, {
        maxTokens: this.config.thinkingConfig?.maxTokens || 500,
        temperature: this.config.thinkingConfig?.temperature || 0.3,
      });
      
      return response.content;
    } catch (error) {
      this.outputChannel.appendLine(`❌ Thinking failed: ${error}`);
      return 'Thinking process encountered an error.';
    }
  }

  /**
   * 确定工具调用
   */
  private async determineToolCalls(
    userMessage: string,
    options: SubmitOptions
  ): Promise<{ calls: ToolCall[] }> {
    // 简化实现：在实际应用中，这里会分析用户消息并决定需要哪些工具
    // 现在返回空数组，实际集成时会实现工具选择逻辑
    return { calls: [] };
  }

  /**
   * 执行工具调用
   */
  protected async executeToolCall(toolCall: ToolCall): Promise<ToolCall> {
    const startTime = Date.now();
    
    try {
      const tool = this.config.toolRegistry.getTool(toolCall.toolId);
      if (!tool) {
        throw new Error(`Tool not found: ${toolCall.toolId}`);
      }

      // 检查权限
      const permissionResult = await tool.checkPermissions(toolCall.arguments, this.toolContext);
      if (!permissionResult.allowed) {
        throw new Error(`Permission denied: ${permissionResult.reason}`);
      }

      // 验证参数
      const validationResult = await tool.validateParameters(toolCall.arguments, this.toolContext);
      if (!validationResult.valid) {
        throw new Error(`Validation failed: ${validationResult.errors?.join(', ')}`);
      }

      // 执行工具
      const result = await tool.execute(toolCall.arguments, this.toolContext);
      
      const endTime = Date.now();
      
      return {
        ...toolCall,
        status: 'completed',
        result,
        startTime,
        endTime,
      };
      
    } catch (error: any) {
      const endTime = Date.now();
      
      return {
        ...toolCall,
        status: 'failed',
        error: error.message,
        startTime,
        endTime,
      };
    }
  }

  /**
   * 生成响应
   */
  private async generateResponse(
    systemPrompt: string,
    history: Array<{ role: string; content: string }>,
    userMessage: string,
    toolCalls: ToolCall[],
    images?: string[]
  ): Promise<string> {
    // 构建完整提示
    let fullPrompt = systemPrompt + '\n\n';
    
    // 添加对话历史
    if (history.length > 0) {
      fullPrompt += '## Conversation History\n';
      for (const msg of history) {
        fullPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n\n`;
      }
    }
    
    // 添加用户消息
    fullPrompt += `User: ${userMessage}\n\n`;
    
    // 添加工具调用结果
    if (toolCalls.length > 0) {
      fullPrompt += '## Tool Execution Results\n';
      for (const call of toolCalls) {
        if (call.status === 'completed' && call.result) {
          fullPrompt += `Tool ${call.name} executed successfully: ${JSON.stringify(call.result, null, 2)}\n`;
        } else if (call.status === 'failed' && call.error) {
          fullPrompt += `Tool ${call.name} failed: ${call.error}\n`;
        }
      }
      fullPrompt += '\n';
    }
    
    // 添加指令
    fullPrompt += 'Please respond to the user based on the conversation history and tool execution results.\n';
    
    try {
      const response = await this.config.modelAdapter.generate(fullPrompt, {
        model: this.config.userSpecifiedModel,
      });
      
      // 更新使用统计
      if (response.usage) {
        this.conversationState.usage.totalTokens += response.usage.totalTokens || 0;
        this.conversationState.usage.promptTokens += response.usage.promptTokens || 0;
        this.conversationState.usage.completionTokens += response.usage.completionTokens || 0;
        this.conversationState.usage.totalCost += this.calculateCost(response.usage);
        this.conversationState.usage.requestCount++;
      }
      
      return response.content;
    } catch (error: any) {
      this.outputChannel.appendLine(`❌ Response generation failed: ${error.message}`);
      return `I encountered an error while generating a response: ${error.message}`;
    }
  }

  /**
   * 计算成本
   */
  private calculateCost(usage?: any): number {
    if (!usage) return 0;
    const promptCost = (usage.prompt_tokens || 0) * 0.000003;
    const completionCost = (usage.completion_tokens || 0) * 0.000015;
    return promptCost + completionCost;
  }

  /**
   * 生成唯一ID
   */
  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default EnhancedQueryEngine;