/**
 * 运行Extension测试的专用脚本
 */

console.log('🚀 启动Extension测试运行器');

// 设置vscode模块mock
const Module = require('module');
const originalRequire = Module.prototype.require;

// 导入mockVscode
const { mockVscode } = require('./out/test/helpers/mockVscode.js');

// 拦截vscode模块请求
Module.prototype.require = function(id) {
  if (id === 'vscode') {
    console.log('🔧 使用模拟vscode模块');
    return mockVscode;
  }
  
  // 正常加载其他模块
  return originalRequire.apply(this, arguments);
};

// 设置测试环境变量
process.env.NODE_ENV = 'test';

// 动态加载Mocha
try {
  const Mocha = require('mocha');
  
  // 创建Mocha实例
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
    timeout: 10000,
    reporter: 'spec'
  });
  
  // 启用console.log输出（但保持原始console.log用于我们的日志）
  const originalConsoleLog = console.log;
  const originalConsoleInfo = console.info;
  const originalConsoleWarn = console.warn;
  
  console.log = function(...args) {
    process.stdout.write('  LOG: ' + args.join(' ') + '\n');
  };
  console.info = console.log;
  console.warn = console.log;
  
  // 添加测试文件
  const testFiles = [
    './out/test/suite/extension-comprehensive.test.js',
    './out/test/suite/extension.test.js'
  ];
  
  console.log(`📄 加载测试文件: ${testFiles.join(', ')}`);
  
  testFiles.forEach(file => {
    mocha.addFile(file);
  });
  
  // 运行测试
  console.log('🧪 开始运行Extension测试...\n');
  
  mocha.run((failures) => {
    // 恢复原始console函数
    console.log = originalConsoleLog;
    console.info = originalConsoleInfo;
    console.warn = originalConsoleWarn;
    
    console.log('\n📊 Extension测试运行完成');
    console.log('═══════════════════════════════════════');
    if (failures === 0) {
      console.log('🎉 所有Extension测试通过！');
      process.exit(0);
    } else {
      console.log(`❌ ${failures} 个Extension测试失败`);
      process.exit(1);
    }
  });
  
} catch (error) {
  console.error('❌ 测试运行失败:', error.message);
  console.error(error.stack);
  process.exit(1);
}