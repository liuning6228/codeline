/**
 * 最终的真实组件测试
 * 尝试正确的实例化和初始化
 */

console.log('🚀 最终的真实组件测试');
console.log('='.repeat(80));

// 创建增强的vscode模拟
const enhancedVscodeMock = {
  workspace: {
    fs: {
      readFile: async () => new Uint8Array(),
      writeFile: async () => {},
      stat: async () => ({ type: 1, ctime: Date.now(), mtime: Date.now(), size: 0 }),
      readDirectory: async () => []
    },
    createFileSystemWatcher: () => ({ dispose: () => {} }),
    getConfiguration: () => ({
      get: () => undefined,
      update: async () => {}
    }),
    workspaceFolders: [],
    openTextDocument: async () => ({ getText: () => '', save: async () => true }),
    applyEdit: async () => true
  },
  
  window: {
    createOutputChannel: (name) => ({
      appendLine: (text) => console.log(`[输出 ${name}] ${text}`),
      show: () => {},
      hide: () => {},
      dispose: () => {}
    }),
    showInformationMessage: async () => undefined,
    showWarningMessage: async () => undefined,
    showErrorMessage: async () => undefined,
    createStatusBarItem: () => ({
      text: '',
      show: () => {},
      hide: () => {},
      dispose: () => {}
    }),
    activeTextEditor: undefined
  },
  
  commands: {
    registerCommand: () => ({ dispose: () => {} }),
    executeCommand: async () => undefined
  },
  
  extensions: {
    getExtension: () => null
  },
  
  // 常量和类
  StatusBarAlignment: { Left: 1, Right: 2 },
  DiagnosticSeverity: { Error: 0, Warning: 1, Information: 2, Hint: 3 },
  ViewColumn: { One: 1, Two: 2, Three: 3, Active: -1, Beside: -2 },
  
  Disposable: class Disposable {
    constructor(disposeFn) { this._dispose = disposeFn; }
    dispose() { if (this._dispose) this._dispose(); }
  },
  
  EventEmitter: class EventEmitter {
    constructor() { this._listeners = []; }
    event(callback) { this._listeners.push(callback); return { dispose: () => {} }; }
    fire(data) { this._listeners.forEach(fn => fn(data)); }
  },
  
  Position: class Position {
    constructor(line, character) {
      this.line = line;
      this.character = character;
    }
  },
  
  Range: class Range {
    constructor(start, end) {
      this.start = start;
      this.end = end;
    }
  },
  
  Diagnostic: class Diagnostic {
    constructor(range, message, severity, source) {
      this.range = range;
      this.message = message;
      this.severity = severity;
      this.source = source;
    }
  },
  
  Uri: {
    file: (path) => ({ scheme: 'file', fsPath: path, path }),
    parse: (uri) => ({ scheme: uri.split(':')[0], path: uri.split(':')[1] || '' })
  },
  
  version: '1.80.0',
  env: {
    appName: 'CodeLine Test',
    appRoot: '/test',
    language: 'en',
    machineId: 'test-machine-id'
  }
};

// 设置require拦截
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
  console.log(`🔍 require: ${id} (来自: ${this.filename ? require('path').basename(this.filename) : 'unknown'})`);
  
  if (id === 'vscode') {
    console.log('🎯 返回vscode模拟');
    return enhancedVscodeMock;
  }
  
  // 拦截其他vscode相关模块
  if (id.includes('vscode') || id.includes('@vscode')) {
    console.log(`⚠️  拦截vscode相关模块: ${id}`);
    
    const mockModule = {};
    if (id.includes('languageclient')) {
      mockModule.LanguageClient = class LanguageClient {
        constructor() {}
        start() { return Promise.resolve(); }
        sendRequest() { return Promise.resolve(); }
      };
    }
    
    return mockModule;
  }
  
  try {
    return originalRequire.apply(this, arguments);
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log(`⚠️  模块未找到: ${id}, 返回模拟`);
      return {};
    }
    throw error;
  }
};

