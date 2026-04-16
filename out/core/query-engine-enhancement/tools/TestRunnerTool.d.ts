/**
 * TestRunnerTool - 测试运行器工具
 *
 * 执行测试、分析结果、生成报告：
 * 1. 运行测试套件
 * 2. 分析测试结果
 * 3. 计算测试覆盖率
 * 4. 识别失败测试
 * 5. 生成测试报告
 * 6. 提供修复建议
 */
import { EnhancedBaseTool, type EnhancedToolContext } from '../../tool/EnhancedBaseTool';
import { ToolCategory, ToolCapabilities, PermissionLevel } from '../../tool/Tool';
/**
 * 测试框架类型
 */
export type TestFramework = 'jest' | 'mocha' | 'vitest' | 'pytest' | 'junit' | 'xunit' | 'rspec' | 'phpunit' | 'unittest' | 'custom';
/**
 * 测试结果状态
 */
export type TestStatus = 'passed' | 'failed' | 'skipped' | 'pending' | 'todo' | 'error';
/**
 * 测试运行器工具参数
 */
export interface TestRunnerParameters {
    /** 测试路径或模式 */
    testPath: string;
    /** 测试框架 */
    framework: TestFramework;
    /** 工作目录 */
    workingDirectory?: string;
    /** 测试命令（可选，如果提供则覆盖框架默认命令） */
    testCommand?: string;
    /** 是否计算覆盖率 */
    calculateCoverage?: boolean;
    /** 是否并行运行测试 */
    runInParallel?: boolean;
    /** 超时时间（毫秒） */
    timeout?: number;
    /** 测试过滤器 */
    filter?: string;
    /** 是否更新快照 */
    updateSnapshots?: boolean;
    /** 是否详细输出 */
    verbose?: boolean;
    /** 是否只运行失败测试 */
    onlyFailures?: boolean;
    /** 额外选项 */
    options?: {
        /** 环境变量 */
        env?: Record<string, string>;
        /** 测试报告格式 */
        reportFormat?: 'json' | 'xml' | 'html' | 'text';
        /** 测试报告输出路径 */
        reportOutput?: string;
        /** 是否监视模式 */
        watch?: boolean;
        /** 是否调试模式 */
        debug?: boolean;
        /** 最大工作线程数 */
        maxWorkers?: number;
    };
}
/**
 * 测试用例结果
 */
export interface TestCaseResult {
    /** 测试用例名称 */
    name: string;
    /** 测试文件路径 */
    filePath: string;
    /** 状态 */
    status: TestStatus;
    /** 运行时间（毫秒） */
    duration: number;
    /** 失败信息（如果失败） */
    failure?: {
        /** 失败消息 */
        message: string;
        /** 堆栈跟踪 */
        stackTrace?: string;
        /** 失败位置 */
        location?: {
            line: number;
            column: number;
        };
    };
    /** 跳过原因（如果跳过） */
    skipReason?: string;
    /** 断言数量 */
    assertions?: number;
}
/**
 * 测试套件结果
 */
export interface TestSuiteResult {
    /** 套件名称 */
    name: string;
    /** 文件路径 */
    filePath: string;
    /** 测试用例结果 */
    testCases: TestCaseResult[];
    /** 统计信息 */
    stats: {
        /** 总测试数 */
        total: number;
        /** 通过数 */
        passed: number;
        /** 失败数 */
        failed: number;
        /** 跳过数 */
        skipped: number;
        /** 错误数 */
        errors: number;
        /** 通过率 */
        passRate: number;
        /** 总运行时间（毫秒） */
        totalDuration: number;
    };
}
/**
 * 测试覆盖率结果
 */
export interface CoverageResult {
    /** 是否可用 */
    available: boolean;
    /** 覆盖率统计 */
    summary?: {
        /** 行覆盖率 */
        lines: {
            total: number;
            covered: number;
            percentage: number;
        };
        /** 语句覆盖率 */
        statements: {
            total: number;
            covered: number;
            percentage: number;
        };
        /** 函数覆盖率 */
        functions: {
            total: number;
            covered: number;
            percentage: number;
        };
        /** 分支覆盖率 */
        branches: {
            total: number;
            covered: number;
            percentage: number;
        };
    };
    /** 按文件的覆盖率详情 */
    files?: Array<{
        filePath: string;
        lines: {
            covered: number;
            total: number;
            percentage: number;
        };
        uncoveredLines?: number[];
    }>;
}
/**
 * 测试运行器工具结果
 */
