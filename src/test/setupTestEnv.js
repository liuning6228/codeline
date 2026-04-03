/**
 * 测试环境设置脚本
 * 必须在每个测试文件运行前加载
 */

// 设置vscode模块mock
const Module = require('module');
const originalRequire = Module.prototype.require;
const path = require('path');

// 加载mockVscode - 尝试多个可能的路径
let mockVscode;
let mockVscodePath;

// 尝试编译后的路径
const compiledPath = path.join(process.cwd(), 'out', 'test', 'helpers', 'mockVscode.js');
const sourcePath = path.join(__dirname, 'helpers', 'mockVscode.js');

try {
  mockVscodePath = compiledPath;
  console.log(`[TEST SETUP] 尝试加载模拟vscode模块: ${mockVscodePath}`);
  mockVscode = require(mockVscodePath);
} catch (err) {
  try {
    mockVscodePath = sourcePath;
    console.log(`[TEST SETUP] 尝试加载模拟vscode模块: ${mockVscodePath}`);
    mockVscode = require(mockVscodePath);
  } catch (err2) {
    console.error(`[TEST SETUP] 无法加载mockVscode模块，创建基本模拟`);
    // 创建基本模拟
    mockVscode = {
      Uri: {
        file: (path) => ({ fsPath: path, toString: () => path }),
        parse: (uri) => ({ fsPath: uri, toString: () => uri })
      },
      workspace: {
        openTextDocument: async () => ({ getText: () => '' }),
        fs: { readFile: async () => Buffer.from('') }
      },
      window: {
        createOutputChannel: () => ({ appendLine: () => {} }),
        showErrorMessage: async () => {}
      },
      commands: {
        registerCommand: () => ({ dispose: () => {} })
      }
    };
  }
}

console.log(`[TEST SETUP] 使用模拟vscode模块: ${mockVscodePath || '基本模拟'}`);

Module.prototype.require = function(id) {
  // 拦截vscode模块请求
  if (id === 'vscode') {
    console.log(`[TEST SETUP] 拦截vscode请求，返回模拟对象`);
    
    // 检查mockVscode对象结构
    if (mockVscode && mockVscode.workspace) {
      console.log(`[TEST SETUP] mockVscode.workspace: ${typeof mockVscode.workspace}`);
    } else if (mockVscode && mockVscode.mockVscode && mockVscode.mockVscode.workspace) {
      // 可能是模块导出结构，尝试获取mockVscode属性
      console.log(`[TEST SETUP] 使用mockVscode.mockVscode`);
      return mockVscode.mockVscode;
    } else if (mockVscode && mockVscode.default && mockVscode.default.workspace) {
      // 使用默认导出
      console.log(`[TEST SETUP] 使用mockVscode.default`);
      return mockVscode.default;
    } else {
      console.error(`[TEST SETUP] mockVscode结构异常:`, Object.keys(mockVscode || {}));
    }
    
    return mockVscode;
  }
  
  // 正常加载其他模块
  return originalRequire.apply(this, arguments);
};

// 设置测试环境变量
process.env.NODE_ENV = 'test';
process.env.CODELINE_TEST = 'true';

console.log('[TEST SETUP] 测试环境设置完成');