/**
 * 增强任务引擎
 * 集成统一工具系统的 TaskEngine 扩展
 * 基于Claude Code CP-20260402-003插件化工具系统模式
 */
import * as vscode from 'vscode';
import { TaskEngine, TaskOptions } from '../task/taskEngine';
import { ToolRegistry } from './ToolRegistry';
import { EnhancedProjectAnalyzer } from '../analyzer/enhancedProjectAnalyzer';
import { PromptEngine } from '../prompt/promptEngine';
import { ModelAdapter } from '../models/modelAdapter';
import { FileManager } from '../file/fileManager';
import { TerminalExecutor } from '../terminal/terminalExecutor';
import { BrowserAutomator } from '../browser/browserAutomator';
/**
 * 增强任务引擎选项
 */
export interface EnhancedTaskEngineOptions {
    /** 是否启用工具系统 */
    enableToolSystem: boolean;
    /** 是否自动加载工具 */
    autoLoadTools: boolean;
    /** 是否显示工具加载进度 */
    showLoadingProgress: boolean;
    /** 工具配置覆盖 */
    toolConfigOverrides?: Record<string, any>;
    /** 工具执行失败时是否停止任务 */
    stopOnError?: boolean;
}
/**
 * 增强任务结果
 */
export interface EnhancedTaskResult {
    /** 任务是否成功 */
    success: boolean;
    /** 任务输出（字符串或对象） */
    output: string | any;
    /** 任务持续时间（毫秒） */
    duration?: number;
    /** 任务ID */
    taskId?: string;
    /** 错误信息 */
    error?: string;
    /** 工具执行详情 */
    toolDetails?: Array<{
        toolId: string;
        success: boolean;
        duration: number;
        output?: any;
        error?: string;
    }>;
    /** 工具执行统计 */
    toolStats?: {
        totalTools: number;
        successfulTools: number;
        failedTools: number;
        totalDuration: number;
    };
}
/**
 * 增强任务引擎
 */
export declare class EnhancedTaskEngine extends TaskEngine {
    private toolRegistry;
    private toolLoader;
    private isToolSystemReady;
    private toolContext;
    private workspaceRoot;
    private vscodeContext;
    constructor(arg1: EnhancedProjectAnalyzer | string, arg2: PromptEngine | vscode.ExtensionContext, arg3?: ModelAdapter | EnhancedTaskEngineOptions, arg4?: FileManager, arg5?: TerminalExecutor, arg6?: BrowserAutomator, arg7?: string, arg8?: vscode.ExtensionContext, arg9?: EnhancedTaskEngineOptions);
    /**
     * 初始化工具系统
     */
    private initializeToolSystem;
    /**
     * 加载工具
     */
    loadTools(): Promise<boolean>;
    /**
     * 增强的任务执行方法（AsyncGenerator版本）
     */
    executeTask(taskDescription: string, options?: TaskOptions & {
        stopOnError?: boolean;
    }): AsyncGenerator<any, EnhancedTaskResult, void>;
    /**
     * 使用工具注册表执行工具（带进度报告）
     */
    private executeToolWithRegistry;
    /**
     * 分析任务描述，提取工具调用
     */
    private analyzeTaskForToolCalls;
    /**
     * 传统任务执行方法（工具系统未就绪时使用）
     */
    private executeLegacyTask;
    /**
     * 获取工具注册表
     */
    getToolRegistry(): ToolRegistry | null;
    /**
     * 获取工具加载状态
     */
    getToolSystemStatus(): {
        isReady: boolean;
        toolCount: number;
        loadedTools: number;
    };
    /**
     * 获取可用工具列表
     */
    getAvailableTools(): Array<{
        id: string;
        name: string;
        description: string;
        category: string;
    }>;
    /**
     * 清理资源
     */
    dispose(): Promise<void>;
}
//# sourceMappingURL=EnhancedTaskEngine.d.ts.map