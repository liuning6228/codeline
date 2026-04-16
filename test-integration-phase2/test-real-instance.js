/**
 * 测试真实组件实例创建和基本功能
 */

const { RealComponentLoader } = require('./dist/loaders/RealComponentLoader.js');
const { createExtensionContext } = require('./dist/mocks/vscodeExtended.js');

async function testRealInstance() {
  console.log('🚀 测试真实EnhancedEngineAdapter实例...');
  
  const loader = new RealComponentLoader({
    verbose: true,
    strategies: ['cache-injection']
  });
  
  // 创建模拟扩展配置 - 兼容真实EnhancedEngineAdapter接口
  const mockExtension = {
    modelAdapter: {
      // 真实组件期望generate()方法
      generate: async (prompt, overrideConfig) => {
        console.log(`[模拟modelAdapter.generate] 生成响应，提示词长度: ${prompt.length}`);
        
        // 模拟AI响应 - 真实组件可能期望JSON格式或特定结构
        let content;
        if (prompt.includes('你好') || prompt.includes('介绍')) {
          content = '我是CodeLine EnhancedEngineAdapter，一个增强的AI助手引擎。我可以帮助您进行代码分析、重构和项目规划。';
        } else if (prompt.includes('计划') || prompt.includes('plan')) {
          content = '{"type": "plan", "content": "这是一个计划模式的响应。我将帮助您规划任务步骤。"}';
        } else {
          content = JSON.stringify({
            type: 'response',
            content: `收到消息。这是模拟响应。`,
            success: true
          });
        }
        
        return {
          content,
          usage: {
            promptTokens: Math.floor(prompt.length / 4),
            completionTokens: Math.floor(content.length / 4),
            totalTokens: Math.floor((prompt.length + content.length) / 4)
          },
          model: 'mock-model',
          success: true
        };
      },
      // 向后兼容
      sendMessage: async (message, options) => {
        console.log(`[模拟modelAdapter.sendMessage] 发送消息: ${message.substring(0, 50)}...`);
        return {
          content: `模拟响应: ${message.substring(0, 100)}...`,
          success: true,
          toolCalls: []
        };
      },
      // 可能需要modelName属性
      get modelName() {
        return 'mock-model';
      }
    },
    projectAnalyzer: {
      analyzeProject: async (options) => {
        console.log(`[模拟projectAnalyzer] 分析项目`);
        return {
          files: [],
          structure: {},
          dependencies: []
        };
      }
    },
    promptEngine: {
      generatePrompt: async (context) => {
        console.log(`[模拟promptEngine] 生成提示词`);
        return '模拟提示词';
      }
    },
    verbose: false
  };
  
  // 创建配置
  const config = {
    extension: mockExtension,
    context: createExtensionContext(),
    verbose: true,
    defaultMode: 'act',
    enableStreaming: false
  };
  
  console.log('\n🔧 尝试创建真实EnhancedEngineAdapter实例...');
  
  try {
    // 创建实例
    const instance = loader.createInstance(config);
    console.log('✅ 成功创建实例');
    
    // 尝试初始化
    console.log('\n🔧 尝试初始化...');
    const initResult = await instance.initialize();
    console.log(`✅ 初始化结果: ${initResult}`);
    
    // 检查引擎
    const engine = instance.getEngine();
    console.log(`✅ 获取引擎: ${engine ? '成功' : '失败'}`);
    
    // 获取当前模式
    const mode = instance.getMode();
    console.log(`✅ 当前模式: ${mode}`);
    
    // 提交测试消息
    console.log('\n🔧 提交测试消息...');
    const response = await instance.submitMessage('你好，请介绍你自己');
    console.log(`✅ 消息响应成功: ${response.success}`);
    if (response.message && response.message.content) {
      console.log(`响应内容: ${response.message.content.substring(0, 200)}...`);
    }
    
    // 测试模式切换
    console.log('\n🔧 测试模式切换...');
    instance.setMode('plan');
    const newMode = instance.getMode();
    console.log(`✅ 模式切换后: ${newMode}`);
    
    // 在plan模式下提交消息
    const planResponse = await instance.submitMessage('请帮我计划一个重构任务');
    console.log(`✅ Plan模式响应成功: ${planResponse.success}`);
    
    // 获取状态
    const state = instance.getState();
    console.log(`✅ 获取状态: 引擎就绪=${state.engineReady}, 工具数量=${state.toolCount}`);
    
    // 获取对话状态
    const conversationState = instance.getConversationState();
    console.log(`✅ 对话消息数量: ${conversationState.messages ? conversationState.messages.length : 0}`);
    
    console.log('\n🎉 真实组件实例测试成功！');
    return true;
    
  } catch (error) {
    console.error('❌ 真实组件实例测试失败:', error);
    console.error('错误堆栈:', error.stack);
    return false;
  }
}

testRealInstance().then(success => {
  console.log(`\n🏁 测试完成: ${success ? '✅ 成功' : '❌ 失败'}`);
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('测试运行失败:', error);
  process.exit(1);
});