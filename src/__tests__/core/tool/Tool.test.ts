/**
 * 核心工具测试
 * 测试Tool抽象基类和相关功能
 */

import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { z } from 'zod';
import {
  Tool,
  ToolCategory,
  ToolCapabilities,
  ToolUseContext,
  PermissionResult,
  ValidationResult,
  buildTool,
  ToolUseError,
  PermissionDeniedError,
  ValidationError
} from '../../../src/core/tool/Tool';
import {
  createTestToolContext,
  MockOutputChannel,
  assertToolSuccess,
  assertToolFailure
} from '../../../src/test/setupTestEnv.test';

// ==================== 测试工具实现 ====================

/**
 * 测试工具：简单的echo工具
 */
class EchoTool extends Tool<{ message: string }, string> {
  readonly id = 'test.echo';
  readonly name = 'Echo Tool';
  readonly description = 'Echo a message back';
  readonly category = ToolCategory.OTHER;
  readonly version = '1.0.0';
  readonly author = 'Test';
  
  readonly inputSchema = z.object({
    message: z.string().min(1).max(100)
  });
  
  readonly capabilities: ToolCapabilities = {
    isConcurrencySafe: true,
    isReadOnly: true,
    isDestructive: false,
    requiresWorkspace: false,
    supportsStreaming: true
  };
  
  isEnabled(context: ToolUseContext): boolean {
    return true;
  }
  
  isConcurrencySafe(input: { message: string }, context: ToolUseContext): boolean {
    return true;
  }
  
  async checkPermissions(input: { message: string }, context: ToolUseContext): Promise<PermissionResult> {
    // 检查消息是否包含敏感词
    if (input.message.toLowerCase().includes('secret')) {
      return {
        allowed: false,
        requiresConfirmation: false,
        reason: 'Message contains sensitive content'
      };
    }
    
    return {
      allowed: true,
      requiresConfirmation: false
    };
  }
  
  async validateParameters(input: { message: string }, context: ToolUseContext): Promise<ValidationResult> {
    if (input.message.length > 50) {
      return {
        valid: false,
        errors: ['Message too long (max 50 characters)']
      };
    }
    
    return { valid: true };
  }
  
  async execute(input: { message: string }, context: ToolUseContext): Promise<string> {
    // 模拟一些处理时间
    await new Promise(resolve => setTimeout(resolve, 10));
    return `Echo: ${input.message}`;
  }
  
  getDisplayName(input?: { message: string }): string {
    return input ? `Echo: ${input.message.substring(0, 20)}...` : 'Echo Tool';
  }
  
  getActivityDescription(input: { message: string }): string {
    return `Echo message: "${input.message}"`;
  }
}

/**
 * 测试工具：需要权限确认的工具
 */
class ConfirmTool extends Tool<{ action: string }, string> {
  readonly id = 'test.confirm';
  readonly name = 'Confirm Tool';
  readonly description = 'Tool that requires confirmation';
  readonly category = ToolCategory.OTHER;
  readonly version = '1.0.0';
  readonly author = 'Test';
  
  readonly inputSchema = z.object({
    action: z.enum(['read', 'write', 'delete'])
  });
  
  readonly capabilities: ToolCapabilities = {
    isConcurrencySafe: false,
    isReadOnly: false,
    isDestructive: true,
    requiresWorkspace: true,
    supportsStreaming: false
  };
  
  isEnabled(context: ToolUseContext): boolean {
    return context.workspaceRoot !== '/disabled';
  }
  
  isConcurrencySafe(input: { action: string }, context: ToolUseContext): boolean {
    return input.action === 'read';
  }
  
  async checkPermissions(input: { action: string }, context: ToolUseContext): Promise<PermissionResult> {
    if (input.action === 'delete') {
      return {
        allowed: true,
        requiresConfirmation: true,
        reason: 'Delete action requires confirmation'
      };
    }
    
    return {
      allowed: true,
      requiresConfirmation: false
    };
  }
  
  async validateParameters(input: { action: string }, context: ToolUseContext): Promise<ValidationResult> {
    return { valid: true };
  }
  
