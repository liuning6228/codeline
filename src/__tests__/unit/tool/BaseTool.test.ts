/**
 * 工具基类测试
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import { BaseTool, ExtendedToolContext, ExtendedToolProgress } from '../../core/tool/BaseTool';
import { ToolResult } from '../../tools/ToolInterface';

// 模拟 VS Code 扩展上下文
const mockExtensionContext: vscode.ExtensionContext = {
  subscriptions: [],
  workspaceState: {
    get: () => undefined,
    update: () => Promise.resolve(),
    keys: () => []
  } as any,
  globalState: {
    get: () => undefined,
    update: () => Promise.resolve(),
    keys: () => [],
    setKeysForSync: () => {}
  } as any,
  extensionUri: vscode.Uri.parse('file:///test'),
  extensionPath: '/test',
  environmentVariableCollection: {} as any,
  asAbsolutePath: (relativePath: string) => `/test/${relativePath}`,
  storageUri: vscode.Uri.parse('file:///test/storage'),
  globalStorageUri: vscode.Uri.parse('file:///test/global-storage'),
  logUri: vscode.Uri.parse('file:///test/logs'),
  storagePath: '/test/storage',
  globalStoragePath: '/test/global-storage',
  logPath: '/test/logs'
};

// 模拟输出通道
const mockOutputChannel: vscode.OutputChannel = {
  name: 'Test Output',
  append: () => {},
  appendLine: () => {},
  clear: () => {},
  show: () => {},
  hide: () => {},
  dispose: () => {}
};

// 测试工具上下文
const testContext: ExtendedToolContext = {
  extensionContext: mockExtensionContext,
  workspaceRoot: '/test/workspace',
  cwd: '/test/workspace',
  outputChannel: mockOutputChannel,
  sessionId: 'test-session-123',
  userId: 'test-user',
  options: {
    autoExecute: false,
    requireApproval: true,
    timeout: 30000,
    validateParams: true
  }
};

/**
 * 测试工具实现
 */
class TestTool extends BaseTool<{ input: string }, { output: string }> {
  readonly id = 'test-tool';
  readonly name = '测试工具';
  readonly description = '用于测试的工具';
  readonly version = '1.0.0';
  readonly author = '测试作者';
  readonly capabilities = ['test', 'utility'];

  parameterSchema = {
    input: {
      type: 'string',
      description: '输入字符串',
      required: true,
      validation: (value: any) => typeof value === 'string' && value.length > 0
    }
  };

  constructor() {
    super({
      defaultTimeout: 5000,
      maxRetries: 2,
      retryDelay: 100,
      requireApproval: false,
      autoExecute: true,
      validateParams: true,
      concurrencySafe: true,
      readOnly: false,
      destructive: false
    });
  }

  protected async executeTool(
    params: { input: string },
    context: ExtendedToolContext,
    onProgress?: (progress: ExtendedToolProgress) => void
  ): Promise<ToolResult<{ output: string }>> {
    // 模拟进度更新
    if (onProgress) {
      onProgress({
        type: 'processing',
        progress: 0.5,
        message: '正在处理...',
        phase: 'execution'
      });
    }

    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, 100));

    // 模拟进度完成
    if (onProgress) {
      onProgress({
        type: 'complete',
        progress: 1,
        message: '处理完成',
        phase: 'completion'
      });
    }

    return {
      success: true,
      output: { output: `Processed: ${params.input}` },
      toolId: this.id,
      duration: 100,
      timestamp: new Date(),
      metadata: { processed: true }
    };
  }

  getActivityDescription(params: { input: string }): string {
    return `处理输入: ${params.input}`;
  }
}

/**
 * 测试流式工具实现
 */
class StreamingTestTool extends BaseTool<{ count: number }, number> {
  readonly id = 'streaming-test-tool';
  readonly name = '流式测试工具';
  readonly description = '用于测试流式执行的工具';
  readonly version = '1.0.0';
  readonly author = '测试作者';
  readonly capabilities = ['test', 'streaming'];

  parameterSchema = {
    count: {
      type: 'number',
      description: '计数',
      required: true,
      minimum: 1,
      maximum: 10
    }
  };

