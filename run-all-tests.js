/**
 * 运行所有CodeLine测试套件的统一脚本
 * 生成完整测试报告
 */

console.log('🚀 启动CodeLine全量测试运行器');
console.log('═══════════════════════════════════════\n');

// 设置vscode模块mock
const Module = require('module');
const originalRequire = Module.prototype.require;

// 导入mockVscode
const { mockVscode } = require('./out/test/helpers/mockVscode.js');

// 拦截vscode模块请求
Module.prototype.require = function(id) {
  if (id === 'vscode') {
    return mockVscode;
  }
  
  // 正常加载其他模块
  return originalRequire.apply(this, arguments);
};

// 设置测试环境变量
process.env.NODE_ENV = 'test';

// 测试结果汇总
const testResults = {
  totalSuites: 0,
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  suites: []
};

// 动态加载Mocha
try {
  const Mocha = require('mocha');
  
  // 定义要运行的测试套件
  const testSuites = [
    {
      name: 'FileManager单元测试',
      file: './out/test/suite/fileManager.test.js',
      description: '文件管理器核心操作测试'
    },
    {
      name: 'TaskEngine单元测试',
      file: './out/test/suite/taskEngine.test.js',
      description: '任务引擎流程测试'
    },
    {
      name: 'ChatPanel单元测试',
      file: './out/test/suite/chatPanel.test.js',
      description: '聊天面板基础功能测试'
    },
    {
      name: 'Extension综合测试v2',
      file: './out/test/suite/extension-comprehensive-v2.test.js',
      description: '扩展主入口全面测试'
    },
    {
      name: 'Extension基础测试',
      file: './out/test/suite/extension.test.js',
      description: '扩展激活与命令注册测试'
    }
  ];
  
  // 按顺序运行每个测试套件
  async function runTestSuite(suite) {
    console.log(`🧪 开始运行: ${suite.name}`);
    console.log(`   ${suite.description}`);
    
    // 创建独立的Mocha实例
    const mocha = new Mocha({
      ui: 'tdd',
      color: false, // 禁用颜色以便捕获输出
      timeout: 10000,
      reporter: function(runner) {
        const stats = runner.stats;
        
        // 捕获测试结果
        const suiteResult = {
          name: suite.name,
          file: suite.file,
          total: stats.tests || 0,
          passed: stats.passes || 0,
          failed: stats.failures || 0,
          duration: stats.duration || 0,
          failures: []
        };
        
        runner.on('pass', function(test) {
          // 测试通过
        });
        
        runner.on('fail', function(test, err) {
          suiteResult.failures.push({
            title: test.title,
            error: err.message,
            stack: err.stack
          });
        });
        
        runner.on('end', function() {
          testResults.totalSuites++;
          testResults.totalTests += suiteResult.total;
          testResults.passedTests += suiteResult.passed;
          testResults.failedTests += suiteResult.failed;
          testResults.suites.push(suiteResult);
          
          // 显示套件结果
          let statusSymbol = '✅';
          if (suiteResult.failed > 0) statusSymbol = '❌';
          if (suiteResult.total === 0) statusSymbol = '⚠️';
          
          console.log(`   ${statusSymbol} ${suiteResult.passed}/${suiteResult.total} 通过 (${suiteResult.duration}ms)`);
          
          if (suiteResult.failed > 0) {
            console.log('   失败测试:');
            suiteResult.failures.forEach((failure, index) => {
              console.log(`     ${index + 1}. ${failure.title}`);
              console.log(`       错误: ${failure.error}`);
            });
          }
          console.log('');
        });
      }
    });
    
    // 添加测试文件
    mocha.addFile(suite.file);
    
    // 运行测试
    return new Promise((resolve) => {
      mocha.run(() => {
        resolve();
      });
    });
  }
  
  // 运行所有测试套件
  async function runAllSuites() {
    for (const suite of testSuites) {
      try {
        await runTestSuite(suite);
      } catch (error) {
        console.error(`❌ 运行测试套件失败: ${suite.name}`);
        console.error(`   错误: ${error.message}`);
        console.log('');
        
        // 记录失败套件
        testResults.suites.push({
          name: suite.name,
          file: suite.file,
          total: 0,
          passed: 0,
          failed: 1,
          duration: 0,
          failures: [{ title: '套件加载失败', error: error.message, stack: error.stack }]
        });
        testResults.totalSuites++;
        testResults.failedTests++;
      }
    }
    
    // 生成汇总报告
    generateSummaryReport();
  }
  
  // 生成汇总报告
  function generateSummaryReport() {
    console.log('\n═══════════════════════════════════════');
    console.log('📊 CODILINE测试套件完整报告');
    console.log('═══════════════════════════════════════\n');
    
    // 总体统计
    const passRate = testResults.totalTests > 0 
      ? ((testResults.passedTests / testResults.totalTests) * 100).toFixed(1)
      : '0.0';
    
    console.log('📈 总体统计:');
    console.log(`   测试套件: ${testResults.totalSuites}`);
    console.log(`   总测试数: ${testResults.totalTests}`);
    console.log(`   通过测试: ${testResults.passedTests}`);
    console.log(`   失败测试: ${testResults.failedTests}`);
    console.log(`   通过率: ${passRate}%\n`);
    
    // 套件详情
    console.log('🔍 测试套件详情:');
    testResults.suites.forEach((suite, index) => {
      const suitePassRate = suite.total > 0 ? ((suite.passed / suite.total) * 100).toFixed(1) : '0.0';
      let statusSymbol = '✅';
      if (suite.failed > 0) statusSymbol = '❌';
      if (suite.total === 0) statusSymbol = '⚠️';
      
      console.log(`   ${index + 1}. ${statusSymbol} ${suite.name}`);
      console.log(`      通过率: ${suite.passed}/${suite.total} (${suitePassRate}%)`);
      console.log(`      耗时: ${suite.duration}ms`);
      console.log(`      文件: ${suite.file}`);
      if (suite.failures.length > 0) {
        console.log(`      失败: ${suite.failures.length}个`);
      }
    });
    
    // 测试覆盖率估算
    console.log('\n🎯 测试覆盖率估算:');
    const modules = [
      { name: 'FileManager', tests: testResults.suites.find(s => s.name.includes('FileManager'))?.passed || 0, lines: 450 },
      { name: 'TaskEngine', tests: testResults.suites.find(s => s.name.includes('TaskEngine'))?.passed || 0, lines: 320 },
      { name: 'ChatPanel', tests: testResults.suites.find(s => s.name.includes('ChatPanel'))?.passed || 0, lines: 2021 },
      { name: 'Extension', tests: testResults.suites.find(s => s.name.includes('Extension'))?.passed || 0, lines: 467 }
    ];
    
    modules.forEach(module => {
      // 简单估算：每个测试覆盖约15-20行代码（这是粗略估计）
      const estimatedCoverage = module.tests * 18; // 平均每个测试18行
      const coveragePercent = module.lines > 0 ? Math.min((estimatedCoverage / module.lines) * 100, 100).toFixed(1) : '0.0';
      console.log(`   ${module.name}: ${module.tests}个测试，约${coveragePercent}%覆盖率`);
    });
    
    // 总体覆盖率估算
    const totalLines = modules.reduce((sum, m) => sum + m.lines, 0);
    const totalCovered = modules.reduce((sum, m) => sum + (m.tests * 18), 0);
    const overallCoverage = totalLines > 0 ? Math.min((totalCovered / totalLines) * 100, 100).toFixed(1) : '0.0';
    console.log(`\n   总体估算覆盖率: ${overallCoverage}%`);
    
    // 建议
    console.log('\n💡 建议与下一步:');
    if (testResults.failedTests > 0) {
      console.log(`   1. 修复${testResults.failedTests}个失败的测试`);
      console.log('   2. 检查失败测试的具体错误信息');
    } else {
      console.log('   1. 所有测试通过，可以继续下一步开发');
    }
    
    if (parseFloat(overallCoverage) < 70) {
      console.log(`   2. 当前估算覆盖率${overallCoverage}%，建议提升至70%以上`);
    }
    
    // 根据结果决定退出码
    if (testResults.failedTests > 0) {
      console.log('\n❌ 测试运行完成，但有失败测试');
      process.exit(1);
    } else {
      console.log('\n🎉 所有测试通过！');
      process.exit(0);
    }
  }
  
  // 开始运行
  console.log('📋 测试套件列表:');
  testSuites.forEach((suite, index) => {
    console.log(`   ${index + 1}. ${suite.name}`);
  });
  console.log('');
  
  runAllSuites();
  
} catch (error) {
  console.error('❌ 测试运行器初始化失败:', error.message);
  console.error(error.stack);
  process.exit(1);
}