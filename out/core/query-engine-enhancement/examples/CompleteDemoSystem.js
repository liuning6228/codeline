"use strict";
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
exports.CompleteDemoSystem = void 0;
exports.runCompleteDemoSystem = runCompleteDemoSystem;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const SmartCodeCompleter_1 = require("../SmartCodeCompleter");
const CodeGeneratorTool_1 = require("../tools/CodeGeneratorTool");
const FileEditorTool_1 = require("../tools/FileEditorTool");
const TestRunnerTool_1 = require("../tools/TestRunnerTool");
const CodeAnalysisTool_1 = require("../tools/CodeAnalysisTool");
const CodeRefactoringEngine_1 = require("../CodeRefactoringEngine");
const PerformanceMonitor_1 = require("../PerformanceMonitor");
const ProjectWizard_1 = require("../ProjectWizard");
const IntegrationTests_1 = require("../tests/IntegrationTests");
const RefactoringExample_1 = require("./RefactoringExample");
const CollaborationExample_1 = require("./CollaborationExample");
const ToolIntegrationExample_1 = require("./ToolIntegrationExample");
/**
 * 完整演示系统
 */
class CompleteDemoSystem {
    config;
    workspaceRoot;
    demoDir;
    results = [];
    performanceMonitor;
    constructor(config) {
        this.config = {
            workspaceRoot: process.cwd(),
            outputDir: path.join(process.cwd(), 'demo-output'),
            cleanupTempFiles: true,
            performanceMonitoring: {
                enabled: true,
                interval: 1000,
            },
            modules: [
                { name: 'integration_tests', description: '集成测试验证', enabled: true, weight: 1 },
                { name: 'tool_integration', description: '工具集成演示', enabled: true, weight: 2 },
                { name: 'smart_completion', description: '智能代码补全', enabled: true, weight: 3 },
                { name: 'code_refactoring', description: '代码重构功能', enabled: true, weight: 4 },
                { name: 'collaboration', description: '协作功能', enabled: true, weight: 5 },
                { name: 'performance', description: '性能监控', enabled: true, weight: 6 },
                { name: 'project_wizard', description: '项目向导', enabled: true, weight: 7 },
                { name: 'complete_workflow', description: '完整工作流', enabled: true, weight: 8 },
            ],
            ...config,
        };
        this.workspaceRoot = this.config.workspaceRoot;
        this.demoDir = this.config.outputDir;
        // 创建演示目录
        if (!fs.existsSync(this.demoDir)) {
            fs.mkdirSync(this.demoDir, { recursive: true });
        }
        console.log('🚀 Complete Demo System Initialized');
        console.log(`   Workspace: ${this.workspaceRoot}`);
        console.log(`   Output Dir: ${this.demoDir}`);
    }
    /**
     * 运行完整演示
     */
    async runCompleteDemo() {
        console.log('\n' + '='.repeat(70));
        console.log('   QUERYENGINE ENHANCEMENT - COMPLETE DEMONSTRATION');
        console.log('='.repeat(70) + '\n');
        // 创建性能监控器
        if (this.config.performanceMonitoring.enabled) {
            this.performanceMonitor = (0, PerformanceMonitor_1.createPerformanceMonitor)({
                monitoringInterval: this.config.performanceMonitoring.interval,
                enableMemoryMonitoring: true,
                enableCpuMonitoring: true,
                thresholds: {
                    maxResponseTime: 2000,
                    maxMemoryUsage: 500,
                    maxErrorRate: 5,
                    minCacheHitRate: 70,
                },
                alerts: {
                    enabled: true,
                    onAlert: (alert) => {
                        console.log(`   🚨 Performance Alert: ${alert.message} (${alert.currentValue})`);
                    },
                },
            });
            this.performanceMonitor.start();
        }
        // 运行所有启用的模块
        for (const module of this.config.modules) {
            if (module.enabled) {
                await this.runModule(module);
            }
        }
        // 停止性能监控
        if (this.performanceMonitor) {
            this.performanceMonitor.stop();
            // 获取最终性能报告
            const performanceReport = this.performanceMonitor.getReport();
            this.results.push({
                module: 'performance_summary',
                success: true,
                startTime: new Date(),
                endTime: new Date(),
                duration: 0,
                details: performanceReport,
            });
        }
        // 生成总结报告
        await this.generateSummaryReport();
        // 清理临时文件
        if (this.config.cleanupTempFiles) {
            this.cleanupTempFiles();
        }
        console.log('\n' + '='.repeat(70));
        console.log('   DEMONSTRATION COMPLETED');
        console.log('='.repeat(70));
        return this.results;
    }
    /**
     * 运行单个模块
     */
    async runModule(module) {
        const startTime = new Date();
        console.log(`\n📋 Module ${module.weight}: ${module.name.toUpperCase()}`);
        console.log('─'.repeat(60));
        console.log(`   ${module.description}`);
        try {
            let result;
            switch (module.name) {
                case 'integration_tests':
                    result = await this.runIntegrationTests();
                    break;
                case 'tool_integration':
                    result = await this.runToolIntegrationDemo();
                    break;
                case 'smart_completion':
                    result = await this.runSmartCompletionDemo();
                    break;
                case 'code_refactoring':
                    result = await this.runRefactoringDemo();
                    break;
                case 'collaboration':
                    result = await this.runCollaborationDemo();
                    break;
                case 'performance':
                    result = await this.runPerformanceDemo();
                    break;
                case 'project_wizard':
                    result = await this.runProjectWizardDemo();
                    break;
                case 'complete_workflow':
                    result = await this.runCompleteWorkflowDemo();
                    break;
                default:
                    throw new Error(`Unknown module: ${module.name}`);
            }
            const endTime = new Date();
            const duration = endTime.getTime() - startTime.getTime();
            this.results.push({
                module: module.name,
                success: true,
                startTime,
                endTime,
                duration,
                details: result,
            });
            console.log(`✅ ${module.name} completed in ${duration}ms`);
        }
        catch (error) {
            const endTime = new Date();
            const duration = endTime.getTime() - startTime.getTime();
            this.results.push({
                module: module.name,
                success: false,
                startTime,
                endTime,
                duration,
                error: error.message,
            });
            console.error(`❌ ${module.name} failed: ${error.message}`);
        }
    }
    /**
     * 运行集成测试
     */
    async runIntegrationTests() {
        console.log('   Running comprehensive integration tests...');
        const integrationTests = new IntegrationTests_1.IntegrationTests(this.workspaceRoot);
        const results = await integrationTests.runAllTests();
        // 保存测试报告
        const reportPath = path.join(this.demoDir, 'integration-test-report.json');
        const report = {
            timestamp: new Date().toISOString(),
            results: results,
            summary: {
                totalTests: results.length,
                passedTests: results.filter(r => r.passed).length,
                failedTests: results.filter(r => !r.passed).length,
                successRate: (results.filter(r => r.passed).length / results.length) * 100,
            },
        };
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
        return {
            reportPath,
            summary: report.summary,
        };
    }
    /**
     * 运行工具集成演示
     */
    async runToolIntegrationDemo() {
        console.log('   Running tool integration demonstration...');
        const toolExample = new ToolIntegrationExample_1.ToolIntegrationExample(this.workspaceRoot);
        const results = await toolExample.runAllExamples();
        // 保存演示报告
        const reportPath = path.join(this.demoDir, 'tool-integration-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(results !== undefined ? results : [], null, 2), 'utf8');
        // 确保results是数组
        const resultsArray = Array.isArray(results) ? results : [];
        return {
            reportPath,
            totalExamples: resultsArray.length,
            successfulExamples: resultsArray.filter((r) => r.success).length,
        };
    }
    /**
     * 运行智能代码补全演示
     */
    async runSmartCompletionDemo() {
        console.log('   Demonstrating smart code completion...');
        // 创建测试文件
        const testFilePath = path.join(this.demoDir, 'completion-demo.ts');
        const testContent = `
// Smart completion demonstration
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

function processUser(user: User): string {
  // Try completing: user.
  return \`\${user.name} <\${user.email}>\`;
}

class UserService {
  private users: User[] = [];
  
  addUser(user: User): void {
    this.users.push(user);
  }
  
  findUserById(id: string): User | undefined {
    // Try completing: this.users.
    return this.users.find(u => u.id === id);
  }
}

// Import completion test
import * as path from 'path';
// Try completing: path.
`;
        fs.writeFileSync(testFilePath, testContent, 'utf8');
        // 创建智能代码补全器
        const completer = new SmartCodeCompleter_1.SmartCodeCompleter(this.workspaceRoot, {
            enableSmartSuggestions: true,
            enableErrorFixes: true,
            maxItems: 20,
            minConfidence: 0.3,
        });
        // 测试属性访问补全
        const propertyCompletion = await completer.getCompletions({
            filePath: testFilePath,
            cursorPosition: { line: 10, character: 12 }, // user. 之后
            currentLine: '  // Try completing: user.',
            fileContent: testContent,
            editorState: {
                languageId: 'typescript',
                isUntitled: false,
                hasSelection: false,
            },
        });
        // 测试导入补全
        const importCompletion = await completer.getCompletions({
            filePath: testFilePath,
            cursorPosition: { line: 26, character: 1 }, // path. 之后
            currentLine: '// Try completing: path.',
            fileContent: testContent,
            editorState: {
                languageId: 'typescript',
                isUntitled: false,
                hasSelection: false,
            },
        });
        return {
            propertyCompletion: {
                success: propertyCompletion.success,
                itemCount: propertyCompletion.items.length,
                sampleItems: propertyCompletion.items.slice(0, 5).map(item => ({
                    label: item.label,
                    type: item.type,
                    detail: item.detail?.substring(0, 50),
                })),
            },
            importCompletion: {
                success: importCompletion.success,
                itemCount: importCompletion.items.length,
                sampleItems: importCompletion.items.slice(0, 5).map(item => ({
                    label: item.label,
                    type: item.type,
                })),
            },
            testFile: testFilePath,
        };
    }
    /**
     * 运行代码重构演示
     */
    async runRefactoringDemo() {
        console.log('   Running refactoring demonstration...');
        // 使用现有的重构演示
        await (0, RefactoringExample_1.runRefactoringDemos)(this.demoDir);
        // 加载生成的报告
        const reportPath = path.join(this.demoDir, 'demo-reports', 'refactoring-demo-report.json');
        if (fs.existsSync(reportPath)) {
            const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
            return report;
        }
        return { note: 'Refactoring demo completed, report not found' };
    }
    /**
     * 运行协作功能演示
     */
    async runCollaborationDemo() {
        console.log('   Running collaboration demonstration...');
        // 使用现有的协作演示
        await (0, CollaborationExample_1.runCollaborationDemos)(this.demoDir);
        // 加载生成的报告
        const reportPath = path.join(this.demoDir, 'demo-reports', 'collaboration-demo-report.json');
        if (fs.existsSync(reportPath)) {
            const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
            return report;
        }
        return { note: 'Collaboration demo completed, report not found' };
    }
    /**
     * 运行性能监控演示
     */
    async runPerformanceDemo() {
        console.log('   Demonstrating performance monitoring...');
        if (!this.performanceMonitor) {
            return { note: 'Performance monitoring not enabled' };
        }
        // 模拟一些工作负载
        console.log('   Simulating workload for performance monitoring...');
        const fileEditor = new FileEditorTool_1.FileEditorTool();
        const codeAnalyzer = new CodeAnalysisTool_1.CodeAnalysisTool();
        // 创建测试文件
        const testFile = path.join(this.demoDir, 'performance-test.ts');
        const testContent = `
// Performance test file
function calculateSum(numbers: number[]): number {
  return numbers.reduce((sum, num) => sum + num, 0);
}

function processData(data: string[]): string[] {
  return data.map(item => item.toUpperCase());
}

class DataProcessor {
  process(items: any[]): any[] {
    return items.map(item => ({ ...item, processed: true }));
  }
}
`;
        fs.writeFileSync(testFile, testContent, 'utf8');
        // 记录一些性能事件
        this.performanceMonitor.recordToolExecution('file_edit', 150, true);
        this.performanceMonitor.recordToolExecution('code_analysis', 450, true);
        this.performanceMonitor.recordToolExecution('error_analysis', 1200, false, 'Timeout error');
        this.performanceMonitor.recordCacheHit();
        this.performanceMonitor.recordCacheHit();
        this.performanceMonitor.recordCacheMiss();
        this.performanceMonitor.recordError('test_error', 'Simulated error for monitoring');
        // 等待收集数据
        await new Promise(resolve => setTimeout(resolve, 2000));
        // 获取性能指标
        const metrics = this.performanceMonitor.getMetrics();
        const report = this.performanceMonitor.getReport();
        // 保存性能报告
        const reportPath = path.join(this.demoDir, 'performance-report.json');
        fs.writeFileSync(reportPath, JSON.stringify({
            timestamp: new Date().toISOString(),
            metrics,
            report,
        }, null, 2), 'utf8');
        return {
            reportPath,
            summary: report.summary,
            alerts: report.alerts.length,
            recommendations: report.recommendations,
        };
    }
    /**
     * 运行项目向导演示
     */
    async runProjectWizardDemo() {
        console.log('   Demonstrating project wizard...');
        const codeGenerator = new CodeGeneratorTool_1.CodeGeneratorTool();
        const fileEditor = new FileEditorTool_1.FileEditorTool();
        const codeAnalyzer = new CodeAnalysisTool_1.CodeAnalysisTool();
        const projectWizard = (0, ProjectWizard_1.createProjectWizard)(this.workspaceRoot, codeGenerator, fileEditor, codeAnalyzer, this.performanceMonitor, {
            templatesDir: path.join(this.demoDir, 'templates'),
            autoInitGit: false, // 简化演示，不初始化Git
            autoInstallDependencies: false, // 简化演示，不安装依赖
        });
        // 列出可用模板
        const templates = projectWizard.listTemplates();
        // 创建示例项目
        const projectOptions = {
            name: 'demo-project',
            description: 'Demonstration project created by Project Wizard',
            type: 'typescript',
            path: this.demoDir,
            author: {
                name: 'Demo User',
                email: 'demo@example.com',
            },
            license: 'MIT',
            version: '1.0.0',
            initGit: false,
            installDependencies: false,
            createReadme: true,
            createLicense: true,
        };
        console.log('   Creating demonstration project...');
        const creationResult = await projectWizard.createProject(projectOptions);
        // 验证项目结构
        const validationResult = await projectWizard.validateProjectStructure(path.join(this.demoDir, 'demo-project'));
        // 获取项目统计
        let projectStats = null;
        if (validationResult.valid) {
            projectStats = await projectWizard.getProjectStats(path.join(this.demoDir, 'demo-project'));
        }
        return {
            availableTemplates: templates.length,
            projectCreation: {
                success: creationResult.success,
                filesCreated: creationResult.createdFiles.length,
                performance: creationResult.performance,
            },
            projectValidation: validationResult,
            projectStats,
        };
    }
    /**
     * 运行完整工作流演示
     */
    async runCompleteWorkflowDemo() {
        console.log('   Demonstrating complete workflow...');
        // 创建一个完整的端到端工作流示例
        const workflowSteps = [];
        // 步骤1: 创建项目
        workflowSteps.push({
            step: 'project_creation',
            description: 'Create a new TypeScript project',
            startTime: new Date(),
        });
        const projectDir = path.join(this.demoDir, 'workflow-demo');
        const projectFiles = {
            'package.json': JSON.stringify({
                name: 'workflow-demo',
                version: '1.0.0',
                scripts: {
                    test: 'jest',
                    build: 'tsc',
                    dev: 'ts-node src/index.ts',
                },
            }, null, 2),
            'src/index.ts': `
// Main application file
interface User {
  id: string;
  name: string;
  email: string;
}

function getUserInfo(user: User): string {
  return \`\${user.name} <\${user.email}>\`;
}

const testUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
};

console.log(getUserInfo(testUser));
`,
            'src/utils.ts': `
// Utility functions
export function calculateTotal(items: number[]): number {
  let sum = 0;
  for (let i = 0; i < items.length; i++) {
    sum += items[i];
  }
  return sum;
}
`,
        };
        // 创建项目目录和文件
        if (!fs.existsSync(projectDir)) {
            fs.mkdirSync(projectDir, { recursive: true });
            fs.mkdirSync(path.join(projectDir, 'src'), { recursive: true });
            for (const [filePath, content] of Object.entries(projectFiles)) {
                fs.writeFileSync(path.join(projectDir, filePath), content, 'utf8');
            }
        }
        workflowSteps[workflowSteps.length - 1].endTime = new Date();
        // 步骤2: 代码分析
        workflowSteps.push({
            step: 'code_analysis',
            description: 'Analyze code quality and issues',
            startTime: new Date(),
        });
        const codeAnalyzer = new CodeAnalysisTool_1.CodeAnalysisTool();
        const analysisResult = await codeAnalyzer.execute({
            codePath: path.join(projectDir, 'src'),
            analysisType: 'directory',
            analyzers: ['quality', 'complexity'],
            analysisDepth: 'normal',
            includeFixes: true,
        }, {});
        workflowSteps[workflowSteps.length - 1].endTime = new Date();
        // 步骤3: 代码重构
        workflowSteps.push({
            step: 'code_refactoring',
            description: 'Refactor code for better quality',
            startTime: new Date(),
        });
        const fileEditor = new FileEditorTool_1.FileEditorTool();
        const refactoringEngine = (0, CodeRefactoringEngine_1.createCodeRefactoringEngine)(this.workspaceRoot, fileEditor, codeAnalyzer);
        // 重构utils.ts中的函数
        const utilsPath = path.join(projectDir, 'src/utils.ts');
        const refactorResult = await refactoringEngine.extractMethod(utilsPath, {
            lineStart: 3,
            lineEnd: 7,
            columnStart: 1,
            columnEnd: 1,
        }, 'sumArray', {
            createPreview: true,
            createBackup: true,
        });
        workflowSteps[workflowSteps.length - 1].endTime = new Date();
        // 步骤4: 代码生成
        workflowSteps.push({
            step: 'code_generation',
            description: 'Generate new code based on requirements',
            startTime: new Date(),
        });
        const codeGenerator = new CodeGeneratorTool_1.CodeGeneratorTool();
        const generatedCode = await codeGenerator.execute({
            description: 'User validation function that checks if email is valid and name is not empty',
            language: 'typescript',
            codeType: 'function',
            includeDocumentation: true,
            includeTests: false,
            complexity: 'simple',
        }, {});
        // 添加生成的代码到项目
        const generatedFilePath = path.join(projectDir, 'src/validation.ts');
        fs.writeFileSync(generatedFilePath, generatedCode.generatedCode, 'utf8');
        workflowSteps[workflowSteps.length - 1].endTime = new Date();
        // 步骤5: 测试运行
        workflowSteps.push({
            step: 'test_runner',
            description: 'Run tests and analyze results',
            startTime: new Date(),
        });
        const testRunner = new TestRunnerTool_1.TestRunnerTool();
        // 注意：这里简化了，实际项目中需要真正的测试文件
        console.log('   Note: Test runner step simplified for demonstration');
        workflowSteps[workflowSteps.length - 1].endTime = new Date();
        // 计算工作流统计
        const totalDuration = workflowSteps.reduce((sum, step) => {
            if (step.endTime && step.startTime) {
                const duration = step.endTime.getTime() - step.startTime.getTime();
                step.duration = duration;
                return sum + duration;
            }
            return sum;
        }, 0);
        return {
            workflowSteps,
            totalDuration,
            projectLocation: projectDir,
            analysisIssues: analysisResult.issueStats?.total || 0,
            refactoringSuccess: refactorResult.success,
            generatedCode: {
                success: generatedCode.success,
                linesOfCode: generatedCode.statistics?.linesOfCode || 0,
            },
        };
    }
    /**
     * 生成总结报告
     */
    async generateSummaryReport() {
        console.log('\n📊 Generating Summary Report');
        console.log('─'.repeat(60));
        const totalModules = this.results.length;
        const successfulModules = this.results.filter(r => r.success).length;
        const successRate = (successfulModules / totalModules) * 100;
        const totalDuration = this.results.reduce((sum, result) => sum + result.duration, 0);
        const report = {
            summary: {
                timestamp: new Date().toISOString(),
                workspaceRoot: this.workspaceRoot,
                demoDir: this.demoDir,
                totalModules,
                successfulModules,
                successRate: successRate.toFixed(1),
                totalDuration,
                averageDuration: totalDuration / totalModules,
                overallSuccess: successfulModules === totalModules,
            },
            moduleResults: this.results.map(result => ({
                module: result.module,
                success: result.success,
                duration: result.duration,
                error: result.error,
            })),
            performanceSummary: this.results.find(r => r.module === 'performance_summary')?.details?.summary,
            keyFindings: this.extractKeyFindings(),
            recommendations: this.generateRecommendations(),
        };
        // 保存报告
        const reportPath = path.join(this.demoDir, 'complete-demo-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
        // 生成可读的文本报告
        const textReport = this.generateTextReport(report);
        const textReportPath = path.join(this.demoDir, 'complete-demo-summary.txt');
        fs.writeFileSync(textReportPath, textReport, 'utf8');
        console.log(`\n📈 Demo Summary:`);
        console.log(`   Total Modules: ${totalModules}`);
        console.log(`   Successful: ${successfulModules}`);
        console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
        console.log(`   Total Duration: ${totalDuration}ms`);
        console.log(`   Reports saved to: ${reportPath}`);
        if (successRate === 100) {
            console.log('\n🎉 ALL DEMONSTRATIONS COMPLETED SUCCESSFULLY!');
        }
        else {
            console.log(`\n⚠️  ${totalModules - successfulModules} module(s) failed`);
            this.results
                .filter(r => !r.success)
                .forEach(r => {
                console.log(`   - ${r.module}: ${r.error}`);
            });
        }
    }
    /**
     * 提取关键发现
     */
    extractKeyFindings() {
        const findings = [];
        // 基于演示结果提取发现
        const integrationTestResult = this.results.find(r => r.module === 'integration_tests');
        if (integrationTestResult?.details?.summary) {
            const summary = integrationTestResult.details.summary;
            findings.push(`Integration tests: ${summary.passedTests}/${summary.totalTests} passed (${summary.successRate.toFixed(1)}% success rate)`);
        }
        const performanceResult = this.results.find(r => r.module === 'performance');
        if (performanceResult?.details?.summary) {
            const summary = performanceResult.details.summary;
            findings.push(`Performance monitoring: ${summary.totalRequests} requests, ${summary.errorRate.toFixed(1)}% error rate`);
        }
        const refactoringResult = this.results.find(r => r.module === 'code_refactoring');
        if (refactoringResult?.success) {
            findings.push('Code refactoring engine working correctly with safety validation');
        }
        const collaborationResult = this.results.find(r => r.module === 'collaboration');
        if (collaborationResult?.success) {
            findings.push('Collaboration engine supports code review and edit suggestions');
        }
        const projectWizardResult = this.results.find(r => r.module === 'project_wizard');
        if (projectWizardResult?.success) {
            findings.push('Project wizard can create complete projects with multiple templates');
        }
        // 总体发现
        const successfulCount = this.results.filter(r => r.success).length;
        findings.push(`Overall system: ${successfulCount}/${this.results.length} modules functional`);
        return findings.slice(0, 10); // 限制为10条发现
    }
    /**
     * 生成建议
     */
    generateRecommendations() {
        const recommendations = [];
        const failedModules = this.results.filter(r => !r.success);
        if (failedModules.length > 0) {
            recommendations.push(`Fix ${failedModules.length} failed module(s): ${failedModules.map(m => m.module).join(', ')}`);
        }
        // 基于演示结果的建议
        const performanceResult = this.results.find(r => r.module === 'performance');
        if (performanceResult?.details?.recommendations) {
            recommendations.push(...performanceResult.details.recommendations.slice(0, 3));
        }
        // 通用建议
        recommendations.push('Integrate with VS Code extension for seamless user experience');
        recommendations.push('Add more project templates for different frameworks and use cases');
        recommendations.push('Implement real-time collaboration with WebSocket support');
        recommendations.push('Create comprehensive documentation and tutorials');
        recommendations.push('Add user interface for configuring and managing tools');
        recommendations.push('Implement advanced caching for better performance');
        return recommendations.slice(0, 10); // 限制为10条建议
    }
    /**
     * 生成文本报告
     */
    generateTextReport(report) {
        return `QUERYENGINE ENHANCEMENT - COMPLETE DEMONSTRATION REPORT
================================================================

Report Generated: ${report.summary.timestamp}
Workspace: ${report.summary.workspaceRoot}
Demo Directory: ${report.summary.demoDir}

SUMMARY
================================================================
Total Modules: ${report.summary.totalModules}
Successful Modules: ${report.summary.successfulModules}
Success Rate: ${report.summary.successRate}%
Total Duration: ${report.summary.totalDuration}ms
Average Duration: ${report.summary.averageDuration.toFixed(1)}ms
Overall Status: ${report.summary.overallSuccess ? 'SUCCESS' : 'PARTIAL SUCCESS'}

MODULE RESULTS
================================================================
${report.moduleResults.map((result) => `${result.success ? '✅' : '❌'} ${result.module.padEnd(25)} ${result.duration}ms ${result.error ? `- ${result.error}` : ''}`).join('\n')}

KEY FINDINGS
================================================================
${report.keyFindings.map((finding, i) => ` ${i + 1}. ${finding}`).join('\n')}

RECOMMENDATIONS
================================================================
${report.recommendations.map((recommendation, i) => ` ${i + 1}. ${recommendation}`).join('\n')}

PERFORMANCE SUMMARY
================================================================
${report.performanceSummary ?
            `Total Requests: ${report.performanceSummary.totalRequests}
Average Response Time: ${report.performanceSummary.averageResponseTime.toFixed(2)}ms
Error Rate: ${report.performanceSummary.errorRate.toFixed(2)}%
Cache Hit Rate: ${report.performanceSummary.cacheHitRate.toFixed(2)}%
Uptime: ${report.performanceSummary.uptime.toFixed(1)} seconds`
            : 'Performance data not available'}

================================================================
END OF REPORT
`;
    }
    /**
     * 清理临时文件
     */
    cleanupTempFiles() {
        console.log('\n🧹 Cleaning up temporary files...');
        // 清理演示目录（保留报告）
        const keepFiles = [
            'integration-test-report.json',
            'tool-integration-report.json',
            'performance-report.json',
            'complete-demo-report.json',
            'complete-demo-summary.txt',
        ];
        if (fs.existsSync(this.demoDir)) {
            const files = fs.readdirSync(this.demoDir);
            for (const file of files) {
                if (!keepFiles.includes(file) && !file.includes('report') && !file.includes('-report')) {
                    const filePath = path.join(this.demoDir, file);
                    const stat = fs.statSync(filePath);
                    if (stat.isDirectory()) {
                        fs.rmSync(filePath, { recursive: true, force: true });
                    }
                    else {
                        fs.unlinkSync(filePath);
                    }
                }
            }
        }
        console.log('   Temporary files cleaned up');
    }
}
exports.CompleteDemoSystem = CompleteDemoSystem;
/**
 * 运行完整演示系统
 */
async function runCompleteDemoSystem(workspaceRoot, config) {
    const root = workspaceRoot || process.cwd();
    console.log('='.repeat(70));
    console.log('   QUERYENGINE ENHANCEMENT - COMPLETE DEMONSTRATION SYSTEM');
    console.log('='.repeat(70));
    try {
        const demoSystem = new CompleteDemoSystem({
            workspaceRoot: root,
            ...config,
        });
        const results = await demoSystem.runCompleteDemo();
        return results;
    }
    catch (error) {
        console.error(`❌ Complete demo system failed: ${error.message}`);
        throw error;
    }
}
exports.default = CompleteDemoSystem;
//# sourceMappingURL=CompleteDemoSystem.js.map