  async execute(input: { action: string }, context: ToolUseContext): Promise<string> {
    return `Action performed: ${input.action}`;
  }
}

/**
 * 测试工具：会失败的工具
 */
class FailingTool extends Tool<{ shouldFail: boolean }, string> {
  readonly id = 'test.failing';
  readonly name = 'Failing Tool';
  readonly description = 'Tool that can fail';
  readonly category = ToolCategory.OTHER;
  readonly version = '1.0.0';
  readonly author = 'Test';
  
  readonly inputSchema = z.object({
    shouldFail: z.boolean()
  });
  
  readonly capabilities: ToolCapabilities = {
    isConcurrencySafe: true,
    isReadOnly: true,
    isDestructive: false,
    requiresWorkspace: false,
    supportsStreaming: false
  };
  
  isEnabled(context: ToolUseContext): boolean {
    return true;
  }
  
  isConcurrencySafe(input: { shouldFail: boolean }, context: ToolUseContext): boolean {
    return true;
  }
  
  async checkPermissions(input: { shouldFail: boolean }, context: ToolUseContext): Promise<PermissionResult> {
    return {
      allowed: true,
      requiresConfirmation: false
    };
  }
  
  async validateParameters(input: { shouldFail: boolean }, context: ToolUseContext): Promise<ValidationResult> {
    return { valid: true };
  }
  
  async execute(input: { shouldFail: boolean }, context: ToolUseContext): Promise<string> {
    if (input.shouldFail) {
      throw new Error('Tool execution failed as requested');
    }
    return 'Tool execution succeeded';
  }
}

// ==================== 测试套件 ====================

