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
exports.DiffViewer = void 0;
var vscode = require("vscode");
var path = require("path");
var fs = require("fs");
var util_1 = require("util");
var fsReadFile = (0, util_1.promisify)(fs.readFile);
var fsWriteFile = (0, util_1.promisify)(fs.writeFile);
var fsUnlink = (0, util_1.promisify)(fs.unlink);
var fsExists = (0, util_1.promisify)(fs.exists);
/**
 * Cline-style diff viewer that opens multi-file diff views in the workspace
 * with visual comparison and approval workflow.
 */
var DiffViewer = /** @class */ (function () {
    function DiffViewer() {
    }
    /**
     * Open multi-file diff view in workspace (Cline style)
     */
    DiffViewer.openMultiFileDiff = function (changedFiles_1) {
        return __awaiter(this, arguments, void 0, function (changedFiles, options) {
            var title, showApplyButton, showRejectButton, tempDir, tempFiles, _i, changedFiles_2, file, leftUri, rightUri, appliedFiles, rejectedFiles, fileChoices, result, i, tempFile, changedFile, action, tempFile, result, changedFile;
            var _this = this;
            var _a, _b;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        title = options.title || 'CodeLine Changes';
                        showApplyButton = (_a = options.showApplyButton) !== null && _a !== void 0 ? _a : true;
                        showRejectButton = (_b = options.showRejectButton) !== null && _b !== void 0 ? _b : true;
                        return [4 /*yield*/, this.getTempDir()];
                    case 1:
                        tempDir = _c.sent();
                        tempFiles = [];
                        _i = 0, changedFiles_2 = changedFiles;
                        _c.label = 2;
                    case 2:
                        if (!(_i < changedFiles_2.length)) return [3 /*break*/, 6];
                        file = changedFiles_2[_i];
                        return [4 /*yield*/, this.createTempFile(tempDir, "".concat(path.basename(file.absolutePath), ".original"), file.before)];
                    case 3:
                        leftUri = _c.sent();
                        return [4 /*yield*/, this.createTempFile(tempDir, "".concat(path.basename(file.absolutePath), ".modified"), file.after)];
                    case 4:
                        rightUri = _c.sent();
                        tempFiles.push({
                            left: leftUri,
                            right: rightUri,
                            originalPath: file.absolutePath
                        });
                        _c.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 2];
                    case 6:
                        appliedFiles = [];
                        rejectedFiles = [];
                        if (!(changedFiles.length > 1)) return [3 /*break*/, 22];
                        fileChoices = changedFiles.map(function (file, index) { return ({
                            label: "".concat(path.basename(file.absolutePath)),
                            description: file.relativePath,
                            detail: "Lines changed: ".concat(_this.calculateChangeCount(file.before, file.after)),
                            index: index
                        }); });
                        if (!(tempFiles.length > 0)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.openSingleDiff(tempFiles[0].left, tempFiles[0].right, "".concat(title, " - ").concat(path.basename(tempFiles[0].originalPath)))];
                    case 7:
                        _c.sent();
                        _c.label = 8;
                    case 8: return [4 /*yield*/, vscode.window.showInformationMessage("".concat(changedFiles.length, " files changed. Review changes in diff view."), { modal: true }, 'Apply All', 'Reject All', 'Review Each')];
                    case 9:
                        result = _c.sent();
                        if (!(result === 'Apply All')) return [3 /*break*/, 11];
                        // Clean up temp files
                        return [4 /*yield*/, this.cleanupTempFiles()];
                    case 10:
                        // Clean up temp files
                        _c.sent();
                        return [2 /*return*/, { applied: true, rejected: false }];
                    case 11:
                        if (!(result === 'Reject All')) return [3 /*break*/, 13];
                        return [4 /*yield*/, this.cleanupTempFiles()];
                    case 12:
                        _c.sent();
                        return [2 /*return*/, { applied: false, rejected: true }];
                    case 13:
                        i = 0;
                        _c.label = 14;
                    case 14:
                        if (!(i < tempFiles.length)) return [3 /*break*/, 19];
                        tempFile = tempFiles[i];
                        changedFile = changedFiles[i];
                        return [4 /*yield*/, vscode.window.showInformationMessage("Review changes to ".concat(path.basename(changedFile.absolutePath)), { modal: true }, 'Apply', 'Reject', 'Skip')];
                    case 15:
                        action = _c.sent();
                        if (!(action === 'Apply')) return [3 /*break*/, 17];
                        appliedFiles.push(changedFile.absolutePath);
                        // Apply the changes
                        return [4 /*yield*/, fsWriteFile(changedFile.absolutePath, changedFile.after, 'utf8')];
                    case 16:
                        // Apply the changes
                        _c.sent();
                        return [3 /*break*/, 18];
                    case 17:
                        if (action === 'Reject') {
                            rejectedFiles.push(changedFile.absolutePath);
                        }
                        _c.label = 18;
                    case 18:
                        i++;
                        return [3 /*break*/, 14];
                    case 19: return [4 /*yield*/, this.cleanupTempFiles()];
                    case 20:
                        _c.sent();
                        return [2 /*return*/, {
                                applied: appliedFiles.length > 0,
                                rejected: rejectedFiles.length === changedFiles.length
                            }];
                    case 21: return [3 /*break*/, 28];
                    case 22:
                        tempFile = tempFiles[0];
                        return [4 /*yield*/, this.openSingleDiff(tempFile.left, tempFile.right, title)];
                    case 23:
                        _c.sent();
                        return [4 /*yield*/, vscode.window.showInformationMessage('Apply these changes?', { modal: true }, 'Apply Changes', 'Reject Changes')];
                    case 24:
                        result = _c.sent();
                        return [4 /*yield*/, this.cleanupTempFiles()];
                    case 25:
                        _c.sent();
                        if (!(result === 'Apply Changes')) return [3 /*break*/, 27];
                        changedFile = changedFiles[0];
                        return [4 /*yield*/, fsWriteFile(changedFile.absolutePath, changedFile.after, 'utf8')];
                    case 26:
                        _c.sent();
                        return [2 /*return*/, { applied: true, rejected: false }];
                    case 27: return [2 /*return*/, { applied: false, rejected: true }];
                    case 28: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Open a single diff editor
     */
    DiffViewer.openSingleDiff = function (leftUri, rightUri, title) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Use VS Code's diff command to open diff editor in workspace
                    return [4 /*yield*/, vscode.commands.executeCommand('vscode.diff', leftUri, rightUri, title)];
                    case 1:
                        // Use VS Code's diff command to open diff editor in workspace
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 7, , 8]);
                        // Close any existing diff editor first
                        return [4 /*yield*/, vscode.commands.executeCommand('workbench.action.closeActiveEditor')];
                    case 3:
                        // Close any existing diff editor first
                        _a.sent();
                        // Open in new editor group to the side
                        return [4 /*yield*/, vscode.commands.executeCommand('workbench.action.splitEditorRight')];
                    case 4:
                        // Open in new editor group to the side
                        _a.sent();
                        return [4 /*yield*/, vscode.commands.executeCommand('vscode.diff', leftUri, rightUri, title)];
                    case 5:
                        _a.sent();
                        // Focus the diff editor
                        return [4 /*yield*/, vscode.commands.executeCommand('workbench.action.focusRightGroup')];
                    case 6:
                        // Focus the diff editor
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_1 = _a.sent();
                        // Fallback to regular diff opening
                        console.warn('Failed to open diff in new editor group:', error_1);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a temporary file with content
     */
    DiffViewer.createTempFile = function (tempDir, filename, content) {
        return __awaiter(this, void 0, void 0, function () {
            var filePath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filePath = path.join(tempDir, filename);
                        return [4 /*yield*/, fsWriteFile(filePath, content, 'utf8')];
                    case 1:
                        _a.sent();
                        this.tempFiles.push(filePath);
                        return [2 /*return*/, vscode.Uri.file(filePath)];
                }
            });
        });
    };
    /**
     * Get or create temp directory
     */
    DiffViewer.getTempDir = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workspaceFolders, workspacePath, tempDir;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.tempDir) return [3 /*break*/, 4];
                        workspaceFolders = vscode.workspace.workspaceFolders;
                        workspacePath = workspaceFolders && workspaceFolders.length > 0
                            ? workspaceFolders[0].uri.fsPath
                            : process.cwd();
                        tempDir = path.join(workspacePath, '.codeline', 'temp', Date.now().toString());
                        return [4 /*yield*/, fsExists(tempDir)];
                    case 1:
                        if (!!(_a.sent())) return [3 /*break*/, 3];
                        return [4 /*yield*/, fs.promises.mkdir(tempDir, { recursive: true })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        this.tempDir = tempDir;
                        _a.label = 4;
                    case 4: return [2 /*return*/, this.tempDir];
                }
            });
        });
    };
    /**
     * Clean up temporary files
     */
    DiffViewer.cleanupTempFiles = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, file, error_2, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.tempFiles;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        file = _a[_i];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, fsUnlink(file)];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _b.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        this.tempFiles = [];
                        if (!this.tempDir) return [3 /*break*/, 11];
                        _b.label = 7;
                    case 7:
                        _b.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, fs.promises.rm(this.tempDir, { recursive: true, force: true })];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        error_3 = _b.sent();
                        return [3 /*break*/, 10];
                    case 10:
                        this.tempDir = undefined;
                        _b.label = 11;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calculate approximate change count for display
     */
    DiffViewer.calculateChangeCount = function (before, after) {
        var beforeLines = before.split('\n').length;
        var afterLines = after.split('\n').length;
        return Math.abs(beforeLines - afterLines);
    };
    /**
     * Create unified diff string for display
     */
    DiffViewer.createUnifiedDiff = function (file) {
        var beforeLines = file.before.split('\n');
        var afterLines = file.after.split('\n');
        var diff = "--- ".concat(file.relativePath, " (original)\n");
        diff += "+++ ".concat(file.relativePath, " (modified)\n");
        // Simple diff algorithm for display (simplified)
        var maxLines = Math.max(beforeLines.length, afterLines.length);
        for (var i = 0; i < maxLines; i++) {
            var beforeLine = beforeLines[i] || '';
            var afterLine = afterLines[i] || '';
            if (beforeLine !== afterLine) {
                if (beforeLine && afterLine) {
                    diff += "- ".concat(beforeLine, "\n");
                    diff += "+ ".concat(afterLine, "\n");
                }
                else if (beforeLine) {
                    diff += "- ".concat(beforeLine, "\n");
                }
                else if (afterLine) {
                    diff += "+ ".concat(afterLine, "\n");
                }
            }
            else {
                diff += "  ".concat(beforeLine, "\n");
            }
        }
        return diff;
    };
    /**
     * Show diff in output channel (fallback)
     */
    DiffViewer.showDiffInOutput = function (changedFiles, title) {
        if (title === void 0) { title = 'CodeLine Changes'; }
        var outputChannel = vscode.window.createOutputChannel('CodeLine Diff');
        outputChannel.show(true);
        outputChannel.appendLine("=== ".concat(title, " ===\n"));
        for (var _i = 0, changedFiles_1 = changedFiles; _i < changedFiles_1.length; _i++) {
            var file = changedFiles_1[_i];
            outputChannel.appendLine("File: ".concat(file.relativePath));
            outputChannel.appendLine(this.createUnifiedDiff(file));
            outputChannel.appendLine('');
        }
        outputChannel.appendLine('=== End of Diff ===');
    };
    DiffViewer.tempFiles = [];
    return DiffViewer;
}());
exports.DiffViewer = DiffViewer;
