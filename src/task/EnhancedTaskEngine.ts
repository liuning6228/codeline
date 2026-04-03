/**
 * 增强任务引擎 - 支持异步生成器事件流
 * 基于现有TaskEngine，添加实时事件反馈能力
 * 
 * 设计原则：
 * 1. 保持向后兼容：现有startTask() API不变
 * 2. 新增executeTask()异步生成器API
 * 3. 实时事件流：任务执行过程中的详细状态更新
 * 4. 支持任务取消和进度跟踪
 */

import * as vscode from 'vscode';
import { TaskEngine, TaskResult, TaskStep, TaskOptions } from './taskEngine';
import { 
  TaskEventUnion, 
  TaskEventGenerator, 
  EnhancedTaskConfig, 
  TaskExecutionOptions,
  TaskStartedEvent,
  AnalyzingProjectEvent,
  ProjectAnalyzedEvent,
  ConsultingAIEvent,
  AIResponseReceivedEvent,
  StepsParsedEvent,
  StepStartedEvent,
  StepCompletedEvent,
  StepFailedEvent,
  TaskCompletedEvent,
  TaskFailedEvent,
  TaskEndedEvent,
  TaskCancelledEvent,
  TaskProgressEvent,
  StreamTaskResult
} from './taskTypes';

export class EnhancedTaskEngine {
  private taskEngine: TaskEngine;
  private activeTasks: Map<string, { generator: TaskEventGenerator; cancelled: boolean }> = new Map();
  
  constructor(
    private projectAnalyzer: any,
    private promptEngine: any,
    private modelAdapter: any,
    private fileManager: any,
    private terminalExecutor: any,
    private browserAutomator: any
  ) {
    // 重用现有TaskEngine实例
    this.taskEngine = new TaskEngine(
      projectAnalyzer,
      promptEngine,
      modelAdapter,
      fileManager,
      terminalExecutor,
      browserAutomator
    );
  }

  /**
   * 生成唯一的任务ID
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 异步生成器版本的任务执行
   * 返回一个AsyncGenerator，产生实时事件流
   */
  public async *executeTask(
    description: string,
    options: TaskExecutionOptions = {}
  ): TaskEventGenerator {
    const taskId = options.taskId || this.generateTaskId();
    const startTime = Date.now();
    
    // 发送任务开始事件
    yield this.createTaskStartedEvent(taskId, description, startTime);
    
    try {
      // 发送项目分析开始事件
      yield this.createAnalyzingProjectEvent(taskId, startTime);
      
      // 分析项目上下文
      const projectContext = await this.analyzeProjectWithContext();
      yield this.createProjectAnalyzedEvent(taskId, projectContext);
      
      // 发送AI咨询开始事件
      yield this.createConsultingAIEvent(taskId, startTime);
      
      // 获取AI响应
      const aiResponse = await this.getAIResponse(description, projectContext);
      yield this.createAIResponseReceivedEvent(taskId, aiResponse);
      
      // 解析AI响应为步骤
      const parsedSteps = this.parseAIResponse(aiResponse);
      yield this.createStepsParsedEvent(taskId, parsedSteps);
      
      // 执行步骤
      const stepResults = [];
      for (let i = 0; i < parsedSteps.length; i++) {
        const step = parsedSteps[i];
        
        // 发送步骤开始事件
        yield this.createStepStartedEvent(taskId, i, step, parsedSteps.length);
        
        try {
          // 发送进度更新
          yield this.createTaskProgressEvent(taskId, 
            Math.floor((i / parsedSteps.length) * 50) + 25, // 25-75%范围
            `Executing step ${i + 1}/${parsedSteps.length}: ${step.description}`
          );
          
          // 执行步骤
          const stepResult = await this.executeStep(step);
          stepResults.push(stepResult);
          
          // 发送步骤完成事件
          yield this.createStepCompletedEvent(taskId, i, stepResult, startTime);
          
        } catch (stepError) {
          // 发送步骤失败事件
          yield this.createStepFailedEvent(taskId, i, stepError);
          
          // 根据配置决定是否继续
          if (options.configOverrides?.requireApproval) {
            // 需要用户批准时抛出错误
            throw stepError;
          }
          // 否则继续下一个步骤
        }
      }
      
      // 生成最终结果
      const finalResult = await this.generateFinalResult(stepResults);
      
      // 发送任务完成事件
      yield this.createTaskCompletedEvent(taskId, finalResult, startTime, parsedSteps.length, stepResults.length);
      
      // 发送任务结束事件
      yield this.createTaskEndedEvent(taskId, startTime);
      
      return finalResult;
      
    } catch (error) {
      // 发送任务失败事件
      yield this.createTaskFailedEvent(taskId, error, startTime);
      
      // 发送任务结束事件
      yield this.createTaskEndedEvent(taskId, startTime);
      
      throw error;
    }
  }

