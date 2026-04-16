// 调试版测试运行器
const path = require('path');
const fs = require('fs');
const { performance } = require('perf_hooks');

console.log('🔍 调试测试运行器...');

// 查找测试文件
const testsDir = path.join(__dirname, 'dist/tests');
console.log(`测试目录: ${testsDir}`);

if (!fs.existsSync(testsDir)) {
  console.error(`❌ 测试目录不存在: ${testsDir}`);
  process.exit(1);
}

// 查找所有测试文件
const testFiles = fs.readdirSync(testsDir)
  .filter(file => file.endsWith('.test.js'))
  .map(file => path.join(testsDir, file));

console.log(`找到 ${testFiles.length} 个测试文件:`);
testFiles.forEach((file, i) => {
  console.log(`  ${i+1}. ${path.basename(file)}`);
});

// 特别检查comparison.test.js
const comparisonFile = path.join(testsDir, 'comparison.test.js');
console.log(`\n🔍 检查对比测试文件: ${comparisonFile}`);
console.log(`文件存在: ${fs.existsSync(comparisonFile)}`);

if (fs.existsSync(comparisonFile)) {
  console.log('文件大小:', fs.statSync(comparisonFile).size, '字节');
  
  // 尝试加载文件
  try {
    // 清除缓存
    delete require.cache[comparisonFile];
    
    const module = require(comparisonFile);
    console.log('✅ 成功加载对比测试模块');
    console.log('导出键:', Object.keys(module));
    
    // 检查是否有全局describe/it注册
    console.log('\n检查全局测试注册...');
    
  } catch (error) {
    console.error('❌ 加载对比测试模块失败:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}