/**
 * CodeMasterQueryEngine - 编码大师查询引擎
 * 
 * 基于EnhancedQueryEngine扩展，专门为编码任务增强：
 * 1. 智能代码上下文理解
 * 2. 编码专用工具选择
 * 3. 增强型多步思考
 * 4. 项目级代码分析和生成
 * 
 * 设计目标：达到Claude Code同等编码能力
 */

import * as vscode from 'vscode';
import { EnhancedQueryEngine, EnhancedQueryEngineConfig, ToolCall, SubmitOptions, SubmitResult, EngineProgress, EngineMessage } from '../EnhancedQueryEngine';
import { CodeContextEnhancer, QueryContext, FileAnalysis, ProjectAnalysis, CodeSnippet, ImpactAnalysis, CodeChange } from './CodeContextEnhancer';
import { EnhancedToolRegistry } from '../tool/EnhancedToolRegistry';

// ==================== 增强类型定义 ====================

/**
 * 用户意图分析结果
 */
export interface UserIntent {
  type: 'code_generation' | 'code_editing' | 'debugging' | 'testing' | 'refactoring' | 'explanation' | 'optimization';
  targetFiles: string[];
  operation: string;
  constraints: string[];
  priority: 'low' | 'medium' | 'high';
  confidence: number;
  requiredTools: string[];
  suggestedApproach: string;
}

/**
 * 工具需求
 */
export interface ToolRequirement {
  toolId: string;
  toolName: string;
  priority: 'required' | 'recommended' | 'optional';
  purpose: string;
  expectedOutput: string;
  dependencies: string[];
}

/**
 * 思考步骤
 */
export interface ThinkingStep {
  step: number;
  type: 'analysis' | 'planning' | 'execution' | 'verification' | 'code_analysis' | 'error_diagnosis';
  content: string;
  confidence: number;
  dependencies: number[];
  metadata?: {
    files?: string[];
    tools?: string[];
    decisions?: string[];
  };
}

/**
 * 代码问题
 */
export interface CodeProblem {
  type: 'bug' | 'performance' | 'security' | 'style' | 'design';
  description: string;
  location: {
    filePath: string;
    lineStart: number;
    lineEnd: number;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestedFix: string;
}

/**
 * 代码解决方案
 */
export interface CodeSolution {
  problem: CodeProblem;
  approach: string;
  steps: string[];
  toolsNeeded: string[];
  estimatedEffort: number;
  risk: 'low' | 'medium' | 'high';
  verificationSteps: string[];
}

/**
 * 编码引擎配置
 */
export interface CodeMasterQueryEngineConfig extends EnhancedQueryEngineConfig {
  // 编码特定配置
  enableCodeContextEnhancer: boolean;
  enableIntelligentToolParsing: boolean;
  enableEnhancedThinking: boolean;
  enableStateMemory: boolean;
  
  // 代码分析配置
  maxFileSizeForAnalysis: number;
  maxProjectDepth: number;
  languageSupport: string[];
  
  // 工具配置
  codingToolCategories: string[];
  
  // 性能配置
  cacheEnabled: boolean;
  cacheTTL: number;
  verboseLogging?: boolean;
  
  // 对话配置
  conversationConfig?: {
    maxHistoryLength?: number;
    systemPrompt?: string;
    includeThinking?: boolean;
    thinkingConfig?: {
      maxTokens?: number;
      temperature?: number;
    };
  };
}

/**
 * 智能工具解析器结果
 */
export interface ToolParsingResult {
  intent: UserIntent;
  requirements: ToolRequirement[];
  parameters: Record<string, any>;
  validation: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
}

// ==================== 编码大师查询引擎 ====================

/**
 * CodeMasterQueryEngine
 * 为编码任务专门增强的查询引擎
 */
export class CodeMasterQueryEngine extends EnhancedQueryEngine {
  private codeEnhancer: CodeContextEnhancer;
  private codeConfig: CodeMasterQueryEngineConfig;
  private codingTools: Map<string, any> = new Map();
  private stateMemory: StateMemory = new StateMemory();
  private isCodeContextEnabled: boolean;
  
  // 思考引擎状态
  private thinkingSteps: ThinkingStep[] = [];
  private currentThinkingStream?: AsyncGenerator<ThinkingStep, CodeSolution>;
  
  constructor(config: CodeMasterQueryEngineConfig) {
    super(config);
    this.codeConfig = config;
    this.isCodeContextEnabled = config.enableCodeContextEnhancer;
    
    // 初始化代码上下文增强器
    this.codeEnhancer = new CodeContextEnhancer(config.workspaceRoot);
    
    // 初始化编码专用工具
    this.initializeCodingTools();
    
    // 初始化状态记忆
    if (config.enableStateMemory) {
      this.initializeStateMemory();
    }
    
    this.outputChannel.appendLine('🚀 CodeMasterQueryEngine initialized');
    this.outputChannel.appendLine(`   Code Context: ${this.isCodeContextEnabled ? 'Enabled' : 'Disabled'}`);
    this.outputChannel.appendLine(`   Enhanced Thinking: ${config.enableEnhancedThinking ? 'Enabled' : 'Disabled'}`);
    this.outputChannel.appendLine(`   State Memory: ${config.enableStateMemory ? 'Enabled' : 'Disabled'}`);
  }
  
  // ==================== 核心方法重写 ====================
  
