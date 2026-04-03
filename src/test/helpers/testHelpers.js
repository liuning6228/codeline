"use strict";
/**
 * CodeLine测试辅助工具库
 * 提供通用的测试功能和工具
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.TestConfig = exports.AssertHelpers = exports.MockDataGenerator = exports.TestEnvironment = void 0;
exports.createStandardTestEnvironment = createStandardTestEnvironment;
var fs = require("fs/promises");
var path = require("path");
var os = require("os");
/**
 * 测试环境管理类
 * 用于创建和管理临时测试目录
 */
var TestEnvironment = /** @class */ (function () {
    function TestEnvironment() {
        this.testDir = '';
        this.originalCwd = '';
    }
    /**
     * 创建临时测试目录
     * @param prefix 目录名前缀
     * @returns 创建的目录路径
     */
    TestEnvironment.prototype.createTestDirectory = function () {
        return __awaiter(this, arguments, void 0, function (prefix) {
            if (prefix === void 0) { prefix = 'codeline-test'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.originalCwd = process.cwd();
                        this.testDir = path.join(os.tmpdir(), "".concat(prefix, "-").concat(Date.now()));
                        return [4 /*yield*/, fs.mkdir(this.testDir, { recursive: true })];
                    case 1:
                        _a.sent();
                        process.chdir(this.testDir);
                        return [2 /*return*/, this.testDir];
                }
            });
        });
    };
    /**
     * 获取当前测试目录路径
     */
    TestEnvironment.prototype.getTestDir = function () {
        return this.testDir;
    };
    /**
     * 清理测试环境
     */
    TestEnvironment.prototype.cleanup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (process.cwd() !== this.originalCwd) {
                            process.chdir(this.originalCwd);
                        }
                        if (!this.testDir) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs.rm(this.testDir, { recursive: true, force: true })];
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
        });
    };
    /**
     * 在测试目录中创建测试文件
     * @param filePath 文件相对路径
     * @param content 文件内容
     * @returns 文件的完整路径
     */
    TestEnvironment.prototype.createTestFile = function (filePath, content) {
        return __awaiter(this, void 0, void 0, function () {
            var fullPath, dir;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fullPath = path.join(this.testDir, filePath);
                        dir = path.dirname(fullPath);
                        // 确保目录存在
                        return [4 /*yield*/, fs.mkdir(dir, { recursive: true })];
                    case 1:
                        // 确保目录存在
                        _a.sent();
                        // 写入文件
                        return [4 /*yield*/, fs.writeFile(fullPath, content, 'utf-8')];
                    case 2:
                        // 写入文件
                        _a.sent();
                        return [2 /*return*/, fullPath];
                }
            });
        });
    };
    /**
     * 创建一组测试文件
     * @param files 文件对象数组，每个包含path和content
     */
    TestEnvironment.prototype.createTestFiles = function (files) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, files_1, file;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _i = 0, files_1 = files;
                        _a.label = 1;
                    case 1:
                        if (!(_i < files_1.length)) return [3 /*break*/, 4];
                        file = files_1[_i];
                        return [4 /*yield*/, this.createTestFile(file.path, file.content)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 读取测试文件内容
     * @param filePath 文件相对路径
     */
    TestEnvironment.prototype.readTestFile = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var fullPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fullPath = path.join(this.testDir, filePath);
                        return [4 /*yield*/, fs.readFile(fullPath, 'utf-8')];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 检查文件是否存在
     * @param filePath 文件相对路径
     */
    TestEnvironment.prototype.fileExists = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var fullPath, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        fullPath = path.join(this.testDir, filePath);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs.access(fullPath)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, true];
                    case 3:
                        _a = _b.sent();
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return TestEnvironment;
}());
exports.TestEnvironment = TestEnvironment;
/**
 * 模拟数据生成器
 */
