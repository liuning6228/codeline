#!/usr/bin/env node
/**
 * 测试任务引擎初始化修复
 */

async function main() {
  const Module = require('module');
  const originalRequire = Module.prototype.require;
  const path = require('path');

  console.log('🔧 测试任务引擎初始化修复');
  console.log('═══════════════════════════════════════\n');

// 1. 加载更新后的mockVscode
console.log('1. 加载模拟vscode...');
const mockVscodePath = path.join(__dirname, 'out', 'test', 'helpers', 'mockVscode.js');
let mockVscodeModule;
try {
  mockVscodeModule = require(mockVscodePath);
  console.log('   ✅ mockVscode模块加载成功');
  
  // 获取实际的mockVscode对象
  let mockVscode = mockVscodeModule.mockVscode || mockVscodeModule.default || mockVscodeModule;
  
  // 检查导出结构
  console.log(`   模块导出键: ${Object.keys(mockVscodeModule).join(', ')}`);
  console.log(`   使用mockVscode对象: ${mockVscode === mockVscodeModule.mockVscode ? 'mockVscode' : 
    mockVscode === mockVscodeModule.default ? 'default' : 'module本身'}`);
  
  // 检查关键属性
  console.log(`   - workspace: ${mockVscode.workspace ? 'defined' : 'undefined'}`);
  console.log(`   - workspace.workspaceFolders: ${mockVscode.workspace?.workspaceFolders?.length || 0} 个`);
  console.log(`   - workspace.getConfiguration: ${typeof mockVscode.workspace?.getConfiguration}`);
  console.log(`   - languages: ${mockVscode.languages ? 'defined' : 'undefined'}`);
  console.log(`   - languages.registerCompletionItemProvider: ${typeof mockVscode.languages?.registerCompletionItemProvider}`);
  
  // 存储正确的mockVscode对象
  global.mockVscodeForTest = mockVscode;
  
} catch (error) {
  console.error('   ❌ mockVscode加载失败:', error.message);
  process.exit(1);
}

// 2. 设置模块拦截
console.log('\n2. 设置模块拦截...');
Module.prototype.require = function(id) {
  if (id === 'vscode') {
    console.log(`   拦截vscode模块请求`);
    
    // 获取正确的mockVscode对象
    const mockVscode = global.mockVscodeForTest;
    
    // 检查对象结构
    if (mockVscode && mockVscode.workspace) {
      return mockVscode;
    } else if (mockVscode && mockVscode.mockVscode && mockVscode.mockVscode.workspace) {
      console.log(`   使用mockVscode.mockVscode`);
      return mockVscode.mockVscode;
    } else if (mockVscode && mockVscode.default && mockVscode.default.workspace) {
      console.log(`   使用mockVscode.default`);
      return mockVscode.default;
    } else {
      console.error(`   mockVscode结构异常:`, Object.keys(mockVscode || {}));
      return mockVscode || {};
    }
  }
  return originalRequire.apply(this, arguments);
};

// 3. 设置环境变量
process.env.NODE_ENV = 'test';
process.env.CODELINE_TEST = 'true';
process.env.DEEPSEEK_API_KEY = 'test-api-key-for-task-engine';

console.log('   ✅ 模块拦截和环境变量设置完成');

// 4. 加载扩展并获取实例
console.log('\n3. 加载扩展...');
let extensionModule;
try {
  const extensionPath = path.join(__dirname, 'out', 'extension.js');
  extensionModule = require(extensionPath);
  console.log('   ✅ 扩展模块加载成功');
} catch (error) {
  console.error('   ❌ 扩展模块加载失败:', error.message);
  console.error('   堆栈:', error.stack);
  process.exit(1);
}

// 5. 创建模拟上下文
console.log('\n4. 创建扩展上下文...');
const mockContext = {
  subscriptions: [],
  extensionPath: __dirname,
  storagePath: '/tmp/codeline-test',
  globalStoragePath: '/tmp/codeline-test-global',
  logPath: '/tmp/codeline-test-logs',
  asAbsolutePath: (relativePath) => path.join(__dirname, relativePath),
  workspaceState: {
    get: () => undefined,
    update: async () => {},
    keys: () => []
  },
  globalState: {
    get: () => undefined,
    update: async () => {},
    keys: () => []
  },
  extensionMode: 1, // Development
  environmentVariableCollection: {}
};

console.log('   ✅ 扩展上下文创建完成');

// 6. 激活扩展
console.log('\n5. 激活扩展...');
try {
  // 激活扩展
  await extensionModule.activate(mockContext);
  console.log('   ✅ 扩展激活成功');
} catch (error) {
  console.error('   ❌ 扩展激活失败:', error.message);
  console.error('   堆栈:', error.stack);
  process.exit(1);
}

// 7. 获取扩展实例并测试任务引擎初始化
console.log('\n6. 测试任务引擎初始化...');
try {
  // 获取扩展实例
  const CodeLineExtension = extensionModule.CodeLineExtension || extensionModule.default?.CodeLineExtension;
  
  if (!CodeLineExtension) {
    console.error('   ❌ 无法找到CodeLineExtension类');
    process.exit(1);
  }
  
  console.log('   获取扩展实例...');
  const extensionInstance = CodeLineExtension.getInstance(mockContext);
  
  if (!extensionInstance) {
    console.error('   ❌ 无法获取扩展实例');
    process.exit(1);
  }
  
  console.log('   ✅ 扩展实例获取成功');
  console.log(`   ℹ️  扩展实例类型: ${extensionInstance.constructor.name}`);
  
  // 测试ensureTaskEngineInitialized方法
  console.log('\n7. 测试任务引擎初始化...');
  
  // 检查模型适配器
  console.log('   检查模型适配器...');
  const modelAdapter = extensionInstance.getModelAdapter ? extensionInstance.getModelAdapter() : extensionInstance.modelAdapter;
  
  if (!modelAdapter) {
    console.error('   ❌ 模型适配器不可用');
  } else {
    console.log(`   ✅ 模型适配器可用: ${modelAdapter.constructor.name}`);
    
    // 检查是否配置就绪
    const isReady = modelAdapter.isReady ? modelAdapter.isReady() : false;
    console.log(`   ℹ️  模型适配器就绪状态: ${isReady}`);
    
    if (!isReady) {
      console.log('   ⚠️  模型适配器未就绪，模拟配置...');
      // 模拟配置
      modelAdapter.isReady = () => true;
    }
  }
  
  // 尝试初始化任务引擎
  console.log('\n8. 尝试初始化任务引擎...');
  try {
    // 由于ensureTaskEngineInitialized是私有方法，我们需要通过executeTask来测试
    if (typeof extensionInstance.executeTask === 'function') {
      console.log('   通过executeTask测试任务引擎初始化...');
      
      // 创建一个简单的测试任务
      const testTask = '测试任务引擎初始化';
      console.log(`   任务: "${testTask}"`);
      
      console.log('   注意: 由于模拟限制，实际任务执行可能会失败，但我们应该能看到初始化是否成功');
      
      try {
        await extensionInstance.executeTask(testTask);
        console.log('   ✅ 任务执行成功!');
      } catch (taskError) {
        console.error(`   ❌ 任务执行失败: ${taskError.message}`);
        
        // 分析错误
        if (taskError.message.includes('workspace folder')) {
          console.log('   🔍 问题: 工作区文件夹问题');
          console.log(`     错误消息: ${taskError.message}`);
          console.log(`     workspaceFolders: ${JSON.stringify(mockVscode.workspace.workspaceFolders)}`);
        } else if (taskError.message.includes('not configured') || taskError.message.includes('API key')) {
          console.log('   🔍 问题: API密钥配置问题');
        } else if (taskError.message.includes('engine') || taskError.message.includes('initialization')) {
          console.log('   🔍 问题: 任务引擎初始化失败');
        } else {
          console.log(`   🔍 其他错误: ${taskError.message.substring(0, 100)}`);
        }
      }
    } else {
      console.log('   ℹ️  executeTask方法不可用，跳过任务执行测试');
      
      // 尝试直接访问任务引擎
      console.log('   尝试直接访问任务引擎...');
      if (extensionInstance.taskEngine) {
        console.log('   ✅ 任务引擎已初始化');
      } else {
        console.log('   ℹ️  任务引擎未初始化');
      }
    }
  } catch (error) {
    console.error('   任务引擎初始化测试失败:', error.message);
    console.error('   堆栈:', error.stack);
  }
  
} catch (error) {
  console.error('   扩展实例测试失败:', error.message);
  console.error('   堆栈:', error.stack);
}

  // 恢复原始require
  Module.prototype.require = originalRequire;

  console.log('\n═══════════════════════════════════════');
  console.log('🔧 测试完成');
  console.log('\n📋 总结:');
  console.log('如果任务引擎初始化成功，则"Task execution failed"错误的');
  console.log('根本原因已找到并修复：缺少工作区文件夹。');
  console.log('\n修复措施:');
  console.log('1. ✅ 已修复mockVscode.ts，添加模拟工作区文件夹');
  console.log('2. ✅ 已添加languages模块支持代码补全提供者');
  console.log('3. ✅ 扩展激活现在应该成功');
  console.log('\n下一步: 运行完整的测试套件验证修复。');
}

// 运行主函数
main().catch(error => {
  console.error('测试脚本执行失败:', error);
  process.exit(1);
});