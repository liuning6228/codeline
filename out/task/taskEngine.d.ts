import { EnhancedProjectAnalyzer } from '../analyzer/enhancedProjectAnalyzer';
import { ProjectContext } from '../analyzer/projectAnalyzer';
import { PromptEngine, PromptOptions } from '../prompt/promptEngine';
import { ModelAdapter } from '../models/modelAdapter';
import { FileManager, FileDiff } from '../file/fileManager';
import { TerminalExecutor } from '../terminal/terminalExecutor';
import { BrowserAutomator } from '../browser/browserAutomator';
import { ApprovalWorkflow, ApprovalItem, ApprovalType, ApprovalResult } from '../workflow/approvalWorkflow';
export interface TaskResult {
    success: boolean;
    steps: TaskStep[];
    output: string;
    summary?: string;
    error?: string;
}
export interface TaskStep {
    type: 'file' | 'terminal' | 'browser' | 'mcp' | 'info';
    description: string;
    status: 'pending' | 'executing' | 'completed' | 'failed' | 'approved' | 'rejected';
    result?: string;
    error?: string;
    data?: any;
}
export interface TaskContext {
    taskDescription: string;
    projectContext: ProjectContext;
    currentFile?: string;
    workspaceRoot: string;
    options: TaskOptions;
}
export interface TaskOptions {
    autoExecute?: boolean;
    requireApproval?: boolean;
    promptOptions?: PromptOptions;
    /**
     * Plan mode: Only plan tasks without executing
     * Act mode: Plan and execute tasks automatically
     */
    mode?: 'plan' | 'act';
}
export declare class TaskEngine {
    private projectAnalyzer;
    private promptEngine;
    private enhancedPromptEngine;
    private modelAdapter;
    private fileManager;
    private terminalExecutor;
    private browserAutomator;
    private currentTask?;
    private steps;
    private isExecuting;
    private pendingDiffs;
    private approvalWorkflow;
    private currentMode;
    private onModeChange?;
    constructor(projectAnalyzer: EnhancedProjectAnalyzer, promptEngine: PromptEngine, modelAdapter: ModelAdapter, fileManager: FileManager, terminalExecutor: TerminalExecutor, browserAutomator?: BrowserAutomator);
    /**
     * 分析项目上下文（使用增强分析如果可用）
     */
    private analyzeProjectWithContext;
    /**
     * 开始处理一个新任务
     */
    startTask(taskDescription: string, options?: TaskOptions): Promise<TaskResult>;
    /**
     * 执行所有待处理的步骤
     */
    executeSteps(): Promise<string>;
    /**
     * 获取当前任务状态
     */
    getTaskStatus(): {
        isExecuting: boolean;
        steps: TaskStep[];
        currentTask?: TaskContext;
    };
    /**
     * 批准或拒绝一个步骤
     */
    approveStep(stepIndex: number, approve: boolean): boolean;
    /**
     * 批准或拒绝待处理的文件差异
     */
    approveDiff(diffId: string, action: 'approve' | 'reject'): Promise<{
        success: boolean;
        message: string;
        error?: string;
    }>;
    /**
     * 获取所有待处理的差异
     */
    getPendingDiffs(): Array<{
        diffId: string;
        diff: FileDiff;
    }>;
    /**
     * 重置任务引擎
     */
    reset(): void;
    /**
     * 获取当前模式
     */
    getMode(): 'plan' | 'act';
    /**
     * 设置当前模式
     */
    setMode(mode: 'plan' | 'act'): void;
    /**
     * 设置模式变更回调
     */
    setOnModeChange(callback: (mode: 'plan' | 'act') => void): void;
    /**
     * 切换模式
     */
    toggleMode(): 'plan' | 'act';
    /**
     * 处理特殊命令（以@开头的命令）
     */
    private handleSpecialCommand;
    private handleTerminalCommand;
    private handleUrlCommand;
    private handleProblemsCommand;
    private handleSnapshotCommand;
    private handleHelpCommand;
    private handleModelCommand;
    private addStep;
    private updateStepStatus;
    private callAI;
    private parseAIResponse;
    /**
     * 清理代码内容，移除Markdown代码块标记和额外格式
     * AI响应经常包含 ```c、```python 等标记，这些在源代码文件中是无效的
     */
    private cleanCodeContent;
    private executeFileStep;
    private executeTerminalStep;
    private executeBrowserStep;
    private notifyUI;
    /**
     * 提议一个操作到批准工作流
     */
    proposeOperationApproval(type: ApprovalType, description: string, data: any, options?: {
        autoExecute?: boolean;
        taskId?: string;
        tags?: string[];
    }): string;
    /**
     * 获取所有待批准的项
     */
    getPendingApprovals(): ApprovalItem[];
    /**
     * 获取批准历史
     */
    getApprovalHistory(limit?: number): ApprovalItem[];
    /**
     * 批准一个操作
     */
    approveOperation(itemId: string, reason?: string): Promise<ApprovalResult>;
    /**
     * 拒绝一个操作
     */
    rejectOperation(itemId: string, reason?: string): Promise<ApprovalResult>;
    /**
     * 批量批准操作
     */
    approveOperations(itemIds: string[], reason?: string): Promise<ApprovalResult[]>;
    /**
     * 批量拒绝操作
     */
    rejectOperations(itemIds: string[], reason?: string): Promise<ApprovalResult[]>;
    /**
     * 获取批准工作流实例（用于UI集成）
     */
    getApprovalWorkflow(): ApprovalWorkflow;
    /**
     * 生成待批准项的HTML摘要
     */
    generateApprovalsHtml(): string;
}
//# sourceMappingURL=taskEngine.d.ts.map