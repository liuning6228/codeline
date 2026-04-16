/**
 * 深度调试和分析脚本
 * 用于诊断真实EnhancedEngineAdapter加载问题
 */

const Module = require('module');
const path = require('path');
const fs = require('fs');

console.log('🔍 深度调试真实组件加载问题...');

// ==================== 步骤1: 加载增强的vscode模拟 ====================

try {
  // 先构建项目，确保增强模拟可用
  console.log('📦 构建项目以加载增强vscode模拟...');
  const { execSync } = require('child_process');
  try {
    execSync('npm run build', { cwd: __dirname, stdio: 'pipe' });
    console.log('✅ 项目构建成功');
  } catch (buildError) {
    console.log('⚠️  项目构建可能有问题，继续尝试...');
  }
} catch (error) {
  console.log('⚠️  构建检查跳过，继续...');
}

// 尝试加载增强模拟
let enhancedVscodeMock;
try {
  // 注意：这里需要先确保TypeScript编译完成
  // 我们直接创建内联的增强模拟来避免构建依赖
  console.log('🎯 创建内联增强vscode模拟...');
  
  enhancedVscodeMock = {
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
  
  console.log('✅ 增强vscode模拟创建成功');
} catch (error) {
  console.error('❌ 创建增强vscode模拟失败:', error.message);
  process.exit(1);
}

// ==================== 步骤2: 设置全局require拦截 ====================

const originalRequire = Module.prototype.require;
const interceptedModules = new Map();

Module.prototype.require = function(id) {
  console.log(`🔍 require调用: ${id} (来自: ${this.filename ? path.basename(this.filename) : 'unknown'})`);
  
  // 拦截vscode模块
  if (id === 'vscode') {
    console.log('🎯 拦截vscode模块请求');
    interceptedModules.set('vscode', (interceptedModules.get('vscode') || 0) + 1);
    return enhancedVscodeMock;
  }
  
  // 记录其他可能的问题模块
  if (id.includes('vscode') || id.includes('@vscode')) {
    console.log(`⚠️  检测到vscode相关模块: ${id}`);
    interceptedModules.set(id, (interceptedModules.get(id) || 0) + 1);
  }
  
  // 对特定模块进行特殊处理
  if (id === 'os' || id === 'path' || id === 'fs' || id === 'child_process') {
    // 这些是Node.js核心模块，正常处理
    return originalRequire.apply(this, arguments);
  }
  
  try {
    return originalRequire.apply(this, arguments);
  } catch (error) {
    console.error(`❌ require失败: ${id}`, error.message);
    
    // 对于模块未找到错误，返回一个模拟模块
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log(`⚠️  模块未找到: ${id}，返回模拟模块`);
      const mockModule = {
        // 默认导出空对象
      };
      
      // 根据模块名添加特定模拟
      if (id.includes('vscode-languageclient')) {
        mockModule.LanguageClient = class LanguageClient {
          constructor() {}
          start() { return Promise.resolve(); }
          stop() { return Promise.resolve(); }
          sendRequest() { return Promise.resolve(); }
        };
      }
      
      return mockModule;
    }
    
    throw error;
  }
};

// ==================== 步骤3: 尝试加载真实组件 ====================

