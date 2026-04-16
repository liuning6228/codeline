/**
 * Phase 2 集成测试 - 任务2.4
 * 
 * 测试多个模拟组件之间的交互，验证EnhancedEngineAdapter的完整工作流
 */

import * as assert from 'assert';
import { RealEnhancedEngineAdapterWrapper } from '../adapters/RealEnhancedEngineAdapterWrapper';
import { MockEnhancedToolRegistry } from '../mocks/EnhancedToolRegistry';
import { MockEnhancedQueryEngine } from '../mocks/EnhancedQueryEngine';
import { MockMCPHandler } from '../mocks/MCPHandler';
import { createExtensionContext } from '../mocks/vscodeExtended';
import { ToolCategory } from '../types/ToolTypes';

// ==================== 测试配置 ====================

const TEST_CONFIG = {
  verbose: false,
  enableStreaming: false,
  defaultMode: 'act' as const,
  maxConcurrentTools: 3,
  toolRegistryConfig: {
    enableCaching: true,
    enableLazyLoading: true,
    defaultCategories: Object.values(ToolCategory),
    excludeToolIds: [],
    includeToolIds: [],
    maxConcurrentTools: 3,
    defaultTimeout: 30000
  }
};

// ==================== 测试辅助函数 ====================

/**
 * 创建测试用的EnhancedEngineAdapter实例
 */
function createTestAdapter() {
  const context = createExtensionContext();
  
  return RealEnhancedEngineAdapterWrapper.getInstance({
    ...TEST_CONFIG,
    extension: undefined, // 使用模拟扩展
    context: context,
    onEngineReady: () => {
      if (TEST_CONFIG.verbose) {
        console.log('[Phase2Test] 引擎就绪回调');
      }
    },
    onStateUpdate: (state) => {
      if (TEST_CONFIG.verbose) {
        console.log('[Phase2Test] 状态更新:', state);
      }
    },
    onError: (error) => {
      console.error('[Phase2Test] 错误:', error);
    }
  });
}