  /**
   * 保持向后兼容的startTask方法
   * 包装executeTask的异步生成器，返回Promise
   */
  public async startTask(description: string, config: TaskOptions): Promise<TaskResult> {
    // 使用executeTask获取事件流
    const events = this.executeTask(description, {
      configOverrides: {
        autoExecute: config.autoExecute !== false,
        requireApproval: config.requireApproval || false,
        enableEventStream: false, // 兼容模式下不启用事件流
        cancellable: false
      }
    });
    
    let finalResult: TaskResult | null = null;
    
    // 消费所有事件，等待任务完成
    for await (const event of events) {
      // 如果任务完成，保存结果
      if (event.type === 'task_completed') {
        finalResult = event.result;
      }
      
      // 如果任务失败，抛出错误
      if (event.type === 'task_failed') {
        throw new Error(event.error);
      }
    }
    
    if (!finalResult) {
      throw new Error('Task completed without result');
    }
    
    return finalResult;
  }

  /**
   * 取消正在执行的任务
   */
  public cancelTask(taskId: string): boolean {
    const task = this.activeTasks.get(taskId);
    if (task) {
      task.cancelled = true;
      return true;
    }
    return false;
  }

  /**
   * 获取任务状态
   */
  public getTaskStatus(taskId: string): { status: string; progress: number; events: number } | null {
    const task = this.activeTasks.get(taskId);
    if (!task) return null;
    
    // 这里可以扩展为更详细的状态跟踪
    return {
      status: 'running',
      progress: 0,
      events: 0
    };
  }

  // ==================== 事件创建辅助方法 ====================

  private createTaskStartedEvent(taskId: string, description: string, timestamp: number): TaskStartedEvent {
    return {
      type: 'task_started',
      taskId,
      description,
      timestamp
    };
  }

  private createAnalyzingProjectEvent(taskId: string, timestamp: number): AnalyzingProjectEvent {
    return {
      type: 'analyzing_project',
      status: 'executing',
      timestamp,
      taskId
    };
  }

  private createProjectAnalyzedEvent(taskId: string, context: any): ProjectAnalyzedEvent {
    return {
      type: 'project_analyzed',
      context: {
        files: context.files || 0,
        directories: context.directories || 0,
        languages: context.languages || [],
        dependencies: context.dependencies || []
      },
      timestamp: Date.now(),
      taskId
    };
  }

  private createConsultingAIEvent(taskId: string, timestamp: number): ConsultingAIEvent {
    return {
      type: 'consulting_ai',
      status: 'executing',
      timestamp,
      taskId
    };
  }

  private createAIResponseReceivedEvent(taskId: string, response: any): AIResponseReceivedEvent {
    return {
      type: 'ai_response_received',
      content: response.content || '',
      tokenCount: response.tokenCount,
      timestamp: Date.now(),
      taskId
    };
  }

  private createStepsParsedEvent(taskId: string, steps: TaskStep[]): StepsParsedEvent {
    return {
      type: 'steps_parsed',
      count: steps.length,
      steps,
      timestamp: Date.now(),
      taskId
    };
  }

  private createStepStartedEvent(taskId: string, stepIndex: number, step: TaskStep, totalSteps: number): StepStartedEvent {
    return {
      type: 'step_started',
      stepIndex,
      step,
      totalSteps,
      timestamp: Date.now(),
      taskId
    };
  }

  private createStepCompletedEvent(taskId: string, stepIndex: number, result: any, startTime: number): StepCompletedEvent {
    return {
      type: 'step_completed',
      stepIndex,
      result,
      duration: Date.now() - startTime,
      timestamp: Date.now(),
      taskId
    };
  }

  private createStepFailedEvent(taskId: string, stepIndex: number, error: any): StepFailedEvent {
    return {
      type: 'step_failed',
      stepIndex,
      error: error.message || String(error),
      retryable: true,
      timestamp: Date.now(),
      taskId
    };
  }

  private createTaskCompletedEvent(taskId: string, result: TaskResult, startTime: number, totalSteps: number, completedSteps: number): TaskCompletedEvent {
    return {
      type: 'task_completed',
      result,
      duration: Date.now() - startTime,
      completedSteps,
      totalSteps,
      timestamp: Date.now(),
      taskId
    };
  }

