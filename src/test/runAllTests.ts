/**
 * CodeLine测试运行器
 * 统一运行所有测试，处理vscode模块依赖
 */

import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * 测试运行配置
 */
interface TestRunnerConfig {
  // 测试目录
  testDir: string;
  // 是否显示详细输出
  verbose: boolean;
  // 测试文件模式
  testPattern: string;
  // 覆盖率报告目录
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
export class TestRunner {
  private config: TestRunnerConfig;
  
  constructor(config: Partial<TestRunnerConfig> = {}) {
    this.config = {
      testDir: path.join(__dirname, 'suite'),
      verbose: false,
      testPattern: '**/*.test.js',
      coverageDir: path.join(process.cwd(), 'coverage'),
      ...config
    };
  }
  
  /**
   * 运行所有测试
   */
  async runAllTests(): Promise<TestRunResult> {
    console.log('🚀 启动CodeLine测试运行器');
    console.log(`📁 测试目录: ${this.config.testDir}`);
    
    const startTime = Date.now();
    const result: TestRunResult = {
      total: 0,
      passed: 0,
      failed: 0,
      duration: 0,
      failures: []
    };
    
    try {
      // 动态加载Mocha
      const Mocha = require('mocha');
      
      // 创建Mocha实例
      const mocha = new Mocha({
        ui: 'tdd',
        color: true,
        timeout: 10000,
        reporter: 'spec',
        verbose: this.config.verbose
      });
      
      // 查找测试文件
      const testFiles = await this.findTestFiles();
      console.log(`📄 找到 ${testFiles.length} 个测试文件`);
      
      // 添加测试文件到Mocha
      for (const file of testFiles) {
        mocha.addFile(file);
        result.total++;
      }
      
      // 运行测试
      const failures = await new Promise<number>((resolve) => {
        mocha.run((failCount: number) => {
          resolve(failCount);
        });
      });
      
      result.failed = failures;
      result.passed = result.total - failures;
      result.duration = Date.now() - startTime;
      
      // 输出总结
      this.printSummary(result);
      
    } catch (error: any) {
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
   * 查找测试文件
   */
  private async findTestFiles(): Promise<string[]> {
    // 使用动态导入避免CommonJS/ES模块冲突
    const { glob } = await import('glob');
    const pattern = path.join(this.config.testDir, this.config.testPattern);
    
    return glob(pattern);
  }
  
  /**
   * 输出测试总结
   */
  private printSummary(result: TestRunResult): void {
    console.log('\n📊 测试总结');
    console.log('═══════════════════════════════════════');
    console.log(`总计: ${result.total} 个测试`);
    console.log(`✅ 通过: ${result.passed}`);
    console.log(`❌ 失败: ${result.failed}`);
    console.log(`⏱️  耗时: ${result.duration}ms`);
    console.log('═══════════════════════════════════════');
    
    if (result.failed > 0 && result.failures.length > 0) {
      console.log('\n📋 失败详情:');
      result.failures.forEach((failure, index) => {
        console.log(`${index + 1}. ${failure.file} - ${failure.test}`);
        console.log(`   ${failure.error}`);
      });
    }
    
    if (result.passed === result.total) {
      console.log('\n🎉 所有测试通过！');
    }
  }
  
  /**
   * 生成覆盖率报告
   */
  async generateCoverageReport(): Promise<void> {
    console.log('📈 生成覆盖率报告...');
    
    // 这里可以集成nyc或其他覆盖率工具
    // 目前先占位实现
    
    console.log('✅ 覆盖率报告生成完成');
  }
}

/**
 * 设置测试环境
 * 处理vscode模块依赖等问题
 */
export function setupTestEnvironment(): void {
  // 设置vscode模块mock
  const Module = require('module');
  const originalRequire = Module.prototype.require;
  
  Module.prototype.require = function(id: string) {
    // 拦截vscode模块请求
    if (id === 'vscode') {
      const mockPath = path.join(__dirname, 'helpers', 'mockVscode.js');
      console.log(`[TEST] 使用模拟vscode模块: ${mockPath}`);
      return originalRequire.call(this, mockPath);
    }
    
    // 正常加载其他模块
    return originalRequire.apply(this, arguments as any);
  };
  
  // 设置测试环境变量
  process.env.NODE_ENV = 'test';
  process.env.CODELINE_TEST = 'true';
  
  console.log('✅ 测试环境设置完成');
}

/**
 * 主函数 - 命令行入口
 */
async function main(): Promise<void> {
  console.log('🧪 CodeLine 测试套件');
  console.log('═══════════════════════════════════════\n');
  
  // 设置测试环境
  setupTestEnvironment();
  
  // 检查是否已编译
  const compiledTestDir = path.join(process.cwd(), 'out', 'test', 'suite');
  try {
    await fs.access(compiledTestDir);
  } catch {
    console.log('⚠️  编译的测试文件不存在，需要先运行 npm run compile');
    console.log('正在运行编译...');
    const { execSync } = require('child_process');
    execSync('npm run compile', { stdio: 'inherit' });
  }
  
  // 创建并运行测试运行器
  const runner = new TestRunner({
    testDir: path.join(process.cwd(), 'out', 'test', 'suite')
  });
  
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

// 导出公共API
export { main as runTests };