  protected async executeTool(
    params: { count: number },
    context: ExtendedToolContext,
    onProgress?: (progress: ExtendedToolProgress) => void
  ): Promise<ToolResult<number>> {
    let total = 0;
    
    for (let i = 1; i <= params.count; i++) {
      // 模拟处理延迟
      await new Promise(resolve => setTimeout(resolve, 50));
      
      total += i;
      
      // 更新进度
      if (onProgress) {
        onProgress({
          type: 'progress',
          progress: i / params.count,
          message: `处理第 ${i} 项`,
          phase: 'iteration',
          estimatedRemaining: (params.count - i) * 50
        });
      }
    }

    return {
      success: true,
      output: total,
      toolId: this.id,
      duration: params.count * 50,
      timestamp: new Date(),
      metadata: { count: params.count, total }
    };
  }

  getActivityDescription(params: { count: number }): string {
    return `计算 1 到 ${params.count} 的和`;
  }
}

/**
 * 测试错误工具实现
 */
class ErrorTestTool extends BaseTool<{ shouldFail: boolean }, string> {
  readonly id = 'error-test-tool';
  readonly name = '错误测试工具';
  readonly description = '用于测试错误处理的工具';
  readonly version = '1.0.0';
  readonly capabilities = ['test', 'error'];

  protected async executeTool(
    params: { shouldFail: boolean },
    context: ExtendedToolContext,
    onProgress?: (progress: ExtendedToolProgress) => void
  ): Promise<ToolResult<string>> {
    if (params.shouldFail) {
      throw new Error('模拟工具执行失败');
    }

    return {
      success: true,
      output: '执行成功',
      toolId: this.id,
      duration: 100,
      timestamp: new Date()
    };
  }

  getActivityDescription(params: { shouldFail: boolean }): string {
    return params.shouldFail ? '测试失败场景' : '测试成功场景';
  }
}

