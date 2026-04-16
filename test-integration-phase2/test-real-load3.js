/**
 * 测试真实组件加载 - 简化版
 * 
 * 首先检查能否加载编译后的模块
 */

const path = require('path');
const fs = require('fs');

async function testLoad() {
  console.log('🚀 测试真实组件加载...');
  
  // 尝试不同的路径
  const possiblePaths = [
    // 从test-integration-phase2目录
    path.resolve(__dirname, '../out/core/EnhancedEngineAdapter.js'),
    // 绝对路径
    '/home/liuning/workspace/codeline/out/core/EnhancedEngineAdapter.js',
    // 另一个可能的路径
    path.resolve(__dirname, '../../codeline/out/core/EnhancedEngineAdapter.js'),
  ];
  
  let realAdapterPath = null;
  for (const p of possiblePaths) {
    console.log(`检查路径: ${p}`);
    if (fs.existsSync(p)) {
      realAdapterPath = p;
      console.log(`✅ 找到文件: ${p}`);
      break;
    }
  }
  
  if (!realAdapterPath) {
    console.error('❌ 找不到真实组件文件');
    return false;
  }
  
  console.log(`📁 使用路径: ${realAdapterPath}`);
  
  // 先尝试直接加载，看看错误是什么
  try {
    console.log('🔧 尝试加载模块...');
    const module = require(realAdapterPath);
    console.log('✅ 模块加载成功');
    console.log('导出:', Object.keys(module));
    return true;
  } catch (error) {
    console.error('❌ 模块加载失败:', error.message);
    console.error('错误堆栈:', error.stack);
    return false;
  }
}

testLoad().then(success => {
  console.log(`\n📊 测试完成: ${success ? '成功' : '失败'}`);
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('测试运行失败:', error);
  process.exit(1);
});