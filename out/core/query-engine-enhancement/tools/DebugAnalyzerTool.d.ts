/**
 * DebugAnalyzerTool - 调试分析器工具
 *
 * 分析代码错误、堆栈跟踪、诊断问题并提供修复建议：
 * 1. 错误消息解析和分类
 * 2. 堆栈跟踪分析和定位
 * 3. 问题根源诊断
 * 4. 修复建议生成
 * 5. 代码修复验证
 */
import { EnhancedBaseTool, type EnhancedToolContext } from '../../tool/EnhancedBaseTool';
import { ToolCategory, ToolCapabilities, PermissionLevel } from '../../tool/Tool';
/**
 * 错误类型分类
 */
export type ErrorType = 'syntax_error' | 'type_error' | 'reference_error' | 'range_error' | 'uri_error' | 'eval_error' | 'assertion_error' | 'network_error' | 'file_system_error' | 'permission_error' | 'resource_error' | 'logic_error' | 'runtime_error' | 'unknown_error';
/**
 * 错误严重级别
 */
export type ErrorSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
/**
 * 堆栈帧
 */
export interface StackFrame {
    /** 函数名 */
    functionName: string;
    /** 文件路径 */
    filePath: string;
    /** 行号 */
    lineNumber: number;
    /** 列号 */
    columnNumber?: number;
    /** 源代码片段 */
    sourceCode?: string;
    /** 是否为内部代码 */
    isInternal?: boolean;
    /** 是否为第三方库 */
    isThirdParty?: boolean;
}
/**
 * 调试分析器工具参数
 */
export interface DebugAnalyzerParameters {
    /** 错误消息或堆栈跟踪 */
    errorInput: string;
    /** 目标文件路径（可选，用于上下文分析） */
    targetFilePath?: string;
    /** 错误类型（如果已知） */
    errorType?: ErrorType;
    /** 编程语言 */
    language?: string;
    /** 是否分析堆栈跟踪 */
    analyzeStacktrace?: boolean;
    /** 是否提供修复建议 */
    provideFixes?: boolean;
    /** 是否验证修复 */
    validateFixes?: boolean;
    /** 分析深度：shallow, normal, deep */
    analysisDepth?: 'shallow' | 'normal' | 'deep';
    /** 额外上下文信息 */
    context?: {
        /** 发生错误时的操作 */
        operation?: string;
        /** 相关输入数据 */
        inputData?: any;
        /** 环境信息 */
        environment?: Record<string, string>;
        /** 相关文件列表 */
        relatedFiles?: string[];
    };
}
/**
 * 调试分析器工具结果
 */
export interface DebugAnalyzerResult {
    /** 分析是否成功 */
    success: boolean;
    /** 识别的错误类型 */
    errorType: ErrorType;
    /** 错误严重级别 */
    severity: ErrorSeverity;
    /** 错误摘要 */
    errorSummary: string;
    /** 根本原因分析 */
    rootCause: {
        /** 原因描述 */
        description: string;
        /** 可能的原因列表 */
        possibleCauses: string[];
        /** 最可能的原因 */
        mostLikelyCause: string;
        /** 原因置信度（0-1） */
        confidence: number;
    };
    /** 堆栈跟踪分析 */
    stacktraceAnalysis?: {
        /** 解析出的堆栈帧 */
        frames: StackFrame[];
        /** 错误位置 */
        errorLocation?: StackFrame;
        /** 调用链深度 */
        callDepth: number;
        /** 是否包含第三方代码 */
        hasThirdPartyCode: boolean;
        /** 是否包含异步调用 */
        hasAsyncCalls: boolean;
    };
    /** 修复建议 */
    fixes: {
        /** 快速修复 */
        quickFixes: Array<{
            /** 修复描述 */
            description: string;
            /** 修复代码 */
            code: string;
            /** 应用位置 */
            location?: {
                filePath: string;
                lineNumber: number;
            };
            /** 修复类型：syntax, logic, type, resource */
            type: string;
            /** 修复复杂度：simple, moderate, complex */
            complexity: 'simple' | 'moderate' | 'complex';
            /** 置信度（0-1） */
            confidence: number;
        }>;
        /** 预防措施 */
        preventiveMeasures: string[];
        /** 测试建议 */
        testingSuggestions: string[];
    };
    /** 验证结果 */
    validation?: {
        /** 修复是否已验证 */
        fixesValidated: boolean;
        /** 验证结果 */
        results: Array<{
            fixIndex: number;
            valid: boolean;
            reason?: string;
        }>;
    };
    /** 统计信息 */
    statistics: {
        /** 分析时间（毫秒） */
        analysisTime: number;
        /** 识别的模式数量 */
        patternsIdentified: number;
        /** 生成的修复数量 */
        fixesGenerated: number;
        /** 代码复杂度评估 */
        complexityScore: number;
    };
    /** 调试建议 */
    debugSuggestions: string[];
    /** 错误信息（如果失败） */
    error?: string;
}
/**
 * 调试分析器工具
 */
