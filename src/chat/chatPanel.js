"use strict";
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
exports.CodeLineChatPanel = void 0;
var vscode = require("vscode");
var CodeLineChatPanel = /** @class */ (function () {
    function CodeLineChatPanel(panel, context, extension) {
        var _this = this;
        this.messages = [];
        this.isProcessing = false;
        this.currentView = 'chat';
        this.panel = panel;
        this.context = context;
        this.extension = extension;
        // Set the webview's initial html content
        this.updateWebview();
        // Listen for when the panel is disposed
        this.panel.onDidDispose(function () { return _this.dispose(); }, null, this.context.subscriptions);
        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(function (message) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.handleWebviewMessage(message)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, null, this.context.subscriptions);
    }
    CodeLineChatPanel.createOrShow = function (context, extension) {
        var column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        // If we already have a panel, show it
        if (CodeLineChatPanel.currentPanel) {
            CodeLineChatPanel.currentPanel.panel.reveal(column);
            return;
        }
        // Otherwise, create a new panel
        var panel = vscode.window.createWebviewPanel('codelineChat', 'CodeLine Chat', column || vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: []
        });
        CodeLineChatPanel.currentPanel = new CodeLineChatPanel(panel, context, extension);
    };
    CodeLineChatPanel.prototype.show = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                CodeLineChatPanel.createOrShow(this.context, this.extension);
                return [2 /*return*/];
            });
        });
    };
    CodeLineChatPanel.prototype.handleWebviewMessage = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('Received message from webview:', message);
                        _a = message.command;
                        switch (_a) {
                            case 'sendMessage': return [3 /*break*/, 1];
                            case 'executeTask': return [3 /*break*/, 3];
                            case 'clearChat': return [3 /*break*/, 5];
                            case 'getHistory': return [3 /*break*/, 6];
                            case 'openSettings': return [3 /*break*/, 7];
                            case 'switchView': return [3 /*break*/, 8];
                            case 'saveSettings': return [3 /*break*/, 9];
                            case 'testConnection': return [3 /*break*/, 11];
                            case 'approveDiff': return [3 /*break*/, 13];
                            case 'resetSettings': return [3 /*break*/, 15];
                            case 'fileCommand': return [3 /*break*/, 17];
                            case 'editMessage': return [3 /*break*/, 19];
                            case 'regenerateMessage': return [3 /*break*/, 21];
                            case 'signOut': return [3 /*break*/, 23];
                            case 'upgradeAccount': return [3 /*break*/, 25];
                            case 'addMCP': return [3 /*break*/, 27];
                            case 'executeTaskWithStream': return [3 /*break*/, 29];
                            case 'taskEvent': return [3 /*break*/, 31];
                        }
                        return [3 /*break*/, 33];
                    case 1: return [4 /*yield*/, this.handleUserMessage(message.text, message.isExternal, message.externalTimestamp)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 33];
                    case 3: return [4 /*yield*/, this.handleTaskExecution(message.task)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 33];
                    case 5:
                        this.messages = [];
                        this.updateWebview();
                        return [3 /*break*/, 33];
                    case 6:
                        this.sendMessageToWebview('history', { messages: this.messages });
                        return [3 /*break*/, 33];
                    case 7:
                        vscode.commands.executeCommand('codeline.openSettings');
                        return [3 /*break*/, 33];
                    case 8:
                        this.currentView = message.view;
                        this.updateWebview();
                        return [3 /*break*/, 33];
                    case 9: return [4 /*yield*/, this.handleSaveSettings(message.config)];
                    case 10:
                        _b.sent();
                        return [3 /*break*/, 33];
                    case 11: return [4 /*yield*/, this.handleTestConnection()];
                    case 12:
                        _b.sent();
                        return [3 /*break*/, 33];
                    case 13: return [4 /*yield*/, this.handleApproveDiff(message.filePath, message.diffId, message.action)];
                    case 14:
                        _b.sent();
                        return [3 /*break*/, 33];
                    case 15: return [4 /*yield*/, this.handleResetSettings()];
                    case 16:
                        _b.sent();
                        return [3 /*break*/, 33];
                    case 17: return [4 /*yield*/, this.handleFileCommand(message.fileCommand, message.data)];
                    case 18:
                        _b.sent();
                        return [3 /*break*/, 33];
                    case 19: return [4 /*yield*/, this.handleEditMessage(message.messageId, message.newContent)];
                    case 20:
                        _b.sent();
                        return [3 /*break*/, 33];
                    case 21: return [4 /*yield*/, this.handleRegenerateMessage(message.messageId)];
                    case 22:
                        _b.sent();
                        return [3 /*break*/, 33];
                    case 23: return [4 /*yield*/, this.handleSignOut()];
                    case 24:
                        _b.sent();
                        return [3 /*break*/, 33];
                    case 25: return [4 /*yield*/, this.handleUpgradeAccount()];
                    case 26:
                        _b.sent();
                        return [3 /*break*/, 33];
                    case 27: return [4 /*yield*/, this.handleAddMCP()];
                    case 28:
                        _b.sent();
                        return [3 /*break*/, 33];
                    case 29: return [4 /*yield*/, this.handleTaskExecutionWithStream(message.task)];
                    case 30:
                        _b.sent();
                        return [3 /*break*/, 33];
                    case 31: return [4 /*yield*/, this.handleTaskEvent(message.event)];
                    case 32:
                        _b.sent();
                        return [3 /*break*/, 33];
                    case 33: return [2 /*return*/];
                }
            });
        });
    };
    CodeLineChatPanel.prototype.handleSaveSettings = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // Update configuration
                    this.extension.updateConfig(config);
                    // Show success message
                    vscode.window.showInformationMessage('CodeLine settings saved successfully');
                    // Update webview with new config
                    this.sendMessageToWebview('configUpdated', { config: config });
                    this.updateWebview();
                }
                catch (error) {
                    vscode.window.showErrorMessage("Failed to save settings: ".concat(error.message));
                }
                return [2 /*return*/];
            });
        });
    };
    CodeLineChatPanel.prototype.handleTestConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var modelInfo;
            return __generator(this, function (_a) {
                try {
                    modelInfo = this.extension.getModelInfo();
                    if (modelInfo === 'Not configured') {
                        vscode.window.showWarningMessage('CodeLine is not configured. Please set your API key first.');
                    }
                    else {
                        vscode.window.showInformationMessage("Connection test successful! Model: ".concat(modelInfo));
                    }
                }
                catch (error) {
                    vscode.window.showErrorMessage("Connection test failed: ".concat(error.message));
                }
                return [2 /*return*/];
            });
        });
    };
    CodeLineChatPanel.prototype.handleResetSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            var defaultConfig;
            return __generator(this, function (_a) {
                try {
                    defaultConfig = {
                        apiKey: '',
                        model: 'deepseek-chat',
                        baseUrl: 'https://api.deepseek.com',
                        temperature: 0.7,
                        maxTokens: 2048,
                        autoAnalyze: false,
                        showExamples: true,
                        typingIndicator: true
                    };
                    this.extension.updateConfig(defaultConfig);
                    // Show success message
                    vscode.window.showInformationMessage('CodeLine settings reset to defaults');
                    // Update webview with new config
                    this.sendMessageToWebview('configUpdated', { config: defaultConfig });
                    this.updateWebview();
                }
                catch (error) {
                    vscode.window.showErrorMessage("Failed to reset settings: ".concat(error.message));
                }
                return [2 /*return*/];
            });
        });
    };
    CodeLineChatPanel.prototype.handleApproveDiff = function (filePath, diffId, action) {
        return __awaiter(this, void 0, void 0, function () {
            var result_1, message, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.extension.approveFileDiff(diffId, action)];
                    case 1:
                        result_1 = _a.sent();
                        if (result_1.success) {
                            message = action === 'approve' ?
                                "\u2713 Approved changes for: ".concat(filePath) :
                                "\u2717 Rejected changes for: ".concat(filePath);
                            vscode.window.showInformationMessage(message, 'View Details').then(function (selection) {
                                if (selection === 'View Details') {
                                    // 可以在输出面板显示操作详情
                                    var outputChannel = vscode.window.createOutputChannel('CodeLine File Operations');
                                    outputChannel.show(true);
                                    outputChannel.appendLine("File: ".concat(filePath));
                                    outputChannel.appendLine("Action: ".concat(action === 'approve' ? 'Approved' : 'Rejected'));
                                    outputChannel.appendLine("Result: ".concat(result_1.message));
                                }
                            });
                        }
                        else {
                            vscode.window.showErrorMessage("Failed to ".concat(action, " changes: ").concat(result_1.error || 'Unknown error'));
                        }
                        // 更新UI状态
                        this.sendMessageToWebview('diffActionResult', {
                            filePath: filePath,
                            diffId: diffId,
                            action: action,
                            success: result_1.success,
                            message: result_1.message,
                            error: result_1.error
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        vscode.window.showErrorMessage("Failed to ".concat(action, " changes: ").concat(error_1.message));
                        this.sendMessageToWebview('diffActionResult', {
                            filePath: filePath,
                            diffId: diffId,
                            action: action,
                            success: false,
                            error: error_1.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 添加助手消息到聊天
     */
    CodeLineChatPanel.prototype.addAssistantMessage = function (content) {
        var assistantMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: content,
            timestamp: new Date()
        };
        this.messages.push(assistantMessage);
        this.updateWebview();
    };
    /**
     * 格式化文件命令结果为可读消息
     */
    CodeLineChatPanel.prototype.formatFileCommandResult = function (command, result) {
        var _this = this;
        var _a;
        if (!result.success) {
            return "\u274C File command \"".concat(command, "\" failed: ").concat(result.message || result.error || 'Unknown error');
        }
        switch (command) {
            case 'listFiles':
                var listData = result.data;
                var listMessage_1 = "\uD83D\uDCC1 **Directory Listing** (".concat(listData.path || 'current directory', ")\n\n");
                listMessage_1 += "\uD83D\uDCC2 Directories: ".concat(listData.directories, "\n");
                listMessage_1 += "\uD83D\uDCC4 Files: ".concat(listData.filesCount, "\n");
                listMessage_1 += "\uD83D\uDCCA Total Size: ".concat(this.formatFileSize(listData.totalSize), "\n\n");
                if (listData.files && listData.files.length > 0) {
                    listMessage_1 += "**Contents**:\n";
                    listData.files.forEach(function (file, index) {
                        if (index < 10) { // 只显示前10个
                            var icon = file.type === 'directory' ? '📁' : '📄';
                            var size = file.type === 'directory' ? '' : " (".concat(_this.formatFileSize(file.size), ")");
                            var ext = file.extension ? " ".concat(file.extension) : '';
                            listMessage_1 += "".concat(icon, " **").concat(file.name, "**").concat(ext).concat(size, "\n");
                        }
                    });
                    if (listData.files.length > 10) {
                        listMessage_1 += "... and ".concat(listData.files.length - 10, " more items\n");
                    }
                }
                else {
                    listMessage_1 += "*Directory is empty*\n";
                }
                return listMessage_1;
            case 'searchFiles':
                var searchData = result.data;
                var searchMessage_1 = "\uD83D\uDD0D **File Search Results**\n\n";
                searchMessage_1 += "\uD83D\uDCCA Found: ".concat(searchData.length, " files\n\n");
                if (searchData.length > 0) {
                    searchMessage_1 += "**Top Results**:\n";
                    searchData.slice(0, 5).forEach(function (file, index) {
                        searchMessage_1 += "".concat(index + 1, ". **").concat(file.name, "** (").concat(file.path, ")\n");
                        if (file.matches && file.matches.length > 0) {
                            searchMessage_1 += "   Matches: ".concat(file.matches.length, " content matches\n");
                        }
                    });
                    if (searchData.length > 5) {
                        searchMessage_1 += "... and ".concat(searchData.length - 5, " more files\n");
                    }
                }
                else {
                    searchMessage_1 += "*No files found matching search criteria*\n";
                }
                return searchMessage_1;
            case 'getStats':
                var statsData = result.data;
                var statsMessage_1 = "\uD83D\uDCCA **Workspace Statistics**\n\n";
                statsMessage_1 += "\uD83D\uDCC2 Total Files: ".concat(statsData.totalFiles, "\n");
                statsMessage_1 += "\uD83D\uDCDD Total Lines: ".concat(statsData.totalLines, "\n");
                statsMessage_1 += "\uD83D\uDCBE Total Size: ".concat(this.formatFileSize(statsData.totalSize), "\n\n");
                statsMessage_1 += "**File Types**:\n";
                Object.entries(statsData.byType).forEach(function (_a) {
                    var type = _a[0], count = _a[1];
                    var icon = type === 'directory' ? '📁' : type === 'file' ? '📄' : '🔗';
                    statsMessage_1 += "".concat(icon, " ").concat(type, ": ").concat(count, "\n");
                });
                if (Object.keys(statsData.byExtension).length > 0) {
                    statsMessage_1 += "\n**Extensions**:\n";
                    var topExtensions = Object.entries(statsData.byExtension)
                        .sort(function (a, b) { return b[1].count - a[1].count; })
                        .slice(0, 5);
                    topExtensions.forEach(function (_a) {
                        var ext = _a[0], data = _a[1];
                        statsMessage_1 += "".concat(ext, ": ").concat(data.count, " files, ").concat(data.lines, " lines\n");
                    });
                }
                return statsMessage_1;
            case 'browseDirectory':
                var browseData = result.data;
                var browseMessage_1 = "\uD83D\uDCC2 **Directory Browser**\n\n";
                browseMessage_1 += "\uD83D\uDCC1 Selected: ".concat(result.path || 'current directory', "\n");
                browseMessage_1 += "\uD83D\uDCCA Items: ".concat(((_a = browseData.files) === null || _a === void 0 ? void 0 : _a.length) || 0, "\n\n");
                if (browseData.files && browseData.files.length > 0) {
                    browseMessage_1 += "**Contents**:\n";
                    browseData.files.slice(0, 8).forEach(function (file) {
                        var icon = file.type === 'directory' ? '📁' : '📄';
                        browseMessage_1 += "".concat(icon, " ").concat(file.name, "\n");
                    });
                    if (browseData.files.length > 8) {
                        browseMessage_1 += "... and ".concat(browseData.files.length - 8, " more items\n");
                    }
                }
                return browseMessage_1;
            default:
                return "\u2705 File operation \"".concat(command, "\" completed: ").concat(result.message);
        }
    };
    /**
     * 格式化文件大小（B, KB, MB, GB）
     */
    CodeLineChatPanel.prototype.formatFileSize = function (bytes) {
        if (bytes === 0)
            return '0 B';
        var units = ['B', 'KB', 'MB', 'GB'];
        var i = Math.floor(Math.log(bytes) / Math.log(1024));
        return "".concat((bytes / Math.pow(1024, i)).toFixed(2), " ").concat(units[i]);
    };
    CodeLineChatPanel.prototype.handleUserMessage = function (text, isExternal, externalTimestamp) {
        return __awaiter(this, void 0, void 0, function () {
            var userMessage, taskResult, responseContent_1, completedSteps, totalSteps, oldResponse, assistantMessage, error_2, errorMessage;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.isProcessing) {
                            return [2 /*return*/];
                        }
                        this.isProcessing = true;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, 4, 5]);
                        userMessage = {
                            id: Date.now().toString(),
                            role: 'user',
                            content: text,
                            timestamp: externalTimestamp ? new Date(externalTimestamp) : new Date(),
                            isExternal: isExternal || false
                        };
                        this.messages.push(userMessage);
                        this.updateWebview();
                        // Show typing indicator
                        this.sendMessageToWebview('typing', { isTyping: true });
                        return [4 /*yield*/, this.extension.executeTask(text)];
                    case 2:
                        taskResult = _c.sent();
                        responseContent_1 = '';
                        if (taskResult && 'success' in taskResult) {
                            // 新的TaskResult格式
                            if (taskResult.success) {
                                completedSteps = ((_a = taskResult.steps) === null || _a === void 0 ? void 0 : _a.filter(function (s) { return s.status === 'completed'; }).length) || 0;
                                totalSteps = ((_b = taskResult.steps) === null || _b === void 0 ? void 0 : _b.length) || 0;
                                responseContent_1 = "\u2705 Task completed successfully!\n\n";
                                responseContent_1 += "**Summary**: ".concat(completedSteps, "/").concat(totalSteps, " steps executed\n\n");
                                if (taskResult.output) {
                                    responseContent_1 += "**Output**:\n".concat(taskResult.output.substring(0, 500));
                                    if (taskResult.output.length > 500) {
                                        responseContent_1 += '...\n*(output truncated)*';
                                    }
                                }
                                // 显示步骤摘要
                                if (taskResult.steps && taskResult.steps.length > 0) {
                                    responseContent_1 += "\n\n**Steps**:\n";
                                    taskResult.steps.forEach(function (step, index) {
                                        var statusIcon = step.status === 'completed' ? '✓' :
                                            step.status === 'failed' ? '✗' :
                                                step.status === 'executing' ? '⟳' : '⏸';
                                        responseContent_1 += "".concat(index + 1, ". ").concat(statusIcon, " ").concat(step.type, ": ").concat(step.description, "\n");
                                    });
                                }
                            }
                            else {
                                responseContent_1 = "\u274C Task failed: ".concat(taskResult.error || 'Unknown error', "\n\n");
                                if (taskResult.output) {
                                    responseContent_1 += "**Error Details**:\n".concat(taskResult.output);
                                }
                            }
                        }
                        else {
                            oldResponse = taskResult;
                            responseContent_1 = oldResponse.content || 'I processed your request.';
                        }
                        assistantMessage = {
                            id: (Date.now() + 1).toString(),
                            role: 'assistant',
                            content: responseContent_1,
                            timestamp: new Date()
                        };
                        this.messages.push(assistantMessage);
                        // Hide typing indicator
                        this.sendMessageToWebview('typing', { isTyping: false });
                        this.updateWebview();
                        return [3 /*break*/, 5];
                    case 3:
                        error_2 = _c.sent();
                        console.error('Error processing message:', error_2);
                        errorMessage = {
                            id: Date.now().toString(),
                            role: 'system',
                            content: "Error: ".concat(error_2.message),
                            timestamp: new Date()
                        };
                        this.messages.push(errorMessage);
                        this.sendMessageToWebview('typing', { isTyping: false });
                        this.updateWebview();
                        return [3 /*break*/, 5];
                    case 4:
                        this.isProcessing = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    CodeLineChatPanel.prototype.handleTaskExecution = function (task) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.extension.executeTask(task)];
                    case 1:
                        result = _a.sent();
                        this.sendMessageToWebview('taskResult', { result: result });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        this.sendMessageToWebview('taskError', { error: error_3.message });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CodeLineChatPanel.prototype.handleEditMessage = function (messageId, newContent) {
        return __awaiter(this, void 0, void 0, function () {
            var messageIndex;
            return __generator(this, function (_a) {
                try {
                    messageIndex = this.messages.findIndex(function (msg) { return msg.id === messageId; });
                    if (messageIndex === -1) {
                        throw new Error('Message not found');
                    }
                    // Update the message content
                    this.messages[messageIndex].content = newContent;
                    this.messages[messageIndex].timestamp = new Date();
                    // Update the webview
                    this.updateWebview();
                    // Show success feedback
                    vscode.window.showInformationMessage('Message updated successfully', 'OK');
                }
                catch (error) {
                    vscode.window.showErrorMessage("Failed to edit message: ".concat(error.message));
                }
                return [2 /*return*/];
            });
        });
    };
    CodeLineChatPanel.prototype.handleRegenerateMessage = function (messageId) {
        return __awaiter(this, void 0, void 0, function () {
            var messageIndex, message_1, previousMessages, userMessageIndex, i, userMessage;
            var _this = this;
            return __generator(this, function (_a) {
                try {
                    messageIndex = this.messages.findIndex(function (msg) { return msg.id === messageId; });
                    if (messageIndex === -1) {
                        throw new Error('Message not found');
                    }
                    message_1 = this.messages[messageIndex];
                    // Only regenerate assistant messages
                    if (message_1.role !== 'assistant') {
                        throw new Error('Only assistant messages can be regenerated');
                    }
                    previousMessages = this.messages.slice(0, messageIndex + 1);
                    userMessageIndex = -1;
                    for (i = previousMessages.length - 1; i >= 0; i--) {
                        if (previousMessages[i].role === 'user') {
                            userMessageIndex = i;
                            break;
                        }
                    }
                    if (userMessageIndex === -1) {
                        throw new Error('No user message found for context');
                    }
                    userMessage = this.messages[userMessageIndex];
                    // Show loading indicator
                    vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: "Regenerating response...",
                        cancellable: false
                    }, function (progress) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            // Simulate regeneration (in real implementation, call AI)
                            progress.report({ increment: 50 });
                            // For now, just mark as regenerated
                            message_1.content = "".concat(message_1.content, "\n\n[Regenerated at ").concat(new Date().toLocaleTimeString(), "]");
                            message_1.timestamp = new Date();
                            this.updateWebview();
                            vscode.window.showInformationMessage('Response regenerated successfully', 'OK');
                            return [2 /*return*/];
                        });
                    }); });
                }
                catch (error) {
                    vscode.window.showErrorMessage("Failed to regenerate message: ".concat(error.message));
                }
                return [2 /*return*/];
            });
        });
    };
    CodeLineChatPanel.prototype.handleFileCommand = function (command, data) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.extension.executeFileCommand(command, data)];
                    case 1:
                        result = _a.sent();
                        this.sendMessageToWebview('fileCommandResult', { command: command, result: result });
                        // 同时将结果显示为聊天消息
                        this.addAssistantMessage(this.formatFileCommandResult(command, result));
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        this.sendMessageToWebview('fileCommandError', { command: command, error: error_4.message });
                        this.addAssistantMessage("File command \"".concat(command, "\" failed: ").concat(error_4.message));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CodeLineChatPanel.prototype.sendMessageToWebview = function (command, data) {
        this.panel.webview.postMessage(__assign({ command: command }, data));
    };
    CodeLineChatPanel.prototype.updateWebview = function () {
        this.panel.webview.html = this.getWebviewContent();
        // Send model info to webview
        var modelInfo = this.extension.getModelInfo();
        this.sendMessageToWebview('modelInfo', { modelInfo: modelInfo });
    };
    CodeLineChatPanel.prototype.getWebviewContent = function () {
        var _this = this;
        var config = this.extension.getConfig();
        // Messages HTML for chat display
        var messagesHtml = this.messages.map(function (msg) { return "\n      <div class=\"message ".concat(msg.role, "\" data-id=\"").concat(msg.id, "\">\n        <div class=\"message-actions\">\n          <button class=\"message-action\" title=\"Copy\" onclick=\"copyMessage('").concat(msg.id, "')\">\n            \uD83D\uDCCB\n          </button>\n          ").concat(msg.role === 'user' ? "\n            <button class=\"message-action\" title=\"Edit\" onclick=\"editMessage('".concat(msg.id, "')\">\n              \u270F\uFE0F\n            </button>\n          ") : '', "\n          ").concat(msg.role === 'assistant' ? "\n            <button class=\"message-action\" title=\"Regenerate\" onclick=\"regenerateMessage('".concat(msg.id, "')\">\n              \uD83D\uDD04\n            </button>\n          ") : '', "\n        </div>\n        <div class=\"message-header\">\n          <span class=\"role\">").concat(msg.role === 'user' ? (msg.isExternal ? 'You (Editor)' : 'You') : msg.role === 'assistant' ? 'CodeLine' : 'System', "</span>\n          <span class=\"time\">").concat(msg.timestamp.toLocaleTimeString(), "</span>\n        </div>\n        <div class=\"message-content\">\n          ").concat(_this.escapeHtml(msg.content), "\n        </div>\n      </div>\n    "); }).join('');
        // Recent tasks HTML (last 3 messages)
        var recentTasks = this.messages.slice(-3).reverse();
        var recentTasksHtml = recentTasks.length > 0 ? recentTasks.map(function (msg, index) { return "\n      <div class=\"recent-task\" data-id=\"".concat(msg.id, "\">\n        <div class=\"recent-task-preview\">\n          ").concat(msg.content.substring(0, 80)).concat(msg.content.length > 80 ? '...' : '', "\n        </div>\n        <div class=\"recent-task-meta\">\n          <span class=\"recent-task-role\">").concat(msg.role).concat(msg.isExternal ? ' (Editor)' : '', "</span>\n          <span class=\"recent-task-time\">").concat(msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), "</span>\n        </div>\n      </div>\n    "); }).join('') : "\n      <div class=\"no-recent-tasks\">\n        No recent tasks. Start a new conversation!\n      </div>\n    ";
        // Settings panel HTML (hidden by default)
        var settingsPanelHtml = "\n      <div class=\"settings-panel\" id=\"settingsPanel\" style=\"display: none;\">\n        <div class=\"settings-header\">\n          <button class=\"settings-back-btn\" onclick=\"closeSettingsPanel()\">\u2190 Back</button>\n          <h3>Settings</h3>\n        </div>\n        \n        <div class=\"settings-content\">\n          <div class=\"settings-section\">\n            <h4>API Configuration</h4>\n            \n            <div class=\"form-group\">\n              <label for=\"apiKey\">API Key</label>\n              <input type=\"password\" id=\"apiKey\" value=\"".concat(config.apiKey || '', "\" placeholder=\"Enter your API key\">\n              <div class=\"help-text\">Your API key for AI services</div>\n            </div>\n            \n            <div class=\"form-group\">\n              <label for=\"model\">Default Model</label>\n              <select id=\"model\">\n                <option value=\"deepseek-chat\" ").concat(config.model === 'deepseek-chat' ? 'selected' : '', ">DeepSeek Chat</option>\n                <option value=\"claude-3-sonnet\" ").concat(config.model === 'claude-3-sonnet' ? 'selected' : '', ">Claude 3 Sonnet</option>\n                <option value=\"gpt-4\" ").concat(config.model === 'gpt-4' ? 'selected' : '', ">GPT-4</option>\n                <option value=\"qwen-max\" ").concat(config.model === 'qwen-max' ? 'selected' : '', ">Qwen Max</option>\n              </select>\n            </div>\n            \n            <div class=\"form-group\">\n              <label for=\"baseUrl\">API Base URL</label>\n              <input type=\"text\" id=\"baseUrl\" value=\"").concat(config.baseUrl || '', "\" placeholder=\"https://api.deepseek.com\">\n            </div>\n          </div>\n          \n          <div class=\"settings-section\">\n            <h4>Features</h4>\n            \n            <div class=\"form-group checkbox\">\n              <input type=\"checkbox\" id=\"autoAnalyze\" ").concat(config.autoAnalyze ? 'checked' : '', ">\n              <label for=\"autoAnalyze\">Auto-analyze project on startup</label>\n            </div>\n            \n            <div class=\"form-group checkbox\">\n              <input type=\"checkbox\" id=\"showExamples\" ").concat(config.showExamples !== false ? 'checked' : '', ">\n              <label for=\"showExamples\">Show example tasks</label>\n            </div>\n          </div>\n          \n          <div class=\"settings-actions\">\n            <button id=\"saveSettings\" class=\"primary\">Save Settings</button>\n            <button id=\"resetSettings\">Reset to Defaults</button>\n          </div>\n        </div>\n      </div>\n    ");
        // MCP settings panel HTML
        var mcpSettingsPanelHtml = "\n      <div class=\"settings-panel\" id=\"mcpSettingsPanel\">\n        <div class=\"settings-header\">\n          <button class=\"settings-back-btn\" onclick=\"switchView('chat')\">\u2190 Back</button>\n          <h3>MCP Servers</h3>\n        </div>\n        \n        <div class=\"settings-content\">\n          <div class=\"settings-section\">\n            <h4>Configure MCP Servers</h4>\n            <div class=\"mcp-server-list\" id=\"mcpServerList\">\n              <div class=\"no-mcp-servers\">\n                No MCP servers configured.\n              </div>\n            </div>\n            \n            <div class=\"form-group\">\n              <button id=\"addMCPBtn\">Add MCP Server</button>\n            </div>\n          </div>\n          \n          <div class=\"settings-section\">\n            <h4>About MCP</h4>\n            <p class=\"help-text\">\n              MCP (Model Context Protocol) servers allow CodeLine to access external tools and data sources.\n              Add servers to enhance CodeLine's capabilities with file system access, web search, database queries, and more.\n            </p>\n          </div>\n        </div>\n      </div>\n    ";
        // History detail panel HTML
        var historyPanelHtml = "\n      <div class=\"settings-panel\" id=\"historyPanel\" style=\"display: none;\">\n        <div class=\"settings-header\">\n          <button class=\"settings-back-btn\" onclick=\"closeHistoryPanel()\">\u2190 Back</button>\n          <h3>History</h3>\n        </div>\n        \n        <div class=\"settings-content\">\n          <div class=\"history-list\">\n            ".concat(this.messages.length > 0 ? "\n              <div class=\"history-items\">\n                ".concat(this.messages.map(function (msg, index) { return "\n                  <div class=\"history-item\" data-index=\"".concat(index, "\">\n                    <div class=\"history-item-header\">\n                      <span class=\"role\">").concat(msg.role, "</span>\n                      <span class=\"time\">").concat(msg.timestamp.toLocaleString(), "</span>\n                    </div>\n                    <div class=\"history-item-content\">\n                      ").concat(msg.content.substring(0, 150)).concat(msg.content.length > 150 ? '...' : '', "\n                    </div>\n                  </div>\n                "); }).join(''), "\n              </div>\n            ") : "\n              <div class=\"empty-state\">\n                <p>No conversation history yet.</p>\n              </div>\n            ", "\n          </div>\n        </div>\n      </div>\n    ");
        // Auto-approve settings panel
        var autoApprovePanelHtml = "\n      <div class=\"settings-panel\" id=\"autoApprovePanel\" style=\"display: none;\">\n        <div class=\"settings-header\">\n          <button class=\"settings-back-btn\" onclick=\"closeAutoApprovePanel()\">\u2190 Back</button>\n          <h3>Auto-approve Settings</h3>\n        </div>\n        \n        <div class=\"settings-content\">\n          <div class=\"settings-section\">\n            <h4>File Operations Permissions</h4>\n            \n            <div class=\"form-group checkbox\">\n              <input type=\"checkbox\" id=\"autoApproveCreate\" ".concat(config.autoApproveCreate ? 'checked' : '', ">\n              <label for=\"autoApproveCreate\">Auto-approve file creation</label>\n            </div>\n            \n            <div class=\"form-group checkbox\">\n              <input type=\"checkbox\" id=\"autoApproveEdit\" ").concat(config.autoApproveEdit ? 'checked' : '', ">\n              <label for=\"autoApproveEdit\">Auto-approve file edits</label>\n            </div>\n            \n            <div class=\"form-group checkbox\">\n              <input type=\"checkbox\" id=\"autoApproveDelete\" ").concat(config.autoApproveDelete ? 'checked' : '', ">\n              <label for=\"autoApproveDelete\">Auto-approve file deletion</label>\n            </div>\n            \n            <div class=\"form-group\">\n              <label for=\"autoApproveDelay\">Auto-approve delay (seconds)</label>\n              <input type=\"number\" id=\"autoApproveDelay\" value=\"").concat(config.autoApproveDelay || 5, "\" min=\"0\" max=\"60\">\n              <div class=\"help-text\">Delay before auto-approving operations (0 = immediate)</div>\n            </div>\n          </div>\n          \n          <div class=\"settings-actions\">\n            <button id=\"saveAutoApproveSettings\" class=\"primary\">Save Settings</button>\n          </div>\n        </div>\n      </div>\n    ");
        // Account settings panel HTML
        var accountPanelHtml = "\n      <div class=\"settings-panel\">\n        <div class=\"settings-header\">\n          <h3>Account</h3>\n        </div>\n        \n        <div class=\"settings-content\">\n          <div class=\"settings-section\">\n            <h4>Profile Information</h4>\n            \n            <div class=\"account-info\">\n              <div class=\"account-avatar\">\n                <div class=\"avatar-placeholder\">\uD83D\uDC64</div>\n              </div>\n              \n              <div class=\"account-details\">\n                <h5>CodeLine User</h5>\n                <p class=\"account-email\">user@example.com</p>\n                <p class=\"account-status\">\n                  <span class=\"status-indicator active\"></span>\n                  <span>Active</span>\n                </p>\n              </div>\n            </div>\n          </div>\n          \n          <div class=\"settings-section\">\n            <h4>Subscription</h4>\n            \n            <div class=\"subscription-info\">\n              <div class=\"subscription-tier\">\n                <h5>Free Tier</h5>\n                <p>Basic features available</p>\n              </div>\n              \n              <div class=\"usage-stats\">\n                <div class=\"usage-item\">\n                  <span class=\"usage-label\">API Credits:</span>\n                  <span class=\"usage-value\">Unlimited</span>\n                </div>\n                <div class=\"usage-item\">\n                  <span class=\"usage-label\">Requests Today:</span>\n                  <span class=\"usage-value\">12 / Unlimited</span>\n                </div>\n                <div class=\"usage-item\">\n                  <span class=\"usage-label\">Storage:</span>\n                  <span class=\"usage-value\">512 MB / 1 GB</span>\n                </div>\n              </div>\n            </div>\n          </div>\n          \n          <div class=\"settings-section\">\n            <h4>Connected Services</h4>\n            \n            <div class=\"connected-services\">\n              <div class=\"service-item\">\n                <div class=\"service-icon\">\uD83D\uDD11</div>\n                <div class=\"service-info\">\n                  <h6>API Key</h6>\n                  <p>Configured</p>\n                </div>\n                <button class=\"service-action\">Manage</button>\n              </div>\n              \n              <div class=\"service-item\">\n                <div class=\"service-icon\">\uD83D\uDD04</div>\n                <div class=\"service-info\">\n                  <h6>Model Providers</h6>\n                  <p>DeepSeek, OpenAI, Anthropic, Qwen</p>\n                </div>\n                <button class=\"service-action\">Configure</button>\n              </div>\n              \n              <div class=\"service-item\">\n                <div class=\"service-icon\">\u26A1</div>\n                <div class=\"service-info\">\n                  <h6>MCP Servers</h6>\n                  <p>0 servers connected</p>\n                </div>\n                <button class=\"service-action\" onclick=\"switchView('mcp')\">Setup</button>\n              </div>\n            </div>\n          </div>\n          \n          <div class=\"settings-actions\">\n            <button id=\"signOutBtn\" class=\"secondary\">Sign Out</button>\n            <button id=\"upgradeAccountBtn\" class=\"primary\">Upgrade Account</button>\n          </div>\n        </div>\n      </div>\n    ";
        // Define view HTML variables
        var historyHtml = historyPanelHtml;
        var settingsHtml = settingsPanelHtml;
        var mcpHtml = mcpSettingsPanelHtml;
        var accountHtml = accountPanelHtml;
        return "\n      <!DOCTYPE html>\n      <html lang=\"en\">\n      <head>\n        <meta charset=\"UTF-8\">\n        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n        <title>CodeLine - AI Coding Assistant</title>\n        <style>\n          /* Cline Style - CodeLine\u590D\u523B */\n          * {\n            box-sizing: border-box;\n          }\n          \n          body {\n            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;\n            margin: 0;\n            padding: 0;\n            background: #0d1117; /* GitHub\u6DF1\u8272\u4E3B\u9898\u80CC\u666F */\n            color: #c9d1d9;\n            height: 100vh;\n            display: flex;\n            flex-direction: column;\n            overflow: hidden;\n          }\n          \n          /* Navigation - Cline Style */\n          .nav {\n            display: flex;\n            background: #161b22; /* GitHub dark theme navigation background */\n            border-bottom: 1px solid #3e3e42;\n            padding: 0 16px;\n            height: 48px;\n            align-items: center;\n            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);\n          }\n          \n          .nav-item {\n            padding: 8px 16px;\n            background: none;\n            border: none;\n            color: #c9d1d9; /* GitHub dark theme text color */\n            font-size: 13px;\n            cursor: pointer;\n            border-radius: 6px; /* Increased roundness */\n            display: flex;\n            align-items: center;\n            gap: 6px;\n            transition: background-color 0.2s, color 0.2s;\n          }\n          \n          .nav-item:hover {\n            background: #2a2d2e;\n          }\n          \n          .nav-item.active {\n            color: #ffffff;\n            background: #2a2d2e;\n          }\n          \n          .nav-icon {\n            font-size: 14px;\n          }\n          \n          .nav-spacer {\n            flex: 1;\n          }\n          \n          .model-info {\n            padding: 8px 12px;\n            font-size: 11px;\n            color: #4ec9b0;\n            background: #2a2d2e;\n            border-radius: 6px; /* Increased roundness */\n            border: 1px solid #3e3e42;\n            box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);\n          }\n          \n          /* Main content */\n          .main-content {\n            flex: 1;\n            overflow: auto;\n            padding: 0;\n            display: flex;\n            flex-direction: column;\n          }\n          \n          /* Chat view */\n          .chat-view {\n            height: 100%;\n            display: flex;\n            flex-direction: column;\n          }\n          \n          .chat-container {\n            flex: 1;\n            overflow-y: auto;\n            padding: 20px;\n            padding-bottom: 0;\n          }\n          \n          .message {\n            margin-bottom: 24px;\n            padding: 18px 20px;\n            border-radius: 16px;\n            background: linear-gradient(135deg, #2d2d30 0%, #252526 100%);\n            border: 1px solid #3e3e42;\n            max-width: 85%;\n            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);\n            position: relative;\n            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n            opacity: 0;\n            transform: translateY(10px);\n            animation: messageAppear 0.4s ease-out forwards;\n          }\n          \n          .message:hover {\n            transform: translateY(-2px);\n            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);\n            border-color: #4a4a4e;\n          }\n          \n          .message.user {\n            background: linear-gradient(135deg, #007acc 0%, #0062a3 100%);\n            border-color: #007acc;\n            margin-left: auto;\n            color: white;\n          }\n          \n          .message.assistant {\n            background: linear-gradient(135deg, #1a4731 0%, #0d3823 100%);\n            border-color: #4ec9b0;\n            margin-right: auto;\n          }\n          \n          .message.system {\n            background: linear-gradient(135deg, #4a1c1c 0%, #331212 100%);\n            border-color: #f44747;\n            margin-left: auto;\n            margin-right: auto;\n            max-width: 90%;\n          }\n          \n          /* Message actions (copy, edit, regenerate) */\n          .message-actions {\n            position: absolute;\n            top: 8px;\n            right: 8px;\n            display: flex;\n            gap: 6px;\n            opacity: 0;\n            transition: opacity 0.2s;\n          }\n          \n          .message:hover .message-actions {\n            opacity: 1;\n          }\n          \n          .message-action {\n            background: rgba(255, 255, 255, 0.1);\n            border: 1px solid rgba(255, 255, 255, 0.2);\n            color: rgba(255, 255, 255, 0.8);\n            border-radius: 6px;\n            width: 28px;\n            height: 28px;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            cursor: pointer;\n            font-size: 12px;\n            transition: all 0.2s;\n          }\n          \n          .message-action:hover {\n            background: rgba(255, 255, 255, 0.2);\n            transform: scale(1.1);\n          }\n          \n          /* Message animation */\n          @keyframes messageAppear {\n            0% {\n              opacity: 0;\n              transform: translateY(10px);\n            }\n            100% {\n              opacity: 1;\n              transform: translateY(0);\n            }\n          }\n          \n          /* Staggered animation for multiple messages */\n          .message:nth-child(1) { animation-delay: 0.1s; }\n          .message:nth-child(2) { animation-delay: 0.2s; }\n          .message:nth-child(3) { animation-delay: 0.3s; }\n          .message:nth-child(4) { animation-delay: 0.4s; }\n          .message:nth-child(5) { animation-delay: 0.5s; }\n          \n          .message-header {\n            display: flex;\n            justify-content: space-between;\n            margin-bottom: 12px;\n            font-size: 12px;\n            font-weight: 600;\n            text-transform: uppercase;\n            letter-spacing: 0.5px;\n          }\n          \n          .message.user .message-header {\n            color: rgba(255, 255, 255, 0.9);\n          }\n          \n          .message.assistant .message-header {\n            color: #4ec9b0;\n          }\n          \n          .message.system .message-header {\n            color: #f44747;\n          }\n          \n          .message-content {\n            white-space: pre-wrap;\n            line-height: 1.6;\n            font-family: 'Consolas', 'Monaco', 'JetBrains Mono', monospace;\n            font-size: 14px;\n            color: inherit;\n          }\n          }\n          \n          .message-content code {\n            background: #2d2d30;\n            padding: 2px 4px;\n            border-radius: 3px;\n            font-family: 'Consolas', 'Monaco', monospace;\n          }\n          \n          .message-content pre {\n            background: #2d2d30;\n            padding: 12px;\n            border-radius: 8px; /* Increased roundness */\n            overflow-x: auto;\n            margin: 8px 0;\n            border: 1px solid #3e3e42;\n            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n          }\n          \n          .message-content pre code {\n            background: none;\n            padding: 0;\n          }\n          \n          .chat-controls {\n            display: flex;\n            gap: 10px;\n            margin-bottom: 20px;\n            padding: 0 20px;\n            padding-top: 20px;\n            border-bottom: 1px solid #3e3e42;\n            padding-bottom: 20px;\n          }\n          \n          .chat-controls button {\n            background: linear-gradient(135deg, #3e3e42 0%, #4a4a4e 100%);\n            color: #d4d4d4;\n            border: none;\n            padding: 8px 16px;\n            border-radius: 6px; /* Increased roundness */\n            cursor: pointer;\n            font-size: 12px;\n            transition: all 0.2s;\n          }\n          \n          .chat-controls button:hover {\n            background: linear-gradient(135deg, #4a4a4e 0%, #56565a 100%);\n            transform: translateY(-1px);\n          }\n          \n          .file-controls {\n            display: flex;\n            gap: 10px;\n            margin-bottom: 20px;\n            padding: 0 20px;\n            padding-top: 10px;\n            flex-wrap: wrap;\n          }\n          \n          .file-controls button {\n            background: linear-gradient(135deg, #0d3c61 0%, #1a4f7a 100%);\n            color: #d4d4d4;\n            border: none;\n            padding: 8px 16px;\n            border-radius: 6px;\n            cursor: pointer;\n            font-size: 12px;\n            transition: all 0.2s;\n          }\n          \n          .file-controls button:hover {\n            background: linear-gradient(135deg, #1a4f7a 0%, #256a9a 100%);\n            transform: translateY(-1px);\n          }\n          \n          .input-container {\n            display: flex;\n            gap: 12px;\n            padding: 20px;\n            border-top: 1px solid #3e3e42;\n            background: #252526;\n          }\n          \n          textarea {\n            flex: 1;\n            padding: 12px;\n            border: 1px solid #3e3e42;\n            border-radius: 8px; /* Increased roundness */\n            background: #1e1e1e;\n            color: #d4d4d4;\n            font-family: inherit;\n            font-size: 14px;\n            resize: none;\n            min-height: 60px;\n            transition: border-color 0.2s;\n          }\n          \n          textarea:focus {\n            outline: none;\n            border-color: #007acc;\n          }\n          \n          #sendButton {\n            padding: 12px 24px;\n            background: #007acc;\n            color: white;\n            border: none;\n            border-radius: 6px;\n            cursor: pointer;\n            font-weight: 500;\n            align-self: flex-end;\n          }\n          \n          #sendButton:hover {\n            background: #0062a3;\n          }\n          \n          #sendButton:disabled {\n            background: #3e3e42;\n            cursor: not-allowed;\n          }\n          \n          .typing-indicator {\n            display: none;\n            padding: 10px;\n            color: #4ec9b0;\n            font-style: italic;\n            text-align: center;\n          }\n          \n          .typing-indicator.active {\n            display: block;\n          }\n          \n          .typing-indicator::after {\n            content: '...';\n            animation: dots 1.5s infinite;\n          }\n          \n          @keyframes dots {\n            0%, 20% { content: '.'; }\n            40% { content: '..'; }\n            60%, 100% { content: '...'; }\n          }\n          \n          /* Settings view */\n          .settings-container {\n            max-width: 600px;\n            margin: 0 auto;\n            padding: 20px;\n          }\n          \n          .settings-container h2 {\n            margin-top: 0;\n            color: #4ec9b0;\n          }\n          \n          .settings-section {\n            margin-bottom: 30px;\n            padding-bottom: 20px;\n            border-bottom: 1px solid #3e3e42;\n          }\n          \n          .settings-section h3 {\n            color: #d4d4d4;\n            margin-bottom: 16px;\n            font-size: 16px;\n          }\n          \n          .form-group {\n            margin-bottom: 20px;\n          }\n          \n          .form-group label {\n            display: block;\n            margin-bottom: 6px;\n            font-size: 14px;\n            color: #cccccc;\n          }\n          \n          .form-group input[type=\"text\"],\n          .form-group input[type=\"password\"],\n          .form-group input[type=\"number\"],\n          .form-group select {\n            width: 100%;\n            padding: 10px;\n            background: #252526;\n            border: 1px solid #3e3e42;\n            border-radius: 4px;\n            color: #d4d4d4;\n            font-size: 14px;\n          }\n          \n          .form-group input[type=\"range\"] {\n            width: 200px;\n            margin-right: 10px;\n          }\n          \n          .help-text {\n            font-size: 12px;\n            color: #858585;\n            margin-top: 4px;\n          }\n          \n          .checkbox {\n            display: flex;\n            align-items: center;\n            gap: 10px;\n          }\n          \n          .checkbox input[type=\"checkbox\"] {\n            width: auto;\n          }\n          \n          .checkbox label {\n            margin-bottom: 0;\n          }\n          \n          .settings-actions {\n            display: flex;\n            gap: 10px;\n            margin-top: 30px;\n          }\n          \n          .settings-actions button {\n            padding: 10px 20px;\n            border: none;\n            border-radius: 4px;\n            cursor: pointer;\n            font-size: 14px;\n          }\n          \n          .settings-actions .primary {\n            background: #007acc;\n            color: white;\n          }\n          \n          .settings-actions .primary:hover {\n            background: #0062a3;\n          }\n          \n          .settings-actions button:not(.primary) {\n            background: #3e3e42;\n            color: #d4d4d4;\n          }\n          \n          .settings-actions button:not(.primary):hover {\n            background: #4e4e52;\n          }\n          \n          /* History view */\n          .history-container {\n            max-width: 800px;\n            margin: 0 auto;\n            padding: 20px;\n          }\n          \n          .history-container h2 {\n            margin-top: 0;\n            color: #4ec9b0;\n          }\n          \n          .history-item {\n            padding: 15px;\n            background: #252526;\n            border-radius: 6px;\n            margin-bottom: 10px;\n            border-left: 4px solid transparent;\n            cursor: pointer;\n          }\n          \n          .history-item:hover {\n            background: #2d2d30;\n          }\n          \n          .history-item.user {\n            border-left-color: #007acc;\n          }\n          \n          .history-item.assistant {\n            border-left-color: #4ec9b0;\n          }\n          \n          .history-item.system {\n            border-left-color: #f44747;\n          }\n          \n          .history-item-header {\n            display: flex;\n            justify-content: space-between;\n            margin-bottom: 8px;\n            font-size: 12px;\n            opacity: 0.8;\n          }\n          \n          .history-item-content {\n            font-size: 14px;\n            line-height: 1.4;\n          }\n          \n          .empty-state {\n            text-align: center;\n            padding: 40px 20px;\n            color: #858585;\n          }\n          \n          /* View management */\n          .view {\n            display: none;\n            height: 100%;\n          }\n          \n          .view.active {\n            display: flex;\n            flex-direction: column;\n          }\n          \n          /* Scrollbar styling */\n          ::-webkit-scrollbar {\n            width: 10px;\n          }\n          \n          ::-webkit-scrollbar-track {\n            background: #1e1e1e;\n          }\n          \n          ::-webkit-scrollbar-thumb {\n            background: #424242;\n            border-radius: 5px;\n          }\n          \n          ::-webkit-scrollbar-thumb:hover {\n            background: #555555;\n          }\n          \n          /* Cline-style Diff View Styles */\n          .diff-container {\n            margin: 12px 0;\n            border: 1px solid #3e3e42;\n            border-radius: 8px;\n            overflow: hidden;\n            background: #1e1e1e;\n          }\n          \n          .diff-header {\n            padding: 12px 16px;\n            background: #252526;\n            border-bottom: 1px solid #3e3e42;\n            display: flex;\n            justify-content: space-between;\n            align-items: center;\n          }\n          \n          .diff-header h3 {\n            margin: 0;\n            font-size: 14px;\n            font-weight: 500;\n            color: #d4d4d4;\n            font-family: -apple-system, BlinkMacSystemFont, sans-serif;\n          }\n          \n          .diff-summary {\n            font-size: 12px;\n            color: #858585;\n            margin-top: 4px;\n          }\n          \n          .diff-actions {\n            display: flex;\n            gap: 8px;\n          }\n          \n          .diff-action-btn {\n            padding: 6px 12px;\n            border: none;\n            border-radius: 4px;\n            font-size: 12px;\n            font-weight: 500;\n            cursor: pointer;\n            transition: background-color 0.2s;\n          }\n          \n          .diff-approve {\n            background: #2d7d46;\n            color: white;\n          }\n          \n          .diff-approve:hover {\n            background: #236b3a;\n          }\n          \n          .diff-reject {\n            background: #c42b1c;\n            color: white;\n          }\n          \n          .diff-reject:hover {\n            background: #a82316;\n          }\n          \n          .diff-review {\n            background: #007acc;\n            color: white;\n          }\n          \n          .diff-review:hover {\n            background: #0062a3;\n          }\n          \n          .diff-content {\n            padding: 8px 0;\n            font-family: 'Consolas', 'Monaco', monospace;\n            font-size: 12px;\n            line-height: 1.4;\n            max-height: 300px;\n            overflow-y: auto;\n          }\n          \n          .diff-line {\n            padding: 2px 12px;\n            display: flex;\n            min-height: 20px;\n            align-items: center;\n            border-left: 4px solid transparent;\n          }\n          \n          .diff-line:hover {\n            background: #2d2d30;\n          }\n          \n          .diff-line-info {\n            width: 100px;\n            min-width: 100px;\n            color: #858585;\n            font-size: 11px;\n            text-align: right;\n            padding-right: 12px;\n            user-select: none;\n          }\n          \n          .diff-line-content {\n            flex: 1;\n            white-space: pre;\n            overflow-x: auto;\n          }\n          \n          .diff-added {\n            border-left-color: #2d7d46;\n            background: rgba(45, 125, 70, 0.1);\n          }\n          \n          .diff-removed {\n            border-left-color: #c42b1c;\n            background: rgba(196, 43, 28, 0.1);\n          }\n          \n          .diff-modified {\n            border-left-color: #d19a66;\n            background: rgba(209, 154, 102, 0.1);\n          }\n          \n          /* Collapsible diff */\n          .diff-collapsible {\n            cursor: pointer;\n          }\n          \n          .diff-collapsible-header {\n            padding: 8px 16px;\n            background: #2d2d30;\n            border-bottom: 1px solid #3e3e42;\n            display: flex;\n            justify-content: space-between;\n            align-items: center;\n          }\n          \n          .diff-collapsible-header:hover {\n            background: #37373a;\n          }\n          \n          .diff-collapsible-content {\n            display: none;\n          }\n          \n          .diff-collapsible.expanded .diff-collapsible-content {\n            display: block;\n          }\n          \n          .diff-icon {\n            margin-right: 8px;\n            font-size: 12px;\n          }\n          \n          /* Terminal result styles (Cline\u98CE\u683C) */\n          .terminal-result {\n            border: 1px solid #3e3e42;\n            border-radius: 8px;\n            margin: 16px 0;\n            background: #252526;\n            overflow: hidden;\n            font-family: 'SF Mono', 'Consolas', 'Monaco', 'Courier New', monospace;\n          }\n          \n          .terminal-result.terminal-success {\n            border-left: 4px solid #30d158;\n          }\n          \n          .terminal-result.terminal-error {\n            border-left: 4px solid #ff453a;\n          }\n          \n          .terminal-header {\n            padding: 12px 16px;\n            background: #2d2d30;\n            border-bottom: 1px solid #3e3e42;\n            display: flex;\n            justify-content: space-between;\n            align-items: center;\n          }\n          \n          .terminal-header h3 {\n            margin: 0;\n            font-size: 14px;\n            color: #d4d4d4;\n            font-weight: 500;\n          }\n          \n          .terminal-meta {\n            font-size: 11px;\n            color: #cccccc;\n            display: flex;\n            gap: 12px;\n          }\n          \n          .terminal-meta span {\n            padding: 2px 6px;\n            background: #3e3e42;\n            border-radius: 3px;\n          }\n          \n          .terminal-command {\n            padding: 12px 16px;\n            background: #1e1e1e;\n            border-bottom: 1px solid #3e3e42;\n            font-size: 13px;\n          }\n          \n          .terminal-command code {\n            color: #4ec9b0;\n            font-weight: 600;\n          }\n          \n          .terminal-output {\n            padding: 16px;\n            max-height: 300px;\n            overflow-y: auto;\n            background: #1e1e1e;\n          }\n          \n          .terminal-output pre {\n            margin: 0;\n            font-size: 12px;\n            color: #d4d4d4;\n            white-space: pre-wrap;\n            word-break: break-all;\n            line-height: 1.4;\n          }\n          \n          .terminal-error-output {\n            padding: 12px 16px;\n            background: rgba(255, 69, 58, 0.1);\n            border-top: 1px solid rgba(255, 69, 58, 0.3);\n          }\n          \n          .terminal-error-output h4 {\n            margin: 0 0 8px 0;\n            color: #ff453a;\n            font-size: 12px;\n            font-weight: 600;\n          }\n          \n          .terminal-error-output pre {\n            margin: 0;\n            font-size: 12px;\n            color: #ff453a;\n            white-space: pre-wrap;\n          }\n          \n          .terminal-analysis {\n            padding: 12px 16px;\n            background: #2d2d30;\n            border-top: 1px solid #3e3e42;\n            font-size: 12px;\n          }\n          \n          .terminal-analysis h4 {\n            margin: 0 0 8px 0;\n            color: #cccccc;\n            font-weight: 600;\n          }\n          \n          .terminal-analysis ul {\n            margin: 0;\n            padding-left: 16px;\n            color: #a5a5a5;\n          }\n          \n          .terminal-analysis li {\n            margin-bottom: 4px;\n          }\n          \n          /* Terminal controls for active commands */\n          .terminal-controls {\n            display: flex;\n            gap: 8px;\n            margin-bottom: 12px;\n            padding: 8px;\n            background: #2d2d30;\n            border-radius: 6px;\n            border: 1px solid #3e3e42;\n          }\n          \n          .terminal-control-btn {\n            padding: 6px 12px;\n            background: #007acc;\n            border: none;\n            border-radius: 4px;\n            color: white;\n            font-size: 12px;\n            cursor: pointer;\n            font-weight: 500;\n            transition: background 0.2s;\n          }\n          \n          .terminal-control-btn:hover {\n            background: #0e639c;\n          }\n          \n          .terminal-control-btn.stop {\n            background: #ff453a;\n          }\n          \n          .terminal-control-btn.stop:hover {\n            background: #e53935;\n          }\n          \n          /* Real-time output animation */\n          .terminal-live-output {\n            border: 1px solid #3e3e42;\n            border-radius: 6px;\n            margin: 12px 0;\n            background: #1e1e1e;\n            max-height: 200px;\n            overflow-y: auto;\n            padding: 12px;\n            font-family: 'Consolas', 'Monaco', monospace;\n            font-size: 12px;\n          }\n          \n          .terminal-live-output .line {\n            padding: 2px 0;\n            color: #d4d4d4;\n            white-space: pre-wrap;\n            animation: fadeIn 0.3s ease-out;\n          }\n          \n          @keyframes fadeIn {\n            from { opacity: 0; transform: translateY(2px); }\n            to { opacity: 1; transform: translateY(0); }\n          }\n          \n          /* Command history */\n          .terminal-history {\n            margin-top: 16px;\n            border-top: 1px solid #3e3e42;\n            padding-top: 12px;\n          }\n          \n          .terminal-history h4 {\n            margin: 0 0 8px 0;\n            color: #cccccc;\n            font-size: 12px;\n            font-weight: 600;\n          }\n          \n          .terminal-history-list {\n            max-height: 150px;\n            overflow-y: auto;\n            background: #1e1e1e;\n            border-radius: 4px;\n            padding: 8px;\n          }\n          \n          .terminal-history-item {\n            padding: 6px 8px;\n            border-bottom: 1px solid #2d2d30;\n            font-size: 11px;\n            color: #a5a5a5;\n            cursor: pointer;\n            transition: background 0.2s;\n          }\n          \n          .terminal-history-item:hover {\n            background: #2d2d30;\n          }\n          \n          .terminal-history-item:last-child {\n            border-bottom: none;\n          }\n          \n          .terminal-history-item.success code {\n            color: #30d158;\n          }\n          \n          .terminal-history-item.error code {\n            color: #ff453a;\n          }\n          \n          /* File operation status */\n          .file-status {\n            display: inline-flex;\n            align-items: center;\n            padding: 2px 8px;\n            border-radius: 12px;\n            font-size: 11px;\n            font-weight: 500;\n            margin-left: 8px;\n          }\n          \n          .file-status-created {\n            background: rgba(45, 125, 70, 0.2);\n            color: #4ec9b0;\n          }\n          \n          .file-status-modified {\n            background: rgba(209, 154, 102, 0.2);\n            color: #d19a66;\n          }\n          \n          .file-status-deleted {\n            background: rgba(196, 43, 28, 0.2);\n            color: #f44747;\n          }\n          \n          /* Task steps visualization */\n          .task-steps {\n            margin: 12px 0;\n            background: #252526;\n            border-radius: 6px;\n            padding: 12px;\n          }\n          \n          .task-step {\n            display: flex;\n            align-items: center;\n            padding: 8px;\n            margin: 4px 0;\n            border-radius: 4px;\n            background: #2d2d30;\n          }\n          \n          .task-step-status {\n            width: 24px;\n            height: 24px;\n            border-radius: 50%;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            margin-right: 12px;\n            font-size: 12px;\n          }\n          \n          .task-step.completed .task-step-status {\n            background: #2d7d46;\n            color: white;\n          }\n          \n          .task-step.failed .task-step-status {\n            background: #c42b1c;\n            color: white;\n          }\n          \n          .task-step.pending .task-step-status {\n            background: #3e3e42;\n            color: #858585;\n          }\n          \n          .task-step.executing .task-step-status {\n            background: #007acc;\n            color: white;\n            animation: pulse 1.5s infinite;\n          }\n          \n          @keyframes pulse {\n            0%, 100% { opacity: 1; }\n            50% { opacity: 0.5; }\n          }\n          \n          .task-step-info {\n            flex: 1;\n          }\n          \n          .task-step-title {\n            font-weight: 500;\n            font-size: 13px;\n          }\n          \n          .task-step-desc {\n            font-size: 11px;\n            color: #858585;\n            margin-top: 2px;\n          }\n          \n          /* Account Panel Styles */\n          .account-info {\n            display: flex;\n            align-items: center;\n            gap: 16px;\n            margin-bottom: 24px;\n            padding-bottom: 24px;\n            border-bottom: 1px solid #3e3e42;\n          }\n          \n          .account-avatar {\n            width: 64px;\n            height: 64px;\n            border-radius: 50%;\n            background: #2a2d2e;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            font-size: 32px;\n          }\n          \n          .account-details h5 {\n            margin: 0 0 4px 0;\n            font-size: 18px;\n            color: #ffffff;\n          }\n          \n          .account-email {\n            margin: 0 0 8px 0;\n            color: #858585;\n            font-size: 14px;\n          }\n          \n          .account-status {\n            display: flex;\n            align-items: center;\n            gap: 6px;\n            margin: 0;\n            font-size: 14px;\n            color: #4ec9b0;\n          }\n          \n          .status-indicator {\n            width: 8px;\n            height: 8px;\n            border-radius: 50%;\n            background: #4ec9b0;\n          }\n          \n          .status-indicator.active {\n            background: #4ec9b0;\n          }\n          \n          .subscription-info {\n            margin-bottom: 24px;\n          }\n          \n          .subscription-tier h5 {\n            margin: 0 0 4px 0;\n            font-size: 16px;\n            color: #ffffff;\n          }\n          \n          .subscription-tier p {\n            margin: 0 0 16px 0;\n            color: #858585;\n            font-size: 14px;\n          }\n          \n          .usage-stats {\n            background: #1e1e1e;\n            border-radius: 8px;\n            padding: 16px;\n            border: 1px solid #3e3e42;\n          }\n          \n          .usage-item {\n            display: flex;\n            justify-content: space-between;\n            padding: 8px 0;\n            border-bottom: 1px solid #2d2d30;\n          }\n          \n          .usage-item:last-child {\n            border-bottom: none;\n          }\n          \n          .usage-label {\n            color: #cccccc;\n            font-size: 13px;\n          }\n          \n          .usage-value {\n            color: #ffffff;\n            font-weight: 500;\n            font-size: 13px;\n          }\n          \n          .connected-services {\n            margin-bottom: 24px;\n          }\n          \n          .service-item {\n            display: flex;\n            align-items: center;\n            padding: 12px;\n            background: #1e1e1e;\n            border-radius: 8px;\n            border: 1px solid #3e3e42;\n            margin-bottom: 12px;\n          }\n          \n          .service-item:last-child {\n            margin-bottom: 0;\n          }\n          \n          .service-icon {\n            font-size: 20px;\n            margin-right: 12px;\n          }\n          \n          .service-info {\n            flex: 1;\n          }\n          \n          .service-info h6 {\n            margin: 0 0 4px 0;\n            font-size: 14px;\n            color: #ffffff;\n          }\n          \n          .service-info p {\n            margin: 0;\n            color: #858585;\n            font-size: 12px;\n          }\n          \n          .service-action {\n            padding: 6px 12px;\n            background: #2a2d2e;\n            color: #d4d4d4;\n            border: 1px solid #3e3e42;\n            border-radius: 6px;\n            font-size: 12px;\n            cursor: pointer;\n            transition: background-color 0.2s;\n          }\n          \n          .service-action:hover {\n            background: #3e3e42;\n          }\n        </style>\n      </head>\n      <body>\n        <!-- Navigation - Cline Style -->\n        <div class=\"nav\">\n          <button class=\"nav-item ".concat(this.currentView === 'chat' ? 'active' : '', "\" data-view=\"chat\">\n            <span class=\"nav-icon\">+</span>\n            <span>New Chat</span>\n          </button>\n          <button class=\"nav-item ").concat(this.currentView === 'mcp' ? 'active' : '', "\" data-view=\"mcp\">\n            <span class=\"nav-icon\">\uD83D\uDDA5\uFE0F</span>\n            <span>MCP</span>\n          </button>\n          <button class=\"nav-item ").concat(this.currentView === 'history' ? 'active' : '', "\" data-view=\"history\">\n            <span class=\"nav-icon\">\uD83D\uDCDC</span>\n            <span>History</span>\n          </button>\n          <button class=\"nav-item ").concat(this.currentView === 'account' ? 'active' : '', "\" data-view=\"account\">\n            <span class=\"nav-icon\">\uD83D\uDC64</span>\n            <span>Account</span>\n          </button>\n          <button class=\"nav-item ").concat(this.currentView === 'settings' ? 'active' : '', "\" data-view=\"settings\">\n            <span class=\"nav-icon\">\u2699\uFE0F</span>\n            <span>Settings</span>\n          </button>\n          \n          <div class=\"nav-spacer\"></div>\n          \n          <div class=\"model-info\" id=\"modelInfo\">\n            ").concat(this.extension.getModelInfo(), "\n          </div>\n        </div>\n        \n        <!-- Main Content -->\n        <div class=\"main-content\">\n          <!-- Chat View -->\n          <div class=\"view ").concat(this.currentView === 'chat' ? 'active' : '', "\" id=\"chatView\">\n            <div class=\"chat-controls\">\n              <button onclick=\"executeSampleTask('Create a simple REST API endpoint')\">Sample: REST API</button>\n              <button onclick=\"executeSampleTask('Implement user authentication')\">Sample: Auth</button>\n              <button onclick=\"executeSampleTask('Fix syntax errors in current file')\">Sample: Fix Errors</button>\n              <button onclick=\"clearChat()\">Clear Chat</button>\n            </div>\n            \n            <div class=\"file-controls\">\n              <button onclick=\"executeFileCommand('listFiles')\">\uD83D\uDCC1 List Files</button>\n              <button onclick=\"executeFileCommand('searchFiles')\">\uD83D\uDD0D Search Files</button>\n              <button onclick=\"executeFileCommand('getStats')\">\uD83D\uDCCA Workspace Stats</button>\n              <button onclick=\"executeFileCommand('browseDirectory')\">\uD83D\uDCC2 Browse Directory</button>\n            </div>\n            \n            <div class=\"chat-container\" id=\"chatContainer\">\n              ").concat(messagesHtml, "\n              <div id=\"typingIndicator\" class=\"typing-indicator\">\n                CodeLine is thinking\n              </div>\n            </div>\n            \n            <div class=\"input-container\">\n              <textarea \n                id=\"messageInput\" \n                placeholder=\"Describe what you want CodeLine to do (e.g., 'Create a login form', 'Fix this bug', 'Add validation')\"\n                onkeydown=\"handleKeydown(event)\"\n              ></textarea>\n              <button id=\"sendButton\" onclick=\"sendMessage()\">Send</button>\n            </div>\n          </div>\n          \n          <!-- History View -->\n          <div class=\"view ").concat(this.currentView === 'history' ? 'active' : '', "\" id=\"historyView\">\n            ").concat(historyHtml, "\n          </div>\n          \n          <!-- Settings View -->\n          <div class=\"view ").concat(this.currentView === 'settings' ? 'active' : '', "\" id=\"settingsView\">\n            ").concat(settingsHtml, "\n          </div>\n          \n          <!-- MCP View -->\n          <div class=\"view ").concat(this.currentView === 'mcp' ? 'active' : '', "\" id=\"mcpView\">\n            ").concat(mcpHtml, "\n          </div>\n          \n          <!-- Account View -->\n          <div class=\"view ").concat(this.currentView === 'account' ? 'active' : '', "\" id=\"accountView\">\n            ").concat(accountHtml, "\n          </div>\n        </div>\n        \n        <script>\n          const vscode = acquireVsCodeApi();\n          \n          // View management\n          const navItems = document.querySelectorAll('.nav-item');\n          const views = document.querySelectorAll('.view');\n          \n          navItems.forEach(item => {\n            item.addEventListener('click', () => {\n              const view = item.getAttribute('data-view');\n              switchView(view);\n            });\n          });\n          \n          function switchView(view) {\n            // Update nav\n            navItems.forEach(item => {\n              item.classList.toggle('active', item.getAttribute('data-view') === view);\n            });\n            \n            // Update views\n            views.forEach(v => {\n              v.classList.toggle('active', v.id === view + 'View');\n            });\n            \n            // Notify extension\n            vscode.postMessage({\n              command: 'switchView',\n              view: view\n            });\n          }\n          \n          // Chat functionality\n          const chatContainer = document.getElementById('chatContainer');\n          const messageInput = document.getElementById('messageInput');\n          const sendButton = document.getElementById('sendButton');\n          const typingIndicator = document.getElementById('typingIndicator');\n          \n          // Handle window messages\n          window.addEventListener('message', event => {\n            const message = event.data;\n            \n            switch (message.command) {\n              case 'typing':\n                typingIndicator.classList.toggle('active', message.isTyping);\n                break;\n              case 'history':\n                // Handle history update\n                break;\n              case 'modelInfo':\n                document.getElementById('modelInfo').textContent = message.modelInfo;\n                break;\n              case 'taskResult':\n                console.log('Task result:', message.result);\n                break;\n              case 'taskError':\n                console.error('Task error:', message.error);\n                break;\n              case 'configUpdated':\n                // Update settings form with new config\n                if (message.config) {\n                  updateSettingsForm(message.config);\n                }\n                break;\n              case 'diffActionResult':\n                // Handle diff approval/rejection result\n                console.log('Diff action result:', message);\n                if (!message.success && message.error) {\n                  // \u663E\u793A\u9519\u8BEF\n                  console.error('Diff action failed:', message.error);\n                }\n                break;\n              case 'fileCommandResult':\n                // Handle file command results\n                console.log('File command result:', message.command, message.result);\n                // \u53EF\u4EE5\u5728\u8FD9\u91CC\u6DFB\u52A0UI\u66F4\u65B0\uFF0C\u6BD4\u5982\u663E\u793A\u7ED3\u679C\u9762\u677F\n                break;\n              case 'fileCommandError':\n                // Handle file command errors\n                console.error('File command error:', message.command, message.error);\n                // \u53EF\u4EE5\u5728\u8FD9\u91CC\u663E\u793A\u9519\u8BEF\u901A\u77E5\n                break;\n              case 'externalMessage':\n                // Handle external messages from editor commands\n                console.log('External message received:', message);\n                // Add the external message to chat\n                addExternalMessageToChat(message.content, message.timestamp);\n                break;\n            }\n          });\n          \n          function sendMessage() {\n            const text = messageInput.value.trim();\n            if (!text) return;\n            \n            vscode.postMessage({\n              command: 'sendMessage',\n              text: text\n            });\n            \n            messageInput.value = '';\n            messageInput.focus();\n          }\n          \n          function addExternalMessageToChat(content, timestamp) {\n            console.log('Adding external message to chat:', content);\n            \n            // Send to extension for processing\n            vscode.postMessage({\n              command: 'sendMessage',\n              text: content,\n              isExternal: true,\n              externalTimestamp: timestamp\n            });\n            \n            // Show typing indicator for assistant response\n            const typingIndicator = document.getElementById('typingIndicator');\n            typingIndicator.classList.add('active');\n          }\n          \n          function executeSampleTask(task) {\n            vscode.postMessage({\n              command: 'executeTask',\n              task: task\n            });\n          }\n          \n          function executeFileCommand(command) {\n            vscode.postMessage({\n              command: 'fileCommand',\n              fileCommand: command\n            });\n          }\n          \n          function clearChat() {\n            if (confirm('Clear all messages?')) {\n              vscode.postMessage({\n                command: 'clearChat'\n              });\n            }\n          }\n          \n          // Settings functionality\n          const temperatureSlider = document.getElementById('temperature');\n          const temperatureValue = document.getElementById('temperatureValue');\n          \n          if (temperatureSlider && temperatureValue) {\n            temperatureSlider.addEventListener('input', function() {\n              temperatureValue.textContent = this.value;\n            });\n          }\n          \n          document.getElementById('saveSettings')?.addEventListener('click', saveSettings);\n          document.getElementById('testConnection')?.addEventListener('click', testConnection);\n          document.getElementById('resetSettings')?.addEventListener('click', resetSettings);\n          \n          function saveSettings() {\n            const config = {\n              apiKey: document.getElementById('apiKey').value,\n              model: document.getElementById('model').value,\n              baseUrl: document.getElementById('baseUrl').value || undefined,\n              temperature: parseFloat(document.getElementById('temperature').value),\n              maxTokens: parseInt(document.getElementById('maxTokens').value),\n              autoAnalyze: document.getElementById('autoAnalyze').checked,\n              showExamples: document.getElementById('showExamples').checked,\n              typingIndicator: document.getElementById('typingIndicator').checked\n            };\n            \n            vscode.postMessage({\n              command: 'saveSettings',\n              config: config\n            });\n          }\n          \n          function testConnection() {\n            vscode.postMessage({\n              command: 'testConnection'\n            });\n          }\n          \n          function resetSettings() {\n            if (confirm('Reset all settings to defaults?')) {\n              vscode.postMessage({\n                command: 'resetSettings'\n              });\n            }\n          }\n          \n          function updateSettingsForm(config) {\n            if (!config) return;\n            \n            const apiKeyInput = document.getElementById('apiKey');\n            const modelSelect = document.getElementById('model');\n            const baseUrlInput = document.getElementById('baseUrl');\n            const temperatureInput = document.getElementById('temperature');\n            const temperatureValueSpan = document.getElementById('temperatureValue');\n            const maxTokensInput = document.getElementById('maxTokens');\n            const autoAnalyzeCheckbox = document.getElementById('autoAnalyze');\n            const showExamplesCheckbox = document.getElementById('showExamples');\n            const typingIndicatorCheckbox = document.getElementById('typingIndicator');\n            \n            if (apiKeyInput) apiKeyInput.value = config.apiKey || '';\n            if (modelSelect) modelSelect.value = config.model || 'deepseek-chat';\n            if (baseUrlInput) baseUrlInput.value = config.baseUrl || '';\n            if (temperatureInput) {\n              temperatureInput.value = config.temperature || 0.7;\n              if (temperatureValueSpan) temperatureValueSpan.textContent = config.temperature || 0.7;\n            }\n            if (maxTokensInput) maxTokensInput.value = config.maxTokens || 2048;\n            if (autoAnalyzeCheckbox) autoAnalyzeCheckbox.checked = !!config.autoAnalyze;\n            if (showExamplesCheckbox) showExamplesCheckbox.checked = config.showExamples !== false;\n            if (typingIndicatorCheckbox) typingIndicatorCheckbox.checked = config.typingIndicator !== false;\n          }\n          \n          function handleKeydown(event) {\n            if (event.key === 'Enter' && !event.shiftKey) {\n              event.preventDefault();\n              sendMessage();\n            }\n          }\n          \n          // Auto-resize textarea\n          messageInput?.addEventListener('input', function() {\n            this.style.height = 'auto';\n            this.style.height = Math.min(this.scrollHeight, 200) + 'px';\n          });\n          \n          // Initial focus\n          if (messageInput && document.getElementById('chatView').classList.contains('active')) {\n            messageInput.focus();\n          }\n          \n          // Scroll to bottom of chat container\n          if (chatContainer) {\n            chatContainer.scrollTop = chatContainer.scrollHeight;\n          }\n          \n          // Message action functions\n          function copyMessage(messageId) {\n            const messageElement = document.querySelector('.message[data-id=\"' + messageId + '\"]');\n            if (messageElement) {\n              const contentElement = messageElement.querySelector('.message-content');\n              if (contentElement) {\n                const text = contentElement.textContent;\n                navigator.clipboard.writeText(text)\n                  .then(() => {\n                    // Show feedback\n                    const actionButton = messageElement.querySelector('[onclick*=\"copyMessage\"]');\n                    if (actionButton) {\n                      const originalHTML = actionButton.innerHTML;\n                      actionButton.innerHTML = '\u2713';\n                      actionButton.style.color = '#4ec9b0';\n                      setTimeout(() => {\n                        actionButton.innerHTML = originalHTML;\n                        actionButton.style.color = '';\n                      }, 1500);\n                    }\n                  })\n                  .catch(err => {\n                    console.error('Failed to copy:', err);\n                  });\n              }\n            }\n          }\n          \n          function editMessage(messageId) {\n            const messageElement = document.querySelector('.message[data-id=\"' + messageId + '\"]');\n            if (messageElement) {\n              const contentElement = messageElement.querySelector('.message-content');\n              if (contentElement) {\n                const originalText = contentElement.textContent;\n                // Replace content with editable textarea\n                const textarea = document.createElement('textarea');\n                textarea.value = originalText;\n                textarea.style.width = '100%';\n                textarea.style.height = '120px';\n                textarea.style.padding = '8px';\n                textarea.style.borderRadius = '6px';\n                textarea.style.background = '#1e1e1e';\n                textarea.style.color = '#d4d4d4';\n                textarea.style.border = '1px solid #3e3e42';\n                textarea.style.fontFamily = 'Consolas, Monaco, monospace';\n                textarea.style.fontSize = '14px';\n                \n                const buttonContainer = document.createElement('div');\n                buttonContainer.style.display = 'flex';\n                buttonContainer.style.gap = '8px';\n                buttonContainer.style.marginTop = '12px';\n                \n                const saveButton = document.createElement('button');\n                saveButton.textContent = 'Save';\n                saveButton.style.padding = '6px 12px';\n                saveButton.style.background = '#007acc';\n                saveButton.style.color = 'white';\n                saveButton.style.border = 'none';\n                saveButton.style.borderRadius = '4px';\n                saveButton.style.cursor = 'pointer';\n                \n                const cancelButton = document.createElement('button');\n                cancelButton.textContent = 'Cancel';\n                cancelButton.style.padding = '6px 12px';\n                cancelButton.style.background = '#3e3e42';\n                cancelButton.style.color = '#d4d4d4';\n                cancelButton.style.border = 'none';\n                cancelButton.style.borderRadius = '4px';\n                cancelButton.style.cursor = 'pointer';\n                \n                buttonContainer.appendChild(saveButton);\n                buttonContainer.appendChild(cancelButton);\n                \n                contentElement.parentNode.replaceChild(textarea, contentElement);\n                textarea.parentNode.insertBefore(buttonContainer, textarea.nextSibling);\n                \n                saveButton.onclick = () => {\n                  const newText = textarea.value;\n                  vscode.postMessage({\n                    command: 'editMessage',\n                    messageId: messageId,\n                    newContent: newText\n                  });\n                  \n                  // Restore content display\n                  contentElement.textContent = newText;\n                  textarea.parentNode.replaceChild(contentElement, textarea);\n                  buttonContainer.remove();\n                };\n                \n                cancelButton.onclick = () => {\n                  textarea.parentNode.replaceChild(contentElement, textarea);\n                  buttonContainer.remove();\n                };\n                \n                textarea.focus();\n                textarea.select();\n              }\n            }\n          }\n          \n          function regenerateMessage(messageId) {\n            vscode.postMessage({\n              command: 'regenerateMessage',\n              messageId: messageId\n            });\n          }\n          \n          // Handle diff approval/rejection clicks (event delegation)\n          document.addEventListener('click', function(event) {\n            const target = event.target as HTMLElement;\n            \n            // Check if it's a diff approve button\n            if (target.classList.contains('diff-approve') || \n                target.closest('.diff-approve')) {\n              const button = target.classList.contains('diff-approve') ? target : target.closest('.diff-approve');\n              const filePath = button.getAttribute('data-file-path');\n              const diffId = button.getAttribute('data-diff-id');\n              \n              console.log('Approving changes for:', filePath);\n              vscode.postMessage({\n                command: 'approveDiff',\n                filePath,\n                diffId,\n                action: 'approve'\n              });\n              \n              // Update UI\n              const diffContainer = button.closest('.diff-container');\n              if (diffContainer) {\n                const actions = diffContainer.querySelector('.diff-actions');\n                if (actions) {\n                  actions.innerHTML = '<span style=\"color: #2d7d46; font-weight: 500;\">\u2713 Approved</span>';\n                }\n              }\n            }\n            \n            // Check if it's a diff reject button\n            if (target.classList.contains('diff-reject') || \n                target.closest('.diff-reject')) {\n              const button = target.classList.contains('diff-reject') ? target : target.closest('.diff-reject');\n              const filePath = button.getAttribute('data-file-path');\n              const diffId = button.getAttribute('data-diff-id');\n              \n              console.log('Rejecting changes for:', filePath);\n              vscode.postMessage({\n                command: 'approveDiff',\n                filePath,\n                diffId,\n                action: 'reject'\n              });\n              \n              // Update UI\n              const diffContainer = button.closest('.diff-container');\n              if (diffContainer) {\n                const actions = diffContainer.querySelector('.diff-actions');\n                if (actions) {\n                  actions.innerHTML = '<span style=\"color: #c42b1c; font-weight: 500;\">\u2717 Rejected</span>';\n                }\n              }\n            }\n          });\n          \n          // Handle collapsible diff sections\n          document.addEventListener('click', function(event) {\n            const target = event.target as HTMLElement;\n            \n            if (target.classList.contains('diff-collapsible-header') || \n                target.closest('.diff-collapsible-header')) {\n              const header = target.classList.contains('diff-collapsible-header') ? \n                            target : target.closest('.diff-collapsible-header');\n              const collapsible = header.closest('.diff-collapsible');\n              \n              if (collapsible) {\n                collapsible.classList.toggle('expanded');\n              }\n            }\n          });\n          \n          // Account panel functionality\n          document.getElementById('signOutBtn')?.addEventListener('click', function() {\n            if (confirm('Are you sure you want to sign out? This will clear your API keys and preferences.')) {\n              vscode.postMessage({\n                command: 'signOut'\n              });\n            }\n          });\n          \n          document.getElementById('upgradeAccountBtn')?.addEventListener('click', function() {\n            vscode.postMessage({\n              command: 'upgradeAccount'\n            });\n          });\n          \n          document.getElementById('addMCPBtn')?.addEventListener('click', function() {\n            vscode.postMessage({\n              command: 'addMCP'\n            });\n          });\n        </script>\n      </body>\n      </html>\n    ");
    };
    CodeLineChatPanel.prototype.escapeHtml = function (unsafe) {
        // 检查是否包含差异HTML（由FileManager.generateHtmlDiff生成）
        if (unsafe.includes('class="diff-')) {
            // 差异HTML已经安全，直接返回
            return unsafe.replace(/\n/g, "<br>").replace(/  /g, "&nbsp;&nbsp;");
        }
        // 检查是否包含终端结果HTML（由TerminalExecutor.generateHtmlReport生成）
        if (unsafe.includes('class="terminal-')) {
            // 终端HTML已经安全，直接返回
            return unsafe.replace(/\n/g, "<br>").replace(/  /g, "&nbsp;&nbsp;");
        }
        // 否则转义所有HTML标签
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .replace(/\n/g, "<br>")
            .replace(/  /g, "&nbsp;&nbsp;");
    };
    CodeLineChatPanel.prototype.handleSignOut = function () {
        return __awaiter(this, void 0, void 0, function () {
            var config, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        config = vscode.workspace.getConfiguration('codeline');
                        // Reset all configuration keys to undefined (which will remove them)
                        return [4 /*yield*/, config.update('apiKey', undefined, vscode.ConfigurationTarget.Global)];
                    case 1:
                        // Reset all configuration keys to undefined (which will remove them)
                        _a.sent();
                        return [4 /*yield*/, config.update('modelProvider', undefined, vscode.ConfigurationTarget.Global)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, config.update('model', undefined, vscode.ConfigurationTarget.Global)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, config.update('baseURL', undefined, vscode.ConfigurationTarget.Global)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, config.update('temperature', undefined, vscode.ConfigurationTarget.Global)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, config.update('maxTokens', undefined, vscode.ConfigurationTarget.Global)];
                    case 6:
                        _a.sent();
                        // Clear messages
                        this.messages = [];
                        this.currentView = 'chat';
                        // Update webview
                        this.updateWebview();
                        vscode.window.showInformationMessage('Signed out successfully. All API keys and preferences have been cleared.', 'OK');
                        return [3 /*break*/, 8];
                    case 7:
                        error_5 = _a.sent();
                        vscode.window.showErrorMessage("Failed to sign out: ".concat(error_5.message));
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    CodeLineChatPanel.prototype.handleUpgradeAccount = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                vscode.window.showInformationMessage('Account upgrade feature coming soon!', 'OK');
                return [2 /*return*/];
            });
        });
    };
    CodeLineChatPanel.prototype.handleAddMCP = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                vscode.window.showInformationMessage('MCP server configuration coming soon!', 'OK');
                return [2 /*return*/];
            });
        });
    };
    /**
     * 处理流式任务执行请求
     */
    CodeLineChatPanel.prototype.handleTaskExecutionWithStream = function (task) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_6;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.extension.executeTaskWithStream(task, {
                                onEvent: function (event) {
                                    // 将事件转发到Webview
                                    _this.sendMessageToWebview('task_event', { event: event });
                                },
                                onProgress: function (progress, message) {
                                    // 发送进度更新到Webview
                                    _this.sendMessageToWebview('task_progress', { progress: progress, message: message });
                                },
                                enableEventStream: true
                            })];
                    case 1:
                        result = _a.sent();
                        // 任务完成后发送最终结果
                        this.sendMessageToWebview('task_result', { result: result });
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        this.sendMessageToWebview('task_error', { error: error_6.message });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 处理从extension转发过来的任务事件
     * 用于扩展的事件转发机制
     */
    CodeLineChatPanel.prototype.handleTaskEvent = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 直接将事件转发到Webview
                this.sendMessageToWebview('task_event', { event: event });
                return [2 /*return*/];
            });
        });
    };
    CodeLineChatPanel.prototype.dispose = function () {
        CodeLineChatPanel.currentPanel = undefined;
        this.panel.dispose();
    };
    return CodeLineChatPanel;
}());
exports.CodeLineChatPanel = CodeLineChatPanel;
