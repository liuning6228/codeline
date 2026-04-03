/**
 * 运行集成测试的专用脚本
 */

console.log('🚀 启动CodeLine集成测试运行器');
console.log('═══════════════════════════════════════\n');

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
    timeout: 15000, // 集成测试可能需要更长时间
    reporter: 'spec'
  });
  
  // 添加集成测试文件
  const testFile = './out/test/suite/integration.test.js';
  console.log(`📄 加载测试文件: ${testFile}`);
  
  mocha.addFile(testFile);
  
  // 运行测试
  console.log('🧪 开始运行集成测试...\n');
  console.log('📋 测试场景:');
  console.log('   1. 完整工作流：启动聊天 → 执行任务 → 显示结果');
  console.log('   2. 文件操作集成：聊天面板 → 扩展 → 文件管理器');
  console.log('   3. 配置更新传播：扩展 → ModelAdapter → 任务执行');
  console.log('   4. 聊天面板与扩展的双向通信');
  console.log('   5. 错误处理集成：模型未配置时的降级处理');
  console.log('   6. 扩展生命周期：激活 → 使用 → 卸载\n');
  
  mocha.run((failures) => {
    console.log('\n📊 集成测试运行完成');
    console.log('═══════════════════════════════════════');
    
    if (failures === 0) {
      console.log('🎉 所有集成测试通过！');
      console.log('');
      console.log('✅ 集成测试验证结果:');
      console.log('   - 模块间通信正常');
      console.log('   - 完整工作流可执行');
      console.log('   - 错误处理机制有效');
      console.log('   - 扩展生命周期管理正确');
      console.log('');
      console.log('🚀 Phase 2, Task 2.4 完成！');
      process.exit(0);
    } else {
      console.log(`❌ ${failures} 个集成测试失败`);
      console.log('');
      console.log('💡 建议:');
      console.log('   1. 检查模块间接口是否一致');
      console.log('   2. 验证模拟环境设置是否正确');
      console.log('   3. 查看具体失败测试的详细错误信息');
      process.exit(1);
    }
  });
  
} catch (error) {
  console.error('❌ 集成测试运行失败:', error.message);
  console.error(error.stack);
  process.exit(1);
}