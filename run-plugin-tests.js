/**
 * 插件系统测试运行器
 * 专门运行插件系统相关测试
 */

console.log('🔧 设置插件系统测试环境...\n');

// 清除模块缓存以确保获取最新版本
delete require.cache[require.resolve('./out/test/helpers/mockVscode.js')];

// 模拟VS Code模块
const mockVscodeModule = require('./out/test/helpers/mockVscode.js');
const mockVscode = mockVscodeModule.mockVscode || mockVscodeModule.default || mockVscodeModule;

console.log(`✅ 加载mockVscode，包含 ${Object.keys(mockVscode).length} 个API`);

// 确保mockVscode具有所有必需的API
if (!mockVscode.ProgressLocation) {
  mockVscode.ProgressLocation = {
    Notification: 15,
    Window: 10,
    SourceControl: 1
  };
}

// 覆盖require，确保vscode模块使用模拟版本
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
  if (id === 'vscode') {
    return mockVscode;
  }
  return originalRequire.apply(this, arguments);
};

// 同时设置全局变量，以防有代码直接访问global.vscode
global.vscode = mockVscode;

// 运行Mocha测试
console.log('\n🚀 运行插件系统测试...\n');
const Mocha = require('mocha');

// 创建Mocha实例
const mocha = new Mocha({
  ui: 'tdd',
  timeout: 10000,
  color: true,
  reporter: 'spec'
});

// 添加测试文件
mocha.addFile('./out/test/suite/pluginExtension.test.js');

// 运行测试
mocha.run((failures) => {
  console.log(`\n📊 测试完成，失败数: ${failures}`);
  process.exit(failures ? 1 : 0);
});