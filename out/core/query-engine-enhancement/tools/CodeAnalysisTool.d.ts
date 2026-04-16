/**
 * CodeAnalysisTool - 代码分析工具
 *
 * 分析代码质量、复杂度、依赖关系和潜在问题：
 * 1. 代码质量评估
 * 2. 复杂度计算（圈复杂度等）
 * 3. 依赖关系分析
 * 4. 代码规范检查
 * 5. 安全漏洞检测
 * 6. 性能问题识别
 */
import { EnhancedBaseTool, type EnhancedToolContext } from '../../tool/EnhancedBaseTool';
import { ToolCategory, ToolCapabilities, PermissionLevel } from '../../tool/Tool';
/**
 * 代码质量等级
 */
export type CodeQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
/**
 * 问题严重性
 */
export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
/**
 * 代码问题类型
 */
export type CodeIssueType = 'syntax' | 'style' | 'complexity' | 'performance' | 'security' | 'maintainability' | 'documentation' | 'dependency' | 'duplication' | 'bug_risk';
/**
 * 代码分析器工具参数
 */
export interface CodeAnalysisParameters {
    /** 要分析的代码路径 */
    codePath: string;
    /** 分析类型：file, directory, project */
    analysisType: 'file' | 'directory' | 'project';
    /** 编程语言（可选，自动检测） */
    language?: string;
    /** 要运行的分析器 */
    analyzers: Array<'quality' | 'complexity' | 'dependencies' | 'style' | 'security' | 'performance' | 'bug_risk' | 'all'>;
    /** 分析深度：shallow, normal, deep */
    analysisDepth: 'shallow' | 'normal' | 'deep';
    /** 是否包括建议修复 */
    includeFixes?: boolean;
    /** 是否计算指标 */
    calculateMetrics?: boolean;
    /** 是否生成报告 */
    generateReport?: boolean;
    /** 自定义规则 */
    customRules?: Array<{
        id: string;
        description: string;
        pattern: string;
        severity: IssueSeverity;
    }>;
    /** 排除模式 */
    excludePatterns?: string[];
}
/**
 * 代码指标
 */
export interface CodeMetrics {
    /** 基本统计 */
    basic: {
        linesOfCode: number;
        files: number;
        functions: number;
        classes: number;
        comments: number;
        commentRatio: number;
        blankLines: number;
    };
    /** 复杂度指标 */
    complexity: {
        cyclomatic: number;
        cognitive: number;
        halstead: {
            volume: number;
            difficulty: number;
            effort: number;
        };
        averageFunctionLength: number;
        maxFunctionLength: number;
    };
    /** 质量指标 */
    quality: {
        maintainabilityIndex: number;
        technicalDebt: number;
        codeSmells: number;
        duplication: {
            percentage: number;
            duplicatedLines: number;
            duplicatedBlocks: number;
        };
    };
    /** 依赖指标 */
    dependencies: {
        external: number;
        internal: number;
        circular: number;
        depth: number;
    };
}
/**
 * 代码问题
 */
export interface CodeIssue {
    /** 问题ID */
    id: string;
    /** 问题类型 */
    type: CodeIssueType;
    /** 严重性 */
    severity: IssueSeverity;
    /** 描述 */
    description: string;
    /** 位置 */
    location: {
        filePath: string;
        lineStart: number;
        lineEnd: number;
        columnStart?: number;
        columnEnd?: number;
    };
    /** 代码片段 */
    codeSnippet: string;
    /** 建议修复 */
    suggestedFix?: string;
    /** 规则ID */
    ruleId: string;
    /** 置信度（0-1） */
    confidence: number;
}
/**
 * 代码分析器工具结果
 */
