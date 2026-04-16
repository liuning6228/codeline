/**
 * 最基本的加载测试 - 只加载不拦截
 */

console.log('🚀 最基本的加载测试...');

try {
  const componentPath = '/home/liuning/workspace/codeline/out/core/EnhancedEngineAdapter.js';
  console.log(`📁 加载: ${componentPath}`);
  
  // 直接加载，看看会发生什么
  const module = require(componentPath);
  console.log('✅ 模块加载成功');
  console.log('模块类型:', typeof module);
  
  if (typeof module === 'function') {
    console.log('✅ 模块是函数/类');
    console.log('函数名:', module.name || '匿名');
  } else if (typeof module === 'object') {
    console.log('✅ 模块是对象');
    const keys = Object.keys(module);
    console.log(`导出键 (${keys.length}个):`, keys.slice(0, 20), keys.length > 20 ? '...' : '');
    
    // 检查常见的导出方式
    if (module.EnhancedEngineAdapter) {
      console.log('✅ 找到 EnhancedEngineAdapter 命名导出');
    }
    
    if (module.default) {
      console.log('✅ 有 default 导出');
      console.log('default 类型:', typeof module.default);
      
      if (typeof module.default === 'function') {
        console.log('✅ default 是函数/类');
        console.log('default 函数名:', module.default.name || '匿名');
      }
      
      if (module.default.EnhancedEngineAdapter) {
        console.log('✅ 在 default 中找到 EnhancedEngineAdapter');
      }
    }
  }
  
} catch (error) {
  console.error('❌ 加载失败:', error.message);
  console.error('错误代码:', error.code);
  console.error('错误堆栈:', error.stack);
  
  // 检查是否是模块未找到
  if (error.code === 'MODULE_NOT_FOUND') {
    console.error('\n🔍 模块未找到，可能缺少依赖:');
    console.error('要求模块:', error.requireStack || error.message.split("'")[1] || '未知');
  }
}