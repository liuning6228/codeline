/**
 * 测试高级组件加载器
 */

const { AdvancedComponentLoader, loadRealEnhancedEngineAdapterAdvanced } = require('./dist/loaders/AdvancedComponentLoader.js');

async function testAdvancedLoader() {
  console.log('🚀 测试高级组件加载器...');
  console.log('='.repeat(80));
  
  const loader = new AdvancedComponentLoader({
    verbose: true,
    strategies: ['require-proxy'],
    validateInterface: true,
    createInstance: true,
    vscodeMockOptions: {
      verbose: true,
      logCalls: true,
      strictMode: false,
      dynamicProxy: true
    }
  });
  
  console.log('\n🔧 开始加载真实组件...');
  const result = await loader.load();
  
  console.log('\n📊 加载结果:');
  console.log('成功:', result.success);
  console.log('使用的策略:', result.strategyUsed);
  
  if (result.error) {
    console.log('错误:', result.error);
  }
  
  if (result.validationResult) {
    console.log('\n📈 接口验证结果:');
    console.log('分数:', result.validationResult.score + '/100');
    console.log('通过:', result.validationResult.passed ? '✅ 是' : '❌ 否');
    console.log('匹配方法:', result.validationResult.matchedMethods + '/' + result.validationResult.totalMethods);
    
    if (result.validationResult.missingMethods.length > 0) {
      console.log('\n❌ 缺失方法:');
      result.validationResult.missingMethods.forEach(method => console.log('  -', method));
    }
  }
  
  if (result.debugInfo) {
    console.log('\n🔍 调试信息:');
    console.log('模块导出:', result.debugInfo.moduleExports.slice(0, 10), 
                result.debugInfo.moduleExports.length > 10 ? '...' : '');
    console.log('类方法:', result.debugInfo.classMethods.slice(0, 10),
                result.debugInfo.classMethods.length > 10 ? '...' : '');
    console.log('实例方法:', result.debugInfo.instanceMethods.slice(0, 10),
                result.debugInfo.instanceMethods.length > 10 ? '...' : '');
    console.log('vscode调用次数:', result.debugInfo.vscodeCalls.length);
  }
  
  if (result.instance) {
    console.log('\n🎯 实例功能测试:');
    
    // 测试实例的基本功能
    const instance = result.instance;
    
    // 检查关键方法是否存在
    const keyMethods = ['getMode', 'getEngine', 'getState', 'submitMessage'];
    for (const method of keyMethods) {
      const exists = typeof instance[method] === 'function';
      console.log(`${method}: ${exists ? '✅ 存在' : '❌ 不存在'}`);
    }
    
    // 如果getMode存在，测试它
    if (typeof instance.getMode === 'function') {
      try {
        const mode = instance.getMode();
        console.log(`当前模式: ${mode}`);
      } catch (error) {
        console.log(`getMode调用失败: ${error.message}`);
      }
    }
    
    // 如果getState存在，测试它
    if (typeof instance.getState === 'function') {
      try {
        const state = instance.getState();
        console.log(`引擎状态: ${state.engineReady ? '就绪' : '未就绪'}`);
        console.log(`工具数量: ${state.toolCount}`);
      } catch (error) {
        console.log(`getState调用失败: ${error.message}`);
      }
    }
  }
  
  // 获取统计信息
  const stats = loader.getStats();
  console.log('\n📊 vscode调用统计:');
  console.log('总调用次数:', stats.totalCalls || 0);
  if (stats.byNamespace) {
    Object.entries(stats.byNamespace).forEach(([namespace, count]) => {
      console.log(`  ${namespace}: ${count}次`);
    });
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`🏁 测试完成: ${result.success ? '✅ 成功' : '❌ 失败'}`);
  
  return result.success;
}

// 运行测试
testAdvancedLoader().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('测试运行失败:', error);
  process.exit(1);
});