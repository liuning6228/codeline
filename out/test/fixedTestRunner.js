"use strict";
/**
 * 修复的测试运行器
 * 使用子进程运行Mocha，避免全局变量和模块注入问题
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
exports.FixedTestRunner = void 0;
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const fs = __importStar(require("fs/promises"));
/**
 * 修复的测试运行器
 */
class FixedTestRunner {
    testDir;
    constructor(testDir) {
        this.testDir = testDir || path.join(process.cwd(), 'out', 'test', 'suite');
    }
    /**
     * 运行所有测试
     */
    async runAllTests() {
        console.log('🚀 启动修复的测试运行器');
        console.log(`📁 测试目录: ${this.testDir}`);
        const startTime = Date.now();
        const result = {
            total: 0,
            passed: 0,
            failed: 0,
            duration: 0,
            failures: []
        };
        try {
            // 查找所有测试文件
            const testFiles = await this.findTestFiles();
            console.log(`📄 找到 ${testFiles.length} 个测试文件`);
            result.total = testFiles.length;
            // 为每个测试文件设置环境并运行
            let passed = 0;
            let failed = 0;
            const failures = [];
            for (const file of testFiles) {
                const fileResult = await this.runTestFile(file);
                if (fileResult.passed) {
                    passed++;
                }
                else {
                    failed++;
                    failures.push(...fileResult.failures);
                }
            }
            result.passed = passed;
            result.failed = failed;
            result.failures = failures;
            result.duration = Date.now() - startTime;
            // 输出总结
            this.printSummary(result);
        }
        catch (error) {
            console.error('❌ 测试运行失败:', error.message);
            result.failed = 1;
            result.failures.push({
                file: 'TestRunner',
                test: 'setup',
                error: error.message
            });
        }
        return result;
    }
    /**
     * 运行单个测试文件
     */
    async runTestFile(testFile) {
        console.log(`\n▶️  运行测试: ${path.basename(testFile)}`);
        // 设置脚本路径 - 使用源文件路径
        const setupScript = path.join(process.cwd(), 'src', 'test', 'setupTestEnv.js');
        return new Promise((resolve) => {
            // 创建子进程运行Mocha
            const mochaProcess = (0, child_process_1.spawn)('npx', [
                'mocha',
                '--ui', 'tdd',
                '--timeout', '10000',
                '--reporter', 'spec',
                '--require', setupScript,
                testFile
            ], {
                stdio: ['inherit', 'pipe', 'pipe'],
                env: {
                    ...process.env,
                    NODE_ENV: 'test',
                    CODELINE_TEST: 'true'
                }
            });
            let stdout = '';
            let stderr = '';
            mochaProcess.stdout?.on('data', (data) => {
                const output = data.toString();
                stdout += output;
                process.stdout.write(output);
            });
            mochaProcess.stderr?.on('data', (data) => {
                const output = data.toString();
                stderr += output;
                process.stderr.write(output);
            });
            mochaProcess.on('close', (code) => {
                const passed = code === 0;
                const result = {
                    file: testFile,
                    passed,
                    failures: []
                };
                if (!passed) {
                    result.failures.push({
                        file: testFile,
                        test: 'all',
                        error: `退出码: ${code}\n${stderr}`
                    });
                }
                resolve(result);
            });
            mochaProcess.on('error', (error) => {
                console.error(`❌ 无法启动测试进程: ${error.message}`);
                resolve({
                    file: testFile,
                    passed: false,
                    failures: [{
                            file: testFile,
                            test: 'process',
                            error: error.message
                        }]
                });
            });
        });
    }
    /**
     * 查找测试文件
     */
    async findTestFiles() {
        const files = [];
        try {
            const entries = await fs.readdir(this.testDir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isFile() && entry.name.endsWith('.test.js')) {
                    files.push(path.join(this.testDir, entry.name));
                }
            }
            // 按文件名排序，确保一致的执行顺序
            files.sort();
        }
        catch (error) {
            console.error(`❌ 无法读取测试目录 ${this.testDir}:`, error);
        }
        return files;
    }
    /**
     * 输出测试总结
     */
    printSummary(result) {
        console.log('\n📊 测试总结');
        console.log('═══════════════════════════════════════');
        console.log(`总计: ${result.total} 个测试文件`);
        console.log(`✅ 通过: ${result.passed}`);
        console.log(`❌ 失败: ${result.failed}`);
        console.log(`⏱️  耗时: ${result.duration}ms`);
        console.log('═══════════════════════════════════════');
        if (result.failed > 0 && result.failures.length > 0) {
            console.log('\n📋 失败详情:');
            result.failures.forEach((failure, index) => {
                console.log(`${index + 1}. ${path.basename(failure.file)} - ${failure.test}`);
                if (failure.error) {
                    console.log(`   ${failure.error.substring(0, 200)}${failure.error.length > 200 ? '...' : ''}`);
                }
            });
        }
        if (result.passed === result.total) {
            console.log('\n🎉 所有测试通过！');
        }
    }
}
exports.FixedTestRunner = FixedTestRunner;
/**
 * 主函数
 */
async function main() {
    console.log('🧪 CodeLine 修复测试运行器');
    console.log('═══════════════════════════════════════\n');
    // 检查是否已编译
    const compiledTestDir = path.join(process.cwd(), 'out', 'test', 'suite');
    try {
        await fs.access(compiledTestDir);
    }
    catch {
        console.log('⚠️  编译的测试文件不存在，需要先运行 npm run compile');
        console.log('正在运行编译...');
        const { execSync } = require('child_process');
        execSync('npm run compile', { stdio: 'inherit' });
    }
    // 创建并运行测试运行器
    const runner = new FixedTestRunner();
    const result = await runner.runAllTests();
    // 根据测试结果退出
    process.exit(result.failed > 0 ? 1 : 0);
}
// 如果是直接运行此脚本
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 测试运行失败:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=fixedTestRunner.js.map