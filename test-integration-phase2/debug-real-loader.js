/**
 * 调试真实组件加载器
 */

const { RealComponentLoader } = require('./dist/loaders/RealComponentLoader.js');
const path = require('path');

async function debugRealLoader() {
  console.log('🔍 调试RealComponentLoader...');
  
  // 测试查找真实组件路径
  const loader = new RealComponentLoader({
    verbose: true,
    strategies: []
  });
  
  console.log('\n🔍 查找真实组件路径...');
  const foundPath = loader.findRealComponentPath();
  console.log(`找到的路径: ${foundPath}`);
  
  if (foundPath) {
    console.log(`文件存在: ${require('fs').existsSync(foundPath)}`);
  } else {
    console.log('❌ 未找到真实组件文件');
    
    // 列出可能的路径
    console.log('\n📁 检查可能的路径:');
    const possiblePaths = [
      path.resolve(__dirname, '../../../../codeline/out/core/EnhancedEngineAdapter.js'),
      path.resolve(process.cwd(), '../out/core/EnhancedEngineAdapter.js'),
      '/home/liuning/workspace/codeline/out/core/EnhancedEngineAdapter.js',
    ];
    
    possiblePaths.forEach(p => {
      const exists = require('fs').existsSync(p);
      console.log(`  ${exists ? '✅' : '❌'} ${p}`);
    });
  }
  
  // 测试加载
  console.log('\n🔍 测试加载真实组件...');
  const loader2 = new RealComponentLoader({
    verbose: true,
    strategies: ['cache-injection']
  });
  
  const result = loader2.load();
  console.log('\n📊 加载结果:');
  console.log('成功:', result.success);
  console.log('错误:', result.error);
  console.log('使用的策略:', result.strategyUsed);
}

debugRealLoader().catch(error => {
  console.error('调试失败:', error);
  process.exit(1);
});