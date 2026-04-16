/**
 * 简单的模块加载测试 - 只加载模块，不创建实例
 */

console.log('🔍 简单的模块加载测试');

const Module = require('module');
const originalRequire = Module.prototype.require;

// 简单的vscode模拟
const simpleVscodeMock = {
  workspace: { fs: { readFile: async () => new Uint8Array() } },
  window: { createOutputChannel: () => ({ appendLine: () => {} }) },
  commands: { registerCommand: () => ({ dispose: () => {} }) },
  StatusBarAlignment: { Left: 1, Right: 2 },
  Disposable: class Disposable { dispose() {} }
};

Module.prototype.require = function(id) {
  if (id === 'vscode') {
    console.log(`✅ 拦截vscode模块`);
    return simpleVscodeMock;
  }
  
  // 对于其他模块，尝试正常加载，如果失败返回模拟
  try {
    return originalRequire.apply(this, arguments);
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log(`⚠️  模块未找到: ${id}, 返回模拟`);
      return {};
    }
    throw error;
  }
};

try {
  console.log('\n🔧 尝试加载模块...');
  const componentPath = '/home/liuning/workspace/codeline/out/core/EnhancedEngineAdapter.js';
  
  // 清除缓存
  delete require.cache[require.resolve(componentPath)];
  
  const module = require(componentPath);
  console.log('✅ 模块加载成功！');
  console.log('模块类型:', typeof module);
  
  if (typeof module === 'object') {
    const keys = Object.keys(module);
    console.log(`导出键 (${keys.length}个):`, keys);
    
    if (module.EnhancedEngineAdapter) {
      console.log('✅ 找到 EnhancedEngineAdapter 导出');
      console.log('类型:', typeof module.EnhancedEngineAdapter);
      
      // 检查是否是类
      if (typeof module.EnhancedEngineAdapter === 'function') {
        console.log('✅ EnhancedEngineAdapter 是函数/类');
        console.log('函数名:', module.EnhancedEngineAdapter.name || '匿名');
        
        // 检查原型方法
        if (module.EnhancedEngineAdapter.prototype) {
          const protoMethods = Object.getOwnPropertyNames(module.EnhancedEngineAdapter.prototype);
          console.log(`原型方法 (前10个):`, protoMethods.slice(0, 10));
        }
      }
    }
  }
  
  console.log('\n🎉 模块加载测试成功！');
  process.exit(0);
  
} catch (error) {
  console.error('❌ 模块加载失败:', error.message);
  console.error('错误代码:', error.code);
  console.error('错误堆栈前3行:');
  console.error(error.stack.split('\n').slice(0, 3).join('\n'));
  process.exit(1);
} finally {
  // 恢复原始require
  Module.prototype.require = originalRequire;
}