var MockDataGenerator = /** @class */ (function () {
    function MockDataGenerator() {
    }
    /**
     * 生成随机字符串
     * @param length 字符串长度
     */
    MockDataGenerator.randomString = function (length) {
        if (length === void 0) { length = 10; }
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var result = '';
        for (var i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };
    /**
     * 生成测试文件内容
     * @param lines 行数
     */
    MockDataGenerator.generateFileContent = function (lines) {
        if (lines === void 0) { lines = 5; }
        var content = [];
        for (var i = 1; i <= lines; i++) {
            content.push("Line ".concat(i, ": ").concat(this.randomString(20)));
        }
        return content.join('\n');
    };
    /**
     * 生成Markdown测试内容
     */
    MockDataGenerator.generateMarkdownContent = function () {
        return "# ".concat(this.randomString(10), "\n\n## Section 1\nContent for section 1: ").concat(this.randomString(30), "\n\n### Subsection\n- Item 1: ").concat(this.randomString(15), "\n- Item 2: ").concat(this.randomString(15), "\n- Item 3: ").concat(this.randomString(15), "\n\n## Section 2\nMore content here: ").concat(this.randomString(40), "\n\n```javascript\n// Code example\nfunction ").concat(this.randomString(8), "() {\n  console.log(\"").concat(this.randomString(20), "\");\n}\n```");
    };
    /**
     * 生成JSON测试内容
     */
    MockDataGenerator.generateJsonContent = function (entries) {
        if (entries === void 0) { entries = 3; }
        var obj = {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        };
        for (var i = 0; i < entries; i++) {
            obj["key".concat(i)] = {
                id: i,
                name: this.randomString(8),
                value: Math.random() * 100
            };
        }
        return JSON.stringify(obj, null, 2);
    };
    return MockDataGenerator;
}());
exports.MockDataGenerator = MockDataGenerator;
/**
 * 断言辅助工具
 */
var AssertHelpers = /** @class */ (function () {
    function AssertHelpers() {
    }
    /**
     * 验证对象包含所有指定属性
     */
    AssertHelpers.assertHasProperties = function (obj, properties, message) {
        for (var _i = 0, properties_1 = properties; _i < properties_1.length; _i++) {
            var prop = properties_1[_i];
            if (!(prop in obj)) {
                throw new AssertionError({
                    message: message || "Object should have property '".concat(prop, "'"),
                    expected: prop,
                    actual: Object.keys(obj)
                });
            }
        }
    };
    /**
     * 验证数组包含特定类型的元素
     */
    AssertHelpers.assertArrayElements = function (arr, typeChecker, message) {
        for (var i = 0; i < arr.length; i++) {
            if (!typeChecker(arr[i])) {
                throw new AssertionError({
                    message: message || "Array element at index ".concat(i, " does not match expected type"),
                    expected: 'matching type',
                    actual: arr[i]
                });
            }
        }
    };
    /**
     * 验证异步函数抛出错误
     */
    AssertHelpers.assertThrowsAsync = function (fn, errorPattern) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2, errorMessage, pattern;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, fn()];
                    case 1:
                        _a.sent();
                        throw new AssertionError({
                            message: 'Expected function to throw an error',
                            expected: 'error',
                            actual: 'no error thrown'
                        });
                    case 2:
                        error_2 = _a.sent();
                        if (errorPattern) {
                            errorMessage = error_2.message || error_2.toString();
                            pattern = typeof errorPattern === 'string' ? new RegExp(errorPattern) : errorPattern;
                            if (!pattern.test(errorMessage)) {
                                throw new AssertionError({
                                    message: "Error message '".concat(errorMessage, "' does not match pattern '").concat(errorPattern, "'"),
                                    expected: errorPattern,
                                    actual: errorMessage
                                });
                            }
                        }
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return AssertHelpers;
}());
exports.AssertHelpers = AssertHelpers;
/**
 * 自定义断言错误类
 */
var AssertionError = /** @class */ (function (_super) {
    __extends(AssertionError, _super);
    function AssertionError(options) {
        var _this = _super.call(this, options.message) || this;
        _this.name = 'AssertionError';
        // 为了兼容Node.js的assert模块
        _this.expected = options.expected;
        _this.actual = options.actual;
        return _this;
    }
    return AssertionError;
}(Error));
/**
 * 测试配置
 */
exports.TestConfig = {
    // 测试超时时间（毫秒）
    timeout: 10000,
    // 临时目录前缀
    tempDirPrefix: 'codeline-test',
    // 默认测试文件设置
    defaultTestFiles: [
        { path: 'test1.txt', content: 'Hello, World!\nThis is test file 1.\nThird line.' },
        { path: 'test2.md', content: '# Markdown Test\n\nThis is a markdown file.\n\n## Section\nContent here.' },
        { path: 'subdir/nested.txt', content: 'Nested file content.' }
    ]
};
/**
 * 创建预设的测试环境
 */
function createStandardTestEnvironment() {
    return __awaiter(this, void 0, void 0, function () {
        var env;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    env = new TestEnvironment();
                    return [4 /*yield*/, env.createTestDirectory()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, env.createTestFiles(exports.TestConfig.defaultTestFiles)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, env];
            }
        });
    });
}
