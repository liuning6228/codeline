/**
 * EnhancedQueryEngine模拟类
 * 模拟真实EnhancedQueryEngine的核心功能，用于测试EnhancedEngineAdapter
 */

import { IEnhancedQueryEngine } from '../types/EnhancedEngineAdapterInterface';
import { EnhancedToolSelector } from './EnhancedToolSelector';

// ==================== 类型定义 ====================

/**
 * EnhancedQueryEngine配置
 */
export interface EnhancedQueryEngineConfig {
  modelAdapter: any;
  projectAnalyzer: any;
  promptEngine: any;
  toolRegistry: any;
  cwd: string;
  extensionContext: any;
  workspaceRoot: string;
  verbose?: boolean;
  thinkingConfig?: any;
  maxTurns?: number;
  maxBudgetUsd?: number;
  userSpecifiedModel?: string;
  fallbackModel?: string;
  customSystemPrompt?: string;
  appendSystemPrompt?: string;
  enabledToolCategories?: string[];
  disabledToolIds?: string[];
  onStateUpdate?: (state: any) => void;
  onProgress?: (progress: any) => void;
  permissionMode?: string;
}

/**
 * 对话状态
 */
export interface ConversationState {
  messages: any[];
  toolCalls: any[];
  thinkingSteps: any[];
  currentMode: 'plan' | 'act';
  lastActivity: Date;
  usage: {
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    estimatedCost: number;
  };
}

/**
 * 提交消息选项
 */
export interface SubmitMessageOptions {
  images?: string[];
  files?: string[];
  context?: Record<string, any>;
  skipThinking?: boolean;
  skipTools?: boolean;
}

// ==================== EnhancedQueryEngine模拟 ====================

export class MockEnhancedQueryEngine implements IEnhancedQueryEngine {
  private config: EnhancedQueryEngineConfig;
  private conversationState: ConversationState;
  private mode: 'plan' | 'act';
  private toolSelector: EnhancedToolSelector;
  
  constructor(config: EnhancedQueryEngineConfig) {
    console.log('MockEnhancedQueryEngine: 创建实例');
    this.config = config;
    this.mode = 'act'; // 默认模式
    
    // 初始化增强工具选择器
    this.toolSelector = new EnhancedToolSelector(config.toolRegistry);
    
    this.conversationState = {
      messages: [],
      toolCalls: [],
      thinkingSteps: [],
      currentMode: this.mode,
      lastActivity: new Date(),
      usage: {
        totalTokens: 0,
        promptTokens: 0,
        completionTokens: 0,
        estimatedCost: 0
      }
    };
    
    if (config.verbose) {
      console.log('MockEnhancedQueryEngine: 详细模式已启用');
    }
  }
  
  // ========== 核心API方法 ==========
  
  /**
   * 同步提交消息（模拟真实接口）
   */
  async submitMessageSync(content: string, options?: SubmitMessageOptions): Promise<any> {
    console.log('MockEnhancedQueryEngine: 提交消息:', content.substring(0, 100) + (content.length > 100 ? '...' : ''));
    
    // 记录消息
    this.conversationState.messages.push({
      role: 'user',
      content,
      timestamp: new Date()
    });
    
    // 更新最后活动时间
    this.conversationState.lastActivity = new Date();
    
    try {
      // 根据模式处理消息
      let response;
      let toolCalls = [];
      
      if (this.mode === 'plan') {
        // 计划模式：生成计划而不执行工具
        response = await this.handlePlanMode(content, options);
      } else {
        // 行动模式：分析并可能执行工具
        const result = await this.handleActMode(content, options);
        response = result.response;
        toolCalls = result.toolCalls;
      }
      
      // 记录响应
      this.conversationState.messages.push({
        role: 'assistant',
        content: response.content,
        timestamp: new Date()
      });
      
      // 如果有工具调用，记录下来
      if (toolCalls.length > 0) {
        this.conversationState.toolCalls.push(...toolCalls);
      }
      
      // 更新使用统计
      this.conversationState.usage.totalTokens += 100;
      this.conversationState.usage.promptTokens += 40;
      this.conversationState.usage.completionTokens += 60;
      this.conversationState.usage.estimatedCost += 0.0002;
      
      // 通知状态更新
      if (this.config.onStateUpdate) {
        this.config.onStateUpdate(this.conversationState);
      }
      
      return {
        success: true,
        message: response,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        thinking: '模拟思考过程：分析问题 → 选择工具 → 生成响应',
        usage: this.conversationState.usage
      };
      
    } catch (error: any) {
      console.error('MockEnhancedQueryEngine: 消息处理失败:', error.message);
      
      return {
        success: false,
        error: error.message,
        message: { content: `处理失败: ${error.message}`, type: 'error' }
      };
    }
  }
  
