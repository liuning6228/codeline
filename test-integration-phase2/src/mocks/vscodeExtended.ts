/**
 * 扩展的vscode模拟，支持EnhancedEngineAdapter所需的所有API
 * 包括ExtensionContext、workspace配置等
 */

import * as EventEmitter from 'events';

// ==================== 核心类型定义 ====================

/**
 * 模拟的vscode模块
 */
export const vscode = {
  // ========== window 命名空间 ==========
  window: {
    createOutputChannel: (name: string): any => {
      console.log(`[vscode模拟] 创建输出通道: ${name}`);
      return {
        name,
        appendLine: (text: string) => console.log(`[${name}] ${text}`),
        append: (text: string) => process.stdout.write(text),
        show: () => console.log(`[${name}] 显示输出通道`),
        hide: () => {},
        dispose: () => {},
        clear: () => {}
      };
    },
    
    withProgress: async (options: any, task: any): Promise<any> => {
      console.log(`[vscode模拟] 显示进度: ${options.title || '处理中...'}`);
      return await task({
        report: (update: any) => {
          console.log(`[vscode模拟] 进度更新: ${update.message || ''} (${update.increment || 0}%)`);
        }
      });
    },
    
    showInformationMessage: (message: string, ...items: any[]): Promise<any> => {
      console.log(`[vscode模拟] 信息: ${message}`);
      return Promise.resolve(items[0] || '确定');
    },
    
    showWarningMessage: (message: string, ...items: any[]): Promise<any> => {
      console.log(`[vscode模拟] 警告: ${message}`);
      return Promise.resolve(items[0] || '确定');
    },
    
    showErrorMessage: (message: string, ...items: any[]): Promise<any> => {
      console.log(`[vscode模拟] 错误: ${message}`);
      return Promise.resolve(items[0] || '确定');
    },
    
    // 状态栏项
    createStatusBarItem: (alignment?: any, priority?: number): any => {
      return {
        text: '',
        tooltip: '',
        command: '',
        show: () => {},
        hide: () => {},
        dispose: () => {}
      };
    }
  },
  
  // ========== workspace 命名空间 ==========
  workspace: {
    workspaceFolders: [
      {
        uri: {
          fsPath: process.cwd(),
          toString: () => `file://${process.cwd()}`
        },
        name: 'test-workspace',
        index: 0
      }
    ],
    
    getConfiguration: (section: string, scope?: any): any => {
      console.log(`[vscode模拟] 获取配置: ${section}`);
      return {
        get: (key: string, defaultValue?: any) => {
          console.log(`[vscode模拟] 读取配置: ${section}.${key}`);
          return defaultValue;
        },
        update: (key: string, value: any, configurationTarget?: any) => {
          console.log(`[vscode模拟] 更新配置: ${section}.${key} = ${value}`);
          return Promise.resolve();
        },
        inspect: (key: string) => null,
        has: (key: string) => false
      };
    },
    
    fs: {
      readFile: (uri: any): Promise<Uint8Array> => {
        console.log(`[vscode模拟] 读取文件: ${uri.fsPath || uri.path || uri}`);
        // 模拟读取一些常见文件
        const fs = require('fs');
        const path = require('path');
        try {
          const filePath = uri.fsPath || uri.path || uri;
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath);
            return Promise.resolve(new Uint8Array(content));
          }
          // 返回空内容用于测试
          return Promise.resolve(new Uint8Array());
        } catch (error: any) {
          console.log(`[vscode模拟] 读取文件失败: ${error.message}`);
          return Promise.resolve(new Uint8Array());
        }
      },
      writeFile: (uri: any, content: Uint8Array): Promise<void> => {
        console.log(`[vscode模拟] 写入文件: ${uri.fsPath || uri.path || uri}, 大小: ${content.length}字节`);
        // 在实际测试中，我们可以记录文件写入但不实际写入磁盘
        // 或者写入临时目录
        return Promise.resolve();
      },
      stat: (uri: any): Promise<any> => {
        console.log(`[vscode模拟] 获取文件状态: ${uri.fsPath || uri.path || uri}`);
        const fs = require('fs');
        const path = require('path');
        try {
          const filePath = uri.fsPath || uri.path || uri;
          if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            return Promise.resolve({
              type: stats.isDirectory() ? 2 : 1, // FileType: File=1, Directory=2
              ctime: stats.ctime.getTime(),
              mtime: stats.mtime.getTime(),
              size: stats.size
            });
          }
          return Promise.resolve({ type: 0, ctime: 0, mtime: 0, size: 0 }); // FileType: Unknown=0
        } catch (error: any) {
          console.log(`[vscode模拟] 获取文件状态失败: ${error.message}`);
          return Promise.resolve({ type: 0, ctime: Date.now(), mtime: Date.now(), size: 0 });
        }
      },
      readDirectory: (uri: any): Promise<[string, any][]> => {
        console.log(`[vscode模拟] 读取目录: ${uri.fsPath || uri.path || uri}`);
        const fs = require('fs');
        const path = require('path');
        try {
          const dirPath = uri.fsPath || uri.path || uri;
          if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
            const items = fs.readdirSync(dirPath);
            const result: [string, any][] = items.map((item: string) => {
              const itemPath = path.join(dirPath, item);
              const stats = fs.statSync(itemPath);
              return [item, stats.isDirectory() ? 2 : 1]; // FileType
            });
            return Promise.resolve(result);
          }
          return Promise.resolve([]);
        } catch (error: any) {
          console.log(`[vscode模拟] 读取目录失败: ${error.message}`);
          return Promise.resolve([]);
        }
      }
    },
    
    // 工作区事件
    onDidChangeWorkspaceFolders: () => ({ dispose: () => {} }),
    onDidChangeConfiguration: () => ({ dispose: () => {} }),
    onDidSaveTextDocument: () => ({ dispose: () => {} })
  },
  
  // ========== commands 命名空间 ==========
  commands: {
    registerCommand: (command: string, callback: any): any => {
      console.log(`[vscode模拟] 注册命令: ${command}`);
      return { dispose: () => {} };
    },
    
    executeCommand: (command: string, ...args: any[]): Promise<any> => {
      console.log(`[vscode模拟] 执行命令: ${command}`, args);
      return Promise.resolve(undefined);
    },
    
    getCommands: (filterInternal?: boolean): Promise<string[]> => {
      return Promise.resolve([]);
    }
  },
  
  // ========== Uri 类 ==========
  Uri: {
    file: (path: string): any => ({ 
      scheme: 'file', 
      path, 
      fsPath: path, 
      toString: () => path,
      with: () => ({})
    }),
    
    parse: (value: string): any => {
      if (value.startsWith('file://')) {
        const path = value.substring(7);
        return { scheme: 'file', path, fsPath: path, toString: () => value };
      }
      return { scheme: value.includes(':') ? value.split(':')[0] : 'file', path: value, fsPath: value, toString: () => value };
    },
    
    joinPath: (base: any, ...pathSegments: string[]): any => {
      const path = [base.fsPath || base.path || base, ...pathSegments].join('/');
      return { scheme: 'file', path, fsPath: path, toString: () => `file://${path}` };
    }
  },
  
  // ========== 位置和范围类 ==========
  Range: class Range {
    start: any;
    end: any;
    
    constructor(startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
      this.start = { line: startLine, character: startCharacter };
      this.end = { line: endLine, character: endCharacter };
    }
    
    isEmpty(): boolean {
      return this.start.line === this.end.line && this.start.character === this.end.character;
    }
    
    isSingleLine(): boolean {
      return this.start.line === this.end.line;
    }
  },
  
  Position: class Position {
    line: number;
    character: number;
    
    constructor(line: number, character: number) {
      this.line = line;
      this.character = character;
    }
    
    translate(lineDelta?: number, characterDelta?: number): Position {
      return new Position(this.line + (lineDelta || 0), this.character + (characterDelta || 0));
    }
    
    with(line?: number, character?: number): Position {
      return new Position(line !== undefined ? line : this.line, character !== undefined ? character : this.character);
    }
  },
  
  // ========== 可销毁对象 ==========
  Disposable: class Disposable {
    private callback: () => void;
    
    constructor(callback: () => void) {
      this.callback = callback;
    }
    
    dispose(): void {
      if (this.callback) {
        this.callback();
      }
    }
    
    static from(...disposables: any[]): Disposable {
      return new Disposable(() => {
        disposables.forEach(d => d.dispose && d.dispose());
      });
    }
  },
  
  // ========== 事件相关 ==========
  EventEmitter: EventEmitter,
  
  // ========== 枚举和常量 ==========
  StatusBarAlignment: {
    Left: 1,
    Right: 2
  },
  
  ConfigurationTarget: {
    Global: 1,
    Workspace: 2,
    WorkspaceFolder: 3
  },
  
  // ========== 扩展上下文模拟 ==========
  // 创建一个ExtensionContext模拟工厂函数
  createExtensionContext: (): any => {
    console.log('[vscode模拟] 创建ExtensionContext');
    return {
      subscriptions: [],
      workspaceState: {
        get: (key: string, defaultValue?: any) => defaultValue,
        update: (key: string, value: any) => Promise.resolve(),
        keys: () => []
      },
      globalState: {
        get: (key: string, defaultValue?: any) => defaultValue,
        update: (key: string, value: any) => Promise.resolve(),
        keys: () => [],
        setKeysForSync: (keys: string[]) => {}
      },
      extensionPath: process.cwd(),
      extensionUri: { fsPath: process.cwd(), toString: () => `file://${process.cwd()}` },
      storageUri: { fsPath: process.cwd(), toString: () => `file://${process.cwd()}` },
      globalStorageUri: { fsPath: process.cwd(), toString: () => `file://${process.cwd()}` },
      logUri: { fsPath: process.cwd(), toString: () => `file://${process.cwd()}` },
      secrets: {
        get: (key: string) => Promise.resolve(undefined),
        store: (key: string, value: string) => Promise.resolve(),
        delete: (key: string) => Promise.resolve(),
        onDidChange: () => ({ dispose: () => {} })
      },
      extensionMode: 2, // ExtensionMode.Test
      environmentVariableCollection: {
        persistent: true,
        replace: () => {},
        append: () => {},
        prepend: () => {},
        get: () => undefined,
        forEach: () => {},
        delete: () => {},
        clear: () => {}
      },
      asAbsolutePath: (relativePath: string) => {
        const path = require('path');
        return path.join(process.cwd(), relativePath);
      }
    };
  }
};

// ==================== 导出 ====================

export default vscode;

// 也导出createExtensionContext以便直接使用
export const createExtensionContext = vscode.createExtensionContext;