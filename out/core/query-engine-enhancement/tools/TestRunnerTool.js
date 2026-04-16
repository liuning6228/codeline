"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestRunnerTool = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const child_process = __importStar(require("child_process"));
const util_1 = require("util");
const EnhancedBaseTool_1 = require("../../tool/EnhancedBaseTool");
const ZodCompatibility_1 = require("../../tool/ZodCompatibility");
const Tool_1 = require("../../tool/Tool");
const exec = (0, util_1.promisify)(child_process.exec);
/**
 * 测试运行器工具
 */
class TestRunnerTool extends EnhancedBaseTool_1.EnhancedBaseTool {
    // ==================== 工具定义 ====================
    /**
     * 工具ID
     */
    static TOOL_ID = 'test_runner';
    /**
     * 工具名称
     */
    static TOOL_NAME = 'Test Runner';
    /**
     * 工具描述
     */
    static TOOL_DESCRIPTION = 'Runs tests, analyzes results, calculates coverage and provides insights';
    /**
     * 工具类别
     */
    static TOOL_CATEGORY = Tool_1.ToolCategory.DEVELOPMENT;
    /**
     * 工具能力
     */
    static TOOL_CAPABILITIES = {
        isConcurrencySafe: false,
        isReadOnly: false,
        isDestructive: false,
        requiresWorkspace: true,
        supportsStreaming: true,
        requiresFileAccess: true,
        canModifyFiles: false,
        canReadFiles: true,
        canExecuteCommands: true,
        canAccessNetwork: false,
        requiresModel: false,
    };
    /**
     * 权限级别
     */
    static PERMISSION_LEVEL = Tool_1.PermissionLevel.EXECUTE;
    // ==================== 抽象属性实现 ====================
    id = TestRunnerTool.TOOL_ID;
    name = TestRunnerTool.TOOL_NAME;
    description = TestRunnerTool.TOOL_DESCRIPTION;
    version = '1.0.0';
    author = 'CodeLine Team';
    category = TestRunnerTool.TOOL_CATEGORY;
    // 工具能力getter已经在EnhancedBaseTool中实现
    // inputSchema getter已经在EnhancedBaseTool中实现
    // ==================== 日志方法 ====================
    logInfo(message) {
        console.log(`[TestRunnerTool] INFO: ${message}`);
    }
    logWarn(message) {
        console.warn(`[TestRunnerTool] WARN: ${message}`);
    }
    logError(message) {
        console.error(`[TestRunnerTool] ERROR: ${message}`);
    }
    // ==================== 核心执行方法 ====================
    /**
     * 执行工具核心逻辑
     */
    async executeCore(input, context) {
        // 使用现有的executeImplementation方法，传递适配的上下文
        return await this.executeImplementation(input, context);
    }
    // ==================== 框架配置 ====================
    frameworkConfigs = {
        jest: {
            command: 'npx jest',
            coverageFlag: '--coverage',
            jsonFlag: '--json',
            filterFlag: '--testNamePattern',
            timeoutFlag: '--testTimeout',
            defaultArgs: ['--colors'],
        },
        mocha: {
            command: 'npx mocha',
            coverageFlag: '--reporter=json', // Mocha需要nyc进行覆盖率
            jsonFlag: '--reporter=json',
            filterFlag: '--grep',
            timeoutFlag: '--timeout',
            defaultArgs: ['--colors'],
        },
        vitest: {
            command: 'npx vitest run',
            coverageFlag: '--coverage',
            jsonFlag: '--reporter=json',
            filterFlag: '--run',
            timeoutFlag: '--testTimeout',
            defaultArgs: [],
        },
        pytest: {
            command: 'pytest',
            coverageFlag: '--cov',
            jsonFlag: '--json-report',
            filterFlag: '-k',
            timeoutFlag: '--timeout',
            defaultArgs: ['-v'],
        },
        junit: {
            command: './gradlew test',
            coverageFlag: '',
            jsonFlag: '',
            filterFlag: '--tests',
            timeoutFlag: '',
            defaultArgs: [],
        },
        xunit: {
            command: 'dotnet test',
            coverageFlag: '/p:CollectCoverage=true',
            jsonFlag: '',
            filterFlag: '--filter',
            timeoutFlag: '',
            defaultArgs: [],
        },
        rspec: {
            command: 'bundle exec rspec',
            coverageFlag: '',
            jsonFlag: '--format json',
            filterFlag: '--example',
            timeoutFlag: '',
            defaultArgs: [],
        },
        phpunit: {
            command: 'vendor/bin/phpunit',
            coverageFlag: '--coverage-text',
            jsonFlag: '--log-json',
            filterFlag: '--filter',
            timeoutFlag: '',
            defaultArgs: [],
        },
        unittest: {
            command: 'python -m unittest',
            coverageFlag: '',
            jsonFlag: '',
            filterFlag: '',
            timeoutFlag: '',
            defaultArgs: ['-v'],
        },
        custom: {
            command: '',
            coverageFlag: '',
            jsonFlag: '',
            filterFlag: '',
            timeoutFlag: '',
            defaultArgs: [],
        },
    };
    // ==================== 参数模式 ====================
    /**
     * 创建参数模式
     */
    createParameterSchema() {
        return ZodCompatibility_1.z.object({
            testPath: ZodCompatibility_1.z.string()
                .min(1, 'Test path is required')
                .describe('Test path or pattern'),
            framework: ZodCompatibility_1.z.enum([
                'jest', 'mocha', 'vitest', 'pytest', 'junit', 'xunit',
                'rspec', 'phpunit', 'unittest', 'custom'
            ])
                .default('jest')
                .describe('Test framework'),
            workingDirectory: ZodCompatibility_1.z.string()
                .optional()
                .describe('Working directory'),
            testCommand: ZodCompatibility_1.z.string()
                .optional()
                .describe('Test command (overrides framework default)'),
            calculateCoverage: ZodCompatibility_1.z.boolean()
                .default(false)
                .describe('Whether to calculate coverage'),
            runInParallel: ZodCompatibility_1.z.boolean()
                .default(true)
                .describe('Whether to run tests in parallel'),
            timeout: ZodCompatibility_1.z.number()
                .int()
                .min(1000)
                .max(300000)
                .default(30000)
                .describe('Timeout in milliseconds'),
            filter: ZodCompatibility_1.z.string()
                .optional()
                .describe('Test filter'),
            updateSnapshots: ZodCompatibility_1.z.boolean()
                .default(false)
                .describe('Whether to update snapshots'),
            verbose: ZodCompatibility_1.z.boolean()
                .default(false)
                .describe('Whether to output verbose logs'),
            onlyFailures: ZodCompatibility_1.z.boolean()
                .default(false)
                .describe('Whether to run only failed tests'),
            options: ZodCompatibility_1.z.object({
                env: ZodCompatibility_1.z.record(ZodCompatibility_1.z.string()).optional(),
                reportFormat: ZodCompatibility_1.z.enum(['json', 'xml', 'html', 'text']).optional(),
                reportOutput: ZodCompatibility_1.z.string().optional(),
                watch: ZodCompatibility_1.z.boolean().default(false),
                debug: ZodCompatibility_1.z.boolean().default(false),
                maxWorkers: ZodCompatibility_1.z.number().int().min(1).max(16).optional(),
            })
                .optional()
                .describe('Additional options'),
        });
    }
    // ==================== 工具执行 ====================
    /**
     * 执行工具
     */
    async executeImplementation(params, context) {
        const startTime = Date.now();
        let commandExecutionTime = 0;
        try {
            this.logInfo(`Starting test runner: ${params.framework} for ${params.testPath}`);
            // 1. 确定工作目录
            const workingDirectory = this.determineWorkingDirectory(params, context);
            // 2. 构建测试命令
            const testCommand = this.buildTestCommand(params, workingDirectory);
            this.logInfo(`Test command: ${testCommand}`);
            this.logInfo(`Working directory: ${workingDirectory}`);
            // 3. 执行测试命令
            const commandStartTime = Date.now();
            const { stdout, stderr } = await this.executeTestCommand(testCommand, params, workingDirectory);
            commandExecutionTime = Date.now() - commandStartTime;
            // 4. 解析测试结果
            const testSuites = await this.parseTestResults(stdout, stderr, params.framework);
            // 5. 解析覆盖率（如果需要）
            let coverage;
            if (params.calculateCoverage) {
                coverage = await this.parseCoverageResults(workingDirectory, params.framework);
            }
            // 6. 计算总体统计
            const overallStats = this.calculateOverallStats(testSuites);
            // 7. 分析失败测试
            let failureAnalysis;
            if (overallStats.failedTests > 0) {
                failureAnalysis = await this.analyzeFailures(testSuites, params, context);
            }
            // 8. 分析性能
            let performanceAnalysis;
            if (testSuites.length > 0) {
                performanceAnalysis = this.analyzePerformance(testSuites);
            }
            // 9. 生成测试报告
            let reportPath;
            if (params.options?.reportOutput) {
                reportPath = await this.generateReport(testSuites, coverage, params, workingDirectory);
            }
            // 10. 计算统计信息
            const statistics = this.calculateStatistics(startTime, commandExecutionTime, stdout, stderr);
            const result = {
                success: overallStats.failedTests === 0,
                framework: params.framework,
                testPath: params.testPath,
                workingDirectory,
                testSuites,
                coverage,
                overallStats,
                failureAnalysis,
                performanceAnalysis,
                reportPath,
                statistics,
                rawOutput: stdout + stderr,
            };
            this.logInfo(`Test run completed: ${overallStats.passedTests}/${overallStats.totalTests} tests passed`);
            this.logInfo(`Total time: ${overallStats.totalTime}ms, Command time: ${commandExecutionTime}ms`);
            return result;
        }
        catch (error) {
            this.logError(`Test runner failed: ${error.message}`);
            return {
                success: false,
                framework: params.framework,
                testPath: params.testPath,
                workingDirectory: params.workingDirectory || process.cwd(),
                testSuites: [],
                overallStats: {
                    totalTests: 0,
                    passedTests: 0,
                    failedTests: 1,
                    skippedTests: 0,
                    overallPassRate: 0,
                    totalTime: Date.now() - startTime,
                    averageTime: 0,
                },
                statistics: {
                    runTime: Date.now() - startTime,
                    commandExecutionTime,
                    outputSize: 0,
                },
                error: error.message,
            };
        }
    }
    // ==================== 私有方法 ====================
    /**
     * 确定工作目录
     */
    determineWorkingDirectory(params, context) {
        if (params.workingDirectory) {
            return params.workingDirectory;
        }
        if (context.workspaceRoot) {
            return context.workspaceRoot;
        }
        // 如果testPath是相对路径，尝试基于当前目录解析
        if (!path.isAbsolute(params.testPath)) {
            const absolutePath = path.resolve(process.cwd(), params.testPath);
            if (fs.existsSync(path.dirname(absolutePath))) {
                return path.dirname(absolutePath);
            }
        }
        return process.cwd();
    }
    /**
     * 构建测试命令
     */
    buildTestCommand(params, workingDirectory) {
        // 使用自定义命令或框架默认命令
        let command = params.testCommand;
        if (!command) {
            const frameworkConfig = this.frameworkConfigs[params.framework];
            command = frameworkConfig.command;
            // 添加默认参数
            if (frameworkConfig.defaultArgs.length > 0) {
                command += ' ' + frameworkConfig.defaultArgs.join(' ');
            }
        }
        // 添加测试路径
        command += ' ' + params.testPath;
        // 添加覆盖率标志
        if (params.calculateCoverage && this.frameworkConfigs[params.framework].coverageFlag) {
            const coverageFlag = this.frameworkConfigs[params.framework].coverageFlag;
            if (coverageFlag) {
                command += ' ' + coverageFlag;
            }
        }
        // 添加JSON输出标志（用于解析）
        const jsonFlag = this.frameworkConfigs[params.framework].jsonFlag;
        if (jsonFlag) {
            command += ' ' + jsonFlag;
        }
        // 添加过滤器
        if (params.filter && this.frameworkConfigs[params.framework].filterFlag) {
            const filterFlag = this.frameworkConfigs[params.framework].filterFlag;
            command += ` ${filterFlag}="${params.filter}"`;
        }
        // 添加超时
        if (params.timeout && this.frameworkConfigs[params.framework].timeoutFlag) {
            const timeoutFlag = this.frameworkConfigs[params.framework].timeoutFlag;
            command += ` ${timeoutFlag}=${params.timeout}`;
        }
        // 添加快照更新
        if (params.updateSnapshots && params.framework === 'jest') {
            command += ' --updateSnapshot';
        }
        // 添加详细输出
        if (params.verbose) {
            command += ' --verbose';
        }
        // 添加并行运行控制
        if (!params.runInParallel && params.framework === 'jest') {
            command += ' --runInBand';
        }
        // 添加最大工作线程数
        if (params.options?.maxWorkers && params.framework === 'jest') {
            command += ` --maxWorkers=${params.options.maxWorkers}`;
        }
        // 添加报告输出
        if (params.options?.reportOutput && params.options.reportFormat) {
            switch (params.framework) {
                case 'jest':
                    command += ` --outputFile=${params.options.reportOutput}`;
                    if (params.options.reportFormat === 'json') {
                        command += ' --json';
                    }
                    else if (params.options.reportFormat === 'html') {
                        command += ' --coverageReporters=html';
                    }
                    break;
                case 'pytest':
                    if (params.options.reportFormat === 'json') {
                        command += ` --json-report --json-report-file=${params.options.reportOutput}`;
                    }
                    break;
            }
        }
        return command.trim();
    }
    /**
     * 执行测试命令
     */
    async executeTestCommand(command, params, workingDirectory) {
        try {
            // 准备环境变量
            const env = {
                ...process.env,
                ...(params.options?.env || {}),
            };
            // 设置超时
            const timeout = params.timeout || 30000;
            this.logInfo(`Executing command: ${command}`);
            this.logInfo(`Timeout: ${timeout}ms, Directory: ${workingDirectory}`);
            const { stdout, stderr } = await exec(command, {
                cwd: workingDirectory,
                env,
                timeout,
                maxBuffer: 10 * 1024 * 1024, // 10MB
            });
            return { stdout, stderr };
        }
        catch (error) {
            // 即使测试失败，exec也可能抛出错误
            // 检查是否有输出
            if (error.stdout || error.stderr) {
                return {
                    stdout: error.stdout || '',
                    stderr: error.stderr || error.message,
                };
            }
            throw error;
        }
    }
    /**
     * 解析测试结果
     */
    async parseTestResults(stdout, stderr, framework) {
        const testSuites = [];
        try {
            // 尝试解析JSON输出
            if (stdout.includes('{') && stdout.includes('}')) {
                const jsonMatch = stdout.match(/\{.*\}/s);
                if (jsonMatch) {
                    try {
                        const jsonResult = JSON.parse(jsonMatch[0]);
                        return this.parseFrameworkSpecificResults(jsonResult, framework);
                    }
                    catch (error) {
                        const err = error;
                        this.logWarn(`Failed to parse JSON results: ${err.message}`);
                    }
                }
            }
            // 回退到文本解析
            return this.parseTextResults(stdout + stderr, framework);
        }
        catch (error) {
            this.logWarn(`Test result parsing failed: ${error.message}`);
            return this.createDefaultTestSuite(stdout, stderr);
        }
    }
    /**
     * 解析框架特定的JSON结果
     */
    parseFrameworkSpecificResults(jsonResult, framework) {
        switch (framework) {
            case 'jest':
                return this.parseJestResults(jsonResult);
            case 'mocha':
                return this.parseMochaResults(jsonResult);
            case 'vitest':
                return this.parseVitestResults(jsonResult);
            case 'pytest':
                return this.parsePytestResults(jsonResult);
            default:
                return this.parseGenericJsonResults(jsonResult);
        }
    }
    /**
     * 解析Jest结果
     */
    parseJestResults(jsonResult) {
        const testSuites = [];
        if (jsonResult.testResults && Array.isArray(jsonResult.testResults)) {
            for (const suiteResult of jsonResult.testResults) {
                const testCases = [];
                if (suiteResult.assertionResults && Array.isArray(suiteResult.assertionResults)) {
                    for (const assertion of suiteResult.assertionResults) {
                        testCases.push({
                            name: assertion.fullName || assertion.title || 'Unnamed test',
                            filePath: suiteResult.name || '',
                            status: this.mapJestStatus(assertion.status),
                            duration: assertion.duration || 0,
                            failure: assertion.failureMessages && assertion.failureMessages.length > 0 ? {
                                message: assertion.failureMessages.join('\n'),
                                stackTrace: assertion.failureMessages.join('\n'),
                            } : undefined,
                        });
                    }
                }
                testSuites.push({
                    name: suiteResult.name || 'Test Suite',
                    filePath: suiteResult.name || '',
                    testCases,
                    stats: {
                        total: testCases.length,
                        passed: testCases.filter(tc => tc.status === 'passed').length,
                        failed: testCases.filter(tc => tc.status === 'failed').length,
                        skipped: testCases.filter(tc => tc.status === 'skipped').length,
                        errors: testCases.filter(tc => tc.status === 'error').length,
                        passRate: testCases.length > 0 ?
                            (testCases.filter(tc => tc.status === 'passed').length / testCases.length) * 100 : 0,
                        totalDuration: testCases.reduce((sum, tc) => sum + tc.duration, 0),
                    },
                });
            }
        }
        return testSuites;
    }
    /**
     * 映射Jest状态
     */
    mapJestStatus(status) {
        switch (status) {
            case 'passed': return 'passed';
            case 'failed': return 'failed';
            case 'pending': return 'pending';
            case 'todo': return 'todo';
            case 'skipped': return 'skipped';
            default: return 'error';
        }
    }
    /**
     * 解析Mocha结果
     */
    parseMochaResults(jsonResult) {
        const testSuites = [];
        if (jsonResult.tests && Array.isArray(jsonResult.tests)) {
            const testCases = [];
            for (const test of jsonResult.tests) {
                testCases.push({
                    name: test.fullTitle || test.title || 'Unnamed test',
                    filePath: test.file || '',
                    status: test.passed ? 'passed' : (test.pending ? 'skipped' : 'failed'),
                    duration: test.duration || 0,
                    failure: test.err ? {
                        message: test.err.message || '',
                        stackTrace: test.err.stack || '',
                    } : undefined,
                });
            }
            testSuites.push({
                name: 'Mocha Test Suite',
                filePath: '',
                testCases,
                stats: {
                    total: testCases.length,
                    passed: testCases.filter(tc => tc.status === 'passed').length,
                    failed: testCases.filter(tc => tc.status === 'failed').length,
                    skipped: testCases.filter(tc => tc.status === 'skipped').length,
                    errors: testCases.filter(tc => tc.status === 'error').length,
                    passRate: testCases.length > 0 ?
                        (testCases.filter(tc => tc.status === 'passed').length / testCases.length) * 100 : 0,
                    totalDuration: testCases.reduce((sum, tc) => sum + tc.duration, 0),
                },
            });
        }
        return testSuites;
    }
    /**
     * 解析Vitest结果
     */
    parseVitestResults(jsonResult) {
        // Vitest使用与Jest类似的格式
        return this.parseJestResults(jsonResult);
    }
    /**
     * 解析Pytest结果
     */
    parsePytestResults(jsonResult) {
        const testSuites = [];
        if (jsonResult.tests && Array.isArray(jsonResult.tests)) {
            const testCases = [];
            for (const test of jsonResult.tests) {
                testCases.push({
                    name: test.nodeid || test.name || 'Unnamed test',
                    filePath: test.file || test.location?.[0] || '',
                    status: test.outcome === 'passed' ? 'passed' :
                        test.outcome === 'failed' ? 'failed' :
                            test.outcome === 'skipped' ? 'skipped' : 'error',
                    duration: (test.duration || 0) * 1000, // 转换为毫秒
                    failure: test.call && test.call.crash ? {
                        message: test.call.crash.message || '',
                        stackTrace: test.call.crash.traceback || '',
                    } : undefined,
                });
            }
            testSuites.push({
                name: 'Pytest Test Suite',
                filePath: '',
                testCases,
                stats: {
                    total: testCases.length,
                    passed: testCases.filter(tc => tc.status === 'passed').length,
                    failed: testCases.filter(tc => tc.status === 'failed').length,
                    skipped: testCases.filter(tc => tc.status === 'skipped').length,
                    errors: testCases.filter(tc => tc.status === 'error').length,
                    passRate: testCases.length > 0 ?
                        (testCases.filter(tc => tc.status === 'passed').length / testCases.length) * 100 : 0,
                    totalDuration: testCases.reduce((sum, tc) => sum + tc.duration, 0),
                },
            });
        }
        return testSuites;
    }
    /**
     * 解析通用JSON结果
     */
    parseGenericJsonResults(jsonResult) {
        // 尝试通用的解析方法
        const testSuites = [];
        // 检查常见的JSON结构
        if (jsonResult.success !== undefined || jsonResult.passed !== undefined) {
            const testCases = [];
            // 尝试提取测试信息
            if (Array.isArray(jsonResult.tests)) {
                for (const test of jsonResult.tests) {
                    testCases.push({
                        name: test.name || test.title || 'Unnamed test',
                        filePath: test.file || test.filePath || '',
                        status: test.status || (test.passed ? 'passed' : 'failed'),
                        duration: test.duration || test.time || 0,
                        failure: test.error ? {
                            message: test.error.message || JSON.stringify(test.error),
                            stackTrace: test.error.stack || '',
                        } : undefined,
                    });
                }
            }
            if (testCases.length > 0) {
                testSuites.push({
                    name: 'Generic Test Suite',
                    filePath: '',
                    testCases,
                    stats: {
                        total: testCases.length,
                        passed: testCases.filter(tc => tc.status === 'passed').length,
                        failed: testCases.filter(tc => tc.status === 'failed').length,
                        skipped: testCases.filter(tc => tc.status === 'skipped').length,
                        errors: testCases.filter(tc => tc.status === 'error').length,
                        passRate: testCases.length > 0 ?
                            (testCases.filter(tc => tc.status === 'passed').length / testCases.length) * 100 : 0,
                        totalDuration: testCases.reduce((sum, tc) => sum + tc.duration, 0),
                    },
                });
            }
        }
        return testSuites;
    }
    /**
     * 解析文本结果
     */
    parseTextResults(output, framework) {
        const testSuites = [];
        const lines = output.split('\n');
        const testCases = [];
        // 简单的文本解析
        let currentSuite = 'Test Suite';
        let passedCount = 0;
        let failedCount = 0;
        let totalCount = 0;
        for (const line of lines) {
            const trimmed = line.trim();
            // 检测测试结果行
            if (trimmed.includes('✓') || trimmed.includes('✔') || trimmed.includes('PASS')) {
                passedCount++;
                totalCount++;
                // 尝试提取测试名称
                const testNameMatch = trimmed.match(/[✓✔]\s+(.+)/) || trimmed.match(/PASS\s+(.+)/);
                if (testNameMatch) {
                    testCases.push({
                        name: testNameMatch[1],
                        filePath: '',
                        status: 'passed',
                        duration: 0,
                    });
                }
            }
            else if (trimmed.includes('✗') || trimmed.includes('✘') || trimmed.includes('FAIL')) {
                failedCount++;
                totalCount++;
                const testNameMatch = trimmed.match(/[✗✘]\s+(.+)/) || trimmed.match(/FAIL\s+(.+)/);
                if (testNameMatch) {
                    testCases.push({
                        name: testNameMatch[1],
                        filePath: '',
                        status: 'failed',
                        duration: 0,
                        failure: {
                            message: 'Test failed (parsed from text output)',
                        },
                    });
                }
            }
            else if (trimmed.includes('●') || trimmed.includes('SKIP')) {
                totalCount++;
                const testNameMatch = trimmed.match(/●\s+(.+)/) || trimmed.match(/SKIP\s+(.+)/);
                if (testNameMatch) {
                    testCases.push({
                        name: testNameMatch[1],
                        filePath: '',
                        status: 'skipped',
                        duration: 0,
                    });
                }
            }
            // 检测测试套件信息
            if (trimmed.includes('Test Suites:') || trimmed.includes('Tests:')) {
                // 提取统计信息
                const statsMatch = trimmed.match(/(\d+) passed/) || trimmed.match(/(\d+)\s+passed/);
                if (statsMatch) {
                    passedCount = parseInt(statsMatch[1], 10);
                }
                const failMatch = trimmed.match(/(\d+) failed/) || trimmed.match(/(\d+)\s+failed/);
                if (failMatch) {
                    failedCount = parseInt(failMatch[1], 10);
                }
                const totalMatch = trimmed.match(/(\d+) total/) || trimmed.match(/(\d+)\s+total/);
                if (totalMatch) {
                    totalCount = parseInt(totalMatch[1], 10);
                }
            }
        }
        // 如果从文本中解析出测试用例
        if (testCases.length > 0) {
            testSuites.push({
                name: currentSuite,
                filePath: '',
                testCases,
                stats: {
                    total: testCases.length,
                    passed: testCases.filter(tc => tc.status === 'passed').length,
                    failed: testCases.filter(tc => tc.status === 'failed').length,
                    skipped: testCases.filter(tc => tc.status === 'skipped').length,
                    errors: testCases.filter(tc => tc.status === 'error').length,
                    passRate: testCases.length > 0 ?
                        (testCases.filter(tc => tc.status === 'passed').length / testCases.length) * 100 : 0,
                    totalDuration: testCases.reduce((sum, tc) => sum + tc.duration, 0),
                },
            });
        }
        else if (totalCount > 0) {
            // 只有统计信息，创建虚拟测试用例
            for (let i = 0; i < passedCount; i++) {
                testCases.push({
                    name: `Passed test ${i + 1}`,
                    filePath: '',
                    status: 'passed',
                    duration: 0,
                });
            }
            for (let i = 0; i < failedCount; i++) {
                testCases.push({
                    name: `Failed test ${i + 1}`,
                    filePath: '',
                    status: 'failed',
                    duration: 0,
                    failure: {
                        message: 'Test failed (from text statistics)',
                    },
                });
            }
            testSuites.push({
                name: currentSuite,
                filePath: '',
                testCases,
                stats: {
                    total: totalCount,
                    passed: passedCount,
                    failed: failedCount,
                    skipped: totalCount - passedCount - failedCount,
                    errors: 0,
                    passRate: totalCount > 0 ? (passedCount / totalCount) * 100 : 0,
                    totalDuration: 0,
                },
            });
        }
        return testSuites;
    }
    /**
     * 创建默认测试套件
     */
    createDefaultTestSuite(stdout, stderr) {
        const output = stdout + stderr;
        const hasPass = output.toLowerCase().includes('pass') || output.includes('✓');
        const hasFail = output.toLowerCase().includes('fail') || output.includes('✗');
        const testCases = [];
        if (hasPass && !hasFail) {
            testCases.push({
                name: 'Tests passed',
                filePath: '',
                status: 'passed',
                duration: 0,
            });
        }
        else if (hasFail) {
            testCases.push({
                name: 'Tests failed',
                filePath: '',
                status: 'failed',
                duration: 0,
                failure: {
                    message: 'Test execution indicated failure',
                },
            });
        }
        else {
            testCases.push({
                name: 'Test execution completed',
                filePath: '',
                status: 'passed',
                duration: 0,
            });
        }
        return [{
                name: 'Default Test Suite',
                filePath: '',
                testCases,
                stats: {
                    total: testCases.length,
                    passed: testCases.filter(tc => tc.status === 'passed').length,
                    failed: testCases.filter(tc => tc.status === 'failed').length,
                    skipped: 0,
                    errors: 0,
                    passRate: testCases.length > 0 ?
                        (testCases.filter(tc => tc.status === 'passed').length / testCases.length) * 100 : 0,
                    totalDuration: 0,
                },
            }];
    }
    /**
     * 解析覆盖率结果
     */
    async parseCoverageResults(workingDirectory, framework) {
        try {
            // 查找覆盖率报告文件
            const coverageFiles = [
                path.join(workingDirectory, 'coverage', 'coverage-summary.json'),
                path.join(workingDirectory, 'coverage', 'coverage-final.json'),
                path.join(workingDirectory, 'coverage', 'lcov.info'),
                path.join(workingDirectory, 'coverage.json'),
                path.join(workingDirectory, '.nyc_output', 'coverage.json'),
            ];
            let coverageData = null;
            let coverageFile;
            for (const file of coverageFiles) {
                if (fs.existsSync(file)) {
                    try {
                        const content = fs.readFileSync(file, 'utf8');
                        if (file.endsWith('.json')) {
                            coverageData = JSON.parse(content);
                        }
                        coverageFile = file;
                        break;
                    }
                    catch (error) {
                        // 继续尝试下一个文件
                    }
                }
            }
            if (!coverageData) {
                return {
                    available: false,
                };
            }
            // 解析覆盖率数据
            return this.parseCoverageData(coverageData, framework, coverageFile || '');
        }
        catch (error) {
            this.logWarn(`Coverage parsing failed: ${error.message}`);
            return {
                available: false,
            };
        }
    }
    /**
     * 解析覆盖率数据
     */
    parseCoverageData(data, framework, sourceFile) {
        try {
            // 尝试不同的覆盖率格式
            let summary;
            if (data.total) {
                // Jest/NYC 格式
                summary = {
                    lines: {
                        total: data.total.lines.total,
                        covered: data.total.lines.covered,
                        percentage: data.total.lines.pct,
                    },
                    statements: {
                        total: data.total.statements.total,
                        covered: data.total.statements.covered,
                        percentage: data.total.statements.pct,
                    },
                    functions: {
                        total: data.total.functions.total,
                        covered: data.total.functions.covered,
                        percentage: data.total.functions.pct,
                    },
                    branches: {
                        total: data.total.branches.total,
                        covered: data.total.branches.covered,
                        percentage: data.total.branches.pct,
                    },
                };
            }
            else if (data.coverageMap) {
                // 其他格式，尝试计算
                const coverageMap = data.coverageMap;
                const files = Object.keys(coverageMap);
                let totalLines = 0;
                let coveredLines = 0;
                for (const file of files) {
                    const fileCoverage = coverageMap[file];
                    if (fileCoverage && fileCoverage.l) {
                        const lineData = fileCoverage.l;
                        totalLines += Object.keys(lineData).length;
                        coveredLines += Object.values(lineData).filter((v) => v > 0).length;
                    }
                }
                summary = {
                    lines: {
                        total: totalLines,
                        covered: coveredLines,
                        percentage: totalLines > 0 ? (coveredLines / totalLines) * 100 : 0,
                    },
                    statements: {
                        total: totalLines,
                        covered: coveredLines,
                        percentage: totalLines > 0 ? (coveredLines / totalLines) * 100 : 0,
                    },
                    functions: {
                        total: 0,
                        covered: 0,
                        percentage: 0,
                    },
                    branches: {
                        total: 0,
                        covered: 0,
                        percentage: 0,
                    },
                };
            }
            else {
                // 未知格式
                return {
                    available: false,
                };
            }
            return {
                available: true,
                summary,
            };
        }
        catch (error) {
            this.logWarn(`Coverage data parsing failed: ${error.message}`);
            return {
                available: false,
            };
        }
    }
    /**
     * 计算总体统计
     */
    calculateOverallStats(testSuites) {
        let totalTests = 0;
        let passedTests = 0;
        let failedTests = 0;
        let skippedTests = 0;
        let totalTime = 0;
        for (const suite of testSuites) {
            totalTests += suite.stats.total;
            passedTests += suite.stats.passed;
            failedTests += suite.stats.failed;
            skippedTests += suite.stats.skipped;
            totalTime += suite.stats.totalDuration;
        }
        const overallPassRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
        const averageTime = totalTests > 0 ? totalTime / totalTests : 0;
        return {
            totalTests,
            passedTests,
            failedTests,
            skippedTests,
            overallPassRate,
            totalTime,
            averageTime,
        };
    }
    /**
     * 分析失败测试
     */
    async analyzeFailures(testSuites, params, context) {
        const failedTests = [];
        const errorMessages = [];
        // 收集失败测试
        for (const suite of testSuites) {
            for (const testCase of suite.testCases) {
                if (testCase.status === 'failed' || testCase.status === 'error') {
                    failedTests.push({
                        name: testCase.name,
                        filePath: testCase.filePath,
                        message: testCase.failure?.message || 'Test failed',
                    });
                    if (testCase.failure?.message) {
                        errorMessages.push(testCase.failure.message);
                    }
                }
            }
        }
        // 分析常见模式
        const commonPatterns = this.identifyCommonPatterns(errorMessages);
        // 生成修复建议
        const fixSuggestions = this.generateFixSuggestions(failedTests, commonPatterns, params.framework);
        return {
            failedTests,
            commonPatterns,
            fixSuggestions,
        };
    }
    /**
     * 识别常见模式
     */
    identifyCommonPatterns(errorMessages) {
        const patterns = [];
        const lowerMessages = errorMessages.map(msg => msg.toLowerCase());
        // 检查常见错误模式
        if (lowerMessages.some(msg => msg.includes('timeout'))) {
            patterns.push('Timeout errors - tests taking too long');
        }
        if (lowerMessages.some(msg => msg.includes('assert') || msg.includes('expect'))) {
            patterns.push('Assertion failures - expected values not matching actual values');
        }
        if (lowerMessages.some(msg => msg.includes('network') || msg.includes('fetch'))) {
            patterns.push('Network errors - API calls failing');
        }
        if (lowerMessages.some(msg => msg.includes('type'))) {
            patterns.push('Type errors - wrong data types');
        }
        if (lowerMessages.some(msg => msg.includes('undefined') || msg.includes('null'))) {
            patterns.push('Null/undefined errors - missing values');
        }
        if (lowerMessages.some(msg => msg.includes('import') || msg.includes('require'))) {
            patterns.push('Import/require errors - module resolution issues');
        }
        if (patterns.length === 0 && errorMessages.length > 0) {
            patterns.push('Various test failures - no clear common pattern');
        }
        return patterns;
    }
    /**
     * 生成修复建议
     */
    generateFixSuggestions(failedTests, commonPatterns, framework) {
        const suggestions = [];
        if (commonPatterns.some(p => p.includes('Timeout'))) {
            suggestions.push('Increase test timeout values');
            suggestions.push('Optimize slow tests or mock external dependencies');
        }
        if (commonPatterns.some(p => p.includes('Assertion'))) {
            suggestions.push('Review test assertions and expected values');
            suggestions.push('Add more descriptive assertion messages');
        }
        if (commonPatterns.some(p => p.includes('Network'))) {
            suggestions.push('Mock network requests in tests');
            suggestions.push('Check API availability and authentication');
        }
        if (commonPatterns.some(p => p.includes('Type'))) {
            suggestions.push('Add type checking or validation');
            suggestions.push('Review data transformations and conversions');
        }
        if (commonPatterns.some(p => p.includes('Null/undefined'))) {
            suggestions.push('Add null checks before property access');
            suggestions.push('Ensure all required data is initialized');
        }
        if (commonPatterns.some(p => p.includes('Import'))) {
            suggestions.push('Check module paths and package.json dependencies');
            suggestions.push('Verify file extensions and import syntax');
        }
        // 通用建议
        if (failedTests.length > 0) {
            suggestions.push(`Run failing tests individually: ${failedTests.map(t => `"${t.name}"`).join(', ')}`);
            suggestions.push('Add console.log statements to debug failing tests');
            suggestions.push('Check test setup and teardown logic');
        }
        if (framework === 'jest') {
            suggestions.push('Use jest --verbose for more detailed output');
            suggestions.push('Consider using jest --testNamePattern to isolate failing tests');
        }
        return suggestions;
    }
    /**
     * 分析性能
     */
    analyzePerformance(testSuites) {
        // 收集所有测试用例
        const allTestCases = [];
        for (const suite of testSuites) {
            allTestCases.push(...suite.testCases);
        }
        // 找出最慢的测试
        const slowestTests = [...allTestCases]
            .filter(tc => tc.duration > 0)
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 5)
            .map(tc => ({ name: tc.name, duration: tc.duration }));
        // 计算时间分布
        let fast = 0, medium = 0, slow = 0;
        for (const tc of allTestCases) {
            if (tc.duration < 100) {
                fast++;
            }
            else if (tc.duration < 1000) {
                medium++;
            }
            else {
                slow++;
            }
        }
        // 生成性能建议
        const suggestions = [];
        if (slow > 0) {
            suggestions.push(`Optimize ${slow} slow tests (over 1 second)`);
            suggestions.push('Consider mocking external dependencies for slow tests');
        }
        if (slowestTests.length > 0) {
            suggestions.push(`Focus on the slowest test: "${slowestTests[0].name}" (${slowestTests[0].duration}ms)`);
        }
        if (fast === allTestCases.length) {
            suggestions.push('All tests are fast (under 100ms) - good performance!');
        }
        return {
            slowestTests,
            timeDistribution: { fast, medium, slow },
            suggestions,
        };
    }
    /**
     * 生成报告
     */
    async generateReport(testSuites, coverage, params, workingDirectory) {
        if (!params.options?.reportOutput) {
            return undefined;
        }
        try {
            const reportPath = path.isAbsolute(params.options.reportOutput)
                ? params.options.reportOutput
                : path.join(workingDirectory, params.options.reportOutput);
            // 创建报告目录
            const reportDir = path.dirname(reportPath);
            if (!fs.existsSync(reportDir)) {
                fs.mkdirSync(reportDir, { recursive: true });
            }
            // 生成简单的JSON报告
            const report = {
                timestamp: new Date().toISOString(),
                framework: params.framework,
                testPath: params.testPath,
                testSuites,
                coverage,
                overallStats: this.calculateOverallStats(testSuites),
            };
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
            this.logInfo(`Test report generated: ${reportPath}`);
            return reportPath;
        }
        catch (error) {
            this.logWarn(`Failed to generate report: ${error.message}`);
            return undefined;
        }
    }
    /**
     * 计算统计信息
     */
    calculateStatistics(startTime, commandExecutionTime, stdout, stderr) {
        const runTime = Date.now() - startTime;
        const outputSize = (stdout + stderr).length;
        // 尝试获取内存使用
        let memoryUsage;
        try {
            const used = process.memoryUsage();
            memoryUsage = Math.round(used.heapUsed / 1024 / 1024); // MB
        }
        catch {
            // 忽略内存获取错误
        }
        return {
            runTime,
            memoryUsage,
            commandExecutionTime,
            outputSize,
        };
    }
    // ==================== 工具元数据 ====================
    /**
     * 获取工具ID
     */
    getToolId() {
        return TestRunnerTool.TOOL_ID;
    }
    /**
     * 获取工具名称
     */
    getToolName() {
        return TestRunnerTool.TOOL_NAME;
    }
    /**
     * 获取工具描述
     */
    getToolDescription() {
        return TestRunnerTool.TOOL_DESCRIPTION;
    }
    /**
     * 获取工具类别
     */
    getToolCategory() {
        return TestRunnerTool.TOOL_CATEGORY;
    }
    /**
     * 获取工具能力
     */
    getToolCapabilities() {
        return TestRunnerTool.TOOL_CAPABILITIES;
    }
    /**
     * 获取权限级别
     */
    getPermissionLevel() {
        return TestRunnerTool.PERMISSION_LEVEL;
    }
}
exports.TestRunnerTool = TestRunnerTool;
exports.default = TestRunnerTool;
//# sourceMappingURL=TestRunnerTool.js.map