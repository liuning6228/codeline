/**
 * 增强的vscode模拟
 * 提供更完整的API覆盖和调试功能
 */

// ==================== 类型定义 ====================

export interface VscodeCallLog {
  timestamp: number;
  namespace: string;
  method: string;
  args: any[];
  result?: any;
  error?: string;
}

export interface VscodeMockOptions {
  verbose?: boolean;
  logCalls?: boolean;
  strictMode?: boolean; // 严格模式下，未实现的API会抛出错误
  dynamicProxy?: boolean; // 是否启用动态代理
}

// ==================== 增强的vscode模拟 ====================

export class EnhancedVscodeMock {
  private options: VscodeMockOptions;
  private callLogs: VscodeCallLog[] = [];
  
  // 核心命名空间
  readonly workspace: any;
  readonly window: any;
  readonly commands: any;
  readonly extensions: any;
  
  // 常量和枚举
  readonly StatusBarAlignment = { Left: 1, Right: 2 };
  readonly DiagnosticSeverity = { Error: 0, Warning: 1, Information: 2, Hint: 3 };
  readonly ViewColumn = { One: 1, Two: 2, Three: 3, Active: -1, Beside: -2 };
  
  // 类定义
  readonly Disposable = class Disposable {
    constructor(private disposeFn: () => void) {}
    dispose() { if (this.disposeFn) this.disposeFn(); }
  };
  
  readonly EventEmitter = class EventEmitter<T = any> {
    private listeners: Array<(data: T) => void> = [];
    
    event(listener: (data: T) => void): { dispose: () => void } {
      this.listeners.push(listener);
      return { dispose: () => this.listeners = this.listeners.filter(l => l !== listener) };
    }
    
    fire(data: T) {
      this.listeners.forEach(listener => listener(data));
    }
    
    dispose() {
      this.listeners = [];
    }
  };
  
  // 定义Position类
  readonly Position = class {
    constructor(public line: number, public character: number) {}
  } as any;
  
  // 定义Range类
  readonly Range = class {
    constructor(public start: any, public end: any) {}
    static fromNumbers(startLine: number, startChar: number, endLine: number, endChar: number) {
      return new (EnhancedVscodeMock as any).Range(
        new (EnhancedVscodeMock as any).Position(startLine, startChar),
        new (EnhancedVscodeMock as any).Position(endLine, endChar)
      );
    }
  } as any;
  
  readonly Diagnostic = class Diagnostic {
    constructor(
      public range: any,
      public message: string,
      public severity?: number,
      public source?: string
    ) {}
  };
  
  readonly Uri = {
    file: (path: string): any => {
      const self = this.Uri;
      const uriObj = {
        scheme: 'file',
        fsPath: path,
        path,
        with: (change: any) => ({ ...self.file(path), ...change }),
        toString: () => `file://${path}`
      };
      return uriObj;
    },
    parse: (uri: string): any => ({
      scheme: uri.split(':')[0],
      path: uri.split(':')[1] || '',
      fsPath: uri.split(':')[1] || '',
      toString: () => uri
    })
  };
  
  constructor(options: VscodeMockOptions = {}) {
    this.options = {
      verbose: false,
      logCalls: true,
      strictMode: false,
      dynamicProxy: true,
      ...options
    };
    
    // 初始化核心命名空间
    this.workspace = this.createWorkspaceMock();
    this.window = this.createWindowMock();
    this.commands = this.createCommandsMock();
    this.extensions = this.createExtensionsMock();
    
    // 添加其他常见属性
    (this as any).version = '1.80.0';
    (this as any).env = {
      appName: 'CodeLine Test',
      appRoot: '/test',
      language: 'en',
      machineId: 'test-machine-id'
    };
  }
  
  // ==================== 命名空间实现 ====================
  