  /**
   * 重写：提交消息并处理编码特定逻辑
   */
  public async *submitMessage(
    content: string,
    options: SubmitOptions = {}
  ): AsyncGenerator<EngineProgress, SubmitResult> {
    const startTime = Date.now();
    
    try {
      yield this.createProgress('thinking', 'code_context_analysis', 'Analyzing code context...');
      
      // 1. 获取丰富的代码上下文
      let codeContext: QueryContext | undefined;
      if (this.isCodeContextEnabled) {
        codeContext = await this.codeEnhancer.getQueryContext(content);
        
        yield this.createProgress('thinking', 'code_context_completed', 'Code context analysis completed', {
          currentFile: codeContext.currentFile?.filePath,
          projectFiles: codeContext.project?.files.length,
        });
      }
      
      // 2. 分析用户意图（编码特定）
      yield this.createProgress('thinking', 'intent_analysis', 'Analyzing user intent...');
      const userIntent = await this.analyzeUserIntent(content, codeContext);
      
      yield this.createProgress('thinking', 'intent_identified', `Intent identified: ${userIntent.type}`, {
        intent: userIntent,
        confidence: userIntent.confidence,
      });
      
      // 3. 增强型思考（如果需要）
      let enhancedThinking = '';
      if (this.codeConfig.enableEnhancedThinking && !options.skipThinking) {
        yield this.createProgress('thinking', 'enhanced_thinking', 'Enhanced thinking process...');
        enhancedThinking = await this.enhancedThinkAboutResponse(content, userIntent, codeContext);
        
        this.conversationState.thinking = enhancedThinking;
        yield this.createProgress('thinking', 'enhanced_thinking_completed', 'Enhanced thinking completed', {
          thinkingLength: enhancedThinking.length,
          stepCount: this.thinkingSteps.length,
        });
      }
      
      // 4. 智能工具解析
      let toolCalls: ToolCall[] = [];
      if (!options.skipTools && this.conversationState.mode === 'act') {
        yield this.createProgress('tool_call', 'intelligent_tool_parsing', 'Intelligent tool parsing...');
        
        const parsingResult = await this.intelligentToolParsing(content, userIntent, codeContext, options);
        
        if (parsingResult.requirements.length > 0) {
          yield this.createProgress('tool_call', 'tools_parsed', `${parsingResult.requirements.length} tools parsed`, {
            toolRequirements: parsingResult.requirements,
          });
          
          // 转换为工具调用
          toolCalls = parsingResult.requirements
            .filter(req => req.priority === 'required' || req.priority === 'recommended')
            .map(req => this.createToolCallFromRequirement(req, parsingResult.parameters));
          
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
      
      // 5. 生成响应（编码优化）
      yield this.createProgress('response', 'generating_enhanced_response', 'Generating enhanced response...');
      
      const responseContent = await this.generateEnhancedResponse(
        content,
        userIntent,
        codeContext,
        toolCalls,
        enhancedThinking
      );
      
      // 6. 更新状态记忆
      if (this.codeConfig.enableStateMemory) {
        await this.updateStateMemory(content, responseContent, userIntent, toolCalls);
      }
      
      // 7. 添加助手消息
      const assistantMessage = this.addMessage({
        role: 'assistant',
        content: responseContent,
        metadata: {
          toolCalls,
          thinking: enhancedThinking,
          intent: userIntent,
          codeContext: codeContext ? {
            currentFile: codeContext.currentFile?.filePath,
            project: codeContext.project?.name,
          } : undefined,
        },
      });
      
      const duration = Date.now() - startTime;
      yield this.createProgress('response', 'enhanced_response_completed', 'Enhanced response generated', { 
        message: assistantMessage,
        duration,
        intent: userIntent.type,
      });
      
      return {
        success: true,
        message: assistantMessage,
        toolCalls,
        thinking: enhancedThinking,
        usage: this.conversationState.usage,
      };
      
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error in CodeMasterQueryEngine';
      yield this.createProgress('error', 'code_processing_failed', `Code processing failed: ${errorMessage}`, { error });
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
  
  // ==================== 编码特定方法 ====================
  
  /**
   * 分析用户意图（编码特定）
   */
  private async analyzeUserIntent(
    userInput: string,
    context?: QueryContext
  ): Promise<UserIntent> {
    // 默认意图
    const defaultIntent: UserIntent = {
      type: 'explanation',
      targetFiles: [],
      operation: 'explain',
      constraints: [],
      priority: 'medium',
      confidence: 0.5,
      requiredTools: [],
      suggestedApproach: 'Provide explanation',
    };
    
    if (!this.isCodeContextEnabled || !context) {
      return defaultIntent;
    }
    
    try {
      // 分析输入内容，识别编码意图
      const lowerInput = userInput.toLowerCase();
      
      // 意图关键词映射
      const intentKeywords: Record<string, string[]> = {
        'code_generation': ['create', 'generate', 'write', 'implement', 'add', 'make', 'build'],
        'code_editing': ['edit', 'modify', 'change', 'update', 'fix', 'adjust', 'rewrite'],
        'debugging': ['debug', 'error', 'bug', 'fix', 'issue', 'problem', 'crash', 'exception'],
        'testing': ['test', 'unit test', 'integration test', 'coverage', 'test case'],
        'refactoring': ['refactor', 'clean up', 'restructure', 'optimize', 'improve', 'simplify'],
        'explanation': ['explain', 'what does', 'how does', 'why', 'meaning', 'understand'],
        'optimization': ['optimize', 'performance', 'speed up', 'efficient', 'memory', 'cpu'],
      };
      
      // 识别意图类型
      let detectedType: UserIntent['type'] = 'explanation';
      let highestScore = 0;
      
      for (const [type, keywords] of Object.entries(intentKeywords)) {
        let score = 0;
        for (const keyword of keywords) {
          if (lowerInput.includes(keyword)) {
            score += 1;
            // 如果关键词在开头或单独出现，增加权重
            if (lowerInput.startsWith(keyword) || lowerInput.includes(` ${keyword} `)) {
              score += 2;
            }
          }
        }
        
        if (score > highestScore) {
          highestScore = score;
          detectedType = type as UserIntent['type'];
        }
      }
      
      // 识别目标文件
      const targetFiles: string[] = [];
      if (context.currentFile) {
        targetFiles.push(context.currentFile.filePath);
      }
      
      // 从上下文中提取更多文件
      if (context.project) {
        // 根据关键词匹配相关文件
        const words = userInput.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        for (const file of context.project.files.slice(0, 20)) { // 限制数量
          const fileName = file.name.toLowerCase();
          for (const word of words) {
            if (fileName.includes(word) && !targetFiles.includes(file.path)) {
              targetFiles.push(file.path);
              break;
            }
          }
        }
      }
      
      // 计算置信度
      const confidence = Math.min(0.3 + (highestScore * 0.1), 0.9);
      
      // 识别操作和约束
      const operation = this.extractOperation(userInput);
      const constraints = this.extractConstraints(userInput);
      
      // 确定优先级
      const priority = this.determinePriority(userInput, detectedType);
      
      // 识别所需工具
      const requiredTools = this.identifyRequiredTools(detectedType, operation, context);
      
      // 生成建议方法
      const suggestedApproach = this.generateSuggestedApproach(detectedType, operation, targetFiles);
      
      const intent: UserIntent = {
        type: detectedType,
        targetFiles,
        operation,
        constraints,
        priority,
        confidence,
        requiredTools,
        suggestedApproach,
      };
      
      this.outputChannel.appendLine(`🔍 Intent analysis: ${intent.type} (confidence: ${intent.confidence})`);
      this.outputChannel.appendLine(`   Operation: ${intent.operation}`);
      this.outputChannel.appendLine(`   Target files: ${intent.targetFiles.length}`);
      this.outputChannel.appendLine(`   Required tools: ${intent.requiredTools.join(', ')}`);
      
      return intent;
      
    } catch (error: any) {
      this.outputChannel.appendLine(`❌ Intent analysis failed: ${error.message}`);
      return defaultIntent;
    }
  }
  
  /**
   * 增强型思考响应
   */
  private async enhancedThinkAboutResponse(
    userMessage: string,
    intent: UserIntent,
    context?: QueryContext
  ): Promise<string> {
    // 构建增强型思考提示
    let thinkingPrompt = `# Enhanced Thinking for Code Task
User Intent: ${intent.type}
Operation: ${intent.operation}
Priority: ${intent.priority}
Confidence: ${intent.confidence}

User Message: ${userMessage}

Target Files: ${intent.targetFiles.length > 0 ? intent.targetFiles.join(', ') : 'None specified'}

Constraints: ${intent.constraints.length > 0 ? intent.constraints.join(', ') : 'None'}

Required Tools: ${intent.requiredTools.length > 0 ? intent.requiredTools.join(', ') : 'None'}

Suggested Approach: ${intent.suggestedApproach}

## Thinking Process:
1. **Understand the request**: ${userMessage}
2. **Analyze context**: `;
    
    // 添加上下文信息
    if (context?.currentFile) {
      thinkingPrompt += `\n   - Current file: ${context.currentFile.filePath} (${context.currentFile.language})`;
      thinkingPrompt += `\n   - File size: ${context.currentFile.size} bytes, Lines: ${context.currentFile.lineCount}`;
      if (context.currentFile.functions.length > 0) {
        thinkingPrompt += `\n   - Functions: ${context.currentFile.functions.length}`;
      }
      if (context.currentFile.classes.length > 0) {
        thinkingPrompt += `\n   - Classes: ${context.currentFile.classes.length}`;
      }
    }
    
    if (context?.project) {
      thinkingPrompt += `\n   - Project: ${context.project.name}`;
      thinkingPrompt += `\n   - Total files: ${context.project.files.length}`;
      thinkingPrompt += `\n   - Languages: ${Object.entries(context.project.languageDistribution.byLanguage)
        .filter(([_, count]) => count > 0)
        .map(([lang, count]) => `${lang}: ${count}`)
        .join(', ')}`;
    }
    
    thinkingPrompt += `
3. **Plan solution approach**:
   - ${intent.suggestedApproach}
   
4. **Consider edge cases and validation**:
   - What could go wrong?
   - How to verify the solution works?
   - Are there any dependencies or constraints?
   
5. **Tool selection rationale**:
   - ${intent.requiredTools.map(tool => `${tool}: ${this.getToolPurpose(tool)}`).join('\n   - ')}
   
6. **Implementation steps**:`;
    
    // 生成思考步骤
    this.thinkingSteps = [];
    
    try {
      // 调用模型生成思考
      const response = await this.config.modelAdapter.generate(thinkingPrompt, {
        maxTokens: this.config.thinkingConfig?.maxTokens || 1000,
        temperature: this.config.thinkingConfig?.temperature || 0.3,
        stop: ['## Final Answer:', '## Response:'],
      });
      
      // 解析思考步骤
      const thinkingContent = response.content;
      this.parseThinkingSteps(thinkingContent);
      
      // 记录思考步骤
      for (const step of this.thinkingSteps) {
        this.outputChannel.appendLine(`   Step ${step.step}: ${step.type} - ${step.content.substring(0, 100)}...`);
      }
      
      return thinkingContent;
      
    } catch (error: any) {
      this.outputChannel.appendLine(`❌ Enhanced thinking failed: ${error.message}`);
      return `Enhanced thinking encountered an error: ${error.message}`;
    }
  }
  
  /**
   * 智能工具解析
   */
  private async intelligentToolParsing(
    userMessage: string,
    intent: UserIntent,
    context?: QueryContext,
    options?: SubmitOptions
  ): Promise<ToolParsingResult> {
    const requirements: ToolRequirement[] = [];
    const parameters: Record<string, any> = {};
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // 根据意图类型确定工具需求
      switch (intent.type) {
        case 'code_generation':
          requirements.push(...await this.parseCodeGenerationTools(intent, context));
          break;
        case 'code_editing':
          requirements.push(...await this.parseCodeEditingTools(intent, context));
          break;
        case 'debugging':
          requirements.push(...await this.parseDebuggingTools(intent, context));
          break;
        case 'testing':
          requirements.push(...await this.parseTestingTools(intent, context));
          break;
        case 'refactoring':
          requirements.push(...await this.parseRefactoringTools(intent, context));
          break;
        case 'optimization':
          requirements.push(...await this.parseOptimizationTools(intent, context));
          break;
        default:
          // 解释类型可能不需要工具
          warnings.push('No specific tools identified for explanation request');
      }
      
      // 提取工具参数
      for (const req of requirements) {
        const toolParams = await this.extractToolParameters(req.toolId, userMessage, intent, context);
        if (toolParams) {
          parameters[req.toolId] = toolParams;
        }
      }
      
      // 验证工具可用性
      for (const req of requirements) {
        if (!this.isToolAvailable(req.toolId)) {
          errors.push(`Tool not available: ${req.toolId}`);
          req.priority = 'optional'; // 降级为可选
        }
      }
      
      // 检查工具依赖关系
      this.resolveToolDependencies(requirements);
      
      const result: ToolParsingResult = {
        intent,
        requirements,
        parameters,
        validation: {
          valid: errors.length === 0,
          errors,
          warnings,
        },
      };
      
      this.outputChannel.appendLine(`🔧 Tool parsing: ${requirements.length} tools, ${errors.length} errors`);
      
      return result;
      
    } catch (error: any) {
      this.outputChannel.appendLine(`❌ Tool parsing failed: ${error.message}`);
      
      return {
        intent,
        requirements: [],
        parameters: {},
        validation: {
          valid: false,
          errors: [error.message],
          warnings: [],
        },
      };
    }
  }
  
  /**
   * 生成增强响应
   */
  private async generateEnhancedResponse(
    userMessage: string,
    intent: UserIntent,
    context?: QueryContext,
    toolCalls: ToolCall[] = [],
    enhancedThinking: string = ''
  ): Promise<string> {
    // 构建增强响应提示
    let responsePrompt = `# Code Assistant Response
User Request: ${userMessage}
Intent Type: ${intent.type}
Operation: ${intent.operation}

## Context Summary:`;
    
    // 添加上下文摘要
    if (context?.currentFile) {
      responsePrompt += `
- Current File: ${context.currentFile.filePath}
- Language: ${context.currentFile.language}
- Size: ${context.currentFile.size} bytes, ${context.currentFile.lineCount} lines`;
      
      if (context.currentFile.functions.length > 0) {
        const funcNames = context.currentFile.functions.map(f => f.name).slice(0, 5);
        responsePrompt += `\n- Functions: ${funcNames.join(', ')}${context.currentFile.functions.length > 5 ? '...' : ''}`;
      }
      
      if (context.currentFile.classes.length > 0) {
        const classNames = context.currentFile.classes.map(c => c.name).slice(0, 5);
        responsePrompt += `\n- Classes: ${classNames.join(', ')}${context.currentFile.classes.length > 5 ? '...' : ''}`;
      }
    }
    
    if (context?.project) {
      responsePrompt += `
- Project: ${context.project.name}
- Total Files: ${context.project.files.length}
- Main Languages: ${Object.entries(context.project.languageDistribution.byLanguage)
        .filter(([_, count]) => count > 5)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([lang, count]) => `${lang} (${count})`)
        .join(', ')}`;
    }
    
    // 添加工具调用结果
    if (toolCalls.length > 0) {
      responsePrompt += `\n\n## Tool Execution Results:`;
      for (const toolCall of toolCalls) {
        responsePrompt += `\n- ${toolCall.name}: ${toolCall.status === 'completed' ? 'Completed successfully' : toolCall.error || 'Failed'}`;
        if (toolCall.result) {
          responsePrompt += `\n  Result: ${JSON.stringify(toolCall.result).substring(0, 200)}...`;
        }
      }
    }
    
    // 添加思考摘要
    if (enhancedThinking) {
      responsePrompt += `\n\n## Thinking Process Summary:`;
      const thinkingLines = enhancedThinking.split('\n').slice(0, 10);
      responsePrompt += `\n${thinkingLines.join('\n')}`;
      if (enhancedThinking.split('\n').length > 10) {
        responsePrompt += `\n... (thinking continues)`;
      }
    }
    
    responsePrompt += `\n\n## Assistant's Response:
Please provide a helpful response that addresses the user's request.`;

    if (intent.type === 'code_generation') {
      responsePrompt += ` Include code examples or implementations when appropriate.`;
    } else if (intent.type === 'debugging') {
      responsePrompt += ` Include specific debugging steps and potential fixes.`;
    } else if (intent.type === 'refactoring') {
      responsePrompt += ` Include before/after code comparisons and rationale.`;
    }
    
    responsePrompt += `\n\nResponse:`;
    
    try {
      const response = await this.config.modelAdapter.generate(responsePrompt, {
        maxTokens: 4000,
        temperature: 0.7,
      });
      
      return response.content;
      
    } catch (error: any) {
      this.outputChannel.appendLine(`❌ Enhanced response generation failed: ${error.message}`);
      return `I've analyzed your request about "${intent.operation}" but encountered an error generating the response. Please try again or provide more details.`;
    }
  }
  
  // ==================== 工具方法 ====================
  
  /**
   * 初始化编码专用工具
   */
  private initializeCodingTools(): void {
    // 这里会注册编码专用工具
    // 简化实现：记录可用的工具类别
    
    this.codingTools.set('code_analysis', {
      name: 'Code Analysis Tools',
      description: 'Tools for analyzing code structure and quality',
      tools: ['code_analyzer', 'complexity_calculator', 'dependency_mapper'],
    });
    
    this.codingTools.set('code_generation', {
      name: 'Code Generation Tools',
      description: 'Tools for generating code',
      tools: ['function_generator', 'class_generator', 'test_generator', 'documentation_generator'],
    });
    
    this.codingTools.set('code_editing', {
      name: 'Code Editing Tools',
      description: 'Tools for editing and refactoring code',
      tools: ['file_editor', 'refactor_tool', 'rename_tool', 'extract_method_tool'],
    });
    
    this.codingTools.set('debugging', {
      name: 'Debugging Tools',
      description: 'Tools for debugging and error diagnosis',
      tools: ['error_analyzer', 'stack_trace_parser', 'performance_profiler'],
    });
    
    this.codingTools.set('testing', {
      name: 'Testing Tools',
      description: 'Tools for testing and validation',
      tools: ['test_runner', 'coverage_analyzer', 'assertion_generator'],
    });
    
    this.outputChannel.appendLine(`🧰 Initialized ${this.codingTools.size} coding tool categories`);
  }
  
  /**
   * 初始化状态记忆
   */
  private initializeStateMemory(): void {
    this.stateMemory = new StateMemory();
    this.outputChannel.appendLine('🧠 State memory initialized');
  }
  
  /**
   * 更新状态记忆
   */
  private async updateStateMemory(
    userInput: string,
    assistantResponse: string,
    intent: UserIntent,
    toolCalls: ToolCall[]
  ): Promise<void> {
    const memoryEntry = {
      timestamp: Date.now(),
      userInput,
      assistantResponse: assistantResponse.substring(0, 500), // 截断
      intent: intent.type,
      operation: intent.operation,
      toolsUsed: toolCalls.map(tc => tc.name),
      confidence: intent.confidence,
    };
    
    this.stateMemory.addEntry(memoryEntry);
    this.outputChannel.appendLine(`💾 State memory updated: ${intent.type} with ${toolCalls.length} tools`);
  }
  
  /**
   * 从工具需求创建工具调用
   */
  private createToolCallFromRequirement(
    requirement: ToolRequirement,
    parameters: Record<string, any>
  ): ToolCall {
    return {
      id: this.generateId(),
      toolId: requirement.toolId,
      name: requirement.toolName,
      arguments: parameters[requirement.toolId] || {},
      status: 'pending',
    };
  }
  
  /**
   * 提取操作
   */
  private extractOperation(userInput: string): string {
    // 简化实现：提取动词短语
    const verbs = ['create', 'generate', 'write', 'implement', 'edit', 'modify', 'fix', 'debug', 'test', 'explain', 'optimize', 'refactor'];
    
    const words = userInput.toLowerCase().split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      if (verbs.includes(words[i])) {
        // 提取动词和后面的名词
        const operationWords = words.slice(i, Math.min(i + 4, words.length));
        return operationWords.join(' ');
      }
    }
    
    // 如果没有找到动词，使用前几个词
    return words.slice(0, 3).join(' ');
  }
  
  /**
   * 提取约束
   */
  private extractConstraints(userInput: string): string[] {
    const constraints: string[] = [];
    const lowerInput = userInput.toLowerCase();
    
    // 常见约束关键词
    const constraintPatterns = [
      { pattern: /without\s+(\w+)/gi, extract: (match: string) => `Without ${match}` },
      { pattern: /using\s+(\w+)/gi, extract: (match: string) => `Using ${match}` },
      { pattern: /must\s+(\w+)/gi, extract: (match: string) => `Must ${match}` },
      { pattern: /should\s+(\w+)/gi, extract: (match: string) => `Should ${match}` },
      { pattern: /cannot\s+(\w+)/gi, extract: (match: string) => `Cannot ${match}` },
      { pattern: /need\s+to\s+(\w+)/gi, extract: (match: string) => `Need to ${match}` },
      { pattern: /constraint:?\s*(\w+)/gi, extract: (match: string) => `Constraint: ${match}` },
    ];
    
    for (const pattern of constraintPatterns) {
      const matches = [...lowerInput.matchAll(pattern.pattern)];
      for (const match of matches) {
        if (match[1]) {
          constraints.push(pattern.extract(match[1]));
        }
      }
    }
    
    return constraints;
  }
  
  /**
   * 确定优先级
   */
  private determinePriority(userInput: string, intentType: UserIntent['type']): UserIntent['priority'] {
    const lowerInput = userInput.toLowerCase();
    
    // 高优先级关键词
    const highPriorityWords = ['urgent', 'asap', 'immediately', 'now', 'critical', 'blocking', 'broken'];
    for (const word of highPriorityWords) {
      if (lowerInput.includes(word)) {
        return 'high';
      }
    }
    
    // 根据意图类型确定默认优先级
    switch (intentType) {
      case 'debugging':
      case 'code_editing': // 修复bug通常是高优先级
        return 'high';
      case 'code_generation':
      case 'testing':
        return 'medium';
      case 'explanation':
      case 'refactoring':
      case 'optimization':
        return 'low';
      default:
        return 'medium';
    }
  }
  
  /**
   * 识别所需工具
   */
  private identifyRequiredTools(
    intentType: UserIntent['type'],
    operation: string,
    context?: QueryContext
  ): string[] {
    const tools: string[] = [];
    
    switch (intentType) {
      case 'code_generation':
        tools.push('code_generator', 'syntax_checker');
        if (operation.includes('test')) {
          tools.push('test_generator');
        }
        if (operation.includes('documentation')) {
          tools.push('documentation_generator');
        }
        break;
        
      case 'code_editing':
        tools.push('file_editor', 'syntax_checker');
        if (operation.includes('refactor')) {
          tools.push('refactoring_tool');
        }
        break;
        
      case 'debugging':
        tools.push('error_analyzer', 'stack_trace_parser');
        if (context?.currentFile?.language === 'javascript' || context?.currentFile?.language === 'typescript') {
          tools.push('javascript_debugger');
        }
        break;
        
      case 'testing':
        tools.push('test_runner', 'coverage_analyzer');
        break;
        
      case 'refactoring':
        tools.push('refactoring_tool', 'code_analyzer', 'complexity_calculator');
        break;
        
      case 'optimization':
        tools.push('performance_profiler', 'code_analyzer');
        break;
    }
    
    // 总是添加代码分析工具（如果有上下文）
    if (context && tools.length > 0) {
      tools.push('code_analyzer');
    }
    
    return tools;
  }
  
  /**
   * 生成建议方法
   */
  private generateSuggestedApproach(
    intentType: UserIntent['type'],
    operation: string,
    targetFiles: string[]
  ): string {
    const fileCount = targetFiles.length;
    
    switch (intentType) {
      case 'code_generation':
        return `Generate ${operation} code${fileCount > 0 ? ` for ${fileCount} file(s)` : ''}. Follow best practices and include appropriate error handling.`;
        
      case 'code_editing':
        return `Edit ${operation} in ${fileCount > 0 ? `${fileCount} file(s)` : 'the current file'}. Ensure changes are minimal and focused.`;
        
      case 'debugging':
        return `Debug ${operation} by analyzing errors, checking logs, and identifying root causes. Provide step-by-step fixes.`;
        
      case 'testing':
        return `Create or run tests for ${operation}. Include edge cases and validation logic.`;
        
      case 'refactoring':
        return `Refactor ${operation} to improve code quality while maintaining functionality. Focus on readability and maintainability.`;
        
      case 'optimization':
        return `Optimize ${operation} for performance. Identify bottlenecks and suggest improvements.`;
        
      default:
        return `Explain ${operation} clearly with examples and context.`;
    }
  }
  
  /**
   * 获取工具用途
   */
  private getToolPurpose(toolId: string): string {
    const toolPurposes: Record<string, string> = {
      'code_generator': 'Generate new code based on specifications',
      'file_editor': 'Edit existing files with precise changes',
      'error_analyzer': 'Analyze and diagnose errors in code',
      'test_runner': 'Execute tests and report results',
      'refactoring_tool': 'Restructure code for better quality',
      'performance_profiler': 'Measure and optimize code performance',
      'code_analyzer': 'Analyze code structure and quality',
      'syntax_checker': 'Validate code syntax and style',
      'test_generator': 'Generate test cases for code',
      'documentation_generator': 'Create documentation from code',
      'javascript_debugger': 'Debug JavaScript/TypeScript code',
      'stack_trace_parser': 'Parse and analyze stack traces',
      'coverage_analyzer': 'Analyze test coverage metrics',
      'complexity_calculator': 'Calculate code complexity metrics',
    };
    
    return toolPurposes[toolId] || 'General purpose tool';
  }
  
  /**
   * 解析思考步骤
   */
  private parseThinkingSteps(thinkingContent: string): void {
    const lines = thinkingContent.split('\n');
    let stepNumber = 1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // 识别步骤类型
      let stepType: ThinkingStep['type'] = 'analysis';
      if (line.includes('plan') || line.includes('approach') || line.includes('strategy')) {
        stepType = 'planning';
      } else if (line.includes('execute') || line.includes('implement') || line.includes('code')) {
        stepType = 'execution';
      } else if (line.includes('verify') || line.includes('test') || line.includes('validate')) {
        stepType = 'verification';
      } else if (line.includes('error') || line.includes('bug') || line.includes('issue')) {
        stepType = 'error_diagnosis';
      }
      
      // 如果是编号的步骤或包含关键内容
      if (line.match(/^\d+[\.\)]/) || line.match(/^[*-]\s+/) || line.length > 50) {
        const step: ThinkingStep = {
          step: stepNumber++,
          type: stepType,
          content: line.substring(0, 200), // 截断
          confidence: 0.7,
          dependencies: [],
        };
        
        this.thinkingSteps.push(step);
      }
    }
    
    // 如果没找到编号步骤，把整个内容作为一个步骤
    if (this.thinkingSteps.length === 0 && thinkingContent.length > 0) {
      this.thinkingSteps.push({
        step: 1,
        type: 'analysis',
        content: thinkingContent.substring(0, 300),
        confidence: 0.5,
        dependencies: [],
      });
    }
  }
  
