import * as vscode from 'vscode';
import { ModelAdapter } from './models/modelAdapter';
import { TaskResult } from './task/taskEngine';
import { TaskEventUnion } from './task/taskTypes';
import { CodeCompletionProvider } from './completion/codeCompletionProvider';
import { CodeLineSidebarProvider } from './sidebar/sidebarProvider';
import { ApprovalWorkflow } from './workflow/approvalWorkflow';
import { EditorCommands } from './commands/editorCommands';
import { PluginExtension } from './plugins/PluginExtension';
import EnhancedEngineAdapter from './core/EnhancedEngineAdapter';
export declare class CodeLineExtension {
    private static instance;
    private projectAnalyzer;
    private promptEngine;
    private modelAdapter;
    private fileManager?;
    private taskEngine?;
    private enhancedTaskEngine?;
    private terminalExecutor?;
    private browserAutomator?;
    private completionProvider?;
    private sidebarProvider?;
    private editorCommands?;
    private approvalWorkflow?;
    private pluginExtension?;
    private enhancedEngineAdapter?;
    private context;
    private constructor();
    static getInstance(context?: vscode.ExtensionContext): CodeLineExtension;
    /**
     * 初始化Cline风格的任务引擎（按需创建）
     */
    private ensureTaskEngineInitialized;
    /**
     * 初始化增强引擎适配器（按需创建）
     */
    private ensureEnhancedEngineAdapterInitialized;
    /**
     * 初始化代码补全提供者（按需创建）
     */
    private ensureCompletionProviderInitialized;
    /**
     * 获取代码补全提供者
     */
    getCompletionProvider(): CodeCompletionProvider;
    /**
     * 初始化插件系统（按需创建）
     */
    private ensurePluginSystemInitialized;
    /**
     * 获取插件扩展（按需初始化）
     */
    getPluginExtension(): Promise<PluginExtension>;
    /**
     * 获取插件系统状态
     */
    getPluginSystemStatus(): Promise<any>;
    /**
     * 启用/禁用代码补全功能
     */
    setCompletionEnabled(enabled: boolean): void;
    /**
     * 获取侧边栏提供者（按需创建）
     */
    getSidebarProvider(): CodeLineSidebarProvider;
    /**
     * 获取增强引擎适配器（按需初始化）
     */
    getEnhancedEngineAdapter(): Promise<EnhancedEngineAdapter>;
    /**
     * 获取增强引擎状态
     */
    getEnhancedEngineStatus(): Promise<any>;
    /**
     * 异步初始化SidebarProvider的TaskEngine和EnhancedEngineAdapter
     */
    initializeSidebarProviderTaskEngine(): Promise<void>;
    /**
     * 获取编辑器命令实例（按需创建）
     */
    getEditorCommands(): EditorCommands;
    /**
     * 显示侧边栏并切换到指定视图
     */
    showSidebar(view?: 'chat' | 'tasks' | 'settings' | 'history'): void;
    /**
     * 切换到聊天视图（Cline风格）
     */
    switchToChatView(): void;
    /**
     * 获取批准工作流实例
     */
    getApprovalWorkflow(): ApprovalWorkflow;
    startChat(): Promise<void>;
    executeTask(taskDescription: string): Promise<TaskResult | undefined>;
    /**
     * 流式任务执行 - 支持实时事件反馈
     * 基于EnhancedTaskEngine的异步生成器API
     */
    executeTaskWithStream(taskDescription: string, options?: {
        onEvent?: (event: TaskEventUnion) => void;
        onProgress?: (progress: number, message: string) => void;
        enableEventStream?: boolean;
    }): Promise<import("./task/taskTypes").StreamTaskResult | undefined>;
    /**
     * 执行文件管理命令
     */
    executeFileCommand(command: string, data?: any): Promise<any>;
    analyzeProject(): Promise<any>;
    /**
     * 显示增强的项目分析报告
     */
    showEnhancedAnalysis(): Promise<void>;
    /**
     * 显示详细的项目分析报告
     */
    private showProjectAnalysis;
    /**
     * 在输出面板显示任务结果
     */
    private showTaskResults;
    getModelAdapter(): ModelAdapter;
    getModelInfo(): string;
    getConfig(): import("./models/types").ModelConfig;
    updateConfig(newConfig: any): void;
    /**
     * 批准或拒绝文件差异（从UI调用）
     */
    approveFileDiff(diffId: string, action: 'approve' | 'reject'): Promise<{
        success: boolean;
        message: string;
        error?: string;
    }>;
    /**
     * 获取当前模式
     */
    getMode(): Promise<'plan' | 'act'>;
    /**
     * 设置模式
     */
    setMode(mode: 'plan' | 'act'): Promise<void>;
    /**
     * 切换模式
     */
    toggleMode(): Promise<'plan' | 'act'>;
}
export declare function activate(context: vscode.ExtensionContext): void;
export declare function deactivate(): void;
//# sourceMappingURL=extension.d.ts.map