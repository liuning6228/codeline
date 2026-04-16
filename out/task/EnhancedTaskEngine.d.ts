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
import { TaskResult, TaskOptions } from './taskEngine';
import { TaskEventGenerator, TaskExecutionOptions, StreamTaskResult } from './taskTypes';
export declare class EnhancedTaskEngine {
    private projectAnalyzer;
    private promptEngine;
    private modelAdapter;
    private fileManager;
    private terminalExecutor;
    private browserAutomator;
    private taskEngine;
    private activeTasks;
    constructor(projectAnalyzer: any, promptEngine: any, modelAdapter: any, fileManager: any, terminalExecutor: any, browserAutomator: any);
    /**
     * 生成唯一的任务ID
     */
    private generateTaskId;
    /**
     * 异步生成器版本的任务执行
     * 返回一个AsyncGenerator，产生实时事件流
     */
    executeTask(description: string, options?: TaskExecutionOptions): TaskEventGenerator;
    /**
     * 保持向后兼容的startTask方法
     * 包装executeTask的异步生成器，返回Promise
     */
    startTask(description: string, config: TaskOptions): Promise<TaskResult>;
    /**
     * 取消正在执行的任务
     */
    cancelTask(taskId: string): boolean;
    /**
     * 获取任务状态
     */
    getTaskStatus(taskId: string): {
        status: string;
        progress: number;
        events: number;
    } | null;
    private createTaskStartedEvent;
    private createAnalyzingProjectEvent;
    private createProjectAnalyzedEvent;
    private createConsultingAIEvent;
    private createAIResponseReceivedEvent;
    private createStepsParsedEvent;
    private createStepStartedEvent;
    private createStepCompletedEvent;
    private createStepFailedEvent;
    private createTaskCompletedEvent;
    private createTaskFailedEvent;
    private createTaskEndedEvent;
    private createTaskProgressEvent;
    private analyzeProjectWithContext;
    private getAIResponse;
    private parseAIResponse;
    private executeStep;
    private generateFinalResult;
    /**
     * 流式任务执行（高级API）
     * 返回StreamTaskResult，包含详细统计信息
     */
    executeTaskWithStream(description: string, options?: TaskExecutionOptions): Promise<StreamTaskResult>;
}
//# sourceMappingURL=EnhancedTaskEngine.d.ts.map