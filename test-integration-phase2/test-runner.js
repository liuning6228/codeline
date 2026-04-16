#!/usr/bin/env node
/**
 * 自定义测试运行器
 * 替代Mocha，解决ESM模块问题，同时提供性能基准测试
 */

const path = require('path');
const fs = require('fs');

console.log('🚀 CodeLine Phase 3 自定义测试运行器');
console.log('===============================================');

// 性能基准结果
const benchmarkResults = {
  suites: [],
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  totalTime: 0,
  startTime: Date.now()
};

/**
 * Mocha兼容层 - 提供describe/it函数
 */
function setupMochaCompatibility() {
  const suites = [];
  let currentSuite = null;
  let currentTest = null;
  
  global.describe = (name, fn) => {
    const suite = {
      name,
      tests: [],
      beforeAll: [],
      afterAll: [],
      beforeEach: [],
      afterEach: []
    };
    suites.push(suite);
    currentSuite = suite;
    fn();
    currentSuite = null;
  };
  
  global.it = (name, fn) => {
    if (!currentSuite) {
      throw new Error('it()必须在describe()内部调用');
    }
    currentSuite.tests.push({ name, fn });
  };
  
  global.before = (fn) => {
    if (!currentSuite) {
      throw new Error('before()必须在describe()内部调用');
    }
    currentSuite.beforeAll.push(fn);
  };
  
  global.after = (fn) => {
    if (!currentSuite) {
      throw new Error('after()必须在describe()内部调用');
    }
    currentSuite.afterAll.push(fn);
  };
  
  global.beforeEach = (fn) => {
    if (!currentSuite) {
      throw new Error('beforeEach()必须在describe()内部调用');
    }
    currentSuite.beforeEach.push(fn);
  };
  
  global.afterEach = (fn) => {
    if (!currentSuite) {
      throw new Error('afterEach()必须在describe()内部调用');
    }
    currentSuite.afterEach.push(fn);
  };
  
  return suites;
}

/**
 * 运行测试套件（支持Mocha风格）
 */
async function runTestSuite(suiteName, testFile) {
  const suiteStart = Date.now();
  const suiteResults = {
    name: suiteName,
    tests: [],
    passed: 0,
    failed: 0,
    time: 0
  };
  
  console.log(`\n📊 测试套件: ${suiteName}`);
  console.log('─'.repeat(50));
  
  try {
    // 设置Mocha兼容层
    const suites = setupMochaCompatibility();
    
    // 动态加载测试模块（这会触发describe/it调用）
    require(testFile);
    
    // 运行收集到的测试套件
    for (const suite of suites) {
      // 运行beforeAll钩子
      for (const hook of suite.beforeAll) {
        await hook();
      }
      
      // 运行每个测试
      for (const test of suite.tests) {
        const testStart = Date.now();
        let passed = false;
        let error = null;
        
        try {
          // 运行beforeEach钩子
          for (const hook of suite.beforeEach) {
            await hook();
          }
          
          // 运行测试
          await test.fn();
          passed = true;
          
          // 运行afterEach钩子
          for (const hook of suite.afterEach) {
            await hook();
          }
          
        } catch (err) {
          error = err;
          // 如果afterEach抛出错误，这里也会捕获
        }
        
        const testTime = Date.now() - testStart;
        suiteResults.tests.push({
          name: test.name,
          passed,
          time: testTime,
          error: error?.message
        });
        
        if (passed) {
          suiteResults.passed++;
          console.log(`  ✅ ${test.name} - ${testTime}ms`);
        } else {
          suiteResults.failed++;
          console.log(`  ❌ ${test.name} - ${testTime}ms`);
          if (error) {
            console.log(`     错误: ${error.message}`);
            if (process.env.DEBUG_TESTS) {
              console.log(`     堆栈: ${error.stack}`);
            }
          }
        }
      }
      
      // 运行afterAll钩子
      for (const hook of suite.afterAll) {
        await hook();
      }
    }
    
  } catch (error) {
    console.error(`  ❌ 加载/运行测试套件失败: ${error.message}`);
    suiteResults.failed++;
    suiteResults.tests.push({
      name: 'module-load',
      passed: false,
      time: 0,
      error: `加载失败: ${error.message}`
    });
  }
  
  suiteResults.time = Date.now() - suiteStart;
  benchmarkResults.suites.push(suiteResults);
  benchmarkResults.totalTests += suiteResults.tests.length;
  benchmarkResults.passedTests += suiteResults.passed;
  benchmarkResults.failedTests += suiteResults.failed;
  
  return suiteResults;
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  const distDir = path.join(__dirname, 'dist');
  const testsDir = path.join(distDir, 'tests');
  
  if (!fs.existsSync(testsDir)) {
    console.log('❌ 未找到测试目录，请先运行: npm run build');
    process.exit(1);
  }
  
  // 查找所有测试文件
  const testFiles = fs.readdirSync(testsDir)
    .filter(file => file.endsWith('.test.js'))
    .map(file => path.join(testsDir, file));
  
  if (testFiles.length === 0) {
    console.log('⚠️ 未找到测试文件');
    return;
  }
  
  console.log(`📁 找到 ${testFiles.length} 个测试文件`);
  
  // 运行每个测试文件
  for (const testFile of testFiles) {
    const suiteName = path.basename(testFile, '.test.js');
    await runTestSuite(suiteName, testFile);
  }
  
  // 计算总时间
  benchmarkResults.totalTime = Date.now() - benchmarkResults.startTime;
  
  // 生成报告
  generateReport();
}

