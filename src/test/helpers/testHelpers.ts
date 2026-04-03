/**
 * CodeLine测试辅助工具库
 * 提供通用的测试功能和工具
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

/**
 * 测试环境管理类
 * 用于创建和管理临时测试目录
 */
export class TestEnvironment {
  private testDir: string = '';
  private originalCwd: string = '';
  
  /**
   * 创建临时测试目录
   * @param prefix 目录名前缀
   * @returns 创建的目录路径
   */
  async createTestDirectory(prefix: string = 'codeline-test'): Promise<string> {
    this.originalCwd = process.cwd();
    this.testDir = path.join(os.tmpdir(), `${prefix}-${Date.now()}`);
    await fs.mkdir(this.testDir, { recursive: true });
    process.chdir(this.testDir);
    return this.testDir;
  }
  
  /**
   * 获取当前测试目录路径
   */
  getTestDir(): string {
    return this.testDir;
  }
  
  /**
   * 清理测试环境
   */
  async cleanup(): Promise<void> {
    if (process.cwd() !== this.originalCwd) {
      process.chdir(this.originalCwd);
    }
    
    if (this.testDir) {
      try {
        await fs.rm(this.testDir, { recursive: true, force: true });
      } catch (error) {
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
  async createTestFile(filePath: string, content: string): Promise<string> {
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
  async createTestFiles(files: Array<{path: string, content: string}>): Promise<void> {
    for (const file of files) {
      await this.createTestFile(file.path, file.content);
    }
  }
  
  /**
   * 读取测试文件内容
   * @param filePath 文件相对路径
   */
  async readTestFile(filePath: string): Promise<string> {
    const fullPath = path.join(this.testDir, filePath);
    return await fs.readFile(fullPath, 'utf-8');
  }
  
  /**
   * 检查文件是否存在
   * @param filePath 文件相对路径
   */
  async fileExists(filePath: string): Promise<boolean> {
    const fullPath = path.join(this.testDir, filePath);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * 模拟数据生成器
 */
export class MockDataGenerator {
  /**
   * 生成随机字符串
   * @param length 字符串长度
   */
  static randomString(length: number = 10): string {
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
  static generateFileContent(lines: number = 5): string {
    const content: string[] = [];
    for (let i = 1; i <= lines; i++) {
      content.push(`Line ${i}: ${this.randomString(20)}`);
    }
    return content.join('\n');
  }
  
  /**
   * 生成Markdown测试内容
   */
  static generateMarkdownContent(): string {
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
  static generateJsonContent(entries: number = 3): string {
    const obj: Record<string, any> = {
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

/**
 * 断言辅助工具
 */
export class AssertHelpers {
  /**
   * 验证对象包含所有指定属性
   */
  static assertHasProperties(obj: any, properties: string[], message?: string): void {
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
  static assertArrayElements<T>(arr: T[], typeChecker: (item: T) => boolean, message?: string): void {
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
  static async assertThrowsAsync(fn: () => Promise<any>, errorPattern?: RegExp | string): Promise<void> {
    try {
      await fn();
      throw new AssertionError({
        message: 'Expected function to throw an error',
        expected: 'error',
        actual: 'no error thrown'
      });
    } catch (error: any) {
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

/**
 * 自定义断言错误类
 */
class AssertionError extends Error {
  constructor(options: { message: string, expected?: any, actual?: any }) {
    super(options.message);
    this.name = 'AssertionError';
    // 为了兼容Node.js的assert模块
    (this as any).expected = options.expected;
    (this as any).actual = options.actual;
  }
}

/**
 * 测试配置
 */
export const TestConfig = {
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
export async function createStandardTestEnvironment(): Promise<TestEnvironment> {
  const env = new TestEnvironment();
  await env.createTestDirectory();
  await env.createTestFiles(TestConfig.defaultTestFiles);
  return env;
}