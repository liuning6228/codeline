/**
 * 测试真实组件加载
 * 
 * 尝试加载编译后的真实EnhancedEngineAdapter，通过模块缓存注入vscode模拟
 */

const path = require('path');
const Module = require('module');

// ==================== 导入我们的vscode模拟 ====================
const { vscode: mockVscode, createExtensionContext } = require('./dist/mocks/vscodeExtended.js');

console.log('🚀 开始测试真实组件加载...');

// 主测试函数
async function testRealComponentLoad() {
// ==================== 方法1: 使用require.cache注入 ====================

// 获取vscode模块的绝对路径
// 当真实组件require('vscode')时，Node.js会查找node_modules/vscode
// 我们需要拦截这个请求

// 方法1: 在Module._resolveFilename中拦截
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function(request, parent, isMain, options) {
  console.log(`🔍 模块解析请求: ${request} (来自: ${parent?.filename || 'unknown'})`);
  
  // 如果请求vscode，返回一个虚拟路径
  if (request === 'vscode') {
    console.log('🎯 拦截vscode模块请求');
    // 返回一个虚拟路径，我们将在这个路径上设置缓存
    const virtualPath = path.join(__dirname, 'virtual-vscode-module.js');
    return virtualPath;
  }
  
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

// 创建虚拟的vscode模块文件
const virtualVscodePath = path.join(__dirname, 'virtual-vscode-module.js');
require('fs').writeFileSync(virtualVscodePath, `
// 虚拟vscode模块
module.exports = require('./dist/mocks/vscodeExtended.js').vscode;
`);

// 在require.cache中设置我们的模拟
require.cache[virtualVscodePath] = {
  exports: mockVscode,
  loaded: true,
  filename: virtualVscodePath
};

console.log('✅ 已设置vscode模块拦截');

// ==================== 尝试加载真实EnhancedEngineAdapter ====================

try {
  console.log('🔧 尝试加载真实EnhancedEngineAdapter...');
  
  // 获取编译后的EnhancedEngineAdapter路径
  const realAdapterPath = path.resolve(__dirname, '../codeline/out/core/EnhancedEngineAdapter.js');
  console.log(`📁 真实组件路径: ${realAdapterPath}`);
  
  if (!require('fs').existsSync(realAdapterPath)) {
    throw new Error(`真实组件文件不存在: ${realAdapterPath}`);
  }
  
  // 尝试加载
  const realAdapterModule = require(realAdapterPath);
  console.log('✅ 成功加载真实EnhancedEngineAdapter模块');
  console.log('导出内容:', Object.keys(realAdapterModule));
  
  // 检查导出的类
  const EnhancedEngineAdapter = realAdapterModule.EnhancedEngineAdapter;
  if (!EnhancedEngineAdapter) {
    throw new Error('EnhancedEngineAdapter类未导出');
  }
  
  console.log('✅ 成功获取EnhancedEngineAdapter类');
  console.log('类方法:', Object.getOwnPropertyNames(EnhancedEngineAdapter.prototype));
  
  // ==================== 尝试创建实例 ====================
  
  console.log('\n🔧 尝试创建EnhancedEngineAdapter实例...');
  
  // 创建模拟的扩展上下文
  const context = createExtensionContext();
  
  // 创建模拟的CodeLineExtension
  // 注意：真实EnhancedEngineAdapter需要CodeLineExtension实例
  // 我们需要创建一个简化的模拟
  
  const mockExtension = {
    modelAdapter: {
      sendMessage: async () => ({ content: '模拟响应' })
    },
    projectAnalyzer: {
      analyzeProject: async () => ({ files: [] })
    },
    promptEngine: {
      generatePrompt: async () => '模拟提示词'
    },
    verbose: false
  };
  
  // 创建配置
  const config = {
    extension: mockExtension,
    context: context,
    verbose: true,
    defaultMode: 'act'
  };
  
  // 尝试获取实例
  const adapterInstance = EnhancedEngineAdapter.getInstance(config);
  console.log('✅ 成功获取EnhancedEngineAdapter实例');
  
  // 尝试初始化
  console.log('\n🔧 尝试初始化真实适配器...');
  const initResult = await adapterInstance.initialize();
  console.log(`✅ 初始化结果: ${initResult}`);
  
  // 尝试获取引擎
  const engine = adapterInstance.getEngine();
  console.log('✅ 获取引擎成功:', engine ? '是' : '否');
  
  // 尝试提交消息
  console.log('\n🔧 尝试提交测试消息...');
  const response = await adapterInstance.submitMessage('测试消息');
  console.log('✅ 消息处理成功:', response.success);
  
  console.log('\n🎉 真实组件加载测试成功！');
  
} catch (error) {
  console.error('❌ 真实组件加载失败:', error);
  console.error('错误堆栈:', error.stack);
} finally {
  // 恢复原始解析函数
  Module._resolveFilename = originalResolveFilename;
  
  // 清理虚拟文件
  try {
    require('fs').unlinkSync(virtualVscodePath);
  } catch (e) {
    // 忽略
  }
}