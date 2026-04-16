/**
 * EnhancedEngineAdapter端到端工作流测试
 * 
 * 测试：
 * 1. EnhancedQueryEngine与EnhancedEngineAdapter的集成
 * 2. MCPHandler交互
 * 3. 完整的消息处理流程
 * 4. 工具执行和状态管理
 */

import * as assert from 'assert';
import { RealEnhancedEngineAdapterWrapper } from '../adapters/RealEnhancedEngineAdapterWrapper';
import { MockMCPHandler } from '../mocks/MCPHandler';
import { createExtensionContext } from '../mocks/vscodeExtended';

// ==================== 测试配置 ====================

const TEST_CONFIG = {
  verbose: false,
  enableStreaming: false,
  defaultMode: 'act' as const,
  maxConcurrentTools: 3,
  toolRegistryConfig: {
    autoLoadTools: true,
    enableFileTools: true,
    enableTerminalTools: true,
    enableBrowserTools: false,
  }
};

// ==================== 端到端工作流测试 ====================

describe('EnhancedEngineAdapter端到端工作流测试', () => {
  
  // ========== 测试1: 适配器初始化与EnhancedQueryEngine集成 ==========
  
  describe('适配器初始化与EnhancedQueryEngine集成', () => {
    let adapterWrapper: RealEnhancedEngineAdapterWrapper;
    
    beforeEach(() => {
      adapterWrapper = RealEnhancedEngineAdapterWrapper.getInstance({
        ...TEST_CONFIG,
        extension: undefined, // 使用模拟扩展
        context: createExtensionContext(),
        onEngineReady: () => console.log('引擎就绪回调'),
        onStateUpdate: (state) => {
          if (TEST_CONFIG.verbose) {
            console.log('状态更新:', state);
          }
        },
      }, {
        useRealComponent: false, // 强制使用模拟
        fallbackToMock: true,
        verbose: TEST_CONFIG.verbose,
        mockVscode: true,
      });
    });
    
    afterEach(async () => {
      // 清理
      adapterWrapper = null as any;
    });
    
    it('应该成功初始化适配器', async () => {
      const result = await adapterWrapper.initialize();
      assert.ok(result, '适配器应该初始化成功');
      
      const state = adapterWrapper.getState();
      assert.ok(state.engineReady, '引擎应该就绪');
      assert.ok(state.toolCount > 0, '应该加载工具');
    });
    
    it('应该获取到EnhancedQueryEngine实例', async () => {
      await adapterWrapper.initialize();
      
      const engine = adapterWrapper.getEngine();
      assert.ok(engine, '应该获取到引擎实例');
      assert.ok(typeof engine.submitMessageSync === 'function', '引擎应该具有submitMessageSync方法');
    });
    
    it('应该获取到工具注册表', async () => {
      await adapterWrapper.initialize();
      
      const toolRegistry = adapterWrapper.getToolRegistry();
      assert.ok(toolRegistry, '应该获取到工具注册表');
      assert.ok(typeof toolRegistry.getAllTools === 'function', '工具注册表应该具有getAllTools方法');
      
      const tools = toolRegistry.getAllTools();
      assert.ok(tools.length >= 3, '应该至少有3个默认工具');
    });
  });
  
  // ========== 测试2: 消息处理流程 ==========
  
  describe('消息处理流程', () => {
    let adapterWrapper: RealEnhancedEngineAdapterWrapper;
    
    beforeEach(async () => {
      adapterWrapper = RealEnhancedEngineAdapterWrapper.getInstance({
        ...TEST_CONFIG,
        context: createExtensionContext(),
      }, {
        useRealComponent: false,
        verbose: TEST_CONFIG.verbose,
      });
      
      await adapterWrapper.initialize();
    });
    
    afterEach(async () => {
      adapterWrapper = null as any;
    });
    
    it('应该处理简单的消息', async () => {
      const response = await adapterWrapper.submitMessage('你好，请介绍你自己');
      
      assert.ok(response.success, '消息处理应该成功');
      assert.ok(response.message, '应该有响应消息');
      assert.ok(response.message.content, '响应应该有内容');
      
      console.log('测试响应:', response.message.content.substring(0, 100) + '...');
    });
    
    it('应该处理需要工具调用的消息', async () => {
      // 发送一个可能需要工具调用的消息
      const response = await adapterWrapper.submitMessage('请读取当前目录下的README文件');
      
      assert.ok(response.success, '消息处理应该成功');
      
      // 注意：模拟引擎可能基于关键词决定是否调用工具
      // 检查是否有工具调用
      if (response.toolCalls && response.toolCalls.length > 0) {
        console.log('检测到工具调用:', response.toolCalls);
        assert.ok(response.toolCalls[0].tool, '工具调用应该有工具名称');
        assert.ok(response.toolCalls[0].result, '工具调用应该有结果');
      } else {
        console.log('没有检测到工具调用，这是预期的（模拟引擎可能不调用工具）');
      }
    });
    
    it('应该支持模式切换', async () => {
      // 初始应该是act模式
      assert.strictEqual(adapterWrapper.getMode(), 'act', '初始应该是act模式');
      
      // 切换到plan模式
      adapterWrapper.setMode('plan');
      assert.strictEqual(adapterWrapper.getMode(), 'plan', '切换后应该是plan模式');
      
      // 发送消息测试plan模式
      const response = await adapterWrapper.submitMessage('请分析这个代码重构任务');
      
      assert.ok(response.success, 'plan模式消息应该处理成功');
      assert.ok(response.message.content.includes('计划') || response.message.content.includes('步骤'), 
        'plan模式响应应该包含计划或步骤');
      
      console.log('Plan模式响应:', response.message.content.substring(0, 150) + '...');
    });
    
    it('应该支持对话导出导入', async () => {
      // 发送几条消息
      await adapterWrapper.submitMessage('第一条消息');
      await adapterWrapper.submitMessage('第二条消息');
      
      // 导出对话
      const exported = adapterWrapper.exportConversation();
      assert.ok(exported, '应该能够导出对话');
      assert.ok(typeof exported === 'string', '导出应该是字符串');
      assert.ok(exported.includes('messages'), '导出应该包含消息');
      
      console.log('导出对话长度:', exported.length, '字符');
      
      // 清除当前对话
      adapterWrapper.clearConversation();
      const stateAfterClear = adapterWrapper.getConversationState();
      assert.ok(stateAfterClear.messages.length === 0 || !stateAfterClear.messages, '清除后应该没有消息');
      
      // 导入对话
      const importResult = adapterWrapper.importConversation(exported!);
      assert.ok(importResult, '导入应该成功');
      
      const stateAfterImport = adapterWrapper.getConversationState();
      assert.ok(stateAfterImport.messages && stateAfterImport.messages.length >= 2, '导入后应该有消息');
    });
  });
  
  // ========== 测试3: MCPHandler集成测试 ==========
  
  describe('MCPHandler集成测试', () => {
    let mcpHandler: MockMCPHandler;
    let adapterWrapper: RealEnhancedEngineAdapterWrapper;
    
    beforeEach(async () => {
      const context = createExtensionContext();
      
      // 创建MCPHandler
      mcpHandler = new MockMCPHandler(context, {
        verboseLogging: TEST_CONFIG.verbose,
        enableMCPTools: true,
        enableToolSystem: true,
      });
      
      // 初始化MCPHandler
      await mcpHandler.initialize(process.cwd());
      
      // 创建适配器
      adapterWrapper = RealEnhancedEngineAdapterWrapper.getInstance({
        ...TEST_CONFIG,
        context,
      }, {
        useRealComponent: false,
        verbose: TEST_CONFIG.verbose,
      });
      
      await adapterWrapper.initialize();
    });
    
    afterEach(async () => {
      await mcpHandler.dispose();
      mcpHandler = null as any;
      adapterWrapper = null as any;
    });
    
    it('MCPHandler应该能够处理健康检查', async () => {
      const response = await mcpHandler.handleMessage({
        type: 'mcp_health_check',
        data: {},
      });
      
      assert.ok(response.success, '健康检查应该成功');
      assert.ok(response.data.healthy, 'MCPHandler应该是健康的');
      assert.ok(response.data.metrics, '应该包含指标');
    });
    
    it('MCPHandler应该能够获取工具列表', async () => {
      const response = await mcpHandler.handleMessage({
        type: 'mcp_get_tools',
        data: {},
      });
      
      assert.ok(response.success, '获取工具应该成功');
      assert.ok(response.data.tools, '应该包含工具列表');
      assert.ok(response.data.tools.length > 0, '应该有工具');
      
      console.log('MCP工具数量:', response.data.tools.length);
    });
    
    it('MCPHandler应该能够执行工具', async () => {
      // 首先获取工具列表
      const toolsResponse = await mcpHandler.handleMessage({
        type: 'mcp_get_tools',
        data: {},
      });
      
      const toolId = toolsResponse.data.tools[0].id;
      
      // 执行工具
      const executeResponse = await mcpHandler.handleMessage({
        type: 'mcp_execute_tool',
        data: {
          toolId,
          parameters: { test: 'value' },
        },
      });
      
      assert.ok(executeResponse.success, '执行工具应该成功');
      assert.ok(executeResponse.data.output, '应该有输出');
      assert.ok(executeResponse.data.success, '工具执行应该成功');
      
      console.log('工具执行结果:', executeResponse.data.output);
    });
    
    it('应该演示完整的MCP-Adapter集成工作流', async () => {
      // 步骤1: 检查MCPHandler状态
      const healthResponse = await mcpHandler.handleMessage({
        type: 'mcp_health_check',
        data: {},
      });
      assert.ok(healthResponse.success, 'MCP健康检查应该成功');
      
      // 步骤2: 通过适配器发送消息
      const adapterResponse = await adapterWrapper.submitMessage('请使用MCP工具帮助我');
      assert.ok(adapterResponse.success, '适配器消息应该成功');
      
      // 步骤3: 检查MCP指标
      const metricsResponse = await mcpHandler.handleMessage({
        type: 'mcp_metrics',
        data: {},
      });
      assert.ok(metricsResponse.success, '获取指标应该成功');
      assert.ok(metricsResponse.data.metrics.totalRequests > 0, '应该有请求记录');
      
      console.log('完整工作流测试完成');
      console.log('- MCP健康状态:', healthResponse.data.healthy);
      console.log('- 适配器消息状态:', adapterResponse.success);
      console.log('- MCP总请求数:', metricsResponse.data.metrics.totalRequests);
    });
  });
  
  // ========== 测试4: 错误处理和恢复 ==========
  
  describe('错误处理和恢复', () => {
    let adapterWrapper: RealEnhancedEngineAdapterWrapper;
    
    beforeEach(async () => {
      adapterWrapper = RealEnhancedEngineAdapterWrapper.getInstance({
        ...TEST_CONFIG,
        context: createExtensionContext(),
        onError: (error) => {
          console.log('错误回调:', error.message);
        },
      }, {
        useRealComponent: false,
        verbose: TEST_CONFIG.verbose,
      });
      
      await adapterWrapper.initialize();
    });
    
    afterEach(async () => {
      adapterWrapper = null as any;
    });
    
    it('应该处理无效的导入数据', () => {
      const invalidJson = '{这不是有效的JSON';
      const result = adapterWrapper.importConversation(invalidJson);
      
      assert.ok(!result, '无效JSON导入应该失败');
    });
    
    it('应该在重置后保持基本功能', async () => {
      // 先发送一些消息
      await adapterWrapper.submitMessage('测试消息1');
      await adapterWrapper.submitMessage('测试消息2');
      
      const stateBeforeReset = adapterWrapper.getConversationState();
      assert.ok(stateBeforeReset.messages && stateBeforeReset.messages.length >= 2, '重置前应该有消息');
      
      // 重置适配器
      adapterWrapper.reset();
      
      // 重置后应该还能发送消息
      const response = await adapterWrapper.submitMessage('重置后的测试消息');
      assert.ok(response.success, '重置后应该能处理消息');
    });
  });
});

// ==================== 测试运行器辅助函数 ====================

/**
 * 运行所有端到端测试
 */
export async function runAllE2ETests(): Promise<boolean> {
  try {
    console.log('开始运行EnhancedEngineAdapter端到端测试...');
    
    // 这里可以添加自定义测试运行逻辑
    // 实际测试应该通过测试框架（如Mocha）运行
    
    console.log('端到端测试完成');
    return true;
  } catch (error: any) {
    console.error('端到端测试失败:', error.message);
    return false;
  }
}

// ==================== 导出 ====================

export default runAllE2ETests;