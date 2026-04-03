/**
 * 修复的诊断脚本
 * 直接测试任务执行，绕过所有测试框架问题
 */

async function runDiagnostic() {
  console.log('🔧 修复的 "Task execution failed" 诊断');
  console.log('═══════════════════════════════════════\n');
  
  // 1. 手动创建vscode模拟
  console.log('1. 创建手动vscode模拟...');
  const mockVscode = {
    Uri: {
      file: (path) => ({ fsPath: path, toString: () => path }),
      parse: (uri) => ({ fsPath: uri, toString: () => uri })
    },
    workspace: {
      getConfiguration: (section) => {
        console.log(`   getConfiguration调用: section="${section}"`);
        return {
          get: (key, defaultValue) => {
            console.log(`   config.get调用: key="${key}", defaultValue="${defaultValue}"`);
            // 返回模拟值，避免配置错误
            if (key === 'apiKey') {
              return process.env.DEEPSEEK_API_KEY || 'test-api-key-mock';
            }
            if (key === 'defaultModel') {
              return 'deepseek-chat';
            }
            if (key === 'providerId') {
              return 'deepseek';
            }
            return defaultValue;
          },
          update: async (key, value) => {
            console.log(`   config.update调用: key="${key}", value="${value}"`);
          },
          inspect: (key) => null
        };
      },
      workspaceFolders: [],
      onDidChangeConfiguration: {
        dispose: () => {}
      },
      fs: {
        readFile: async () => Buffer.from(''),
        writeFile: async () => {},
        stat: async () => ({ type: 1, ctime: Date.now(), mtime: Date.now(), size: 0 })
      },
      openTextDocument: async () => ({ getText: () => '' })
    },
    window: {
      createOutputChannel: () => ({
        appendLine: (text) => console.log(`[OUTPUT]: ${text}`),
        append: () => {},
        clear: () => {},
        show: () => {},
        hide: () => {},
        dispose: () => {}
      }),
      showErrorMessage: async (message) => {
        console.error(`[ERROR]: ${message}`);
        return undefined;
      },
      showInformationMessage: async (message) => {
        console.log(`[INFO]: ${message}`);
        return undefined;
      },
      registerWebviewViewProvider: (viewId, provider, options) => {
        console.log(`注册Webview视图提供者: ${viewId}`);
        return { dispose: () => {} };
      },
      createStatusBarItem: () => ({
        text: '',
        tooltip: '',
        show: () => {},
        hide: () => {},
        dispose: () => {}
      }),
      showTextDocument: async (document, options) => ({
        document,
        options,
        reveal: async () => {},
        dispose: () => {}
      })
    },
    commands: {
      registerCommand: (command, callback) => {
        console.log(`注册命令: ${command}`);
        return { dispose: () => {} };
      }
    },
    languages: {
      registerCompletionItemProvider: (selector, provider, ...triggerCharacters) => {
        console.log(`注册完成项提供者: ${selector}, 触发器: ${triggerCharacters}`);
        return { dispose: () => {} };
      }
    },
    ExtensionMode: {
      Development: 1,
      Production: 2,
      Test: 3
    }
  };
  
  console.log('   ✅ vscode模拟创建完成');
  console.log(`   - workspace: ${mockVscode.workspace ? 'defined' : 'undefined'}`);
  console.log(`   - workspace.getConfiguration: ${typeof mockVscode.workspace.getConfiguration}`);
  
  // 2. 设置模块拦截
  console.log('\n2. 设置模块拦截...');
  const Module = require('module');
  const originalRequire = Module.prototype.require;
  
  Module.prototype.require = function(id) {
    if (id === 'vscode') {
      console.log(`   拦截vscode模块请求`);
      return mockVscode;
    }
    return originalRequire.apply(this, arguments);
  };
  
  // 3. 设置环境变量
  process.env.NODE_ENV = 'test';
  process.env.CODELINE_TEST = 'true';
  if (!process.env.DEEPSEEK_API_KEY) {
    process.env.DEEPSEEK_API_KEY = 'test-api-key-for-diagnostic';
  }
  
  console.log('   ✅ 模块拦截和环境变量设置完成');
  
  // 4. 加载扩展
  console.log('\n3. 加载扩展模块...');
  let Extension;
  try {
    const extensionPath = require('path').join(__dirname, 'out', 'extension.js');
    console.log(`   加载: ${extensionPath}`);
    Extension = require(extensionPath);
    console.log('   ✅ 扩展模块加载成功');
  } catch (error) {
    console.error('   ❌ 扩展模块加载失败:', error.message);
    console.error('   堆栈:', error.stack);
    
    // 恢复原始require
    Module.prototype.require = originalRequire;
    return;
  }
  
  // 5. 创建模拟上下文
  console.log('\n4. 创建扩展上下文...');
  const mockContext = {
    subscriptions: [],
    extensionPath: __dirname,
    storagePath: '/tmp/codeline-diagnostic',
    globalStoragePath: '/tmp/codeline-diagnostic-global',
    logPath: '/tmp/codeline-diagnostic-logs',
    asAbsolutePath: (relativePath) => require('path').join(__dirname, relativePath),
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
  let extensionInstance;
  try {
    extensionInstance = await Extension.activate(mockContext);
    console.log('   ✅ 扩展激活成功');
    
    // 检查扩展实例
    if (!extensionInstance) {
      console.warn('   ⚠️  扩展激活返回undefined');
      if (Extension.default) {
        console.log('   尝试使用默认导出...');
        extensionInstance = Extension.default;
      }
    }
    
    if (extensionInstance) {
      console.log(`   ℹ️  扩展实例类型: ${typeof extensionInstance}`);
      console.log(`   ℹ️  扩展实例方法: ${Object.keys(extensionInstance).filter(k => typeof extensionInstance[k] === 'function').join(', ')}`);
    }
  } catch (error) {
    console.error('   ❌ 扩展激活失败:', error.message);
    console.error('   堆栈:', error.stack);
    
    // 恢复原始require
    Module.prototype.require = originalRequire;
    return;
  }
  
  // 7. 测试任务执行
  console.log('\n6. 测试任务执行...');
  if (extensionInstance && typeof extensionInstance.executeTask === 'function') {
    console.log('   执行测试任务...');
    
    const testTask = {
      type: 'diagnostic',
      prompt: '测试任务执行 - 诊断脚本',
      taskId: 'diagnostic-' + Date.now(),
      context: {
        files: [],
        workspacePath: __dirname
      }
    };
    
    console.log(`   任务ID: ${testTask.taskId}`);
    console.log(`   提示: ${testTask.prompt}`);
    
    try {
      console.log('   调用executeTask...');
      const startTime = Date.now();
      const result = await extensionInstance.executeTask(testTask);
      const duration = Date.now() - startTime;
      
      console.log(`   ✅ 任务执行成功! (耗时: ${duration}ms)`);
      console.log(`   结果类型: ${typeof result}`);
      if (result && typeof result === 'object') {
        console.log(`   结果键: ${Object.keys(result).join(', ')}`);
      }
    } catch (taskError) {
      console.error('   ❌ 任务执行失败!');
      console.error(`   错误: ${taskError.message}`);
      console.error(`   堆栈: ${taskError.stack}`);
      
      // 分析错误
      console.log('\n🔍 错误分析:');
      
      if (taskError.message.includes('not configured') || taskError.message.includes('API key')) {
        console.log('   - 原因: API密钥配置问题');
        console.log('   - 建议: 检查CodeLine配置或设置DEEPSEEK_API_KEY环境变量');
      } else if (taskError.message.includes('workspace') || taskError.message.includes('folder')) {
        console.log('   - 原因: 工作区文件夹问题');
        console.log('   - 建议: 确保在VS Code中打开了工作区文件夹');
      } else if (taskError.message.includes('engine') || taskError.message.includes('initialization')) {
        console.log('   - 原因: 任务引擎初始化失败');
        console.log('   - 建议: 检查任务引擎依赖或初始化逻辑');
      } else if (taskError.message.includes('model') || taskError.message.includes('adapter')) {
        console.log('   - 原因: 模型适配器问题');
        console.log('   - 建议: 检查模型适配器配置');
      } else {
        console.log(`   - 原因: 其他错误 (${taskError.message.substring(0, 100)}...)`);
      }
    }
  } else {
    console.log('   ℹ️  executeTask方法不存在或扩展实例不可用');
    if (extensionInstance) {
      console.log(`   可用方法: ${Object.keys(extensionInstance).filter(k => typeof extensionInstance[k] === 'function').join(', ')}`);
    }
  }
  
  // 8. 检查其他关键方法
  console.log('\n7. 检查扩展功能...');
  if (extensionInstance) {
    const methodsToCheck = ['getSidebarProvider', 'getPluginSystemStatus', 'getTaskEngineStatus'];
    
    for (const method of methodsToCheck) {
      if (typeof extensionInstance[method] === 'function') {
        try {
          console.log(`   调用 ${method}...`);
          const result = await extensionInstance[method]();
          console.log(`   ✅ ${method} 调用成功`);
          console.log(`     结果类型: ${typeof result}`);
        } catch (error) {
          console.log(`   ⚠️  ${method} 调用失败: ${error.message}`);
        }
      } else {
        console.log(`   ℹ️  ${method} 方法不存在`);
      }
    }
  }
  
  // 恢复原始require
  Module.prototype.require = originalRequire;
  
  console.log('\n═══════════════════════════════════════');
  console.log('🔧 诊断完成');
  console.log('\n📋 总结:');
  console.log('如果任务执行失败，最可能的原因是:');
  console.log('1. 任务引擎初始化失败 (ensureTaskEngineInitialized()错误)');
  console.log('2. 模型适配器配置问题 (API密钥或模型配置)');
  console.log('3. 工作区上下文缺失 (需要打开工作区文件夹)');
  console.log('\n要修复"Task execution failed"错误，请检查:');
  console.log('- extension.ts中的ensureTaskEngineInitialized()方法');
  console.log('- modelAdapter.ts中的配置加载逻辑');
  console.log('- 实际VS Code中的CodeLine配置设置');
}

// 运行诊断
runDiagnostic().catch(error => {
  console.error('诊断脚本执行失败:', error);
  process.exit(1);
});