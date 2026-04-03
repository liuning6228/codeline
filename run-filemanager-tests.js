/**
 * 运行FileManager测试的专用脚本
 */

console.log('🚀 启动FileManager测试运行器');

// 设置vscode模块mock
const Module = require('module');
const originalRequire = Module.prototype.require;

// 导入mockVscode（假设存在）
let mockVscode;
try {
  const { mockVscode: importedMock } = require('./out/test/helpers/mockVscode.js');
  mockVscode = importedMock;
  console.log('🔧 使用已有的mockVscode模块');
} catch (error) {
  console.log('⚠️ 无法加载mockVscode模块，创建基本mock');
  // 创建基本mock
  mockVscode = {
    Uri: {
      file: (path) => ({ fsPath: path, toString: () => path }),
      parse: (uri) => ({ fsPath: uri, toString: () => uri })
    },
    workspace: {
      workspaceFolders: [],
      getConfiguration: () => ({
        get: () => undefined,
        update: async () => {}
      }),
      fs: {
        readFile: async () => Buffer.from(''),
        writeFile: async () => {},
        stat: async () => ({ type: 1, ctime: Date.now(), mtime: Date.now(), size: 0 })
      }
    },
    window: {
      showInformationMessage: async () => undefined,
      showWarningMessage: async () => undefined,
      showErrorMessage: async () => undefined,
      createOutputChannel: () => ({
        append: () => {},
        appendLine: () => {},
        clear: () => {},
        show: () => {},
        hide: () => {}
      })
    },
    commands: {
      executeCommand: async (command, ...args) => {
        console.log(`[MOCK] executeCommand: ${command}`, args);
        return undefined;
      },
      registerCommand: () => ({ dispose: () => {} })
    },
    FileType: {
      Unknown: 0,
      File: 1,
      Directory: 2
    },
    env: {
      appName: 'VSCode Test'
    },
    ConfigurationTarget: {
      Global: 1,
      Workspace: 2
    },
    workspaceState: {
      get: () => undefined,
      update: async () => {}
    },
    globalState: {
      get: () => undefined,
      update: async () => {}
    },
    ViewColumn: {
      One: 1,
      Two: 2,
      Active: -1
    },
    ProgressLocation: {
      Notification: 15,
      Window: 10
    },
    StatusBarAlignment: {
      Left: 1,
      Right: 2
    }
  };
}

// 拦截vscode模块请求
Module.prototype.require = function(id) {
  if (id === 'vscode') {
    return mockVscode;
  }
  
  // 正常加载其他模块
  return originalRequire.apply(this, arguments);
};

// 设置测试环境变量
process.env.NODE_ENV = 'test';

// 动态加载Mocha
try {
  const Mocha = require('mocha');
  
  // 创建Mocha实例
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
    timeout: 10000,
    reporter: 'spec'
  });
  
  // 添加FileManager测试文件
  const testFile = './out/test/suite/fileManager.test.js';
  console.log(`📄 加载测试文件: ${testFile}`);
  
  mocha.addFile(testFile);
  
  // 运行测试
  console.log('🧪 开始运行FileManager测试...\n');
  
  mocha.run((failures) => {
    console.log('\n📊 测试运行完成');
    console.log('═══════════════════════════════════════');
    if (failures === 0) {
      console.log('🎉 所有测试通过！');
      process.exit(0);
    } else {
      console.log(`❌ ${failures} 个测试失败`);
      process.exit(1);
    }
  });
  
} catch (error) {
  console.error('❌ 测试运行失败:', error.message);
  console.error(error.stack);
  process.exit(1);
}