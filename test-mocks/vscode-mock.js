// 模拟 vscode 模块
const EventEmitter = require('events');

// 创建模拟的 vscode 模块
const vscode = {
  // 命名空间
  window: {
    createOutputChannel: (name) => {
      return {
        name,
        appendLine: (text) => console.log(`[${name}] ${text}`),
        show: () => console.log(`[${name}] 显示输出通道`),
        hide: () => {},
        dispose: () => {}
      };
    },
    withProgress: async (options, task) => {
      console.log(`[模拟vscode] 显示进度: ${options.title || '处理中...'}`);
      return await task({
        report: (update) => {
          console.log(`[模拟vscode] 进度更新: ${update.message || ''} (${update.increment || 0}%)`);
        }
      });
    },
    showInformationMessage: (message, ...items) => {
      console.log(`[模拟vscode] 信息: ${message}`);
      return Promise.resolve(items[0] || '确定');
    },
    showWarningMessage: (message, ...items) => {
      console.log(`[模拟vscode] 警告: ${message}`);
      return Promise.resolve(items[0] || '确定');
    },
    showErrorMessage: (message, ...items) => {
      console.log(`[模拟vscode] 错误: ${message}`);
      return Promise.resolve(items[0] || '确定');
    }
  },
  
  commands: {
    registerCommand: (command, callback) => {
      console.log(`[模拟vscode] 注册命令: ${command}`);
      return { dispose: () => {} };
    },
    executeCommand: (command, ...args) => {
      console.log(`[模拟vscode] 执行命令: ${command}`, args);
      return Promise.resolve(undefined);
    }
  },
  
  workspace: {
    workspaceFolders: [],
    getConfiguration: (section) => {
      return {
        get: (key, defaultValue) => defaultValue,
        update: (key, value) => Promise.resolve(),
        inspect: (key) => null
      };
    },
    fs: {
      readFile: (uri) => Promise.resolve(Buffer.from('')),
      writeFile: (uri, content) => Promise.resolve(),
      stat: (uri) => Promise.resolve({ type: 1, ctime: Date.now(), mtime: Date.now(), size: 0 }),
      readDirectory: (uri) => Promise.resolve([])
    }
  },
  
  Uri: {
    file: (path) => ({ scheme: 'file', path, fsPath: path, toString: () => path }),
    parse: (uri) => ({ scheme: 'file', path: uri, fsPath: uri, toString: () => uri })
  },
  
  Range: class Range {
    constructor(startLine, startCharacter, endLine, endCharacter) {
      this.start = { line: startLine, character: startCharacter };
      this.end = { line: endLine, character: endCharacter };
    }
  },
  
  Position: class Position {
    constructor(line, character) {
      this.line = line;
      this.character = character;
    }
  },
  
  Disposable: class Disposable {
    constructor(callback) {
      this.callback = callback;
    }
    dispose() {
      if (this.callback) this.callback();
    }
  },
  
  EventEmitter: EventEmitter,
  
  StatusBarAlignment: {
    Left: 1,
    Right: 2
  }
};

// 导出模拟模块
module.exports = vscode;