async function testRealComponentLoading() {
  console.log('\n🚀 尝试加载真实EnhancedEngineAdapter...');
  
  const componentPath = '/home/liuning/workspace/codeline/out/core/EnhancedEngineAdapter.js';
  console.log(`📁 组件路径: ${componentPath}`);
  
  if (!fs.existsSync(componentPath)) {
    console.error(`❌ 组件文件不存在: ${componentPath}`);
    
    // 搜索可能的路径
    console.log('\n🔍 搜索可能的组件文件...');
    const searchPaths = [
      path.resolve(__dirname, '../codeline/out/core/EnhancedEngineAdapter.js'),
      path.resolve(process.cwd(), '../out/core/EnhancedEngineAdapter.js'),
      '/home/liuning/workspace/codeline/out/core/EnhancedEngineAdapter.js',
    ];
    
    let foundPath = null;
    for (const p of searchPaths) {
      if (fs.existsSync(p)) {
        foundPath = p;
        console.log(`✅ 找到文件: ${p}`);
        break;
      }
    }
    
    if (!foundPath) {
      console.error('❌ 未找到任何组件文件');
      return false;
    }
  }
  
  try {
    // 清除缓存
    delete require.cache[require.resolve(componentPath)];
    
    console.log('\n🔧 加载模块...');
    const module = require(componentPath);
    
    console.log('✅ 模块加载成功');
    console.log('模块类型:', typeof module);
    
    // 检查导出结构
    console.log('\n🔍 分析模块导出...');
    const keys = Object.keys(module);
    console.log(`导出键 (${keys.length}个):`, keys.slice(0, 10), keys.length > 10 ? '...' : '');
    
    // 查找EnhancedEngineAdapter类
    let EnhancedEngineAdapter;
    
    // 检查多种可能的导出方式
    if (typeof module === 'function') {
      EnhancedEngineAdapter = module;
      console.log('✅ 模块本身是函数/类');
    } else if (module.EnhancedEngineAdapter) {
      EnhancedEngineAdapter = module.EnhancedEngineAdapter;
      console.log('✅ 找到命名导出 EnhancedEngineAdapter');
    } else if (module.default) {
      if (typeof module.default === 'function') {
        EnhancedEngineAdapter = module.default;
        console.log('✅ 找到默认导出函数/类');
      } else if (module.default.EnhancedEngineAdapter) {
        EnhancedEngineAdapter = module.default.EnhancedEngineAdapter;
        console.log('✅ 找到默认导出中的 EnhancedEngineAdapter');
      }
    }
    
    if (!EnhancedEngineAdapter) {
      console.error('❌ 无法找到EnhancedEngineAdapter类');
      console.log('模块详情:', JSON.stringify(module, null, 2).substring(0, 500) + '...');
      return false;
    }
    
    console.log('✅ 找到EnhancedEngineAdapter');
    console.log('类型:', typeof EnhancedEngineAdapter);
    
    // 检查原型方法
    if (EnhancedEngineAdapter.prototype) {
      const protoMethods = Object.getOwnPropertyNames(EnhancedEngineAdapter.prototype);
      console.log(`原型方法 (${protoMethods.length}个):`, protoMethods);
    }
    
    // 检查静态方法
    const staticMethods = Object.getOwnPropertyNames(EnhancedEngineAdapter).filter(
      name => typeof EnhancedEngineAdapter[name] === 'function'
    );
    console.log(`静态方法 (${staticMethods.length}个):`, staticMethods);
    
    // ==================== 步骤4: 尝试创建实例 ====================
    
    console.log('\n🔧 尝试创建实例...');
    
    // 创建模拟配置
    const mockExtension = {
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
    };
    
    const config = {
      extension: mockExtension,
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
    
    let instance;
    
    // 尝试多种实例化方式
    if (typeof EnhancedEngineAdapter.getInstance === 'function') {
      console.log('使用 getInstance() 方法创建实例');
      instance = EnhancedEngineAdapter.getInstance(config);
    } else if (typeof EnhancedEngineAdapter === 'function') {
      console.log('使用 new 构造函数创建实例');
      instance = new EnhancedEngineAdapter(config);
    } else {
      console.error('❌ 无法实例化: 不是函数或没有getInstance方法');
      return false;
    }
    
    console.log('✅ 实例创建成功');
    
    // ==================== 步骤5: 尝试初始化 ====================
    
    console.log('\n🔧 尝试初始化...');
    try {
      const initResult = await instance.initialize();
      console.log(`✅ 初始化结果: ${initResult}`);
      
      // 测试基本功能
      console.log('\n🔧 测试基本功能...');
      
      // 首先检查实例有哪些方法
      console.log('实例方法:', Object.getOwnPropertyNames(Object.getPrototypeOf(instance)));
      
      // 尝试调用已知的方法
      if (typeof instance.getMode === 'function') {
        const mode = instance.getMode();
        console.log(`✅ 当前模式: ${mode}`);
      } else {
        console.log('⚠️  getMode方法不存在');
      }
      
      if (typeof instance.getEngine === 'function') {
        const engine = instance.getEngine();
        console.log(`✅ 引擎获取: ${engine ? '成功' : '失败'}`);
      } else {
        console.log('⚠️  getEngine方法不存在');
      }
      
      if (typeof instance.getState === 'function') {
        const state = instance.getState();
        console.log(`✅ 状态获取: 引擎就绪=${state.engineReady}, 工具数量=${state.toolCount}`);
      } else {
        console.log('⚠️  getState方法不存在');
      }
      
      if (typeof instance.submitMessage === 'function') {
        console.log('✅ submitMessage方法存在');
      } else {
        console.log('⚠️  submitMessage方法不存在');
      }
      
      console.log('\n🎉 真实组件加载和初始化成功！');
      
      // 记录拦截的模块
      console.log('\n📊 模块拦截统计:');
      interceptedModules.forEach((count, moduleId) => {
        console.log(`  ${moduleId}: ${count}次`);
      });
      
      return true;
      
    } catch (initError) {
      console.error('❌ 初始化失败:', initError.message);
      console.error('错误堆栈:', initError.stack);
      
      // 分析错误
      if (initError.message.includes('vscode')) {
        console.error('\n🔍 vscode相关错误，检查模拟是否完整');
      }
      
      return false;
    }
    
  } catch (error) {
    console.error('❌ 加载或实例化失败:', error.message);
    console.error('错误堆栈:', error.stack);
    
    // 特别检查vscode相关错误
    if (error.stack && error.stack.includes('vscode')) {
      console.error('\n🔍 检测到vscode相关错误:');
      const lines = error.stack.split('\n');
      lines.forEach((line, i) => {
        if (line.includes('vscode') && i < 10) { // 只显示前10行相关错误
          console.error(`  ${line}`);
        }
      });
    }
    
    return false;
  }
}

// ==================== 主函数 ====================

async function main() {
  console.log('🔬 深度调试分析开始');
  console.log('='.repeat(80));
  
  try {
    const success = await testRealComponentLoading();
    
    console.log('\n' + '='.repeat(80));
    console.log(`🏁 调试结果: ${success ? '✅ 成功' : '❌ 失败'}`);
    console.log('='.repeat(80));
    
    // 恢复原始require
    Module.prototype.require = originalRequire;
    
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    console.error('❌ 调试过程异常:', error);
    console.error(error.stack);
    
    // 恢复原始require
    Module.prototype.require = originalRequire;
    
    process.exit(1);
  }
}

// 运行主函数
main();