  private createWorkspaceMock(): any {
    const workspace = {
      fs: {
        readFile: this.wrapMethod('workspace.fs.readFile', async (uri: any) => {
          const fs = require('fs');
          const path = require('path');
          try {
            const filePath = uri.fsPath || uri.path || uri;
            if (fs.existsSync(filePath)) {
              const content = fs.readFileSync(filePath);
              return new Uint8Array(content);
            }
            return new Uint8Array();
          } catch (error: any) {
            if (this.options.strictMode) throw error;
            return new Uint8Array();
          }
        }),
        
        writeFile: this.wrapMethod('workspace.fs.writeFile', async (uri: any, content: Uint8Array) => {
          if (this.options.verbose) {
            console.log(`[vscode模拟] 写入文件: ${uri.fsPath || uri.path || uri}, 大小: ${content.length}字节`);
          }
          // 在实际测试中，可以记录但不实际写入
          return Promise.resolve();
        }),
        
        stat: this.wrapMethod('workspace.fs.stat', async (uri: any) => {
          const fs = require('fs');
          const path = require('path');
          try {
            const filePath = uri.fsPath || uri.path || uri;
            if (fs.existsSync(filePath)) {
              const stats = fs.statSync(filePath);
              return {
                type: stats.isDirectory() ? 2 : 1, // FileType: File=1, Directory=2
                ctime: stats.ctime.getTime(),
                mtime: stats.mtime.getTime(),
                size: stats.size
              };
            }
            return { type: 0, ctime: 0, mtime: 0, size: 0 }; // FileType: Unknown=0
          } catch (error: any) {
            if (this.options.strictMode) throw error;
            return { type: 0, ctime: Date.now(), mtime: Date.now(), size: 0 };
          }
        }),
        
        readDirectory: this.wrapMethod('workspace.fs.readDirectory', async (uri: any) => {
          const fs = require('fs');
          const path = require('path');
          try {
            const dirPath = uri.fsPath || uri.path || uri;
            if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
              const items = fs.readdirSync(dirPath);
              return items.map((item: string) => {
                const itemPath = path.join(dirPath, item);
                const stats = fs.statSync(itemPath);
                return [item, stats.isDirectory() ? 2 : 1]; // FileType
              });
            }
            return [];
          } catch (error: any) {
            if (this.options.strictMode) throw error;
            return [];
          }
        })
      },
      
      createFileSystemWatcher: this.wrapMethod('workspace.createFileSystemWatcher', 
        (pattern: string) => ({ dispose: () => {} })
      ),
      
      onDidChangeTextDocument: this.wrapMethod('workspace.onDidChangeTextDocument',
        () => ({ dispose: () => {} })
      ),
      
      onDidSaveTextDocument: this.wrapMethod('workspace.onDidSaveTextDocument',
        () => ({ dispose: () => {} })
      ),
      
      getConfiguration: this.wrapMethod('workspace.getConfiguration', 
        (section?: string) => ({
          get: (key: string, defaultValue?: any) => defaultValue,
          update: (key: string, value: any) => Promise.resolve()
        })
      ),
      
      workspaceFolders: [],
      
      // 其他常用方法
      openTextDocument: this.wrapMethod('workspace.openTextDocument', 
        async (uri: any) => ({
          uri,
          getText: () => '',
          save: () => Promise.resolve(true)
        })
      ),
      
      applyEdit: this.wrapMethod('workspace.applyEdit',
        async (edit: any) => true
      )
    };
    
    // 添加动态代理（如果启用）
    if (this.options.dynamicProxy) {
      return this.createDynamicProxy(workspace, 'workspace');
    }
    
