/**
 * 调试vscode模块require问题
 */

const Module = require('module');
const originalRequire = Module.prototype.require;

// 创建增强的vscode模拟
const enhancedVscodeMock = {
  // 核心命名空间
  workspace: {
    fs: {
      readFile: () => Promise.resolve(new Uint8Array()),
      writeFile: () => Promise.resolve(),
      stat: () => Promise.resolve({ type: 1, ctime: Date.now(), mtime: Date.now(), size: 0 }),
      readDirectory: () => Promise.resolve([])
    },
    createFileSystemWatcher: () => ({ dispose: () => {} }),
    onDidChangeTextDocument: () => ({ dispose: () => {} }),
    onDidSaveTextDocument: () => ({ dispose: () => {} })
  },
  
  window: {
    createOutputChannel: (name) => {
      console.log(`[vscode模拟] 创建输出通道: ${name}`);
      return {
        appendLine: (text) => console.log(`[输出通道 ${name}] ${text}`),
        show: () => {},
        hide: () => {},
        dispose: () => {}
      };
    },
    showInformationMessage: () => Promise.resolve(undefined),
    showWarningMessage: () => Promise.resolve(undefined),
    showErrorMessage: () => Promise.resolve(undefined)
  },
  
  commands: {
    registerCommand: (command, handler) => {
      console.log(`[vscode模拟] 注册命令: ${command}`);
      return { dispose: () => {} };
    }
  },
  
  extensions: {
    getExtension: () => null
  },
  
  // StatusBarItem等常见类型
  StatusBarAlignment: { Left: 1, Right: 2 },
  
  // 模拟URI类
  Uri: {
    file: (path) => ({ scheme: 'file', fsPath: path, path }),
    parse: (uri) => ({ scheme: uri.split(':')[0], path: uri.split(':')[1] })
  },
  
  // EventEmitter等
  EventEmitter: class EventEmitter {
    constructor() { this._listeners = []; }
    event(callback) { this._listeners.push(callback); return { dispose: () => {} }; }
    fire(data) { this._listeners.forEach(fn => fn(data)); }
  },
  
  // 诊断相关
  Diagnostic: class Diagnostic {
    constructor(range, message, severity) {
      this.range = range;
      this.message = message;
      this.severity = severity;
    }
  },
  
  DiagnosticSeverity: { Error: 0, Warning: 1, Information: 2, Hint: 3 },
  
  // 其他常见导出
  Disposable: class Disposable {
    constructor(disposeFn) { this._dispose = disposeFn; }
    dispose() { if (this._dispose) this._dispose(); }
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
  
  // 版本信息
  version: '1.80.0'
};

// 增强require方法
Module.prototype.require = function(id) {
  console.log(`🔍 require调用: ${id} (来自: ${this.filename || 'unknown'})`);
  
  if (id === 'vscode') {
    console.log('🎯 拦截vscode模块请求，返回增强模拟');
    return enhancedVscodeMock;
  }
  
  // 对于其他模块，使用原始require
  return originalRequire.apply(this, arguments);
};

// 测试加载真实组件
console.log('🚀 测试增强的vscode模块拦截...');
try {
  const componentPath = '/home/liuning/workspace/codeline/out/core/EnhancedEngineAdapter.js';
  console.log(`📁 尝试加载: ${componentPath}`);
  
  // 清除缓存
  delete require.cache[require.resolve(componentPath)];
  
  const module = require(componentPath);
  console.log('✅ 成功加载真实EnhancedEngineAdapter模块');
  console.log('模块类型:', typeof module);
  console.log('模块键:', Object.keys(module));
  
  // 检查导出方式
  let EnhancedEngineAdapter;
  if (module.EnhancedEngineAdapter) {
    EnhancedEngineAdapter = module.EnhancedEngineAdapter;
    console.log('✅ 找到EnhancedEngineAdapter类（命名导出）');
  } else if (module.default && module.default.EnhancedEngineAdapter) {
    EnhancedEngineAdapter = module.default.EnhancedEngineAdapter;
    console.log('✅ 找到EnhancedEngineAdapter类（默认导出内嵌）');
  } else if (typeof module === 'function' || (module.default && typeof module.default === 'function')) {
    EnhancedEngineAdapter = module.default || module;
    console.log('✅ 找到EnhancedEngineAdapter类（默认导出函数）');
  } else {
    console.error('❌ 无法找到EnhancedEngineAdapter类');
    console.log('模块详情:', module);
    return;
  }
    
    // 尝试创建实例
    const mockExtension = {
      modelAdapter: {
        generate: async (prompt) => ({
          content: `模拟响应: ${prompt.substring(0, 50)}...`,
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
          model: 'mock-model'
        })
      },
      projectAnalyzer: { analyzeProject: async () => ({ files: [] }) },
      promptEngine: { generatePrompt: async () => '模拟提示词' },
      verbose: false
    };
    
    const config = {
      extension: mockExtension,
      context: {
        extensionPath: __dirname,
        subscriptions: [],
        extensionUri: { fsPath: __dirname },
        storagePath: __dirname,
        globalStoragePath: __dirname,
        logPath: __dirname
      },
      verbose: true,
      defaultMode: 'act'
    };
    
    console.log('🔧 尝试创建实例...');
    
    // 检查类的方法
    console.log('类原型方法:', Object.getOwnPropertyNames(EnhancedEngineAdapter.prototype || {}));
    
    let instance;
    if (typeof EnhancedEngineAdapter.getInstance === 'function') {
      instance = EnhancedEngineAdapter.getInstance(config);
    } else if (typeof EnhancedEngineAdapter === 'function') {
      // 可能是构造函数
      instance = new EnhancedEngineAdapter(config);
    } else {
      throw new Error('无法创建实例: 没有找到合适的方法');
    }
    console.log('✅ 实例创建成功');
    
    console.log('🔧 尝试初始化...');
    const initResult = await instance.initialize();
    console.log(`✅ 初始化结果: ${initResult}`);
    
  } else {
    console.error('❌ 未找到EnhancedEngineAdapter类');
  }
  
} catch (error) {
  console.error('❌ 加载失败:', error.message);
  console.error('错误堆栈:', error.stack);
  
  // 如果错误包含vscode引用，显示更多信息
  if (error.message.includes('vscode') || error.stack.includes('vscode')) {
    console.error('\n🔍 vscode相关错误详情:');
    const lines = error.stack.split('\n');
    lines.forEach(line => {
      if (line.includes('vscode')) {
        console.error(`  ${line}`);
      }
    });
  }
} finally {
  // 恢复原始require
  Module.prototype.require = originalRequire;
}