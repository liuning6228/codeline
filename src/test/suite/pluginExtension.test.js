"use strict";
/**
 * PluginExtension 单元测试
 * 验证插件系统入口点的核心功能
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
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
var assert = require("assert");
var PluginExtension_1 = require("../../plugins/PluginExtension");
// 模拟扩展上下文
var mockExtensionContext = {
    subscriptions: [],
    extensionPath: '/test/extension',
    storagePath: '/test/storage',
    globalStoragePath: '/test/global-storage',
    logPath: '/test/logs',
    asAbsolutePath: function (relativePath) { return "/test/extension/".concat(relativePath); },
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
        keys: function () { return []; }
    },
    extensionMode: 1, // ExtensionMode.Development
    environmentVariableCollection: {}
};
// 模拟工具上下文
var mockToolContext = {
    extensionContext: mockExtensionContext,
    workspaceRoot: '/test/workspace',
    cwd: '/test/workspace',
    outputChannel: {
        name: 'test-channel',
        append: function (value) { return console.log('[TEST]', value); },
        appendLine: function (value) { return console.log('[TEST]', value); },
        replace: function (value) { return console.log('[TEST REPLACE]', value); },
        clear: function () { },
        show: function () { },
        hide: function () { },
        dispose: function () { }
    },
    sessionId: 'test-session',
    sharedResources: {}
};
describe('PluginExtension 单元测试', function () {
    it('单例模式验证', function () {
        // 获取第一个实例
        var instance1 = PluginExtension_1.PluginExtension.getInstance(mockExtensionContext, mockToolContext);
        // 获取第二个实例（应该是同一个）
        var instance2 = PluginExtension_1.PluginExtension.getInstance(mockExtensionContext, mockToolContext);
        // 验证单例
        assert.strictEqual(instance1, instance2, 'PluginExtension 应该返回同一个实例');
    });
    it('初始化方法验证', function () { return __awaiter(void 0, void 0, void 0, function () {
        var pluginExtension, pluginManager, toolRegistry;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pluginExtension = PluginExtension_1.PluginExtension.getInstance(mockExtensionContext, mockToolContext);
                    // 初始化插件系统
                    return [4 /*yield*/, pluginExtension.initialize()];
                case 1:
                    // 初始化插件系统
                    _a.sent();
                    pluginManager = pluginExtension.pluginManager;
                    assert.ok(pluginManager, 'PluginManager 应该被创建');
                    toolRegistry = pluginExtension.pluginToolRegistry;
                    assert.ok(toolRegistry, 'PluginToolRegistry 应该被创建');
                    return [2 /*return*/];
            }
        });
    }); });
    it('获取插件系统状态', function () { return __awaiter(void 0, void 0, void 0, function () {
        var pluginExtension, state;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pluginExtension = PluginExtension_1.PluginExtension.getInstance(mockExtensionContext, mockToolContext);
                    // 先初始化
                    return [4 /*yield*/, pluginExtension.initialize()];
                case 1:
                    // 先初始化
                    _a.sent();
                    return [4 /*yield*/, pluginExtension.getState()];
                case 2:
                    state = _a.sent();
                    // 验证状态结构
                    assert.ok(state, '状态应该被返回');
                    // 检查状态对象的基本属性
                    console.log('插件系统状态详情:', JSON.stringify(state, null, 2));
                    assert.ok(typeof state === 'object', '状态应该是对象');
                    console.log('插件系统状态:', state);
                    return [2 /*return*/];
            }
        });
    }); });
    it('插件列表命令', function () { return __awaiter(void 0, void 0, void 0, function () {
        var pluginExtension;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pluginExtension = PluginExtension_1.PluginExtension.getInstance(mockExtensionContext, mockToolContext);
                    return [4 /*yield*/, pluginExtension.initialize()];
                case 1:
                    _a.sent();
                    // 测试 listPlugins 方法（应该不抛出错误）
                    return [4 /*yield*/, pluginExtension.listPlugins()];
                case 2:
                    // 测试 listPlugins 方法（应该不抛出错误）
                    _a.sent();
                    // 验证至少输出了一些信息
                    console.log('listPlugins 命令执行完成');
                    return [2 /*return*/];
            }
        });
    }); });
    it('插件重新加载命令', function () { return __awaiter(void 0, void 0, void 0, function () {
        var pluginExtension;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pluginExtension = PluginExtension_1.PluginExtension.getInstance(mockExtensionContext, mockToolContext);
                    return [4 /*yield*/, pluginExtension.initialize()];
                case 1:
                    _a.sent();
                    // 测试 reloadPlugins 方法
                    return [4 /*yield*/, pluginExtension.reloadPlugins()];
                case 2:
                    // 测试 reloadPlugins 方法
                    _a.sent();
                    console.log('reloadPlugins 命令执行完成');
                    return [2 /*return*/];
            }
        });
    }); });
    it('插件管理UI命令', function () {
        var pluginExtension = PluginExtension_1.PluginExtension.getInstance(mockExtensionContext, mockToolContext);
        // 测试 showPluginManagementUI 方法（应该不抛出错误）
        pluginExtension.showPluginManagementUI();
        console.log('showPluginManagementUI 命令执行完成');
    });
    it('错误处理 - 重复初始化', function () { return __awaiter(void 0, void 0, void 0, function () {
        var pluginExtension;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pluginExtension = PluginExtension_1.PluginExtension.getInstance(mockExtensionContext, mockToolContext);
                    // 第一次初始化
                    return [4 /*yield*/, pluginExtension.initialize()];
                case 1:
                    // 第一次初始化
                    _a.sent();
                    // 第二次初始化应该被安全处理（不抛出错误）
                    return [4 /*yield*/, pluginExtension.initialize()];
                case 2:
                    // 第二次初始化应该被安全处理（不抛出错误）
                    _a.sent();
                    console.log('重复初始化测试通过');
                    return [2 /*return*/];
            }
        });
    }); });
});
// 运行测试（当直接执行时）
if (require.main === module) {
    console.log('运行 PluginExtension 单元测试...');
    var Mocha_1 = require('mocha');
    var mocha_1 = new Mocha_1();
    mocha_1.addFile(__filename);
    mocha_1.run(function (failures) {
        process.exit(failures > 0 ? 1 : 0);
    });
}
