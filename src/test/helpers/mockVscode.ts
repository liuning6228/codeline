/**
 * VS Code模拟模块
 * 用于在没有实际VS Code环境的测试中模拟vscode API
 */

/**
 * 模拟的vscode模块
 */
export const mockVscode = {
  // URI相关
  Uri: {
    file: (path: string) => ({
      fsPath: path,
      toString: () => path,
      with: () => ({})
    }),
    parse: (uri: string) => ({ fsPath: uri, toString: () => uri }),
    joinPath: (base: any, ...pathSegments: string[]) => ({
      fsPath: [base.fsPath, ...pathSegments].join('/'),
      toString: () => [base.toString(), ...pathSegments].join('/')
    })
  },
  
  // 工作区相关
  workspace: {
    openTextDocument: async (uri: any) => ({
      uri,
      getText: () => '',
      save: async () => {},
      isDirty: false,
      fileName: uri.fsPath
    }),
    fs: {
      readFile: async (uri: any) => Buffer.from(''),
      writeFile: async (uri: any, content: Buffer) => {},
      stat: async (uri: any) => ({
        type: 1, // FileType.File
        ctime: Date.now(),
        mtime: Date.now(),
        size: 0
      }),
      delete: async (uri: any) => {},
      rename: async (source: any, target: any) => {},
      createDirectory: async (uri: any) => {}
    },
    getConfiguration: (section?: string) => ({
      get: (key: string, defaultValue?: any) => defaultValue,
      update: async (key: string, value: any) => {},
      inspect: (key: string) => null
    }),
    workspaceFolders: [
      {
        uri: {
          fsPath: process.cwd(),
          toString: () => `file://${process.cwd()}`,
          scheme: 'file',
          authority: '',
          path: process.cwd(),
          query: '',
          fragment: '',
          with: () => ({})
        },
        name: process.cwd().split('/').pop() || 'test-workspace',
        index: 0
      }
    ] as any[],
    onDidChangeConfiguration: {
      dispose: () => {}
    },
    onDidChangeTextDocument: {
      dispose: () => {}
    },
    onDidOpenTextDocument: {
      dispose: () => {}
    },
    onDidSaveTextDocument: {
      dispose: () => {}
    },
    findFiles: async (include: string, exclude?: string, maxResults?: number) => [] as any[],
    applyEdit: async (edit: any) => true,
    saveAll: async () => {},
    textDocuments: [] as any[]
  },
  
  // 窗口相关
  window: {
    showTextDocument: async (document: any, options?: any) => ({
      document,
      options,
      reveal: async () => {},
      dispose: () => {}
    }),
    showInformationMessage: async (message: string, ...items: any[]) => undefined as string | undefined,
    showWarningMessage: async (message: string, ...items: any[]) => undefined,
    showErrorMessage: async (message: string, ...items: any[]) => undefined as string | undefined,
    createOutputChannel: (name: string) => ({
      name,
      append: (value: string) => {},
      appendLine: (value: string) => {},
      clear: () => {},
      show: () => {},
      hide: () => {},
      dispose: () => {}
    }),
    createStatusBarItem: () => ({
      text: '',
      tooltip: '',
      show: () => {},
      hide: () => {},
      dispose: () => {}
    }),
    createWebviewPanel: (viewType: string, title: string, column: any, options: any) => {
      console.log(`[MOCK] createWebviewPanel: ${viewType}, ${title}`);
      return {
        webview: {
          html: '',
          postMessage: (message: any) => {
            console.log('[MOCK] webview.postMessage:', message);
          },
          onDidReceiveMessage: (callback: (message: any) => void) => {
            return { dispose: () => {} };
          }
        },
        reveal: (column?: any) => {
          console.log('[MOCK] webviewPanel.reveal');
          return;
        },
        dispose: () => {
          console.log('[MOCK] webviewPanel.dispose');
        },
        onDidDispose: (callback: () => void) => {
          return { dispose: () => {} };
        },
        onDidChangeViewState: (callback: (e: any) => void) => {
          return { dispose: () => {} };
        },
        title,
        viewType,
        viewColumn: column,
        options
      };
    },
    withProgress: async (options: any, task: any) => {
      return task({
        report: (value: any) => {}
      });
    },
    showInputBox: async (options?: any) => '',
    showQuickPick: async (items: any[], options?: any) => undefined,
    showOpenDialog: async (options?: any) => [] as any[],
    showSaveDialog: async (options?: any) => undefined as any,
    createInputBox: () => ({
      title: '',
      placeholder: '',
      value: '',
      buttons: [],
      onDidAccept: () => ({ dispose: () => {} }),
      onDidHide: () => ({ dispose: () => {} }),
      show: () => {},
      hide: () => {},
      dispose: () => {}
    }),
    createQuickPick: () => ({
      items: [],
      selectedItems: [],
      title: '',
      placeholder: '',
      canSelectMany: false,
      onDidAccept: () => ({ dispose: () => {} }),
      onDidHide: () => ({ dispose: () => {} }),
      show: () => {},
      hide: () => {},
      dispose: () => {}
    }),
    createTreeView: (viewId: string, options: any) => ({
      onDidChangeSelection: () => ({ dispose: () => {} }),
      reveal: async (item: any) => {},
      dispose: () => {}
    }),
    registerWebviewViewProvider: (viewId: string, provider: any, options?: any) => ({
      dispose: () => {}
    }),
    registerTreeDataProvider: (viewId: string, provider: any) => ({
      dispose: () => {}
    })
  },
  
  // 命令相关
  commands: {
    executeCommand: async (command: string, ...args: any[]) => {
      console.log(`[MOCK] executeCommand: ${command}`, args);
      return undefined;
    },
    registerCommand: (command: string, callback: (...args: any[]) => any) => ({
      command,
      callback,
      dispose: () => {}
    }),
    registerTextEditorCommand: (command: string, callback: any) => ({
      command,
      callback,
      dispose: () => {}
    })
  },
  
  // 文件类型枚举
  FileType: {
    Unknown: 0,
    File: 1,
    Directory: 2,
    SymbolicLink: 64
  },
  
  // 语言功能相关
  languages: {
    registerCompletionItemProvider: (selector: any, provider: any, ...triggerCharacters: string[]) => ({
      selector,
      provider,
      triggerCharacters,
      dispose: () => {}
    }),
    createDiagnosticCollection: (name: string) => ({
      name,
      set: () => {},
      delete: () => {},
      clear: () => {},
      dispose: () => {},
      has: () => false,
      forEach: () => {},
      get: () => undefined
    })
  },
  
  // 环境相关
  env: {
    appName: 'VSCode Test',
    appRoot: '/tmp/vscode-test',
    machineId: 'test-machine-id',
    sessionId: 'test-session-id'
  },
  
  // 配置目标枚举
  ConfigurationTarget: {
    Global: 1,
    Workspace: 2,
    WorkspaceFolder: 3
  },
  
  // 事件系统
  EventEmitter: class {
    event: any = () => {};
    fire: any = () => {};
    dispose: () => void = () => {};
  },
  
  // 可销毁对象
  Disposable: class {
    dispose: () => void = () => {};
  },
  
  // 状态管理
  workspaceState: {
    get: (key: string) => undefined,
    update: async (key: string, value: any) => {},
    keys: () => []
  },
  
  globalState: {
    get: (key: string) => undefined,
    update: async (key: string, value: any) => {},
    setKeysForSync: (keys: string[]) => {},
    keys: () => []
  },
  
  // 扩展上下文
  ExtensionContext: class {
    subscriptions: any[] = [];
    workspaceState: any;
    globalState: any;
    extensionPath: string = '/tmp/extension-test';
    storagePath: string = '/tmp/storage-test';
    logPath: string = '/tmp/log-test';
    extensionUri: any = { fsPath: '/tmp/extension-test' };
    
    constructor() {
      this.workspaceState = mockVscode.workspaceState;
      this.globalState = mockVscode.globalState;
    }
  },
  
  // 视图相关
  ViewColumn: {
    One: 1,
    Two: 2,
    Three: 3,
    Active: -1,
    Beside: -2
  },
  
  // 进度相关
  ProgressLocation: {
    Notification: 15,
    Window: 10,
    SourceControl: 1
  },
  
  // 状态栏位置
  StatusBarAlignment: {
    Left: 1,
    Right: 2
  },
  
  // 版本控制
  SourceControl: class {
    constructor() {}
  },
  
  // 调试相关
  DebugAdapterDescriptorFactory: class {
    constructor() {}
  },
  
  // 语言服务器
  LanguageClient: class {
    constructor() {}
  },
  
  // 树视图
  TreeItem: class {
    constructor() {}
  },
  
  TreeDataProvider: class {
    constructor() {}
  }
};

/**
 * 设置全局vscode模拟
 * 用于需要在全局作用域中访问vscode的测试
 */
export function setupGlobalVscodeMock(): void {
  // 只在Node.js环境中设置全局变量
  if (typeof global !== 'undefined') {
    (global as any).vscode = mockVscode;
  }
}

/**
 * 清除全局vscode模拟
 */
export function cleanupGlobalVscodeMock(): void {
  if (typeof global !== 'undefined') {
    delete (global as any).vscode;
  }
}

// 默认导出
export default mockVscode;