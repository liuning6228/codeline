/**
 * CodeRefactoringEngine - 代码重构引擎
 *
 * 提供安全的代码重构操作：
 * 1. 重命名标识符
 * 2. 提取方法
 * 3. 内联变量
 * 4. 重构预览和验证
 * 5. 影响分析和安全检查
 */
import { FileEditorTool, EditOperation, CodeLocation } from './tools/FileEditorTool';
import { CodeAnalysisTool } from './tools/CodeAnalysisTool';
import { PerformanceMonitor } from './PerformanceMonitor';
/**
 * 重构操作类型
 */
export type RefactoringType = 'rename_identifier' | 'extract_method' | 'inline_variable' | 'move_method' | 'extract_interface' | 'encapsulate_field';
/**
 * 重构范围
 */
export interface RefactoringScope {
    /** 文件路径 */
    filePath: string;
    /** 代码位置 */
    location: CodeLocation;
    /** 是否递归（对于重命名） */
    recursive?: boolean;
    /** 是否更新导入/导出 */
    updateImports?: boolean;
    /** 是否更新注释 */
    updateComments?: boolean;
}
/**
 * 重构参数
 */
export interface RefactoringParameters {
    /** 重构类型 */
    type: RefactoringType;
    /** 重构范围 */
    scope: RefactoringScope;
    /** 重构配置 */
    config: {
        /** 新名称（对于重命名） */
        newName?: string;
        /** 方法名（对于提取方法） */
        methodName?: string;
        /** 变量名（对于内联变量） */
        variableName?: string;
        /** 是否创建预览 */
        createPreview: boolean;
        /** 是否自动应用 */
        autoApply: boolean;
        /** 是否创建备份 */
        createBackup: boolean;
        /** 是否验证安全 */
        validateSafety: boolean;
    };
}
/**
 * 重构结果
 */
export interface RefactoringResult {
    /** 是否成功 */
    success: boolean;
    /** 重构类型 */
    type: RefactoringType;
    /** 应用的文件变更 */
    changes: Array<{
        filePath: string;
        operation: EditOperation;
        location?: CodeLocation;
        oldContent?: string;
        newContent?: string;
    }>;
    /** 预览信息（如果创建了预览） */
    preview?: {
        /** 预览文件路径 */
        previewFilePath?: string;
        /** 变更数量 */
        changeCount: number;
        /** 影响分析 */
        impactAnalysis: ImpactAnalysis;
    };
    /** 备份信息（如果创建了备份） */
    backup?: {
        /** 备份文件路径 */
        backupFilePath?: string;
        /** 备份时间 */
        timestamp: Date;
    };
    /** 安全验证结果 */
    safetyValidation?: SafetyValidation;
    /** 性能指标 */
    performance: {
        /** 总时间（毫秒） */
        totalTime: number;
        /** 分析时间（毫秒） */
        analysisTime: number;
        /** 重构时间（毫秒） */
        refactoringTime: number;
        /** 验证时间（毫秒） */
        validationTime: number;
    };
    /** 统计信息 */
    statistics: {
        /** 修改的文件数 */
        filesModified: number;
        /** 修改的行数 */
        linesModified: number;
        /** 标识符重命名数 */
        identifiersRenamed: number;
        /** 错误数 */
        errors: number;
    };
    /** 错误信息 */
    error?: string;
    /** 建议和警告 */
    suggestions: string[];
}
/**
 * 影响分析
 */
export interface ImpactAnalysis {
    /** 影响范围 */
    scope: {
        /** 直接影响的文件 */
        directlyAffected: string[];
        /** 间接影响的文件 */
        indirectlyAffected: string[];
        /** 不受影响的文件 */
        unaffected: string[];
    };
    /** 风险评估 */
    risks: Array<{
        /** 风险类型 */
        type: 'breaking_change' | 'performance' | 'readability' | 'maintainability';
        /** 风险描述 */
        description: string;
        /** 风险级别 */
        level: 'low' | 'medium' | 'high';
        /** 缓解措施 */
        mitigation?: string;
    }>;
    /** 测试影响 */
    testImpact: {
        /** 需要更新的测试 */
        testsToUpdate: string[];
        /** 可能失败的测试 */
        testsMayFail: string[];
        /** 建议的测试更新 */
        suggestedTestUpdates: string[];
    };
    /** 依赖影响 */
    dependencyImpact: {
        /** 内部依赖影响 */
        internal: Array<{
            from: string;
            to: string;
            type: string;
            impact: 'none' | 'minor' | 'major';
        }>;
        /** 外部依赖影响 */
        external: Array<{
            package: string;
            impact: 'none' | 'minor' | 'major';
            notes?: string;
        }>;
    };
}
/**
 * 安全验证
 */