  /**
   * 检查工具是否可用
   */
  private isToolAvailable(toolId: string): boolean {
    // 简化实现：检查工具是否在注册表中
    try {
      return this.config.toolRegistry.getTool(toolId) !== undefined;
    } catch {
      return false;
    }
  }
  
  /**
   * 解析代码生成工具
   */
  private async parseCodeGenerationTools(
    intent: UserIntent,
    context?: QueryContext
  ): Promise<ToolRequirement[]> {
    const requirements: ToolRequirement[] = [];
    
    // 基础代码生成工具
    requirements.push({
      toolId: 'code_generator',
      toolName: 'Code Generator',
      priority: 'required',
      purpose: 'Generate code based on specifications',
      expectedOutput: 'Generated code that meets requirements',
      dependencies: [],
    });
    
    // 如果需要测试
    if (intent.operation.includes('test') || intent.constraints.some(c => c.includes('test'))) {
      requirements.push({
        toolId: 'test_generator',
        toolName: 'Test Generator',
        priority: 'recommended',
        purpose: 'Generate test cases for the code',
        expectedOutput: 'Test cases covering the generated code',
        dependencies: ['code_generator'],
      });
    }
    
    // 如果需要文档
    if (intent.operation.includes('document') || intent.constraints.some(c => c.includes('document'))) {
      requirements.push({
        toolId: 'documentation_generator',
        toolName: 'Documentation Generator',
        priority: 'optional',
        purpose: 'Generate documentation for the code',
        expectedOutput: 'Code documentation',
        dependencies: ['code_generator'],
      });
    }
    
    // 语法检查工具
    requirements.push({
      toolId: 'syntax_checker',
      toolName: 'Syntax Checker',
      priority: 'recommended',
      purpose: 'Check generated code for syntax errors',
      expectedOutput: 'Syntax validation report',
      dependencies: ['code_generator'],
    });
    
    return requirements;
  }
  