export interface CodeAnalysisResult {
    /** 分析是否成功 */
    success: boolean;
    /** 分析的代码路径 */
    codePath: string;
    /** 分析类型 */
    analysisType: string;
    /** 代码质量等级 */
    quality: CodeQuality;
    /** 代码指标 */
    metrics: CodeMetrics;
    /** 发现的问题 */
    issues: CodeIssue[];
    /** 问题统计 */
    issueStats: {
        total: number;
        bySeverity: Record<IssueSeverity, number>;
        byType: Record<CodeIssueType, number>;
        criticalIssues: number;
    };
    /** 依赖分析 */
    dependencies?: {
        /** 外部依赖列表 */
        external: Array<{
            name: string;
            version?: string;
            type: 'production' | 'development';
        }>;
        /** 内部依赖图 */
        internal: Array<{
            from: string;
            to: string;
            type: 'import' | 'require' | 'extend' | 'implement';
        }>;
        /** 循环依赖 */
        circular: string[][];
    };
    /** 安全分析 */
    security?: {
        vulnerabilities: Array<{
            type: string;
            description: string;
            severity: IssueSeverity;
            location?: string;
            cve?: string;
        }>;
        recommendations: string[];
    };
    /** 性能分析 */
    performance?: {
        bottlenecks: Array<{
            type: 'cpu' | 'memory' | 'io' | 'network';
            description: string;
            location: string;
            impact: 'low' | 'medium' | 'high';
        }>;
        suggestions: string[];
    };
    /** 修复建议摘要 */
    fixSummary?: {
        quickWins: string[];
        mediumTerm: string[];
        longTerm: string[];
        estimatedEffort: {
            quick: number;
            medium: number;
            long: number;
        };
    };
    /** 报告路径（如果生成报告） */
    reportPath?: string;
    /** 统计信息 */
    statistics: {
        /** 分析时间（毫秒） */
        analysisTime: number;
        /** 分析的文件数 */
        filesAnalyzed: number;
        /** 内存使用（MB） */
        memoryUsage?: number;
        /** 规则检查数 */
        rulesChecked: number;
    };
    /** 错误信息（如果失败） */
    error?: string;
}
/**
 * 代码分析器工具
 */
export declare class CodeAnalysisTool extends EnhancedBaseTool<CodeAnalysisParameters, CodeAnalysisResult> {
    /**
     * 工具ID
     */
    static readonly TOOL_ID = "code_analyzer";
    /**
     * 工具名称
     */
    static readonly TOOL_NAME = "Code Analyzer";
    /**
     * 工具描述
     */
    static readonly TOOL_DESCRIPTION = "Analyzes code quality, complexity, dependencies and identifies potential issues";
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
    readonly id = "code_analyzer";
    readonly name = "Code Analyzer";
    readonly description = "Analyzes code quality, complexity, dependencies and identifies potential issues";
    readonly version = "1.0.0";
    readonly author = "CodeLine Team";
    readonly category: ToolCategory;
    protected logInfo(message: string): void;
    protected logWarn(message: string): void;
    protected logError(message: string): void;
    /**
     * 执行工具核心逻辑
     */
    protected executeCore(input: CodeAnalysisParameters, context: EnhancedToolContext): Promise<CodeAnalysisResult>;
    private codeRules;
    /**
     * 创建参数模式
     */
    protected createParameterSchema(): any;
    /**
     * 执行工具
     */
    protected executeImplementation(params: CodeAnalysisParameters, context: any): Promise<CodeAnalysisResult>;
    /**
     * 验证路径
     */
    private validatePath;
    /**
     * 收集文件
     */
    private collectFiles;
    /**
     * 递归收集文件
     */
    private collectFilesRecursive;
    /**
     * 判断是否应该遍历目录
     */
    private shouldTraverseDirectory;
    /**
     * 判断是否为源代码文件
     */
    private isSourceFile;
    /**
     * 过滤排除的文件
     */
    private filterExcludedFiles;
    /**
     * 分析文件
     */
    private analyzeFiles;
    /**
     * 计算指标
     */
    private calculateMetrics;
    /**
     * 创建默认指标
     */
    private createDefaultMetrics;
    /**
     * 估算圈复杂度
     */
    private estimateCyclomaticComplexity;
    /**
     * 估算Halstead体积
     */
    private estimateHalsteadVolume;
    /**
     * 计算可维护性指数
     */
    private calculateMaintainabilityIndex;
    /**
     * 估算技术债务
     */
    private estimateTechnicalDebt;
    /**
     * 计算代码异味数量
     */
    private countCodeSmells;
    /**
     * 估算重复代码
     */
    private estimateDuplication;
    /**
     * 计算外部依赖数量
     */
    private countExternalDependencies;
    /**
     * 计算内部依赖数量
     */
    private countInternalDependencies;
    /**
     * 检查问题
     */
    private checkForIssues;
    /**
     * 获取所有规则
     */
    private getAllRules;
    /**
     * 分析依赖关系
     */
    private analyzeDependencies;
    /**
     * 处理依赖
     */
    private processDependency;
    /**
     * 分析安全问题
     */
    private analyzeSecurity;
    /**
     * 分析性能问题
     */
    private analyzePerformance;
    /**
     * 生成修复建议摘要
     */
    private generateFixSummary;
    /**
     * 计算代码质量等级
     */
    private calculateQuality;
    /**
     * 计算问题统计
     */
    private calculateIssueStats;
    /**
     * 生成报告
     */
    private generateReport;
    /**
     * 生成建议
     */
    private generateRecommendations;
    /**
     * 计算统计信息
     */
    private calculateStatistics;
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
export default CodeAnalysisTool;
//# sourceMappingURL=CodeAnalysisTool.d.ts.map