/**
 * CodeLine测试辅助工具库
 * 提供通用的测试功能和工具
 */
/**
 * 测试环境管理类
 * 用于创建和管理临时测试目录
 */
export declare class TestEnvironment {
    private testDir;
    private originalCwd;
    /**
     * 创建临时测试目录
     * @param prefix 目录名前缀
     * @returns 创建的目录路径
     */
    createTestDirectory(prefix?: string): Promise<string>;
    /**
     * 获取当前测试目录路径
     */
    getTestDir(): string;
    /**
     * 清理测试环境
     */
    cleanup(): Promise<void>;
    /**
     * 在测试目录中创建测试文件
     * @param filePath 文件相对路径
     * @param content 文件内容
     * @returns 文件的完整路径
     */
    createTestFile(filePath: string, content: string): Promise<string>;
    /**
     * 创建一组测试文件
     * @param files 文件对象数组，每个包含path和content
     */
    createTestFiles(files: Array<{
        path: string;
        content: string;
    }>): Promise<void>;
    /**
     * 读取测试文件内容
     * @param filePath 文件相对路径
     */
    readTestFile(filePath: string): Promise<string>;
    /**
     * 检查文件是否存在
     * @param filePath 文件相对路径
     */
    fileExists(filePath: string): Promise<boolean>;
}
/**
 * 模拟数据生成器
 */
export declare class MockDataGenerator {
    /**
     * 生成随机字符串
     * @param length 字符串长度
     */
    static randomString(length?: number): string;
    /**
     * 生成测试文件内容
     * @param lines 行数
     */
    static generateFileContent(lines?: number): string;
    /**
     * 生成Markdown测试内容
     */
    static generateMarkdownContent(): string;
    /**
     * 生成JSON测试内容
     */
    static generateJsonContent(entries?: number): string;
}
/**
 * 断言辅助工具
 */
export declare class AssertHelpers {
    /**
     * 验证对象包含所有指定属性
     */
    static assertHasProperties(obj: any, properties: string[], message?: string): void;
    /**
     * 验证数组包含特定类型的元素
     */
    static assertArrayElements<T>(arr: T[], typeChecker: (item: T) => boolean, message?: string): void;
    /**
     * 验证异步函数抛出错误
     */
    static assertThrowsAsync(fn: () => Promise<any>, errorPattern?: RegExp | string): Promise<void>;
}
/**
 * 测试配置
 */
export declare const TestConfig: {
    timeout: number;
    tempDirPrefix: string;
    defaultTestFiles: {
        path: string;
        content: string;
    }[];
};
/**
 * 创建预设的测试环境
 */
export declare function createStandardTestEnvironment(): Promise<TestEnvironment>;
//# sourceMappingURL=testHelpers.d.ts.map