export interface TestRunnerResult {
    /** 运行是否成功 */
    success: boolean;
    /** 测试框架 */
    framework: TestFramework;
    /** 测试路径 */
    testPath: string;
    /** 工作目录 */
    workingDirectory: string;
    /** 测试套件结果 */
    testSuites: TestSuiteResult[];
    /** 覆盖率结果 */
    coverage?: CoverageResult;
    /** 总体统计 */
    overallStats: {
        /** 总测试数 */
        totalTests: number;
        /** 通过测试数 */
        passedTests: number;
        /** 失败测试数 */
        failedTests: number;
        /** 跳过测试数 */
        skippedTests: number;
        /** 总体通过率 */
        overallPassRate: number;
        /** 总运行时间（毫秒） */
        totalTime: number;
        /** 平均测试时间（毫秒） */
        averageTime: number;
    };
    /** 失败分析 */
    failureAnalysis?: {
        /** 失败测试列表 */
        failedTests: Array<{
            name: string;
            filePath: string;
            message: string;
            suggestedFix?: string;
        }>;
        /** 常见失败模式 */
        commonPatterns: string[];
        /** 修复建议 */
        fixSuggestions: string[];
    };
    /** 性能分析 */
    performanceAnalysis?: {
        /** 最慢的测试 */
        slowestTests: Array<{
            name: string;
            duration: number;
        }>;
        /** 测试时间分布 */
        timeDistribution: {
            fast: number;
            medium: number;
            slow: number;
        };
        /** 性能建议 */
        suggestions: string[];
    };
    /** 测试报告路径 */
    reportPath?: string;
    /** 统计信息 */
    statistics: {
        /** 运行时间（毫秒） */
        runTime: number;
        /** 内存使用（MB） */
        memoryUsage?: number;
        /** 命令执行时间（毫秒） */
        commandExecutionTime: number;
        /** 输出大小（字节） */
        outputSize: number;
    };
    /** 错误信息（如果失败） */
    error?: string;
    /** 原始输出 */
    rawOutput?: string;
}
/**
 * 测试运行器工具
 */
export declare class TestRunnerTool extends EnhancedBaseTool<TestRunnerParameters, TestRunnerResult> {
    /**
     * 工具ID
     */
    static readonly TOOL_ID = "test_runner";
    /**
     * 工具名称
     */
    static readonly TOOL_NAME = "Test Runner";
    /**
     * 工具描述
     */
    static readonly TOOL_DESCRIPTION = "Runs tests, analyzes results, calculates coverage and provides insights";
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
    static readonly PERMISSION_LEVEL = PermissionLevel.EXECUTE;
    readonly id = "test_runner";
    readonly name = "Test Runner";
    readonly description = "Runs tests, analyzes results, calculates coverage and provides insights";
    readonly version = "1.0.0";
    readonly author = "CodeLine Team";
    readonly category: ToolCategory;
    protected logInfo(message: string): void;
    protected logWarn(message: string): void;
    protected logError(message: string): void;
    /**
     * 执行工具核心逻辑
     */
    protected executeCore(input: TestRunnerParameters, context: EnhancedToolContext): Promise<TestRunnerResult>;
    private frameworkConfigs;
    /**
     * 创建参数模式
     */
    protected createParameterSchema(): any;
    /**
     * 执行工具
     */
    protected executeImplementation(params: TestRunnerParameters, context: any): Promise<TestRunnerResult>;
    /**
     * 确定工作目录
     */
    private determineWorkingDirectory;
    /**
     * 构建测试命令
     */
    private buildTestCommand;
    /**
     * 执行测试命令
     */
    private executeTestCommand;
    /**
     * 解析测试结果
     */
    private parseTestResults;
    /**
     * 解析框架特定的JSON结果
     */
    private parseFrameworkSpecificResults;
    /**
     * 解析Jest结果
     */
    private parseJestResults;
    /**
     * 映射Jest状态
     */
    private mapJestStatus;
    /**
     * 解析Mocha结果
     */
    private parseMochaResults;
    /**
     * 解析Vitest结果
     */
    private parseVitestResults;
    /**
     * 解析Pytest结果
     */
    private parsePytestResults;
    /**
     * 解析通用JSON结果
     */
    private parseGenericJsonResults;
    /**
     * 解析文本结果
     */
    private parseTextResults;
    /**
     * 创建默认测试套件
     */
    private createDefaultTestSuite;
    /**
     * 解析覆盖率结果
     */
    private parseCoverageResults;
    /**
     * 解析覆盖率数据
     */
    private parseCoverageData;
    /**
     * 计算总体统计
     */
    private calculateOverallStats;
    /**
     * 分析失败测试
     */
    private analyzeFailures;
    /**
     * 识别常见模式
     */
    private identifyCommonPatterns;
    /**
     * 生成修复建议
     */
    private generateFixSuggestions;
    /**
     * 分析性能
     */
    private analyzePerformance;
    /**
     * 生成报告
     */
    private generateReport;
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
export default TestRunnerTool;
//# sourceMappingURL=TestRunnerTool.d.ts.map