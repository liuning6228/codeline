/**
 * RefactoringExample - 重构功能演示
 *
 * 演示如何使用CodeRefactoringEngine进行安全的重构操作
 */
/**
 * 重构演示结果
 */
export interface RefactoringDemoResult {
    /** 演示名称 */
    demoName: string;
    /** 是否成功 */
    success: boolean;
    /** 演示步骤 */
    steps: Array<{
        /** 步骤名称 */
        name: string;
        /** 描述 */
        description: string;
        /** 是否通过 */
        passed: boolean;
        /** 详细信息 */
        details?: any;
    }>;
    /** 重构结果 */
    refactoringResults?: Array<{
        /** 重构类型 */
        type: string;
        /** 文件路径 */
        filePath: string;
        /** 统计信息 */
        stats: {
            filesModified: number;
            linesModified: number;
            identifiersRenamed: number;
        };
        /** 性能指标 */
        performance: {
            totalTime: number;
            analysisTime: number;
        };
    }>;
    /** 性能报告 */
    performanceReport?: any;
    /** 建议 */
    suggestions: string[];
}
/**
 * 重构功能演示
 */
export declare class RefactoringExample {
    private workspaceRoot;
    private testFilesDir;
    constructor(workspaceRoot: string);
    /**
     * 运行所有演示
     */
    runAllDemos(): Promise<RefactoringDemoResult[]>;
    /**
     * 演示1: 设置和初始化
     */
    private demoSetup;
    /**
     * 演示2: 简单重命名
     */
    private demoSimpleRename;
    /**
     * 演示3: 提取方法
     */
    private demoExtractMethod;
    /**
     * 演示4: 内联变量
     */
    private demoInlineVariable;
    /**
     * 演示5: 安全验证
     */
    private demoSafetyValidation;
    /**
     * 演示6: 性能监控
     */
    private demoPerformanceMonitoring;
    /**
     * 演示7: 与现有工具集成
     */
    private demoIntegrationWithTools;
    /**
     * 创建测试文件
     */
    private createTestFiles;
    /**
     * 清理测试文件
     */
    private cleanup;
    /**
     * 生成总结报告
     */
    private generateSummaryReport;
    /**
     * 生成下一步建议
     */
    private generateNextSteps;
}
/**
 * 运行重构演示
 */
export declare function runRefactoringDemos(workspaceRoot?: string): Promise<void>;
export default RefactoringExample;
//# sourceMappingURL=RefactoringExample.d.ts.map