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
exports.EditorCommands = void 0;
var vscode = require("vscode");
/**
 * Editor context commands similar to Cline's functionality
 */
var EditorCommands = /** @class */ (function () {
    function EditorCommands(codeLine) {
        this.codeLine = codeLine;
    }
    /**
     * Add selected text to chat (Cline's addToChat command)
     */
    EditorCommands.prototype.addToChat = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor, selection, selectedText, filePath, fileName, sidebarProvider, message;
            return __generator(this, function (_a) {
                editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showInformationMessage('No active editor');
                    return [2 /*return*/];
                }
                selection = editor.selection;
                if (selection.isEmpty) {
                    vscode.window.showInformationMessage('No text selected');
                    return [2 /*return*/];
                }
                selectedText = editor.document.getText(selection);
                filePath = editor.document.uri.fsPath;
                fileName = filePath.split('/').pop() || 'Unknown file';
                sidebarProvider = this.codeLine.getSidebarProvider();
                message = "**Selected code from ".concat(fileName, "**:\n\n```").concat(this.getLanguageId(editor.document.languageId), "\n").concat(selectedText, "\n```");
                // Send to sidebar
                sidebarProvider.sendMessageToChat(message);
                // Show the sidebar if not visible
                this.codeLine.showSidebar('chat');
                vscode.window.showInformationMessage("Added ".concat(selectedText.length, " characters to chat"));
                return [2 /*return*/];
            });
        });
    };
    /**
     * Focus chat input in sidebar
     */
    EditorCommands.prototype.focusChatInput = function () {
        var sidebarProvider = this.codeLine.getSidebarProvider();
        sidebarProvider.focusChatInput();
        this.codeLine.showSidebar('chat');
    };
    /**
     * Explain selected code
     */
    EditorCommands.prototype.explainCode = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor, selection, selectedText, filePath, fileName, language, sidebarProvider, message;
            return __generator(this, function (_a) {
                editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showInformationMessage('No active editor');
                    return [2 /*return*/];
                }
                selection = editor.selection;
                if (selection.isEmpty) {
                    vscode.window.showInformationMessage('No text selected');
                    return [2 /*return*/];
                }
                selectedText = editor.document.getText(selection);
                filePath = editor.document.uri.fsPath;
                fileName = filePath.split('/').pop() || 'Unknown file';
                language = this.getLanguageId(editor.document.languageId);
                // Show the sidebar
                this.codeLine.showSidebar('chat');
                sidebarProvider = this.codeLine.getSidebarProvider();
                message = "Please explain this ".concat(language, " code from ").concat(fileName, ":\n\n```").concat(language, "\n").concat(selectedText, "\n```\n\nProvide:\n1. What this code does\n2. Key functions/methods\n3. Any potential issues\n4. Suggestions for improvement if applicable");
                sidebarProvider.sendMessageToChat(message);
                vscode.window.showInformationMessage("Requested explanation for selected code");
                return [2 /*return*/];
            });
        });
    };
    /**
     * Improve selected code
     */
    EditorCommands.prototype.improveCode = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor, selection, selectedText, filePath, fileName, language, sidebarProvider, message;
            return __generator(this, function (_a) {
                editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showInformationMessage('No active editor');
                    return [2 /*return*/];
                }
                selection = editor.selection;
                if (selection.isEmpty) {
                    vscode.window.showInformationMessage('No text selected');
                    return [2 /*return*/];
                }
                selectedText = editor.document.getText(selection);
                filePath = editor.document.uri.fsPath;
                fileName = filePath.split('/').pop() || 'Unknown file';
                language = this.getLanguageId(editor.document.languageId);
                // Show the sidebar
                this.codeLine.showSidebar('chat');
                sidebarProvider = this.codeLine.getSidebarProvider();
                message = "Please review and improve this ".concat(language, " code from ").concat(fileName, ":\n\n```").concat(language, "\n").concat(selectedText, "\n```\n\nProvide:\n1. Code improvements (readability, performance, etc.)\n2. Alternative implementations if applicable\n3. Best practices to follow\n4. Complete improved code");
                sidebarProvider.sendMessageToChat(message);
                vscode.window.showInformationMessage("Requested code improvement for selected code");
                return [2 /*return*/];
            });
        });
    };
    /**
     * Generate Git commit message
     */
    EditorCommands.prototype.generateGitCommitMessage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workspaceFolders, workspacePath, gitExtension, git, repository, stagedChanges, unstagedChanges, changes_1, changesText, sidebarProvider, message, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        workspaceFolders = vscode.workspace.workspaceFolders;
                        if (!workspaceFolders || workspaceFolders.length === 0) {
                            vscode.window.showInformationMessage('No workspace folder open');
                            return [2 /*return*/];
                        }
                        workspacePath = workspaceFolders[0].uri.fsPath;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        gitExtension = vscode.extensions.getExtension('vscode.git');
                        if (!gitExtension) {
                            vscode.window.showInformationMessage('Git extension not available');
                            return [2 /*return*/];
                        }
                        if (!!gitExtension.isActive) return [3 /*break*/, 3];
                        return [4 /*yield*/, gitExtension.activate()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        git = gitExtension.exports.getAPI(1);
                        repository = git.repositories.find(function (repo) { return repo.rootUri.fsPath === workspacePath; });
                        if (!repository) {
                            vscode.window.showInformationMessage('No Git repository found');
                            return [2 /*return*/];
                        }
                        stagedChanges = repository.state.indexChanges;
                        unstagedChanges = repository.state.workingTreeChanges;
                        if ((!stagedChanges || stagedChanges.length === 0) && (!unstagedChanges || unstagedChanges.length === 0)) {
                            vscode.window.showInformationMessage('No changes to commit');
                            return [2 /*return*/];
                        }
                        changes_1 = [];
                        if (stagedChanges && stagedChanges.length > 0) {
                            changes_1.push('**Staged changes:**');
                            stagedChanges.forEach(function (change) {
                                changes_1.push("- ".concat(change.uri.fsPath.split('/').pop(), " (").concat(_this.getGitChangeType(change.status), ")"));
                            });
                        }
                        if (unstagedChanges && unstagedChanges.length > 0) {
                            changes_1.push('**Unstaged changes:**');
                            unstagedChanges.forEach(function (change) {
                                changes_1.push("- ".concat(change.uri.fsPath.split('/').pop(), " (").concat(_this.getGitChangeType(change.status), ")"));
                            });
                        }
                        changesText = changes_1.join('\n');
                        // Show the sidebar
                        this.codeLine.showSidebar('chat');
                        sidebarProvider = this.codeLine.getSidebarProvider();
                        message = "Generate a Git commit message for these changes:\n\n".concat(changesText, "\n\nProvide:\n1. A concise commit message (50 chars or less)\n2. A more detailed description (if needed)\n3. Conventional commit format if applicable\n4. Any relevant tags or references");
                        sidebarProvider.sendMessageToChat(message);
                        vscode.window.showInformationMessage("Requested Git commit message generation");
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        vscode.window.showErrorMessage("Failed to generate commit message: ".concat(error_1));
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get language ID for code block formatting
     */
    EditorCommands.prototype.getLanguageId = function (languageId) {
        var languageMap = {
            'javascript': 'javascript',
            'typescript': 'typescript',
            'python': 'python',
            'java': 'java',
            'c': 'c',
            'cpp': 'cpp',
            'csharp': 'csharp',
            'go': 'go',
            'rust': 'rust',
            'ruby': 'ruby',
            'php': 'php',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'xml': 'xml',
            'yaml': 'yaml',
            'markdown': 'markdown',
            'bash': 'bash',
            'shellscript': 'shell'
        };
        return languageMap[languageId] || '';
    };
    /**
     * Get Git change type description
     */
    EditorCommands.prototype.getGitChangeType = function (status) {
        // Git status codes from vscode.git extension
        var statusMap = {
            1: 'added',
            2: 'deleted',
            3: 'modified',
            4: 'renamed',
            5: 'copied'
        };
        return statusMap[status] || 'unknown';
    };
    return EditorCommands;
}());
exports.EditorCommands = EditorCommands;
