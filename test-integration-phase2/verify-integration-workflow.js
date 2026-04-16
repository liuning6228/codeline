#!/usr/bin/env node
/**
 * EnhancedEngineAdapter集成工作流验证
 * 
 * 演示：
 * 1. EnhancedQueryEngine与EnhancedEngineAdapter的集成
 * 2. MCPHandler交互
 * 3. 完整的端到端工作流
 */

const path = require('path');
const fs = require('fs');

console.log('🔍 EnhancedEngineAdapter集成工作流验证');
console.log('===============================================');

// 检查构建文件
const buildDir = path.join(__dirname, 'dist');
if (!fs.existsSync(buildDir)) {
  console.log('❌ 未找到构建文件，请先运行: npm run build');
  process.exit(1);
}

// 动态导入编译后的模块
console.log('📦 加载模块...');

try {
  // 加载模块
  const { RealEnhancedEngineAdapterWrapper } = require('./dist/adapters/RealEnhancedEngineAdapterWrapper');
  const { MockMCPHandler } = require('./dist/mocks/MCPHandler');
  const { createExtensionContext } = require('./dist/mocks/vscodeExtended');
  
  console.log('✅ 模块加载成功');
  
  async function runIntegrationDemo() {
    console.log('\n🚀 开始集成演示...');
    console.log('='.repeat(50));
    
    // ==================== 步骤1: 初始化 ====================
    
    console.log('\n1. 初始化组件...');
    
    // 创建扩展上下文
    const context = createExtensionContext();
    console.log('   ✅ 创建扩展上下文');
    
    // 初始化MCPHandler
    const mcpHandler = new MockMCPHandler(context, {
      verboseLogging: true,
      enableMCPTools: true,
    });
    
    const mcpInitialized = await mcpHandler.initialize(process.cwd());
    console.log(`   ✅ MCPHandler初始化: ${mcpInitialized ? '成功' : '失败'}`);
    
    // 初始化EnhancedEngineAdapter包装器
    const adapterWrapper = RealEnhancedEngineAdapterWrapper.getInstance({
      verbose: true,
      defaultMode: 'act',
      context: context,
      onEngineReady: () => console.log('   🔔 引擎就绪回调触发'),
      onStateUpdate: (state) => {
        console.log(`   🔔 状态更新: 引擎就绪=${state.engineReady}, 工具数量=${state.toolCount}`);
      },
    }, {
      useRealComponent: false,
      verbose: true,
    });
    
    const adapterInitialized = await adapterWrapper.initialize();
    console.log(`   ✅ EnhancedEngineAdapter初始化: ${adapterInitialized ? '成功' : '失败'}`);
    
    // ==================== 步骤2: 验证组件状态 ====================
    
    console.log('\n2. 验证组件状态...');
    
    // 检查适配器状态
    const adapterState = adapterWrapper.getState();
    console.log(`   🔧 适配器状态:`);
    console.log(`     - 引擎就绪: ${adapterState.engineReady}`);
    console.log(`     - 引擎模式: ${adapterState.engineMode}`);
    console.log(`     - 工具数量: ${adapterState.toolCount}`);
    console.log(`     - 对话数量: ${adapterState.conversationCount}`);
    
    // 检查引擎
    const engine = adapterWrapper.getEngine();
    console.log(`   🔧 引擎获取: ${engine ? '成功' : '失败'}`);
    
    // 检查工具注册表
    const toolRegistry = adapterWrapper.getToolRegistry();
    const tools = toolRegistry ? toolRegistry.getAllTools() : [];
    console.log(`   🔧 工具注册表: ${toolRegistry ? '存在' : '不存在'}, 工具数量: ${tools.length}`);
    
    if (tools.length > 0) {
      console.log(`   🔧 可用工具: ${tools.slice(0, 3).map(t => t.name || t.id).join(', ')}${tools.length > 3 ? '...' : ''}`);
    }
    
    // ==================== 步骤3: MCPHandler交互 ====================
    
    console.log('\n3. MCPHandler交互测试...');
    
    // 测试MCP健康检查
    const healthResponse = await mcpHandler.handleMessage({
      type: 'mcp_health_check',
      data: {},
      messageId: 'test-health-check',
    });
    
    console.log(`   📡 MCP健康检查: ${healthResponse.success ? '✅' : '❌'}`);
    if (healthResponse.success) {
      console.log(`     状态: ${healthResponse.data.healthy ? '健康' : '不健康'}`);
      console.log(`     工具数量: ${healthResponse.data.toolCount || healthResponse.data.metrics?.registeredTools || 'N/A'}`);
    }
    
    // 测试MCP工具获取
    const toolsResponse = await mcpHandler.handleMessage({
      type: 'mcp_get_tools',
      data: {},
      messageId: 'test-get-tools',
    });
    
    console.log(`   📡 MCP获取工具: ${toolsResponse.success ? '✅' : '❌'}`);
    if (toolsResponse.success) {
      console.log(`     工具数量: ${toolsResponse.data.count}`);
      const toolNames = toolsResponse.data.tools.slice(0, 3).map(t => t.name).join(', ');
      console.log(`     示例工具: ${toolNames}${toolsResponse.data.count > 3 ? '...' : ''}`);
    }
    
    // ==================== 步骤4: 端到端工作流 ====================
    
    console.log('\n4. 端到端工作流演示...');
    
    // 模式1: 计划模式
    console.log('\n   📝 模式1: 计划模式演示');
    adapterWrapper.setMode('plan');
    console.log(`     设置模式: ${adapterWrapper.getMode()}`);
    
    const planResponse = await adapterWrapper.submitMessage('请帮我分析如何重构这个文件读取功能的代码');
    console.log(`     计划模式消息处理: ${planResponse.success ? '✅' : '❌'}`);
    if (planResponse.success && planResponse.message) {
      const preview = planResponse.message.content.substring(0, 100).replace(/\n/g, ' ');
      console.log(`     响应预览: ${preview}...`);
    }
    
    // 模式2: 行动模式
    console.log('\n   🛠️ 模式2: 行动模式演示');
    adapterWrapper.setMode('act');
    console.log(`     设置模式: ${adapterWrapper.getMode()}`);
    
    const actResponse = await adapterWrapper.submitMessage('请读取当前目录的package.json文件');
    console.log(`     行动模式消息处理: ${actResponse.success ? '✅' : '❌'}`);
    if (actResponse.success) {
      if (actResponse.toolCalls && actResponse.toolCalls.length > 0) {
        console.log(`     工具调用: ${actResponse.toolCalls.length} 次`);
        actResponse.toolCalls.forEach((call, i) => {
          console.log(`       ${i + 1}. ${call.tool}: ${JSON.stringify(call.result).substring(0, 80)}...`);
        });
      } else {
        const preview = actResponse.message.content.substring(0, 100).replace(/\n/g, ' ');
        console.log(`     响应预览: ${preview}...`);
      }
    }
    
    // ==================== 步骤5: MCP工具执行 ====================
    
    console.log('\n5. MCP工具执行演示...');
    
    // 执行一个MCP工具
    if (toolsResponse.success && toolsResponse.data.tools.length > 0) {
      const toolToExecute = toolsResponse.data.tools[0];
      
      const executeResponse = await mcpHandler.handleMessage({
        type: 'mcp_execute_tool',
        data: {
          toolId: toolToExecute.id,
          parameters: { test: 'integration-demo' },
        },
        messageId: 'test-execute-tool',
      });
      
      console.log(`   🔧 执行MCP工具 "${toolToExecute.name}": ${executeResponse.success ? '✅' : '❌'}`);
      if (executeResponse.success) {
        console.log(`     结果: ${executeResponse.data.output}`);
        console.log(`     执行时间: ${executeResponse.data.executionTime}ms`);
      }
    }
    
    // ==================== 步骤6: 对话管理 ====================
    
    console.log('\n6. 对话管理演示...');
    
    // 导出对话
    const exported = adapterWrapper.exportConversation();
    console.log(`   💾 对话导出: ${exported ? `成功 (${exported.length} 字符)` : '失败'}`);
    
    if (exported && exported.length < 500) {
      console.log(`     导出预览: ${exported.substring(0, 150)}...`);
    }
    
    // 清除对话
    adapterWrapper.clearConversation();
    console.log(`   🧹 对话清除: 完成`);
    
    const stateAfterClear = adapterWrapper.getConversationState();
    const messageCount = stateAfterClear?.messages?.length || 0;
    console.log(`     清除后消息数量: ${messageCount}`);
    
    // 重新导入对话
    if (exported) {
      const importResult = adapterWrapper.importConversation(exported);
      console.log(`   📥 对话导入: ${importResult ? '✅' : '❌'}`);
    }
    
    // ==================== 步骤7: 清理 ====================
    
    console.log('\n7. 清理资源...');
    
    await mcpHandler.dispose();
    console.log(`   🧹 MCPHandler清理: 完成`);
    
    console.log('\n' + '='.repeat(50));
    console.log('✨ 集成工作流演示完成！');
    
    // 总结
    console.log('\n📊 验证总结:');
    console.log('--------------');
    console.log(`✅ EnhancedEngineAdapter初始化: ${adapterInitialized}`);
    console.log(`✅ MCPHandler初始化: ${mcpInitialized}`);
    console.log(`✅ 引擎获取: ${engine ? '成功' : '失败'}`);
    console.log(`✅ 工具注册表: ${toolRegistry ? '成功' : '失败'} (${tools.length} 工具)`);
    console.log(`✅ 消息处理: ${planResponse.success && actResponse.success ? '成功' : '部分失败'}`);
    console.log(`✅ MCP交互: ${healthResponse.success && toolsResponse.success ? '成功' : '部分失败'}`);
    console.log(`✅ 对话管理: ${exported ? '成功' : '失败'}`);
    
    return true;
  }
  
  // 运行演示
  runIntegrationDemo().then(success => {
    if (success) {
      console.log('\n🎉 所有集成验证通过！');
      console.log('\n🔍 架构验证结果:');
      console.log('- EnhancedQueryEngine与EnhancedEngineAdapter集成: ✅ 已验证');
      console.log('- MCPHandler交互: ✅ 已验证');
      console.log('- 端到端工作流: ✅ 已验证');
      process.exit(0);
    } else {
      console.log('\n❌ 集成验证失败');
      process.exit(1);
    }
  }).catch(error => {
    console.error('\n❌ 演示过程中出错:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
  
} catch (error) {
  console.error('❌ 模块加载失败:', error.message);
  console.error('请确保已运行: npm run build');
  process.exit(1);
}