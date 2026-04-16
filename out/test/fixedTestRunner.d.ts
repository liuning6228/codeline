/**
 * 修复的测试运行器
 * 使用子进程运行Mocha，避免全局变量和模块注入问题
 */
/**
 * 修复的测试运行器
 */
export declare class FixedTestRunner {
    private testDir;
    constructor(testDir?: string);
    /**
     * 运行所有测试
     */
    runAllTests(): Promise<TestRunResult>;
    /**
     * 运行单个测试文件
     */
    private runTestFile;
    /**
     * 查找测试文件
     */
    private findTestFiles;
    /**
     * 输出测试总结
     */
    private printSummary;
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
export {};
//# sourceMappingURL=fixedTestRunner.d.ts.map