  /**
   * 解析代码编辑工具
   */
  private async parseCodeEditingTools(
    intent: UserIntent,
    context?: QueryContext
  ): Promise<ToolRequirement[]> {
    const requirements: ToolRequirement[] = [];
    
    requirements.push({
      toolId: 'file_editor',
      toolName: 'File Editor',
      priority: 'required',
      purpose: 'Edit files with precise changes',
      expectedOutput: 'Modified files',
      dependencies: [],
    });
    
    requirements.push({
      toolId: 'syntax_checker',
      toolName: 'Syntax Checker',
      priority: 'required',
      purpose: 'Check edited code for syntax errors',
      expectedOutput: 'Syntax validation report',
      dependencies: ['file_editor'],
    });
    
    // 如果需要重构
    if (intent.operation.includes('refactor') || intent.type === 'refactoring') {
      requirements.push({
        toolId: 'refactoring_tool',
        toolName: 'Refactoring Tool',
        priority: 'recommended',
        purpose: 'Restructure code for better quality',
        expectedOutput: 'Refactored code with improvements',
        dependencies: ['file_editor'],
      });
    }
    
    return requirements;
  }
  
  /**
   * 解析调试工具
   */
  private async parseDebuggingTools(
    intent: UserIntent,
    context?: QueryContext
  ): Promise<ToolRequirement[]> {
    const requirements: ToolRequirement[] = [];
    
    requirements.push({
      toolId: 'error_analyzer',
      toolName: 'Error Analyzer',
      priority: 'required',
      purpose: 'Analyze and diagnose errors',
      expectedOutput: 'Error analysis report',
      dependencies: [],
    });
    
    // 根据语言添加特定调试器
    if (context?.currentFile?.language) {
      const language = context.currentFile.language.toLowerCase();
      if (language.includes('javascript') || language.includes('typescript')) {
        requirements.push({
          toolId: 'javascript_debugger',
          toolName: 'JavaScript Debugger',
          priority: 'recommended',
          purpose: 'Debug JavaScript/TypeScript code',
          expectedOutput: 'Debugging results and fixes',
          dependencies: ['error_analyzer'],
        });
      }
    }
    
    requirements.push({
      toolId: 'stack_trace_parser',
      toolName: 'Stack Trace Parser',
      priority: 'optional',
      purpose: 'Parse and analyze stack traces',
      expectedOutput: 'Parsed stack trace information',
      dependencies: ['error_analyzer'],
    });
    
    return requirements;
  }
  
