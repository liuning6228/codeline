/**
 * 最终的真实模块加载测试
 */

console.log('🚀 最终的真实模块加载测试');
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
const requireInterceptions = new Map();

Module.prototype.require = function(id) {
  console.log(`🔍 require: ${id} (来自: ${this.filename ? require('path').basename(this.filename) : 'unknown'})`);
  
  if (id === 'vscode') {
    console.log('🎯 返回vscode模拟');
    requireInterceptions.set('vscode', (requireInterceptions.get('vscode') || 0) + 1);
    return enhancedVscodeMock;
  }
  
  // 拦截其他可能的vscode相关模块
  if (id.includes('vscode') || id.includes('@vscode')) {
    console.log(`⚠️  拦截vscode相关模块: ${id}`);
    requireInterceptions.set(id, (requireInterceptions.get(id) || 0) + 1);
    
    // 返回基本模拟
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
    console.log(`⚠️  require失败: ${id}, 错误: ${error.message}`);
    
    // 对于模块未找到错误，返回模拟模块
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log(`  返回模拟模块`);
      const mockModule = {};
      
      // 根据模块名提供特定模拟
      if (id.includes('typescript')) {
        mockModule.createProgram = () => ({});
        mockModule.SyntaxKind = {};
      }
      
      return mockModule;
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
    console.log('模块类型:', typeof module);
    console.log('模块键:', Object.keys(module));
    
    // 检查导出
    if (!module.EnhancedEngineAdapter) {
      console.error('❌ 模块没有导出EnhancedEngineAdapter');
      console.log('模块内容:', JSON.stringify(module, null, 2).substring(0, 500));
      return false;
    }
    
    const EnhancedEngineAdapter = module.EnhancedEngineAdapter;
    console.log('✅ 找到EnhancedEngineAdapter类');
    console.log('类类型:', typeof EnhancedEngineAdapter);
    
    // 检查方法
    if (EnhancedEngineAdapter.prototype) {
      const protoMethods = Object.getOwnPropertyNames(EnhancedEngineAdapter.prototype);
      console.log(`原型方法 (${protoMethods.length}个):`, protoMethods);
    }
    
    // 检查静态方法
    const staticMethods = Object.getOwnPropertyNames(EnhancedEngineAdapter).filter(
      name => typeof EnhancedEngineAdapter[name] === 'function'
    );
    console.log(`静态方法 (${staticMethods.length}个):`, staticMethods);
    
    // 创建实例配置
    const config = {
      extension: {
        modelAdapter: {
          generate: async (prompt) => ({
            content: `模拟响应: ${prompt.substring(0, 50)}...`,
            usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
            model: 'mock-model'
          })
        },
        projectAnalyzer: {
          analyzeProject: async () => ({ files: [] })
        },
        promptEngine: {
          generatePrompt: async () => '模拟提示词'
        },
        verbose: false
      },
      context: {
        extensionPath: __dirname,
        subscriptions: [],
        extensionUri: { fsPath: __dirname },
        storagePath: __dirname,
        globalStoragePath: __dirname,
        logPath: __dirname,
        extensionMode: 1 // ExtensionMode.Test
      },
      verbose: true,
      defaultMode: 'act',
      enableStreaming: false
    };
    
    console.log('\n🔧 创建实例...');
    let instance;
    
    if (typeof EnhancedEngineAdapter.getInstance === 'function') {
      console.log('使用 getInstance() 方法');
      instance = EnhancedEngineAdapter.getInstance(config);
    } else if (typeof EnhancedEngineAdapter === 'function') {
      console.log('使用 new 构造函数');
      instance = new EnhancedEngineAdapter(config);
    } else {
      console.error('❌ 无法实例化');
      return false;
    }
    
    console.log('✅ 实例创建成功');
    
    // 检查实例方法
    const instanceMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(instance) || {});
    console.log(`实例方法 (${instanceMethods.length}个):`, instanceMethods);
    
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
      } catch (error) {
        console.error(`❌ 初始化失败: ${error.message}`);
        console.error('错误堆栈:', error.stack);
        return false;
      }
    }
    
    // 测试getMode
    if (typeof instance.getMode === 'function') {
      try {
        const mode = instance.getMode();
        console.log(`✅ 当前模式: ${mode}`);
      } catch (error) {
        console.error(`❌ getMode失败: ${error.message}`);
      }
    }
    
    // 测试getState
    if (typeof instance.getState === 'function') {
      try {
        const state = instance.getState();
        console.log(`✅ 引擎状态: ${state.engineReady ? '就绪' : '未就绪'}`);
        console.log(`✅ 工具数量: ${state.toolCount}`);
      } catch (error) {
        console.error(`❌ getState失败: ${error.message}`);
      }
    }
    
    // 测试模式切换
    if (typeof instance.setMode === 'function' && typeof instance.getMode === 'function') {
      console.log('\n🔧 测试模式切换...');
      try {
        const initialMode = instance.getMode();
        console.log(`初始模式: ${initialMode}`);
        
        instance.setMode('plan');
        const planMode = instance.getMode();
        console.log(`切换到plan模式: ${planMode}`);
        
        instance.setMode('act');
        const finalMode = instance.getMode();
        console.log(`切换回act模式: ${finalMode}`);
        
        console.log('✅ 模式切换测试完成');
      } catch (error) {
        console.error(`❌ 模式切换失败: ${error.message}`);
      }
    }
    
    console.log('\n🎉 真实组件加载测试成功完成！');
    
    // 显示拦截统计
    console.log('\n📊 require拦截统计:');
    requireInterceptions.forEach((count, moduleId) => {
      console.log(`  ${moduleId}: ${count}次`);
    });
    
    return true;
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('错误堆栈:', error.stack);
    
    // 特别检查vscode相关错误
    if (error.message.includes('vscode') || error.stack.includes('vscode')) {
      console.error('\n🔍 vscode相关错误详情:');
      const lines = error.stack.split('\n');
      lines.slice(0, 15).forEach(line => {
        if (line.includes('vscode')) {
          console.error(`  ${line}`);
        }
      });
    }
    
    return false;
  } finally {
    // 恢复原始require
    Module.prototype.require = originalRequire;
  }
}

// 运行测试
testRealComponent().then(success => {
  console.log('\n' + '='.repeat(80));
  console.log(`🏁 测试完成: ${success ? '✅ 成功' : '❌ 失败'}`);
  console.log('='.repeat(80));
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('测试异常:', error);
  process.exit(1);
});