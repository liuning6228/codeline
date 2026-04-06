/**
 * 流式工具执行器测试
 * 测试StreamingToolExecutor的并发执行和流式进度功能
 */

import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { StreamingToolExecutor, ToolExecutionOptions } from '../../../src/core/executor/StreamingToolExecutor';
import { Tool, ToolCategory, ToolCapabilities, ToolUseContext, PermissionResult, ValidationResult } from '../../../src/core/tool/Tool';
import { createTestToolContext, collectToolProgress, waitForCondition } from '../../../src/test/setupTestEnv.test';
import { z } from 'zod';

// ==================== 测试工具实现 ====================

/**
 * 延迟工具：模拟长时间运行的工具
 */
class DelayTool extends Tool<{ delayMs: number; id: string }, string> {
  readonly id = 'test.delay';
  readonly name = 'Delay Tool';
  readonly description = 'Tool that delays execution';
  readonly category = ToolCategory.OTHER;
  readonly version = '1.0.0';
  readonly author = 'Test';
  
  readonly inputSchema = z.object({
    delayMs: z.number().min(0).max(10000),
    id: z.string()
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
  
  isConcurrencySafe(input: { delayMs: number; id: string }, context: ToolUseContext): boolean {
    return true;
  }
  
  async checkPermissions(input: { delayMs: number; id: string }, context: ToolUseContext): Promise<PermissionResult> {
    return {
      allowed: true,
      requiresConfirmation: false
    };
  }
  
  async validateParameters(input: { delayMs: number; id: string }, context: ToolUseContext): Promise<ValidationResult> {
    if (input.delayMs > 5000) {
      return {
        valid: false,
        errors: ['Delay too long (max 5000ms)']
      };
    }
    return { valid: true };
  }
  
  async execute(input: { delayMs: number; id: string }, context: ToolUseContext): Promise<string> {
    // 发送开始进度
    if (context.updateProgress) {
      context.updateProgress({
        type: 'start',
        toolId: this.id,
        data: { id: input.id },
        timestamp: new Date()
      });
    }
    
    // 延迟执行
    await new Promise(resolve => setTimeout(resolve, input.delayMs));
    
    // 发送输出进度
    if (context.updateProgress) {
      context.updateProgress({
        type: 'output',
        toolId: this.id,
        data: `Processing ${input.id}`,
        timestamp: new Date()
      });
    }
    
    return `Completed: ${input.id} after ${input.delayMs}ms`;
  }
}

/**
 * 错误工具：模拟失败的工具
 */
class ErrorTool extends Tool<{ shouldThrow: boolean }, string> {
  readonly id = 'test.error';
  readonly name = 'Error Tool';
  readonly description = 'Tool that can throw errors';
  readonly category = ToolCategory.OTHER;
  readonly version = '1.0.0';
  readonly author = 'Test';
  
  readonly inputSchema = z.object({
    shouldThrow: z.boolean()
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
  
  isConcurrencySafe(input: { shouldThrow: boolean }, context: ToolUseContext): boolean {
    return true;
  }
  
  async checkPermissions(input: { shouldThrow: boolean }, context: ToolUseContext): Promise<PermissionResult> {
    return {
      allowed: true,
      requiresConfirmation: false
    };
  }
  
  async validateParameters(input: { shouldThrow: boolean }, context: ToolUseContext): Promise<ValidationResult> {
    return { valid: true };
  }
  
  async execute(input: { shouldThrow: boolean }, context: ToolUseContext): Promise<string> {
    if (input.shouldThrow) {
      throw new Error('Tool execution failed');
    }
    return 'Tool execution succeeded';
  }
}

/**
 * 非并发安全工具
 */
class NonConcurrentTool extends Tool<{ id: string }, string> {
  readonly id = 'test.nonconcurrent';
  readonly name = 'Non-concurrent Tool';
  readonly description = 'Tool that is not concurrency safe';
  readonly category = ToolCategory.OTHER;
  readonly version = '1.0.0';
  readonly author = 'Test';
  
  readonly inputSchema = z.object({
    id: z.string()
  });
  
  readonly capabilities: ToolCapabilities = {
    isConcurrencySafe: false,
    isReadOnly: true,
    isDestructive: false,
    requiresWorkspace: false,
    supportsStreaming: false
  };
  
  isEnabled(context: ToolUseContext): boolean {
    return true;
  }
  
  isConcurrencySafe(input: { id: string }, context: ToolUseContext): boolean {
    return false;
  }
  
  async checkPermissions(input: { id: string }, context: ToolUseContext): Promise<PermissionResult> {
    return {
      allowed: true,
      requiresConfirmation: false
    };
  }
  
  async validateParameters(input: { id: string }, context: ToolUseContext): Promise<ValidationResult> {
    return { valid: true };
  }
  
  async execute(input: { id: string }, context: ToolUseContext): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return `Non-concurrent tool completed: ${input.id}`;
  }
}

// ==================== 测试套件 ====================

describe('流式工具执行器', () => {
  let executor: StreamingToolExecutor;
  let context: ToolUseContext;
  let delayTool: DelayTool;
  let errorTool: ErrorTool;
  let nonConcurrentTool: NonConcurrentTool;
  
  beforeEach(() => {
    const options: ToolExecutionOptions = {
      maxConcurrentTools: 3,
      defaultTimeout: 10000,
      enableProgressUpdates: true
    };
    
    executor = new StreamingToolExecutor(options);
    context = createTestToolContext();
    delayTool = new DelayTool();
    errorTool = new ErrorTool();
    nonConcurrentTool = new NonConcurrentTool();
  });
  
  afterEach(async () => {
    await executor.destroy();
  });
  
  describe('基本功能', () => {
    it('应该创建执行器实例', () => {
      expect(executor).to.be.instanceOf(StreamingToolExecutor);
    });
    
    it('应该添加工具到队列', async () => {
      const toolId = await executor.addTool(delayTool, { delayMs: 100, id: 'test1' }, context);
      
      expect(toolId).to.be.a('string');
      expect(toolId).to.match(/^tool_\d+_/);
    });
    
    it('应该获取工具结果', async () => {
      const toolId = await executor.addTool(delayTool, { delayMs: 50, id: 'test1' }, context);
      
      const result = await executor.getToolResult(toolId);
      
      expect(result.status).to.equal('completed');
      expect(result.result).to.equal('Completed: test1 after 50ms');
      expect(result.error).to.be.undefined;
    });
    
    it('应该获取工具进度', async () => {
      const toolId = await executor.addTool(delayTool, { delayMs: 100, id: 'test1' }, context);
      
      // 等待工具开始执行
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const progress = executor.getToolProgress(toolId);
      
      expect(progress).to.be.an('array');
      expect(progress.length).to.be.greaterThan(0);
      expect(progress[0].type).to.be.oneOf(['start', 'output', 'complete']);
    });
  });
  
  describe('并发执行', () => {
    it('应该并发执行多个工具', async () => {
      const startTime = Date.now();
      
      // 添加多个延迟工具
      const toolIds = [];
      for (let i = 0; i < 3; i++) {
        const toolId = await executor.addTool(delayTool, { delayMs: 200, id: `test${i}` }, context);
        toolIds.push(toolId);
      }
      
      // 等待所有工具完成
      const results = await Promise.all(
        toolIds.map(id => executor.getToolResult(id))
      );
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 并发执行应该大约200ms，而不是600ms
      expect(duration).to.be.lessThan(400);
      
      // 所有工具都应该成功完成
      for (const result of results) {
        expect(result.status).to.equal('completed');
        expect(result.error).to.be.undefined;
      }
    });
    
    it('应该限制最大并发数', async () => {
      const startTime = Date.now();
      
      // 添加5个工具，但最大并发是3
      const toolIds = [];
      for (let i = 0; i < 5; i++) {
        const toolId = await executor.addTool(delayTool, { delayMs: 100, id: `test${i}` }, context);
        toolIds.push(toolId);
      }
      
      // 等待所有工具完成
      await Promise.all(toolIds.map(id => executor.getToolResult(id)));
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 5个工具，并发3，应该大约200ms（100ms * 2批）
      expect(duration).to.be.greaterThan(180);
      expect(duration).to.be.lessThan(300);
    });
    
    it('应该顺序执行非并发安全的工具', async () => {
      const startTime = Date.now();
      
      // 添加3个非并发安全的工具
      const toolIds = [];
      for (let i = 0; i < 3; i++) {
        const toolId = await executor.addTool(nonConcurrentTool, { id: `test${i}` }, context);
        toolIds.push(toolId);
      }
      
      // 等待所有工具完成
      await Promise.all(toolIds.map(id => executor.getToolResult(id)));
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 非并发工具应该顺序执行，大约300ms（100ms * 3）
      expect(duration).to.be.greaterThan(280);
      expect(duration).to.be.lessThan(400);
    });
    
    it('应该混合执行并发和非并发工具', async () => {
      const startTime = Date.now();
      
      // 添加混合工具
      const toolIds = [];
      
      // 2个并发工具
      toolIds.push(await executor.addTool(delayTool, { delayMs: 150, id: 'concurrent1' }, context));
      toolIds.push(await executor.addTool(delayTool, { delayMs: 150, id: 'concurrent2' }, context));
      
      // 1个非并发工具
      toolIds.push(await executor.addTool(nonConcurrentTool, { id: 'nonconcurrent1' }, context));
      
      // 再添加1个并发工具
      toolIds.push(await executor.addTool(delayTool, { delayMs: 150, id: 'concurrent3' }, context));
      
      // 等待所有工具完成
      await Promise.all(toolIds.map(id => executor.getToolResult(id)));
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 执行顺序应该是：
      // 1. concurrent1和concurrent2并发执行（150ms）
      // 2. nonconcurrent1单独执行（100ms）
      // 3. concurrent3执行（150ms）
      // 总时间大约400ms
      expect(duration).to.be.greaterThan(380);
      expect(duration).to.be.lessThan(500);
    });
  });
  
  describe('错误处理', () => {
    it('应该处理工具执行错误', async () => {
      const toolId = await executor.addTool(errorTool, { shouldThrow: true }, context);
      
      const result = await executor.getToolResult(toolId);
      
      expect(result.status).to.equal('failed');
      expect(result.error).to.be.instanceOf(Error);
      expect(result.error!.message).to.equal('Tool execution failed');
      expect(result.result).to.be.undefined;
    });
    
    it('应该处理参数验证错误', async () => {
      // 使用超过最大延迟的参数
      const toolId = await executor.addTool(delayTool, { delayMs: 6000, id: 'test' }, context);
      
      const result = await executor.getToolResult(toolId);
      
      expect(result.status).to.equal('failed');
      expect(result.error).to.be.instanceOf(Error);
      expect(result.error!.message).to.include('Validation failed');
    });
    
    it('应该继续执行其他工具即使有工具失败', async () => {
      const startTime = Date.now();
      
      // 添加一个会失败的工具和一个正常的工具
      const errorToolId = await executor.addTool(errorTool, { shouldThrow: true }, context);
      const delayToolId = await executor.addTool(delayTool, { delayMs: 100, id: 'normal' }, context);
      
      // 等待两个工具完成
      const [errorResult, delayResult] = await Promise.all([
        executor.getToolResult(errorToolId),
        executor.getToolResult(delayToolId)
      ]);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 错误工具应该失败
      expect(errorResult.status).to.equal('failed');
      
      // 正常工具应该成功
      expect(delayResult.status).to.equal('completed');
      expect(delayResult.result).to.equal('Completed: normal after 100ms');
      
      // 应该并发执行，所以时间应该大约100ms
      expect(duration).to.be.lessThan(200);
    });
  });
  
  describe('取消功能', () => {
    it('应该取消正在执行的任务', async () => {
      const toolId = await executor.addTool(delayTool, { delayMs: 1000, id: 'long' }, context);
      
      // 等待工具开始执行
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 取消工具
      const cancelled = await executor.cancelTool(toolId);
      expect(cancelled).to.be.true;
      
      const result = await executor.getToolResult(toolId);
      expect(result.status).to.equal('cancelled');
    });
    
    it('应该取消所有任务', async () => {
      // 添加多个长时间运行的工具
      const toolIds = [];
      for (let i = 0; i < 3; i++) {
        const toolId = await executor.addTool(delayTool, { delayMs: 2000, id: `long${i}` }, context);
        toolIds.push(toolId);
      }
      
      // 等待工具开始执行
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 取消所有工具
      await executor.cancelAll();
      
      // 检查所有工具都被取消
      for (const toolId of toolIds) {
        const result = await executor.getToolResult(toolId);
        expect(result.status).to.equal('cancelled');
      }
    });
    
    it('应该处理取消不存在的工具', async () => {
      const cancelled = await executor.cancelTool('nonexistent');
      expect(cancelled).to.be.false;
    });
  });
  
  describe('进度流', () => {
    it('应该产生进度事件', async () => {
      const toolId = await executor.addTool(delayTool, { delayMs: 100, id: 'progress' }, context);
      
      // 收集进度
      const progress = executor.getToolProgress(toolId);
      
      // 等待工具完成
      await executor.getToolResult(toolId);
      
      // 应该至少有开始和完成事件
      expect(progress.length).to.be.greaterThanOrEqual(2);
      
      const eventTypes = progress.map(p => p.type);
      expect(eventTypes).to.include('start');
      expect(eventTypes).to.include('complete');
    });
    
    it('应该为错误工具产生错误事件', async () => {
      const toolId = await executor.addTool(errorTool, { shouldThrow: true }, context);
      
      // 等待工具完成
      await executor.getToolResult(toolId);
      
      const progress = executor.getToolProgress(toolId);
      const errorEvents = progress.filter(p => p.type === 'error');
      
      expect(errorEvents.length).to.be.greaterThan(0);
    });
  });
  
  describe('执行统计', () => {
    it('应该返回正确的执行统计', async () => {
      // 初始状态
      let stats = executor.getExecutionStats();
      expect(stats.total).to.equal(0);
      expect(stats.queued).to.equal(0);
      expect(stats.executing).to.equal(0);
      expect(stats.completed).to.equal(0);
      
      // 添加工具
      const toolId1 = await executor.addTool(delayTool, { delayMs: 100, id: 'test1' }, context);
      const toolId2 = await executor.addTool(delayTool, { delayMs: 200, id: 'test2' }, context);
      
      // 检查队列状态
      await new Promise(resolve => setTimeout(resolve, 50));
      stats = executor.getExecutionStats();
      
      expect(stats.total).to.equal(2);
    });
  });
}
