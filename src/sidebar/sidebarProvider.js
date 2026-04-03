"use strict";
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
exports.CodeLineSidebarProvider = void 0;
var vscode = require("vscode");
var CodeLineSidebarProvider = /** @class */ (function () {
    function CodeLineSidebarProvider(context, extension) {
        this._messages = [];
        this._currentView = 'chat';
        this._isProcessing = false;
        this._context = context;
        this._extension = extension;
    }
    CodeLineSidebarProvider.prototype.resolveWebviewView = function (webviewView, context, token) {
        var _this = this;
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: []
        };
        webviewView.webview.html = this._getWebviewContent();
        webviewView.webview.onDidReceiveMessage(function (message) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._handleWebviewMessage(message)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // Update the webview when it becomes visible
        webviewView.onDidChangeVisibility(function () {
            if (webviewView.visible) {
                _this._updateWebview();
            }
        });
        // Handle extension dispose
        token.onCancellationRequested(function () {
            _this.dispose();
        });
    };
    CodeLineSidebarProvider.prototype.show = function () {
        var _a, _b;
        if (this._view) {
            (_b = (_a = this._view).show) === null || _b === void 0 ? void 0 : _b.call(_a, true);
        }
    };
    CodeLineSidebarProvider.prototype.focus = function () {
        var _a, _b;
        if (this._view) {
            (_b = (_a = this._view).show) === null || _b === void 0 ? void 0 : _b.call(_a, true);
        }
    };
    /**
     * Send a message to the chat from external source (e.g., editor context menu)
     */
    CodeLineSidebarProvider.prototype.sendMessageToChat = function (message) {
        if (!this._view) {
            console.warn('Sidebar view not available');
            return;
        }
        // Show the sidebar first
        this.show();
        // Send message to webview
        this._view.webview.postMessage({
            command: 'externalMessage',
            content: message,
            timestamp: new Date().toISOString()
        });
        // Also add to local messages
        var chatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: message,
            timestamp: new Date()
        };
        this._messages.push(chatMessage);
    };
    /**
     * Focus the chat input in the sidebar
     */
    CodeLineSidebarProvider.prototype.focusChatInput = function () {
        if (!this._view) {
            return;
        }
        this.show();
        this._currentView = 'chat';
        this._updateWebview();
        // Send focus command to webview
        this._view.webview.postMessage({
            command: 'focusInput'
        });
    };
    CodeLineSidebarProvider.prototype.dispose = function () {
        // Cleanup if needed
    };
    CodeLineSidebarProvider.prototype._handleWebviewMessage = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('Sidebar received message:', message);
                        _a = message.command;
                        switch (_a) {
                            case 'switchView': return [3 /*break*/, 1];
                            case 'sendMessage': return [3 /*break*/, 2];
                            case 'executeTask': return [3 /*break*/, 4];
                            case 'clearChat': return [3 /*break*/, 6];
                            case 'openSettings': return [3 /*break*/, 7];
                            case 'saveSettings': return [3 /*break*/, 8];
                            case 'testConnection': return [3 /*break*/, 10];
                            case 'getModelInfo': return [3 /*break*/, 12];
                            case 'copyMessage': return [3 /*break*/, 13];
                            case 'editMessage': return [3 /*break*/, 15];
                            case 'regenerateMessage': return [3 /*break*/, 17];
                        }
                        return [3 /*break*/, 19];
                    case 1:
                        this._currentView = message.view;
                        this._updateWebview();
                        return [3 /*break*/, 19];
                    case 2: return [4 /*yield*/, this._handleUserMessage(message.text)];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 19];
                    case 4: return [4 /*yield*/, this._handleTaskExecution(message.task)];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 19];
                    case 6:
                        this._messages = [];
                        this._updateWebview();
                        return [3 /*break*/, 19];
                    case 7:
                        vscode.commands.executeCommand('codeline.openSettings');
                        return [3 /*break*/, 19];
                    case 8: return [4 /*yield*/, this._handleSaveSettings(message.config)];
                    case 9:
                        _b.sent();
                        return [3 /*break*/, 19];
                    case 10: return [4 /*yield*/, this._handleTestConnection()];
                    case 11:
                        _b.sent();
                        return [3 /*break*/, 19];
                    case 12:
                        this._sendMessageToWebview('modelInfo', {
                            modelInfo: this._extension.getModelInfo()
                        });
                        return [3 /*break*/, 19];
                    case 13: return [4 /*yield*/, vscode.env.clipboard.writeText(message.text)];
                    case 14:
                        _b.sent();
                        vscode.window.showInformationMessage('Message copied to clipboard');
                        return [3 /*break*/, 19];
                    case 15: return [4 /*yield*/, this._handleEditMessage(message.messageId, message.newContent)];
                    case 16:
                        _b.sent();
                        return [3 /*break*/, 19];
                    case 17: return [4 /*yield*/, this._handleRegenerateMessage(message.messageId)];
                    case 18:
                        _b.sent();
                        return [3 /*break*/, 19];
                    case 19: return [2 /*return*/];
                }
            });
        });
    };
    CodeLineSidebarProvider.prototype._handleUserMessage = function (text) {
        return __awaiter(this, void 0, void 0, function () {
            var userMessage, response, assistantMessage, error_1, errorMessage;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this._isProcessing || !text.trim()) {
                            return [2 /*return*/];
                        }
                        this._isProcessing = true;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, 4, 5]);
                        // 添加详细日志
                        console.log("[CodeLine] Processing user message: \"".concat(text, "\""));
                        userMessage = {
                            id: Date.now().toString(),
                            role: 'user',
                            content: text,
                            timestamp: new Date()
                        };
                        this._messages.push(userMessage);
                        this._updateWebview();
                        // Send typing indicator
                        this._sendMessageToWebview('typing', { isTyping: true });
                        // Process through task engine
                        console.log("[CodeLine] Calling executeTask with: \"".concat(text, "\""));
                        return [4 /*yield*/, this._extension.executeTask(text)];
                    case 2:
                        response = _b.sent();
                        console.log("[CodeLine] Task response received:", response);
                        assistantMessage = {
                            id: (Date.now() + 1).toString(),
                            role: 'assistant',
                            content: (response === null || response === void 0 ? void 0 : response.output) || 'No response received',
                            timestamp: new Date()
                        };
                        this._messages.push(assistantMessage);
                        this._updateWebview();
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _b.sent();
                        // 输出完整错误堆栈
                        console.error('[CodeLine] Full error stack:', error_1);
                        console.error('[CodeLine] Error message:', error_1.message);
                        console.error('[CodeLine] Error stack trace:', error_1.stack);
                        errorMessage = {
                            id: (Date.now() + 2).toString(),
                            role: 'assistant',
                            content: "Error: ".concat(error_1.message, "\nStack: ").concat((_a = error_1.stack) === null || _a === void 0 ? void 0 : _a.substring(0, 200), "..."),
                            timestamp: new Date()
                        };
                        this._messages.push(errorMessage);
                        this._updateWebview();
                        vscode.window.showErrorMessage("Failed to process message: ".concat(error_1.message));
                        return [3 /*break*/, 5];
                    case 4:
                        this._isProcessing = false;
                        this._sendMessageToWebview('typing', { isTyping: false });
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    CodeLineSidebarProvider.prototype._handleTaskExecution = function (task) {
        return __awaiter(this, void 0, void 0, function () {
            var result, taskMessage, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._extension.executeTask(task)];
                    case 1:
                        result = _a.sent();
                        taskMessage = {
                            id: Date.now().toString(),
                            role: 'assistant',
                            content: (result === null || result === void 0 ? void 0 : result.output) || 'Task executed',
                            timestamp: new Date()
                        };
                        this._messages.push(taskMessage);
                        this._updateWebview();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        vscode.window.showErrorMessage("Task execution failed: ".concat(error_2.message));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CodeLineSidebarProvider.prototype._handleSaveSettings = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // Update configuration
                        return [4 /*yield*/, this._extension.updateConfig(config)];
                    case 1:
                        // Update configuration
                        _a.sent();
                        this._updateWebview();
                        vscode.window.showInformationMessage('Settings saved successfully');
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        vscode.window.showErrorMessage("Failed to save settings: ".concat(error_3.message));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CodeLineSidebarProvider.prototype._handleTestConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var isReady;
            return __generator(this, function (_a) {
                try {
                    isReady = this._extension.getModelAdapter().isReady();
                    if (isReady) {
                        this._sendMessageToWebview('connectionTest', {
                            success: true,
                            message: 'Connection test successful'
                        });
                        vscode.window.showInformationMessage('Connection test successful');
                    }
                    else {
                        throw new Error('Model adapter is not ready');
                    }
                }
                catch (error) {
                    this._sendMessageToWebview('connectionTest', {
                        success: false,
                        message: error.message
                    });
                    vscode.window.showErrorMessage("Connection test failed: ".concat(error.message));
                }
                return [2 /*return*/];
            });
        });
    };
    CodeLineSidebarProvider.prototype._handleEditMessage = function (messageId, newContent) {
        return __awaiter(this, void 0, void 0, function () {
            var message;
            return __generator(this, function (_a) {
                message = this._messages.find(function (msg) { return msg.id === messageId; });
                if (message && message.role === 'user') {
                    message.content = newContent;
                    this._updateWebview();
                    vscode.window.showInformationMessage('Message updated successfully');
                }
                return [2 /*return*/];
            });
        });
    };
    CodeLineSidebarProvider.prototype._handleRegenerateMessage = function (messageId) {
        return __awaiter(this, void 0, void 0, function () {
            var messageIndex, userMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        messageIndex = this._messages.findIndex(function (msg) { return msg.id === messageId; });
                        if (!(messageIndex > 0 && this._messages[messageIndex].role === 'assistant')) return [3 /*break*/, 2];
                        userMessage = this._messages[messageIndex - 1];
                        this._messages.splice(messageIndex, 1);
                        return [4 /*yield*/, this._handleUserMessage(userMessage.content)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    CodeLineSidebarProvider.prototype._updateWebview = function () {
        if (this._view) {
            this._view.webview.html = this._getWebviewContent();
        }
    };
    CodeLineSidebarProvider.prototype._sendMessageToWebview = function (type, data) {
        if (this._view) {
            this._view.webview.postMessage({ type: type, data: data });
        }
    };
    CodeLineSidebarProvider.prototype._getWebviewContent = function () {
        var config = this._extension.getConfig();
        var isConfigured = this._extension.getModelAdapter().isReady();
        var modelInfo = this._extension.getModelInfo();
        // Escape HTML helper
        var escapeHtml = function (text) {
            return text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        };
        // Messages HTML for chat view
        var messagesHtml = this._messages.map(function (msg) { return "\n            <div class=\"message ".concat(msg.role, "\" data-id=\"").concat(msg.id, "\">\n                <div class=\"message-actions\">\n                    <button class=\"message-action\" title=\"Copy\" onclick=\"copyMessage('").concat(msg.id, "')\">\n                        \uD83D\uDCCB\n                    </button>\n                    ").concat(msg.role === 'user' ? "\n                        <button class=\"message-action\" title=\"Edit\" onclick=\"editMessage('".concat(msg.id, "')\">\n                            \u270F\uFE0F\n                        </button>\n                    ") : '', "\n                    ").concat(msg.role === 'assistant' ? "\n                        <button class=\"message-action\" title=\"Regenerate\" onclick=\"regenerateMessage('".concat(msg.id, "')\">\n                            \uD83D\uDD04\n                        </button>\n                    ") : '', "\n                </div>\n                <div class=\"message-header\">\n                    <span class=\"role\">").concat(msg.role === 'user' ? 'You' : msg.role === 'assistant' ? 'CodeLine' : 'System', "</span>\n                    <span class=\"time\">").concat(msg.timestamp.toLocaleTimeString(), "</span>\n                </div>\n                <div class=\"message-content\">\n                    ").concat(escapeHtml(msg.content), "\n                </div>\n            </div>\n        "); }).join('');
        // Determine which view to show
        var mainContent = '';
        switch (this._currentView) {
            case 'chat':
                mainContent = "\n                    <div class=\"chat-container\">\n                        <div class=\"messages-container\" id=\"messagesContainer\">\n                            ".concat(messagesHtml, "\n                            ").concat(this._isProcessing ? "\n                                <div class=\"typing-indicator\">\n                                    <span></span><span></span><span></span>\n                                </div>\n                            " : '', "\n                        </div>\n                        \n                        <div class=\"input-container\">\n                            <textarea \n                                id=\"messageInput\" \n                                placeholder=\"").concat(isConfigured ? 'Type your message here...' : 'Please configure API key first', "\"\n                                ").concat(!isConfigured ? 'disabled' : '', "\n                                rows=\"3\"\n                            ></textarea>\n                            <button \n                                id=\"sendButton\" \n                                onclick=\"sendMessage()\"\n                                ").concat(!isConfigured ? 'disabled' : '', "\n                            >\n                                Send\n                            </button>\n                        </div>\n                    </div>\n                ");
                break;
            case 'tasks':
                mainContent = "\n                    <div class=\"tasks-container\">\n                        <h3>Recent Tasks</h3>\n                        ".concat(this._messages.length > 0 ? "\n                            <div class=\"tasks-list\">\n                                ".concat(this._messages.slice(-5).reverse().map(function (msg) { return "\n                                    <div class=\"task-item\">\n                                        <div class=\"task-preview\">\n                                            ".concat(escapeHtml(msg.content.substring(0, 100))).concat(msg.content.length > 100 ? '...' : '', "\n                                        </div>\n                                        <div class=\"task-meta\">\n                                            <span class=\"task-role\">").concat(msg.role, "</span>\n                                            <span class=\"task-time\">").concat(msg.timestamp.toLocaleTimeString(), "</span>\n                                        </div>\n                                    </div>\n                                "); }).join(''), "\n                            </div>\n                        ") : "\n                            <div class=\"no-tasks\">\n                                No recent tasks. Start a conversation!\n                            </div>\n                        ", "\n                    </div>\n                ");
                break;
            case 'settings':
                mainContent = "\n                    <div class=\"settings-container\">\n                        <h3>Settings</h3>\n                        \n                        <div class=\"form-group\">\n                            <label for=\"apiKey\">API Key</label>\n                            <input type=\"password\" id=\"apiKey\" value=\"".concat(config.apiKey || '', "\" placeholder=\"Enter your API key\">\n                        </div>\n                        \n                        <div class=\"form-group\">\n                            <label for=\"model\">Model</label>\n                            <select id=\"model\">\n                                <option value=\"deepseek-chat\" ").concat(config.model === 'deepseek-chat' ? 'selected' : '', ">DeepSeek Chat</option>\n                                <option value=\"claude-3-sonnet\" ").concat(config.model === 'claude-3-sonnet' ? 'selected' : '', ">Claude 3 Sonnet</option>\n                                <option value=\"gpt-4\" ").concat(config.model === 'gpt-4' ? 'selected' : '', ">GPT-4</option>\n                                <option value=\"qwen-max\" ").concat(config.model === 'qwen-max' ? 'selected' : '', ">Qwen Max</option>\n                            </select>\n                        </div>\n                        \n                        <div class=\"form-group\">\n                            <label for=\"baseUrl\">API Base URL</label>\n                            <input type=\"text\" id=\"baseUrl\" value=\"").concat(config.baseUrl || '', "\" placeholder=\"https://api.deepseek.com\">\n                        </div>\n                        \n                        <div class=\"form-group checkbox\">\n                            <input type=\"checkbox\" id=\"autoAnalyze\" ").concat(config.autoAnalyze ? 'checked' : '', ">\n                            <label for=\"autoAnalyze\">Auto-analyze project on startup</label>\n                        </div>\n                        \n                        <div class=\"button-group\">\n                            <button onclick=\"saveSettings()\">Save Settings</button>\n                            <button onclick=\"testConnection()\" class=\"secondary\">Test Connection</button>\n                        </div>\n                    </div>\n                ");
                break;
            case 'history':
                mainContent = "\n                    <div class=\"history-container\">\n                        <h3>Chat History</h3>\n                        ".concat(this._messages.length > 0 ? "\n                            <div class=\"history-list\">\n                                ".concat(this._messages.map(function (msg, index) { return "\n                                    <div class=\"history-item\" data-id=\"".concat(msg.id, "\">\n                                        <div class=\"history-index\">").concat(index + 1, "</div>\n                                        <div class=\"history-content\">\n                                            <div class=\"history-preview\">\n                                                ").concat(escapeHtml(msg.content.substring(0, 80))).concat(msg.content.length > 80 ? '...' : '', "\n                                            </div>\n                                            <div class=\"history-meta\">\n                                                <span class=\"history-role\">").concat(msg.role, "</span>\n                                                <span class=\"history-time\">").concat(msg.timestamp.toLocaleString(), "</span>\n                                            </div>\n                                        </div>\n                                    </div>\n                                "); }).join(''), "\n                            </div>\n                        ") : "\n                            <div class=\"no-history\">\n                                No chat history yet.\n                            </div>\n                        ", "\n                        <div class=\"history-actions\">\n                            <button onclick=\"clearChat()\">Clear Chat</button>\n                        </div>\n                    </div>\n                ");
                break;
        }
        return "\n            <!DOCTYPE html>\n            <html>\n            <head>\n                <meta charset=\"UTF-8\">\n                <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n                <style>\n                    :root {\n                        --bg-primary: #1e1e1e;\n                        --bg-secondary: #252526;\n                        --bg-tertiary: #2d2d30;\n                        --text-primary: #d4d4d4;\n                        --text-secondary: #858585;\n                        --accent: #007acc;\n                        --accent-hover: #0062a3;\n                        --border: #3e3e42;\n                        --success: #2d7d46;\n                        --error: #a1260d;\n                        --warning: #d69d2e;\n                    }\n                    \n                    * {\n                        margin: 0;\n                        padding: 0;\n                        box-sizing: border-box;\n                    }\n                    \n                    body {\n                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;\n                        background: var(--bg-primary);\n                        color: var(--text-primary);\n                        height: 100vh;\n                        overflow: hidden;\n                        display: flex;\n                        flex-direction: column;\n                    }\n                    \n                    /* Header */\n                    .header {\n                        background: var(--bg-secondary);\n                        border-bottom: 1px solid var(--border);\n                        padding: 12px 16px;\n                        display: flex;\n                        align-items: center;\n                        justify-content: space-between;\n                    }\n                    \n                    .header h2 {\n                        font-size: 14px;\n                        font-weight: 600;\n                        margin: 0;\n                    }\n                    \n                    .nav-tabs {\n                        display: flex;\n                        gap: 4px;\n                        background: var(--bg-tertiary);\n                        border-radius: 4px;\n                        padding: 2px;\n                    }\n                    \n                    .nav-tab {\n                        padding: 8px;\n                        border: none;\n                        background: transparent;\n                        color: var(--text-secondary);\n                        cursor: pointer;\n                        border-radius: 4px;\n                        transition: all 0.2s;\n                        display: flex;\n                        align-items: center;\n                        justify-content: center;\n                        width: 36px;\n                        height: 36px;\n                    }\n                    \n                    .nav-icon {\n                        font-size: 18px;\n                        line-height: 1;\n                    }\n                    \n                    .nav-tab:hover {\n                        background: rgba(255, 255, 255, 0.05);\n                        color: var(--text-primary);\n                    }\n                    \n                    .nav-tab.active {\n                        background: var(--accent);\n                        color: white;\n                    }\n                    \n                    /* Status bar */\n                    .status-bar {\n                        background: var(--bg-secondary);\n                        border-top: 1px solid var(--border);\n                        padding: 8px 16px;\n                        font-size: 11px;\n                        color: var(--text-secondary);\n                        display: flex;\n                        justify-content: space-between;\n                        align-items: center;\n                    }\n                    \n                    .status-indicator {\n                        display: flex;\n                        align-items: center;\n                        gap: 6px;\n                    }\n                    \n                    .status-dot {\n                        width: 8px;\n                        height: 8px;\n                        border-radius: 50%;\n                        background: ".concat(isConfigured ? 'var(--success)' : 'var(--error)', ";\n                    }\n                    \n                    /* Main content */\n                    .content {\n                        flex: 1;\n                        overflow: hidden;\n                        display: flex;\n                        flex-direction: column;\n                    }\n                    \n                    .view-container {\n                        flex: 1;\n                        overflow: auto;\n                        padding: 16px;\n                    }\n                    \n                    /* Chat view */\n                    .chat-container {\n                        height: 100%;\n                        display: flex;\n                        flex-direction: column;\n                    }\n                    \n                    .messages-container {\n                        flex: 1;\n                        overflow-y: auto;\n                        margin-bottom: 16px;\n                    }\n                    \n                    .message {\n                        background: var(--bg-secondary);\n                        border-radius: 6px;\n                        padding: 12px;\n                        margin-bottom: 12px;\n                        position: relative;\n                    }\n                    \n                    .message.user {\n                        border-left: 3px solid var(--accent);\n                    }\n                    \n                    .message.assistant {\n                        border-left: 3px solid var(--success);\n                    }\n                    \n                    .message.system {\n                        border-left: 3px solid var(--warning);\n                    }\n                    \n                    .message-actions {\n                        position: absolute;\n                        top: 8px;\n                        right: 8px;\n                        display: flex;\n                        gap: 4px;\n                        opacity: 0;\n                        transition: opacity 0.2s;\n                    }\n                    \n                    .message:hover .message-actions {\n                        opacity: 1;\n                    }\n                    \n                    .message-action {\n                        background: rgba(255, 255, 255, 0.1);\n                        border: none;\n                        color: var(--text-primary);\n                        width: 24px;\n                        height: 24px;\n                        border-radius: 3px;\n                        cursor: pointer;\n                        font-size: 12px;\n                        display: flex;\n                        align-items: center;\n                        justify-content: center;\n                    }\n                    \n                    .message-action:hover {\n                        background: rgba(255, 255, 255, 0.2);\n                    }\n                    \n                    .message-header {\n                        display: flex;\n                        justify-content: space-between;\n                        margin-bottom: 8px;\n                        font-size: 12px;\n                    }\n                    \n                    .role {\n                        font-weight: 600;\n                        color: var(--accent);\n                    }\n                    \n                    .time {\n                        color: var(--text-secondary);\n                    }\n                    \n                    .message-content {\n                        line-height: 1.5;\n                        white-space: pre-wrap;\n                        font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;\n                        font-size: 13px;\n                    }\n                    \n                    .input-container {\n                        display: flex;\n                        gap: 8px;\n                        padding-top: 16px;\n                        border-top: 1px solid var(--border);\n                    }\n                    \n                    textarea {\n                        flex: 1;\n                        background: var(--bg-secondary);\n                        border: 1px solid var(--border);\n                        border-radius: 4px;\n                        color: var(--text-primary);\n                        padding: 8px 12px;\n                        font-family: inherit;\n                        font-size: 13px;\n                        resize: none;\n                        outline: none;\n                    }\n                    \n                    textarea:focus {\n                        border-color: var(--accent);\n                    }\n                    \n                    textarea:disabled {\n                        opacity: 0.5;\n                        cursor: not-allowed;\n                    }\n                    \n                    button {\n                        background: var(--accent);\n                        color: white;\n                        border: none;\n                        border-radius: 4px;\n                        padding: 8px 16px;\n                        font-size: 13px;\n                        cursor: pointer;\n                        transition: background 0.2s;\n                    }\n                    \n                    button:hover:not(:disabled) {\n                        background: var(--accent-hover);\n                    }\n                    \n                    button:disabled {\n                        opacity: 0.5;\n                        cursor: not-allowed;\n                    }\n                    \n                    button.secondary {\n                        background: var(--bg-tertiary);\n                        color: var(--text-primary);\n                    }\n                    \n                    button.secondary:hover {\n                        background: rgba(255, 255, 255, 0.1);\n                    }\n                    \n                    /* Typing indicator */\n                    .typing-indicator {\n                        display: flex;\n                        gap: 4px;\n                        padding: 16px;\n                        justify-content: center;\n                    }\n                    \n                    .typing-indicator span {\n                        width: 8px;\n                        height: 8px;\n                        background: var(--text-secondary);\n                        border-radius: 50%;\n                        animation: typing 1.4s infinite both;\n                    }\n                    \n                    .typing-indicator span:nth-child(2) {\n                        animation-delay: 0.2s;\n                    }\n                    \n                    .typing-indicator span:nth-child(3) {\n                        animation-delay: 0.4s;\n                    }\n                    \n                    @keyframes typing {\n                        0%, 60%, 100% {\n                            transform: translateY(0);\n                        }\n                        30% {\n                            transform: translateY(-8px);\n                        }\n                    }\n                    \n                    /* Tasks view */\n                    .tasks-container, .settings-container, .history-container {\n                        height: 100%;\n                    }\n                    \n                    h3 {\n                        margin-bottom: 16px;\n                        font-size: 16px;\n                        font-weight: 600;\n                    }\n                    \n                    .tasks-list, .history-list {\n                        display: flex;\n                        flex-direction: column;\n                        gap: 8px;\n                    }\n                    \n                    .task-item, .history-item {\n                        background: var(--bg-secondary);\n                        border-radius: 4px;\n                        padding: 12px;\n                        border-left: 3px solid var(--border);\n                    }\n                    \n                    .task-item:hover, .history-item:hover {\n                        background: rgba(255, 255, 255, 0.05);\n                    }\n                    \n                    .task-preview, .history-preview {\n                        font-size: 13px;\n                        line-height: 1.4;\n                        margin-bottom: 4px;\n                    }\n                    \n                    .task-meta, .history-meta {\n                        display: flex;\n                        justify-content: space-between;\n                        font-size: 11px;\n                        color: var(--text-secondary);\n                    }\n                    \n                    .history-item {\n                        display: flex;\n                        gap: 12px;\n                    }\n                    \n                    .history-index {\n                        background: var(--bg-tertiary);\n                        width: 24px;\n                        height: 24px;\n                        border-radius: 50%;\n                        display: flex;\n                        align-items: center;\n                        justify-content: center;\n                        font-size: 11px;\n                        flex-shrink: 0;\n                    }\n                    \n                    .history-content {\n                        flex: 1;\n                    }\n                    \n                    /* Settings view */\n                    .form-group {\n                        margin-bottom: 16px;\n                    }\n                    \n                    label {\n                        display: block;\n                        margin-bottom: 4px;\n                        font-size: 13px;\n                        color: var(--text-primary);\n                    }\n                    \n                    input, select {\n                        width: 100%;\n                        background: var(--bg-secondary);\n                        border: 1px solid var(--border);\n                        border-radius: 4px;\n                        color: var(--text-primary);\n                        padding: 8px 12px;\n                        font-size: 13px;\n                        outline: none;\n                    }\n                    \n                    input:focus, select:focus {\n                        border-color: var(--accent);\n                    }\n                    \n                    .checkbox {\n                        display: flex;\n                        align-items: center;\n                        gap: 8px;\n                    }\n                    \n                    .checkbox input {\n                        width: auto;\n                        margin: 0;\n                    }\n                    \n                    .checkbox label {\n                        margin: 0;\n                    }\n                    \n                    .button-group {\n                        display: flex;\n                        gap: 8px;\n                        margin-top: 24px;\n                    }\n                    \n                    /* Empty states */\n                    .no-tasks, .no-history {\n                        text-align: center;\n                        padding: 40px 20px;\n                        color: var(--text-secondary);\n                        font-style: italic;\n                    }\n                    \n                    .history-actions {\n                        margin-top: 16px;\n                        display: flex;\n                        justify-content: flex-end;\n                    }\n                </style>\n            </head>\n            <body>\n                <div class=\"header\">\n                    <h2>CodeLine</h2>\n                    <div class=\"nav-tabs\">\n                        <button class=\"nav-tab ").concat(this._currentView === 'chat' ? 'active' : '', "\" onclick=\"switchView('chat')\" title=\"Chat\">\n                            <span class=\"nav-icon\">\uD83D\uDCAC</span>\n                        </button>\n                        <button class=\"nav-tab ").concat(this._currentView === 'tasks' ? 'active' : '', "\" onclick=\"switchView('tasks')\" title=\"Tasks\">\n                            <span class=\"nav-icon\">\uD83D\uDCCB</span>\n                        </button>\n                        <button class=\"nav-tab ").concat(this._currentView === 'settings' ? 'active' : '', "\" onclick=\"switchView('settings')\" title=\"Settings\">\n                            <span class=\"nav-icon\">\u2699\uFE0F</span>\n                        </button>\n                        <button class=\"nav-tab ").concat(this._currentView === 'history' ? 'active' : '', "\" onclick=\"switchView('history')\" title=\"History\">\n                            <span class=\"nav-icon\">\uD83D\uDCDC</span>\n                        </button>\n                    </div>\n                </div>\n                \n                <div class=\"content\">\n                    <div class=\"view-container\" id=\"viewContainer\">\n                        ").concat(mainContent, "\n                    </div>\n                </div>\n                \n                <div class=\"status-bar\">\n                    <div class=\"status-indicator\">\n                        <div class=\"status-dot\"></div>\n                        <span>").concat(isConfigured ? 'Connected' : 'Not configured', "</span>\n                    </div>\n                    <div class=\"model-info\">").concat(modelInfo, "</div>\n                </div>\n                \n                <script>\n                    const vscode = acquireVsCodeApi();\n                    \n                    // Auto-scroll messages to bottom\n                    function scrollToBottom() {\n                        const container = document.getElementById('messagesContainer');\n                        if (container) {\n                            container.scrollTop = container.scrollHeight;\n                        }\n                    }\n                    \n                    // View switching\n                    function switchView(view) {\n                        vscode.postMessage({\n                            command: 'switchView',\n                            view: view\n                        });\n                    }\n                    \n                    // Message handling\n                    function sendMessage() {\n                        const input = document.getElementById('messageInput');\n                        const text = input.value.trim();\n                        \n                        if (text) {\n                            vscode.postMessage({\n                                command: 'sendMessage',\n                                text: text\n                            });\n                            input.value = '';\n                            input.focus();\n                            setTimeout(scrollToBottom, 100);\n                        }\n                    }\n                    \n                    // Handle Enter key in textarea (Ctrl+Enter to send)\n                    const messageInput = document.getElementById('messageInput');\n                    if (messageInput) {\n                        messageInput.addEventListener('keydown', (e) => {\n                            if (e.key === 'Enter' && !e.shiftKey) {\n                                e.preventDefault();\n                                sendMessage();\n                            }\n                        });\n                    }\n                    \n                    // Message actions\n                    function copyMessage(messageId) {\n                        const messageElement = document.querySelector(`.message[data-id=\"${messageId}\"] .message-content`);\n                        if (messageElement) {\n                            const text = messageElement.textContent;\n                            vscode.postMessage({\n                                command: 'copyMessage',\n                                text: text\n                            });\n                        }\n                    }\n                    \n                    function editMessage(messageId) {\n                        const messageElement = document.querySelector(`.message[data-id=\"${messageId}\"] .message-content`);\n                        if (messageElement) {\n                            const currentText = messageElement.textContent;\n                            const newText = prompt('Edit message:', currentText);\n                            if (newText !== null && newText !== currentText) {\n                                vscode.postMessage({\n                                    command: 'editMessage',\n                                    messageId: messageId,\n                                    newContent: newText\n                                });\n                            }\n                        }\n                    }\n                    \n                    function regenerateMessage(messageId) {\n                        vscode.postMessage({\n                            command: 'regenerateMessage',\n                            messageId: messageId\n                        });\n                    }\n                    \n                    // Settings\n                    function saveSettings() {\n                        const apiKey = document.getElementById('apiKey').value;\n                        const model = document.getElementById('model').value;\n                        const baseUrl = document.getElementById('baseUrl').value;\n                        const autoAnalyze = document.getElementById('autoAnalyze').checked;\n                        \n                        vscode.postMessage({\n                            command: 'saveSettings',\n                            config: {\n                                apiKey: apiKey,\n                                model: model,\n                                baseUrl: baseUrl,\n                                autoAnalyze: autoAnalyze\n                            }\n                        });\n                    }\n                    \n                    function testConnection() {\n                        vscode.postMessage({\n                            command: 'testConnection'\n                        });\n                    }\n                    \n                    // Chat history\n                    function clearChat() {\n                        if (confirm('Are you sure you want to clear all chat history?')) {\n                            vscode.postMessage({\n                                command: 'clearChat'\n                            });\n                        }\n                    }\n                    \n                    // Initialize\n                    setTimeout(scrollToBottom, 100);\n                    \n                    // Handle messages from extension\n                    window.addEventListener('message', event => {\n                        const message = event.data;\n                        \n                        switch (message.type) {\n                            case 'typing':\n                                // Handle typing indicator\n                                const typingIndicator = document.querySelector('.typing-indicator');\n                                if (typingIndicator) {\n                                    typingIndicator.style.display = message.data.isTyping ? 'flex' : 'none';\n                                }\n                                break;\n                                \n                            case 'modelInfo':\n                                // Update model info in status bar\n                                const modelInfoElement = document.querySelector('.model-info');\n                                if (modelInfoElement) {\n                                    modelInfoElement.textContent = message.data.modelInfo;\n                                }\n                                break;\n                                \n                            case 'connectionTest':\n                                alert(message.data.message);\n                                break;\n                        }\n                    });\n                </script>\n            </body>\n            </html>\n        ");
    };
    CodeLineSidebarProvider.viewType = 'codeline.chat';
    return CodeLineSidebarProvider;
}());
exports.CodeLineSidebarProvider = CodeLineSidebarProvider;
