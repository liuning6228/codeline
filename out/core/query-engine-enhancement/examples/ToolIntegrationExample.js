"use strict";
/**
 * ToolIntegrationExample - 工具集成示例
 *
 * 演示如何使用编码工具集完成实际的编码任务
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
exports.ToolIntegrationExample = void 0;
exports.runToolIntegrationExamples = runToolIntegrationExamples;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const CodingToolsRegistrar_1 = require("../tools/CodingToolsRegistrar");
const EnhancedToolRegistry_1 = require("../../tool/EnhancedToolRegistry");
/**
 * 编码任务示例执行器
 */
class ToolIntegrationExample {
    workspaceRoot;
    toolRegistry;
    toolsRegistrar;
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        this.toolRegistry = new EnhancedToolRegistry_1.EnhancedToolRegistry();
        this.toolsRegistrar = new CodingToolsRegistrar_1.CodingToolsRegistrar(this.toolRegistry, {
            autoRegister: true,
            overwriteExisting: true,
            context: { workspaceRoot },
        });
    }
    /**
     * 初始化工具
     */
    async initialize() {
        try {
            console.log('🔧 Initializing coding tools...');
            // 注册所有编码工具
            const result = await this.toolsRegistrar.registerAllTools();
            if (!result.success) {
                console.error('Failed to register tools:', result.failed);
                return false;
            }
            console.log(`✅ Registered ${result.registered.length} tools: ${result.registered.join(', ')}`);
            // 验证工具可用性
            const validation = await this.toolsRegistrar.validateTools();
            const availableTools = validation.filter(t => t.available);
            const unavailableTools = validation.filter(t => !t.available);
            console.log(`📊 Tools available: ${availableTools.length}/${validation.length}`);
            if (unavailableTools.length > 0) {
                console.warn('⚠️ Unavailable tools:', unavailableTools.map(t => `${t.toolId}: ${t.issues.join(', ')}`));
            }
            return availableTools.length > 0;
        }
        catch (error) {
            console.error('Initialization failed:', error.message);
            return false;
        }
    }
    /**
     * 示例1：创建用户认证服务
     */
    async example1_createAuthService() {
        console.log('\n📝 Example 1: Creating User Authentication Service');
        try {
            // 1. 生成用户模型
            console.log('1. Generating User model...');
            const userModelPath = path.join(this.workspaceRoot, 'src', 'models', 'User.ts');
            await this.createUserModel(userModelPath);
            // 2. 生成认证服务
            console.log('2. Generating Auth service...');
            const authServicePath = path.join(this.workspaceRoot, 'src', 'services', 'AuthService.ts');
            await this.createAuthService(authServicePath);
            // 3. 生成测试
            console.log('3. Generating tests...');
            const testPath = path.join(this.workspaceRoot, 'src', 'services', '__tests__', 'AuthService.test.ts');
            await this.createAuthTests(testPath);
            // 4. 分析代码质量
            console.log('4. Analyzing code quality...');
            await this.analyzeCodeQuality();
            console.log('✅ Example 1 completed successfully!');
            console.log(`   Created: ${userModelPath}`);
            console.log(`   Created: ${authServicePath}`);
            console.log(`   Created: ${testPath}`);
        }
        catch (error) {
            console.error('Example 1 failed:', error.message);
        }
    }
    /**
     * 示例2：调试和修复代码问题
     */
    async example2_debugAndFix() {
        console.log('\n🐛 Example 2: Debugging and Fixing Code Issues');
        try {
            // 1. 创建一个有问题的文件
            console.log('1. Creating problematic file...');
            const problematicFilePath = path.join(this.workspaceRoot, 'src', 'problematic.ts');
            await this.createProblematicFile(problematicFilePath);
            // 2. 分析错误
            console.log('2. Analyzing errors...');
            const errorAnalysis = await this.analyzeErrors(problematicFilePath);
            // 3. 应用修复
            console.log('3. Applying fixes...');
            if (errorAnalysis && errorAnalysis.fixes.quickFixes.length > 0) {
                await this.applyFixes(problematicFilePath, errorAnalysis.fixes.quickFixes[0]);
            }
            // 4. 验证修复
            console.log('4. Verifying fixes...');
            await this.verifyFixes(problematicFilePath);
            console.log('✅ Example 2 completed successfully!');
        }
        catch (error) {
            console.error('Example 2 failed:', error.message);
        }
    }
    /**
     * 示例3：运行测试和分析结果
     */
    async example3_runTests() {
        console.log('\n🧪 Example 3: Running Tests and Analyzing Results');
        try {
            // 1. 确保测试文件存在
            console.log('1. Ensuring test files exist...');
            const testFilePath = path.join(this.workspaceRoot, 'src', 'services', '__tests__', 'AuthService.test.ts');
            if (!fs.existsSync(testFilePath)) {
                console.log('   Creating test file first...');
                await this.createAuthTests(testFilePath);
            }
            // 2. 运行测试
            console.log('2. Running tests...');
            const testResults = await this.runTests();
            // 3. 分析测试结果
            console.log('3. Analyzing test results...');
            await this.analyzeTestResults(testResults);
            console.log('✅ Example 3 completed successfully!');
        }
        catch (error) {
            console.error('Example 3 failed:', error.message);
        }
    }
    // ==================== 私有方法 ====================
    /**
     * 创建用户模型
     */
    async createUserModel(filePath) {
        const tool = this.toolsRegistrar.getToolInstance('code_generator');
        if (!tool) {
            throw new Error('CodeGeneratorTool not available');
        }
        // 确保目录存在
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const result = await tool.execute({
            description: 'TypeScript User model with id, email, name, createdAt, and updatedAt fields',
            language: 'typescript',
            codeType: 'class',
            targetFilePath: filePath,
            style: 'oop',
            includeDocumentation: true,
            complexity: 'simple',
        });
        console.log(`   Generated ${result.statistics.linesOfCode} lines of code`);
    }
    /**
     * 创建认证服务
     */
    async createAuthService(filePath) {
        const tool = this.toolsRegistrar.getToolInstance('code_generator');
        if (!tool) {
            throw new Error('CodeGeneratorTool not available');
        }
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const result = await tool.execute({
            description: 'TypeScript authentication service with login, register, logout, and validateToken methods',
            language: 'typescript',
            codeType: 'class',
            targetFilePath: filePath,
            style: 'oop',
            includeDocumentation: true,
            includeTests: false, // 测试单独生成
            complexity: 'moderate',
            constraints: [
                'Use async/await for all methods',
                'Include proper error handling',
                'Follow TypeScript best practices',
            ],
        });
        console.log(`   Generated ${result.statistics.linesOfCode} lines of code`);
    }
    /**
     * 创建认证测试
     */
    async createAuthTests(filePath) {
        const tool = this.toolsRegistrar.getToolInstance('code_generator');
        if (!tool) {
            throw new Error('CodeGeneratorTool not available');
        }
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const result = await tool.execute({
            description: 'Jest tests for AuthService with unit tests for login, register, and token validation',
            language: 'typescript',
            codeType: 'test',
            targetFilePath: filePath,
            style: 'functional',
            includeDocumentation: true,
            includeExamples: true,
            complexity: 'moderate',
        });
        console.log(`   Generated ${result.statistics.linesOfCode} lines of code, ${result.statistics.functions} test functions`);
    }
    /**
     * 分析代码质量
     */
    async analyzeCodeQuality() {
        const tool = this.toolsRegistrar.getToolInstance('code_analyzer');
        if (!tool) {
            throw new Error('CodeAnalysisTool not available');
        }
        const result = await tool.execute({
            codePath: path.join(this.workspaceRoot, 'src'),
            analysisType: 'directory',
            analyzers: ['quality', 'complexity', 'style'],
            analysisDepth: 'normal',
            includeFixes: true,
            calculateMetrics: true,
        });
        console.log(`   Code quality: ${result.quality}`);
        console.log(`   Issues found: ${result.issueStats.total}`);
        console.log(`   Maintainability index: ${result.metrics.quality.maintainabilityIndex.toFixed(1)}`);
        if (result.fixSummary) {
            console.log(`   Quick wins: ${result.fixSummary.quickWins.length}`);
        }
    }
    /**
     * 创建有问题的文件
     */
    async createProblematicFile(filePath) {
        const problematicCode = `
// Problematic TypeScript file with common errors

function calculateTotal(items) {
  let total = 0;
  
  // Missing type annotation
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  
  return total;
}

// Unsafe type casting
function unsafeCast(value: any): string {
  return value;  // TypeScript error: any to string
}

// Potential null reference
function getUserName(user) {
  return user.name.toUpperCase();  // user might be null/undefined
}

// Console.log in production code
function processData(data) {
  console.log('Processing:', data);
  return data * 2;
}

// Missing error handling
async function fetchData(url) {
  const response = fetch(url);
  const data = await response.json();
  return data;
}
`;
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, problematicCode, 'utf8');
        console.log(`   Created problematic file: ${filePath}`);
    }
    /**
     * 分析错误
     */
    async analyzeErrors(filePath) {
        const tool = this.toolsRegistrar.getToolInstance('debug_analyzer');
        if (!tool) {
            throw new Error('DebugAnalyzerTool not available');
        }
        // 读取文件内容作为错误输入（模拟）
        const content = fs.readFileSync(filePath, 'utf8');
        const result = await tool.execute({
            errorInput: content,
            targetFilePath: filePath,
            errorType: 'type_error', // 主要类型错误
            language: 'typescript',
            analyzeStacktrace: false,
            provideFixes: true,
            analysisDepth: 'normal',
        });
        console.log(`   Error type: ${result.errorType}, Severity: ${result.severity}`);
        console.log(`   Root cause: ${result.rootCause.mostLikelyCause}`);
        console.log(`   Fixes generated: ${result.fixes.quickFixes.length}`);
        return result;
    }
    /**
     * 应用修复
     */
    async applyFixes(filePath, fix) {
        const tool = this.toolsRegistrar.getToolInstance('file_editor');
        if (!tool) {
            throw new Error('FileEditorTool not available');
        }
        console.log(`   Applying fix: ${fix.description}`);
        // 这里简化：实际应该根据fix的内容进行编辑
        // 示例：添加类型注解
        const result = await tool.execute({
            operation: 'insert',
            filePath: filePath,
            location: {
                filePath: filePath,
                lineStart: 3,
                lineEnd: 3,
            },
            newCode: '// Type annotation added by CodeMaster\nfunction calculateTotal(items: Array<{ price: number }>): number {',
            createBackup: true,
            validateSyntax: true,
            formatAfterEdit: true,
        });
        if (result.success) {
            console.log(`   Fix applied successfully: ${result.changes.size.linesAdded} lines added`);
        }
        else {
            console.warn(`   Fix application failed: ${result.error}`);
        }
    }
    /**
     * 验证修复
     */
    async verifyFixes(filePath) {
        const tool = this.toolsRegistrar.getToolInstance('code_analyzer');
        if (!tool) {
            throw new Error('CodeAnalysisTool not available');
        }
        const result = await tool.execute({
            codePath: filePath,
            analysisType: 'file',
            analyzers: ['quality', 'style'],
            analysisDepth: 'shallow',
            includeFixes: true,
        });
        console.log(`   Post-fix quality: ${result.quality}`);
        console.log(`   Remaining issues: ${result.issueStats.total}`);
    }
    /**
     * 运行测试
     */
    async runTests() {
        const tool = this.toolsRegistrar.getToolInstance('test_runner');
        if (!tool) {
            throw new Error('TestRunnerTool not available');
        }
        const result = await tool.execute({
            testPath: path.join(this.workspaceRoot, 'src', '**', '*.test.ts'),
            framework: 'jest',
            workingDirectory: this.workspaceRoot,
            calculateCoverage: true,
            runInParallel: true,
            verbose: false,
        });
        console.log(`   Tests run: ${result.overallStats.totalTests}`);
        console.log(`   Passed: ${result.overallStats.passedTests}, Failed: ${result.overallStats.failedTests}`);
        console.log(`   Pass rate: ${result.overallStats.overallPassRate.toFixed(1)}%`);
        return result;
    }
    /**
     * 分析测试结果
     */
    async analyzeTestResults(testResults) {
        console.log('   Test analysis completed');
        if (testResults.failureAnalysis) {
            console.log(`   Failed tests: ${testResults.failureAnalysis.failedTests.length}`);
            if (testResults.failureAnalysis.failedTests.length > 0) {
                console.log('   First failed test:', testResults.failureAnalysis.failedTests[0].name);
            }
        }
        if (testResults.coverage?.available) {
            const coverage = testResults.coverage.summary;
            console.log(`   Coverage: Lines ${coverage?.lines?.percentage?.toFixed(1) || 0}%`);
        }
        if (testResults.performanceAnalysis) {
            console.log(`   Slow tests: ${testResults.performanceAnalysis.slowestTests.length}`);
        }
    }
    /**
     * 运行所有示例
     */
    async runAllExamples() {
        console.log('🚀 Starting Coding Tools Integration Examples\n');
        // 初始化工具
        const initialized = await this.initialize();
        if (!initialized) {
            console.error('Failed to initialize tools');
            return;
        }
        // 运行示例
        await this.example1_createAuthService();
        await this.example2_debugAndFix();
        await this.example3_runTests();
        console.log('\n🎉 All examples completed!');
        console.log('The coding tools are ready for integration into CodeMasterQueryEngine.');
    }
}
exports.ToolIntegrationExample = ToolIntegrationExample;
/**
 * 运行示例的主函数
 */
async function runToolIntegrationExamples(workspaceRoot) {
    const root = workspaceRoot || process.cwd();
    console.log('========================================');
    console.log('   Coding Tools Integration Demo');
    console.log('========================================\n');
    const example = new ToolIntegrationExample(root);
    await example.runAllExamples();
    console.log('\n========================================');
    console.log('   Demo Completed Successfully');
    console.log('========================================');
}
// 如果直接运行此文件
if (require.main === module) {
    runToolIntegrationExamples().catch(console.error);
}
exports.default = ToolIntegrationExample;
//# sourceMappingURL=ToolIntegrationExample.js.map