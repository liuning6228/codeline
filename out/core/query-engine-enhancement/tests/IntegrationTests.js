"use strict";
/**
 * IntegrationTests - 集成测试
 *
 * 测试编码工具集和智能代码补全器的集成
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
exports.IntegrationTests = void 0;
exports.runIntegrationTests = runIntegrationTests;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const SmartCodeCompleter_1 = require("../SmartCodeCompleter");
const CodeGeneratorTool_1 = require("../tools/CodeGeneratorTool");
const DebugAnalyzerTool_1 = require("../tools/DebugAnalyzerTool");
const CodeAnalysisTool_1 = require("../tools/CodeAnalysisTool");
const CodingToolsRegistrar_1 = require("../tools/CodingToolsRegistrar");
const EnhancedToolRegistry_1 = require("../../tool/EnhancedToolRegistry");
/**
 * 集成测试套件
 */
class IntegrationTests {
    workspaceRoot;
    testResults = [];
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
    }
    /**
     * 运行所有集成测试
     */
    async runAllTests() {
        console.log('🚀 Running Integration Tests\n');
        this.testResults = [];
        // 运行测试套件
        await this.runTestSuite('Tool Registration', () => this.testToolRegistration());
        await this.runTestSuite('Smart Code Completion', () => this.testSmartCodeCompletion());
        await this.runTestSuite('Code Generation Workflow', () => this.testCodeGenerationWorkflow());
        await this.runTestSuite('Debug Analysis Workflow', () => this.testDebugAnalysisWorkflow());
        await this.runTestSuite('Code Analysis Workflow', () => this.testCodeAnalysisWorkflow());
        await this.runTestSuite('Performance Benchmarks', () => this.testPerformanceBenchmarks());
        // 生成测试报告
        await this.generateTestReport();
        return this.testResults;
    }
    /**
     * 运行测试套件
     */
    async runTestSuite(name, testFn) {
        const startTime = Date.now();
        console.log(`📊 Test Suite: ${name}`);
        console.log('='.repeat(50));
        try {
            await testFn();
            const duration = Date.now() - startTime;
            this.testResults.push({
                name,
                passed: true,
                duration,
            });
            console.log(`✅ ${name}: PASSED (${duration}ms)\n`);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.testResults.push({
                name,
                passed: false,
                duration,
                error: error.message,
            });
            console.error(`❌ ${name}: FAILED (${duration}ms)`);
            console.error(`   Error: ${error.message}\n`);
        }
    }
    /**
     * 测试工具注册
     */
    async testToolRegistration() {
        // 创建工具注册表
        const toolRegistry = new EnhancedToolRegistry_1.EnhancedToolRegistry();
        const registrar = new CodingToolsRegistrar_1.CodingToolsRegistrar(toolRegistry, {
            autoRegister: true,
            overwriteExisting: true,
            context: { workspaceRoot: this.workspaceRoot },
        });
        // 注册所有工具
        const result = await registrar.registerAllTools();
        if (!result.success) {
            throw new Error(`Tool registration failed: ${result.failed.map(f => `${f.toolId}: ${f.error}`).join(', ')}`);
        }
        // 验证工具数量
        const registeredTools = registrar.getRegisteredTools();
        if (registeredTools.length < 5) {
            throw new Error(`Expected at least 5 tools, got ${registeredTools.length}`);
        }
        console.log(`   Registered ${registeredTools.length} tools: ${registeredTools.map(t => t.name).join(', ')}`);
        // 验证工具可用性
        const validation = await registrar.validateTools();
        const unavailableTools = validation.filter(t => !t.available);
        if (unavailableTools.length > 0) {
            console.warn(`   ${unavailableTools.length} tools unavailable: ${unavailableTools.map(t => t.toolId).join(', ')}`);
        }
        // 获取工具统计
        const stats = registrar.getStats();
        console.log(`   Tool stats: ${stats.totalRegistered}/${stats.totalAvailable} registered`);
    }
    /**
     * 测试智能代码补全
     */
    async testSmartCodeCompletion() {
        // 创建测试文件
        const testFilePath = path.join(this.workspaceRoot, 'test-completion.ts');
        const testContent = `
// Test file for code completion
import * as path from 'path';

function calculateTotal(items: Array<{ price: number }>): number {
  let total = 0;
  
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  
  return total;
}

class User {
  constructor(public name: string, public email: string) {}
  
  greet() {
    console.log(\`Hello, \${this.name}!\`);
  }
}

// Cursor position tests
const user = new User('Alice', 'alice@example.com');
user.
`;
        fs.writeFileSync(testFilePath, testContent, 'utf8');
        try {
            // 创建智能代码补全器
            const completer = new SmartCodeCompleter_1.SmartCodeCompleter(this.workspaceRoot, {
                enableSmartSuggestions: true,
                enableErrorFixes: true,
                enableSnippets: true,
                maxItems: 20,
                minConfidence: 0.3,
            });
            // 测试1：属性访问补全
            console.log('   Test 1: Property access completion');
            const propertyCompletion = await completer.getCompletions({
                filePath: testFilePath,
                cursorPosition: { line: 22, character: 5 }, // user. 之后的位置
                currentLine: 'user.',
                fileContent: testContent,
                editorState: {
                    languageId: 'typescript',
                    isUntitled: false,
                    hasSelection: false,
                },
            });
            if (!propertyCompletion.success) {
                throw new Error(`Property completion failed: ${propertyCompletion.error}`);
            }
            const propertyItems = propertyCompletion.items.filter(item => item.type === 'property' || item.type === 'method');
            console.log(`   Found ${propertyItems.length} property/method suggestions`);
            // 测试2：导入补全
            console.log('   Test 2: Import statement completion');
            const importCompletion = await completer.getCompletions({
                filePath: testFilePath,
                cursorPosition: { line: 2, character: 20 }, // import 之后的位置
                currentLine: 'import ',
                fileContent: testContent,
                editorState: {
                    languageId: 'typescript',
                    isUntitled: false,
                    hasSelection: false,
                },
            });
            if (!importCompletion.success) {
                throw new Error(`Import completion failed: ${importCompletion.error}`);
            }
            const importItems = importCompletion.items.filter(item => item.type === 'import');
            console.log(`   Found ${importItems.length} import suggestions`);
            // 测试3：函数调用补全
            console.log('   Test 3: Function call completion');
            const functionCompletion = await completer.getCompletions({
                filePath: testFilePath,
                cursorPosition: { line: 8, character: 15 }, // console. 之后的位置
                currentLine: '    console.',
                fileContent: testContent,
                editorState: {
                    languageId: 'typescript',
                    isUntitled: false,
                    hasSelection: false,
                },
            });
            if (!functionCompletion.success) {
                throw new Error(`Function completion failed: ${functionCompletion.error}`);
            }
            const functionItems = functionCompletion.items.filter(item => item.label.includes('log'));
            console.log(`   Found ${functionItems.length} console function suggestions (including console.log)`);
            // 验证总体结果
            const totalSuggestions = propertyCompletion.items.length +
                importCompletion.items.length +
                functionCompletion.items.length;
            console.log(`   Total suggestions generated: ${totalSuggestions}`);
            if (totalSuggestions < 10) {
                throw new Error(`Expected at least 10 total suggestions, got ${totalSuggestions}`);
            }
        }
        finally {
            // 清理测试文件
            if (fs.existsSync(testFilePath)) {
                fs.unlinkSync(testFilePath);
            }
        }
    }
    /**
     * 测试代码生成工作流
     */
    async testCodeGenerationWorkflow() {
        const testDir = path.join(this.workspaceRoot, 'test-generation');
        // 确保测试目录存在
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
        try {
            // 创建代码生成器工具
            const generator = new CodeGeneratorTool_1.CodeGeneratorTool();
            // 创建测试用的工具上下文
            const mockToolUseContext = {
                toolUseId: 'test-tool-use-id',
                requestId: 'test-request-id',
                sessionId: 'test-session-id',
                userId: 'test-user-id',
                chainId: 'test-chain-id',
                depth: 0,
                parentToolUseId: undefined,
                workspaceRoot: '/tmp/test-workspace',
                workspaceFolders: [],
                extensionContext: { subscriptions: [] },
                outputChannel: { appendLine: () => { }, show: () => { } },
                abortController: new AbortController(),
                permissionContext: { hasPermission: () => true, checkPermission: () => true },
                showInformationMessage: async () => '',
                showWarningMessage: async () => '',
                showErrorMessage: async () => '',
                readFile: async (path) => '',
                writeFile: async (path, content) => { },
                fileExists: async (path) => false,
            };
            // 测试1：生成TypeScript函数
            console.log('   Test 1: Generate TypeScript function');
            const functionResult = await generator.execute({
                description: 'Calculate the factorial of a number',
                language: 'typescript',
                codeType: 'function',
                includeDocumentation: true,
                includeTests: false,
                complexity: 'simple',
            }, mockToolUseContext);
            if (!functionResult.generatedCode.includes('function') ||
                !functionResult.generatedCode.includes('factorial')) {
                throw new Error('Generated function does not match requirements');
            }
            console.log(`   Generated ${functionResult.statistics.linesOfCode} lines of code`);
            // 测试2：生成TypeScript类
            console.log('   Test 2: Generate TypeScript class');
            const classResult = await generator.execute({
                description: 'User model with name, email, and age properties',
                language: 'typescript',
                codeType: 'class',
                includeDocumentation: true,
                includeTests: false,
                style: 'oop',
                complexity: 'simple',
            }, mockToolUseContext);
            if (!classResult.generatedCode.includes('class') ||
                !classResult.generatedCode.includes('User')) {
                throw new Error('Generated class does not match requirements');
            }
            console.log(`   Generated ${classResult.statistics.linesOfCode} lines of code`);
            // 测试3：生成测试文件
            console.log('   Test 3: Generate test file');
            const testResult = await generator.execute({
                description: 'Jest tests for User model',
                language: 'typescript',
                codeType: 'test',
                includeDocumentation: true,
                includeExamples: true,
                complexity: 'moderate',
            }, mockToolUseContext);
            if (!testResult.generatedCode.includes('describe') ||
                !testResult.generatedCode.includes('it')) {
                throw new Error('Generated tests do not match requirements');
            }
            console.log(`   Generated ${testResult.statistics.linesOfCode} lines of code with ${testResult.statistics.functions} test functions`);
        }
        finally {
            // 清理测试目录
            if (fs.existsSync(testDir)) {
                fs.rmSync(testDir, { recursive: true, force: true });
            }
        }
    }
    /**
     * 测试调试分析工作流
     */
    async testDebugAnalysisWorkflow() {
        const debuggerTool = new DebugAnalyzerTool_1.DebugAnalyzerTool();
        // 创建测试用的工具上下文
        const mockToolUseContext = {
            toolUseId: 'test-tool-use-id',
            requestId: 'test-request-id',
            sessionId: 'test-session-id',
            userId: 'test-user-id',
            chainId: 'test-chain-id',
            depth: 0,
            parentToolUseId: undefined,
            workspaceRoot: '/tmp/test-workspace',
            workspaceFolders: [],
            extensionContext: { subscriptions: [] },
            outputChannel: { appendLine: () => { }, show: () => { } },
            abortController: new AbortController(),
            permissionContext: { hasPermission: () => true, checkPermission: () => true },
            showInformationMessage: async () => '',
            showWarningMessage: async () => '',
            showErrorMessage: async () => '',
            readFile: async (path) => '',
            writeFile: async (path, content) => { },
            fileExists: async (path) => false,
        };
        // 测试错误分析
        console.log('   Test 1: Analyze TypeError');
        const typeErrorResult = await debuggerTool.execute({
            errorInput: `TypeError: Cannot read property 'name' of undefined
    at getUserProfile (userService.js:15:23)
    at processUser (app.js:42:10)
    at main (app.js:85:5)`,
            language: 'javascript',
            analyzeStacktrace: true,
            provideFixes: true,
            analysisDepth: 'normal',
        }, mockToolUseContext);
        if (!typeErrorResult.success) {
            throw new Error(`TypeError analysis failed: ${typeErrorResult.error}`);
        }
        if (typeErrorResult.errorType !== 'type_error') {
            throw new Error(`Expected type_error, got ${typeErrorResult.errorType}`);
        }
        console.log(`   Error type: ${typeErrorResult.errorType}, Severity: ${typeErrorResult.severity}`);
        console.log(`   Fixes generated: ${typeErrorResult.fixes.quickFixes.length}`);
        // 测试语法错误分析
        console.log('   Test 2: Analyze SyntaxError');
        const syntaxErrorResult = await debuggerTool.execute({
            errorInput: `SyntaxError: Unexpected token '}'
    at Module._compile (internal/modules/cjs/loader.js:723:23)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:789:10)`,
            language: 'javascript',
            analyzeStacktrace: true,
            provideFixes: true,
            analysisDepth: 'normal',
        }, mockToolUseContext);
        if (!syntaxErrorResult.success) {
            throw new Error(`SyntaxError analysis failed: ${syntaxErrorResult.error}`);
        }
        if (syntaxErrorResult.errorType !== 'syntax_error') {
            throw new Error(`Expected syntax_error, got ${syntaxErrorResult.errorType}`);
        }
        console.log(`   Error type: ${syntaxErrorResult.errorType}, Severity: ${syntaxErrorResult.severity}`);
        // 测试没有堆栈跟踪的错误
        console.log('   Test 3: Analyze error without stack trace');
        const simpleErrorResult = await debuggerTool.execute({
            errorInput: 'ReferenceError: user is not defined',
            language: 'javascript',
            analyzeStacktrace: false,
            provideFixes: true,
            analysisDepth: 'shallow',
        }, mockToolUseContext);
        if (!simpleErrorResult.success) {
            throw new Error(`Simple error analysis failed: ${simpleErrorResult.error}`);
        }
        console.log(`   Error type: ${simpleErrorResult.errorType}, Root cause: ${simpleErrorResult.rootCause.mostLikelyCause.substring(0, 50)}...`);
    }
    /**
     * 测试代码分析工作流
     */
    async testCodeAnalysisWorkflow() {
        // 创建测试文件进行分析
        const testFilePath = path.join(this.workspaceRoot, 'test-analysis.ts');
        const testContent = `
// Test file for code analysis
interface User {
  name: string;
  email: string;
  age?: number;
}

function processUser(user: User): string {
  if (!user.name) {
    throw new Error('Name is required');
  }
  
  // TODO: Add email validation
  console.log(\`Processing user: \${user.name}\`);
  
  return \`\${user.name} <\${user.email}>\`;
}

class UserService {
  private users: User[] = [];
  
  addUser(user: User): void {
    this.users.push(user);
  }
  
  findUserByName(name: string): User | undefined {
    return this.users.find(u => u.name === name);
  }
}
`;
        fs.writeFileSync(testFilePath, testContent, 'utf8');
        try {
            // 创建测试用的工具上下文
            const mockToolUseContext = {
                toolUseId: 'test-tool-use-id',
                requestId: 'test-request-id',
                sessionId: 'test-session-id',
                userId: 'test-user-id',
                chainId: 'test-chain-id',
                depth: 0,
                parentToolUseId: undefined,
                workspaceRoot: '/tmp/test-workspace',
                workspaceFolders: [],
                extensionContext: { subscriptions: [] },
                outputChannel: { appendLine: () => { }, show: () => { } },
                abortController: new AbortController(),
                permissionContext: { hasPermission: () => true, checkPermission: () => true },
                showInformationMessage: async () => '',
                showWarningMessage: async () => '',
                showErrorMessage: async () => '',
                readFile: async (path) => '',
                writeFile: async (path, content) => { },
                fileExists: async (path) => false,
            };
            const analyzer = new CodeAnalysisTool_1.CodeAnalysisTool();
            // 测试文件分析
            console.log('   Test 1: Analyze single file');
            const fileAnalysis = await analyzer.execute({
                codePath: testFilePath,
                analysisType: 'file',
                analyzers: ['quality', 'complexity', 'style'],
                analysisDepth: 'normal',
                includeFixes: true,
                calculateMetrics: true,
            }, mockToolUseContext);
            if (!fileAnalysis.success) {
                throw new Error(`File analysis failed: ${fileAnalysis.error}`);
            }
            console.log(`   File quality: ${fileAnalysis.quality}`);
            console.log(`   Issues found: ${fileAnalysis.issueStats.total}`);
            console.log(`   Lines of code: ${fileAnalysis.metrics.basic.linesOfCode}`);
            // 测试目录分析（简化）
            console.log('   Test 2: Quick directory analysis');
            const dirAnalysis = await analyzer.execute({
                codePath: path.dirname(testFilePath),
                analysisType: 'directory',
                analyzers: ['quality'],
                analysisDepth: 'shallow',
                includeFixes: false,
                calculateMetrics: false,
            }, mockToolUseContext);
            if (!dirAnalysis.success) {
                console.warn(`   Directory analysis warning: ${dirAnalysis.error}`);
            }
            else {
                console.log(`   Directory analysis completed: ${dirAnalysis.issueStats.total} issues`);
            }
        }
        finally {
            // 清理测试文件
            if (fs.existsSync(testFilePath)) {
                fs.unlinkSync(testFilePath);
            }
        }
    }
    /**
     * 测试性能基准
     */
    async testPerformanceBenchmarks() {
        console.log('   Running performance benchmarks...');
        const benchmarks = [];
        // 基准1：智能代码补全性能
        const completer = new SmartCodeCompleter_1.SmartCodeCompleter(this.workspaceRoot, {
            enableSmartSuggestions: true,
            maxItems: 10,
            contextDepth: 'normal',
        });
        const testContext = {
            filePath: path.join(this.workspaceRoot, 'package.json'),
            cursorPosition: { line: 1, character: 1 },
            currentLine: 'im',
            fileContent: '{}',
            editorState: {
                languageId: 'json',
                isUntitled: false,
                hasSelection: false,
            },
        };
        // 预热
        await completer.getCompletions(testContext);
        // 运行基准测试
        const iterations = 10;
        let totalTime = 0;
        for (let i = 0; i < iterations; i++) {
            const startTime = Date.now();
            await completer.getCompletions(testContext);
            totalTime += Date.now() - startTime;
        }
        const avgTime = totalTime / iterations;
        benchmarks.push({
            name: 'Smart Code Completion',
            duration: totalTime,
            iterations,
            avgTime,
        });
        console.log(`   Completion: ${avgTime.toFixed(1)}ms average over ${iterations} iterations`);
        // 基准2：代码生成性能
        const generator = new CodeGeneratorTool_1.CodeGeneratorTool();
        // 创建测试用的工具上下文
        const mockToolUseContext = {
            toolUseId: 'test-tool-use-id',
            requestId: 'test-request-id',
            sessionId: 'test-session-id',
            userId: 'test-user-id',
            chainId: 'test-chain-id',
            depth: 0,
            parentToolUseId: undefined,
            workspaceRoot: '/tmp/test-workspace',
            workspaceFolders: [],
            extensionContext: { subscriptions: [] },
            outputChannel: { appendLine: () => { }, show: () => { } },
            abortController: new AbortController(),
            permissionContext: { hasPermission: () => true, checkPermission: () => true },
            showInformationMessage: async () => '',
            showWarningMessage: async () => '',
            showErrorMessage: async () => '',
            readFile: async (path) => '',
            writeFile: async (path, content) => { },
            fileExists: async (path) => false,
        };
        const genIterations = 5;
        let genTotalTime = 0;
        for (let i = 0; i < genIterations; i++) {
            const startTime = Date.now();
            await generator.execute({
                description: 'Test function',
                language: 'typescript',
                codeType: 'function',
                includeDocumentation: false,
                includeTests: false,
                complexity: 'simple',
            }, mockToolUseContext);
            genTotalTime += Date.now() - startTime;
        }
        const genAvgTime = genTotalTime / genIterations;
        benchmarks.push({
            name: 'Code Generation',
            duration: genTotalTime,
            iterations: genIterations,
            avgTime: genAvgTime,
        });
        console.log(`   Generation: ${genAvgTime.toFixed(1)}ms average over ${genIterations} iterations`);
        // 输出性能总结
        console.log('\n   Performance Summary:');
        console.log('   ' + '='.repeat(40));
        benchmarks.forEach(bench => {
            console.log(`   ${bench.name}: ${bench.avgTime.toFixed(1)}ms avg, ${bench.duration}ms total for ${bench.iterations} iterations`);
        });
        // 性能要求检查
        const maxCompletionTime = 500; // 500ms 最大响应时间
        const maxGenerationTime = 2000; // 2秒最大生成时间
        if (avgTime > maxCompletionTime) {
            console.warn(`   ⚠️  Completion time exceeds target (${avgTime.toFixed(1)}ms > ${maxCompletionTime}ms)`);
        }
        if (genAvgTime > maxGenerationTime) {
            console.warn(`   ⚠️  Generation time exceeds target (${genAvgTime.toFixed(1)}ms > ${maxGenerationTime}ms)`);
        }
    }
    /**
     * 生成测试报告
     */
    async generateTestReport() {
        const reportDir = path.join(this.workspaceRoot, 'test-reports');
        const reportPath = path.join(reportDir, 'integration-test-report.json');
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }
        const report = {
            timestamp: new Date().toISOString(),
            workspaceRoot: this.workspaceRoot,
            summary: {
                totalTests: this.testResults.length,
                passedTests: this.testResults.filter(t => t.passed).length,
                failedTests: this.testResults.filter(t => !t.passed).length,
                successRate: (this.testResults.filter(t => t.passed).length / this.testResults.length) * 100,
                totalDuration: this.testResults.reduce((sum, t) => sum + t.duration, 0),
            },
            testResults: this.testResults,
            recommendations: this.generateRecommendations(),
        };
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
        console.log('\n📊 Test Report Summary:');
        console.log('='.repeat(50));
        console.log(`   Total Tests: ${report.summary.totalTests}`);
        console.log(`   Passed: ${report.summary.passedTests}`);
        console.log(`   Failed: ${report.summary.failedTests}`);
        console.log(`   Success Rate: ${report.summary.successRate.toFixed(1)}%`);
        console.log(`   Total Duration: ${report.summary.totalDuration}ms`);
        console.log(`   Report saved to: ${reportPath}`);
        if (report.summary.failedTests > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults
                .filter(t => !t.passed)
                .forEach(t => {
                console.log(`   - ${t.name}: ${t.error}`);
            });
        }
    }
    /**
     * 生成建议
     */
    generateRecommendations() {
        const recommendations = [];
        const failedTests = this.testResults.filter(t => !t.passed);
        if (failedTests.length > 0) {
            recommendations.push('Fix failed integration tests before proceeding');
        }
        // 基于测试结果的具体建议
        const completionTest = this.testResults.find(t => t.name === 'Smart Code Completion');
        if (completionTest && completionTest.passed) {
            recommendations.push('Smart code completer is working well, consider adding more language support');
        }
        const performanceTest = this.testResults.find(t => t.name === 'Performance Benchmarks');
        if (performanceTest && performanceTest.passed) {
            recommendations.push('Performance meets basic requirements, consider optimization for production use');
        }
        if (this.testResults.filter(t => t.passed).length >= 5) {
            recommendations.push('Integration tests mostly passing, ready for user testing phase');
        }
        return recommendations;
    }
}
exports.IntegrationTests = IntegrationTests;
/**
 * 运行集成测试
 */
async function runIntegrationTests(workspaceRoot) {
    const root = workspaceRoot || process.cwd();
    console.log('========================================');
    console.log('   Coding Tools Integration Tests');
    console.log('========================================\n');
    const tests = new IntegrationTests(root);
    const results = await tests.runAllTests();
    console.log('\n========================================');
    console.log('   Integration Tests Completed');
    console.log('========================================');
    return results;
}
// 如果直接运行此文件
if (require.main === module) {
    runIntegrationTests().catch(console.error);
}
exports.default = IntegrationTests;
//# sourceMappingURL=IntegrationTests.js.map