export declare class DebugAnalyzerTool extends EnhancedBaseTool<DebugAnalyzerParameters, DebugAnalyzerResult> {
    /**
     * 工具ID
     */
    static readonly TOOL_ID = "debug_analyzer";
    /**
     * 工具名称
     */
    static readonly TOOL_NAME = "Debug Analyzer";
    /**
     * 工具描述
     */
    static readonly TOOL_DESCRIPTION = "Analyzes code errors, stack traces, diagnoses issues and provides fix suggestions";
    /**
     * 工具类别
     */
    static readonly TOOL_CATEGORY: ToolCategory;
    /**
     * 工具能力
     */
    static readonly TOOL_CAPABILITIES: ToolCapabilities;
    /**
     * 权限级别
     */
    static readonly PERMISSION_LEVEL = PermissionLevel.READ;
    readonly id = "debug_analyzer";
    readonly name = "Debug Analyzer";
    readonly description = "Analyzes code errors, stack traces, diagnoses issues and provides fix suggestions";
    readonly version = "1.0.0";
    readonly author = "CodeLine Team";
    readonly category: ToolCategory;
    protected logInfo(message: string): void;
    protected logWarn(message: string): void;
    protected logError(message: string): void;
    /**
     * 执行工具核心逻辑
     */
    protected executeCore(input: DebugAnalyzerParameters, context: EnhancedToolContext): Promise<DebugAnalyzerResult>;
    private errorPatterns;
    /**
     * 创建参数模式
     */
    protected createParameterSchema(): any;
    /**
     * 执行工具
     */
    protected executeImplementation(params: DebugAnalyzerParameters, context: any): Promise<DebugAnalyzerResult>;
    /**
     * 分析错误
     */
    private analyzeError;
    /**
     * 确定错误严重级别
     */
    private determineSeverity;
    /**
     * 生成错误摘要
     */
    private generateErrorSummary;
    /**
     * 检查是否包含堆栈跟踪
     */
    private containsStacktrace;
    /**
     * 分析堆栈跟踪
     */
    private analyzeStacktrace;
    /**
     * 解析堆栈跟踪
     */
    private parseStacktrace;
    /**
     * 诊断根本原因
     */
    private diagnoseRootCause;
    /**
     * 生成修复建议
     */
    private generateFixes;
    /**
     * 生成语法错误修复
     */
    private generateSyntaxErrorFixes;
    /**
     * 生成类型错误修复
     */
    private generateTypeErrorFixes;
    /**
     * 生成引用错误修复
     */
    private generateReferenceErrorFixes;
    /**
     * 生成范围错误修复
     */
    private generateRangeErrorFixes;
    /**
     * 生成通用修复
     */
    private generateGenericFixes;
    /**
     * 验证修复
     */
    private validateFixes;
    /**
     * 计算统计信息
     */
    private calculateStatistics;
    /**
     * 计算复杂度分数
     */
    private calculateComplexityScore;
    /**
     * 生成调试建议
     */
    private generateDebugSuggestions;
    /**
     * 获取工具ID
     */
    getToolId(): string;
    /**
     * 获取工具名称
     */
    getToolName(): string;
    /**
     * 获取工具描述
     */
    getToolDescription(): string;
    /**
     * 获取工具类别
     */
    getToolCategory(): ToolCategory;
    /**
     * 获取工具能力
     */
    getToolCapabilities(): ToolCapabilities;
    /**
     * 获取权限级别
     */
    getPermissionLevel(): PermissionLevel;
}
export default DebugAnalyzerTool;
//# sourceMappingURL=DebugAnalyzerTool.d.ts.map