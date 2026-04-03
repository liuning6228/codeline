// 测试vscode模拟
const Module = require('module');
const originalRequire = Module.prototype.require;
const path = require('path');

console.log('测试vscode模拟...');

// 加载mockVscode
const mockVscodePath = path.join(__dirname, 'out', 'test', 'helpers', 'mockVscode.js');
console.log(`加载模拟vscode: ${mockVscodePath}`);

Module.prototype.require = function(id) {
  if (id === 'vscode') {
    console.log('拦截vscode模块请求');
    const mockVscode = originalRequire.call(this, mockVscodePath);
    
    console.log('vscode模拟对象结构:');
    console.log('  - vscode:', typeof mockVscode);
    console.log('  - vscode.workspace:', mockVscode.workspace ? 'defined' : 'undefined');
    
    if (mockVscode.workspace) {
      console.log('  - vscode.workspace.getConfiguration:', typeof mockVscode.workspace.getConfiguration);
      
      if (typeof mockVscode.workspace.getConfiguration === 'function') {
        const config = mockVscode.workspace.getConfiguration('codeline');
        console.log('  - getConfiguration返回:', config ? 'object' : 'null/undefined');
        if (config) {
          console.log('  - config.get:', typeof config.get);
          
          if (typeof config.get === 'function') {
            const apiKey = config.get('apiKey');
            console.log(`  - config.get('apiKey'): ${apiKey}`);
          }
        }
      }
    }
    
    return mockVscode;
  }
  return originalRequire.apply(this, arguments);
};

// 现在尝试加载扩展
console.log('\n尝试加载扩展...');
try {
  const Extension = require('./out/extension.js');
  console.log('扩展加载成功');
} catch (error) {
  console.error('扩展加载失败:', error.message);
  console.error('堆栈:', error.stack);
}

// 恢复原始require
Module.prototype.require = originalRequire;