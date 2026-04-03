/**
 * 插件系统初始化诊断
 * 模拟VS Code环境，检查插件系统初始化是否成功
 */

// 清除模块缓存以确保获取最新版本
delete require.cache[require.resolve('./out/test/helpers/mockVscode.js')];

// 模拟VS Code模块
const mockVscodeModule = require('./out/test/helpers/mockVscode.js');
// 获取实际的mockVscode对象（可能是mockVscode属性或default导出）
const mockVscode = mockVscodeModule.mockVscode || mockVscodeModule.default || mockVscodeModule;
console.log(`[DEBUG] Loaded mockVscode module structure:`, Object.keys(mockVscodeModule));
console.log(`[DEBUG] Using mockVscode object with keys:`, Object.keys(mockVscode).slice(0, 10));

// 确保mockVscode具有所有必需的API
// 增强mockVscode，添加缺失的API
if (!mockVscode.window) {
  mockVscode.window = {};
}
if (!mockVscode.window.createOutputChannel) {
  mockVscode.window.createOutputChannel = (name) => ({
    name,
    append: (value) => console.log(`[${name}]`, value),
    appendLine: (value) => console.log(`[${name}]`, value),
    replace: (value) => console.log(`[${name} REPLACE]`, value),
    clear: () => {},
    show: () => {},
    hide: () => {},
    dispose: () => {}
  });
}

// 确保commands对象存在且完整
if (!mockVscode.commands) {
  mockVscode.commands = {};
}
if (!mockVscode.commands.registerCommand) {
  mockVscode.commands.registerCommand = (command, callback) => ({
    command,
    callback,
    dispose: () => {}
  });
}
if (!mockVscode.commands.executeCommand) {
  mockVscode.commands.executeCommand = async (command, ...args) => {
    console.log(`[MOCK] executeCommand: ${command}`, args);
    return undefined;
  };
}

// 确保ProgressLocation存在
if (!mockVscode.ProgressLocation) {
  mockVscode.ProgressLocation = {
    Notification: 15,
    Window: 10,
    SourceControl: 1
  };
}

// 设置全局vscode模拟（供直接访问global.vscode的代码使用）
// 注意：setupGlobalVscodeMock 在 mockVscodeModule 上，而不是 mockVscode 对象上
if (typeof mockVscodeModule.setupGlobalVscodeMock === 'function') {
  mockVscodeModule.setupGlobalVscodeMock();
}

// 覆盖require，确保vscode模块使用模拟版本
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
  if (id === 'vscode') {
    console.log(`[MODULE INJECTION] require('${id}') -> returning mockVscode`);
    console.log(`[DEBUG] mockVscode.commands exists: ${!!mockVscode.commands}`);
    console.log(`[DEBUG] mockVscode.commands.registerCommand exists: ${!!mockVscode.commands.registerCommand}`);
    console.log(`[DEBUG] mockVscode.window.registerWebviewViewProvider type: ${typeof mockVscode.window.registerWebviewViewProvider}`);
    console.log(`[DEBUG] mockVscode.ProgressLocation.Notification: ${mockVscode.ProgressLocation?.Notification}`);
    return mockVscode;
  }
  return originalRequire.apply(this, arguments);
};

// 同时设置全局变量，以防有代码直接访问global.vscode
global.vscode = mockVscode;

async function diagnosePluginSystem() {
  console.log('🔍 开始插件系统初始化诊断');
  console.log('========================================\n');
  
  try {
    // 模拟扩展上下文
    const mockExtensionContext = {
      subscriptions: [],
      extensionPath: '/test/extension',
      storagePath: '/test/storage',
      globalStoragePath: '/test/global-storage',
      logPath: '/test/logs',
      asAbsolutePath: (relativePath) => `/test/extension/${relativePath}`,
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
      extensionMode: 1, // ExtensionMode.Development
      environmentVariableCollection: {}
    };

    // 模拟工具上下文
    const mockToolContext = {
      extensionContext: mockExtensionContext,
      workspaceRoot: '/test/workspace',
      cwd: '/test/workspace',
      outputChannel: {
        name: 'test-channel',
        append: (value) => console.log('[OUTPUT]', value),
        appendLine: (value) => console.log('[OUTPUT]', value),
        replace: (value) => console.log('[REPLACE]', value),
        clear: () => {},
        show: () => {},
        hide: () => {},
        dispose: () => {}
      },
      sessionId: 'test-session-' + Date.now(),
      sharedResources: {}
    };

    console.log('📦 加载PluginExtension模块...');
    
    // 在加载PluginExtension之前，检查vscode模块的状态
    const vscodeCheck = require('vscode');
    console.log(`[PRE-CHECK] vscode.window type: ${typeof vscodeCheck.window}`);
    console.log(`[PRE-CHECK] vscode.window.registerWebviewViewProvider type: ${typeof vscodeCheck.window?.registerWebviewViewProvider}`);
    console.log(`[PRE-CHECK] vscode.ProgressLocation.Notification: ${vscodeCheck.ProgressLocation?.Notification}`);
    
    const { PluginExtension } = require('./out/plugins/PluginExtension.js');
    
    console.log('🔄 获取PluginExtension实例...');
    const pluginExtension = PluginExtension.getInstance(mockExtensionContext, mockToolContext);
    
    console.log('🚀 初始化插件系统...');
    await pluginExtension.initialize();
    
    console.log('\n✅ 插件系统初始化成功！');
    
    // 获取状态
    const state = await pluginExtension.getState();
    console.log('📊 插件系统状态:');
    console.log(JSON.stringify(state, null, 2));
    
    // 列出插件
    console.log('\n📋 列出插件...');
    await pluginExtension.listPlugins();
    
    console.log('\n🎉 诊断完成：插件系统工作正常');
    return { success: true, state };
    
  } catch (error) {
    console.error('\n❌ 插件系统初始化失败:');
    console.error('错误信息:', error.message);
    console.error('错误堆栈:', error.stack);
    
    // 检查是否是因为缺少工作区文件夹
    if (error.message.includes('No workspace folder')) {
      console.error('\n⚠️  错误原因：需要打开的工作区文件夹');
      console.error('   在真实VS Code环境中，需要先打开一个项目文件夹');
    }
    
    // 检查是否是插件加载错误
    if (error.message.includes('Plugin') || error.message.includes('plugin')) {
      console.error('\n⚠️  错误原因：插件加载失败');
      console.error('   检查插件目录和插件实现');
    }
    
    return { success: false, error: error.message };
  }
}

// 运行诊断
diagnosePluginSystem().then(result => {
  console.log('\n========================================');
  console.log('诊断结果:', result.success ? '✅ 成功' : '❌ 失败');
  process.exit(result.success ? 0 : 1);
}).catch(err => {
  console.error('诊断脚本异常:', err);
  process.exit(1);
});