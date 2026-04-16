/**
 * 激进拦截 - 拦截所有模块
 */

console.log('🔍 激进模块拦截调试...');

const Module = require('module');
const originalRequire = Module.prototype.require;
let interceptCount = 0;
const interceptedModules = new Map();

Module.prototype.require = function(id) {
  interceptCount++;
  
  // 只记录前20个require调用
  if (interceptCount <= 20) {
    console.log(`${interceptCount}. 🔍 require: ${id}`);
  } else if (interceptCount === 21) {
    console.log('... 更多require调用被拦截 ...');
  }
  
  // 记录模块调用
  interceptedModules.set(id, (interceptedModules.get(id) || 0) + 1);
  
  // 对于vscode相关模块，返回空对象
  if (id === 'vscode' || id.includes('vscode') || id.includes('@vscode')) {
    if (interceptCount <= 20) {
      console.log(`   🎯 拦截vscode相关模块`);
    }
    return {};
  }
  
  // 对于Node.js核心模块，正常加载
  const coreModules = ['fs', 'path', 'os', 'util', 'events', 'stream', 'child_process', 'crypto', 'http', 'https', 'net', 'dns', 'url', 'assert', 'buffer', 'console', 'constants', 'domain', 'module', 'process', 'punycode', 'querystring', 'readline', 'repl', 'string_decoder', 'timers', 'tty', 'vm', 'zlib'];
  if (coreModules.includes(id)) {
    return originalRequire.apply(this, arguments);
  }
  
  // 对于其他模块，也返回空对象以避免依赖问题
  if (interceptCount <= 20) {
    console.log(`   ⚠️  拦截: ${id}，返回空对象`);
  }
  return {};
};

try {
  console.log('\n🔧 尝试加载模块（激进模式）...');
  const componentPath = '/home/liuning/workspace/codeline/out/core/EnhancedEngineAdapter.js';
  
  // 设置超时
  const timeout = setTimeout(() => {
    console.log('\n⏰ 加载超时！');
    console.log(`总拦截次数: ${interceptCount}`);
    console.log('拦截的模块:');
    Array.from(interceptedModules.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .forEach(([module, count]) => {
        console.log(`  ${module}: ${count}次`);
      });
    process.exit(1);
  }, 3000);
  
  // 清除缓存
  delete require.cache[require.resolve(componentPath)];
  
  console.log('开始加载...');
  const module = require(componentPath);
  clearTimeout(timeout);
  
  console.log('\n✅ 模块加载成功！');
  console.log(`总拦截次数: ${interceptCount}`);
  console.log('模块类型:', typeof module);
  
  if (typeof module === 'object') {
    const keys = Object.keys(module);
    console.log(`导出键 (${keys.length}个):`, keys);
  }
  
  // 显示最常拦截的模块
  console.log('\n📊 最常拦截的模块:');
  Array.from(interceptedModules.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([module, count]) => {
      console.log(`  ${module}: ${count}次`);
    });
  
  console.log('\n🎉 激进拦截测试完成');
  process.exit(0);
  
} catch (error) {
  console.error('\n❌ 模块加载失败:', error.message);
  console.error('错误代码:', error.code);
  
  // 显示错误堆栈的前几行
  if (error.stack) {
    const stackLines = error.stack.split('\n');
    console.error('错误堆栈（前5行）:');
    stackLines.slice(0, 5).forEach(line => console.error(`  ${line}`));
  }
  
  console.log(`总拦截次数: ${interceptCount}`);
  process.exit(1);
} finally {
  // 恢复原始require
  Module.prototype.require = originalRequire;
}