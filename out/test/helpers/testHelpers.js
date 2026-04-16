"use strict";
/**
 * CodeLine测试辅助工具库
 * 提供通用的测试功能和工具
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestConfig = exports.AssertHelpers = exports.MockDataGenerator = exports.TestEnvironment = void 0;
exports.createStandardTestEnvironment = createStandardTestEnvironment;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
/**
 * 测试环境管理类
 * 用于创建和管理临时测试目录
 */
class TestEnvironment {
    testDir = '';
    originalCwd = '';
    /**
     * 创建临时测试目录
     * @param prefix 目录名前缀
     * @returns 创建的目录路径
     */
    async createTestDirectory(prefix = 'codeline-test') {
        this.originalCwd = process.cwd();
        this.testDir = path.join(os.tmpdir(), `${prefix}-${Date.now()}`);
        await fs.mkdir(this.testDir, { recursive: true });
        process.chdir(this.testDir);
        return this.testDir;
    }
    /**
     * 获取当前测试目录路径
     */
    getTestDir() {
        return this.testDir;
    }
    /**
     * 清理测试环境
     */
    async cleanup() {
        if (process.cwd() !== this.originalCwd) {
            process.chdir(this.originalCwd);
        }
        if (this.testDir) {
            try {
                await fs.rm(this.testDir, { recursive: true, force: true });
            }
            catch (error) {
                console.warn(`Failed to clean up test directory: ${error}`);
            }
        }
    }
    /**
     * 在测试目录中创建测试文件
     * @param filePath 文件相对路径
     * @param content 文件内容
     * @returns 文件的完整路径
     */
    async createTestFile(filePath, content) {
        const fullPath = path.join(this.testDir, filePath);
        const dir = path.dirname(fullPath);
        // 确保目录存在
        await fs.mkdir(dir, { recursive: true });
        // 写入文件
        await fs.writeFile(fullPath, content, 'utf-8');
        return fullPath;
    }
    /**
     * 创建一组测试文件
     * @param files 文件对象数组，每个包含path和content
     */
    async createTestFiles(files) {
        for (const file of files) {
            await this.createTestFile(file.path, file.content);
        }
    }
    /**
     * 读取测试文件内容
     * @param filePath 文件相对路径
     */
    async readTestFile(filePath) {
        const fullPath = path.join(this.testDir, filePath);
        return await fs.readFile(fullPath, 'utf-8');
    }
    /**
     * 检查文件是否存在
     * @param filePath 文件相对路径
     */
    async fileExists(filePath) {
        const fullPath = path.join(this.testDir, filePath);
        try {
            await fs.access(fullPath);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.TestEnvironment = TestEnvironment;
/**
 * 模拟数据生成器
 */
class MockDataGenerator {
    /**
     * 生成随机字符串
     * @param length 字符串长度
     */
    static randomString(length = 10) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    /**
     * 生成测试文件内容
     * @param lines 行数
     */
    static generateFileContent(lines = 5) {
        const content = [];
        for (let i = 1; i <= lines; i++) {
            content.push(`Line ${i}: ${this.randomString(20)}`);
        }
        return content.join('\n');
    }
    /**
     * 生成Markdown测试内容
     */
    static generateMarkdownContent() {
        return `# ${this.randomString(10)}

## Section 1
Content for section 1: ${this.randomString(30)}

### Subsection
- Item 1: ${this.randomString(15)}
- Item 2: ${this.randomString(15)}
- Item 3: ${this.randomString(15)}

## Section 2
More content here: ${this.randomString(40)}

\`\`\`javascript
// Code example
function ${this.randomString(8)}() {
  console.log("${this.randomString(20)}");
}
\`\`\``;
    }
    /**
     * 生成JSON测试内容
     */
    static generateJsonContent(entries = 3) {
        const obj = {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        };
        for (let i = 0; i < entries; i++) {
            obj[`key${i}`] = {
                id: i,
                name: this.randomString(8),
                value: Math.random() * 100
            };
        }
        return JSON.stringify(obj, null, 2);
    }
}
exports.MockDataGenerator = MockDataGenerator;
/**
 * 断言辅助工具
 */
class AssertHelpers {
    /**
     * 验证对象包含所有指定属性
     */
    static assertHasProperties(obj, properties, message) {
        for (const prop of properties) {
            if (!(prop in obj)) {
                throw new AssertionError({
                    message: message || `Object should have property '${prop}'`,
                    expected: prop,
                    actual: Object.keys(obj)
                });
            }
        }
    }
    /**
     * 验证数组包含特定类型的元素
     */
    static assertArrayElements(arr, typeChecker, message) {
        for (let i = 0; i < arr.length; i++) {
            if (!typeChecker(arr[i])) {
                throw new AssertionError({
                    message: message || `Array element at index ${i} does not match expected type`,
                    expected: 'matching type',
                    actual: arr[i]
                });
            }
        }
    }
    /**
     * 验证异步函数抛出错误
     */
    static async assertThrowsAsync(fn, errorPattern) {
        try {
            await fn();
            throw new AssertionError({
                message: 'Expected function to throw an error',
                expected: 'error',
                actual: 'no error thrown'
            });
        }
        catch (error) {
            if (errorPattern) {
                const errorMessage = error.message || error.toString();
                const pattern = typeof errorPattern === 'string' ? new RegExp(errorPattern) : errorPattern;
                if (!pattern.test(errorMessage)) {
                    throw new AssertionError({
                        message: `Error message '${errorMessage}' does not match pattern '${errorPattern}'`,
                        expected: errorPattern,
                        actual: errorMessage
                    });
                }
            }
        }
    }
}
exports.AssertHelpers = AssertHelpers;
/**
 * 自定义断言错误类
 */
class AssertionError extends Error {
    constructor(options) {
        super(options.message);
        this.name = 'AssertionError';
        // 为了兼容Node.js的assert模块
        this.expected = options.expected;
        this.actual = options.actual;
    }
}
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
async function createStandardTestEnvironment() {
    const env = new TestEnvironment();
    await env.createTestDirectory();
    await env.createTestFiles(exports.TestConfig.defaultTestFiles);
    return env;
}
//# sourceMappingURL=testHelpers.js.map