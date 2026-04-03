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
require("mocha");
var assert = require("assert");
var fs = require("fs/promises");
var path = require("path");
var os = require("os");
var fileManager_1 = require("../../file/fileManager");
describe('FileManager Tests', function () {
    var fileManager;
    var testDir;
    var originalCwd;
    // 设置测试环境
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // 创建临时测试目录
                    testDir = path.join(os.tmpdir(), "codeline-test-".concat(Date.now()));
                    return [4 /*yield*/, fs.mkdir(testDir, { recursive: true })];
                case 1:
                    _a.sent();
                    // 创建一些测试文件
                    return [4 /*yield*/, fs.writeFile(path.join(testDir, 'test1.txt'), 'Hello, World!\nThis is test file 1.\nThird line.')];
                case 2:
                    // 创建一些测试文件
                    _a.sent();
                    return [4 /*yield*/, fs.writeFile(path.join(testDir, 'test2.md'), '# Markdown Test\n\nThis is a markdown file.\n\n## Section\nContent here.')];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, fs.mkdir(path.join(testDir, 'subdir'), { recursive: true })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, fs.writeFile(path.join(testDir, 'subdir', 'nested.txt'), 'Nested file content.')];
                case 5:
                    _a.sent();
                    // 初始化 FileManager
                    fileManager = new fileManager_1.FileManager(testDir);
                    // 保存原始工作目录
                    originalCwd = process.cwd();
                    process.chdir(testDir);
                    return [2 /*return*/];
            }
        });
    }); });
    // 清理测试环境
    afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // 恢复工作目录
                    process.chdir(originalCwd);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs.rm(testDir, { recursive: true, force: true })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.warn("Failed to clean up test directory: ".concat(error_1));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    it('FileManager should be created and functional', function () { return __awaiter(void 0, void 0, void 0, function () {
        var listResult, hasTestFile;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    assert.ok(fileManager, 'FileManager should be instantiated');
                    return [4 /*yield*/, fileManager.listDirectory('.')];
                case 1:
                    listResult = _a.sent();
                    assert.ok(Array.isArray(listResult.files), 'Should be able to list files');
                    hasTestFile = listResult.files.some(function (file) { return file.name === 'test1.txt'; });
                    assert.ok(hasTestFile, 'Should find test1.txt in the test directory');
                    return [2 /*return*/];
            }
        });
    }); });
    it('listDirectory should list files and directories', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result, files, firstFile, directoryIndex, fileIndex;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fileManager.listDirectory('.')];
                case 1:
                    result = _a.sent();
                    assert.ok(result, 'Result should exist');
                    assert.ok(Array.isArray(result.files), 'files should be an array');
                    assert.ok(typeof result.directories === 'number', 'directories should be a number');
                    assert.ok(typeof result.filesCount === 'number', 'filesCount should be a number');
                    assert.ok(typeof result.totalSize === 'number', 'totalSize should be a number');
                    files = result.files;
                    assert.ok(files.length >= 3, "Should list at least 3 items, got ".concat(files.length));
                    firstFile = files[0];
                    assert.ok('name' in firstFile, 'File should have name property');
                    assert.ok('path' in firstFile, 'File should have path property');
                    assert.ok('type' in firstFile, 'File should have type property');
                    assert.ok('size' in firstFile, 'File should have size property');
                    assert.ok('modified' in firstFile, 'File should have modified property');
                    directoryIndex = files.findIndex(function (f) { return f.type === 'directory'; });
                    fileIndex = files.findIndex(function (f) { return f.type === 'file'; });
                    if (directoryIndex !== -1 && fileIndex !== -1) {
                        assert.ok(directoryIndex < fileIndex, 'Directories should come before files');
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    it('fileExists should check file existence', function () { return __awaiter(void 0, void 0, void 0, function () {
        var exists, notExists;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fileManager.fileExists('test1.txt')];
                case 1:
                    exists = _a.sent();
                    assert.strictEqual(exists, true, 'test1.txt should exist');
                    return [4 /*yield*/, fileManager.fileExists('nonexistent.txt')];
                case 2:
                    notExists = _a.sent();
                    assert.strictEqual(notExists, false, 'nonexistent.txt should not exist');
                    return [2 /*return*/];
            }
        });
    }); });
    it('readFile should read file content', function () { return __awaiter(void 0, void 0, void 0, function () {
        var content;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fileManager.readFile('test1.txt')];
                case 1:
                    content = _a.sent();
                    assert.ok(typeof content === 'string', 'Content should be a string');
                    assert.ok(content.includes('Hello, World!'), 'Content should contain expected text');
                    assert.ok(content.includes('This is test file 1.'), 'Content should contain expected text');
                    return [2 /*return*/];
            }
        });
    }); });
    it('readFile should throw error for non-existent file', function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fileManager.readFile('nonexistent.txt')];
                case 1:
                    _a.sent();
                    assert.fail('Should have thrown an error');
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    assert.ok(error_2 instanceof Error, 'Should throw an Error');
                    assert.ok(error_2.message.includes('not exist') || error_2.message.includes('ENOENT'), "Error message should indicate file doesn't exist: ".concat(error_2.message));
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    it('getFileInfo should return file information', function () { return __awaiter(void 0, void 0, void 0, function () {
        var info;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fileManager.getFileInfo('test1.txt')];
                case 1:
                    info = _a.sent();
                    assert.ok(info, 'File info should exist');
                    assert.strictEqual(info.exists, true, 'File should exist');
                    assert.ok(info.size > 0, 'File size should be positive');
                    assert.ok(info.lines > 0, 'File should have lines');
                    assert.ok(info.modified instanceof Date, 'modified should be a Date');
                    return [2 /*return*/];
            }
        });
    }); });
    it('createFile should create new file with diff', function () { return __awaiter(void 0, void 0, void 0, function () {
        var filePath, content, result, fileContent, diff;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    filePath = 'newfile.txt';
                    content = 'New file content\nSecond line\nThird line';
                    return [4 /*yield*/, fileManager.createFile(filePath, content)];
                case 1:
                    result = _a.sent();
                    assert.strictEqual(result.success, true, 'File creation should succeed');
                    assert.strictEqual(result.filePath, filePath, 'Should return correct file path');
                    assert.ok(result.message, 'Should have a message');
                    assert.ok(result.diff, 'Should include diff information');
                    return [4 /*yield*/, fs.readFile(path.join(testDir, filePath), 'utf-8')];
                case 2:
                    fileContent = _a.sent();
                    assert.strictEqual(fileContent, content, 'File content should match');
                    diff = result.diff;
                    assert.strictEqual(diff.filePath, filePath, 'Diff should reference correct file path');
                    assert.strictEqual(diff.oldContent, '', 'Old content should be empty for new file');
                    assert.strictEqual(diff.newContent, content, 'New content should match');
                    assert.ok(Array.isArray(diff.changes), 'Changes should be an array');
                    assert.ok(diff.summary, 'Summary should exist');
                    return [2 /*return*/];
            }
        });
    }); });
    it('editFileWithDiff should modify existing file with diff', function () { return __awaiter(void 0, void 0, void 0, function () {
        var filePath, originalContent, newContent, result, updatedContent, diff;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    filePath = 'test1.txt';
                    return [4 /*yield*/, fs.readFile(path.join(testDir, filePath), 'utf-8')];
                case 1:
                    originalContent = _a.sent();
                    newContent = originalContent + '\nAdded line for edit test.';
                    return [4 /*yield*/, fileManager.editFileWithDiff(filePath, newContent)];
                case 2:
                    result = _a.sent();
                    assert.strictEqual(result.success, true, 'File edit should succeed');
                    assert.strictEqual(result.filePath, filePath, 'Should return correct file path');
                    assert.ok(result.diff, 'Should include diff information');
                    return [4 /*yield*/, fs.readFile(path.join(testDir, filePath), 'utf-8')];
                case 3:
                    updatedContent = _a.sent();
                    assert.strictEqual(updatedContent, newContent, 'File content should be updated');
                    diff = result.diff;
                    assert.strictEqual(diff.oldContent, originalContent, 'Diff should contain original content');
                    assert.strictEqual(diff.newContent, newContent, 'Diff should contain new content');
                    assert.ok(diff.changes.length > 0, 'Should have changes recorded');
                    return [2 /*return*/];
            }
        });
    }); });
    it('deleteFile should remove file with diff', function () { return __awaiter(void 0, void 0, void 0, function () {
        var filePath, originalContent, result, error_3, diff;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    filePath = 'test2.md';
                    return [4 /*yield*/, fs.readFile(path.join(testDir, filePath), 'utf-8')];
                case 1:
                    originalContent = _a.sent();
                    return [4 /*yield*/, fileManager.deleteFile(filePath)];
                case 2:
                    result = _a.sent();
                    assert.strictEqual(result.success, true, 'File deletion should succeed');
                    assert.strictEqual(result.filePath, filePath, 'Should return correct file path');
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, fs.access(path.join(testDir, filePath))];
                case 4:
                    _a.sent();
                    assert.fail('File should have been deleted');
                    return [3 /*break*/, 6];
                case 5:
                    error_3 = _a.sent();
                    assert.ok(error_3.code === 'ENOENT', 'File should not exist after deletion');
                    return [3 /*break*/, 6];
                case 6:
                    diff = result.diff;
                    assert.strictEqual(diff.oldContent, originalContent, 'Diff should contain original content');
                    assert.strictEqual(diff.newContent, '', 'New content should be empty for deletion');
                    return [2 /*return*/];
            }
        });
    }); });
    it('searchFiles should find files by pattern', function () { return __awaiter(void 0, void 0, void 0, function () {
        var results, firstResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fileManager.searchFiles({
                        pattern: '*.txt',
                        recursive: true
                    })];
                case 1:
                    results = _a.sent();
                    assert.ok(Array.isArray(results), 'Results should be an array');
                    assert.ok(results.length >= 2, 'Should find at least 2 .txt files (test1.txt, subdir/nested.txt)');
                    firstResult = results[0];
                    assert.ok('path' in firstResult, 'Result should have path property');
                    assert.ok('name' in firstResult, 'Result should have name property');
                    assert.ok('matches' in firstResult, 'Result should have matches property');
                    assert.ok(Array.isArray(firstResult.matches), 'matches should be an array');
                    return [2 /*return*/];
            }
        });
    }); });
    it('searchFiles should find files by content', function () { return __awaiter(void 0, void 0, void 0, function () {
        var results, result, firstMatch;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fileManager.searchFiles({
                        content: 'World',
                        recursive: true,
                        caseSensitive: false
                    })];
                case 1:
                    results = _a.sent();
                    assert.ok(Array.isArray(results), 'Results should be an array');
                    assert.ok(results.length >= 1, 'Should find at least 1 file containing "World"');
                    result = results[0];
                    assert.ok(result.matches.length > 0, 'Should have matches for content search');
                    firstMatch = result.matches[0];
                    assert.ok('line' in firstMatch, 'Match should have line number');
                    assert.ok('content' in firstMatch, 'Match should have content');
                    assert.ok('startIndex' in firstMatch, 'Match should have startIndex');
                    return [2 /*return*/];
            }
        });
    }); });
    it('getWorkspaceStats should return statistics', function () { return __awaiter(void 0, void 0, void 0, function () {
        var stats, txtStats;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fileManager.getWorkspaceStats()];
                case 1:
                    stats = _a.sent();
                    assert.ok(stats, 'Stats should exist');
                    assert.ok(typeof stats.totalFiles === 'number', 'totalFiles should be a number');
                    assert.ok(typeof stats.totalSize === 'number', 'totalSize should be a number');
                    assert.ok(typeof stats.totalLines === 'number', 'totalLines should be a number');
                    assert.ok(typeof stats.byExtension === 'object', 'byExtension should be an object');
                    assert.ok(typeof stats.byType === 'object', 'byType should be an object');
                    // 验证基本计数
                    // 注意：当前getWorkspaceStats实现只统计顶级目录，不递归子目录
                    // 所以只统计2个文件（test1.txt, test2.md），不包括subdir/nested.txt
                    assert.ok(stats.totalFiles >= 2, "Should count at least 2 files (top-level only), got ".concat(stats.totalFiles));
                    assert.ok(stats.totalLines >= 5, "Should count at least 5 lines, got ".concat(stats.totalLines));
                    assert.ok(stats.totalSize > 0, 'Total size should be positive');
                    txtStats = stats.byExtension['.txt'];
                    if (txtStats) {
                        assert.ok(txtStats.count > 0, 'Should have .txt files');
                        assert.ok(txtStats.lines > 0, 'Should have lines in .txt files');
                        assert.ok(txtStats.size > 0, 'Should have size for .txt files');
                    }
                    // 验证类型统计
                    assert.ok(stats.byType['file'] >= 2, "Should have at least 2 files (top-level), got ".concat(stats.byType['file']));
                    assert.ok(stats.byType['directory'] >= 1, "Should have at least 1 directory, got ".concat(stats.byType['directory']));
                    return [2 /*return*/];
            }
        });
    }); });
    it('renameFile should rename/move file', function () { return __awaiter(void 0, void 0, void 0, function () {
        var oldPath, newPath, originalContent, result, oldExists, newExists, newContent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    oldPath = 'test1.txt';
                    newPath = 'renamed.txt';
                    return [4 /*yield*/, fs.readFile(path.join(testDir, oldPath), 'utf-8')];
                case 1:
                    originalContent = _a.sent();
                    return [4 /*yield*/, fileManager.renameFile(oldPath, newPath)];
                case 2:
                    result = _a.sent();
                    assert.strictEqual(result.success, true, 'Rename should succeed');
                    assert.strictEqual(result.filePath, newPath, 'Should return new file path');
                    return [4 /*yield*/, fileManager.fileExists(oldPath)];
                case 3:
                    oldExists = _a.sent();
                    assert.strictEqual(oldExists, false, 'Old file should not exist');
                    return [4 /*yield*/, fileManager.fileExists(newPath)];
                case 4:
                    newExists = _a.sent();
                    assert.strictEqual(newExists, true, 'New file should exist');
                    return [4 /*yield*/, fs.readFile(path.join(testDir, newPath), 'utf-8')];
                case 5:
                    newContent = _a.sent();
                    assert.strictEqual(newContent, originalContent, 'Content should be preserved');
                    return [2 /*return*/];
            }
        });
    }); });
    it('copyFile should copy file', function () { return __awaiter(void 0, void 0, void 0, function () {
        var sourcePath, destPath, originalContent, result, sourceExists, destExists, destContent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sourcePath = 'test2.md';
                    destPath = 'copy.md';
                    return [4 /*yield*/, fs.readFile(path.join(testDir, sourcePath), 'utf-8')];
                case 1:
                    originalContent = _a.sent();
                    return [4 /*yield*/, fileManager.copyFile(sourcePath, destPath)];
                case 2:
                    result = _a.sent();
                    assert.strictEqual(result.success, true, 'Copy should succeed');
                    assert.strictEqual(result.filePath, destPath, 'Should return destination file path');
                    return [4 /*yield*/, fileManager.fileExists(sourcePath)];
                case 3:
                    sourceExists = _a.sent();
                    assert.strictEqual(sourceExists, true, 'Source file should still exist');
                    return [4 /*yield*/, fileManager.fileExists(destPath)];
                case 4:
                    destExists = _a.sent();
                    assert.strictEqual(destExists, true, 'Destination file should exist');
                    return [4 /*yield*/, fs.readFile(path.join(testDir, destPath), 'utf-8')];
                case 5:
                    destContent = _a.sent();
                    assert.strictEqual(destContent, originalContent, 'Content should be identical');
                    return [2 /*return*/];
            }
        });
    }); });
    it('createDirectory should create directory', function () { return __awaiter(void 0, void 0, void 0, function () {
        var dirPath, result, dirExists;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dirPath = 'newdir';
                    return [4 /*yield*/, fileManager.createDirectory(dirPath)];
                case 1:
                    result = _a.sent();
                    assert.strictEqual(result.success, true, 'Directory creation should succeed');
                    assert.strictEqual(result.filePath, dirPath, 'Should return directory path');
                    return [4 /*yield*/, fs.access(path.join(testDir, dirPath))
                            .then(function () { return true; })
                            .catch(function () { return false; })];
                case 2:
                    dirExists = _a.sent();
                    assert.strictEqual(dirExists, true, 'Directory should exist');
                    return [2 /*return*/];
            }
        });
    }); });
    it('deleteDirectory should recursively delete directory', function () { return __awaiter(void 0, void 0, void 0, function () {
        var dirPath, dirExists, result, stillExists;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dirPath = 'subdir';
                    return [4 /*yield*/, fs.access(path.join(testDir, dirPath))
                            .then(function () { return true; })
                            .catch(function () { return false; })];
                case 1:
                    dirExists = _a.sent();
                    assert.strictEqual(dirExists, true, 'Directory should exist before deletion');
                    return [4 /*yield*/, fileManager.deleteDirectory(dirPath)];
                case 2:
                    result = _a.sent();
                    assert.strictEqual(result.success, true, 'Directory deletion should succeed');
                    assert.strictEqual(result.filePath, dirPath, 'Should return directory path');
                    return [4 /*yield*/, fs.access(path.join(testDir, dirPath))
                            .then(function () { return true; })
                            .catch(function () { return false; })];
                case 3:
                    stillExists = _a.sent();
                    assert.strictEqual(stillExists, false, 'Directory should not exist after deletion');
                    return [2 /*return*/];
            }
        });
    }); });
    it('generateReadableDiff should generate readable diff', function () { return __awaiter(void 0, void 0, void 0, function () {
        var oldContent, newContent, filePath, result, diff, readableDiff;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    oldContent = 'Line 1\nLine 2\nLine 3';
                    newContent = 'Line 1\nLine 2 modified\nLine 3\nLine 4 added';
                    filePath = 'diff_test.txt';
                    return [4 /*yield*/, fs.writeFile(path.join(testDir, filePath), oldContent)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, fileManager.editFileWithDiff(filePath, newContent)];
                case 2:
                    result = _a.sent();
                    assert.ok(result.diff, 'Should have diff');
                    diff = result.diff;
                    readableDiff = fileManager.generateReadableDiff(diff);
                    assert.ok(typeof readableDiff === 'string', 'Readable diff should be a string');
                    assert.ok(readableDiff.includes('Line'), 'Diff should contain line information');
                    assert.ok(readableDiff.includes('+') || readableDiff.includes('-'), 'Diff should contain change markers');
                    return [2 /*return*/];
            }
        });
    }); });
    it('generateHtmlDiff should generate HTML diff', function () { return __awaiter(void 0, void 0, void 0, function () {
        var oldContent, newContent, filePath, result, diff, htmlDiff;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    oldContent = 'Line 1\nLine 2\nLine 3';
                    newContent = 'Line 1\nLine 2 modified\nLine 3\nLine 4 added';
                    filePath = 'html_diff_test.txt';
                    return [4 /*yield*/, fs.writeFile(path.join(testDir, filePath), oldContent)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, fileManager.editFileWithDiff(filePath, newContent)];
                case 2:
                    result = _a.sent();
                    assert.ok(result.diff, 'Should have diff');
                    diff = result.diff;
                    htmlDiff = fileManager.generateHtmlDiff(diff);
                    assert.ok(typeof htmlDiff === 'string', 'HTML diff should be a string');
                    assert.ok(htmlDiff.includes('<div'), 'HTML diff should contain HTML elements');
                    assert.ok(htmlDiff.includes('class="'), 'HTML diff should contain CSS classes');
                    assert.ok(htmlDiff.includes('diff-line'), 'HTML diff should contain diff-line class');
                    return [2 /*return*/];
            }
        });
    }); });
    // 边缘情况测试
    it('should handle empty directory', function () { return __awaiter(void 0, void 0, void 0, function () {
        var emptyDir, emptyFileManager, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    emptyDir = path.join(testDir, 'emptydir');
                    return [4 /*yield*/, fs.mkdir(emptyDir, { recursive: true })];
                case 1:
                    _a.sent();
                    emptyFileManager = new fileManager_1.FileManager(emptyDir);
                    return [4 /*yield*/, emptyFileManager.listDirectory('.')];
                case 2:
                    result = _a.sent();
                    assert.strictEqual(result.files.length, 0, 'Empty directory should have no files');
                    assert.strictEqual(result.directories, 0, 'Empty directory should have no subdirectories');
                    assert.strictEqual(result.filesCount, 0, 'filesCount should be 0');
                    assert.strictEqual(result.totalSize, 0, 'totalSize should be 0');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle non-existent file operations gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fileManager.deleteFile('non-existent-file.txt')];
                case 1:
                    result = _a.sent();
                    assert.strictEqual(result.success, false, 'Deleting non-existent file should fail');
                    assert.ok(result.error, 'Should have error message');
                    assert.ok(result.message, 'Should have user-friendly message');
                    return [2 /*return*/];
            }
        });
    }); });
});
