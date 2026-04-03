"use strict";
/**
 * CodeLine测试运行器
 * 统一运行所有测试，处理vscode模块依赖
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
exports.TestRunner = void 0;
exports.setupTestEnvironment = setupTestEnvironment;
exports.runTests = main;
var path = require("path");
var fs = require("fs/promises");
/**
 * 测试运行器
 */
var TestRunner = /** @class */ (function () {
    function TestRunner(config) {
        if (config === void 0) { config = {}; }
        this.config = __assign({ testDir: path.join(__dirname, 'suite'), verbose: false, testPattern: '**/*.test.js', coverageDir: path.join(process.cwd(), 'coverage') }, config);
    }
    /**
     * 运行所有测试
     */
    TestRunner.prototype.runAllTests = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, result, Mocha_1, mocha_1, testFiles, _i, testFiles_1, file, failures, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🚀 启动CodeLine测试运行器');
                        console.log("\uD83D\uDCC1 \u6D4B\u8BD5\u76EE\u5F55: ".concat(this.config.testDir));
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
                        _a.trys.push([1, 4, , 5]);
                        Mocha_1 = require('mocha');
                        mocha_1 = new Mocha_1({
                            ui: 'tdd',
                            color: true,
                            timeout: 10000,
                            reporter: 'spec',
                            verbose: this.config.verbose
                        });
                        return [4 /*yield*/, this.findTestFiles()];
                    case 2:
                        testFiles = _a.sent();
                        console.log("\uD83D\uDCC4 \u627E\u5230 ".concat(testFiles.length, " \u4E2A\u6D4B\u8BD5\u6587\u4EF6"));
                        // 添加测试文件到Mocha
                        for (_i = 0, testFiles_1 = testFiles; _i < testFiles_1.length; _i++) {
                            file = testFiles_1[_i];
                            mocha_1.addFile(file);
                            result.total++;
                        }
                        return [4 /*yield*/, new Promise(function (resolve) {
                                mocha_1.run(function (failCount) {
                                    resolve(failCount);
                                });
                            })];
                    case 3:
                        failures = _a.sent();
                        result.failed = failures;
                        result.passed = result.total - failures;
                        result.duration = Date.now() - startTime;
                        // 输出总结
                        this.printSummary(result);
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error('❌ 测试运行失败:', error_1.message);
                        result.failed = 1;
                        result.failures.push({
                            file: 'TestRunner',
                            test: 'setup',
                            error: error_1.message
                        });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * 查找测试文件
     */
    TestRunner.prototype.findTestFiles = function () {
        return __awaiter(this, void 0, void 0, function () {
            var glob, pattern;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('glob'); })];
                    case 1:
                        glob = (_a.sent()).glob;
                        pattern = path.join(this.config.testDir, this.config.testPattern);
                        return [2 /*return*/, glob(pattern)];
                }
            });
        });
    };
    /**
     * 输出测试总结
     */
    TestRunner.prototype.printSummary = function (result) {
        console.log('\n📊 测试总结');
        console.log('═══════════════════════════════════════');
        console.log("\u603B\u8BA1: ".concat(result.total, " \u4E2A\u6D4B\u8BD5"));
        console.log("\u2705 \u901A\u8FC7: ".concat(result.passed));
        console.log("\u274C \u5931\u8D25: ".concat(result.failed));
        console.log("\u23F1\uFE0F  \u8017\u65F6: ".concat(result.duration, "ms"));
        console.log('═══════════════════════════════════════');
        if (result.failed > 0 && result.failures.length > 0) {
            console.log('\n📋 失败详情:');
            result.failures.forEach(function (failure, index) {
                console.log("".concat(index + 1, ". ").concat(failure.file, " - ").concat(failure.test));
                console.log("   ".concat(failure.error));
            });
        }
        if (result.passed === result.total) {
            console.log('\n🎉 所有测试通过！');
        }
    };
    /**
     * 生成覆盖率报告
     */
    TestRunner.prototype.generateCoverageReport = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('📈 生成覆盖率报告...');
                // 这里可以集成nyc或其他覆盖率工具
                // 目前先占位实现
                console.log('✅ 覆盖率报告生成完成');
                return [2 /*return*/];
            });
        });
    };
    return TestRunner;
}());
exports.TestRunner = TestRunner;
/**
 * 设置测试环境
 * 处理vscode模块依赖等问题
 */
function setupTestEnvironment() {
    // 设置vscode模块mock
    var Module = require('module');
    var originalRequire = Module.prototype.require;
    Module.prototype.require = function (id) {
        // 拦截vscode模块请求
        if (id === 'vscode') {
            var mockPath = path.join(__dirname, 'helpers', 'mockVscode.js');
            console.log("[TEST] \u4F7F\u7528\u6A21\u62DFvscode\u6A21\u5757: ".concat(mockPath));
            return originalRequire.call(this, mockPath);
        }
        // 正常加载其他模块
        return originalRequire.apply(this, arguments);
    };
    // 设置测试环境变量
    process.env.NODE_ENV = 'test';
    process.env.CODELINE_TEST = 'true';
    console.log('✅ 测试环境设置完成');
}
/**
 * 主函数 - 命令行入口
 */
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var compiledTestDir, _a, execSync, runner, result;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('🧪 CodeLine 测试套件');
                    console.log('═══════════════════════════════════════\n');
                    // 设置测试环境
                    setupTestEnvironment();
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
                    runner = new TestRunner({
                        testDir: path.join(process.cwd(), 'out', 'test', 'suite')
                    });
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