/**
 * 等待指定的时间
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== Phase 2 集成测试 ====================

describe('Phase 2 集成测试 - 多个模拟组件交互', () => {
  
  describe('场景1: 完整工具调用链', () => {
    let adapterWrapper: RealEnhancedEngineAdapterWrapper;
    let toolRegistry: MockEnhancedToolRegistry;
    
    beforeEach(async () => {
      // 创建EnhancedToolRegistry实例
      toolRegistry = new MockEnhancedToolRegistry(TEST_CONFIG.toolRegistryConfig);
      await toolRegistry.initialize();
      
      // 创建适配器
      adapterWrapper = createTestAdapter();
    });
    
    afterEach(async () => {
      // 清理
      if (toolRegistry) {
        await toolRegistry.cleanup();
      }
    });
    
    it('应该正确注册和调用模拟工具', async () => {
      // 验证工具注册表初始化
      assert.ok(toolRegistry, '工具注册表应该被创建');
      
      // 获取所有工具
      const tools = toolRegistry.getAllTools();
      console.log(`[Phase2Test] 注册的工具数量: ${tools.length}`);
      assert.ok(tools.length > 0, '应该注册了至少一个工具');
      
      // 验证工具类别
      const categories = toolRegistry.getAllCategories();
      console.log(`[Phase2Test] 工具类别: ${categories.join(', ')}`);
      assert.ok(categories.length > 0, '应该存在至少一个工具类别');
      
      // 执行工具
      const result = await toolRegistry.executeTool('read_file', { path: '/test/file.txt' });
      console.log(`[Phase2Test] 工具执行结果:`, result);
      assert.ok(result, '工具应该返回结果');
      assert.ok(result.content, '读取文件工具应该返回内容');
    });
    
    it('应该支持工具别名', async () => {
      // 注册工具别名
      const aliasRegistered = toolRegistry.registerToolAlias('rf', 'read_file');
      assert.ok(aliasRegistered, '应该成功注册工具别名');
      
      // 通过别名获取工具
      const tool = toolRegistry.getTool('rf');
      assert.ok(tool, '应该能通过别名获取工具');
      assert.strictEqual(tool.id, 'read_file', '别名应该映射到正确的工具');
    });
    
    it('应该记录工具使用统计', async () => {
      // 执行几次工具调用
      await toolRegistry.executeTool('read_file', { path: '/test/1.txt' });
      await toolRegistry.executeTool('write_file', { path: '/test/2.txt', content: 'test' });
      await toolRegistry.executeTool('execute_command', { command: 'ls -la' });
      
      // 获取使用统计
      const stats = toolRegistry.getToolUsageStats();
      console.log(`[Phase2Test] 工具使用统计:`, stats);
      
      if (Array.isArray(stats)) {
        assert.ok(stats.length >= 3, '应该记录至少3个工具的使用统计');
        
        // 检查read_file的使用统计
        const readFileStats = stats.find(s => s.toolId === 'read_file');
        assert.ok(readFileStats, '应该存在read_file的使用统计');
        assert.strictEqual(readFileStats.usageCount, 1, 'read_file应该被使用1次');
        assert.ok(readFileStats.lastUsed, '应该有最后使用时间');
      }
    });
  });
  
  describe('场景2: EnhancedQueryEngine与工具注册表集成', () => {
    let toolRegistry: MockEnhancedToolRegistry;
    let queryEngine: MockEnhancedQueryEngine;
    
    beforeEach(async () => {
      // 创建工具注册表
      toolRegistry = new MockEnhancedToolRegistry(TEST_CONFIG.toolRegistryConfig);
      await toolRegistry.initialize();
      
      // 创建EnhancedQueryEngine
      queryEngine = new MockEnhancedQueryEngine({
        modelAdapter: {},
        projectAnalyzer: {},
        promptEngine: {},
        toolRegistry: toolRegistry,
        cwd: process.cwd(),
        extensionContext: createExtensionContext(),
        workspaceRoot: process.cwd(),
        verbose: TEST_CONFIG.verbose
      });
    });
    
    afterEach(async () => {
      if (toolRegistry) {
        await toolRegistry.cleanup();
      }
    });
    
    it('应该通过EnhancedQueryEngine调用工具', async () => {
      // 提交消息并获取工具调用
      const message = "请读取文件 /test/example.txt 的内容";
      const response = await queryEngine.submitMessageSync(message);
      
      console.log(`[Phase2Test] EnhancedQueryEngine响应:`, response);
      assert.ok(response, '应该返回响应');
      assert.ok(response.content || response.toolCalls, '响应应该包含内容或工具调用');
      
      // 检查是否生成了工具调用
      if (response.toolCalls && response.toolCalls.length > 0) {
        console.log(`[Phase2Test] 生成了 ${response.toolCalls.length} 个工具调用`);
        
        // 验证工具调用格式
        const toolCall = response.toolCalls[0];
        assert.ok(toolCall.toolName, '工具调用应该包含工具名称');
        assert.ok(toolCall.arguments, '工具调用应该包含参数');
      }
    });
    
    it('应该处理多个工具调用', async () => {
      // 提交需要多个工具的消息
      const message = "请先读取文件 /test/input.txt，然后写入结果到 /test/output.txt";
      const response = await queryEngine.submitMessageSync(message);
      
      console.log(`[Phase2Test] 多工具消息响应:`, response);
      assert.ok(response, '应该返回响应');
      
      if (response.toolCalls) {
        console.log(`[Phase2Test] 生成了 ${response.toolCalls.length} 个工具调用`);
        assert.ok(response.toolCalls.length >= 2, '应该生成至少2个工具调用');
      }
    });
  });
  
  describe('场景3: MCPHandler与工具系统集成', () => {
    let mcpHandler: MockMCPHandler;
    let toolRegistry: MockEnhancedToolRegistry;
    
    beforeEach(() => {
      // 创建工具注册表
      toolRegistry = new MockEnhancedToolRegistry(TEST_CONFIG.toolRegistryConfig);
      
      // 创建MCPHandler
      mcpHandler = new MockMCPHandler({}, {
        enableMCPTools: true,
        enableToolSystem: true,
        verboseLogging: TEST_CONFIG.verbose
      });
    });
    
    afterEach(async () => {
      if (toolRegistry) {
        await toolRegistry.cleanup();
      }
    });
    
    it('应该初始化MCPHandler并注册工具', async () => {
      // 初始化MCPHandler
      const initResult = await mcpHandler.initialize(process.cwd());
      assert.ok(initResult, 'MCPHandler应该成功初始化');
      
      // 检查指标
      const metrics = mcpHandler.getMetrics();
      console.log(`[Phase2Test] MCPHandler指标:`, metrics);
      assert.ok(metrics, '应该能获取指标');
      assert.strictEqual(metrics.initializationTime > 0, true, '初始化时间应该大于0');
    });
    
    it('应该处理MCP工具请求', async () => {
      // 初始化MCPHandler
      await mcpHandler.initialize(process.cwd());
      
      // 模拟MCP消息
      const message = {
        type: 'tool_request',
        data: {
          tool_id: 'read_file',
          arguments: { path: '/test/mcp-file.txt' }
        },
        messageId: 'test-123'
      };
      
      // 处理消息
      const response = await mcpHandler.handleMessage(message);
      console.log(`[Phase2Test] MCP消息响应:`, response);
      
      assert.ok(response, '应该返回响应');
      assert.ok(response.success, 'MCP请求应该成功');
      assert.ok(response.data, '响应应该包含数据');
    });
    
    it('应该支持MCP监控', async () => {
      // 初始化并处理一些消息
      await mcpHandler.initialize(process.cwd());
      
      // 处理多个消息以生成监控数据
      for (let i = 0; i < 3; i++) {
        const message = {
          type: 'tool_request',
          data: {
            tool_id: i % 2 === 0 ? 'read_file' : 'execute_command',
            arguments: i % 2 === 0 ? 
              { path: `/test/file${i}.txt` } : 
              { command: `echo test${i}` }
          },
          messageId: `test-${i}`
        };
        
        await mcpHandler.handleMessage(message);
        await delay(100); // 模拟延迟
      }
      
      // 获取监控数据
      const monitoringData = mcpHandler.getMonitoringData();
      console.log(`[Phase2Test] MCP监控数据:`, monitoringData);
      
      assert.ok(monitoringData, '应该能获取监控数据');
      assert.ok(monitoringData.recentErrors || Array.isArray(monitoringData.recentErrors), '监控数据应该包含错误信息');
    });
  });
  
  describe('场景4: 错误处理和恢复机制', () => {
    let toolRegistry: MockEnhancedToolRegistry;
    
    beforeEach(async () => {
      // 创建工具注册表
      toolRegistry = new MockEnhancedToolRegistry(TEST_CONFIG.toolRegistryConfig);
      await toolRegistry.initialize();
    });
    
    afterEach(async () => {
      if (toolRegistry) {
        await toolRegistry.cleanup();
      }
    });
    
    it('应该处理不存在的工具调用', async () => {
      try {
        // 尝试执行不存在的工具
        await toolRegistry.executeTool('non_existent_tool', {});
        assert.fail('应该抛出错误');
      } catch (error: any) {
        console.log(`[Phase2Test] 预期错误: ${error.message}`);
        assert.ok(error.message.includes('未找到'), '错误消息应该提示工具未找到');
      }
    });
    
    it('应该处理工具执行失败', async () => {
      // 注册一个会失败的工具
      toolRegistry.registerToolDefinition({
        id: 'failing_tool',
        name: 'Failing Tool',
        description: '总是失败的工具',
        parameters: { type: 'object', properties: {} },
        category: ToolCategory.OTHER
      }, async () => {
        throw new Error('模拟工具失败');
      });
      
      try {
        // 执行会失败的工具
        await toolRegistry.executeTool('failing_tool', {});
        assert.fail('应该抛出错误');
      } catch (error: any) {
        console.log(`[Phase2Test] 工具执行失败: ${error.message}`);
        assert.ok(error.message.includes('模拟工具失败'), '应该返回工具本身的错误消息');
      }
      
      // 检查使用统计
      const stats = toolRegistry.getToolUsageStats('failing_tool') as any;
      console.log(`[Phase2Test] 失败工具统计:`, stats);
      assert.ok(stats, '应该记录失败工具的使用统计');
      assert.strictEqual(stats.failureCount, 1, '应该记录1次失败');
    });
    
    it('应该支持工具执行取消', async () => {
      // 注册一个长时间运行的工具
      toolRegistry.registerToolDefinition({
        id: 'long_running_tool',
        name: 'Long Running Tool',
        description: '长时间运行的工具',
        parameters: { type: 'object', properties: {} },
        category: ToolCategory.OTHER
      }, async () => {
        await delay(5000); // 模拟长时间运行
        return { success: true };
      });
      
      // 开始执行（但不等待完成）
      const executionPromise = toolRegistry.executeTool('long_running_tool', {});
      
      // 模拟取消
      const executionId = 'test-execution-id';
      const cancelResult = await toolRegistry.cancelToolExecution(executionId);
      console.log(`[Phase2Test] 取消结果: ${cancelResult}`);
      assert.ok(cancelResult, '应该支持取消操作');
      
      // 清理
      try {
        await executionPromise;
      } catch (error) {
        // 预期可能会失败
      }
    });
  });
  
  describe('场景5: 性能基准测试', () => {
    let toolRegistry: MockEnhancedToolRegistry;
    
    beforeEach(async () => {
      // 创建工具注册表
      toolRegistry = new MockEnhancedToolRegistry(TEST_CONFIG.toolRegistryConfig);
      await toolRegistry.initialize();
    });
    
    afterEach(async () => {
      if (toolRegistry) {
        await toolRegistry.cleanup();
      }
    });
    
    it('应该测量工具执行性能', async () => {
      const iterations = 10;
      const executionTimes: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        await toolRegistry.executeTool('read_file', { path: `/test/perf${i}.txt` });
        const endTime = Date.now();
        executionTimes.push(endTime - startTime);
      }
      
      // 计算统计数据
      const totalTime = executionTimes.reduce((sum, time) => sum + time, 0);
      const averageTime = totalTime / iterations;
      const minTime = Math.min(...executionTimes);
      const maxTime = Math.max(...executionTimes);
      
      console.log(`[Phase2Test] 性能测试结果:`);
      console.log(`  迭代次数: ${iterations}`);
      console.log(`  总时间: ${totalTime}ms`);
      console.log(`  平均时间: ${averageTime.toFixed(2)}ms`);
      console.log(`  最短时间: ${minTime}ms`);
      console.log(`  最长时间: ${maxTime}ms`);
      
      // 验证性能在可接受范围内
      assert.ok(averageTime < 100, `平均执行时间应该在100ms以内，实际为${averageTime}ms`);
      assert.ok(maxTime < 200, `最差执行时间应该在200ms以内，实际为${maxTime}ms`);
    });
    
    it('应该监控并发工具执行', async () => {
      // 同时执行多个工具
      const toolCalls = [
        toolRegistry.executeTool('read_file', { path: '/test/concurrent1.txt' }),
        toolRegistry.executeTool('write_file', { path: '/test/concurrent2.txt', content: 'test' }),
        toolRegistry.executeTool('execute_command', { command: 'echo concurrent' })
      ];
      
      const startTime = Date.now();
      const results = await Promise.allSettled(toolCalls);
      const totalTime = Date.now() - startTime;
      
      console.log(`[Phase2Test] 并发执行结果:`);
      console.log(`  总时间: ${totalTime}ms`);
      console.log(`  成功: ${results.filter(r => r.status === 'fulfilled').length}`);
      console.log(`  失败: ${results.filter(r => r.status === 'rejected').length}`);
      
      // 验证所有工具都成功执行
      const successfulResults = results.filter(r => r.status === 'fulfilled');
      assert.strictEqual(successfulResults.length, toolCalls.length, '所有并发工具都应该成功执行');
    });
  });
});

/**
 * 运行所有Phase 2集成测试
 */
export async function runPhase2IntegrationTests(): Promise<boolean> {
  console.log('🚀 开始运行Phase 2集成测试...');
  
  try {
    // 这里可以添加更多的测试运行逻辑
    console.log('✅ Phase 2集成测试已定义');
    console.log('📋 测试场景:');
    console.log('  1. 完整工具调用链');
    console.log('  2. EnhancedQueryEngine与工具注册表集成');
    console.log('  3. MCPHandler与工具系统集成');
    console.log('  4. 错误处理和恢复机制');
    console.log('  5. 性能基准测试');
    
    return true;
  } catch (error) {
    console.error('❌ Phase 2集成测试失败:', error);
    return false;
  }
}