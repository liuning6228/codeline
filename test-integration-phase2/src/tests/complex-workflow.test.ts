/**
 * 复杂工作流测试
 * 
 * 模拟真实开发场景，测试EnhancedEngineAdapter的端到端能力：
 * 1. 代码分析工作流
 * 2. 文件修改工作流
 * 3. 命令执行工作流
 * 4. 错误处理和恢复工作流
 * 5. 多步骤任务执行
 */

import * as assert from 'assert';
import { RealEnhancedEngineAdapterWrapper } from '../adapters/RealEnhancedEngineAdapterWrapper';
import { MockMCPHandler } from '../mocks/MCPHandler';
import { createExtensionContext } from '../mocks/vscodeExtended';

// ==================== 测试配置 ====================

const WORKFLOW_CONFIG = {
  verbose: true,
  enableStreaming: false,
  defaultMode: 'act' as const,
  context: createExtensionContext(),
};

// ==================== 复杂工作流测试 ====================

describe('复杂工作流测试', () => {
  
  // ========== 场景1: 代码重构工作流 ==========
  
  describe('场景1: 代码重构工作流', () => {
    let adapterWrapper: RealEnhancedEngineAdapterWrapper;
    
    beforeEach(async () => {
      console.log('\n📝 场景1: 准备代码重构工作流测试...');
      adapterWrapper = RealEnhancedEngineAdapterWrapper.getInstance({
        ...WORKFLOW_CONFIG,
      }, {
        useRealComponent: false,
        verbose: WORKFLOW_CONFIG.verbose,
      });
      
      await adapterWrapper.initialize();
    });
    
    afterEach(() => {
      adapterWrapper.reset();
    });
    
    it('应该完成完整的代码重构工作流', async function() {
      
      
      console.log('\n🔍 步骤1: 分析代码问题');
      
      // 步骤1: 分析代码问题（使用plan模式）
      adapterWrapper.setMode('plan');
      const analysisResponse = await adapterWrapper.submitMessage(
        '请分析以下代码的问题并提出重构计划：\n' +
        'function processData(data) {\n' +
        '  let result = "";\n' +
        '  for (let i = 0; i < data.length; i++) {\n' +
        '    if (data[i].status === "active") {\n' +
        '      result += data[i].name + ",";\n' +
        '    }\n' +
        '  }\n' +
        '  return result;\n' +
        '}'
      );
      
      assert.ok(analysisResponse.success, '代码分析应该成功');
      assert.ok(analysisResponse.message.content.includes('计划') || 
                analysisResponse.message.content.includes('建议') ||
                analysisResponse.message.content.includes('重构'), 
                '分析响应应该包含计划或建议');
      
      console.log('✅ 代码分析完成');
      console.log('分析结果预览:', analysisResponse.message.content.substring(0, 200) + '...');
      
      // 步骤2: 切换到act模式执行重构
      console.log('\n🔧 步骤2: 执行重构任务');
      adapterWrapper.setMode('act');
      
      // 模拟读取现有代码
      const readCodeResponse = await adapterWrapper.submitMessage(
        '请读取当前代码文件以了解上下文'
      );
      
      assert.ok(readCodeResponse.success, '读取代码应该成功');
      
      // 检查是否有工具调用
      if (readCodeResponse.toolCalls && readCodeResponse.toolCalls.length > 0) {
        console.log(`检测到工具调用: ${readCodeResponse.toolCalls[0].tool}`);
        console.log('工具结果:', JSON.stringify(readCodeResponse.toolCalls[0].result, null, 2));
      }
      
      // 步骤3: 生成重构代码
      console.log('\n💡 步骤3: 生成重构后的代码');
      const refactorResponse = await adapterWrapper.submitMessage(
        '基于分析结果，生成重构后的代码\n' +
        '要求：\n' +
        '1. 使用更函数式的风格\n' +
        '2. 添加适当的错误处理\n' +
        '3. 提高代码可读性'
      );
      
      assert.ok(refactorResponse.success, '代码重构应该成功');
      assert.ok(refactorResponse.message.content.includes('function') || 
                refactorResponse.message.content.includes('const') ||
                refactorResponse.message.content.includes('代码'),
                '重构响应应该包含代码');
      
      console.log('✅ 代码重构完成');
      console.log('重构代码预览:', refactorResponse.message.content.substring(0, 300) + '...');
      
      // 步骤4: 保存重构后的代码
      console.log('\n💾 步骤4: 保存重构代码');
      const saveResponse = await adapterWrapper.submitMessage(
        '请将重构后的代码保存到 refactored-code.js 文件'
      );
      
      assert.ok(saveResponse.success, '保存代码应该成功');
      
      if (saveResponse.toolCalls && saveResponse.toolCalls.length > 0) {
        console.log(`保存工具调用: ${saveResponse.toolCalls[0].tool}`);
      }
      
      console.log('\n🎉 代码重构工作流完成！');
    });
  });
  
  // ========== 场景2: 项目设置工作流 ==========
  
  describe('场景2: 项目设置工作流', () => {
    let adapterWrapper: RealEnhancedEngineAdapterWrapper;
    let mcpHandler: MockMCPHandler;
    
    beforeEach(async () => {
      console.log('\n📝 场景2: 准备项目设置工作流测试...');
      
      const context = createExtensionContext();
      
      // 初始化MCPHandler
      mcpHandler = new MockMCPHandler(context, {
        verboseLogging: WORKFLOW_CONFIG.verbose,
        enableMCPTools: true,
      });
      
      await mcpHandler.initialize(process.cwd());
      
      // 初始化适配器
      adapterWrapper = RealEnhancedEngineAdapterWrapper.getInstance({
        ...WORKFLOW_CONFIG,
        context,
      }, {
        useRealComponent: false,
        verbose: WORKFLOW_CONFIG.verbose,
      });
      
      await adapterWrapper.initialize();
    });
    
    afterEach(async () => {
      await mcpHandler.dispose();
      adapterWrapper.reset();
    });
    
    it('应该完成完整的项目设置工作流', async function() {
      
      
      console.log('\n📁 步骤1: 检查项目状态');
      
      // 步骤1: 使用MCP检查项目状态
      const projectCheckResponse = await mcpHandler.handleMessage({
        type: 'mcp_health_check',
        data: {},
        messageId: 'project-check-1',
      });
      
      assert.ok(projectCheckResponse.success, '项目检查应该成功');
      console.log('✅ 项目状态检查完成');
      
      // 步骤2: 创建项目结构
      console.log('\n📂 步骤2: 创建项目结构');
      
      const createStructureResponse = await adapterWrapper.submitMessage(
        '请创建以下项目结构：\n' +
        '1. src/ 目录用于源代码\n' +
        '2. tests/ 目录用于测试文件\n' +
        '3. docs/ 目录用于文档\n' +
        '4. package.json 文件\n' +
        '5. README.md 文件'
      );
      
      assert.ok(createStructureResponse.success, '创建项目结构应该成功');
      
      // 检查工具调用
      let fileCreationCount = 0;
      if (createStructureResponse.toolCalls) {
        fileCreationCount = createStructureResponse.toolCalls.filter(
          call => call.tool === 'write_file'
        ).length;
      }
      
      console.log(`✅ 项目结构创建完成，检测到 ${fileCreationCount} 个文件创建操作`);
      
      // 步骤3: 配置开发工具
      console.log('\n⚙️ 步骤3: 配置开发工具');
      
      const configResponse = await adapterWrapper.submitMessage(
        '请配置以下开发工具：\n' +
        '1. TypeScript配置 (tsconfig.json)\n' +
        '2. ESLint配置\n' +
        '3. Jest测试配置\n' +
        '4. Git忽略文件'
      );
      
      assert.ok(configResponse.success, '工具配置应该成功');
      console.log('✅ 开发工具配置完成');
      
      // 步骤4: 验证项目设置
      console.log('\n🔍 步骤4: 验证项目设置');
      
      const verificationResponse = await adapterWrapper.submitMessage(
        '请验证项目设置是否完整，并执行一些基本检查'
      );
      
      assert.ok(verificationResponse.success, '项目验证应该成功');
      
      // 使用MCP工具检查项目
      const mcpToolsResponse = await mcpHandler.handleMessage({
        type: 'mcp_get_tools',
        data: {},
        messageId: 'get-tools-1',
      });
      
      assert.ok(mcpToolsResponse.success, '获取MCP工具应该成功');
      console.log(`✅ 项目验证完成，MCP工具数量: ${mcpToolsResponse.data.count}`);
      
      // 步骤5: 生成项目文档
      console.log('\n📄 步骤5: 生成项目文档');
      
      const docsResponse = await adapterWrapper.submitMessage(
        '请生成基本的项目文档，包括：\n' +
        '1. 项目概述\n' +
        '2. 安装说明\n' +
        '3. 使用示例\n' +
        '4. 贡献指南'
      );
      
      assert.ok(docsResponse.success, '文档生成应该成功');
      console.log('✅ 项目文档生成完成');
      
      console.log('\n🎉 项目设置工作流完成！');
    });
  });
  
  // ========== 场景3: 错误处理和恢复工作流 ==========
  
  describe('场景3: 错误处理和恢复工作流', () => {
    let adapterWrapper: RealEnhancedEngineAdapterWrapper;
    
    beforeEach(async () => {
      console.log('\n📝 场景3: 准备错误处理工作流测试...');
      adapterWrapper = RealEnhancedEngineAdapterWrapper.getInstance({
        ...WORKFLOW_CONFIG,
        onError: (error) => {
          console.log('错误回调:', error.message);
        },
      }, {
        useRealComponent: false,
        verbose: WORKFLOW_CONFIG.verbose,
      });
      
      await adapterWrapper.initialize();
    });
    
    afterEach(() => {
      adapterWrapper.reset();
    });
    
    it('应该处理错误并恢复工作流', async function() {
      
      
      console.log('\n⚠️ 步骤1: 模拟错误情况');
      
      // 保存当前状态
      const initialState = adapterWrapper.getState();
      console.log('初始状态:', initialState);
      
      // 步骤1: 发送无效的导入数据（应该失败）
      console.log('\n❌ 模拟无效导入');
      const importResult = adapterWrapper.importConversation('{无效的JSON数据');
      assert.ok(!importResult, '无效JSON导入应该失败');
      console.log('✅ 正确处理无效导入');
      
      // 步骤2: 在错误后继续正常工作
      console.log('\n🔄 步骤2: 错误后恢复');
      
      const recoveryResponse = await adapterWrapper.submitMessage(
        '错误后测试：这是一个正常的消息'
      );
      
      assert.ok(recoveryResponse.success, '错误后应该能正常处理消息');
      console.log('✅ 成功恢复工作流');
      
      // 步骤3: 测试对话重置和恢复
      console.log('\n🔄 步骤3: 测试对话重置');
      
      // 发送一些消息
      await adapterWrapper.submitMessage('第一条测试消息');
      await adapterWrapper.submitMessage('第二条测试消息');
      
      // 导出对话状态
      const exported = adapterWrapper.exportConversation();
      assert.ok(exported, '应该能导出对话');
      
      // 清除对话
      adapterWrapper.clearConversation();
      const stateAfterClear = adapterWrapper.getConversationState();
      const messageCount = stateAfterClear?.messages?.length || 0;
      assert.ok(messageCount === 0, '清除后应该没有消息');
      
      // 重新导入
      const reimportResult = adapterWrapper.importConversation(exported!);
      assert.ok(reimportResult, '应该能重新导入对话');
      
      const stateAfterReimport = adapterWrapper.getConversationState();
      assert.ok(stateAfterReimport.messages && stateAfterReimport.messages.length >= 2, 
                '重新导入后应该有消息');
      
      console.log('✅ 对话重置和恢复成功');
      
      // 步骤4: 测试引擎重置
      console.log('\n🔄 步骤4: 测试引擎重置');
      
      adapterWrapper.reset();
      
      // 重置后应该能重新初始化
      const reinitResult = await adapterWrapper.initialize();
      assert.ok(reinitResult, '重置后应该能重新初始化');
      
      const postResetResponse = await adapterWrapper.submitMessage('重置后的测试消息');
      assert.ok(postResetResponse.success, '重置后应该能处理消息');
      
      console.log('✅ 引擎重置和恢复成功');
      
      console.log('\n🎉 错误处理和恢复工作流完成！');
    });
  });
  
  // ========== 场景4: 多步骤集成工作流 ==========
  
  describe('场景4: 多步骤集成工作流', () => {
    let adapterWrapper: RealEnhancedEngineAdapterWrapper;
    let mcpHandler: MockMCPHandler;
    
    beforeEach(async () => {
      console.log('\n📝 场景4: 准备多步骤集成工作流测试...');
      
      const context = createExtensionContext();
      
      // 初始化MCPHandler
      mcpHandler = new MockMCPHandler(context, {
        verboseLogging: WORKFLOW_CONFIG.verbose,
        enableMCPTools: true,
      });
      
      await mcpHandler.initialize(process.cwd());
      
      // 初始化适配器
      adapterWrapper = RealEnhancedEngineAdapterWrapper.getInstance({
        ...WORKFLOW_CONFIG,
        context,
        onStateUpdate: (state) => {
          if (WORKFLOW_CONFIG.verbose) {
            console.log('状态更新:', {
              engineMode: state.engineMode,
              toolCount: state.toolCount,
              conversationCount: state.conversationCount
            });
          }
        },
      }, {
        useRealComponent: false,
        verbose: WORKFLOW_CONFIG.verbose,
      });
      
      await adapterWrapper.initialize();
    });
    
    afterEach(async () => {
      await mcpHandler.dispose();
      adapterWrapper.reset();
    });
    
    it('应该完成复杂的多步骤集成工作流', async function() {
      
      
      console.log('\n🚀 开始多步骤集成工作流');
      console.log('='.repeat(50));
      
      // 阶段1: 项目初始化
      console.log('\n📋 阶段1: 项目初始化');
      
      // 使用plan模式制定项目计划
      adapterWrapper.setMode('plan');
      const planningResponse = await adapterWrapper.submitMessage(
        '请为一个新的TypeScript库项目制定详细计划，包括：\n' +
        '1. 项目结构\n' +
        '2. 开发工具配置\n' +
        '3. 测试策略\n' +
        '4. 构建和部署流程'
      );
      
      assert.ok(planningResponse.success, '项目计划应该成功');
      console.log('✅ 项目计划完成');
      
      // 阶段2: 代码开发
      console.log('\n💻 阶段2: 代码开发');
      
      adapterWrapper.setMode('act');
      
      // 使用MCP工具辅助开发
      const mcpHealthResponse = await mcpHandler.handleMessage({
        type: 'mcp_health_check',
        data: {},
        messageId: 'dev-health-check',
      });
      
      assert.ok(mcpHealthResponse.success, 'MCP健康检查应该成功');
      console.log('✅ MCP工具就绪');
      
      // 创建源代码
      const codeResponse = await adapterWrapper.submitMessage(
        '请创建一个简单的工具函数：\n' +
        '1. 函数名: formatString\n' +
        '2. 功能: 格式化字符串，支持模板变量\n' +
        '3. 包含完整的TypeScript类型定义\n' +
        '4. 包含单元测试'
      );
      
      assert.ok(codeResponse.success, '代码创建应该成功');
      console.log('✅ 代码创建完成');
      
      // 阶段3: 测试和验证
      console.log('\n🧪 阶段3: 测试和验证');
      
      // 执行测试
      const testResponse = await adapterWrapper.submitMessage(
        '请执行代码测试，包括：\n' +
        '1. 单元测试\n' +
        '2. 类型检查\n' +
        '3. 代码质量检查'
      );
      
      assert.ok(testResponse.success, '测试执行应该成功');
      console.log('✅ 测试执行完成');
      
      // 使用MCP工具获取测试结果
      const mcpToolsResponse = await mcpHandler.handleMessage({
        type: 'mcp_get_tools',
        data: {},
        messageId: 'test-tools',
      });
      
      assert.ok(mcpToolsResponse.success, '获取MCP工具应该成功');
      
      // 如果有代码分析工具，执行它
      const analyzeTool = mcpToolsResponse.data.tools.find((t: any) => 
        t.name.includes('分析') || t.category === 'code'
      );
      
      if (analyzeTool) {
        const analyzeResponse = await mcpHandler.handleMessage({
          type: 'mcp_execute_tool',
          data: {
            toolId: analyzeTool.id,
            parameters: { task: '代码质量分析' },
          },
          messageId: 'code-analysis',
        });
        
        assert.ok(analyzeResponse.success, '代码分析应该成功');
        console.log(`✅ 代码分析完成: ${analyzeResponse.data.output}`);
      }
      
      // 阶段4: 构建和打包
      console.log('\n📦 阶段4: 构建和打包');
      
      const buildResponse = await adapterWrapper.submitMessage(
        '请为TypeScript库配置构建流程，包括：\n' +
        '1. 编译配置\n' +
        '2. 打包配置\n' +
        '3. 版本管理\n' +
        '4. 发布准备'
      );
      
      assert.ok(buildResponse.success, '构建配置应该成功');
      console.log('✅ 构建配置完成');
      
      // 阶段5: 文档生成
      console.log('\n📄 阶段5: 文档生成');
      
      const docsResponse = await adapterWrapper.submitMessage(
        '请生成项目文档，包括：\n' +
        '1. API文档\n' +
        '2. 使用示例\n' +
        '3. 贡献指南\n' +
        '4. 变更日志'
      );
      
      assert.ok(docsResponse.success, '文档生成应该成功');
      console.log('✅ 文档生成完成');
      
      // 阶段6: 工作流总结
      console.log('\n📊 阶段6: 工作流总结');
      
      // 导出完整的工作流对话
      const workflowExport = adapterWrapper.exportConversation();
      assert.ok(workflowExport, '应该能导出工作流对话');
      
      console.log(`工作流对话导出大小: ${workflowExport!.length} 字符`);
      
      // 获取MCP指标
      const metricsResponse = await mcpHandler.handleMessage({
        type: 'mcp_metrics',
        data: {},
        messageId: 'final-metrics',
      });
      
      assert.ok(metricsResponse.success, '获取指标应该成功');
      
      const metrics = metricsResponse.data.metrics;
      console.log(`\n📈 工作流性能指标:`);
      console.log(`  总请求数: ${metrics.totalRequests}`);
      console.log(`  成功请求: ${metrics.successfulRequests}`);
      console.log(`  失败请求: ${metrics.failedRequests}`);
      console.log(`  平均响应时间: ${metrics.averageResponseTime.toFixed(2)}ms`);
      console.log(`  注册工具数: ${metrics.registeredTools}`);
      
      console.log('\n' + '='.repeat(50));
      console.log('🎉 多步骤集成工作流完成！');
      console.log('完成阶段: 项目初始化 → 代码开发 → 测试验证 → 构建打包 → 文档生成');
    });
  });
});

// ==================== 导出工作流测试函数 ====================

/**
 * 运行完整的工作流测试
 */
export async function runComplexWorkflowTests(): Promise<boolean> {
  console.log('🚀 开始复杂工作流测试...');
  
  try {
    // 这里可以集成更复杂的测试逻辑
    // 目前依赖Mocha测试框架运行
    
    console.log('✅ 复杂工作流测试框架已就绪');
    console.log('   请在Mocha中运行: npm test -- --grep "复杂工作流测试"');
    
    return true;
  } catch (error: any) {
    console.error('❌ 复杂工作流测试失败:', error.message);
    return false;
  }
}

export default runComplexWorkflowTests;