  private createTaskFailedEvent(taskId: string, error: any, startTime: number): TaskFailedEvent {
    return {
      type: 'task_failed',
      error: error.message || String(error),
      duration: Date.now() - startTime,
      timestamp: Date.now(),
      taskId
    };
  }

  private createTaskEndedEvent(taskId: string, startTime: number): TaskEndedEvent {
    return {
      type: 'task_ended',
      timestamp: Date.now(),
      taskId
    };
  }

  private createTaskProgressEvent(taskId: string, progress: number, message: string): TaskProgressEvent {
    return {
      type: 'task_progress',
      progress,
      message,
      timestamp: Date.now(),
      taskId
    };
  }

  // ==================== 任务执行核心方法（重用现有逻辑） ====================

  private async analyzeProjectWithContext(): Promise<any> {
    // 重用现有TaskEngine的项目分析逻辑
    // 这里简化实现，实际应该调用this.taskEngine的相应方法
    return {
      files: 10,
      directories: 2,
      languages: ['TypeScript', 'JavaScript'],
      dependencies: ['axios']
    };
  }

  private async getAIResponse(description: string, context: any): Promise<any> {
    // 重用现有TaskEngine的AI调用逻辑
    // 这里简化实现
    return {
      content: `AI response for: ${description}`,
      tokenCount: 100
    };
  }

  private parseAIResponse(response: any): TaskStep[] {
    // 重用现有TaskEngine的步骤解析逻辑
    // 这里简化实现
    return [
      {
        type: 'info',
        description: 'Step 1: Analyze requirements',
        status: 'pending',
        data: { action: 'analyze' }
      },
      {
        type: 'info',
        description: 'Step 2: Implement solution',
        status: 'pending',
        data: { action: 'implement' }
      }
    ];
  }

  private async executeStep(step: TaskStep): Promise<any> {
    // 重用现有TaskEngine的步骤执行逻辑
    // 这里简化实现
    return { success: true, result: `Executed: ${step.description}` };
  }

  private async generateFinalResult(stepResults: any[]): Promise<TaskResult> {
    // 重用现有TaskEngine的结果生成逻辑
    // 这里简化实现
    return {
      success: true,
      steps: stepResults.map((r, i) => ({
        type: 'info',
        description: `Step ${i + 1}`,
        status: 'completed',
        result: JSON.stringify(r),
        data: { index: i, result: r }
      })),
      output: stepResults.map(r => JSON.stringify(r)).join('\n'),
      summary: 'Task completed successfully'
    };
  }

  /**
   * 流式任务执行（高级API）
   * 返回StreamTaskResult，包含详细统计信息
   */
  public async executeTaskWithStream(
    description: string,
    options: TaskExecutionOptions = {}
  ): Promise<StreamTaskResult> {
    const taskId = options.taskId || this.generateTaskId();
    const startTime = Date.now();
    const events: TaskEventUnion[] = [];
    
    try {
      const generator = this.executeTask(description, { ...options, taskId });
      this.activeTasks.set(taskId, { generator, cancelled: false });
      
      let finalResult: TaskResult | undefined;
      let error: string | undefined;
      
      // 消费事件流
      for await (const event of generator) {
        events.push(event);
        
        // 调用事件回调
        if (options.onEvent) {
          options.onEvent(event);
        }
        
        // 处理进度回调
        if (event.type === 'task_progress' && options.onProgress) {
          options.onProgress(event.progress, event.message);
        }
        
        // 保存最终结果
        if (event.type === 'task_completed') {
          finalResult = event.result;
        }
        
        // 保存错误信息
        if (event.type === 'task_failed') {
          error = event.error;
        }
        
        // 检查任务是否被取消
        const task = this.activeTasks.get(taskId);
        if (task?.cancelled) {
          // 发送取消事件
          events.push({
            type: 'task_cancelled',
            reason: 'User requested cancellation',
            timestamp: Date.now(),
            taskId
          });
          break;
        }
      }
      
      // 清理活动任务
      this.activeTasks.delete(taskId);
      
      const duration = Date.now() - startTime;
      const completedSteps = events.filter(e => e.type === 'step_completed').length;
      const failedSteps = events.filter(e => e.type === 'step_failed').length;
      const totalSteps = events.filter(e => e.type === 'step_started').length;
      
      return {
        taskId,
        result: finalResult,
        error,
        eventCount: events.length,
        duration,
        status: error ? 'failed' : finalResult ? 'completed' : 'cancelled',
        steps: {
          total: totalSteps,
          completed: completedSteps,
          failed: failedSteps
        }
      };
      
    } catch (err) {
      this.activeTasks.delete(taskId);
      throw err;
    }
  }
}