  /**
   * 解析测试工具
   */
  private async parseTestingTools(
    intent: UserIntent,
    context?: QueryContext
  ): Promise<ToolRequirement[]> {
    const requirements: ToolRequirement[] = [];
    
    requirements.push({
      toolId: 'test_runner',
      toolName: 'Test Runner',
      priority: 'required',
      purpose: 'Execute tests and report results',
      expectedOutput: 'Test execution results',
      dependencies: [],
    });
    
    requirements.push({
      toolId: 'coverage_analyzer',
      toolName: 'Coverage Analyzer',
      priority: 'recommended',
      purpose: 'Analyze test coverage metrics',
      expectedOutput: 'Coverage analysis report',
      dependencies: ['test_runner'],
    });
    
    return requirements;
  }
  
  /**
   * 解析重构工具
   */
  private async parseRefactoringTools(
    intent: UserIntent,
    context?: QueryContext
  ): Promise<ToolRequirement[]> {
    const requirements: ToolRequirement[] = [];
    
    requirements.push({
      toolId: 'refactoring_tool',
      toolName: 'Refactoring Tool',
      priority: 'required',
      purpose: 'Restructure code for better quality',
      expectedOutput: 'Refactored code',
      dependencies: [],
    });
    
    requirements.push({
      toolId: 'code_analyzer',
      toolName: 'Code Analyzer',
      priority: 'required',
      purpose: 'Analyze code structure before refactoring',
      expectedOutput: 'Code analysis report',
      dependencies: [],
    });
    
    requirements.push({
      toolId: 'complexity_calculator',
      toolName: 'Complexity Calculator',
      priority: 'optional',
      purpose: 'Calculate code complexity metrics',
      expectedOutput: 'Complexity metrics',
      dependencies: ['code_analyzer'],
    });
    
    return requirements;
  }
  
