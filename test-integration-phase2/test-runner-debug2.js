// 简化版测试运行器，只运行对比测试
const path = require('path');
const fs = require('fs');
const { performance } = require('perf_hooks');

// 全局测试框架变量
let currentDescribe = null;
let currentTest = null;
const testSuites = [];
const testResults = [];

// 创建全局describe和it函数
global.describe = (name, fn) => {
  console.log(`📁 测试套件: ${name}`);
  const suite = { name, tests: [] };
  testSuites.push(suite);
  currentDescribe = suite;
  fn();
  currentDescribe = null;
};

global.it = (name, fn) => {
  console.log(`  ✅ 测试用例: ${name}`);
  if (currentDescribe) {
    currentDescribe.tests.push({ name, fn });
  }
};

// 加载对比测试
const comparisonFile = path.join(__dirname, 'dist/tests/comparison.test.js');
console.log(`🚀 加载对比测试: ${path.basename(comparisonFile)}`);

try {
  // 清除缓存
  delete require.cache[comparisonFile];
  
  // 加载模块
  require(comparisonFile);
  
  console.log(`\n✅ 成功加载对比测试`);
  console.log(`找到 ${testSuites.length} 个测试套件`);
  
  // 运行测试
  console.log('\n🏃 开始运行测试...');
  
  for (const suite of testSuites) {
    console.log(`\n📁 运行测试套件: ${suite.name}`);
    console.log(`包含 ${suite.tests.length} 个测试用例`);
    
    for (const test of suite.tests) {
      console.log(`  🧪 运行测试: ${test.name}`);
      try {
        // 运行测试函数
        const result = test.fn();
        if (result && result.then) {
          // 异步测试
          result.then(() => {
            console.log(`    ✅ 通过`);
          }).catch(error => {
            console.log(`    ❌ 失败: ${error.message}`);
          });
        } else {
          console.log(`    ✅ 通过`);
        }
      } catch (error) {
        console.log(`    ❌ 失败: ${error.message}`);
      }
    }
  }
  
} catch (error) {
  console.error(`❌ 加载或运行对比测试失败: ${error.message}`);
  console.error(error.stack);
}