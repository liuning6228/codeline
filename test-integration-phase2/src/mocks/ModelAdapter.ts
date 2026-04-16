/**
 * 模拟ModelAdapter - 用于测试EnhancedEngineAdapter
 * 兼容真实ModelAdapter接口，支持generate()方法
 */
export interface ModelResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

export interface ModelConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  [key: string]: any;
}

export class MockModelAdapter {
  private config: ModelConfig;
  
  constructor() {
    this.config = {
      model: 'mock-model',
      temperature: 0.7,
      maxTokens: 4000
    };
  }
  
  /**
   * 支持真实EnhancedEngineAdapter期望的generate()方法
   */
  async generate(prompt: string, overrideConfig?: Partial<ModelConfig>): Promise<ModelResponse> {
    console.log(`MockModelAdapter.generate: 生成响应，提示词长度: ${prompt.length}`);
    
    // 模拟AI思考过程
    let content = '';
    if (prompt.includes('介绍你自己')) {
      content = '我是CodeLine EnhancedEngineAdapter，一个增强的AI助手引擎。我可以帮助您进行代码分析、重构和项目规划。';
    } else if (prompt.includes('计划') || prompt.includes('plan')) {
      content = '这是一个计划模式的响应。我将帮助您规划任务步骤。';
    } else if (prompt.includes('分析') || prompt.includes('analyze')) {
      content = '分析完成：代码结构良好，但有一些改进建议。';
    } else if (prompt.includes('重构') || prompt.includes('refactor')) {
      content = '重构建议：提取函数，添加错误处理，提高代码可读性。';
    } else {
      content = `收到消息: "${prompt.substring(0, 100)}..."。这是模拟响应。`;
    }
    
    return {
      content,
      usage: {
        promptTokens: Math.floor(prompt.length / 4),
        completionTokens: Math.floor(content.length / 4),
        totalTokens: Math.floor((prompt.length + content.length) / 4)
      },
      model: this.config.model
    };
  }
  
  /**
   * 向后兼容的sendMessage方法
   */
  async sendMessage(message: string, options?: any): Promise<ModelResponse> {
    console.log(`MockModelAdapter.sendMessage: 发送消息: ${message.substring(0, 50)}...`);
    return this.generate(message, options);
  }
  
  /**
   * 获取当前模型名称
   */
  get modelName(): string {
    return this.config.model;
  }
}