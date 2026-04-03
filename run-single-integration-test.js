/**
 * 运行单个集成测试用于调试
 */

console.log('🚀 启动单个集成测试调试运行器');

// 设置vscode模块mock
const Module = require('module');
const originalRequire = Module.prototype.require;

// 导入mockVscode
const { mockVscode } = require('./out/test/helpers/mockVscode.js');

// 拦截vscode模块请求
Module.prototype.require = function(id) {
  if (id === 'vscode') {
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
    timeout: 15000,
    reporter: 'spec',
    grep: '错误处理集成：模型未配置时的降级处理' // 只运行这个测试
  });
  
  // 添加集成测试文件
  const testFile = './out/test/suite/integration.test.js';
  console.log(`📄 加载测试文件: ${testFile}`);
  
  mocha.addFile(testFile);
  
  // 运行测试
  console.log('🧪 开始运行单个集成测试...\n');
  
  mocha.run((failures) => {
    console.log('\n📊 测试运行完成');
    if (failures === 0) {
      console.log('🎉 测试通过！');
      process.exit(0);
    } else {
      console.log(`❌ 测试失败`);
      process.exit(1);
    }
  });
  
} catch (error) {
  console.error('❌ 测试运行失败:', error.message);
  console.error(error.stack);
  process.exit(1);
}