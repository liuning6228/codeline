/**
 * 测试RealComponentLoader
 */

const { RealComponentLoader } = require('./dist/loaders/RealComponentLoader.js');

async function testRealComponentLoader() {
  console.log('🚀 测试RealComponentLoader...');
  
  const loader = new RealComponentLoader({
    verbose: true,
    strategies: ['cache-injection']
  });
  
  console.log('🔧 尝试加载真实组件...');
  const result = loader.load();
  
  console.log('\n📊 加载结果:');
  console.log('成功:', result.success);
  if (result.error) {
    console.log('错误:', result.error);
  }
  if (result.strategyUsed) {
    console.log('使用的策略:', result.strategyUsed);
  }
  if (result.module) {
    console.log('模块已加载:', Object.keys(result.module));
  }
  
  return result.success;
}

testRealComponentLoader().then(success => {
  console.log(`\n🏁 测试完成: ${success ? '✅ 成功' : '❌ 失败'}`);
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('测试失败:', error);
  process.exit(1);
});