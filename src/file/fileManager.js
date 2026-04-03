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
exports.FileManager = void 0;
var vscode = require("vscode");
var fs = require("fs/promises");
var path = require("path");
var FileManager = /** @class */ (function () {
    function FileManager(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
    }
    /**
     * 创建新文件
     */
    FileManager.prototype.createFile = function (filePath, content) {
        return __awaiter(this, void 0, void 0, function () {
            var fullPath, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        fullPath = this.resolvePath(filePath);
                        // 确保目录存在
                        return [4 /*yield*/, this.ensureDirectoryExists(fullPath)];
                    case 1:
                        // 确保目录存在
                        _a.sent();
                        // 写入文件
                        return [4 /*yield*/, fs.writeFile(fullPath, content, 'utf-8')];
                    case 2:
                        // 写入文件
                        _a.sent();
                        // 打开文件在编辑器中
                        return [4 /*yield*/, this.openFileInEditor(fullPath)];
                    case 3:
                        // 打开文件在编辑器中
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                filePath: filePath,
                                message: "Created file: ".concat(filePath),
                                diff: {
                                    filePath: filePath,
                                    oldContent: '',
                                    newContent: content,
                                    changes: this.calculateChanges('', content),
                                    summary: "Created new file with ".concat(content.split('\n').length, " lines")
                                }
                            }];
                    case 4:
                        error_1 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                filePath: filePath,
                                error: error_1.message,
                                message: "Failed to create file: ".concat(filePath)
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 编辑文件（带差异计算）
     */
    FileManager.prototype.editFileWithDiff = function (filePath, newContent) {
        return __awaiter(this, void 0, void 0, function () {
            var fullPath, oldContent, diff, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        fullPath = this.resolvePath(filePath);
                        return [4 /*yield*/, this.readFileIfExists(fullPath)];
                    case 1:
                        oldContent = _a.sent();
                        diff = {
                            filePath: filePath,
                            oldContent: oldContent,
                            newContent: newContent,
                            changes: this.calculateChanges(oldContent, newContent),
                            summary: this.generateDiffSummary(oldContent, newContent)
                        };
                        // 写入新内容
                        return [4 /*yield*/, fs.writeFile(fullPath, newContent, 'utf-8')];
                    case 2:
                        // 写入新内容
                        _a.sent();
                        // 刷新编辑器中的文件
                        return [4 /*yield*/, this.refreshFileInEditor(fullPath)];
                    case 3:
                        // 刷新编辑器中的文件
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                filePath: filePath,
                                diff: diff,
                                message: "Updated file: ".concat(filePath)
                            }];
                    case 4:
                        error_2 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                filePath: filePath,
                                error: error_2.message,
                                message: "Failed to edit file: ".concat(filePath)
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除文件
     */
    FileManager.prototype.deleteFile = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var fullPath, oldContent, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        fullPath = this.resolvePath(filePath);
                        return [4 /*yield*/, this.readFileIfExists(fullPath)];
                    case 1:
                        oldContent = _a.sent();
                        // 删除文件
                        return [4 /*yield*/, fs.unlink(fullPath)];
                    case 2:
                        // 删除文件
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                filePath: filePath,
                                message: "Deleted file: ".concat(filePath),
                                diff: {
                                    filePath: filePath,
                                    oldContent: oldContent,
                                    newContent: '',
                                    changes: this.calculateChanges(oldContent, ''),
                                    summary: "Deleted file with ".concat(oldContent.split('\n').length, " lines")
                                }
                            }];
                    case 3:
                        error_3 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                filePath: filePath,
                                error: error_3.message,
                                message: "Failed to delete file: ".concat(filePath)
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 检查文件是否存在
     */
    FileManager.prototype.fileExists = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var fullPath, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        fullPath = this.resolvePath(filePath);
                        return [4 /*yield*/, fs.access(fullPath)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, true];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 读取文件内容
     */
    FileManager.prototype.readFile = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var fullPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fullPath = this.resolvePath(filePath);
                        return [4 /*yield*/, fs.readFile(fullPath, 'utf-8')];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 读取文件内容（带行数限制）
     */
    FileManager.prototype.readFileWithLimits = function (filePath_1) {
        return __awaiter(this, arguments, void 0, function (filePath, offset, limit) {
            var fullPath, content, lines, startLine, endLine, selectedLines, selectedContent, diff, error_4;
            if (offset === void 0) { offset = 1; }
            if (limit === void 0) { limit = 1000; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        fullPath = this.resolvePath(filePath);
                        return [4 /*yield*/, fs.readFile(fullPath, 'utf-8')];
                    case 1:
                        content = _a.sent();
                        lines = content.split('\n');
                        startLine = Math.max(1, offset) - 1;
                        endLine = Math.min(lines.length, startLine + limit);
                        selectedLines = lines.slice(startLine, endLine);
                        selectedContent = selectedLines.join('\n');
                        diff = {
                            filePath: filePath,
                            oldContent: '',
                            newContent: selectedContent,
                            changes: this.calculateChanges('', selectedContent),
                            summary: "Read ".concat(selectedLines.length, " lines from ").concat(filePath, " (lines ").concat(offset, "-").concat(endLine, ")")
                        };
                        return [2 /*return*/, {
                                success: true,
                                filePath: filePath,
                                diff: diff,
                                message: "Successfully read ".concat(selectedLines.length, " lines from ").concat(filePath)
                            }];
                    case 2:
                        error_4 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                filePath: filePath,
                                error: error_4.message,
                                message: "Failed to read file ".concat(filePath, ": ").concat(error_4.message)
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 移动文件（重命名文件的别名）
     */
    FileManager.prototype.moveFile = function (sourcePath, destPath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.renameFile(sourcePath, destPath)];
                    case 1: 
                    // 直接调用renameFile实现
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 获取文件信息
     */
    FileManager.prototype.getFileInfo = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var fullPath, stats, content, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        fullPath = this.resolvePath(filePath);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fs.stat(fullPath)];
                    case 2:
                        stats = _b.sent();
                        return [4 /*yield*/, this.readFileIfExists(fullPath)];
                    case 3:
                        content = _b.sent();
                        return [2 /*return*/, {
                                exists: true,
                                size: stats.size,
                                modified: stats.mtime,
                                lines: content.split('\n').length
                            }];
                    case 4:
                        _a = _b.sent();
                        return [2 /*return*/, {
                                exists: false,
                                size: 0,
                                modified: new Date(0),
                                lines: 0
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 列出目录内容
     */
    FileManager.prototype.listDirectory = function () {
        return __awaiter(this, arguments, void 0, function (dirPath) {
            var fullPath, entries, files, directories, filesCount, totalSize, _i, entries_1, entry, entryPath, stats, fileInfo, error_5;
            if (dirPath === void 0) { dirPath = '.'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        fullPath = this.resolvePath(dirPath);
                        return [4 /*yield*/, fs.readdir(fullPath, { withFileTypes: true })];
                    case 1:
                        entries = _a.sent();
                        files = [];
                        directories = 0;
                        filesCount = 0;
                        totalSize = 0;
                        _i = 0, entries_1 = entries;
                        _a.label = 2;
                    case 2:
                        if (!(_i < entries_1.length)) return [3 /*break*/, 5];
                        entry = entries_1[_i];
                        entryPath = path.join(fullPath, entry.name);
                        return [4 /*yield*/, fs.stat(entryPath)];
                    case 3:
                        stats = _a.sent();
                        fileInfo = {
                            name: entry.name,
                            path: path.relative(this.workspaceRoot, entryPath),
                            type: (entry.isDirectory() ? 'directory' :
                                entry.isFile() ? 'file' :
                                    entry.isSymbolicLink() ? 'symlink' : 'other'),
                            size: stats.size,
                            modified: stats.mtime,
                            extension: entry.isFile() ? path.extname(entry.name).toLowerCase() || undefined : undefined
                        };
                        files.push(fileInfo);
                        if (entry.isDirectory()) {
                            directories++;
                        }
                        else {
                            filesCount++;
                            totalSize += stats.size;
                        }
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        // 按类型和名称排序：目录在前，文件在后，都按字母顺序
                        files.sort(function (a, b) {
                            if (a.type === 'directory' && b.type !== 'directory')
                                return -1;
                            if (a.type !== 'directory' && b.type === 'directory')
                                return 1;
                            return a.name.localeCompare(b.name);
                        });
                        return [2 /*return*/, {
                                files: files,
                                directories: directories,
                                filesCount: filesCount,
                                totalSize: totalSize
                            }];
                    case 6:
                        error_5 = _a.sent();
                        return [2 /*return*/, {
                                files: [],
                                directories: 0,
                                filesCount: 0,
                                totalSize: 0
                            }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 重命名或移动文件
     */
    FileManager.prototype.renameFile = function (oldPath, newPath) {
        return __awaiter(this, void 0, void 0, function () {
            var oldFullPath, newFullPath, oldContent, newFileExists, diff, newFileDiff, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        oldFullPath = this.resolvePath(oldPath);
                        newFullPath = this.resolvePath(newPath);
                        // 确保目标目录存在
                        return [4 /*yield*/, this.ensureDirectoryExists(newFullPath)];
                    case 1:
                        // 确保目标目录存在
                        _a.sent();
                        return [4 /*yield*/, this.readFileIfExists(oldFullPath)];
                    case 2:
                        oldContent = _a.sent();
                        return [4 /*yield*/, this.fileExists(newPath)];
                    case 3:
                        newFileExists = _a.sent();
                        // 执行重命名/移动
                        return [4 /*yield*/, fs.rename(oldFullPath, newFullPath)];
                    case 4:
                        // 执行重命名/移动
                        _a.sent();
                        diff = {
                            filePath: oldPath, // 原始路径
                            oldContent: oldContent,
                            newContent: oldContent, // 内容不变
                            changes: [],
                            summary: "Moved file from ".concat(oldPath, " to ").concat(newPath)
                        };
                        newFileDiff = {
                            filePath: newPath,
                            oldContent: newFileExists ? '' : '', // 如果目标文件不存在，则是创建
                            newContent: oldContent,
                            changes: this.calculateChanges('', oldContent),
                            summary: newFileExists ? "Replaced file at ".concat(newPath) : "Created file at ".concat(newPath)
                        };
                        return [2 /*return*/, {
                                success: true,
                                filePath: newPath,
                                diff: diff,
                                message: "Moved file from ".concat(oldPath, " to ").concat(newPath)
                            }];
                    case 5:
                        error_6 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                filePath: oldPath,
                                error: error_6.message,
                                message: "Failed to move file from ".concat(oldPath, " to ").concat(newPath)
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 复制文件
     */
    FileManager.prototype.copyFile = function (sourcePath, destPath) {
        return __awaiter(this, void 0, void 0, function () {
            var sourceFullPath, destFullPath, content, diff, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        sourceFullPath = this.resolvePath(sourcePath);
                        destFullPath = this.resolvePath(destPath);
                        // 确保目标目录存在
                        return [4 /*yield*/, this.ensureDirectoryExists(destFullPath)];
                    case 1:
                        // 确保目标目录存在
                        _a.sent();
                        return [4 /*yield*/, fs.readFile(sourceFullPath, 'utf-8')];
                    case 2:
                        content = _a.sent();
                        // 复制文件
                        return [4 /*yield*/, fs.copyFile(sourceFullPath, destFullPath)];
                    case 3:
                        // 复制文件
                        _a.sent();
                        diff = {
                            filePath: destPath,
                            oldContent: '',
                            newContent: content,
                            changes: this.calculateChanges('', content),
                            summary: "Copied file from ".concat(sourcePath, " to ").concat(destPath)
                        };
                        return [2 /*return*/, {
                                success: true,
                                filePath: destPath,
                                diff: diff,
                                message: "Copied file from ".concat(sourcePath, " to ").concat(destPath)
                            }];
                    case 4:
                        error_7 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                filePath: sourcePath,
                                error: error_7.message,
                                message: "Failed to copy file from ".concat(sourcePath, " to ").concat(destPath)
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建目录
     */
    FileManager.prototype.createDirectory = function (dirPath) {
        return __awaiter(this, void 0, void 0, function () {
            var fullPath, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        fullPath = this.resolvePath(dirPath);
                        // 创建目录（包括父目录）
                        return [4 /*yield*/, fs.mkdir(fullPath, { recursive: true })];
                    case 1:
                        // 创建目录（包括父目录）
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                filePath: dirPath,
                                message: "Created directory: ".concat(dirPath)
                            }];
                    case 2:
                        error_8 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                filePath: dirPath,
                                error: error_8.message,
                                message: "Failed to create directory: ".concat(dirPath)
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除目录（递归）
     */
    FileManager.prototype.deleteDirectory = function (dirPath) {
        return __awaiter(this, void 0, void 0, function () {
            var fullPath, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        fullPath = this.resolvePath(dirPath);
                        // 递归删除目录及其内容
                        return [4 /*yield*/, fs.rm(fullPath, { recursive: true, force: true })];
                    case 1:
                        // 递归删除目录及其内容
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                filePath: dirPath,
                                message: "Deleted directory: ".concat(dirPath)
                            }];
                    case 2:
                        error_9 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                filePath: dirPath,
                                error: error_9.message,
                                message: "Failed to delete directory: ".concat(dirPath)
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 搜索文件（基于名称或内容）
     */
    FileManager.prototype.searchFiles = function () {
        return __awaiter(this, arguments, void 0, function (options) {
            var results, maxDepth, searchDir;
            var _this = this;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = [];
                        maxDepth = options.recursive ? 10 : 1;
                        searchDir = function (currentPath_1) {
                            var args_1 = [];
                            for (var _i = 1; _i < arguments.length; _i++) {
                                args_1[_i - 1] = arguments[_i];
                            }
                            return __awaiter(_this, __spreadArray([currentPath_1], args_1, true), void 0, function (currentPath, depth) {
                                var entries, _a, entries_2, entry, entryPath, relativePath, nameMatches, contentMatches, fileContent, e_1, matches, error_10;
                                if (depth === void 0) { depth = 0; }
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            if (depth > maxDepth)
                                                return [2 /*return*/];
                                            _b.label = 1;
                                        case 1:
                                            _b.trys.push([1, 13, , 14]);
                                            return [4 /*yield*/, fs.readdir(currentPath, { withFileTypes: true })];
                                        case 2:
                                            entries = _b.sent();
                                            _a = 0, entries_2 = entries;
                                            _b.label = 3;
                                        case 3:
                                            if (!(_a < entries_2.length)) return [3 /*break*/, 12];
                                            entry = entries_2[_a];
                                            entryPath = path.join(currentPath, entry.name);
                                            relativePath = path.relative(this.workspaceRoot, entryPath);
                                            if (!entry.isDirectory()) return [3 /*break*/, 6];
                                            if (!options.recursive) return [3 /*break*/, 5];
                                            return [4 /*yield*/, searchDir(entryPath, depth + 1)];
                                        case 4:
                                            _b.sent();
                                            _b.label = 5;
                                        case 5: return [3 /*break*/, 11];
                                        case 6:
                                            if (!entry.isFile()) return [3 /*break*/, 11];
                                            nameMatches = options.pattern ?
                                                this.matchesPattern(entry.name, options.pattern, options.caseSensitive) : true;
                                            contentMatches = [];
                                            if (!(nameMatches && options.content)) return [3 /*break*/, 10];
                                            _b.label = 7;
                                        case 7:
                                            _b.trys.push([7, 9, , 10]);
                                            return [4 /*yield*/, fs.readFile(entryPath, 'utf-8')];
                                        case 8:
                                            fileContent = _b.sent();
                                            contentMatches = this.searchInContent(fileContent, options.content, options.caseSensitive);
                                            return [3 /*break*/, 10];
                                        case 9:
                                            e_1 = _b.sent();
                                            return [3 /*break*/, 10];
                                        case 10:
                                            matches = options.content ? contentMatches : [];
                                            if ((nameMatches && !options.content) || (options.content && matches.length > 0)) {
                                                results.push({
                                                    path: relativePath,
                                                    name: entry.name,
                                                    matches: matches
                                                });
                                                if (options.maxResults && results.length >= options.maxResults) {
                                                    return [2 /*return*/]; // 达到最大结果数，提前终止
                                                }
                                            }
                                            _b.label = 11;
                                        case 11:
                                            _a++;
                                            return [3 /*break*/, 3];
                                        case 12: return [3 /*break*/, 14];
                                        case 13:
                                            error_10 = _b.sent();
                                            return [3 /*break*/, 14];
                                        case 14: return [2 /*return*/];
                                    }
                                });
                            });
                        };
                        return [4 /*yield*/, searchDir(this.workspaceRoot)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * 获取文件统计信息（整个工作区）
     */
    FileManager.prototype.getWorkspaceStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dirList, totalFiles, totalSize, totalLines, byExtension, byType, _i, _a, file, content, lines, ext, e_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.listDirectory('.')];
                    case 1:
                        dirList = _b.sent();
                        totalFiles = dirList.filesCount;
                        totalSize = dirList.totalSize;
                        totalLines = 0;
                        byExtension = {};
                        byType = {
                            'directory': dirList.directories,
                            'file': dirList.filesCount,
                            'symlink': 0,
                            'other': 0
                        };
                        _i = 0, _a = dirList.files;
                        _b.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        file = _a[_i];
                        if (!(file.type === 'file')) return [3 /*break*/, 6];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.readFile(file.path)];
                    case 4:
                        content = _b.sent();
                        lines = content.split('\n').length;
                        totalLines += lines;
                        ext = file.extension || 'no-extension';
                        if (!byExtension[ext]) {
                            byExtension[ext] = { count: 0, size: 0, lines: 0 };
                        }
                        byExtension[ext].count++;
                        byExtension[ext].size += file.size;
                        byExtension[ext].lines += lines;
                        return [3 /*break*/, 6];
                    case 5:
                        e_2 = _b.sent();
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7: return [2 /*return*/, {
                            totalFiles: totalFiles,
                            totalSize: totalSize,
                            totalLines: totalLines,
                            byExtension: byExtension,
                            byType: byType
                        }];
                }
            });
        });
    };
    /**
     * 应用差异（用户批准后）
     */
    FileManager.prototype.applyDiff = function (diff) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(diff.oldContent === '')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.createFile(diff.filePath, diff.newContent)];
                    case 1: 
                    // 创建新文件
                    return [2 /*return*/, _a.sent()];
                    case 2:
                        if (!(diff.newContent === '')) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.deleteFile(diff.filePath)];
                    case 3: 
                    // 删除文件
                    return [2 /*return*/, _a.sent()];
                    case 4: return [4 /*yield*/, this.editFileWithDiff(diff.filePath, diff.newContent)];
                    case 5: 
                    // 编辑文件
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 撤销差异（回滚更改）
     */
    FileManager.prototype.revertDiff = function (diff) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(diff.oldContent === '')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.deleteFile(diff.filePath)];
                    case 1: 
                    // 回滚创建 -> 删除文件
                    return [2 /*return*/, _a.sent()];
                    case 2: return [4 /*yield*/, this.editFileWithDiff(diff.filePath, diff.oldContent)];
                    case 3: 
                    // 回滚到旧内容
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 批量应用多个差异
     */
    FileManager.prototype.applyDiffs = function (diffs) {
        return __awaiter(this, void 0, void 0, function () {
            var results, _i, diffs_1, diff, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = [];
                        _i = 0, diffs_1 = diffs;
                        _a.label = 1;
                    case 1:
                        if (!(_i < diffs_1.length)) return [3 /*break*/, 4];
                        diff = diffs_1[_i];
                        return [4 /*yield*/, this.applyDiff(diff)];
                    case 2:
                        result = _a.sent();
                        results.push(result);
                        // 如果某个操作失败，可以决定是否继续
                        if (!result.success) {
                            // 记录错误但继续执行其他文件
                            console.error("Failed to apply diff for ".concat(diff.filePath, ":"), result.error);
                        }
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, results];
                }
            });
        });
    };
    // ===== 私有方法 =====
    FileManager.prototype.resolvePath = function (filePath) {
        if (path.isAbsolute(filePath)) {
            return filePath;
        }
        return path.join(this.workspaceRoot, filePath);
    };
    FileManager.prototype.ensureDirectoryExists = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var dir;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dir = path.dirname(filePath);
                        return [4 /*yield*/, fs.mkdir(dir, { recursive: true })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    FileManager.prototype.readFileIfExists = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, fs.readFile(filePath, 'utf-8')];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, ''];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    FileManager.prototype.openFileInEditor = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var uri, document_1, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        uri = vscode.Uri.file(filePath);
                        return [4 /*yield*/, vscode.workspace.openTextDocument(uri)];
                    case 1:
                        document_1 = _a.sent();
                        return [4 /*yield*/, vscode.window.showTextDocument(document_1, { preview: false })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_11 = _a.sent();
                        console.warn('Failed to open file in editor:', error_11);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    FileManager.prototype.refreshFileInEditor = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var uri, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        uri = vscode.Uri.file(filePath);
                        return [4 /*yield*/, vscode.commands.executeCommand('workbench.action.files.revert', uri)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_12 = _a.sent();
                        console.warn('Failed to refresh file in editor:', error_12);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 简单的差异计算算法
     * 注：对于生产环境，应该使用更成熟的diff库
     */
    FileManager.prototype.calculateChanges = function (oldContent, newContent) {
        var changes = [];
        var oldLines = oldContent.split('\n');
        var newLines = newContent.split('\n');
        // 简单实现：逐行比较
        var maxLength = Math.max(oldLines.length, newLines.length);
        for (var i = 0; i < maxLength; i++) {
            var oldLine = oldLines[i] || '';
            var newLine = newLines[i] || '';
            if (oldLine === '' && newLine !== '') {
                // 新增行
                changes.push({
                    type: 'added',
                    newLineNumber: i + 1,
                    content: newLine
                });
            }
            else if (oldLine !== '' && newLine === '') {
                // 删除行
                changes.push({
                    type: 'removed',
                    oldLineNumber: i + 1,
                    content: oldLine
                });
            }
            else if (oldLine !== newLine) {
                // 修改行
                changes.push({
                    type: 'modified',
                    oldLineNumber: i + 1,
                    newLineNumber: i + 1,
                    content: newLine
                });
            }
        }
        // 如果新内容更长，添加剩余的新行
        for (var i = oldLines.length; i < newLines.length; i++) {
            changes.push({
                type: 'added',
                newLineNumber: i + 1,
                content: newLines[i]
            });
        }
        return changes;
    };
    FileManager.prototype.generateDiffSummary = function (oldContent, newContent) {
        var oldLines = oldContent.split('\n');
        var newLines = newContent.split('\n');
        var changes = this.calculateChanges(oldContent, newContent);
        var added = changes.filter(function (c) { return c.type === 'added'; }).length;
        var removed = changes.filter(function (c) { return c.type === 'removed'; }).length;
        var modified = changes.filter(function (c) { return c.type === 'modified'; }).length;
        var parts = [];
        if (added > 0)
            parts.push("".concat(added, " lines added"));
        if (removed > 0)
            parts.push("".concat(removed, " lines removed"));
        if (modified > 0)
            parts.push("".concat(modified, " lines modified"));
        if (parts.length === 0) {
            return 'No changes';
        }
        return parts.join(', ');
    };
    /**
     * 生成可读的差异显示（用于UI）
     */
    FileManager.prototype.generateReadableDiff = function (diff) {
        var lines = [];
        lines.push("File: ".concat(diff.filePath));
        lines.push("Summary: ".concat(diff.summary));
        lines.push('');
        for (var _i = 0, _a = diff.changes; _i < _a.length; _i++) {
            var change = _a[_i];
            var prefix = change.type === 'added' ? '+' :
                change.type === 'removed' ? '-' : '~';
            var lineInfo = change.type === 'added' ? " (line ".concat(change.newLineNumber, ")") :
                change.type === 'removed' ? " (line ".concat(change.oldLineNumber, ")") :
                    " (line ".concat(change.oldLineNumber, " \u2192 ").concat(change.newLineNumber, ")");
            lines.push("".concat(prefix).concat(lineInfo, ": ").concat(change.content));
        }
        return lines.join('\n');
    };
    /**
     * 生成HTML格式的差异显示（用于Webview）
     */
    FileManager.prototype.generateHtmlDiff = function (diff) {
        var lines = [];
        lines.push("<div class=\"diff-header\">");
        lines.push("  <h3>".concat(diff.filePath, "</h3>"));
        lines.push("  <div class=\"diff-summary\">".concat(diff.summary, "</div>"));
        lines.push("</div>");
        lines.push("<div class=\"diff-content\">");
        for (var _i = 0, _a = diff.changes; _i < _a.length; _i++) {
            var change = _a[_i];
            var className = change.type === 'added' ? 'diff-added' :
                change.type === 'removed' ? 'diff-removed' : 'diff-modified';
            var lineInfo = change.type === 'added' ? "Line ".concat(change.newLineNumber) :
                change.type === 'removed' ? "Line ".concat(change.oldLineNumber) :
                    "Line ".concat(change.oldLineNumber, " \u2192 ").concat(change.newLineNumber);
            lines.push("  <div class=\"diff-line ".concat(className, "\">"));
            lines.push("    <span class=\"diff-line-info\">".concat(lineInfo, ":</span>"));
            lines.push("    <span class=\"diff-line-content\">".concat(this.escapeHtml(change.content), "</span>"));
            lines.push("  </div>");
        }
        lines.push("</div>");
        return lines.join('\n');
    };
    FileManager.prototype.escapeHtml = function (text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };
    /**
     * 检查文件名是否匹配模式（支持简单通配符）
     */
    FileManager.prototype.matchesPattern = function (filename, pattern, caseSensitive) {
        if (caseSensitive === void 0) { caseSensitive = false; }
        var fn = filename;
        var pat = pattern;
        if (!caseSensitive) {
            fn = fn.toLowerCase();
            pat = pat.toLowerCase();
        }
        // 将通配符模式转换为正则表达式
        var regexPattern = pat
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
        var regex = new RegExp("^".concat(regexPattern, "$"));
        return regex.test(fn);
    };
    /**
     * 在文件内容中搜索文本
     */
    FileManager.prototype.searchInContent = function (content, searchText, caseSensitive) {
        if (caseSensitive === void 0) { caseSensitive = false; }
        var results = [];
        var lines = content.split('\n');
        var search = caseSensitive ? searchText : searchText.toLowerCase();
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var lineToSearch = caseSensitive ? line : line.toLowerCase();
            var startIndex = 0;
            while ((startIndex = lineToSearch.indexOf(search, startIndex)) !== -1) {
                results.push({
                    line: i + 1,
                    content: line,
                    startIndex: startIndex
                });
                startIndex += search.length;
                // 限制每行的匹配数量，避免性能问题
                if (results.length > 100)
                    break;
            }
            if (results.length > 100)
                break;
        }
        return results;
    };
    return FileManager;
}());
exports.FileManager = FileManager;
