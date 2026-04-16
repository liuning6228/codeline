/**
 * 运行简化对比测试
 */

const path = require('path');
const fs = require('fs');
const { performance } = require('perf_hooks');

console.log('🚀 运行简化对比测试');

// ==================== 测试框架设置 ====================

const testSuites = [];
let currentSuite = null;
let currentHook = null;

// 创建全局测试函数
global.describe = (name, fn) => {
  console.log(`\n📁 测试套件: ${name}`);
  const suite = {
    name,
    tests: [],
    beforeAll: [],
    afterAll: [],
    beforeEach: [],
    afterEach: []
  };
  testSuites.push(suite);
  currentSuite = suite;
  
  // 运行测试套件函数以注册测试
  try {
    fn();
  } catch (error) {
    console.error(`❌ 测试套件 ${name} 注册失败:`, error);
  }
  
  currentSuite = null;
};

global.it = (name, fn) => {
  if (currentSuite) {
    console.log(`  📝 注册测试: ${name}`);
    currentSuite.tests.push({ name, fn });
  }
};

global.before = (fn) => {
  if (currentSuite) {
    currentSuite.beforeAll.push(fn);
  }
};

global.after = (fn) => {
  if (currentSuite) {
    currentSuite.afterAll.push(fn);
  }
};

global.beforeEach = (fn) => {
  if (currentSuite) {
    currentSuite.beforeEach.push(fn);
  }
};

global.afterEach = (fn) => {
  if (currentSuite) {
    currentSuite.afterEach.push(fn);
  }
};

// ==================== 运行测试 ====================

async function runTests() {
  console.log('\n' + '='.repeat(80));
  console.log('🏃 开始运行测试');
  console.log('='.repeat(80));
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    suites: []
  };
  
  for (const suite of testSuites) {
    console.log(`\n📁 运行测试套件: ${suite.name}`);
    const suiteResult = {
      name: suite.name,
      tests: [],
      passed: 0,
      failed: 0
    };
    
    // 运行beforeAll钩子
    for (const beforeFn of suite.beforeAll) {
      try {
        const result = beforeFn();
        if (result && typeof result.then === 'function') {
          await result;
        }
      } catch (error) {
        console.error(`  ❌ beforeAll钩子失败:`, error.message);
      }
    }
    
    // 运行测试用例
    for (const test of suite.tests) {
      results.total++;
      console.log(`  🧪 测试: ${test.name}`);
      
      // 运行beforeEach钩子
      for (const beforeEachFn of suite.beforeEach) {
        try {
          const result = beforeEachFn();
          if (result && typeof result.then === 'function') {
            await result;
          }
        } catch (error) {
          console.error(`    ⚠️  beforeEach钩子失败:`, error.message);
        }
      }
      
      // 运行测试
      let testPassed = false;
      let error = null;
      let duration = 0;
      
      try {
        const startTime = performance.now();
        const result = test.fn();
        
        // 处理异步测试
        if (result && typeof result.then === 'function') {
          await result;
        }
        
        const endTime = performance.now();
        duration = endTime - startTime;
        
        testPassed = true;
        console.log(`    ✅ 通过 (${duration.toFixed(2)}ms)`);
        
      } catch (err) {
        error = err;
        testPassed = false;
        console.log(`    ❌ 失败: ${err.message}`);
        if (err.stack) {
          // 只显示错误堆栈的第一行
          const stackLines = err.stack.split('\n');
          if (stackLines.length > 1) {
            console.log(`        ${stackLines[1].trim()}`);
          }
        }
      }
      
      // 运行afterEach钩子
      for (const afterEachFn of suite.afterEach) {
        try {
          const result = afterEachFn();
          if (result && typeof result.then === 'function') {
            await result;
          }
        } catch (err) {
          console.error(`    ⚠️  afterEach钩子失败:`, err.message);
        }
      }
      
      // 记录结果
      const testResult = {
        name: test.name,
        passed: testPassed,
        error: error ? error.message : null,
        duration
      };
      
      suiteResult.tests.push(testResult);
      if (testPassed) {
        suiteResult.passed++;
        results.passed++;
      } else {
        suiteResult.failed++;
        results.failed++;
      }
    }
    
    // 运行afterAll钩子
    for (const afterFn of suite.afterAll) {
      try {
        const result = afterFn();
        if (result && typeof result.then === 'function') {
          await result;
        }
      } catch (error) {
        console.error(`  ❌ afterAll钩子失败:`, error.message);
      }
    }
    
    results.suites.push(suiteResult);
  }
  
  // 输出总结
  console.log('\n' + '='.repeat(80));
  console.log('📊 测试结果总结');
  console.log('='.repeat(80));
  console.log(`总测试套件: ${testSuites.length}`);
  console.log(`总测试用例: ${results.total}`);
  console.log(`通过: ${results.passed}`);
  console.log(`失败: ${results.failed}`);
  console.log(`通过率: ${results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : 0}%`);
  
  // 输出失败详情
  if (results.failed > 0) {
    console.log('\n❌ 失败详情:');
    for (const suite of results.suites) {
      for (const test of suite.tests) {
        if (!test.passed) {
          console.log(`  - ${suite.name}: ${test.name} - ${test.error}`);
        }
      }
    }
  }
  
  return results;
}

// ==================== 主函数 ====================

async function main() {
  try {
    // 加载简化对比测试文件
    const testFile = path.join(__dirname, 'dist/tests/comparison-simple.test.js');
    console.log(`📁 加载测试文件: ${testFile}`);
    
    if (!fs.existsSync(testFile)) {
      console.error('❌ 测试文件不存在');
      process.exit(1);
    }
    
    // 清除缓存并加载
    delete require.cache[testFile];
    require(testFile);
    
    console.log(`✅ 成功加载测试文件，注册了 ${testSuites.length} 个测试套件`);
    
    // 运行测试
    const results = await runTests();
    
    // 根据结果退出
    process.exit(results.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('❌ 运行测试失败:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行主函数
main();