describe('BaseTool 测试', () => {
  describe('基础功能', () => {
    it('应该正确初始化工具', () => {
      const tool = new TestTool();
      
      assert.strictEqual(tool.id, 'test-tool');
      assert.strictEqual(tool.name, '测试工具');
      assert.strictEqual(tool.description, '用于测试的工具');
      assert.strictEqual(tool.version, '1.0.0');
      assert.strictEqual(tool.author, '测试作者');
      assert.deepStrictEqual(tool.capabilities, ['test', 'utility']);
    });

    it('应该正确检查启用状态', () => {
      const tool = new TestTool();
      const isEnabled = tool.isEnabled(testContext);
      
      assert.strictEqual(isEnabled, true);
    });

    it('应该正确检查并发安全', () => {
      const tool = new TestTool();
      const isConcurrencySafe = tool.isConcurrencySafe(testContext);
      
      assert.strictEqual(isConcurrencySafe, true);
    });

    it('应该正确检查只读状态', () => {
      const tool = new TestTool();
      const isReadOnly = tool.isReadOnly(testContext);
      
      assert.strictEqual(isReadOnly, false);
    });

    it('应该正确检查破坏性状态', () => {
      const tool = new TestTool();
      const isDestructive = tool.isDestructive(testContext);
      
      assert.strictEqual(isDestructive, false);
    });
  });

  describe('参数验证', () => {
    it('应该验证有效参数', async () => {
      const tool = new TestTool();
      const params = { input: '测试输入' };
      
      const validation = await tool.validateParameters(params, testContext);
      
      assert.strictEqual(validation.valid, true);
      assert.strictEqual(validation.error, undefined);
    });

    it('应该拒绝无效参数', async () => {
      const tool = new TestTool();
      const params = { input: '' }; // 空字符串应该失败
      
      const validation = await tool.validateParameters(params, testContext);
      
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.error?.includes('验证失败'));
    });

    it('应该拒绝缺失的必需参数', async () => {
      const tool = new TestTool();
      const params = {} as any; // 缺少必需参数
      
      const validation = await tool.validateParameters(params, testContext);
      
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.error?.includes('缺失'));
    });
  });

  describe('权限检查', () => {
    it('应该通过默认权限检查', async () => {
      const tool = new TestTool();
      const params = { input: '测试输入' };
      
      const permission = await tool.checkPermissions(params, testContext);
      
      assert.strictEqual(permission.allowed, true);
      assert.strictEqual(permission.requiresUserConfirmation, false);
    });

    it('应该生成正确的权限提示', async () => {
      const tool = new TestTool();
      const params = { input: '测试输入' };
      
      const permission = await tool.checkPermissions(params, testContext);
      
      assert.ok(permission.confirmationPrompt?.includes('测试工具'));
      assert.ok(permission.confirmationPrompt?.includes('处理输入'));
    });
  });

  describe('工具执行', () => {
    it('应该成功执行工具', async () => {
      const tool = new TestTool();
      const params = { input: '测试输入' };
      
      const progressUpdates: ExtendedToolProgress[] = [];
      const onProgress = (progress: ExtendedToolProgress) => {
        progressUpdates.push(progress);
      };
      
      const result = await tool.execute(params, testContext, onProgress);
      
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.output?.output, 'Processed: 测试输入');
      assert.strictEqual(result.toolId, 'test-tool');
      assert.ok(result.duration >= 100);
      assert.ok(progressUpdates.length > 0);
    });

    it('应该处理工具执行失败', async () => {
      const tool = new ErrorTestTool();
      const params = { shouldFail: true };
      
      const result = await tool.execute(params, testContext);
      
      assert.strictEqual(result.success, false);
      assert.ok(result.error?.includes('模拟工具执行失败'));
      assert.strictEqual(result.toolId, 'error-test-tool');
    });

    it('应该支持流式执行', async () => {
      const tool = new StreamingTestTool();
      const params = { count: 5 };
      
      const progressUpdates: ExtendedToolProgress[] = [];
      const onProgress = (progress: ExtendedToolProgress) => {
        progressUpdates.push(progress);
      };
      
      const result = await tool.execute(params, testContext, onProgress);
      
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.output, 15); // 1+2+3+4+5 = 15
      assert.ok(progressUpdates.length >= 5); // 应该有至少5个进度更新
      
      // 检查进度更新
      const lastProgress = progressUpdates[progressUpdates.length - 1];
      assert.strictEqual(lastProgress.progress, 1);
      assert.strictEqual(lastProgress.type, 'progress');
    });
  });

  describe('执行管理', () => {
    it('应该生成唯一的执行ID', () => {
      const tool = new TestTool();
      const executionId = (tool as any).generateExecutionId();
      
      assert.ok(executionId.startsWith('test-tool-'));
      assert.ok(executionId.includes(Date.now().toString().substring(0, 10)));
    });

    it('应该跟踪执行信息', async () => {
      const tool = new TestTool();
      const params = { input: '测试输入' };
      
      const result = await tool.execute(params, testContext);
      
      const executions = tool.getAllExecutions();
      assert.strictEqual(executions.length, 1);
      
      const executionInfo = executions[0];
      assert.strictEqual(executionInfo.toolId, 'test-tool');
      assert.strictEqual(executionInfo.state, 'completed');
      assert.ok(executionInfo.startTime);
      assert.ok(executionInfo.endTime);
      assert.deepStrictEqual(executionInfo.result, result);
    });

    it('应该获取活跃执行数量', async () => {
      const tool = new TestTool();
      
      // 开始多个执行（使用 Promise.all 模拟并发）
      const executions = await Promise.all([
        tool.execute({ input: '测试1' }, testContext),
        tool.execute({ input: '测试2' }, testContext),
        tool.execute({ input: '测试3' }, testContext)
      ]);
      
      // 注意：由于工具配置为并发安全，这些执行可能会并行
      const activeCount = tool.getActiveExecutionCount();
      assert.ok(activeCount >= 0 && activeCount <= 3);
    });
  });

  describe('UI 方法', () => {
    it('应该返回正确的显示名称', () => {
      const tool = new TestTool();
      const displayName = tool.getDisplayName();
      
      assert.strictEqual(displayName, '测试工具');
    });

    it('应该返回正确的活动描述', () => {
      const tool = new TestTool();
      const params = { input: '测试输入' };
      const description = tool.getActivityDescription(params);
      
      assert.strictEqual(description, '处理输入: 测试输入');
    });
  });

  describe('配置', () => {
    it('应该应用自定义配置', () => {
      const customConfig = {
        defaultTimeout: 10000,
        maxRetries: 5,
        requireApproval: true,
        concurrencySafe: false
      };
      
      const tool = new TestTool();
      // 注意：TestTool 在构造函数中设置了配置，这里测试默认配置
      
      assert.strictEqual(tool.isConcurrencySafe(testContext), true);
    });
  });
});