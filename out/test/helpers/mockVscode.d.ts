/**
 * VS Code模拟模块
 * 用于在没有实际VS Code环境的测试中模拟vscode API
 */
/**
 * 模拟的vscode模块
 */
export declare const mockVscode: {
    Uri: {
        file: (path: string) => {
            fsPath: string;
            toString: () => string;
            with: () => {};
        };
        parse: (uri: string) => {
            fsPath: string;
            toString: () => string;
        };
        joinPath: (base: any, ...pathSegments: string[]) => {
            fsPath: string;
            toString: () => string;
        };
    };
    workspace: {
        openTextDocument: (uri: any) => Promise<{
            uri: any;
            getText: () => string;
            save: () => Promise<void>;
            isDirty: boolean;
            fileName: any;
        }>;
        fs: {
            readFile: (uri: any) => Promise<Buffer<ArrayBuffer>>;
            writeFile: (uri: any, content: Buffer) => Promise<void>;
            stat: (uri: any) => Promise<{
                type: number;
                ctime: number;
                mtime: number;
                size: number;
            }>;
            delete: (uri: any) => Promise<void>;
            rename: (source: any, target: any) => Promise<void>;
            createDirectory: (uri: any) => Promise<void>;
        };
        getConfiguration: (section?: string) => {
            get: (key: string, defaultValue?: any) => any;
            update: (key: string, value: any) => Promise<void>;
            inspect: (key: string) => null;
        };
        workspaceFolders: any[];
        onDidChangeConfiguration: {
            dispose: () => void;
        };
        onDidChangeTextDocument: {
            dispose: () => void;
        };
        onDidOpenTextDocument: {
            dispose: () => void;
        };
        onDidSaveTextDocument: {
            dispose: () => void;
        };
        findFiles: (include: string, exclude?: string, maxResults?: number) => Promise<any[]>;
        applyEdit: (edit: any) => Promise<boolean>;
        saveAll: () => Promise<void>;
        textDocuments: any[];
    };
    window: {
        showTextDocument: (document: any, options?: any) => Promise<{
            document: any;
            options: any;
            reveal: () => Promise<void>;
            dispose: () => void;
        }>;
        showInformationMessage: (message: string, ...items: any[]) => Promise<string | undefined>;
        showWarningMessage: (message: string, ...items: any[]) => Promise<undefined>;
        showErrorMessage: (message: string, ...items: any[]) => Promise<string | undefined>;
        createOutputChannel: (name: string) => {
            name: string;
            append: (value: string) => void;
            appendLine: (value: string) => void;
            clear: () => void;
            show: () => void;
            hide: () => void;
            dispose: () => void;
        };
        createStatusBarItem: () => {
            text: string;
            tooltip: string;
            show: () => void;
            hide: () => void;
            dispose: () => void;
        };
        createWebviewPanel: (viewType: string, title: string, column: any, options: any) => {
            webview: {
                html: string;
                postMessage: (message: any) => void;
                onDidReceiveMessage: (callback: (message: any) => void) => {
                    dispose: () => void;
                };
            };
            reveal: (column?: any) => void;
            dispose: () => void;
            onDidDispose: (callback: () => void) => {
                dispose: () => void;
            };
            onDidChangeViewState: (callback: (e: any) => void) => {
                dispose: () => void;
            };
            title: string;
            viewType: string;
            viewColumn: any;
            options: any;
        };
        withProgress: (options: any, task: any) => Promise<any>;
        showInputBox: (options?: any) => Promise<string>;
        showQuickPick: (items: any[], options?: any) => Promise<undefined>;
        showOpenDialog: (options?: any) => Promise<any[]>;
        showSaveDialog: (options?: any) => Promise<any>;
        createInputBox: () => {
            title: string;
            placeholder: string;
            value: string;
            buttons: never[];
            onDidAccept: () => {
                dispose: () => void;
            };
            onDidHide: () => {
                dispose: () => void;
            };
            show: () => void;
            hide: () => void;
            dispose: () => void;
        };
        createQuickPick: () => {
            items: never[];
            selectedItems: never[];
            title: string;
            placeholder: string;
            canSelectMany: boolean;
            onDidAccept: () => {
                dispose: () => void;
            };
            onDidHide: () => {
                dispose: () => void;
            };
            show: () => void;
            hide: () => void;
            dispose: () => void;
        };
        createTreeView: (viewId: string, options: any) => {
            onDidChangeSelection: () => {
                dispose: () => void;
            };
            reveal: (item: any) => Promise<void>;
            dispose: () => void;
        };
        registerWebviewViewProvider: (viewId: string, provider: any, options?: any) => {
            dispose: () => void;
        };
        registerTreeDataProvider: (viewId: string, provider: any) => {
            dispose: () => void;
        };
    };
    commands: {
        executeCommand: (command: string, ...args: any[]) => Promise<undefined>;
        registerCommand: (command: string, callback: (...args: any[]) => any) => {
            command: string;
            callback: (...args: any[]) => any;
            dispose: () => void;
        };
        registerTextEditorCommand: (command: string, callback: any) => {
            command: string;
            callback: any;
            dispose: () => void;
        };
    };
    FileType: {
        Unknown: number;
        File: number;
        Directory: number;
        SymbolicLink: number;
    };
    languages: {
        registerCompletionItemProvider: (selector: any, provider: any, ...triggerCharacters: string[]) => {
            selector: any;
            provider: any;
            triggerCharacters: string[];
            dispose: () => void;
        };
        createDiagnosticCollection: (name: string) => {
            name: string;
            set: () => void;
            delete: () => void;
            clear: () => void;
            dispose: () => void;
            has: () => boolean;
            forEach: () => void;
            get: () => undefined;
        };
    };
    env: {
        appName: string;
        appRoot: string;
        machineId: string;
        sessionId: string;
    };
    ConfigurationTarget: {
        Global: number;
        Workspace: number;
        WorkspaceFolder: number;
    };
    EventEmitter: {
        new (): {
            event: any;
            fire: any;
            dispose: () => void;
        };
    };
    Disposable: {
        new (): {
            dispose: () => void;
        };
    };
    workspaceState: {
        get: (key: string) => undefined;
        update: (key: string, value: any) => Promise<void>;
        keys: () => never[];
    };
    globalState: {
        get: (key: string) => undefined;
        update: (key: string, value: any) => Promise<void>;
        setKeysForSync: (keys: string[]) => void;
        keys: () => never[];
    };
    ExtensionContext: {
        new (): {
            subscriptions: any[];
            workspaceState: any;
            globalState: any;
            extensionPath: string;
            storagePath: string;
            logPath: string;
            extensionUri: any;
        };
    };
    ViewColumn: {
        One: number;
        Two: number;
        Three: number;
        Active: number;
        Beside: number;
    };
    ProgressLocation: {
        Notification: number;
        Window: number;
        SourceControl: number;
    };
    StatusBarAlignment: {
        Left: number;
        Right: number;
    };
    SourceControl: {
        new (): {};
    };
    DebugAdapterDescriptorFactory: {
        new (): {};
    };
    LanguageClient: {
        new (): {};
    };
    TreeItem: {
        new (): {};
    };
    TreeDataProvider: {
        new (): {};
    };
};
/**
 * 设置全局vscode模拟
 * 用于需要在全局作用域中访问vscode的测试
 */
export declare function setupGlobalVscodeMock(): void;
/**
 * 清除全局vscode模拟
 */
export declare function cleanupGlobalVscodeMock(): void;
export default mockVscode;
//# sourceMappingURL=mockVscode.d.ts.map