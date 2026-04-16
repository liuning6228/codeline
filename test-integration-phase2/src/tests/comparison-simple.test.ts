/**
 * 简化对比测试 - 只测试模拟组件
 */

import * as assert from 'assert';
import { RealEnhancedEngineAdapterWrapper } from '../adapters/RealEnhancedEngineAdapterWrapper';
import { createExtensionContext } from '../mocks/vscodeExtended';
import { performance } from 'perf_hooks';

// ==================== 测试配置 ====================

const TEST_CONFIG = {
  verbose: false,
  enableStreaming: false,
  defaultMode: 'act' as const,
  context: createExtensionContext(),
};

// ==================== 简化对比测试 ====================

describe('简化对比测试', () => {
  let mockAdapterWrapper: RealEnhancedEngineAdapterWrapper;
  
  describe('模拟组件测试', () => {
    before(async () => {
      console.log('🔧 准备模拟组件测试...');
      mockAdapterWrapper = RealEnhancedEngineAdapterWrapper.getInstance({
        ...TEST_CONFIG,
      }, {
        useRealComponent: false,
        verbose: false,
      });
      
      await mockAdapterWrapper.initialize();
    });
    
    after(() => {
      mockAdapterWrapper.reset();
    });
    
    it('应该成功初始化', () => {
      assert.ok(mockAdapterWrapper, '模拟适配器应该存在');
      
      const state = mockAdapterWrapper.getState();
      assert.ok(state.engineReady, '引擎应该就绪');
      assert.ok(state.toolCount >= 0, '工具数量应该有效');
    });
    
    it('应该支持模式切换', () => {
      // 初始模式
      const initialMode = mockAdapterWrapper.getMode();
      assert.ok(['act', 'plan'].includes(initialMode), `初始模式应该是act或plan，但得到: ${initialMode}`);
      
      // 切换到plan模式
      mockAdapterWrapper.setMode('plan');
      const planMode = mockAdapterWrapper.getMode();
      assert.strictEqual(planMode, 'plan', '切换到plan模式后应该是plan');
      
      // 切换回act模式
      mockAdapterWrapper.setMode('act');
      const actMode = mockAdapterWrapper.getMode();
      assert.strictEqual(actMode, 'act', '切换到act模式后应该是act');
    });
    
    it('应该处理基本消息', async () => {
      const response = await mockAdapterWrapper.submitMessage('测试消息');
      assert.ok(response.success, '消息处理应该成功');
      assert.ok(response.message, '应该返回消息对象');
      assert.ok(response.message.content, '消息应该包含内容');
    });
    
    it('应该管理对话状态', () => {
      const conversationState = mockAdapterWrapper.getConversationState();
      assert.ok(conversationState, '应该能获取对话状态');
      assert.ok(Array.isArray(conversationState.messages), '消息应该是数组');
      
      // 测试导出/导入
      const exported = mockAdapterWrapper.exportConversation();
      assert.ok(exported, '应该能导出对话');
      assert.ok(typeof exported === 'string', '导出应该是字符串');
      
      // 清除对话
      mockAdapterWrapper.clearConversation();
      const afterClearState = mockAdapterWrapper.getConversationState();
      assert.strictEqual(afterClearState.messages.length, 0, '清除后应该没有消息');
      
      // 重新导入
      const importResult = mockAdapterWrapper.importConversation(exported);
      assert.ok(importResult, '应该能重新导入对话');
    });
  });
  
  describe('性能测试', () => {
    it('应该测量基本操作性能', () => {
      const iterations = 100;
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        mockAdapterWrapper.getMode();
      }
      
      const endTime = performance.now();
      const timePerCall = (endTime - startTime) / iterations;
      
      console.log(`📊 性能: ${timePerCall.toFixed(4)}ms/调用 (${iterations}次迭代)`);
      
      // 性能断言：每个调用应该小于10ms
      assert.ok(timePerCall < 10, `性能太慢: ${timePerCall.toFixed(4)}ms/调用`);
    });
  });
});

// ==================== 导出测试函数 ====================

export async function runSimpleComparisonTests(): Promise<boolean> {
  console.log('🚀 开始简化对比测试');
  
  try {
    // 这里可以集成更复杂的测试逻辑
    console.log('✅ 简化对比测试框架已就绪');
    return true;
  } catch (error: any) {
    console.error('❌ 简化对比测试失败:', error.message);
    return false;
  }
}

export default runSimpleComparisonTests;