  /**
   * 获取当前模式
   */
  getMode(): 'plan' | 'act' {
    return this.mode;
  }
  
  /**
   * 设置模式
   */
  setMode(mode: 'plan' | 'act'): void {
    console.log(`MockEnhancedQueryEngine: 设置模式: ${mode}`);
    this.mode = mode;
    this.conversationState.currentMode = mode;
    
    // 通知状态更新
    if (this.config.onStateUpdate) {
      this.config.onStateUpdate(this.conversationState);
    }
  }
  
  /**
   * 获取状态
   */
  getState(): ConversationState {
    return { ...this.conversationState };
  }
  
  /**
   * 清除对话
   */
  clear(): void {
    console.log('MockEnhancedQueryEngine: 清除对话');
    this.conversationState = {
      messages: [],
      toolCalls: [],
      thinkingSteps: [],
      currentMode: this.mode,
      lastActivity: new Date(),
      usage: {
        totalTokens: 0,
        promptTokens: 0,
        completionTokens: 0,
        estimatedCost: 0
      }
    };
    
    // 通知状态更新
    if (this.config.onStateUpdate) {
      this.config.onStateUpdate(this.conversationState);
    }
  }
  
  /**
   * 导出对话
   */
  exportConversation(): string | null {
    console.log('MockEnhancedQueryEngine: 导出对话');
    try {
      return JSON.stringify(this.conversationState, null, 2);
    } catch (error) {
      console.error('MockEnhancedQueryEngine: 导出对话失败:', error);
      return null;
    }
  }
  
  /**
   * 导入对话
   */
  importConversation(json: string): void {
    console.log('MockEnhancedQueryEngine: 导入对话');
    try {
      const importedState = JSON.parse(json);
      this.conversationState = {
        ...this.conversationState,
        ...importedState,
        lastActivity: new Date()
      };
      
      console.log(`MockEnhancedQueryEngine: 已导入 ${importedState.messages?.length || 0} 条消息`);
    } catch (error) {
      console.error('MockEnhancedQueryEngine: 导入对话失败:', error);
      throw new Error('导入对话失败: 无效的JSON格式');
    }
  }
  
  // ========== 私有方法 ==========
  
  /**
   * 处理计划模式
   */
  private async handlePlanMode(content: string, options?: SubmitMessageOptions): Promise<any> {
    console.log('MockEnhancedQueryEngine: 处理计划模式');
    
    // 模拟生成计划
    const plan = `
计划：分析"${content.substring(0, 50)}..."任务

步骤：
1. 分析代码上下文和问题
2. 识别需要使用的工具
3. 制定具体的实现步骤
4. 生成详细的代码修改计划

预计工具使用：
- read_file: 读取相关文件
- analyze_code: 代码分析
- write_file: 写入修改

预计时间：5-10分钟
`;
    
    return {
      content: plan,
      type: 'plan',
      blocks: [
        {
          type: 'text',
          content: plan
        }
      ]
    };
  }
  
