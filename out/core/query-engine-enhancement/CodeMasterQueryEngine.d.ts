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
import { EnhancedQueryEngine, EnhancedQueryEngineConfig, SubmitOptions, SubmitResult, EngineProgress } from '../EnhancedQueryEngine';
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
    enableCodeContextEnhancer: boolean;
    enableIntelligentToolParsing: boolean;
    enableEnhancedThinking: boolean;
    enableStateMemory: boolean;
    maxFileSizeForAnalysis: number;
    maxProjectDepth: number;
    languageSupport: string[];
    codingToolCategories: string[];
    cacheEnabled: boolean;
    cacheTTL: number;
    verboseLogging?: boolean;
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
/**
 * CodeMasterQueryEngine
 * 为编码任务专门增强的查询引擎
 */
export declare class CodeMasterQueryEngine extends EnhancedQueryEngine {
    private codeEnhancer;
    private codeConfig;
    private codingTools;
    private stateMemory;
    private isCodeContextEnabled;
    private thinkingSteps;
    private currentThinkingStream?;
    constructor(config: CodeMasterQueryEngineConfig);
    /**
     * 重写：提交消息并处理编码特定逻辑
     */
    submitMessage(content: string, options?: SubmitOptions): AsyncGenerator<EngineProgress, SubmitResult>;
    /**
     * 分析用户意图（编码特定）
     */
    private analyzeUserIntent;
    /**
     * 增强型思考响应
     */
    private enhancedThinkAboutResponse;
    /**
     * 智能工具解析
     */
    private intelligentToolParsing;
    /**
     * 生成增强响应
     */
    private generateEnhancedResponse;
    /**
     * 初始化编码专用工具
     */
    private initializeCodingTools;
    /**
     * 初始化状态记忆
     */
    private initializeStateMemory;
    /**
     * 更新状态记忆
     */
    private updateStateMemory;
    /**
     * 从工具需求创建工具调用
     */
    private createToolCallFromRequirement;
    /**
     * 提取操作
     */
    private extractOperation;
    /**
     * 提取约束
     */
    private extractConstraints;
    /**
     * 确定优先级
     */
    private determinePriority;
    /**
     * 识别所需工具
     */
    private identifyRequiredTools;
    /**
     * 生成建议方法
     */
    private generateSuggestedApproach;
    /**
     * 获取工具用途
     */
    private getToolPurpose;
    /**
     * 解析思考步骤
     */
    private parseThinkingSteps;
    /**
     * 检查工具是否可用
     */
    private isToolAvailable;
    /**
     * 解析代码生成工具
     */
    private parseCodeGenerationTools;
    /**
     * 解析代码编辑工具
     */
    private parseCodeEditingTools;
    /**
     * 解析调试工具
     */
    private parseDebuggingTools;
    /**
     * 解析测试工具
     */
    private parseTestingTools;
    /**
     * 解析重构工具
     */
    private parseRefactoringTools;
    /**
     * 解析优化工具
     */
    private parseOptimizationTools;
    /**
     * 提取工具参数
     */
    private extractToolParameters;
    /**
     * 解决工具依赖关系
     */
    private resolveToolDependencies;
    /**
     * 比较优先级
     */
    private isPriorityHigher;
    /**
     * 初始化引擎（用于延迟初始化）
     */
    initialize(): Promise<void>;
    /**
     * 清理引擎资源
     */
    dispose(): Promise<void>;
    /**
     * 生成唯一ID
     */
    protected generateId(): string;
}
export default CodeMasterQueryEngine;
//# sourceMappingURL=CodeMasterQueryEngine.d.ts.map