  /**
   * 解析优化工具
   */
  private async parseOptimizationTools(
    intent: UserIntent,
    context?: QueryContext
  ): Promise<ToolRequirement[]> {
    const requirements: ToolRequirement[] = [];
    
    requirements.push({
      toolId: 'performance_profiler',
      toolName: 'Performance Profiler',
      priority: 'required',
      purpose: 'Measure code performance',
      expectedOutput: 'Performance profiling report',
      dependencies: [],
    });
    
    requirements.push({
      toolId: 'code_analyzer',
      toolName: 'Code Analyzer',
      priority: 'required',
      purpose: 'Analyze code for optimization opportunities',
      expectedOutput: 'Optimization analysis report',
      dependencies: [],
    });
    
    return requirements;
  }
  
  /**
   * 提取工具参数
   */
  private async extractToolParameters(
    toolId: string,
    userMessage: string,
    intent: UserIntent,
    context?: QueryContext
  ): Promise<Record<string, any> | undefined> {
    // 简化实现：根据工具ID返回基本参数
    const baseParams: Record<string, any> = {
      userIntent: intent.type,
      operation: intent.operation,
      constraints: intent.constraints,
      priority: intent.priority,
    };
    
    // 添加目标文件
    if (intent.targetFiles.length > 0) {
      baseParams.targetFiles = intent.targetFiles;
    }
    
    // 添加上下文信息
    if (context?.currentFile) {
      baseParams.currentFile = {
        path: context.currentFile.filePath,
        language: context.currentFile.language,
        lineCount: context.currentFile.lineCount,
      };
    }
    
    // 工具特定参数
    switch (toolId) {
      case 'code_generator':
        return {
          ...baseParams,
          requirements: userMessage,
          language: context?.currentFile?.language || 'typescript',
          includeTests: intent.operation.includes('test'),
        };
        
      case 'file_editor':
        return {
          ...baseParams,
          changes: userMessage,
          validateSyntax: true,
          backupOriginal: true,
        };
        
      case 'error_analyzer':
        return {
          ...baseParams,
          errorDescription: userMessage,
          includeStackTrace: true,
          suggestFixes: true,
        };
        
      case 'test_runner':
        return {
          ...baseParams,
          testPattern: '**/*.test.*',
          includeCoverage: true,
        };
        
      default:
        return baseParams;
    }
  }
  
