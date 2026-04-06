/**
 * 工具进度服务
 * 桥接StreamingToolExecutor进度事件和WebView UI
 */

import * as vscode from 'vscode';
import { StreamingToolExecutor } from '../core/executor/StreamingToolExecutor';
import { ExtendedToolProgress } from '../core/tool/BaseTool';

/**
 * 工具进度消息
 */
export interface ToolProgressMessage {
  /** 消息类型 */
  type: 'tool_execution_start' | 'tool_execution_progress' | 'tool_execution_complete' | 'tool_execution_error';
  /** 执行ID */
  executionId: string;
  /** 工具ID */
  toolId: string;
  /** 工具名称 */
  toolName?: string;
  /** 进度 (0-1) */
  progress?: number;
  /** 进度消息 */
  message?: string;
  /** 数据 */
  data?: any;
  /** 时间戳 */
  timestamp: Date;
  /** 持续时间（毫秒） */
  duration?: number;
  /** 结果 */
  result?: any;
  /** 错误 */
  error?: string;
}

/**
 * 工具进度服务
 */
export class ToolProgressService {
  private static instance: ToolProgressService;
  private executors: Map<string, StreamingToolExecutor> = new Map();
  private webviewPanel: vscode.WebviewPanel | null = null;
  private isInitialized = false;

  private constructor() {}

  /**
   * 获取单例实例
   */
  public static getInstance(): ToolProgressService {
    if (!ToolProgressService.instance) {
      ToolProgressService.instance = new ToolProgressService();
    }
    return ToolProgressService.instance;
  }

  /**
   * 初始化服务
   */
  public initialize(): void {
    if (this.isInitialized) {
      return;
    }

    console.log('ToolProgressService: 初始化工具进度服务');
    this.isInitialized = true;
  }

  /**
   * 注册执行器以监听进度事件
   */
  public registerExecutor(executorId: string, executor: StreamingToolExecutor): void {
    if (this.executors.has(executorId)) {
      console.warn(`ToolProgressService: 执行器 ${executorId} 已注册`);
      return;
    }

    this.executors.set(executorId, executor);

    // 监听执行器事件
    executor.on('execution:start', (executionInfo) => {
      this.handleExecutionStart(executorId, executionInfo);
    });

    executor.on('execution:progress', (executionId, progress) => {
      this.handleExecutionProgress(executorId, executionId, progress);
    });

    executor.on('execution:complete', (executionResult) => {
      this.handleExecutionComplete(executorId, executionResult);
    });

    executor.on('execution:error', (executionId, error) => {
      this.handleExecutionError(executorId, executionId, error);
    });

    console.log(`ToolProgressService: 注册执行器 ${executorId}`);
  }

  /**
   * 注销执行器
   */
  public unregisterExecutor(executorId: string): void {
    this.executors.delete(executorId);
    console.log(`ToolProgressService: 注销执行器 ${executorId}`);
  }

  /**
   * 设置WebView面板（用于发送消息）
   */
  public setWebviewPanel(panel: vscode.WebviewPanel): void {
    this.webviewPanel = panel;
    console.log('ToolProgressService: WebView面板已设置');
  }

  /**
   * 清除WebView面板
   */
  public clearWebviewPanel(): void {
    this.webviewPanel = null;
    console.log('ToolProgressService: WebView面板已清除');
  }

  /**
   * 发送进度消息到WebView
   */
  public sendProgressMessage(message: ToolProgressMessage): void {
    if (!this.webviewPanel) {
      console.warn('ToolProgressService: 没有可用的WebView面板，无法发送消息');
      return;
    }

    try {
      // 发送消息，command 字段设置为消息类型，以便 EnhancedChatView 正确路由
      this.webviewPanel.webview.postMessage({
        command: message.type, // 使用消息类型作为命令
        ...message
      });
      
      console.log(`ToolProgressService: 发送进度消息 ${message.type} 执行ID ${message.executionId}`);
    } catch (error) {
      console.error('ToolProgressService: 发送消息失败:', error);
    }
  }

  /**
   * 处理执行开始事件
   */
  private handleExecutionStart(executorId: string, executionInfo: any): void {
    const message: ToolProgressMessage = {
      type: 'tool_execution_start',
      executionId: executionInfo.executionId,
      toolId: executionInfo.toolId,
      toolName: this.getToolName(executionInfo.toolId),
      progress: 0.1,
      message: `开始执行 ${this.getToolName(executionInfo.toolId)}`,
      timestamp: new Date(),
      data: executionInfo.metadata
    };

    this.sendProgressMessage(message);
  }

  /**
   * 处理执行进度事件
   */
  private handleExecutionProgress(
    executorId: string,
    executionId: string,
    progress: ExtendedToolProgress
  ): void {
    const message: ToolProgressMessage = {
      type: 'tool_execution_progress',
      executionId,
      toolId: this.getToolIdFromExecution(executorId, executionId),
      progress: progress.progress,
      message: progress.message,
      timestamp: new Date(),
      data: progress
    };

    this.sendProgressMessage(message);
  }

  /**
   * 处理执行完成事件
   */
  private handleExecutionComplete(executorId: string, executionResult: any): void {
    const duration = executionResult.endTime && executionResult.startTime
      ? executionResult.endTime.getTime() - executionResult.startTime.getTime()
      : 0;

    const message: ToolProgressMessage = {
      type: 'tool_execution_complete',
      executionId: executionResult.executionId,
      toolId: executionResult.toolId,
      toolName: this.getToolName(executionResult.toolId),
      progress: 1.0,
      message: `执行完成 (${duration}ms)`,
      timestamp: new Date(),
      duration,
      result: executionResult,
      data: executionResult
    };

    this.sendProgressMessage(message);
  }

  /**
   * 处理执行错误事件
   */
  private handleExecutionError(executorId: string, executionId: string, error: Error): void {
    const message: ToolProgressMessage = {
      type: 'tool_execution_error',
      executionId,
      toolId: this.getToolIdFromExecution(executorId, executionId),
      progress: 1.0,
      message: `执行失败: ${error.message}`,
      timestamp: new Date(),
      error: error.message,
      data: { error }
    };

    this.sendProgressMessage(message);
  }

  /**
   * 从执行器中获取工具ID
   */
  private getToolIdFromExecution(executorId: string, executionId: string): string {
    const executor = this.executors.get(executorId);
    if (!executor) {
      return 'unknown';
    }

    // 简化实现：尝试从执行信息中获取
    // 在实际实现中，需要访问执行器的内部状态
    return 'unknown';
  }

  /**
   * 获取工具显示名称
   */
  private getToolName(toolId: string): string {
    const toolNames: Record<string, string> = {
      'bash': 'Bash 命令执行',
      'enhanced-bash': '增强Bash命令',
      'file': '文件操作',
      'git': 'Git 操作',
      'search': '代码搜索',
      'edit': '代码编辑'
    };

    return toolNames[toolId] || toolId;
  }

  /**
   * 获取所有注册的执行器
   */
  public getRegisteredExecutors(): string[] {
    return Array.from(this.executors.keys());
  }

  /**
   * 清理服务
   */
  public dispose(): void {
    this.executors.clear();
    this.webviewPanel = null;
    this.isInitialized = false;
    console.log('ToolProgressService: 服务已清理');
  }
}

/**
 * 创建工具进度服务实例
 */
export function createToolProgressService(): ToolProgressService {
  return ToolProgressService.getInstance();
}