"use strict";
/**
 * VS Code模拟模块
 * 用于在没有实际VS Code环境的测试中模拟vscode API
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
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
        file: function (path) { return ({
            fsPath: path,
            toString: function () { return path; },
            with: function () { return ({}); }
        }); },
        parse: function (uri) { return ({ fsPath: uri, toString: function () { return uri; } }); },
        joinPath: function (base) {
            var pathSegments = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                pathSegments[_i - 1] = arguments[_i];
            }
            return ({
                fsPath: __spreadArray([base.fsPath], pathSegments, true).join('/'),
                toString: function () { return __spreadArray([base.toString()], pathSegments, true).join('/'); }
            });
        }
    },
    // 工作区相关
    workspace: {
        openTextDocument: function (uri) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, ({
                        uri: uri,
                        getText: function () { return ''; },
                        save: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/];
                        }); }); },
                        isDirty: false,
                        fileName: uri.fsPath
                    })];
            });
        }); },
        fs: {
            readFile: function (uri) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, Buffer.from('')];
            }); }); },
            writeFile: function (uri, content) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/];
            }); }); },
            stat: function (uri) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, ({
                            type: 1, // FileType.File
                            ctime: Date.now(),
                            mtime: Date.now(),
                            size: 0
                        })];
                });
            }); },
            delete: function (uri) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/];
            }); }); },
            rename: function (source, target) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/];
            }); }); },
            createDirectory: function (uri) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/];
            }); }); }
        },
        getConfiguration: function (section) { return ({
            get: function (key, defaultValue) { return defaultValue; },
            update: function (key, value) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/];
            }); }); },
            inspect: function (key) { return null; }
        }); },
        workspaceFolders: [
            {
                uri: {
                    fsPath: process.cwd(),
                    toString: function () { return "file://".concat(process.cwd()); },
                    scheme: 'file',
                    authority: '',
                    path: process.cwd(),
                    query: '',
                    fragment: '',
                    with: function () { return ({}); }
                },
                name: process.cwd().split('/').pop() || 'test-workspace',
                index: 0
            }
        ],
        onDidChangeConfiguration: {
            dispose: function () { }
        },
        onDidChangeTextDocument: {
            dispose: function () { }
        },
        onDidOpenTextDocument: {
            dispose: function () { }
        },
        onDidSaveTextDocument: {
            dispose: function () { }
        },
        findFiles: function (include, exclude, maxResults) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, []];
        }); }); },
        applyEdit: function (edit) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, true];
        }); }); },
        saveAll: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); }); },
        textDocuments: []
    },
    // 窗口相关
    window: {
        showTextDocument: function (document, options) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, ({
                        document: document,
                        options: options,
                        reveal: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/];
                        }); }); },
                        dispose: function () { }
                    })];
            });
        }); },
        showInformationMessage: function (message) {
            var items = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                items[_i - 1] = arguments[_i];
            }
            return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, undefined];
            }); });
        },
        showWarningMessage: function (message) {
            var items = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                items[_i - 1] = arguments[_i];
            }
            return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, undefined];
            }); });
        },
        showErrorMessage: function (message) {
            var items = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                items[_i - 1] = arguments[_i];
            }
            return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, undefined];
            }); });
        },
        createOutputChannel: function (name) { return ({
            name: name,
            append: function (value) { },
            appendLine: function (value) { },
            clear: function () { },
            show: function () { },
            hide: function () { },
            dispose: function () { }
        }); },
        createStatusBarItem: function () { return ({
            text: '',
            tooltip: '',
            show: function () { },
            hide: function () { },
            dispose: function () { }
        }); },
        createWebviewPanel: function (viewType, title, column, options) {
            console.log("[MOCK] createWebviewPanel: ".concat(viewType, ", ").concat(title));
            return {
                webview: {
                    html: '',
                    postMessage: function (message) {
                        console.log('[MOCK] webview.postMessage:', message);
                    },
                    onDidReceiveMessage: function (callback) {
                        return { dispose: function () { } };
                    }
                },
                reveal: function (column) {
                    console.log('[MOCK] webviewPanel.reveal');
                    return;
                },
                dispose: function () {
                    console.log('[MOCK] webviewPanel.dispose');
                },
                onDidDispose: function (callback) {
                    return { dispose: function () { } };
                },
                onDidChangeViewState: function (callback) {
                    return { dispose: function () { } };
                },
                title: title,
                viewType: viewType,
                viewColumn: column,
                options: options
            };
        },
        withProgress: function (options, task) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, task({
                        report: function (value) { }
                    })];
            });
        }); },
        showInputBox: function (options) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, ''];
        }); }); },
        showQuickPick: function (items, options) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, undefined];
        }); }); },
        showOpenDialog: function (options) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, []];
        }); }); },
        showSaveDialog: function (options) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, undefined];
        }); }); },
        createInputBox: function () { return ({
            title: '',
            placeholder: '',
            value: '',
            buttons: [],
            onDidAccept: function () { return ({ dispose: function () { } }); },
            onDidHide: function () { return ({ dispose: function () { } }); },
            show: function () { },
            hide: function () { },
            dispose: function () { }
        }); },
        createQuickPick: function () { return ({
            items: [],
            selectedItems: [],
            title: '',
            placeholder: '',
            canSelectMany: false,
            onDidAccept: function () { return ({ dispose: function () { } }); },
            onDidHide: function () { return ({ dispose: function () { } }); },
            show: function () { },
            hide: function () { },
            dispose: function () { }
        }); },
        createTreeView: function (viewId, options) { return ({
            onDidChangeSelection: function () { return ({ dispose: function () { } }); },
            reveal: function (item) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/];
            }); }); },
            dispose: function () { }
        }); },
        registerWebviewViewProvider: function (viewId, provider, options) { return ({
            dispose: function () { }
        }); },
        registerTreeDataProvider: function (viewId, provider) { return ({
            dispose: function () { }
        }); }
    },
    // 命令相关
    commands: {
        executeCommand: function (command) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    console.log("[MOCK] executeCommand: ".concat(command), args);
                    return [2 /*return*/, undefined];
                });
            });
        },
        registerCommand: function (command, callback) { return ({
            command: command,
            callback: callback,
            dispose: function () { }
        }); },
        registerTextEditorCommand: function (command, callback) { return ({
            command: command,
            callback: callback,
            dispose: function () { }
        }); }
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
        registerCompletionItemProvider: function (selector, provider) {
            var triggerCharacters = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                triggerCharacters[_i - 2] = arguments[_i];
            }
            return ({
                selector: selector,
                provider: provider,
                triggerCharacters: triggerCharacters,
                dispose: function () { }
            });
        },
        createDiagnosticCollection: function (name) { return ({
            name: name,
            set: function () { },
            delete: function () { },
            clear: function () { },
            dispose: function () { },
            has: function () { return false; },
            forEach: function () { },
            get: function () { return undefined; }
        }); }
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
    EventEmitter: /** @class */ (function () {
        function class_1() {
            this.event = function () { };
            this.fire = function () { };
            this.dispose = function () { };
        }
        return class_1;
    }()),
    // 可销毁对象
    Disposable: /** @class */ (function () {
        function class_2() {
            this.dispose = function () { };
        }
        return class_2;
    }()),
    // 状态管理
    workspaceState: {
        get: function (key) { return undefined; },
        update: function (key, value) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); }); },
        keys: function () { return []; }
    },
    globalState: {
        get: function (key) { return undefined; },
        update: function (key, value) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); }); },
        setKeysForSync: function (keys) { },
        keys: function () { return []; }
    },
    // 扩展上下文
    ExtensionContext: /** @class */ (function () {
        function class_3() {
            this.subscriptions = [];
            this.extensionPath = '/tmp/extension-test';
            this.storagePath = '/tmp/storage-test';
            this.logPath = '/tmp/log-test';
            this.extensionUri = { fsPath: '/tmp/extension-test' };
            this.workspaceState = exports.mockVscode.workspaceState;
            this.globalState = exports.mockVscode.globalState;
        }
        return class_3;
    }()),
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
    SourceControl: /** @class */ (function () {
        function SourceControl() {
        }
        return (SourceControl);
    }()),
    // 调试相关
    DebugAdapterDescriptorFactory: /** @class */ (function () {
        function DebugAdapterDescriptorFactory() {
        }
        return (DebugAdapterDescriptorFactory);
    }()),
    // 语言服务器
    LanguageClient: /** @class */ (function () {
        function LanguageClient() {
        }
        return (LanguageClient);
    }()),
    // 树视图
    TreeItem: /** @class */ (function () {
        function TreeItem() {
        }
        return (TreeItem);
    }()),
    TreeDataProvider: /** @class */ (function () {
        function TreeDataProvider() {
        }
        return TreeDataProvider;
    }())
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