export interface SafetyValidation {
    /** 是否安全 */
    safe: boolean;
    /** 验证检查 */
    checks: Array<{
        /** 检查类型 */
        type: 'syntax' | 'type' | 'reference' | 'test' | 'dependency';
        /** 检查描述 */
        description: string;
        /** 是否通过 */
        passed: boolean;
        /** 详细信息 */
        details?: string;
    }>;
    /** 验证问题 */
    issues: Array<{
        /** 问题类型 */
        type: 'error' | 'warning' | 'info';
        /** 问题描述 */
        description: string;
        /** 位置 */
        location?: {
            filePath: string;
            line: number;
            column?: number;
        };
        /** 建议修复 */
        suggestedFix?: string;
    }>;
    /** 总体评估 */
    assessment: {
        /** 重构风险 */
        risk: 'low' | 'medium' | 'high';
        /** 建议操作 */
        recommendation: 'proceed' | 'review' | 'abort';
        /** 理由 */
        rationale: string;
    };
}
/**
 * 代码重构引擎
 */
export declare class CodeRefactoringEngine {
    private fileEditor;
    private codeAnalyzer;
    private contextEnhancer;
    private performanceMonitor?;
    private workspaceRoot;
    constructor(workspaceRoot: string, fileEditor: FileEditorTool, codeAnalyzer: CodeAnalysisTool, performanceMonitor?: PerformanceMonitor);
    /**
     * 执行重构
     */
    executeRefactoring(params: RefactoringParameters): Promise<RefactoringResult>;
    /**
     * 重命名标识符
     */
    renameIdentifier(filePath: string, oldName: string, newName: string, options?: {
        recursive?: boolean;
        updateImports?: boolean;
        updateComments?: boolean;
        createPreview?: boolean;
        createBackup?: boolean;
    }): Promise<RefactoringResult>;
    /**
     * 提取方法
     */
    extractMethod(filePath: string, location: CodeLocation, methodName: string, options?: {
        createPreview?: boolean;
        createBackup?: boolean;
    }): Promise<RefactoringResult>;
    /**
     * 内联变量
     */
    inlineVariable(filePath: string, variableName: string, options?: {
        createPreview?: boolean;
        createBackup?: boolean;
    }): Promise<RefactoringResult>;
    /**
     * 预览重构
     */
    previewRefactoring(params: RefactoringParameters): Promise<{
        preview: RefactoringResult['preview'];
        impact: ImpactAnalysis;
        safety: SafetyValidation;
    }>;
    /**
     * 分析影响
     */
    private analyzeImpact;
    /**
     * 分析重命名影响
     */
    private analyzeRenameImpact;
    /**
     * 分析提取方法影响
     */
    private analyzeExtractMethodImpact;
    /**
     * 分析内联变量影响
     */
    private analyzeInlineVariableImpact;
    /**
     * 创建默认影响分析
     */
    private createDefaultImpactAnalysis;
    /**
     * 验证安全
     */
    private validateSafety;
    /**
     * 创建备份
     */
    private createBackup;
    /**
     * 执行重构
     */
    private performRefactoring;
    /**
     * 执行重命名重构
     */
    private performRenameRefactoring;
    /**
     * 执行提取方法重构
     */
    private performExtractMethodRefactoring;
    /**
     * 执行内联变量重构
     */
    private performInlineVariableRefactoring;
    /**
     * 模拟重构（用于预览）
     */
    private simulateRefactoring;
    /**
     * 创建预览
     */
    private createPreview;
    /**
     * 计算统计信息
     */
    private calculateStatistics;
    /**
     * 生成建议
     */
    private generateSuggestions;
    /**
     * 查找标识符位置
     */
    private findIdentifierLocation;
    /**
     * 查找变量位置
     */
    private findVariableLocation;
    /**
     * 查找标识符使用
     */
    private findIdentifierUses;
    /**
     * 检查文件是否导入另一个文件
     */
    private fileImports;
    /**
     * 检查标识符冲突
     */
    private hasIdentifierConflict;
    /**
     * 分析测试影响
     */
    private analyzeTestImpact;
    /**
     * 分析依赖影响
     */
    private analyzeDependencyImpact;
    /**
     * 提取标识符名称
     */
    private extractIdentifierName;
    /**
     * 计算行偏移
     */
    private getOffset;
}
/**
 * 创建代码重构引擎
 */
export declare function createCodeRefactoringEngine(workspaceRoot: string, fileEditor: FileEditorTool, codeAnalyzer: CodeAnalysisTool, performanceMonitor?: PerformanceMonitor): CodeRefactoringEngine;
export default CodeRefactoringEngine;
//# sourceMappingURL=CodeRefactoringEngine.d.ts.map