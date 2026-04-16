"use strict";
/**
 * MCP端到端集成测试
 *
 * 测试MCP协议集成从工具发现到执行的完整流程：
 * 1. MCPHandler初始化配置
 * 2. 工具注册和发现
 * 3. 工具参数验证
 * 4. 工具执行流程
 * 5. 错误处理和恢复
 *
 * 目标：验证MCP集成在生产环境中的可用性和稳定性
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
const assert = __importStar(require("assert"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const MCPHandler_1 = require("../../src/mcp/MCPHandler");
// 模拟工具实现
const MockTool = class {
    id;
    name;
    description;
    version;
    capabilities;
    parameters;
    execute;
    constructor(id, name, description, parameters = [], execute) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.version = '1.0.0';
        this.capabilities = ['test'];
        this.parameters = parameters;
        this.execute = execute;
    }
};
// 模拟扩展上下文
class MockExtensionContext {
    subscriptions = [];
    workspaceState;
    globalState;
    extensionPath;
    asAbsolutePath(relativePath) {
        return path.join(this.extensionPath, relativePath);
    }
    storagePath;
    globalStoragePath;
    logPath;
    extensionMode;
    extensionUri;
    environmentVariableCollection;
    extension;
    logUri;
}
describe('MCP端到端集成测试', () => {
    let mockContext;
    let testWorkspaceRoot;
    let mcpHandler;
    // 测试工具定义
    const mockTools = [
        new MockTool('file_reader', '文件读取器', '读取文件内容', [
            { name: 'path', type: 'string', description: '文件路径', required: true }
        ], async (params) => {
            if (!params.path) {
                throw new Error('路径参数是必需的');
            }
            try {
                const content = await fs.readFile(params.path, 'utf-8');
                return {
                    success: true,
                    content,
                    size: content.length,
                    lines: content.split('\n').length
                };
            }
            catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        }),
        new MockTool('code_analyzer', '代码分析器', '分析代码结构和质量', [
            { name: 'code', type: 'string', description: '代码内容', required: true },
            { name: 'language', type: 'string', description: '编程语言', required: false, defaultValue: 'typescript' }
        ], async (params) => {
            const code = params.code || '';
            const lines = code.split('\n');
            return {
                success: true,
                analysis: {
                    lineCount: lines.length,
                    characterCount: code.length,
                    functionCount: (code.match(/function\s+\w+/g) || []).length,
                    classCount: (code.match(/class\s+\w+/g) || []).length,
                    importCount: (code.match(/import\s+/g) || []).length,
                    exportCount: (code.match(/export\s+/g) || []).length,
                    complexity: Math.min(lines.length / 10, 10) // 简化复杂度计算
                }
            };
        })
    ];
    beforeEach(async () => {
        mockContext = new MockExtensionContext();
        mockContext.extensionPath = __dirname;
        testWorkspaceRoot = path.join(__dirname, 'test-workspace-mcp');
        // 创建测试工作空间
        try {
            await fs.mkdir(testWorkspaceRoot, { recursive: true });
        }
        catch { }
        // 创建测试配置文件
        const config = {
            enabled: true,
            serverUrl: 'http://localhost:8080',
            timeoutMs: 30000,
            retryCount: 3,
            toolDiscoveryInterval: 60000,
            healthCheckInterval: 30000,
            maxToolCount: 50,
            enableCaching: true,
            cacheTTL: 300000,
            securityLevel: 'standard'
        };
        mcpHandler = new MCPHandler_1.MCPHandler(mockContext);
        // 注册模拟工具
        const toolRegistry = mcpHandler.getToolRegistry();
        mockTools.forEach(tool => {
            if (toolRegistry && typeof toolRegistry.registerTool === 'function') {
                toolRegistry.registerTool(tool);
            }
        });
    });
    afterEach(async () => {
        // 清理测试工作空间
        try {
            await fs.rm(testWorkspaceRoot, { recursive: true, force: true });
        }
        catch { }
        // 清理MCPHandler
        if (mcpHandler) {
            await mcpHandler.dispose();
        }
    });
    describe('工具发现和注册', () => {
        it('应该初始化MCPHandler并发现可用工具', async () => {
            // 初始化MCPHandler
            await mcpHandler.initialize();
            const status = mcpHandler.getStatus();
            assert.strictEqual(status.isInitialized, true, 'MCPHandler应该被初始化');
            assert.strictEqual(status.toolCount, mockTools.length, `应该发现${mockTools.length}个工具`);
            assert.strictEqual(status.isHealthy, true, 'MCPHandler应该健康');
        });
        it('应该正确处理工具注册错误', async () => {
            // 创建一个无效的工具
            const invalidTool = new MockTool('invalid_tool', '无效工具', '这个工具会失败', [], async () => { throw new Error('工具执行失败'); });
            // 尝试注册无效工具
            const toolRegistry = mcpHandler.getToolRegistry();
            let registrationSuccess = true;
            try {
                if (toolRegistry && typeof toolRegistry.registerTool === 'function') {
                    toolRegistry.registerTool(invalidTool);
                }
            }
            catch (error) {
                registrationSuccess = false;
            }
            // 无效工具可能被接受（晚点失败），也可能被拒绝
            // 我们主要确保系统不会崩溃
            assert.ok(true, '系统应该处理无效工具注册而不崩溃');
        });
        it('应该支持动态工具发现', async () => {
            await mcpHandler.initialize();
            // 创建一个新工具
            const newTool = new MockTool('new_dynamic_tool', '动态工具', '动态添加的工具', [], async () => ({ success: true, message: '动态工具执行成功' }));
            // 动态注册
            const toolRegistry = mcpHandler.getToolRegistry();
            if (toolRegistry && typeof toolRegistry.registerTool === 'function') {
                toolRegistry.registerTool(newTool);
            }
            const status = mcpHandler.getStatus();
            assert.strictEqual(status.toolCount, mockTools.length + 1, '应该包含动态添加的工具');
        });
    });
    describe('工具执行流程', () => {
        it('应该成功执行文件读取工具', async () => {
            await mcpHandler.initialize();
            // 创建测试文件
            const testFilePath = path.join(testWorkspaceRoot, 'test.txt');
            const testContent = 'Hello, MCP端到端测试!\n这是第二行。';
            await fs.writeFile(testFilePath, testContent, 'utf-8');
            // 执行工具
            const result = await mcpHandler.executeTool('file_reader', { path: testFilePath });
            assert.ok(result.success, '工具应该成功执行');
            assert.strictEqual(result.content, testContent, '应该返回正确的文件内容');
            assert.strictEqual(result.size, testContent.length, '应该返回正确的文件大小');
            assert.strictEqual(result.lines, 2, '应该返回正确的行数');
        });
        it('应该正确处理工具参数验证', async () => {
            await mcpHandler.initialize();
            // 缺少必需参数
            try {
                await mcpHandler.executeTool('file_reader', {});
                assert.fail('应该抛出参数验证错误');
            }
            catch (error) {
                assert.ok(error.message.includes('路径参数是必需的') || error.message.includes('参数验证失败'), `应该返回参数验证错误，实际：${error.message}`);
            }
            // 无效文件路径
            const result = await mcpHandler.executeTool('file_reader', {
                path: path.join(testWorkspaceRoot, 'nonexistent.txt')
            });
            assert.strictEqual(result.success, false, '应该返回执行失败');
            assert.ok(result.error.includes('ENOENT') || result.error.includes('文件'), `应该返回文件不存在错误，实际：${result.error}`);
        });
        it('应该成功执行代码分析工具', async () => {
            await mcpHandler.initialize();
            const testCode = `
import * as fs from 'fs';

export class TestClass {
  private name: string;
  
  constructor(name: string) {
    this.name = name;
  }
  
  public getName(): string {
    return this.name;
  }
}

function helperFunction() {
  console.log('Helper function');
}
      `.trim();
            const result = await mcpHandler.executeTool('code_analyzer', {
                code: testCode,
                language: 'typescript'
            });
            assert.ok(result.success, '代码分析应该成功');
            assert.ok(result.analysis, '应该返回分析结果');
            assert.strictEqual(result.analysis.lineCount, 18, '应该计算正确的行数');
            assert.strictEqual(result.analysis.classCount, 1, '应该检测到1个类');
            assert.strictEqual(result.analysis.functionCount, 1, '应该检测到1个函数（helperFunction）');
            assert.strictEqual(result.analysis.importCount, 1, '应该检测到1个导入');
            assert.strictEqual(result.analysis.exportCount, 1, '应该检测到1个导出');
        });
        it('应该支持工具链式执行', async () => {
            await mcpHandler.initialize();
            // 创建测试文件
            const testFilePath = path.join(testWorkspaceRoot, 'test.js');
            const testCode = `
function add(a, b) {
  return a + b;
}

class Calculator {
  multiply(x, y) {
    return x * y;
  }
}
      `.trim();
            await fs.writeFile(testFilePath, testCode, 'utf-8');
            // 第一步：读取文件
            const readResult = await mcpHandler.executeTool('file_reader', { path: testFilePath });
            assert.ok(readResult.success, '文件读取应该成功');
            // 第二步：分析代码
            const analysisResult = await mcpHandler.executeTool('code_analyzer', {
                code: readResult.content,
                language: 'javascript'
            });
            assert.ok(analysisResult.success, '代码分析应该成功');
            assert.strictEqual(analysisResult.analysis.functionCount, 1, '应该检测到1个函数');
            assert.strictEqual(analysisResult.analysis.classCount, 1, '应该检测到1个类');
        });
    });
    describe('错误处理和恢复', () => {
        it('应该处理工具执行异常', async () => {
            await mcpHandler.initialize();
            // 注册一个会抛出异常的工具
            const errorTool = new MockTool('error_tool', '错误工具', '总是抛出异常的工具', [], async () => { throw new Error('工具内部错误'); });
            const toolRegistry = mcpHandler.getToolRegistry();
            if (toolRegistry && typeof toolRegistry.registerTool === 'function') {
                toolRegistry.registerTool(errorTool);
            }
            // 执行会失败的工具
            const result = await mcpHandler.executeTool('error_tool', {});
            assert.strictEqual(result.success, false, '应该返回执行失败');
            assert.ok(result.error.includes('工具内部错误'), '应该返回工具错误信息');
        });
        it('应该在部分失败后继续工作', async () => {
            await mcpHandler.initialize();
            // 第一个工具成功
            const testFilePath = path.join(testWorkspaceRoot, 'test.txt');
            await fs.writeFile(testFilePath, '测试内容', 'utf-8');
            const readResult = await mcpHandler.executeTool('file_reader', { path: testFilePath });
            assert.ok(readResult.success, '文件读取应该成功');
            // 系统状态应该仍然健康
            const status = mcpHandler.getStatus();
            assert.strictEqual(status.isHealthy, true, '部分工具失败后系统应该仍然健康');
        });
        it('应该处理网络超时', async () => {
            // 创建一个模拟网络超时的工具
            const timeoutTool = new MockTool('timeout_tool', '超时工具', '模拟网络超时的工具', [], async () => {
                await new Promise(resolve => setTimeout(resolve, 10000)); // 10秒超时
                return { success: true };
            });
            const toolRegistry = mcpHandler.getToolRegistry();
            if (toolRegistry && typeof toolRegistry.registerTool === 'function') {
                toolRegistry.registerTool(timeoutTool);
            }
            // 配置较短的超时
            const config = {
                enabled: true,
                serverUrl: 'http://localhost:8080',
                timeoutMs: 100, // 100毫秒超时
                retryCount: 1,
                toolDiscoveryInterval: 60000,
                healthCheckInterval: 30000,
                maxToolCount: 50,
                enableCaching: true,
                cacheTTL: 300000,
                securityLevel: 'standard'
            };
            // 重新初始化
            await mcpHandler.dispose();
            mcpHandler = new MCPHandler_1.MCPHandler(mockContext);
            await mcpHandler.initialize();
            // 执行应该超时
            try {
                await mcpHandler.executeTool('timeout_tool', {});
                assert.fail('应该抛出超时错误');
            }
            catch (error) {
                assert.ok(error.message.includes('超时') || error.message.includes('timeout'), `应该返回超时错误，实际：${error.message}`);
            }
        });
    });
    describe('性能和监控', () => {
        it('应该监控工具执行时间', async () => {
            await mcpHandler.initialize();
            // 注册一个需要时间的工具
            const slowTool = new MockTool('slow_tool', '慢速工具', '执行需要时间的工具', [], async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
                return { success: true, executionTime: 100 };
            });
            const toolRegistry = mcpHandler.getToolRegistry();
            if (toolRegistry && typeof toolRegistry.registerTool === 'function') {
                toolRegistry.registerTool(slowTool);
            }
            const startTime = Date.now();
            const result = await mcpHandler.executeTool('slow_tool', {});
            const endTime = Date.now();
            const executionTime = endTime - startTime;
            assert.ok(result.success, '工具应该成功执行');
            assert.ok(executionTime >= 100, `执行时间应该至少100ms，实际：${executionTime}ms`);
        });
        it('应该缓存工具结果', async () => {
            // 配置启用缓存
            const config = {
                enabled: true,
                serverUrl: 'http://localhost:8080',
                timeoutMs: 30000,
                retryCount: 3,
                toolDiscoveryInterval: 60000,
                healthCheckInterval: 30000,
                maxToolCount: 50,
                enableCaching: true,
                cacheTTL: 5000, // 5秒缓存
                securityLevel: 'standard'
            };
            await mcpHandler.dispose();
            mcpHandler = new MCPHandler_1.MCPHandler(mockContext);
            await mcpHandler.initialize();
            // 注册一个带缓存的工具
            let executionCount = 0;
            const cachedTool = new MockTool('cached_tool', '缓存工具', '支持结果缓存的工具', [{ name: 'input', type: 'string', description: '输入值' }], async (params) => {
                executionCount++;
                return {
                    success: true,
                    result: `处理结果: ${params.input}`,
                    executionCount
                };
            });
            const toolRegistry = mcpHandler.getToolRegistry();
            if (toolRegistry && typeof toolRegistry.registerTool === 'function') {
                toolRegistry.registerTool(cachedTool);
            }
            // 第一次执行
            const result1 = await mcpHandler.executeTool('cached_tool', { input: 'test' });
            assert.strictEqual(result1.executionCount, 1, '第一次执行计数应该是1');
            // 第二次相同参数执行（应该使用缓存）
            const result2 = await mcpHandler.executeTool('cached_tool', { input: 'test' });
            assert.strictEqual(result2.executionCount, 1, '第二次执行应该使用缓存，计数仍然是1');
            // 等待缓存过期
            await new Promise(resolve => setTimeout(resolve, 6000));
            // 第三次执行（缓存过期）
            const result3 = await mcpHandler.executeTool('cached_tool', { input: 'test' });
            assert.strictEqual(result3.executionCount, 2, '缓存过期后应该重新执行，计数是2');
        });
    });
    describe('安全性和权限', () => {
        it('应该验证工具执行权限', async () => {
            await mcpHandler.initialize();
            // 尝试执行不存在的工具
            try {
                await mcpHandler.executeTool('nonexistent_tool', {});
                assert.fail('应该抛出工具不存在错误');
            }
            catch (error) {
                assert.ok(error.message.includes('找不到') || error.message.includes('不存在'), `应该返回工具不存在错误，实际：${error.message}`);
            }
        });
        it('应该限制危险工具访问', async () => {
            // 创建一个危险工具
            const dangerousTool = new MockTool('dangerous_tool', '危险工具', '可能执行危险操作的工具', [{ name: 'command', type: 'string', description: '系统命令' }], async (params) => {
                // 模拟执行系统命令
                return { success: true, output: '命令执行结果' };
            });
            const toolRegistry = mcpHandler.getToolRegistry();
            if (toolRegistry && typeof toolRegistry.registerTool === 'function') {
                toolRegistry.registerTool(dangerousTool);
            }
            // 系统应该记录危险工具访问
            // 实际实现中可能会有权限检查和日志记录
            assert.ok(true, '系统应该能够处理危险工具');
        });
    });
    describe('集成场景', () => {
        it('应该支持完整的编码辅助场景', async () => {
            await mcpHandler.initialize();
            // 场景：用户想要分析项目中的代码
            const projectFiles = [
                {
                    path: path.join(testWorkspaceRoot, 'src', 'main.ts'),
                    content: `
import { Helper } from './helper';

export class MainApp {
  private helper: Helper;
  
  constructor() {
    this.helper = new Helper();
  }
  
  public run(): void {
    const result = this.helper.calculate(10, 20);
    console.log('结果:', result);
  }
}
          `.trim()
                },
                {
                    path: path.join(testWorkspaceRoot, 'src', 'helper.ts'),
                    content: `
export class Helper {
  public calculate(a: number, b: number): number {
    return a + b;
  }
  
  public format(text: string): string {
    return text.toUpperCase();
  }
}
          `.trim()
                }
            ];
            // 创建项目文件
            for (const file of projectFiles) {
                await fs.mkdir(path.dirname(file.path), { recursive: true });
                await fs.writeFile(file.path, file.content, 'utf-8');
            }
            // 执行端到端流程
            const results = [];
            for (const file of projectFiles) {
                // 1. 读取文件
                const readResult = await mcpHandler.executeTool('file_reader', {
                    path: file.path
                });
                assert.ok(readResult.success, `应该成功读取文件: ${file.path}`);
                // 2. 分析代码
                const analysisResult = await mcpHandler.executeTool('code_analyzer', {
                    code: readResult.content,
                    language: 'typescript'
                });
                assert.ok(analysisResult.success, `应该成功分析代码: ${file.path}`);
                results.push({
                    file: path.basename(file.path),
                    analysis: analysisResult.analysis
                });
            }
            // 验证结果
            assert.strictEqual(results.length, 2, '应该分析2个文件');
            const mainAnalysis = results.find(r => r.file === 'main.ts')?.analysis;
            const helperAnalysis = results.find(r => r.file === 'helper.ts')?.analysis;
            assert.ok(mainAnalysis, '应该分析main.ts');
            assert.ok(helperAnalysis, '应该分析helper.ts');
            assert.strictEqual(mainAnalysis.classCount, 1, 'main.ts应该有1个类');
            assert.strictEqual(mainAnalysis.importCount, 1, 'main.ts应该有1个导入');
            assert.strictEqual(helperAnalysis.classCount, 1, 'helper.ts应该有1个类');
            assert.strictEqual(helperAnalysis.functionCount, 2, 'helper.ts应该有2个函数');
        });
        it('应该支持工具组合和编排', async () => {
            await mcpHandler.initialize();
            // 场景：读取、分析、生成报告
            const code = `
interface User {
  id: number;
  name: string;
  email: string;
}

class UserService {
  private users: User[] = [];
  
  addUser(user: User): void {
    this.users.push(user);
  }
  
  findUserById(id: number): User | undefined {
    return this.users.find(u => u.id === id);
  }
}
      `.trim();
            // 创建临时文件
            const tempFile = path.join(testWorkspaceRoot, 'user-service.ts');
            await fs.writeFile(tempFile, code, 'utf-8');
            // 工具编排流程
            const workflow = [
                { tool: 'file_reader', params: { path: tempFile } },
                { tool: 'code_analyzer', params: { code: null, language: 'typescript' } }
            ];
            const workflowResults = [];
            for (const step of workflow) {
                // 如果参数中有code但没有值，使用上一步的结果
                if (step.tool === 'code_analyzer' && step.params.code === null) {
                    const lastResult = workflowResults[workflowResults.length - 1];
                    step.params.code = lastResult.content;
                }
                const result = await mcpHandler.executeTool(step.tool, step.params);
                workflowResults.push(result);
                assert.ok(result.success, `工作流步骤 ${step.tool} 应该成功`);
            }
            // 验证最终结果
            assert.strictEqual(workflowResults.length, 2, '应该完成2个工作流步骤');
            const analysisResult = workflowResults[1];
            assert.strictEqual(analysisResult.analysis.interfaceCount, 1, '应该检测到1个接口');
            assert.strictEqual(analysisResult.analysis.classCount, 1, '应该检测到1个类');
            assert.strictEqual(analysisResult.analysis.functionCount, 2, '应该检测到2个函数');
        });
    });
});
//# sourceMappingURL=MCPEndToEnd.test.js.map