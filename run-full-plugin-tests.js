/**
 * 完整插件系统测试运行器
 * 运行所有插件系统相关测试
 */

console.log('🔧 设置完整插件系统测试环境...\n');

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

// 设置全局变量用于fs模块等
if (!global.path) {
  global.path = require('path');
}
if (!global.fs) {
  global.fs = require('fs');
}

console.log('\n📋 查找所有插件系统测试文件...');
const fs = require('fs');
const path = require('path');

// 查找所有插件相关的测试文件
const testFiles = [];
const testDir = path.join(__dirname, 'out/test/suite');

if (fs.existsSync(testDir)) {
  const files = fs.readdirSync(testDir);
  files.forEach(file => {
    if (file.includes('plugin') && file.endsWith('.test.js')) {
      testFiles.push(path.join(testDir, file));
    }
  });
}

console.log(`📦 找到 ${testFiles.length} 个插件系统测试文件:`);
testFiles.forEach(file => {
  console.log(`  - ${path.basename(file)}`);
});

if (testFiles.length === 0) {
  console.error('❌ 未找到插件系统测试文件');
  process.exit(1);
}

// 运行Mocha测试
console.log('\n🚀 运行完整插件系统测试套件...\n');
const Mocha = require('mocha');

// 创建Mocha实例
const mocha = new Mocha({
  ui: 'tdd',
  timeout: 15000, // 稍微长一点的超时时间
  color: true,
  reporter: 'spec',
  slow: 75
});

// 添加所有测试文件
testFiles.forEach(file => {
  try {
    mocha.addFile(file);
    console.log(`✅ 添加测试文件: ${path.basename(file)}`);
  } catch (error) {
    console.error(`❌ 添加测试文件失败 ${path.basename(file)}:`, error.message);
  }
});

// 运行测试
mocha.run((failures) => {
  console.log(`\n📊 完整测试完成`);
  console.log(`  测试文件数: ${testFiles.length}`);
  console.log(`  失败数: ${failures}`);
  
  if (failures === 0) {
    console.log('🎉 所有插件系统测试通过！');
  } else {
    console.log('⚠️  部分测试失败，需要进一步检查');
  }
  
  process.exit(failures ? 1 : 0);
});