  /**
   * 解决工具依赖关系
   */
  private resolveToolDependencies(requirements: ToolRequirement[]): void {
    // 建立依赖关系图
    const dependencyGraph = new Map<string, string[]>();
    
    for (const req of requirements) {
      dependencyGraph.set(req.toolId, req.dependencies);
    }
    
    // 检查循环依赖（简化实现）
    // 实际实现应该进行拓扑排序
    
    // 调整优先级基于依赖关系
    for (const req of requirements) {
      if (req.dependencies.length > 0) {
        // 如果有依赖，确保依赖的工具优先级不低于当前工具
        for (const depId of req.dependencies) {
          const depReq = requirements.find(r => r.toolId === depId);
          if (depReq && this.isPriorityHigher(req.priority, depReq.priority)) {
            // 提升依赖工具的优先级
            depReq.priority = req.priority;
          }
        }
      }
    }
  }
  
  /**
   * 比较优先级
   */
  private isPriorityHigher(a: string, b: string): boolean {
    const priorityOrder = ['required', 'recommended', 'optional'];
    return priorityOrder.indexOf(a) < priorityOrder.indexOf(b);
  }
  

  
  /**
   * 初始化引擎（用于延迟初始化）
   */
  public async initialize(): Promise<void> {
    this.outputChannel.appendLine('🚀 CodeMasterQueryEngine initializing...');
    
    // 如果代码上下文增强器未完全初始化，进行初始化
    if (this.isCodeContextEnabled) {
      await this.codeEnhancer.initialize?.();
    }
    
    // 初始化编码工具
    await this.initializeCodingTools();
    
    // 初始化状态记忆（如果启用）
    if (this.codeConfig.enableStateMemory) {
      await this.initializeStateMemory();
    }
    
    this.outputChannel.appendLine('✅ CodeMasterQueryEngine initialized successfully');
  }
  
