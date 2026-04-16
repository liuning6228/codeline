/**
 * CodeMasterIntegration - 编码大师集成模块
 *
 * 提供将CodeMasterQueryEngine集成到CodeLine扩展的便捷方法
 * 包含配置、初始化和使用示例
 */
import * as vscode from 'vscode';
import { CodeMasterQueryEngine, CodeMasterQueryEngineConfig } from './CodeMasterQueryEngine';
import { EnhancedToolRegistry } from '../tool/EnhancedToolRegistry';
import { ModelAdapter } from '../../models/modelAdapter';
/**
 * CodeMaster集成配置
 */
export interface CodeMasterIntegrationConfig {
    workspaceRoot: string;
    extensionContext: vscode.ExtensionContext;
    modelAdapter: ModelAdapter;
    toolRegistry: EnhancedToolRegistry;
    enableCodeContext: boolean;
    enableIntelligentTools: boolean;
    enableEnhancedThinking: boolean;
    enableStateMemory: boolean;
    cacheEnabled: boolean;
    maxFileSizeMB: number;
    verboseLogging: boolean;
    logLevel: 'info' | 'debug' | 'warn' | 'error';
}
/**
 * CodeMaster集成结果
 */
export interface CodeMasterIntegrationResult {
    engine: CodeMasterQueryEngine;
    config: CodeMasterQueryEngineConfig;
    isInitialized: boolean;
    status: 'ready' | 'initializing' | 'error';
    error?: string;
}
/**
 * CodeMaster集成管理器
 */
export declare class CodeMasterIntegration {
    private config;
    private engine;
    private outputChannel;
    constructor(config: CodeMasterIntegrationConfig);
    /**
     * 初始化CodeMaster查询引擎
     */
    initialize(): Promise<CodeMasterIntegrationResult>;
    /**
     * 获取CodeMaster查询引擎
     */
    getEngine(): CodeMasterQueryEngine;
    /**
     * 处理编码请求（高级API）
     */
    processCodingRequest(userInput: string, options?: {
        skipTools?: boolean;
        skipThinking?: boolean;
        maxThinkingTokens?: number;
        contextFiles?: string[];
    }): Promise<{
        success: boolean;
        response?: string;
        toolCalls?: any[];
        thinking?: string;
        intent?: any;
        error?: string;
        duration?: number;
    }>;
    /**
     * 执行编码任务（简化API）
     */
    executeCodingTask(task: string): Promise<string>;
    /**
     * 获取引擎状态
     */
    getEngineStatus(): {
        isInitialized: boolean;
        modelName: string;
        toolCount: number;
        capabilities: string[];
        memoryStats: any;
    };
    /**
     * 显示编码助手面板
     */
    showCodeAssistantPanel(): Promise<void>;
    /**
     * 分析当前文件
     */
    analyzeCurrentFile(): Promise<any>;
    /**
     * 清理资源
     */
    dispose(): Promise<void>;
    /**
     * 创建引擎配置
     */
    private createEngineConfig;
    /**
     * 验证工具注册表
     */
    private validateToolRegistry;
    /**
     * 获取内存统计
     */
    private getMemoryStats;
    /**
     * 获取Webview内容
     */
    private getWebviewContent;
}
/**
 * 创建默认的CodeMaster集成配置
 */
export declare function createDefaultCodeMasterIntegration(extensionContext: vscode.ExtensionContext, modelAdapter: ModelAdapter, toolRegistry: EnhancedToolRegistry): CodeMasterIntegrationConfig;
/**
 * 在CodeLine扩展中集成CodeMaster
 */
export declare function integrateCodeMasterIntoCodeLine(extensionContext: vscode.ExtensionContext, existingEngine: any, // 现有的QueryEngine
modelAdapter: ModelAdapter, toolRegistry: EnhancedToolRegistry): Promise<{
    integration: CodeMasterIntegration;
    result: CodeMasterIntegrationResult;
    originalEngine: any;
}>;
export default CodeMasterIntegration;
//# sourceMappingURL=CodeMasterIntegration.d.ts.map