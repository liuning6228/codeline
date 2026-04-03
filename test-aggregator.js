/**
 * 测试聚合器：运行所有专门的测试运行器并生成报告
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 启动CodeLine测试聚合器');
console.log('═══════════════════════════════════════\n');

// 测试套件配置
const testSuites = [
  {
    name: 'FileManager单元测试',
    runner: './run-filemanager-tests.js',
    description: '文件管理器核心操作测试',
    enabled: true
  },
  {
    name: 'TaskEngine单元测试',
    runner: './run-taskengine-test.js',
    description: '任务引擎流程测试',
    enabled: true
  },
  {
    name: 'ChatPanel单元测试',
    runner: './run-chatpanel-test-fixed.js',
    description: '聊天面板基础功能测试',
    enabled: true
  },
  {
    name: 'Extension综合测试v2',
    runner: './run-extension-v2-test.js',
    description: '扩展主入口全面测试',
    enabled: true
  },
  {
    name: 'Extension基础测试',
    runner: './run-extension-test.js',
    description: '扩展激活与命令注册测试',
    enabled: true
  }
];

// 测试结果汇总
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  suites: []
};

// 运行单个测试套件
function runTestSuite(suite) {
  return new Promise((resolve) => {
    console.log(`🧪 开始运行: ${suite.name}`);
    console.log(`   ${suite.description}`);
    
    const startTime = Date.now();
    
    const child = spawn('node', [suite.runner], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      const duration = Date.now() - startTime;
      const passed = code === 0;
      
      const result = {
        name: suite.name,
        runner: suite.runner,
        passed,
        exitCode: code,
        duration,
        stdout: stdout.substring(0, 1000), // 限制输出大小
        stderr: stderr.substring(0, 1000),
        hasOutput: stdout.length > 0 || stderr.length > 0
      };
      
      results.total++;
      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
      results.suites.push(result);
      
      // 显示结果
      const statusSymbol = passed ? '✅' : '❌';
      console.log(`   ${statusSymbol} ${passed ? '通过' : '失败'} (${duration}ms)`);
      console.log('');
      
      resolve();
    });
    
    child.on('error', (err) => {
      console.log(`   ❌ 运行失败: ${err.message}`);
      console.log('');
      
      results.total++;
      results.failed++;
      results.suites.push({
        name: suite.name,
        runner: suite.runner,
        passed: false,
        exitCode: -1,
        duration: Date.now() - startTime,
        error: err.message,
        hasOutput: false
      });
      
      resolve();
    });
  });
}

// 运行所有启用的测试套件
async function runAllSuites() {
  const enabledSuites = testSuites.filter(s => s.enabled);
  
  console.log('📋 测试套件列表:');
  enabledSuites.forEach((suite, index) => {
    console.log(`   ${index + 1}. ${suite.name}`);
  });
  console.log('');
  
  for (const suite of enabledSuites) {
    await runTestSuite(suite);
  }
  
  generateReport();
}

// 生成报告
function generateReport() {
  console.log('\n═══════════════════════════════════════');
  console.log('📊 CODILINE测试套件聚合报告');
  console.log('═══════════════════════════════════════\n');
  
  // 总体统计
  const passRate = results.total > 0 
    ? ((results.passed / results.total) * 100).toFixed(1)
    : '0.0';
  
  console.log('📈 总体统计:');
  console.log(`   测试套件: ${results.total}`);
  console.log(`   通过套件: ${results.passed}`);
  console.log(`   失败套件: ${results.failed}`);
  console.log(`   通过率: ${passRate}%\n`);
  
  // 套件详情
  console.log('🔍 测试套件详情:');
  results.suites.forEach((suite, index) => {
    const statusSymbol = suite.passed ? '✅' : '❌';
    console.log(`   ${index + 1}. ${statusSymbol} ${suite.name}`);
    console.log(`      运行器: ${suite.runner}`);
    console.log(`      状态: ${suite.passed ? '通过' : '失败'} (退出码: ${suite.exitCode})`);
    console.log(`      耗时: ${suite.duration}ms`);
    
    if (!suite.passed && suite.hasOutput) {
      console.log(`      输出: ${suite.stdout.substring(0, 200)}...`);
    }
  });
  
  // 分析各个模块的测试状态
  console.log('\n🎯 各模块测试状态分析:');
  
  const moduleStatus = {
    'TaskEngine': results.suites.find(s => s.name.includes('TaskEngine'))?.passed || false,
    'ChatPanel': results.suites.find(s => s.name.includes('ChatPanel'))?.passed || false,
    'Extension': results.suites.find(s => s.name.includes('Extension'))?.passed || false
  };
  
  Object.entries(moduleStatus).forEach(([module, passed]) => {
    console.log(`   ${module}: ${passed ? '✅ 测试通过' : '❌ 测试失败'}`);
  });
  
  // 建议
  console.log('\n💡 建议与下一步:');
  
  if (results.failed > 0) {
    const failedSuites = results.suites.filter(s => !s.passed);
    console.log(`   1. 修复${results.failed}个失败的测试套件:`);
    failedSuites.forEach(suite => {
      console.log(`      - ${suite.name}`);
    });
  } else {
    console.log('   1. 所有测试套件通过，可以继续下一步开发');
  }
  
  // 检查是否所有核心模块都有测试
  const coreModules = ['FileManager', 'TaskEngine', 'ChatPanel', 'Extension'];
  const testedModules = results.suites.map(s => s.name);
  const missingTests = coreModules.filter(module => 
    !testedModules.some(name => name.includes(module))
  );
  
  if (missingTests.length > 0) {
    console.log(`   2. 缺少以下核心模块的测试: ${missingTests.join(', ')}`);
  }
  
  console.log('\n═══════════════════════════════════════');
  
  // 根据结果决定退出码
  if (results.failed > 0) {
    console.log('❌ 测试聚合完成，有失败的测试套件');
    process.exit(1);
  } else {
    console.log('🎉 所有测试套件通过！');
    process.exit(0);
  }
}

// 运行
runAllSuites().catch(err => {
  console.error('❌ 聚合器运行失败:', err.message);
  console.error(err.stack);
  process.exit(1);
});