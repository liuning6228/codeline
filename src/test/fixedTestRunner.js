"use strict";
/**
 * 修复的测试运行器
 * 使用子进程运行Mocha，避免全局变量和模块注入问题
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
exports.FixedTestRunner = void 0;
var path = require("path");
var child_process_1 = require("child_process");
var fs = require("fs/promises");
/**
 * 修复的测试运行器
 */
var FixedTestRunner = /** @class */ (function () {
    function FixedTestRunner(testDir) {
        this.testDir = testDir || path.join(process.cwd(), 'out', 'test', 'suite');
    }
    /**
     * 运行所有测试
     */
    FixedTestRunner.prototype.runAllTests = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, result, testFiles, passed, failed, failures, _i, testFiles_1, file, fileResult, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🚀 启动修复的测试运行器');
                        console.log("\uD83D\uDCC1 \u6D4B\u8BD5\u76EE\u5F55: ".concat(this.testDir));
                        startTime = Date.now();
                        result = {
                            total: 0,
                            passed: 0,
                            failed: 0,
                            duration: 0,
                            failures: []
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        return [4 /*yield*/, this.findTestFiles()];
                    case 2:
                        testFiles = _a.sent();
                        console.log("\uD83D\uDCC4 \u627E\u5230 ".concat(testFiles.length, " \u4E2A\u6D4B\u8BD5\u6587\u4EF6"));
                        result.total = testFiles.length;
                        passed = 0;
                        failed = 0;
                        failures = [];
                        _i = 0, testFiles_1 = testFiles;
                        _a.label = 3;
                    case 3:
                        if (!(_i < testFiles_1.length)) return [3 /*break*/, 6];
                        file = testFiles_1[_i];
                        return [4 /*yield*/, this.runTestFile(file)];
                    case 4:
                        fileResult = _a.sent();
                        if (fileResult.passed) {
                            passed++;
                        }
                        else {
                            failed++;
                            failures.push.apply(failures, fileResult.failures);
                        }
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6:
                        result.passed = passed;
                        result.failed = failed;
                        result.failures = failures;
                        result.duration = Date.now() - startTime;
                        // 输出总结
                        this.printSummary(result);
                        return [3 /*break*/, 8];
                    case 7:
                        error_1 = _a.sent();
                        console.error('❌ 测试运行失败:', error_1.message);
                        result.failed = 1;
                        result.failures.push({
                            file: 'TestRunner',
                            test: 'setup',
                            error: error_1.message
                        });
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * 运行单个测试文件
     */
    FixedTestRunner.prototype.runTestFile = function (testFile) {
        return __awaiter(this, void 0, void 0, function () {
            var setupScript;
            return __generator(this, function (_a) {
                console.log("\n\u25B6\uFE0F  \u8FD0\u884C\u6D4B\u8BD5: ".concat(path.basename(testFile)));
                setupScript = path.join(process.cwd(), 'src', 'test', 'setupTestEnv.js');
                return [2 /*return*/, new Promise(function (resolve) {
                        var _a, _b;
                        // 创建子进程运行Mocha
                        var mochaProcess = (0, child_process_1.spawn)('npx', [
                            'mocha',
                            '--ui', 'tdd',
                            '--timeout', '10000',
                            '--reporter', 'spec',
                            '--require', setupScript,
                            testFile
                        ], {
                            stdio: ['inherit', 'pipe', 'pipe'],
                            env: __assign(__assign({}, process.env), { NODE_ENV: 'test', CODELINE_TEST: 'true' })
                        });
                        var stdout = '';
                        var stderr = '';
                        (_a = mochaProcess.stdout) === null || _a === void 0 ? void 0 : _a.on('data', function (data) {
                            var output = data.toString();
                            stdout += output;
                            process.stdout.write(output);
                        });
                        (_b = mochaProcess.stderr) === null || _b === void 0 ? void 0 : _b.on('data', function (data) {
                            var output = data.toString();
                            stderr += output;
                            process.stderr.write(output);
                        });
                        mochaProcess.on('close', function (code) {
                            var passed = code === 0;
                            var result = {
                                file: testFile,
                                passed: passed,
                                failures: []
                            };
                            if (!passed) {
                                result.failures.push({
                                    file: testFile,
                                    test: 'all',
                                    error: "\u9000\u51FA\u7801: ".concat(code, "\n").concat(stderr)
                                });
                            }
                            resolve(result);
                        });
                        mochaProcess.on('error', function (error) {
                            console.error("\u274C \u65E0\u6CD5\u542F\u52A8\u6D4B\u8BD5\u8FDB\u7A0B: ".concat(error.message));
                            resolve({
                                file: testFile,
                                passed: false,
                                failures: [{
                                        file: testFile,
                                        test: 'process',
                                        error: error.message
                                    }]
                            });
                        });
                    })];
            });
        });
    };
    /**
     * 查找测试文件
     */
    FixedTestRunner.prototype.findTestFiles = function () {
        return __awaiter(this, void 0, void 0, function () {
            var files, entries, _i, entries_1, entry, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        files = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs.readdir(this.testDir, { withFileTypes: true })];
                    case 2:
                        entries = _a.sent();
                        for (_i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                            entry = entries_1[_i];
                            if (entry.isFile() && entry.name.endsWith('.test.js')) {
                                files.push(path.join(this.testDir, entry.name));
                            }
                        }
                        // 按文件名排序，确保一致的执行顺序
                        files.sort();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.error("\u274C \u65E0\u6CD5\u8BFB\u53D6\u6D4B\u8BD5\u76EE\u5F55 ".concat(this.testDir, ":"), error_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, files];
                }
            });
        });
    };
    /**
     * 输出测试总结
     */
    FixedTestRunner.prototype.printSummary = function (result) {
        console.log('\n📊 测试总结');
        console.log('═══════════════════════════════════════');
        console.log("\u603B\u8BA1: ".concat(result.total, " \u4E2A\u6D4B\u8BD5\u6587\u4EF6"));
        console.log("\u2705 \u901A\u8FC7: ".concat(result.passed));
        console.log("\u274C \u5931\u8D25: ".concat(result.failed));
        console.log("\u23F1\uFE0F  \u8017\u65F6: ".concat(result.duration, "ms"));
        console.log('═══════════════════════════════════════');
        if (result.failed > 0 && result.failures.length > 0) {
            console.log('\n📋 失败详情:');
            result.failures.forEach(function (failure, index) {
                console.log("".concat(index + 1, ". ").concat(path.basename(failure.file), " - ").concat(failure.test));
                if (failure.error) {
                    console.log("   ".concat(failure.error.substring(0, 200)).concat(failure.error.length > 200 ? '...' : ''));
                }
            });
        }
        if (result.passed === result.total) {
            console.log('\n🎉 所有测试通过！');
        }
    };
    return FixedTestRunner;
}());
exports.FixedTestRunner = FixedTestRunner;
/**
 * 主函数
 */
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var compiledTestDir, _a, execSync, runner, result;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('🧪 CodeLine 修复测试运行器');
                    console.log('═══════════════════════════════════════\n');
                    compiledTestDir = path.join(process.cwd(), 'out', 'test', 'suite');
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs.access(compiledTestDir)];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    console.log('⚠️  编译的测试文件不存在，需要先运行 npm run compile');
                    console.log('正在运行编译...');
                    execSync = require('child_process').execSync;
                    execSync('npm run compile', { stdio: 'inherit' });
                    return [3 /*break*/, 4];
                case 4:
                    runner = new FixedTestRunner();
                    return [4 /*yield*/, runner.runAllTests()];
                case 5:
                    result = _b.sent();
                    // 根据测试结果退出
                    process.exit(result.failed > 0 ? 1 : 0);
                    return [2 /*return*/];
            }
        });
    });
}
// 如果是直接运行此脚本
if (require.main === module) {
    main().catch(function (error) {
        console.error('❌ 测试运行失败:', error);
        process.exit(1);
    });
}
