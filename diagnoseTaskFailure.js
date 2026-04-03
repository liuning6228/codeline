/**
 * 诊断 "Task execution failed" 错误
 * 直接运行扩展代码，绕过测试框架
 */

async function diagnoseTaskFailure() {
  const Module = require('module');
  const originalRequire = Module.prototype.require;
  const path = require('path');

  console.log('🔍 诊断 "Task execution failed" 错误');
  console.log('═══════════════════════════════════════\n');

  // 设置vscode模块mock
  console.log('1. 设置模拟环境...');
  try {
    const mockVscodePath = path.join(__dirname, 'out', 'test', 'helpers', 'mockVscode.js');
    console.log(`   加载模拟vscode: ${mockVscodePath}`);
    
    Module.prototype.require = function(id) {
      if (id === 'vscode') {
        const mockVscode = originalRequire.call(this, mockVscodePath);
        console.log('   ✅ vscode模块模拟成功');
        return mockVscode;
      }
      return originalRequire.apply(this, arguments);
    };
  } catch (error) {
    console.error('   ❌ 无法加载mockVscode:', error.message);
    process.exit(1);
  }

  // 设置环境变量
  process.env.NODE_ENV = 'test';
  process.env.CODELINE_TEST = 'true';

  console.log('\n2. 加载扩展模块...');
  let Extension;
  try {
    const extensionPath = path.join(__dirname, 'out', 'extension.js');
    console.log(`   加载扩展: ${extensionPath}`);
    Extension = require(extensionPath);
    console.log('   ✅ 扩展模块加载成功');
  } catch (error) {
    console.error('   ❌ 无法加载扩展模块:', error.message);
    process.exit(1);
  }

  console.log('\n3. 检查扩展导出...');
  try {
    // 检查导出的activate函数
    if (typeof Extension.activate !== 'function') {
      console.error('   ❌ 扩展没有导出activate函数');
      process.exit(1);
    }
    
    if (typeof Extension.deactivate !== 'function') {
      console.warn('   ⚠️  扩展没有导出deactivate函数');
    }
    
    console.log('   ✅ 扩展导出正确');
  } catch (error) {
    console.error('   ❌ 检查扩展导出失败:', error.message);
    process.exit(1);
  }

  console.log('\n4. 模拟扩展上下文...');
  const mockExtensionContext = {
    subscriptions: [],
    extensionPath: __dirname,
    storagePath: '/tmp/codeline-test',
    globalStoragePath: '/tmp/codeline-test-global',
    logPath: '/tmp/codeline-test-logs',
    asAbsolutePath: (relativePath) => path.join(__dirname, relativePath),
    workspaceState: {
      get: (key) => undefined,
      update: async (key, value) => {},
      keys: () => []
    },
    globalState: {
      get: (key) => undefined,
      update: async (key, value) => {},
      keys: () => []
    },
    extensionMode: 1, // Development
    environmentVariableCollection: {}
  };

  console.log('   ✅ 扩展上下文创建成功');

  console.log('\n5. 激活扩展...');
  let extensionInstance;
  try {
    // 激活扩展
    extensionInstance = await Extension.activate(mockExtensionContext);
    console.log('   ✅ 扩展激活成功');
    
    // 检查扩展实例
    if (!extensionInstance) {
      console.warn('   ⚠️  扩展激活返回undefined，检查是否有导出默认实例');
      
      // 尝试获取默认导出
      if (Extension.default) {
        console.log('   尝试使用默认导出...');
        extensionInstance = Extension.default;
      }
    }
  } catch (error) {
    console.error('   ❌ 扩展激活失败:', error.message);
    console.error('   堆栈:', error.stack);
    process.exit(1);
  }

  console.log('\n6. 检查扩展实例方法...');
  try {
    if (!extensionInstance) {
      console.error('   ❌ 扩展实例不存在');
      process.exit(1);
    }
    
    // 检查关键方法
    const requiredMethods = ['executeTask', 'getSidebarProvider'];
    const missingMethods = [];
    
    for (const method of requiredMethods) {
      if (typeof extensionInstance[method] !== 'function') {
        missingMethods.push(method);
        console.warn(`   ⚠️  缺少方法: ${method}`);
      }
    }
    
    if (missingMethods.length > 0) {
      console.log(`   ℹ️  扩展实例方法: ${Object.keys(extensionInstance).join(', ')}`);
    } else {
      console.log('   ✅ 所有关键方法存在');
    }
  } catch (error) {
    console.error('   ❌ 检查扩展实例方法失败:', error.message);
    process.exit(1);
  }

  console.log('\n7. 测试任务执行...');
  try {
    if (typeof extensionInstance.executeTask === 'function') {
      console.log('   尝试执行模拟任务...');
      
      const mockTask = {
        type: 'diagnostic',
        prompt: '测试任务执行',
        taskId: 'test-' + Date.now()
      };
      
      console.log('   任务内容:', JSON.stringify(mockTask, null, 2));
      
      try {
        const result = await extensionInstance.executeTask(mockTask);
        console.log('   ✅ 任务执行成功!');
        console.log('   结果:', result);
      } catch (taskError) {
        console.error('   ❌ 任务执行失败!');
        console.error('   错误信息:', taskError.message);
        console.error('   错误堆栈:', taskError.stack);
        
        // 分析错误类型
        if (taskError.message.includes('not configured') || taskError.message.includes('API key')) {
          console.log('\n🔧 诊断: 可能是API密钥配置问题');
          console.log('     扩展可能需要配置模型API密钥');
        } else if (taskError.message.includes('workspace') || taskError.message.includes('folder')) {
          console.log('\n🔧 诊断: 可能是工作区文件夹问题');
          console.log('     扩展可能需要打开的工作区文件夹');
        } else if (taskError.message.includes('engine') || taskError.message.includes('initialization')) {
          console.log('\n🔧 诊断: 可能是任务引擎初始化问题');
          console.log('     任务引擎可能初始化失败');
        } else {
          console.log('\n🔧 诊断: 其他错误类型');
        }
      }
    } else {
      console.log('   ℹ️  executeTask方法不存在，跳过任务执行测试');
    }
  } catch (error) {
    console.error('   ❌ 测试任务执行过程中出错:', error.message);
  }

  console.log('\n8. 检查侧边栏提供者...');
  try {
    if (typeof extensionInstance.getSidebarProvider === 'function') {
      const sidebarProvider = extensionInstance.getSidebarProvider();
      console.log('   ✅ 侧边栏提供者获取成功');
      
      // 检查侧边栏方法
      if (sidebarProvider) {
        console.log(`   ℹ️  侧边栏提供者类型: ${typeof sidebarProvider}`);
        
        // 检查是否有_handleTaskExecution方法
        if (typeof sidebarProvider._handleTaskExecution === 'function') {
          console.log('   ✅ 侧边栏有_handleTaskExecution方法');
        } else {
          console.warn('   ⚠️  侧边栏缺少_handleTaskExecution方法');
        }
      }
    } else {
      console.log('   ℹ️  getSidebarProvider方法不存在');
    }
  } catch (error) {
    console.error('   ❌ 检查侧边栏提供者失败:', error.message);
  }

  console.log('\n9. 检查插件系统...');
  try {
    if (typeof extensionInstance.getPluginSystemStatus === 'function') {
      const pluginStatus = await extensionInstance.getPluginSystemStatus();
      console.log('   ✅ 插件系统状态查询成功');
      console.log('   状态:', JSON.stringify(pluginStatus, null, 2));
    } else {
      console.log('   ℹ️  getPluginSystemStatus方法不存在');
    }
  } catch (error) {
    console.warn('   ⚠️  插件系统状态查询失败:', error.message);
  }

  console.log('\n═══════════════════════════════════════');
  console.log('🔍 诊断完成');
  console.log('\n📋 建议:');

  // 基于诊断结果提供建议
  console.log('1. 如果任务执行失败是因为API密钥配置:');
  console.log('   - 检查CodeLine配置设置');
  console.log('   - 确保模型API密钥已正确配置');

  console.log('\n2. 如果任务执行失败是因为工作区问题:');
  console.log('   - 确保在VS Code中打开了工作区文件夹');
  console.log('   - 扩展可能需要工作区上下文');

  console.log('\n3. 如果任务执行失败是因为任务引擎:');
  console.log('   - 检查任务引擎初始化逻辑');
  console.log('   - 查看extension.ts中的ensureTaskEngineInitialized()方法');

  console.log('\n4. 如果侧边栏与扩展集成有问题:');
  console.log('   - 检查sidebarProvider.ts中的_handleTaskExecution方法');
  console.log('   - 验证this._extension引用是否正确');

  // 恢复原始require
  Module.prototype.require = originalRequire;
}

// 运行诊断
diagnoseTaskFailure().catch(error => {
  console.error('诊断脚本执行失败:', error);
  process.exit(1);
});