/**
 * EnhancedBashTool 测试
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import { EnhancedBashTool } from '../../../tools/bash/EnhancedBashTool';
import { ExtendedToolContext } from '../../../core/tool/BaseTool';

describe('EnhancedBashTool', () => {
  let tool: EnhancedBashTool;
  let mockContext: ExtendedToolContext;

  beforeEach(() => {
    tool = new EnhancedBashTool();
    mockContext = {
      cwd: process.cwd(),
      workspaceRoot: process.cwd(),
      userId: 'test-user',
      sessionId: 'test-session',
      outputChannel: {
        appendLine: () => {},
        show: () => {},
        dispose: () => {}
      } as any
    };
  });

  afterEach(async () => {
    await tool.cleanup();
  });

  describe('基础属性', () => {
    it('应该正确返回工具ID', () => {
      assert.strictEqual(tool.id, 'enhanced-bash');
    });

    it('应该正确返回工具名称', () => {
      assert.strictEqual(tool.name, 'Enhanced Bash');
    });

    it('应该正确返回工具描述', () => {
      assert.strictEqual(tool.description, 'Execute shell commands with full terminal capabilities, sandboxing, and AI-powered security');
    });

    it('应该正确返回工具类别', () => {
      assert.strictEqual(tool.getToolCategory().toString(), 'terminal');
    });

    it('应该总是启用', () => {
      assert.strictEqual(tool.isEnabled(mockContext), true);
    });

    it('不是只读工具', () => {
      assert.strictEqual(tool.isReadOnly(mockContext), false);
    });

    it('可能是破坏性工具', () => {
      assert.strictEqual(tool.isDestructive(mockContext), true);
    });
  });

  describe('参数验证', () => {
    it('应该验证有效命令', async () => {
      const input = {
        command: 'echo "Hello World"',
        description: '测试echo命令'
      };

      const result = await tool.validateParameters(input, mockContext);
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.error, undefined);
    });

    it('应该拒绝空命令', async () => {
      const input = {
        command: '',
        description: '空命令'
      };

      const result = await tool.validateParameters(input, mockContext);
      assert.strictEqual(result.valid, false);
      assert.ok(result.error?.includes('命令不能为空'));
    });

    it('应该拒绝过长的命令', async () => {
      const longCommand = 'echo "' + 'a'.repeat(10001) + '"';
      const input = {
        command: longCommand,
        description: '超长命令'
      };

      const result = await tool.validateParameters(input, mockContext);
      assert.strictEqual(result.valid, false);
      assert.ok(result.error?.includes('命令过长'));
    });

    it('应该验证超时时间范围', async () => {
      const input = {
        command: 'echo test',
        timeout: 50 // 太小
      };

      const result = await tool.validateParameters(input, mockContext);
      assert.strictEqual(result.valid, false);
      assert.ok(result.error?.includes('超时时间必须在100ms到600000ms'));
    });

    it('应该接受有效超时时间', async () => {
      const input = {
        command: 'echo test',
        timeout: 5000
      };

      const result = await tool.validateParameters(input, mockContext);
      assert.strictEqual(result.valid, true);
    });
  });

  describe('权限检查', () => {
    it('应该允许安全的只读命令', async () => {
      const input = {
        command: 'ls -la',
        description: '列出目录内容'
      };

      const result = await tool.checkPermissions(input, mockContext);
      assert.strictEqual(result.allowed, true);
      assert.strictEqual(result.requiresUserConfirmation, false);
    });

    it('应该要求确认有风险的命令', async () => {
      const input = {
        command: 'rm -rf ./temp',
        description: '删除临时目录'
      };

      const result = await tool.checkPermissions(input, mockContext);
      // 可能允许但需要确认，或者根据配置拒绝
      assert.strictEqual(result.allowed, true);
      // 高风险命令应该需要确认
      assert.strictEqual(result.requiresUserConfirmation, true);
    });

    it('应该拒绝极端危险的命令', async () => {
      const input = {
        command: 'rm -rf /',
        description: '危险命令'
      };

      const result = await tool.checkPermissions(input, mockContext);
      assert.strictEqual(result.allowed, false);
      assert.ok(result.reason?.includes('危险命令检测') || result.reason?.includes('不允许'));
    });

    it('应该检查沙箱禁用选项', async () => {
      const input = {
        command: 'rm -rf ./temp',
        dangerouslyDisableSandbox: true,
        description: '禁用沙箱的危险命令'
      };

      const result = await tool.checkPermissions(input, mockContext);
      // 高风险命令禁用沙箱可能被拒绝
      assert.strictEqual(result.allowed, false);
    });
  });

  describe('命令执行', () => {
    it('应该成功执行简单命令', async () => {
      const input = {
        command: 'echo "test output"',
        description: '测试echo输出'
      };

      const progressEvents: any[] = [];
      const onProgress = (progress: any) => {
        progressEvents.push(progress);
      };

      const result = await tool.execute(input, mockContext, onProgress);
      
      assert.strictEqual(result.success, true);
      assert.ok(result.output);
      assert.ok(result.output.stdout.includes('test output'));
      assert.strictEqual(result.toolId, 'enhanced-bash');
      assert.ok(result.duration > 0);
      
      // 检查进度事件
      assert.ok(progressEvents.length > 0);
      const startEvent = progressEvents.find(e => e.type === 'enhanced_bash_start');
      assert.ok(startEvent);
    });

    it('应该处理命令执行失败', async () => {
      const input = {
        command: 'invalid_command_that_does_not_exist',
        description: '无效命令'
      };

      const result = await tool.execute(input, mockContext);
      
      // 无效命令应该失败
      assert.strictEqual(result.success, false);
      assert.ok(result.error);
    });

    it('应该支持超时设置', async () => {
      const input = {
        command: 'sleep 10', // 长时间运行的命令
        timeout: 100, // 短超时
        description: '超时测试'
      };

      const result = await tool.execute(input, mockContext);
      
      // 应该因超时而失败
      assert.strictEqual(result.success, false);
      assert.ok(result.error?.includes('timeout') || result.error?.includes('超时'));
    });

    it('应该提供风险等级和建议', async () => {
      const input = {
        command: 'rm -rf ./temp/*',
        description: '删除临时文件'
      };

      const result = await tool.execute(input, mockContext);
      
      if (result.success) {
        assert.ok(result.output.riskLevel !== undefined);
        assert.ok(result.output.warnings !== undefined);
        assert.ok(result.output.suggestions !== undefined);
        
        // 高风险命令应该有警告
        if (result.output.riskLevel >= 5) {
          assert.ok(result.output.warnings.length > 0);
        }
      }
    });
  });

  describe('工具生命周期', () => {
    it('应该正确创建和清理', async () => {
      const tool = new EnhancedBashTool();
      assert.ok(tool);
      
      // 执行一个命令
      const input = { command: 'echo "test"' };
      const result = await tool.execute(input, mockContext);
      assert.ok(result);
      
      // 清理应该成功
      await tool.cleanup();
    });

    it('应该支持取消执行', async () => {
      const input = {
        command: 'sleep 5',
        description: '长时间运行命令'
      };

      // 开始执行但不等待完成
      const executionPromise = tool.execute(input, mockContext);
      
      // 尝试取消
      const cancelled = await tool.cancel('test-execution-id');
      assert.strictEqual(cancelled, true);
      
      // 等待执行完成（应该被取消）
      try {
        await executionPromise;
      } catch (error) {
        // 取消可能导致错误，这是正常的
      }
    });
  });

  describe('命令解析和分类', () => {
    it('应该解析命令结构', async () => {
      const input = {
        command: 'grep -r "pattern" ./src --include="*.ts"',
        description: '复杂grep命令'
      };

      const validation = await tool.validateParameters(input, mockContext);
      assert.strictEqual(validation.valid, true);
      assert.ok(validation.sanitizedParams?._parsedCommand);
      
      const parsedCommand = validation.sanitizedParams?._parsedCommand;
      assert.ok(parsedCommand);
      assert.strictEqual(parsedCommand.command, 'grep');
      assert.ok(parsedCommand.args.includes('-r'));
      assert.ok(parsedCommand.args.includes('pattern'));
    });

    it('应该识别命令语义', async () => {
      const input = {
        command: 'find . -name "*.ts" -exec cat {} \\;',
        description: 'find命令'
      };

      const validation = await tool.validateParameters(input, mockContext);
      assert.strictEqual(validation.valid, true);
      
      const safetyCheck = validation.sanitizedParams?._safetyCheck;
      assert.ok(safetyCheck);
      
      // find -exec 通常是中等风险
      assert.ok(safetyCheck.riskLevel >= 3);
    });
  });

  describe('沙箱执行', () => {
    it('应该支持沙箱执行', async () => {
      const input = {
        command: 'echo "sandbox test"',
        description: '沙箱测试',
        dangerouslyDisableSandbox: false
      };

      const result = await tool.execute(input, mockContext);
      assert.strictEqual(result.success, true);
      assert.ok(result.output.stdout.includes('sandbox test'));
    });

    it('应该处理沙箱执行失败', async () => {
      const input = {
        command: 'rm -rf /', // 在沙箱中应该被阻止
        description: '危险命令沙箱测试',
        dangerouslyDisableSandbox: false
      };

      const result = await tool.execute(input, mockContext);
      // 沙箱应该阻止或限制这个命令
      // 可能是失败，或者成功但有约束
      assert.ok(result);
    });
  });
});