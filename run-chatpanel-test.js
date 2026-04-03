/**
 * 运行ChatPanel测试的专用脚本
 */

console.log('🚀 启动ChatPanel测试运行器');

// 设置vscode模块mock
const Module = require('module');
const originalRequire = Module.prototype.require;

// 导入mockVscode
const mockVscode = require('./out/test/helpers/mockVscode.js').mockVscode;

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
  
  // 启用console.log输出
  const originalConsoleLog = console.log;
  console.log = function(...args) {
    process.stdout.write('  LOG: ' + args.join(' ') + '\n');
  };
  console.info = console.log;
  console.warn = console.log;
  
  // 添加ChatPanel测试文件
  const testFile = './out/test/suite/chatPanel-simple.test.js';
  console.log(`📄 加载测试文件: ${testFile}`);
  
  mocha.addFile(testFile);
  
  // 运行测试
  console.log('🧪 开始运行ChatPanel测试...\n');
  
  mocha.run((failures) => {
    // 恢复原始console.log
    console.log = originalConsoleLog;
    
    console.log('\n📊 ChatPanel测试运行完成');
    console.log('═══════════════════════════════════════');
    if (failures === 0) {
      console.log('🎉 所有ChatPanel测试通过！');
      process.exit(0);
    } else {
      console.log(`❌ ${failures} 个ChatPanel测试失败`);
      process.exit(1);
    }
  });
  
} catch (error) {
  console.error('❌ 测试运行失败:', error.message);
  console.error(error.stack);
  process.exit(1);
}