  /**
   * 处理行动模式
   */
  private async handleActMode(content: string, options?: SubmitMessageOptions): Promise<{ response: any, toolCalls: any[] }> {
    console.log('MockEnhancedQueryEngine: 处理行动模式（增强工具选择）');
    
    const toolCalls = [];
    
    // 使用增强工具选择器选择最佳工具
    const toolMatch = this.toolSelector.selectBestTool(content, options?.context);
    
    if (toolMatch && this.config.toolRegistry && !options?.skipTools) {
      console.log(`MockEnhancedQueryEngine: 检测到需要工具调用 - ${toolMatch.tool.name} (置信度: ${toolMatch.confidence.toFixed(2)})`);
      console.log(`匹配原因: ${toolMatch.reason}`);
      
      try {
        // 合并参数：提取的参数 + 上下文参数
        const params = {
          ...toolMatch.extractedParams,
          query: content,
          context: options?.context
        };
        
        // 执行工具
        const startTime = Date.now();
        const toolResult = await this.config.toolRegistry.executeTool(toolMatch.tool.name, params);
        const executionTime = Date.now() - startTime;
        
        // 记录工具执行历史
        this.toolSelector.recordToolExecution(
          toolMatch.tool.name,
          params,
          toolResult,
          true,
          executionTime
        );
        
        toolCalls.push({
          tool: toolMatch.tool.name,
          args: params,
          result: toolResult,
          timestamp: new Date(),
          matchScore: toolMatch.score,
          confidence: toolMatch.confidence
        });
        
        // 基于工具结果生成响应
        const response = {
          content: `已使用工具 ${toolMatch.tool.name} 处理您的请求。\n\n匹配置信度: ${toolMatch.confidence.toFixed(2)}\n匹配原因: ${toolMatch.reason}\n\n工具结果：\n\`\`\`json\n${JSON.stringify(toolResult, null, 2)}\n\`\`\`\n\n建议下一步：检查结果并根据需要进行调整。`,
          type: 'mixed',
          blocks: [
            {
              type: 'text',
              content: `已使用工具 ${toolMatch.tool.name} 处理您的请求。`
            },
            {
              type: 'text',
              content: `匹配置信度: ${toolMatch.confidence.toFixed(2)} | 匹配原因: ${toolMatch.reason}`
            },
            {
              type: 'code',
              language: 'json',
              content: JSON.stringify(toolResult, null, 2)
            }
          ]
        };
        
        return { response, toolCalls };
        
      } catch (error: any) {
        console.error('MockEnhancedQueryEngine: 工具调用失败:', error.message);
        // 工具调用失败，回退到普通响应
      }
    } else if (toolMatch) {
      console.log(`MockEnhancedQueryEngine: 找到工具但跳过调用 - ${toolMatch.tool.name} (置信度: ${toolMatch.confidence.toFixed(2)})`);
    } else {
      console.log('MockEnhancedQueryEngine: 未找到合适的工具');
    }
    
    // 没有工具调用或工具调用失败，生成普通响应
    const response = {
      content: `已处理您的请求：${content}\n\n这是模拟响应。在实际环境中，将会分析代码上下文并使用适当的工具。`,
      type: 'text',
      blocks: [
        {
          type: 'text',
          content: `已处理您的请求：${content}`
        },
        {
          type: 'code',
          language: 'typescript',
          content: '// 示例代码\nconsole.log("Hello from MockEnhancedQueryEngine");'
        }
      ]
    };
    
    return { response, toolCalls };
  }
  
  /**
   * 判断是否应该调用工具（增强版本）
   */
  private shouldCallTool(content: string): boolean {
    // 使用增强工具选择器
    const toolMatch = this.toolSelector.selectBestTool(content);
    return toolMatch !== null && toolMatch.confidence > 0.3; // 置信度阈值
  }
  
  /**
   * 为任务选择合适的工具
   */
  private selectToolForTask(content: string): string | null {
    if (content.toLowerCase().includes('文件') || content.toLowerCase().includes('读取') || content.toLowerCase().includes('写入')) {
      return 'read_file';
    } else if (content.toLowerCase().includes('执行') || content.toLowerCase().includes('命令') || content.toLowerCase().includes('终端')) {
      return 'execute_command';
    } else if (content.toLowerCase().includes('修复') || content.toLowerCase().includes('错误') || content.toLowerCase().includes('bug')) {
      return 'analyze_code';
    }
    
    return null;
  }
}

// ==================== 导出 ====================

export default MockEnhancedQueryEngine;