  /**
   * 清理引擎资源
   */
  public async dispose(): Promise<void> {
    this.outputChannel.appendLine('🧹 CodeMasterQueryEngine disposing...');
    
    // 清理代码上下文增强器
    if (this.isCodeContextEnabled && this.codeEnhancer.dispose) {
      await this.codeEnhancer.dispose();
    }
    
    // 清理状态记忆
    if (this.stateMemory.clear) {
      this.stateMemory.clear();
    }
    
    // 清理工具缓存
    this.codingTools.clear();
    this.thinkingSteps = [];
    this.currentThinkingStream = undefined;
    
    this.outputChannel.appendLine('✅ CodeMasterQueryEngine disposed successfully');
  }
  
  /**
   * 生成唯一ID
   */
  protected generateId(): string {
    return `cmqe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ==================== 状态记忆类 ====================

/**
 * 状态记忆管理器
 */
class StateMemory {
  private memory: Array<{
    timestamp: number;
    userInput: string;
    assistantResponse: string;
    intent: string;
    operation: string;
    toolsUsed: string[];
    confidence: number;
  }> = [];
  
  private maxEntries = 100;
  
  /**
   * 添加记忆条目
   */
  addEntry(entry: any): void {
    this.memory.push(entry);
    
    // 限制记忆大小
    if (this.memory.length > this.maxEntries) {
      this.memory = this.memory.slice(-this.maxEntries);
    }
  }
  
  /**
   * 获取相关记忆
   */
  getRelevantMemories(query: string, limit: number = 5): any[] {
    // 简化实现：返回最近的内存
    return this.memory.slice(-limit);
  }
  
  /**
   * 清除记忆
   */
  clear(): void {
    this.memory = [];
  }
  
  /**
   * 获取记忆统计
   */
  getStats(): { total: number; byIntent: Record<string, number> } {
    const byIntent: Record<string, number> = {};
    
    for (const entry of this.memory) {
      byIntent[entry.intent] = (byIntent[entry.intent] || 0) + 1;
    }
    
    return {
      total: this.memory.length,
      byIntent,
    };
  }
}

export default CodeMasterQueryEngine;