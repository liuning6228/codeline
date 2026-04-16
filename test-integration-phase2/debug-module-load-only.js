/**
 * 调试模块加载 - 只加载，不实例化
 */

console.log('🔍 调试模块加载...');

const Module = require('module');
const originalRequire = Module.prototype.require;
let requireCount = 0;

Module.prototype.require = function(id) {
  requireCount++;
  console.log(`${requireCount}. 🔍 require: ${id} (来自: ${this.filename ? require('path').basename(this.filename) : 'unknown'})`);
  
  // 拦截vscode模块
  if (id === 'vscode') {
    console.log('   🎯 返回空vscode模拟');
    return {};
  }
  
  // 拦截其他可能的问题模块
  if (id.includes('vscode') || id.includes('@vscode')) {
    console.log(`   ⚠️  拦截: ${id}，返回空对象`);
    return {};
  }
  
  try {
    return originalRequire.apply(this, arguments);
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log(`   ⚠️  模块未找到: ${id}，返回空对象`);
      return {};
    }
    console.log(`   ❌ require失败: ${error.message}`);
    return {};
  }
};

try {
  console.log('\n🔧 加载模块...');
  const componentPath = '/home/liuning/workspace/codeline/out/core/EnhancedEngineAdapter.js';
  
  // 设置超时
  const timeout = setTimeout(() => {
    console.log('⏰ 加载超时，可能模块有立即执行代码');
    process.exit(1);
  }, 5000);
  
  // 清除缓存
  delete require.cache[require.resolve(componentPath)];
  
  const module = require(componentPath);
  clearTimeout(timeout);
  
  console.log('\n✅ 模块加载成功');
  console.log(`总require调用: ${requireCount}次`);
  console.log('模块类型:', typeof module);
  
  if (typeof module === 'object') {
    const keys = Object.keys(module);
    console.log(`导出键 (${keys.length}个):`, keys);
    
    if (module.EnhancedEngineAdapter) {
      console.log('\n✅ 找到EnhancedEngineAdapter');
      console.log('类型:', typeof module.EnhancedEngineAdapter);
      
      // 检查是否是类
      if (typeof module.EnhancedEngineAdapter === 'function') {
        console.log('是函数/类');
        console.log('函数名:', module.EnhancedEngineAdapter.name || '匿名');
        
        // 检查原型
        if (module.EnhancedEngineAdapter.prototype) {
          const protoMethods = Object.getOwnPropertyNames(module.EnhancedEngineAdapter.prototype);
          console.log(`原型方法 (${protoMethods.length}个):`, protoMethods);
        }
      }
    }
  }
  
  console.log('\n🎉 模块加载调试完成');
  process.exit(0);
  
} catch (error) {
  console.error('\n❌ 模块加载失败:', error.message);
  console.error('错误代码:', error.code);
  console.error('错误堆栈:', error.stack);
  process.exit(1);
} finally {
  // 恢复原始require
  Module.prototype.require = originalRequire;
}