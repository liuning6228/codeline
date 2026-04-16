/**
 * CodeLine测试运行器
 * 统一运行所有测试，处理vscode模块依赖
 */
/**
 * 测试运行配置
 */
interface TestRunnerConfig {
    testDir: string;
    verbose: boolean;
    testPattern: string;
    coverageDir: string;
}
/**
 * 测试运行结果
 */
interface TestRunResult {
    total: number;
    passed: number;
    failed: number;
    duration: number;
    failures: Array<{
        file: string;
        test: string;
        error: string;
    }>;
}
/**
 * 测试运行器
 */
export declare class TestRunner {
    private config;
    constructor(config?: Partial<TestRunnerConfig>);
    /**
     * 运行所有测试
     */
    runAllTests(): Promise<TestRunResult>;
    /**
     * 查找测试文件
     */
    private findTestFiles;
    /**
     * 输出测试总结
     */
    private printSummary;
    /**
     * 生成覆盖率报告
     */
    generateCoverageReport(): Promise<void>;
}
/**
 * 设置测试环境
 * 处理vscode模块依赖等问题
 */
export declare function setupTestEnvironment(): void;
/**
 * 主函数 - 命令行入口
 */
declare function main(): Promise<void>;
export { main as runTests };
//# sourceMappingURL=runAllTests.d.ts.map