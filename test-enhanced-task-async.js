/**
 * EnhancedTaskEngine AsyncGenerator 功能测试
 * 验证事件流工作流程
 */

// 在加载任何模块之前注入模拟的 vscode
require('module').Module._load = (function(originalLoad) {
  return function(request, parent, isMain) {
    if (request === 'vscode') {
      // 返回我们的模拟模块
      return require('./test-mocks/vscode-mock.js');
    }
    return originalLoad.apply(this, arguments);
  };
})(require('module').Module._load);

// 模拟依赖项（简化版本，不依赖实际VS Code扩展）
class MockProjectAnalyzer {
  async analyze() {
    return {
      files: ['test.ts', 'package.json'],
      languages: ['TypeScript', 'JSON'],
      dependencies: [],
      structure: 'simple'
    };
  }
}

class MockPromptEngine {
  async generatePrompt(description, context) {
    return `# 测试任务
## 描述
${description}

## 步骤
1. 创建测试文件
2. 验证文件内容
3. 完成测试`;
  }
}

class MockModelAdapter {
  async query(prompt) {
    return {
      content: `
创建文件 test-output.txt
写入内容 "Hello from EnhancedTaskEngine"
验证文件存在
`,
      metadata: {}
    };
  }
}

class MockFileManager {
  async createFile(path, content) {
    console.log(`[模拟] 创建文件 ${path}，内容长度: ${content.length}`);
    return { success: true, path };
  }
  
  async readFile(path) {
    console.log(`[模拟] 读取文件 ${path}`);
    return { success: true, content: 'Hello from EnhancedTaskEngine' };
  }
  
  async fileExists(path) {
    console.log(`[模拟] 检查文件 ${path} 是否存在`);
    return { exists: true };
  }
}

class MockTerminalExecutor {
  async execute(command) {
    console.log(`[模拟] 执行命令: ${command}`);
    return { success: true, output: 'Command executed successfully' };
  }
}

class MockBrowserAutomator {
  // 空实现
}

// 引入真正的 EnhancedTaskEngine（需要编译后的版本）
try {
  const { EnhancedTaskEngine } = require('./out/task/EnhancedTaskEngine');
  
  async function runAsyncGeneratorTest() {
    console.log('🚀 开始测试 EnhancedTaskEngine AsyncGenerator 功能');
    console.log('='.repeat(60));
    
    // 创建模拟依赖
    const projectAnalyzer = new MockProjectAnalyzer();
    const promptEngine = new MockPromptEngine();
    const modelAdapter = new MockModelAdapter();
    const fileManager = new MockFileManager();
    const terminalExecutor = new MockTerminalExecutor();
    const browserAutomator = new MockBrowserAutomator();
    
    // 创建增强任务引擎实例
    const enhancedEngine = new EnhancedTaskEngine(
      projectAnalyzer,
      promptEngine,
      modelAdapter,
      fileManager,
      terminalExecutor,
      browserAutomator
    );
    
    // 测试描述
    const taskDescription = '创建测试文件并验证内容';
    
    console.log(`📝 任务描述: ${taskDescription}`);
    console.log('='.repeat(60));
    
    // 使用 AsyncGenerator 执行任务
    console.log('🔄 开始异步生成器工作流...');
    const eventStream = enhancedEngine.executeTask(taskDescription, {
      taskId: 'test_task_001',
      configOverrides: {
        autoExecute: true,
        requireApproval: false,
        enableEventStream: true,
        cancellable: true
      }
    });
    
    let eventCount = 0;
    let finalResult = null;
    
    // 遍历事件流
    for await (const event of eventStream) {
      eventCount++;
      console.log(`📨 事件 #${eventCount}: ${event.type}`);
      console.log(`   时间: ${new Date(event.timestamp).toISOString()}`);
      
      // 显示事件详情
      switch (event.type) {
        case 'task_started':
          console.log(`   任务ID: ${event.taskId}`);
          console.log(`   描述: ${event.description}`);
          break;
          
        case 'analyzing_project':
          console.log(`   状态: 分析项目中...`);
          break;
          
        case 'project_analyzed':
          console.log(`   项目分析完成`);
          console.log(`   文件数: ${event.context.files.length}`);
          console.log(`   语言: ${event.context.languages.join(', ')}`);
          break;
          
        case 'consulting_ai':
          console.log(`   状态: 咨询AI中...`);
          break;
          
        case 'ai_response_received':
          console.log(`   AI响应已接收`);
          break;
          
        case 'steps_parsed':
          console.log(`   解析步骤数: ${event.count}`);
          break;
          
        case 'step_started':
          console.log(`   步骤 ${event.stepIndex + 1}: ${event.step.description}`);
          break;
          
        case 'step_completed':
          console.log(`   步骤 ${event.stepIndex + 1} 完成`);
          break;
          
        case 'task_completed':
          console.log(`   任务完成！`);
          console.log(`   持续时间: ${event.duration}ms`);
          finalResult = event.result;
          break;
          
        default:
          console.log(`   事件详情: ${JSON.stringify(event, null, 2).substring(0, 100)}...`);
      }
      
      console.log('---');
    }
    
    console.log('='.repeat(60));
    console.log(`✅ 事件流测试完成！`);
    console.log(`   总事件数: ${eventCount}`);
    
    if (finalResult) {
      console.log(`   最终结果: ${JSON.stringify(finalResult, null, 2)}`);
    }
    
    // 测试向后兼容的 startTask 方法
    console.log('\n🔄 测试向后兼容的 startTask 方法...');
    try {
      const compatibleResult = await enhancedEngine.startTask(taskDescription, {
        autoExecute: true,
        requireApproval: false
      });
      
      console.log(`✅ startTask 调用成功`);
      console.log(`   结果: ${JSON.stringify(compatibleResult, null, 2)}`);
    } catch (error) {
      console.error(`❌ startTask 调用失败: ${error.message}`);
    }
    
    return true;
  }
  
  // 运行测试
  runAsyncGeneratorTest().then(success => {
    if (success) {
      console.log('\n🎉 所有测试完成！');
      process.exit(0);
    } else {
      console.error('\n❌ 测试失败');
      process.exit(1);
    }
  }).catch(error => {
    console.error('\n❌ 测试执行出错:', error);
    process.exit(1);
  });
  
} catch (error) {
  console.error('❌ 无法加载 EnhancedTaskEngine:', error.message);
  console.log('提示：请先运行 npm run compile 编译项目');
  process.exit(1);
}