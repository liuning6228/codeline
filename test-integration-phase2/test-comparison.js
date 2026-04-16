/**
 * 运行对比测试
 */

const path = require('path');
const fs = require('fs');

// 加载测试文件
const testFile = path.join(__dirname, 'dist/tests/comparison.test.js');
console.log(`🔍 加载对比测试文件: ${testFile}`);

if (!fs.existsSync(testFile)) {
  console.error('❌ 对比测试文件不存在');
  process.exit(1);
}

// 运行测试
console.log('🚀 开始对比测试...\n');

try {
  // 清除缓存确保重新加载
  delete require.cache[require.resolve('./dist/tests/comparison.test.js')];
  
  const comparisonTest = require('./dist/tests/comparison.test.js');
  console.log('✅ 对比测试模块加载成功');
  
  // 查看导出的内容
  console.log('导出内容:', Object.keys(comparisonTest));
  
  // 尝试运行对比测试
  if (typeof comparisonTest.runComparisonTests === 'function') {
    console.log('\n🔄 运行对比测试函数...');
    const results = comparisonTest.runComparisonTests();
    console.log('对比测试结果:', results);
  } else {
    console.log('\n⚠️  未找到runComparisonTests函数，直接运行describe/it测试');
    // 测试文件应该通过全局describe/it注册测试
    console.log('请使用Mocha或自定义测试运行器运行');
  }
  
} catch (error) {
  console.error('❌ 对比测试加载失败:', error);
  console.error('错误堆栈:', error.stack);
  process.exit(1);
}