describe('核心工具系统', () => {
  let context: ToolUseContext;
  let echoTool: EchoTool;
  let confirmTool: ConfirmTool;
  let failingTool: FailingTool;
  
  beforeEach(() => {
    context = createTestToolContext();
    echoTool = new EchoTool();
    confirmTool = new ConfirmTool();
    failingTool = new FailingTool();
  });
  
  afterEach(() => {
    // 清理
  });
  
  describe('Tool抽象基类', () => {
    it('应该正确创建工具实例', () => {
      expect(echoTool).to.be.instanceOf(Tool);
      expect(echoTool.id).to.equal('test.echo');
      expect(echoTool.name).to.equal('Echo Tool');
      expect(echoTool.description).to.equal('Echo a message back');
      expect(echoTool.category).to.equal(ToolCategory.OTHER);
      expect(echoTool.version).to.equal('1.0.0');
      expect(echoTool.author).to.equal('Test');
    });
    
    it('应该正确返回工具能力', () => {
      const capabilities = echoTool.capabilities;
      expect(capabilities.isConcurrencySafe).to.be.true;
      expect(capabilities.isReadOnly).to.be.true;
      expect(capabilities.isDestructive).to.be.false;
      expect(capabilities.requiresWorkspace).to.be.false;
      expect(capabilities.supportsStreaming).to.be.true;
    });
    
    it('应该检查工具是否可用', () => {
      expect(echoTool.isEnabled(context)).to.be.true;
      expect(confirmTool.isEnabled(context)).to.be.true;
      
      // 测试禁用场景
      const disabledContext = createTestToolContext({ workspaceRoot: '/disabled' });
      expect(confirmTool.isEnabled(disabledContext)).to.be.false;
    });
    
    it('应该检查并发安全性', async () => {
      const safeInput = { message: 'test' };
      expect(await echoTool.isConcurrencySafe(safeInput, context)).to.be.true;
      
      const readInput = { action: 'read' };
      expect(await confirmTool.isConcurrencySafe(readInput, context)).to.be.true;
      
      const writeInput = { action: 'write' };
      expect(await confirmTool.isConcurrencySafe(writeInput, context)).to.be.false;
    });
  });
  
  describe('权限检查', () => {
    it('应该允许有效的输入', async () => {
      const input = { message: 'Hello World' };
      const result = await echoTool.checkPermissions(input, context);
      
      expect(result.allowed).to.be.true;
      expect(result.requiresConfirmation).to.be.false;
    });
    
    it('应该拒绝包含敏感词的输入', async () => {
      const input = { message: 'This is a secret message' };
      const result = await echoTool.checkPermissions(input, context);
      
      expect(result.allowed).to.be.false;
      expect(result.requiresConfirmation).to.be.false;
      expect(result.reason).to.include('sensitive content');
    });
    
    it('应该标记需要确认的操作', async () => {
      const deleteInput = { action: 'delete' };
      const result = await confirmTool.checkPermissions(deleteInput, context);
      
      expect(result.allowed).to.be.true;
      expect(result.requiresConfirmation).to.be.true;
      expect(result.reason).to.include('requires confirmation');
    });
    
    it('应该允许不需要确认的操作', async () => {
      const readInput = { action: 'read' };
      const result = await confirmTool.checkPermissions(readInput, context);
      
      expect(result.allowed).to.be.true;
      expect(result.requiresConfirmation).to.be.false;
    });
  });
  
  describe('参数验证', () => {
    it('应该验证有效的参数', async () => {
      const input = { message: 'Valid message' };
      const result = await echoTool.validateParameters(input, context);
      
      expect(result.valid).to.be.true;
      expect(result.errors).to.be.undefined;
    });
    
    it('应该拒绝过长的消息', async () => {
      const longMessage = 'A'.repeat(51);
      const input = { message: longMessage };
      const result = await echoTool.validateParameters(input, context);
      
      expect(result.valid).to.be.false;
      expect(result.errors).to.have.lengthOf(1);
      expect(result.errors![0]).to.include('too long');
    });
    
    it('应该总是验证确认工具的参数', async () => {
      const input = { action: 'write' as const };
      const result = await confirmTool.validateParameters(input, context);
      
      expect(result.valid).to.be.true;
    });
  });
  
  describe('工具执行', () => {
    it('应该成功执行echo工具', async () => {
      const input = { message: 'Hello Test' };
      const result = await echoTool.execute(input, context);
      
      expect(result).to.equal('Echo: Hello Test');
    });
    
    it('应该成功执行确认工具', async () => {
      const input = { action: 'read' as const };
      const result = await confirmTool.execute(input, context);
      
      expect(result).to.equal('Action performed: read');
    });
    
    it('应该处理执行失败', async () => {
      const input = { shouldFail: true };
      
      try {
        await failingTool.execute(input, context);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.include('failed as requested');
      }
    });
    
    it('应该成功执行不失败的工具', async () => {
      const input = { shouldFail: false };
      const result = await failingTool.execute(input, context);
      
      expect(result).to.equal('Tool execution succeeded');
    });
  });
  
  describe('显示名称和描述', () => {
    it('应该返回正确的显示名称', () => {
      const defaultName = echoTool.getDisplayName();
      expect(defaultName).to.equal('Echo Tool');
      
      const input = { message: 'This is a very long message for testing' };
      const customName = echoTool.getDisplayName(input);
      expect(customName).to.include('Echo:');
      expect(customName).to.include('...');
    });
    
    it('应该返回正确的活动描述', () => {
      const input = { message: 'Test message' };
      const description = echoTool.getActivityDescription(input);
      
      expect(description).to.equal('Echo message: "Test message"');
    });
  });
  
  describe('buildTool函数', () => {
    it('应该从定义构建工具', () => {
      const toolDefinition = {
        id: 'test.built',
        name: 'Built Tool',
        description: 'A tool built from definition',
        category: ToolCategory.OTHER,
        version: '1.0.0',
        author: 'Test',
        inputSchema: z.object({ test: z.string() }),
        capabilities: {
          isConcurrencySafe: true,
          isReadOnly: true,
          isDestructive: false,
          requiresWorkspace: false,
          supportsStreaming: false
        },
        execute: async (input: { test: string }, context: ToolUseContext) => {
          return `Result: ${input.test}`;
        }
      };
      
      const tool = buildTool(toolDefinition);
      
      expect(tool).to.be.instanceOf(Object);
      expect(tool.id).to.equal('test.built');
      expect(tool.name).to.equal('Built Tool');
      expect(tool.execute).to.be.a('function');
    });
    
    it('应该使用默认值构建工具', async () => {
      const toolDefinition = {
        id: 'test.defaults',
        name: 'Defaults Tool',
        description: 'Tool with defaults',
        category: ToolCategory.OTHER,
        version: '1.0.0',
        author: 'Test',
        inputSchema: z.object({}),
        capabilities: {
          isConcurrencySafe: false,
          isReadOnly: false,
          isDestructive: false,
          requiresWorkspace: false,
          supportsStreaming: false
        },
        execute: async (input: {}, context: ToolUseContext) => {
          return 'Done';
        }
      };
      
      const tool = buildTool(toolDefinition);
      
      // 测试默认方法
      expect(await tool.isEnabled(context)).to.be.true;
      expect(await tool.isConcurrencySafe({}, context)).to.be.false;
      
      const permissionResult = await tool.checkPermissions({}, context);
      expect(permissionResult.allowed).to.be.true;
      expect(permissionResult.requiresConfirmation).to.be.true;
      
      const validationResult = await tool.validateParameters({}, context);
      expect(validationResult.valid).to.be.true;
      
      expect(tool.getDisplayName!()).to.equal('Defaults Tool');
      expect(tool.getActivityDescription!({})).to.equal('Tool with defaults');
    });
  });
  
  describe('错误处理', () => {
    it('应该抛出ToolUseError', () => {
      const error = new ToolUseError('Test error', 'test.tool', { test: 'data' });
      
      expect(error).to.be.instanceOf(Error);
      expect(error).to.be.instanceOf(ToolUseError);
      expect(error.message).to.equal('Test error');
      expect(error.toolId).to.equal('test.tool');
      expect(error.input).to.deep.equal({ test: 'data' });
      expect(error.name).to.equal('ToolUseError');
    });
    
    it('应该抛出PermissionDeniedError', () => {
      const error = new PermissionDeniedError('test.tool', { action: 'delete' }, 'Not allowed');
      
      expect(error).to.be.instanceOf(ToolUseError);
      expect(error).to.be.instanceOf(PermissionDeniedError);
      expect(error.message).to.include('Permission denied');
      expect(error.toolId).to.equal('test.tool');
      expect(error.reason).to.equal('Not allowed');
      expect(error.name).to.equal('PermissionDeniedError');
    });
    
    it('应该抛出ValidationError', () => {
      const errors = ['Error 1', 'Error 2'];
      const error = new ValidationError('test.tool', { data: 'invalid' }, errors);
      
      expect(error).to.be.instanceOf(ToolUseError);
      expect(error).to.be.instanceOf(ValidationError);
      expect(error.message).to.include('Validation failed');
      expect(error.toolId).to.equal('test.tool');
      expect(error.errors).to.deep.equal(errors);
      expect(error.name).to.equal('ValidationError');
    });
  });
  
  describe('工具查找函数', () => {
    it('应该按名称查找工具', () => {
      const tools = new Map();
      tools.set('tool1', echoTool);
      tools.set('tool2', confirmTool);
      
      const found = echoTool.constructor.prototype.findToolByName(tools, 'tool1');
      expect(found).to.equal(echoTool);
      
      const notFound = echoTool.constructor.prototype.findToolByName(tools, 'tool3');
      expect(notFound).to.be.undefined;
    });
    
    it('应该按类别查找工具', () => {
      const tools = new Map();
      tools.set('tool1', echoTool);
      tools.set('tool2', confirmTool);
      
      const otherTools = echoTool.constructor.prototype.findToolsByCategory(tools, ToolCategory.OTHER);
      expect(otherTools).to.have.lengthOf(2);
      expect(otherTools).to.include(echoTool);
      expect(otherTools).to.include(confirmTool);
      
      const terminalTools = echoTool.constructor.prototype.findToolsByCategory(tools, ToolCategory.TERMINAL);
      expect(terminalTools).to.have.lengthOf(0);
    });
  });
  
  describe('集成测试', () => {
    it('应该完整执行工具流程', async () => {
      const input = { message: 'Integration test' };
      
      // 检查可用性
      expect(echoTool.available).to.be.true;
      
      // 执行工具
      const result = await echoTool.execute(input, testContext);
      
      // 验证结果
      expect(result.success).to.be.true;
      expect(result.data).to.equal('Integration test');
    });
  });
}