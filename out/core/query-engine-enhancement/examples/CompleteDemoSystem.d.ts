/**
 * CompleteDemoSystem - 完整演示系统
 *
 * 展示QueryEngine增强项目的所有功能：
 * 1. 智能代码补全
 * 2. 代码生成和编辑
 * 3. 调试和分析
 * 4. 测试运行
 * 5. 代码重构
 * 6. 协作功能
 * 7. 性能监控
 * 8. 项目向导
 */
/**
 * 完整演示结果
 */
export interface CompleteDemoResult {
    /** 演示模块 */
    module: string;
    /** 是否成功 */
    success: boolean;
    /** 开始时间 */
    startTime: Date;
    /** 结束时间 */
    endTime: Date;
    /** 持续时间（毫秒） */
    duration: number;
    /** 详细结果 */
    details?: any;
    /** 错误信息 */
    error?: string;
}
/**
 * 演示系统配置
 */
export interface DemoSystemConfig {
    /** 工作空间根目录 */
    workspaceRoot: string;
    /** 演示输出目录 */
    outputDir: string;
    /** 是否清理临时文件 */
    cleanupTempFiles: boolean;
    /** 性能监控配置 */
    performanceMonitoring: {
        enabled: boolean;
        interval: number;
    };
    /** 演示模块 */
    modules: Array<{
        /** 模块名称 */
        name: string;
        /** 模块描述 */
        description: string;
        /** 是否启用 */
        enabled: boolean;
        /** 模块权重 */
        weight: number;
    }>;
}
/**
 * 完整演示系统
 */
export declare class CompleteDemoSystem {
    private config;
    private workspaceRoot;
    private demoDir;
    private results;
    private performanceMonitor?;
    constructor(config?: Partial<DemoSystemConfig>);
    /**
     * 运行完整演示
     */
    runCompleteDemo(): Promise<CompleteDemoResult[]>;
    /**
     * 运行单个模块
     */
    private runModule;
    /**
     * 运行集成测试
     */
    private runIntegrationTests;
    /**
     * 运行工具集成演示
     */
    private runToolIntegrationDemo;
    /**
     * 运行智能代码补全演示
     */
    private runSmartCompletionDemo;
    /**
     * 运行代码重构演示
     */
    private runRefactoringDemo;
    /**
     * 运行协作功能演示
     */
    private runCollaborationDemo;
    /**
     * 运行性能监控演示
     */
    private runPerformanceDemo;
    /**
     * 运行项目向导演示
     */
    private runProjectWizardDemo;
    /**
     * 运行完整工作流演示
     */
    private runCompleteWorkflowDemo;
    /**
     * 生成总结报告
     */
    private generateSummaryReport;
    /**
     * 提取关键发现
     */
    private extractKeyFindings;
    /**
     * 生成建议
     */
    private generateRecommendations;
    /**
     * 生成文本报告
     */
    private generateTextReport;
    /**
     * 清理临时文件
     */
    private cleanupTempFiles;
}
/**
 * 运行完整演示系统
 */
export declare function runCompleteDemoSystem(workspaceRoot?: string, config?: Partial<DemoSystemConfig>): Promise<CompleteDemoResult[]>;
export default CompleteDemoSystem;
//# sourceMappingURL=CompleteDemoSystem.d.ts.map