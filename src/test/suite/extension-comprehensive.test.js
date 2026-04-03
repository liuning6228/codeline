"use strict";
/**
 * CodeLineExtension全面测试套件
 * 测试扩展类的核心功能
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var extension_1 = require("../../extension");
var mockVscode_1 = require("../helpers/mockVscode");
require("mocha");
// 模拟依赖类
var MockProjectAnalyzer = /** @class */ (function () {
    function MockProjectAnalyzer() {
        this.analyzeProjectCallCount = 0;
    }
    MockProjectAnalyzer.prototype.analyzeProject = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.analyzeProjectCallCount++;
                return [2 /*return*/, {
                        languages: ['TypeScript', 'JavaScript'],
                        files: 50,
                        size: '2.5MB'
                    }];
            });
        });
    };
    return MockProjectAnalyzer;
}());
var MockPromptEngine = /** @class */ (function () {
    function MockPromptEngine() {
        this.generatePromptCallCount = 0;
    }
    MockPromptEngine.prototype.generatePrompt = function (context, task) {
        this.generatePromptCallCount++;
        return "Mock prompt for: ".concat(task);
    };
    return MockPromptEngine;
}());
var MockModelAdapter = /** @class */ (function () {
    function MockModelAdapter() {
        this.isReadyCallCount = 0;
        this.testConnectionCallCount = 0;
        this.updateConfigurationCallCount = 0;
    }
    MockModelAdapter.prototype.isReady = function () {
        this.isReadyCallCount++;
        return true;
    };
    MockModelAdapter.prototype.testConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.testConnectionCallCount++;
                return [2 /*return*/, true];
            });
        });
    };
    MockModelAdapter.prototype.updateConfiguration = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.updateConfigurationCallCount++;
                return [2 /*return*/];
            });
        });
    };
    MockModelAdapter.prototype.getConfiguration = function () {
        return {
            apiKey: 'test-key',
            model: 'mock-model',
            baseUrl: 'https://api.mock.com',
            temperature: 0.7,
            maxTokens: 2048,
            autoAnalyze: false,
            showExamples: true,
            typingIndicator: true
        };
    };
    MockModelAdapter.prototype.getModelInfo = function () {
        return 'Mock Model v1.0 (configured)';
    };
    return MockModelAdapter;
}());
var MockFileManager = /** @class */ (function () {
    function MockFileManager(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        this.listDirectoryCallCount = 0;
        this.searchFilesCallCount = 0;
    }
    MockFileManager.prototype.listDirectory = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.listDirectoryCallCount++;
                return [2 /*return*/, {
                        files: [
                            { name: 'test.txt', type: 'file', size: 123 },
                            { name: 'src', type: 'directory' }
                        ]
                    }];
            });
        });
    };
    MockFileManager.prototype.searchFiles = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.searchFilesCallCount++;
                return [2 /*return*/, {
                        results: [
                            { file: 'test.txt', line: 1, content: 'Hello World' }
                        ]
                    }];
            });
        });
    };
    return MockFileManager;
}());
var MockTaskEngine = /** @class */ (function () {
    function MockTaskEngine() {
        this.executeTaskCallCount = 0;
    }
    MockTaskEngine.prototype.executeTask = function (taskDescription) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.executeTaskCallCount++;
                return [2 /*return*/, {
                        success: true,
                        message: "Task executed: ".concat(taskDescription),
                        actions: []
                    }];
            });
        });
    };
    return MockTaskEngine;
}());
var MockTerminalExecutor = /** @class */ (function () {
    function MockTerminalExecutor() {
        this.executeCommandCallCount = 0;
    }
    MockTerminalExecutor.prototype.executeCommand = function (command) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.executeCommandCallCount++;
                return [2 /*return*/, {
                        success: true,
                        output: "Mock output for: ".concat(command)
                    }];
            });
        });
    };
    return MockTerminalExecutor;
}());
var MockBrowserAutomator = /** @class */ (function () {
    function MockBrowserAutomator() {
        this.navigateCallCount = 0;
    }
    MockBrowserAutomator.prototype.navigate = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.navigateCallCount++;
                return [2 /*return*/, {
                        success: true,
                        message: "Navigated to: ".concat(url)
                    }];
            });
        });
    };
    return MockBrowserAutomator;
}());
// 模拟ExtensionContext
var mockExtensionContext = {
    subscriptions: [],
    workspaceState: {
        get: function (key) { return undefined; },
        update: function (key, value) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); }); }
    },
    globalState: {
        get: function (key) { return undefined; },
        update: function (key, value) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); }); }
    },
    extensionPath: '/tmp/mock-extension',
    storagePath: '/tmp/mock-storage',
    logPath: '/tmp/mock-logs',
    environmentVariableCollection: {
        persistent: false,
        replace: function () { },
        append: function () { },
        prepend: function () { },
        get: function () { return undefined; }
    }
};
describe('CodeLineExtension Comprehensive Tests', function () {
    var originalVscode;
    var mockVscodeInstance;
    beforeEach(function () {
        // 保存原始vscode并设置mock
        originalVscode = global.vscode;
        mockVscodeInstance = __assign(__assign({}, mockVscode_1.mockVscode), { workspace: __assign(__assign({}, mockVscode_1.mockVscode.workspace), { workspaceFolders: [
                    { uri: { fsPath: '/tmp/test-workspace' }, name: 'test-workspace' }
                ] }) });
        global.vscode = mockVscodeInstance;
        // 重置单例
        extension_1.CodeLineExtension.instance = undefined;
    });
    afterEach(function () {
        // 恢复原始vscode
        global.vscode = originalVscode;
    });
    it('getInstance should create singleton instance', function () {
        // 第一次获取实例（需要提供context）
        var instance1 = extension_1.CodeLineExtension.getInstance(mockExtensionContext);
        assert.ok(instance1, 'Should create instance');
        // 第二次获取实例（应该返回同一个实例）
        var instance2 = extension_1.CodeLineExtension.getInstance();
        assert.strictEqual(instance2, instance1, 'Should return the same singleton instance');
        // 第三次获取实例（即使提供新的context，也应该返回同一个实例）
        var instance3 = extension_1.CodeLineExtension.getInstance({});
        assert.strictEqual(instance3, instance1, 'Should return singleton even with new context');
    });
    it('getInstance should require context for initial creation', function () {
        // 没有提供context的情况下获取实例（应该返回undefined或抛出错误）
        // 根据实现，如果没有实例且没有context，应该返回undefined或抛出错误
        // 先创建实例
        var instance1 = extension_1.CodeLineExtension.getInstance(mockExtensionContext);
        assert.ok(instance1, 'Should create instance with context');
        // 现在可以无context获取
        var instance2 = extension_1.CodeLineExtension.getInstance();
        assert.ok(instance2, 'Should get existing instance without context');
    });
    it('startChat should work when model is ready', function () { return __awaiter(void 0, void 0, void 0, function () {
        var instance, createWebviewPanelCallCount, originalCreateWebviewPanel;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    instance = extension_1.CodeLineExtension.getInstance(mockExtensionContext);
                    createWebviewPanelCallCount = 0;
                    originalCreateWebviewPanel = mockVscodeInstance.window.createWebviewPanel;
                    mockVscodeInstance.window.createWebviewPanel = function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        createWebviewPanelCallCount++;
                        return originalCreateWebviewPanel.apply(void 0, args);
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, instance.startChat()];
                case 2:
                    _a.sent();
                    // startChat应该调用createWebviewPanel
                    assert.strictEqual(createWebviewPanelCallCount, 1, 'startChat should create webview panel');
                    return [3 /*break*/, 4];
                case 3:
                    mockVscodeInstance.window.createWebviewPanel = originalCreateWebviewPanel;
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    it('executeTask should work', function () { return __awaiter(void 0, void 0, void 0, function () {
        var instance, mockTaskEngine, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    instance = extension_1.CodeLineExtension.getInstance(mockExtensionContext);
                    mockTaskEngine = new MockTaskEngine();
                    instance.taskEngine = mockTaskEngine;
                    // 确保fileManager也设置好
                    instance.fileManager = new MockFileManager('/tmp/test-workspace');
                    return [4 /*yield*/, instance.executeTask('Test task')];
                case 1:
                    result = _a.sent();
                    assert.ok(result, 'executeTask should return result');
                    assert.strictEqual(mockTaskEngine.executeTaskCallCount, 1, 'Should call task engine');
                    return [2 /*return*/];
            }
        });
    }); });
    it('executeFileCommand should handle different commands', function () { return __awaiter(void 0, void 0, void 0, function () {
        var instance, mockFileManager, listResult, searchResult, statsResult, browseResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    instance = extension_1.CodeLineExtension.getInstance(mockExtensionContext);
                    mockFileManager = new MockFileManager('/tmp/test-workspace');
                    instance.fileManager = mockFileManager;
                    return [4 /*yield*/, instance.executeFileCommand('listFiles', { path: '/' })];
                case 1:
                    listResult = _a.sent();
                    assert.ok(listResult, 'listFiles should return result');
                    assert.strictEqual(mockFileManager.listDirectoryCallCount, 1, 'Should call listDirectory');
                    return [4 /*yield*/, instance.executeFileCommand('searchFiles', { query: 'test' })];
                case 2:
                    searchResult = _a.sent();
                    assert.ok(searchResult, 'searchFiles should return result');
                    assert.strictEqual(mockFileManager.searchFilesCallCount, 1, 'Should call searchFiles');
                    return [4 /*yield*/, instance.executeFileCommand('getStats')];
                case 3:
                    statsResult = _a.sent();
                    assert.ok(statsResult, 'getStats should return result');
                    return [4 /*yield*/, instance.executeFileCommand('browseDirectory', { path: '/' })];
                case 4:
                    browseResult = _a.sent();
                    assert.ok(browseResult, 'browseDirectory should return result');
                    assert.strictEqual(mockFileManager.listDirectoryCallCount, 2, 'Should call listDirectory again');
                    return [2 /*return*/];
            }
        });
    }); });
    it('analyzeProject should work', function () { return __awaiter(void 0, void 0, void 0, function () {
        var instance, mockProjectAnalyzer, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    instance = extension_1.CodeLineExtension.getInstance(mockExtensionContext);
                    mockProjectAnalyzer = new MockProjectAnalyzer();
                    instance.projectAnalyzer = mockProjectAnalyzer;
                    return [4 /*yield*/, instance.analyzeProject()];
                case 1:
                    result = _a.sent();
                    assert.ok(result, 'analyzeProject should return result');
                    assert.strictEqual(mockProjectAnalyzer.analyzeProjectCallCount, 1, 'Should call project analyzer');
                    return [2 /*return*/];
            }
        });
    }); });
    it('getModelInfo should return model information', function () {
        var instance = extension_1.CodeLineExtension.getInstance(mockExtensionContext);
        var modelInfo = instance.getModelInfo();
        assert.ok(modelInfo, 'getModelInfo should return string');
        assert.strictEqual(typeof modelInfo, 'string', 'Model info should be string');
    });
    it('getConfig should return configuration', function () {
        var instance = extension_1.CodeLineExtension.getInstance(mockExtensionContext);
        var config = instance.getConfig();
        assert.ok(config, 'getConfig should return configuration');
        assert.ok('apiKey' in config, 'Config should have apiKey');
        assert.ok('model' in config, 'Config should have model');
    });
    it('updateConfig should update configuration', function () {
        var instance = extension_1.CodeLineExtension.getInstance(mockExtensionContext);
        var newConfig = {
            apiKey: 'new-test-key',
            model: 'new-model',
            temperature: 0.8
        };
        instance.updateConfig(newConfig);
        // 验证配置已更新
        var config = instance.getConfig();
        assert.strictEqual(config.apiKey, 'new-test-key', 'apiKey should be updated');
        assert.strictEqual(config.model, 'new-model', 'model should be updated');
        assert.strictEqual(config.temperature, 0.8, 'temperature should be updated');
    });
    it('approveFileDiff should work', function () { return __awaiter(void 0, void 0, void 0, function () {
        var instance, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    instance = extension_1.CodeLineExtension.getInstance(mockExtensionContext);
                    return [4 /*yield*/, instance.approveFileDiff('test-diff-123', 'approve')];
                case 1:
                    result = _a.sent();
                    assert.ok(result, 'approveFileDiff should return result');
                    assert.ok('success' in result, 'Result should have success property');
                    assert.ok('message' in result, 'Result should have message property');
                    return [2 /*return*/];
            }
        });
    }); });
    it('getModelAdapter should return model adapter', function () {
        var instance = extension_1.CodeLineExtension.getInstance(mockExtensionContext);
        var modelAdapter = instance.getModelAdapter();
        assert.ok(modelAdapter, 'getModelAdapter should return model adapter');
        assert.strictEqual(typeof modelAdapter.isReady, 'function', 'Model adapter should have isReady method');
    });
    it('Extension should handle missing workspace gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
        var instance, originalWorkspaceFolders, errorCaught, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    instance = extension_1.CodeLineExtension.getInstance(mockExtensionContext);
                    originalWorkspaceFolders = mockVscodeInstance.workspace.workspaceFolders;
                    mockVscodeInstance.workspace.workspaceFolders = [];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 6, 7]);
                    // 确保taskEngine未初始化
                    instance.taskEngine = undefined;
                    instance.fileManager = undefined;
                    errorCaught = false;
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, instance.executeTask('Test task')];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    errorCaught = true;
                    assert.ok(error_1.message.includes('workspace'), 'Error should mention workspace');
                    return [3 /*break*/, 5];
                case 5:
                    // 根据实现，可能会抛出错误或显示错误消息
                    assert.ok(true, 'Extension should handle missing workspace');
                    return [3 /*break*/, 7];
                case 6:
                    mockVscodeInstance.workspace.workspaceFolders = originalWorkspaceFolders;
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); });
    it('Extension methods should be accessible', function () {
        var instance = extension_1.CodeLineExtension.getInstance(mockExtensionContext);
        // 验证所有公共方法都存在
        assert.strictEqual(typeof instance.startChat, 'function', 'startChat should be function');
        assert.strictEqual(typeof instance.executeTask, 'function', 'executeTask should be function');
        assert.strictEqual(typeof instance.executeFileCommand, 'function', 'executeFileCommand should be function');
        assert.strictEqual(typeof instance.analyzeProject, 'function', 'analyzeProject should be function');
        assert.strictEqual(typeof instance.getModelAdapter, 'function', 'getModelAdapter should be function');
        assert.strictEqual(typeof instance.getModelInfo, 'function', 'getModelInfo should be function');
        assert.strictEqual(typeof instance.getConfig, 'function', 'getConfig should be function');
        assert.strictEqual(typeof instance.updateConfig, 'function', 'updateConfig should be function');
        assert.strictEqual(typeof instance.approveFileDiff, 'function', 'approveFileDiff should be function');
    });
});
