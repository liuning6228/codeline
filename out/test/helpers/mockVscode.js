"use strict";
/**
 * VS Code模拟模块
 * 用于在没有实际VS Code环境的测试中模拟vscode API
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockVscode = void 0;
exports.setupGlobalVscodeMock = setupGlobalVscodeMock;
exports.cleanupGlobalVscodeMock = cleanupGlobalVscodeMock;
/**
 * 模拟的vscode模块
 */
exports.mockVscode = {
    // URI相关
    Uri: {
        file: (path) => ({
            fsPath: path,
            toString: () => path,
            with: () => ({})
        }),
        parse: (uri) => ({ fsPath: uri, toString: () => uri }),
        joinPath: (base, ...pathSegments) => ({
            fsPath: [base.fsPath, ...pathSegments].join('/'),
            toString: () => [base.toString(), ...pathSegments].join('/')
        })
    },
    // 工作区相关
    workspace: {
        openTextDocument: async (uri) => ({
            uri,
            getText: () => '',
            save: async () => { },
            isDirty: false,
            fileName: uri.fsPath
        }),
        fs: {
            readFile: async (uri) => Buffer.from(''),
            writeFile: async (uri, content) => { },
            stat: async (uri) => ({
                type: 1, // FileType.File
                ctime: Date.now(),
                mtime: Date.now(),
                size: 0
            }),
            delete: async (uri) => { },
            rename: async (source, target) => { },
            createDirectory: async (uri) => { }
        },
        getConfiguration: (section) => ({
            get: (key, defaultValue) => defaultValue,
            update: async (key, value) => { },
            inspect: (key) => null
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
        ],
        onDidChangeConfiguration: {
            dispose: () => { }
        },
        onDidChangeTextDocument: {
            dispose: () => { }
        },
        onDidOpenTextDocument: {
            dispose: () => { }
        },
        onDidSaveTextDocument: {
            dispose: () => { }
        },
        findFiles: async (include, exclude, maxResults) => [],
        applyEdit: async (edit) => true,
        saveAll: async () => { },
        textDocuments: []
    },
    // 窗口相关
    window: {
        showTextDocument: async (document, options) => ({
            document,
            options,
            reveal: async () => { },
            dispose: () => { }
        }),
        showInformationMessage: async (message, ...items) => undefined,
        showWarningMessage: async (message, ...items) => undefined,
        showErrorMessage: async (message, ...items) => undefined,
        createOutputChannel: (name) => ({
            name,
            append: (value) => { },
            appendLine: (value) => { },
            clear: () => { },
            show: () => { },
            hide: () => { },
            dispose: () => { }
        }),
        createStatusBarItem: () => ({
            text: '',
            tooltip: '',
            show: () => { },
            hide: () => { },
            dispose: () => { }
        }),
        createWebviewPanel: (viewType, title, column, options) => {
            console.log(`[MOCK] createWebviewPanel: ${viewType}, ${title}`);
            return {
                webview: {
                    html: '',
                    postMessage: (message) => {
                        console.log('[MOCK] webview.postMessage:', message);
                    },
                    onDidReceiveMessage: (callback) => {
                        return { dispose: () => { } };
                    }
                },
                reveal: (column) => {
                    console.log('[MOCK] webviewPanel.reveal');
                    return;
                },
                dispose: () => {
                    console.log('[MOCK] webviewPanel.dispose');
                },
                onDidDispose: (callback) => {
                    return { dispose: () => { } };
                },
                onDidChangeViewState: (callback) => {
                    return { dispose: () => { } };
                },
                title,
                viewType,
                viewColumn: column,
                options
            };
        },
        withProgress: async (options, task) => {
            return task({
                report: (value) => { }
            });
        },
        showInputBox: async (options) => '',
        showQuickPick: async (items, options) => undefined,
        showOpenDialog: async (options) => [],
        showSaveDialog: async (options) => undefined,
        createInputBox: () => ({
            title: '',
            placeholder: '',
            value: '',
            buttons: [],
            onDidAccept: () => ({ dispose: () => { } }),
            onDidHide: () => ({ dispose: () => { } }),
            show: () => { },
            hide: () => { },
            dispose: () => { }
        }),
        createQuickPick: () => ({
            items: [],
            selectedItems: [],
            title: '',
            placeholder: '',
            canSelectMany: false,
            onDidAccept: () => ({ dispose: () => { } }),
            onDidHide: () => ({ dispose: () => { } }),
            show: () => { },
            hide: () => { },
            dispose: () => { }
        }),
        createTreeView: (viewId, options) => ({
            onDidChangeSelection: () => ({ dispose: () => { } }),
            reveal: async (item) => { },
            dispose: () => { }
        }),
        registerWebviewViewProvider: (viewId, provider, options) => ({
            dispose: () => { }
        }),
        registerTreeDataProvider: (viewId, provider) => ({
            dispose: () => { }
        })
    },
    // 命令相关
    commands: {
        executeCommand: async (command, ...args) => {
            console.log(`[MOCK] executeCommand: ${command}`, args);
            return undefined;
        },
        registerCommand: (command, callback) => ({
            command,
            callback,
            dispose: () => { }
        }),
        registerTextEditorCommand: (command, callback) => ({
            command,
            callback,
            dispose: () => { }
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
        registerCompletionItemProvider: (selector, provider, ...triggerCharacters) => ({
            selector,
            provider,
            triggerCharacters,
            dispose: () => { }
        }),
        createDiagnosticCollection: (name) => ({
            name,
            set: () => { },
            delete: () => { },
            clear: () => { },
            dispose: () => { },
            has: () => false,
            forEach: () => { },
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
        event = () => { };
        fire = () => { };
        dispose = () => { };
    },
    // 可销毁对象
    Disposable: class {
        dispose = () => { };
    },
    // 状态管理
    workspaceState: {
        get: (key) => undefined,
        update: async (key, value) => { },
        keys: () => []
    },
    globalState: {
        get: (key) => undefined,
        update: async (key, value) => { },
        setKeysForSync: (keys) => { },
        keys: () => []
    },
    // 扩展上下文
    ExtensionContext: class {
        subscriptions = [];
        workspaceState;
        globalState;
        extensionPath = '/tmp/extension-test';
        storagePath = '/tmp/storage-test';
        logPath = '/tmp/log-test';
        extensionUri = { fsPath: '/tmp/extension-test' };
        constructor() {
            this.workspaceState = exports.mockVscode.workspaceState;
            this.globalState = exports.mockVscode.globalState;
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
        constructor() { }
    },
    // 调试相关
    DebugAdapterDescriptorFactory: class {
        constructor() { }
    },
    // 语言服务器
    LanguageClient: class {
        constructor() { }
    },
    // 树视图
    TreeItem: class {
        constructor() { }
    },
    TreeDataProvider: class {
        constructor() { }
    }
};
/**
 * 设置全局vscode模拟
 * 用于需要在全局作用域中访问vscode的测试
 */
function setupGlobalVscodeMock() {
    // 只在Node.js环境中设置全局变量
    if (typeof global !== 'undefined') {
        global.vscode = exports.mockVscode;
    }
}
/**
 * 清除全局vscode模拟
 */
function cleanupGlobalVscodeMock() {
    if (typeof global !== 'undefined') {
        delete global.vscode;
    }
}
// 默认导出
exports.default = exports.mockVscode;
//# sourceMappingURL=mockVscode.js.map