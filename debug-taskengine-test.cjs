/**
 * 调试TaskEngine测试
 */

console.log('🔧 调试TaskEngine测试');

// 设置vscode模块mock
const Module = require('module');
const originalRequire = Module.prototype.require;

const mockVscode = {
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
    executeCommand: async () => undefined,
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

Module.prototype.require = function(id) {
  if (id === 'vscode') {
    console.log('使用模拟vscode模块');
    return mockVscode;
  }
  
  return originalRequire.apply(this, arguments);
};

// 设置测试环境
process.env.NODE_ENV = 'test';

// 直接导入并测试TaskEngine
try {
  console.log('导入TaskEngine...');
  const { TaskEngine } = require('./out/task/taskEngine.js');
  
  // 创建模拟依赖
  const mockProjectAnalyzer = {
    async analyzeCurrentWorkspace() {
      console.log('MockProjectAnalyzer.analyzeCurrentWorkspace called');
      return {
        projectType: 'node',
        language: 'typescript',
        framework: 'none',
        rootPath: '/tmp/test-workspace',
        files: [],
        dependencies: [],
        codeStyle: {
          indent: 2,
          quoteStyle: 'single',
          lineEnding: '\n'
        }
      };
    }
  };
  
  const mockPromptEngine = {
    generatePrompt() {
      console.log('MockPromptEngine.generatePrompt called');
      return 'Mock prompt';
    }
  };
  
  const mockModelAdapter = {
    async callAI(prompt) {
      console.log('MockModelAdapter.callAI called');
      return {
        content: 'Mock AI response',
        model: 'mock-model'
      };
    }
  };
  
  const mockFileManager = {
    workspaceRoot: '/tmp/test-workspace',
    async createFile() {
      return { success: true, filePath: 'test.txt', message: 'Created' };
    }
  };
  
  const mockTerminalExecutor = {
    async executeCommand() {
      return { success: true, output: 'Mock output', command: 'test', timestamp: new Date() };
    }
  };
  
  const mockBrowserAutomator = {
    async navigate() {
      return { success: true, output: 'Navigated', actions: [], duration: 100 };
    }
  };
  
  console.log('创建TaskEngine实例...');
  const taskEngine = new TaskEngine(
    mockProjectAnalyzer,
    mockPromptEngine,
    mockModelAdapter,
    mockFileManager,
    mockTerminalExecutor,
    mockBrowserAutomator
  );
  
  console.log('调用startTask...');
  
  // 包装在async函数中
  async function test() {
    try {
      const result = await taskEngine.startTask('Test task', { autoExecute: false });
      
      console.log('结果:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('✅ TaskEngine工作正常');
      } else {
        console.log('❌ TaskEngine失败:', result.error);
      }
    } catch (error) {
      console.error('❌ 调用startTask时发生异常:', error.message);
      console.error(error.stack);
    }
  }
  
  await test();
  
} catch (error) {
  console.error('❌ 发生异常:', error.message);
  console.error(error.stack);
}