    return workspace;
  }
  
  private createWindowMock(): any {
    const window = {
      createOutputChannel: this.wrapMethod('window.createOutputChannel', (name: string) => {
        const outputChannel = {
          name,
          append: (value: string) => {
            if (this.options.verbose) {
              console.log(`[输出通道 ${name}] 追加: ${value.substring(0, 100)}...`);
            }
          },
          appendLine: (value: string) => {
            if (this.options.verbose) {
              console.log(`[输出通道 ${name}] ${value}`);
            }
          },
          show: (preserveFocus?: boolean) => {},
          hide: () => {},
          dispose: () => {}
        };
        return outputChannel;
      }),
      
      showInformationMessage: this.wrapMethod('window.showInformationMessage',
        async (message: string, ...items: string[]) => {
          if (this.options.verbose) {
            console.log(`[信息消息] ${message}`);
          }
          return items[0]; // 返回第一个选项
        }
      ),
      
      showWarningMessage: this.wrapMethod('window.showWarningMessage',
        async (message: string, ...items: string[]) => {
          if (this.options.verbose) {
            console.log(`[警告消息] ${message}`);
          }
          return items[0];
        }
      ),
      
      showErrorMessage: this.wrapMethod('window.showErrorMessage',
        async (message: string, ...items: string[]) => {
          if (this.options.verbose) {
            console.log(`[错误消息] ${message}`);
          }
          return items[0];
        }
      ),
      
      createStatusBarItem: this.wrapMethod('window.createStatusBarItem',
        (alignment?: number, priority?: number) => ({
          text: '',
          tooltip: '',
          command: '',
          show: () => {},
          hide: () => {},
          dispose: () => {}
        })
      ),
      
      createTextEditorDecorationType: this.wrapMethod('window.createTextEditorDecorationType',
        (options: any) => ({
          key: `decoration-${Date.now()}`,
          dispose: () => {}
        })
      ),
      
      activeTextEditor: undefined,
      
      onDidChangeActiveTextEditor: this.wrapMethod('window.onDidChangeActiveTextEditor',
        () => ({ dispose: () => {} })
      ),
      
      showTextDocument: this.wrapMethod('window.showTextDocument',
        async (document: any, column?: any) => ({
          document,
          viewColumn: column
        })
      )
    };
    
    if (this.options.dynamicProxy) {
      return this.createDynamicProxy(window, 'window');
    }
    
    return window;
  }
  
  private createCommandsMock(): any {
    const commands = {
      registerCommand: this.wrapMethod('commands.registerCommand', 
        (command: string, callback: (...args: any[]) => any) => {
          if (this.options.verbose) {
            console.log(`[注册命令] ${command}`);
          }
          return { dispose: () => {} };
        }
      ),
      
      registerTextEditorCommand: this.wrapMethod('commands.registerTextEditorCommand',
        (command: string, callback: (textEditor: any, edit: any, ...args: any[]) => any) => {
          if (this.options.verbose) {
            console.log(`[注册文本编辑器命令] ${command}`);
          }
          return { dispose: () => {} };
        }
      ),
      
      executeCommand: this.wrapMethod('commands.executeCommand',
        async (command: string, ...args: any[]) => {
          if (this.options.verbose) {
            console.log(`[执行命令] ${command}`, args);
          }
          return undefined;
        }
      )
    };
    
    if (this.options.dynamicProxy) {
      return this.createDynamicProxy(commands, 'commands');
    }
    
    return commands;
  }
  
  private createExtensionsMock(): any {
    const extensions = {
      getExtension: this.wrapMethod('extensions.getExtension',
        (extensionId: string) => null
      ),
      
      all: []
    };
    
    if (this.options.dynamicProxy) {
      return this.createDynamicProxy(extensions, 'extensions');
    }
    
    return extensions;
  }
  
  // ==================== 工具方法 ====================
  
  private wrapMethod<T extends (...args: any[]) => any>(
    fullMethodName: string,
    implementation: T
  ): T {
    return ((...args: any[]) => {
      const callLog: VscodeCallLog = {
        timestamp: Date.now(),
        namespace: fullMethodName.split('.')[0],
        method: fullMethodName.split('.').slice(1).join('.'),
        args
      };
      
      try {
        const result = implementation(...args);
        
        // 处理Promise
        if (result && typeof result.then === 'function') {
          return result.then((resolvedResult: any) => {
            callLog.result = resolvedResult;
            this.recordCall(callLog);
            return resolvedResult;
          }).catch((error: any) => {
            callLog.error = error.message;
            this.recordCall(callLog);
            throw error;
          });
        }
        
        callLog.result = result;
        this.recordCall(callLog);
        return result;
      } catch (error: any) {
        callLog.error = error.message;
        this.recordCall(callLog);
        throw error;
      }
    }) as T;
  }
  
  private createDynamicProxy(baseObject: any, namespace: string): any {
    return new Proxy(baseObject, {
      get: (target, prop) => {
        const propStr = String(prop);
        
        // 如果属性存在，返回它
        if (prop in target) {
          return target[prop];
        }
        
        // 如果启用了动态代理，为不存在的属性创建默认实现
        if (this.options.dynamicProxy) {
          return this.wrapMethod(`${namespace}.${propStr}`, (...args: any[]) => {
            if (this.options.verbose) {
              console.log(`[动态代理] 调用 ${namespace}.${propStr}`, args);
            }
            
            if (this.options.strictMode) {
              throw new Error(`vscode.${namespace}.${propStr} 未实现`);
            }
            
            // 默认返回一个可用的值
            if (propStr.startsWith('on') || propStr.startsWith('create')) {
              return { dispose: () => {} };
            }
            
            if (typeof args[args.length - 1] === 'function') {
              // 如果有回调函数，调用它
              const callback = args.pop();
              callback(null, {});
              return { dispose: () => {} };
            }
            
            return Promise.resolve();
          });
        }
        
        // 严格模式下，未实现的属性抛出错误
        if (this.options.strictMode) {
          throw new Error(`vscode.${namespace}.${propStr} 未实现`);
        }
        
        return undefined;
      }
    });
  }
  
  private recordCall(callLog: VscodeCallLog): void {
    if (this.options.logCalls) {
      this.callLogs.push(callLog);
      
      if (this.options.verbose) {
        console.log(`[vscode调用] ${callLog.namespace}.${callLog.method}`, {
          args: callLog.args,
          result: callLog.result,
          error: callLog.error
        });
      }
    }
  }
  
  // ==================== 公共方法 ====================
  
  /**
   * 获取所有调用日志
   */
  getCallLogs(): VscodeCallLog[] {
    return [...this.callLogs];
  }
  
  /**
   * 清空调用日志
   */
  clearCallLogs(): void {
    this.callLogs = [];
  }
  
  /**
   * 获取调用统计
   */
  getCallStats(): { total: number; byNamespace: Record<string, number>; errors: number } {
    const byNamespace: Record<string, number> = {};
    let errors = 0;
    
    this.callLogs.forEach(log => {
      byNamespace[log.namespace] = (byNamespace[log.namespace] || 0) + 1;
      if (log.error) errors++;
    });
    
    return {
      total: this.callLogs.length,
      byNamespace,
      errors
    };
  }
  
  /**
   * 导出为标准的vscode模块
   */
  export(): any {
    const result: any = {
      workspace: this.workspace,
      window: this.window,
      commands: this.commands,
      extensions: this.extensions,
      
      // 常量和枚举
      StatusBarAlignment: this.StatusBarAlignment,
      DiagnosticSeverity: this.DiagnosticSeverity,
      ViewColumn: this.ViewColumn,
      
      // 类定义
      Disposable: this.Disposable,
      EventEmitter: this.EventEmitter,
      Position: this.Position,
      Range: this.Range,
      Diagnostic: this.Diagnostic,
      Uri: this.Uri,
      
      // 其他属性
      version: '1.80.0',
      env: {
        appName: 'CodeLine Test',
        appRoot: '/test',
        language: 'en',
        machineId: 'test-machine-id'
      }
    };
    
    // 添加动态代理到顶层（如果启用）
    if (this.options.dynamicProxy) {
      return new Proxy(result, {
        get: (target, prop) => {
          const propStr = String(prop);
          
          if (prop in target) {
            return target[prop];
          }
          
          // 为未实现的顶层属性创建默认实现
          return this.wrapMethod(propStr, (...args: any[]) => {
            if (this.options.verbose) {
              console.log(`[动态代理] 调用 vscode.${propStr}`, args);
            }
            
            if (this.options.strictMode) {
              throw new Error(`vscode.${propStr} 未实现`);
            }
            
            return Promise.resolve();
          });
        }
      });
    }
    
    return result;
  }
}

// ==================== 默认导出 ====================

/**
 * 创建增强的vscode模拟实例
 */
export function createEnhancedVscodeMock(options?: VscodeMockOptions): any {
  const mock = new EnhancedVscodeMock(options);
  return mock.export();
}

/**
 * 默认导出：可以直接require的vscode模块
 */
export const vscode = createEnhancedVscodeMock({
  verbose: false,
  logCalls: true,
  strictMode: false,
  dynamicProxy: true
});

export default vscode;