/**
 * 生成测试报告
 */
function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📋 测试报告摘要');
  console.log('='.repeat(60));
  
  console.log(`\n📊 总体统计:`);
  console.log(`   总测试套件: ${benchmarkResults.suites.length}`);
  console.log(`   总测试用例: ${benchmarkResults.totalTests}`);
  console.log(`   通过: ${benchmarkResults.passedTests}`);
  console.log(`   失败: ${benchmarkResults.failedTests}`);
  console.log(`   通过率: ${((benchmarkResults.passedTests / benchmarkResults.totalTests) * 100).toFixed(1)}%`);
  console.log(`   总时间: ${benchmarkResults.totalTime}ms`);
  
  console.log('\n⏱️ 性能基准:');
  benchmarkResults.suites.forEach(suite => {
    console.log(`   ${suite.name}:`);
    console.log(`     测试数: ${suite.tests.length} (${suite.passed}✓ ${suite.failed}✗)`);
    console.log(`     时间: ${suite.time}ms`);
    console.log(`     平均测试时间: ${suite.tests.length > 0 ? (suite.time / suite.tests.length).toFixed(1) : 0}ms`);
  });
  
  console.log('\n🔍 详细结果:');
  benchmarkResults.suites.forEach(suite => {
    console.log(`\n   ${suite.name}:`);
    suite.tests.forEach(test => {
      const status = test.passed ? '✅' : '❌';
      console.log(`     ${status} ${test.name} - ${test.time}ms`);
      if (!test.passed && test.error) {
        console.log(`       错误: ${test.error}`);
      }
    });
  });
  
  // 保存基准结果到文件
  saveBenchmarkResults();
}

/**
 * 保存基准结果到文件
 */
function saveBenchmarkResults() {
  const resultsDir = path.join(__dirname, 'benchmark-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultFile = path.join(resultsDir, `benchmark-${timestamp}.json`);
  
  const results = {
    timestamp: new Date().toISOString(),
    ...benchmarkResults,
    endTime: Date.now()
  };
  
  fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
  console.log(`\n💾 基准结果已保存到: ${resultFile}`);
}

/**
 * 运行性能基准测试
 */
async function runPerformanceBenchmarks() {
  console.log('\n' + '='.repeat(60));
  console.log('⚡ 性能基准测试');
  console.log('='.repeat(60));
  
  // 这里可以添加专门的性能测试
  // 例如：测试消息处理延迟、工具调用性能等
  
  console.log('性能基准测试将在后续版本中实现...');
}

/**
 * 主函数
 */
async function main() {
  try {
    // 检查构建
    if (!fs.existsSync(path.join(__dirname, 'dist'))) {
      console.log('📦 未找到构建文件，正在构建...');
      const { execSync } = require('child_process');
      execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
    }
    
    // 运行测试
    await runAllTests();
    
    // 运行性能基准测试
    await runPerformanceBenchmarks();
    
    // 退出码
    const exitCode = benchmarkResults.failedTests > 0 ? 1 : 0;
    console.log(`\n🏁 测试运行完成，退出码: ${exitCode}`);
    process.exit(exitCode);
    
  } catch (error) {
    console.error('❌ 测试运行器出错:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  runAllTests,
  runPerformanceBenchmarks,
  benchmarkResults
};