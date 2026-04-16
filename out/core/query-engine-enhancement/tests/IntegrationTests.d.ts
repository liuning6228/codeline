/**
 * IntegrationTests - 集成测试
 *
 * 测试编码工具集和智能代码补全器的集成
 */
/**
 * 集成测试结果
 */
export interface IntegrationTestResult {
    /** 测试名称 */
    name: string;
    /** 是否通过 */
    passed: boolean;
    /** 执行时间（毫秒） */
    duration: number;
    /** 错误信息 */
    error?: string;
    /** 详细信息 */
    details?: any;
}
/**
 * 集成测试套件
 */
export declare class IntegrationTests {
    private workspaceRoot;
    private testResults;
    constructor(workspaceRoot: string);
    /**
     * 运行所有集成测试
     */
    runAllTests(): Promise<IntegrationTestResult[]>;
    /**
     * 运行测试套件
     */
    private runTestSuite;
    /**
     * 测试工具注册
     */
    private testToolRegistration;
    /**
     * 测试智能代码补全
     */
    private testSmartCodeCompletion;
    /**
     * 测试代码生成工作流
     */
    private testCodeGenerationWorkflow;
    /**
     * 测试调试分析工作流
     */
    private testDebugAnalysisWorkflow;
    /**
     * 测试代码分析工作流
     */
    private testCodeAnalysisWorkflow;
    /**
     * 测试性能基准
     */
    private testPerformanceBenchmarks;
    /**
     * 生成测试报告
     */
    private generateTestReport;
    /**
     * 生成建议
     */
    private generateRecommendations;
}
/**
 * 运行集成测试
 */
export declare function runIntegrationTests(workspaceRoot?: string): Promise<IntegrationTestResult[]>;
export default IntegrationTests;
//# sourceMappingURL=IntegrationTests.d.ts.map