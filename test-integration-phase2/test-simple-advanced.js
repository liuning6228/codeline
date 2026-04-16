/**
 * 简化版高级加载器测试
 */

console.log('🚀 简化版高级加载器测试...');

// 手动创建增强的vscode模拟（避免复杂的导入）
const createEnhancedVscodeMock = () => {
  return {
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
      workspaceFolders: []
    },
    window: {
      createOutputChannel: (name) => ({
        appendLine: (text) => console.log(`[输出 ${name}] ${text}`),
        show: () => {},
        hide: () => {},
        dispose: () => {}
      }),
      showInformationMessage: async () => undefined
    },
    commands: {
      registerCommand: () => ({ dispose: () => {} })
    },
    extensions: {
      getExtension: () => null
    },
    StatusBarAlignment: { Left: 1, Right: 2 },
    DiagnosticSeverity: { Error: 0, Warning: 1, Information: 2, Hint: 3 },
    Disposable: class Disposable {
      constructor(disposeFn) { this._dispose = disposeFn; }
      dispose() { if (this._dispose) this._dispose(); }
    },
    EventEmitter: class EventEmitter {
      constructor() { this._listeners = []; }
      event(callback) { this._listeners.push(callback); return { dispose: () => {} }; }
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
    Uri: {
      file: (path) => ({ scheme: 'file', fsPath: path, path }),
      parse: (uri) => ({ scheme: uri.split(':')[0], path: uri.split(':')[1] || '' })
    },
    version: '1.80.0'
  };
};

async function testSimpleLoader() {
  console.log('🔧 设置模块拦截...');
  
  const Module = require('module');
  const originalRequire = Module.prototype.require;
  const vscodeMock = createEnhancedVscodeMock();
  
  // 拦截require
  Module.prototype.require = function(id) {
    console.log(`🔍 require: ${id} (来自: ${this.filename ? require('path').basename(this.filename) : 'unknown'})`);
    
    if (id === 'vscode') {
      console.log('🎯 返回vscode模拟');
      return vscodeMock;
    }
    
    return originalRequire.apply(this, arguments);
  };
  
  try {
    console.log('\n📁 加载真实组件...');
    const componentPath = '/home/liuning/workspace/codeline/out/core/EnhancedEngineAdapter.js';
    console.log(`路径: ${componentPath}`);
    
    // 清除缓存
    delete require.cache[require.resolve(componentPath)];
    
    const module = require(componentPath);
    console.log('✅ 模块加载成功');
    console.log('导出键:', Object.keys(module));
    
    // 查找EnhancedEngineAdapter
    let EnhancedEngineAdapter;
    
    if (typeof module === 'function') {
      EnhancedEngineAdapter = module;
      console.log('✅ 模块是函数/类');
    } else if (module.EnhancedEngineAdapter) {
      EnhancedEngineAdapter = module.EnhancedEngineAdapter;
      console.log('✅ 找到命名导出');
    } else if (module.default) {
      if (typeof module.default === 'function') {
        EnhancedEngineAdapter = module.default;
        console.log('✅ 找到默认导出函数');
      } else if (module.default.EnhancedEngineAdapter) {
        EnhancedEngineAdapter = module.default.EnhancedEngineAdapter;
        console.log('✅ 找到默认导出中的类');
      }
    }
    
    if (!EnhancedEngineAdapter) {
      console.error('❌ 未找到EnhancedEngineAdapter');
      return false;
    }
    
    console.log('✅ 找到EnhancedEngineAdapter');
    console.log('类型:', typeof EnhancedEngineAdapter);
    
    // 检查方法
    if (EnhancedEngineAdapter.prototype) {
      const protoMethods = Object.getOwnPropertyNames(EnhancedEngineAdapter.prototype);
      console.log(`原型方法 (${protoMethods.length}个):`, protoMethods.slice(0, 10), 
                  protoMethods.length > 10 ? '...' : '');
    }
    
    // 创建实例
    console.log('\n🔧 创建实例...');
    const config = {
      extension: {
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
      },
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
    
    let instance;
    if (typeof EnhancedEngineAdapter.getInstance === 'function') {
      instance = EnhancedEngineAdapter.getInstance(config);
      console.log('✅ 使用getInstance()创建实例');
    } else if (typeof EnhancedEngineAdapter === 'function') {
      instance = new EnhancedEngineAdapter(config);
      console.log('✅ 使用new构造函数创建实例');
    } else {
      console.error('❌ 无法创建实例');
      return false;
    }
    
    console.log('✅ 实例创建成功');
    console.log('实例方法:', Object.getOwnPropertyNames(Object.getPrototypeOf(instance) || {}));
    
    // 测试初始化
    console.log('\n🔧 初始化实例...');
    if (typeof instance.initialize === 'function') {
      try {
        const initResult = await instance.initialize();
        console.log(`✅ 初始化结果: ${initResult}`);
      } catch (error) {
        console.error(`❌ 初始化失败: ${error.message}`);
        return false;
      }
    } else {
      console.log('⚠️  initialize方法不存在');
    }
    
    // 测试关键方法
    const testMethods = ['getMode', 'getEngine', 'getState', 'submitMessage'];
    console.log('\n🔧 测试关键方法...');
    
    for (const method of testMethods) {
      if (typeof instance[method] === 'function') {
        console.log(`✅ ${method} 方法存在`);
        
        // 尝试调用getMode
        if (method === 'getMode') {
          try {
            const mode = instance[method]();
            console.log(`  返回模式: ${mode}`);
          } catch (error) {
            console.log(`  调用失败: ${error.message}`);
          }
        }
      } else {
        console.log(`❌ ${method} 方法不存在`);
      }
    }
    
    console.log('\n🎉 简化测试成功完成！');
    return true;
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('错误堆栈:', error.stack);
    return false;
  } finally {
    // 恢复原始require
    Module.prototype.require = originalRequire;
  }
}

// 运行测试
testSimpleLoader().then(success => {
  console.log(`\n🏁 测试完成: ${success ? '✅ 成功' : '❌ 失败'}`);
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('测试异常:', error);
  process.exit(1);
});