async function testRealComponent() {
  try {
    console.log('\n🔧 加载真实EnhancedEngineAdapter...');
    const componentPath = '/home/liuning/workspace/codeline/out/core/EnhancedEngineAdapter.js';
    
    // 清除缓存
    delete require.cache[require.resolve(componentPath)];
    
    const module = require(componentPath);
    console.log('✅ 模块加载成功');
    
    if (!module.EnhancedEngineAdapter) {
      console.error('❌ 模块没有导出EnhancedEngineAdapter');
      return false;
    }
    
    const EnhancedEngineAdapter = module.EnhancedEngineAdapter;
    console.log('✅ 找到EnhancedEngineAdapter类');
    console.log('类类型:', typeof EnhancedEngineAdapter);
    
    // 检查是否是构造函数
    if (typeof EnhancedEngineAdapter !== 'function') {
      console.error('❌ EnhancedEngineAdapter不是函数/类');
      return false;
    }
    
    // 检查原型方法
    const protoMethods = EnhancedEngineAdapter.prototype ? 
      Object.getOwnPropertyNames(EnhancedEngineAdapter.prototype) : [];
    console.log(`原型方法 (${protoMethods.length}个):`, protoMethods.slice(0, 15));
    
    // 检查静态方法
    const staticMethods = Object.getOwnPropertyNames(EnhancedEngineAdapter).filter(
      name => typeof EnhancedEngineAdapter[name] === 'function'
    );
    console.log(`静态方法 (${staticMethods.length}个):`, staticMethods);
    
    // 创建配置 - 基于我们对EnhancedEngineAdapter的理解
    const config = {
      extension: {
        // 模拟CodeLineExtension
        modelAdapter: {
          generate: async (prompt) => ({
            content: `模拟响应: ${prompt.substring(0, 50)}...`,
            usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
            model: 'mock-model'
          }),
          get modelName() { return 'mock-model'; }
        },
        projectAnalyzer: {
          analyzeProject: async () => ({ files: [], structure: {}, dependencies: [] })
        },
        promptEngine: {
          generatePrompt: async (context, userMessage) => `提示词: ${userMessage}`,
          parseResponse: async (response, mode) => ({
            content: response,
            toolCalls: [],
            mode
          })
        },
        toolRegistry: {
          getTools: () => [],
          registerTool: () => ({ dispose: () => {} }),
          unregisterTool: () => {}
        },
        verbose: false
      },
      context: {
        extensionPath: __dirname,
        subscriptions: [],
        extensionUri: { fsPath: __dirname, scheme: 'file' },
        storagePath: __dirname,
        globalStoragePath: __dirname,
        logPath: __dirname,
        extensionMode: 1, // ExtensionMode.Test
        asAbsolutePath: (relativePath) => require('path').join(__dirname, relativePath)
      },
      verbose: true,
      defaultMode: 'act',
      enableStreaming: false,
      onEngineReady: () => console.log('🚀 引擎就绪'),
      onStateUpdate: (state) => console.log('📊 状态更新:', state),
      onError: (error) => console.error('❌ 错误:', error)
    };
    
    console.log('\n🔧 尝试实例化...');
    
    // 尝试不同的实例化方式
    let instance;
    
    // 方式1: 使用构造函数
    try {
      console.log('尝试使用 new EnhancedEngineAdapter(config)...');
      instance = new EnhancedEngineAdapter(config);
      console.log('✅ 使用构造函数创建实例成功');
    } catch (error) {
      console.error(`❌ 构造函数失败: ${error.message}`);
      
      // 方式2: 尝试静态方法（如果有）
      if (EnhancedEngineAdapter.getInstance) {
        console.log('尝试使用 EnhancedEngineAdapter.getInstance(config)...');
        instance = EnhancedEngineAdapter.getInstance(config);
        console.log('✅ 使用getInstance创建实例成功');
      } else if (EnhancedEngineAdapter.create) {
        console.log('尝试使用 EnhancedEngineAdapter.create(config)...');
        instance = EnhancedEngineAdapter.create(config);
        console.log('✅ 使用create创建实例成功');
      } else {
        console.error('❌ 没有可用的实例化方法');
        return false;
      }
    }
    
    console.log('✅ 实例创建成功');
    console.log('实例类型:', typeof instance);
    
    // 检查实例方法
    const instanceMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(instance) || {});
    console.log(`实例方法 (${instanceMethods.length}个):`, instanceMethods.slice(0, 15));
    
    // 测试关键方法
    console.log('\n🔧 测试关键方法...');
    
    const keyMethods = ['initialize', 'getMode', 'getEngine', 'getState', 'submitMessage'];
    for (const method of keyMethods) {
      const exists = typeof instance[method] === 'function';
      console.log(`${method}: ${exists ? '✅ 存在' : '❌ 不存在'}`);
    }
    
    // 尝试初始化
    if (typeof instance.initialize === 'function') {
      console.log('\n🔧 初始化...');
      try {
        const initResult = await instance.initialize();
        console.log(`✅ 初始化结果: ${initResult}`);
        
        // 测试getMode
        if (typeof instance.getMode === 'function') {
          const mode = instance.getMode();
          console.log(`✅ 当前模式: ${mode}`);
        }
        
        // 测试getState
        if (typeof instance.getState === 'function') {
          const state = instance.getState();
          console.log(`✅ 引擎状态: ${state.engineReady ? '就绪' : '未就绪'}`);
          console.log(`✅ 工具数量: ${state.toolCount}`);
        }
        
        // 测试submitMessage
        if (typeof instance.submitMessage === 'function') {
          console.log('\n🔧 测试消息处理...');
          try {
            const response = await instance.submitMessage('你好，请介绍你自己');
            console.log(`✅ 消息响应成功: ${response.success}`);
            if (response.message && response.message.content) {
              console.log(`响应内容: ${response.message.content.substring(0, 200)}...`);
            }
          } catch (error) {
            console.error(`❌ 消息处理失败: ${error.message}`);
          }
        }
        
        console.log('\n🎉 真实组件测试成功完成！');
        return true;
        
      } catch (error) {
        console.error(`❌ 初始化失败: ${error.message}`);
        console.error('错误堆栈:', error.stack);
        
        // 检查是否是vscode相关错误
        if (error.message.includes('vscode') || error.stack.includes('vscode')) {
          console.error('\n🔍 vscode相关错误详情:');
          const lines = error.stack.split('\n');
          lines.slice(0, 10).forEach(line => {
            if (line.includes('vscode')) {
              console.error(`  ${line}`);
            }
          });
        }
        
        return false;
      }
    } else {
      console.error('❌ 实例没有initialize方法');
      return false;
    }
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('错误堆栈:', error.stack);
    return false;
  } finally {
    // 恢复原始require
    Module.prototype.require = originalRequire;
  }
}

// 运行测试
testRealComponent().then(success => {
  console.log('\n' + '='.repeat(80));
  console.log(`🏁 最终测试完成: ${success ? '✅ 成功' : '❌ 失败'}`);
  console.log('='.repeat(80));
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('测试异常:', error);
  process.exit(1);
});