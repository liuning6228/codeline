"use strict";
/**
 * CodeLineChatPanel简化版单元测试
 * 先测试最基本的功能，然后逐步扩展
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
var assert = require("assert");
var chatPanel_1 = require("../../chat/chatPanel");
var mockVscode_1 = require("../helpers/mockVscode");
require("mocha");
// 模拟CodeLineExtension
var MockCodeLineExtension = /** @class */ (function () {
    function MockCodeLineExtension() {
    }
    MockCodeLineExtension.prototype.getModelInfo = function () {
        return 'Mock Model';
    };
    MockCodeLineExtension.prototype.getConfig = function () {
        return { apiKey: 'test' };
    };
    return MockCodeLineExtension;
}());
// 模拟ExtensionContext
var mockContext = {
    subscriptions: [],
    workspaceState: { get: function () { return undefined; }, update: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); }); } },
    globalState: { get: function () { return undefined; }, update: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); }); } },
    extensionPath: '/tmp/mock',
    storagePath: '/tmp/mock-storage',
    logPath: '/tmp/mock-logs'
};
describe('CodeLineChatPanel Basic Tests', function () {
    var originalVscode;
    beforeEach(function () {
        // 保存原始vscode并设置mock
        originalVscode = global.vscode;
        global.vscode = mockVscode_1.mockVscode;
        // 重置静态变量
        chatPanel_1.CodeLineChatPanel.currentPanel = undefined;
    });
    afterEach(function () {
        // 恢复原始vscode
        global.vscode = originalVscode;
    });
    it('ChatMessage interface should work', function () {
        var message = {
            id: 'test-1',
            role: 'user',
            content: 'Hello',
            timestamp: new Date()
        };
        assert.strictEqual(message.id, 'test-1');
        assert.strictEqual(message.role, 'user');
        assert.strictEqual(message.content, 'Hello');
        assert.ok(message.timestamp instanceof Date);
    });
    it('createOrShow should create panel when none exists', function () {
        var createWebviewPanelCallCount = 0;
        var originalCreateWebviewPanel = mockVscode_1.mockVscode.window.createWebviewPanel;
        // 跟踪createWebviewPanel调用
        mockVscode_1.mockVscode.window.createWebviewPanel = function (viewType, title, column, options) {
            createWebviewPanelCallCount++;
            console.log("createWebviewPanel called (count: ".concat(createWebviewPanelCallCount, ")"));
            return originalCreateWebviewPanel(viewType, title, column, options);
        };
        try {
            chatPanel_1.CodeLineChatPanel.createOrShow(mockContext, new MockCodeLineExtension());
            assert.strictEqual(createWebviewPanelCallCount, 1, 'Should create webview panel');
            assert.ok(chatPanel_1.CodeLineChatPanel.currentPanel, 'Current panel should be set');
        }
        finally {
            // 恢复原始函数
            mockVscode_1.mockVscode.window.createWebviewPanel = originalCreateWebviewPanel;
        }
    });
    it('createOrShow should not create duplicate panels', function () {
        var createWebviewPanelCallCount = 0;
        var originalCreateWebviewPanel = mockVscode_1.mockVscode.window.createWebviewPanel;
        mockVscode_1.mockVscode.window.createWebviewPanel = function (viewType, title, column, options) {
            createWebviewPanelCallCount++;
            return originalCreateWebviewPanel(viewType, title, column, options);
        };
        try {
            // 第一次创建
            chatPanel_1.CodeLineChatPanel.createOrShow(mockContext, new MockCodeLineExtension());
            var firstCallCount = createWebviewPanelCallCount;
            // 第二次调用（应该只reveal，不创建）
            chatPanel_1.CodeLineChatPanel.createOrShow(mockContext, new MockCodeLineExtension());
            assert.strictEqual(createWebviewPanelCallCount, firstCallCount, 'Should not create additional panel when one exists');
        }
        finally {
            mockVscode_1.mockVscode.window.createWebviewPanel = originalCreateWebviewPanel;
        }
    });
    it('show method should work', function () { return __awaiter(void 0, void 0, void 0, function () {
        var panel;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // 创建panel
                    chatPanel_1.CodeLineChatPanel.createOrShow(mockContext, new MockCodeLineExtension());
                    panel = chatPanel_1.CodeLineChatPanel.currentPanel;
                    // show方法应该可用
                    return [4 /*yield*/, panel.show()];
                case 1:
                    // show方法应该可用
                    _a.sent();
                    // 没有错误就是成功
                    assert.ok(true, 'show method should execute without error');
                    return [2 /*return*/];
            }
        });
    }); });
    it('Panel should handle webview messages', function () {
        // 这个测试比较复杂，因为handleWebviewMessage是私有方法
        // 我们可以通过构造函数或公共API间接测试
        // 先创建一个基础测试
        chatPanel_1.CodeLineChatPanel.createOrShow(mockContext, new MockCodeLineExtension());
        // 验证panel已创建
        assert.ok(chatPanel_1.CodeLineChatPanel.currentPanel, 'Panel should exist');
        // 更多的消息处理测试需要更复杂的模拟
        assert.ok(true, 'Webview message handling test placeholder');
    });
    it('Static currentPanel should be accessible', function () {
        // 初始应为undefined
        assert.strictEqual(chatPanel_1.CodeLineChatPanel.currentPanel, undefined, 'currentPanel should be undefined initially');
        // 创建后应该设置
        chatPanel_1.CodeLineChatPanel.createOrShow(mockContext, new MockCodeLineExtension());
        assert.ok(chatPanel_1.CodeLineChatPanel.currentPanel, 'currentPanel should be set after creation');
        // 清理
        chatPanel_1.CodeLineChatPanel.currentPanel = undefined;
    });
});
